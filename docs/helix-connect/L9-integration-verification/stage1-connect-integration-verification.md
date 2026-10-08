---
title: "HELIX-CONNECT Stage 1 L9 結合検証設計"
layer: L9
status: design_pair_defined
owner: HELIX-CONNECT
paired_l4: ../L4-basic-design/stage1-connect.md
paired_l4_sha256: 10711d9c3897f7351f6d8cc0535264d4b68f642a08177cf8373f030356741002
base: main `7d48e458fcff7e03df18abc4f768981410685cf7`
---

# HELIX-CONNECT Stage 1 L9 結合検証設計

`design_pair_defined`は契約とoracleの設計定義状態であり、review/承認/実行/合格を表さない。本書は[HELIX-CONNECT Stage 1 L4](../L4-basic-design/stage1-connect.md)の一方向固定参照であり、L4はL9のSHAをpinしない。L4のraw bytes SHA-256は`10711d9c3897f7351f6d8cc0535264d4b68f642a08177cf8373f030356741002`。L4側に列挙した6文書pinが固定sourceの正本である。本書内のL10 `CONNECT-CASE-*` はsource ID、本書で定義する`IV-CONNECT-*`はL9 verifier IDであり、相互に置換しない。

## 1. 検証境界と共通oracle

対象は固定L2 `HELIXCONNECT-L2-001`〜`005`、Stage 1、`version_target: 1.0`だけである。CONNECT-001はrevision `617801a9e66fe6ff30bfddc8c1e72a3c43c2a722`、CONNECT-002〜005はrevision `53fc2a1441b890b5bcd904e6d9805453c8c833d1`に固定したL3/L10 6文書を使う。対象scope、親別のL3 AC/L10 caseおよびNFR候補をL4 §1/§6/§7から変えない。

fixtureは合成したdescriptor、receipt、revision、event、authority識別子とする。実ネットワーク/外部API/credential/provider、旧runtime/test/CIを起動しない。送信操作のoracleはattempt/resultをfixture上で検査し、実送信を要求しない。結果は現行共通カーネルのK1結果型、K2鍵、K3既存authority、K4義務、K5証拠、K6 receipt、K7 revision/fencing、K8 label、K9 review、K10 dependency契約を用い、CONNECT固有の状態語へ縮約しない。L4 §5記載の共通カーネル固定SHAを参照する。

一つのverifier行は対応する一つのL10 source caseまたは一つのNFR候補を主対象として、fixtureと期待oracleを固定する。個別mutationを与える箇所は、他入力を正常に保った独立fixtureとして扱い、別結果・別ownerを一つに混ぜない。これらのoracleは設計候補であり、実行済みの結果ではない。

## 2. 機能case trace

以下12行は、5 ACに対する固定L10 functional source case 12件を全て一度ずつ対応させる。verifier IDはこのL9内で一意である。001-03〜08は適用識別子のmissing/unknownを一つずつ変える固定L10 caseなので、6行に分離している。

