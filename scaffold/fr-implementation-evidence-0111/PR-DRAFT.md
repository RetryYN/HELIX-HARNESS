# Draft PR

## Title

research: HIL-FR-41-69 37 product unit implementation evidence crosswalk (SCF-B-0111)

## 目的

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` を基準に、HIL-FR-41〜69の29 source IDから派生した37 product unit、Wave1〜50、111 semantic review edge、旧asset 75件を静的に照合する。旧実装source、旧failure／degradation、旧consumer、現行実装、現行受入を独立partitionへ分け、直接証拠のないstatusはunknown／pendingと理由、counter-evidence、未解決欄を伴って保持する。

これはformal crosswalk、authority、successorを変更しない研究用Scaffoldである。candidate／requirement／design／implementation／acceptanceを混同せず、旧code／test／runtime／CIを実行しない。

## 変更内容

- inventoryで29 source ID、37 unit、111 edge、75 old asset、407 current static refs、Wave1〜50の598 scan row、BASE ancestry、input digest、anchor provenance、evidence partitionを固定する。
- evidenceでsource snapshot／IR anchor、Wave edge、edge別anchor、旧asset ledger／history／failure／consumer、旧implementation／degradation／failure／consumer、representative asset完全record、current refs、未実装保留をunit別に記録する。
- unitのedge ID multiset／件数とasset ID multiset／重複を期待値へ固定し、旧implementation／degradation／failure／consumer partitionをedge／source／ledgerから完全一致で再導出する。
- candidate asset、旧implementation_source、phase transition、coverage.failure、ledger status、current contextは実装・縮退・failure・未実装・受入の証拠へ昇格させない。
- Binding `SCF-B-0111`へbundle全成果物を登録する。

## 検証

    python3 scaffold/fr-implementation-evidence-0111/validate.py
    SCF-B-0111 validate: PASS (37 units, 111 review edges, 75 old assets; static-only)

    python3 scaffold/fr-implementation-evidence-0111/selfcheck.py
    SCF-B-0111 selfcheck: PASS (22 negative executions; expected error codes matched)

    python3 scaffold/tools/scfctl.py validate
    bindings=101 fail=0

    python3 scaffold/tools/scfctl.py stale
    stale=0

    python3 scaffold/tools/scfctl.py residuals
    residuals=0

    git diff origin/main...HEAD --check
    PASS

#1813は進捗参照のみであり、Issue close、merge、formal crosswalk／authority／successorの変更は行わない。旧code／test／runtime／CIと現行runtime／CIは実行しない。

## 未解決

旧unit implementation成立、旧failure receipt、unit-level degradation、consumer closure、current implementation／operation／acceptance、未実装判定、product authority、successor assignmentは保留する。candidate asset、catalog status、phase transition、coverage.failure、current documentの存在、validator合格を実装・縮退・failure・未実装・受入・完了へ変換しない。
