---
layer: L6
sub_doc: function-spec-addendum
status: confirmed
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
parent_doc: docs/plans/PLAN-L6-09-governance-enforcement.md
plan: docs/plans/PLAN-L6-09-governance-enforcement.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
created: 2026-06-04
---

# L6 機能設計 (addendum) — governance enforcement lints (A/B/C, IMP-064/065/051)

> **layer (作成層 = V-pair key)**: L6 (機能設計) / **pair**: L7-unit-test-design §1.12 (U-SCRUMREV / U-PROP / doctor-hard)
> **位置づけ**: plan lint engine (`src/plan/lint.ts` stub) の本実装を待たず、**今 session で2回再発した process 漏れ (IMP-064 PoC→Reverse 欠落 / IMP-065 L0→L3 伝播漏れ)** を CI で止めるための最小 enforcement。純関数 lint + 実 repo vitest ガードで「CI が回す vitest」ベクトルに乗せ fail-close 化する (新 hook 不要)。

## §1 対象と非対象

- **対象**: ① scrum-reverse lint (A、IMP-064) / ② backfill hard-fail の doctor.ok 連動 (B、IMP-051) / ③ propagation lint (C、IMP-065)。
- **非対象 (DEFER)**: plan lint engine 本体 (§1.10 全ルール) / vmodel-lint (layer pairing、state DB 依存) / cross-check engine 汎用形 (IMP-033) / kind×layer guard (§1.6 PO 確定待ち)。本 addendum は「安く今入る 3 本」に限定する。

## §2 関数仕様

### §2.1 scrum-reverse lint（scrum reverse 整合 lint、`src/lint/scrum-reverse.ts`）

- `analyzeScrumReverse(plans): { pocOrphans, badReverseRefs, ok }`。
- **pocOrphans**: `kind=poc` ∧ `decision_outcome=confirmed` ∧ `promotion_strategy ∉ {redesign}` ∧ それを requires/references する `kind=reverse` PLAN が無い。→ §1.2「confirmed poc は reverse PLAN を起こす」違反 (IMP-064)。redesign は throwaway 再設計で Forward 再実装のため Reverse 不要 (concept §10.2、例 DISCOVERY-02)。
- **badReverseRefs**: `kind=reverse` が requires/references する poc が `decision_outcome≠confirmed` (rejected/pivot/未確定)。→ §1.2 line 139「rejected/pivot への接続は exit 1」。
- `ok = pocOrphans=0 ∧ badReverseRefs=0`。path 末尾一致は `/id.md` 境界固定 (別 id suffix 誤マッチ防止、backfill-pairing と同方針)。

### §2.2 backfill hard-fail の doctor.ok 連動 (B、`src/doctor/index.ts`)

- 既存 `analyzeBackfill.ok` (required orphan=0 ∧ glossary gap=0) は実装済だが doctor は `ok:true` 固定だった。
- `checkBackfillResult(repoRoot): { messages, ok }` を追加し `runDoctor.ok = backfill.ok ∧ scrumRev.ok ∧ propagation.ok` に連動。handover/agent-slots は warn-only (鮮度/運用 surface、ok を落とさない)。
- CI fail-close は既存 `tests/backfill-pairing.test.ts U-BACKFILL-006` (実 repo ガード) が担う。doctor.ok 連動は local `helix doctor` の parity。

### §2.3 propagation lint（伝播整合 lint、`src/lint/propagation.ts`）

- `analyzePropagation(conceptText, requirementsText): { conceptOnly, requirementsOnly, ok }`。
- 両 doc の `| signal | mode |` ヘッダを持つ routing テーブル**だけ**から signal 列 token を抽出し集合一致を要求 (`extractSignals`)。他テーブル (decision_outcome/reverse_type/kind) は巻き込まない。interrupt 行は subtype 表記が非対称ゆえ除外。
- `ok = conceptOnly=0 ∧ requirementsOnly=0`。concept §2.6 (上位 narrative) ⇔ requirements §7.8.1 (機械 routing SSoT) の signal 語彙ドリフトを検出 (IMP-065)。

### §2.4 FR gate/review aliases（FR gate / review alias の対応）

