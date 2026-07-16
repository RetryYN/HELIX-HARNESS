---
title: "HELIX L1-L12 authoring authority receipt"
status: pending-po-approval
created: 2026-07-16
updated: 2026-07-16
owner: PO / TL
receipt_id: VMAUTH-2026-07-16-01
authority_epoch: vmodel-l1-l12-v1
authority_scope: requirement-and-design-authoring
requirements_authoring_freeze: pending
implementation_preflight: blocked
runtime_cutover: pending
active_runtime_compatibility: legacy-l0-l14
python_policy_supersession: pending
python_tool_activation: 0/29
decision_table_sha256: 34d0fad1281157ac0c96a891b4b3f252bd1b475b472649a5cf5a580cec3c64f6
approval_event_id: pending
approved_actor: pending
approved_at: pending
approved_digest: pending
---

# HELIX L1-L12 authoring authority receipt

## §0 receipt境界

本receiptは要件・設計authoringの意味をL1–L12へ固定するための承認対象であり、runtime schema migration、Node cutover、
Bun撤去、Python tool active adoption、実装またはtest実行の完了を主張しない。PO承認は下表のcanonical digestへbindし、
`status=confirmed`、`requirements_authoring_freeze=approved`、`python_policy_supersession=approved`への変更は明示承認後だけ行う。

source occurrenceはchat requirement ledgerの`HC-CHAT-028/045/046/047/048/050/056/057`を参照する。
decision digest、approval event ID、approved actor/timeは承認時に追記し、欠落中はfreezeをgreenにしない。

### §0.1 canonical decision artifact binding

| artifact | SHA-256 |
|---|---|
| `vmodel-canonical-authority-cutover.md` | `c9db6a2dff2f259f157a835b03bac9f1124256f44ff570deeb743d002445a828` |
| `ADR-009-node-python-linux-runtime.md` | `b35b527b14b8152faefb6f22b47ba5c908b827a1fc9c8881ccafd55c35a0db0c` |
| `infinity-loop-platform-requirements.md` | `2f53ae4490ce723daed51277d63f8d9de01e7a95ab53866ad3924074ffc9aaf7` |
| `infinity-loop-functional-requirements.md` | `2d3f4a57ca3835efcbb791ba52aa7ab80f84947c30868ab9458d3dd99ce58ebd` |
| `helix-harness-concept_v3.1.md` | `457b075701d400c2b5e721d8560b4a2c1e12fc7d42987f2226fa2955e00db3b2` |
| `helix-harness-requirements_v1.2.md` | `26b12be8fb480e7d58f91076e215e8539c862711ebc7a883912be4f43e9bc099` |
| `helix-charter_v0.1.md` | `6865b7468eefd8e754b377f27e88325361d5ea0479ea49103a12a06db788901a` |
| §1 decision table（§1 headingから§1.1直前まで、UTF-8 raw bytes） | `34d0fad1281157ac0c96a891b4b3f252bd1b475b472649a5cf5a580cec3c64f6` |

上記artifactのいずれかが変われば本bindingをstaleとし、digest更新だけでapprovalを継承しない。

## §1 authority decision

