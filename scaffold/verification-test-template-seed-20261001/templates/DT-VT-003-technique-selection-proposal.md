# DT-VT-003 技法の選び方（提案）

## 契約（seed候補）

| 項目 | 内容 |
|---|---|
| template ID／版 | `DT-VT-003`／`0.1.0-seed-candidate` |
| 状態 | seed候補。採否なし。**本書の表は提案であり、規則・承認手続き・必須のgateではない** |
| 想定する持ち主 | HELIX-HARNESS-CORE（変更の内容・layer・riskから検証義務を導く規則、HARNESS-L2-005）。汎用の早見表はHELIX-BRAIN。CIの組み立てと運転はHELIX-OS |
| 適用条件 | 変更（ticket）ごとに、DT-VT-002のどのカードを使うかを決めるとき |
| 必須入力 | 変更の種類、risk（低・高とその根拠）、触る対、触るコネクタ、画面の有無。riskの根拠が無ければ「高」と推測せず、未解決として戻す |
| 関係 | DT-VT-001、DT-VT-002、DT-VT-101〜106。HARNESS-L2-005（Forward 小＝原子CI、中＝境界の証明、大＝システムの証明、高riskは小でも上位の証明を早める、省いた検査は記録して合流先のticketで回収する） |
| 対（V-pair） | 全6組 |
| 出典 | HARNESS-L2-005、HARNESS-L2-022、HARNESS-L2-034 714、HARNESS-L2-036。旧 `docs/process/forward/L08-L14-verification-phase.md` 73–79（右腕のevidence profile） |
| 限界 | riskを低・高の2段で示しただけであり、高riskの判定根拠はL3で導く。セルの記号は最小集合の案で、全件の実行を既定にしない。Web展開後に扱う項目（canary、本番chaos、本番SLO監視、脆弱性scan）は1.0で必須にしない |
| 置き換え | HARNESS-L2-005の規則がL3で導かれたら、本書は`superseded`とし、表の各セルの行き先を対応づける |

### 不成立例（negative oracle）

- 本書の表を、merge admissionや工程完了の条件として使う。
- 表の空欄や「—」を、記録なしのskipにする。
- 表に従ったことを、検証が足りている証拠にする。
- 本書を理由に、人の判断が要らない変更へ新しい承認手続きを足す。

### 正例と境界の負例

- 正例：低riskのbug fixで、C11（再現testでRedを観測）とC03を実行し、境界に原因がないのでC20を理由付きで省いた。
- 境界の負例：同じbug fixで、原因が境界（timeout）にあったのにC20を省いた。触ったコネクタの証明が無いので、接続の合格を主張しない（HARNESS-L2-005）。

### 完了条件

変更ごとに、選んだカードと選ばなかったカード（riskに当たるもの）が、理由とともに記録されている。**選び方の記録は、検証の合格を意味しない。**

## 本体

### 1. V-pair別の手法対応（早見表）

| pair | 主力（oracleを与える） | 補助（oracleの強さを測る／変化検出） | 1.0で任意・後続 |
|---|---|---|---|
| P6 L6↔L7 | C11 TDD、C03、C13 | C09、C10、C17、C18、C34 | C27 |
| P5 L5↔L8 | C04、C05、C06、C12、C13 | C10、C15、C16 | C27 |
| P4 L4↔L9 | C19、C20、C14 | C28(local)、C29、C31 | C31本格 |
| P3 L3↔L10 | C21（差分証明）、C08、C30 | C07、C29 | — |
| P2 L2↔L11 | C08、C22、C23、C24、C26 | C25、C18(ARIA)、C38 | — |
| P1 L1↔L12 | C33 | C31 | C32、C28(本番) |
| 全pair | C01、C02、C36 | C25 | — |
| AI関与 | C37 | C38、C39、C40 | — |

---

### 2. 選択matrix（**提案**。規則・承認手続きではない）

前提：
- HARNESS-L2-005の「Forward 小＝原子CI、中＝境界の証明、大＝システムの証明、高riskは小でも上位証明を早める」
  「省いた検査は記録し合流先ticketで回収」を土台にした**最小集合の案**。全件実行を既定にしない。
- risk軸は **低**（局所・可逆・判定ロジック非該当）と **高**（認証、DB migration、security、release、gate／状態判定ロジック、
  公開契約、HARNESS↔OS境界）の2段で示す。高riskの判定根拠はL3で導出する。
- 記号：● 最小集合に含める提案／○ 条件付き（該当時）／— 通常N/A（理由を記録）。空欄を黙ってskipにしない。
- 各セルの「C番号」はDT-VT-002のカード。

#### 2.1 見出し（headline）

**「どの変更でも C02（trace）＋C36（独立review）＋共通証拠fieldは常に、Redが観測できる変更はC11、
判定ロジックに触れる高riskはC10（差分mutation）かC25（fixture精度）で“testが本当に落ちるか”を示し、
境界を触れば C19／C20、画面があれば5軸（C22/C23/C24＋state/token）、上位pairは下位証明の積上げ＋固有義務の差分だけを証明する」**。

