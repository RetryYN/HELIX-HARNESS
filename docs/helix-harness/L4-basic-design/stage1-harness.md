---
title: "HELIX-HARNESS Stage 1 L4基本設計"
layer: L4
status: design_pair_defined
owner: HELIX-HARNESS
parents:
  - HARNESS-L2-010
  - HARNESS-L2-011
  - HARNESS-L2-023
paired_l9: ../L9-integration-verification/stage1-harness-integration-verification.md
base: main `33bbe8cd5f080be9e400e9259db22645bc620eda`
---

# HELIX-HARNESS Stage 1 L4基本設計

`design_pair_defined`は契約とoracleの設計定義状態であり、L3承認、実装、実行、検証合格、release eligibilityを表さない。本書はHELIX-HARNESS製品の固定Stage 1範囲だけをL4へ具体化する。上流は承認済み3親のL2/L11および固定L3/L10本文であり、L4/L9はその意味・scope・owner・version_targetを変更しない。

## 1. 対象と固定source

対象は`HARNESS-L2-010`、`HARNESS-L2-011`、`HARNESS-L2-023`のStage 1である。3親のL3/L10を同じ対象revisionとして固定する。`HARNESS-L2-023`の個別`version_target: 1.0`を保持し、010/011へversion_targetを足さない。Stage 1外の他親、Web製品・WEB-OS、L2-022、他機構は対象に含めない。

固定sourceはmain `a77672513325aa9e79f3780af40455361b5d19a8`の次の6文書で、各raw bytes SHA-256を固定する。値は同revisionの`git show <revision>:<path>`から再計算し、[Stage 1義務crosswalk](../../governance/crosswalks/stage1-l3-l10-obligation-crosswalk.md)の`PIN-HARNESS-a7767251`と照合した。

| 文書 | path | SHA-256 |
|---|---|---|
| L3業務 | `docs/helix-harness/L3-requirements/business-requirements.md` | `4edda6e444179db716442eaa39bffb8783eb3a8440b87dda5723c54aeb6294f3` |
| L3機能 | `docs/helix-harness/L3-requirements/functional-requirements.md` | `c63150540d6a1dce2ee8e566eaee4d518dd1fa868fd6af3cfb75b7df408f8ac7` |
| L3 NFR候補 | `docs/helix-harness/L3-requirements/nfr-grade.md` | `d291fab1f81b8adb76d6cbfbcb0ca274105338b2e6a7fed3c4dbb1443d2f9bd2` |
| L10業務 | `docs/helix-harness/L10-verification/business-verification.md` | `30942ad3414982c13016e7f196cae20f4a6dbe3e53b4175165f2505fb8be92bb` |
| L10機能 | `docs/helix-harness/L10-verification/functional-verification.md` | `9ec6d90c517535550bad43ba56abb6fba0eac0a62a766f9144b5277e69c6946c` |
| L10 NFR | `docs/helix-harness/L10-verification/nfr-verification.md` | `c04ad3e124cac5f659f0a03ff22eea79a8e7ca8b0998921d037b77185a01f078` |

