---
title: "HELIX-CONNECT Stage 1 L4 基本設計"
layer: L4
status: design_pair_defined
owner: HELIX-CONNECT
parents:
  - HELIXCONNECT-L2-001
  - HELIXCONNECT-L2-002
  - HELIXCONNECT-L2-003
  - HELIXCONNECT-L2-004
  - HELIXCONNECT-L2-005
paired_l9: ../L9-integration-verification/stage1-connect-integration-verification.md
base: main `7d48e458fcff7e03df18abc4f768981410685cf7`
---

# HELIX-CONNECT Stage 1 L4 基本設計

`design_pair_defined`はこの文書と対のL9が契約・oracleを定義した状態を表す。設計はL3/L10の承認対象revisionを拡張せず、検証実行・合格、実通信、実装、運転、配布を表さない。L4↔L9の配置は[ConceptのV字pair](../../concept/helix-concept.md)と2026-10-08の[L4〜L6設計解禁判断](../../governance/decisions/l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md)に従う。

## 1. 対象範囲と固定source

対象は承認済みの`HELIXCONNECT-L2-001`〜`005`、Stage 1、`version_target: 1.0`に限る。CONNECT-001は後続判断の固定revision `617801a9e66fe6ff30bfddc8c1e72a3c43c2a722`、CONNECT-002〜005は`53fc2a1441b890b5bcd904e6d9805453c8c833d1`を使う。二つのrevisionを混ぜず、各6文書の全体bytesを固定する。Stage 2aの006、Stage 4の008/009、Stage 5の007、他機構の親はこの設計へ含めない。

L3/L10固定文書の役割順SHA-256（L3業務、L3機能、L3 NFR、L10業務、L10機能、L10 NFR）。各値は親revision上の`git show <revision>:<path>` raw bytesから再計算し、[Stage 1義務crosswalk](../../governance/crosswalks/stage1-l3-l10-obligation-crosswalk.md)と照合した。

| 対象 | 固定revision | L3業務 | L3機能 | L3 NFR | L10業務 | L10機能 | L10 NFR |
|---|---|---|---|---|---|---|---|
| CONNECT-001 | `617801a9e66fe6ff30bfddc8c1e72a3c43c2a722` | `3ff964c1b762c9f67228214d62df5e208d0e0ab5bd4f2ffb57b26f8684ebd925` | `b3e4a47c0f49978880fc9bae7697d9b67eeaf72a112f821fef167c230c9d2e4b` | `8becd7af6701e3de40a300c617aa3eca2d0214a867a2685b8615efcf8b7582aa` | `5d03d9c92b4b19cf291c3de6f96107b371f679b77bc9ae49183af7b2e97b8b5a` | `75a384b335c0d7e1f816644f498982e903fb0c5003a5e266a6d1019cecad6dcc` | `9efc5ddc902da565ad3d1295b2088ade1e7ab3427f1b4206ff3d4686a1197e48` |
| CONNECT-002〜005 | `53fc2a1441b890b5bcd904e6d9805453c8c833d1` | `7cbbfe2095d182a1e4244255c8dc40d55fe3bc4692a6e62e417d749c677b7087` | `f5df086977de2f707b6d9aff8878adff80e6e0acd95d9edee9979a30a3e14e09` | `1ca36cdf1fef00f75e24b71fd65ee12d677453dde0d6a67eec2493574275e78b` | `0ecd6905b16568d54f13ed3ae807eb588be3dfefaa41f9c2e3a6daf372b9e012` | `09f4e572f0c282ac51a914995c744b7b0fcc02d1e424d907a22a23044f61ee4a` | `796c0644a92d40e6ee18f4dc505737ffe225b5c606db400609bc45ebdef07a3c` |

共通設計の由来は承認済みL3 ACごとに追う。L4/L9で共通の一親を新設しない。2026-10-08 PO判断2に従い、K1〜K10の利用は実際に関係するACと結び付ける。L3/L10のこの固定scopeを超える相互依存の成立を主張しない。

## 2. 旧HELIXの起点、保持と再導出

