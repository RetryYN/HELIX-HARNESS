---
title: "GitHub原子的開発・CI・リファクタリング要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-23
updated: 2026-07-24
owner: PO / TL
pair_artifact: docs/test-design/helix/github-atomic-development-system-test-design.md
---

# GitHub原子的開発・CI・リファクタリング要件定義

## 1. 目的と適用境界

本書は新規実装と既存改修に共通する原子sliceを、TDDのbehavior contractとオブジェクト指向DDDの責務境界で定義する。
同じ原子単位をPR、CI、GitHub工程、`harness.db`の次タスクへ投影し、巨大PR、全PR full CI、根拠のないlegacy一括削除を拒否する。

## 2. 機能要件

### GH-FR-024 behavior-contract原子slice

1つの開発sliceは、exactly-one acceptance behavior、失敗するtestまたは代替oracle、最小実装、invariant-preserving refactor、
検証receipt、PRを持つ。exactly-one責務ownerはbounded context内のaggregate、domain service、value objectまたは
明示application boundaryとする。複数aggregate、独立にmerge可能なbehavior、無関係なlegacy ownerを同じPRへ混載しない。

新規実装はacceptance exampleからRed→Green→Refactorへ進み、既存改修はcharacterization oracleで現状を固定して同じloopへ合流する。
ファイル数や差分行数だけを原子性の根拠にしない。

### GH-FR-025 impact選択CIとfull回収

PR CIはsource HEADとbase HEADからversion管理されたimpact DAGを評価し、typecheck、変更behaviorのtargeted oracle、
critical gateだけを実行する。criticalはsecurity、permission、secret、schema、migration、rollback、authority、receipt/selector整合を含む。

PRで省略したtest/gate集合はdigest付きで記録し、main合流直後のfull regression・全doctor・全traceを一次回収とする。
nightlyはfull inventoryを再検証し、post-merge receipt欠落・失敗・driftだけを補完Recoveryへ送る。各省略itemは
最初のterminal recovery receiptへexactly-oneでlinkし、nightly再実行を二重回収として分母へ加算しない。
targeted greenをfull greenの代替にせず、unknown node/edge、selector変更、high-risk分類、依存cycleはPR時点でfull profileへfail-closeする。
post-merge fullがredなら通常mergeを停止し、同一HEADを起点とするRecoveryをactive frontierの先頭へ移す。
PR targeted/criticalは`GH-NFR-009`のp95 60秒、Full verificationは`GH-NFR-010`のp95 3分を予算とし、
source/base HEAD、runner、selected/skipped digest、各区間durationを保存する。予算超過は検査削減やtimeout延長で隠さず、
correctness判定と分離したPerformance Recoveryへ送る。

### GH-FR-026 契約先行mini-refactor

既存責務を縮退する場合は、1 legacy owner/pathずつ、characterization contract freeze、new/old dual-green、
consumer移行、consumer=0、rollback receipt、legacy削除の順で進める。削除前にpublic behavior、persistence semantics、
dependent oracleの不変を再検証する。契約追加とlegacy削除を同一sliceに混載せず、途中状態を可逆に保つ。

新behaviorやpublic contract変更を検出した場合はRefactorを停止し、Add-feature、Retrofit、RecoveryまたはReverseへrouteする。

### GH-FR-027 GitHub工程・次タスク同一frontier

各原子sliceのGitHub Issue、PLAN、branch、PR、CI profile、post-merge full schedule、工程表、DB `next_action`は、
同じsource HEAD、behavior contract ID、responsibility owner、dependency frontier、evidence stateから決定する。
次タスクextractorはprose順や人手選択をauthorityにせず、未充足dependencyと最新receiptからexactly-one ready actionを導出する。

GitHub表示、工程表、workflow schedule、DBが不一致の場合は自動上書きせずRecoveryへ遷移する。legacy削除taskは
characterization、dual-green、consumer=0、rollbackの先行evidenceが揃うまでreadyにしない。

### GH-FR-028 PR排他leaseとmemory handoff

