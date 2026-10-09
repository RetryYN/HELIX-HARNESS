---
title: "HELIX-CONNECT Stage 1 L5 詳細設計"
layer: L5
status: design_pair_defined
owner: HELIX-CONNECT
parents:
  - HELIXCONNECT-L2-001
  - HELIXCONNECT-L2-002
  - HELIXCONNECT-L2-003
  - HELIXCONNECT-L2-004
  - HELIXCONNECT-L2-005
paired_l8: ../L8-detail-verification/stage1-connect-detail-verification.md
base: main `b6463f2b9baa7df72703758f4e02afff9cbfac78`
---

# HELIX-CONNECT Stage 1 L5 詳細設計

本書はStage 1の固定親5件をL4の責務・契約からL6で具体化可能な論理component、入力、出力、依存境界へ分解する。ここで定義するrecord名とAPI名はL6起草用の設計候補であり、新しいL2/L3要求、wire schema、実装済み機構、送信許可、物理経路、実行証拠を作らない。対の[L8](../L8-detail-verification/stage1-connect-detail-verification.md)が18 verifierのfixtureと期待結果を定める。実通信、外部API、credential/provider、旧runtime/test/CIは使用しない。

## 1. 固定sourceと対象

対象は`HELIXCONNECT-L2-001`〜`005`、Stage 1、`version_target: 1.0`に限る。CONNECT-001は固定revision `617801a9e66fe6ff30bfddc8c1e72a3c43c2a722`、002〜005は`53fc2a1441b890b5bcd904e6d9805453c8c833d1`。各親revisionのL3/L10全体SHA-256は対の[L4 §1](../L4-basic-design/stage1-connect.md#1-固定source)に列挙された12値であり、同節の親別scopeと[Stage 1義務crosswalk](../../governance/crosswalks/stage1-l3-l10-obligation-crosswalk.md)へ戻る。L3/L10の固定bytesを本書で再定義しない。L4 `docs/helix-connect/L4-basic-design/stage1-connect.md` のwhole-file SHA-256は`10711d9c3897f7351f6d8cc0535264d4b68f642a08177cf8373f030356741002`、既存L9 `docs/helix-connect/L9-integration-verification/stage1-connect-integration-verification.md`のwhole-file SHA-256は`0e956080febe084fdf4747b6d9bd3f86ea6400a65e3ecc179d59566dabefc92a`である。L9の一方向`paired_l4_sha256`も同じL4 bytesを指す。

| 親 / L3 AC | 固定functional source | L10 source cases | 適用NFR |
|---|---|---|---|
| `HELIXCONNECT-L2-001` / `CONNECT-AC-001-01` | `functional-requirements.md:33–48` | `CONNECT-CASE-001-01`〜`001-08` | 名前付き割当なし。NFR共通領域は適用表の001行を参照し、001へ個別候補を割当てない。 |
| `HELIXCONNECT-L2-002` / `CONNECT-AC-002-01` | `functional-requirements.md:49–64` | `CONNECT-CASE-002-01` | `CON-NFR-003` |
| `HELIXCONNECT-L2-003` / `CONNECT-AC-003-01` | `functional-requirements.md:65–80` | `CONNECT-CASE-003-01` | 名前付き割当なし。 |
| `HELIXCONNECT-L2-004` / `CONNECT-AC-004-01` | `functional-requirements.md:81–96` | `CONNECT-CASE-004-01` | `CON-NFR-001`, `CON-NFR-002` |
| `HELIXCONNECT-L2-005` / `CONNECT-AC-005-01` | `functional-requirements.md:97–123` | `CONNECT-CASE-005-01` | `CON-NFR-004`, `CON-NFR-005` |

L3業務文書はこの5親へ独立business ACを定めない。L10業務文書は技術receipt/statusから業務成功・承認・許可を生成しない共有境界であり、独立した業務要求ではない。固定L3 NFRは5候補、L10 NFRはその測定・戻し先を定める。Stage 2a/Stage 4/Stage 5の親、同じ機構の別版、他機構scopeは含めない。

## 2. 旧HELIXを起点とする保持・再導出

以下のarchive本文と台帳rowを読み、L4の旧source対応を下流設計へ引き継ぐ。台帳の各dispositionは`unresolved`、`consumer_refs`は空であり、ここで台帳状態を変更しない。旧資産をcopy/実行せず、旧consumerが現存・稼働すると推定もしない。

| Asset / source path・行 | 固定SHA-256 / 台帳事実 | 保持する点 | 今回の扱いと変更理由 |
|---|---|---|---|
| `LEGACY-ASSET-9A772391C7FB1298D45F` `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56` | `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`; 台帳`unresolved`, `consumer_refs=[]`。 | functional/business/NFRの分離、FR/ACから対の検証へ追う文書構造。 | 意味を現行L3/L10とL4/L8へ再導出。旧L12、G3 gate、screen/CLI、旧progression authorityを持ち込まない。 |
| `LEGACY-ASSET-F542125805B777D8A56A` `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13–21,148–168` | `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`; 台帳`unresolved`, `consumer_refs=[]`。 | 設計成果物と対の検証設計を揃え、要求から下流へtraceする点。 | 現行V-pairのL4/L9・L5/L8へ再導出。旧G3 freeze、旧L10 UX受入・旧roleは引き継がない。 |
| `LEGACY-ASSET-9B7682EBDEA171005D45` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md:22–29,58–64,68–95` | `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c`; 台帳`unresolved`, `consumer_refs=[]`。 | source/consumer境界、versioned contract、drift時に停止する考え方を隣接比較として保持。 | 固定CONNECT親から論理接続契約を再導出する。package profile/allowlist、distribution authority、promotion/release、algorithmは別目的なので採用しない。 |
| `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md:15–32,48–58` | `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`; 台帳`unresolved`, `consumer_refs=[]`, `reuse_exclusion_class=legacy_test_design_or_oracle`。 | 入力・正常・個別反例・証拠を対応させる検証の形。 | L8の18 oracleを固定L10から再導出。旧oracle、profile、Linux/Windows smoke、CLI/CIは転用・実行しない。 |
| `LEGACY-ASSET-8CC5ABFC98C0D00183CA` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md:19–27,39–67` | `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3`; 台帳`unresolved`, `consumer_refs=[]`。 | NFR候補・測定対象・受入traceを分ける形式。 | 5候補を固定L3/L10から個別に再導出。旧grade、timeout、confidence、approval snapshot値を使わず、共通SLAを追加しない。 |

旧sourceのbounded searchについて、L4 §2の範囲・語句検索結果を再利用する。CONNECT固有の旧identity契約がarchive全体に存在しないとは主張しない。L5/L8は固定L2/L11と現在のL3/L10だけを要求意味のsourceとする。

## 3. owner境界と共通カーネル

| 境界 | L5の責務 |
|---|---|
| CONNECT logical contract | connection identity、端点ownerの宣言、direction/scope、意味契約・adapter/transport revision、互換範囲、operationと両端の技術receipt、retry/trace上の結び付け。 |
| INFRASTRUCTURE physical path | 物理resource/network routeの定義と観測。CONNECTの論理routeから物理到達性・可用性を推定しない。 |
| SECURITY authority | 既存の許可/data-use/classificationの適用と可否を決定。CONNECTは既存識別子/結果を参照し、policy/許可を生成・拡張しない。 |
| OS assignment/execution | assignment、運転・attempt状態、停止/再開の責務。CONNECT receiptはassignmentや実行事実の代替にならない。 |
| 両端owner | business意味・結果・入力・契約宣言とscopeを所有。受信結果から業務complete/承認/保存完了を生成しない。 |
| HARNESS | fixture、検証scope、証拠契約。設計文書から検証実行済みを主張しない。 |

共通kernelは既存契約を再利用し、CONNECT独自の結果型やUnknown理由を作らない。L4 §5はbase `7d48e458fcff7e03df18abc4f768981410685cf7`時点の歴史的固定snapshot（CK L4 SHA `7ee3a2e4bb820538ceab0dbf2ff2e8e44bf7cb113012ec16aba7484e70b6388b`、CK L9 SHA `62617cee9af0bdc1efe253275ae97dea9b2368cd8ee77a818735c5f180e0ba1b`）を記録している。現base `b6463f2b9baa7df72703758f4e02afff9cbfac78`の現行本文はCK L4 SHA `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696`、CK L9 SHA `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52`。このL5は現行の型・契約を参照するが、旧snapshot pinを現行と偽らず、L4/L9のsource recordも書き換えない。

- K1: `Observed<T>`/既存result classに従い、positiveを作る完全条件とUnknown/Unobserved/Staleを保持する。
- K2: connection/operationごとのidentity/revision/input digestを既存key contractで束縛する。raw message・business payloadをK2 inputへ保存しない。使ったrevisionと登録時revisionを分ける。
- K3: 既存operationについてだけ既存permission checkを参照し、compatibilityをauthorityへ混ぜない。
- K4/K5/K6: unfinished obligation、append evidence、receipt/provenanceの各既存契約を使用する。receipt単体を真性証明やbusiness completionにしない。
- K7: generation pointerとEpochTokenのfencing契約を適用する。operation/attempt状態は既存OS/CONNECT ownerの記録を参照し、CONNECTがpointer・assignmentを所有しない。
- K8: label observationは既存型/契約に従い、labelから物理routeやsend permissionを推定しない。
- K9/K10: independent review/dependency declarationを既存の範囲で参照する。

## 4. L6へ渡すcomponent/data/API候補

次のAPI候補はすべて入力refから既存K1/K2/K3等の結果を構成する純粋な検証・比較であり、外部作用、保存、送信、永続化を行わない。実記録が要求される場合は既存K5 writer/owner境界へ別途渡す。L5は書込みAPIや初回writer/登録手順を新設せず、既存K5 writerが未観測ならその保存操作はUnknown/Unobservedのままとする。L6は既存kernelの型・理由・鍵・拒否境界へ割り当て、同じ情報を別sourceから補ったり、新reason・authority・external effectを作ったりしない。具体storage/wire/transportは未定義である。

| Component / API候補 | 入力に束縛する値 | 出力候補 / 判定境界 |
|---|---|---|
| `validate_connection_declaration(declaration_refs)` | connection identity; source/consumer SubjectRefとowner宣言; direction/scope; semantic contract、adapter/transport、artifact/dependency SubjectRef; compatibility range; 適用される既存SECURITY/data-use/classification識別子とowner宣言。適用識別子なしはownerの明示宣言でのみ表す。 | K1/K2に沿う純粋な宣言適合観測。missing/unknown/conflictの必須宣言はusableでない。endpoint共有は別identityなら許す。これは永続登録/receipt発行ではなく、送信eligibility/許可でもない。実保存を要する場合は既存K5 writerへ別操作として渡し、writer/owner未確認なら保存済みと扱わない。 |
| `compare_compatibility(connection_ref, declared_revision_refs, current_revision_refs, read_scope_ref)` | 登録receipt、登録時・実使用時の端点/意味契約/adapter・transport/依存revision、宣言範囲、既存read scope。登録とcurrentを別fieldで保持。 | compatible/incompatible/unknown/staleの既存kernel結果と原因revision参照。read-onlyではsend eligibility `not_evaluated`、attempt 0。scope/access不明はpositiveへしない。 |
| `check_send_eligibility(connection_ref, operation_ref, current_refs, existing_authority_refs)` | ownerが現在宣言から解決するactor/target/operation/environment/revision/scope/expiryと適用される既存authority/data-use条件。API callerはactor/environment/current contextを渡さない。これはsend判定操作に限る入力で、registration/compatibility照合の必須前提ではない。 | 既存K3 `PermissionCheckResult`または`PermissionCheckDiagnostic`と互換照合結果を別々に保持。いずれか非肯定ならsend/retry attempt 0。新許可やpolicyは作らない。 |
| `bind_endpoint_observations(connection_ref, operation_ref, envelope_ref, compat_receipt_ref)` | 一つのconnection、operation identity/correlation ID/idempotency key、contract revision、compatibility receipt、両端の契約入力。L10が定めるcapability name、artifact/dependency revision、scope、expiry、result stateを既存ownerの宣言/refで束縛し、両端がschema identity/revisionを宣言した場合だけその既存SubjectRefを入力に含める。 | 各端点の技術観測/receipt、相関、未完義務とrecovery参照。異identity・revision・scopeの混合、片端欠落、必要handoff欠落はcompleteにしない。wire schemaは定めない。 |
| `assess_retry(operation_ref, prior_attempt_ref, failure_class_ref, contract_ref, current_authority_ref)` | 同一operation identity/content digest、単一契約revision、直前attempt/ACK/result、契約に宣言されたretryable分類/上限、元scope/expiry/authority参照。 | 契約上retryableかつ境界内の場合の候補判定と未完状態。実送信しない。same ID+digestの効果は増やさず、異digest・上限超過・business result・missing/unknown分類・authority失効は追加attempt 0。 |
| `validate_trace_append(event_ref, prior_trace_refs)` | K5 `DeclaredEvent{event_type, refs}`の固定参照、接続/operation/使用revision/attemptを含むL10既存event/evidence refs、source ownerのdata-use識別子とK5/K6参照。`event_type`はcurrent `LogDecl.event_types`に宣言された値を使い、raw payload/secret/credentialは含めない。 | K5へ渡すevent候補の純粋なref完全性とorder情報の観測。欠落した既存required refはK1 `Unknown(missing_input)`として保持する。K5 append拒否`Rejected(reason)`は別境界の返却で、K1 `Unknown`へ写さない。append/writeは呼ばず、記録済みとは主張しない。 |
| `measure_connection_nfr(candidate_ref, fixture_evidence_refs)` | 固定NFR ID、契約値または根拠付き候補、測定方法/条件/境界、L8合成fixture evidence. | candidate-specific measurement record. 候補を実装値/承認値/common SLAへ昇格させない。 |

### 4.1 論理routeと物理path

`connection identity + direction + scope + endpoint declarations`は論理routeのselectorにすぎない。physical address、DNS、socket、network route、provider、credential、到達性、失敗復旧の実作用はこのL5 API入力・出力に含めない。INFRAの物理path観測を接続descriptorへ束ねる必要がある場合も、現行ownerのdeclared referenceとobservationを別の入力として受け取り、CONNECTは存在・可用性を補完しない。OSのassignment/attemptとSECURITYのpermission resultも独立referenceのまま記録する。

### 4.2 状態・証拠の保持

既存K1結果とK2 keyを使う。接続結果はconnection identity、operation identity、scope、契約・依存の使用時revisionに結び付く。完全一致しないresultはcurrent resultに流用しない。L5 record候補はraw payloadを保持せず、必要な内容照合はcontent digest/referenceに限定し、その参照のauthorityと保存条件は元ownerの既存契約に従う。missing event/order/endpoint/receipt/handoffはpositive completionを作れない。K5のappend-only事実、K6の検証receipt、K7のgeneration pointer/fencing、OS ownerのoperation/attempt観測は異なる役割を保つ。

### 4.3 既存結果classへの写像

K1の外側result classだけを既存`Observed<T>`の値として使う。完全なResultKeyを構成でき、参照先の読み取れたcurrent sourceに必須宣言、event/evidence refまたは測定根拠が存在しない場合は`Unknown(missing_input)`、同一identity・revisionの固定bytesが矛盾する場合は`Unknown(conflict)`、current owner登録にないrevisionは`Unknown(unregistered)`とする。ResultKeyの必須identity/ref自体を構成できない場合は既存K1/K2 key boundaryの`Rejected(missing_key)`とし、架空SubjectRefやK1 Unknownを作らない。既存sourceが`Unknown`を返した場合はそのreasonとevidenceを変えずに保持する。以前保存した`Value`のrevisionをcurrent照会で使う場合だけ既存K2 lookupが`Stale`を導出する。単にread-only照合でsend queryを呼んでいない状態は別projection `send_eligibility=not_evaluated`でありK1 resultではない。送信attemptが実際に開始されていないときはattempt 0を保持する。K3 permission denialは`PermissionCheckResult.combined`の否定として保持し、K3 diagnosticsは`PermissionCheck`のunionのまま扱う。新しいK1/K3 reason・domain result型を追加しない。

## 5. API前後条件と失敗の局所化

1. `validate_connection_declaration`はsource/consumerのcurrent declarationを入力から欠落させず、登録可否を純粋に照合する。明示されたregistration-onlyはdeclared結果として扱えるが、永続登録や送信許可の発行ではない。矛盾・欠落は該当する宣言ownerへ返す。実登録は既存K5 writer/owner境界を特定できる場合だけ別操作で行い、その正本化が未観測ならUnknown/Unobserved。
2. `compare_compatibility`は宣言済みscope内のrevision pairだけを比べる。登録時とcurrentを混同せず、current pairが読み取れない場合はUnknown/Unobserved/Staleを保つ。再照合前にsendを呼べないようL6で同一operation bindingへ渡す。
3. `check_send_eligibility`はcompatibility checkの代替ではない。既存ownerがcurrent `OperationDecl`として宣言したsend operationが解決できる場合だけ呼び、CONNECTからoperation kindやOperationDeclを新設しない。該当するowner宣言がないoperationはその操作だけ局所未決とし、queryを構成しない。既存SECURITY/data-use参照が適用されるsend操作のみ照合し、authority recordが不足ならその操作だけ非肯定とする。K3へ渡すqueryは既存`PermissionQuery{operation,target,revision,requested_scope,operation_inputs}`であり、callerから申告されたoperation値だけで宣言を代用せず、actor/environmentもcaller contextから受理しない。上表の7軸は照合対象の所在を表し、actorはcurrent OS assignment、environmentはcurrent INFRA environment declarationからK3 `resolve_authority_context`が解決する。expiryは既存permission recordの値、authority refはSECURITY current permission sourceへの参照として扱う。各sourceが解決できない場合は既存K3診断を保持し、callerが不足軸を埋めない。
4. endpoint bindingは一つのidentity/operation/contract revisionに対する2端点観測を独立に保持する。片端receiptのみ、結果不一致、contract外envelope、handoff欠落は端点のsuccess扱いをせず、該当端点owner/receiver business ownerへ戻す。
5. retry assessmentは候補判定でありsend effectを持たない。実際のattemptは既存OS/CONNECT運転責任へ残し、L4にない上限・backoff・recovery operationを加えない。
6. trace候補は既存K5 `DeclaredEvent{event_type,refs}` ref列を読み、`event_type`がownerのcurrent `LogDecl.event_types`に含まれることと入力ref完全性を純粋に照合する。訂正の対象は既存K5 §9.4 K5-I8のとおり`DeclaredEvent`またはそれを根とする`Correction`の木だけであり、`ResultRecorded`を訂正対象へしない。event提案はK5 writerへ渡す前の照合であり、このAPI候補自身はappend/writeしない。K5 appendの`Rejected(reason)`をK1 resultへ変換しない。missing required inputはK1 `Unknown(missing_input)`、一意に順序比較できない場合は既存K1理由を保持し、記録済み完了にせずunfinishedとしてoperation ownerへ戻す。

未登録source/owner、未知physical route、未観測permission、未証明receipt provenanceはそれぞれ該当操作の入力観測をUnknown/Unobservedとする。別軸のpositive、他接続のrecord、技術receiptで補わない。全operationを一律停止するgateにはしない。

## 6. AC/NFRへの設計trace

| 親 / AC | L5 component | 固定L10 verifier |
|---|---|---|
| `001` / `CONNECT-AC-001-01` | descriptor validation、owner declaration binding、登録候補の適合判定 | 既存L9 verifier `IV-CONNECT-S1-001-01`〜`001-08` |
| `002` / `CONNECT-AC-002-01` | current/registered revision comparison、read scope、send eligibility分離 | 既存L9 `IV-CONNECT-S1-002-01`, `IV-CONNECT-S1-NFR-003` |
| `003` / `CONNECT-AC-003-01` | endpoint observation binding、receipt refs、unfinished handoff | 既存L9 `IV-CONNECT-S1-003-01` |
| `004` / `CONNECT-AC-004-01` | retry assessment、same ID/digest、contract bound limit | 既存L9 `IV-CONNECT-S1-004-01`, `IV-CONNECT-S1-NFR-001`, `IV-CONNECT-S1-NFR-002` |
| `005` / `CONNECT-AC-005-01` | append trace, observation completeness, evidence minimization | 既存L9 `IV-CONNECT-S1-005-01`, `IV-CONNECT-S1-NFR-004`, `IV-CONNECT-S1-NFR-005` |
| fixed business boundary | no business-completion projection from technical status | 既存L9 `IV-CONNECT-S1-BIZ-001` |

名前付きNFRを持たない001/003へ候補を割り当てない。5 NFR候補の測定条件は対のL8が既存L9 verifierへ対応付け、値未宣言の候補は未評価のままとする。L8はL9 verifier IDやoracleを再定義しない。
