# HELIX リポジトリ構成 L4基本設計（正本の一意化・release／切替／実行・公開範囲・recordsの物理配置）

status: design_pair_defined
owner: HELIX-HARNESS（工程の標準と検証義務の所有。共通カーネル15.5の配置の具体化。各領域へ書く主体は2章の表のとおり機構ごとに分かれる）
parent_requirement: なし（一つの親要求を定めず、規則ごとに承認済みL3のACまたは判断記録へtraceする。2026-10-08のPO判断の判断2。1.2を参照）
paired_l9: ../L9-integration-verification/repository-layout-integration-verification.md
base: main `66abf6bf158baebc6bfceb5ccf693d425aae41a9`（付録Aは引用baseの固定bytesを示し、本文リンクはcurrent pairを相互参照する）

`design_pair_defined`はL4契約と対のoracleを定義した状態のみを表し、review済み・承認済み・実装済み・実行済み・合格とは同義でない。

本書は、2026-10-09のPO判断（`docs/governance/decisions/repository-layout-and-source-visibility-po-decision-2026-10-09.md`、以下「構成判断」）の判断1の基本案と「L4で具体化する論点」1〜4、および判断2（開発ソースの公開）を、L4/L9 pairの基本設計として具体化する。共通カーネル（`docs/helix-harness/L4-basic-design/common-kernel.md`、以下「CK」）の型と不変条件を参照し、重複して定義しない。共通カーネルの対応契約は10章のcrosswalkからcurrent CK L4/L9へ接続する。

本書は実装、ディレクトリ（`helix/`、`declarations/`、`records/`）や空の文書の作成、新世代CI、release、内部デプロイ、配布repoの作成・切替、visibility・LICENSE・branch protectionの変更、新しい承認手続きを生成しない（構成判断「本書から生成しないもの」）。

## 1. 範囲と由来

### 1.1 決めること・決めないこと

決めること：最上位の各領域の責務、パックのフォルダの中身、正本の所在（同じ項目を二か所に書かない規則）、ReleaseManifestと切替・実行観測の区別、repoへ入れないもの、配布の投影、recordsの物理pathの符号化と整合性の前提、依存の向き、検証コードの置き場、root configの原則。
決めないこと：言語・ツールチェーン・ビルド方式（L5／L6）、内部デプロイの実際の許可、段階の実行環境の具体（INFRASTRUCTURE）、保護の強制手段（8章は新規案）。

### 1.2 由来

| 規則 | 由来（承認済みL3のACまたは判断記録） | 要点 |
|---|---|---|
| 2章の最上位構成 | 構成判断 判断1 | 直下に`docs/`・`declarations/`・`helix/`・`records/`、repo外に成果物ストア・段階の実行環境・instanceの状態・配布repo |
| RL-C1〜C7（3章） | 方針6（`docs/governance/decisions/po-l3-l10-post-confirmation-and-internal-deployment-policy6-2026-10-08.md:59-70`）、`AC-HARNESS-L3-010-01`・`010-04`（`docs/helix-harness/L3-requirements/functional-requirements.md:37,41`）、`AC-OS-014-04`・`014-09`（`docs/helix-os/L3-requirements/functional-requirements.md:24,29`）、構成判断 論点1 | 型番台帳が正本、pathは正本でない、項目はHARNESS-L2-010とHELIXOS-L2-014のものだけ、内部デプロイの状態は台帳に書かない |
| RL-R1〜R8（4章） | `AC-OS-014-01`・`04`〜`08`（同:21,24-28）、`AC-HARNESS-L3-010-03`・`021-03`（HARNESS L3:39,483）、`INFRA-002-AC-01`（`docs/helix-infrastructure/L3-requirements/functional-requirements.md:109`）、`INFRA-005-AC-03`（同:287）、Concept原則9（`docs/concept/helix-concept.md:310`）・`:225`、方針1・3（`docs/governance/decisions/stage-release-internal-deployment-po-decisions-2026-10-07.md:38-61`）、`SECURITY-AC-013-01`（SECURITY L3:236）、CK 11.2〜11.3（G8-I2・I3・I5・I6）・15.2（K7-I3）、構成判断 論点2 | releaseとdeploymentの分離、一組の保存、build・検証済みと実行artifactの同じ鎖、design／target／actualの分離、案件state・recordを巻き戻さない、開発中treeに依存しない |
| RL-V1〜V6（5章） | 構成判断 判断2・論点3、AGENTS.md「現在の境界」、`AC-OS-014-05`、`SECURITY-AC-005-01`（`docs/helix-security/L3-requirements/functional-requirements.md:124`）、`SECURITY-AC-015-01`・`FR-016-01`（同:264,268-270）、Concept `:276-279`、`docs/governance/decisions/commercial-license-po-decisions-2026-09-27.md:22-30` | 開発ソースはpublic、secret等はrepoへ入れない、配布はHELIX自身を育てる部分を同梱しない、配布先はprivate |
| RL-P1〜P9（6章） | 構成判断 論点4、CK 9章（K5）・15.2（K7-I2）、`CONNECT-AC-005-01`（`docs/helix-connect/L3-requirements/functional-requirements.md:109`） | 論理IDはmanifest、物理pathは安全に符号化、Git履歴だけで追記専用性や真正性を主張しない |
| RL-D1〜D5（7章） | `AC-HARNESS-L3-010-01`、`AC-OS-014-07`、CK 1.2・判断2（共通カーネルの所有）、構成判断「旧HELIXとの対応」3行目、AGENTS.md（scaffold・archive） | 宣言のない依存を実行時に使わない、機構をまたぐ結合はconnection、段階は開発中treeに依存しない |
| RL-T1〜T3（9.1） | 構成判断 判断1「検証コードはパックの種類に対応させる」、`AC-HARNESS-L3-014-02`（HARNESS L3:177）、`AC-OS-014-05` | unit／connection／compositeの義務を別々に検証へ対応させる |
| RL-K1〜K3（9.2） | 構成判断 判断1「root configは増やさない」・「旧HELIXとの対応」1行目。RL-K2のBun不使用は`HELIXOS-L2-132`の`MPR-RC-HELIXOS-L2-132-003`（`docs/governance/decisions/po-decision-2026-10-03-pending4-bun.md:27,33`、2026-10-03のPO判断「今後のBun使用も禁止」） | root configの具体を旧から引き継がない。HELIXの開発・実行・検証・配布のsurfaceでBunを使わない |
| 8章 保護のpath分類 | なし（**新規案**。11章へ） | — |

