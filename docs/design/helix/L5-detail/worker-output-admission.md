---
title: "worker output admission詳細設計"
layer: L5
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L5-90-worker-output-admission.md
pair_artifact: docs/test-design/helix/L8-worker-output-admission-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/worker-output-admission.md
github_issue_id: 227
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
---

# worker output admission詳細設計

## 1. schema正本

`KnownOutputSchemaV1`は`schema_language`、evaluator semantics、canonical encoding、dynamic binding policy、envelope ASTをまとめてSHA-256化する。
ASTはobject／array／string／number／boolean／null／literalのclosed unionとし、objectはrequired exact＋unknown key deny、numberはfinite／safe integer、全nodeはdepth／node／property上限を持つ。
caller AST、外部parser、digestだけの登録、relaxation profileを受け取らない。初版の`relaxation_count`は0である。

## 2. canonical envelope形式

```ts
interface WorkerOutputEnvelopeV1 {
  schema_version: "helix-worker-output-envelope.v1";
  descriptor_digest: Sha256Digest;
  output_schema_digest: Sha256Digest;
  payload_digest: Sha256Digest;
  payload: {
    schema_version: "helix-worker-proposal.v1";
    proposal_only: true;
    summary: string;
  };
}
```

raw stdoutは1 MiB以下のUTF-8で、lexical depth 64、node 4,096以下とする。`canonicalJson(parsed) === raw`を要求し、末尾LF、空白、key順差、duplicate key、`1.0`、`-0`を拒否する。
payload digestはcanonical payloadから再計算し、descriptor／schema digestはcurrent admissionとexact一致させる。

## 3. failure完全集合

| reason code | 到達fixture |
|---|---|
| `WORKER_OUTPUT_SCHEMA_UNRESOLVED` | unknown schema／stdin contract欠落 |
| `WORKER_OUTPUT_PROCESS_FAILED` | nonzero exit |
| `WORKER_OUTPUT_OVERSIZE` | 1 MiB超またはempty |
| `WORKER_OUTPUT_UTF8_INVALID` | 厳格UTF-8 decode失敗 |
| `WORKER_OUTPUT_NONCANONICAL` | whitespace／duplicate／別encoding |
| `WORKER_OUTPUT_SCHEMA_INVALID` | unknown key／literal／型／構造上限違反 |
| `WORKER_OUTPUT_DIGEST_MISMATCH` | descriptor／schema／payload digest不一致 |

failure時はoutput capabilityを0件とし、raw stdout／stderrを返さない。stderrはdigestだけを診断証跡として返し、output authorityにしない。

## 4. 状態遷移

```text
admitted -> output_contract_bound -> sandboxed -> process_succeeded -> scope_green
 -> decoded -> canonical -> schema_valid -> digest_bound -> sealed_output
 \-> rejected (capability 0)
```

FR-06の`revalidated -> accepted/rejected/quarantined` durable lifecycle、reviewer separation、DB commitは後続ownerへ残す。

