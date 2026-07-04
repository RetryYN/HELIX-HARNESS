---
schema_version: skill.v1
name: incident-runbook
skill_type: process
applies_to:
  layers:
    - L6
    - L11
    - L12
    - L13
    - L14
  drive_models:
    - Forward
    - Incident
    - Recovery
---

# incident-runbook（インシデント runbook）

runbook はインシデント発生中ではなく事前に書く。これにより、対応者は単一の正本を参照できる。
この skill は、(A) L11 ops-readiness の義務としてのリリース前 runbook 作成と、
(B) live production incident に対する UT-TDD Incident drive 手順（FR-L1-16）を扱う。

## この skill を load するタイミング

- PLAN が L11 gate（system test / ops readiness）に近づいており、対象 service の runbook がまだ存在しない。
- production signal から Incident drive の PLAN が開かれた。
- `ut-tdd doctor` が production-incident / regression / hotfix signal を示した。

## Part A: リリース前 runbook（Forward / Add-feature）

runbook は `docs/ops/<service-slug>-runbook.md` に保存する。必須 section は次の3つ
（3つすべてが無い場合、L11 gate は fail する）。

1. **Alert response**: 名前付き alert を3件以上記載し、それぞれに trigger threshold、scope、
   immediate mitigation、recovery-confirmation check、follow-up を含める。
2. **Rollback**: trigger conditions、step-by-step rollback、data-integrity check を含める。
   recovery-confirmation metric を含める。
3. **Escalation chain**: 個人名ではなく role（on-call → TL → PM/PO）で記載し、
   各 role へ escalation する条件を明示する。

Threshold は observability design doc（single source of truth）を参照元にする。threshold value を重複記載しない。
runbook は PLAN の `generates` list に記録する。

## Part B の Incident drive（live production）

Incident-drive PLAN の entry conditions は、signal が production incident / regression / hotfix であること、
target が production であること、かつ production change の前に human approval
（on-call + TL + PM）が記録されていることである。

```
ut-tdd status        # PLAN entry を登録し、Incident drive を確認する
```

First response（最初の約15分）では、symptom と scope を確認し、severity を分類する
（Sev1 primary-path-down または data-loss-risk、Sev2 major degradation、Sev3 minor）。
runbook を開き、該当する alert procedure に従う。安全であれば runbook の immediate mitigation を適用する。
すべての action を timestamp 付きで `.ut-tdd/audit/<plan-id>-incident-timeline.md` に記録する。

symptom を cover する runbook procedure が無い場合、production で即興対応しない。
TL へ escalate し、新しい procedure を post-incident action として runbook に追加する。

## Post-incident（事後対応）

1. 実際に使った procedure を runbook に反映する。
2. root cause に code/design fix が必要な場合は Recovery PLAN（branch `hotfix/*`）を開く。
   design-level は `add-design`、implementation-only は L7 の `add-impl` として分類し、
   その問題を検出できたはずの regression test を追加する。
3. session boundary で `ut-tdd handover` を実行し、resolution を記録する。

## 完了 checklist

- [ ] `docs/ops/<service-slug>-runbook.md` に runbook があり、3件以上の alert procedure、
      rollback procedure、role-based escalation chain を含む。
- [ ] Threshold は observability design doc を参照している（SSoT を重複させない）。
- [ ] Incident timeline が `.ut-tdd/audit/` に記録されている。
- [ ] production change の前に three-party approval が記録されている。
- [ ] root cause に対して Recovery / add-design PLAN が開かれ、`ut-tdd handover` が実行されている。
