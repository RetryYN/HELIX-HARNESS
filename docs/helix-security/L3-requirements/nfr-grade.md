# HELIX-SECURITY L3 NFR候補（1.0採択親31件の草稿）

> 状態: 全体的なtimeout/latency/retention数値は固定されていない。以下はfixed L2/L11から直接導ける境界値と、比較・測定可能な技術候補であり、実装値やPO承認値ではない。parameterごとのPO判断は求めない。要求の意味・scope・owner・versionを変える場合だけL2/POへ戻す。

| 候補ID / AC | 候補parameter | 候補値・比較 | 根拠 | L10で観測するもの |
|---|---|---|---|---|
| `SEC-NFR-001` / `SECURITY-AC-005-01` | raw secret exposure | context/log/artifact/Tool result/Worker payloadへのraw secret値露出は0件。 | `HELIXSECURITY-L2-005`および採択済SECURITY-L2-033 P0訂正。 | 識別可能な合成secret markerを全出力先で検索し、0件であることを確認。値そのものは証拠へ書かない。 |
| `SEC-NFR-002` / `SECURITY-AC-008-01` | operation authority tuple | actor/target/operation/revision/environment/scope/expiryの7要素すべて一致した場合のみ適用し、欠落・不一致の許可は0件。 | `HELIXSECURITY-L2-008`の7要素tuple。purposeはL2-006のegress入力であり、この候補へ含めない。 | 7要素を個別にdriftさせ、各negativeでallow 0件、exact tuple positiveで対象operationだけを許可する。 |
| `SEC-NFR-003` / `SECURITY-AC-016-01` | classification completeness | fixed L2の6分類を6/6識別し、unknownをpublic/allowにした件数0。 | `HELIXSECURITY-L2-015/016`とL11の1.0境界。 | 6分類を一つずつfixtureし、missing/unknownを分離。Web sink enforcement完了率を1.0に混入しない。 |
| `SEC-NFR-004` / `SECURITY-AC-020-01` | deterministic Guard coverage | L2-020列挙の8 Guard責務について、決定的ruleをBotへ委ねた件数0。必須Guard条件抜け0。 | `HELIXSECURITY-L2-020`の8名称とBot任意境界。後続1.x sink enforcementはこの1.0候補に含めない。 | Botなし/必要時のみの同一条件でGuard判断を比較し、rule未定義・適用不能・必要観測欠落は該当enforcement ownerへのunknown/holdとして数える。全例示Botの稼働は計測・合否対象としない。1.x sink enforcementを1.0 pass条件へ混入しない。 |
| `SEC-NFR-005` / `SECURITY-AC-009-01` | revoke recipient closure | 対象scopeに該当するrecipientを全件列挙し、未達/未観測は0件でなければsuccessにしない。時間上限は固定しない。 | `HELIXSECURITY-L2-009`のowner別propagation/receipt義務、latency値なし。 | OS/Worker/CONNECT/credential/artifact accessの該当ownerごとに受領・適用・未達を記録。無関係操作の停止を0に保つ。 |
| `SEC-NFR-006` / `SECURITY-AC-007-01` | execution control coverage | 適用可能な制約ごとのrequest→実行環境の受渡し/適用証拠の欠落0。timeout/resourceの値自体はassignment/runtime ownerの宣言値を候補入力にする。 | `HELIXSECURITY-L2-007`とread-only変更なし/rollback条件。 | 既存scope内の各制約とowner宣言値を照合。未宣言値を仮定せず、unsupported/unknownで起動しない。 |
| `SEC-NFR-007` / `SECURITY-AC-005-01`, `SECURITY-AC-008-01`, `SECURITY-AC-009-01`, `SECURITY-AC-033-01` | revoke/credential re-check point | dispatch開始時および既存operationのresume/retry時にcurrent authority・expiry・bindingを再照合する案を候補とし、初回だけ照合する案と比較する。expiry境界の比較候補はA=`now < expires_at`のみ有効（`now >= expires_at`でdeny）、B=`now <= expires_at`も有効（`now > expires_at`でdeny）とし、保守候補Aを推奨する。これはPO承認値ではなく、expiryを越える利用を許さない候補解釈である。 | L2-008 tuple/expiry、L2-009 revoke、L2-033のdrift後に以前のbindingを流用しない条件。 | expiry直前/境界/経過後、revoked後resume、HEAD/assignment変更をfixtureし、stale/expired operationのsuccess化を0件とする。durationの値は作らない。 |
| `SEC-NFR-008` / `SECURITY-AC-009-01`, `SECURITY-AC-010-01`, `SECURITY-AC-013-01` | evidence retention | 保存期間は固定候補値なし。minimum evidenceはsource identity/revision、decision reason、recipient/owner stateで、raw secret値は常に0件。 | `HELIXSECURITY-L2-005/009/010/013/033`。sourceにretention期間なし。 | 必要なdecision traceが定めたverification windowで参照できるか測定し、window自体はownerが宣言したときだけ適用する。 |
| `SEC-NFR-014-01` / `SECURITY-AC-014-01` | target別decision trace | memory、training dataset、BRAIN knowledgeの各target classについて、source/provenance/classification、allow/deny/hold、理由の対応欠落0件を候補とする。 | L2-014の3 target classと理由付き判定を、分類結果だけ数える案と比較する。分類のみでは誤ったtargetや理由欠落を隠すため、target別のdecision trace候補を選ぶ。 | 合成入力で3 classと欠落/unknown/wrong-targetを比較し、CASE-NFR-SECURITY-014-01でfield対応を計測する。handoff、LABO評価、保存、BRAIN登録の成立は測定対象にしない。 |

