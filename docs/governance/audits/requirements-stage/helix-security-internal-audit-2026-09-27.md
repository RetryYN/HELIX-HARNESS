# HELIX-SECURITY 機構内要求監査

- 基準HEAD: f47b1e08d872a432dd2e20d40437d48b2db41b60（G17統合後、調査基準）
- 判定範囲: SECURITY L1/L2/L11の全28 L2 identity、PO原文・判断記録・関連旧sourceとの意味照合。要求本文や登録状態は変更していない。L2/L11はいずれもdraft candidateであり、本監査は採択・実装を意味しない。
- 対象: docs/helix-security/L1-planning/security-intent.md（SHA b779ae38e077474ee10ee07e1bb50eac1da64a86ee3bf2bc06504c1dd53be61d）、docs/helix-security/L2-requirements/security-requirements.md（SHA 027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c）、docs/helix-security/L11-acceptance/security-acceptance.md（SHA e230533415968f15648dac95d3358809b349aa496a700cc92bee9332184e7c52）。
- PO入力: docs/helix-security/sources/security-l1-idea-po-original-2026-09-26.md（SHA 699a0a0df5e92cfe7367dded2ab4c1e1d1cc6f4d8b1bff0418cdfa58e4768c0c）、docs/governance/decisions/security-l1-idea-po-decisions-2026-09-26.md（SHA e101742be643aecd27560a573cc72b113f9b37dd57917703d22ef6236fa4ef59）。

## 旧sourceと変更理由

| Asset / source（path、行、SHA-256） | 保持する意味 | 現行での変更・限定 |
|---|---|---|
| LEGACY-ASSET-322CD23B625A08E2BFB3, archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requests.md:14-24,28-38,40-44, SHA c6d76cd77529eea34518c554a555ed255cff390a34faf679806e50450c4df447 | 認可された対象、操作、環境、network/data scope、期限、scope drift/revoke時停止、sensitive evidence保護 | PO L1-008/009の明示的拡張によりauthority境界をsecurity engagementからHELIX全操作へ広げる。旧special engagementのplan/human gateを新しい通常作業の承認へ持ち込まない。L1-008/009のscope拡張はPO判断記録に人の確認事項として残っている（L1 lines 84-86、decision「人の判断が残る点」）。 |
| LEGACY-ASSET-B62E49D2E156232B8C63, archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:30-80, SHA 161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7 | operation, target, provenance, data/sink, impact, approval, postcondition, rollback, expiryを分離し、欠落/unknownをfail closed | 意味とfailure境界を再導出。旧schema、実装、runtime、CLI、物理target実装詳細を現行要求や合格証拠へ継承しない。 |
| LEGACY-ASSET-170112AB2FA2FFDBFEE9, archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md:20-30, SHA b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4 | unknown/欠落、identity drift、credential/PII egress、rollback欠落、sandbox未対応、部分成功をnegative oracleにする | test designを実行しない。oracleの意味だけを現L11の入力・失敗例に対応させる。 |
| LEGACY-ASSET-99C939E249CAF40935CB, archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/architecture.md:61-64, SHA f4b9fcb98b4250879955f6eca0f2916dc1a27046820a8ad687e8f816b856bea2 | secret-like tokenの判定をsingle sourceへ置く | 旧module/code/APIはcopyせず、PO L1-005のcontext/artifact/egress/revokeまで意味を広げる。 |
| LEGACY-ASSET-EE5DBACC7F28F7D1F605, archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:186,297-300, SHA 7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544。関連 LEGACY-ASSET-B8BBC1D5A8C91E746405, archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/pillar-basic-design.md:145-146, SHA d010289ee78b054642bb170164808144bf842be8e01454fb19d7a67fb309cc56 | external text分離、prompt/tool injection・exfil誘導の分類、監査、deny/review/redaction | 完全検出を主防御とせず、未信頼dataからauthorityへ直接届く経路を作らない（L1-001/002）。旧filter技術を移植しない。 |
| PO原文 §15、§19（対応旧要求を探索した範囲はL1 lines 90-92、L2 lines 392-394） | 旧の対応要求なし | 永続化promotionのpolicy/判定と内部構造probing観測はPO原文起点の新候補と明示。旧実装がないことを新規制約の理由にしない。 |

