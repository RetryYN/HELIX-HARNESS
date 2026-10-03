# DT-VT-105 検証方法：L5 詳細設計 ↔ L8（L5詳細設計との照合）（P5）

## 契約（seed候補）

| 項目 | 内容 |
|---|---|
| template ID／版 | `DT-VT-105`／`0.1.0-seed-candidate` |
| 状態 | seed候補。採否なし（DST-HARNESS-005は未採択の要求候補） |
| 想定する持ち主 | HELIX-HARNESS-CORE（段階ごとの検証の契約と状態の遷移、HARNESS-L2-022）。汎用の型はHELIX-BRAIN。テストとCIの運転、ticketの発行、検収はHELIX-OS |
| 適用条件 | L5 詳細設計の成果物に対の検証を行うとき。全件の実行を既定にせず、HARNESS-L2-005の規則（Forwardの大きさ、risk、触るコネクタ）で要否を決める |
| 適用判定の記録 | DT-VT-001 §2（非適用、理由、判断者、HEAD、要求への影響、再評価条件） |
| 必須入力（左腕のtest basis） | L5詳細設計の契約（関数・状態・事前条件・事後条件・不変条件・失敗・rollback・端の値）、oracle ID。欠けたら検証を始めず、欠けた入力を左側の持ち主へ戻す |
| 右腕のtest condition | 実物が詳細設計の契約どおりか |
| 成果物の状態 | Provisional→Integrated の最初の段階（HARNESS-L2-022：L8でL5と照合するScoped Reverse） |
| 対（V-pair） | P5：L5 詳細設計 ↔ L8（L5詳細設計との照合）（HARNESS-L2-040の6組） |
| 区分 | unit（詳細設計の単位） |
| 関係 | DT-VT-001（共通欄）、DT-VT-002（技法カード）、DT-VT-003（選び方の案）、HARNESS-L2-022、HARNESS-L2-056（対ごとのgate結果） |
| 差戻し先 | 意味の変更が要る不一致は、見つけた検証層で戻し先を固定しない。意味が変わる左側の層へBackflowする（詳細の契約はL5、architectureや境界はL4、要求や受入はL3／L2、製品の価値はL1。HARNESS-L2-022、HARNESS-L2-003／004）。振る舞い・契約・要求を保てる不一致は、右側でRefactorして同じ段階の検証をやり直す。右側が左側のauthorityを黙って書き換えない |
| 計測 | 数値の閾値は置かない。測る場合はHARNESS-L2-034の14項目に従い、値はL3で根拠付きで導く |
| 1.0の境界 | — |
| 出典 | HARNESS-L2-003、HARNESS-L2-005、HARNESS-L2-022、HARNESS-L2-040、HARNESS-L2-056。旧資産は下の「旧HELIXとの対応」 |
| 限界 | 対ごとの観点と技法の組合せは材料であり、正式な検証義務ではない。検証義務はHARNESS-L2-005の規則からL3で導く |
| 置き換え | 正式な検証契約（HARNESS-L2-022の具体化）が入ったら`superseded`とし、観点・証拠・差戻し先の行き先を対応づける |

### 不成立例（negative oracle）

- 境界値を実装のコードから読んで期待値にする（同源化）。
- 禁止遷移を試さず、正常系の遷移だけを通す。
- mockの期待を確かめただけで、詳細設計の契約を確かめたことにする。
- 設計側と検証側のoracle identityが一致しないのに、対を成立とする（HARNESS-L2-056）。
- 対の片側（設計の義務または検証の証拠）が欠けているのに、greenとする。

### 正例と境界の負例

- 正例：負債のratchet（前回より件数が増えたらfail）で、前回10件に対し9・10・11件、前回0件、前回unknownを確かめ、unknownをpassにしないことを期待値に含めた。
- 境界の負例：入力を持たない単純な結線。C04を理由付きのN/Aにできる。

### 完了条件

照合の観点ごとに、DT-VT-001の共通欄と下の必須証拠があるか、理由付きのN/Aである。oracle identityが両側で一致している。unknownを成立にしていない。**本templateの完了条件を満たしても、成果物の状態を上げる判定は別の契約（HARNESS-L2-022）による。**

## 本体

### 1. 照合の観点

| 観点 | 使う技法（DT-VT-002） | 結果 | 証拠のref | N/Aの理由 |
|---|---|---|---|---|
| 詳細設計の表の行・マス（デシジョンテーブル、状態×イベント）をすべて検証へ結ぶ（DT-SDOP-004 §7） | | | | |
| 端の値・同値・状態遷移の禁止遷移 | | | | |
| L5と実物の照合（Scoped Reverse） | | | | |

### 2. 技法の早見（DT-VT-003 §1の抜き出し）

| 主力（oracleを与える） | 補助（oracleの強さを測る・変化を検出する） | 1.0で任意・後続 |
|---|---|---|
| C04、C05、C06、C12、C13 | C10、C15、C16 | C27 |

全pairに共通して、C01（review）、C02（trace）、C36（独立review）を使う。

### 3. 必須の証拠（共通欄に足す）

- `partitions`、`boundaries`、`uncovered_partitions`
- `rules[{conditions, action, test_id}]`、`invalid_transitions_tested`
- `doubles[{target, kind, fidelity_check_ref}]`

### 4. 差戻しの記録

| finding | 意味の変更が要るか | 戻し先（L1〜L5、または同じ段階のRefactor） | 根拠 |
|---|---|---|---|
| | | | |

### 5. 旧HELIXとの対応

| 旧source | 保持する点 | 変更する点 | 理由 |
|---|---|---|---|
| 旧 `L08-L14-verification-phase.md` 31（G8）・75・201、旧 `docs/governance/ddd-tdd-rules.md` 51–66・144–152、旧 `docs/skills/test-thinking.md` 44–65 | L5の事前条件・事後条件・不変条件・失敗・rollback・端の値を単体・結合のoracleと対にする配置。oracleの強さ（truthinessだけの検査を禁止）とseeded defectをkillする証拠。壊れ方の6つの視点 | 旧のL8を「integration」とする呼び方は写さない。旧`mutation_oracle_evidence`の欄名、旧PLAN frontmatterは持ち込まない | 現行はL8をL5詳細設計との照合（Scoped Reverse）として定めている（HARNESS-L2-003／004、HARNESS-L2-022） |

旧 `L08-L14-verification-phase.md` 39–40・207・213–220（対の凍結前のテスト設計を後付けしない、品質観点の不足は既存のテスト設計を書き換えずに追加のテスト設計として分ける）は、全pairで保持する候補とする。旧のpathと旧の工程名（add-design／add-impl）は持ち込まない。
