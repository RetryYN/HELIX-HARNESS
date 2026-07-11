---
schema_version: skill.v1
name: skill-authoring
skill_type: orchestration
applies_to:
  layers:
    - L4
    - L5
    - L6
    - L7
  drive_models:
    - Forward
    - Add-feature
    - Research
---

# スキル設計（skill-authoring）— 安価なモデルに apex 級の判断をさせる書き方

skill pack・agent frontmatter・委譲ブリーフ・review rubric を新規作成 / 改修するときに読む。
委譲の最低要件（4 点セット）は judgment-core §5、モデル別の性格調整は §3 が正本。
本 pack は**スキル文書そのものの設計技法** — 何をどう書けば Haiku / Sonnet worker が
Fable / Opus 相当の判断品質を出すか — を扱う。出典は §6。

## §1 設計原理: 判断の自由度を意図して配る

小型モデルの失敗は能力不足より**裁量の与えすぎ / 奪いすぎ**で起きる。書く前にタスクの
自由度を決める（degrees of freedom）:

- **低自由度（崖沿いの一本道）**: 破壊的操作・gate 手順・記録形式。「このコマンドを
  そのまま実行する。flag を追加しない」と厳密に指示する。裁量の余地を残さない。
- **高自由度（平原）**: 探索・レビュー観点・設計代替案。原則と視点カタログだけ与え、
  手順を固定しない。固定すると浅い機械的巡回になる。
- 迷ったら: 誤りが不可逆なら低自由度、誤りが安く直せるなら高自由度。

同じ理由で、**普遍原則は judgment-core に集約し、pack には工程固有の差分だけを書く**
（全文コピーは context を消費し drift する。SSoT 参照 + marker 同期が HELIX の型）。

## §2 効く記述パターン（実証済みの型）

zip（vmodel-docgen skills）と外部ソースの横断分析から、小型モデルの判断力を底上げする
記述パターン。新規 pack はこの中から適合するものを選んで組む:

1. **態度の先出し（§0 パターン）** — 冒頭で目的そのものを再定義する（例:「テストの目的は
   確認ではなく壊れ方の発見」）。小型モデルが表面目標（緑にする）へ最適化する既定バイアスを、
   動作原理の差し替えで防ぐ。
2. **逆説的品質シグナル** — 「全部一発で緑なら疑う」のように、素朴な直感（通った=良い）を
   明示的に反転させる文を置く。
3. **視点カタログ（列挙による思考の外部化）** — apex モデルが暗黙に持つ経験則を、有限の
   明示リスト（「ゼロ・一・多・境界・異物」等）に変換する。5±2 個のチャンクで記憶負荷を下げる。
4. **「迷ったら X」の自問文** — 判断閾値を主観に残さず、具体的な自問（「障害・監査・引き継ぎの
   とき誰かが困るか」）に固定する。
5. **禁止事項の列挙** — ポジティブ指示だけでは局所最適（gate を黙らせる等）に流れる。
   「やってはいけないこと」表で境界を確定する。
6. **証跡アンカー必須** — done/pass 宣言に検証可能なアンカー（command・exit code・digest・
   path）を要求する。prose 宣言を無効とする。
7. **1 行宣言の強制** — 判断過程の可視化を出力形式として要求する（「7 段の問いのどこで
   止まったか」等）。隠れた手抜きを構造的に排除する。
8. **copy-checkoff 式チェックリスト** — 複雑な多段手順は `- [ ]` 形式で置き、コピーして
   進捗を付けさせる。手順スキップの主要因は明示的 checklist の欠如。
9. **feedback loop の明文化** — 「validate が fail したら: エラーを読む → 直す → 再実行。
   pass するまで次へ進まない」。早すぎる完了宣言を gate で防ぐ。
10. **evidence → verdict の順序強制（analytic rubric）** — レビュー / 判定系は基準ごとに
    「根拠を cite してから PASS/FAIL/UNCERTAIN を宣言」させる。総合判定は基準の集計としてのみ
    出す。UNCERTAIN を用意する（推測で埋めさせない）。
11. **least-to-most 分解** — 複雑タスクは「まず 3-5 個のサブ問題に分解して列挙し、前段の
    結論を引用しながら順に解く」と指示する。
