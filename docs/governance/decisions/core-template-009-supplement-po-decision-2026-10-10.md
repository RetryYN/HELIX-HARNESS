---
decision_record_id: HDEC-CORE-TEMPLATE-009-SUPPLEMENT-2026-10-10
decision_status: recorded
decider_role: PO
decided_at: 2026-10-10
recorded_at: 2026-10-10
authority_effect: effective_when_this_record_is_admitted_to_main
---

# CORE製品template適用009追補のPO判断

## 原文と固定対象

POは本Codex会話の質問票で「009追補を採用（推奨）」と回答した（原文）。質問は次の固定案を提示した。

> [固定案](https://github.com/RetryYN/HELIX-HARNESS/blob/db6fedb183ba041676defac677df77593c958b65/docs/governance/crosswalks/requirements-resolution-packet.md)のCOREAPPLY（HARNESS-L2-009追補と対L11）を採用しますか？選択templateのexact set・適用義務・不足/Backflow・意味変更の影響先を同じrevision/scopeへ結び、templateごとのN/A理由・判定者・対象revision・再評価条件を明示します。既決1.0は保持し、seed採用・OS記録の成立・L3再開は含みません。

- 提示commit: `db6fedb183ba041676defac677df77593c958b65`
- 提示JSON SHA-256: `351154881abb10033aec7dfaa1f690faf19205684e6846169025994ff6bc444d`
- 単位: COREAPPLY、既存`HARNESS-L2-009`の一identity追補、kind `unit`、既決`version_target: 1.0`保持
- 作業base: `4b0e151044352c373480a375f0e0475d1580b9fa`
- L2追補: `docs/helix-harness/L2-requirements/product-requirements.md#harness-l2-009`、節SHA-256 `8c5ac0bb8580044f1cc256eda103b79bc0e9d91416e70a535a12d08c6ae3100b`
- 対L11追補: `docs/helix-harness/L11-acceptance/product-acceptance.md#harness-l2-009`、節SHA-256 `70608d09ce23e6d67b8f34a4c6f68fb32334e0e483c422125f7b6fe093c842e5`
- 節digest規則: 新しい### HARNESS-L2-009追補見出しから次の見出しまたはEOFまで、末尾空白を除きUTF-8 LF一つで終える。既存009表/工程条件の採択は元decisionに保持する。
- 最新仮登録: `MPR-RC-HARNESS-L2-009-001`、[被覆receipt](../audits/requirement-registration/core-template-009-coverage-receipt-2026-10-10.json)。registerは`registered_proposal`／`authority_effect: none`のまま、採否は本固定対象のdecisionから読む。

## 採用する差分と保持

提示L2/対L11の追補を同じbytesで採用する。未採択候補metadataは提示時の固定bytesとして保持し、本decisionを対象revisionの採否根拠とする。既存009の採択内容・1.0指定は保持し、3kind固有義務、4Backflow候補、理由付き非適用、任意fallback拒否、局所影響/Unknown保持を再承認しない。

新しく束縛するのは、選択template exact setと各適用判定/義務/不足/影響先のidentity・版・要求revision・製品scope、およびtemplateごとのN/A理由・判定者・対象revision・再評価条件である。L2.5や性能/security限定文脈のN/A4属性を全templateの既存保証へ広げず、今回の差分として採用する。

BRAINは汎用意味契約とknowledge版/state、COREは製品適用/義務/質問/意味影響、OSは案件の選択・使用版/setの登録/運転を持つ。Python意味処理にDB/Git/GitHub write、割当、実行、認可を与えない。041のsource抽出、025/026の設計・oracle構成は別能力のまま保持する。

## 旧source、locatorと保留

旧asset `LEGACY-ASSET-4F5A1F0739EC1111D91D`のL4 `design-template-json-authority.md:36/37/58/81/86/91`から限定8literal facetを用い、5を追補へ保持、registry digest・具体式木・instanceまでのrevision digest一致の3を `MPR-SH-CORE-TEMPLATE-009-001`へ保留する。formal successor/旧source全移管/retireは生成しない。意味の再導出であり、旧runtime/test/CIは実行しない。

提示本文の旧source locator `38/39/42`は、本文で述べたregistry/evaluator/plannerの実際の行番号 `36/37/40`に対してずれていた。参照訂正は本decisionとreceiptの実source/行/hashで記録する。採択対象の本文bytes/digestと意味は変えず、旧schema/algorithm/runtimeの採用にも広げない。旧pair freeze・直接編集禁止の未移管は032のholdingにも引き続き残す。

## 未完範囲

最小seed set/26seed採否、OS案件exact set/event/評価母集団と未完義務受理、安全/資源/計測、内部更新/復旧・支援/改善循環の要求照合、parity/renderer/pair/portfolioの固有binding、他要求Issueを#2846ほかに保持する。本decisionからL3再開・承認、schema/algorithm確定、実装/CI/deploy/release許可、受入成功、Issue closeを生成しない。
