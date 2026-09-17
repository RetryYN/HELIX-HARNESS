# 旧要求9件 atom製品分割・L2／L11 trace案

status: draft_review_pending
authority_effect: none
source_atom_count: 71

## 判定規則

- **HARNESS規範候補**: 適用scope、分類語彙、成立・禁止・合否・証拠条件だけを定め、登録・実行・状態遷移・保存を含まない。
- **OS運転候補**: 既に定義された成果物を割当、返却、生成、結線、保存するだけで、関係型・完全性条件・工程語彙・合否条件を定義しない。既定義のIssue等を同一causalityで結線する運転はここに含む。
- **HARNESS／OS分割必須**: 「要求する・拒否する・強制する・出力する」、または完全性条件として関係の型・接続先を要求する文のように、規範条件と適用・状態管理が一つの旧atomに同居する。
- **技術境界research必須**: 旧Node↔Python境界の存在・方式を前提とし、新世代境界のresearch／PoC前には製品へ割り当てられない。

片側単独へ置く場合は、もう片側の責務を含まない理由を各行の機械台帳に記録する。分割必須atomは、HARNESS sliceとOS sliceを人間表にも示す。

## 集計

| 分類 | atom数 |
|---|---:|
| HARNESS規範候補 | 10 |
| OS運転候補 | 6 |
| HARNESS／OS分割必須 | 40 |
| 技術境界research必須 | 15 |
| **計** | **71** |

## `HIL-FR-05`

設計欠陥を影響層へ戻し、V-pairを再凍結してForwardへ復帰させる要求。

source: [旧要求無損失台帳](legacy-requirement-carry-forward.jsonl) / revision 1 / `sha256:e547dbc9b001e344da3953e672675621d353d69137f1e69c2b548c8c232a163d`

product routing台帳の根拠句: 「layer／V-pair／stale化／再freeze条件はHARNESS、影響layerへの割当と再実行統制はOSである」

> Redesign routerは設計欠陥をcanonical L1–L6の影響層へ割り当てる。L1企画変更はL12運用テストpairを、L2要求変更はL11受入テストpairとScreen Applicability/prototypeまたはskip receiptをstale化して再freezeし、Reverse→Redesign→pair-freeze→Forwardの順序を強制する。層外L0 charter変更はPOへescalateする。 | redesign PLAN、修正layer、stale edge、pair receipt

| atom | 分類 | HARNESS slice候補 | OS slice候補 | atom別L2／L11親trace候補 |
|---|---|---|---|---|
| `FR05-A01`<br>設計欠陥をcanonical L1–L6の影響層へ割り当てる | OS運転候補 | なし | 設計欠陥をcanonical L1–L6の影響層へ割り当てる | `HELIXOS-L2-003` |
| `FR05-A02`<br>L1企画変更ではL1/L12 pairをstale化する | HARNESS／OS分割必須 | L1企画変更ではL1/L12 pairをstale対象とする | L1企画変更を検出してL1/L12 pairをstale状態へ変更する | `HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-007` |
| `FR05-A03`<br>L2要求変更ではL2/L11 pairをstale化する | HARNESS／OS分割必須 | L2要求変更ではL2/L11 pairをstale対象とする | L2要求変更を検出してL2/L11 pairをstale状態へ変更する | `HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-007` |
| `FR05-A04`<br>L2要求変更ではScreen Applicability、prototypeまたはskip receiptをstale化する | HARNESS／OS分割必須 | L2要求変更ではScreen Applicability、prototypeまたはskip receiptをstale対象とする | L2要求変更を検出して該当するScreen Applicability、prototypeまたはskip receiptをstale状態へ変更する | `HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-007` |
| `FR05-A05`<br>再freezeを要求する | HARNESS／OS分割必須 | 再freezeを工程上の必要条件とする | 対象成果を再freeze処理へ送り | `HARNESS-L2-003`<br>`HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-011` |
| `FR05-A06`<br>Reverse→Redesign→pair-freeze→Forwardの順序を強制する | HARNESS／OS分割必須 | Reverse→Redesign→pair-freeze→Forwardを正規の工程順序とする | 正規順序以外の進行を拒否し、Reverse→Redesign→pair-freeze→Forwardの順に状態を進める | `HARNESS-L2-003`<br>`HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-011` |
| `FR05-A07`<br>L0 charter変更をPOへescalateする | HARNESS／OS分割必須 | L0 charter変更は工程内で処理せずPO escalationを必要とする | L0 charter変更をPOへescalateする | `HARNESS-L2-003`<br>`HELIXOS-L2-004` |
| `FR05-A08`<br>redesign PLAN、修正layer、stale edge、pair receiptを出力する | HARNESS／OS分割必須 | redesign PLAN、修正layer、stale edge、pair receiptを必須出力とする | redesign PLAN、修正layer、stale edge、pair receiptを生成して記録する | `HARNESS-L2-005`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |

