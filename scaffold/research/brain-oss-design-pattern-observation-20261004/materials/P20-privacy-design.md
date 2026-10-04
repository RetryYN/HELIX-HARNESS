# P20 privacy設計（目的の制限、最小化、保持と削除、影響評価）の観察（D08 Security）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、期間、件数上限、鍵長等）は持ち込まない。技術選定・採用推奨ではない。法令の解釈・助言ではない。出典の中に法令名や規制当局名が現れても、それは出典側の分類名として扱い、要件の当否は判断していない。Web展開後に扱う内容（利用者向けの同意画面、公開の削除受付窓口等）を1.0の必須にしない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| ethyca/fides | https://github.com/ethyca/fides | e87f3ff835af368defc1ec42dc29ec545a288585（default branch: main） | Apache-2.0 | true | 2026-10-05 | dataの分類（category・use・subject）を宣言として持ち、宣言とpolicyの静的評価、利用目的による実行時のaccess判定、削除・開示要求のgraph実行、影響評価のschemaを1つのrepositoryで読める。GitHub APIでarchived=trueであり、固定commit時点の観察に限る |
| microsoft/presidio | https://github.com/microsoft/presidio | d8847904621733f4eaad4f9bd977b96a11325c90（main） | MIT | false | 2026-10-05 | 非構造textから個人情報を検出し、匿名化・仮名化の操作を差し替え可能にしている。検出に保証がないことを明記している。repository内の`docs/project_transition.md`は、正式URLが別organizationへ移ったと書いている（本書は上記URLの固定commitを読んだ） |
| opendp/opendp | https://github.com/opendp/opendp | c5debf254c914a8f9d03411c63a5de633fa94a9a（main） | MIT | false | 2026-10-05 | 差分プライバシーを、privacy loss（予算）の型付き写像と、予算を超える問合せを拒否するfilterで実装している。証明の検証が済んでいない部品をfeature flagで分けている |
| PostHog/posthog | https://github.com/PostHog/posthog | 451ab38b007af543676d4414fb643ae394b5fa6d（master） | NOASSERTION（LICENSE冒頭：`ee/` 配下は `ee/LICENSE`、第三者部品は各原licenseに従い、それ以外は「MIT Expat」licenseとする旨の記載。本書が読んだpathはすべて `ee/` の外） | false | 2026-10-05 | 個人に帰属する行を持つ全tableを削除対象として1か所に登録し、TTLだけに任せる表を明示し、削除の到達を検証する設計文書と実装がある。削除要求の承認と自動承認の設計文書（plan）もある |
| matomo-org/matomo | https://github.com/matomo-org/matomo | 2053ecaffd849bbc0dd527aa7eb74ca73d705b2d（6.x-dev） | GPL-3.0 | false | 2026-10-05 | data subjectの削除・export、raw logと集計reportの別々の保持期間、遡及的な匿名化job、収集時点の匿名化を1つのpluginで持つ。copyleftのため構造の観察だけにした |

## 観察

### P20-O01 dataの分類を階層のtaxonomyとして持ち、systemの宣言（privacy declaration）をpolicy ruleで静的に評価する
- 出典：fides、`src/fides/core/evaluate.py` 行110–137（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/core/evaluate.py#L110-L137）、行140–179（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/core/evaluate.py#L140-L179）、行182–251（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/core/evaluate.py#L182-L251）、行268–343（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/core/evaluate.py#L268-L343）、行402–430（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/core/evaluate.py#L402-L430）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：
  - systemは `privacy_declarations` を持ち、各declarationは data categories（何のdataか）、1つの data use（何のために使うか）、data subjects（誰のdataか）、参照するdatasetを宣言する。
  - `get_fides_key_parent_hierarchy` は、keyから `parent_key` をたどって祖先の列を作る。category と use は階層を持ち、subject は階層を持たない（行217のcomment）。
  - `compare_rule_to_declaration` は、ruleのkey集合と宣言の祖先列の交差で一致を判定し、ruleの `matches`（ANY／ALL／NONE／OTHER）で違反とするkeyを選ぶ。
  - `evaluate_policy_rule` は category・use・subject の3軸がすべて違反keyを持つときにだけ違反とする（`all([...])`）。
  - 宣言が参照するdatasetについては、dataset・collection・fieldの各層に付いたcategoryでも同じ評価をくり返す。
  - `execute_evaluation` は policy×rule×system×declaration の全組合せを評価し、違反が1件でもあればFAILとする。
- 解いている問題と前提：「このsystemはこの目的でこの種類のdataを使ってよいか」を、実行前に宣言だけから機械判定する。宣言が実態と一致していることと、taxonomyの親子関係が正しいことが前提である。
- 必要な入力：categoryとuseの階層taxonomy、subjectの列挙、systemごとの宣言、dataset・collection・fieldへのcategoryの付与、policy rule（3軸のkeyとmatches）。
- trade-off・失敗の仕方：宣言に無い処理は評価されない（宣言と実装の一致は別の手段で確かめる必要がある）。参照先のkeyやdatasetがtaxonomyに無いと、評価は違反ではなくprocessの終了（`SystemExit(1)`）になる（行133–136、392–398）。3軸のANDのため、1軸でもruleに当たらなければ違反にならず、ruleの書き方次第で見落としが生じうる。
- 反例・適用しない場合：宣言を持たないsystem、利用目的が実行時にしか決まらない処理（P20-O02の実行時判定の方が合う）。
- 互換・非互換：P20-O02（同じtaxonomyを実行時のaccess判定に使う）と組み合わさる。P20-O05（影響評価はdeclaration・data useに紐づく）の入力になる。P05（認可model）のpolicy評価とは、判定の対象が「主体の権限」ではなく「dataの利用目的」である点で異なる。
- 限界：taxonomyの中身（categoryやuseの名前・数）は持ち込まない。このrepoで成立していることは、HELIXで成立することを意味しない。

### P20-O02 利用目的（purpose）をdataset・collection・fieldに宣言し、利用者側の目的との交差で実行時にaccessを判定する。未宣言は違反ではなく「gap」として分ける
- 出典：fides、`policy-engine/pkg/pbac/evaluate.go` 行5–14、99–139（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/policy-engine/pkg/pbac/evaluate.go#L5-L14 、https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/policy-engine/pkg/pbac/evaluate.go#L99-L139）、`pbac/README.md` 行40–72（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/pbac/README.md#L40-L72）、`policy-engine/pkg/pbac/policy_types.go` 行43–73（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/policy-engine/pkg/pbac/policy_types.go#L43-L73）、`policy-engine/pkg/pbac/policy_evaluate.go` 行8–37（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/policy-engine/pkg/pbac/policy_evaluate.go#L8-L37）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `EvaluatePurpose` の規則は3つである。consumer（data利用者の集団）が目的を宣言していなければ、全accessを identity gap とする。datasetの実効目的とconsumerの目的が交差しなければ violation とする。datasetが目的を宣言していなければ dataset gap とする。
  - 実効目的は dataset・collection・field の目的の和集合である（README行42–50）。engineはcollection単位で評価し、fieldの目的は所属collectionへ畳み込まれる（README行52–56）。
  - violationに対してだけ access policy を評価し、gapと適合はそのまま通す（README行70–72）。
  - policyは priority順に評価する。`unless` 条件（consent、geo_location、data_flow）が成立すると、ALLOWはDENYに反転して確定し、DENYは抑止されて次のpolicyへ進む。どのpolicyも一致しなければ `NO_DECISION` になる（policy_evaluate.go 行8–17）。決定が ALLOW／DENY 以外の不正なpolicyは、例外にせず飛ばす（行25–31）。
  - Goの実装はmapの反復順が不定なため、dataset keyを整列して出力を決定的にしている。理由として監査証跡と差分の取りやすさを挙げている（evaluate.go 行24–31）。
