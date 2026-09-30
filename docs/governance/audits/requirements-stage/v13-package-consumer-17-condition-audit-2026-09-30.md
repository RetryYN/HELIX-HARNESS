# v1.3 §4.6.1 package/consumer 17条件のStep5個別監査

- 基準main: `5686bfcf69896c51f593274b8e69f881e278afcc`
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
f6 fixed HARNESS L2/L11 full-file SHA `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` / `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。HARNESS-L2-006はサービス①〜⑦の提供範囲/版/依存/導入条件と選択利用を保持し、detail lines 283/285に機能の収載/除外、same-input manifest/artifact再現、clean consumer利用がある。これは旧HR-AC-008の全体oracleそのものではない。
f6 fixed OS L2/L11 SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` / `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`。HELIXOS-L2-021（L2 heading line 702、L11 line 366）は対象projectの選択構成install/update/recoveryを担う。配布対象へのoperation運転であり、package producer manifest/consumer 9-oracle全体を閉じない。
f6 SECURITY L2/L11 SHA `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c` / `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。HELIXSECURITY-L2-008はoperation別authorityのexact tuple境界で、package content acceptance oracleを代替しない。Decision record whole-file SHAと各row/section raw pinsはJSONに格納した。
後発57 record SHA `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`は42 adopted／11 conditional／4 held、別11 record SHA `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`は11 identities（table 10 adopted＋HARNESS-L2-049 not adopted）。両recordに重なるHELIXOS-L2-038、HARNESS-L2-041は各revision/decision statusを別々に記録する。OS-030 hold maintained noteはこの11候補screenとは別の重複status noteとして保持する。57＋11 recordの68 screen-entry/status（identity重複2件を含む66 distinct identity）と各row hashをJSONに入れた。OS-030（MPR-RC-HELIXOS-L2-030-003）はheld、OS-033（MPR-RC-HELIXOS-L2-033-001）はadopted。318ec4a pairのraw section slice hash・decision row digest・MPR candidate_semantic_digest（L2/L11）を別フィールドで照合し、意味digestとraw bytes hashを混同しないようJSONにpinした。

## 条件別照合

### REQSRC-SUP-00227 — 旧source line 303 / V13-PKG-01

- 原文: 1. **authority／manifest**: package manifestはsource repository／HEAD、requirements version／digest、（line SHA-256 `e9e1a713584ba5e78dc6fe35c7b77bcf679ce11b50fe65622d53e99559fd858b`）
- source clause: package manifestにsource repository/HEADとrequirements version/digestを束縛する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), OS-L2-030 (unadopted proposal), REG-05`
- 保持・変更: HARNESS-L2-006は外部サービス/機能の提供範囲を担い、f6 L2/L11は選択可能な提供範囲を保つ。 OS-L2-021は対象projectへのinstall/update/recoveryを担う。 現行の固定pairでは、提供するpackageの意味（HARNESS）と対象project上の配布操作（OS）を分担する。旧repository名やtool/runtimeの選択は引き継がない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033との近接点は、選択されたcapabilityのidentity/version/config/source snapshotと再現性のprovenanceに限る。packageの収載/除外、package version、generated index、license、artifact公開受入は定めない.
- 残差: 採択済みf6 pairには、source repository/HEADとrequirements version/digestをこの旧source条件へ結ぶ厳密なmanifest oracleがない。
- 反例: artifactのbuild元と異なるrepository/HEADをmanifestが示す。 requirements digestが欠落または古いのにpackageをeligibleとして扱う。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00228 — 旧source line 304 / V13-PKG-01

