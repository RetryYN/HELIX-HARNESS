# CONNECT Stage 1 L3／L10確認資料（未承認）

本文revision `3c4c85e5c8157cffee710a6d993fb722d810a647`、対象はCONNECT Stage 1の採択済み要求001〜005の5件、L3/L10の6文書です。[静的監査](l3-l10-connect-stage1-static-validation-2026-10-05-3c4c85e5c.json)をSHA-256 `15a1df06ff6b7038bf7eeadea98521669e02c7346b7234c1819ae0d75af3cba5` に固定しています。

この案は、接続相手と契約の版を識別し、互換性を確かめてから送受信し、失敗時には同じ内容の再送だけを契約上限内で行い、途中の状態と戻し先を追えるようにする要件・総合検証設計です。登録、技術送受信、再送、traceが成功しても、接続先の業務成功やSECURITYの許可を生成しません。

- 登録: 同じ端点を使う別接続は許し、衝突・欠落・不明な契約を利用可能にしない。
- 互換性: 参照照合に送信許可を事前要求せず、送信操作の適格性を判断するときだけ既存許可とdata-use条件を照合する。変更後は再照合まで送信0。
- 送受信: 接続・operation・版・scopeへ束縛し、契約外入力や違う版を正常受信にしない。
- 再送: 上限は接続契約の入力Nを使う。同じidentity・digestの重複効果は0、異digestは拒否。未完義務と試行数はoperation ownerへ、未完の業務結果は業務ownerへ返す。
- 追跡: 欠落・部分成功・unknownを成功へ丸めず、観測した端点と未完義務を残す。通常traceにはraw業務payload・secret・credential値を保存しない。

技術値は親にある境界と候補を分けています。上限Nは全接続共通の新値にせず、初回と追加retryを分け、N−1・N・N＋1の境界で照合します。latencyや保持期間が必要な接続では、根拠・比較・測定付き候補を扱い、未指定を達成扱いしません。parameterごとのPO判断は追加しません。

旧HELIXのFR＋AC、3 sub-doc、正常・個別negative・証拠の対を起点に、採択済みL2/L11から意味を再導出しています。旧配布契約は隣接比較で、旧release権限や実装を移しません。親の意味・scope・owner・1.0版を変える案ではありません。共通HARNESSは採択L2要求をfixtureに適用し、未承認L3候補を承認済み依存にはしません。

作成側の静的照合は6文書SHA、5固定親とPO対象行、5 FR／AC／CASE、6表、5相対リンク、13 source pinと42 current行pinです。L10は設計だけで未実行、独立レビューは未了です。#2564の指摘・未確認範囲を引き継ぎ、この5親の範囲で再レビューします。残り269親の成立は示しません。

POの「独立レビュー結果を見てから判断」に従い、対象HEADの結果を添えてからL3承認へ渡します。旧revisionへの判断は継承しません。

| 正本文書 | SHA-256 |
|---|---|
| `docs/helix-connect/L10-verification/business-verification.md` | `0ecd6905b16568d54f13ed3ae807eb588be3dfefaa41f9c2e3a6daf372b9e012` |
| `docs/helix-connect/L10-verification/functional-verification.md` | `527a9d6832d42d33229e7a2cb1b6df91b1b1bd65203b3d3a8fed1bdd78c8882c` |
| `docs/helix-connect/L10-verification/nfr-verification.md` | `41a6623b5c1a098617161276f04f109dd8eca3bc117e890f577e3a3dfea3926b` |
| `docs/helix-connect/L3-requirements/business-requirements.md` | `7cbbfe2095d182a1e4244255c8dc40d55fe3bc4692a6e62e417d749c677b7087` |
| `docs/helix-connect/L3-requirements/functional-requirements.md` | `02f19db5919bed55197289083cd78a0bcdaa79b61bbb37b1768d360034dac525` |
| `docs/helix-connect/L3-requirements/nfr-grade.md` | `b9352d3d12d35d45f2003219e987c00ba51d44c718966122a56c9bf371bf06f1` |
