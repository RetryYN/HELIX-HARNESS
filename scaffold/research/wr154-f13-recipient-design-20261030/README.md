# F13 recipient writer と F14 scope candidate の接続技術候補

status: scaffold candidate（未採用・未review・未実装）
authority_effect: none
source_main: `88d8b2516400e80da9d15ec864264af42b8dfb74`

## 目的と境界

F13のrecipient候補writerを、既存のF05 field/gap evidenceと同一呼出しの原sourceへ接続する技術候補を整理する。L3/L10 F05の不足4候補・返却先の意味は変えない。recipientは返却先の候補分類であり、実受信資格、Backflow発行、ticket、合意、義務消込ではない。

F14のfield-obligation-scope writerは現L5で`finite_candidate_local_not_adopted_independent_review_pending`、対応L8/L9もcandidateである。したがって本候補はF14のsource/assessmentをauthorityとして採用せず、scope形成済みの合成枝を実producer成功とも扱わない。F14との接続は、別途独立reviewが済んだcandidate contractを入力として与える条件付き設計に留める。F10 worktree/差分には触れない。

## 上流と根拠

- L3 `HARNESS-L3-009-F05` `/requirements/27` とL10 `HARNESS-L10-009-F05` `/cases/27`。要求するのは分類候補とsource/revision/scope/返却先を辿る材料であり、返却候補の採択・実Backflowではない。
- L4 `docs/helix-harness/L4-basic-design/product-template-application.json`: `/field_obligation_scope_contract`、`/field_obligation_scope_contract/field_body_required`、`/field_obligation_scope_contract/role_owner_binding`、`/field_obligation_scope_contract/proposal_preservation`、`/field_obligation_scope_contract/global_retention`、`/field_obligation_scope_contract/cause_patterns`。
- L5 `docs/helix-harness/L5-detail-design/product-template-application.json`: `/f05_detail_contract/recipient_leaf_writer_contract`、`/f05_detail_contract/recipient_leaf_writer_contract/branches/0`、`/f05_detail_contract/recipient_leaf_writer_contract/branches/1`、`/f05_detail_contract/recipient_leaf_writer_contract/branches/2`、`/f05_detail_contract/recipient_leaf_writer_contract/branches/3`、`/f05_detail_contract/recipient_leaf_writer_contract/branches/4`、`/f05_detail_contract/recipient_leaf_writer_contract/branches/5`、`/f05_detail_contract/recipient_leaf_writer_contract/branches/6`、`/f05_detail_contract/recipient_leaf_writer_contract/unfinished_scope_unformed`、`/f05_detail_contract/recipient_leaf_writer_contract/knowledge_scope_writer`、`/f05_detail_contract/field_obligation_scope_writer_contract`、`/f05_detail_contract/field_obligation_scope_writer_contract/recipient_and_return_links`、`/f05_detail_contract/field_obligation_scope_writer_contract/cause_storage_and_order`、`/f05_detail_contract/field_obligation_scope_writer_contract/remaining/0`、`/f05_detail_contract/field_obligation_scope_writer_contract/remaining/1`、`/f05_detail_contract/field_obligation_scope_writer_contract/remaining/2`、`/f05_detail_contract/field_obligation_scope_writer_contract/remaining/3`、`/f05_detail_contract/field_obligation_scope_writer_contract/remaining/4`。
- L8 `docs/helix-harness/L8-unit-verification/product-template-application.json`: `/f13_knowledge_recipient_leaf_verification`、`/f13_knowledge_recipient_leaf_verification/cases/0`、`/f13_knowledge_recipient_leaf_verification/cases/1`、`/f13_knowledge_recipient_leaf_verification/not_proven/0`、`/f13_knowledge_recipient_leaf_verification/not_proven/1`、`/f13_knowledge_recipient_leaf_verification/not_proven/2`、`/f13_knowledge_recipient_leaf_verification/not_proven/3`、`/additional_unit_cases/25`、`/f05_native_nine_source_known_known_scope_full_five_return_oracle`。
- L9 `docs/helix-harness/L9-integration-verification/product-template-application.json`: `/field_obligation_scope_verification`、`/field_obligation_scope_verification/cases`、`/field_obligation_scope_verification/coverage`。これは29件の意味scenario rowsであり、固定input/expectedやScopeReturn oracleではない。実行済み結果でもない。

