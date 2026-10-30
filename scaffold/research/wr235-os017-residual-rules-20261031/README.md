# WR235 OS017 algorithm 5 / 6 residual source candidates

status: scaffold research evidence; L4/L9 source-qualified candidates only
base: `84c82b5b35f57105b4db7af4e8efe9b530eead88`
binding: `SCF-B-0195`

## 固定blindと比較順

別workerのsource-only artifactを期待値比較前にIssue #3510 comment 6533135363へ固定した。保全コピー`source-only.json`は指定SHA-256 `c6bbbc3ec5a1fa3712380e1b0398e64f077df058f829f1525bce2bb22f2f9a88`と一致する。比較ではその後にL7 `/cases/108,127` の入力・期待参照を展開し、L8/L9既存行を確認した。artifact全体と比較結果は`comparison.json`に記録する。

## 2つの別候補

- case108はL4 algorithm/6の`dependency.state` closed-set規則。actualは`resolved`、contextはnullで集合外。L4の比較意味はcontext元pointerへの`source_unresolved`。candidateはactual state=resolvedの場合に限定する。actualがmissing/failed/conflict/stale/issue_closedなら後続の`dependency_not_resolved`/`dependency_unresolved`が出るため含めない。expanded L7 expectedはfinding一件で`/context/dependency/state`。
- case127はL4 algorithm/5の`level_selected` boolean selector規則。actual null、context false。actual selector unknown、context selector known booleanという範囲に限定し、原actual pointer `/level_selected` に`source_unresolved`となる。context-side unknownは別operandとして含めない。actual selectorがtrueでないのでlevel recordを読まない。expanded L7 expectedはfinding一件。

両行ともphase `resume`、overall `workflow_material_unknown`、workflow facet `unknown`、他6 facet `corresponding`、ordered finding code `[source_unresolved]`、return owner `ticket-workflow-owner`、副作用なし。L8/L9既存expectedも同じで、primary requirementはF02。両方F02の候補としてL4 `failure_classifications`へ別行を置き、L9は`l4_source_class_candidate_ref`だけを付けた。L7/L8/L9の期待値・実行状態は変更せず、L9はcandidate-link metadata以外の全row fieldsをbase比較した。

同じcode・facet・ownerを理由に2規則を1 candidateへまとめていない。一方、QA §3のformal class keyにはtyped `owner_ref`も必要であり、現在のL5に対象caseのtyped rule owner宣言がない。従ってfull keyと正式なclass identityは未確定で、ここではsource candidatesである。各規則の対象sliceにwitnessは1件だが、これは全体censusではない。WR181先例はwitness/keyが確立したsingleton residualを許し、member_count=0を非発火として扱う。QA §3はnegative class/caseの0件をnot_evaluated/failとする。ここではtyped keyと全体censusが未解決なのでsingleton成功は未立証。

L9にformal `negative_class_ref`や`negative_equivalence_classes`は足さず、four-layer mode / PASSも主張しない。L4先行5行、既存WR204/WR220証跡とexpected fieldは維持する。L4/L5 algorithm、旧runtime、test、CIは実行していない。

## 検証

`validate_candidate.py`は固定blind SHA、個別raw graphと期待参照、2つのrule boundary、L7/L8/L9投影、F02 primary requirement、過去5 L4 rows、L7/L8 file bytes、L9全integration rowsのcandidate-ref以外のfield不変を静的に検証する。WR220/WR204 validatorは過去witness検査を保ったままこの2件を別refとして扱う。

WR226のREADME/comparisonはbase `84c82b5`のbytesへ戻し、WR235修正履歴は本comparison artifactに置いた。

Baseline `84c82b5` と候補headで`scfctl validate/stale`、WR220/WR204/WR235 static validator、`check-child`を前後比較した。結果は`verification-summary.json`に記録し、L4↔L9とL5↔L8はpass、既存legacy four-wayはfalse（L4=7、他層0、matched=0、10 failure）のまま。
