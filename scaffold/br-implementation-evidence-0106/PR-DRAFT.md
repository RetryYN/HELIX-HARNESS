# Draft PR

## Title

research: HIL-BR-21-33 19 unit implementation evidence crosswalk (SCF-B-0106)

## 目的

固定BASE 5562f04da0f3205f9aa58205ec0d478419fc4f2e を基準に、HIL-BR-21〜33の13 source IDから派生した19 unit、Wave1〜50、対象55 semantic review edge、旧asset 38件を静的に照合する。旧実装source、旧failure／degradation、旧consumer、現行実装、現行受入を独立フィールドへ分け、直接証拠のないstatusはunknown／pendingと理由、counter-evidence、未解決欄を伴って保持する。

これはformal crosswalk、authority、successorを変更しない研究用Scaffoldである。candidate／requirement／design／implementation／acceptanceを混同せず、旧code／test／runtime／CIを実行しない。

## 変更内容

- inventory.jsonで19 unit、55 edge、38 old asset、57 current static refs、Wave1〜50のscan row、BASE ancestry、入力digestを固定する。
- evidence.jsonlでsource snapshot、representative candidate、旧asset ledger／decision／read-after、旧実装候補、failure／degradation／consumer、current refs、未解決欄をunit別に記録する。
- 旧implementation_sourceは静的候補としてのみ保持し、unit実装成立を主張しない。coverage.failure、phase transition、ledger statusは実行failure／縮退receiptへ昇格しない。
- current L2／L11／boundaryは候補参照として保持し、current implementation／operation／acceptanceをunknownにする。未実装を断定しない。
- evidence_refsはasset source_pathとの一致を要求せず、各refのpath／line／blobを固定BASE Git objectから個別検証する。Wave1〜17はraw span bytes（最終改行を含む）、Wave18〜50はCR/LF除去後のLF join（最終改行なし）というhash provenanceをinventoryとlegacy_anchor_resolutionに記録する。
- SCF-B-0106 Bindingへbundle全成果物を登録する。

## 検証

    python3 scaffold/br-implementation-evidence-0106/validate.py
    SCF-B-0106 validate: PASS (19 units, 55 review edges, 38 old assets; static-only)

    python3 scaffold/br-implementation-evidence-0106/selfcheck.py
    SCF-B-0106 selfcheck: PASS (13 negative cases; expected error codes matched)

    python3 scaffold/tools/scfctl.py validate

#1813は進捗参照のみであり、Issue close、merge、formal crosswalk／authority／successorの変更は行わない。旧code／test／runtime／CIと現行runtime／CIは実行しない。

## 未解決

旧unit implementation成立、旧failure receipt、unit-level degradation、consumer closure、current implementation／operation／acceptance、未実装判定、product authority、successor assignmentは保留する。candidate asset、catalog status、phase transition、current documentの存在、validator合格を実装・縮退・未実装・受入・完了へ変換しない。
