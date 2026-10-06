# LABO Stage 5 HELIXLABO-L2-061 作成側監査候補

- 対象revision: base `af93d1f171d994f9fae2e78026b39ac27f896f5c`、body `fb183fb0024747f17641cee660ed42dcedefa8fe`、PR #2629 Draft。本監査は作成側の時点記録。Root検収、独立review、L3承認、実測・実行は未成立。
- 6正本は各々base bytesを完全prefixとして保持。body SHA/byte count/suffix SHAと再現可能なgit revision/pathはJSONへ固定。
- 固定要求: PO採択source `318ec4a04abb3c1cc17111b3d939f913facd5fd3` のL2:457–469/L11:205–215。decision basis `c18969c73306f6ed4cc4b93249583cd7e5d9ff68`、corrected decision record、register metadata、latest mainは別役割で保持。registerから要求authorityを作らない。
- 旧source: Bench R-04/R-08 (`LEGACY-ASSET-28FB139B26CD61CC51EE`)をsnapshot/historyの意味再導出に使用。paired acceptance AC005/006/012/013 (`LEGACY-ASSET-A952A3A175EB82A4781B`)はconsumerとして区別。旧runtime/schema/test/CIはコピー・実行しない。詳細な旧source full/span pinはJSON。
- 旧a4の132 ID（130表行+normal bullet 2件）を全て保持。現行L10では同じ132 IDを132 table rowに整形し、物理形式の違いを分離。重複・削除・dangling CASE参照なし、表は4列。分類は作成側棚卸しで、独立fixture性や完全性の主張ではない。
- 主な補正: 03dを12/13の非独立索引へ。task/oracle owner・execution actorの責務区分を保ち、入力からspecific identityを識別できない場合はunknown。79は別run receipt/理由を保持。95はhidden digestだけunknownで既知適用性を維持。86のexact historical version fieldは未特定として残す。NFRは実測run母集団とCASE定義数を分離し、正常runも適用母集団に含める。
- Review05正式本文と方法通知commentはraw本文/UTF-8 SHA付きでJSONへ格納。方法通知を要求authority/独立review結果として扱わない。

JSON: `labo-stage5-parent061-authoring-audit-2026-10-06-fb183fb00.json`（SHA-256 `d4be18b91040690edcbcedb0070823a4f48f06c249274efe3b92ce39210aef85`）。Root静的再計算は313+82+2項目、不一致0。
