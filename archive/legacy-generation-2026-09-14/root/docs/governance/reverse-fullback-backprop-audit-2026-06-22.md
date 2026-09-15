# Reverse Fullback Backprop 監査 (2026-06-22)

2026-07-03 更新: IMP-143 の scope-missing 3 件
(`PLAN-REVERSE-20-runtime-adapter-session-lifecycle` /
`PLAN-REVERSE-21-fr-unit-coverage` / `PLAN-REVERSE-31-codex-l7-overstep`) は
各 PLAN に `backprop_scope` を back-fill し、`PLAN-REVERSE-20` には本文で主張していた
`docs/test-design/harness/L7-unit-test-design.md` を `generates` に追加した。したがって
「Generated Artifact Present, Backprop Scope Missing」の legacy debt は 0 件になった。

この監査は、confirmed/completed の `kind=reverse` + `workflow_phase=R4` +
`confirmed_reverse_type=fullback` PLAN のうち、frontmatter が `docs/design/`、
`docs/governance/`、`docs/test-design/` artifact を generate していないものを記録する。

2026-06-23 の follow-up sweep では、第二の legacy pattern も見つかった。一部の fullback PLAN は
governance/design/test-design artifact を generate しているが、明示的な `backprop_scope` decision を
まだ宣言していなかった。これは「何かが触られた」ことは証明できても、requirements、L4 basic design、
L5 detailed design が updated / not impacted / deferred のどれだったかは証明できない、という意味である。

2026-06-22 以降、新規または更新された fullback PLAN は `plan-governance` reason
`reverse_fullback_backprop_missing` で guard される。下記の legacy entries は、各 entry が次のいずれかに
なるまで visible debt として残る。

- actual backprop target artifact(s) を `generates` に追加して是正する。
- design/governance/test-design 変更が不要だった場合は `fullback` 以外へ reclassify する。
- missing backprop を実行する新しい Reverse PLAN で置き換える。

## Legacy Debt（既存 debt）

### Missing Generated Backprop Artifact（backprop artifact 生成漏れ）

| PLAN | status | route | 観測された issue |
|---|---|---|---|
| PLAN-REVERSE-02-session-log | confirmed | L3 | body は L1/L3 back-fill を主張するが、`generates` が empty。 |
| PLAN-REVERSE-03-forced-stop-feedback | confirmed | L3 | `generates` が empty で、backprop target を machine-trace できない。 |
| PLAN-REVERSE-04-setup-solo-team | confirmed | L4 | `generates` が empty で、backprop target を machine-trace できない。 |
| PLAN-REVERSE-05-handover-mechanism | confirmed | L1 | `generates` が empty。L6 design reference は 1 件あるが frontmatter が trace していない。 |
| PLAN-REVERSE-06-workflow-improvements | confirmed | L1 | `generates` が empty で、backprop target を machine-trace できない。 |
| PLAN-REVERSE-07-backfill-pairing | confirmed | L1 | `generates` が empty で、backprop target を machine-trace できない。 |
| PLAN-REVERSE-09-governance-enforcement | confirmed | L3 | `generates` が empty で、backprop target を machine-trace できない。 |
| PLAN-REVERSE-10-vmodel-pair-lint | confirmed | L3 | `generates` が empty で、backprop target を machine-trace できない。 |
| PLAN-REVERSE-11-verification-trigger | confirmed | L3 | `generates` が empty で、backprop target を machine-trace できない。 |
| PLAN-REVERSE-22-l6-completion-readiness | confirmed | L5 | Reverse PLAN だけを generate する。metadata-only または normalization の可能性が高く、fullback は証明されない。 |
| PLAN-REVERSE-23-coding-rules-workflow | confirmed | L5 | Reverse PLAN だけを generate し、backprop target を machine-trace できない。 |
| PLAN-REVERSE-24-structured-error-handling | confirmed | L5 | Reverse PLAN だけを generate し、backprop target を machine-trace できない。 |
| PLAN-REVERSE-25-module-boundary-rule | confirmed | L5 | Reverse PLAN だけを generate し、backprop target を machine-trace できない。 |
| PLAN-REVERSE-26-domain-boundary-lint | confirmed | L5 | Reverse PLAN だけを generate し、backprop target を machine-trace できない。 |
| PLAN-REVERSE-27-invariant-test-trace | confirmed | L5 | Reverse PLAN だけを generate し、backprop target を machine-trace できない。 |
| PLAN-REVERSE-28-red-first-tdd-evidence | confirmed | L5 | Reverse PLAN だけを generate し、backprop target を machine-trace できない。 |
| PLAN-REVERSE-29-test-oracle-strength | confirmed | L5 | Reverse PLAN だけを generate し、backprop target を machine-trace できない。 |
| PLAN-REVERSE-30-integration-gwt-lint | confirmed | L5 | Reverse PLAN だけを generate し、backprop target を machine-trace できない。 |
| PLAN-REVERSE-32-cross-artifact-relation-graph | confirmed | L5 | Reverse PLAN だけを generate し、backprop target を machine-trace できない。 |
| PLAN-REVERSE-33-mcp-profile-config-safety | confirmed | L5 | Reverse PLAN だけを generate し、backprop target を machine-trace できない。 |
| PLAN-REVERSE-34-tool-adapter-probes | confirmed | L5 | Reverse PLAN だけを generate し、backprop target を machine-trace できない。 |
| PLAN-REVERSE-35-canonical-document-export | confirmed | L5 | Reverse PLAN だけを generate し、backprop target を machine-trace できない。 |
| PLAN-REVERSE-45-descent-obligation | completed | L5 | Reverse PLAN だけを generate し、backprop target を machine-trace できない。 |

