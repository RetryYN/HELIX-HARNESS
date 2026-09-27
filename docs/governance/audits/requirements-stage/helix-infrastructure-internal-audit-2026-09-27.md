# HELIX-INFRASTRUCTURE 機構内監査（2026-09-27）

## 対象と判定

- 基準revision: `f47b1e08d872a432dd2e20d40437d48b2db41b60`（監査時点）。INFRASTRUCTURE対象ファイルはこのrevisionで固定。
- 対象: Concept配置根拠、HELIX-INFRASTRUCTURE L1、L2/L11候補と対、PO原文・判断記録、関連する旧資産。実行・旧CLI/runtime/test/CIは使わず、本文の静的照合のみ。
- 26 identityを全数照合。status/authorityはいずれもdraft candidateであり、この監査は採択・L3承認・実行許可を生成しない。
- 結果要約: POの18 minimumはL2-001〜011（加えてWorker接続025）に個別対応し、L11-011でend-to-endに束ねる。012〜024、026は`1.0より後（版は未定）`として隔離されている。Web 1.x、全費用帰属、完全なresource lifecycle、multi-cloud、完全自動failoverを1.0 dependencyへ持ち込む所見はない。
- 具体的な追補候補は「所見」2点。L2-010のSECURITY更新受入のaction別入力・oracle、およびL2-010のoperationごとのrollback/recovery依存を明示すると、L1の1.0 Security connectionを落とさず、無関係な操作を過剰制約しない。L2-003のモデルruntime属性について、受入oracleの列挙を明確にする軽微な強化も記す。

## Source /旧source照合記録

以下SHA-256は実ファイルで算出。行範囲は基準revision上のもの。

| source | SHA-256 | 参照箇所と用途 |
|---|---|---|
| `docs/helix-infrastructure/L1-planning/infrastructure-intent.md` | `1673cf1333c762b817e1031cb610de90b6e967f7c2d851ab2a4b71e4959ebc37` | L19–20のauthority境界、L37–49の機構所有、L53–99の40 L1要求・1.0対応（とくにL85–97）。 |
| `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` | `cab7225b5461ba9a071c1397e75f6ee9e60511719c25342ca85627109c953730` | L19–28の機構scope・pack/version境界、L30–307の26 identity、L329–408の40件対応/18項目mapping、L410–430のsource basis・未決。 |
| `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` | `39cc6ffc11c4994fef69ff4f676fd88f529ec677ef9a4dc58b12a17f77d000ba` | L19–30共通条件、L32–148の1.0受入、L150–163後続版境界、L165–306の後続版受入、L310–316の未決。 |
| `docs/helix-infrastructure/sources/runtime-infrastructure-l1-po-original-2026-09-26.md` | `a76dfdd2106f6aa5b0dc94c65a2cfbc64d2a57298bba7dd07f5b24d1b1589522` | L20–24所有境界、L47–923原要求、L1058–1083で1.0の18項目と高度Autoscaling/Multi-cloud/完全自動Failoverの後送を照合。 |
| `docs/governance/decisions/infrastructure-concept-placement-po-decisions-2026-09-26.md` | `59c45ce845c674866703a595159fff3df32d077f1c36dca23858499b3480bf2f` | L31–37 PO「1.0は18項目、残りは後」、L52–56 ownership / HELIX-Web境界、L58–63の明示版割当、L74–82の過剰な1.0候補を取り消した訂正。 |
| `docs/governance/decisions/infrastructure-l1-idea-po-decisions-2026-09-26.md` | `9f941a051a4aea75059743cbc38dc6cb2fc46e186e3e6ba2a637b5886f0c3f21` | L20–27機構の新設、L39–46 draft/版判断、L58–64 Worker実行への読み替え。 |
| `docs/governance/decisions/worker-execution-model-po-decisions-2026-09-26.md` | `1c93bf0aadccfdf6b536a32d3923a17fbd00a1fd830850f9369b5b6d6b12efb2` | L82–92 Worker契約のowner分割：OSがassignment/execution state、SECURITYがauthority/isolation、INFRAがCPU/GPU/host、INTELLIGENCEが配置案。 |
| 旧 `product-lifecycle-operations-requirements.md` (`LEGACY-ASSET-17C4BF78919578FEBB18`) | `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:68–98,108–119,164–171`。環境/credential参照、deployment/rollback、provider-neutral、promotion、incident/maintenance、自身を通常consumerとする閉路を意味比較。旧L3承認・実行経路は移さない。 |
| 旧 `infrastructure-operations-quality-l3-requirement-candidates.md` (`LEGACY-ASSET-5D41345F55800F23AC38`) | `73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:7–15`。observation provenance、restore/rollback、unknown/stale、test evidenceの比較のみ。未承認L3候補を数値oracleにしない。 |
| 旧 `infrastructure-operations-requirements-and-connections-source_v0.1.md` (`LEGACY-ASSET-E239B45CE3FFE8B34D2B`) | `4d94b4b887a356fb9b17eaddc4df7a9c6e0eaed955d151c48a6efba667be7344` | `archive/legacy-generation-2026-09-14/root/docs/archive/intake/infrastructure-operations-requirements-and-connections-source_v0.1.md:120–132`。design obligationとL4/L5追跡、L128で特定cloud/multiple regionの無条件要求を避ける意味を比較。 |
| 旧 `infinity-loop-platform-requirements.md` (`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`) | `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:165–170`。旧control/data planeとruntime記述の比較。現行L1-008は後続版であり、旧Node/Python構成は移さない。 |
| 旧 `version-up.md` (`LEGACY-ASSET-3E3D84D599ED0476926B`) | `8b4f333a0734a4a2f3f8cea9f1b17c87c3880a0dc271671af45f53be7b7c4a74` | `archive/legacy-generation-2026-09-14/root/docs/process/modes/version-up.md:13–38`。将来能力の保全/後の再接続の意味のみ比較。旧workflow/validatorは使わない。 |

