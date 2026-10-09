# HELIX-HARNESS 共通カーネル L5詳細設計（K1/K2/K3/K4/K5/K6/G3/K8）

status: draft
owner: HELIX-HARNESS
parent_requirement: なし（要素別にL4 §2.1／§3.1／§9.2／§10.2／§13.1／§16.1／§18.1の直接crosswalkへtrace。HARNESS-L2-031を親にしない）
paired_l8: ../L8-detail-verification/common-kernel-detail-verification.md
base: main `3961daac08d032ad512026e8365fafd9eae831c5`

本書は共通カーネルL4のK1「結果の多値型」、K2「identity・revision・digestによる鍵」、K3「既存operation authorityのread-only照合」、K5「正本記録とprojection」、K4「義務の一級化」、K6「検証receiptとissuer authenticity」、G3「oracleの種別」、K8「入力label・明示経路の記録」を詳述する。L4の型、判定、鍵、失敗分類、alias意味、authority境界を変えない。K7/K9/K10は本書では`not_designed`であり、対応する現行L4/L9への参照だけを残す。実装、L6 algorithm、実行、物理writer enforcementは定義しない。対のL8もfixtureを設計するだけで未実行である。

本設計が想定する単一HARNESS unitの配置候補は`helix/helix-harness/units/common-kernel/`（`enc(helix-harness)=helix-harness`、`enc(common-kernel)=common-kernel`）で、宣言正本は同じフォルダの`declaration.json`とする。identity候補は`common-kernel`、pack version候補は文字列`0.1.0`、maturity候補は`development`、owner候補は既存の`core`種別と`HELIX-HARNESS-CORE`である。これらはHARNESS-L2-010/AC-HARNESS-L3-010-01の既存欄へ置く技術候補であり、登録値、製品版、release unitへの収載、将来版を確定しない。宣言項目の形はrepository-layout RL-C2が定める既存項目だけを使い、schema-version/kindの封筒以外にfieldを足さない。

## 1. 入力文書とtrace規則

| 入力 | 固定対象 | SHA-256 |
|---|---|---|
| Common Kernel L4 | main `3961daac08d032ad512026e8365fafd9eae831c5`のcontent本文pin：`docs/helix-harness/L4-basic-design/common-kernel.md`（K1/K2: §2/§3、とりわけ§2.1/2.5/2.6、§3.1–3.4.1。K3: §16全体。K4/G3: §13全体。K5: §9全体と§15.4–15.6の境界接続。K6: §10全体） | `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` |
| Repository Layout L4 | main `3961daac08d032ad512026e8365fafd9eae831c5` content pin：`docs/helix-harness/L4-basic-design/repository-layout.md`（§2–3、RL-C1–7、RL-D1–5、RL-T1–3、RL-K1–3、§6.1/§10） | `6968876dad1760257686108064520e1e98783b6034ca19bac7d6c7df1a3385f1` |
| Pair L9 | main `3961daac08d032ad512026e8365fafd9eae831c5`のcontent本文pin：`docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md`（K1/K2、IV-K3全27識別子、IV-K4-01–10、IV-G3-01–05、IV-K5-01–26、IV-K6-01–15、IV-K7/IV-LDG関連行） | `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` |
| Stage 1 PO decision | `docs/governance/decisions/helix-harness-stage1-l3-l10-po-decision-2026-10-05.md`（§「対象revisionと本文SHA」「適用範囲」） | `efda65558a62b0d1caddd98d424704e60c5f827f6e9bf3eaadd861fd0259741e` |

L3 direct parentはL4各§のcrosswalk列記に限る。K6 §10.2の直接由来はConcept（原則6）、AC-HARNESS-L3-022-02/031-02/032-05/036-02、SECURITY-FR-031-03、SECURITY-AC-012-01、OS AC-OS-018-01/023-02/029-03であり、後続ownerやconsumer参照を直接親へ加えない。K1の直接由来は§2.1にあるHARNESS AC-HARNESS-L3-022-02、030-02、032-02/03、CONNECT CONNECT-AC-002-01/006-02、LABO LABO-001-AC-02、INFRA INFRA-001-AC-01、SECURITY SECURITY-AC-001-01、BRAIN BRAIN-008-AC-02。K2の直接由来は§3.1にあるHARNESS AC-HARNESS-L3-010-01/03、022-05、030-04、031-05、032-04、CONNECT CONNECT-AC-002-01、LABO LABO-001-AC-02、BRAIN BRAIN-008-AC-02、OS AC-OS-014-02、INTELLIGENCE AC-INT-010-06。K1-I6のkey必須条件からK2 §3.1のHARNESS 030-04/032-04へ、またK2記録/保存からK5 §9.3へつなぐ箇所は契約境界の相互参照であり、K1/K2それぞれの直接crosswalk親へ加えない。K3の直接親はL4 §16.1が列記するSECURITY-AC-008-01、022-01/02/03、009-01、003-01、005-01、006-01に限る。AC-OS-014-04/-06はK7接続の境界参照でありK3親へ加えない。K5の直接由来はL4 §9.2のConcept、CONNECT-AC-005-01、INTELLIGENCE-078-06/078-04/INT-063-03、LABO-001-AC-02/002-AC-03/050-AC-02、HARNESS-024-05に限る。§15 K7/台帳との接続は同じL4 §15.1の既存AC/PO判断を参照し、K5へ別の親要求を追加しない。別のL3要求を追加せず、各L4 crosswalk外へ親を拡張しない。HARNESS Stage 1の判断記録は対象本文revision `a77672513325aa9e79f3780af40455361b5d19a8`とL2-010/011/023に限るため、同判断を他機構または他親の承認根拠として流用しない。

K4/G3の直接親はL4 §13.1のHARNESS AC-HARNESS-L3-014-01〜04、021-02、036-04、041-02、OS AC-OS-018-01/023-02、CONNECT CONNECT-AC-006-03、INFRASTRUCTURE INFRA-005-AC-04、HARNESS AC-HARNESS-L3-049-05/022-01/02、SECURITY SECURITY-AC-026-01/02に限る。K4からK5/K6への接続はboundary linkであり直接親を追加しない。K4/G3の固定入力は既存L4 §13全体とL9 IV-K4-01〜10/IV-G3-01〜05である。

L4はK1/K2/K3/K5を8機構共通部品として配置するが、単一の親要求を置かない（L4 §1.3）。本書も`parent_requirement: なし`の境界を保ち、各API節・L8ケースのtrace列に直接のL4 contract IDとL3 ACを記す。K3は§6.1、K5は§6.2で既存K1/K2契約を使うが、別の親要求は作らない。

## 2. 旧HELIX sourceと再導出

以下は旧sourceを起点に現行L4へ再導出した箇所である。archive assetは歴史資料であり、旧本文・旧runtime・旧testのコピーや実行を意味しない。asset ID、source行、source bytesのSHAを固定する。

| 旧source（asset ID／archive path:行／SHA-256） | 保持する点 | 変更・区分 |
|---|---|---|
| `LEGACY-ASSET-5E2592D7BB50EC290C9B`／`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md:22-30,48-70`／`d446588a1fe6999e458a41f2c4683d34459ff7b12b28a057642cc2f6e15e6898` | typed observation、unknownを肯定にしない、複数軸とfindingを保持 | 測定専用の状態・閾値から全機構のK1へ広げ、`Unobserved`/`NotApplicable`等を現行L4どおり定義する。**意味を再導出** |
| `LEGACY-ASSET-98372FEE8A3AC8F9C299`／`archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-template-json-authority.md:97-99`／`3015d4f3d65cd1f8205f88f29dd59c4f1f7ef42c729d8144f2319e49fe20d830` | N/Aは理由・authority・再入条件を要し、未知や欠落からN/Aを作らない | 現行K1-I5のdisposition条件へ**意味を再導出** |
| `LEGACY-ASSET-BC214D81DE9E77B8A804`／`archive/legacy-generation-2026-09-14/root/docs/archive/cross-system-audit-2026-09-05/source/audit-report.md.txt:72-80`（F02）／`dcf0d4e0dcc4db772afac465df10f2412134cd65dcd019a18cb99c9fd39be53f` | 空の必須集合で個別検査が消えた失敗例 | 現行K1-I4の空集合`Unknown(missing_input)`を説明する失敗根拠。旧source規則のコピーではない |
| `LEGACY-ASSET-67B016392E3F7D58B053`／`archive/legacy-generation-2026-09-14/root/docs/design/harness/L5-detailed-design/module-decomposition.md:22-45,74-93`／`da787dcfd95b0b4011dc1979df1b6652e990f75ffb71750c6ff9c24a2a24739a` | owner境界、公開IF、依存を契約へ向ける構成 | 現行K2のpure key/lookup/record境界へ**意味を再導出**。旧module/pathは採らない |
| `LEGACY-ASSET-7873E44594456A8F925A`／`archive/legacy-generation-2026-09-14/root/docs/design/harness/L5-detailed-design/internal-processing.md:23-105`／`048755e3729a7deaaedc8259f3334859d408f0d99487e7459f9d1ed93b4e8072` | 入出力、pre/postcondition、失敗型をoperation単位に記述 | 現行K1/K2 signaturesとresult classへ**意味を再導出**。旧CLI code/exit codeを置換 |
| `LEGACY-ASSET-310E87378AFE8095809C`／`archive/legacy-generation-2026-09-14/root/docs/design/harness/L5-detailed-design/physical-data.md:22-42,101-114`／`a3064a3b705adcf0a5f76c3210aa431d87b7971aed2fe88f948a323a40c7772f` | source recordと派生projectionを区別 | K2の記録・lookupはL4のK5保存記録を入力するpure APIとして記す。旧SQLite/event schemaは**置換**し、本書で物理保存を選ばない |
| `LEGACY-ASSET-73B5C6C7D281E28EC541`／`archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L8-integration-test-design.md:48-75,120-145,182-193`／`c8b287ee4e103255081f00439b7fb2f3dfd259e0fb35a2760b48ad583524fe15` | L5 operationとL8 fixtureのtrace、normal/negative分離 | 現行L9 IDをfixtureへ結ぶ方法だけ**再導出**。旧test runner、旧pass状態、G8を移さない |
| `LEGACY-ASSET-829E9C1646D4883C8B99`／`archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L8-source-boundary-contracts.md:11-33`／`d0f7281b170a59d4ed26e618bee6b3c3c749c4f2ad1f1e2f8673ce0445f977f9` | 一件の変異と一つの期待結果を関連付ける観点 | L9で定義済みの期待値を単独fixtureへ分割する形を**再導出**。旧source boundaryのpolicyは移さない |
| `LEGACY-ASSET-0327D0DF98618D3066FD`／`archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:28-44,60-70`／`81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` | unspecified dependencyをallowとせず、scope/source境界を明示する | RL-D1の宣言済み依存だけを使う契約へ**意味を再導出**。旧署名・旧policy schemaを移さない |
| `LEGACY-ASSET-656F75AF81EE933415D9`／`archive/legacy-generation-2026-09-14/root/docs/design/harness/L5-detailed-design/durability-boundaries.md:24-30,43-52`／`b6c4c6f58259b6c09f6cd52a64ab1fb7b04114a41d2b1089fdc5b9730f8666d5` | 同一directoryの一時file、原子的公開、writer直列化、曖昧な復旧を肯定しない | repository storeの追記はK5 manifest/segment/entry chainへ従い、旧atomic-file実装を持ち込まない。物理writer enforcementと初期bootstrapは本書から実装済みとしない |
| `LEGACY-ASSET-17E4FD7C3DB0B3C82210` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md:29–41,55–58` — `cb97e7594b38cfada7d4fedb948937bab9e9d8f3e7c7123eca82a7ce6e8f8eb4` | row 792、Historical/unresolved、consumer_refs空。draft candidate。 | request/decision/approval識別の分離とapprovalの対象・scope・revision・actor・provenance束縛を再導出。旧memory/provider ruleや包括PO attributionは現行K3へ移さない。 |
| `LEGACY-ASSET-B62E49D2E156232B8C63` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:32–44,116–151` — `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7` | row 482、Historical/unresolved、consumer_refs空。旧L3 authorityは#679 failureを対象にtyped axis/action binding/current checkを要求。 | typed複数軸、不明を肯定にしない、使用時current照合、値非表示reasonを再導出。一方、旧8軸のdata/sink/impact/approval/postcondition、closed capability enum、physical filesystem/sandbox、runtime gateは現行7 tuple軸と独立operation_inputsに置換し、K3へ新設しない。 |
| `LEGACY-ASSET-170112AB2FA2FFDBFEE9` — `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md:全59行` — `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` | row 2842、Historical/unresolved、consumer_refs空。10受入条件、個別negative。 | typed axis/current decision/expiry/revoke/redactionをL4/L9の既存oracleに限って再導出。physical canary、runtime coverage、egress受入はK3 scopeにしない。 |
| `LEGACY-ASSET-E92D9979D003D353DB99` — `archive/legacy-generation-2026-09-14/root/tests/security-capability-broker-authority-design.test.ts:全67行` — `ff1ee8fefaf8416cafb4a706301cb7a7d4afe549f04e31c5560a1cac4d88d31e` | row 3866、Historical/unresolved、consumer_refs空。読んだのは3文書のstatic design testで、runtime safetyを主張しない。 | artifact pairing/status traceの比較資料に限る。testは起動せず、passやruntime behaviorを根拠にしない。 |
| `LEGACY-ASSET-BB08D70A42B6445B2D1E` (510) `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md` | `36-42,62-64,78-89,119-122`; `9e18d68b5e463192fb30b839eb164d79f7202a15374482f65181b238df8e513d` | append-only、訂正追記、event→projection、readback不一致fail-closeを保持。旧harness.dbを計画/状態authorityとした形は置換。異digestを拒否から両記録を保持するK2/K5 conflictへ改める。 |
| `LEGACY-ASSET-C35E93F2D36777CD7462` (513) `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md` | `145-153`; `2a757a52082f823c4e52ae1e04887b62b8ac5f5df0d833d2b1c00516d6572357` | append event→projection→checkpoint、seq/hash chain、canonical JSONLを保持。aggregate/DB transactionをwriter別segmentとread時検査へ再導出。 |
| `LEGACY-ASSET-8771887517A619A2D501` (264) `archive/legacy-generation-2026-09-14/root/docs/adr/ADR-007-harness-db-sqlite-projection.md` | `18-22`; `50c05a00872be6c23de531aaecd6a6cfd26abec264718e0223ac2630f739dcdf` | projectionがrebuild可能でauthoring sourceでない点を保持。保存方式はK5 JSONLへ置換。 |
| `LEGACY-ASSET-9EDE8332CF4F627105EA` (392) `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/handover-db-derivation.md` | `35-38`; `e95e612c601ccb226b90e515eca633439745bb9a2266c889031ef7518c39d18d` | event先行、idempotent projection、append後/projection前replayを保持。SQLiteとDB優先規則を置換。 |
| `LEGACY-ASSET-F6E9EA3422A0EF1DF090` (386) `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/feedback-lifecycle.md` | `76-104`; `2e0a028fc48c6acc92a5b09ada9fc511ed0389b71af9deee782ec81aa731a655` | terminal stateを再投影で戻さない、新generationを分ける、absence closeにはfull-scan markerを要す点をK5-I9/I11とK2 revisionへ再導出。 |
| `LEGACY-ASSET-F677F6D81EB9FCAE2E3F` (913) `archive/legacy-generation-2026-09-14/root/docs/governance/handover-retirement-memory-audit-2026-07-11.md` | `34-35,56,81`; `93b4a0bd78ebc88266eb3d795ad29384169a1fa8698691acbb724984f462d8b4` | consumer failure: 311,927-byte CURRENT.json、手書きmarker drift、防衛追加後もclosed feedback復活/open=2010飽和。state pointerを正本にせず、全scopeなしのcloseを禁止。 |
| `LEGACY-ASSET-6929C09B95A444D95B49` (1023) `archive/legacy-generation-2026-09-14/root/docs/improvement-backlog.md` | `258,260` (IMP-149/151); `e6d327ff488860dcaa8d7a150ac893e5cf0940eb710396cdf7ae746f5689a9e2` | false projector driftの反復と470MB全件読取りの遅さ（独立検証不確実）を保持。projector key/checkpointへ再導出。閾値は設けず、性能は後続測定。 |
| `LEGACY-ASSET-B6DC14C1DA937E3AC96C` (570) `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/node-runtime-cutover.md` | `47-53,106-112,123-129`; `49f3e4c324b19e728f7c05787bbd698f841728a526eedc7cec3f756b3601e9f9` | commit pointをpointer CAS一件にし、commit前にauthorization/writer epoch/leaseを再読、古いepoch/CAS敗者は作用0という点をK7へ一般化。 |
| `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` (424) `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` | `117,198`; `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | 旧HIL-FR-27のpreserved source snapshotは文脈資料としてのみ保持し、current K7-I6（独立review済み現行L4 sourceが定めるfencing）をK5 append/K2 recordへ接続する。旧snapshot自身を新しい要求/authorityにしない。 |
| `LEGACY-ASSET-BC2275DCE9BFFCF813C8` (577) `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/python-worker-runtime.md` | `133-136`; `4c26544b5cf6e63ed226838ff5e04b3a669f6a9aa13456ffc5e5fb41fc755f8a` | cancel/timeout/reassignment後は正しいbytesでもold run resultを拒否し、新ownerは新run/checkpointから再開する。 |
| `LEGACY-ASSET-1B413588CFF3B1360B49` (266) `archive/legacy-generation-2026-09-14/root/docs/adr/ADR-009-node-python-linux-runtime.md` | `113-120`; `bdd1c9a00243b723342e42531ddeabbf2f7570594943c11226d5b0461769753c` | 可逆transaction、explicit authorized rollback、自動fallback禁止をK7-I3/I4/I5へ保持。 |
| `LEGACY-ASSET-D461943347D372ECF6DA` (869) `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requirements.md` | `33,43`; `38a68e48ca26cb277b6f5d88439b33b58aecf48f5b650f7596aec04e438b6b16` | 旧security候補sourceのrevoke論点は歴史的なfailure/contextとして保持し、現K5 appendは既存K3/K7/G5 contractの非肯定を越えない。候補本文を新しい要求/authorityにしない。 |


旧K2 analogは限定的である。`archive/legacy-generation-2026-09-14/root/src/shared/canonical-digest.ts`（`c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000`）と旧`tests/digest.test.ts`（`fef9cfe82f280fb79ff35b4516ee0e847965b57d479014bca32ff7ac8043a390:10-40,68-99,128-166`）はprefix付きdigest型、canonical bytes、golden consumer compatibilityの隣接根拠だが、現行K2のstale/conflict分類、ResultKey、role aliasとは同型ではない。型の区別と不正値を肯定しない点を保持し、Node `Buffer`/crypto、旧native `Error`、既存consumer digestは置換対象とする。`invalid_digest`／`duplicate_identity`は旧reasonの移植ではなく、現行L4 §3.4で定めたK2 `key_of`境界の検査条件と順序から再導出する。旧measurement evaluatorのdomain固有failure分類もK2へ移さない。旧`tests/measurement-evidence-evaluator.test.ts`（`cfe1051a4a8b1a0634744837d704ab558f8a8295ffedf0df9d54f94923ce1f92:157-185,258-279,323-355,404-448,507-517`）はunknown伝搬と全finding保持のsource consumer例として読むが、実行・合格証拠にはしない。

## 3. 共有値型

### 3.1 K1: `Observed<T>`

公開型と型フィールドはL4 §2.2をそのまま用いる。

```text
Observed<T> =
  | Value(value: T, key: ResultKey, evidence: EvidenceRef)
  | Unknown(reason: UnknownReason, key: ResultKey, evidence: EvidenceRef?)
  | Unobserved(key: ResultKey, why: UnobservedWhy, superseded: KeyDigest?)
  | Stale(prior: Value<T>, recorded_key: ResultKey, current_key: ResultKey)
  | NotApplicable(reason: Text, authority: AuthorityRef,
                  reentry_trigger: Text, key: ResultKey)