- 解いている問題と前提：目的の制限（purpose limitation）を、宣言だけでなく実際のquery（SQLから抽出したtable参照）に当てる。tableがdataset横断で一意に名前解決できることを前提にしている（README行33–38）。
- 必要な入力：目的とdata useの対応、consumerとmemberの対応、dataset・collection・fieldの目的、例外を表すpolicyと、consent等の実行時context。
- trade-off・失敗の仕方：gapを違反にしないため、目的を宣言していないdatasetは止まらない（設定不足を判定と分けて見えるようにする代わりに、未設定のdataが通る）。同じidentityが複数のconsumerにいる場合は最後に読んだものが勝つ（README行126–127）。column単位の判定は対象外と明記している。
- 反例・適用しない場合：queryの対象tableを静的に取り出せない経路（ORMの動的生成、API経由の取得）では、この判定の入力が作れない。
- 互換・非互換：P20-O01（静的評価）と同じtaxonomyを共有する。P05-O08（OPAの「未定義」と「拒否」の区別）、P05-O10（Cerbosの既定拒否）とは、未設定を「gap」として別に数え、既定で拒否しない点が異なる。
- 限界：README冒頭はdemo用fixtureと書いており（行1–7）、Python側の評価器（`fides/service/pbac/evaluate.py`）と、commentが参照する `IMPLEMENTATION_GUIDE.md` は読んでいない。repository内に `fidesplus` への言及があり、非公開側の挙動は確認できない。

### P20-O03 削除・開示の要求を、本人の識別子（identity）を起点とするdataset graphの走査として実行する。削除は開示の走査結果を使い、明示した依存だけで順序付ける
- 出典：fides、`src/fides/api/graph/traversal.py` 行87–104、154–171（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/api/graph/traversal.py#L154-L171）、`src/fides/api/task/create_request_tasks.py` 行95–140（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/api/task/create_request_tasks.py#L95-L140）、行143–224（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/api/task/create_request_tasks.py#L143-L224）、行227–245、395–469（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/api/task/create_request_tasks.py#L395-L469）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - datasetのfield間の参照をedgeとするgraphを持つ。要求に含まれる識別子（seed）が一致するidentity fieldへ、人工のroot nodeからedgeを張って走査を始める（traversal.py 行154–171）。
  - 開示（access）graphは、走査で得た親子関係をそのままedgeにし、下流のない終端nodeを人工のterminatorへつなぐ。commentによれば、あるnodeが失敗したときに下流のnodeをまとめて失敗にできるよう、子孫を計算しやすくしている（create_request_tasks.py 行100–106）。
  - 削除（erasure）graphは、必要なdataを開示の段階で先に集めてあるため、原則として全nodeを並列に動かせる。例外はcollectionが宣言した `erase_after` の依存だけである（行170–178）。
  - `erase_after` が存在しないcollectionを指していればTraversalErrorにする。commentは、削除済みのintegrationを指す古い参照がgraphに幽霊nodeを作る事態を防ぐためと書いている（行184–198）。依存が循環すれば、それもerrorにする（行213–221）。
  - 削除taskは作成時点では実行可能にならず、開示taskの結果を待つ（行402–407、438–441）。削除用のdataには `access_data` ではなく `data_for_erasures` を使う。配列の場合、`access_data` は一致しなかった要素を除くが、削除のqueryには元の位置が要るためである（行464–467）。
  - 同意（consent）graphは、dataset1つにつき1nodeで、node間の依存を持たない（行238–242）。
- 解いている問題と前提：本人の識別子が直接書かれていないtableにも、参照をたどって届くことと、外部キーの都合で削除順が要るtableだけを順序付けることの両立。dataset側のfield参照と、identity fieldの注記が正しいことが前提である。
- 必要な入力：datasetのfield間参照、identity fieldの指定、collectionごとの `erase_after`、要求の種類（開示／削除／同意）と、要求に含まれる識別子。
- trade-off・失敗の仕方：参照の注記が欠けているtableには走査が届かない（届かないこと自体は、到達できないnodeとして扱われる。node filterで「この場面では無関係」と除外もできる。traversal.py 行101–103）。`erase_after` の誤りは循環・宙づり参照として実行前に止まるが、注記されていない順序依存は検出されない。
- 反例・適用しない場合：全dataが1つのDBにあり外部キーのcascadeで消える構成では、graph走査は過剰になりうる。逆に、削除対象をtable registryで列挙する方式（P20-O11）は、走査ではなく「個人に帰属する列を持つ全table」を宣言で持つ。
- 互換・非互換：P20-O04（要求の状態機械）の実行部分にあたる。P20-O06（masking strategy）が削除の具体的な書換えを担う。P20-O11（PostHogの削除対象registry）、P20-O13（Matomoの削除順序の決め方）とは、到達範囲の決め方が異なる。P08（background job）のtask依存・失敗伝播と構造が近い。
- 限界：`run_erasure_request` 以降の実行部、connectorごとの削除queryは読んでいない。

### P20-O04 本人からの要求を、本人確認・承認・重複・外部待ち・最終確定を含む状態機械で扱い、競合条件をTLA+の不変条件で検査する
- 出典：fides、`src/fides/api/schemas/privacy_request.py` 行309–334（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/api/schemas/privacy_request.py#L309-L334）、`src/fides/config/execution_settings.py` 行18–29、76–79（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/config/execution_settings.py#L18-L29）、`specs/dsr_duplicate_detection/DuplicateDetection.tla` 行1–50（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/specs/dsr_duplicate_detection/DuplicateDetection.tla#L1-L50）、`specs/DsrWatchdog.tla` 行1–56（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/specs/DsrWatchdog.tla#L1-L56）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 要求の状態として、本人未確認、入力待ち、承認待ち（pending）、承認・却下、処理中、完了、一時停止、email送信待ち（`awaiting_email_send`）、手動の最終確定待ち、外部system待ち、取消、error、重複、事前承認webhookの応答待ち、事前承認の対象外（webhookが対象外と応答し、人のreviewが要る。`pre_approval_not_eligible`）、開示packageの管理者review待ちを列挙する（行312–334）。
  - 設定で、開示と削除に明示の承認を要するか、本人確認を要するか、削除の全collection実行後に最終確定の段階を置くかを選べる。同意の要求は常に自動承認と書かれている（行20）。
  - `DuplicateDetection.tla` は、同じ本人が確認codeを誤って再申請した場合に2つの要求が別状態で残った不具合を、検出処理と再queueのwatchdogの交互実行としてmodel化している。不変条件は「本人×policyごとに、重複でない処理中の要求は高々1件」と「AがBの重複ならBはAの重複でない」である（行42–46）。
  - `DsrWatchdog.tla` は、親taskが途中で死んだときのwatchdogの判断をmodel化している。不変条件として「取消（error）は再試行回数を使い切った後にしか到達しない」を、活性として「親が死んだ後、要求はいずれ終端状態に至る」を置いている（行37–45）。不具合版と修正版の2つのSpecを並べている（行33–35）。
- 解いている問題と前提：本人以外からの要求、二重の申請、処理の途中停止が、誤った開示・削除や要求の取り残しにつながらないようにする。要求を受け付ける窓口（privacy center等）と、本人確認の手段が別にあることが前提である。
- 必要な入力：要求の種類、本人確認の要否と手段、承認の要否、重複とみなす条件（本人とpolicyの組）、外部systemの待ち、最終確定の要否、再試行の上限（値は持ち込まない）。
- trade-off・失敗の仕方：状態が多く、遷移の組合せで競合が生じる（TLA+のcommentが、実際の不具合を2件ずつmodel化している）。TLA+のmodelはnodeや要求の数を小さく絞っており（DsrWatchdog 行15–17、47–55）、modelの外の分岐は検査していないと明記している。
- 反例・適用しない場合：要求の件数が少なく、人が都度処理する運用では、状態機械と形式検査の費用が見合わない可能性がある。
- 互換・非互換：P20-O03（実行部）の前段にあたる。P20-O12（PostHogの削除要求の承認）とは、要求の主体が本人（fides）か運用者（PostHog）かで異なる。P08-O03（jobの状態機械）、P08-O04（止まったjobの救出）と構造が近い。
- 限界：状態遷移の実装（`request_service.py`、`duplication_detection.py`）は読んでおらず、TLA+のcommentに書かれた範囲の観察である。TLA+の検査結果（TLCの実行）は確認していない（実行していない）。

