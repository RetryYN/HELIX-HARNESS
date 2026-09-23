---
title: "旧IR製品scope候補の一括確認（例外除外115件）"
status: candidate_for_po_review
prepared_at: 2026-09-23
authority_effect: none
source_revision: 6271c0d80f0620a95254af5af70ed3a78318e06b
---

# 旧IR製品scope候補の一括確認

## 判断範囲

この一覧は旧Requirement IR 153件の既存四製品routing候補から、判断材料が明示された115件をまとめたPO確認用資料である。製品scopeだけを確認し、要求の採否、意味変更、successor、L2／L11、実装は決めない。
候補の製品名とroute型はrouting台帳の提案をそのまま示す。POの回答までは承認・確定を意味しない。
`HIL-BR-02`はmain上の[既存PO decision record](decisions/hil-br-02-product-scope-2026-09-23.md)でHELIX-OS単体unitとHR-FR-HIL-03のHARNESS↔OS接続候補の分離が決定済みである。再承認を求めない。

## 集合と計算

入力はsource revision `6271c0d80f0620a95254af5af70ed3a78318e06b`の153件。各IDについてrouting bootstrap、target routing queue、Requirements IRのIDを完全一致で照合した。例外集合は`unresolved_target` 18件と`human_decision_required` 23件の和集合で、共通3件（HIL-NFR-25、HIL-TR-02、HIL-TR-07）を重複除外し38件。残る153−38＝115件を下表へ載せる。
分類はbootstrapの`routing_candidate`と`candidate_product_targets`を集計した。153件全体では`single_product` 87件（OS 67、HARNESS 20）、`split_required` 65件（HARNESS＋OS）、`cross_product_connection` 1件（HARNESS＋OS）。4製品すべてが評価済みで、Web／Web-OS候補はない。
bootstrap全件の`authority_effect`は`none`。routingは候補であり、successor未割当のまま保持する。例外38件はscopeの一括既定へ混ぜず、下表でIDとqueue上の理由を示す。

## 115件のrouting候補

