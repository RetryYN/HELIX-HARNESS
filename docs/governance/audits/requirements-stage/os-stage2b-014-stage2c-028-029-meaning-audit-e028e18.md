# HELIX-OS Stage 2b/2c 意味照合監査

監査基準は exact main `e028e18c90e83295c84d77c4829702a349bce0dc`。対象は `HELIXOS-L2-014`、`HELIXOS-L2-028`、`HELIXOS-L2-029`。read-onlyで現行6 canonical L3/L10文書、採択記録、旧sourceとpaired consumerを照合した。本文・repoは変更せず、旧runtime/test/CI/CLIは実行していない。詳細なfull SHA-256、LF込みspan SHA-256、byte数、行数は同名JSONに記録した。

## authorityと固定親

2026-09-28 PO決定記録 `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md` の対象は固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2本文全体SHA-256は `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`、L11全体SHA-256は `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`。採択集合に014/028/029が含まれる。固定L2の該当節は `governance-requirements.md:619–634`（span SHA `d93b66dc…`）と`:847–877`（`36f89f30…`）、固定L11は `governance-acceptance.md:317`（`4151a53d…`）と`:457–478`（`afc652c5…`）。省略表示のhash末尾を含む完全値はJSONを参照。

Stage2cについては `l3-l10-os-stage2c-publication-cutout-2026-10-05-f9b34ab56.json` の親別pinも読み、fixed input `f6dad…`, PO adoption `633bf12ea8f948db8ba3d6600179c4a9507377a7`、registration `MPR-RC-HELIXOS-L2-028-001` / `029-003`、対象spanを確認した。L3/L10自体は未承認候補・未実行設計である。

014には2026-10-07のPO追補 `stage-release-internal-deployment-po-decisions-2026-10-07.md` がある。追補はreleaseと内部deploymentを分け、内部deploymentへのcutoverに明示PO許可が要ると記録する。これは2026-09-28固定L2/L11本文のrevision pinと混同しない。

## 014の照合

固定L2/L11の014は、HELIX自身の段階構成を内部識別・別版管理し、必要なHARNESS packと適用される安全依存を閉じ、狭い範囲の仕事を一周させ、構成と受入証拠を再現可能なtupleに保つ。合成dataと実data/secret/credentialを分離し、prior→next移行・rollback後にも案件state/recordを維持する。自己依存、pack/stage/1.0の状態混同、owner混同、INFRASTRUCTURE-L1-023の前倒しを防ぐ。

BR本文は独立business outcome/KPI/ownerを作らずFRへ参照する。FRのAC-014-01〜11とL10 CASE-014-01〜11を全読し、次を確認した。

- AC-01の内部stage identityとpublic/product release、1.0、外部公開の分離に対し、CASE-01は正常・未見正常・4つの独立negativeを持つ。
- AC-02のHARNESS-010/011/022、条件付きINFRASTRUCTURE 017/018/019/020/022、SECURITY 005/006/008/016は、常時・operation時・選択source時・参照のみを分ける。CASE-02は適用field×statusの独立変異と、適用条件を満たすのに未適用とする逆向きnegativeを設計し、無関係機構完成を要求するfalse rejectも別case化する。
- AC-03/04はscope内仕事の各工程、tuple各field、再現性について正常・未見正常・field別negativeを持つ。AC-05のsecret-free正常・独立混入negative、AC-06のforward/cutover/rollbackとstate/record別保持、AC-07の自己依存edge別negative、AC-08〜10の境界・owner・INFRA-023不前倒し、AC-11の旧source dispositionも対応CASEで照合した。
- NFR-014-01/02はNFRV-014-01/02へtraceする。対象は固定scope/revisionのsynthetic tuple/transition attempts。2 buildと2 transition classは旧sourceと親意味に基づく比較値で、threshold/SLAではない。unknown、missing、stale、failed、stopped、censored、分母0/missingの扱いが区別され、実観測なしと分位値なしも分けている。

旧source起点はL3 crosswalkと014 source/pair監査を確認し、OPS-FR-006 / OPS-R-12（`product-lifecycle-operations-requirements.md:162–170`）、FRS-BR-008/009とdistribution L3/L10、旧stage acceptanceを照合した。release/deployment/consumerの一周とdependency closureは意味再導出、旧Module/Bundle、旧profile/CLI/schema/runtimeとCI先行利用は置換または対象外、旧CI/wait/rerun metricとCursor限定保留atomは復活させない扱いである。旧 paired sourceの実行はしていない。

**限定判定:** 指定revision上で、014の親意味から明白に欠落した機能条件やowner誤りはこの照合範囲では確認しなかった。別途、10/7 PO追補の内部deployment cutover許可がL10のsynthetic transition oracleにも適用するかは文書から確定できないため、findingではなく確認事項R1として記録する。L3/L10がこの追補を反映すべきかをRootが判断できるよう、FR-014/CASE-014-06の対象を示した。新gateを提案しない。

## 028の照合

固定L2-028:851–861は、元Workerのticket/assignmentを保ち、実際に選ばれた相談・sourceだけを条件付きで結び、実consultの認可・response・returnを同一scopeに戻す。常時必須のticket/revision/owner、assignment、budget/deadline/stop、HARNESS duty、該当するSECURITY authority/制約とINFRA resourceを、source状態・版込みで確認する。選択sourceにはidentity/revision/provenance/permission/relevance/scope/constraintsを要求する。未選択sourceは実行依存にしない。各subtaskは親ticket/scope/dependency/acceptance/stopを保持し、詰まり・未完・停止を019に残す。

