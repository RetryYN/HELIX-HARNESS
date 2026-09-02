import { spawnSync } from "node:child_process";
import {
  type AdapterPlan,
  type AdapterProvider,
  adapterExecutionEnv,
  providerAvailable as adapterProviderAvailable,
  admitWrapperLaunch,
  buildWrapperAdapterPlan,
  type WorkerContextExecutionInput,
} from "../runtime/adapter";
import type { ExecutionMode } from "../runtime/detect";
import { detectMode } from "../runtime/detect";
import { sha256Digest } from "../runtime/digest";
import { adaptReasoningEffort, standardEffortForModel } from "../team/model-effort";
import { MODEL_IDS } from "../team/model-policy";
import { deriveEffortObservation } from "./loop-effort-budget";
import type { TickDeps } from "./loop-runner";
import type { LoopState, Provider, Verdict } from "./loop-state";
import type { LoopStore } from "./loop-store";

export interface AdapterExecutionResult {
  status: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
}

export interface ExecAdapterInput {
  provider: Provider;
  purpose: "worker" | "verifier";
  role: string;
  state: LoopState;
  plan: AdapterPlan;
}

export type ExecAdapter = (input: ExecAdapterInput) => Promise<AdapterExecutionResult>;

export interface NodeTickDepsInput {
  mode?: ExecutionMode;
  store: LoopStore;
  execAdapter?: ExecAdapter;
  workerRole?: string;
  verifierRole?: string;
  now?: () => string;
  workerContext?: WorkerContextExecutionInput;
}

function adapterRole(
  provider: Provider,
  purpose: ExecAdapterInput["purpose"],
  input: NodeTickDepsInput,
): string {
  if (purpose === "worker")
    return input.workerRole ?? (provider === "codex" ? "se" : "implementer");
  return input.verifierRole ?? "tl";
}

function workerTask(s: LoopState): string {
  return [
    `Run the next worker iteration for ${s.planId}.`,
    "Read the PLAN and current repository state, implement only the scoped next action, then run targeted verification.",
    "Do not approve your own work; the loop verifier will review with the opposite provider.",
  ].join("\n");
}

function verifierTask(s: LoopState): string {
  return [
    `Review the latest worker iteration for ${s.planId}.`,
    "Check the PLAN scope, changed files, tests, and failure modes.",
    "End with exactly one machine-readable line: VERDICT: pass|fail|error|pending.",
  ].join("\n");
}

function loopAdapterModel(provider: Provider, purpose: ExecAdapterInput["purpose"]): string {
  if (provider === "codex") {
    return purpose === "worker" ? MODEL_IDS.codex.worker : MODEL_IDS.codex.frontier;
  }
  return purpose === "worker" ? MODEL_IDS.claude.sonnet : MODEL_IDS.claude.opus;
}

function buildLoopAdapterPlan(input: {
  provider: Provider;
  purpose: ExecAdapterInput["purpose"];
  role: string;
  task: string;
  state: LoopState;
  mode: ExecutionMode;
  workerContext?: WorkerContextExecutionInput;
}): AdapterPlan {
  const model = loopAdapterModel(input.provider, input.purpose);
  const effort = adaptReasoningEffort(
    standardEffortForModel(model),
    deriveEffortObservation({ verdictFail: input.state.lastVerdict === "fail" }),
  );
  return buildWrapperAdapterPlan(
    {
      provider: input.provider as AdapterProvider,
      role: input.role,
      task: input.task,
      planId: input.state.planId,
      model,
      effort,
      execute: true,
      workerContext: input.workerContext,
    },
    input.mode,
    "helix_cli_adapter",
  );
}

