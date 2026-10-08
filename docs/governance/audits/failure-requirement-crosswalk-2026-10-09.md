# 失敗→機構→承認済み要求の対応表（監査記録、2026-10-09）

- 状態：監査記録（その時点の記録であり、書き換えない。要求・承認・gate・Issue closeを生成しない。authority_effect: none）
- 作成：2026-10-09。Claude（lane review_merge）がWorkerへ切り出した読み取り専用の調査を、Claudeが確認して記録した。外部repositoryへの書込み、旧CLI・hook・runtime・CIの起動はしていない。比較基準のHELIX revisionは`fe3332d6b8a2b2ff9bf0387b07c544b5bb45b464`で、本書を置いた時点のmain `9a443f32f079423f2144a1e16e4a4bad3bf4ba59`との間でL2本文・判断記録・運用モデル・AGENTS.mdに差分がないことを確認した。
- 目的：PO原則（`docs/governance/decisions/learn-from-failures-principle-po-decision-2026-10-09.md`「各機構は、記録された失敗を防ぐ機構として読む。各要求の意味は、その要求がどの失敗を防ぐかで確かめる」）の最初の適用として、記録された失敗の型を現行の承認済み要求へ対応させる。**要求の意味は変えず、新しい要求・gate・承認手続きを作らない**。失敗や運用規則から製品要求は生成しない（同判断記録の判断）。

## 0. 観測したrevisionと方法

| 対象 | revision | 備考 |
|---|---|---|
| HELIX-HARNESS（現行要求・判断記録） | `origin/main` = `fe3332d6b8a2b2ff9bf0387b07c544b5bb45b464` | L2本文は`git show origin/main:<path>`で取得。表中の「path:行」はこのblobの行番号 |
| UT-TDD_AGENT-HARNESS | `68ea9de62701df39d0386e6cf0689c4dfc0e5875` | Issue番号は`derived-repos/ut-issues.json`（330件）でtitleを照合。照合したのは #232・#384・#426・#794・#578・#661・#434・#444・#439・#749・#919・#227・#913。未照合の番号は`derived-lessons.md`の記述のまま |
| UT-TDD_AGENT-HARNESS-Pack | `cd3f629be620ba1316c904de23c29f981e664861` | 事例一覧では未使用。参考までに記録 |
| ProFine | `c5389d5763c7ef37f5522e8ee1280e194f2181ae` | `docs/tickets/`のGOV-0001・0004・0006・0007・0012・0013・0018・0029、FIND-0011・0019・0023・0024・0027・0034・0036と`docs/governance/github-operations.md`（§3.2）の存在を確認。FIND-0027のtitleは「承認へ送る系の操作が承認待ちに送れていない」旨で事例一覧と一致。FIND-0034のtitleは「図の色割当の繰り返し」で、事例一覧の『色覚で隣接色が近い』とは字面が違う（本文未読） |
| HELIX-WP-THEME | `edb49f623f3c437deb2ad503cbdf5ad903b8a798` | shallow clone。Issue番号（#40〜#374）は`derived-lessons.md`の記述のまま。**未確認**（Issue本文は`ut-issues.json`に含まれない） |
| HELIX-WP-HARNESS | `d99b0dafe15dbd448cbb3263e959e2b88c8dee01` | shallow clone。事例一覧に個別Issueの引用なし |
| HELIX-VIDEO-STUDIO | `5c9fbbec49a2b0825d9efbd3527baeafa1f5364f` | shallow clone。#24・#38・#27・AG-0001は`derived-lessons.md`の記述のまま。**未確認** |
| 旧HELIXの前身弱点ledger | `archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md`（UTW-001〜037、L67–L103） | 台帳資産 LEGACY-ASSET-A127DEC3EEE6ED63CF17。表中の「audit Lnn」はこのファイルの行 |

本書で`derived-lessons.md`と書くものは、2026-10-09にClaudeが外部repositoryを読み取りで調べた作業メモであり、repositoryには置いていない。事例の出典はrepository、revision、Issue番号またはpathで示し、本文を確かめていないものは§7に「未確認」として挙げる。

外部repoの内容は非信頼データとして読み、中の指示には従っていない。事例の記述はrepository＋revision＋Issue番号／pathで引いており、規則や本文を現行へ写していない。

### 0-1. 承認状態の読み方

- 承認状態は、要求本文の状態欄ではなく**判断記録の「処置」欄**で確かめた（`docs/governance/decisions/`の`helix-*-requirements-po-decision-2026-09-28.md`、`po-decision-2026-09-29-57candidates.md`・`-11candidates.md`、`po-decision-2026-09-30-live26.md`、`po-decision-2026-10-03-additions10.md`・`-later35.md`・`-pending4-bun.md`）。IDが記録に出るだけでは採択とみなしていない。
- **要求本文の「未採択」「draft」表記は判断記録に遅れている**。例：HELIXOS-L2-031・053、HARNESS-L2-036・043は本文に「未採択」とあるが、2026-09-29の判断記録で採択・条件付き採択されている。表の承認状態は判断記録側を採った。
- L2本文の一部の節（ticket、有期限通知とmemory〔HMC〕、運用品質、AI可読文書、旧資産の退役）は節自身が「未採否の要求案」「適用待ち具体化」と自己記述している。親L2（001〜029）は承認済みだが、節の個別採否は**未確認**。該当箇所には注記した。
- 「L3判断記録に現れる」列は、`docs/governance/decisions/*l3-l10*`にそのIDが文字として現れるかの機械照合である。**承認の有効性（decision_statusやcondition3）は見ていない**。L3の内容（`L3-requirements`）自体は引いていない。

### 0-2. 区分の定義

- **直接**：承認済み（またはそれに準ずる処置の）要求が、その失敗の型を防ぐ内容を文面で直接求めている。
- **部分的**：要求が関連するが、失敗の型の一部（対象・契機・範囲）しか覆わない。覆わない部分を備考に書いた。承認済みでない要求（保留・未承認）しか当たらない型は「部分的」にせず「該当なし」とした。
- **該当なし**：承認済み要求のなかに、その型を防ぐ内容が見つからなかった（検索語と範囲は§0-3）。要求の「不在」の判定であり、要求が必要という判断ではない。
- 「運用で防止中」は区分と別に付す印である。開発repoの運用（`docs/governance/github-upstream-operating-model.md`）が今守っているものを指し、機構（製品の要求）としては移管されていない。

### 0-3. 検索範囲

10本のL2本文（helix-os／intelligence／harness／security／infrastructure／brain／connect／labo／web-os／web）を対象にした。web・web-osのL2は本文冒頭で「Visionレベルの材料（要求層ではない）」と自己記述しており、当てた要求はない。キーワード検索（worktree、TTL、lease、claim、終端、path filter、fail-open、macOS／Windows、secret、tag 等）と、OS・INTELLIGENCE・HARNESSのID見出し一覧の通読で当てた。**OS・INTELLIGENCE・HARNESS以外の機構（BRAIN・LABO・INFRASTRUCTURE）は見出し一覧とキーワード照合のみで、全文は読んでいない**ため、そこで見落とした対応がありうる。

## 1. 対応表（失敗の型 62 件）