```

`UnknownReason`, `UnobservedWhy`, `Digest`, `SubjectRef`, `ResultKey`, `KeyDigest`はL4 §2.2/§3.2の閉じた型を参照し、ここで別名・値を増やさない。構築時の欠損拒否はL4 K1-I6の`Rejected(missing_key)`に従う。

### 3.2 K1 API contract

公開API表の返却型は通常の返却型を示す。既存の外側union `ApiBoundaryResult<T> = T | Rejected(missing_key)`は必須key field欠落の既存API境界に維持し、K1 `UnknownReason`の語彙もL4どおりとする。`combine`、`admit`、`disposition`、`lookup`の既存境界と`record`の既存返却unionは変えない。K2 `key_of`だけは§3.3の専用union `KeyOfResult`を返し、`ApiBoundaryResult<T>`へ新reasonを加えない。

`PolarityOf<T>`は値型ownerが持つ版付き写像で、kernelがdomain値を解釈しない。heterogeneous成分はL4 §2.5の成分別写像表現を使う。owner/callerのmapping解決境界で必要な写像が得られない場合、元の`Value`を`combine`へ渡さず、既存の完全なkeyを持つ`Unknown(missing_input)`を構成して他の成分とともに既存`combine`へ渡す。これはK1 mapping contractに必要な入力準備であり、新しいK1 APIやObserved classではない。

| API | 入力・出力 | 契約と失敗 |
|---|---|---|
| `combine(components, polarity) -> Combined<T>` | 均質値型の順序付き`Observed`列と単一`PolarityOf`。異種値型は各`(Observed, PolarityOf)`の列。各成分に対応するmappingを解決済みで渡す | 入力鍵をすべて検査。成分全体を入力順で保持し、全negative/non-value/excluded indexを返す。negativeがあれば`Negative`、それ以外のnon-valueがあれば`Undetermined`、全有効成分がpositiveなら`Positive`。判定成分ゼロは`Undetermined`と`set_reason=Unknown(missing_input)`。mapping未解決のdomain ValueをこのAPIへ渡す経路は置かない。 |
| `admit(combined) -> Admitted \| Withheld(reasons)` | `combine`結果型（境界では鍵を再検査） | positiveのみ`Admitted`。その他は、全negative・non-value・whole-set理由をL4順序で保持する空でない`Withheld`。`Observed`単体のshortcutを設けない。 |
| `disposition(reason, authority, reentry_trigger, key) -> Observed<T>` | N/A候補の明示根拠と完全鍵 | 三根拠すべてがある場合だけ`NotApplicable`。どれか欠ければ`Unknown(invalid_disposition)`。 |

**入力不変条件**: K1-I6で列挙されたK2 key fieldがすべて存在すること。これらのkey field欠落だけを`Rejected(missing_key)`とする。各Observed variant内部のdomain値/evidence等のshape妥当性は型で与えられる入力として扱い、K1-I6以上の欠落field/reason分類はここで定義しない。`Stale`はlookupで導出する読み取り結果であり、`record`可能な観測ではない。

**集合診断の型**: `Combined.set_reason`はL4 §2.2の`{class: Unknown, reason: missing_input}`または不在であり、Observedではない。`Unknown(missing_input)`表記はこの欄だけの略記である。component数を増やさず、key生成・流用・単独recordをしない。admitでは既存whole理由へ展開する。外側のObservedへの展開には当該ownerの既存operation/component keyを用いる。

**出力不変条件**: unknown・unobserved・staleをpositive valueへ変換しない。否定Valueとunknownを区別し、最初のnegativeで後続成分を落とさない。`NotApplicable`はpositiveではなく、その根拠付き成分だけ判定から除外できる。0件Valueを返す上位operationは完全走査証拠が入力にある場合に限る。

### 3.3 K2: reference and key records

```text
Digest       = "sha256:" + 64 lowercase hex
GitRevision  = 40 lowercase hex
SubjectRef   = { kind, identity, revision, digest }
ResultKey    = { operation, operation_version, subject: SubjectRef,
                 inputs: SubjectRef[] (identityで整列), scope }
