---
title: "HELIX-CONNECT要求候補"
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
layer: L2
kind: requirement
status: draft
authority_status: draft_candidate
freeze_blocking: true
parent_concept: docs/concept/helix-concept.md
parent_planning: docs/helix-connect/L1-planning/connect-intent.md
pair_artifact: docs/helix-connect/L11-acceptance/connect-acceptance.md
sources:
  - docs/helix-connect/sources/connect-l1-po-original-2026-09-27.md
  - docs/governance/decisions/connect-l1-po-decisions-2026-09-27.md
  - docs/concept/helix-concept.md
  - docs/governance/audits/g7-connect-source-connection-inventory.md
---

# HELIX-CONNECT要求候補

本書は[HELIX Concept](../../concept/helix-concept.md)と[HELIX-CONNECT L1企画案](../L1-planning/connect-intent.md)を親にしたL2候補である。L1は対象revisionのPO確認待ちであり、本書の要求意味も未採択である。文書・ID登録・review・mergeから要求合意、L3承認、実装・運用許可を生成しない。

HELIX-CONNECTは接続登録、契約版照合、通信、再送、追跡を担う。接続先の業務上の判断、承認、要求採否は接続先の権限主体が行う。利用者へ接続を提供するHELIX-WEB-CONNECTORの製品要求は含めない。

各要求は機能identity、入出力契約、契約版・成果物版・依存版、互換範囲、検証範囲を識別し、HARNESS-L2-010/011が定める交換・更新・切戻し・未完義務引継ぎの共通契約を使う。本書はその共通lifecycleを再定義しない。共通接続descriptorを使う場合、能力名、契約版、対象scope（project/tenant/environment等）、correlation ID、expiry、idempotency key、result stateを保持する。欠落や未対応版を既定値で補わない。

## 要求の一覧

| 要求ID | kind | 親L1 | 対象能力 | version_target |
|---|---|---|---|---|
| HELIXCONNECT-L2-001 | unit | HELIXCONNECT-L1-001 | 接続と両端契約の登録・識別 | 1.0 |
| HELIXCONNECT-L2-002 | unit | HELIXCONNECT-L1-001 | 契約版互換性の照合とstale再検証 | 1.0 |
| HELIXCONNECT-L2-003 | unit | HELIXCONNECT-L1-001 | 登録契約に束縛した通信 | 1.0 |
| HELIXCONNECT-L2-004 | unit | HELIXCONNECT-L1-001 | 再送の重複防止、上限、試行追跡 | 1.0 |
| HELIXCONNECT-L2-005 | unit | HELIXCONNECT-L1-001 | 接続単位の追跡記録 | 1.0 |
| HELIXCONNECT-L2-006 | connection | HELIXCONNECT-L1-001 | 片側交換後の互換を保った接続 | 1.0 |
| HELIXCONNECT-L2-007 | composite | HELIXCONNECT-L1-001 | 複数機構を結ぶ接続構成体 | 1.0 |

`version_target`は能力を目標とする版で、実際の契約版・実装版・採択状態を表さない。実際にどの接続を対象とするかは、接続先と接続の棚卸しおよび要求identityとの照合を経て特定する。

## 共通契約

- 1つの接続identityは、接続元・接続先、方向、接続先が定める意味契約、両端の契約revision、許容する互換範囲を区別して参照できる。個別接続ごとに登録し、無関係な接続同士の変更を一つの契約改版へ束ねない。
- 接続登録、互換性評価、通信結果、再送試行、stale遷移、片側交換を、同じ接続identityと契約revisionへ辿れる。
- 各operationには能力名、contract revision、対象scope、correlation ID、期限、冪等キー、結果状態を束縛する。SECURITYが発行した許可・data-use/classification scopeが適用される場合は、その対象・operation・revision・environment・expiryを識別して受け渡す。CONNECTは権限・利用区分・業務完了を生成、拡張、推定しない。
- 登録済み契約のrevision、互換範囲、端点が変わった場合、影響を受ける接続をstaleとして識別する。互換性が再確認されるまで送信を許可しない。以前の正常結果で現在revisionの互換性を代用しない。
- 不明な接続、契約revision、端点、互換性、SECURITY許可/data-use区分、ACK、再送結果は成功として扱わない。取消、期限切れ、ACKなし、許可失効、送信後の結果未回収はresult stateをunknown/unfinishedとして保持し、業務完了扱いせず、送信を止めて関連する接続先ownerへ返す。
- 一回の受信または再送が部分成功した場合は、完了扱いにせず、どの段階まで到達したかを接続identity、operation identity、attempt identityに結び付ける。重複または異なる内容の同一idempotency identityを検出できる。
- 接続交換・更新・切戻し時は、未完operation、未確認ACK、未完義務、累積attempt数、期限、対象scopeを引継ぎ、共通pack契約の明示recovery先へ返す。再試行は一つのoperationで旧revisionと新revisionを混在させず、変更後revisionの再照合と明示的な再開条件を満たすまで停止する。
- 通常のtrace/receiptにraw payload、secret、credential値を保存しない。必要な本文の保持・削除・利用区分は元source/consumer ownerとSECURITYの契約に従い、CONNECTが再定義しない。

