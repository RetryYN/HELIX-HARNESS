# PR: 旧research asset 57件を四製品責務候補として仮登録する

`docs/research/assets/**` 配下の未研究57件について、固定BASE `a577a7cddd1405de27bf01d22b050eb2acaa9ba9` のdisposition、phase bootstrap、archive source object、MANIFESTを照合し、研究候補を `SCF-B-0142` として仮登録する。対象ID／path集合は `inventory.json` に固定し、正式product、phase、implementation、successor authorityは付与しない。

分類はpath groupに基づく機械的な候補整理であり、個別sourceのsemantic spanを確定しない。source excerptは先頭8行の機械抽出と明記する。fixture3-notes原文が説明する平日のstaging deploy、smoke suite gate、health check連続失敗時のon-call通知は、HELIX-OSのproject/CI運用とHELIX-Web-OSのservice配備/監視のどちらか特定できない。4製品責務境界を比較し、bootstrapの両候補列挙とsmoke path groupのOS示唆を別証拠としてcounterevidenceに記録する。

main 609件と、依頼時点の#2097 HEAD `d233e6e99f705439043a07f0a96bdd9e535a288a` の固定snapshot 8件を、asset ID／source path／source SHA-256／identity tripleで照合した。#2094 HEAD `862060c0` はmainへ統合済みのためmain corpusに一度だけ含む。対象57件との重複、#2097との重複はいずれも0件。投影unionは674 ID/path/identity records、669 distinct source SHA-256。

`research-union-snapshot.json` は比較対象JSONLのGit blob・byte数・SHA-256・identity tupleを固定し、Git objectが利用可能な場合は実byteとの一致を検査する。比較対象が利用できない／異なる場合はsnapshot上の記録を根拠にstaleをfail-closeする。#2097の将来HEADには自動追随しない。

検証済み: independent source audit、deterministic generate、validator、38 negative cases、py_compile、`scfctl validate`（136 bindings、fail=0）、`stale=0`、`residuals=0`、`git diff --check`。旧archive runtime／test／CIは実行しない。
