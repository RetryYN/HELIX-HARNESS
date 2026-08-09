---
title: "独立レビュー・フォールバック関数設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-04
updated: 2026-08-04
owner: SE
plan: docs/plans/PLAN-RECOVERY-12-independent-review-fallback.md
pair_artifact: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md
github_issue_id: 390
behavior_contract_id: KIMI-REVIEW-FALLBACK-001
responsibility_owner: independent-review-fallback-router
---

# 独立レビュー・フォールバック関数設計

## 1. 責務

Claudeを主系reviewerとし、同一candidate HEADへ束縛したquota、unavailable、claim timeoutの封印済み証拠がある場合だけ、許可済みの低・中risk taskをKimiへ切り替える。failure evidenceは次generationへ継承せずClaudeへ戻す。

## 2. 境界

- `classifyReviewProviderFailure`: provider失敗を型付きcapabilityへ封印する。
- `selectIndependentReviewProvider`: HEAD、task class、riskを照合して主系またはfallbackを選ぶ。
- `issueReviewFallbackLease`: repo／PR／HEAD／generationごとの単一provider leaseを発行する。durable writerは同じcandidate HEADのKimi attemptを最大1回に制限し、process再起動やgeneration変更による回避を拒否する。
- `buildKimiFallbackInvocation`: raw prompt modeを禁止し、ACPとbounded packetだけを構成する。
- `executeKimiFallbackReview`: 空workspaceのbubblewrap processで`kimi acp`を実行する。client filesystem／terminalを無効化し、MCPを空集合に固定し、permission・tool activityを拒否したうえでstrict outputを再検証する。
- `buildProviderNeutralReviewReceipt`: failure、lease、packet、output、CI、DBを一つのreceiptへ束縛する。
- `helix github pr-review-fallback`: GitHubからcurrent HEAD／本文／diffを取得して再読後のHEAD一致を検査し、Claudeを20秒のbounded probeで観測する。typed failure時だけleaseを発行してKimi ACPを起動する。callerがfallback理由や任意packetを自己申告する入力は持たない。
- `validateKimiReviewFallbackAdmission`: `pr_convergence_review`の正負fixture／negative oracleを検証したcanonical Claude v2 receiptへ束縛した期限付きS4 receiptだけを受理する。caller文字列だけのClaude指定、PO自己bootstrap、Kimi自己検証、期限切れ、lane closure digest不一致ではprovider probeより前に停止する。
- `validateKimiReviewFallbackAdmissionForImplementation`: 「受け入れ試験を通した実装＝いま動く実装」の同一性を、repositoryのcommit idではなく**lane実装のmaterial closure digest**で照合する（`src/runtime/review-lane-closure.ts`）。旧v1はこれを`git rev-parse HEAD`の40桁shaへ束縛していたが、本repositoryはmerge commit方式のためlane PRのhead shaはmerge後のmain HEADと決して一致せず、admissionはmain上で成立し得なかった。さらにlaneと無関係なmergeのたびに失効し、鮮度keyとして過剰かつ無効であった。closure digestはlane sourceの固定集合と provider material（Kimi CLI binaryのdigest、model）を`(path, digest)`のsorted manifestへ畳んだ値であり、closureが1 byteでも変われば動き、laneと無関係なmergeでは動かない。member pathの一覧自体もmanifestに含めるため、memberを削って素通りさせることもできない。`admission_implementation_head`はprovenanceとして残すがgateには使わない。
- lane closureの構成memberはlaneのsecurity境界であり、追加・削除は境界変更として扱う。member不読はfail-closeする（読み飛ばして digest を出すと、消えたmemberを「変更なし」として通してしまう）。provider materialはCLIを起動せずbinary全体のdigestで捉える。version文字列は起動しないと得られず、同一version内の差し替えも捕まえられない。
- closure digestはKimi起動前だけでなく**review完了後にも再実測**し、開始時の値と一致しなければreceiptを発行しない。開始時の照合だけではreview実行中の差し替えにTOCTOU窓が残る。
- `helix github pr-review-fallback-admission`: benchmark evidence／negative oracle JSONとcanonical Claude v2 receiptを読み、同一implementation HEAD、5 caseと4 mutationのexact set／期待結果を検証してdigest化する。Claude receiptはcanonical filenameだけでなく、`commentUrl`からGitHub commentをread-after-fetchし、v2 marker、PR、HEAD、CI、DB、最終receipt digestをexact照合する。HEAD不一致、非canonical path、自己整合JSONだけのreceipt、comment欠落／改変、digest省略は受けない。既定はdry-runで、`--apply`時だけruntime stateへ永続化する。
- `helix github pr-review-fallback`: clean worktreeとimplementation tree、current PR HEAD、green CI／DBをKimi起動前に検証し、leaseを永続化してから一度だけ起動する。dry-runはpacket計画までで停止する。Kimi終了後にもHEAD／CI／DBを再読し、drift時はreceiptを発行しない。
- `helix github pr-merge-reviewed`: Claude v2をmerge authorityとして読む。provider-neutral v3はcanonical receipt rootと対応するcanonical S4 admission artifactのdigest／implementation HEADを再検証するが、provider署名または同等の外部attestationが無い間は`provider_neutral_receipt_advisory_only`で必ずmergeを拒否する。手製JSONだけで独立reviewを偽装できる境界を、trusted local writerという仮定で隠さない。

