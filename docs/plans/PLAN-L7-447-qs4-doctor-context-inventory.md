---
plan_id: PLAN-L7-447-qs4-doctor-context-inventory
title: "PLAN-L7-447 (troubleshoot): QS4 doctor context Vペア入口監査"
kind: troubleshoot
layer: L7
drive: agent
status: draft
route_mode: incident
entry_signals: ["po_directive:2026-07-13 /goal『速度と精度とコストを担保』に基づきPLAN-L7-442 QS4-DOCTOR-CONTEXT 12件をexact successorへ接続"]
created: 2026-07-13
updated: 2026-08-13
owner: Codex
behavior_contract_id: QS4-DOCTOR-CONTEXT-INVENTORY-001
responsibility_owner: doctor-context-inventory
backprop_decision: not_required
backprop_decision_reason: "doctor benchmarkとpublic surface snapshotのresearch。分割設計は後続PLANでfreezeする。"
agent_slots: [{ role: aim, slot_label: "AIM — doctor public contract境界" }, { role: se, slot_label: "SE — shared context/packet benchmark" }, { role: qa, slot_label: "QA — output/latency oracle" }]
generates: [{ artifact_path: docs/plans/PLAN-L7-447-qs4-doctor-context-inventory.md, artifact_type: markdown_doc }]
dependencies: { parent: docs/plans/PLAN-L7-442-quality-sweep-successor-clusters.md, requires: [] }
---
# PLAN-L7-447: QS4 doctor context Vペア入口監査
## 工程表
| Step | 実行 | 内容 | 完了条件 |
|---|---|---|---|
| 1 | [並列] | #1/#2/#3/#4/#8/#9/#10/#22/#24/#25/#26/#28を測定 | I/O/AST/program/public output baseline |
| 2 | [直列] | shared contextとpacket descriptorの責務境界を決定 | monolith分割順序と互換surface |
| 3 | [直列] | cluster別L5/L6/test-design/impl PLANへ降下 | 12件全てexact ID接続 |
| 4 | [review] | 独立reviewerがbenchmark/orphanを確認 | coverage 12/12 |
## 完了条件
- 12件がexact design/impl PLANへ接続される。
- doctor text/JSON、exit、timing、DB rebuild回数を壊さないoracleがある。

## 現行baseline再測定（2026-08-13）

最新main `ba4237af4116e984af86b3400ff1bb484597d19d`で、annex 12件を再測定した。旧sweepの
行数や回数をそのままclosure evidenceには使わない。

| annex | 現行観測 | disposition |
|---|---|---|
| #1 / #10 | `src/doctor/index.ts`は7,689行で、`runFullDoctor`が依然として集約本体を保持する | `PLAN-L7-359`はregistry/timing scaffoldの部分既出。descriptor駆動の残差を後続へ送る |
| #2 / #26 | completion packetとoutstandingのrequired-field定義、doctor bridge inputの再構築経路が別ownerに残る | completion packet descriptor/context注入を1 successorへ束縛する |
| #3 / #8 | `visualization-view-model.ts`は2,807行、`ProjectCurrentLocationView`契約は1,433行の単一interface | named section contractとpure section builder分割を1 successorへ束縛する |
| #4 / #9 | `src/cli.ts`は15,453行で、parse/presentだけでなくdomain orchestrationも保持する | command family registrarとdomain service抽出を1 successorへ束縛する |
| #22 / #24 / #25 / #28 | doctor内PLAN reader参照17箇所、rename cutover planの複数再構築、V-pair lintの`ts.createProgram`生成が残る | doctor-run immutable snapshotとI/O/Program count oracleを1 successorへ束縛する |

この再測定では12件を「doctor registry」「completion context」「current-location projection」「CLI/AST snapshot」の
4責務群へ分離する。#1/#10を`PLAN-L7-359`完了だけで解消済みとは数えず、#22のQ3 loader統一も
doctor-run snapshot注入までは部分既出として扱う。exact L5/L6/test-design/impl PLAN IDが4群すべてに割り当たるまで
本PLANは`draft`を維持する。

## 次の原子的降下

1. doctor check descriptorとrun-scoped PLAN/rename snapshotを先に設計する。
2. completion packet descriptor/context注入をdoctor snapshotのconsumerとして分離する。
3. current-location named section contractとpure builderをbehavior不変で分割する。
4. CLI registrar/domain serviceとbatch TypeScript `Program` ownerを別実装sliceにする。

各successorはdoctor text/JSON、exit code、check ID集合、timing、DB rebuild回数、filesystem read回数、
`ts.createProgram`回数のbefore/after oracleを持つ。単なる行数減少やmodule移動だけを完了根拠にしない。