## PO 1.0最小範囲と後続版の境界

PO原文 `runtime-infrastructure-l1-po-original-2026-09-26.md:1058–1083` は18項目（Resource Identity, Topology, Environment, Desired/Actual separation, Drift, Compute/Network/Storage, Model/Worker Runtime, Capacity, Observability, Incident state, Backup/Restore, Rollback, Deployment version, Security connection, OS connection, Runner execution, Bootstrap/Out-of-Band Recovery, Rebuildability）を最低範囲として列挙する。高度Autoscaling、Multi-cloud、完全自動Failoverは後の版に拡張可能とする。

PO決定 `infrastructure-concept-placement-po-decisions-2026-09-26.md:58–63` は対応L1 IDを1.0に限定し、残りのL1要求すべてを`1.0より後（版は未定）`とする。L2自身の対応表 `infrastructure-requirements.md:376–408` は18行をL2-001〜011へ対応し、後続範囲をL2-012〜024へ分離、025をWorker実行資源接続として1.0に配置、026をINTELLIGENCE接続として後続版に置く。

L2-011は18項目を個別確認した上で単体/接続/構成体受入を分け、後続機能を前提にしない（L2:138–146、L11:140–148）。L11:150–163は後続能力の不在だけで1.0を失格にしない具体例を列挙する。とくにL11:158はprovider interchangeability、L11:159はfull cost/decommission、L11:161はWeb tenant runtime、L11:163はadvanced autoscaling/multicloud/automatic failoverを1.0 blockerにしない。現行本文でこの境界に反する必須依存は見つからない。

## 26 identity全数照合

「L2条件」はidentity本文の入力/提供/保証と依存を要約。「L11結果」は対となるL11手順・成功/反例の受け入れ結果。親L1/型/版の一次行も併記。`OK`は本文上の対応あり、実装・実測合格の意味ではない。