## `HIL-FR-31`

上流変更後、再承認前の実装claimとForward合流を止める再入場要求。

source: [旧要求無損失台帳](legacy-requirement-carry-forward.jsonl) / revision 1 / `sha256:9982b94a7b289c1f852d5777f0cd06ee05058d272ef97d06bbc6c3acc720723d`

product routing台帳の根拠句: 「上流変更時のV-pair・prototype再freeze条件はHARNESS、stale伝播とclaim拒否運転はOSである」

> Upstream Redesign Re-entryはaffected layerがL1ならL1/L12 pairを、L2ならL2/L11 pairとscreen applicability/prototype agreementをstale化し、再承認前の実装claimとForward合流を拒否する。 | stale edge、re-entry task、re-freeze receipt

| atom | 分類 | HARNESS slice候補 | OS slice候補 | atom別L2／L11親trace候補 |
|---|---|---|---|---|
| `FR31-A01`<br>affected layerがL1ならL1/L12 pairをstale化する | HARNESS／OS分割必須 | affected layerがL1ならL1/L12 pairをstale対象とする | affected layerがL1のときL1/L12 pairをstale状態へ変更する | `HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-007` |
| `FR31-A02`<br>affected layerがL2ならL2/L11 pairをstale化する | HARNESS／OS分割必須 | affected layerがL2ならL2/L11 pairをstale対象とする | affected layerがL2のときL2/L11 pairをstale状態へ変更する | `HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-007` |
| `FR31-A03`<br>screen applicability/prototype agreementをstale化する | HARNESS／OS分割必須 | screen applicability/prototype agreementをstale対象とする | 該当するscreen applicability/prototype agreementをstale状態へ変更する | `HARNESS-L2-004`<br>`HELIXOS-L2-003`<br>`HELIXOS-L2-007` |
| `FR31-A04`<br>再承認前の実装claimを拒否する | HARNESS／OS分割必須 | 再承認前の実装claimを拒否すべき条件とする | 再承認状態を評価し、未承認なら実装claimを拒否する | `HARNESS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-011` |
| `FR31-A05`<br>再承認前のForward合流を拒否する | HARNESS／OS分割必須 | 再承認前のForward合流を拒否すべき条件とする | 再承認状態を評価し、未承認ならForward合流を拒否する | `HARNESS-L2-003`<br>`HELIXOS-L2-004`<br>`HELIXOS-L2-011` |
| `FR31-A06`<br>stale edge、re-entry task、re-freeze receiptを出力する | HARNESS／OS分割必須 | stale edge、re-entry task、re-freeze receiptを必須出力とする | stale edge、re-entry task、re-freeze receiptを生成して記録する | `HARNESS-L2-005`<br>`HELIXOS-L2-007`<br>`HELIXOS-L2-011` |

## `HIL-BR-17`

audit findingを現PR修正か後続Issueへ振り分ける上位業務要求。

source: [旧要求無損失台帳](legacy-requirement-carry-forward.jsonl) / revision 1 / `sha256:e55bdf0ac2daabc541038f11887fd2099993870993dc131097955ca9f817c1a1`

product routing台帳の根拠句: 「finding分類の責務境界はHARNESS、writer返却・Issue・queue生成はOS推進である」

> Claude監査findingをcurrent contract影響と責務境界で機械的にdispositionする。同じ責務・既存scope内で安全かつ局所的に閉じるfindingは`current_pr_fix`としてwriterへ返し、独立責務・別設計・lifecycle・性能改善だけを`successor_issue`としてIssue、Universal Reverse、memory要約、Codex ready queueへ同一causality chainで接続する。AIの自由判断だけによるfinding破棄と、後続Issueのcurrent PRへの再流入を認めない。

