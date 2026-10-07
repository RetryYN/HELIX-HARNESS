# HELIX-HARNESS L3 非機能要件候補（Stage 1: HARNESS-L2-010/011/023）

status: draft_for_l3_review
approval: not_approved
scope: Stage 1 only; HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023
paired_l10: ../L10-verification/nfr-verification.md

値は固定L2/L11から導く技術計測候補であり、性能SLO、実測結果、承認、release eligibilityではない。L10測定は[対のnfr-verification.md](../L10-verification/nfr-verification.md)を参照する。

## 候補値

| NFR候補ID / 親 | 候補値 | 根拠・比較案 | 適用限界 |
|---|---|---|---|
| `NFR-C-HARNESS-010-01` / `HARNESS-L2-010` | 同一の宣言inputとpack版に対する宣言成果物の予期しない差分は **0件**。比較基準はartifact bytes digest一致。 | 固定L2の「同じ入力と版から同じ成果物」をそのまま観測可能にした候補。案Bのsemantic digestは、宣言artifact contractが特定metadataを非意味項目として明記した場合だけ、その項目を除外してよい。contractに除外がなければ案Bは不採用で、bytes比較を緩めない。旧FR-03の4 artifact／12 edgeはこの値の根拠にしない。 | contractが宣言する成果物だけを比較し、上位release／製品の昇格は判定しない。digest algorithmや生成実装方式はここで固定しない。 |
| `NFR-C-HARNESS-010-02` / `HARNESS-L2-010` | 単一pack差し替えで、対象外packのversion/evidence変更は **0件**。 | L2/L11の「一つのpack差替えで他のpackの版と証拠が保たれる」を直接数える。案B（dependency closure由来なら対象外の変更を許容）はこの不変条件に反するため不採用比較案。複数packを同時に更新する操作は別scopeであり、このAC／候補値に混ぜない。 | 対象pack自身の明示された更新は比較対象。複数pack更新の意味や許可をこの要件で追加しない。 |
| `NFR-C-HARNESS-011-01` / `HARNESS-L2-011` | 同一logical operationのresumeは **同一冪等key**を保持し、同じkeyの重複送達による追加処理効果は **0件**（効果は高々1回）。 | 固定L2/L11が要求する停止・再開、記録済state、同じ冪等keyを候補へ結ぶ。retryごとに新keyを作る案は重複防止と再開同一性を弱めるため不採用比較案。 | 冪等keyの生成方式、保持期間、全runtime共通の実装方式は指定しない。処理authorityとdata scopeは既存ownerに従う。 |
| `NFR-C-HARNESS-011-02` / `HARNESS-L2-011` | expiry経過後にsuccessと返るoperationは **0件**。preflight・dispatch直前にexpiryを照合し、dispatch後にexpiryまたはsnapshot driftを観測した場合もsuccessにしない。等号境界は既存contractに定義があればその値に従う。未定義の場合の比較候補は案A `now >= expiry`をexpired（有効区間 `[issued_at, expiry)`）、案B `now > expiry`をexpired（有効区間 `[issued_at, expiry]`）とする。 | expiry後をsuccessにしないL2/L11を観測する。旧source-boundary-contractsの60–70行はpreflight／dispatch直前／dispatch直後の再観測、dispatch前expiryのblocked、dispatch後driftのuncertainを示す部分起点である。これを現要求へ再導出し、dispatch前期限切れはeffectなしのblocked/held、dispatch済み後に期限切れ・drift・timeout等で結果の成立を確定できない場合はsuccessでないuncertain/unknownとする。等号の案A/Bは同一clock fixtureで比較する技術候補とし、いずれでも期限切れsuccessを許さない。 | TTLやclock-skew許容値はL2にないため設定しない。expiry authorityは呼出し側／SECURITYに残し、HARNESSは延長しない。 |
| `NFR-C-HARNESS-023-01` / `HARNESS-L2-023` | 同一pack revision・同一入力条件の繰返し評価で、closureと理由の差分は **0件**。 | L2/L11が要求する同一input/revisionの有効closure再現と理由一致に対応。下記15行の有限fixture行列を全件確認する案と、条件数増加時のpairwise案を比べ、この固定行列を候補とする。分類能力自身は全依存実装を要求せず、missing/unknown状態を分類できる。 | closure件数上限や処理時間はこの親から導かない。未選択sourceの存在／成功を補完しない。 |

## 023の有限fixture行列候補

NFR-C-HARNESS-023-01の「全件」は、次の15個の明示fixtureを指す。closureを状態別に確認し、同じinput・pack revisionで各fixtureを2回評価してclosureと理由の意味digest差分0件を候補oracleとする。ここでのdigestは試験比較用で、正本JSON schemaや実装方式を新設しない。

| fixture | 4分類／条件 | 期待state・closure oracle |
|---|---|---|
| D1 | 常時必須・依存が有効 | closureに含む |
| D2 | 常時必須・依存missing | 該当利用を保留、missing理由を出す |
| D3 | 常時必須・版stale／range不一致 | 該当利用を保留し、staleと互換range不一致を区別した理由を出す |
| D4 | operation条件true・依存有効 | closureに含む |
| D5 | operation条件false | 当該operationを含まない要求に限りclosure外、条件不成立を記録 |
| D6 | operation条件unknown | falseへ読み替えず保留 |
| D7 | sourceを明示選択・依存有効 | 選択sourceのdependency closureに含む |
| D8 | sourceを明示選択・依存missing／stale | 該当利用を保留、別sourceへ暗黙fallbackしない |
| D9 | source未選択 | 未観測を記録し、存在・不在・適格性・成功を推測しない |
| D10 | D8で選択したsourceに失敗後、同一inputのまま別sourceへ自動変更を試行 | 暗黙fallbackを拒否し保留 |
| D11 | 利用者がsourceを明示再選択した新input/revision | 新しい選択条件でclosureを再評価し、新sourceの根拠を記録 |
| D12 | 参照資料のみ | 実行closure外。実行条件・成果・authority・oracle・安全制約に影響する資料をこの区分へ偽装した場合は拒否し、理由をpack契約ownerへ戻す |
| D13 | 複数依存の宣言closureが循環しclosureを解決できない | 依存を黙って落とさずunknown/保留、理由をpack契約ownerへ戻す。循環があっても宣言条件を解決できるfixtureは拒否しない |
| D14 | source選択状態がunknown（source自体が未選択とは確認されていない） | 未選択・false・reference-onlyへ変換せず保留。選択状態の根拠を返す |
| D15 | 同一pack revision内で適用conditionが互いに矛盾 | false/未選択へ丸めずunknown/保留、矛盾した条件とpack契約ownerへの戻し先を返す |

