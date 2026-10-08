---
title: "HELIX-OS Stage 1 local CI 基本設計"
status: design_pair_defined
owner: HELIX-OS
paired_l9: ../L9-integration-verification/local-ci-integration-verification.md
stage: 1
version_target: 1.0
---

# HELIX-OS Stage 1 local CI 基本設計

本書は#2716のStage 1独立解禁scopeとして、開発repositoryの全量local static CIとGitHub Actionsによるmerge単位の最小照合を設計する。`HELIXOS-L2-020`（Stage 2a）と`HARNESS-L2-036`（Stage 3）の承認済みACを契約親として参照するが、Stage 1依存親や新しいrequirement/ACをここから生成しない。CI実装・実行結果・merge許可を本設計から生成しない。

## 1. 由来、authority、配置

この設計のL4/L9親は、承認済み`HELIXOS-L2-020`の`AC-OS-020-01..03`と、`HARNESS-L2-036`の`AC-HARNESS-L3-036-02`が定めるselected local/CI gate契約である。L2-020はStage 2aの親、HARNESS-036はStage 3の親であり、相互にStage・要求の採択を広げない。HARNESS-036の契約を開発repo local/CI間の同一contract検査に適用するが、開発repo CIの結果をHARNESS製品のL10結果にしない。

L4/L9の共通型と配置は[HARNESS common-kernel](../../helix-harness/L4-basic-design/common-kernel.md)および[repository-layout](../../helix-harness/L4-basic-design/repository-layout.md)、対のoracleは各L9 counterpartを参照する。今回の開発repository CI運転driverは既存layoutの`scaffold/local-ci/`配下と新しいScaffold Bindingへ置く。`scfctl`/`govcheck` adapter依存が残る間は正式pack登録済み・正式unit完成とは主張しない。承認済みL3から導いたHELIX-OSの正式契約を保持し、adapter移管と依存閉包後の実装移管先候補を`helix/helix-os/units/os-ci-runner/`（`declaration.json`, `src`, `tests`, `fixtures`）とするが、型番登録済みとは主張しない。パック越境宣言は移管後に`declarations/helix-os/operations/`等のOS所有宣言へ置く。新しいrepository-root config/fileは設けない。

| 由来 | 起点と保持 | 変更・境界 |
|---|---|---|
| `LEGACY-ASSET-BACB1FC117A09D20F273`, `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.2.md:1446-1475` (full SHA-256 `41b38c068e91a767f964ce5ce5d7d5568c1984b3b122b808f9eff61e5a0af401`) | §6.9のlocal安価/高頻度、GitHub側はmerge単位、設計pair freezeはlocalのみを起点にする | 全量検査はlocalを主とし、GitHub Actionsをmerge単位のreceipt bindingと軽い照合へ縮小する。古い料金値、G7/G5、branch-kind、draft-skip、paths-filter、workflow/job数は採用しない。 |
| `LEGACY-ASSET-96CCD05C4CCA06F50D3D`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/technical-requirements.md:43` (full SHA-256 `3e105358418cb54af0bc2e414d0b06171715ab2a26ea3b44dd16f932bcbfef88`) | 「ローカルgate証跡→CI証跡検証→branch protection PR許可」の証拠順序 | receiptを対象HEAD/treeへ束縛して照合する。branch protection/required checkの設定変更は含めない。 |
| `LEGACY-ASSET-99C939E249CAF40935CB`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/architecture.md:186,223` (full SHA-256 `f4b9fcb98b4250879955f6eca0f2916dc1a27046820a8ad687e8f816b856bea2`) | local gateでlint等を担保し、外部CI serviceの配備を別責務にする | `bun run doctor/lint/test`はコピーせず、Bun不使用と現行checkersを使う。旧実装は実行しない。 |
| `LEGACY-ASSET-73D72E21D730270F3944`, `archive/legacy-generation-2026-09-14/root/docs/templates/github/common/harness-check.yml:1-37` (full SHA-256 `cdf434e070ffb0eb71a60fddcdbd13af5d1f4a4fd0f1823393d0169a9ee5035c`) | 旧sourceがGitHub Actionsでpush/pull_request、checkout、toolchain setup、依存導入と旧検査を結んでいた事実を変更根拠として読む | workflowは`workflow_dispatch`のみのmerge-unit verifierとして再導出する。旧trigger、Node/npm、旧CLI操作、job構成は保持せず、旧workflowは参照のみで起動しない。 |
| `LEGACY-ASSET-7AE45AD102EAB3B6D7E7`, `archive/legacy-generation-2026-09-14/root/package.json:14-27` (full SHA-256 `c7fb380791945b9c3d98f357a4ecccc8a983191adabe62ac7082a737ac6ed6ff`) | 旧package scriptsがtypecheck/lint/test等のローカル検査入口を提供していた事実を起点にする | 検査責務は固定`LC-*`契約へ保持し、npm/tsx/Bun scriptsをコピーせず、CPython standard libraryと既存checker adapterへ写す。旧scriptsは実行しない。 |
| `HELIXOS-L2-008`, `HELIXOS-L2-020` / `AC-OS-020-01..03` / `HARNESS-L2-036` / `AC-HARNESS-L3-036-02` | HARNESSが義務/contract、OSがprofile組成・実行・証拠収集。選んだ同一gate identity/content/version/settings/scopeの結果を比較する | OSがgateの意味を追加/削除しない。local-onlyの検査でGitHub側も実行/照合したと主張しない。 |

