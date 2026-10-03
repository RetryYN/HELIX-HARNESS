# HELIX-SECURITY L3 NFR候補（Stage 1 草稿）

> 状態: 全体的なtimeout/latency/retention数値は固定されていない。以下はfixed L2/L11から直接導ける境界値と、比較・測定可能な技術候補であり、実装値やPO承認値ではない。parameterごとのPO判断は求めない。要求の意味・scope・owner・versionを変える場合だけL2/POへ戻す。

| 候補ID / AC | 候補parameter | 候補値・比較 | 根拠 | L10で観測するもの |
|---|---|---|---|---|
| `SEC-NFR-001` / `SECURITY-AC-005-01` | raw secret exposure | context/log/artifact/Tool result/Worker payloadへのraw secret値露出は0件。 | `HELIXSECURITY-L2-005`および採択済SECURITY-L2-033 P0訂正。 | 識別可能な合成secret markerを全出力先で検索し、0件であることを確認。値そのものは証拠へ書かない。 |
| `SEC-NFR-002` / `SECURITY-AC-008-01` | operation authority tuple | actor/target/operation/revision/environment/scope/expiryの7要素すべて一致した場合のみ適用。欠落・不一致の許可は0件。 | `HELIXSECURITY-L2-008`のtuple各項目。 | 7要素を個別にdriftさせ、各negativeでallow 0件、exact tuple positiveで対象operationだけを許可する。 |
| `SEC-NFR-003` / `SECURITY-AC-016-01` | classification completeness | fixed L2の6分類を6/6識別し、unknownをpublic/allowにした件数0。 | `HELIXSECURITY-L2-015/016`とL11の1.0境界。 | 6分類を一つずつfixtureし、missing/unknownを分離。Web sink enforcement完了率を1.0に混入しない。 |
| `SEC-NFR-004` / `SECURITY-AC-020-01` | deterministic Guard coverage | L2-020列挙の8 Guard責務について、決定的ruleをBotへ委ねた件数0。必須Guard条件抜け0。 | `HELIXSECURITY-L2-020`の8名称とBot任意境界。 | Botなし/必要時のみの条件でGuard判断を比較。全例示Botの稼働は計測・合否対象としない。 |
| `SEC-NFR-005` / `SECURITY-AC-009-01` | revoke recipient closure | 対象scopeに該当するrecipientを全件列挙し、未達/未観測は0件でなければsuccessにしない。時間上限は固定しない。 | `HELIXSECURITY-L2-009`のowner別propagation/receipt義務、latency値なし。 | OS/Worker/CONNECT/credential/artifact accessの該当ownerごとに受領・適用・未達を記録。無関係操作の停止を0に保つ。 |
| `SEC-NFR-006` / `SECURITY-AC-007-01` | execution control coverage | 適用可能な制約ごとのrequest→実行環境の受渡し/適用証拠の欠落0。timeout/resourceの値自体はassignment/runtime ownerの宣言値を候補入力にする。 | `HELIXSECURITY-L2-007`とread-only変更なし/rollback条件。 | 既存scope内の各制約とowner宣言値を照合。未宣言値を仮定せず、unsupported/unknownで起動しない。 |
| `SEC-NFR-007` / `SECURITY-AC-005-01`, `SECURITY-AC-008-01`, `SECURITY-AC-009-01`, `SECURITY-AC-033-01` | revoke/credential re-check point | dispatch開始時および既存operationのresume/retry時にcurrent authority・expiry・bindingを再照合する案を候補とし、初回だけ照合する案と比較する。expiry境界の比較候補はA=`now < expires_at`のみ有効（`now >= expires_at`でdeny）、B=`now <= expires_at`も有効（`now > expires_at`でdeny）とし、保守候補Aを推奨する。これはPO承認値ではなく、expiryを越える利用を許さない候補解釈である。 | L2-008 tuple/expiry、L2-009 revoke、L2-033のdrift後に以前のbindingを流用しない条件。 | expiry直前/境界/経過後、revoked後resume、HEAD/assignment変更をfixtureし、stale/expired operationのsuccess化を0件とする。durationの値は作らない。 |
| `SEC-NFR-008` / `SECURITY-AC-009-01`, `SECURITY-AC-010-01`, `SECURITY-AC-013-01` | evidence retention | 保存期間は固定候補値なし。minimum evidenceはsource identity/revision、decision reason、recipient/owner stateで、raw secret値は常に0件。 | `HELIXSECURITY-L2-005/009/010/013/033`。sourceにretention期間なし。 | 必要なdecision traceが定めたverification windowで参照できるか測定し、window自体はownerが宣言したときだけ適用する。 |

候補境界は測定可能だが、未指定の性能値を普遍閾値にしない。1.x/Web sink保護を1.0へ前倒しせず、scanner/registry/providerや必須Botを追加しない。
