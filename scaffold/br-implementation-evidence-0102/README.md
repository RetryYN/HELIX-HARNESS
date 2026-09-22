# SCF-B-0102 BR01–05 実装証拠crosswalk研究

`IRUNIT-HIL-BR-01`〜`IRUNIT-HIL-BR-05`の先頭crosswalk 7 unitを対象に、Wave 1–50 semantic reviewで実際に固定されている21 edgeと、対応する旧asset 16件を静的に照合するresearch-only Scaffoldである。基準HEADは`36784d25aa4cc53d89c28c2ff81b4009db234605`で固定する。

このbundleでは、次の状態を別フィールドに保持する。

- 原文／source statement、search candidate、旧実装source候補、design、旧failure／degradation、旧consumer、現行実装、現行受入。
- 旧`implementation_source`は静的source候補の存在だけを示し、unit全体の実装成立には昇格させない。
- crosswalkの`transition_assessment`とsemantic reviewの`coverage.failure`はphase・分類上の評価であり、実行failure receiptではない。
- current L2／L11／Scaffoldは要求・境界・候補の証拠として列挙し、current implementation／operation／acceptanceは`unknown`に保持する。
- 直接の未実装証拠がないため、未実装を断定しない。unknownの理由とcounter-evidenceを各unitへ結び付ける。

## 成果物

- [`inventory.json`](inventory.json): 分母、対象、証拠partition、非推論境界。
- [`evidence.jsonl`](evidence.jsonl): 7 unitのsource snapshot、21 review edge、old asset ledger／decision／read-after、旧実装・failure・degradation・consumer、current refs、未解決欄。
- [`build.py`](build.py): 固定HEADを変えずに入力を静的読取してbundleを再生成する。
- [`validate.py`](validate.py): unit分母、crosswalk、wave edge、旧asset blob／bytes／anchor、current span digest、状態分離をfail-closedで検査する。
- [`selfcheck.py`](selfcheck.py): blob、anchor、edge set、current status、failure claim、ledger consumerを壊す6つの負例について期待error codeを照合する。

## 検証

```text
python3 scaffold/br-implementation-evidence-0102/validate.py
python3 scaffold/br-implementation-evidence-0102/selfcheck.py
```

検証は静的なJSON／Git bytes／digest／行anchorだけを扱う。旧code、旧test、旧runtime、旧CI、新世代runtimeを実行しない。`scfctl validate`はBinding `SCF-B-0102`の登録と全artifactを検査する。

## 保留

unit実装成立、旧実行failure、unit-level degradation、consumer closure、current implementation／acceptance／operation、product owner決定、successor assignmentは未確定である。validatorまたはScaffold Bindingの合格を、要求採否・実装・受入・完了へ変換しない。
