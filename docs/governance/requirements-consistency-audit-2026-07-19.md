# 要件定義 矛盾監査（2026-07-19）

status: recorded
kind: governance-audit
author: claude (pmo-sonnet 3 レーン並列監査の統合)
scope: L1要件4本、L3要件17本、要件正本v1.2、L0 charter、ADR-001/009/010、
  infinity-loop要件coverage/definition台帳

## 監査方法

pmo-sonnet subagent 3 レーン（L1 水平整合 / L3 水平整合 / L0–L1–L3–ADR–ledger 縦整合）を
read-only 並列実行し、ID 全件突合（grep 抽出 → uniq 重複検出）と内容精査で矛盾を検出した。
基準点は監査時点の tracked 最新状態（HEAD de3c50a7 相当。要件ファイルに未コミット変更なし）。

## 発見事項

### 高

1. **ADR-010「untracked」誤記による権威判断の前提崩れ**
   - `docs/design/helix/L3-requirements/hybrid-rebaseline-v0.5.0-collision.md:59`（HR-FR-V050-03）は
     「現在 untracked の ADR-010」を前提に「runtime authority は ADR-009 を current authority とする」
     と確定宣言している。
   - 実際の `docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md` は `status: accepted`
     （2026-07-17 決裁）かつコミット済み（tracked）で、ADR-009 の一部条項（Python proposal-only /
     reject-for-TS 既定）を supersede すると明言。collision 文書（2026-07-18 作成）は誤った事実前提の
     上に DEFER_AUTHORITY_MIGRATION を積んでいる。

### 中

2. **ADR-010 追従の未実施（正本 stale）**
   - `CLAUDE.md` Read Order に ADR-010 が無い。`CLAUDE.md` / `.claude/CLAUDE.md` の「Cutover 境界」節は
     ADR-009 時点の「Python proposal-only」呼称のまま。ADR-010 本文末尾の追従義務
     （次回 CLAUDE.md 改訂で呼称追従）が未実施。
   - 関連 3 文書（github-autonomous-operations-requirements.md:144 /
     v0.5.0-collision.md:59-62 / v0.5.1-remediation-requirements.md:14）は
     「権威衝突は未解決」という結論は一致するが、根拠づけ（untracked か否か）が揺れている。
3. **L0-L14 vs L1-L12 の層語彙不一致（cutover 未 back-merge）**
   - `vmodel-canonical-authority-cutover.md`（confirmed, 2026-07-13）HR-FR-VMCUT-04/05 は Core Reads の
     cutover epoch / layer mapping 一致を不変条件とし、不一致時は terminal claim 拒否と規定。
   - 一方、先発 confirmed の `pillar-functional-requirements.md`（HR-NFR-P3-03 / HAC-P9-03b 等）と
     `glossary-ssot.md:57`（Forward spine = L0-L14）は旧語彙のまま未追随。同文書自身の基準で
     不一致状態にある。
4. **hybrid-rebaseline-v0.5.0-remediation-delta.md（L1）の frontmatter 完全欠落**
   - L1 4 本中これのみ `---` YAML ブロックが無く、`status` / `layer` が機械検出不能。
     status は prose 内でのみ「draft, status=proposed」と宣言。doctor / lint gate の対象から
     漏れている可能性がある。
5. **v0.5.0 intake ↔ remediation-delta の trace 欠落・collision の L1 縦連結欠落**
   - `hybrid-rebaseline-v0.5.0-intake.md` の HBR-V050-01..05 は remediation-delta の 59 件是正に
     一切言及せず、「v0.5.0 が是正を全件反映した」ことを機械確認できない。
   - `hybrid-rebaseline-v0.5.0-collision.md` は外部 zip パッケージ内 ID（HBR-AGENT-016..018 等）のみ
     参照し、HELIX L1（HBR-P* / HIL-*）への `related_l1` を持たない（単体で L0→L3 縦連結が追えない）。

### 低

6. infinity-loop-functional-requirements（HR-FR-HIL-01/04）と github-autonomous-operations-requirements
   （GH-FR-001/004）が Issue 正規化・route 選択の同一領域を相互参照 0 件で並走（内容矛盾は未確認だが
   未統合。inventory-first 原則と緊張）。
7. `infinity-loop-platform-requirements.md`（L1）が `status: draft` のまま L3/L4 が進行
   （L1 freeze 記録なし）。
8. L3 の ID prefix 規則（HR- / GH- / HLX- / HU- / HIL- / HVM- / HOPS-）が文書化されていない。
9. `helix-harness-requirements_v1.2.md` は frontmatter 無しの旧 prose-header 形式
   （governance 文書のため形式差として記録、矛盾ではない）。

## 問題なしと確認した軸

- ID 重複定義 0 件（L1+L3 全 21 ファイル、namespace 排他）。L3→L1 dangling 参照 0 件。
- charter P0–P9 ↔ pillar-requirements / pillar-functional-requirements の対応は完全
  （P5 の HNFR-P5 吸収は明示済みで暗黙欠落ではない）。
- orchestration-memory / -runtime / -bridge 3 部作の役割分担は階層明確で衝突なし。
- github-autonomous-operations ↔ CLAUDE.md GitHub 自走運用（PLAN-L7-418）の権限境界は整合。
- coverage / definition ledger は over-claim なし（0/115 不合格を自己申告、trace-draft 明示）。
- ADR-010 でも Node = 唯一 transaction writer は維持（Python authoritative write を許す要件混入なし）。
- Bun / terminal receipt 3 相境界の記述は ADR-009 と CLAUDE.md で一致。
- remediation-delta 内サマリ表（12 軸 59 件）と本文 status 集計は全軸一致。
- governance v1.2 と HELIX L1/L3 の ID namespace 非衝突（HBR-/HNFR-/HIL- 出現 0 件）。

## 是正の優先順（提案・未着手）

1. ADR-010 権威反映: collision 文書の「untracked」前提訂正 → CLAUDE.md Read Order / Cutover 境界節の
   追従 → authority epoch 一本化（v0.5.1-remediation 要件が要求済み）。ADR precedence の確定は
   正本間の高影響判断のため PO 判断を待つ。
2. remediation-delta の frontmatter 追補、intake→delta の 59 件 trace 追加、collision への
   `related_l1` 付与。
3. L0-L14 → L1-L12 語彙の back-merge（pillar-functional-requirements / glossary-ssot）。
4. infinity-loop ↔ github-autonomous の統合整理、L1 infinity-loop の freeze 判断、ID prefix 規則の文書化。
