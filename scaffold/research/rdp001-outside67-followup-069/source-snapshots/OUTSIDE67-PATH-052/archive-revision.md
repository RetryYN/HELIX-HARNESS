---
title: "AI可読上流文書の要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
created: 2026-09-14
updated: 2026-09-14
product_targets:
  - HELIX-HARNESS
  - HELIX-OS
derived_from:
  - docs/governance/candidates/helix-concept-v4.1.md
  - docs/governance/candidates/instruction-path-change-resilience-requests.md
  - docs/governance/candidates/instruction-path-change-resilience-requirements.md
  - docs/governance/candidates/instruction-path-change-resilience-acceptance.md
  - docs/governance/candidates/rule-derivation-requests.md
  - docs/governance/candidates/rule-derivation-requirements.md
  - docs/governance/candidates/rule-derivation-acceptance.md
---

# AI可読上流文書の要求候補

## 目的

AIが会話、GitHub、memory、旧実装から要求を推測せず、承認済みのConcept・L1・L2・L3と対象revisionから、
現在の責務、許可範囲、停止条件、次の工程を再取得できる文書体系を新世代として構成する。
本候補は要求整理だけを行う。旧`AGENTS.md`、`CLAUDE.md`、hook、adapter、prompt、runtime stateは非実行archiveへ隔離し、
現行pathには新世代上流の読込順と停止条件だけを持つ最小入口を置く。生成器やruntime適用はまだ行わない。

## 文書責務の分離

| 対象 | AIへ渡す内容 | 禁止する混在 |
|---|---|---|
| HELIX-HARNESS | V-model、layer、pair、工程、成果物契約、検証義務、差戻し・完了条件 | Worker inventory、provider session、CI運転、HELIX内部memory |
| HELIX-OS | 対象project、authority locator、assignment、capability、allowed／denied action、lease、budget、state、log、review、CI、停止・復旧 | HARNESS工程意味の複製、個別製品要求の本文 |
| 個別product | 利用者、価値、対象要求、製品固有制約、受入条件 | OS内部管理機能、HARNESS実装詳細 |

## HARNESSに対する要求

| ID | 要求 | 確認する結果 |
|---|---|---|
| AIDOC-HARNESS-001 | AIが適用する工程契約を、対象HARNESS版、layer、pair、artifact、required oracleから取得できる | runtimeやproviderが変わっても工程意味が変わらない |
| AIDOC-HARNESS-002 | AI向け要約から承認済み正本と該当節へ逆参照でき、生成要約をauthorityにしない | 要約欠落・陳腐化を原文revisionで検出できる |
| AIDOC-HARNESS-003 | 未承認、stale、compatibility、historical、unknownを明示し、実行可能なcurrent契約と区別する | 古い文書が検索で見つかっただけでは適用されない |

## HELIX-OSに対する要求

| ID | 要求 | 確認する結果 |
|---|---|---|
| AIDOC-OS-001 | session開始時に対象project、product、authority revision、assignment、HEAD、許可、禁止、停止条件を解決してAIへ渡す | 会話履歴やIssue本文から不足fieldを補完しない |
| AIDOC-OS-002 | AI可読文書を承認上流から一方向に生成し、source locator、digest、生成版、適用scopeを保持する | `AGENTS.md`等が独立した要求正本にならない |
| AIDOC-OS-003 | HARNESS工程契約、OS実行統制、個別製品要求を別section・別source relationとして組み立てる | 同名語や一枚のcontextに責務を潰さない |
| AIDOC-OS-004 | token budgetに応じて要約しても、authority、禁止事項、停止条件、未解決事項、next required readを落とさない | context短縮で権限拡大や未承認採用が起きない |
| AIDOC-OS-005 | source更新時に影響するAI文書をstale化し、再生成・semantic diff・read-after前は実行へ使わない | 古い生成物と新しいauthorityを混在させない |
| AIDOC-OS-006 | AIの読取りと判断を対象revisionへ記録し、文書未読・参照失敗・競合を明示して停止する | 「読んだはず」やsession記憶を読取り証拠にしない |
| AIDOC-OS-007 | 現行AI文書を新世代のbaselineにせず、source inventoryと判断史を保持する非実行archiveへ移せる | 旧prompt・旧Core Reads・旧adapterが新世代sessionへ再注入されない |
| AIDOC-OS-008 | AI文書のinput、registry、activation、generation、distribution、enforcement、recovery、citationを別relationとして追跡し、各consumerの主体・時点・scope・revisionを保持する | 一件の文字列置換や一つのread setだけで移管完了と誤判定しない |
| AIDOC-OS-009 | reviewer identityとreview実行通路の許可を分け、GitHub、CLI、API、IDE、Workerごとのroute・account・network・費用・write範囲・期限を解決してから起動する | 「Claudeレビュー」等のprovider指定や別通路の過去許可だけからローカルCLIその他の実行権限を生成しない |

## 新世代のAI読取り入口

新世代の入口は、固定の巨大文書一枚ではなく、次を解決するmanifestから開始する。

1. `project_identity`と`product_target`
2. `authority_revision`とcanonical source locator
3. 適用する`harness_contract_revision`
4. `assignment`、`allowed_actions`、`forbidden_actions`、`stop_conditions`
5. 必須readと条件付きread
6. stale、conflict、missing sourceの状態
7. 読取り後のexpected outputと次工程

物理path、schema、生成器、prompt形式はL3以降で確定する。L2では既存ファイル名を新世代契約として固定しない。

## 現在の停止条件

- archive済みの旧`AGENTS.md`、`CLAUDE.md`、`.claude/`、`.codex/`、hook、adapterを現行pathへ戻さない。
- 現行Core Readsの順序を新世代の正解として移植しない。
- 既存AI sessionで新世代文書をruntime適用・強制しない。
- Concept／L1／L2確定前に生成器、manifest schema、prompt、token budget値を設計しない。
- 旧AI文書を物理削除せず非実行archiveで保全し、現行の最小入口から参照・fallbackしない。

## L11受入候補

全件未実行である。

- HARNESS、HELIX-OS、個別製品の異なるrevisionを与え、AIが三者の責務とsourceを混同しない。
- GitHub Issue、PR、memory、会話に新しい指示があっても、未採用ならauthorityとして表示・実行しない。
- 上流sourceを更新すると旧AI文書がstaleになり、再生成・semantic diff・read-after前に使用できない。
- contextを縮小しても禁止事項、停止条件、未解決事項、次の必須readが残る。
- 現行AI文書をarchiveへ移した後、新世代sessionのread setとpromptに旧文書が含まれない。
- 同じ旧pathをsession input、registry、生成template、配布物、lint、復元経路へ配置し、各relationを別consumerとして検出する。
- source欠落、digest不一致、競合revision、未読を個別に与え、推測で作業開始しない。
- reviewerだけを指定してreview routeを省略した場合は`review_waiting`で停止する。一つのrouteを許可しても別routeを起動せず、無出力やtimeoutから無許可fallbackしない。

本候補はAI文書の内容と生成・適用責務を上流で分けるための入力であり、現行runtimeへの適用を認可しない。
[既存CI・AI候補との対応](../audits/l2-requirements/new-generation-ci-ai-source-crosswalk.md)は、旧候補の承認を流用せず、
新世代へ再採否するsemantic atomを記録する。
