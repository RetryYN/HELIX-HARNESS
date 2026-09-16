# W1 人間判断候補の意味分解

status: decision_not_requested_yet
scope: HIL-BR-03／07／09／18／21／23／26／30
authority: [旧要求carry-forward台帳](legacy-requirement-carry-forward.jsonl)
queue: [W1業務価値要求queue](legacy-ir-w1-business-rehome-queue.md)

## この文書が行わないこと

この8件は削除、縮退、統合、降格の候補ではない。旧要求の原文と意味は、後続の要求PRで人間が具体的な差分を判断するまで全件保持する。この文書は、旧文面に含まれる有効な要求と、HELIX-HARNESS／HELIX-OSの新しい責務分離により書換えが必要になり得る箇所を分けるための準備資料である。

まだ人間へ採否を求めない。後続PRでは一つの原要求identityだけを扱い、原文、digest、保持する意味、責務分割案、変更される語またはauthority、受入への影響を同時に提示する。提示できない場合は`preserved_pending_rehome`のまま止める。

## 判断候補

### HIL-BR-03 — ログから永続知識を昇格する

- 原文digest: `sha256:b417efbef831936abb9089f4fbbcfa5c3b168a0a6238ccb4bcff5809905280ea`
- 原要求: Claude CodeはCodex完了時にraw実行ログ、PR、test/CI、監査所見を圧縮し、永続知識だけをharness memoryへ昇格する。進捗はDB continuationへ残しmemoryへ混載しない。
- 必ず保持する意味: 実行証拠と進捗状態を永続知識から分離し、複数の証拠から再利用可能と確認した知識だけを改善資産へ昇格する。
- 整理が必要な箇所: `Claude Code`、`Codex`、`harness memory`、現行DBは方式名であり、HELIX-OSのログ・学習・改善責務より先に固定しない。旧memory昇格条件と、新世代の有期限通知およびauthority境界を照合する。
- 後続PRで示す判断: runtime固有語を外してHELIX-OS要求へ再配置しても、証拠／進捗／永続知識の三分離と昇格条件が欠けないか。

### HIL-BR-07 — 指示と要求を捨てない

- 原文digest: `sha256:c814f4130d22699aef92e457ec388caf41178991e9f393c5eb9cebdb592c501d`
- 原要求: user directiveとIssueは分類前にdurable intake receiptを持ち、AIが不要判断だけでreject/drop/close/cancelできない。AIの非actionable dispositionは非終端で、cancel/supersedeはPOだけが行える。closure receiptが無いcloseは拒否または再openする。
- 必ず保持する意味: ユーザー指示を受領時点から追跡し、AIの判断だけでは消失・終端させず、終端のauthorityと証拠を要求する。
- 整理が必要な箇所: Issueは要求正本ではなく投影である。要求候補の採否、管理上の作業終端、GitHub Issueのcloseを同じ状態として扱わない。`POだけ`の範囲は、企画からの齟齬を管理するHELIX-OS管理層のauthority定義と照合する。
- 後続PRで示す判断: 原要求の非消失保証を維持したまま、要求の採否authority、作業のcancel／supersede authority、Issue投影のclose条件を別契約に分けるか。

### HIL-BR-09 — 工程からWorker編成を生成する

- 原文digest: `sha256:060850964c4d0ccf5e287a4f39a5cbc6695a7673a0b68205e2c464d41332a456`
- 原要求: 工程表のlayer×drive×task-kind×verification patternからHARNESS所有agent contractとW-agent teamを生成し、Claude/Codex固有定義へ決定論的に射影する。
- 必ず保持する意味: 承認済み工程と仕事の性質から、必要な役割・検証分離・runtime projectionを決定論的に生成する。
- 整理が必要な箇所: HARNESSは開発・検証契約を提供する。管理層が工程を推進側へ渡し、推進機構がtag、workflow、ticket、Worker編成を生成するため、agent contractの生成ownerはHELIX-OS側である。旧`drive`は現行の分類とticket tagへ写像する必要がある。
- 後続PRで示す判断: HARNESSが提供する工程・検証契約と、HELIX-OS推進機構が所有する分類・生成・runtime射影を、どの接続要求で結ぶか。

### HIL-BR-18 — Worker instanceの全lifecycleを管理する

- 原文digest: `sha256:e13f07c964cce52474bd87f8b2dc688e0c80e5c142260b32e2086886be523db8`
- 原要求: HARNESSはagent定義だけでなく、生成、lease、実行、checkpoint、検証、解放、quarantine、retireまでのinstance lifecycleを正本として保持する。
- 必ず保持する意味: Worker instanceの生成からretireまでを欠落なく管理し、lease、検証、隔離、解放を追跡可能にする。
- 整理が必要な箇所: instanceの運用と状態管理はHELIX-OSのWorker・統制・ログ責務である。HARNESSには、適用する開発工程が要求する役割分離、検証、停止条件を残す。
- 後続PRで示す判断: lifecycleの管理正本をHELIX-OSへ置き、HARNESSとの境界を工程・検証契約の入力として表現しても、元の全lifecycle保証が保たれるか。

### HIL-BR-21 — 意味を変えない設計改善と意味変更を分ける

