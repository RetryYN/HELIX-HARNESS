---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "HELIX-bugbot 定型生成・正規操作の要件"
layer: L3
kind: redesign
status: confirmed
authority_status: canonical_source
approval_record_id: L3-PO-1639-001
approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1639#issuecomment-5575191362"
approved_revision: "1.0"
approved_candidate_head: a2325edb8425f4e84421ef2fd1f07c6c6d668dd7
approved_raw_digest: "sha256:5a1393d66839180f16e8c0db046070b882171792db929d20dc1316aab683faae"
version: "1.0"
owner_issue: 1639
plan: PLAN-L3-1639-bugbot-generation
parent_design: docs/design/helix/L1-requirements/bugbot-generation-requests.md
pair_artifact: docs/test-design/helix/bugbot-generation-acceptance.md
next_pair_freeze: L10
---

# 定型生成・正規操作

本書は`L3-PO-1639-001`で承認済みのBBG-R01..04を意味不変で移管したcanonical sourceである。
BBG IDを維持し、新しいFR IDやRequirement IR recordは追加しない。実行authority・承認記録ではない。
[L1利用目的](../L1-requirements/bugbot-generation-requests.md)、
[L10総合テスト設計](../../../test-design/helix/bugbot-generation-acceptance.md)、
[既存PLAN](../../../plans/PLAN-L3-1639-bugbot-generation.md)へ接続する。
新配置の独立技術reviewはPLANの対象HEAD・証拠へ束縛する。既存ACとの詳細照合、該当IR admission、
実装・限定実証は未完了であり、source配置と分離する。同一要求の再承認待ちには戻さない。
承認は実装・検収完了の証拠ではなく、生成から自動書込み許可を導出しない。

## 責務と再利用

コア①が生成・正規操作を担当する。GH-FR-007のCLI生成とledger照合、GH-FR-014の
template/schema/fixture先行、#1608のsource→generator→output→consumerを再利用する。
意味入力、正本導出欄、信頼済み実行receipt引用欄を別にする。新Skill #1594、Rule #1595、
限定修復Bとは別受入であり、別Compiler・DB・Policy正本を作らない。

## 要件差分

### BBG-R01 入力境界（原稿A01）

PLAN/PR、snapshot、managed設定、Rule/Helpごとに意味入力・導出・実測引用の欄とownerを定義する。
未定義の業務ロジックや設計はテンプレートに固定しない。

### BBG-R02 決定的生成（原稿A02）

既存CLIへtyped入力を渡す。AIのJSONも未信頼入力として検査し、欠落・矛盾・未対応を安定コードで返す。
同一source・入力・生成器版から同一意味出力を生成し、実行時刻等は観測記録へ分離する。
自由文・外部文書を実行コードにしない。

### BBG-R03 非捏造（原稿A03）

承認・confirmed・review verdict・実効model・CI成功・実測費用・署名を自由入力で確定しない。
有効な実記録から導出する。観測pathは実diff、許可pathは事前scopeから取得し、後者を自動拡張しない。
成功時stdoutが空でも、信頼済み実行receiptの存在・真正性とは分けて検査する。

### BBG-R04 更新と退役（原稿A04）

source/generator/output/consumerの版とdigestを既存projectionへ束縛し、影響箇所のみ再生成する。
意味入力と生成欄が混在した既存文書を一括上書きしない。手書き入口は後継検証・consumer移行後に退役する。
承認対象の意味digestを再検収なしに更新して追認しない。

## 受入への引渡し

独立oracleで欄別の入力可否、同一入力再生成、偽receipt拒否、scope拡張拒否、空stdoutの合法受理、
混在文書の意味保存、旧入口の移管・rollbackを検証する。生成テストのみでは合格しない。
まず一系統で作成→検出→限定修復→再検証を実consumerで通す。対象と非対象を先に固定する。
手修正数、LLM呼出し・tokens、総時間、CI再走、手戻り、誤修復、未解消数を同条件で比較する。

原文bytes: [保全台帳](../../../governance/candidates/bugbot-intake-source.md)のBase64復号（正規化なし）。SHA-256 `c97b9dd32b8327696d77ae3f86cebeae0e3a2545766d3e4bb2c0f484e6a4828a`。
Issue #1639は追跡先であり、追記後の本文全体のhashとは区別する。
別紙02/03/05は未提供。03の18シナリオとの全件照合は未完了である。
