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
