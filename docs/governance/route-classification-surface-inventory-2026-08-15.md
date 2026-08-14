---
status: current-remediation-inventory
authority: docs/governance/helix-harness-requirements_v1.3.md + config/drive-route-catalog.json
issue: 694
measured_head: 9ae32421cf6a04ce4c4d54bc1b3edb29b701d583
measured_at: 2026-08-15
---

# route分類 surface inventory（Issue #694 / slice A）

## 1. 目的と判定境界

本書は、route、drive、PLAN kind、execution mode、specialist workflow、specialist capabilityを
同じidentityへ畳み込んでいるcurrent surfaceを列挙し、Issue #694のB〜Eへ原子的に割り当てる。
本sliceはinventoryだけを確定し、runtime、schema、DB、CLI、catalogの挙動は変更しない。

判定の優先順は、要件正本 v1.3、route catalog、current implementation、compatibility／historical evidence
とする。concept v3.1や既存設計に残る旧9-mode、`signal → mode`、広義の`drive`は未移行debtであり、
要件正本を上書きしない。L0〜L14、Bun、旧PLAN本文も同様にcurrent identityの根拠へ使わない。

## 2. 正規分類

| 軸 | current exact set／意味 | primary field |
|---|---|---|
| production delivery route | `forward_full_v`、`production_scrum`、`v_design_scrum_impl_hybrid` | `catalog_route_id` |
| signal processing route | `reverse`、`recovery`、`incident`、`refactor`、`retrofit`等 | `catalog_route_id` |
| specialist drive | `be`、`fe`、`fullstack`、`db`、`agent` | `drive` |
| PLAN kind | `design`、`add-impl`、`recovery`等 | `kind` |
| execution mode | `standalone`、`claude-only`、`codex-only`、`hybrid` | `execution_mode` |
| specialist workflow | `screen-design`等 | workflow固有ID |
| specialist capability | Universal Workflow、NFR、Design HARNESS等 | capability固有ID |

routeのcurrent outputは`catalog_route_id`と`route_class`を必須とする。`mode`／`model`は
deprecated input-only compatibility adapter以外から出力しない。

## 3. catalog差分

`config/drive-route-catalog.json`は15 routeのID、entry signal、phase、exitを保持しており、移行元の
機械authorityとして利用できる。ただし次の差分が残る。

| current | target | slice |
|---|---|---|
| route identity fieldが`route_id` | primary identityを`catalog_route_id`へ統一 | C |
| 全routeが`model`をcurrent出力する | `model`をcurrent catalogから除去し、legacy input adapterだけで読む | C／D |
| `forward_full_v.route_class == spine` | 3 production routeを同格の`delivery`にする | C |
| `production_scrum`とhybridは`model == Scrum` | route固有IDだけをcurrent identityとして返す | C／D |
| catalog名と文書名が`drive-route` | specialist driveとの混同を生まないroute catalog名へ移行計画を固定 | C |

既に正しい最低限のclassは`production_scrum=delivery`、hybrid=`delivery`、
`reverse=normalization`、`recovery=restoration`である。これをEの回帰oracleにする。

## 4. current surface差分表

