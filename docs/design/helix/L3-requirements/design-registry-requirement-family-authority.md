---
title: "Design Registry 要求 family authority 要件"
layer: L3
kind: add-design
status: confirmed
created: 2026-08-09
updated: 2026-08-10
owner: PO / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
pair_artifact: docs/test-design/helix/L3-design-registry-requirement-family-acceptance-test-design.md
github_issue_id: 177
---

# Design Registry 要求 family authority 要件

## 1. 背景と解くべき問題

Design Registry の screen intake（`src/design/design-registry-screen-intake.ts`、Issue #177 slice6）は、
`screens` / `screen_trace` 台帳から screen node（`SCR-pm-01`）と `decomposes_to` edge を構築する。
しかし実 `screen_trace` 85 行の `requirement_id` は `BR-01` / `FR-L1-01` / `UX-02` であり、
registry の requirement family 正本（`src/design/design-registry.ts` の `REQUIREMENT_ID_PATTERNS`
= `HIL-(BR|FR|NFR)-*` / `VDH-FR-*` / `HR-FR-DHR-*`）と **1 件も一致しない**。

現行実装は edge を捏造せず全件を `unmapped_requirements` へ列挙し `trace_intake_complete=false`
を宣言している（fail-close 済み）。その結果 registry table は live row 0 件であり、
これが Issue #209 の L9（SA-UDP-01〜03、実 registry 台帳の SCR- node 群を要求）をブロックしている。

つまり解くべきは「**registry が現実の要求 family を認識できない**」という registry 側の欠落であって、
要求側の採番の誤りではない。

## 2. 決定事項（PO 承認済み 2026-08-10）

本 L3 は次の 3 点を要求 ID authority の projection 方針として確定する。実装方式は AI 判断とする。

**承認記録（charter §3 の L3 人間ゲート）**: 2026-08-10、chat にて PO へ D-1 / D-2 / D-3 を
上記 3 点として提示し、承認を得た（PO 発話原文: 「デザインハーネスを進めろって言ったよな？」＝
提示済み 3 点を含む #177 の続行指示）。AI 側の自己承認ではない。charter §3 表の L3 行
「AI が起草、人は承認のみ」は無条件の人間ゲートであり、§4 P8 の escalation 境界（不可逆操作）は
L4〜L12 行にのみ紐づく例外条項であって L3 承認要否の判定基準ではない
（この点は起草時に AI 側が取り違えており、独立レビューの指摘で是正した）。

| # | 決定 | 却下した代替と理由 |
|---|---|---|
| D-1 | **L1 の原 ID（BR / UX / FR-L1）を再採番せず、registry の requirement family として認識する** | 「要求側を `VDH-FR-*` へ再採番して screen_trace を移行する」案は、L1 docs・G1 trace・FR lint・screen_trace・下流参照を横断する ID 再採番であり、intake を開通させるという目的に対して blast radius が過大 |
| D-2 | **別名写像台帳（legacy family → registry ID）を作らない** | ID authority が二重化し、同期が腐る面を新設する。registry が防ごうとしているものそのもの |
| D-3 | **#257（Canonical Design IR intake）到達後も family 認識は原則維持し、暫定 loader だけを置換する** | family 認識（L1 authority が存続する限り恒久）と、`screens`/`screen_trace` reader・Markdown catalog loader（#257 で撤去）は lifecycle が異なる。両者を同一の `removal_trigger` へ束ねると、恒久側まで撤去対象に見える |

### 2.1 恒久部分と暫定部分の分離

`REQUIREMENT_ID_PATTERNS` は screen intake 専用ではなく **registry 全体の requirement entity grammar**
である。ここへ family を加えると、将来の全 consumer が `BR-*` / `FR-L1-*` / `UX-*` を registry
requirement ID として受理する。したがって次を明示的に分ける。

| 区分 | 対象 | lifecycle |
|---|---|---|
| 恒久 | L1 family を registry requirement grammar として認識する方針 | L1 authority が存続する限り維持（D-3） |
| 置換可能 | Markdown 由来の requirement catalog loader | #257 が同等の canonical catalog を供給したら置換 |
| 撤去 | `screens` / `screen_trace` reader とその adapter | #257 到達で撤去（PLAN-L7-529 の `removal_trigger`） |

## 3. 機能要件

| ID | 要件 | 受入ID |
|---|---|---|
| HR-FR-DHR-007 | L1 要求正本（`docs/design/harness/L1-requirements/business-requirements.md` の BR / UX、`functional-requirements.md` §1 の FR-L1）から、`{ id, kind, source_pointer, source_digest, catalog_version }` を持つ **versioned requirement catalog** を構造的に抽出する。抽出規則は L1 owner 側の既存 parser 資産（`src/lint/g1-trace.ts`、`src/lint/fr-registry-audit.ts`）と同一の定義行認識に揃える。ただし現行資産は ID 集合しか返さず（`extractG1BusinessIds` は `Set<string>`）BR / UX 用の抽出も持たないため、`source_pointer` / `source_digest` を伴う catalog 構造の生成は新規実装になる。Markdown 解釈を registry intake へ持ち込まないことは維持する | HR-AC-DHR-007 |
| HR-FR-DHR-008 | `buildScreenIntake` は pure function のまま catalog を **明示注入**で受け取る。file I/O・Markdown 解釈・doc path 解決を intake module に持たせない | HR-AC-DHR-008 |
| HR-FR-DHR-009 | trace の採用条件を **family 一致だけにしない**。(a) catalog に ID が実在する、(b) `screen_trace.requirement_kind` と catalog の kind が exact match する、(c) catalog の `source_digest` / `catalog_version` が intake receipt へ束縛される、の 3 条件を満たさない trace は edge 化せず、理由別の typed failure で fail-close する | HR-AC-DHR-009 |
| HR-FR-DHR-010 | catalog parser の健全性を検査する。対象 section 不在・抽出 0 件・重複 ID・非正準 ID（`BR-9` のような 0 埋め欠落）・本文中の単なる参照の過剰受理は、「ID 不存在」とは**別の** typed failure として区別し fail-close する。parser が黙って空集合を返して全件を不存在と判定する経路を作らない | HR-AC-DHR-010 |
| HR-FR-DHR-011 | registry graph の最終検証で、trace edge の requirement 端点が **graph に node として実在する**ことを確認する。catalog に存在するが registry へ未投入の ID を端点に持つ edge を許さない | HR-AC-DHR-011 |
| HR-FR-DHR-012 | 恒久 family 認識と、暫定 loader / `screen_trace` adapter を lifecycle として分離宣言する。撤去対象の module・export・test・policy entry を exact inventory として列挙し、#257 到達後に旧 adapter が残存していれば失敗する negative lifecycle test を持つ | HR-AC-DHR-012 |

