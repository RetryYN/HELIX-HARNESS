---
title: "HELIX L6 機能設計 — Lite consumer dependency closure"
layer: L6
kind: add-design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: SE + TL
plan: docs/plans/PLAN-L7-653-distribution-lite-dependency-closure.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-dependency-closure-unit-test-design.md
related_l5: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
github_issue_id: 941
behavior_contract_id: DISTRIBUTION-LITE-DEPENDENCY-CLOSURE-001
responsibility_owner: distribution-lite-dependency-closure
---

# HELIX L6 機能設計 — Lite consumer dependency closure

## 目的

`consumer_core_v1`のexact artifact setを、consumer entrypointから到達するstatic import、dynamic import、
template、config、schema、package bin、setup生成物までdependency-closedにする。Full HELIXの既存実装を
唯一のsource authorityとし、Lite専用fork、別builder、全`src/` fallbackを作らない。

## closure gate

- TypeScript ASTからrelative import／export／literal dynamic importを抽出する。
- source treeに存在してもartifact ownership外の依存はmissingとしてfail-closeする。
- dynamic importはartifact ownershipに加え、dynamic asset exact setへの明示登録を要求する。
- artifact ownership内でもexcluded capability exact setへ到達した場合は独立failureとして拒否する。
- repo rootと解析対象sourceをphysical identityへ解決し、traversal、absolute path、symlink、root外、非fileを
  source read前に`unsafe_paths`へ分離して拒否する。
- entrypoint、visited path、edge、missing pathを昇順で返し、入力順によらないreceiptにする。
- package bin、template、config、schema、setup生成物は後続compositionで同じexact ownershipへ接続する。

## consumer composition境界

現行`src/cli.ts`と`src/doctor/index.ts`はFull HELIX機能を集約するためLite entrypointにしない。
Full HELIX内にconsumer-safe command registryとconsumer doctor compositionを置き、`setup project`、`status`、
`doctor --profile consumer`、minimal workflow、completion evidenceだけを既存domain functionへ接続する。
除外capabilityのcommandやadapterへ到達した場合はarchive生成前に拒否する。
minimal workflowは要件正本どおりCodex／Claude adapterの非`--execute` delegated dry-runとし、旧`team run`を
Lite正規E2Eへ固定しない。
admission後はcommand IDとhandler IDをexact一致させるconsumer composition portへ一方向dispatchし、拒否commandは
handlerを一件も起動しない。filesystem／process／DBは後続Node adapterだけが所有する。
Node adapterはsetup、status、consumer doctor、completion packet／bundle、provider dry-runを既存domain functionへ
接続する。provider実行は常に`execute:false`で、task-fileはrepo physical root内・64KiB以下に限定する。

## 非対象

tarball生成、consumer canary、Windows smoke、tag、publish、promotion、DevOS cutoverは#856後続PRと#659の
approval境界へ残す。
