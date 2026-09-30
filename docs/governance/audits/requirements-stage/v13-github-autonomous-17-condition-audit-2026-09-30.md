# v1.3 §6 GitHub自律運用 17条件のStep5個別監査

- 基準main: `0eabc8c56f528236892f4f79f10f1553049b698b`
- 固定比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 後発decision source revision: `318ec4a04abb3c1cc17111b3d939f913facd5fd3`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`（SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）
- queue: `v13-condition-closure-work-queue-2026-09-30.json`（SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`）
- 条件数: 17（17件すべて `unresolved_for_closure_work` / `primary_residual`）
- §6 group 25のqueue全行はこの17件で、追加の同group残差は0件。
- authority effect: `none`。採択・successor・closure・L11実行/受入を主張しない。

## 対象範囲とqueue

母集団303 condition rowsのうちprimary residualは255件（partial 84、unresolved 171）。queue section group 25「§6 GitHub自律運用」は17件で、全件がunresolved primary residual。全件の個別audit refは0件。原文の物理行と行hashをraw archive bytesから再計算して照合した。v1.3 source snapshotのledger stateは`preserved_pending_atomization` / `source_snapshot_preservation`、人間判断はpendingである。

対象source-qualified IDs: `REQSRC-SUP-00398`, `REQSRC-SUP-00399`, `REQSRC-SUP-00400`, `REQSRC-SUP-00403`, `REQSRC-SUP-00404`, `REQSRC-SUP-00405`, `REQSRC-SUP-00407`, `REQSRC-SUP-00409`, `REQSRC-SUP-00410`, `REQSRC-SUP-00411`, `REQSRC-SUP-00414`, `REQSRC-SUP-00418`, `REQSRC-SUP-00421`, `REQSRC-SUP-00424`, `REQSRC-SUP-00430`, `REQSRC-SUP-00431`, `REQSRC-SUP-00432`.

過去のv1.3個別比較では、§4.2 policy/resolver/registry、§4.6 package/consumer、§4.11 security brokerのexact source-qualified ID群を除外した。各artifact SHAとID一覧はJSONの`prior_individual_audit_exclusions`にある。対象17件にはいずれもその監査のsource identity重複がない。

## 旧sourceとconsumer

旧sourceは§6 lines 514–555。全体SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`。個票ごとの原文物理行・line SHA-256・tupleは下記に固定した。旧asset ledgerは `LEGACY-ASSET-02319C2481B9E01698D5`（ledger row 956）で、source snapshot保持は対象revisionの採択を意味しない。

旧consumerの読取証拠（ファイル全体SHAと主要節の物理行・行SHA）はJSON `basis.legacy_consumers` に記録した。読んだ対象はGH-FR-001–017のautonomous operations、GH-FR-018–023 merge admission、GOP-FR-01–14 projection、GH-FR-024–028 atomic development/GH-AC-035–040、GH-FR-029/GH-AC-041 security admission、GOP-T-01–11、GH-T-035–040、GH-T-041の旧acceptance/system-test設計、DDD/TDD rulesである。旧test designはoracle設計として参照しただけで実行していない。

## 現行運用と固定f6 pair

現行GitHub運用model `docs/governance/github-upstream-operating-model.md`（SHA `1cb8ed88d4f0e65b37674f692d5fe391c7c5c4b3f482e60c86e160609a8c46a1`）のlines 112–158, 213–217を読み、作成側とreview_mergeの分離、exact base/content HEAD、`stale=0`、明示merge/read-after、旧CI/old harness-checkを合格条件にしない境界を確認した。HELIX-OS L2 `docs/helix-os/L2-requirements/governance-requirements.md`（SHA `bde0dcc4640e7afcf73fbc431d01ee3082fe6fda79c8d1b93b9572507037e3bf`）lines 113–121ではticketを正本、Issue/PRを映しとし、CI orchestrationをOSの検収へ置く。

固定f6 target rows/section hashesはJSON `basis.fixed_f6_pairs` に含めた。比較対象はHARNESS-L2-005/006/010/011、HELIXOS-L2-021、HELIXSECURITY-L2-008/010/013/023。固定L2/L11/decisionのexact revisionだけを比較し、旧source row自体への採択・successorを示さない。

| 現行pair | 限定比較範囲 |
|---|---|
| HARNESS-L2-005 | ticket・Forward size・pair・connector・change/layer/riskから検証義務とCI規則を導出。旧3段 topologyの採択ではない。 |
| HARNESS-L2-006 / HELIXOS-L2-021 | 外部提供サービスのscope/version/dependencyと、HARNESS構成版のproject配布・更新・復旧。旧GitHub operations workflowの代替ではない。 |
| HARNESS-L2-010 / 011 | pack収載/除外・version/dependencyと画面に依存しない呼出し契約。PR workflow、GitHub projectionの全oracleを所有しない。 |
| HELIXSECURITY-L2-008 / 010 / 013 / 023 | 操作単位のauthority、更新受入、artifact identity/provenance、更新/admission/promotionのstage separation。旧GH-FR-029の全scanner profile/coverage admissionを一括解決しない。 |

## 後発decisionの全identity/status screen

JSON `basis.later_full_identity_status_screen` は57 decision rowsと別11 decision rowsの全ID、status、decision row text/hashを固定する。57件は42 adopted / 11 conditionally adopted / 4 held。別11件は10 adopted rowsと`HARNESS-L2-049` current revision not adoptedの11 screen entriesであり、57件側と重複するidentityも別行として残す。採否は各decisionのexact revision/scopeに限定する。

本件と近接する後発pairも、採択・条件付き採択されたrevisionと決定scopeに限って評価する。HARNESS-L2-035はticket scope導出、036は検証parity、042はrefactor episode分類・routing。いずれもGitHub Projectsのreadability、旧merge receipts、旧3段CI、atomic development全文を代替しない。OS-049はWorker状態区分と低干渉task割当の条件付き採択で、READY、依存・順序・deadline・scope・single-writer/authority lease・path競合、後段の検証義務/担当/capacity確保を割当前に維持する。task自身のreview/merge完了は割当条件ではなく、固定Worker数や旧pool/runtimeも含めない。OS-050はtypedなreview待ち件数・待ち時間・rework占有率・reviewer稼働率と原因を用いたreviewer capacity調整・backpressureの条件付き採択であり、capacity増枠からmerge/branch変更/Ready権限を生まない。既存review_merge担当は既存admission後にmerge可能。SECURITY-029..034は個別security sliceの範囲に限られ、旧GH-FR-029のscanner coverage/profile全体を閉じない。別11 recordは全件status screenに残し、source-row対応が確認できるものだけを近接判定へ使った。

## R2411-01後発OS pairの限定効果

57候補decision record（revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`）のHELIXOS-L2-034/035/046/051/052を全screenに加えて、各決定行hashとL2/L11 file hash・section digestを固定した。HELIXOS-L2-034は原指示/finding dispositionの証拠と異議履歴、HELIXOS-L2-035はPR lifecycle event intakeと監査job要求の冪等生成、HELIXOS-L2-046はdispatchからmerge admissionまでの対象・authority・HEAD/revision・scope・既存検証義務/結果の連続照合に限る。HELIXOS-L2-051はCursor作成専用／適用根拠のある要求・設計taskへのClaude優先という条件付きscopeに限る。HELIXOS-L2-052はmerge後local cleanupと後続PR再照合に限り、remote ref削除を許可しない。削除は対象repository/refとdelete作用を含む既存authorityを必要とする。

