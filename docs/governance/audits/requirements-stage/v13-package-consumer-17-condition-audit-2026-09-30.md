# v1.3 §4.6.1 package/consumer 17条件のStep5個別監査

- 基準main: `d41c0f6c527a9193051b046bc6a8487734338686`
- 固定比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`（SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）
- 条件数: 17（全件 `unresolved`／`primary_residual`）
- 対象外: 同じ§4.6.1に残る11条件（`00225, 00242–00246, 00248–00249, 00251, 00255–00256`）
- authority effect: `none`。採択・successor・closure・L11実行/受入は主張しない。

## queueと対象範囲

v1.3 closure queue `v13-condition-closure-work-queue-2026-09-30` のbasis `2bf484b1a84af346feaf8cf7b72e59f3889e6333`、queue SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`。母集団303 condition rowsはcovered 3、implementation-only 31、partial 84、unresolved 171、version-target 14。一次残差255件（partial 84＋unresolved 171）のうち、§4.6.1 group 17は28件すべてunresolved。選定17件はsource row tupleをarchive raw bytesから再計算し、全行が既存個別監査ref 0件・後発source-citation join 0件である。

prior exact-identity exclusions:
- `docs/governance/audits/requirements-stage/v13-policy-lines-167-171-condition-audit-2026-09-30.json` SHA `3be27e97d0d250fbc386b33d1d3062606f5a76e4d4aa28382ba813f07d7e33d7`: `REQSRC-SUP-00127, REQSRC-SUP-00128, REQSRC-SUP-00129, REQSRC-SUP-00130, REQSRC-SUP-00131`
- `docs/governance/audits/requirements-stage/v13-policy-resolver-seven-condition-audit-2026-09-30.json` SHA `a358b6fe6461ca57a1fda10ac81404f8f25bbcd0a4f3cf93e43d39fa3d3502d4`: `REQSRC-SUP-00118, REQSRC-SUP-00120, REQSRC-SUP-00121, REQSRC-SUP-00122, REQSRC-SUP-00123, REQSRC-SUP-00124, REQSRC-SUP-00132`
- `docs/governance/audits/requirements-stage/v13-execution-policy-registry-seven-condition-audit-2026-09-30.json` SHA `b1fc593b9b373ad8ed83cfde210e1f193e62ba4a2b95349f46847828650a25a8`: `REQSRC-SUP-00134, REQSRC-SUP-00135, REQSRC-SUP-00137, REQSRC-SUP-00138, REQSRC-SUP-00139, REQSRC-SUP-00140, REQSRC-SUP-00141`

## 旧sourceとconsumer