この alias は FR-L1-05 と FR-L1-17 を本 addendum に結び付け、FR coverage matrix が prose-only governance scope を指して済ませる状態を防ぐ。

| 関数 | Signature | pre | post | invariant | oracle |
|---|---|---|---|---|---|
| `evaluateGateReview` | evaluateGateReview(input: GateReviewInput, deps: GateReviewDeps) => GateReviewResult | gate id、execution mode、review kind、worker model、reviewer/checklist evidence が渡される。 | mode ごとに有効な cross-agent / intra-runtime / human review evidence だけを pass として返す。 | naive self-review と same-model approval は judgment-gate evidence として常に無効である。 | U-FR-L1-05 |
| `checkReviewEvidence` | checkReviewEvidence(input: ReviewEvidenceInput, deps: ReviewEvidenceDeps) => ReviewEvidenceResult | target PLAN frontmatter と現在の test/doctor evidence が渡される。 | review evidence 欠落、invalid review tier、test-after-review ordering の違反を返す。 | confirmed/completed の design または implementation PLAN は review evidence を黙って省略できない。 | U-FR-L1-17 |
| `analyzeRuleDrift` | analyzeRuleDrift(docs: RuleAdapterDocs) => RuleDriftResult | AGENTS / CLAUDE adapter docs が text として渡される。 | old runtime command routing、env prefix、local state path、agent nameに加え、native auto-merge禁止、read-only AI-B、current PR局所修正、別episodeだけIssue化の共有marker欠落と禁止legacy adapter markerを返す。 | adapter docs はcommand parityだけでなくmerge/review/finding disposition parityがgreenのまま静かに乖離できない。 | U-RDRIFT-001..004 |
Type/pseudocode の実質:

| 関数 | type body | pseudocode / implementation_state |
|---|---|---|
| `evaluateGateReview` | `GateReviewInput { gate_id; execution_mode; review_kind; worker_model; reviewer_model?; human_signoff?; checklist_evidence[] } -> GateReviewResult { ok; violations[]; accepted_tier }` | `src/gate/review-tier.ts` で実装済み。pseudocode = gate policy を読み、same-model self approval を拒否し、required evidence がある場合だけ cross-agent / intra-runtime / human を受理する |
| `checkReviewEvidence` | `ReviewEvidenceInput { plan_path; frontmatter; tests_green_at?; reviewed_at?; doctor_ok? } -> ReviewEvidenceResult { ok; missing[]; stale_approval[]; ordering_violations[] }` | `src/lint/review-evidence.ts` で実装済み。pseudocode = PLAN review_evidence を parse し、confirmed/completed では reviewer/verdict を必須にし、draft approve residue と test-after-review ordering を拒否する |

### §2.5 IssueクローズのPR文脈ゲート（PLAN-L7-462）

`analyzePrContext(input)`はpull request本文に`Closes #N`がある場合だけIssue closure契約を有効化する。
`Outcome`、current evidenceを指す`Closure receipt`、全子Issueの`Child Issues` dispositionを必須とし、
`rejected / quarantined`では`Decision receipt`、`superseded / cancelled`では実値の`PO decision`を要求する。
`Closure receipt`はPLAN ID、HEAD SHA、test/CI、reviewの4要素を持ち、placeholderを拒否する。
`resolved / rejected / quarantined`は証拠付き終端として受理する。Issue起点でないPRへclose契約を推測適用しない。

#### §2.5.1 Issueクローズgraphの実在束縛（PLAN-RECOVERY-10）

PR本文の`Outcome`、`Closure receipt`、`Child Issues`は操作意図の宣言であり、完了証拠そのものではない。
`Closes #N`のうち親／集約Issueが`helix-issue-closure-graph.v1`を持つ場合、既存`issue-closure-contract` stepがGitHubをread-after-writeし、親Issue本文の
`helix-issue-closure-graph.v1` JSON contractを次へ束縛する。

