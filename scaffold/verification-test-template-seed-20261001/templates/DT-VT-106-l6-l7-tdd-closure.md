# DT-VT-106 検証方法：L6 実装 ↔ L7（TDDの閉じ・test実装）（P6）

## 契約（seed候補）

| 項目 | 内容 |
|---|---|
| template ID／版 | `DT-VT-106`／`0.1.0-seed-candidate` |
| 状態 | seed候補。採否なし（DST-HARNESS-005は未採択の要求候補） |
| 想定する持ち主 | HELIX-HARNESS-CORE（段階ごとの検証の契約と状態の遷移、HARNESS-L2-022）。汎用の型はHELIX-BRAIN。テストとCIの運転、ticketの発行、検収はHELIX-OS |
| 適用条件 | L6 実装の成果物に対の検証を行うとき。全件の実行を既定にせず、HARNESS-L2-005の規則（Forwardの大きさ、risk、触るコネクタ）で要否を決める |
| 適用判定の記録 | DT-VT-001 §2（非適用、理由、判断者、HEAD、要求への影響、再評価条件） |
| 必須入力（左腕のtest basis） | 凍結済みの設計の範囲、oracle ID、先に書くtest。欠けたら検証を始めず、欠けた入力を左側の持ち主へ戻す |
| 右腕のtest condition | 先に書いたtestが期待した理由で失敗し、実装後に成功し、局所のRefactorがpublic contractを変えないか |
| 成果物の状態 | Working→Provisional（原子CI。HARNESS-L2-003） |
| 対（V-pair） | P6：L6 実装 ↔ L7（TDDの閉じ・test実装）（HARNESS-L2-040の6組） |
| 区分 | unit |
| 関係 | DT-VT-001（共通欄）、DT-VT-002（技法カード）、DT-VT-003（選び方の案）、HARNESS-L2-022、HARNESS-L2-056（対ごとのgate結果） |
| 差戻し先 | 意味の変更が要る不一致は、見つけた検証層で戻し先を固定しない。意味が変わる左側の層へBackflowする（詳細の契約はL5、architectureや境界はL4、要求や受入はL3／L2、製品の価値はL1。HARNESS-L2-022、HARNESS-L2-003／004）。振る舞い・契約・要求を保てる不一致は、右側でRefactorして同じ段階の検証をやり直す。右側が左側のauthorityを黙って書き換えない |
| 計測 | 数値の閾値は置かない。測る場合はHARNESS-L2-034の14項目に従い、値はL3で根拠付きで導く |
| 1.0の境界 | — |
| 出典 | HARNESS-L2-003、HARNESS-L2-005、HARNESS-L2-022、HARNESS-L2-040、HARNESS-L2-056。旧資産は下の「旧HELIXとの対応」 |
| 限界 | 対ごとの観点と技法の組合せは材料であり、正式な検証義務ではない。検証義務はHARNESS-L2-005の規則からL3で導く |
| 置き換え | 正式な検証契約（HARNESS-L2-022の具体化）が入ったら`superseded`とし、観点・証拠・差戻し先の行き先を対応づける |

### 不成立例（negative oracle）

- Redを観測していない（最初からgreen）のに、振る舞いを確かめたとする。
- Greenの後でRedを作る。testを実装に合わせて書き換える。
- 原子CIの合格を、品質の証明・システムの成立・受入とする（HARNESS-L2-003）。
- 設計側と検証側のoracle identityが一致しないのに、対を成立とする（HARNESS-L2-056）。
- 対の片側（設計の義務または検証の証拠）が欠けているのに、greenとする。

### 正例と境界の負例

- 正例：trace gateの実装前に「孤立したL3要件があるfixtureでgateがfailする」testを書き、判定がpassを返すことによるRedを観測してから実装した。
- 境界の負例：振る舞いを変えない純粋なRefactor。既存testが契約を固めていることを示せば、Redは不要と記録して成立する。

### 完了条件

照合の観点ごとに、DT-VT-001の共通欄と下の必須証拠があるか、理由付きのN/Aである。oracle identityが両側で一致している。unknownを成立にしていない。**本templateの完了条件を満たしても、成果物の状態を上げる判定は別の契約（HARNESS-L2-022）による。**

## 本体

### 1. 照合の観点

| 観点 | 使う技法（DT-VT-002） | 結果 | 証拠のref | N/Aの理由 |
|---|---|---|---|---|
| Red→Green→局所のRefactor→原子CI（HARNESS-L2-003） | | | | |
| Redの失敗理由が期待どおりか（import error等をRedにしない） | | | | |
| 局所のRefactorが、public contract・要求・architectureの意味・stateの意味を変えないこと | | | | |

### 2. 技法の早見（DT-VT-003 §1の抜き出し）

| 主力（oracleを与える） | 補助（oracleの強さを測る・変化を検出する） | 1.0で任意・後続 |
|---|---|---|
| C11、C03、C13 | C09、C10、C17、C18、C34 | C27 |

全pairに共通して、C01（review）、C02（trace）、C36（独立review）を使う。

### 3. 必須の証拠（共通欄に足す）

- `red_run{head_sha, failing_assertion, message}`、`green_run{head_sha}`
- `refactor_changes_public_contract: false`
- `rule_set_digest`、`local_ci_config_equal`

### 4. 差戻しの記録

| finding | 意味の変更が要るか | 戻し先（L1〜L5、または同じ段階のRefactor） | 根拠 |
|---|---|---|---|
| | | | |

### 5. 旧HELIXとの対応

| 旧source | 保持する点 | 変更する点 | 理由 |
|---|---|---|---|
| 旧 `L08-L14-verification-phase.md` 30（G7）、旧 `docs/test-design/harness/L7-unit-test-design.md` 73–91、旧 `docs/skills/test-driven-development.md` 32–77 | Red→Green→Refactorと、oracleの強さ（exactな値、mockはprocessの境界だけ）。テスト戦略と検証戦略を分け、実走の主張を単体のgreenで閉じないこと | 旧`helix doctor`、旧`helix review --uncommitted`、Vitestのrunnerの注意は持ち込まない | 旧CLI・旧runtimeを起動しない（AGENTS.md）。現行はHARNESS-L2-003の谷の規則による |

旧 `L08-L14-verification-phase.md` 39–40・207・213–220（対の凍結前のテスト設計を後付けしない、品質観点の不足は既存のテスト設計を書き換えずに追加のテスト設計として分ける）は、全pairで保持する候補とする。旧のpathと旧の工程名（add-design／add-impl）は持ち込まない。
