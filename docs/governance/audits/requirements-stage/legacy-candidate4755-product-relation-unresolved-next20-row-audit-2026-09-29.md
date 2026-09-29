# 旧candidate product relation未解決行の次20件・限定照合（2026-09-29）

- source/L2/L11比較の基準tree: `bf00aca56add8ca29d9a56af9a989fdeb0a7d969`。選定入力は、後にmainへmergeされた#2353/#2354の次のJSON本文で固定する。
- authority effect: `none`。旧source条件と採択済みHELIX-OS L2/L11の対応・残差を20行単位で記録する。要求採択、旧source closure、exact coverage、formal successor、実装・実行・受入許可を生成しない。
- scope: #2353のproposed-overlay有効分類で`product_requirement_atom`かつ`source_relation_coverage_unresolved`のID昇順から、#2354で監査済みの20 IDを除いた先頭20件。母数121件。
- #2353の分類overlayは提案状態のselectorであり、現行全数censusではない。対象は全てexecution-ticket-requirements.mdの番号付き条件または明示的なrecord/schema relationで、header・README pointer・obvious metadata/structure行は含まれない。分類自体は変更しない。
- 選定入力pin: #2353 cumulative proposed audit JSON — merge commit `97672630b7de70fd4433827730c390cbabd90a99`, `docs/governance/audits/requirements-stage/legacy-candidate4755-cumulative-classification-route-recount-after-2347-2350-2352-2026-09-29.json`, SHA-256 `2c025c878ce1b63d93531ee980b08c785ba9273d6db6f751cf3237ce31d6696c`; #2354 prior first20 audit JSON — merge commit `d8736eeabc90b3d549ba73acec803eea4df6a75c`, `docs/governance/audits/requirements-stage/legacy-candidate4755-product-relation-unresolved-first20-row-audit-2026-09-29.json`, SHA-256 `27e847d026844808d73f96d26e18c1a817b12e6bd26d1f73c9377b4f27379322`. `created_against_commit`/比較基準treeは元の比較対象の記録であり、これらのselector pinとは別である。

## PO判断のauthorityと比較範囲

- PO判断記録 `HDEC-HELIXOS-REQUIREMENTS-PO-2026-09-28` のline 27は、固定L1対象revisionを確定し、HELIXOS-L2-001〜029と各L2に対する固定L11受入本文一式への合意を記録する。line 46〜48の明示候補採用集合はHELIXOS-L2-014〜029の16件であり、各version_targetと適用条件を保持する。この二つの範囲を区別する。
- JSONの`adopted_related_requirement_ids`は、POが合意したL2/L11本文範囲内の関連要求を指す。これ自体は各IDが明示候補採用集合に属すること、以下20旧atomの採用、または全source coverageを意味しない。
- 比較した現行関係: L2-017 ticket/workflow、018 Worker assignment/attempt、019 evidence/continuity、020検収、023 handoff、各既存L2 004/007/009/010/011、並びに対応するL11受入。L2-014 stage-release要求はExecution Ticket条件への対応要求ではなく、旧route snapshotに挙がることだけではcoverage関係にしない。
- MPR-RC-HELIXOS-L2-017/018/019/020/023/024/025はfunctional-units receiptを参照し、source_atom_count=0・authority_effect=none。これらは旧Execution Ticket atomの行単位mappingではない。2026-09-28 PO decisionを採択authorityとし、receiptの`no_loss`を旧行coverageへ拡張しない。
- 各「部分関係」は採択L2/L11本文にある一般責務・境界を示すだけで、旧行全体を満たす保証やoracleではない。残差欄に不足条件を列挙する。

### LEGACY-CAND-LINE-001482 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:104` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:7db4f61477702fec42d5c31f6c35a9b90d6c647778daa6b43837d8c09356a16c`; physical line bytes SHA-256 `sha256:5668fd778eba73801938cfd1e5d0510daf1f08089031815e18ea1e6c19c34f0a`.
- 旧source bytes:
  > 6. `ticket_digest`一致だけでは比較可能性を成立させない。実験ではtask/fixture/base/protocol/scorer等も照合する。
