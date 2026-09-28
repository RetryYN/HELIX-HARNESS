# Codex作成レーンのゴール：運用ループ候補（2026-09-28）

発行：Claude（review_merge lane、session 66d9c527-e899-4091-b8bb-240e5cdce85e）。POの指示「それで入れてくれ。」（2026-09-28、チケット返却・検証フィードバック・Worker稼働・レーン・自動片付け・コネクタ型・検収セッション追加の7論点について）による。
本書は作業の依頼であり、要求の承認、候補採択、merge admission、操作許可を生成しない。権限と手順は`AGENTS.md`、`CLAUDE.md`、`docs/governance/new-generation-start-here.md`、`docs/governance/github-upstream-operating-model.md`、および[前回のゴール書](codex-goals-2026-09-27.md)「共通の進め方」1〜9に従う。

## POの発言（原文、2026-09-28〜29の会話）

O1〜O7の起点となったPOの発言は次のとおり。各論点の「PO意図」欄はClaudeによる要約であり、要求意味の根拠にはこの原文を使う。

> チケットってどうなってる？これ過去のプランみたいに依存をつけないようにしたくて原則おさわり厳禁。チケットミスってたら上位に理由付きで返却して再発行させながら学習させて精度を上げる仕組みにしたいんだよね。CI側も検証が成立しないなら何が必要だったかフィードバックするループを入れたい。あとは各レーンのサブエージェントのWorkerの稼働状況をモニターして直列を維持して空いてたら、別のあまり影響しにくいタスクを投げて最大5Workerを維持させるようにチケット発行してさぼらせないしたい。そしてレーンにはメインの検収レーンをClaudeにはするが、空いてたらWorkerにしてCodexにレビューさせる逆向きもできるかな？cursorのクラウドエージェントもだけど。※cursorはレビューじゃなくてじゃないほうがいいけど。要求とデザインは現行だとClaudeがトップ水準だからここに優先して投げたいところ。あとは自動リベースや自動リチェイン、マージされたら関連ワークツリーやブランチを自動で畳むとか。ただし、衝突危険があるときはエージェントに返すような方向で調整したいのだがどうだろうか？フィードバックコネクタやループコネクタ、双方向、直列方向、みたいなコネクタタイプを追加したらよさげじゃね？って思ったんだけどどうかね？

> 検収が増えたらセッションを2こにすればええじゃない。

> それで入れてくれ。

「依存をつけない」の意味について、Claudeが確認した（2026-09-29）。POの回答（原文）：

> チケットそのものに参照をつけたり実装の一部みたいに扱わないってこと。

ClaudeはこれをPOへ次のように言い直して示した（PO確認済みの意味はPOの原文であり、以下はその説明）：
1. チケット自体に、他のチケットや成果物への参照を付けて、依存の結節点にしない。
2. チケットは作業の指示であって成果物ではない。設計・コード・文書の側からチケットを根拠や部品として参照せず、正本は要求・設計・契約に置く。チケットが閉じても再発行されても、成果物の意味は変わらない。

旧source起点：旧`execution-ticket-requirements.md:102`（actor・provider・branch・worktree・優先順位を本文に入れない）、`:212-214`（依存は型付きrelation）、現行OS L2 `:116`（GitHub IssueとPRはticketの映しであり、closeやmergeでticketを完了にしない）。作業順序の制約が要る場合に、それをticket本文の参照ではなくどこで持つか（OSの計画・relation側）は、候補で扱いを示し、新しい意味を足す場合は新規案として明示する。

## 位置づけ