候補境界は測定可能だが、未指定の性能値を普遍閾値にしない。1.x/Web sink保護を1.0へ前倒しせず、scanner/registry/providerや必須Botを追加しない。

## Stage 2c — HELIXSECURITY-L2-031の技術候補

| 候補ID | 候補値・条件 | 根拠と比較案 | L10測定／限界 |
|---|---|---|---|
| `SEC-NFR-031-01` | 追加runtimeによるcanonical repository/stateの直接read/write、proposal由来のauthority/acceptance/merge/promote生成は **0件**。 | L2-031のisolated copy・proposal-only境界を件数化する。copy内の提案を一律拒否する比較案は許可されたproposal作成まで狭めるため不採用。 | CASE-NFR-SECURITY-031-01でallowed-copy operationとdirect canonical attemptを対照し、許可範囲のproposal可・canonical effect 0を観測。主Workerは母集団へ含めない。 |
| `SEC-NFR-031-02` | raw credential/secret markerのruntime context/env/payload/artifact/receipt露出 **0件**。既存authority下のcredential-use capabilityに対する「credential利用だけ」を理由とした追加deny **0件**。 | L2-005/029/031と採択L11から、raw value非到達と有効な既存capabilityの範囲内利用を同時に観測する候補。全credential-use denyはP0採択意味に反し、無条件allowは既存scope条件を落とすため不採用。 | 合成markerを非出力のmatcherで走査し、値をログしない。existing authority/scope positiveと各条件drift negativeを比較。新規permissionを作らず、秘密/機密task classは既存L2-029で遮断。 |
| `SEC-NFR-031-03` | 実行前にresult/diff/完了receiptを要求する件数 **0**、別assignment/runtime/config/target/scopeのreceipt流用 **0**。 | L2/L11はresult receiptを実行後の観測・OS記録として置き、事前条件としない。 | CASE-NFR-SECURITY-031-03でreceiptなしのproposal開始、Worker/INFRASTRUCTUREの適用観測と同一tupleのpost-run receiptを照合。観測欠落・false・driftを未完へ返す。数量閾値・retention・quota制限はこの親から導かない。 |

これらはL3候補であり、実測値・承認値・実装方式を指定しない。既存policy/assignment条件、対象範囲、owner、version_targetを変えない。

