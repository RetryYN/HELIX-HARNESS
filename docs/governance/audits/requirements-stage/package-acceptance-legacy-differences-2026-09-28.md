# REG-05で既決条件と分離して扱う旧条件

基準commitは`42a63af75a65d3b52a0be0c72d142979e1caf4ea`。既存PO判断と固定要求本文を読み、旧原文との残差を記録する。ここに書く選択肢はPO判断を生成せず、候補文の採否を先取りしない。

## 旧source・現行decision

- 旧`helix-harness-requirements_v1.3.md`（`LEGACY-ASSET-02319C2481B9E01698D5`、SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）§4.6.1 lines 296–345はmulti-project consumer packageとHR-AC-HYB-008-01..09を定める。旧`distribution-package-release-requirements.md`（`LEGACY-ASSET-9B7682EBDEA171005D45`、SHA-256 `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c`）lines 22–29, 31–64, 68–97は旧repository/profile、stage promotion、standing authorization、implementation detailsを定める。
- 現行HELIX-OS PO decision `HDEC-HELIXOS-REQUIREMENTS-PO-2026-09-28`はfixed OS-L2-001..029とその対L11を合意し、L2-021をversion_target 1.0で採択した。新しいL2-030はこの対象集合に含まれない。decision lines 52, 56–59は既決の版適用条件保持、旧source未完保持、デグレ検証必須、実装・実行・配布・release許可なしを定める。
- OS L2-021 lines 702–710は選択HARNESS構成版の対象projectへの導入・更新・復旧とartifact／scope／rollback traceを1.0で担う。L11 lines 366–371は異なるartifact、成果消失、無許可tag/publication/cutoverを拒否する。HARNESS L2-006 lines 274–295はpackage意味をHARNESS側とし、運転はOS、旧module/channel enumは未採択とする。
- 現行SECURITY PO decision `HDEC-HELIXSECURITY-REQUIREMENTS-PO-2026-09-28`はA案：全operation authority境界を適用し、有効な既決権限を再利用し、通常作業の毎回承認は追加しない。SECURITY-L2-008が外部作用の権限scopeを所有する。
- 固定本文SHA-256: OS L1 `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`; OS L2 `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`; OS L11 `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`; HARNESS L2 `d9d57ce3c71fd80555228b46a24d8a31cb119568371f42115c682be1a33cc8d1`; HARNESS L11 `fcf5c0df1c633e5fd96c50312a092c294cc767deb7cde2cd9ec6be520a2031d7`; SECURITY L2 `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`; SECURITY L11 `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`. PO records are `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md`, `stage-release-po-decisions-2026-09-27.md`, and `helix-security-requirements-po-decision-2026-09-28.md`.

## 旧機構名・runtime・提供先

| 旧条件 | 選択肢 | 推奨・保持する利用価値 | 影響 |
|---|---|---|---|
| `RetryYN/HELIX-HARNESS-DevOS`、`HELIX-HARNESS-LITE`、`consumer_core_v1`、旧exact allowlist | A. 旧名・旧targetをそのまま要求する。B. 対象を固定せず、現行の承認済みconsumer/profile authorityからtargetを入力し、package consumerとして使える利用価値を保持する | **B**。旧固定target/profileは継承しない。clean／既存／monorepo consumerへ非破壊導入してHARNESSを利用できる価値は残す。公開先、visibility、契約は現行owner/authorityを使い別途定める。候補本文はこの課題の解決を作り出さない | HELIXOS-L2-030、HELIXOS-L2-021、HARNESS-L2-006／017、HELIXOS-L1-005／007 |
| 同じNode artifact、POSIX／PowerShell entrypoint、旧CLI名・旧実行モデル | A. 旧方式を必須仕様にする。B. clean LinuxとWindowsでのconsumer利用と同一artifact identityを残し、現行実装方式を下流で導出する | **B**。Node／CLI／PowerShell実装は旧方式として採用せず、Linux primary consumer利用とWindows compatibilityという利用者結果は捨てない。旧runtime・CLIは実行もfallbackもしない | HELIXOS-L2-030、HELIXOS-L2-021、HARNESS-L2-006／017、OS L3/L10 |
| canary→preview→stableと旧Lite／Full・channel enum | A. 旧channel語とenumを正本化する。B. 同一artifact、stage順序、stage skip／rebuild差替え拒否を維持し、stage taxonomyを既決の現行contractへ委ねる。C. 3段のchannelを含めない | **B**。既存OS sourceは旧Slice／Module／Bundle名・channel enumを不採択としており、既決stage-release decisionはHELIX自身のv0.x構成と製品package channelを分離する。旧三段と資格条件はL2の未処分条件、L11の比較fixtureとして残す。現行channel契約が未確定ならstage意味は未確定として残し、fixture labelを実配布契約へ昇格しない。promotionが同一artifactを保つ保証は消さない | HELIXOS-L2-030、HELIXOS-L2-021、HELIXOS-L2-014とは別 identity、HARNESS-L2-006 |

