# PHCAP-15 Deploy 第六12 static research

PHCAP-15 の分類pool 78件について、既レビュー6束（#2001 7件、#2004 12件、SCF-B-0037 3件、SCF-B-0059 third12 12件、SCF-B-0060 next12 12件、SCF-B-0063 fifth12 12件）を除外した残20件から、第六12件を静的に調査する research Scaffold である。第六束を含めて70件をレビュー済み／選択済みとして固定し、残8件を未レビュー分母として保持する。pool membershipから要求リンク、product owner、phase admissionは生成しない。

基準は `origin/main` `4a2b46f38fb07d473f0799cb58fb1cf1d023b02f`、作業worktreeは `/home/tenni/.helix-worktrees/phcap15-deploy-sixth-audit`、Bindingは `SCF-B-0065` である。候補は `scaffold/` 内だけに置き、正式要求、authority、実装、縮退、acceptance、release、deploymentを生成しない。

| asset | semantic kind | old source | candidate phase | candidate products | old/current state |
|---|---|---|---|---|---|
| `LEGACY-ASSET-6929C09B95A444D95B49` | improvement backlog | `docs/improvement-backlog.md` | PHCAP-08/15/16/17/18/19/20 | HARNESS/OS/Web/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-7A4ACACE4FCC342FEB03` | memory injection rollout plan | `docs/plans/PLAN-L7-414-memory-injection-surface-rollout.md` | PHCAP-15/20 | OS/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-35E8708A100679F1E4E6` | CI governance self-heal plan | `docs/plans/PLAN-L7-423-ci-governance-self-heal.md` | PHCAP-11/15/16 | OS/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-98DD78AA6C120986F753` | DevOS distribution runtime identity plan | `docs/plans/PLAN-L7-655-distribution-devos-runtime-identity.md` | PHCAP-14/15 | OS/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-45EBBAE400D6A7382026` | identifier rename migration plan | `docs/plans/PLAN-M-02-helix-identifier-rename.md` | PHCAP-15/20 | HARNESS/OS/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-719F06F33C59C70EEE6A` | spawn bundle recovery plan | `docs/plans/PLAN-RECOVERY-39-spawn-bundle-rollout.md` | PHCAP-07/11/15/17 | HARNESS/OS/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-41F36667354D71D9E014` | reverse process documentation plan | `docs/plans/PLAN-REVERSE-01-process-docs.md` | PHCAP-15/17/18/20 | HARNESS/OS/Web/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-8D8E740D55956A2A91E0` | current runtime guidance reverse plan | `docs/plans/PLAN-REVERSE-567-current-runtime-guidance.md` | PHCAP-15 | OS/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-F3000D26921558AA2E0C` | deployment checklist note | `docs/research/assets/kimi-smoke-rerun-2026-08-08/bench/prompts/fixture3-notes.txt` | PHCAP-15 | OS/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-8B786D9FDDF61B2D569E` | proposal coverage test design | `docs/test-design/harness/proposal-document-coverage-routing.md` | PHCAP-15/16/17/19 | HARNESS/OS/Web/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-4A7A45BC495D1B2677A2` | requirement refinement source snapshot | `requirements-ir/refinement_contracts.json` | PHCAP-03/15/16/17/18/19/20 | HARNESS/OS/Web/Web-OS | non_executable_read_only_source／current implementation・degradation unknown |
| `LEGACY-ASSET-4357DACF4BA46C0B044F` | canonical reuse consumer baseline source | `src/lint/canonical-reuse-consumer-baseline.ts` | PHCAP-11/15/16/18/19/20 | HARNESS/OS/Web/Web-OS | unknown／current implementation・degradation unknown |

## Evidence boundary

旧archive sourceは各assetについてsource SHA、line count、2つのexact spanとspan SHAを静的に保持した（23行区間を24 anchorとして固定）。sourceのplan、design、test-design、implementation source、checklist記述は旧artifactの意味と停止条件を示すが、現行の実行・受入・配備receiptには昇格しない。四製品（HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS）は責務境界の候補として列挙し、owner、authority、routing、current implementationは未解決とした。Web evidenceの不足を未実装とは解釈しない。

選択12件は旧source／phase-product classification／disposition／decision／copy-read-after／consumerを突合した。`LEGACY-ASSET-4A7A45BC495D1B2677A2` だけがappend-only decision 2件、copy/read-after 1件、consumer refs 2件を持つ。この履歴は保持するが、`pending_human_confirmation` とconsumer closure pendingを維持する。他11件のdecision/copy-read-afterは0、consumer refsは空であり、空欄を歴史的consumer不存在とは解釈しない。

全12件で旧実行は行わず、execution receiptは0、failure outcomeは未観測として固定する。これは過去にfailureやrollbackが無かったことを意味しない。旧artifactのfailure／stop条件、current operation、acceptance、implementation、degradation、consumer closureはunknownまたはpendingのまま残す。PHCAP-15 phase snapshotは `draft_requirement`、`documented_partial`、`degraded_to_draft`、`new_build_allowed=false`、authority effect `inventory_and_work_projection_only` であり、個別assetの現行縮退判定ではない。

旧archiveはsource／span／digestの静的参照だけに限定し、旧workflow、runtime、CLI、hook、adapter、source、test、CIは実行していない。

## 未レビュー分母

pool 78件 − 既レビュー6束58件 − 第六束12件 = **残8件**。残IDは次の通りである。

`LEGACY-ASSET-7642909D8AA62C75E88D`, `LEGACY-ASSET-BFCA76AA319FBC61AF05`, `LEGACY-ASSET-5FEB7612134679928006`, `LEGACY-ASSET-48C1BA64B0D481CA806D`, `LEGACY-ASSET-7CAE3DCABA0F5008EB63`, `LEGACY-ASSET-4916736CCB699929CAC0`, `LEGACY-ASSET-2FA49FB93A1EFF48115F`, `LEGACY-ASSET-E0574CEA8F5B95E551C1`

## Validation

```text
python3 -B scaffold/phcap15-deploy-sixth12-research/validate.py
python3 -B scaffold/phcap15-deploy-sixth12-research/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` は最新main、pool／既レビュー6束／第六束／残8件の分母、非重複、ledger／archive digest、exact span、四製品候補、decision／copy-read-after、failure／consumer、旧／現行implementation・degradation unknownを独立期待値で確認する。`selfcheck.py` は分母、自由文、authority、phase、implementation、degradation、failure、consumer、decision、再帰nested key、anchor meaning/count、unresolved、semantic kind、equivalence、prohibited inference、required commandを含む27負例を拒否する。
