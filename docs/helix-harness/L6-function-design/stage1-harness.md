---
title: "HELIX-HARNESS Stage 1 L6関数設計"
layer: L6
status: draft
owner: HELIX-HARNESS
parents:
  - HARNESS-L2-010
  - HARNESS-L2-011
  - HARNESS-L2-023
paired_l5: ../L5-detail-design/stage1-harness.md
paired_l8: ../L8-detail-verification/stage1-harness-detail-verification.md
paired_l9: ../L9-integration-verification/stage1-harness-integration-verification.md
base: `5a51b1c135f848ca077e87e19977550ed77668fc`
---

# HELIX-HARNESS Stage 1 L6関数設計

本書は固定されたHARNESS-L2-010/011/023 Stage 1のL5候補APIを、入力境界、処理手順、内部表現へ具体化する設計候補である。親の意味、L4契約、L9 oracle、L8 fixtureの期待を変更しない。関数設計であり、実装・登録・実行・release・authority証明ではない。

## 1. 固定入力と参照

| source | 固定対象 / SHA-256 | 用途 |
|---|---|---|
| Stage 1 PO decision | `docs/governance/decisions/helix-harness-stage1-l3-l10-po-decision-2026-10-05.md`, `efda65558a62b0d1caddd98d424704e60c5f827f6e9bf3eaadd861fd0259741e`; approved content revision `a77672513325aa9e79f3780af40455361b5d19a8` | L3/L10の承認済み範囲と6本文のpin根拠 |
| HARNESS L4 | `../L4-basic-design/stage1-harness.md`, `25fbd104fd47f39d22f542664e57fd44a440af8904e11b2f0b397ac6606b6cfb` | L4 API責務、parent crosswalk、owner/effect境界 |
| HARNESS L5 | `../L5-detail-design/stage1-harness.md`, `cb0877b26b44f673708072ee382bfca999c6e65a83cfadfd5fa27061f19f4f0d` | 10 API候補、component/type候補、旧source crosswalk |
| HARNESS L8 | `../L8-detail-verification/stage1-harness-detail-verification.md`, `45dd6fad21c7cd57fdef2c6ca9da9dd50153db60a386dfd7e1be67969df060e4` | 236 fixtureの単一入力変異と既存期待 |
| HARNESS L9 | `../L9-integration-verification/stage1-harness-integration-verification.md`, `6cc4bc3ac56b8d1d94e05ddc4dda71c35df2941aab39e65fb9d43cda2deb36da` | 12 functional、5 NFR、3 business-boundaryの20 oracle |
| Common Kernel L4 | main `b95f9706bbf27a6d9b09041890ef0f0602bbdcb3`, `docs/helix-harness/L4-basic-design/common-kernel.md`, `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696` | K1–K10共通型とowner境界 |
| Common Kernel L5/L8 | 同mainの`L5-detail-design/common-kernel.md` SHA `ff24f1c74d17e3e5ed4aaedfc8163018891df6785de59e2de4fac3c33edf8ef4`; `L8-detail-verification/common-kernel-detail-verification.md` SHA `6ba6ee3928bf657b2bd7be6b8cf13f0b5565e271d7bff64567bc5de0dc2ca588` | K1/K2/K3/K5の既存詳細型とfixture接続 |
| Common Kernel L6/L7 | 同mainでmerge済み#2756。L6 `a7139003fa07f0b34b2d4a2e90496721c483ae8b07e5944cc460de8dc5bf5dba`; L7 `f60a67b2fb18cce4ed17c715dddf1049d6bdcd5a49ea04bf1b4ec52cb6d191a8` | Python 3.11+標準libを使う現行関数/UT技術詳細の参照 |
| Common Kernel L9 | 同mainの`L9-integration-verification/common-kernel-integration-verification.md`, `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52` | K1/K2/K3/K5の既存oracle。HARNESS製品oracleには加えない |

HARNESSの固定親は`HARNESS-L2-010/011/023`だけであり、別親や後続Stageを含めない。Common Kernel詳細は型と境界の再利用であり、HARNESS製品要件・実装・登録の証拠ではない。L6からL5/L8/L9を変更しない。

## 2. 旧source、ledger、保持と変更

