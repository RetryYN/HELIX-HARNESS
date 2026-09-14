# session handover 原子的切替 packet

本書はPLAN-L7-416 Sprint 3を実行するためのaction-binding packetである。pre-cutover shadowの
実装完了をcutover承認と読み替えない。apply前は`approval.status=approved`と承認scope digestが記録されるまで、
旧CLI、CURRENT reader/writer、adapter marker、consumer生成面を変更してはならない。

## 1. 基準点と開始条件

| 項目 | preflight値 / 必須条件 |
|---|---|
| source HEAD | `befedb74`以後の承認対象commitを再取得し、実行時HEADをapprovalへ固定 |
| Reverse | PLAN-REVERSE-344 R4→Forward merge済み |
| preserve | provider 10件、operations 4件、archive 7件。path/kind/digest authority一致 |
| shadow診断 | 実体・新規導入・既存導入・command・配布の各投影で`new=0 / preconditions=0` |
| worktree | foreign変更を含めcleanなcommit済HEAD。transient working treeをsnapshotに使わない |
| approval | POによる`Sprint 3 handover atomic cutover`のaction-binding approval |

承認正本は`.helix/approvals/session-handover-cutover.json`とし、次のfieldを必須とする。

```json
{
  "schemaVersion": "handover-retirement-cutover-approval.v1",
  "decisionId": "handover-retirement-cutover:<scope-digest>",
  "status": "approved",
  "actor": "PO",
  "tool": "helix retirement cutover apply",
  "target": "PLAN-L7-416:Sprint3",
  "paramsDigest": "sha256:<cutover-manifest+commands+target-head>",
  "targetTreeDigest": "sha256:<dry-run final tree>",
  "approvedHead": "<40-hex>",
  "intentDigest": "sha256:<64-hex>",
  "preserveDigest": "sha256:<64-hex>",
  "archiveDigest": "sha256:<64-hex>",
  "generatedBaselineDigest": "sha256:<64-hex>",
  "dryRunEvidenceDigest": "sha256:<64-hex>",
  "approvedAt": "RFC3339",
  "expiresAt": "RFC3339",
  "appliedAt": "RFC3339 (status=approved_appliedで必須)",
  "terminalJournalEntryDigest": "sha256:<complete journal line> (status=approved_appliedで必須)"
}
```

apply前の`approved`は現在時刻が`expiresAt`を越えたら失効する。期限内apply後はstatusを
`approved_applied`へ遷移し、`approvedAt <= appliedAt <= expiresAt`とcomplete journal line digestへ束縛する。
terminal authorityは適用済み事実の監査証拠なので、その後のCI時刻が`expiresAt`を越えても再失効させない。
これにより未適用の古い承認再利用を拒否しつつ、適用済みmainを時限爆弾にしない。

実行時の`config/handover-retirement-enforce-authority.json`は既存parserと1:1のfieldだけを持つ。
対象fieldは`schemaVersion`、`operationId`、`intentDigest`、`preserveDigest`、`archiveDigest`、
`journalEntryDigest`、`approvalDecisionId`、`approvalStatus`である。`approvalDecisionId`は上記recordの`decisionId`と一致し、
code pinは両recordのcanonical digest、approved HEAD、cutover manifest digestを同時に固定する。
期限切れ、actor/tool/target/params drift、dry-run不一致、HEAD driftのいずれかで失効する。

## 2. 型付き切替manifest

### 2.1 撤去 — session/prose runtime

- `src/handover/index.ts`
- `src/handover/handover-constants.ts`
- `src/handover/handover-derivation.ts`
- `src/handover/handover-types.ts`
- `src/cli.ts`のsession `handover` route、`status`、`update`、`writeHandoverWarnings`、
  `runHandover` / `readPointer` / `updatePointerOwner` consumer
- `src/doctor/index.ts`のCURRENT staleness、discipline、bypass、next-action/outstanding anchor gate
- `.helix/handover/CURRENT.json`とsession prose writer/reader

provider subcommandは旧`handover` parentにnestしているため、parent削除前にsession概念を持たないaudit routeへ
移設する。provider routeやevidenceをparentと一緒に削除してはならない。

### 2.2 置換 — continuation DB / memory

| old consumer | replacement |
|---|---|
| `setActivePlanCli` | state/current-location側のactive PLAN writer |
| `plan complete -> runHandover` | durable continuation event append → DB projection → checkpoint公開 |
| `handover status` | `helix status --json`と完了packet、memory/feedback pointer |
| `agent-session-command-center`の`handover_pointer` | provenance付きcontinuation read model |
| completion/workflow packetの`sourceCommand=helix handover` | status/DB event source |
| `src/web/catalog.ts`のHandoverPanel | continuation/status view |
| `loop-recovery`のhandover stale signal | continuation projection/memory health signal |