- 原文digest: `sha256:a9dbe1d0cf46034f9770e95ec5f6681c9d4ffd1ae41ceb82e7c37692bb871938`
- 原要求: 設計上の重複、責務混在、変更波及、埋込みpolicyを、外部仕様と受入挙動を維持したまま外部化・共通化・オブジェクト化する第一級`DesignRefactor`駆動モデルを持つ。要求・公開contract・永続state semanticsを変える場合は`Redesign`または`Retrofit`へrerouteする。
- 必ず保持する意味: 意味を保存する設計改善を第一級で扱い、要求・公開契約・永続状態の意味が変わる作業とは別経路へ送る。
- 整理が必要な箇所: `駆動モデル`は製品責務ではなく、推進機構がticket発行時に付ける分類tagとworkflowへ移る。HARNESSは意味保存・再設計・検証の工程契約を持ち、HELIX-OS推進機構は分類、workflow生成、rerouteを行う。
- 後続PRで示す判断: `DesignRefactor`の意味保存契約をHARNESSへ、tagとreroute実行をHELIX-OSへ分ける接続要求で、元の自動reroute条件を維持できるか。

### HIL-BR-23 — 要求エンジンと改善loopを接続する

- 原文digest: `sha256:271ec5381b718cce0fd8f0e3beacb9d0359059f88e8ea705fc7319edaa164c2d`
- 原要求: HARNESS所有のRequirement Translator subagentはchat、product data、source capabilityを要求atomへ翻訳し、既存templateで表現不能な論点を黙って捨てずTemplate Gap Issueとして改善loopへ戻す。
- 必ず保持する意味: Concept、企画、指示、product data、source capabilityから要求atomを導き、表現不能な意味を捨てずにtemplate改善へ戻す。
- 整理が必要な箇所: 要求エンジンとDesign TemplateはHARNESS製品側に置く。入力登録、実行Worker、候補管理、齟齬ログ、改善作業の発行とHARNESS自体の改善はHELIX-OSが担う。`subagent`と`Issue`を要求意味の正本にしない。
- 後続PRで示す判断: HARNESSの要求抽出・分類契約と、HELIX-OSの登録・実行・齟齬管理・改善loopを分ける接続要求で、Template Gapを一件も黙って落とさない保証を維持できるか。

### HIL-BR-26 — AIの起草と正本化を分ける

- 原文digest: `sha256:93323e6ed35f5fe3a312d0d4965462586f1bb503c60f1f51013f18e8d48535be`
- 原要求: AIは要件・設計・PLAN・関連Markdownを自律的に起草、追加、修正、分割、統合、改名できる。Authoringの自由とCanonical化を分離し、正本化だけを`Authoring Admission Transaction`で制御する。可逆かつ既定policy内の変更は自動確定し、上位目的、安全境界、不可逆な外部契約を変更する場合だけ人間へescalateする。
- 必ず保持する意味: AIの編集能力と正本変更authorityを分離し、正本化をtransactionとして記録し、高影響変更だけを人間へ送る。
- 整理が必要な箇所: HARNESSは開発工程上の変更区分と人間判断境界を定め、HELIX-OS管理層は正本候補の登録、差分、authority、適用を管理する。現在のRFA候補を、そのまま発効済みの自動確定policyとして扱わない。
- 後続PRで示す判断: 可逆かつ既定policy内の自動確定範囲をどこまで認めるか。その範囲外では原要求の自律authoringを止めず、canonical化だけを保留できるか。

### HIL-BR-30 — 必要な専門Workerだけを生成する

- 原文digest: `sha256:7805010c12510bd817953e2d115e50791e617dcbd627ed9d599762c277c72711`
- 原要求: HARNESSは工程表、Design Contract Portfolio、判断pack、task分類から専門agent contractを必要時に自動生成し、runtime固有subagent定義へ射影する。専門化の根拠がないagent増殖を避け、worker/verifier/authority分離、最小context、tool/path権限、budget、停止条件を生成時に拘束する。
- 必ず保持する意味: 工程と設計・判断・task情報から必要な専門Workerだけを生成し、独立検証、最小権限、予算、停止条件を生成時に拘束する。
- 整理が必要な箇所: HARNESSは工程、Design Contract Portfolio、検証契約を提供し、HELIX-OS推進機構が専門Worker contractとruntime projectionを生成する。管理層はauthorityと制約を登録・統制する。
- 後続PRで示す判断: HARNESS入力、HELIX-OS管理制約、推進機構による生成を接続要求へ分けても、根拠のないWorker増殖を防ぐ全制約が維持されるか。

## 後続PRの不合格条件

次のいずれかに該当する要求PRはmerge対象にしない。

- 原要求identity、原文、digestのいずれかを提示しない。
- 「旧語だから」という理由だけで、保持する意味を削除する。
- HARNESSとHELIX-OSへ分割したatom間の接続要求を作らない。
- Issue、PR、CI、既存runtimeの状態を要求の採否根拠にする。
- 人間が確認していない意味変更を`meaning_change_applied`またはsuccessorへ記録する。
- 一件のPRで複数の原要求identityをまとめて変更する。