L5 §2の12 assetについて、旧sourceの指定spanとfull-file SHAを照合し、台帳rowも読んだ。12行すべて`unresolved`、`consumer_refs=[]`で、台帳に`failure_refs` fieldはない。旧本文中のconsumer/failure記載は歴史的記述として扱い、旧consumer稼働やfailure発生を推定しない。旧source/runtime/test/CLI/CIを実行していない。

| Asset ID | source path:行 | full SHA-256 | 下流で保つ点と変更理由 |
|---|---|---|---|
| `LEGACY-ASSET-9A772391C7FB1298D45F` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56` | `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4` | functional/business/NFR分離とtrace形を再導出。旧L12/G3/roadmap/CLIは現行L3/L10/L4/L8へ置換。 |
| `LEGACY-ASSET-F542125805B777D8A56A` | `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–166` | `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | pairごとのlayer責務traceを再導出。旧gate/role/no-code規則は固定親にないため移さない。 |
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:119–196` | `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a` | 宣言境界・failure個別化の形を再導出。旧12 edge/PLAN schema/G3/bypassは置換。cycleは023のclosure解決不能に限定。 |
| `LEGACY-ASSET-1B92155F959D7905DD1E` | `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md:60–69` | `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1` | AC/case/negative/evidence trace形を再導出。旧AT ID/runner/passは用いない。 |
| `LEGACY-ASSET-DB669724249A14A665F0` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md:21–23,29–68` | `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d` | 測定候補と境界のtrace形を再導出。旧IPA/provider matrix/timeout/KPIは固定親にないため置換。 |
| `LEGACY-ASSET-0327D0DF98618D3066FD` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:60–70` | `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` | preflight/dispatch前後とeffect前blocked/effect後uncertainの時点差を部分再導出。旧issuer/Node/fs/CAS/write設計は置換。 |
| `LEGACY-ASSET-B75E46DBE77592351574` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:60–92,115–142,209–212` | `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` | identity/version分離・closureの比較材料を再導出。candidate schema/owner enum/promotion/全体gateは移さない。 |
| `LEGACY-ASSET-201EED9C5D6D2FF4D41B` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23–46,64–67` | `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20` | 別version境界を比較材料として保持。Slice promotion/release意味は固定親でないため置換。 |
| `LEGACY-ASSET-67ADFAB856D954B3C5D2` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:37–47,58–81` | `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` | 独立fixture構成だけ再導出。candidate AC/gate/promotionは持ち込まない。 |
| `LEGACY-ASSET-A6E2C7F0565E5F804F06` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:21–47,84–104` | `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d` | scope/sourceを分ける文書構造だけ参考。業務指標/HM-08/承認は固定親にないため置換。 |
| `LEGACY-ASSET-73B5C6C7D281E28EC541` | `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L8-integration-test-design.md:48–75,120–145,182–193` | `c8b287ee4e103255081f00439b7fb2f3dfd259e0fb35a2760b48ad583524fe15` | requirement→fixture/negative trace形だけ再導出。旧IT/G8/command/workflowは置換。 |
| `LEGACY-ASSET-829E9C1646D4883C8B99` | `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L8-source-boundary-contracts.md:11–33` | `d0f7281b170a59d4ed26e618bee6b3c3c749c4f2ad1f1e2f8673ce0445f977f9` | source-boundary/effect negative形を限定的に再導出。旧write port/auth rule/effect callbackは置換。 |

### 2.1 source本文の読み取り内容と台帳row

| Asset ID | ledger row / status | 読んだ旧記述、consumer/failureの範囲 |
|---|---|---|
| `LEGACY-ASSET-9A772391C7FB1298D45F` | 347 / `unresolved`, `consumer_refs=[]`, `failure_refs` fieldなし | 3 sub-doc構成、L3→L12/L4 trace、G3/sub-gate/旧CLI運用。旧consumer linkは未登録。 |
| `LEGACY-ASSET-F542125805B777D8A56A` | 2291 / `unresolved`, `consumer_refs=[]`, `failure_refs` fieldなし | L3 FR、旧L10 UX検証/G3、engineering discipline/no-code-first。旧consumer linkは未登録。 |
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1` | 349 / `unresolved`, `consumer_refs=[]`, `failure_refs` fieldなし | FR-03 artifact/edge、FR-04 PLAN/cycle、FR-05 G3/PO bypassのpass/fail例。本文がAT/testをconsumerと記す箇所もあるが台帳linkはない。 |
| `LEGACY-ASSET-1B92155F959D7905DD1E` | 2509 / `unresolved`, `consumer_refs=[]`, `failure_refs` fieldなし | AT-FR rowsと旧vitest/gate結線。旧runner/testは本文記述のみで台帳linkはない。 |
| `LEGACY-ASSET-DB669724249A14A665F0` | 350 / `unresolved`, `consumer_refs=[]`, `failure_refs` fieldなし | 3 OS/4 AI mode、fail-close/KPI、NFR-15 server-phaseなどを指定する旧NFR/CI/test記述。 |
| `LEGACY-ASSET-0327D0DF98618D3066FD` | 412 / `unresolved`, `consumer_refs=[]`, `failure_refs` fieldなし | preflight/dispatch前後snapshot、effect前blocked/effect後uncertain、issuer/signature/idempotency/CAS/partial-write failure。 |
| `LEGACY-ASSET-B75E46DBE77592351574` | 820 / `unresolved`, `consumer_refs=[]`, `failure_refs` fieldなし | candidate Slice/Module/Bundle registry、qualification/release/channel、rollback/CI closure/safe dependency。 |
| `LEGACY-ASSET-201EED9C5D6D2FF4D41B` | 819 / `unresolved`, `consumer_refs=[]`, `failure_refs` fieldなし | BR-001/002/003/004/005/009のpromotion、収載、成熟度、rollback/safety closure。 |
| `LEGACY-ASSET-67ADFAB856D954B3C5D2` | 818 / `unresolved`, `consumer_refs=[]`, `failure_refs` fieldなし | mutation kill、verification coverage、phase/completion candidate。 |
| `LEGACY-ASSET-A6E2C7F0565E5F804F06` | 348 / `unresolved`, `consumer_refs=[]`, `failure_refs` fieldなし | BR-21 PLAN/skill/model metrics、auto-apply、人判断、skill deletion threshold。 |
| `LEGACY-ASSET-73B5C6C7D281E28EC541` | 2514 / `unresolved`, `consumer_refs=[]`, `failure_refs` fieldなし | IT contract/adapter/module/state rows、G8 workflow/command/evidence/exit/defect routing。 |
| `LEGACY-ASSET-829E9C1646D4883C8B99` | 2516 / `unresolved`, `consumer_refs=[]`, `failure_refs` fieldなし | lint/analyzer/write-port、authority receipt、snapshot/partial-effect negative群。 |

