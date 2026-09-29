# 旧candidate 4,755行の未route次の20件監査（#2366 cutoff、2026-09-29）

- audit id: `legacy-candidate4755-unknown-next20-route-audit-after-2359-2026-09-29`
- base: `origin/main` `a9b36cd43866d30aaca7c1edc654a44a36e47eb3`
- authority effect: `none`。relation評価だけを記録し、採択・successor・coverage/closure・受入・Stage 5完了は生成しない。
- 入力pin: #2353/#2356/#2360/#2361/#2363/#2366とsource router・carry-forward等のexact JSON/SHAはJSON台帳参照。#2366 merge時点で固定し、後続overlayは織り込まない。
- 選定: effective `condition/product_requirement_atom/unknown` 521件から、#2350 original selected20と、#2361が記録する訂正後#2359 selected20を除外。重複0、eligible 500件。numeric source ID順で先頭20件。
- #2359 merged sampleの履歴は pin しているが、除外集合は誤選定を含む旧#2359 HEADではなく、#2361で訂正された `updated_selected_ids`。

|順|Source ID|旧source行|relation|provisional|
|---:|---|---|---|---|
|1|`LEGACY-CAND-LINE-000501`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:30`|`true_unknown`|no|
|2|`LEGACY-CAND-LINE-000502`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:31`|`adopted_relevant_partial`|no|
|3|`LEGACY-CAND-LINE-000528`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:31`|`adopted_relevant_partial`|no|
|4|`LEGACY-CAND-LINE-000532`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:38`|`unadopted_candidate_relation_only`|no|
|5|`LEGACY-CAND-LINE-000533`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:39`|`unadopted_candidate_relation_only`|no|
|6|`LEGACY-CAND-LINE-000542`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:53`|`true_unknown`|yes|
|7|`LEGACY-CAND-LINE-000543`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:54`|`true_unknown`|yes|
|8|`LEGACY-CAND-LINE-000545`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:56`|`true_unknown`|yes|
|9|`LEGACY-CAND-LINE-000546`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:57`|`true_unknown`|yes|
|10|`LEGACY-CAND-LINE-000598`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md:7`|`true_unknown`|no|
|11|`LEGACY-CAND-LINE-000603`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md:14`|`true_unknown`|no|
|12|`LEGACY-CAND-LINE-000613`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md:27`|`true_unknown`|no|
|13|`LEGACY-CAND-LINE-000633`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md:51`|`true_unknown`|no|
|14|`LEGACY-CAND-LINE-000638`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md:58`|`true_unknown`|no|
|15|`LEGACY-CAND-LINE-000653`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md:77`|`true_unknown`|no|
|16|`LEGACY-CAND-LINE-000661`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md:88`|`true_unknown`|no|
|17|`LEGACY-CAND-LINE-000663`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md:90`|`true_unknown`|no|
|18|`LEGACY-CAND-LINE-000664`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md:91`|`true_unknown`|no|
|19|`LEGACY-CAND-LINE-000665`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md:92`|`true_unknown`|no|
|20|`LEGACY-CAND-LINE-000667`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md:95`|`true_unknown`|no|

内訳: adopted relevant partial 2、unadopted candidate relation only 2、true unknown 16。fresh 12件（000501, 000598, 000603, 000613, 000633, 000638, 000653, 000661, 000663, 000664, 000665, 000667）はすべてtrue unknown。

## 判断境界

- 000501の旧sourceはcancel/supersede/handoffの理由と対象を後から再構築できることを求める。新世代crosswalkはCIG-BR-03/CIG-R-04からNCI-OS-003/004へのfamily-level候補対応を示すが、source atom固有のrelationや採択IDは示さないためtrue unknownを維持した。
- 新規選定のうち000598、000613、000633、000638、000653、000661、000663、000664、000665、000667はrouterの意味確認でatom固有のrouteなし。000603にもcurrent/candidate/adopted IDはなく、別のbounded registration receiptは`authority_effect:none`でありrouteを決めない。
- 既存8件のrelation結論は前sampleから維持した。source text、source file SHA、line text SHA、physical-line bytes SHA、carry-forward stateとatomizationはJSONへ固定した。
- classification/atom境界の再確認印は000542、000543、000545、000546に限り維持した。これはこのauditで分類変更する提案ではない。

## 静的確認

- #2353 full row_recordsへ#2356/#2360/#2363/#2366をsource ID単位で適用し、521行を再計算。#2350と#2361 updated #2359のselected20を除外し、eligible 500件とnext20を再計算した。
- 20件の全source ID、archive file digest、text SHA、physical-line SHAを照合した。旧runtime/CLI/test/hook/CIは実行していない。
- この選定は#2366 merge cutoffの記録。これ以後の母集団変更を反映したnext20を主張しない。