旧source §4.6.1 lines 296–345はmulti-project packageのdevelopment source authority、manifest/artifact、consumer setup、9 acceptance ID、段階昇格、rollback、approvalをまとめる。冒頭は`RetryYN/HELIX-HARNESS-DevOS`を当時のdistribution destination、旧`RetryYN/HELIX-HARNESS-OS`をcompatibility-onlyとするが、旧target名・旧repositoryは現行authorityにしない。source identity/statusはlegacy asset ledgerで`source_status_not_declared`; v1.3 headerの“document revision confirmed”は文書revision状態で、target adoptionではない。
補助旧consumer evidence: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L13-post-deploy/post-deploy-evidence-boundary.md`（SHA `d2f87c2a0cdeef4ef1902737af53638c8125c3e7679c6804207de02d6f6e99ba`）lines 13/21/26–28/32ではdistribution・consumer smoke・monitoring・rollbackとaction-binding approval前の不可逆作用を境界化し、consumer doctorをreadiness evidenceとしている。旧distribution design `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md`（SHA `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c`）lines 22–29,31–56,58–64,68–97も読んだ。同文書は`HELIX-HARNESS-LITE`/`consumer_core_v1`、profile allowlist、consumer repo/channel、standing authorization等の歴史要件を含むため、v1.3 atomの補助consumerだけに用い、現行target/operation authorityへ移さない。JSONに参照行text/hashを固定した。

## 固定f6 comparison pairと後発decision
f6固定比較pairは以下の8 identity。2026-09-28 PO decisionは列挙したexact f6 L2/L11 bytesの候補を採用対象とする。各MPRの`registered_proposal`／`authority_effect=none`という登録状態とは区別して記録する。

| L2 identity | f6 L2 file SHA-256 / raw section | f6 L11 file SHA-256 / acceptance row | PO decision row |
|---|---|---|---|
| HARNESS-L2-006 | `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` / detail lines 283, 285 | `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4` / line 26 | harness decision line 38 |
| HARNESS-L2-010 | 同上 / section line 340、SHA `9fbd159e2b1cbf31ef16913e29b33417ab2f247e2c0f0328268f2c9f67e2d6b4` | 同上 / line 205、SHA `45e5b5df4e631edc08d2101c46ff517936d5277efe41a8726d64909666c9e00e` | harness decision line 39、SHA `e05447d9241d09963475a9c8c3f43f02a1cd72e187c24d8663ff90ca1317a6ac` |
| HARNESS-L2-011 | 同上 / section line 352、SHA `30eb7f1ebc78889dc640155aa09811c7a6bcc2938bb4e34f122f245442c97952` | 同上 / line 206、SHA `beeac9a7d9da69080ce4a346cbc1f9472e271ab778f16c0a245950532dd6c24e` | harness decision line 40、SHA `ca300e82c75d4c2587945116224d8bc760d9d2a2d292310e6ab7dcc92942e105` |
| HELIXOS-L2-021 | `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` / section line 702 | `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c73367af5edd680` / section line 366 | f6 OS decision; full pins in JSON |
| HELIXSECURITY-L2-008 | `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c` / identity row line 46 | `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01` / line 32 | f6 SECURITY decision; full pins in JSON |
| HELIXSECURITY-L2-010 | 同上 / section line 160、SHA `8d63bbbd688538d1a743705539e404b3a684d0631fcd585c74ef387bfca2fb31` | 同上 / line 34、SHA `32899857483ad207399418c9e7e57da031cb1f0f5e0a343acc077af2ed015cb9` | SECURITY decision line 48、SHA `62ad76c73c98d4f35e1cb66e85fa2ed0317bf03874ed79df86518d9425cc6a62` |
| HELIXSECURITY-L2-013 | 同上 / section line 190、SHA `e6daf304f8d09b86237dde6dfb2ec99029673ef920dcbd3538c56b449edeee3e` | 同上 / line 37、SHA `faf90179d239d7d7e8c5012816839fcbe002349fa6bdb07cd821760bec27b2aa` | SECURITY decision line 51、SHA `0fe66d3c315a49b64b4f2c321b3dfe0fcb445d7a59e3088e2aba569a5c58d30f` |
| HELIXSECURITY-L2-023 | 同上 / section line 292、SHA `c2e3deb8aea7a46916c9c39943643c33e28e0487e31422f3e4e6236cf266ae35` | 同上 / line 47、SHA `b0a0810ca8c02fa58ec0785af9a996b845742beac96cc8badd825d883e2db7a0` | SECURITY decision line 61、SHA `7b8f9dbc36614f6640f3f6c1f9475b6224838311438641ac95cc478186145fd6` |

Harness L2/L11全体SHAは各行に記載の共通値。Security L2/L11全体SHAも同様。PO decision filesの全体SHAはJSONに固定した。HARNESS-L2-010はpackの入力/出力/dependency/検証範囲/version、明示的な収載/除外、version階層の分離、同一input/versionでの再現と失敗時の戻し先を扱う。HARNESS-L2-011は画面・作業環境に依存しない呼出しと能力/contract/dependency versionを扱う。SECURITY-L2-010は更新candidateとrollback可否、欠落時のunknown/reject、SECURITY-L2-013はartifact identity/version/digest/provenanceの工程trace、SECURITY-L2-023はSECURITY admission→Worker→HARNESS verification→OS promotionの段階分離とfailure/unknown時の停止を扱う。これらは各source lineの類似範囲だけに比較し、旧source条件の採択やclosureには使わない。

後発57 record SHA `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`は42 adopted／11 conditional／4 held、別11 record SHA `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`は11 identities（table 10 adopted＋HARNESS-L2-049 not adopted）。両recordに重なるHELIXOS-L2-038、HARNESS-L2-041は各revision/decision statusを別々に記録する。OS-030 hold maintained noteはこの11候補screenとは別の重複status noteとして保持する。57＋11 recordの68 screen-entry/status（identity重複2件を含む66 distinct identity）と各row hashをJSONに入れた。OS-030（MPR-RC-HELIXOS-L2-030-003）はheld、OS-033（MPR-RC-HELIXOS-L2-033-001）はadopted。318ec4a pairのraw section slice hash・decision row digest・MPR candidate_semantic_digest（L2/L11）を別フィールドで照合し、意味digestとraw bytes hashを混同しないようJSONにpinした。

## 条件別照合

### REQSRC-SUP-00227 — 旧source line 303 / V13-PKG-01

- 原文: 1. **authority／manifest**: package manifestはsource repository／HEAD、requirements version／digest、（line SHA-256 `e9e1a713584ba5e78dc6fe35c7b77bcf679ce11b50fe65622d53e99559fd858b`）
- source clause: package manifestにsource repository/HEADとrequirements version/digestを束縛する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), OS-L2-030 (unadopted proposal), REG-05`
- f6固定比較pair: `HARNESS-L2-006, HELIXOS-L2-021, HELIXSECURITY-L2-008, HELIXSECURITY-L2-013`
- 保持・変更: HARNESS-L2-006は外部提供serviceのscopeを担い、OS-L2-021は対象projectへのinstall/update/recoveryを担う。 SECURITY-L2-013はbuild/validation/distribution/executionにわたるartifact identity/version/digest/provenanceのtraceを保つ。 SECURITY-L2-013はartifactの同一性と工程traceを要求するが、旧sourceが求めるrepository/HEADとrequirements version/digestの完全なmanifest field bindingまでは定めない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033との近接点は、選択されたcapabilityのidentity/version/config/source snapshotと再現性のprovenanceに限る。packageの収載/除外、package version、generated index、license、artifact公開受入は定めない.
- 残差: repository/HEAD、requirements version/digestをartifactと同じmanifestで厳密に照合するoracleは残る。
- 反例: artifactのbuild元と異なるrepository/HEADをmanifestが示す。 requirements digestが欠落または古いのにpackageをeligibleとして扱う。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00228 — 旧source line 304 / V13-PKG-01

