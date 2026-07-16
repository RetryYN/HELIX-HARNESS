---
title: "Infinity Loop predecessor PR / CI inventory"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: Codex / TL
schema: predecessor-pr-ci-inventory.v1
source_authority: docs/governance/infinity-loop-git-authority-observation-2026-07-16.md
---

# 前身PR・CI・PLAN観測台帳

## §0 判定境界

GitHubの全PR metadataと`statusCheckRollup`をread-only取得し、Git ref authorityへjoinするための分母を固定する。
PRの`MERGED`、branch tip、merge commit、現在取得できるcheck rollupを別fieldとして扱う。mergedをgreen、closedをreject、
checkなしをpassへ暗黙変換しない。過去runのretention消失やrerun後のrollup変化があるため、本台帳だけでbehavior採否を確定しない。

## §1 分母

| repository | PR total | open | closed-unmerged | merged | check success | check failure | check none | titleにPLAN clue | canonical metadata SHA-256 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `unison-ai-product/UT-TDD_AGENT-HARNESS` | 64 | 1 | 1 | 62 | 60 | 3 | 1 | 15 | `0854a6632f9a7faeea71458f2ed54a68fda562d6ee62ce9e92846bb8b930d053` |
| `RetryYN/ai-dev-kit-vscode` | 7 | 5 | 2 | 0 | 0 | 7 | 0 | 0 | `ea43bbed19151b3aa564d0e279d6216c9badf12db4800e36618381bb150a591d` |
| **合計** | **71** | **6** | **3** | **62** | **60** | **10** | **1** | **15** | repository別digestを維持 |

UTの64 PR headは`refs/pull/*/head` 64件と件数一致する。legacyの7 PRもpull-head 7件と一致する。
pull-merge refは可変であり、UT 1件、legacy 5件だけが広告されたため、merged PR 62件のmerge commit分母を
pull-merge ref件数で代用しない。PR APIの`mergeCommit.oid`とGit object materializeを別途joinする。

## §2 非greenまたはopen観測

| repository | PR | state | current check | head OID | merge OID | 判断 |
|---|---:|---|---|---|---|---|
| UT | 30 | merged | failure | `f384062df5eca3af20bd5e3d0401a3eda637c0d0` | `add3742ceba7e3ab7956205824e4e733fa0f701a` | historical merge。CI failure disposition pending | （日本語の機械契約記述）
| UT | 42 | merged | failure | `f7ba1c6d07024f48aa6b1e5c10b3e9c4c16144eb` | `639fd28983a95c7dfcf1c64631f7defffe1aa33c` | historical merge。CI failure disposition pending | （日本語の機械契約記述）
| UT | 53 | merged | none | `34faba133759f55f466bfe8253f992b130ebd3e6` | `c7b6c0046cf12602b7e8c7a2237eb00b1ed11da0` | check evidence欠落 |
| UT | 64 | open | failure | `87bc2879b81fb258a66d863d3fc2e810f66654e3` | — | WIP source evidence。完成扱い禁止 |
| legacy | 1..7 | open 5 / closed 2 | failure 7 | PR API current headへbind | merge 0 | Dependabot PR。個別採否pending |

## §3 PLAN join

titleに`PLAN`を含むPRはUT 15/64、legacy 0/7である。これはPLAN完全性ではなく探索seedに限定する。
正規joinはPR本文、commit message、changed PLAN files、design declaration、harness DB historical evidenceを調べ、
`pr_number -> head/merge OID -> PLAN ID -> design/test/gate`をtyped edge化する。title heuristicだけでPLANなしと判定しない。

## §4 現在のclosure

| metric | current | verdict |
|---|---:|---|
| PR metadata inventory | 71/71 | PASS |
| pull-head count join | UT 64/64、legacy 7/7 | PASS | （日本語の機械契約記述）
| current check rollup classified | 71/71 | PASS（観測分類のみ） |
| merge commit object join | UT 62/62、legacy 0（merged PRなし） | PASS |
| historical check/run retention audit | 未実施 | FAIL |
| current HIL/HR semantic candidate mapping | 71/71 | PASS（候補分類のみ） |
| candidate disposition | 71/71 | PASS（adopt 5 / harden 51 / redesign 8 / reject 1 / defer 6） | （日本語の機械契約記述）
| activated / verified behavior decision | 0/71 | FAIL | （日本語の機械契約記述）

