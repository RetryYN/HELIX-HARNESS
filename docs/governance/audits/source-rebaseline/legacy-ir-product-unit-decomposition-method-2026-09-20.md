---
title: "旧Requirement IR製品unit分解方法"
status: research_method
authority_effect: none
source_revision: legacy-generation-2026-09-14
product_routing_revision: c35934693b273e6cfd03e509886dc22bd1367e78ae1aa4568563a7da252c41e1
---

# 旧Requirement IR製品unit分解方法

## 目的

製品候補routing済みの旧Requirement IR 153件を、現行製品境界に沿った`product_unit`または`cross_product_connection`候補へ分ける。原要求identityと原文を保持し、分解候補から要求採否、successor、対象別L2／L11、実装許可、完了を生成しない。

## 入力

- `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json`: 原要求本文とsemantic digest。read-onlyで参照し、旧runtimeとして実行しない。
- `docs/governance/legacy-ir-product-routing-bootstrap.jsonl`: 153件の四製品routing候補。
- `docs/concept/product-boundary.md`: 現行四製品の責務境界。
- `docs/governance/requirement-atomization-review-contract.md`: 原文、否定、例外、停止、証拠、数量、actor、authority、failure条件を落とさない規則。
- `docs/governance/requirement-disposition-review-program.md`: unit／connection／compositeと、人間decisionまでの停止条件。

## 分解規則

1. `single_product`は原文全体を一つの`product_unit`候補として保持する。複数責務が同一製品内に残る場合も、別要求への分割やsuccessor IDをここでは生成しない。
2. `split_required`は候補targetごとに一つの`product_unit`候補を作る。各unitには原文からの逐語spanと、そのspanから導ける責務要約を付ける。
3. `cross_product_connection`は両端製品を持つ一つのconnection候補として保持する。片側のunit成立や実装状態からconnection成立を推定しない。
4. 同じ原文spanを複数unitが共有する場合は、共有条件である理由を`semantic_coverage_note`へ記録する。どちらの製品に置くか決められないatomは一方へ丸めず`unresolved_reasons`へ残す。
5. `source_text_spans`は原文に実在する連続文字列に限る。`responsibility_summary`は正規化候補であり原文を置換しない。
6. `candidate_product_targets`は既存routingのexact setを維持する。この作業でHELIX-Web／HELIX-Web-OSを追加・除外確定しない。
7. `split_required`では、原文を句点・セミコロン・証拠区切り`|`で分けた各clauseを、少なくとも一つのunitの逐語spanへ残す。複数unitに共通する判断規則や証拠条件は重複参照できる。
8. 既存routingと製品境界の不一致を見つけても、この候補台帳から既存routingを上書きしない。`routing_correction_pending_notes`と未解決理由を残し、対象revision付きの人間判断へ送る。直接phase候補だけの論点は`direct_phase_review_pending_notes`へ分離する。

## phase候補

各unitには、要求本文がphase機構そのものを直接要求する場合だけ`direct_phase_candidates`を付ける。一般的な`event`、`state`、`evidence`、`test`、`gate`、`finding`、`operation`等や、成果物のlayerだけからphaseを生成しない。横断的なplatform・technology制約は無理にphaseへ置かず空配列にする。

複数phaseを直接要求するunitは候補を複数保持する。これはphase別successorへの分割完了を意味しない。`PHCAP-02`は要求の原event受付、`PHCAP-10`はWorker／agent／execution／lease／orchestration、`PHCAP-13`はmerge admission／merge／post-mergeを直接要求するときに限る。

## 状態

- `candidate_decomposed`: routingに従うunit／connection候補があり、原文の明白な責務を候補へ保持した。
- `candidate_decomposed_with_unresolved`: 候補を作ったが、共有atom、target境界、phase、意味変更論点等が残る。
- `unresolved`: 安全にunit候補を作れない。原文を保持し、欠落理由を示す。

本台帳で使う状態は`candidate_decomposition_pending_exact_head_independent_review`である。unitの意味被覆は
`pending_exact_head_independent_review`、直接phase候補は候補がある場合
`candidate_pending_exact_head_independent_review`、無い場合`unresolved`とする。
いずれも`authority_effect: none`、`meaning_change_applied: false`、`successor_assignment_status: unassigned`を維持する。

## 分割監査

153件をsource順に51件ずつ三分割し、作成担当とは別の担当が原文、製品境界、phase inventoryを照合する。
初回監査ではBlocker 0、Major 152、Minor 15を検出した。主な系統誤差は、否定・例外・停止・証拠suffixの
span欠落、原文にない実装責務のsummary追加、artifact語からのphase過剰分類、直接phaseの不足である。
初回指摘の修正後、三batchの再監査でMajor 33、Minor 4、後続再監査でMajor 1、Minor 1を追加検出して修正した。
各batchの最終再監査はBlocker 0、Major 0、Minor 0である。正本化するexact HEAD自体への独立reviewが
終わるまでは、候補状態から昇格しない。

## 静的検証

- source requirement ID 153件のexact set、順序、statement digest、statement textが原IRと一致する。
- routing candidateとproduct target集合が既存routingと一致する。
- `single_product`はproduct unit 1件、`split_required`は各targetにproduct unit 1件、connectionはconnection 1件である。
- 全spanが原文のsubstringで、空span、空要約、未知product、未知phase、重複unit IDがない。
- `split_required`では、句点・セミコロン・`|`で分けた原文clauseの未被覆がない。
- routing訂正保留、直接phase review保留と、それぞれのnote・未解決flagが一致する。
- authority、meaning change、successorを生成していない。

この静的検証は意味の無損失性を証明しない。独立reviewで原文の義務、例外、停止、failure、evidence条件を照合し、未確認範囲を保持する。