- すべて**未採択候補**（`registered_proposal`／`authority_effect: none`）として起こし、PO判断packetへ追加する。採択済みHELIXOS-L2-001〜029、HARNESS-L2-001〜026、LABO／INTELLIGENCE採択集合の本文は変更しない。
- 手順5（旧HELIXデグレ検証）の残差処理と並行してよいが、残差処理のPRを優先する。
- 各論点で、旧HELIXに根拠がある部分（asset・path・行・SHA）と**新規案**を分けて示す。新規案は「新規案」と明記し、PO判断packetの選択肢（A採択／B保留／C変更）に載せる。
- 固定数（Worker数、reviewer数、provider名）を恒久要求にしない（採択済みOS `governance-requirements.md:227-228`、HARNESS `product-requirements.md:230-235`）。数値は運用設定値として扱う。
- SECURITYはA案（有効な既決権限の再利用、通常作業ごとの人間承認を追加しない）。ただし、remote branch削除などの外部作用は、対象と作用を明示した許可を一度置き、それを再利用する形にする。
- Web展開後の内容や後続版の能力を1.0の前提にしない。

## 優先順位（2026-09-28 外部監査レビューを受けた追記）

外部監査の総評は「要求の確定処分より候補追加が先行している」。そのため次の順で進める。O1〜O7はP2の後に行う。

### P0 SECURITY-033の資格情報境界の是正（未採択候補の訂正revision）

- 現状：`docs/helix-security/L2-requirements/security-requirements.md:461`（HELIXSECURITY-L2-033「隔離とsecret task」）と対L11 `docs/helix-security/L11-acceptance/security-acceptance.md`（033の拒否・未確定例）は、「secret/credentialを必要とするtask」自体を起動前denyとしている。
- 食い違い：採択済みSECURITY-L2-005（`:110-`）は、秘密値をAIへ見せずに、操作・範囲・期限を限定したcredential-use capabilityを提供する。034の受入（`security-acceptance.md:140`付近）と033自身の`:435`（非公開capabilityの限定利用）も、この安全な利用を認めている。旧原文の`secret task deny`からは、認証付き操作をすべて禁止する意味は確認できない。
- 求める変更：「秘密値そのものをWorkerへ渡す必要があるtask、または秘密・機密内容を外部Workerへ渡すtask」はdenyする。「秘密値を隠したまま、005の限定capabilityを使う認証付き操作のtask」は許可範囲内で起動できる。この2つを区別し、後者の正常例と、後者まで一律denyする反例（不合格）を033のL11に置く。register／receiptは既存行を書き換えず、訂正revisionをappendする。PO packetの033項目も追随する。後者も禁止する方針にするなら、意味変更として選択肢に明示する。
- SECURITY A案（締めすぎない）とPO注意（「Securityも操作制限し過ぎて仕事が進まないで首を絞めるパターン」）に直接関わる。

### P1 手順5の残差を機能単位で閉じる

- 候補を1行ずつ追加するのではなく、機能単位（例：Worker＝起動・イベント・出力・安全・adapter契約・承認責務、LABO＝first-pass・修正回数・Attempt数の計測体系）ごとに原条件を一覧にする。各条件を「現行の採択済み契約で満たす／新要求候補にする／旧方式として廃止をPOに提示する」のどれかに処置し、未処分件数の減少を進捗として示す。
- 既存監査の修正結果（#2272〜#2275のoverlay・補正）を、現在有効な対応表へ集約する。採択済み250件の全面書き直しや、旧4,020資産すべての再調査には戻らない。
- 外部監査が挙げた残り：専門Worker契約の生成（割当とは別）、MCPのprofile列挙・設定・read-only probe供給、feedbackの解決までの運搬、旧Product Data・文書専用review・incident時のrelease/資格条件。旧技術方式の復活と、そこで提供していた機能・保証の保持を分けて処置する。

### P2 46候補のPO判断packetの整理

- 採否・意味変更・配置・導入版を混ぜない形に整える（例：HARNESS-045／OS-039の予算・期限の意味、OS-045の対象・版・所属、LABO first-passのD1〜D3）。

## 論点と旧source起点

### O1 チケットは作業者が編集しない。誤りは理由付きで上位へ返し、新revisionで再発行する

