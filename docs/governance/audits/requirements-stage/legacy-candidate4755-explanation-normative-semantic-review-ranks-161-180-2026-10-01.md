# Candidate 4755 規範語マーカー順位161–180 意味監査

> 本監査は語彙順位に選ばれた20 source rowの静的意味照合であり、採択・authority・formal successor・実装・受入実行・source closureを生成しない。

- 基点: `8f4b935e7b33630b8df10a1818249838f7d3285e`。fixed screen `docs/governance/audits/requirements-stage/legacy-candidate4755-explanation-normative-marker-screen-2026-10-01.json` @ `e070ce2fe7453768d174a0594975dc26b0b25f07`, SHA-256 `1f9b0b6e05bfb46d937dfbbb954e8f7aa956c440acd526cbad2487b82893efbb` が記録するmarker poolは255、explanationは2,965行。前段ranks1–160を8件のexact prior audit JSONで照合し、現在の20 IDと重複しない。
- 固定比較: F6 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`（2026-09-27）。OS/HARNESS/LABO/BRAINのL2/L11 file SHAをJSONに固定し、現在比較HEAD `8f4b935e7b33630b8df10a1818249838f7d3285e` のbytesがF6 fileをprefixとして保持することを確認した。
- RCLSの配置判断（2026-09-25）はRCLSと受入条件をLABOへ移した。LABO L2/L11ではRCLS-BR条件を未採択candidateとして保持し、後続POの53 explicit candidate adoptionを旧RCLS-AC lineの採択へ拡張しない。RAMG行はF6 authority/source semanticsと近接しても個別RAMG relation/bindingはない。

## 行別照合

|Rank|Source ID / archive line|分類・role|F6と後続の関係|未解決残差|
|---:|---|---|---|---|
|161|`LEGACY-CAND-LINE-003915`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirements-authority-materialization-acceptance.md:27`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|direct family relationなし; selected-row bindingなし|staleの判定対象・freshness basis・partial trace stateとfailure precedence・再評価条件を持つsource-row pair/L11 oracleが未確認。候補family・隣接語を旧RAMG-AC-007採択としない。|
|162|`LEGACY-CAND-LINE-003918`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirements-authority-materialization-acceptance.md:30`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|direct family relationなし; selected-row bindingなし|stable join identity、owner cardinality、consumer reachabilityを固定するschema・negative oracle・実行証拠が未対応。|
|163|`LEGACY-CAND-LINE-003919`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirements-authority-materialization-acceptance.md:31`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|direct family relationなし; selected-row bindingなし|判定対象集合、disposition enum、exact cardinality・duplicate/unknown/error oracleを結ぶ現行pairが未確認。|
|164|`LEGACY-CAND-LINE-003920`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirements-authority-materialization-acceptance.md:32`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|direct family relationなし; selected-row bindingなし|fast-check coverage、scheduled population/cadence、missed-run/failure oracle、同一対象の結果照合が未指定。|
|165|`LEGACY-CAND-LINE-003921`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirements-authority-materialization-acceptance.md:34`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|direct family relationなし; selected-row bindingなし|canonical source schema/version、consumer read path、Markdown/DB/viewのnegative oracleと責任ownerが未対応。|
|166|`LEGACY-CAND-LINE-003923`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirements-authority-materialization-acceptance.md:37`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|direct family relationなし; selected-row bindingなし|14項目それぞれのfailure identity、独立採点、集約時の非相殺oracleを現行L11へ個別に結ぶ対応が未確認。|
|167|`LEGACY-CAND-LINE-003947`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirements-authority-materialization-requests.md:31`|要求条件 / `direct_requirement_condition` / standalone=true|direct family relationなし; selected-row bindingなし|対象operation、必須source tuple、解決owner、fail-close対象と例外、negative oracleを結ぶ採択pair/L11が未確認。|
|168|`LEGACY-CAND-LINE-004035`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:22`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|RCLS family-level relation; selected-row bindingなし|5 channelの正確なfield/schema、責務・事例・revisionとのbinding、single-enum negative fixtureを対象rowへ結ぶpair oracleがない。|
|169|`LEGACY-CAND-LINE-004039`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:26`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|RCLS family-level relation; selected-row bindingなし|excluded receipt identity、stale reason、asset-use filtering、expired/restricted data negative oracleと対象source setが残る。|
|170|`LEGACY-CAND-LINE-004040`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:27`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|RCLS family-level relation; selected-row bindingなし|stage state machine、required evidence、degraded/rollback states、replay oracleと各段階のownerをAC lineに結ぶpairが未確認。|
|171|`LEGACY-CAND-LINE-004041`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:28`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|RCLS family-level relation; selected-row bindingなし|Skill artifact schema、trigger/non-applicability semantics、effect window/denominator、expiry invalidation and negative fixture are unowned at this selected source row.|
|172|`LEGACY-CAND-LINE-004042`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:29`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|RCLS family-level relation; selected-row bindingなし|VERIFY producer/scope, shadow duration, FP denominator, rollback trigger and typed approval oracle plus execution evidence remain.|
|173|`LEGACY-CAND-LINE-004043`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:30`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|RCLS family-level relation; selected-row bindingなし|Definition of active machine policy, exact prose duplication set, precedence and no-duplicate check owner are not row-bound.|
|174|`LEGACY-CAND-LINE-004044`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:31`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|RCLS family-level relation; selected-row bindingなし|Independent producer/session/context identity, receipt scope, exact HEAD and merge-admission negative oracle remain.|
|175|`LEGACY-CAND-LINE-004045`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:32`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|RCLS family-level relation; selected-row bindingなし|External asset population, sensitivity classification, license evidence, holdout policy, secrets/PII and hidden-oracle negative tests remain unbound.|
|176|`LEGACY-CAND-LINE-004046`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:33`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|RCLS family-level relation; selected-row bindingなし|event schema, ordering/idempotence, rebuild determinism, divergence oracle, confidence/promotion derivation and authority owner remain.|
|177|`LEGACY-CAND-LINE-004047`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:34`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|RCLS family-level relation; selected-row bindingなし|qualification identity/version tuple, affected-scope invalidation timing and stale/revalidate oracle remain.|
|178|`LEGACY-CAND-LINE-004048`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:35`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|RCLS family-level relation; selected-row bindingなし|Named legacy capability identity, current owner mapping, duplicate-scope predicate and zero-overlap oracle are not established.|
|179|`LEGACY-CAND-LINE-004050`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:37`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|RCLS family-level relation; selected-row bindingなし|Cross-project transfer scope, redaction policy, rights review, approval identity/revision, holdout and failure oracle remain.|
|180|`LEGACY-CAND-LINE-004051`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:38`|受入oracle / `acceptance_expected_or_negative_behavior` / standalone=true|RCLS family-level relation; selected-row bindingなし|Output type/consumer access controls and negative proof against direct write across all four authority surfaces remain unverified for this source row.|

## marker母集団の再構成差分

公開された3種のpattern、#2353 row_recordsと8 overlay、source-line text、見出し/table separator除外、tier/hit数/numeric ID順を再実行するとmarker候補は258件となった。固定screen JSONの`screening_pool_with_any_marker=255`とは3件不一致である。差分候補はconditional-onlyで、再構成rank 256–258に位置する。対象rank 161–180のsource ID・順序は再構成と一致するため、この差分は本sliceの順位を動かさない。

|再構成rank|Source ID / archive line|hit|screen側の扱い|
|---:|---|---|---|
|256|`LEGACY-CAND-LINE-001672` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:427`|conditional `場合のみ` 1件|screenは集計255とtop-20のみを記録し、この行の除外理由・exclusion manifestなし|
|257|`LEGACY-CAND-LINE-001678` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:433`|conditional `場合のみ` 1件|同上|
|258|`LEGACY-CAND-LINE-001685` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:444`|conditional `場合のみ` 1件|同上|