## managed markerとstandalone生成fileの境界

旧§4.6.1 line 313はclean／既存／monorepo setupで「managed marker内だけ」をidempotentに投影し、line 314–315はconsumer所有file・marker外行・source/docs/test/Git history・consumer-owned evidenceを変更しないとする。旧L3 detail lines 87–91はconsumer-owned bytes/evidenceの保全を加えるが、marker外standalone generated fileをpackage-ownedとみなす例外を明記しない。したがって提案L2/L11はmarker内の管理境界を維持し、marker外のstandalone fileは明示的owner／境界契約がない間consumer-ownedまたはunknownとして停止する。path名や生成物らしさだけで所有権を推定しない。

選択肢は、A. 現行候補ではstandalone生成fileをmanaged marker内だけに置く、B. 現行追加scopeとしてmarker外の宣言済みstandalone fileも許す、C. marker外standalone生成自体を未対応に保留する。推奨はA（現行の明示境界を維持）。Bは既存consumer ownership条件の拡張となるため、この草稿では採用しない。候補範囲外で必要になる場合はOS-030／OS-021／HARNESS-006の影響を示して返す。

## Action bindingとauthority

旧HR-AC-HYB-008-09はapproval snapshot不在またはdrift時にremote sync／tag／publish／promotion／cutoverを拒否する。旧L3 lines 28–29, 58–64, 93–97は完全一致する事前standing authorizationの下で安全な既定先stage releaseを重複approveなしに許す。現行SECURITY A判断とも、既決権限の再利用・全operation tuple照合・drift拒否の点で整合する。

候補文は「旧standing authorization receiptがあれば自動許可」とは書かず、現行SECURITYで有効かつ完全一致した権限の確認を依存にする。新しい権限や対象targetを追加せず、package pass／CI／ticketから権限を生成しない。通常作業に都度のPO approvalを要求しない。未決点は具体的なtarget・操作・既存authorityの適用scopeが入力として整合するかであり、この起草で許可条件を決め直さない。

## LICENSE・同梱文書

現行commercial-license PO decision（2026-09-27）はroot LICENSE／README／third-party noticesの整合や配布条件を扱ったが、packageの権利許諾、visibility変更、公開、tag、配布を実施・許可したものではない。旧§4.6.1の同梱文書有無・provenance確認の利用価値は保持し、旧商用候補の条文や免責を復活させない。L11は現行の承認済み権利根拠との照合と欠落時の停止だけを確認し、法律効果、価格、契約本文、LICENSE変更を決めない。

## 原文の保持と候補の限界

以下の旧§4.6.1の原文から、package identity、旧技術方式、channelの一部を未処分として保持する。新しい候補への採否は最終横断照合後のPO確認で行う。元の固定要求・受入を採択した判断からこの意味差の採用を生成しない。holdingは意味被覆の代わりではなく、未決条件の原文保全先である。