## 接続単体要求

### HELIXCONNECT-L2-001 接続登録と端点契約の識別（unit）

HELIX-CONNECTは各接続を固有の接続identityで登録し、接続元・接続先の機構、方向、機構が所有する意味契約identityとrevision、CONNECTが所有するadapter/transport revision、互換範囲、運用状態を識別可能にする。同じ端点を共有する複数接続は、それぞれ異なる接続identity、意味契約、scopeを識別できれば登録できる。同一接続identityを異なる宣言で重複登録する場合、またはidentityが衝突する場合は登録を利用可能にしない。登録は利用許可や業務承認を意味しない。どちらかの端点または契約が欠ける・不明な場合、その接続の通信を利用可能と判定しない。

共通pack契約の適用：HARNESS-L2-010/011の機能identity、入出力、依存版、互換範囲、検証範囲、更新/切戻し/未完義務引継ぎに従う。

- **入力**：source/consumerと端点の所有者が宣言する接続目的・能力名、端点、方向、scope、契約・成果物・依存のrevisionと互換範囲、適用されるSECURITY許可とdata-use/classification識別子。
- **出力**：接続identity、登録revision、端点/能力/契約/依存の参照、状態、登録結果receipt。
- **単独で成り立つための依存**：接続候補と両端ownerが宣言した契約。通信、再送、他接続を必須にしない。
- **失敗時の戻し先**：欠落/衝突/unknownは登録を未成立にし、不足または矛盾した宣言を該当する接続元・consumer ownerへ戻す。

### HELIXCONNECT-L2-002 契約互換性照合とstale再検証（unit）

接続の開始前、および登録後に端点、意味契約revision、adapter/transport revision、互換範囲のいずれかが変化した後の再利用前に、実際に使用する両端revisionが登録済みの互換条件に合うか照合する。互換性照合は、接続identity、両端revision、互換宣言、scopeの参照操作として単独で実施でき、送信実行用の許可を事前条件にしない。入力の読取りに適用される既存scope/access条件は維持する。登録時と使用時のrevisionを記録する。不一致・unknown・staleでは互換成立とせず、原因revisionと照合結果を残す。再検証で互換が確認された時だけ、そのrevision組合せのstaleを解消する。

実際の送信操作を適格と判定する場合は、互換成立に加えて、そのactor・target・operation・revision・environment・scope・expiryに有効なSECURITY許可と、適用されるdata-use/classification条件を操作時に照合する。許可が欠落・unknown・期限切れ・scope不一致・失効していれば、互換成立結果を保持しても送信可とはせず、送信attemptを開始しない。互換性照合だけの参照では、送信可否は`not_evaluated`とし、許可の存在または不存在を推測しない。

共通pack契約の適用：HARNESS-L2-010/011の契約・成果物・依存版と互換範囲を比較し、未対応版を黙って読み替えない。

- **入力**：互換性照合には、接続identity、登録receipt、実使用する両端契約/成果物/依存revision、互換宣言、scopeを使い、入力の読取りには適用される既存scope/access条件を守る。送信適格性を判断する操作に限り、actor、target、operation、environment、expiry、該当するSECURITY許可識別子とdata-use/classification条件を追加で照合する。
- **出力**：revision組合せを固定した互換性receipt（compatible/incompatible/unknown/stale）。送信操作の要求がある場合のみ、互換成立と有効な適用許可/data-use条件の双方を満たした`eligible`、または理由付きの`withheld`を返す。参照のみの場合は`send_eligibility=not_evaluated`とし、送信attemptを発行しない。
- **単独で成り立つための依存**：L2-001の接続登録、端点ownerのversion/互換宣言。送信適格性を照合する操作では、該当するSECURITY authorityとdata-use条件を追加で参照する。通信実行を必須にしない。
- **失敗時の戻し先**：契約不一致は接続設計・契約ownerへ、読取りaccess条件はその既存owner/authorityへ、送信時の許可scope/expiry問題はHELIX-SECURITYへ戻す。比較不能はunknown/staleとして記録し、送信は保留する。

