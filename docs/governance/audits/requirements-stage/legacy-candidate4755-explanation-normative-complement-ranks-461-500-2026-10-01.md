# Candidate 4755 説明行の規範語スクリーン補集合 ranks 461–500 意味監査

> 40 source rowを原文・line/asset ledger・固定F6 pair・decision pinsで静的照合した。採択、successor、受入実行、source closureは生成しない。

## 対象と導出

- 基点は `176b6ec7f3a3087369300f29aa6fc70e998c80b1`。#2353 の4,755 `row_records` に、#2356、#2360、#2363、#2366、#2367、#2368、#2369、#2381をexact source IDで適用し、effective classification `structure=926 / explanation=2965 / condition=864` を再構成した。
- 先行marker semantic review slices 13件のpositive IDsは255 unique rows。`2965 - 255 = 2710` marker-negative complementをnumeric source-ID suffix昇順でrank付けした。今回のID集合は `LEGACY-CAND-LINE-000755`〜`LEGACY-CAND-LINE-000814` の40行、選択ID SHA-256は `18cd0a7f133b9e916e11755c051483b137cda8fc13846602ee2a5fa73dd47e4a`。
- rank 460の隣接ID `LEGACY-CAND-LINE-000753` は別worktreeの未commit auditに存在し、今回のorigin/mainには含まれていない。統合時に先行sliceのcommit/path/hash pinを追加する。境界IDだけからrankを補完せず、前段sliceとの連続性を明示している。
- source-line ledger、asset ledger、archive source file、physical line bytesを40件で照合した。file/line/physical bytesのSHAとledger entry SHA、baseline・overlay・positive-slice・F6/decision pinsはpaired JSONに記録する。

## 行別意味と現行authority境界

