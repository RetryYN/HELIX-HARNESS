# WR216 SEC005 credential-value-boundary L4/L9 負例分類・割当証拠（PR-A）

- Request ID: `WR216-SEC-CVB-NEG-4WAY`
- Issue: `#3510`
- 対象機構 / 文書: `HELIX-SECURITY` `SEC005` (`credential-value-boundary`)
- PR 範囲: **PR-A（L4/L9 V-pair のみ）**。L5/L8 V-pair は 1 V-pair per PR 規則に従い後続 PR-B で扱う。
- 比較前固定 artifact（R2 独立導出・正本）: `scaffold/research/wr216-sec005-cvb-neg-4way-20261031/blind-derivation-r2.json`
  - SHA-256: `92670bdec0283d3700bb871751487c92f93ec025d2995eab002236cb8fadb85f`
  - 比較前固定コメント: `https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6534617145`
  - 独立導出担当: `SEC005 Upstream Blind Derivator`（session `f73cba46-71bf-40c2-8a3b-ac89c97692a8`, subagent `f0ce0082-355c-460f-9086-c1b153f75eda`。working-tree L4 および L5/L6/L7/L8/L9、先行 PR、Issue #3510 コメント、既存 `blind-derivation.json`/`comparison.json` の参照 0 件）
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
  1. `F01 credential_class_unresolved`（`HELIXSECURITY-L4-005-F01-NEG-04`）: L9 統合粒度では `[28], [29]` の順序付き 2-finding class（`L4#/contracts/0/negative_classifications/12..13`）として束縛し、L8 単体関数 `compare_credential_classification` の単独 1-finding 3 件（`SEC005-L8-CLASS-UNKNOWN/EMPTY/NULL-SET`）は `L4#/contracts/0/unit_only_negative_classifications/0`（`SEC005_F01_CREDENTIAL_CLASS_UNRESOLVED_UNIT`）および `L4#/remaining/4`・`L9#/remaining/4` に固定した（PR-B は L4 無変更で L5/L8 から当該 pointer へ結線可能）。
  2. `B01 outside_credential_free_scope` 等（`HELIXSECURITY-L4-005-B01-NEG-01..05`）: `L10-005-B01` 反例に対する L9 既存のオラクル被覆（`multi_contract_residual.positive_cases[1] SEC005-OS027-CREDENTIAL-REQUESTED-OUTSIDE-SCOPE`、`cases[2].positive_cases[0..3]`、F01/F02 負例、`multi_contract_residual.negative_cases[0..3]`）を `L4#/contracts/2/negative_classifications_disposition`（`SEC005_B01_OUTSIDE_CREDENTIAL_FREE_SCOPE` 等）および `L4#/remaining/5`・`L9#/remaining/5` に明記し、`contracts[2].negative_classifications: []` が「B01 に失敗なし」と読まれないようにした。
  3. `B01 use_context / credential_requested unknown`（`HELIXSECURITY-L4-005-B01-NEG-06`）: L8 単体検証 `SEC005-L8-INITIAL-UNKNOWN` および `SEC005-L8-PLAN-NULL/TEXT/ABSENT` の L4 接続先として `L4#/contracts/2/negative_classifications_disposition/families/5`（`SEC005_B01_USE_CONTEXT_OR_REQUEST_FLAG_UNRESOLVED`）および `L4#/remaining/6`・`L9#/remaining/6` に固定した（PR-B は L4 無変更で L5/L8 から当該 pointer へ結線可能）。
- **F3 対応（単一契約 F01 の 2-finding 5 件の順序付き class 化）**:
  - `[28] SEC005-REQUEST-CLASSIFICATION-MISSING`、`[29] SEC005-REQUEST-CLASSIFICATION-CONFLICT`、`[40] SEC005-CAPABILITY-TUPLE-EXPIRY-MISSING`、`[52] SEC005-BOTH-ACTOR-MISSING`、`[53] SEC005-ACTOR-MISSING-OPERATION-CONFLICT` の 5 件について、`L4#/contracts/0/negative_classifications/12..16`（および `L4#/failure_classifications/12..16`）に順序付き `finding_codes` を持つ 5 クラスを新設し、L9 単一契約負例全 69 件に `negative_class_ref` と `negative_class_assignment` を付与した（`assigned=69, unassigned=0`）。

## 4. 共有 leaf と一意化規則（#3952 R1 F1）

- `comparison.json#/shared_leaf_and_deduplication_rules` および `L9#/negative_class_assignment_audit/shared_leaf_and_deduplication_rules` に 4 パターン（`/capability/tuple/<field>`、`/request/classification`、`/capability/tuple/expiry`、`/context/observed_time`）の共有比較規則と `(code, pointer, return_owner)` 一意化規則を記録。
