# Wave14 direct semantic review 方法（2026-09-21）

対象はcrosswalk順の3 unit、`IRUNIT-HIL-BR-05-HELIX-OS`、`IRUNIT-HIL-BR-06-HELIX-HARNESS`、`IRUNIT-HIL-BR-07-HELIX-OS`である。parent `b3e0b758725116e770a866e09067c6bd65023967`を固定し、Wave1〜13のunit、edge、design／plan／implementation assetとの重複を除外した。累計は41 unit／123 edge、残り177 unitである。

要求atomはcrosswalkのsource_text_spansを無損失に分解した。BR05は2 atom（Redesign route割当、再freeze後実装）をいずれもHARNESSと共有する。BR06は2 atom（gate chain、ready／implement／merge／close遷移禁止）をいずれもOSと共有する。BR07は2 atom（durable intake receipt、closure receiptなしcloseの拒否／reopen）をOS固有とした。shared／exclusive fragmentは助詞除去後の包含重複を拒否する。

BR06 decompositionのshared_source_overlapsは2 source spansの順序連結文字列1件であり、上流bootstrapを変更せず、receipt／verifierでcomposite overlapと2 shared atomをexact照合する。BR05は2 overlapを2 shared atomへ、BR07は0 overlapをsharedなしへexact照合する。

requirement edgeはA60 requirement assetの同一ID・semantic digest・source snapshotをcontract根拠としてconfirmedにする。design／plan／implementation edgeはarchiveのsourceを静的read-onlyで読み、候補membershipと意味evidenceを分離する。BR06 implementationはcatalog product candidatesが空のためclassification conflictとしてunresolvedに留める。implementation confirmedは生成しない。

選定assetはBR05 design `LEGACY-ASSET-3486C63C2FA7F3131BC4`／implementation `LEGACY-ASSET-466077EC93AB78271860`、BR06 plan `LEGACY-ASSET-232CF371CADA30110ABB`／implementation `LEGACY-ASSET-F4A843BC7BDF768E9968`、BR07 design `LEGACY-ASSET-4D2499F624A84EEAF937`／implementation `LEGACY-ASSET-A813B096E3205791EC07`である。archive内runtime、test、hook、CI、adapterは実行していない。
