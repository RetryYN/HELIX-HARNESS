# F05 gap selection・typed operand writer 技術候補

status: scaffold candidate（未採用・未review・未実装）  
authority_effect: none  
source_main: `88d8b2516400e80da9d15ec864264af42b8dfb74`

## 目的と境界

F05のGapProposalを、同じ呼出しで形成されたfield Selectionへ結び、原命題bodyの役割別operandを閉じた型へ写す実装候補を具体化する。L3/L10が定めた「不足4候補と返却先」の意味、候補の採択、Backflow発行、義務消込、外部配送は変更しない。F05 producer全域、外部root/custody/owner認証、実source供給口、実運転、独立L9 oracleは本候補の対象外。

この文書はscaffold研究候補であり、L5/L8正本の変更、意味採用、実装、test合格、function-pair freezeを表さない。対応する正しいfreeze manifestをこの候補から作れないため、freeze記録は生成しない。L5/L8はともに`draft_candidate_not_independently_reviewed`である。

## 起点と再導出

### 上流契約

- L3 `HARNESS-L3-009-F05` `/requirements/27`、L10 `HARNESS-L10-009-F05` `/cases/27`。不足を質問・矛盾・derived requirement candidate・N/A判断候補へ区別し、元revision/scopeと返却先を辿れる材料にする。ここに新しい意味・gateは加えない。
- L4 `docs/helix-harness/L4-basic-design/product-template-application.json`: `/field_source_materialization_contract/ordered_source_materialization/2..3`、`/field_semantic_evidence_contract/field_definition_evidence_body/absent_guard`、`/field_semantic_evidence_contract/wrapper_and_source_contract/source_payload`、`/field_semantic_evidence_contract/basic_candidate_return/cause_vocabulary`。
- 現行L5 `docs/helix-harness/L5-detail-design/product-template-application.json`（本文SHA-256はSCF-B-0168のupstream pinを参照）: `/f05_detail_contract/selection_contract`、`/f05_detail_contract/gap_contract`、`/f05_detail_contract/types/Selection`、`/f05_detail_contract/types/GapResult`、`/f05_detail_contract/types/GapOwnerResult`、`/f05_detail_contract/types/GapInterpretation`、`/f05_detail_contract/types/QuestionOperands`、`/f05_detail_contract/types/ContradictionOperands`、`/f05_detail_contract/types/DerivedOperands`、`/f05_detail_contract/types/NAOperands`、`/f05_detail_contract/field_content_source_failure_writer_contract`、`/f05_detail_contract/recipient_leaf_writer_contract`。
- 現行L8 `docs/helix-harness/L8-unit-verification/product-template-application.json`: `/additional_unit_cases/15..16`（既存gap枝の限界）、`/additional_unit_cases/25`（F05のcaller consumer境界）、`/additional_unit_cases/45..47`（定義source未形成の例）、`/f13_knowledge_recipient_leaf_verification`。この候補のU-ID行は同文書へ未統合で、全件`not_executed`。
- 対応L9の独立意味oracleは本件の全join・全typed operand組合せを確定していない。L5 `/f05_detail_contract/remaining_and_nonclaims` の分類を保ち、L8 technical caseの追加だけでL9意味oracleやpair freezeが成立したとは扱わない。

### 旧HELIXと失敗事例

旧L4 JSON authority `LEGACY-ASSET-4F5A1F0739EC1111D91D`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md`, lines 16–60, 81–92, SHA-256 `e254d995d1d9fbbcc74bb53b3356b4499ac20cca2280eeafde1412d08630c4cb`）と旧L5 JSON authority `LEGACY-ASSET-98372FEE8A3AC8F9C299`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-template-json-authority.md`, lines 33–108, SHA-256 `3015d4f3d65cd1f8205f88f29dd59c4f1f7ef42c729d8144f2319e49fe20d830`）を再導出起点にした。保持するのは構造化I/O、source・failure・trace・consumer境界とunknownの保持。旧registry、planner、式木、runtimeは移さない。

前身の弱点監査 `LEGACY-ASSET-A127DEC3EEE6ED63CF17`（`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md`, lines 80, 86–87, SHA-256 `bab121404c956a0a4b403e589bea1c414af59b5996989bea5fab9f98f42f6872`）のUTW-014（source欠落を空集合へ縮退）、UTW-020（aggregateで部分失敗診断が粗い）、UTW-021（完了証跡が時刻/prose/自己申告へ戻る）を照合した。これらは失敗防止の文脈であり、新要求、成功条件、Cause kindを生成しない。