00399/00400ではcurrent HEAD reviewと明示mergeを現行GitHub modelおよび採択HELIXOS-L2-046の境界で保持する一方、旧CI/DB receiptやAI-B固定主体を現行の同一条件とは扱わない。現行CIは未構築であり、旧CI実行/greenは根拠にしない。00398のfinding disposition残差はHELIXOS-L2-034の適用scope分だけ絞ったが、旧finding route全体、5 outcome closure、issue-to-memory/DB episodeは閉じない。00418ではHELIXOS-L2-051のtask配置、HELIXOS-L2-046の遷移照合、HELIXOS-L2-052のmerge後local cleanup/rechainを区別し、いずれも旧PR writer lease primitiveやtakeoverを採択・実装したとは扱わない。

## 条件別照合

### REQSRC-SUP-00398 — 旧source line 516

- 原文: `docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md`を既存GitHub要件、`docs/design/helix/L3-requirements/github-merge-admission-requirements.md`を同一HEAD merge admission拡張として採用する。Issue→PLAN→branch→PR→CI→merge→tag→memory/DBを一episodeとして閉じる。mainはPR-only、strict aggregate `harness-check`、bypassなし、人間approval不要、AI-A（作成・blocker修正）とread-only AI-B（監査・finding disposition・merge判断）の2実行主体、同一HEAD文脈レビューreceipt、DB追従receiptを必須とする。AI-Bは編集・push・Ready化を行わず、blockerを一括返却する。current contract内で局所的に閉じるcorrectness/security findingはAI-Aがcurrent PRで修正し、独立責務・別設計・lifecycle・性能改善だけを後続Issueへ送る。CI greenだけではmergeを許可せず、push・base更新・正本digest変更で両receiptをstale化する。Issue closeは同要件GH-FR-017に従い、通常は終端PRの`Closes #N` mergeだけで行う。`resolved / rejected / quarantined / superseded / cancelled`を別outcomeとして保持し、証拠付き不採用も終端decision PRでclose可能とする。AI単独のmanual closeは禁止し、superseded/cancelledはPO decision、全outcomeはcurrent closure receiptと子Issue dispositionを要求する。（line SHA-256 `sha256:7149cc77fc6a937a6d20d1dd1999550d24d1726c84f1e4d996433f160e107841`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-005`, `HARNESS-L2-010`, `HARNESS-L2-011`, `HELIXOS-L2-021`, `HELIXSECURITY-L2-008`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: HELIXOS-L2-049（conditionally_adopted）：状態区分と低干渉task割当の条件付き採択。設定上限と割当可能／割当中／実行中／遊休／検証待ち／統合待ち等を分ける。READY ticketの依存・順序・deadline・scope・single-writer/authority lease・changed-path競合と、後段検証義務／担当／実施capacityを割当前に保つ。task自身のreview/merge完了をassignment前提にしない。OS単独でlow-impactを定義せず、配置案と既存scope/競合情報を用いる。固定Worker数、旧pool/queue/provider/runtime/CI/PR/DBは持ち込まない。；HELIXOS-L2-050（conditionally_adopted）：review待ち件数／待ち時間／rework占有率／reviewer稼働率をtyped閾値と照合し、reviewer capacity不足が主因で他のdownstream詰まりがない場合だけ上限内の別対象review assignmentを増やす。原因別backpressure、重複主review拒否、HEAD変更時の新世代review、active lease保全を含む。増枠はmerge条件を緩めず、新merge／branch変更／Ready権限を生まない。既存review_merge担当は既存admission後にmerge可能。具体threshold／provider／reviewer数は新設しない。
- 保持点: 現行GitHub modelの作成側／独立review側の分離、exact base/content HEAD review、stale=0後の明示merge/read-afterに加え、採択HELIXOS-L2-046はdispatchからmerge admissionまでの対象・authority・HEAD/revision・scope・既存検証義務/結果の連続照合を保持する。HELIXOS-L2-034はfindingの証拠付きdispositionと異議履歴、HELIXOS-L2-035はPR event intakeと監査job要求の冪等性を、それぞれ限定scopeで保持する。
- 変更・引継がない点: AI-A/AI-Bという固定主体、harness-check、CI/DB/タグ/Memoryまでの統合episode、通常closeをCloses #Nに限る規則は現行契約へそのまま持ち越さない。approval要件は対象の意味・作用に応じたauthorityから読む。
- 残差: HELIXOS-L2-034は旧FR17/18–23の全finding classification・current_pr_fix/successor routing・5 outcome closure receiptを閉じない。HELIXOS-L2-035はeventからaudit job requestを作るまでであり、Issue→PLAN→branch→PR→CI→merge→tag→memory/DB全episode、DB追従receipt、monitoring/consumer closureを与えない。HELIXOS-L2-046はその接続条件であり、このsource identityのformal successorではない。
- 反例: PR reviewをpassにしても別の必要な人間decisionを満たさない。Issue merge/closeだけでticketを完了にしない。
- 数値・例外境界: 同一HEAD、別base/content HEAD、push後stale、5つのclosure outcomeとPO判断例外を別fixtureで確認する。
- R2411-01後発OS pairの限定比較: HELIXOS-L2-034/035/046/051の近接比較：HELIXOS-L2-034はfindingの根拠付きdisposition・異議/再開履歴、HELIXOS-L2-035は選択scope内event intakeと冪等job要求、HELIXOS-L2-046は遷移間のauthority/HEAD/scope/verification継続性、HELIXOS-L2-051は条件付きtask配置に限定。旧5 outcome、current_pr_fix/successor全routing、tag/memory/DB連結は残差。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00399 — 旧source line 518

- 原文: 2026-07-24のPO判断により、承認前でも非正本Draft PRをreview proposalとして許可するが、Ready化・mergeは必要な承認と（line SHA-256 `sha256:f1ba4b8bbc99629b666e904c615066398aee41f0ffed1c5616a37cff7666f817`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-005`, `HELIXSECURITY-L2-008`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: HELIXOS-L2-049（conditionally_adopted）：状態区分と低干渉task割当の条件付き採択。設定上限と割当可能／割当中／実行中／遊休／検証待ち／統合待ち等を分ける。READY ticketの依存・順序・deadline・scope・single-writer/authority lease・changed-path競合と、後段検証義務／担当／実施capacityを割当前に保つ。task自身のreview/merge完了をassignment前提にしない。OS単独でlow-impactを定義せず、配置案と既存scope/競合情報を用いる。固定Worker数、旧pool/queue/provider/runtime/CI/PR/DBは持ち込まない。；HELIXOS-L2-050（conditionally_adopted）：review待ち件数／待ち時間／rework占有率／reviewer稼働率をtyped閾値と照合し、reviewer capacity不足が主因で他のdownstream詰まりがない場合だけ上限内の別対象review assignmentを増やす。原因別backpressure、重複主review拒否、HEAD変更時の新世代review、active lease保全を含む。増枠はmerge条件を緩めず、新merge／branch変更／Ready権限を生まない。既存review_merge担当は既存admission後にmerge可能。具体threshold／provider／reviewer数は新設しない。
- 保持点: 旧行の「必要承認後」「current HEAD review後」「Ready/merge境界」は、現行GitHub modelのexact base/content HEAD review、stale=0・必要decision/admission再照合と独立の明示merge/read-afterで保持される。採択HELIXOS-L2-046もdispatch・実行・Ready・merge admission間でHEAD/revision・authority・scope・検証義務/結果が変わればstale/未完へ戻し、再照合することを定める。
- 変更・引継がない点: 旧条件の「承認前でもproposalを出せる」は残すが、旧CI/DB receiptは現行条件でない。Draftは要求採択や操作許可を生まない。
- 残差: 旧CI/DB追従receipt、AI-Bという固定主体、Draft→Readyに必要な旧workflow gateは現行の同一条件としては持ち越さない。CIは未構築であり、CI greenやDB receiptを実行済み条件として仮定しない。HELIXOS-L2-046は現在の適用契約の検証義務を照合する接続条件で、旧CI/DB形式やsource row successorを定めない。
- 反例: Draft PRの作成やCI greenからPOの要求意味判断を生成しない。
- 数値・例外境界: 未承認proposalと必要decision未解決の例で、Draft可・Ready不可を区別する。
- R2411-01後発OS pairの限定比較: HELIXOS-L2-046採択scopeでは、dispatch・実行・Ready・merge admissionを通じ対象、authority、HEAD/revision、scope、既存検証義務/結果を再照合し、変化時はstale/未完に戻す。現行GitHub modelのexact HEAD review、stale=0、必要admission後の明示mergeを保持する。旧CI/DB追従receiptは持ち越さず、新世代CIも未構築。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00400 — 旧source line 519

