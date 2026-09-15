# A-116 L0-L6 verification readiness と HELIX cutover hardening

日付: 2026-06-09
Gate: GATE-A technical readiness (L0-L6 left-arm design bands) の確認
監査者: Codex TL
範囲: L4-L6 gate reconfirmation 後の L0-L6 freeze/readiness を確認し、internal assets から active HELIX runtime/path assumptions を除去する。
判定: L0-L6 verification readiness と HELIX cutover hardening は PASS。この record は、すべての L4-L6/L7-L9 artifact が no findings の fresh substance audit で再読されたことまでは証明しない。

## 確認した requirements

- Phase 1 / L0-L3 は、roadmap section 5 と gate-design section 2 に記録された 4 回の verification/improvement cycles 後も frozen のままである (A-100)。
- Phase 2 / L4-L6 は Forward design descent と gate re-confirmation を完了している: G4、G5、G6 は gate-design section 2 で PASS。
- GATE-A readiness check は coverage-count-only claim ではない: L4-to-L9、L5-to-L8、L6-to-L7 には pair evidence が必要であり、orphan design/test-design pair があってはならない。
- L6 completion は L6 docs、owning PLAN trace、L7 pair、FR unit coverage、review evidence、G6 gate evidence で証明されなければならない。
- HELIX cutover は、personal HELIX paths と legacy `helix` command delegation への active internal asset dependence を除去しなければならない。

## 証跡

- `helix doctor`: exit 0.
  - pair-freeze: OK、38 design/test-design pairs、orphan 0 を確認。
  - l6-fr-coverage: OK、47 FR rows が L6 unit contract / U-* oracle に接続済み。
  - l6-completion: OK、18 L6 docs、L7 confirmed、G6 PASS を確認。
  - review-evidence: OK、cross_agent worker/reviewer separation と tests_green_at <= reviewed_at。
  - verification: L0-L3、L4-L6、L0-L6 はすべて freeze complete and verification cycle fireable と report。
- `bun run typecheck`: pass (`tsc --noEmit`).
- `bun run lint`: pass (Biome checked 75 files 済み)。
- `bun run test`: pass (38 test files、316 tests 済み)。
- `asset-drift`: real repo active internal assets と prompt templates で OK:
  - `.claude/agents/*.md`、`docs/skills`、`docs/templates/prompts/*.md` enrolled。
  - HELIX personal path residue 0。
  - legacy `helix codex` / `helix claude` / `helix plan` / `helix gate` / `helix handover` delegation residue 0。
  - `docs/skills` non-empty。
  - guard allowlist の missing agent docs 0。

## Evidence の境界

- doctor の `verification` line は "freeze complete and verification cycle fireable" を意味する。それ自体は manual verification cycle ではない。
- Prior L6 substance review では issues が見つかっていた: A-110 は MUST/SHOULD findings を記録し、A-111 はそれらを G6 に対して non-blocking にした remediation/recheck を記録している。
- したがって、この audit が支持するのは GATE-A technical readiness と cutover hardening であり、より強い claim である "all Phase 2 artifacts were freshly re-read and no issues were found" ではない。

## Cutover のために行った changes

- `src/lint/asset-drift.ts` を現在の FR-L1-49 hard gate slice として追加した。
- `checkAssetDrift` を `runDoctor.ok` に接続した。
- U-ASSETDRIFT-001..006 unit-test oracles を L7 unit test design に追加した。
- `.claude/agents/*.md` active internal assets と `docs/templates/prompts/*.md` を更新し、`~/ai-dev-kit-vscode` を読まないようにし、legacy `helix codex` 経由の delegation を停止した。
- pmo-helix explorer/scout を personal workspace ではなく `vendor/helix-source/` snapshot exploration へ再 scope した。

## Non-blocker carry の残件

- IMP-087 / IMP-088 は残る: orphan implementation back-fill と impl-to-PLAN traceability lint。
- L9 test design の placeholder-deps は、dedicated hard lint が planned されない限り、later back-fill items のまま。
- relation-graph / dependency-drift / regression expansion は later PLANs のまま。
- `.helix/audit/A-100..A-118` tracking は PO git-tracking decision のまま。

## 判断

L0-L6 verification readiness と active HELIX cutover hardening は PASS。より強い Phase 2 full-review claim は A-118 で別に扱う。A-118 は L4/L5/L6 design docs、L7/L8/L9 test-design docs、PLANs、findings、remediation status、carry routing を列挙している。PO acceptance は別の human decision のままである。
