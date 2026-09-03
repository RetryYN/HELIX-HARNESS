---
title: "GitHub cross-review admission 詳細設計"
canonical_layer_scheme: L1-L12
layer: L5
paired_layer: L8
status: draft
plan: docs/plans/PLAN-RECOVERY-40-github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
related_l3: docs/design/helix/L3-requirements/github-merge-admission-requirements.md
behavior_contract_id: GITHUB-CROSS-REVIEW-ADMISSION-001
responsibility_owner: github-cross-review-admission
---

# GitHub cross-review admission 詳細設計

## 1. 判定境界

`evaluateGitHubCrossReviewAdmission` はGitHub APIやDBを直接呼ばず、current PR、comment、required CI run、
review packet、current logical DB receiptを入力snapshotとして受け取るpure evaluatorとする。Draftはfull CIを
先行させるためreview admissionだけをdeferし、Readyではexactly oneのcanonical receiptを必須とする。

current Readyでの受理対象はClaude/Codex receipt v4またはprovider-neutral receipt v4だけとする。Claude receipt v3とv2はhistorical
closureの読取互換に限定し、旧builderと同じ意味検証を再実行した後もcurrent receiptへ昇格しない。Kimi bootstrapのprovider-neutral receipt v4は
現行経路として扱うが、Claude/Codex receiptと同じgeneration identityを要求する設計変更は本sliceの対象外とする。
文字列marker、PLAN内review evidence、自己申告runtime identityをcanonical receiptへ昇格しない。provider-neutral経路ではKimi admission、
独立Claude verifier comment、fallback failure、lease、review packet、output/findings、current logical DB receiptを
sealed provenanceとして照合する。

## 2. exact bindingと判定順序

Ready admissionは次の順序でfail-closeする。