- 原文:    package version、artifact digest、include／exclude exact set、generated index、first／third-party区分、（line SHA-256 `785d340f1cadad83fb5b5cc35c8f72881f748a315c8c4db0dc19ea483ad5782b`）
- source clause: package version/artifact digest、収載/除外の厳密な集合、generated index、first/third-party区分を束縛する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), OS-L2-030 (unadopted proposal), REG-05`
- 保持・変更: f6 HARNESS-L2-006の詳細（lines 283/285）は、機能の収載/除外、同じsource/registry/profileからのmanifest・artifact再現、clean consumerでの利用を保つ。 固定pairが保つのは現在のservice-level scopeであり、旧package index schema、first/third-partyの列挙、9件のHR-AC oracle全体は採択していない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033との近接点は、選択されたcapabilityのidentity/version/config/source snapshotと再現性のprovenanceに限る。packageの収載/除外、package version、generated index、license、artifact公開受入は定めない.
- 残差: generated indexの厳密な形式、package versionとの対応、artifact digest出力、third-party区分、過不足時のfail動作。
- 反例: 未列挙fileや重複pathを含むpackageがindex検査を通る。 同一input/profileでartifact digestが変わっても拒否されない。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00229 — 旧source line 305 / V13-PKG-01

- 原文:    license／attribution、build environmentを束縛する。manifest外file、重複path、digest driftを拒否する。（line SHA-256 `84c9dfb90911cdc8438c5e34570a6ed033d2b1ca1d0c482726719ce1784f9abc`）
- source clause: license/attribution/build environmentを束縛し、manifest外file・重複path・digest driftを拒否する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), OS-L2-030 (unadopted proposal), REG-05`
- 保持・変更: HARNESS-L2-006はservice artifact/source/必須dependencyとrecovery traceを保持する。SECURITY-008は保護対象の外部操作を統制する。 旧Node/build/environment/repositoryの実装詳細は現行の実装権威として複製しない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033との近接点は、選択されたcapabilityのidentity/version/config/source snapshotと再現性のprovenanceに限る。packageの収載/除外、package version、generated index、license、artifact公開受入は定めない.
- 残差: license/attribution/build environmentとmanifestのbinding、path正規化、重複/drift時の診断。
- 反例: licenseまたはthird-party attributionがないまま公開候補がeligibleとなる。 build environmentが変わる、またはmanifest外pathが現れても候補が無効にならない。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00230 — 旧source line 306 / V13-COND-L0306

- 原文: 2. **自己適用除外**: project固有PLAN／design／test evidence、`harness.db`、`.helix` runtime state／memory、（line SHA-256 `4bebdaa728a5fe488569eaf7a9bc39885c83eb831ced0e64abf7cc4d16560f4a`）
- source clause: project固有のPLAN/design/test evidence、harness.db、.helix runtime state/memoryをpackageから除外する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `なし（固定pairは本監査で照合）`
- 保持・変更: 旧sourceはconsumer向けassetを保ちながらdevelopment/dogfood stateを除外する。 固定HARNESS-006とOS-021は、この全除外一覧をpackage build規則として定義しない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryとreplay条件であり、このsource条項やpackage除外oracleを直接定めない.
- 残差: 除外するpath/typeの完全な列挙と、入れ子・改名・可変stateへの扱い。
- 反例: development PLAN/test evidence、harness.db、.helix runtime/memoryが、名前を変えたpathや入れ子pathから同梱される。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00231 — 旧source line 307 / V13-COND-L0306

- 原文:    credential、PII、absolute machine path、development-only audit／handoverを同梱しない。runtimeに必要な（line SHA-256 `b2f0ce5831378febff124adbd94024fa39256b19e7ad8f65ee81e41b3f2e307b`）
- source clause: credential、PII、絶対machine path、development-only audit/handoverを同梱しない
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `なし（固定pairは本監査で照合）`
- 保持・変更: SECURITY-008はoperationごとのauthorityを扱う。このsource条件はそれとは別にpackage contentを制約する。 固定pairは機微情報やdevelopment-only情報の同梱を許可しない。また、単純な文字列scanだけでsecret不存在を証明できるとはしない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryとreplay条件であり、このsource条項やpackage除外oracleを直接定めない.
- 残差: 不存在を証明するためのcontent/path/privacy scanner範囲とprovenance。
- 反例: credential/PIIがnested/generated fileからartifactに入る。absolute host pathまたは非公開handoverが同梱される。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00232 — 旧source line 308 / V13-COND-L0306