D8/D10は無断fallback拒否、D11は明示入力変更後の再評価、D13–D15は未解決closure・unknown選択・矛盾条件を個別に測る。人による代行も通常呼出しと同一の権限・隔離・版・検証・記録・受領義務を持ち、receiptが欠ければclosure evidenceとして不合格。分類器は依存が未実装でもD2/D3/D6/D8等をmissing/unknownとして返す。

## expiry境界候補の比較と測定

HARNESS-L2-011/L11は期限切れをsuccessにしないが、expiry時刻と比較演算子の等号扱いを明示していない。既存契約で定義済みならその比較規則を使う。定義が見つからない場合は値を未解決のまま止めず、案A `now >= expiry`（expiry時刻ちょうどから期限切れ）を安全側の起草候補、案B `now > expiry`（expiry時刻ちょうどを含む）を比較候補として同じclock/scopeの合成fixtureで測る。expiry直前・ちょうど・直後のdispatchとresumeを各々与え、result stateと相関IDを記録し、どの比較でも期限切れをsuccessとしないことを確認する。採用した比較演算子・timestamp precision・clock sourceをL3/L4契約に記録する。これは運用上のTTLやclock skew許容値を捏造しない候補であり、L2の意味変更が必要と分かった場合のみ上流へ戻す。

## 値の選び方と責務

候補の0差分・同一key・高々1回の効果は、性能目標や可用性SLOでなく、採択L2/L11に明記された再現性・隔離・冪等性を観測する完全性条件である。測定対象は固定revisionの宣言scopeに限る。candidate resultはL3承認、検証済状態、release eligibilityを生成しない。

時間予算、retry count、TTL、保持期間、closure上限、通信latencyの具体値は固定親および照合した旧sourceで根拠を得ていない。親に定量値がない場合も起草を止めず、必要な技術値はL3で根拠・比較案・測定方法・判定境界を添えた候補として起草し、対のL10へ結んでL4設計へ渡す。既存のexpiry/retry contractがあればそれを保つ。候補選定で要求意味・scope・owner・version_targetが変わる場合だけL2へ戻す。

旧NFRは`LEGACY-ASSET-DB669724249A14A665F0`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md`, SHA-256 `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`）を起点とし、候補値・測定・判定を一組で記載する骨格だけ再導出する。011との照合では旧NFR-01 line 31 raw span SHA（行末LFを含む） `005dad0f00ca73a50fdd9f34db28ed59ec0efb61619dfcb4d09dfb614a9226aa`、NFR-03 line 32 raw span SHA（行末LFを含む） `9997a36f761b27a21e784757e27d2f98aa1133426f3c441f3cc7ca0e99af1e22`、NFR-15 line 64 raw span SHA（行末LFを含む） `fd30ef69f3e2f7212e4094f3927ecdb57987d180cc61299e75256c77eeec7c3e`を読み、cross-platform OS matrix、AI mode一覧、server-optional phase/valueは対象親にないため置換する。旧L6 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/source-boundary-contracts.md:60–70`（asset `LEGACY-ASSET-0327D0DF98618D3066FD`、full SHA `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a`、raw span SHA（行末LFを含む） `492ba0ba76271c7c39ee02035cfbc4834877519af6452cee317efbbb04434ebe`）はexpiry observation timingとbefore/after-dispatch非success分類の部分起点として再導出し、Node port、署名issuer、filesystem、timeout等の旧実装を現行へ移さない。旧IPA grade、CLI/CI/runtimeの実行条件、割合・timeout閾値は対象親に根拠がないため置換し移植しない。旧NFR-08の4-artifact trace値を現行packへ流用しない。

## Stage 2b suffix — HARNESS-L2-012/013 技術候補

以下は固定L2から導いた候補値・計測方法・判定境界であり、実測値、SLO、親要求の変更またはL3承認ではない。選択scope内で明示した必要項目を分母にし、scope/fixture/oracle不足は未評価とする。個別parameterごとのPO承認gateを作らない。

| NFR候補ID / 親 | 候補値 | 根拠・測定方法 | 適用限界 |
|---|---|---|---|
| `NFR-C-HARNESS-012-01` / `HARNESS-L2-012` | 選択対象で必要なPrototype/PoCの別判定とrevision/scope/result/Backflow traceの保持率100%。非適用記録の固定field欠落0件。PrototypeとPoCの結果を相互に誤分類する件数0。Decide前のproduction昇格0件。 | L2-012がPrototypeとPoCを別判定し、適用時の結果をBackflowすること、非適用では理由・判定者・HEAD・要求影響・再評価条件を残すことから候補化する。計画時に選択scopeの必須outcome fieldを列挙し、各fieldをvalid/missing/unknown/staleで独立集計する。 | field/適用oracleの定義不足は未評価。固定件数、試行回数、prototype usability値、技術成功率や性能閾値を追加しない。分母0では割合なし。 |
| `NFR-C-HARNESS-013-01` / `HARNESS-L2-013` | 選択scopeで固定L2が列挙する入力・逸脱条件のdisposition/根拠trace候補100%。加えて要求エンジン部品とCORE各々の入力契約identity・revision・scopeの必須fieldをtraceし、missing/unknown/stale/mismatchを分母に残して状態別に照合する。別の意味を持つ要求identityの混在0件、人の意味判断・承認・操作権限をAI出力で成立扱いする件数0。 | 固定L2-013は要求エンジン（部品）とCOREの利用を明示し、入力source/revision/scopeと欠落・逸脱の提示を求める。候補案A（依存名が存在するかだけを見る）と候補案B（engine/CORE別のidentity・revision・scopeを選択sourceへ結び、各fieldのstateと根拠まで照合する）を比較し、Aではstaleや別scopeの契約を存在するだけで誤って有効化し得るためBを測定候補とする。Bの分母は各形成で必須となる2依存それぞれの3 fieldであり、missing/unknown/stale/mismatchを分母から外さない。契約内容・payload・schema・実製品ownerは固定sourceで未確定ならunknownのままとし、fixture上の合成identity値と製品採択値を区別する。 | source/契約/ownerが特定できないfieldは未解決として状態別に保持し、必要な契約tupleの有効率を上げるために除外しない。fixed input setやoracleが欠ける場合は未評価。要求形成回数、質問weight、固定iteration、処理時間・品質SLOを確定しない。選択形成をplannedにしていない場合は未測定とし、分母0を成功や要件充足として扱わない。固定L2で必要な2依存の定義/入力自体が不明な場合も未評価にする。 |

