# HELIX-OS Stage 3 親036：非upgrade Retrofitの検証保持に関する修正監査（2026-10-08）

## 対象と固定authority

本記録は、main `9229f59edc36b8396ea99bde5f6f903b35c1ccdf` を基点とするworktreeで行った、採択済み親 `HELIXOS-L2-036`（Stage 3、`version_target: 1.0`）の内部整合性に関する限定修正を記録する。固定親、owner、scope、適用性、版、upgrade専用のpreflight順序条件は変更しない。新しいgate、authority、actor、検証policy、数値閾値、運用許可も追加しない。

このbase時点のStage 3委任判断は、より前の本文snapshotを対象としている。対象revisionは `f3e5f40a55be02ad7a92668dced4e32619a75ae0`（判断記録bytesのSHA-256 `48f590122e1c9237e9f1e787c97edb53217cf85a91f703b1d16ad1fb26f816a6`）である。本修正は異なる6本文revisionを作るため、以前の判断が変更後bytesを自動的に対象にすることはない。本監査は修正案の証拠であり、L3承認または条件3照合の記録ではない。独立review、判断記録後のpin照合、PO事後確認、fixture実行は行っていない。

## 固定親と旧sourceの証拠

採択済み固定L2/L11はcommit `633bf12ea8f948db8ba3d6600179c4a9507377a7` の本文である。Gitから取得したraw bytesで、全ファイルと行末を含む対象行spanのSHA-256を再計算した。

| source | locator | 全bytes / SHA-256 | raw span bytes / SHA-256 |
|---|---|---|---|
| L2-036 | `docs/helix-os/L2-requirements/governance-requirements.md:1033–1064` | 447207 / `c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a` | 8683 / `1db82b6f6f2877d1938fa5082e91f781692c56fc59d726350a9ef6f2296d2921` |
| L11-036 | `docs/helix-os/L11-acceptance/governance-acceptance.md:624–636` | 331746 / `40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997` | 2447 / `25b0a97de4e4b36a4c3925664ff383455b94bfd3f3dfef1deea7bd78193bf0d1` |

固定L11の `governance-acceptance.md:634` は、非upgrade Retrofitを旧upgrade順序条件の対象外としつつ、既存HARNESS検証義務と他のread-only verify policyは維持すると定める。固定L2:1039/1045/1047/1061は、全upgradeへ適用するpreflight条件と旧 `RETROFIT_STANDARD_SAFE` read-only doctor verify policyを区別し、これを一般apply authorityへ拡張すること、およびcheckerの意味をOSが定義することを認めない。

| 旧assetと参照locator | 全source SHA-256 | raw span SHA-256 |
|---|---|---|
| `LEGACY-ASSET-02319C2481B9E01698D5` `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:624–624` | `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | `2014a23fd29156eb5ae7111e25d47a9093d1c3ffda2099f10e6068e3c3f7a2f4` |
| `LEGACY-ASSET-31D606AEA5C40091CD49` `archive/legacy-generation-2026-09-14/root/docs/process/modes/retrofit.md:30–39` | `b7b053d867fd5f59c9256d1d60e4685d64c10ef50ff1f9de665dcf506d13c049` | `50ec63e82ac50ed586b04743e9fcce9a7cddbbcecb0e2448c7d3008257fc1b49` |
| `LEGACY-ASSET-31D606AEA5C40091CD49` `archive/legacy-generation-2026-09-14/root/docs/process/modes/retrofit.md:84–87` | `b7b053d867fd5f59c9256d1d60e4685d64c10ef50ff1f9de665dcf506d13c049` | `11db512a99c0acc98be0d0192ed8ea1c0fd43455761eacb99a0b00e26b711d70` |
| `LEGACY-ASSET-75776FE016E550F5355F` `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-concept_v3.1.md:445–445` | `b6cecb7bec29d85b36e299f8a594821c1d778328506fe2c056ca330ef76d968c` | `12bcc89ee75f44699b25a70f4a9fb5d603b723c39c39a4b5a948dec6ec41e738` |
| `LEGACY-ASSET-75776FE016E550F5355F` `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-concept_v3.1.md:470–471` | `b6cecb7bec29d85b36e299f8a594821c1d778328506fe2c056ca330ef76d968c` | `bc152988b871939fad32575aa8f630491e7846f7fb25eecbccd9debe5355cc3a` |
| `LEGACY-ASSET-27224BBE5714E3442753` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json:141–155` | `eeb30c1bb51f74798563b31b0802b301fb687d2e750c517061588969a7ff344f` | `763988cce3576f9421ebf7ce87f0f9a83fcff44c2cc2a1c9abcc898969740b3f` |