- 原文:    schema、method、adapter templateはconsumer-safeな公開assetとして明示列挙し、dogfood除外を理由に（line SHA-256 `f08c9f6de7bfdc1d2a8820d993b45cd1fd29426df2eb39952de228212e9ba527`）
- source clause: consumer-safeなschema/method/adapter templateを明示列挙し、dogfood除外によってdoctor/gateを縮退させない
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `なし（固定pairは本監査で照合）`
- 保持・変更: HARNESS-L2-006は外部で利用可能な選択機能を保ち、OS-021は対象projectへのinstall/update/recovery境界を保つ。 固定pairは厳密なallowlist/denylistを定めず、development data除外後にもconsumer doctor/gateが完全であることを証明しない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryとreplay条件であり、このsource条項やpackage除外oracleを直接定めない.
- 残差: consumer-safe allowlistのidentity/versionと、除外後のdetector/gate完全性の同等性。
- 反例: 必要なconsumer schema/templateがdogfood stateと一緒に除外され、doctor/gate coverageが欠ける。 path prefixに一致しただけでdev-only adapterが暗黙に収載される。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00233 — 旧source line 309 / V13-COND-L0306

- 原文:    doctor／gateを縮退しない。（line SHA-256 `f0ea32caed98d0677bf2c3b1d68be17440042b7e6aeb9e15689893b272d0768b`）
- source clause: development-only contentの除外を理由にdoctor/gate機能を減らさない
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `なし（固定pairは本監査で照合）`
- 保持・変更: 現行HARNESSは、serviceを選択して利用する範囲を保つ。 f6 pairは旧doctor/gate実装やdetector一覧そのものを要求していない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryとreplay条件であり、このsource条項やpackage除外oracleを直接定めない.
- 残差: package filtering後のconsumer doctor/gate機能と、その不足を検知するnegative oracle。
- 反例: privacy除外は通る一方でconsumer doctor/gateに必須機能がないのにreadyと報告する。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00239 — 旧source line 315 / V13-PKG-04