### P20-O05 影響評価を「版付きtemplate→要求群→質問」と「system・宣言に紐づく評価→回答の不変な版履歴」に分け、回答の出所と人の承認を版ごとに記録する
- 出典：fides、`src/fides/api/models/privacy_assessment.py` 行1–11、44–85（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/api/models/privacy_assessment.py#L1-L85）、`src/fides/api/alembic/migrations/versions/xx_2026_02_05_1500_b2c3d4e5f6g7_add_privacy_assessment_schema.py` 行28–52（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/api/alembic/migrations/versions/xx_2026_02_05_1500_b2c3d4e5f6g7_add_privacy_assessment_schema.py#L28-L52）、行391–420、438–481（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/api/alembic/migrations/versions/xx_2026_02_05_1500_b2c3d4e5f6g7_add_privacy_assessment_schema.py#L438-L481）、行499–549（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/api/alembic/migrations/versions/xx_2026_02_05_1500_b2c3d4e5f6g7_add_privacy_assessment_schema.py#L499-L549）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - templateは key、版、種類、地域、所管、根拠の参照、有効flagを持つ。templateごとに、要求のgroup（順序付き）と、その中の質問（必須flag、guidance付き）を持つ。
  - 評価（`privacy_assessment`）は template、system、宣言、data use、data categoriesに紐づき、状態（進行中／完了／古い／生成中）、risk level、完成度を持つ。
  - 回答は「現在の回答」と「回答の版（`answer_version`）」に分かれる。module docstringは版を「全変更の不変な履歴」と書いている（行10）。版は回答の状態（完了／部分／入力待ち）、出所（system／AI分析／利用者入力／team入力）、確信度、変更の種類（AI生成／人の編集／承認／却下）、作成者、根拠（evidence）、参照元、前版との差分を持つ。
- 解いている問題と前提：影響評価を文書1本ではなく、処理（system×目的）ごとの構造化された記録にし、誰が（AIか人か）どの根拠で答え、誰が承認したかを版で辿れるようにする。評価の単位を宣言（P20-O01）に揃えることが前提である。
- 必要な入力：評価の枠組み（template）とその版、要求の群と質問、評価対象のsystem・宣言・data use・category、回答の出所と根拠、人による承認・却下の記録。
- trade-off・失敗の仕方：状態 `outdated` はenumにあるが、宣言の変更などで評価を古いとみなす処理は、OSS側の `src/fides` では見つからなかった（`outdated` の出現はenum定義だけ）。古くなる条件が実装されていなければ、完了した評価が実態とずれたまま残りうる。AIの回答と人の承認を同じ版の列に置くため、承認されていないAI回答をどう扱うかは利用側の運用に残る。
- 反例・適用しない場合：対象が少なく、評価を人が文書で書く運用では、質問単位の版管理は過剰になりうる。旧HELIXの台帳では「プライバシー設計書」は`todo`だった（D08-M07、SCF-B-0155 D08 §gap）。DPIAを全対象に課すのは過剰として専用templateを作らなかった判断は、旧HELIXではなく現行世代の`scaffold/research/design-template-seed-minimum-gap-20261004/README.md`（行74）にある。本観察は、影響評価を課すかどうかではなく、課す場合の記録の構造である。
- 互換・非互換：P20-O01（宣言）を評価の単位として使う。P11-O07（版の状態機械）と、状態に「古い」を持つ点が近い。
- 限界：template・質問の中身は法令ごとの内容であり、持ち込まない（本書は法令の解釈をしない）。生成task（`AssessmentTaskType.GENERATE`）とAIによる回答生成の実装は読んでいない。

### P20-O06 匿名化・削除の書換えを「操作（strategy／operator）」として差し替え可能にし、可逆な操作を別の型・別のengineに分ける
- 出典：fides、`src/fides/api/service/masking/strategy/masking_strategy.py` 行14–40（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/api/service/masking/strategy/masking_strategy.py#L14-L40）。presidio、`presidio-anonymizer/presidio_anonymizer/operators/operator.py` 行8–39（https://github.com/microsoft/presidio/blob/d8847904621733f4eaad4f9bd977b96a11325c90/presidio-anonymizer/presidio_anonymizer/operators/operator.py#L8-L39）、`presidio-anonymizer/presidio_anonymizer/deanonymize_engine.py` 行13–30（https://github.com/microsoft/presidio/blob/d8847904621733f4eaad4f9bd977b96a11325c90/presidio-anonymizer/presidio_anonymizer/deanonymize_engine.py#L13-L30）、`docs/anonymizer/index.md` 行232–254（https://github.com/microsoft/presidio/blob/d8847904621733f4eaad4f9bd977b96a11325c90/docs/anonymizer/index.md#L232-L254）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - fidesの `MaskingStrategy` は、値の列を書き換える `mask`、秘密（鍵・salt）が要るかを返す `secrets_required`、説明（documentation endpoint用）、data型を扱えるかを返す `data_type_supported` を抽象methodとして持つ。秘密の事前生成（`generate_secrets_for_cache`）は抽象ではなく、必要なsubclassだけが上書きする任意のmethodで、既定は空のlistを返す（行27–29）。実装として null化、hash、HMAC、AES暗号化、固定文字列・乱数文字列への書換え、保持（preserve）がある（同directoryのfile名）。
  - presidioの `Operator` は `operate`、`validate`、`operator_name`、`operator_type` を持ち、`operator_type` が Anonymize か Deanonymize かを返す。`DeanonymizeEngine` は Deanonymize型の操作だけを使う。docsは、逆変換は操作が可逆な場合（暗号化等）に限ると書く（行233）。
  - presidioの組込み操作は、置換、削除（redact）、hash、文字の伏せ（mask）、暗号化、任意関数、外部serviceによる代替値、保持で、逆変換は復号だけである（行239–249）。操作の指定が無い場合は、entityの種類名への置換が既定になる（行251–254）。
- 解いている問題と前提：同じ検出結果・同じ削除対象に対して、「消す」「戻せない形にする」「鍵があれば戻せる形にする」を利用側が選べるようにする。可逆な操作では鍵の管理が別に要ることが前提である。
- 必要な入力：fieldやentityの種類ごとの操作の指定、操作ごとの設定（hashの種類、鍵等。値は持ち込まない）、型の制約（fidesの `data_type_supported`）。
- trade-off・失敗の仕方：可逆な操作（暗号化）を選ぶと、鍵が漏れれば元に戻せる（匿名化ではなく仮名化になる）。presidioの既定（種類名への置換）は値を残さないが、同じ人物の出現を結び付けることもできなくなる。fidesでは型が合わない操作を選ぶと `data_type_supported` で弾く設計で、どの時点で弾くかは読んでいない。
- 反例・適用しない場合：行そのものを物理削除する方式（P20-O11、P20-O13）では、操作の差し替えは要らない。
- 互換・非互換：P20-O08（仮名化の鍵の範囲）が、hash・HMAC・暗号化の連結可能性を決める。P20-O07（検出）の出力がpresidioの操作の入力になる。
- 限界：fidesのfactory（`masking_strategy_factory.py`）と、型の照合を呼ぶ箇所、presidioの各操作の実装（hash以外）は読んでいない。

### P20-O07 非構造dataの個人情報検出を「recognizer群→文脈による補強→閾値→重複の統合→許可list」のpipelineにし、検出に保証がないことを明記する
- 出典：presidio、`presidio-analyzer/presidio_analyzer/analyzer_engine.py` 行233–297（https://github.com/microsoft/presidio/blob/d8847904621733f4eaad4f9bd977b96a11325c90/presidio-analyzer/presidio_analyzer/analyzer_engine.py#L233-L297）、`README.MD` 行55（https://github.com/microsoft/presidio/blob/d8847904621733f4eaad4f9bd977b96a11325c90/README.MD#L55）、`docs/faq.md` 行112–125、137–138（https://github.com/microsoft/presidio/blob/d8847904621733f4eaad4f9bd977b96a11325c90/docs/faq.md#L112-L138）、`presidio-anonymizer/presidio_anonymizer/entities/conflict_resolution_strategy.py` 行6–19（https://github.com/microsoft/presidio/blob/d8847904621733f4eaad4f9bd977b96a11325c90/presidio-anonymizer/presidio_anonymizer/entities/conflict_resolution_strategy.py#L6-L19）、`presidio-anonymizer/presidio_anonymizer/anonymizer_engine.py` 行133–218（https://github.com/microsoft/presidio/blob/d8847904621733f4eaad4f9bd977b96a11325c90/presidio-anonymizer/presidio_anonymizer/anonymizer_engine.py#L133-L218）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `analyze` は、言語と対象entityに合うrecognizerをregistryから取り、NLP処理の結果を共有して各recognizerを順に動かす。続いて文脈語で確信度を補強し、閾値未満を除き、重複を統合し、許可listに一致するものを除く。
  - 閾値で除く処理を重複の統合より前に置いている。commentは、重複spanが1つにまとまるとrecognizer固有の閾値が失われるためと書いている（行284–287）。
  - READMEとFAQは、自動検出なので全ての機密情報を見つける保証はなく、別の仕組みと保護を併用すべきと書く。FAQは、誤検出（false positive）を避ける手段として、受入れ閾値の変更、不要なrecognizerの除去、recognizerの更新・差し替え、外部serviceのrecognizerへの置換を挙げ（faq 行112–123）、どの検出logicにも誤りがあり、誤検出と見逃しの間にtrade-offがあると書く（行125）。
  - API endpointは設計として認証を持たず、認証・認可は別の層で行うよう求めている（faq 行137–138）。
  - 匿名化の前に、検出結果の重なりを解消する。既定の戦略は、同じ種類で重なるものを統合し、他に包含されるものを除く。`REMOVE_INTERSECTIONS` は、残った重なりを確信度の高い方に寄せて境界を切り詰める（anonymizer_engine.py 行192–217）。