KeyDigest    = Digest(canonical_json(ResultKey))
ResultRecord = { key, key_digest, result: Observed<T>, result_digest, producer }
KeyOfResult  = ResultKey | Rejected(missing_key | invalid_digest | duplicate_identity)
```

`Digest`と`GitRevision`、短縮表示値を相互比較しない。`identity`は版を越えて安定、`revision`は版識別、`digest`はbytes SHA-256。文書refのrevision/digestはL4 §3.2どおり対象commit+pathと対象本文bytesに結び付く。構造化データのdigestはL4 canonical JSON bytesに結び付く。`inputs`はoperation ownerが宣言する結果依存refの全集合で、identity順に一意化する。

### 3.4 K2 API contract

| API | 入力・出力 | 契約と失敗 |
|---|---|---|
| `key_of(operation, operation_version, subject, inputs, scope) -> KeyOfResult` | ownerがcurrent宣言から再構成したref集合 | 検査順は(1)必須key field欠落を`Rejected(missing_key)`、(2)存在する`subject.digest`または`input.digest`のDigest形式不正を`Rejected(invalid_digest)`、(3)それらを通過した後の`inputs` identity重複を`Rejected(duplicate_identity)`とする。すべて通過した場合だけinputsをidentity順に整列し`ResultKey`を返す。後段の拒否へ読み替えない。 |
| `lookup(records, query_key) -> Observed<T>` | K5 readerが復元した記録全体とcurrent key | L4 K2-I2順で判定。候補なし/identity-set変更は`Unobserved(not_run)`、同一identityのsame-revision digest差またはkind差は`Unknown(conflict)`、完全一致は保存class、旧Valueのみなら`Stale`、旧non-Valueのみならsuperseded付き`Unobserved(not_run)`。完全一致と競合候補が共存すれば競合を優先。lookupは入力記録を書き換えない。 |
| `record(records, key, result, producer) -> Recorded \| NoOp \| Conflict \| Rejected(missing_key \| stale_not_recordable)` | 完全keyと記録可能な観測 | 同じkey+result digestは`NoOp`。同keyの異なるresult digestは双方を保持して`Conflict`。stale resultは鍵の有無と無関係に`Rejected(stale_not_recordable)`として拒否する（IV-K1-08/IV-K2-11）。非Stale resultの必須key欠落は`Rejected(missing_key)`。前recordを上書きしない。 |

`record`の「記録可能な観測」は、L4 K5 §9.3の`ResultBody`としてcanonical JSONへ符号化可能な入力を意味する。`Value.value`とevidenceはownerの宣言済みencodingによる`Inline`または既存`FixedRef`で表し、任意のPython objectをそのまま渡さない。K1の一般値型`T`をJSON型へ制限するものではない。K2呼出し前にowner側がこの表現を構成し、宣言encoding未解決・範囲外値はK2 `record`を呼ばず該当encoding ownerへ返す。K2の公開unionへcodec例外や新reasonを追加しない。この入力前提はL4 §3.2/§9.3の具体化であり、K5のencoding選択・物理保存・FixedRef実読をK2が行う意味ではない。

`lookup`の候補優先順はL4 §3.3を適用する。すなわちoperation/version/scopeとsubject identity、inputs identity集合で候補を選び、候補全体を同revision異digest／kind違いについて先に検査し、次に完全一致を選択し、最後に旧revision規則を適用する。候補0件はL4どおり`Unobserved(not_run)`である。K5側で必要な記録集合を完全に復元できない読取不全を、空集合の正常結果とみなさない。

### 3.5 role-bound input alias binding

L4 §3.4.1の規則をK2 inputs構成・K6 read joinの境界として具体化する。ここではK3/K8/K9各ownerのrole vocabulary、resolver実装、reader実装は定義しない。

```text
RoleBoundInputAlias(context, role, raw_ref) -> SubjectRef
RoleBoundInputBindingRef -> SubjectRef
```

- alias identityはownerが宣言したrole/context/raw identityから作る。alias digestはraw source content digestをそのまま使う。raw refの`kind/identity/revision/digest`とaliasの対応を、current owner resolverが作るcanonical binding bytesへ全て含める。
- ownerがbinding revisionを持てばその版を使う。持たない場合はalias identity順の`{alias_identity, raw_revision}` mappingだけからrevisionを決定し、digestはrevision計算へ入れない。binding digestは全canonical binding bytesのdigest。
- `ResultKey.inputs`へ独立binding refと各source-content aliasを含める。readerはbinding canonical bytesを読み、各alias identityでraw source bytesを実読してraw digestを照合する。binding読取はsource実読の代替にならない。K6 read identityはL4 §10.3に定めるsubject＋non-verifier inputs集合へ厳密一致し、raw identityの別readを加えない。
- 同じalias identityでは完全一致raw refだけdeduplicateする。alias内の異なるraw refは`Rejected(missing_key)`。role/contextが異なるalias間ではraw identityが同じでも重複拒否へ流用しない。複数side/roleのsource readはalias identity単位で記録する。
- K3/K8/K9の既存owner binding revision方針とrole/context fieldは個別owner側に残す。K2はdigest意味を共通化するだけで、selection authorityや比較結果を決めない。

## 4. 失敗とowner境界

| 境界 | owner / consumer | 非肯定または拒否の返し方 |
|---|---|---|
| K1値の構築 | 各機構が自身の値型・値から`Observed`と`PolarityOf`を作る | K1-I6が列挙するkey field欠落は`Rejected(missing_key)`。variant fieldのshape validation/reason mappingは本書で定義しない。分類不能は`Unknown`、未実行は対応する`Unobserved`。kernelが機構statusを書き戻さない。 |
| K1合成・admit | kernel pure API／機構のoperation consumer | 否定は`Negative`、不明を含む肯定不能は`Undetermined`と全reasonで保持。N/A無効は`Unknown(invalid_disposition)`。 |
| K2 key宣言 | operation ownerがcurrent subject/input/scope全集合を供給 | `key_of`は必須field欠落→存在するDigest形式不正→inputs identity重複の順で`Rejected(missing_key)`、`Rejected(invalid_digest)`、`Rejected(duplicate_identity)`を返す。L4 §3.4.1の同一alias内異raw refは`key_of`前に`Rejected(missing_key)`とする。ownerはlookup記録からcurrent refsを逆算しない。 |
| K2 read/lookup | K5 readerが全record bytesを復元しK2 pure lookupへ渡す | unavailability/corruptionはK5/K1の既存unknown classに保持。K2はpartial record listをcomplete扱いしない。 |
| K2 record | operation ownerが結果を提供、K5が記録を所有 | duplicate exact resultはNoOp、同key異bodyはConflict、staleは`stale_not_recordable`。 |
| role alias resolution | role/contextを宣言したownerがcurrent mapping bytesを供給、K6がsource readを確認 | caller mappingでowner resolverを上書きしない。binding/raw bytes不一致はsource observationとして肯定しない。 |

## 5. 言語候補（AI設計判断）

L5のpure K1/K2 APIの実装候補はPython標準ライブラリとする。HARNESS-L2-008は意味導出coreにPythonを明記し、L2-005はlanguage/toolを固定しない。K1/K2は値の構築・canonical key比較・決定的なclass返却が中心で、Pythonの型注釈、`dataclasses`/`enum`、`hashlib`、`json`を外部packageなしで表現できる。これはL4が定めるcanonical bytesとdigestの意味を変更せず実装できる候補という設計判断である。Python標準`json`の既定出力をそのままcross-runtime canonical formatとみなす判断は含まない。

TypeScript/Nodeは旧HELIX実装例があるが、歴史上の選択にすぎず、現行repository-layout RL-K2は旧Node/TypeScript/Vitest/Biome/package構成を引き継がず、Bunを禁止している。Rust等は型表現能力があるものの、今回の対象L3から言語根拠は得られず、Python候補より必要な選択根拠を持たない。K2 canonical byte互換の正規化仕様、package構成、K5 I/OやK6 runnerは別のL6範囲で設計する。本候補は追加要求・承認・gateではなく、Stage 1の実装可能範囲を広げない。

## 6. K3/K5 詳細設計

### 6.1 K3 既存operation authority照合

本節はL4 §16の型とread-only判定境界を詳細化する。許可を発行・拡張したり、実作用や保存writerを持つAPIは追加しない。直接L3 parentとK7境界参照は§1.1のとおりで、L8 fixtureはL9のK3識別子27件すべてへ対応する。

#### 6.1.1 旧source・台帳・consumer・failureとの対応

旧sourceはL4 §16.5と、PR #2751固定親commit `6e0564e8793a531c9c7f45d3b1c17fa482846774`の本書§6.1.1を再現可能な前回K3調査記録として起点に再読した。台帳行はいずれもhistorical/unresolvedでconsumer_refsは空。旧本文を現行authorityへ昇格・copyせず、保持点だけを現行K3契約から再導出する。

| 旧asset / source path:行 / 全文SHA-256 | ledger row・consumer / failure | K3で保持する点と変更理由 |
|---|---|---|
| `LEGACY-ASSET-17E4FD7C3DB0B3C82210` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md:29–41,55–58` — `cb97e7594b38cfada7d4fedb948937bab9e9d8f3e7c7123eca82a7ce6e8f8eb4` | row 792、Historical/unresolved、consumer_refs空。draft candidate。 | request/decision/approval識別の分離とapprovalの対象・scope・revision・actor・provenance束縛を再導出。旧memory/provider ruleや包括PO attributionは現行K3へ移さない。 |
| `LEGACY-ASSET-B62E49D2E156232B8C63` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:32–44,116–151` — `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7` | row 482、Historical/unresolved、consumer_refs空。旧L3 authorityは#679 failureを対象にtyped axis/action binding/current checkを要求。 | typed複数軸、不明を肯定にしない、使用時current照合、値非表示reasonを再導出。一方、旧8軸のdata/sink/impact/approval/postcondition、closed capability enum、physical filesystem/sandbox、runtime gateは現行7 tuple軸と独立operation_inputsに置換し、K3へ新設しない。 |
| `LEGACY-ASSET-170112AB2FA2FFDBFEE9` — `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md:全59行` — `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` | row 2842、Historical/unresolved、consumer_refs空。10受入条件、個別negative。 | typed axis/current decision/expiry/revoke/redactionをL4/L9の既存oracleに限って再導出。physical canary、runtime coverage、egress受入はK3 scopeにしない。 |
| `LEGACY-ASSET-E92D9979D003D353DB99` — `archive/legacy-generation-2026-09-14/root/tests/security-capability-broker-authority-design.test.ts:全67行` — `ff1ee8fefaf8416cafb4a706301cb7a7d4afe549f04e31c5560a1cac4d88d31e` | row 3866、Historical/unresolved、consumer_refs空。読んだのは3文書のstatic design testで、runtime safetyを主張しない。 | artifact pairing/status traceの比較資料に限る。testは起動せず、passやruntime behaviorを根拠にしない。 |
| `LEGACY-ASSET-0327D0DF98618D3066FD` — `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:28–40,60–70` — `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` | row 412、Historical/unresolved、consumer_refs空。旧analyzerはwrite/child-process authorityを持たない。 | read-only判定と作用を分離し、dispatch前driftを肯定しない・後driftをuncertainに残す境界を再導出。旧署名必須receipt、Node port、CAS/filesystem条件は移さない。 |

旧PLAN-L3-62（`LEGACY-ASSET-AE2D8BC488A4A87E9728`、全148行、`archive/legacy-generation-2026-09-14/root/docs/plans/PLAN-L3-62-security-capability-broker-authority.md`、SHA-256 `ab38056d506369c383dab4ade8ad8de0719c273216cecdbf002ee5756196d3af`）の§0/受入118–148行は、physical identity/provenance/sink/sandbox/runtime coverageのfailure gapを記録する。#679本文は本設計で独立再取得していないため、Planの記載をIssue本文の独立再検証済み事実としては扱わない。旧L10の10 acceptance項目はK3既存oracleを越える根拠にしない。

#### 6.1.2 L4型とowner境界

次の型shapeとfield意味はL4 §16.2を参照し、fieldを追加・削除しない。

~~~text
PermissionQuery = { operation, target: identity, revision: SubjectRef,
                    requested_scope, operation_inputs: { identity -> SubjectRef } }
PermissionQueryRef = SubjectRef{kind: permission_query,
  identity: canonical_json({kind, operation, target, revision_identity, sorted_operation_input_identities}),
  revision: canonical_json({revision.revision, operation_input revisions}),
  digest: sha256(canonical_json(PermissionQuery))}
OperationAuthorityTuple = { actor: identity, target: identity,
  operation: read | write | execute | network | install | delete | merge | release | deploy | credential-use | security-change,
  revision: SubjectRef, environment: SubjectRef, scope: normalized explicit scope,
  expiry: existing permission expiry }
PermissionRecord = { ref: SubjectRef, tuple: OperationAuthorityTuple,
  operation_inputs: { identity -> SubjectRef }, outcome: allow | deny | constrain,
  reason: redacted explanation, source: SubjectRef, issuer: identity,
  constraints: SubjectRef[] }
AuthorityDecl = FixedRef。SECURITYが所有するcurrent宣言。
  { sources: { source identity -> { current: SubjectRef, adapter: VerifierRef, issuer: identity } },
    rules: SubjectRef, required_inputs: { operation -> identity[] } }
AuthorityContext = { tuple: OperationAuthorityTuple,
  operation_inputs: { identity -> SubjectRef }, current_assignment: SubjectRef（OS所有）, target_owner_decl: SubjectRef,
  environment_decl: SubjectRef（INFRASTRUCTURE所有）, operation_decl: SubjectRef,
  authority_decl: SubjectRef（SECURITY所有）, policy: SubjectRef,
  source_current: { source identity -> SubjectRef }, observed_at: 時刻観測の固定参照,
  revocation_heads: SegmentHead[], pre_execution_constraints: SubjectRef[] }
ResolutionDiagnostic = { reason, available_refs: SubjectRef[], missing_identities: identity[] }
AuthorityContextResolution = Resolved(AuthorityContext)
  | Unresolved(ResolutionDiagnostic)
PermissionCheckResult = { query: PermissionQueryRef,
  context: AuthorityContextResolution, permission: SubjectRef（呼出し側の候補ref）,
  effective_decision: Observed<SubjectRef>（current選択refと候補refの一致を含む）, components: Component[],
  combined: Combined, assurance: K6の真正性3項目, authority_effect: "none" }
PermissionCheckDiagnostic = { query: PermissionQueryRef?, reason: missing_key | invalid_query,
  available_refs: SubjectRef[], missing_identities: identity[] }
PermissionCheck = PermissionCheckResult | PermissionCheckDiagnostic
~~~

- `PermissionQuery`は要求値で、許可・current stateを証明しない。PermissionQueryRefはL4式どおりquery値・対象・revision identity・operation input identity setを束縛する。`OperationAuthorityTuple`のoperationはL4の11種（`read`, `write`, `execute`, `network`, `install`, `delete`, `merge`, `release`, `deploy`, `credential-use`, `security-change`）をそのまま使い、7軸のscope/expiryは既存意味のまま保つ。name similarityやimplicit wildcardを加えない。
- SECURITY source ownerは`AuthorityDecl`/policy/current permission refs/adapter/issuerを持つ。OS assignment、対象ownerのtarget/revision関係、INFRASTRUCTURE environment、operation owner declarationは各ownerに残す。K3は参照を`AuthorityContext`へ束ねるが、caller contextやcurrent refを受け取らず、owner recordを更新しない。
- `PermissionRecord`はplain caller objectでなく、登録済みsource adapterがexact source bytesから構成する。adapterがsource/issuer/ref/revision/digestと既存policyを照合し、未宣言field/許可を補わない。署名検証はsource adapterが既に宣言する場合だけ行い、K6 receiptやissuer名一致を署名証明にしない。
- `AuthorityInputRef`のalias digestはraw source content digest。binding refはquery identityを含み、owner resolverがcurrent `{role, raw SubjectRef}`の全mappingをcanonical bytesへ固定する。binding revisionはalias identity順の`{alias_identity, raw_revision}`のみから決まりraw digestを含めない。K6はそのbufferと各aliasのraw bytesを読みdigestを照合する。K6 `read` identityはsubject＋non-verifier inputsと完全一致し、raw `SubjectRef`の別readは追加しない。
- alias identityごとに完全一致raw refだけをdeduplicateし、同一alias内の異refはK2 key構築前に既存`Rejected(missing_key)`。異なるrole/side alias同士のraw identity衝突はK2 duplicate identityへ流用しない。callerがbinding mappingを提供・上書きしない。
- L4に`CurrentReader`という型はない。読取契約はK5の`current_head`/`read`/`restore`と、K3のowner-registered read boundaryである。L5はK5 APIへの抽象依存を記し、新reader object/repository/adapterを新設しない。resolverはowner current_headを取得し固定prefixを読み、caller `input_heads`は期待値照合だけに使う。

#### 6.1.3 K3 function/API contract

`resolve_authority_context`と`check_permission`がL4 §16.4の公開受け口である。helper名はL5内部trace用で、公開endpoint/APIや新ownerを作らない。

| 関数・境界 | 入力／出力 | owner責務・失敗 |
|---|---|---|
| `derive_permission_query_ref(query)`（private） | typed `PermissionQuery` → `PermissionQueryRef` | canonical identity/revision/digestをL4式から導く。呼出し側がrefを差し替えない。 |
| `resolve_owner_mapping(query_ref, input_heads)`（private resolver boundary） | query ref、owner declarations、SECURITY AuthorityDecl、K5 current heads | owner-registered read boundaryから各current source/valueを読み、role/raw-ref全mappingのimmutable binding bytes/refとsource-content aliasesを得る。caller headsはexpected only。不明・読取不能等は既存context/K1 classificationへ戻す。 |
| `resolve_current_effective_decision(source, fixed_prefix, query_tuple)`（private owner selection） | registered source adapter/current full prefix/query tuple → `Observed<SubjectRef>` | source/adapterが宣言する既存selection/inclusion ruleだけ使う。一意候補なしは`Unknown(missing_input)`、複数競合は`Unknown(conflict)`、rule未登録は`Unknown(unregistered)`。時刻/append order tie-breakや新しいselectorは作らない。 |
| `compare_tuple_axes(query, context, record)`（private pure comparison） | query/context/current PermissionRecord → axis-specific `Component[]` | 7軸を独立比較し全componentを保持。明確な不一致はnegative `Value`、欠落/unknown/conflictは対応する既存Unknown。広い既存permissionの包含はadapterの明示policyに限る。 |
| `compare_required_operation_inputs(query, record, authority_decl)`（private pure comparison） | queryとrecordのinput refs＋current `required_inputs[operation]` → components | identity setとref値を完全照合。purpose/classification/source/destination等をtupleへ畳まない。exact set/policyが読めない場合既存`Unknown(missing_input/unregistered)`。 |
| `resolve_authority_context(query, input_heads)` | `AuthorityContextResolution | PermissionCheckDiagnostic` | current OS assignment、target/revision relation、INFRA environment、SECURITY AuthorityDecl/policy/source current refs、operation declaration、時刻、revoke headsからcontextを再構成。caller context/refの受け口なし。K2 complete key不能は既存Diagnostic `missing_key`、context不足は`Unresolved`と各K1 componentを返す。 |
| `check_permission(query, permission, input_heads)` | `PermissionCheck` | source候補refを受け、current context/source decision、K3-I1–I7、expiry/revocation、K6 assuranceを再照合するread-only API。非肯定componentsを保持し`Combined`へ渡す。permissionを発行せず、callback/write portを受け取らない。 |

K2 `key_of`が返す`Rejected(invalid_digest|duplicate_identity)`は、L4 §16.4の「完全なK2 keyを作れない場合」に従いK3 API境界で`PermissionCheckDiagnostic(reason: missing_key)`へ写し、K1 `Unknown`やK2 resultへ変換しない。K3の同一alias内異refもL4 §16.3/§16.4の明示規則により同じ診断になる。この写像はK3のkey構成境界に限る。`invalid_query`のpredicateもL4に列挙がないため、新しいvalidation ruleとして使わない。typed Queryを前提にし、既存query validatorが無い異常入力へreasonを増やさない。

`check_permission`はread-only resultを返す。K3用resultを保存する具体caller/LogDeclはL4 §16に指定されていないため、新しいwriter/ownerを発明しない。既存operation ownerがK2 `record`とK5の保存境界を使う場合、その責務は既存宣言から与えられる。保存済みK6 `Unobserved(pending_receipt)`はrecord/source不在`Unknown(missing_input)`と混同しない。

#### 6.1.4 invariantからL5 functionへのtrace

| L4 contract | L5 owner/function boundary | L9 oracle |
|---|---|---|
| K3-I1/I2 全7軸、11操作、欠損・unknown・確定不一致、全component保持 | `resolve_authority_context`, `compare_tuple_axes`, `check_permission` | IV-K3-01/02/09/13 |
| K3-I3 既存current decisionのみ、非生成、constraint前提 | `resolve_current_effective_decision`, `check_permission` | IV-K3-04/05/06 |
| K3-I4 使用時再照合、完全K2 key、alias bindingとK6 raw read | `resolve_owner_mapping`, `derive_permission_query_ref`, K2 `key_of`/`lookup` boundary | IV-K3-03/14/14a–j/15/16 |
| K3-I5 expiry/revoke/scope drift | `check_permission`, K5 current-head boundary; post-append K7 consumer | IV-K3-07/08/12 |
| K3-I6 request→decision→assignment→effective-scope ownership | `resolve_authority_context`; K7 `apply_move` is consumer | IV-K3-09/11/12/17 |
| K3-I7 required operation input exact set/value | `compare_required_operation_inputs` | IV-K3-10 |

Direct L3 traceは§1.1に限る。IV-K3-11/12/17はK7の`apply_move`/recovery消費側境界を含むが、K7のAPI実装やOS-014-04/-06をK3の新parentにしない。

#### 6.1.5 dependency/failure boundaries

| Dependency/boundary | K3 detail | Owner / result |
|---|---|---|
| K1 | 各軸・source/status/input/assuranceをcomponentとして保持し既存`combine`を使う。Diagnosticは外側unionでK1 `Unknown`へ変換しない | K3が構成し、K1が合成する |
| K2 | `PermissionQueryRef`、alias refs、`AuthorityInputBindingRef`、owner code/config/current refs、固定時刻参照、取消し用`HeadInputRef`でL4 §16.3/I4どおりの完全な鍵を作る。`key_of`/`lookup`の意味は変えない | K2が鍵/lookupを担い、K3がcurrent role mappingを担う |
| K5 | `current_head`、`read`、`restore`がcurrent stateの固定prefixをread-onlyで読む。全ownerを跨ぐglobal atomic snapshotは保証しない | K5がlog/readを担う |
| K6 | 署名有無にかかわらずsource evidenceはadapter/K6契約に従い、receipt assuranceの3項目は許可と分離する | K6がverifier/read evidenceを担う |
| K7/G5 | K3 checkは`apply_move`で消費する。CAS/pointer writer/immediate observation/recovery/rollbackの境界はK7が担う | K7/G5が作用を担う |

既存制約、expiryのparse/comparison、adapterのsignature規則、current selector/inclusion policy、actorとtargetのrelation宣言、operation input identity集合はそれぞれの既存ownerに残す。選択規則不明、候補間conflict、ref読取不能、required declaration欠落は既存K1 `Unknown`の範囲で扱う。TTL、grace period、scope hierarchy、selector、approval条件、owner、permissionは追加しない。K3はauthorityを照合し、制約適用、外部作用、operation成功を証明しない。


### 6.2 K5 正本記録とprojection

K5はK1の`Observed`、K2の`ResultKey`・完全な`ResultRecord`、L4 §3.4のeventを使い、追記専用JSONLを記録の正本、projection/checkpointを再構築可能な派生物として扱う。ここではL4 §9の型・不変条件・受け口をL5の関数境界へ具体化する。K5はdomain stateを決めず、K1/K2のclassや鍵意味を変更しない。

#### 6.2.1 型と符号化

```text
Store = repository | stage | instance
LogDecl = { log_id, owner, store, operations, value_encodings, event_types, manifest_writer }
SegmentId = { log_id, writer, segment_no } # segmentごとにwriterは一つ
FixedRef = { store, locator, digest }
RepositoryLocator = { revision: GitRevision, path }
LogEntry = { schema_version, segment, seq, prev_digest, event, entry_digest }
SegmentHead = { segment, seq, entry_digest }
ScopeDecl = { scope_id, revision, log_id, manifest_head: SegmentHead, segments: SegmentId[] }
Projector = { identity, version, digest }
Projection = { projector, scope, input_heads: SegmentHead[], output, output_digest }
Checkpoint = { projector, scope, input_heads, state, state_digest }
Event = ResultRecorded | ResultConflictDetected | Correction | SegmentOpened | DeclaredEvent
ResultRecorded = { key: ResultKey, key_digest, result: ResultBody, result_digest, producer }
ResultConflictDetected = { key_digest, result_digests[] }
Correction = { target: entry_digest, reason, replacement: DeclaredEvent? }
SegmentOpened = { segment } # manifest segmentのみ
DeclaredEvent = { event_type, refs } # LogDeclで宣言されたevent typeのみ
```

`seq`はsegmentごとに1から始まり、最初の`prev_digest`は`genesis`、以後は直前のentry digest。`entry_digest`はL4 §9.3所定の`canonical_json({schema_version, segment, seq, prev_digest, event})` digestである。1行はcanonical JSONにLFを一つ付けたbytesである。`ResultRecorded`の結果本体はK1のclass別fieldを持ち、値/evidenceはLogDeclで許された`Inline`または宣言store内の`FixedRef`で表す。`result_digest`はFixedRefの参照値自体を含む`ResultBody`のcanonical bytesから求める。FixedRefの実体が読めない、またはSHA-256が一致しない記録は`Unknown(unreadable)`で復元し、元のValue classへ戻さない。

各logは一つのmanifest segmentを持ち、`manifest_writer`だけがmanifestへ`SegmentOpened`を追記する。manifest prefixはその時点で開かれたsegment集合である。`ScopeDecl.segments`はそのmanifest prefixの部分集合を宣言し、scopeの所有者が宣言する。全log scopeではmanifest上の全segmentを列挙する。scope/manifestとsegmentsの物理path・encodingはrepository-layout L4 §2/§6の唯一の定義に従う。

#### 6.2.2 公開関数とprivate helper

| 関数 | 署名 / 返却 | 責務 |
|---|---|---|
| `append(segment, event, writer)` | `Appended(SegmentHead) \| NoOp \| Conflict \| Rejected(reason)` | writer/segment/log宣言を照合し、manifest登録済みsegmentの末尾にだけ追記する。event種別ごとのkey/digest/encoding/target/owner制約を満たさなければ記録bytesを変えない。ResultRecordedは全manifest segmentの重複照合後にだけ追記する。K7のcurrent assignment/run・fencing・revocationの非肯定を迂回しない。 |
| `current_head(segment)` | `Observed<SegmentHead>` | segment全体を損傷なく検査して取得する現在末尾。project/verifyへ暗黙に渡さない。 |
| `read(segment, head)` | `Observed<LogEntry[]>` | 指定headまでの固定prefixだけをraw bytesから復元し、完全なseq/hash chain/canonical bytesを検査する。 |
| `restore(log, scope, input_heads)` | `Observed<ResultRecord[]>` | manifestとscopeの全segment head/prefixを検査し、全量を復元してからFixedRefを解決する。非Valueなら部分recordsをlookupへ渡さない。 |
| `project(projector, scope, input_heads)` | `Observed<Projection>` | 固定prefixのeventを決定的に畳み、K2 keyとoutput digestを伴う派生projectionを返す。 |
| `verify(projection, checkpoint?)` | `Observed<Projection>` | 保存output/digest、全量再構築、任意checkpointの延長・state digestを照合する。不一致はUnknown(conflict)。 |
| `ledger_view(input_heads)` | `Observed<LedgerView>` | §15.4台帳の登録事実/FixedRef、ReleaseLog成立、PointerLog target/immediate/recovery、RuntimeLog actualを別fieldで投影する。K5の独立APIや書込み経路ではない。 |

private pure helper候補は`decode_canonical_line`, `validate_entry_schema`, `validate_segment_prefix`, `validate_manifest_prefix`, `validate_scope_heads`, `resolve_fixed_ref`, `validate_event_for_log`, `validate_result_key_and_body`, `order_segment_heads`, `resolve_correction_tree`, `build_projection_key`, `fold_events`, `verify_checkpoint_extension`。store resolverとappend adapterは純粋な検証・fold関数から分ける。これらの名前はL5/L6設計上の候補で、実装済み関数や新APIを意味しない。

`append`の共通前提はwriterが`segment.writer`に一致し、segmentがmanifestに列挙されていること。種別別に、ResultRecordedはK1/K2 key/digest/class・LogDecl operation・Inline許可を検査、ResultConflictDetectedは同じkeyの記録済み結果digestを2つ以上参照、Correctionは同じlogのDeclaredEventまたはそれを根とするCorrectionを対象、SegmentOpenedはmanifest segmentかつmanifest_writer、DeclaredEventはLogDecl.event_typesの宣言済みeventだけを受け入れる。`Stale`を保存せず、K1/K2の既存拒否・結果型を追加しない。

#### 6.2.3 不変条件の分解

| L4 invariant | L5詳細の検査・処理 | 対応L9 oracle |
|---|---|---|
| K5-I1 追記専用 | appendは末尾追加だけ。read時に既存bytesの改変・欠落・並替えを成功扱いしない。 | IV-K5-01 |
| K5-I2 連鎖 | seqが1から連続、prev_digestが直前entry digest、entry digest再計算一致、schema既知。 | IV-K5-02–08 |
| K5-I3 損傷検出 | parse不能(a)、unknown schema(b)、seq欠落(c)/重複(d)、prev不一致(e)、entry digest違い(f)、指定head欠落/不一致(g)、raw bytes≠canonical JSON+LF(h)を独立検査し、条件をevidenceへ残す。どれかで該当segment全体を`Unknown(unreadable)`。正常prefix部分だけを成功扱いしない。 | IV-K5-02–08、IV-K5-24–26 |
| K5-I4 固定prefix | project/verify/checkpoint/read/restoreは渡されたheadまでだけ読む。current head取得は別呼出しで、保存済みinput_headsを置換しない。 | IV-K5-09 |
| K5-I5 冪等追記 | ResultRecorded前にmanifestが列挙する全segmentを読む。同key_digest+同result_digestはNoOp、同key_digest+異result_digestは両RecordとConflict eventを追記しConflict、peer一つでも読めないなら`Rejected(peer_unreadable)`で0 write。 | IV-K5-10 |
| K5-I6 一操作一log | ResultKey.operationに対応するLogDecl.operationsの登録先log一つだけへ記録する。 | IV-K5-11（別log） |
| K5-I7 順序 | `(writerのNFC UTF-8 bytes, segment_noの数値, seqの数値)`で追記順を定める。時間・読込順を因果順として推測しない。 | IV-K5-16 |
| K5-I8 訂正 | DeclaredEventをrootとするtreeを作る。一本鎖の末端replacementを採り、replacement無しは撤回として集計除外、branchは`Unknown(conflict)`。結果/SegmentOpenedは訂正対象にしない。 | IV-K5-11、IV-K5-13 |
| K5-I9 projection非正本 | project output/checkpointからevent/recordを作らず、projectionをappendしない。 | IV-K5-14 |
| K5-I10 決定的再構築 | 同projector/scope/headsならevent/segmentの入力順の違いを正規化し、output digestが一致するfoldだけを返す。 | IV-K5-15 |
| K5-I11 全量の前提 | manifest_headまでの健全manifest、scope全segmentのhead、各prefixの健全readが揃って初めてValue。欠落/空scopeはUnknown(missing_input)、損傷/読取不能はUnknown(unreadable)。partial restoreをK2 lookupへ渡さない。0件は指定scopeについてだけの結論。 | IV-K5-17、IV-K5-21 |
| K5-I12 projection key | L4 §9.4 K5-I12どおり、operation=projector.identity、operation_version=projector.version、subject={kind:projector, identity, revision:version, digest}、inputs=manifestと各SegmentHead（log_segment identity/seq decimal revision/entry_digest）、scope=(scope_id, revision)をResultKeyへ束縛する。追記は旧ValueをStale、projector version変更はUnobserved(not_run)、同版digest変更はUnknown(conflict)。 | IV-K5-18 |
| K5-I13 checkpoint | 同scope、旧headの前方延長、anchor entry digest一致、state digest一致、差分fold＝full rebuildがすべて成立したcheckpointだけ使う。その他はcheckpointを無視しUnknown(conflict)。 | IV-K5-19、IV-K5-20 |

#### 6.2.4 台帳・assignment/runとの接続

`model-number-ledger`はrepository K5 logでmanifest_writer=OS。`ModelNumberDeclared`/`VersionRegistered`はregistration事実とdeclaration FixedRef/digestを記録し、view項目を編集可能な重複値として保存しない。unit/connectionの宣言行はHARNESS所有segment、composite行はOS所有segmentへ追記する。`ledger_view`は固定declaration bytesを実読・digest照合した後だけ既存L2項目を導く。release/current target/actualはそれぞれReleaseLog/PointerLog/RuntimeLogから別fieldに保つ。path/folderの存在からidentityやregistrationを生成しない。

segment writerはK5 §9.8のassignment/run単位である。K3のcurrent authority checkと、K7のEpochTokenを含む既存`admit_effect`でtoken scope/number/entry digest、revocation propagation、replacement authorizationをそれぞれ既存順に照合する。取消し・失効したold runの書込みを止め、past segmentはread-only historyとして残す。正常終了という名前だけからrevoke/EpochIssuedを作らず、遅着観測をcurrent writerがLateObservationとして元episodeへ結ぶ。L5はK7 writer/authority implementationを再定義せず、K5 appendがそのfenceを迂回しない接続を定める。

#### 6.2.5 初回manifestと初回assignment/runの未定義境界

既存L4は、manifest segmentに`SegmentOpened`を記録し、そのmanifest prefixにsegmentが登録された後に当該writerが追記する通常順序を定める。appendは未登録segmentを拒否し、manifestが未読なら開始しない。対のIV-K5-22も初期化済みmanifest/assignmentを入力にした通常開設を検証し、path名からregistrationを作らない。

ただし初回manifestでは、それを列挙するmanifestがまだ無いため、`SegmentOpened`自身を登録済みmanifest segmentへappendする通常条件が循環する。L4 §9/§15.4–15.6、repository-layout RL-C/P、L9 IV-K5-22/IV-LDG-01/02/04にgenesis create API、初回manifestをinstallする手順、または最初のOS assignment/runをそのwriterへ結ぶ順序は定義されていない。現行通常APIの前提を緩める登録例外、新しい権限・writer role、bootstrap専用承認gateは作らない。

従って本L5は、初回manifest/初回assignmentの実現済み手順やpassを主張しない。L6では既存のowner/event/current assignment/run契約の範囲内でgenesis手順を詳細化できるかを調べるが、既存APIから定義できない部分を実在する契約として補わない。追加のK5受け口・登録例外が必要と分かった場合は、その箇所だけL4設計へ返す。これは初回physical bootstrap境界の未確定であり、K1/K2 pure設計や既に初期化済みlogのK5読取り/record/projectを停止しない。新しい`Rejected(reason)`やUnknown reasonを定義しない。

#### 6.2.6 旧HELIX source・failure・consumer

K5旧source・asset ID・inventory row・source行・full SHA-256および保持/変更理由は§2の共通旧source表を正本とする（K5関連はLEGACY-ASSET-BB08D70A42B6445B2D1E、C35E93F2D36777CD7462、8771887517A619A2D501、9EDE8332CF4F627105EA、F6E9EA3422A0EF1DF090、F677F6D81EB9FCAE2E3F、6929C09B95A444D95B49、67B016392E3F7D58B053、310E87378AFE8095809C、0327D0DF98618D3066FD、656F75AF81EE933415D9、B6DC14C1DA937E3AC96C、719D5EC9C06FC4AAD0FF、BC2275DCE9BFFCF813C8、1B413588CFF3B1360B49、D461943347D372ECF6DA）。この§は、event/projection/checkpointの保持点とK5の変更境界だけを要約し、別のsource inventoryやasset tableを重複定義しない。旧CLI/runtime/testを実行せず、旧SQLiteや旧schemaをコピーしない。

K5旧sourceが述べるevent/projection/checkpoint境界は保持し、DB authoring authority、手書きmarker、aggregate一つのsequence、DB transactionは置換する。writer別segmentとtime-independent orderingは現L4で新たに定義されたため、旧sourceの一致再利用とは主張しない。
#### 6.2.7 検証範囲・保証限界

L5/L8で個別fixture設計へ展開するのはIV-K5-01–26である。IV-K7-07–10/11–15、IV-LDG-01/02/04、repository-layout L9 IV-RL-24–32は接続先として参照するだけで、本書のfixture suiteへ展開・実行しない。これらの設計は登録後のrecord semantics、通常writer authority/fence、物理配置/compare-and-appendの責務を結ぶ。bootstrap genesisが実在することは示さない。既知SegmentHeadまたは外部anchorが無い読み手はtail deletionを検出できない。保持期間・外部archiveは追加しない。10k/100k行はL4 §9.8の計測案で、acceptance thresholdや実測性能ではない。


### 6.3 今回の対象外

K7/K9/K10は本対で`not_designed`であり、既存のCommon Kernel L4各契約節とPair L9の対応oracleへ戻す。K1/K2/K3/K4/K5/K6/G3の設計は実装、実行、物理writer enforcement、approval/gateを意味しない。L3 semanticsの変更が必要な点は本書で解決せず、要求上流へ返す。

## 7. Unit配置・宣言・型番登録

### 7.1 宣言候補と依存境界

| 既存宣言項目 | K1/K2 semantic core候補 | 根拠・境界 |
|---|---|---|
| identity / version / maturity | `common-kernel` / `0.1.0` / `development` | 値は設計候補。pack versionは製品版・release versionではない。 |
| owner種別 / identity | `core` / `HELIX-HARNESS-CORE` | 共通カーネルを所有するHARNESS coreを一つのownerとして表す。 |
| input / output contract | K1 `Observed<T>`/`Combined<T>`/`Admitted`または`Withheld`、K2 `SubjectRef`/`ResultKey`/`KeyOfResult`/lookup・record結果。operationの入力は各API signatureとL6関数表を参照 | 契約本文はdocsに置き、declarationはidentity+digestで参照する。 |
| dependency type / identity / version | 外部実行接続 / `CPython` / 互換範囲候補`>=3.11`。標準ライブラリの`json`, `hashlib`, `dataclasses`, `enum`, `typing`, `unittest`はこのruntime候補に含め、個別依存にはしない。 | HARNESS-L2-010とAC-HARNESS-L3-010-01が既に持つ「外部実行接続」の依存欄へ置く技術候補。HELIX pack依存は空集合で、dependency kindやfieldを増やさない。 |
| verification scope / oracle | K1/K2のL6全14関数、L7の個別UT/suffix展開/vector、L8 fixture、L9 IV-K1/IV-K2。 | L7の設計IDと本文をdeclarationへ複製しない。 |
| inclusion / exclusion | 内容範囲候補はこのunit内のK1/K2 semantic suiteである。K3/K4/K5/G3は同じ共通カーネルのL5/L8詳細設計対象だが、このunit配置候補のsuite範囲へはまだ含めない。K6〜K10と他機構の業務値型・reader/writerも含めない。 | これはunit内の機能範囲である。L3の収載/非収載欄はrelease-unit identity/versionごとの値であり、既存release-unit declarationから完全な候補集合を取得・照合するまで未確定とする。製品releaseへの収載を共通利用やpathから推定しない。 |

宣言の具体的JSON field名と正規化規則はrepository-layout RL-C2および既存L3 declaration contractに従う。本表は既存項目への候補であり、別schemaを定義しない。HARNESS-L2-010とAC-HARNESS-L3-010-01は依存種別に外部実行接続を明記し、L6はCPython 3.11+をruntime/toolchain候補にしているため、これを既存欄の外部実行接続として表すのは意味変更ではなく値の具体化である。標準ライブラリのmodule名は独立依存として重ねない。`CPython`と互換範囲`>=3.11`はあくまで設計候補であり、実在する接続・登録済みruntime・実行環境を証明しない。宣言の固定時には既存依存欄へこの候補を明記し、実行側が宣言された範囲を満たすかを別途照合する。

### 7.2 pack内容とsuite配置

| 配置 | 役割 |
|---|---|
| `helix/helix-harness/units/common-kernel/declaration.json` | 上表の唯一のunit宣言正本。 |
| `helix/helix-harness/units/common-kernel/src/` | K1/K2 pure semantic core。K5 filesystem/ledger writer、K6 source reader、各owner resolverを含めない。 |
| `helix/helix-harness/units/common-kernel/tests/` | L7 IDを持つK1/K2 unit tests。`test_k1.py`と`test_k2.py`は配置候補で、IDを個別test名へ対応させる。 |
| `helix/helix-harness/units/common-kernel/fixtures/` | L7に記す合成入力・期待値のみ。実案件データ、実ledger、実環境状態を置かない。 |

検証設計の本文は`docs/helix-harness/L7-unit-test-design/common-kernel-unit-test-design.md`にのみ置き、testsはdesign IDを参照する（RL-T1–3）。L5–L7の本文は実装・suite実在・実行passを主張しない。unit testsはK1/K2意味コアの範囲に限り、packの登録成立やK5 physical writerの証明とは区別する。

### 7.3 型番台帳への登録手順とbootstrap境界

登録対象の宣言bytesを先にpackの`declaration.json`へ固定し、そのbytesのSHA-256を計算する。次に既存K5 `model-number-ledger` の`LogDecl`・manifest・segment契約に従って、OSのmanifest writerがHARNESS owner segmentを`SegmentOpened`で登録した後、HARNESSのunit-owner segmentが`ModelNumberDeclared{kind:unit, identity:common-kernel, owner:HELIX-HARNESS-CORE}`と`VersionRegistered{identity, version, declaration:FixedRef, declaration_digest}`を追記する。`VersionRegistered.declaration`は宣言bytesを含む先行Git revisionと`declaration.json` pathへ固定し、event内へ宣言項目を複製しない。したがって宣言を含むGit commitを先に確定し、そのcommitをFixedRef revisionとしてから、台帳eventを後続commitへ記録する。宣言pathやfolderの存在だけでは登録済みにしない。`ledger_view`は登録行、FixedRefの実bytes、宣言digestと現在の評価revisionにおける宣言一致を確かめてからpackを利用可能とする（RL-C3–5、IV-LDG-01/02/04）。

ただし、空のrepository storeで`LogDecl`を初めて固定し、manifest segment自身の最初の`SegmentOpened`をどう生成するかという初期bootstrap手順は、現K5 §9.3の既存append規則・IV-K5-22の既開設segment条件に定義がない。manifestがないと追記不可である一方、manifest初回生成の既存writer操作も記されていないため、AIが通常のappendだけで「初回登録eventを観測済み」とは宣言できない。ここは初回の物理bootstrapを局所保留とし、K1/K2の型・関数・fixture設計や既存event後の登録照合を止めない。新writer権限、bootstrap例外、承認gateは作らず、bootstrap出力は未観測として扱い、既存readerが実際に返した値型だけを保つ。実装前に現K5契約内の既存初期化経路を照合する。

## 8. K4/G3 義務評価API

この節はL4 §13.2–13.5の型、不変条件、6 APIを実装境界として対応づける。義務導出のbranch/template選択や義務内容の意味を新しく決めない。HARNESS AC-HARNESS-L3-014/041に由来する操作別ownerの導出規則・source atom選択が未実装の間、`derive`はそのownerが固定した`sources`と`rule`を受ける境界までを定義し、推測による義務補完をしない。

### 8.1 旧sourceと保持・変更

旧sourceとasset ID、対象行、bytes SHA-256はL4 §13.6を正本とする。以下の読取でsha256と資産明細台帳を照合し、asset ledgerの`consumer_refs`が空であることを確認した。旧規則や旧実装の実行・コピーは行わない。

| 旧source | 保持する点 | K4/G3での再導出または変更 | 区分候補（L4 §13.6） |
|---|---|---|---|
| `LEGACY-ASSET-FEB591CA3369A4AF7729` `descent-obligation.md:20–24,66–69`, SHA-256 `8f6a5104bdb15790cd282414ef0e2b24976787097bce0245b5cff02ac3aaf984` | 上流から在るべき下流を作り、不在を見逃さない。義務のsatisfied/deferred/unmetを分ける | K1 result class、granularity、oracle種別、revisionをL4の明示型へ置く。deferの待ち先を期限付きgateに広げない。 | `semantic_rederive` |
| `LEGACY-ASSET-E7AB06BE3282A7D4CBDA` `ci-deferred-obligation-recovery.md:17–35`, SHA-256 `077592139976a41d786141018c116e2c09393e41c8132adf0a259b86443083a9` | deferred義務を一つの回収先へつなぎ、missing/duplicate/cancelled/staleをsuccessで相殺しない | obligationのidentity継承とHandoffへ再導出する。旧CIの期限、scheduler、main/nightly/release targetを新規条件として持ち込まない（L4 §13.7/G11）。 | `semantic_rederive` |
| `LEGACY-ASSET-E9998EF887555DBB2751` `ci-verification-plan.md:20–35`, SHA-256 `21e0b8a05b965d6c1ad27c55bf28ff2d711daa4112c96589da63075b02fc5841` | required obligation集合の一件欠落で拒否し、pendingを追跡する | 集合を呼出し側の任意リストにせず、K5 restoreした`ObligationSet`を唯一の集合とする。 | `semantic_rederive` |
| `LEGACY-ASSET-C35E93F2D36777CD7462` `infinity-loop-platform-basic-design.md:351,383`, SHA-256 `2a757a52082f823c4e52ae1e04887b62b8ac5f5df0d833d2b1c00516d6572357` | Required/NotApplicable/Deferredを明示し、N/Aに根拠・actor・再入を求める | `NotApplicable`の3根拠はK1-I5へ、`Deferred`は`Unobserved(pending_receipt)`へ対応し、後者を除外しない。 | `semantic_rederive` |
| `LEGACY-ASSET-BC214D81DE9E77B8A804` `audit-report.md.txt:72–80` (F02), SHA-256 `dcf0d4e0dcc4db772afac465df10f2412134cd65dcd019a18cb99c9fd39be53f` | required setを空にして個別検査を消した実失敗 | K4-I1のempty-set `set_reason=Unknown(missing_input)`へ再導出する。 | 失敗史（区分なし） |
| `LEGACY-ASSET-3B16BCFFAF353ADA813A` `helix-charter_v0.1.md:39`, SHA-256 `8eff96bf58e6bb2cca247acef18c4f6cf07e304f3f23fb4179ddd8e5b19b23d8`; `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `pillar-functional-requirements.md:152`, SHA-256 `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | deterministic gateとAI判断を区別し、coverageだけで完了にしない | oracle種別を義務のfieldへ具体化し、coverage数からacceptanceを出さない。 | `semantic_rederive` |
| `LEGACY-ASSET-D68CEADABCBECF13EFCB` `judgment-core.md:70–73`, SHA-256 `e0c0fc7c3c813ba59e434ea19dad3f54e90f2b7bd8e1b5151c572a06b3d3c1e8` | lint/testで機械的条件を判定し、LLMへ強制規則を代替させない | G3-I2を維持する。 | `semantic_rederive` |
| `LEGACY-ASSET-98372FEE8A3AC8F9C299` `design-template-json-authority.md:74`, SHA-256 `3015d4f3d65cd1f8205f88f29dd59c4f1f7ef42c729d8144f2319e49fe20d830` | verification欄にrequired oracle classを持たせる | `Mechanical/LlmJudgment/HumanInterface`の値域と既存記録からのHumanDecision projectionはL4の新規案として明示し、承認済みschemaや既存実装と呼ばない。 | `semantic_rederive` |

この対は旧の意図をそのまま採用せず、L4が既に定めたK1 class、K2 key、K5 append-only、K6 receiptの境界へ意味を再導出する。F02の空集合失敗は故障根拠であり、旧CI passやruntimeは根拠にしない。

### 8.2 型と鍵

`OracleKind`、`OracleRef`、`Disposition`、`Obligation`、`DerivationRule`、`ObligationSet`、`OperationDecl`、`HumanDecision`、`ObligationView`、`Handoff`はL4 §13.2の型をそのまま使う。ここで新しいdomain field、ID生成規則、oracle種別、status語彙を足さない。`ObligationSet`のK2 keyは`operation=derive_obligations`、`operation_version=rule.version`、`subject=target`、`inputs=derived_fromの全集合+derivation_rule ref`、`scope=呼出しscope`とし、K2 `key_of`の既存規則で正規化する。rule version更新は`Unobserved(not_run)`、同版のdigest差は`Unknown(conflict)`、source identity集合変更は`Unobserved(not_run)`、同identityのsource revision更新は旧result classに応じL4 K2-I2の`Stale`または`Unobserved(not_run,superseded)`へ従う。

検証対象operationの基底keyはownerのcurrent `OperationDecl`だけから `{operation, operation_version=decl.version, subject=obligation.target, inputs=decl.inputs, scope=decl.scope}` として作る。receiptからinputs・scope・versionを逆算しない。義務・K6 receipt・K5 `ResultRecorded`は既存`FixedRef`/K2記録を使い、K4専用record型を追加しない。`obligation_id`はL4のsource.identity/target.identity/granularity/pair/operation由来で、revisionは含めない。

`HumanDecision`はL4 G3-I4の既存authority sourceを読む`oracle.human.adapter`由来に限る。呼出し側がHumanDecisionやaccepted/rejectedを`evaluate`へ渡す新入力を作らない。K4-I4が`VerifierSet.required_for[o]`の一致対象を`Mechanical`/`LlmJudgment`に限る一方、G3-I4が`HumanInterface`のadapterを決定的検証器と呼ぶ接合について、L4にはそのadapterとK6 receipt/required_forとの読取経路の明記がない。本候補ではその経路を新設せず、L4の既存記述だけでは呼出し可能性を確定できない局所未決として保持する。 G3-I4の既存adapter/sourceがcurrent owner境界として特定できるfixtureだけを条件付きで実施可能とする。adapter/sourceの結合が未確定なら、そのfixtureは未実施のままにし、adapter不在を`HumanDecision`不在（L4 G3-I4(1)）へ読み替えず、K4/G3の他のAPI経路は続ける。これは新しい人間gateではなく、既存source接合が未定義である範囲の非肯定である。

### 8.3 既存6 APIの詳細契約

公開API名・引数・返却型はL4 §13.5と同一にする。下表はそれらの既存契約内の接続だけを具体化し、新API、入力引数、権限を追加しない。

| API | 契約と境界 |
|---|---|
| `derive(sources, rule, target, scope) -> ResultRecorded | Rejected(reason)` | 義務配列をcallerから受け取らず、sourceと固定ruleからの導出だけを行う。source atomの選択・granularity/pair/operation割当は該当HARNESS L3 owner ruleが確定した範囲に限る。生成された`ObligationSet`はL4の`derive_obligations` K2 keyで一件の既存K5 `ResultRecorded`へ対応づける。由来L3が人の記録を求めないのに`HumanInterface`が導出されたらL4どおり`Rejected`。不足sourceから値や義務を推測しない。 |
| `evaluate(set_key, decls: {operation -> OperationDecl}, verifier_set, input_heads) -> Observed<ObligationView>` | `input_heads`で指定されたK5固定prefixを`restore`し、完全性が`Value`の場合だけK2 `lookup`でObligationSetを解決する。非Valueならそのまま返す。`decls`は各operation ownerが宣言したcurrent値でありreceiptから作らない。`required_for[o]`とK4-I4のRequired Mechanical/LlmJudgment verifier集合を照合し、該当義務ごとにL4のbase keyを作ってK6 `required`相当のreceipt lookup/admissionを行い、結果のinner componentsとassuranceを保存する。K4-I4の集合不一致は該当成分`Unknown(conflict)`、`decls`に義務operationが無い場合は該当成分`Unknown(missing_input)`とする。G3-I4のHumanInterface adapter/sourceからK6 required_for・receiptへ至る接合はL4で未指定のため、本候補はその経路を定義せず、callerからreceiptやadmitted resultを注入しない。 |
| `check_view(view, set_key) -> Observed<ObligationView>` | consumer側で保存viewとObligationSetを照合し、setの全obligation_idが成分にあり、未知IDの成分がないことをK4-I1どおり確認する。欠落はそのIDの`Unknown(missing_input)`、余分は`Unknown(unregistered)`。空setは既存K1-I4のwhole-set `set_reason`とし、IDを捏造しない。 |
| `reverify_view(view, targets: {(obligation_id, verifier)}?) -> Observed<ObligationView>` | 指定された`(obligation_id, verifier)`だけを既に受理したK6 receiptへ接続し、K6 `reverify`の返却をassurance.reproductionへ反映する。未指定targetを再検証した扱いにしない。deterministic receiptは実施前`Unobserved(not_run)`、一致`Value`、不一致`Unknown(conflict)`。非deterministicは`Unknown(unsupported)`を維持する。issuer authenticityはL4 K6の`Unknown(unsupported)`を保持する。 |
| `inherit(old_view, new_set_key, decls, verifier_set, input_heads) -> Observed<{view: ObligationView, handoff: Handoff}>` | new setをK5 fixed prefix/K2 lookupで解決し、新revisionの義務を新current OperationDeclとreceiptから評価する。旧Positiveを新revisionへ持ち越さない。旧viewで非PositiveのIDは、新setに無いものも含め`inherited`へ記録し、全未完IDをHandoffへ対応させる。 |
| `receive(handoff, from_view) -> Observed<Handoff>` | `from_view`全体から旧Positive以外の義務集合と各recordを再計算し、Handoff.unfinishedの全ID集合、inheritedのkey_digest/result_digestを照合する。欠落は`Unknown(missing_input)`、余分は`Unknown(unregistered)`、異なる記録は`Unknown(conflict)`。Handoffの自己申告を真値として採用しない。 |

L9 IV-G3-04(9)後半とIV-G3-05はconsumer経路が`Rejected`となる期待を記すが、L4 §13.5の6 API/返却型にはconsumer projection APIやその`Rejected`経路がない。L5は既存API/型を維持し、新API・新reasonを補わない。L8で該当出力経路の構造を照合しても、L9の`Rejected` oracleを満たしたことにはしない。このL4/L9接続の不一致はL9/L4 ownerへ返す項目として保持する。

全APIで`NotApplicable`はreason/authority/reentry_trigger全fieldがある時だけ除外できる。`Deferred`はtarget_point/owner/discharge_conditionの三fieldがある時だけ`Unobserved(pending_receipt)`となり、合成から除外しない。無効なfield欠落はL4 K4-I3の`Unknown(invalid_disposition)`成分である。`Unknown`、`Unobserved`、`Stale`、negativeは成分ごとにK1 `combine`へ渡し、非肯定を省略しない。coverage件数は情報に留める。

### 8.4 実装候補と限界

既存K1/K2 L5 §5のCPython 3.11+標準library候補を、K4の型付きview、決定的ID集合比較、状態variantへの適用にも使える候補として維持する。K4はK5 restoreとK6 receipt境界を使うため、pure coreだけの実装だとは主張しない。K5 segment reader、K6 verifier execution、HARNESS 014/041 owner ruleの存在・登録・実装をこの言語選択から導かない。既存L4のauthority source、K6/K5 entrypoint、各ownerが未確定の箇所は未決のまま保つ。

## K4/G3 API 範囲終端

この見出しは、manifestが定めるK4/G3 API抽出範囲の終端であり、K4/G3契約項目はここより前に置く。

## 9. K6 検証receiptとissuer authenticity

本節はCommon Kernel L4 §10とL9 IV-K6-01〜15をL5の既存型・API境界へ詳細化する。直接親はL4 §10.2のcrosswalkに記されたACだけであり、K6自体から追加親や単一の新しいgateを作らない。receiptは検証結果の証拠であり、K6は承認、merge、受入、要求意味、工程完了を作らない。K3 permission/authorityの発行や照合を新設しない。実装・実行・物理writer enforcementは定義しない。

### 9.1 旧source・台帳・consumer・failureとの対応

asset IDは`docs/governance/legacy-asset-disposition.jsonl`の該当行。以下の旧sourceはarchive root相対pathで読み、全体SHA-256を台帳値および前段の調査値と照合した。全行で`consumer_refs`は空のため、consumer/failureはsource本文の参照記載から確かめた。旧test/runtime/CLI/CIは起動しない。

| 旧asset / source path:行 / 全文SHA-256 | ledger row・consumer/failureの根拠 | 保持・再導出・置換 |
|---|---|---|
| `LEGACY-ASSET-8E9E06111D6FE1538308` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/work-graph-receipt-acceptance.md:17–35` — `db4eb979037a611e51edaab22fe31f774fd7038d7ffb72bcf26ece6fb9de8b42` | row 528、Historical、consumer_refs空。旧WorkGraphはdelegation→review→terminal→acceptanceをsame HEAD/orderedに束縛し、future receiptとworker self-acceptanceを拒否する。 | 同一対象版と先書き拒否の観点をK2 keyとreceiptへ再導出。三段workflowと独立receipt engine/ledgerはK9/OSの責務でありK6に追加しない。 |
| `LEGACY-ASSET-A4EAB5E3345E3C125C77` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/worker-lifecycle-receipt.md:16–31` — `d39b3cdc2e7d9f72ad03d0d3db5571a6b0de579fadf0b147b8a6d4f90dc2ed2c` | row 535、Historical、consumer_refs空。旧isolation broker/lifecycle projectorがspawn由来receiptとhash-chain eventを作り、copy/unsealed receiptを拒否する。 | execution由来fieldをcallerから注入させない点をK6-I1へ再導出。event chainはK5 segmentへ置き、K6 receiptに旧lifecycleやwriterを複製しない。 |
| `LEGACY-ASSET-78704C8347EBDD58FC52` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/gate-evidence-substance.md:15–47` — `6f4a3cdbf5e66071525e6d4b76df2a8c9bedea355338321c5ea597cc1dd73ba6` | row 657、Historical、consumer_refs空。Issue #1430 G8/G9/G10 consumer。failure:保存済み5 command中4件digest不一致、全5件test sourceを実行出力として参照し、digest一致の1件も実行証明でなかった。 | digestをmanifest申告として信じず実読bytesで再計算する点をK6-I4/I5へ再導出。gate固有readerやruntime証明を一般化せず、digest一致はbytes一致に限る。 |
| `LEGACY-ASSET-901EFEC93D536D3AA418` — `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/closure-evidence-materialization.md:13–15,56–76` — `a8951a0cdd590da84612de8c6b6e5960ca5c32ad3b3d0c0d0511b9f5789c0264` | row 373、Historical、consumer_refs空。closure auto-approve consumerはprocess実行からreceiptを内部生成する一方、SQLite/JSONL/filesystem間のatomicityを主張せずrecoveryを扱う。 | caller自己申告を受けない点をI1へ再導出。L5の旧source読取範囲はL4に記した`13–15,56,67–76`から`56–76`へ広げた。process receiptの生成主体に加え、保存/recoveryの非原子境界とconsumer影響を同じmaterialization資料内で確認するためであり、L4本文のscopeは変更しない。GitHub required-check trust rootを現L4のrepository固定VerifierSetへ置換する判断はL4 §5/10.2に既に記録済み。K6にstorage transactionを追加しない。 |
| `LEGACY-ASSET-C4B746501A6562E3F8B4` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md:53` (UTH-FR-022) — `c0978eae37f6c7c8e113191404c0fd76328818e438b0ea5b3cf98ebd489a6639` | row 473、Historical、consumer_refs空。completion/review/green evidenceはcommand/argv/scope/HEAD/exit/time/artifact/runnerを束縛しproseやtimestamp単独を拒否する。 | 現L4のbase/receipt key、execution、outputsへ要素を分けて再導出。old schemaをcopyしない。 |
| `LEGACY-ASSET-0327D0DF98618D3066FD` — `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:60–70` — `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` | row 412、Historical、consumer_refs空。旧source-boundaryはtrusted issuer署名、exact scope/revocation、pre/during/post reobservation、dispatch後driftをuncertainとして保持する。 | read-only verificationとaction effectの分離を保持する。L5の旧source読取範囲はL4に記した`65–66`から`60–70`へ広げた。scope/source境界に加えpre/during/post reobservationとdispatch後driftを確認するためであり、L4本文のscopeは変更しない。旧署名・旧policy schemaは移さない。署名/外部固定が無い現K6は`issuer_authenticity=Unknown(unsupported)`であり、reproductionへ真正性を代替させない。署名付きauthorizationをK6へ移さない。 |
| `LEGACY-ASSET-D107FD145A2588FAAD09` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/worker-independent-review.md:20` — `9fff293ed71c7a0be0e4dfcd7a5cca70eaacfdbf2cd553a605fd15510a3c99b3` | row 532、Historical、consumer_refs空。actorは実行側から導き、receiptのactor自己申告を受けない。 | 実行側がfieldを生成する根拠としてI1へ再導出。K6はactor authorityやreviewer identityを新設しない。 |
| `LEGACY-ASSET-6CC1A5B9E9472F1100AF` — `archive/legacy-generation-2026-09-14/root/src/doctor/check-registry.ts:20–40` — `07e52e804cb83b74ec3026a25baca593e35f8f2107c581adc8afdf6a93fbb581` | row 2917、Historical、consumer_refs空。consumerは旧doctorのregistered hard checksとevaluated/failing checksを別に数える。 | 件数比較を検査IDごとの成分と未評価`Unobserved(not_run)`へ再導出する。sourceは参照のみ、実行しない。 |
| `LEGACY-ASSET-ED86DAA9D6A1511A591C` — `archive/legacy-generation-2026-09-14/root/src/lint/pin-chain-derivation.ts:6–10` — `5f81fa005896bd34f66538084eabdf627b1df9025285a020bae4c0976fcaaca6` | row 3021、Historical、consumer_refs空。旧lintはdeterministic pinとsemantic-review pinを別型にする。 | `VerifierEntry.deterministic`を再現可否の入力とする。L5の旧source読取範囲はL4に記した`6–7`から`6–10`へ広げた。semantic-review pinと区別される`PinChainFinding`型定義まで確認するためであり、L4本文のscopeは変更しない。旧lintを実行/移植せず、署名やsemantic approvalを追加しない。 |
| `LEGACY-ASSET-C0F9CE549442BA1D551E` — `archive/legacy-generation-2026-09-14/root/docs/plans/PLAN-L7-428-enforcement-wiring-gap.md:87–110` — `dd527d30dfb5a601008656d4d38c0cdefcf44aa9cbe277bccc5fad4b8c81751c` | row 1683、Historical、consumer_refs空。3判定moduleが実行経路に未接続でもunit testsとartifact-existence検査がgreenとなり、branch protection auto-merge判断を誤って支えたfailure。 | required verifierごとにreceiptを照合しreceipt存在だけで肯定しないI7のfailure起点。旧auto-merge policy/閾値は移植しない。 |
| `LEGACY-ASSET-B8D84651753481B5F2B9` — `archive/legacy-generation-2026-09-14/root/docs/governance/operations-rule-audit-2026-07-26.md:48` (ORA-015) — `d32bb1a780a36cd0710cbd58d575e900ac14c154a0e84f5dc92423b46c01466e` | row 996、Historical、consumer_refs空。freeze packetが全digest再計算を主張したが別HEADのdigestを載せた。 | current key/read集合と実読digestの照合へ再導出。snapshot bytesと別HEADを混ぜない。 |
| `LEGACY-ASSET-EC07511FF3E241F15359` — `archive/legacy-generation-2026-09-14/root/docs/design/design-catalog.yaml:838` — `4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864` | row 328、Historical、consumer_refs空。旧design catalogも署名・attestation/provenanceを未設計todoとしていた。 | 現K6の限界明示の比較根拠。署名やattestationを新規要求にしない。 |

