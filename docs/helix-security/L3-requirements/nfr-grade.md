# HELIX-SECURITY L3 NFR候補 — Stage 1（19親の候補）

> 状態：技術候補と測定設計。下記の数値・比較案は根拠付き候補で、実装値・PO承認値・実測結果ではない。parameterごとのPO確認は追加しない。要求の意味・scope・owner・versionを変える場合だけL2へ戻す。1.x/Web sinkや後続Stageは含めない。

## Stage 1の適用条件

| L2 parent | NFR candidate(s) applicable to this 19-parent slice |
|---|---|
| `HELIXSECURITY-L2-001` | — |
| `HELIXSECURITY-L2-002` | — |
| `HELIXSECURITY-L2-003` | — |
| `HELIXSECURITY-L2-004` | — |
| `HELIXSECURITY-L2-005` | SEC-NFR-001, SEC-NFR-007, SEC-NFR-008 |
| `HELIXSECURITY-L2-006` | — |
| `HELIXSECURITY-L2-007` | SEC-NFR-006 |
| `HELIXSECURITY-L2-008` | SEC-NFR-002, SEC-NFR-007 |
| `HELIXSECURITY-L2-009` | SEC-NFR-005, SEC-NFR-007, SEC-NFR-008 |
| `HELIXSECURITY-L2-010` | SEC-NFR-008 |
| `HELIXSECURITY-L2-011` | — |
| `HELIXSECURITY-L2-012` | — |
| `HELIXSECURITY-L2-013` | SEC-NFR-008 |
| `HELIXSECURITY-L2-014` | SEC-NFR-014-01 |
| `HELIXSECURITY-L2-015` | — |
| `HELIXSECURITY-L2-016` | SEC-NFR-003 |
| `HELIXSECURITY-L2-020` | SEC-NFR-004 |
| `HELIXSECURITY-L2-028` | — |
| `HELIXSECURITY-L2-033` | SEC-NFR-001, SEC-NFR-007, SEC-NFR-008 |

候補値は下表の根拠・測定条件に限って扱う。独立候補のない親へ未指定のlatency/retention/quota閾値を補わず、機能ACの判定を代替しない。共有候補の全意味は一行だけ定義し、親crosswalkは適用先を示す。

## Shared NFR candidates

