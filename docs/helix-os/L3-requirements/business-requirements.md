# HELIX-OS L3 業務要件（Stage 2b）

状態: L3未承認の候補／L10未実行の検証設計。対象は `HELIXOS-L2-014` のみ。

## Stage 2b — HELIXOS-L2-014 business境界

固定親 `HELIXOS-L2-014` は段階構成の管理・検証・配布・切戻しを扱うが、既存の業務成果に独立したbusiness outcome、business owner、KPIを追加しない。新しい `BR-OS-014` は作らず、親の各成果・担当・境界は `functional-requirements.md` の `FR-OS-014` と `business-verification.md` の照合表から固定L2/L11へ参照する。OSの段階成立記録は1.0到達、対象製品release、外部公開、L3承認を生成しない。意味・scope・owner・versionを変える必要がある場合のみ、既存authority手順でL2へ戻す。技術候補値ごとのPO確認や新gateは設けない。

## Stage 2a — 8親の業務要件（015/016/017/018/019/020/023/027）

状態: L3未承認の起草候補。ここでいうbusinessはOS機構の管理・推進・記録上の成果であり、外部提供製品の成果ではない。新しいowner、事業KPI、PO確認gate、候補完了判断を作らない。

旧HELIXのfunctional/business/NFR三分離（`LEGACY-ASSET-9A772391C7FB1298D45F`、`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16-56`）とbusiness concernを機能詳細から分ける形式（`LEGACY-ASSET-A6E2C7F0565E5F804F06`、`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:21-39,84-104`）を起点にする。旧BR-21/Learning Engine、plan metrics、approval behaviorをOSへ移さず、各ownerは採択L2の意味に従って再導出する。旧READMEのL3→L12と旧L10 processのL3↔L10は層対応が異なるため不一致を記録し、いずれの旧mappingも現行の正本とはしない。三文書への分離形式だけを参考にし、現在の配置は現行6 canonical文書のL3/L10構成に従う。

### BR-OS-015 — authority記録の追跡可能性

固定親 `HELIXOS-L2-015` version target `1.0` の業務成果は、正本、判断source、対象revision、責務と訂正履歴を辿れる管理記録を維持すること。OSはprojectionを管理し、requirementsやhuman decisionを生成しない。Acceptanceは `AC-OS-015-01`, `AC-OS-015-02`, `AC-OS-015-03` と `CASE-OS-015-01`, `CASE-OS-015-02a`, `CASE-OS-015-02b`, `CASE-OS-015-02c`, `CASE-OS-015-02d`, `CASE-OS-015-02e`, `CASE-OS-015-02f`, `CASE-OS-015-02g`, `CASE-OS-015-02h`, `CASE-OS-015-02i`, `CASE-OS-015-02j`, `CASE-OS-015-02k`, `CASE-OS-015-03` を参照する。

### BR-OS-016 — 複数対象の状態と関係を正しく示す

固定親 `HELIXOS-L2-016` version target `1.0` の成果は、各対象・要求revision・unit/connection/composite・依存edge・提供状態を混同せず見られること。OSのkanban表示はstate projectionであってmerge/release readinessやapprovalではない。Acceptanceは `AC-OS-016-01`, `AC-OS-016-02`, `AC-OS-016-03` と `CASE-OS-016-01`, `CASE-OS-016-02a`, `CASE-OS-016-02b`, `CASE-OS-016-02c`, `CASE-OS-016-02d`, `CASE-OS-016-02e`, `CASE-OS-016-02f`, `CASE-OS-016-02g`, `CASE-OS-016-02h`, `CASE-OS-016-02i`, `CASE-OS-016-03` を参照する。

### BR-OS-017 — 適格性を保ったticket推進

固定親 `HELIXOS-L2-017` version target `1.0` の成果は、HARNESS既定工程部品とINT案を既存authority/dependency/budget/deadlineへ照合したticketを作り、停止・差戻し時も未完義務を保つこと。OSはHARNESS工程やINT案ownerを代替しない。部品外workflowはL2が示す4.0境界に残す。Acceptanceは `AC-OS-017-01`, `AC-OS-017-02`, `AC-OS-017-03` と `CASE-OS-017-01`, `CASE-OS-017-02a`, `CASE-OS-017-02b`, `CASE-OS-017-02c`, `CASE-OS-017-02d`, `CASE-OS-017-02e`, `CASE-OS-017-02f`, `CASE-OS-017-02g`, `CASE-OS-017-02h`, `CASE-OS-017-02i`, `CASE-OS-017-02j`, `CASE-OS-017-03` を参照する。

