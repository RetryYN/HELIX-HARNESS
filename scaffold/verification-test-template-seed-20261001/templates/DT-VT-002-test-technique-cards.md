# DT-VT-002 テスト技法カード（C01〜C40）

## 契約（seed候補）

| 項目 | 内容 |
|---|---|
| template ID／版 | `DT-VT-002`／`0.1.0-seed-candidate`（カードIDは`DT-VT-002/C01`〜`C40`） |
| 状態 | seed候補。採否なし（DST-HARNESS-005は未採択の要求候補） |
| 想定する持ち主 | HELIX-BRAIN（汎用の技法カード）。対象のriskから技法を選び、選んだ・選ばなかった根拠を残すのはHELIX-HARNESS-CORE（HARNESS-L2-034、HARNESS-L2-005）。実行と運転はHELIX-OS |
| 適用条件 | 各カードの「適用」「N/A」欄による。カードごとに判定し、判定はDT-VT-001の非適用の記録で残す |
| 必須入力 | 各カードの「入力」欄。欠けたら技法を実行したことにせず、欠けた入力を未解決として戻す |
| 必須欄（カードごと） | `name / vpair / oracle / negative_oracle / inputs / evidence_specific / applicability / na_conditions / cost / tools / helix_example / anti_patterns` の12欄。共通の証拠欄はDT-VT-001 |
| 関係 | DT-VT-001（共通欄）、DT-VT-003（選び方の案）、DT-VT-101〜106（対ごとの主力・補助）、HARNESS-L2-030〜033（case・data・double生成、最小再現、回帰trace）、HARNESS-L2-034 714（risk別の手法選択）、HARNESS-L2-036（画面の5軸）、HARNESS-L2-049（表示計測oracle） |
| 区分 | カードごとに主な対を持つ（`V-pair`欄）。unit・connection・compositeの別は対から読む（L6↔L7・L5↔L8は主にunit、L4↔L9はconnection、L3↔L10以上はcomposite） |
| 不成立例 | 下の「不成立例」と各カードの`anti-pattern`欄 |
| 計測 | 技法の数値（必要case数、coverage率、mutation閾値、reduction上限）は置かない。HARNESS-L2の「候補関係と1.0境界」でこれらは未採択であり、値はL3で根拠付きで導出する。例に出す数値は例である |
| 出典 | ISO/IEC/IEEE 29119-4、ISTQB CTFL v4.0、IEEE 1012、Google Testing Blog、Software Engineering at Google、Martin Fowlerの記事、各toolの公式docs（末尾のSources）。旧HELIXの技法の名指し箇所は `../materials/source-inventory.md` §4 |
| 限界 | toolの名前は例であり採用ではない。1.0でWeb展開後に扱う項目（canary、本番chaos、本番SLO監視、脆弱性scanの必須化）は、カードに載せても1.0の必須条件にしない。各カードの「HELIX例」は技法の当て方の例で、要求・受入条件ではない |
| 置き換え | 正式なseed packへ採るカードは、新しい版で個別に採否する。採らないカードは`retired`の理由を残す。カードの本文を書き換えるときは版を上げ、旧版で作った証拠を旧版のまま読めるようにする |

### 不成立例（negative oracle）

- 技法を追加したこと、case数・実行回数・coverage%・mutation score・example数を、完成や品質の証拠にする（HARNESS-L2-034「試験手法の追加を完成証拠にしない」）。
- 実行していない技法を「N/A」とし、理由・判断者・対象revision・再評価条件を書かない。
- 旧HELIXのtest・CI・runtimeを、参照実装や合格証拠として実行する（AGENTS.md）。旧資産とは文書・データの静的比較に限る。
- 機械の判定やmodel graderの採点から、prototypeの合意、L3承認、L11受入を作る（HARNESS-L2-049）。

### 正例と境界の負例

- 正例：gate判定の関数を変えるhigh riskの変更で、C11（Red→Green）とC10（差分mutation）を選び、生き残ったmutantごとに処置（負のfixtureの追加、等価mutantとしての除外理由）を記録した。
- 境界の負例：同じ変更で、C10をcostを理由に省いた。省いたこと・理由・回収先ticketを`omitted_checks`に書けば成立する。書かずにC11のgreenだけで「判定ロジックを確かめた」とするのは不成立。

### 完了条件

選んだカードごとに、DT-VT-001の共通欄と、カードの固有の証拠欄が埋まっている。選ばなかったカードのうち、対象のriskに当たるものには非適用の記録がある。**カードを使ったことは、要求の充足・設計の完成・検証の成功を証明しない**（design-template-system-requirements.md「templateの存在は…証明しない」）。

## 本体

略号：P1=L1↔L12、P2=L2（L2.5を含む）↔L11、P3=L3↔L10、P4=L4↔L9、P5=L5↔L8、P6=L6↔L7。各カードの「証拠」はDT-VT-001の共通欄に足す固有の欄である。

「負のoracle」欄の型（FN、FP、代理化、同源化、scope外推）はDT-VT-001 §3による。

### 1. 静的検証・trace系

#### C01 要求・設計のreview／inspection（静的テスト）
- **V-pair**：主にP1〜P5の左側成果物自体の検証（IEEE 1012の「verification」）。P2ではprototype合意前の要求整合。
- **oracle**：checklist（完全性・一貫性・曖昧さ・検証可能性・trace）、上流文書、独立reviewerの判断。
- **負のoracle**：reviewerが作成者と同じ前提を共有（同源化）。checklist埋めだけでpass。指摘0件を品質の証拠と誤認。
- **必要入力**：対象revision、上流revision、checklist版、review scope。
- **証拠（固有）**：`reviewer_identity_class(independent/author)`、`checklist_version`、`findings[{id, severity, location, disposition}]`、`reviewed_scope_digest`、`unreviewed_parts`。
- **適用**：すべての左側成果物の変更。**N/A**：機械生成で上流と同値が証明済みの投影物のみ（理由と生成器版を記録）。
- **cost**：中（人／AI reviewer時間）。
- **tool**：GitHub PR review、ISTQB CTFL §3 static testing（https://istqb.org/）。
- **HELIX例**：HARNESS-L2-056候補文をreviewし、「pairの片側欠落をgreen扱いにしない」が受入条件として反証可能な形か、L0を第7pairにしていないかを確認。
- **anti-pattern**：reviewer名・承認数をmerge admissionの代わりにする（CLAUDE.mdが禁止）。review commentの存在を要求合意と扱う。

