# v1.3 §4.6.1 package残差11条件の個別監査

- 比較対象main: `c8967e8160b185c1a5603f5311eaf3c0b695631c`
- 固定比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`（SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）
- 対象: 11条件。queue上すべて`unresolved`／`primary_residual`。
- 監査の効果: `none`。採択、successor割当、条件閉包、L11実行・受入は主張しない。旧runtime/test/CIも実行していない。

## 対象screenとsource/consumer

queue `docs/governance/audits/requirements-stage/v13-condition-closure-work-queue-2026-09-30.json`（SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`、basis `2bf484b1a84af346feaf8cf7b72e59f3889e6333`）の一次残差255件（partial 84、unresolved 171）から選んだ。同じ§4.6.1には28件あり、今回の11件以外の17件は本監査の個票対象外。選択11件は全て`primary_residual`かつ`unresolved_for_closure_work`、focused individual audit ref 0件、後発adoption citation ref 0件だった。基線の全体semantic auditには各IDの未解決行があるため、「過去に未監査」とは扱わず、今回の条件別比較auditがないことをscreenした。

| REQSRC ID | 旧source物理行 | source line SHA-256 | queue |
|---|---:|---|---|
| `REQSRC-SUP-00225` | 300 | `b62860530920902e7dcfc8837de8472ef11ca05e2d128e7ab7d5f67da19db06a` | unresolved / unresolved_for_closure_work |
| `REQSRC-SUP-00242` | 318 | `2ec3c8805de88768870ce01a262aadcb220a170a2fa65ee2a69484fd570f8bfd` | unresolved / unresolved_for_closure_work |
| `REQSRC-SUP-00243` | 319 | `8cf7fcf968884368dec12ae79502029778dd93e3d914a13d2b0dc62fe86fbec8` | unresolved / unresolved_for_closure_work |
| `REQSRC-SUP-00244` | 320 | `335cdbf67cb2db0eb83a5d6f0051c00f67c7a791234628b35556584321076db8` | unresolved / unresolved_for_closure_work |
| `REQSRC-SUP-00245` | 321 | `3f4f82546f71d289a9b1f9cba00407b9430455a33e1981686c42620503ee669a` | unresolved / unresolved_for_closure_work |
| `REQSRC-SUP-00246` | 322 | `d90535e2acd29532372a41977737db2e9be952da17a614d68b601a34f277f055` | unresolved / unresolved_for_closure_work |
| `REQSRC-SUP-00248` | 324 | `de516556984cb10a3f6e22987cdadd6faea8ca1f0ba526783145df44b032570c` | unresolved / unresolved_for_closure_work |
| `REQSRC-SUP-00249` | 325 | `f48145ef550ded6b42944547fde0f21430a6e8895e2bb6f77ac751dabafc02e5` | unresolved / unresolved_for_closure_work |
| `REQSRC-SUP-00251` | 327 | `dd37a535d8e38f4e7fd40df3ffd52b2647856928e4a60b3cc8910c0648eeec45` | unresolved / unresolved_for_closure_work |
| `REQSRC-SUP-00255` | 331 | `6c7806b47e075a2e1699541c5150bdff19fd3b04888cd23c3dd07e91cc24df71` | unresolved / unresolved_for_closure_work |
| `REQSRC-SUP-00256` | 333 | `6a1c306b58e3f09033c6cb07ec15c8003b2a8107f37c455a738fa879deed49fa` | unresolved / unresolved_for_closure_work |

旧L13 consumer `archive/legacy-generation-2026-09-14/root/docs/design/harness/L13-post-deploy/post-deploy-evidence-boundary.md`（SHA `d2f87c2a0cdeef4ef1902737af53638c8125c3e7679c6804207de02d6f6e99ba`）は配布、consumer smoke、monitoring、rollback、action-binding approval前の不可逆作用を扱う。consumer doctorはreadiness evidenceであり、UI dashboardの表示だけでreadinessを代用しない。旧distribution package design `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md`（SHA `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c`）も補助consumerとして参照した。旧固有target/profile名、旧実装、旧workflowは現行authorityへ移していない。

## 固定f6 L2/L11比較と後発decision全件screen

f6の関連pairはHARNESS-006/010/011、HELIXOS-021、HELIXSECURITY-008/010/012/013/023。JSONには各pairのf6 file SHA、該当L2/L11行とraw line/section SHA、決定表rowを固定した。採択pairのMPR registry `registered_proposal`／`authority_effect=none`は別軸として扱う。

後発decision比較は全68 screen entry（57候補decision: adopted 42、conditionally adopted 11、held 4；11候補decision: adopted 10、not_adopted_current_revision 1）をJSONへ完全収録した。重複identityはHARNESS-L2-041とHELIXOS-L2-038の2件で、uniqueは66件。次表はstatusとidentityを全件列挙する。

### 57候補 `docs/governance/decisions/po-decision-2026-09-29-57candidates.md`（SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`）

