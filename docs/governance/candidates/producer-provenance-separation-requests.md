---
title: "成果生成・commit・公開・独立review provenance分離 要求候補"
status: draft_candidate
canonical_layer: L1
canonical_pair: L12
plan: PLAN-L3-1622-producer-provenance-separation
source_issue: 1622
---

# 成果生成・commit・公開・独立review provenance分離 要求候補

実provider workerの成果を別runtimeがcommit・公開する場合も、成果内容を生成した主体とGit操作主体を混同せず、
独立reviewが成果生成主体から実質的に独立していることを検証できなければならない。

| BR ID | 利用者要求 | 分解先 |
|---|---|---|
| `PPS-BR-01` | 成果を誰が生成し、誰がcommit・公開したかを別々に追跡できる | `PPS-R-01`, `PPS-R-02` |
| `PPS-BR-02` | Git操作主体の違いをreview独立性と誤認しない | `PPS-R-03`, `PPS-R-04` |
| `PPS-BR-03` | assignment・scope・candidate HEADまで一つのprovenance graphとして再生できる | `PPS-R-02`, `PPS-R-05`, `PPS-R-06` |
| `PPS-BR-04` | 過去証拠を捏造せず段階移行できる | `PPS-R-06`, `PPS-R-07` |

## 価値境界

- `content producer`、`commit executor`、`PR publisher`、`independent reviewer`を別identityとして扱う。
- commit metadataやGitHub actorだけから成果生成主体を推測しない。
- producer不明の旧receiptを、後付け推定でterminal review evidenceへ昇格させない。
- 本候補はGitHub actor、commit署名、resident lane、provider routingを再設計しない。

本書はIssue #1622を要求候補へ整理したものであり、人間承認、canonical promotion、runtime変更を与えない。
