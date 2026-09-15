/**
 * ScreenApplicabilityStore（Issue #175 / PLAN-L7-513、U-SAP-011）。
 *
 * L6設計 docs/design/helix/L6-function-design/screen-applicability-prototype.md §2/§5 の
 * ScreenApplicabilityStoreV1 契約を in-memory reference store として実装する。
 * gate row への write authority は commitStageClosureAndGate の成功経路のみが持ち
 * （gate_write_authority: "screen_stage_closure_store"）、read 系 API は読み取り専用。
 * trustedNow は文字列注入（clock を読まない）。harness.db projection への接続は後続スライス。
 *
 * CAS: stage_head / gate_head は commit 成功時のみ sha256(前head + operation_digest) で前進する。
 * 同一 operation_id の二重 gate、stale/superseded authority、caller receipt swap、
 * append 順逆転、digest 改変はすべて stage/gate 増分 0 で fail-close する。
 */
import { createHash } from "node:crypto";
import type {
  BackpropReceiptV1,
  NoUiReceiptV1,
  PlanScreenRouteReceiptV1,
  PrototypeAgreementV1,
  ScreenFailureCodeV1,
  ScreenGateReceiptV1,
  ScreenResultV1,
} from "./screen-applicability";

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function fail(code: ScreenFailureCodeV1, evidence: string): ScreenResultV1<never> {
  return { ok: false, failures: [{ code, evidence_digest: sha256(evidence) }] };
}

export interface NoUiCapabilityCompletionV1 {
  capability_id: string;
  capability_revision: number;
  capability_digest: string;
  applicability_decision_id: string;
  applicability_decision_revision: number;
  applicability_rule_id: string;
  applicability_rule_revision: number;
  applicability_rule_digest: string;
  scope_digest: string;
  requirement_obligation_digest: string;
  design_obligation_digest: string;
  test_obligation_digest: string;
  skip_receipt_id: string;
  skip_receipt_digest: string;
  authority_receipt_id: string;
  authority_receipt_digest: string;
  expected_authority_head: string;
  issued_at: string;
  expires_at: string;
  reentry_trigger_digest: string;
}

export interface NoUiSkipAuthorityV1 {
  authority_receipt_id: string;
  skip_receipt_id: string;
  skip_receipt_digest: string;
  decision_id: string;
  decision_revision: number;
  current_authority_head: string;
  receipt_digest: string;
}

export interface UiCapabilityCompletionV1 {
  capability_id: string;
  agreement_receipt_id: string;
  agreement_receipt_digest: string;
  agreement_authority_receipt_id: string;
  agreement_authority_receipt_digest: string;
  expected_agreement_authority_head: string;
  backprop_receipt_id: string;
  backprop_receipt_digest: string;
  backprop_authority_receipt_id: string;
  backprop_authority_receipt_digest: string;
  expected_backprop_authority_head: string;
  from_requirement_revision: number;
  to_requirement_revision: number;
  completion_digest: string;
}

export interface CurrentAgreementAuthorityV1 {
  authority_receipt_id: string;
  authority_receipt_digest: string;
  receipt: PrototypeAgreementV1;
  canonical_bytes: string;
  current_authority_head: string;
  status: "current";
}

export interface CurrentBackpropAuthorityV1 {
  authority_receipt_id: string;
  authority_receipt_digest: string;
  receipt: BackpropReceiptV1;
  canonical_bytes: string;
  current_authority_head: string;
  status: "current";
}

export interface ScreenStageClosureV1 {
  denominator_revision: number;
  denominator_capability_ids: string[];
  ui_capability_ids: string[];
  no_ui_completions: NoUiCapabilityCompletionV1[];
  ui_completions: UiCapabilityCompletionV1[];
  agreement_receipt_exact_set_digest: string;
  backprop_receipt_exact_set_digest: string;
  stage_receipt_digest: string;
}

export const STAGE_CLOSURE_APPEND_ORDER = [
  "stage_completion",
  "stage_projection",
  "gate_receipt",
  "terminal_receipt",
] as const;

