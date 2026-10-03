# HIL-NFR-11/12 現行条件照合

- 初回比較snapshot: `46be4fa55d384b8a8eb95f464f78c8a11e95542c`（監査作成時の履歴）
- 最新比較先: `fd3e799710bf5b06081fee271e536fc7f51213ba`。MPR registerはmain prefix 673行を保持し、081候補をline 674へ追加した。
- 対象: 旧HIL-NFR-11 line 191、HIL-NFR-12 line 192。旧原文/consumerは参照のみ。旧test/runtime/CLI/CIは実行していない。
- この監査とHARNESS-L2/L11-081はauthorityを持たない。候補登録や所在記録から要求採択、formal successor、全資産closureを生成しない。

## 原文とsource identity

選択source atomは旧IR `requirements.json#/HIL-NFR-12/statement/text` の1件（statement semantic digest `sha256:a85de817bf5698825a759488e16ad07868c18cfe03a62d7b6fe478e3e422391e`）。旧L1 asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` line 192は同一内容のcorroborationでありatomには数えない。旧L1 assetの固定ファイルSHAは `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。旧IR `requirements.json` SHAは `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。行hashは物理行のLFを除いたUTF-8 bytesのSHA-256で、IR statement/record digestとは別。

| Identity | IR pointer | 原条件 | L1行hash (LF除外) | IR statement digest | IR record digest |
|---|---|---|---|
| HIL-NFR-11 | `requirements.json#/HIL-NFR-11` | 暗黙skipを禁止。画面対象ではwireframe/proseのみを操作可能prototypeの代替にせず、非画面対象ではLLM自由文だけをskip証拠にしない。 | `4515ae178d2098e2ee3633b48e607628db6151207ff2f9f40cd259953208df8f` | `sha256:5b24a2a3490b9e51b6ee169dbf9a2a97751f1848771fdb389f0d0b35482782a3` | `sha256:66067e84448185c681a15832ce97e9b679d85cc2cd1d00b3fbf9217f748a174f` |
| HIL-NFR-12 | `requirements.json#/HIL-NFR-12` | 100% entry enumeration。文書名だけ、代表fixture、検索0件、単一包括要件を完全性証拠にせず、各判断をpath/entry・digest・抽出時点へ結ぶ。 | `c4176abf9d6f6905db512629c9e5d586e75256cbc224b72e06d50af9a31a2c43` | `sha256:a85de817bf5698825a759488e16ad07868c18cfe03a62d7b6fe478e3e422391e` | `sha256:950b0bf1c51aab372e96dc54fece926defbcaad3dce81cda7caa1778fcaf49a1` |

## 条件ごとの現行対応

### HIL-NFR-11

| 条件 | 現行本文とauthority | 判定 |
|---|---|---|
| 暗黙skip禁止、PrototypeとPoCを別判定 | 採択HARNESS-L2-003/008/012と対L11。003は両方N/AのときだけL2.5 skipを認め、L11はPrototype合意、PoC結果Backflow、N/A記録を別々に拒否例化する。decision記録commit 03b1969b26a30e9e2b68149bff2e10c5bfe78110（file SHA-256 sha256:c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23）が、判断対象revision f6dad2a33e24f000b87d7f09b8d40288257e74ccに固定されたpairを採択。 | 意味上対応あり。旧source identityのformal binding/retireは未割当。 |
| 画面対象を静的wireframe/proseのみで代用しない | HARNESS-L2/L11-079がexecutable artifactとstatic-only負例を記述する。MPR-079 source atomはHIL-FR-18/19二件のみ。079は未採択で、NFR11のbindingはない。 | 意味上のcandidate所在あり。別identityだけを理由に候補を重複発行しない。採択・bindingは未解決。 |
| 画面非対象をLLM自由文だけでskip扱いしない | 採択003の構造的N/A条件、理由/判定者/HEAD/影響/再評価条件の記録と対L11。 | 003の意味条件で対応あり。旧NFR11 source atom bindingは未割当。 |

旧consumerは`archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-15`（SHA `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`）、`acceptance_cases.json#/HAC-HIL-15a/b/c`（SHA `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`）、`system_tests.json#/HAT-HIL-15`（SHA `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`）。HATは`designed_not_implemented`。追加consumerとfile pinsはJSONの`legacy_consumer_pins`に保持する。scope changeによるstale/re-entryは採択003/024とOS Backflow経路へ意味対応させ、今回の静的代用条件に重複定義しない。

### HIL-NFR-12

