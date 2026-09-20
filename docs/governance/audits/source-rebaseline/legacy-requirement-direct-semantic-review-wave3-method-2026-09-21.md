---
title: "旧要求・旧asset直接semantic review wave 3方法"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 3方法

## 対象

wave 3は、crosswalkのdirect phase candidateが空である30 unitから、HELIX-HARNESSの
`HIL-FR-33`、`HIL-NFR-02`、`HIL-NFR-03`を選び、各3 edge、合計9 edgeを直接照合する。
phase候補が空であることは旧assetが無いことを意味しないため、phase poolを検索oracleとして使わない。

各unitのatomはproduct unit decompositionの`source_text_spans`だけから作る。`HIL-FR-33`の
`active Bun count`、`HIL-NFR-02`のCodex自己承認禁止、`HIL-NFR-03`のcheckpoint／未完了状態遷移は
HELIX-OS unit側のspanであり、本waveのHARNESS atomへ持ち込まない。budget非免除spanだけはdecompositionが
HARNESS／OS共有候補として保持しているため、その境界未決状態を維持する。

schema 5では、共有source spanが無いという構造事実を`no_shared_source_span`、人間による製品境界判断の完了を
`product_boundary_decision_complete`として分離する。全atomが`product_boundary_pending_human_decision`である本waveでは、
前者がtrueでも後者はfalseであり、製品境界の解決完了を生成しない。wave 2 schema 4の
`product_boundary_resolution_complete`とは名前と意味を分ける。

## bounded global search

各unitは、4,020件のasset catalog全件について対応archive fileを読み、metadataのphase候補に依存せず、
unit ID、要求の特徴語、設計failure code、設計調査から得た隣接実装symbolのいずれかをUTF-8本文に含むassetを
検索候補とする。検索anchor、候補件数、候補asset ID集合digest、今回選択したasset、未review集合の件数とdigestを
metadataへ保存する。verifierはcatalogとarchive bytesからこの集合を再計算する。

この検索membershipはsemantic link、phase authority、製品owner、実装成立を生成しない。今回未選択の候補は
未reviewのまま残す。検索anchorに隣接実装symbolを含めるのは、要求IDを記載しないsourceを漏らさないためであり、
そのsymbolの存在を直接対応の根拠にはしない。

## 判定境界

- 同じ要求IDの原文snapshotは`confirmed`だが、契約だけで実装ではない。
- L5 designは要求atomを具体化していても`unresolved`の`design_contract_evidence`とし、実装被覆へ算入しない。
- implementation sourceがatomの一部しか扱わない場合は`unresolved`、隣接機能だけの場合は`rejected`とする。
- `unresolved` edgeは静的実装証拠を生成しない。旧要求実装状態がunknown、またはbounded searchに未review候補が
  残る間は具体的な縮退先を確定せず、aggregateを`unresolved_legacy_implementation_unknown`に保つ。
- archive内runtime、test、hook、CI、adapterは実行しない。旧test設計も実行証拠にしない。
- consumer closure、現行実装、phase authority、製品境界、人間判断を生成せず、`new_build_allowed:false`を維持する。

wave 1とwave 2のledger／metadataをdigestで入力へ固定し、全waveのedge集合の非重複と累積件数を検査する。
status表の状態値はmetadataから導出し、単独code spanの`implemented`、`tested`、`operational`を過大状態語として拒否する。
atom無損失被覆で使うconnectiveは短い許可語だけに限定し、意味句をconnectiveへ逃がさない。