### HELIXCONNECT-L2-003 契約に束縛した通信（unit）

通信要求は接続identity、operation identity、登録済み契約revision、互換性照合結果に束縛する。受信側が契約外の入力、異なるrevision、未識別のoperationを受けた場合は、正常受信として扱わず理由付きで拒否または隔離する。CONNECTは受信内容の業務上の意味を変更・決定せず、技術上の伝送結果を接続先へ返す。

共通pack契約の適用：HARNESS-L2-010/011の入出力契約、依存版、検証範囲、相関ID付き進行/結果/証拠と停止/再開条件に従う。

- **入力**：L2-001の接続登録とL2-002の現在revision照合、能力名、契約/成果物/依存revision、target scope、correlation ID、expiry、idempotency key、result stateの初期値、適用されるSECURITY/data-use識別子、契約に適合するmessage envelope。
- **出力**：端点へ渡されたenvelopeと受信側receipt、送信/受信/unknown/拒否のresult state、未完義務があれば共通recovery先へのhandoff情報。
- **単独で成り立つための依存**：登録済み接続と現時点の互換照合、端点双方の受領契約。別の接続を必須にしない。
- **失敗時の戻し先**：契約・版問題は両端contract ownerへ、scope/許可問題はSECURITYへ、受領拒否・業務結果は受信側業務ownerへ返す。接続結果を業務完了へ昇格しない。

### HELIXCONNECT-L2-004 制御された再送と重複防止（unit）

再送可能な技術失敗について、同一operation identity・同一内容digestを保って再送し、接続契約に定めた再送上限と再送可否条件を超えない。受信側が同じidentity・同じdigestを複数回受けても処理効果を重複させない。同じidentityで異なるdigestを検出した場合は衝突として拒否し、別内容を再送として処理しない。再送不能な業務結果は再送せず、判定主体へ返す。CONNECTは再送可否から業務判断を推測しない。

共通pack契約の適用：HARNESS-L2-010/011の冪等キー、記録済み途中状態、停止/再開、expiry、更新時の未完義務引継ぎ条件を用いる。

- **入力**：未完operation、同一correlation/idempotency identityとdigest、元のscope/expiry/許可、直前attemptとACK/result state、互換確認済みの単一contract revision、契約上の再送上限と可否。
- **出力**：attemptごとのreceipt、重複効果なしを示す受信確認、終端またはunknown/unfinished状態とrecovery先。
- **単独で成り立つための依存**：登録・互換照合・通信契約、受信側の同一identity重複排除契約。構成体や後続機構を必須にしない。
- **失敗時の戻し先**：digest衝突や再送上限到達は送信を停止し、connection operationのownerへ未完義務と試行数を返す。業務結果は元の業務ownerへ、許可期限切れはSECURITYへ戻す。新revisionへ自動混載再送しない。

### HELIXCONNECT-L2-005 接続単位の通信追跡（unit）

登録、照合、送信、受信確認、各再送、終端結果、stale、拒否を、接続identity・operation identity・契約revision・attempt identityと順序で追跡できる。記録は成功、失敗、部分成功、重複、digest衝突、unknownを区別し、どの端点の結果を観測できたかを示す。業務ownerが業務判断に使う内容をCONNECTが代筆しない。

共通pack契約の適用：HARNESS-L2-010/011が求めるinput/output contract、result/evidence scope、dependency version、未完状態のhandoffを参照する。

- **入力**：登録、照合、送信、受信確認、再送、取消、expiry、許可結果、stale/交換/切戻しeventとscope/version/correlation/attempt識別子。
- **出力**：append-only技術trace、現在の結果状態、停止地点、未完義務とowner/recovery先へのhandoff参照。data-use区分はsource ownerの識別子で保つ。
- **単独で成り立つための依存**：connection operation eventと共通ログ/証拠の契約。本文payload保存を必須にしない。
- **失敗時の戻し先**：traceの欠落/順序不明はoperationをunknownとしてconnection operation ownerへ返し、業務完了を止める。data-useや許可の不明はSECURITY/source ownerへ戻す。

