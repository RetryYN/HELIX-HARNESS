# HELIX-LABO Stage 1（001／011）詳細設計

status: draft_for_independent_review
owner: HELIX-LABO
paired_l8: ../L8-detail-verification/stage1-labo-detail-verification.md
base: main `d5bb3455526c816b3af965db239c4b56207a884f`
current_main_observed: origin/main `d5bb3455526c816b3af965db239c4b56207a884f`（#2778 review修正対象の基点。固定L3/L10 bytesは不変）

本書は固定Stage 1親001/011の4 ACを、既存L4契約の型・API境界としてL6へ渡せる粒度に具体化する。対象は許可sourceのobservation読取、Aggregate、Correlate候補のreference保持だけである。要求、source authority、scope、connection owner、status語彙、戻し先、因果の意味を変更しない。物理store、実source読取、実通信、実sourceへのwritebackを定義しない。

## 1. 固定入力・authority・trace

| 入力 | 固定対象 | SHA-256 |
|---|---|---|
| LABO L4 | `docs/helix-labo/L4-basic-design/stage1-labo.md`（§1–5、main `d5bb3455526c816b3af965db239c4b56207a884f`の固定snapshot） | `6ea7c6497e2349e63ed05a7a686e96e108a769a2ac864cf02295f174c00c6f1a` |
| LABO L9 | `docs/helix-labo/L9-integration-verification/stage1-labo-integration-verification.md`（§1–6、main `d5bb3455526c816b3af965db239c4b56207a884f`の固定snapshot） | `a19f842cd6fe9576a0984651cd4aff554bb9355304c9b1f619480cd9d7867973` |
| 固定親本文 | L3/L10の6文書。親revision `8fb2ae97960ad0f7a84380e3d52ab99920ee2dc7` | L4 §1の各path/SHA pinに固定 |
| 共通カーネル | LABO L4 §2で固定されたK1–K10の現行L4/L9本文 | 本書では再定義しない |

L3/L10親は`HELIXLABO-L2-001`と`HELIXLABO-L2-011`の二親に限る。各2 AC、機能oracleは001の15件と011の13件、計28件。NFRは5 oracle、固定L10 NFR:9のWeb/WEB-OS scope条件は2 oracleで照合する。functional/business/NFRの6固定本文は対象revision全体のpinをL4 §1で固定し、後続Stageの同ファイルbytesを対象へ混ぜない。

| 対象 | AC | L4/L9 locator | L5で具体化する境界 |
|---|---|---|---|
| Aggregate observation | `LABO-001-AC-01/02` | L4 §1.1–3、L9 `IV-LABO-001-C01`–`C15` | 20 field、7 source status、source identity/revision/provenance、source-owner read-only境界、source別missingness |
| Aggregate-to-Correlate | `LABO-011-AC-01/02` | L4 §1.1–3、L9 `IV-LABO-011-C01`–`C13` | source observationからepisode candidateへのexact reference roundtrip、欠測保持、CONNECT契約binding、correlationとcausalityの分離 |
| NFR | 固定L3/L10の既存項目 | L9 `IV-LABO-NFR-001-01/02/03`, `IV-LABO-NFR-011-01/02` | coverage/status fidelity/authority leakage/roundtrip/false causalityの測定設計。新thresholdなし |
| Web/WEB-OS scope | 固定L10 NFR:9 | L9 `IV-LABO-001-SCOPE-01/02` | 未選択時はoptional/unconfigured、選択時だけaccepted source contract identity/revision/scopeを固定 |

固定L3/L10業務本文は001/011について独立business outcome/ACを定めない。業務のpass/fail、画面、KPI、別owner gateを追加しない。`version_target: 1.0`は対象親の既存印であり、Web/WEB-OS条件付き内容を1.0必須へ前倒ししない。

## 2. 型とデータ境界

下の型名・field・enumはL4 §3.1に記載された契約をそのまま用いる。各`SubjectRef`は完全なkind/identity/revision/digestを持つ。`SourceDeclaredStatus`はsource ownerから観測したstatus値、K1 `Observed<T>`はLABO processing resultで、異なるfieldと型である。たとえばsource status `unknown`はK1 `Unknown`ではなく、`not_observed`はK1 `Unobserved`ではない。

