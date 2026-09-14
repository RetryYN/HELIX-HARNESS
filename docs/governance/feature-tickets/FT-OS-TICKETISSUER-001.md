---
feature_ticket_id: FT-OS-TICKETISSUER-001
title: "HELIX-OS推進によるtyped ticket発行・Issue projection"
product_target: HELIX-OS
primary_role: progression
state: proposed_upstream_waiting
priority_order: 8
created: 2026-09-15
authority_effect: work_projection_only
github_projection:
  issue: 1805
  url: https://github.com/RetryYN/HELIX-HARNESS/issues/1805
  projected_source_commit: 741eddb855d9b24ac6645c4485e7d24b8123c95f
  read_after_state: OPEN
parent_requirements:
  - HELIXOS-L2-001
  - HELIXOS-L2-002
  - HELIXOS-L2-004
  - HELIXOS-L2-007
  - HELIXOS-L2-010
depends_on:
  - FT-OS-REQREG-001
  - FT-OS-REQCLASS-001
  - FT-HARNESS-TICKETCONTRACT-001
---

# FT-OS-TICKETISSUER-001: HELIX-OS推進によるtyped ticket発行・Issue projection

## 目的

管理から目的、親要求、優先度、制約、許可、予算、期限、適用HARNESS版を受け、推進が作業を分解して駆動tag、
PoC、UI prototype、Feature ticketとworkflowを生成する。管理は生成物を登録・統制し、必要なticketだけをGitHub Issueへ
projectionする。検収はHARNESS contractへの充足を独立確認する。

## 境界

- Issue作成前にlocal ticket ID、親要求revision、kind、owner、scope、依存、backflow、停止条件を固定する。
- 推進がticket発行時に承認済みHARNESS版と駆動tagからworkflow instanceを生成し、管理が入力tag、contract revision、digest、未解決、再生成条件を登録する。
- Issueは作業・協調projectionであり、要求・ticket意味・承認・完了の正本にしない。
- remote変更をeventとして取り込んでも、local authorityを自動上書きせず、必要な再生成を推進へ戻す。
- GitHub labelはlocal駆動tagのprojectionであり、label追加・削除からworkflowを無断再生成しない。
- ticket発行からWorker実行、CI、merge、releaseを自動許可しない。

現在はFeature Ticket本文の発行のみ。推進生成器、管理登録、検収、GitHub同期、Worker、runtime、CIを実装・起動しない。