これらの旧記述は上表の保持・再導出・置換理由の比較根拠であり、旧consumer稼働や旧test passを意味しない。consumer/failureの台帳欄が空/不在であることも、失敗がなかったことの証拠にしない。

## 3. 型と内部domain evaluation

L5型は候補であり、ここではpure function内の表現を具体化する。以下の内部記録は観測値の比較過程を保持するだけで、K1 `Observed` variant、K1 reason、K2 `ResultKey`、外部API戻りunionを追加しない。

```text
FieldComparison = Match | Mismatch | NotSupplied | NotObserved
FieldFact = { path: str, comparison: FieldComparison, expected_ref: Ref | None, actual_ref: Ref | None }
DomainEvaluation = { facts: tuple[FieldFact, ...], matched: tuple[str, ...], mismatched: tuple[str, ...], unavailable: tuple[str, ...] }
```

`FieldComparison`はL6内だけの比較記録である。`Mismatch`はdomain field値が異なること、`NotSupplied`はcaller/declarationがfieldを渡していないこと、`NotObserved`はsourceを確認できていないことを表す。これらをK1/K2 class/reasonへ自動変換しない。L8が固定class/reasonを明示する箇所だけ既存型へ写像し、他のfield違いでは`DomainEvaluation`を返して該当ownerへ返す。空の期待値を「一致」にしない。

内部record候補:

- `PackDeclarationView`: L5のpack identity/revision、owner class+identity、input/output contract refs、dependency declarations、verification scope/oracle、release-unit included/excluded refs、pack maturity/versionを別々に保持する。catalogやfolderから不足宣言を補わない。
- `InvocationView`: pack/capability/contract/dependency refs、caller input refs、explicit scope、既存authority refs、operation/correlation/idempotency key、expiry/state refsを保持する。authorityやoperationを生成しない。
- `DependencyView`: 固定4分類のkind/identity/owner/version range/condition/source selectionを個別に保持する。未選択とmissing/unknown/stale/range mismatchを区別する。
- `ArtifactDescriptorView`: declared input refs、pack version、artifact contract、contractが明示するmetadata exclusion、descriptor/evidence refs。実build/保存を行わない。
- `OperationResultView`: invocation/correlation/progress/result/evidence refsとunfinished obligationsを保持する。caller result save/display/business completionは含めない。

K1 `Observed<T>`は既存variantとexisting reasonだけを使う。K2 current lookupで prior `Value`が見つかった場合だけ`Stale`、同一identity/revision candidateにdigest差がある場合だけ`Unknown(conflict)`となる。domain `Mismatch`をこれらへ転換しない。K2 `KeyOfResult`、K3 `PermissionCheck`、K5 append/restoreのunionはCommon Kernel L4/L5の既存型どおりであり、HARNESS内部比較記録でwrapし直さない。

## 4. L5 API候補の関数設計

下記10個はL5で定義された候補名を維持する。`FN-HARNESS-*`はL6 trace IDであり、新しいpublic endpoint、L4契約ID、owner、gateではない。L8/L9が固定していない値・reasonを新設しない。

| Function ID / L5 API | 入力から返却までの詳細 | 既存traceとowner境界 |
|---|---|---|
| `FN-HARNESS-01` `read_pack_declaration(ref)` | callerが受け渡すtyped refに対応するowner source observationを受け、declared bytes/ref/version/owner fieldsを`PackDeclarationView`へprojectionする。projectionはsource read、registration、currentness証拠を作らない。 | F-010-01/04, F-023-01; source/current resolverはpack owner。L8に独立API fixtureがないためF/N fixtureへ別oracleを追加しない。 |
| `FN-HARNESS-02` `validate_pack_contract(declaration, invocation_context)` | required/forbidden declaration fieldsをordered field pathで照合し、`DomainEvaluation`に全match/mismatch/not suppliedを蓄積する。L8の正常controlと各単独変異をこの評価へ投影する。| F-010-01/04, B-010, F-011-01; pack ownerの宣言とcaller contextを混ぜない。 |
| `FN-HARNESS-03` `resolve_dependency_closure(declaration, operation, selected_sources)` | 4分類を宣言順で評価し、常時必須、条件true、explicit sourceの依存のみclosure candidateへ含める。falseは対象条件外、unknown/矛盾は影響operationの評価を未確定、未選択sourceは未観測として別fieldで保つ。D1–D15は固定inputを二度評価しclosure/reason observationを比較する。 | F-023-01/02/03, N-023-01, B-023; source ownerの実読と物理dependency実行はしない。 |
| `FN-HARNESS-04` `compare_pack_revision(current, declared_range)` | 同じpack identityに対するdeclared rangeとcurrent refのrevision fieldを比較し、`DomainEvaluation`へfactを足す。pack identity差、domain range mismatch、K2 prior `Value` staleを別々に扱う。 | L5 range compare candidate; F-010/011/023 internal use. L8に独立API oracleなし、新API/verifierなし。 |
| `FN-HARNESS-05` `build_pack_artifact_descriptor(input_refs, pack_revision)` | 同じ宣言入力、version、artifact contractからdescriptor candidateを構成する。metadataを除外するのはcontractが列挙する場合だけ。反復評価はL8のartifact equality fieldを比較し、digest algorithmを追加しない。 | F-010-03, N-010-01; artifact owner contractのbytes/digest方式を保持し、実build/署名/writeなし。 |
| `FN-HARNESS-06` `compare_pack_replacement(before, after, target_pack)` | before/afterの全pack identity/version/evidenceをtargetと非target別に突合し、L8で明示されるtarget外delta/recovery destinationのfactを返す。複数pack変化を隠さない。 | F-010-02/03, N-010-02; read-only pure comparison。physical replacement/rollbackなし。 |
| `FN-HARNESS-07` `prepare_pack_invocation(pack, caller_input, scope, existing_authority)` | pack/capability/contract/dependency refとcaller input/scope/existing authority refを束ねた`InvocationView`を作る。宣言側とcaller側のmissing/mismatchをfieldごとに保つ。 | F-011-01/02/05, B-023 overlap rows; SECURITY authority resolverを呼び出す場合もその既存boundaryへのhandoffだけ。 |
| `FN-HARNESS-08` `resume_invocation(invocation_ref, saved_state_ref, caller_key)` | same operation/key、saved state、current pack/contract/dependency refs、scope/authority refsを比較する。L8が定めるpreflight、dispatch直前、dispatch直後の観測を別々に入力し、dispatch前の非肯定とdispatch後の不確実結果を分ける。expiry前/等号/後を同じclock条件で評価するが、等号規則は選ばない。 | F-011-04, N-011-01/02; HARNESS/OS owner境界。K7はpointer/EpochTokenのみでありresume/version/expiry fencingではない。 |
| `FN-HARNESS-09` `return_operation_result(invocation_ref, progress_ref, result_ref, evidence_refs)` | correlation keyでprogressとresult/evidence refsを関連づけ、unfinished obligationを失わずcaller handoff viewを返す。 | F-011-03, B-011; callerが保存/表示/business completionを所有する。 |
| `FN-HARNESS-10` `measure_declared_nfr(candidate_id, fixture_evidence)` | L8固定NFR IDに結び付いたsynthetic fixture evidenceから、そのL9で宣言された測定fieldだけを比較する。10-01 bytes digest equality、10-02 target外delta=0、11-01同一key effect高々1、11-02 expiry後success=0と等号A/B、23-01 D1–D15 repeat差分0を個別保持する。 | N-010-01/02、N-011-01/02、N-023-01。独立API列/fixtureを追加しない。候補値はSLO/実測/PO採択値ではない。 |

