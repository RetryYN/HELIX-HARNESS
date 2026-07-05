---
schema_version: skill.v1
name: tech-selection
skill_type: design-contract
applies_to:
  layers:
    - L1
    - L3
    - L4
  drive_models:
    - Forward
    - Discovery
    - Scrum
    - Add-feature
---

# tech selection（技術選定）

HELIX における technology research、比較評価、ADR 作成を扱う
（FR-L1-27 research workflow: research-memo + ADR を generates artifact として持つ）。
L4 basic design へ commit する前に、PLAN が 2 つ以上の実装 option から選ぶ必要がある場合に使う。

## この skill を読むタイミング

- `drive=Discovery` の PLAN が Scrum S1-S2 で library、runtime、architecture pattern を比較評価する。
- L3 functional design で technology choice が露出し、L4 pair-freeze 前に解決が必要。
- 新しい ADR を作成する、または既存 ADR を supersede する必要がある。
- proposed PLAN に対して `helix skill suggest` が `tech-selection` を返した。

## Research workflow（FR-L1-27）の手順

research workflow の output は、正確に次の 2 generated artifacts である。

1. **research-memo** — `docs/design/<product>/research/` 配下の time-bounded な比較文書。
   次を含める。
   - Problem statement（何をいつまでに決める必要があるか）。
   - Evaluation criteria（各 criterion は測定可能または反証可能）。
   - Candidates（最小 2、最大 5。5 を超える場合は先に絞る）。
   - Comparison table: criterion vs. candidate matrix。各 cell に evidence を置く。
   - Rejected candidates: 各候補を退ける理由を 1 文で書く。
   - Recommendation: top-ranked criteria に結びついた rationale 付きで 1 候補を推薦する。

2. **ADR** — `docs/adr/ADR-<NNN>-<kebab-slug>.md` 配下に置き、decision、status
   (`Proposed` -> `Accepted`)、context、consequences を含める。research-memo を path で参照する。

両方を PLAN の `generates` field に入れる。どちらかが欠けると `helix plan lint` は fail する。

## Evaluation criteria rules（評価 criteria rule）

- Criteria は project-grounded でなければならない。各 criterion を FR、BR、または `CLAUDE.md` の
  pillar（foundation-first、type-safety、observability など）へ結びつける。
- "popularity" や "community" を単独 criterion として使わない。これらは proxy なので、
  何の proxy かを明示する（maintenance risk、hiring、ecosystem maturity など）。
- 少なくとも 1 criterion は HELIX operational constraint にする。例: Windows/Bun compatibility、
hook integration、`bun run test` / Biome compatibility を含める。

## HELIX における ADR lifecycle

| Status | Meaning |
|--------|---------|
| Proposed | Research 完了、PO review pending。 |
| Accepted | PO confirmed。L4 design へ進める。 |
| Superseded | 新しい ADR に置換済み（successor へ link）。 |
| Deprecated | Decision が適用外。理由を記録する。 |

`Proposed` status の ADR は、それを `requires` する PLAN の pair-freeze を block する。
pair-freeze 前に ADR を `Accepted` へ進める（PO confirmation を `review_evidence` に記録する）。

## Discovery drive の S1-S2 research cycle

- S1 (plan): PLAN doc 内に research-memo skeleton を draft し、candidates と criteria を列挙する。
  `helix skill suggest` で既存 ADR が同じ decision を覆っていないことを確認する。
- S2 (PoC): candidate ごとに evidence を集め、comparison table を埋める。web research が必要な場合は
  external documentation retrieval 用に `helix claude --role pmo-tech-docs --dry-run` を使う。
- S3 (verify): 埋まった comparison table を読み、recommendation が project FR と HELIX constraints に
  結びついていることを確認する。
- S4 (decide): PO が ADR status `Accepted` を confirm し、PLAN は pair-freeze へ進む。

## tech-selection PLAN の pair-freeze checklist

- [ ] research-memo が `docs/design/.../research/` に存在し、全 section
      （problem、criteria、candidates、comparison table、recommendation）が complete。
- [ ] ADR が `docs/adr/` に存在し、status が `Accepted`、PO confirmation が `review_evidence` にある。
- [ ] 両 artifact が PLAN `generates` に列挙されている。
- [ ] `helix plan lint` exits 0.
- [ ] `helix doctor` exits 0.
- [ ] 既存 ADR を supersede する場合、`Superseded` status update と新 ADR への link がある。
