# WR181 OS015 複合負例classの形成規則

## 対象と境界

これはWR181作業依頼 (1) のL4/L5形成規則と、141件のL7入力刺激を対応付ける静的記録である。L9の出現組合せからclassを逆生成しない。既存L8/L9のcase単位expectedは変更しない。

Scaffold Binding `SCF-B-0170` は静的inventoryと有限性算定の補助資料で、状態は `registered`、replacementは `pending` である。正式な形成規則はL4/L5に記録する。binding状態は4層coverage成立やchecker合格を示さない。

対象は `docs/helix-os/L4-basic-design/management-authority-source-record.json` の `diagnostic_contract` と `failure_classifications`、および `docs/helix-os/L5-detail-design/management-authority-source-record.json` の `formal_reference`、`input_boundary`、`failure_rules` である。要求の意味、承認、authority、実際のwriterは追加しない。

## 形成規則案

1. L4が出すfinding全件を使う。順序はL4の最終sort `(code, pointer, return_owner)` の順とし、checkerの `expected.finding_codes` は各findingのcode列をそのまま写す。同codeでもpointerが異なるfindingは重複codeとして残す。codeだけをset化しない。
2. classの `expected_classification` はL4の全体conditionをそのまま写す。facetおよびglobal markを `violation > unknown > corresponding` で集約し、L4 `condition_values` の3値へ写像する。全体conditionはfacet別axisの代表化から再計算しない。
3. checkerの単一 `expected_axis` / `expected_state` は、L4の局所facet状態とglobal markから導く。global findingが一つでもある場合はglobalを優先し、axisを `global`、stateをglobal marksの `violation > unknown > corresponding` 集約値とする。global findingがない場合は、L4 `facets` 配列順に両targetのどちらかで `corresponding` 以外となる最初のfacetを選び、そのfacetの両target状態を同じ優先順位で集約してstateとする。全facetがcorrespondingでglobal markもない入力はpositiveであり、negative classを作らない。
4. classを区別するキーはcheckerの明示class key全体を使う。すなわち `expected_classification`、上記の順序付き・重複保持finding code列、`backflow_owner`、`expected_axis`、`expected_state`、および型付き `owner_ref` である。同じcode列でもaxis/state/owner_refが違えば別class。同じkeyを持つcaseは同一classへ所属させる。
5. caseへの所属はL7の固定input材料からL4 predicateに照らして順方向に導く。L9の `negative_class_ref`、観測findingの組合せ、ケースIDからkeyを生成してはならない。case側の既存expectedやcheckerの比較実装は変更しない。

class IDは、このkeyを `{expected_classification, finding_codes, backflow_owner, expected_axis, expected_state, owner_ref:{kind,id}}` としてJSON化し、UTF-8 `ensure_ascii=False, sort_keys=True, separators=(',',':')` のSHA-256全64桁を `OS015-NEG-COMPOSITE-` に続けて付す。同一keyは同一ID、異なるkeyは異なるfull digestとなる。L5で全finding codeの一意なfunction ownerが閉じない場合は、ownerを推測せず、そのcaseのclass rowを作らない。

このscalar axis投影は、L4が複数facetのtarget状態とglobal conditionを分けて返し、checker class keyが単一axis/stateを要求する差を埋める下流設計である。global findingsの優先はL4 `global` dispositionの意味、残りの代表facet順はL4 `facets` の既存順序を使う。既存caseの観測fieldや意味を増やさない。

## L7固定入力材料の照合

WR181 base `70b91c73c864b4de1c7b7d591dcf49cdc047c18a` のL8/L9には572件のnegative caseがあり、そのうち141件は両層で `negative_class_ref` を欠いていた。`residual-population-141.json` はそのbase L8のID集合と元ファイルSHA-256を固定記録する。`inventory_141.py` はこのmanifestにあるIDをL7 `/connection_materials/OS015/case/cases` へ結び、L7 `fixture_inputs[base_ref]` と `given.input.replacements` を展開して各 `expanded_input_sha256` を照合する。出力は変更前後のfield valueとL4 predicate pointer候補だけで、findings、class key、expectedは導出しない。L7 `expected_proposal` とL9のexpected/observationは読んでいない。

