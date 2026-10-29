# WR181 OS015 残112件のL4/L9候補

## 対象と根拠

- PR class: `design_verification`、対象V-pair: HELIX-OS OS015 L4/L9
- 候補基点はPR-C #3923 head `64d3cf379335e0a4b034f7295a9a225a2d755986`。PR-Cは作業時点でOPEN。candidateのpush/PRは行わない。
- 既存手動監査はcommit `05614def4e0427f9390c2b6535e520f5c7c26590` の [`manual-case-audit-05614.md`](manual-case-audit-05614.md) に保存し、そのbytesを複製した。対象L4/L5/L7の元根拠revisionはdd5787507a9ef3b69f411074e2fcbc7710ca1d62。L4のdiagnostic_contract、L5の既存functionとfailure_rules先頭31件、L7 bytesが候補基点でも保持されていることを静的に確認する。
- 手動監査のCandidate key一覧では、既存2 event-class keyに103件、新しいkey群15個に37件を記録する。既存29件はPR-Aのcase-evidenceにより既に接続済みなので、前者の残74件に含めない。そこへC0044を独立導出して加え、残りを75件とする。よって本候補は75件を既存2 class、37件を新15 classに結ぶ112件の投影。
- 新しいclass keyは手動監査記録のfinding code列、全体condition、axis/state、共通backflow ownerとL5 function ownerから形成する。L4/L9のcase expected、L7 `expected_proposal`、checker出力からclassや期待を逆生成しない。

## C0044の独立導出

L7 `/connection_materials/OS015/case/cases/43/given/input` は`base_ref=inspect`で、`records/target_a/original_event/event_id`を`null`にする置換が1つだけある。展開input hashは`9975567cf158a570be3f1d62cbf9af619c2166d78e5fdaef7908d9ee06088148`。inspect fixtureでは置換前のactual/context event_idが同じ既知文字列で、置換後はactual側だけnullになる。L4のevent comparatorからactual event_id pointerに`source_unresolved`、whole-event比較からtarget_a original_event pointerに`original_event_mutated`を得る。最終keyは既存 `OS015-NEG-COMPOSITE-4e0c28b06920d3a9665cbe4beeaf48cea44d7b0d350dddfaec9c8471de1e86b5`。L7 expected、L8/L9 expectedは使っていない。

## 新規15 classの下流形成

L4 `failure_classifications`に15 rowを追加し、F02 contractの`negative_class_refs`へ同じ15 IDを追加した。class IDは監査済みのcanonical keyを、UTF-8 JSON `ensure_ascii=False, sort_keys=True, separators=(',', ':')` で符号化したSHA-256全64桁に`OS015-NEG-COMPOSITE-`を付けて作る。

| class ID | case数 | ordered finding codes | overall / axis / state |
| --- | ---: | --- | --- |
| `OS015-NEG-COMPOSITE-0847e4310de684d30c54c16de19c0ce068f2666a3e68fe3e3d93f144934f9a42` | 4 | `source_conflict, source_conflict` | management_material_violation / source / violation |
| `OS015-NEG-COMPOSITE-9c5c0fb87d1b6f9fbdf5e2e825c9e600024bbcd3f5bac7a32e7c20423fca521c` | 4 | `original_event_mutated, source_conflict, source_conflict` | management_material_violation / original_event / violation |
| `OS015-NEG-COMPOSITE-f26b128d495605fef34af26296623a373d06205bdbe8e9e366001ee980e6f294` | 2 | `classification_kind_unresolved, source_unresolved` | management_material_unknown / classification / unknown |
| `OS015-NEG-COMPOSITE-df9154ac8720b176f3ba2d4bf5fc0362496e530eafdd829278de18d4a3d5c39b` | 2 | `classification_kind_unresolved, source_conflict` | management_material_violation / classification / violation |
| `OS015-NEG-COMPOSITE-89de10e4554c2fb25885bc24b09de095d209750e791130a0f121afac952aa4ea` | 5 | `authority_origin_forbidden, source_conflict` | management_material_violation / authority / violation |
| `OS015-NEG-COMPOSITE-4ed7dc758943d0971c6a7853ba3568609804d47e1f5f615e39eaa5e523ef1c04` | 2 | `authority_origin_unresolved, authority_origin_unresolved` | management_material_unknown / authority / unknown |
| `OS015-NEG-COMPOSITE-e23551bcfb260256f33d6911d244f0715dee4f62c3f09840e48d7de5c6473ae9` | 1 | `authority_stale, source_conflict` | management_material_violation / authority / violation |
| `OS015-NEG-COMPOSITE-087fdf8f8d9303e619d04ccc3cbc6da653d08a4b20f6009bab1ec8dfe3cc90c9` | 1 | `authority_conflict, source_conflict` | management_material_violation / authority / violation |
| `OS015-NEG-COMPOSITE-3123046e6695da60ba6abef15c2588c632081391d431ec133fa509d6d90017bb` | 1 | `authority_state_unresolved, source_conflict` | management_material_violation / authority / violation |
| `OS015-NEG-COMPOSITE-9539a1f0e6787f121075bfc71469d281caadb1e4c31ba4a8df9ccd5fe882d3d7` | 2 | `authority_state_unresolved, authority_state_unresolved` | management_material_unknown / authority / unknown |
| `OS015-NEG-COMPOSITE-931c9057eaac57f35bd0ed64d5288c4339e3e4ff9b96eb19b2d77ff8a25767e2` | 3 | `source_unresolved, unresolved_promoted_to_current` | management_material_violation / source / unknown |
| `OS015-NEG-COMPOSITE-f5d02578a904f76ed01d15f549851918588f40e74d8216f84c54500cc38a384a` | 2 | `first_classification_prior_present, original_classification_mutated` | management_material_violation / classification / violation |
| `OS015-NEG-COMPOSITE-4e80f5977bf48e95192dcbe7ebd26ffba7aa253ddef99755e42e3e0990008f72` | 4 | `first_classification_prior_unresolved, original_classification_mutated` | management_material_violation / classification / unknown |
| `OS015-NEG-COMPOSITE-d509d10e51a98c1fe8971d91e909e058b360a803c1d686891282e3a8667a158f` | 2 | `first_classification_prior_present, first_classification_prior_present` | management_material_violation / classification / violation |
| `OS015-NEG-COMPOSITE-0232f9da85ba1659ef16f3a747b5e33cc43faf789d0b80faf1301bc0f131cec1` | 2 | `first_classification_prior_unresolved, first_classification_prior_unresolved` | management_material_unknown / classification / unknown |