## Stage 2b suffix — HARNESS-L2-014/015/016 技術候補

下表はL3で評価する測定候補であり、固定要求値・実測値ではない。母集団は選択した親の明示scopeに限り、必須義務/traceを事前列挙する。欠測・unknown・矛盾・省略は分母から除かず、期待oracle自体がないfixtureは未評価に分ける。既存caseで測れることを理由に別parentや全Stage共通gateを追加しない。

| NFR候補ID / 親 | 候補値 | 根拠・比較・測定方法 | 適用限界 |
|---|---|---|---|
| `NFR-C-HARNESS-014-01` / `HARNESS-L2-014` | 適用対象として宣言されたtemplate義務、承認済み要求source/revision/scope、対のverification designの必須trace保持候補100%。既知義務の未対応/矛盾候補0件。 | L2-014とL11-014がtemplateから義務を導き、制約と設計結果・変更影響・対検証を照合するため候補化。案A（template fieldの存在だけ）と案B（要求制約→義務→設計要素→L9/L8/L7 oracleの意味対応）を比較しBを候補とする。選択scopeの宣言義務をplanned setにし、valid/missing/unknown/conflict/unselectedを別集計する。 | template applicabilityまたは要求意味oracle不明は未評価。template/schema/義務数、適合率、設計品質の一般閾値を追加しない。既知scope分母0は率なし、義務定義自体が不明なら成功扱いしない。 |
| `NFR-C-HARNESS-015-01` / `HARNESS-L2-015` | 適用対象の凍結design/contract/test trace候補100%、CORE工程契約とCORE検証契約の独立source identity/revision/scope trace候補100%、事前固定quality oracle違反を合格扱いする件数0、結果に対するartifact revision/scope欠落0。費用・時間の改善だけで品質未達を成功にする件数0。 | L2-015の別個のCORE工程契約/検証契約、Red/Green/local Refactor/atomic CIとL11の品質優先oracle（G12/G13）から候補化する。案AはCI greenと契約名の存在だけ、案Bは各契約の独立identity/revision/scope source trace、固定behavior/quality oracle、trace、atomic CI範囲/省略recordを合わせる。Bを候補にしてfunctional CASE-015群のplanned obligationを状態別に照合する。旧HR-NFR-P3-04/HAT-N3-04/LIT-N3-04からはtest-firstとpaired oracle観測形だけを再利用し、固定L2/L11にない理由付き代替oracle経路は採らない。 | CI greenをquality/system/user acceptance/releaseへ昇格しない。CI製品・段数・所要時間・coverage/test件数や契約schema/ownerの固定値を設けない。oracle/sourceが特定されない契約tuple、選択scope未確定、実行されていない結果は未評価/未測定としてplanned denominatorに残す。 |
| `NFR-C-HARNESS-016-01` / `HARNESS-L2-016` | 要求/contract/behavior回帰oracleのplanned scope保持候補100%、既知の意味回帰・Backflow先誤り0件。Performance比較可能性はbaseline/budget/workload/profile/statistical condition/regression oracleの6必須field保持候補100%。 | 旧HIL-16 paired semantic/consumer/oracleとL11-016のbefore/after・profile比較を起点にする。案Aは局所benchmarkまたは変更量、案Bは同一対象scopeでpaired oracleと6測定条件を測定前に固定し、性能結果と全回帰結果を併記する。Bを候補としてCASE-016群からplanned obligation、valid/failed/missing/unknown/censoredを分けて集計する。 | 固定L2にない改善率、閾値、SLA、環境同一性の具体値を決めない。baseline/budget/workload/profile/statistical condition/regression oracleのいずれかを測定後に決める変異は不合格。比較不能環境、source/oracle未確定は未評価。要件・contract意味の差はPerformance結果にかかわらずBackflowし、④の完了を条件化しない。 |
## Stage 2a suffix — HARNESS-L2-022（1.0対象）

固定L2-022/L11は段階別証拠と同一artifact revision/scopeの追跡を要求するが、性能SLAの数値を定めない。以下は根拠付きのL3技術候補であり、要求済みの固定値ではない。個別parameterのPO承認gateを作らない。

- **`NFR-C-HARNESS-022-01` trace integrity（候補）**：選択scope内の各必須FR/ACを一つ以上の適切なL10 oracleへ追跡し、oracle/result/evidenceのartifact revisionとscopeを一致させる。FR/ACとCASEの対応は必要に応じ多対多でよく、一対一制約を追加しない。候補境界は、選択scope内の必須FR/AC trace completeness 100%、未解消の必須trace/evidence tuple mismatch 0件。これは必須traceの完全性を測る技術候補であり、quality/security/acceptanceの品質閾値ではない。IDの重複は別の識別子不備として検出する。根拠はL2-022の段階証明・同一revision/scope条件とL11:268のoracle結果とtrace/evidence存在の区別、数値thresholdを追加しない共通前提であり、G13 receiptは品質判定をstage別oracleへ結び結果から承認を生成しないことを補足する。L10で対応漏れ・重複・revision違い・scope違い・必須証拠欠落を独立変異し、各条件がpassにならないことを測る。別fixtureでtrace completeness 100%とtuple mismatch 0件を満たしたままstage-specific quality oracle未達を与え、trace計測は完全でも品質pass・上位state・Acceptedを生成しないことを確認する。固定sourceが定めない旧51/102件の分母を流用しない。

この親だけからthroughput/latency/availabilityの数値義務は導出しない。別の固定根拠から測定値が必要になった場合はL3で根拠・比較案・測定方法・判定境界を持つ候補を起草し、対のL10へ結ぶ。数値根拠がなければ当該数値NFRは設定しない。
## Stage 2c suffix — HARNESS-L2-030/031/032 技術候補