### Generated Artifact Present, Backprop Scope Missing（生成 artifact はあるが scope が無い）

これらの entry は `generates` が少なくとも 1 件の upstream artifact を含んでいたため、初回監査では捕捉されなかった。
ただし `PLAN-REVERSE-107` で導入した、より強い `backprop_scope` record がまだ欠けていた。

| PLAN | status | route | generated upstream artifact(s) | remediation（是正） |
|---|---|---|---|---|
| PLAN-REVERSE-20-runtime-adapter-session-lifecycle | confirmed | L4 | requirements, L4 basic design, L7 unit test design | 2026-07-03: `backprop_scope` を追加し、L7 unit test-design を `generates` に追加。 |
| PLAN-REVERSE-21-fr-unit-coverage | confirmed | L5 | L6 function design, L7 unit test design | 2026-07-03: requirements/L4/L5 not impacted と L6/L7 updated を `backprop_scope` に明示。 |
| PLAN-REVERSE-31-codex-l7-overstep | confirmed | L5 | requirements, backlog, recovery process | 2026-07-03: requirements/process/backlog updated と L4/L5 not impacted を `backprop_scope` に明示。 |

### Non-Fullback R4 Reverse Artifact Claim Missing（非 fullback R4 の artifact claim 漏れ）

2026-06-23 の follow-up sweep では、`confirmed_reverse_type=fullback` の外側にも関連する別 pattern が見つかった。
body では `docs/design/`、`docs/governance/`、`docs/test-design/` artifact path を cite しているが、
その path が `generates` に存在しない R4 Reverse PLAN である。これらは reverse back-fill のような語を使う、
または design/governance normalization を Forward layer へ戻していても、fullback-only gate の外側だった。

2026-06-23 以降、新規または更新された non-fullback R4 Reverse PLAN は `plan-governance` reason
`reverse_r4_claimed_artifact_missing` で guard される。

| PLAN | reverse_type | route | missing claimed artifact(s)（欠落 artifact） |
|---|---|---|---|
| PLAN-REVERSE-12-review-evidence | design | gap-only | 欠落: `docs/governance/helix-harness-concept_v3.1.md` |
| PLAN-REVERSE-36-verification-cycle-gate-naming | normalization | L3 | 欠落: `docs/design/harness/L3-functional/roadmap.md` |
| PLAN-REVERSE-40-orphan-governance | design | L5 | 欠落: `docs/design/harness/L1-requirements/functional-requirements.md` |
| PLAN-REVERSE-41-substance-lints | design | L5 | 欠落: `docs/design/harness/L1-requirements/functional-requirements.md`, `docs/governance/repository-structure.md`, `docs/test-design/harness/L7-unit-test-design.md` |
| PLAN-REVERSE-42-regression-dependency-drift | code | L5 | 欠落: `docs/design/harness/L3-functional/roadmap.md`, `docs/design/harness/L6-function-design/function-spec.md`, `docs/governance/gate-design.md` |
| PLAN-REVERSE-44-roadmap-definition-design | design | L4 | 欠落: `docs/design/harness/L4-basic-design/`, `docs/design/harness/L6-function-design/`, `docs/governance/helix-harness-concept_v3.1.md`, `docs/governance/helix-harness-requirements_v1.2.md` |
| PLAN-REVERSE-46-deliverable-catalog-extension | normalization | L4 | 欠落: `docs/governance/document-system-map.md`, `docs/governance/helix-harness-concept_v3.1.md`, `docs/governance/helix-harness-requirements_v1.2.md` |

### Current Sweep Summary（現行 sweep 要約）

2026-06-23 時点で、confirmed/completed R4 fullback PLAN は次のように分類される。

| category | count | meaning（意味） |
|---|---:|---|
| Generated upstream artifact + `backprop_scope` present | 12 | Current compliant shape (2026-07-03 に IMP-143 scope-missing 3 件を back-fill 済み)。 |
| Generated upstream artifact present, `backprop_scope` missing | 0 | IMP-143 の scope-missing legacy debt は解消済み。 |
| No generated upstream artifact and no `backprop_scope` | 23 | original audit table 由来の legacy debt。 |

Non-fullback R4 Reverse sweep でも、generated されていない literal upstream artifact claim を持つ
confirmed/completed PLAN が 7 件見つかった。これらは新しい `reverse_r4_claimed_artifact_missing`
guard 配下の legacy debt である。

## Current Remediation（現行是正）

`PLAN-REVERSE-101-db-projection-backprop-gate` は enforcement date に作成されたため legacy debt ではない。
同 slice で、新しい fullback backprop gate を定義する requirements document を generate することで是正済みである。
`PLAN-REVERSE-107-reverse-fullback-scope-gate` は、新規または更新された fullback PLAN 向けに、より強い
scope rule を追加する。上記 legacy scope-missing entries は、更新または reclassified されるまで debt として残る。
