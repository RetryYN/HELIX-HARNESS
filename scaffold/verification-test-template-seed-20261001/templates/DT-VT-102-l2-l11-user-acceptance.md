# DT-VT-102 検証方法：L2 要求（該当時はL2.5の結果を反映） ↔ L11 利用者受入（P2）

## 契約（seed候補）

| 項目 | 内容 |
|---|---|
| template ID／版 | `DT-VT-102`／`0.1.0-seed-candidate` |
| 状態 | seed候補。採否なし（DST-HARNESS-005は未採択の要求候補） |
| 想定する持ち主 | HELIX-HARNESS-CORE（段階ごとの検証の契約と状態の遷移、HARNESS-L2-022）。汎用の型はHELIX-BRAIN。テストとCIの運転、ticketの発行、検収はHELIX-OS |
| 適用条件 | L2 要求（L2.5のPrototype・PoCを含む）の成果物に対の検証を行うとき。全件の実行を既定にせず、HARNESS-L2-005の規則（Forwardの大きさ、risk、触るコネクタ）で要否を決める |
| 適用判定の記録 | DT-VT-001 §2（非適用、理由、判断者、HEAD、要求への影響、再評価条件） |
| 必須入力（左腕のtest basis） | 合意済みのL2要求とrevision、L11受入の条件（成功条件と反例）、HARNESS-L2-003に従ってPrototypeとPoCを別々に判定したL2.5適用記録。Prototype適用時は合意済みprototypeのrevisionと合意記録、PoC適用時は検証結果と要求へのBackflow先・反映revisionを含める。各々の非適用時は根拠付きN/A記録を含める。適用がunknown、または適用時の成果が欠ける場合、その成果に依存する受入条件をunknownとして成立を主張しない。 |
| 右腕のtest condition | 利用者が、合意した成功条件を満たし、反例が起きないと確かめられるか |
| 成果物の状態 | Verified→Accepted（HARNESS-L2-022。L10の合格でL11を合格にしない） |
| 対（V-pair） | P2：L2 要求 ↔ L11 利用者受入（HARNESS-L2-040の6組）。適用されたL2.5のPrototype／PoC成果と要求への反映revisionは、該当する受入条件の入力として結ぶ |
| 区分 | composite（利用者が触る成果） |
| 関係 | DT-VT-001（共通欄）、DT-VT-002（技法カード）、DT-VT-003（選び方の案）、HARNESS-L2-022、HARNESS-L2-056（対ごとのgate結果） |
| 差戻し先 | 意味の変更が要る不一致は、見つけた検証層で戻し先を固定しない。意味が変わる左側の層へBackflowする（詳細の契約はL5、architectureや境界はL4、要求や受入はL3／L2、製品の価値はL1。HARNESS-L2-022、HARNESS-L2-003／004）。振る舞い・契約・要求を保てる不一致は、右側でRefactorして同じ段階の検証をやり直す。右側が左側のauthorityを黙って書き換えない |
| 計測 | 数値の閾値は置かない。測る場合はHARNESS-L2-034の14項目に従い、値はL3で根拠付きで導く |
| 1.0の境界 | —（1.0の範囲。Web展開後の本番利用者の観測はL12で扱う） |
| 出典 | HARNESS-L2-003、HARNESS-L2-005、HARNESS-L2-022、HARNESS-L2-040、HARNESS-L2-056。旧資産は下の「旧HELIXとの対応」 |
| 限界 | 対ごとの観点と技法の組合せは材料であり、正式な検証義務ではない。検証義務はHARNESS-L2-005の規則からL3で導く |
| 置き換え | 正式な検証契約（HARNESS-L2-022の具体化）が入ったら`superseded`とし、観点・証拠・差戻し先の行き先を対応づける |

### 不成立例（negative oracle）

- L10のsystem testの合格を、L11の受入とする。
- AIの模擬利用や機械の判定から、受入や合意を作る（HARNESS-L2-049）。
- Gherkinを書いたこと、画素の一致を、受入の完了とする。
- 画面も技術的不確実性もない対象でPrototype／PoCを一律必須にする、または必要な活動を根拠なくN/Aにする。
- 適用されたPrototypeの合意revisionやPoCの結果・要求への反映を欠いたまま、関連する受入観点を成立とする。
- 設計側と検証側のoracle identityが一致しないのに、対を成立とする（HARNESS-L2-056）。
- 対の片側（設計の義務または検証の証拠）が欠けているのに、greenとする。

### 正例と境界の負例

- 正例：画面がなく技術的不確実性もない対象で、PrototypeとPoCを別々にN/Aとし、それぞれL2-003の根拠付き記録を残した。L11では要求Aの成功条件と反例「CI greenだけで受入を主張する」を利用者が確かめ、受入の記録を人が残した。
- 境界の負例：画面を持たないと判定した対象。5軸を理由付きのN/Aにできる。画面を持つ対象では5軸をN/Aにしない。