| No | 領域 | 失敗の型 | 出典（repo＠revision＋Issue／path、またはUTW-ID＋行） | 当てた要求と承認状態 | 根拠（path:行と短い引用） | 検出・助言側（INTELLIGENCE。区分には算入しない） | L3判断記録に現れる | 区分 | 備考（覆わない部分・確認事項） | 運用で防止中（機構未移管） |
|---|---|---|---|---|---|---|---|---|---|---|
| T01 | 作業領域 | 終了済みworktree・branchが蓄積し、owner・寿命・回収が管理されない | UT-TDD_AGENT-HARNESS@68ea9de Issue #232（118本中68本終了）、#384・#426・#794（owner・TTL・回収）、#578（merge済みbranch107本）；UTW-015（前身弱点ledger L81）；HELIX実測2026-10-09（worktree 473→158、ローカルbranch 508→328を手作業整理。derived-lessons.md「改訂2」） | **HELIXOS-L2-052**（採択（2026-09-29 PO判断 57候補））<br>**HELIXOS-L2-018**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）＋2026-10-03追補承認（additions10）） | `docs/helix-os/L2-requirements/governance-requirements.md:1234`「merge済みPRとassignmentの所有関係を確認できるlocal worktreeとlocal branchだけを対象とする。所有関係を確認でき、他assignmentの使用中でなく、未完作業もない対象は、自動かつ冪等にcleanupし、対象と結果を既存の証跡経路で記録する。所有関係、使用状態、参照関…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:679`「権限・lease・capability・期限・予算・head等の不一致は実行を停止し、停止理由を記録して管理/推進へ返す。交代・失効後も累積制約と未完義務を引き継ぎ、二重作業を防ぐ。」 | ― | OS-052：os-stage4-2026-10-06<br>OS-018：os-stage2a-2026-10-05、os-stage2a-parent018019-2026-10-08 | **部分的** | 052はmerge後のcleanupのみ。未mergeで所有者・期限が不明なworktree/branchの寿命管理を直接求める要求は見つからない（#384/#794型）。018のleaseはassignment実行の失効停止で、作業領域の回収ではない。 | 運用で防止中：github-upstream-operating-model.md「作業branchとworktreeの片付け」(L350–L366)。移管の表(L385–)の当該行は移管先をHELIXOS-L2-052とする。 |
| T02 | 作業領域 | 回収操作そのものが実体を壊す（junctionを辿りnode_modules全消去 等） | UT-TDD_AGENT-HARNESS@68ea9de Issue #661（worktree削除がnode_modules junctionを辿りprimaryを全消去） | **HELIXOS-L2-052**（採択（2026-09-29 PO判断 57候補））<br>**HELIXSECURITY-L2-008**（承認済み（2026-09-28 PO判断、A案）） | `docs/helix-os/L2-requirements/governance-requirements.md:1234`「所有関係、使用状態、参照関係またはmerge後確認がunknown／conflictなら削除せず、未完理由を返す。再試行は同じassignment所有物だけに限定し、他のPR・workt…」<br>`docs/helix-security/L2-requirements/security-requirements.md:144`「read/write/execute/network/install/delete/merge/release/deploy/credential-use/security-change等を別authorityとして扱う。「Agentを使える」から包括write/deployを生成しない。高影響操作は全tuple…」 | ― | OS-052：os-stage4-2026-10-06<br>SECURITY-008：見当たらない | **部分的** | 052は「unknown／conflictなら削除せず」と定めるが、リンク越し削除という具体の失敗型は文面に無い。008はdeleteを別authorityとして扱う（所有を確認できる削除のみ許すという要求ではない）。 | 運用で防止中：operating-model L359–L360「独自の内容を持つbranchは…git bundleで事前バックアップ」「他レーンの作業には触れない」 |
| T03 | 作業領域 | 作業の元checkout・branchが最新baseから大きく遅れたまま作業・判断される | UT-TDD_AGENT-HARNESS@68ea9de Issue #434（作業コピーが151 commit古い）；HELIX実測（~/HELIX-HARNESS のHEADが fa642cddc で停止。derived-lessons.md「改訂2」） | **HELIXOS-L2-046**（採択（2026-09-29 PO判断 57候補））<br>**HELIXOS-L2-052**（採択（2026-09-29 PO判断 57候補）） | `docs/helix-os/L2-requirements/governance-requirements.md:1180`「遷移間に対象HEAD、authority、scopeまたは適用条件が変わった場合は、その変化をstale／未完として扱い、既存の判断・検証・merge admissionを再照合する。工程の一部の成功を後続段階の成功へ伝…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:1236`「上流PRのmerge後、関係する後続PRについて最新baseとの試験merge可能性、scfctl stale、依存条件およびreview bindingを再照合する。試験mergeはcontent …」 | **HELIXINTELLIGENCE-L2-009**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:98`「jection・責務・証拠。出力はauthority mismatch、design/runtime mismatch、stale assumption、missing evidence、invalid projection、responsibility leak、uns…」 | OS-046：os-stage4-2026-10-06<br>OS-052：os-stage4-2026-10-06 | **部分的** | 046/052は「PR/dispatch〜merge」の遷移でのHEAD・base再照合。作業開始前にローカルcheckoutを最新へ追随させる要求は文面に見つからない。 | ― |
| T04 | 作業領域 | merge後のbranch・状態・memory cleanupがトランザクションとして閉じない | 前身弱点ledger UTW-018（audit L84）；UT-TDD_AGENT-HARNESS@68ea9de #578 | **HELIXOS-L2-052**（採択（2026-09-29 PO判断 57候補）） | `docs/helix-os/L2-requirements/governance-requirements.md:1234`「自動かつ冪等にcleanupし、対象と結果を既存の証跡経路で記録する。所有関係、使用状態、参照関係またはme…」 | ― | OS-052：os-stage4-2026-10-06 | **直接** | 052は「冪等」「所有関係unknownなら削除せず未完理由を返す」「remote ref削除は別authority」。memory側のcleanupは052の対象外（HMC節のmemory非使用が別に効く）。 | ― |
| T05 | 作業領域 | branch上の設計・実装がmainに統合されず滞留する | 前身弱点ledger UTW-015（main未包含6 heads、最大54 commits ahead。audit L81）、UTW-033〜037（work branch固有の未統合設計。L99–L103） | **HELIXOS-L2-002**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a））<br>**HELIXOS-L2-016**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）） | `docs/helix-os/L2-requirements/governance-requirements.md:55`「-L2-002／003、HBR-P3／P9、2026-09-24 PO判断 ／ 未接続・未合意・未実装・未検証を区別し、部分成功で全体完了にならない ／…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:656`「提供**：対象ごとの要求から作業・実装・検証・提供・運用までの状態とtrace。欠落・競合・staleを正本revisionへ関連づける。」 | **HELIXINTELLIGENCE-L2-003**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:62`「equirement/design revision、ticket、state、dependency、evidence、unresolved finding、worker、model/provider、environment、cost/budget、risk、time、kno…」 | OS-002：見当たらない<br>OS-016：見当たらない | **部分的** | 状態の可視化はあるが、未統合branchの滞留を防ぐ・回収する要求は見つからない（確度低）。 | 運用で防止中：operating-model「PRの原子性」(L58–)と短命branch運用（旧源 github-operations-reference-audit L41） |
| T06 | 作業領域 | 確定済み成果物の再開（freeze後のreopen）の境界と影響再検証が弱い | 前身弱点ledger UTW-033（audit L99） | **HARNESS-L2-003**（対象revision本体に含まれる扱い。明示候補集合外で個別処置は未確認）<br>**HARNESS-L2-063**（承認（2026-09-30 通常採択22件）） | `docs/helix-harness/L2-requirements/product-requirements.md:54`「HARNESS-L2-003 ／ 工程の開始・凍結・差戻し・再開・完了に必要な条件を確認できる。画面や不確定要素のある対象は、L2.5のPrototype・PoCで不確定要素を減らしてから要件へ進む。Vの…」<br>`docs/helix-harness/L2-requirements/product-requirements.md:1241`「原sourceとauthorityを個々のatomへ結び、challenge/dispositionと全atomのrevisionが揃うまで対象revisionをactiveに…」 | ― | HARNESS-003：見当たらない<br>HARNESS-063：見当たらない | **直接** | HARNESS-L2-001〜009の個別採否はdecision record上「明示候補」ではなく対象revision本体に含まれる扱い（個別処置は未確認）。063は2026-09-30承認。 | ― |
| T07 | ticket・作業単位 | ticket本文へのIssue/PR番号の書き戻し、Issueの二重作成、ticketとIssueのstateずれ | ProFine@c5389d5 docs/tickets/GOV-0001（Issue二重作成）・GOV-0006（PR番号書き戻しでHEADが進む）・docs/revisions/2026-10-07-ticket-independence-policy.md；HELIX-VIDEO-STUDIO@5c9fbbe #24・#38（state不一致） | **HELIXOS-L2-010**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a））<br>**HELIXOS-L2-102**（承認（2026-09-30 PO判断 通常採択22件））<br>**HARNESS-L2-059**（承認（2026-09-30 通常採択22件）） | `docs/helix-os/L2-requirements/governance-requirements.md:116`「ticketが正で、GitHub IssueとPRは映しである。Issueのcloseやmergeで、ticketは完了にならない。」<br>`docs/helix-os/L2-requirements/governance-requirements.md:1290`「対象Issue source identityとHARNESS contractの同一revision、11 fieldのfield identity、version、digestを対応付けてdurableに保持・参照できる。projectionはHARNESSの意味fieldをr…」<br>`docs/helix-harness/L2-requirements/product-requirements.md:1207`「11項目をそれぞれ独立した名前付きfieldとして保持する：objective、acceptance oracle、develo…」 | **HELIXINTELLIGENCE-L2-009**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:98`「出力はauthority mismatch、design/runtime mismatch、stale assumption、missing evidence、invalid projection、responsibility leak、unsupported behavior、repeated failure、m…」 | OS-010：見当たらない<br>OS-102：見当たらない<br>HARNESS-059：見当たらない | **部分的** | L116は「ticket」節内（節冒頭が「未採否の要求案」と自己記述。親L2-010は承認）。書き戻しを禁じる要求や、projection失敗の再試行での二重作成防止は文面に無い。102は意味fieldのdurable保持。 | 運用で防止中：operating-model「IssueとFeature Ticket」(L178–L192)。移管先はHARNESS-L2-059／HELIXOS-L2-102／054だが「L3の承認記録は見つかっていない」と同表に記載。 |
| T08 | ticket・作業単位 | 並行PRが連番・節番号を取り合って衝突する（改訂メモ版、第N陣、節番号） | ProFine@c5389d5 docs/tickets/GOV-0004（改訂メモ版の衝突）・GOV-0029（第N陣・節番号。1件1ファイル化） | （なし） | （該当なし） | ― | ― | **該当なし** | 採番の競合を避ける要求は見つからない（HARNESS-L2-053はassetのpath非依存identityで、採番方式を決めないと明記: L1143）。 | 運用で一部防止：AGENTS.md「版ごとの別ファイルを作らない」は逆方向の規則で、正本ファイルへの並行PR衝突とは別。共通部品を先行PRで閉じる運用(operating-model L65–L69)。 |
| T09 | ticket・作業単位 | 並行作業の変更path競合・共通ファイル衝突 | ProFine GOV-0004/0029 の型；HELIX #2564（274件L3/L10を1PRに集約し兄弟対象の取りこぼし再発。operating-model L112） | **HELIXOS-L2-049**（条件付き採択（2026-09-29）） | `docs/helix-os/L2-requirements/governance-requirements.md:1209`「ine・scope・single-writer/authority lease・changed-path競合・review/merge義務を保ち、低影響の適格性を確認できる場合に限る。適格性の材料はINTELLIGENCEの配置…」 | **HELIXINTELLIGENCE-L2-006**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:80`「はrequirement/design/dependency impact、regression、CI failure、integration conflict、performance/release risk、worker failure、cost/timeのpredictio…」 | OS-049：os-stage3-2026-10-05 | **部分的** | 049は割当時に競合しない独立READY taskだけを遊休Workerへ回す具体化（条件付き採択）。PRのmerge時の衝突解決は対象外。 | ― |
| T10 | ticket・作業単位 | 変更単位が大きすぎる（巨大PR、単一PRへの混載） | HELIX-VIDEO-STUDIO@5c9fbbe PR #27（549 files）；HELIX #2564（operating-model L112） | **HARNESS-L2-045**（保留（09-29、10-03も維持））<br>**HELIXOS-L2-039**（保留（09-29、10-03も維持）） | `docs/helix-harness/L2-requirements/product-requirements.md:1019`「依存先が未完了の作業を並列可能として扱わず、直列化が必要な関係とその理由を追跡する。依存区分の意味はHARNESS-L2…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:1119`「親要求が無い、依存が循環、budgetが無い、同じ意味の既存作業がある、または有効契約revisionに形が適合しない場合は新規identityで登録可能としない。」 | ― | HARNESS-045：harness-stage3-parent044-2026-10-07<br>OS-039：見当たらない | **該当なし** | 作業単位の形を定める045と登録側の039はいずれも保留中のため「承認済み要求」ではない。HELIXOS-L2-046は粒度でなく遷移間の連続性を扱う。 | 運用で防止中：operating-model「PRの原子性」。同ファイルの移管の表は移管先にHELIXOS-L2-046／HARNESS-L2-045を挙げるが、045は保留（判断に迷った点§6-2）。 |
| T11 | ticket・作業単位 | Issue Formsの入力が作業権威にならずlabel/inboundの運用が閉じない | 前身弱点ledger UTW-017（audit L83） | **HELIXOS-L2-102**（承認（2026-09-30 PO判断 通常採択22件）） | `docs/helix-os/L2-requirements/governance-requirements.md:1290`「対象Issue source identityとHARNESS contractの同一revision、11 fieldのfield identity、version、digestを対応付けてdurableに保持・参照できる。projectionはHARNESSの意味fieldをr…」 | ― | OS-102：見当たらない | **部分的** | 102はHARNESSのIssue contract field保持。Formsのlabel bootstrap等の運用面は文面に無い。 | 運用で防止中：operating-model L186（local ticketが無いIssue Form入力はwork authorityにしない） |
| T12 | 通知・配送 | 通知に終端状態がなく、完了済み作業で再起床する・滞留する | UT-TDD_AGENT-HARNESS@68ea9de #444（終端状態なしで再起床、184件滞留）、#439（閉じられないrequestがdeadlock）；HELIX実測（merge済み#2717のmerge依頼で起床、request01〜04の積み重ね。derived-lessons.md「改訂4」） | **HELIXOS-L2-004**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a））<br>**HELIXOS-L2-009**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）） | `docs/helix-os/L2-requirements/governance-requirements.md:364`「重複配送・再送・消費・期限切れ・訂正・crash後再開を追跡できる。無効記録は監査履歴として参照できてもcurrent guidanceへ再表示されない ／…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:297`「だけcheckpointを公開する。session交代で予算・期限・失敗回数・未完義務を初期化せず、同一作業の二重claimや副作用を防ぐ ／ HBR-P1、…」 | **HELIXINTELLIGENCE-L2-007**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:86`「発生中のsymptom/error/stallとevidence、出力は候補原因、切り分け証拠、診断案、追加観測・検査。相関一つで原因を確定せず、終了済みの複数epi…」 | OS-004：infrastructure-stage5-2026-10-07、labo-stage5-parent068-2026-10-07<br>OS-009：見当たらない | **部分的** | 引用は「有期限通知とmemory」節(HMC-BR-005行)で、節は親004/009の具体化だが同節に「IRやruntimeへ昇格させない」との断りあり。無効記録の再表示禁止は文面にあるが、「終端状態を持たない通知の再起床」「閉じられない依頼の失効」を名指す要求は無い。 | 運用で防止中：operating-model「GUIレーンの運転と通知」(L314–L343)。移管表の当該行は「移管先の要求を特定していない」と明記。 |
| T13 | 通知・配送 | 同一requestへ2本目のreviewer／他宛てentryでclaim停止／claim無しの二重配送 | UT-TDD_AGENT-HARNESS@68ea9de #749・#919；HELIX-WP-THEME@edb49f6 #202 | **HELIXOS-L2-009**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a））<br>**HELIXOS-L2-018**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）＋2026-10-03追補承認（additions10））<br>**HELIXCONNECT-L2-004**（承認済み（2026-09-28 PO判断）） | `docs/helix-os/L2-requirements/governance-requirements.md:297`「だけcheckpointを公開する。session交代で予算・期限・失敗回数・未完義務を初期化せず、同一作業の二重claimや副作用を防ぐ ／ HBR-P1、…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:679`「理/推進へ返す。交代・失効後も累積制約と未完義務を引き継ぎ、二重作業を防ぐ。」<br>`docs/helix-connect/L2-requirements/connect-requirements.md:93`「同じidentityで異なるdigestを検出した場合は衝突として拒否し、別内容を再送として処理しない。再送不能な業務結果は再送せず、判定主体へ返す。C…」 | ― | OS-009：見当たらない<br>OS-018：os-stage2a-2026-10-05、os-stage2a-parent018019-2026-10-08<br>CONNECT-004：見当たらない | **部分的** | 009/018は作業の二重実行防止、CONNECT-004は機構間送信の重複排除。reviewer割当の排他やクレーム耐障害性（他宛てentryで止まらない）を名指す要求は見つからない。 | ― |
| T14 | 通知・配送 | publish成功を配送成功と扱う／ACKなしの黙殺 | UT-TDD_AGENT-HARNESS@68ea9de #227（Codex→Claudeのreview依頼7件が未配送で滞留） | **HELIXCONNECT-L2-001**（承認済み（2026-09-28 PO判断）） | `docs/helix-connect/L2-requirements/connect-requirements.md:49`「ACKなし、許可失効、送信後の結果未回収はresult stateをunknown/unfinishedとして保持し、業務完了扱いせず、送信を止めて関連する接続先ownerへ返す。」 | ― | CONNECT-001：connect-stage1-2026-10-05、connect-stage1-parent001-review02-2026-10-08 | **部分的** | CONNECTは機構間の接続一般の要求で、開発repoのGUI通知箱とは対象が別。同旨の「配送不成立を成功扱いしない」は運用モデルが担う。 | 運用で防止中：operating-model L322「queuedや登録済みleaseだけで配送成功とせず…配送不成立とする」 |
| T15 | 通知・配送 | hookが無言で失敗する（exit codeの意味違い） | HELIX-WP-THEME@edb49f6 #374（hookがexit 1で無言失敗。asyncRewakeはexit 2のみ） | **HELIXSECURITY-L2-004**（承認済み（2026-09-28 PO判断、A案）） | `docs/helix-security/L2-requirements/security-requirements.md:104`「別project、古い版、未知のHook/設定を黙って採用しない。内容変更とauthority変更を識別…」 | ― | SECURITY-004：見当たらない | **該当なし** | 004はHook/設定の採用の完全性で、hookの実行失敗を可視化する要求ではない。 | 運用で防止中：operating-model L322「宛先のhookがGUIで信頼・読込されていないとき…配送不成立」 |
| T16 | 通知・配送 | memory・セッション状態に恒久規則や状態を置き、worktree間で共有されない／規則と状態が混在する | HELIX-WP-THEME@edb49f6 #180（memoryがworktreeをまたがない）、#197（セッション状態と恒久ルールの混在） | **HELIXOS-L2-004**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a））<br>**HELIXOS-L2-007**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）） | `docs/helix-os/L2-requirements/governance-requirements.md:365`「すべてのproviderの標準memory（provider native memory）を使わない。session history・user設定も共有通知やauthorityへ暗黙混入しない（2026-09-24 PO判…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:295`「memoryの内容を責務正本へ反映してからretireし、古い指示を再提示しない ／ HBR-P7／P9、v1.3 HR-FR-HYB-005／006 ／…」 | ― | OS-004：infrastructure-stage5-2026-10-07、labo-stage5-parent068-2026-10-07<br>OS-007：見当たらない | **直接** | 引用は「有期限通知とmemory」節（HMC-BR-006）と責務表(L2-007行)。節は親004/007/009の具体化で自己記述上は昇格しない旨を持つ。 | ― |
| T17 | 通知・配送 | PO指示・判断が共有されず後の作業で失われる | HELIX-WP-THEME@edb49f6 #181（PO指示の共有漏れ） | **HELIXOS-L2-001**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）＋2026-10-03追補承認（additions10））<br>**HELIXOS-L2-034**（採択（2026-09-29 PO判断 57候補）） | `docs/helix-os/L2-requirements/governance-requirements.md:54`「プロジェクトごとの企画・要求正本・採否・合意revisionと担当責務を確認できる ／ HCV4-L2-001／002、HBR-P9 ／ GitHubの状態から要求を推定せず、何に対する要求かと判断の出所が分かる ／…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:949`「どの証拠があればduplicate／false-positive／accepted-risk／cancel／supersede dispositionを確定できるか、当該dispositionへのchallenge/reopenをどう原記録へ結ぶかは、既存L2/L11の成功・反例or…」 | ― | OS-001：見当たらない<br>OS-034：os-stage3-2026-10-05 | **部分的** | 034は原指示の保持とfinding dispositionの証拠。PO発言をどう他レーンへ共有するかの運用面は文面に無い。 | ― |
| T18 | 構成・文書 | 設計保護gate・検査が固定pathに依存し、再編で黙って無効化する | UT-TDD_AGENT-HARNESS@68ea9de #913（src/とscripts/固定で再編後に無効）、ロードマップ工程④（後からの大規模再編。derived-lessons.md「改訂5」）；ProFine GOV-0007・GOV-0018（接頭辞とpath照合、rename元path） | **HARNESS-L2-053**（採択（2026-09-29 11候補））<br>**HARNESS-L2-082**（承認（選択・適用範囲付き、2026-10-03）） | `docs/helix-harness/L2-requirements/product-requirements.md:1141`「path・名称の変更から独立したimmutable asset IDとrevision履歴を保持する。意味変更を新revisionとして記録し、re…」<br>`docs/helix-harness/L2-requirements/product-requirements.md:1403`「の差分を検出した場合、またはextractor revisionが変化した場合、以前の選択scopeに属するchild receiptすべてをstaleとして保持し、そのscopeの新しい照合が終わるまで過去r…」 | **HELIXINTELLIGENCE-L2-009**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:98`「authority mismatch、design/runtime mismatch、stale assumption、missing evidence、invalid projection、responsibility leak、unsupported behavior、repeated failure、mechanism-boundary violation等の監査候補で、target HEAD/authority/…」 | HARNESS-053：見当たらない<br>HARNESS-082：見当たらない | **部分的** | 053はassetのidentityをpathから独立させるが、検査適用範囲の自動追随を求めてはいない。082は承認済み（2026-10-03）。 | ― |
| T19 | 構成・文書 | 入口文書（CLAUDE.md／AGENTS.md）が規則追加で肥大する | UT-TDD_AGENT-HARNESS@68ea9de CLAUDE.md 36,647B／AGENTS.md 24,776B（derived-lessons.md「review・AI運用」）；前身弱点ledger UTW-025 | **HELIXOS-L2-001**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）＋2026-10-03追補承認（additions10））<br>**HARNESS-L2-085**（承認（本文どおり、2026-10-03）） | `docs/helix-os/L2-requirements/governance-requirements.md:257`「HELIXOS-L2-001／002／003／004／005／007／009の適用待ち具体化として保持する。session開始時に対象project・product、…」<br>`docs/helix-harness/L2-requirements/product-requirements.md:1436`「過剰な重複contract/exampleをcontext costとdrift riskのfindingとして明示する」条件だけである。全…」 | ― | OS-001：見当たらない<br>HARNESS-085：見当たらない | **部分的** | OS節「AI可読文書の生成・適用統制」は適用待ち具体化。肥大の抑止は085（重複によるcontext cost finding）が近いが、入口文書の大きさを直接制約する要求は見つからない。 | 運用で防止中：operating-model L378–L384「規則を足す条件と、減らす条件」 |
| T20 | 構成・文書 | 正本と誤認される旧文書・docs過多で正本の認識負荷が高い | 前身弱点ledger UTW-025（audit L91；docs 1,045／Markdown 1,311） | **HELIXOS-L2-006**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）） | `docs/helix-os/L2-requirements/governance-requirements.md:176`「旧資産は元の相対構造、provenance、digestを保った非実行archiveへ先に隔離し、current startup、authority検索、AI context、…」 | ― | OS-006：見当たらない | **部分的** | 引用はOS「旧資産の退役・archive統制」節（001/002/003/006/007/009の適用待ち具体化。親001〜029は承認済みだが節の個別採否は未確認）。量による認識負荷そのものを扱う要求は見つからない。 | ― |
| T21 | 構成・文書 | 旧toolchain・旧層番号（Bun、L0〜L14）が現行authorityとして埋め込まれる | 前身弱点ledger UTW-001・UTW-010（audit L67・L76） | **HELIXOS-L2-132**（承認（改訂003、2026-10-03 pending4）） | `docs/helix-os/L2-requirements/governance-requirements.md:1666`「が求めること**：HELIXの開発・実行・検証・配布に用いるsurfaceでは、今後もBunを使用せず、新たな使用や再導入をしないことを保証する。加えて、旧HELIXのBun依存撤去に対応する一回のrepository移行では、対象repositoryのacti…」 | ― | OS-132：見当たらない | **直接** | 132は2026-10-03承認（-003）。層番号の埋め込みについては別（HARNESS-L2-001のcanonical pair）で、本行はBunを主とする。 | ― |
| T22 | 構成・文書 | prose／CURRENTのhandoverが継続の正本となり、event projectionと競合する | 前身弱点ledger UTW-002（audit L66） | **HELIXOS-L2-009**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a））<br>**HELIXOS-L2-044**（採択（2026-09-29 PO判断 57候補）） | `docs/helix-os/L2-requirements/governance-requirements.md:297`「eventをdurableに記録して冪等に投影し、成功後だけcheckpointを公開する。session交代で予算・期限・失敗回数・未完義務を初期化せず、同一作業の二重…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:1165`「prose handoverだけをresolutionの証拠として扱わない。proseだけでfindingの状態をresolvedへ変更せず、既存のfee…」 | ― | OS-009：見当たらない<br>OS-044：os-stage3-2026-10-05 | **直接** | 044はfeedbackのresolutionに限った追補（採択）。継続一般は009と019。 | ― |
| T23 | 構成・文書 | tracked runtime stateが太く、source／evidence／generatedの境界が曖昧 | 前身弱点ledger UTW-012（audit L78；`.ut-tdd` tracked 207 files） | **HELIXOS-L2-019**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）） | `docs/helix-os/L2-requirements/governance-requirements.md:299`「ログ保存・DB投影は要求の意味正本を代替しない。必要な証拠の種類と…」 | ― | OS-019：os-stage2a-parent018019-2026-10-08 | **部分的** | 正本とprojectionの分離は述べるが、追跡対象にする生成状態の範囲を直接制約する要求は見つからない。 | ― |
| T24 | 構成・文書 | DB再構築・projection・doctorが巨大aggregateで、部分失敗の診断単位が粗い | 前身弱点ledger UTW-020・UTW-026（audit L86・L92） | **HELIXOS-L2-053**（採択（2026-09-29 PO判断 11候補、依存先と併せて）） | `docs/helix-os/L2-requirements/governance-requirements.md:1247`「全境界の必須writeが確定するまで、新しいartifact群を完全なcurrent revisionとして公開せず、先行currentを維持する。Markdown／canonical revision、event・trace・impact・stale関係…」 | ― | OS-053：見当たらない | **部分的** | 053は複数artifactの原子的確定と失敗位置の記録。検証群の分割粒度は扱わない。本文は「未採択」と自己記述だが2026-09-29の判断で採択。 | ― |
| T25 | 構成・文書 | 欠損・未観測を空集合／healthyへ縮退させる（absence blindness） | 前身弱点ledger UTW-014（audit L80） | **HELIXINTELLIGENCE-L2-012**（承認（2026-09-28 PO判断：明示候補54件））<br>**HELIXOS-L2-007**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a））<br>**HELIXINFRASTRUCTURE-L2-019**（承認済み（2026-09-28 PO判断）） | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:116`「nal evidence/Discovery/test/review/human decision。unknownをsafe/success/no-issueへ変換しない。version_t…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:327`「辿り、欠測・stale・collector停止をhealthyへ変換しない。OSは証拠と進行を…」<br>`docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:227`「古い観測をcurrentへ使わず、未収集をhealthyへ補わない。1.0のL2-004 minimum（観測不能をhealt…」 | ― | INTELLIGENCE-012：intelligence-stage3-2026-10-06<br>OS-007：見当たらない<br>INFRASTRUCTURE-019：見当たらない | **直接** | 引用のOS行は「運用品質の管理・統制条件」節(HELIXOS-L2-002/005/007の具体化。節の状態は要確認)。 | ― |
| T26 | 構成・文書 | fail-open／warn-onlyの扱いが安全・観測・可用性で統一分類されていない | 前身弱点ledger UTW-013（audit L79） | （なし） | （該当なし） | ― | ― | **該当なし** | 個別の「unknownを成功にしない」は多数あるが、fail-open許容クラスを分類する要求は見つからない。近い所管はHARNESS（検証契約）／SECURITY（fail-close原則）。 | ― |
| T27 | 構成・文書 | source atom化・採否・要件traceが閉じていない（被覆の全量性が不明） | 前身弱点ledger UTW-024（audit L90） | **HARNESS-L2-081**（承認（選択・適用範囲付き、2026-10-03））<br>**HELIXOS-L2-123**（承認（選択・適用範囲付き、2026-10-03 later35）） | `docs/helix-harness/L2-requirements/product-requirements.md:1343`「各active requirementのsource atom、authority、acceptance oracle、service/capabilityまたは根拠付き非該当、te…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:1529`「旧HIL-BR-14の一IR identity statement全体を忠実に保持する。対象入力はZIP、前身reposito…」 | ― | HARNESS-081：見当たらない<br>OS-123：見当たらない | **直接** | 081は2026-10-03承認（選択・適用範囲付き）。 | ― |
| T28 | 構成・文書 | improvement backlogのstatus名と実体が一致しない／finding消化数で自己改善を測る | 前身弱点ledger UTW-023・UTW-032（audit L89・L98） | **HELIXOS-L2-005**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a））<br>**HELIXLABO-L2-050**（承認済み（2026-09-28 PO判断）） | `docs/helix-os/L2-requirements/governance-requirements.md:31`「候補の生成件数やログの蓄積だけで改善達成とせず、採用した変更の効果と退行を確認する。」<br>`docs/helix-labo/L2-requirements/labo-requirements.md:300`「入力は許可観測・episode・実験と評価済みFeedback候補、出力はOS登録/routing後のtarget変更、target検証、運用結果、LABO再観測を結ぶ追跡可能な循環である。段階はObserved→Correl…」 | ― | OS-005：見当たらない<br>LABO-050：labo-stage5-parent050-2026-10-06 | **直接** | OS概要節(L31)の記述で、表の005行(L58)が本体。LABO-050は評価側。 | ― |
| T29 | CI・検証 | 必要な検査がCIで起動していない（path filter、e2e未実行、symlink） | HELIX-WP-THEME@edb49f6 #206（e2e未実行）、#210（path filterで未起動）、#332（symlink）；#2720参考コメント（derived-lessons.md「CI」） | **HELIXOS-L2-031**（採択（2026-09-29 PO判断 57候補））<br>**HELIXOS-L2-008**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a））<br>**HARNESS-L2-036**（採択（2026-09-29 57候補）） | `docs/helix-os/L2-requirements/governance-requirements.md:903`「AD、HARNESSが要求した検証義務と選択/非選択集合・digest、CI profile、runner OS・環境・toolchain・platform・lockfi…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:61`「未実行・失敗・中断・staleを区別し、旧CI greenで新世代未実行やreview・承認を代替しない ／…」<br>`docs/helix-harness/L2-requirements/product-requirements.md:747`「片側だけの実行、異なる内容/設定、対象snapshot/revision/scopeの不一致、または結果の欠落を同一条件の検証済みとして扱わない。dev-localとCIの…」 | **HELIXINTELLIGENCE-L2-009**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:98`「projection・責務・証拠。出力はauthority mismatch、design/runtime mismatch、stale assumption、missing evidence、invalid projection、responsibility leak、unsupported behavior…」 | OS-031：os-stage5-2026-10-07、os-stage5-nonapproval-supplement-draft-2026-10-07、os-stage5-2026-10-06<br>OS-008：見当たらない<br>HARNESS-036：harness-stage3-parent036-2026-10-06 | **部分的** | 「選んだ検査／選ばなかった検査」を記録して未実行をgreenにしない要求はあるが、変更に対して「走るべき検査が走ったか」を義務集合と突合して機械検出する要求の文言は見つからない。 | ― |
| T30 | CI・検証 | ガードを外しても全passする検査、空振りpass、before/after同一でも失敗しない検査 | HELIX-WP-THEME@edb49f6 #249〜#317（約25件）、#288（1ガード1負例）、#212、#207／#213 | **HARNESS-L2-049**（承認（2026-09-30 通常採択22件））<br>**HARNESS-L2-036**（採択（2026-09-29 57候補））<br>**HARNESS-L2-043**（条件付き採択（2026-09-29）） | `docs/helix-harness/L2-requirements/product-requirements.md:1090`「known-positive/negative fixtureで精度を評価できない、profile上限や文言役割の根拠がない場合はpassを返さず、warning/unknownと未完条件を返す。要求意…」<br>`docs/helix-harness/L2-requirements/product-requirements.md:746`「設計項目に対応しない必要テスト観点または同一観点のレベル間重複を一覧化してWゲートをfailとする。NFR-13由来の「抜け／重複0件」はこの適用scopeの判定条件として保持する。」<br>`docs/helix-harness/L2-requirements/product-requirements.md:993`「canonical positive例と境界negative例、例が確かめるoracle、risk追加例とその不足根拠、重複・冗長性findi…」 | **HELIXINTELLIGENCE-L2-015**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:134`「入力はCI/実行のfailure history。出力はfailure pattern/reproducibility/machine detectability/false positive/scope/r…」 | HARNESS-049：harness-stage3-parent044-decision-addendum-2026-10-07-fa566a38e、harness-stage3-parent049-2026-10-07<br>HARNESS-036：harness-stage3-parent036-2026-10-06<br>HARNESS-043：harness-stage3-parent043-decision-addendum-2026-10-07-330272a42、harness-stage3-parent043-2026-10-08、harness-stage3-parent043-2026-10-07 | **部分的** | 画面検査(049)とテスト観点の抜け(036)は直接に近い。一般の検査について「検出器自身の負例・mutationで無効化を検知」を求める要求は見つからない（OS-031が指標として列挙するのみ: L906）。 | ― |
| T31 | CI・検証 | 証跡の鮮度切れ・手編集 | HELIX-WP-THEME@edb49f6 #194・#243・#200 | **HARNESS-L2-072**（承認（本文どおり、2026-10-03））<br>**HARNESS-L2-080**（承認（選択・適用範囲付き、2026-10-03）） | `docs/helix-harness/L2-requirements/product-requirements.md:1350`「選択pairのstale revision・異snapshot・deferred非green候補（HARNESS-CORE unit、未…」<br>`docs/helix-harness/L2-requirements/product-requirements.md:1377`「既存のHARNESS registry内容からその対象adapterを再生成できることを要求する。同じregistry identity/revision/dig…」 | ― | HARNESS-072：見当たらない<br>HARNESS-080：見当たらない | **部分的** | 072はpair単位のstale、080はadapterの再生成。証跡ファイルの手編集検知は文面に無い。 | ― |
| T32 | CI・検証 | 外部imageのtag未固定、判定の緩和 | HELIX-WP-THEME@edb49f6 #190 | **HELIXSECURITY-L2-012**（承認済み（2026-09-28 PO判断、A案））<br>**HELIXOS-L2-031**（採択（2026-09-29 PO判断 57候補）） | `docs/helix-security/L2-requirements/security-requirements.md:184`「不明な供給元や実行能力を暗黙にtrustedへ昇格させない。」<br>`docs/helix-os/L2-requirements/governance-requirements.md:906`「検査削減、閾値緩和、timeout延長による隠蔽、外部CIへの義務の先送りを性能改善としない。wall-clockだけでなくescaped defect、mutation detectio…」 | ― | SECURITY-012：security-stage1-parents009012-review02-2026-10-08、security-stage1-parents009012-review04-2026-10-08<br>OS-031：os-stage5-2026-10-07、os-stage5-nonapproval-supplement-draft-2026-10-07、os-stage5-2026-10-06 | **部分的** | 012はprovenance、031は判定緩和の禁止（性能回収の文脈）。tag固定そのものを求める文言は見つからない。 | ― |
| T33 | CI・検証 | PR全量CIが重く、feedback loopが遅い／timeoutとself-healが長い | 前身弱点ledger UTW-008・009・026・027（audit L74–L75・L92–L93；正規test 220.54秒）；ProFine@c5389d5 docs/governance/github-operations.md §3.2、GOV-0012・0013 | **HELIXOS-L2-031**（採択（2026-09-29 PO判断 57候補））<br>**HELIXOS-L2-008**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）） | `docs/helix-os/L2-requirements/governance-requirements.md:905`「正しさが成立し性能予算だけを超えた場合、正しさの証拠を維持したまま性能未達を記録し、同じepisodeで独立の改善作業へ返す。性能未達を理由に正しさの合格を捏…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:296`「上流意味review、下流verification、merge、releaseを別pipeline classにする。失敗種別と差戻し先を保持し、検査を弱めてgreenにしない ／ HBR-P6、v1.3 HR-FR-HYB-010／§…」 | **HELIXINTELLIGENCE-L2-006**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:80`「andidate。出力はrequirement/design/dependency impact、regression、CI failure、integration conflict、performance/release risk、worker failure、cost/timeのpredicti…」 | OS-031：os-stage5-2026-10-07、os-stage5-nonapproval-supplement-draft-2026-10-07、os-stage5-2026-10-06<br>OS-008：見当たらない | **直接** | 031は2026-09-29採択。本文は「未採択」と自己記述（判断に迷った点§6-1）。 | ― |
| T34 | CI・検証 | main（統合後）が赤のまま放置される／赤の間も統合が続く | ProFine@c5389d5 docs/governance/github-operations.md §3.2（L98–）：赤なら約30分以内に修正／revert、他merge停止 | **HELIXOS-L2-031**（採択（2026-09-29 PO判断 57候補）） | `docs/helix-os/L2-requirements/governance-requirements.md:908`「旧の全件main回収とnightly補完の固定運転は、2026-09-26のPO判断によるticketからのCI導出、差分証明、LABOのすり抜け分析へ変更済みであり復活させない。必要な義務の未回収は消さない。」 | ― | OS-031：os-stage5-2026-10-07、os-stage5-nonapproval-supplement-draft-2026-10-07、os-stage5-2026-10-06 | **該当なし** | 031は旧の全件main回収を「復活させない」と既決で、ticket導出CI＋LABOのすり抜け分析(L117)を採る。ProFine型の「main赤の停止規則」を求める要求は見つからない。要求候補ではなく、PO判断済みの別方式との整合確認が先（§6-3）。 | ― |
| T35 | CI・検証 | 素のtest入口と正規runnerの意味が異なる／dev-localとCIで検査が別物 | 前身弱点ledger UTW-008（audit L74；bun test 37 fail、bun run test green） | **HARNESS-L2-036**（採択（2026-09-29 57候補）） | `docs/helix-harness/L2-requirements/product-requirements.md:742`「dev-localとCIの双方が参照できる版付き判定入力・結果照合情報を返す。画面を持つticket対象の合意済みscreen scop…」 | ― | HARNESS-036：harness-stage3-parent036-2026-10-06 | **部分的** | 036の同一契約は「ticketで選択された同一lint/gate」に限る。テスト入口一般の同一性までは言っていない。本文は「未採択」と自己記述だが2026-09-29採択。 | ― |
| T36 | CI・検証 | OS／platformの前提が偏る（Bun必須、macOS legなし、Windowsは限定） | 前身弱点ledger UTW-010・011（audit L76–L77） | **HARNESS-L2-064**（現行版では承認しない（2026-10-03））<br>**HELIXOS-L2-030**（保留（09-29、10-03も維持）） | `docs/helix-harness/L2-requirements/product-requirements.md:1253`「macOS first-class portable、Windows compatibilityという区別、同一の選択contract/fixtureを各選択profi…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:891`「Windows環境でも、Linuxと同じ選択source／artifact identityに結び付いたconsumer利用能力とentry surfaceの互換性を確かめる。」 | ― | HARNESS-064：見当たらない<br>OS-030：見当たらない | **該当なし** | 064は「現行版では承認しない」、OS-030は保留。承認済み要求は無い（Bun部分はT「旧toolchain」行の132が直接）。 | ― |
| T37 | CI・検証 | consumer setup／source／clean distributionで検証集合が分岐し、release provenanceが弱い（tag 0） | 前身弱点ledger UTW-016・UTW-029（audit L82・L95） | **HELIXOS-L2-021**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a））<br>**HELIXOS-L2-006**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）） | `docs/helix-os/L2-requirements/governance-requirements.md:706`「HARNESS構成版を対象projectへ配布・更新・復旧し、candidate/active構成版、対象、artifact、操作状態、復旧先を追跡するOSの配布運転。」<br>`docs/helix-os/L2-requirements/governance-requirements.md:59`「source・要求revision・artifactが辿れ、既存成果を壊さず導入できる ／…」 | ― | OS-021：os-stage4-2026-10-06<br>OS-006：見当たらない | **部分的** | immutable tagへのsource HEAD／digest束縛はOS-030（保留）の文面(L892)。承認済みの006/021はartifactの追跡まで。 | ― |
| T38 | 権限・供給・証拠 | repository hookで覆えないhosted surfaceが手続き依存、guard適用有無が隠れる | 前身弱点ledger UTW-003・UTW-019（audit L68・L88） | **HELIXOS-L2-004**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a））<br>**HELIXSECURITY-L2-004**（承認済み（2026-09-28 PO判断、A案）） | `docs/helix-os/L2-requirements/governance-requirements.md:293`「CLI／IDE／hosted surfaceの差でguardの適用有無を隠さない ／ HBR-P2、…」<br>`docs/helix-security/L2-requirements/security-requirements.md:104`「別project、古い版、未知のHook/設定を黙って採用しない。内容変更とauthority変更を識別…」 | ― | OS-004：infrastructure-stage5-2026-10-07、labo-stage5-parent068-2026-10-07<br>SECURITY-004：見当たらない | **直接** | OS行は責務表(L293)のL2-004行。 | ― |
| T39 | 権限・供給・証拠 | live policy（GitHub設定）と文書policyの乖離 | 前身弱点ledger UTW-004（audit L69） | （なし） | （該当なし） | **HELIXINTELLIGENCE-L2-009**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:98`「authority mismatch、design/runtime mismatch、stale assumption、missing evidence、invalid projection、responsibility leak、unsupported behavior、repeated failure、mechanism-boundary violation等の監査候補で、target HEAD/authority/…」 | ― | **該当なし** | live設定と文書の照合を求める承認済み要求は見つからない。 | 運用で防止中：operating-model L404が「持ち込まない対象」としてUTW-004を記録。守り方（照合手順）の記述は未確認。 |
| T40 | 権限・供給・証拠 | PR trace／review evidenceが最新HEAD・merge-baseへ再束縛されない | 前身弱点ledger UTW-005（audit L70） | **HELIXOS-L2-046**（採択（2026-09-29 PO判断 57候補））<br>**HELIXOS-L2-052**（採択（2026-09-29 PO判断 57候補）） | `docs/helix-os/L2-requirements/governance-requirements.md:1180`「遷移間に対象HEAD、authority、scopeまたは適用条件が変わった場合は、その変化をstale／未完として扱い、既存の判断・検証・merge admissionを再照合する。工程の一部の成功を後続段階の成功へ伝…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:1236`「base／content HEAD pairがreview済みbindingと一致し、stale=0、依存条件が維持される場合だけ既存状態を保持できる。confli…」 | ― | OS-046：os-stage4-2026-10-06<br>OS-052：os-stage4-2026-10-06 | **直接** | 046／052はともに2026-09-29採択（運用モデル表はStage 4のL3承認済みと記載）。 | ― |
| T41 | 権限・供給・証拠 | GitHub signal→Issue→PR→CI→merge→memoryが単一のexactly-once episodeで閉じない | 前身弱点ledger UTW-006（audit L71） | **HELIXOS-L2-035**（採択（2026-09-29 PO判断 57候補））<br>**HELIXOS-L2-103**（案を選択して承認（2026-09-30）） | `docs/helix-os/L2-requirements/governance-requirements.md:989`「重複した論理監査jobを生成しないOS能力を定める。旧hook/provider/author runtime、物…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:1299`「既存の適用契約に従ってOSがstage eventを受け取る場合、そのeventをappend-onlyの証拠として保ち、対象scope/revisionと因果関係を辿れる形でcurrent stateへ投影する。event…」 | **HELIXINTELLIGENCE-L2-009**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:98`「ch、design/runtime mismatch、stale assumption、missing evidence、invalid projection、responsibility leak、unsupported behavior、repeated failure、mechanism-boundary violation等の監査候補で、targe…」 | OS-035：os-stage3-2026-10-05<br>OS-103：見当たらない | **部分的** | 035はPR eventの冪等intake、103はstage eventの因果記録。memory終端まで含む単一episodeの閉包を求める要求の文言は見つからない。 | ― |
| T42 | 権限・供給・証拠 | secret／PIIの検査がwarn-onlyやhook依存で、公開情報incidentが起きる | 前身弱点ledger UTW-007（audit L72）；HELIX-WP-THEME@edb49f6 公開情報incident 2件（regexのみ。derived-lessons.md「review・AI運用」） | **HELIXSECURITY-L2-005**（承認済み（2026-09-28 PO判断、A案）） | `docs/helix-security/L2-requirements/security-requirements.md:114`「raw secretをAI contextへ渡さない。credential storeをWorkerに直接見せない。repository混入と外部送信を検査し、revokeを伝播する。単一のsecret判定正本を使う。secret値は通常artifac…」 | ― | SECURITY-005：見当たらない | **部分的** | 005は混入と外部送信の検査を求めるが、検査の強制度（warn-only不可）や検出手段の限界は文面に無い。 | ― |
| T43 | 権限・供給・証拠 | 外部MCP／tool／pluginの実行・権限・供給元検証が後追いになる | 前身弱点ledger UTW-022（audit L88） | **HELIXSECURITY-L2-010**（承認済み（2026-09-28 PO判断、A案））<br>**HELIXSECURITY-L2-012**（承認済み（2026-09-28 PO判断、A案））<br>**HELIXSECURITY-L2-034**（採択（2026-09-29 57候補）） | `docs/helix-security/L2-requirements/security-requirements.md:164`「新しいversionであることだけを更新理由にせず、未知の出所・権限・副作用・rollback欠落を黙って受け入れない。」<br>`docs/helix-security/L2-requirements/security-requirements.md:184`「不明な供給元や実行能力を暗黙にtrustedへ昇格させない。」<br>`docs/helix-security/L2-requirements/security-requirements.md:472`「profile・revision・tool capability・対象operationごとにallow/deny/unknownと不足理由を返す。能力または条件がprofile単位で欠…」 | ― | SECURITY-010：見当たらない<br>SECURITY-012：security-stage1-parents009012-review02-2026-10-08、security-stage1-parents009012-review04-2026-10-08<br>SECURITY-034：見当たらない | **直接** | 034は2026-09-29採択（57候補）。 | ― |
| T44 | 権限・供給・証拠 | 手動承認の対象・snapshot束縛・期限・再承認条件が機能ごとに不均一 | 前身弱点ledger UTW-031（audit L97） | **HELIXSECURITY-L2-008**（承認済み（2026-09-28 PO判断、A案）） | `docs/helix-security/L2-requirements/security-requirements.md:144`「高影響操作は全tupleが一致する個別authorityを求める。」 | ― | SECURITY-008：見当たらない | **直接** | 008は操作単位のtuple（actor/target/operation/revision/environment/scope/expiry）一致。 | ― |
| T45 | 権限・供給・証拠 | 完了証跡が時刻・prose・自己申告へ戻る／作成者が自分の成果を承認する | 前身弱点ledger UTW-021（audit L87） | **HELIXOS-L2-007**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a））<br>**HELIXOS-L2-018**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）＋2026-10-03追補承認（additions10）） | `docs/helix-os/L2-requirements/governance-requirements.md:60`「YB-006、2026-09-24 PO判断 ／ 欠落・重複・古い証拠を識別し、ログの存在だけで承認・完了にしない ／…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:677`「作成Workerが自分の成果を承認または独立review済みに扱わない。provider名のみで独立性を判定しない。」 | ― | OS-007：見当たらない<br>OS-018：os-stage2a-2026-10-05、os-stage2a-parent018019-2026-10-08 | **直接** | ― | ― |
| T46 | 権限・供給・証拠 | PLAN／要求のrevision更新に原子性（CAS）・来歴・rollbackがない | 前身弱点ledger UTW-034（audit L100） | **HELIXOS-L2-053**（採択（2026-09-29 PO判断 11候補、依存先と併せて）） | `docs/helix-os/L2-requirements/governance-requirements.md:1248`「operation開始時のbase revisionをcommit時にcompare-and-swapし、currentが変わっていれば新規canonical revisionを作らずstale/co…」 | ― | OS-053：見当たらない | **直接** | 053は2026-09-29採択（HARNESS-L2-052の意味identityと対）。本文状態欄は「未採択」。 | ― |
| T47 | 権限・供給・証拠 | specialist agent registryのdrift（生成物と登録元の不一致） | 前身弱点ledger UTW-035（audit L101） | **HARNESS-L2-080**（承認（選択・適用範囲付き、2026-10-03）） | `docs/helix-harness/L2-requirements/product-requirements.md:1377`「既存のHARNESS registry内容からその対象adapterを再生成できることを要求する。同じregistry identity/revision/dig…」 | ― | HARNESS-080：見当たらない | **直接** | 080は2026-10-03承認（選択・適用範囲付き）。 | ― |
| T48 | 権限・供給・証拠 | Stop hook内のDB更新が時間予算と競合する | 前身弱点ledger UTW-036（audit L102） | （なし） | （該当なし） | ― | ― | **該当なし** | 実装手段に近く、要求としての対応は見つからない。近い所管はHELIX-OS（継続）。 | ― |
| T49 | 権限・供給・証拠 | Forward工程からの逸脱（escape）が型付きIssueになり再入まで拘束されない | 前身弱点ledger UTW-037（audit L103） | **HARNESS-L2-004**（対象revision本体に含まれる扱い。明示候補集合外で個別処置は未確認）<br>**HELIXOS-L2-010**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）） | `docs/helix-harness/L2-requirements/product-requirements.md:114`「要求変更・public contract変更・設計trace欠落等の際は、影響する設計と対検証へ差し戻す。Scrumの実装事実もreview・release合流前に設計資産へ戻し、必要…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:166`「Backflowは、旧HIL-FR-31 Upstream Redesign Re-entry（archive/legacy-gener…」 | **HELIXINTELLIGENCE-L2-020**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:158`「製品固有requirement/design/meaningを理解材料として使い、矛盾・不足・改善候補に適切なBackflow先を示す。requirement、design authority、…」 | HARNESS-004：harness-stage3-parent046-decision-addendum-2026-10-07-627bda2a<br>OS-010：見当たらない | **直接** | OS行(L166)は「ticket」関連節内の記述。 | ― |
| T50 | 権限・供給・証拠 | update advisory等、外部可用性をfail-openにする機能のfreshness・影響のreceiptが無い | 前身弱点ledger UTW-030（audit L96） | **HELIXINFRASTRUCTURE-L2-019**（承認済み（2026-09-28 PO判断）） | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:227`「古い観測をcurrentへ使わず、未収集をhealthyへ補わない。1.0のL2-004 minimum（観測不能をhealt…」 | ― | INFRASTRUCTURE-019：見当たらない | **部分的** | 019は実行資源の観測鮮度で、update advisory自体は対象外。version_target「1.0より後」。 | ― |
| T51 | review・AI運用 | 「確認した範囲」を範囲外へ一般化する／部分成功を全体成功と書く | HELIX-WP-THEME@edb49f6 #210（確認範囲の一般化） | **HELIXOS-L2-046**（採択（2026-09-29 PO判断 57候補））<br>**HELIXOS-L2-002**（承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a）） | `docs/helix-os/L2-requirements/governance-requirements.md:1180`「件が変わった場合は、その変化をstale／未完として扱い、既存の判断・検証・merge admissionを再照合する。工程の一部の成功を後続段階の成功へ伝播しない。」<br>`docs/helix-os/L2-requirements/governance-requirements.md:55`「-L2-002／003、HBR-P3／P9、2026-09-24 PO判断 ／ 未接続・未合意・未実装・未検証を区別し、部分成功で全体完了にならない ／…」 | **HELIXINTELLIGENCE-L2-008**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:92`「入力はrequirement consistency、design、implementation、test、CI、integration、release preparation、operational change、HELIX自身のtarget revision。出力はfinding/sev…」 | OS-046：os-stage4-2026-10-06<br>OS-002：見当たらない | **部分的** | 製品の追跡としては直接だが、レビュー報告の記述規律としては運用の領域。 | ― |
| T52 | review・AI運用 | 検証前の断定と撤回、断定の言い過ぎ（成立済み・確定・継承） | HELIX-WP-THEME@edb49f6 #212・#234；HELIX-VIDEO-STUDIO@5c9fbbe（review観点） | **HELIXINTELLIGENCE-L2-004**（承認（2026-09-28 PO判断：明示候補54件））<br>**HELIXINTELLIGENCE-L2-012**（承認（2026-09-28 PO判断：明示候補54件）） | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:68`「推論を観測事実へ変えず、根拠が足りない場合はunknownを保持する。version_target 1.0。」<br>`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:116`「nal evidence/Discovery/test/review/human decision。unknownをsafe/success/no-issueへ変換しない。version_t…」 | ― | INTELLIGENCE-004：intelligence-stage3-2026-10-06<br>INTELLIGENCE-012：intelligence-stage3-2026-10-06 | **部分的** | INTELLIGENCEの判断出力の規律であり、開発レーンのAIの報告文の規律そのものではない。 | ― |
| T53 | 画面・体験 | トークン誤用・コントラスト不足・色覚で隣接色が判別できず罫線等が見えない | ProFine@c5389d5 docs/tickets/FIND-0011（罫線不可視）、FIND-0034（色覚） | **HARNESS-L2-036**（採択（2026-09-29 57候補））<br>**HARNESS-L2-049**（承認（2026-09-30 通常採択22件）） | `docs/helix-harness/L2-requirements/product-requirements.md:748`「al-regression、state-transition-driftの5軸すべてを決定論的に判定し、各軸のpass証跡を要求する。いずれかのfailまたは証跡欠落はsilent passにしない。非画面と根拠付きで判定…」<br>`docs/helix-harness/L2-requirements/product-requirements.md:1080`「viewport条件のもとで実際に描画し、その結果に対して適用scopeで定めたアクセシビリティ、コントラスト、画面幅別の崩れ・はみ出し、主要状態（例：empty/loading/error）の有無、文言量を測る。device/view条件が未指定または表…」 | ― | HARNESS-036：harness-stage3-parent036-2026-10-06<br>HARNESS-049：harness-stage3-parent044-decision-addendum-2026-10-07-fa566a38e、harness-stage3-parent049-2026-10-07 | **直接** | 036(2026-09-29採択)の5軸と049(2026-09-30承認)の表示計測。036本文の状態欄は「未採択」（§6-1）。 | ― |
| T54 | 画面・体験 | 英語等の表示に日本語が残る（多言語の取りこぼし） | ProFine FIND-0023 | **HARNESS-L2-039**（採択（2026-09-29 57候補）） | `docs/helix-harness/L2-requirements/product-requirements.md:914`「適用するdevice/input/role/locale/data volume/network/concurrent update/destructive/undo要因を選び…」 | ― | HARNESS-039：harness-stage3-parent039-2026-10-07、harness-stage3-parent039-review02-2026-10-08 | **部分的** | 039はlocaleをrisk基準で選ぶ検証設計の一要因として列挙（2026-09-29採択）。文言の言語混在を検出する要求は見つからない。 | ― |
| T55 | 画面・体験 | 移動先や操作結果が画面外／はみ出し、スクロールが副作用で打ち消される | ProFine FIND-0024；HELIX-WP-THEME@edb49f6 #220 | **HARNESS-L2-049**（承認（2026-09-30 通常採択22件）） | `docs/helix-harness/L2-requirements/product-requirements.md:1080`「viewport条件のもとで実際に描画し、その結果に対して適用scopeで定めたアクセシビリティ、コントラスト、画面幅別の崩れ・はみ出し、主要状態（例：empty/loading/error）の有無、文言量を測る。device/view条件が未指定または表…」 | ― | HARNESS-049：harness-stage3-parent044-decision-addendum-2026-10-07-fa566a38e、harness-stage3-parent049-2026-10-07 | **部分的** | 049は「画面幅別の崩れ・はみ出し」と主要状態の測定。操作後の可視性・スクロール副作用は文面に無い。 | ― |
| T56 | 画面・体験 | 画面が完了を表示するが実体は処理されていない（画面の完了詐称） | ProFine FIND-0027（「承認へ送った」と出るがキューに入らない） | **HARNESS-L2-039**（採択（2026-09-29 57候補））<br>**HARNESS-L2-036**（採択（2026-09-29 57候補）） | `docs/helix-harness/L2-requirements/product-requirements.md:912`「UI/Frontendの端から端trace**：画面を持つscopeで、適用するscreen/flow/region/slot/interaction/action/state/component/token/content等の要素を、permission/actor、command/API、data/state owner、不変条件、domain event…」<br>`docs/helix-harness/L2-requirements/product-requirements.md:748`「、a11y-regression、visual-regression、state-transition-driftの5軸すべてを決定論的に判定し、各軸のpass証跡を要求する。いずれかのfai…」 | ― | HARNESS-039：harness-stage3-parent039-2026-10-07、harness-stage3-parent039-review02-2026-10-08<br>HARNESS-036：harness-stage3-parent036-2026-10-06 | **直接** | 039の端から端trace（action→command/API→state owner）と036のstate-transition-drift軸。 | ― |
| T57 | 画面・体験 | 時計や順序の非決定性によるflake | ProFine FIND-0036（フェイク時計の順序） | **HELIXOS-L2-032**（採択（2026-09-29 PO判断 57候補））<br>**HELIXOS-L2-031**（採択（2026-09-29 PO判断 57候補）） | `docs/helix-os/L2-requirements/governance-requirements.md:917`「known failureがquarantine条件を満たすかを判定し、その判定と適用対象を記録する。OSは新たなpolicy authority、HARNESSの検証義務、failureの…」<br>`docs/helix-os/L2-requirements/governance-requirements.md:903`「variance・flake・queue、cold/warm…」 | **HELIXINTELLIGENCE-L2-015**（承認（2026-09-28 PO判断：明示候補54件））`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:134`「入力はCI/実行のfailure history。出力はfailure pattern/reproducibility/machine detectability/false positive/scope/r…」 | OS-032：os-stage3-2026-10-05<br>OS-031：os-stage5-2026-10-07、os-stage5-nonapproval-supplement-draft-2026-10-07、os-stage5-2026-10-06 | **部分的** | 032／031はflakeの観測と限定隔離で、テスト自体の決定性を求める要求ではない。 | ― |
| T58 | 画面・体験 | 不要な部品が残る（使われないコンポーネントの残存） | ProFine FIND-0019 | **HARNESS-L2-039**（採択（2026-09-29 57候補）） | `docs/helix-harness/L2-requirements/product-requirements.md:913`「component/DOMと設計、design tokenと描画実体、interactionとE2E、content/analyticsとその要求・or…」 | ― | HARNESS-039：harness-stage3-parent039-2026-10-07、harness-stage3-parent039-review02-2026-10-08 | **部分的** | 039のdrift検出（設計とDOMの差）が近いが、「不要部品の残存」を名指さない。確度低。 | ― |
| T59 | 画面・体験 | 製品固有の編集系（WordPressエディタ受理）の検査 | HELIX-WP-THEME@edb49f6 #40・#59 | （なし） | （該当なし） | ― | ― | **該当なし** | HELIX-Web／WEB-OSのL2はVisionレベルの材料(層外)。製品固有の検査は個別プロダクトの要求で扱う対象。近い所管はHELIX-WEB（層外）。 | ― |
| T60 | 画面・体験 | 性能指標（LCP）が基準を外れる | HELIX-WP-THEME@edb49f6 #352 | **HARNESS-L2-034**（採択（2026-09-29 57候補）） | `docs/helix-harness/L2-requirements/product-requirements.md:696`「テストが成功していても、必要な計測が不足する対象を完成と取り違えない。」 | ― | HARNESS-034：harness-stage3-parent034-2026-10-06 | **部分的** | 034は要求ごとの計測契約と完成判定（NFR計測）。LCP等の個別指標は製品要求側。 | ― |
| T61 | 画面・体験 | 技術チェック合格を見た目・体験の合格と取り違える | HELIX-VIDEO-STUDIO@5c9fbbe AG-0001（技術チェック合格でも見た目は3/10不合格） | **HARNESS-L2-039**（採択（2026-09-29 57候補））<br>**HARNESS-L2-049**（承認（2026-09-30 通常採択22件）） | `docs/helix-harness/L2-requirements/product-requirements.md:915`「設計成果、実装状態、実測UX評価を一つの完成状態にまとめない。implementedを主張する場…」<br>`docs/helix-harness/L2-requirements/product-requirements.md:1082`「精度評価が確認できない検査は合格根拠に使わず、warningと未評価範囲を返す。LABOによる検査精度の評価は既存接続の範囲で受ける。評価者・fixtureのaut…」 | ― | HARNESS-039：harness-stage3-parent039-2026-10-07、harness-stage3-parent039-review02-2026-10-08<br>HARNESS-049：harness-stage3-parent044-decision-addendum-2026-10-07-fa566a38e、harness-stage3-parent049-2026-10-07 | **直接** | 039が`ux_verified`を別状態に分離。049は機械計測がpass/warning/unknownで、ux_verifiedを生成しない。 | ― |
| T62 | 画面・体験 | 盲検→敵対検証の運用、約100版で打ち切りPOへ選択肢を出す収束 | HELIX-VIDEO-STUDIO@5c9fbbe（derived-lessons.md「画面系」） | **HARNESS-L2-024**（承認（2026-09-28 PO判断：明示候補））<br>**HELIXLABO-L2-064**（採択（2026-09-29 57候補）） | `docs/helix-harness/L2-requirements/product-requirements.md:515`「core、質問回数、訂正率、反復iteration数、無変更iteration、timeoutを単独の収束判定にしない。固定iteration上限は設けない。timeout時は進行停止・状態保持・actor/scope/最後の確定revision/open item/再入条件を返し、回答や合意を…」<br>`docs/helix-labo/L2-requirements/labo-requirements.md:495`「候補名を伏せた比較の成立範囲、固定条件の一致、情報漏洩や比較不成立の理由。評価記録の元identityを消さず、judgeへの提示と記録側の追跡を分…」 | ― | HARNESS-024：見当たらない<br>LABO-064：labo-stage5-parent064-2026-10-07 | **部分的** | 024は収束判定とtimeout時の停止・状態保持。VIDEO-STUDIOの「約100版で打ち切り」は024の「固定iteration上限は設けない」と方式が違う（§6-4）。064は盲検に近い。 | ― |