これらは完全一致実装資産としてcopyせず、L4 §10が選んだ固定VerifierSetとK1/K2/K5の既存契約へ意味を再導出する。物理execution provenance/署名なしに保証できない過去実行・issuer authenticityは未保証のままとする。

### 9.2 型とowner境界

L4 §10.3のfieldとunionをそのまま使用し、新しい型fieldやreasonを増やさない。

```text
VerifierRef   = { identity, version, digest }               # codeと設定の全bytes
VerifierEntry = { ref: VerifierRef, deterministic: Bool, checks: { CheckId -> PolarityOfの識別と版 } }
VerifierSet   = { set_id, revision, members: VerifierEntry[], required_for: { operation -> identity[] } }
                # repository内の固定実体（9.3のFixedRef）として置き、digestで固定する
ReceiptBody   = { verifier: VerifierRef, verifier_set: SubjectRef, key: ResultKey,
                  read: { identity -> Digest },              # 検証器が実際に読んだbytesのdigest
                  execution: { argv_digest, exit, outputs: FixedRef[], started, completed },
                  registry: { registered: CheckId[], evaluated: CheckId[] },
                  inner: Combined,                           # 検査ごとの成分の合成（K1）
                  authority_effect: "none" }
AdmittedReceipt = { body: ReceiptBody, reverifiable: Bool,   # reverifiableは集合のdeterministicから導く
                    reproduction: Observed<...>,             # reverifyの結果。未実施はUnobserved(not_run)
                    issuer_authenticity: Unknown(unsupported) }  # 署名が無い間は常にこの値（L4 §10.5）
RequiredResult  = { combined: Combined, assurance: { identity -> AdmittedReceiptの真正性3項目 } }
```