12. **Chain-of-Verification** — 判定系で「結論を起草 → 結論を反証しうる検証質問を 3-5 個
    列挙 → **起草を見ずに**各質問へ独立回答 → 矛盾があれば結論を修正」。起草を見たままの
    自己チェックは同じ誤りを複製する。
13. **self-consistency（高 stakes 限定）** — go/no-go 等の二択判定は「異なる根拠から 3 回
    独立に判定し多数決」。コストが重いので出荷判断など低頻度・高 stakes に限る。
    **優先規則: 多数決は敵対検証（adversarial-review）の verdict を上書きしない。** 反駁されない
    攻撃が 1 つでも立っていれば、投票結果に関わらず FLAG が優先する（敵対構造は投票ではない）。
    多数決を使ってよいのは、成立した攻撃も反例も無い裁量判定（設計代替案の選好等）のみ。
14. **役割分離** — 作成者は攻撃者にも防御者にもなれない（adversarial-review）。同系統モデルは
    盲点が相関するため、判定は別 runtime / model family へ回す。

## §3 構造の規律（Anthropic skill authoring best practices）

- **description はトリガー条件で書く**: 「何をするか」でなく「いつ読むか」。recommender は
  frontmatter（`applies_to.layers` / `drive_models`）で score するため、routing tag を
  実態に合わせる。
- **progressive disclosure**: 本文は必要最小限に保ち、詳細は参照先（正本 doc）へ 1 階層のみ
  リンクする。ネスト参照は部分読みで情報が欠落する。
- **説明を削り、手順とルールを残す**: 「モデルは既に賢い」前提で背景説明を削る。各段落に
  「この説明は本当に必要か」を自問する。削るのは説明であって規律ではない。
- **本文は日本語 prose**（design-language gate）。command・識別子・専門用語は原語のまま。

## §4 委譲ブリーフへの適用

judgment-core §5 の 4 点セット（objective / output format / tool guidance / task boundary）に
加え、worker のモデル帯に応じて §2 のパターンを選ぶ:

- **Haiku / spark（軽量 worker）**: 低自由度に倒す。checklist（#8）+ feedback loop（#9）+
  escalate 先の明記。判断が要る局面を残さない。
- **Sonnet（標準 worker / reviewer）**: 視点カタログ（#3）+ evidence→verdict（#10）。
  役割と出力契約が明確なら安定する。
- **レビュー / 判定役**: #10 + #12 + 役割分離（#14）を必ず入れる。verbosity バイアス対策に
  「簡潔な所見は同等の正しさなら冗長な所見より劣らない」と採点規則に明記する。

## §5 スキルの検証 — 書きっぱなしにしない

- 新規 / 改修 pack は `skill.v1` frontmatter の enum（skill-assignment lint）と
  `helix doctor` green を確認する。SKILL_MAP の trigger table に行を追加する。
- 効果の主張は falsifiable に: 「この pack で判断が良くなった」は prose では claim できない。
  with/without の比較 eval（PLAN-L7-382 skill-efficacy-evaluation の型）か、pack が防ぐはずの
  失敗の regression test を証跡にする。
- pack 間の重複は drift の温床。共通化できる原則は judgment-core へ昇格させ、pack には
  参照だけを残す（昇格は version bump + 全 marker 追随、judgment-core §7）。

## §6 出典（2026-07-11 調査、実在確認済み URL のみ）

- Anthropic 公式の skill authoring 指針（判断自由度の段階分け・チェックリスト・
  フィードバックループ・段階的開示）:
  https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- 検証質問の独立回答による幻覚低減（Chain-of-Verification）: https://arxiv.org/abs/2309.11495
- 複数推論パスの多数決による精度向上（self-consistency）: https://arxiv.org/abs/2203.11171
- サブ問題への分解と逐次解決（least-to-most）: https://arxiv.org/abs/2205.10625
- LLM-as-a-Judge rubric design（analytic rubric / 四部構成 / バイアス緩和）:
  https://www.appen.com/llm-as-a-judge-rubric-design
- obra/superpowers（MIT。Iron Law 形式・claim-evidence 対応表の参考元）:
  https://github.com/obra/superpowers
- Google eng-practices（CC-BY 3.0、出典明記。「改善なら承認」「Nit:」ラベル運用の参考元）:
  https://github.com/google/eng-practices
- vmodel-docgen skills（PO 提供 zip、2026-07-11。§2 パターン 1-7 の主要参考元）