| 境界 | exact検査 | fail-close |
|---|---|---|
| canonical contract set | `contract_id + owner_issue`の非空exact set | missing、duplicate、receipt側excess |
| child / successor | 宣言番号のGitHub実在と`expected_state` | missing、state mismatch |
| completion receipt | owner Issue本文／commentにあるcontractごとのexactly-one receipt | missing、duplicate、schema/owner不一致 |
| PR HEAD | receiptの`pr_number + head_sha`と実PRのmerge済みHEAD | unmerged、別HEAD |
| required CI | receiptのrun ID、run HEAD、terminal success | stale run、別HEAD、red/pending |
| independent review | receiptのcomment URLとGitHub上のcanonical Claude receipt bytes | digest不一致、block verdict、別comment |

pure判定は`auditIssueClosureGraph`、GitHub read adapterは`loadIssueClosureGraphSnapshots`が所有する。adapterは
Issue/PR/Actions/commentを読むだけでwriteせず、100件でcomment pageが切れる場合は不完全snapshotを採用せず停止する。
新workflow、service、DB tableは追加せず、既存`pr-context`と単一required jobへ統合する。#227/#194は全contractの
completion receiptが揃うまでclose不可とする。
`Closes #N`を使うIssueはgraph contractを必須とし、未記載をadapterで
`issue_closure_contract_missing`として拒否する。PR側のclosing exact setとsnapshot側のparent exact setは
双方向一致させ、一件でもsnapshotが無い場合は`issue_closure_graph_missing`とする。実装PR自身の未merge状態と
循環するleaf Issueはdraft中に`Refs #N`を用い、merge済みcompletion receiptを作成した後のclosure transactionへ分離する。

親Issueは次のstrict JSONを一件だけ持つ。配列はexact setであり、範囲表記や散文から補完しない。

```ts
interface IssueClosureGraphContractV1 {
  schema_version: "helix-issue-closure-graph.v1";
  canonical_contracts: Array<{ contract_id: string; owner_issue: number }>;
  child_issues: Array<{ number: number; expected_state: "open" | "closed" }>;
  successor_issues: Array<{ number: number; expected_state: "open" | "closed" }>;
}

interface IssueCompletionReceiptV1 {
  schema_version: "helix-issue-completion-receipt.v1";
  contract_id: string;
  owner_issue: number;
  pr_number: number;
  head_sha: string;
  ci_run_id: number;
  review_comment_url: string;
  review_receipt_digest: `sha256:${string}`;
}
```

receiptは`owner_issue`自身の本文またはcommentからだけ収集する。review digestはURL先commentのexact bytes、
review HEADとCI runはcomment内のcanonical field、CI HEADはActions APIのactual runから再計算する。

このgateは`.github/workflows/harness-check.yml`の全pull requestで実行し、テンプレート存在だけでなく実PR本文を
fail-close検査する。oracleは`U-ICLOSE-001`、実装は`src/lint/github-guards.ts`、fixtureは
`tests/branch-kind.test.ts`を正本とする。

### §2.6 工学規律PLAN契約（PLAN-L7-463）

`analyzeDddTddRules`は2026-07-25以降に作成されたL3〜L7 PLANへ
`engineering_discipline_required: true`を要求する。対象PLANはno-code-first判断、DDD modeling、
precondition/postcondition/invariant/failure、TDD Red要否、net complexityを機械可読に保持する。
`none`、`no_change`、`pure_function`は明示的な縮退判断として受理し、object modelや新規codeを強制しない。

`add_code`または`justified_positive`は理由と`removal_trigger`の両方が無ければfail-closeする。
検査は既存DDD/TDD lintへ集約し、新しいdetector、CI job、dependency、runtime stateを追加しない。
さらにexact behavior contract、responsibility owner、`change_slice: atomic`、極小refactor段階、
legacy退役状態を必須化する。legacy削除はconsumer=0確認後だけ受理する。
oracleは`U-EDISC-001..004`、fixtureは`tests/ddd-tdd-rules.test.ts`を正本とする。

### §2.7 PR scope manifest契約（PLAN-L7-466）

`analyzePrContext`はpull requestのbase SHAからhead SHAまでの実変更pathを入力し、PR本文の
`Behavior contract`、`Responsibility owner`、`Allowed path families`、`Expected changed paths`、
`Required companion paths`、`Scope expansion`と照合する。behaviorとownerは各1件だけとし、
`Expected changed paths`はbase..headの実差分とexact集合一致させ、
許可familyは安全なexact pathまたはdirectory prefixに限定する。absolute path、`..`、globを拒否する。

