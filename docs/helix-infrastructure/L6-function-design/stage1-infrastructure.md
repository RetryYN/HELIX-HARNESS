---
title: "HELIX-INFRASTRUCTURE Stage 1 関数設計"
canonical_vmodel: L1-L12
canonical_layer: L6
canonical_pair: L7
layer: L6
kind: function_design
status: draft_candidate
authority_status: draft_candidate
stage: 1
paired_l5: ../L5-detail-design/stage1-infrastructure.md
paired_l7: ../L7-unit-test-design/stage1-infrastructure-unit-test-design.md
---

# HELIX-INFRASTRUCTURE Stage 1 関数設計

本書は、INFRA Stage 1のL5詳細設計を関数・値境界へ下ろす設計候補である。親は採択済みL2-001とL2-006、L2-005は006の該当する復旧義務を読む入力依存である。親の意味、7 functional AC、34 functional case、6 NFR obligation、businessの独立oracleなしという境界を維持する。設計入力は合成可能な参照と既存型の観測値であり、実環境sourceを読む処理、物理操作、状態変更、許可発行を含まない。

## 1. 固定入力と状態

| 文書 | 固定対象 | SHA-256 / 状態 |
|---|---|---|
| L4 INFRA | `docs/helix-infrastructure/L4-basic-design/stage1-infrastructure.md` | `84756e019c04744ede7825518e4a153f1373260df1b972c5651ade7824ab9dec`、origin/mainの固定本文 |
| L9 INFRA | `docs/helix-infrastructure/L9-integration-verification/stage1-infrastructure-integration-verification.md` | `b83eee2452ec0b41ef23ffd6a3aea3e1374f82dbffc3e8c7bb54908b01ae9d8b`、origin/mainの固定本文 |
| L5 INFRA | `docs/helix-infrastructure/L5-detail-design/stage1-infrastructure.md` | `ccf2c64f9312bb9c90ab46500bbb02373c87868af2dc5a7eb5be9b5f65de9f1a`、#2752でorigin/mainへ統合済みの固定本文 |
| L8 INFRA | `docs/helix-infrastructure/L8-detail-verification/stage1-infrastructure-detail-verification.md` | `27dee2a416ec806b05c35fcf97c365df14259a380302c72ecc95f5c5972de5dc`、同main上の固定本文 |
| Common Kernel L4 | `docs/helix-harness/L4-basic-design/common-kernel.md` | `3f7245e8fb548bab199107b1a020f0efea08713a5299076988326dae9feeb696`、origin/main `7715e7025212ea1a778ab9711e2f43241f7999c7` |
| Common Kernel L9 | `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md` | `77f81138f3e323d98c16c7ea6c3be38e66d2aa36fc5a6b79986b6826e3facf52`、同main |

L5/L8は#2752でmainへ統合された固定本文であり、採択済み親L2-001/L2-006の詳細化と、L2-005の適用範囲を保持する。上記hashはorigin/mainのexact bytesを識別する。L4/L9の固定本文が変わった場合、この候補の対応は再照合が必要となる。固定親の詳細とL3/L10全体pinはL4/L5/L8を参照し、ここではfunctional AC/caseだけへ承認scopeを狭めない。

現Common Kernel参照は上記mainのbytesに固定する。K1 `Observed<T>`とpolarity、K2 `SubjectRef`/`ResultKey`、K3の既存5-field `PermissionQuery`とcurrent owner resolver、K5 evidence projection、K6 read receipt、K7 generation pointer/EpochToken fencing、K10 dependency closureを既存型のまま利用する。K7 pointer/fencingをOS operation/attempt stateとして扱わない。L5の歴史的Common Kernel pinsはL5が記録する履歴snapshotであり、現在mainのbytesと混同しない。

旧source traceはL5 §2を引き継ぐ。参照対象はF542125805B777D8A56A（旧phase pair）、17C4BF78919578FEBB18（resource/credential/rollback意味）、F46AB11BD14F2C0469F4（negative acceptance形）、653A097F9C9EE51F6FDD（旧topology）、235F57A4DC453383E6C7（資源制約概念）で、asset全文SHAと読取span、保持・再導出・置換理由はL5に列挙される。旧実行系・旧テスト・旧runtimeは参照実行しない。

## 2. 共通値と関数境界

以下はPython 3.11標準ライブラリで表現できる純粋な関数設計候補である。CPython選択は既存Common Kernel L6のPython 3.11+候補と現Stage 1 local-CI文書のCPython/stdlib runtime前提との整合に限る。INFRA L3/L4は特定言語を要求しないため、これは技術的具体化であり親要件ではない。Bunは候補にしない。実際のtoolchain、module path、source reader、owner bindingは実装時に対象の固定宣言を解決する必要があり、本書はそれらが存在すると仮定しない。

