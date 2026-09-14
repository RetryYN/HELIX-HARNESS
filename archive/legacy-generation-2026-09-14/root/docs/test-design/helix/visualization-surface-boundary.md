---
layer: L4
sub_doc: test-design
status: draft
freeze_blocking: false
pair_artifact: docs/design/helix/L4-basic-design/visualization-surface-boundary.md
plan: docs/plans/PLAN-L4-52-visualization-surface-boundary.md
---

# 可視化 surface 境界 — L4 テスト設計（pair）

pair 正本 = `docs/design/helix/L4-basic-design/visualization-surface-boundary.md`。

## 検証観点（予定 oracle。実装 slice（L7）でテスト新設と同時に oracle ID を宣言する）

1. **surface 割り付け**: 2 root（Project / Harness）× 6 view の割り付けが L3 の
   HR-FR-VIS-01（HAT-VIS-01）と一致し、view→source マッピングが `VisualizationSnapshot` の
   実在 field を指す。
2. **CSP 境界**: Webview の CSP が default-src 'none' 基調で、外部 origin への
   接続・script 読込みが存在しない（extension 実装時に webview options を検査）。
3. **read-only action 境界**: コマンド一覧に mutation 導線が無く、CLI copy は
   クリップボード書込みのみ（HAT-VIS-05 の L4 具体化）。
4. **secret 非保持**: Webview state / globalState に secret・provider transcript・
   machine-local absolute path が保存されない。

acceptance の親 trace は `docs/test-design/helix/L3-pillar-acceptance-test-design.md` の
HAT-VIS 系（01..07）に従属し、本書は L4 境界の検証手段を具体化する。