以下は固定親に根拠がある完全性・整合性の計測候補であり、実測結果、性能SLO、要求承認またはrelease eligibilityではない。分母は当該固定revision/scopeで明示必須かつ選択された操作に限定する。未選択・未測定、失敗、欠測、打切り、unknown/staleは独立stateで記録し、母集団から消さない。分母0では割合を出さず「測定対象なし」と記録する。候補値はL4へ渡す技術候補であり、個別parameterのPO承認gateを作らない。

| NFR候補ID / 親 | 候補値 | 根拠・測定案 | 適用限界 |
|---|---|---|---|
| `NFR-C-HARNESS-030-01` / `HARNESS-L2-030` | 選択scopeで必要なdeclared case fieldとrequirement/design/oracle/source/scope traceの保持率100%；根拠のないexpected value・permission・boundaryまたは未選択source適用の推論0件。 | L2-030の再現可能case提案、022 oracleと014 designのtraceから候補化。予定必須field/traceごとにpresent/valid, missing, conflict, unknown, not-selectedを数え、生成caseの意味を同一input/source版/scopeで比較する。 | sourceが宣言しない値は判定不能として保持。case数、mutation score、coverage目標、実行成功率は追加しない。分母0では率なし。 |
| `NFR-C-HARNESS-031-01` / `HARNESS-L2-031` | 選択reduction stepに必要なsource/revision/scope/oracle/result-receipt trace完全率100%；receiptなし・症状不一致でsame-failureと断定する件数0；original failure履歴削除0。 | L2-031とL11 step-by-step例に従い、planned selected stepsを母集団に各stepのpermission/sanitization/oracle/receipt状態を独立集計する。unselected future fix/passは母集団へ加えない。 | 未選択・失敗・missing・censored・unknown状態を別記し、合計母集団を偽らない。最大step数、削減率、再現SLAや成功率を作らない。 |
| `NFR-C-HARNESS-032-01` / `HARNESS-L2-032` | 選択packetに必須のartifact/source/revision/scope/oracle/consumer schema/permission trace保持率100%；unknown/incompatible/undeclared consumer contractをvalid接続扱いする件数0；handoffからrun/passを推論する件数0。 | 明示選択されたpacket obligationごとにplanned, valid, failed, missing, stale, mismatch, unknown, unselected/unmeasuredを集計し、receipt slotを含むschema bindingを照合する。 | 母集団は選択操作だけ。未選択consumerは未観測、分母0は割合なし。負荷根拠のないlatency/throughput閾値を追加しない。 |

数値候補の必要な根拠・比較案・測定方法・判定境界を本L3と対のL10へ記し、L4設計へ渡す。固定sourceが明示しない値・互換range・permissionはunknownのままとし、上流要求の意味・範囲・owner・version_target変更を伴う場合だけL2へ戻す。


### Stage 2c測定分類の補足

Nrequiredは対象revision/scopeで選択操作に適用する契約必須項目の集合であり、missing/unknown/不一致も分母に残す。Nmatchedはsource/意味/版/範囲がoracleと一致して保持された項目数、保持率候補はNmatched/Nrequired。名前やpresenceだけの案Aと、意味/source tupleまで照合する案Bを比較し、意味差分を見逃さないBを候補とする。契約必須項目の定義自体が不明な状態をNrequired=0へ変換しない。既知の対象集合が0なら率なし、必須定義不足なら未評価と理由を別記する。

plannedは総予定試行数。観測可否はvalid（判定できる観測が得られた、不合格も含む）、failed（処理エラーで判定可能な観測を得られない）、missing（必要入力/結果がない）、censored（停止/打切りで観測未完）を排他的に記録し、Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを確認する。意味状態のvalid/missing/stale/mismatch/conflict/unknownは別軸で、観測状態の件数へ重ねて加算しない。未選択consumer/sourceは未観測の背景として別記し選択操作の分母外。未実施は未測定、欠測/停止を0の観測や成功にしない。

## Stage 4 suffix — HARNESS-L2-026/027/028/029 技術候補

以下は固定L2/L11のtrace・source identity・比較境界から導いた技術測定候補であり、実測、SLO、実装方式、L3承認ではない。候補値の必要な分母・状態は対の[nfr-verification.md](../L10-verification/nfr-verification.md)で測る。fixtureに必要なsource/oracleがない場合は未評価とし、分母0を成功率に変換しない。

| NFR候補ID / 親 | 候補値 | 根拠・比較案・測定方法 | 適用限界 |
|---|---|---|---|
| `NFR-C-HARNESS-026-01` / `HARNESS-L2-026` | 選択scope内の固定requirement、template義務、CORE/BRAIN connector、設計要素、対oracle間で必要なrelationの保持候補100%；既知relation欠落/矛盾0件。 | 固定L2-026とL11 332–356は相互参照、具体設計、pair、常時connectorと選択Pattern、および014/026交換境界を分ける。L2-009義務・承認済L3/対象revision、unknown/N/A/impact、unit/connection/compositeの区別、交換後receipt非流用を個別fixtureで測る。presenceだけの案Aとidentity/revision/scope/内容oracleまで対応する案Bを同じfixtureで比較する。 | 未選択Patternは分母外・未観測。適用oracleがないfieldは未評価。性能値や全Pattern完成義務を追加しない。 |
| `NFR-C-HARNESS-027-01` / `HARNESS-L2-027` | 選択source observationの根拠span・source identity/revision/digest/scopeの必須field保持候補100%；unsupported/unknownをsupportedとして出す誤り0件。 | 固定L2-027、L11 363/365–374と旧FR-14はsource-bound observation、unknown/gapを根拠と結ぶ。案Aのfield presenceと案Bのsource tuple+span+状態比較を対照し、custom-processing候補の位置/根拠handoff、type別の抽出限界、pass tupleも個別fixtureで照合する。 | 選択source・宣言scopeのみ。runtime correctnessや未選択typeを測らず、固定親にないparser対応率/処理時間を設定しない。 |
| `NFR-C-HARNESS-028-01` / `HARNESS-L2-028` | 比較scopeのknown relationにおけるaffected/unaffected/unknown分類とrevision traceの保持候補100%；receipt欠落または対象revision不一致のままapprovedと主張する件数0。 | 固定L2-028/L11 375–382のexact comparison、共通componentの単一owner/複数利用境界、CONNECT通信との分離、selected API/migration operationの条件付き契約を、presenceのみの案Aとexact identity/revision/relation tupleの案Bで比較する。CASE-028-19〜45のbaseline・unknown・operation・所有境界fixtureをplanned obligationへ含める。 | known relation・identified saved revisionに限定。未表現edgeはunknown。全製品影響率やfull reverse件数を固定しない。 |
| `NFR-C-HARNESS-029-01` / `HARNESS-L2-029` | 選択proposal bundleの五要素間に必要なsource/scope/revision/owner traceの保持候補100%；選択済みoperation依存欠落、未選択operation依存の強制、proposalを実行/承認へ誤昇格する件数は各0。 | 固定L2-029/L11 383–392/395の五要素、CORE所有、proposal identity/scope・target requirement revision/authority、保存design authority不変、operationごとのAPI oracle・target implementation revision・schema・permission・loss oracleを、名称だけの案Aと実体・選択状態・依存traceを個別照合する案Bで比較する。CASE-029-25〜66を選択/非選択とfield別状態のplanned fixtureにする。 | 必須依存やoracleを固定sourceで特定できない場合は未評価/unknown。migration/APIの常時選択、任意の信頼度・coverage・性能閾値を作らない。 |