## 4. 受入条件

| ID | 受入条件 |
|---|---|
| HR-AC-DHR-007 | 実 L1 正本から抽出した catalog が、BR / UX / FR-L1 の実在 ID を kind つきで含み、各 ID が `source_pointer` と `source_digest` を持つ。catalog は同一入力に対し決定的（同一 digest）である |
| HR-AC-DHR-008 | `buildScreenIntake` の signature が catalog を引数で受け取り、module 内に `fs` / path 解決 / Markdown parse を持たない（import graph で検証）。catalog を差し替えると intake 結果が対応して変わる |
| HR-AC-DHR-009 | 正常系: 実在する BR / UX / FR-L1 の trace だけが edge 化する。異常系: 架空 ID（`BR-99`）、kind 不一致（`requirement_kind="ux"` かつ `requirement_id="BR-01"`）、catalog digest 不一致のいずれも edge 0 件かつ理由別 typed failure |
| HR-AC-DHR-010 | section 欠落・抽出 0 件・重複定義・`BR-9` 形式・**本文中の単なる参照の過剰受理**（定義行ではない言及、例: 別要求の説明文に現れる `FR-L1-05`）は、`requirement_family_unregistered` とは異なる code で fail-close する。parser が空集合を返した場合に「全件不存在」として intake が成立しない |
| HR-AC-DHR-011 | requirement 端点が graph 未投入の edge を含む intake は commit されない |
| HR-AC-DHR-012 | 既存 family（`HIL-*` / `VDH-FR-*` / `HR-FR-DHR-*`）の現行挙動が不変。撤去 inventory に挙げた module が #257 有効時に残存すると lifecycle test が失敗する |

## 5. 境界値

`01`、現行の最大番号、0 埋めなし（`BR-9`）、桁超過（`BR-001`）、大文字小文字差、`BR-21` のような
特殊な縦表形式で定義されている ID。

## 6. 本 L3 の非対象

- **`HIL-*` の連番桁数不整合**（`src/design/design-registry.ts` は `\d{2,3}`、`src/requirements/requirement-ir-shadow.ts` は `\d{2}`）。別 family・別 owner・別回帰面であり、screen trace 開通と同一 failure domain に混ぜない。別 slice で先行 decision として桁数を確定してから実装を分けて commit する。**この非対象の帰結として、HR-FR-DHR-010 の非正準 ID 検査は catalog 対象である BR / UX / FR-L1 にのみ及び、`HIL-*` や `HR-FR-DHR-*` 自身の桁数不整合には及ばない**（逃げではなく検査範囲の明示）。
- BR / UX の ID 形式を機械検査する lint の新設（現状 FR-L1 のみ lint がある）。本件は catalog 抽出側で健全性を検査するため必須ではないが、要求側 authority の検査として別途起票しうる。
- #257 が異なる ID model を採用した場合の dual-green / 移行方針。#257 の設計確定後に扱う。

## 7. 残リスク

- L1 の Markdown table が事実上の機械契約になる。書式変更で gate が壊れるため、書式自体を回帰テストで固定する必要がある（「脆いから使わない」ではなく「契約として固定する」）。
- 既存 G1 / FR parser 間で正準化規則が完全には統一されていない。
- ID 実在検査だけでは、その screen と当該要求の関係そのものの正当性は証明できない（実在は必要条件であって十分条件ではない）。
- catalog digest を receipt へ束縛しないと stale green が起こる（HR-FR-DHR-009 (c) で塞ぐ）。
- family を registry 全体の grammar へ加えた後、別 consumer が existence check を迂回する可能性。

## 8. 出典

- inventory: `src/design/design-registry-screen-intake.ts`、`src/design/design-registry.ts`、`src/lint/g1-trace.ts`、`src/lint/fr-registry-audit.ts`、`docs/design/helix/L5-detail/design-registry.md`、`docs/test-design/helix/L8-design-registry-unit-test-design.md`
- 3 案の初出: Issue #177 コメント（2026-08-08、PR #480 完了報告）
- ブロック記録: Issue #209 コメント（2026-08-08、L9 SA-UDP-01〜03）
- cross-runtime advisory: Codex / gpt-5.6-sol による 5 軸レビュー（2026-08-09）。方向性は支持、「regex 追加 + 存在確認」から versioned catalog 注入・kind 一致・provenance 束縛・parser 健全性・端点実在の 5 点へ強化する条件つき。第 4 案（screen intake 限定の catalog adapter）は共通 validator と二重基準になるため不採用
