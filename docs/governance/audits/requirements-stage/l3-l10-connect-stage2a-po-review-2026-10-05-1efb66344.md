# HELIX-CONNECT Stage 2a L3/L10の確認要約

状態: 起草候補。独立review・PO承認待ち。対象は採択済み `HELIXCONNECT-L2-006`（1.0）のみ。

## 何を満たすか

接続の片側の機構本体、またはadapter/transportを交換するとき、交換しない側を変えずに互換性を照合します。互換する組合せだけ同じ接続契約で通信し、非互換・未登録・意味変更・unknown・staleでは通信を止めます。交換前から残る操作のACK・attempt・期限・未完義務を交換後にも保持します。技術receiptから業務完了や許可を生成しません。

L3の4受入条件にL10の5caseを対応させました。送信側/受信側それぞれの本体/adapterという4型、各型の5失敗区分の計20fixture、未見の互換内正常例で確かめる設計です。実行結果ではありません。

## 候補値と根拠

4型すべての照合、固定側変更0、非互換時の送信/再送0、未完義務の欠落0は、固定L2/L11の列挙と保持・停止条件を測る候補です。交換後に互換性の失敗を検出する経路を保持し、交換開始前の停止は該当する既存許可の不足へ限定しました。親が数値を定めない共通transport閾値は追加していません。

## 上流と旧HELIXの対応

親の意味・scope・owner・版を変更していません。既存Stage 1の承認済み6文書はbyte-prefixで不変です。旧L3のFR+ACと対の検証形式を起点とし、旧TER・distributionのrevision/証拠/境界は隣接類例として限定的に再導出しました。直接の旧CONNECT片側交換L3は指定した旧L3探索範囲では未発見です。旧runtime・test・CI・Bunを実行していません。

## 対象revisionと検証証拠

本文revision: `1efb663447a95b8947b3fc960542d92c29a81714`。親はPO記録が固定した `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL2/L11およびmain `633bf12ea8f948db8ba3d6600179c4a9507377a7` の採択行です。

| 対象文書 | SHA-256 |
|---|---|
| `docs/helix-connect/L3-requirements/functional-requirements.md` | `6b2b5718b6ac5fa15d0037dc5ca1cea8a36d46e89f23243ad9c1dd490aeda4bf` |
| `docs/helix-connect/L3-requirements/business-requirements.md` | `b91e6ba4d37f515ce0e99ebd7de0605a73eccc406d45fb47fd5f656418341829` |
| `docs/helix-connect/L3-requirements/nfr-grade.md` | `a157d7188f306a2424b6521be3845c0e2c011f8cc2c1d01253712bcbd71a792a` |
| `docs/helix-connect/L10-verification/functional-verification.md` | `f6139e6b277a7d5994c0806bf09949846275ab55bee5dc3ab1a77777fc55838b` |
| `docs/helix-connect/L10-verification/business-verification.md` | `cbe7776259524b7490aa7b9925614e394531a3b163d3909bbc6d6bd16acec387` |
| `docs/helix-connect/L10-verification/nfr-verification.md` | `5039c2441663001907a97fde79fe0ebe5368bdaab5cc4757c4ea0f5e35ddc75a` |

[静的監査](l3-l10-connect-stage2a-static-validation-2026-10-05-1efb66344.json)のSHA-256: `809c7274af2bb73d8ad581c1a8b506c4f2aadc3d99c40780e8a6a5a7c2633dd2`。6文書の全文/追補/Stage 1 prefix、固定親、既存Stage 1依存、旧sourceの全文/raw spanを再計算して一致しました。scfctl 147件fail0・stale0、govcheck、diff-checkは通過しました。

## 残る確認

独立reviewとこのrevisionへのPO承認は未成立です。旧一括候補からの `C13-M12-audit-record-correction-cross-check` と `C13-U-all-crosswalk-and-legacy` は、今回の再照合を独立review済みとせず持ち越します。方式・効果の実測は下流へ残ります。本要約と静的合格から承認・merge admission・実装許可を生成しません。