| identity | status | MPR / decision treatment |
|---|---|---|
| `HARNESS-L2-034` | `adopted` | `MPR-RC-HARNESS-L2-034-003` / 採択 |
| `HARNESS-L2-035` | `adopted` | `MPR-RC-HARNESS-L2-035-002` / 採択 |
| `HARNESS-L2-036` | `adopted` | `MPR-RC-HARNESS-L2-036-002` / 採択 |
| `HARNESS-L2-037` | `adopted` | `MPR-RC-HARNESS-L2-037-002` / 採択 |
| `HARNESS-L2-038` | `adopted` | `MPR-RC-HARNESS-L2-038-001` / 採択 |
| `HARNESS-L2-039` | `adopted` | `MPR-RC-HARNESS-L2-039-003` / 採択 |
| `HARNESS-L2-040` | `adopted` | `MPR-RC-HARNESS-L2-040-002` / 採択 |
| `HARNESS-L2-041` | `adopted` | `MPR-RC-HARNESS-L2-041-002` / 採択 |
| `HARNESS-L2-042` | `adopted` | `MPR-RC-HARNESS-L2-042-001` / 採択 |
| `HARNESS-L2-043` | `conditionally_adopted` | `MPR-RC-HARNESS-L2-043-002` / 条件付き採択：Bルート、所属はHARNESS-CORE。 |
| `HARNESS-L2-044` | `conditionally_adopted` | `MPR-RC-HARNESS-L2-044-002` / 条件付き採択：Bルート、名称はDesign Contract Portfolio。採択済み025/026へ無断追記しない。 |
| `HARNESS-L2-045` | `held` | `MPR-RC-HARNESS-L2-045-001` / 保留。解除条件：値の決定責務、単位、未設定・参照不能・超過時の扱いを確定。ticketごとの予算額決定は不要。 |
| `HARNESS-L2-046` | `adopted` | `MPR-RC-HARNESS-L2-046-001` / 採択 |
| `HARNESS-L2-047` | `conditionally_adopted` | `MPR-RC-HARNESS-L2-047-001` / 条件付き採択：A配置（HARNESSが契約生成規範を所有）。 |
| `HELIXOS-L2-030` | `held` | `MPR-RC-HELIXOS-L2-030-003` / 保留。本体実行OSとconsumer利用先を分け、配布段階と切替条件を確定する。Windows即時却下やLinux限定を意味しない。 |
| `HELIXOS-L2-031` | `adopted` | `MPR-RC-HELIXOS-L2-031-001` / 採択 |
| `HELIXOS-L2-032` | `adopted` | `MPR-RC-HELIXOS-L2-032-001` / 採択 |
| `HELIXOS-L2-033` | `adopted` | `MPR-RC-HELIXOS-L2-033-001` / 採択 |
| `HELIXOS-L2-034` | `adopted` | `MPR-RC-HELIXOS-L2-034-002` / 採択 |
| `HELIXOS-L2-035` | `adopted` | `MPR-RC-HELIXOS-L2-035-001` / 採択 |
| `HELIXOS-L2-036` | `adopted` | `MPR-RC-HELIXOS-L2-036-001` / 採択 |
| `HELIXOS-L2-037` | `adopted` | `MPR-RC-HELIXOS-L2-037-001` / 採択 |
| `HELIXOS-L2-038` | `adopted` | `MPR-RC-HELIXOS-L2-038-001` / 採択 |
| `HELIXOS-L2-039` | `held` | `MPR-RC-HELIXOS-L2-039-001` / 保留。HARNESS-045と対に契約・版・予算条件を揃える。 |
| `HELIXOS-L2-040` | `adopted` | `MPR-RC-HELIXOS-L2-040-001` / 採択 |
| `HELIXOS-L2-041` | `adopted` | `MPR-RC-HELIXOS-L2-041-001` / 採択 |
| `HELIXOS-L2-042` | `adopted` | `MPR-RC-HELIXOS-L2-042-001` / 採択 |
| `HELIXOS-L2-043` | `adopted` | `MPR-RC-HELIXOS-L2-043-002` / 採択 |
| `HELIXOS-L2-044` | `adopted` | `MPR-RC-HELIXOS-L2-044-001` / 採択 |
| `HELIXOS-L2-045` | `held` | `MPR-RC-HELIXOS-L2-045-001` / 保留。対象集合、version_target、HARNESSからOSへの所有移動の有無を明記する。 |
| `HELIXOS-L2-046` | `adopted` | `MPR-RC-HELIXOS-L2-046-001` / 採択 |
| `HELIXOS-L2-047` | `adopted` | `MPR-RC-HELIXOS-L2-047-004` / 採択 |
| `HELIXOS-L2-048` | `adopted` | `MPR-RC-HELIXOS-L2-048-001` / 採択 |
| `HELIXOS-L2-049` | `conditionally_adopted` | `MPR-RC-HELIXOS-L2-049-003` / 条件付き採択：割当前に後段の検証義務・担当・capacityを確保する。割当先task自体のreview/merge完了は割当条件にしない（訂正L11 `HELIXOS-L2-049-003`）。 |
| `HELIXOS-L2-050` | `conditionally_adopted` | `MPR-RC-HELIXOS-L2-050-003` / 条件付き採択：capacity増枠から新しいmerge権限を発生させない。既存review_merge担当は既存admission後にmergeできる。branch変更・Ready権限は与えない（訂正L11 `HELIXOS-L2-050-003`）。 |
| `HELIXOS-L2-051` | `conditionally_adopted` | `MPR-RC-HELIXOS-L2-051-002` / 条件付き採択：本構成でCursorを作成専用、Claude優先は適用可能な評価根拠のある要求・設計taskのみ。 |
| `HELIXOS-L2-052` | `adopted` | `MPR-RC-HELIXOS-L2-052-001` / 採択 |
| `HELIXLABO-L2-061` | `adopted` | `MPR-RC-HELIXLABO-L2-061-001` / 採択 |
| `HELIXLABO-L2-062` | `adopted` | `MPR-RC-HELIXLABO-L2-062-001` / 採択 |
| `HELIXLABO-L2-063` | `adopted` | `MPR-RC-HELIXLABO-L2-063-001` / 採択 |
| `HELIXLABO-L2-064` | `adopted` | `MPR-RC-HELIXLABO-L2-064-002` / 採択 |
| `HELIXLABO-L2-065` | `conditionally_adopted` | `MPR-RC-HELIXLABO-L2-065-001` / 条件付き採択：D1、067とは別指標で「最初のAttemptの結果」。 |
| `HELIXLABO-L2-066` | `adopted` | `MPR-RC-HELIXLABO-L2-066-001` / 採択 |
| `HELIXLABO-L2-067` | `conditionally_adopted` | `MPR-RC-HELIXLABO-L2-067-001` / 条件付き採択：D1、「最初の適格candidateの結果」と同一Attempt内修正回数。065と換算・統合しない。 |
| `HELIXLABO-L2-068` | `adopted` | `MPR-RC-HELIXLABO-L2-068-001` / 採択 |
| `HELIXLABO-L2-069` | `adopted` | `MPR-RC-HELIXLABO-L2-069-001` / 採択 |
| `HELIXINTELLIGENCE-L2-072` | `conditionally_adopted` | `MPR-RC-HELIXINTELLIGENCE-L2-072-004` / 条件付き採択：B配置、1.0は候補生成とshadow評価まで。 |
| `HELIXINTELLIGENCE-L2-073` | `adopted` | `MPR-RC-HELIXINTELLIGENCE-L2-073-002` / 採択 |
| `HELIXINTELLIGENCE-L2-074` | `adopted` | `MPR-RC-HELIXINTELLIGENCE-L2-074-002` / 採択 |
| `HELIXSECURITY-L2-029` | `adopted` | `MPR-RC-HELIXSECURITY-L2-029-002` / 採択 |
| `HELIXSECURITY-L2-030` | `adopted` | `MPR-RC-HELIXSECURITY-L2-030-001` / 採択 |
| `HELIXSECURITY-L2-031` | `adopted` | `MPR-RC-HELIXSECURITY-L2-031-001` / 採択 |
| `HELIXSECURITY-L2-032` | `adopted` | `MPR-RC-HELIXSECURITY-L2-032-001` / 採択 |
| `HELIXSECURITY-L2-033` | `adopted` | `MPR-RC-HELIXSECURITY-L2-033-002` / 採択 |
| `HELIXSECURITY-L2-034` | `adopted` | `MPR-RC-HELIXSECURITY-L2-034-001` / 採択 |
| `HELIXCONNECT-L2-008` | `conditionally_adopted` | `MPR-RC-HELIXCONNECT-L2-008-002` / 条件付き採択：A配置（供給はCONNECT、安全判定はSECURITY）、registration -002を対象。 |
| `HELIXCONNECT-L2-009` | `conditionally_adopted` | `MPR-RC-HELIXCONNECT-L2-009-002` / 条件付き採択：A。direction/orderは属性、feedbackは型付き戻り辺。操作ごとのunknown停止条件を分ける（訂正L11 `HELIXCONNECT-L11-009-002`）。 |

