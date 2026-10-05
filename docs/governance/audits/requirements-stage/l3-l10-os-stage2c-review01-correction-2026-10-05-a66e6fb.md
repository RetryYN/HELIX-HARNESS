# OS Stage 2c #2598 review01 correction

- 正式コメント #2598 / `5988852398`（Opus）のUTF-8 body SHA-256: `512cb46d4cb2dc1e2a6b30f1d0e1b5e7e1c67525616e0c5a698c112943347e6f`。対象review HEAD `d5c8b669e4c97f75cf0b791e020df11c6eff4b76`。修正本文commit `a66e6fb798e7dec00c2c43597bc55d5b69f6147a`。
- 固定L2/L11: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。PO判断基点: `633bf12ea8f948db8ba3d6600179c4a9507377a7`。対象は `HELIXOS-L2-028`／`HELIXOS-L2-029`、Stage 2c、1.0 target candidate。
- 本記録は作成側修正の証跡であり、独立review、PO/L3承認、実装・実行許可を生成しない。Fable reviewは未実施。

## 指摘対応

- **M1** — L11-028 selected-source stale/conflict revision and ticket-scope-outside use are separate one-variable CASE-OS-028-03o/03p; AC-OS-028-03 binds both.
- **m1** — Four independent connection-receipt failures: authorization 03a, response 03c, source/proposal 03q, and return handoff 03r.
- **m2** — AC-OS-028-06 and CASE-06c route missing bindings through the fixed L2-028:860 owner boundary; unknown owners remain unknown.
- **m3** — CASE-OS-028-02b is explicitly traced to AC-OS-028-03 for the L2-027 limited-first-run prerequisite negative.
- **m4** — FR-OS-028 names consultation reason/response type/scope, existing L2-017/018/023 dependencies, and clarifies L2-068 placement does not require L2-010 completion.
- **m5** — Business verification trace includes AC-OS-028-05/06/07; no independent business outcome added.
- **m6** — CASE-OS-029-07 is linked to AC-OS-029-06 and includes finding-driven same-Worker/config rework and retest.
- **m7** — CASE-OS-029-04k old-HEAD review-receipt reuse and 04l self-approval are independent negatives.
- **m8** — CASE-OS-029-01 binds candidate/result to exact source revision and independent review, specifies same lightweight Worker rework/retest, and keeps LABO-L2-060 optional. NFR grade headings changed to H3; NFR-OS-029-02 parent is named.

## 正本と静的確認

六つのcanonical文書の旧/新full SHA-256、直近parent `d5c8b669e4c97f75cf0b791e020df11c6eff4b76` からのprefix byte保持、全物理行のLF-inclusive SHA pinはpaired JSONに記録した。固定source pinは39件で、各pinのgit-show full fileおよびbounded raw-LF spanを再計算して一致を確認した。traceはFR 2、AC 13、functional CASE 52（直近parentから6追加）、独立BR/CASE 0、NFR親2、NFR CASE 3。

`scfctl validate`: 147 bindings / fail 0; `stale=0`; `residuals=0`; `govcheck`: 7622 atoms / 57 requirements / 58 files; `git diff --check`: pass。旧root follow-up auditと日本語summaryは変更せず、旧SHAをJSONに保存した。旧runtime/test/CI/Bunは実行していない。