| atom | 分類 | HARNESS slice候補 | OS slice候補 | atom別L2／L11親trace候補 |
|---|---|---|---|---|
| `BR17-A01`<br>Claude監査findingを対象とする | HARNESS規範候補 | Claude監査findingを対象とする | なし | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `BR17-A02`<br>current contract影響と責務境界で機械的にdispositionする | HARNESS／OS分割必須 | current contract影響と責務境界をdispositionの判定軸とする | current contract影響と責務境界を使ってfindingを機械的にdispositionする | `HARNESS-L2-003`<br>`HARNESS-L2-005`<br>`HELIXOS-L2-010` |
| `BR17-A03`<br>同じ責務・既存scope内で安全かつ局所的に閉じるfindingをcurrent_pr_fixにする | HARNESS規範候補 | 同じ責務・既存scope内で安全かつ局所的に閉じるfindingをcurrent_pr_fixにする | なし | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `BR17-A04`<br>current_pr_fixをwriterへ返す | OS運転候補 | なし | current_pr_fixをwriterへ返す | `HELIXOS-L2-010` |
| `BR17-A05`<br>独立責務・別設計・lifecycle・性能改善だけをsuccessor_issueにする | HARNESS規範候補 | 独立責務・別設計・lifecycle・性能改善だけをsuccessor_issueにする | なし | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `BR17-A06`<br>successor_issueをIssue、Universal Reverse、memory要約、Codex ready queueへ同一causality chainで接続する | OS運転候補 | なし | successor_issueをIssue、Universal Reverse、memory要約、Codex ready queueへ同一causality chainで接続する | `HELIXOS-L2-010`<br>`HELIXOS-L2-013` |
| `BR17-A07`<br>AIの自由判断だけによるfinding破棄を禁止する | HARNESS／OS分割必須 | AIの自由判断だけによるfinding破棄を禁止条件とする | finding破棄の根拠を評価し、AIの自由判断だけなら破棄を拒否して記録する | `HARNESS-L2-003`<br>`HARNESS-L2-005`<br>`HELIXOS-L2-010` |
| `BR17-A08`<br>後続Issueのcurrent PRへの再流入を禁止する | HARNESS／OS分割必須 | 後続Issueのcurrent PRへの再流入を禁止条件とする | 後続Issueの流入先を評価し、current PRへの再流入を拒否して記録する | `HARNESS-L2-003`<br>`HARNESS-L2-005`<br>`HELIXOS-L2-010` |

## `HIL-FR-30`

finding分類方針をwriter返却と後続ticket生成として実行する機能要求。

source: [旧要求無損失台帳](legacy-requirement-carry-forward.jsonl) / revision 1 / `sha256:d4fa1ac2785a9989d6e783094a89324f908a0eb20ab53d3138f51677e4e2cd7c`

product routing台帳の根拠句: 「findingの責務境界とdisposition条件はHARNESS、writer返却・Issue生成・queue joinはOS推進である」

> Finding Dispositionはcurrent contract違反、correctness/security/data loss、必須oracle/main/evidenceへの影響と責務境界を評価し、同じ責務・既存scope内で安全かつ局所的に閉じるfindingを`current_pr_fix`、独立責務・別設計・lifecycle・性能改善を`successor_issue`へ分類する。Finding Promotion Pipelineは`successor_issue`だけから重複判定、Issue contract、Universal Reverse、memory issue-summary、Codex queue itemを同一causality IDで原子的に生成する。`current_pr_fix`はwriterへ一括返却し、途中欠落はreadyにしない。 | typed disposition、writer return、Issue/Reverse/memory/queue join

