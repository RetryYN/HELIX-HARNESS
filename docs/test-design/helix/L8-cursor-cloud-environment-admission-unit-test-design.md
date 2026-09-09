---
title: "Cursor Cloud Agent environment admission単体テスト設計"
layer: L8
kind: recovery
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: QA / Security
parent_design: docs/design/helix/L6-function-design/cursor-cloud-environment-admission.md
pair_artifact: docs/design/helix/L6-function-design/cursor-cloud-environment-admission.md
---

# Cursor Cloud Agent environment admission単体テスト設計

既存U001〜004のbinding移行は既存baseline ownerの範囲とし、この修復で暗黙に移行しない。

| Oracle | 正常系 | 反例 |
|---|---|---|
| U-CURSOR-ENV-001 | environment.jsonがrepo-owned Dockerfileとinstall scriptをexact選択 | snapshot-only、Dockerfile欠落、別scriptを拒否 |
| U-CURSOR-ENV-002 | Node 24.20.0 imageとmanifest digestをexact固定 | tag-only、wrong digest、別majorを拒否 |
| U-CURSOR-ENV-003 | Node範囲再検証後にfrozen installと検証列を実行 | range check、npm ci、typecheck、build、test、statusの各欠落を拒否 |
| U-CURSOR-ENV-004 | installのdownload禁止とimageの限定package同梱を分離 | installのcurl／wget／nvm、host-global path、一時path、失敗隠蔽、imageの許容列外命令を拒否 |

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CURSOR-ENV-005 | image buildでGit・HTTPS証明書を導入しGit実行を検査 | 導入欠落、Git確認欠落、install scriptへの遅延導入を拒否 | `tests/cursor-cloud-environment.test.ts` |
| U-CURSOR-ENV-006 | imageのpackage集合・実行列・版出力を限定 | curl／wget実行、shell pipe、ENV／CMD注入、存在検査・版出力欠落、集合外packageを個別拒否 | `tests/cursor-cloud-environment.test.ts` |

U-CURSOR-ENV-005はPLAN-RECOVERY-1293-cursor-image-gitの修復を拘束する静的検査であり、実clone成功の代用ではない。
Draft Buildでrepo checkoutとHELIX installの完走を別途確認する。

mutationではimage digest一桁変更、Node下限削除、`npm ci`から`npm install`への縮退、host shim再導入、fail-open追加を
個別に投入し、各反例が独立してredになることを確認する。