- 原文: current HEADのAI-B review、CI、DB追従後に限定する。native auto-mergeは禁止し、AI-Bが証拠を再照合して明示mergeする。（line SHA-256 `sha256:30047b8e7135ee4974231c6224322ecde6ff7902f89a3157a8773e04b487df1d`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-005`, `HARNESS-L2-010`, `HELIXSECURITY-L2-008`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: HELIXOS-L2-049（conditionally_adopted）：状態区分と低干渉task割当の条件付き採択。設定上限と割当可能／割当中／実行中／遊休／検証待ち／統合待ち等を分ける。READY ticketの依存・順序・deadline・scope・single-writer/authority lease・changed-path競合と、後段検証義務／担当／実施capacityを割当前に保つ。task自身のreview/merge完了をassignment前提にしない。OS単独でlow-impactを定義せず、配置案と既存scope/競合情報を用いる。固定Worker数、旧pool/queue/provider/runtime/CI/PR/DBは持ち込まない。；HELIXOS-L2-050（conditionally_adopted）：review待ち件数／待ち時間／rework占有率／reviewer稼働率をtyped閾値と照合し、reviewer capacity不足が主因で他のdownstream詰まりがない場合だけ上限内の別対象review assignmentを増やす。原因別backpressure、重複主review拒否、HEAD変更時の新世代review、active lease保全を含む。増枠はmerge条件を緩めず、新merge／branch変更／Ready権限を生まない。既存review_merge担当は既存admission後にmerge可能。具体threshold／provider／reviewer数は新設しない。
- 保持点: current HEADのreviewと証拠再照合、native auto-mergeを使わない明示mergeは、現行modelのexact base/content HEAD、stale=0、必要authority/admission照合、`gh pr merge --merge`とpost-merge read-afterにより保持される。採択HELIXOS-L2-046は遷移中の対象・authority・HEAD/scope・既存verification義務と結果の変化をstale/未完として再照合する。
- 変更・引継がない点: 保持点は強い。旧AI-B/CI/DB要件は現行のexact HEAD、stale=0、base/head/main read-after、必要decision照合に置き換わる。
- 残差: 旧CI・DB追従receiptとAI-B固定主体は現行要件としては不採用/未移管。新世代CIは未構築のため、旧CI greenをmerge根拠にしない。HELIXOS-L2-046単体は明示merge命令を実行する権限でも旧DB receiptの代替でもない。
- 反例: 作成側が自分のPRをmergeする。native auto-mergeを予約する。
- 数値・例外境界: review済みHEAD後のbase driftまたはmerge親不一致がある場合はmerge/close完了扱いにしない。
- R2411-01後発OS pairの限定比較: HELIXOS-L2-046は遷移間のscope/authority/HEADと適用中の検証結果の再照合を採択scope内で保持する。明示merge/native auto-merge禁止は現行GitHub modelの別責務として保持。HELIXOS-L2-046だけからmerge権限や旧CI/DB証拠を導かない。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00403 — 旧source line 522

- 原文: AWS ECS Fargate + CDK TypeScript、DB要件があるfixtureだけRDS PostgreSQLとする。production resource作成は（line SHA-256 `sha256:b7f06af488e8f189bc52c2ac3be3c3f89978c1257dfeb90acc850062b3504c41`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-006`, `HELIXOS-L2-021`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: 近接decisionなし（57＋11全identity/statusはJSON full screenに記録）
- 保持点: HARNESS-L2-006は外部提供サービスごとのscope/version/dependency/導入条件を所有し、OS-021はHARNESS構成版のproject配布・更新・復旧を扱う。
- 変更・引継がない点: 固定f6条件はAWS、CDK、RDSをtechnology/profileとして採択しない。現行提供・管理境界を旧プロバイダ選定へ狭めない。
- 残差: 採用対象のruntime/cloud/provider選択およびDB fixture applicabilityの意味はこの近接pairでは確定しない。
- 反例: DB不要fixtureへRDSを必須化する、または旧AWS構成を現行推奨/承認済みとする。
- 数値・例外境界: DB有無の違うfixtureと別providerを与え、旧profileをauthority扱いせず条件適用を確認する。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00404 — 旧source line 523