```text
SourceObservation = {
  observation_id: SubjectRef,
  source: SubjectRef,                 // source identity + exact revision + digest
  source_contract: SubjectRef,        // selected/admitted contract exact ref
  scope: SubjectRef,
  schema: SubjectRef,
  provenance: SubjectRef,
  source_status: SourceDeclaredStatus,
  fields: Map<ObservationField, SourceDeclaredValue>
}

ObservationField = episode_id | requirement_revision | ticket_id |
  responsibility_id | product | mechanism | worker | provider | model |
  configuration | artifact | "CI/test" | release | deployment | runtime |
  failure | rework | cost | time | result

SourceDeclaredStatus = success | failure | rejected | cancelled | blocked |
  unknown | not_observed

AggregateObservation = {
  source_observation_ref: SubjectRef,
  exact_source: SubjectRef,
  source_status: SourceDeclaredStatus,
  field_presence: Map<ObservationField, Present<SourceDeclaredValue> | Missing>,
  lab_processing: Observed<LabProcessingDisposition>
}

EpisodeCandidate = {
  candidate_ref: SubjectRef,
  observation_refs: NonEmptyList<SubjectRef>,
  source_refs: NonEmptyList<SubjectRef>,
  source_contract_refs: NonEmptyList<SubjectRef>,
  schema_refs: NonEmptyList<SubjectRef>,
  provenance_refs: NonEmptyList<SubjectRef>,
  relation: Observed<SourceDeclaredRelation>,
  causal_assertion: false
}
```

`Present`/`Missing`はfield presenceのshapeであってK1 result classではない。`LabProcessingDisposition`と`SourceDeclaredRelation`のschema、fieldごとの実source availability、statusのcanonicalizationはsource ownerのaccepted contractが与える範囲に限る。本書で新しいK1 reasonやstatus aliasを作らない。未登録schema/contractは既存K1 `Unknown`の実原因に対応する理由で止める。欠測fieldを空文字、ゼロ、success等へ補完しない。

### 2.1 任意接続とaccepted source contract

001の通常入力は個別に採択されたL2-021〜030 source contractだけである。Web/WEB-OS L2-031/032は任意接続であり、未選択なら`optional/unconfigured`の状態を表し、missing required dependencyやゼロ件実績に読み替えない。選択時はsource ownerから解決されたaccepted contract `SubjectRef`（identity・revision・digest）、scope、schema、provenanceを一組の完全refとしてbindingし、そのscope内の入力だけを読める設計境界とする。これは合成fixtureのshapeであり、実在契約・採択・実source permissionを生成しない。

選択状態を保ったままaccepted根拠だけが欠けた場合、未選択へ振替えず、取り込みを肯定せず、元recordを保持したまま該当source ownerへ戻す。contract revision/scopeがcurrentかをcallerの申告だけから決めない。owner declaration/read boundaryが未解決なら影響するsource operationだけ`Unknown`/holdとし、新しいregistry/authority sourceは作らない。

## 3. API境界

関数は候補APIであり、source-owner resolver/readerおよびCONNECT adapterの実装をこの文書で定義しない。source/contract/scopeのowner snapshotは読み取り境界から得られる値として受け渡し、caller supplied status/authority/current claimを根拠にしない。K1/K2/K3/K5/K6/K7の既存API・優先順位・結果classを再実装・変更せず、記録や通信を実行しない。

| API候補 | 入力→出力 | owner/責務 | L4/L9 trace |
|---|---|---|---|
| `observe_source(contract_ref, source_ref, scope_ref, input_heads) -> Observed<SourceObservation>` | accepted contractとsource/scope/schema/provenance refs、現行input heads → source ownerのread-only adapter result | LABOは許可されたobservationを読む。source raw bytes/status/identity/revisionを保持し、authority/stateをsourceへ書き戻さない。入力refの確定根拠はsource owner境界で、要求parent IDやcaller claimで代用しない。 | 001 AC-01/02; `IV-LABO-001-C01`–`C09`,`C11`–`C15`; NFR-001-02/03; SCOPE-01/02 |
| `aggregate_observations(selected_sources, input_heads) -> Sequence<AggregateObservation>` | 選択済みsource observationsと固定contract refs → source別aggregate record | 20 fieldごとのpresence/value、source declared status、source identity/revisionとLABO処理結果を分離する。source一件の欠損・破損を他sourceへ伝播させない。 | 001 AC-01/02; `IV-LABO-001-C01`–`C15`; NFR-001-01/02/03 |
| `correlate_observations(aggregate_refs, selected_connection, input_heads) -> Observed<EpisodeCandidate>` | Aggregate refs、実選択CONNECT connection identity、accepted contract revision/scope/schema/provenance refs、relation input → episode candidate | Aggregate単体成功と接続成功を分け、source/observation refsを往復可能に保持する。relationは相関候補で、`causal_assertion=false`を保つ。要求parent ID `HELIXLABO-L2-011`はconnection identityに使わない。 | 011 AC-01/02; `IV-LABO-011-C01`–`C13`; NFR-011-01/02 |

