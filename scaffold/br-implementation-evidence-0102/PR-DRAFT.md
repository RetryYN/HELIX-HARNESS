# Draft PR

## Title

`research: BR01-05 7 unit implementation evidence crosswalk (SCF-B-0102)`

## 目的

`36784d25aa4cc53d89c28c2ff81b4009db234605`を基準HEADとして、旧IRのHIL-BR-01〜05をsplitした7 unit、Wave1〜50 scan、対象21 semantic review edge、旧asset 16件を静的に照合する。旧実装source候補、旧failure／degradation、旧consumer、現行実装、現行受入を独立フィールドで保持し、直接証拠がない状態はunknownの理由とcounter-evidenceを付けて保留する。

これはcrosswalk 218行のうち先頭BR01〜05由来7 unitを対象にしたpilotであり、旧実装・縮退の全件判定ではない。7 unitについて証拠を分離して判定保留を固定する。

## 変更内容

- `inventory.json`で7 unit／21 edge／16 asset、Wave1〜50のscan fileと証拠partitionを固定。
- `evidence.jsonl`で、crosswalk source、代表candidate、旧asset ledger／decision／read-after、Git blob／source bytes／line anchor、旧実装候補、failure／degradation／consumer、current refsをunit別に記録。
- 旧`implementation_source`を静的候補としてのみ記録し、旧unit実装成立を主張しない。phase transitionと`coverage.failure`は実行failure receiptへ昇格しない。
- 現行L2／L11／Scaffoldは候補・境界の静的証拠として記録し、現行実装／operation／acceptanceをunknownに保持する。未実装は断定しない。
- `validate.py`と`selfcheck.py`を追加し、bytes／digest／blob／anchorと期待error code付き11負例を検査。
- `SCF-B-0102` Bindingへbundle全成果物を登録。

GUIレビュー `GUI-2054-RESPONSE-01` の指摘に対応し、consumer status／observed refs／closure evidenceをedgeとledgerから再導出して照合する。`counter_evidence`の全key・値とunitごとの`unresolved`集合も再導出し、固定BASEの祖先性と入力path digestを検証する。

入力digestとline／anchor digestはlive working treeではなく、固定BASEのGit object bytesから計算する。BASEに存在しない入力や祖先でないHEADはfail-closeする。

## 検証

```text
python3 scaffold/br-implementation-evidence-0102/validate.py
SCF-B-0102 validate: PASS (7 units, 21 review edges, 16 old assets; static-only)

python3 scaffold/br-implementation-evidence-0102/selfcheck.py
SCF-B-0102 selfcheck: PASS (11 negative cases; expected error codes matched)

python3 scaffold/tools/scfctl.py validate
bindings=98 fail=0
```

旧code／test／runtime／CI、新世代runtime／CIは実行していない。`#1813`は進捗参照のみであり、Issue closeを行わない。

## 未解決

unit実装成立、旧実行failure、unit-level degradation、consumer closure、current implementation／acceptance／operation、product owner決定、successor assignmentは保留中である。このScaffoldの検証合格を、要求採否・実装・受入・完了へ変換しない。
