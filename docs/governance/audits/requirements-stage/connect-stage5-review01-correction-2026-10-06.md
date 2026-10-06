# CONNECT Stage 5 review01 補正記録

対象はPR #2615 の formal review comment `6002099800`（UTF-8 body SHA-256 `516a609015e8581c4fd77a9451fb669bab4973459f80d26884f9cb72f16d381f`）である。本文は `7449867a8464b8b57be0ee747d148607dca8de5b` に固定し、この追補記録は権限・承認・実行結果を生成しない。旧root draft auditは `a4f75eb7ae8cf0f550f495930173df186b9c7a1531d05a590d3db675d6322fae` として参照し、書き換えていない。独立再レビューは未実施で、候補補正の検収は継続中である。

M1ではL3 `CONNECT-AC-007-01/02`に辺単位のSECURITY許可識別子とdata-use識別子の別々の束縛、および送信結果と受信結果の個別traceを明示した。L10の正常CASE-007-01およびStage 5 fixture入力に同じ情報を置き、CASE-007-40を追加した。この反例ではe2のdata-use識別子だけが欠け、SECURITY許可と他入力は有効なままunknown/incomplete、送信・再送不可、識別子不足は当該識別子の宣言元source ownerへ戻る。NFR母集団と観測設計にも識別子・結果別の証跡を反映した。

m1ではCASE-007-21〜33の全入力をA→B→C→D、辺e1(A→B)/e2(B→C)/e3(C→D)へ揃えた。21〜28の各中間辺状態変異、29〜33の各出力欠落変異はそれぞれ個別の既存CASE IDに残している。m2では21〜28の戻し先から許可失効時のSECURITY routeを除き、失敗辺connection ownerと元機構/OSの既存業務判断・再計画ownerへ分けた。許可失効だけを変異するCASE-007-26にはSECURITYへの照合を維持した。

m3ではarchive旧文書の追加検索語 `partial`、`correlation`、`idempotency`、`saga`、`multi-hop` を記録した。2,479件のMarkdown系文書検索での一致数は順に411、94、196、1、0である。これは候補箇所の発見用であり、全一致を意味分類した結果ではない。具体的に読んだ2箇所は隣接比較だけで、直接CONNECT要件にはしない。

- `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md:28`（LEGACY-ASSET-170112AB2FA2FFDBFEE9、file SHA-256 `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4`、行SHA-256 `ff9d68f9d4d1932a835b68e52c00d67d3caf589e54d6ac026ef99fe2bb6b1493`）：部分成功のRecovery送付。CONNECT要件の直接根拠ではない。formal commentの短縮pathと異なる実在archive locatorを採った。
- `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/event-projection-checkpoint-replay.md:35`（LEGACY-ASSET-33C30050BD9B4A523E60、file SHA-256 `43cea6098e10bce5fe697ffaa08a9fd02b01d99a1b20dac071f49acfa761aa77`、行SHA-256 `d3c039223dbf971f937d0a0c286d1cd80c43c5b20968b3dc75fafc778a2737c5`）：`correlation_id`の説明。隣接比較に限る。

直接旧atomの既存記録は0件だが、追加語のhit総数やこれら2例から旧資料全体の意味的不在・網羅性は主張しない。固定L2/L11 span、6 canonical bytes/prefix、CASE-007-01/21〜33/40およびFR/AC/NFR変更行のraw-LF pinsは同梱JSONに収録した。6文書はbase `5acae384305b01d10e88eeb2e6406f847baf66df` のbytesを全てprefixとして保持している。表のCASE IDは01〜40の40件が一意で、各行は6列でAC参照が解決する静的照合を行った。legacy runtime/test/CIは起動していない。

**残る限界**：この記録はWorker作成補正であり独立reviewではない。L10を実行していない。追加語検索は件数集計と候補探索に限られ、archive内の全hitを意味レビューしたわけではない。