入力sequenceの順序、物理記録形式、retry/transaction、join key、time window、similarity score、correlation algorithmは本親に定めがないため決めない。K2 keyはL4 §2どおりsource/operation/input refsの完全集合から作り、K2 `Rejected(missing_key|invalid_digest|duplicate_identity)`をK1 `Observed`へ変換しない。`aggregate_observations`の戻りはL4の公開APIどおり`Sequence<AggregateObservation>`であり、各要素内の`lab_processing: Observed<LabProcessingDisposition>`を持つ。これは関数の集約projectionで、`Sequence`全体をK1 resultや成功へ写す追加wrapperではない。K2の保存/lookup境界と各sourceのK1 processing resultは別に扱い、各recordの`lab_processing`がどのK1 classを保持するかは、owner由来の各source resultを含む具体入力が得られた範囲だけで判定する。K3は既存許可が要求される既存operationに限る。read/compare全体へ新しいpermission gateを追加しない。

### 3.1 欠測、status、owner return

`SourceObservation.fields`はsourceが出した値を保持する。`AggregateObservation.field_presence`は各fieldがpresentかmissingかを明示し、LABO processingの状態も別に返す。固定AC上必須の20 fieldの欠落は成功扱いせず、L2-001:73に指定されたsource責務へ戻す。source revision欠落も同様。既知過去revisionをhistoryとして正しく示す入力はhistoricalに保ち、過去revisionをcurrentと偽装した入力だけLABO側holdにする。

source status seven labelsを同じ値で保持する。success-only projectionにより元sourceのnon-success eventを消さない。元sourceに非success eventがない場合はnormalとして受け入れ、未発生statusを生成しない。`unknown`/`not_observed`のsuccess coercion、status writeback、別identity record混合は肯定しない。固定parentに専用routeがないLABO側のidentity mixing/current偽装などは元recordを保持したholdとし、route/ownerを新設しない。

011はAggregate→Correlate→episode candidate→sourceへの往復でobservation ID/source identity/source revision/field presence/source contract/schema/provenanceを個別に保つ。欠測は欠測のまま往復する。observation IDまたはsource revisionの欠落は依存L2-001:73のsource責務へ返す。relation mismatchの根拠がある場合だけCorrelateへ返す。revision不一致はrecordを保持したholdであり、source責務への新routeを作らない。source/connection receiptのscope/revision mismatchは接続成功・受領を生成せず停止し、固定CONNECT ownerに明示されたrouteのみ使う。

因果らしいevidenceやtime/path近接はrelationの因果的意味を確定しない。L2-002の時間/path条件はその親の条件として残し、011に移さない。connection statusは別の接続成分として記録し、CONNECT greenだけでobservation受領またはepisode成立を作らない。

### 3.2 固定NFR候補と旧source対応

NFRの5項目は各親の既存候補だけを測る。性能・容量・保持期間、旧IPA grade、memory/timeout/confidence、source detector、SLAを新設しない。固定L3 NFR:13 / L10 NFR:13の「測定不能/未観測を成功扱いしない」は全測定に適用する。

| NFR oracle | L5で固定する測定面 | Limit |
|---|---|---|
| `IV-LABO-NFR-001-01` | 20 fieldのsource別present/missing。field単独欠落を独立観測。 | 未提供fieldを推定補完しない。 |
| `IV-LABO-NFR-001-02` | 7 source status fidelity、non-success event脱落、未発生status生成、unknown/not_observed coercion。 | source valueとLABO dispositionは別field。 |
| `IV-LABO-NFR-001-03` | source authority leakage、partial failure、unrelated valid record保持、scope boundary。 | 新しい分類機構なし。 |
| `IV-LABO-NFR-011-01` | episode→observation/source identity/revision roundtripとmissingness。 | join/time-window/similarity未指定。 |
| `IV-LABO-NFR-011-02` | evidenceあり/時刻・pathのみの入力でcausal assertionを検査。固定L4/L5型で表現できる合成inputの範囲だけを対象にする。 | causal threshold/algorithm未指定。time/path-onlyのpath所在を固定L5型またはaccepted source contractが定めない範囲は未被覆として保持し、path fieldを新設しない。 |

