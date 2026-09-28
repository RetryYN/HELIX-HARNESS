# P1 MCP profile供給条件の機能単位処置案

基準main: `c77ada94cdd79d7f07b75c4fd1f5515a5b7528b2`。本記録は旧v1.3 `HR-FR-HYB-002`のMCP profile機能を、archiveとbaselineの別revisionを保って機能単位で照合した候補監査である。要求採択、旧source holdingの解除、profile registry/schema/providerの選定、実装・実行受入を生成しない。旧runtime、adapter、CLI、test、CIは実行していない。

## 範囲と数え方

旧要求は `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:286`（asset `LEGACY-ASSET-02319C2481B9E01698D5`、file SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、line SHA-256 `ea40461f32edf4af5c4635f9fb7b4bb108401b3b34347dc85492044175a3884c`、source item `REQSRC-SUP-00213`）と、6fabd125 baseline `docs/governance/requirements-source/helix-requirements-v1.3-baseline-6fabd125.txt:271`（同じasset、file SHA-256 `1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1`、同じline SHA）である。二つのrevisionを統合せず、それぞれ6 span、合計12 lineage atomとして扱う。

| 指標 | 数 | 意味 |
|---|---:|---|
| source revision | 2 | archive line 286、6fabd125 baseline line 271 |
| unique clause | 6 | 各source rowから切り出した条件種別 |
| lineage atom | 12 | 6 clauses × 2 source revisions |
| SECURITY-L2/L11-034へ候補入力として配付済み | 6/12 | profile単位のfail-close、secret拒否、write可能probe拒否。未採択 |
| source holdingでpreserved pending | 6/12 | profile列挙/設定、typed safety/probe供給、未登録profile拒否 |
| 採択済み契約で条件全体が充足 | 0/12 | 現行条項との部分関係は充足に数えない |
| 意味closure | 0/12 | 034への候補配付やreceiptのno-lossはclosureではない |

lineage atomのID、source span SHA、source item、holding registration、candidate input関係は[機械可読crosswalk](mcp-profile-functional-unit-crosswalk-2026-09-29.json)に記録した。既存の[source-lines](../requirement-registration/security-v13-hyb-002-profile-source-lines-2026-09-28.jsonl)と[coverage receipt](../requirement-registration/security-v13-hyb-002-profile-coverage-receipt-2026-09-28.json)は変更していない。既存receiptのno-lossは034へ選定した6 atomに限り、二つの旧source row全体のclosureはpartialのままである。

## 機能単位の処置

| 条件 | lineage atoms | 現行の関係と境界 | 処置状況 |
|---|---|---|---|
| profileの列挙・identity・typed configuration | archive S01、baseline S01 | CONNECT L2-001/002は接続identity、端点・契約・adapter/transport revision、互換・staleを扱う。SECURITY L2-004は構成identity/revision/digestのintegrityを扱う。MCP profile集合、列挙、typed configurationとの意味等価は確認できない。 | `preserved_pending`。採択済み充足ではない。候補ownerの選択が必要。 |
| typed safety / read-only probe供給 | archive S02、baseline S02 | SECURITY L2-018は1.xの観測機能で、read-only probeの供給・型契約と同一視できない。SECURITY-L2/L11-034は選択済みprofile identity/revisionに束縛したprobe指定とwrite-capability拒否を扱うが、供給契約を明示的に対象外としている。 | `preserved_pending`。probe descriptorの提供・版契約と安全分類のownerが未確定。 |
| profile単位credential/egress/tool-capability fail-close | archive S03、baseline S03 | SECURITY L2-005/006/007/008は一般のcredential、egress、Worker制約、operation authorityを持つが、profile単位の結合を明示しない。034候補はこのprofile/revision/tool/op結合を限定的に導出する。 | `existing_candidate_unadopted`。034へ候補入力として配付済み、条件closureは未達。 |
| 未登録profile拒否 | archive S04、baseline S04 | SECURITY L2-004のunknown configuration拒否とは部分関係があるが、MCP登録集合とprofile identityのownerを確定しない。CONNECT L2-001の接続登録もprofile catalogの列挙集合と等価ではない。 | `preserved_pending`。catalogの登録境界・unknown扱いを候補で定義する必要がある。 |
| secret要求拒否 | archive S05、baseline S05 | SECURITY L2-005のraw-secret boundaryを選択profile/taskへ適用する局所oracleとして034に配付済み。新しいcredential policyは作らない。 | `existing_candidate_unadopted`。既存SECURITY policyのprofile別適用を候補化、未採択。 |
| read-only probeへのwrite可能tool割当て拒否 | archive S06、baseline S06 | SECURITY-L2/L11-034はread-only指定とprofile revision/tool capabilityの不一致を拒否するoracleを持つ。probe供給/型契約は別条件として保留する。 | `existing_candidate_unadopted`。拒否oracleのみ候補化、未採択。 |

