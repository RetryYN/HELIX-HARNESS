# HELIX-HARNESS-LITE来歴

配布artifactの正本はHELIX-HARNESS development repositoryです。各manifestはsource HEAD、requirements version／digest、
`consumer_core_v1`のprofile version／digest、package version、artifact exact set／digest、prebuilt Node artifact digestを記録し、
tarball／checksum digestを保持します。

手編集したarchive、manifest外file、digest drift、旧`HELIX-HARNESS-OS` identityをcurrent provenanceとして受理しません。
canary、preview、stableは同一artifact digestだけを一方向にpromotionします。