- 原文: action-binding approval境界を維持する。（line SHA-256 `sha256:12a5b826d206e3bc696410413181d8eb0b0de6c10d6591f169d4b80b46690f14`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HELIXSECURITY-L2-008`, `HELIXSECURITY-L2-010`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: HELIXOS-L2-049（conditionally_adopted）：状態区分と低干渉task割当の条件付き採択。設定上限と割当可能／割当中／実行中／遊休／検証待ち／統合待ち等を分ける。READY ticketの依存・順序・deadline・scope・single-writer/authority lease・changed-path競合と、後段検証義務／担当／実施capacityを割当前に保つ。task自身のreview/merge完了をassignment前提にしない。OS単独でlow-impactを定義せず、配置案と既存scope/競合情報を用いる。固定Worker数、旧pool/queue/provider/runtime/CI/PR/DBは持ち込まない。；HELIXOS-L2-050（conditionally_adopted）：review待ち件数／待ち時間／rework占有率／reviewer稼働率をtyped閾値と照合し、reviewer capacity不足が主因で他のdownstream詰まりがない場合だけ上限内の別対象review assignmentを増やす。原因別backpressure、重複主review拒否、HEAD変更時の新世代review、active lease保全を含む。増枠はmerge条件を緩めず、新merge／branch変更／Ready権限を生まない。既存review_merge担当は既存admission後にmerge可能。具体threshold／provider／reviewer数は新設しない。；HELIXSECURITY-L2-029（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。；HELIXSECURITY-L2-030（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。
- 保持点: SECURITY-L2-008はread/write/execute/network/install/delete/merge/release/deploy/security change等の操作ごとにactor/target/operation/revision/environment/scope/expiryを束縛する。
- 変更・引継がない点: 旧AWS resource作成だけの形式に閉じず、現行は不可逆な外部作用・release/tag/cutoverなどの明示対象permissionを照合する。
- 残差: resource creationのaction snapshot schemaは近接security pairだけでは定まらず、必要なscope/approval evidenceの具体化が残る。
- 反例: 一般的なGitHub/Issue/CI権限からproduction resource createを許可する。
- 数値・例外境界: actor・target・operation・revision・environment・scope・expiryの欠落/driftを個別に拒否する。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00405 — 旧source line 525

- 原文: 工程のGitHub投影は`docs/design/helix/L3-requirements/github-operations-projection.md`（line SHA-256 `sha256:47f7c040f19df4712781daa63468569ed459d0eb224b179884771024c49a83f8`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-006`, `HELIXOS-L2-021`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: 近接decisionなし（57＋11全identity/statusはJSON full screenに記録）
- 保持点: 現行ではticketが正本、GitHub Issue/PR/Projectは可読性・共有用projection。HARNESSは工程規則を所有し、OSはproject management/ticketing/CI orchestrationを行う。
- 変更・引継がない点: 旧projectionのharness.db正本・Project/Issue API schema/各GOP IDをcurrent authorityとして持ち越さない。
- 残差: current ticket-to-GitHub projection field/direction, drift/read-back, board availability oracleは別のOS contract/acceptanceから要件単位で確認する。
- 反例: GitHub Project stateからticket/requirement approval/completionを逆生成する。
- 数値・例外境界: GitHub Issueを編集してもlocal ticket/requirement authorityが変化しないnegative case。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00407 — 旧source line 527