```text
#### 4.6.1 multi-project配布package

`HR-FR-HYB-008`の配布正本はdevelopment repositoryであり、配布先は
`RetryYN/HELIX-HARNESS-DevOS`とする。旧`RetryYN/HELIX-HARNESS-OS`はcompatibility inputに限り、
current authority、CLI、setup、doctor、receipt、tag pinへ再投影しない。配布artifactはHELIX-HARNESS自身のdogfoodを複製するsnapshotではなく、
任意のconsumer repositoryへ非破壊導入できるmulti-project harness packageである。

1. **authority／manifest**: package manifestはsource repository／HEAD、requirements version／digest、
   package version、artifact digest、include／exclude exact set、generated index、first／third-party区分、
   license／attribution、build environmentを束縛する。manifest外file、重複path、digest driftを拒否する。
2. **自己適用除外**: project固有PLAN／design／test evidence、`harness.db`、`.helix` runtime state／memory、
   credential、PII、absolute machine path、development-only audit／handoverを同梱しない。runtimeに必要な
   schema、method、adapter templateはconsumer-safeな公開assetとして明示列挙し、dogfood除外を理由に
   doctor／gateを縮退しない。
3. **実行境界**:配布CLI、POSIX entrypoint、PowerShell entrypointは同じNode artifactを呼ぶ。Bun、旧UT runtime、
   旧HELIX Python／Bash implementationをconsumer実行authorityへ戻さない。旧HELIXからはsetup／export／guideの
   behavior atomだけを採取し、現行schema・Node transaction境界へ再実装する。
4. **非破壊setup**: clean／既存／monorepo consumerに対し、managed marker内だけをidempotentに投影する。
   consumer所有file／marker外行／`src`／`docs`／test／Git historyを改変・削除せず、upgrade、rollback、uninstallで
   consumer成果とconsumer-owned `.helix` evidenceを保持する。
5. **同梱文書**: READMEはinstall、`helix setup project`、project adapter、status／doctor、minimal workflow、
   upgrade、rollback、uninstall、proxy／CA／mirror、support／security境界を記載する。LICENSE、third-party
   attribution、provenance、免責が欠けるartifactをpublish candidateにしない。
6. **consumer verification**: clean Linuxをprimary fixtureとし、install → setup → status → consumer doctor →
   minimal delegated workflow dry-runをfresh processで再現する。Windows compatibility smokeは同じNode artifactと
   PowerShell entrypointを検証する。自己適用asset混入、未解決bare CLI、package script欠落、network／credential前提、
   non-idempotent再setupをnegative oracleで拒否する。
7. **version／channel**: semverとimmutable tagへsource HEAD／artifact digestを束縛し、release channelを
   `canary → preview → stable`の一方向promotionとする。各channelは同一artifact digest、entry criteria、観測window、
   stop／rollback trigger、promotion receiptを持ち、rebuildによるartifact差替えやstage skipを拒否する。
8. **sync／rollback／monitoring**: developmentからdistribution repositoryへのsyncはdry-run diff、backup、
   restore rehearsal、consumer canary、post-promotion monitoringを持つ。failure時は直前immutable tagへ戻し、
   consumer projectを巻き戻さずengine pinとmanaged projectionだけを復旧する。
9. **approval境界**: package plan／dry-run／local consumer smokeは可逆作業として自走できる。remote sync apply、
   tag、release publish、channel promotion、正式配布先切替、identifier／state cutoverは、actor／tool／target／params、
   reviewed snapshot、期限、rollback、monitoringを束縛したaction-binding approvalなしに実行しない。

受入IDは次のexact setとする。

| 受入ID | 判定oracle |
|---|---|
| `HR-AC-HYB-008-01` | manifestのinclude／exclude exact set、source／requirements／artifact digest、versionが一致する |
| `HR-AC-HYB-008-02` | dogfood／state／credential／PII／absolute path混入mutationを全て拒否する |
| `HR-AC-HYB-008-03` | clean／既存／monorepo consumerへのsetup再実行がidempotentで、consumer所有bytesを保全する |
| `HR-AC-HYB-008-04` | README、LICENSE、third-party attribution、provenance、免責の欠落を拒否する |
| `HR-AC-HYB-008-05` | clean Linuxでinstall→setup→status→consumer doctor→minimal workflow dry-runがgreenになる |
| `HR-AC-HYB-008-06` | Windowsで同一Node artifactとPowerShell entrypointのcompatibility smokeがgreenになる |
| `HR-AC-HYB-008-07` | canary／preview／stableが同一artifact digestをpromotionし、stage skip／rebuild差替えを拒否する |
| `HR-AC-HYB-008-08` | rollback rehearsalが直前tagへengine pinを戻し、consumer所有成果を変更しない |
| `HR-AC-HYB-008-09` | remote sync／tag／publish／promotion／cutoverをapproval snapshot不在またはdrift時に拒否する |
```

## 隔離前revisionの二重入力

`PREISO-REV-000026`はv1.3の監査基準`6fabd12512a3659fff4a956692cdd61faeeb16ce`（SHA-256 `1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1`）と隔離前`2d4991042be55268bac30a8bbcdac45b3865030a`（SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）の文書差分である。packageの対象46行は各revisionから別々に入力し、対応行のbytes一致を観測しても同値として一方を消さない。監査基準の全文506非空行を別holdingへ保全した。同じ条件の重複由来であり、92個の独立要求とは数えない。

PR #2207の計測契約receiptは隔離前3行のみだったため、監査基準の対応3行も追加する訂正receiptと`MPR-RC-HARNESS-L2-034-002`を追記する。旧receiptと要求本文は変更しない。新候補の採否は最終横断照合後にまとめて判断へ出す。