| 原文条件 | 現行対応 | 残差/authority |
|---|---|---|
| coverageを100%列挙 | 採択027はsource snapshot/revision/digest/scope/span/extractorを扱うが、宣言したsource scopeの全path/entry censusを完全性oracleとして必須化しない。採択038/040/041/063の個別source selectionはその選択範囲に限られる。 | 真の条件残差。HARNESS-L2/L11-081へ忠実な単一atom候補として具体化。未採択。 |
| 文書名だけは完全性証拠でない | 027のidentity/scope/spanは関連するが、document-name-onlyを独立負例にしていない。038等のselected-scope proofはNFR12-wide censusではない。 | 081候補で個別拒否。 |
| 代表fixtureだけは完全性証拠でない | 027/067のselection/atomic behavior範囲はNFR12のraw source-entry母集団全量と同一ではない。067は未採択でFR37一atom。 | 081候補で個別拒否。 |
| 検索結果0件だけは完全性証拠でない | 採択027/038/040/041/063の各限定source scopeからzero-result searchをempty source censusとみなす要件は確認できない。 | 081候補で個別拒否。 |
| 単一包括requirementだけは完全性証拠でない | 採択038の選択scope graph/atom closureと、採択040/041のledger/template範囲はあるが、NFR12全source-entry列挙を包括requirementで代替しない制約は未確認。 | 081候補で個別拒否。 |
| 各判断をpath/entry、digest、抽出時点へ再現可能に結ぶ | 採択027にはsnapshot/revision/digest/scope/span/extractorがあるが、全判断の個別entry bindingとsource extraction timeを一体で要求しない。OS107/108は選択scopeのsource情報を扱うがNFR12全量oracleでない。 | 081候補で個別要求。exact digest/time schemaは定義せず、source acquisition/event責務はOS側に残す。 |

旧consumerは`archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-09`（SHA `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`）、`acceptance_cases.json#/HAC-HIL-09a/b/c`（SHA `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`）、`system_tests.json#/HAT-HIL-09`（SHA `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`）。旧HRのremote source取得方法はsupporting consumer contextであり、候補081へ旧remote/repository方式を移さない。HATは設計済み・未実装で実行証拠ではない。各補助test designと既存source-receipt auditのexact pinはJSONへ保持する。

## 採択範囲と候補状態

記録commit 03b1969b26a30e9e2b68149bff2e10c5bfe78110（file SHA-256 sha256:c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23）にある9/28 PO判断は、対象revision f6dad2a33e24f000b87d7f09b8d40288257e74ccについて、明示的に選択されたHARNESS 24候補のL2/L11 pairを採択している。したがって003/008/012/027は採択済み。027の候補headingや登録時metadataから未採択とは判定しない。9/29-57では038、040-002、041-002が各選択source範囲に限って採択。041-003のL11補足は別appendであり、decision fixed pairとは区別する。9/30 live26では063の3条件とOS107/108の各選択atomだけを採択し、NFR12全量coverageを追加していない。

HARNESS-L2/L11-079は未採択候補で、NFR11 static-onlyの意味条件が現れる場所として記録する。MPR-079はFR18/19を対象としNFR11を含まず、正式bindingを作らない。HARNESS-L2/L11-081はIR HIL-NFR-12一atomだけの未採択候補（L1 line 192はcorroboration）で、全資産を走査したことや正式successorを示さない。旧carry-forwardのHIL-NFR-11/12は`preserved_pending_rehome`、successor空のまま保持する。

## 判断事項と範囲

旧crosswalkの`target_assessment: OS`は歴史的な評価欄で、対象revisionのPO decisionではない。候補を忠実に起草・reviewする作業は継続可能。採択時にPOはHARNESSの意味oracleと機構別source取得/保存を分ける責務配置を判断する。推奨は、HARNESSが宣言されたscopeの全量性と判断traceの意味oracleを持ち、source取得・運転イベント・保存は既存ownerに残すこと。影響するのはHIL-NFR-12のcurrent target/bindingと機構間のsource責務配置。採択されるまではcandidate authority effect none。

本監査は初回比較snapshot 46beの履歴を保持し、作成時点以後に最新main `fd3e799710bf5b06081fee271e536fc7f51213ba` をread-afterした。候補081はMPR registerの既存673行prefixを維持した上でline 674に一行追加した。最新candidate pair section SHA-256はL2 `sha256:026234a3b330c12597d84c77b72e6ce022905ab143557d9cc385e422c20970e8`、L11 `sha256:0303fbd094d23e4bfea266c3582fd5832b5ea2c32cba942ba3de3f96cf6088e1`。IR atom source JSONL SHA-256は`sha256:283c0e3b801f6dbefa3277966b80e55e03335c89af1a25ac6ca41ff67ec7b5e5`、atom-set digestは`sha256:f7ce96b2a96f6d4f073498d5f6ae1048ef2535c08fedd1d33125aef7d64cf910`.

本監査・候補は固定件数、全4020資産走査、繰返し走査、特定digest/time schema、legacy runtime/test/CI、source全体のclosureを要求しない。
