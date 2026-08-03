---
title: "worker wrapper admission L9 system test design"
layer: L9
artifact_type: test_design
status: draft
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L4-61-worker-wrapper-admission.md
pair_artifact: docs/design/helix/L4-basic-design/worker-wrapper-admission.md
related_l3: docs/design/helix/L3-requirements/worker-common-contract.md
github_issue_id: 225
behavior_contract_id: WCC-FR-02
responsibility_owner: worker-wrapper-admission
---

# worker wrapper admission L9システムテスト設計

| oracle | route | 正常条件 | negative／mutation | evidence |
|---|---|---|---|---|
| `ST-WWA-001` | `helix codex` | `buildAdapterPlan`からnative invocationへ一意に到達 | raw `codex exec`結果をwrapper結果へ後付け昇格するとRed | CLI plan、route decision、spawn count |
| `ST-WWA-002` | `helix claude` | 同じtyped routeを経由 | raw `claude`結果の成功文言だけでadmitするとRed | CLI plan、route decision、spawn count |
| `ST-WWA-003` | `helix team run` | 全memberが`AdapterPlan`ごとroute admissionを通る | command／argsへ分解後にrouteを再生成するとRed | member plan digest、decision exact set |
| `ST-WWA-004` | direct provider | `direct_provider_cli`をscorecard handoff前に拒否 | raw route許可branchへmutationするとRed | rejected decision、handoff count=0 |
| `ST-WWA-005` | provenance改竄 | wrapper内部でprovider／command／args／stdinのcanonical digestを照合後だけsealed capabilityを生成 | canonical digest照合またはcapability生成境界を除去し、raw callerがrouteを再ラベルできるmutantはRed | executable oracle、capability生成数、mutation result |
| `ST-WWA-006` | scope | 新service／DB table／workflow／benchmark runner 0 | FR05〜09を同ownerへ混載するとRed | changed path、owner、component count |

## pairクローズ

- L4 component、I/F、data flowとL9 oracleを`WCC-FR-02`へexact traceする。
- `ST-WWA-004`／`005`のfailure codeと実行witnessはL5/L8でfreezeし、L6/L7でmutation Redを実測する。
- Kimi／Grokのpre-policy smokeはhistorical inputであり、current wrapper admission evidenceへ数えない。