## 接続要求

### HELIXCONNECT-L2-006 片側交換時の接続互換性（connection）

接続を構成する片側の機構またはそのCONNECT adapter/transportを交換するとき、変更されない側の機構・契約revisionを固定して、交換後の端点契約と接続契約の互換性を個別に照合する。互換範囲内であることが確認された場合、変更されない側を改変せずに同じ接続契約上で送受信できる。互換しない、unknown、stale、または意味契約が変わった場合は通信を止め、両側同時の変更を成功と見なさない。交換前後のrevision、照合結果、通信結果が追跡可能である。

共通pack契約の適用：HARNESS-L2-010/011のartifact/dependency version、verification scope、更新/切戻し/未完義務引継ぎに従う。

- **入力**：登録接続、固定側の機構・契約/成果物/依存revision、交換する側の旧新revision、変更scope、未完operation/義務/期限/attempt、交換・復旧権限と互換条件。
- **出力**：固定側を変えずに行った互換照合・送受信結果、または拒否/stale状態と未完義務を持つhandoff/rollback/recovery receipt。
- **単独で成り立つための依存**：一つの登録済み接続、両端のversion互換宣言、HARNESS-L2-010/011の更新/未完義務契約、該当するSECURITY許可。別接続辺を必須にしない。
- **失敗時の戻し先**：意味契約差分は両端ownerへ、技術互換はadapter ownerへ、許可範囲はSECURITYへ戻す。recovery先と未完義務を記録して通信停止を維持する。

## 構成体要求

### HELIXCONNECT-L2-007 複数機構を結ぶ構成体の接続完全性（composite）

複数の接続identityで連なる機構間処理について、各辺の端点と契約revision、接続順序、各operationの対応関係、再送境界、終端結果を一つの構成体の追跡から辿れる。全ての必須辺が個別に登録・互換確認され、operationの受渡しが終端まで確認される場合だけ、構成体の技術的通信完了を報告する。途中の辺がstale、失敗、部分成功、unknownの場合は全体成功にせず、停止位置と未完の引継ぎ先を示す。CONNECTは連続処理の業務上の成立、結果の承認を判定しない。

共通pack契約の適用：HARNESS-L2-010/011の各能力の宣言済み入出力、依存版、統合検証範囲、構成更新・切戻し・未完義務引継ぎを参照し、ここで再定義しない。

- **入力**：構成体の辺identity/順序/correlation/scope、各辺登録と現revision照合、端点operation mapping、期限/idempotency/result state、SECURITY許可、辺ごとのrecovery先。
- **出力**：辺ごとの結果を含む構成体trace、技術的終端state、停止時の未完辺/義務/owner/recovery handoff。
- **単独で成り立つための依存**：当該構成体を成す全辺のL2-001..005契約、HARNESS-L2-010/011の構成・依存・未完義務契約、各ownerの意味契約とSECURITY適用条件。CONNECTは業務承認主体を代替しない。
- **失敗時の戻し先**：失敗辺のconnection ownerへ返し、業務判断/再計画は元の機構/OS等ownerへ返す。後続辺を実行済みとせず、先行成功も消さずpartial/unknownを維持する。

## G7接続棚卸しidentityとの対応

[棚卸し監査](../../governance/audits/g7-connect-source-connection-inventory.md)と[identity一覧](../../governance/audits/g7-connect-source-identity-inventory.json)のsource revision・分類・CONNECT候補IDへ一致させた対応である。各sourceの業務意味・承認・採否は元機構に残る。ここで再送を対応させたもの以外に、source由来の再送義務を一律追加しない。実環境endpointの完全集合や採択は示さない。

