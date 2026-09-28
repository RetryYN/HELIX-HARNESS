# O10 Visual Design HARNESS 作業依頼source snapshot（2026-09-29）

この記録はlocal review handoffにあるO10節とPO発言を原文のまま固定する。元ファイルはuntrackedの作業依頼であり、要求revision・PO decision record・操作authorityではない。候補起草のtask basisに限り、旧要求の採択や本文の承認を生成しない。

原典: `scaffold/review-handoff/local/codex-goals-2026-09-28-ops-loop.md`、SHA-256 `e4cfe94cb2072098058828ea3d41e8b5e0150d562457992a58a7c6414d931002`。O10節は148–191行。

## O10節（作業依頼原文）

### O10 Visual Design HARNESS：制約内で画面を作り、表示して測り、人が合意する（旧VDH-FR起点）

- POの発言（原文）：「Visual Design HARNESSってデザイン能力が上がった君ならどう作ればいいかわかるんじゃない？」「せやね。画面検証の精度がよくないとはずす。あとは余計に文字書きすぎないとか。」
- 旧source起点：
  - `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md`（VDH-FR-001〜019）。特に次の4つ。
    - 005：白紙から生成せず、Pattern Contractの中で構成し、UI profileを持つ。
    - 003：screen/region/slot/action/state のsemantic IDを使う。
    - 010：`implemented` と `ux_verified` を分ける。
    - 013：AIはvision、brand、prototype合意を自己承認しない。
  - `archive/.../docs/governance/design-harness-assessment-audit-2026-07-19.md`（POの改善提案6項目と実装優先順位）。
  - 旧`CLAUDE.md:84`（人の直接関与はL2デザインモックまで）。
- 現行の位置：
  - Conceptの「部品：デザインHARNESS」。
  - `HELIXBRAIN-L2-006`（Visual Design/UXの再利用知識。製品固有のVisual Identityは製品CORE）。
  - `HELIXBRAIN-L2-023`（BRAIN↔Visual Design HARNESSの接続）。
  - HARNESS側には受け皿がない（`helix-structure-tvo-po-statements-2026-09-18.md` の #1853）。
- 候補化の方向（1.0の範囲）：
  1. BRAINのPattern、製品のVisual Identity（CORE）、UI profile（情報の優先順位など）を制約として受け取り、その範囲で画面の試作（HTML等）を作る。
  2. 画面の部品にsemantic IDを付ける。O9の命名規則と同じ規則を当てる。
  3. 試作を実際に表示し、機械で判定できる項目を自動で測る。
     - アクセシビリティ
     - コントラスト
     - 画面幅ごとの崩れ・はみ出し
     - 主要状態（空・読込中・エラー等）の有無
     - 文字量
     結果は証拠として残す。
  4. 見た目の好みとbrandの判断、試作への合意は人（PO）が持つ。AIは案と改善候補を出すまでとする。
  5. `implemented` と `ux_verified` を分ける。
- POが示した重点：
  - **画面検証の精度**：表示結果の検査が外れると役に立たない。
    - 検査項目ごとに、誤検出・見逃しを確かめる既知の正例・反例fixtureを持たせる。検査の精度は評価できる形にする（LABO連携）。
    - 精度が確認できない検査は合格の根拠にしない。警告として扱う。
    - 旧VDH-FR-011のUX evidence条件（状態、画面幅、device条件）を起点にする。
  - **文字の書きすぎを防ぐ**：画面の文言を必要最小限にする。
    - UI profileに、画面・領域ごとの文言の役割と上限の目安を持たせる。例：見出し、ラベル、補足、エラー。
    - 上限を超える文言、同じ内容の繰り返し、説明のための説明を検出して、作成側へ返す。
    - 旧sourceには文言量の明示規則が見当たらない（旧L3 requirementsとL2-screenを検索した）。新規案として示し、旧VDH-FR-005の「情報優先順位」とPOの改善提案3「Content Block」を意味の起点にする。
- 後の版へ回すもの（締めすぎない、Web展開後）：
  - 試作と実装のずれの検出
  - 実データ・実利用者によるUX評価
  - 計測eventの結線
  - 旧版の重い仕組み（211ファイルの入力、gateごとのsub-check、DB）。移植しない。
- 主担当：HARNESS（部品：デザインHARNESS）。BRAIN（再利用知識）、LABO（検査精度の評価）、INTELLIGENCE（配置）は既存の接続のまま使う。
- 作成と検証の配置：O4の「要求・設計はClaudeを優先」に当たる。POが逆向き（Claude作成、Codex review）を選んだ場合はClaudeが候補を書く。選ばなければ通常どおりCodexが書く。
