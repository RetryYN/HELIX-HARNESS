---
title: "共有generated authorityのsingle-writer収束"
layer: L6
kind: recovery
status: draft
created: 2026-09-13
updated: 2026-09-13
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-1323-generated-authority-single-writer.md
pair_artifact: docs/test-design/helix/L7-generated-authority-single-writer-unit-test-design.md
github_issue_id: 1323
behavior_contract_id: GENERATED-AUTHORITY-SINGLE-WRITER-001
responsibility_owner: generated-authority-projection
---

# 共有generated authorityのsingle-writer収束

## 1. 責務

並列candidateが共有generated fileの最終bytesをそれぞれ所有する構造を廃止し、candidateは意味差分と
期待入力digestを持つversioned `projection_delta`だけを提出する。current mainとadmission済みdeltaから
canonical projectionを生成・publishできるwriterは、既存Node transactional boundary内の一writerに限定する。

対象の初期集合は`docs/design/design-catalog.yaml`、G3 freeze packet、reviewed digest map、pin test、
outstanding snapshotとする。意味正本、review receipt、CI結果はgenerated projectionへ降格しない。

## 2. 既存機構との接続

- changed pathから追従対象を列挙するread-only入力は#1670のpin-chain derivationを再利用する。
- candidate HEAD、merge admission、成功証拠継承は#538／#1778の既存契約を再利用する。
- writer lease、fence、takeoverは#860のAssignment kernelを再利用する。
- 副作用はADR-010のNode transactional boundaryだけが実行する。別queue、別scheduler、別DB、別承認制度を作らない。

## 3. 型付きdeltaと判定

`projection_delta.v1`はrepository、base SHA、candidate SHA、generator ID/version、source input digest、
semantic changed paths、expected output exact setを含む。canonical bytesそのものや承認済みdigestへの自己昇格は含めない。

writerはcurrent mainに対し、少なくとも次を分類する。

- `applicable`: baseとgeneratorが有効で、semantic overlapがない。
- `semantic_collision`: 同じ意味ownerを複数deltaが変更する。自動選択せずownerへ返す。
- `stale_base`: baseまたはsource digestがcurrent mainと異なる。再導出を要求する。
- `superseded`: 同一candidate／同一delta identityの新revisionが存在する。
- `unsupported`: generator、surface、必須fieldを解釈できない。fail-closeする。

delta適用順で出力が変わる場合はnondeterministicとして拒否する。複数deltaが独立なら、順序を入れ替えた再生でも
同じexact output setとdigestになることを要求する。

## 4. publish transaction

writerはlease/fenceとcurrent mainを実行直前に再検証し、ephemeral projectionを生成して既存gateを実行する。
全検査greenの場合だけcanonical exact setを単一transactionとしてpublishし、source HEAD、delta set、generator、
output digest、検査世代をreceiptへ封緘する。CAS不一致、部分書込み、lease失効時はmainを成功扱いにせず、
同じtransaction identityから冪等に再開する。

candidateのsemantic review receiptとintegration projection receiptは別証拠として保持する。deterministic生成を理由に
semantic reviewを省略せず、semantic変更をwriterが追加してはならない。

## 5. 受入契約

| Oracle ID | 契約 |
| --- | --- |
| U-GASW-001 | 2つの独立deltaを逆順で適用しても同じoutput exact set/digestを得る。 |
| U-GASW-002 | semantic overlap、stale base、unknown generator、missing exact setを別failureとしてfail-closeする。 |
| U-GASW-003 | 同一deltaの再送は二重適用せず、superseding revisionだけを採用する。 |
| U-GASW-004 | lease/fence失効、CAS競合、途中失敗でcanonical surfaceを部分publishしない。 |
| U-GASW-005 | candidate semantic receiptとintegration projection receiptを混同せず、双方からsource HEADへ逆引きできる。 |
| IT-GASW-001 | 2〜4並列PRで中央generated fileのbranch間content conflictを発生させずmainへ収束する。 |

対応する反例とtest citationはL7 pair artifactへ置く。