### 2.3 generated surface — 同一manifestでatomic反転

- `AGENTS.md`、`CLAUDE.md`、`.claude/CLAUDE.md`
- `.gitignore`、`README.md`、`docs/reference/setup-guide.md`
- `docs/templates/adapter/AGENTS.md`、`docs/templates/adapter/CLAUDE.md`、
  `docs/templates/adapter/.claude/CLAUDE.md`
- `src/lint/rule-drift.ts`と`tests/rule-drift.test.ts`
- `src/setup/index.ts`、`src/setup/templates.ts`
- `.github/workflows/escalation-stale.yml`
- `docs/templates/github/common/harness-check.yml`
- `docs/templates/github/common/pack-harness-check.yml`
- `docs/templates/github/common/escalation-stale.yml`
- VSCode task、consumer CI command、初回readiness、配布projection

置換規則は`helix handover status --json`→`helix status --json`を基本とする。ただしtakeover noteは
status文言へ変換せずmemory v2 takeoverへ移管する。単純文字列置換は禁止する。

### 2.4 current文書・testの完全inventory

current docsの反転対象は次で固定する。

- `README.md`、`docs/reference/setup-guide.md`
- `docs/design/helix/L1-requirements/pillar-requirements.md`
- `docs/design/harness/L6-function-design/fr-unit-coverage.md`
- `docs/design/harness/L6-function-design/function-spec.md`
- `docs/design/harness/L6-function-design/handover-db-derivation.md`
- `docs/design/harness/L6-function-design/handover-mechanism.md`
- `docs/design/harness/L6-function-design/setup-solo-team.md`
- `docs/test-design/harness/L8-unit-test-design.md`
- `docs/test-design/harness/L9-integration-test-design.md`

retirement設計、memory設計、historical auditの禁止fixtureは保持する。old behaviorを反転または削除するtestは
`tests/handover.test.ts`、`tests/handover-db-derivation.test.ts`、
`tests/handover-derivation-wiring.test.ts`、`tests/handover-completion-wording.test.ts`、
`tests/cli-surface.test.ts`、`tests/doctor.test.ts`、`tests/slow/doctor.test.ts`、`tests/setup.test.ts`、
`tests/distribution-acceptance.test.ts`、`tests/rule-drift.test.ts`、
`tests/agent-session-command-center.test.ts`、`tests/completion-decision-packet.test.ts`、
`tests/readability.test.ts`とする。provider testとretirement/continuation testは保持する。

### 2.5 preserve / archive — 削除禁止

- `src/runtime/provider-handover.ts`
- `.helix/handover/provider/**`と`tests/provider-handover.test.ts`
- `config/handover-preserve-authority.json`
- `docs/design/{harness,helix}/L11-uat/uat-evidence-boundary.md`
- `docs/design/{harness,helix}/L14-operations/operations-feedback-boundary.md`
- `docs/archive/handover/**`
- `src/lint/handover-retirement.ts`、`src/lint/handover-resurrection.ts`
- `src/runtime/continuation.ts`、`src/runtime/retirement-preserve.ts`と対応test/authority

archive mappingは次の7件に固定し、targetは同basenameの`docs/archive/handover/<basename>`とする。

| source | SHA-256 |
|---|---|
| `docs/handover/session-handover-2026-07-02.md` | `528b2e3a30b317bd9ce981eb67a76d3e0f4ad7ba005fec254161313b68fd3a8f` |
| `docs/handover/session-handover-2026-07-03.md` | `6fba20e00711bb950be287637b0a6ac55a8bbdfecbbfbdfcfbee2ae14e4bc2ce` |
| `docs/handover/session-handover-2026-07-04.md` | `08425eeac7accee4483ee2ad22cf2e8ba75c9944ff5e6f7acbf78d844eb3931b` |
| `docs/handover/session-handover-2026-07-05.md` | `6148cdd63eecbdbab7118d694293c4a3098f93bd5251912c83c9172a11988467` |
| `docs/handover/session-handover-2026-07-06.md` | `b73d0faa8c406583332e5b8c38ddffff55fd2c95dfcae15d7ba636e280dc1fce` |
| `docs/handover/session-handover-2026-07-08.md` | `fd31150dc01105cafff2bfc85e68344f245d8394fc40dfb39c016ca7b3ef0ead` |
| `docs/handover/session-handover-2026-07-10.md` | `f129371ec1466f7631bfe804773e082fa3ca72d197e4f0d360e3116bfbf415d3` |