## 実装候補

### 1. raw occurrenceとSelection join

1. 同じF05 requestの`gap_proposals`を原配列順に一度walkし、proposal全whole、原index、各8 memberのpresence、元binding/subject_ref/unfinished refsを保存する。raw保存と意味評価を分ける。Ref反復は原indexごとに残す。
2. 同callのFieldResult/Selection表を使う。proposalのbindingとsubject_refを、実field Refまたは同kind traceの実義務 Ref/Bindingへ full Ref equality で照合する。kind文字列だけでfieldを選ばない。
3. 同callの`field_gap_proposition` semantic_recordsを原順で走査する。bodyがfield_ref/template_refを供給した場合、その両端もproposal/fieldの同じtargetへ一致させ、対象FieldResultのSelectionと交差させる。body保存だけでrole意味が形成されたとは扱わない。
4. 一意にtargeted fieldが確立した時だけ`GapResult.evaluated`へ進める。既知outsideは`Selection.outside`と`GapResult.raw_only`。必要端が未供給、unmatched、複数対象、端同士のknown differenceなら`Selection.unestablished`とraw-onlyで原proposal、全候補、局所既存Causeを返す。未知・曖昧をCauseやoutsideへ変換しない。
5. policy/application joinは同call `policy_decisions`の各実rowから原`application_policies` index/full Refへ結び、template/binding/dispositionの全行を`PolicySelectionOccurrence`へ写す。aggregate dispositionからfieldへ逆配布しない。
6. `candidate_interpretations`は各実proposition occurrenceの原順に一件ずつ作る。body未供給なら空配列のままにし、架空occurrence indexを作らない。

### 2. source/body・Cause境界

- Ref検索missは、検索collectionの実Readを保持する。source観測は同call `ValidationDetailedReturn.source_observations`の実indexだけを参照し、missing/null/invalid/unobservedを評価済み空配列として扱わない。
- L5が閉じるwriterは二つに限る。 (a) SemanticRecordの`source_ref`がpresent non-null Ref、同snapshot `sources` collectionが観測済みで同RefのSourceEnvelopeが0件なら`source_unresolved`。target=実`source_ref` Read.location、left=元SemanticRecord.source_ref Read、right=実sources collection Read、rule=`/f05_detail_contract/field_content_source_failure_writer_contract/writers/0`。(b) 実body entryがありcollection/refは一致するがpayloadが既知differentなら`source_body_mismatch`。target=payload location、left=元record全体、right=実payload、rule=`.../writers/1`。どちらも発生record/source/body occurrenceへ一件格納し、既定順で親へcopyする。
- 上記条件が閉じない場合は既存原因だけを保持して該当`Formation`をunformedとする。特にbody entry 0件、proposal/body不在、proposition operand miss、constraint mismatchにはこの候補からCauseを作らない。L5の`STOP-F05-BODY-ENTRY-ABSENT-01`、`STOP-F05-GAP-PROPOSAL-BODY-ORACLE-01`、`STOP-F05-CAUSE-PROPOSITION-OPERAND-01`、`STOP-F05-CAUSE-CONSTRAINT-MISMATCH-01`を維持する。
- Causesは生成occurrenceの順で局所へcopyし、値同値dedupしない。子へcopyしたCauseを親集約時に再flattenしない。未形成の空`causes`だけを根拠にformedへ昇格しない。

### 3. typed role operands

全roleでRef列、重複、source/body occurrence、owner、binding、field/template scopeを個別に保持する。`Read`は実原所在を使う。`ReturnLink`は実出力root/pointerに結び、候補・owner・basisのReturnLinkを捏造しない。本文・reason・proposal.kindはraw valueとして保存し、自由文をparseしない。

