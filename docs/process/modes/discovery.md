> **正本化済** (PLAN-REVERSE-01 で DISCOVERY-04 dogfood 実績から正本化、2026-06-04)。docs/process は forward/modes/gates の運用正本。規範変更は concept/requirements (上位正本) 先行 → 本 dir へ反映する。

# Discovery 駆動モデル

出典: concept v3.1 §2.5 (9-mode ecosystem) / §2.6.1 signal→mode / requirements v1.2 §1.3 kind=poc / §1.5 workflow_phase S0-S4 / §1.8 role=aim / source process reference (discovery workflow)

---

## 1. 概要

Discovery は **要件・成功条件が未確定、または実現性が不透明な状態**を、仮説 → PoC → 検証 → 判定で潰す探索・検証モード。**確証が持てない「設計」**(仮実装→検証→確定) も Discovery で扱う (PLAN-DISCOVERY-01 §1.1)。Forward L0-L14 に入る前の不確実性を潰す前段であり、S4 `decision_outcome=confirmed` で昇格後に Reverse 昇華を経て正本化する。S3 verify pass は検証証跡の成立であって、terminal status ではない。

### frontmatter 早見表 (README 台帳より)

| 項目 | 値 |
|------|----|
| kind | `poc` |
| drive | 専門職継承 (be/fe/fullstack/db/agent、§1.6 V7。探索対象 work の専門職) |
| layer | `cross` |
| workflow_phase | `S0-S4` |
| owner | po + tl |
| 承認者 | — (formal サインオフ不要)。ただし S4 `decision_outcome` は **po** が記録 (PLAN-DISCOVERY-01) |
| Forward 合流点 | S4 `decision_outcome=confirmed` → L1 要求 / L3-L6 設計 (終点で Reverse 昇華) |

---

## 2. phase / フロー構成

| phase | 名称 | 主な作業 | 成果物 |
|-------|------|----------|--------|
| S0 | Backlog 構築 | 仮説を起票・優先付け (`priority_score` = impact×0.6 + uncertainty×0.4) | hypothesis backlog |
| S1 | Sprint Plan | 対象 hypothesis を sprint に選択、acceptance 条件を確定 | sprint plan PLAN (kind=poc) |
| S2 | PoC 実装 | `poc/*` ブランチ・使い捨て可。verify スクリプトを `verify/*.sh` 化 | poc コード / verify script |
| S3 | Verify | verify スクリプト実行、回帰スクリプトとして蓄積。S3 pass は `review_evidence` を持つ verified evidence で、PLAN は `status=draft` のまま outstanding に残す | verify 結果ログ / review evidence |
| S4 | Decide | `decision_outcome` を必須で記録 (confirmed / rejected / pivot)。ここで初めて terminal status / 昇格可否を決める | decision record |

### hypothesis status フロー

```
queued → [S1 plan] → testing → [S3 verify pass] → verified evidence / outstanding
                              → [S3 verify fail] → S4 rejected or pivot
verified evidence / outstanding → [S4 decide] → confirmed / rejected / pivot
```

S3 の `verified evidence / outstanding` は「技術的・検証的には揃ったが、PO/S4 判定が未記録」の状態である。`merged-plan-status` はこの状態を draft violation から除外してよいが、`ut-tdd status` は `po_decision_pending` として残す。
この状態に新しい要求意味が含まれる場合は、Forward 側の G-SF `semantic_feature_frontier_record` で
`classification=frontier_pending_decision` として扱い、L3/L4/L6/L7 fully descended claim を禁止する。

---

## 3. exit 条件

| outcome | 意味 | 次アクション |
|---------|------|-------------|
| `confirmed` | PoC 成立・実現性/設計成立 | Forward 昇格 (L1/L3-L6) + 終点で Reverse 昇華 |
| `rejected` | 仮説不成立 | 学びを記録し backlog 除外。reject 理由を decision record に保持 |
| `pivot` | 仮説修正 | 新仮説として次 sprint に再投入 |

