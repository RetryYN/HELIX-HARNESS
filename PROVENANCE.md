# HELIX-HARNESS-LITE provenance

配布artifactの正本はHELIX-HARNESS development repositoryです。各manifestはsource HEAD、requirements version／digest、
`consumer_core_v1` profile version／digest、package version、artifact exact set／digest、prebuilt Node artifact digest、
tarball／checksum digestを保持します。

手編集したarchive、manifest外file、digest drift、旧`HELIX-HARNESS-OS` identityをcurrent provenanceとして受理しません。
canary、preview、stableは同一artifact digestだけを一方向にpromotionします。
