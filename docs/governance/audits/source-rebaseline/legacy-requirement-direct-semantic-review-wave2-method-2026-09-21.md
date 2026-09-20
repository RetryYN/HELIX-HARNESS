---
title: "旧要求・旧asset直接semantic review wave 2方法"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 2方法

## 対象と目的

wave 1の判定軸を継承し、製品別要求unitと旧assetを一辺ずつ全文照合する。wave 2は`HIL-FR-06`をHELIX-HARNESSとHELIX-OSへ分けた2 unit、および`HIL-BR-12`のHELIX-OS unit、合計9 edgeを対象にする。同一旧要求を製品別unitへ分けた結果と、phase能力の実装状態が個別要求の実装状態を代替しないことを検査する。

対象は次の3 unitに固定する。

- `IRUNIT-HIL-FR-06-HELIX-HARNESS`: Scope Gateの契約、derivation guard、violation outputを含むHARNESS責務。
- `IRUNIT-HIL-FR-06-HELIX-OS`: scope authority、diff trace、子Issue継承を持つOS責務。
- `IRUNIT-HIL-BR-12-HELIX-OS`: GitHub Issue／PR／CI eventとユーザー差し込みIssue／PLANを同一intake契約へ正規化するOS責務。

## 判定規則

`confirmed`、`rejected`、`unresolved`の意味、引用digest、atom binding、consumer closure、現行状態、new build境界はwave 1方法を継承する。wave 2はschema revision 4とし、設計が記述する契約の部分対応を`design_contract_evidence`で明示する。このrelationは設計をimplementation sourceに変えない。契約sourceの一致とimplementation sourceの一致を別集合で集計し、設計またはtest designの一致から実装被覆を生成しない。

`HIL-FR-06`の同一ID migration sourceは両製品unitの契約を逐語保持するため、各unitが保持したatomだけを契約confirmedにする。同じassetを2 unitでreviewしてもedge identityは`unit_candidate_id × asset_id`なので重複ではない。3共有spanはatomごとに`shared_with_units`と`product_boundary_pending_human_decision`を持ち、製品固有atomと分ける。共有契約の逐語被覆から製品owner確定を生成しない。全atomの`boundary_review_state`は既存語彙`product_boundary_pending_human_decision`を使い、shared／exclusiveのexact setで境界を区別する。製品候補がHELIX-OSだけの`requirement-discovery.ts`はhuman actor／agreement gateを持つ隣接実装だが、FR-06のどのatomにも直接対応しない。そのため両製品edgeはcovered atomなしの`rejected`とし、`adjacent_implementation_nonmatching`で単なる別機能との違いを保持する。このrelationは`implementation_source`の`rejected` edge専用とし、design、configuration、requirementに付与しない。

`HIL-BR-12`ではPHCAP-02の`legacy_capability_status`が`implemented_with_tests`でも、それを個別要求の実装済み判定に使わない。stable ID A01〜A06でGitHub Issue、GitHub PR、GitHub CI event、ユーザー差し込みIssue、ユーザー差し込みPLAN、同一intake契約への正規化をそれぞれ自立atomにし、区切りと接続だけを`connective_fragments`へ置く。A06はHARNESS unitとの共有接続条件であり、製品境界の人間decision待ちを保持する。`intake-contract-normalization.md`はA01、A02、A06へ部分一致するが、CI eventおよびユーザー差し込みIssue／PLANの全入力を閉じないため`unresolved`とする。`requirement-discovery-event-schema.json`は正規化後のevent schema、`requirement-intake-lifecycle.ts`はscreen台帳adapterのlifecycleであり、直接intake正規化edgeとして`rejected`とする。

coverage receiptは契約confirmed、設計partial、実装confirmed／unresolved／uncovered、設計・実装証拠なしを別exact setで持つ。`no_evidence_atom_ids`は要求原文の自己再掲を証拠と数えず、実装confirmed／unresolvedと設計partialだけを差し引く。`product_exclusive_atom_ids`、`shared_atom_ids`、製品境界状態もdecomposition正本から再計算する。

## 累積境界

wave 2 ledgerはwave 1を上書きしない。metadataはwave 1 ledger／metadataのdigest、累積unit数、累積edge数を持つ。verifierは両waveのedge集合が交差しないこと、今回3 unitの未review候補集合がcrosswalkのphase poolから今回edgeだけを除いたexact setであることを検査する。

本reviewから要求採否、phase採否、successor、正式L2／L11、設計freeze、旧asset再利用、実装開始を生成しない。archive内のruntime、test、hook、CI、adapterは実行しない。