- PO意図：チケットは原則として触らない。ミスは理由付きで発行元へ返し、再発行させる。
- 旧：`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:101`（Ticketはimmutable/revisioned）、`:102`（actor・provider・branch・worktree・優先順位は本文に入れない）、`:282`（管理側はproposalを作れるが、Ticketの意味を直接上書きしない）、`:212-214`（依存は型付きrelationで、欠落・循環はfail-close）。
- 現行採択：OS `:113,115,138,666,669`、HARNESS `:115`（下流で書き換えず、Backflowで戻す）。
- 候補化する差：Workerや検収側はチケット本文を編集せず、「理由・不足項目・根拠」を付けて発行元（OS）へ返却する。OSは元revisionを保持したまま新revisionを発行する。依存はチケット本文ではなくOSのrelation graphで持つ。
- 主担当はOS。

### O2 返却・未評価の理由から発行精度を学習する（検証不成立のフィードバックループを含む）

- PO意図：返却を学習に回して発行の精度を上げる。CI側で検証が成立しないときは、何が必要だったかをフィードバックする。
- 現行採択：HARNESS `:60,121,383`、OS `:296,562,699`、LABO `labo-requirements.md:269`、INTELLIGENCE `intelligence-requirements.md:106`。
- 関連する未採択：HARNESS-034（H `:703`）、HARNESS-036（H `:751,764`）、OS-040（OS `:1124-1132`）。これらと重複させない。関係はsource relationとして記録する。
- 候補化する差：返却理由と「検証に不足した入力・oracle」を発行元へ集約する。LABOは返却率・理由分類・再発行後の成立率を観測する。INTELLIGENCEは次回の発行・配置案へ反映する。LABOは割当・起動をしない（既存境界）。
- 主担当はOS・LABO・INTELLIGENCE。単体か接続かの区別を明示する。

### O3 Worker稼働の監視、遊休枠の低干渉タスク充填、直列順序の維持、上限は設定値

- PO意図：各レーンのサブエージェントWorkerを監視し、直列を維持する。空いていれば影響の小さい別タスクを投げ、最大5 Workerを維持して遊ばせない。
- 旧：`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requests.md:19`（定常とburst最大5は、実測capacityが成立するときだけ）、`three-lane-capacity-profile-requirements.md:31`（active WIPはreview待ち・CI・衝突から導く）、`docs/design/helix/L3-requirements/management-integration-cell-requirements.md:59-60,106`（競合しないREADY taskを抽出し、空いたセルへ次のREADY taskを入れる）。
- 現行採択：OS `:223-225`（資源・WIP・待ちの区別、backpressure）、`:227-228`（固定数を恒久要求にしない）、`:561,564`。
- 候補化する差：レーン・Workerごとの稼働・待ち・遊休を観測する。依存と順序を保ったまま、遊休枠を「変更pathが重ならない・依存がない・低影響」のREADY taskで埋める。上限（例：5）は運用設定値にする。遊休の検知を発行のトリガーにする（さぼらせない）。
- 主担当はOS。遊休タスクの影響度評価はINTELLIGENCEの配置案に接続する。

### O4 レーンの役割と逆向き、Cursorの扱い、要求・設計の優先配置

- PO意図：主な検収レーンはClaudeにする。空いていればClaudeをWorkerにしてCodexにreviewさせる逆向きも可能にする。Cursorクラウドエージェントは作成Workerで、reviewerにしない。要求とデザインはClaudeへ優先して投げる。
- 旧：`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md:39,46-47`（Cursorは専用branchのWorker、changes requestedは元branchへ返す）、`resident-lane-orchestration-requirements.md:675-686`（配車表、設計はbenchで適性が確認されたworkerへ）。
- 現行採択：OS `:539,552`、`docs/governance/decisions/handoff-integration-po-decisions-2026-09-26.md:26-28`（LABOの水準→INTELLIGENCEの配置案→OSが指定）、`worker-execution-model-po-decisions-2026-09-26.md:46,52`、運用モデル `github-upstream-operating-model.md:199`（同じruntimeが両レーンを兼ねない）、INTELLIGENCE `:104`。
- 候補化する差：作成とreviewの向きをtaskごとに入れ替え可能にする（自己review禁止と同時兼任禁止は維持する）。provider別の「作成のみ」制約（例：Cursor）を配置条件として持てるようにする。要求・設計taskの優先配置は、固定ルールではなくLABOの計測結果として配置に効かせる。POの初期方針としてClaude優先を置けるようにする（選択肢として提示）。