L4 §4に記録された旧9資産と台帳のfull asset ID/path/line/full SHAは、本L5の下流入力として同節の固定bytesを参照する（L4 lines 125–129）。確認したconsumer/failureと再利用区分を以下へ対応する。台帳9行は`Historical/unresolved/implementation_status=unknown/consumer_refs=[]`であり、空consumer_refsをconsumer不在証明や再利用許可へ変えない。

| 旧資産ID / source | consumer・failure保持 | L5の扱い・変更理由 |
|---|---|---|
| `LEGACY-ASSET-F542125805B777D8A56A`, `LEGACY-ASSET-B30F3C82B6B0FDC0D2A8`, `LEGACY-ASSET-6EBDB617A8104A7756D0`（L4 §4 row 1、旧L3/L10定義・gates・自律境界） | FR+ACと対のverification、AI起草・人の上流承認。旧工程名/runtimeは現行ownerではない。 | pair traceとL3境界を保持し、旧層/gate/runtimeを置換。 |
| `LEGACY-ASSET-A6E2C7F0565E5F804F06`（L4 §4 row 2、旧BR-21 dashboard） | invocation_log破損時に対象sourceだけskip/warningし他source集計を維持。 | source単位partial failure isolationを再導出。dashboard、4-source/5-metric、30s polling、token costは除く。 |
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1`, `LEGACY-ASSET-EE5DBACC7F28F7D1F605`（L4 §4 row 3、旧HARNESS/HELIX FR） | 現行source-observation/episode correlationとのdirect consumer一致なし。 | 固定L2/L11から再導出し、旧FR/command/runtimeは移さない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51`（L4 §4 row 4、旧pillar HAT） | old test designのoracle/異常境界例。現行親への直接一致なし。 | case別failure分離のみ再導出。旧case/value/fixture/runtimeは置換。 |
| `LEGACY-ASSET-8CC5ABFC98C0D00183CA`, `LEGACY-ASSET-DB669724249A14A665F0`（L4 §4 row 5、旧HELIX/HARNESS NFR） | IPA grade、memory/timeout/confidence、旧acceptance consumer。 | 根拠付き測定と対oracleの構造だけ再導出。旧値・承認・CIは移さない。 |

旧NFRの保持・置換は、固定L3 NFR `nfr-grade.md:11`と固定L10 NFR `nfr-verification.md:11`が分けて求める「因果らしいevidenceあり」と「時刻/pathのみ」の二入力に従う。現行20 fieldには`time`と`artifact`があるが、`path`値の型・所在・source mappingは固定L4/L5で定義されていない。旧HAT等のpath/classifierを流用せず、time/path-only inputの具体形とそのAPI結果は、そのsource contractに表現が現れるまで未確定とする。これはL9 NFR-011-02の実行被覆を主張しない局所範囲であり、新field、threshold、因果判定を追加しない。

## 4. L6への受渡しと局所未決

L6はこの3 APIのsignature候補、source snapshotとcaller inputの境界、K1/K2 result伝搬、20 field presence、7 source status、source別failure isolation、episode roundtripを個別caseへ下ろす。実reader/physical store/CONNECT transport/owner permission/実通信/因果解釈は本設計で実装可能と断定しない。

| 未決事項 | 影響 | 現在の扱い |
|---|---|---|
| 各source ownerのcurrent declaration/readerとfield schema | `observe_source` | owner snapshot/read boundaryが無ければ影響sourceだけUnknown/hold。形式/ownerを推測しない。 |
| Web/WEB-OS 031/032 accepted contractの実在・scope | 001 optional scope | 未選択はoptional/unconfigured。選択fixtureは合成refだけで、実採択・実読を示さない。 |
| CONNECT operationの実permission、transport、receipt | `correlate_observations` | 採択済みCONNECT契約が与える範囲だけをstubで受ける。実通信許可は生成しない。 |
| relationの意味、join、correlation方法 | 011 | unresolved relationを保持。因果/algorithmを追加しない。 |
| `selected_connection`・receipt/scopeとK2 subject/input key構成の対応 | `correlate_observations`、connection/ref変異 | L4はこれらを別fieldとして保持するが、subjectとinput refsのどちらに各値を束縛するかを固定していない。従ってその構成に依存する`Stale`/`Unobserved(not_run)`をこの草稿で予測せず、L9のconnection binding期待を局所holdとして記録する。 |
| 未指定K1/K2 mapping reason | 全API | 現行L4/L9の既存語彙を用い、原因が確定しない時は局所Unknown/hold。reasonを新設しない。 |

本書とL8は草稿である。fixture未実行、実装なし。本文・ID・pinの静的整合はL3承認、L10 pass、採否、実source status/authority、接続成立、因果確定、製品完了を意味しない。