L7 fixture contractの `expected_limit` は、`expected_proposal` を全fieldの独立再導出なしにindependent oracleと認めない。今回作成した旧crosswalkはcase所属の出所が独立に検証できず、廃棄したpredicate再実装scriptや旧expectedとの照合結果を使っていないと証明できないため、全141行とそれから生成されたL4/L5/L8/L9 class row・case refを撤去した。残余population manifestは対象IDの固定にだけ使い、class割当て根拠にはしない。

`inventory_141.py` はmanifestのcase IDをL7 `fixture_inputs[base_ref]` と `given.input.replacements` に結び、各 `expanded_input_sha256` を確かめる。`l7-fixed-input-inventory-141.json` は各caseの変更前後の値とL4 predicate pointer候補を記録するだけで、finding、class key、expectedを導出しない。例としてC0044はL7の `records/target_a/original_event/event_id=null`、C0045は同じmemberへの `FOREIGN-event_id` 置換を示す。照合先はL4 `/diagnostic_contract/event_fields`, `/diagnostic_contract/comparison_facets`, `/diagnostic_contract/mutation_rule` と、source/whole-event差分の記述である。C0477はactual/context双方の `authority_origin=null`、C0481はactualの `authority_state=stale_material` を示し、対応するL4 authority code/dispositionとaggregationを人が直接確認できる。

このinventoryはcase別の刺激と候補predicateをレビューするための資料であり、4層class所属を証明しない。case単位class化は、各刺激からL4の全finding sequence・facet/global marks・overall condition・primary axis/stateまでを人が原文から追い、pointerごとの併発を記録する独立照合が完了するまで保留する。L7 `expected_proposal`、L8/L9 expected・観測・過去のclass ref、廃棄scriptの出力は、その照合の入力やoracleに使わない。現行L4/L5には形成規則だけを記録し、複合case class rowを置かない。

## 有限性と規模

L4 input_domainは任意JSONではなく固定carrierである。`algorithm_dependencies.names` は2 target、phaseは3値、source/event/classification field数はそれぞれ20/9/14、facet数は6、finding code alphabetは26種類である。algorithmの全 `put` 呼出しを固定loop長で上から数えた粗い上限は1 targetあたり124件、全体250件（2 target分とphase/global所見を含む）。dedup後の実出力はこれ以下である。詳細な加算内訳と再現出力は同梱scriptにある。

従って、facet状態ベクトルは1 targetあたり最大 `3^6 = 729`、2 targetの組は最大 `729^2 = 531441`。ordered finding-code列は各codeの重複を許すが、最大250所見・26 code種類なので、code列の多重集合数は `C(26+250, 26)-1 = 2,138,453,569,191,560,210,014,773,647,156,147,135` 以下である。L5の現行owner_ref候補は4 functions+4 contracts=8個。checker axis/state/classification/owner_refの選択肢まで独立として掛けたclass-keyの粗い上限は `3 * 7 * 3 * 8 * (C(276,26)-1) = 1,077,780,598,872,546,345,847,445,918,166,698,156,040`。この上限は論理相関を無視したもので、実在可能class数や141件のdistinct class数ではない。

全code列挙は有限だが、上記上限は現実的な明示row全列挙を正当化しない。対象141件についてもclass所属は未形成であり、全宇宙classの生成は行わない。141という数は依頼が指定したcase populationであり、distinct class件数ではない。

## 単独finding classの不成立根拠

L4/L5にある次のsingleton `finding_codes` は、L4 algorithmが定義する実入力経路では単独findingにならない。後続の複合class割当てではsingletonを強制せず、実出力どおりの複合code列を使う。

