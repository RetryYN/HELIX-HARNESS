# PHCAP-15 Deploy classification-gap research candidate

PHCAP-15（Deploy）について、旧資産明細台帳と phase/product classification bootstrap から選んだ代表7件を、source、判断、failure、consumerの証拠に分けて静的に分類する仮組みである。authority effect は `none`、`new_build_allowed` は `false` のまま保持し、要求採否、product owner、successor、現行実装、deployment、受入、consumer closureを生成しない。

作業基準は `origin/main` の `2ff4f888249b350afb624e359eaa8e3f3ea6defb` で、作業は `/home/tenni/.helix-worktrees/phcap15-deploy-gap-research` に隔離した。既存 `SCF-B-0037`（PHCAP-15 post-deployの代表3件）と重複しないよう、今回は operation document、L3 requirement、implementation source、test source、runtime-state evidence を選んだ。

## 分類の結果

PHCAP-15 の classification pool は78行である。全4,020 archive asset／disposition rowのうち、pool内の75行は `Historical`／`unresolved`、3行は要求source snapshotの `pending_human_confirmation` 系である。今回の代表は7行（78行の8.97%）だけで、残り71行を未review分母として明記する。全4,020行では3,991行が `unresolved` であり、代表調査から全量の完了は導かない。

| asset | 旧artifact／読む範囲 | 旧分類 | 現行判定 |
|---|---|---|---|
| `LEGACY-ASSET-042D2B732DC68AA7EE9A` | `.claude/agents/devops-deploy.md` §rollback／pipeline／health | operation document、PHCAP-10/15/17候補 | source presenceのみ。legacy execution／現行implementationはunknown |
| `LEGACY-ASSET-578A66F54CD01046B7BA` | `github-environment-promotion-requirements.md` §同一artifact promotion／approval／rollback | requirement、PHCAP-15/16/19候補 | L3本文は実deploymentを先取りしない。current L2との等価性・実装はunknown |
| `LEGACY-ASSET-18BB86CC5625C31430B8` | `ci-deploy-and-rollback.md` §gate／smoke／rollback／recovery | operation document、PHCAP-11/14/15/17候補 | failure条件とchecklistは結果receiptではない。現行runtime consumerはunknown |
| `LEGACY-ASSET-FA8D4E24D8399E8350F1` | `src/cli.ts:3850-3890` version-up dry-run | implementation source、PHCAP-15/16/17/19/20候補 | 旧CLI sourceの存在だけ。旧runtimeを実行しておらず現行CLI parityはunknown |
| `LEGACY-ASSET-327A88B2141C43045AF1` | `src/lint/version-up-readiness.ts:287-319,483-515,534-545` | implementation source、PHCAP-11/14/15候補 | rollback／no-prod-writeの型・必要証拠を定義するだけで、実行・passではない |
| `LEGACY-ASSET-BADD68B87BA5BE0F3906` | `tests/doctor.test.ts:609-627,1038-1075` | test source、PHCAP-11/15/17/19/20候補 | 旧testは実行していない。negative caseは観測failureやcurrent CI closureではない |
| `LEGACY-ASSET-7995556682FC5493C37E` | `.helix/audit/A-132...md:14-17,29-38` | runtime-state evidence、PHCAP-15候補 | local verification bandがproduction deploy／post-deploy observation外と明記。production outcomeはunknown |

7件すべてについて、asset dispositionは `unresolved`、`implementation_status`／`legacy_implementation_status` は `unknown`、`legacy_execution_performed` は `false`、`consumer_closure_status` は `pending`、`consumer_refs` は空、個別 decision match は0、copy/read-after matchは0だった。これは「consumerが存在しなかった」という結論ではなく、台帳でclosure evidenceが確認できないという分類である。

旧sourceに書かれたrollback trigger、health check、approval receipt、negative test、local commandは、過去の意味と境界を示す静的証拠として保持した。failure receipt、実行結果、rollback pass、現行runtime consumer、current product ownerは確認済みと扱わない。特に phase record の `degraded_to_draft` はPHCAP-15全体のinventory語彙であり、個別assetを `degraded` または `unimplemented` と判定する根拠にはしない。

## 四製品の境界

四製品は、phase poolのproduct membershipから要求リンクを推定せず、承認済みConcept／対象別L1とdraft L2／L11の責務境界候補として別々に記録した。HARNESSは工程・artifact内容・consumer条件、OSはrelease準備とartifact受渡しの統制、Webは利用者体験、Web-OSは展開先tenant／runtime／配備／監視／復旧の候補である。WebにPHCAP-15 direct refが無いことは未実装を意味しない。OSとWeb-OSのL2はdraftであり、文書の存在は実装・受入を成立させない。

## 判断・failure・consumerの残差

- `legacy-asset-decisions.jsonl` に選択7件の decision 行は無く、`legacy-asset-copy-read-after.jsonl` にも選択7件の行は無い。source snapshot preservationの3件を、今回7件の採否へ混ぜていない。
- selected failure receipt は0件。旧文書の「failureはdeployをblock」「rollback criteria」「fail-close」は、反証可能な観測receiptではなく、旧契約・test sourceの記述である。
- selected consumer refs は0件、closure pendingは7件。current productのowner、tenant／runtime scope、artifact revision、approval、read-after、handoffを閉じる証拠は未成立である。
- phase pool membershipは requirement identity、product ownership、consumer relationを生成しない。後続で意味を採否する場合は、source atom、承認済み親、pair、owner、consumer、実行境界を個別に再確認する。

旧archiveのworkflow、runtime、test、CI、hook、adapter、sourceは実行していない。`validate.py` と `selfcheck.py` は台帳・source bytes・span digest・分母・unknown境界を読み取り検査するだけで、正式設計・実装・CI・deploymentを作らない。capture scope／archive read mode、四製品のunit boundary／current evidence status、evidence gap interpretation、6文のprohibited inference、required commands／negative cases、asset別anchor件数と全階層keysetを独立に固定し、29件のnegative caseで改変を拒否する。

```text
python3 -B scaffold/phcap15-deploy-gap-research/validate.py
python3 -B scaffold/phcap15-deploy-gap-research/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

正式なPHCAP-15責務、L2／L11、L3／L10、runtime、failure／consumer contractが人間判断を経て成立した場合だけ、`SCF-B-0054` の role・obligations・consumer・oracleを正式側へ移管し、`check-replacement` → `retire`で撤去する。