- 採択済み関連要求（部分関係）: HELIXOS-L2-017, HELIXOS-L2-019, HELIXOS-L2-022。L2-017はticket候補にscope・依存・受入義務を結び、L2-019は証拠provenanceを保持する。HELIXOS-L2-022とLABO評価の受渡しは改善候補を扱う。
- 行ごとの未完条件: 比較可能性を成立させるtask/fixture/base/protocol/scorerの必須組、照合規則、欠落時判定は採択L2/L11のどのoracleにも個別対応していない。digest一致だけで比較可能とする旧条件へのexact coverageなし。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001483 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:105` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:8237eb2d0b85a33cf0a9f6041b1148ac2d95ff6856215ab3f08699cbf4491506`; physical line bytes SHA-256 `sha256:6d380ce6e294a39620a5ac6f8799f3ad6b4c08229dd74b64e3e2993aab536146`.
- 旧source bytes:
  > 7. provider変更・観測方針変更・配車順位変更だけでTicketの意味revisionを増やさない。
- 採択済み関連要求（部分関係）: HELIXOS-L2-017, HELIXOS-L2-018, HELIXOS-L2-019。L2-017は親要求revisionとscopeをticketへ結び、L2-018/019はassignment・attempt・eventのrevision/provenanceと実行状態を分けて追跡する。
- 行ごとの未完条件: provider変更、観測方針変更、配車順位変更がTicket意味revisionを変える/変えない判定表とrevision producerは未特定。現行文面はこれらの変更のrevision effectを列挙しない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001484 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:106` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:4ef7fdeedeffb8ec1c9408d8efa4fd5e77756e8dc201f7f9b0ff636dc41d09a0`; physical line bytes SHA-256 `sha256:6beac529d425f2f4ca11c3d50526bc75f79cec2e2b2f2ba49a2a910b27e99abe`.
- 旧source bytes:
  > 8. 全modeの観測対象に成功だけでなく失敗・拒否・中断・quarantine・取得不能を含める。未実行を成功/失敗Attemptへ捏造しない。
- 採択済み関連要求（部分関係）: HELIXOS-L2-018, HELIXOS-L2-019, HELIXOS-L2-020。L2-018はassignment/attemptを追跡し、L2-019は拒否・未実行・staleを成功証拠から分け、L2-020はsuccess/fail/denied/skipped/interrupted/staleを区別する。
- 行ごとの未完条件: quarantineと取得不能を含む全modeの列挙、未実行からAttemptを生成しないnegative oracleは、採択L11の状態分類と完全一致するか未確認。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001485 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:107` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:d8fc60d8e8a7e02fca929b402e2c34bbc4cc90cf773d425cf318b43180146ca4`; physical line bytes SHA-256 `sha256:85c2d8e9a87a36b63b620925cb6e795ca3575d33daf7cfde73d8fdbadf53319c`.
- 旧source bytes:
  > 9. 通常観測の追加model invocationは0。解析のCPU/I/O・保存費用は別途計測する。
- 採択済み関連要求（部分関係）: HELIXOS-L2-004, HELIXOS-L2-007, HELIXOS-L2-022。L2-004は許可範囲・予算内のWorker実行統制、L2-007は証拠と操作の記録、L2-022は観測/改善候補を記録する。
- 行ごとの未完条件: 通常観測の追加invocation=0、CPU/I/O/storage計測、各費用のowner・上限・不明時処理を定義する採択済みOS oracleは未確認。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001486 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:108` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:7d81584b8de54d598c74e0f3a7a9cdfe72f3a4ab13239606e80519808f7cebde`; physical line bytes SHA-256 `sha256:9e21ec382e71d66a58968a8ad22d471e455ea33a6089fe4539f95134ecb193fb`.
- 旧source bytes:
  > 10. 観測は本線へ逆書込みしない。追加実験には別の認可・有限予算・隔離境界を要求する。
- 採択済み関連要求（部分関係）: HELIXOS-L2-017, HELIXOS-L2-018, HELIXOS-L2-022, HELIXOS-L2-024。L2-017はExperimentを通常ticketと分ける候補workflow、L2-018はassignment scope/authority、L2-022/024はLABO提案・評価とOS登録の境界を保つ。
- 行ごとの未完条件: 観測→本線への書込禁止、追加実験の別認可・有限予算・隔離の具体bindingと拒否oracleは採択L2/L11上で個別traceされていない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001487 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:109` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:b020efb395aeb127d8e950d68b2b957fd5a4eb23324548d103dd5899f7fea092`; physical line bytes SHA-256 `sha256:336e225d42650bc54ffa588ba7a9abfee1232ff2030585eea428811fd1ac1855`.
- 旧source bytes:
  > 11. 一つのTicket revisionにつき、通常repoへ変更権限を持つactive Assignmentは一つ。formal/shadowにも複数本番writerの例外を与えない。
