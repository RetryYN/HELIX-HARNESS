---
status: current-remediation-inventory
authority: docs/governance/helix-harness-requirements_v1.3.md
authority_registry: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
issue: 694
measured_head: be07e33d87752de06d4dc4143643393625b95ade
measured_at: 2026-08-15
---

# workflow分類surface inventory（Issue #694 / slice A1）

## 1. 目的と判定境界

本書は、旧route、drive、PLAN kind、execution mode、specialist workflow、specialist capabilityを
同じidentityへ畳み込んでいるsurfaceを列挙し、Issue #694の後続sliceへ原子的に割り当てる。
意味authorityは要件正本だけであり、requirements-owned versioned registryはその機械可読表現である。

current generated projectionは`config/workflow-classification-catalog.v1.json`である。
`config/drive-route-catalog.json`の現15件はfrozen compatibility inventory／移行元観測値であり、
件数、ID、`route_class`、`model`を新要件へ昇格せず、current projectionへ変換しない。
concept、既存設計、旧9-mode、`signal → mode`、広義の`drive`もcurrent identityの根拠に使わない。

## 2. 正規分類

| axis | registry v1 exact set／意味 | current identity field |
|---|---|---|
| development style | `FULL_L1_L12_V` / `PRODUCTION_SCRUM` / `V_DESIGN_SCRUM_IMPLEMENTATION` | `development_style_id` |
| case-driven model | `DISCOVERY_POC` | `case_driven_model_id` |
| workflow model | `REVERSE` / `RECOVERY` / `INCIDENT` / `REFACTOR` / `RETROFIT` / `RESEARCH` / `ADD_FEATURE` / `VERSION_UP` / `REDESIGN` / `DESIGN_REFACTOR` / `PERFORMANCE_REFACTOR` | `workflow_model_id` |
| subroute | `SCRUM_REVERSE` | `subroute_id` |
| state machine | `DISCOVERY_POC_S0_S4` / `SCRUM_REVERSE_SR0_SR4` | `state_machine_id` |
| specialist drive | `BE` / `FE` / `FULLSTACK` / `DB` / `AGENT` | `specialist_drive_id` |
| specialist workflow | `SCREEN_DESIGN` | `specialist_workflow_id` |
| specialist capability | `DESIGN_HARNESS` / `UNIVERSAL_WORKFLOW` / `NFR_MEASUREMENT` | `specialist_capability_ids` |
| execution mode | `STANDALONE` / `CLAUDE_ONLY` / `CODEX_ONLY` / `HYBRID` | `execution_mode_id` |

これらを共通route enum、共通`catalog_route_id`、共通`route_class`、共通CLI引数、共通DB列へ
畳み込まない。PLAN kindはPLAN schema固有axisであり、registry identityとは別に維持する。
複数axisが必要なwork itemはtyped relationで接続し、単一routeへ固定所属させない。

## 3. 旧catalogのdisposition

| legacy観測値 | current disposition | 後続slice |
|---|---|---|
| 15 route exact set | compatibility inventory。current受入件数にしない | C／D |
| `route_id` / `catalog_route_id` | legacy adapterの入力・provenanceに限定 | C／D |
| `model` | legacy input-only。current outputへ再出力しない | C／D |
| `route_class` | legacy projection metadata。全axis共通classへ昇格しない | C／D |
| `forward_full_v=spine`、production系=`delivery` | 旧catalog内の観測値。新registryの意味を決めない | C |
| `drive-route`という名称 | specialist driveとの混同を除くgenerated projection名へ移行 | C |

catalog生成器はregistry version、requirements source digest、registry digestを束縛し、manual driftを
doctorで拒否する。legacy側greenでcanonical registryの欠落・不一致を相殺しない。

## 4. current surface差分表