| Identity / kind /版 | 親L1と根拠 | L2要求条件 | L11対のresult oracleと判定 |
|---|---|---|---|
| `HELIXINFRASTRUCTURE-L2-001` unit, 1.0 | L1 `001,004,005,006,007,009,022` (L1:58–64,66,79); L2:32–40 | resource identity/topology/environment、network path、storage、model/worker runtimeの台帳。CORE設計参照と各resource/source identityに依存 (L2:34–40)。 | L11:34–42はenvironment別fixtures、source/revision結合、environment分離、unknown維持、logical CONNECTとphysical route分離。未観測値推定やauthorityとの混同をreject。**OK**。 |
| `HELIXINFRASTRUCTURE-L2-002` unit, 1.0 | L1 `002,003` (L1:59–60); L2:42–50 | approved design / deployment target / actualを分離し、missing/unexpected/version/config/network/permission/capacity driftを示す。001、CORE承認設計、source-qualified observation (L2:44–50)。 | L11:44–52は一致/欠落/余剰/差異/unknown dependency/staleをfixture化。actualからdesign変更、unknown一致扱いを失敗にする。**OK**。 |
| `HELIXINFRASTRUCTURE-L2-003` unit, 1.0 | L1 `005,006,007,009,010,011` (L1:62–68); L2:52–60 | common compute/network/storage/model resource/capacity signals; overload時のwait/delay/候補/reject/escalation handoff。001、source、OS/INTELLIGENCE interface (L2:54–60)。 | L11:54–62は十分/不明/不足/staleを入力し、値をsource/revisionに結び、既知不足をOS/INTELLIGENCEへ戻し、unknown/stale許可・無制限Job投入をreject。**OK; oracle強化候補C-3**（後記）。 |
| `HELIXINFRASTRUCTURE-L2-004` unit, 1.0 | L1 `014,016` (L1:71,73); L2:62–70 | observabilityとincident state。欠測unknown、incident meaningは既存承認要求、L2-019の詳細freshnessは不要 dependency (L2:64–70)。 | L11:64–72はnormal/degraded/unavailable/capacity/dependency/data/network/security/collector欠測区分、source/revision、承認済みseverity oracle、欠測healthy誤認をreject。詳細L1-033/034を1.0へ強制しない。**OK**。 |
| `HELIXINFRASTRUCTURE-L2-005` unit, 1.0 | L1 `017,018,019` (L1:74–76); L2:72–80 | backup状態、restore実行、rollback適格性を分離。integrity/reconnection/startup/verification、適格rollback metadata (L2:74–80)。 | L11:74–82は不完全backup、wrong revision、integrity不一致、dependency reconnect失敗等を分け、backup成功のみ、rollbackのみでpass/closureを拒否。**OK**。 |
| `HELIXINFRASTRUCTURE-L2-006` unit, 1.0 | L1 `020,021` (L1:77–78); L2:82–90 | HELIX control plane停止下の独立 bootstrap/recovery、限定操作とSECURITY別authority。005・独立資源・SECURITYに依存 (L2:84–90)。 | L11:84–92はOS/control-plane停止fixture、独立経路/対象scope/別authority、final eligible revisionと残作業を判定。通常権限やauto-failover強制は反例。**OK**。 |
| `HELIXINFRASTRUCTURE-L2-007` unit, 1.0 | L1 `038` (L1:95); L2:92–100 | approved design/config/artifact/dependency/data backup/version/evidenceから実環境をrebuild、再接続・起動・検証。001/005/006 (L2:94–100)。 | L11:94–102は消失状態から隔離環境へ再作成し、結果を入力artifact/revisionへ追跡。文書/backup存在や未確認credential下の起動だけを拒否。**OK**。 |
| `HELIXINFRASTRUCTURE-L2-008` connection, 1.0 | L1 `002` + CORE接続表 (L1:59,後続接続節); L2:104–112 | COREのapproved exact design revision/scopeからtargetを導出し、設計意味を変更しない。001/002、versioned interface (L2:106–112)。 | L11:106–114はtarget/actual/driftを照合し、別revision/scope/未承認designを拒否。actualを設計へ昇格しない。**OK**。 |
| `HELIXINFRASTRUCTURE-L2-009` connection, 1.0 | L1 `001,002,003,014,022` + OS `005,007,008` (L2:116); L2:114–122 | OS work/changeとINFRA resource/runtime状態を別正本で連結。通常接続はstage release不要、stage組込時だけOS-014 contract使用、stage ID≠runtime revision (L2:117–122)。 | L11:116–124はstage未使用とOS stage packの二経路、ticket/actor/evidence/stop-resumeとruntime state、rollback/partial operationを照合。全製品完成や後続L1-023を要求したらfail。**OK**。 |
| `HELIXINFRASTRUCTURE-L2-010` composite, 1.0 | L1 `021,028,029,039` (L1:78,85–86,96); L2:126–134 | 操作要求/target/action/revision/expiry、SECURITY authority/credential/network/isolation/egress、OS assignment/ticket、Worker結果。SECURITY+Worker経由の限定実操作 (L2:128–134)。 | L11:128–136は許可/範囲外/expired/credential不足/revision不一致/partial operation、before/after evidenceを確認。**C-1/C-2要明確化**: update admissionとaction別recovery/rollback適用条件のoracleが明示されない。 |
| `HELIXINFRASTRUCTURE-L2-011` composite, 1.0 | L1の18対象 full list (L2:140); L2:138–146 | 001–010/025の必要identity/evidence、CORE/OS/SECURITY/Worker、対象runtimeを束ね、18項目を個別確認後構成体を受入。Web顧客runtime・後続版を除外 (L2:140–146)。 | L11:140–148はscope pin、18個別入力/期待/観測/result、normal/fail/rollback端から端、単体/接続/composite判定を分離。未知/部分成功/後続条件必須化をreject。**OK**。 |
| `HELIXINFRASTRUCTURE-L2-012` unit, after 1.0 | L1 `008` (L1:65); L2:152–160 | control/execution resource隔離、負荷下で管理停止復旧保護。閾値はCORE/SECURITYから受ける。 | L11:169–176はWorker/CI/Model負荷下のcontrol pathと合意済み操作を確認。隔離方式を独自定義または負荷だけで1.0 failは反例。**OK; 1.0依存でない**。 |
| `HELIXINFRASTRUCTURE-L2-013` unit, after 1.0 | L1 `012,013` (L1:69–70); L2:162–170 | failure-domain別impact、SPOFの影響/復旧/受容理由。redundancy/multicloudを必須にしない。 | L11:178–185は個別failure injection、stop scope/recovery/未完義務。resource listのみ・記録のないSPOF・全件冗長要求をreject。**OK; 1.0 dependencyなし**。 |
| `HELIXINFRASTRUCTURE-L2-014` connection, after 1.0 | L1 `015` (L1:72); L2:172–180 | OS/LABO correlation、許可されたdata-use、因果推定と単なるcorrelationを区別。 | L11:187–194はevent source/revision/ID、許可scopeのみ送付、欠測/拒否維持、correlationだけのcausality確定をreject。**OK; 後続版**。 |
| `HELIXINFRASTRUCTURE-L2-015` composite/connection, after 1.0 | L1 `023,024` (L1:80–81); L2:182–190 | change impactとstaged application、SECURITY acceptance、OS stageと別ID、rollback (L2:184–190)。 | L11:196–203は影響scopeを事前提示、SECURITY acceptance後のみ遷移、段階evidence、unknown impact/無条件全体停止をreject。**OK; 後続版**。 |
| `HELIXINFRASTRUCTURE-L2-016` unit/connection, after 1.0 | L1 `025,026` (L1:82–83); L2:192–200 | provider-neutral capability/adapter、local/VPS/GPU/cloud候補、配置決定はINTELLIGENCE/OS、provider同等性を推定しない。 | L11:205–212は各候補を個別/混在で評価し、capability evidenceを要求。単一cloud/provider名から互換認定をreject。**OK; multicloudは必須化しない**。 |
| `HELIXINFRASTRUCTURE-L2-017` unit/connection, after 1.0 | L1 `027,040` (L1:84,97); L2:202–210 | resource/artifact所在のprovenanceと複数toolからの同一意味contract。unknown locationやtool exitだけで使用許可しない。 | L11:214–221はknown/moved/missing/conflicting locationと異なるtool結果を比較し、location identity/source/revision照合、exit codeのみpassをreject。**OK; tool neutrality後続**。 |
| `HELIXINFRASTRUCTURE-L2-018` unit, after 1.0 | L1 `030,031,032` (L1:87–89); L2:212–220 | full cost attribution、plan-to-dispose lifecycle、decommission前のdependency/data/credential/network/cost/backup/replacement。 | L11:223–230はcost source/workload、全lifecycle、各廃棄checkと不明の未完維持。予算決定/未確認廃棄をreject。**OK; full cost/lifecycle 1.0依存なし**。 |
| `HELIXINFRASTRUCTURE-L2-019` unit, after 1.0 | L1 `033,034` (L1:90–91); L2:222–230 | observed_at/source/freshness/collector/confidence-or-unknownと5状態。基準未定なら独自閾値を作らない。 | L11:232–239はcurrent/expired/uncollected/collector failureを区別、rule/versionを辿る。stale=healthyや無根拠thresholdをreject。**OK; 1.0最低条件は004に残る**。 |
| `HELIXINFRASTRUCTURE-L2-020` unit/connection, after 1.0 | L1 `035,036` (L1:92–93); L2:232–240 | Web runtimeとHELIX本体のscope分離、SECURITY asset classificationに沿うplacement。 | L11:241–248はtenant/job/credential/state/deploymentを別scope、asset分類と実配置を照合。未許可外部配置をreject。**OK; Web 1.xは1.0 dependencyでない**。 |
| `HELIXINFRASTRUCTURE-L2-021` composite, after 1.0 | L1 `037` (L1:94); L2:242–250 | running/candidate generation分離、candidate self-approval防止、前世代復旧経路。 | L11:250–257はself-approval、独立verification、SECURITY acceptance、rollbackを個別確認。candidate自身の承認や先行破壊をreject。**OK; 後続版**。 |
| `HELIXINFRASTRUCTURE-L2-022` unit, after 1.0 | L1 `010,011` (L1:67–68); L2:252–266 | capacity-driven autoscaleは将来採択policy/threshold/authority/ticket条件下に限定。1.0はsignal handoff。 | L11:259–266は承認済条件下のscale state/evidence、unknown policy停止、1.0で自動scale不在をblockerにしない。**OK**。 |
| `HELIXINFRASTRUCTURE-L2-023` composite, after 1.0 | L1 `025,026` (L1:82–83); L2:264–275 | multi-cloud resource composition、provider capability/security/data contract、OS/INTELLIGENCE decision. | L11:268–275は複数provider evidence、scope/compatibility/移行復旧を照合。1.0非使用でも失格にしない。**OK; 後続版**。 |
| `HELIXINFRASTRUCTURE-L2-024` composite, after 1.0 | L1 `019,020,021` (L1:76–78); L2:274–284 | policy/thresholdに基づくfully automatic failoverとdata/dependency/security/recovery条件。 | L11:277–284は採択policy/targetを使ったfailure injectionと復旧端を確認。無根拠RTO/RPO、自動化不在を1.0 blockerをreject。**OK; 後続版**。 |
| `HELIXINFRASTRUCTURE-L2-025` connection, 1.0 | L1 `009,039` (L1:66,96); L2:287–295 | Worker/ticketと実compute/network/storage/process/container資源の区別・trace。自動配置最適化は要求しない。 | L11:288–295は同一Workerのresource移動、資源不足、隔離不能、参照欠落を試し、ticket/責務/未完義務の同一作業traceを確認。**OK**。 |
| `HELIXINFRASTRUCTURE-L2-026` connection, after 1.0 | L1 `026` (L1:83); L2:297–306 | INTELLIGENCEのplacement/capacity/failure/scale/recovery候補をsource/revisionとともにOS/SECURITY/Workerへhandoff。candidateは権限でない。 | L11:299–306はfresh/stale/unknown/authorityなし候補を含み、観測と候補を分離し操作許可へ昇格させない。**OK; 後続版**。 |