### 後続11候補 `docs/governance/decisions/po-decision-2026-09-29-11candidates.md`（SHA-256 `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`）

| identity | status | MPR / decision treatment |
|---|---|---|
| `HARNESS-L2-041` | `adopted` | `MPR-RC-HARNESS-L2-041-003` / 採択 |
| `HARNESS-L2-048` | `adopted` | `MPR-RC-HARNESS-L2-048-001` / 採択 |
| `HELIXBRAIN-L2-031` | `adopted` | `MPR-RC-HELIXBRAIN-L2-031-001` / 採択 |
| `HARNESS-L2-050` | `adopted` | `MPR-RC-HARNESS-L2-050-001` / 採択 |
| `HARNESS-L2-051` | `adopted` | `MPR-RC-HARNESS-L2-051-001` / 採択 |
| `HARNESS-L2-052` | `adopted` | `MPR-RC-HARNESS-L2-052-001` / 採択 |
| `HARNESS-L2-053` | `adopted` | `MPR-RC-HARNESS-L2-053-001` / 採択 |
| `HARNESS-L2-054` | `adopted` | `MPR-RC-HARNESS-L2-054-001` / 採択 |
| `HELIXOS-L2-038` | `adopted` | `MPR-RC-HELIXOS-L2-038-002` / 依存先と併せて採択 |
| `HELIXOS-L2-053` | `adopted` | `MPR-RC-HELIXOS-L2-053-001` / 依存先と併せて採択 |
| `HARNESS-L2-049` | `not_adopted_current_revision` | `MPR-RC-HARNESS-L2-049-002` / 未採択（訂正L11のexact bytesをPOが再確認するまで未採択） |

