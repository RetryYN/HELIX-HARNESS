---
feature_ticket_id: FT-OS-GITHUBSYNC-001
title: "HELIX-OS GitHub一方向projection・read-after同期adapter"
product_target: HELIX-OS
primary_role: progression
state: proposed_upstream_waiting
priority_order: 9
created: 2026-09-15
authority_effect: work_projection_only
github_projection:
  issue: 1812
  url: https://github.com/RetryYN/HELIX-HARNESS/issues/1812
  projection_receipt_ref: docs/governance/audits/source-rebaseline/github-feature-ticket-projection-2026-09-15.md
  read_after_state: OPEN
parent_requirements:
  - HELIXOS-L2-001
  - HELIXOS-L2-002
  - HELIXOS-L2-007
  - HELIXOS-L2-010
acceptance_source: docs/helix-os/L11-acceptance/governance-acceptance.md
depends_on:
  - FT-OS-REQREG-001
  - FT-HARNESS-TICKETCONTRACT-001
  - FT-OS-TICKETISSUER-001
---

# FT-OS-GITHUBSYNC-001: HELIX-OS GitHub一方向projection・read-after同期adapter

## 目的

ローカルのConcept、企画、要求、Feature Ticket、workflow、decision、evidenceを正本のまま保持し、必要な作業・review・証拠だけをGitHub Issue／PR／label／commentへ自動投影する。remote状態を追いかけて要求意味を推定せず、ローカルrevisionからGitHub projectionを再生成できるようにする。

## 責務

同期adapterは次を行う。

- 管理層が登録したlocal identity、対象revision、projection payload、semantic digest、許可scopeを入力にする。
- 推進が発行したticketとworkflowから、許可されたIssue／PR／label／comment操作をexactly onceのcommandへする。
- create／updateをidempotency keyで再送可能にし、remote IDをlocal identityへ関連付ける。
- write後にremote本文、state、label、comment、target HEADをread-afterし、期待digestとの差分を記録する。
- GitHub webhook／取得結果をremote evidence eventとして#1798の原登録入口へ戻す。
- remote delivery identity、remote revision、originating command IDを用いて、自己投影のread-after／webhookを同じ変更の証拠へ束縛し、新しい送信commandへ戻すecho loopを防ぐ。
- remote drift、競合、rate limit、認証失効、部分成功、timeoutを区別し、再開点と補償操作を記録する。

## authority境界

- 同期方向はlocal authorityからGitHub projectionへの一方向とする。
- remote comment、review、check、手編集は証拠または要求候補であり、要求・ticket・decisionを直接上書きしない。
- 自己投影に対するwebhookやread-afterはreceiptまたはduplicate eventとして登録し、同じpayloadを再投影しない。外部変更もlocalで新revisionとして採否されるまで送信commandを生成しない。
- Issue close、PR merge、label変更、check greenから要求採用、実装完了、受入、公開を生成しない。
- GitHub Issue番号をlocal ticket ID、要求ID、causal IDにしない。
- 未登録local source、stale revision、digest不一致、wrong product、許可外repository／operationは投影しない。
- secret、credential、許可外PII、生会話本文、別project dataをprojection payloadへ含めない。

## 自己参照しないrevision束縛

local ticket本文内へ、その本文を含むGit commit SHAを意味digestとして埋め込まない。`projection_payload_digest`はGitHub metadata、remote ID、read-after時点を除外した正規化payloadから計算する。実行時のsource commit、remote revision、read-after digestは別のappend-only projection receiptへ記録する。

```yaml
projection_command:
  command_id: stable-id
  causal_id: stable-id
  origin_event_id: stable-id
  local_identity: stable-local-id
  local_source_revision: exact-git-commit
  projection_payload_digest: sha256
  repository: exact-owner-and-name
  operation: issue_create | issue_update | pr_create | pr_update | label_sync | comment_append
  expected_remote_revision: exact-or-null
  idempotency_key: stable-key
  permission_scope: exact-scope

projection_receipt:
  command_id: stable-id
  remote_event_or_delivery_id: exact-id-or-null
  originating_command_id: exact-id-or-null
  remote_identity: exact-id
  remote_revision_before: exact-or-null
  remote_revision_after: exact
  expected_payload_digest: sha256
  read_after_payload_digest: sha256
  result: applied | duplicate | drift | conflict | rejected | partial | retryable_failure
  unresolved_fields: []
  compensation_or_resume: exact-action-or-null
```

fieldと永続化schemaはL3で確定する。GitHub API、App、token種別は要求承認後の外部作用設計で選定する。

## 降下順序

1. #1798で原eventと要求候補を管理登録できるようにする。
2. #1804でHARNESS ticket contract、#1805でlocal ticket／workflow生成を成立させる。
3. L3でprojection command、receipt、idempotency、CAS、redaction、permission、rate limit、再開・補償を設計する。
4. L10で重複配送、自己投影echo、外部変更の無断逆流、remote drift、wrong repository、stale source、部分成功、timeout、権限失効を検証する。
5. 新世代CIとは別の外部projection adapterとして起動し、CI結果もremote evidence eventとしてのみ扱う。

## 停止条件

- 親Concept／L1／L2、対象local revision、semantic digest、許可scopeのいずれかが未確定。
- remote操作が要求採用、実装許可、merge判断、Issue close判断を暗黙生成する。
- read-after、idempotency、drift、再開・補償、redactionのoracleが未定義。
- remote eventのorigin／delivery identityが不明で、自己投影echoと外部変更を区別できない。
- 既存CI、旧hook、旧DB、旧GitHub workflowを同期authorityまたは実装基盤として流用しようとしている。

現在はFeature Ticketと要求候補の具体化だけを行い、GitHub同期runtime、App、token、webhook、CIを実装・起動しない。
