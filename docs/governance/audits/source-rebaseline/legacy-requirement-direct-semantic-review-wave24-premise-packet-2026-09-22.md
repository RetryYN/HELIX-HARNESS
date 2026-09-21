# Wave24 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE24-2026-09-22`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave24-rebaseline`
- branch: `docs/legacy-semantic-review-wave24-rebaseline`
- candidate parent／current tree: `4974e66e3890e41515004d18c49d59b3e49f8f68`
- Wave23 status: `1a7d1fc3cbece5bc0ad5c59687984a204269098a`として記録済み、PR #1960でorigin/mainへmerge済み
- main merge revision: `4974e66e3890e41515004d18c49d59b3e49f8f68`
- main merge parents: `e85a549f96778fc79021710805f10723978ec668`、`fa8f5426882ee56a56e28975746e2db590cd515f`
- rebaseline stop: captured `origin/main`またはmerge parentが進んだら停止し、mainを再読込してrebaseline
- rebaseline result: `origin/main=4974e66e3890e41515004d18c49d59b3e49f8f68`へ再基底化済み。Wave23 merge後の最新mainを親とし、正式採否・authority・下流実装へ昇格しない
- scope: 2 units / 6 asset edges / 2 confirmed requirement edges / 4 unresolved candidate edges
- cumulative: 74 units / 219 asset edges / 残り144 units
- authority effect: `none`
- consumer closure: `pending`
- legacy execution: `not_run`
- new build: `false`

## 要求source

共通要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、IR source SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` です。raw sourceは `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` です。

| requirement | IR span | raw span | exact statement |
|---|---:|---:|---|
| HIL-FR-03 | `requirements.json:1512-1553` | `:93` | `Issue contractはobjective、acceptance oracle、development style、case-driven activation、specialist capabilities、runtime mode、affected layers、style target、risk、scope budget、digestを別fieldで保持する。 | versioned issue contract＋digest` |
| HIL-FR-04 | `requirements.json:1555-1596` | `:94` | `Universal Reverse Gateは全IssueのR0–R4を順序実行し、各phaseのobligation集合、input/output digest、stage固有schema、source coverage、R4 routing、双方向参照を検査する。R1を含むphase skipは認めず、該当契約なしも探索証拠付き結論として記録する。 | pass/fail receipt＋不足/空洞化code` |

## product unitとatom

| unit | product | phase | atom IDs |
|---|---|---|---|
| `IRUNIT-HIL-FR-03-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-09 | `FR03-HARNESS-A01` issue contract fields、`FR03-HARNESS-A02` versioned contract＋digest |
| `IRUNIT-HIL-FR-04-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-07 / PHCAP-09 | `FR04-HARNESS-A01` Universal Reverse Gate、`FR04-HARNESS-A02` R0–R4順序、`FR04-HARNESS-A03` phase obligation／digest／schema／coverage／routing／参照、`FR04-HARNESS-A04` phase skip拒否と空契約記録 |

`FR04-HARNESS-A02` は `IRUNIT-HIL-FR-04-HELIX-OS` と共有する候補atomとしてholdします。shared atomの接続責務、product owner、connector recordは未確定です。

## selected candidate asset role

| unit / role | asset ID | exact old source / static excerpt |
|---|---|---|
| FR03 / design | `LEGACY-ASSET-4A6FA124DB6FEC0DBA7F` | `docs/design/harness/L6-function-design/plan-entry-routing.md:9-15` |
| FR03 / implementation_source | `LEGACY-ASSET-D8787D8B14310B1A1E77` | `src/workflow/workflow-guide.ts:18-43` |
| FR04 / design | `LEGACY-ASSET-295B373ABCF388FDB10A` | `docs/design/harness/L4-basic-design/function.md:107`、`:155-157` |
| FR04 / implementation_source | `LEGACY-ASSET-7642909D8AA62C75E88D` | `src/lint/l12-hybrid-reviewed-safe-v2.ts:1-99` |

各excerptは `static_read_only` で、catalog source SHA、line bounds、excerpt SHAをledgerへ固定しています。旧asset catalogのclassification、phase/product candidate、implementation evidence state、unresolved、consumer refs（全選択assetで空）をmetadataとledgerへ保存しました。旧判断史・failure・consumerの調査結果は、旧assetの低confidence／pending／unknownを保持し、current authorityへ再利用しません。

`docs/governance/legacy-asset-disposition.jsonl` でも4選択assetを照合しました。全件のdispositionは `unresolved`、authorityは `historical`、implementationは `unknown`、consumer refs・decision record・approval revision・read-after recordは空です。実行failure receiptは選択assetに紐付いておらず、dispositionの `consumer_check` 等のmigration preconditionだけを未解決証拠として保持しました。FR04 implementation sourceの `legacy_runtime_cli_or_adapter` reuse exclusionも保持しています。

FR03 design／implementation、FR04 design／implementationは、要求語の一部と旧sourceの近接を示す研究候補に留まります。4候補edgeはsemantic link `unresolved`、`legacy_execution_status=not_run`、`current_requirement_implementation_status=not_established`、`new_build_allowed=false`です。

## 保留

product boundary、phase authority、consumer closure、successor assignment、current implementation、acceptance receipt、shared atomの独立判断を未確定のまま保持します。Wave23 merge後の最新mainからのstackです。Wave23 merge後の最新mainへ再基底化したため、candidateは正式採否・下流利用へ昇格しません。PR #1967をDraftで提出し、exact HEADの独立reviewを待ちます。mergeとarchive実行は行いません。