- 解いている問題と前提：自由記述のtextやlogのように、どこに個人情報があるか事前に分からないdataへ、最小化（匿名化）を適用する前段の検出。検出は確率的であり、漏れがありうることが前提である。
- 必要な入力：対象言語、検出対象entityの種類、recognizerの集合、文脈語、閾値（値は持ち込まない）、許可list、重なりの解消戦略。
- trade-off・失敗の仕方：FAQが書くのは誤検出と見逃しのtrade-offまでである（行125）。閾値を上げると誤検出は減るが見逃しが増えうる、という閾値と見逃しの関係は本書の推論であり、FAQには書かれていない。`REMOVE_INTERSECTIONS` は、重なった区間を確信度の高い側のentityに含め、低い側のentityの範囲を縮める（anonymizer_engine.py 行203–209）。そのため、低い側の種別としては匿名化されない部分が生じる（重なり区間自体は高い側の種別で処理される）。
- 反例・適用しない場合：schemaでfieldごとに分類が分かっている構造化dataでは、検出よりも宣言（P20-O01）の方が確実である。presidioも構造化data用の別moduleを挙げている（faq 行103）。
- 互換・非互換：P20-O06の操作の入力になる。P20-O01・O02（宣言による分類）とは、分類の出所が「宣言」か「検出」かで異なり、両方を使う場合は食い違いの扱いが要る。
- 限界：個々のrecognizer、文脈補強（`LemmaContextAwareEnhancer`）の実装、評価用の別repositoryは読んでいない。閾値・確信度の値は持ち込まない。

### P20-O08 仮名化（hash・HMAC）の鍵・saltの範囲が、同じ人物の記録を結び付けられる範囲（連結可能性）を決める
- 出典：presidio、`presidio-anonymizer/presidio_anonymizer/operators/hash.py` 行20–63（https://github.com/microsoft/presidio/blob/d8847904621733f4eaad4f9bd977b96a11325c90/presidio-anonymizer/presidio_anonymizer/operators/hash.py#L20-L63）、`docs/anonymizer/index.md` 行256–307（https://github.com/microsoft/presidio/blob/d8847904621733f4eaad4f9bd977b96a11325c90/docs/anonymizer/index.md#L256-L307）。fides、`src/fides/api/service/masking/strategy/masking_strategy_hmac.py` 行36–66、102–115（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/api/service/masking/strategy/masking_strategy_hmac.py#L36-L115）。matomo、`plugins/PrivacyManager/Tracker/RequestProcessor.php` 行52–58、105–122（https://github.com/matomo-org/matomo/blob/2053ecaffd849bbc0dd527aa7eb74ca73d705b2d/plugins/PrivacyManager/Tracker/RequestProcessor.php#L105-L122）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - presidioのhashは、saltが与えられなければentityごとに乱数のsaltを生成する。同じ値でも、entityや呼出しが違えば別のhashになる。docsは、同じ値に同じhashが要る（参照の整合が要る）場合はsaltを明示して渡す必要があり、saltの保管は再識別のriskを上げるので、処理が済んだら捨てることを勧めている（行256–307）。saltには最小長があり、空や短いsaltはerrorにする（値は持ち込まない）。docsは、既定を乱数saltに変えた版より前のhashと一致させるには元のsaltが要り、それが無ければ一致させられないとも書く（行267–268）。
  - fidesのHMACは、鍵とsaltを `SecretsUtil.get_or_generate_secret` から得る（行49–54）。`secrets_util.py` によれば、要求ID（privacy request id）があれば、その要求について事前にcacheされた秘密を取得し、無ければ警告logを出してNoneを返す。要求IDが無い場合（単体のmasking service）は、呼出しごとに秘密を生成する（https://github.com/ethyca/fides/blob/e87f3ff835af368defc1ec42dc29ec545a288585/src/fides/api/util/encryption/secrets_util.py#L21-L43）。同じ要求の中では同じ秘密が使われるので同じ値は同じ結果になる。要求をまたぐと一致しない、というのは要求ごとに別の秘密がcacheされることを前提にした本書の推論で、cacheへ秘密を作る側（`generate_secrets_for_cache` の呼出し元）は読んでいない。
  - matomoのUser IDの仮名化は、設置ごとのsaltとの連結をhashし、同じUser IDが常に同じ値になるようにしている（docblock「pseudo anonymization」、行105–110）。saltが空のときは元のUser IDをそのまま返す（行118–120）。注文IDは乱数と時刻を混ぜてhashし、元の値と結び付かない（行52–58）。
- 解いている問題と前提：仮名化した後に、分析のため同じ人物の記録を結び付けたいか、結び付けられないようにしたいかを、鍵の範囲（entityごと／要求ごと／設置ごと）で選ぶ。saltや鍵が漏れないことが前提である。
- 必要な入力：結び付けたい範囲、saltや鍵の生成・保管・破棄の方法、版の変更で旧来のhashと一致しなくなる場合の扱い。
- trade-off・失敗の仕方：範囲を広くするほど分析の連結はしやすいが、saltが漏れれば辞書攻撃で元の値を推定されやすくなる（presidioのdocsの説明）。matomoのUser IDは、saltが無いと仮名化されずに通る（fail-open）。既定の変更により、元のsaltが無い過去のhashとは一致しなくなる（presidio）。
- 反例・適用しない場合：結び付けが一切要らない場合は、hashではなく削除・置換（P20-O06）で足りる。
- 互換・非互換：P20-O06（操作の差し替え）の中の選択として現れる。P20-O14（matomoの収集時の匿名化）とは、User IDの仮名化を収集時に行う点でつながる。
- 限界：fidesの秘密のcacheの保管先と寿命、cacheへ秘密を作る呼出し元、matomoのsaltの生成・保存箇所は読んでいない。hash algorithmの選択、saltの長さ等の値は持ち込まない。

### P20-O09 差分プライバシーで、問合せを「入力の近さ（privacy unit）→出力の近さ（privacy loss）」の写像を持つ型として表し、宣言した予算を分割して消費を記録する
- 出典：opendp、`rust/src/core/mod.rs` 行132–138、242–259、318–333（https://github.com/opendp/opendp/blob/c5debf254c914a8f9d03411c63a5de633fa94a9a/rust/src/core/mod.rs#L242-L333）、`python/src/opendp/context.py` 行419–455、484–559、612–637（https://github.com/opendp/opendp/blob/c5debf254c914a8f9d03411c63a5de633fa94a9a/python/src/opendp/context.py#L484-L559 、https://github.com/opendp/opendp/blob/c5debf254c914a8f9d03411c63a5de633fa94a9a/python/src/opendp/context.py#L612-L637）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `Measurement` は、入力domain、入力metric、出力measure、function、`privacy_map` を持つ。`PrivacyMap` は入力の距離（隣接するdatasetの差）を受け取り、出力分布の距離の最小の上界を返す関数である（行132–135）。
  - 型で保証できるのはdomain・metric・measureが妥当であることまでで、metricとdomainの整合、privacy mapの正しさは構成関数が証明すべきものと書いている（行244–251）。
  - `check(d_in, d_out)` は、宣言した `d_out` が `map(d_in)` 以上であるかを返す（行327–332）。
  - Pythonの `Context.compositor` は、data、privacy unit（metricと隣接の距離）、privacy loss（measureと上限）を受け取り、予算を均等に、または重みで分割する（2つは排他）。domainを指定しなければdataから推定し、その場合はdataの構造を公開情報とみなすとdocstringに書いている（行496–497）。
  - 問合せを実行するたびに、消費したlossを記録する（行551–559）。残りの予算を返すmethodもある（行618–637）。
