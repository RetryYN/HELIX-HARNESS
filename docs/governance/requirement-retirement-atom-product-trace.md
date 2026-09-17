# 旧要求9件 atom製品分割・L2／L11 trace案

status: draft_review_pending
authority_effect: none
source_atom_count: 71

## この表で行うこと

旧HELIX v1.3の9要求を構成する71 atomを一度ずつ扱い、HARNESSの工程・意味・検証契約、HELIX-OSの登録・推進・状態・証拠運転、両者へ分割が必要なatom、技術境界research前には割り当てられないatomへ分ける。これはsuccessor要求の作成、L2／L11採用、retire、意味変更ではない。

L11は独自IDを新設せず、現行draftで各L2 IDと対になる受入行への親trace候補だけを記録する。具体scenarioとnegative caseは、split atomを二つのsuccessor候補へ分けた後に作る。

## 集計

| 分類 | atom数 | 意味 |
|---|---:|---|
| HARNESS規範候補 | 26 | 外部提供する工程・意味・検証条件 |
| OS運転候補 | 14 | 登録・推進・拒否・出力・証拠管理 |
| HARNESS／OS分割必須 | 16 | 一つの旧atomに規範と運転が混在 |
| 技術境界research必須 | 15 | Node↔Python境界の存否・方式が未確定 |
| **計** | **71** | 原atomの欠落・重複なし |

## `HIL-FR-05`

| atom | 旧要求の意味 | 分類 | 製品候補 | L2／L11親trace候補 |
|---|---|---|---|---|
| `FR05-A01` | 設計欠陥をcanonical L1–L6の影響層へ割り当てる | OS運転候補 | HELIX-OS | `HELIXOS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |
| `FR05-A02` | L1企画変更ではL1/L12 pairをstale化する | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-003`<br>`HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |
| `FR05-A03` | L2要求変更ではL2/L11 pairをstale化する | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-003`<br>`HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |
| `FR05-A04` | L2要求変更ではScreen Applicability、prototypeまたはskip receiptをstale化する | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-003`<br>`HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |
| `FR05-A05` | 再freezeを要求する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-003`<br>`HARNESS-L2-004` |
| `FR05-A06` | Reverse→Redesign→pair-freeze→Forwardの順序を強制する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-003`<br>`HARNESS-L2-004` |
| `FR05-A07` | L0 charter変更をPOへescalateする | OS運転候補 | HELIX-OS | `HELIXOS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |
| `FR05-A08` | redesign PLAN、修正layer、stale edge、pair receiptを出力する | OS運転候補 | HELIX-OS | `HELIXOS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |

## `HIL-FR-31`

| atom | 旧要求の意味 | 分類 | 製品候補 | L2／L11親trace候補 |
|---|---|---|---|---|
| `FR31-A01` | affected layerがL1ならL1/L12 pairをstale化する | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-003`<br>`HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |
| `FR31-A02` | affected layerがL2ならL2/L11 pairをstale化する | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-003`<br>`HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |
| `FR31-A03` | screen applicability/prototype agreementをstale化する | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-003`<br>`HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |
| `FR31-A04` | 再承認前の実装claimを拒否する | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-003`<br>`HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |
| `FR31-A05` | 再承認前のForward合流を拒否する | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-003`<br>`HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |
| `FR31-A06` | stale edge、re-entry task、re-freeze receiptを出力する | OS運転候補 | HELIX-OS | `HELIXOS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |

## `HIL-BR-17`

