# 旧要求形成Admission intake 47行の分類案

- 対象: merged #2366 exact `a9b36cd43866d30aaca7c1edc654a44a36e47eb3`を含む提案overlay文脈の47行。#2366監査JSONのSHA-256は `d42792e8c50402353d6c66a941e00062b7288f267fcecfc0e2eabd7ae93ab8f6`。
- 原文: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-intake.md`。
- authority effect: `none`。分類案のみで、採用・successor・coverage・受入・実装・完了を示さない。
- 追加入力: merged #2367 exact `b438bf16a3e3e4f21cf4a9762ae59c7d7efccaf7`（51行提案、JSON SHA-256 `c9b3eec4b150f2ab6b73f790b8feb1bcb8aab91c1b6a30a522f9ba65364a130d`）。47行案とはsource IDが重複しない。
- 集計: 製品要求atomを26行維持、管理・工程条件へ7行、説明・来歴・状態へ14行。#2363/#2366提案後の521を基準に、47行案単独では500、#2367案単独では507。両案を重ねる仮定の算術は486。

## 行別分類案

| source ID | 旧原文行 | 提案分類 | 理由 | source line SHA-256 | physical line SHA-256 |
|---|---:|---|---|---|---|
| `LEGACY-CAND-LINE-003617` | 3 | 説明・来歴・状態 | 表題直下の状態・Issue/PLAN由来・非完了注記。旧台帳のstatus/provenance。 | `sha256:ede28e52092702050f97ff21b7360834d1a241c2bac0dfdccd903dba4b2cdcbd` | `sha256:9b9f40604497f55db750c989320437b85d35053af215bfa48edaaae16b4e72ac` |
| `LEGACY-CAND-LINE-003618` | 4 | 説明・来歴・状態 | 照合に使った旧main revisionの来歴情報。 | `sha256:ecf9da7b3b31d9543772af3dbdafe32082bd1399fc366b8ad3a2ad09d10898a7` | `sha256:f1c3ab329a0bba7e538108bf1619deb6c06a56420bbc7a3a9fc84aa15ce2a76e` |
| `LEGACY-CAND-LINE-003619` | 5 | 説明・来歴・状態 | 提案者報告と参照Issue確認の履歴。要求動作の規範ではない。 | `sha256:7221bdae251d145b68bebef0064bdf1394f03bde4fb34c4b1b0da4c2996d87f3` | `sha256:f13731342aad78ff57fd758695fd95f441e0ba580bff95fdafae940da5c5ca22` |
| `LEGACY-CAND-LINE-003620` | 6 | 説明・来歴・状態 | 原文欄と候補正本の配置・役割を示す台帳説明。 | `sha256:1c96f6d8fba9359e6546221f23b4d0df0885755ae67227499fd09a53dc51a619` | `sha256:a7cd20140fb8ef4acff556b64bcbf475794eeb7d2f1eb838291867530da3ec33` |
| `LEGACY-CAND-LINE-003621` | 7 | 管理・工程条件 | 既存field名を維持し判断概念を分ける旧編集・schema取扱い指示。製品動作ではない。 | `sha256:861ea63dedfa6d6cb35c66fac7781132a6b0fcda888dc5f3dba69bc66113bf61` | `sha256:217bd8b14856ad5f578e8a86a068ef56eb4c0fc7f1334cc481b14ecfe6f6389f` |
| `LEGACY-CAND-LINE-003622` | 8 | 管理・工程条件 | RF/RC/GHの責務分割と別engineを作らない旧設計・作業範囲指示。 | `sha256:405a70b1cb5ead3c0be102f77e1b45bd1db34ddf1a855fb4e114d9924063e7b0` | `sha256:fba1ade14138f2ebc955387b92587b3ba362e574daf3e0f0cfce994c2fbaf295` |
| `LEGACY-CAND-LINE-003655` | 49 | 説明・来歴・状態 | 2026-09-05に行った原稿照合の過去検証記録。 | `sha256:a04ad74ef4f3cf50f60563d6c0d8ef447dc77ca15386b6a5d0b7370b2df0aefa` | `sha256:1b634bc9b5d092eea04ea18bd9918aa9db2f45c687bc33762e9d6990e5b26525` |
| `LEGACY-CAND-LINE-003656` | 50 | 説明・来歴・状態 | 旧ID/受入検査の成功報告。現在の要求動作ではない。 | `sha256:7640a93ac93e2666b650b78590b4ac20b6d1bbf3abf1078bf4099a41fe65a44b` | `sha256:32c1d7f98d763820bb98ad8cb71c6432a9f69060ec679da97731dee8b84d47a2` |
| `LEGACY-CAND-LINE-003657` | 51 | 説明・来歴・状態 | 旧PLAN lintの成功報告とadvisory状態。 | `sha256:e612a9b68537456c538d78658d6ac9d54a7f32c6525e9f3c357be311b1d15257` | `sha256:9d4b144cf099267f8088a863f46dc5664b570fbe50b574ac984024153b75a5f9` |
| `LEGACY-CAND-LINE-003658` | 52 | 説明・来歴・状態 | 旧DB rebuild結果とoutstanding snapshot参照の過去状態。旧CLI/runtimeを要求として再分類しない。 | `sha256:e6a821a19697f7498bfa2512281031ae672813d389038d329cc43b75104a0ed2` | `sha256:ea9d7e018ee15b120b7e7c24cce5da4a6cfeb7de9121dc6c6520bd0864134b1c` |
| `LEGACY-CAND-LINE-003659` | 53 | 説明・来歴・状態 | 独立review/CI/main統合の当時の未実施状態を記録。末尾も当時の検証範囲説明。 | `sha256:1464a8658d16bc8674c66322ed790f146e93a00a3f0f1e9cb656d6ffdd43ab62` | `sha256:6f24a4ea4be6d83f9ee809b8cc61535e27e4a625a690dd6645036e1da5b23438` |
| `LEGACY-CAND-LINE-003664` | 62 | 説明・来歴・状態 | 入力1の候補statusとauthority非発効を示す履歴metadata。 | `sha256:b410f3fe7e5a6d9e65e48cefddb6a9945a02bb5cbee9cfedd0d97ab5b50c8b21` | `sha256:5ecc9d1f8be8ff3390f68d0100d92b855c576a76e5cc7bb090ed9ca19c7d463b` |
| `LEGACY-CAND-LINE-003665` | 63 | 説明・来歴・状態 | 入力1の照合日・基準revisionとIssueの観測時点。 | `sha256:7eeb9f1a1cb86b818adbd15323c297988d90c120a1847e09be714f4db4267353` | `sha256:df231f41e26c62c6b4a8bc85ebb5f8a32a694c0cd980138cfe43290d4537a35d` |
| `LEGACY-CAND-LINE-003666` | 64 | 説明・来歴・状態 | 候補作成時に自己設定した対象範囲のprovenance。 | `sha256:53ac9d16a987eccf3e85bf51e52418f1a5a68b636e54c2643356141075d1dd41` | `sha256:3595360bcc63d2a73ff94dfaaa28d3c96a30f12f8d2b8de4f60eff15ae53b67a` |
| `LEGACY-CAND-LINE-003667` | 65 | 管理・工程条件 | 対象外と包括認可否定の旧scope/権限境界。候補工程の制約で、製品機能要求ではない。 | `sha256:9cb5c0a2922c3f672b75f4c3e28d59136567528a307ecd8535e4dadeeaf764ee` | `sha256:7380dd7600536863a0d50aac40cdfd1b359e4462c7c0b7831e45547f25fe66b7` |
| `LEGACY-CAND-LINE-003668` | 66 | 説明・来歴・状態 | 旧文書作成時の未実施作業・監査範囲報告。 | `sha256:5087931323a61c6a2c10b4b9c1f04d1fba43c64cee13c4fb0a2d775a1b401c57` | `sha256:4a69a6f856e2f8c7db29fa380378b093e3caa1b907a17a312f4da6ab909f3e8f` |
| `LEGACY-CAND-LINE-003673` | 76 | 説明・来歴・状態 | 既存契約とIssueの当時の内容を説明する根拠文。 | `sha256:f3381ca1c204a3c1c77e8bff2e16e4c3adbeeb20e267f5e15d887bc909e24cd9` | `sha256:47191dbbb68a0a394d745a907cb7c219bf5e0612e70518f86de50beb7b2b3af0` |
| `LEGACY-CAND-LINE-003674` | 78 | 管理・工程条件 | 旧#1169 acceptanceとの適用境界を明文化する作業指示を含む。前半は過去の契約比較であり混合行。 | `sha256:4459e0ff2f5c4a28946b8684344858a25e691f3506a9d3ab304e70071484a62b` | `sha256:3451bd301f392e08fe5026f1b3808eff0cce71fe562da4ac315375620a88456e` |
| `LEGACY-CAND-LINE-003675` | 80 | 管理・工程条件 | closed済みIssueを再openせず後続差分で扱う旧project/change management指示。 | `sha256:26dd9d7f6f3a16acd1d69ab0c77d5e5f4988bbc087ebff0b1d67ba706935e9a4` | `sha256:7c4ed527354a803b1799761f91fc783f6a8b777a226bfe3e86dffb8cbab527b6` |
| `LEGACY-CAND-LINE-003678` | 86 | 製品要求atom（維持） | RF-01。企画の意図・AI解釈を分け、前提から調査義務を導出するHELIX要求形成の製品動作。 | `sha256:d8d1b88737bb784d584b4ffdf052cc334946aeebbfcb3bcdfd77a306f902e8e0` | `sha256:706f82bddfa16eeaf4e3f00bb6c48618308ee86f25c7609aeeb2e848a22e0d1f` |
| `LEGACY-CAND-LINE-003679` | 88 | 製品要求atom（維持） | RF-02。前提整理と探索を区別し、論点別の証拠・版・条件・限界を扱う製品動作。 | `sha256:97ecf7f10e3ddfeed5ea43c40a0696e9b556c673d8af797d74fd290eb8c9ecdb` | `sha256:692c81349625dcddb9826596912be0879fb175af1474527ec2c5563ef78892a7` |
| `LEGACY-CAND-LINE-003685` | 100 | 製品要求atom（維持） | RC-02の意味/価値採否境界。三つの判断を独立させる規範的責務の一片。 | `sha256:691e7871ff786ff4abd93c3cea213154b371001980244e85c1aac225efc0a488` | `sha256:96e9f47782a68cc5a18576cc67d58ab220909c4e4dcd38607b2bbe7efb584ec2` |
| `LEGACY-CAND-LINE-003686` | 101 | 製品要求atom（維持） | RC-02の技術的正本化境界。意味差分・revision・trace・検証を確定する責務の一片。 | `sha256:06fe1d584e2b36e885df64dd2517218b7033a13e2ee66b62bffdd18014d3a78f` | `sha256:5b48f1be8fe656aecc01a023e9a16913388fac904c517341a69448e23ad7c7ad` |
| `LEGACY-CAND-LINE-003687` | 102 | 製品要求atom（維持） | RC-02の実行認可境界。対象・actor・権限・予算を分ける規範的責務の一片。 | `sha256:1d8eadc12e996e6fa551a4ccdb855370a6b4e5fe5499e7496e76ae77b58e6222` | `sha256:b610b2aca3c72a0a1f831b93ca635abf52145c354451e43aaef5a9f3734eee2e` |
| `LEGACY-CAND-LINE-003690` | 108 | 製品要求atom（維持） | RC-03。未委任の意味差分と許可境界越境を影響範囲に限って人へ返す製品動作。 | `sha256:4045fa33cca95899d060cf759d5a2ab131cc8e1392e3400c551939d9a2851b1d` | `sha256:51a237d8217f27bb1d143666c48eb53d47c3e35e2fcbf8a18f2a7182d1de9e93` |
| `LEGACY-CAND-LINE-003697` | 122 | 製品要求atom（維持） | C-3。明示許可済みの探索仕事と通常実装を分離し、候補保存を採用へ変換しないAdmission動作。Issue/PLANからTicketへの互換接続も一体条件として保持。 | `sha256:982296f6032aa05cd61f887e7c0f3d882957b6883f7792e2933eaf3fb8783212` | `sha256:b6c62ae35bbd3b52d640cc76214ce1037b200e77f5c2869090cdb8854441921c` |
| `LEGACY-CAND-LINE-003710` | 142 | 製品要求atom（維持） | 候補AC-01。十分な根拠と有効な委任内差分を重複PO割込みなしに検証・進行する挙動。 | `sha256:8a2f53ffb73e73558cedd6d4cc3b34c9629d809b4a37e1a86d33b521dae63387` | `sha256:9cee491df053a36819d2433c8a13dece05edaeccf578b478e440dd49afeef1d9` |
| `LEGACY-CAND-LINE-003711` | 143 | 製品要求atom（維持） | 候補AC-02。出典数ではなく論点充足をready条件とする挙動。 | `sha256:3a06e7375b37dc6d8b59211729621fa48a1615af57b50a5fe241df3d27cda195` | `sha256:fd5f86052b7d2d5cae5bf78d335a0dd581610f8d76ac6b87b4c6324769d8e66d` |
| `LEGACY-CAND-LINE-003712` | 144 | 製品要求atom（維持） | 候補AC-03。価値変更の対象差分だけ返し、無関係scopeを継続する挙動。 | `sha256:34dfa1838e918c35af4650b72dc9842df7ad6b7c1e5929063decbbf260f1ac23` | `sha256:938966e0af9e51d5a4ff719200dadc212f57d5816645de8c9e9c5a2df9dbe764` |
| `LEGACY-CAND-LINE-003713` | 145 | 製品要求atom（維持） | 候補AC-04。無承認実装越境・承認流用・自己拡張・失効decisionを拒否する挙動。 | `sha256:8733cf8c4d335d34d24f0cd25c799119d227b154253f7d66381209ce927c7c1c` | `sha256:4c5c7fff187a13222e95592b10da337b192651de67ee980265b3893f50d0d589` |
| `LEGACY-CAND-LINE-003714` | 146 | 製品要求atom（維持） | 候補AC-05。L3前の限定探索を許可しつつ本番write権限と分離する挙動。 | `sha256:4e604771c7eebb7170ffb3c0ab4b75557da94eaa828ff262ab262eacd8cb0be1` | `sha256:8976f062a522631ecce0b6048797578b5cbed4015e2ae03f9a0fea03e407f688` |
| `LEGACY-CAND-LINE-003715` | 147 | 製品要求atom（維持） | 候補AC-06。再現性と未知影響・partial update・stale packet検出を求める製品受入条件。 | `sha256:2ae03e5e4c864648b2f3d90726088ca89199f94f78f34ba17d0ad6fa2e2e24a9` | `sha256:4d6812ace1f726725608e33a11b5370cd873f8952c1c121a56a23109cbd0cdaa` |
| `LEGACY-CAND-LINE-003746` | 188 | 管理・工程条件 | 旧#1169/#282/#396契約の不整合を踏まえ適用境界を改版する作業提案。現状説明と今後のmanagement directionが同じsource atom内にある。 | `sha256:4244294f9b566949e2dc7d5db187c83eb431fbc1fa818977cae5546304301e55` | `sha256:88a3cc9072c33bfd1d09968ff1999206139a0bed3c0170cba02d642290d91bf1` |
| `LEGACY-CAND-LINE-003755` | 203 | 製品要求atom（維持） | RF-01。既知/仮説/未知/矛盾/鮮度、影響、必要証拠を関連付ける requirement-formation behavior. | `sha256:c9c4ef605af3dc569e8c05863903ffde21da1ce6099f6dc6d5bc805b6ff38a57` | `sha256:3ea8061603cfc4a9f36c233e43130acd239b283a10ac88b53a6945e021728693` |
| `LEGACY-CAND-LINE-003756` | 205 | 製品要求atom（維持） | RF-02。前提整理と探索調査、出典の適用性、反例、実物検証の区別を保持する behavior. | `sha256:1cd409bc85a3be39defaa6befaf707a34454ed97615901fbb5c55cc6f671d4dc` | `sha256:fca375ad7cb3cf4f4ce2199e352b2d52e7345e9471bde4086844bfd5b4ab94fd` |
| `LEGACY-CAND-LINE-003757` | 207 | 製品要求atom（維持） | RF-03。同一仮説revisionへ候補・証拠・PoC・反応・採否を束縛し、AI解釈と人の決定を分ける behavior. | `sha256:120b41543907b4199b76f5fe8671b237cb8339aecc923c3ef17d05071fd1fb77` | `sha256:296845b7a3ed442859f0be0674366b0ee5cad61bc2851475bddbb0b328c91428` |
| `LEGACY-CAND-LINE-003762` | 216 | 製品要求atom（維持） | RC-02の既承認意図内での技術派生・再freeze判断。再承認なし進行条件を定義する一片。 | `sha256:fd37eb292ac45c8f5e7b45891158d0e6a0a8bc20b514bc8be1aac72e2c52ed4f` | `sha256:07dcb3ca16d20aa19ff46c341d02b53f635938b29b45abb359f6025741ae0f28` |
| `LEGACY-CAND-LINE-003763` | 217 | 製品要求atom（維持） | RC-02の明示された新要求を一度の対象付き決定として消費する挙動。 | `sha256:7d6fadef4b13fa7f3a2b64cde5d48619a0806f7c6ca3fc9080927b09890617b1` | `sha256:ec53faa76d3c31ee6670eb7cb45965f441bb467c5d9e5c5438c458491ee3ba77` |
| `LEGACY-CAND-LINE-003764` | 218 | 製品要求atom（維持） | RC-02の新たな価値/権限判断や曖昧さを影響差分だけ人へ戻す挙動。 | `sha256:deeec531961898cd6d3fa79738511ac0eb471285dbd4a1a38968b445611a1f10` | `sha256:986bedba0b670c625d8056c74bd51dd3eef11cf11f910cd9cfeab91f6a9a98f3` |
| `LEGACY-CAND-LINE-003771` | 232 | 製品要求atom（維持） | GH-03。移行前後のIssue/PLAN/Ticketで同じ許可条件と待ち分類を保つ互換動作。 | `sha256:3fe7f51ed7335fd8a5858a68b5ac8f91ca6a972248369054abda83daf3d8db68` | `sha256:1b081fac11e6db92619d845d6b6c0ec2420fa82ad22a42c53b9a84451d21cb05` |
| `LEGACY-CAND-LINE-003774` | 237 | 製品要求atom（維持） | 候補AC-01。証拠の量だけではreadyにしない受入条件。 | `sha256:8916fe7a0f05af77cecb813cd101fddb93c497650934cc595227270a50454a4a` | `sha256:026e4a775a796ff3e7a01da6e657deb00ffc69b0cf58f6f23d5528cff1d3d6ac` |
| `LEGACY-CAND-LINE-003775` | 238 | 製品要求atom（維持） | 候補AC-02。限定研究/試作と本実装・外部write権限を分離する受入条件。 | `sha256:62f62f76fa3d3a7bb41f27c63c1c49136537f7c5f57b13f966cf7c8d9cdebcd0` | `sha256:0ca79410c9d853374702b645920efba888540166f0d58c640a07ac2cfa6b0439` |
| `LEGACY-CAND-LINE-003776` | 239 | 製品要求atom（維持） | 候補AC-03。委任内技術差分・既決指示に重複承認を求めない受入条件。 | `sha256:cc96e1a43d403ec7deecd9b1b36ab22143aeef20e3f72153edc14e35bac48f73` | `sha256:deb40f0a18caa5e1fcdf75a4befe891e0ccc54f04f5db7891e50110726efc8ea` |
| `LEGACY-CAND-LINE-003777` | 240 | 製品要求atom（維持） | 候補AC-04。価値判断・予算/権限拡張・policy自己拡張を自動通過させない受入条件。 | `sha256:17f06cd6879019bef153d470f346b3f449c1628e54ea3832a803a7913dd590a7` | `sha256:ae2b782d5e9b16f1c18fd61b05e571cf1d07fed2a5b630048672e0e6c8e86d58` |
| `LEGACY-CAND-LINE-003778` | 241 | 製品要求atom（維持） | 候補AC-05。stale writerと根拠を拒否し、無関係scopeを継続する受入条件。 | `sha256:e781f9f74c70e0ce72652e187ff8ec21fd8e45d443663bc93d653f67cc6f5b00` | `sha256:5042a36237eb8fb761cd0c56b009151eeb220044bb6b9605f9443a81ca9f85f9` |
| `LEGACY-CAND-LINE-003779` | 242 | 製品要求atom（維持） | 候補AC-06。根拠偽造/失効、revision競合、部分更新、required判定skipを拒否する受入条件。 | `sha256:1df43258a43805d3bc098a1d91e5f0c9be88f92b8da9c58577c2f7c60a45b69a` | `sha256:5aee76a5b69ae6b6ac67ecddabaadfeafb36f7b38020b8bb33d20b59ede0020c` |
| `LEGACY-CAND-LINE-003780` | 243 | 管理・工程条件 | 統合後に組織運用の成果指標を継続測定する旧評価/recognition義務。外部製品の機能受入ではない。 | `sha256:1e5f10955eb38dc1d40ceef72a113f1988b3edea1a9f433563efb27d34ef43c5` | `sha256:40a6e84ee16b397fdc11558d9b7aeec38b4399d3935dd1d94746b8947016c700` |

## 曖昧行

`LEGACY-CAND-LINE-003674`（78行）は、#1169の既存契約比較と適用境界を改版する指示が同じsource atomにある。`LEGACY-CAND-LINE-003746`（188行）も既存契約の状態記録と適用境界を変更する指示が混在する。どちらも暫定分類は管理・工程条件とし、元の行境界を維持したまま曖昧として別掲した。

## 件数影響

| 提案分類 | 行数 | 製品unknownへの影響 |
|---|---:|---|
| 製品要求atom（維持） | 26 | unknownのまま。routeは変更しない |
| 管理・工程条件 | 7 | 製品unknownから除外し、conditionとして残す案 |
| 説明・来歴・状態 | 14 | conditionからexplanationへ移す案 |
| 合計 | 47 | 製品unknownを21行減らす算術案 |

merged #2361 baseline 544に#2363提案の−12、#2366提案の−11を重ねたproposal baselineは521。今回の47行案は単独で−21となり、521−21=500。merged #2367案は別途−14で521→507。両proposalのID集合は重複しないため、両方を仮に重ねる算術は521−14−21=486。いずれもproposalの分類算術のみで、採否・coverageや要求の完了を判定しない。

#2367はmerged exact `b438bf16a3e3e4f21cf4a9762ae59c7d7efccaf7`の独立51行分類提案で、47 IDとの重複は0件。最終JSONのpathとSHAはJSON pinに記録した。#2367の分類提案は37 product／11 management／3 explanation、product unknown差分−14で、521基準の単独提案算術は507。authority effectはnone。今回の47行案の単独算術は521−21=500。両proposalを同時に重ねる仮定の算術は521−14−21=486。これは分類proposal間の件数計算であり、採択・successor・handoff・coverage・解決・受入・実装・closureを示さない。

## 入力pins

JSONの `pinned_inputs` に、#2353/#2356/#2360/#2363/#2366/#2367のmerged commitと各監査JSONのSHA-256、#2361 effective recount、source ledger、router、archive source、および隣接旧要求・decision-history資料のpathとSHA-256を記録した。#2367 final merged rowsと47行のID非重複を再検算した。

## 根拠と境界

隣接する旧requests/requirements/acceptance/recognitionとPLAN-L3-90を読んだ。RF-01/02/03、RC-02/03、GH-03および受入1〜6に対応する行は製品の要求形成・admission動作として保持した。既存Issue間の閉鎖/改版指示、scope制限、評価観測は管理・工程条件へ置いた。過去の照合・検証・statusとsource pinは説明・来歴として分けた。#1556の過去判断は候補revisionへの記録としてのみ参照し、本分類案へauthorityを移さない。

原文行の本文SHAと改行を含むphysical-line SHA、archive file SHA、全input pinsをJSONに記録した。旧runtime、CLI、test、hook、CIは実行していない。