- 解いている問題と前提：集計結果の公開による個人の推定を、「1人分の差（privacy unit）が出力に与える影響の上限」として定量化し、複数の問合せの合計を予算の範囲に収める。privacy unitの定義（1人が何行に現れうるか）が正しいことが前提である。
- 必要な入力：privacy unit、privacy lossの種類と上限、問合せごとの予算の配分、dataのdomain（推定する場合は構造が公開情報になる）。予算の値は持ち込まない。
- trade-off・失敗の仕方：予算を細かく分けるほど各問合せの雑音が大きくなる（分割の構造上）。domainをdataから推定すると、その構造（列や型）が公開情報として扱われる（docstringの前提）。privacy mapの正しさは型では保証されず、構成関数の証明に依存する。
- 反例・適用しない場合：個票を扱う処理（本人への開示、削除）には適用しない。差分プライバシーは集計の公開に対する仕組みである。
- 互換・非互換：P20-O10（予算超過の拒否と、検証済みでない部品の分離）が、このcompositorを守る側にあたる。P20-O06（値の書換え）とは、個々の値ではなく集計の出力に雑音を加える点で異なる。
- 限界：個々の雑音機構、合成（composition）の各measureの証明（`.tex`）、Polars連携は読んでいない。

### P20-O10 予算を超える問合せの結果を出さずに以後の問合せを止める（privacy filter）。証明の検証が済んでいない部品や前提に依存する部品をfeature flagで分ける
- 出典：opendp、`rust/src/combinators/privacy_filter/mod.rs` 行35–89、91–138（https://github.com/opendp/opendp/blob/c5debf254c914a8f9d03411c63a5de633fa94a9a/rust/src/combinators/privacy_filter/mod.rs#L35-L138）、`docs/source/api/user-guide/index.rst` 行52–63（https://github.com/opendp/opendp/blob/c5debf254c914a8f9d03411c63a5de633fa94a9a/docs/source/api/user-guide/index.rst#L52-L63）、`docs/source/api/user-guide/limitations.rst` 行8–37（https://github.com/opendp/opendp/blob/c5debf254c914a8f9d03411c63a5de633fa94a9a/docs/source/api/user-guide/limitations.rst#L8-L37）、`rust/Cargo.toml` 行109–114（https://github.com/opendp/opendp/blob/c5debf254c914a8f9d03411c63a5de633fa94a9a/rust/Cargo.toml#L109-L114）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `make_privacy_filter` は、lossを逐次記録するodometerを包み、合計のlossが上限を超えるような問合せを拒否するmeasurementを作る（行35–39）。
  - 内部の継続規則は、問合せを評価した後に、累積lossの見込みを問い合わせる。それが上限を超えていれば、内部の状態を捨てて（以後のすべての問合せを「使い切り」で拒否する）、その問合せの答えも返さずerrorにする（行117–133）。
  - 同じ関数自体がfeature `contrib` の下にある（行20–21）。
  - featureの意味はuser guideに書かれている（index.rst 行52–63）。`contrib` は検証（vetting）の済んでいない構成関数を含める。`honest-but-curious` は、構成関数の引数が正しいことに依存してプライバシーが成り立つ構成関数を含める。`idealized-numerics` は有限精度の問題を無視する数値modelを仮定し、実際のlossを過小評価しうる。`untrusted` は3つをまとめて有効にする（Cargo.toml 行109–114。`floating-point` は `idealized-numerics` の非推奨の別名で、行111）。
  - limitationsは、有限精度の数値によるプライバシーの不成立と、side-channel攻撃への未対策を挙げ、検証が済んだ部品は `contrib` を要しなくなると書く（行11–37）。
- 解いている問題と前提：予算を宣言しても、問合せの側が守らなければ意味がないため、超過を仕組みで止める。さらに、プライバシーの主張がどの前提（証明の検証、引数の正しさ、理想化した数値）に依存するかを、利用者が明示的に有効化しないと使えない形にする。
- 必要な入力：予算の上限と隣接の距離、有効にするfeatureの判断（どの前提を受け入れるか）。
- trade-off・失敗の仕方：問合せを評価してから超過を判定するため、評価の費用は超過した問合せにもかかる（答えは返さない）。上限を超えた時点で以後のすべての問合せが止まり、残りの予算を部分的に使う手段はこのfilterには無い。featureを有効にすると、主張の根拠が弱い部品も同じAPIで使えてしまう。
- 反例・適用しない場合：問合せを1回だけ公開する場合は、filterではなく静的な予算の分割（P20-O09）で足りる。
- 互換・非互換：P20-O09のcompositorと対になる。P10（rate limit）の「上限で拒否する」構造と似るが、ここで消費されるのは回数ではなくプライバシーの損失である。旧HELIXの「検査greenを完了とみなさない」（SCF-B-0155 D08-M02）と、「検証済みと未検証を利用時に区別する」点で関係しうる（照合はしていない）。
- 限界：odometerの実装、`.tex` の証明、vettingの手続き（`contributing/proof-initiation.rst`）は読んでいない。

### P20-O11 個人に帰属する行を持つ全tableを削除対象のregistryに1か所で登録し、TTLだけに任せる表を明示する。即時の削除経路では、削除が届かない場合に成功と報告せず失敗させる（定期の削除jobは報告に留まる）
- 出典：PostHog、`posthog/models/deletion_targets.py` 行1–12、45–59、68–137（https://github.com/PostHog/posthog/blob/451ab38b007af543676d4414fb643ae394b5fa6d/posthog/models/deletion_targets.py#L1-L137）、`docs/internal/clickhouse-deletion-coverage.md` 行1–29（https://github.com/PostHog/posthog/blob/451ab38b007af543676d4414fb643ae394b5fa6d/docs/internal/clickhouse-deletion-coverage.md#L1-L29）、行31–52（https://github.com/PostHog/posthog/blob/451ab38b007af543676d4414fb643ae394b5fa6d/docs/internal/clickhouse-deletion-coverage.md#L31-L52）、行105–140（https://github.com/PostHog/posthog/blob/451ab38b007af543676d4414fb643ae394b5fa6d/docs/internal/clickhouse-deletion-coverage.md#L105-L140）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - module docstringは、個人のdataの削除はevents表の性質ではなく、個人に帰属する行を持つ全tableの性質であると書く。新たに個人のdataを持ち始めたtableは、監査で数か月後に見つかるのではなく、ここへ登録されるようにする（行1–5）。
  - 全targetは、全員が宣言する共通の列だけで作った条件で掃除される（行7–8）。それ以上を要する削除（propertyの書換え、person IDの付け替え）は、targetごとのcapability fieldで表す。docstringは、能力の無いtableに対して呼出し側が黙って飛ばすのではなく、大きな音で失敗するためと書く（行75–76）。
  - capability fieldには、property書換えの可否、person propertiesを保持しているか、person IDの付け替えを受けるか、uuidの候補として読むか、保持しうるevent名がある。property書換えはperson propertiesの保持を前提とし、組合せの不整合は `__post_init__` で拒否する（行132–137）。person IDの付け替えを受けない（`False`）のは、mergeで行が取り残されうるという決定であり、testがその決定の記録を求める（行118–124）。
  - errorの型を、到達できない（`UnreachableTargetError`）、到達できない別tableに行が残る（`UnsweepableRowsError`）、掃除が完了したのに行が読める（`UnsweptRowsError`）に分けている（行45–58）。
  - coverage文書は、TTLだけに任せる表を `TTL_ONLY_TABLES` として列挙し、それぞれが「削除が保持期間だけ遅れてよい」という決定であると書く（行105–108）。
  - 残存件数の数え直しの扱いは経路で異なる。即時のperson削除・event削除の掃除の後は `assert_sweep_complete` が残存を数え、届かなかった行があれば要求を失敗させる（行45）。定期の `deletes_job` は同じ数え直しをするが、gateにせず報告に留め、件数がゼロでなくても数えられなくても要求を検証済みにしてerror logを出す（行46、117–121）。文書は既知のgapとして、全件走査が読込み量の上限を使い切るため、gateにすると全要求が止まり、週ごとに悪化したと記録している（行123–131）。
  - person と adhoc の削除経路の条件は、取込み時刻（`inserted_at`）が要求の作成時刻以前（no later than。NULLは古い行として扱う）の行に限る。取込み時刻はserver側で付くため偽れず、後から取り込まれた行は新しい要求の対象とする。team削除の経路はこの限定を持たない（行46）。