### 承認済み親本文の固定参照

以下のdecision recordが承認したcontent revisionと対象sectionを設計親として固定する。span SHA-256は各decisionの`reviewed_content_revision`における指定行bytes（LFを含む）の再計算値であり、後続mainの同名ファイルやwhole-file SHAが変わっても承認が更新されたとは扱わない。draft base `a50ce54343b19af14d91775290d26440fdb31ee1`で読んだ文脈全体のSHAは承認pinと別の観測値である。#2716のStage 1解禁recordはCI設計・構築・起動を許す判断であり、要求親を追加・変更・承認するものではない。

| 設計親 | decision record / 対象 | 固定本文path | 対象section / approved revision | 承認本文 full-file SHA-256 | draft-base contextual whole-file SHA-256（approvalではない） | raw-LF span SHA-256 |
|---|---|---|---|---|---|---|
| `HELIXOS-L2-020`、Stage 2a | `docs/governance/decisions/helix-os-stage2a-l3-l10-po-decision-2026-10-05.md`（SHA-256 `529811783824d0ffec315481b8f27b8304412a1070cb53c59ae283dc8147135f`）、`reviewed_content_revision=5ade9866f0b184e6f3da78551e123e2b33b5859c`。この表はL2-020の対象範囲だけを使い、同decisionの他7親や後続OS-018/019判断を継承しない。 | `docs/helix-os/L3-requirements/functional-requirements.md` | `AC-OS-020-01..03`、同approved revision、lines 178–186 | `ca5242813debd8ba7c253fca7eab03a33d41afd8629aa4bd49cb607358f56426` | `666200db50ea9a2e7f0d67d57496a71368e497f2fdb6e3485d4838339000b393` | `aa4d01ef980c7848675550a61efd904d84e413305a23f1b0030a26389fefc6c5` |
| 同上 | 同上 | `docs/helix-os/L10-verification/functional-verification.md` | `CASE-OS-020-01`, `AC-OS-020-02` verification negatives, `CASE-OS-020-03`、同approved revision、lines 436–495 | `a925e5c84143cecb4e479f8f5bfb36f84515cfdc69effad3192a2dcc88da427c` | `84e377c9f281b911549970cef7e11c43cfd0eeb552f6a7ae8d24ad7892e53eea` | `5292b5256fd7230490da5241da615452dac48ee5e8782767d9f502963b95a402` |
| `HARNESS-L2-036`、Stage 3 | `docs/governance/decisions/helix-harness-stage3-parent036-l3-l10-po-decision-2026-10-06.md`（SHA-256 `8b5b86962a694a509191c8a931cb41b4d6d90fb9c0010f56f9296075a8fa85df`）、`reviewed_content_revision=b45734eebb6ac9a51a3159563b18263c64acae8d`。固定L2-036は同decisionの`318ec4a04abb3c1cc17111b3d939f913facd5fd3`を参照し、他のHARNESS parentを追加しない。 | `docs/helix-harness/L3-requirements/functional-requirements.md` | `AC-HARNESS-L3-036-02`を含む承認済みStage 3 section、同approved revision、lines 576–609 | `52c4508e1132d968164817ba149b86a065774f734923179315b5139472cc6e71` | `2180967f0075f467c99a553d34f688a1fdf434703803b1a34e7e147d6a7d2df5` | `20a27c7aabff7ace0e21fea197967717d4607456d440d94d21a5a2a3d5ac60f7` |
| 同上 | 同上 | `docs/helix-harness/L10-verification/functional-verification.md` | AC-02 CASE定義、selected local/CI contract parity fixture、同approved revision、lines 1162–1194 | `cc318cd891f6a61682a9c593d65ba9da5173fdffd32b9150e752cfaea38dbbfd` | `d1c55ca4e6b432ccdc941d8d9813c88e5f33476ef2c2d55aa0bfafe549b6726f` | `488711c9cafc65c17cd9d775d506449c1091ff4c82a308f0fc9da513f45fd1c0` |

