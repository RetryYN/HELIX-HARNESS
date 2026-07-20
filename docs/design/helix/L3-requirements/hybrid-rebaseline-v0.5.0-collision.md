---
title: "HELIX L3要件 — REBASELINE v0.5.0追突統合"
layer: L3
kind: add-design
status: draft
created: 2026-07-18
updated: 2026-07-18
owner: Codex / TL
related_l1: docs/design/helix/L1-requirements/hybrid-rebaseline-v0.5.0-intake.md
source_package: HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.0.zip
source_sha256: a8c011502d2e9313ea9fbbad38aba45a00312dc5053468da832e3a9d8757a0e9
pair_artifact: docs/test-design/helix/hybrid-rebaseline-v0.5.0-collision-acceptance.md
spec:
  defines:
    - { id: HR-FR-V050-01, kind: source custody, title: v0.5.0 exact package intake, layer: L3, owner: TL, status: draft }
    - { id: HR-FR-V050-02, kind: delta adoption, title: catalog and AC delta preservation, layer: L3, owner: TL, status: draft }
    - { id: HR-FR-V050-03, kind: authority, title: ADR authority fail-close, layer: L3, owner: TL, status: draft }
    - { id: HR-FR-V050-04, kind: runtime, title: Python Node boundary hardening, layer: L3, owner: TL, status: draft }
    - { id: HR-FR-V050-05, kind: subagent, title: capsule fail-close standard, layer: L3, owner: TL, status: draft }
    - { id: HR-FR-V050-06, kind: delivery route, title: L1-L12 and Production Scrum preservation, layer: L3, owner: TL, status: draft }
    - { id: HR-FR-V050-07, kind: validation, title: package self-consistency gate, layer: L3, owner: QA, status: draft }
    - { id: HR-FR-V050-08, kind: trace, title: exact delta trace projection, layer: L3, owner: QA, status: draft }
    - { id: HBR-ARCH-014, kind: source requirement, title: v0.5.0 architecture delta, layer: L3, owner: TL, status: draft }
    - { id: HBR-AGENT-016, kind: source requirement, title: capsule scope delta, layer: L3, owner: TL, status: draft }
    - { id: HBR-AGENT-018, kind: source requirement, title: capsule fallback delta, layer: L3, owner: TL, status: draft }
    - { id: HBR-INV-014, kind: source requirement, title: inventory delta, layer: L3, owner: TL, status: draft }
    - { id: AC-ARCH-07, kind: source acceptance criterion, title: architecture delta acceptance, layer: L3, owner: QA, status: draft }
    - { id: AC-AGENT-10, kind: source acceptance criterion, title: capsule scope acceptance, layer: L3, owner: QA, status: draft }
    - { id: AC-AGENT-11, kind: source acceptance criterion, title: capsule conformance acceptance, layer: L3, owner: QA, status: draft }
    - { id: AC-INV-08, kind: source acceptance criterion, title: inventory delta acceptance, layer: L3, owner: QA, status: draft }
    - { id: AC-TRACE-02, kind: source acceptance criterion, title: trace delta acceptance, layer: L3, owner: QA, status: draft }
    - { id: AC-SEC-PY-01, kind: source acceptance criterion, title: Python sandbox acceptance, layer: L3, owner: QA, status: draft }
    - { id: D-009, kind: source decision, title: ADR-009 source decision, layer: L3, owner: TL, status: draft }
    - { id: D-016, kind: source decision, title: ADR-010 collision decision, layer: L3, owner: TL, status: draft }
---

# HELIX L3要件 — REBASELINE v0.5.0追突統合

## 1. 位置づけ

v0.5.0はv0.4.0を置換する即時正本ではなく、現行HELIXのL1–L12正本へ追突する差分sourceである。
archive内の旧`L0-L14`、Bun、runtime authority、proposal/semantic-core呼称をそのままcanonicalへ昇格しない。
本書と対になる受入設計で、採用、hardening、保留、rejectを一件ずつ決める。

## 2. source分母

| 対象 | v0.4.0 | v0.5.0 | delta |
|---|---:|---:|---:|
| archive file | 184 | 200（CHECKSUMS対象） | +16 |
| requirements | 163 | 168 | +5、変更37、削除0 |
| acceptance criteria | 111 | 117 | +6、変更19、削除0 |
| trace edge | 286 | 333 | +47、変更0、削除0 |

