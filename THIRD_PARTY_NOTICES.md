# 第三者ソフトウェア通知

HELIX-HARNESS-LITEのprebuilt Node artifactは、manifestに束縛したsource HEADから生成します。
初期`consumer_core_v1`の実行bundleはHELIX first-party moduleとNode.js built-in moduleだけを含みます。
runtime third-party moduleが追加された場合、dependency closureとbundle metafileで検出し、本書へ名称・version・licenseを
追加するまでartifact candidateを拒否します。

Node.js、npm、Codex、Claude、GitHub Actionsは配布artifactへ同梱せず、それぞれの提供者のlicense／termsに従います。

## 現行開発repositoryの権利境界と棚卸し範囲

現行root [LICENSE](LICENSE)の全権利留保表示は、第三者素材・依存物・サービスの条件や、既に付与されたMITの許諾を置換しません。第三者の著作者名、元の許諾、必要な通知を保持します。利用者が作った成果物の権利をHELIXの使用だけでRetryYNへ移しません。

前節は旧HELIX-HARNESS-LITEのprebuilt配布に関する記述です。今回の開発repoの表示切替では、そのbuilder・runtimeを実行しておらず、現行bundleの依存閉包や同梱物を検証済みとはしていません。
archive内のLICENSE・package metadata・通知、source snapshot、過去の監査証拠は履歴として原形を保ちます。それらの旧MIT表示は現行独自資産全体への新たなMIT許諾ではありません。

全第三者資産・contributor権利の棚卸しは未完了です。本書を完全な第三者通知一覧とは扱いません。個別の再許諾根拠、通知の追加要否、モデル・データ・生成素材・外部サービスの条件は提供前の確認事項として残し、権利が不明な部分をRetryYN所有や有償で再許諾可能とみなしません。
