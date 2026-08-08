---
title: "Python 意味コアと Node 実行境界 L9システムテスト設計（L4 pair）"
layer: L4
sub_doc: system-test-design
artifact_type: test_design
executed_at_layer: L9
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: QA
pair_artifact: docs/design/helix/L4-basic-design/python-semantic-core-node-boundary.md
github_issue_id: 230
---

# Python 意味コアと Node 実行境界 L9システムテスト設計（L4 pair）

L4基本設計 §3 の system assertion（SA-PSC-01〜04）を L9 で検証する。test citation は
各実装スライスの PLAN 確定時に登録する。L8（結合）が schema・envelope・projection の
型/段間契約の検証であるのに対し、L9 は実 doc・実 contract・実 spawn 構成・実 gate 配線を
端から端まで通す system 粒度で検証する（L8 の再実行にしない）。

| SA | 対象 | 検証内容 |
|---|---|---|
| SA-PSC-01 | 実 hybrid document end-to-end | 実 repo の実 doc + 実 sidecar 一式を Python 意味コア→envelope→Node 再検証→`harness.db` projection の全経路へ通し、意味判定重複 0・未再検証 commit 0 を assert |
| SA-PSC-02 | 実 spawn 隔離境界 | Python プロセスの実行環境（env / argv / cwd / network）に DB path・credential・repository write・`.helix/` が渡らないことを実 spawn 経路で assert |
| SA-PSC-03 | 実 gate fail-close | source / sidecar / schema / HEAD / digest drift・別 authoring DB・reverse write・browser evidence 偽装を実 gate（doctor/lint 配線）経路で fail-close することを assert |
| SA-PSC-04 | 実 inventory intake receipt | 実 source ファイル一式（211-file inventory）から Python 意味コアが filename / digest / inventory 差異 / atom disposition を intake receipt へ固定し、Node 再検証→`harness.db` projection commit までの全経路を assert（VDH-FR-001） |