固定L2/L11の意味と範囲は、承認済みL2/L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`にあるHARNESS-L2-010（L2:340–351、L11:205–206）、011（L2:352–362、L11:206）、023（L2:463–498、L11:219–233）に戻る。L3 functionalの固定親表はL2行spanおよびL11 span SHAも列記する。L3/L10の6文書全体pinが承認対象であり、機能sectionだけへ狭めない。frontmatterの当時metadataを承認根拠にせず、decision recordとcrosswalkを権限連鎖として扱う。

## 2. 旧HELIXを起点とした保持・再導出・置換

旧source本文と台帳rowを読み、固定L3が明示する旧対応を起点に、保持点と差分理由を記録する。次は参照時の分類であり、台帳dispositionの更新、copy、旧assetの昇格を意味しない。該当assetはhistorical/unresolvedである。

| 旧asset / source | 読んだ位置と全体SHA-256 | 保持する点 | 対応分類と理由 |
|---|---|---|---|
| `LEGACY-ASSET-9A772391C7FB1298D45F` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56`; `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4` | L3の機能・業務・NFR文書を分け、要件と対の検証設計をtraceする文書構造 | **意味を再導出**。現行L3/L10およびL4/L9の層pairへ置換する。旧L12 pair、G3 freeze/sub-gate、roadmap、runtimeを移さない。 |
| `LEGACY-ASSET-F542125805B777D8A56A` | `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–166`; `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | L3で機能と受入条件を設計し対のverification designを持つこと | **意味を再導出**。旧G3/旧L10の層意味は現行に持ち込まず、既存ConceptのL4↔L9へ対応させる。no-code-first/complexity判断等は固定Stage 1親外なので除外する。 |
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:119–196`（FR-03/04/05）; `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a` | artifact identity/versionの照合、依存・不整合を明示し、正常/反例を分けて調べる形 | **部分的に意味を再導出**。fixed 010–023のpack契約、版境界、依存分類へ限定。4 artifact/12 edge、PLAN schema、requires/blocks graph、旧kind enum、決定論的G3 gate、PO bypassは要求scope/ownerを変えるため**置換**し持ち込まない。 |
| `LEGACY-ASSET-1B92155F959D7905DD1E` | `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md:60–69`; `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1` | 1つの受入caseを機能ACと対応付け、normal/negative観測をtraceする枠 | **verification形だけ再導出**。L9は固定L10 caseをsource IDとして一対一に割当てる。旧test runner/合格状態/旧G3を移さず、実行もしない。 |
| `LEGACY-ASSET-DB669724249A14A665F0` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–23,29–68`; `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d` | 候補、根拠、測定、判定境界を一体でtraceする構成 | **意味を再導出**。現NFR-C 5件だけを固定親由来で扱う。旧IPA level、3 OS/4 mode、timeout、KPI、phase値は現行親に根拠がないので**置換**する。 |
| `LEGACY-ASSET-0327D0DF98618D3066FD` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:60–70`; `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` | preflight/dispatch直前/直後のsnapshot観測と、effect前不成立・effect後不確実を分ける故障境界 | **部分的に意味を再導出**。011のL10 CASE-011-04とNFR-011-02のexpiry観測に限る。署名issuer、Node port、exclusive filesystem、CAS、timeout、実write方式は**置換**し、このL4では定義しない。 |
| `LEGACY-ASSET-B75E46DBE77592351574` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:60–92,115–142,209–212`; `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` | contract単位、版の独立管理、失敗時の復帰、依存の安全閉包という隣接比較点 | **部分的に再導出**。候補資料であり直接authorityでない。Slice/Module/Bundle graph、CI導出、profile/channelやAC/gateをHARNESS packへ移さず、固定L2から必要な意味だけ再構成する。 |
| `LEGACY-ASSET-201EED9C5D6D2FF4D41B` / `LEGACY-ASSET-67ADFAB856D954B3C5D2` | `functional-release-slice-requests.md:23–46,64–67`; `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20`; `functional-release-slice-acceptance.md:37–47,58–81`; `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` | 独立trace、mutation形式のnegative、closure保持の比較例 | **構造のみ再導出**。candidate Sliceのowner/promotion/acceptance semanticsは固定HARNESS親でないため**置換**。|
| `LEGACY-ASSET-A6E2C7F0565E5F804F06` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:21–47,84–104`; `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d` | 適用scopeと出典を分けて示す文書上の構成 | **構造のみ再導出**。BR-21/HM-08/P2 learning metric、評価値、改善/自動適用/承認点は今回の固定親にないため**置換**し、独立business ACを作らない。 |
| `LEGACY-ASSET-73B5C6C7D281E28EC541` / `LEGACY-ASSET-829E9C1646D4883C8B99` | `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L8-integration-test-design.md:48–75,120–145,182–193`; `c8b287ee4e103255081f00439b7fb2f3dfd259e0fb35a2760b48ad583524fe15`; `L8-source-boundary-contracts.md:11–33`; `d0f7281b170a59d4ed26e618bee6b3c3c749c4f2ad1f1e2f8673ce0445f977f9` | 設計とfixtureのtrace、caseごとの正常系/negative比較 | **検証構造だけ再導出**。L9 IDと固定L10 source caseを結ぶ。旧 runner、old pass, code, runtimeは使わない。 |

全source SHAは現worktreeのarchive bytesで再計算した。旧asset台帳rowの履歴statusは変更しない。旧FRS資料は隣接候補としてのみ読んだ。旧CLI/test/CI/runtimeは起動していない。

## 3. 製品・機構・owner境界