| atom | 分類 | HARNESS slice候補 | OS slice候補 | atom別L2／L11親trace候補 |
|---|---|---|---|---|
| `FR30-A01`<br>current contract違反、correctness/security/data loss、必須oracle/main/evidenceへの影響と責務境界を評価する | HARNESS規範候補 | current contract違反、correctness/security/data loss、必須oracle/main/evidenceへの影響と責務境界を評価する | なし | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `FR30-A02`<br>同じ責務・既存scope内で安全かつ局所的に閉じるfindingをcurrent_pr_fixにする | HARNESS規範候補 | 同じ責務・既存scope内で安全かつ局所的に閉じるfindingをcurrent_pr_fixにする | なし | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `FR30-A03`<br>独立責務・別設計・lifecycle・性能改善をsuccessor_issueにする | HARNESS規範候補 | 独立責務・別設計・lifecycle・性能改善をsuccessor_issueにする | なし | `HARNESS-L2-003`<br>`HARNESS-L2-005` |
| `FR30-A04`<br>successor_issueだけからPromotion Pipelineを起動する | HARNESS／OS分割必須 | successor_issueだけをPromotion Pipelineの起動許可対象とする | dispositionを評価し、successor_issueの場合だけPromotion Pipelineを起動する | `HARNESS-L2-003`<br>`HARNESS-L2-005`<br>`HELIXOS-L2-010` |
| `FR30-A05`<br>重複判定を行う | HARNESS／OS分割必須 | 重複判定を必須処理とする | 対象候補の重複判定を実行して結果を記録する | `HARNESS-L2-005`<br>`HELIXOS-L2-013` |
| `FR30-A06`<br>Issue contract、Universal Reverse、memory issue-summary、Codex queue itemを同一causality IDで原子的に生成する | OS運転候補 | なし | Issue contract、Universal Reverse、memory issue-summary、Codex queue itemを同一causality IDで原子的に生成する | `HELIXOS-L2-010`<br>`HELIXOS-L2-013` |
| `FR30-A07C`<br>current_pr_fixをwriterへ返却する | OS運転候補 | なし | current_pr_fixをwriterへ返却する | `HELIXOS-L2-010` |
| `FR30-A07U`<br>current_pr_fixを一括返却する | OS運転候補 | なし | current_pr_fixを一括返却する | `HELIXOS-L2-010` |
| `FR30-A08`<br>途中欠落があればreadyにしない | HARNESS／OS分割必須 | 途中欠落がある状態をreadyにしてはならない | 途中欠落を評価し、欠落があればready遷移を拒否する | `HARNESS-L2-003`<br>`HARNESS-L2-005`<br>`HELIXOS-L2-010` |
| `FR30-A09`<br>typed disposition、writer return、Issue/Reverse/memory/queue joinを出力する | HARNESS／OS分割必須 | typed disposition、writer return、Issue/Reverse/memory/queue joinを必須出力とする | typed disposition、writer return、Issue/Reverse/memory/queue joinを生成して記録する | `HARNESS-L2-005`<br>`HELIXOS-L2-010`<br>`HELIXOS-L2-013` |

## `HIL-BR-24`

要件定義自体を設計対象として履歴へ結ぶ上位業務要求。

source: [旧要求無損失台帳](legacy-requirement-carry-forward.jsonl) / revision 1 / `sha256:9727fd0b427f18eb8b6839f2f2f97d1d13ed88059b0c05738b887ed127c9809d`

product routing台帳の根拠句: 「要求atom・設計義務等の意味契約はHARNESS、版付き履歴と分類projection管理はOSである」

> 要件定義そのものを設計対象として台帳化し、原文、原子要求、authority、分類、scope、priority、acceptance oracle、capability/service、template適用、design obligation、revisionを一つの履歴へ結ぶ。trace行の存在だけを要件定義完了とみなさない。