## 具体所見

### C-1: L2-010のSECURITY `update admission` をaction別に入力/拒否oracle化する

- **根拠**: L1の1.0対象 `HELIXINFRASTRUCTURE-L1-028` はSECURITYからnetwork constraint、credential constraint、environment/project isolation、action authority、**update admission**、egress policyを受けると明記 (`infrastructure-intent.md:85`)。PO原文は同じ一覧を列挙 (`runtime-infrastructure-l1-po-original-2026-09-26.md:677–693`)。同じくL1-039はprovision/configure/deploy/stop/scale/restore/delete等の実操作にSECURITY authorityを受けたWorkerを必須化 (`infrastructure-intent.md:96`, source `:895–911`)。
- **現行記述**: L2-010入力はauthority/credential/network/isolation/egressでupdate acceptance/admissionを明示していない (`infrastructure-requirements.md:126–134`)。L11-010のfixtureは許可/範囲外/期限/credential/revision/partial operation (`infrastructure-acceptance.md:128–136`) だが、update actionでSECURITYの対応admissionが存在/拒否/不明の場合を分けない。
- **反例**: 正当なscope authorityがあるが対象revisionのSECURITY update-admissionが拒否または不明の状態で、WorkerがInfrastructure updateを適用できる、またはその操作後に成功扱いされる。逆に、read-only observationに無関係なupdate admission欠如を理由に止めると過剰制約。
- **修正候補**: L2-010のaction入力に、適用対象actionがupdate/changeなら該当target/revision/scopeに一致するSECURITY update-admission状態を加える。L11-010に「accepted→許可範囲内のみ進む」「denied/unknown/mismatch→適用前停止・SECURITYへ戻す」を追加し、read-only/非更新操作にupdate admissionを一律要求しない。これは1.0のL1-028接続を具体化する候補であり、後続版L1-023のstaged update lifecycleを1.0へ前倒しするものではない。
- **影響ID**: `HELIXINFRASTRUCTURE-L2-010`（主）、`HELIXINFRASTRUCTURE-L2-011`（14/16構成体のoracle）、L1-028/039。

