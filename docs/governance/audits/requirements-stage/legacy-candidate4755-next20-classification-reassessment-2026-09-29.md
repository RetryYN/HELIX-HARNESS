# 旧candidate未route次の20件に対する分類再評価案（2026-09-29）

- audit id: `legacy-candidate4755-next20-classification-reassessment-2026-09-29`
- base: `bf00aca56add8ca29d9a56af9a989fdeb0a7d969`
- authority effect: `none`。選定sample中16行の分類・atom境界案であり、採択・successor・coverage/closure・retire・Stage 5完了を生成しない。
- #2353/#2356/#2360/#2361とnext20 route sampleのexact commit/path/digestはJSONに固定した。next20 route sampleは別worktreeから読み取り、編集していない。

## 判定

source identityや歴史的receipt/evidenceだけを記録する行は`explanation`へ提案する。旧source固有のauthority、source-location、editing directiveは`management_process_condition`として歴史的意味を保全するが、current recurring processには昇格させない。実質的な規範的technical constraintはproduct atomとして残し、route unknownを維持する。

|Source ID|旧source path:line|提案分類/subtype|route案|atom境界|
|---|---|---|---|---|
|`LEGACY-CAND-LINE-000514`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:10`|`explanation`|`not_condition`|line review|
|`LEGACY-CAND-LINE-000515`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:11`|`explanation`|`not_condition`|line review|
|`LEGACY-CAND-LINE-000516`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:12`|`explanation`|`not_condition`|line review|
|`LEGACY-CAND-LINE-000517`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:13`|`explanation`|`not_condition`|line review|
|`LEGACY-CAND-LINE-000542`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:53`|`condition/management_process_condition`|`management_successor_unresolved`|line review|
|`LEGACY-CAND-LINE-000543`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:54`|`condition/product_requirement_atom`|`unknown`|line review|
|`LEGACY-CAND-LINE-000545`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:56`|`condition/product_requirement_atom`|`unknown`|暫定|
|`LEGACY-CAND-LINE-000546`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requirements.md:57`|`condition/product_requirement_atom`|`unknown`|line review|
|`LEGACY-CAND-LINE-000552`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:7`|`explanation`|`not_condition`|line review|
|`LEGACY-CAND-LINE-000553`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:8`|`explanation`|`not_condition`|line review|
|`LEGACY-CAND-LINE-000554`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:9`|`explanation`|`not_condition`|line review|
|`LEGACY-CAND-LINE-000555`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:10`|`explanation`|`not_condition`|line review|
|`LEGACY-CAND-LINE-000556`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:11`|`explanation`|`not_condition`|line review|
|`LEGACY-CAND-LINE-000557`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:12`|`explanation`|`not_condition`|line review|
|`LEGACY-CAND-LINE-000581`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:45`|`condition/management_process_condition`|`management_successor_unresolved`|line review|
|`LEGACY-CAND-LINE-000582`|`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:46`|`condition/management_process_condition`|`management_successor_unresolved`|line review|

### 行ごとの意味

- `000514–000517`: frontmatter `refines`のID列挙。参照identityは保ち、各ID行は独立したproduct atomに数えない。
- `000542`: bounded cancel providerの再利用と別cancel execution authority禁止というsource固有のauthority/process directive。歴史的management conditionとして保ち、現行successorは未割当。
- `000543`: 既存internal fieldとidentity文字列の互換性を保つtechnical constraint。`condition/product_requirement_atom/unknown`を維持。
- `000545`: “拡張する”が既存telemetry/cancel/recovery責務への規範的technical directionを含むため、`condition/product_requirement_atom/unknown`を維持。1物理行に複数CIS-R意味があるためatom境界は暫定とし、後続のatom化が必要。
- `000546`: Windows lease、receipt失効、監査内容の再実装禁止という実質的なnonreplacement/design constraint。`condition/product_requirement_atom/unknown`を維持。ID参照だけからcoverageは推定しない。
- `000552–000557`: ZIP名/日付/digest/基準commit/checksum/過去の読了・確認状態/保存記録のprovenance/evidence。current product conditionではなく`explanation`。
- `000581–000582`: 特定の歴史的packageを編集するためのpath/inventory correction instruction。historical `management_process_condition`として原文意味を保ち、現在の一般作業手順へ拡張しない。

## 母集団への影響

#2361のeffective unknown product atom 543件から13行をproduct-route母集団外へ移す提案となり、暫定差引値は530件。sampleの16 true_unknown行中、3行（`000543/545/546`）はproduct atom unknownを維持し、3行（`000542/581/582`）はmanagement successor unresolvedへ移り、10行はexplanationになる。全4,755行の累積再走査前の算術値であり、確定母集団ではない。

## 根拠・検証

#2356のID/provenance/status metadata対authority boundaryの区分、および#2360のmetadata除外とnormative condition維持の基準を比較した。旧archive exact bytesから各source file、line content、physical line bytes（newlineを含む）のSHA-256を再計算し、pinned sample row hashesと一致することを確認した。旧runtime/CLI/test/hook/CIは実行していない。