1. PRが`OPEN`であり、receiptがcanonical schemaとしてdecodeできる。
2. repository、PR number、candidate HEAD、approve、blocker 0、runtime独立性が一致する。

   runtime独立性は**向きではなく差**で判定する（`authorRuntime !== reviewerRuntime`）。author=codex /
   reviewer=claudeとauthor=claude / reviewer=codexを同じcanonical経路で受理し、どちらかを既定の向きとして
   固定しない。canonical receiptが識別するruntimeは`claude`と`codex`に限り、未知識別子は
   `runtime_identity_invalid`で拒否する。

   current v4のruntime/model独立性のauthorityは`claude-pr-convergence.ts`の共通pair coreである。v4は
   `buildClaudePrReviewReceipt`とmerge判定が、runtime差、`checkCrossAgentModelPair`、runtime↔model provider対応を
   同じ判定でfail-closeする。v4は`validateProviderNeutralReviewReceipt`が
   `declared_author_runtime === reviewer_runtime`で、それぞれdecode前にfail-closeする。したがって
   `checkCrossAgentModelPair`がsame model/providerを拒否する。v2はhistorical decoderだけに残り、
   Ready admissionではcanonical receiptへ昇格せず`current_head_review_receipt_missing`になる。
   admission側に独立性の別実装は置かない（PLAN-RECOVERY-41、`U-GCRA-006`〜`U-GCRA-008`）。

   申告`authorRuntime`は自己申告のままcanonicalへ昇格しない。receipt seal（`github pr-review-receipt`）と
   merge判定（`pr-merge-reviewed`のcanonical v4経路）は、PR head commitsのcommit messageから実測した
   authoring runtime（merge commit＝parent 2個以上を除く実装commitに対する行頭
   `Co-Authored-By: Claude` trailerの整合。同一行内・大文字小文字不問）と申告値を突き合わせ、不一致`author_runtime_attestation_mismatch`、
   evidence空`author_runtime_evidence_missing`、実装commit間のtrailer混在`author_runtime_evidence_mixed`、
   API取得失敗またはbase64不正evidence`author_runtime_evidence_unavailable`でfail-closeする。
   本attestationはcryptographic identityの証明ではなく自己整合検査であり、捏造の攻撃面を
   申告1フィールドからPR全commitの履歴改変へ引き上げる（限界はPLAN-RECOVERY-42 §2に記録）。
   実測coreは`claude-pr-convergence.ts`のpure function（`measuredAuthorRuntimeFromCommits`／
   `authorRuntimeAttestationFailure`／`parseAuthorRuntimeEvidence`）が所有する
   （PLAN-RECOVERY-42、Issue #534、`U-CPRCONV-012`〜`U-CPRCONV-017`）。
   merge commitの判定はcommit subjectではなくparent数で行う。`Merge `始まりのsubjectを条件にすると、
   任意subjectを与えたmain同期merge（例: `chore(memory): sync ... with latest main`）を実装commitと
   誤認し、trailer無しとして`author_runtime_evidence_mixed`へ落とすfalse fail-closeになる
   （PR #517で実測、PLAN-RECOVERY-43）。evidence行は`<parent数>:<bot flag>:<base64 message>`であり（PLAN-RECOVERY-51で拡張）、
   parent数はcommit graphの事実としてsubject表記の影響を受けない。

   parent数判定でfalse positiveを除いてもなお、実測mixedは残る。`CLAUDE.md`「Hybrid 多ランタイム
   commit 協調」は相手runtimeのcommitの上へ成果を積むこと（stack／rebase）を必須運用として規定しており、
   両runtimeの実装commit（parent 1）が同居するブランチは規定運用の正常な帰結である。そこで実測mixedに
   対しては`authorRuntime: "mixed"`の正直な申告だけをsealで受理し（単一runtime申告は従来どおり
   `author_runtime_evidence_mixed`、単一runtime実測に対するmixed申告は
   `author_runtime_attestation_mismatch`で拒否）、admissionでは受理条件を緩めるのではなく分割する。
   mixed receiptは「相手runtimeが書いた分を自分がレビューした」証跡と定義し、独立性のauthorityを
   `authorModel`のruntimeが`reviewerRuntime`と異なることに置く。Ready条件は、現HEADに対する
   valid receiptがすべてmixed申告であり、かつ`reviewerRuntime`がclaudeとcodexの両方を覆うこと。
   片方のみ、同一reviewerの2通、mixedと単一申告の混在は`mixed_author_dual_review_incomplete`で
   fail-closeする。受理receiptが2通になるため`receipt_digest`はreceipt digest群をcanonical順に
   束ねた1値へ確定させる。単一runtime authored PRの複数receiptは従来どおり`review_receipt_conflict`
   のままであり緩和しない（PLAN-RECOVERY-44、Issue #539、`U-CPRCONV-015b`／`U-CPRCONV-015c`／`U-GCRA-011`）。

   実測値域にはさらに`external`（bot著）がある。「trailer無し＝Codexが書いた」という推定は、
   trailerを付けない第三者author（Dependabot等）をCodex著と誤帰属していた（PR #384で実測、Issue #553）。
   evidence行を`<parent数>:<bot flag>:<base64 message>`の3フィールドへ拡張し、GitHub APIの
   `author.type == "Bot"`を第2フィールドへ射影する（`.author`がnullの場合は非bot側へ倒す）。
   旧2フィールド形式はdual-readせずfail-closeする。query側だけ巻き戻ったとき全commitが非botとして
   静かに通り、誤帰属が復活するためである。判定は「実装commitの母集団が全件bot著かつtrailer 0件」の
   ときだけ`external`とし、botとHELIX runtime commitの混在は従来判定（claude／codex／mixed）へ落とす
   （混在部分の独立レビューは依然として要求されるため保守側へ倒す）。同条件はbot著PRにしか当たらないため、bot著でない
   既存PRの測定結果は変わらない（bot著PRである#384は`codex`から`external`へ変わる。これがIssue #553の
   是正そのものである）。`external`著PRには守るべきHELIX著者runtimeが存在しないので、
   admissionは`mixed`のdual-receipt経路ではなく単一receipt経路で評価し、reviewerはclaude／codexの
   どちらでもよい（複数receiptは従来どおり`review_receipt_conflict`）。`reviewPairFailure`はauthor側の
   runtime／model束縛を適用せず、reviewer側の束縛（`reviewerRuntime`がclaude／codex、
   `reviewerModel`のproviderが`reviewerRuntime`と一致）は一切緩めない。`authorModel`はaudit目的で
   bot identity（例`dependabot[bot]`）を記録するだけでmodel idとして解釈しないが、空は受理しない。
   dispatch側の`claudeReviewDispatchAllowed`と受信側のcanonical request判定は同じ値域を持たせる
   （PLAN-RECOVERY-51、Issue #553、`U-CPRCONV-EXT-001`〜`U-CPRCONV-EXT-005`／`U-GCRA-EXT-001`）。
3. required CI runが`harness-check`、`.github/workflows/harness-check.yml`、`pull_request`、同一PR、同一HEAD、
   completed successであり、CI完了時刻がreview時刻以前である。