旧sourceとの対応・保持/変更の判断はL1 lines 80-97とL2 lines 381-403も照合した。過去の旧runtimeやtest/CIを実行せず、旧greenや既存コードの存在を合格証拠にしない。

## 全28 identityの意味監査

「L11行」は全 identityについて受入表の固有成功・反例条件を照合した場所を示す。L11冒頭 lines 17-21のunknown禁止、機密値非記録、単体/connection/compositeの個別判定も共通適用される。ここでのPASSは文書上の対応があり、重大な欠落を確認しなかった意味であり、要求採択・実装済みではない。

| Identity / kind / target | 対象条件とL2原文 | L11 oracleと照合結果 |
|---|---|---|
| HELIXSECURITY-L2-001 / unit / 1.0 | L1-001・PO §2。L2:70-78。外部情報/生成物をsource・project・revision付きuntrusted dataへ置く。読むだけでauthority/persist/learnを作らない。 | L11:25は外部文書/Issue/PR/Web/MCP/Toolを入力し、readからinstruction/authority/memory等への昇格を反例化。PASS。 |
| HELIXSECURITY-L2-002 / unit / 1.0 | L1-002・PO §3。L2:80-88。命令様dataを実命令へ直結させない。完全injection検出は要求しない。 | L11:26に原文型の攻撃例、direct linkage不合格、検出器完全性のみでは不合格にしない条件。PASS。 |
| HELIXSECURITY-L2-003 / unit / 1.0 | L1-003・PO §4。L2:90-98。project/tenant/environment/worktreeへstate・権限・data等を束縛しfallbackを防ぐ。 | L11:27はA/B境界、明示接続なし越境、scope不明allowを反例にする。tenantが実runtime機能を意味しない点だけ明確化候補（詳細後述）。PASS with clarification candidate。 |
| HELIXSECURITY-L2-004 / unit / 1.0 | L1-004・PO §5。L2:100-108。構成sourceをproject/root/HEAD/revision/digest/owner/scopeに束縛し、unknown/staleを黙認しない。 | L11:28は正しい構成とstale/unknown/他project MCP構成を比較し、欠落の暗黙補完を不合格にする。PASS。 |
| HELIXSECURITY-L2-005 / unit / 1.0 | L1-005・PO §6。L2:110-118。raw secretをcontextへ出さず、credentialをoperation/target/scope/expiryへ束縛し、repo混入/egress/revokeを扱う。 | L11:29はcontext/log/artifact漏出、直接Worker露出、期限/revoke後利用を反例化し、値入りreceiptを禁止。PASS。 |
| HELIXSECURITY-L2-006 / unit / 1.0 | L1-006・PO §7。L2:120-128。外部通信のdefault deny、destination/protocol/path/classification/bytes/purpose/authority/expiryの一致。1.0分類基盤のみで判定し、019/1.x sink guardへ依存しない。 | L11:30は許可送信と未知/未許可送信を区別し、vendor privacy設定だけを拒否。1.x asset-specific egressを別に明示。PASS。 |
| HELIXSECURITY-L2-007 / connection / 1.0 | L1-007・PO §8・Worker統一判断。L2:130-138。write path/network/credential/env/timeout/resource/diff/rollback/result回収の制約をWorker環境に渡し、enforcerはWorker側。 | L11:31は各制約の適用・観測を確認し、未適用/unknown時host fallbackや自己拡張を不合格にする。**限定明確化候補**: read-onlyでもwrite禁止enforcementと「変更なし」観測は必須。rollbackだけは変更なしを観測後に適用不要とできる。L11が全制御を毎runでどのように適用するかの状態を明記するとよい。現候補がread-only中の書込逸脱を見逃す方向へN/A化してはならない。 |
| HELIXSECURITY-L2-008 / unit / 1.0 | L1-008・PO §9。L2:140-148。operation毎にauthorityを区別し、影響の大きい操作はactor/target/operation/revision/env/scope/expiryを一致させる。 | L11:32は操作区分・完全tuple・欠落/expiry/driftを反例にする。新たな毎操作人承認とはしておらず、有効authorityの再利用拒否もない。L1の全操作への適用幅はPO判断で人確認事項。PASS, upstream scope decision remains recorded。 |
| HELIXSECURITY-L2-009 / composite / 1.0 | L1-009・PO §10。L2:150-158。revoke、scope drift、未知の外部副作用、漏洩・異常通信・runtime逸脱を該当recipientへ伝播し、unknownをsuccessにしない。 | L11:33は割当停止、Worker停止/隔離、CONNECT/credential/artifact停止を照合。**明確化候補**: L11の「unknownを投入」は一般unknown全般に読める。L2のlisted security trigger/unknown external side effectにscopeし、該当operation/project/recipientだけ停止する条件を明示すべき。無関係な未確定情報による全作業停止はPOの過剰制限注意に反する。 |
| HELIXSECURITY-L2-010 / unit / 1.0 | L1-010・PO §11。L2:160-168。15種類のupdate対象についてprovenance/digest/delta/new executable/finding/rollbackを確認。 | L11:34は全15対象それぞれを確認し、new versionだけ・unknown採用を不合格化。**範囲明確化候補**: POはsource codeを列挙するが、任意の非security変更のたび人間の再承認を要求するとは述べない。security admissionの証跡・自動照合と、必要なauthority decisionを混同しない旨を示す余地がある。必須15対象やsecurity-relevant deltaを削る根拠ではない。 |
| HELIXSECURITY-L2-011 / unit / 1.0 | L1-011・PO §12。L2:170-178。file差分だけでなくread-onlyからwrite/shell/network等への能力差分を見つける。 | L11:35は同じfileでもcapabilityを変えるfixture、hash一致のみの結論を反例化しmodel/Agent/MCP/pluginへ適用。PASS。 |
| HELIXSECURITY-L2-012 / unit / 1.0 | L1-012・PO §13。L2:180-188。外部実行資産のsource/producer/version/digest/dependency/permission/network/risk/update/rollback provenance。 | L11:36は複数asset種別のprovenanceとunknown supplier/capabilityを照合。scanner/registry/providerを新規必須化しない。PASS。 |
| HELIXSECURITY-L2-013 / unit / 1.0 | L1-013・PO §14。L2:190-198。build/validation/配布/実行artifactのidentity/digest/provenanceを結び、digestだけでtrust/passを推定しない。 | L11:37はchain一致、工程欠落・digest差分、digestだけの合格誤認を区別。新CI実装自体を要求せず、receiptが無ければ合格主張できない。PASS。 |
| HELIXSECURITY-L2-014 / unit / 1.0 | L1-014の構成体kindのうちpolicy/判定単体・PO §15。L2:200-208。3 target classごとのSECURITY decision table。legacy対応なしを明示。 | L11:38はmemory/training/BRAINの欠落/unknown/誤targetをhold/denyし、横断保存の主張は027へ分離。PASS。 |
| HELIXSECURITY-L2-015 / unit / 1.0 identity foundation、保護1.x | L1-015・PO §16。L2:210-218。HELIX資産群identity/provenanceを保全し内容dumpは不要。 | L11:39は列挙assetをowner/source/revision/digestで識別、識別不能をpublicにしない。分類対象は列挙外にもなり得るがWeb保護完了とは扱わない。範囲過剰の根拠なし。PASS。 |
| HELIXSECURITY-L2-016 / unit / 1.0 classification foundation、sink適用1.x | L1-016・PO §17/24。L2:220-228。全6分類とunknownを記録し、1.0では公開sink強制を前倒ししない。 | L11:40は分類定義/付与/unknown保存を試し、sink適用を019/025へ区別。PASS。 |
| HELIXSECURITY-L2-017 / unit / 1.x | L1-017・PO §18。L2:230-238。semantic extraction境界を公開contractへ結び、完全攻撃検出は主張しない。 | L11:41はservice contract超過の意味的抜き取りを例示し、1.0に混ぜない。PASS。 |
| HELIXSECURITY-L2-018 / unit / 1.x | L1-018・PO §19。L2:240-248。probing event source/time/scopeを記録し、判断はINTELLIGENCEへ渡す。 | L11:42は列挙行為/反復probeを観測し、無観測を「異常なし」、SECURITY単独確定を不合格化。数値閾値を追加しない。PASS。 |
| HELIXSECURITY-L2-019 / unit / 1.x | L1-019・PO §20。L2:250-258。Core asset sinkに分類/authority付きblock/allow/unknownを適用。 | L11:43はblock例と条件付きcustomer/HARNESS artifact allowを確認、unknown/secret通過を拒否。1.x。PASS。 |
| HELIXSECURITY-L2-020 / unit / Guard 1.0、Bot必要時 | L1-020・PO §21/24。L2:260-268。deterministic Guardとsemantic Botを分け、Bot候補全実装を要求しない。 | L11:44はGuard ruleがBot不在でも適用され、Bot候補を一律runtime化しない。**版境界明確化候補**: Guard一覧にCore Asset Guardが含まれる一方、完全なcore asset exposure/egressは019/025の1.x。Guardの1.0基盤と1.x sink適用を明示して読み違いを防ぐ。現L2-020本文の「必要な版」は方向を示すが、L11冒頭列挙は分離がさらに明瞭にできる。 |
| HELIXSECURITY-L2-021 / connection / 1.0境界 | L1 flow 1・PO §23。L2:272-280。External→CONNECT→SECURITY→LABO/INTELLIGENCEの未信頼データ受渡し。 | L11:45はsource/classification/contract version/provenanceを維持し、受領だけで昇格しない。通信/再送はCONNECT所有。PASS。 |
| HELIXSECURITY-L2-022 / composite / 1.0 | L1 flow 2・PO §23、L1-008等。L2:282-290。INTELLIGENCE request→SECURITY authority→OS assignment/progression→Worker enforcement。 | L11:46は同一tupleの連続性と責務越境/requestだけの実行を反例化。旧SEA特権経路を全操作に黙って適用していない。PASS。 |
| HELIXSECURITY-L2-023 / composite / 1.0 | L1 flow 3・PO §23。L2:292-300。security update admission→Worker→HARNESS verification→OS promotionを分離する。 | L11:47は各stageのidentity/result/rollbackとfailure holdを照合し、security acceptance・HARNESS green単独で昇格しない。PASS。 |
| HELIXSECURITY-L2-024 / connection / 1.0 | L1-005/006/007/009・PO §1/8/10/23。L2:302-310。SECURITY policyとINFRASTRUCTURE resource/actual stateをWorker enforcementへ結ぶ。 | L11:48はpolicy/enforcement/physical observationのtrace、unknown/未適用をfailure化。INFRASTRUCTUREにpolicy作成を負わせない。PASS。 |
| HELIXSECURITY-L2-025 / composite / 1.x、基盤1.0 | L1 flow 4・PO §23/24。L2:312-320。Web/WEB-OS公開経路のasset boundary。 | L11:49は全境界のtenant/service identity/classification維持、1.0にWeb完了を混ぜない。tenant fixtureは構成した場合のscope試験であってローカル1.0に顧客tenant runtimeを要求しない。PASS with clarification candidate。 |
| HELIXSECURITY-L2-026 / connection / Guard 1.0、意味能力1.x | L1-017/018/020・PO §21/23。L2:322-330。SECURITY Guard event→INTELLIGENCE semantic diagnosis。 | L11:50はGuardとmodel/routing/意味判断を分離し、unknownを制限として返す。Bot必要時接続で全Bot常設はしない。PASS。 |
| HELIXSECURITY-L2-027 / composite / 1.0 | L1-014構成体・PO §15/23。L2:332-340。Context→Memory、Episode→Training Dataset、Product Knowledge→BRAINの各promotion経路を別々に閉じる。 | L11:51は各経路を独立traceし、source/classification欠落と一経路のみの全体主張を拒否。sink固有保存・評価・登録はsink ownerへ残し、LABO/OSを全経路の必須工程にしない。PASS。 |
| HELIXSECURITY-L2-028 / unit / 1.0 | L1-010/013・PO §11/14。L2:342-350。HARNESS共通pack descriptorへSECURITY固有更新/ artifact integrityを適用。 | L11:52はidentity/version/digest/dependency range/provenance一致を確認し、共通交換/rollback lifecycleの重複所有を反例化。PASS。 |