#### C02 双方向traceability分析（trace gate）
- **V-pair**：全pair（L2-004、L2-056）。
- **oracle**：各上流項目に設計・検証の対応が存在し、oracle identityが両側で一致すること。孤立項目0、未対応要求0。
- **負のoracle**：link存在＝検証済みと誤認（linkはあるがtestが何も主張しない）。ID一致だけで意味一致を確認しない。
- **必要入力**：要求／設計／test ID台帳、relation、各revision。
- **証拠（固有）**：`orphans_upstream[]`、`orphans_downstream[]`、`oracle_id_mismatch[]`、`stale_links[{id, linked_rev, current_rev}]`、`impact_state: Affected|Unaffected|Unknown`（L2-004：UnknownをUnaffectedにしない）。
- **適用**：要求・設計・testのいずれかに差分がある変更。**N/A**：ほぼ無し（docs-onlyでもtrace対象文書なら適用）。
- **cost**：低（機械化後）。
- **tool**：独自スクリプト、Doorstop（https://github.com/doorstop-dev/doorstop）、OpenFastTrace（https://github.com/itsallcode/openfasttrace）。
- **HELIX例**：trace gateのnegative fixture：「L3要件X-7に対応するL10 oracleが欠落」「L5のoracle-IDとL8のoracle-IDが不一致」を入れ、gateが両方をfailにし、該当pairだけを局所化して返すかを確認（L2-056）。
- **anti-pattern**：trace率%をKPI化してダミーlinkで埋める。Unknownを0件扱い。

#### C03 静的解析・型検査・schema検証・lint
- **V-pair**：P6（原子CI）。schema検証はP4／P5の契約定義にも。
- **oracle**：言語規則・型・JSON Schema等の機械的規則。
- **負のoracle**：規則が意味を表さない（型は合うが単位が違う）。suppress注釈の濫用。local／CIで設定差（L2-036）。
- **必要入力**：tool版、設定digest、対象file集合。
- **証拠（固有）**：`rule_set_digest`、`violations[]`、`suppressions_added[]`、`local_ci_config_equal: bool`。
- **適用**：code／schema／構造化台帳の変更。**N/A**：純粋な散文docs（ただしlink・ID検査は適用）。
- **cost**：低。
- **tool**：ruff/mypy、ESLint/tsc、Semgrep（https://semgrep.dev/）、JSON Schema（https://json-schema.org/）、markdownlint。
- **HELIX例**：`legacy-asset-disposition.jsonl`の各行をschema検証し、必須field欠落・重複IDをfail。
- **anti-pattern**：lint greenを「品質の証明」とする（L2-003：原子CIの合格は品質・システム成立・受入を意味しない）。

---

### 2. 仕様ベース技法（ISO/IEC/IEEE 29119-4、ISTQB CTFL §4.2）

#### C04 同値分割＋境界値分析
- **V-pair**：P5、P3（要件の閾値）。
- **oracle**：仕様が各区間に与える期待出力。境界（min−1/min/max/max+1）。
- **負のoracle**：区間定義が仕様の誤りを継承（同源化）。隠れた区間（null、空、Unicode、タイムゾーン）を落とす。
- **入力**：入力domain定義、仕様上の閾値。
- **証拠**：`partitions[{id, definition, representative, expected}]`、`boundaries[]`、`uncovered_partitions[]`。
- **適用**：数値・長さ・件数・日時・状態を閾値で判定するロジック。**N/A**：入力を持たない変換・純I/O結線。
- **cost**：低。
- **tool**：任意のxUnit、parametrized test（pytest.mark.parametrize）。
- **HELIX例**：debt ratchet（負債件数が前回値を超えたらfail、同数・減少はpass）で `prev=10` に対し `9/10/11`、`prev=0`、`prev=unknown` を検証。unknownは**passにしない**ことを期待値に含める。
- **anti-pattern**：代表値1点のみ。境界値を実装コードから読み取って期待値にする。

#### C05 決定表／原因結果グラフ
- **V-pair**：P5、P3（業務規則）。
- **oracle**：条件組合せ→動作の表。
- **負のoracle**：表の「don't care」簡約で必要な組合せが消える。条件の独立性の誤仮定。
- **入力**：条件・動作の列挙、規則源。
- **証拠**：`table_digest`、`rules[{conditions, action, test_id}]`、`infeasible_rules_with_reason[]`。
- **適用**：複数条件で結果が決まるgate判定。**N/A**：条件1個以下。
- **cost**：低〜中。
- **tool**：表→parametrized test生成スクリプト。
- **HELIX例**：closure gate候補（L2-057）の入力PR／CI／audit／merge／oracle／子Issueの各状態（ok/missing/stale/unknown/conflict）の決定表。「merge済みかつCI greenだがoracle stale」→不成立、を必ず行に含める。
- **anti-pattern**：全組合せ爆発を理由に表を作らず代表例だけにする。

#### C06 状態遷移テスト
- **V-pair**：P5、P4（lifecycle）、P2（画面state、L2-036の`state-transition-drift`）。
- **oracle**：状態機械定義（許可遷移・禁止遷移・guard）。
- **負のoracle**：禁止遷移（invalid transition）を試さない。0-switch（単一遷移）のみで遷移列の不具合を見逃す。
- **入力**：状態・event・guardの定義、初期状態。
- **証拠**：`states[]`、`transitions_covered[]`、`invalid_transitions_tested[]`、`switch_coverage_level`。
- **適用**：成果物状態（Working→…→Observed）、ticket状態、UI状態。**N/A**：状態を持たない関数。
- **cost**：中。
- **tool**：xUnit、XState test（https://stately.ai/docs/testing）、C14と併用。
- **HELIX例**：成果物状態で`Provisional→Verified`の飛越し、`Verified→Accepted`をL10合格だけで自動遷移、を禁止遷移としてfailすることを確認（L2-003／022）。
- **anti-pattern**：正常系の遷移だけを通す。

#### C07 組合せ（pairwise／n-wise）テスト
- **V-pair**：P3、P4（設定・環境・方式の組合せ）。
- **oracle**：各組合せでの期待結果（他技法の期待値を流用）。
- **負のoracle**：3因子以上の相互作用で起きる欠陥を2-wiseは保証しない。制約の誤設定で重要組合せが除外。
- **入力**：因子・水準・制約。
- **証拠**：`model_digest`、`strength(t)`、`generated_cases`、`excluded_by_constraint[]`。
- **適用**：開発方式合成（Vモデル／スクラム／ハイブリッド／リリースカンバン）×駆動×画面有無のような設定空間。**N/A**：因子≤2。
- **cost**：低。
- **tool**：Microsoft PICT（https://github.com/microsoft/pict）、ACTS（NIST）。
- **HELIX例**：L2-002「どの組み合わせでもL1–L3と要件承認・V字の対・品質条件を落とさない」を、方式4×画面2×PoC要否2×risk3のpairwise集合で確認。
- **anti-pattern**：pairwiseを「全組合せ網羅」と報告。

