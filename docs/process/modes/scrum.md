> **正本化済** (PLAN-REVERSE-01 で DISCOVERY-04 dogfood 実績から正本化、2026-06-04)。docs/process は forward/modes/gates の運用正本。規範変更は concept/requirements (上位正本) 先行 → 本 dir へ反映する。

# Scrum 駆動モデル

出典: concept v3.1 §2.5 (9-mode ecosystem) / §2.6.1 signal→mode (`user_feedback_iteration`) / requirements v1.2 §1.3 kind=poc / §1.5 workflow_phase S0-S4 / §1.6 drive=専門職継承 (V7) / §1.8 role=aim / source process reference (scrum workflow)

---

## 1. 概要

Scrumは、全経路共通のL1〜L3とユーザー要件・route承認後に、小規模・継続成長・高feedbackで
一般的なScrumが適するproductをslice化する一線級delivery engineである。
Discovery（作れるか・何を作るか未確定なPoC）とは別物で、`delivery_route=production_scrum`として機械識別する。
現行`kind=poc`は互換schema値に限り、Production Scrumを使い捨てPoCとして扱う根拠にしない。

### frontmatter 早見表 (README 台帳より)

| 項目 | 値 |
|------|----|
| kind | `poc`（互換値。`delivery_route=production_scrum`必須） |
| drive | 専門職継承 (be/fe/fullstack/db/agent、§1.6 V7。対象 work の専門職) |
| layer | `cross` |
| workflow_phase | `S0-S4` |
| owner | po + aim |
| 承認者 | — |
| Vモデル接着点 | Design Refactorでslice設計を正規化後、要件・設計・test・実測をtyped traceで対応V-layerへ接着。意味変更はRedesign承認、複雑性/risk増大はReverseからHybrid/Forwardへ遷移 |

---

## 2. phase / フロー構成

| phase | 名称 | 主な作業 | 成果物 |
|-------|------|----------|--------|
| S0 | Backlog 構築 | プロダクトバックログ作成・優先付け | product backlog |
| S1 | Sprint Plan | スプリントバックログ選択・受入条件確定 | sprint backlog PLAN (kind=poc、drive=対象専門職) |
| S2 | Increment 実装 | スプリント開発。**increment = 1 PLAN 完了の粒度** | production品質のincrement |
| S3 | Verify | スプリントレビュー (ユーザーと要件すり合わせ) + レトロスペクティブ。S3 pass は verified increment evidence で、PLAN は `status=draft` のまま outstanding に残す | レビュー記録・改善事項 / review evidence |
| S4 | Decide | increment 受入判定 + 次スプリントバックログ更新。`decision_outcome` を記録して初めて terminal status / 昇華可否を決める | decision record / increment 完了 |

**HELIX 粒度定義**: Scrum は終端が曖昧になりやすいため、HELIX では **increment = 1 PLAN 完了** を粒度として定義し、完了基準を明確にする。

### スプリント反復フロー

```
S0 Backlog → S1 Plan → S2 実装 → S3 Verify (ユーザーレビュー / verified evidence) → S4 Decide
                ↺ 次スプリントへ反復 (S1 から)
                ↓ S4 `decision_outcome=confirmed` 後
            Design Refactor → typed trace接着 → Vモデル正本更新
            複雑性/risk増大時のみ Reverse → Hybrid/Forward
```

S3 verified increment は「レビュー証跡が揃ったが、PO/S4 受入判定が未記録」の非終端状態である。merged deliverable を伴う場合でも `merged-plan-status` は S3 + review evidence を draft violation から除外できるが、`helix status` は `po_decision_pending` として残す。

---

## 3. exit 条件

- increment 完成 (S4 受入判定 pass、`decision_outcome=confirmed`)
- **Design Refactor＋typed traceによるVモデル正本への設計接着完了**。意味変更はRedesign承認、欠落・risk増大はReverse補正完了

スクラムの速さ (反復・フィードバック) と V-model の厳格さ (ドキュメント体系・トレーサビリティ) を両立させるため、increment のみで完了とせず昇華まで含めて exit とする。

### 3.1 S4 decision record（S4 判断記録）

S3 verified increment で止まる Scrum PLAN は、PO が何を受入・却下・pivot するかを失わないため、
本文に `s4_decision_record` を持つ。