## 2. 区分ごとの件数

| 区分 | 件数 |
|---|---|
| 直接 | 20 |
| 部分的 | 33 |
| 該当なし | 9 |
| 合計（失敗の型） | 62 |
| うち「運用で防止中」の印を付けた型 | 12 |

領域別：作業領域 6、ticket・作業単位 5、通知・配送 6、構成・文書 11、CI・検証 9、権限・供給・証拠 13、review・AI運用 2、画面・体験 10。

型の数は事例一覧（`derived-lessons.md`）の事例群と前身ledger UTW-001〜037を、再発の仕方が同じものごとにまとめた結果で、粒度は恣意的である（例：UTW-014とUTW-013を別の型にした、画面系のFINDを症状別に分けた）。事例の網羅は主張しない。

## 3. 要求候補（PO判断へ送る）一覧

「該当なし」の型である。**要求文は起草していない**。所管は「どの機構の責務に近いか」を示すだけで、配置の判断ではない。失敗や運用規則から要求は生成されず、人の判断（PO）を経る。

| 型 | 失敗 | 所管に近い機構（推測） | 近接する既存要求と状態 | 留意 |
|---|---|---|---|---|
| T08 | 並行PRが連番・節番号を取り合って衝突する（改訂メモ版、第N陣、節番号） | HELIX-OS（管理）／HARNESS（identity） | HARNESS-L2-053（承認）は採番方式を決めないと明記 | AGENTS.md「版ごとの別ファイルを作らない」と、1件1ファイル化したProFineの結論は向きが逆。ProFineの対象は連番・節番号の取り合いで、正本ファイルの更新とは別と読めるが未確定 |
| T10 | 変更単位が大きすぎる（巨大PR、単一PRへの混載） | HARNESS（作業単位の規範）／HELIX-OS（登録前適格性） | HARNESS-L2-045・HELIXOS-L2-039（ともに保留） | 要求候補というより保留の解除条件（予算・期限の決定責務）の問題。運用モデルは運用で防止中 |
| T15 | hookが無言で失敗する（exit codeの意味違い） | HELIX-OS（通知・継続）／HELIX-CONNECT | ― | 開発repoのGUI通知箱（scaffold）の挙動。製品の要求に上げるべきかは未判断 |
| T26 | fail-open／warn-onlyの扱いが安全・観測・可用性で統一分類されていない | HARNESS（検証契約）／HELIX-SECURITY（fail-close原則） | 個別の「unknownを成功にしない」要求は多数（例：HELIXINTELLIGENCE-L2-012） | 許容クラスの分類を求めるかどうかは設計判断 |
| T34 | main（統合後）が赤のまま放置される／赤の間も統合が続く | HELIX-OS（検収・CI運転） | HELIXOS-L2-031（採択）が旧の全件main回収の復活を明示的に退けている | ProFine型の規則を入れる要求候補ではなく、既決の方式（ticket導出CI＋LABOのすり抜け分析）との整合の確認が先 |
| T36 | OS／platformの前提が偏る（Bun必須、macOS legなし、Windowsは限定） | HARNESS（support tier）／HELIX-OS（配布） | HARNESS-L2-064（現行版では承認しない）、HELIXOS-L2-030（保留） | 承認済みなし。保留・不承認の解除は既存の判断経路 |
| T39 | live policy（GitHub設定）と文書policyの乖離 | HELIX-OS（管理）／HELIX-SECURITY | 検出・助言側にHELIXINTELLIGENCE-L2-009（authority mismatch／design-runtime mismatchの監査候補、承認済み）。防止・照合の要求ではない | UTW-004は運用モデルが「持ち込まない対象」と記録。INTELLIGENCEは検出側で、区分には算入していない |
| T48 | Stop hook内のDB更新が時間予算と競合する | HELIX-OS（継続・復旧） | HELIXOS-L2-009（承認）は継続・冪等を扱う | 実装手段に近い。要求化すべきでない可能性が高い |
| T59 | 製品固有の編集系（WordPressエディタ受理）の検査 | HELIX-Web（層外のVision材料） | ― | WordPress固有の検査。製品が決まった後の個別要求の領域 |

