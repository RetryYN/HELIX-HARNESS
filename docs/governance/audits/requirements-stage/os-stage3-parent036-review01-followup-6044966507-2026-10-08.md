# HELIX-OS Stage 3 親036 review01修正追補（2026-10-08）

## 対象とレビュー根拠

対象はPR #2680のClaude review01 comment `https://github.com/RetryYN/HELIX-HARNESS/pull/2680#issuecomment-6044966507`。GitHub APIから取得したcomment bodyのUTF-8 raw bytesは6,402 bytes、SHA-256は `6d5912c4d39d8455b6c7f0c3ba724692832d179283fcf36acc819f137b137f86`。commentが対象にしたHEADは `bb39e409d39755388de7cae93f13b6e4f189f2d6`、PR baseは `5857c0a396cb24a23d765e3079a18a2367b6d078`。

この追補はそのreviewのM1/M2とMinor 1–4を反映した候補revisionの記録である。旧記録 [親036の初回修正監査](os-stage3-parent036-nonupgrade-verification-retention-2026-10-08.md) は当時の記録として変更していない（9,430 bytes、SHA-256 `bc93288a7a3c3d6fe0c38038a133456f9de149bbd7e4859f11b57e2eb053f3ae`）。旧記録はmain `9229f59edc36b8396ea99bde5f6f903b35c1ccdf` を基点と記録しているが、このPRのbaseは `5857c0a396cb24a23d765e3079a18a2367b6d078` である。旧記録の基点記載は当時の誤記として保持し、本追補では正しいPR baseを示す。旧記録が記載した6本文の変更前後bytesはこの修正前の同一本文群について一致していた。

本追補作成時点の6本文は、以前の承認対象とは異なる。これはL3承認、条件3独立照合、main admission、PO事後確認、実fixture実行を意味しない。独立reviewおよびその後のauthority確認が必要である。

## 固定親・判断記録・旧source

採択済み固定親はcommit `633bf12ea8f948db8ba3d6600179c4a9507377a` のL2/L11であり、SHAは初回監査記録のraw取得値を再照合した。L2-036は `docs/helix-os/L2-requirements/governance-requirements.md:1033–1064`（447,207 bytes、SHA-256 `c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a`、raw span 8,683 bytes、SHA-256 `1db82b6f6f2877d1938fa5082e91f781692c56fc59d726350a9ef6f2296d2921`）。L11-036は `docs/helix-os/L11-acceptance/governance-acceptance.md:624–636`（331,746 bytes、SHA-256 `40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997`、raw span 2,447 bytes、SHA-256 `25b0a97de4e4b36a4c3925664ff383455b94bfd3f3dfef1deea7bd78193bf0d1`）。L11:634は非upgrade Retrofitをupgrade順序条件の対象外としつつ、既存HARNESS verification dutiesと他のread-only verify policyを維持する。L2:1053は義務/oracle不足をHARNESS-L2-005、preflight source/evidence不足をsource/domain ownerへ戻す区分を持つ。選択義務の供給元として参照した固定HARNESS-L2-005は `docs/helix-harness/L2-requirements/product-requirements.md:56`（全442,914 bytes、SHA-256 `9c9d499530f4d55c672391614eae6a3ccd6970d69d7c3ebc6e205ead24750c7d`、raw span 856 bytes、SHA-256 `6d4ca115f2d2114ddfa4dd41b4ec0305cb4818954b64ebb66bd2a08a39e5f63f`）。同項はticket関係・変更内容/layer/riskから検証義務と証拠条件を導出し、CIの組み立てと運転をOSの検収とする。

判断記録は `docs/governance/decisions/helix-os-stage3-l3-l10-po-decision-2026-10-05.md`、対象本文revision `f3e5f40a55be02ad7a92668dced4e32619a75ae0`、判断記録bytes SHA-256 `48f590122e1c9237e9f1e787c97edb53217cf85a91f703b1d16ad1fb26f816a6`。この記録は今回の修正後6本文を承認したものではない。

旧sourceは初回監査に記録された対象を維持し、旧本文と台帳を参照した。対応関係は完全一致再利用ではなく、既存のupgrade順序とread-only境界を保つ意味の再導出であり、非upgrade時の保持条件を固定L11の範囲で明示した。

| 旧asset／source | 対象箇所 | 全source SHA-256 | raw span SHA-256 |
|---|---|---|---|
| `LEGACY-ASSET-02319C2481B9E01698D5` | `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:624` | `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | `2014a23fd29156eb5ae7111e25d47a9093d1c3ffda2099f10e6068e3c3f7a2f4` |
| `LEGACY-ASSET-31D606AEA5C40091CD49` | `archive/legacy-generation-2026-09-14/root/docs/process/modes/retrofit.md:30–39` | `b7b053d867fd5f59c9256d1d60e4685d64c10ef50ff1f9de665dcf506d13c049` | `50ec63e82ac50ed586b04743e9fcce9a7cddbbcecb0e2448c7d3008257fc1b49` |
| `LEGACY-ASSET-31D606AEA5C40091CD49` | `archive/legacy-generation-2026-09-14/root/docs/process/modes/retrofit.md:84–87` | `b7b053d867fd5f59c9256d1d60e4685d64c10ef50ff1f9de665dcf506d13c049` | `11db512a99c0acc98be0d0192ed8ea1c0fd43455761eacb99a0b00e26b711d70` |
| `LEGACY-ASSET-75776FE016E550F5355F` | `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-concept_v3.1.md:445` | `b6cecb7bec29d85b36e299f8a594821c1d778328506fe2c056ca330ef76d968c` | `12bcc89ee75f44699b25a70f4a9fb5d603b723c39c39a4b5a948dec6ec41e738` |
| `LEGACY-ASSET-75776FE016E550F5355F` | `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-concept_v3.1.md:470–471` | `b6cecb7bec29d85b36e299f8a594821c1d778328506fe2c056ca330ef76d968c` | `bc152988b871939fad32575aa8f630491e7846f7fb25eecbccd9debe5355cc3a` |
| `LEGACY-ASSET-27224BBE5714E3442753` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json:141–155` | `eeb30c1bb51f74798563b31b0802b301fb687d2e750c517061588969a7ff344f` | `763988cce3576f9421ebf7ce87f0f9a83fcff44c2cc2a1c9abcc898969740b3f` |