4. review commentの`created_at <= updated_at`、`reviewed_at <= updated_at`を満たす。
5. Kimi経路ではadmission verifierのreview時刻、comment更新時刻、admission発行時刻を順序照合する。
6. Ready時にrepository-owned doctorが生成した49 field exactのlogical DB receiptについて、workspace cleanと
   convergence式を再検証する。Claude/Codex v4経路はreceipt／projection／replay projection／checkpoint／replay checkpointの
   5 digestをreceipt fieldへexact束縛し、Kimi経路はprovenanceへsealされたlogical DB receiptとcanonical JSONで完全一致させる。
7. valid receiptが0件または2件以上なら拒否し、1件だけならreceipt digestを返す。

## 3.2 receipt schema境界

Claude/Codex v4 receiptのproducerはschemaが認めたinput fieldのexact setを入口で検査し、unknown
fieldを`receipt_input_fields_invalid`で拒否する。出力はinput objectをspreadせず、認めたfieldだけを
明示的にprojectionする。current Claude receiptは`schemaVersion`、provider-neutral receiptは
`schema_version`と`schemaVersion`のexact valueで識別し、単なるproperty presenceをdiscriminatorに
してはならない。current Claude receiptにprovider-neutral fieldやその他unknown fieldが混入した場合は
`receipt_fields_invalid`で拒否し、別schemaとして再解釈しない。

`summary`は任意のcurrent fieldとして非空文字列だけを許可する。過去receiptは履歴として保持するが、
unknown fieldを削ってcurrent receiptへ再封緘したものとして扱わない。

## 3.1 CI証跡生成世代の識別子

Claude/Codex v4 receiptは、repository、PR、head SHA、reviewer runtimeに加えて、terminalな
`harness-check`のrun ID・attempt・conclusionを `ciEvidenceGeneration` として束縛する。
同一HEADでもCI rerunは別generationであり、旧receiptを再利用してはならない。新generationのreceiptは
直前generationのreceipt IDを `supersedesReceiptId` に記録し、同一generationの再sealは既存receiptと
commentを再利用する。非terminal、run/attempt/conclusion不一致、PR/head/repository不一致はfail-closeする。
v3は読み取り専用デコードだけを許可し、現行Ready受理・merge受理・終端memory投影の正本へ
再出力しない。世代の実在はGitHub `pull_request` の `harness-check` 終端runを再取得して確認する。

明示merge後はPR APIが返すmerge commitをread-afterし、candidate API response SHAがreviewed HEADと一致し、同HEADが
merge parentであり、candidate commit treeとmerge commit treeが同一である場合だけmerge操作を成功扱いにする。
状態またはcommit取得不能、別SHA／parent／treeは`merged_unverified`とする。verified／failed双方について、repository、
対象PR、candidate HEAD/tree、申告値と実測値のmerge commit、merge tree、parent完全集合、観測state/time、review receipt
digest、outcome、reasonを`helix-reviewed-merge-read-after-receipt.v1`へsealし、Git共通runtimeへ0600・immutable保存する。
永続化に失敗した操作は`ok=true`にしない。

Actions runとcommentは全pageを取得する。workflow adapterはPR eventで`pull_request.head.sha`をcheckoutし、
merge refのSHAをreview・DB・test基準へ混在させない。push eventでは`github.sha`へfallbackする。

## 3. 型付きfailure

| reason code | 条件 | L8 oracle |
|---|---|---|
| `pr_not_open` | PRがOPENでない | `U-GCRA-004` |
| `current_head_review_receipt_missing` | Readyにcanonical receiptがない | `U-GCRA-002` |
| `review_receipt_invalid_or_stale` | schema、HEAD、CI、時系列、DB、provenanceのいずれかが不一致 | `U-GCRA-001c`、`U-GCRA-001d`、`U-GCRA-003` |
| `review_receipt_conflict` | valid receiptが複数存在する（単一runtime authored PR） | `U-GCRA-004` |
| `mixed_author_dual_review_incomplete` | mixed著者PRで両runtimeの現HEAD receiptが揃っていない | `U-GCRA-011` |

GitHub API失敗、pagination失敗、doctor失敗、JSON decode失敗はadapterの非0終了としてrequired jobへ伝播し、
pure evaluatorの成功へ読み替えない。

### 3.1 mixed receipt永続化identity