screen側のrow-level除外根拠は固定artifactから確認できない。差分3行はこの161–180監査のcurrent queueへ加えず、screen母集団の不一致と追加3行を次のbounded screening reconciliationで採否判断する材料として記録した。screenの値・queueを黙って書き換えず、3行の意味監査・採択・closureも行っていない。source/ledger pinsは同名JSONの`screen_pool_discrepancy`にある。

## marker母集団の再構成差分

公開された3種のpattern、#2353 row_recordsと8 overlay、source-line text、見出し/table separator除外、tier/hit数/numeric ID順を再実行するとmarker候補は258件となった。固定screen JSONの`screening_pool_with_any_marker=255`とは3件不一致である。差分候補はconditional-onlyで、再構成rank 256–258に位置する。対象rank 161–180のsource ID・順序は再構成と一致するため、この差分は本sliceの順位を動かさない。

|再構成rank|Source ID / archive line|hit|screen側の扱い|
|---:|---|---|---|
|256|`LEGACY-CAND-LINE-001672` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:427`|conditional `場合のみ` 1件|screenは集計255とtop-20のみを記録し、この行の除外理由・exclusion manifestなし|
|257|`LEGACY-CAND-LINE-001678` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:433`|conditional `場合のみ` 1件|同上|
|258|`LEGACY-CAND-LINE-001685` / `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:444`|conditional `場合のみ` 1件|同上|

screen側のrow-level除外根拠は固定artifactから確認できない。差分3行はこの161–180監査のcurrent queueへ加えず、screen母集団の不一致と追加3行を次のbounded screening reconciliationで採否判断する材料として記録した。screenの値・queueを黙って書き換えず、3行の意味監査・採択・closureも行っていない。source/ledger pinsは同名JSONの`screen_pool_discrepancy`にある。

## 結果とauthority境界

分類: acceptance oracle 19 / direct requirement condition 1。RCLSのfamily relationは13件、source-row crosswalk 0、source-range crosswalk 0、adopted pair binding 0、source condition closure 0。20行すべてsource-line state=`historical_candidate / draft_candidate / preserved_pending_atomization`、asset=`Historical / unresolved`。

RCLS familyの対象: 168–180はRCLS-AC行であり、2026-09-25の配置判断、LABO candidate、F6 LABO L2/L11にRCLS-BRの候補関係がある。これは各AC source lineの個別採択・oracle実施・full coverageではない。RAMG 161–167はsource authorityに関する意味近接のみで、RAMG identityやline-specific relationは確認できない。

F6の後に記録された2026-09-28 OS/HARNESS/LABO PO decisionは、明示された各機構のtarget revisionと候補集合に限る。Laboの53件candidate adoptionはRCLS旧AC行を採択せず、source未完引継ぎの完了・retire・holding解除にもならない。PO判断記録・候補familyの意味から旧source rowのstatusを更新しない。

過去順位・archive source line、前後文、source-line ledger・asset ledger、pair file SHA、PO record SHA/lines、source-family evidenceは同名JSONに収録した。旧runtime等は実行していない。