## 4. 意味を確かめ直す候補（逆方向：HELIX-OS・HELIX-INTELLIGENCEの承認済みL2のうち、表の失敗型に当たらないもの）

**削除提案ではない**。PO原則の読み方に従い「その要求がどの失敗を防ぐか」を確かめる材料として、本書の62型のどれにも当てなかった承認済み（採択・条件付き採択・承認）の要求を挙げる。注意：

1. 失敗の事例が5つの派生repoと前身ledgerに限られるため、「当たらない」は「防ぐ失敗がない」を意味しない。旧HELIX（`archive/legacy-generation-2026-09-14/`）の別のfailure記録・判断史を引けば当たる可能性がある。
2. 表で引いたのは各型で最も近い1〜3件で、同じ型を覆う別の要求も多い。「当てていない」ことと「どの型にも関係しない」ことは別である。
3. L2-012・013は移管済み、130はHARNESS-087と一組。承認状態が「承認しない」「保留」の要求は含めない。

### HELIX-OS（53件）

**単体（38件）**

| ID | 見出し（本文の行） | 承認状態 |
|---|---|---|
| HELIXOS-L2-003 | 共通統制と各プロダクトの開発方式の区別、変更影響の伝播（L56） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |
| HELIXOS-L2-011 | 統合順序・統合単位・検証実行計画の導出と再計画（L64） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |
| HELIXOS-L2-014 | HELIX自身の段階リリース（L619） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |
| HELIXOS-L2-015 | 管理・authority記録（単体候補）（L642） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |
| HELIXOS-L2-017 | 推進・ticket/workflow（単体候補）（L662） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |
| HELIXOS-L2-020 | 検収・CI運転（単体候補）（L692） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |
| HELIXOS-L2-022 | 改善候補登録・還流（単体候補）（L712） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |
| HELIXOS-L2-026 | 段階リリース構成の要求導出（単体能力候補）（L807） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |
| HELIXOS-L2-033 | Versioned engine/detector registryと同一snapshot再現証拠（単体候補）（L929） | 採択（2026-09-29 PO判断 57候補） |
| HELIXOS-L2-036 | Retrofit preflightのticket/plan接続（単体候補、version_target: 1.0）（L1033） | 採択（2026-09-29 PO判断 57候補） |
| HELIXOS-L2-038 | Layer ledger writer・snapshot・proposal append（単体候補、version_target: 1.0）（L1096） | 採択（2026-09-29 PO判断 57候補） |
| HELIXOS-L2-040 | retry上限到達時の型付き戻し先（単体候補、version_target: 1.0）（L1125） | 採択（2026-09-29 PO判断 57候補） |
| HELIXOS-L2-041 | 再読込不能時の正本再取得を伴う継続（単体候補、version_target: 1.0）（L1135） | 採択（2026-09-29 PO判断 57候補） |
| HELIXOS-L2-042 | Worker成果のschema／digest適格性と緩和後再検証（単体追補候補、version_target: 1.0）（L1144） | 採択（2026-09-29 PO判断 57候補） |
| HELIXOS-L2-043 | Worker委譲のapproval request／tool call／result追跡（単体追補候補、version_target: 1.0）（L1153） | 採択（2026-09-29 PO判断 57候補） |
| HELIXOS-L2-047 | チケットの理由付き返却と新revision再発行（単体候補、version_target: 1.0）（L1185） | 採択（2026-09-29 PO判断 57候補） |
| HELIXOS-L2-050 | 独立review capacityの観測と調整（単体候補、version_target: 1.0）（L1213） | 条件付き採択（2026-09-29） |
| HELIXOS-L2-051 | 作成／reviewレーンのtask単位選択と配置適性（単体候補、version_target: 1.0）（L1221） | 条件付き採択（2026-09-29） |
| HELIXOS-L2-055 | ready Issue claimと実装開始前の工程照合（単体候補、未採択）（L1263） | 案を選択して承認（2026-09-30） |
| HELIXOS-L2-101 | PR finding dispositionの証拠receiptと異議連結候補（単体候補、未採択）（L1273） | 承認（2026-09-30 PO判断 通常採択22件） |
| HELIXOS-L2-105 | incident episodeの復旧証拠相関（単体候補、未採択）（L1315） | 承認（2026-09-30 PO判断 通常採択22件） |
| HELIXOS-L2-106 | authority binding参照先の再帰検査候補（単体候補、未採択）（L1326） | 承認（2026-09-30 PO判断 通常採択22件） |
| HELIXOS-L2-108 | artifactからconsumerへの逆向きgraph候補（単体候補、未採択）（L1346） | 承認（2026-09-30 PO判断 通常採択22件） |
| HELIXOS-L2-109 | source-to-consumer provenance chain候補（単体候補、未採択）（L1357） | 承認（2026-09-30 PO判断 通常採択22件） |
| HELIXOS-L2-110 | semantic epoch変更後のactive consumer digest pin差分候補（単体候補、未採択）（L1368） | 承認（2026-09-30 PO判断 通常採択22件） |
| HELIXOS-L2-111 | 三つの独立receiptのAND結合候補（未採択）（L1380） | 承認（2026-09-30 PO判断 通常採択22件） |
| HELIXOS-L2-115 | 終端runへの遅着Worker結果を受理しない（単体追補候補、未採択）（L1446） | 承認（選択・適用範囲付き、2026-10-03 later35） |
| HELIXOS-L2-117 | 選択event generation identityの個別検査候補（単体候補、未採択）（L1435） | 承認（選択・適用範囲付き、2026-10-03 later35） |
| HELIXOS-L2-118 | 検証義務を保つrun置換・終端証拠（単体候補、未採択）（L1456） | 承認（選択・適用範囲付き、2026-10-03 later35） |
| HELIXOS-L2-119 | Codex・Claude協働episodeの圧縮とcontinuity分離候補（未採択）（L1469） | 承認（本文どおり、2026-10-03 later35） |
| HELIXOS-L2-120 | Agent instance lifecycle outcome and terminal separation (candidate, unadopted)（L1498） | 承認（選択・適用範囲付き、2026-10-03 later35） |
| HELIXOS-L2-125 | Worker結果境界のfail-close（改訂候補002、未採択）（L1550） | 初版は不承認→改訂002を承認（2026-10-03 pending4） |
| HELIXOS-L2-126 | 失効後fencingとdurable checkpoint再開（単体候補、未採択）（L1558） | 承認（選択・適用範囲付き、2026-10-03 later35） |
| HELIXOS-L2-127 | 選択されたCI依存段間のreceipt lineage（単体候補）（L1589） | 承認（選択・適用範囲付き、2026-10-03 later35） |
| HELIXOS-L2-128 | quarantine対象変更時の失効（単体候補）（L1571） | 承認（選択・適用範囲付き、2026-10-03 later35） |
| HELIXOS-L2-129 | worker runtime quota/rate状態とlane退避（単体候補、未採択）（L1621） | 承認（適用範囲B・内容A、2026-10-03 additions10） |
| HELIXOS-L2-130 | docgen source・採否・要求traceの管理projection候補（unit、未採択）（L1639） | HARNESS-L2-087と一組で承認（2026-10-03 additions10） |
| HELIXOS-L2-131 | Worker operationでのgenerated pack・agent authority境界（未採択候補）（L1656） | 承認（改訂002、2026-10-03 pending4） |

