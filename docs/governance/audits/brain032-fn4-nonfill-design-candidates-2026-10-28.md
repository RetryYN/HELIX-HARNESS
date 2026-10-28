# BRAIN032 FN4非fill入力の設計判断候補（2026-10-28）

対象: WR-CLAUDE-BRAIN032-FN4-NONFILL-DESIGN-3547-20261028-82 / Issue #3547。
調査revision: `67dcb58b89a68c5a29049bb1874d9c0228d19b14`。以下は静的な判断材料であり、設計の採用・閉包・再凍結・実装許可ではない。

**結論: FN4の一般nonfill dispatchは既存L3/L4から一意に導けない部分が残る。** 依頼scope 2の「一意に導けない点が残れば、そこで止めて、選択肢と根拠をPO判断候補として統制へ返す」に従い、下記の未決意味を返す。
既存有限枝の条件を広げず、nonfillを無関係・非発火・入力違反にせず、新targetを生成しない。本書でL4/L5/L9/L8やsourceを変更せず、WR82設計完遂とは扱わない。継続する他作業の停止を意味しない。

## 出典の略号

| 略号 | path |
|---|---|
| B3 | `docs/helix-brain/L3-requirements/functional-requirements.json` |
| B4 | `docs/helix-brain/L4-basic-design/template-semantic-supply.json` |
| B5 | `docs/helix-brain/L5-detail-design/template-semantic-supply.json` |
| B9 | `docs/helix-brain/L9-integration-verification/template-semantic-supply.json` |
| B8 | `docs/helix-brain/L8-unit-verification/template-semantic-supply.json` |
| B6 | `docs/helix-brain/L6-function-design/descriptor-definition-first-test.json` |

