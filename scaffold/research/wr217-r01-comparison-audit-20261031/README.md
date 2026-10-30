# WR217 R01 pointer ambiguity: comparison-after audit candidate

status: scaffold（候補調査・監査材料。正式設計、要求変更、承認、実動作を生成しない）
authority_effect: none
binding: [SCF-B-0187](../../bindings/SCF-B-0187.json)

## 目的と境界

比較前に固定したsource-only候補（Issue #3510 comment 6530954227で固定）を変更せず、その候補と承認済みOS007の意味、現行L4 algorithm本文、L5/L7/L8/L9の既存expected materialを照合する。最新main `de668c9152e730e97db541c0e2e767b2be3a4178`から作った隔離branch `codex/wr217-r01-l4-clarification`上で作業する。承認入力は7f1719fb6a89837c1bb9775faa9a634a066df4a3、比較前L4 blobは51ebe7e7e563cdc85607f72fdc234e1c7f665a70から読む。固定候補をそのまま含めたファイルは [`r01-blind.json`](r01-blind.json) で、SHA-256は `622b92a532c9ca316b3ad58f32df42870b43437ba573ea7e039c64af5684f767`。copy後もhash一致を確認した。

L3/L10の意味は変更しない。既存expectedへ値を合わせず、食い違い・未収録・比較できない箇所は残件として記録する。L4/L5 algorithm、旧CLI/runtime/test/CIは実行しない。L5/L7/L8/L9のうち以下に示す対象pointer以外は照合に使わない。L7 expectedは比較対象の材料であり、独立oracleまたはL3/L10 authorityとして扱わない。

比較後、作業者がL5-L9を含む範囲に広い`rg`を一度実行し、大量の一致箇所が出力された。これは比較前artifactを固定し、そのhashを確認した後の操作である。出力は本監査の判断根拠に使わず、READMEに結果を転記していない。以降の判定は、下記に明記したsource row、R01関連の期待pointer、およびraw inputの対応operandに限定して行った。この記録は検索範囲の逸脱を隠さないための開示であり、広い出力から新たな根拠を採用するものではない。

## WR222 L5/L8 source-pin rebind follow-up

WR222の作業baseは70499a07825f53f2fbbb85935d9888360a6ad14c（#3961のmerge revision）。このrevisionのL4 bytes SHA-256は4b1eea9beaa7a4179dec374e8c914632dbef850c25f88bdc619a3b5808f7a2fbで、確認したremote-main ref dd5931cfff4ff786da2ced44de2a40529edf7b71のL4 bytesと同一。L5/L8のsource_pins[3]だけをこのrevision/SHAへ再束縛した。L9 pinとその期待値は変更していない。

L5ではalgorithm.ordered_rules[0].source_valueに旧い曖昧なR01引用が残っていたため、L4 /diagnostic_contract/rules/0 の現在文面へ同期した。L5 formal_program.generic_operator_contracts.compare_fields はpredicate不成立側だけunknownをそのside pointerへ追加し、双方predicate成立かつ値不一致の場合は設定sideへconflictを置くと既に定めており、operand-local unknown／actual-side conflictという固定候補と静的に一致する。したがって変更はsource引用文の明確化であり、formal operator semanticsの変更ではない。L8には旧R01散文の複製がなく、L8 unit expectedおよびL9 integration expectedのcode/pointer値も変更していない。

WR222前のwhole SHA-256はL5 17cc4b4a400ccebf68902b6befaea682b2c81287a202113709a41e0fec28c200、L8 0c20492e0ee7eb92c50053a67fadacd782259c64802e3a338a1f9435d7727516。変更後はL5 47d2256d3b3295548156b6b8a92de1102e8e167f1d677288397393cdf268cb21、L8 1c99e457cb57131a7ac93eef84f728789b0e76dff02e7364e5ee47d51d366877。比較前固定artifact r01-blind.jsonは不変でSHA-256 622b92a532c9ca316b3ad58f32df42870b43437ba573ea7e039c64af5684f767。L3/L10 rows、L4/L9 bytes、すべてのL5/L8/L9 expected bytes・values、R02/R03/R07本文は変更していない。L4/L5 algorithmと旧runtime/test/CIの実行はしていない。