現L5 F13はfield、gap interpretation、knowledge-scopeのclosed `RecipientWriteContext`枝と7種のrecipient branchを記述する。L8 F13の直接leaf例はS12/S13の2件だけで、L8自体は`conditional_leaf_oracle_not_executed`。L9のF14 29 scenario rowsにも固定input/expectedはなく、F14 scope全体との接合、mixed field/gap返却、残る未形成guardsを証明しない。F14 L5 candidateは独立review待ちであり、L8の9-source positiveは一件の有限合成例に限られる。

## 旧HELIXと失敗起点

- 旧L4 JSON authority `LEGACY-ASSET-4F5A1F0739EC1111D91D`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md` lines 16–60, 81–92、SHA-256 `e254d995d1d9fbbcc74bb53b3356b4499ac20cca2280eeafde1412d08630c4cb`。保持: template/instance/trace/owner/failureを構造化I/Oへ分ける。変更: 旧registry/planner/runtimeを移さず、現L4/L5のJSON契約へ限定する。
- 旧L4 pillar `LEGACY-ASSET-B8BBC1D5A8C91E746405`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/pillar-basic-design.md` lines 70–79、SHA-256 `d010289ee78b054642bb170164808144bf842be8e01454fb19d7a67fb309cc56`。Forward返却先/gap-only/version_targetの構造的trace発想を参照する。現L3/L10のrecipient意味に旧route/modelを持ち込まない。
- 旧L4 infinity-loop `LEGACY-ASSET-C35E93F2D36777CD7462`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md` lines 374–383、SHA-256 `2a757a52082f823c4e52ae1e04887b62b8ac5f5df0d833d2b1c00516d6572357`。原requirement/owner/evidence/statusと個別discharge、N/A/reentryを保持する失敗予防の歴史を参照するが、旧DB obligation modelを再導入しない。
- 旧L5 JSON authority `LEGACY-ASSET-98372FEE8A3AC8F9C299`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-template-json-authority.md` lines 33–108、SHA-256 `3015d4f3d65cd1f8205f88f29dd59c4f1f7ef42c729d8144f2319e49fe20d830`。structured source/body/consumer traceとunknown保持を再導出起点にする。
- 前身弱点監査 `LEGACY-ASSET-A127DEC3EEE6ED63CF17`、`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md` lines 80, 86–87、SHA-256 `bab121404c956a0a4b403e589bea1c414af59b5996989bea5fab9f98f42f6872`。UTW-014はsource欠落の空集合化、UTW-020はaggregateで部分失敗診断が粗い、UTW-021は完了証跡の時刻/prose/自己申告化を記録する。これらからCause kind・success gate・新要求を生成しない。

## F13 writerの技術的な閉じ方

### 入力形成と原出現

- `RecipientWriteContext`のtagでfield、gap_interpretation、knowledge_scopeを分ける。入力は同一F05 requestの実indexと、完成前の既存assessment/interpretation/同D scanを使う。完成RecipientMaterialやcompleted FieldOwnerResultを自分自身のinputへ戻さない。
- field row順は実field原順、各field内はdefinition assessment由来の実行→value assessment由来の実行。各assessmentについて実statement rowを原順で保ち、同じassessmentに根拠がない場合だけその側のunresolved rowを置く。反対側の根拠で抑止しない。known/knownで他の独立recipient根拠もない時は`recipient_materials=[]`で、U0/Causeを追加しない。
- gap rowは実proposition occurrenceごとに処理する。元kind、proposal.reason、backflow_ownerは分類oracleやowner fallbackにしない。statementが実在し意味guardが対応する場合でも、既存のdefinition-absenceまたはknown+undecided branchに直接一致しなければrecipient=`unresolved`。statement未取得なら元proposal/raw材料と実取得Causeだけをlinkし、架空body/index/owner/reasonを作らない。
- knowledge_scope branchは同Dの既存scan・原profile出現/indexを受け、scan readerを再実行しない。field/profile/semantic record/source/source observation間の全Ref・scope対応を保持し、存在しないs/vやscan-rootのnative Readを作らない。S12/S13以外の全branchは未行使のまま。

### field-scopeのF14連携

