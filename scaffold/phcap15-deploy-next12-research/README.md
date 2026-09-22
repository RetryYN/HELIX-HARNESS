# PHCAP-15 Deploy next12 static research

PHCAP-15 Deploy の分類pool78件から、既レビューの #2001（7件）、#2004（12件）、`SCF-B-0037`（3件）、未PR third12（`SCF-B-0059`、12件）を除外した残分母44件から、次の12 assetを選んだ research scaffold である。既存4束と本束を合わせた選択・レビュー範囲は46件、残る未レビュー分母は32件である。pool membershipは要求リンク、product owner、phase admissionを生成しない。

基準は最新 `origin/main` `8f002b4d2594ea341ca0515f691eeac21139c947`、worktreeは `/home/tenni/.helix-worktrees/phcap15-deploy-next12` である。Bindingは `SCF-B-0060` とし、変更は `scaffold/` 内に限定する。

| asset | semantic kind | old source | candidate phase | candidate products | old/current state |
|---|---|---|---|---|---|
| `LEGACY-ASSET-9F48ADEEB477DCA54039` | requirement source snapshot | `docs/design/harness/L1-requirements/business-requirements.md` | PHCAP-04/15/16/17/18/20 | 4製品 | source snapshot／current unknown |
| `LEGACY-ASSET-D4DBE31CF7179061E284` | compatibility baseline configuration | `docs/governance/plan-compatibility-parent-baseline.json` | PHCAP-15/16/17/18/19/20 | 4製品 | document present／current unknown |
| `LEGACY-ASSET-3530C6D5B44F55C1692A` | L7 serverless read-only share plan | `docs/plans/PLAN-L7-146-serverless-readonly-share.md` | PHCAP-15/17 | HARNESS/OS/Web-OS | plan only／current unknown |
| `LEGACY-ASSET-9B1B5B55B610942F3216` | L7 version-up activation readiness plan | `docs/plans/PLAN-L7-216-version-up-activation-readiness.md` | PHCAP-14/15 | OS/Web-OS | plan only／current unknown |
| `LEGACY-ASSET-0CC9B511C4846B2D7489` | L7 verification profile gate plan | `docs/plans/PLAN-L7-226-verification-profile-right-arm-gate-metadata.md` | PHCAP-15 | OS/Web-OS | plan only／current unknown |
| `LEGACY-ASSET-8EB1660DDE8803009282` | verification and cutover plan | `docs/plans/PLAN-M-00-verify-cutover.md` | PHCAP-15/16/20 | OS/Web-OS | plan only／current unknown |
| `LEGACY-ASSET-FC1E6AE8D3FD1352413B` | deployment adapter template | `docs/templates/adapter/.claude/agents/devops-deploy.md` | PHCAP-10/15 | OS/Web-OS | template／current unknown |
| `LEGACY-ASSET-A569CF70586E9679DB01` | canonical reuse authority implementation source | `src/lint/canonical-reuse-authority.ts` | PHCAP-11/15/16 | OS/Web-OS | source unexecuted／current unknown |
| `LEGACY-ASSET-3C4A61F623B392DC88D6` | identifier rename implementation source | `src/lint/identifier-rename.ts` | PHCAP-11/15/16/17/19/20 | 4製品 | source unexecuted／current unknown |
| `LEGACY-ASSET-03B06987CECB57AC4AE2` | state projection implementation source | `src/state-db/projection-writer.ts` | PHCAP-15/16/17/18/19/20 | 4製品 | source unexecuted／current unknown |
| `LEGACY-ASSET-2224C11CCDA22CAAFF23` | setup template implementation source | `src/setup/templates.ts` | PHCAP-15/16/17/20 | HARNESS/OS/Web-OS | source unexecuted／current unknown |
| `LEGACY-ASSET-3D576E223565C34899F1` | identifier rename test source | `tests/identifier-rename.test.ts` | PHCAP-15/16/17/19/20 | 4製品 | test source unexecuted／current unknown |

各assetはarchive sourceのdigest、line count、exact span、span digest、phase/disposition ledger line、candidate phase/productをinventoryへ保持する。9F48はappend-only decision 2件、consumer refs 2件、read-after 1件を記録するが、consumer closureと現行実装は未解決のままとする。残る11件は選択範囲でdecision match 0、consumer refs空、read-after 0であり、空欄を歴史的consumer不存在とは解釈しない。

failure evidenceは全12件で `execution_receipts=0`、`failure_outcome_observed=false` とし、source内のblocked／no-deploy／approval／checklist等は静的な停止境界として保持する。旧sourceの存在、implementation source、test source、embedded command、過去decision、source snapshot preservationは現行implementation、operation、acceptance、degradation、deployment、rollback成功を証明しない。現行4製品の責務境界は候補として列挙し、owner、authority、routing、Web evidence欠如による未実装判定は未解決に残す。

PHCAP-15 phase recordは `draft_requirement`、legacy capabilityは `documented_partial`、transitionは `degraded_to_draft`、`new_build_allowed:false`、authority effectは `inventory_and_work_projection_only` である。これはphase全体の静的snapshotであり、個別assetの現行劣化や未実装判定ではない。archiveはbytes、line、span、digestの静的参照だけに限定し、旧workflow、runtime、CLI、hook、adapter、source、test、CIは実行していない。

## 検証

```text
python3 -B scaffold/phcap15-deploy-next12-research/validate.py
python3 -B scaffold/phcap15-deploy-next12-research/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` はpool78、既存4束34件、本束12件、残32件の分母、非重複、source/archive/ledger digest、exact span、phase/product候補、decision、failure、consumer、implementation/degradation unknownを静的に確認する。`selfcheck.py` は分母、重複、自由文、phase/authority、implementation/degradation、failure receipt、consumer closure、decision、product boundary、再帰nested key、anchor meaning/count、unresolved、semantic kind、equivalence、prohibited inference、required commandの24負例を拒否する。