**接続（12件）**

| ID | 見出し（本文の行） | 承認状態 |
|---|---|---|
| HELIXOS-L2-023 | 管理→推進→Worker→検収の受渡し（接続候補）（L722） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |
| HELIXOS-L2-024 | HARNESS提供・運用→LABO→OSの受渡し（接続候補）（L732） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |
| HELIXOS-L2-028 | 作業中支援の受渡し・範囲統制（接続候補）（L847） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |
| HELIXOS-L2-037 | 週次drift・技術負債観測から既存ticket候補への引継ぎ（接続候補、version_target 1.0）（L1075） | 採択（2026-09-29 PO判断 57候補） |
| HELIXOS-L2-048 | 返却・検証不成立feedbackの評価・還流接続（connection候補、version_target: 1.0）（L1195） | 採択（2026-09-29 PO判断 57候補） |
| HELIXOS-L2-054 | Closure Gate証拠照合・close運転のHARNESS handoff候補（connection候補、未採択）（L1253） | 承認（2026-09-30 PO判断 通常採択22件） |
| HELIXOS-L2-104 | 操作authority・実行隔離・品質受入の独立記録候補（接続、未採択）（L1304） | 承認（2026-09-30 PO判断 通常採択22件） |
| HELIXOS-L2-107 | finding taxonomy/mapping revision-pinned handoff候補（connection候補、未採択）（L1336） | 承認（2026-09-30 PO判断 通常採択22件） |
| HELIXOS-L2-113 | GitHub監査の決定的規則・semantic finding境界候補（connection候補、未採択）（L1407） | 承認（選択・適用範囲付き、2026-10-03 later35） |
| HELIXOS-L2-121 | HIL-BR-12 intakeとstyle接続の未採択候補（L1483） | 承認（本文どおり、2026-10-03 later35） |
| HELIXOS-L2-122 | HIL-NFR-01 owner間副作用の冪等な引継ぎ（接続候補、未採択）（L1510） | 承認（選択・適用範囲付き、2026-10-03 later35） |
| HELIXOS-L2-124 | 旧五機能の判定結果・failure code・provenance接続候補（未採択）（L1539） | 承認（選択・適用範囲付き、2026-10-03 later35） |

