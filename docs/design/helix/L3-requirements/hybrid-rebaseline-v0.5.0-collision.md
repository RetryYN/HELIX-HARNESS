---
title: "HELIX L3要件 — REBASELINE v0.5.0追突統合"
layer: L3
kind: add-design
status: draft
created: 2026-07-18
updated: 2026-07-18
owner: Codex / TL
source_package: docs/migration/source-packages/hybrid-core-requirements-rebaseline-v0.5.0.zip
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

### HR-FR-V050-01 package完全受付

ZIP SHA-256、200 checksum member、202 physical file、manifest member listを個別に記録する。文書内の集計値、
同梱validatorのgreen、過去の「59/59解消」claimだけでsource denominatorを代替しない。

### HR-FR-V050-02 catalog・AC差分保持

追加要件`HBR-ARCH-014`、`HBR-AGENT-016..018`、`HBR-INV-014`、追加AC
`AC-ARCH-07`、`AC-AGENT-10`、`AC-AGENT-11`、`AC-INV-08`、`AC-TRACE-02`、`AC-SEC-PY-01`を
欠落なく追跡する。37変更要件、19変更AC、47追加edgeもID単位で差分集合を保持する。

### HR-FR-V050-03 ADR権威のfail-close

2026-07-17のADR-010 accepted裁定をcurrent authorityとする。Pythonは恒久意味コア、Nodeは
`harness.db`／Git／GitHubの単一transaction境界であり、意味判断と副作用の層別権威を同格に扱う。
ADR-009はNode 24 LTS、脱Bun、Linux canonical、cutover receipt、network default deny、DB path等の
Python非付与を引き続き拘束する。package内の自己宣言だけでこのauthority epochを反転しない。

### HR-FR-V050-04 Python・Node境界の強化

現行authorityではPythonをregistry管理された恒久意味コア、Nodeを唯一のtransaction writerとする。
v0.5.0の次の強化は採用する。

- network default deny
- DB path、credential、repository、`.helix/`をPythonへ渡さない
- Python意味コアが生成したcommand、SQL、absolute path、generated codeをNodeが直接実行しない
- semantic result envelopeのschema、digest、authority policy、lease/fenceをNodeが再検証する
- legacy Python CLIはterminal cutover receipt後にhistorical allowlistへ降格する

### HR-FR-V050-05 capsule fail-close標準

`HBR-AGENT-016`と`017`のscope、allowlist、委譲brief marker、canonical digest共通化は採用する。
`HBR-AGENT-018`の「conformance未達時にprompt-onlyへfallback」は安全性を弱めるため、そのまま採用しない。
conformance未達時は当該subagent typeを起動拒否し、Issueと改善eventを発行するfail-closeへhardeningする。

### HR-FR-V050-06 L1–L12・Production Scrum保持

v0.5.0の`11-layers-and-gates.md`にあるL0–L14はsource表現として保存し、canonical outputはL1–L12へ
exact remapする。本格systemまたはhard triggerは完全L1–L12 V、適格な段階release／小規模systemは
Production Scrum＋縮約V、非production実験はDiscovery/PoC、曖昧・複合・不適格は完全Vへfail-closeする。
ScrumはTDD、Reverse、受入条件、migration、rollback、release evidence、L12運用を省略しない。

### HR-FR-V050-07 package自己整合ゲート

次の自己矛盾が0になるまでv0.5.0全体をterminal PASSにしない。

1. `package-validation-report.json` summary.versionが`0.4.0`、manifestが`0.5.0`。
2. catalog checkはrequirements=168、summaryはrequirements=163。
3. Pythonを恒久正本とする記述と、proposal-only／Node再検証必須の記述が同一package内に共存。
4. D-009のADR-009 proposal-onlyとD-016のproposal-only廃止がcurrent decisionとして競合。
5. `verify-full-ref-adoption-status.py`が`enumeration_log_present=False`でもPASSする。

### HR-FR-V050-08 差分追跡の完全投影

本書の8要件をL1要求、L4 authority/runtime/capsule architecture、L10 system oracle、L12 operationへ
同一IDで投影する。v0.5.0の追加・変更集合にunclassified、duplicate owner、orphan AC、orphan edgeを残さない。

## 4. 終端採否

| family | disposition |
|---|---|
| source checksum、catalog/AC/trace deltaの採用 | ADOPT |
| Python sandbox、Node transaction境界、legacy CLI廃止 | HARDEN |
| capsuleのscope/digest | ADOPT |
| capsuleのprompt-only fallback | REDESIGN_FAIL_CLOSE |
| ADR-010のsemantic-core権威 | ADOPT_CURRENT_AUTHORITY |
| package L0–L14 | REDESIGN_TO_L1_L12 |
| package validation summaryの主張 | REJECT_AS_TERMINAL_EVIDENCE_UNTIL_FIXED |
