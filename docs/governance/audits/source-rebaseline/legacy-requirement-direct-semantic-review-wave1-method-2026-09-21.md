---
title: "旧要求・旧asset直接semantic review wave 1方法"
status: research_method
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
parent_decision: HDEC-CONCEPT-V4.1-AND-FOUR-L1-2026-09-17
---

# 旧要求・旧asset直接semantic review wave 1方法

## 目的

製品別要求unitと旧assetの組を一辺ずつ全文照合し、phase／製品候補poolを直接意味linkへ自動昇格させずに、旧実装の静的証拠、非該当、未解決、consumer不足、現行縮退を区別する。wave 1はHELIX-HARNESS 1 unitとHELIX-OS 1 unit、計6 edgeだけを対象にする。

本reviewは旧assetの採用、再利用、実行、要求採否、phase採否、実装許可ではない。archive内のruntime、hook、test、CI、adapterは実行しない。

## review単位と入力

review単位は`(unit_candidate_id, asset_id)`である。要求全体やphase全体を一つの判定へ畳み込まない。

- 要求unit: `legacy-requirement-implementation-crosswalk-bootstrap.jsonl`。
- asset分類: `legacy-asset-phase-product-classification-bootstrap.jsonl`。
- bytes固定: `archive/legacy-generation-2026-09-14/MANIFEST.sha256`。
- 製品境界: 承認済みConcept v4.1、HARNESS L1、HELIX-OS L1、`product-boundary.md`。
- 旧source: `archive/legacy-generation-2026-09-14/root/`以下をread-onlyで読む。

入力digest、親revision、対象edge exact set、対象unitの未review候補集合digestはmetadataへ固定する。

## 判定規則

`semantic_link_status`は次の三値である。

| 状態 | 条件 |
|---|---|
| `confirmed` | 要求原文内の明示atomと、assetの引用可能なsource spanが直接対応する。対応atomと行範囲を列挙する |
| `rejected` | assetの実責務が対象atomを満たさない。非該当を示すsourceとcounterevidenceを残す |
| `unresolved` | 部分対応はあるが製品owner、consumer、責務境界などが確定せず、直接linkを確定できない |

`confirmed`はedge上の直接対応だけを表す。要求全体の実装済み、旧runtimeの動作、test pass、現行適合、consumer closureを表さない。要求文書の`confirmed`は契約一致であり実装証拠に数えない。

実装sourceの`confirmed`は`partial_static_implementation_evidence_unexecuted`まで許す。全atomの静的対応があっても、consumer call chain、verification／acceptance、実行可能性、現行との差分が閉じなければ`implemented`、`tested`、`operational`にしない。

要求spanはstable atom IDへ分ける。責務主体もatomとして保持し、全atomのsource fragment unionが要求spanの意味文字を無損失に覆うことを検査する。複数triggerを支配する`fail-closeする`のような述語は単独atomにせず、triggerごとに`trigger＋predicate`を一atomとする。

unit集計は要求契約自身による被覆と実装sourceによる被覆を分ける。`contract_confirmed_atom_ids`は契約照合にだけ使い、実装被覆の完全性には算入しない。実装側は`implementation_confirmed_atom_ids`、`implementation_unresolved_atom_ids`、`implementation_uncovered_atom_ids`のexact setと各digestを持つ。`semantic_edge_coverage_complete`は`implementation_source`かつ`implementation_behavior_evidence`のedgeだけから計算する。旧実装状態が`unknown_*`のunitを完全被覆にできない。`partial`は実装側の未完集合を同時に記録する場合だけ使う。

各引用は、同一要求IDの逐語source、別機能の非該当source、実装挙動証拠を区別する。`contract_confirmed`へ算入するのは、全引用が`same_requirement_id_exact_restatement`であるedgeだけとする。別要求IDの整合文は契約被覆へ算入せず、非該当または未解決の意味整合として記録する。各covered atomは引用indexと`required_terms`へ束縛し、逐語一致なら全source fragment、controlled term setなら定義済みtermが引用本文に存在することを検査する。`confirmed`は`literal_source_fragment`または`controlled_term_set`、`unresolved`は`controlled_term_set_partial`だけを使う。term検査は引用とatomの語彙的束縛であり、意味妥当性を独立導出するものではない。

## 製品・phase・縮退

要求unitの`product_scope`は既存の製品分解結果を保持する。asset catalogの製品候補は探索用であり、直接semantic reviewと承認済み製品境界の両方に整合する場合だけ`direct_partial_support_for_*`と記録する。製品候補が対象unitと異なるedgeは、意味の部分一致があっても`unresolved`または`rejected`にする。

phase候補は`candidate_unchanged`のまま保持する。本waveからphase採否を生成しない。

縮退は旧要求実装状態と現行要求実装状態を分けて記録する。旧側が静的部分証拠、現行側が`not_established`であるOS unitだけを`degraded_from_partial_legacy_static_evidence_to_current_not_established`とする。旧実装自体が不明なHARNESS unitは縮退を断定しない。

## consumerと未review集合

catalogの`consumer_refs`は観測値として転記する。空配列はconsumer不存在またはclosureを意味しない。call/import、transaction writer、verification／acceptance、置換先を確認するまで`consumer_closure_status: pending`を維持する。

対象unitのphase候補poolからreview済みassetを除いた集合は、件数とcanonical JSON SHA-256をmetadataへ記録する。wave 1の6 edgeをreviewしたことから、残る候補edgeの非該当や不存在を推定しない。

## 静的検証

独立verifierは、親revisionの三入力digest、2 unit／6 edge exact set、11 atom exact set、atom fragment unionによる要求span無損失被覆、unit原文とdigest、asset ID／path／SHA／kind、archive manifest、引用行digest、引用中のrequired term、match mode、候補pool所属、契約／実装を分離したatom coverage receipt、未review集合digest、状態集計を再計算する。status文書のunit別旧／現行状態とatom件数もmetadataから照合する。また候補membershipからの直接link、要求文書からの実装claim、旧実行claim、consumer closure、current implemented、phase承認、new build許可を拒否する。

`EXPECTED_DECISIONS`はreview済み判定の改変を検出するregression pinであり、意味判定をsourceから自動導出しない。この検証は人間の意味判断、旧codeの動作、consumer完全性、要求採否を証明しない。