- 原文:    package version、artifact digest、include／exclude exact set、generated index、first／third-party区分、（line SHA-256 `785d340f1cadad83fb5b5cc35c8f72881f748a315c8c4db0dc19ea483ad5782b`）
- source clause: package version/artifact digest、収載/除外の厳密な集合、generated index、first/third-party区分を束縛する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), OS-L2-030 (unadopted proposal), REG-05`
- f6固定比較pair: `HARNESS-L2-006, HARNESS-L2-010, HARNESS-L2-011, HELIXOS-L2-021`
- 保持・変更: HARNESS-L2-010は収載/除外packを明示し、pack version/maturityをrelease-unit/product versionと区別する。未検証・未適格packの暗黙収載を拒み、同一input/versionから同じ成果物を再現し、失敗時は直前の適格版または明示replacementへ戻す。 HARNESS-L2-011は画面/work environmentに依存しない呼出しに、能力名・contract版・dependency版を要求する。HARNESS-L2-006のlines 283/285も収載/除外scope、同じsource/registry/profileでのmanifest/artifact再現、clean consumer利用を保つ。 OS-L2-021は対象project側のinstall/update/recoveryを担う。 採択HARNESS-L2-010はpackの境界とrelease unit内での採否を扱う。旧HR-ACのfile-level generated index schemaやfirst/third-party分類をそのまま採択したものではない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033との近接点は、選択されたcapabilityのidentity/version/config/source snapshotと再現性のprovenanceに限る。packageの収載/除外、package version、generated index、license、artifact公開受入は定めない.
- 残差: exact generated index形式、package/artifact単位のinclude/exclude集合との照合、first/third-party item分類と過不足時の拒否条件が残る。
- 反例: 未列挙fileや重複pathを含むartifactが通る。 同一input/versionで異なるartifact digestが出ても拒否されない。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00229 — 旧source line 305 / V13-PKG-01

- 原文:    license／attribution、build environmentを束縛する。manifest外file、重複path、digest driftを拒否する。（line SHA-256 `84c9dfb90911cdc8438c5e34570a6ed033d2b1ca1d0c482726719ce1784f9abc`）
- source clause: license/attribution/build environmentを束縛し、manifest外file・重複path・digest driftを拒否する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), OS-L2-030 (unadopted proposal), REG-05`
- f6固定比較pair: `HARNESS-L2-006, HARNESS-L2-010, HELIXSECURITY-L2-013`
- 保持・変更: HARNESS-L2-010はpackごとのinput/output、dependency、検証範囲、versionを宣言する。SECURITY-L2-013はartifact producerと各工程のidentity/digest/provenanceをtraceする。 これらの採択条件はartifact trace性を保つが、license/attributionやbuild environmentの完全な証明をHR-ACのfield単位で規定しない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033との近接点は、選択されたcapabilityのidentity/version/config/source snapshotと再現性のprovenanceに限る。packageの収載/除外、package version、generated index、license、artifact公開受入は定めない.
- 残差: license/third-party attribution/build environmentのmanifest binding、path正規化、duplicate/drift診断。
- 反例: license/attributionが欠落した公開候補を受け入れる。 build environment変更やmanifest外pathを検出しても候補が無効化されない。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00230 — 旧source line 306 / V13-COND-L0306

