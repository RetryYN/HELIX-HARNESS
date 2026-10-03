# Candidate 4755 説明行の規範語スクリーン補集合 ranks 161–180 意味監査

## 対象と導出

対象は#2353の4,755 `row_records`へ#2356、#2360、#2363、#2366、#2367、#2368、#2369、#2381を順に適用したeffective explanation 2,965行から、marker screen pool 255行を除く補集合2,710行のnumeric-ID rank 161–180である。基点commitは`7290e5bb7c010fed03cb4a44cd38da639e9a7530`。#2369は`scope.source_rows`の2行をexact IDでjoinし、#2381も完全一致IDで適用した。

再構成は#2353 `reconciliation.row_records` 4,755件を基準にし、最終classification `condition=864 / explanation=2965 / structure=926`を確認した。公開regexのraw hit 258件から隣接物理行がdelimiterのtable header 3件を除きmarker pool 255行を得た。補集合2,710行をID suffix数値昇順で並べて選定。選択ID SHA-256 `cd3bf082dc2e89f89821855007dd81fceea8f2f35534a1d54011476a36087763`。

各行のarchive source SHA、line/asset ledger entry SHA、F6 L2/L11、2026-09-19/25/28 decision bytesのreachable commit:path pinはpaired JSONに固定した。

## 行別監査