#### C08 受入テスト駆動（ATDD／BDD／Specification by Example）
- **V-pair**：P2（L11受入条件：成功条件と反例）、P3（L10）。
- **oracle**：合意済みの例（Given/When/Then）。
- **負のoracle**：例が要求の意味を狭く固定（例に書かれない条件を落とす）。step定義が空実装でもpass。AIが要求から例を作り人の合意なしに受入oracleと扱う（authority生成の危険）。
- **入力**：要求revision、合意記録、反例。
- **証拠**：`scenario_ids[]`、`agreement_ref`（人の合意のref。本技法は合意を生成しない）、`counterexamples_tested[]`、`undefined_steps=0`。
- **適用**：利用者観点の振る舞い要求。**N/A**：内部refactor（外部振る舞い不変を別技法で示す）。
- **cost**：中。
- **tool**：Cucumber（https://cucumber.io/docs/bdd/）、pytest-bdd、Playwright test。
- **HELIX例**：L11受入例「要求Aの成功条件」と「反例：CI greenだけで受入を主張→拒否」を並べ、両方の観測を記録。
- **anti-pattern**：L10のsystem test合格をL11受入とする（L2-022禁止）。Gherkinを書いたことを受入完了とする。

---

### 3. 構造ベース・test十分性の評価

#### C09 code coverage（文・分岐・MC/DC）— **診断用、oracleではない**
- **V-pair**：P6／P5の補助。
- **oracle**：なし（未実行箇所の発見のみ）。
- **負のoracle**：代理化の典型。assertionなしでも100%。Google Testing Blog「Code Coverage Best Practices」も、高coverageが良いtestを保証しないと明言。
- **入力**：instrumented実行。
- **証拠**：`coverage_kind`、`uncovered_changed_lines[]`（差分coverage）、`justification_for_uncovered[]`。
- **適用**：未実行の変更行の発見。**N/A**：docs、設定のみ。
- **cost**：低。
- **tool**：coverage.py、Istanbul/c8、JaCoCo。
- **HELIX例**：debt ratchetの「unknown分岐」が一度も実行されていないことを検出→C04のcaseを追加。
- **anti-pattern**：coverage%を合格閾値・受入証拠にする。

#### C10 mutation testing
- **V-pair**：P6（test suiteそのものの検証）、P5。
- **oracle**：人工欠陥（mutant）をtestがkillすること。test suiteの「FN率」を測るmeta-oracle。
- **負のoracle**：等価mutant（意味が変わらない）を未kill扱い→FP。mutation operatorが対象の欠陥型を表さない。flaky testでkill判定が揺れる。
- **入力**：対象code、test suite、operator集合、時間予算。
- **証拠**：`mutants_total/killed/survived/equivalent/timeout`、`survived[{location, operator, disposition}]`、`scope: diff|full`。
- **適用**：gate判定・ratchet・状態遷移等の**判定ロジック**（誤っても他で気づかれにくい所）。**N/A**：I/O結線のみ、生成code（理由記録）。
- **cost**：中〜高（diff限定で低減。Googleはcode review上で差分mutantを提示）。
- **tool**：Stryker（https://stryker-mutator.io/）、PIT（https://pitest.org/）、mutmut（https://github.com/boxed/mutmut）、cargo-mutants（https://mutants.rs/）。
- **HELIX例**：V-pair gateの `if design_oracle_id != verify_oracle_id: fail` を `==` に変えるmutantが生存したら、oracle不一致のnegative fixtureが欠けている証拠。
- **anti-pattern**：mutation score%を新たな代理KPIにする。等価mutant判定を記録せず除外。

#### C11 TDD（Red→Green→Refactor）とexpected failureの観測
- **V-pair**：P6（L2-003「L6↔L7でRed→Green→Refactorと双方向traceを閉じる」）。
- **oracle**：先に書いたtestが**期待した理由で**失敗し、実装後に成功すること。
- **負のoracle**：Redを観測しない（最初からgreen＝testが何も検査していない可能性）。失敗理由が期待と違う（import error等）のにRed扱い。testを実装に合わせて書換え。
- **入力**：L5詳細設計の契約、oracle ID。
- **証拠**：`red_run{head_sha, failing_assertion, message}`、`green_run{head_sha}`、`refactor_changes_public_contract: false`、`oracle_id`。
- **適用**：振る舞いを追加・変更する全実装。**N/A**：純refactor（既存testが契約を固定していることを示し、Redは不要と記録）、docs。
- **cost**：低〜中。
- **tool**：xUnit全般。
- **HELIX例**：trace gate実装前に「孤立L3要件があるfixture→gateがfail」testを書き、未実装でRed（期待理由：gate関数未定義ではなく判定がpassを返す）を記録。
- **anti-pattern**：Green後にRedをでっち上げる。局所refactorでpublic contractを変える（L2-003禁止、Backflow対象）。

#### C12 単体テストとtest double（solitary／sociable）
- **V-pair**：P5。
- **oracle**：詳細設計の関数契約。
- **負のoracle**：mockが実物と乖離（mockの期待を検証しているだけ）。実装詳細への過結合で refactorのたびにFP。
- **入力**：L5契約、double方針。
- **証拠**：`doubles[{target, kind: fake|stub|mock, fidelity_check_ref}]`。
- **適用**：詳細設計単位。**N/A**：単体に分解できない設定。
- **cost**：低。
- **tool**：xUnit、Fowler「Mocks Aren't Stubs」、SWE book ch.13 Test Doubles。
- **HELIX例**：Scoped Reverse（L8でL5と照合）で、mockしたconnectorの応答形がL5契約と一致するかをC19の契約と突合。
- **anti-pattern**：mockだらけの単体green→結合を省略。

---

### 4. oracle生成・oracle問題への対処

#### C13 property-based testing（PBT）
- **V-pair**：P5、P6。
- **oracle**：すべての入力で成り立つ性質（不変条件、往復性、冪等性、単調性）。
- **負のoracle**：性質が弱すぎる（「例外が出ない」だけ）。生成器が重要領域を生成しない（分布偏り）。shrink後の最小例を記録しない。
- **入力**：性質の定義、生成器、seed。
- **証拠**：`properties[]`、`examples_run`、`seed`、`generator_distribution_stats`、`counterexample_minimized`。
- **適用**：純関数・変換・判定ロジック。**N/A**：外部副作用中心で性質を定義できない（理由記録）。
- **cost**：中。
- **tool**：Hypothesis（https://hypothesis.readthedocs.io/）、fast-check（https://fast-check.dev/）、QuickCheck、proptest。
- **HELIX例**：debt ratchetの単調性：「任意の履歴列で、ratchetが許容した値の列は非増加」「unknownを1つでも含む入力はpassを返さない」。
- **anti-pattern**：examples数を増やすことを品質証拠にする（L2-034「試験手法の追加を完成証拠にしない」）。

#### C14 model-based／stateful testing
- **V-pair**：P4、P5（状態の所有・遷移）。
- **oracle**：単純な参照model（状態機械）と実装の状態・出力の一致。
- **負のoracle**：modelが実装と同じ誤解を含む（同源化）。modelが並行性を表さない。
- **入力**：model、command集合、事前条件。
- **証拠**：`model_digest`、`command_sequences_run`、`failing_sequence_minimized`。
- **適用**：成果物状態・ticket状態・Release Port等の状態を持つ機構。L2-034が「model-based state machine」をrisk選択肢として明記。**N/A**：状態なし。
- **cost**：中〜高。
- **tool**：Hypothesis stateful（https://hypothesis.readthedocs.io/en/latest/stateful.html）、fast-check model-based（https://fast-check.dev/docs/advanced/model-based-testing/）。
- **HELIX例**：Affected/Unaffected/Unknownの影響状態と成立状態を別に持つmodelで、任意のrelation変更列に対し「Unknownから再検証なしにUnaffectedへ落ちない」を確認（L2-004）。
- **anti-pattern**：modelを実装コードから生成。

