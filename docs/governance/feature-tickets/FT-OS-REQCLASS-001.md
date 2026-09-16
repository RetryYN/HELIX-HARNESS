---
feature_ticket_id: FT-OS-REQCLASS-001
title: "HELIX-OS要求分類projection"
product_target: HELIX-OS
state: layer1_bootstrap_proposed
downstream_state: l2_and_requirement_engine_waiting
priority_order: 4
created: 2026-09-15
authority_effect: work_projection_only
github_projection:
  issue: 1800
  url: https://github.com/RetryYN/HELIX-HARNESS/issues/1800
  projection_receipt_ref: docs/governance/audits/source-rebaseline/github-feature-ticket-projection-2026-09-15.md
  read_after_state: OPEN
parent_requirements:
  - HELIXOS-L2-001
  - HELIXOS-L2-002
  - HELIXOS-L2-005
  - HELIXOS-L2-007
  - HELIXOS-L2-013
acceptance_source: docs/helix-os/L11-acceptance/governance-acceptance.md
depends_on:
  - FT-OS-REQREG-001
layer_dependencies:
  product_responsibility:
    - FT-OS-REQREG-001
  semantic_topology_and_relations:
    - FT-OS-REQREG-001
    - FT-HARNESS-REQENG-001
---

# FT-OS-REQCLASS-001: HELIX-OS要求分類projection

## 目的

FT-OS-REQREG-001が保持する意味未分類の原eventへ、対象製品候補を第1層として先に登録する。その後、
HARNESS要求エンジンが生成した要求候補、意味分類、relation、企画との齟齬を後続層のversioned projectionとして
関連付ける。原eventを書き換えず、engine／schema／製品pack更新時に旧分類を履歴として残して再分類できるようにする。

## 分類層

| 層 | 分類対象 | engine依存 | authority effect |
|---|---|---|---|
| 第1層 `product_responsibility` | HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS、製品間接続、分割要、未解決 | 依存しない。原文と承認済み製品責務から候補化する | none |
| 第2層 `requirement_topology` | `unit`、`connection`、`composite`、`unresolved` | HARNESS semantic contractへ依存 | none |
| 第3層 `semantic_relation` | `contains`、`connects`、`depends_on`、`constrains`、`verified_by` | HARNESS semantic contractへ依存 | none |
| 第4層 `planning_alignment` | 企画価値の要求化漏れ、企画外追加、対象違い、scope／non-goal逸脱、矛盾、質問 | Concept／L1 revisionとengine出力へ依存 | none |

第1層を要求エンジン決定待ちにしない。製品候補の登録は要求意味の採否ではなく、後続処理のowner候補と
境界論点を失わないための管理projectionである。file blobまたはpath holdingは一件を一要求として分類せず、
source-qualified identityまたは無損失に分解したatomを入力にする。

## 第1層product responsibility contract

第1層は一つの入力identity／atomごとに次を保持する。

- source holding、source identity、source revision、原文semantic digest。
- 評価対象となる四製品のexact set。
- `candidate_product_targets`と、その責務根拠。
- `single_product`、`cross_product_connection`、`split_required`、`unresolved_product`のrouting候補。
- 旧crosswalk由来のseed targetとseed routing。未審査中は現在の`candidate_product_targets`を空集合、
  `routing_candidate`を`unresolved_product`とし、seed値を現在分類と同じfieldへ置かない。
- 各製品について`included`、`excluded_with_reason`、`unresolved`の評価。
- 分類actor、分類規則revision、evidence、confidenceでは代替できない未解決事項。
- supersede、stale、再分類履歴と`authority_effect: none`。

複数製品に関係することだけで同じ要求を各製品へ複製しない。製品間の受渡し自体が要求なら
`cross_product_connection`、一文に別々の製品責務が混在するなら`split_required`とする。どちらかを決められない
場合は`unresolved_product`を維持する。

`cross_product_connection`は、上流製品のcontract identity、下流製品の受理identity、両者の対応、欠落・不整合時の
扱いを含み、受渡しの成立とtrace自体がacceptance outcomeである場合に使う。別製品のcontractを入力として参照する
だけではconnectionにしない。その入力から生成、選択、配置、実行することがacceptance outcomeなら、実行する製品の
`single_product`とする。受渡し契約と下流運転が一文に独立したoutcomeとして混在する場合は`split_required`とする。

## 分類projection

第2層以降の分類結果は少なくとも次を持つ。

- source event ID、causal ID、対象project／product、Concept／L1 revision。
- engine version、semantic contract version、schema version、product pack version、実行時点。
- `unit`、`connection`、`composite`または`unresolved`のkind候補とconfidence／根拠。
- subject identity候補と`contains`、`connects`、`depends_on`、`constrains`、`verified_by`のrelation候補。
- 企画価値の要求化漏れ、企画外追加、対象違い、scope／non-goal逸脱、矛盾、質問。
- 人間の訂正・採否、supersede先、stale理由、再分類対象revision。

## 境界

- 分類projectionは要求正本、人間合意、L3承認、操作許可ではない。
- 原eventを分類結果で上書きせず、旧分類を削除して履歴を整合させない。
- unknownを既知kindへ補完せず、複数候補や分類不能を保持する。
- engine自己評価だけでconfidence、改善、正解を確定しない。
- 分類層は要求意味を独自実装せず、HARNESS semantic contractとengine出力を参照する。
- 第1層のproduct routing候補をsuccessor assignment、要求採択、意味変更、人間承認へ昇格しない。
- 旧crosswalkの対象値を四製品すべての再評価済み結果として扱わない。

## 降下順序

1. FT-OS-REQREG-001の原event identityと因果接続をfreezeする。
2. 第1層の四製品責務語彙、routing候補、included／excluded／unresolved評価をfreezeする。
3. 旧IR 153件とatom化済みholdingを第1層へ候補登録し、四製品を一件ずつ再評価する。
4. FT-HARNESS-REQENG-001のsemantic output contractをfreezeする。
5. 第2層以降のprojection identity、version join、stale／supersede／reclassification contractをL3で定義する。
6. L10でengine版変更、schema変更、分類競合、wrong product、原event欠落、重複、部分投影を検証する。
7. L3で選定したtransactional boundaryで検証してprojectionをcommitし、原eventと分類結果をread-afterする。

bootstrapでは[旧IR product routing候補](../legacy-ir-product-routing-bootstrap.jsonl)をrepo-owned projectionとして
使用する。これはruntime schemaではなく、旧crosswalk seedと四製品再評価の進行を分けて保持する台帳である。
W1業務価値33件、W2機能69件、W3非機能40件は四製品を個別評価済みの候補、W4技術制約11件は
旧seedを保持した未審査として区別する。
件数、routing shape、SHA-256、無損失照合は
[bootstrap監査](../audits/source-rebaseline/legacy-ir-product-routing-bootstrap-audit-2026-09-17.md)へ記録する。
現在はticketとbootstrap台帳だけを整え、DB、engine、runtime、CIを実装・起動しない。