VerifierSetはL4 §10.9/K4-I4の指定どおり`declarations/helix-harness/verifier-sets/`のrepository-owned FixedRef。`required_for`と各memberの`checks`/`deterministic`はK4 ownerの宣言値であり、K6、呼出し側、receiptの申告から作らない。API引数`verifier_set`はその現在のK4 FixedRefを指す参照であり、呼出し側が集合、member、`required_for`を差し替える権限を与えない。VerifierRef digestは検証器code/config全bytesのdigest。`ReceiptBody`のexecution/read/registry/innerは`run`した検証器の側で生成する。result、exit、output digest、read、registered/evaluated、inner、issuer authenticityを呼出し側が注入するAPIはない。

K6はK1 `Observed`/`Combined`/`PolarityOf`、K2 `ResultKey`/`key_of`/`lookup`/`record`、K5 `restore`/`append`を既存契約として利用する。K6はK3 authority/check APIを持たず、permissionや認可を生成しない。VerifierSetの正本はK4 owner、receipt logとFixedRefの保存・訂正禁止はK5、key照合はK2、component合成はK1に残る。

### 9.3 K6 APIと関数境界

公開signatureはL4 §10.6どおりで、private helperは責務分解のtrace名である。追加公開API・新reasonは作らない。

| 関数 / boundary | 入力→出力 | 詳細責務・失敗境界 | L4/L9 trace |
|---|---|---|---|
| `run(verifier, base_key)` | K4が現在選んだ検証器実行主体への参照とbase key → K5 `ResultRecorded` | L4の2引数signatureを維持する。`verifier`は呼出し側が任意に選ぶ実行/data sourceではなく、既存current VerifierSet member bindingが選択する実行主体参照として解釈する。receipt keyを§10.3から導き、登録済み検証器自身の実行から`ReceiptBody`を構成してK5 appendへ渡す。callerにexecution/output等を渡させない。具体的なprocess/issuer authenticity機構を定義しない。 | K6-I1; IV-K6-02 |
| `derive_receipt_key(base_key, verifier_ref, verifier_set_ref)` private | base key＋VerifierRef＋set ref → ResultKey | base keyのoperation_versionをverifier.versionにし、K2 inputsへverifierとverifier_setのrefsを追加する。各verifierで別鍵となる。このhelperは鍵だけを返す。IV-K6-01の`Value`/`Stale`/`Unknown`/`Unobserved` oracleはK5 `restore`→K2 `lookup`の返却を観測する。 | §10.3; IV-K6-01 |
| `admit_receipt(record, query_key, verifier_set)` | K5-restored record/query key/set → `Observed<AdmittedReceipt>` | K6-I2→I3→I4→I5→I6順に確認する。各拒否根拠をevidenceへ残す。全て通ればValueだがreproductionは`Unobserved(not_run)`、issuer_authenticityは常に`Unknown(unsupported)`。 | K6-I2–I6; IV-K6-03–08/12 |
| `match_verifier_entry(receipt_ref, verifier_set)` private | receipt VerifierRefとK4-owned set → entry | identity/version/digestの全fieldをmember refと照合。`deterministic`とcheck mappingはentryからのみ採る。不一致はL4既定`Unknown(unregistered)`。 | K6-I2; IV-K6-03/04 |
| `validate_receipt_key_body(record, query_key)` private | recorded key/body/query → consistency evidence | query/record/body.key/body.verifier/body.verifier_setが導出鍵と整合するかを確認。不一致は`Unknown(conflict)`。 | K6-I3; IV-K6-05 |
| `validate_read_set(receipt_body, expected_key)` private | read mappingとreceipt key → read result | read identitiesがsubject+non-verifier/non-verifier_set inputsと完全一致すること、各digestがref digestと一致することを確認。不足は`Unknown(missing_input)`、余分/digest矛盾は`Unknown(conflict)`。 | K6-I4; IV-K6-06 |
| `verify_fixed_outputs(outputs)` private / K5 FixedRef reader boundary | outputs FixedRef → observed bytes-integrity components | 各bytesを読みSHA-256再計算し記録digestと照合。不一致`Unknown(conflict)`、読取不能`Unknown(unreadable)`。digest一致はbytes同一性のみを示しexecution proofではない。 | K6-I5; IV-K6-07 |
| `rebuild_inner(registry, evaluated, entry.checks)` private | registered/evaluated idsとK4-owned registered check mapping → K1 Combined | registered各checkにcomponentを一つずつ作る。未評価は`Unobserved(not_run)`、未登録結果は`Unknown(unregistered)`。receipt内inner componentsをowner mappingでK1 combineし、保存`inner` claimと異なる場合`Unknown(conflict)`。`ReceiptBody`にmapping fieldは追加しない。IV-K6-04のmapping-claim fixtureは実在するinner componentsとVerifierEntry.checksを固定し、保存済みCombined verdictだけを、誤ったreceipt側mappingなら得られるPositiveへ改変する。再合成との差を既存`Unknown(conflict)`として検査する。registered 0件は`set_reason=Unknown(missing_input)`。 | K6-I6; IV-K6-08/09/04 |
| `required(operation, base_key, verifier_set, reverify)` | operation、base key、K4-set、再検証指定 → `RequiredResult` | K5 restoreがValueなら`required_for[operation]`に列挙されたverifierごとにreceipt keyを導出、K2 lookupし、Valueのみadmit。restoreが非Valueなら、その同じ非Valueを必要な各verifier成分へ伝播し、部分recordをlookupしない。admitted inner全component/set_reasonをverifier/check識別付きで外側へ追加。lookup/admitの非Valueも当該verifier成分として残す。各checkのPolarityOfでK1 combine。未登録・空required setは勝手に補わない。 | K6-I7; IV-K6-09/10 |
| `reverify(admitted)` | admitted receipt → `Observed<AdmittedReceipt>` | entryのdeterministic=trueの場合に限り同一入力で再実行しinner digestを比較。一致でreproduction Value、不一致`Unknown(conflict)`、非決定的`Unknown(unsupported)`。issuer_authenticityは変えない。 | K6-I8; IV-K6-11/12 |
| K5 append/restore boundary | `ResultRecorded`/scope records → persisted/restored receipts | append-only receipt記録。correction禁止。lookup順序はK5 append order。K6はtimestampでprior選択を変えない。IV-K6-14 fixtureでは同一subject identityの異なる旧revisionの有効Value receiptを複数置き、各key/body/result_digestを整合させる。timestamp順とK5 append sequence順を逆にし、K5-I7のsequence順で選ばれるpriorをassertする。同一keyの異bodyを二つ並べるK2 conflictは作らない。 | K6-I9; IV-K6-13/14 |
| consumer handoff | RequiredResult → existing owner consumer | `combined`と三assurance項目を分離したまま渡し、肯定からauthority effectを出さない。`reproduction`や`issuer_authenticity`が非Value/unsupportedの項目を、再現Valueと同じ扱いにしない。L4 §10にK6 consumer API/拒否variantが定義されていないため、L9 IV-K6-15のforbidden consumer `Rejected`経路はこの対で実装・充足したとしない。`authority_effect="none"`とassurance field保持だけを構造照合する。 | K6-I10; IV-K6-15 |

