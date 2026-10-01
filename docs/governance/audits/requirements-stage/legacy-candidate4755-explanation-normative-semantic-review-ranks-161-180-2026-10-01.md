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

## screen母集団の照合

公開regexはheader除外前に258行へhitする。screen規則どおりMarkdown table headerを除外する。次の3行はそれぞれ直後にtable separatorがあり、screen対象母集団には含めない。source file SHA、physical line SHA、ledger entry SHAとlineはJSON `screen_pool_reconciliation.excluded_header_source_pins`に固定した。

|除外前raw rank|除外ID|source line|除外理由|
|---:|---|---|---|
|222|`LEGACY-CAND-LINE-001500`|`execution-ticket-requirements.md:127`|Markdown table header、次行はseparator|
|223|`LEGACY-CAND-LINE-001514`|`execution-ticket-requirements.md:147`|Markdown table header、次行はseparator|
|230|`LEGACY-CAND-LINE-001910`|`execution-ticket-trace.md:198`|Markdown table header、次行はseparator|

除外後のeligible poolは255でfixed screenの記録と一致する。`LEGACY-CAND-LINE-001672`、`001678`、`001685`はそれぞれrank253–255に含まれ、今回のmeaning audit対象外である。screen JSONは変更していない。

## 結果とauthority境界

分類: acceptance oracle 19 / direct requirement condition 1。RCLSのfamily relationは13件、source-row crosswalk 0、source-range crosswalk 0、adopted pair binding 0、source condition closure 0。20行すべてsource-line state=`historical_candidate / draft_candidate / preserved_pending_atomization`、asset=`Historical / unresolved`。

RCLS familyの対象: 168–180はRCLS-AC行であり、2026-09-25の配置判断、LABO candidate、F6 LABO L2/L11にRCLS-BRの候補関係がある。これは各AC source lineの個別採択・oracle実施・full coverageではない。RAMG 161–167はsource authorityに関する意味近接のみで、RAMG identityやline-specific relationは確認できない。

F6の後に記録された2026-09-28 OS/HARNESS/LABO PO decisionは、明示された各機構のtarget revisionと候補集合に限る。Laboの53件candidate adoptionはRCLS旧AC行を採択せず、source未完引継ぎの完了・retire・holding解除にもならない。PO判断記録・候補familyの意味から旧source rowのstatusを更新しない。

過去順位・archive source line、前後文、source-line ledger・asset ledger、pair file SHA、PO record SHA/lines、source-family evidenceは同名JSONに収録した。旧runtime等は実行していない。