export interface ScreenStageClosureCommitV1 {
  operation_id: string;
  operation_digest: string;
  plan_route_receipt: PlanScreenRouteReceiptV1;
  closure: ScreenStageClosureV1;
  gate: ScreenGateReceiptV1;
  expected_stage_head: string;
  expected_gate_head: string;
  exact_write_set: { table: string; key: string; action: "insert" | "update" }[];
  append_order: ["stage_completion", "stage_projection", "gate_receipt", "terminal_receipt"];
  write_set_digest: string;
}

export interface ScreenStageReceiptV1 {
  operation_id: string;
  operation_digest: string;
  denominator_revision: number;
  before_stage_head: string;
  after_stage_head: string;
  before_gate_head: string;
  after_gate_head: string;
  closure_digest: string;
  gate_receipt_digest: string;
  status: "committed";
  inserted_completion_count: number;
  write_set_digest: string;
}

export interface AuthorityReadQueryV1 {
  authority_receipt_id: string;
  expected_receipt_id: string;
  expected_receipt_digest: string;
  expected_authority_head: string;
  trusted_now: string;
}

export interface ScreenApplicabilityStoreV1 {
  gate_write_authority: "screen_stage_closure_store";
  readPlanRouteReceipt(
    receiptId: string,
    expectedStageHead: string,
  ): Promise<ScreenResultV1<PlanScreenRouteReceiptV1>>;
  readSkipReceipt(receiptId: string, trustedNow: string): Promise<ScreenResultV1<NoUiReceiptV1>>;
  readSkipAuthority(
    authorityReceiptId: string,
    expectedAuthorityHead: string,
    trustedNow: string,
  ): Promise<ScreenResultV1<NoUiSkipAuthorityV1>>;
  readAgreementAuthority(
    query: AuthorityReadQueryV1,
  ): Promise<ScreenResultV1<CurrentAgreementAuthorityV1>>;
  readBackpropAuthority(
    query: AuthorityReadQueryV1,
  ): Promise<ScreenResultV1<CurrentBackpropAuthorityV1>>;
  validateAgreementBackpropPair(
    agreement: PrototypeAgreementV1,
    backprop: BackpropReceiptV1,
    completion: UiCapabilityCompletionV1,
  ): Promise<ScreenResultV1<UiCapabilityCompletionV1>>;
  commitStageClosureAndGate(
    bundle: ScreenStageClosureCommitV1,
  ): Promise<ScreenResultV1<ScreenStageReceiptV1>>;
}

export interface ScreenStoreSeedV1 {
  stage_head: string;
  gate_head: string;
  plan_route_receipts: PlanScreenRouteReceiptV1[];
  skip_receipts: NoUiReceiptV1[];
  skip_authorities: NoUiSkipAuthorityV1[];
  agreement_authorities: CurrentAgreementAuthorityV1[];
  backprop_authorities: CurrentBackpropAuthorityV1[];
}

function closureDigest(closure: ScreenStageClosureV1): string {
  return sha256(
    JSON.stringify({
      agreement_set: closure.agreement_receipt_exact_set_digest,
      backprop_set: closure.backprop_receipt_exact_set_digest,
      denominator: [...closure.denominator_capability_ids].sort(),
      denominator_revision: closure.denominator_revision,
      no_ui: closure.no_ui_completions.map((c) => c.skip_receipt_digest).sort(),
      ui: closure.ui_completions.map((c) => c.completion_digest).sort(),
      ui_capability_ids: [...closure.ui_capability_ids].sort(),
    }),
  );
}

function stageWriteSetDigest(writeSet: ScreenStageClosureCommitV1["exact_write_set"]): string {
  return sha256(
    JSON.stringify(
      [...writeSet].sort((a, b) => `${a.table}:${a.key}`.localeCompare(`${b.table}:${b.key}`)),
    ),
  );
}