| Requirement ID | 原文digest（SHA-256） | Routing候補 | 対象製品 | 注記 |
|---|---|---|---|---|
| `HIL-BR-01` | `sha256:045567570721936eef9e431fb9bb2e61051f2b7332cca31cf1e750ac7971db85` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-BR-02` | `sha256:7fa42e4ad34404d9b69757fe10fb50b5bfb9766c10dcd297b3eb9ac1a0b608ad` | `single_product` | HELIX-OS | 既決定。再承認不要 |
| `HIL-BR-04` | `sha256:a92c409fb5da2522fa77bf9e59a20a782a3ecece5c33c0277f61fa8c059d1e42` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-BR-05` | `sha256:28a498afba5ee8a06d7a2d5277079b4f98db214464bcceed52a076027b2a12f0` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-BR-06` | `sha256:f6ab74819ca1f464427b18bdb8894155ad89739aaf7d042c4413cde07ee56523` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-BR-08` | `sha256:ad9e7abcc56fed1c2a450795c10ae69bc932bb4c7257b3dbf7195b641f6d99b4` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-BR-10` | `sha256:fe4cf7eb921fc0cf7017f690b8e9d2a52f5c1c342e9390805892bd3499a6d3cc` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-BR-11` | `sha256:edc9d4682e47c47a8f3fbfbd644ad25160be2f76df1e1c9a0d5a6d6f003398ff` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-BR-12` | `sha256:8db32d18ea7e86ae89ded3b6b16e871cd2a40e9e2dc9a01c06532955857f39e4` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-BR-13` | `sha256:6f646299f2f5dbee367cbd24fbe602871e140475f0e299224a2e1b97b8394e07` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-BR-14` | `sha256:917252a5fad425980897510684f7ca3053711fe8c0541da3cb2eb2c84873fe5c` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-BR-15` | `sha256:5f5450b0a801f1f4c6650a0b4ddb87d5eee23400f2126332ed0038ed06f01115` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-BR-16` | `sha256:8e9887486ff78af21e31dbed2c1c713928bc397fdfa50aa1703549511f9356df` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-BR-17` | `sha256:e55bdf0ac2daabc541038f11887fd2099993870993dc131097955ca9f817c1a1` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-BR-20` | `sha256:0ca36b9296e24ed2386ed4170647831649a51d83dbac8b2efb37d6c5048f131c` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-BR-22` | `sha256:24ce50660d20b2428339510ae9aa295ec5c905eaa95489c78e6b7af922eb180e` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-BR-24` | `sha256:9727fd0b427f18eb8b6839f2f2f97d1d13ed88059b0c05738b887ed127c9809d` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-BR-25` | `sha256:88a5d24aeea43da624d2906a94ab075ede9611451fcf3264abefa592655c454e` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-BR-27` | `sha256:514f5b65beee9eeb812dab45ef7665e514c11bbb549b102738338f097ca006e3` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-BR-28` | `sha256:d4e7f2d1a599e2d6e59fc913bfbe0d8006d6f60b251f02dd3b5c65c97025c653` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-BR-29` | `sha256:05eba9d85097424f46afa0356b747e930077ff8b31b8264784eb54af709dc148` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-BR-31` | `sha256:5de1a74038ae72cb30e6f61fa68bc6d3085dc88a57d6d1c778dc42c78aff7d20` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-BR-32` | `sha256:78f34c71dbf6c0d4ad87aaea5e2275eb3cc3401fd8fcf6c567000754603563ac` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-BR-33` | `sha256:758e2ea4f82c6c068d8c8ac633a7f092573c01c078a8293e81ded4bc70eaa5ef` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-02` | `sha256:022383e2542716540cf4fc42ef8d52b58606a03fdf50eb77de378a5d374236b7` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-03` | `sha256:be8c55e18f6bd462e31eb805edfa5dd4e378c69b86753b7a2cbfb143e6ab068c` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-FR-05` | `sha256:e547dbc9b001e344da3953e672675621d353d69137f1e69c2b548c8c232a163d` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-06` | `sha256:c0b849865dfce9615109e0be6c056ba548bcd5bc33c229abb50b8a7e669c300b` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-07` | `sha256:a79c1994beaedc462b691f9b398bdd0ef9d64fb3b49678b5617c96bfa85dbbb0` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-08` | `sha256:e0118fde6e7618d078d4eeb752a429a1618da24859d31be1b4b930ae168ccf05` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-09` | `sha256:5594aeaf9047a9dd14646c862da184acf810231d961af8cdadeebf2e54d407c3` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-12` | `sha256:1062a9d636d153e32adcf815decbdc36a3d954c566f41fdeeaddd2266604c136` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-13` | `sha256:8472fdc576a52718f2d43f49e410565600d8fc3c0b374110dfad8886e37ccb50` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-14` | `sha256:32c9cca689abf14f1a6dba50ff9144ff11791ba29f625b5eb1e4d41abeffff35` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-15` | `sha256:73dfa183c290d8b7f4e9698e5933b93c4643d9347a6ef8256cdb4c9d95a33ed0` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-16` | `sha256:3f8059576753f54ac5cbc51a29d19afcc1189f6aee6403196ff3ac7540b0c574` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-17` | `sha256:6c714b85354c436aadad677cb1a379eb4f0ba007f847eec60391618fb07573c7` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-18` | `sha256:113f62503959378764966ff837c8d5f4beffde5932618b47aee921e507535ab3` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-21` | `sha256:f25bd0492adc5256b7159de126ae2e70568b08d4bd420d640fa5bd804eddcb3c` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-22` | `sha256:9d401a7bd016ded7263eeb3c0546e1bcd15a7fb8acca13fd78bfabd2a80021ac` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-23` | `sha256:641f78a72962e9343b37991cb298f1e64e0630659c312dc62c5515db81f5f5eb` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-24` | `sha256:b021ff425efe0ba75863b33302ec3c41146b5c995ad9cfae41af926e80d152d2` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-25` | `sha256:36c4ed5dec52d986c2fb907a3a77990ba8c37ca9f758659ea629bc5ad1a657f5` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-26` | `sha256:76c13e750973dfd41c71441213ec6b6d17594a8639712557e88a04ecc9e914d4` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-28` | `sha256:b3a1b86046b81e9410004e3f0cfd5c9beb54f88269636a2c287facea182d7ebc` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-29` | `sha256:3d7362c048ba2b5b344ec3bba8846bc7c9ff89f918290278cb25480dc1292c0b` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-31` | `sha256:9982b94a7b289c1f852d5777f0cd06ee05058d272ef97d06bbc6c3acc720723d` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-32` | `sha256:cb12c2667ef17913c794742fa7602aa124852e6ee045b99cd037410fcf8349f6` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-35` | `sha256:bafd3fc712208ecdea2816ae95128150f13f1b918197c309dcb3acae78b013cd` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-36` | `sha256:5a16d19ff108c767c18eac0db68f6af2c3f5400cf751e8e5b9d920cb33a67435` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-37` | `sha256:34d1fde675a0d97523f479286326cfb162b2b897e5d76921a7dcae514bcb8482` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-38` | `sha256:1e9fcc442e00d47b8e3a876bb7eb139356f9447fbce661f77c6cd5c9cd6a870b` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-39` | `sha256:91cbf666593f3585f2d859baf3578b9075d7a92e9b3d936d2c9c4cd47b4f60fc` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-40` | `sha256:3465949f7d44977d31e9087cf0637261068640d74c72dd1ce5b271fc84378948` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-FR-41` | `sha256:aaddd9f6348808fe30657b87bdd014b99df774b3786d9502a7229e8b490008f7` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-FR-42` | `sha256:d6ac9d8a9b359a2a9860550bfcfdddac56f9414d9fc7483ac0566b76b4f36eda` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-43` | `sha256:e11d5d07d31444affd0213102ae60682f8777fde8f5e518e310b6b3cee842377` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-FR-44` | `sha256:49bee96c5bb5d35a05301d3c0c4c7c4f31eb842b5bad1d58028c4d0c72bdf4f6` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-45` | `sha256:e13451d529dd90b9d37e1b42eb180f20b183ec7b20f5ece2e6b8b02acdd7acda` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-46` | `sha256:0255c7c9107d749eee633f9b94612ee7da059e544021824a3fa65b299afae7b3` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-47` | `sha256:b1a61c1eb5f24a741168801fed3b323578151edabb2f62d1d47e239861dc1dca` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-FR-48` | `sha256:49d1f634eefe71ad7a79be172439935c1ba75c7bb889e05746c5c98fe28e9329` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-49` | `sha256:3a7cb511eea1c36e2c2453e2416c1e80de7926d7a6bafbeea6a7da577e47516b` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-50` | `sha256:e0796eda6bbf620164e2082b7fcb3798f0f333ed3f992df83fb7484f56a00fd2` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-51` | `sha256:45ecd93356f0be9761690994c8106e87d19e742f703f98d2966b6464f9f05459` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-FR-53` | `sha256:7a0b93ba3bbb00c4a5e02f9ff62505e09c6b12c5943cbfd65defdd4c5e664d45` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-54` | `sha256:1531ec84c2374a625e2d83e01b77513b0fc4cdcd963170fbc11148a9bdf5143a` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-FR-55` | `sha256:a79393484c93dc7d7f6c107b0781583e9648f79111cabc74cd8058c695fcb801` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-FR-56` | `sha256:50309a18a0fb01c0232964b13e339ff415ccc6a0d9c2472e279b393443b9e539` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-FR-57` | `sha256:58171916df9edf46974d0241fc75879809fb314dd78d4ab24448b73442120065` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-FR-58` | `sha256:1f3226818758cf15d8d60ffe6f435b6c8e524203664bb3414b2bfd61b10f41fe` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-59` | `sha256:62bab0d1ae5a31f495494d6a93047746ddb77d64e3830f194faeb9079f05289c` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-60` | `sha256:8a788e970942b14fe2881c7db110db17b639b07b8a22475c46adf48663523c96` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-61` | `sha256:a1efb53682d608e59e22ad36cb1de6e1b8555afabed752e2648c98a6b82b1f8f` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-62` | `sha256:9d4ccd014d684c5b92b402ce2372f4ff1679be84d48d76b07dccb8fd92e0cb20` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-63` | `sha256:868712720ee331daaafb3a3103e052e82e89ded6270aa48838349c38ea53b0e3` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-64` | `sha256:d5f9b065edf670c29df4eab795c26f69f71c34640c8a42cba9d397528deb7043` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-65` | `sha256:156f71a03fcc363a091532c75996110e6d1b1df07b0cf8ad78118ab878208231` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-66` | `sha256:160da37ba993d250fc282aaaa3c5d5eb525068879da1d9c94b905c148534d38c` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-67` | `sha256:bfb0523cab8c446cf40744ba0d7af04d1e9400c9428e3274f63fa781265a243c` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-68` | `sha256:c9a0c409d5b73089fea4e0868d95677f1f855ccc30e749b1960c3377a8e89845` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-FR-69` | `sha256:7ab8b55c8728190a18d93cc2aa6848fbb35c8233feb23e671163dd83f926bd9e` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-01` | `sha256:852893034ac1b3204a050db9be3cc506104f2a155ea9570f0ab09f26466fa041` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-02` | `sha256:61b1fa8add6eaec89b03d47e5ba4f2256cbe4ab316b4a325a2934bb123830fd7` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-04` | `sha256:f90b7d3778b29257015bd30678a8f59c20fc0616c10454ca4febc804d943650f` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-05` | `sha256:bfbdefa59ad1ea92f81aaaa1a9a5e626055e7da54ab952d8fbd82fe5d4c71402` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-06` | `sha256:fb3dadec4964b55ee41b0849950ab28bdcb8808e80d065d38c06bc9ca91bf279` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-07` | `sha256:e3df2d68697433af977cfca1e4f63d83f2f9f9b7fa305e66734cd046fbad2058` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-08` | `sha256:8724cbf48e2e8c314888e5bb12ca828a87ff3abea6e434155031ca65c74d4110` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-11` | `sha256:5b24a2a3490b9e51b6ee169dbf9a2a97751f1848771fdb389f0d0b35482782a3` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-12` | `sha256:a85de817bf5698825a759488e16ad07868c18cfe03a62d7b6fe478e3e422391e` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-13` | `sha256:2065b12446c1fae813cc2cb5d9e247b112edffd8ce515189b99a4a6161284df6` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-15` | `sha256:253e02566e21dcf8dd677f89aadee788839b6c7e4da49f4b86505eaf14b13819` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-16` | `sha256:04c0a3f064456d079d0984c4dd1cb64238bade3e329b37611cea2a417630070b` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-17` | `sha256:476a1cc64e906c7341e251fc5396cefeab2bb0ce3bbcdb3e34d67c6c8600b8f7` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-18` | `sha256:09206374c8d11af21ebad0450f00c8205fe27d24ba055350a008a119cc49bd06` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-20` | `sha256:a478ca26c7c97f063cf0a6d52358b9a0e35603ca1d8dac40c205b515fc18885a` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-22` | `sha256:e0dcb185c615c632c93ff9df21f645e9293ed76f21317a5d1abe9a91123e84b9` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-23` | `sha256:27ea355917c7115610a257a83f695b750701e0a54201bc7aa790864490243861` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-24` | `sha256:72284f7840fb26841527f2520d29ff0b64b473e136211bc0fc6099ed5d89ac24` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-26` | `sha256:239e05f4a6d7453b7b5c6c966ded8acbf1ee6565a38518cc43f8869800cd839f` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-27` | `sha256:9a56f576e707cda0a58668fd22baf775afde65ff1954474352c53dc53d17705c` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-28` | `sha256:dcd5e597e7ffda1290911e74f7eb29498f59a07062c94c76e44bfe8e87f31357` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-29` | `sha256:0b2d77afcc8e27b10ff01daee83df176d72032108580db49f0ee06a6d8a48157` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-31` | `sha256:06dec99b881c94d8f5edb6aee5784f7604a03797238dc9ae070f2d74e8550182` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-32` | `sha256:1beba8953dbc66f4ebfc308995105ad2cf1a0545fa7dc700b526c89b7f1a6a5b` | `split_required` | HELIX-HARNESS、HELIX-OS | PO確認待ち |
| `HIL-NFR-33` | `sha256:fd35b9d635312dc6f0e848c4bcbd28c70b5e8cd7da6aa1af4810053e9481fe35` | `single_product` | HELIX-HARNESS | PO確認待ち |
| `HIL-NFR-34` | `sha256:8c66fd80f98504563e3383bbca96dedd7f9ec43c2b82e969c841ea645b8c6f47` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-35` | `sha256:75bc063dbce9013c692f5a213d4974fccff2809c64b5f28137f8181723621364` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-36` | `sha256:2224ab3bcd6e7974df0e119d9298a784abf86594399cfbe09c6d40b75620f8d3` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-37` | `sha256:c193885771e85f07857776dbce87ceac9cb91725d64aa68eddd53ff2aa4902db` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-38` | `sha256:623495c53d8e952d930ee57bc420714a8ed8e9749859fa4597543ff156e8fd9f` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-39` | `sha256:cf1a0879fbc1f7ca13a8fda0f6910ea0be3beedec24ec49e122f4e16d2212cfa` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-NFR-40` | `sha256:4171419553664d7150ffe9875c14b6bc5212f14635d339dafc2af08ddc656c54` | `single_product` | HELIX-OS | PO確認待ち |
| `HIL-TR-10` | `sha256:f4aae528a618810c40344831e9fbf3290e29ff1786f7d07eae7a9ac73e175df7` | `single_product` | HELIX-OS | PO確認待ち |