| surface | 観測した旧identity／混線 | target | slice |
|---|---|---|---|
| Issue #635 | `--drive <model>`と駆動モデル中心の導出 | `signal/work item → catalog_route_id → workflow`、全15 route | B |
| `README.md`、`docs/process/README.md` | 旧mode／drive説明とcurrent route説明が混在 | 正規7軸を分離しcatalogへ接続 | B |
| `docs/process/modes/README.md` | 「駆動モデル索引」、`spine`と`delivery`を別格化 | route索引へ変更し3 production routeを同格化 | B |
| `docs/process/modes/scrum.md` | 「Scrum 駆動モデル」、旧9-modeとv1.2を出典化 | production delivery routeとしてv1.3を参照 | B |
| Feature label／CLI help | mode／model／driveをroute identityとして表示 | route label/helpは`catalog_route_id`、driveは専門職だけ | B／C |
| `src/workflow/routing-contracts.ts` | `routeSignalToMode`、`candidates: string[]`、`RouteEvalResult.mode` | `routeSignalToCatalogRoute`、候補と結果にID＋class | C |
| `src/schema/route-map.ts` | route map entryのprimary fieldが`mode` | `catalog_route_id`＋`route_class` | C |
| `src/workflow/contracts.ts` | legacy routing exportをcurrent contractとして再公開 | catalog route contractだけをcurrent export | C |
| `src/workflow/design-elicitation.ts` | `route_mode`をcurrent設計入力へ使用 | applicable route／capabilityを別fieldで保持 | C |
| `src/schema/frontmatter.ts`、plan lint | `route_mode`をPLANのcurrent route certificateに使用 | `catalog_route_id`へ移行し`kind`／`drive`と分離 | C／D |
| `src/schema/harness-db-tables-*.ts` | `route_modes` table、`route_mode`／`drive_model`列が混在 | route projectionはID＋class、specialist driveは別列 | C |
| `src/state-db/projection-writer.ts`、`current-location.ts` | legacy identityをDB current projectionへ再出力 | legacy tokenをcurrent DBへ書かない | C／D |
| `src/assets/catalog.ts`、`src/skills/recommend.ts` | `applies_drive_models`等でrouteと専門職を混在 | applicable route、drive、capabilityを別集合へ分割 | C |
| doctor／CI | legacy current outputの再出現を検出しない | current authority、DB、generated docsをfail-close | E |
| tests | `mode`／`route_mode`出力を正として固定 | route class、compatibility provenance、曖昧拒否を固定 | C〜E |

`drive_model`という文字列だけでは誤りと判定しない。専門職driveを表す正規fieldと、Scrum／Reverse等を
格納する旧workflow identityを、値のexact setとconsumer責務で分類してから移行する。

## 5. compatibility／historical隔離

次は一括置換しない。

- `docs/archive/**`、`docs/migration/**`、過去監査・snapshot。
- merge済みPLANの経緯、旧schemaのmigration fixture、legacy input回帰fixture。
- 物理path名に残る`modes`、L0〜L14等。ただしcurrent indexや生成物のauthorityにはしない。

互換入力を残す場合は、旧token、変換先`catalog_route_id`、warning、source token、adapter versionをreceiptへ
記録する。一方向変換だけを許可し、legacy identityをDB、生成文書、PR契約へ戻さない。複数routeへ解釈できる
入力は推測せずfail-closeする。

## 6. 原子的実装順と完了証拠

1. B: #635、current docs、label、READMEを要件正本へ追従させる。
2. C: catalog、runtime、CLI、schema、DB projectionを`catalog_route_id`へ移行する。
3. D: deprecated input-only adapter、warning、provenance、曖昧入力拒否を実装する。
4. E: doctor、CI、mutation-sensitive regressionで再出現を拒否する。
5. F: Reverse fullback、current-main read-after、#204への証拠接続後に#694を閉じる。

各sliceは前段のcanonical merge済みHEADへrebaseし、targeted test、全回帰、doctor、DB convergence、
Claude Code exact-HEAD独立reviewを同一HEADへ束縛する。Bの文言修正だけでは#694を完了扱いにしない。

## 7. inventory再現コマンド

```bash
rg -n --glob '!docs/archive/**' --glob '!docs/migration/**' \
  'routeSignalToMode|route_modes|route_mode|selected_drive_model|applies_drive_models|--drive|9-mode|Scrum 駆動モデル' \
  README.md docs src config tests

node -e "const c=require('./config/drive-route-catalog.json'); console.log(c.routes.map(({route_id,model,route_class})=>({route_id,model,route_class})))"
```

検索結果は候補集合であり、そのまま修正件数として数えない。current authority、runtime consumer、
compatibility adapter、historical evidenceの4区分へ分類してから対象化する。
