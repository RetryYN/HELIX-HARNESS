---
title: "旧要求・旧asset直接semantic review wave 1状況"
status: candidate_incomplete
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 1状況

## 結果

218要求unitのうち2 unit、候補edge 6件を直接照合した。結果は`confirmed` 2、`rejected` 1、`unresolved` 3である。bootstrap crosswalkの候補membershipは変更せず、本ledgerを直接review overlayとして追加した。

| 製品 | unit | review結果 | 旧要求実装状態 | 現行状態 | 縮退判定 |
|---|---|---|---|---|---|
| HELIX-HARNESS | `IRUNIT-HIL-BR-01-HELIX-HARNESS` | contract一致1、非該当1、製品境界未解決1 | `unknown_pending_direct_implementation_and_consumer_review` | `not_established` | 旧実装自体が不明のため未判定 |
| HELIX-OS | `IRUNIT-HIL-FR-12-HELIX-OS` | guard部分一致1、drift fail-close未解決1、access enforcement未解決1 | `partial_static_implementation_evidence_unexecuted` | `not_established` | `degraded_from_partial_legacy_static_evidence_to_current_not_established` |

HARNESS側ではmigration source asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`が同一IDのBR-01原文を逐語保持する。ただし非実行の要求source snapshotであり、実装証拠には数えない。`requirement-authority.ts`はcanonical shadow promotionに限られBR-01へ非該当、`requirement-discovery.ts`はhuman L3 gateへ部分一致するがOS／Web-OS候補との製品境界が未解決である。

OS側では、旧sourceが次のatomを分担する。

- `agent-ssot-runtime-projection.ts`: 外部から渡されたgenerated content、source/generated digest、drift、user modification、findingsを持つread-only report。定義本文の生成は確認できず、user-modified driftはwarning＋skipなのでedgeは`unresolved`。
- `agent-guard.ts`: 未登録agent、missing model、model family override、Codex model／effort policy不一致をfail-closeするpure evaluator。
- `worker-context-packet.ts`: allowed／forbidden path、HEAD、authority、rule、role、task、payload digestをpacketへ封入し、path集合の衝突やdigest不一致を拒否する。ただし実worker accessの遮断consumerは未確認なのでedgeは`unresolved`。

3件ともarchive bytesとmanifestは一致した。直接部分実装証拠に数えたのはagent guard 1件である。旧source、hook、test、runtimeは実行していない。consumer refsはcatalog上空であり、空配列をclosureと解釈していない。

## atom coverage receipt

| unit | atom総数 | 契約confirmed | 実装confirmed | 実装unresolved | 実装未被覆 |
|---|---:|---:|---:|---:|---:|
| `IRUNIT-HIL-BR-01-HELIX-HARNESS` | 2 | 2 | 0 | 1 | 1 |
| `IRUNIT-HIL-FR-12-HELIX-OS` | 9 | 0 | 2 | 2 | 5 |

HARNESSの契約confirmed 2 atomは要求原文自身との一致であり、実装被覆へ算入しない。実装側ではhuman L3 gateがunresolved、無人完走が未被覆なので、完全被覆ではない。

OS unitで実装confirmedなのは「未登録agentをfail-closeする」「model/effort overrideをfail-closeする」。unresolvedは「手編集driftをfail-closeする」「forbidden pathをfail-closeする」。未被覆は責務主体「Agent Sync/Guard」、「Claude/Codex定義を生成する」「blind context漏洩をfail-closeする」「generated adapter」「drift/guard receipt」である。責務主体を含む全11 atomのsource fragment unionは対象要求spanを無損失に覆う。各exact setとdigestはmetadataへ固定した。

## 未実装・未確認の読み方

現行2 unitはいずれも`not_established`である。これは現行正式実装の成立証拠がない状態であり、bounded negative searchを終えた「不存在」の断定ではない。

旧HARNESS unitは契約だけが確認でき、実装sourceは未確定である。旧OS unitは静的な部分実装証拠を確認できたが、consumer、test／acceptance、動作、全atom closureがないため`implemented`ではない。phase候補も`candidate_unchanged`であり、本waveから採否を生成していない。

## 残る集合

対象2 unitのphase候補poolでは、review済み6 edgeを除き次が未reviewである。

| unit | 未review候補edge |
|---|---:|
| `IRUNIT-HIL-BR-01-HELIX-HARNESS` | 55 |
| `IRUNIT-HIL-FR-12-HELIX-OS` | 468 |

集合のexact digestはmetadataに固定し、verifierがcrosswalkから再計算する。残る216 unitは未着手であり、旧実装状態を変更していない。

## 成果物

- `legacy-requirement-direct-semantic-review-wave1.jsonl`: 6 unit×asset edgeの判定、引用、counterevidence、consumer状態。
- `legacy-requirement-direct-semantic-review-wave1.meta.json`: 親revision、入力／出力digest、対象exact set、未review集合、unit集計。
- `legacy-requirement-direct-semantic-review-wave1-method-2026-09-21.md`: review単位、三値判定、製品／phase／縮退規則。
- `legacy-requirement-direct-semantic-review-wave1-premise-packet-2026-09-21.md`: 一つの判断論点とknown／assumption／unknown／conflict／stale。
- `legacy-requirement-direct-semantic-review-wave1-review-response-2026-09-21.md`: exact HEAD reviewの全指摘と処分。
- `legacy-requirement-direct-semantic-review-wave1-review-response-round2-2026-09-21.md`: schema 3へ至る第2reviewの全指摘と処分。
- `verify_legacy_requirement_direct_semantic_review_wave1.py`: archiveを実行せず、入力・引用・集計・過大主張を独立検証する。

静的検証は`schema3 / 6 edges / 11 atoms verified`で合格した。既存の218 unit crosswalk、153要求からの218 unit分解、旧asset 4,020件分類もそれぞれ再検証した。semantic statusの不正昇格、consumer closureの偽装、引用digest改変、atomと無関係な正しいdigestの引用への差替え、coverage receipt消去、契約被覆からの実装完全被覆偽装を個別に欠陥注入し、いずれも新verifierが拒否することを確認してから元bytesへ戻した。

## 次の作業

次waveでは、今回の未review集合からconsumerとverificationを優先して照合し、候補pool外も要求語彙・symbol・call chainからbounded searchする。個別edgeの確認後も、unit全atom、consumer、acceptance、current差分が閉じるまで実装済みやnew build許可へ昇格しない。