| singleton class / code/axis | L4上の必須併発 |
|---|---|
| `OS015-NEG-original_event_mutated` / `original_event_mutated` | whole event差分は固定 `event_fields` の少なくとも一つの比較差分を伴う。該当fieldに `source_unresolved` または `source_conflict` が出る。 |
| `OS015-NEG-source_conflict-original_event` / `source_conflict` / `original_event` | known string同士の不一致から出る。whole eventも異なるため `original_event_mutated` が出る。 |
| `OS015-NEG-source_unresolved-original_event` / `source_unresolved` / `original_event` | comparatorの実値とcontext値の両側に非known値が同値であれば、両pointerで同codeが出て2所見になる。一方のみ非knownならwhole event差分により `original_event_mutated` も出る。 |
| `OS015-NEG-unresolved_promoted_to_current` / `unresolved_promoted_to_current` | guardはsource/original_event/authority facetに既存markがある場合だけ発火するため、その根拠findingが併発する。 |
| `OS015-NEG-first_classification_prior_present` / `first_classification_prior_present` | classify時にactual/context双方の旧分類を検査する。同値な非null分類なら両pointerで同codeが出て2所見、片側だけ/異値なら `original_classification_mutated` も出る。 |
| `OS015-NEG-first_classification_prior_unresolved` / `first_classification_prior_unresolved` | 上記と同じ両側検査により、同値な未解決値は2所見、片側/異値は `original_classification_mutated` と併発する。 |

各singleton rowのL4 pointerは `/failure_classifications/1`, `/4`, `/8`, `/15`, `/29`, `/30`、L5 pointerは `/failure_rules/1`, `/4`, `/8`, `/15`, `/29`, `/30`。これらはWR181 base `70b91c73...` の配列indexであり、六rowともL4/L5上はsingleton `expected.finding_codes` を宣言している。

これはcheckerや期待値の不具合を作る新規ルールではなく、L4のfinding shapeと既存アルゴリズムからclass keyを作る時にsingleton扱いを誤らないための制約である。

## 根拠と検証範囲

- L4: `/diagnostic_contract/input_domain`, `/diagnostic_contract/algorithm_dependencies`, `/diagnostic_contract/source_fields`, `/diagnostic_contract/event_fields`, `/diagnostic_contract/classification_fields`, `/diagnostic_contract/facets`, `/diagnostic_contract/codes`, `/diagnostic_contract/comparison_facets`, `/diagnostic_contract/aggregation`, `/diagnostic_contract/condition_values`, `/diagnostic_contract/algorithm_python_document_text`, `/failure_classifications`。
- L5: `/formal_reference/constants`, `/formal_reference/meaning`, `/input_boundary`, `/failure_rules`, `/unclosed`。
- checker: `scaffold/tools/design_verification_checker.py` の `explicit_negative_equivalence_classes` class key (`classification`, ordered `finding_codes`, owner, axis, state, typed owner_ref)。checkerは編集していない。
- 実際のfailure文脈: WR181依頼は #3895 / #3510 comment 6503414715 の residual `CHK-NEG-4WAY-MATCH` 165件を対象とする。#3889 R4の指摘は被検関数が出さない値を期待へ加えないこと。本設計はL4の実finding shapeにclass形成を対応させ、case単位expectedを増やさない。
- 旧HELIX: `LEGACY-ASSET-3A15E5645D2D2A59DFF5` (`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md`) はauthority status / dispositionが historical/unresolved。L4/L5 `legacy_comparison` は意味の再導出と記録/派生viewの責務分離を記載する。本候補は旧Ticketモデルを移植せず、承認済みOS015 L4/L5の局所的なfinding形成規則だけを具体化する。

静的な件数・上限は `analyze_bounds.py`、case入力の再構成とpredicate pointer付きfield inventoryは `inventory_141.py` で再現できる。inventory scriptは固定fixtureを展開するのみでpredicateを評価しない。今回の監査ではdocument checkerの `check-child` を変更前後に実行した。freeze recordは対象repositoryに存在せず、`check-freeze` の入力を形成しない。旧runtime、L4 algorithm本文、test、CIは実行していない。checkerの結果は4層の静的文書整合を示し、L4の動作確認ではない。
