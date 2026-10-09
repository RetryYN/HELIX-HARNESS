---
decision_record_id: HDEC-SEEDFIRST-KNOWLEDGE-2026-10-10
decision_status: recorded
decider_role: PO
decided_at: 2026-10-10
recorded_at: 2026-10-10
authority_effect: effective_when_this_record_is_admitted_to_main
---

# SEEDFIRSTの限定知識内容のPO判断

## 原文と固定対象

POは本Codex会話の質問票で「限定した知識内容を採用（推奨）」と回答した（原文）。質問は次の固定案を提示した。

> [固定案](https://github.com/RetryYN/HELIX-HARNESS/blob/5b52bee6397125b8b9b8ca7f4a1b695605b0123e/docs/governance/crosswalks/requirements-resolution-packet.md)のSEEDFIRSTを採用しますか？非画面・技術的不確実性なしの要求／受入を対象に、共通証拠VT001・利用者受入VT102と、技法C01/C02/C08/C26の知識内容を採用する案です。全体の最小テンプレート集合、画面／PoC／他pair、正式schema・実装・L3再開は含みません。

- 提示commit: `5b52bee6397125b8b9b8ca7f4a1b695605b0123e`
- 提示JSON SHA-256: `c9926d8a9db74095b0792cb134ac59e6374519acf94e1a1045a29076e7d55897`
- 判断単位: SEEDFIRSTの非画面・技術的不確実性なしの要求／受入知識内容。新しい要求identity・版指定を追加しない。
- 作業base: `b313df4f33d4d27b15b9565a95ccb3fc5ba40af3`
- [BRAINの意味JSON](../../helix-brain/knowledge/requirements-acceptance-template-knowledge.json)、本文SHA-256 `8fb9dd2a7f4a90f3f941f36331f7418c55e1441763f8e84da709c9056c3c9e77`
- [採用範囲と抽出照合receipt](../audits/seedfirst-knowledge-adoption-receipt-2026-10-10.json)、意味payload SHA-256 `0afb4a628fbd34ca26715568298d9be0c56563ddf751c3a225541fae6e9a8ba8`。JSON化だけで採用とせず、本判断の範囲を根拠にする。

## 採用範囲と責務

固定案の`adoption_payload_scope`に従い、VT001とVT102のsemantic_descriptors、meaning_owner_boundary、proposed_scope、選択技法C01/C02/C08/C26の意味とselection_reasonを採用する。VT001の共通15field、VT102の固有5field、技法の12項目中cost/tools/helix_exampleを除いた9項目を原valueのままJSONへ抽出した。cost/tool/例値、source_sections全文と非選択scopeのsource記載は採用しない。source path/行/hashはprovenanceとして保持する。

各descriptorの全6pair等の原文参照やcandidate metadataは来歴を保持した値であり、今回のscopeを広げない。元seedの`0.1.0-seed-candidate`は元候補版として保持し、新しい知識版や正式schema版を発明しない。採用されたのはこの限定範囲の意味内容である。

BRAINは汎用の欄/技法意味と知識を持ち、COREは承認済みHARNESS契約を参照して製品への適用・義務を判断し、OSは案件値と証拠を記録する。人の合意/受入判断は人に保持する。Redは適用契約が要求する検証に限り、静的review・人の判断へ新しいRed実行義務を追加しない。未実行/unknownをN/Aやpassへ変換しない。

BRAIN配下へのJSON配置は既決の汎用知識ownerとJSON意味正本方針の反映であり、schema・型・operator・wire・registry・renderer・Python接続の設計ではない。既存L2/L11要求とMPRは不変。新しい要求意味や登録IDを生成しない。26seed原文とBindingを保全し、限定内容の採用から候補全体の正式化・retireを生成しない。

## 旧source対応

固定案のlegacy_sources 6件のasset ID/path/行/hashとlegacy_comparisonを意味JSONのprovenanceに同値保持する。旧JSON意味/説明分離、trace/欠落、検証義務の区別、人の受入とfeedback、未完義務・判定不能の保持を意味再導出する。旧schema/runtime/CLI/固定差戻しを移植せず、全旧sourceのformal successor・移管完了は主張しない。Red条件は固定案で明記した旧検証phase L28–34/73–79のunit/TDDと人間受入の区別を保持する。旧L4 `design-template-json-authority.md:19–46`のJSON意味と説明の分離は既決032/9月のowner判断に従う配置根拠であり、旧component/runtimeを実装しない。旧test/CI/runtimeは実行しない。

## 残件

全体の最小template集合、画面/PoC/他pair、unit/connection/compositeのseed比較、未選択候補とcardの採否/完全なsource意味対応、案件の実記録/合意/受入は#2846へ保持する。正式schema/runtime・実装・CI/deploy・L3再開、全要求ステージ完了、Issue closeは本判断に含まれない。過去の採用準備auditは当時の証拠として変更しない。
