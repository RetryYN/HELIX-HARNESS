# session handover 廃止の型付き処分表

## 目的

PO決定「ハンドオーバーは廃止した」に従い、session間のprose転記、`CURRENT.json`、
`helix handover`を廃止する。一方で同じ語を使っていたprovider委譲証跡、運用移管成果物、歴史資料を
誤削除しないため、本書をPLAN-REVERSE-344 R1の分類正本とする。

## 型と処分

| kind | 判定規則 | disposition | runtime continuation source |
|---|---|---|---|
| `session_prose` | session間next action、CURRENT pointer、旧CLI/hook、stale判定、Handover aggregate/module/UI | `replace` | 禁止 |
| `provider_evidence` | Codex/Claude等のruntime invocation、review provenance、provider packet | `preserve` | 禁止 |
| `operations_transition` | 開発から運用への移管、release/readiness/export artifact | `preserve` | 禁止 |
| `legacy_archive` | 過去PLAN、監査、成立経緯、旧session記録 | `archive` | 禁止 |
| `compatibility_only` | complete前rollback専用decoder | 期限・owner・除去checkpoint必須、writer禁止 | 通常時禁止 |

文字列`handover`の一括削除は禁止する。各live参照は`path`、`symbol`、`kind`、`owner`、`replacement`、
`removal_checkpoint`を持つinventoryへ分類し、未分類をhard failにする。

## 継続状態 source の優先順位

1. authored PLAN・設計・成果物を契約正本とする。
2. `harness.db`のworkflow/feedback projectionを進捗、active PLAN、blocker、next authorityの機械正本とする。
3. session JSONLを実行provenanceとして扱う。
4. fenced memoryは判断・制約・次actionのbounded recallとし、DBやauthored sourceを上書きしない。
5. DBとmemoryが矛盾した場合はDBを優先し、diagnosticを生成する。

terminal遷移は同一`operation_id`でDB projection、feedback lifecycle、必要なmemory breadcrumbを確定し、
冪等性、fence、crash recoveryを保証する。独立したprose continuation fileは新設しない。

## R1 inventory境界

| surface | `session_prose`の現役残存 | replacement / preserve境界 |
|---|---|---|
| concept / requirements | handover aggregate、3層原則、CURRENT/CLI契約 | authored sources + DB projection + fenced memory |
| HELIX L1/L3-L5 | HBR/HR/HACとhandover flow | atomic continuation checkpointとsource precedence |
| harness L4 | aggregate、session module、HandoverPanel | 継続状態の読みモデル / ContinuationPanel |
| harness L5 | CURRENT schema、`src/handover` module | 既存DB/memory/session-log/feedbackのjoin |
| verification design | CURRENT/stale/proseを期待するoracle | absence/resurrection、crash replay、DB優先の正負oracle |
| provider adapter | provider packet/path | `provider_evidence`として保持 |
| release/operations docs | 運用移管artifact | `operations_transition`として保持 |
| archive | 旧PLAN/判断履歴 | `legacy_archive`として保持、runtime read禁止 |

## R1 現役surface manifest

本表は retirement 対象を文字列一致ではなく、実行責務と所有者で分類する。`path` は exact path または
明示 glob、`symbol / matcher` は当該 path 内で分類対象になる live symbol を示す。新しい参照がどの行にも
一致しない場合は `unclassified` とし、R2/R3へ進めない。

