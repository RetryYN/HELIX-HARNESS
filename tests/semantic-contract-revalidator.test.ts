import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  canonicalizeSidecarDescriptor,
  computeCanonicalJsonDigest,
  computeEnvelopeDigest,
  computeSidecarDigest,
  revalidateSemanticEnvelope,
  type SemanticResultEnvelopeV1,
  type SidecarDescriptorV1,
} from "../src/semantic/semantic-contract-revalidator";

// PLAN-L7-524-psc-semantic-contract: #230 slice1（Node revalidator、意味の再実装なし）。
// L6テスト設計 U-PSC-001 / U-PSC-002 を機械検査する。

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function validSidecarInput(): Record<string, unknown> {
  const base = {
    schema_version: "psc-sidecar.v1",
    document_path: "docs/design/helix/L2-screen/screen-list.md",
    document_digest: sha256("doc"),
    contract_id: "PSC-screen-intake",
    contract_version: 1,
    payload_schema_digest: sha256("payload-schema"),
  };
  return { ...base, sidecar_digest: computeSidecarDigest(base) };
}

function validEnvelopeInput(sidecar: SidecarDescriptorV1): Record<string, unknown> {
  const payload = { atoms: [{ id: "SCR-pm-01", disposition: "adopt" }], count: 1 };
  const base = {
    schema_version: "psc-semantic-result.v1",
    contract_id: sidecar.contract_id,
    contract_version: sidecar.contract_version,
    payload_schema_digest: sidecar.payload_schema_digest,
    source_digest: sha256("source"),
    payload,
    payload_digest: computeCanonicalJsonDigest(payload),
    provenance: {
      worker_id: "psc-worker-screen",
      worker_version: "1.0.0",
      contract_digest: sha256("contract"),
    },
  };
  return { ...base, envelope_digest: computeEnvelopeDigest(base) };
}

function mustCanonicalize(raw: Record<string, unknown>): SidecarDescriptorV1 {
  const result = canonicalizeSidecarDescriptor(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.failures));
  return result.value;
}