- 採択済み関連要求（部分関係）: HELIXOS-L2-018, HELIXOS-L2-009, HELIXOS-L2-023。L2-018は期限/lease/交代時の二重作業防止、L2-009/023は継続義務とhandoffを扱う。L11-018は二重claim/実行を反例にする。
- 行ごとの未完条件: 「Ticket revision単位」「通常repoへの変更権限」「active Assignment」のidentity/scope定義、およびformal/shadowを含む例外なしのoracleは行全体の完全被覆として対応づけられていない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001488 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:110` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:21866fd457268cdbe83a44d09281d2f8029b90815be06d33457d718f8d0172e1`; physical line bytes SHA-256 `sha256:77df123116d6ccd7a6cf0eac110b8a47222a8eb245be148226a0201b636e70c9`.
- 旧source bytes:
  > 12. benchmarkの共通評価基準は事前固定し、HELIX Fullに固有の内部receipt数を品質の固定加点にしない。
- 採択済み関連要求（部分関係）: HELIXOS-L2-005, HELIXOS-L2-007, HELIXOS-L2-022。L2-005/022は観測結果をLABO評価・改善候補へ渡す境界、L2-007はevidence provenanceを保持する。
- 行ごとの未完条件: 事前固定のbenchmark基準・独立評価単位・内部receipt数を品質指標へ混入させない採択OS requirement/oracleは特定できない。receipt存在は品質・採択・coverageの証拠にならない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001489 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:111` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:625b9477afa1b6afa4dac5b647c78c620a41f0d16ac5199d8c54144f9a0b52fe`; physical line bytes SHA-256 `sha256:4b870cdd0d43a62e38c3d8455ff09c76fdce573ef78840e90d3b1daf4dc74b31`.
- 旧source bytes:
  > 13. 受動観測だけで効果の因果関係を断定しない。異なる条件のデータは識別し、欠測・標本数・観測窓を表示する。
- 採択済み関連要求（部分関係）: HELIXOS-L2-005, HELIXOS-L2-007, HELIXOS-L2-022。OSは出典付き観測を記録しLABOへ評価を渡し、結果と改善候補を区別する。
- 行ごとの未完条件: 因果識別条件、条件差別、欠測/標本数/観測窓の具体fieldと表示oracleは採択L2/L11に特定されず、この行の測定意味までは閉じていない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001490 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:112` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:7ae3e685a79d227690f0285c82899445f0288b2d0919e24aac83ef9526b1be81`; physical line bytes SHA-256 `sha256:3b62c0dab85dc7408923d693eafa9d465c0e7aa1b40af57cbdd5623d4637c912`.
- 旧source bytes:
  > 14. secret/PII/非公開artifact/hidden oracleは最小権限で隔離する。digestは内容同一性であり、発行者認証や実行事実の証明の代用ではない。
- 採択済み関連要求（部分関係）: HELIXOS-L2-004, HELIXOS-L2-007, HELIXOS-L2-019。L2-004はSECURITY権限境界に従い、L2-007/019はsource/provenance/data-useと欠落/拒否/未実行の証拠を保つ。SECURITY要求は全操作のauthority境界を適用する。
- 行ごとの未完条件: 当該データ種別の格付・最小権限隔離具体値と、digestではissuer authentication/実行事実を証明しないことの個別oracleは未確認。SHA一致だけから実行・issuerを推定しない境界は本監査に明記。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001491 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:113` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:f783d5482b53644439e2d538bf90ff64f4f9e85b838bfbcb05524e1bfba44a9a`; physical line bytes SHA-256 `sha256:4d652aef3ebc323c03b5d03924d58309f2484f03cd20d9a6cdab82c6ec53db9d`.
- 旧source bytes:
  > 15. 分析の遅延だけで全開発を停止しない。必要なaudit eventを耐久記録できない場合は、該当する新規変更・危険操作をfail-closeする。