## Stage 3 — 技術候補と比較・測定

| 候補ID／親AC | 候補値 | 根拠・比較案 | L10測定／未評価境界 |
|---|---|---|---|
| `SEC-NFR-029-01` / `SECURITY-AC-029-01..03` | 適用証拠の欠落を他型で相殺する件数0、別tupleの証拠流用0、未完opt-outからの採用生成0。 | 固定029と二part L11から直接観測。A=全操作へ四型必須、B=適用条件別照合。非該当を追加停止にしないBを候補とする。 | 適用性・根拠・出所を型別に計数しread-only/非networkを対照にする。適用性unknownを非該当と数えない。訓練停止の実保証値はローカル観測から測れない。 |
| `SEC-NFR-030-01` / `SECURITY-AC-030-01..03` | 独立条件不足の昇格許容0、正常同一条件反復への新規都度approve要求0。 | 固定030の独立条件を個別照合するBを、監査ログなど総合点で相殺するAと比較しBを候補とする。 | 各条件欠落と範囲変更、十分な未見正常入力を対比する。owner責務や監視を未観測なら未評価。平均risk score・頻度閾値を作らない。 |
| `SEC-NFR-032-01` / `SECURITY-AC-032-01..02` | 有効permanent denyの下位機構上書き0、確認済み非適用への新規allow/deny生成0。 | 032の対象scopeと優先順位。主/追加双方を照合するBを追加runtimeだけのAと比較し、固定親どおりBを候補とする。 | 同一対象のmarker/flag各変異とpolicy状態を測る。switch設定能力は035で別観測し032成功で補わない。 |
| `SEC-NFR-034-01` / `SECURITY-AC-034-01..03` | profile/revision間の条件流用0、write-capable probeをread-onlyとする件数0、正常scoped credential-useへの追加一律deny0。 | profile束縛Bを全接続一括判定Aと比較し、固定034どおりBを候補とする。 | capability・authority・egress各変異と未見正常profileを比較する。catalog/typed供給の未完はそのまま保持し全source closureを数えない。 |
| `SEC-NFR-035-01` / `SECURITY-AC-035-01..03` | run設定残置/次run継承0、allowlist対応時のYOLO代替0、deny能力未観測の成功claim0、常時policy/deny照合の欠落0、別repository/runtime判定の流用0。 | 固定L2-035の常時・選択操作時・選択runtime入力時・参照資料のみの4区分と、PO scope A/配置A、旧NFR38四条件を照合する。successだけcleanupするAと全終端照合Bを比較しBを候補とする。 | CASE-035-01..04を使いsuccess/failure/cancel各終端、常時の既存authority/repository policy/deny状態、対応/非対応/unknown能力、deny前後を独立計測する。常時policy/deny stateを入力から欠落させる変異を与え、常時照合欠落0を測る。CASE-035-03の同一repository/runtime/revision根拠と、別repository/runtimeの過去判定だけを与える変異を比較する。CASE-035-04の通常operationでallowlist能力unknownかつ既存authority/policyが有効な入力は、本候補だけの一律停止を作らず、bypass/YOLO許可根拠にもせず、policy適用unknownなら該当operationのみ未完にする。timeoutや経過期限・runtime一覧は未規定であり数値を追加しない。 |


## Stage 4 — 接続の候補値と測定