- 原文: 2. **自己適用除外**: project固有PLAN／design／test evidence、`harness.db`、`.helix` runtime state／memory、（line SHA-256 `4bebdaa728a5fe488569eaf7a9bc39885c83eb831ced0e64abf7cc4d16560f4a`）
- source clause: project固有のPLAN/design/test evidence、harness.db、.helix runtime state/memoryをpackageから除外する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `なし（固定pairは本監査で照合）`
- f6固定比較pair: `HARNESS-L2-006, HELIXOS-L2-021, HELIXSECURITY-L2-008`
- 保持・変更: 旧sourceはconsumer向けassetを保ちながらdevelopment/dogfood stateを除外する。 固定HARNESS-006とOS-021は、この全除外一覧をpackage build規則として定義しない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryとreplay条件であり、このsource条項やpackage除外oracleを直接定めない.
- 残差: 除外するpath/typeの完全な列挙と、入れ子・改名・可変stateへの扱い。
- 反例: development PLAN/test evidence、harness.db、.helix runtime/memoryが、名前を変えたpathや入れ子pathから同梱される。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00231 — 旧source line 307 / V13-COND-L0306

- 原文:    credential、PII、absolute machine path、development-only audit／handoverを同梱しない。runtimeに必要な（line SHA-256 `b2f0ce5831378febff124adbd94024fa39256b19e7ad8f65ee81e41b3f2e307b`）
- source clause: credential、PII、絶対machine path、development-only audit/handoverを同梱しない
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `なし（固定pairは本監査で照合）`
- f6固定比較pair: `HARNESS-L2-006, HELIXOS-L2-021, HELIXSECURITY-L2-008`
- 保持・変更: SECURITY-008はoperationごとのauthorityを扱う。このsource条件はそれとは別にpackage contentを制約する。 固定pairは機微情報やdevelopment-only情報の同梱を許可しない。また、単純な文字列scanだけでsecret不存在を証明できるとはしない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryとreplay条件であり、このsource条項やpackage除外oracleを直接定めない.
- 残差: 不存在を証明するためのcontent/path/privacy scanner範囲とprovenance。
- 反例: credential/PIIがnested/generated fileからartifactに入る。absolute host pathまたは非公開handoverが同梱される。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00232 — 旧source line 308 / V13-COND-L0306

- 原文:    schema、method、adapter templateはconsumer-safeな公開assetとして明示列挙し、dogfood除外を理由に（line SHA-256 `f08c9f6de7bfdc1d2a8820d993b45cd1fd29426df2eb39952de228212e9ba527`）
- source clause: consumer-safeなschema/method/adapter templateを明示列挙し、dogfood除外によってdoctor/gateを縮退させない
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `なし（固定pairは本監査で照合）`
- f6固定比較pair: `HARNESS-L2-006, HELIXOS-L2-021, HELIXSECURITY-L2-008`
- 保持・変更: HARNESS-L2-006は外部で利用可能な選択機能を保ち、OS-021は対象projectへのinstall/update/recovery境界を保つ。 固定pairは厳密なallowlist/denylistを定めず、development data除外後にもconsumer doctor/gateが完全であることを証明しない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryとreplay条件であり、このsource条項やpackage除外oracleを直接定めない.
- 残差: consumer-safe allowlistのidentity/versionと、除外後のdetector/gate完全性の同等性。
- 反例: 必要なconsumer schema/templateがdogfood stateと一緒に除外され、doctor/gate coverageが欠ける。 path prefixに一致しただけでdev-only adapterが暗黙に収載される。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00233 — 旧source line 309 / V13-COND-L0306