OS-030は57候補と後続11候補の双方で保留。候補L11にあるHR-AC-HYB-008-01..09の9 oracle行は候補記述であり、採択や実行証跡ではない。OS-033は採択されているが、対象は選択engine/detectorのregistry version/config/scope/input snapshot replay provenanceに限られる。package manifest、consumer smoke、channel段階、rollback、approval、9 oracleの代わりにはならない。

## REQSRC-SUP-00225 — 旧source line 300

- 原文: current authority、CLI、setup、doctor、receipt、tag pinへ再投影しない。配布artifactはHELIX-HARNESS自身のdogfoodを複製するsnapshotではなく、（line SHA-256 `b62860530920902e7dcfc8837de8472ef11ca05e2d128e7ab7d5f67da19db06a`）
- 条件: 旧互換sourceを現行authority・CLI・setup・doctor・receipt・tag pinへ再投影せず、dogfood複製ではないconsumer packageとする。
- 固定f6比較: `HARNESS-L2-006`, `HELIXOS-L2-021`, `HELIXSECURITY-L2-012`
- 保持: HARNESS-006は選択serviceをHELIX内部運用stateなしで使う範囲を、OS-021は対象projectのinstall/update/recoveryを扱う。SECURITY-012は供給元provenanceを追跡する。これらは旧repository名や互換入力を現行authorityへ再投影しない境界と整合する。
- 変更・未継承: 旧sourceに列挙された旧OS repository名と旧CLI等の詳細を現行名・authorityへ移さない。これは旧入力を現行経路に昇格させない現行境界を維持する扱いで、旧targetの採用を意味しない。
- OS-030の限定効果: HELIXOS-L2-030は後続decisionで保留。L11候補に9個のHR-AC-HYB-008-01..09 oracle行があるが、候補記載は採択・正式successor・実行済み受入・closureを意味しない。
- OS-033の限定効果: 採択HELIXOS-L2-033の効果は選択engine/detectorのregistry version/config/scope/input snapshot replay provenanceに限定。package manifest、consumer smoke、channel promotion、rollback、action-binding approval、9 acceptance oracleの代替ではない。
- 残差: packageをconsumer repositoryへ非破壊導入する実際のartifact仕様・その受入oracleはこの比較pairだけでは閉じない。
- 反例:
  - 旧HELIX-HARNESS-OSのtagを現行authority tagとして再利用する。
  - HELIX-HARNESSのdogfood PLAN/runtimeをそのままconsumer package snapshotに含める。
- 数値・例外境界: 数値閾値なし。対象となる旧repository名や再投影禁止面は列挙型の境界。
- 判定: `unresolved`。successor未割当、採択・closureのauthority effectなし。

## REQSRC-SUP-00242 — 旧source line 318

- 原文:    attribution、provenance、免責が欠けるartifactをpublish candidateにしない。（line SHA-256 `2ec3c8805de88768870ce01a262aadcb220a170a2fa65ee2a69484fd570f8bfd`）
- 条件: LICENSE/third-party attribution/provenance/免責が欠けるartifactをpublish candidateにしない。
- 固定f6比較: `HARNESS-L2-010`, `HELIXSECURITY-L2-012`, `HELIXSECURITY-L2-013`
- 保持: HARNESS-010はpack input/output/dependency/verification scope/versionを、SECURITY-012は供給元・producer・version・digest・dependency・permission・network・known risk・update delta・rollbackを、SECURITY-013は工程間artifact identity/digest/provenanceを扱う。
- 変更・未継承: SECURITY-012は供給元の未知項目をtrustedへ昇格させず、SECURITY-013はdigest一致だけでsource trustを推定しない。旧sourceのlicense・attribution・disclaimer欠落をpublish candidateから落とす個別oracleは別に残る。
- OS-030の限定効果: HELIXOS-L2-030は後続decisionで保留。L11候補に9個のHR-AC-HYB-008-01..09 oracle行があるが、候補記載は採択・正式successor・実行済み受入・closureを意味しない。
- OS-033の限定効果: 採択HELIXOS-L2-033の効果は選択engine/detectorのregistry version/config/scope/input snapshot replay provenanceに限定。package manifest、consumer smoke、channel promotion、rollback、action-binding approval、9 acceptance oracleの代替ではない。
- 残差: license、third-party attribution、provenance、免責の全項目がそろわなければpublish candidateを拒否する一体のHR-AC-HYB-008-04相当の判定は未確認。
- 反例:
  - provenanceが記録されていてもLICENSEまたは免責がないartifactを公開候補にする。
  - digestが一致しただけでattribution欠落を通す。
