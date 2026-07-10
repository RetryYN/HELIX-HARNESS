---
layer: L6
sub_doc: function-spec
status: confirmed
freeze_blocking: true
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-61-handover-retirement.md
---

> **L6 contract marker**: session/prose handover、`CURRENT.json`、`helix handover`は廃止済みであり、
> DB+memory continuationへ置換する。retirementはtyped inventory未分類0、受け皿green、crash-safe journal、
> backup/reconcile、resurrection detectorを満たす場合だけ進める。provider delegation evidenceと
> operations transitionは別型として保持する。

# session handover retirement — 機能設計

PLAN-REVERSE-344のR3 fullbackと独立TLレビューが完了したため、本書をL6 retirement正本としてfreezeする。
ただし設計freezeはruntime撤去完了を意味しない。U-HRET-002..014とIT-CONT/ST-ARCHのL7 test_code、
runtime撤去、resurrection detectorがgreenになるまで`retirement-ready=false`を維持する。

## §1 廃止対象と保持対象

| kind | 意味 | disposition |
|---|---|---|
| `session_prose` | session間next actionの手書き転記、CURRENT pointer、旧CLI/hook | `replace`。DB status + takeover memory + session logへ移管 |
| `provider_evidence` | Codex/Claude委譲の機械evidence | `preserve`。session handoverと呼ばずaudit evidenceとして型付け |
| `operations_transition` | 開発から運用への移管成果物 | `preserve`。運用設計artifactとして保持 |
| `legacy_archive` | 過去session handover/readiness証跡 | `archive`。runtime read source禁止 |
| `compatibility_only` | rollback window中のread-only decoder | `compatibility-only`。writer/生成器禁止、期限と除去条件必須 |

`provider_evidence` / `operations_transition`のpreserveは存在確認だけで終えない。retirement直前・直後の
count、原本SHA-256、provenance、schema validation結果、query/export可用性、retention metadataを
preserve manifestへ記録し、全項目一致をphase exit条件にする。同名artifactをcontinuation sourceへjoinしない。

文字列`handover`の一律禁止は行わない。runtime import/CLI route/hook/CURRENT read-write/session prose生成を
禁止対象とし、provider/operations/archiveはtyped allowlistで区別する。source manifestは明示したrepository source root内の参照を
path、symbol、kind、disposition、replacement、owner、removal checkpointへ分類し、未分類をhard failにする。

対象inventoryは少なくともCLI、`src/handover/`、Stop/SessionStart hook、doctor、lint、plan complete、status/
完了判断packet、agent session command center、runtime capability matrix、setup/template、VSCode task、CI、
distribution、L0-L14 docs/test-design/tests、CURRENT/provider pathsを含む。

## §2 継続状態への責務移管

| 旧責務 | 新しい正本 |
|---|---|
| active PLAN / blocker / next authority / git基準点 | harness.db + `helix status` / completion packet |
| sessionで残す判断・制約・次action | memory v2 `takeover` layer（provenance/TTL/link必須） |
| 実行事実とPLAN digest | session JSONL + plan digest + harness.db projection |
| feedbackと要対応事項 | feedback lifecycle journal + harness.db + SessionStart surface |
| cross-runtime bounded recall | Claude/Codex共通memory surface |

memoryはDB stateを複製せず、矛盾時はDBを優先する。旧CURRENTのtakeover noteは
`operationId=handover-retirement:<source-digest>`、origin=`legacy-current-note`、source digest link、7日以内TTLで
最大1件移管する。secret/PII、不正note、期限不明は移管せずdiagnosticとmanual remediationへ送る。

## §3 takeover delivery契約

deliveryはstdoutとconsumeをatomicにできないため**at-least-once**である。one-shot/exactly-onceと主張しない。
`entryId`はmemory entryのimmutable UUID、`consumerId`はadapter/runtime instanceのstable IDとし、各deliveryは
`deliveryId=<entryId>:<consumerId>`とpayload digestを持つ。receiptはharness.dbのdelivery receipt projectionと
append-only memory delivery eventへdurable記録し、`pending -> delivered -> acknowledged|expired`だけを許可する。
同deliveryId・同digestはdedupeし、同ID異digestはconflictとしてfail-closeする。DB消失時はdelivery eventから
receiptを再構築する。ack/expired receiptのretentionは元entryのretention以上とする。
stdout成功後・consume前crashは再配信し得る。並行consumerも同じentryを受け得るため、機密性や排他制御を
deliveryに依存させない。将来claim/leaseを導入する場合は別設計とする。

## §4 retirement journalと状態機械

```ts
type RetirementPhase =
  | "prerequisite"
  | "shadow_read"
  | "memory_primary"
  | "legacy_write_disabled"
  | "cleanup"
  | "complete"
  | "rolled_back";
```