### O5 検収セッションを負荷に応じて追加する

- PO意図：検収が増えたらセッションを2つにする。
- 旧：`three-lane-capacity-profile-requirements.md:35`（reviewer稼働率が閾値を超えたときだけ第3reviewerを追加）。
- 候補化する差：review待ちの行列長・待ち時間で検収セッションを追加・縮退し、それでも追いつかないときだけWorker投入をbackpressureする。PRごとに担当検収セッションを1つに固定する（二重処理を防ぐ）。複数検収の並行mergeでも、merge直前の最新main試験mergeとstale=0、exact HEAD一致を各mergeで満たす。追加数は設定値にする。
- 主担当はOS（O3と接続）。

### O6 merge後の自動片付け、base drift時の自動再照合と作成側返却

- PO意図：自動リベース、自動リチェイン、merge後の関連worktree・branchの自動片付け。ただし衝突の危険があるときはエージェントへ返す。
- 旧：root `CLAUDE.md:201`（delete-branch-on-merge維持）、`:229`（rebase/stack）、`three-lane-capacity-profile-requirements.md:43`（衝突解消は作成側・統合ownerへ返し、reviewerはworker branchを直接修正しない）、`management-integration-cell-requirements.md:66`（直列にmergeし、先行merge後に残りのbase driftを再判定）。
- 現行採択：運用モデル `:140`（PR branchへbaseを取り込まない。merge直前の試験mergeでstaleなら作成側へ返す）、`:172`（merge commit）、OS `:64`。未採択：OS-035（OS `:995,1007`、stacked PR）。
- 候補化する差：
  - merge後に関連するworktree・local branchを自動で片付ける。remote branchは許可範囲内で片付ける。
  - merge後に後続PRを最新mainと自動で試験mergeし、衝突・stale・依存PRのbase変化を検知したら作成側へ理由付きで返す（自動rebaseでPR branchを書き換えない）。
  - 衝突がなく作成側が自分で載せ直したら、再review依頼を自動で起こす（リチェイン）。
- 現行の「exact HEADをreviewしてからmergeする」原則と矛盾しない形にする。PR branchの自動rebaseを採る案は、原則との差と理由を示す別選択肢として提示する。

### O7 コネクタの型：方向・順序を属性、「戻り」関係と終了条件を追加（新規案）

- PO意図：フィードバック、ループ、双方向、直列のコネクタ型を足す。
- 現行採択：CONNECT `docs/helix-connect/L2-requirements/connect-requirements.md:31-39,45,58`（unit／connection／composite、接続identityに方向を含む）、LABO `:159-161`、HARNESS `:66,182`（relation種別：包含・接続・依存・制約・検証）。
- 旧：該当する型名の根拠なし（Explore調査で確認。新規案として扱う）。
- 候補化する案：
  - 方向（片方向・双方向）と順序（直列・並列）を接続の属性にする。
  - relation種別に「戻り（feedback）」を追加し、理由を必須にする。
  - ループは「送り＋戻り＋終了条件（再試行上限・budget）」の合成で表す（OS-040の上限と接続）。
  - O1・O2・O6の返却を、この「戻り」で表せることを示す。
- 型を4つ増やす案は、別選択肢として比較して提示する。主担当はCONNECT（必要ならHARNESS relation語彙）。