| field | 必須条件 | 意味 |
|---|---|---|
| `s4_decision_record` | S3 pending PLAN で必須 | S4 decide の判断単位。これが無い increment は完了候補として扱わない |
| `allowed_outcome` | S3 pending PLAN で必須 | `confirmed` / `rejected` / `pivot` のいずれか |
| `decision_owner` | S3 pending PLAN で必須 | S4 受入判定を記録する PO / 代理 owner |
| `decision_basis` | S3 pending PLAN で必須 | ユーザーレビュー、verified evidence、未解決 feedback、acceptance gap の要約 |
| `verified_evidence` | S3 pending PLAN で必須 | 実行した test / review / increment evidence / artifact hash。動く increment だけで受入扱いしない |
| `stakeholder_review_or_proxy` | S3 pending PLAN で必須 | user / PO / TL proxy の inspect/adapt 記録。未実施なら未実施理由と代替判断者を明示 |
| `acceptance_gap` | S3 pending PLAN で必須 | acceptance criteria と未充足 gap。gap が 0 か、pivot/reject 候補かを明示 |
| `unresolved_risk` | S3 pending PLAN で必須 | 未解決 feedback、未処理 bug、security / approval / migration 境界 |
| `external_source_basis` | S3 pending PLAN で必須 | 判断に使った公式ソース、既存正本、review source。URL / doc path / PLAN ID のいずれか |
| `source_ledger_freshness` | S3 pending PLAN で必須 | S4 decision source ledger が fresh で、checked 日付と ledger label が判断時点で有効であること |
| `source_status_delta` | S3 pending PLAN で必須 | 公式 source の status/version/date が前回採用時から `none` / `changed` のどちらか |
| `adoption_decision_delta` | S3 pending PLAN で必須 | 採用判断が前回から `none` / `changed` のどちらか。changed なら route impact を残す |
| `workflow_route_impact` | S3 pending PLAN で必須 | source 差分が無ければ `none`、差分があれば S4 / Forward / Reverse / backlog など差し戻し先 |
| `route_impact` | S3 pending PLAN で必須 | confirmed / rejected / pivot ごとの Forward / Reverse / backlog 影響 |
| `forward_route` | `confirmed` 候補がある場合必須 | L1/L3 など、increment の要件・設計正本化候補。S4 終端判断では PLAN 識別子、`docs/...` パス、または L1/L3-L6 の具体層を含め、`Forward へ進める` だけの抽象説明で代替しない |
| `reverse_fullback_required` | `confirmed` 候補がある場合必須 | increment を Forward に戻す前に Reverse fullback が必要か |
| `promotion_strategy_or_rejection_pivot_rationale` | S3 pending PLAN で必須 | confirmed なら `promotion_strategy` (`reuse-with-hardening` / `redesign` 等) と後続 descent 方針、rejected/pivot なら却下・再探索理由と backlog / retry route |

`s4_decision_record` は `decision_outcome` の代替ではない。S4 で PO が `decision_outcome` を記録した後に
terminal status / Forward merge / Reverse fullback へ進める。
S4 review material は prose-only claim では足りない。`verified_evidence` は実行済み test/review command、
test path、artifact/audit/evidence/report/log path、run/workflow/job id、または hash へ接続する。
URL、repo doc path、PLAN ID だけの source 参照は `external_source_basis` としては有効だが、
実行済み検証証跡ではないため `verified_evidence` 単独では通さない。pending S3/S4 の `route_impact` は confirmed / rejected / pivot の三分岐を
同時に示す。S4 `decision_outcome=confirmed` 後の `forward_route` は Forward / Reverse へ進む具体 target であり、
`PLAN-DISCOVERY-*` は follow-up PoC / pivot route としてのみ扱い、confirmed の昇格先にはしない。

`confirmed` / `rejected` / `pivot` は S4 `decision_outcome` であり、PLAN frontmatter `status` ではない。
Rejected Scrum work は `decision_outcome=rejected` と rejection rationale を記録し、PLAN は
`status=archived` で閉じる。`status=rejected` は valid PLAN status ではなく、terminal status として扱わない。

### 3.1.1 S4 decision packet surface（S4 判断 packet surface）

`helix s4 decision-packet --json` は、S3 pending Scrum PLAN の `s4_decision_record` を読み、
PO が S4 で confirmed / rejected / pivot のどれを選ぶかを判断する材料を `s4-decision-packet.v1` として出す。

この surface は **plan-only** である。`planOnly=true`、`mustNotDecide=true`、
`decisionCommandAvailable=false`、`decisionAllowed=false` を固定し、S4 `decision_outcome` の記録、
terminal status 変更、Forward merge、Reverse fullback 起票を行わない。packet は PO/TL の判断材料であり、
S3 verified increment を terminal 完了へ読み替えるものではない。

packet 自体は `generatedAt`、`sourceCommand=helix s4 decision-packet --json`、
`freshness` (`decision-packet-freshness.v1`) を持つ。古い packet の転記や stale な判断材料を
S4 決定に流用しない。

packet は `decisionEvidenceChecklist` / `outcomeRouteMatrix` / `semanticFeatureFrontierRecord` /
`provenanceRequirements` も出力する。
PO は verified evidence、stakeholder/proxy review、acceptance gap、unresolved risk、external source basis、
route impact を同時に見て、`confirmed` / `rejected` / `pivot` の各 outcome が terminal status、Forward /
Reverse / backlog route、追加 fullback にどう影響するかを判断する。これにより動く increment やレビュー済みという
単一シグナルだけで S4 confirmed を代替しない。