| 候補／測定case | 親AC | 候補・比較・根拠 | 測定／未評価 |
|---|---|---|---|
| `SEC-NFR-021-01` / `CASE-NFR-SECURITY-021-01` | `SECURITY-AC-021-01..03` | source/revision誤結合、deny/unknownのallow化、受領から信頼・保存生成を各0件。A=伝送成功のみ、B=分類と受領traceを独立照合。固定021のowner分離を測れるBを候補とする。 | 二source交換、deny/unknown、外部自称許可、未見正常sourceを対照に各違反を別計数。保存014/027の未実施を受領失敗にしない。 必要観測なしは未評価、意味上の違反候補0件。 |
| `SEC-NFR-022-01` / `CASE-NFR-SECURITY-022-01` | `SECURITY-AC-022-01..03` | 七要素tuple不一致の割当・実行許可、判断成功による適用欠落相殺を各0件。A=初回判定だけ、B=判断・割当・適用の各対象を再照合。固定022と008/009の条件を保つBを候補とする。 | 七要素を個別変更し期限切れ/revokeと実適用欠落を別計数。異tuple実行と未観測成功claimを測り、latency上限は未指定とする。 必要観測なしは未評価、意味上の違反候補0件。 |
| `SEC-NFR-023-01` / `CASE-NFR-SECURITY-023-01` | `SECURITY-AC-023-01..04` | 不足・失敗・別revisionの昇格と将来receiptの実行前要求を各0件。A=最終greenだけ、B=候補/admission/実行/検証/昇格の段階別記録。固定023の失敗ownerを保存するBを候補とする。 | 一段階ずつ失敗・欠落・revision変更し、未見正常候補と比較。段階別未完率・誤昇格・将来receipt要求を独立計数し、固定timeoutを作らない。 必要観測なしは未評価、意味上の違反候補0件。 |
| `SEC-NFR-024-01` / `CASE-NFR-SECURITY-024-01` | `SECURITY-AC-024-01..03` | policy宣言・資源状態・実強制の欠落相殺、raw値の無条件保存・露出を各0件。A=資源readyだけ、B=三ownerの適用条件と観測を独立照合。固定024と005/007の責務を保つBを候補とする。 | 三者各一観測欠落、環境変更、合成marker混入、有効scoped利用を比較。marker値を記録せず漏えい件数と誤deny件数を別計数。 必要観測なしは未評価、意味上の違反候補0件。 |
| `SEC-NFR-026-01` / `CASE-NFR-SECURITY-026-01` | `SECURITY-AC-026-01..03` | 決定GuardのBot委譲、自称回答による許可化、後続Bot能力の1.0合格条件化を各0件。A=Bot成功を総合判定、B=Guardと必要時の意味判断材料を別照合。固定020/026の版境界を保つBを候補とする。 | Botなし/補助あり/unknown、scope拡張と自称回答、未見正常eventを比較し各誤判定を別計数。後続意味検出のprecision/recallを1.0達成率へ含めない。 必要観測なしは未評価、意味上の違反候補0件。 |

## Stage 5 — 027構成体の技術候補

| 候補／L10測定case | 親AC | 候補・比較・根拠 | 測定／未評価 |
|---|---|---|---|
| `SEC-NFR-027-01` / `CASE-NFR-SECURITY-027-01` | `SECURITY-AC-027-01..04` | 経路間証拠流用、deny/holdの成功保存化、単体/一経路からの構成体成立を各0件。A=単体014または最終aggregateのみ、B=三経路ごとの判断とsink結果を照合。固定027が各経路の独立追跡を要求するためBを候補とする。時間・retention・quota値は未指定のままとする。 | 同番号functional caseで三経路正常、各field個別変異、未見正常、一経路unknownを比較。違反件数と経路別未評価を別計数し、候補0件。必要観測なしは未評価であり構成体合格を主張しない。 |

## 31親のNFR適用分類

独立した性能・保持期間・頻度値を導かない親も、機能ACの境界違反と観測不足を測定する。機能条件の件数化は新しいpermissionや業務閾値を追加せず、共通候補は明記した適用範囲だけへ参照する。未指定値を全親共通の閾値にしない。