| 論点 | canonical authority | legacy compatibility | 禁止 |
|---|---|---|---|
| 工程 | L1–L12 | 既存L0–L14 token/path/PLAN ID | 新規設計をlegacy意味で作る |
| V-pair | L1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7 | 旧pairはprojection input | 旧pairで新規freeze |
| 画面 | L1企画→L2要求/prototypeまたはno-UI receipt→L3 | 既存L2 mock | 暗黙skip |
| TDD | L5 test design→L7 Red→L6 Green→L7 closure→L8以降 | 旧L7実装/L8 testはremap input | Green先行、test後付け |
| Production Scrum | backlog/sprint/BDD overlay、各slice内で縮約V完走 | 既存Scrum記録 | ScrumをPoCと同一視 |
| Discovery/PoC | S0–S4 spike route | legacy `kind=poc` | production完成経路へ直結 |
| 人/AI境界 | 人=L1/L2決定＋L3承認、AI=L3起草＋L4以降 | legacy L0/L1/L2表記は意味投影 | AIによるL1価値/scope確定 |
| Charter | P0–P9価値・scopeを維持 | L0配置と層番号 | P0–P9自体の無断変更 |
| Runtime | Node target、terminal receipt前はBun active | Bun rollback authority | Node activeの先行主張 |
| Python | closed capabilityのproposal workerとしてtool別採否 | ZIP原toolはsource evidence | Python direct DB/gate/Issue write |
| Node | control、gate、schema再検証、唯一のDB commit | legacy Bun execution | control authorityのPython移植 |
| Python supersession | `HVM-REJECT-01`の全面reference-only判断だけsupersede | Excel非正本判断は維持 | 29 tool一括active化 |
| Schema | 現行L0–L14 schemaはruntime compatibility | dual-read対象 | schema greenをauthoring freeze証拠にする |

### §1.1 machine decision packet

全chat決定とL0/L1/L3/L4の照合正本は
`docs/governance/generated/vmodel-authority-decision-packet-v1.json`（SHA-256
`97482d7ef823ba6573376c0ee102ccf9cf5c7b08e49c75fe3fbd0a8f7c3d9333`）である。

19 decisionの内訳はPO明示または明示＋設計精緻化8、PO activation待ちの設計導出10、安全境界1である。
PO明示済みのL1–L12 authority、Production Scrum、TDD先行順序、prototype/no-UI明示skip、旧UT非authority、
要件freeze前の実装禁止は保持する。一方、exact six-pair、Visual L8/L9/L11の詳細意味、target evidence非混在を含む
packet全体のactivationは未承認である。

追加PO判断は`VMAUTH-PO-01`の1件だけに集約する。承認されてもauthoring authorityだけがactivatedとなり、
`implementation_preflight=blocked`、`runtime_cutover=pending`、`python_tool_activation=0/29`は変えない。
本書frontmatterのapproval fieldは明示approval event受領まで`pending`のままとする。

## §2 stale条件と独立gate

次のいずれかでstaleとする: PO decision revision、L1–L12 mapping revision、ADR-009責務revision、
Production Scrum/TDD order revision、decision table digest mismatch。

authoring authorityが承認されても、`implementation_preflight=blocked`と`runtime_cutover=pending`は独立して維持する。
162要件semantic coverage、source atom採否、tool別activation、schema migration、test evidenceを本receiptで代用しない。

## §3 VMAUTH activation event contract

`VModelAuthorityActivationEventV1`は`event_id`、`event_sequence`、`event_digest`、`packet_sha256`、
`source_set_sha256`、`decision_table_sha256`、`actor_id`、`actor_authority`、`authority_evidence_sha256`、
`co_authority_receipt_digests`、`idempotency_key`、`expected_activation_epoch`、`previous_event_sha256`、
`answer_event_id`、`answer_message_sha256`、`normalized_answer_sha256`、`status`、`issued_at`を必須とする。
`status`は`active | stale | revoked | superseded`、遷移eventはappend-onlyである。active rowを上書きせず、
source/decision/authority drift時はstale、明示取消はrevoked、新revision activationは旧eventをsupersededへ遷移させる。

writerはpacket/source/decision-table/authority proofをwrite直前に再hashし、`expected_activation_epoch`とprevious event headを
compare-and-swapする。同じ`idempotency_key`＋同一payloadは既存結果、異payloadはconflict、CAS loserはevent/receipt/projection
増分0とする。VMAUTH-PO-01のchat回答はevent/message/normalized answer digestとactor/timeを保持する。B/C相当の高影響選択を
参照する場合はoption-bound co-authority scope/expiry receiptを必須とし、不足時はactive化しない。

本eventとUniversal 6-group/22-question activationは同じauthority epochへbindするが、選択値は現在0のままである。
event schemaの設計は承認・実装・runtime cutover・coverage creditを意味しない。