各ACの承認は`docs/governance/l3-l10-po-post-confirmation.md`の各行が示す判断記録による。開発repoの運用規則を製品の要求の根拠にしない（`docs/governance/decisions/l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md` 判断3）。本書の規則のうち開発repoそのものの構成（2章、8章、9.2）は構成判断を由来とし、製品の要求として扱わない。

## 2. 基本配置と各領域の責務

| 領域 | 置くもの | 書く主体 | 置かないもの |
|---|---|---|---|
| `docs/` | 人が読む意味の正本（Concept〜L12、判断記録、governance）。V字の各層の検証設計の正本 | 各層の所有者 | 機械が実行時に読む宣言、実装、記録の本体 |
| `declarations/<enc(所有機構)>/<enc(種類)>/<enc(identity)>.json` | パックをまたぐ機械可読の宣言（CKの`LogDecl`、`ScopeDecl`、`OperationDecl`、`VerifierSet`、`GraphDecl`、`GraphRules`、`ConditionState`、`RelationVocab`、`AuthorityDecl`、`RecipientMap`、`RecipientDecl`、5章の`DistributionProfile`） | 宣言の所有機構 | パックの宣言の項目（RL-C2）、記録、意味の本文 |
| `helix/<enc(機構)>/{units,connections,composites}/<enc(型番)>/` | `declaration.json`（そのパックまたは構成体の宣言）、`src/`、`tests/`、`fixtures/`（合成dataだけ） | パックの所有者（compositeはOS） | 他パックの実装、実案件data、生成物 |
| `records/<enc(log_id)>/` | `store: repository`と宣言したK5のlog（RL-P8）。`manifest.jsonl`と`segments/<enc(writer_id)>/<segment_no>.jsonl` | 各segmentのwriterとmanifest_writer | 機密を含む記録、instanceの実行記録、段階の実行時の記録 |
| `scaffold/`、`archive/`、`.github/` | 現行のまま | 現行のまま | — |
| repo外：成果物ストア | 版とdigestで固定したartifactとReleaseManifest（content-addressed、不変） | OS（生成・配布の運転） | — |
| repo外：段階の実行環境 | `store: stage`のlog（`PointerLog`、`RequestLog`、`EpochLog`、4章の`RuntimeLog`）、実行中の世代 | OS（pointer）、INFRASTRUCTURE（実行の観測） | 開発中のtree |
| repo外：instanceの状態 | 案件data、案件state・record、実行時の記録、LABOのepisode・評価corpus、学習の履歴 | 各所有機構 | — |
| repo外：配布repo（private） | 5章の投影の結果 | OS | 投影外のもの |

`enc`は6.1の符号化である。`<enc(機構)>`は機構の名前（`helix-harness`等）を符号化したもので、現行の機構名はそのまま残る。

## 3. 正本の一意化（論点1）

### 3.1 項目と正本の所在

| 項目 | 唯一の正本 | 他所からの参照 |
|---|---|---|
| 要求・設計・検証設計の意味 | `docs/` | 宣言・実装は`(GitRevision, path)`とdigestで参照し、本文を写さない |
| unit・connectionの宣言。識別項目：identity、版と成熟度、ownerの種別とidentity。構成項目：入力・出力の契約、依存の種別・identity・版、検証範囲とoracle、収載・非収載（いずれも`AC-HARNESS-L3-010-01`） | パックのフォルダの`declaration.json` | 台帳は`declaration_digest`で参照する |
| compositeの宣言。識別項目：identity（段階の型番。`AC-OS-014-01`のstage ID）、版、owner（`AC-OS-014-09`。OS）。構成項目：packと依存のidentityと版、configuration、data format、対応環境、能力と制約、更新・rollbackの条件（`AC-OS-014-04`から受入の証拠を除いたもの） | 構成体のフォルダの`declaration.json` | 同上 |
| compositeの成果物の組（`ArtifactRef`。CK G8-I6） | ReleaseManifest（4章） | 台帳・pointerはmanifestの`SubjectRef`で参照する |
| compositeの「scope内の受入の証拠」 | `ReleaseEstablished.eligibility`（4章。manifestから導いた鍵の結果） | — |
| パックをまたぐ宣言 | `declarations/` | `FixedRef`（CK 9.3）で参照する |
| 型番の登録の事実 | 型番台帳（CK 15.4のK5のlog `model-number-ledger`） | — |
| 内部デプロイの状態 | どこにも書かない。CK 15.4のとおり`PointerLog`の`PointerMoved`と同じmoveの`MoveAuthorizationObserved`から導く | `ledger_view` |
| releaseの成立 | `release:<target>`のlogの`ReleaseEstablished`（4章） | — |
| 実行の観測 | `RuntimeLog`の`RuntimeObserved`（4章） | — |

### 3.2 規則