| source identity | source分類 | CONNECT候補ID |
|---|---|---|
| `HELIXBRAIN-L2-018` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXBRAIN-L2-019` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXBRAIN-L2-020` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXBRAIN-L2-021` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXBRAIN-L2-022` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXBRAIN-L2-023` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXBRAIN-L2-024` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXBRAIN-L2-025` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXBRAIN-L2-026` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXBRAIN-L2-027` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXBRAIN-L2-028` | 共通pack条件を含むunit | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-005` |
| `HARNESS-L2-020` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HARNESS-L2-021` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HXT-CORE-02` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINFRASTRUCTURE-L2-008` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINFRASTRUCTURE-L2-009` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINFRASTRUCTURE-L2-010` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXINFRASTRUCTURE-L2-011` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXINFRASTRUCTURE-L2-014` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINFRASTRUCTURE-L2-025` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINFRASTRUCTURE-L2-026` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-017` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-030` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-031` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-032` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-033` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-034` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-035` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-036` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-037` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-038` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-039` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-040` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-041` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-042` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-043` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-044` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-045` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXINTELLIGENCE-L2-060` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXINTELLIGENCE-L2-061` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXINTELLIGENCE-L2-062` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXINTELLIGENCE-L2-063` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXINTELLIGENCE-L2-064` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXINTELLIGENCE-L2-065` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXLABO-L2-011` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-012` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-013` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-014` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-015` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-016` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-017` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-018` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-019` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-020` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-021` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-022` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-023` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-024` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-025` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-026` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-027` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-028` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-029` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-030` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-031` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-032` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-033` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-034` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-035` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-036` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-037` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-038` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-039` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-040` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006`、`HELIXCONNECT-L2-004` |
| `HELIXLABO-L2-041` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-042` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXLABO-L2-050` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXLABO-L2-051` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXLABO-L2-052` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXLABO-L2-053` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXLABO-L2-054` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXOS-L2-023` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXOS-L2-024` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXOS-L2-025` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HXT-FLOW-01` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HXT-FLOW-02` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HXT-FLOW-03` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HXT-FLOW-04` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HXT-FLOW-05` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HXT-FLOW-06` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HXT-FLOW-07` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HXT-FLOW-08` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HXT-FLOW-09` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HXT-SYS-01` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXSECURITY-L2-007` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXSECURITY-L2-009` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXSECURITY-L2-021` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006`、`HELIXCONNECT-L2-004` |
| `HELIXSECURITY-L2-022` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXSECURITY-L2-023` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXSECURITY-L2-024` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXSECURITY-L2-025` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXSECURITY-L2-026` | 明示connection | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-003`、`HELIXCONNECT-L2-005`、`HELIXCONNECT-L2-006` |
| `HELIXSECURITY-L2-027` | connection条件を含むcomposite | `HELIXCONNECT-L2-007` |
| `HELIXSECURITY-L2-028` | 共通pack条件を含むunit | `HELIXCONNECT-L2-001`、`HELIXCONNECT-L2-002`、`HELIXCONNECT-L2-005` |

単体本文の接続条件・委譲先はidentity一覧の各行へ保持する。Web/WEB-OSのVision候補は別所属として補助照合し、内部CONNECTへ移さない。単体の業務意味、HARNESSの工程/受入、OSのticket/検収、SECURITYの認可、INFRASTRUCTUREの実資源、BRAINの知識、LABOの評価、INTELLIGENCEの判断候補は各ownerに残す。

## 旧HELIXとの対応と差分

旧HELIXではadapter境界、契約版、stale化、再送・idempotency、lineage、partial failureを接続単位で扱う資産が確認できる。参照した主要資産は次のとおり。

| 資産 | 読んだ範囲 | 保持する意味 | 今回の変更 |
|---|---|---|---|
| `LEGACY-ASSET-C3DE79BA9451172F3E43` `docs/design/helix/L5-detail/product-data-connector.md` SHA-256 `2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04` | archive行33-57, 86-109 | provider固有境界を登録済み契約から隔離し、revision変更でstale化する。idempotency、照合失敗、lineageを保持する | product-data取得のsource schema、cursor、snapshot、DB投影契約はそのまま転用しない。内部機構間および外部構造をつなぐ共通部品の要求へ再導出する |
| `LEGACY-ASSET-DD66C1B6B7BE234B37E6` `docs/design/helix/L6-function-design/product-data-connector.md` SHA-256 `48014b188ebe0c3ffe18b86fa472f048a88e248316bf2b3218aaa605a5e55f42` | archive行27-57 | adapter境界での単一write authority、同一operationの照合/reconcile、異digest拒否と証跡連結 | Node/Python、DB、active connector最大1件等の旧実装選択を要求しない。通信責務と端点側業務責務を分離し、結果は元の業務ownerへ返す |
| `LEGACY-ASSET-BD13CC67526B48D461F9` `docs/adr/ADR-003-runtime-adapter-boundary-subscription-cli.md` SHA-256 `ffbe51c4a34cdaf4c072393a0864d916c7a4e1d6eaf4788bb0260e8280291f37` | archive行8-24, 26-45。A-71は行14、failure再発防止の根拠は行31, 35-45 | adapterがprovider固有境界を隔離し、接続consumerとの契約ずれを防ぐ。A-71は設計境界が固定されない場合にAPI-key認証前提が下位設計へ漏れたfailureとして扱う | subscription/CLI/runtimeと認証方式の決定を現行CONNECTのAPIや実装構成へ写さない。provider固有事情をcoreへ漏らさない境界の教訓だけを再導出し、接続先全件・consumerは棚卸しへ委ねる |