ZIP展開時の実ファイル数202は`MANIFEST.json`と`CHECKSUMS.md`自身を含む。CHECKSUMS対象200件は
全件digest一致する。この2つの分母を混同してはならない。

## 3. 要件

### HR-FR-V050-01 packageの厳密取込

ZIP SHA-256、200 checksum member、202 physical file、manifest member listを個別に記録する。文書内の集計値、
同梱validatorのgreen、過去の「59/59解消」claimだけでsource denominatorを代替しない。

### HR-FR-V050-02 catalogとAC差分の保持

追加要件`HBR-ARCH-014`、`HBR-AGENT-016..018`、`HBR-INV-014`、追加AC
`AC-ARCH-07`、`AC-AGENT-10`、`AC-AGENT-11`、`AC-INV-08`、`AC-TRACE-02`、`AC-SEC-PY-01`を
欠落なく追跡する。37変更要件、19変更AC、47追加edgeもID単位で差分集合を保持する。

### HR-FR-V050-03 ADR authorityのfail-close

ADR-009と、これを部分改定するtrackedかつacceptedのADR-010を同一authority epochとして扱う。
意味判断の正本はPython semantic core、transaction・DB/Git/GitHub副作用の正本はNode transactional boundaryとし、
PythonへDB path、credential、repository、`.helix/`を渡さない。package内D-016はADR-010と一致する部分だけを採用し、
package内の`confirmed`表記だけでrepo-owned ADRのauthorityを反転しない。

### HR-FR-V050-04 Python / Node境界の強化

現行authorityではPythonをclosed capability classのproposal worker、Nodeを唯一のtransaction writerとする。
v0.5.0の次の強化は採用する。

- network default deny
- DB path、credential、repository、`.helix/`をPythonへ渡さない
- Python出力のcommand、SQL、absolute path、generated codeを実行しない
- schema、digest、authority policy、lease/fenceをNodeが再検証する
- legacy Python CLIはterminal cutover receipt後にhistorical allowlistへ降格する

### HR-FR-V050-05 capsule fail-close基準

`HBR-AGENT-016`と`017`のscope、allowlist、委譲brief marker、canonical digest共通化は採用する。
`HBR-AGENT-018`の「conformance未達時にprompt-onlyへfallback」は安全性を弱めるため、そのまま採用しない。
conformance未達時は当該subagent typeを起動拒否し、Issueと改善eventを発行するfail-closeへhardeningする。

### HR-FR-V050-06 L1–L12とProduction Scrumの保持

v0.5.0の`11-layers-and-gates.md`にあるL0–L14はsource表現として保存し、canonical outputはL1–L12へ
exact remapする。本格systemまたはhard triggerは完全L1–L12 V、適格な段階release／小規模systemは
Production Scrum＋縮約V、非production実験はDiscovery/PoC、曖昧・複合・不適格は完全Vへfail-closeする。
ScrumはTDD、Reverse、受入条件、migration、rollback、release evidence、L12運用を省略しない。

### HR-FR-V050-07 package自己整合gate

次の自己矛盾が0になるまでv0.5.0全体をterminal PASSにしない。

1. `package-validation-report.json` summary.versionが`0.4.0`、manifestが`0.5.0`。
2. catalog checkはrequirements=168、summaryはrequirements=163。
3. Pythonを恒久正本とする記述と、proposal-only／Node再検証必須の記述が同一package内に共存。
4. D-009のADR-009 proposal-onlyとD-016のproposal-only廃止がcurrent decisionとして競合。
5. `verify-full-ref-adoption-status.py`が`enumeration_log_present=False`でもPASSする。

### HR-FR-V050-08 厳密な差分trace投影

本書の8要件をL1要求、L4 authority/runtime/capsule architecture、L10 system oracle、L12 operationへ
同一IDで投影する。v0.5.0の追加・変更集合にunclassified、duplicate owner、orphan AC、orphan edgeを残さない。

## 4. 終端disposition

| family | disposition |
|---|---|
| source checksum、catalog/AC/trace delta | 採用（ADOPT） |
| Python sandbox、Node transaction boundary、legacy CLI sunset | 強化（HARDEN） |
| capsule scope/digest | 採用（ADOPT） |
| capsule prompt-only fallback | 再設計してfail-close |
| ADR-010 semantic-core authority | repo-owned accepted ADRを採用 |
| package L0–L14 | REDESIGN_TO_L1_L12 |
| package validation summary claims | 修正まで終端evidenceとして拒否 |
