# WR216 SEC005 credential-value-boundary L4/L9 負例分類・割当証拠（PR-A）

- Request ID: `WR216-SEC-CVB-NEG-4WAY`
- Issue: `#3510`
- 対象機構 / 文書: `HELIX-SECURITY` `SEC005` (`credential-value-boundary`)
- PR 範囲: **PR-A（L4/L9 V-pair のみ）**。L5/L8 V-pair は 1 V-pair per PR 規則に従い後続 PR-B で扱う。
- 比較前固定 artifact（R2 独立導出・正本）: `scaffold/research/wr216-sec005-cvb-neg-4way-20261031/blind-derivation-r2.json`
  - SHA-256: `92670bdec0283d3700bb871751487c92f93ec025d2995eab002236cb8fadb85f`
  - 比較前固定コメント: `https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6534617145`（`2026-10-30T22:13:56Z`）
  - 独立導出担当: `SEC005 Upstream Blind Derivator`（session `f73cba46-71bf-40c2-8a3b-ac89c97692a8`, subagent `f0ce0082-355c-460f-9086-c1b153f75eda`。working-tree L4 および L5/L6/L7/L8/L9、先行 PR、Issue #3510 コメント、既存 `blind-derivation.json`/`comparison.json` の参照 0 件）
- R2 Step A 先行固定（比較開始前の blind review で上記 `92670bde...` へ差し替え）:
  - SHA-256: `5945795304fd043dbfddea54322fc943ea8c1cca9b1a7d2aa3a9a6f120261f09`
  - 先行固定コメント: `https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6534537441`（`2026-10-30T22:08:31Z`）
  - 担当 session: `ca41e156-9926-495d-bb4c-e87ecb1d7a24`（同一 subagent `f0ce0082-355c-460f-9086-c1b153f75eda` 内の初回 worker、17 候補: `F01=8`, `F02=4`, `B01=5`。詳細は下記 §5 および `comparison.json#/pre_comparison_freeze_r2/prior_step_a_freeze` に全 17 候補と `92670bde...` 24 候補との全差分を収録）
- R1 比較前固定 artifact（履歴として無変更保持）: `scaffold/research/wr216-sec005-cvb-neg-4way-20261031/blind-derivation.json`
  - SHA-256: `b18b662713eb94c3d6bc5a3443128c6c8112f61308886647d0d1f2372f754bf6`
  - 比較前固定コメント: `https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6533221683`

## 1. QA §3 比較 mode と PR-A / PR-B 分割・中間未成立

- `docs/governance/design-verification-quality-assurance.md` §3（`CHK-NEG-4WAY-MATCH`）には `legacy_casewise_four_layer` と `explicit_negative_equivalence_classes` の 2 mode がある。
- `explicit_negative_equivalence_classes` は 4 層すべてに `negative_equivalence_classes` marker が揃うことを要求し、部分 marker は不一致（FAIL）となる。また `design_verification` PR class は 1 V-pair 単位で PR を分ける規則（`#3976 R1 Info I1`）であるため、本 PR-A は `L4/L9` V-pair のみを更新し marker を付けない。
- さらに現行 `scaffold/tools/design_verification_checker.py` の `_check_negative_equivalence_mode` はトップレベル `L8.unit_cases` / `L9.integration_cases` の 1 対 1 `integration_case_ref` 全単射と L5 contract の単数 `function` 文字列を要求する一方、`SEC005` は `cases[0..2]` 構造・L5 `function_refs` 配列・L8（43 件）と L9（69 件）の N 対 M 粒度差を持つ。
- そのため PR-A 完了時点の `check-child` は `L4_L9_pair: passed=true`、`L5_L8_pair: passed=true` であり、`negative_4way` は中間状態として `legacy_casewise_four_layer` で評価される（`counts: {"L4": 26, "L9": 69, "L8": 43, "L5": 0}`、`141 failures`）。

## 2. L8 と L9 の件数差（F01 33/55、F02 9/14、B01 1/0）の source-only 分類

