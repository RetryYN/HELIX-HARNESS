---
layer: L6
artifact_type: design
status: draft
plan: docs/plans/PLAN-RECOVERY-1500-cross-system-audit-intake.md
pair_artifact: docs/test-design/helix/cross-system-audit-intake.md
---

# 横断監査入力の保全検査設計

本設計は既存の参照資料配置規約 `docs/governance/repository-structure.md` に従い、
監査入力の保全を検査する関数責務を定義する。監査所見を新たな要求正本へ昇格しない。
runtimeの監査・修復・配布機能は追加しない。

## 入力と処理

`docs/reference/cross-system-audit-2026-09-05/` の `inputs.json`、`source-map.json`、
`source/`、`intake.md` を読み、`tests/cross-system-audit-intake.test.ts` で検査する。
同梱スクリプトは実行せず、原本のbyte列を非実行テキストとして扱う。

1. 元名と保存名の対応は各14件で重複を許さず、保存ディレクトリのexact file setと一致させる。
2. 保存先はbasenameの `.txt` ファイルに限定し、葉のsymlink、欠落、追加、size・SHA-256不一致を拒否する。
3. 同梱13チェックサムと原稿を照合する。チェックサム原文と原稿の受領時ハッシュをテストに固定し、変更可能なmanifestだけを根拠にしない。
4. 台帳のF01〜F14、C01〜C11、X01〜X05を別の集合として順序も照合し、欠落・重複・置換を拒否する。

## 受入と限界

1〜3はU-XAUDIT-001、4はU-XAUDIT-002で検証する。失敗時はテストを非成功とし、
入力整理の完了を主張しない。F01をF00へ変更した反例がU-XAUDIT-002に捕捉されることを確認する。
これは保全検査であり、監査所見の正しさ、全secret/PII不存在、remote保全、修復完了を証明しない。
原本削除にはPLANの独立レビュー・remote保全・残存参照検査を別途必要とする。