| surface | 観測した旧identity／混線 | target | slice |
|---|---|---|---|
| Issue #635 | 旧15-route、`--route`、共通`route_class`を受入条件化していた | registry exact set／typed relationをconsumeするguide生成へ是正済み。main read-afterで保持 | B |
| Issue #188 | `catalog_route_id`／`route_class`をrouting authorityにしていた | registry version／typed axis／typed ID／source digestをconsumeする形へ是正済み | B |
| `README.md`、`docs/process/README.md` | 旧mode／drive／route説明が混在 | registry axisを分離しrequirementsへ接続 | B |
| `docs/process/modes/README.md` | 「駆動モデル索引」と旧route分類 | compatibility-only索引へ降格しcurrent workflow索引をregistryから生成 | B |
| `docs/process/modes/scrum.md` | 「Scrum 駆動モデル」、旧9-mode、v1.2を出典化 | `PRODUCTION_SCRUM` development styleとしてv1.3.5を参照 | B |
| Feature label／CLI help | mode／model／driveをroute identityとして表示 | typed axis別label／引数。`drive`は専門職exact setだけ | B／C |
| `src/workflow/routing-contracts.ts` | `routeSignalToMode`、`RouteEvalResult.mode` | `routeSignalToWorkflowIdentity`とtyped unresolved result | C |
| `src/schema/route-map.ts` | primary fieldが`mode` | registry version＋target axis＋target ID | C |
| `src/workflow/contracts.ts` | legacy routing exportをcurrent contractとして再公開 | registry-backed typed contractだけをcurrent export | C |
| `src/workflow/design-elicitation.ts` | `route_mode`をcurrent設計入力へ使用 | applicable typed identities／capabilitiesをaxis別集合で保持 | C |
| `src/schema/frontmatter.ts`、plan lint | `route_mode`をPLANのcurrent certificateに使用 | PLAN kind／driveと分離したtyped workflow bindingへ移行 | C／D |
| `src/schema/harness-db-tables-*.ts` | `route_modes` table、`route_mode`／`drive_model`列が混在 | registry versionとaxis別projection。legacy tableはread-only migration境界 | C／D |
| `src/state-db/projection-writer.ts`、`current-location.ts` | legacy identityをcurrent DBへ再出力 | legacy tokenをcurrent DBへ書かずprovenance receiptだけに残す | C／D |
| `src/assets/catalog.ts`、`src/skills/recommend.ts` | `applies_drive_models`等でworkflowと専門職を混在 | applicable workflow／drive／capabilityをaxis別集合へ分割 | C |
| doctor／CI | legacy current outputとregistry driftを検出しない | authority digest、projection drift、axis混同、legacy再出力をfail-close | E |
| tests | `mode`／`route_mode`／旧15件をcurrent oracleとして固定 | typed identity、compatibility provenance、曖昧拒否を固定 | C〜E |

文字列だけで誤りと判定せず、current authority、generated projection、compatibility input、historical evidenceの
4区分とconsumer責務で判定する。ただしcurrent output／DB／generated docsがlegacy identityを意味正本として
再出力した場合はfail-closeする。

## 5. compatibility／historical隔離

- `docs/archive/**`、`docs/migration/**`、過去監査、snapshotはhistorical evidenceとして保持できる。
- merge済みPLANの経緯、旧schema migration fixture、legacy input regression fixtureはcurrent正本から除外する。
- 物理path名の`modes`や旧層IDを一括改名せず、current index／生成物のauthorityから先に外す。
- legacy adapterはsource token、変換先axis／ID、warning、adapter versionをreceiptへ残す。
- 一方向変換だけを許可し、曖昧値、複数候補、registry未登録値は推測せずfail-closeする。

## 6. 原子的実装順と完了証拠

1. A0: requirements v1.3.5とversioned registry／schemaをcanonical mergeする。
2. A1: 本inventory、#694、#635、#188をrequirements registryへ同期する。
3. B: current docs、label、READMEをregistry projectionへ追従させる。
4. C: generated catalog、runtime、CLI、schema、DBをtyped identityへ移行する。
5. D: deprecated input-only adapter、warning、provenance、曖昧入力拒否を実装する。
6. E: doctor、CI、mutation testでregistry drift、axis混同、legacy再出力を拒否する。
7. F: Reverse fullback、current-main read-after、#204への証拠接続後に#694を閉じる。

各sliceは前段のcanonical merge済みHEADへ再束縛し、targeted、全回帰、doctor、DB convergence、
Claude Code Opus exact-HEAD独立reviewを同一HEADへ束縛する。文言だけの是正で#694を完了扱いにしない。

## 7. inventory再現コマンド

```bash
rg -n --glob '!docs/archive/**' --glob '!docs/migration/**' \
  'routeSignalToMode|route_modes|route_mode|selected_drive_model|applies_drive_models|catalog_route_id|route_class|--drive|9-mode|Scrum 駆動モデル' \
  README.md docs src config tests
```

検索結果は候補集合であり、そのまま修正件数として数えない。4区分へ分類し、requirements registryとの
意味差分を記録してから対象化する。