- 数値・例外境界: 数値閾値なし。4種類の必須文書/情報の欠落拒否が境界。
- 判定: `unresolved`。successor未割当、採択・closureのauthority effectなし。

## REQSRC-SUP-00243 — 旧source line 319

- 原文: 6. **consumer verification**: clean Linuxをprimary fixtureとし、install → setup → status → consumer doctor →（line SHA-256 `8cf7fcf968884368dec12ae79502029778dd93e3d914a13d2b0dc62fe86fbec8`）
- 条件: clean Linuxをprimary fixtureとしてinstall→setup→status→consumer doctor→minimal delegated workflow dry-runをfresh processで再現する。
- 固定f6比較: `HARNESS-L2-006`, `HARNESS-L2-010`, `HARNESS-L2-011`, `HELIXOS-L2-021`, `HELIXSECURITY-L2-023`
- 保持: HARNESS-006は外部consumerで選択serviceを利用すること、HARNESS-010/011はpack検証範囲と呼出しcontract/dependency版、OS-021はproject install/update/recovery、SECURITY-023は工程ごとのpromotion停止境界を保つ。
- 変更・未継承: 旧sourceはLinuxをprimaryとし、fresh processの一連手順を特定する。固定pairはそのfixture優先順位やこの順序の具体的dry-runを一括採択していない。
- OS-030の限定効果: HELIXOS-L2-030は後続decisionで保留。L11候補に9個のHR-AC-HYB-008-01..09 oracle行があるが、候補記載は採択・正式successor・実行済み受入・closureを意味しない。
- OS-033の限定効果: 採択HELIXOS-L2-033の効果は選択engine/detectorのregistry version/config/scope/input snapshot replay provenanceに限定。package manifest、consumer smoke、channel promotion、rollback、action-binding approval、9 acceptance oracleの代替ではない。
- 残差: Linuxでfresh processを使う5段階のconsumer smoke oracle、各工程の証跡と失敗時の拒否。実行は本監査で行っていない。
- 反例:
  - doctorだけを成功させworkflow dry-run失敗を見落とす。
  - warm process/既存stateでのみ成功するconsumerをgreenとする。
- 数値・例外境界: Linux primary 1 fixture系と5段階の順序を指定。合格率/timeout等の数値はなし。
- 判定: `unresolved`。successor未割当、採択・closureのauthority effectなし。

## REQSRC-SUP-00244 — 旧source line 320

- 原文:    minimal delegated workflow dry-runをfresh processで再現する。Windows compatibility smokeは同じNode artifactと（line SHA-256 `335cdbf67cb2db0eb83a5d6f0051c00f67c7a791234628b35556584321076db8`）
- 条件: Windows compatibility smokeはLinuxと同じNode artifactとPowerShell entrypointを検証する。
- 固定f6比較: `HARNESS-L2-010`, `HARNESS-L2-011`, `HELIXOS-L2-021`, `HELIXSECURITY-L2-013`
- 保持: HARNESS-010/011はartifact contract、依存版、呼出し能力を区別し、SECURITY-013は配布・実行対象が検証artifactと同一であることを要求する。
- 変更・未継承: 同じartifactを使う識別子の一貫性は近いが、OS-021等はWindows smokeやPowerShell entrypointをここで検証していない。旧PowerShell経路をそのままauthorityとして再利用しない。
- OS-030の限定効果: HELIXOS-L2-030は後続decisionで保留。L11候補に9個のHR-AC-HYB-008-01..09 oracle行があるが、候補記載は採択・正式successor・実行済み受入・closureを意味しない。
- OS-033の限定効果: 採択HELIXOS-L2-033の効果は選択engine/detectorのregistry version/config/scope/input snapshot replay provenanceに限定。package manifest、consumer smoke、channel promotion、rollback、action-binding approval、9 acceptance oracleの代替ではない。
- 残差: Windowsで同じNode artifactとPowerShell entrypointの互換性を確認し、Linux側の検証対象と同一であることを示すoracle。
- 反例:
  - Linuxで検証したものと異なるNode buildをWindowsへ配る。
  - PowerShell経路だけ未検証のまま互換性greenとする。
- 数値・例外境界: Linux/Windowsの2 platform区分。Windowsはcompatibility smokeであり、数値閾値なし。
- 判定: `unresolved`。successor未割当、採択・closureのauthority effectなし。

## REQSRC-SUP-00245 — 旧source line 321