#### C15 metamorphic testing
- **V-pair**：P5〜P3（期待値が直接計算できないもの：検索・集計・trace影響範囲・LLM出力）。
- **oracle**：入力変換と出力関係（metamorphic relation, MR）。例：入力の順序置換で結果不変。
- **負のoracle**：MRが満たされても両出力が同じく誤る（MRは必要条件のみ）。MRが弱い。
- **入力**：MR集合、元入力。
- **証拠**：`mrs[{id, transform, expected_relation}]`、`violations[]`。
- **適用**：真の期待値が得にくいとき（oracle問題）。**N/A**：直接の期待値が安価に得られる。
- **cost**：中。
- **tool**：PBT基盤上で実装。Chen et al. 2018 ACM CSUR。
- **HELIX例**：影響範囲導出：「無関係な要求を1件追加してもAffected集合は不変」「relationを1本追加するとAffected集合は単調増加」。
- **anti-pattern**：MR合格を正しさの証明と報告。

#### C16 differential／back-to-back testing
- **V-pair**：P6、P4（再実装・移行・refactor）。
- **oracle**：独立実装または旧実装との出力一致。
- **負のoracle**：両実装が同じ誤り（旧実装のbugを正とみなす）。許容差の設定誤り。
- **入力**：比較対象、入力集合、差分許容規則。
- **証拠**：`reference_impl_id/version`、`inputs`、`diffs[{input, a, b, disposition: bug|intended|tolerance}]`。
- **適用**：refactor、旧資産の意味再導出の検算、parser移行。**N/A**：意図的に振る舞いを変える変更（差分は全件intended記録で代替）。
- **cost**：中。
- **tool**：独自harness、Diffy系、McKeeman 1998。
- **HELIX重要注意**：**旧HELIXのruntime・testを参照実装として実行してはならない**（AGENTS.md）。旧資産とは文書・データの静的比較に限る。
- **HELIX例**：trace gateの新旧2つの独立実装（HELIX内で書いた2本）で同じ台帳snapshotを判定し不一致を列挙。
- **anti-pattern**：差分0を正しさの証拠とし参照側の正しさを問わない。

#### C17 approval／golden master testing
- **V-pair**：P6、P5（複雑な出力の特性化）、legacy特性化。
- **oracle**：人が一度確認・承認した出力ファイル（approved）。
- **負のoracle**：未確認のままapprove（rubber-stamp）。非決定的値（時刻・順序）のscrubbing漏れでFP→一括再承認でFN化。
- **入力**：scrubber、approved file、reviewer。
- **証拠**：`approved_file_digest`、`approved_by_class`、`diff_on_update`、`scrubbers[]`。
- **適用**：レポート生成、gate結果の人向け表示、CLI出力。**N/A**：単純値（通常assertで十分）。
- **cost**：低（維持に規律が必要）。
- **tool**：ApprovalTests（https://approvaltests.com/）。
- **HELIX例**：V-pair gate結果レポート（6 pairの成立／欠落／unknown）をgolden化し、差分をPRで読む。
- **anti-pattern**：差分を読まずに`--update`。承認をmerge admissionや要求合意に読み替える。

#### C18 snapshot testing（UI・構造）
- **V-pair**：P6、P2（prototype構造の退行検知）。
- **oracle**：前回snapshotとの一致（＝**変化検出器**であり正しさのoracleではない）。
- **負のoracle**：初回snapshotが誤っていても固定される。大きなsnapshotは読まれずに更新。
- **入力**：snapshot file、serializer。
- **証拠**：`snapshot_files[]`、`updated_in_this_change[]`、`update_reason`。
- **適用**：構造の予期せぬ変化の検出。**N/A**：意図的大改修（snapshot再生成理由を記録）。
- **cost**：低。
- **tool**：Jest/Vitest snapshot（https://vitest.dev/guide/snapshot）、syrupy、Playwright ARIA snapshot（https://playwright.dev/docs/aria-snapshots）。
- **HELIX例**：画面のaccessibility tree（ARIA snapshot）を固定し、role/name消失を検出。
- **anti-pattern**：snapshot rubber-stamping。snapshot greenを表示検証・受入と扱う（L2-049「静止画、DOMの存在…だけでは表示検証や合格を主張しない」）。

---

### 5. 結合・契約・システム

#### C19 consumer-driven contract testing
- **V-pair**：P4（境界・コネクタの契約。L2-005「Forward 中は触ったコネクタの契約を含む境界の証明」）。
- **oracle**：consumerが期待するrequest/responseの契約をproviderが満たすこと。
- **負のoracle**：契約はschemaのみで意味（順序・冪等性・エラー意味）を表さない。consumerが使わない項目の変更は検出しない（意図通りだが見落とし注意）。契約の版とdeploy実体の対応が取れない。
- **入力**：契約file、provider state、版。
- **証拠**：`contract_id/version`、`consumer_ids[]`、`provider_version`、`verification_result`、`can_i_deploy_matrix`。
- **適用**：機構間通信（CONNECT契約）、HARNESS↔OS境界。**N/A**：同一プロセス内の非公開境界。
- **cost**：中。
- **tool**：Pact（https://docs.pact.io/）、Fowler「ContractTest」。
- **HELIX例**：HARNESSが発行するIssue contract（L2-059の11 field）をconsumer（OS投影）契約で検証し、field rename/dropをfail。
- **anti-pattern**：契約testを結合testの完全代替とする（timeout・retry・失敗伝播はC20/C27で）。

#### C20 結合テスト（実依存・component）
- **V-pair**：P4（L2-003：interface、依存の向き、stateとdataの所有、transaction、失敗伝播、retry、timeout、冪等性）。
- **oracle**：L4基本設計の境界仕様。
- **負のoracle**：本物と異なるemulatorで通る。正常系のみ。
- **入力**：実依存（container等）、fixture、L4 revision。
- **証拠**：`components_under_test[]`、`real_vs_double_map`、`failure_modes_tested[timeout, retry, partial_failure, idempotency]`。
- **適用**：境界を変える変更。**N/A**：単一単体内の変更（Forward小）→省略は記録し合流先ticketで回収（L2-005）。
- **cost**：中。
- **tool**：Testcontainers（https://testcontainers.com/）、SWE book ch.14 Larger Testing。
- **HELIX例**：SQLite等の保存層でbusy timeout時の縮退、再構築を確認（L2-034「永続化・並行運転の測定」）。
- **anti-pattern**：単体全green→結合合格とみなす（L2-005：接続固有義務を満たして初めて接続合格）。