| atom | 旧要求の意味 | 分類 | 製品候補 | L2／L11親trace候補 |
|---|---|---|---|---|
| `BR17-A01` | Claude監査findingを対象とする | OS運転候補 | HELIX-OS | `HELIXOS-L2-010`<br>`HELIXOS-L2-013` |
| `BR17-A02` | current contract影響と責務境界で機械的にdispositionする | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `BR17-A03` | 同じ責務・既存scope内で安全かつ局所的に閉じるfindingをcurrent_pr_fixにする | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `BR17-A04` | current_pr_fixをwriterへ返す | OS運転候補 | HELIX-OS | `HELIXOS-L2-010`<br>`HELIXOS-L2-013` |
| `BR17-A05` | 独立責務・別設計・lifecycle・性能改善だけをsuccessor_issueにする | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `BR17-A06` | successor_issueをIssue、Universal Reverse、memory要約、Codex ready queueへ同一causality chainで接続する | OS運転候補 | HELIX-OS | `HELIXOS-L2-010`<br>`HELIXOS-L2-013` |
| `BR17-A07` | AIの自由判断だけによるfinding破棄を禁止する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `BR17-A08` | 後続Issueのcurrent PRへの再流入を禁止する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-003`<br>`HARNESS-L2-005` |

## `HIL-FR-30`

| atom | 旧要求の意味 | 分類 | 製品候補 | L2／L11親trace候補 |
|---|---|---|---|---|
| `FR30-A01` | current contract違反、correctness/security/data loss、必須oracle/main/evidenceへの影響と責務境界を評価する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `FR30-A02` | 同じ責務・既存scope内で安全かつ局所的に閉じるfindingをcurrent_pr_fixにする | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `FR30-A03` | 独立責務・別設計・lifecycle・性能改善をsuccessor_issueにする | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `FR30-A04` | successor_issueだけからPromotion Pipelineを起動する | OS運転候補 | HELIX-OS | `HELIXOS-L2-010`<br>`HELIXOS-L2-013` |
| `FR30-A05` | 重複判定を行う | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-003`<br>`HARNESS-L2-005`<br>`HELIXOS-L2-010`<br>`HELIXOS-L2-013` |
| `FR30-A06` | Issue contract、Universal Reverse、memory issue-summary、Codex queue itemを同一causality IDで原子的に生成する | OS運転候補 | HELIX-OS | `HELIXOS-L2-010`<br>`HELIXOS-L2-013` |
| `FR30-A07C` | current_pr_fixをwriterへ返却する | OS運転候補 | HELIX-OS | `HELIXOS-L2-010`<br>`HELIXOS-L2-013` |
| `FR30-A07U` | current_pr_fixを一括返却する | OS運転候補 | HELIX-OS | `HELIXOS-L2-010`<br>`HELIXOS-L2-013` |
| `FR30-A08` | 途中欠落があればreadyにしない | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `FR30-A09` | typed disposition、writer return、Issue/Reverse/memory/queue joinを出力する | OS運転候補 | HELIX-OS | `HELIXOS-L2-010`<br>`HELIXOS-L2-013` |

## `HIL-BR-24`

| atom | 旧要求の意味 | 分類 | 製品候補 | L2／L11親trace候補 |
|---|---|---|---|---|
| `BR24-A01` | 要件定義そのものを設計対象として台帳化する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009` |
| `BR24-A02` | 原文、原子要求、authority、分類、scope、priority、acceptance oracle、capability/service、template適用、design obligation、revisionを一つの履歴へ結ぶ | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `BR24-A03` | trace行の存在だけを要件定義完了とみなさない | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009` |

## `HIL-FR-45`

| atom | 旧要求の意味 | 分類 | 製品候補 | L2／L11親trace候補 |
|---|---|---|---|---|
| `FR45-A01` | stable requirement IDとimmutable revisionを持つ | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `FR45-A02` | source atom、canonical statement、BR/FR/TR/NFR、modality、priority、scope/non-goal、authority/rationale、acceptance oracle、owner、risk、capability/service、template applicability、design obligationを型付きedgeで保存する | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `FR45-A03` | split/merge/rename/supersede/reject/N/Aを変更操作として扱う | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009` |
| `FR45-A04` | 変更にはbefore/after semantic digestを要求する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009` |
| `FR45-A05` | 変更には全source atom dispositionを要求する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009` |
| `FR45-A06` | 変更にはdownstream staleを要求する | OS運転候補 | HELIX-OS | `HELIXOS-L2-001`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `FR45-A07` | 変更にはreview authority付きreceiptを要求する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009` |
| `FR45-A08` | requirement definition/revision、typed edge、change/applicability receipt、orphan/stale findingを出力する | OS運転候補 | HELIX-OS | `HELIXOS-L2-001`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |

## `HIL-NFR-26`

| atom | 旧要求の意味 | 分類 | 製品候補 | L2／L11親trace候補 |
|---|---|---|---|---|
| `NFR26-A01` | 文書、template、見出し、入力欄の存在だけを設計完全性とみなさない | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-005`<br>`HARNESS-L2-009` |
| `NFR26-A02` | 各設計義務を意味のある設計内容へ個別接続する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-005`<br>`HARNESS-L2-009` |
| `NFR26-A03` | 各設計義務に双方向edgeを要求する | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-004`<br>`HARNESS-L2-005`<br>`HARNESS-L2-009`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `NFR26-A04` | 各設計義務にtest oracleまたはscope付きN/A receiptを要求する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-005`<br>`HARNESS-L2-009` |
| `NFR26-A05` | TBD、空欄、範囲表記、1行での複数義務消込を拒否する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-005`<br>`HARNESS-L2-009` |

## `HIL-NFR-28`

| atom | 旧要求の意味 | 分類 | 製品候補 | L2／L11親trace候補 |
|---|---|---|---|---|
| `NFR28-A01` | requirement coverageの行数、ID連番、文書存在だけを要件定義の設計完全性としない | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009` |
| `NFR28-A02` | 各active requirementをsource atomへ個別接続する | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `NFR28-A03` | 各active requirementをauthorityへ個別接続する | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `NFR28-A04` | 各active requirementをacceptance oracleへ個別接続する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009` |
| `NFR28-A05` | 各active requirementをservice/capabilityまたは根拠付き非該当へ個別接続する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009` |
| `NFR28-A06` | 各active requirementをtemplate applicabilityへ個別接続する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009` |
| `NFR28-A07` | 各active requirementをdesign obligationへ個別接続する | HARNESS規範候補 | HELIX-HARNESS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009` |
| `NFR28-A08` | 未解決ambiguity、orphan、stale revisionをgreenにしない | HARNESS／OS分割必須 | HELIX-HARNESS／HELIX-OS | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |

## `HIL-TR-08`

| atom | 旧要求の意味 | 分類 | 製品候補 | L2／L11親trace候補 |
|---|---|---|---|---|
| `TR08-A01` | Node↔Pythonを対象runtime境界とする | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A02` | child processをtransport方式とする | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A03T` | JSON Lines over stdioを正規IPC方式とする | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A03Q` | protocolをversion管理する | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A04T` | stdoutをtransport channelとして使用する | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A04Q` | protocol channelへ診断出力を混在させない | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A05T` | stderrを診断channelとして使用する | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A05Q` | 診断channelをprotocol channelから分離する | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A06` | envelopeにschemaを持つ | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A07` | envelopeにrun identityを持つ | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A08` | envelopeにrequest identityを持つ | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A09` | envelopeにtypeを持つ | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A10` | envelopeにsequenceを持つ | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A11` | envelopeにdeadlineを持つ | 技術境界research必須 | 未割当 | 未割当（research待ち） |
| `TR08-A12` | envelopeにpayload digestを持つ | 技術境界research必須 | 未割当 | 未割当（research待ち） |

## 分割後に必要な作業

1. `split_required` 16 atomを、意味を増減させずHARNESS規範atomとOS運転atomへ分ける。
2. それぞれを完全IDのL2要求文と照合し、L2の範囲外なら新しい要求候補として仮登録する。
3. 各L2対L11行に、利用者が確認する結果と反例を割り当てる。既存L11文で覆えない条件を勝手に補完しない。
4. 旧BR→FRの2群は上位→具体化trace、NFR群は異なる分母の接続traceを維持する。
5. `HIL-TR-08`は新世代runtime境界のresearch／PoCまで保留し、Node、Python、child process、stdioを現行要求へ固定しない。
6. 全71 atomのsuccessor coverageが揃った後にだけ、完全重複が残る旧identityをretirement質問候補へ再抽出する。

## 停止条件

本表では質問、回答、successor採用、retirement判断を行わない。製品分割とL2／L11親traceのexact HEAD reviewで欠落・誤分類が0になった後、16 split atomの具体的な二分案へ進む。