- 原文:    PowerShell entrypointを検証する。自己適用asset混入、未解決bare CLI、package script欠落、network／credential前提、（line SHA-256 `3f4f82546f71d289a9b1f9cba00407b9430455a33e1981686c42620503ee669a`）
- 条件: 自己適用asset、bare CLI、欠落package script、network/credential前提をnegative oracleで拒否する。
- 固定f6比較: `HARNESS-L2-006`, `HARNESS-L2-010`, `HELIXSECURITY-L2-010`, `HELIXSECURITY-L2-012`, `HELIXSECURITY-L2-013`
- 保持: HARNESS-006は未選択serviceを暗黙収載しない境界に近く、HARNESS-010はpack contract/dependenciesを示す。SECURITY-010/012はupdate/capability・permission/network/provenanceを扱い、SECURITY-013はbuildから実行へのartifact一致を扱う。
- 変更・未継承: これらのfield/traceは旧sourceの四つのnegative checksを置き換えない。bare CLI解決、package script存在、dogfood混入、network/credential依存をconsumer packagingで拒否する検査の採択は確認できない。
- OS-030の限定効果: HELIXOS-L2-030は後続decisionで保留。L11候補に9個のHR-AC-HYB-008-01..09 oracle行があるが、候補記載は採択・正式successor・実行済み受入・closureを意味しない。
- OS-033の限定効果: 採択HELIXOS-L2-033の効果は選択engine/detectorのregistry version/config/scope/input snapshot replay provenanceに限定。package manifest、consumer smoke、channel promotion、rollback、action-binding approval、9 acceptance oracleの代替ではない。
- 残差: 4種の否定条件の検出範囲、条件ごとのfail-closed動作、network/credentialの暗黙依存を識別するfixture。
- 反例:
  - PATH上でしか解決しないbare CLIを収載する。
  - CI秘密情報がないと動かないscriptをconsumer-readyとする。
  - dogfood assetを含むがsecurity provenanceだけ記録して通す。
- 数値・例外境界: 4つの明示negative条件群。threshold値なし。
- 判定: `unresolved`。successor未割当、採択・closureのauthority effectなし。

## REQSRC-SUP-00246 — 旧source line 322

- 原文:    non-idempotent再setupをnegative oracleで拒否する。（line SHA-256 `d90535e2acd29532372a41977737db2e9be952da17a614d68b601a34f277f055`）
- 条件: non-idempotent再setupをnegative oracleで拒否する。
- 固定f6比較: `HARNESS-L2-006`, `HELIXOS-L2-021`, `HELIXSECURITY-L2-023`
- 保持: HARNESS-006のclean consumer利用、OS-021のproject install/update/recovery、SECURITY-023のfailureで次工程へ進まない境界は関連する。
- 変更・未継承: 固定pairはclean/既存/monorepoへの二回目setupのbyte単位冪等性oracleをここでは定めない。
- OS-030の限定効果: HELIXOS-L2-030は後続decisionで保留。L11候補に9個のHR-AC-HYB-008-01..09 oracle行があるが、候補記載は採択・正式successor・実行済み受入・closureを意味しない。
- OS-033の限定効果: 採択HELIXOS-L2-033の効果は選択engine/detectorのregistry version/config/scope/input snapshot replay provenanceに限定。package manifest、consumer smoke、channel promotion、rollback、action-binding approval、9 acceptance oracleの代替ではない。
- 残差: 再setupでのconsumer所有bytes維持、marker内外境界、異常時に半端な投影を残さないnegative oracle。
- 反例:
  - 2回目のsetupで重複追記・上書きが生じてもstatus greenを返す。
  - 失敗後の再実行がconsumer所有.evidenceを削除する。
- 数値・例外境界: 再実行の同一性を要求するが、繰返し回数や時間閾値は指定しない。
- 判定: `unresolved`。successor未割当、採択・closureのauthority effectなし。

## REQSRC-SUP-00248 — 旧source line 324

- 原文:    `canary → preview → stable`の一方向promotionとする。各channelは同一artifact digest、entry criteria、観測window、（line SHA-256 `de516556984cb10a3f6e22987cdadd6faea8ca1f0ba526783145df44b032570c`）
- 条件: canary→preview→stableの一方向promotionで各channelに同一artifact digest、entry criteria、観測window、stop/rollback trigger、promotion receiptを持たせる。
- 固定f6比較: `HARNESS-L2-010`, `HELIXOS-L2-021`, `HELIXSECURITY-L2-013`, `HELIXSECURITY-L2-023`
- 保持: HARNESS-010はpack version/maturityと再現可能artifact、SECURITY-013は工程間identity/digest/provenance、SECURITY-023は工程の分離とunknown/failureで次段階を止める。OS-021は配布/update/recoveryの境界。
- 変更・未継承: 旧sourceは3 channelの一方向順序と各stage receipt/windowを具体化する。固定pairにこのchannel model・同一digestの全段階束縛はない。
- OS-030の限定効果: HELIXOS-L2-030は後続decisionで保留。L11候補に9個のHR-AC-HYB-008-01..09 oracle行があるが、候補記載は採択・正式successor・実行済み受入・closureを意味しない。
- OS-033の限定効果: 採択HELIXOS-L2-033の効果は選択engine/detectorのregistry version/config/scope/input snapshot replay provenanceに限定。package manifest、consumer smoke、channel promotion、rollback、action-binding approval、9 acceptance oracleの代替ではない。
- 残差: 3段階の単調遷移、各段階の同一digest、entry/observation/stop条件とpromotion receiptを揃えるacceptance。
- 反例:
  - previewからcanaryへ戻る。
  - stageごとにartifactをrebuildして異なるdigestを昇格する。
  - receipt/entry criteriaなしでstage skipする。