旧sourceの意味はarchive本文から確認した。v1.3要求の624行はupgrade preflightを要求する。旧Retrofit手順の30/36–39/86行はhigh-risk preflightをimpact assessmentに置き、失敗時に移行計画を止める。旧Conceptの445/470–471行はupgradeとhigh-risk preflightを区別する。旧policy registryの141–155行は `RETROFIT_STANDARD_SAFE` を `HELIX_DOCTOR` のverify段階におけるread-only policyとして定義し、apply authorityとはしていない。現行HELIX-OS L2/L11は全upgrade条件とread-only境界を保っている。本修正はこれらの意味を維持し、固定L11から非upgrade時に既存検証を保持するoracleを導き、現行L3/L10にあった欠落だけを補う。旧tool、CLI、workflow、runtime、testは実行していない。

## 記録した変更

- `FR-OS-L3-036 AC-03` に、非upgrade Retrofitはupgrade専用preflight順序条件を継承しない一方、選択・適用される既存HARNESS検証義務と他のread-only verify policyを維持することを明記した。一つの順序条件の対象外であることを、それらを省く理由にしない。
- `CASE-OS-L10-036-07` は非upgradeの正常対照である。operationで選択・適用される既存義務とread-only policyを与え、保持を期待し、upgrade専用の順序条件は新たに課さない。
- `CASE-OS-L10-036-08a` は他のfieldを保ったまま、選択済みHARNESS dutyを一つだけ欠落させる。未完として保持し、欠けたverification duty/oracleをHARNESS-L2-005 ownerへ戻す。
- `CASE-OS-L10-036-08b` は他のfieldを保ったまま、選択済みread-only policyを一つだけ抑止する。成功扱いやpreflight/apply authorityの生成を認めず、欠けたpolicyを既存source/policy ownerへ戻す。
- 既存NFRのupgrade coverage母集団は、全Retrofit upgradeのまま維持する。非upgradeでの保持ケースは別に報告し、upgrade preflightの分母へ含めない。2つの単独欠落変異は固定L11 oracleに対して0件を期待する。新しい数値閾値は導入しない。L10 business/NFR要約も同じ境界を示す。

既存のNFR値100%は、全upgradeを対象とした既存coverage候補であり変更していない。旧registryから新たなpolicy適用条件は導いていない。fixture入力には、そのoperationですでに選択・適用されるpolicyだけを含める。

## 6本文のbyte比較

変更前は `9229f59` のGit bytes、変更後はこの修正案のworktree bytesである。編集しなかった2文書はbyte不変である。

| 文書 | 変更前 bytes / SHA-256 | 修正案 bytes / SHA-256 |
|---|---|---|
| L3-BR `docs/helix-os/L3-requirements/business-requirements.md` | 20354 / `cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702` | 20354 / `cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702` |
| L3-FR `docs/helix-os/L3-requirements/functional-requirements.md` | 201537 / `95a6f1c5bdd1015d8849829de88fd99e62c842784135e4ebdbd5b4140d843544` | 201770 / `ccec2331526dc45ad6d6eb90ada45499be65f0289640a2fb1695c798cc2ae844` |
| L3-NFR `docs/helix-os/L3-requirements/nfr-grade.md` | 32737 / `ec63ecd54db5258ff14714624c3df6bcfd3c1c189ac9a08a29271c06231e3066` | 33273 / `481766945e85e295c93c1b0edd5d1dffdb5b29c3c94cd74150e3080722b6c269` |
| L10-BV `docs/helix-os/L10-verification/business-verification.md` | 17702 / `5a75c21ce10b33fc8441adda71253870fd20a8687c18e7939cfe8b25f9d393c8` | 17774 / `f785e13aa9a1ef8494154f03e20d0582418916281c51a6b729d385d5b66ef051` |
| L10-FV `docs/helix-os/L10-verification/functional-verification.md` | 240108 / `8a99792f723abb96034274c72424902fba51df515e2a99f637823427aa03821c` | 241379 / `463be80d9cbad87b30350f7e7032d927f184b13f510bfa06d9e4c7a91459ff4f` |
| L10-NFRV `docs/helix-os/L10-verification/nfr-verification.md` | 29480 / `3019648b66a351418945033646bf82c84d0c7ef771edee49378cef2be266e256` | 29719 / `787a430bad71df2b019b8c3ecd476292f54753af9529d845611d0074e5d7bf9e` |

変更したのはFR、NFR、L10 business要約、L10 functional CASE、L10 NFR計測記述だけである。親036には独立したbusiness outcomeがなく、既存business rowは機能結果のprojectionであるため、L3 business requirementsは変更していない。L10 business要約は既存境界を示すために更新したが、新しいoutcomeは作っていない。

## 静的検証と限界

`git diff --check` は通過した。静的確認では、追加した3 CASE IDが一意であること、3件すべてが `AC-OS-L3-036-03` を参照すること、FR ACが存在すること、L3 NFRとL10 NFRの両方がCASE-036-07/08a/08bを参照すること、6つのcanonical文書の変更前後hashが記録されていることを確かめた。旧test、CI、runtime、CLI、hookは実行していない。

本記録の対象は親036の修正だけである。他のStage 3親、他のOS stage、他機構、旧consumer全体、runtime挙動は再監査していない。6本文全体には新しい独立委任reviewと、そのreview対象revisionについての条件3照合が必要である。PO事後確認は未記録である。