## 具体finding・修正候補

### S-1 — L2/L11-007: read-onlyでも境界証拠を維持する（限定明確化）

- 原文: PO §8（source snapshot）とL1-007（security-intent.md:52）はwrite path限定、network/credential/environment/timeout/resource、diff、rollback、result collectionを最低条件とする。L2-007 `security-requirements.md:132-137` は各制約をWorker環境へ渡し、適用証拠を要する。L11-007 `security-acceptance.md:31` は各制約の適用・観測を受け入れる。
- 旧根拠: LEGACY-ASSET-9114D4E463E95B67DD0C `worker-common-contract.md:57-58` (SHA `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290`) は全Workerを隔離worktree内に置き、network default-deny/secret deny/scope外diff fail-close。LEGACY-ASSET-E9954F654E58B47A08B8 `L8-worker-isolation-policy-unit-test-design.md:22-29` (SHA `e02ae67bf03317bf0fb8e98971c79589c6850585a5a1c190335f41968ed8870a`) はdeny-all/scope、許可内外diff、mutation fenceを確認。旧SEC-AC-CAP-009 `security-capability-broker-acceptance.md:28-29` はpostcondition/partial/rollback unavailableを区別する。
- 判断: read-onlyラベルだけでwrite enforcement/diff観測をN/A化すれば、書込逸脱を見逃すため過剰緩和。必ずwrite禁止enforcementが有効で、実行後の「変更なし」観測が必要。rollbackのみ、変更なしが観測された場合に適用対象外とできる。変更有無unknownなら停止/unknown。read-onlyなのにrollback処理そのものを実行しろ、という意味にはしない。
- 修正候補: L11-007へ「read-only入力でもwrite禁止制約の適用と実行後の変更なし観測を確認する。rollbackは変更がないと確認できた場合に限り適用対象外とし、変更有無がunknownならpassにしない」を足す。runtime実装や閾値を新設せず、L2のscopeを保存する。
- 影響: SECURITY-L2-007、SECURITY-L11-007。OS/INFRA/INTELLIGENCEからのWorker依存は対象操作の安全境界として保持する。

