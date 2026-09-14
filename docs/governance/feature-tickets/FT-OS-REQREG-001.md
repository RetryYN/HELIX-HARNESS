---
feature_ticket_id: FT-OS-REQREG-001
title: "HELIX-OS要求候補自動登録入口"
product_target: HELIX-OS
state: proposed_upstream_waiting
priority_order: 1
created: 2026-09-15
authority_effect: work_projection_only
github_projection:
  issue: 1798
  url: https://github.com/RetryYN/HELIX-HARNESS/issues/1798
  projected_source_commit: 741eddb855d9b24ac6645c4485e7d24b8123c95f
  read_after_state: OPEN
parent_requirements:
  - HELIXOS-L2-001
  - HELIXOS-L2-002
  - HELIXOS-L2-005
  - HELIXOS-L2-007
  - HELIXOS-L2-013
acceptance_source: docs/helix-os/L11-acceptance/governance-acceptance.md
depends_on: []
delivery_precedes:
  - FT-HARNESS-SEMEXTRACT-001
  - FT-HARNESS-REQENG-001
blocks:
  - FT-OS-REQCLASS-001
---

# FT-OS-REQREG-001: HELIX-OS要求候補自動登録入口

## 目的

Concept、企画L1、利用者指示、手動整理、将来のHARNESS要求エンジン出力を、意味未分類でも失わない原eventとして
HELIX-OSの管理対象へ自動登録する。要求意味をOSが解釈・変更せず、後続の要求エンジンと分類schemaを先取りしない
汎用入口を先に成立させる。

## 機能境界

登録入口は次を行う。

- source eventを受け、重複排除可能なevent identityとcausal IDを付ける。
- project、product、Concept revision、L1 revision、source locator／digest、actor、時点、scope、data classを保持する。
- producerが明示した任意のpayload typeとschema版を意味解釈せず保持し、unknown typeを既知分類へ補完しない。
- 原event、後続projection、訂正、採否、作業、証拠を同じcausal IDへ追加できる接続口を持つ。
- 同じeventの再送を二重登録せず、部分失敗から再開できる。

登録入口は次を行わない。

- 要求候補の意味抽出、文章補完、採否、承認、L3 freeze。
- `unit`、`connection`、`composite`の分類、要求relation生成、企画との意味齟齬判定。
- Issue、PR、CI、ログ、AI出力からの要求正本生成。
- Python出力に含まれるcommand、SQL、path、codeの実行。
- 許可されていない生会話、secret、credential、PII、別project／tenant dataの保存・学習転用。

## 入出力契約候補

```yaml
registration_input:
  event_id: stable-id
  causal_id: stable-id
  source_kind: concept | planning | user_instruction | manual_candidate | requirement_engine
  source_locator: exact-locator
  source_digest: sha256
  project_id: exact-id
  product_target: exact-id
  authority_revision: exact-or-pending
  producer_payload_type: declared-string
  producer_schema_version: declared-version-or-null
  opaque_payload: bounded-value-or-content-reference
  actor: exact-id
  permission_scope: exact-scope
  data_class: exact-class

registration_result:
  registration_id: stable-id
  state: registered_proposal | duplicate | rejected | quarantined
  reason_codes: []
  stored_revision: exact-revision-or-null
  unresolved_fields: []
  projection_slots: []
```

field名と永続化schemaはL3で確定する。上記は要求漏れを防ぐticket入力であり、DB schemaや要求分類schemaを固定しない。
`opaque_payload`は無制限の生会話保存を意味せず、data class、permission、retention、size上限を満たさない入力は隔離または拒否する。

## 降下順序

1. 親Concept、HELIX-OS L1／L2とL11を承認revisionへ束縛する。
2. L3で原登録event、identity、因果接続、idempotency、authorization、retention contractを定義する。
3. L10で重複、stale、wrong product、scope逸脱、部分失敗、再開、data拒否を検証する。
4. L3で選定したtransactional boundaryとして設計し、単一commitとread-afterを実装する。
5. 意味未分類の手動event fixtureで成立させてから、要求エンジンをproducerとして接続する。

この順序はHELIX内部で管理登録を先に成立させるdelivery sequenceであり、HARNESS要求エンジン製品の
入力・出力契約をHELIX-OSへ依存させない。HARNESS単体または別consumerは、OS登録入口なしでengineを利用できる。

## 停止条件

- 親Concept／L1／L2が未承認、または対象revisionが不明。
- 原event登録と要求採用、意味分類projectionを区別する状態が未定義。
- product、source、actor、permission、data classのいずれかが不明。
- rollback／再構築／重複防止／部分失敗のoracleが未定義。
- 旧DB、Issue、Project、CIを新世代contractとして流用しようとしている。

現在はticket発行と上流接続だけを行い、実装・DB作成・runtime起動・CI実行は行わない。