- 採択済み関連要求（部分関係）: HELIXOS-L2-004, HELIXOS-L2-007, HELIXOS-L2-019。L2-019は保存/projection失敗時に成功checkpointを公開せず発生元へ返す。L2-004は許可範囲内実行を統制し、L2-007は共通証拠を保持する。
- 行ごとの未完条件: 分析処理遅延と記録不能のscope差、durable audit eventの最低集合、該当する変更/危険操作範囲は採択oracleに未分解。全開発停止/全体継続のいずれもこの広い旧文だけから導かない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001492 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:114` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:6a0bfdf0d4209af893ace448da88059d05f5e3ebabb6051e1f9f196901ed15bf`; physical line bytes SHA-256 `sha256:72416e177f6f5a7d6f5bee5f06e431f36b056e669be645fd73f102daa3c9ca14`.
- 旧source bytes:
  > 16. 結果は既存ownerへtyped evidence/proposalとして渡す。優先度・配車・承認の決定を本要求書の列挙順から推測しない。
- 採択済み関連要求（部分関係）: HELIXOS-L2-005, HELIXOS-L2-007, HELIXOS-L2-010, HELIXOS-L2-017。L2-010/017はOS推進がticketを発行し、周辺機構の案を無条件採用しない。L2-005/007は出典付き改善候補とevidenceを既存ownerへ渡す。
- 行ごとの未完条件: typed evidence/proposalのschema・各結果owner・priority/placement/approvalへ非変換のoracleは現行採択要求に個別に結び付けられていない。列挙順はauthority/order証拠にしない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001493 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:115` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:f77d9779c3196ed00923cdb865f6cf3b463fb2390d04aff9faa65a199fe7c965`; physical line bytes SHA-256 `sha256:90bc3c99115eb7db2ceb35ee7e87d80604853f00fcb17405b43ec4087cbc5e6b`.
- 旧source bytes:
  > 17. source変更はaffected ref/obligation単位に評価する。無関係なmain更新で全Ticketをsupersedeしない。
- 採択済み関連要求（部分関係）: HELIXOS-L2-003, HELIXOS-L2-011, HELIXOS-L2-016, HELIXOS-L2-019。L2-003/016は変更影響・traceを対象範囲へ関連づけ、L2-011は実候補/base更新による再計画を扱う。
- 行ごとの未完条件: affected obligation粒度とTicket supersede条件、無関係main更新をsupersede扱いしないnegative oracleは採択L11で未確認。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001494 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:116` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:aaf534197b9db5603040c7d47ee5d4d676105d276682ddb3d94c6989d8e90106`; physical line bytes SHA-256 `sha256:801b4b25c5fcb77768d86762b2f5db3054f4303e6b277fd7989caf9321969f4a`.
- 旧source bytes:
  > 18. 条件付き安全fallback・recoveryは既存policyから決定する。未知の状態を「正常」「0円」「初回」「現行性能」と推測しない。
- 採択済み関連要求（部分関係）: HELIXOS-L2-017, HELIXOS-L2-018, HELIXOS-L2-019。L2-017はunknown/conflict等でticketを実行可能にせず、L2-018/019は不一致/欠落を停止・未完として記録し引き継ぐ。
- 行ごとの未完条件: 列挙された「正常」「0円」「初回」「現行性能」の変換先ごとのnegative oracleと既存policy ownerは特定されていない。一般unknown fail-closeは部分関係に留める。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001509 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:137` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:44ba9a14506577b22ce6fbb7310bbeb10eaf6eafefbfb26d1d667fe5e10696f8`; physical line bytes SHA-256 `sha256:cc898d241e348a86391597175ea30e3303f4adeca95654bc9a292b2047beb26b`.
- 旧source bytes:
  > `priority_class`の可変実行順位、release placement、測定policy、測定結果は外部bindingへ移す。上位要求が納期・risk等を意味制約として持つ場合のみ、その正規refをTicketへ含める。Release配置変更やscorer更新だけで仕事の意味が変わらないようにする。
