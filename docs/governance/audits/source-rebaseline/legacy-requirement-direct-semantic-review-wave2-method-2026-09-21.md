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

`HIL-FR-06`の同一ID migration sourceは両製品unitの契約を逐語保持するため、各unitが保持したatomだけを契約confirmedにする。同じassetを2 unitでreviewしてもedge identityは`unit_candidate_id × asset_id`なので重複ではない。製品候補がHELIX-OSだけのimplementation sourceをHARNESS実装へ昇格させない。

`HIL-BR-12`ではPHCAP-02の`legacy_capability_status`が`implemented_with_tests`でも、それを個別要求の実装済み判定に使わない。`intake-contract-normalization.md`はGitHub Issue／PRと共通Issue contractへ部分一致するが、CI eventおよびユーザー差し込みIssue／PLANの全入力を閉じないため`unresolved`とする。`requirement-discovery-event-schema.json`は正規化後のevent schema、`requirement-intake-lifecycle.ts`はscreen台帳adapterのlifecycleであり、直接intake正規化edgeとして`rejected`とする。

## 累積境界

wave 2 ledgerはwave 1を上書きしない。metadataはwave 1 ledger／metadataのdigest、累積unit数、累積edge数を持つ。verifierは両waveのedge集合が交差しないこと、今回3 unitの未review候補集合がcrosswalkのphase poolから今回edgeだけを除いたexact setであることを検査する。

本reviewから要求採否、phase採否、successor、正式L2／L11、設計freeze、旧asset再利用、実装開始を生成しない。archive内のruntime、test、hook、CI、adapterは実行しない。
