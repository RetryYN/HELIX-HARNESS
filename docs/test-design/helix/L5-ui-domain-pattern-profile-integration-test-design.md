---
title: "UI Domain・Pattern Profile L8結合テスト設計（L5 pair）"
layer: L5
sub_doc: integration-test-design
artifact_type: test_design
executed_at_layer: L8
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: QA
pair_artifact: docs/design/helix/L5-detail/ui-domain-pattern-profile.md
github_issue_id: 209
---

# UI Domain・Pattern Profile L8結合テスト設計（L5 pair）

L5詳細設計 §1-§3 を正本とする。test citation は実装 PLAN が確定する。

| IT-ID | 対象 | 検証内容 |
|---|---|---|
| IT-UDP-001 | canonicalize→contract→profile 連結 | typed entity 化した domain に対し contract/profile 検証を連結し、隔離違反・競合・profile 欠落が段をまたいで fail-close される |
| IT-UDP-002 | risk matrix→fixture 選定→registry consumer trace | 選定 fixture 列が決定的（同一入力→同一 selection_digest）で、entity 参照が #177 registry の ID 空間と整合する |