- **F01（L8=33 vs L9=55、差 +22）**:
  - `value_exposure_unresolved`: L8=1（代表 1 面 `/surfaces/receipt/observation`）、L9=7（7 出力面すべて）→ **+6**
  - `store_visibility_unresolved`: L8=0、L9=1（`[47] SEC005-STORE-UNKNOWN`）→ **+1**
  - `credential_binding_unresolved`: L8=8（`request.<field>=null` 全 8 項目）、L9=14（`request` 7 項目＋`capability.tuple` 7 項目）→ **+6**
  - `request` 単独 Join 1 `credential_binding_conflict`: L8=0、L9=7（`[15, 17, 19, 21, 23, 25, 27]`）→ **+7**
  - `capability.tuple` 共有中間オペランド `credential_binding_conflict`（2 findings）: L8=8、L9=8 → **0**
  - `authority_expected_unresolved`: L8=0（L8 では `multi_contract_residual` 側）、L9=1（`[54] SEC005-EXPECTED-ACTOR-MISSING`）→ **+1**
  - `expiry_observation_unresolved`: L8=2（bool 時刻、非整数 expiry）、L9=1（`[48] SEC005-TIME-UNKNOWN`）→ **-1**
  - `credential_class_unresolved` 単一 finding: L8=3（`compare_credential_classification` 単体呼出）、L9=0（統合パイプラインでは `/request/classification` が tuple 照合と同時発火し `[28], [29]` の 2-finding ケースになる）→ **-3**
  - L9 複合・共有 leaf 同時発火 2-finding ケース（R2 で L4 `#/contracts/0/negative_classifications/12..16` の 5 クラスへ束縛）: L8=0、L9=5（`[28, 29, 40, 52, 53]`）→ **+5**
  - 合計: `33 + (6 + 1 + 6 + 7 + 0 + 1 - 1 - 3 + 5) = 55`。
- **F02（L8=9 vs L9=14、差 +5）**:
  - `noncanonical_secret_predicate`: L8=1（repository のみ）、L9=2（repository + external_sink）→ **+1**
  - `credential_expired`（`capability.state=expired`）、`capability_lifecycle_unresolved`、`revocation_material_unresolved`、`inspection_material_unresolved`: L8=0（`cases[1]` 外）、L9=4（`[10..13]`）→ **+4**
  - 合計: `9 + (1 + 4) = 14`。
- **B01（L8=1 vs L9=0、差 -1）**:
  - L8 は `classify_initial_path` 単体関数の未知 `use_context` に対する局所 `InputIssue`（`SEC005-L8-INITIAL-UNKNOWN`）1 件を持つが、L9 の `B01` は正例 4 件のみで負例 0 件。

## 3. R2 独立 Blind 導出（24 候補）と R1 21 分類・R2 26 分類の根ごと比較および変更順序（#3949 R4 N2 / #3980 R1 F1・F2・F3）

- **F1 対応（独立 subagent による blind 再導出と履歴保持）**:
  - R1 の `blind-derivation.json` は履歴として書き換えず保持し、R2 では下流未参照の独立 subagent が導出した `blind-derivation-r2.json`（24 候補: `F01=12`, `F02=6`, `B01=6`）を `#3510#issuecomment-6534617145` に freeze した上で、`comparison.json#/r2_blind_24_root_by_root_comparison` および `comparison.json#/post_comparison_change_order`（Step 1〜6）に根ごとの比較と変更順序を記録した。
