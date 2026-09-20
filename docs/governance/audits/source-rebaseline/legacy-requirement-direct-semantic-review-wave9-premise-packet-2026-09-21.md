---
title: "旧要求・旧asset直接semantic review wave 9 premise packet"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
parent_revision: 0e6c6f8346a1381972b4a8d0b1edf33b0b328389
pr_class: research_premise
---

# wave 9 premise packet

Wave 9はHELIX-OSの`IRUNIT-HIL-FR-60-HELIX-OS`、`IRUNIT-HIL-FR-61-HELIX-OS`、
`IRUNIT-HIL-FR-62-HELIX-OS`を対象とする。要求契約は3 unitとも直接正本snapshot
`LEGACY-ASSET-A60CF91DD2AF6693E6F9`に固定し、design/implementationの対応assetはFR-60の
`LEGACY-ASSET-A642730A06BD1F95BF41`、`LEGACY-ASSET-C7235C17F972EC7A663A`、FR-61の
`LEGACY-ASSET-E6F2B47DE3B426527636`、`LEGACY-ASSET-D390493C08A4F62A178C`、FR-62の
`LEGACY-ASSET-FF974AF822E918BBF446`、`LEGACY-ASSET-BF2D3287A89CD8C5877D`とする。

直接照合は9 edge、`confirmed` 3、`unresolved` 6、`rejected` 0である。要求edgeはcontract-onlyで、designとimplementationは
全てpartial/unexecutedのunresolvedとする。FR-61は候補runtimeごとの事前bench、FR-62はHELIX実taskのscorecardであり、
両者の測定対象を混同しない。consumer closure、旧実行、現行replacement、product boundaryの人間判断は保留し、
`new_build_allowed:false`を維持する。

prior wave 1〜8を入力にし、累積は26 unit、78 edge、残り192 unitである。archiveは静的参照のみで、runtime、test、hook、CI、
adapterの実行はしない。候補poolのmembershipからsemantic linkを生成しない。