| 候補ID / AC | 候補parameter | 候補値・比較 | 根拠 | L10で観測するもの |
|---|---|---|---|---|
| `SEC-NFR-001` / `SECURITY-AC-005-01`, `SECURITY-AC-033-01` | raw secret exposure | context/log/artifact/Tool result/Worker payloadへのraw secret値露出は0件。 | `HELIXSECURITY-L2-005`および採択済SECURITY-L2-033 P0訂正。 | 合成secret markerを全出力先とenvironmentを含むtask contextで走査し、0件。値そのものは証拠へ書かない。secret/機密task内容は033の別条件として測る。 |
| `SEC-NFR-002` / `SECURITY-AC-008-01` | operation authority tuple | actor/target/operation/revision/environment/scope/expiryの7要素すべて一致した場合のみ適用し、欠落・不一致の許可は0件。 | `HELIXSECURITY-L2-008`の7要素tuple。purposeはL2-006のegress入力であり、この候補へ含めない。 | 7要素を個別にdriftさせ、各negativeでallow 0件、exact tuple positiveで対象operationだけを許可する。 |
| `SEC-NFR-003` / `SECURITY-AC-016-01` | classification completeness | fixed L2の6分類を6/6識別し、unknownをpublic/allowにした件数0。 | `HELIXSECURITY-L2-016`とL11の1.0境界。 | 6分類を一つずつfixtureし、missing/unknownを分離。Web sink enforcement完了率を1.0に混入しない。 |
| `SEC-NFR-004` / `SECURITY-AC-020-01` | deterministic Guard coverage | L2-020列挙の8 Guard責務について、決定的ruleをBotへ委ねた件数0。必須Guard条件抜け0。 | `HELIXSECURITY-L2-020`の8名称とBot任意境界。後続1.x sink enforcementはこの1.0候補に含めない。 | Botなし/必要時のみの同一条件でGuard判断を比較し、rule未定義・適用不能・必要観測欠落は該当enforcement ownerへのunknown/holdとして数える。全例示Botの稼働は計測・合否対象としない。1.x sink enforcementを1.0 pass条件へ混入しない。 |
| `SEC-NFR-005` / `SECURITY-AC-009-01` | revoke recipient closure | 対象scopeに該当するrecipientを全件列挙し、未達/未観測は0件でなければsuccessにしない。時間上限は固定しない。 | `HELIXSECURITY-L2-009`のowner別propagation/receipt義務、latency値なし。 | OS/Worker/CONNECT/credential/artifact accessの該当ownerごとに受領・適用・未達を記録。無関係操作の停止を0に保つ。 |
| `SEC-NFR-006` / `SECURITY-AC-007-01` | execution control coverage | 適用可能な制約ごとのrequest→実行環境の受渡し/適用証拠の欠落0。timeout/resourceの値自体はSECURITY policy revisionの宣言値を候補入力にする。 | `HELIXSECURITY-L2-007`とread-only変更なし/rollback条件。 | 既存scope内の各制約とSECURITY policyの宣言値をWorker実行環境の適用観測と照合。未宣言値を仮定せず、unsupported/unknownで起動しない。 |
| `SEC-NFR-007` / `SECURITY-AC-005-01`, `SECURITY-AC-008-01`, `SECURITY-AC-009-01`, `SECURITY-AC-033-01` | revoke/credential re-check point | dispatch開始時および既存operationのresume/retry時にcurrent authority・expiry・bindingを再照合する案を候補とし、再照合点を追加した時の検出差を比較する。L2-033「以前のbindingを流用せず再照合」に反する「初回だけ照合」は候補に含めない。expiry境界の比較候補はA=`now < expires_at`のみ有効（`now >= expires_at`でdeny）、B=`now <= expires_at`も有効（`now > expires_at`でdeny）とし、保守候補Aを推奨する。これはPO承認値ではなく、expiryを越える利用を許さない候補解釈である。 | L2-008 tuple/expiry、L2-009 revoke、L2-033のdrift後に以前のbindingを流用しない条件。 | expiry直前/境界/経過後、revoked後resume、HEAD/assignment変更をfixtureし、stale/expired operationのsuccess化を0件とする。durationの値は作らない。 |
| `SEC-NFR-008` / `SECURITY-AC-009-01`, `SECURITY-AC-010-01`, `SECURITY-AC-013-01`, `SECURITY-AC-033-01` | evidence retention | 保存期間は固定候補値なし。minimum evidenceはsource identity/revision、decision reason、recipient/owner stateで、raw secret値は常に0件。 | `HELIXSECURITY-L2-005/009/010/013/033`。sourceにretention期間なし。 | 必要なdecision traceが定めたverification windowで参照できるか測定し、window自体はownerが宣言したときだけ適用する。 |
| `SEC-NFR-014-01` / `SECURITY-AC-014-01` | target別decision trace | memory、training dataset、BRAIN knowledgeの各target classについて、source/provenance/classification、allow/deny/hold、理由の対応欠落0件を候補とする。 | L2-014の3 target classと理由付き判定を、分類結果だけ数える案と比較する。分類のみでは誤ったtargetや理由欠落を隠すため、target別のdecision trace候補を選ぶ。 | 合成入力で3 classと欠落/unknown/wrong-targetを比較し、`SECURITY-CASE-014-01`の同一入力とfield対応を測定に使う。handoff、LABO評価、保存、BRAIN登録の成立は測定対象にしない。 |

候補は合成fixtureの設計であり、実secret、実runtime、実保存を使った測定は行わない。`SEC-NFR-007`のexpiry比較候補A/Bは未承認の候補解釈であり、PO承認済み閾値と扱わない。