- 原文:    doctor／gateを縮退しない。（line SHA-256 `f0ea32caed98d0677bf2c3b1d68be17440042b7e6aeb9e15689893b272d0768b`）
- source clause: development-only contentの除外を理由にdoctor/gate機能を減らさない
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `なし（固定pairは本監査で照合）`
- f6固定比較pair: `HARNESS-L2-006, HELIXOS-L2-021, HELIXSECURITY-L2-008`
- 保持・変更: 現行HARNESSは、serviceを選択して利用する範囲を保つ。 f6 pairは旧doctor/gate実装やdetector一覧そのものを要求していない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryとreplay条件であり、このsource条項やpackage除外oracleを直接定めない.
- 残差: package filtering後のconsumer doctor/gate機能と、その不足を検知するnegative oracle。
- 反例: privacy除外は通る一方でconsumer doctor/gateに必須機能がないのにreadyと報告する。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00239 — 旧source line 315 / V13-PKG-04

- 原文:    consumer成果とconsumer-owned `.helix` evidenceを保持する。（line SHA-256 `162672f0aa61a7c4319c62981764541671c15aaa8d944e848e21edf1dc81bfb0`）
- source clause: setup/upgrade/rollback/uninstall中にconsumer成果物とconsumer所有の.helix evidenceを保全する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), OS-L2-030 (unadopted proposal), REG-05`
- f6固定比較pair: `HARNESS-L2-006, HELIXOS-L2-021, HELIXSECURITY-L2-008`
- 保持・変更: HARNESS-006 L2/L11はHELIX内部の運用stateと分けたservice利用を保ち、OS-021は選択した対象projectへの配布/update/recoveryを扱う。 固定pairは旧来の包括的path schemaを保全せず、consumer所有fileの変更を許可もしない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryとreplay条件であり、このsource条項やconsumer成果保全oracleを直接定めない.
- 残差: managed-markerの所有境界、consumer成果/evidenceの変更前後byte oracle、rollback/uninstall時の保全条件。
- 反例: setupがmarker外のconsumer dataを上書きする。rollbackでconsumer所有の.helix evidenceを削除する。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00259 — 旧source line 337 / V13-PKG-01

- 原文: | `HR-AC-HYB-008-01` | manifestのinclude／exclude exact set、source／requirements／artifact digest、versionが一致する |（line SHA-256 `93d43f38c8b93da59953d053c318c432dca75b211befab00470f6d0aac06274a`）
- source clause: HR-AC-HYB-008-01: manifestの収載/除外、source/requirements/artifact digest、versionが一致する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- f6固定比較pair: `HARNESS-L2-006, HARNESS-L2-010, HARNESS-L2-011, HELIXSECURITY-L2-013`
- 保持・変更: HARNESS-L2-010はpackのinput/output/dependency/検証範囲/versionと、同じinput/versionからの成果物再現を保つ。HARNESS-L2-011は呼出し側が能力名・contract版・dependency版を照合する。 SECURITY-L2-013は生成/build/validation/distribution/executionでartifact identity/version/digest/provenanceをtraceし、検証済artifactと配布/実行artifactの不一致を拒む。 これらは個々のpack/工程での境界を保つが、HR-AC-01の全manifest field、requirements digestとの結合、file-level generated indexを同時に検証する一つのoracleではない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033の近接点は、選択capabilityのidentity/version/config/source snapshotと再現性provenanceまで。packageのfile集合、version、index、license、公開受入を保証しない.
- 残差: package manifestのinclude/exclude、source/requirements/artifact digest、version間の完全一致とgenerated indexの独立整合確認。
- 反例: manifest field/version/digestが1つ不一致でも受け入れる。 index宣言外のfileがartifact内に残る。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00260 — 旧source line 338 / V13-PKG-02

- 原文: | `HR-AC-HYB-008-02` | dogfood／state／credential／PII／absolute path混入mutationを全て拒否する |（line SHA-256 `80fffc7593ee85a1bac812fbf893a8ed28892b2e41be1964d266960e9df8164d`）
- source clause: HR-AC-HYB-008-02: dogfood/state/credential/PII/absolute pathの混入mutationをすべて拒否する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- f6固定比較pair: `HARNESS-L2-006, HELIXOS-L2-021, HELIXSECURITY-L2-008`
- 保持・変更: SECURITY-008はoperation authorityを扱うが、OS-033のprovenanceはpackage content除外の代替にならない。 固定pairはこのpackage content mutation oracleを採択していない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryと再現条件に限られ、content除外を証明しない.
- 残差: 機微情報/stateの完全な除外範囲と、未知/nested pathに対するnegative動作。
- 反例: dogfood state、credential、PII、absolute pathのいずれかが入ってもpackageが受け入れられる。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00261 — 旧source line 339 / V13-PKG-03

- 原文: | `HR-AC-HYB-008-03` | clean／既存／monorepo consumerへのsetup再実行がidempotentで、consumer所有bytesを保全する |（line SHA-256 `626a4228c3cedd86c92bca724eb13282ffbbc9f3221eae998ac11ce527db1322`）
- source clause: HR-AC-HYB-008-03: clean/existing/monorepoでsetupを再実行しても冪等で、consumer所有byteを保全する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- f6固定比較pair: `HARNESS-L2-006, HELIXOS-L2-021, HELIXSECURITY-L2-008`
- 保持・変更: HARNESS-006はclean consumerでの利用を含み、OS-021は対象projectへのinstall/update/recoveryを扱う。 固定pairは3種類のconsumer構成、setup再実行の冪等性、marker外byteの保全をまとめて保証しない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryと再現条件に限られ、consumer構成や所有byte保全を定めない.
- 残差: 3種類のfixture matrixとmanaged-marker/consumer所有境界の厳密なbyte oracle。
- 反例: 2回目のsetupで内容が重複する。monorepo内のnested project fileまたはconsumer所有.helix evidenceが変わる。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00262 — 旧source line 340 / V13-PKG-04

- 原文: | `HR-AC-HYB-008-04` | README、LICENSE、third-party attribution、provenance、免責の欠落を拒否する |（line SHA-256 `bae19bc3cf3f95acb152181dae1459f9a4dfaa79c8c3096749d7d3891c0c9ea8`）
- source clause: HR-AC-HYB-008-04: README/LICENSE/third-party attribution/provenance/disclaimerの欠落を拒否する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- f6固定比較pair: `HARNESS-L2-006, HELIXOS-L2-021, HELIXSECURITY-L2-008`
- 保持・変更: HARNESS-006は提供artifact/source/必須dependencyの関係を保持する。 固定HARNESS-006/OS-021は、5項目の文書・権利・provenance完全性oracleを定義しない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryと再現条件に限られ、法的文書や公開受入を定めない.
- 残差: 現行license/attribution evidence、READMEの契約範囲、provenanceとdisclaimerの整合。
- 反例: 必要な文書/attribution/provenance/disclaimerが欠落または古いのに公開候補がpassする。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00263 — 旧source line 341 / V13-PKG-05

- 原文: | `HR-AC-HYB-008-05` | clean Linuxでinstall→setup→status→consumer doctor→minimal workflow dry-runがgreenになる |（line SHA-256 `b63af3bc94d2a483e551baf39a6c66093667f92a8c7061306f70c48277b4a395`）
- source clause: HR-AC-HYB-008-05: clean Linuxでinstall→setup→status→consumer doctor→最小delegated workflow dry-runをgreenにする
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- f6固定比較pair: `HARNESS-L2-006, HELIXOS-L2-021, HELIXSECURITY-L2-008`
- 保持・変更: HARNESS-006はHELIX内部の運用stateなしで選択serviceを外部利用する価値を保つ。 ここではf6のacceptance実行を証拠としていない。固定pairもこのOS fixture sequenceを採択していない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryと再現条件に限られ、consumerのinstall/workflow acceptanceを定めない.
- 残差: clean Linux consumerでのfresh-process出力とrevisionの対応、workflow要件。
- 反例: bare command欠落、doctor失敗、workflow未解決、artifact/source revision不一致があるのにgreenと報告する。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00264 — 旧source line 342 / V13-PKG-06

- 原文: | `HR-AC-HYB-008-06` | Windowsで同一Node artifactとPowerShell entrypointのcompatibility smokeがgreenになる |（line SHA-256 `be7e674c8e8288e33d4f3e8c0077a05ac4a24d3522a564209656afe3cd7b4c43`）
- source clause: HR-AC-HYB-008-06: Windows smokeは同一Node artifactとPowerShell entrypointを使う
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- f6固定比較pair: `HARNESS-L2-011, HELIXSECURITY-L2-013`
- 保持・変更: HARNESS-L2-011は特定GUI/provider/CIに依存しない呼出しと、宣言したcontract/dependency versionを保つ。 SECURITY-L2-013はbuild/validation済artifactと配布/実行artifactのidentity・digest・provenanceを同じ鎖で照合し、差異や欠落工程を拒む。 採択SECURITY-L2-013は同一artifactの工程間integrityを扱うが、旧Node artifact/PowerShell entrypointをWindows要件として指定しない。HARNESS-L2-011もOS別smokeを定めない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryと再現条件に限られ、Windows smokeや同一artifact証明を定めない.
- 残差: Windows compatibility matrix、同一Node artifactを使うWindows smoke、PowerShell entrypointの互換性証拠が残る。
- 反例: Windowsで別build/編集済みartifactを使いdigestが異なるのに同一packageとしてpassする。 宣言matrix外platformの互換性を推定する。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00265 — 旧source line 343 / V13-PKG-07

- 原文: | `HR-AC-HYB-008-07` | canary／preview／stableが同一artifact digestをpromotionし、stage skip／rebuild差替えを拒否する |（line SHA-256 `47729d0f8b9b6d5f994c81e5ba1496391ec3b0b4bd5a0937f2881f8156223324`）
- source clause: HR-AC-HYB-008-07: canary→preview→stableを同じartifact digestで一方向昇格し、stage skip/rebuild差替えを拒否する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- f6固定比較pair: `HARNESS-L2-010, HELIXSECURITY-L2-013, HELIXSECURITY-L2-023`
- 保持・変更: HARNESS-L2-010は同一input/versionから同じpack artifactを再現する。 SECURITY-L2-013は生成から利用までのartifact identity/digest chainを結び、検証対象と配布/実行対象の差替えを拒む。SECURITY-L2-023は更新candidate→SECURITY admission→Worker→HARNESS verification→OS promotionを別状態で追跡し、failure/unknownで後段を停止する。 これらはartifact再現と工程間整合、および更新審査からOS昇格までの別状態を保つ。旧canary→preview→stableの順序や各段のentry/receiptを直接定義してはいない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detector capabilityのversion/config/scopeと同一input replayを記録する。段階配布channel、channel間receipt継承、stage skip/rebuild拒否は定めない.
- 残差: 現行stage identity/順序、各段のentry/observation/stop条件、channel間receipt、同じartifactを用いた段階昇格とskip/rebuild拒否の組合せ。
- 反例: 段階を飛ばす、rebuild後に差し替える、段階間でdigestを変えても拒否されない。 更新審査各段のunknown/failureを後段でgreenとして進める。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00266 — 旧source line 344 / V13-PKG-08

- 原文: | `HR-AC-HYB-008-08` | rollback rehearsalが直前tagへengine pinを戻し、consumer所有成果を変更しない |（line SHA-256 `eeb4e363b0528619cac2a34ebfb20d899a2ac951a2c0025dc9bfa2c93ea212e1`）
- source clause: HR-AC-HYB-008-08: rollback rehearsalで直前のimmutable tag/engine pinへ戻しconsumer成果を変えない
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- f6固定比較pair: `HARNESS-L2-010, HELIXSECURITY-L2-010, HELIXSECURITY-L2-013, HELIXSECURITY-L2-023`
- 保持・変更: HARNESS-L2-010は失敗時に直前の適格versionまたは明示replacementへ戻す。 SECURITY-L2-010は更新candidateにrollback可否を含め、rollback欠落を黙って受け入れず、情報不足をunknown/rejectとして審査へ戻す。SECURITY-L2-013は工程間artifact identity/digest/provenanceを結ぶ。SECURITY-L2-023は各段のfailure/unknownで後段昇格を止め、途中状態を成功扱いしない。 採択pairはrollback可否と失敗時の戻し境界を保つが、実際のrollback rehearsal合格、直前immutable tag/engine pinの復元、consumer-owned outputのbyte不変を保証しない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 OS-033のreplayは選択capabilityの再現性に限る。rollbackを許可せず、前tagの適格性やconsumer byte保全も証明しない.
- 残差: rehearsalの実証、戻し先tag/pinの適格性と不変性、rollback前後のconsumer-owned output保全が残る。
- 反例: 適格でないtag/異なるdigestへ戻す。 consumer-owned outputを削除/上書きする。 rehearsal証拠なしでrollback完了とする。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00267 — 旧source line 345 / V13-PKG-09

- 原文: | `HR-AC-HYB-008-09` | remote sync／tag／publish／promotion／cutoverをapproval snapshot不在またはdrift時に拒否する |（line SHA-256 `fafe1b8c140e14e1108fa937f522cd2500b3be4268d9eba52f8019c94413ab97`）
- source clause: HR-AC-HYB-008-09: approval snapshot欠落/drift時はremote sync/tag/publish/promotion/cutoverを拒否する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- f6固定比較pair: `HARNESS-L2-006, HELIXOS-L2-021, HELIXSECURITY-L2-008`
- 保持・変更: SECURITY-008はoperationごとにactor/target/operation/revision/environment/scope/expiryの厳密なauthorityを要求する。 固定authority pairはpackage pipeline用snapshot schemaや恒常的なrelease authorizationを定めない。ここから新たなauthorityは導かない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryと再現条件に限られ、operation approvalや外部操作を許可しない.
- 残差: approvalに束縛するpackage snapshotのfield、期限、target/parameter/revision drift、return/rollback経路、外部操作ごとの対応。
- 反例: approval snapshot欠落/期限切れ/driftでもremote sync/tag/publish/promotion/cutoverが進む。Issue/PR/package passをapprovalとして扱う。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

## 9 acceptance oracle・数値・反例の横断確認

旧sourceは`HR-AC-HYB-008-01..09`の独立oracleを9件明示する。consumer fixtureはclean/existing/monorepoの3種、platformはLinux primaryとWindows compatibility smokeの2種、旧stage labelはcanary→preview→stableの3段である。数値score・閾値・全体pass割合は定めない。旧channel labelはsource上の証拠であり、現行channel enumとして採択されたものではない。

拒否・unknown時に残る論点は、manifest外file/duplicate path/digest drift、dogfood/`.helix` state/credential/PII/absolute path混入、setup再実行時のconsumer bytes/evidence変更、README/LICENSE/third-party attribution/provenance/disclaimer欠落、Linux/Windows consumer workflow失敗、stage skip/artifact差替え、不適格なrollback先またはconsumer成果の損失、approval snapshot欠落/drift時のremote sync/tag/publish/promotion/cutoverである。9件を個別oracleとしてJSONの各条件に対応づけた。

## OS-030/033近接pairとコピー残存scan

OS-030は9件のHR-AC oracleを含むL2/L11候補pairだが、57 decisionで保留され、後続11 decisionも保留を維持する。候補本文とL11にoracleが揃っていても、採択・source successor・closureにはならない。OS-033の採択範囲は選択engine/detectorのidentity/version/config/scope、snapshot再実行とprovenanceに限る。manifest/artifact digestとの近接性はあるが、package file-set、法的文書、consumer install、stage昇格/rollback、operation approvalを代替しない。

固定f6のHARNESS/OS/SECURITY L2/L11計6文書と、監査基準revisionの同じ6文書を対象に、9個の旧HR-AC ID、旧distribution repository名、`harness.db`/`.helix runtime state`、旧3 channel列を完全一致で検索した。f6固定targetでは旧HR-AC-008 ID群は検出されない。固定OS L2での唯一のhitはline 780の旧asset比較表にある`harness.db`不保持例の言及で、runtime stateの同梱や実装コピーではない。監査基準revisionのOS L2/L11では、OS-030候補のdecision境界と9 oracleの候補記載を検出した。governance source snapshot `docs/governance/requirements-source/helix-requirements_v1.3.md`はarchive sourceと同一bytes/hashの読み取り専用保存copyであり、意図的なsource_snapshot_preservationとして記録した。検索は文字列一致に限られ、repository全体に意味的copyがないとは主張しない。hitのpath/line/hashはJSONに保持した。

## 検証境界

JSONとMarkdownの17 source identity集合/見出し集合を一致させる。旧sourceと各行、f6固定pairのfile/row/section、OS-030/033 pairのsection/decision row、57＋11全screenのhash/status、copy read-afterを静的にassertする。旧runtime/test/CLI/hook/CIは実行しない。source snapshot以外に現行targetのbyte-identical copyや実装があるとは推定しない。formal successor 0、採択 0、closure 0。