これらの資産はproduct-data intake、runtime adapter等の特定用途であり、HELIX-CONNECT一般の完全一致再利用ではない。意味の再導出として、契約境界、変更によるstale、同一operation再送の重複防止、失敗時の追跡可能性、provider固有事情と接続consumerの分離を採る。旧実装、CLI、runtime、test、CIは実行・移植しない。asset ID、source path、対象行、source digestとfailure A-71を上記に記録した。

## 人の判断が残る点

- L1企画候補の対象revisionとPO原文の欠落・過剰解釈がないことの確認。
- [今回のG7 source connection inventory](../../governance/audits/g7-connect-source-connection-inventory.md)が固定した9つの現行L2文書と、79の接続identity・23の複合identity・handoff条件を上の対応表へ割当て、source identityの脱落・重複がないこと、Web/Web-OS製品候補を内部CONNECTへ混ぜていないことを起草時に照合した。監査とcrosswalkは各業務意味や適用範囲を採択しない。文書棚卸しは実環境の稼働endpoint一覧を確定していない。

## この候補の外

段階リリース管理、業務判断・承認、接続先の要求意味の定義、HELIX-WEB-CONNECTORの顧客向け製品要求、provider固有のDB/CLI/runtime構成は本候補の要求にしない。段階ごとの成立範囲は、採択された要求から導く。


### HELIXCONNECT-L2-008 MCP profile catalogとtyped descriptorの供給（unit、単体追補候補、version_target: 1.0）

本項はHELIX-CONNECT L1-001に接続する未採択・未実装の要求候補であり、既存L2-001〜007の登録、接続、通信、認可または実装を変更しない。候補は、利用可能として宣言されたMCP profileを列挙し、profile identityとrevisionに束縛された設定契約、operation/tool capability descriptor、および安全・read-only probe descriptorを型付きで供給する。descriptorの存在は実際の安全性、実行資格、許可を証明しない。

profile identity、revision、設定契約、型付きdescriptorの組が欠落・不明・競合する場合、そのprofileを利用可能として返さない。未登録・未知profile、重複identityに異なる宣言、設定型またはdescriptorの不一致は拒否理由と対象revisionを記録し、暗黙の既定profileや互換性の推定へfallbackしない。登録済みprofileの契約revisionが変わった場合は既存HELIXCONNECT-L2-002のstale・再照合条件に従い、再検証まで当該revisionを適格として扱わない。

read-only probeについてCONNECTが供給するのは、操作の型・対象profile/revision・read-only宣言を識別するdescriptorまでである。CONNECTはprobeを起動せず、権限・policy・authorizationを生成または代替しない。操作の安全性と実行可否はSECURITYの責務であり、採択済みSECURITY-L2-005〜008の範囲に従う。関連するSECURITY-L2-034は独立した未採択候補であり、本候補はその採択を前提・依存としない。profile catalog、identity、設定契約および型付きdescriptorの供給はCONNECT、policyとread-only operation safetyはSECURITYが所有し、業務上のprobe意味は元の機構に残す。

不正identity・設定・descriptorの修正先はprofile提供元へ返す。policyまたはoperation safetyの不明・拒否はSECURITYへ返し、CONNECTが判定を上書きしない。失敗は対象profile/revisionと理由に結び付け、無関係なprofileの状態を変更しない。具体的なschema表現、registry技術、provider/runtime、secret値、tool実行方式は本候補で定めない。`version_target: 1.0`は要求候補の対象版であり、採択・実装許可を意味しない。