- 原文:    consumer成果とconsumer-owned `.helix` evidenceを保持する。（line SHA-256 `162672f0aa61a7c4319c62981764541671c15aaa8d944e848e21edf1dc81bfb0`）
- source clause: setup/upgrade/rollback/uninstall中にconsumer成果物とconsumer所有の.helix evidenceを保全する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), OS-L2-030 (unadopted proposal), REG-05`
- 保持・変更: HARNESS-006 L2/L11はHELIX内部の運用stateと分けたservice利用を保ち、OS-021は選択した対象projectへの配布/update/recoveryを扱う。 固定pairは旧来の包括的path schemaを保全せず、consumer所有fileの変更を許可もしない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryとreplay条件であり、このsource条項やconsumer成果保全oracleを直接定めない.
- 残差: managed-markerの所有境界、consumer成果/evidenceの変更前後byte oracle、rollback/uninstall時の保全条件。
- 反例: setupがmarker外のconsumer dataを上書きする。rollbackでconsumer所有の.helix evidenceを削除する。
- 数値境界: このsource lineが示すのは離散的なoracle/fieldのみで、数値閾値・scoreは指定しない。

### REQSRC-SUP-00259 — 旧source line 337 / V13-PKG-01

- 原文: | `HR-AC-HYB-008-01` | manifestのinclude／exclude exact set、source／requirements／artifact digest、versionが一致する |（line SHA-256 `93d43f38c8b93da59953d053c318c432dca75b211befab00470f6d0aac06274a`）
- source clause: HR-AC-HYB-008-01: manifestの収載/除外、source/requirements/artifact digest、versionが一致する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- 保持・変更: HARNESS-006の固定詳細には、同一source/registry/profileでのmanifest・artifact再現条件がある。OS-033は選択capabilityのversion/config/input snapshot再生provenanceを持つ。 いずれもHR-AC-01の完全なpackage manifest oracleではない。OS-033のreceiptは選択engine/detector capabilityに関するもの。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033の近接点は、選択capabilityのidentity/version/config/source snapshotと再現性provenanceまで。packageのfile集合、version、index、license、公開受入を保証しない.
- 残差: このoracleで要求するpackage manifest fieldの完全一致、generated index整合、artifact digestの独立oracle。
- 反例: manifestのfield/version/digestが1つ不一致でもpackageが受け入れられる。 generated indexの宣言外に見えないfileが残る。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00260 — 旧source line 338 / V13-PKG-02

- 原文: | `HR-AC-HYB-008-02` | dogfood／state／credential／PII／absolute path混入mutationを全て拒否する |（line SHA-256 `80fffc7593ee85a1bac812fbf893a8ed28892b2e41be1964d266960e9df8164d`）
- source clause: HR-AC-HYB-008-02: dogfood/state/credential/PII/absolute pathの混入mutationをすべて拒否する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- 保持・変更: SECURITY-008はoperation authorityを扱うが、OS-033のprovenanceはpackage content除外の代替にならない。 固定pairはこのpackage content mutation oracleを採択していない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryと再現条件に限られ、content除外を証明しない.
- 残差: 機微情報/stateの完全な除外範囲と、未知/nested pathに対するnegative動作。
- 反例: dogfood state、credential、PII、absolute pathのいずれかが入ってもpackageが受け入れられる。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00261 — 旧source line 339 / V13-PKG-03

- 原文: | `HR-AC-HYB-008-03` | clean／既存／monorepo consumerへのsetup再実行がidempotentで、consumer所有bytesを保全する |（line SHA-256 `626a4228c3cedd86c92bca724eb13282ffbbc9f3221eae998ac11ce527db1322`）
- source clause: HR-AC-HYB-008-03: clean/existing/monorepoでsetupを再実行しても冪等で、consumer所有byteを保全する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- 保持・変更: HARNESS-006はclean consumerでの利用を含み、OS-021は対象projectへのinstall/update/recoveryを扱う。 固定pairは3種類のconsumer構成、setup再実行の冪等性、marker外byteの保全をまとめて保証しない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryと再現条件に限られ、consumer構成や所有byte保全を定めない.
- 残差: 3種類のfixture matrixとmanaged-marker/consumer所有境界の厳密なbyte oracle。
- 反例: 2回目のsetupで内容が重複する。monorepo内のnested project fileまたはconsumer所有.helix evidenceが変わる。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00262 — 旧source line 340 / V13-PKG-04

- 原文: | `HR-AC-HYB-008-04` | README、LICENSE、third-party attribution、provenance、免責の欠落を拒否する |（line SHA-256 `bae19bc3cf3f95acb152181dae1459f9a4dfaa79c8c3096749d7d3891c0c9ea8`）
- source clause: HR-AC-HYB-008-04: README/LICENSE/third-party attribution/provenance/disclaimerの欠落を拒否する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- 保持・変更: HARNESS-006は提供artifact/source/必須dependencyの関係を保持する。 固定HARNESS-006/OS-021は、5項目の文書・権利・provenance完全性oracleを定義しない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryと再現条件に限られ、法的文書や公開受入を定めない.
- 残差: 現行license/attribution evidence、READMEの契約範囲、provenanceとdisclaimerの整合。
- 反例: 必要な文書/attribution/provenance/disclaimerが欠落または古いのに公開候補がpassする。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00263 — 旧source line 341 / V13-PKG-05

- 原文: | `HR-AC-HYB-008-05` | clean Linuxでinstall→setup→status→consumer doctor→minimal workflow dry-runがgreenになる |（line SHA-256 `b63af3bc94d2a483e551baf39a6c66093667f92a8c7061306f70c48277b4a395`）
- source clause: HR-AC-HYB-008-05: clean Linuxでinstall→setup→status→consumer doctor→最小delegated workflow dry-runをgreenにする
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- 保持・変更: HARNESS-006はHELIX内部の運用stateなしで選択serviceを外部利用する価値を保つ。 ここではf6のacceptance実行を証拠としていない。固定pairもこのOS fixture sequenceを採択していない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryと再現条件に限られ、consumerのinstall/workflow acceptanceを定めない.
- 残差: clean Linux consumerでのfresh-process出力とrevisionの対応、workflow要件。
- 反例: bare command欠落、doctor失敗、workflow未解決、artifact/source revision不一致があるのにgreenと報告する。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00264 — 旧source line 342 / V13-PKG-06

- 原文: | `HR-AC-HYB-008-06` | Windowsで同一Node artifactとPowerShell entrypointのcompatibility smokeがgreenになる |（line SHA-256 `be7e674c8e8288e33d4f3e8c0077a05ac4a24d3522a564209656afe3cd7b4c43`）
- source clause: HR-AC-HYB-008-06: Windows smokeは同一Node artifactとPowerShell entrypointを使う
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- 保持・変更: HARNESS-006は選択serviceの一般的なinstall/use価値を保ち、OS-021は対象projectへの配布を扱う。 現行採択文は旧Node/PowerShell実装を必須architectureとしていない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detectorのregistryと再現条件に限られ、Windows smokeや同一artifact証明を定めない.
- 残差: Windows互換性matrixと、platform間で同一artifactを使った証拠の厳密性。
- 反例: Windowsで別build/編集済みartifactを使いdigestが違うのに同一packageとしてpassする。 宣言matrix外のplatformにも互換性があると推定する。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00265 — 旧source line 343 / V13-PKG-07

- 原文: | `HR-AC-HYB-008-07` | canary／preview／stableが同一artifact digestをpromotionし、stage skip／rebuild差替えを拒否する |（line SHA-256 `47729d0f8b9b6d5f994c81e5ba1496391ec3b0b4bd5a0937f2881f8156223324`）
- source clause: HR-AC-HYB-008-07: canary→preview→stableを同じartifact digestで一方向昇格し、stage skip/rebuild差替えを拒否する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- 保持・変更: HARNESS-006の固定詳細は同一inputからのartifact再現を保つ。OS-021はinstall/update/recoveryを扱う。OS-033のreplayは選択engine/detector capabilityのinputに限る。 f6 pairは旧channel名や3段階配布契約を採択しない。OS-030候補は後発decisionで保留。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 採択OS-033は選択engine/detector capabilityのversion/config/scopeと同一input replayを記録する。段階配布channel、channel間receipt継承、stage skip/rebuild拒否は定めない.
- 残差: 現行channel identity、段階entry条件、観測期間、停止/rollback条件、段階間で同一artifactを示すreceipt。
- 反例: 段階を飛ばす、rebuild後にartifactを差し替える、または段階間でdigestを変えても拒否されない。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00266 — 旧source line 344 / V13-PKG-08

- 原文: | `HR-AC-HYB-008-08` | rollback rehearsalが直前tagへengine pinを戻し、consumer所有成果を変更しない |（line SHA-256 `eeb4e363b0528619cac2a34ebfb20d899a2ac951a2c0025dc9bfa2c93ea212e1`）
- source clause: HR-AC-HYB-008-08: rollback rehearsalで直前のimmutable tag/engine pinへ戻しconsumer成果を変えない
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
- 保持・変更: OS-021は対象project recoveryを担い、HARNESS-006は提供service側の適切な前version/replacementを示す。 どちらも旧package-level rollback rehearsalやconsumer byte保全oracleの証明ではない。
- OS-030/OS-033 限定効果: OS-030（MPR-RC-HELIXOS-L2-030-003）はpackage生成/consumer/promotionに最も近い候補だが、57候補decisionでは保留、後続11候補decisionも保留を維持する。候補L11には9個のHR-AC oracle行があるが、候補記載は採択・exact source successor・closureを生まない。 OS-033のreplayは選択capabilityの再現性に限る。rollbackを許可せず、前tagの適格性やconsumer byte保全も証明しない.
- 残差: rollback証拠、immutable source pin、eligibleな前tag、consumer所有outputの保全。
- 反例: eligibleでないtagまたは異なるdigestへ戻す。consumer-owned outputを削除/上書きする。rehearsal証拠なしでrollback完了とする。
- 数値境界: 9個の独立したHR-AC-HYB-008-01..09 oracleのうち1件。合計score・割合・閾値は指定しない。

### REQSRC-SUP-00267 — 旧source line 345 / V13-PKG-09

- 原文: | `HR-AC-HYB-008-09` | remote sync／tag／publish／promotion／cutoverをapproval snapshot不在またはdrift時に拒否する |（line SHA-256 `fafe1b8c140e14e1108fa937f522cd2500b3be4268d9eba52f8019c94413ab97`）
- source clause: HR-AC-HYB-008-09: approval snapshot欠落/drift時はremote sync/tag/publish/promotion/cutoverを拒否する
- queue status: `unresolved` / `unresolved_for_closure_work`; queue比較参照: `HARNESS-L2-006, OS-L2-021 (adopted, version_target 1.0), SECURITY-L2-008, REG-05`
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
