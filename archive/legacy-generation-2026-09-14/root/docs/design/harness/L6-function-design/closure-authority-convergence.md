---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/closure-authority-convergence.md
plan: docs/plans/PLAN-L6-77-closure-authority-convergence.md
---

# closure authority production orchestration差分設計

## 目的

本設計は新しいauthority writerを定義しない。PLAN-L6-73のreview receipt検証・atomic apply・rollback・
最大100件window・cycle ledger・resumeと、PLAN-L6-74のcurrent-main proposal loaderをそのまま再利用し、
それらをproduction CLIで接続するapplication orchestration差分だけを定義する。

## 契約

> **L6 contract marker**: `runClosureAuthorityProductionOrchestration(input) => ClosureAuthorityProductionRun`。
> pre: clean current main、persistent DB、current HEADへ束縛されたproposal artifactと独立review receipt。
> post: 既存L6-73 writerとL6-74 loaderをexact state machineで接続し、全候補の終端分類を保存する。
> invariant: U-CAC-001〜U-CAC-021、authority非推測、不可逆capability非昇格、candidate保存則、既存writer単一正本。

## 本番状態機械

1. `closure authority-backfill --dry-run --from-db --expected-head <sha> --out <new-path>`が
   `closure-authority-backfill-run.v1`をcanonical relative pathへatomic保存する。
2. `closure authority-review-draft --proposal <path> --out <new-path>`は非承認draftとreview task identityを生成する。
   独立runtime/subagentがreview taskを完了後、`closure authority-review-record --draft <path>
   --review-evidence <task-completion-artifact> --out <new-path>`だけが既存
   `closure-authority-backfill-review.v1` receiptをatomic生成する。task completion artifactはreviewer/workerの
   異identity、review kind、verdict、終了時刻、reviewed HEAD/scope/proposal/registry digestをstrict schemaで保持する。
   self-approval、期限切れ、symlink/既存/absolute/outside-repo path、digest driftをexit 2で拒否し、内部errorはexit 1、
   成功は単一JSON stdoutとexit 0にする。CLIがreviewなしにapprove文字列を自己生成してはならない。
3. registry適用CLIの`closure authority-backfill-apply --execute --from-db --proposal <path> --review-receipt <path>
   --offset <n> --limit <1..100>`は既存L6-73 writerだけを呼ぶ。dry-run/execute排他、HEAD/origin-main/
   registry CAS、canonical non-symlink new artifactを必須とし、exit 0/1/2を既存CLI規律へ合わせる。
4. apply後にL6-74 loaderで全件re-censusする。commit前failureはledger非追記、registry commit後のledger追記失敗は
   registry generationから同digest eventを再生成し、補償は削除でなくappend-only failure eventとする。
5. `needs_design / needs_test_citation / needs_gate_authority`はreason別にForward backlogへ変換し、設計・L8・testを
   merge後に再censusする。根拠の無い一括authority注入は禁止する。
6. registry収束後に既存authority-materializeとauto-approveをwindow単位で実行する。各child runのstdout JSONは
   orchestration ledgerがdigest参照し、auto-approve自身への`--out`追加はPLAN-L6-71 deltaで別途扱う。

## Git/CIを含む二epoch契約

tracked governance sourceであるregistryを変更したdirty worktreeのままmaterializeへ進んではならない。状態機械を
次の二epochへ分割し、epoch間ではPR merge後の新しいcurrent mainだけを次epochのauthorityとする。

1. authority epochはproposal/review/window applyを完遂し、registryとhash-chain evidenceをcommit/PR/CI mergeする。
2. closure epochは新HEADでDBをrebuildし、旧HEADのproposal・receipt・manifestを再利用せず全件re-censusする。
3. authority epochのH/Xはtracked正本`docs/governance/closure-terminal-boundaries.jsonl`の
   `closure-terminal-boundary-ledger.v1`へappend-only保存し、registryと同じPRでmergeする。各eventは
   authority HEAD、初期集合digest、cycle digest、PLAN ID、分類`human_only | invalid_escalated`、理由、owner、
   next decision route、`automation_terminal=true`、`whole_program_blocker=true`を持つ。Xはowner/route必須、Hも
   human decision route必須とし、previous digest chainで改変・欠落・別authority HEAD replayを拒否する。
4. closure epochではtracked ledger blobを唯一のrebuild sourceとし、authority HEADがcurrent HEADの祖先、registry
   generationがeventへ一致することを検証する。persistent DB table `closure_terminal_boundaries`は
   主キー`boundary_key`、authority HEAD、source blob digest、PLAN ID、分類、理由、owner、次判断route、
   automation終端、全体blocker、opened event digest、resolved event digest、resolution authority digest、
   直前event digest、event digestを持つ。
   rebuildはfile全件から置換投影し、runtime upsert/API直接追加は禁止、duplicate key/digest conflictはfail-closeする。
   eventは`boundary_opened | boundary_resolved`を持ち、current projectionはplan IDごとにdigest chain上の最新eventをfoldする。
   `boundary_resolved`は直前open event digestを`supersedes_event_digest`へexact joinする。Hの解消は既存action-binding
   approval receiptのcanonical tracked path/blob digest、decision ID、PLAN ID、approved scope、authority digestへ束縛し、Xの解消は
   merge済みconfirmed design/testのblob digest、merge HEAD、tracked strict re-census artifact、現行canonical classifierの
   `eligible`結果、re-census classification digestへ束縛する。根拠の無いresolved自己申告、
   別PLAN receipt、receipt blob drift、Vペアdigest drift、open前resolve、二重resolveを拒否する。
