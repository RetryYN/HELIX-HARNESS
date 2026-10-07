# LABO Stage 5 059/067 revision-owner・CASE index補正

- 基点main: `e028e18c90e83295c84d77c4829702a349bce0dc`
- Branch: `codex/labo-stage5-059-067-repair`
- 対象: LABO Stage5 parent059のrevision不一致CASEと、parent067のCASE-39索引同期。
- authority effect: none。L2/L11、PO判断記録、旧判断記録は変更しない。
- 変更前にAGENTS.md、CLAUDE.md、新世代作業入口、L3/L10著述規則、固定親、対象本文、旧sourceを読み、個別fixtureを実行していない。

## 起点と根拠

固定059は`f6dad2a33e24f000b87d7f09b8d40288257e74cc`のL2:416–429/L11:170–176、固定067は`318ec4a04abb3c1cc17111b3d939f913facd5fd3`のL2:529–540/L11:269–277。full file SHAとraw-LF span SHAはJSONに記録した。

059はtask/source、requirement/acceptance/oracleの各revisionを保持する。固定L2:429の戻し先ではtask/scope等のsource欠落とquality/acceptance oracle不明を別の既存責務区分に置く。旧sourceの`LEGACY-ASSET-28FB139B26CD61CC51EE` `helix-bench-evaluation.md:76–94`とpaired consumer `helix-bench-evaluation-acceptance.md:30–40`を実読した。R-03はteam compositionとharness profileを分離し、実runのruntime/model/effort/roleをversion付きで記録するが、現行のtask revisionとrequirement/acceptance revisionのowner routeは定義しないため、固定L2/L11の責務を起点に区分した。

067の旧sourceは`LEGACY-ASSET-3A15E5645D2D2A59DFF5` `execution-ticket-requirements.md:399`。first-eligible境界と同一Attempt repair-round可視性の範囲を保持し、CASE-39の既存費用定義境界は固定L2-059からの参照として維持した。

直前read-only監査（対象37a8283）の再現可能な証拠SHAはJSONに記録。旧audit本文は変更していない。

## 修正

- 旧IDの059 CASE-14はtask/source revisionだけを選択scopeの期待版と不一致にし、comparisonを混ぜず未評価/比較不能にする。戻し先は既存OSまたは観測source。個別source/owner identity不明はunknownとする。
- 新CASE-71はrequirement/acceptance oracle revisionだけを不一致にする独立fixture。期待oracleは比較分離・未評価/比較不能、戻し先は既存HARNESS/要求owner。個別identity不明はunknownとする。
- FR-059 AC-03とtrace table、NFR-grade/NFRVの定義数・分類・参照を同期した。CASE-14と71は既存version保持条件をfield別に検証する。定義83→84、独立fixture 77→78。既存CASE、compound、indexの意味と閾値は変えていない。
- 067のBR/BV/NFR-grade/NFRV索引とFV分類文をCASE-24–39へ同期。FVのCASE-39 fixture本文は変更していない。

## 六本文SHA-256

| 文書 | path | 変更前（base e028e18） | 変更後 |
|---|---|---|---|
| BR | `docs/helix-labo/L3-requirements/business-requirements.md` | `7908f4f075e3aa4514656a1f5e65ddfced120f6800fc9372fd9a6f673c28e99a` | `00a8a6f380b6cabe7e6fe5e5addac7aca71a81eb4fc784df5654153c960484d8` |
| FR | `docs/helix-labo/L3-requirements/functional-requirements.md` | `5a97eef5d322f8b79d5bce433494c7ad1548fa1b6ef1eb27749882036f7afece` | `808808886ec910671ca1a67320c7563156abb29b28a1b93e19b15ab0c55b85e1` |
| NFR | `docs/helix-labo/L3-requirements/nfr-grade.md` | `343604239051cfc452d924688a98c15288b0e30f3e02492cda843269bbf58b4b` | `c787fbe5569f6aa3e04de79299ffbe4b7fdd17588cd37c5fc15fa9550326856f` |
| BV | `docs/helix-labo/L10-verification/business-verification.md` | `2a8486d6ce980a934ece785b0d6670f0dc308da36ebe100aaeb099cac4cc5cac` | `d64886065f08b5b03c0940a3af30b71a65e2f9b6ec7868fff388539ff910f32f` |
| FV | `docs/helix-labo/L10-verification/functional-verification.md` | `5242a94fed5618792f7d2ecc8c1b6a13cf4788e79fb66b2e0b2312f34425a29e` | `9ea0bc55f0d555cb2b8481dedf2b891b9efdee7e3433829d9e1013d214661ce6` |
| NFRV | `docs/helix-labo/L10-verification/nfr-verification.md` | `2983f735ae142e126946039b195a0be483b476ffa35ef5cffee976d9f299146a` | `038bd1f7a995b3c61008693f6b7ae6369cb1b2399ea192420419e08a9174a623` |

## 検証

静的検証では、対象revisionの不一致CASEが別ID・別owner classに分かれたこと、059定義数・独立fixture数・CASE範囲が6本文間で一致すること、067のCASE-39 indexが五つの表示箇所で同期することを確認する。`git diff --check`とCASE14/71分離・59件数・067索引・既存CASE-39不変の静的確認はPASSで、結果をJSONへ記録した。旧runtime/CI/CASE実行は行わない。

この記録は修正根拠と本文SHAを示すもので、L3承認、L10実行、実測、完了やmerge admissionを生成しない。