Receipt keyのinputsはbase key inputsの全体にverifier refとVerifierSet FixedRefを加える。`read`期待集合はkeyのsubject identityと`kind`がverifier/verifier_set以外の全inputs identityと一致し、各digestはそのkey refsに一致する。VerifierRef/VerifierSetは読んだsource bytesではなく、I2登録照合に使う。`started`/`completed`は保存するが順序、有効性、expiry、prior選択の値に使わない。`run`の`verifier`引数はL4 §10.3/§10.6を整合させて、既存current VerifierSet member bindingにより選択される実行主体参照と読む。署名変更、任意callback、caller提供registry/read/execution/resultの受け口は作らない。余分なcaller fieldはL9 IV-K6-02の型付きsignature-incompatible attemptであり、動的validatorや新しいRejected reasonを追加しない。

### 9.4 K6 invariantからL5関数・L8 oracleへのtrace

| L4 invariant | L5 boundary/function | L9 oracle / L8 case family |
|---|---|---|
| K6-I1 発行者 | `run`; execution/read/registry/innerは検証器自身が作る | IV-K6-02 / `L8-K6-02-*` |
| K6-I2 set所属とset由来項目 | `match_verifier_entry`; member全ref一致、setのchecks/deterministicを採用 | IV-K6-03/04 / `L8-K6-03-*`, `04-*` |
| K6-I3 key/body一致 | `derive_receipt_key`, `validate_receipt_key_body` | IV-K6-01/05 / `L8-K6-01-*`, `05-*` |
| K6-I4 read完全性 | `validate_read_set` | IV-K6-06 / `L8-K6-06-*` |
| K6-I5 output FixedRef実体 | `verify_fixed_outputs` | IV-K6-07 / `L8-K6-07-*` |
| K6-I6 registered/evaluatedとinner再合成 | `rebuild_inner` | IV-K6-08/09 / `L8-K6-08-*`, `09-*` |
| K6-I7 required集合の外側合成 | `required`; K4宣言、K5 restore、K2 lookup、K1 combine | IV-K6-09/10 / `L8-K6-09-*`, `10-*` |
| K6-I8 reproduction | `reverify` | IV-K6-11/12 / `L8-K6-11-*`, `12-*` |
| K6-I9 immutable correction | K5 append boundary/K2 same-key conflict | IV-K6-13/14 / `L8-K6-13/14-*` |
| K6-I10 no authority + assurance分離 | consumer handoff | IV-K6-15 / `L8-K6-15-*` |