### BR-OS-018 — 制約を保持したassignment・handoff

固定親 `HELIXOS-L2-018` version target `1.0` の成果は、Worker作業と独立reviewを分離し、assignment、attempt、scope、cumulative budget/deadline/failure countと未完義務を辿れること。OSはSECURITY認可、INFRA資源状態、LABO評価を代行しない。追加決定 `MPR-RC-HELIXOS-L2-018-002` はmain633 PO decision row 34で採択されており、追補L2 span 1604–1619 SHA-256 `5e2a621be8b4bda140bd796a48bedf2b3369daf5fad2665060ac41aa1a3174d2`、L11 span 1259–1276 SHA-256 `e32e45319a3ac91004e3e1a985c7ff44e91b9e86f05b85c266d6b8d67acf87b5`をf6固定本文とは別に参照する。適用sourceのある場合だけ予定/実績・逸脱理由を記録し、非選択consult/supportのreceiptを生成しない。Acceptanceは `AC-OS-018-01`, `AC-OS-018-02`, `AC-OS-018-03`, `AC-OS-018-04` と `CASE-OS-018-01`, `CASE-OS-018-02a`, `CASE-OS-018-02b`, `CASE-OS-018-02c`, `CASE-OS-018-02d`, `CASE-OS-018-02e`, `CASE-OS-018-02f`, `CASE-OS-018-02g`, `CASE-OS-018-02h`, `CASE-OS-018-02i`, `CASE-OS-018-02j`, `CASE-OS-018-02k`, `CASE-OS-018-02l`, `CASE-OS-018-02m`, `CASE-OS-018-02n`, `CASE-OS-018-02o`, `CASE-OS-018-02p`, `CASE-OS-018-03`, `CASE-OS-018-04a`, `CASE-OS-018-04b`, `CASE-OS-018-04c`, `CASE-OS-018-04d`, `CASE-OS-018-04e`, `CASE-OS-018-04f`, `CASE-OS-018-04g`, `CASE-OS-018-04h`, `CASE-OS-018-04i` を参照する。

### BR-OS-019 — 継続性と証拠の正確な再構築

固定親 `HELIXOS-L2-019` version target `1.0` の成果は、source-bound eventからepisodeを再構築し、欠落/重複/stale/拒否/未実行と成功を区別し、restart後も累積制約とdata-use境界を保つこと。provider memory/summary自体をcanonical authorityにしない。Acceptanceは `AC-OS-019-01`, `AC-OS-019-02`, `AC-OS-019-03` と `CASE-OS-019-01`, `CASE-OS-019-02a`, `CASE-OS-019-02b`, `CASE-OS-019-02c`, `CASE-OS-019-02d`, `CASE-OS-019-02e`, `CASE-OS-019-02f`, `CASE-OS-019-03` を参照する。

### BR-OS-020 — 要求された検証義務を運転する

固定親 `HELIXOS-L2-020` version target `1.0` の成果は、HARNESSが定義した義務・oracleを対象diff/head/environmentに結び実行状態を回収すること。新世代CIが未構築であるため旧CIを実行/代用しない。OS実行resultは意味review、human acceptance、mergeまたはreleaseのdecisionを作らない。Acceptanceは `AC-OS-020-01`, `AC-OS-020-02`, `AC-OS-020-03` と `CASE-OS-020-01`, `CASE-OS-020-02a`, `CASE-OS-020-02b`, `CASE-OS-020-02c`, `CASE-OS-020-02d`, `CASE-OS-020-02e`, `CASE-OS-020-02f`, `CASE-OS-020-02g`, `CASE-OS-020-02h`, `CASE-OS-020-02i`, `CASE-OS-020-02j`, `CASE-OS-020-02k`, `CASE-OS-020-02l`, `CASE-OS-020-03` を参照する。

### BR-OS-023 — Handoff時にscopeと義務を落とさない