5. current-locationはH/Xをautomation terminal countへ残してautomatable close_ready/recovery machineから除外するが、
   `whole_program_blocker=true`としてobjective G-10、completion-decision、L14 claimを必ずblockする。human decisionや
   invalid escalationが未解決のまま全体完成へ昇格させない。PLAN ID hardcodeやqueueからの黙示削除は禁止する。
6. authority epoch集合`I_authority=E⊎N⊎H⊎X`とclosure epoch集合`I_closure=E'⊎N'⊎H'⊎X'`を別digestで保存する。
   epoch間の追加PLANはtyped `added_plan_ids`として再censusへ取り込み、削除・既存IDのsource digest変更は旧proposalを
   stale化してauthority epochへ戻す。共通`buildClosureConvergenceTargetSet`は`N'=0`をpreconditionとし、
   `I_closure = automatable ⊎ H' ⊎ X'`をexactly-once検証する。Nが残ればmaterialize/auto-approveを呼ばない。
7. 共通target setだけがmaterializeとauto-approveへ同じautomatable exact set、initial-set digest、
   terminal-boundary digestを渡す。DB-only boundary、ledgerに無い除外、AUTO/H/X重複・欠落を拒否する。
8. automatable setだけをauthority-materializeし、既存PLAN-L6-71のGitHub adapter、receipt schema、branch-protection
   検証、15分TTL、write直前refetch CASをそのまま呼んでauto-approveをdry-run→executeする。本deltaは
   cross-epoch HEAD mismatchとtarget-set digest joinだけを追加し、新しいreceipt producerを作らない。
9. accepted PLAN変更をcommit/PR/CI mergeし、新HEADで再度DB rebuildする。finalizeはrepo/DB/PLAN bytesから
   `I_closure=A⊎H'⊎X'`と`N'=E'=remaining_automatable_close_ready=0`を導出し、caller自己申告のaccepted集合を受け取らない。
   epoch relationは削除を許さず`I_closure = I_authority ⊎ added_plan_ids`とし、既存ID削除/source変更はstaleとしてrejectする。
   H/Xが1件でも残ればautomation laneは終端可能だがL14/whole-program completion claimは拒否する。
10. H/X PLAN bytesはpath、blob digestとも全epochで不変とし、authority/closure HEAD遷移、registry generation、materialization manifest、
   GitHub receipt digest、auto-approve transaction、final partitionを`closure-convergence-run.v1`へ固定する。
11. local ledger/manifest/PLAN publishはjournalとCASでexactly-once化する。commit/push/PR/CI/mergeはexactly-onceを
   主張せず、`repository + authority_head + phase + artifact_digest`をidempotency keyとするat-least-once operationと、
   remote ref/PR/merge/check状態のreconcileで再開する。merge済み、CI pending、branch削除後もremote stateから次phaseを導出する。

external GitHubが取得不能ならclosure epochはdry-runまでで停止する。receiptやhuman approvalをCLIが生成してはならない。

## 保存則と停止条件

- authority epochの初期ID集合`I_authority`を固定し、各cycleのcurrent partitionを
  `P = E(eligible) ⊎ N(needs_*) ⊎ H(human_only) ⊎ X(invalid_escalated)`としてdisjointに保つ。
  未終端はE/N、terminal decision routeはH/Xである。registry applyはEをauthority-materialize可能にするだけでacceptedとは数えない。
- authority epochは`I_authority=E⊎N⊎H⊎X`、closure epochの最終保存則は
  `I_closure=A(accepted)⊎H'(human_only)⊎X'(invalid_escalated)`。停止条件は
  `N'=0 && E'=0 && remaining_automatable_close_ready=0`であり、H/Xはautomatable残数から除外する。
  accepted後のIDだけを次TTL suffixから除外する。
- PLAN-L7-146 / PLAN-M-02 / external publish / charter P8はHへ残す。Xはtyped terminal escalationとして
  reason/owner/next decision routeを必須にする。H/Xはautomation laneの残数からだけ除外し、open boundaryが残る限り
  objective G-10、completion-decision、L14/whole-program blockerには必ず残す。
- 361→363の増加はPLAN-L7-431/432等の新規terminal PLAN流入としてcycle ledgerへ記録する。
- TTL更新は前cycleのcommitted plan IDsを除いたsuffix、registry generation、window scope digestへ束縛し、
  GitHub required-check receiptを再取得する。正常な候補縮小をexact-set driftと誤判定しない。

## 非目標

- verification binding、gate、capabilityをgreen commandやproseから推測しない。
- 363件を単一transaction・単一TTLで一括処理しない。
- human/action-binding approvalを自動生成しない。

## governance backprop成果物

- HVM-COMP-03 adoption matrixへ「機械evidence条件付き自走」とhuman-only/invalid-escalated境界のcorrection noteを追加する。
- PLAN-L7-433〜436を再利用component、PLAN-L7-439をorchestration successorとして明示する。
- 361→363変動理由、各cycleの集合保存則、production rehearsalをrepo-owned evidence artifactへ固定する。
- L7降下時は`src/state-db/current-location.ts`、unit test、production E2E、cycle ledger/rehearsal artifact、
  governance correction docを`generates`へ必須登録する。
