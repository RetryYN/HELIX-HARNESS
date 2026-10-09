# HELIX-HARNESS 共通カーネル L8詳細検証設計（K1/K2/K3/K4/K5/K6/K9/G3）

status: draft
owner: HELIX-HARNESS
parent_requirement: なし（要素別にCommon Kernel L4 §2.1／§3.1／§9.2／§10.2／§13.1／§16.1／§17.1の直接crosswalkへtrace。HARNESS-L2-031を親にしない）
paired_l5: ../L5-detail-design/common-kernel.md
base: main `d5bb3455526c816b3af965db239c4b56207a884f`

本書はK1/K2/K3/K4/K5/K6/K9/G3のL5公開契約とL9 fixture oracleを詳細fixtureへtraceする設計草稿である。契約はCommon Kernel L4の意味を保ち、期待値はPair L9の既存項目を展開したものとする。K9は§9でL4 §17/L9 IV-K9-01–15を下位化し、K7/K8/K10は`not_designed`で現行参照のみとする。すべて未実行であり、pass、実装完成、L10成立を示さない。

## 1. 固定入力とtrace

| 入力 | revision・scope | SHA-256 |
|---|---|---|
| Common Kernel L4 | main `3961daac08d032ad512026e8365fafd9eae831c5`の本文pin：`docs/helix-harness/L4-basic-design/common-kernel.md` §2/§3/§9/§10/§13/§16/§17 | `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` |
| Repository Layout L4 | main `3961daac08d032ad512026e8365fafd9eae831c5`の本文pin：`docs/helix-harness/L4-basic-design/repository-layout.md` §2–3、RL-C/D/T/K、§6.1/§10 | `6968876dad1760257686108064520e1e98783b6034ca19bac7d6c7df1a3385f1` |
| Common Kernel L9 | main `3961daac08d032ad512026e8365fafd9eae831c5`の本文pin：`docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md` K1/K2、IV-K3全27識別子、IV-K4-01–10、IV-G3-01–05、IV-K5-01–26、IV-K6-01–15、IV-K7/IV-LDG関連行、IV-K9-01–15 | `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` |
| paired L5 | 本PRのcontent HEADへ含める本文pin：`docs/helix-harness/L5-detail-design/common-kernel.md` §3/§4/§6/§7/§8/§9/§10 | SHA-256 `1310b538c268532a4aa15d3b47048bcdf592e6a6a85af88c2fb9fa08986a43a7` |
| Paired L7 | `docs/helix-harness/L7-unit-test-design/common-kernel-unit-test-design.md`; content SHA-256 `35afbdbe465df71cd5b8badcf47b270ad43aa37817566c1e7800a87866fd774c` (本PRのcontent HEAD) | L7 suite IDs and function mapping |