| L9 verifier ID | 固定親 / L3 AC | L10 source case | fixture / 一つの期待oracle | 主owner / failure返却先 |
|---|---|---|---|---|
| `IV-CONNECT-S1-001-01` | `HELIXCONNECT-L2-001` / `CONNECT-AC-001-01` | `CONNECT-CASE-001-01` | 正常descriptorを入力し、能力名、endpoint/owner/direction/scope、契約/成果物/依存revision、correlation/idempotency/expiry/result stateを含む両端宣言と適用識別子を一意な登録receiptへ束縛する。不足/unknown、同一identityの異宣言・衝突、未登録revisionの各fixtureはusableにせず、別identityによるendpoint共有は許容し、別identity/既定値fallbackや業務承認・SECURITY許可生成をしない。 | CONNECT。矛盾/不足宣言は当該sourceまたはconsumer endpoint owner。 |
| `IV-CONNECT-S1-001-02` | `HELIXCONNECT-L2-001` / `CONNECT-AC-001-01` | `CONNECT-CASE-001-02` | source/consumerが識別子を適用しないregistration-only scopeを明示した正常fixtureで、登録可能かつsend attempt 0を返す。 | CONNECT。適用性の決定はsource/consumer ownerに留める。 |
| `IV-CONNECT-S1-001-03` | `HELIXCONNECT-L2-001` / `CONNECT-AC-001-01` | `CONNECT-CASE-001-03` | 他入力を保持し、適用SECURITY許可識別子だけをmissingにすると登録をusableにしない。 | CONNECTから宣言元source/consumer ownerへ返す。 |
| `IV-CONNECT-S1-001-04` | `HELIXCONNECT-L2-001` / `CONNECT-AC-001-01` | `CONNECT-CASE-001-04` | 他入力を保持し、適用SECURITY許可識別子だけをunknownにすると登録をusableにしない。 | CONNECTから宣言元source/consumer ownerへ返す。許可有効性は判定しない。 |
| `IV-CONNECT-S1-001-05` | `HELIXCONNECT-L2-001` / `CONNECT-AC-001-01` | `CONNECT-CASE-001-05` | 他入力を保持し、適用data-use識別子だけをmissingにすると登録をusableにしない。 | CONNECTから宣言元source/consumer ownerへ返す。 |
| `IV-CONNECT-S1-001-06` | `HELIXCONNECT-L2-001` / `CONNECT-AC-001-01` | `CONNECT-CASE-001-06` | 他入力を保持し、適用data-use識別子だけをunknownにすると登録をusableにしない。 | CONNECTから宣言元source/consumer ownerへ返す。 |
| `IV-CONNECT-S1-001-07` | `HELIXCONNECT-L2-001` / `CONNECT-AC-001-01` | `CONNECT-CASE-001-07` | 他入力を保持し、適用classification識別子だけをmissingにすると登録をusableにしない。 | CONNECTから宣言元source/consumer ownerへ返す。 |
| `IV-CONNECT-S1-001-08` | `HELIXCONNECT-L2-001` / `CONNECT-AC-001-01` | `CONNECT-CASE-001-08` | 他入力を保持し、適用classification識別子だけをunknownにすると登録をusableにしない。 | CONNECTから宣言元source/consumer ownerへ返す。 |
| `IV-CONNECT-S1-002-01` | `HELIXCONNECT-L2-002` / `CONNECT-AC-002-01` | `CONNECT-CASE-002-01` | 登録時と使用時revisionを区別し、端点/意味契約/adapter・transport/互換範囲を個別に変えたfixtureを照合する。新しい互換receiptまでsend attempt 0、不一致/unknownはcompatibleへ昇格しない。read-only照合は`not_evaluated`、送信時の不成立authorityもattempt 0。未見の宣言範囲内revision組は照合でき、宣言外/未登録revisionはunknown。 | 契約owner、read-scope owner、送信authorityはSECURITYへ個別返却。比較不能はunknown/staleのまま保持。 |
| `IV-CONNECT-S1-003-01` | `HELIXCONNECT-L2-003` / `CONNECT-AC-003-01` | `CONNECT-CASE-003-01` | 正常fixtureでは両端で同一connection/operation/contract revisionに束縛した技術receiptを対応させる。能力/contract・artifact・dependency版/scope/correlation/expiry/idempotency/result fieldやoperation identityの欠落・不一致、異接続混載、片端receiptまたは必要handoffの欠落を各々独立に与え、受信successにせず理由・観測地点・ownerを返す。両端契約がschema identity/revisionを宣言するときはその契約入力へ束縛し、片側欠落または不一致を他入力正常の独立fixtureで照合する（schema/wire format自体は定義しない）。未完義務があるときは既存handoffを保持し、適用authority/data-use不成立ならsend attempt 0。 | 契約差は両端owner、authorityはSECURITY、業務結果はreceiver business owner。 |
| `IV-CONNECT-S1-004-01` | `HELIXCONNECT-L2-004` / `CONNECT-AC-004-01` | `CONNECT-CASE-004-01` | 応答欠落と、接続契約がretryableと定めた別の技術失敗を別fixtureとし、同一operation identity・content digest・単一contract revisionの範囲で契約上限内のみretryし受信効果を一回に保つ。異digest/上限超過/retry不能business result・failure/expiry・authority不成立は追加attempt 0。missing/unknown分類をretry可能と推測せず、未完義務・試行数はconnection operation owner、business resultは元ownerへ分けて返す。 | connection operation ownerへ試行数と未完義務、business resultは元owner、authority/expiryはSECURITYへ返す。 |
| `IV-CONNECT-S1-005-01` | `HELIXCONNECT-L2-005` / `CONNECT-AC-005-01` | `CONNECT-CASE-005-01` | registration/check/send/receive/attempt/retry/stale/exchange/rollback/deny/terminalをconnection/operation/revision/attempt順序へ対応させ、記録済みeventは不変・訂正は追記、source ownerのdata-use識別子を保つ。event/証拠field欠落、順序逆転、terminal/片端観測欠落はunknown/unfinishedで業務completeへ丸めない。raw業務payload/secret/credentialは通常trace/receiptへ保存・複製されない。 | trace欠落はoperation owner、data-use/authorityはsource/SECURITY ownerへ返す。 |

別接続からのfallback、許可・data-use・classification identifierからのpolicy推測、技術receiptからの業務完了・承認生成はいずれの正常oracleでも認めない。各行の入力束縛、L11 oracle、failure detailは固定L10 source caseへ戻って確認する。

## 3. NFR候補trace

次の5 verifierはL3/L10に存在するNFR候補を個別に測定する。001には名前付きNFR割当がなく、ここでも帰属させない。宣言値のない候補は合格境界に変えず、測定候補として証拠へ根拠・条件・未評価を残す。