- **RL-C1 一つの項目は一か所**：3.1の各項目を、表の正本以外に値として書かない。他所は識別子とdigestで参照する。識別項目（kind、identity、版、owner）は台帳と宣言を結ぶ鍵として両方に現れ、値の写しとは扱わない。両者が一致しなければ`Unknown(conflict)`とする。それ以外の同じ項目が二か所に値として現れれば、その項目は`Unknown(conflict)`とし、どちらも使わない。
- **RL-C2 `declarations/`はパックをまたぐものだけ**：3.1の「unit・connectionの宣言」「compositeの宣言」の項目を`declarations/`に置かない。置かれていれば`Unknown(conflict)`。パックの宣言・compositeの宣言は、kindごとの3.1の識別項目・構成項目と封筒（`schema_version`、`kind`）以外の項目を持たない。識別項目は既存の型番・版・所有を表すもので、新しい要求項目ではない（CK 15.4の`ModelNumberDeclared{kind, identity, owner}`と同じ）。識別項目・構成項目が一つでも欠ければ`Unknown(missing_input)`。この判定は受口`check_decl_items(declaration, kind) -> Combined`が、項目ごとに`{C2, 項目名}`の識別付きの成分として出す（C3・C4の照合とは別の受口）。持てば`Unknown(unregistered)`（CK 15.4「新しい項目は足さない」、方針6）。内部デプロイの状態の項目を持つ宣言も同じ。
- **RL-C3 登録して初めて使える**：台帳の行は`ModelNumberDeclared{kind, identity, owner}`と`VersionRegistered{identity, version, declaration: FixedRef, declaration_digest}`とする（共通カーネルL4 §15.4の`VersionRegistered`。10章の対応表に記載）。パックの宣言は、評価するrevisionでの`declaration.json`のbytesのSHA-256が、同じ`(identity, version)`の`VersionRegistered`の`declaration_digest`と一致する場合だけ使える。登録が無ければ`Unknown(unregistered)`、同じ版でdigestが違えば`Unknown(conflict)`（CK K2-I2の2）。パックに型番を書いただけでは登録済みにしない（構成判断 論点1）。
- **RL-C4 pathは正本でない**：identity、owner、kindは`declaration.json`の内容から読む。フォルダ名は照合だけに使い、`enc(identity)`・`enc(owner機構)`・kindのフォルダと一致しなければ`Unknown(conflict)`。フォルダの一覧をパックの一覧として扱わない（`AC-HARNESS-L3-010-04`）。同じidentityを宣言するフォルダが二つあれば`Unknown(conflict)`。
- **RL-C5 欠落**：台帳に登録された型番のフォルダまたは`declaration.json`が評価するrevisionに無ければ`Unknown(missing_input)`。`declaration.json`の無いフォルダはパックとして数えない（`Unknown(missing_input)`の所見とする）。
- **RL-C6 内部デプロイの状態**：CK 15.4の規則を保つ。台帳・宣言・ReleaseManifestに内部デプロイの状態を書かない。
- **RL-C7 意味の写し**：`declarations/`と`declaration.json`は、`docs/`の要求・ACを識別子とdigestで参照し、文面を写さない。写しと原本が食い違っても写しを使わない（Concept原則7、`docs/concept/helix-concept.md:308`）。

## 4. releaseと切替と実行の区別（論点2）

### 4.1 型

```text
ReleaseManifest = 成果物ストアの不変実体。identityはrelease_id、digestは全bytesのSHA-256
  { release_id, target: identity（段階の型番）, composite: SubjectRef（compositeのdeclaration.jsonの版とdigest）,
    source: SourceRef（CK 11.2。成果物を作ったsourceのrevisionとtreeのdigest）,
    artifacts: [{ pack: SubjectRef（台帳のunit・connectionの版）, artifact: ArtifactRef }],  # CK 11.2の完全な参照
    environments: SubjectRef[]（compositeの宣言が挙げた環境のINFRASTRUCTURE宣言の版）,
    rollback: SubjectRef（compositeの宣言の更新・rollbackの条件の版） }
ManifestRef     = SubjectRef{ kind: release_manifest, identity: release_id, revision, digest }
ReleaseLog  = K5のlog（log_id: release:<target>、store: repository）。書くのはOSの一つのsegmentだけ
  ReleaseEstablished { manifest: ManifestRef, stage_key: ResultKey, eligibility: RequiredResult }
RuntimeLog  = K5のlog（log_id: runtime:<target>:<environment>、store: stage）。書くのはINFRASTRUCTUREの観測者
  RuntimeObserved { move: entry_digest（PointerMoved）, generation, environment: SubjectRef,
                    observation: Observed<started | healthy | unhealthy>, evidence: FixedRef }
```

`environments`と`rollback`はcompositeの宣言の項目への参照であり、値を写さない（RL-C1）。manifestは検証の鍵・検証器の集合・結果を持たない（受入の証拠は`ReleaseEstablished`にだけ置く）。

**stage_verificationの鍵**（OSがstage_verificationの`OperationDecl`を`declarations/helix-os/operations/`に宣言する）：`stage_key`＝`{operation: stage_verification, operation_version: 宣言の版, subject: ManifestRef, inputs: [composite, source, 各artifact.pack, 各artifact.artifact, 各environment, rollback], scope: 宣言のscope}`。`inputs`の役割の全集合は宣言が決め、manifestの各fieldと一対一に対応させる。manifestにあって宣言に無い役割、宣言にあってmanifestに無い役割は`Unknown(conflict)`・`Unknown(missing_input)`とする（CK K2-I1・I5）。

### 4.2 流れ

1. `source`から成果物を作り（CK G8のbuild）、成果物ストアへ置く。2. ReleaseManifestを固定する。3. OSが`stage_key`を宣言とmanifestから導き、`release_eligibility`（RL-R2）を行う。4. OSが`ReleaseEstablished`を追記する（release）。5. CK 15.2の`GenerationStaged`→`request_move`→K3（CK 16.4）→`apply_move`→`MoveAuthorizationObserved`（切替）。6. 実行環境が新しい世代を起動し、INFRASTRUCTUREが`RuntimeObserved`を追記する（実行）。

### 4.3 規則