|Rank|Source ID / archive line|分類・意味|marker-negative規範条件|F6／decisionとの関係|
|---:|---|---|---|---|
|461|`LEGACY-CAND-LINE-000755`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:28`|会話継続条件。会話外に保存した情報、後続consumerからの再取得、意味・版・未完義務の対応、安全な切替えが確認済みのscopeだけを後続model inputから除く条件。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|462|`LEGACY-CAND-LINE-000756`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:29`|source保全境界。inputからの除外は会話原本、Git履歴、監査証拠の削除を意味せず、反復要約を正本にしないというsource保持条件。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|463|`LEGACY-CAND-LINE-000758`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:33`|切替方式選択。task境界・compact反復・再読込不能・旧指示混入・切替費用を評価してsession継続、標準compact、新session再構成から選ぶ。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|464|`LEGACY-CAND-LINE-000759`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:34`|provider能力境界。provider固有機能を実測能力へ結び、未対応・hook未発火・観測不能を成功扱いしない条件。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|465|`LEGACY-CAND-LINE-000760`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:35`|失敗扱い。非対応、hook未発火、観測不能を成功として扱わない負のoracle。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|466|`LEGACY-CAND-LINE-000762`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:39`|切替sequencing。safe point、save/read-after、旧writer停止またはhandover、successor再束縛、再構成確認の順に切り替える条件。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|467|`LEGACY-CAND-LINE-000763`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:40`|state・二重副作用防止。切替時もassignment等の累積制約と未完義務を継承し、同一branchの二重writer・二重副作用を防ぐ。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|468|`LEGACY-CAND-LINE-000764`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:41`|independent review境界。新sessionだけでは独立reviewerが成立した根拠にならないという負のoracle。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|469|`LEGACY-CAND-LINE-000766`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:45`|restart packet内容。目的・受入・許容境界、状態、未解決意図等を必要最小限で渡し、上限超過時も必須情報を黙って落とさない。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|470|`LEGACY-CAND-LINE-000768`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:47`|情報混入境界。撤回claim、取消権限、secret、private reasoning、他案件情報、作成側の結論誘導をpacketへ混入させない条件。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|471|`LEGACY-CAND-LINE-000770`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:51`|比較条件。long history、標準compact、external reconstructionを同一task/HEAD/要求/provider/model/設定で隔離比較する条件。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|472|`LEGACY-CAND-LINE-000772`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:53`|比較oracle・費用。品質、重大見逃し、失敗反復、再取得量、切替、token/cache、時間等を含め、初期context減少だけで採用しない。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|473|`LEGACY-CAND-LINE-000774`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:57`|導入段階。shadowから無副作用復元、単一task、未commit差分、長期実行へ段階拡張する導入順。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|474|`LEGACY-CAND-LINE-000775`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:58`|再利用・新設抑止。既存continuation/memory/supervisor/handover/provider capabilityを再利用し、並行する別engineや巨大Skill等を新設しない条件。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|475|`LEGACY-CAND-LINE-000776`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:59`|要求identity分離。Skill、Rule導出、会話寿命を別要求・別受入・別完了状態として維持する条件。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|476|`LEGACY-CAND-LINE-000778`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:63`|owner接続・候補authority。versioning/invalidation/propagation authorityを先に正本化し関連ownerへ接続する工程を示す。前段のsource行と合わせて、候補承認・昇格・IR admission・runtime・enablementを別状態に置く。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|477|`LEGACY-CAND-LINE-000779`<br>`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:64`|authority状態分離。候補承認、canonical昇格、IR admission、runtime実装、operational enablementを独立状態として追う。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|478|`LEGACY-CAND-LINE-000781`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:2`|候補metadata。`status: draft_candidate` metadata。source自身の未採択状態を示すだけで、現行authorityではない。|なし（metadata/provenance/pointer/構造）|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|479|`LEGACY-CAND-LINE-000782`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:3`|旧layer metadata。`canonical_layer: L10` は旧candidateの層表示であり、現行層の割当てではない。|なし（metadata/provenance/pointer/構造）|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|480|`LEGACY-CAND-LINE-000783`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:4`|旧pair metadata。`canonical_pair: L3` は候補内の旧pair pointerで、現行L2/L11 decisionではない。|なし（metadata/provenance/pointer/構造）|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|481|`LEGACY-CAND-LINE-000784`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:5`|plan pointer。PLAN-L3-91への候補plan参照。独立したrequirement atomや現在の作業許可を作らない。|なし（metadata/provenance/pointer/構造）|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|482|`LEGACY-CAND-LINE-000785`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:6`|parent pointer。candidate design documentへのparent pointer。現行採択pairやsuccessor relationではない。|なし（metadata/provenance/pointer/構造）|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|483|`LEGACY-CAND-LINE-000789`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:11`|受入oracle DG-01/02。未知の重要前提が未調査ならDesign Readyを拒否する一方、根拠ある再利用は許可する。Evidenceから設計採否を追跡する。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|484|`LEGACY-CAND-LINE-000790`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:12`|受入oracle HR-02/04。美観・明瞭さ・見せ方の指摘を複数/未解決で保持し、communication failureだけではDesign再生成を要求しない。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|485|`LEGACY-CAND-LINE-000795`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:17`|受入oracle HR-07/08/DC-03。原文やAI提案で人間承認を偽装せず、既存Registry/Applicability責務を重複せず、wrong revision/authority/evidenceや再発を個別拒否する。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|486|`LEGACY-CAND-LINE-000797`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:19`|受入oracle E2E/Lite。Full E2Eと将来Lite契約のdependency closure/consumer検証を分離する受入条件。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|487|`LEGACY-CAND-LINE-000799`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:22`|候補導入順・source処理。censusからdogfoodまでの提案順と、原稿をGit保全・一致確認後に削除する条件を述べる。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|488|`LEGACY-CAND-LINE-000800`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:23`|Issue完了境界。実装/承認/削除未完了をIssueだけで完了扱いしないという完了主張の負のoracle。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|489|`LEGACY-CAND-LINE-000802`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:29`|表column header。要件、主受入、正例/反例の列見出し。行データを束ねる構造で独立atomではない。|なし（metadata/provenance/pointer/構造）|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|490|`LEGACY-CAND-LINE-000804`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:31`|DG-R-01/02対応表。AC1へ前提根拠と論点別調査を結び、UNKNOWNの無根拠KNOWN化や件数を理由とした論点省略を反例にする。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|491|`LEGACY-CAND-LINE-000805`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:32`|DG-R-02/03対応表。論点別調査とEvidenceの設計含意traceをAC1/AC2へ束ね、URLのみ/stale evidenceを不十分例とする。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|492|`LEGACY-CAND-LINE-000806`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:33`|DG-R-03/04対応表。設計含意traceと共通契約projectionをAC2/AC8へ結び、同等責務の独立engineを反例にする。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|493|`LEGACY-CAND-LINE-000807`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:34`|DG-R-04/HR-R-01対応表。共通契約projectionと原文/解釈分離をAC8/AC7へ割当て、memory流用・原文上書きを反例とする。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|494|`LEGACY-CAND-LINE-000808`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:35`|HR-R-01/02対応表。原文と解釈の分離、複数分類と未解決保持をAC7/AC3へ結び、曖昧反応の単一断定を反例にする。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|495|`LEGACY-CAND-LINE-000809`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:36`|HR-R-02/03対応表。曖昧反応保持と客観green/human rejectの共存をAC3/AC6へ結び、greenでrejectを相殺するのを反例とする。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|496|`LEGACY-CAND-LINE-000810`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:37`|HR-R-03/04対応表。客観greenと選好rejectの共存、表現だけの修正時に全面再生成しないoracleをAC6/AC4へ結ぶ。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|497|`LEGACY-CAND-LINE-000811`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:38`|HR-R-04/DC-R-01対応表。表現修正とstable axis/revisionの受入を結び、axis renameで受容履歴を消すのを反例とする。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|498|`LEGACY-CAND-LINE-000812`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:39`|DC-R-01/02対応表。stable axis/revisionと有効根拠付き改版をAC5へ結び、新Evidenceを人間承認として偽装するのを反例とする。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|499|`LEGACY-CAND-LINE-000813`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:40`|DC-R-02/03対応表。有効根拠付き改版と再発・別原因の系譜をAC5/AC9へ結び、新IDによる再発隠蔽を反例とする。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|
|500|`LEGACY-CAND-LINE-000814`<br>`docs/governance/candidates/design-grounding-human-convergence-acceptance.md:41`|DC-R-03/04対応表。再発・別原因の系譜と全条件同版ANDをAC9へ結び、単一approveやwrong revisionで合格するのを反例とする。|あり|個別rowの現行crosswalk・採択pair bindingなし。候補意味は未採択・未解決のまま。|