### 9.5 失敗分類・保証限界

- L4/L9に明記されたclass/reasonだけを使う。K2 lookupの`Stale`、同revision digest/key/body conflictの`Unknown(conflict)`、欠落`Unknown(missing_input)`、読めないFixedRef `Unknown(unreadable)`、非member `Unknown(unregistered)`、non-deterministic reproduction `Unknown(unsupported)`、未実行`Unobserved(not_run)`を別成分で保持する。
- IV-K6-02のcaller-supplied result/exit/output digestは、既存`run(verifier, base_key)`に対する型付きsignature-incompatible attemptとしてL9が`Rejected`を期待する。動的引数validatorや新reasonは設けない。
- `reproduction`、`issuer_authenticity`、evidence integrityは別assuranceである。reproduction Valueは固定入力で結果が再現することだけを示し、過去にreceipt記載のexecutionが行われたこと、時刻、issuerを証明しない。署名/attestation/外部固定を追加しない。必要な製品保証を追加する場合だけL4 §6.2の境界へ戻す。
- L4 §10.9の`required_for`はK4-I4の義務参照verifier集合との一致を保持し、K6や消費側で検証器を追加/省略しない。K4 declarationが読めない・未登録のときの新しいreason mappingは置かず、既存owner observationを保持する。L9 IV-K6-04(1)の`deterministic:true` claimはL4 `ReceiptBody`にfieldがなく、L5/L8ではVerifierEntryから得る`reverifiable=false`の構造照合までを部分被覆とする。IV-K6-04(2)は、L4 K6-I6の既存再合成結果とL9が要求するowner `checks`利用の照合範囲を区別し、oracleの拡張解釈が必要な範囲をL4/L9 ownerへ返す。L9 IV-K6-15(1)はconsumer `Rejected`を要求するが、L4にconsumer APIまたはRejected返却型がないため未接続であり、L5/L8の構造確認を充足と数えずL4/L9 ownerへ返す。K6側ではauthority_effectが`none`であることとassurance項目の区別を保持する。
- K3 authorityはこのL5 scope外。receiptのpositiveからoperation permission/checkやauthorizationを出さない。

