---
title: "旧IR product responsibility第1層 bootstrap監査"
status: all_waves_candidate_review_complete
verified_at: 2026-09-17
source_holding: MPR-SH-IR-003
authority_effect: none
---

# 旧IR product responsibility第1層 bootstrap監査

## 目的

旧Requirement IR 153件を、要求意味の採否より前にHELIX-HARNESS、HELIX-OS、HELIX-Web、
HELIX-Web-OSへ分類できる状態にする。旧crosswalkのOS／HARNESS候補を四製品の審査済み結果へ読み替えず、
一件ごとの原identityとsemantic digestを保ったまま管理分類projectionへ登録する。

## 台帳

- projection: [legacy-ir-product-routing-bootstrap.jsonl](../../legacy-ir-product-routing-bootstrap.jsonl)
- SHA-256: `c35934693b273e6cfd03e509886dc22bd1367e78ae1aa4568563a7da252c41e1`
- record: 153件
- source holding: `MPR-SH-IR-003`
- source identity: `HIL-BR-01..33`、`HIL-FR-01..69`、`HIL-NFR-01..40`、`HIL-TR-01..11`

各recordは原要求ID、旧revision、statement semantic digest、旧crosswalk seed、四製品の評価、routing候補、
未審査対象、authority非発生、successor未割当を保持する。旧要求本文とcarry-forward台帳は変更しない。

## 現在の進捗

| wave | 件数 | 四製品再評価 | 状態 |
|---|---:|---:|---|
| W1 業務価値 | 33 | 33 | `proposed_four_product_reviewed` |
| W2 機能 | 69 | 69 | `proposed_four_product_reviewed` |
| W3 非機能 | 40 | 40 | `proposed_four_product_reviewed` |
| W4 技術制約 | 11 | 11 | `proposed_four_product_reviewed` |
| 合計 | 153 | 153 | 四製品候補review完了 |

W1のrouting候補は`single_product` 16件、`split_required` 16件、`cross_product_connection` 1件である。
候補targetへの出現はHELIX-HARNESS 25件、HELIX-OS 25件だった。HELIX-WebとHELIX-Web-OSは33件すべてで
`excluded_with_reason`とした。これはWeb系要求が存在しないという全体結論ではなく、旧IR W1の33原文が
HELIX内部の開発工程・管理運転を対象とし、Web利用者体験または展開後service runtimeの固有価値を含まないという
W1限定の候補判断である。

W2のrouting候補は`single_product` 45件、`split_required` 24件である。候補targetへの出現は
HELIX-HARNESS 34件、HELIX-OS 59件だった。規範的な工程・要求意味・Design Template・V-pair・workflow生成規則は
HARNESS候補、event／ledger／Worker／CI／connector／runtimeの登録・推進・運転はOS候補とした。一つの旧要求に
規範条件と運転責務が混在する24件は、どちらかへ寄せず`split_required`とした。

W1の`HIL-BR-09`は、HARNESS所有agent contractからOS側team／runtime projectionへの対応と決定性という
受渡し自体をacceptance outcomeに含むため`cross_product_connection`とする。一方、W2の`HIL-FR-12`、
`HIL-FR-13`、`HIL-FR-59`はHARNESS contractを入力に使うが、acceptance outcomeはOS側でのadapter生成、
team選択、agent contract生成であるためHELIX-OSの`single_product`とする。別製品の入力を参照するだけで
connectionへ昇格しない。

W3のrouting候補は`single_product` 20件、`split_required` 20件である。候補targetへの出現は
HELIX-HARNESS 22件、HELIX-OS 38件だった。工程・authority・scope・design・V-pair・evidenceの品質条件は
HARNESS候補、冪等性、custody、transaction、Worker、CI、IPC、sandbox、security、quotaの実行制約はOS候補とした。
同じ非機能要求が規範条件と実行強制を独立outcomeとして含む20件は`split_required`とした。source coverageを扱う
`HIL-NFR-12`／`HIL-NFR-22`も、全件列挙・atomic behavior分母というHARNESSの無損失規範と、digest・atomization・receiptを
管理するOS custodyを分けた。

W4のrouting候補は`single_product` 6件、`split_required` 5件である。候補targetへの出現は
HELIX-HARNESS 5件、HELIX-OS 11件だった。control plane、harness.db write authority、Python worker隔離は
OS候補とし、platform、dependency、IPC、Bun cutoverが外部提供HARNESSと管理運転OSの双方へ別々に適用される
5件は`split_required`とした。Web製品と展開後Web service runtimeの固有技術選定は旧W4原文に含まれないため、
HELIX-Web／HELIX-Web-OSへ一般化していない。

## 旧crosswalkから変更した境界

- `HARNESS／OS`を一つのowner値として残さず、別要求へ分ける`split_required`と、製品間受渡しを所有する
  `cross_product_connection`へ分けた。
- 旧本文がHARNESS ownerと記す場合も、Worker instance lifecycle、CI運転、learning等は承認済みL1責務に従い
  HELIX-OS候補へ再配置した。旧owner表記は出典として保持し、意味変更済みとは扱わない。
- 全153件を四製品で個別評価した。旧seed target／assessmentは出典として保持し、現在の候補target、routing、
  四製品評価とは別fieldのまま維持した。
- W1〜W4の全原文をWeb系についても審査し、固有責務を確認できなかったというwave限定判断を、
  HELIX-Web／HELIX-Web-OSに要求が存在しないという全体判断へ一般化していない。

## 分類と採否の境界

この台帳は管理層の分類projection第1層であり、次を成立させない。

- successor requirement ID、L2採択、L11合意、意味変更、縮退、retire。
- split後の子要求本文やconnection contract。
- unit／connection／compositeの第2層分類。
- DB schema、要求エンジン、bot、crawler、CI、runtimeの実装・起動。

W1の33件も人間承認済み要求ではない。候補targetとrouting shapeを入力に、各原要求のactor、目的、正常系、
失敗、回復、制約、acceptanceを無損失に分けてから、L2／L11の個別判断へ進む。

## 機械照合

次を検査した。

- 153 recordと153 unique `source_requirement_id`がcarry-forwardおよびrouting queueのID集合と一致する。
- 153件の`source_statement_semantic_digest`がcarry-forwardと一致する。
- 全recordの`evaluated_product_set`が四製品のexact setである。
- W1 33件は四製品すべてが`included`または`excluded_with_reason`で、未評価targetがない。
- 全153件は四製品すべてについて`included`または`excluded_with_reason`を持ち、未評価targetがない。
- 旧seed target／assessmentを現在分類や人間承認へ昇格していない。
- 全153件が`authority_effect: none`、`successor_assignment_status: unassigned`、`meaning_change_applied: false`である。

## 次の順序

全153件の第1層candidate reviewに対する独立reviewとmain read-afterを完了する。その後も、意味採否や
split本文作成へ進む前にL2／L11の個別判断へ束縛し、原要求の削除・統合を行わない。