作業中PRはrepo identity、PR number、base HEAD、current head HEADをkeyにexactly-one writer leaseを持つ。
reviewerはread-only leaseだけを取得し、writer lease保持中のbranch push、commit作成、remote ref更新を行わない。
leaseはruntime、session、worktree、operation ID、acquired/heartbeat/expires timestamp、許可actionを持ち、
push直前にremote HEADとlease tokenを再検証する。
takeover pollはactive entryがある間15分、active entryが無い間30〜60分とし、active leaseのheartbeatは15分、
TTLは45分を既定とする。pollで依頼を観測しただけでは実行を開始せず、同じPR・HEADのlease acquireに成功した
exactly-one runtimeだけがreview、remediationまたはmerge actionへ進む。webhook等のevent-driven通知を追加しても、
15分pollは取りこぼし回収経路として維持する。

harness memory takeoverは通知だけで所有権を移さず、writerのrelease eventとreviewerのacquire eventが同じHEADへ
連続して記録された場合だけreview handoffを成立させる。reviewでremediationが必要な場合、AI-Bはread-only leaseをreleaseし、
remediation writer leaseを取得してから編集する。元AI-Aは再handoffまで同PRへpushしない。
release/acquire transactionは、同じPRに残る旧HEAD、推測HEAD、旧writerのactive takeoverを同時にconsumeまたはsupersedeし、
active surfaceに相反するownerを残さない。複数active leaseが見えた場合は最新timestampを推測採用せず競合としてfail-closeする。

TTL切れ、process消失、stale worktreeは即時横取りせず、last remote HEAD、未push commit、dirty paths、
memory/DB eventを確認したstale-recovery receiptを要求する。lease競合、HEAD drift、別worktree write、
heartbeat欠落、releaseなしtakeoverを検出した場合はfail-closeし、Recoveryへrouteする。

## 3. 非機能要件

- `GH-NFR-015` Atomicity: 1 sliceはexactly-one behavior contractと責務ownerを持ち、独立merge可能な変更を混載しない。
- `GH-NFR-016` CI completeness: targeted選択は省略集合digestとfull回収receiptを持ち、coverage相殺やsilent skipを許可しない。
- `GH-NFR-017` Reversibility: mini-refactor各stepはrollback可能で、legacy削除前にconsumer=0と復旧receiptを要求する。
- `GH-NFR-018` Concurrency safety: PR writerはexactly-oneとし、lease・HEAD・worktree・sessionを再検証できないwriteを拒否する。active takeoverは15分以内に再観測し、15分heartbeatを3回失った45分TTL後もstale-recoveryなしに横取りしない。

## 4. 受入条件

| AC | 合格条件 |
|---|---|
| GH-AC-035 | 新規・改修fixtureがexactly-one behavior contractとDDD責務ownerへ束縛され、複数aggregate・独立behavior・無関係legacy ownerの混載を拒否する |
| GH-AC-036 | PR impact profileがtargeted/critical/fullを決定し、省略集合をpost-mergeで一次回収、nightlyで欠落補完し、各itemを最初のterminal receiptへexactly-one linkして、unknown・high-risk・selector変更をfullへfail-closeする |
| GH-AC-037 | legacy削除taskがcharacterization、dual-green、consumer移行、consumer=0、rollback receiptの順序欠落でblockされる |
| GH-AC-038 | GitHub、PLAN工程、workflow schedule、DB next actionが同一HEAD・contract・owner・dependency frontierへ収束し、不一致時はRecoveryになる |
| GH-AC-039 | 2 AIの同時write、read-only reviewerのpush、観測だけでの作業開始、stale lease横取り、旧HEAD token、相反するactive takeoverを拒否し、15分poll/heartbeat・45分TTLを守り、旧leaseをatomicにconsume/supersedeしたrelease/acquire済み同一HEAD handoffだけを受理する |

## 5. freeze境界

本書はL3契約だけを定義する。impact selector、CI workflow、task extractor、DB schema、legacy移行・削除はL4以降へ降下し、
本書の存在だけでPR高速化、refactor完了またはfull verification実行済みを主張しない。