| atom | 分類 | HARNESS slice候補 | OS slice候補 | atom別L2／L11親trace候補 |
|---|---|---|---|---|
| `BR24-A01`<br>要件定義そのものを設計対象として台帳化する | HARNESS規範候補 | 要件定義そのものを設計対象として台帳化する | なし | `HARNESS-L2-008`<br>`HARNESS-L2-009` |
| `BR24-A02`<br>原文、原子要求、authority、分類、scope、priority、acceptance oracle、capability/service、template適用、design obligation、revisionを一つの履歴へ結ぶ | HARNESS／OS分割必須 | 原文、原子要求、authority、分類、scope、priority、acceptance oracle、capability/service、template適用、design obligation、revisionを結ぶ関係の意味を定義する | 定義された関係を一つの履歴として登録・保存する | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HARNESS-L2-009`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `BR24-A03`<br>trace行の存在だけを要件定義完了とみなさない | HARNESS規範候補 | trace行の存在だけを要件定義完了とみなさない | なし | `HARNESS-L2-004`<br>`HARNESS-L2-008` |

## `HIL-FR-45`

ID、revision、typed edge、変更receiptを扱うledger機能要求。

source: [旧要求無損失台帳](legacy-requirement-carry-forward.jsonl) / revision 1 / `sha256:e13451d529dd90b9d37e1b42eb180f20b183ec7b20f5ece2e6b8b02acdd7acda`

product routing台帳の根拠句: 「要求revision・typed edge・変更receiptの意味契約はHARNESS、immutable ledgerとstale管理はOS登録責務である」

> Requirement Definition Ledgerはstable requirement IDとimmutable revisionを持ち、source atom、canonical statement、BR/FR/TR/NFR、modality、priority、scope/non-goal、authority/rationale、acceptance oracle、owner、risk、capability/service、template applicability、design obligationを型付きedgeで保存する。split/merge/rename/supersede/reject/N/Aはbefore/after semantic digest、全source atom disposition、downstream stale、review authorityを持つreceiptがある場合だけ適用する。 | requirement definition/revision、typed edge、change/applicability receipt、orphan/stale finding

| atom | 分類 | HARNESS slice候補 | OS slice候補 | atom別L2／L11親trace候補 |
|---|---|---|---|---|
| `FR45-A01`<br>stable requirement IDとimmutable revisionを持つ | HARNESS／OS分割必須 | requirement IDをstable、revisionをimmutableとする | stable IDを登録し、既存revisionを変更せず新revisionとして保存する | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-007` |
| `FR45-A02`<br>source atom、canonical statement、BR/FR/TR/NFR、modality、priority、scope/non-goal、authority/rationale、acceptance oracle、owner、risk、capability/service、template applicability、design obligationを型付きedgeで保存する | HARNESS／OS分割必須 | 列挙されたrequirement field間のtyped edgeの型と意味を定義する | 列挙されたfieldとtyped edgeを保存する | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-007` |
| `FR45-A03`<br>split/merge/rename/supersede/reject/N/Aを変更操作として扱う | HARNESS／OS分割必須 | split/merge/rename/supersede/reject/N/Aを正規の変更操作とする | 指定された変更操作を適用して履歴を保存する | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-007` |
| `FR45-A04`<br>変更にはbefore/after semantic digestを要求する | HARNESS／OS分割必須 | 変更にはbefore/after semantic digestを必須証拠とする | 変更時にbefore/after semantic digestを記録する | `HARNESS-L2-004`<br>`HARNESS-L2-005`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-007` |
| `FR45-A05`<br>変更には全source atom dispositionを要求する | HARNESS／OS分割必須 | 変更には全source atom dispositionを必須条件とする | 変更時に全source atomのdispositionを記録し | `HARNESS-L2-004`<br>`HARNESS-L2-005`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-007` |
| `FR45-A06`<br>変更にはdownstream staleを要求する | HARNESS／OS分割必須 | 変更にはdownstreamをstaleにする条件を含める | 変更の影響先をstale状態へ変更して伝播を記録する | `HARNESS-L2-004`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `FR45-A07`<br>変更にはreview authority付きreceiptを要求する | HARNESS／OS分割必須 | 変更にはreview authority付きreceiptを必須証拠とする | review authority付きreceiptを記録する | `HARNESS-L2-004`<br>`HARNESS-L2-005`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-007` |
| `FR45-A08`<br>requirement definition/revision、typed edge、change/applicability receipt、orphan/stale findingを出力する | HARNESS／OS分割必須 | requirement definition/revision、typed edge、change/applicability receipt、orphan/stale findingを必須出力とする | 列挙された出力を生成して保存する | `HARNESS-L2-004`<br>`HARNESS-L2-005`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-007` |

## `HIL-NFR-26`

design obligationごとの設計完全性を確認する品質要求。

source: [旧要求無損失台帳](legacy-requirement-carry-forward.jsonl) / revision 1 / `sha256:239e05f4a6d7453b7b5c6c966ded8acbf1ee6565a38518cc43f8869800cd839f`

product routing台帳の根拠句: 「設計義務の意味ある消込条件はHARNESS、edge・oracle・N/A receiptの個別管理はOSである」

