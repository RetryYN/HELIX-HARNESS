# 要求整理のPO判断案

現在の対象baseは`bf670396f21e5a9e6c072fa35ceeb29ccf964ecb`。提案正本は[差分JSON](requirements-resolution-packet.json)、SHA-256 `e70c26b8f127b924e4b9dfea34e8f01a9c620abd5783a63ad396c9b112b2d14a`。canonical L2/L11とMPRは未変更であり、提案の共有から採択・仮登録・実装許可を生成しない。

## 現在の判断単位

| 単位 | 対象 | 差分 |
|---|---|---|
| COREAPPLY（#2846） | 既存HARNESS-L2-009の製品template適用追補と対L11 | 適用exact set・判定/義務・不足/Backflow・旧新版の意味影響を同じrevision/scopeへ結ぶ |

既決の`version_target: 1.0`は保持する。別identityを増やさず、009の既採択意味、3kind固有義務、4Backflow候補、根拠付きN/A、任意fallback拒否、局所影響/Unknown保持を新規要求として再承認しない。差分は、それらを選択した各template版・対象要求・製品scope・元field/義務と影響先へ結ぶことである。

BRAINは032の汎用意味契約とknowledge版/state、COREは製品適用のset/義務/質問/意味影響、OSは案件の選択・使用set/版・記録/運転を持つ。Pythonの意味処理にDB/Git/GitHub write、割当、実行、認可を与えない。041のsource要素抽出、025/026の具体設計・oracle構成を置換しない。

対L11案は、正常、各入力axis欠落/別revision/別scope/duplicate、required/conditional/N/A/unresolved、4Backflow、定義欠落と値未決、意味変更とview更新・局所影響、未見domain/actorの例を照合する。候補set生成・受領・抽出成功から要求合意や設計成立を生成しない。schema/型/演算子/algorithm/通信/閾値は固定しない。

親は9/28の固定HARNESS-L1-009/004（`f6dad2a33e24f000b87d7f09b8d40288257e74cc`）。旧asset `LEGACY-ASSET-4F5A1F0739EC1111D91D`、L4 `design-template-json-authority.md:38/39/42/47–60/81–92`と旧CLAUDE49–63を起点に、意味を現行ownerへ再導出する。旧all/any/not/allowlist・layer・planner/cutover/runtimeは移植しない。source全体の移管やformal successorを主張しない。

## 残る範囲

最小seed set/26seed採否、OS project exact set/event/評価母集団、未完義務受理、安全/資源/計測、内部更新/復旧・支援/改善循環、parity/renderer/pair/portfolioのbindingとschema/runtimeは#2846ほかに残る。009追補の採用だけで本Issueや要求段階を閉じず、L3再開を生成しない。

## 既決packetの保全

TEMPLATECONTRACTの032は[10/10判断記録](../decisions/brain-template-contract-032-po-decision-2026-10-10.md)に従いPR #2851で採用反映済み。前packet objectをJSONの`resolved_packet.packet`へ完全一致で保つ。内包するJSONAUTH/TDDORDER/VERSIONJOINの固定案も変更しない。過去の判断対象は固定commitとdigestで読み、再承認・再適用を求めない。