- 採択済み関連要求（部分関係）: HELIXOS-L2-010, HELIXOS-L2-011, HELIXOS-L2-017, HELIXOS-L2-019。L2-010はpriority等の管理入力と推進ticket/workflowを分担し、L2-017は親revision/scopeを保持、L2-019はevidenceを追跡する。
- 行ごとの未完条件: 4項目の外部binding identity/schema、上位意味制約だけを正規refとして含める条件、およびRelease/scorer変更時にTicket意味を不変にするoracleは未確認。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001511 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:141` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:c9c49e587fa1799e343bc92f39e7ea9bd48741d5835480b0ab2b2a000fbf556f`; physical line bytes SHA-256 `sha256:7486e3392b8c2f0c805da8484d88f9742f8c643af657969466940aff4cd1e336`.
- 旧source bytes:
  > AssignmentはTicket ref、owner/lane/runtime descriptor、execution namespace、branch/worktree、base/head、予算、capability snapshot、lease/fenceを持つ。read-only/evaluation経路で不要なbranch等は、明示的なprofile上の`not_applicable`として扱い、欠落と区別する。
- 採択済み関連要求（部分関係）: HELIXOS-L2-018, HELIXOS-L2-019, HELIXOS-L2-023。L2-018はticket/Worker/lane/scope/budget/deadlineをassignment/attemptに束ね、L2-019は証拠と継続義務、L2-023は同じscope/未完義務のhandoffを扱う。
- 行ごとの未完条件: 旧列挙全fieldのcurrent schema、read-only/evaluation profile別N/A値と欠落の差、lease/fenceのowner/validation oracleは採択revisionで明示照合できない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001512 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:143` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:58ad3196d64f86bba744509ee4aa6fceab121aa2e2a7c20fce095fdf614e8adc`; physical line bytes SHA-256 `sha256:3dc7938f63935be694530cef6e1b91c5bdb6ecf2da26d49cedec94c99f5d47ab`.
- 旧source bytes:
  > Attemptは`attempt_id / assignment_ref / ticket_ref / started_at / completed_at / outcome / retry_lineage / actual_execution_snapshot / receipt_refs`を持つ。起動前拒否は`InvocationDenied`等として記録し、実際にproviderが起動したというreceiptを作らない。実行後にmodelやprofileが判明した場合は出典付き追補を行い、当初のrequested値を上書きしない。
- 採択済み関連要求（部分関係）: HELIXOS-L2-018, HELIXOS-L2-019, HELIXOS-L2-020。L2-018はassignment/attemptと実行結果を追跡、L2-019は拒否/未実行を成功証拠から分け訂正履歴を保持、L2-020はdenied/interrupted/staleを区別する。
- 行ごとの未完条件: Attempt全field schema、InvocationDenied相当の記録形式、requested値を不変にしたactual値追補の時系列/証拠oracleは未確認。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001524 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:161` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:9f0c643a34432312fa8e4c8fd16ae186ee1beca9333f7f9d260ac60e58608aaa`; physical line bytes SHA-256 `sha256:ab63bdfd62459730f35dcc6e4422beae75aad491d7bcb5538c6ad6141d455ef6`.
- 旧source bytes:
  > MeasurementRequestは、trigger/event ref、subject snapshot、reason、requested mode、実験定義ref、scope/security eligibility、dedupe key、max attempts、予算予約ref、deadline、状態を持つ。ここから既存schedulerへ渡す際、新規実行が必要な場合だけ作業Ticket/Assignmentを合成する。
- 採択済み関連要求（部分関係）: HELIXOS-L2-017, HELIXOS-L2-018, HELIXOS-L2-022, HELIXOS-L2-024。L2-017のticket/workflow、L2-018のassignment、L2-022/024の観測→LABO提案→OS登録受渡しに関係する。
- 行ごとの未完条件: MeasurementRequest schema、dedupe/max attempts/budget/deadline/eligibility fields、既存schedulerへのroute、実行要否判定とTicket合成条件を採択L2/L11へ割当てられていない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001539 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:181` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:8f63dc3ec662327c3d691fbb22ee8f516c33b031ab56874e483cbca306d93030`; physical line bytes SHA-256 `sha256:9f5ac320ff831a581ed63fe20c17995909213ededc62cfbec6f42bbbc0072627`.
- 旧source bytes:
  > 同じTicketから新たな実験を生成できるが、`live`の全eventが自動的に追加実験になるわけではない。完了後の修正patch、review答え、hidden oracleを再実行workerへ渡さない。