> 文書、template、見出し、入力欄の存在だけを設計完全性とみなさない。各義務は意味のある設計内容、双方向edge、test oracleまたはscope付きN/A receiptで個別消込し、`TBD`、空欄、範囲表記、1行での複数義務消込を拒否する。

| atom | 分類 | HARNESS slice候補 | OS slice候補 | atom別L2／L11親trace候補 |
|---|---|---|---|---|
| `NFR26-A01`<br>文書、template、見出し、入力欄の存在だけを設計完全性とみなさない | HARNESS規範候補 | 文書、template、見出し、入力欄の存在だけを設計完全性とみなさない | なし | `HARNESS-L2-005`<br>`HARNESS-L2-009` |
| `NFR26-A02`<br>各設計義務を意味のある設計内容へ個別接続する | HARNESS／OS分割必須 | 各設計義務と意味のある設計内容を個別に結ぶ関係を完全性条件とする | 各設計義務と設計内容の関係を個別に登録する | `HARNESS-L2-009`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `NFR26-A03`<br>各設計義務に双方向edgeを要求する | HARNESS／OS分割必須 | 各設計義務に双方向edgeを必須関係とする | 各設計義務の双方向edgeを登録する | `HARNESS-L2-004`<br>`HARNESS-L2-009`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `NFR26-A04`<br>各設計義務にtest oracleまたはscope付きN/A receiptを要求する | HARNESS／OS分割必須 | 各設計義務にtest oracleまたはscope付きN/A receiptを必須条件とする | 各設計義務のtest oracleまたはscope付きN/A receiptを登録する | `HARNESS-L2-005`<br>`HARNESS-L2-009`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `NFR26-A05`<br>TBD、空欄、範囲表記、1行での複数義務消込を拒否する | HARNESS／OS分割必須 | TBD、空欄、範囲表記、1行での複数義務消込を拒否すべき条件とする | 設計義務の消込を評価し、列挙された不適格状態を拒否する | `HARNESS-L2-005`<br>`HARNESS-L2-009`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |

## `HIL-NFR-28`

active requirementごとの要求定義完全性を確認する品質要求。

source: [旧要求無損失台帳](legacy-requirement-carry-forward.jsonl) / revision 1 / `sha256:dcd5e597e7ffda1290911e74f7eb29498f59a07062c94c76e44bfe8e87f31357`

product routing台帳の根拠句: 「active requirementのcoverageと設計完全性契約はHARNESS、typed edge・orphan・stale検査運転はOSである」

> requirement coverageの行数、ID連番、文書存在だけを要件定義の設計完全性としない。各active requirementはsource atom、authority、acceptance oracle、service/capabilityまたは根拠付き非該当、template applicability、design obligationへ個別に結び、未解決ambiguity、orphan、stale revisionをgreenにしない。

| atom | 分類 | HARNESS slice候補 | OS slice候補 | atom別L2／L11親trace候補 |
|---|---|---|---|---|
| `NFR28-A01`<br>requirement coverageの行数、ID連番、文書存在だけを要件定義の設計完全性としない | HARNESS規範候補 | requirement coverageの行数、ID連番、文書存在だけを要件定義の設計完全性としない | なし | `HARNESS-L2-004`<br>`HARNESS-L2-008` |
| `NFR28-A02`<br>各active requirementをsource atomへ個別接続する | HARNESS／OS分割必須 | 各active requirementとsource atomを個別に結ぶ関係を完全性条件とする | 各active requirementとsource atomの関係を個別に登録する | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `NFR28-A03`<br>各active requirementをauthorityへ個別接続する | HARNESS／OS分割必須 | 各active requirementとauthorityを個別に結ぶ関係を完全性条件とする | 各active requirementとauthorityの関係を個別に登録する | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `NFR28-A04`<br>各active requirementをacceptance oracleへ個別接続する | HARNESS／OS分割必須 | 各active requirementとacceptance oracleを個別に結ぶ関係を完全性条件とする | 各active requirementとacceptance oracleの関係を個別に登録する | `HARNESS-L2-004`<br>`HARNESS-L2-005`<br>`HARNESS-L2-008`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `NFR28-A05`<br>各active requirementをservice/capabilityまたは根拠付き非該当へ個別接続する | HARNESS／OS分割必須 | 各active requirementとservice/capabilityまたは根拠付き非該当を個別に結ぶ関係を完全性条件とする | 各active requirementとservice/capabilityまたは根拠付き非該当の関係を個別に登録する | `HARNESS-L2-004`<br>`HARNESS-L2-008`<br>`HELIXOS-L2-002` |
| `NFR28-A06`<br>各active requirementをtemplate applicabilityへ個別接続する | HARNESS／OS分割必須 | 各active requirementとtemplate applicabilityを個別に結ぶ関係を完全性条件とする | 各active requirementとtemplate applicabilityの関係を個別に登録する | `HARNESS-L2-008`<br>`HARNESS-L2-009`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `NFR28-A07`<br>各active requirementをdesign obligationへ個別接続する | HARNESS／OS分割必須 | 各active requirementとdesign obligationを個別に結ぶ関係を完全性条件とする | 各active requirementとdesign obligationの関係を個別に登録する | `HARNESS-L2-004`<br>`HARNESS-L2-009`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |
| `NFR28-A08`<br>未解決ambiguity、orphan、stale revisionをgreenにしない | HARNESS／OS分割必須 | 未解決ambiguity、orphan、stale revisionがある状態をgreenにしてはならない | 未解決ambiguity、orphan、stale revisionを個別に評価し、該当時はgreen遷移を拒否する | `HARNESS-L2-004`<br>`HARNESS-L2-005`<br>`HARNESS-L2-008`<br>`HELIXOS-L2-001`<br>`HELIXOS-L2-002`<br>`HELIXOS-L2-007` |