FR-028とAC-01/02/03/04/05/06/07、FV-028-01〜04、05、06a–e、07a–c、03a–rを全読した。通常のnon-consult CASE-02, 02a/bとhandoff CASE-05が相談sourceの義務を通常作業へ誤適用しない。実consultのrequest/response/return, reviewer independence, budget/deadline/stop, source permission/revision/scope, subtask binding, unknown oracle/owner-returnを別CASEで照合する。NFR-028-01/NFRV-028-01は選択・認可済consult attemptだけを主母集団にし、拒否は別適格性観測、認可後dispatch前停止はunfinished denominator member、分母0/missingは比率なしとする。

旧source crosswalkからL00–L06 support flow (`:148–166`), pillar FR (`:224–235`) とpaired acceptance (`L3-pillar-acceptance-test-design.md:104`), L5/L6 lifecycle, resident-lane requirements/acceptance, worker-budget design/testを実読した。相談・回答を元Workerへ戻す、役割分離、source来歴、範囲/停止条件、未完義務とpaired normal/failure oracleを意味再導出し、旧agent runtime/state schema, provider/lane, fixed capacity/cycle, CLI/test実装を置換・非実行としている。

**Finding F1（oracle/NFR censusのfield網羅不足候補）:** 固定L2:857とFR:60には選択sourceの全field（identity/revision/provenance/permission/relevance/scope/constraints）がある。現CASEの単独source mutationsはpermission（03b）、revision（03o）、scope（03p）、source/consult receipt欠落（03q）を明記するが、identity、provenance、relevance、constraintsだけを変異する独立fixtureは見当たらない。さらにNFR-028-01/NFRV-028-01のreceipt-complete field listにはsource provenance/constraintsが列挙されない。該当fieldの欠落があってもNFR候補の完結chainに計数され得る。これはFRの義務自体の欠落ではなく、L10の単独negativeと計測field censusの限定不足である。最小補強は既存selected-source CASE群で4項目を各一変異とし、NFRの同じnumerator/completeness censusへ列挙すること。既存source owner/SECURITYへ戻す。新owner/thresholdは不要。

## 029の照合

固定L2-029:867–877はINTELLIGENCE proposal、OS-028 connection、OS-029 compositeを別identityとし、実作業・HARNESS oracle/result・current HEAD/base/scopeへ束縛された独立review・owner receipt・失敗時の元Worker再作業を一つの因果traceにする。consult receiptは実相談を選んだrunだけに必要。support source選択時はidentity/version/scope/provenance/permissionと段階別の支援method/consult/repairを記録する。unknown/missing/conflict/staleは成功表示にせず、分母や測定も未知を成功扱いしない。

FR-029のAC-01〜06とCASE-029-01/07/02/03/04a–l/05/06a–eを全読した。support選択・無選択、consult選択・無選択を分離し、作業前proposalと実consult、実行結果、current independent review、HARNESS stage/利用者acceptanceを分ける。old HEAD receipt流用、consultant/author review、CI green=Accepted、proposal/handoff-only completion、実consult receipt欠落、選択しないconsult receiptの要求を独立反例にしている。NFR-029-01/02は開始済composite attemptを母集団とし、proposal/diff/optional consult/result/review/owner/repair/unfinishedをstage別に数える。no-consult/consult-selectedを分離し、分母0/missing、failure/stopped/partial、時間・費用の有効標本とunknownを別扱いにする。

旧source crosswalkでは028と共通の旧L3/acceptance/lifecycle/budgetに加え、旧L5 integration/L6 unit test designをpaired consumerとして読み、failure-return, actor separation, test/review pairingの保持と旧test/runtime IDの非移植を確認した。

**Finding F2（composite NFR censusのselected-support field列挙不足候補）:** 固定L2:873はsupport sourceを選ぶ場合identity/version/scope/provenance/permissionの段階別保持を求める。FR-029とnormal CASEはsource revisionを束ねるが、pre-work support/no-consult traceでこれらのfieldを個別に照合するCASEがない。NFR-029-01はstarted composite denominatorにproposal等を含めるがselected-support source fieldsをreceipt-complete項目として列挙しない。NFR-028-01はactual consult attemptだけを対象にするため、pre-work support/no-consultを補わない。source field欠落がcomposite censusに現れない可能性がある。F1と重なるsource fieldsは整理し、既存CASE/NFRのno-consult support armへ限定して同じfield bindingを足す候補である。意味・owner・閾値変更ではない。

## 対象文書・監査範囲

6本文すべてについてexact-main full-file SHAと親Stage全体または対象Sectionのspan SHAをJSONに記録した。Stage 2b/2cの見出しを含む隣接行も読んだ。functional-verificationの014 CASE群は`:1–78`、028/029群は`:79–204`、対応表は`:205–210`を照合した。BR/NFR/functionalの他Stage部分は本文背景を除き全面意味監査していない。

旧sourceの full SHA/span SHA、decision record、publication cutout JSONも同JSONにpinした。これは文書上の意味照合であり、全旧asset consumer網羅、実装の動作、CASE実行、L3承認、独立review、274親全体の完了を意味しない。

## 残る確認事項

1. F1/F2の限定CASE/NFR追補をRootが採用するか。
2. R1の10/7 PO追補における内部deployment/cutover許可の適用範囲。
3. 他Stage・他親・全274親の同深度意味監査は未実施。