### S-2 — L2/L11-009: triggerと停止scopeを「該当」recipientへ限定する（明確化候補）

- 根拠: L2-009 `security-requirements.md:152-157` のtriggerはrevoke、scope drift、unknown external side effect、credential leak、abnormal communication、runtime deviation。対象operation/project/worker/credential/connection/artifact identityを入力し、該当recipientへ伝播する。L11-009 `security-acceptance.md:33` は列挙triggerに加えて「unknownを投入」と短記する。
- 具体反例: ある無関係な文書項目の意味unknownだけを発生させても、security trigger/外部副作用と関係ない全operation・全recipientを止める読みなら通常の開発作業まで不必要に止める。逆に、対象operationで発生したscope driftやunknown external side effectを無視すれば旧SEAの安全境界を失う。
- 判断: L2の「該当先」とidentity束縛が全停止への過剰拡張を抑える。L11の「unknown」は単独だと広く読めるため、L2列挙triggerまたは影響がunknownなsecurity-relevant副作用に限り、同じidentityに束縛した該当recipientの停止を検証する一文が明確化候補。
- 影響: SECURITY-L2-009 / L11-009、OS割当停止、Worker停止、CONNECT停止の適用scope。全体kill switchや新たな人手再承認を追加しない。

### S-3 — L2/L11-010: source code更新確認と毎回の人間承認を区別する（範囲の明確化候補）

