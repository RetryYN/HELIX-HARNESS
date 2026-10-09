# 要求整理のPO判断案

現在の対象baseは`1754ffdbd2a8a8e7b253aec8f73d73168fa1dc2b`。提案正本は[差分JSON](requirements-resolution-packet.json)、SHA-256 `6e341f01bde64097d9f16d23fca977ef44ee352c2f5649a5842e3d89c69cba2a`。canonical L2/L11とMPRは未変更。共有から採択・仮登録・実装許可を生成しない。

## 現在の判断単位

| 単位 | 対象 | 差分 |
|---|---|---|
| OSTRACE（#2846） | 既存HELIXOS-L2-002のproject template記録追補と対L11 | 候補/選択/使用set、各eventと義務/結果、評価入力の原記録集合・未観測範囲を要求revision/scopeへ結ぶ |

使用templateのexact set/版、適用から運用結果までの記録、fallback拒否、LABO評価とBRAIN採否の分離は既採択のまま保持する。差分は、各記録の細粒度の結合、CORE009の判定根拠/再評価条件への参照、評価に渡す範囲と欠落の追跡である。002の既存版と適用条件を変えず、新しいversion_targetを指定しない。

BRAINは汎用知識、COREは製品適用/義務/意味影響、OSは案件記録、LABOは評価を持つ。002の追補は005/024/048の接続やLABO評価方法・母集団・測定定義を置換せず、選択評価scopeと必要入力に基づく原記録を渡す。未観測を欠陥0にせず、結果receiptを初回記録の入力条件にしない。特定記録の不足を無関係な有効scopeの停止へ広げない。

対L11は、正常追跡、参照軸ごとの欠落/取り違え、N/A/Backflow/消込、旧新版と局所影響、評価対象の抽出/除外/未観測/重複、許可と未見projectの例を照合する。field存在や集合件数だけで合格にしない。wire/API/enum/schema/計測値/algorithmは固定しない。

親は9/28固定OS-L1-002/007/008（`f6dad2a33e24f000b87d7f09b8d40288257e74cc`）。旧L4 `design-template-json-authority.md:24/36/47–58/83–92`、旧柱要求54/56/58と対system oracle18–25を起点に意味を再導出する。旧sourceに追補条件全体が既定だったとはせず、旧DB/runtime/型/層を移植しない。source全移管/formal successorを主張しない。

## 残る範囲

最小seed set/26seed採否、接続/未完義務の成立確認、安全/資源/計測、内部更新/復旧・支援/改善循環、LABO評価/BRAIN採否、parity/renderer/pair/portfolioのbindingとschema/runtimeは#2846ほかに残る。この追補の採用だけで本Issueや要求段階を閉じず、L3再開を生成しない。

## 既決packetの保全

COREAPPLYの009追補は[10/10判断記録](../decisions/core-template-009-supplement-po-decision-2026-10-10.md)に従いPR #2853で採用反映済み。前packet objectをJSONの`resolved_packet.packet`へ完全一致で保持する。内包する032・JSONAUTH/TDDORDER/VERSIONJOINの固定案も変更しない。過去の判断は固定commitとdigestで読み、再承認・再適用を求めない。