Stage 1 CI実装・起動を解禁する別判断は`docs/governance/decisions/stage1-implementation-and-ci-unlock-po-decision-2026-10-09.md`（SHA-256 `8bd88041061415390bc4f844a8bc6f255067dd212e7e8e80cefa89e7e02949a6`）の判断2である。同判断はHARNESS-L2-036/HELIXOS-L2-020の承認済み親本文を差し替えず、新しいrequirement/AC、branch-protection gate、merge admissionも生成しない。

旧NFRの作業区分と現行L3のowner区分は同一の二層ではない。①HARNESS規則/OS運転の所有分離、②selected gateのlocal/CI面の一致条件を別々に保持する。旧workflow・hook・CLI・CI state/log pathは廃止対象の参考情報に限り、実行・fallback・baselineにしない。

## 2. local CI契約

### 2.1 固定された検査集合

`compile_plan(target)`は次の全stepを毎回選択し、失敗があっても残りを実行する。path filter、段階数固定、対象なしを理由にした暗黙skipはない。

| ID | 対象 | 呼出し（shellを介さないargv） | scope |
|---|---|---|---|
| `LC-SCF-001` | 全Scaffold Binding | `python3 scaffold/tools/scfctl.py validate` | repository全体のbinding/read-only static validation。正式CIではなく暫定adapter。 |
| `LC-SCF-002` | 全未retired Scaffold Bindingのupstream revision | `python3 scaffold/tools/scfctl.py stale` | stale候補の全件照合。staleが1件以上なら既存scfctl契約どおり非zeroとなりstep `fail`。read-onlyの暫定adapter。 |
| `LC-GOV-001` | 仮governance rulebook | `python3 scaffold/governance/tools/govcheck.py` | rule atom coverage/重複/余分・candidate/file対応・生成物/上流pin照合。正式要求oracleではなく暫定adapter。 |
| `LC-DIFF-001` | exact merge-baseからtarget HEADまで | `git diff --check --no-ext-diff --no-textconv <base> <head> --` | 対象差分全体についてGitが報告するwhitespace errorと追加行のconflict markerを検査する。 |
| `LC-DESIGN-001` | 現行設計4文書とlocal-CI今回文書6件 | `verify_design_manifest(target)` | 下記のID定義/参照、source pin型、L4→L9/L5→L8/L6→L7の明示coverage manifest。 |

実装時の固定design corpusは、mainの現行4文書`docs/helix-harness/L4-basic-design/{common-kernel.md,repository-layout.md}`と`docs/helix-harness/L9-integration-verification/{common-kernel-integration-verification.md,repository-layout-integration-verification.md}`、および今回3つのV-pair PRでmainへ統合されるlocal-CI設計6文書である。6件すべてがcurrent HEADに揃うまでは`LC-DESIGN-001`をsuccessにしない。広いrepo本文をregexだけで走査して意味被覆を主張しない。scfctl/govcheckは各ツールの全既定scopeを検査し、diffcheckは指定base/head間の全差分を検査する。

### 2.2 参照manifestとreader

`DesignScopeManifest`はコード内の固定versioned constantとし、各文書について`path`, `role`, `expected_pair`, `definition_ranges`, `reference_ranges`, `source_kind`を列挙する。IDは構造的な定義域（heading ID、規則定義表のID列、fixture定義表のID列）からのみ定義として読み、他文書で出る同じtokenは参照として解決する。抽出数の一致や自由本文regexだけではcompleteを返さない。