#### C21 system／end-to-endテスト（差分証明）
- **V-pair**：P3。
- **oracle**：L3要件、system固有義務。
- **負のoracle**：巨大E2Eのflakyが常態化（FP→無視）。下位証明の再実行ばかりでsystem固有義務の差分を見ない。
- **入力**：L3 revision、下位証明のreceipt、構成体固有義務リスト。
- **証拠**：`lower_proofs_ref[]`、`system_specific_obligations[{id, status}]`、`composition_contract_ref`、`derived_mechanically: bool`（L2-005：下位証明＋組合せ契約で機械導出してよい）。
- **適用**：Forward大、高risk変更の早期。**N/A**：Forward小・中（省略記録、回収先ticket）。
- **cost**：高。
- **tool**：Playwright（https://playwright.dev/）、pytest。
- **HELIX例**：V-pair gate全体の端から端：台帳投入→6 pair評価→結果表示、を1本だけ。残りは下位証明の積上げで示す。
- **anti-pattern**：E2Eを増やしてCIを恒常的に重くする（L2-005はDesign-refactorで結合を切ることを求める）。

---

### 6. 画面・prototype（L2.5／P2、L2-036の5軸、L2-049）

#### C22 visual regression（screenshot比較）
- **V-pair**：P2（prototype↔受入）、P6（UI実装）。L2-036軸`visual-regression`。
- **oracle**：基準画像との画素差が閾値内。
- **負のoracle**：基準画像自体が未合意。font・AA・OS差でFP→閾値を緩めすぎFN。動的内容のmask漏れ。
- **入力**：baseline画像、viewport/device条件、閾値、mask。
- **証拠**：`baseline_ref{digest, agreed_by_ref}`、`viewport`、`device`、`max_diff_pixels/ratio`、`diff_images[]`、`render_env{browser, version, os, fonts}`。
- **適用**：画面を持つ対象。**N/A**：非画面と根拠付きで判定された対象（L2-036）。画面対象では5軸をN/Aにしない。
- **cost**：中。
- **tool**：Playwright `toHaveScreenshot`（https://playwright.dev/docs/test-snapshots）。
- **HELIX例**：prototypeの主要state（empty/loading/error）×幅（360/768/1280）で基準画像を固定。
- **anti-pattern**：baseline一括更新。画素一致を「見た目の合意」とする（人の合意を代替しない、L2-049）。

#### C23 accessibility自動検査＋手動確認
- **V-pair**：P2、P3（NFR accessibility）。L2-036軸`a11y-regression`、L2-049。
- **oracle**：WCAG 2.2成功基準（例：1.4.3 contrast、1.4.10 reflow、2.4.11 focus not obscured、2.5.8 target size）を機械判定できる範囲。
- **負のoracle**：自動検査はWCAG問題の一部しか検出しない（Dequeの報告でも一部）。violation 0＝準拠ではない。
- **入力**：描画済み画面、rule set版、対象WCAGレベル。
- **証拠**：`ruleset{axe_version, tags}`、`violations[]`、`incomplete[]`（要手動）、`manual_checks[{criterion, result, checker}]`、`not_machine_checkable[]`。
- **適用**：画面対象。**N/A**：非画面。
- **cost**：自動は低、手動は中。
- **tool**：axe-core（https://github.com/dequelabs/axe-core）、@axe-core/playwright（https://playwright.dev/docs/accessibility-testing）、WCAG 2.2（https://www.w3.org/TR/WCAG22/）。
- **HELIX例**：prototype表示計測でaxeの`incomplete`を**unknown**として返し、passにしない（L2-049）。
- **anti-pattern**：axe 0件で「accessible」と主張。

#### C24 表示計測（layout崩れ・はみ出し・state存在・文言量）
- **V-pair**：P2（L2-049）。
- **oracle**：実描画に対する計測（要素bbox がviewport内、横scroll無し、必須state描画、文言量がUI profile上限目安内）。
- **負のoracle**：静止画・DOM存在だけで判定（L2-049禁止）。上限の根拠が無い固定閾値。device条件未指定。
- **入力**：renderable prototype、scope/revision、device/view条件、profile、oracle版、既知fixture。
- **証拠**：`rendered{scope, device, viewport}`、`measurements[{item, oracle, tool_ver, value, result: pass|warning|unknown}]`、`not_measured[]`、`fix_candidates[]`、`backflow_target`。
- **適用**：画面prototype。**N/A**：非画面。
- **cost**：中。
- **tool**：Playwright（`page.evaluate`でbbox・scrollWidth計測）。
- **HELIX例**：幅360pxで`document.documentElement.scrollWidth > clientWidth`をfail、errorステートの非描画をfail、文言が役割別上限を超えたらwarning候補。
- **anti-pattern**：`implemented`や`ux_verified`を出す（049は測定単位のpass/warning/unknownのみ）。

#### C25 検査器の精度評価（known positive/negative fixture、seeded defects）
- **V-pair**：meta（全pairのoracleの信頼性）。L2-049「精度評価が確認できない検査は合格根拠に使わない」。
- **oracle**：既知の正例（欠陥あり）・反例（欠陥なし）fixtureに対する検出の正誤。
- **負のoracle**：fixtureが少なく偏る。fixtureと検査器を同じ作者（同源化）。
- **入力**：labeled fixture集合、検査器版。
- **証拠**：`fixtures{positives, negatives, authority}`、`tp/fp/tn/fn`、`precision/recall`、`unevaluated_scope[]`。
- **適用**：新しい機械検査・gateを合格根拠に使う前。**N/A**：人による判定のみのcheck。
- **cost**：中。
- **tool**：独自harness。C10と同思想。
- **HELIX例**：trace gateに「孤立要求あり」10件・「なし」10件のfixtureを流し、見逃し0を確認。
- **anti-pattern**：fixture数・実行回数を精度の証拠にする（049禁止）。

#### C26 ユーザビリティ・利用者受入（観察・think-aloud・UAT）
- **V-pair**：P2。
- **oracle**：合意済み成功条件と反例に対する**人**の観察・判断。
- **負のoracle**：開発者が利用者役（代表性欠如）。AI simulationを受入とみなす。
- **入力**：受入条件、参加者条件、task。
- **証拠**：`participants_profile`、`tasks[{id, success, observations}]`、`acceptance_record_ref`（人の記録）、`semantic_gaps[]→Backflow`。
- **適用**：利用者が触る成果。**N/A**：利用者接点のない内部部品（上位の受入で扱う理由を記録）。
- **cost**：高。
- **tool**：ISO 9241-11、Nielsen Norman Group（https://www.nngroup.com/articles/usability-testing-101/）。
- **HELIX例**：L11で意味差発見→コードを直さずBackflowで要求へ（L2-003）。
- **anti-pattern**：L10合格からL11を自動合格。AIが受入を自己承認（L2-049禁止）。

---

### 7. 頑健性・異常条件（L2-034「異常条件と検証手法」）