## 例外38件（IDと理由）

次のIDは一括候補から除外した。理由は既存queueの記録であり、ここでは意味変更や再配置を決定しない。

| Requirement ID | 理由 |
|---|---|
| `HIL-BR-03` | meaning decision: OS・意味変更要 |
| `HIL-BR-07` | meaning decision: OS・採用差分照合要 |
| `HIL-BR-09` | meaning decision: OS・意味変更要 |
| `HIL-BR-18` | meaning decision: OS・意味変更要 |
| `HIL-BR-19` | target unresolved: 実装制約 |
| `HIL-BR-21` | meaning decision: HARNESS／OS・意味変更要 |
| `HIL-BR-23` | meaning decision: OS・意味変更要 |
| `HIL-BR-26` | meaning decision: HARNESS／OS・採用差分照合要 |
| `HIL-BR-30` | meaning decision: OS・意味変更要 |
| `HIL-FR-01` | meaning decision: OS・意味変更要 |
| `HIL-FR-04` | meaning decision: OS・意味変更要 |
| `HIL-FR-10` | meaning decision: OS・意味変更要 |
| `HIL-FR-11` | meaning decision: OS・意味変更要 |
| `HIL-FR-19` | meaning decision: HARNESS／OS・意味変更要 |
| `HIL-FR-20` | meaning decision: HARNESS／OS・意味変更要 |
| `HIL-FR-27` | target unresolved: HELIX実装／OS |
| `HIL-FR-30` | meaning decision: OS・意味変更要 |
| `HIL-FR-33` | target unresolved: HELIX実装／OS |
| `HIL-FR-34` | target unresolved: HELIX実装／OS |
| `HIL-FR-52` | meaning decision: OS・意味変更要 |
| `HIL-NFR-03` | meaning decision: 意味変更要：全Issue Reverse必須はBR-04の条件付き適用と矛盾。予算到達時の未完義務保持はOS |
| `HIL-NFR-09` | target unresolved: 実装制約：Linux基準とOS adapter。consumerのOS一律指定へ転用しない |
| `HIL-NFR-10` | meaning decision: 意味変更要：agent registryのHARNESS所有をOSへ。adapter再生成・独自正本禁止を保持 |
| `HIL-NFR-14` | target unresolved: 実装制約／OS：IPC障害時のfail-closeと部分結果非昇格 |
| `HIL-NFR-19` | target unresolved: 実装制約：platform別の検証証拠。wrapper成功を別OS成功にしない |
| `HIL-NFR-21` | meaning decision: OS・採用差分照合要：原記録保持とdisposition。取消・終端権限をAVS／RFAのscopeと照合 |
| `HIL-NFR-25` | target unresolved・meaning decision required: 適用範囲要確認：Domain Object設計規律。全consumerへの一律必須条件にせず、対象設計方式と根拠を照合 |
| `HIL-NFR-30` | meaning decision: HARNESS／OS・採用差分照合要：既定policy内authoringと自動正本化。RFA候補の発効と区別 |
| `HIL-TR-01` | target unresolved: HELIX実装：Node control plane、Bun除去 |
| `HIL-TR-02` | target unresolved・meaning decision required: Pythonをdata/detection planeだけに限定せずADR-010 semantic coreと整合 |
| `HIL-TR-03` | target unresolved: HELIX実装：旧ソース採否と正本非迂回、出典・結果投影 |
| `HIL-TR-04` | target unresolved: HELIX実装・提供対応環境：Linux primary。WSL等をcore前提にしない |
| `HIL-TR-05` | target unresolved: HELIX実装：OS adapterとplatform別検証 |
| `HIL-TR-06` | target unresolved: HELIX実装・提供物：依存lock・clean install・検査の再現性 |
| `HIL-TR-07` | target unresolved・meaning decision required: write authorityをL4で決定する旧条件はADR-010のNode transactional boundaryと衝突 |
| `HIL-TR-08` | target unresolved: HELIX実装：Node／Python IPC契約。HARNESS利用先の言語・通信方式に強制しない |
| `HIL-TR-09` | target unresolved: HELIX実装：Node commitとPythonへの最小入力。read snapshotの範囲をADR-010と照合 |
| `HIL-TR-11` | target unresolved: HELIX実装・提供物：全active surfaceのBun不依存。consumerプロダクト自体の言語制約ではない |

## 出典と状態

- Routing候補: [`legacy-ir-product-routing-bootstrap.jsonl`](legacy-ir-product-routing-bootstrap.jsonl)（SHA-256 `c35934693b273e6cfd03e509886dc22bd1367e78ae1aa4568563a7da252c41e1`）。
- 例外status／理由: [`legacy-ir-target-routing-queue.jsonl`](legacy-ir-target-routing-queue.jsonl)（SHA-256 `b543e5ae6009f1f5ae3d4617aa2bb5b809cc92ff83f8ce62cd6ae77e1ef2b2f3`）。
- 原要求digest照合: [`requirements.json`](requirements-source/requirements-ir/requirements.json)（SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）。
- 四製品候補は`authority_effect: none`。既存routeから要求採否・意味変更・successor・実装を導かない。
- POがscopeを確認した後も、個別要求の意味判断・再配置・被覆は各要求identityの記録で扱う。