|rank|source ID / line|意味上の読み取り|marker-negative normative / authority context|F6／decision関係と残差|
|---:|---|---|---|---|
|161|`LEGACY-CAND-LINE-000272` · `docs/governance/candidates/authority-vocabulary-requirements.md:3`|候補文書が自己申告するcandidate layer。現在のL3 placement・要件承認を決めない。〔原文: 「candidate_layer: L3」〕|no：文書／provenance metadata|HARNESS／OS L2がAVS source-familyに触れるが、この自己申告行とのrow-specific crosswalkやL2/L11 adoption bindingはない。 残差: 候補のlayer表示から現行配置やL3承認を作らない。|
|162|`LEGACY-CAND-LINE-000273` · `docs/governance/candidates/authority-vocabulary-requirements.md:4`|候補文書が意図した旧L10 pairへの参照。対となるcurrent acceptanceや適用を確定しない。〔原文: 「canonical_pair: L10」〕|no：文書／provenance metadata|L2D-S1-01はdeferで、AVSをcurrent L2/L11へ適用せずsuccessorも割り当てない。 残差: `canonical_pair: L10`を現行pairの採択と解さない。|
|163|`LEGACY-CAND-LINE-000274` · `docs/governance/candidates/authority-vocabulary-requirements.md:5`|文書title metadata。タイトル単独は要求atomを定義しない。〔原文: 「title: "authority語彙分離要件"」〕|no：文書／provenance metadata|現行AVS関連L2の工程条件は近接するが、名称類似や参照のみで旧source coverageを示さない。 残差: タイトルからsource coverageを推定しない。|
|164|`LEGACY-CAND-LINE-000275` · `docs/governance/candidates/authority-vocabulary-requirements.md:6`|候補本文のlayer自己分類。〔原文: 「layer: L3」〕|no：文書／provenance metadata|現行L3番号への確定placementではない。L2D-S1-01 deferの範囲は維持。 残差: 旧層番号を現行層へ直接写像しない。|
|165|`LEGACY-CAND-LINE-000276` · `docs/governance/candidates/authority-vocabulary-requirements.md:7`|候補のkind label。変更承認や要求retireのdecisionではない。〔原文: 「kind: redesign」〕|no：文書／provenance metadata|current adoptionは明示採用候補に限る。kindから意味変更は生じない。 残差: `redesign`表示で後続の意味判断やretireを生成しない。|
|166|`LEGACY-CAND-LINE-000277` · `docs/governance/candidates/authority-vocabulary-requirements.md:8`|このarchive candidate自体のdraft状態を記すmetadata。〔原文: 「status: draft_candidate」〕|no：文書／provenance metadata|L2D-S1-01 deferを優先し、当該候補の本文をcurrent pairへ昇格させない。 残差: draft表示だけで却下・retireとも解さず、保留を保持する。|
|167|`LEGACY-CAND-LINE-000278` · `docs/governance/candidates/authority-vocabulary-requirements.md:9`|旧candidate作成日。要求条件ではない。〔原文: 「created: 2026-09-02」〕|no：文書／provenance metadata|F6採用scopeや現行source revisionを決めない。 残差: 作成日を現在の有効性証明にしない。|
|168|`LEGACY-CAND-LINE-000279` · `docs/governance/candidates/authority-vocabulary-requirements.md:10`|旧candidate更新日の自己記録。〔原文: 「updated: 2026-09-02」〕|no：文書／provenance metadata|F6採用scopeやdecision revisionを決めない。 残差: 更新日を現行承認と同一視しない。|
|169|`LEGACY-CAND-LINE-000280` · `docs/governance/candidates/authority-vocabulary-requirements.md:11`|candidate内のowner表示。担当や決定権限の現行割当ではない。〔原文: 「owner: PO / Codex TL」〕|no：文書／provenance metadata|担当表示とauthorityを分離し、F6のrow-specific adoptionを示さない。 残差: owner表示からcurrent owner・decision authorityを割り当てない。|
|170|`LEGACY-CAND-LINE-000281` · `docs/governance/candidates/authority-vocabulary-requirements.md:12`|旧作業plan IDへの参照。planの状態、scope、承認はこの行にない。〔原文: 「plan: PLAN-L3-82-authority-vocabulary-separation」〕|no：文書／provenance metadata|current F6 pair/decision mappingではない。 残差: plan referenceから作業許可・承認・完了を導かない。|
|171|`LEGACY-CAND-LINE-000282` · `docs/governance/candidates/authority-vocabulary-requirements.md:13`|親となる旧要求候補へのprovenance pointer。〔原文: 「parent_design: docs/governance/candidates/authority-vocabulary-requests.md」〕|no：文書／provenance metadata|親source自体の全atomをcurrent L2/L11が採択した証拠ではない。 残差: 親pathだけで全要求意味の被覆を宣言しない。|
|172|`LEGACY-CAND-LINE-000283` · `docs/governance/candidates/authority-vocabulary-requirements.md:14`|意図された旧受入pair artifactへのpointer。〔原文: 「pair_artifact: docs/governance/candidates/authority-vocabulary-acceptance.md」〕|no：文書／provenance metadata|現行HARNESS/OS L11はこの旧AVS L10 source rowsを個別にbindせず、deferも残る。 残差: artifact pointerからacceptance adoptionまたはoracle実行を生成しない。|
|173|`LEGACY-CAND-LINE-000284` · `docs/governance/candidates/authority-vocabulary-requirements.md:15`|plan固有承認後にL10 pairをfreezeするという候補上のsequencing metadata。syntax上のmarker-negativeだが、単独では現在の制約・承認条件ではない。〔原文: 「next_pair_freeze: L10_after_plan_specific_approval」〕|candidate上のsequencing表現、current authorityではない|L2D-S1-01 deferによりAVS pair applicabilityはなく、current L11 acceptanceをfreezeする決定でもない。 残差: この行から新しいfreeze gateや現行L10/L11要件を作らない。|
|174|`LEGACY-CAND-LINE-000287` · `docs/governance/candidates/authority-vocabulary-requirements.md:20`|AVS requirement document IDのidentity pointer。〔原文: 「- 文書ID: `HELIX-AVS-REQ-001`」〕|no：文書／provenance metadata|旧AVS identityでありcurrent requirement successor IDへの割当なし。 残差: 同じ領域のL2 IDsをsuccessorへ読み替えない。|
|175|`LEGACY-CAND-LINE-000288` · `docs/governance/candidates/authority-vocabulary-requirements.md:21`|candidateのstatus metadata。旧PO receiptを参照するがcanonical promotionされていないことも明示する。〔原文: 「- 状態: `draft_candidate / L3候補承認済み・canonical未昇格`」〕|no：文書／provenance metadata|L2D-S1-01 deferと現行F6の明示採用集合に照らし、AVS全体のcurrent adoptionではない。 残差: L3 candidate approvalをL2/L11 adoption、canonical promotion、実装許可に拡張しない。|
|176|`LEGACY-CAND-LINE-000289` · `docs/governance/candidates/authority-vocabulary-requirements.md:22`|主Issue identity pointer。Issue ID自体は意思決定記録でない。〔原文: 「- 主Issue: `#1449`」〕|no：文書／provenance metadata|GitHub Issue identityは現行要求意味・approvalを生成しない。 残差: Issue stateから要求採否を推定しない。|
|177|`LEGACY-CAND-LINE-000290` · `docs/governance/candidates/authority-vocabulary-requirements.md:23`|旧candidateがL3-PO-1449-001 approval recordを指すprovenance pointer。記録の存在表示自体を現行L2 adoptionとしない。〔原文: 「- 承認record: [`L3-PO-1449-001`](https://github.com/RetryYN/HELIX-HARNESS/issues/1449#issuecomment-5544538084)」〕|no：文書／provenance metadata|2026-09-19 HDEC-L2D-S1-01-DEFER-01は当該上流のL2D判断をdefer。後続2026-09-28 HARNESS/OS採用集合にもAVS pair adoptionは含まれず、隣接L2をsource-specific pair receiptにしない。 残差: 実際の旧候補approval scopeと現在のauthorityを分ける。PO receiptからcanonicalization、L10 test evidence、closureを推定しない。|
|178|`LEGACY-CAND-LINE-000317` · `docs/governance/candidates/authority-vocabulary-requirements.md:62`|承認前にruntime/schema/current DB output/managed rulesへcandidateを投影しないという明示的negative authority condition。行はmarker-negativeだが意味として規範的。〔原文: 「本candidateを承認前にruntime、schema、DB current output、Claude/Codex managed ruleへ投影しない。」〕|yes：規範的authority条件|一般的な未承認・unknownで下流実装へ進まない境界に意味上近い。しかしAVSのL2D-S1-01はdeferでこのspecific rowをadoptせず、HARNESS/OSの固定F6 L2/L11にもrow-specific bindingや適用receiptはない。 残差: 汎用境界との近接はこの旧行の採択・現行managed-rule enforcementを立証しない。candidateは保留、authority effectなし。|
|179|`LEGACY-CAND-LINE-000319` · `docs/governance/candidates/bugbot-bounded-repair-acceptance.md:2`|Bugbot受入候補のtitle metadata。〔原文: 「title: "HELIX-bugbot 限定修復の受入候補"」〕|no：文書／provenance metadata|2026-09-25 PO placement decisionは限定修復を全部Intelligenceへ移すとし、HARNESSには修復後の検証義務を残した。このtitleだけで現行L10 candidate adoptionにはならない。 残差: titleからBugbot acceptance scopeやcurrent ownerを復活させない。|
|180|`LEGACY-CAND-LINE-000320` · `docs/governance/candidates/bugbot-bounded-repair-acceptance.md:3`|受入候補のdraft status metadata。直後の`approved_pending_canonical_promotion`との読み合わせが必要。〔原文: 「status: draft_candidate」〕|no：文書／provenance metadata|2026-09-25 placement decisionと2026-09-28 fixed L2 decisionsを優先し、この旧candidateのcanonical promotion/採択を推定しない。 残差: draftとapproval receiptの異なるscopeを併記し、どちらか片方でcanonical statusを決めない。|

## 現行/F6・decision比較

固定F6のHARNESS/OS L2にはAVS source-familyと一般authority条件への参照があるが、対のL11は今回選んだ旧行ごとのbindingを持たない。2026-09-19の`HDEC-L2D-S1-01-DEFER-01`はAVS採用をdeferし、L2/L11適用もsuccessor割当も行わない。2026-09-28のHARNESS/OS判断は明示した候補集合に限る。したがってL3 candidate approval pointer（rank 177）をL2/L11 adoptionやcanonical promotionへ拡張しない。

2026-09-25 PO placement decisionは旧Bugbot限定修復の発行・実行統制をIntelligenceへ移し、HARNESSには修復後の検証義務を残す。rank 179–180の旧acceptance candidate title/statusは配置判断や別候補のapprovalを置き換えない。

## 集計と境界

- 18行は文書metadata、provenance、identity、status、Issue/record pointer。隣接する本文条件やrecord内容をその行へ移さない。
- rank 173は候補内のpair freeze sequencing表現。rank 178は承認前のruntime/schema/DB/current output/managed rule投影を禁止するmarker-negative authority condition。いずれもこの監査でcurrent adoptionされない。
- 全行で`row_specific_current_crosswalk_found=false`、`adopted_pair_binding_found=false`、successor IDs 0、closure 0、authority effect `none`。source rowsは`historical_candidate` / `draft_candidate` / `preserved_pending_atomization`の保全状態を維持する。
- marker-negativeは非規範性を意味しない。旧L3 approval pointer・Issue IDはprovenanceであって、L2D deferや現行候補集合を上書きしない。
- archiveはread-only。旧workflow、CLI、hook、adapter、runtime、test、CIは実行していない。

詳細pin: [legacy-candidate4755-explanation-normative-complement-ranks-161-180-2026-10-01.json](legacy-candidate4755-explanation-normative-complement-ranks-161-180-2026-10-01.json)
