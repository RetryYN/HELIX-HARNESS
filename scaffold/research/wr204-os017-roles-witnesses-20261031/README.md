# WR204 OS017 roles ownership witness

## 対象と境界

- 対象はHELIX-OS OS017 L4/L9のsource-qualified candidateで、最新main `fa3d2d515ce8df79c0a74d5360a4d1254863a6f1` から作成した。
- L3 `HELIXOS-L3-017-B01` とL10 `HELIXOS-L10-017-B01` の推進・owner境界を要求の正本として参照する。field単位のcomparison/finding/状態はL4 proseから読み、L7 `given_input_ref` のraw graphだけを手で照合する。L7/L8/L9の期待を導出oracleにしない。
- L4 `/failure_classifications/2` にownershipの`source_unresolved` candidateを追加し、対応するL9 6 caseへ`l4_source_class_candidate_ref`を付けた。既存inputs 2 classとそのwitnessは保持している。L9の217件について`id`, `condition`, `expected`, `expected_preserved`は変更しない。
- L7 `/cases/39,41,43,45,47,49` はresume基準`/cases/3`からactual `roles`の1 leafのみがnullになり、他のraw subtreeとcontextは一致する。context roleはL4固定ownerと一致する。

## source-only分類

L4 `/diagnostic_contract/comparison_table/roles` はrolesをownership facetのstring比較に置き、`/owner_roles`はpromotion/process/proposal/level/authority/resourceをOS/HARNESS/INTELLIGENCE/LABO/SECURITY/INFRASTRUCTUREへ対応付ける。L4 `/algorithm/1` はactual rolesを独立contextの同fieldと比較し、context rolesを固定ownerにも照合する。null actual operandは`source_unresolved`となり、比較元のactual roles pointerがfinding pointerとなる。context側のroleは既知で固定ownerに一致するため、owner不一致findingは加わらない。

各caseのordered signatureは1 finding `(source_unresolved, /roles/<該当role>, ticket-workflow-owner)`。ownership facetはunknown、他のinputs/ticket/workflow/backflow/continuity/scope_limit facetsは、6ケースで共通のraw inputとL4 proseに照らしてcorresponding。全体conditionは`workflow_material_unknown`。role名はcase witness pointerに保持し、class conditionはrole slotに依存させず、追加finding・異なるseverityを持つcaseを含めない。

L4 `/diagnostic_contract/algorithm/2` の一意化キーは`(code,pointer,return_owner)`。この6ケースではactual role pointerが各caseで一つだけ変わり、同一case内の重複除去によるfinding数の変化はない。L4 algorithm prose 0..10を通覧し、actual roles leafを別facetで再利用する比較は見つからなかった。context.rolesの固定owner照合はownership facet内である。

L9に加えた参照はcandidate linkだけで、`negative_class_ref`でも正式membershipでもない。L4/L9のformal candidate rowsは4層`negative_equivalence_classes` markerの成立を意味しない。L5 `owner_ref`、L8 projection、4way marker、freezeとPASSは未形成のまま。

今回の`check-child`静的出力は`CHK-NEG-4WAY-MATCH`をlegacy casewise modeで評価し、L4=3、L9/L8/L5=0で`passed=false`だった。これは4way成立を示さず、今回のL4/L9 candidateをPASSとして扱わない。

## 旧HELIXとの関係と失敗記録

旧`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md`（LEGACY-ASSET-3A15E5645D2D2A59DFF5）§3のsource refs/scope/acceptanceと§5のcanonical Ticket/source provenanceを起点にした。source・scope・ownerの対応を保持し、旧CLI/DB/schema/admission engineは現行へ持ち込まない。

旧`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md`（LEGACY-ASSET-A127DEC3EEE6ED63CF17）のUTW-002（prose handoverとcontinuation正本の競合）、UTW-005（証跡の最新HEAD/merge-base再束縛不足）、UTW-021（完了根拠がprose/自己申告へ戻る余地）を証拠lineageの失敗記録として参照する。今回の6入力がこれらの旧失敗を再現したとは主張しない。旧runtime/test/CIは実行していない。

## 検証範囲

既存の`scaffold/research/wr204-os017-negative-classes-20261031/validate_manual_derivation.py` が共有するRFC6901 resolverで、raw L7 object graph、基準入力との差分leaf、owner map、L4/L9 candidate link、既存inputs class保持、L9期待projection不変、4層marker不在を静的に確認する。index JSONは各case pointer・role・classだけを持ち、raw operand/hash pointerを重複保存しない。finding導出計算やL4/L5 algorithmは実行しない。SCF-B-0184はこのsource-only証跡を登録する。
