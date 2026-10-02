# 旧HIL-NFR-19/20の現行条件照合

比較基準はmain `fd3e799710bf5b06081fee271e536fc7f51213ba`。詳しい原文、pin、各条件と現行L2/L11の対応は対の[JSON証拠](legacy-hil-nfr19-20-current-condition-audit-2026-10-02.json)に記録した。

## 判定

- **HIL-NFR-19**：旧原文の全条件にHARNESS-L2/L11-064の行き先がある。064は現在の未採択候補で、NFR-19の採択済み保証とは数えない。064のsource atomは4件で、そのうちの1つがNFR-19のsource slice。MPR行やreceiptの`authority_effect:none`は登録状態の記録であり、採否根拠ではない。確認した現行decision群に064の採択行はなく、旧NFR-19の正式後継もまだない。条件不足による重複候補は作らず、既存064 pairへの対応と未決authorityを分けて記録した。
- **HIL-NFR-20**：6条件すべてについて、HARNESS-L2-038とそのL11 oracleに意味上の対応がある。038の正確なrevisionは2026-09-29決定記録のrow 43で採択され、現在と採択対象のL2/L11 section digestも一致する。038が選択したsource atomはFR-22、FR-35、HOT-HIL-35の3件であり、HIL-NFR-20自体を登録したものではない。このため、038の選択scopeの内容保証は採択済みだが、NFR-20全体の正式後継や全source閉包は主張しない。

## 条件別の対応

### HIL-NFR-19

1. Linuxをcore completion platformとし、Linuxで必須core gate全件がgreenの場合だけcompletionとする：064 L2 1253/1255–1256、L11 970/973。
2. macOS portable suiteとWindows compatibility smokeの状態を別々に記録し、未実施・unknownを明示する：064 L2 1254–1256、L11 969/975–977。3 OSが明示scopeに含まれる場合、Linuxだけgreenでは3 OS条件を満たさない。
3. Windows wrapper結果をLinuxの証拠へ転用しない：064 L2 1256、L11 972/976。

この3条件は064の候補本文・受入例に具体的な反例つきである。しかし採択decisionは見つからず、旧IRのNFR-19 atomから064へのformal successor bindingも成立していない。旧IRのholding状態は`preserved_pending_rehome`。

### HIL-NFR-20

1. **非空**：038 L2 859、L11 598は空coverage表を内容のある完了として受け入れない。
2. **stage間非同一**：L2 859/861、L11 598/612/614は同じ内容やdigestを別stageへ使う偽閉包を拒否し、5つの異なるstage内容を検査する。
3. **source span再現性**：L2 849–850/868、L11 578/602/618でsource revision・digest・spanとscope receiptを結び、新しいsource revisionでは再固定する。
4. **obligation coverage 100%**：L2 857–858/867/889、L11 592–595/618/634–636でmanifestと結果の同一集合、個別join、checkpoint後の未完義務を扱う。欠落・重複・片方向joinは閉包を失敗させる。
5. **文字数だけでは内容証拠にならない**：L2 859/861、L11 598/612–614のsemantic oracleはplaceholder、コピー、coverage表だけの結果、stage内容なしを拒否する。これは内容検査から導かれる意味対応であり、数値の文字数しきい値は追加されていない。
6. **stage固有fieldとsemantic assertion**：L2 861/867、L11 612–614/618–620に、source map、observed contract、as-is design/test、intent hypothesisと既存PO検証状態、gapとowner/routingの5内容があり、段階を飛ばす例を拒否する。

## 保持境界

HIL-NFR-20のL2/L11受入意味は、採択済みHARNESS-L2-038-001の選択scopeで保持される。一方、旧NFR-20自体のcarry-forwardは`preserved_pending_rehome`で、formal successorは未設定。旧test `HAT-HIL-04`は設計状態のままで、今回実行していない。NFR-19/20とも、旧runtime・CLI・CI・testを起動していない。

監査のみを追加した。L2、L11、MPR、decision記録、候補状態、採択状態を変更していない。HARNESS-L2-082の新候補も作っていない。