必要な技術値は、固定親で判定境界が明示されない場合も起草を止めず、根拠・比較案・測定方法・分母/状態境界を添えた候補として対L10へつなぐ。要求の意味・scope・owner・versionを変える必要が生じる場合だけL2へ戻す。旧runtime/CLI/CIや旧schemaは実行・移植しない。

## Stage 2b 残件追補 — HARNESS-L2-017/018/019/020/024

本追補5親は未承認の起草。既承認prefixを変更せず、実行結果や下流許可を生成しない。

| NFR候補ID / 親 | 候補値 | 根拠・比較案 | 適用限界 |
|---|---|---|---|
| `NFR-C-HARNESS-017-01` / `HARNESS-L2-017` | Release Port必須条件の未充足をeligibleにする件数 **0**、同一input/revisionからのartifact identity/digest不一致 **0**。 | 固定親のeligible条件、同一入力からの再現、未回収検査の停止を観測する候補。例外昇格案は条件を弱めるため不採用。 | release rateやdeployment durationを加えず、eligible候補を実配備へ読み替えない。 |
| `NFR-C-HARNESS-018-01` / `HARNESS-L2-018` | designed/implemented/verified/observed/operated間の誤状態遷移 **0件**。各観測recordに対象revision・時点・要求ownerの欠落 **0件**。 | 固定親の状態分離と観測・再要求経路の完全性を測る候補。stage存在を後続stage証明とする案は明示的に不採用。 | 可用性、信頼性、性能、容量、費用、retention等の数値は製品ownerの要求があるときだけその範囲で測定する。各製品固有のquality、SLO、対象環境、RTO、RPO、保持期間、予算を全製品へ共通固定しない。 |
| `NFR-C-HARNESS-019-01` / `HARNESS-L2-019` | 入力sourceの変換可能範囲・unknown・不整合の未分類数 **0件**。変換候補からの承認／release自動生成 **0件**。 | 逆方向形成のtrace保全とauthority非生成を候補化する。全部成功/全部拒否のbinary案より、変換可能部分とunknownを分ける候補が部分入力に忠実。 | 入力stageごとの時間・変換率を要求閾値化しない。 |
| `NFR-C-HARNESS-020-01` / `HARNESS-L2-020` | handoff対象の全必須fieldと契約版の対応欠落 **0件**、不整合入力の暗黙受理 **0件**、handoffによるupstream state変更 **0件**。 | 固定親のproducer/consumer契約一致と状態非書換えを直接観測する。汎用warningだけ返す案は個別不整合を隠すため不採用。 | 関係のない隣接stageへの一律依存や、handoff成功率を新しい業務目標にしない。 |
| `NFR-C-HARNESS-024-01` / `HARNESS-L2-024` | 同一engine/pack/target revision・scope・既回答から、質問順・理由・状態の差分 **0件**。score・fixture score・質問回数・訂正率・iteration数・無変更iteration・timeoutの各単独根拠による必須不足の見逃し・人間合意への昇格 **0件**。PoC Backflowのidentity・failure/timeout・trace・owner/re-entry欠落を成功/解決扱いする候補件数 **0件**。対象製品への他製品pack field混入の受理 **0件**、当該pack欠落/版不一致の暗黙補完 **0件**。 | 固定親が同じ入力から同じ質問順序・理由・状態を要求し、score・質問数・iteration数だけで収束しないことを観測する。固定質問数や数値weightを足す案は不採用。 | 意味評価を単一accuracy閾値へ還元しない。履歴の最低件数や質問件数SLOを設けない。適用Prototype／非UIの合意状態は別々に検査する。 |

## Stage 5 suffix — HARNESS-L2-021/025/033/035/037 技術計測候補

次の値は固定親に明記された完全性・状態分離を観測する候補であり、実測結果、性能SLO、承認、release eligibilityではない。planned母集団は選択scope内で事前列挙された必須relation/operationに限る。valid/failed/missing/censoredの観測状態とvalid/missing/unknown/stale/mismatch/conflict/unselectedの意味状態を別々に集計する。未選択は未観測、分母0は割合なし、oracle不足は未評価とする。