#### C27 fuzzing（coverage-guided／構造化）
- **V-pair**：P5、P6（parser・入力境界）。
- **oracle**：暗黙oracle（crash、sanitizer、assert、無限ループ）＋任意の性質。
- **負のoracle**：暗黙oracleは意味の誤りを検出しない。corpus・時間不足。
- **入力**：harness、seed corpus、時間予算。
- **証拠**：`harness_id`、`duration`、`execs`、`corpus_digest`、`crashes[{input_ref, minimized}]`、`coverage_growth`。
- **適用**：外部入力を解釈するparser（台帳JSONL、markdown、YAML front matter）。**N/A**：外部入力なし。
- **cost**：中（継続実行はcost大。1.0では任意）。
- **tool**：libFuzzer（https://llvm.org/docs/LibFuzzer.html）、Atheris（https://github.com/google/atheris）、Go fuzzing（https://go.dev/doc/security/fuzz/）、OSS-Fuzz（https://google.github.io/oss-fuzz/）、Hypothesisも可。
- **HELIX例**：`legacy-asset-disposition.jsonl` parserを壊れた行・巨大行・不正UTF-8でfuzz、例外は型付きfindingに。
- **anti-pattern**：「N時間fuzzして0 crash」を正しさの証明とする。

#### C28 fault injection／chaos／resilience
- **V-pair**：P4（失敗伝播・retry・timeout）、P1（本番、**1.0非必須**）。
- **oracle**：定常状態仮説（steady-state hypothesis）が障害注入下で保たれる／定義された縮退をする。
- **負のoracle**：定常状態の指標が不適切。blast radius管理なしの本番実験。
- **入力**：仮説、注入種別、範囲、中止条件。
- **証拠**：`hypothesis`、`faults[{type, target, duration}]`、`steady_state_metrics_before/during/after`、`abort_conditions`、`rollback_done`。
- **適用**：local／test環境での依存障害（HELIX 1.0ではこちらのみを候補）。**N/A**：単一プロセス純関数。本番chaosは1.0でN/A（理由：web配備後項目）。
- **cost**：中〜高。
- **tool**：Principles of Chaos（https://principlesofchaos.org/）、Toxiproxy（https://github.com/Shopify/toxiproxy）、Chaos Mesh（https://chaos-mesh.org/）。
- **HELIX例**：GitHub API timeout注入時、projectionが「CI成功」や「merge済み」を推測生成せずunknownを返すこと（L2-057）。
- **anti-pattern**：「障害を起こしても動いた」の観察を仮説なしで報告。

#### C29 並行性・race・crash recovery・soak
- **V-pair**：P4、P3。
- **oracle**：線形化可能性・不変条件・再起動後の状態一致・長時間での資源非増加。
- **負のoracle**：再現しない単一失敗を原因確定と扱う（L2-034禁止）。スケジューリングが偏り race が出ない。
- **入力**：並行度、実行時間、kill点。
- **証拠**：`concurrency`、`schedule_seed`、`invariant_violations[]`、`crash_points[]`、`recovery_state_diff`、`resource_trend`。
- **適用**：DB/投影/継続state、gate・approval・cutover・projectionの状態境界（L2-034）。**N/A**：無状態。
- **cost**：高。
- **tool**：Jepsen系思想（https://jepsen.io/）、Hypothesis stateful＋thread、`stress-ng`。
- **HELIX例**：2つのsessionが同じticketの状態を同時更新しても、Verifiedを経ずAcceptedへ進まない。
- **anti-pattern**：1回通ったのでrace無しと判断。

---

### 8. 性能・計測・観測（L2-034計測契約）

#### C30 性能・負荷試験（閾値付き）
- **V-pair**：P3（NFR）、P4（境界の遅延）。
- **oracle**：L2-034の14項目（metric、baseline、target/SLO、許容差、sampling/window、probe、evidence schema、再測定trigger…）に基づく閾値。
- **負のoracle**：非代表環境・別revisionの結果（L2-034で相殺禁止）。平均値のみ（p95/p99を見ない）。warm-up・coordinated omission。
- **入力**：workload model、環境、data量、閾値、baseline。
- **証拠**：`metric_id`、`nfr_id`、`workload{vus, rate, duration}`、`env_representativeness`、`baseline_ref`、`p50/p95/p99`、`error_rate`、`threshold_results`、`overhead`。
- **適用**：性能要求のある対象、性能退行が懸念されるrefactor。**N/A**：性能要求なし→「unknown」ではなく「要求なし」を根拠付きで記録。
- **cost**：中〜高。
- **tool**：k6 thresholds（https://grafana.com/docs/k6/latest/using-k6/thresholds/）、pytest-benchmark、hyperfine。
- **HELIX例**：V-pair gateを1万要求規模の台帳で実行しp95を計測、baselineの+20%を超えたらfail（数値は例、L3で根拠付き導出）。
- **anti-pattern**：targetを推測で決めてgreen化（L2-034「未知のbaselineや閾値を推測してgreenにしない」）。

#### C31 observability-based／trace-based testing
- **V-pair**：P4（内部の呼出し・副作用）、P1（運用）。
- **oracle**：trace/span・metric・logに対するassertion（例：DB呼出し1回、下流status、span時間）。
- **負のoracle**：計装漏れ＝検査対象が見えない（不在をpassにしない）。sampling でspan欠落。
- **入力**：計装、collector、assertion定義。
- **証拠**：`trace_ids[]`、`span_selectors`、`assertions[{selector, expected, actual}]`、`instrumentation_version`、`sampling_rate`。
- **適用**：非同期副作用、重複呼出し検出。**N/A**：計装なしの小ツール（1.0では多くがN/A、理由記録）。
- **cost**：中。
- **tool**：OpenTelemetry（https://opentelemetry.io/docs/）、Tracetest（https://tracetest.io/）。
- **HELIX例**：gate評価1回でoracle取得がN+1になっていないことをspan数で確認（将来版）。
- **anti-pattern**：dashboardを見て「問題なし」をテスト結果とする。

#### C32 canary分析・rollback検証（web配備後、**1.0非必須**）
- **V-pair**：P1、Release Port（rollback条件、L2-003）。
- **oracle**：canary群とcontrol群のmetric比較の統計判定、rollback実行後の状態回復。
- **負のoracle**：traffic・時間が少なく検出力不足。metric選定の誤り。rollback手順を一度も実行していない。
- **入力**：比較metric、期間、判定閾値、rollback手順。
- **証拠**：`canary_config`、`metrics_compared`、`verdict`、`rollback_rehearsal{done_at, result, time_to_restore}`。
- **適用**：web配備・本番運用を持つ製品。**N/A**：1.0のlocal harness（理由：配備後項目、Release Portに条件だけ置く）。
- **cost**：高。
- **tool**：Google SRE Workbook ch.16（https://sre.google/workbook/canarying-releases/）、Kayenta（https://github.com/spinnaker/kayenta）、Argo Rollouts analysis（https://argo-rollouts.readthedocs.io/en/stable/features/analysis/）。
- **HELIX例（1.0で可能な範囲）**：Release Portのrollback条件を「手順書の存在」でなく「local rehearsalのreceipt」で示す。
- **anti-pattern**：Deployed＝Observedと扱う（L2-003：Observedは運用評価を通った状態）。