- **RL-R1 不変**：ReleaseManifestは書き換えない。内容が変われば新しい`release_id`とする。同じ`release_id`で異なるdigestは`Unknown(conflict)`。
- **RL-R2 releaseの成立**：`release_eligibility(manifest_ref) -> RequiredResult`は、OSのcurrentのstage_verificationの`OperationDecl`と`VerifierSet`、build操作の所有者のcurrentのbuildの`OperationDecl`（CK G8-I2(a)）、manifestの本体だけから鍵を導き、呼出し側やreceiptから鍵・入力・結果を受け取らない。成分は次を一つの`combine`で合成する（識別付き。CK K6-I7と同じ展開）：(a)`stage_key`についてのK6の`required`、(b)各`artifact`についてbuild操作の所有者の宣言から導いた`build_key`での`build_chain`（CK G8-I2）、(c)各`artifact`の`admit_artifact_bytes`（G8-I3）、(d)各`artifact`を`subject`とする実行物の検証の`required`（G8-I5）。`ReleaseEstablished`は、OSがこの呼出しを自分で行い`combined`が`Positive`の場合だけ追記でき、`stage_key`とその結果を記録する。読み手は`stage_key`をmanifestと宣言から導き直し、記録と違えば`Unknown(conflict)`とする。成立はpublic version・外部公開・1.0到達を意味しない（`AC-OS-014-01`、`014-08`）。
- **RL-R3 成果物の再計算**：成果物を使うたびに（検証・起動・配布）bytesのSHA-256を再計算し、manifestと違えば`Unknown(conflict)`、読めなければ`Unknown(unreadable)`。実行物の検証はCK 11章（G8）に従う。同じ`source`とbuild入力から同じdigestを得られることを再現の条件とする（CK G8-I4）（`AC-HARNESS-L3-010-03`）。
- **RL-R4 世代はreleaseを指す**：`GenerationStaged`は、`ReleaseEstablished`済みのmanifestを指し、そのmanifestの`target`が世代の`target`、`composite`が世代の`composition`とそれぞれ一致する場合だけ追記できる。K7-I3の適格性の`subject`は世代の`composition`でなく`ManifestRef`とし、成果物の参照が一つでも変われば別のmanifest（RL-R1）として旧い結果を流用しない（共通カーネルL4 §15.2および対のL9 IV-K7-03/14/15へ反映済み）。
- **RL-R5 pointerと実行は別の事実**：`PointerMoved`は目標（target）、`RuntimeObserved`は実際（actual）である（`INFRA-002-AC-01`、Concept `:225`）。`ledger_view`は「release成立」「現行の世代」「実行の観測」を別fieldで返し、どれからも他を導かない。`PointerMoved`があって`RuntimeObserved`が無ければ実行は`Unobserved(not_run)`、`unhealthy`なら、OSは`RollbackRequired`を追記する（自動で戻さない。CK K7-I5）。`Unknown`は正常な起動として扱わず、そのまま保持する。
- **RL-R6 rollbackは構成と成果物だけ**：rollbackは、かつて現行になった世代へのkind=rollbackのmove（CK K7-I3）であり、その世代のmanifestの成果物と構成へ戻す。案件のstate・recordは切替後の現在のidentity・value・historyを引き継ぎ、巻き戻さない（`AC-OS-014-06`）。移動先の`data format`が現在の案件dataを読めないと宣言・観測されれば`Rejected(not_eligible)`とし、案件dataを暗黙に逆移行しない（`INFRA-005-AC-03`）。rollbackでincidentを閉じない。
- **RL-R7 保持**：現行の世代と、rollbackの移動先になりうる世代のmanifestと成果物を消さない（`AC-OS-014-06`「priorの構成・artifactを保持」）。それ以外の保持期間は決めない（11章）。
- **RL-R8 開発中treeに依存しない**：段階は成果物ストアの成果物と宣言済みの依存だけで起動・更新・復旧する（`AC-OS-014-07`）。manifestの成果物の参照先がrepositoryのpath、作業tree、`docs/`・`records/`・`declarations/`であれば`Unknown(conflict)`（証拠に`tree_reference`）。案件data・secret・credentialを成果物に含めない（`AC-OS-014-05`）。隠れた依存はgraph上の参照だけから推測せず、repositoryを置かない環境での起動で確かめる（L9 IV-RL-18）。

## 5. 公開の範囲（論点3）

- **RL-V1 開発repoはpublic**：内部実装（CORE、LABO、INTELLIGENCE等）を含む開発ソースはpublicの開発repoに置く（構成判断 判断2）。repoのどの領域も非公開と仮定しない。LICENSEは全権利留保のまま変えない。
- **RL-V2 repoへ入れないもの**：secret・credentialの値（`SECURITY-AC-005-01`の「repositoryへのsecret混入」）、PII、案件data（`AC-OS-014-05`）、instanceの状態と実行時の記録（構成判断 判断1）、LABOのepisode・評価corpus・学習の履歴（Concept `:276`の「HELIX自身を育てる部分」の実行記録）、個人の絶対path。`fixtures/`は合成dataだけとする。検査はSECURITYの単一のsecret classifier（`SECURITY-AC-005-01`）を使い、本書は独自の分類器を作らない。
- **RL-V3 visibilityと分類を混ぜない**：資産の露出分類（`SECURITY-FR-016-01`の6分類とunknown）はSECURITYの分類記録が持つ。repoがpublicであることから資産の分類を導かず、分類unknownをpublicと推定しない。1.xのsinkごとの強制（同FR）は本書で1.0へ前倒ししない。
- **RL-V4 配布は宣言から投影する**：`DistributionProfile = { profile_id, revision, include: [{ identity, version }], target: identity（配布先） }`を`declarations/helix-os/distribution-profiles/`に置く（OSが配布を運転する。Concept `:277`）。投影の入力はReleaseManifestの成果物で、`include`の型番（K10の依存の閉包を含む）の成果物だけを出す。path globでは選ばない（RL-C4）。
- **RL-V5 HELIX自身を育てる部分を同梱しない**：閉包に、全体統制・学習・LABO・INTELLIGENCEの型番、Worker pool、内部memory、運用DB、CIの運転が入れば、投影は`Unknown(conflict)`で止める（Concept `:276`）。利用者へ渡す成果物と配布物にCOREのJSONとPythonを含めない（Concept `:279`の構成判断 判断2での読み）。
- **RL-V6 allowlistと閲覧範囲は別**：配布の`include`に入ることは公開を意味せず、開発repoがpublicであることは配布してよいことを意味しない。配布先はprivateとする（2026-09-27判断）。

## 6. recordsの物理配置（論点4）

### 6.1 符号化 `enc`

論理ID `s`（log_id、writer_id、型番、機構名、宣言の種類・identity）を次の手順で一つのpath要素にする。