| NFR候補ID / 親 | 候補値 | 根拠・比較案 | 測定方法と限界 |
|---|---|---|---|
| `NFR-C-HARNESS-021-01` / `HARNESS-L2-021` | 選択scopeの必須端から端relation/構成体固有obligationに対する正確なsource/revision/scope/evidence保持率候補 **100%**、unit成功のみから構成体成立を誤claimする件数 **0**。 | L2-021とL11:216は構成体固有trace・横断NFR・統合更新/rollback・L12運用をunit成功と分ける。単なるartifact presence案Aと、relation tuple・oracle・統合版・運用証拠まで照合する案Bを比較し、Bを候補とする。旧Lite/Full件数や旧coverage閾値は根拠にしない。 | Nrequiredは選択構成体scopeで事前に列挙した必須relation。missing/unknown/stale/mismatchを分母に残す。Nrequired=0なら率なし。構成体外、未選択unit、実サービス品質のSLOは測らない。 |
| `NFR-C-HARNESS-025-01` / `HARNESS-L2-025` | 常時必須tuple・必要relation・invariantのtrace保持率候補 **100%**、必須connector欠落を有効compositeにする件数 **0**。 | 固定L2-025/L11が026 unit、常時BRAIN connector、要求→設計→oracle trace、正常/拒否/failure pathを要求する。Pattern全知識を要求する案Aと、selected Patternのみreceipt/conditionを加える案Bを比較し、Bを採る。 | 常時必須と選択時のみのplanned obligationを別分母にする。非選択Patternは未観測で除外。適用oracleのない設計relationは未評価。性能/Pattern網羅率を要求しない。 |
| `NFR-C-HARNESS-033-01` / `HARNESS-L2-033` | 選択operationの段階別source/revision/scope/oracle/receipt保持率候補 **100%**、将来result欠落・不一致で回帰成立を誤claimする件数 **0**。 | 固定L2-033はcase生成、incident reduction、isolated run、同一failure、修正前fail、選択時修正後passを別stageにする。単一success flag案Aと、各段階result tupleを分ける案Bを比較し、Bを候補とする。 | denominatorは選択されたoperationの事前planned stepsだけ。修正後run未選択は未観測であり欠落失敗に含めない。incidentを使わない通常caseへrepro義務を加えない。run性能・縮小率を固定しない。 |
| `NFR-C-HARNESS-035-01` / `HARNESS-L2-035` | 選択候補の根拠/受入寄与/代替/budget-state trace保持率候補 **100%**、rootless candidateを根拠充足と扱う件数 **0**。 | 固定L2-035/L11:485,678およびL2:931–941の根拠経路・scope境界を測る。候補のID/存在のみを見る案Aと、上流revision・relation・authority状態・scope拡張時の複雑さ/公開面/運用負債の変更前後を追う案Bを比較し、Bを候補とする。三観点それぞれの対象/方法/条件が未測定ならunknownを残す。 | planned denominatorは選択候補の必須field/edge。unknown budgetはunknownのまま分母に残し、数値予算/複雑度閾値を作らない。通常Feedback履歴は導出循環のfailure countにしない。 |
| `NFR-C-HARNESS-037-01` / `HARNESS-L2-037` | 適用条件がtrueのscopeにおけるphase別authority/design/L9 receipt relation保持率候補 **100%**、phase間の承認/receipt流用による誤合流 **0**。 | L2-037とL11:527–573は二段適用、phase別上流とpair、合流を扱う。phase成果物の存在だけを見る案Aと、phase identity/revision/scope/oracle/receipt tupleを個別照合する案Bを比較し、Bを候補とする。 | 009適用性trueのplanned scopeだけを分母にする。false/unknown/未選択対象は適用分母外で未観測として記録する。phase適用率、工程期間、全agent coverageを固定しない。 |

候補の100%は定義済みplanned必須relationのtrace完全性だけを表し、要求品質やL11受入のthresholdではない。candidate値・計測結果から承認、実行許可、受入、releaseを生成しない。旧NFRの固定件数・CI/runtime値は再利用せず、固定親が与えない性能目標を設定しない。

### Root検収補正 — planned CASE集合の追補

| 親 | 追加CASE集合 | 母集団と状態分類 |
|---|---|---|
| `HARNESS-L2-021` | `CASE-HARNESS-L10-021-S5-001–006` + `CASE-HARNESS-L10-021-S5-007–016` | E2E trace、統合update/rollback、L12 observation/return、LABO/OS責務を独立planned obligationにし、source/revision/scopeとrelease/operation stateを分ける。 |
| `HARNESS-L2-025` | `CASE-HARNESS-L10-025-S5-001–006` + `CASE-HARNESS-L10-025-S5-007–035` | 常時必須tuple、selected Patternのrequired input/relation/version、双方向trace、permission/data/oracle、unit/connection/compositeを別planned obligationにする。nonselected Patternは未観測で分母外。 |
| `HARNESS-L2-033` | `CASE-HARNESS-L10-033-S5-001–007` + `CASE-HARNESS-L10-033-S5-008–037` | source/unit/oracle/consumer fieldとstage receiptを分ける。S5-024/025はS5-005/006の索引aliasとして独立fixture母集団へ重複加算せず、repro、regression claim、修正後pass非選択を別状態にする。 |
| `HARNESS-L2-035` | `CASE-HARNESS-L10-035-S5-001–006` + `CASE-HARNESS-L10-035-S5-007–042` | root source、authority/revision、non-goal/scope、acceptance contribution、necessity/alternative、budgetをfield単独planned化しunknown/stale/mismatchを分母に保持。 |
| `HARNESS-L2-037` | `CASE-HARNESS-L10-037-S5-001–007` + `CASE-HARNESS-L10-037-S5-008–058` | 009 applicability、各phaseのL2/L3 authority、template、022 oracle/state、L4/L9、handoff、UI選択/非選択を別 obligationにする。S5-023はS5-005の索引aliasとして独立fixture母集団へ重複加算せず、S5-006（receipt対Phase 2設計scope）とS5-027（receipt対merge scope）は異なる比較条件として保持し、nonselected operationは未観測。 |

100% trace coverageと誤ったsuccess/merge/authority 0件は静的分類の技術候補であり、実測ではない。planned denominatorを個別CASE集合で固定する。観測状態valid/failed/missing/censoredと意味状態missing/unknown/stale/mismatch/conflict/unselectedを分離する。分母不明を0へ変換せず、未実行は未測定とする。数値SLO・CI実行・性能測定は作らない。

Stage 5の索引aliasは021-S5-011→004、033-S5-024/025→005/006、037-S5-023→005と037-S5-057→053。これら5索引は個別fixture分母へ重複加算しない。

035-S5-033は撤去した旧変異のID保全用時点注記であり、同一変異aliasではない。個別fixture分母から除外し、運用負債欠測の個別変異は035-S5-041だけで評価する。


## Stage 3 親034の非機能要件候補

| NFR candidate | 根拠と計測境界 |
|---|---|
| `NFR-C-HARNESS-034-01` | 固定L2-034の14項目と対象requirement/NFR stable identityがscope/revisionを通じて対応することを候補指標とする。適用scope内の候補metricだけを母集団とし、unknown applicabilityをN/Aや0へ変換しない。実測の成功率/閾値を作らず、missing/stale/nonrepresentative/unmeasured/unmetを区別する。別環境/別revisionの結果は元のscope/revisionで有効に保持し、現在対象metricの未測定を相殺しない。 |