```text
SourceObservation[T] = {
  subject: SubjectRef,
  value: Observed[T],
  owner_ref: Observed[SubjectRef],
}

InventoryProjection = {
  scope: SubjectRef,
  resources: Sequence[ResourceProjection],
  source_refs: Sequence[SubjectRef],
}

ResourceProjection = {
  identity: SubjectRef,
  fields: Mapping[ResourceField, SourceObservation[ExistingDomainValue]],
}

EnvironmentComparison = Mapping[EnvironmentAxis, Observed[ExistingDomainValue]]
PathProjection = {logical_ref: SubjectRef, physical_paths: Sequence[PathProjectionItem]}
StorageProjection = {identity: SubjectRef, fields: Mapping[StorageField, SourceObservation[ExistingDomainValue]]}
PermissionQuery = {operation, target: identity, revision: SubjectRef, requested_scope,
                   operation_inputs: Mapping[identity, SubjectRef]}
OperationCheckInput = {kind: ExistingInfraOperationKind, target: identity, revision: SubjectRef,
                       requested_scope, operation_inputs: Mapping[identity, SubjectRef], current_owner_declarations}
OperationCheck = PermissionCheckResult | PermissionCheckDiagnostic
```

`ExistingDomainValue`、`ExistingInfraOperationKind`は既存L2/L4/L5/owner宣言から得る値で、新しいenum、reason、authority recordではない。`owner_ref`の未解決は既存K1 `Observed[SubjectRef]`のunknown/unobserved状態で表し、sentinel variantやreasonを足さない。OS operation/attempt observation型のowner宣言が見つからなければ、そのrefは未解決のまま残り、そのoperation観測だけ保留する。secret/credential本体をこの型へ置かない。

| 関数ID | 可視性・候補名 | 入力→出力 | 処理と既存境界 |
|---|---|---|---|
| `INFRA-L6-FN-01` | 純粋、`bind_inventory_inputs` | scope ref、role-bound source refs → K2 `ResultKey`候補または既存K2診断 | roleと元SubjectRefを保持し、同一表示名を同一identityにまとめない。K2の既存key生成・拒否順を呼び出し側境界として再利用する。raw source readはしない。 |
| `INFRA-L6-FN-02` | 純粋、`project_resource_observation` | source-qualified observations → resource projection | identity、role、environment、location、version、dependency、lifecycleの既存fieldを独立に写す。完全読取済み不存在と読取不能/部分/未登録を混同しない。値不在表現が既存owner契約にないfieldは捏造せず局所未決。 |
| `INFRA-L6-FN-03` | 純粋、`compare_environment_axes` | 2つのresource/environment projection → 8 axis結果 | scope/version/authority/source/config/network/credential-scope/dataを個別比較する。同じ名称でもidentityを潰さず、元Observedとsource/revisionを保持する。 |
| `INFRA-L6-FN-04` | 純粋、`project_path_and_storage` | CONNECT/INFRA refs、source observations → logical path・physical path・storage projection | logical connectionと各physical pathを別identityにする。8 path軸と6 storage属性/recovery refを個別に写す。接続、疎通、classification、backup完了を推定しない。 |
| `INFRA-L6-FN-05` | 純粋、`prepare_operation_check` | INFRA kind、target identity、revision `SubjectRef`、requested scope、operation inputs、current declarations → `PermissionQuery`と`PermissionCheck` | 既存owner `OperationDecl`に対応がある場合だけそのactionを`operation`へ束縛する。queryは`{operation, target, revision, requested_scope, operation_inputs}`の5 field。actor/environmentはquery fieldでなく、K3 `resolve_authority_context`がcurrent owner declaration/assignmentから内部解決する。INFRA kindをK3 enumへ直写しない。bindingやcurrent owner inputが解決できない場合はそのoperationだけ既存K3非肯定結果へ留める。permission結果は操作命令ではない。 |
| `INFRA-L6-FN-06` | 純粋、`record_operation_observation` | OS owner observation refs（宣言済みの場合）、K5 evidence refs、適用L2-005 duty refs → 参照保持projection | result/revision/未完義務を別refとして保持する。K5/K7への書込み、operation/rollback/recoveryの起動はしない。OS operation/attempt型が未宣言ならその観測だけ未決。古いsuccessでpartial/failureを上書きしない。 |
| `INFRA-L6-FN-07` | 純粋、`summarize_nfr_observations` | L9 NFRごとのfixture observations → source-qualified count/unknown refs | fixture母集団、分母、unknown、未実施を分けて記録する。unknownを除外せず、分母不明を0や合格へ変換しない。NFR候補値から実測・SLO達成を作らない。 |

K1の出力は既存`Value/Unknown/Unobserved/Stale/NotApplicable`のみであり、`missing`の新classを作らない。K2のRejectedはK2 API境界に留め、K1 `Observed`へ混ぜない。K3 resultは既存`PermissionCheckResult | PermissionCheckDiagnostic`のまま。K5/K6 receiptは読取/evidence参照であってsource真正性・物理適用の証明ではない。K10 dependency closureとK6/K5 physical observationは別の入力とする。K9独立reviewの設計記録を物理観測の代替にしない。

### 2.1 Operation eligibilityの処理順