`confirmed` / `rejected` / `pivot` は S4 `decision_outcome` であり、PLAN frontmatter `status` ではない。
Rejected Discovery work は `decision_outcome=rejected` と rejection rationale を記録し、PLAN は
`status=archived` で閉じる。`status=rejected` は valid PLAN status ではなく、terminal status として扱わない。

fail-close: confirmed は verify script 成功と S4 `decision_outcome=confirmed` の両方が必須。S3 verify 成功だけで `confirmed` / `completed` にしない。S3 verify 失敗時は sprint を completed にせず、S4 で `rejected` または `pivot` を記録する。

### 3.1 S4 decision record

S3 verified evidence で止まる Discovery PLAN は、PO が何を決めれば S4 へ進めるかを失わないため、
本文に `s4_decision_record` を持つ。

| field | 必須条件 | 意味 |
|---|---|---|
| `s4_decision_record` | S3 pending PLAN で必須 | S4 decide の判断単位。これが無い verified PLAN は単なる draft と区別できない |
| `allowed_outcome` | S3 pending PLAN で必須 | `confirmed` / `rejected` / `pivot` のいずれか |
| `decision_owner` | S3 pending PLAN で必須 | S4 判断を記録する PO / 代理 owner |
| `decision_basis` | S3 pending PLAN で必須 | S3 verified evidence、review evidence、外部根拠、未解決リスクの要約 |
| `verified_evidence` | S3 pending PLAN で必須 | 実行した test / verify command / review_evidence / artifact hash。検証実績が無い仮説を S4 材料にしない |
| `stakeholder_review_or_proxy` | S3 pending PLAN で必須 | PO / user / TL proxy の inspect/adapt 記録。未実施なら未実施理由と代替判断者を明示 |
| `acceptance_gap` | S3 pending PLAN で必須 | acceptance criteria と未充足 gap。gap が 0 か、pivot/reject 候補かを明示 |
| `unresolved_risk` | S3 pending PLAN で必須 | 未解決リスク、外部依存、security / approval / migration 境界 |
| `external_source_basis` | S3 pending PLAN で必須 | 判断に使った公式ソース、既存正本、review source。URL / doc path / PLAN ID のいずれか |
| `source_ledger_freshness` | S3 pending PLAN で必須 | S4 decision source ledger が fresh で、checked 日付と ledger label が判断時点で有効であること |
| `source_status_delta` | S3 pending PLAN で必須 | 公式 source の status/version/date が前回採用時から `none` / `changed` のどちらか |
| `adoption_decision_delta` | S3 pending PLAN で必須 | 採用判断が前回から `none` / `changed` のどちらか。changed なら route impact を残す |
| `workflow_route_impact` | S3 pending PLAN で必須 | source 差分が無ければ `none`、差分があれば S4 / Forward / Reverse / backlog など差し戻し先 |
| `route_impact` | S3 pending PLAN で必須 | confirmed / rejected / pivot ごとの Forward / Reverse / backlog 影響 |
| `forward_route` | `confirmed` 候補がある場合必須 | L1 / L3-L6 / gap-only 等の Forward 合流候補。S4 終端判断では PLAN 識別子、`docs/...` パス、または L1/L3-L6 の具体層を含め、`Forward へ進める` だけの抽象説明で代替しない |
| `reverse_fullback_required` | `confirmed` 候補がある場合必須 | confirmed 後に Reverse fullback で正本化が必要か |
| `promotion_strategy_or_rejection_pivot_rationale` | S3 pending PLAN で必須 | confirmed なら `promotion_strategy` (`reuse-with-hardening` / `redesign` 等) と後続 descent 方針、rejected/pivot なら却下・再探索理由と backlog / retry route |