mixed authorshipは同一PR/HEADにClaudeとCodexのreceiptを各1件要求する。immutable ACK pathは
`repository + prNumber + headSha + reviewerRuntime`で識別し、異なるreviewerの正規2件を共存させる。
同一reviewerの異内容receiptは`review_receipt_conflict`として上書きせず拒否する。旧3要素filenameは
historical receiptとして明示pathから引き続き読めるが、新規writeには使用しない。
CLI adapterは外部commentを投稿する前に同じreviewer別slotが未占有であることを検査し、既知の
persist conflictをcomment作成後の部分成功へ持ち込まない。

## 4. 変更境界

新しいworkflow、service、DB table、review ledgerは作らない。既存`harness-check`、Claude/Kimi receipt validator、
logical DB doctorを再利用する。branch protection、release、GitHub環境設定の変更は本責務に含めない。

## 5. Design Reality Binding契約

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": ["pr_not_open", "current_head_review_receipt_missing", "review_receipt_invalid_or_stale", "review_receipt_conflict", "mixed_author_dual_review_incomplete", "merge_not_observed", "observed_at_invalid", "candidate_commit_read_after_failed", "candidate_commit_mismatch", "merge_commit_mismatch", "reviewed_head_not_merge_parent", "reviewed_tree_not_merged_tree"],
  "assets": [
    { "asset_id": "github-cross-review-admission", "classification": "existing_runtime", "artifact_path": "src/runtime/github-cross-review-admission.ts", "resource_kind": "typescript_export", "resource_name": "evaluateGitHubCrossReviewAdmission", "source_digest": "sha256:47daa63f7a3f01572fa14e5e18b4b88605cc3531c172deaf17e755d62619d92d", "current_authority": true },
    { "asset_id": "github-reviewed-merge-read-after", "classification": "existing_runtime", "artifact_path": "src/runtime/github-cross-review-admission.ts", "resource_kind": "typescript_export", "resource_name": "evaluateReviewedMergeReadAfter", "source_digest": "sha256:47daa63f7a3f01572fa14e5e18b4b88605cc3531c172deaf17e755d62619d92d", "current_authority": true },
    { "asset_id": "github-reviewed-merge-receipt-persistence", "classification": "existing_runtime", "artifact_path": "src/runtime/github-cross-review-admission.ts", "resource_kind": "typescript_export", "resource_name": "persistReviewedMergeReadAfterReceipt", "source_digest": "sha256:47daa63f7a3f01572fa14e5e18b4b88605cc3531c172deaf17e755d62619d92d", "current_authority": true }
  ],
  "failure_reachability": [
    { "reason_code": "pr_not_open", "reachability_mode": "executable_oracle", "source_path": "src/runtime/github-cross-review-admission.ts", "source_symbol": "evaluateGitHubCrossReviewAdmission", "test_path": "tests/github-cross-review-admission.test.ts", "oracle_id": "U-GCRA-004", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "pr_not_open", "mutation": { "remove_post_resolution_check": "if (input.state !== \"OPEN\") {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-024", "execution_helper": "executeGitHubCrossReviewMutationOracle" } },
    { "reason_code": "current_head_review_receipt_missing", "reachability_mode": "executable_oracle", "source_path": "src/runtime/github-cross-review-admission.ts", "source_symbol": "evaluateGitHubCrossReviewAdmission", "test_path": "tests/github-cross-review-admission.test.ts", "oracle_id": "U-GCRA-002", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "current_head_review_receipt_missing", "mutation": { "remove_post_resolution_check": "if (candidates.length === 0) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-024", "execution_helper": "executeGitHubCrossReviewMutationOracle" } },
    { "reason_code": "review_receipt_invalid_or_stale", "reachability_mode": "executable_oracle", "source_path": "src/runtime/github-cross-review-admission.ts", "source_symbol": "evaluateGitHubCrossReviewAdmission", "test_path": "tests/github-cross-review-admission.test.ts", "oracle_id": "U-GCRA-003", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "review_receipt_invalid_or_stale", "mutation": { "remove_post_resolution_check": "if (valid.length !== 1) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-024", "execution_helper": "executeGitHubCrossReviewMutationOracle" } },
    { "reason_code": "review_receipt_conflict", "reachability_mode": "executable_oracle", "source_path": "src/runtime/github-cross-review-admission.ts", "source_symbol": "evaluateGitHubCrossReviewAdmission", "test_path": "tests/github-cross-review-admission.test.ts", "oracle_id": "U-GCRA-004", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "review_receipt_conflict", "mutation": { "remove_post_resolution_check": "if (valid.length !== 1) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-024", "execution_helper": "executeGitHubCrossReviewMutationOracle" } },
    { "reason_code": "mixed_author_dual_review_incomplete", "reachability_mode": "executable_oracle", "source_path": "src/runtime/github-cross-review-admission.ts", "source_symbol": "evaluateGitHubCrossReviewAdmission", "test_path": "tests/github-cross-review-admission.test.ts", "oracle_id": "U-GCRA-011", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "mixed_author_dual_review_incomplete", "mutation": { "remove_post_resolution_check": "    if (!complete) {", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-024", "execution_helper": "executeGitHubCrossReviewMutationOracle" } },
    { "reason_code": "merge_not_observed", "reachability_mode": "executable_oracle", "source_path": "src/runtime/github-cross-review-admission.ts", "source_symbol": "evaluateReviewedMergeReadAfter", "test_path": "tests/github-cross-review-admission.test.ts", "oracle_id": "U-GCRA-005", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "merge_not_observed", "mutation": { "remove_post_resolution_check": "if (input.pr_state !== \"MERGED\") reasons.push(\"merge_not_observed\");", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-024", "execution_helper": "executeGitHubCrossReviewMutationOracle" } },
    { "reason_code": "observed_at_invalid", "reachability_mode": "executable_oracle", "source_path": "src/runtime/github-cross-review-admission.ts", "source_symbol": "evaluateReviewedMergeReadAfter", "test_path": "tests/github-cross-review-admission.test.ts", "oracle_id": "U-GCRA-005", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "observed_at_invalid", "mutation": { "remove_post_resolution_check": "if (!Number.isFinite(Date.parse(input.observed_at))) reasons.push(\"observed_at_invalid\");", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-024", "execution_helper": "executeGitHubCrossReviewMutationOracle" } },
    { "reason_code": "candidate_commit_read_after_failed", "reachability_mode": "executable_oracle", "source_path": "src/runtime/github-cross-review-admission.ts", "source_symbol": "evaluateReviewedMergeReadAfter", "test_path": "tests/github-cross-review-admission.test.ts", "oracle_id": "U-GCRA-005a", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "candidate_commit_read_after_failed", "mutation": { "remove_post_resolution_check": "reasons.push(\"candidate_commit_read_after_failed\");", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-024", "execution_helper": "executeGitHubCrossReviewMutationOracle" } },
    { "reason_code": "candidate_commit_mismatch", "reachability_mode": "executable_oracle", "source_path": "src/runtime/github-cross-review-admission.ts", "source_symbol": "evaluateReviewedMergeReadAfter", "test_path": "tests/github-cross-review-admission.test.ts", "oracle_id": "U-GCRA-005", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "candidate_commit_mismatch", "mutation": { "remove_post_resolution_check": "reasons.push(\"candidate_commit_mismatch\");", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-024", "execution_helper": "executeGitHubCrossReviewMutationOracle" } },
    { "reason_code": "merge_commit_mismatch", "reachability_mode": "executable_oracle", "source_path": "src/runtime/github-cross-review-admission.ts", "source_symbol": "evaluateReviewedMergeReadAfter", "test_path": "tests/github-cross-review-admission.test.ts", "oracle_id": "U-GCRA-005", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "merge_commit_mismatch", "mutation": { "remove_post_resolution_check": "reasons.push(\"merge_commit_mismatch\");", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-024", "execution_helper": "executeGitHubCrossReviewMutationOracle" } },
    { "reason_code": "reviewed_head_not_merge_parent", "reachability_mode": "executable_oracle", "source_path": "src/runtime/github-cross-review-admission.ts", "source_symbol": "evaluateReviewedMergeReadAfter", "test_path": "tests/github-cross-review-admission.test.ts", "oracle_id": "U-GCRA-005", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "reviewed_head_not_merge_parent", "mutation": { "remove_post_resolution_check": "reasons.push(\"reviewed_head_not_merge_parent\");", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-024", "execution_helper": "executeGitHubCrossReviewMutationOracle" } },
    { "reason_code": "reviewed_tree_not_merged_tree", "reachability_mode": "executable_oracle", "source_path": "src/runtime/github-cross-review-admission.ts", "source_symbol": "evaluateReviewedMergeReadAfter", "test_path": "tests/github-cross-review-admission.test.ts", "oracle_id": "U-GCRA-005", "identity_fields": [], "post_resolution_checks": [], "fixture": { "registry": [], "request": {} }, "expected_reason": "reviewed_tree_not_merged_tree", "mutation": { "remove_post_resolution_check": "reasons.push(\"reviewed_tree_not_merged_tree\");", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-024", "execution_helper": "executeGitHubCrossReviewMutationOracle" } }
  ]
}
```