`CoverageEdge`は`source_doc + source_contract_id`から`verification_doc + fixture_id`への明示edge。CKのL4 invariant/機構sectionは対応するL9 IV行、repository-layoutの`RL-*`/`IV-RL-*`は同じRL contract、local CIの`LC-*`/`LCI-*`はこのpairで照合する。L5 API/function contract→L8 case、L6 function→L7 unit caseも同様に明示する。各定義は1件以上の検証edgeまたは`not_exercised`理由付きでなければ不完全であり、`not_exercised`はpassに数えない。manifest自体の未知ID/孤児edge/重複定義/参照先欠落/期待型不明は不合格またはunknownとして返す。

意味検査のscope外残余はmanifestの`unsupported_items`へ明示し、non-pass dispositionと理由を保持する。項目は`U-LCI-01` 任意の自然言語本文間の意味等価性、`U-LCI-02` 固定corpus外文書の意味被覆、`U-LCI-03` digestだけからの実行者/issuer真正性、`U-LCI-04` 選択済み`LC-DIFF-001`を超えるGitHub側でのlocal-only検査同等性である。これら4件は必須検査scope外の残余であり、明示記録されていても検査済みを意味しない。inventoryが構造的に完全なら、4件の未検証状態を別fieldに保持したまま固定5-step CIをsuccessにできる。必須scope内でrequired ID/pin/edgeが欠落・unsupportedなら`LC-DESIGN-001`はsuccessにしない。新しいID/範囲はunsupportedまたはunknownとして列挙し、勝手に既知契約へ解釈しない。

`SourceSnapshotReader`は固定`target_head`とGit treeを入力に、`git ls-tree`/`git cat-file blob`から宣言pathのbytesを読み、同一tree digestを照合する。実行時`helix/` codeから`docs/` pathを直接読む設計にしない（RL-D3）。既存scfctl/govcheckは暫定adapterとしてverified clean checkoutで呼び、前後でHEAD/tree/対象checker digestを再照合する。これらが正式unitへ移管済みとは主張しない。

Historical citationは`LegacyPin{asset_id, archive_path, full_file_sha256, line_start, line_end, optional_span_sha256}`で照合する。`full_file_sha256`と行span bytesのSHAは別field・別型であり、片方を他方に代用しない。Archive/audit snapshot、PR/commit/時点audit参照はcurrent source linkと異なる`source_kind`で扱い、historical pathをcurrent pathへ解決しない。未対応・未確認pinは一覧化してnon-pass状態に残す。

### 2.3 Target、結果、証拠

`CiTarget = {repository_id, base_commit, merge_base, head_commit, head_tree, worktree_clean}`。対象HEADとworktreeが一致し、tracked/untracked変更がないことを開始前・終了後に検証する。不一致/dirtyは`stale`、K2 keyに必須のtarget ref自体が入力に無くkeyを組めない場合は既存`Rejected(missing_key)`、key構成後のGit blob read failureは`Unknown(unreadable)`。HEAD/tree不一致は`stale`。GitHub側はdispatch入力の`base_commit`/`head_commit`とcheckoutのcommit/treeを再計算する。workflow/dispatch/receipt transportが成立せず検証を開始していない状態は`Unobserved(not_run)`であり、入力欠落を埋めてsuccessにしない。

各`CheckExecution`は`{check_id, argv, cwd_rel, executable_identity, started_at, finished_at, exit_code, state, stdout_sha256, stderr_sha256}`を保持し、stdout/stderr本文をreceiptへ格納しない。stateはOS-020既存語彙`success|fail|denied|skipped|interrupted|stale`。この全量local planでは5 checkすべてrequiredであり、`skipped`は選択した検査を走らせない扱いにせず、plan/build/read不成立を原因別に記録する。全5 check successとdesign manifest complete時のみCI result=success。checker非zero（`LC-SCF-002`のstale検出を含む）はfailとして後続stepを続ける。target/checker bindingが変わった場合は後続stepを起動せず未開始stepを`stale`、process中断後の未開始stepを`interrupted`としてreceiptに残す。aggregateは固定優先順`stale > interrupted > denied > fail > skipped > success`で畳み、全5件successかつmanifest completeの場合だけsuccessとなる。