旧資産明細台帳（`docs/governance/legacy-asset-disposition.jsonl`）の該当rowと原文bytesを読み、次の設計上の対応区分を記録した。表の`semantic_rederive`は旧資産の最終dispositionを変更するものではなく、台帳上の各rowはhistorical/unresolvedのままである。copy、verbatim reuse、legacy disposition変更、旧実行は行っていない。

| 旧asset / source | 原文とSHA-256 | 保持する役割 | 設計上の対応区分 | 変更・扱いと理由 |
|---|---|---|---|---|
| `LEGACY-ASSET-9A772391C7FB1298D45F` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16–56`; `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4` | functional, business, NFRを別sub-docに分け、機能ACをverificationへtraceする構造 | `semantic_rederive` | 三文書を維持し、現行L3/L10とL4/L9の層pairに再導出。旧G3・L12やgate名は持ち込まない。 |
| `LEGACY-ASSET-F542125805B777D8A56A` | `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13–21,148–168`; `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | 設計と対応する検証設計を対にし、要求から設計・検証へtraceする点 | `semantic_rederive` | L3↔L10、L4↔L9という現行Conceptの対へ置換。旧G3 freeze、旧L10 UX受入という意味は継承しない。 |
| `LEGACY-ASSET-9B7682EBDEA171005D45` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md:22–29,58–64,68–95`; `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` | source/consumer境界、versioned contract、drift時の停止という隣接比較材料 | `semantic_rederive`（隣接比較のみ） | 配布package固有のprofile、allowlist、release authority、promotion、algorithmは接続契約ではないため再利用しない。CONNECT要件は固定L2/L11から再導出。 |
| `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md:15–32,48–58`; `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | consumer入力、個別normal/negative oracle、証拠を対応させる検証設計の形 | `semantic_rederive`（構造のみ） | unknown profile、duplicate、digest driftのnegativeは配布artifactの例であり、CONNECT通信のoracleへ直接転用しない。L9は固定L10 caseを一対一で受け、外部通信・旧system testを実行しない。 |
| `LEGACY-ASSET-8CC5ABFC98C0D00183CA` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md:19–27,39–67`; `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3` | NFR候補・測定・受入へのtrace形式 | `semantic_rederive` | 旧grade、timeout、confidence、approval snapshot値は継承せず、今回の接続単位の測定候補をL3 NFRから再導出。共通SLAは作らない。 |

旧L3のbounded searchは`docs/design/helix/L3-requirements/`と`docs/test-design/helix/`で`CONNECT-FR`、`HELIXCONNECT-L2`、`connection identity`、`connectionIdentity`を検索した直接hit 0件であり、旧全archiveに類例がないとの主張ではない。対象となる旧distribution L3/testは上記範囲で実読した。別の旧product-data connectorはデータ取込・projectionを扱うため、今回の接続契約と同一視しない。旧CLI・test・CI・runtimeは起動していない。

## 3. 責務境界

- **CONNECT**は、端点ownerが宣言した論理connection identityと契約、対応する両端revision、互換照合結果、connection/operationに束縛された送受信結果、retry/traceの論理契約を扱う。endpointの物理到達性やOS実行状態を所有しない。
- **INFRASTRUCTURE**は物理resource・network pathとその観測を所有する。CONNECTの論理identityや契約互換を代替せず、CONNECTも物理pathの存在・可用性を推定しない。
- **SECURITY**は既存authorityとdata-use/classification policyの決定主体である。CONNECTは識別子を保持し、送信またはretry操作に適用される既存判定を参照するだけで、新規許可・policy・適用性を生成しない。
- **OS**はassignment、operationの運転・attempt状態と停止/再開の実行責務を持つ。CONNECTのreceiptはOS assignmentや実行成功ではない。
- **両端source/consumer/business owner**は契約・入力・業務意味・業務結果を所有する。CONNECTは業務完了・受入承認・保存完了を代筆しない。
- **HARNESS**はfixture/test scope、共通検証・証拠契約を提供する。L4/L9の設計は実行を行わない。

## 4. 共通契約と状態束縛

1. connection identityはsource/consumer端点と各ownerの宣言、方向、scope、意味契約revision、adapter/transport revision、互換範囲、適用される既存識別子に束縛する。必要な宣言がmissing/unknown/conflictならusableにしない。source/consumerが適用識別子なしと明示するregistration-only正常対照を許す。endpoint共有はidentityが異なる接続間で許す。
2. K2の既存identity/revision/digest鍵を使い、結果はconnectionとoperation、scope、contract/dependency revisionの現行参照へ結び付ける。入力sourceと使用時revisionを区別する。K1の`Value`/`Unknown`/`Unobserved`/`Stale`等の意味を保ち、CONNECT独自状態語で未知を成功へ写さない。
3. 互換照合は既存read scope内で独立して行える。登録時と使用時のrevisionを分け、compatible/incompatible/unknown/staleと原因revisionを返す。適格性の参照のみなら`send_eligibility=not_evaluated`、attempt 0。宣言されたscope内の実revision組を再照合できた場合だけstaleを解消する。drift・未登録・比較不能・read access不足では送信attempt 0を保つ。
4. 送信eligibilityを判断する既存operationだけ、actor/target/operation/environment/revision/scope/expiryとSECURITY許可、data-use条件を別に照合する。互換性とauthorityを相互代替しない。authority missing/unknown/expired/scope不一致時はsend/retry 0で該当existing ownerへ返す。
5. 送受信結果は同一connection/operation/contract revision/compatibility receiptで両端の結果を結び、技術結果、観測端点、未完義務と既存recovery参照を返す。schemaが両端契約で宣言される場合は、そのidentity/revisionを当該契約の入力として束縛するが、新schemaやwire formatは定義しない。契約外envelope、schema/contract revision不一致、異identity混載を成功扱いせず、受信側業務結果は受信側business ownerへ返す。transport・adapter方式は確定しない。
6. retryは既存connection contractがretryableと宣言した技術的失敗、同一operation identity/content digest/単一contract revision、契約に宣言された上限の範囲に限定する。同ID+digestの重複効果を増やさず、同ID+異digestを衝突として拒否する。business result、retry不能/unknown分類、新revision混載、expiry/authority不成立はretryしない。新しいretry上限・時間・backoff parameterを追加しない。
7. traceは登録・照合・send/receive・receipt・retry・stale・拒否・取消/expiry・交換/切戻し・終端をconnection/operation/revision/attemptの関係で保持する。既存eventを書換えず訂正は追記として示す。欠落・順序不明・片端未観測はunknown/unfinishedで、途中成功をend-to-end/business successにしない。source ownerのdata-use識別子を保持し、raw業務payload・secret・credential値を通常trace/receiptへ保存・複製しない。

これらは5親の既存義務をL4へ写したものである。L4は個別の固定protocol、共通latency/retention SLA、通信成功率、retry値、transport選択、permission、新しい親/承認gateを設けない。

## 5. 共通カーネル再利用

共通カーネルはHARNESS所有の既存L4契約として参照し、CONNECT用の別版・alias・親要求を作らない。引用元はbase `7d48e458fcff7e03df18abc4f768981410685cf7`の以下の文書である。

| 参照 | path | SHA-256 | CONNECTでの利用 |
|---|---|---|---|
| L4共通カーネル | `docs/helix-harness/L4-basic-design/common-kernel.md` | `7ee3a2e4bb820538ceab0dbf2ff2e8e44bf7cb113012ec16aba7484e70b6388b` | K1結果状態、K2 subject/input identityとrevision鍵、K3既存authority照合、K4未完義務、K5証拠からの状態、K6検証receipt、K7revision/fencing、K8label observation、K9独立review、K10依存宣言を各接続operationに適用。 |
| 対のL9共通カーネル | `docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md` | `62617cee9af0bdc1efe253275ae97dea9b2368cd8ee77a818735c5f180e0ba1b` | K1–K10の共通結合oracleを参照。CONNECT固有L9 oracleは§2でcaseごとに定義。 |

共通カーネルは新しいCONNECTED親や追加authorityを意味しない。由来は各L3 ACに個別traceし、HARNESS-L2-031を親としない（[2026-10-08 PO判断2](../../governance/decisions/l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md)）。

## 6. AC単位の設計trace

L10 source caseと、新設するL9 verifier IDは別の識別子である。正確な1:1対応と期待結果は対の[L9 §2](../L9-integration-verification/stage1-connect-integration-verification.md)を正本とする。ここでは契約由来と責務を記録する。

| 固定L2 / L3 AC | 設計単位 | 関係するK | failure owner / 戻し先 |
|---|---|---|---|
| `HELIXCONNECT-L2-001` / `CONNECT-AC-001-01` | 宣言済み両端接続descriptorの登録、identity一意性と登録receipt。適用識別子の保持と明示的な識別子なし正常対照を含む。 | K1, K2, K4, K5, K6, K10 | 接続元/consumer endpoint owner。authorityの決定はSECURITY、assignmentはOS。 |
| `HELIXCONNECT-L2-002` / `CONNECT-AC-002-01` | 登録・使用時revisionを分けた互換照合、staleと送信適格性の分離。 | K1, K2, K3, K5, K6, K7, K10 | 契約差は両端owner、read scopeはその既存owner、send authorityはSECURITY。 |
| `HELIXCONNECT-L2-003` / `CONNECT-AC-003-01` | connection/operation/revisionに束縛した両端技術receiptと未完義務handoff。 | K1, K2, K3, K4, K5, K6, K10 | 契約差は両端owner、authorityはSECURITY、business結果は受信側owner、進行はOS。 |
| `HELIXCONNECT-L2-004` / `CONNECT-AC-004-01` | 同一operation/content digest/単一revisionで契約上のretry境界を照合し、二重効果と未完返却を区別。 | K1, K2, K3, K4, K5, K6, K7, K10 | connection operation owner、business resultは元owner、expiry/authorityはSECURITY。 |
| `HELIXCONNECT-L2-005` / `CONNECT-AC-005-01` | 接続単位のappend-only技術event trace、端点観測と未完状態、非保存条件。 | K1, K2, K4, K5, K6, K8, K10 | traceはoperation owner、data-use/authorityはsource/SECURITY owner。 |

## 7. 5件のNFR測定候補

[固定L3/L10 NFR](../L3-requirements/nfr-grade.md)が定義する5候補だけを維持する。全接続共通の数値を作らず、技術候補は根拠・比較案・測定方法・判定境界を示す。各parameterの個別PO判断は求めない。要求の意味・scope・owner・versionを変える必要が生じるときだけL2へ戻す。

| 候補 | L3 AC | L4で定める観測対象 |
|---|---|---|
| `CON-NFR-001` | `CONNECT-AC-004-01` | 接続契約の既存上限Nに対する追加retry境界とfailure classification。N未指定なら実装値・達成とはしない。 |
| `CON-NFR-002` | `CONNECT-AC-004-01` | 同一operation ID/digestによる効果1回、異digest衝突時の効果追加0。 |
| `CON-NFR-003` | `CONNECT-AC-002-01` | drift検出から互換再照合までsend attempt 0、read-only照合のeligibility `not_evaluated`。 |
| `CON-NFR-004` | `CONNECT-AC-005-01` | 観測済みevent/証拠fieldの欠落数、順序不明数、raw業務payload/secret/credential保存または複製数。 |
| `CON-NFR-005` | `CONNECT-AC-005-01` | contract宣言または根拠付き候補のend-to-end latency/retention観測。共通SLAや未宣言値の合格境界は作らない。 |

## 8. 業務境界

固定L3業務文書は001〜005に独立business ACを定めない。両端ownerが持つ業務意味、業務結果、承認、保存完了はそれぞれのownerに残る。registration、compatibility、技術send/receive、retry、traceからbusiness success、approval、SECURITY許可、保存完了を作らない。L9のbusiness negativeは既存L10 business検証の共通境界を照合するだけで、独立business ACや新しい戻し先を追加しない。