## `HIL-TR-08`

Node↔Python IPCの旧方式と境界品質を固定する技術要求。

source: [旧要求無損失台帳](legacy-requirement-carry-forward.jsonl) / revision 1 / `sha256:4b8901dea297c274a7055c0c26840eef6a309aec0647557573de9372ffed2c95`

product routing台帳の根拠句: 「HARNESS Python semantic coreとOS側Python workerを含むNode／Python境界へ同じIPC契約を適用するため分割する」

> Node↔Pythonの初期正規IPCはchild process＋versioned JSON Lines over stdioとし、stdoutをprotocol、stderrを診断専用にする。envelopeはschema/run/request/type/sequence/deadline/payload digestを持つ。

| atom | 分類 | HARNESS slice候補 | OS slice候補 | atom別L2／L11親trace候補 |
|---|---|---|---|---|
| `TR08-A01`<br>Node↔Pythonを対象runtime境界とする | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A02`<br>child processをtransport方式とする | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A03T`<br>JSON Lines over stdioを正規IPC方式とする | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A03Q`<br>protocolをversion管理する | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A04T`<br>stdoutをtransport channelとして使用する | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A04Q`<br>protocol channelへ診断出力を混在させない | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A05T`<br>stderrを診断channelとして使用する | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A05Q`<br>診断channelをprotocol channelから分離する | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A06`<br>envelopeにschemaを持つ | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A07`<br>envelopeにrun identityを持つ | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A08`<br>envelopeにrequest identityを持つ | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A09`<br>envelopeにtypeを持つ | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A10`<br>envelopeにsequenceを持つ | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A11`<br>envelopeにdeadlineを持つ | 技術境界research必須 | なし | なし | 未割当（research待ち） |
| `TR08-A12`<br>envelopeにpayload digestを持つ | 技術境界research必須 | なし | なし | 未割当（research待ち） |

## 次に必要な作業

1. `split_required` 40 atomの二つのsliceが、元の意味を過不足なく分割しているかreviewする。
2. 各sliceを完全IDのL2要求文と照合し、L2範囲外なら新しい要求候補として仮登録する。
3. 各L2対L11行に利用者が確認する結果と反例を割り当てる。既存L11文で覆えない条件を補完しない。
4. BR→FRの2群は上位→具体化trace、NFR群は異なる分母の接続traceを維持する。
5. `HIL-TR-08`はresearch／PoCまで保留し、Node、Python、child process、stdioを現行要求へ固定しない。
6. 全71 atomのsuccessor coverage後にだけ、完全重複が残る旧identityをretirement質問候補へ再抽出する。

## 停止条件

本表では質問、回答、successor採用、retirement判断を行わない。製品分割とatom別L2／L11親traceのexact HEAD reviewで欠落・誤分類が0になった後、40 split atomのsuccessor候補化へ進む。