1. `kind`が固定5分類のいずれかを表す既存入力であることを保ち、操作を呼ばない。
2. target、対象revision、scope、expiry、独立authority refと各source revisionを別々に束縛する。
3. 既存owner `OperationDecl`のbindingがある場合、そのactionをK3 queryの`operation`に束縛する。queryは`operation`、target identity、`revision: SubjectRef`、`requested_scope`、`operation_inputs`の5 fieldに限る。actorとenvironmentはqueryへ足さず、K3 `resolve_authority_context`がcurrent OS assignmentおよびINFRASTRUCTURE environment declaration等のcurrent owner情報から内部解決する。
4. K3既存resolver/checkの完全queryとrecord照合結果を保持する。owner binding、current assignment、environment declaration等の必要なcurrent sourceが解決できない場合はK3既存の非肯定結果を保持し、その影響operationだけに留める。resource `ready`、environment名、OS停止、path existenceからpermissionを導かない。
5. 該当するrollback/recoveryにだけL2-005 duty inputを結ぶ。duty不明・未充足は該当するstate-changing operationだけに留める。health-checkはread-only。
6. check結果、K5 evidence refs、OS owner observation refs、K7 pointer/fencing refsは混ぜずに保持する。operation実行結果を本関数が生成しない。

K3 queryにactor/environmentを入力させない。`resolve_authority_context`はcurrent assignmentと各ownerのcurrent declarationからactor/environment等を解決する。INFRA `kind`からK3 operationを推測せず、既存owner `OperationDecl`によるaction bindingが見つからない場合は影響するoperationだけ未決とする。current sourceが解決できない場合も、K3既存型の非肯定結果をそのまま保持し、独自reasonや承認gateを追加しない。

## 3. NFR・businessの関数への対応

| 固定義務 | 関数 | 関数設計に保持すること |
|---|---|---|
| `INFRA-NFR-001-01` | FN-02/03/07 | fixture内resource 7属性、environment 8軸、CORE/runtime revisionをsource-qualifiedに追跡する。実環境全数は主張しない。 |
| `INFRA-NFR-001-02` | FN-04/07 | 各path 8軸、storage 6属性とrecovery ref。unknown/欠落fieldを明示しcomplete扱いしない。 |
| `INFRA-NFR-001-03` | FN-04/07 | logical connection identityとphysical path identityを分離し、誤併合をfixtureで検出する。 |
| `INFRA-NFR-006-01` | FN-05/07 | target/action/revision/scope/別SECURITY authority/expiryの6条件を個別に比較する。credential値を保存しない。 |
| `INFRA-NFR-006-02` | FN-05/07 | 固定5 operationと停止中OS/control-plane routeのfixture coverageを別々に数える。6番目のoperationや自動failoverを要件化しない。 |
| `INFRA-NFR-006-03` | FN-07 | 5秒×3回等の承認済み候補、比較候補、遅延/未応答/途中復帰を測定candidateとしてsource付きで比較する。SLO、incident/severity、実測合格は生成しない。 |

固定business L3/L10には独立business outcome/test oracleがない。FN-07も業務成功・incident closure・復旧完了・費用/配置の採否を出力しない。

## 4. 局所未決と責務の引渡し

| 境界 | 現在決まっていること | 未決の局所範囲 |
|---|---|---|
| Source reader / physical observation | L4/L5は宣言source refsと観測sourceを分離し、K6/K5の既存境界を使う。 | 実readerの登録、source bytes取得、物理path/storageの現物観測が存在するか。未解決なら当該fieldだけUnknown/Unobserved。 |
| Owner mapping | resource/CONNECT/SECURITY/OSの既存owner責務を親記述どおり参照する。 | 個別ownerのcurrent declarationとINFRA kind→K3 action対応。不存在/不整合はそのoperationだけ未決。 |
| K3 actor/environment | K3 `resolve_authority_context`がOS current assignmentとINFRASTRUCTURE current environment declaration等のcurrent owner情報から解決する。 | current owner sourceやaction bindingが解決できない場合はK3既存の非肯定結果を保持し、該当operationだけを未決にする。 |
| OS operation/attempt | K7 generation pointer/fencingは参照できるがoperation resultを表さない。 | OS ownerがoperation/attempt observation refと型を宣言しているか。未宣言ならその観測のみ未決。 |
| Source authenticity | K6 receiptの既存保証限界を維持する。 | receipt issuer真正性が証明されていない場合、それをpassとして扱わない。物理適用を推測しない。 |
| NFR measurement | L9が定めるfixture範囲と技術候補だけを記録する。 | 未実施・分母不明・実source欠落。unknownを除外せず未測定として扱う。 |

L4/L9/L5/L8に既にある未決は、影響するsource field・operation・caseだけに留める。要求意味やscopeを変更する必要が判明した場合のみ上流L2へ返す。新owner、permission/reason、許可gate、物理operation APIは作らない。

## 5. L7との対応

L7は本書の関数IDと現L9の全40 oracle IDに1対1の設計fixture locatorを付ける。L9 ID自体は再定義・再採番しない。L7の期待値は合成fixture上の設計期待であり、実装・実source観測・CI実行・L10合格を意味しない。
