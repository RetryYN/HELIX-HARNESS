---
title: "HELIX L5 詳細設計 — Python runtime toolchain freeze"
layer: L5
kind: add-design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
plan: PLAN-L5-104-python-runtime-toolchain-freeze
design_slice: PYTHON-RUNTIME-TOOLCHAIN-FREEZE-001
pair_artifact: docs/test-design/helix/L8-python-runtime-toolchain-freeze-integration-test-design.md
requirements: [HR-FR-HIL-12, HIL-TR-06]
---

# HELIX L5 詳細設計 — Python runtime toolchain freeze

## §0 境界と採用候補

最初のPython semantic core canaryが使用できるruntime identityを凍結する。初期候補は
**CPython 3.14.7通常build、free-threaded無効、JIT無効**とする。これはruntime導入・active化の
完了宣言ではなく、後続実装が満たすべきadmission contractである。ローカル既定Python、PATH先頭、
`python3` alias、latest minorのような可変identityから解決してはならない。

Pythonはsemantic resultを生成する意味コア、Nodeはschema/digest/policy再検証と唯一のtransaction
commitを担う実行境界というADR-010の分担を維持する。runtime packageへrepository、`.helix/`、
DB path、credential、Git/GitHub write authorityを与えない。

## §1 `PythonRuntimeAuthorityV1`

| field | 拘束 |
|---|---|
| `runtime_id` | `cpython-3.14.7-normal`に固定。alias禁止 |
| `implementation/version/build_mode` | `CPython`、`3.14.7`、`normal`をexact一致 |
| `jit/free_threaded` | 初期authorityでは双方`false`。変更は別VERSION_UP PLANと計測receipt必須 |
| `source_url/release_url` | python.org公式3.14.7 surfaceへ固定 |
| `artifact_name/platform/arch` | Linux canonicalとWindows compatibilityを別artifact identityで列挙 |
| `artifact_sha256/signature/provenance` | 空欄・未検証・versionだけの照合を禁止 |
| `manifest/lock` | tool名・version・schema・content digestを固定し、transitiveを含む |
| `sbom` | interpreterと全Python componentをexactly once収録 |
| `offline_bundle` | clean environmentでnetwork attempt 0のinstall digestを固定 |
| `rollback_runtime_id` | 直前green authorityと復帰receipt schemaを固定 |

実artifact digestやlock toolを推測で埋めない。公式artifact取得とtool PoCの実測後に候補receiptへ記録し、
そのexact setを独立reviewして初めて本設計をconfirmedへ上げる。

## §2 admission順序

1. authority documentとschemaをdecodeする。
2. OS／archに対応するartifactをexactly-one解決する。
3. signature/provenanceとartifact SHA-256を検証する。
4. manifest/lock digestと全dependencyを照合する。
5. offline clean installを行い、network attemptが0であることを記録する。
6. SBOM component setとinstalled setを双方向照合する。
7. `python --version`だけでなくimplementation/build flags/runtime artifact digestを照合する。
8. Node側がreceipt schemaとdigestを再検証し、canary descriptorへruntime identityを束縛する。

いずれかの失敗後にPATH fallback、別patch、system Python、online再解決へ縮退しない。

## §3 失敗契約

| code | 条件 | 結果 |
|---|---|---|
| `HIL_PYTHON_RUNTIME_IDENTITY_INVALID` | implementation/version/build mode/OS/arch不一致 | spawn 0 |
| `HIL_PYTHON_RUNTIME_PROVENANCE_INVALID` | 公式source、signature、digestの欠落・不一致 | admission拒否 |
| `HIL_PYTHON_RUNTIME_LOCK_DRIFT` | manifest/lock/tool/transitive set不一致 | install・spawn 0 |
| `HIL_PYTHON_RUNTIME_OFFLINE_MISMATCH` | clean install中のnetwork attemptまたはartifact不足 | canary green 0 |
| `HIL_PYTHON_RUNTIME_SBOM_MISMATCH` | installed componentの欠落・重複・余剰 | canary green 0 |
| `HIL_PYTHON_RUNTIME_EXPERIMENTAL_MODE_UNAPPROVED` | free-threadedまたはJITが未承認で有効 | spawn 0 |
| `HIL_PYTHON_RUNTIME_ROLLBACK_UNAVAILABLE` | rollback identity／artifact／手順が未検証 | activation 0 |

## §4 freeze条件

L8の全oracle、Linux canonical実artifact、Windows compatibility artifact、offline clean install、SBOM、
rollback rehearsal、別runtime/model familyのexact-HEAD reviewが揃うまでdraftを維持する。macOS、
free-threaded、JIT、第三者package index、distribution publishはこのfreezeの完了条件へ混入しない。

## §5 設計実在性束縛

runtime authority parser、artifact verifier、lock、SBOM、worker sourceは後続L6/L7で追加する。本設計で
定義した型やfailure codeを実装済みとして扱わない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```