SCF-B-0187のupstream L5/L8 digestだけを変更後bytesへ更新し、noteに変更前digestを記録して当時の比較対象を保った。R01監査のrole、obligations、artifact、過去比較revisionは維持した。この追随は既存SCF-B-0187のupstream refreshで足りたため、新しいSCF bindingは作成していない。check-childは変更前後ともexit 0。SCF staleは変更前後ともstale=0、validateは変更前bindings=175 fail=0、変更後も全binding passを確認した。これらは静的scaffold/source整合確認で、要求承認・実動作・独立reviewを意味しない。

R02/R03/R07の既存pointer差・限定整合は上記の比較後監査のとおり残し、一括変更しない。旧sourceはLEGACY-ASSET-F6E9EA3422A0EF1DF090（feedback lifecycle）とLEGACY-ASSET-6679DDF56AC1EA499A42（memory structure）を意味再導出の読取根拠として保持した。UTW-014/UTW-021のabsence-blindness/完了証拠に関する失敗はunknownを成功扱いしない既存目的の根拠に限り、operand-local pointer選択そのものを旧HELIXから再利用したものではない。独立reviewは作成者と別contextのreview対応側がexact HEADを確認する。

## Source pins

| source | revision / SHA-256 | 用途 |
|---|---|---|
| L3 functional requirements | approved `7f1719fb6a89837c1bb9775faa9a634a066df4a3`, `b62571c3e939f8bb79b46b5612e78d461ab406ffb51c161c51e9ef7bbcfc27df` | `/requirements/21` HELIXOS-L3-007-F01 |
| L10 functional verification | approved `7f1719fb6a89837c1bb9775faa9a634a066df4a3`, `f006230a825139211be6277abaa5731f3c9f4a17198a4d20b370469f8a5c46ec` | `/cases/21` HELIXOS-L10-007-F01 |
| L4 basic design | baseline blob SHA-256 `21b922d90061b11378054d9173db4f24b774fdf30f2555e9821f25138cb3c4e3`; changed candidate SHA-256 `4b1eea9beaa7a4179dec374e8c914632dbef850c25f88bdc619a3b5808f7a2fb` | `contracts[0].contract`, `diagnostic_contract.rules[0,1,2,6]`; R01 prose edited only; comparison rules read statically, never executed |
| L5 detailed design | latest-main base `de668c9152e730e97db541c0e2e767b2be3a4178`, `17cc4b4a400ccebf68902b6befaea682b2c81287a202113709a41e0fec28c200` | target `failure_rules[*].expected` and pointer provenance only |
| L7 verification materials | same base HEAD, `5a38e644013f755769b8cda433c871bbac6bdd3b652019b548072e5acff03e78` | selected `l9_material_bundle.case.case_materials[*].expected` finding pointers only |
| L8 unit verification | same base HEAD, `0c20492e0ee7eb92c50053a67fadacd782259c64802e3a338a1f9435d7727516` | selected `unit_cases[*].expected`, `condition`, negative class refs |
| L9 integration verification | same base HEAD, `a58d53077ca0d3a43d06886a82226ea952946be375648b936af2099cfeaac801` | selected `integration_cases[*].expected`, `condition`, negative class refs |

## L3/L10意味

承認revision 7f1719fb6a89837c1bb9775faa9a634a066df4a3の指定rowと作業時HEADの同rowは、L3/L10ともJSON内容が一致した。全体document hashは改訂されているため、bindingにはHEAD bytes、authority根拠には承認revisionとrow identityを分けて記録した。

- L3 F01は、Worker・判断・操作・検証の原ログと証拠を共通形式で保存し、project/要求revisionとsourceへ結ぶ義務を置く。欠落・重複・staleおよび共通形式不足で他機構へ結べない記録を成功証拠から分ける。
- L10 F01は、出典/revisionと共通項目を辿れ、不完全な記録と成功証拠を区別することを観測する。不足形式・参照・発生元と未完を保持し、証拠の存在から承認/完了を生成しない。
- このためunknownを黙示補完しない点は既存意味の保持である。どのpointerへunknown/conflictを付けるかはL3/L10が定めておらず、次節の明示化は候補設計選択である。

## R01比較

変更前のL4 R01は、stringの非空性・boolの型をactual/context各々で検査し、「片側不明は各pointer」、両側knownで値が異なる場合はactual pointerに診断すると記していた。`各pointer`の対象が不明側か比較組双方かを固定していなかった。本branchでは、比較前固定候補の文案をR01散文へ反映した。これは下流実行の許可やL3/L10の変更ではない。

候補の明確化文案（現branchのL4 R01）：

