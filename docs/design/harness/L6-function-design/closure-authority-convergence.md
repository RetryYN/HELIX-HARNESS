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
> invariant: U-CAC-001〜U-CAC-012、authority非推測、不可逆capability非昇格、candidate保存則、既存writer単一正本。

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

## 保存則と停止条件

- 初期ID集合`I0`を固定し、各cycleのcurrent partitionを
  `P = E(eligible) ⊎ N(needs_*) ⊎ H(human_only) ⊎ X(invalid_escalated)`としてdisjointに保つ。
  未終端はE/N、terminal decision routeはH/Xである。registry applyはEをauthority-materialize可能にするだけでacceptedとは数えない。
- 最終保存則は`I0 = A(accepted) ⊎ H(human_only) ⊎ X(invalid_escalated)`。停止条件は
  `N=0 && E=0 && remaining_automatable_close_ready=0`であり、H/Xはautomatable残数から除外する。
  accepted後のIDだけを次TTL suffixから除外する。
- PLAN-L7-146 / PLAN-M-02 / external publish / charter P8はHへ残す。Xはtyped terminal escalationとして
  reason/owner/next decision routeを必須にし、H/XをL14矛盾として数えないcurrent-location read-model deltaを定義する。
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