- **F2 対応（L9 単一契約負例から除いた 3 系統の L4 行き先・remaining・PR-B での扱いの明記）**:
  1. `F01 credential_class_unresolved`（`HELIXSECURITY-L4-005-F01-NEG-04`）: L9 統合粒度では `[28], [29]` の順序付き 2-finding class（`L4#/contracts/0/negative_classifications/12..13`）として束縛し、L8 単体関数 `compare_credential_classification` の単独 1-finding 3 件（`SEC005-L8-CLASS-UNKNOWN/EMPTY/NULL-SET`）は `L4#/contracts/0/unit_only_negative_classifications/0`（`SEC005_F01_CREDENTIAL_CLASS_UNRESOLVED_UNIT`、`axis="use_binding_state"`, `state="unresolved"`）および `L4#/remaining/4`・`L9#/remaining/4` に固定した（PR-B は L4 無変更で L5/L8 から当該 pointer へ結線可能）。
  2. `B01 outside_credential_free_scope` 等（`HELIXSECURITY-L4-005-B01-NEG-01..05`）: `L10-005-B01` 反例に対する L9 既存のオラクル被覆（`multi_contract_residual.positive_cases[1] SEC005-OS027-CREDENTIAL-REQUESTED-OUTSIDE-SCOPE`、`cases[2].positive_cases[0..3]`、F01/F02 負例、`multi_contract_residual.negative_cases[0..3]`）を `L4#/contracts/2/negative_classifications_disposition`（`SEC005_B01_OUTSIDE_CREDENTIAL_FREE_SCOPE` 等）および `L4#/remaining/5`・`L9#/remaining/5` に明記し、`contracts[2].negative_classifications: []` が「B01 に失敗なし」と読まれないようにした。
  3. `B01 use_context / credential_requested unknown`（`HELIXSECURITY-L4-005-B01-NEG-06`）: L8 単体検証 `SEC005-L8-INITIAL-UNKNOWN` および `SEC005-L8-PLAN-NULL/TEXT/ABSENT` の L4 接続先として `L4#/contracts/2/negative_classifications_disposition/families/5`（`SEC005_B01_USE_CONTEXT_OR_REQUEST_FLAG_UNRESOLVED`）および `L4#/remaining/6`・`L9#/remaining/6` に固定した（PR-B は L4 無変更で L5/L8 から当該 pointer へ結線可能）。
- **F3 対応（単一契約 F01 の 2-finding 5 件の順序付き class 化）**:
  - `[28] SEC005-REQUEST-CLASSIFICATION-MISSING`、`[29] SEC005-REQUEST-CLASSIFICATION-CONFLICT`、`[40] SEC005-CAPABILITY-TUPLE-EXPIRY-MISSING`、`[52] SEC005-BOTH-ACTOR-MISSING`、`[53] SEC005-ACTOR-MISSING-OPERATION-CONFLICT` の 5 件について、`L4#/contracts/0/negative_classifications/12..16`（および `L4#/failure_classifications/12..16`）に順序付き `finding_codes` を持つ 5 クラスを新設し、L9 単一契約負例全 69 件に `negative_class_ref` と `negative_class_assignment` を付与した（`assigned=69, unassigned=0`）。

## 4. 共有 leaf と一意化規則（#3952 R1 F1）

- `comparison.json#/shared_leaf_and_deduplication_rules` および `L9#/negative_class_assignment_audit/shared_leaf_and_deduplication_rules` に 4 パターン（`/capability/tuple/<field>`、`/request/classification`、`/capability/tuple/expiry`、`/context/observed_time`）の共有比較規則と `(code, pointer, return_owner)` 一意化規則を記録。

## 5. R2 Step A の先行固定（59457953...）と差し替え固定（92670bde...）の経緯・全差分（#3980 R2 F1 Major / #4001）

- **先行固定の事実**:
  - 独立 Step A subagent（`f0ce0082-355c-460f-9086-c1b153f75eda`）の内部で、最初に初回 worker session（`ca41e156-9926-495d-bb4c-e87ecb1d7a24`）が上流 5 入力（L3 functional 6..7、L3 business 0、L10 functional 6..7、L10 business 0、L4@`73193d8d37` 散文）のみを読んで 17 候補（`F01=8`, `F02=4`, `B01=5`）を作成し、`2026-10-30T22:08:31Z` に `#3510#issuecomment-6534537441`（SHA-256 `5945795304fd043dbfddea54322fc943ea8c1cca9b1a7d2aa3a9a6f120261f09`）として投稿した。