起点はB6 `/fn7_claim_boundaries_preparation/B_prerequisite/consumer_alignment_design_audit/FN4_oracle_claim_ports`（WR68 / [PR #3777](https://github.com/RetryYN/HELIX-HARNESS/pull/3777)）。現停止の除去を先に正解にしない。
対象の親とauthorityはB4/B5 `/authority_boundary`、B3の各義務から確認する。実装・Issue・保存raw・過去のGreenから要求意味を補わない。

## 既存契約から確定できること

| 境界 | 根拠 | 確定できる範囲 |
|---|---|---|
| 原定義・unknownの保持 | B3 `/requirements/0`〜`/requirements/2` | 項目identity/source/版/理由と未充足材料を保持し、別Patternやview成功で補わない。定義不足、値未決、適用未決を混同しない |
| JSONとview、義務とoracle | B3 `/requirements/4` (F05)、`/requirements/5` (F06) | 表示だけで意味identity/版/stateを更新しない。計測・成立条件を適用義務・観点・根拠・対oracleへ束縛する。BRAINは閾値・製品値を新設しない |
| 同callと公開shape | B4 `/oracle_view_boundary_contract/same_call`。B5 `/type_contract/types/OracleContext`、`/type_contract/types/Comparison` | Context3とComparison4を維持し、別producer/Binding/snapshotを結合しない。元Claimは同ValidatedSupply.inputに保持し、公開返却へClaim fieldを追加しない |
| fill専用の既読read | B5 `/source_return_contract/descriptor_target_dataflow/consumer/reads`、同 `/fn4_read_binding`。B4 `/oracle_view_boundary_contract/nonnull_claim_target_reuse` | 同walkのfill_definition target readを全値で再利用し、target/intentを再呼出ししない。nonfillにこのtarget口を一律必須化しない。非nullというだけでnonfill用readを合成しない |
| 有限carry | B4 `/oracle_view_boundary_contract/nonfire_read_plan/raw_domain/claims`、同 `/other_claims`、`/technical_decisions` | 現有限枝は全実Claimがfill_definitionの条件を持つ。null/非nullと原presenceを保持する。他kindは保守的に枝外であり、非発火認定ではない。有限枝内の3種definition原行carryを一般nonfillへ自動拡張しない |
| 実発火時の投影 | B4 `/oracle_view_boundary_contract/rule_projection_table`、`/axis_row_selection`、`/finding_reason`、`/multi_occurrence_order` | 既存7 ruleのtyped predicate/witnessが成立した場合のsubject/axis/state/owner・実source refs・row選択・reason/順は指定済み。新しいFinding分類や空witnessは作らない |
| typed対応未決 | B4 `/oracle_view_boundary_contract/unknown_reentry`、`/partial_context_projection`、`/finding_writer_boundary/no_empty_witness` | 対応未決をfalseへ丸めず原read/InputIssueを保持する。型付きsubject未形成時は公開Axis/Findingを捏造しない。semantic/oracleはknowledge_owner、製品値はcore_ownerへ戻す |

B5 `/functions/4/algorithm/3` と `/consumer/fn4_read_binding` の「非null Claim」は、上のfill-only read供給条件と併読する必要がある。これだけから全kindへのtarget読取を要求する解釈は導けない。
一方、読取を必須にしないことから、そのClaimのFN4述語がfalseであるとも導けない。

## rule 68–74の既存対象operandと、未指定の結び目

各ruleはB5 `/failure_rules/<番号>` と、B4 `/oracle_view_boundary_contract/rule_projection_table` の同番号を一体で読む。以下の対象をClaim.kindの文字列だけから生成しない。

| rule | 既存の対象operand／実witness | 既存の返却軸・状態・owner |
|---|---|---|
| 68 | semantic JSONのmeasurement定義欠落と、viewを代替に使う実witness。missing単独では補修ruleを発火させない | measurement.definition / missing / knowledge_owner |
| 69 | semantic JSONのcompletion定義欠落と、viewを代替に使う実witness | completion.definition / missing / knowledge_owner |
| 70 | 表示だけの変更と、意味更新を主張する原Claim出現・そのbasis/view witness | meaning_update_claim / conflict / knowledge_owner |
| 71 | typed measurementと、実際に比較した別適用義務・OracleBindingの対応 | measurement.binding / conflict / knowledge_owner |
| 72 | typed completionと、対応する義務の要求oracle版・completion側oracle版の比較 | completion.binding / conflict / knowledge_owner |
| 73 | completion扱いされた実生成記録と、成立意味条件・対oracleがないことの原read | completion.definition / unknown / knowledge_owner |
| 74 | 原measurement値unknownと、汎用既定値を提案する原Claim/ValueFact・basis witness | measurement.value / unknown / core_owner |

B4 `/oracle_view_boundary_contract/oracle_binding_correspondence` はsubjectと適用義務を別々にtyped対応させ、rule72の版比較をその後に行う。viewpoint/evidenceの完全一致を新gateにしない。この指定もnonfill Claim自体を各operandへ変換する規約ではない。
B5 `/logical_input_structure/schema/$defs/Claim/properties/kind` はstringで、FN4用の閉じたdispatch集合を宣言していない。
B5 `/claim_intent_detail/decoder_rows` の7 kindと `/predicate_reflection_boundary` は、既存rule 1/2/84/86/87/93/88/89等への意図門を定めるが、FN4 rule68–74への対応を定めない。
特にrule70の「意味更新claim」とrule74の「generic default claim」を、どの原kind/actor/proposed_value/basisの意味対応として読むかが未指定である。別ruleへの意図門を借りて同義と扱わない。
未認識kindをunresolvedとして保持する規約も、当該ClaimがF05/F06に無関係という判定ではない。

## 統制へ返す判断候補

不足しているのは「nonfillなら成功／停止」の一語ではなく、Claimの原意味と各FN4 operandの関係である。以下は**未採用の候補**であり、いずれも新L2要求・Claim kind・gate・容量上限を本書で追加しない。

| 候補 | 明示する必要がある意味 | 成立した場合の設計作業／現時点の限界 |
|---|---|---|
| A 対象関係をowner資料で確定してからFN4を評価 | どの既存Claim出現が意味更新・閾値提案等を表すか、どの原source/memberが対象義務・対象値への対応を支持するか | B4でdispatch/関係と未決境界を明記し、B5でその原read/呼出し・返却を導く。いま足りない関係をkind名やbody keyから推定できない |
| B 意味対応未決時の部分返却を明示契約にする | 対象関係未決のまま返せる原軸・未充足の意味と、その返却がF05/F06の評価済みを示さないこと | 既存Comparison4/typed subjectを保つcarry/unknown/返却境界が必要。元有限carryを一般化するだけでは、未評価を空成功へ縮退させる恐れがある。現契約だけではcarry範囲を選べない |

A/Bは実装方式の好みではなく、原意味対応が未決のときどこまでをFN4の返却とするかという差である。同じ意味になる技術的な格納場所・関数分割・loop方式は、意味が確定した後にAIが選ぶ。
現在確定していないClaimを「FN4外」と一括指定する案、全nonfillにfill targetを与える案、typed witnessなしのFinding生成案は、現契約から採用できる候補にしない。
判断対象は既存F05/F06の意味の具体化である。必要な判断の層・authorityは統制が現行上流と照合し、本書だけで新しい人間承認手続きを作らない。PO判断候補として返すのは依頼scope 2の指定による。

再入先はBRAIN032 FN4のL4/L5設計owner。対象Claimの意味対応・原材料と、未形成時のcarry/stop範囲が確定した後、同Binding/revision/scopeの原readから再導出する。
その際の変更箇所はB4 `/oracle_view_boundary_contract` の `raw_domain/other_claims`、`nonnull_claim_target_reuse`、dispatch/operand/部分返却境界、B5 `/functions/4/algorithm/3` と `/source_return_contract/descriptor_target_dataflow/consumer/fn4_read_binding`。既存68–74の意味・literal・ownerを無断変更しない。
B9は実行境界とsystem oracle、B8は対象U-ID表・既存性質参照の範囲で対にする。未決の期待値・全fixture・手書きfreezeは追加せず、確定後の再凍結はWR78設計検証checkerの出力へ接続する。

## 旧source・失敗との対応

旧 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md` §§1–4（asset `LEGACY-ASSET-4F5A1F0739EC1111D91D`）と、同L5 `design-template-json-authority.md` §§2–3（asset `LEGACY-ASSET-98372FEE8A3AC8F9C299`）を直接読んだ。
保持する点はJSON意味/viewの分離、measurement/completionとtrace/oracle、unknownをfalseにしないこと。現行のtyped Claim/FN4/rule68–74は旧sourceに対応dispatchがなく、旧runtimeを移植せず、意味の再導出が必要である。今回はその再導出の未決箇所を特定し、代替意味を採用していない。
同種失敗の起点は旧 `docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md`:80–89（asset `LEGACY-ASSET-A127DEC3EEE6ED63CF17`）のUTW-014（欠損を空集合へ縮退）、UTW-020（partial failureの粗い診断単位）、UTW-021（prose/自己申告の完了根拠）である。現在の16停止を空Comparisonで成功へ進める根拠にはせず、未評価を残す。
旧L4/L5、現行B3/B4/B5、関連L6の検索で、nonfill ClaimとFN4 rule70/74を結ぶ既存の意味規約は確認できなかった。この範囲の未発見であり、全旧repositoryの不存在は主張しない。

## 検証・並行作業との境界

上記JSON Pointer、要求ID、既存ruleの対象operandとscope、旧asset対応を静的に照合する。保存17rawの16FN4停止/1FN1 S3はWR68の観測であり、要求や期待値の根拠にはしない。
WR79はsource分割とL6/L7構成記録、WR80はH009向けF03公開端点である。後続でB5の同dataflowを編集する際はWR80とのpointer単位の競合を明示する。今回の監査ファイルは両作業と重ならない。
旧runtime/test/CIも新実装も実行していない。FN4一般設計、6Comparison全成立、WR13 B、L8、OS、Issueの完了を生成しない。