1. string operandは非空stringのときだけknown、bool operandはJSON booleanのときだけknown。
2. actual/contextどちらか一方だけunknownなら、そのunknown operand自身のfield pointerへ`field_unknown`／`boolean_unknown`を付ける。known側pointerにはunknownを付けない。
3. 両operandがunknownなら各operand自身のpointerへ個別にunknownを付ける。
4. 両operandがknownで不一致なら、actual pointerだけへ`field_conflict`／`boolean_conflict`を付ける。
5. 比較結果は呼出元のlogs/feedback/memory facetに置き、unknown/conflictを成功証拠へ昇格させない。

### WR213 pilotとの読みの違いと、比較後に記録する選択理由

WR213の比較前pilot（Issue #3510 comment 6530663198、artifact SHA-256 `8cb4af88feb7c4e91e0acdc5dd1d299ef2de3094141f0f8515af2de33ca9a1fc`）では、actual `/logs/worker/project_id` がnullでcontext counterpartがknownの例について、担当者は旧R01の「片側不明は各pointer」をactual/context両pointerと読んだ。同コメントは、context側known pointerへもunknownを付ける読みと、unknown側だけを付ける読みの両方があり得るとして、pointer数の判断を保留していた。

今回の比較前固定候補（Issue #3510 comment 6530954227、`r01-blind.json` SHA-256 `622b92a532c9ca316b3ad58f32df42870b43437ba573ea7e039c64af5684f767`）は、そのpilot解釈とは異なり、片側だけunknownなら不明側のpointerだけを選ぶ。両側unknownなら両側pointer、known unequalならactual pointerという候補である。以下の理由は比較前artifactに含まれておらず、F1指摘を受けた比較後の説明として記録する。artifact bytesは変更しない。

不明側のみを候補にする理由は、unknown診断を「そのoperandが比較対象としてknownではない」という出所に置き、raw inputでknownな相手側の値をunknownと誤表示しないためである。known側pointerにunknownを付けると、どちらの入力が欠けたかが読取り上失われ、known値も不明だったかのように扱われる。両側がunknownの場合は、それぞれのoperandが独立に不明なので双方のpointerを指す。この説明はoperandの出所を保つための候補設計理由であり、L3/L10の新しい要求や承認を生成しない。L7 expectedとの一致・不一致はこの選択理由に使わない。

pilotのnull例を現候補で扱う場合は、`/logs/worker/project_id`（actual）だけに`field_unknown`を置き、knownなcontext counterpartには置かない。今回の選択はpilot担当の当初の両pointer解釈から変更されるため、pilotを同じ意味の先例として扱わず、差を残す。

### L4内の既存比較algorithmとの静的照合

L4文書内に実行可能なembedded code blockはなく、比較algorithm本文は`diagnostic_contract.rules`の散文規則と、それを参照するR04-R10の記述である。本文を静的に読んだ限り、候補文案との関係は次の通り。

- 一致する部分: 既存R01はactual/contextそれぞれのstring非空性とbool型を検査し、両側knownの値相違をactual pointerのconflictとしている。候補もこのknown不一致の向きと比較codeを呼出元facetへ置く点を保つ。R05はstageのrecorded/field比較にR01を使い、L7の`C0002` (`/logs/worker/project_id`)、`C0046` (`/context/logs/worker/project_id`)、`C0091` (`/logs/worker/success_evidence_claim`)、`C0515` (`/context/feedback/resolved/stages/intake/recorded`)も各unknown operand自身のpointerを示す。
- 明確化される部分: 既存R01の「片側不明は各pointer」は、unknown operandのpointerだけか比較組の両pointerかを定義していない。候補は不明operandのpointerに限定し、両側unknown時は両方を指す。これは既存本文で明示されていない選択で、L4の既存R01から一意に導けるとは扱わない。L7 `C0504`と`C0941`は両operand nullのraw inputに対して両pointerを期待し、候補と整合するが、既存expectedによる設計承認とはみなさない。
- 相違または不一致として確定できる箇所: pointer方向について、候補と既存L4本文の明示的な反対規則は見つからなかった。一方、既存L4本文は片側unknown時の対象pointerを決め切っていないため、候補はその曖昧さを埋める。L4 `failure_classifications[*].expected.finding_codes`は診断code列でありfinding pointerを保持しないので、そこから具体pointer整合を判定できない。

したがって、L4本文との静的照合は「known不一致のactual pointer配置は一致」「unknown pointer配置は既存本文が未規定で候補が新たに明示」「本文に候補を否定するpointer規則は確認されない」と整理する。algorithmの実行結果や実動作の一致は確認していない。

### 既存expectedとの照合