全6 unique clauseに対応する処置状態はクロスウォークへ記録済みだが、処置を要求成立と数えない。採択済み充足0、候補入力6、保留6、意味closure 0の分母・分子はこの監査範囲で固定する。

## 既存候補とPO判断境界

`HELIXSECURITY-L2-034`と対のL11は既存の未採択候補である（[L2](../../../helix-security/L2-requirements/security-requirements.md#helixsecurity-l2-034)、[L11](../../../helix-security/L11-acceptance/security-acceptance.md#helixsecurity-l2-034)）。register `MPR-RC-HELIXSECURITY-L2-034-001`は`registered_proposal` / `authority_effect: none`で、PO判断packetはA＝現行034候補を採択、B＝保留、C＝対象revision・理由・影響を示して意味変更/retireを判断、推奨Aを記録している。これはPO判断を行ったことを意味しない。034の候補digest、receipt atom set digest、受入digest、register行を本記録では更新・置換しない。

候補化済み6 atomのA/B/C選択は既存packetに委ねる。残り6 pending atomの分類やowner選択は034候補の範囲外であり、本監査から登録集合、schema、provider、authority、MCP runtimeの採用を推定しない。旧source行は能力要求であり、具体的な旧実装方式を定義していない。そのため本source範囲からretireすべき旧方式は特定できず、条件意味のretireはPO選択肢としても追加しない。

## 保留条件の候補owner選択肢（未選択）

| 条件 | 選択肢A | 選択肢B | 変わる責務・影響 |
|---|---|---|---|
| 列挙、profile identity、typed configuration、未登録拒否 | **CONNECT主担当**としてMCP profile/descriptorの登録集合・列挙・revision付き構成を供給し、SECURITYは既存policyの適用結果を返す対候補を起こす。 | **SECURITY主担当**としてprofile catalog供給まで含めた対候補を起こす。ただしCONNECTの接続/adapter identityと二重所有にならない境界を明記する。 | Aは現行CONNECTの登録・契約・adapter identity境界を使うため、候補起草の推奨。Bは既存CONNECT/SECURITY境界の意味変更を含む可能性があるため、差分と根拠を示す別のPO選択肢。候補起草の推奨はowner採択ではない。 |
| typed safety/read-only probe供給と分類 | **分担**としてCONNECTがprofile revisionに結び付いたprobe descriptorと提供/列挙契約を持ち、SECURITYがread-only分類、credential/egress/capability policyを持つ対候補を起こす。 | **SECURITY主担当**としてprobeの安全意味・型・判定契約を持ち、CONNECTはprofile identityとtransport/adapter契約だけを受け渡す候補を起こす。 | Aは供給とpolicyを分けるため、候補起草の推奨。Bは意味・型・判定の責務をSECURITYへ集め、既存責務境界を変える可能性がある選択肢。いずれもprobe実装/provider選定を含めない。 |

両選択肢とも旧sourceが定めていない詳細の新規案を含む。Codex作成レーンはAを推奨案としてL2/L11対候補の起草を続ける。source-backed条件、現行採択契約との非同値、Bを選ぶ場合の責務境界変更を後続packetに示す。Aの推奨はowner採択や要求採択ではなく、採択判断はPOに残る。

## 検証境界

旧archive source、固定baseline、source-lines、034 L2/L11、register、packet、現行CONNECT/SECURITY条項を静的に照合した。source revision・line SHA・12 atom ID・6 unique clause・034への候補入力6件・保留6件が機械可読crosswalkと一致することを確認する。旧runtime、adapter、CLI、test、CIは実行せず、MCP profileの動作やprobe成功を主張しない。