- 数値・例外境界: channelは3つ（canary, preview, stable）。観測window期間やthresholdの具体値なし。
- 判定: `unresolved`。successor未割当、採択・closureのauthority effectなし。

## REQSRC-SUP-00249 — 旧source line 325

- 原文:    stop／rollback trigger、promotion receiptを持ち、rebuildによるartifact差替えやstage skipを拒否する。（line SHA-256 `f48145ef550ded6b42944547fde0f21430a6e8895e2bb6f77ac751dabafc02e5`）
- 条件: promotion中のrebuildによるartifact差替えとstage skipを拒否する。
- 固定f6比較: `HARNESS-L2-010`, `HELIXSECURITY-L2-013`, `HELIXSECURITY-L2-023`
- 保持: HARNESS-010の同一input/versionからの再現、SECURITY-013の検証済みと配布/実行artifactの一致、SECURITY-023のstage間fail-stopは差替え・skipの一部リスクに対応する。
- 変更・未継承: これらは各artifact identityと段階の境界であり、旧sourceのchannel遷移ごとのreceipt上でrebuild差替えやskipを拒否する統合oracleとは異なる。
- OS-030の限定効果: HELIXOS-L2-030は後続decisionで保留。L11候補に9個のHR-AC-HYB-008-01..09 oracle行があるが、候補記載は採択・正式successor・実行済み受入・closureを意味しない。
- OS-033の限定効果: 採択HELIXOS-L2-033の効果は選択engine/detectorのregistry version/config/scope/input snapshot replay provenanceに限定。package manifest、consumer smoke、channel promotion、rollback、action-binding approval、9 acceptance oracleの代替ではない。
- 残差: promotion receiptに固定されたdigestを次stageまで連鎖させ、stage飛ばし/rebuildをnegative caseとして拒否する条件。
- 反例:
  - 検証後にartifactをrebuildし、新digestをreceipt更新なしでstableにする。
  - canary receiptなしにpreviewへ進める。
- 数値・例外境界: 3 channel間の各edgeを対象。stage数3以外の数値閾値なし。
- 判定: `unresolved`。successor未割当、採択・closureのauthority effectなし。

## REQSRC-SUP-00251 — 旧source line 327

- 原文:    restore rehearsal、consumer canary、post-promotion monitoringを持つ。failure時は直前immutable tagへ戻し、（line SHA-256 `dd37a535d8e38f4e7fd40df3ffd52b2647856928e4a60b3cc8910c0648eeec45`）
- 条件: development→distribution repository syncにdry-run diff、backup、restore rehearsal、consumer canary、post-promotion monitoringを持ち、失敗時は直前immutable tagへ戻してconsumer projectではなくengine pin/managed projectionだけを復旧する。
- 固定f6比較: `HARNESS-L2-010`, `HELIXOS-L2-021`, `HELIXSECURITY-L2-010`, `HELIXSECURITY-L2-013`, `HELIXSECURITY-L2-023`
- 保持: HARNESS-010は復旧先を適格な前版または明示replacementとして扱う。OS-021は対象projectでのupdate/recovery、SECURITY-010は更新candidateのrollback情報、SECURITY-013/023はartifact同一性と段階分離を保つ。
- 変更・未継承: 旧sourceはrepository sync前のdry-run/backup/rehearsal/canary/monitoringと、consumer成果を巻き戻さない復旧対象を一組にする。固定pairはこのdistribution sync runbook全体やimmutable tagへの限定rollbackを示さない。
- OS-030の限定効果: HELIXOS-L2-030は後続decisionで保留。L11候補に9個のHR-AC-HYB-008-01..09 oracle行があるが、候補記載は採択・正式successor・実行済み受入・closureを意味しない。
- OS-033の限定効果: 採択HELIXOS-L2-033の効果は選択engine/detectorのregistry version/config/scope/input snapshot replay provenanceに限定。package manifest、consumer smoke、channel promotion、rollback、action-binding approval、9 acceptance oracleの代替ではない。
- 残差: backup/restore rehearsal、consumer canary、post-promotion monitoring、およびconsumer所有dataを変えずengine pin/managed projectionだけを直前tagへ戻すoracle。
- 反例:
  - sync失敗時にconsumer-owned file/evidenceまで巻き戻す。
  - tagではなく再buildしたartifactをrollback先とする。
  - canary/post-promotion監視なしで同期を完了扱いにする。
- 数値・例外境界: 直前のimmutable tagへ戻す単一rollback target。monitoring window数値・失敗閾値は指定なし。
- 判定: `unresolved`。successor未割当、採択・closureのauthority effectなし。

## REQSRC-SUP-00255 — 旧source line 331