#### C33 運用評価（SLO・企画仮説の検証）
- **V-pair**：P1。
- **oracle**：L1企画の成功指標・SLO、error budget。
- **負のoracle**：vanity metric。L12結果をL1だけに戻しL0 charterへのfeedbackを落とす（L2-056はL1とL0の両方を識別）。
- **入力**：企画仮説、metric定義、期間。
- **証拠**：`hypothesis_id`、`metric_series_ref`、`period`、`verdict`、`feedback_targets[L1, L0]`。
- **適用**：運用される製品。**N/A**：未配備（Observed状態に到達しない理由を記録）。
- **cost**：中。
- **tool**：Google SRE Book「Service Level Objectives」（https://sre.google/sre-book/service-level-objectives/）。
- **HELIX例**：「人の判断回数が減った」という企画仮説を、ticket記録から期間比較。
- **anti-pattern**：測れない仮説を「達成」とする。

---

### 9. test基盤の健全性

#### C34 flaky test検出・隔離
- **V-pair**：meta（全pair）。
- **oracle**：同一revision・同一入力で結果が変わらないこと。
- **負のoracle**：再実行で通ったら合格（flakyを隠す）。隔離したまま回収しない。
- **証拠**：`reruns`、`outcomes`、`quarantined[{test, reason, owner, recovery_ticket}]`。
- **適用**：非決定的要素（時刻・並行・network）を含むtest。**N/A**：純関数test。
- **cost**：低〜中。
- **tool**：Google Testing Blog「Flaky Tests at Google」（https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html）、Fowler「Eradicating Non-Determinism in Tests」（https://martinfowler.com/articles/nonDeterminism.html）。
- **HELIX例**：隔離testを「省いた検査」としてL2-005の回収先ticketに登録、未回収ならRelease Portで止める。
- **anti-pattern**：自動retryで黙って緑化。

#### C35 dependency更新の検証（lockfile差分・互換性）
- **V-pair**：P6、P4。
- **oracle**：lockfile差分の説明、既存test・契約testの非退行、breaking change noteの確認。
- **負のoracle**：transitive依存の変化を見ない。testが依存の変更箇所を触らない。
- **証拠**：`lock_diff`、`changelog_reviewed[]`、`affected_contracts[]`、`license_change`。
- **適用**：依存更新。**N/A**：依存変更なし。
- **cost**：低〜中。
- **tool**：Renovate/Dependabot、`pip-audit`、OSV（https://osv.dev/）。脆弱性scanは1.0で必須にしない（参考情報として記録可）。
- **HELIX例**：markdown parser更新時、台帳parserのgolden（C17）とfuzz corpus（C27）を再実行。
- **anti-pattern**：自動PRのCI greenだけでmerge。

---

### 10. 独立V&V・LLM／agent評価

#### C36 独立review（IV&V）— 人／別AI
- **V-pair**：全pair。IEEE 1012の独立性（technical/managerial/financial）の考え方。
- **oracle**：独立者の判断と反証可能な指摘。
- **負のoracle**：同モデル・同promptのAIが作成とreviewを兼ねる（同源化）。reviewer名だけで独立を主張。
- **証拠**：`reviewer_independence{different_session, different_model_or_human, no_shared_context}`、`exact_head_sha`、`findings`、`unresolved_blockers=0`。
- **適用**：PR全般（HELIX現行運用）。**N/A**：なし。
- **cost**：中。
- **tool**：GitHub PR comment。
- **HELIX例**：review_merge laneがexact HEADを読みfindingをPR commentへ記録。
- **anti-pattern**：review結果から要求承認・Issue closeを生成（CLAUDE.md禁止）。

#### C37 reference solution＋hidden（held-out）tests
- **V-pair**：P6（AI実装の評価）、LABOの比較評価。
- **oracle**：作成者（AI）から隠されたtest。reference solutionで解けることを事前確認。
- **負のoracle**：hidden testが過剰に具体的（正しい別解をfail）、または弱い（誤解をpass）。SWE-bench Verifiedはこの両問題を人手で除去した例。testが実装者に漏れる。
- **入力**：task記述、hidden test、reference solution、隔離手段。
- **証拠**：`task_id`、`hidden_test_digest`、`reference_passes: true`、`leak_check`、`fail_to_pass/pass_to_pass`。
- **適用**：AI Worker出力の独立検証、LABOの能力比較。**N/A**：人が書いたcode（通常のtestで足りる）。
- **cost**：中〜高（test作成）。
- **tool**：SWE-bench（https://www.swebench.com/）、OpenAI「Introducing SWE-bench Verified」、Inspect（https://inspect.aisi.org.uk/）。
- **HELIX例**：AIがL7 testとL6実装を同時に書く場合の同源化対策として、L5設計から別sessionでhidden受入testを先に作り、実装sessionに見せない。
- **anti-pattern**：実装したAIが書いたtestだけで合格。

#### C38 rubric／model-graded評価と人のcalibration
- **V-pair**：P2（文言・説明品質）、P3（LLM機能の非機能）、reviewの補助。
- **oracle**：rubric（観点・水準・例）に基づく採点。model grader＋人の抜取りcalibration。
- **負のoracle**：LLM judgeの位置bias・冗長bias・自己選好。rubric曖昧で一致率低。calibrationなし。
- **入力**：rubric版、grader model/prompt版、人手label subset。
- **証拠**：`rubric_digest`、`grader{model, prompt_digest, temperature}`、`scores`、`human_agreement{kappa or %, n}`、`disagreements[]`。
- **適用**：決定的に検査できない出力。Anthropic「Demystifying evals」も「可能ならoutcome/stateの決定的検査を優先」。**N/A**：決定的oracleが存在する場合。
- **cost**：中。
- **tool**：Inspect、OpenAI Evals（https://github.com/openai/evals）、Zheng et al. 2023「Judging LLM-as-a-Judge」。
- **HELIX例**：L2-049の文言量finding（冗長・反復・説明のための説明）をmodel graderが候補化し、warning止まりとし合格根拠にしない。
- **anti-pattern**：LLM judgeのscoreを受入・承認に使う。

#### C39 pass@k／pass^k・反復試行
- **V-pair**：LABO比較評価、AIを含む対象の判断再現性（L2-034のAI品質条件）。
- **oracle**：n回試行中c回成功から pass@k = 1 − C(n−c,k)/C(n,k)（Chen et al. 2021、不偏推定）。信頼性はpass^k（k回すべて成功、τ-bench）。
- **負のoracle**：pass@kは「k回のうち1回当たればよい」＝運用信頼性を過大評価。nが小さく分散大。seed・温度未記録。
- **証拠**：`n`、`c`、`k`、`estimator`、`temperature/seed`、`model_version`、`ci95`。
- **適用**：AI Worker・model・prompt比較。**N/A**：決定的処理。
- **cost**：中（試行回数に比例）。
- **tool**：human-eval（https://github.com/openai/human-eval）、τ-bench（arXiv 2406.12045）。
- **HELIX例**：同一ticketを同一条件で5回走らせ、gate判定が5回とも同じか（pass^5）で判断再現性を見る。
- **anti-pattern**：best-of-kの結果を単発性能として報告。

