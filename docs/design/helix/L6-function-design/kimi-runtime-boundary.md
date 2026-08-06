---
title: "非CodexエージェントAGENTS.mdランタイム境界 関数設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-06
updated: 2026-08-06
owner: TL
plan: docs/plans/PLAN-L7-507-kimi-runtime-boundary.md
pair_artifact: docs/test-design/helix/L8-kimi-runtime-boundary-unit-test-design.md
---

# 非CodexエージェントAGENTS.mdランタイム境界 関数設計

- 振る舞い契約 (behavior contract): KIMI-RUNTIME-BOUNDARY-001
- 責務オーナー (responsibility owner): kimi-extension-security-boundary

## 背景

Kimi Code（VS Code 拡張 / CLI）は AGENTS.md オープン規格に準拠し、本リポジトリの `AGENTS.md`
（Codex CLI 専用 project rules）を project 指示として読み込む（バイナリ解析で AGENTS.md 参照を確認）。
境界を明文化しない場合、Kimi が Codex の technical lead 役割・`helix codex` 委譲レーン・push / merge
権限を自己のものとして解釈するリスクがある。context compact（自動・手動）で会話中のルールは失われる
ため、境界は会話やメモリではなく AGENTS.md 本体に置く。

## 機能仕様

### F1: AGENTS.md ランタイム境界節

`AGENTS.md` の責務分離節直後に「非 Codex エージェントへのランタイム境界」節を置く。

- Codex 専用規定（TL 役割・委譲レーン・hybrid commit 協調・push / PR / merge 権限）は継承しない。
- 共通ルール（日本語報連相・ドキュメント言語・安全境界・破壊的 git 禁止・一括 stage 禁止）のみ適用。
- 非正規ランタイムの push / merge / release / tag を禁止（PreToolUse guard の deny と二重化）。
- compact 後もこの節が唯一の拘束正本であることを節内に明記する。

### F2: reviewed-safe digest 同期フェンス

`AGENTS.md` は `src/lint/l12-hybrid-reviewed-safe-v2.ts` に digest 固定で reviewed-safe 登録されて
いる。編集で digest が変わると登録から静かに外れ、L1-L12 drift gate が後段（CI）で崩れる
（CI run 31031918548 で実観測）。registry digest と実ファイル sha256 の一致を unit oracle
U-KIMIB-001 で直接検証し、AGENTS.md 編集時に registry 再 review を強制する。

### F3: Kimi guard 正本の登録

user ローカルに配備済みの PreToolUse guard / 完全性チェックの実体ソースは、監査記録 `docs/governance/kimi-code-extension-security-audit-2026-08-06.md` の付録にコード掲載して tracked 記録とする（`scripts/` は thin OS entrypoint 専用のため置かない）。
配備先（`~/.kimi-code/` / systemd user timer）は user ローカルであり、repo 側は正本管理のみを担う。
監査記録は `docs/governance/kimi-code-extension-security-audit-2026-08-06.md`。

## 失敗モード

- AGENTS.md 編集 + registry 未更新 → U-KIMIB-001 red（fail-close）。
- 境界節の削除 → Kimi への権限継承遮断の喪失。review で fail-close する。
- guard 正本と user ローカル配備の乖離 → verify-guard.sh の canonical 比較で検出（repo 外、advisory）。