- **比較開始前に差し替えた理由**:
  - 親セッションへ返却する前（かつ Step B の既存 L4/L9 との比較を一切開始する前）に、同一 subagent `f0ce0082-355c-460f-9086-c1b153f75eda` 内で自動起動した blind review session（`f73cba46-71bf-40c2-8a3b-ac89c97692a8`、`2026-10-30T22:09:14Z`）が、同じく下流 `L5`〜`L9`・作業ツリー `L4`・先行 PR・Issue コメント・既存 scaffold を一切読まずに上流 5 入力との照合だけで先行 17 候補を監査し、上流散文上で別状態とされている violation/unknown の束ねおよび明示義務の漏れ 4 箇所を指摘して 24 候補（`F01=12`, `F02=6`, `B01=6`）へ改訂し、`2026-10-30T22:13:56Z` に `#3510#issuecomment-6534617145`（SHA-256 `92670bdec0283d3700bb871751487c92f93ec025d2995eab002236cb8fadb85f`）として再固定した。
- **先行 artifact（59457953...）の復元と両 artifact の全差分（17 候補 → 24 候補、+7）**:
  - `ca41e156-9926-495d-bb4c-e87ecb1d7a24` の session transcript（step 13）から先行 `59457953...` の JSON 全文を復元し、SHA-256 が `5945795304fd043dbfddea54322fc943ea8c1cca9b1a7d2aa3a9a6f120261f09` と完全一致することを確認した上で、`comparison.json#/pre_comparison_freeze_r2/prior_step_a_freeze/prior_17_classifications_inventory` に全 17 候補の明細を収録した。
  - **F01（8 → 12、+4）**:
    1. `F01-NEG-05 (capability_expired_or_time_expiry_unknown, state=expired_or_unknown)` が `expired` と `time/expiry unknown` を 1 候補に束ねかつ `revoked` を漏らしていたため、`L4#/contracts/0/output_meanings/0`（`active/expired/revoked/unknown`）および `content_comparison/1, /4` に従い `F01-NEG-05 (capability_expired)`・`F01-NEG-06 (time_or_expiry_source_unknown)`・`F01-NEG-07 (capability_revoked)` の 3 候補へ分離（+2。旧 `F01-NEG-06 worker_direct_store_exposure` は `F01-NEG-08` へ移動）。
    2. `F01-NEG-07 (surface_raw_value_exposure_or_redacted_only_unobserved, state=conflict_or_unknown)` が生値露出（conflict）と未観測・redacted 自己申告のみ（unknown）を束ねていたため、`L4#/contracts/0/content_comparison/2` に従い `F01-NEG-09 (surface_raw_value_exposed)` と `F01-NEG-10 (surface_observation_unknown_or_redacted_only)` の 2 候補へ分離（+1）。
    3. `F01-NEG-08 (prerequisite_007_006_violation_or_unknown, state=violation_or_unknown)` が 007/006 条件の違反（violation）と未確認（unknown）を束ねていたため、`L4#/contracts/0/content_comparison/3` に従い `F01-NEG-11 (prerequisite_007_006_violation)` と `F01-NEG-12 (prerequisite_007_006_unknown)` の 2 候補へ分離（+1）。
  - **F02（4 → 6、+2）**:
    1. `F02-NEG-01 (non_canonical_or_mismatched_predicate_ref, state=conflict_or_unresolved_predicate)` が非 canonical predicate 上書き・不一致（conflict）と predicate Ref 欠落（unresolved）を束ねていたため、`L4#/contracts/1/content_comparison/0` に従い `F02-NEG-01 (non_canonical_or_mismatched_predicate)` と `F02-NEG-02 (canonical_predicate_ref_unresolved)` の 2 候補へ分離（+1。旧 `F02-NEG-02..04` は `F02-NEG-03..05` へ移動）。
    2. `L3-005-F02` obligation（「原値を通常証跡へ複写しない」）・`L4#/contracts/1/content_comparison/1`・`L4#/diagnostic_contract/pointer_base` に対応する独立候補が漏れていたため、`F02-NEG-06 (raw_value_copied_to_evidence_or_diagnostic)` を追補（+1）。
  - **B01（5 → 6、+1）**:
    1. `B01-NEG-01..05` はすべて `credential_requested` の真偽および経路選択が既知であることを前提としていたため、`L4#/contracts/2/input_meanings/0` と `L4#/legacy_comparison/0/preserve`（「unknown 非推測」）に従い、`credential_requested` または経路選択自体が不明な場合の `B01-NEG-06 (credential_requested_or_path_selection_unresolved)` を追補（+1）。

