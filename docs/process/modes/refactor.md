---
canonical: true
process_doc: mode
mode: Refactor
kind: refactor
layer: L7
status: confirmed
updated: 2026-06-23
---

# Refactor モード

Refactor モードは、既存コードに対する振る舞い不変の brush-up workflow である。
機能 scope の追加、公開 contract の変更、永続 state semantics の変更を行わずに、
構造的負債を除去する。

正本:

- concept v3.1 section 2.5 / 2.6
- requirements v1.2 section 1.3 / 1.6 / 1.8 / 6.8.9
- FR-L1-25
- `docs/skills/refactoring.md`
- `src/workflow/contracts.ts#assertRefactorInvariant`

## 1. entry 契約

| Field | Value |
| --- | --- |
| kind | `refactor` |
| drive | `be` / `fe` / `fullstack` / `db` / `agent` |
| layer | `L7` |
| workflow_phase | forbidden |
| owner roles | `se` + `tl` |
| branch prefix | `refactor/*` |
| signals | `debt_degradation` / `code_smell` / `structural` |

Refactor は feature path ではない。作業が新しい観測可能な function を追加する、
公開 CLI/API contract を変更する、`.helix/` state schema を変更する、`harness.db`
schema を変更する、または期待される user behaviour を変更する場合は、Refactor を停止し、
Add-feature、Retrofit、Troubleshoot、Incident のいずれかへ route する。

## 2. TDD brush-up ループ

Refactor は TDD に似た loop を使う。ただし Red は新しい functional requirement ではなく、
structural smell または dependency risk である。

| 状態 | 意味 | 必須証跡 |
| --- | --- | --- |
| Red | 対象に未解消の structural debt、欠けた dependency check、失敗した regression、または behavior drift がある。 | finding、graph impact row、failed test、または open feedback event |
| Yellow | Refactor 対象は登録済みで、特定済み regression fence に保護されているが、brush-up step は完了していない。 | PLAN、変更 artifact list、予定 test IDs |
| Green | 振る舞いは不変で、変更されたすべての artifact が linked regression test IDs で cover されている。 | green command evidence、`test_ids`、relation impact closed、tests 後の review |

手順:

1. 対象を登録する: code smell、影響 file、observable boundary、想定 dependency impact を記録する。
2. regression fence を確立する: structural change の前に characterization coverage を実行または追加する。green state では test IDs を明記する。
3. 1 つの structural change を行う: rename、extract、split、deduplicate、dead code remove を小さな step で行う。
4. 検証する: targeted tests、該当する場合は typecheck/lint、`helix doctor` を実行する。
5. green 後に review する: qualitative review は quantitative green command evidence が存在してから行う。
6. 反復または close する: 登録済み debt が close されるまで step 3 から繰り返す。

## 3. DB 起点 Refactor

Refactor は `harness.db` から起動できる。cleanup が必要であることを人間が覚えている前提に
依存しない。

許可される trigger source:

- `findings`: 構造 lint、dead code、命名 drift、dependency direction 違反、
  または stale generated artifact。
- `quality_signals`: 同じ artifact または oracle で繰り返される warning/failure。
- `feedback_events`: handover または takeover 中に選択された未解消の improvement/debt signal。
- `graph_nodes` / `dependency_edges` / `impact_results`: sibling tests の欠落、
  design contract review の欠落、または stale upstream/downstream dependency を示す relation-graph impact。
- `artifact_progress`: reason が structural debt、missing dependency check、または missing linked test ID である
  red/yellow artifacts。

DB は projection であり、authoring source ではない。DB trigger は Refactor candidate または
PLAN input を作成するが、PLAN document と source artifacts は canonical authored state のままである。

detector-driven candidates は、Refactor Red/Yellow work として扱う前に triage しなければならない。

- 代表的な candidate sample を review し、detector を close する前、または queue に対応する前に、
  明らかな false-positive classes を記録する。
- confidence が低い candidates は audit visibility のため `quality_signals` に残し、
  `feedback_events` へ自動 promote しない。
- high-confidence かつ ranked candidates だけを open feedback へ promote し、handover が actionable になるよう
  promoted set に上限を設ける。
- detector hit から実際の brush-up を実行した場合、その hit が有用な boundary を選んだか review し、
  実際の refactor がより精度の高い rule を示したなら detector/process を更新する。

`refactor-scout` はこの triage の advisory subagent である。code inspection、candidate classification、
PLAN inputs の提案、verification fences の命名はできるが、変更を実装してはならない。
実装は SE/TL Refactor work の責務に残す。

stage/phase、route、approval、model tier、profile、skill、subagent、injection rules が
catalog、config file、専用 policy module ではなく code branches として埋め込まれている場合、
`externalize-policy` は first-class Refactor candidate である。stage-based subagent または
skill injection rules もこの category に含める。

## 4. dependency と impact の rule

projection が利用可能な場合、Green の前に changed files を relation graph で確認しなければならない。

必須の impact closure:

- Source change には sibling test または明示的な characterization-test evidence がある。
- `behavioral-contract` edge が存在する場合、Source change は L6 behavioural contract を review する。
- Design/test-design changes は paired artifact を更新するか、no-change reason を記録する。
- DB table または projection changes は state semantics が不変でない限り Refactor ではない。
  それ以外は Retrofit または Add-feature へ route する。
- behavior confidence を block する relation-graph finding がある限り、対象は Red のままとする。

## 5. 終了条件

Refactor PLAN は、以下がすべて成立した場合にのみ close できる。

- `assertRefactorInvariant` は before/after behaviour が不変の状態で pass する。
- Regression evidence には少なくとも 1 つの linked `test_id` がある。
- 必須 green commands は `exit_code=0` と evidence paths を持つ。
- Relation impact には changed files に影響する open action がない。
- Review evidence は green commands の後に記録されている。
- 新しい functional scope、public contract、persistence schema は追加されていない。
- module structure が変わった場合、L5/L6 design docs が更新されているか、具体的な
  no-backprop decision が記録されている。

## 6. mode 切替

| Observed change | Route |
| --- | --- |
| 新しい behavior または新しい public surface | Add-feature |
| brush-up 中に既存 behavior が壊れた | Troubleshoot または Recovery |
| 依存関係または runtime の更新 | Retrofit |
| Production regression | Incident |
| Contract または requirements drift の発見 | Reverse |

Refactor は、behavior invariant と test-ID-linked green evidence を伴って Forward/G7 へ戻った場合にのみ
complete である。