targetの件数・byte count・mode・per-file digest一致後だけsourceを除去する。historical PLAN/auditの
禁止fixtureや経緯記述はlive surfaceとして一括削除しない。

## 3. 実行順序

1. approved HEAD、intent、preserve/archive/generated digestを再計測しapproval scopeと比較する。
2. provider CLIを`helix provider evidence export|status`へ移設する。旧parent aliasは残さず、
   `sourceCommand=helix provider evidence`と`tests/provider-handover.test.ts`を同時反転する。
   `setActivePlanCli` consumerは`src/runtime/session-log.ts#setActivePlan`へ直接置換する。
3. `plan complete`、status、SessionStartをevent-first continuationへ切り替える。
4. doctor、command center、web catalog、completion/workflow packet、recovery signalを置換する。
5. `src/handover/**`、session CLI、CURRENT reader/writer、adapter、rule-drift、setup/template、task、CIを反転し、
   distribution、current docs/testsをnon-public staging seriesで反転する。
6. archive reconcileと全oracle green後にenforce authorityをcode-pinする。中間commitはpush/publishしない。
7. runtime + generated + docs/tests + archive + authorityを含む最終snapshotだけを単一atomic pushする。

すなわち「複数local commit、単一publish snapshot」は許すが、中間状態のbranch push、distribution生成、consumer
公開は禁止する。公開可能なcutover commitは全surfaceが同時に新契約となる最終HEADだけである。

## 4. post-cutover Vペア

| oracle | 合格条件 |
|---|---|
| U-HRET-007 | Stop / plan completeがCURRENT/session proseを生成しない |
| U-HRET-011 | fresh/brownfield/task/CI/distributionの旧command/pathが0 |
| U-HRET-012 | actual + 4 projectionのresurrection findingが0、enforce mode |
| U-HRET-013 | 旧surfaceなしでactive PLAN、blocker、next authority、feedbackを再開 |
| U-HRET-014 | provider/operations/archive以外のlive residualが0 |
| U-HRET-015 | approvalのparams/tree/generated-baseline/dry-runを再計算し、同一decision・approved HEAD・期限内apply・terminal journalへ束縛する。semantic finding 0は実resurrection gateのactual + 4 projection finding 0とANDする |
| IT-CONT-03 | 旧surface再追加fixtureがdoctor non-zero |
| IT-CONT-04 | CURRENT不存在を正常とし、read fallbackがfileを再生成しない |
| U-HRET-008/009/010 | preserve/archive count・digest・provenance・schema・query/export・retention・rollback境界が不変 |
| IT-CONT-01/02 | DB precedence、event replay/rebuild、memory/feedback join、同sequence異payloadがgreen |
| ST-DATA-06 | archive/preserve/checkpointのphysical/semantic digestが一致 |
| ST-ARCH-05 | provider/operations非join、fresh/brownfield/distribution architecture境界がgreen |

必須commandはtypecheck、Biome、targeted unit/integration、setup、distribution acceptance、CLI unknown-command、
full doctor、fresh consumer、brownfield consumerである。表の全oracleはexit ANDで、1件でも未達ならpublishしない。
`helix handover`はaliasやfallbackを残さずnon-zeroになる。

## 5. rollback / forward-fix境界

`legacy_write_disabled`到達前だけbackup/checkpoint digest一致によるrollbackを許可する。到達後は旧reader/writer、
CLI alias、CURRENT生成を復活させずforward-fixする。provider/operations/archiveのcount/digest/provenance/
schema/query/export/retentionが1件でもdriftした場合はcutoverを停止する。

## 6. 現在の判定

`status=approved_applied_pending_publish`。POは2026-07-11に「いらないなら削除したほうがいいだろ。」と明示し、
Sprint 3 session handover atomic cutoverを承認した。承認時HEADは
`d73d075479525081adf292b5ab48dfdf66dc5462`、operationは
`handover-retirement:2026-07-11-sprint3`である。

- intent: `sha256:4923d6233832852b31bb5a5d93e38a4fa7c9d1ae47caf01d15969ef71ca7a3f3`
- preserve: `sha256:aef799ee30a2dc7ddd05ca6331075bd3f00e042ef70fc3d91eaa84b98732f760`
- archive: `sha256:15f9452e5c3f7d3cbb931a86478460046faba048e25dd8f0c4ac2188b3b36d6c`
- terminal journal entry: `sha256:6d98446ca84c88286d2eec59f0cdd82f5d837efbdd933185322a031554b3f3eb`

旧writer/reader/CLIは撤去済みで、resurrection detectorは`post_complete_enforce`かつfinding 0を要求する。
公開は本書§4の全oracle greenと最終tree scope照合後に限る。
