# Stage 2a/2c 要件意味監査（read-only）

- 監査対象の現行本文tree: `786ee7c85c5454e3b2314c1d8ee3ca28f5178db1`（2026-10-08指定main）
- 固定L2/L11採択本文: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 作業範囲: HARNESS Stage 2a parent022、HARNESS Stage 2c parents030/031/032、CONNECT Stage 2a parent006。本文編集・旧runtime/test/CLI実行なし。
- 作業checkoutは`fa642cddc3c4446e3635f1c6badd90209862cfac` detachedかつclean。参照はすべて指定commitの`git show`。

## 初回結論

指定した親・6文書の対象節を相互照合した範囲では、固定L2/L11に反する要求atom欠落、誤owner、normal/negative oracleの偽成功、根拠のない技術閾値は特定できなかった。これは「意味完了」や下流consumer全体の監査完了を意味しない。各scopeの本文を下記に示す。

| Scope | 固定L2/L11 | L3 3文書 | L10 3文書 | 直接見た主な意味境界 |
|---|---|---|---|---|
| HARNESS-022 | L2 `product-requirements.md:447-461`; L11 `product-acceptance.md:298-304`（022）と`:317-325`（stage別oracle/拒否例） | BR `business-requirements.md:38-44`; FR `functional-requirements.md:204-235`; NFR `nfr-grade.md:74-80` | BV `business-verification.md:24-29`; FV `functional-verification.md:103-116`; NFV `nfr-verification.md:45-51` | Provisional→Integrated→Verified→Accepted分離、L8/L9・L10・L11条件、system固有delta、quality未評価、利用者記録、CORE/OS/利用者境界、外部artifact、④非依存、NFR trace完全性と品質判定の分離。
| HARNESS-030 | L2 `product-requirements.md:607-625`; L11 `product-acceptance.md:408-414` | BR `business-requirements.md:45-55`; FR `functional-requirements.md:236-257`; NFR `nfr-grade.md:81-87` | BV `business-verification.md:27-29`; FV `functional-verification.md:117-127`; NFV `nfr-verification.md:52-58,62` | CORE owner、approved L3/014 design/022 oracle、permission/source/schema、doubleの非実行、未選択source保持、candidateと実行/承認の分離。
| HARNESS-031 | L2 `product-requirements.md:627-645`; L11 `product-acceptance.md:416-422` | BR `business-requirements.md:45-55`; FR `functional-requirements.md:258-273`; NFR `nfr-grade.md:81-88` | BV `business-verification.md:27-29`; FV `functional-verification.md:128-133,141`; NFV `nfr-verification.md:52-60,62` | 共通部品owner、許可された開発/refactor/incident input、sanitization・original failure保持、同一oracleのstep receipt、修正後pass非前提、032/選択executor分担。
| HARNESS-032 | L2 `product-requirements.md:647-663`; L11 `product-acceptance.md:424-430` | BR `business-requirements.md:45-55`; FR `functional-requirements.md:274-290`; NFR `nfr-grade.md:81-89` | BV `business-verification.md:27-29`; FV `functional-verification.md:134-141`; NFV `nfr-verification.md:52-62` | COREの業務packet接続とCONNECT transportの分離、初回handoff前receipt不要、選択consumerだけ、binding単独negative、execution/resultをOS-020または利用者CIに残す。
| CONNECT-006 | L2 `connect-requirements.md:115-124`; L11 `connect-acceptance.md:68-70` | BR `business-requirements.md:10-12`; FR `functional-requirements.md:126-161`; NFR `nfr-grade.md:19-25` | BV `business-verification.md:8-10`; FV `functional-verification.md:79-121`; NFV `nfr-verification.md:14-20` | 4型の片側交換、固定側不変、current compatibility照合、通信停止、未完operation/ACK/attempt/expiry保持、authority停止位置、owner分離、business success非生成。

## 実際に確認した旧source起点

