---
title: "HELIX-HARNESS Stage 1 L8詳細検証設計"
layer: L8
status: design_pair_defined
owner: HELIX-HARNESS
paired_l5: ../L5-detail-design/stage1-harness.md
paired_l5_sha256: 60afa0e521ef7b8d717b30cb61fb8f120af1127f7107c93a8fb7fc8d21c0d8ad
base: main `13a2d6ec23e568edb35ffaa7532950fbfda3aafd`
---

# HELIX-HARNESS Stage 1 L8詳細検証設計

本書は[L5](../L5-detail-design/stage1-harness.md)の製品契約を固定L10の12 functional case、5 NFR case、親別business boundary 3件の計20件へ展開する。下の`IV-HARNESS-*`は既存L9で定義済みのverifier IDであり、L8が再定義・再採番するIDではない。L8は各verifierが使うfixture候補とfield単位の変異方法を詳述する。設計状態であり、実行、pass、実装、CI、releaseを示さない。

fixtureは合成pack declaration、dependency refs、caller input、version、authority ref、saved state、event/evidenceだけを使用する。実ネットワーク、実credential、provider、release/deployment、旧runtime/test/CIを起動しない。L9の期待oracle、既存K1–K10の型/key/reason契約、固定L3/L10以外の状態語を新設しない。未知・未観測・比較不能は影響する当該operationだけ非肯定とし、全製品や全Stageを停止する新gateを作らない。

## 1. Fixed sourceと対照