### C-2: L2-010のrollback / out-of-band recovery依存を操作範囲で区切る

- **根拠**: L2-010は全てのoperationの単独成立依存として`L2-001/005/006/009`を一括列挙する (`infrastructure-requirements.md:129–133`)。L1-039は複数の実操作を列挙するが、read-only観測までbackupや緊急復旧処理が必要とは述べない (`infrastructure-intent.md:96`, source `:899–909`)。L1-020/021とL2-006は別に1.0の独立復旧を要求する (`infrastructure-intent.md:77–78`, L2 `:82–90`)。
- **現行受入**: L11-010は複数の許可/不許可操作とpartial operationを試すが、どのactionでrollback plan、backup、またはout-of-band pathが必要か分類しない (`infrastructure-acceptance.md:132–135`)。
- **反例**: `read-only health observation`が同じcompositeを使うだけで、更新・状態変更のない観測にbackup/rollbackまたはL2-006の独立recovery pathを要求されて実行不能となる。一方、`delete`/`restore`/`scale`の状態変更が復旧根拠なしで実行成功扱いになるのも不安全。
- **修正候補**: L2-010/L11-010にaction classごとの条件を追記する。read-onlyは対象/authority/interface/証拠の条件、状態変更はoperationに対応したbefore/after・rollback/recovery obligation、復旧操作は独立path・別SECURITY authorityを照合する。意味と適用scopeが上流に無ければunknownを残す。SECURITY authorityそのものは実操作に常時必要という1.0条件を弱めず、各操作の回復条件だけを分ける。
- **影響ID**: `HELIXINFRASTRUCTURE-L2-010`、`HELIXINFRASTRUCTURE-L2-005`、`HELIXINFRASTRUCTURE-L2-006`、`HELIXINFRASTRUCTURE-L2-011`、L1-020/021/028/039。
- **確度**: 条件粒度の明確化候補。L2-010を操作構成体と読む場合、006は一部のrecovery actionの前提として正しい。現状の文面は適用条件を指定せず一律依存に読めるため、POの安全要件を損なわず誤読を防ぐ明示が望ましい。