`s4_decision_record` は `decision_outcome` の代替ではない。S4 で PO が `decision_outcome` を記録した後に
terminal status / Forward merge / Reverse fullback へ進める。
S4 review material は prose-only claim では足りない。`verified_evidence` は test path、実行 command、PLAN ID、
artifact/audit/report/log path、URL、hash のいずれかへ接続し、`external_source_basis` は公式 source、repo doc path、
PLAN ID、URL のいずれかを含む。pending S3/S4 の `route_impact` は confirmed / rejected / pivot の三分岐を
同時に示す。S4 `decision_outcome=confirmed` 後の `forward_route` は Forward / Reverse へ進む具体 target であり、
`PLAN-DISCOVERY-*` は follow-up PoC / pivot route としてのみ扱い、confirmed の昇格先にはしない。
S4 が `confirmed` の場合でも、要求意味が増えたときは `semantic_feature_frontier_record` を
`confirmed_current` へ更新し、L3 requirement / acceptance、L4 boundary、L5 contract、L6 function、L7 implementation
のどこまで降ろすかを `downstream_route` に分解する。S4 前の S3 evidence は `frontier_pending_decision` のままである。

### 3.1.1 S4 decision packet surface

`ut-tdd s4 decision-packet --json` は、S3 pending Discovery PLAN の `s4_decision_record` を読み、
PO が S4 で confirmed / rejected / pivot のどれを選ぶかを判断する材料を `s4-decision-packet.v1` として出す。

この surface は **plan-only** である。`planOnly=true`、`mustNotDecide=true`、
`decisionCommandAvailable=false`、`decisionAllowed=false` を固定し、S4 `decision_outcome` の記録、
terminal status 変更、Forward merge、Reverse fullback 起票を行わない。packet は PO/TL の判断材料であり、
S3 evidence を terminal 完了へ読み替えるものではない。

packet 自体は `generatedAt`、`sourceCommand=ut-tdd s4 decision-packet --json`、
`freshness` (`decision-packet-freshness.v1`) を持つ。古い packet の転記や stale な判断材料を
S4 決定に流用しない。

packet は `decisionEvidenceChecklist` / `outcomeRouteMatrix` / `semanticFeatureFrontierRecord` /
`provenanceRequirements` も出力する。
PO は verified evidence、stakeholder/proxy review、acceptance gap、unresolved risk、external source basis、
route impact を同時に見て、`confirmed` / `rejected` / `pivot` の各 outcome が terminal status、Forward /
Reverse / backlog route、追加 fullback にどう影響するかを判断する。これにより S3 green やレビュー済みという
単一シグナルだけで S4 confirmed を代替しない。

packet は `decisionVerificationCommandMatrix[]` も出す。これは decision packet baseline、source ledger freshness、
S3 verification evidence、requirements trace、targeted regression、static gates を含む。
さらに full regression、completion frontier の各 phase に対して command / expected / evidence / source /
sourceUrl / sourceCheckedAt / latestOfficialStatus / sourceStatusDelta / adoptionDecision /
adoptionDecisionDelta / workflowRouteImpact を持つ。
各 command は `bun run ...` / `bun test ...` / `git diff --check` などの実行可能な承認済み verification surface
（executable verification command）
でなければならない。`run the PLAN-declared ...` のような自然文手順、後で証跡を記録するだけの prose-only
command、未実装 command は S4 decision packet の verification material として扱わず、`s4-decision-readiness`
が fail-close する。
Scrum Guide 2020 の inspect/adapt、ISO/IEC/IEEE 29148 の requirements trace、ISTQB Glossary の test basis、NIST SSDF の
review checklist を、PO/S4 判断前の実行証跡へ接続する。matrix は apply/decision 権限ではなく、S4 の
承認前 review material である。2026-07-02 に公式 Scrum Guide 2020 の現行性を再確認し、S3 verification
evidence は S4 terminal 判断ではなく S4 entry gate として採用する。

S4 decision source ledger (checked 2026-06-30):