- 根拠: PO §11はsource codeを含む15種類の更新候補を挙げ、出所/digest/依存・権限・network・credential差分/新規実行物/findings/rollbackを確認する。L2-010 `security-requirements.md:162-168` はcandidateのSECURITY accept/reject/unknownを返す。L11-010 `security-acceptance.md:34` は15種それぞれの情報と採否根拠を照合する。
- 注意: これは要求された更新候補の安全情報/判定を省略しない根拠であり、日々の通常コード編集ごとに人へ重複approveを求める根拠ではない。高影響操作authorityはL2-008に別にある。現L2/L11に「毎更新の人承認」とは書かれていない。
- 判断: source code対象をPO文言から削らない。もし監査の消化PRで人手承認を新設しようとするなら過剰である。候補の更新記録とsecurity-relevant差分照合を、上流decisionが必要な変更意味の承認と分ける説明があればよい。明確な現行矛盾とは認定しない。
- 影響: SECURITY-L2-010/L11-010、HARNESS検証/OS昇格は023で別owner。

### S-4 — L2/L11-003 tenant dimension: identity条件とtenant runtimeの区別（明確化候補）

- 根拠: PO §4、L1-003 `security-intent.md:48`、L2-003 `security-requirements.md:90-98` はproject/tenant/environment/worktree identityをscopeへ束縛する。L11-003 `security-acceptance.md:27` はA/B tenant fixtureを例示する。Infrastructure L2-001 `infrastructure-requirements.md:19` はHELIX-WEB-OS顧客tenant/runtime等を本体対象から明示除外。
- 判断: これはtenant runtime/顧客向けmulti-tenancyをローカル1.0へ要求する確定矛盾ではない。project隔離のscope keyとしてtenantを識別できることと、customer tenant serviceを運転することは別。該当environmentにtenant identityが無い場合に新runtimeを発明しない、と書けば誤読を防げる。
- 修正候補: L11 fixtureでtenantを使う場合は合成identityのscope-boundary probeと明示し、存在しないtenant subsystemの構築を受入条件にしない。なお、tenant identityが入力に存在する案件でscope照合を省略してよいという意味ではない。
- 影響: SECURITY-L2-003/L11-003、Infrastructure L2-020（後続Web runtime separation）との版境界。