現行driverの外部receiptは診断用artifactであり、K1/K2の保存済みresult/evidenceを名乗らない。将来formal K1 projectionを実装する場合は、既存K2 key契約の`operation/version`, current targetをsubjectとする`SubjectRef`, target scope, config/manifest/checkerのcurrent source refsをすべて構成してから結果を保存する。targetまたは必須source refが欠けてkeyを構成できない場合は既存`Rejected(missing_key)`とし、架空refや鍵なし`Unknown`を作らない。必要なkeyを構成できた後でsource bytesを読めない場合だけ既存`Unknown(unreadable)`を返す。これは将来formal投影の境界であり、今回のdriverに新K1 authorityやK2 recordを追加しない。

`LocalCiReceipt`は`{schema_version, target, contract_ref, config_digest, design_manifest_digest, checker_refs[], runtime_identity, executions[], aggregate_state, created_at}`。`executions`は5つのrequired check IDを固定順に各一度保持し、欠落・重複・順序違いはsuccessにしない。self-digestはreceipt bodyへ書かず、canonical UTF-8 JSON bytesを保存後に外側で算出する。full receiptはcheckout外の`$XDG_CACHE_HOME/helix/local-ci/`（fallbackはsystem temp内task directory）へ0600相当で書く。pathはrepo内ならRejected。環境変数値、秘密、任意stdout/stderr本文、絶対checkout pathは含めない。source snapshot/contract/config/checker refsをreceipt自身や生成物から再読しないのでtracked self-reference loopはない。

local CIは出力を作成側の合否宣言に使わない。独立reviewおよびmerge-unit verifierへの証拠である。`success`は要求採否、review、L10 Verified、L11 Accepted、merge/releaseを生成しない。

## 3. GitHub Actions provider境界

workflow triggerは`workflow_dispatch`のみ。push/PR毎起動はしない。merge単位でCI運転側が`target_base`, `target_head`, compact receipt JSONを渡し、同じtarget HEAD/treeでreceipt binding verifierと選択済み軽い`LC-DIFF-001`を実行する。`LC-SCF-001`/`LC-SCF-002`/`LC-GOV-001`/`LC-DESIGN-001`はlocal-only selectedであり、Actions側で実行済みと主張しない。

dispatch JSONはenvironment経由でPython parserに渡し、shell interpolation/evalをしない。`contents: read`相当の最小権限、secrets/credentialsなし。GitHub公式仕様はworkflow_dispatchがdefault branch上に存在すること、inputsは最大25、payload上限65,535 charsを示す（[workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onworkflow_dispatchinputs), [manual run workflow](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow), 参照日2026-10-09）。これらはprovider技術制限であり要求閾値ではない。dispatch不成立、workflow未配備、上限超過で検証を開始できない場合は`Unobserved(not_run)`。dispatch後にJSON parseを開始して構文不正を検出した場合は`Unknown(unreadable)`と診断を保持する。いずれもsuccessへ縮退しない。

GitHub verifierはreceipt schemaと5 required IDの完全性、全step successとaggregate successの整合を確認するが、local-only stepのstatus/output digestを再実行・再現したとは主張しない。target/contract/config/manifest/checker refsはGit blobから再計算し、dispatch targetと一致させる。実行結果比較はActionsが実際に行う`LC-DIFF-001`だけに限る。full local evidenceはexternal cacheの別artifactであり、GitHub inputへstdout/stderr本文を入れない。receipt digest/exit/stateは報告値として扱い、自己申告だけから実行者の真正性を証明しない。検証不能なら双方照合済みを主張しない。Action greenはmerge admissionやbranch protection required checkではない。

## 4. 実装技術の選択

AI設計判断としてCPython 3.11+ / standard library（`argparse`, `subprocess`, `hashlib`, `json`, `pathlib`, `tempfile`, `platform`）を選ぶ。理由は追加package/lock/root configを要さず、read-only Git plumbingとsha256/canonical JSONを実装できるため。Bunは不使用。GitHub Actionはprovider adapterであり、CI意味・要求・oracleを所有しない。

## 5. 旧source完全一致と差分

旧sourceと保持/変更/理由は第1節にasset ID、archive path、line range、full SHAを記録した。旧のローカル優先、merge-unit起動、設計pair freeze local-only、local evidence→CI evidence bindingを保持する。旧固定job/workflow/branch protection、旧toolchain/command、既存CIの合格、費用値は現行oracleにしない。現行の`AC-OS-020`と`AC-HARNESS-L3-036-02`へ接続する変更理由は、Stage 1解禁decisionの明示したlocal-first・same-contract・no-secrets・no branch-protection-changeである。