## authority・source保全

- 固定F6はHARNESS、OS、BRAIN、LABOのL2/L11各pair。会話継続、Worker/状態継承、design evidence/受入、authority境界の関連テーマはあるが、今回の各source rowとのexact crosswalkまたは採択pair bindingではない。2026-09-28 PO decisionは固定revisionと明示候補集合だけを採用し、本sliceのcandidate rowsへ採択を広げない。
- 40行すべてのsource stateは`historical_candidate / draft_candidate / preserved_pending_atomization`、`meaning_change_applied=false`、successor IDなし。source assetはhistorical/unresolvedとしてledgerへ戻る。今回の意味分類はadoptionもsource closureも主張しない。
- ranks 461–477は会話継続再構成候補内の情報保持・切替条件、state継承、比較oracle、導入/authority境界を記述する。ranks 478–488はdesign-grounding受入候補のmetadata、oracle、導入/完了境界を含む。rank 489は表header、ranks 490–500は要件と受入例の対応表行である。marker negativeはnormative meaningが無いという意味ではなく、Lexical screenの指定regexに該当しないという意味である。
- archive source code、workflow、CLI、hook、adapter、runtime、test、CIは実行していない。検証は順位・ID・byte/hash join・ledger state・pair/decision pin・authority境界の静的確認に限る。

詳細なline/asset ledger entry、全文source line、neighbor context、file/line/physical-byte hash、全pinは[paired JSON](legacy-candidate4755-explanation-normative-complement-ranks-461-500-2026-10-01.json)を参照。