### S-5 — L2/L11-020と019/025: Guard 1.0とCore Asset sink enforcement 1.x（版境界の明確化候補）

- 根拠: PO §21はCore Asset GuardをGuard例へ含め、§24はTrust Boundary等の1.0範囲を列挙する一方、asset protection/exposure/core egressをWeb開始前の1.xへ置き、分類/identity基盤のみ1.0とする。L2-020 `security-requirements.md:260-268` はCore Asset Guardを決定的Guard列挙へ含め、guard 1.0とBot必要時を定める。L2-015/016 `:210-228` はidentity/classification基盤とsink enforcementを分離。L2-019/025 `:250-320` はasset egress/Web boundaryを1.xに印付ける。L11 rows 39-44 `security-acceptance.md:39-44` もこの分離を持つ。
- 判断: L2-020のGuard境界（決定的規則をsemantic Botへ委譲しない）は1.0と読め、019/025のasset/Web sink enforcementまで1.0に前倒しする確定矛盾はない。ただし「Core Asset Guard」という名称は実使用機能全体を1.0に要求するようにも読める。
- 修正候補: Guardの能力境界/準備が1.0、Core Assetの公開sink適用は019/025に従い1.xと、L11-020に明記する。1.0で既に必要なCredential/Egress/operation guardsは維持。
- 影響: SECURITY-L2-020/L11-020、015/016/019/025/026。

## 全ID監査結果の集約

| 結果区分 | IDs | 監査結果 |
|---|---|---|
| 主な明確化候補 | 003, 007, 009, 020 | tenant scopeのnon-runtime読み、read-only境界証拠の精密化、security trigger範囲、Guard/Core Asset 1.0/1.xの境界。いずれも本文の最低安全義務を削る提案ではない。 |
| 運用手続きの範囲を明記できる候補（確定欠陥ではない） | 010 | 15 update対象と安全情報確認はPO原文どおり。毎回の人承認を要求しないことを一言で区別できる。 |
| 他の23 IDs | 001,002,004,005,006,008,011,012,013,014,015,016,017,018,019,021,022,023,024,025,026,027,028 (ただし025もWeb版境界の受入監視対象) | 対象被害/境界とL11の正常/失敗条件がPO/L1に結び付く。重要な本文欠落・内部矛盾は未確認。015/016/017-019/025/026のWeb後続版境界、014単体対027複合、020 Guard対Bot、028共通pack対固有security責務の区別が保持される。 |

## 過剰制限と版境界の総合確認