`helix completion decision-packet --json` / `helix status` / handover から S4 pending PLAN へ入る場合も、
supporting summary は `decisionRecord`、`decisionEvidenceChecklist`、`outcomeRouteMatrix`、
`provenanceRequirements` という親 field だけで完了しない。`requiredReviewFields[]` は `planOnly`、
`mustNotDecide`、`decisionAllowed`、`decisionCommandAvailable`、`decisionRecord.allowed_outcome`、
`decisionRecord.decision_owner`、`decisionRecord.decision_basis`、`decisionRecord.forward_route`、
`decisionRecord.reverse_fullback_required`、`decisionRecord.source_ledger_freshness`、
`decisionRecord.source_status_delta`、`decisionRecord.adoption_decision_delta`、
`decisionRecord.workflow_route_impact`、`decisionEvidenceChecklist.verified_evidence`、
`decisionEvidenceChecklist.unresolved_risk`、`outcomeRouteMatrix.routePolicy`、
`outcomeRouteMatrix.requiredEvidence`、`provenanceRequirements.evidence`、`relatedDecisionPackets.scopedCommand`、
`nextWorkflowRoutes.route` を列挙する。これにより、Scrum の inspect/adapt や動く increment を根拠にする場合も、
PO が source ledger、test basis、residual risk、route/fullback、provenance、plan-only safety を status から辿れる。

packet は `decisionVerificationCommandMatrix[]` も出す。これは decision packet baseline、source ledger freshness、
S3 verification evidence、requirements trace、targeted regression、static gates を含む。
さらに full regression、completion frontier の各 phase に対して command / expected / evidence / source /
sourceUrl / sourceCheckedAt / latestOfficialStatus / sourceStatusDelta / adoptionDecision などの項目と、
adoptionDecisionDelta / workflowRouteImpact も持つ。
各 command は `bun run ...` / `bun test ...` / `git diff --check` などの実行可能な承認済み verification surface
（executable verification command）
でなければならない。`run the PLAN-declared ...` のような自然文手順、後で証跡を記録するだけの prose-only
command、未実装 command は S4 decision packet の verification material として扱わず、`s4-decision-readiness`
が fail-close する。
Scrum Guide 2020 の inspect/adapt、ISO/IEC/IEEE 29148 の requirements trace、ISTQB Glossary の test basis、NIST SSDF の
review checklist を、PO/S4 判断前の実行証跡へ接続する。matrix は apply/decision 権限ではなく、S4 の
承認前 review material である。2026-07-03 に公式 Scrum Guide 2020 / ISO/IEC/IEEE 29148 / ISTQB Glossary /
NIST SSDF の現行性を再確認し、動く increment
や S3 verification evidence だけでは S4 confirmed を代替しない。
`sourceCheckedAt` は `S4 decision source ledger (checked YYYY-MM-DD)` から派生させ、
ledger heading と decision verification matrix の確認日を別々に進めない。

S4 decision source ledger（checked 2026-07-03、S4 判断 source 台帳）:

| source | official URL | 採用 version/date | 最新 official status | 採用判断 | S4 decision use | 必須 field への影響 |
|---|---|---|---|---|---|---|
| Scrum Guide 2020 | <https://scrumguides.org/scrum-guide.html> | November 2020 guide | current official Scrum Guide page | adopt-current-guide | Sprint Review / inspect-adapt は S4 判断入力であって terminal 完了ではない | `stakeholder_review_or_proxy`, `allowed_outcome` |
| ISO/IEC/IEEE 29148 | <https://www.iso.org/standard/72089.html> | ISO/IEC/IEEE 29148:2018 | published 2018、2024 confirmed、2026-02-16 stage 90.92 to be revised | adopt-2018-page-as-official-reference; track-under-development-revision | requirements / acceptance trace を S4 の forward route と gap 判断に使う。改訂版が published になるまでは 2018 版を採用し、改訂 status は S4 の source_status_delta に残す | `acceptance_gap`, `forward_route`, `route_impact`, `promotion_strategy_or_rejection_pivot_rationale` |
| ISTQB Glossary | <https://glossary.istqb.org/> | live official glossary | live official glossary | adopt-live-terms-with-ledger-date | test basis / test condition / test result の語彙で verified evidence を分離する | `verified_evidence`, `decision_basis` |
| NIST SSDF SP 800-218 | <https://csrc.nist.gov/pubs/sp/800/218/final> / <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd> | final publication 1.1 (2022-02-04) | Rev. 1 initial public draft v1.2 (2025-12-17) | adopt-final-1.1; track-draft-do-not-adopt-until-final | secure development / release evidence と residual risk を S4 判断材料に残す | `unresolved_risk`, `external_source_basis` |

