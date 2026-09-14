# 旧要求文書 semantic line 全量保全inventory

status: source_lines_preserved_pending_atomization
scope: 旧要求文書22件
authority: [要求文書carry-forward台帳](legacy-requirement-document-carry-forward.jsonl)
machine_ledger: [semantic line台帳](legacy-requirement-semantic-line-carry-forward.jsonl)

## 目的

明示ID付き要求だけを分母にすると、要求文書の説明段落、箇条書き、技術条件、画面条件、例外、停止条件に含まれる意味を後続整理で落とす可能性がある。そこで、旧要求文書22件の非空semantic lineを、要求かどうかを先に選別せず全量で台帳化した。

この台帳は要求件数を2,386件へ増やすものではない。1行は抽出候補のsource spanであり、複数行から一つのatomを作る場合や、一行から複数atomを分ける場合がある。見出し、表区切り、frontmatter、fence markerだけを構造記号として除外し、fence内部の内容は保持する。

## 現在値

| 項目 | 件数 | 状態 |
|---|---:|---|
| 対象文書 | 22 | source SHA-256固定済み |
| 保持semantic line | 2,386 | 原文、source path、行番号、heading path、line digestを保持 |
| 既存identityへ接続済みのline | 328 | confirmed文書identity 175件とRequirement IR 153件へ接続 |
| atom化待ちのline | 2,058 | `preserved_pending_atomization`。要求／根拠／例／navigation等の分類前 |
| 意味変更、retire、successor割当 | 0 | 人間判断なしには変更しない |

2,058件は未分類候補の数であって、未発見要求の確定数ではない。要求ではないと後に分類する場合も、source spanを台帳から削除せず、分類根拠と判断revisionを追記する。

## 台帳field

各行は次を持つ。

- `content_line_id`: 台帳内の安定した連番。
- `source_path`、`source_file_sha256`、`source_line`: 元文書とexact位置。
- `heading_path`: 文脈を失わないための上位見出し。
- `source_line_text`、`source_line_sha256`: 原文と改変検知。
- `explicit_requirement_identities`: 175件台帳または153件IRとの既存接続。
- `atomization_status`、`requirement_classification`: 既接続か未分類かを区別する状態。
- `requirement_change_authority`、`successor_requirement_ids`、`decision_record`: 暗黙の削除・被覆済み化を防ぐ状態。

## 後続atom化の規律

1. `preserved_pending_atomization`をsource順に読み、要求、制約、受入結果、根拠、例、navigation、重複候補へ分類する。
2. 複数行を結合または一行を分割するときも、生成atomから全source line IDへ逆参照を持つ。
3. 既存328 identityとの意味重複は自動統合せず、同一、部分被覆、追加条件、矛盾、無関係を別fieldで示す。
4. 要求atomには対象product、unit／connection／composite、親Concept／L1、要求する結果、L11候補を付ける。
5. prose、根拠、例、navigationへ分類しても削除しない。分類revisionと根拠を残す。
6. 意味変更、縮退、統合、retireは対象revision付きの人間decisionなしに適用しない。
7. GitHub Issue、PR、CI、実装の状態から分類や要求採否を逆算しない。

## 不合格条件

- 2,058件を一括で「要求ではない」とする。
- IDがないこと、旧技術名を含むこと、現行実装がないことを削除理由にする。
- 原文を要約だけへ置換し、source lineへの逆参照を失う。
- 既存identityと似ていることだけでcovered、duplicate、retiredへ遷移する。
- atom化完了前に22文書または本台帳を要求入力面から外す。