- 原文: read側projection（一方向同期）であり、GitHub側編集の正本逆流はIssue admission経由のみとする。（line SHA-256 `sha256:2ef5921825acd2b5f9acb44375e8f1f03e219b6bff945808ec6bee2bd38f1824`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-006`, `HARNESS-L2-010`, `HELIXOS-L2-021`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: 近接decisionなし（57＋11全identity/statusはJSON full screenに記録）
- 保持点: 現行ticketが正でGitHub Issue/PRは映し。外部入力は明示操作scopeとhuman/source authorityに従い、GitHub statusから要求 meaning/approval/completionを作らない。
- 変更・引継がない点: 現行一方向投影は旧harness.db schema・Issue admission exact routeと同一ではない。
- 残差: 各project object、repository event、PR outcomeのwrite-back allowlistと原event preservationは静的要求で個別確認が必要。
- 反例: Issue title/status/PR mergeを正本要求変更・採否・完了へ自動反映する。
- 数値・例外境界: GitHub payloadの異動・欠落・重複・改ざんを与え、ticket authorityを不変にする。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00409 — 旧source line 529

- 原文: 人間はProjects boardとIssue階層から追加ツールなしでactive frontierを読める。CIは3段の重み配分（line SHA-256 `sha256:f450ae4c983496da829940084669dcef701593ced8ac8added3a330347a743c9`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-006`, `HARNESS-L2-010`, `HELIXOS-L2-021`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: 近接decisionなし（57＋11全identity/statusはJSON full screenに記録）
- 保持点: 現行OS管理viewはproject/ticket状態を再構成可能にする。GitHubは必要に応じ同期されるprojectionであり、要求状態のauthorityではない。
- 変更・引継がない点: 追加tool不要という旧UX、特定Projects board/Issue hierarchyを採択済みUI契約としない。dashboard/viewの意味もaccepted L2/UIとして主張しない。
- 残差: 対象user/view/required field/refresh age/accessibility/read failure oracleは近接pairにない。
- 反例: dashboard表示でactive frontierが見えることだけからticket readiness/completionを決める。
- 数値・例外境界: stale/missing/conflicting projectionを画面へ与え、unknown状態を完了やactiveへ埋めない。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00410 — 旧source line 530

