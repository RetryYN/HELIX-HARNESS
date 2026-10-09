# HELIX-HARNESS 共通カーネル L7単体試験設計（K1/K2/K3/K4/G3/K5/K6）

status: draft
owner: HELIX-HARNESS
scope: K1/K2/K3/K4/G3/K5/K6
paired_l5: ../L5-detail-design/common-kernel.md
paired_l6: ../L6-function-design/common-kernel.md
paired_l8: ../L8-detail-verification/common-kernel-detail-verification.md
base: `main` at `d5bb3455526c816b3af965db239c4b56207a884f` (current integration base; prior K5 candidate base `7715e7025212ea1a778ab9711e2f43241f7999c7` and intermediate base `f75199749888f7261772ba26e9feb58a33d9a04f` retained as history)

本書はL6のK1/K2/K3/K4/G3/K5/K6公開APIと内部関数を単体fixtureへ対応づけ、現行L4/L9の意味、失敗分類、fixture期待を変更せずL5/L8とのtraceを追加する。K3は194 formal fixtureと26件の別ID回帰method、K4/G3は§11の73 fixture、K5は91 formal IDと24件の補助ID、K6は§10の55個別設計fixtureを記録する。K5-22/23のowner未接続fixture 7件はlocal private-boundary assertionだけを実行し、L8 coverageには含めない。ローカルunit結果はL9合格、owner source接続、製品動作を示さない。K7–K10は`not_designed`でfixtureを追加しない。K6のprivate候補実装と52件の単体実行は§10.1に記録する。43件の局所assertion、2件の部分被覆、10件の未実行fixture ID、7件の別ID回帰を区別し、公開API・owner接続・CI登録は未了である。

## 1. 固定入力とtrace規則

| 入力 | 対象revision / SHA |
|---|---|
| Common Kernel L4 | `docs/helix-harness/L4-basic-design/common-kernel.md`; content SHA-256 `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` (main `d5bb3455526c816b3af965db239c4b56207a884f`) |
| Repository Layout L4 | `docs/helix-harness/L4-basic-design/repository-layout.md`; content SHA-256 `6968876dad1760257686108064520e1e98783b6034ca19bac7d6c7df1a3385f1` (unchanged at main `d5bb3455526c816b3af965db239c4b56207a884f`; earlier pin `33bbe8cd5f080be9e400e9259db22645bc620eda`) |
| L5詳細設計 | `docs/helix-harness/L5-detail-design/common-kernel.md`; current main source at `d5bb3455526c816b3af965db239c4b56207a884f`, content SHA-256 `3f3867df4e04927fbf05615984654f2994dd76ac71fed0ee420d5edce36a2c69`; historical PR #2751 source retained: commit `8d671541472f27a2d4d7b47992b6f428c0835eed`, content SHA-256 `ff24f1c74d17e3e5ed4aaedfc8163018891df6785de59e2de4fac3c33edf8ef4` (merge `dc803dacfbbe56f6daf7724832b1bfa238ff2087`) |
| L6関数設計草稿 | `docs/helix-harness/L6-function-design/common-kernel.md`; content SHA-256 `7775dd8901cac52f78bff6b0c71b414cc3fa628c8dac1b6932f0e80c09105f2f`（L7→L6一方向。L6にL7 SHAは置かない） |
