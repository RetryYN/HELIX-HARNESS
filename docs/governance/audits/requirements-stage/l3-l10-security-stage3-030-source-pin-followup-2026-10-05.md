# SECURITY Stage 3 030 旧source pin訂正の追補

- 対象本文: `95d7194ddeee444eae702557135ea3227ec40fba`。先行訂正record: `629f2bb7b3cf73cde49fe33c87964f954d86a0aa`。authority effectはnone。
- 旧immutable repair `58b1703a2a156cdf7af8a6f2c5571cc14a71f03c` は変更しない。旧recordが030 HR-NFR-P8-03/HAC-N8-03a,bへ結んでいたgovernance v1.3 path/lineの実bytesとraw-LF SHAは同名JSONの `superseded_incorrect_source_pins` に保存した。
- その場所の内容はrouting/manifestに関する記述だった。正しい意味sourceはasset `LEGACY-ASSET-EE5DBACC7F28F7D1F605` の `pillar-functional-requirements.md`。6fab:181,290–291、2d499:187,299–300を全file SHA・raw span SHA・原文で再照合した。旧pinは時点記録として残し、この追補で誤りと訂正を区別する。
- 独立review・PO判断は未了。pushなし。