- 採択済み関連要求（部分関係）: HELIXOS-L2-017, HELIXOS-L2-018, HELIXOS-L2-019, HELIXOS-L2-022。L2-017はExperiment種別を通常開発から分離、L2-022はLABO評価・候補登録境界、L2-018/019は実行scope/evidenceを保持する。
- 行ごとの未完条件: 実験生成event eligibility、post-completion dataの除外/隔離、hidden oracle保護の具体negative oracleは未確認。実験ticketを付与すること自体は通常の観測からの自動実験を許可しない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001546 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:194` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:4527ce9aac3fd86479dd9031a99e1f8944876f31fad2b1d0fe027e4b30493345`; physical line bytes SHA-256 `sha256:7413963236359e63fe46c31f9fef9a80a4f30c5922446e7f04656359020cb447`.
- 旧source bytes:
  > 要求・要件正本、Design/PLAN、Ticket、Assignment、Attempt、Measurementを分離する。PLANの原子的変更統制は維持する。1 PLANから複数Ticketへ分解する場合も、各責務・成果物・受入・集約条件を明示し、Ticketを理由に巨大なPRや新しいWBS正本を正当化しない。
- 採択済み関連要求（部分関係）: HELIXOS-L2-016, HELIXOS-L2-017, HELIXOS-L2-020, HELIXOS-L2-023。L2-016は各requirement/work/verification trace、L2-017はticket graphと受入義務、L2-020は検証、L2-023はhandoffを別単位で追う。L2D-S0-02 WBS Ledgerは2026-09-19 decisionで承認済みの管理記録基盤。
- 行ごとの未完条件: 各recordの情報分離、PLAN atomic-change、複数ticket分割時の責務/aggregation、巨大PRを正当化しないoracleはcurrent adopted L2/L11に行全体のexact traceなし。WBS Ledger承認はこの旧詳細の採択・正本化ではない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

### LEGACY-CAND-LINE-001556 — `source_relation_coverage_unresolved`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:214` / `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (asset row 814, line SHA-256 `f5ab012879b071f1443dff19f5dada1d0c186e421be76ef2483e367863cedee8`).
- source file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`; line content SHA-256 `sha256:f314c61e813df3af04124c8f0065d950c885b5ff8e041e20b7bff44e2b85ce64`; physical line bytes SHA-256 `sha256:c8d237f8518f891fd440cfb51fcb2969efb9b8c222e9bbfeab287491792a1294`.
- 旧source bytes:
  > requires/split_from/integrates/verifies/supersedes/recovery_forをtyped relationとして扱う。missing、cycle、自己依存、stale revision/receipt、方向不整合はfail-closeする。単なるIssue closeではなく、その依存契約が要求する完了dispositionと証拠を解決する。固定4階層や全順序を導入しない。
- 採択済み関連要求（部分関係）: HELIXOS-L2-016, HELIXOS-L2-017, HELIXOS-L2-019, HELIXOS-L2-023。L2-016は依存・unknown/stale edgeを保持し、L2-017はticket graph/依存を結び未解決依存でreadyにしない。L2-019/023はevidenceとhandoffを別記録し、Issue close/mergeをticket完了にしない。
- 行ごとの未完条件: requires/split_from/integrates/verifies/supersedes/recovery_for型一覧、cycle/self/direction validationとdependency-specific completion evidence oracleは未確認。単なるIssue close拒否だけではこのatom全体を閉じない。
- state: `historical_candidate` → `draft_candidate` / `preserved_pending_atomization`; successor IDs `[]`.

## 静的照合と限界

- JSONは#2353 cumulative row recordと旧archiveの各physical line bytesを再照合する。asset disposition row 814もsource asset IDとline SHAで固定する。
- #2354選定済み集合とのintersectionは0。選定IDは昇順で連続20件。
- 採択revisionの根拠は2026-09-28 PO decision recordであり、candidate本文/MPR registerの過去metadataから採否を推定しない。該当legacy atomを明示して対応づけたadmitted receiptがないため、現行L2/L11への一般関係はcoverage完了ではない。
- 旧source closure、meaning disposition/retire、後続要求ID割当て、L3移行、Stage 5/6完了、実装・CI・受入実行は主張しない。旧CLI/runtime/hook/test/CIは実行していない。