function stageOperationDigest(
  bundle: Omit<ScreenStageClosureCommitV1, "operation_digest">,
): string {
  return sha256(
    JSON.stringify({
      append_order: bundle.append_order,
      closure: closureDigest(bundle.closure),
      expected_gate_head: bundle.expected_gate_head,
      expected_stage_head: bundle.expected_stage_head,
      gate: {
        agreement_digest: bundle.gate.agreement_digest,
        capability_set_digest: bundle.gate.capability_set_digest,
        decision_aggregate_digest: bundle.gate.decision_aggregate_digest,
        gate_receipt_id: bundle.gate.gate_receipt_id,
        l1_revision: bundle.gate.l1_revision,
        route: bundle.gate.route,
        skip_digest: bundle.gate.skip_digest,
        snapshot_id: bundle.gate.snapshot_id,
        snapshot_revision: bundle.gate.snapshot_revision,
        verdict: bundle.gate.verdict,
      },
      operation_id: bundle.operation_id,
      plan_route_receipt: bundle.plan_route_receipt.receipt_digest,
      write_set: bundle.write_set_digest,
    }),
  );
}

/**
 * U-SAP-011 用の commit bundle builder。closure と gate candidate から append 順固定・
 * digest 採番済みの ScreenStageClosureCommitV1 を決定的に構築する（正本検証は store 側）。
 */
export function buildScreenStageClosureCommit(input: {
  plan_route_receipt: PlanScreenRouteReceiptV1;
  closure: Omit<
    ScreenStageClosureV1,
    | "agreement_receipt_exact_set_digest"
    | "backprop_receipt_exact_set_digest"
    | "stage_receipt_digest"
  >;
  gate: ScreenGateReceiptV1;
  expected_stage_head: string;
  expected_gate_head: string;
}): ScreenResultV1<ScreenStageClosureCommitV1> {
  const agreementSet = sha256(
    JSON.stringify(input.closure.ui_completions.map((c) => c.agreement_receipt_digest).sort()),
  );
  const backpropSet = sha256(
    JSON.stringify(input.closure.ui_completions.map((c) => c.backprop_receipt_digest).sort()),
  );
  const closure: ScreenStageClosureV1 = {
    ...input.closure,
    agreement_receipt_exact_set_digest: agreementSet,
    backprop_receipt_exact_set_digest: backpropSet,
    stage_receipt_digest: "",
  };
  closure.stage_receipt_digest = closureDigest(closure);
  const writeSet: ScreenStageClosureCommitV1["exact_write_set"] = [
    ...closure.no_ui_completions.map((c) => ({
      table: "screen_stage_completions",
      key: `no-ui-${c.capability_id}`,
      action: "insert" as const,
    })),
    ...closure.ui_completions.map((c) => ({
      table: "screen_stage_completions",
      key: `ui-${c.capability_id}`,
      action: "insert" as const,
    })),
    {
      table: "screen_stage_projections",
      key: input.plan_route_receipt.snapshot_id,
      action: "update" as const,
    },
    { table: "screen_gate_receipts", key: input.gate.gate_receipt_id, action: "insert" as const },
    { table: "screen_terminal_receipts", key: input.gate.operation_id, action: "insert" as const },
  ];
  const withoutDigest: Omit<ScreenStageClosureCommitV1, "operation_digest"> = {
    operation_id: input.gate.operation_id,
    plan_route_receipt: input.plan_route_receipt,
    closure,
    gate: input.gate,
    expected_stage_head: input.expected_stage_head,
    expected_gate_head: input.expected_gate_head,
    exact_write_set: writeSet,
    append_order: [...STAGE_CLOSURE_APPEND_ORDER],
    write_set_digest: stageWriteSetDigest(writeSet),
  };
  return {
    ok: true,
    value: { ...withoutDigest, operation_digest: stageOperationDigest(withoutDigest) },
  };
}

class InMemoryScreenApplicabilityStore implements ScreenApplicabilityStoreV1 {
  readonly gate_write_authority = "screen_stage_closure_store" as const;
  private stage_head: string;
  private gate_head: string;
  private readonly planRoutes = new Map<string, PlanScreenRouteReceiptV1>();
  private readonly skips = new Map<string, NoUiReceiptV1>();
  private readonly skipAuthorities = new Map<string, NoUiSkipAuthorityV1>();
  private readonly agreementAuthorities = new Map<string, CurrentAgreementAuthorityV1>();
  private readonly backpropAuthorities = new Map<string, CurrentBackpropAuthorityV1>();
  private readonly committedOperations = new Set<string>();
  private readonly gateReceipts: ScreenGateReceiptV1[] = [];
  private readonly trustedNow: string;