## 6. 複合 class の形成規則（`composite_class_formation`）と順序付き `expected_axis` 配列（#3980 R2 F2 Major / #3996 R1 F1）

- `OS015`（`docs/helix-os/L4-basic-design/management-authority-source-record.json`）および `SEC009`（`docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json`）を先例として、`L4#/diagnostic_contract/composite_class_formation` に複合 class の形成規則を追加した。新しい finding・axis・state は一切作らない。
- 複数 finding を持つ `SEC005` の全 6 複合 class（`L4#/contracts/0/negative_classifications/6, 12..16` および `L4#/failure_classifications/6, 12..16`）について、`expected_axis`（および `axis`）を `finding_codes` と同順の既存 axis 配列とし、`expected_preserved.contract_detail` に各 finding の単一分類が示す順序付き axis state を明記した：
  1. `[14] SEC005_F01_CAPABILITY_EXPIRY_BINDING_AND_OBSERVATION_UNRESOLVED`（L9 `[40] SEC005-CAPABILITY-TUPLE-EXPIRY-MISSING`）:
     - `finding_codes`: `["credential_binding_unresolved", "expiry_observation_unresolved"]`
     - `expected_axis`: `["use_binding_state", "capability_state_projection"]`（2 軸目 `capability_state_projection` を縮約せず保持）
     - 順序付き state: `use_binding_state=unresolved`（`SEC005_F01_CREDENTIAL_BINDING_UNRESOLVED`）、`capability_state_projection=unknown`（`SEC005_F01_EXPIRY_OBSERVATION_UNRESOLVED`）。scalar `expected_state` は先頭軸の `"unresolved"`。
  2. `[12] SEC005_F01_REQUEST_CLASSIFICATION_BINDING_AND_CLASS_UNRESOLVED`（L9 `[28] SEC005-REQUEST-CLASSIFICATION-MISSING`）:
     - `finding_codes`: `["credential_binding_unresolved", "credential_class_unresolved"]`
     - `expected_axis`: `["use_binding_state", "use_binding_state"]`
     - 順序付き state: `use_binding_state=unresolved`（Join 1、`SEC005_F01_CREDENTIAL_BINDING_UNRESOLVED`）、`use_binding_state=unresolved`（独立 class 集合照合、`SEC005_F01_CREDENTIAL_CLASS_UNRESOLVED_UNIT`）。scalar `expected_state` は `"unresolved"`。
  3. `[13] SEC005_F01_REQUEST_CLASSIFICATION_CONFLICT_AND_CLASS_UNRESOLVED`（L9 `[29] SEC005-REQUEST-CLASSIFICATION-CONFLICT`）:
     - `finding_codes`: `["credential_binding_conflict", "credential_class_unresolved"]`
     - `expected_axis`: `["use_binding_state", "use_binding_state"]`
     - 順序付き state: `use_binding_state=conflict`（Join 1、`SEC005_F01_REQUEST_BINDING_CONFLICT`）、`use_binding_state=unresolved`（独立 class 集合照合、`SEC005_F01_CREDENTIAL_CLASS_UNRESOLVED_UNIT`）。2 件目の `unresolved` を縮約せず `contract_detail` に保持し、scalar `expected_state` は先頭 finding の `"conflict"`。
  4. `[6] SEC005_F01_CAPABILITY_TUPLE_BINDING_CONFLICT`、`[15] SEC005_F01_DUAL_OPERAND_CREDENTIAL_BINDING_UNRESOLVED`、`[16] SEC005_F01_BINDING_CONFLICT_WITH_INDEPENDENT_BINDING_UNRESOLVED`:
     - `expected_axis`: いずれも `["use_binding_state", "use_binding_state"]` とし、各 finding の順序付き state（`conflict`+`conflict`、`unresolved`+`unresolved`、`conflict`+`unresolved`）を保持。