対象revisionは`a77672513325aa9e79f3780af40455361b5d19a8`。L4 `../L4-basic-design/stage1-harness.md`のSHA-256は`25fbd104fd47f39d22f542664e57fd44a440af8904e11b2f0b397ac6606b6cfb`、既存L9 `../L9-integration-verification/stage1-harness-integration-verification.md`のSHA-256は`6cc4bc3ac56b8d1d94e05ddc4dda71c35df2941aab39e65fb9d43cda2deb36da`。L3/L10六本文のfull SHA、親別scope、AC/CASE locatorは[L4 §1](../L4-basic-design/stage1-harness.md#1-対象と固定source)と[L5 §1](../L5-detail-design/stage1-harness.md#1-固定scopeと本文source)を参照する。`HARNESS-L2-010/011/023`以外、特にStage外・WEB製品・WEB-OS・他機構をこのscopeへ加えない。

旧12 assetのsource、full SHA、台帳状態/consumer情報、保持・再導出・置換理由は[L5 §2](../L5-detail-design/stage1-harness.md#2-旧helix-source台帳consumerfailure)に記録した。台帳には12行ともconsumer linkがなく、failure_refs fieldも存在しない。旧本文のtest/gate failure例は歴史上の記述として比較しただけで、consumer稼働や旧テストの合否を意味しない。

## 2. Functional verifier 12件

各verifierは表に記す一つの固定L10 source caseを主caseとする。複合条件を扱うcaseは正常対照を固定し、列挙された負例を一fixture一変異に分ける。L9のowner返却先は同じ値を保つ。

| Existing L9 verifier ID | 固定L2 / L3 AC / L10 case | Detailed fixture and oracle | Failure/return owner |
|---|---|---|---|
| `IV-HARNESS-S1-F-010-01` | 010 / AC-010-01 / `CASE-HARNESS-L10-010-01` | Normal: pack identity/version/maturity, IO contract, typed dependency identity/version, verification scope/oracle, owner class+identity, inclusion/exclusion, release-unit and product version refs all explicit. Individual negatives: two owners; release-unit-owned pack shared with another unit; each declaration-external dependency kind used at runtime; unqualified/untested pack included. Separate positive: shared capability owned by component/core; indivisible coupled behavior contract. Compare pack/unit/product versions separately. | pack declaration defects → pack contract owner; invocation-only defects → caller. |
| `IV-HARNESS-S1-F-010-02` | 010 / AC-010-02 / `CASE-HARNESS-L10-010-02` | Replace exactly one target pack. Compare all pack identities, versions, and evidence before/after; target may change, every non-target delta must be zero. Separate failed replacement fixture uses invalid target revision and compares recovery to either previous qualified revision or explicit replacement. Never combine multiple target packs. | pack/replacement owner; caller only for invocation-specific failure. |
| `IV-HARNESS-S1-F-010-03` | 010 / AC-010-03 / `CASE-HARNESS-L10-010-03` | Same declared input+pack version yields same declared artifact bytes/digest. Independent mutations: pack maturity promotion, pack success, pack replacement; each must leave release-unit/product version and maturity unchanged. Keep qualified pack visible while upper composition is incomplete. A pack that cannot be exchanged/updated returns to Design-refactor. Recovery fixtures compare exact identity/version/evidence to previous qualified or explicit replacement. | pack contract owner or caller based on failing field. |
| `IV-HARNESS-S1-F-010-04` | 010 / AC-010-04 / `CASE-HARNESS-L10-010-04` | Compare a function/folder catalog-only fixture to a complete pack declaration with identity, owner, contract, and release-unit relation. Catalog alone is not a pack; report the absent declaration fields. | pack contract owner. |
| `IV-HARNESS-S1-F-011-01` | 011 / AC-011-01 / `CASE-HARNESS-L10-011-01` | Normal explicit invocation consumes declared output with no screen, GUI, local path, provider, CI product, or HELIX-internal management record. Negative requiring each such environment dependency. Exercise different provider configuration and tenant as separate in-scope normal fixtures. For pack declaration versus caller input, independently vary missing/unknown/stale/mismatched pack/capability identity, contract version, dependency identity/version range; never merge source side. Unsupported version is not equivalent. | declaration side → pack contract owner; invocation side → caller. |
| `IV-HARNESS-S1-F-011-02` | 011 / AC-011-02 / `CASE-HARNESS-L10-011-02` | Normal existing authority reference + project/tenant/environment scope; a separate normal fixture allows pack-owned isolated internal state. Independently mutate authority ref and each scope dimension to missing/unknown/stale/mismatch, cross-tenant target, and attempted sharing of HELIX operational DB/key/internal control. Only the actual received scope is usable; HARNESS cannot mint/expand authority. | authority fields → existing SECURITY owner; scope/state boundary → caller or pack owner. |
| `IV-HARNESS-S1-F-011-03` | 011 / AC-011-03 / `CASE-HARNESS-L10-011-03` | Bind multiple progress updates, terminal/uncompleted state, result, and evidence refs to one operation/correlation and return to caller. Keep resume-state recording as a distinct valid fixture. Mutations moving caller’s result persistence/display/business-completion responsibility to HARNESS fail. | caller/operation owner. |
| `IV-HARNESS-S1-F-011-04` | 011 / AC-011-04 / `CASE-HARNESS-L10-011-04` | Normal resume uses same logical operation/key/saved state and exact current pack/contract/dependency revisions, scope, applicable authority, expiry. Independently remove/mismatch saved state, each revision, scope, authority ref, expiry ref; independently make each stale. Reject HARNESS key rewrite; caller’s new key is a separate valid operation. Observe preflight, dispatch-immediately-before, and dispatch-immediately-after snapshots. Pre-dispatch expiry/drift → blocked/held, effect 0; after dispatch, unknown completion → uncertain/unknown. Exercise expiry before/equal/after, resume, and prior-start/post-expiry completion; compare equality alternatives only under NFR verifier `IV-HARNESS-S1-N-011-02`. | pack declaration dependency → pack owner; invocation/scope/state → caller; authority → SECURITY; dispatch state → OS owner. |
| `IV-HARNESS-S1-F-023-01` | 023 / AC-023-01 / `CASE-HARNESS-L10-023-01` | Declare each of four dependency classes with owner, version/range, pack revision and applicable operation/source condition. Include a classification-only fixture with unimplemented dependency. Separate negative for missing/ambiguous class/owner/version/condition and safety/behavior/oracle-affecting source disguised as reference-only. | pack contract owner. |
| `IV-HARNESS-S1-F-023-02` | 023 / AC-023-02 / `CASE-HARNESS-L10-023-02` | Separate fixtures: operation/source conditions true, false, unknown, contradictory; source unselected, explicitly selected missing/stale, unknown selection; implicit fallback attempt after D8; explicit reselection as a new input; over-inclusion of unselected/condition-false dependencies; requiring unrelated capabilities to complete; missing correlation/version/scope/reason; standalone pack green without dependency/composition evidence; resolvable/unresolvable closure cycle. Closure includes only always-required + true operation/source dependencies. Unselected remains unobserved; unknown/conflicting condition stays held. | declaration dependency → pack owner; operation/source/scope/result → caller; authority → SECURITY; only upstream L1-005 meaning conflict routes to its owner. |
| `IV-HARNESS-S1-F-023-03` | 023 / AC-023-03 / `CASE-HARNESS-L10-023-03` | Distinguish human delegation with actor/source/revision/scope/receipt from oral-only receipt. Separate later-version dependency, required 1.0 safety dependency, and missing/unknown dependency; repeat same input/revision. Ensure closure cannot mutate feature/owner/upper requirement/version maturity or produce candidate adoption/implementation permission. Classifier returns missing/unknown without requiring dependency implementation. | existing pack/caller/authority owner for missing obligation; no new authority owner. |
| `IV-HARNESS-S1-F-011-05` | 011 / AC-011-02 / `CASE-HARNESS-L10-011-05` | Normal is the fixed HARNESS request scope. Mutation that derives WEB requirement/design from it is rejected; HARNESS scope itself remains valid. This is an existing second verifier for AC-011-02, not a new AC. | preserve HARNESS owner boundary; do not derive WEB meaning. |

## 3. NFR verifier 5件

各行は既存L9 verifier IDと固定L10 NFR caseを保つ。候補観測は実測・SLO・承認にしない。

| Existing L9 verifier ID | Fixed NFR / AC / L10 case | Independent measurement fixture and oracle |
|---|---|---|
| `IV-HARNESS-S1-N-010-01` | NFR-C-HARNESS-010-01 / AC-010-03 / `CASE-HARNESS-L10-NFR-010-01` | Generate twice from same declared input, pack version, artifact contract. Exact declared artifact bytes digest must match, unexpected delta 0. Exclude metadata only if artifact contract explicitly marks it nonsemantic; do not add digest algorithm/implementation. |
| `IV-HARNESS-S1-N-010-02` | NFR-C-HARNESS-010-02 / AC-010-02 / `CASE-HARNESS-L10-NFR-010-02` | Replace one pack and compare every other pack version/evidence; target-external change count 0. A multi-pack update fixture is outside this candidate. |
| `IV-HARNESS-S1-N-011-01` | NFR-C-HARNESS-011-01 / AC-011-04 / `CASE-HARNESS-L10-NFR-011-01` | Compare effect-free interruption, repeated delivery after effect is recorded, and a caller’s distinct new-key operation. Same operation resumes with same key and extra effects 0 (effect at most once); distinct key remains distinct operation. |
| `IV-HARNESS-S1-N-011-02` | NFR-C-HARNESS-011-02 / AC-011-04 / `CASE-HARNESS-L10-NFR-011-02` | Use one fixed clock for expiry just before/equal/after, preflight, just before/after dispatch, resume, and start-before/result-after-expiry. Apply an existing equality rule if declared; otherwise compare `now >= expiry` and `now > expiry` alternatives. Pre-dispatch expired means blocked/held and effect 0. If post-dispatch outcome cannot be established, it is uncertain/unknown. Expiry-after success count is 0. No TTL/clock-skew value is introduced. |
| `IV-HARNESS-S1-N-023-01` | NFR-C-HARNESS-023-01 / AC-023-03 / `CASE-HARNESS-L10-NFR-023-01` | Exercise fixed NFR D1–D15 as 15 distinct fixtures; twice evaluate each same pack revision/input and compare closure/reason measurement digest (delta 0). Preserve class, source choice, missing/stale, conditions, fallback/reselection, reference-only spoof, cycle, human receipt, and unimplemented dependency states exactly as L3/L10 declares. Digest is test-comparison evidence, not canonical data schema. |

## 4. Business boundary verifier 3件（独立business oracleなし）

固定business sourceは独立business requirementやbusiness acceptance oracleを持たない。3 verifierはこの境界を親別に照合し、事業価値や新しいgateを追加しない。

| Existing L9 verifier ID | Fixed parent / business source | Boundary fixture and expected result |
|---|---|---|
| `IV-HARNESS-S1-B-010` | HARNESS-L2-010 / fixed L3 business and L10 business row 010 | 確認はFRS-BR-001/002/003/005/009とL2-008区別を既存functional AC内に保つこと。収益、優先順位、独立release decisionを生む出力はnegative。 |
| `IV-HARNESS-S1-B-011` | HARNESS-L2-011 / fixed L3 business and L10 business row 011 | callerが結果を保存/表示し業務完了を判断する正常境界。HARNESSがこれを所有する変異はnegative。 |
| `IV-HARNESS-S1-B-023` | HARNESS-L2-023 / fixed L3 business and L10 business row 023 | dependency class/closureだけから新しい利用方針やownerを生成する変異はnegative。functional ACに対する別business acceptanceを作らない。 |

## 5. 製品と共通kernelの結合範囲

このL8はHELIX-HARNESS製品のStage 1 fixture設計であり、共通kernel詳細設計/単体suiteではない。現行kernelのL4/L9が定義するK1–K10を、product scope内で参照する。

| Kernel | HARNESS product fixture boundary |
|---|---|
| K1/K2 | pack/caller/dependency/operation/scope/artifact refsの既存Observed/keyを使い、異revision/unknownをpositiveにしない。 |
| K3 | callerが渡した既存authorityだけを照合し、authority作成やscope拡張をしない。 |
| K4/K5/K6 | unfinished obligation/evidence/receiptを分け、receiptだけで実作用・bootstrap・approvalを証明しない。 |
| K7 | pack/operation revision fenceとresume comparisonは既存契約に渡す。product resultからassignmentを作らない。 |
| K8 | packのowner-declared maturity labelを上位release unit/product labelへ昇格しない。 |
| K9 | review結果をL3承認、release eligibility、実装許可へ読み替えない。 |
| K10 | 023の固定typed dependency/class/conditionを使い、未宣言 dependencyを加えない。 |

共通kernel本文のL4/L9歴史snapshotはL4 §4.4のbase `7d48e458fcff7e03df18abc4f768981410685cf7`上にあり、L4 SHA `7ee3a2e4bb820538ceab0dbf2ff2e8e44bf7cb113012ec16aba7484e70b6388b`、L9 SHA `62617cee9af0bdc1efe253275ae97dea9b2368cd8ee77a818735c5f180e0ba1b`。現base `13a2d6ec23e568edb35ffaa7532950fbfda3aafd`のkernel L4/L9本文SHAはそれぞれ`3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696`、`77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52`。K1/K2 detail pairはmain `33bbe8cd5f080be9e400e9259db22645bc620eda`へ統合済みで、L5 SHA `30fb33b316b6116ccb3eb38240947b3fdde942b97df42bb23f45d8286d9d2285`、L8 SHA `431eee7726606ec6c6d9b6941f2d176610cd53d459132bce08f0ef7ce3c4769d`。これらは既存kernelの型/契約参照であってHARNESS製品親、registration事実、bootstrap procedure、実装/実行証拠にはならない。kernel内のformal/structural checkをHARNESS product release/coverageへ読み替えない。

## 6. 未確定・未実行範囲

初回pack declaration/VersionRegistered/ModelNumberDeclared/LogDecl/manifest segment、OS assignment/runのproducerはこのStage 1固定sourceから特定できず、L5で創作していない。L8 synthetic fixtureに登録済みidentityがあるとしても初回正本化の証拠ではない。該当operationだけをnon-positive/未観測として扱い、他のpure descriptor validation, version separation, typed classificationの設計まで止めない。

NFR候補値は要求に即した技術測定候補であって、実装値・実測値・PO承認値ではない。等号expiry候補は同一fixtureで比較するが、既存contractが未定義ならその未確定を保つ。実外部操作、test/runtime/CI、物理dispatch、releaseは行わない。本書の20行はfixture設計の識別数であり、実行coverage/pass/設計全体完了を意味しない。