- 原文: （外部PR CI=typecheck+変更影響targeted+critical gate、full回帰と全gate=merge後内部CI+nightly、（line SHA-256 `sha256:30558a7370b58c5fa840bca39c76419517ad42166cb9c5357ab05c02f785b0e2`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-005`, `HARNESS-L2-010`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: HARNESS-L2-036（adopted）：検証parityの範囲に限る。旧3段CI mappingやmerge workflowの閉包は含まない。；HARNESS-L2-042（adopted）：refactor episodeの分類・routingに限る。GH-FR-024..028の全atom coverageは与えない。
- 保持点: HARNESS-L2-005はCI段数固定に依存せず、ticket relation/Forward size/V-pair/connector/change kind/layer/riskから義務を動的に導出し、OSが組立て・運転する。
- 変更・引継がない点: 旧3段/重み配分や旧workflowのexternal/internal/nightly topologyはfixed L2/L11では不採択。現行はmerge後full/nightlyを既定にしない。
- 残差: 採択HARNESS-005のdynamic profileと旧3段のmapping、省略oracle/期限/差戻し/後続ticket回収の全条件を各scopeで比較する。
- 反例: Forward-small PRを常に軽量化する、旧3 stageを再現必須とする、merge後/nightlyを旧CIで実施したことにする。
- 数値・例外境界: 同じForward sizeでも認証/security/release riskなら強い検査を導き、scope外やunknown oracleで止める。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00411 — 旧source line 531

- 原文: 無根拠なgate削除・閾値緩和による軽量化は禁止）とする。（line SHA-256 `sha256:99d857ff3a305d48b97c1072743c5d8aa2be2eec40f63d5e11433dbd2e21984b`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-005`, `HARNESS-L2-010`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: HARNESS-L2-036（adopted）：検証parityの範囲に限る。旧3段CI mappingやmerge workflowの閉包は含まない。；HARNESS-L2-042（adopted）：refactor episodeの分類・routingに限る。GH-FR-024..028の全atom coverageは与えない。
- 保持点: HARNESS-L2-005はrequired oracle欠落、unknown→N/A、無根拠な導出、scope外変更を不成立にし、CIはrequirements由来の検証義務を表す。
- 変更・引継がない点: 旧閾値/gate数そのものを固定しない。正当な変更は新revisionの要求/decisionとoracle/evidenceで説明する。
- 残差: gate mutation/threshold update approval/evidence lifecycleは、CI未構築ゆえ現在runtime factでなく将来要求として特定する。
- 反例: thresholdを少しだけ下げれば従来の合格契約が保たれると仮定する。
- 数値・例外境界: 必須oracleの削除、unknownをskipに変更、測定母集団/閾値のみ変更の各反例。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00414 — 旧source line 535

- 原文: `docs/design/helix/L3-requirements/github-atomic-development-requirements.md`（line SHA-256 `sha256:5130bdaad1fb15f53411d91416d617c891515b1a04c3d5cd0531f899d46d5287`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-005`, `HARNESS-L2-010`, `HARNESS-L2-011`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: HARNESS-L2-035（adopted）：ticket／scope導出の範囲に限る。GitHub PR class、review receipt、CI topology、Issue closureのoracleは含まない。；HARNESS-L2-036（adopted）：検証parityの範囲に限る。旧3段CI mappingやmerge workflowの閉包は含まない。；HARNESS-L2-042（adopted）：refactor episodeの分類・routingに限る。GH-FR-024..028の全atom coverageは与えない。
- 保持点: HARNESS-L2-005のticket/layer/pair/risk由来CI義務、現行scope・exact HEAD review・独立laneを近接比較する。
- 変更・引継がない点: 原子PRの詳細を旧GH-FR test IDsだけで要求したり、段階的CIの旧配置を移植しない。
- 残差: one contract/owner、path family/changed-path set、mini-refactor/rollback等の各atomが現行L2/L11に個別oracleを持つか未閉包。
- 反例: 同一PR内に独立behavior/owner/pathを混ぜても行数が少ないからpassとする。
- 数値・例外境界: 一つのbehavior contractに2 owners、1 ownerに無関係複数 contracts、予定外path、必須PLAN/test companion欠落。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00418 — 旧source line 539

- 原文: exactly-one PR writer leaseを同一HEADへ束縛する。memory takeover通知だけではwrite ownershipを移譲しない。（line SHA-256 `sha256:411752ce28dd2fbdd9caeff9ff639d2297e56b55993b1114e0b69e2bdaa7f512`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-011`, `HELIXSECURITY-L2-008`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: HELIXOS-L2-049（conditionally_adopted）：状態区分と低干渉task割当の条件付き採択。設定上限と割当可能／割当中／実行中／遊休／検証待ち／統合待ち等を分ける。READY ticketの依存・順序・deadline・scope・single-writer/authority lease・changed-path競合と、後段検証義務／担当／実施capacityを割当前に保つ。task自身のreview/merge完了をassignment前提にしない。OS単独でlow-impactを定義せず、配置案と既存scope/競合情報を用いる。固定Worker数、旧pool/queue/provider/runtime/CI/PR/DBは持ち込まない。；HELIXOS-L2-050（conditionally_adopted）：review待ち件数／待ち時間／rework占有率／reviewer稼働率をtyped閾値と照合し、reviewer capacity不足が主因で他のdownstream詰まりがない場合だけ上限内の別対象review assignmentを増やす。原因別backpressure、重複主review拒否、HEAD変更時の新世代review、active lease保全を含む。増枠はmerge条件を緩めず、新merge／branch変更／Ready権限を生まない。既存review_merge担当は既存admission後にmerge可能。具体threshold／provider／reviewer数は新設しない。
- 保持点: 現行は作成側が差分編集・push・Ready化し、review_merge側はread-only reviewとadmission後の明示mergeを担う。HELIXOS-L2-051の条件付きtask配置は一部作成／review適性の条件を示すだけで、HELIXOS-L2-046は各遷移のscope/authority/head確認、HELIXOS-L2-052はmerge後のlocal owner-bound cleanupと後続PRの再照合を扱う。
- 変更・引継がない点: lease primitive/memory handoff/old provider runtimeは現行運用根拠としない。作成/ review laneという責務は意味再導出される。
- 残差: これらの採択scopeは旧exactly-one writer lease primitive、lease発行・失効・更新・takeover、memory通知と権限の分離を実装/受入済みとしない。HELIXOS-L2-052はremote refの削除を許可しない。削除には対象repository/refとdelete作用を明示する既存authorityが要る。
- 反例: mailbox notification/ACK/worker name/session wakeupでwrite authorityを移譲する。
- 数値・例外境界: 2 writers、takeover message without authorization、owner revocation後pushの反例。
- R2411-01後発OS pairの限定比較: HELIXOS-L2-051は条件付きのtask適性配置に限り、HELIXOS-L2-052はmerge後のlocal owned-worktree/branch cleanupと後続PR recheckに限る。HELIXOS-L2-052はremote ref削除を許可せず、対象refとdelete作用を明示する既存authorityが必要。いずれも旧single-writer leaseの発行/失効/takeover primitiveを埋めない。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00421 — 旧source line 543

