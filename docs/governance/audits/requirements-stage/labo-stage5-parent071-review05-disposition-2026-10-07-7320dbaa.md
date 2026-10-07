# HELIX-LABO-071 review05 postbody 時点監査

対象PR #2645、HEAD `7320dbaa25a052fa1571d5eae28d620b126d9473`（parent `fff0259e03964bf34223108c1cf4b9742df5da6d`）、base `0acbed34bfda48e32092feb63db61d2eff6d5ec4`。Root指定worktreeのGit blobを読み、6本文のbytes/SHA-256、base prefix、末尾LF、FVの旧ID保持と追加行を静的照合した。監査JSON: [labo-stage5-parent071-review05-disposition-2026-10-07-7320dbaa.json](labo-stage5-parent071-review05-disposition-2026-10-07-7320dbaa.json)（SHA-256 `dbef39c9401d207335b2520be231c12b71d7ca3424a529e275f018366265226d`）。

## 6本文の実測

| 文書 | 全体bytes | 全体SHA-256 | base後suffix bytes | suffix SHA-256 |
|---|---:|---|---:|---|
| `docs/helix-labo/L3-requirements/business-requirements.md` | 23554 | `2dd7a80e980b398edd0c7c9aadfe3f7ddcf940e01d8a98019e2b87b29df0a68d` | 6198 | `f88cbd8bd1e5cf72569f158025c85dcf04d4af6c516d9f4a476fb7050eb22589` |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | 322914 | `b257cd28667e337282444e9454bed5f77be149ed970521f751b7addcf10b227d` | 8159 | `1c66432bf993e9e80c0ddf74cf109b752fc5c5329bb607bef12eeb03d07903e9` |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | 77681 | `a74e197f67f7ab76743ee5dbab6495e1d6f871333b7294a33f3ad8103275b578` | 6732 | `fe29e9ae3cb0f070990d2afd2bb66d696cee7b5d0ea80ce289c4fa3075a43a62` |
| `docs/helix-labo/L10-verification/business-verification.md` | 21287 | `9dde43b0f457050a8eb0a7601651413d79642c2e844fef469108c0a6595157d4` | 5956 | `305754a89def7ef7570f70e08b6aca08b13de53bbc426a99a257bd1a145e77d7` |
| `docs/helix-labo/L10-verification/functional-verification.md` | 518864 | `ce147450d150b5bffd936937e7e28aa7ad23543f10024aba9eed11fac2fde35c` | 30867 | `46aad77ed41e71a52e9d955bc5ade6f5a34ab614cd4b0ce50ea23eb66b995af2` |
| `docs/helix-labo/L10-verification/nfr-verification.md` | 67755 | `2c369556d4a5c4188fd8e4ddf857e0061a059c108b879883a3d737556a792960` | 6954 | `62ec5644b04f4e6e7b4846d43f39f42ae77da5315297c7713b718248a3f7005c` |

6本文すべてでbase prefixはbyte一致し、実Git blobの末尾にLFがある。Root報告のgovcheck `7622/57/58`とdiffcheckはPASSとして記録した（Worker側では再実行していない）。

## review05 M1の追補と8セル

正式comment `6026495228` は旧HEAD `fff0259e03964bf34223108c1cf4b9742df5da6d` を対象に、L2-071:582の4項目（task class、model revision、evaluation scope、evidence）について不足/矛盾8セルのうちscope×矛盾に単独CASEがないと指摘した。現HEADではFR等の既存本文を保持し、FV tableに1行だけ追加した。B0でqualification scope S0とevidence scope S0が一致する状態から、evidenceのscope fieldだけをS1へ変え、qualificationをunknown/未評価にし、S1への外挿を拒否する。既存evaluation-evidence source owner責務区分への返却と個体identity unknownを分け、P0/H0/A0/titleは不変とする。

| 項目 | 状態 | 現行CASE | 状況 |
|---|---|---|---|
| task class | 不足 | `L10-LABO-071-CASE-05` | 既存対応 |
| task class | 矛盾 | `L10-LABO-071-CASE-03b` | 既存対応 |
| model revision | 不足 | `L10-LABO-071-CASE-06` | 既存対応 |
| model revision | 矛盾 | `L10-LABO-071-CASE-r03-evidence-qualification-revision-mismatch` | 既存対応 |
| evaluation scope | 不足 | `L10-LABO-071-CASE-07` | 既存対応 |
| evaluation scope | 矛盾 | `L10-LABO-071-CASE-r05-evidence-qualification-scope-conflict` | review05指摘への今回追加 |
| evaluation evidence | 不足 | `L10-LABO-071-CASE-08`、`L10-LABO-071-CASE-16` | 既存対応（receipt欠落／source identity欠落） |
| evaluation evidence | 矛盾 | `L10-LABO-071-CASE-03a`、`L10-LABO-071-CASE-r03-evidence-qualification-revision-mismatch` | 既存対応（stale source revision／qualificationとのrevision不一致。r03はrevision軸とも関係） |

FVは44 uniqueから45 uniqueとなり、旧44 IDを保持し、新規IDは`L10-LABO-071-CASE-r05-evidence-qualification-scope-conflict`のみ。旧L10の24 raw literalは先行監査で検証した記録を引き継いでJSONに保持する。8セル表は本文参照の静的対応で、実行や意味完全性を示さない。

review05 formalのR1–13は全PR comment raw historyとともにJSONに保存した。R3（stale定義）とR6（GitHub authority route）は原文・非blocking残余のままで、今回は変更していない。

## 検証限界

fixture、旧runtime、CI、独立review、Fable判断、PO承認は未実施/未発生。固定親・PO・旧asset A692の根拠pin、旧24 raw literal、過去監査は先行記録から参照し、過去ファイルは変更していない。canonical文書やdecision recordへの書込み、commit、pushはない。
