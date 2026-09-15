---
title: "会話寿命管理と外部状態からの継続再構成"
status: draft_candidate
authority_status: awaiting_human_approval
version: "1.0"
candidate_layer: L1
owner_issue: 1610
plan_id: PLAN-L3-1610-conversation-lifetime-reconstruction
---

# 会話寿命管理と外部状態からの継続再構成

## CLR-BR-001 利用者価値

同一provider sessionや長大な会話履歴を常駐前提にせず、必要な意図・作業状態・証拠を既存の正本から
再構成し、論理laneと仕事を安全かつ継続的に運転できるようにする。

## 責務と追跡

主Issue #1610、親 #1370、前提 #1608へ接続する。詳細8要求は
[要件候補](conversation-lifetime-reconstruction-requirements.md)、対応する受入は
[受入候補](conversation-lifetime-reconstruction-acceptance.md)に保持する。
本書は候補であり、canonical Requirement IR、runtime実装、session切替権限を意味しない。

## 取込み証跡

原文 `01_REQUIREMENTS_DIRECTIVE.md` のSHA-256は
`970e40bd1566318349a0f8198f47cb5924f3b2aba59020cfa0a2e00b02654cb5`。
原文は候補mergeとdigest read-afterが成立するまでroot intakeとして保持する。