**構成体（3件）**

| ID | 見出し（本文の行） | 承認状態 |
|---|---|---|
| HELIXOS-L2-025 | HELIX-OS統合運転（構成体候補）（L742） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |
| HELIXOS-L2-027 | 未評価状態からの限定初回実行（構成体候補、1.0）（L824） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |
| HELIXOS-L2-029 | Worker支援から検証・再作業までの構成体（composite候補、1.0）（L863） | 承認済み（2026-09-28 PO判断：L2-001〜029、固定f6dad2a） |

### HELIX-INTELLIGENCE（51件）

**単体（20件）**

| ID | 見出し（本文の行） | 承認状態 |
|---|---|---|
| HELIXINTELLIGENCE-L2-001 | 判断領域の編成（L48） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-002 | Domain×Capability構成（L54） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-005 | 作業計画候補（L72） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-010 | Worker配置候補（L102） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-011 | Model/Provider適性（L108） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-013 | 判断理由の追跡（L120） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-014 | 専門Botの発行（L126） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-016 | 限定修復candidateと適用（L138） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-017 | 限定修復の接続横断境界（L202） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-018 | LABOとの時間軸（L144） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-019 | BRAIN知識との境界（L150） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-067 | 既存Worker配置proposalの入力契約補強（単体候補、1.0）（L466） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-068 | 作業中Workerへの診断・設計/テスト支援候補（単体候補）（L491） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-069 | 有限設計モデルの条件付き計算（unit candidate）（L513） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-072 | Judgment pack候補とshadow評価（単体候補、version_target: 1.0）（L561） | 条件付き採択（2026-09-29）＋10-03追補承認 |
| HELIXINTELLIGENCE-L2-073 | 未知finding探索の自由文からの直接投影境界（unit candidate、version_target: 1.0）（L601） | 採択（2026-09-29） |
| HELIXINTELLIGENCE-L2-074 | 評価済み返却feedbackの配置proposal入力（単体候補、version_target: 1.0）（L609） | 採択（2026-09-29） |
| HELIXINTELLIGENCE-L2-075 | Agentic Audit Probe proposal identity and qualification boundary（unit candidate、version_target: 1.0）（L618） | 承認（本文どおり、2026-10-03） |
| HELIXINTELLIGENCE-L2-077 | AAFD qualified delta source and non-write boundary（unit candidate、version_target: 1.0）（L635） | 承認（選択・適用範囲付き、2026-10-03） |
| HELIXINTELLIGENCE-L2-078 | AAFD future-state delta integrity and bounded intake boundary（unit candidate、version_target: 1.0）（L646） | 承認（選択・適用範囲付き、2026-10-03） |