- 原文:    reviewed snapshot、期限、rollback、monitoringを束縛したaction-binding approvalなしに実行しない。（line SHA-256 `6c7806b47e075a2e1699541c5150bdff19fd3b04888cd23c3dd07e91cc24df71`）
- 条件: remote sync apply、tag、release publish、channel promotion、配布先切替、identifier/state cutoverを、actor/tool/target/params、reviewed snapshot、期限、rollback、monitoringを束縛したaction-binding approvalなしに実行しない。
- 固定f6比較: `HARNESS-L2-011`, `HELIXSECURITY-L2-008`, `HELIXSECURITY-L2-010`, `HELIXSECURITY-L2-023`
- 保持: SECURITY-008は操作authorityの制約、SECURITY-010はcandidate update delta/rollback情報、SECURITY-023は各promotion stageの独立状態を保つ。HARNESS-011は依存版/呼出しcontractを確認する。
- 変更・未継承: 旧sourceはlocal reversible plan/dry-run/smokeを自走可能とし、特定remote作用に対してscope-bound approvalを要求する。固定pairの汎用operation authorityを、この一覧のpackage release actionの全binding fieldと取り違えない。
- OS-030の限定効果: HELIXOS-L2-030は後続decisionで保留。L11候補に9個のHR-AC-HYB-008-01..09 oracle行があるが、候補記載は採択・正式successor・実行済み受入・closureを意味しない。
- OS-033の限定効果: 採択HELIXOS-L2-033の効果は選択engine/detectorのregistry version/config/scope/input snapshot replay provenanceに限定。package manifest、consumer smoke、channel promotion、rollback、action-binding approval、9 acceptance oracleの代替ではない。
- 残差: 対象6種の操作についてactor/tool/target/params/reviewed snapshot/expiry/rollback/monitoringの束縛とdrift時拒否を結ぶ条件単位のoracle。local可逆作業との区別も必要。
- 反例:
  - review後にtarget/tag/paramsが変わっても古い承認を使う。
  - local dry-runにもremote applyにも同じ曖昧なapprovalを使う。
- 数値・例外境界: 6種のremote action群（remote sync apply、tag、release publish、channel promotion、正式配布先切替、identifier/state cutover）を列挙。approval期限は要求されるが具体期間なし。
- 判定: `unresolved`。successor未割当、採択・closureのauthority effectなし。

## REQSRC-SUP-00256 — 旧source line 333

- 原文: 受入IDは次のexact setとする。（line SHA-256 `6a1c306b58e3f09033c6cb07ec15c8003b2a8107f37c455a738fa879deed49fa`）
- 条件: 受入IDをHR-AC-HYB-008-01..09のexact setとし、9個のpackage acceptance oracleを明示する。
- 固定f6比較: `HARNESS-L2-006`, `HARNESS-L2-010`, `HARNESS-L2-011`, `HELIXOS-L2-021`, `HELIXSECURITY-L2-010`, `HELIXSECURITY-L2-012`, `HELIXSECURITY-L2-013`, `HELIXSECURITY-L2-023`
- 保持: 個別pairはservice scope、package version/dependency/verification scope、caller contract、供給provenance、artifact工程鎖、authority/promotion分離など対応する部分を保持する。
- 変更・未継承: 採択された各L2/L11候補はそれぞれの範囲に留まる。OS-030 L11候補にHR-AC-008の9 oracle行はあるが、decisionは保留であり候補行の存在は採択を意味しない。
- OS-030の限定効果: HELIXOS-L2-030は後続decisionで保留。L11候補に9個のHR-AC-HYB-008-01..09 oracle行があるが、候補記載は採択・正式successor・実行済み受入・closureを意味しない。
- OS-033の限定効果: 採択HELIXOS-L2-033の効果は選択engine/detectorのregistry version/config/scope/input snapshot replay provenanceに限定。package manifest、consumer smoke、channel promotion、rollback、action-binding approval、9 acceptance oracleの代替ではない。
- 残差: このexact setと9 oracle全体を、各条件から現行L2/L11 acceptanceへの一対一の正式successor/実行済み受入として対応づける証拠。
- 反例:
  - 9個の旧IDを列挙しただけで、それぞれのoracleを実行済み・現行閉包済みと扱う。
  - 一つのaggregate greenで他8条件の欠落を隠す。
- 数値・例外境界: exact setは9 ID（01..09）。加点式/割合合格/一括scoreは指定されていない。
- 判定: `unresolved`。successor未割当、採択・closureのauthority effectなし。

## 静的検証

- queue: a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9。対象11 identityは全てprimary residual、source line tupleと行SHAをarchive raw bytesから再計算して一致。
- f6比較pairのL2/L11 row、該当decision rowと固定ファイルSHAを照合。
- 57+11 decision screen: 全68 entry／66 unique identityを各decision statusとともに保持。
- JSONの11 IDとMarkdown個票見出しの一致を検証。リンクは作成revisionのrepository内path/anchorを対象に静的確認。
- 旧runtime/test/CI、配布/tag/release/remote syncは実行していない。