旧v1.3要求とRetrofit手順はupgrade preflight順序を支え、旧Conceptはupgradeとhigh-riskを区別する。policy registryは `RETROFIT_STANDARD_SAFE` を `HELIX_DOCTOR` のverify段階のread-only policyとし、apply authorityとはしない。本修正でも旧runtimeやCLIは実行していない。

## 指摘への修正

- **M1**：L3 NFRの根拠列をbase本文どおり「plan前だけではapply前driftを見逃す。通常operationへ拡張しない。」へ復元し、計測列の「複数upgrade ticket fixtureで」も戻した。非upgradeの保持群とCASE-036-07/08a/08bは、元のupgrade計測文の後ろに別集計として追記した。L10 NFRも元の「複数upgrade ticketの全Retrofit upgradeごとに…upgrade単位境界網羅率・stale pass数」を復元したうえで非upgrade保持群を追記した。upgrade分母は全Retrofit upgradeのまま、非upgrade群を混ぜず、固定L11の保持oracleに対する省略期待数0を別に照合する。追加の数値閾値はない。
- **M2**：CASE-036-08bで、入力されたpolicyはHARNESS-L2-005の選択によること、policy欠落はHARNESS-L2-005 ownerへ戻すことを明記した。policy自体の出所がunknownの場合はsource/domain ownerへ戻す。OSは選択を形成せず、既存policyの保持・戻しだけを扱う。
- **Minor 1**：AC-03の「当該scopeを保留する」は固定L2の「対象upgradeごと」と整合する。差分は保留の対象単位をscopeとして表したものであり、対象を拡張しない。
- **Minor 2–3**：CASE-036-07を「いずれも省略せず保持する」「既存の未完義務・検証状態を失わない」とし、新たなoperation記録義務のように読める表現を除いた。
- **Minor 4**：この追補では正しいbase `5857c0a...` と判断記録の完全pathを記載した。初回監査はimmutableのため変更していない。

変更はL3 FR、L3 NFR、L10 FV、L10 NFRVの4文書。BR/BVはこの修正で変更していない。AC/CASE IDや既存親の意味・owner・適用範囲・version、upgrade順序条件、HARNESS選択責務、OSの保持責務を変更していない。

## 6本文の現行pin

SHA-256とbyte数はworktree上の全ファイルraw bytesから算出した。変更前はHEAD `bb39e409d39755388de7cae93f13b6e4f189f2d6`、変更後は本追補作成時のbytes。

| 文書 | 修正後bytes | 修正後SHA-256 |
|---|---:|---|
| L3 BR `docs/helix-os/L3-requirements/business-requirements.md` | 20,354 | `cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702` |
| L3 FR `docs/helix-os/L3-requirements/functional-requirements.md` | 201,811 | `68bf95443b494e16bb2a72506358536d7d8740fb620e09d55ed0b922d3b9ed03` |
| L3 NFR `docs/helix-os/L3-requirements/nfr-grade.md` | 33,002 | `d4e76c3dc15b28894937ddc0e39cb223aeef106284fae13b8ea4212dfce02726` |
| L10 BV `docs/helix-os/L10-verification/business-verification.md` | 17,774 | `f785e13aa9a1ef8494154f03e20d0582418916281c51a6b729d385d5b66ef051` |
| L10 FV `docs/helix-os/L10-verification/functional-verification.md` | 241,506 | `2c2ce95380e2deb5478bb06c27057d519373bfeabc9259799e400b390e0c5d3e` |
| L10 NFRV `docs/helix-os/L10-verification/nfr-verification.md` | 29,758 | `156c0b6cf45630ba44f3540ceb97dae511fb7bdd93148e1a99ef4e0adfd9e543` |

## 静的確認と限界

`git diff --check` は通過した。6本文上で036のFR AC/CASE参照を確認し、CASE-036-07/08a/08bがすべてAC-03を参照すること、CASE IDが一意であること、両NFR文書が非upgrade保持群をupgrade分母から分離していることを静的に確認した。元のupgrade NFR文言はbase `5857c0a` と逐語比較した。CASE-08aのHARNESS義務欠落とCASE-08bのread-only policy抑止は別々の単独変異で、他入力を保持する記述である。

実fixture、旧test、CI、runtime、CLI、hookは実行していない。HARNESS-L2-005本文の選択・owner契約はこの作業前に読んだ範囲に限られ、他のHARNESS親や全consumerを再監査したものではない。他のOS Stage 3親・他stageも対象外である。今回の修正後6本文について独立reviewと対象revisionの条件3照合は未実施であり、PO事後確認も未記録である。