#### 2.2 matrix

| 変更の種類 | risk | P6 L6↔L7 | P5 L5↔L8 | P4 L4↔L9 | P3 L3↔L10 | P2 L2↔L11 | P1 L1↔L12 |
|---|---|---|---|---|---|---|---|
| 新機能 | 低 | ● C11, C03 | ● C04/C06（該当形）, C12 | ○ C19（コネクタに触れる時） | ○ C21は合流先ticketで回収（省略記録） | ○ 画面ありなら C22/C23/C24、受入はC08の例 | — |
| 新機能 | 高 | ● C11, C03, C10(diff) | ● C05/C06, C13 | ● C19, C20, ○ C14 | ● C21（固有義務の差分）, ○ C30 | ● C08, 画面5軸, C26（人） | ○ C33の指標定義のみ（測定は配備後） |
| refactor（振る舞い不変） | 低 | ● 既存test green維持, C03, 「Red不要」理由記録 | ○ C16（新旧比較、HELIX内実装同士） | — | — | — | — |
| refactor | 高 | ● C10(diff)で既存testの検出力確認, C17 | ● C16, ○ C13 | ○ C19非退行 | ○ C30（性能退行懸念時） | — | — |
| design refactor（境界・構造） | 低 | ● C03 | ● C12 | ● C19, C20（Scoped Reverse：L4と照合） | ○ C21は回収先へ | — | — |
| design refactor | 高 | ● C10(diff) | ● C14 | ● C19, C20, C28(local), C29 | ● C21差分証明, ○ C30 | ○ 利用者接点が変わるならBackflow（refactorではない） | — |
| bug fix | 低 | ● C11（**再現testでRed観測必須**）, C03 | ○ C04（境界起因なら） | ○ C20（境界起因なら） | — | — | — |
| bug fix | 高 | ● C11, C10(diff) | ● C13（同種再発防止の性質） | ● C20, ○ C29（race起因） | ● C21該当義務 | ○ 利用者影響ありならC08反例 | ○ 障害後恒久対策はReverse ticket（L2-003） |
| dependency更新 | 低 | ● C35, 既存test, C03 | — | ○ C19 | — | — | — |
| dependency更新 | 高 | ● C35, C17/C27 corpus再実行 | ○ C16 | ● C19, C20 | ○ C30 | ○ 画面ありならC22/C23 | — |
| config変更 | 低 | ● C03（schema検証）, C04（設定値境界） | — | ○ C20 | — | — | — |
| config変更 | 高 | ● C03, C05（設定組合せ）, C07 | — | ● C20, ○ C28(local) | ● C21該当義務 | — | ○ C32（配備後、1.0非必須） |
| docs（規則・要求・設計文書） | 低 | ● C03（link/ID/schema） | — | — | — | — | — |
| docs | 高（要求・規則・台帳の意味変更） | ● C03 | — | — | — | — | — |
|  | （全pair共通） | ● C02 trace、● C01 review、● C36 独立review。意味変更は人の判断範囲（CLAUDE.md）を確認し、本matrixは承認手続きを追加しない |||||

AIがL6／L7を同一sessionで作る場合の追加提案（risk高）：○ C37（別sessionで作成したhidden受入test）。
AI Worker・model比較（LABO）では ● C37、C39、C40、○ C38。

#### 2.3 N/A記録

DT-VT-001 §2の形で残す。

### 3. 横断anti-pattern一覧

1. **CI greenを受入・完了とする**：L2-003／005／022、CLAUDE.mdが明示的に禁止。原子CIはProvisionalまで。
2. **coverage%・mutation score・trace率・example数をoracleにする**（代理化）。
3. **snapshot／golden／visual baselineのrubber-stamp**：更新理由・差分確認の記録なしの一括update。
4. **unknownをpass／N/A／0件に変換**：L2-005／034／036／056が一貫して禁止。
5. **別revision・別環境の結果で相殺**（L2-034）。
6. **Redを観測しないTDD**、expected failureの理由未確認。
7. **同源化**：実装者（AI）がoracleも作る。hidden test・独立review・fixture精度で分離。
8. **下位全green→上位合格**：接続・構成体固有義務の差分未確認（L2-005）。逆に、下位証明で足りるのに巨大E2Eを毎回回す。
9. **flakyの自動retryで黙って緑化**、隔離testの未回収。
10. **旧HELIXのtest・CI・runtimeを参照実装や合格証拠として実行**（AGENTS.md禁止。静的に読むのみ）。
11. **機械判定・model graderから人の合意（prototype合意、L3承認、L11受入）を生成**（L2-049）。
12. **1.0でweb配備後項目（canary、本番chaos、本番SLO監視、脆弱性scan）を必須gate化**（Web展開後に扱うSecurity・インフラを1.0へ前倒ししない。SCF-B-0152の義務と同じ扱い）。