`.helix/audit/session-handover-retirement.jsonl`をmigration journalとし、`runId/operationId/intentDigest/phase/status/error/
checkpoint/backupDigest/inventoryDigest/sourceCount/targetCount/sourceDigest/targetDigest/occurredAt`をappend-onlyで
保持する。`intentDigest`は対象root、inventory digest、target phase、writer policyをcanonical JSON化したSHA-256とする。
同operation+同intentはreplay、同operation+異intentは拒否する。statusは`started|completed|failed`、checkpointは
直前completed phaseとそのartifact digest集合である。許可edgeは表の上から隣接phaseへの前進と、
`prerequisite|shadow_read|memory_primary`から`rolled_back`だけとし、skip・逆行・complete後遷移を拒否する。

| phase | entry条件 | writer / reader | exit検証 |
|---|---|---|---|
| prerequisite | Reverse-344完了、memory/lifecycle/cross-runtime green | 旧writer/readは変更しない | dependency evidence digest一致 |
| shadow_read | backupとinventory manifest作成済み | 旧readと新readを比較、旧writer凍結 | 件数/hash/意味diff 0 |
| memory_primary | takeover note移管・reconcile済み | 新readのみ、旧decoderはrollback専用 | Claude/Codex両surface成功 |
| legacy_write_disabled | old CLI/hook/generator無効 | CURRENT再生成をhard fail | setup/plan complete/Stop非生成 |
| cleanup | live consumer 0、rollback packet有効 | runtime import/path削除 | residual detector 0 |
| complete | 全gate green | provider/operations evidenceのみ保持 | distribution/fresh/brownfield green |
| rolled_back | `legacy_write_disabled`到達前の失敗 | backupとcheckpointから旧readを一時復元 | restore digest一致、incident記録 |

`complete`後はsession handover writerをrollbackで復活させない。rollbackは`legacy_write_disabled`以前だけに限定し、
complete後の問題はDB+memory側のforward fixで扱う。

## §5 backup、reconcile、crash再開

- mutation前に対象fileのmanifest、件数、SHA-256、権限、git tracking状態をbackup packetへ保存する。
- copy/archive後はtarget件数とper-file digestを比較し、一致前にsourceを削除しない。
- crash時はjournalの最後のcompleted checkpointから再開し、完了operationを再実行しない。
- append成功/phase commit不明はartifactとjournalを再読して回収する。推測で次phaseへ進まない。
- CURRENTが存在しない状態を正常とし、complete後にCURRENT/writer/routeが再出現したらresurrection detectorが
  hard failする。

## §6 runtime surface置換

- `helix handover` / `handover status`は削除し、未知commandとして非0終了する。aliasやsilent fallbackを残さない。
- `helix status`はactive PLAN、blocker、next authority、feedback、continuation memory pointerを構造化表示する。
- Stopはsession digestとpromotion nudgeだけを扱い、CURRENT/session proseを生成しない。
- `plan complete`はR3 HC-P1 contractに従い、event evidenceを先にdurable appendし、event ID/payload hashで
  SQLiteへ冪等投影した後だけcheckpointを公開してcurrent-planをclearする。JSONLとSQLiteを同一transactionと
  見なさない。append失敗は非公開、append後/projection前はreplay、projection後/memory前はDBを正として
  breadcrumbを再生成し、同sequence異payloadはfail-closeする。handover生成を処理へ混ぜない。
- doctorはhandover stalenessではなくcontinuation DB/memory health、resurrection、unclassified residualを検査する。
- setup/fresh/brownfield/distribution/VSCode/CIは旧path/task/commandを生成しない。

## §7 文書・adapter・archive

CLAUDE.md / .claude/CLAUDE.md / AGENTS.md / setup managed block / rule-drift markerは同一manifestから同期する。
部分更新、old/new command併存、version skewをfail-closeする。旧session prose docsはdigest manifest付きarchiveへ
移しruntime read sourceから外す。readiness/verification/provider/operations evidenceを名称一致だけで移動しない。

## §8 Vペアシナリオ

| Scenario | 検証oracle |
|---|---|
| HRET-S1 | 全handover参照をtyped dispositionし未分類0 |
| HRET-S2 | prerequisite未達のphase遷移を拒否 |
| HRET-S3 | CURRENT noteをprovenance/TTL/operationId付きで最大1件移管 |
| HRET-S4 | crash/retryをjournal checkpointから再開しduplicate mutation 0 |
| HRET-S5 | at-least-once deliveryとstable deliveryIdで並行/再配信を明示 |
| HRET-S6 | statusが旧pointerの必要な機械情報を意味的に包含 |
| HRET-S7 | Stop/plan complete/doctorが旧snapshotを生成・参照しない |
| HRET-S8 | provider/operations evidenceをsession型と分離し、retirement前後のcount・原本digest・provenance・schema validation・query/export可用性・retention metadataを無損失保持 |
| HRET-S9 | archive manifest件数/digest一致、誤分類artifact移動0 |
| HRET-S10 | backup/reconcile/rollbackがcheckpointとdigestを復元 |
| HRET-S11 | adapter/setup/template/CI/distributionが同一manifestへ同期 |
| HRET-S12 | complete後のCLI/path/writer/CURRENT復活をhard fail |
| HRET-S13 | fresh/brownfield consumerが旧surfaceなしでcontinuation可能 |
| HRET-S14 | provider/operations/archive allowlist以外のlive residual 0 |