**接続（16件）**

| ID | 見出し（本文の行） | 承認状態 |
|---|---|---|
| HELIXINTELLIGENCE-L2-030 | HELIX-HARNESS → Situation Model（L208） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-031 | HELIX-OS → Situation Model（L217） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-032 | BRAIN → INTELLIGENCE（L226） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-033 | Product Core / HARNESS → INTELLIGENCE（L235） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-034 | LABO → INTELLIGENCE（1.0評価材料）（L244） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-035 | INTELLIGENCE → OS（計画・判断候補）（L253） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-036 | INTELLIGENCE ↔ SECURITY（L262） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-037 | OS → Worker（INTELLIGENCE candidate実行）（L271） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-038 | HARNESS → 限定修復の検証義務（L280） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-039 | OS → 限定修復の検収（L289） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-040 | INTELLIGENCE → LABO（1.0実績）（L298） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-041 | 各source mechanism → Situation Model（L307） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-044 | INTELLIGENCE → BRAINへの非直接更新境界（L334） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-045 | INTELLIGENCE → Product Core Backflow（L343） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-066 | 配置案の人代行入力・受領契約（接続候補、1.0）（L454） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-070 | CORE model input / LABO result handoff（connection candidate）（L528） | 承認（2026-09-28 PO判断：明示候補54件） |