### 完了条件

照合の観点ごとに、DT-VT-001の共通欄と下の必須証拠があるか、理由付きのN/Aである。oracle identityが両側で一致している。unknownを成立にしていない。**本templateの完了条件を満たしても、成果物の状態を上げる判定は別の契約（HARNESS-L2-022）による。**

## 本体

### L2.5（Prototype・PoC）の適用記録とtest basis

画面の有無で判定するPrototypeと、画面の有無にかかわらず技術的成立性の不確実さで判定するPoCを、別々に記録する（HARNESS-L2-003）。片方の適用判定を他方へ流用しない。

| L2.5活動 | 適用時にtest basisへ含めるもの | 非適用時 |
|---|---|---|
| Prototype（画面の有無で判定） | 利用者が合意したprototypeのexact revisionと合意記録。Prototypeで確認した条件に依存するL11観点を対応づける。 | HARNESS-L2-003所定の非適用・理由・判定者・HEAD・要求への影響・再評価条件を持つN/A記録。 |
| PoC（技術的成立性の不確実さで判定） | 仮説と事前の成功条件、結果（成立・不成立・未確認）、要求へのBackflow結果、Backflow後のL2要求revision（変更なしの場合も明記）。関連するL11観点へ結果を対応づける。 | HARNESS-L2-003所定の非適用・理由・判定者・HEAD・要求への影響・再評価条件を持つN/A記録。 |

適用判定がunknownならN/Aに置き換えず未解決として記録する。適用された活動のrevision・結果が欠けるときは、それに依存するL11観点の成立を主張しない。適用がunknownまたは根拠付きN/Aであることだけを理由に、他の独立した受入観点を一律に止めない。L2.5の成果は受入の入力であり、それ自体がL11の受入やL3凍結を生成しない。

### 1. 照合の観点

| 観点 | 使う技法（DT-VT-002） | 結果 | 証拠のref | N/Aの理由 |
|---|---|---|---|---|
| 受入の条件ごとの成功と反例の観測 | | | | |
| 画面を持つ対象では5軸（mock-promotion、design-token-drift、a11y-regression、visual-regression、state-transition-drift。HARNESS-L2-036）と表示計測（HARNESS-L2-049） | | | | |
| 意味の差を見つけたら、コードを直して合わせずにBackflowで要求へ戻す | | | | |

### 2. 技法の早見（DT-VT-003 §1の抜き出し）

| 主力（oracleを与える） | 補助（oracleの強さを測る・変化を検出する） | 1.0で任意・後続 |
|---|---|---|
| C08、C22、C23、C24、C26 | C25、C18（ARIA）、C38 | — |

全pairに共通して、C01（review）、C02（trace）、C36（独立review）を使う。

### 3. 必須の証拠（共通欄に足す）

- `scenario_ids`、`counterexamples_tested`
- `acceptance_record_ref`（人の受入の記録を指す。本templateは受入を作らない）
- Prototype／PoCそれぞれの適用記録refと、適用時は前節のrevision・合意または結果・要求への反映revision。非適用時は6項目を持つN/A記録ref
- `semantic_gaps`とそのBackflow先

### 4. 差戻しの記録

| finding | 意味の変更が要るか | 戻し先（L1〜L5、または同じ段階のRefactor） | 根拠 |
|---|---|---|---|
| | | | |

### 5. 旧HELIXとの対応

| 旧source | 保持する点 | 変更する点 | 理由 |
|---|---|---|---|
| 旧 `L08-L14-verification-phase.md` 34（G11：要求・人間受入）・78（UAT decision record、未処理feedbackを拒否）・204、旧 `docs/test-design/helix/L2-screen-ux-test-design.md` 26–35、旧 `docs/skills/acceptance-criteria-thinking.md` 45–76 | 人の受入の記録を要し、未処理のfeedbackを残したまま受入にしないこと。受入観点の表（ID、対応AC、観点、合格条件）。「Doneの偽装」のカタログ | 旧S3／S4の結線、旧`review_evidence`の欄は持ち込まない | 現行はL2.5の合意を経てL3へ進み、L11はVerified→Acceptedの段階として扱う（HARNESS-L2-003、HARNESS-L2-022） |

旧 `L08-L14-verification-phase.md` 39–40・207・213–220（対の凍結前のテスト設計を後付けしない、品質観点の不足は既存のテスト設計を書き換えずに追加のテスト設計として分ける）は、全pairで保持する候補とする。旧のpathと旧の工程名（add-design／add-impl）は持ち込まない。