- `deriveReviewRiskClass` / `admitDeclaredReviewRisk`: risk classを呼び出し側の自己申告に委ねない。GitHub diffのpath集合からrisk classを導出し、`.github/workflows/`／`.github/actions/`／`migrations/`／`src/state-db/`と、auth・payment・credential・secret・token・PII・license・release・distribution・cutover・guard・admission・merge・reviewを含むpath segmentをhighへ落とす。docs／markdownのみはlow、それ以外のsourceはmediumとする。申告が導出を下回る場合は`REVIEW_FALLBACK_RISK_UNDERDECLARED`、導出riskがadmitted集合に無い場合は`REVIEW_FALLBACK_RISK_NOT_ADMITTED`、分類対象が空の場合は`REVIEW_FALLBACK_RISK_UNCLASSIFIABLE`でfail-closeする。
- `parseChangedPathsFromDiff`: risk導出の入力となるchanged pathをunified diffから取り出す。`diff --git`行を1行でも解釈できなければ`REVIEW_FALLBACK_RISK_UNCLASSIFIABLE`でfail-closeする。gitは`core.quotePath`既定で空白・非ASCII pathをquoteするため、regex不一致を黙って読み飛ばすと該当fileがrisk導出から漏れて過小分類になる。混在diffでも解釈できないheaderが1行あれば全体を拒否する（quoted分だけ落として残りで分類すると過小分類になる）。CLIへ埋め込まず純関数として切り出し、oracleがこの分岐を直接通れるようにする。
- runtime authority surfaceもhighへ落とす。`.claude/`配下（hook配線、subagent allowlistとmodel frontmatter）と、`CLAUDE.md`／`AGENTS.md`はpath segment語彙では拾えないためprefixとexactで明示する。
- v3 receiptの著者runtimeは`declared_author_runtime`とする。実際のauthor runtimeを機械検証する手段が無いため、検証済み事実であるかのように`author_runtime: "codex"`を固定しない。強制するのはreviewer_runtimeとの相異（独立性）と非空のみで、値自体は自己申告であることをfield名で明示する。永続receiptは任意JSONであるため`typeof !== "string"`の型検証も明示する。旧`!== "codex"`は非文字列を暗黙に拒否していたが、自己申告へ緩めた際に型検証が失われ、数値などでは`.length`がundefinedになり長さ判定も独立性判定も素通りしていた。型・空文字検査はvalidateだけでなくbuildにも置く。build入力もCLI引数やreceipt再構成など任意JSON由来になり得るため、TypeScriptの型宣言を実行時保証として扱わない。
- negative oracleは`closure_member_drift`（memberの内容変更）と`closure_member_removed`（closureからのmember削除）を含む。closure digest束縛は、この2つが実際に失効を起こすことを示さなければ名目でしかない。
- S4 admissionの有効期間には上限（24時間）を課す。`issued_at < expires_at`だけでは発行側が任意の遠い`expires_at`を置けて「期限付き」が名目化するため、window長そのものをbuildとvalidateの両方で拒否する。
- lease一意性はHEAD単位のattempt slotを`O_EXCL`で先に確保して決める。既存の`.json`走査だけでは走査と作成の間にTOCTOUがあり、generationがファイル名digestへ入るため異なるgenerationの並行processが双方書き込みに成功し得る。slot確保後にlease本体の作成が失敗した場合はslotを解放する。
- v3 receiptは`lease_issued_at`／`lease_expires_at`を payload へ含め、`fallback_evidence.observed_at ≤ lease.issued_at ≤ reviewed_at ≤ lease.expires_at`をbuildとvalidateの両方で強制する。leaseの実行窓を発行後に一切参照しないと、期限切れ後に完了した実行や順序が矛盾した鎖でも有効なreceiptになるため、時刻をdigest対象へ載せて再検証可能にする。

Kimiへrepository、`.helix`、DB、project credentialをmountしない。provider authはhost stateを直接bindせずscratch copyを使う。ACP reverse RPCはdenyし、permission requestまたはtool updateが一件でもあればreview全体を失敗させる。networkは現段階でhost transportを共有するため、security／credential／PII／release／high／critical taskはadmitしない。S4 receiptが未発行の間、公開commandはfail-closeしfallbackを実行しない。