| source | official URL | adopted version/date | latest official status | adoption decision | S4 decision use | required field impact |
|---|---|---|---|---|---|---|
| Scrum Guide 2020 | <https://scrumguides.org/scrum-guide.html> | November 2020 guide | current official Scrum Guide page | adopt-current-guide | S3 review / inspect-adapt は S4 判断入力であって terminal 完了ではない | `stakeholder_review_or_proxy`, `allowed_outcome` |
| ISO/IEC/IEEE 29148 | <https://www.iso.org/standard/72089.html> | ISO/IEC/IEEE 29148:2018 | current ISO standard page | adopt-2018-page-as-official-reference | requirements / acceptance trace を S4 の forward route と gap 判断に使う | `acceptance_gap`, `forward_route`, `route_impact`, `promotion_strategy_or_rejection_pivot_rationale` |
| ISTQB Glossary | <https://glossary.istqb.org/> | live official glossary | live official glossary | adopt-live-terms-with-ledger-date | test basis / test condition / test result の語彙で verified evidence を分離する | `verified_evidence`, `decision_basis` |
| NIST SSDF SP 800-218 | <https://csrc.nist.gov/pubs/sp/800/218/final> / <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd> | final publication 1.1 (2022-02-04) | Rev. 1 initial public draft v1.2 (2025-12-17) | adopt-final-1.1; track-draft-do-not-adopt-until-final | secure development / release evidence と residual risk を S4 判断材料に残す | `unresolved_risk`, `external_source_basis` |

Ledger freshness policy: `checked` が未来日、または現在日から 90 日超過の場合、その S4 decision source ledger は stale とし、S3 verified evidence を S4 判定材料へ進めない。

Source ledger meaning review: `checked` 更新時は、各公式 source について `source_ledger_freshness`、
`source_status_delta`、
`adoption_decision_delta`、`workflow_route_impact` を S4 review evidence に残す。source の意味が
acceptance gap、unresolved risk、external source basis、Forward/Reverse route に影響する場合、
date-only refresh で S4 confirmed/rejected/pivot を判断してはならない。

---

## 4. Forward 合流点

- S4 `decision_outcome=confirmed` → **L1 要求定義** または **L3-L6 設計**へ昇格 (不確実性の内容に応じて routing)
- PoC をそのまま本実装にしない (PoC ≠ 本実装)
- verify スクリプトは **L6 機能設計の回帰検証**として残存
- **終点で Reverse 昇華** (R0-R4 fullback type) → docs 正本化 (PLAN-DISCOVERY-04 §3.1)

---

## 5. 必須 role / 承認者

| role | 根拠 | 担当 |
|------|------|------|
| `aim` | requirements §1.8 kind=poc 必須 | PoC 設計・verify スクリプト主担 |
| `po` | §1.8 owner | Backlog 優先付け・S4 decide 承認 |
| `tl` | §1.8 owner | 技術実現性判断・S1 plan 確定 |

---

## 6. 他 mode との連鎖 / 注意

| 接続 | 方向 | 説明 |
|------|------|------|
| Reverse | 前段 (組合せ) | 不明点が既存コード・設計に起因する場合は Reverse で事実収集してから PoC へ |
| Scrum | 隣接 | 作るものは概ね決定済だが要件を反復で固める場合は Scrum。Discovery は「そもそも作れるか/何を作るか未確定」が入口 |
| Add-feature / Incident | 前段 | 要件未確定なら Discovery が前段になりうる |
| Research | 前段 (切替) | Research (机上調査) で「作れるか不明」と判明した場合に Discovery へ切替・流入 (research.md §6 の reciprocal) |
| Reverse (昇華) | 後段 | Discovery 終点 → Reverse fullback で V-model 正本化 |

翻案注記: source process reference の旧 command route は UT-TDD CLI route へ置換済み。`poc/*` ブランチ運用は UT-TDD 独自ルール (CLAUDE.md §UT-TDD ワークフロー) に従う。

---

出典再掲: README.md 台帳 §2 / concept v3.1 §2.5-§2.6 / requirements v1.2 §1.3/§1.5/§1.8 / source process reference (discovery workflow)