### C-3: L2-003のModel Runtime列挙を受入oracleへ転記する（軽微）

- **根拠**: L1-009は外部model API/local LLM/GPU/distributed server/tuned modelの`model, version, server, GPU/memory need, concurrency, latency, capacity, health, endpoint`を1.0資源として辿る (`infrastructure-intent.md:66`; 原文 `runtime-infrastructure-l1-po-original-2026-09-26.md:261–292`)。L2-003の提供保証も各属性を明示 (`infrastructure-requirements.md:55–60`)。
- **現行受入**: L11-001はModel/Worker runtime fixtureと一般資源identity等を確認するが、上記モデル固有属性の期待値を列挙しない (`infrastructure-acceptance.md:38–42`)。L11-003の入力も`runtime/model requirement`までであり、成功oracleはsource/revision付きresource/capacity情報に留まる (`:58–62`)。
- **反例**: fixture内にmodel resource identityだけ存在し、endpointやmodel revision、GPU-memory/concurrency/latency/healthが未観測のまま「Model/Worker Runtime」minimumを満たしたと判定される。
- **修正候補**: L11-001/003の成功条件に、利用対象のmodel resourceでL1-009の列挙属性をsource/revision付きで参照できること、適用外/未観測/unknownを成功値へ推定しないことを列挙する。数値閾値やモデル能力評価を追加せず、resource inventoryとINTELLIGENCE/LABOの能力評価を分離したままにする。
- **影響ID**: `HELIXINFRASTRUCTURE-L2-001`、`HELIXINFRASTRUCTURE-L2-003`、`HELIXINFRASTRUCTURE-L2-011`、L1-009。
- **確度**: 具体 oracle の可観測性改善。L2側の要求意味そのものは明示済みで、要求追加ではない。

## 既監査案の照合と非所見