- 解いている問題と前提：保持先が増えたときに削除の漏れが生じることと、削除の仕組みが対象に届かないまま「成功」と報告することの両方を防ぐ。すべての保持先が登録されることが前提である（登録の漏れは、test等の別の仕組みで見つける）。
- 必要な入力：個人に帰属する行を持つtableの一覧、各tableの能力（書換え・付け替えの可否）、TTLだけに任せる表とその理由、削除の範囲を区切る時刻、残存件数の検証方法。
- trade-off・失敗の仕方：TTLだけに任せる表では、削除が保持期間だけ遅れる（文書が明示した決定。期間の値は持ち込まない）。定期の削除jobでは数え直しを報告に留めたため、残存があっても要求は検証済みになる（既知のgap）。personとadhocの経路は作成時刻で区切るため、後から取り込まれた同じ人のdataは別の要求が要る。
- 反例・適用しない場合：保持先が1つのDBで、外部キーで全行に到達できる構成では、registryは過剰になりうる。
- 互換・非互換：P20-O03（graph走査で到達範囲を決める）と対照的に、宣言の一覧で到達範囲を決める。P20-O13（Matomoの削除順序）とは、登録の単位が「table」で共通する。P11-O10（論理削除→確定削除の2段階）と、削除の確定のさせ方で関係する。
- 限界：`delete_events`、`assert_sweep_complete` の実装、comment中で参照されるissue（#93035）の本文は読んでいない。cluster・shardの構成はPostHog固有であり、持ち込まない。

### P20-O12 運用者が出す削除要求を draft→pending→approved の承認経路に置き、自動承認は「直前に自分で測った件数」と閉じた期間に限り、承認者を偽らない
- 出典：PostHog、`docs/plans/2026-07-16-auto-approve-small-event-deletions.md` 行3–24、38–60（https://github.com/PostHog/posthog/blob/451ab38b007af543676d4414fb643ae394b5fa6d/docs/plans/2026-07-16-auto-approve-small-event-deletions.md#L3-L60）、`posthog/models/data_deletion_request.py` 行231–243、786–811、1065–1122（https://github.com/PostHog/posthog/blob/451ab38b007af543676d4414fb643ae394b5fa6d/posthog/models/data_deletion_request.py#L786-L811 、https://github.com/PostHog/posthog/blob/451ab38b007af543676d4414fb643ae394b5fa6d/posthog/models/data_deletion_request.py#L1065-L1122）、`posthog/data_deletion.py` 行24–32、109–158（https://github.com/PostHog/posthog/blob/451ab38b007af543676d4414fb643ae394b5fa6d/posthog/data_deletion.py#L109-L158）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 要求の状態は draft、pending、approved、in_progress、queued、completed、failed で、実行方式は即時と遅延（queueを定期jobが処理する、低影響の経路）である。
  - planによれば、承認が要るのは削除が本番の問合せ性能を落としうる重い処理だからで、小さいevent削除まで人が形式的に承認するのは待ち時間でしかないとしている（行5–8）。
  - 自動承認は、提出画面ではなく定期jobが判断する。jobが件数を自分で測った直後に判断するため、いつ測ったか分からない古い件数を信じずに済む（行14–18）。期間が閉じていない要求は新しいeventに一致し続けるので、自動承認の対象外とする（`auto_approve_blocker` 行1080–1083）。
  - 自動承認した要求は `approved_by` を空のままにし、別のflag `approved_automatically` を立てる。planは、人が承認していないのに名前を入れれば、監査証跡が取り消せない嘘になると書く（行45–46）。
  - 件数の再計算の書込みは `updated_at` で守られ、計算中に条件が変わっていれば `StaleDeletionRequestError` で書き込まない。誰も測っていない条件の件数で承認されるのを防ぐためである（行790–811）。
  - 1件の失敗はlogに残して飛ばし、他の候補の処理を止めない。候補は最後に測った時刻の古い順に選び、承認できない要求が毎回先頭を占めて他を飢えさせないようにしている（行1109–1122）。
  - 利用者側のAPIからの削除要求は、teamごとのadvisory lockの下で提出IDによる冪等性を確かめ、同じ提出IDで内容が違えば衝突とし、進行中の要求数に上限を設ける（data_deletion.py 行118–139）。この要求は承認必須・遅延実行で作られる（行152–154）。
- 解いている問題と前提：削除は戻せない操作なので人の承認を基本にしつつ、影響の小さい要求の待ち時間を減らす。承認の根拠（件数）と承認時点の条件が一致していることが前提である。
- 必要な入力：要求の種類と条件、件数の測定方法、自動承認の条件と上限（値は持ち込まない）、承認者の記録、提出IDと同時要求数の上限。
- trade-off・失敗の仕方：planは、提出画面にはClickHouse teamの権限確認を置かず、どのstaffでも提出でき、それをjobが承認しうることを明記している。その代わりに件数上限、閉じた期間、測定してから判断すること、遅延実行のみ、監査証跡の組合せで影響範囲を抑えるとしている（行56–60）。定期jobの既定はSTOPPEDで、運用者が有効にするまで何も自動承認されない（行54–55）。
- 反例・適用しない場合：本人からの要求（P20-O04）では、本人確認が前段に入り、承認の主体と理由が異なる。
- 互換・非互換：P20-O11（削除の実行と到達の検証）の前段にあたる。P20-O04とは、承認の要否を設定で選ぶ点が共通する。P08-O06（所有しているときだけ書き込むfencing）と、`updated_at` で守る書込みが構造として近い。
- 限界：planは設計文書であり、記述と実装の一致は `auto_approve_blocker` と `auto_approve_pending_requests` の範囲でだけ確かめた。admin画面とDagsterのjob定義は読んでいない。この要求は運用者（staff・team）向けの経路で、個人からの要求の受付窓口は読んでいない。

### P20-O13 data subjectの削除で、log tableの削除順を結合関係から決め、派生した集計を無効化して再計算させ、pluginのdataはevent hookで削除・exportに参加させる
- 出典：matomo、`plugins/PrivacyManager/Model/DataSubjects.php` 行107–144（https://github.com/matomo-org/matomo/blob/2053ecaffd849bbc0dd527aa7eb74ca73d705b2d/plugins/PrivacyManager/Model/DataSubjects.php#L107-L144）、行146–204（https://github.com/matomo-org/matomo/blob/2053ecaffd849bbc0dd527aa7eb74ca73d705b2d/plugins/PrivacyManager/Model/DataSubjects.php#L146-L204）、行242–292（https://github.com/matomo-org/matomo/blob/2053ecaffd849bbc0dd527aa7eb74ca73d705b2d/plugins/PrivacyManager/Model/DataSubjects.php#L242-L292）、行294–300、452–460。信頼性ラベル：primary（GPL-3.0のため構造の観察だけ）。本文確認：済
- 何をしているか：
  - `deleteDataSubjects` は、対象のvisit（site IDとvisit IDの組）を受け取る。まずevent `PrivacyManager.deleteDataSubjects` を発行して、core以外の方法でdataを持つpluginに削除させる（docblockは、coreのlog tableを使うpluginは自動で消えうると書く）。
  - 次に、対象visitの日付をsiteのtimezoneで求め、log tableから削除し、その日付の集計（archive）を後で無効化するよう記録する。集計は削除されたvisitを含んだまま残らず、再計算される。
  - log tableの削除順は、結合経路から決める。commentは、親のtableを先に消すと子のtableの行に辿り着けなくなるため、visit表を最後に、visitとactionの結合表をその前に消すと書く（行248–251）。action表はcronで未使用分を消すため対象から外す（行196–199）。
  - 複数tableの結合が要る削除では、件数を区切った削除ができないため一括で消すとcommentが書く（行232–234）。
  - export（`exportDataSubjects`）も同じくlog tableを読み、pluginがevent経由でexportを補う（docblock 行452–460）。