### O8 HELIXの語源に合わせた作業単位の命名（取り下げ、2026-09-29）

- POが取り下げた（原文）：「じゃあ、やめとくか。暴走しそうだし。」
- 経緯：POがticketをGene（作業とCIの1組）、リファクタリングをリボソーム・アポトーシスとする命名案を出した。Claudeは、大きさや段取りの名前には効くが、責務・権限の語に比喩を挟むと解釈の余地が生まれ、AIが比喩から性質を広げるおそれがあると評価した。POはこれを受けて取り下げた。
- 扱い：候補化しない。用語集、要求本文、ticket名に生物学の比喩名を入れない。
- 残す点：取り下げたのは名前だけである。O1（ticketに参照を付けず、成果物の一部として扱わない）と、依存・順序をticket本文でなくOSの計画・relation側で持つことは、O1・O7と既存の旧source起点のまま進める。

### O9 命名規則：役割の型と対象で名前を決める（旧HIL-FR-40／HIL-NFR-25起点）

- POの発言（原文、O8取り下げの直後）：「逆にそういうのでわかりやすく命名ルールを決めたら？BRAINもそれがあるとめちゃくちゃぶんかいしやすくならない？」
- 旧source起点（新規案ではない）：
  - 旧`HIL-FR-40`（`infinity-loop-platform-requirements.md:130`）：Domain Object/Naming Catalog。設計objectを`Entity/ValueObject/Aggregate/DomainService/Policy/Specification/Command/Query/DomainEvent/Receipt/Port/Adapter/Repository`へ分類し、canonical termを持ち、objectとsymbol、test oracleを別edgeで結ぶ。内部renameでもidentityを保つ。
  - 旧`HIL-NFR-25`（同`:205`）：Domain Eventは完了事実の過去形、Queryは副作用なし。`Manager/Helper/Util/Data`等の責務が分からない名前を根拠なしで許さない。
  - 旧basic design §4.4（`infinity-loop-platform-basic-design.md:324-`）：`naming_decisions`（candidate/canonical、semantic signature、consumer、例外owner/expiry）と`rename_receipts`。
  - 現行の扱い：HIL-FR-40は`legacy-ir45-remaining-disposition-2026-09-28`で「scope判断pending」、HIL-NFR-25は`legacy-ir108`で主に実装/技術具体化に分類。`helix-structure-tvo-po-statements-2026-09-18.md:136`は両者を「DDDの設計規律を既に要求として持っている」と記す。独立したL2候補にはなっていない。
- 候補化の方向（比喩を使わず、名前から役割・大きさ・性質が読める規則にする）：
  - 名前は「対象＋役割の型」で作る。役割の型は閉じた語彙から選ぶ（旧HIL-FR-40の型が起点）。責務が曖昧な語（Manager/Helper/Util等）は理由と期限がなければ使わない。
  - 大きさの階層は既存の語を正とする。BRAINは採択済みL2-002の`Domain → Pattern → Design Unit → Part`、作業単位はOS-047のticketとWBS（保留中のHARNESS-045／OS-039）。新しい階層名を足さない。
  - 名前の決定と改名を記録として残し、名前が変わってもIDとtest oracleの対応を保つ（旧naming_decisions／rename_receipts）。
