# PHCAP-15 Deploy 第五12 static research

PHCAP-15 Deploy の候補pool78件について、既レビュー5束（#2001 7件、#2004 12件、SCF-B-0037 3件、SCF-B-0059 third12 12件、SCF-B-0060 next12 12件）を除いた残分母32件から、次の12 assetを静的に分類する research Scaffold である。本束を加えたレビュー済み／選択済み範囲は58件、未レビュー分母は20件である。pool membershipは要求リンク、product owner、phase admissionを生成しない。

基準は `origin/main` `ce66af3b36727872369a549f01941b26c2b19088`、worktree は `/home/tenni/.helix-worktrees/phcap15-deploy-fifth12`。Binding は Wave37 予約の衝突を避けて `SCF-B-0063` とする。変更は `scaffold/` 内に限定する。

| asset | semantic kind | old source | candidate phase | candidate products | old/current state |
|---|---|---|---|---|---|
| `LEGACY-ASSET-D5630716F221DA23DB09` | L6 function contract design | `docs/design/helix/L6-function-design/pillar-function-design.md` | PHCAP-06/PHCAP-15/PHCAP-16/PHCAP-19/PHCAP-20 | HELIX-HARNESS/HELIX-OS/HELIX-Web/HELIX-Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-93505A0E6A989C5C0F09` | concept capability delta operation document | `docs/governance/candidates/helix-concept-v4-capability-delta.md` | PHCAP-01/PHCAP-15/PHCAP-16/PHCAP-19 | HELIX-HARNESS/HELIX-OS/HELIX-Web/HELIX-Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-02319C2481B9E01698D5` | HELIX-HARNESS requirements source snapshot | `docs/governance/helix-harness-requirements_v1.3.md` | PHCAP-04/PHCAP-15/PHCAP-16/PHCAP-17/PHCAP-18/PHCAP-19/PHCAP-20 | HELIX-HARNESS/HELIX-OS/HELIX-Web/HELIX-Web-OS | non_executable_read_only_source／current implementation・degradation unknown |
| `LEGACY-ASSET-5D71CA1E0DB0DBDAD8F2` | objective evidence audit operation document | `docs/governance/helix-objective-evidence-audit.md` | PHCAP-15/PHCAP-16/PHCAP-19/PHCAP-20 | HELIX-HARNESS/HELIX-OS/HELIX-Web/HELIX-Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-10DC603C5CC9499788F0` | L12 canonical V-model directive | `docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md` | PHCAP-15 | HELIX-OS/HELIX-Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-DF1EA776C672AEB4E55F` | L12 current authority disposition | `docs/governance/l12-hybrid-current-authority-disposition-2026-07-19.md` | PHCAP-15/PHCAP-16/PHCAP-17/PHCAP-18/PHCAP-19/PHCAP-20 | HELIX-HARNESS/HELIX-OS/HELIX-Web/HELIX-Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-269C287365D652DEAD93` | L3 rebaseline freeze packet | `docs/governance/l3-rebaseline-g3-freeze-packet.md` | PHCAP-15/PHCAP-16/PHCAP-18/PHCAP-19 | HELIX-HARNESS/HELIX-OS/HELIX-Web/HELIX-Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-DE68E15724FB6EC258AB` | plan descent baseline configuration | `docs/governance/plan-descent-baseline.json` | PHCAP-08/PHCAP-15/PHCAP-16/PHCAP-17/PHCAP-20 | HELIX-HARNESS/HELIX-OS/HELIX-Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-38BEF2B0F4373A2749B4` | plan entry routing baseline configuration | `docs/governance/plan-entry-routing-baseline.json` | PHCAP-09/PHCAP-15/PHCAP-16/PHCAP-17/PHCAP-18/PHCAP-19/PHCAP-20 | HELIX-HARNESS/HELIX-OS/HELIX-Web/HELIX-Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-20466A68C0622610B827` | release Module Bundle rollout roadmap | `docs/governance/release-module-bundle-rollout-roadmap.md` | PHCAP-08/PHCAP-14/PHCAP-15/PHCAP-16/PHCAP-17/PHCAP-19 | HELIX-HARNESS/HELIX-OS/HELIX-Web/HELIX-Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-8F3454E00276A341622B` | system synthesis rollout roadmap | `docs/governance/system-synthesis-rollout-roadmap.md` | PHCAP-08/PHCAP-15/PHCAP-16 | HELIX-OS/HELIX-Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-D52C1596B4C54B842920` | upstream reconciliation completeness audit | `docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md` | PHCAP-15/PHCAP-16/PHCAP-20 | HELIX-OS/HELIX-Web-OS | unknown／current implementation・degradation unknown |

## Evidence boundary

各assetは旧sourceのarchive path、source SHA、line count、2つのexact span／span SHA、phase／disposition ledger line、candidate phase／productを保持する。旧source本文と分類／disposition／decision／copy-read-after台帳を静的に照合した。選択集合では `LEGACY-ASSET-02319C2481B9E01698D5` に append-only decision 2件、copy/read-after 1件、consumer refs 2件がある。この履歴を保持するが、訂正行は現行authorityや要求採用を生成せず、consumer closureは pending のままとする。他11件は decision match 0、copy/read-after 0、consumer refs空であり、空欄を歴史的consumer不存在とは解釈しない。

failure evidenceは12件とも `execution_receipts=0`、`failure_outcome_observed=false`、`source_boundary_only_unexecuted` として保持する。sourceに現れる停止条件、未承認、gap、no-deploy、approval、runtime言及は静的な意味 evidenceであり、現行implementation、operation、acceptance、degradation、deployment、rollback、成功receiptを証明しない。

四製品（HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS）の責務境界は候補として列挙する。owner、authority、routing、current implementationは未解決であり、Web evidenceの欠如を未実装へ変換しない。PHCAP-15 phase snapshotは `draft_requirement`、legacy capabilityは `documented_partial`、transitionは `degraded_to_draft`、`new_build_allowed=false`、authority effectは `inventory_and_work_projection_only` である。これはphase全体のsnapshotであり、個別assetの現行縮退判定ではない。

旧archiveは source／span／digest の静的参照だけに限定し、旧workflow、runtime、CLI、hook、adapter、source、test、CIは実行していない。正式要求、phase authority、product owner、successor、implementation、degradation、acceptance、release、deployment、consumer closureは生成していない。

## Validation

```text
python3 -B scaffold/phcap15-deploy-fifth12-research/validate.py
python3 -B scaffold/phcap15-deploy-fifth12-research/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` は pool78、既レビュー5束46件、本束12件、残20件の分母、非重複、ledger／archive digest、exact spans、phase／product候補、decision、copy/read-after、failure、consumer、implementation／degradation unknownを独立期待値で確認する。`selfcheck.py` は分母、重複、自由文、authority、phase、implementation、degradation、failure receipt、consumer closure、decision、copy-read-after、product boundary、再帰nested key、anchor meaning/count、unresolved、semantic kind、equivalence、prohibited inference、required commandの負例を拒否する。