#### C40 contamination（汚染）検査
- **V-pair**：LABO比較評価、C37の前提。
- **oracle**：評価taskが学習・文脈・memoryに含まれていないこと（時刻窓、canary string、n-gram重複、文脈への解答混入検査）。
- **負のoracle**：完全な否定は不可能（検出は下限）。memory・repo内に解答が残る（agent特有）。
- **証拠**：`task_created_after_cutoff`、`canary_string_check`、`overlap_scan`、`context_leak_scan{memory, repo, prompt}`。
- **適用**：AI能力の比較・改善効果の測定。**N/A**：AIを含まない対象。
- **cost**：低〜中。
- **tool**：LiveCodeBench time window（https://livecodebench.github.io/）、BIG-bench canary GUID慣行。
- **HELIX例**：改善episode評価で、評価taskの解答がmemory/やscaffold/に残っていないかscanし、あればその試行を無効（L2-034「memory汚染耐性」）。
- **anti-pattern**：公開benchmarkの高得点を自組織タスクでの能力とみなす。


---

### Sources

規格・syllabus
- ISO/IEC/IEEE 29119-4:2021 Test techniques — https://www.iso.org/standard/79430.html
- IEEE 29119-4 (IEEE SA) — https://standards.ieee.org/ieee/29119-4/7500/
- IEEE 1012-2024 System, Software, and Hardware V&V — https://ieeexplore.ieee.org/document/10669285/ ／ https://store.accuristech.com/standards/ieee-1012-2024?product_id=2904795
- ISTQB CTFL Syllabus v4.0 — https://istqb.org/ ／ https://www.bcs.org/qualifications-and-certifications/certifications-for-professionals/software-testing-certifications/istqb-certified-tester-foundation-level/ ／ https://archive.org/details/istqb-ctfl-syllabus-v-4.0
- WCAG 2.2 — https://www.w3.org/TR/WCAG22/

Google／SWE book／SRE
- Software Engineering at Google（SWE book） — https://abseil.io/resources/swe-book
- SWE book ch.14 Larger Testing — https://abseil.io/resources/swe-book/html/ch14.html
- Google Testing Blog — https://testing.googleblog.com/
- Code Coverage Best Practices — https://testing.googleblog.com/2020/08/code-coverage-best-practices.html
- Flaky Tests at Google — https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html
- State of Mutation Testing at Google (ICSE-SEIP 2018) — https://research.google/pubs/state-of-mutation-testing-at-google/ ／ https://research.google.com/pubs/archive/46584.pdf
- SRE Workbook: Canarying Releases — https://sre.google/workbook/canarying-releases/
- SRE Book: Service Level Objectives — https://sre.google/sre-book/service-level-objectives/

Martin Fowler
- The Practical Test Pyramid — https://martinfowler.com/articles/practical-test-pyramid.html
- ContractTest — https://martinfowler.com/bliki/ContractTest.html
- Mocks Aren't Stubs — https://martinfowler.com/articles/mocksArentStubs.html
- Eradicating Non-Determinism in Tests — https://martinfowler.com/articles/nonDeterminism.html
- TestCoverage — https://martinfowler.com/bliki/TestCoverage.html

技法・tool
- Hypothesis — https://hypothesis.readthedocs.io/ ／ stateful: https://hypothesis.readthedocs.io/en/latest/stateful.html
- fast-check — https://fast-check.dev/ ／ model-based: https://fast-check.dev/docs/advanced/model-based-testing/
- Metamorphic Testing: A Review of Challenges and Opportunities (ACM CSUR 2018) — https://doi.org/10.1145/3143561
- Stryker — https://stryker-mutator.io/ ／ PIT — https://pitest.org/ ／ mutmut — https://github.com/boxed/mutmut ／ cargo-mutants — https://mutants.rs/
- Pact — https://docs.pact.io/
- Testcontainers — https://testcontainers.com/
- ApprovalTests — https://approvaltests.com/
- Vitest snapshot — https://vitest.dev/guide/snapshot ／ Jest snapshot — https://jestjs.io/docs/snapshot-testing
- Playwright visual comparisons — https://playwright.dev/docs/test-snapshots ／ ARIA snapshots — https://playwright.dev/docs/aria-snapshots ／ accessibility testing — https://playwright.dev/docs/accessibility-testing
- axe-core — https://github.com/dequelabs/axe-core ／ Deque automated coverage report — https://www.deque.com/automated-accessibility-coverage-report/
- XState testing — https://stately.ai/docs/testing
- Microsoft PICT — https://github.com/microsoft/pict
- Cucumber BDD — https://cucumber.io/docs/bdd/
- Nielsen Norman Group usability testing — https://www.nngroup.com/articles/usability-testing-101/
- libFuzzer — https://llvm.org/docs/LibFuzzer.html ／ Atheris — https://github.com/google/atheris ／ Go fuzzing — https://go.dev/doc/security/fuzz/ ／ OSS-Fuzz — https://google.github.io/oss-fuzz/
- Principles of Chaos Engineering — https://principlesofchaos.org/ ／ Toxiproxy — https://github.com/Shopify/toxiproxy ／ Chaos Mesh — https://chaos-mesh.org/ ／ Jepsen — https://jepsen.io/
- k6 thresholds — https://grafana.com/docs/k6/latest/using-k6/thresholds/
- OpenTelemetry — https://opentelemetry.io/docs/ ／ Trace-based testing the OTel demo — https://opentelemetry.io/blog/2023/testing-otel-demo/ ／ Tracetest — https://tracetest.io/
- Kayenta — https://github.com/spinnaker/kayenta ／ Argo Rollouts analysis — https://argo-rollouts.readthedocs.io/en/stable/features/analysis/
- Semgrep — https://semgrep.dev/ ／ JSON Schema — https://json-schema.org/ ／ OSV — https://osv.dev/
- Doorstop — https://github.com/doorstop-dev/doorstop ／ OpenFastTrace — https://github.com/itsallcode/openfasttrace

LLM／agent評価
- Chen et al. 2021, Evaluating Large Language Models Trained on Code（pass@k） — https://arxiv.org/abs/2107.03374 ／ human-eval — https://github.com/openai/human-eval
- SWE-bench — https://www.swebench.com/ ／ SWE-bench Verified — https://openai.com/index/introducing-swe-bench-verified/ ／ https://www.swebench.com/verified.html
- LiveCodeBench（contamination-free time window） — https://arxiv.org/abs/2403.07974 ／ https://livecodebench.github.io/
- Anthropic, Demystifying evals for AI agents — https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- Zheng et al. 2023, Judging LLM-as-a-Judge — https://arxiv.org/abs/2306.05685
- τ-bench（pass^k） — https://arxiv.org/abs/2406.12045
- UK AISI Inspect — https://inspect.aisi.org.uk/
- OpenAI Evals — https://github.com/openai/evals
