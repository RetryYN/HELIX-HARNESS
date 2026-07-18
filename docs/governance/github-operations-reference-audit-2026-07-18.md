# UT-TDD GitHub運用・skills・memory 参照監査

- 対象: `unison-ai-product/UT-TDD_AGENT-HARNESS`
- 方法: GitHub API、全remote head、PR head refs、main treeのworkflow/forms/policy/skills/memoryをread-only照合
- 用途: HELIX要件定義の参考。UTを実行権威にしない。

## 観測母集団

- remote headは8、PR head refは89、tagは0。
- API上のclosed PR 86件中merged 85件、closed-unmerged 1件。観測時open PRは #100/#103/#105。
- open Issue 11件、closed Issue 4件。Issue/PRを同じAPI結果から型別に分離して確認した。
- main Ruleset `main-stage1` は deletion/non-fast-forward禁止、required `harness-check`、bypass=never。ただしstrict required checks=falseで、PR-only ruleはない。
- workflowはpull_request全base＋push main。Linux full、Windows smoke、`always()` aggregate `harness-check`。

## 実物と規約の差

| ID | 観測 | HELIX要件への反映 |
|---|---|---|
| UT-GH-01 | branch実物は`work/*`、docs/skillは別prefix、work禁止記述もあり三重乖離 | route-aware prefix registryを単一正本化 |
| UT-GH-02 | mainから100超behindのstale branchやmerged済みbranchが残存 | TTL、merged後削除、stale finding |
| UT-GH-03 | RulesetにPR-onlyなし、skillはsolo direct-main許容 | main PR-only、例外なし |
| UT-GH-04 | required checkのstrict=false | strict=trueへ強化 |
| UT-GH-05 | policy.yamlはadmin bypass、実物はnever。diff実装はbypass未比較 | strict/bypassをpolicy schemaとlive diffへ追加 |
| UT-GH-06 | PR trace validatorがCIから呼ばれない | aggregate gate必須step化 |
| UT-GH-07 | PR #104/#105はtrace subject_head後にcommitが増えてもgreen | live head/base/merge-baseとreceiptを束縛しsynchronizeでstale化 |
| UT-GH-08 | Issue Forms指定labelがrepoに存在せず、実Issueはほぼ無label | label bootstrap/reconciliationをadmission前提化 |
| UT-GH-09 | Formsは存在するが新規Issueでdogfoodされずinbound未接続 | webhook→DB inbox→PLAN候補を実証 |
| UT-GH-10 | Execution Episode/outboxはdraft | exactly-once episode/outboxを要件化 |
| UT-GH-11 | merge方式の文書と実運用が不一致 | merge strategyを単一policy化 |
| UT-GH-12 | GitHub review 0件、内部review receiptがremote HEAD未束縛 | cross-runtime receipt digestをPR HEADへ束縛 |
| UT-GH-13 | merge→memory promotion/compactionがtransactionalでない | 同一episode closureへ統合 |
| UT-GH-14 | CURRENT pointerやPR memoryがmerge後stale | projection currency/cleanup gate |
| UT-GH-15 | push全commit/blob secret scanはhookのみ | CIでも再検証 |

## Issue Formsから採る契約

Recovery/Reverse/Redesign/Incident/NFRの `origin_plan`、`observed_head`、`observed_state`、`evidence`、`reason_code`、`drive_model`、`reentry_target` は採用する。HELIXではさらに requirement/AC、origin revision、route、scope/non-goals、security impactを必須化する。既存UTの「通常ForwardはIssue不要」は、全入口Issue gateを求めるHELIXにはそのまま採用しない。

## skills / memoryから採るもの

- 採用: explicit staging、Conventional Commits、1 PR 1目的、短命branch、push対象全commit/blob secret scan、CI self-heal。
- 強化: GitHub signal→typed Issue→durable event→PLAN→PR→CI→merge→memoryを冪等な一episodeとして閉じる。
- 不採用: solo direct-main、Bun固有command、GitHubをdomain SSoTとする考え、手動prose handover、固定200–400行上限。

## 結論

UTの強みはtyped Forms、machine trace、cross-OS aggregate CI、policy-as-codeにある。一方で、実運用はbranch lifecycle、live PR SHA、labels、Issue inbound、merge後memory閉包が未完成である。HELIXはこの穴を検証基盤で塞ぎ、GitHubを外部協調面、`harness.db`を因果・判断・継続の正本として接続する。