- **HELIX-HARNESS製品**：Stage 1はpack boundary/contract、明示構成での呼出し、依存分類とclosureに関する製品機能要求を具体化する。工程標準や共通検証義務を所有する機構HARNESSと、外部提供する製品HELIX-HARNESSの属性を混同しない。
- **HARNESS機構／共通カーネル**：共通K1–K10はHARNESSが所有する既存共通部品であり、ここでは既存API・型・理由・意味を再利用する。新しいparent requirementは作らず、HARNESS-L2-031を親としない。
- **pack contract owner**：packのidentity、入力/出力、必要依存、verification scope/oracle、owner class+identity、version/maturity、release unit収載/除外、復帰先を宣言する。
- **呼出し側owner**：呼出しoperation、対象scope、既存authority reference、correlation/idempotency key、呼出し固有revision、結果の保存・表示を所有する。HARNESSは戻り結果を相関付きで返すが、利用者の保存/表示や業務上の完了判断を代行しない。
- **SECURITY**はpolicy/authorityの意味と決定を所有する。HARNESSは既決authority/data-use/classification参照を受け取り、発行・拡張・適用性推測をしない。
- **INFRASTRUCTURE**は物理資源・経路と物理観測を所有する。HARNESSの契約は物理到達性や環境の実在を証明しない。**OS**はassignment、実行operationの運転・dispatch/停止/再開のownerである。設計receipt・L9 oracleはOS assignmentや物理効果の証拠ではない。
- 他のHELIX製品、HELIX-Web製品群、WEB-OSの要求/設計をこのscopeから導出しない。product ownerとして別scopeのversion, release, business meaningを変更しない。

## 4. Stage 1契約

### 4.1 Pack identity、owner、収載境界（010）

packは関数/folderではなく、一つのbehavior contract、または分けると意味を失う密結合contractのまとまりである。各packはidentity/version/maturity、宣言input/output contract、依存種別・identity・version/range、verification scope/oracle、owner classと具体identityを持ち、release unitへの収載/非収載を明示する。ownerはrelease unit・component・coreのいずれか一つ。複数release unitから使う能力はcomponent/coreが所有する。pack、release unit、統合製品それぞれのversion/maturityは分離する。

実行時の使用dependencyは当該packの宣言とidentity/contract version/rangeで照合する。宣言外dependency、owner複数、未検証/未適格packの暗黙収載、function/folder listだけのpack一覧は受理しない。manifestが読めない、同じidentity/版に矛盾がある、比較scope不明のときは肯定へ丸めず、L9で既存K1結果型に沿ってpack契約ownerまたは呼出しownerへ返す。依存循環を010独自の拒否条件へ追加せず、条件付きclosureが解決できない場合だけ023へ接続する。

同じdeclared input・pack versionは同じ宣言artifact bytes/digestを再現する。単一packの差し替えは対象外packのversion/evidenceを変えず、失敗時は直前の適格版または明示replacementへ復帰したidentity/version/evidenceを照合する。pack maturity/success/replacementはrelease unit/productのversion/maturityを自動昇格させない。上位構成未完を理由に適格packを隠さない。交換・更新不能な巨大packはDesign-refactorへ戻す。複数pack更新は単一pack差し替え比較へ混ぜない。

### 4.2 環境非依存の呼出し、scope、resume（011）

packは特定画面、GUI、local path、AI provider、CI productなしの明示構成で呼び出し可能であり、能力名、contract version、dependency versionを伴う。未対応版を黙って読み替えない。HELIX本体の稼働DB/key/internal controlをcallerへ共有しない。独立したpack内部stateはこの制約に含めない。

operationはcallerから渡されたproject/tenant/environment scopeと既存authority内に制限される。HARNESSはactor/target/operation/environment/revision/scope/expiryの既存authority契約を参照するだけで、policyを作らず権限を増やさない。進行、result state、evidence reference、correlation IDを呼出し元へ返す。途中stateをresume用に保持しても、結果保存/表示のownerはcallerに残る。

同一logical operationのstop/resumeは記録済state・同じidempotency key・pack/contract/dependency revision・scope・適用authorityへ束縛する。callerが新keyを渡すのは別operationとして許す。HARNESSがresume keyを書き換える、missing/unknown/stale/mismatchやexpiryを成功扱いする、別tenant/resourceへ越境することを許さない。snapshotはpreflight・dispatch直前・直後で比較する。dispatch前に不成立ならeffect 0のblocked/held、dispatch後に結果を確定できないならuncertain/unknownとしてsuccessにしない。expiry equalityの比較は既存contractにあればそれを使う。固定親は等号演算子を確定していないため、L3 NFR候補A/BをL9の同一clock fixtureで比較する対象として保留し、ここで選ばない。TTL、clock-skew、retry値を新設しない。

### 4.3 条件別dependency declarationとclosure（023）

pack revisionに結び付く依存宣言は固定L2の4区分を保つ：常時必須、指定operation時のみ必須、明示選択source/providerに応じて必須、実行条件・成果・authorityを左右しない参照資料のみ。各dependencyはidentity/owner/contract version-range/conditionとpack/source revisionへ束縛する。入力operation/source selectionを評価し、常時必須＋成立したoperation条件＋選択source条件のdependencyだけを有効closureにする。未選択sourceは未観測で、presence/absence/eligibility/successを推測しない。条件false・未選択・reference-only・unknown/stale/heldを区別する。

