# INFRA Stage2b旧記録の取得範囲追補

本文revision `b45edd1337e1e4bf8eecd74193fe4d791dd28cef` の公開監査に対する追補。旧記録は変更しない。

2026-10-05にGitHub API `GET /commits/{sha}` で元本文2件・監査2件を照会し、4件ともHTTP 422 `No commit found for SHA` を確認した。元commitは現時点でlocal Git object限定である。元本文6文書×2revisionの全文SHAとbyte数、元記録4件のcommit/path/fullSHAを[詳細JSON](l3-l10-infra-stage2b-history-availability-2026-10-05.json)へ固定した。

元監査・summary 4件は公開treeへ元blobのbytesのまま収載済み。過去本文そのものは複製せずgit revisionとSHAで辿る。これは出所の取得範囲の記録であり、独立review、L3承認、L10実行合格を生成しない。
