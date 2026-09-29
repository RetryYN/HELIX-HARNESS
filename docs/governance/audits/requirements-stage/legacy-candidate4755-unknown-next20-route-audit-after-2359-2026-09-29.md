# 旧candidate 4,755行の未route次の20件監査（2026-09-29）

- audit id: `legacy-candidate4755-unknown-next20-route-audit-after-2359-2026-09-29`
- base: `origin/main` `bf00aca56add8ca29d9a56af9a989fdeb0a7d969`
- authority effect: `none`。relation評価だけを記録し、採択・successor・coverage/closure・受入・Stage 5完了は生成しない。
- 固定入力: #2353 `8a75e539`、#2356 `b213b417`、#2360 `89a5f57`、#2361 `aab65a4`のexact JSON pinsとdigestはJSON台帳参照。選定除外は#2350 original 20件および#2359 exact HEAD `4a32ab782` selected 20件。
- 選定: effective `condition/product_requirement_atom/unknown` をnumeric source ID順に並べ、上記40件を除外し先頭20件（eligible 522件）。

|順|Source ID|旧source行|relation|provisional|
|---:|---|---|---|---|
|1|`LEGACY-CAND-LINE-000502`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:31`|`adopted_relevant_partial`|no|
|2|`LEGACY-CAND-LINE-000514`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:10`|`true_unknown`|yes|
|3|`LEGACY-CAND-LINE-000515`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:11`|`true_unknown`|yes|
|4|`LEGACY-CAND-LINE-000516`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:12`|`true_unknown`|yes|
|5|`LEGACY-CAND-LINE-000517`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:13`|`true_unknown`|yes|
|6|`LEGACY-CAND-LINE-000528`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:31`|`adopted_relevant_partial`|no|
|7|`LEGACY-CAND-LINE-000532`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:38`|`unadopted_candidate_relation_only`|no|
|8|`LEGACY-CAND-LINE-000533`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:39`|`unadopted_candidate_relation_only`|no|
|9|`LEGACY-CAND-LINE-000542`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:53`|`true_unknown`|yes|
|10|`LEGACY-CAND-LINE-000543`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:54`|`true_unknown`|yes|
|11|`LEGACY-CAND-LINE-000545`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:56`|`true_unknown`|yes|
|12|`LEGACY-CAND-LINE-000546`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:57`|`true_unknown`|yes|
|13|`LEGACY-CAND-LINE-000552`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:7`|`true_unknown`|yes|
|14|`LEGACY-CAND-LINE-000553`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:8`|`true_unknown`|yes|
|15|`LEGACY-CAND-LINE-000554`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:9`|`true_unknown`|yes|
|16|`LEGACY-CAND-LINE-000555`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:10`|`true_unknown`|yes|
|17|`LEGACY-CAND-LINE-000556`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:11`|`true_unknown`|yes|
|18|`LEGACY-CAND-LINE-000557`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:12`|`true_unknown`|yes|
|19|`LEGACY-CAND-LINE-000581`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:45`|`true_unknown`|yes|
|20|`LEGACY-CAND-LINE-000582`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:46`|`true_unknown`|yes|

内訳: adopted relevant partial 2、unadopted candidate relation only 2、true unknown 16（暫定）。true unknownの16件は分類/atom境界懸念を含むため最終件数として扱わない。reclassification再点検候補: 000514, 000515, 000516, 000517, 000542, 000543, 000545, 000546, 000552, 000553, 000554, 000555, 000556, 000557, 000581, 000582。各候補分類はJSONにID別で提示し、今回のeffective classificationは変更していない。各行の旧source原文、archive file SHA-256、source text SHA-256、physical-line bytes SHA-256、現行relation evidenceと具体的residualはJSONに固定した。

## 読み分け

- CI event concurrency行では採択済みHARNESS-L2-005／対L11の要求検証義務に一部の意味関係を認めた行と、draftのNCI-OS候補だけに関係する行を分けた。後者は採択済み扱いしない。
- `CIS-R-*`単独行とcompatibility/reference行はatom boundary concernを暫定表示した。Intake ZIPのprovenance/evidenceおよび過去の編集指示もproduct atomとして確定しない。16 true_unknown件数はこの暫定母集団上の数で、最終件数として確定しない。ID別のreclassification候補はJSONに列挙したが、今回は分類を変更しない。
- HELIXINTELLIGENCE-L2-073は2026-09-29 PO判断でexact L2/L11 revisionが採択済み。source行000142/000143は本sample対象外であり、採択から本sampleや他sourceへのrelationを推定しない。
- 選定/分類proposalは要求意味のauthorityではない。全行のcarry-forward state、atomization status、successor空欄はJSONで保持した。

## 静的確認

- 20件の選定集合を固定入力から再計算し、origin/main router・carry-forward・archiveにあるID、line、file digest、physical-line digestを照合した。旧runtime/CLI/test/hook/CIは実行していない。