- BRAINとの関係：BRAINのPattern・Part等に同じ型の語彙を使うと、分解の粒度と役割が名前で揃い、重複・曖昧な知識を見つけやすくなる。BRAINは語彙（型と例）を再利用知識として持ち、各製品の採用はBRAIN-L1-012のとおり製品側で判断する。
- 主担当の案：規則（命名・改名の義務と検査）はHARNESS、型の語彙の再利用知識はBRAIN。OS・SECURITY等の責務名、既存ID、採択済み本文の名前は変えない。
- 自動修正（PO発言原文「botとかも決まったものは自動で直せるやん？」）。旧sourceが境界を既に持つ：旧`HIL-NFR-24`（`infinity-loop-platform-requirements.md:204`：文字列の類似だけでrenameしない。全consumer、最小変換、振る舞い不変、rollbackを求める）、旧basic design `:291,298-302`（`semantic_rename`：内部識別子は扱えるが、公開API/CLI、永続DB field/event、consumerが直接参照する設定keyのrenameは互換migrationを持つ別経路へ回す。名前だけの候補は拒否）、旧`HIL-FR-53`（`:143`：renameしてもasset IDを保つ）。これを起点に次の二段にする。
  - 自動で直す：名前の台帳で正式名が既に決まっている、内部識別子だけ、全consumerを追える、振る舞い不変を検証で確かめられる、の全部を満たす違反。botは作成側として修正を出し、改名記録を残す。通常のPRと同じく独立reviewとmerge admissionを通し、botが自分でmergeしない。
  - 返す：役割の型が判断できない、名前が似ているだけ、公開名・DB field・event・設定key、consumerを追いきれない場合。修正せず、理由を付けて作成側または設計へ返す。返した理由はO2の学習ループへ入れる。
  - 締めすぎない：検出だけで作業を止めない。自動修正できない違反は警告として記録し、期限付きの例外で先へ進められる。
- CIとの連動（PO発言原文「CIとかも連動しよう。Geneチケットはわかりやすかったなｗ」）：命名の検査を新世代CIの検査項目にする。旧`HIL-FR-40`は、objectとtest oracleを別edgeで結び、名前が変わってもoracleの対応を保つことを既に求めている。新世代CIは未構築なので、ここでは要求として置くだけにし、旧CIは動かさない。CIの役割は、違反の検出、上記の自動修正候補の提示、返却理由の記録（O2）までとする。CIがmergeを判断することはしない。O8で取り下げたGeneの中身（ticketを作業と検証の1組にする）は、比喩名を使わず「ticketは作業と、それを確かめる検証を1組で持つ」という平易な言葉で、O1／OS-047・HARNESS-036と合わせて扱う。
- コード（Pythonコア等）への適用（PO発言原文「Pythonコアも中身で名称決まってたら引きやすくならない？」）：旧`HIL-FR-40`はimplementation symbolをdomain objectへ結ぶことを既に対象にしている。旧basic design §4.4の`domain_object_symbols`（path/export/symbol）も同じである。モジュール・クラス・関数も「対象＋役割の型」で名付けると、名前から探せ、同じ役割の重複や置き場所の誤りを検出しやすい。具体的な命名表と検査器はL3以降で決め、L2では文書・設計object・コード識別子に同じ規則を当てることまでとする。
- 注意：命名は設計規律であり、具体的な語彙表・検出器・DB tableはL3以降で決める。L2では「役割の型で名前を付け、曖昧な名前を検出して返す」までにとどめ、締めすぎない（例外は理由・owner・期限付きで許す）。

### O10 Visual Design HARNESS：制約内で画面を作り、表示して測り、人が合意する（旧VDH-FR起点）

- POの発言（原文）：「Visual Design HARNESSってデザイン能力が上がった君ならどう作ればいいかわかるんじゃない？」「せやね。画面検証の精度がよくないとはずす。あとは余計に文字書きすぎないとか。」
- 旧source起点：
  - `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md`（VDH-FR-001〜019）。特に次の4つ。
    - 005：白紙から生成せず、Pattern Contractの中で構成し、UI profileを持つ。
    - 003：screen/region/slot/action/state のsemantic IDを使う。
    - 010：`implemented` と `ux_verified` を分ける。
    - 013：AIはvision、brand、prototype合意を自己承認しない。
  - `archive/.../docs/governance/design-harness-assessment-audit-2026-07-19.md`（POの改善提案6項目と実装優先順位）。
  - 旧`CLAUDE.md:84`（人の直接関与はL2デザインモックまで）。
