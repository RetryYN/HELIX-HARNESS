---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-72-closure-evidence-materialization.md
---

# closure証跡materialization 機能設計

## 1. 目的と境界

`closure auto-approve`の評価器へ、caller自己申告ではない再現可能なproduction証跡を供給する。
対象集合はcurrent HEADの`closure review-bundle`が返す`close_ready`だけを正本とする。
各PLANのauthorityはversioned repo-owned registryとVペアから読み、runnerはauthorityを定義せず実行結果だけを記録する。

現状はterminal PLAN 637件のうち`verification_bindings`保有が11件であり、361件を一括実行可能とみなしては
ならない。最初に全候補を次へ分類する。

- `eligible`: strict authority、全binding、required gate、不変capabilityが揃う。
- `authority_backfill_required`: Vペア正本から機械的に一意復元できるがPLAN frontmatterへ未固定。
- `human_only`: typed不可逆capabilityまたは強制human PLAN。
- `invalid`: oracle/gate/pathの曖昧性、設計不在、複数候補などで一意に証明できない。

`authority_backfill_required`は、自動書込みせずPLAN単位のreview bundleを生成する。設計artifact、test-design row、
実test citationの三者が同一oracle IDで一意に結合でき、独立reviewを通った場合だけregistryへ固定する。
registry rowは`plan_id/source_path/source_digest/capabilities/bindings/gates/migration_reason`を持ち、unknown、重複、
PLAN bytes driftをlint hard-failする。registryに無いcandidateはdefault humanとし、review evidenceのcommand文字列だけから
oracleを発明しない。frontmatterへの段階backfillは可能だが、637件一括書換えを前提にしない。

## 2. 契約

> **L6 contract marker**: `materializeClosureEvidence(input) => ClosureEvidenceMaterializationResult`。
> pre: clean current HEAD、persistent harness.db、strict authority registry、review-bundle scopeを入力する。
> post: 全実行成功時だけDB/JSONL/run-record/manifestを同じrun identityでpublishする。
> invariant: `U-CMAT-001..012`、authority非推測、append-only、crash recovery、human境界を維持する。

### 2.1 preflight

- branchはcurrent `origin/main`と同一HEAD、working treeはclean、persistent DBを`--from-db`で開く。
- candidate集合はreview-bundleとexact set/orderで一致し、0件・重複・missing/excessを拒否する。
- PLAN pathはtracked canonical regular fileに限り、symlink、submodule、repository外pathを拒否する。
- strict registry authorityを持たないcandidateは実行せず、分類reportだけを返す。callerはcommand、oracle、
  capability、gateを追加・上書きできない。
- test commandはbindingごとに`bunx vitest run <single canonical test_path> --reporter=json`相当のtyped argvへ固定する。
  同じHEAD・argvは1回だけ実行し、JSON resultで対象oracleが実際にcollect・execute・passしたことを検査してから
  oracle別test caseへmany-to-many joinする。test caseはPLAN+oracleごとexactly-oneとする。
- required gate commandはPLAN記載値とCLI allowlistの双方へ一致させ、shell文字列を任意実行しない。

### 2.2 staging transaction（準備transaction）

- runner output、run record、manifestは`.helix/tmp/closure-materialization/<transaction-id>/`へ先に生成する。
- test/gate結果は一時DBへ記録し、persistent DBとJSONLを成功前に変更しない。
- 1件でもexit非0、timeout、signal、output欠落、digest不一致なら全candidateをpublishせず失敗reportを残す。
- run identityはcrypto random materialization ID、current HEAD、PLAN ID、oracle ID、kindを結合し、再実行で衝突しない。
- receipt fieldはspawnしたprocessのtyped argv、exit、signal、stdout/stderr artifactから内部生成し、caller入力を禁止する。
- `gate_runs`はmigrationで`session_id/command/exit_code/output_digest/materialization_id`を保持し、run record・artifact・
  attestationとexact joinする。runtime関数内のad-hoc `CREATE TABLE`をproduction schema authorityにしない。

### 2.3 publishとrecovery

- publish journalへbefore stateと全after digestをfsyncした後、persistent DB transaction、JSONL append、
  canonical run records、manifestの順に適用する。
- filesystemとSQLiteを単一atomic transactionとは主張しない。途中crashはjournalから再開またはbefore stateへ
  rollbackし、DB/JSONL exact set equalityが回復するまで次の実行を拒否する。
- JSONL append成功後にDB commitが失敗した場合も孤立eventを残さず、補償記録をhash-chain auditへ残す。
- `signature=event_digest`は外部署名と呼ばずlocal integrity hashとして扱う。production claimはOS process receipt、
  DB transaction、current HEAD、後段GitHub required-check receiptのANDであり、local hash単独では真正性を主張しない。
- manifestはpublish完了後に最後に生成し、TTLは最大1時間。partial transactionからmanifestを生成しない。

### 2.4 GitHub trust rootと実適用

materialization自体はclosure statusを書き換えない。`closure auto-approve --execute`は、materialization後の
current main HEADに対するrequired `harness-check=success` receiptを別途再取得し、latest completed attemptを
`completed_at/check_run_id`で一意選択する。既存の15分観測・24時間完了・app identity・branch protection・
write直前CASを満たす場合だけ許可する。

## 3. 規模と性能

- 361 candidateを最大100件のbounded windowで扱うが、runner commandは重複test pathをHEAD+command単位で共有する。
- concurrencyは既定1、明示上限4。DB/JSONL publishは単一writerとする。
- `closure_process_receipts`はHEAD+typed argvごとの物理processをexactly-oneで保持し、複数PLAN/oracleの
  論理runは`process_receipt_key`で1:N参照する。stdout/stderrは共有artifactとdigestを永続化し、
  logical run、attestation、artifactとのjoin不一致をapproval gateで拒否する。
- 全候補をメモリへ無制限保持せず、分類・実行・record生成をwindow単位で行う。

## 4. Vペア

`docs/test-design/harness/L8-unit-test-design.md`の`U-CMAT-001..012`をoracleとし、fixture repository、
fake runner、crash injection、persistent DB integrationで検証する。