L9 `negative_equivalence_classes`にはL4 class rowからexpected keyを順方向に写し、source pointersをL4/L7だけにした15 rowを追加する。L9の112 case rowsでは`negative_class_ref`と`material_ref`をL7 fixed `given.input`へ向ける。既存29 linkを変更せず、全583 case rowsの`condition`、`expected`、`expected_preserved`を不変に保つ。L5/L8文書は編集しない。

## Pin・bindingの影響

変更前にL4/L9をpinしていたbindingを全件確認した。SCF-B-0170はL4、SCF-B-0173/0175/0176はL4/L9のpinを新bytesに更新し、各noteに以前のhashと意味差分を残す。0175/0176がpinする0170のbinding hashも追随。新しい独立証拠bindingはSCF-B-0177。candidateでは`scfctl validate`と`scfctl stale`を実測する。

## 最新mainとの関係と残件

GitHub mainは再fetch時点で`2cdcb5594e46d2b0cd57fe20f469ca16604aebeb`（`FETCH_HEAD`と`git ls-remote`一致）、PR-Cとmainの共通merge-baseは`2d7cabb70861f4cc40d4d2e850d35c6b09083034`。共通baseからmainへの変更は`verification-summary.json`に全列挙し、本候補の変更pathとは重複しない。以前の`64d3cf3..main`直接diffではPR-C枝の未merge変更が逆向きに現れるため、衝突判定には使わない。GitHub PR #3923はOPEN、mergeableはUNKNOWN。最新mainへの隔離no-commit試行mergeは競合なし。静的validator、check-child、check-freeze、scfctl validate/stale、diff-checkの結果とraw report hashを`verification-summary.json`に記録する。

既存6 singleton-less classはL8/L9に形成しない: `OS015-NEG-source_unresolved-original_event`, `OS015-NEG-source_conflict-original_event`, `OS015-NEG-original_event_mutated`, `OS015-NEG-unresolved_promoted_to_current`, `OS015-NEG-first_classification_prior_present`, `OS015-NEG-first_classification_prior_unresolved`。本候補後もL5/L8 pair projectionは未実施で、L9の112 linksはL8にまだ反映されない。negative-4wayのFAIL、checkerが同時省略を検出しない限界、旧freezeの不一致を残件として記録し、全182件の完了・全体PASS・freeze成立とは呼ばない。

## 再現

```sh
python3 scaffold/research/wr181-os015-residual-l4-l9-20261030/build_projection.py
python3 scaffold/research/wr181-os015-residual-l4-l9-20261030/validate_projection.py
python3 scaffold/tools/design_verification_checker.py check-child --root . --l4 docs/helix-os/L4-basic-design/management-authority-source-record.json --l5 docs/helix-os/L5-detail-design/management-authority-source-record.json --l8 docs/helix-os/L8-unit-verification/management-authority-source-record.json --l9 docs/helix-os/L9-integration-verification/management-authority-source-record.json
python3 scaffold/tools/design_verification_checker.py check-freeze --root . --worktree docs/governance/audits/tdd/os007-os015-function-pair-freeze-2026-10-28.json
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
git diff --check
```

`build_projection.py`はmanifestの人手形成keyとcase割当てだけを文書へ反映し、L4 predicateを実行・再実装しない。`validate_projection.py`は原revisionとのpointer、集合、hash、期待値不変、pinを静的比較する。
