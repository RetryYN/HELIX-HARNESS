# DT-VT-101 検証方法：L1 企画 ↔ L12 運用評価（P1）

## 契約（seed候補）

| 項目 | 内容 |
|---|---|
| template ID／版 | `DT-VT-101`／`0.1.0-seed-candidate` |
| 状態 | seed候補。採否なし（DST-HARNESS-005は未採択の要求候補） |
| 想定する持ち主 | HELIX-HARNESS-CORE（段階ごとの検証の契約と状態の遷移、HARNESS-L2-022）。汎用の型はHELIX-BRAIN。テストとCIの運転、ticketの発行、検収はHELIX-OS |
| 適用条件 | L1 企画の成果物に対の検証を行うとき。全件の実行を既定にせず、HARNESS-L2-005の規則（Forwardの大きさ、risk、触るコネクタ）で要否を決める |
| 適用判定の記録 | DT-VT-001 §2（非適用、理由、判断者、HEAD、要求への影響、再評価条件） |
| 必須入力（左腕のtest basis） | L1企画の価値仮説と成功指標、SLOの定義（あれば）、Release Portの条件。欠けたら検証を始めず、欠けた入力を左側の持ち主へ戻す |
| 右腕のtest condition | 配備した製品が企画の価値仮説を満たすか、運用品質（SLO、rollback可能性）が保たれるか |
| 成果物の状態 | Deployed→Observed（HARNESS-L2-003。Observedは運用評価を通った状態で、Deployedと同じにしない） |
| 対（V-pair） | P1：L1 企画 ↔ L12 運用評価（HARNESS-L2-040の6組） |
| 区分 | composite（製品全体） |
| 関係 | DT-VT-001（共通欄）、DT-VT-002（技法カード）、DT-VT-003（選び方の案）、HARNESS-L2-022、HARNESS-L2-056（対ごとのgate結果） |
| 差戻し先 | 意味の変更が要る不一致は、見つけた検証層で戻し先を固定しない。意味が変わる左側の層へBackflowする（詳細の契約はL5、architectureや境界はL4、要求や受入はL3／L2、製品の価値はL1。HARNESS-L2-022、HARNESS-L2-003／004）。振る舞い・契約・要求を保てる不一致は、右側でRefactorして同じ段階の検証をやり直す。右側が左側のauthorityを黙って書き換えない |
| 計測 | 数値の閾値は置かない。測る場合はHARNESS-L2-034の14項目に従い、値はL3で根拠付きで導く |
| 1.0の境界 | 本番の監視基盤、canary、本番のchaos、tenantを横断する保持はWeb展開後に扱う。1.0ではRelease Portに条件を置き、localで確かめられる範囲だけを証拠にする |
| 出典 | HARNESS-L2-003、HARNESS-L2-005、HARNESS-L2-022、HARNESS-L2-040、HARNESS-L2-056。旧資産は下の「旧HELIXとの対応」 |
| 限界 | 対ごとの観点と技法の組合せは材料であり、正式な検証義務ではない。検証義務はHARNESS-L2-005の規則からL3で導く |
| 置き換え | 正式な検証契約（HARNESS-L2-022の具体化）が入ったら`superseded`とし、観点・証拠・差戻し先の行き先を対応づける |

### 不成立例（negative oracle）

- Deployedになったことを、Observedや価値の成立として扱う。
- 測れない仮説を「達成」とする。vanity metricで判定する。
- L12の結果をL1だけへ戻し、L0 charterへのfeedbackを落とす。
- 設計側と検証側のoracle identityが一致しないのに、対を成立とする（HARNESS-L2-056）。
- 対の片側（設計の義務または検証の証拠）が欠けているのに、greenとする。

### 正例と境界の負例

- 正例：企画仮説「人の判断の回数が減る」を、ticketの記録から配備前後の同じ長さの期間で比べ、判定と戻し先（L1、L0）を記録した。
- 境界の負例：配備していない製品。Observedへ進まない理由を非適用の記録で残し、L12を合格にしない。

### 完了条件

照合の観点ごとに、DT-VT-001の共通欄と下の必須証拠があるか、理由付きのN/Aである。oracle identityが両側で一致している。unknownを成立にしていない。**本templateの完了条件を満たしても、成果物の状態を上げる判定は別の契約（HARNESS-L2-022）による。**

## 本体

### 1. 照合の観点

| 観点 | 使う技法（DT-VT-002） | 結果 | 証拠のref | N/Aの理由 |
|---|---|---|---|---|
| 企画仮説ごとの指標・期間・判定 | | | | |
| L12の結果をL1企画と層外のL0 charterの両方へ戻す関係の識別（HARNESS-L2-056） | | | | |
| rollbackの手順を実際に通した記録（1.0ではlocalのrehearsalの範囲） | | | | |

### 2. 技法の早見（DT-VT-003 §1の抜き出し）

| 主力（oracleを与える） | 補助（oracleの強さを測る・変化を検出する） | 1.0で任意・後続 |
|---|---|---|
| C33 | C31 | C32（canary）、C28（本番chaos） |

全pairに共通して、C01（review）、C02（trace）、C36（独立review）を使う。

### 3. 必須の証拠（共通欄に足す）

- `hypothesis_id`、`metric_series_ref`、`period`、`verdict`
- `feedback_targets`（L1とL0の両方）
- rollbackのrehearsal記録（`done_at`、`result`、`time_to_restore`）

### 4. 差戻しの記録

| finding | 意味の変更が要るか | 戻し先（L1〜L5、または同じ段階のRefactor） | 根拠 |
|---|---|---|---|
| | | | |

### 5. 旧HELIXとの対応

| 旧source | 保持する点 | 変更する点 | 理由 |
|---|---|---|---|
| 旧 `L08-L14-verification-phase.md` 35（G12：価値・運用品質）・79（acceptance／smoke／operational metric／L12→L1/L0 feedback）・205 | L12→L1/L0のfeedbackと、受入・配布・運用・価値を一体で見る考え方 | 旧G13／G14のreceiptとcutover source ledgerは持ち込まない。「軽微なrelease問題はG12 evidenceを再取得」の固定の戻し先は、意味で戻し先を決める現行の規則に置き換える | 現行はL1–L12の6組で、旧G13／G14を独立のgateにしない（HARNESS-L2-040）。戻し先は現行HARNESS-L2-022の規則による |

旧 `L08-L14-verification-phase.md` 39–40・207・213–220（対の凍結前のテスト設計を後付けしない、品質観点の不足は既存のテスト設計を書き換えずに追加のテスト設計として分ける）は、全pairで保持する候補とする。旧のpathと旧の工程名（add-design／add-impl）は持ち込まない。
