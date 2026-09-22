# PHCAP-15 Deploy 最終候補8 static research

PHCAP-15 の分類pool 78件について、既レビュー6束（#2001 7件、#2004 12件、SCF-B-0037 3件、SCF-B-0059 third12 12件、SCF-B-0060 next12 12件、SCF-B-0063 fifth12 12件）と第六束SCF-B-0065（12件）との非重複を静的に確認し、残る8 assetを最終候補として調査する research Scaffold である。第六束の#2013 merge後に70/78の既レビュー分母を確認し、残る8件を最終候補として固定する。正式な採否・authority・implementation・degradationはroot reviewへ保留する。pool membershipは要求リンク、product owner、phase admissionを生成しない。

基準は `origin/main` `f369e2fd400a02104a67645dca681721989d63be`、作業worktreeは `/home/tenni/.helix-worktrees/phcap15-deploy-final-audit`、Binding候補は `SCF-B-0067` である。候補は `scaffold/` 内だけに置き、正式要求、authority、実装、縮退、acceptance、release、deploymentを生成しない。

| asset | semantic kind | old source | candidate phase | candidate products | old/current state |
|---|---|---|---|---|---|
| `LEGACY-ASSET-7642909D8AA62C75E88D` | L12 reviewed-safe disposition implementation source | `src/lint/l12-hybrid-reviewed-safe-v2.ts` | PHCAP-11/15/16/17/18/19/20 | HARNESS/OS/Web/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-BFCA76AA319FBC61AF05` | proposal research adoption implementation source | `src/task/proposal-research-data.ts` | PHCAP-15/16/17/18/19/20 | HARNESS/OS/Web/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-5FEB7612134679928006` | L0-L8 design consistency test source | `tests/l0-l8-design-consistency-audit.test.ts` | PHCAP-15/16 | OS/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-48C1BA64B0D481CA806D` | L12 hybrid recognition test source | `tests/l12-hybrid-recognition.test.ts` | PHCAP-15/16/20 | OS/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-7CAE3DCABA0F5008EB63` | plan governance lint test source | `tests/plan-lint.test.ts` | PHCAP-11/15/16 | OS/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-4916736CCB699929CAC0` | doctor slow test source | `tests/slow/doctor.test.ts` | PHCAP-11/15/16/17/19/20 | HARNESS/OS/Web/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-2FA49FB93A1EFF48115F` | task classification test source | `tests/task-classify.test.ts` | PHCAP-15/16/17/18 | HARNESS/OS/Web/Web-OS | unknown／current implementation・degradation unknown |
| `LEGACY-ASSET-E0574CEA8F5B95E551C1` | version-up readiness test source | `tests/version-up-readiness.test.ts` | PHCAP-14/15 | OS/Web-OS | unknown／current implementation・degradation unknown |

## Evidence boundary

旧archive sourceは8 assetについてsource SHA、line count、16 exact spansとspan SHAを静的に保持した。implementation sourceやtest sourceのimport、assertion、oracle、failure条件は旧artifactの意味と証拠設計を示すが、実行receipt、現行実装、現行受入、配備receiptには昇格しない。旧test、旧runtime、旧workflow、旧CIは実行していない。

四製品（HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS）は責務境界の候補として列挙し、owner、authority、routing、current implementationは未解決とした。直接Web evidenceの不足を未実装とは解釈しない。全8件はdecision 0、copy/read-after 0、consumer refs空であり、空欄を歴史的consumer不存在とは解釈しない。

全8件で旧実行は行わず、execution receiptは0、failure outcomeは未観測として固定する。これは過去にfailureやrollbackが無かったことを意味しない。source上の停止条件、assertion、blocked状態、current operation、acceptance、implementation、degradation、consumer closureはunknownまたはpendingのまま残す。PHCAP-15 phase snapshotは `draft_requirement`、`documented_partial`、`degraded_to_draft`、`new_build_allowed=false`、authority effect `inventory_and_work_projection_only` であり、個別assetの現行縮退判定ではない。

## 分母の扱い

pool 78件のうち、第六束SCF-B-0065の#2013 merge後に既レビュー6束70件を確認し、残り8件を静的な最終候補として調査した。pool全体の候補分類は揃うが、正式な採否、authority、implementation、degradation、最終PR作成はroot reviewへ保留する。

## Validation

```text
python3 -B scaffold/phcap15-deploy-final8-research/validate.py
python3 -B scaffold/phcap15-deploy-final8-research/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` は最新main、pool／既レビュー6束／第六束／最終候補8件のcoverage、非重複、ledger／archive digest、exact span、四製品候補、decision／copy-read-after、failure／consumer、旧／現行implementation・degradation unknownを独立期待値で確認する。`selfcheck.py` は分母、自由文、authority、phase、implementation、degradation、failure、consumer、decision、再帰nested key、anchor meaning/count、unresolved、semantic kind、equivalence、prohibited inference、required commandを含む28負例を拒否する。
