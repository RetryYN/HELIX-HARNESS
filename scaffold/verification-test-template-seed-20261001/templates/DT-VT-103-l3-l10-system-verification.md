# DT-VT-103 検証方法：L3 要件 ↔ L10 総合検証（P3）

## 契約（seed候補）

| 項目 | 内容 |
|---|---|
| template ID／版 | `DT-VT-103`／`0.1.0-seed-candidate` |
| 状態 | seed候補。採否なし（DST-HARNESS-005は未採択の要求候補） |
| 想定する持ち主 | HELIX-HARNESS-CORE（段階ごとの検証の契約と状態の遷移、HARNESS-L2-022）。汎用の型はHELIX-BRAIN。テストとCIの運転、ticketの発行、検収はHELIX-OS |
| 適用条件 | L3 要件の成果物に対の検証を行うとき。全件の実行を既定にせず、HARNESS-L2-005の規則（Forwardの大きさ、risk、触るコネクタ）で要否を決める |
| 適用判定の記録 | DT-VT-001 §2（非適用、理由、判断者、HEAD、要求への影響、再評価条件） |
| 必須入力（左腕のtest basis） | 承認済みのL3要件、システムに固有の義務の一覧、下位の証明のreceipt、組合せの契約。欠けたら検証を始めず、欠けた入力を左側の持ち主へ戻す |
| 右腕のtest condition | 下位の証明を積み上げたうえで、システムに固有の義務が満たされるか |
| 成果物の状態 | Integrated→Verified（HARNESS-L2-022） |
| 対（V-pair） | P3：L3 要件 ↔ L10 総合検証（HARNESS-L2-040の6組） |
| 区分 | composite（システム） |
| 関係 | DT-VT-001（共通欄）、DT-VT-002（技法カード）、DT-VT-003（選び方の案）、HARNESS-L2-022、HARNESS-L2-056（対ごとのgate結果） |
| 差戻し先 | 意味の変更が要る不一致は、見つけた検証層で戻し先を固定しない。意味が変わる左側の層へBackflowする（詳細の契約はL5、architectureや境界はL4、要求や受入はL3／L2、製品の価値はL1。HARNESS-L2-022、HARNESS-L2-003／004）。振る舞い・契約・要求を保てる不一致は、右側でRefactorして同じ段階の検証をやり直す。右側が左側のauthorityを黙って書き換えない |
| 計測 | 数値の閾値は置かない。測る場合はHARNESS-L2-034の14項目に従い、値はL3で根拠付きで導く |
| 1.0の境界 | —（1.0の範囲。本番規模の負荷はWeb展開後に扱う） |
| 出典 | HARNESS-L2-003、HARNESS-L2-005、HARNESS-L2-022、HARNESS-L2-040、HARNESS-L2-056。旧資産は下の「旧HELIXとの対応」 |
| 限界 | 対ごとの観点と技法の組合せは材料であり、正式な検証義務ではない。検証義務はHARNESS-L2-005の規則からL3で導く |
| 置き換え | 正式な検証契約（HARNESS-L2-022の具体化）が入ったら`superseded`とし、観点・証拠・差戻し先の行き先を対応づける |

### 不成立例（negative oracle）

- 下位が全部greenなので、システムもVerifiedとする。
- 未知のbaselineや閾値を推測してgreenにする（HARNESS-L2-034）。
- 下位の証明の再実行ばかりで、システムに固有の義務の差分を見ない。
- 設計側と検証側のoracle identityが一致しないのに、対を成立とする（HARNESS-L2-056）。
- 対の片側（設計の義務または検証の証拠）が欠けているのに、greenとする。

### 正例と境界の負例

- 正例：要件X-7の固有義務（台帳投入→6組の評価→結果表示）を1本のE2Eで確かめ、残りは下位の証明のreceiptを参照した。
- 境界の負例：Forward 小・中の変更で、C21を省いた。省いた理由と回収先のticketを記録すれば成立する。記録がなければ不成立。

### 完了条件

照合の観点ごとに、DT-VT-001の共通欄と下の必須証拠があるか、理由付きのN/Aである。oracle identityが両側で一致している。unknownを成立にしていない。**本templateの完了条件を満たしても、成果物の状態を上げる判定は別の契約（HARNESS-L2-022）による。**

## 本体

### 1. 照合の観点

| 観点 | 使う技法（DT-VT-002） | 結果 | 証拠のref | N/Aの理由 |
|---|---|---|---|---|
| 下位の証明とシステムに固有の義務との差分だけを確かめる（HARNESS-L2-005、HARNESS-L2-022） | | | | |
| 非機能の値ごとの測定方法と合否（DT-SDOP-002の完了条件、HARNESS-L2-034の計測契約） | | | | |
| L3要件と実物の照合（Scoped Reverse。HARNESS-L2-003／004） | | | | |

### 2. 技法の早見（DT-VT-003 §1の抜き出し）

| 主力（oracleを与える） | 補助（oracleの強さを測る・変化を検出する） | 1.0で任意・後続 |
|---|---|---|
| C21（差分の証明）、C08、C30 | C07、C29 | — |

全pairに共通して、C01（review）、C02（trace）、C36（独立review）を使う。

### 3. 必須の証拠（共通欄に足す）

- `lower_proofs_ref`、`system_specific_obligations[{id, status}]`
- `composition_contract_ref`、`derived_mechanically`
- 性能を測る場合は、HARNESS-L2-034の14項目

### 4. 差戻しの記録

| finding | 意味の変更が要るか | 戻し先（L1〜L5、または同じ段階のRefactor） | 根拠 |
|---|---|---|---|
| | | | |

### 5. 旧HELIXとの対応

| 旧source | 保持する点 | 変更する点 | 理由 |
|---|---|---|---|
| 旧 `L08-L14-verification-phase.md` 33（G10）・77・203、旧 `docs/design/helix/L3-requirements/scrum-reverse-verification-engine.md` 19–40、旧 `docs/test-design/helix/L3-pillar-acceptance-test-design.md` 41–45 | 要件ごとの受入の量を閉じる考え方（要件の件数、ACの件数、正常・異常・境界の観測）。計測契約の必須項目 | 旧G10の「機能要件・UX受入」をまとめた形は持ち込まない。画面の受入はL11（DT-VT-102）とL2.5で扱う | 現行はL10をシステムの証明、L11を利用者の受入として分けている（HARNESS-L2-003、HARNESS-L2-022） |

旧 `L08-L14-verification-phase.md` 39–40・207・213–220（対の凍結前のテスト設計を後付けしない、品質観点の不足は既存のテスト設計を書き換えずに追加のテスト設計として分ける）は、全pairで保持する候補とする。旧のpathと旧の工程名（add-design／add-impl）は持ち込まない。