  constructor(seed: ScreenStoreSeedV1, trustedNow: string) {
    this.stage_head = seed.stage_head;
    this.gate_head = seed.gate_head;
    for (const r of seed.plan_route_receipts) this.planRoutes.set(r.plan_route_receipt_id, r);
    for (const r of seed.skip_receipts) this.skips.set(r.receipt_id, r);
    for (const r of seed.skip_authorities) this.skipAuthorities.set(r.authority_receipt_id, r);
    for (const r of seed.agreement_authorities)
      this.agreementAuthorities.set(r.authority_receipt_id, r);
    for (const r of seed.backprop_authorities)
      this.backpropAuthorities.set(r.authority_receipt_id, r);
    this.trustedNow = trustedNow;
  }

  stageHead(): string {
    return this.stage_head;
  }

  gateHead(): string {
    return this.gate_head;
  }

  committedGateReceiptCount(): number {
    return this.gateReceipts.length;
  }

  readPlanRouteReceipt(
    receiptId: string,
    expectedStageHead: string,
  ): Promise<ScreenResultV1<PlanScreenRouteReceiptV1>> {
    const receipt = this.planRoutes.get(receiptId);
    if (!receipt)
      return Promise.resolve(
        fail("HIL_SCREEN_GATE_EVIDENCE_MISSING", `plan_route_missing:${receiptId}`),
      );
    if (expectedStageHead !== this.stage_head)
      return Promise.resolve(
        fail("HIL_SCREEN_GATE_EVIDENCE_MISSING", `stage_head_mismatch:${expectedStageHead}`),
      );
    return Promise.resolve({ ok: true, value: receipt });
  }

  readSkipReceipt(receiptId: string, trustedNow: string): Promise<ScreenResultV1<NoUiReceiptV1>> {
    const receipt = this.skips.get(receiptId);
    if (!receipt)
      return Promise.resolve(fail("HIL_SCREEN_SKIP_EVIDENCE_MISSING", `skip_missing:${receiptId}`));
    if (receipt.expires_at <= trustedNow)
      return Promise.resolve(fail("HIL_SCREEN_RECEIPT_STALE", `skip_expired:${receiptId}`));
    return Promise.resolve({ ok: true, value: receipt });
  }

  readSkipAuthority(
    authorityReceiptId: string,
    expectedAuthorityHead: string,
    trustedNow: string,
  ): Promise<ScreenResultV1<NoUiSkipAuthorityV1>> {
    const authority = this.skipAuthorities.get(authorityReceiptId);
    if (!authority)
      return Promise.resolve(
        fail("HIL_SCREEN_SKIP_EVIDENCE_MISSING", `skip_authority_missing:${authorityReceiptId}`),
      );
    if (authority.current_authority_head !== expectedAuthorityHead)
      return Promise.resolve(
        fail("HIL_SCREEN_RECEIPT_STALE", `skip_authority_head:${authorityReceiptId}`),
      );
    const skip = this.skips.get(authority.skip_receipt_id);
    if (
      !skip ||
      skip.receipt_digest !== authority.skip_receipt_digest ||
      skip.expires_at <= trustedNow
    )
      return Promise.resolve(
        fail("HIL_SCREEN_RECEIPT_STALE", `skip_authority_binding:${authorityReceiptId}`),
      );
    return Promise.resolve({ ok: true, value: authority });
  }

