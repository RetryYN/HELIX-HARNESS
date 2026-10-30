# WR206 TDD flow negative classification PR-A evidence

status: scaffold（設計候補と静的照合の記録）
authority_effect: none
request: `WR206-HARNESS-TDD-FLOW-NEG-4WAY`（Issue #3510）
request base: `e3a16010cce138001d33df19afef92e3fa049d81`
reviewed base: `f5d511841c665b3424e159c8c1029bde51434521` (`origin/main`)

## Scope and limitation

本候補はL4/L9のTDD flow 28負例だけに、既存failure conditionとL9部分期待の対応軸、state、backflow owner、副作用数を記す。L5/L8、既存L9の`expected_issue`、`expected_partial_material`、mutation、fixture、期待値は変更しない。L4/L5 algorithm、旧HELIX runtime/test/CIは実行していない。新要求、正式な実装・受入、実Red/Green、独立oracleを生成しない。

以前の調査でL9を先に読み、手導出と比較している。またこの候補はClaude査定 [#3510 comment 6529000445](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6529000445) の指針を受けて作成した。したがってL9期待から独立に導いたoracleとは主張しない。ここに記録するのは、L3/L10・L4の原文と既存L4 state語彙が各分類を支持する範囲、およびその候補値をL9へ対応づけた履歴である。L9 `completion.state` の独立reviewは未完了のまま。

## Source inventory

両TDD flow文書の`source_main`は`337eb623d4a4d6aaa51b430964eb8f6c2e175202`。L4とL9双方のL3/L10 pinsは同revision・同SHAで、現在の文書bytesと一致する。

| source | identity / pointer | pin or content revision | SHA-256 |
|---|---|---|---|
| L3 business | `HARNESS-L3-015-B01`, `/requirements/7` | source revision `a2cc3defcee5a229145c89217af30c7d20da998f`; base L3/L10 content `85103aa71e12d48da3b3eabd6020ef1fc22aa902` | `25e0e8f8ee8acbc220483ab6854155218193861086cf757f933e2cd6263f444d` |
| L10 business | `HARNESS-L10-015-B01`, `/cases/7` | same | `3a9982ef2e59e3d027ce8e5cd72b9879b6224a8e4ea74b657bf9b67c90934319` |
| L3 functional | `HARNESS-L3-015-F01..F04`, `/requirements/40..43` | same | `a3b907cdc316117d4684632f9a1cbf36125eb6e6172f9cfc286060617583d7be` |
| L10 functional | `HARNESS-L10-015-F01..F04`, `/cases/40..43` | same | `fc58ad2268746d7924ac9be33e8f3f75e6d3c2cc619e27fbc1ddc34edd065cb2` |
| L4 process state precedent | `/contracts/0/connection_detail/grounding_meaning_input/local_return` | `3c2538a096b52fd6353770308831ee05de1d358d` | `eb0f43e23906d04b9554786a2574c94d01de85faa75f7fb1f33e08eb3276f464` |
| pre-change L4 TDD flow | `/contracts/0..4/failure_conditions` | reviewed main `f5d511841c665b3424e159c8c1029bde51434521` | `738a76b4753a8c51d1c684ae2ffa18d91b7bdbc2794961cde66a47c585aa299b` |
| pre-change L9 TDD flow | `/cases/0..4/negative_cases` | reviewed main `f5d511841c665b3424e159c8c1029bde51434521` | `512746cb3096f9d7dd1c58bfdee12b3161e38946d3d8f810ba84f798963df303` |
| candidate L4 TDD flow | PR-A classifications and source pin | after edits | `8dfbe628d7beb9b449a3ec48e98b7ed89ebbb4be1ea9b3f061dfd02ba464ea2f` |
| candidate L9 TDD flow | matched classification attributes; original expected bytes preserved | after edits | `3d2257ee9d0f33f367377a3c379af9852973dc11d87c1f23f8f193724adebeb2` |

L3/L10の内容はB01（business）とF01–F04（functional）で閉じている。L3は凍結・結合の順（F01）、本体変更前の意図したRed（F02）、同じoracleを満たすGreenと局所意味保存（F03）、同revisionの双方向traceとProvisional上限（F04）を定める。B01は同一契約の利用形態とquality-first、省略未回収を定める。対応するL10はこれらの照合点を保持する。

L4 process-state-portは`draft_pending_semantic_and_fixture_review`である。その`local_return`文をL4 TDD flowへ一度だけ写し、同じ語彙の参照元をpinした。これは既存L4設計の再利用であり、承認済みの独立oracleや新しい上流要求ではない。

## Classification basis

L4の各契約にある`negative_classifications`が、対応する`failure_conditions[].meaning`、L3/L10 identity、field/state選択理由を保持する。L9 `negative_cases`には同じcondition、expected axis/state、L4 `component_refs`由来のownerを加えた。副作用数はL4 `effect: normative_contract_only_no_execution`に基づき全件0。既存L9の部分期待と候補は照合対象として保全した。

Process-state-portの原文は「必要な所見/比較軸の未供給はmissing、null/未決はunknown、型外/既知役割・Ref・材料・scope相反はconflict、同scope別revisionはstaleとして保持する。独立原因を捨てず、異なる未解決stateの集約はunknown/nullとする。必要集合が既知の空集合なら当該scopeの非必要条件を返す。」同scope・同revisionにある序列の相反はconflict、異なるrevisionはstaleとした。例外でbehavior自体が観測できない状態はunknown、実行されず所見が供給されない場合はmissingとした。

Claude指針で再確認した8行は次のとおり。すべての行の個別根拠はL4 JSONの`classification_basis`に置いた。

| code | axis / state | source-based reason |
|---|---|---|
| `omission_erased` | `unrecovered_refs` / `conflict` | B01のrequired C1は存在し、候補の空配列だけが既知材料と相反する。 |
| `test_after_body` | `freeze_before_body` / `conflict` | 同じr1内でfreeze sequence 4がbody sequence 3より後。別revisionではない。 |
| `after_body_red` | `red_before_body` / `conflict` | 同じr1内でRed sequence 4がbody sequence 3より後。 |
| `body_before_red` | `order` / `conflict` | 同じscope/revisionでbody sequence 1がRed sequence 2より前。 |
| `mutation_substitute` | `red_before_body` / `missing` | F02のoutput fieldは`red_before_body`。F01の`pre_body_red`を借りず、実装前Redの未供給を表す。 |
| `ci_as_quality` | `actual_tdd_success` / `unknown` | F03 output fieldは`actual_tdd_success`でquality材料は入力されない。 |
| `freeze_missing` | `freeze_before_body` / `missing` | F01は結合より前の凍結を要求。`freeze: null`は必須凍結記録の未供給で、未決の選択ではない。 |
| `freeze_timestamp_only` | `freeze_before_body` / `missing` | 時刻以外の対象revision・設計・test・oracle・期待・順序記録がなく、必須凍結材料が未供給。 |

残る20行のaxis/stateは既存のL9部分期待に一致した。`freeze_missing`と`freeze_timestamp_only`の`freeze_before_body`はL3-F01/L10-F01の順序から採ったL4設計判断であり、sourceから一意に導ける値とは記さない（L4各行に`axis_selection_status`を明示）。`ci_as_quality`はL3/L10 F03にquality材料がないためstateをunknownとし、L4 failure conditionの「原子CIで品質/受入を生成しない」は維持する。L4 ownerは各契約の唯一の`component_refs`（B01 `QualityAndCiHandoff`; F01 `FrozenContractIntake`; F02 `PreBodyRedEvidence`; F03 `MinimalGreenLocalRefactor`; F04 `DevelopmentTraceAndFrontier`）から取った。契約外主張fieldはB01 `metric_as_accepted` の `accepted` のみ。

## Legacy and failure lineage

- 旧source `archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md`（`LEGACY-ASSET-5E22432B0A5A8F7CC8B3`, SHA `9eac2cc9e5fa8f1177b39f86681fa928cb22070666a5306dce7ae6943597d7af`）lines 23–24 は、意図した欠陥を検出するRed、最小Green、同じoracleを保つRefactorを記していた。この意味を再導出し、旧CLI/test/runtimeは持ち込まない。
- 同種の証拠境界の失敗記録 `archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md`（`LEGACY-ASSET-A127DEC3EEE6ED63CF17`, SHA `bab121404c956a0a4b403e589bea1c414af59b5996989bea5fab9f98f42f6872`）lines 71, 87 は、最新HEAD/merge-baseへのtrace再束縛不足（UTW-005）と、完了根拠が時刻・prose・自己申告へ戻る余地（UTW-021）を記録する。ここから新しい要求やgateは作らない。

## Static verification

（候補作成後の検証結果はcommit前に追記する。）

## Static verification record

Candidate revision base was latest main `f5d511841c665b3424e159c8c1029bde51434521`; the original task base `e3a16010cce138001d33df19afef92e3fa049d81` has no diff in the four TDD flow documents or `design_verification_checker.py` against this main. The prior e3a baseline therefore uses the same checker and target bytes that existed at f5d before this candidate.

- L4/L9 pair: `check_pair_bidir_id` passed. `check-pair` aggregate is false because L9 ownership-cap has 35 pre-existing forbidden `byte_sha256` findings; L4 ownership-cap passes. Baseline had the same L9 count (35).
- L4/L9/L5/L8 child: L4/L9 pair and L5/L8 pair pass. The four-layer negative check remains incomplete: candidate counts L4=28, L9=28, L8=0, L5=0; 33 failures consist of five per-contract count differences and 28 missing L5/L8 presences. Baseline was L4=0, L9=28, L8=0, L5=0 and also 33 failures. No axis/state/condition/owner/side-effect disagreement is reported for the L4/L9 rows.
- Ownership caps: candidate L4=pass/0; L9=fail/35; L5=pass/0; L8=fail/1647. Baseline counts are identical; L5/L8 and their source bytes were not modified.
- A static value comparison over all 28 L9 negatives confirmed that every pre-existing member stayed byte-value equal, including `expected_issue`, `expected_partial_material`, mutation, fixture/source packet, non-target preservation and side-effect count. L4 `original_l3`, `output_contract`, `failure_conditions`, `component_refs`, and `effect` also stayed equal to main. State text is copied exactly from the cited L4 process-state-port pointer.
- `check-child` target source-pin checks pass for all four layer documents; `python3 -m json.tool` passed for both target files and the binding. `git diff --check` passed.
- `python3 scaffold/tools/scfctl.py validate`: `bindings=169 fail=0`; `python3 scaffold/tools/scfctl.py stale`: `stale=0`. Main baseline was 168 bindings / stale=0.

The candidate L4/L9 SHA-256 values after edits are listed above. `SCF-B-0180` records the upstream input hashes; checks above are structural/static evidence only. No algorithm, runtime, old CI, or test suite was run. The 4-way negative set, L9 independent review, and L5/L8 mapping remain open for their separate scope.
