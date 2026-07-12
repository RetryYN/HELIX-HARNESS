---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-73-closure-authority-backfill.md
---

# closure authority backfill 機能設計

## 1. 目的と現状

`closure authority-materialize`をproductionで実行可能にするため、`close_ready`候補のauthorityを
設計・テスト設計・実testのVペアから明示的に構築する。現行mainの実測では候補361件すべてが
`human_only`であり、安全に一意自動backfillできる候補は0件である。既存`green_commands` 1582件は
実行証跡であって、PLAN単位のoracle/gate/capability authorityへ転用しない。

本機能は曖昧な候補を埋める生成器ではない。機械提案、独立review、repo-owned registry適用、
再分類を分離し、根拠の無いPLANは`human_only`または`invalid`のまま維持する。

## 2. 契約

> **L6 contract marker**: `buildClosureAuthorityBackfill(input) => ClosureAuthorityBackfillBundle`。
> 事前条件: cleanなcurrent main HEAD、persistentなharness.db、canonicalなempty/partial registry、exactなreview-bundle scope。
> post: candidateごとの根拠と分類を含む非適用bundleを生成し、approved rowだけをatomic applyできる。
> invariant: `U-CABF-001..010`、authority非推測、1 PLAN 1 decision、current HEAD CAS、human境界を維持する。

### 2.1 authority source hierarchy（authority情報源階層）

候補PLANごとに次の三者が同じoracle IDへ一意に結合する場合だけbindingを提案する。

1. PLANの`verification_bindings.parent_design`と`oracle_id`。
2. canonical L8 test-design rowのoracle IDとtest path。
3. 実test fileをVitest collectして得たtest fullName内のexact PLAN IDとoracle citation。

三者のいずれかが欠落、複数、prefix collision、test path drift、別PLAN ownership、design statusが
canonical enum `confirmed`以外なら
bindingを提案しない。本文、review prose、green command、ファイル名の類似だけからoracleを生成しない。

test pathはrepo配下のcanonical realpathかつnon-symlinkに限定する。収集済みVitest fullNameに許可構文
`[<PLAN-ID>/<ORACLE-ID>]`がexactly-one存在することを要求し、comment-only、`skip`、`todo`、重複fullName、
別PLAN marker、未収集testを拒否する。

required gateの正本はconfirmed親設計のtyped closure authority blockを第一、PLAN frontmatterの同型blockを
第二とする。両方に存在する場合はnormalized valueが完全一致する場合だけ許可し、矛盾は`invalid`とする。
既存registry rowは検証対象であってbackfill sourceにしない。gate IDとcanonical command IDはCLI allowlistとexact一致する
場合だけ提案する。capabilityも同じauthority block内のtyped valueだけを採用し、未知・不可逆・外部publish・cutover・認証・
秘密情報・PII・paymentを含む場合は`human_only`とする。既定capabilityの一括注入は禁止する。
proposalは採用fieldごとにsource kind、canonical path、field pointer、bytes digestを保持する。

### 2.2 decision bundle（判定bundle）

bundleはcurrent HEAD、registry digest、review-bundle scope digestへ束縛し、PLANごとに次を保持する。

- `eligible_proposal`: 三者一意join、typed gate、reversible capability、source digestが揃う。
- `needs_design`: parent designまたはL8 oracleが欠落する。
- `needs_test_citation`: test fileのPLAN/oracle exact citationが欠落または曖昧である。
- `needs_gate_authority`: required gateのtyped authorityが欠落する。
- `human_only`: 不可逆または人間判断capabilityである。
- `invalid`: source drift、重複ownership、schema不正、scope/CAS不一致である。

各decisionは根拠path/digest、検出理由、必要なForward/Reverse actionを持つ。bundle生成はread-onlyで、
registry、PLAN、test、DBを書き換えない。

### 2.3 independent reviewとapply

apply対象は`eligible_proposal`かつ独立review verdictが`approve`のrowだけとする。reviewはproposal digest、
PLAN bytes、design/L8/test bytes、typed gate/capabilityを再計算し、worker自己申告を信用しない。
reviewerとworkerが同一runtimeの場合は`intra_runtime_subagent`を記録する。正規review receiptはschema version、
receipt ID、worker/reviewer identity、review kind、reviewed_at、expiry、HEAD、scope/registry/proposal digestを保持し、
再計算結果digest、各proposalのexactly-one verdictを持つappend-only artifactとする。workerとreviewer identityは
異なることを必須とし、同一runtimeではsubagent task identityと終了evidenceを要求する。caller suppliedな
`approve`文字列、重複、期限切れ、digest不一致receiptはauthorityとして受理しない。receipt TTLは生成時から
最大1時間とし、上限超過のexpiryをschemaで拒否する。

applyはcanonical governance mutation lockをatomic directory claimする。owner PID、process birth identity、nonceを
検証し、live owner、PID再利用、torn/symlink lock、異owner releaseをfail-closeする。materializer readerはregistry
generation digestをrunへ束縛し、世代変更時は再読込または拒否する。2 writerが同じbefore digestを使う場合は
exactly-oneだけをcommitできる。

lock内でcurrent HEAD・registry before digest・全proposal/review digestを再検証する。prospective registryをmemoryと
temp上でhard gate・全361件再分類し、成功後にbefore bytes、transaction journal、temp digestをfsyncする。
temp rename、parent directory fsync、committed marker fsync、post verifyの順で一括適用する。起動時recoveryは
journal phaseとactual bytesを照合し、commit marker以前またはpost verify失敗ならbefore bytesをatomic復元し、
marker以後はcommitted bytesを検証して完結させる。Windowsでdirectory durabilityを証明できないruntimeはapplyを
明示的なportability errorで拒否し、bundle/reviewのread-only操作だけを許可する。部分適用、caller path override、
既存row上書き、unknown field、重複PLAN、source digest driftを拒否する。
apply後も件数保存則、提案対象の`eligible`化、非対象不変を確認する。closure statusやapprovalは変更しない。

### 2.4 incremental convergence（段階的収束）

361件を一括推測しない。最大100件のwindowでbundleを生成し、根拠が揃ったsliceだけをreview/applyする。
未解決rowはreason別backlogへ残し、設計欠落はL6、test-design欠落はL8、test citation欠落はL7の正規工程へ
戻す。bundle、review receipt、cycle ledgerの正本はrepo-owned
`.helix/evidence/closure-authority-backfill/`配下のschema-versioned canonical JSONとし、content digestと
previous-cycle digestを持つappend-only artifactにする。transaction journalは同配下`transactions/`へ置き、
registry commit markerの後にcycle recordを追記する。追記失敗時はregistry generationから決定論的に再生成し、
同一cycle ID/digestならidempotent、相違ならfail-closeする。各cycleで
`eligible / needs_* / human_only / invalid`件数と前cycle差分を保存し、件数が説明なく減る、
candidateが消える、同一PLANが複数分類される場合はfail-closeする。

## 3. 非目標

- 1582件のgreen commandからoracleやgateを推測しない。
- 361件へ同じbinding、gate、capabilityを一括注入しない。
- human/action-binding approval、不可逆cutover、external publishを自動化しない。
- 本backfillだけを根拠にclosure statusを変更しない。

## 4. Vペア

`docs/test-design/harness/L8-unit-test-design.md`の`U-CABF-001..010`を正本oracleとする。