  readAgreementAuthority(
    query: AuthorityReadQueryV1,
  ): Promise<ScreenResultV1<CurrentAgreementAuthorityV1>> {
    const {
      authority_receipt_id: authorityReceiptId,
      expected_receipt_id: expectedReceiptId,
      expected_receipt_digest: expectedReceiptDigest,
      expected_authority_head: expectedAuthorityHead,
    } = query;
    const authority = this.agreementAuthorities.get(authorityReceiptId);
    // status は型上 "current" のみだが、後続スライスで stale/superseded 行が同一 Map に載る
    // 将来拡張に備えた防御分岐として残す（runtime 値は型を経由しない可能性がある）。
    if (authority?.status !== "current")
      return Promise.resolve(
        fail(
          "HIL_SCREEN_GATE_EVIDENCE_MISSING",
          `agreement_authority_missing:${authorityReceiptId}`,
        ),
      );
    if (
      authority.current_authority_head !== expectedAuthorityHead ||
      authority.receipt.agreement_id !== expectedReceiptId ||
      authority.receipt.agreement_digest !== expectedReceiptDigest ||
      sha256(authority.canonical_bytes) !==
        sha256(JSON.stringify(canonicalizeRecord(authority.receipt)))
    )
      return Promise.resolve(
        fail("HIL_SCREEN_RECEIPT_STALE", `agreement_authority_stale:${authorityReceiptId}`),
      );
    return Promise.resolve({ ok: true, value: authority });
  }

  readBackpropAuthority(
    query: AuthorityReadQueryV1,
  ): Promise<ScreenResultV1<CurrentBackpropAuthorityV1>> {
    const {
      authority_receipt_id: authorityReceiptId,
      expected_receipt_id: expectedReceiptId,
      expected_receipt_digest: expectedReceiptDigest,
      expected_authority_head: expectedAuthorityHead,
    } = query;
    const authority = this.backpropAuthorities.get(authorityReceiptId);
    // status 防御分岐: agreement 側と同じく将来の stale/superseded 混載に備える。
    if (authority?.status !== "current")
      return Promise.resolve(
        fail(
          "HIL_SCREEN_GATE_EVIDENCE_MISSING",
          `backprop_authority_missing:${authorityReceiptId}`,
        ),
      );
    if (
      authority.current_authority_head !== expectedAuthorityHead ||
      authority.receipt.receipt_id !== expectedReceiptId ||
      authority.receipt.receipt_digest !== expectedReceiptDigest ||
      sha256(authority.canonical_bytes) !==
        sha256(JSON.stringify(canonicalizeRecord(authority.receipt)))
    )
      return Promise.resolve(
        fail("HIL_SCREEN_RECEIPT_STALE", `backprop_authority_stale:${authorityReceiptId}`),
      );
    return Promise.resolve({ ok: true, value: authority });
  }

  validateAgreementBackpropPair(
    agreement: PrototypeAgreementV1,
    backprop: BackpropReceiptV1,
    completion: UiCapabilityCompletionV1,
  ): Promise<ScreenResultV1<UiCapabilityCompletionV1>> {
    if (
      backprop.agreement_id !== agreement.agreement_id ||
      completion.agreement_receipt_id !== agreement.agreement_id ||
      completion.agreement_receipt_digest !== agreement.agreement_digest ||
      completion.backprop_receipt_id !== backprop.receipt_id ||
      completion.backprop_receipt_digest !== backprop.receipt_digest ||
      completion.from_requirement_revision !== backprop.from_requirement_revision ||
      completion.to_requirement_revision !== backprop.to_requirement_revision
    )
      return Promise.resolve(
        fail("HIL_SCREEN_GATE_EVIDENCE_MISSING", `pair_mismatch:${completion.capability_id}`),
      );
    return Promise.resolve({ ok: true, value: completion });
  }

