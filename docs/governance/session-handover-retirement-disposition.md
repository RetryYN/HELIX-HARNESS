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

## freeze条件

- 全live参照のtyped inventoryが未分類0である。
- CURRENT writer/read/route、`helix handover*`、session prose generatorが0である。
- fresh/brownfield setupとdistributionが旧path/task/commandを生成しない。
- process kill後にDB continuation projectionから再開でき、memory重複・矛盾・期限切れをfail-closeできる。
- provider/operations evidenceが監査可能なまま残り、session continuation sourceとして読まれない。
- L4↔system、L5↔integrationを含むVペアにabsenceとresurrectionのnegative oracleがある。

これらが揃うまでPLAN-REVERSE-344をR3/R4へ進めず、L7 runtime撤去も開始しない。