## 5. 処理順、型変換、owner handoff

### 5.1 宣言とinvocation

`read_pack_declaration`の入力は既存ownerが供給するsource observationである。folder/function catalog、code/test存在、CI結果からdeclaration/owner/version/registrationを生成しない。`validate_pack_contract`はL8 baselineのfield集合を基準に順序固定のfield factを作り、negative fixtureは一条件だけ変える。`DomainEvaluation`から肯定/拒否を作るのは、L4/L8が定めた期待class/reasonがある場合に限る。たとえばL8が「適格扱いしない」とだけ定め具体K1 class/reasonを決めていないfield mismatchは、pure mismatch factを確認し、API-level classificationだけ局所未確定のまま保つ。これでfield比較自体を未実装/holdに送らない。

`prepare_pack_invocation`はcaller input/scopeとpack declarationを独立sourceとして扱う。HARNESSはSECURITY permissionを発行しない。K3へ渡すauthority/query入力は既存type/ownerから来たrefだけであり、新しいK3 query fieldを作らない。K3 Common Kernel L4 `PermissionQuery`は`operation,target,revision,requested_scope,operation_inputs`の5 field、actor/environment/contextはcurrent owner resolverの責務である。

### 5.2 dependency closure

Closure traversalはtyped declaration orderを保存してdependency identityごとにfactを蓄積する。分類はL2/L3固定の4分類以外に増やさない。常時必須・成立した条件依存・明示選択sourceだけをclosure candidateへ含める。未選択、false、unknown、missing、stale source observation、declared rangeからの外れ、contradiction、reference-onlyは別の入力事実であり、相互に置換しない。L8が独自のexact result class/reasonを指定しないものは、`DomainEvaluation`の差分/availability factを返して当該ownerに返す。別sourceへの暗黙fallback、新owner、dependency success、実装済み状態は作らない。

### 5.3 artifact、replacement、resume、NFR

artifact descriptorはcontractが宣言した同じinput/versionから構築するpure value projectionである。未宣言metadata normalizationを追加せず、L8が固定したbytes/digest equalityを測る。replacement comparatorはtarget外fieldを全列挙し、recovery fieldを比べるだけで物理更新しない。

