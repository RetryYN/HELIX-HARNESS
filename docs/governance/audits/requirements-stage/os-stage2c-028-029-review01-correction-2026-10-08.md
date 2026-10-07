# OS Stage 2c 028/029 review01 訂正追補

対象はPR #2688のreview01 comment `6046174165` と補記 `6046209966`、修正前HEAD `8634d28bf30f622a8733c4afe8ac19a1d95d8dad`、PR base `4084ab11560dc19e5c7bf74ae6df7adcd0e2e9c0`。本追補は既存時点監査を改稿せず、戻し先の誤記と追加指摘への対応を追記する。親は固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のみを用い、PO採択checkpointとは別に扱う。raw comment body SHA-256はJSONに記録した。

## 指摘と訂正

- **Major 1（08a–eの戻し先）**: 既存監査の「029にもsource ownerの戻し先がある」という説明は誤りだった。L2-029:876は提案/相談不足→INTELLIGENCE/OS、作業・scope→元Worker/OS、oracle/要求意味→HARNESS/要求owner、authority→SECURITY、環境/資源→INFRASTRUCTUREを定義し、source ownerを列挙しない。L2-028:860のsource owner routeは実consultを使わない029-08へ適用しない。08a/b/dは選択supportの使用を保留しINTELLIGENCE/OSへ、08cはsource-scope不足をINTELLIGENCE/OS、task-scope不一致を元Worker/OSへ、08eはSECURITY/OSへ戻す。単独変異、CASE-029-01正常基準、未完義務保持、OS-028 receipt不生成は維持する。
- **選択状態 missing/unknown**: NFR/NFRV 028/029で、source/supportの選択自体がmissing/unknownなら未選択として除外しない。missing/unknownとして別計数し、必要field欠落を完結分子へ数えない。明示的に未選択である正常経路のsource field免除は維持する。
- **CASE-028-03t**: provenance欠落時の期待に「当該支援をhold」を明記する。
- **CASE-028-03v**: source/利用許可の不足はsource owner/SECURITY、実resource制約はINFRASTRUCTURE、ticket/scope/authority stateはOSへ戻す。これはL2-028:852/860のカテゴリを同じCASEの対象別に明確化する。
- **FR-029段階別支援手法**: FR-OS-029とAC-OS-029-01へ、選択支援手法・consult・修正内容の段階別記録を同期する。これはL2-029:873を機能要件側にも示す。
- **NFR-028分子**: source選択時のprovenance/scope/constraintsを含む全必須field集合へ分子定義を拡張したことを明示する。分母（選択・認可済みconsult attempts）は変更しない。
- **過去監査のrepo固定**: 先行inventory auditをrepo内に複製した。コピーは元の`/tmp` MD/JSONとbyte-identicalで、SHA一致をJSONに固定した。既存の監査MD/JSONは書き換えない。

## 旧P2-04との対応

旧 `HR-FR-P2-04`（asset `LEGACY-ASSET-EE5DBACC7F28F7D1F605`、line 147）とpaired `HAT-P2-04`（`LEGACY-ASSET-44DD86E3DEC09E65EF51`、line 104）を読み直した。旧意味には、PLAN駆動、API/SDK前提なし、harness DB trace、simple-composableからeval green後にmulti-agent/long-running autonomyへ昇格、smart test/oracle author→light implementation→smart review/fix、consultation questionを応答までpendingに保つこと、difficulty別の固定最大修正cycleが含まれる。

現行では、支援前candidate→元Worker実作業→HARNESS oracle結果→独立review→必要な再作業という役割順序と、相談を選んだ場合の応答/return、未完状態保持を固定L2-028/029から再導出する。旧のPLAN/API前提、DB実装、eval-green昇格gate、difficulty別cycle上限、旧CLI/runtime/test assertionは現行固定親にないため持ち込まない。旧test-author/reviewerの同一側配置も現行の独立review条件に従って置換する。

## 固定pinと検証範囲

固定親L2/L11のfull/span SHA、6本文の前後full/span SHA、旧P2-04 source、review comment SHA、既存inventory auditの保全pinは同名JSONに記録した。BR/BVは不変、FR/NFR/FV/NFRVに限定差分がある。Stage 2c以外は対象外であり、fixture、旧runtime/CLI/test/CIは実行していない。これは修正案と静的証拠の追補で、L3承認、独立review、merge admissionを生成しない。