Ledger freshness policy（鮮度方針）: `checked` が未来日、または現在日から 90 日超過の場合、その S4 decision source ledger は stale とし、S3 verified increment を S4 受入判定材料へ進めない。

Source ledger meaning review: `checked` 更新時は、各公式 source について `source_ledger_freshness`、
`source_status_delta`、
`adoption_decision_delta`、`workflow_route_impact` を S4 review evidence に残す。source の意味が
acceptance gap、unresolved risk、external source basis、Forward/Reverse route に影響する場合、
date-only refresh で S4 confirmed/rejected/pivot を判断してはならない。

S4 source ledger 意味レビュー証跡:

- `source_ledger_freshness`: checked 2026-07-03、90 日鮮度 window 内。Scrum Guide 2020 / ISO/IEC/IEEE 29148 / ISTQB Glossary / NIST SSDF SP 800-218 を公式 URL で再確認。
- `source_status_delta`: 2026-07-03 changed。ISO/IEC/IEEE 29148 は 2018 版 published / 2024 confirmed だが、2026-02-16 に stage 90.92 `to be revised` が追加され、改訂版が under development になっている。Scrum Guide 2020、ISTQB Glossary、NIST SSDF SP 800-218 final 1.1 / Rev. 1 IPD v1.2 は表の採用・追跡判断どおり。
- `adoption_decision_delta`: 2026-07-03 changed。ISO/IEC/IEEE 29148 は 2018 版を継続採用し、改訂版は published まで追跡する判断へ明示更新する。他 source の adoption decision は変更なし。
- `workflow_route_impact`: 2026-07-03 none for current S4 blockers。ISO 改訂 status は requirements trace の外部根拠として S4 review material に残すが、現時点では S4 / Forward / Reverse / backlog route の変更は発生しない。改訂版 published 時は S4 source ledger refresh と requirements trace 再評価へ差し戻す。

---

## 4. Forward 合流点

| 事後に起こす内容 | 昇華先 |
|-----------------|--------|
| 確定した要求・要件 | L1 要求定義 / L3 要件定義 |
| 実装された設計 (方式・機能・データ) | L4 基本設計 / L5 詳細設計 / L6 機能設計 |
| 実装済みのテスト | L8 結合テスト / L9 総合テスト |
| 運用・受入・文書整合 | L11-L14 |

完成機能の文書化は **`kind=reverse` (fullback type)** を経由し、F0-F4 成果物 (evidence / contracts / as-is review / handover checklist / routing) から各工程ドキュメントへ整備する。

> **昇華経路の正確化 (IMP-044)**: Reverse fullback の `forward_routing` は設計層 **L1/L3/L4/L5** のみ (reverse.md §4。L7/L8-L11 は V-model 規律で routing 先から意図的に除外)。よって上表の「L8/L9 結合・総合テスト」「L11-L14」は **routing 先ではなく、設計層へ再入し ①⇔③ を pair-freeze した後に Forward 進行で順次実施される右腕工程**である。Scrum increment の実装済テストは Reverse §2.1 で as-is-test-design (③) として復元 → 再入先 (L4/L5 等) の G4/G5 でペア凍結 → L8/L9 で ④ 実施。**直接 L8-L14 へ routing しない** (forward_routing enum に L8-L14 が無いのは欠落でなく設計の帰結)。

---

## 5. 必須 role / 承認者

| role | 根拠 | 担当 |
|------|------|------|
| `aim` | requirements §1.8 kind=poc 必須 | スプリント実装・verify 主担 |
| `po` | §1.8 owner | バックログ管理・S4 受入判定 |

---

## 6. 他 mode との連鎖 / 注意

| 接続 | 条件 | 説明 |
|------|------|------|
| Forward | 要件確定済 | 要件が最初から確定しているなら Scrum を経由せず Forward 直行 |
| Discovery | 要件未確定 | 「そもそも作れるか/何を作るか」が未確定なら Discovery |
| Reverse | 既存逆引き | 既存資産の逆引きが必要なら Reverse を前段に組合せ |
| Reverse fullback | 後段 (必須) | increment 完了後、Reverse fullback で V-model 昇華が必須 |

翻案注記: HELIX route は Scrum の fullback を `helix reverse fullback ...` として扱う。旧 source process command 名は現行導線にしない。HELIX Scrum は Scrum ガイドの構造 (ロール/イベント/作成物) を概念として取り込みつつ、increment=1 PLAN 完了の粒度定義と Reverse fullback による昇華義務を HELIX 独自の追加定義とする。

---

出典再掲: README.md 台帳 §2 / concept v3.1 §2.5-§2.6 / requirements v1.2 §1.3/§1.5/§1.6/§1.8 / source process reference (scrum workflow)
