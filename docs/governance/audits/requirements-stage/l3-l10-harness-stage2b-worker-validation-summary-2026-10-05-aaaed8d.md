# HARNESS Stage 2b 012/013 作成後の静的照合記録

対象本文revisionは `aaaed8d53133be3d2d25cc82f51e62c2f44ac844`（`docs: retain conditionally applied prototype results in HARNESS`）、base prefix revisionは `eb58becb660b8a79bb01e612d1854343dfb29192` です。rootが本文と3所見修正を検収した後、Workerとしてsource pin・prefix・ID件数・現行行pinを機械照合しました。rootが最終検収責務を持ちます。

- 対象はHARNESS-L2-012/013のStage 2b 1.0候補です。Stage 1/2a/2cのprefixは6文書すべてbase bytesと一致し、既存immutable監査を変更していません。
- 54 source pinをGit objectから再計算し、43 bounded raw-LF spansの物理範囲、全体SHA-256、span SHA-256/byte長/literal、該当行pinを照合しました。6つのcurrent body pinを新本文revisionへ更新しています。28 current-line pinsを本文と再照合し、rootが修正したAC-013-05のliteral/hashを更新しました。
- actual inventory: parents 2; FR 2; AC 8; functional CASE 12; BR 0; business CASE 0; NFR candidates 2; NFR measurement CASE 2.
- rootが指摘した012 Decide後production条件/authorityの独立入力、013 engine/CORE契約field単独negative、NFR案比較の修正をcurrent revisionで確認対象として記録しました。これらは要求承認を意味しません。
- 独立Claude review、POのL3承認、L10実行は未成立です。authority effectはありません。

静的検証: `scfctl validate` 147 bindings/fail 0、`stale=0`、`residuals=0`、`govcheck` 7622/57/58 PASS、`git diff --cached --check` PASS。

機械可読なsource pin、current document/line pin、countsは `l3-l10-harness-stage2b-worker-validation-2026-10-05-aaaed8d.json` に固定しています。前監査 `l3-l10-harness-stage2b-static-validation-2026-10-05-6c7875423.json` は変更せず保持します。このWorker照合は独立reviewではなく、rootの検収を置き換えません。