## §5 PR 71 exact candidate join （日本語の契約見出し）

read-only GitHub REST取得とcandidate bundle objectを組み合わせたmachine artifactは
`docs/governance/generated/predecessor-pr-plan-join-71-v1.json`（SHA-256
`bb8187cdfa28da6c906a672a51ac3f8534a5bfe311120d2e2363bf2a2013dbb6`）である。titleだけでなく、
body、base..head commit message、changed pathからPLAN IDを抽出した。

| metric | current |
|---|---:|
| PR row / unique | 71/71 |
| PLAN ID candidateあり | 62 |
| historical PLAN join | 62 |
| current HELIX PLAN join | 0 |
| explicit PLAN ID無し | 9 |
| current check | success 60 / failure 10 / none 1 | （日本語の機械契約記述）
| atomic behavior decision | 0 |
| verified / coverage credit | 0 / 0 |

title heuristicの15件から62件へPLAN候補は増えたが、全て前身のhistorical PLANであり現行HELIX PLANには
同名joinしない。これは未採用を意味せず、changed pathとbehavior familyから現行requirement/designへsemantic
edgeを起こす後続reviewが必要である。PLAN ID無し9件もbehavior無しとは判定しない。current checkは観測時点の
head checkであり、historical run retentionやmerge時greenの代替にしない。

## §6 PR 71 semantic review （日本語の契約見出し）

`docs/governance/generated/predecessor-pr-semantic-review-71-v1.json`（SHA-256
`6455ca3f29124310a69a9ce7db4eb79994e3d242c46570fb61438e3b3fd66bc8`）は、§5 artifactの71行を
title、body存在、commit/path digest、behavior family、check観測から独立に再分類した。historical PLAN IDの
同名joinはcurrent authorityへ使用せず、各行にcurrent HIL/HR ID、`adopt/harden/redesign/reject/defer`候補、理由、
check limitationを持たせた。explicit PLAN ID無し9件も全件を独立行として保持する。

| metric | current |
|---|---:|
| semantic review / unique PR | 71/71 |
| no-plan row preserved | 9/9 |
| HIL mapping non-empty | 71/71 | （日本語の機械契約記述）
| HR mapping non-empty | 71/71 |
| disposition | adopt 5 / harden 51 / redesign 8 / reject 1 / defer 6 | （日本語の機械契約記述）
| activated / verified / coverage credit | 0 / 0 / 0 | （日本語の機械契約記述）

このreviewはatomic candidate decisionを閉じるが、source authority、historical check retention、現行実装での
behavior replay、独立activation receiptを閉じない。したがってverifiedとcoverage creditは0を維持する。

## §7 競合reconciliationとfinal candidate projection

full71、UT64、legacy7のsemantic artifactをPR IDで71/71 exact joinし、artifact originをprecedenceにせず
title、body存在、commit/path digest、check観測へ戻して再裁定した。machine receiptは
`docs/governance/generated/predecessor-pr-semantic-reconciliation-71-v1.json`（SHA-256
`ee44144100246ed19e19519d1b970438d5d0a055219f4e393763639f484ce942`）である。

| metric | current |
|---|---:|
| exact join / unique PR | 71/71 |
| disposition conflict | 41 |
| HIL set conflict | 71 |
| HR set conflict | 70 |
| reason conflict / any conflict | 71 / 71 | （日本語の機械契約記述）
| final disposition | adopt 4 / harden 42 / redesign 19 / reject 4 / defer 2 | （日本語の機械契約記述）
| verified / coverage credit | 0 / 0 |

`6455ca…`、`403bf3…`、`934080…`はhistorical inputとして保持するが、共有台帳のfinal candidate projectionは
本receiptを正本とする。full71のbehavior-family過展開とrepo別artifactのmerge/check-success過信をともに補正し、
current checkはbehavior adoption、historical lineage、runtime parityの証明へ使用しない。