describe("semantic contract revalidator (PLAN-L7-524)", () => {
  it("U-PSC-001: sidecar記述子のstrict schema・digest再計算・path検査をfail-closeし決定的digestを返す", () => {
    const green = canonicalizeSidecarDescriptor(validSidecarInput());
    expect(green.ok, JSON.stringify(green).slice(0, 300)).toBe(true);
    if (!green.ok) return;
    expect(green.value.sidecar_digest).toMatch(/^sha256:[0-9a-f]{64}$/);

    // 決定性: object key 順序を入れ替えた意味的同一入力は同 sidecar_digest
    const permuted = canonicalizeSidecarDescriptor(
      Object.fromEntries(Object.entries(validSidecarInput()).reverse()),
    );
    expect(permuted.ok).toBe(true);
    if (permuted.ok) expect(permuted.value.sidecar_digest).toBe(green.value.sidecar_digest);

    // deep-copy: caller が入力を後から書き換えても検証結果へ波及しない
    const rawInput = validSidecarInput();
    const copied = canonicalizeSidecarDescriptor(rawInput);
    (rawInput as { contract_id: string }).contract_id = "PSC-tampered";
    expect(copied.ok).toBe(true);
    if (copied.ok) expect(copied.value.contract_id).toBe("PSC-screen-intake");

    // schema 逸脱の全列挙: schema_version 不一致 + unknown key + digest 形式不正
    const bad: Record<string, unknown> = {
      ...validSidecarInput(),
      schema_version: "psc-sidecar.v0",
      extra_key: 1,
    };
    bad.document_digest = "not-a-digest";
    const badResult = canonicalizeSidecarDescriptor(bad);
    expect(badResult.ok).toBe(false);
    if (!badResult.ok) {
      expect(badResult.failures.length).toBeGreaterThanOrEqual(1);
      for (const failure of badResult.failures) expect(failure.code).toBe("PSC_SCHEMA_INVALID");
    }

    // path 逸脱: 絶対 path / `..` / Windows path / URL エンコード traversal は PSC_SCHEMA_INVALID
    // （review round1 probe524_1 の反例を恒久 oracle 化）
    for (const path of [
      "/etc/passwd",
      "../outside.md",
      "docs/../../escape.md",
      "C:\\Windows\\system32",
      "docs\\..\\escape.md",
      "docs/%2e%2e/%2e%2e/secret.md",
      "docs/..%2f..%2fsecret.md",
      "%2e%2e/%2e%2e/secret.md",
      "docs/..%5c..%5csecret.md",
      "docs/%252e%252e/secret.md",
    ]) {
      const traversal = validSidecarInput();
      (traversal as { document_path: string }).document_path = path;
      (traversal as { sidecar_digest: string }).sidecar_digest = computeSidecarDigest(traversal);
      const rejected = canonicalizeSidecarDescriptor(traversal);
      expect(rejected.ok, path).toBe(false);
      if (!rejected.ok) expect(rejected.failures[0]?.code).toBe("PSC_SCHEMA_INVALID");
    }

    // 正当な repo 相対 path（拡張子の `.`・ハイフン・数字）は green のまま（過剰検出なし）
    for (const path of [
      "docs/design/helix/L6-function-design/semantic-contract-revalidator.md",
      "src/semantic/semantic-contract-revalidator.ts",
      "docs/plans/PLAN-L7-524-psc-semantic-contract.md",
    ]) {
      const okPath = validSidecarInput();
      (okPath as { document_path: string }).document_path = path;
      (okPath as { sidecar_digest: string }).sidecar_digest = computeSidecarDigest(okPath);
      expect(canonicalizeSidecarDescriptor(okPath).ok, path).toBe(true);
    }

    // masked mutation: field を書き換えたのに宣言 digest を据え置いた入力は PSC_DIGEST_MISMATCH
    const masked = validSidecarInput();
    (masked as { contract_version: number }).contract_version = 2;
    const maskedResult = canonicalizeSidecarDescriptor(masked);
    expect(maskedResult.ok).toBe(false);
    if (!maskedResult.ok) expect(maskedResult.failures[0]?.code).toBe("PSC_DIGEST_MISMATCH");

    // 非 record は PSC_SCHEMA_INVALID
    const notRecord = canonicalizeSidecarDescriptor("sidecar");
    expect(notRecord.ok).toBe(false);
    if (!notRecord.ok) expect(notRecord.failures[0]?.code).toBe("PSC_SCHEMA_INVALID");
  });

  it("U-PSC-002: envelopeのdigest偽装・provenance欠落・contract束縛不一致をfail-closeしopaque payloadを保証する", () => {
    const sidecar = mustCanonicalize(validSidecarInput());
    const green = revalidateSemanticEnvelope(validEnvelopeInput(sidecar), sidecar);
    expect(green.ok, JSON.stringify(green).slice(0, 300)).toBe(true);
    if (!green.ok) return;

    // 決定性: payload の key 順序入替（意味的同一）は同 payload_digest で green
    const permutedPayload = { count: 1, atoms: [{ disposition: "adopt", id: "SCR-pm-01" }] };
    const permuted = validEnvelopeInput(sidecar);
    (permuted as { payload: unknown }).payload = permutedPayload;
    (permuted as { envelope_digest: string }).envelope_digest = computeEnvelopeDigest(permuted);
    const permutedResult = revalidateSemanticEnvelope(permuted, sidecar);
    expect(permutedResult.ok).toBe(true);
    if (permutedResult.ok) {
      expect(permutedResult.value.payload_digest).toBe(green.value.payload_digest);
    }

    // digest 偽装: payload を改ざんして宣言 payload_digest を据え置くと PSC_DIGEST_MISMATCH
    const forged = validEnvelopeInput(sidecar);
    (forged as { payload: unknown }).payload = { atoms: [], count: 0 };
    (forged as { envelope_digest: string }).envelope_digest = computeEnvelopeDigest(forged);
    const forgedResult = revalidateSemanticEnvelope(forged, sidecar);
    expect(forgedResult.ok).toBe(false);
    if (!forgedResult.ok) expect(forgedResult.failures[0]?.code).toBe("PSC_DIGEST_MISMATCH");

    // provenance 欠落は PSC_PROVENANCE_INVALID
    const noProv = validEnvelopeInput(sidecar);
    (noProv as { provenance: unknown }).provenance = { worker_id: "psc-worker-screen" };
    (noProv as { envelope_digest: string }).envelope_digest = computeEnvelopeDigest(noProv);
    const noProvResult = revalidateSemanticEnvelope(noProv, sidecar);
    expect(noProvResult.ok).toBe(false);
    if (!noProvResult.ok) expect(noProvResult.failures[0]?.code).toBe("PSC_PROVENANCE_INVALID");

    // contract 束縛不一致（contract_version drift）は PSC_CONTRACT_UNBOUND
    const unbound = validEnvelopeInput(sidecar);
    (unbound as { contract_version: number }).contract_version = 9;
    (unbound as { envelope_digest: string }).envelope_digest = computeEnvelopeDigest(unbound);
    const unboundResult = revalidateSemanticEnvelope(unbound, sidecar);
    expect(unboundResult.ok).toBe(false);
    if (!unboundResult.ok) expect(unboundResult.failures[0]?.code).toBe("PSC_CONTRACT_UNBOUND");

    // 複数違反の混在は全列挙（digest 偽装 + provenance 欠落 + 束縛不一致）
    const mixed = validEnvelopeInput(sidecar);
    (mixed as { payload: unknown }).payload = { forged: true };
    (mixed as { provenance: unknown }).provenance = {};
    (mixed as { contract_id: string }).contract_id = "PSC-other";
    (mixed as { envelope_digest: string }).envelope_digest = computeEnvelopeDigest(mixed);
    const mixedResult = revalidateSemanticEnvelope(mixed, sidecar);
    expect(mixedResult.ok).toBe(false);
    if (!mixedResult.ok) {
      const codes = new Set(mixedResult.failures.map((f) => f.code));
      expect(codes.has("PSC_DIGEST_MISMATCH")).toBe(true);
      expect(codes.has("PSC_PROVENANCE_INVALID")).toBe(true);
      expect(codes.has("PSC_CONTRACT_UNBOUND")).toBe(true);
    }

    // opaque payload 保証: 任意 JSON（深いネスト・null・配列）が意味検査なしで green
    const opaque = validEnvelopeInput(sidecar);
    const weird = { nested: { deep: [null, 0, "", { x: [1, 2, 3] }] } };
    (opaque as { payload: unknown }).payload = weird;
    (opaque as { payload_digest: string }).payload_digest = computeCanonicalJsonDigest(weird);
    (opaque as { envelope_digest: string }).envelope_digest = computeEnvelopeDigest(opaque);
    expect(revalidateSemanticEnvelope(opaque, sidecar).ok).toBe(true);

    // envelope_digest の masked mutation（field 書換 + envelope_digest 据え置き）も検出
    const maskedEnvelope = validEnvelopeInput(sidecar);
    (maskedEnvelope as { source_digest: string }).source_digest = sha256("other-source");
    const maskedResult = revalidateSemanticEnvelope(maskedEnvelope, sidecar);
    expect(maskedResult.ok).toBe(false);
    if (!maskedResult.ok) expect(maskedResult.failures[0]?.code).toBe("PSC_DIGEST_MISMATCH");

    // 非 record / schema_version 不一致は PSC_SCHEMA_INVALID
    const badSchema = revalidateSemanticEnvelope(
      { ...validEnvelopeInput(sidecar), schema_version: "psc-semantic-result.v0" },
      sidecar,
    );
    expect(badSchema.ok).toBe(false);
    if (!badSchema.ok) expect(badSchema.failures[0]?.code).toBe("PSC_SCHEMA_INVALID");
  });
});

// 型 export の実在確認（コンパイル境界）
const _typeCheck: SemanticResultEnvelopeV1 | null = null;
void _typeCheck;
