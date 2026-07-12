---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/historical-vpair-migration-authority.md
plan: docs/plans/PLAN-L6-75-historical-vpair-migration-authority.md
---

# historical Vペア migration authority 機能設計

## 1. 目的と境界

`verification_bindings`施行前から存在するPLANの設計負債を、現行closure authorityと混同せず分類する。
施行境界は`src/lint/plan-descent.ts`の`L8_PAIR_ENFORCEMENT_DATE=2026-07-08`を単一正本とする。
pinned cutoff tree上に同一canonical pathとPLAN identityが存在するものだけをhistorical審査対象とする。
cutoff treeに存在しないPLANは、frontmatter `created`やbaseline収載の内容にかかわらず
`post_enforcement_violation`とする。`created < 2026-07-08`は補助整合検査でありprimary authorityではない。

本機能はbinding、oracle、gate、capabilityを生成しない。confirmed L6 designの存在もbinding authorityではない。
historical classificationは移行作業の優先順位を決める証跡であり、registry、closure status、approval、
`eligible`への昇格権限を持たない。

## 2. 契約

> **L6 contract marker**: `classifyHistoricalVpairMigration(input) => HistoricalVpairMigrationBundle`。
> pre: current HEADのdynamic candidate census、Git provenance、versioned grandfather baselineを入力する。
> post: 全candidateを排他的primary classへexactly-once分類し、補助tagを非排他的に付与する。
> invariant: authority非推測、件数保存、append-only review、post-date baseline拒否、promotion禁止を維持する。

### 2.1 情報源authority

- candidate集合はcurrent review-bundleから動的に取得する。357などの観測値を実装へ固定しない。
- PLAN pathはtracked canonical regular fileとし、current HEAD blob bytesとblob OIDを取得する。author/committer timeは
  監査表示に限り、cutoff authorityやprimary classificationへ使わない。
- `created`/`updated`だけで施行日前を自己申告できない。primaryのpre/post境界はpinned cutoff tree上の
  canonical pathとPLAN identityの存在だけで決める。施行日時点のGit treeに同一pathが存在し、当時blobから
  再計算したsemantic digestがbaseline pinと一致することを要求する。
- cutoff treeにpath/identityが無ければ、`created`を施行日前へbackdateしていてもpost違反を維持する。
  tree存在と`created`境界が矛盾する場合はprimary classを変えず、typed integrity findingを付けhuman reviewへ送る。
- cutoff authorityは独立review済みの`cutoff_commit_sha`、`cutoff_tree_oid`、repository identityを持つ。current HEADから
  cutoff commitへのancestor関係、commitが指すexact tree OID、各pathのblob OIDを検証する。runtimeはcommit timestamp、
  `git log --follow`、first-introduced推測からcutoff commitを探索しない。orphan/unrelated/rewritten historyはhumanへ送る。
- baseline authority正本は`config/historical-vpair-migration-authority.json`とし、strict schema version、tracked HEAD blob、
  bytes digest、cutoff commit/tree/repository identity、initial census digest、previous digest、全row digestを持つ。
  initial authorityはimmutableとし、変更はappend-only tombstone/review chainだけに許可する。
- baseline rowは`fingerprint/plan_id/reason/detail/plan_path/cutoff_blob_oid/plan_semantic_digest`をexact検証する。
  duplicate、unused、path drift、semantic drift、後日追加をfail-closeする。
- confirmed designは`docs/design/**/L6-*`のtracked blobかつfrontmatter `status: confirmed`だけを指す。
  設計存在tagには使えるが、oracle ownershipやbinding authorityには使わない。

### 2.2 primary classificationと補助tag

入力sourceはcurrent production authority runの全decisionである。admission対象は`needs_design`かつ理由が
`PLAN verification binding absent`で、canonical tracked PLANのkindが`impl`または`add-impl`であるrowだけとする。
既存bindingあり、別classification、non-impl、path/ID不一致、source欠落はtyped rejectionとして保持し、黙って除外しない。
`source_total = admitted_total + rejected_total`を必須とする。admitted rowのprimary classは次のいずれか一つとする。

| class | 条件 | 観測上限 |
|---|---|---:|
| `historical_provenance_pinned_backlog` | cutoff treeにpath/identityが存在し、baseline pin・blob・semantic digestが全て一致 | dynamic |
| `historical_unproven` | cutoff treeにpath/identityが存在するがadmissible provenanceが欠ける | dynamic |
| `post_enforcement_violation` | cutoff treeに同一path/identityが存在せずbindings欠落 | dynamic |

`forward_assisted_candidate`はprimary classではなく非排他的tagである。confirmed L6 parent、canonical L8 row、
generated test citationの候補材料が揃う場合に付けるが、PLAN ownership markerとexact bindingが無いため
自動promotionしない。観測数は再計測で増減してよい。

2026-07-12のproduction authority run（HEAD `fa3afaf1ef06778b40041d597071811695e20ca8`）では、
source 363件、admitted 357件、frontmatter日付による参考集計はpre-cutoff 340件、post-cutoff 17件である。
この値はauthorityではない監査snapshotであり、cutoff treeに基づくprimary内訳と
pinned/unproven内訳はGit provenance evaluatorの実装・独立再計算が完了するまで確定値として扱わない。

件数保存則は`pinned_backlog + unproven + post = admitted total`と`admitted + rejected = source total`である。candidate消失、重複、未分類、
説明の無い前cycle差分をfail-closeする。

### 2.3 review decisionと保存

- proposal bundleはHEAD、scope digest、baseline digest、cutoff、candidate source digestsへ束縛する。
- independent reviewerはGit provenanceとsemantic digestを再計算し、PLANごとexactly-one verdictを記録する。
- decision artifactはschema-versioned JSON、previous digest付きappend-only chainとする。worker/reviewer identity、
  review kind、task termination evidence、reviewed_at、expiryを必須にする。
- review結果はmigration backlogの分類だけを確定する。closure registry writer、auto approval、status mutationへ
  渡せる型を公開しない。

### 2.4 Forward再入場

- `historical_unproven`と`post_enforcement_violation`はForward backfillへ送る。
- `historical_provenance_pinned_backlog`も免除ではなく段階的backfill対象だが、順序上post違反を先行する。
- `forward_assisted_candidate`はL6 parent、L8 row、test citationをreview packetへ表示するだけで、
  PLAN `verification_bindings`、testのexact `[PLAN/ORACLE]` marker、typed gate/capabilityを正規工程で追加する。

## 3. 人間境界

post-dateなのにbaseline収載されたrow、Git履歴の曖昧性、semantic digest不一致、不可逆capabilityは人間判断へ送る。
release、publish、cutover、distribution、認証、決済、PII、secretをhistorical authorityで承認しない。

## 4. Vペア

正本は`docs/test-design/harness/historical-vpair-migration-authority.md`の`U-HVMA-001..012`である。