| 採択親 | 測る境界 | 独立候補／共通候補の適用 | paired L10 |
|---|---|---|---|
| `HELIXSECURITY-L2-001` | 信頼・authority昇格の誤判定 | 独立性能・保持期間候補なし | `SECURITY-CASE-001-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-002` | 命令様dataからの操作発行 | 独立性能・期間候補なし | `SECURITY-CASE-002-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-003` | 対象project/tenant/environment/assignment間の状態混入 | 独立性能・期間候補なし | `SECURITY-CASE-003-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-004` | integrity不明・drift後の継続許可 | 独立性能・期間候補なし | `SECURITY-CASE-004-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-005` | raw secret露出・有効scoped利用の誤deny | SEC-NFR-001/007 | `SECURITY-CASE-005-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-006` | network/egress条件不一致の利用 | 独立latency/quota候補なし | `SECURITY-CASE-006-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-007` | 制約適用証拠の欠落・宣言だけの完了 | SEC-NFR-006 | `SECURITY-CASE-007-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-008` | operation authority tuple不一致の許可 | SEC-NFR-002/007 | `SECURITY-CASE-008-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-009` | 該当recipient未達の完了・対象外包括停止 | SEC-NFR-005/007/008 | `SECURITY-CASE-009-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-010` | 更新条件不足の受入 | SEC-NFR-008（traceのみ） | `SECURITY-CASE-010-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-011` | capability driftの旧条件継続 | 独立性能・期間候補なし | `SECURITY-CASE-011-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-012` | provenance不明の受入 | 独立性能・期間候補なし | `SECURITY-CASE-012-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-013` | artifact identity chain不一致の受入 | SEC-NFR-008（traceのみ） | `SECURITY-CASE-013-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-014` | 分類・判断不足のpromotion許可 | SEC-NFR-014-01（target別decision traceのみ） | `SECURITY-CASE-014-01` と `CASE-NFR-SECURITY-014-01` を照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-015` | asset identity分類基盤の誤対応 | SEC-NFR-003（適用する基盤分類のみ） | `SECURITY-CASE-015-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-016` | 分類不明のpublic/allow化 | SEC-NFR-003 | `SECURITY-CASE-016-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-020` | 決定Guardの委譲・条件抜け | SEC-NFR-004 | `SECURITY-CASE-020-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-021` | 当該親の接続・独立条件・誤昇格境界 | SEC-NFR-021-01 | `SECURITY-CASE-021-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-022` | 当該親の接続・独立条件・誤昇格境界 | SEC-NFR-022-01 | `SECURITY-CASE-022-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-023` | 当該親の接続・独立条件・誤昇格境界 | SEC-NFR-023-01 | `SECURITY-CASE-023-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-024` | 当該親の接続・独立条件・誤昇格境界 | SEC-NFR-024-01 | `SECURITY-CASE-024-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-026` | 当該親の接続・独立条件・誤昇格境界 | SEC-NFR-026-01 | `SECURITY-CASE-026-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-027` | 当該親の接続・独立条件・誤昇格境界 | SEC-NFR-027-01 | `SECURITY-CASE-027-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-028` | pack identity/version/digest/compatibility不一致受入 | 独立timeout・更新頻度候補なし | `SECURITY-CASE-028-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-029` | 当該親の接続・独立条件・誤昇格境界 | SEC-NFR-029-01 | `SECURITY-CASE-029-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-030` | 当該親の接続・独立条件・誤昇格境界 | SEC-NFR-030-01 | `SECURITY-CASE-030-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-031` | 当該親の接続・独立条件・誤昇格境界 | SEC-NFR-031-01/02/03 | `SECURITY-CASE-031-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-032` | 当該親の接続・独立条件・誤昇格境界 | SEC-NFR-032-01 | `SECURITY-CASE-032-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-033` | context binding不一致・raw値到達・旧binding再利用 | SEC-NFR-001/007 | `SECURITY-CASE-033-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-034` | 当該親の接続・独立条件・誤昇格境界 | SEC-NFR-034-01 | `SECURITY-CASE-034-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
| `HELIXSECURITY-L2-035` | 当該親の接続・独立条件・誤昇格境界 | SEC-NFR-035-01 | `SECURITY-CASE-035-01` と同番号の全機能caseを照合。該当NFR caseは各候補節を参照。 |