1. `s`がUnicode NFCでない、または空なら`Rejected(invalid_id)`（NFCでない別表記の同一視を避ける。CK K5-I7はwriterをNFCで比べる）。`b`＝`s`のUTF-8のbytes。
2. `b`の各byteのうち`[a-z0-9]`と`-`はそのまま、それ以外（大文字、`_`、`.`、`/`、`\`、空白、制御文字、非ASCIIの各byte）は`_`＋小文字2桁の16進にする。
3. 結果の先頭が`-`なら`_2d`にする。
4. 結果が予約名（`con`、`prn`、`aux`、`nul`、`com0`〜`com9`、`lpt0`〜`lpt9`）に一致すれば、先頭byteを2.の形にする。
5. 結果が80byteを超えれば、`_h`＋SHA-256(`b`)の小文字64桁の16進（66byte）とする。

性質：出力は`[a-z0-9_-]`だけなので、大文字小文字を区別しないFSでも異なる入力が衝突しない。`.`を含まないので末尾の`.`・空白、拡張子の誤読が起きない。手順2〜4は`_xx`を戻せば元に戻る。`_h`は2.の形（`_`＋16進2桁）と重ならない。segmentのfile名は`segment_no`の20桁のゼロ詰め10進（u64の最大桁）＋`.jsonl`とする。repo rootからの相対pathは最長205byte（`records/`＋80＋`/segments/`＋80＋`/`＋26）である。

### 6.2 規則

- **RL-P1 論理IDは内容に持つ**：log_id・writer・segment_noは各`LogEntry.segment`（CK 9.3）とmanifestの`SegmentOpened`が持つ。読み手は内容から論理IDを得て、pathは`enc`の再計算と照合するだけとする。一致しなければそのsegmentを`Unknown(conflict)`とする。`_h`の形は内容からしか元に戻せない。
- **RL-P2 衝突**：`records/`と`helix/`と`declarations/`の全pathについて、大文字小文字を畳んだ値が一意であること、異なる論理IDが同じpathにならないことを確かめる。衝突すれば両方を`Unknown(conflict)`とし、新しい書込みを`Rejected`とする。
- **RL-P3 bytesを変えない**：`records/**`は改行の変換、filter、LFSの対象にしない（`.gitattributes`で`-text`。9.2）。読取り条件として、各行の実bytesは、その行を解析した`LogEntry`の`canonical_json`（CK 3.2）＋LF（0x0a）一つとbyte単位で一致しなければならない。CRLF、末尾の空白、BOM、canonicalでない表記、末尾にLFの無い行はいずれもこの条件に当たり、そのsegmentを損傷とする（`Unknown(unreadable)`）。`entry_digest`は改行を含まない内容から計算するため、この条件が無いとCRLF化を検出できない（CK L4 §9.4 K5-I3(h)、対の共通カーネルL9 IV-K5-24〜26へ反映済み）。
- **RL-P4 純粋な追記だけ**：`records/`に触れる各commitで、各segment・manifestのbase側のbytesがhead側のbytesの先頭と一致すること（新規fileは`seq=1`から始まり、同じかそれより前のcommitでmanifestに`SegmentOpened`があること）を確かめる。変更・削除・rename・merge時の手での解決を含む差分は`Rejected`とする。
- **RL-P5 同時のwriter**：一つのsegmentを書くのは一つのwriterである（CK 9.3）。writerは割当て・runの単位（CK 15.5）で、一つのprocessで順に追記する。別writerは別fileなので同時のbranchで衝突しない。同じsegmentへ二つのbranchが追記した場合、後から入るほうを手で解決せず、同じwriterが新しいbaseの末尾から追記し直す（K5-I2の`seq`と`prev_digest`は追記の時に計算する）。
- **RL-P6 Git履歴に頼らない**：追記専用性はK5-I3の読取り時の検査と、repo外に保持した既知の`SegmentHead`との照合で確かめる。履歴の書換え（force push）や末尾の削除は、既知のheadを持たない読み手には検出できない（CK 9.7の1）。Gitのauthor・committer・署名をK5のwriterやK6の発行者の証拠にしない。repoへ書けるのはrepoの書込み権限を持つ全員であり、writerの真正性は`Unknown(unsupported)`のままとする（CK 10.5と同じ）。
- **RL-P7 条件付き追記はrepoで行わない**：CK K7-I2の`append_if_head`（確認と追記を一つの操作にする）はGitのPRとmergeでは成り立たない。そのため`PointerLog`・`EpochLog`・`RequestLog`・`RuntimeLog`は`store: stage`とし、段階の実行環境の記録の置き場が、segmentごとの排他（一つのwriter processと排他claim、またはstorageのcompare-and-append）、同じdirectoryでの一時file・fsync・renameによる原子的な追記を提供する。これらを提供できない置き場には`store: stage`のlogを置かず、`apply_move`を行わない。
- **RL-P8 repoへ置くlog**：`LogDecl`に`store: repository | stage | instance`を持たせる（共通カーネルL4 §15.5）。`records/`に置けるのは`store: repository`のlogだけで、宣言の無いdirectoryは`Unknown(unregistered)`、書込みは`Rejected`とする。`store: repository`にできるのは、`Inline`の値型が機密を含まない型だけで、`FixedRef`がrepo内の実体だけを指すlogである。候補は`model-number-ledger`、`release:<target>`、開発repoのPRの検証receipt（CK 12章）である。
- **RL-P9 store間の参照**：`store: stage`・`instance`のlogの`FixedRef`はrepoのpathを使えないので、`FixedRef`の所在を`{store, locator, digest}`へ広げる（共通カーネルL4 §9.3）。digestが一致しなければ、所在によらず`Unknown(unreadable)`（CK 9.3と同じ）。

## 7. 依存の向き

- **RL-D1 パックごとのdefault deny**：パックが使ってよい依存は`declaration.json`の依存（種別・identity・版）だけである。宣言の無い依存を実行時に使えば不合格（`AC-HARNESS-L3-010-01`）。空の依存宣言は「依存なし」であり、未宣言の許可ではない（旧source-boundary-architecture 53-57行の保持）。
- **RL-D2 機構をまたぐ結合はconnection**：機構AのパックがBのunit・compositeを直接依存に持つことを禁じ、Bとの結合はconnectionのパックを介する（構成判断「旧HELIXとの対応」3行目）。例外は共通カーネルのパック（所有HARNESS。2026-10-08判断2）への依存だけとする。connectionのパックのownerは宣言の一つのownerであり、フォルダはそのowner機構の`connections/`に置く。
- **RL-D3 docs・records・declarationsをpathで読まない**：`helix/`のコードは、実行時に`docs/`・`records/`・`declarations/`・`archive/`・`scaffold/`をpathで読まない。宣言と記録は、宣言した入力として`FixedRef`とdigestで受け取る（CK 9.3、16.2）。段階の起動・更新・復旧は開発中treeを使わない（`AC-OS-014-07`）。
- **RL-D4 影響**：依存のグラフはK10（CK 14章）で台帳と宣言から作り、影響範囲をそこで判定する。循環は否定にしない（CK K10-I3。現行L3に循環禁止の由来は無い。13章）。本書はコードからedgeを抽出する方法を決めない（L5〜L6）。
- **RL-D5 scaffoldとarchive**：正式なパックは`scaffold/`に依存しない（Scaffold Bindingの`check-replacement`→`retire`。AGENTS.md）。`archive/`は実行しない。

## 8. 保護のpath分類（新規案）

現行のL2・L3に保護するpathを定める要求は無い。以下は設計の提案であり、強制の手段（branch protection、CODEOWNERS、検査）を決めず、新しい承認手続きを作らない。採否は11章の論点とする。

| 分類 | 対象（案） | 変更の性質（案） |
|---|---|---|
| upstream_human | `docs/concept/`、各機構のL1・L2、判断記録の本文が指す人の決定 | 人の上流の意味。AIの差分は提案に留める |
| append_only | `docs/governance/decisions/`、`docs/governance/legacy-asset-decisions.jsonl`、`records/` | 追記だけ。既存bytesを変えない |
| ai_drafted | L3以下の`docs/`、`declarations/`、`helix/` | AIが起草し独立reviewで確かめる |
| generated | （置かない。生成物は再計算できる場合だけcommitし、再計算の不一致は`Unknown(conflict)`） | 手で直さない |
| scaffold | `scaffold/` | Scaffold Bindingに登録したものだけ |
| archive | `archive/` | 読取りだけ |

旧repository-structure §6（146-150行）の正本・generated・historicalの区別を保持し、現行の層とauthorityに合わせて分けた。

## 9. 検証コードとroot config

### 9.1 検証コード

- **RL-T1 種類に対応させる**：unitの`tests/`は単体の検証、connectionの`tests/`は接続の検証、compositeの`tests/`は構成全体の検証を置く（構成判断 判断1、`AC-HARNESS-L3-014-02`）。下位の検証の合格から上位の合格を導かない。
- **RL-T2 設計の正本は`docs/`**：V字の各層の検証設計（L7〜L10）は`docs/<機構>/`に置く。`tests/`のコードは検証設計の項目IDを参照し、設計の本文を写さない（RL-C7）。検査`check_design_copy(pack, docs_revision) -> Combined`は、参照先revisionの検証設計（L7〜L10の対の文書）の段落、箇条、表の行、および表のID・規則・期待以外の欄を比較の単位とし、各単位と`tests/`の各コメント・文字列literalを同じ正規化（Unicode NFC、連続する空白を一つの空白へ、前後の空白を除く）で比べ、正規化後の文字列が一致する単位があれば、その単位ごとに否定の成分とする。成分はK1の型で次のとおり作り、各成分は完全な鍵（`subject`＝そのパックの`tests/`のtree、`inputs`＝参照先revisionの各検証設計文書、`scope`＝比較の単位の識別）を持つ（K1-I6）：(1)全件を走査した各単位について、一致が無ければ肯定の`Value`、一致があれば否定の`Value`。(2)走査の完全性の成分を一つ置き、走査したfileの集合が当該revisionの`tests/`のfileの全集合と一致すれば肯定の`Value`（K1-I7の完全走査の証拠）。コメント・literalが0件でも、完全に走査できていればこの成分と(1)の各単位は肯定である。(3)読めないfileがあれば`Unknown(unreadable)`、走査が途中で止まれば`Unobserved(not_run)`を(2)の成分とする。比較の単位が0件の場合はK1-I4のまま`set_reason`とし、K1の空集合の規則を変えない。言い換えた複製はこの検査では検出できず、独立reviewに残す。
- **RL-T3 fixtureは合成data**：`fixtures/`と`tests/`は合成dataだけを使う（`AC-OS-014-05`、RL-V2）。

### 9.2 root config

- **RL-K1 増やさない**：rootに置くのは`AGENTS.md`、`CLAUDE.md`、`README`、`LICENSE`、`.gitignore`、`.gitattributes`（RL-P3）と、L5〜L6で採用したツールチェーンが動作上rootを要する最小のfileだけとする。新しいroot fileを足すときは、本書のこの節へ理由を追記する。
- **RL-K2 旧の具体を引き継がない**：旧のNode／TypeScript／Vitest／Biome／package.jsonの設定とlockは採らない（構成判断「旧HELIXとの対応」1行目）。Bunは使わない。現行の由来は`HELIXOS-L2-132`の003（`docs/governance/decisions/po-decision-2026-10-03-pending4-bun.md:27,33`。開発・実行・検証・配布のsurfaceでBunを今後も使わず再導入しない）である。旧ADR-009 73行（旧runtimeでBunを再activationしない）は旧資産の対応として保持するが、新世代の技術選択の制約の根拠にはしない。
- **RL-K3 ツールの設定はパックへ寄せる**：パックに閉じる設定はパックのフォルダに置き、rootへ上げない。

## 10. 共通カーネルとの対応

共通カーネルの対応する契約は[共通カーネルL4](common-kernel.md)と[対の共通カーネルL9](../L9-integration-verification/common-kernel-integration-verification.md)に記載する。IV-LDG・IV-K・IV-Gは共通カーネルL9、IV-RLは配置L4に対する[リポジトリ構成L9](../L9-integration-verification/repository-layout-integration-verification.md)を参照する。ここでは契約本文を複製せず、リポジトリ構成規則から参照する受口を示す。

| リポジトリ構成の規則 | 共通カーネルL4 | 対のL9参照 |
|---|---|---|
| RL-C1〜C4（宣言、`VersionRegistered`、識別・構成項目、宣言pathとの照合） | §15.4 | 共通カーネルL9 IV-LDG-01〜02 |
| RL-R1〜R4（ReleaseManifest、`ReleaseEstablished`、`GenerationStaged`） | §15.2 | 共通カーネルL9 IV-K7-03、14〜15／配置L9 IV-RL-11〜14、41〜44 |
| RL-R5（成立・現行世代・実行観測の分離） | §15.6 | 共通カーネルL9 IV-LDG-03 |
| RL-P1〜P9（`LogDecl`、`FixedRef`、保存先、segment配置） | §§9.3、15.5 | 共通カーネルL9 IV-LDG-04／配置L9 IV-RL-24〜32 |
| RL-P3（canonical JSON bytesとLFの一致） | §9.4 K5-I3(h) | 配置L9 IV-RL-26、38／共通カーネルL9 IV-K5-24〜26 |

物理保存先の境界やreleaseの型を含む詳細は、§§3.1、4.1、6.1および上表の共通カーネル受口を参照する。

## 11. L2へ戻す論点

1. **保護のpath分類**（8章）：保護するpathと強制の要求は現行L2・L3に無い。必要なら要求として起こす（HARNESSの工程標準かSECURITYのoperation authorityか、所属を含む）。
2. **記録の保持期間**：RL-R7の範囲を越える成果物とrecordsの保持・圧縮・退避（CK 9.7の2と同じ論点）。
3. **writerの真正性と末尾の固定**：署名やrepo外の末尾の固定（CK 9.7の1、10.8）。RL-P6の未保証を解くには要求が要る。

## 12. 人の判断が要る点

列挙だけであり、本書は新しい承認手続きを作らない。

1. **判断2の「開発ソース」の範囲**：`SECURITY-AC-015-01`が識別対象に挙げるINTELLIGENCEのinternal prompts・judgment configuration、BRAINのaccumulated design knowledgeを、publicの開発ソースとしてrepoに置くか、instanceの資産としてrepo外に置くか。Claudeの読み：コードと宣言は開発ソース、蓄積した知識・episode・corpus・学習済みモデルはinstanceの資産としてrepo外（RL-V2）。
2. **Conceptの「COREのJSONとPythonは公開しない」の読み**（構成判断 判断2の最後の項のまま）。
3. **書込み権限の物理の強制**：branch protection等の変更は構成判断で生成しない。RL-P4・P6の検査を強制する手段を置くか。

## 13. 旧HELIXとの対応

旧sourceのpathは`archive/legacy-generation-2026-09-14/root/`からの相対pathである。SHA-256は本文bytesを再計算し、資産明細台帳の`source_sha256`と一致することを確かめた。

| 旧source（ID／path:行／SHA-256） | 保持する点 | 変更する点・理由 | 区分候補 |
|---|---|---|---|
| `LEGACY-ASSET-FDBA655B1CFF75DCDC0E`／`docs/governance/repository-structure.md:13-97,102-120,122-131,138,146-150,161-173`／`6f8ee784049d03279641151714c3572656eb20c64cfb769853b6e885abf4f262` | 構成の正本を一つの文書に置く。runtime state（generated）と監査証跡（tracked）を分ける。正本・generated・historicalの区別。root configの最小化。日本語file名の禁止 | `src/`・`tests/`の平置きをパックへ同居させる（構成判断）。file名の禁止規則を`enc`の符号化へ一般化する。runtime stateはrepo外へ出す。Node等の具体は採らない | `semantic_rederive` |
| `LEGACY-ASSET-A2F6A697D7FFFD490B57`／`docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md:54-58,82-93,110-115,123-127`／`336d361ec89c36ca377113aca2f08b6b510cd0127ddbba191d311cec4990c89c` | pathごとに一つの所有単位。release packetがsource SHA・artifact digest・受入・rollbackを束ねる。未信頼artifactのpath traversal・symlink・case collisionの静的検査。Release artifactの確定と環境のDeploymentを別stateにする | Module・Bundleをパックと型番台帳へ置き換え、所属をpathでなく宣言と台帳で決める。release packetをReleaseManifestへ縮め、独立review・SBOM・release noteは入れない（現行L3に由来が無い） | `semantic_rederive` |
| `LEGACY-ASSET-9B7682EBDEA171005D45`／`docs/design/helix/L3-requirements/distribution-package-release-requirements.md:22-29,41-56,75-85`／`c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` | 開発repoが唯一のsource authorityで、配布物を逆向きの正本にしない。typed allowlistからの決定的な投影。dogfood state・secret・absolute pathの除外。除外を全surfaceで強制する | Lite・`consumer_core_v1`・DevOS・standing authorizationは採らない。allowlistを型番で表す。配布先privateは2026-09-27判断 | `semantic_rederive` |
| `LEGACY-ASSET-809B35B3C91567A97AF5`／`docs/design/harness/L5-detailed-design/source-boundary-architecture.md:11-18,47-57`／`6bee024905701ca99ccd09e2a357e3b91fbf5370e4118630cfb1da5119d07610` | default denyと明示allow。EMPTYを暗黙の許可にしない（旧の失敗：32 moduleのうち29がEMPTY） | 宣言をパックの宣言へ置き、機構をまたぐ結合をconnectionに限る | `semantic_rederive` |
| `LEGACY-ASSET-67B016392E3F7D58B053`／`docs/design/harness/L5-detailed-design/module-decomposition.md:27,88-92`／`da787dcfd95b0b4011dc1979df1b6652e990f75ffb71750c6ff9c24a2a24739a` | composition rootへ配線を限る（27行） | 旧88-92行のimport循環の禁止は保持しない。旧はsource codeのimportグラフについての規則であり、現行のK10はパックと宣言の型付き依存グラフで、循環を否定にしない（CK K10-I3、14.7）。現行L3に循環禁止の由来が見つからないため、本書でも足さない。依存の判定はK10へ移す | `semantic_rederive` |
| `LEGACY-ASSET-310E87378AFE8095809C`／`docs/design/harness/L5-detailed-design/physical-data.md:33-42`／`a3064a3b705adcf0a5f76c3210aa431d87b7971aed2fe88f948a323a40c7772f` | append-onlyのJSONLを監査の記録にする。runtime stateの大半をgitignoredにする | `.helix/`とISO時刻のfile名を採らず、`records/`と`enc`、segmentの番号にする | `replace`（物理配置） |
| `LEGACY-ASSET-656F75AF81EE933415D9`／`docs/design/harness/L5-detailed-design/durability-boundaries.md:24-25,29-30,43-52`／`b6c4c6f58259b6c09f6cd52a64ab1fb7b04114a41d2b1089fdc5b9730f8666d5` | 同じdirectoryの一時file・fsync・renameによる原子的な公開。排他claimでwriterを直列化。同じpreviousから複数の候補があればconflict | `store: stage`の置き場の前提として保持する（RL-P7）。repo内では追記の検査に置き換える | `semantic_rederive` |
| `LEGACY-ASSET-F54C515C9BB8965C1F4A`／`docs/design/helix/L6-function-design/node-runtime-cutover.md:49-52,109,149`／`50e5f918079220551310bb8aaf8431e640a91ce13fd83ccb1de480ba1b9b88c1` | 非現行の不変な世代を準備してからpointer一件のCASで切り替える。活性化の記録と監視・healthを別に結ぶ | 旧のrollback receiptはDBのstate revisionも戻したが、案件state・recordは巻き戻さない（`AC-OS-014-06`） | `semantic_rederive` |
| `LEGACY-ASSET-9FD4DE252D3C27F88915`／`docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md:25-32,63-66`／`05bcaccb027a0e7bd9e82444751c961de8ac2b3102867cb5c7ba3b6babd34230` | 展開前にbytesのdigestを再計算し、manifestと完全一致させる。portableな相対pathだけを受ける。rollbackで利用者の成果を保つ | Linux／Windows smokeやnpmの方針は採らない | `semantic_rederive` |
| `LEGACY-ASSET-9A01A0B72DB343D5859E`／`docs/design/helix/L6-function-design/os-portability-supply-chain.md:39,60`／`b9976277c2d025b9ab0ae9454be97b679416e44823198d41b9b4aae127ffbc66` | separator・case・Unicodeの正規化をOSごとの差として全件評価し、未宣言の差を拒否する | OSの挙動を観測して合わせる代わりに、差が出ない文字だけへ符号化する（6.1）。symlink・権限の検査は成果物の検証（CK 11章）に残す | `semantic_rederive` |
| `LEGACY-ASSET-8195605FB59B8B837EFF`／`docs/adr/ADR-005-distribution-model-and-central-ui.md:16-36`／`dc6f09d05556442518fb09dd7fa38536562b0ab60e6947d044593500e5d3f16f` | 開発repoと配布物を分け、配布物を版で固定する | 中央Web UIと旧配布repo名は採らない（構成判断） | `semantic_rederive` |
| `LEGACY-ASSET-8771887517A619A2D501`／`docs/adr/ADR-007-harness-db-sqlite-projection.md:22`／`50c05a00872be6c23de531aaecd6a6cfd26abec264718e0223ac2630f739dcdf` | projectionはauthoring sourceでない | projectionをrepoへ正本として置かない（8章generated） | `semantic_rederive` |
| `LEGACY-ASSET-1B413588CFF3B1360B49`／`docs/adr/ADR-009-node-python-linux-runtime.md:54-56,73`／`bdd1c9a00243b723342e42531ddeabbf2f7570594943c11226d5b0461769753c` | Bunを再activationしない | Nodeの採否はL5〜L6で決める | `replace`（root config） |

`enc`の具体（`_`＋16進、予約名、80byteと`_h`の形）と、`store`でlogの置き場を分けることは、旧HELIXに対応が見つからない**新規案**である。検索の範囲は`archive/legacy-generation-2026-09-14/root/docs/`（`grep -rIil`、読取りだけ）で、`path encoding` 0件、`reserved name` 0件、`MAX_PATH` 0件、`percent-encod` 6件（いずれも旧PSC sidecarのtraversal検出で、IDの符号化ではない）、`case collision` 2件（上のrelease-module-bundle-composition-requirements.mdと下のos-portabilityのtest設計）であった。旧は日本語file名の禁止（repository-structure.md:138）、artifactのcase collisionの拒否（release-module-bundle-composition-requirements.md:90-91）、OSごとのpath差の全件評価で同じ危険を扱っており、本書はそれを論理IDの側の符号化へ移した。

## 付録A 引用した現行文書のSHA-256（base `66abf6bf158baebc6bfceb5ccf693d425aae41a9`）
付録のSHAはmain baseの固定bytesを示すsnapshotであり、このPRで更新するL4/L9本文のcurrent cross-linkを示すものではない。current pairへの参照は本文のリンクを使う。

| path | SHA-256 |
|---|---|
| `docs/governance/decisions/repository-layout-and-source-visibility-po-decision-2026-10-09.md` | `2c700ffcbb89c034d9f0b43a7f69483e785abbef28bb07601857a1d0caa72030` |
| `docs/governance/decisions/po-l3-l10-post-confirmation-and-internal-deployment-policy6-2026-10-08.md` | `a5061e7438c4be4ca9d14637ac9f5f04689fb00fd3b7cb7d9d59ae775f7a0571` |
| `docs/governance/decisions/stage-release-internal-deployment-po-decisions-2026-10-07.md` | `b7bd5a34fb0c722be49f90a58ba917de65a1dc8d28db36ae9eb86336cbbea0cb` |
| `docs/governance/decisions/l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md` | `2ff59b61c775b9e609832f1e93961a4e50c54a959208b9edbc66524e15f0d8f8` |
| `docs/governance/decisions/commercial-license-po-decisions-2026-09-27.md` | `8585444b52d2f42507165dd03250575958c9d089e1fa769aee0686fa996f88be` |
| `docs/concept/helix-concept.md` | `bbc787c5dc17de9eded156285ad82ef768788cfa31822dfffa477db073a5e715` |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `2180967f0075f467c99a553d34f688a1fdf434703803b1a34e7e147d6a7d2df5` |
| `docs/helix-os/L3-requirements/functional-requirements.md` | `666200db50ea9a2e7f0d67d57496a71368e497f2fdb6e3485d4838339000b393` |
| `docs/helix-security/L3-requirements/functional-requirements.md` | `f6872a3ee941d63c80a9717bca7e81de832c043ad05cc9ac0c2db77eb264ee9e` |
| `docs/helix-infrastructure/L3-requirements/functional-requirements.md` | `425d0746efe875dbfbeebc26562adea99a3cdd8e8ef6377a0164bca1d624cc2d` |
| `docs/helix-connect/L3-requirements/functional-requirements.md` | `b3e4a47c0f49978880fc9bae7697d9b67eeaf72a112f821fef167c230c9d2e4b` |
| `docs/helix-harness/L4-basic-design/common-kernel.md` | `8079dc1852e2f7ea2d84e5311d2a34baff332e123e547de1ae8ca7003a9c8427` |
| `AGENTS.md` | `386d30378d49b96c055d237ccaa88ed02f3e43359ccfe006e4fd9c96bf5a595c` |
| `docs/governance/decisions/po-decision-2026-10-03-pending4-bun.md` | `50371dd5a2bb445aa23366790229b00a2731bf0ce0b3344a73d8ef289c4b5e92` |
| `docs/helix-harness/L4-basic-design/repository-layout.md` | `d7392f86c0c5d1ef8fcbe845ac4940ee3816c5f0687234c0acbc4899dc2b0aa6` |
| `docs/helix-harness/L9-integration-verification/repository-layout-integration-verification.md` | `74d3a76efea15ea048e69991fcada4b018d7a8e5da61405beb68ed78ae1db630` |
| `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md` | `a898c7cc15c749b86b60e0428f81b5b20e72f5cf99f7f80d519e01ea42a88ebc` |