- 原文: `docs/design/helix/L3-requirements/github-security-admission-requirements.md`（line SHA-256 `sha256:57ef2f0491fba9763b17fcdefe9dd9e2dab3bcbb6228280ca3c54b1fd9479414`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-005`, `HELIXSECURITY-L2-008`, `HELIXSECURITY-L2-010`, `HELIXSECURITY-L2-013`, `HELIXSECURITY-L2-023`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: HELIXSECURITY-L2-029（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。；HELIXSECURITY-L2-030（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。；HELIXSECURITY-L2-031（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。；HELIXSECURITY-L2-032（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。；HELIXSECURITY-L2-033（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。；HELIXSECURITY-L2-034（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。
- 保持点: SECURITYの近接pairは操作authority、更新受入、artifact identity/digest/provenance、stage分離を扱う。HARNESS-005はticket/layer/riskから検証義務を導く。settings/action-bindingまたは不可逆な外部作用には現行規則上の人間承認境界がある。
- 変更・引継がない点: 近接Security IDsは旧Codex Security/CodeQL/secret scanner全体のcoverage admissionやGitHub settings applyのsuccessorではない。旧個別toolsをauthorityにしない方針はcurrent boundaryと整合。
- 残差: PR diff vs candidate deep vs deploy artifactのprofile差、required scanner coverage、waiver, finding disposition, permissions receiptの粒度ごとのcurrent L11 oracleは残る。
- 反例: scan greenを全部のscope/phase/ artifactで有効と見なす。GitHub settingsをCI greenだけで変更する。
- 数値・例外境界: 別HEAD/artifact、coverage partial/unknown、scanner missing/running、critical finding、expired waiver、settings write without exact action binding。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00424 — 旧source line 546

- 原文: 同一HEAD／artifactへ束縛してslice／merge／deploymentを判定する。Codex Securityのbeta availabilityや（line SHA-256 `sha256:854561288d0c37d4ba2abc051dae64fd008538c9fa5f9a8243c0e993b4297ae3`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-005`, `HELIXSECURITY-L2-010`, `HELIXSECURITY-L2-013`, `HELIXSECURITY-L2-023`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: HELIXSECURITY-L2-029（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。；HELIXSECURITY-L2-030（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。；HELIXSECURITY-L2-031（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。；HELIXSECURITY-L2-032（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。；HELIXSECURITY-L2-033（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。；HELIXSECURITY-L2-034（adopted）：各security候補の対象scopeに限る。旧GH-FR-029のscanner profile／coverage matrixを包括的に採択しない。
- 保持点: SECURITY-013/023近接はartifact provenanceとstage separation、SECURITY-008はoperation-scope authorityを保つ。
- 変更・引継がない点: 旧scanner製品名・各coverage threshold/profileはcurrent scanner choiceや合格基準にしない。
- 残差: artifactごとのrequired coverage matrix、beta/unknown状態のfail/hold、cross-scanner相殺拒否と各phaseのreceipt整合を明示した対象pairが見当たらない。
- 反例: 旧artifactと異なる同名artifactをscan、別scannerのgreenでpartialを相殺、beta unavailableをpassへ変換する。
- 数値・例外境界: 同一HEADだが別artifact digest、同じartifactでpartial/unknown coverage、beta missingのnegative cases。
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00430 — 旧source line 553