async function defaultExecAdapter(input: ExecAdapterInput): Promise<AdapterExecutionResult> {
  const admitted = admitWrapperLaunch(input.plan, { requireWorkerContext: true });
  if ("failure_code" in admitted) {
    throw new Error(`loop adapter admission failed: ${admitted.failure_code}`);
  }
  const child = spawnSync(admitted.invocation.command, admitted.invocation.args, {
    encoding: "utf8",
    input: admitted.stdin,
    env: adapterExecutionEnv(input.provider, admitted.env),
    shell: admitted.invocation.shell ?? false,
    windowsVerbatimArguments: admitted.invocation.windowsVerbatimArguments ?? false,
  });
  if (child.error) {
    throw new Error(
      `loop adapter launch failed: provider=${input.provider} purpose=${input.purpose} detail=${String(
        child.error,
      )}`,
    );
  }
  return {
    status: child.status ?? null,
    signal: child.signal ?? null,
    stdout: child.stdout ?? "",
    stderr: child.stderr ?? "",
  };
}

function parseJsonVerdict(text: string): Verdict | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(trimmed) as { verdict?: unknown };
    return isVerdict(parsed.verdict) ? parsed.verdict : null;
  } catch (error) {
    void error;
    return null;
  }
}

function isVerdict(value: unknown): value is Verdict {
  return value === "pass" || value === "fail" || value === "error" || value === "pending";
}

export function interpretVerifierVerdict(result: AdapterExecutionResult): Verdict {
  if (result.status !== 0) return "error";
  const combined = `${result.stdout}\n${result.stderr}`;
  const jsonVerdict = parseJsonVerdict(combined);
  if (jsonVerdict) return jsonVerdict;
  const match = combined.match(/\bVERDICT\s*[:=]\s*(pass|fail|error|pending)\b/i);
  if (!match) return "pending";
  const verdict = match[1]?.toLowerCase();
  return isVerdict(verdict) ? verdict : "pending";
}

function assertAdapterSucceeded(input: ExecAdapterInput, result: AdapterExecutionResult): void {
  if (result.status === 0) return;
  throw new Error(
    `loop adapter execution failed: provider=${input.provider} purpose=${input.purpose} status=${
      result.status ?? "null"
    } signal=${result.signal ?? "null"} stderr_digest=${sha256Digest(result.stderr)} stderr_length=${Buffer.byteLength(result.stderr, "utf8")}`,
  );
}

export function nodeTickDeps(input: NodeTickDepsInput): TickDeps {
  const mode = input.mode ?? detectMode().mode;
  const execAdapter = input.execAdapter ?? defaultExecAdapter;
  const now = input.now ?? (() => new Date().toISOString());

  return {
    mode,
    now,
    providerAvailable: (provider: Provider) => adapterProviderAvailable(provider, mode),
    runWorker: async (state: LoopState) => {
      const provider = state.workerProvider;
      const role = adapterRole(provider, "worker", input);
      const plan = buildLoopAdapterPlan({
        provider,
        purpose: "worker",
        role,
        task: workerTask(state),
        state,
        mode,
        workerContext: input.workerContext,
      });
      if (!plan.available) {
        throw new Error(
          `loop worker provider unavailable: provider=${provider} mode=${mode} detail=${plan.messages.join("; ")}`,
        );
      }
      const execInput: ExecAdapterInput = { provider, purpose: "worker", role, state, plan };
      await input.store.runSideEffect(state, "worker", async () => {
        const result = await execAdapter(execInput);
        assertAdapterSucceeded(execInput, result);
        return null;
      });
    },
    runVerifier: async (provider: Provider, state: LoopState) => {
      const role = adapterRole(provider, "verifier", input);
      const plan = buildLoopAdapterPlan({
        provider,
        purpose: "verifier",
        role,
        task: verifierTask(state),
        state,
        mode,
        workerContext: input.workerContext,
      });
      if (!plan.available) {
        throw new Error(
          `loop verifier provider unavailable: provider=${provider} mode=${mode} detail=${plan.messages.join("; ")}`,
        );
      }
      const execInput: ExecAdapterInput = { provider, purpose: "verifier", role, state, plan };
      const verdict = await input.store.runSideEffect(state, "verifier", async () => {
        const result = await execAdapter(execInput);
        return interpretVerifierVerdict(result);
      });
      return verdict ?? "pending";
    },
    recordIteration: (record) => input.store.recordIteration(record),
  };
}