| 診断 | L7 material-backed comparison groups | 期待pointerの状態 | L5/L8/L9 |
|---|---:|---|---|
| `field_unknown` | 328: actual-only 158、context-only 158、双方12 | actual unknown/context knownならactual側、actual known/context unknownならcontext側、双方unknownなら双方。例 `C0002` actual `/logs/worker/project_id`; `C0046` context `/context/logs/worker/project_id`; `C0504` 両側stage field | L5 expectedはcodeのみ。L8/L9 expectedもcode/conditionのみ。L7 materialが具体pointerを持つ |
| `field_conflict` | 349 actual-only | known unequalのcomparisonはactual pointer | 同上 |
| `boolean_unknown` | 29: actual-only 23、context-only 6、双方0 | non-bool operand自身のpointer。例 `C0091` actual `/logs/worker/success_evidence_claim`; `C0515` context `/context/feedback/resolved/stages/intake/recorded` | 同上 |
| `boolean_conflict` | 13 actual-only | known unequalのcomparisonはactual pointer | 同上 |

raw inputを必要pointerだけで確認した結果、L7 material-backedのR01 comparison groupでcandidateと異なるpointer期待caseは0件だった。`C0002`ではactual `/logs/worker/project_id`がnull、context counterpartはknown stringで、expectedはactual pointerのみ。`C0046`ではactual fieldがknown、context `/context/logs/worker/project_id`がnullで、expectedはcontext pointerのみ。`C0003`のstring known-unequalはactual pointerのみ。`C0091`ではactual `/logs/worker/success_evidence_claim`がbool以外、context counterpartはboolでactual pointerのみ。`C0515`ではactual recorded boolはknown、context counterpartはbool以外で、expectedはcontext `/context/feedback/resolved/stages/intake/recorded`のみ。string/boolともunknownは該当operandのpointerに置かれていた。

双方unknownで両pointer expectedとなる比較groupは12件。例は`C0504`（L7 `case_materials/503`）と`C0941`（`case_materials/940`）。C0504の`/feedback/resolved/stages/pending/{actor_ref,observed_at_ref,record_ref,source_head}`、C0941の`/feedback/unacked/stages/classify/{actor_ref,observed_at_ref,record_ref,source_head}`で、actual/contextの同名stage fieldはraw fixtureでともにnull。expectedはそれぞれのoperand pointerへfield_unknownを置き、candidateと一致する。source fixtureはL9 revision `21ba1562bd907e19d49274839d0bd2d736c060d5`（SHA-256 `7eecd8271c19881b84a2b4c7e72117283fdab7ff88cb2f6674cbbd570222ad62`）の`/fixture_inputs/records`。L7対象pointerは`/l9_material_bundle/case/case_materials/503/{input,expected}`と`/l9_material_bundle/case/case_materials/940/{input,expected}`。

R05のsource_head joinでは同じcaseのcontext `original_finding.source_head`はknownで、actual stage source_headはunknownとなる。これはactual pointer側の追加field_unknownで、直接のstage actual/context比較が両側nullを検出した既存context pointerを取り消さない。same-code/pointer/ownerのdedup後も期待はactual+context両pointerでcandidateと一致する。L7 expectedは比較材料であり独立oracleにはしない。

operandがcontext側だけunknownとなる既存L7 expected groupもあり、context-only pointerがactual pointerへ誤配置される差はなかった。L7には該当expected materialがないOS007負例が6件あり、うちR01対象は`OS007-NEG-feedback-field_unknown`、`OS007-NEG-feedback-field_conflict`、`OS007-NEG-memory-comp-16-boolean_conflict_field_unknown_order_unknown`。これらはL8/L9にcode-level expectedはあるが、raw inputとpointer-level expectedの対応を確認できない。これらを候補へ値合わせせず残件とする。

L5 `failure_rules.expected`とL8/L9 `expected`は診断code集合を示すのみで、finding pointerまでは書かない。L7のexpected replacement materialが具体pointerを持つ唯一の比較材料である。L8/L9はそれぞれ951 casesを持ち、L7 case materialは945件で、上記6負例に対応するmaterialがない。変更後L4 SHAに対し、L5 `source_pins[3]`とL8 `source_pins[3]`のL4固定whole SHAは変更前`21b922…c3e3`のままstaleとなる。L5/L8本文と期待値は本変更で触らず、再束縛／再確認を下流の残件にする。

## R02/R03/R07の同語形とimpact