provider認証のscratch copyにはrotation取りこぼしの欠陥が**実在する**（2026-08-06に実測）。
providerはsandbox起動直後にrefresh tokenをローテーションし、新しいtokenは破棄されるscratch copyにだけ
書かれる。hostには古いtokenが残るため、sandbox実行1回ごとにhost認証が失効する。「host auth stateを
workerから直接変更させない」という保護は、ローテーションを取りこぼす構造を併せ持つ。

実測: sandbox実行の前後および実行中にstaged copyとhostのcredential digestを比較したところ
（secret値は記録せずdigest／mtime／sizeのみ）、staged copyのdigestは実行開始2秒時点で変化し、
同じ区間でhostのdigest・mtimeは不変であった。

- `evaluateProviderAuthWriteBack`: 書き戻し可否を決める純関数。存在しない／regular fileでない／
  存在するが読めない／size上限超過／JSON objectでない／host側が読めない／host側がJSON objectでない／
  key集合不一致／値の型不一致／token空文字／`expires_at`が前進していない、をすべてfail-closeで拒否する。
  失読と破損、不存在と失読は別のreject reasonにする。auditで原因を切り分けられなくなるため畳み込まない。無変更なら`skip`とし、不要なhost書き込みを
  起こさない。「存在しない」と「存在するがregular fileでない」を別のrejectとして扱う。後者はhost側の
  別pathへ書き込みを誘導し得る攻撃形であり、前者と混同しない。
- `reclaimRotatedProviderAuth`: scratch破棄前にrotate済みcredentialをhostへatomicに戻す。
  worker外（Node境界）でのみ実行し、workerにhostを触らせない。secret値は返さずdigestだけを返して
  callerがaudit evidenceへ記録する。
- 書き込み側もsymlinkを追従させない。読み側の`lstat`だけ塞いで書き込み先を放置すると防御が非対称に
  なる。固定pathへ直接書くと、事前に植えられたsymlinkを`"w"`がたどってtargetをtruncateし、backup path
  経由ではhost credentialの平文が任意pathへ流出する。事前に存在し得ないstaging directory
  （`mkdtemp`）の中で`O_EXCL`で作成し、`rename`で所定pathへ移す。`rename`は宛先がsymlinkでもlink自体を
  置き換え、targetへは書き込まない。`rm`してから作り直す方式と違い、削除と作成の間に再度植えられる
  TOCTOU窓を持たない。backupを先に確定させてからhostを置換し、中断時にhost credentialを失わない。
- 書き込みフェーズの失敗を無言にしない。`decision.action === "write"`なのに書けなかった状態を記録
  しないと、恒久的なI/O失敗（権限変更、disk full等）で書き戻しが効かなくなっても、閉じたはずの
  「実行ごとにhost認証が失効する」事象の再発を切り分けられない。reject系と同格の`write_error`として
  errno codeを添えてcallerへ返す。staging directoryの後片付け失敗はhost置換の成否に影響させず、
  例外を伝播させて成功したreviewを失敗として報告しない（`cleanup_failed`として別に報告する）。
- 書き戻しはreviewの成否と無関係に実行する。rotationはreview結果に関係なく起きるため、失敗経路で
  回収しないとsandbox実行1回ごとにhost認証が失効し続ける。

書き戻しはworkerが書いたバイト列をhostの認証面へ通す操作である。検証できるのは「形」であって
「中身の正当性」ではない。provider CLI自体が侵害された場合、攻撃者のtokenをhostへ固定され得る。
blast radiusは当該providerの認証に限定されるという前提で受け入れており、PO承認境界として扱う
（承認: 2026-08-06）。

なおTTYの無い環境で`kimi login`を起動して途中で打ち切ると、host credentialが
`access_token`／`refresh_token`空・`expires_at: 0`の状態で書き戻される。これはrotation取りこぼしとは
別の失効経路である。以後`kimi login`はharnessから起動せず、host所有者がTTY上で中断せずに実行する。

ACPのJSON-RPC errorは型付きfailureへ変換する。`Authentication required`はauth surface未解決として停止し、protocol driftと混同しない。認証の再取得はworker内で行わず、host所有者の明示操作後に新しいgenerationで再試行する。
terminal response前にACP processが終了した場合、exit code 0を含めてprocess failureへ即時分類し、timeoutまで待機しない。

## 3. Bootstrap

本設計を含むPR自身のKimi判定をadmission根拠にしない。canonical Claude reviewを得るまでdraftを維持し、provider-neutral merge gateを有効化しない。Claude quota中は実装とKimi advisory reviewを進めても、未承認S4を自己発行してmerge境界を迂回しない。
