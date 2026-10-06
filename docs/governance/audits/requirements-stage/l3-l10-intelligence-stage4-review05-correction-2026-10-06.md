# INTELLIGENCE Stage 4 review05 correction audit

- 正式review: comment `6002191280`（Opus）, body SHA-256 `c2499e8c8ecd318fc44e5b4c8d27ebd400404d81c3edf7824654cf77b277a76e`。Major 2 / Minor 10。
- base `5acae384305b01d10e88eeb2e6406f847baf66df`、固定L2/L11 `633bf12ea8f948db8ba3d6600179c4a9507377a7`、修正本文 `73ddeff506d5133145bf9d77cf8bb71b8faefb8f`。
- 6 canonicalはmainの全bytes prefixを保持。機能CASE定義行を再収集し重複なし。
- この監査は作成側の修正候補を記録する。独立review、PO確認、承認、実行合格を生成しない。

## 所見ごとの修正記録
- **M1** — FR-INT-035 AC-02の対象範囲を02mまで拡張；CASE-INT-035-02mは他candidate入力を有効のままINTELLIGENCEがOS ticketを生成・発行する単独変異；oracleは生成・発行拒否、OS ticket authority維持、candidateをINTELLIGENCE ownerへ戻す；NFR/BR/BV/NV traceへCASE-INT-035-02mを追加
- **M2** — CASE-INT-033-02hのoracleはProduct Core意味変更の確定拒否、意味・正本不変、Product Core ownerへの返却を明記
- **m1** — AC-INT-017-03は4段階の有効な対応証拠と各authority確認時のみ統合完了；CASE-INT-017-03のO1/H1/P1/W1到着順正常fixtureで同一target/scope/source/revisionを照合するoracleへ完了条件を反映；CASE-INT-017-04aは他3段階有効のまま操作時SECURITY authority確認不能を単独化し該当段階のみ保留
- **m2** — FR-INT-017にSYN requirementとpaired acceptanceのasset ID、physical path、行範囲を記載
- **m3** — FR-INT-040のL11基本表locatorを96/105から96/103へ訂正
- **m4** — CASE-INT-037-04gは互換range未宣言だけ；CASE-INT-037-04hはrange宣言済み・Worker版compatibility値unknownだけ；FR/NFR/BR/BV/NV参照も04hを列挙
- **m5** — CASE-INT-039-02gと04eのoracleにOS acceptanceを成立させないと明記
- **m6** — FR-INT-036の旧source Markdown code spanを閉じ、security-capability-broker-acceptance.md:20–24を参照
- **m7** — FR-INT-036の旧SEC paired acceptance pinを001/002/005全行を含む20–24へ拡張
- **m8** — CASE-INT-045-03をNG/BR/BV/NFR crosswalkへ復帰；NFR分母外注記を02a、04a、未見identity 03で同期し、04bと直接route 02kの分母包含を維持
- **m9** — FR-INT-041 DAC/WCCおよびFR-INT-044 UWJ requirement/paired acceptanceにasset ID、physical path、行を記載
- **m10** — CASE-INT-045-02i/02j inputに有効なtarget identity/ownerの前提を明記

## 確認範囲と限界

- 固定親source pin: 21件。旧比較source span pin: 10件。変更行pin: 30件。Functional CASE定義pin: 599件。
- GitHub API formal comment bodyをUTF-8 bytesとして固定した。
- 6文書prefixと固定L2/L11の指定範囲を再計算した。列挙した旧source spanの趣旨を確認したが、旧source網羅検索はしていない。
- 旧CLI、hook、runtime、test、CI、Bunは起動していない。最新main統合後のstale検査も未実施。