- L3工程のFR+ACおよび対のverification構造: `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-168`（特に148-162）。旧G3/freeze/role/旧L10-UX表記を現行へ誤継承しないことと、ACなしで旧G3を通さない原則を読んだ。
- HARNESS-022の形式起点: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:134-160,174-197`、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32-45`。FR/AC traceとnormal/negative/unknown試験設計の形式を確認。旧51/102件・G3・HAT/L12を現行要求数/受入ownerへ持ち込む主張は確認されなかった。
- HARNESS-030の旧FR-02/03: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:95-148`、対表`archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md:57-63`。旧TDD順序・4 artifact/12 edge/CLI semanticsは固定030そのものと同一ではなく、現行本文はtrace/fixture形だけを再導出し件数・実行を置換している。
- HARNESS-031: 同旧functional requirements`:454-477`（production incident専用の旧FR-16）と`:574-612`（旧FR-25 refactor/coverage等）、旧AT`:102-107,121-126`を確認。現行固定031のdevelopment/refactor failureまでをproduction限定に縮めず、旧severity/time/coverage閾値と実行を継承していない。
- HARNESS-032: 同旧functional requirements`:478-501`（CI/PR FR-17）・旧AT`:105-107`と`archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L8-integration-test-design.md:122-136`（fixture/negative境界）を確認。旧CI workflow/runを実行せず、固定032のpacket/handoff ownerへ読み替えていない。
- CONNECT-006の形式起点: 同旧L3工程`:148-168`。隣接資産TERは`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md:32-36,52-66`と`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/technology-environment-reconciliation-acceptance.md:18-35`を確認した。TERは外部技術reconciliationでありCONNECT片側交換の完全一致sourceではない。CONNECT本文が明記する類例として、distribution L3 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md:68-99`とsystem test `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md:34-47`を読んだ。これはartifact/consumer境界やfixture形式の類例で、CONNECTの交換契約・release authorityへは昇格させていない。共通test形式は旧`L3-pillar-acceptance-test-design.md:32-45`も読んだ。
- legacy asset path/id照合: `docs/governance/legacy-asset-disposition.jsonl:444,487,2536,2806,2847`でdistribution/TER/test asset IDとsource pathを確認。台帳はlocator確認に限り、意味根拠は上のsource本文から読んだ。

## Scope内でfindingにならなかった理由

- HARNESS-022のL3とL10は、固定親が要求するstage別状態・oracle/scope/evidence、利用者record別管理、外部artifactの同revision/scope bindingを明示し、normal fixtureと独立negativeで対応している。trace完全性NFRも品質達成の閾値へ読み替えず、品質oracle未達の分離fixtureを持つ。
- HARNESS-030/031/032では、normal例が固定親/選択source/oracleに束縛され、未定義期待値・permission・boundaryを作らない制約とmissing/unknown単独変異がある。031は修正後passをcandidate前提にせず、032は初回handoff receiptを要求せず、実行責務を選択executorに残す。
- CONNECT-006は固定側を保持し、L11の4交換型と異常条件を4×5に分け、現行再照合なしのsend/retryを抑止し、未完義務とowner区分を維持する。NFRの4/4・20/20・attempt 0はL2/L11の列挙条件と停止条件から測定値化しており、共通latency/compatibility range閾値は追加していない。

## 未確認・限界

- L4/L5/L8/L9詳細設計・consumer、OS-020具体runtime/契約、SECURITY側の対応scope、他機構の横断consumer、および本文外の全個別fixtureは監査していない。これらの意味閉包・適用実態は未確認。
- 指定scope以外のStage、他parent、PO事後確認、実装・実行・L10実績、L3承認状態は判定していない。
- CONNECT旧asset群に直接一致する旧片側交換要件は本文自身が未発見としている。今回読んだTER/distribution素材は隣接例で、直接同義の旧source不存在を独立に全archive探索して確定したわけではない。
- archiveの旧test designは参照のみ。コマンド、test、runtime、CIは実行していない。

追加で読んだ旧source: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md:37-90`（identity/telemetry/verification responsibility/plan synthesis）と`archive/legacy-generation-2026-09-14/root/docs/archive/intake/development-investment-stage-directives-source_v1.0.md:982-1026`（INV-028 bounded/sanitized failure replayと副作用抑止、INV-029 independent oracle/self-confirmation禁止）を読んだ。ここでも現行030/031が旧CI runtimeやINVのKPI/実行条件を移したとは確認されず、現行L2-030/031の許可・oracle境界を再導出する根拠として扱っている。
