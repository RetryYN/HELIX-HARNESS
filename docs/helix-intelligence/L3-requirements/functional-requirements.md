# HELIX-INTELLIGENCE L3 機能要件（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: Stage 2a / version_target 1.0 explicit items only
owner: HELIX-INTELLIGENCE
paired_l10: ../L10-verification/functional-verification.md

本稿は固定L2/L11に根拠を置くStage 2a部分範囲であり、機構全体のL3、実装、実行、採択・承認を意味しない。親L2ごとにFR IDを分け、ACはL3正本に一度だけ定義し、L10は同じACを参照する。


### `FR-INTELLIGENCE-L3-010` — `HELIXINTELLIGENCE-L2-010`

task type/domain/complexity/context/tool requirement、ticket identity、およびtask class・Worker/model/version・source revision/scopeに結束したsuccess/failure/rework/latency/cost/reliability実績を入力し、根拠・除外理由・不確実性・未評価を含むticket別配置proposalを返す。価格、model名、aggregate benchmark単独で結論せず、割当・実行・進行はOS、実績の評価scopeはLABOに残す。

**責務／依存境界**：proposal作成はHELIX-INTELLIGENCE、task属性/ticketはOS、task-class実績と適用scopeはLABO、実契約/依存版はHARNESS-L2-010/011が所有する。単独成立依存はticket/task identity、全task属性、LABO HELIX-Bench evidenceまたは明示的未評価とWorker実績である。

**受入条件**

- **`AC-INTELLIGENCE-L3-010-01` 入力属性と戻し先**：全属性・ticket identityのそろった入力からproposalを生成し、各必須属性を一つずつ欠いた場合は推測で補わず未確定としてOSへ戻す。
- **`AC-INTELLIGENCE-L3-010-02` 実績scopeと未評価**：各実績軸をWorker/model/version、task class、source revision/scopeへ結び、stale・scope mismatch・未評価をqualifiedと表示しない。価格／model名だけのfixtureも根拠不十分として未確定にする。
- **`AC-INTELLIGENCE-L3-010-03` proposalとassignment分離**：proposalは推奨と根拠を示すだけで、OS assignment/authority receiptがない状態ではWorker起動・割当を起こさない。OS判断後もINTELLIGENCEが進行責務を取得しない。

### `FR-INTELLIGENCE-L3-066` — `HELIXINTELLIGENCE-L2-066`

INTELLIGENCE実装を使えない場合、人がL2-010と同じproposal contract/version・入力属性・evidence/未評価・scopeで配置候補を作り、human-authored provenance、根拠、除外理由、不確実性を付ける。OSはsource/contract revision・task/scope・作成actor/time・受領actor/timeをreceiptへ記録する。人代行入力はINTELLIGENCE生成結果、LABO評価、OS assignment、権限のいずれも生成しない。

**責務／依存境界**：同一proposal contractはINTELLIGENCE-L2-010、LABO evidenceまたは未評価はLABO-L2-054/055、ticketとreceipt/assignmentはOS、contract versionはHARNESS-L2-010/011が所有する。INTELLIGENCE runtime自体は依存にしない。task属性不足はOS、evidence不足はLABO、schema/version不明はINTELLIGENCEへ戻す。

**受入条件**

- **`AC-INTELLIGENCE-L3-066-01` 同一proposal契約**：人手案とINTELLIGENCE案を同じL2-010 schema/versionおよびtask/scope/evidence fixtureへ通し、必須fieldの意味・範囲が一致する。human provenanceはINTELLIGENCE provenanceと区別して保持する。
- **`AC-INTELLIGENCE-L3-066-02` 受領receiptと欠損**：receiptにsource/contract revision、task/scope、根拠・除外理由・不確実性/未評価、作成/受領actorと時点を結び、field欠落・wrong receiver・revision/scope mismatchでは受領済み扱いにしない。
- **`AC-INTELLIGENCE-L3-066-03` authority状態の分離**：人手案のみではLABO qualified state、INTELLIGENCE出力状態、OS assignment/実行開始を生成しない。各々の別recordがあるときもactor・scopeと状態を混同しない。