- 「006独立bootstrapと007rebuildabilityを別々のoracleで見る」という照合観点は、L2:82–100/L11:84–102に別identity・別試験があり解消済み。新規findingにしない。
- 版境界の照合観点である、詳細freshnessを1.0へ入れない、後続版Web/runtimeとSECURITY配置を混同しない、SECURITY権限をINFRAが生成しない、は現行L2/L11境界と整合。SECURITY authority自体が拒否条件であることは過剰制約ではなく実操作の安全条件。
- 1.0項目7のWorker接続025、項目16の実Worker操作010/025は、POのWorker配置決定 (`worker-execution-model-po-decisions-2026-09-26.md:82–92`) と対応する。Runner/Sandboxという旧実行主体の復活、Workerにauthorityを持たせる読みはない。
- 旧sourceでは現在のowner契約がないため、それだけを差分欠陥としない。新世代未実装・CI未構築であることも受入候補との矛盾根拠にしない。

## 結論

baseline本文は26 identityすべてにL1 parent、版、L11対があり、18 minimumを1.0に閉じ、後続版境界を保つ。具体的に詰める候補はC-1とC-2（L2-010のaction別SECURITY/update/recovery条件）、受入品質の補強はC-3（model runtime属性のoracle）である。いずれもL1意味変更を要せず、候補L2/L11本文の限定明確化として親検収に回せる。

### C-2 補足照合: 通常OS ticketを独立recovery開始条件にしない境界

HARNESS監査後に、L1-020/021およびL2-006とL2-010の接続を再照合した。これは元C-2のread-only/状態変更分類を置き換えず、停止中recoveryの開始条件を追加確認する。

- `docs/helix-infrastructure/L1-planning/infrastructure-intent.md:77-78`の`HELIXINFRASTRUCTURE-L1-020/021`は、HELIX全体/通常管理が停止した場合に、止まったHELIX自身へ復旧を依頼しない独立・限定recovery pathとSECURITYの別authorityを要求する。
- `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:82-90`の`HELIXINFRASTRUCTURE-L2-006`は親をL1-020/021とし、HELIX停止状況、最低資源、SECURITY別authorityを受け、通常Control Plane外から起動/点検/停止/rollback/recoveryを行う。単独成立依存はL2-005、独立resource、SECURITY authorityと記す。
- 一方、同L2 `:126-134`の`HELIXINFRASTRUCTURE-L2-010`は、入力にOS assignment/ticketを置き、単独成立依存へL2-006とL2-009を列挙する。L2-009はOS work/changeとINFRA stateの通常接続で、source `:114-122`ではstage未使用時は通常接続、stage利用時だけOS-014の契約を条件とする。

**条件付き所見**: 文面だけではL2-010におけるassignment/ticketとL2-009がすべての操作で前提か、通常OS/Worker操作に限るかが分類されていない。もし停止したOSのassignment/ticketまたは通常L2-009の応答をL2-006のrecovery開始前提にするなら、L1-020/021とL2-006の独立性を破る循環になる。例として、OS control plane停止後にL2-006の独立pathからhealth確認またはservice停止を始めようとするが、同じL2-010 compositeへのOS ticket/assignmentが発行されないため拒否される状態は、独立bootstrapを使えない。

**修正候補/適用境界**: L2-010およびL11-010で、通常OS/Worker経由の操作ではassignment/ticketとL2-009証拠を必須とし、L1-021のOOB recovery操作ではL2-006が定める独立resource/pathと別SECURITY authorityを開始条件にする、とoperation-class条件を明記する。OOB経路で通常OSの応答やticketを新たに必須化せず、OOB後に通常OSが利用可能になった後の結果同期・記録は後段として扱う。これは通常操作の権限やticketを省く一般例外ではなく、L1-020/021・L2-006の停止時用途に限る区分である。状態変更actionのbackup/rollback条件は元C-2のとおりaction別に別途閉じる。影響: INFRA L2-006/009/010/011、L1-020/021/028/039。L1意味の追加ではなく、独立復旧という既存企画の開始条件と通常operationの境界を明示する候補。

## 作成側の検収

GPT6 Luna highの調査をCodex executionが検収した。C-1/C-2（OOB開始条件を含む）はL2/L11の操作別条件の明確化、C-3はL11の既存属性の判定補強として後続消化へ渡す。別途SECURITY監査の他機構依存点検と対応付け、適用される権限や回復義務を任意化しない。後続版を一律Web 1.xと変更せず、現行の「1.0より後（版は未定）」も保持する。本監査のmergeはこれら候補の消化完了・要求採択ではない。
