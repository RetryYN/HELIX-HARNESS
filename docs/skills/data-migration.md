---
schema_version: skill.v1
name: data-migration
skill_type: process
applies_to:
  layers:
    - L4
    - L5
    - L6
    - L7
    - L8
    - L11
    - L12
  drive_models:
    - Forward
    - Add-feature
    - Retrofit
    - Recovery
---

# data migration（データ移行）

V-model Forward cycle 内の data / schema migration における ETL integrity、
strangler-fig cutover、rollback discipline を扱う。
PLAN が data store、schema、external system interface を追加・置換・削除する場合に適用する
（FR-L1-44 onboarding import を支える）。

## この skill を読む条件

- PLAN が schema、data store、external IF contract を変更する。
- Drive が Retrofit（incremental replacement）または Recovery（incident-driven cutover）。

## Design-phase obligations（L4-L5 の設計責務）

pair-freeze 前に、`docs/design/` 配下の design doc は 4 section を持つ必要がある。
**before**（current shape の記録）、**after**（target shape の記録）、**transform rules**
（field-level mapping、各 rule は独立に testable）、**rollback**
（正確な reversal steps + それを trigger する signal）。
design doc が存在し、PLAN の `parent_design` として link されるまで pair-freeze は block される。

## Strangler-fig phasing（L5 で記録する段階移行）

```
Phase 0  reads old / writes old        baseline verified
Phase 1  reads old / writes both       new store accumulates
Phase 2  reads new / writes both       new store validated under read load
Phase 3  reads new / writes new        old store idle
Phase 4  old store removed             zero consumers confirmed
```

各 boundary では、次 phase へ進む前に verification step（count、checksum、integration test）の pass が必要。
L6 test design が対応できるよう、method を L5 に記録する。

## Integrity verification（L6 test design の整合検証）

- [ ] Record count: source count = target count を確認する（fail-close）。
- [ ] Sample spot-check: representative row が field-for-field で一致する。
- [ ] transform 後の null / constraint violation が 0。
- [ ] clean target で up script が成功する。
- [ ] rollback script が pre-migration state を復元する（bidirectional test）。

test design は L5 doc と pair になる `docs/test-design/` 配下へ記録する。
test-design trace が無い migration PLAN は `ut-tdd doctor` が flag する。

## L7 implementation rules（L7 実装ルール）

- [ ] Migration code は TypeScript/Bun。harness traceability から外れる ad-hoc shell / Python は使わない。
- [ ] Idempotent: migrated 済み target へ再実行しても安全。
- [ ] 明示的な error handling: row failure では row id を log し、summary まで継続する。
      silently skip しない。
- [ ] Credential rotation は scope 外。migration に auth change が必要な場合は PO へ escalate する
      （harness escalation boundary）。
- その後 `ut-tdd review --uncommitted` を実行する。evidence には `.ut-tdd/audit/` に記録された
  passing integrity run を含める。

## Rollback decision gate（rollback 判断 gate）

L5 で measurable trigger を定義する（integrity-check failure、threshold を超える post-cutover error rate、
または `ut-tdd doctor` gate-run failure に基づく operator の明示 decision）。
subjective discomfort では rollback しない。trigger criterion が記録される前に migration を deploy しない。

## FR-L1-44 onboarding note（onboarding 補足）

既存 project を onboard する migration では、`ut-tdd setup` で `.ut-tdd/` を initialise し、
`ut-tdd status` で existing PLANs を baseline 化し、import を Phase 0 migration として扱う。
new work を始める前に、`harness.db` asset count が file-system count と一致することを検証する。
