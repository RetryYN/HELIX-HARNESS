# Draft PR

## Title

research: HIL-NFR-21-40 29 product unit implementation evidence crosswalk (SCF-B-0114)

## 目的

固定BASE `0d51a994f418450efc40438244f0552e428fc207` を基準に、HIL-NFR-21〜40の20 source IDから派生した29 product unit（HELIX-OS 18、HELIX-HARNESS 11）、Wave1〜50、61 semantic review edge、旧asset 33件を静的に照合する。NFR全体は60 unitであり、本束はNFR-21〜40に限定し、NFR-01〜20を混入させない。旧実装source、旧failure／degradation、旧consumer、現行実装、現行受入を独立partitionへ分け、直接証拠のないstatusはunknown／pendingと理由、counter-evidence、未解決欄を伴って保持する。

これはformal crosswalk、authority、successorを変更しない研究用Scaffoldである。candidate／requirement／design／implementation／acceptanceを混同せず、旧code／test／runtime／CIを実行しない。

## 変更内容

- inventoryで20 source ID、29 unit、61 edge、33 old asset、261 current static refs、Wave1〜50の598 scan row、BASE ancestry、input digest、anchor provenance、evidence partitionを固定する。
- evidenceでsource snapshot／IR anchor、Wave edge、edge別anchor、旧asset ledger／history／failure／consumer、旧implementation／degradation／failure／consumer、representative asset完全record、current refs、未実装保留をunit別に記録する。
- unitのedge ID multiset／件数とasset ID multiset／重複を期待値へ固定し、旧implementation／degradation／failure／consumer partitionをedge／source／ledgerから完全一致で再導出する。
- unit schema／top-level key集合、old-asset wrapperのkey集合と`static_only`／`not_implementation_proof`、inventoryのnegative-case code集合とBASE全宣言を固定validatorで照合し、改竄を負例で拒否する。
- candidate asset、旧implementation_source、phase transition、coverage.failure、ledger status、current contextは実装・縮退・failure・未実装・受入の証拠へ昇格させない。
- Binding `SCF-B-0114`へbundle全成果物を登録する。

## 検証

    python3 scaffold/nfr-implementation-evidence-0114/validate.py
    SCF-B-0114 validate: PASS (29 units; counts derived from fixed BASE; static-only)

    python3 scaffold/nfr-implementation-evidence-0114/selfcheck.py
    SCF-B-0114 selfcheck: PASS (24 negative cases; expected error codes matched)

    python3 scaffold/tools/scfctl.py validate

#1813は進捗参照のみであり、Issue close、merge、formal crosswalk／authority／successorの変更は行わない。旧code／test／runtime／CIと現行runtime／CIは実行しない。

## 未解決

旧unit implementation成立、旧failure receipt、unit-level degradation、consumer closure、current implementation／operation／acceptance、未実装判定、product authority、successor assignmentは保留する。candidate asset、catalog status、phase transition、coverage.failure、current documentの存在、validator合格を実装・縮退・failure・未実装・受入・完了へ変換しない。
