import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  latestCompletedRetirementCheckpoint,
  parseRetirementJournal,
} from "../runtime/continuation";
import {
  collectPreserveManifest,
  collectRetirementPreserveInventory,
  validateOperationsTransitionMarkdown,
  validateProviderEvidenceJson,
} from "../runtime/retirement-preserve";
import {
  buildCleanDistributionPlan,
  CONSUMER_CI_RUN_COMMANDS,
  CONSUMER_ESCALATION_WORKFLOW_RUN_COMMANDS,
  CONSUMER_VSCODE_TASK_COMMANDS,
  cleanDistributionSourcePath,
  loadTemplates,
  planHelixProjectSetup,
  renderBrownfieldSetupArtifacts,
  renderSetupArtifacts,
  transformCleanDistributionArtifact,
} from "../setup";

export {
  collectPreserveManifest,
  collectRetirementPreserveInventory,
  latestCompletedRetirementCheckpoint,
  parseRetirementJournal,
  validateOperationsTransitionMarkdown,
  validateProviderEvidenceJson,
};

export interface GeneratedResurrectionSourceFile {
  path: string;
  content: string;
}

/** setup/distribution/runtime から detector の入力 projection を組み立てる audit adapter。 */
export function loadGeneratedResurrectionSourceFiles(
  repoRoot: string,
): GeneratedResurrectionSourceFile[] {
  const templates = loadTemplates(repoRoot);
  const plan = planHelixProjectSetup("0-A", { dryRun: true });
  const project = (kind: string, path: string): string => `@projection/${kind}/${path}`;
  const fresh = renderSetupArtifacts(plan, templates).map((file) => ({
    ...file,
    path: project("fresh", file.path),
  }));
  const brownfield = renderBrownfieldSetupArtifacts(plan, templates, {
    "AGENTS.md": "# Consumer rules\n\nこの行はconsumer所有。\n",
    "CLAUDE.md": "# Consumer context\n\nこの行はconsumer所有。\n",
    "package.json": '{"name":"brownfield-consumer","scripts":{"keep":"true"}}\n',
    ".vscode/tasks.json":
      '{"version":"2.0.0","tasks":[{"label":"keep-existing","type":"shell","command":"true"}]}\n',
  }).map((file) => ({ ...file, path: project("brownfield", file.path) }));
  const commandContracts: GeneratedResurrectionSourceFile[] = [
    {
      path: project("command", ".github/workflows/harness-check.yml"),
      content: JSON.stringify(CONSUMER_CI_RUN_COMMANDS),
    },
    {
      path: project("command", ".github/workflows/escalation-stale.yml"),
      content: JSON.stringify(CONSUMER_ESCALATION_WORKFLOW_RUN_COMMANDS),
    },
    {
      path: project("command", ".vscode/tasks.json"),
      content: JSON.stringify(CONSUMER_VSCODE_TASK_COMMANDS),
    },
  ];
  const tracked = execFileSync("git", ["ls-files"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter((path) => path.length > 0 && existsSync(join(repoRoot, path)));
  const distributionPlan = buildCleanDistributionPlan({ paths: tracked });
  if (
    !distributionPlan.ok ||
    distributionPlan.missingRequired.length > 0 ||
    distributionPlan.denylistViolations.length > 0
  ) {
    throw new Error("clean distribution plan is incomplete for resurrection scan");
  }
  const distributionPaths = distributionPlan.artifactPaths.filter(
    (path) =>
      path !== "src/lint/handover-resurrection.ts" &&
      path !== "tests/handover-resurrection.test.ts",
  );
  const distribution = distributionPaths.map((artifactPath): GeneratedResurrectionSourceFile => {
    const sourcePath = cleanDistributionSourcePath(artifactPath, tracked);
    const absolute = join(repoRoot, sourcePath);
    if (!existsSync(absolute))
      throw new Error(`clean distribution source missing from resurrection scan: ${sourcePath}`);
    return {
      path: project("distribution", artifactPath),
      content: transformCleanDistributionArtifact(artifactPath, readFileSync(absolute, "utf8")),
    };
  });
  if (distribution.length !== distributionPaths.length)
    throw new Error("clean distribution resurrection projection is incomplete");
  return [...fresh, ...brownfield, ...commandContracts, ...distribution];
}