fixture definition数と実測母集団は異なる。対のL10機能総合検証にあるr19/r20/r21の定義は正常・反例の候補であり実測ではない。r21は別環境/別revisionの有効結果で未測定対象を相殺する誤completion出力を個別に扱う。既存CASE索引はunique measurement fixture数へ加算しない。NFR-034-01の候補はL2:698–701、711およびL11:465–483へ再導出し、旧NFR rate/KPI、旧CLI/CIまたはthresholdを流用しない。


## Stage 3 親036の非機能計測候補

| NFR候補 | 候補値・根拠 | 限界 |
|---|---|---|
| `NFR-C-HARNESS-036-01` | selected profile/scope内のW必要観点抜け・level間重複と、4 cross-detection軸の誤ったpassを個別に観測し、該当gateの成立時に各適用条件を0件とする。local/CIのselected gate contract mismatchは同一条件passとして数えない。対象母集団はL2-005で選択された範囲。 | 全ticket・全test段階・全環境の一律実行率を要求しない。unknown/unobservedを0にしない。 |
| `NFR-C-HARNESS-036-02` | NFR-13の運用KPI D-02 `≥90%`を、eligible gate opportunityの選択windowにおける分子/分母候補として報告する。値・期間・母集団・除外状態を保持し、欠測/failed/censoredを明記して比較する。 | 運用目標であり個別ticketのpass閾値ではない。固定していないwindow長・対象cohort・分母規則を候補から規範化しない。適用母集団・期間・分母はL3で照合し、KPI D-02の要求意味を変更する場合はL2へ戻しPO判断を求める。判断前に新しい意味へ置換しない。分母/windowがunknownなら未評価。 |

## Stage 3 親038の非機能計測候補

| NFR候補 / L2親 | 候補値 | 固定根拠 | 限界 |
|---|---|---|---|
| `NFR-C-HARNESS-038-01` / `HARNESS-L2-038` | selected scope内の適用obligationの片方向relation、aggregate-only coverage、未根拠N/A/no-findingは0件を候補oracleとする。 | HIL-FR-22の両方向edgeとHIL-FR-35の段階内容閉包に根拠。後段未作成はunresolved obligationとして数え、失敗扱いと区別する。 | 全旧source走査率や全機構一括closure率にしない。 |


## Stage 3 親039のNFR候補

固定L2-039はUX完了を主張するoperationに同一scope/revisionの7軸current evidenceとhuman evaluationを要求するが、数値SLO、共通閾値、率、対象cohort、測定期間は定めない。この条件は機能AC-HARNESS-L3-039-02のstate/evidence境界として扱い、独立NFR値や測定pass rateを新設しない。実測値・未測定・stale・unknownは対象scope/revisionごとに保持し、欠測を0、N/A、成功へ変換しない。旧IPA/旧CI/runtimeの値は再利用しない。

## Stage 3 親040の非機能計測候補

| NFR候補 / L2親 | 候補値 | 固定根拠 | 限界 |
|---|---|---|---|
| `NFR-C-HARNESS-040-01` / `HARNESS-L2-040` | canonical 12 layer、6 pair、独立L0 anchorの必要catalog relation欠落0件。片edgeを双方向成立へ数える件数0。 | HIL-FR-46のledger/pair/anchor契約から直接導出。 | 未作成ledgerはmissing obligationとして記録し、全ledgerの実装率やregistrationを主張しない。 |

## Stage 3 親042の非機能候補

| NFR候補 / L2親 | 候補値 | 固定根拠 | 限界 |
|---|---|---|---|
| `HARNESS-L2-042` | 独立した数値NFRを導出しない | 旧requirements v1.3 §4.2 L119の性能Refactor条件は、PO採択済みHARNESS-L2-016と対L11がbaseline、budget、workload、profile、統計条件、regression oracleを持つ。 | 新しい数値閾値、性能権限、時間/件数SLOを作らない。性能判定を行う場合は016へ委譲する。 |


## Stage 3 親041の非機能計測候補

独立した性能・成功率・コストの閾値を追加しない。固定L2-041が規定する範囲の観測候補は次に限る。

| NFR候補 | 観測候補・根拠 | 限界 |
|---|---|---|
| `NFR-C-HARNESS-041-01` | selected template/scope内のsource obligation population、各obligationに結び付くatomまたはtyped gap、provenance mismatch、duplicate/unaccounted findingの数を別状態で記録する。各義務を個別atom/gapへ対応する固定L2-041条件から導く。 | aggregate coverage countだけで全要素をcoveredにしない。unknown/unselected inputは未観測と分離する。未解決gapを成功扱いしない。性能値・全template全域率・threshold・実測結果は作らない。 |

NFR候補はL10定義の測定母集団の設計にとどまり、抽出器の性能や実行成功を主張しない。

## Stage 3 親047の非機能候補

| NFR候補 / L2親 | 候補値 | 固定根拠 | 限界 |
|---|---|---|---|
| `HARNESS-L2-047` | 共通の数値NFR/thresholdなし | 固定L2はtaskに適用される測定可能な利益を要求するが、共通thresholdを追加しない。 | 固定provider/model、価格閾値、Worker人数・team sizeを設けない。budgetの値/実行適用はOS既存契約。 |

## Stage 3 親049の非機能候補（表示計測のevidence integrity）

**採択済み固定親**：PO `po-decision-2026-09-30-live26.md:39,72`の登録`MPR-RC-HARNESS-L2-049-003`。source_repository_revision `ea6f756f96a7370de78e412d737c7a7ed472114a`、L2 `product-requirements.md:1070–1092` SHA-256 `a5df1f7bdca708046ec9ad68e1eea0974884da63205b8995ad45dcd8f0bbc116`、L11 `product-acceptance.md:802–814` SHA-256 `f3fb47da21371084e9f8c7c7f7ca6dd945c8e98ae7c7b70597c3fc44e4e08ee7`。旧318のL11および登録-002を親にしない。

