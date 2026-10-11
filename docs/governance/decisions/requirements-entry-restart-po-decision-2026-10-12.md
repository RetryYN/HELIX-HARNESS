---
decision_record_id: HDEC-REQUIREMENTS-ENTRY-RESTART-2026-10-12
decision_status: recorded
decider_role: PO
decided_at: 2026-10-12
recorded_at: 2026-10-12
authority_effect: effective_when_this_record_is_admitted_to_main
---

# 限定前提構築と、PO受入後の通常L3の再開判断

## 原文と固定対象

本Codex GUI会話でPOは次の問いに回答した。

> [レビュー済み固定案](https://github.com/RetryYN/HELIX-HARNESS/blob/7f891070db37fa7e868e4dcbad1f45e97b79e57e/docs/governance/requirements-entry-restart-proposal.json)の再開順序・範囲を採用しますか？推奨は、①JSON正本・template・命名/追跡・TDD等の前提形成に必要な限定L3/L10を先行、②既存の委任承認と対設計・検証条件を満たして対象実装/CIを構築、③実物をPOがL11で受入、④受入済み範囲からBRAIN032→CORE009→OS002の通常L3へ進む案です。初回範囲の10/3着手順を置き換え、10/9配置基本方針とL4の4論点再起草を保持します。release・内部デプロイ・対象外の再開は含みません。10/10判断が順序・範囲のPO指示を求めるため確認しています。

POの回答（原文）：

> 限定前提構築と、PO受入後の通常L3まで採用（推奨）

- 提示commit: `7f891070db37fa7e868e4dcbad1f45e97b79e57e`
- 提示意味JSON: `docs/governance/requirements-entry-restart-proposal.json`、全文SHA-256 `3d0880df1653db164f41da3beddd1f68deea9324eb354b0e58c0255823ae97a6`
- 対応roadmap: `docs/governance/requirements-first-roadmap.md`、全文SHA-256 `16faf6536ea59be6e9d69e3d46bbcd069365397e39f5b14f17e7ed42b91c718f`
- 判断対象はJSONの初回主対象・知識・条件別親集合・4段階・証拠の問い・未決・保持境界・確認方針と、対応roadmapの再開順序/scopeである。35入力pinは入力snapshotであり、その全本文や全能力を新たに採用するものではない。
- 独立review：[修正HEADのno findings](https://github.com/RetryYN/HELIX-HARNESS/pull/2935#issuecomment-6112057403)。案の[明示merge・read-after](https://github.com/RetryYN/HELIX-HARNESS/pull/2935#issuecomment-6112067896)は今回のPO回答を代替しない。

## 採用した範囲と順序

1. 前提機構の形成に必要な限定L3/L10を先行する。主対象はBRAIN032の採用済み15項目、HARNESS009の既決1.0/COREAPPLY、OS002のOSTRACEであり、条件別親契約と限定採用済みSEEDFIRST/MSGCONTENT/P3FIRSTを適用範囲で使う。未定義や不確実性を推測で補わない。
2. 対象L3/L10の既存委任承認、必要な設計知識の内容採否、対設計/test-oracle凍結、実operationのauthority/隔離/資源を満たして、その範囲の対設計・実装・検証・対象CIへ進む。カット済み成果物の承認を復元せず、対象要件から再起草する。
3. 前提機構の局所/接続/構成体の実証拠を、POがHARNESS022のL11利用者受入として確認する。対象revision/scope・対oracle・成功条件/反例・実観測・未完範囲・受入者と判断を記録する。文書承認・AIのVerified・CI green・件数/hashをAcceptedへ読み替えない。
4. POのAcceptedが成立した範囲から、選択済みBRAIN032→CORE009→OS002と必要な安全/接続/資源/計測の通常L3/L10へ進む。未完範囲と対象外の通常L3は停止を保持する。

初回scopeに限り10/3の案Bの着手順を上記へ置き換える。対象外の案Bと2cの6identityは保留し、374件roster・既存Stage・要求意味・版を保持する。3主対象のStage1著述先と必要な後段契約入力の先行を採用するが、routing container全atomの被覆、全後段Stage実装を採用しない。

10/9の配置基本方針は保持し、正本/宣言/台帳の一意化、ReleaseManifest・切替・実起動・rollbackの区別、公開と配布範囲、記録の論理ID/安全な物理配置と整合性の4論点をL4へ再起草する。既存のコンパイラ段階、機構×StageのPR単位、開発repo ticketの非書戻し/非依存gate、失敗から学ぶ原則を保持する。L3/L10承認は10/5・10/8の別系統独立reviewへの委任、機構×StageのPO事後確認を用いる。実物のL11受入はその文書承認とは別の判断である。

## 既決意味・未完義務と作用の境界

この回答は、10/10の停止に対する限定順序/scopeの例外を採用する。Concept・七大原則・各L2/L11の意味/版、BRAINの運用knowledge promotion、COREの適用判断、OSの実操作/保存、LABO評価、SECURITY/INFRAの責務を変更しない。

全templateの最小集合、設計段階の追加知識採否、正式schema、実契約版/案件値/制約の実適用、実往復の成立は段階2・3へ残す。HARNESS053→042の参照不整合と当該操作の停止は固定案のまま保持し、推測で代替IDを選ばない。旧atomをretireせず、全能力同時実装や全件CI/nightlyを初回条件にしない。

実物の成立・L11受入・個別L3/L10承認・実装完了・Issue完了はこの回答では成立していない。release・tag・内部デプロイ・配布切替・branch protection変更、対象外の再開は含まれない。下流の個別作業は採用範囲と各段階の条件に従う。

## 旧sourceと変更理由

固定案のlegacy_comparisonに記録した旧CLAUDE:49–63、functional-release-slice-requests:23–67、design-template-json-authority:19–60、predecessor-harness-full-weakness-audit:65–101の仕組み先行・意味/外部作用分離・必要安全依存・局所/接続/構成体の別証拠を保持する。旧runtime/CI/層番号を移植しない。

変更は前提形成そのものに必要なL3以下を限定先行させる順序であり、旧HELIXにこの例外許可があったとは主張しない。理由は10/10の信用失敗を実機構の証拠とPO受入で解消するためである。新しい承認主体や閾値を設けない。