resumeはsnapshot stageごとのinput refsを保持し、preflight/dispatch-beforeのexpiry or drift nonpositive resultとdispatch-after uncertain observationを異なるcomponentとして記録する。K7 rowをpack/operation fencingへ一般化しない。L8 §5に従いK7との接点はgeneration pointer/`EpochToken`の具体的入力がある場合に限りstub contractとして指す。NFR-011-01のeffect countはsynthetic receiver observation、NFR-011-02はsame clock expiry comparison、実effect/clock waitで測定しない。

### 5.4 既存Kernel return boundary

内部`DomainEvaluation`はL6 implementation recordであり、L4の既存unionへ自動翻訳しない。現行K1/K2/K3/K5/L8で固定された結果だけを以下の経路で保持する。

| source event/condition | 使用する既存契約 |
|---|---|
| complete keyを使ったcurrent result lookupでprior `Value`が選ばれる | K2 `lookup`の既存`Stale` |
| exact identity/revision candidateに異なるdigestがある | K2 `Unknown(conflict)` |
| key field欠落・digest不正・input identity重複 | K2専用`KeyOfResult`の既存Rejectedと既存優先順 |
| source observationが既にUnknown/Unobserved/NotApplicable/Stale | 同じ既存Observed class/reasonを保持。classのないdomain mismatchをこの欄へ流用しない |
| K3 query/permission照合 | Common Kernel既存5-field `PermissionQuery`、`PermissionCheck`/diagnostic boundaryとcurrent-owner resolver。K3 authority create/effectなし |
| complete registered prefixのK5 record read/write | K5の既存model/signatureとOS/owner boundary。HARNESS L6からphysical append/readしない |

## 6. TraceとNFR計測範囲

L9にある20 verifier IDを一度ずつ参照し、L8 236 fixtureのIDをL7へ一対一に結ぶ。functional 12、NFR 5、business-boundary 3の区別とL10 source case locatorを保持する。NFR-C-HARNESS-010-01/02、011-01/02、023-01以外のNFRを追加しない。D1–D15はL8既存IDの各fixtureに対応し、同じinput/revisionを二度評価してclosure/reason fieldだけを比較する。比較のdigest/canonical schemaを新しい製品要件へしない。

Business verifier `B-010/011/023`は既存caller/product境界の保持確認である。収益/優先/release decision、caller save/display/business completion、closureからの新policy/ownerは生成しない。

## 7. K7、物理作用、未確定範囲

現HARNESS L8 §5で固定されたK7接続はgeneration pointerと`EpochToken`のfencingだけである。pack revision/operation revision/resume/expiry/idempotencyの比較はHARNESS/OS側の既存owner境界として保持する。K7 attempt state、operation attempt identity、K7由来のresume eligibilityは定義しない。L4 §4.4のK7行とL9 §5のK7行に広めの旧表現が残る箇所を本書で上書きせず、L8 §5のK7行にある局所具体契約を実装へ拡張しない。

初回pack registration/declaration producer、owner adapter、K5 manifest/assignment genesisは固定親/L4から実在を確認できない。これらに依存するsource readや物理登録だけ非肯定・not establishedとし、pure field comparison、descriptor比較、declared closure計算を止めない。設計候補の存在を実登録/実行証拠にしない。

## 8. 技術選択

Python 3.11以降 + 標準ライブラリ（`dataclasses`, `enum`, `typing`, `hashlib`, `json`, `unittest`）を選ぶ。現main #2756のCommon Kernel K1/K2 L6/L7もPython 3.11+標準libを候補とし、同じ標準環境でpure value record、決定的な比較入力、fixture別testを記述できる。外部package/service依存を増やさず、common-kernel詳細と製品sideのpure comparisonを同じ言語で追える。候補選定は上流意味や実行環境の必須条件を追加しない。

## 9. 状態

設計草稿であり、236 fixture/L9 verifierは実行していない。実装、registration/bootstrap、physical operation, source bytes read, permission issuance, receipt verification, release/deploymentは行わない。レビューで修正後にpair pinを静的再計算する。