| rule | 整合している部分 | 既存expected / 未確定 |
|---|---|---|
| R02 | closed kind/state集合外をunknown codeにする点、known差をconflictにする点、原recordを保持する点はunknownを成功扱いしない意味と整合。 | `C0038`は`log_kind_unknown`をactual `/logs/worker/kind`へ、`C0041`は`log_state_unknown`をactual `/logs/worker/state`へ、`C0087`は`log_state_conflict`をactual `/logs/worker/state`へ出す。`C0045`は同じactual `/logs/worker/state`へ`log_state_conflict`と`log_state_unknown`を出す。R02の「state未知は両側」とC0041のactual-onlyが異なる。`C0937`は`log_kind_conflict`をcontext/actual双方pointerへ出し、`C0040`は`field_conflict`と`log_kind_conflict`をactual `/logs/worker/kind`へ出す。kind conflictの分類・両側pointerの適用範囲とL7材料なし`C0950`のpointerは未確定。R02を一括変更しない。 |
| R03 | actual `success_evidence_claim`のnon-boolは`boolean_unknown`、禁止claimは`log_success_claim_forbidden`。 | `C0091`のnon-boolと`C0090`のforbidden claimはいずれもactual `/logs/worker/success_evidence_claim`。R01のactual operand unknown規則と整合。材料usableは正式成功ではないとのR03文を保持。 |
| R07 | actual materialの対応条件を限定し、`actual_resolved`を常にfalseにする点は、L3/L10の証拠と承認を分ける意味に整合。 | L7 expected bundleには`C0440`〜`C0943`の範囲に分布する139 caseで`resolution_material_corresponding=false`への明示置換がある。これらはnegative materialの期待値で、positive成立条件の独立証拠ではない。R07自体はdiagnostic code/pointerを発しない。`resolution.recorded`のmissing/non-bool分類はR06/R01側の未決範囲。 |

## 旧HELIXとの対応、失敗事例、再利用区分

L4/L5の既存legacy comparisonは`semantic_rederivation`／`semantic_rederive`を明記する。旧`feedback-lifecycle.md`（`LEGACY-ASSET-F6E9EA3422A0EF1DF090`）はsource factを消さず、journalを正本、DBをprojectionとする境界を記録する。旧`harness-memory-structure.md`（`LEGACY-ASSET-6679DDF56AC1EA499A42`）はdelivery/consume、正本反映後retire、terminalの非再表示を扱う。保持するのはsource/未解決finding/terminal保全の意味であり、旧DB/schema/runtime/TTL/CLIは移植しない。actual/context pointer局所化は旧sourceに一致する規則がなく、新規の明確化案である。

同種の失敗記録として、旧資産`LEGACY-ASSET-A127DEC3EEE6ED63CF17`の`predecessor-harness-full-weakness-audit-2026-07-20.md` UTW-014は欠損sourceを空集合へ縮退させるabsence blindness、UTW-021は完了証拠が時刻/prose/自己申告へ戻る余地を記録する。これはunknownを成功・欠損なしに読み替えない既存目的を裏付けるが、actual/context pointerの選択までは導かない。pointer選択は新規候補として区別し、L3/L10の義務や新gateを作らない。

## 置換・残件

このbundleはcandidate auditと比較前artifactの保全を担う。L4 R01散文だけを明確化し、L3/L10 requirementやauthorityは変えない。L5/L7/L8/L9の既存expectedをこのPRで値合わせしない。異なる/不足するexpected materialは上記の通り残し、既存の対象層・承認経路で扱う。新しいgate、pass/fail条件、実装、runtime、旧test/CIを設けない。

## 検証記録

- `r01-blind.json`を比較前SHA-256と照合し、同じbytesを配置した。
- source rows/case materialはJSONとして静的抽出した。実行アルゴリズム、旧runtime/test/CIは未実行。
- README/binding/frozen JSONのsyntax、SCF-B-0187 upstream全7 pinの実bytesとの一致、およびSCF binding validationを静的確認した（`bindings=174 fail=0`）。
- 最新mainのbinding scanでは0187は未使用、0183/0184は別対象、target L4 pathをupstream pinする既存SCF Bindingは無かった。新SCF-B-0187は変更後L4 hashへ束縛する。L5/L8 source pinは上記の通りstale残件。
- 独立reviewは作成側と別contextのレビュー対応側がexact HEADを読む。作成者の本照合を独立review証拠とは扱わない。
- 正式承認、実装動作、L7 expectedの独立性、L7未収録6件のpointer-level期待は未確認・未成立。