  async commitStageClosureAndGate(
    bundle: ScreenStageClosureCommitV1,
  ): Promise<ScreenResultV1<ScreenStageReceiptV1>> {
    if (this.committedOperations.has(bundle.operation_id))
      return fail("HIL_SCREEN_GATE_EVIDENCE_MISSING", `duplicate_gate:${bundle.operation_id}`);
    if (
      bundle.append_order.length !== STAGE_CLOSURE_APPEND_ORDER.length ||
      bundle.append_order.some((step, index) => step !== STAGE_CLOSURE_APPEND_ORDER[index])
    )
      return fail("HIL_SCREEN_GATE_EVIDENCE_MISSING", `append_order:${bundle.operation_id}`);
    if (bundle.write_set_digest !== stageWriteSetDigest(bundle.exact_write_set))
      return fail("HIL_SCREEN_GATE_EVIDENCE_MISSING", `write_set_digest:${bundle.operation_id}`);
    const { operation_digest: declared, ...withoutDigest } = bundle;
    if (declared !== stageOperationDigest(withoutDigest))
      return fail("HIL_SCREEN_GATE_EVIDENCE_MISSING", `operation_digest:${bundle.operation_id}`);
    if (
      bundle.expected_stage_head !== this.stage_head ||
      bundle.expected_gate_head !== this.gate_head
    )
      return fail("HIL_SCREEN_GATE_EVIDENCE_MISSING", `cas_mismatch:${bundle.operation_id}`);
    const planRoute = this.planRoutes.get(bundle.plan_route_receipt.plan_route_receipt_id);
    if (
      !planRoute ||
      planRoute.receipt_digest !== bundle.plan_route_receipt.receipt_digest ||
      planRoute.operation_id !== bundle.plan_route_receipt.operation_id
    )
      return fail("HIL_SCREEN_GATE_EVIDENCE_MISSING", `plan_route_swap:${bundle.operation_id}`);
    // gate 内容そのものを plan route と突き合わせる。closure 側だけ検証して自己矛盾した
    // gate レシートを「唯一の write authority」経由で書けてしまう経路を遮断する。
    if (
      bundle.gate.verdict !== "passed" ||
      bundle.gate.failure_codes.length !== 0 ||
      bundle.gate.snapshot_id !== planRoute.snapshot_id ||
      bundle.gate.snapshot_revision !== planRoute.snapshot_revision ||
      bundle.gate.route !== planRoute.route ||
      bundle.gate.capability_set_digest !== planRoute.capability_set_digest ||
      bundle.gate.decision_aggregate_digest !== planRoute.decision_aggregate_digest
    )
      return fail(
        "HIL_SCREEN_GATE_EVIDENCE_MISSING",
        `gate_content_mismatch:${bundle.operation_id}`,
      );
    const closure = bundle.closure;
    const denominator = [...closure.denominator_capability_ids].sort();
    const uiSet = new Set(closure.ui_capability_ids);
    const noUiIds = closure.no_ui_completions.map((c) => c.capability_id).sort();
    const uiIds = closure.ui_completions.map((c) => c.capability_id).sort();
    const union = [...noUiIds, ...uiIds].sort();
    const disjoint = noUiIds.every((id) => !uiSet.has(id));
    if (
      JSON.stringify(union) !== JSON.stringify(denominator) ||
      !disjoint ||
      JSON.stringify(uiIds) !== JSON.stringify([...closure.ui_capability_ids].sort()) ||
      new Set(union).size !== union.length
    )
      return fail(
        "HIL_SCREEN_GATE_EVIDENCE_MISSING",
        `denominator_mismatch:${bundle.operation_id}`,
      );
    for (const completion of closure.no_ui_completions) {
      const authorityResult = await this.readSkipAuthority(
        completion.authority_receipt_id,
        completion.expected_authority_head,
        this.trustedNow,
      );
      if (!authorityResult.ok) return authorityResult;
      const authority = authorityResult.value;
      const skip = this.skips.get(completion.skip_receipt_id);
      if (
        !skip ||
        authority.receipt_digest !== completion.authority_receipt_digest ||
        authority.skip_receipt_id !== completion.skip_receipt_id ||
        authority.skip_receipt_digest !== completion.skip_receipt_digest ||
        skip.receipt_digest !== completion.skip_receipt_digest ||
        skip.decision_id !== completion.applicability_decision_id ||
        skip.decision_revision !== completion.applicability_decision_revision ||
        authority.decision_id !== completion.applicability_decision_id ||
        authority.decision_revision !== completion.applicability_decision_revision ||
        skip.capability_id !== completion.capability_id ||
        skip.capability_revision !== completion.capability_revision ||
        skip.scope_digest !== completion.scope_digest ||
        skip.rule_digest !== completion.applicability_rule_digest ||
        skip.expires_at <= this.trustedNow
      )
        return fail(
          "HIL_SCREEN_GATE_EVIDENCE_MISSING",
          `no_ui_identity:${completion.capability_id}`,
        );
    }
    for (const completion of closure.ui_completions) {
      const agreementResult = await this.readAgreementAuthority({
        authority_receipt_id: completion.agreement_authority_receipt_id,
        expected_receipt_id: completion.agreement_receipt_id,
        expected_receipt_digest: completion.agreement_receipt_digest,
        expected_authority_head: completion.expected_agreement_authority_head,
        trusted_now: this.trustedNow,
      });
      if (!agreementResult.ok) return agreementResult;
      if (
        agreementResult.value.authority_receipt_digest !==
        completion.agreement_authority_receipt_digest
      )
        return fail(
          "HIL_SCREEN_RECEIPT_STALE",
          `agreement_authority_swap:${completion.capability_id}`,
        );
      const backpropResult = await this.readBackpropAuthority({
        authority_receipt_id: completion.backprop_authority_receipt_id,
        expected_receipt_id: completion.backprop_receipt_id,
        expected_receipt_digest: completion.backprop_receipt_digest,
        expected_authority_head: completion.expected_backprop_authority_head,
        trusted_now: this.trustedNow,
      });
      if (!backpropResult.ok) return backpropResult;
      if (
        backpropResult.value.authority_receipt_digest !==
        completion.backprop_authority_receipt_digest
      )
        return fail(
          "HIL_SCREEN_RECEIPT_STALE",
          `backprop_authority_swap:${completion.capability_id}`,
        );
      const agreement = agreementResult.value.receipt;
      const backprop = backpropResult.value.receipt;
      const pair = await this.validateAgreementBackpropPair(agreement, backprop, completion);
      if (!pair.ok) return pair;
      if (agreement.capability_id !== completion.capability_id)
        return fail(
          "HIL_SCREEN_GATE_EVIDENCE_MISSING",
          `ui_capability_swap:${completion.capability_id}`,
        );
    }
    // 全検証を通過した場合のみ、同一 operation として stage と gate を atomic に前進させる。
    const beforeStage = this.stage_head;
    const beforeGate = this.gate_head;
    this.stage_head = sha256(`${beforeStage}:${bundle.operation_digest}`);
    this.gate_head = sha256(`${beforeGate}:${bundle.operation_digest}`);
    this.committedOperations.add(bundle.operation_id);
    const gateReceiptDigest = sha256(
      JSON.stringify({
        closure: closure.stage_receipt_digest,
        gate_receipt_id: bundle.gate.gate_receipt_id,
        operation: bundle.operation_digest,
      }),
    );
    this.gateReceipts.push({
      ...bundle.gate,
      operation_digest: bundle.operation_digest,
      commit_receipt_digest: gateReceiptDigest,
      before_revision: 0,
      after_revision: 1,
      event_head: this.gate_head,
    });
    return {
      ok: true,
      value: {
        operation_id: bundle.operation_id,
        operation_digest: bundle.operation_digest,
        denominator_revision: closure.denominator_revision,
        before_stage_head: beforeStage,
        after_stage_head: this.stage_head,
        before_gate_head: beforeGate,
        after_gate_head: this.gate_head,
        closure_digest: closure.stage_receipt_digest,
        gate_receipt_digest: gateReceiptDigest,
        status: "committed",
        inserted_completion_count: closure.no_ui_completions.length + closure.ui_completions.length,
        write_set_digest: bundle.write_set_digest,
      },
    };
  }
}

function canonicalizeRecord(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalizeRecord);
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return Object.fromEntries(entries.map(([k, v]) => [k, canonicalizeRecord(v)]));
  }
  return value;
}

export function createInMemoryScreenApplicabilityStore(
  seed: ScreenStoreSeedV1,
  trustedNow: string,
): InMemoryScreenApplicabilityStore {
  return new InMemoryScreenApplicabilityStore(seed, trustedNow);
}