## 親・旧source crosswalk（item単位）

全固定親は `f6dad2a33e24f000b87d7f09b8d40288257e74cc` 時点。旧statusは履歴情報のみで現行authorityを継承しない。test-designはoracle/failure consumerとして読んだ資料で、旧test/runtime/CLI/CIは実行していない。

| identity／管理行 | PO判断・登録（path/行/SHA） | 固定L2（行・全文SHA・span SHA） | 固定L11（行/span・全文SHA） | 旧L3（asset/path/行/SHA） | 旧test-design（asset/path/行/SHA） | 判断 |
|---|---|---|---|---|---|---|
| `HELIXINTELLIGENCE-L2-010` / `MPR-RC-HELIXINTELLIGENCE-L2-010-004` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-intelligence-requirements-po-decision-2026-09-28.md:57`, SHA `8362ecb58921593b473ac85d277f0db36a7cbe0952268531913191e4eab260ad`; register row `397` SHA `89bdc3bcaaee36a2c5632e3d784c176776bf32521e10621ac837ed22a47235fc`; candidate digest `sha256:29b05afbff84475d17b9b1f0698762dab2a1be92480313833d9c8fef87d410c1` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:102-107`; SHA `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260`; span `bb5239d4bcd59c2d9c125704c26ba3dad3ce45d4d9acd55eb662f060e25924dd` | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` 71-71 / `fb8e588559cf58c54fd45b991e4b60f27929e0c8bd2f96bf8b57c7eed161c712`; SHA `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a` | `LEGACY-ASSET-9114D4E463E95B67DD0C` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md` 行 26-45, 47-110, 123-137; SHA `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290` | `LEGACY-ASSET-C6ADB99F1353965C5449` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md` 行 18-37, 39-64; SHA `c8dff734891a6a7350feb9b698c40e1616946cdd424433d662f1da49d8ac800d` | worker委譲面・隔離・receipt・失敗境界を候補根拠へ再導出。provider一覧、sandbox/receipt schema、benchmark/admissionの既定値を移植しない。／negative mutation/failure oracle、fallback拒否、receipt mismatch候補。旧sandbox/provider admission値は再導出対象外。 |
| `HELIXINTELLIGENCE-L2-066` / `MPR-RC-HELIXINTELLIGENCE-L2-066-003` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-intelligence-requirements-po-decision-2026-09-28.md:96`, SHA `8362ecb58921593b473ac85d277f0db36a7cbe0952268531913191e4eab260ad`; register row `474` SHA `41e40d750c55abaec6fd55d3ce49feab66d1bb1bed68481466cdd665c636600e`; candidate digest `sha256:4085daba7873d4cddefe498b04e59ff5b4e44ba3ec80a307537b51af601cfa69` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:454-465`; SHA `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260`; span `e7b52b1bd92d6ff3fb47acbfd13e119c590cc7d6dc472e6eb96d32864f3d23c4` | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` 131-139 / `7969c17ed59308cc1c052b7a2ffb246e5cf92d8cdcad5bc12f4ad2545d9fc0f1`; SHA `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a` | `LEGACY-ASSET-9114D4E463E95B67DD0C` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md` 行 26-45, 47-110, 123-137; SHA `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290` | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 行 17-55; SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | worker委譲面・隔離・receipt・失敗境界を候補根拠へ再導出。provider一覧、sandbox/receipt schema、benchmark/admissionの既定値を移植しない。／scope、wrong actor, stale receipt, lost handoff等のnegative oracle候補。old event/lease/assignment valuesを移植しない。 |

## PO向け要約（承認未取得）

この部分草稿は、010でtask属性とtask-classに結び付いた観測実績から未評価を保つ配置proposalを作り、OSの割当とLABOの評価を分離する。066ではINTELLIGENCE実装を呼べない場合も同じproposal契約で人が暫定案を渡し、OSのreceiptで出所を残す。人の案は評価済み実績・機械生成出力・割当・authorityを作らない。各caseは固定L2/L11範囲でpositiveと欠落・scope不一致・stale・誤authorityを対にして検証する。