- 原文: （precondition/postcondition/invariant/failure）、L6/L7でRed→最小Green→Refactorをfreezeする。（line SHA-256 `sha256:89e93a33d998d78d6fae3221b327538ac57cf72b9435e8c19e0ca4b4fa6e93d6`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-005`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: HARNESS-L2-042（adopted）：refactor episodeの分類・routingに限る。GH-FR-024..028の全atom coverageは与えない。
- 保持点: 現行HARNESS-L2-005はverification/oracle obligations、L2/11 layer/pair and risk-derived CI. Old DDD/TDD source lines are read as engineering-rule consumers only; not executed.
- 変更・引継がない点: 旧G3 phase names/checklist or GitHub atomic PR stage is not a full replacement for current layer-specific V-process. No-code/refactor specifics must route through approved HARNESS semantics.
- 残差: pre/post/invariant/failure clauses and L6/L7 oracle/Red-Green-Refactor evidence by condition are not wholly described in H-005. Exact row remapping remains.
- 反例: CI green or code commit establishes TDD Red evidence or proves invariant without independent oracle.
- 数値・例外境界: missing precondition/postcondition, test unable to detect seeded defect, refactor changes external behavior without Backflow, or net code/CI increase lacking reason/removal condition.
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00431 — 旧source line 554

- 原文: Object-oriented DDDはidentity・lifecycle・invariantが必要な責務に限り、`none`と`pure_function`を正規選択肢とする。（line SHA-256 `sha256:e7b5f46f02832cd94d099a5c29d5d7733e83f8d52ced8a5be19fea3ff5e12c65`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-005`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: HARNESS-L2-042（adopted）：refactor episodeの分類・routingに限る。GH-FR-024..028の全atom coverageは与えない。
- 保持点: current L2-005 is tooling-independent and structured obligation-based; existing engineering rules align conceptually, but H-005 alone is not DDD candidate-selection acceptance.
- 変更・引継がない点: Do not require all objects to be classes/entities; old enum and heuristic only an input for a future exact scope contract.
- 残差: Decision oracle selecting none/pure_function vs object model with identity/lifecycle/invariants is not supplied by GH atomic L2/11 or H-005 fixed comparison.
- 反例: classify every utility or transformation as DDD entity; treat one abstract type/class as proof of domain modeling.
- 数値・例外境界: stateless mapping vs stateful lifecycle/invariant examples, and unjustified class proliferation.
- authority effect: `none`; adoption/successor/closure: false.

### REQSRC-SUP-00432 — 旧source line 555

- 原文: コードまたはCIの正味増加には理由と削除条件を必須とし、再発欠陥と既存検出gapがないdetector/gateを追加しない。（line SHA-256 `sha256:1690e3f99f97884ba0cab118b42954102c93dd007579c6d2908dc24358378136`）
- queue status: `unresolved` / `unresolved_for_closure_work`。既存個別比較ref: 0。
- 近接f6 pair: `HARNESS-L2-005`。個票hash pinsはJSONの該当pairを参照。
- 後発near decision: HARNESS-L2-036（adopted）：検証parityの範囲に限る。旧3段CI mappingやmerge workflowの閉包は含まない。；HARNESS-L2-042（adopted）：refactor episodeの分類・routingに限る。GH-FR-024..028の全atom coverageは与えない。
- 保持点: H-005 ties tests/gates to derived verification duty and disallows unexplained omitted tests; current GitHub model says old harness-check/CI green is not admission.
- 変更・引継がない点: Old gate package, thresholds, and assumed recurrence counts do not transfer; this source line sets evidence/rationale rather than numeric threshold.
- 残差: Detector/gate additions require trace to confirmed failure/gap, scope, expected detectability and retirement criterion; no quantified case threshold appears in this line.
- 反例: adding general-purpose gate “for later” with no recurrence or uncovered failure evidence, or keeping a gate after its trigger is removed without review.
- 数値・例外境界: Compare an evidenced recurring failure+existing gap against no recurrence/no gap; check reason and deletion condition.
- authority effect: `none`; adoption/successor/closure: false.

## 数値・例外・反例の横断境界

- 旧CIは3段（外部PR targeted/critical、merge後full/internal、nightly補完）だが、固定HARNESS-L2-005は義務をticket/Forward size/pair/connector/change/layer/riskから導出する。旧3段をそのまま再現しない。
- gate削除・閾値緩和は、required oracle、変更理由、decision、差戻し先を確認する。新世代CIは未構築なので旧workflowの合格・実行結果を代用しない。
- 旧atomic sourceは`1 behavior contract + 1 responsibility owner`とsame-HEAD exactly-one PR writer leaseを要求する。現行lane分離は近接するが、通知・ACK・session起床はwrite ownership receiptではない。
- review/DB receiptsのsame-HEAD拘束とpush/base/digest drift stale化は旧sourceの条件。現行はexact HEAD review、merge直前base/head再照合、`stale=0`を使い、旧DB sync receipt/harness-checkを要求しない。
- Issue outcomesは5種 (`resolved/rejected/quarantined/superseded/cancelled`) とPO exception。現行Issue/PR closeはticket完了を生成せず、この旧close protocolを継承したとはみなさない。
- security evidenceは同一HEAD/artifactに束縛し、beta/coverage partial/unknownを別scanner greenで相殺しない。外部settings/applyや不可逆operationは操作ごとのaction-binding approval boundaryで止める。
- 旧AWS ECS Fargate/CDK TypeScript/RDS fixture profileは歴史的reference条件で、現行provider選定ではない。DDD/TDD条件に数値閾値はない。

## 検証境界

静的検証はJSON parse、17件ID集合とMarkdown見出し集合の完全一致、queue/原文line-hash一致、固定f6 pair/後発decision pinsの読み取り整合、相対リンク、JSON内のhash表記とsource/consumer/pair row pin、`git diff --check`に限る。旧CI/runtime/test/CLI、現行CI、GitHub操作は実行していない。採択・successor・closure・L11実行/受入を生成しない。
