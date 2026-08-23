# Third-party notices

HELIX-HARNESS-LITEのprebuilt Node artifactは、manifestに束縛したsource HEADから生成します。
初期`consumer_core_v1`の実行bundleはHELIX first-party moduleとNode.js built-in moduleだけを含みます。
runtime third-party moduleが追加された場合、dependency closureとbundle metafileで検出し、本書へ名称・version・licenseを
追加するまでartifact candidateを拒否します。

Node.js、npm、Codex、Claude、GitHub Actionsは配布artifactへ同梱せず、それぞれの提供者のlicense／termsに従います。
