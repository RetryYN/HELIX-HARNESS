# 旧candidate 4,755行の未route次の20件監査（#2366 cutoff、2026-09-29）

- audit id: `legacy-candidate4755-unknown-next20-route-audit-after-2359-2026-09-29`
- base: `origin/main` `a9b36cd43866d30aaca7c1edc654a44a36e47eb3`
- authority effect: `none`。relation評価だけを記録し、採択・successor・coverage/closure・受入・Stage 5完了は生成しない。
- 入力pin: #2353/#2356/#2360/#2361/#2363/#2366とsource router・carry-forward等のexact JSON/SHAはJSON台帳参照。#2366 merge時点で固定し、後続overlayは織り込まない。
- 選定: effective `condition/product_requirement_atom/unknown` 521件から、#2350 original selected20と、#2361が記録する訂正後#2359 selected20を除外。重複0、eligible 500件。numeric source ID順で先頭20件。
- #2359 merged sampleの履歴はpinしているが、除外集合は訂正後の#2361 `updated_selected_ids`。routeは同merged #2359のadopted-predicate criterionを20行すべてへ適用した。

|順|Source ID|旧source行|relation|atom境界暫定|
|---:|---|---|---|---|
|1|`LEGACY-CAND-LINE-000501`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:30`|`adopted_relevant_partial`|no|
|2|`LEGACY-CAND-LINE-000502`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:31`|`adopted_relevant_partial`|no|
|3|`LEGACY-CAND-LINE-000528`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:31`|`adopted_relevant_partial`|no|
|4|`LEGACY-CAND-LINE-000532`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:38`|`unadopted_candidate_relation_only`|no|
|5|`LEGACY-CAND-LINE-000533`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:39`|`adopted_relevant_partial`|no|
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

内訳: adopted relevant partial 4、unadopted candidate relation only 1、true unknown 15。

## 判断境界

- adopted relevant partialは、採択済みL2/L11の具体的source predicateとの狭い関係に限る。000501はL2-019/023のevidence-bound reconstruction/handoff、000528はL2-019/020のstale evidence/current verification区別、000533はL2-023のhandoff/unfinished-duty predicateに限り部分relationとした。cancel/supersedeの意味、schedule置換、generation予約、CIG固有receiptは残余としている。
- 000542、000543、000545、000546は#2363でcondition/product_requirement_atom/unknownとして保持されたため、ここでの再分類候補一覧から外した。#2363由来のatom boundary暫定印は000545のみ保持する。
- 000501のcrosswalk mappingはCIG familyからdraft candidateへの関係であり、採択relationを作らない。#2363 route history、000603のbounded receiptも採択・coverageを作らない。2026-09-30のOS-104 review referenceは#2366 cutoff外で、authority decision record pinがないため対象外。
- 既存8件のrouteもuniform criterionで再確認し、matched predicateとresidualをJSONの各rowに記録した。全source text、source file SHA、line text SHA、physical-line bytes SHAはJSONに固定した。

## 静的確認

- #2353 full row_recordsへ#2356/#2360/#2363/#2366をsource ID単位で適用し、521行を再計算。#2350と#2361 updated #2359のselected20を除外し、eligible 500件とnext20を再計算した。
- 20件の全source ID、archive file digest、text SHA、physical-line SHAを照合した。JSON/MD relation countsとrow labelsを照合し、旧runtime/CLI/test/hook/CIは実行していない。
- この選定は#2366 merge cutoffの記録。これ以後の母集団変更を反映したnext20を主張しない。
