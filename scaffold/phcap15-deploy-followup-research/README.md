# PHCAP-15 Deploy follow-up static research

これは PHCAP-15 Deploy の分類候補78件から、PR #2001の代表7件と既存 `SCF-B-0037` の3件を除外した後、意味的に異なる12件を静的監査する research premise 候補である。正式な要求採否、phase admission、product owner、successor、現行authority、実装、劣化、failure outcome、consumer closure、acceptance、release、deployment は生成しない。

基準は fresh isolated worktree の `origin/main` `685c69c3c174ac6121812dade30ed75e510986e6` である。作業開始時と終了時の `origin/main` は同一で、変更時は rebaseline してから再判定する停止条件を inventory に固定した。

## 分母と非重複

phase/product classification ledgerで `candidate_phase_targets` に `PHCAP-15` を含むassetは78件、ID重複はない。PR #2001 (`c864cebfbda69707529cbb0307625eac1b543add`) の7件と `SCF-B-0037` の3件を既調査範囲として除外し、残る68件から次の12件を選んだ。残る未調査分母は56件である。

| asset | source | semantic kind |
|---|---|---|
| `LEGACY-ASSET-7D081AD1F95E968FA77C` | `.helix/audit/A-136-cycle-p4-verification-audit.md` | audit／evidence boundary |
| `LEGACY-ASSET-1C02673C4901B24D963D` | `.helix/evidence/rename/blast-radius-baseline.json` | runtime-state／rename evidence inventory |
| `LEGACY-ASSET-0AD2FD852BAB0CEC864B` | `config/plan-legacy-workflow-identity-inventory.json` | compatibility configuration inventory |
| `LEGACY-ASSET-99E3BCA46E08C4A328FC` | `config/plan-specific-vpair-binding-authority.json` | plan-specific authority configuration |
| `LEGACY-ASSET-17C4BF78919578FEBB18` | `docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md` | L3 lifecycle/deployment requirement |
| `LEGACY-ASSET-A2F6A697D7FFFD490B57` | `docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md` | L3 release/bundle requirement |
| `LEGACY-ASSET-897CAC574F146D976BD7` | `docs/design/helix/L6-function-design/current-runtime-guidance.md` | L6 runtime guidance document |
| `LEGACY-ASSET-FD0947CF40FB2B301664` | `docs/plans/PLAN-L7-289-version-up-cloud-deploy-source-ledger.md` | L7 cloud-deploy source-ledger plan |
| `LEGACY-ASSET-9E033C3E39BE107D4CF1` | `docs/process/modes/incident.md` | Incident workflow process |
| `LEGACY-ASSET-3E3D84D599ED0476926B` | `docs/process/modes/version-up.md` | version-up workflow process |
| `LEGACY-ASSET-92811340BD843B5EC3FD` | `tests/goal-evidence-audit.test.ts` | test source for objective evidence audit |
| `LEGACY-ASSET-7E68FC7E2F08FD31B0C1` | `tests/product-lifecycle-operations-requirements.test.ts` | test source for lifecycle operations authority |

`inventory.json` に78件全ID、除外集合、12件、残る56件を保持する。選択assetはすべてsource/archive path、source file digest、exact line span、span digest、phase ledger、asset disposition ledgerへ戻れる。選択assetに対するappend-only decision matchは0、copy/read-after matchは0、failure execution receiptは0、consumer refsは空、consumer closureはpendingである。

## 旧assetと現行境界

12件は文書、設定、runtime-state、plan、process、test sourceを横断するが、sourceの存在や旧source内のcommand・review・test・runtime-state記述を現行実装、実行、pass、deployment、rollback成功へ変換しない。asset ledgerのlegacy implementation statusは全件 `unknown`、current implementation／operation／acceptance／degradationも `unknown` のまま保持する。

四製品は候補境界として全件列挙する。HARNESSは工程・artifact・consumer条件、OSはproject authorityとrelease準備・evidence統制、Webは利用者向け体験、Web-OSはtenant/service runtimeと配備・監視・復旧の候補である。product owner、正式routing、authority、edge採否は未解決である。Webの直接PHCAP-15 evidence不在は未実装の根拠にしない。

PHCAP-15 phase recordは `draft_requirement`、legacy capabilityは `documented_partial`、transitionは `degraded_to_draft`、`new_build_allowed:false`、authority effectは `inventory_and_work_projection_only` である。これはphase全体のinventory表現であり、選択assetごとの現行劣化・未実装を意味しない。

旧archiveは bytes、line、span、digest の静的参照だけに限定した。旧workflow、runtime、test、CI、hook、adapter、sourceは実行していない。候補validatorとnegative selfcheckの合格は採択、承認、実装、受入、release、deploymentを意味しない。

## 検証

```sh
python3 -B scaffold/phcap15-deploy-followup-research/validate.py
python3 -B scaffold/phcap15-deploy-followup-research/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` はpool分母、除外／選択／残数、source/archive digestとexact span、asset／phase／decision／failure／consumer状態、四製品候補、authority／implementation／degradation unknownを静的に確認する。`selfcheck.py` はauthority、実装、劣化、phase admission、failure receipt、consumer closure、product owner、source span、pool非重複の改変を一時コピーで拒否する。