**構成体（5件）**

| ID | 見出し（本文の行） | 承認状態 |
|---|---|---|
| HELIXINTELLIGENCE-L2-060 | 自動開発計画（L354） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-061 | Worker配置（L360） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-062 | 限定自動修復（L366） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-063 | 継続的自己改善（L372） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-071 | 条件変更・モデル計算・結果比較（composite candidate）（L544） | 承認（2026-09-28 PO判断：明示候補54件） |

**後続版（3.0）（9件）**

| ID | 見出し（本文の行） | 承認状態 |
|---|---|---|
| HELIXINTELLIGENCE-L2-021 | Domain/Capability専用モデル学習（L162） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-022 | Training/evaluation data区分（L168） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-023 | Model lineage（L174） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-024 | Candidate model比較（L180） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-025 | Model適用範囲（L186） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-026 | LABO評価用実績packet（L192） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-042 | LABO → INTELLIGENCE（3.0学習材料）（L316） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-043 | INTELLIGENCE → LABO（3.0 model result）（L325） | 承認（2026-09-28 PO判断：明示候補54件） |
| HELIXINTELLIGENCE-L2-065 | Local Intelligence Learning cycle（L384） | 承認（2026-09-28 PO判断：明示候補54件） |

**後続版（4.0）（1件）**

| ID | 見出し（本文の行） | 承認状態 |
|---|---|---|
| HELIXINTELLIGENCE-L2-064 | 動的開発workflow（L378） | 承認（2026-09-28 PO判断：明示候補54件） |

### 4-1. 引用はしたが「主たる型」でなく補助的な要求（参考）

表Aで1型にしか当てていない承認済みOS・INTELLIGENCE要求は、その1型が唯一の失敗根拠である。

HELIXINTELLIGENCE-L2-003（T05）、HELIXINTELLIGENCE-L2-004（T52）、HELIXINTELLIGENCE-L2-007（T12）、HELIXINTELLIGENCE-L2-008（T51）、HELIXINTELLIGENCE-L2-020（T49）、HELIXOS-L2-005（T28）、HELIXOS-L2-016（T05）、HELIXOS-L2-019（T23）、HELIXOS-L2-021（T37）、HELIXOS-L2-030（T36）、HELIXOS-L2-032（T57）、HELIXOS-L2-034（T17）、HELIXOS-L2-035（T41）、HELIXOS-L2-039（T10）、HELIXOS-L2-044（T22）、HELIXOS-L2-049（T09）、HELIXOS-L2-103（T41）、HELIXOS-L2-123（T27）、HELIXOS-L2-132（T21）

## 5. 運用で防止中（機構未移管）

`github-upstream-operating-model.md`が今の守りとして持つものである。移管先の要求・移管時の差は同書「移管の表」（L385–L397）に記録があり、本書は再掲に留める。**移管の表の記述と本書の判断が食い違う点は§6に記した**。

| 型 | 運用の守り | 本書の当て方 |
|---|---|---|
| T01 終了済みworktree・branchが蓄積し、owner・寿命・回収が管理されない | 運用で防止中：github-upstream-operating-model.md「作業branchとworktreeの片付け」(L350–L366)。移管の表(L385–)の当該行は移管先をHELIXOS-L2-052とする。 | 部分的 |
| T02 回収操作そのものが実体を壊す（junctionを辿りnode_modules全消去 等） | 運用で防止中：operating-model L359–L360「独自の内容を持つbranchは…git bundleで事前バックアップ」「他レーンの作業には触れない」 | 部分的 |
| T05 branch上の設計・実装がmainに統合されず滞留する | 運用で防止中：operating-model「PRの原子性」(L58–)と短命branch運用（旧源 github-operations-reference-audit L41） | 部分的 |
| T07 ticket本文へのIssue/PR番号の書き戻し、Issueの二重作成、ticketとIssueのstateずれ | 運用で防止中：operating-model「IssueとFeature Ticket」(L178–L192)。移管先はHARNESS-L2-059／HELIXOS-L2-102／054だが「L3の承認記録は見つかっていない」と同表に記載。 | 部分的 |
| T08 並行PRが連番・節番号を取り合って衝突する（改訂メモ版、第N陣、節番号） | 運用で一部防止：AGENTS.md「版ごとの別ファイルを作らない」は逆方向の規則で、正本ファイルへの並行PR衝突とは別。共通部品を先行PRで閉じる運用(operating-model L65–L69)。 | 該当なし |
| T10 変更単位が大きすぎる（巨大PR、単一PRへの混載） | 運用で防止中：operating-model「PRの原子性」。同ファイルの移管の表は移管先にHELIXOS-L2-046／HARNESS-L2-045を挙げるが、045は保留（判断に迷った点§6-2）。 | 該当なし |
| T11 Issue Formsの入力が作業権威にならずlabel/inboundの運用が閉じない | 運用で防止中：operating-model L186（local ticketが無いIssue Form入力はwork authorityにしない） | 部分的 |
| T12 通知に終端状態がなく、完了済み作業で再起床する・滞留する | 運用で防止中：operating-model「GUIレーンの運転と通知」(L314–L343)。移管表の当該行は「移管先の要求を特定していない」と明記。 | 部分的 |
| T14 publish成功を配送成功と扱う／ACKなしの黙殺 | 運用で防止中：operating-model L322「queuedや登録済みleaseだけで配送成功とせず…配送不成立とする」 | 部分的 |
| T15 hookが無言で失敗する（exit codeの意味違い） | 運用で防止中：operating-model L322「宛先のhookがGUIで信頼・読込されていないとき…配送不成立」 | 該当なし |
| T19 入口文書（CLAUDE.md／AGENTS.md）が規則追加で肥大する | 運用で防止中：operating-model L378–L384「規則を足す条件と、減らす条件」 | 部分的 |
| T39 live policy（GitHub設定）と文書policyの乖離 | 運用で防止中：operating-model L404が「持ち込まない対象」としてUTW-004を記録。守り方（照合手順）の記述は未確認。 | 該当なし |

## 6. 判断に迷った箇所・気づき

- **本文の状態欄と判断記録の食い違い**（T33・T35・T46 ほか）：HELIXOS-L2-031・053、HARNESS-L2-036・043・057などは本文に「未採択」とあるが、判断記録では採択・承認。AGENTS.md「現在の意味を持つ文書は同じファイルを更新する」の観点で、状態欄が更新されていない。本書では編集していない。
- **運用モデル「移管の表」のPRの原子性行**（T10）：移管先にHELIXOS-L2-046とHARNESS-L2-045を挙げるが、本文を読むと046は「dispatchからmergeまでのauthority・HEAD・scope連続性」で変更の粒度を扱わず、045は保留のため、粒度の防止は承認済み要求に移管先がない。表の「移管先」の読みを確かめる必要がある。
- **ProFine §3.2（main赤の停止規則）とHELIXOS-L2-031**（T34）：031は旧の全件main回収を「復活させない」と既決。ProFineの規則は同じ方向の別方式で、採るか否かは要求の追加でなく既決方針との整合の問題。したがって要求候補の「優先」としては挙げていない。
- **VIDEO-STUDIOの「約100版で打ち切り」とHARNESS-L2-024**（T62）：024は「固定iteration上限は設けない」と定める。派生repoは別方式で運用した。どちらが失敗を防ぐかは判断せず、部分的とした。
- **通知の失敗型**（T12〜T15）：機構として当たるOSの記述は、節自身が「IRやruntimeに昇格させない」と断る「有期限通知とmemory」節に偏る。運用モデルも「移管先の要求を特定していない」と書いている。親のHELIXOS-L2-004・009は承認済みだが、終端状態・失効・reviewer排他を名指しする承認済み要求は見つからなかった。
- **区分「直接」の厳しさ**：「文面に同じ防止の内容がある」ことだけを基準にした。実装・L3の成立や、失敗が実際に防がれることは見ていない（直接＝要求が存在する、であり防止の成立ではない）。
- **OS・INTELLIGENCE以外の機構の読みの浅さ**：§0-3のとおり。BRAIN・LABO・INFRASTRUCTUREは見出しとキーワードでの照合。
- **HARNESS-L2-001〜009の承認状態**：9/28の判断記録は明示候補を010〜033とし、001〜009を個別に処置していない（「対象revision本体に含まれる扱い」とした）。T6はこの前提に立つ直接。
- **型の粒度**：62件は30〜60件の目安をわずかに超えた。画面系のFINDを症状別に分けたため。統合すれば約50件になる。

## 7. 確かめられなかったこと（未確認）

- WP-THEME・VIDEO-STUDIOのIssue／PR番号の本文（`ut-issues.json`にあるのはUT分のみ。profine-issues.jsonは未使用）。型の説明は`derived-lessons.md`に依っている。
- ProFineのFIND-0011・0019・0023・0024・0034・0036とGOV-0012・0013・0018の本文（存在とファイル名のみ確認。FIND-0027はtitleのみ読了）。特にFIND-0034が色覚の問題かは未確認。
- L3（`docs/<機構>/L3-requirements/`）の本文と、各Stage判断記録の効力（`recorded_pending_condition3`等）。表の「L3判断記録に現れる」は文字照合のみ。
- HELIXOS-L2-116（OSの見出しにも判断記録にも見つからない）、HARNESS-L2-066・069〜071・073〜076（見出しなし）。
- HMC・ticket・運用品質・AI可読文書・旧資産の退役の各節の個別採否。
- 各要求が実装・運用で実際に失敗を防ぐかどうか（要求の文面のみを根拠にした）。