- 解いている問題と前提：生のlogを消しても、そこから作った集計に個人の痕跡が残る問題と、関連tableを消す順序を誤ると一部の行が孤立する問題。log tableが互いへの結合経路を宣言していることが前提である。
- 必要な入力：対象を特定する識別子（visit）、log tableの結合経路、派生した集計とその元dataの日付の対応、pluginが持つdataの削除・export処理。
- trade-off・失敗の仕方：集計の無効化は「後で」行われるため、再計算までは古い集計が見える。結合を伴う削除は一括なので、大量の行では負荷が集中する。pluginがeventに応答しなければ、そのdataは残る（eventは任意参加）。
- 反例・適用しない場合：集計を持たない、または集計を個人単位で再計算できないsystemでは、日付単位の無効化はそのまま使えない。
- 互換・非互換：P20-O11（PostHogのregistry）とは、対象tableを登録で持つ点が共通し、Matomoはpluginの参加をeventで行う点が異なる。P20-O03（fidesの `erase_after`）とは、削除順を明示の依存で持つか、結合経路から導くかで異なる。
- 限界：本人を見つける検索（`findDataSubjects` 相当）、API層、export形式は読んでいない。GPL-3.0のためコードの転記はしていない。

### P20-O14 保持期間をraw logと集計reportで別々に持ち、削除前に見積りを出す。遡及的な匿名化は要求者・期間・出力を持つjob行として記録し、収集時の匿名化は検出処理の後に行う
- 出典：matomo、`plugins/PrivacyManager/LogDataPurger.php` 行48–102、104–137（https://github.com/matomo-org/matomo/blob/2053ecaffd849bbc0dd527aa7eb74ca73d705b2d/plugins/PrivacyManager/LogDataPurger.php#L48-L137）、`plugins/PrivacyManager/ReportsPurger.php` 行32–67、96–126（https://github.com/matomo-org/matomo/blob/2053ecaffd849bbc0dd527aa7eb74ca73d705b2d/plugins/PrivacyManager/ReportsPurger.php#L96-L126）、`plugins/PrivacyManager/Model/LogDataAnonymizations.php` 行44–62、239–301（https://github.com/matomo-org/matomo/blob/2053ecaffd849bbc0dd527aa7eb74ca73d705b2d/plugins/PrivacyManager/Model/LogDataAnonymizations.php#L239-L301）、`plugins/PrivacyManager/IPAnonymizer.php` 行33–54（https://github.com/matomo-org/matomo/blob/2053ecaffd849bbc0dd527aa7eb74ca73d705b2d/plugins/PrivacyManager/IPAnonymizer.php#L33-L54）、`plugins/PrivacyManager/Config.php` 行21–38（https://github.com/matomo-org/matomo/blob/2053ecaffd849bbc0dd527aa7eb74ca73d705b2d/plugins/PrivacyManager/Config.php#L21-L38）、`plugins/PrivacyManager/Tracker/RequestProcessor.php` 行61–80。信頼性ラベル：primary（GPL-3.0のため構造の観察だけ）。本文確認：済
- 何をしているか：
  - raw logの保持（`LogDataPurger::purgeData`）は、日数を受け取り、それより古いvisitと関連行を消し、event `PrivacyManager.deleteLogsOlderThan` でpluginにも同じ期限で消させる。未使用のactionの削除は、table lockの権限がある場合にだけ行い、無ければ警告して飛ばす（行74–82）。
  - `getPurgeEstimate` は、削除する前にtableごとの削除件数の見積りを返す。TODOのcommentは、見積りと実際の削除が別の方法で範囲を決めるため、見積りが不正確になりうると書く（行115–116）。
  - 集計reportの保持（`ReportsPurger`）は月数を受け取り、基本metricを残す、特定の期間の種類のreportを残す、segmentのreportを残す、の例外を設定で持つ。例外が無ければ古い表ごと捨て、例外があれば該当しない行だけを消す（行96–103）。
  - 遡及的な匿名化は、表 `logdata_anonymization` の1行として予約される。行は対象site、期間、匿名化する項目（IP、位置、User ID）、空にする列、出力、予約・開始・終了の時刻、要求者を持つ（行46–61）。実行時は開始時刻を書き、項目ごとに処理し、失敗は例外を捕まえて出力に書き、最後に終了時刻を書く（行239–301）。
  - 収集時の匿名化では、IPは除外判定の後にmaskする（Config 行28）。位置推定などの補強で匿名化後のIPを使うか、元のIPを使うかを設定で選ぶ（行24–27）。参照元URLの匿名化は、参照元の種類を判定した後に行う。早く匿名化すると判定を誤るためとcommentが書く（RequestProcessor 行67–68）。
- 解いている問題と前提：生の個人dataは短く、集計は長く持つ、という保持の差を、物理的に別の削除処理で実現する。過去に集めたdataにも、後から決めた匿名化を適用する。保持期間と匿名化の範囲を運用者が決めることが前提である（値は持ち込まない）。
- 必要な入力：raw logとreportそれぞれの保持期間、reportの例外（残すmetric・期間の種類・segment）、遡及匿名化の対象期間と項目、収集時の匿名化の段階と、補強処理に元の値を使うかの選択。
- trade-off・失敗の仕方：見積りと実際の削除の範囲がずれうる（TODO）。table lockの権限が無い環境では一部の削除が黙って飛ばされ、警告logだけが残る。遡及匿名化は項目ごとの失敗を出力に書いたまま終了時刻を書くため、終了時刻があっても成功を意味しない。補強に元のIPを使う設定では、匿名化の前に元の値が処理に使われる。
- 反例・適用しない場合：集計を持たない（raw logだけの）systemでは、2つの保持期間は要らない。収集時に識別子を持たない設計（cookieを使わない計測）では、遡及匿名化の対象が小さい。
- 互換・非互換：P20-O13（本人単位の削除）と、期限単位の削除（本観察）は別の処理である。P20-O11のTTL表と、保持期間で消す点が共通する。P20-O08（User IDの仮名化）はこの収集時の段階で動く。P08（background job）の「開始・終了の時刻を持つjob行」と構造が近い。
- 限界：保持の設定画面、scheduled taskの登録、`LogDataAnonymizer` の各SQL、参照元匿名化の段階は読んでいない。GPL-3.0のためコードの転記はしていない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 目的の制限 | fides：宣言（category・use・subject）をpolicy ruleで静的に評価（O01） | fides PBAC：dataset等の目的とconsumerの目的の交差で、実行時のqueryを判定。未宣言はgap（O02） | 処理の目的を事前に宣言できるか、実行時のqueryから対象を取り出せるか |
| 削除の到達範囲 | fides：identityを起点にfield参照のgraphを走査（O03） | PostHog：個人に帰属するtableのregistry＋capability（O11）。Matomo：log tableの結合経路から順序を導き、pluginはeventで参加（O13） | 参照が注記されているか、保持先が宣言で列挙できるか、拡張（plugin）があるか |
| 削除の順序 | fides：`erase_after` の明示依存。宙づり・循環をerror（O03） | Matomo：結合経路から並べ替え、visit表を最後（O13） | 依存を人が書くか、schemaから導けるか |
| 削除の検証・失敗の扱い | PostHog：到達不能はerror。残存の数え直しは即時経路では失敗させ、定期jobでは報告に留める（O11） | fides：失敗したnodeの下流を失敗にする（O03） | 全件の数え直しが費用的に可能か、失敗をtask graphで伝えるか |
| 派生した集計への削除の反映 | Matomo：削除したvisitの日付の集計を無効化し、後で再計算させる（O13） | （他の4 repoでは、本書の範囲で見つからなかった） | 生のdataから集計を作り、長く保持しているか |
| 要求の受付と承認 | fides：本人確認・承認・最終確定を設定で選ぶ状態機械、TLA+で検査（O04） | PostHog：運用者の要求をdraft→pending→approved、自動承認は直前の測定と閉じた期間に限る（O12） | 要求の主体が本人か運用者か、削除の負荷が大きいか |
| 保持期間 | Matomo：raw logとreportを別の期限、reportは残す例外を持つ、削除前に見積り（O14） | PostHog：TTLだけに任せる表を、削除の遅れを許す決定として明示（O11） | 集計を長く持つか、storageがTTLを持つか |
| 匿名化・仮名化の操作 | fides：masking strategyの抽象、型の可否（O06） | presidio：Anonymize／Deanonymizeの型でoperatorを分け、逆変換は別engine（O06） | 構造化された列か、検出したtextの範囲か |
| 仮名化の連結可能性 | presidio：既定はentityごとの乱数salt、明示saltで連結（O08） | fides：要求ごとの鍵とsalt。Matomo：設置ごとのsalt、saltが無いと素通し（O08） | 分析で結び付けたい範囲、saltの保管に耐えられるか |
| 非構造dataの分類 | presidio：recognizer→文脈→閾値→統合→許可list、保証なしを明記（O07） | fides：宣言による分類（O01） | dataの場所と種類が事前に分かっているか |
| 集計の公開 | OpenDP：privacy unit→privacy lossの写像、予算の分割と消費の記録（O09） | OpenDP：予算超過を拒否するfilter、未検証部品のfeature flag（O10） | 問合せが1回か対話的か、前提（証明・数値model）をどこまで受け入れるか |
| 影響評価 | fides：版付きtemplate、system・宣言に紐づく評価、回答の不変な版と出所（O05） | （他の4 repoでは見つからなかった） | 評価を構造化記録にするか、文書にするか |

