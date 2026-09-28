# 旧設計契約portfolioとtemplate例被覆の原文照合

照合base `00d04085f75752f3f86b9fe0d8656a99066cd929`。PO合意済みHARNESS-L2-025/026（登録002）と対L11への未合意の変更提案を記録する。L1-009/005/001/004/007の設計・対検証責務に限定し、014の所有、旧runtime/schema、採択・実装権限を変更しない。

## 旧原文と所在

資産 `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`、file `sha256:db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。

- HIL-FR-54 `:144`、line `sha256:502ef00823463c0fd4218c7b554e4b6959fc28aa9006d6d6eb79f555b86b4f67`：| **HIL-FR-54** | Contract Portfolio Plannerはrequirement atomとDesign Obligation Graphを、authority、lifecycle、interface/data/state/event/failure/security/observability/operation、V-pair oracleの同値classへ分ける。各classにnormative contractを原則1件割り当て、既存契約の再利用、delta追加、新規作成、根拠付きN/Aを判定し、未被覆0かつ意味重複0となる最小portfolioを提案する。 | obligation-to-contract matrix、portfolio manifest、reuse/delta/new/N/A receipt、uncovered/duplicate finding |
- HIL-FR-55 `:145`、line `sha256:78a2e6c819e73153ce2bbd832c0f87777dba08750fa1b84fcafc916fa7cafa30`：| **HIL-FR-55** | Template Example Calibratorはactive templateの各validation ruleとapplicability branchに対し、最低限canonical positive 1件と境界negative 1件を要求する。状態遷移、failure、security、migration、multi-runtime差異はrisk分析で未被覆の場合だけ例を追加し、例の個数ではなくrule/branch/risk coverageで十分性を判定する。 | example adequacy matrix、positive/negative fixture、risk追加理由、redundancy finding |

## 保持・変更・戻し先

現025は端から端のinvariantと対oracle、現026は単体設計義務のtraceを持つ。原文FR54のclass別normative contract原則一件・reuse/delta/new/N/A・未被覆0・意味重複0は一般整合だけで充足とせず変更案に分ける。FR55のactive ruleとapplicability branchごとのcanonical positive最低1件・boundary negative最低1件も、PO合意済み本文へ無断適用せず変更案に分ける。risk未被覆時だけの追加と、例総数ではなく被覆を見る点を提案本文に保持する。

旧portfolio matrixとfixture schema/runnerを要求に固定しない。義務意味はHARNESS-L2-008、templateは009、設計unitは026、構成体は025、検証oracleは022へ戻す。旧原文2行はIRの同一identityと重複するため、独立要求数へ足し込まない。過去の空集合receipt/registerは書き換えない。原文2行をsource holdingへ保全するが、025/026の採用済み登録002をsupersedeせず、L2/L11現行本文と効力も変更しない。以下の変更案は最終横断照合後、他の新候補とは別の「採用済み要求への変更提案」としてPOに原文・選択肢・推奨・影響IDを示す。独立reviewとsource holdingは合意や受入実行ではない。

## PO判断用の変更案

現行有効版はHARNESS-L2-025/026の登録002と、対応する既存L11である。下記の文は**変更提案であり現行L2/L11本文には含めない**。判断は、A: 旧FR54/55の具体被覆を025/026とL11に採り込む、B: 現行の一般的な設計整合/内容oracleで十分とし旧FR54/55の条件を記録付きでretire・意味変更する、の二択。推奨A。Aなら既存025/026の責務・version_target 1.0を保持し、PO合意後にregister訂正revision・receipt・現行本文を対で更新する。Bなら旧数値最低義務を消す理由・影響と対象revisionをPO判断記録に明記する。影響ID: HARNESS-L2-025/026、HARNESS-L11-025/026、HARNESS-L2-009/022。014の利用者向け設計serviceの所有は変えない。

## L2変更案（未合意）

### HARNESS-L2-025 契約portfolioの全件被覆（追補）

採用済み025（登録002）の意味変更案。PO未合意。親L1、version_target: 1.0、014/026との所有を保持する。

対象revision/scopeのrequirement atomとHARNESS-L2-009/026が導いた設計義務を、authority、lifecycle、interface/data/state/event/failure/security/observability/operationおよびV-pair oracleの意味が同じ義務classへ区分する。各適用classにnormative contractを原則一件割り当て、既存契約の再利用、差分追加、新規作成、根拠付き非適用を区別する。既存契約との同義重複・孤立contract・未被覆classを検出し、未被覆0かつ意味重複0の最小portfolio候補と対応根拠を返す。異なる契約への分割が必要ならその理由と境界を示し、一つのclassを黙って重複所有させない。

unknownな義務、根拠のない非適用、競合するcontractは閉包失敗として、対象scope、影響するoracle、差戻し先を返す。旧matrix/schemaを固定せず、義務の意味が不明ならHARNESS-L2-008、L3意味ならauthority owner、template/設計分解ならHARNESS-L2-009/026へ戻す。portfolio提案は要求採択・設計承認・実装許可を生成しない。

旧source HIL-FR-54の保持・変更と原文所在は[照合記録](portfolio-fixture-legacy-differences-2026-09-28.md)に置く。

### HARNESS-L2-026 active templateの例被覆（追補）

採用済み026（登録002）の意味変更案。PO未合意。親L1、version_target: 1.0、014/025との所有を保持する。

対象scopeでactiveなDesign Templateの各validation ruleと各applicability branchに、canonical positive例を最低1件、境界negative例を最低1件結ぶ。正例は該当ruleを満たし、負例はそのruleの適用境界で拒否されるものとする。別branchの例や例の総数で代用しない。state transition、failure、security、migration、multi-runtime差異はrisk分析で未被覆と分かった場合に限り追加例を要求し、その理由と対象rule/branchを残す。十分性は例数だけではなくrule/branch/riskの被覆で判定する。

未見のtemplate版、rule、branchは既存fixtureから合格を推定せず、必要例と未評価を返す。template/rule適用範囲の不明はHARNESS-L2-009のownerへ、設計義務と対oracleの不足は026/022へ戻す。旧fixture schema/実行器を移植せず、例の被覆から設計承認や実装許可を生成しない。

旧source HIL-FR-55の保持・変更と原文所在は[照合記録](portfolio-fixture-legacy-differences-2026-09-28.md)に置く。

## L11変更案（未合意）

### HARNESS-L2-025/026 旧contract・template例被覆の受入追補

採用済み025/026の対L11への未合意の変更案。受入実行は未了。対象scope/revisionと固定oracleで判定する。

- **025正常**：入力された全requirement atomと設計義務を意味classに区分し、適用classごとに原則一つのnormative contractと対oracle、または根拠付き非適用へ結ぶ。reuse/delta/new/N/Aと根拠、孤立contract、未被覆class、意味重複を示し、未被覆0かつ重複0を同一revisionから再構成できる。
- **025誤り・未見**：同じ意味義務を二contractへ無説明で割り当てる、必須義務にcontract/oracleがない、非適用の根拠がない、または孤立contractを最小とする例は不合格。未見の義務classはunknownと影響を返し、unitの合格だけでcompositeの閉包を主張しない。
- **026正常**：active templateの各validation ruleと各applicability branchに、該当ruleを通すcanonical positive一件以上、境界で拒否するnegative一件以上をtraceし、risk上の追加対象も根拠とともに確認する。
- **026誤り・未見**：positiveまたはnegativeの片方が欠ける、境界外のnegative、別branchの例による穴埋め、risk未被覆を例の総数で隠す場合は不合格。未見template/rule/branchを既存fixtureから通過扱いせず未評価と必要例を返す。

## 後続候補への再配線（2026-09-28）

上記の025/026への追補は当時の未合意変更案として履歴保持する。現行候補では、旧HIL-FR-54のclass別契約coverage条件を新規HARNESS-L2-044と対L11へ、旧HIL-FR-55のrule／branch別例coverage条件をHARNESS-L2-043と対L11へ対応付ける。044は`version_target: 1.0`、親HARNESS-L1-001/004/009、未採択であり、採用済み025/026の本文・revisionは変更しない。旧packetの配置表記を超える個別所属と候補採択はPO判断待ちとし、既存source holding・append-only register・旧source atomは変更しない。