| path | symbol / matcher | kind | owner | replacement / preserve境界 | removal checkpoint |
|---|---|---|---|---|---|
| `src/cli.ts` | session `handover` / `handover status` route、`runHandover` 呼出し | `session_prose` | CLI/runtime | `status`、completion packet、memory、feedbackのread surfaceへ置換 | `legacy_write_disabled` |
| `src/handover/**` | `runHandover`、pointer/scaffold/consume/stale/bypass/derivation API | `session_prose` | state/runtime | moduleを撤去し、session-log + state-db + memory + feedbackへ責務移管 | `cleanup` |
| `src/doctor/index.ts` | `checkHandover*`、CURRENT freshness/discipline/bypass/derived drift | `session_prose` | doctor | continuation health、DB precedence、resurrection、unclassified residual検査へ置換 | `legacy_write_disabled` |
| `src/runtime/session-log.ts`、Stop/SessionStart配線 | CURRENT/prose snapshot再生成または読取 | `session_prose` | runtime | append-only event、冪等DB projection、bounded recallのみを使う | `legacy_write_disabled` |
| `src/setup/**`、`docs/templates/**`、`.claude/**`、`.codex/**` | session handover path/command/task/managed marker生成 | `session_prose` | distribution/adapter | memory/evidence/feedback/teams baselineへ置換。旧path/commandを生成しない | `cleanup` |
| `AGENTS.md`、`CLAUDE.md`、`.claude/CLAUDE.md` | session開始・停止・Adapter Rule Markerの`helix handover`案内 | `session_prose` | governance/adapter | status + DB + memory continuation規約へatomic同期 | `legacy_write_disabled` |
| `.helix/handover/CURRENT.json` | current pointer、takeover note、derived snapshot | `session_prose` | local runtime state | machine stateはDB直読、noteはprovenance/TTL付きtakeover memoryへ最大1件移管 | `memory_primary` |
| `docs/handover/session-handover-*.md` | session next action/carry/prose snapshot | `legacy_archive` | governance archive | digest manifest付きarchive。runtime read source禁止 | `cleanup` |
| `src/runtime/provider-handover.ts`、`.helix/handover/provider/*.json` | `runProviderHandover`、provider invocation/review packet | `provider_evidence` | runtime audit | 監査証跡として保持し、progress/next action/bounded recallへjoinしない | `complete` |
| `docs/design/**/L11-*`、`docs/design/**/L14-*` | 開発→受入/運用移管のartifact | `operations_transition` | operations governance | 運用設計artifactとして保持し、session continuationと型を共有しない | `complete` |
| `docs/design/harness/L6-function-design/handover-mechanism.md`、`handover-db-derivation.md` | 旧writer/pointer/DB-derived snapshot契約 | `compatibility_only` | design archive | retirement prerequisiteの比較oracleのみ。writer復活根拠にしない | `cleanup` |
| `tests/handover*.test.ts`、`tests/handover-db-derivation.test.ts` | 旧CURRENT writer/reader/stale/derivationのgreen期待 | `compatibility_only` | QA | U-HRET/IT-CONTのabsence・resurrection・preserve試験へ置換 | `cleanup` |
| confirmed L0-L5 design / L3-L9 test-design | session handover/CURRENTを現役正本またはgreen期待にする記述 | `session_prose` | design/verification | Reverse-344 R3変更波でcontinuation契約と対向oracleへatomic置換 | `R3` |
| `docs/archive/**`、過去PLAN/audit/review evidence | 成立経緯としてのhandover記述 | `legacy_archive` | archive | 変更せず保持。runtime/doctorのlive sourceから除外 | `complete` |

### R1 検証状態

- 2026-07-11時点の既知live surface classは上記14行へ分類した。
- path/symbol単位の自動scanと`unclassified=0`証跡は未完了である。この証跡が無い間、
  PLAN-REVERSE-344は`workflow_phase=R1` / `status=draft`を維持する。
- R1 scannerはprovider/operations/archiveの許可を文字列`handover`だけで判定せず、path + symbol + kindの
  組合せで分類し、同一symbolの矛盾分類もhard failにする。

## freeze条件

- 全live参照のtyped inventoryが未分類0である。
- CURRENT writer/read/route、`helix handover*`、session prose generatorが0である。
- fresh/brownfield setupとdistributionが旧path/task/commandを生成しない。
- process kill後にDB continuation projectionから再開でき、memory重複・矛盾・期限切れをfail-closeできる。
- provider/operations evidenceが監査可能なまま残り、session continuation sourceとして読まれない。
- L4↔system、L5↔integrationを含むVペアにabsenceとresurrectionのnegative oracleがある。

これらが揃うまでPLAN-REVERSE-344をR3/R4へ進めず、L7 runtime撤去も開始しない。