## 7. PR-B（`WR264-SEC005-L5L8-EXPLICIT`）：`explicit_negative_equivalence_classes` への移行・L4 二重表の折り畳み・L8 cap 1 解消

- **コミット順序と pin 更新**:
  1. **L4**（commit `d104d23e624804c5cec7a3e7be2000e94759aa35`、SHA-256 `0d8b20911333683de76b4adc515663595078c69286b3621a90748f4e6824ffb0`、`222,017` → `94,917` bytes、`-127,100` bytes）:
     - `contracts[0..2].negative_classifications` とトップレベル `failure_classifications` の二重表を畳み、`failure_classifications`（26 class）を一本の表に統合（`new_parent_link`：`failure_classifications[*].design_ref` と `contracts[0..2].negative_class_refs`（17/9/0 件）、`"negative_equivalence_classes": {"source_rows": "failure_classifications"}`）。
     - `unit_only_negative_classifications` は explicit 4-way に枠がないため L5 の `unit_case_rows`（U-ID 行）へ移管し、L4 から L8 への参照および冗長な自己参照 `source_pointers` を撤去。
  2. **L9**（commit `09237fd58514fb91dab1b4b9d4ead7d1c918e4d0`、SHA-256 `38ec51dfda66025b96ba44c31088bfdde29e44004b08428a769cc159c7365bc4`、`755,453` → `711,197` bytes、`-44,256` bytes）:
     - `source_pins` に L4 pin を追加し、`negative_equivalence_classes`（26 class）と `integration_cases`（単一契約負例 69 行）を追加。
     - 旧 `negative_class_assignment`・`negative_class_assignment_audit`・`source_case_refs[*].basis_pointers` の重複および L8 への pointer を撤去（`#4007` R2）。
  3. **L5**（commit `3fc4ed525f709d3eb967d403c391199d06aa1cb9`、SHA-256 `c71016bc8142646a6cb8b05c7afde050f1da5aac3538373f971f36b9347a8b60`、`185,666` bytes）:
     - L4/L9 pin を更新し、`"negative_equivalence_classes": {"source_rows": "failure_rules"}`、`failure_rules`（L4 26 class と class key 一致）、`unit_case_rows`（standalone U-ID 行 `U-SEC005-070..106` 全 37 件、`unit_only_negative_classification` を保持）、および `functions[0..11].unit_case_refs`（全 106 U-ID）を追加。
  4. **L8**（`350,370` bytes、`3,310,278` bytes から `-2,959,908` bytes 削減）:
     - L4/L9/L5 pin を更新し、`negative_equivalence_classes`（26 class）、L9 `integration_cases` 69 行と 1:1 の `unit_cases`（`U-SEC005-001..069`）、および L5 `unit_case_rows` 37 行と 1:1 の `standalone_unit_cases`（`U-SEC005-070..106`：正例 18 件＋unit 固有・複数契約負例 19 件）へ整理。
     - 期待は L5 契約から記述し（`DT-VT-105`）、`literal_materialization_contract`（L8 ownership cap failure 1 件を解消）・`original_case_chains`・`multi_contract_residual`・raw fixture・全返却・RFC6902 COPY・hash を撤去。
- **検証結果**:
  - `design_verification_checker.py check-child`: `comparison_mode = explicit_negative_equivalence_classes`、`parent_link_mode = new_parent_link`、`passed = true`、4way failures = 0、全層 ownership cap failures = 0、全層 pin failures = 0。
  - 証拠ファイルは現行各 1 本とし、過去 revision・snapshot の commit と SHA-256 は `comparison.json#/pr_b_wr264_explicit_transition/historical_evidence_disposition` 1 本に集約（`#4008` R2、`#4009` R1）。