- F14 `scope_assessment`を実入力として同じfield indexへ一意結べる場合、F13は既存judgment全値・原因列・実ReturnLinkを`unfinished_refs`/`basis_links`へcopyする。F13でscopeを再推論しない。
- 欠落scope row、scope source unobserved、assessment unformedを「profileなし」へ同一視しない。L5のU0は既存の明示guardが成立する場合だけ候補内で一度生成し、同scope rowへcopyする。global KindTrace/`returned_refs`/GapProposal.unfinished refsからfield-local scopeを生成・充足・消込しない。
- F14 L5 writerは`finite_candidate_local_not_adopted_independent_review_pending`であり、L8のpositiveはone-case finite synthetic expectation、L9 29 scenario rowsの固定input/expectedは未物質化。これらを採用済みauthority、実scope証明、U0の新しい一般根拠にしてはならない。
- F14との統合を設計採用する前の独立review対象: 対象HEADのL4 `/field_obligation_scope_contract` を意味根拠とし、L5 `/f05_detail_contract/field_obligation_scope_writer_contract` のmember/source/body/owner/cause patternとL9 `/field_obligation_scope_verification/cases` の29 scenario rowsと各`meaning_rule_pointers`を独立に照合する。scenario rowsはfixed input/expectedを持たずScopeReturn oracleではない。L5自身を期待値oracleにしない。L8 `/f05_native_nine_source_known_known_scope_full_five_return_oracle` とのscope union/member/cause correspondence、同L8 `/f05_native_nine_source_known_known_scope_full_five_return_oracle/limitations_ja` の未行使・限界を維持し、F13 same-call input/return/cause orderの一致を確認する。L8 ADD-48..53は有限U-ID設計行でnot_executed。未行使を実行済みに変えない。source/custody/trust/owner acquisition、reentry destination、未形成Cause shapeが未閉包ならSTOPを維持する。これはreview条件の記録であり、新たな承認やgateを作らない。

## U-ID候補（すべてnot_executed）

これらはL8へ後で結ぶ有限writer境界の案で、fixture/full return/hashは未形成。各caseは`expected_side_effect_count=0`。

| U-ID | 条件 | 技術期待 |
|---|---|---|
| F13-R-01 | 同一fieldのdefinitionにsource/body/ownerが成立したexplicit absence、value側は独立して処理 | BRAIN候補行に実absence interpretationへのReturnLinkを結び、他assessment行を消さない。 |
| F13-R-02 | 両assessmentがformed known、独立recipient根拠なし | 空recipient配列。unresolved row/Cause/U0を新設しない。 |
| F13-R-03 | definition側に実BRAIN absence、value側assessmentだけがunformed | BRAIN行とvalue側unresolved行を両方保持。原因はvalue側からU0へ一回copyし、definition側へ流用しない。 |
| F13-R-04 | 原gap statementあり、実meaning/root/source/owner/field/template/bindingが対応するが直接既存recipient branchに該当しない | unresolved行に実statement owner/reason/interpretation linkを保つ。proposal.backflow_owner/reasonへfallbackしない。 |
| F13-R-05 | proposalあり、statement未取得/未形成 | unresolved、proposal原値/presence/subject/実取得Causeへのlink。body/index/owner/reasonや新Causeを発行しない。 |
| F13-R-06 | F14 same-field assessmentが形成済みcandidateとして同Dに存在する | F13はassessment全値と実ReturnLinkをcopyするだけ。F14 candidateのauthority/実成立を新規主張しない。 |
| F13-R-07 | scope rowなし、source collection未観測、又はassessment未形成の各個別形 | 「profileなし」と断定しない。既存F14/U0 guardが根拠を閉じない限り原因のみ保持してscopeをunformedにする。 |
| F13-R-08 | S12/S13 knowledge recipient条件の一つを壊し、同D/scan内の実資料は保持 | 元原因/Readとfield scope、recipient/source/owner/reason/unfinished全値を保持してunresolved。BRAIN/存在しないprofileへの補完なし。 |

## 未形成と範囲外

- L5 F13の閉じたfield/gap/knowledge writer文面は存在するが、L8の直接F13行は2件の未実行leaf例であり、全7枝・混在・F14統合のL5/L8/L9/U-ID閉包は未形成。
- F14 field-scope native writerの候補authorityと独立reviewは未完。candidate sourceを現行authorityとしてproducerへ流す実装はSTOP。
- 原statementがない時の新しいproposition/constraint Cause、F14 body/owner/source原因の全組合せ、field/source owner認証・custody、非null reentry先、F13全consumer接続、実producer/codec/runtime/L7実行、PR pair freezeは対象外。
- L8/L9正本へのU-ID移植、case allowlist/count更新、freeze manifest生成はこのscaffold候補から行わない。正しい現行manifestと独立L9意味期待がない。

## 静的検証境界

READMEに記載するpointerとsource SHAはbindingに固定し、JSON parse、各JSON pointer解決、`scfctl validate`、`git diff --check`だけを静的検証する。旧CLI/hook/runtime/test/CI、現行runtime/test/CIを起動しない。これらの静的結果はF13/F14意味review、L9 execution、実producer成立、freezeを意味しない。