| role | formedに必要な構造条件 |
|---|---|
| question | 全`requested_operand_refs`と`gap_basis_refs`が非空。requested全Refを元field/ref列、field Binding、関連義務、同template/binding policy/conditionへ結び、basis全Refを独立の実AxisFact/SemanticRecord又はpolicy/義務source/bodyへ結ぶ。全requestedごとの構造`OperandRelation`、source/body/ownerとscopeが対応した時だけCandidateJudgment。 |
| contradiction | left/right各一つを別々の実proposition source/bodyへ結ぶ。実`field_gap_constraint`が`mutually_exclusive`、同field/template/fullbinding、left_refs=[left]、right_refs=[right]で、全source/body/ownerが成立した時だけCandidateJudgment。値や文言の差だけで矛盾にしない。 |
| derived requirement candidate | 非空antecedent列の全Refをfield.binding.requirement_refと元sourceへ結ぶ。実constraintが`derives_requirement`でleft_refsが元列の順序・反復を保持、right_refs=[proposed]。右原SemanticRecord.meaning全体とproposalを既存typed equalityで比較。自由文推論や新Refを生成しない。 |
| N/A candidate | 実型付きpolicyとNARecord、独立`non_applicable_basis`、両template/binding/source/body、field scopeを結ぶ。policy.source ownerとpolicy.ref.owner、NA source ownerとNARecord.ref.owner、命題source ownerとproposal.ref.ownerを別比較する。reason/decider/target_revisionの既存条件を満たし、false/0/空reentry原値は保持する。 |

unknown role, 未知constraint relation, body/owner/source不足、部分的なoperand一致はそのGapInterpretationだけをunformedにする。互換候補はすべて残し、優先順位で消さない。複数supportとconstraint occurrenceは原順・原参照で別に返す。これは候補形成であり採択/チケット/義務完了を示さない。

## L8候補ケース（U-ID、すべて未実行）

各行はL8に後で移す候補。ここでは実fixture、full return、hash、期待Causeが未形成なものを記録しない。全行`execution_state=not_executed`、`expected_side_effect_count=0`。

| U-ID | 入力差 | 候補期待 |
|---|---|---|
| F10-GS-01 | proposal binding/subject/full Ref、optional body field/template refs、同call policy rowが一つのtargeted fieldへ一意join | 全policy occurrenceと原indexをSelectionへ保持し、proposal一件のGapOwnerResultを返す。 |
| F10-GS-02 | 同じRefに複数field candidate、又はproposal端とbody端がknown different | raw-only + `Selection.unestablished`。元材料/既存Cause維持、対象fieldを選ばずCauseを追加しない。 |
| F10-GS-03 | proposition body未供給、proposal rawは存在 | raw-only、candidate_interpretations=[]、架空proposition indexなし。proposal原全値/presenceと既存Causeのみ。 |
| F10-GS-04 | questionの要求/basis列に反復Refがあり、全Ref/source/body/owner/Relationは一致 | 各occurrenceと順・反復を残し、各requested-target関係を別に返す。text parsingなし。 |
| F10-GS-05 | contradictionのleft/rightとtyped mutually-exclusive constraintが全て対応 | 左右、constraint、左右endpoint relationsを分離保持し、formed contradiction judgment一件。 |
| F10-GS-06 | derived antecedent列に同Ref反復、constraint left_refsも同順反復。positive proposal wholeがtyped equalityで対応 | antecedent occurrence/order/repetitionとproposed relationを保持。文章推論なし。 |
| F10-GS-07 | N/A policy/NARecord/basisのsource/bodyは対応するがowner binding一端だけ absent/unreached | 当該interpretation unformed、実owner Read/presenceと既存Causeを保持。missing owner Causeを発明せず、policy/NA等値にまとめない。 |
| F10-GS-08 | SemanticRecord.source_refはpresent non-null、sources collection observed、matching envelopeなし | L5 `/field_content_source_failure_writer_contract/writers/0`のsource_unresolved shapeだけを出す。target/left/right/rule pointerと親への一回copyを確認。 |

## 未形成のまま残すもの

- 実producer/同call source custody、根拠source実在性・trust・owner認証口は未形成。source観測を使う局所writerは実root resolverの代わりではない。
- body entry 0件の原因件数/right Read、proposition operand unresolved、constraint mismatchのCause形は既存L5 STOPのまま。
- 独立role sourceなしを意味する oracle、全consumer ReturnLink、F13 recipient全枝、F14 same-scope obligations、全F05 typed caller connection、L9独立case、L7実行検証、function pair freezeは未閉包。
- L8 count/allowlist/freeze manifestへの統合は別の正本差分として行う。現文書のU-IDはL8追加済みケースや検証結果を意味しない。

## 静的確認

この候補はJSON pointer/ID/authority/source境界を照合する設計メモであり、runtime/test/CIを実行しない。`scfctl validate`は登録後のscaffold binding検証に限る。`git diff --check`とJSON構文検査も機械形式の静的確認に限り、意味reviewやfreeze合格を生成しない。