条件unknown/矛盾、選択sourceのmissing/stale、宣言dependencyの互換性不明、closureが解決できない場合にfalse/未選択/reference-onlyへ丸めたり、暗黙fallbackで別sourceに切り替えたりしない。該当operationだけをheld/unknownとして理由とownerへ返す。利用者の明示再選択は新inputとしてclosureを再評価する。classification-onlyはdependency implementationの存在を前提にせずmissing/unknownを返せる。dependency identity/version/scope/reasonはL2-011の同じcorrelation IDのresult/evidenceへ結ぶ。

closureからfeature/owner/upper requirement/version maturityを変更しない。closureだけで候補採用・対象機能成立・実装許可を生成しない。後続版dependencyを1.0へ強制せず、1.0安全dependencyを削らず、未選択能力について親が保持する1.0全体義務を削除/延期しない。人の代行も同じ既存authority/isolation/version/verification/record/receipt条件を免除しない。HARNESS-L1-005の利用境界の意味自体が不明・矛盾するときだけ上流意味ownerへ戻し、closure設計から新しい判断点を作らない。

### 4.4 L3 AC traceとK1–K10

L4契約の全要素は固定L3 ACへtraceする。共通kernelは要素ごとの共通型であり親要求ではない。

| 固定親 / AC | HARNESS契約単位 | 関連kernel | failure時の返却先owner |
|---|---|---|---|
| `HARNESS-L2-010` / `AC-HARNESS-L3-010-01` | pack descriptor、単一owner、declared dependency/input-output、verification scope、収載/除外と別版 | K1, K2, K4, K5, K6, K10 | descriptor/dependencyはpack contract owner、呼出し固有はcaller |
| `HARNESS-L2-010` / `AC-HARNESS-L3-010-02` | 単一pack差替えで他pack revision/evidenceを保持 | K2, K5, K6, K7 | pack/replacement owner |
| `HARNESS-L2-010` / `AC-HARNESS-L3-010-03` | artifact再現、復帰先固定、版/maturity独立、適格pack表示、巨大pack return | K1, K2, K5, K6, K7, K8, K10 | pack contract ownerまたはcaller |
| `HARNESS-L2-010` / `AC-HARNESS-L3-010-04` | function/folder catalogとpack identity/owner/収載の分離 | K1, K2 | pack contract owner |
| `HARNESS-L2-011` / `AC-HARNESS-L3-011-01` | environment-independent invocation、contract/version、未対応版と出力利用 | K1, K2, K5, K6, K10 | pack contract owner vs caller input owner |
| `HARNESS-L2-011` / `AC-HARNESS-L3-011-02` | caller scope/isolationと既存SECURITY authority、product owner境界 | K1, K2, K3, K5, K6 | SECURITY authority owner、caller owner |
| `HARNESS-L2-011` / `AC-HARNESS-L3-011-03` | progress/result/evidenceのcorrelation、result return、保存/表示のcaller責務 | K1, K2, K4, K5, K6 | caller/operation owner |
| `HARNESS-L2-011` / `AC-HARNESS-L3-011-04` | stop/resume、idempotency key、version/scope/authority、expiry snapshot | K1, K2, K3, K4, K5, K6, K7, K10 | caller, SECURITY, OS/operation owner |
| `HARNESS-L2-023` / `AC-HARNESS-L3-023-01` | 4分類、condition/version/owner束縛、参照資料偽装拒否 | K1, K2, K4, K5, K10 | pack contract owner |
| `HARNESS-L2-023` / `AC-HARNESS-L3-023-02` | 有効closure、未観測/unknown/stale/fallback分離、correlated result | K1, K2, K4, K5, K6, K10 | pack contract owner, caller, authority owner |
| `HARNESS-L2-023` / `AC-HARNESS-L3-023-03` | 安全依存、人代行receipt、決定性と非昇格境界 | K1, K2, K3, K4, K5, K6, K7, K10 | authority/pack/callerの既存owner |

共通kernel利用は既存契約の適用であり、新しい型/authority/parentを追加しない。

