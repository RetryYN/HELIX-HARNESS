# SECURITY Stage 4 境界補正時点記録

- 基準main: `29e814a92af2aa52afcbcdd60549b32a2448513a`
- 固定要求: `633bf12ea8f948db8ba3d6600179c4a9507377a7`
- 補正前本文: `87d16322001faa087715b65f0df3369b8aa69533`
- 補正本文commit: `8704e078995ae316b6fda05b358f84c20594f707`
- 対象: SECURITY Stage 4 のL2-024/026。承認・実装・実行・promotion・独立reviewは生成しない。

## 実施した補正

L2-024の「credential値を通常資源状態・backup・snapshotへ無条件に保存しない」と、L11-024の「通常資源状態・backup保存を不合格とする」を別のoracleとして明記しました。L11はsnapshotを列挙しないため、L2の限定語をsnapshotへの絶対禁止へ広げず、L2-005/008のcredential-use capability/authorityから保存許可も導かない形です。functional CASEを通常state、backup、snapshotの3件に分け、NFR候補/測定CASEへ同期しました。旧CAPの既定credential-access拒否を現行storage規則として持ち込まないことを旧source対応表に記録しました。

L2-026については、必要時のSecurity BotがINTELLIGENCEから発行され、目的とauthorityを限定したWorkerであって独立包括権限主体でないという境界をFR/ACへ明示しました。条件付き正常契約fixtureと発行元不一致・包括authorityの個別negativeを追加しました。Bot runtimeの実装・稼働は1.0で必須化せず、semantic exfiltration/probing実利用とruntimeは後続版のままです。

## 固定sourceと履歴

JSONに固定L2-024/026、L11-024/026、既存L2-005/008、PO行、旧CAP asset本文の実行なし参照span、asset ledger行のfull/raw-LF SHAとphysical boundsを収録しました。旧authoring audit/summaryは変更せず、対象revisionのSHAをこの追補へ記録しています。各canonicalの29e prefix SHA/byte数、補正後full SHA/byte数、変更行literalとraw-LF line SHAもJSONに収録しました。

## 確認結果

6 canonicalすべてで29e main本文全体をbyte-exact prefixとして保持。全document内74 CASE IDは一意、CASE→AC参照は解決し、変更対象4文書のMarkdown表列数を確認。Stage 4 suffixは5 FR/15 AC/49 CASE（親別: 021=7, 022=13, 023=8, 024=11, 026=10）。`scfctl validate`、`stale=0`、`residuals=0`、`govcheck atoms=7622 requirements=57 files=58`、`git diff --check` がPASSしました。

この作業は作成側補助検収であり独立reviewではありません。CASEは未実行の設計です。root最終意味検収は残っています。