| L9 verifier ID | L3候補 / AC | L10 source | 測定fixtureと期待oracle | 戻し先 |
|---|---|---|---|---|
| `IV-CONNECT-S1-NFR-001` | `CON-NFR-001` / `CONNECT-AC-004-01` | L10 NFR `CON-NFR-001` | 接続contractに宣言されたNについて、初回attemptと追加retryを分け、N−1/N/N+1の境界をfixtureで照合する。failure classification missing/unknownは追加retry 0・unknownのまま。N未宣言なら値を補わず未評価とする。 | 上限/分類不足はconnection contract ownerへ返す。 |
| `IV-CONNECT-S1-NFR-002` | `CON-NFR-002` / `CONNECT-AC-004-01` | L10 NFR `CON-NFR-002` | 同じoperation ID+digestの再到着で受信効果が1回を越えず、同ID+異digestは衝突し効果増分0。 | connection operation ownerへ返す。 |
| `IV-CONNECT-S1-NFR-003` | `CON-NFR-003` / `CONNECT-AC-002-01` | L10 NFR `CON-NFR-003` | endpoint/意味契約/adapter・transport/互換範囲のいずれか一つのrevision変更でstaleとなり、current compatible再照合までsend attempt 0。read-only照合はeligibility `not_evaluated`。 | 契約差は接続owner、send authority差はSECURITYへ返す。 |
| `IV-CONNECT-S1-NFR-004` | `CON-NFR-004` / `CONNECT-AC-005-01` | L10 NFR `CON-NFR-004` | 観測event/証拠fieldを照合し、欠落/順序不明はunknownで保持する。raw payload/secret/credentialの合成marker保存・複製件数は各0を期待する。証拠に値そのものを出さない。 | trace producer/operation owner、data-use/authorityはsource/SECURITY ownerへ返す。 |
| `IV-CONNECT-S1-NFR-005` | `CON-NFR-005` / `CONNECT-AC-005-01` | L10 NFR `CON-NFR-005` | 接続contract宣言値または根拠・比較・測定方法・判定境界を伴う技術候補について、計測値と条件のprovenanceを記録する。未宣言・根拠不足を達成扱いせず、共通latency/retention SLAを設定しない。 | 候補・宣言値不足は接続contract ownerへ返す。 |

## 4. 業務共有境界

固定L3業務/L10業務文書は対象001〜005に独立business ACを置かない。以下は一つの共有境界oracleであり、business ACや別の要求ではない。

| L9 verifier ID | source / scope | negative oracle | owner |
|---|---|---|---|
| `IV-CONNECT-S1-BIZ-001` | 固定L3 business `001〜005`、固定L10 business文書、および§2の12 source cases | 各source caseの技術receipt/statusだけからbusiness success、approval、SECURITY許可、保存完了が生成されたfixtureは不合格。両端business resultは既存ownerへ引き渡し、CONNECTが代行しない。 | 両端business owner。authorityはSECURITY。 |

## 5. 共通カーネル・責務結合

共通カーネルL4/L9の固定参照は対のL4 §5にある。ここではCONNECTの結合点のみ記す。

| 契約領域 | 使用する共通カーネル | 境界 oracle |
|---|---|---|
| source/consumer/connection/operation identity、contract/dependency revision、digest | K2、K7 | fixture結果が固定対象・使用時revisionと一致し、別revisionのresult流用をstaleにする。 |
| compatible/incompatible/unknown/stale、未観測と未完義務 | K1、K4 | unknown/stale/unobservedをpositive/compatible/business successへ変換しない。 |
| 既存send/retry authority | K3 | operationに既に適用される許可のみ照合し、missing/unknown/expired/scope差でsend/retry 0。 |
| receipt/evidence/trace | K5、K6、K8 | source eventと状態をつなぎ、観測欠落・順序不明をunknownに保ち、labelから操作結果を推測しない。 |
| 呼出し側と依存sourceの閉包 | K10 | 固定親の明示入力だけを用い、未選択・参照のみのsourceを必須・存在/不存在へ読み替えない。 |
| 独立review | K9 | 設計review状態をCONNECT通信結果、要求承認、実行合格へ流用しない。 |

INFRASTRUCTUREはphysical path/resource identityと観測、SECURITYはauthority/policy、OSはassignmentおよび運転・実行state、CONNECTはlogical identity/契約/通信結果を所有する。ひとつのownerのmissing/unknownを他ownerが推測補完しない。HARNESSのtest/evidence契約は実際のfixture実行証拠があるまで未実行のまま。

## 6. 判定状態と範囲外

本書のfixture、数、期待oracleはL10 designの記述であり、未実行である。12個のfunctional source case、5個のNFR candidate、1個のbusiness boundary verifierを定義した。これらは検証器IDの範囲であって、システム全体のcase数・全件coverage宣言ではない。

新protocol/wire/schema、adapter/transport、共通retry値・backoff/timeout/上限、latency/retention SLA、送信許可、authority policy、実外部通信、CI、implementation、deployment/release、追加parent/gateをこの文書から設けない。技術candidateの起草は許すが、要求の意味・範囲・owner・版を変える必要があればL2へ戻す。合否・review結果・PO判断は別の対象revision証拠による。