| 共通kernel | Stage 1での接点（契約を再定義しない） |
|---|---|
| K1 `Observed<T>` | pack/ref/closure/operationのvalue, unknown, unobserved, stale, not-applicable結果を潰さずに保持する。肯定への縮退をしない。 |
| K2 identity/revision/digest key | pack、caller operation、依存、scope、artifact/evidenceの既存identityとrevisionを結び付ける。ownerからcurrent refsを受ける。 |
| K3 authority | callerが渡した既存権限と対象/scope/expiryの照合。HARNESSにauthority発行・policy決定をさせない。 |
| K4 obligations | 未完のverification/依存/引継ぎを理由付きで保持し、closureや単体pack成功で消さない。 |
| K5 evidence | manifest/evidence/resultのappend-only既存recordとprojection境界。物理保存方式はここで決めない。 |
| K6 receipt | declared oracleとresult/evidenceの検証receiptを照合する。receiptの存在だけで実行実体/approvalを証明しない。 |
| K7 generation/fencing | pack/operation revisionの更新時にstaleを検出し、resume/replacementの既存fencing境界へ渡す。 |
| K8 label observation | pack maturity等のdeclared labelsをowner観測として扱い、単体pack labelからrelease unit/productのlabelを昇格しない。 |
| K9 独立review | fixed scopeのreview/evidenceが明示される場合に既存independence contractへ渡す。review identityから要求承認やoperation権限を生成しない。 |
| K10 typed dependency graph | 023のdeclared dependency type/identity/revision/conditionに使い、宣言外依存やunknownを肯定しない。 |

K3–K10は共通kernelの現行L4/L9を参照するだけで、このpairで詳細APIや新しい意味を定めない。共通kernel L4 `common-kernel.md`とL9 `common-kernel-integration-verification.md`のbase本文SHAはそれぞれ`7ee3a2e4bb820538ceab0dbf2ff2e8e44bf7cb113012ec16aba7484e70b6388b`、`62617cee9af0bdc1efe253275ae97dea9b2368cd8ee77a818735c5f180e0ba1b`。K1/K2を詳述したL5/L8は#2739のmerge commit `33bbe8cd5f080be9e400e9259db22645bc620eda`でmainに統合済みの設計文書であり、独立reviewを経ている。L5 `common-kernel.md`の本文SHA-256は`046d42e6a91e888f14b56805677185ce3452b3d0472b871fb7d3a7bfbd48b079`、L8 `common-kernel-detail-verification.md`は`0ea7ef941bae72df3cf21a0ba1b29ddc8f394192f267a2136cf9f6d88a640574`。これらは設計参照であり、実装・実行結果を示さず、本pairの親やauthorityにはしない。

## 5. NFR候補とbusiness境界

固定されたNFR候補は次の5件だけで、各々対のL9に個別verifier IDを持つ。候補値は承認済みSLO/実測ではない。

| NFR候補 | L3 AC | L4の計測契約 |
|---|---|---|
| `NFR-C-HARNESS-010-01` | AC-010-03 | 同じ宣言input/pack versionに対しartifact contractが宣言するdigest一致、予期しない差分0。明示された非意味metadataだけ除外できる。 |
| `NFR-C-HARNESS-010-02` | AC-010-02 | 単一pack差替え時、対象外pack version/evidence差分0。複数pack更新を混ぜない。 |
| `NFR-C-HARNESS-011-01` | AC-011-04 | 同一logical operationは同一idempotency keyを保持し、同key重複dispatchによる追加effect 0（effect高々1回）。 |
| `NFR-C-HARNESS-011-02` | AC-011-04 | expiry後success 0。等号境界未定義時はNFRに固定された案A `now >= expiry`と案B `now > expiry`を同一clock fixtureで比較し、どちらもexpired successを許さない。TTL/clock-skewは作らない。 |
| `NFR-C-HARNESS-023-01` | AC-023-03 | 同一pack revision/inputの反復closure・reason差分0。固定NFRのD1–D15全15fixtureを各々検査し、同一条件を再評価する。 |

固定L3/L10業務文書はこれら3親について独立business requirement/oracleを持たない。L9は親別の共有境界を3つ記録するだけで、事業価値、利用者受入、優先順位、release判断、独立business ACを追加しない。

## 6. 対のL9との境界

L9には固定functional L10 case 12件、NFR case 5件、business boundary 3親分をそれぞれ別IDでtraceする。L10 `CASE-HARNESS-L10-*`はsource IDであり、L9 `IV-HARNESS-*`はverifier IDで、互いに再採番しない。対応とoracleは[L9](../L9-integration-verification/stage1-harness-integration-verification.md)を正本とする。

設計の結果から、L3承認、要求・scope・owner/version変更、外部実行の許可、integration/release/product成熟度、CI green、Stage全体gate、実装・実通信を生成しない。L2 meaning/coverage/owner/versionを変える必要が明らかになった場合だけ、影響する意味を所有する上流へ戻す。