旧v1.3 HYB-002のS01/S02/S04について、archive revisionと6fabd125 baseline revisionの計6 lineage atomを候補入力に対応づける。S03/S05/S06の6 atomは別のSECURITY-034候補入力であり、本候補の対象外。source-linesとcoverage receiptはこの6 atomに限る。原要求のsource holding `MPR-SH-SUPPLEMENTARY-003` と `MPR-SH-V13-BASELINE-001` は両方とも生存し、HYB-002全体または意味条件のclosureを主張しない。
### HELIXCONNECT-L2-009 接続方向・実行順序属性とfeedback relation（connection候補、version_target: 1.0）

- **親・状態**：採択済み`HELIXCONNECT-L1-001`へ接続する未採択候補。CONNECT-L2-001の接続identity・方向・両端契約、L2-002のstale再照合、L2-004の再送上限、L2-005の接続単位trace、L2-007の複数機構構成体を組み合わせるrelation契約の候補である。既存の接続登録・通信・再送・構成体要求を置換しない。
- **提供するもの**：接続identityごとに、端点間のdirection、必要なら構成内のexecution order、feedback/return relationの端点・理由・operation lineageを明示する。現行L2-001がすでに方向を接続identityの一部として要求しているため、方向概念そのものを新設・重複定義しない。本候補では方向の宣言値と双方向の表現を明確化する。
- **方向と権限**：`one_way`は宣言された一方向だけを表す。逆向き通信は別の明示direction/connectionと、その操作時に適用される既存SECURITY authority／scopeが成立した場合だけ可能である。`paired_bidirectional`を使う場合は、二方向を個別に識別し、それぞれのendpoint contract・scope・operation-time authorityを確認する。一方向の登録、受信、ACK、feedback eventから逆向き送信権限を推論しない。CONNECTは許可を発行・拡張しない。
- **順序**：構成体での`serial`／`parallel`は、接続辺または構成体ownerが宣言したexecution topologyとして保持する。serialでは先行辺の必要結果と契約条件を満たす前に後続辺を実行しない。parallelは各辺が独立したidentity・scope・契約・operation/resultを持ち、join条件が宣言済みのときだけ並行実行できる。欠落した順序・join・依存条件は推測せずunknown/unfinishedにする。具体的なworkflow順序の所有者は既存HARNESS/OS contractとし、CONNECTがOS ticket計画を置き換えない。
- **feedback/return relation**：feedbackは新たな一方向のtyped relation edgeとし、source connection/operation、target connection/owner、reason codeまたは根拠への参照、correlation/operation lineage、関係するcontract revision、停止・再開状態を識別する。自由文だけのfeedbackはrelation成立やfinding解決にならない。relation edgeの記録・伝送は受領、解決、承認、task完了を意味しない。
- **loop終端**：loopは明示されたforward edge、feedback edge、既存ownerの再試行／budget／停止条件の参照、終端時のrouteで構成するbounded compositeとして扱う。回数・budgetは既存の適用可能なpolicy/契約から読み、CONNECTが新たな上限値や解決条件を定義しない。終了条件、既存policy参照、累積attempt数、期限、operation identityが欠落・unknown・staleなら、そのloopを開始／継続しない。反復ごとにsessionを変えて上限・budgetをリセットしない。上限到達時は既存ownerへ未完状態と理由を返す。
- **traceと失敗**：方向、辺順序、forward/feedback relation、各operation/attempt、contract revision、endpoint receipt、停止／終端状態を一つの因果traceから辿れる。辺の部分成功やACKなし、互換stale、authority unknown、join不成立は全体成功へ昇格しない。L2-007の「途中失敗時に構成体全体を成功と報告しない」を維持する。
- **境界**：CONNECTは送信許可、逆方向許可、業務上の解決、要求採択、ticket発行、budget policy、feedback内容の判断を生成しない。端点、契約revision、適用権限、reason、retry/stop contract、結果またはACKの欠落はunknown/unfinishedとして保持し、該当endpoint／contract／authority ownerへ返す。raw secret・credential・不要なpayloadをtraceへ複製しない。
- **旧sourceから保持する意味／新規案**：旧UWJ-FR-006のloopにおけるreturn/continue/stop・上限・terminal、旧HIL-NFR-04のloop上限・停止理由・再開checkpoint、旧MIC-R-02のserial merge後のbase drift再判定は一般的なworkflow／統合の意味として参照し、既存ownerへ結ぶ。旧sourceにCONNECT固有のdirection/order属性・typed feedback edge・terminationを一体化したrelation contractは確認できず、本候補のtype構成は新規案である。参照範囲・asset identity・検索上限はcoverage receiptに記録する。