- SECURITY-L2-008 `security-requirements.md:140-148` は操作固有authorityを要求するが、高影響操作のtuple適合と毎回の人間再承認を同一視していない。scope・revision・expiryに合う有効な既存authorityを照合する読みを保つ。通常作業に重複許可を要求する条文は確認されない。
- SECURITY-L2-006 default denyは外部通信にかかり、ローカルread作業全般の停止とは書かれていない。credential/network/secretなどactual surfaceの保護を落とす緩和はしない。
- G9初回経路の人確認（OS G9 `governance-requirements.md:832-845`, L11 `governance-acceptance.md:448`）は性能実績ゼロで許可済み低リスクtaskを初回実行する固有経路の入力契約であり、SECURITYの一般的な每回承認要求ではない。性能未評価だけで拒否しない条件も保たれる。
- Web/多tenant/課金運用の1.x化はSECURITY L1 rows 60-67、L2 version table rows 53-65、L11 rows 39-50に一貫している。L2-015/016のidentity/classification foundationだけを1.0にし、公開sink/semantic exfil/probing/core asset egress/Web compositeを1.xへ分ける。Infrastructure L2-001/020の境界も一致。ローカル1.0でWeb顧客runtime、外部公開、tenant job運転、課金全量集計が常時必須となる確定矛盾は未確認。
- 新CI/runtime未実装は欠陥findingとしない。L2-013/023の必要evidenceは契約条件として残り、証拠が無ければ実行/昇格の成立を主張できないだけである。
- PO/decisionの既存判断（Worker enforcement分離、Web 1.x、分類基盤1.0、L1 authority scope拡張確認）は再質問しない。authority上流の判断記録に残る事項と、今回の技術的明確化候補を分ける。

## source→ID/L11意味被覆確認

L2 `security-requirements.md:352-379` のPO §§1-24 atom crosswalkを、L1 rows 46-78、上記個別L2 section本文、L11 rows 25-52およびE2E/除外 lines 54-67に対して再読した。source atom一覧の単なる一致ではなく、各L2 identityの所有機能、依存、version target、failure routeと、対の具体oracleを上表で照合した。全28IDのL2/L11対応を確認。欠落・不整合を理由に新要求を追加せず、上記S-1〜S-5は既存identityの受入明確化候補として留める。

## 親による検収と後続への引渡し

本監査は[要求ステージ整理の指示原文](../../sources/requirements-stage-po-handoff-original-2026-09-27.md)を起点とする。起草はGPT6 Luna high Worker、統合・検収はCodex execution、独立reviewはClaude review_mergeが担当する。作成側照合を独立reviewとは数えない。

G18統合後のbase `858026b250a15d4fec020b21b315c250decf960b`で、冒頭のSECURITY L1/L2/L11のbytesが調査基準f47b1e08dと同じことを確認した。親はPO原文§§1〜24、L11全28行、L2の該当境界とWorkerの旧source対応を照合した。Guard 1.0という表記は現行L1/L2側の版指定であり、PO原文§24の逐語引用ではない。

| 候補 | 親の判断 | 消化先 |
|---|---|---|
| S-1 | L2の既存最低条件を保持したL11明確化を行う。read-onlyでもwrite禁止と変更なし観測を残す。9制御それぞれの合成入力・反例を補う。 | L11-007の受入補強。各fixture値は普遍閾値にしない。 |
| S-2 | 対象のsecurity triggerと該当recipientを受入で明示する。 | L11-009。未知の外部副作用を無視せず、無関係な一般unknownを全体停止へ拡張しない。 |
| S-3 | 現行本文に毎回の人承認要求はなく、本文変更不要。15更新対象を維持する。 | 本監査で確認済みとして扱う。新しい承認手続きを作らない。 |
| S-4 | 合成tenant identityと顧客tenant runtimeを区別する受入明確化を行う。 | L11-003。存在するtenant scopeの照合は保持する。 |
| S-5 | 1.0基盤と019/025の1.x sink運用の区別を受入へ明記する。 | L11-020。既存1.0のcredential/egress等の保護を延期しない。 |

このPRは監査記録だけを追加する。4件の受入明確化は後続の消化PRで実施し、そこでL11訂正のregister/receipt/current pinを揃えて独立reviewを受ける。本監査のmergeだけでこれら4件の解消や要求ステージ完了を主張しない。要件段階へ渡す数値・形式等は、後の総合検証で別に一覧化する。