宣言外path、実差分に存在しない必須companion、source変更時のPLAN/test companion欠落をfail-closeする。
scope拡張は`none`またはreview可能なGitHub issue/PR comment URLと具体理由を必須とする。固定ファイル数上限は設けず、
1 behavior contract＋1 responsibility ownerからの逸脱だけをblockする。既存`pr-context`と
実差分pathは`git diff --name-only -z`のNUL区切りfileでCLIへ渡し、Unicode pathをquote変換せず検査する。
改行などunsafeなpathはshell引数へ展開せず、manifest path safetyでfail-closeする。
CIが証明するのはreceipt pointerの形式と理由までである。参照先の存在、対象pathとの一致、
承認主体の独立性は同一HEADのAI-B review receiptで閉じ、CI greenだけを拡張承認の証拠にしない。
`harness-check` jobへ統合し、独立detectorやCI jobを追加しない。oracleは`U-PRSCOPE-001..005`とする。

GitHub Actionsの再実行では`pull_request` event payloadをcurrent authorityとして再利用しない。既存
`pr-context` ownerはGitHub APIからrepository、PR number、body、head/base ref、head/base SHAを1回の
readで取得し、同じsnapshotからmanifest判定と変更pathを生成する。guard終了後に同じfield集合を再取得し、
identity、schema、body、head/baseのいずれかが変わればfail-closeする。API取得不能、rate limit、別PR、
不正SHAもgreenへ縮退させない。既存jobへ入力adapterとして統合し、新job・detector・stateを増やさない。
oracleは`U-PRSCOPE-006..007`とする。

### §2.8 Reverse fullback scope全entry検証（PLAN-L7-673）

`reverse` / `R4` / `fullback` / `confirmed|completed` のPLANにある
`backprop_scope`は、必須の`requirements`、`L4-basic-design`、`L5-detailed-design`だけでなく、
宣言された全entryを同じ契約で検査する。各entryは`decision ∈ {updated, not_impacted, deferred}`と、
10文字以上の`reason`を持たなければならない。`decision: updated`の場合は、`evidence_path`が同一PLANの
`generates`に含まれることを要求する。layer欠落・entry重複・不正decision・未生成evidenceは
`reverse_fullback_scope_missing`へfail-closeする。

この検査は必須層の存在検査と独立して全entryへ適用し、追加layerを無検査の逃げ道にしない。
既存の必須3層の欠落・reason・generated evidence検査の意味は変更しない。oracleは
`U-RFSCOPE-001..003`、実装は`src/plan/lint.ts`、回帰は`tests/plan-lint.test.ts`を正本とする。

## §3 統合点

- `src/doctor/index.ts`: 3 lint を `runDoctor` に hard-fail 連動 (warn-only の handover/agent-slots と分離)。
- 各 lint に実 repo vitest ガード (U-SCRUMREV-005 / U-PROP-004 / 既存 U-BACKFILL-006) → CI (vitest) で fail-close。

### §3.1 branch kindとAdd-feature

`feature/*`は通常`impl`に加え、同一Featureを構成する`add-design`／`add-impl` PLANを受理する。
`design`、`reverse`、`refactor`など別駆動kindは引き続き拒否する。`add/*`も互換入口として維持し、
branch名の違いを理由にAdd-featureを通常Forwardへ偽装させない。oracleは
`tests/branch-kind.test.ts`のAdd-feature branch caseとする。

## §4 fail-close 段階

- 本 addendum = **CI vitest ガード + doctor.ok hard-fail** の2点で fail-close。
- DEFER: pre-push hook / plan lint engine への統合 (§1.10 ルールと一括強制) は `src/plan/lint.ts` 本実装時。

## §6 用語更新

- **scrum-reverse lint**: PoC confirmed (redesign 除く) ⇔ Reverse 合流 / reverse→confirmed poc 参照の整合検査 (§1.2)。→ concept §10.3 へ back-merge。
- **propagation lint**: concept §2.6 ⇔ requirements §7.8.1 の signal 語彙一致検査 (L0⇔L3 伝播ドリフト検出)。→ concept §10.3 へ back-merge。