## 10. K8 入力label・明示経路の記録設計

本節はL4 §18のK8契約を詳細化する。K8に親要求はなく、要素別trace先はSECURITY-AC-001-01だけである。K8は分類語彙・target語彙・権限・effect・汎用taint機能を作らない。L4 K8-I1〜I8、型、失敗順、K2 key構成を変更しない。K6/K7の詳細設計・実装は本節の歴史的起点baseでは未統合だった。統合後も、本節はそれらの実装成立を仮定せず、L4がK8の型として直接参照するK3 `PermissionCheck`、K6 `RequiredResult`と既存K2/K5 source contractだけを使用する。K8-I6がL4でK7 AppliedUncertainの失敗伝達に「倣う」とする記述は、その非消去意味だけを保持し、K7型/APIへの依存を追加しない。

### 10.1 固定sourceと旧HELIX対応

| 入力 | 固定対象 | SHA-256 |
|---|---|---|
| Common Kernel L4 | base main `f75199749888f7261772ba26e9feb58a33d9a04f`、`docs/helix-harness/L4-basic-design/common-kernel.md` §18全体 | `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` |
| Common Kernel L9 | 同baseの`docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md` IV-K8-01〜26 | `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` |
| SECURITY AC | L4 §18.1が固定するSECURITY L3 revision `8d759ff9313252641154f386fe14c68e0a40e415`、`docs/helix-security/L3-requirements/functional-requirements.md:68` | 全体SHA-256 `f6872a3ee941d63c80a9717bca7e81de832c043ad05cc9ac0c2db77eb264ee9e` |

L4 §18.2の7旧assetは次のとおり。各source SHAは§18.2表の正しい値を用いる。起点base `f75199749888f7261772ba26e9feb58a33d9a04f` の§18.2末尾散文にあったWCA L4 SHAの1文字誤記は転記せず、L4 §18.2の表値・archive bytes実算値`aca532c939e34f2a4fb6b47f74254ff76a49dfaea1eeb56ff5edd7f3a181acec`を使う。L4は本詳細pairで編集しない。現行mainではPR #2779が誤記を修正済みであり、上表の起点commitと旧本文SHAは歴史的固定として保持する。

| Asset / archive source span / SHA-256 | 保持・変更 |
|---|---|
| `LEGACY-ASSET-18F7940E7994634D39A1` `docs/design/helix/L1-requirements/pillar-requirements.md:43,57,66,77,81` `7a73fa86acd8e5a7b755a9479f67c4d2af1579e533df101b1b3294eeceb0d8cc` | 外部dataの信頼境界を調査起点として保持。P8全体、旧sandbox/token/escalationは移さず、AC-001-01へ範囲を絞って意味を再導出。 |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `docs/design/helix/L3-requirements/pillar-functional-requirements.md:171,186` `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | raw input・trusted metadata・executable instructionを同じ意味へ縮約しない。旧IDと検出動作は移さず、現行source/project/revision/classificationへ再導出。 |
| `LEGACY-ASSET-8DA932B4A1012B9D8F00` `docs/design/helix/L4-basic-design/worker-context-authority.md:19–24,30–53` `aca532c939e34f2a4fb6b47f74254ff76a49dfaea1eeb56ff5edd7f3a181acec` | current authority/rule/scopeとhistorical inputを区別する境界意識を保持。sealed worker packet、process/sandbox launchはK8へ移さない。 |
| `LEGACY-ASSET-AD72C8353ACD8C676C5F` `docs/design/helix/L5-detail/worker-context-authority.md:19–46` `8818e7af133f2feb2268c6f2c8b04e509735ff330ab8510c2361086a242e6f12` | field/digestの厳密結合と未知を肯定へ縮退させない点を保持。旧18-field packet、failure code/orderは移さず、K2/K8 aliasを現行契約から再導出。 |
| `LEGACY-ASSET-2A73DCD3E15EC9B529CF` `docs/design/helix/L6-function-design/worker-context-authority.md:19–29` `21406d2c7c72520f9928ce5e6ded143f8285c3975a3fb617293965661b01eff3` | 観測・照合とauthority作用を分ける。attest/compile/launch APIと旧runtime authorityは移さない。 |
| `LEGACY-ASSET-D65FB82C21C5EDBDFCE4` `docs/design/helix/L5-detail/memory-learning-promotion.md:39–48,72–89,91–145,147–165` `70ed887f35ca38a6e406d91b750848a9b89cde73825358c554ad009d473a115a` | raw evidence/progressと知識昇格を同じ意味で扱わない。memory stage、持続化、閾値、旧APIを移さない。 |
| `LEGACY-ASSET-256C9F8C3029B185B151` `docs/design/helix/L6-function-design/memory-learning-promotion.md:31–60,72–148` `e6e20a686ac0f9e019b9fd9803674c489b1e1674b7388efa20dfa3be648fb753` | 純読取分類と作用分離の参考に留める。旧HIL taxonomy、promotion認可、公開APIは移さない。 |

台帳状態・consumer/failureの詳細sourceは現L4 §18.2の正本表を参照する。source内に記載された旧failureは歴史資料であり、実際のconsumer稼働やK8の現行失敗観測とは主張しない。保持するのは境界の調査起点だけで、旧方式は完全一致再利用せず、SECURITY-AC-001-01と現K1/K2/K3/K5/K6境界から再導出する。

### 10.2 型・owner境界

L4 §18.3の型定義をそのまま使用し、field・公開型・reasonを追加しない。中心となる形は以下である。

```text
TargetOwnerRef = { target: SubjectRef, owner: SubjectRef }
ClassificationDecl = { classification_definition: SubjectRef, classifier: SubjectRef,
  route_slice: { target_owners: TargetOwnerRef[], route_verifier: VerifierRef } | absent,
  effect_slice: { effect_source: SubjectRef } | absent }
InputSourceRef = { source: SubjectRef, project: SubjectRef }
ObservedLabel = { input: InputSourceRef, trust: "untrusted",
  classification: Observed<ClassificationRef>, key: ResultKey, evidence: EvidenceRef }
InputLabelRef = SubjectRef{kind: k8_input_label_observation,
  identity: canonical_json({source_identity, classification_operation, scope}),
  revision: saved ResultRecord.key_digest,
  digest: sha256(canonical_json(saved K2 ResultRecord))}
EffectObservation = { source: SubjectRef, event: SubjectRef | null,
  outcome: "none" | "occurred", issuer: identity,
  binding: { input_label: SubjectRef | null, route: SubjectRef | null,
    target: SubjectRef | null, permission_query: SubjectRef | null } | null }
TransitionOutcome = Validated | Mismatch{fields: nonempty MismatchField[]}
  | Denied{source: permission_check | route_verification}
TransitionValidation = { result: Observed<TransitionOutcome> | KeyUnavailable,
  components: { saved_input_label: Observed<ClassificationRef>,
    current_classification: Observed<ClassificationRef>, effect: Observed<EffectObservation>,
    permission_check: PermissionCheck | KeyUnavailable,
    route_verification: RequiredResult | KeyUnavailable,
    issuer_source_match: EffectIssuerDiagnostic, raw_read_refs: SubjectRef[] }
    | ValidationEvidenceUnavailable,
  issuer_authenticity: EffectIssuerAssuranceDiagnostic }
NotSelected = { state: "not_selected" }
```

この抜粋はL4のfield定義の再掲であり、`InputLabelRef`、`K8CaseBindingRef`、`K8RoleBoundInputRef`、`K8OperationVersion`、`KeyUnavailable`、`ValidationEvidenceUnavailable`等もL4 §18.3の定義そのままを使う。分類・route/effect source・target owner・current readerのauthorityはSECURITY/各既存ownerに残る。K3 permission sourceとeffect sourceを同一視しない。K6 verifierはL4が要求するcurrent `VerifierSet`のexact memberに限る。K6の詳細実装契約、K7 API/recordは本節から借りない。

### 10.3 公開API契約と読取順

| L4公開API（signature不変） | current読取・処理 | 返却境界 |
|---|---|---|
| `observe_input_label(input_ref, input_heads) -> ObservedLabel | Rejected(missing_key)` | SECURITY current declarationの分類slice、source/project/revision/digest、classifier、source owner readerを各ownerのcurrent fixed prefixから読む。source bytesを実読・digest照合し、分類不能をdefault値で補完しない。optionalなroute/effect sliceが無くても分類だけは続ける。 | 観測結果は`trust="untrusted"`を保つ。分類不能/source読取不能/未登録はL4既定のK1 class/reasonを保ち、key conflictを肯定へ変換しない。 |
| `observe_authority_effect(case_ref, effect_observation_ref, input_heads) -> Observed<EffectObservation> | Rejected(missing_key)` | 引数case refのcurrent input-only bindingを解決し、SECURITY current effect-source registrationとsource owner current readerから原record bytesを読む。case逆引き、caller declaration/reader/outcome値の採用をしない。 | `none`, `event=null`, `binding=null`, 内側nullとissuer/source refsを原記録どおり保持する。effect source未登録/読取不能/未着はL4既定型。許可・effectを生成しない。 |
| `validate_label_transition(case_ref, input_label_ref, route_ref, k3_permission_check_ref, effect_observation_ref, input_heads) -> TransitionValidation | Rejected(missing_key)` | current input binding、保存済み分類ResultRecord、別個のcurrent classification key、target-owner/route declaration、K3 PermissionCheck record、K6 verifier receipt、effect source recordを各ownerのcurrent prefixから読む。全fieldをexact compareし、route-target/permission tuple/event bindingを照合。 | componentsはL4型のまま保持。K3/K6 componentの診断・assuranceを変換せず保持し、issuer comparison/assuranceはL4の非K1非K2診断を用いる。freshの判定と優先順はL4 §18.4だけに従う。 |
| `record_label_transition(case_ref, input_heads) -> LabelTransition | Rejected(missing_key)` | owner current input-only bindingと別のresult-pointer projectionを読み、各operation keyを現行inputから再構成しK2 lookupする。保存pointerをcurrent keyとして使わない。 | selected pointer不在時もcurrent key lookupを保持し、pointer diagnosticに混ぜない。not_selectedは`NotSelected` projectionでK1結果/keyを作らず、explicit keyed queryの`Unobserved(not_selected)`と混同しない。 |

### 10.4 K2/K5 binding・keyの構成

- operation versionは各API operation、既存API contract、当該operationに使うcurrent owner contract refsをL4 `K8OperationVersion`のcanonical formで構成する。必須refを解決できないときversionを推定しない。
- K2 keyは各operationのL4 subject/scope/required-inputだけで作る。sourceはsubjectとして一回だけ、inputsに重複させない。共有refはexact refでdedup。identity集合変更・revision/digest変更・同revision異digestはK2既存classのまま保持する。
- K8CaseBindingRefはowner current input-only binding bytesから作る。classification ResultKeyはInputLabelRef経由で含めるが、effect/validation pointer keyやpointer source headを入れない。result pointer projectionは別identity/headを持つため、pointer追記でinput binding revision/headを更新しない。
- K8RoleBoundInputRefはL4 §3.4.1の既存`RoleBoundInputAlias`規則を使う。side/role/ref identityはK2 key内で区別するが、revision/digestは元source refのrevisionとraw content digestをそのまま使う。binding bytesと原sourceは別に実読し、raw SubjectRefは`TransitionValidation.components.raw_read_refs`にも残す。wrapper bytesだけではsource readにならない。同一alias内異refはAPI入口で既存`Rejected(missing_key)`、異なるside/roleでは同一raw identityがあっても併存させ、K2 duplicate rejectionへ誤転送しない。
- `InputLabelRef`は分類operationの唯一ResultRecordへ全field一致し、source refで代用しない。current classification lookupは保存済みlabelとは別に行い、双方のK2結果を保つ。

### 10.5 validation result・projection・polarity

fresh `validate_label_transition`はL4 §18.4の順位（API Rejected、selected KeyUnavailable/key可能not_selected照会、Mismatch、K3 Denied、K6 Denied、Unknown、Unobserved、Validated）をそのまま使う。複合条件では全componentと全候補・assuranceを保持し、決定理由のみL4閉語彙順で選ぶ。`record_label_transition`はfresh validationを呼ばず、K2 current lookup結果を保持する。record Stale/Conflict/Unobservedをfresh outcomeへ移さない。

K3の`PermissionCheck`とK6の`RequiredResult`はcomponentsにそれぞれ既存型のまま保持する。issuer-source matchはL4定義の非K1/非K2 diagnostic、issuer authenticityは`unproven/no_existing_signature_or_anchor`のまま。issuer一致、K6 receipt、K3 permission、read-only分類から実作用・真正性を推論しない。`observed_effect`と`validated_transition`は別component/resultであり、validation key不足でも既読effect Valueを消さない。`NotSelected`はquery未発行projectionだけに用い、明示queryのK1 `Unobserved(not_selected)`に変換しない。

K1 combineへの極性写像はL4で既に定義されたHARNESS所有`k8_transition_polarity`とcurrent K8 validation contract refの組を使う。`Validated`だけPositive、`Mismatch`/`Denied`はNegative。Unknown/Unobserved/KeyUnavailable/NotSelected/issuer diagnosticsは新たなK1 resultやpolarityにしない。new K1 reason、公開API、API return field、authority、consumer stateを追加しない。

### 10.6 不変条件と限界

L5 API/componentへのtraceはL4 §18.5–18.6およびL9 IV-K8-01–26を参照する。維持対象はK8-I1出自結合、I2 untrusted維持、I3分類不能保持、I4 read/effect分離、I5 route検証、I6作用観測保全、I7 target別negative、I8汎用taint非導入である。classification slice・route slice・effect sliceはoperation別に必要性を判定する。未登録・unknown・stale・unreadableは該当operationの既存型/reasonに限定し、他operationを一律停止しない。

K6とK7の細部が起点baseに存在しなかったことを理由に、L4の明示的な型・oracleを新設/置換しない。K6 `RequiredResult`はL4の既存型としての値境界だけ参照し、詳細 verifier生成実装は扱わない。K7 API、operation fencing、AppliedUncertainを本pairへ取り込まない。ここに書いたのは設計候補であり、実source registration、current reader、receipt、implementation、実行、coverageを証明しない。