## 見つからなかったこと・gap
- 同意（consent）の記録の構造（いつ、どの告知の版に、どの範囲で同意したか）と、同意の撤回が下流のsystemへ伝わる仕組みは、fidesのconsent graph（dataset1つにつき1node、依存なし）を見ただけで、同意の記録modelや伝播の実装は読んでいない。PostHogとMatomoの同意は、client側（tracking script）にあり、本書の範囲では読んでいない。
- 影響評価の「古くなる」条件（宣言の変更、data categoryの追加で評価を見直す）は、fidesのOSS側では実装を見つけられなかった（O05）。
- 最小化を「収集の前」に強制する仕組み（宣言にないfieldの収集を拒否する等）は、5 repoとも見つからなかった。Matomoの収集時匿名化（O14）は、収集した後の値の書換えである。
- 削除がbackup・replica・外部へ送ったcopyに届くかの設計は、5 repoとも見つからなかった。PostHogのcoverage文書はClickHouseの表に範囲を限っている。
- 開示（access）で本人に渡すpackageの形式と、本人確認の具体的な手段は読んでいない（fidesの状態名に管理者reviewがあることだけを確認した）。
- k-匿名性などの再識別riskの評価は、5 repoとも本体には見つからなかった。presidioは評価用の別repositoryを挙げている（読んでいない）。
- ADR形式の設計記録は、PostHogのplan（`docs/plans/`）と内部文書（`docs/internal/`）、fidesの `design-docs/`（1件、本テーマ外）、TLA+ spec以外に見当たらなかった。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：fides・presidio・opendpは作業用の一時領域へ `git clone --filter=blob:none --no-checkout` し、固定commitをcheckout（core.hooksPathを無効化）した。PostHog・Matomoは同じ方法でcloneし、checkoutせずに `git show <sha>:<path>` で読んだ。build・test・script・hook・package managerは実行していない。gh apiはmetadata（default branch、SPDX、archived、HEAD commit）の取得に使った。
- fides：`src/fides/core/evaluate.py`（108–430）、`policy-engine/pkg/pbac/evaluate.go`（全体）、`policy_types.go`（全体）、`policy_evaluate.go`（1–80）、`pbac/README.md`（1–150）、`src/fides/api/graph/traversal.py`（72–200）、`src/fides/api/task/create_request_tasks.py`（95–246、395–500）、`src/fides/api/service/masking/strategy/masking_strategy.py`（全体）、`masking_strategy_hmac.py`（全体）、`src/fides/api/util/encryption/secrets_util.py`（21–43）、`src/fides/config/execution_settings.py`（11–120）、`src/fides/api/schemas/privacy_request.py`（309–340）、`specs/DsrWatchdog.tla`（1–60）、`specs/dsr_duplicate_detection/DuplicateDetection.tla`（1–50）、`src/fides/api/models/privacy_assessment.py`（1–90）、privacy assessmentのmigration（20–60、361–560）、`README.md`（冒頭）。読んでいないもの：`fides/service/pbac/evaluate.py`（Python側）、`request_service.py`、`duplication_detection.py`、`graph_task.py`、connector群、`masking_strategy_factory.py`、consent関係のmodel、`clients/`（privacy center等のfrontend）、他のassessment migration（ROPA等）。
- presidio：`presidio-analyzer/presidio_analyzer/analyzer_engine.py`（見出し、230–298）、`presidio-anonymizer/presidio_anonymizer/anonymizer_engine.py`（見出し、133–260）、`entities/conflict_resolution_strategy.py`、`operators/operator.py`、`operators/hash.py`、`deanonymize_engine.py`、`docs/anonymizer/index.md`（225–307）、`docs/faq.md`（100–140）、`docs/design.md`、`docs/project_transition.md`（冒頭）、`README.MD`（55）。読んでいないもの：個々のrecognizer、`context_aware_enhancers`、`presidio-structured`、`presidio-image-redactor`、`operators/encrypt.py`・`aes_cipher.py`。
- opendp：`rust/src/core/mod.rs`（見出し、130–160、242–345）、`rust/src/combinators/privacy_filter/mod.rs`（全体）、`python/src/opendp/context.py`（見出し、419–640）、`docs/source/api/user-guide/index.rst`（1–75）、`limitations.rst`（全体）、`rust/Cargo.toml`（features）。読んでいないもの：`sequential_composition` 以下、各measurement、`.tex` の証明、`docs/source/contributing/`。
- PostHog：`docs/internal/clickhouse-deletion-coverage.md`（1–140）、`docs/internal/person-data-access.md`（全体）、`docs/plans/2026-07-16-auto-approve-small-event-deletions.md`（全体）、`posthog/models/deletion_targets.py`（1–140）、`posthog/models/data_deletion_request.py`（224–255、786–830、1059–1140）、`posthog/data_deletion.py`（全体）、`LICENSE`（冒頭）。読んでいないもの：`posthog/dags/data_deletion_requests.py`、`posthog/dags/deletes.py`、`posthog/api/data_deletion_request.py`、admin、`ee/` 配下（licenseが異なるため対象外にした）。`person-data-access.md` は読んだが、本テーマ（privacy）より性能・整合の話であるため観察にしていない。
- matomo：`plugins/PrivacyManager/Model/DataSubjects.php`（見出し、105–300）、`LogDataPurger.php`（20–189）、`ReportsPurger.php`（20–130）、`Model/LogDataAnonymizations.php`（見出し、44–62、239–302）、`Tracker/RequestProcessor.php`（20–128）、`IPAnonymizer.php`（15–89）、`Config.php`（18–40、属性一覧）。読んでいないもの：`API.php`、`Dao/LogDataAnonymizer.php`、`tracker.js`（同意・opt-out）、`DoNotTrackHeaderChecker.php`、設定画面、`PRIVACY.md`。
- 検索した語（file名・本文）：`delet`、`gdpr`、`consent`、`privacy`、`anonymi`、`retention`、`impact_assessment`／`dpia`、`outdated`、`masking_strict`（fides、該当なし）、`strict`、`salt`、`pseudonym`、`reversib`、`guarantee`、`false negative`、`vetting`、`honest-but-curious`。
- 選ばなかった候補：Ethyca系の別repository（fideslang。taxonomyの定義本体だが、本書はtaxonomyの中身を持ち込まないためfides側の評価だけを読んだ）、PostHogのclient SDK（posthog-js。同意とopt-outはclient側だが、今回は削除の設計に絞った）、OpenMined系・Google differential-privacy（OpenDPで差分プライバシーの構造が読めたため読んでいない）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの固定commitから観察した記録（primary source）である。PostHogのplanと内部文書、fidesのTLA+ specは設計の意図を書いた文書であり、実装と一致するかは一部しか確かめていない（O04、O12）。設計文書と実装をどう区別して記録するかは未決。
- 法令との距離：出典のいくつか（fidesの影響評価template、Matomoのdocblock）は法令名に言及するが、本書は法令の解釈をしていない。法令に由来する知識と、設計の構造に由来する知識をBRAINでどう分けるかは未決。
- scope：観察は、dataの分類と宣言、要求の処理、削除の到達と保持、匿名化の操作、集計の公開に分かれる。D08 Securityのどの単位へ対応させるか、D06（dataのlifecycle、P11）やD07（観測dataのredaction）とどう分けるかは未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。fidesはarchived=trueで上流の更新が止まっている可能性があり、presidioは正式URLが別organizationへ移ったと書いている。上流の移転・停止を版の属性としてどう記録するかは未決。
- 適用の範囲：差分プライバシー（O09・O10）、本人からの要求の受付（O04）、利用者向けの同意は、Web展開後や外部提供の段階で初めて要る可能性がある内容であり、1.0の必須にしない。どの対象に当てはめるかは未決。
- 状態：全観察（P20-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