## 5. Design Reality Binding契約

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": ["WORKER_OUTPUT_SCHEMA_UNRESOLVED", "WORKER_OUTPUT_PROCESS_FAILED", "WORKER_OUTPUT_OVERSIZE", "WORKER_OUTPUT_UTF8_INVALID", "WORKER_OUTPUT_NONCANONICAL", "WORKER_OUTPUT_SCHEMA_INVALID", "WORKER_OUTPUT_DIGEST_MISMATCH"],
  "assets": [
    {
      "asset_id": "worker-output-admission",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-output-admission.ts",
      "resource_kind": "typescript_export",
      "resource_name": "admitWorkerOutput",
      "source_digest": "sha256:5c60f52a53dee74b3e072e650f74367c1a509f36da0f04d0386d0a9a544f4b29",
      "current_authority": true
    }
  ],
  "failure_reachability": [
    {
      "reason_code": "WORKER_OUTPUT_SCHEMA_UNRESOLVED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-output-admission.ts", "source_symbol": "admitWorkerOutput", "test_path": "tests/worker-output-admission.test.ts", "oracle_id": "U-WOA-004", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "WORKER_OUTPUT_SCHEMA_UNRESOLVED",
      "mutation": { "remove_post_resolution_check": "const schema = knownOutputSchemas.get(binding.output_schema_digest);", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-016", "execution_helper": "executeWorkerOutputMutationOracle", "execution_target": "const schema = knownOutputSchemas.get(binding.output_schema_digest);\n  if (!schema || schemaDigest(schema) !== binding.output_schema_digest)\n    return failure(\"WORKER_OUTPUT_SCHEMA_UNRESOLVED\");" }
    },
    {
      "reason_code": "WORKER_OUTPUT_PROCESS_FAILED", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-isolation-broker.ts", "source_symbol": "runWorkerIsolationLaunch", "test_path": "tests/worker-isolation-broker.test.ts", "oracle_id": "U-WIB-012", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "WORKER_OUTPUT_PROCESS_FAILED",
      "mutation": { "remove_post_resolution_check": "if (result.status !== 0) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-017", "execution_helper": "executeIsolationMutationOracle" }
    },
    {
      "reason_code": "WORKER_OUTPUT_OVERSIZE", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-output-admission.ts", "source_symbol": "admitWorkerOutput", "test_path": "tests/worker-output-admission.test.ts", "oracle_id": "U-WOA-005", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "WORKER_OUTPUT_OVERSIZE",
      "mutation": { "remove_post_resolution_check": "bytes.byteLength === 0 || bytes.byteLength > MAX_OUTPUT_BYTES", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-016", "execution_helper": "executeWorkerOutputMutationOracle" }
    },
    {
      "reason_code": "WORKER_OUTPUT_UTF8_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-output-admission.ts", "source_symbol": "admitWorkerOutput", "test_path": "tests/worker-output-admission.test.ts", "oracle_id": "U-WOA-005", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "WORKER_OUTPUT_UTF8_INVALID",
      "mutation": { "remove_post_resolution_check": "new TextDecoder(\"utf-8\", { fatal: true })", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-016", "execution_helper": "executeWorkerOutputMutationOracle" }
    },
    {
      "reason_code": "WORKER_OUTPUT_NONCANONICAL", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-output-admission.ts", "source_symbol": "admitWorkerOutput", "test_path": "tests/worker-output-admission.test.ts", "oracle_id": "U-WOA-005", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "WORKER_OUTPUT_NONCANONICAL",
      "mutation": { "remove_post_resolution_check": "if (canonicalJson(parsed) !== text)", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-016", "execution_helper": "executeWorkerOutputMutationOracle" }
    },
    {
      "reason_code": "WORKER_OUTPUT_SCHEMA_INVALID", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-output-admission.ts", "source_symbol": "admitWorkerOutput", "test_path": "tests/worker-output-admission.test.ts", "oracle_id": "U-WOA-003", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "WORKER_OUTPUT_SCHEMA_INVALID",
      "mutation": { "remove_post_resolution_check": "if (!validateValue(schema.envelope_ast, parsed))", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-016", "execution_helper": "executeWorkerOutputMutationOracle" }
    },
    {
      "reason_code": "WORKER_OUTPUT_DIGEST_MISMATCH", "reachability_mode": "executable_oracle", "source_path": "src/runtime/worker-output-admission.ts", "source_symbol": "admitWorkerOutput", "test_path": "tests/worker-output-admission.test.ts", "oracle_id": "U-WOA-004", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "WORKER_OUTPUT_DIGEST_MISMATCH",
      "mutation": { "remove_post_resolution_check": "parsed.payload_digest !== payloadDigest", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-016", "execution_helper": "executeWorkerOutputMutationOracle" }
    }
  ]
}
```