- 現行の位置：
  - Conceptの「部品：デザインHARNESS」。
  - `HELIXBRAIN-L2-006`（Visual Design/UXの再利用知識。製品固有のVisual Identityは製品CORE）。
  - `HELIXBRAIN-L2-023`（BRAIN↔Visual Design HARNESSの接続）。
  - HARNESS側には受け皿がない（`helix-structure-tvo-po-statements-2026-09-18.md` の #1853）。
- 候補化の方向（1.0の範囲）：
  1. BRAINのPattern、製品のVisual Identity（CORE）、UI profile（情報の優先順位など）を制約として受け取り、その範囲で画面の試作（HTML等）を作る。
  2. 画面の部品にsemantic IDを付ける。O9の命名規則と同じ規則を当てる。
  3. 試作を実際に表示し、機械で判定できる項目を自動で測る。
     - アクセシビリティ
     - コントラスト
     - 画面幅ごとの崩れ・はみ出し
     - 主要状態（空・読込中・エラー等）の有無
     - 文字量
     結果は証拠として残す。
  4. 見た目の好みとbrandの判断、試作への合意は人（PO）が持つ。AIは案と改善候補を出すまでとする。
  5. `implemented` と `ux_verified` を分ける。
- POが示した重点：
  - **画面検証の精度**：表示結果の検査が外れると役に立たない。
    - 検査項目ごとに、誤検出・見逃しを確かめる既知の正例・反例fixtureを持たせる。検査の精度は評価できる形にする（LABO連携）。
    - 精度が確認できない検査は合格の根拠にしない。警告として扱う。
    - 旧VDH-FR-011のUX evidence条件（状態、画面幅、device条件）を起点にする。
  - **文字の書きすぎを防ぐ**：画面の文言を必要最小限にする。
    - UI profileに、画面・領域ごとの文言の役割と上限の目安を持たせる。例：見出し、ラベル、補足、エラー。
    - 上限を超える文言、同じ内容の繰り返し、説明のための説明を検出して、作成側へ返す。
    - 旧sourceには文言量の明示規則が見当たらない（旧L3 requirementsとL2-screenを検索した）。新規案として示し、旧VDH-FR-005の「情報優先順位」とPOの改善提案3「Content Block」を意味の起点にする。
- 後の版へ回すもの（締めすぎない、Web展開後）：
  - 試作と実装のずれの検出
  - 実データ・実利用者によるUX評価
  - 計測eventの結線
  - 旧版の重い仕組み（211ファイルの入力、gateごとのsub-check、DB）。移植しない。
- 主担当：HARNESS（部品：デザインHARNESS）。BRAIN（再利用知識）、LABO（検査精度の評価）、INTELLIGENCE（配置）は既存の接続のまま使う。
- 作成と検証の配置：O4の「要求・設計はClaudeを優先」に当たる。POが逆向き（Claude作成、Codex review）を選んだ場合はClaudeが候補を書く。選ばなければ通常どおりCodexが書く。

## 成果物と順序

0. P0（1PR）→ P1（機能単位ごとに1PR）→ P2 を先に行う。
1. O1＋O2（OS・LABO・INTELLIGENCE）→ O3＋O5（OS）→ O4（OS／運用モデルとの関係）→ O6（OS・運用モデル）→ O7（CONNECT）を目安に、1論点群＝1PRにする。
2. 各PR：L2候補とL11受入候補を対で起こす（成功条件・反例）。source-lines／coverage receipt／registerへのappend、PO判断packet（md/json）とinventoryの追随、研究pinとbindingの付け直しを行う。
3. 各PRの本文とPO packetに「旧source起点の部分」「新規案の部分」「採択済み要求との境界」「推奨とPO選択肢」を書く。
4. Draft PR→通知箱でreview依頼→指摘0件でReady化。自分でmergeしない。