固定親 `HELIXOS-L2-023` version target `1.0` の成果は、OS-016のportfolio traceにある対象要求revision・unit/connection/composite relation・source-bound stateを含めてsender/receiver間でexact revision/digest/scope/causal ID/evidence/unfinished dutiesを共有し、unit・connection・compositeの別々の判定を保つこと。transport receiptやPR/CI stateだけでbusiness completionを作らない。Acceptanceは `AC-OS-023-01`, `AC-OS-023-02`, `AC-OS-023-03` と `CASE-OS-023-01`, `CASE-OS-023-02a`, `CASE-OS-023-02b`, `CASE-OS-023-02c`, `CASE-OS-023-02d`, `CASE-OS-023-02e`, `CASE-OS-023-02f`, `CASE-OS-023-02g`, `CASE-OS-023-02h`, `CASE-OS-023-02i`, `CASE-OS-023-02j`, `CASE-OS-023-02k`, `CASE-OS-023-03` を参照する。

### BR-OS-027 — 未評価時にも限定初回作業を適切に扱う

固定親 `HELIXOS-L2-027` version target `1.0` の成果は、性能未評価という状態と操作permissionを区別し、採択済み六条件・authorityの全てが成立する狭い初回実行だけを扱い、その結果を同scopeでLABOへ渡すこと。初回成功はqualificationではなく、LABOのsource-bound評価までunassessedを保つ。人確認は既存L2内の初回scopeと結果の確認であり、確認者actor・対象revision・scope・時点・結果・未完義務を記録する。これは毎task承認やPR/CI/reviewerによるdecision生成ではない。Acceptanceは `AC-OS-027-01`, `AC-OS-027-02`, `AC-OS-027-03`, `AC-OS-027-04`, `AC-OS-027-05`, `AC-OS-027-06` と `CASE-OS-027-01`, `CASE-OS-027-02a1`, `CASE-OS-027-02a2`, `CASE-OS-027-02a3`, `CASE-OS-027-02a4`, `CASE-OS-027-02a5`, `CASE-OS-027-02a6`, `CASE-OS-027-02b`, `CASE-OS-027-02c`, `CASE-OS-027-02d`, `CASE-OS-027-02e1`, `CASE-OS-027-02e2`, `CASE-OS-027-02e3`, `CASE-OS-027-02f`, `CASE-OS-027-03a`, `CASE-OS-027-03b`, `CASE-OS-027-03c`, `CASE-OS-027-03d`, `CASE-OS-027-03e`, `CASE-OS-027-03f`, `CASE-OS-027-03g`, `CASE-OS-027-03h`, `CASE-OS-027-03i`, `CASE-OS-027-03j`, `CASE-OS-027-03k`, `CASE-OS-027-03l`, `CASE-OS-027-03m`, `CASE-OS-027-03n`, `CASE-OS-027-03o`, `CASE-OS-027-03p`, `CASE-OS-027-03q`, `CASE-OS-027-03r`, `CASE-OS-027-03s`, `CASE-OS-027-03t`, `CASE-OS-027-03u`, `CASE-OS-027-03v`, `CASE-OS-027-03w`, `CASE-OS-027-03x`, `CASE-OS-027-03y`, `CASE-OS-027-03z`, `CASE-OS-027-03aa`, `CASE-OS-027-03ac`, `CASE-OS-027-03ad`, `CASE-OS-027-03af`, `CASE-OS-027-03ag`, `CASE-OS-027-03ah`, `CASE-OS-027-03ai`, `CASE-OS-027-03aj`, `CASE-OS-027-03ak`, `CASE-OS-027-03al`, `CASE-OS-027-03am`, `CASE-OS-027-03an`, `CASE-OS-027-03ao`, `CASE-OS-027-03ap`, `CASE-OS-027-03ar`, `CASE-OS-027-03as`, `CASE-OS-027-03at`, `CASE-OS-027-03au`, `CASE-OS-027-04`, `CASE-OS-027-05`, `CASE-OS-027-06` を参照する。

### Scope境界

業務evidenceは `../L10-verification/business-verification.md` に記し、機能oracleは `../L10-verification/functional-verification.md` に記す。項目を別ownerへ移す必要があるほどmeaning/scope/owner/versionが変わる場合のみL2へ戻しPO判断に上げる。技術候補値ごとの判断を聞かず、追加gateを設けない。
