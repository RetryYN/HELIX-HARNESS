---
title: "Infinity Loop predecessor Git authority observation"
status: partial
created: 2026-07-16
updated: 2026-07-16
owner: Codex / TL
schema: git-authority-observation.v1
authority_receipt: false
observed_at_utc: 2026-07-15T16:11:24Z
machine_candidate: docs/governance/generated/git-ref-authority-candidates-exact2-v1.json
machine_candidate_sha256: 95e2f00dc08d239cfaa1b9a4e946d0886573e7daa4330a3caff38627b2a01d2f
---

# 前身Git authority観測receipt

## §0 非主張

本書はexact 2 repositoryのadvertisement A/B一致、exact OID materialize、object検査、ref-entry分母を記録する。
生成bundleは一時inspection custodyで検証しただけで、repo-owned/trusted CASへ永続化していない。
したがって`GitRefAuthorityReceiptV1`のcurrent authorityではなく、freeze分子へ算入しない。
machine candidateはexact 2件とも`candidate-ephemeral/current=false/trusted=false/coverage_credit=false`であり、
trusted storage policyの決定や権限昇格を代行しない。

## §1 観測契約

- namespace: `refs/heads/*`、`refs/tags/*`、`refs/pull/*/{head,merge}`
- canonical ref set: refname byte順の`<oid>\t<ref>\n`
- symbolic `HEAD`とannotated tag `^{}` pseudo-lineはref分母外
- advertisement A → mirror materialize → object/fsck/tag/commit/tree検査 → advertisement B
- ref-entry edge: refname、mode、type、blob OID、pathをrefname/path順で直列化
- unique path-content: mode、type、blob OID、pathを重複排除してbyte順直列化

## §2 観測値

| metric | predecessor UT | legacy HELIX |
|---|---:|---:|
| repository | `unison-ai-product/UT-TDD_AGENT-HARNESS` | `RetryYN/ai-dev-kit-vscode` |
| heads / tags / pull-head / pull-merge | 4 / 0 / 64 / 1 | 7 / 2 / 7 / 5 | （日本語の機械契約記述）
| ref count | 69 | 21 |
| unique advertised OID | 67 | 16 |
| canonical ref-set SHA-256 | `b01a2d2416bde5aa9c10e7e6ff0a6e4c0077e5e5db3d2c7205003b2033cb6803` | `146907101fcaade4e4dc9b157c814da3551d0fe603984c9acac4ca018468002d` | （日本語の機械契約記述）
| advertisement A/B | equal | equal |
| remote/local ref set | equal | equal | （日本語の機械契約記述）
| invalid materialized object | 0 | 0 |
| tag object / commit-peel success | 0 / 69 | 2 / 21 | （日本語の機械契約記述）
| unique commit / root tree | 67 / 66 | 16 / 13 | （日本語の機械契約記述）
| ref-entry edge count | 106,347 | 38,929 | （日本語の機械契約記述）
| ref-entry edge SHA-256 | `0ddd9d715bf8ee6661a5245b8dad93f64a1aba041344af6827d0e308fc9a7a0a` | `27fd33060bce14509a0847e1ba8927a2dbff75bf5fba60e2cfb4114ac1f8a7bf` | （日本語の機械契約記述）
| unique path-content count | 3,380 | 3,287 | （日本語の機械契約記述）
| unique path-content SHA-256 | `5ef844b7f55371cbf89368bf5c96032be75873b2ffc1d9c7c6db2ae930beff10` | `a85c9548ebab0d52561e1d6d937b76cb41761823827b1a0ab802eeb96ffe50f6` | （日本語の機械契約記述）
| unique blob OID | 3,314 | 3,241 |
| strict fsck / bundle verify | PASS / PASS | PASS / PASS | （日本語の機械契約記述）
| ephemeral bundle bytes | 16,937,796 | 13,819,523 |
| ephemeral bundle SHA-256 | `5243b1ae9888b2ca5ec425354300d6b8bac6dd90f31e4bdca2a169e33a54a627` | `99829b062b6d6ffd364cbe4ed781faa1d2ec27d2534e5347c76ebc4a98d6d854` |

## §2.1 machine candidate exact 2 （日本語の契約見出し）

`docs/governance/generated/git-ref-authority-candidates-exact2-v1.json`は上記bundle bytes、`git bundle verify`、
canonical ref-set digestを再演算した`GitRefAuthorityReceiptV1` **candidate** 2件である。artifact自体のSHA-256は
`95e2f00dc08d239cfaa1b9a4e946d0886573e7daa4330a3caff38627b2a01d2f`、candidate receipt digestは
UT=`9231e98b5854b03b4d10fdbcd34c197b041d07db3bb54cf0fea1565b7f4881ca`、legacy=
`85e9a072eea95f984f842c49d5c04ce626e564c96fd0afb3090222d03dd5df9e`である。

| machine metric | count |
|---|---:|
| candidate receipt | 2 |
| trusted/current receipt | 0 |
| offline capture/classification manifest generated | 0 | （日本語の機械契約記述）
| coverage credit | 0 |

ephemeral sealは観測済みだが、trusted storage policy、CAS URI、promotion receipt、raw advertisement A/B digest、
`fresh_until`、sealed mirror digestは未確定である。offline manifest recordは
`blocked-no-trusted-authority`、entry/classification count 0、digest `null`の契約候補であり、生成済みmanifestではない。

## §3 残るauthority義務

1. trusted storage policyを決定し、bundle/mirrorを認められたcontent-addressed storeへ永続化する。
2. repository identity、namespace policy version、producer version、fresh-untilをtyped receiptへ含める。
3. raw advertisement digest、tag peel、object/type/tree/reachability、bundle digestをreceipt rootへbindする。
4. current receiptからoffline capture/classification manifestを生成する。
5. PR/CI/PLAN statusをref/commitへjoinし、atomic behavior採否へ進める。