独立のperformance/latency/accuracy閾値、可用性目標、追加測定窓は固定L2-049から導出しない。選択scopeごとに対象revision、device/view/locale条件、profile、oracle/手段版、fixture、結果、evidenceの対応関係を追跡できることを定性的なevidence-integrity候補として記録する。欠落・不明はunknown/未評価として残し、未観測を0件・成功・合格へ丸めない。精度成立は候補数・fixture数・実行回数のみで推定しない。実測値と閾値は根拠sourceがないため本候補では設定しない。

## Stage 3 親054の非機能要件：専門Worker判定・契約のOS割当handoff（起草候補、version_target: 1.0）

**採択本文の固定**：PO記録のsource_repository_revision `5aa100319361b0cc86edd3c51815ec777d55410a`。L2 `product-requirements.md:1154–1162` SHA-256 `b76b7b1adec804a25bd9333663aa9b0d074f68518764c2874c994bcdf6ead193`、L11 `product-acceptance.md:865–875` SHA-256 `5d1ab0bad44ae305053932f0c82bcf472e145046125b638f5facab13eaaa2aa0`。旧調査snapshot e94838f5の同本文とbyte一致。末尾空行込みの物理span digestは別の監査pinとして区別する。

**状態と根拠**：本節はHARNESS-L2-054／L11-054の意味をL3要件とL10 oracleへ再導出する起草候補である。POの決定記録 `MPR-RC-HARNESS-L2-054-001` は採択（判断記録revision `b0b0719dfe786370e9bee48c5d2f753710546b6f`、PO row 34）。固定L2/L11本文に残る「未採択候補」は当時の本文メタデータであり、この後のPO決定を覆さない。L2-047は別親で、その既存のmuster判断を受け渡すだけで意味を変更しない。PO-047条件判断や別親の採択を本候補から生成しない。

**旧sourceとの扱い**：旧HIL-BR-09/30、HIL-FR-59/60/61/62/63の対応を起点に、工程・入力・必要性判断・runtime-neutral契約・OS handoffへ責務を再導出する。旧runtime固有projectionや旧TeamDefinition schemaは再利用しない。旧100 CASE IDとraw literalは監査用に保持し、現行fixture条件は固定L2/L11に沿って再導出する。旧source全体、旧runtime/testの実行、旧要件の全件closureを主張しない。HIL-FR-63の歴史的effort defaultは旧sourceにとどめ、1.0の技術値や閾値へ前倒ししない。

**責務とauthority**：HARNESSはprocess/verificationの意味、muster必要性判断、runtime-neutral contract内容と型付きhandoffを所有する。OSは正規のassignment発行者であり、assignment、profile、budget/deadline、lifecycle、実行と結果を既存契約の範囲で所有する。INTELLIGENCEはplacement proposal、LABOはevidenceの適用可能性、SECURITYはoperation authority・制約・隔離を所有する。HARNESSがOS assignmentを発行したりWorkerを起動したりしない。通常の既存roleへのOS assignmentは許される。`existing_role_sufficient`なら追加specialist contractも追加specialist assignmentも生成しない。

**型付きhandoffの候補条件**：対象task/ticket identity、scope、要求/oracle revision、`layer × drive`、process phase、task-kind、verification pattern、design obligation/oracle、domain/risk、judgment-pack revision、single-worker比較条件、適用可能なLABO evidenceと未評価状態を保持する。必要な場合のみINTELLIGENCE proposal、OS profile/budget/deadline/lifecycle、SECURITY authority/制約への参照を結ぶ。`muster_candidate`は契約参照（複数の場合はその全体集合）と対応するinput/output digest、複数参照時の集合digest、generation-rule revision、理由、比較対象/evidence、guard結果を同じscope/revisionに結ぶ。digestの算法、wire format、enum、固定worker数、threshold、TeamDefinition、provider/runtime固有fieldは新設しない。receiptやdigest自体はauthorityではない。

`existing_role_sufficient`は入力にある対象既存role参照と比較根拠を値として返し、両値が同一task/scope/revisionに対応する入力値と一致することを照合する。specialist contractを含めず、既存roleへの通常assignmentはOSが発行する。この分岐から追加specialist assignmentや新規Worker起動を生成しない。`unknown_or_defer`は不足・不確実・staleの条件、既知の責務区分、再照合に必要な入力を入力値に対応させて返し、それぞれが同じtask/scope/revisionに一致することを照合する。既知の責務区分へ個体identityの特定有無にかかわらず不足を返し、個別source identityやowner identityが特定できないときはその個体だけunknownのまま別記する。ownerの新設、値の推定、unknown軸の別軸への畳込みをしない。OS応答/assignmentが欠落、対象不一致、revision不一致または条件不明ならhandoffは未完である。

### 品質要件 `NFR-HARNESS-L3-054`

候補handoffの追跡可能性は、対象task/scope/revision、typed contract reference集合（複数時）と集合digest、input-output digest、generation-rule revision、理由、比較/evidence、guard結果の結合と、別ownerであるOS assignmentの個別照合によって確認する。複数contractの正常集合・集合digestを入力期待値と出力で照合し、集合の一部欠落・集合digest欠落・別集合を各単独変異で拒否する。集合digestは合成fixture内の期待値であり、algorithmやwire formatを定義しない。未知・stale・conflictを隠さずunknown/deferとして保持し、cause-specific既存責務へ返す。digest算法、数値threshold、固定時間、性能値、再試行回数、追加ownerは本候補で定義しない。

HARNESS出力がdigestまたはOS receiptからauthority/実行許可を、contract generation receiptからauthority/Worker起動/成果受入を生成しないことを各field別oracleで検査する。source/coverage receipt、候補本文、fixture、OS記録例の存在から要求採択またはL3承認を作る出力、仮登録または候補本文からWorker起動を作る出力を各々独立fieldとして拒否する。これらの証拠からoracle実行・合格、runtime projection、assignment、security許可、利用者受入を作る出力も個別に拒否する。正常入力を既存ownerへ返して隠さず、HARNESS候補出力自体を訂正する。仮登録だけから要求採択・L3承認・assignmentを出すfieldと、handoffだけから実行許可を出すfieldはc51–c54で個別に拒否する。layer/drive applicability-scopeのmissing/stale/conflict/unknownはc55–c62で各field単独に保留する。c03の正常fixtureではlayer/drive source-input値とapplicability-scopeを対応する出力値に項目別照合する。existing-role-sufficient時にspecialistを追加しないことも別oracleで検査する。これは静的oracle候補であって実行結果ではない。
