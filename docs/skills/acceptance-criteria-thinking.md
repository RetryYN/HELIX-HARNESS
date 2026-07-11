---
schema_version: skill.v1
name: acceptance-criteria-thinking
skill_type: verification
applies_to:
  layers:
    - L3
    - L10
    - L11
    - L12
  drive_models:
    - Forward
    - Add-feature
    - Scrum
    - Discovery
---

# 受入思考（acceptance-criteria-thinking）— 何を疑い、いつ「Done」と言うか

受入条件（AC）を設計するとき、PLAN の受入条件節を書くとき、成果物が「Done」か判断するとき、
accept gate に入るとき、Scrum/PoC の S3 verify・S4 decide を回すときに読む。
テスト実装の質は `test-thinking`、gate 手順は `code-review` / `adversarial-review` が正本。
本 pack は **AC の中身の質と「Done」判定の規律**を扱う。

## §0 出発点となる態度

**受入条件の目的は「実装できたことの確認」ではなく「その成果物が要求を満たしたと言い切れる
条件の明示」である。** 確認のつもりで書いた AC は、書き手が想定した使い方しか守らない。
最初から通る AC は情報量が少ない。

- AC を書く前に「この成果物はどう要求を外すか」を最低 3 通り言語化する。言語化できないなら
  要求を理解していない（着手可能にしない）。
- **全 AC が一発で緑になったら喜ばずに疑う。** 「実装が完璧」より「AC が弱い」確率のほうが
  ずっと高い。故意にバグを 1 つ入れて赤になる AC があるか確かめる。赤にならない AC は削除候補。
- 「AC が通った」を「Done だ」と即断しない。review evidence・doctor green・docs 更新など
  PLAN の受入条件全体を満たして初めて Done（judgment-core §2 完了宣言前チェック）。

## §1 AC の質 — Testable を満たす

次を満たさない AC は書き直す:

- **観測可能な結果で書く。** 「使いやすいこと」ではなく「`helix doctor` が exit 0」
  「3 操作以内で X が完了する」。主観語（速い・分かりやすい・適切）は数値・操作手順・
  状態遷移に落とす。数値が決められないなら、それは AC ではなくまだ要求の議論である。
- **Given-When-Then で状態を固定する。** 前提（Given）なき Then は再現できない。Given は
  「どのデータ・どの権限・どの状態から」を明示する。
- **1 AC = 1 判定。** 「登録できて、かつ通知されて、かつ一覧に出る」は 3 つに割る。
  複合 AC はどれが落ちたか分からない。
- **falsifiable claim には裏付け手段を併記する。** 「N green」「fully covered」型の claim は
  prose ではなく、それを裏付ける test / command を cite する（PLAN claim discipline。
  機械的代替は real-repo regression test であり sentence ではない）。

## §2 「Done の偽装」カタログ — 判定時に疑う型

accept 判定・レビュー時は、次の偽装パターンを名指しで疑う（adversarial-review の攻撃対象と同じ）:

- **Done の偽装**: 「Done」宣言だが AC の一部が未検証 / 自動テストが無い / 別環境で動かない。
  受入条件を 1 つずつ反例で突く。
- **ゴールの空洞化**: task は閉じたが目的が達成されていない（チケットは消化したが、
  要求した価値が出ていない）。PLAN の「目的」節に戻って突合する。
- **垂直スライスの偽装**: デモ / happy path は通るが、裏が繋がっていない（ハードコード・
  stub 残り・エラーパス未実装）。`code-minimalism` §4 の嗅覚と test-thinking §1-5 失敗系で突く。
- **AC の後付け緩和**: 実装に合わせて AC を弱めていないか。PLAN の履歴（git log）と現 AC の
  差分を疑う。confirmed PLAN の claim 訂正は silent overwrite ではなく supersede で行う。
- **証跡の崩し**: review_evidence の green_commands から再確認手順が組めるか。「確認しました」
  だけの証跡はアンカー（command / exit code / digest / path）が無ければ無効。

判定に迷う AC は PASS にしない。**UNCERTAIN と明記して根拠不足を surface する**
（推測で PASS を埋めるのが最悪の選択。judgment-core §4）。

## §3 探索で見つけた壊れ方の扱い

- 探索的テスト（test-thinking §3）で見つけた壊れ方は握りつぶさず、**AC に昇格する**
  （回帰防止。regression test として `generates` の test_code に登録する）。
- レビューで指摘された「想定と違う」は、多くが AC 不足の証拠。修正するだけでなく
  「なぜ AC に無かったか」を振り返り、同型の欠落を横展開で探す。
- 直せない / 今直さない壊れ方は `debt-register` の規約で意図した残余リスクとして記録する
  （残余リスクの言語化は test-thinking §5 の止めどき判断とセット）。

## §4 いつ「十分」か

- **AC 網羅**: 全 AC が緑、かつ各 AC が「壊れると赤になる」ことを確認済み。
- **リスク加重**: 不可逆・境界・auth/PII に関わる AC は厚く検証し、表示だけの箇所は薄く
  （test-thinking §2 の深さ配分）。
- **前倒しの作り込みをしない**: まだ着手しない将来 scope の AC を先に精緻化しない。
  粒度を粗いまま置くのは正しい（skip 扱いにするのとは違う。漸進的詳細化）。

## §5 報告の正確さ

- 「テストが通った」を「正しい」「バグがない」と報告しない。正確には
  「宣言した AC 集合に対して壊れ方が観測されなかった」。
- 完了報告には AC ごとの evidence → verdict を対で書く（evidence を cite してから
  PASS/FAIL/UNCERTAIN を宣言する。verdict が先に来る報告は信用しない）。
- FLAG（反駁されない攻撃・未達 AC）を残したまま Done にしない。未完に正直であることが
  受入判定の信頼を守る。
