# GitHub上流運用モデル

status: bootstrap_candidate
generation: new-generation-2026-09-14
local_authority: repository documents at exact revision
github_role: work_review_evidence_projection

文書、要求carry-forward、管理層仮登録、作業、GitHub projectionの状態は[上流authority状態モデル](authority-state-model.md)の独立した五軸で扱う。

## 目的

GitHubのIssue、PR、label、checkを追いかけて要求を推定する運用をやめ、ローカル上流からGitHub上の作業を
再生成できる状態を作る。本書は新世代repositoryを整理した後に要求を一件ずつ詰め、設計・検証・実装へ
順に降ろすための運用上流である。

## authority順序

1. 対象revisionへ束縛した人間decision record。
2. decision recordにより承認されたrepo-owned Concept、Vision、対象別L1、対象別L2とL11、および旧要求の無損失carry-forward記録。
3. 承認済み要求から導出しfreezeしたL3とL10、以降の正規V-pair。
4. 判断論点、known／assumption／unknown／conflict／staleを持つpremise packet、research、限定PoC、prototype、人間反応。これらは上流判断の証拠入力であり、単独では意味authorityを持たない。
5. repo-owned Feature Ticketと変更契約。
6. GitHub Issue、PR、review、check、Project等のprojection。

下位projectionから上位の要求意味、採否、承認、完了を生成しない。GitHub上の状態が失われても、承認済みlocal sourceと
投影記録から未完作業を再構築できることを運用成立条件とする。

この順序はauthorityの優先順位である。GitHubへ作業を導出する上流整理は`Concept／Vision／企画／人間指示 → 判断論点 → 必要なpremise／research／PoC／prototype → 人間decision → 承認済み上流revision`で行う。これはGitHub運用上の文書導出順であり、HARNESS製品内の開発workflowを一つの直線として定義しない。証拠入力が先に作られることを上位authorityであることと混同しない。新しい人間指示は受領時に失わず登録し、既存の承認済み上流と衝突する場合は、指示だけで旧revisionを暗黙上書きせず人間decisionへ送る。

## PR classとscope

本書で用いる上流入力を次のように区別する。

- `Vision`: 一つの対象productについて、親Conceptの範囲内で将来到達像、利用者価値、時間境界、成功観測を示すsource-qualified identity。L1企画と同一視せず、revisionと親Conceptを持つ。
- `判断論点`: Concept／Vision／企画／指示の間で、人間が選ぶ必要のある一つの問い。選択肢、維持条件、影響対象、必要証拠、返却先を持ち、結論を先取りしない。
- `premise packet`: 一つの判断論点に対するknown／assumption／unknown／conflict／stale、source、取得時点、適用条件、限界、反例、再調査条件を持つversioned evidence bundle。要求authorityや人間decisionではない。

| PR class | 一つのPRが扱うもの | 必須入力 | mergeで成立するもの | mergeで成立しないもの |
|---|---|---|---|---|
| `repository_foundation` | 旧世代archive隔離、新世代物理構成、authority・GitHub運用規則 | archive manifest、対象構成、運用上流 | 新世代を整理・reviewするrepository基盤 | 個別要求の承認、L3、実装、CI、製品完成 |
| `concept_revision` | 一つのConcept identityの新設または意味revision | 人間指示、現行Concept revision、変更理由、影響対象 | 人間decisionへ提示できるConcept差分。decision記録を同じPRへ束縛した場合だけ承認revision | L1以下の自動承認、設計・実装・運用許可 |
| `planning_revision` | 一つの対象productのVision／L1企画identityの新設または意味revision | 親Concept revision、premise、対象product、変更理由 | 人間decisionへ提示できるVision／L1差分。decision記録を同じPRへ束縛した場合だけ承認revision | L2以下の自動承認、他productの意味変更 |
| `research_premise` | 一つの判断論点に対する前提確認または要求探索research | 親Concept／Vision／企画revision、調査scope、必要証拠 | 出典・版・時点・適用条件・限界・反例付きpremise packet | Concept／L1／要求／技術の採用、実装許可 |
| `discovery_evidence` | 一つの要求候補を比較する限定PoCまたはUI・動画prototype | 親判断論点、仮説、timebox、使い捨てscope、評価方法、返却先 | 再現可能な試作証拠と要求候補・premiseへのbackflow | production pathへの取込、要求採用、設計freeze、製品完成 |
| `requirement` | 一つの要求identityと対になるL11。分割案はsuccessor候補を列挙できるが、別identityを同じPRで確定しない | 親Concept／L1 exact revision、source、対象product、要求kind | 判断記録に束縛した一要求revision | 他要求、設計方式、実装、CI、受入pass |
| `design_verification` | 一つの承認要求に対するL3とL10、または後続の一つのV-pair | 承認要求revision、適用template、risk、未解決 | 対象pairのfreeze可能な設計・検証契約 | 実装完了、利用者受入、運用成立 |
| `implementation` | 一つの承認・freeze済みticketが指定する成果と必要検証 | Feature Ticket、親要求、設計、oracle、許可、HEAD | 対象成果と検証証拠 | 無関係な要求・設計の変更、release、deployment |
| `operation_change` | GitHub、CI、Worker、配布等の一つの外部運用変更 | HELIX-OS要求、操作authority、backup、rollback、read-after | 許可scope内の外部状態変更 | 要求意味、人間承認、別操作の許可 |

要求PRは原則として一つの要求identityだけを扱う。複数要求を一括変更しない。connection要求は接続そのもの、
composite要求は組合せ固有の全体条件を一つのidentityとして扱い、構成unitの要求PRと分ける。
`requirement` PRをReadyにする前に、親Concept／Vision／企画revisionから判断論点を特定し、premise packetまたは
`research_not_required`の理由・判断者・再評価条件を参照する。research結果は要求候補の根拠であり、採用authorityではない。
premiseが承認済みConcept／Vision／L1と`conflict`または`stale`になった場合は、対象の`concept_revision`または`planning_revision`へbackflowしてから要求採否へ進む。`unknown`または`assumption`を残す場合は、影響範囲、判断者、再評価条件を記録する。PoC／prototypeは`discovery_evidence`としてproduction pathから隔離し、結果だけをpremiseまたは要求候補へ戻す。

要求を降ろす順序は、単独で成立する`unit`、採用済みunit間の関係を定める`connection`、採用済みunit／connectionの集合に固有な結果を定める`composite`とする。後段要求は参照先のexact revisionを持ち、unitの成立からconnectionやcompositeの成立を推定しない。分割元の旧要求は、各successorを別PRで確定し、全意味atomの被覆を確認するまで`pending`を残す。要求revisionの承認後に管理が工程を推進へ渡し、推進がFeature Ticketを発行する。親要求、必要なconnection／composite、premise状態、HARNESS contract、停止条件のいずれかが未確定ならticketをReadyにしない。

## IssueとFeature Ticket

- GitHubで人が読むtitle、見出し、目的、判断、状態説明、停止理由は日本語を原則とする。ID、path、command、schema語彙、
  label等の機械識別子と一般的な開発用語は原語を保てるが、英語見出しだけで意味を判断させない。
- `.github/PULL_REQUEST_TEMPLATE.md`と`.github/ISSUE_TEMPLATE/feature-ticket-projection.yml`は、ローカル正本をGitHubへ転記する補助surfaceであり、要求やticket意味の入力面ではない。templateが欠けても本書のauthorityは失われず、template入力だけで上流承認を生成しない。
- Feature Ticketはlocal work authorityであり、親上流、対象product、scope、依存、停止条件、backflowを持つ。
- IssueはFeature Ticketの協調projectionであり、Issue番号を要求IDやticket IDにしない。
- Issue投影前にlocal ticketの存在、`source_revision`での内容、source digestを確認する。Issueの意味欄はlocal ticket本文からの転記に限定し、転記内容のdigest不一致はprojection失敗とする。
- local ticketが存在しないIssue Form入力はwork authorityにしない。新規の人間指示を含む場合は入力を原eventとしてローカル登録へ戻し、要求採否と分けたprojection failure receiptを残してIssueを非実装状態で閉じる。入力を黙って捨てない。
- `requirement` PRは[管理層の要求仮登録契約](management-provisional-requirement-registration.md)に従い、要求候補と旧source atomの無損失被覆をHELIX-OS管理層へ仮登録してからmerge admissionへ進む。GitHub Issue／PRは仮登録recordのprojectionであり、仮登録正本ではない。
- 上流承認前に人間の明示指示から起票する場合は`proposed_upstream_waiting`に固定し、実装可能状態へ進めない。
- HARNESSが工程のnormative vocabulary、trigger、適用条件、各route内の順序、join、停止・差戻し・完了条件を所有する。単一の固定列ではなく、下記の条件付きrouteをHARNESS contractとして保持する。
- 推進機構はHARNESS語彙を別定義せず、operational tag、versioned mapping、composition、workflow instance生成規則を所有し、管理から受けた目的・要求・制約をticket graphへ変換する。
- 管理層は生成物を登録・統制する。HARNESSは個別ticket発行やworkflow instance生成を行わず、推進は入力に合うHARNESS routeとtriggerを評価し、必要なrouteだけを規定順で具体化する。
- PRは対応するlocal ticketとIssueを参照する。Issue closeやPR mergeだけでticket完了を生成しない。

### HARNESSの条件付き工程contract

| contract | 旧source identity | trigger／選択 | 保持する順序と合流 |
|---|---|---|---|
| 開発style | requirements v1.3 §4（`docs/governance/requirements-source/helix-requirements_v1.3.md:71-75,83-85`）、HARNESS-L2-002の移管元 | Full V／Production Scrum／V設計＋Scrum実装Hybridの三方式から適用可能な一つを選択する。未選択、複数選択、適用不能はfail-closeする | 選択styleの工程を進める。Discovery／PoCを第四の排他的styleにしない |
| case-driven Discovery／PoC | `HR-FR-HYB-003`、`FR-L1-15`、`HIL-BR-28`、起動source `docs/governance/requirements-source/helix-requirements_v1.3.md:631` | `requirement_undefined`、`feasibility_unknown`、`success_condition_unclear`、`design_uncertain`のいずれか | `S0 hypothesis → S1 experiment plan → S2 poc → S3 verify → S4 decide`。S4は人間が判断し、採択結果だけをL3機能要件へ合流する |
| Research | `FR-L1-27`、起動source `docs/governance/requirements-source/helix-requirements_v1.3.md:632` | `tech_decision_required`、`option_comparison_needed`、`adr_required`のいずれか | research memoとADRを生成し、ADR参照点／L4基本設計（`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/business-requirements.md:123`）へ合流する。成立性実験が必要ならDiscovery／PoCへ切り替える |
| UI prototype | `HIL-BR-13`、requirements v1.3のScreen Applicability／agreement条件 | 画面対象で要求理解・操作・状態・failureの合意が必要 | 独立phaseにせず`L2要求 ↔ prototype`を反復する。agreement receiptなしにL3をfreezeしない。画面非対象は理由・判定者・入力digest・再entry triggerを持つskip receiptを要求する |
| Scrum Reverse | requirements v1.3 §4.1（L94、L96-108）、§4.2（L112-119）、§10（L642-643） | sprint review前、release candidate合流前、public contract／DB schema／主要dependency／NFR budget変更、trace欠落、finding再発・性能退行・障害・手動回避 | `SR0 evidence capture → SR1 observed contract → SR2 V-layer mapping → SR3 design/refactor proposal → SR4 pair freeze and Forward reentry`。v1.3 L104に従い4 entityを単一進捗値へ縮退せず、SR4 receiptなしにrelease-readyへ進めず、findingを4種の修正routeのexactly oneへ送る |

`premise organization`／`premise research`は上流候補sourceから保持したGitHub運用上の証拠整理語彙であり、上記のHARNESS route候補と同じauthorityへ自動昇格させない。推進はrouteを無条件に全適用せず、triggerを満たすrouteを選び、その内部順序・human gate・joinを保持してworkflow instanceを生成する。

次の旧workflow clauseも要求sourceとidentity台帳で保持し、削除・非継承にしない。ただし新世代のnormative名称・trigger・順序・joinは未承認なので、現時点では`preserved_pending_rehome`である。

| 旧workflow identity | source | 保持する意味 | 現在状態 |
|---|---|---|---|
| Forward本線 | `FR-L1-13`、requirements v1.3 §5 L507 | L1〜L12の正方向と3 development styleでの工程実行 | `preserved_pending_rehome` |
| Reverse | `FR-L1-14`、`HIL-BR-04`、`HIL-FR-04`、requirements v1.3 §5 L508、旧business requirements §3.2 | 実装前のR0–R4、RGC、fullback、Forward再合流 | `preserved_pending_rehome` |
| Incident | `FR-L1-16`、requirements v1.3 §9.2 L626、旧business requirements §3.2 | 障害検出、hotfix、即release、収束、production境界・approval確認、対応層へのbackfill | `preserved_pending_rehome` |
| Add-feature | `FR-L1-24`、旧business requirements §3.2 | 既存上流への差分設計・実装接続とForward再合流 | `preserved_pending_rehome` |
| Refactor | `FR-L1-25`、旧business requirements §3.2 | 振る舞い不変検証、旧L0-L14体系のL7/G7確認後のForward復帰。canonical L1-L12への層写像は未決定 | `preserved_pending_rehome` |
| Design Refactor | requirements v1.3 §4.2／§5 L510、`HIL-BR-21`、`HIL-FR-39`、`HIL-FR-50`、`HIL-NFR-24` | 外部挙動を保つ責務・依存・命名・共通化・外部化・DDD境界改善。名称類似だけで統合せず、機能追加を混載しない。observable behavior／public surface／DB semantics／要求に差分があればRedesign／Retrofitへrerouteする | `preserved_pending_rehome` |
| Performance Refactor | requirements v1.3 §4.2 L116／L119 | 設計を保つ性能改善。変更前baseline、budget、workload、profile、統計条件、回帰oracleを先に固定 | `preserved_pending_rehome` |
| Retrofit | `FR-L1-26`、旧business requirements §3.2 | 影響評価と段階移行。旧L0-L14体系のL4-L7移行後／L7以降合流を保持し、canonical L1-L12への層写像は未決定 | `preserved_pending_rehome` |
| Recovery | `FR-L1-08`、`FR-L1-10`、requirements v1.3 §9.2 L625 | 検出・routing、runaway、context exhaustion、開発回帰、forced stopから、再開点・訂正履歴・rollbackを伴って復旧 | `preserved_pending_rehome` |
| version-up | requirements v1.3 §9.2、旧business requirements §3.2 | 将来版activationまでparkし、activation後にAdd-feature／Forwardへ合流 | `preserved_pending_rehome` |
| selected-style change intake | requirements v1.3 §9.2 | styleを暗黙変更せず、影響によりRedesign／Add-feature／Scrum sliceへroute | `preserved_pending_rehome` |
| Redesign re-entry | `HIL-BR-05`、`HIL-FR-05`、`HIL-FR-31`、requirements v1.3 §5 L509 | 影響上流とV-pairをstale化し、再freeze後にForwardへ戻す | `preserved_pending_rehome` |
| Scrum Reverse entity／state | requirements v1.3 §4.1 L104-108、archive asset `LEGACY-ASSET-873BE1F8C64356A2FA0F` | v1.3 L104-106の4 entity名・SR4 publish条件・provisional非canonicalと、archive FR文書内のSRV-FR-101〜112／SRV-AC-101〜112の写し。宣言oracle、全state表、fixture、confirmed親文書は[300行全量台帳](scrum-reverse-source-line-inventory.md)で保持する | `preserved_pending_rehome` |
| 共通Reverse closure | 旧business requirements §3.3.1 L140-143 | 7 routeのReverse closure再利用と、Add-feature／version-up例外。旧層番号はcanonicalへ自動写像しない | `preserved_pending_rehome` |
| interrupt subtype routing | requirements v1.3 §9.2 L633 | 暴走、未確定、追加、層内gapをRecovery、Discovery／PoC、Add-feature、Forwardへ分岐 | `preserved_pending_rehome` |

この一覧は非網羅追加索引であり、不在を非継承・削除・対象外の根拠にしない。旧mode実行器や`signal → mode`をcurrentへ採用する表ではない。各source clauseを失わず、後続の一要求identity PRで新世代HARNESS contractとOS推進mappingへ分離するための未移管一覧である。interrupt横断機構、signal routing前提、差戻し手順と合流層、specialist workflow、gate順序は既存全量台帳に、Scrum Reverseの宣言oracle・state表・fixture・confirmed親文書は[専用300行台帳](scrum-reverse-source-line-inventory.md)に保持し、本一覧では未移管のまま残す。Hybrid親styleはv1.3 L138-139を入力として扱う。

### 自動投影実装前のbootstrap

推進生成器と管理登録層が未実装の間は、repository maintainerが人間の明示指示を原文・時点・対象・source digest付き原eventとして登録し、その原文から意味を追加せず`proposed_upstream_waiting`のlocal ticketへ転記できる。曖昧さ、対象不明、依存不明は補完せず停止条件へ置く。repository maintainerは承認済み操作scope内で、存在確認済みlocal ticketをGitHubへ同一内容投影できる。投影前にticket ID、path、full source revision、source digestを記録し、投影後にIssue本文とlocal ticketの意味欄を再読して一致を確認する。このbootstrapは要求採否、workflow生成、実装許可を行わず、登録層と推進生成器が成立した時点で閉じる。

## review、判断、merge admission

すべてのPRは対象HEADを固定してreviewする。作成側と意味判断側を分け、許可されたGitHub Claude通路を用いる。
reviewはfindingであり、人間判断を代替しない。旧CI、旧test、旧runtime、ローカルClaude CLIをfallbackにしない。
PR classが未選択または複数指定のPRはReadyにしない。

### 作成側とレビュー対応側の責務

- `レビュー対応側`は、PR作成・修正側から独立して割り当てられ、対象PRのreview応答を受け取り、merge／Issue close通路を明示許可された人またはruntimeである。review findingを投稿した主体、`@claude`へのmention、ローカルClaude session、reviewer名だけからこのidentityや通路許可を推定しない。
- PR作成・修正側は、対象差分の作成、証拠提示、review依頼、finding対応、再review依頼までを担う。
- PR作成・修正側は、自分のPRをReady化、merge、auto-merge予約、対応Issueのcloseまで進めない。
- レビュー対応側は、依頼と応答が同じexact base／content HEAD pairへ束縛され、必要なfinding対応が反映されたことを確認する。
- merge admission成立後のmerge、post-merge read-after、対応Issueのcloseはレビュー対応側が行う。merge後に不一致があればcloseせず、作成側へ返す。
- review結果の投稿だけではmerge指示にならない。レビュー対応側がmerge責務を引き受け、対象PRと方式を確認して実行する。
- 責務の割当はGitHub、CLI、API、IDE、Worker等の実行通路の許可を兼ねない。レビュー対応側は、当該通路と作用について明示許可を確認できない場合、mergeせず停止する。

### governance／operation_change PRのmerge admission

個別のmerge admissionが定義されていないgovernance／`operation_change` PRは、少なくとも次をすべて満たす。

1. review request、最後に有効なdelivery receipt、review responseが同じrequest identityとexact base／content full SHAを示し、payload digestが一致する。誤ったreceiptは削除せず、`correction_of`付きの後続receiptで訂正する。
2. current content HEADに未解消のBlocker／Major／Minorが0件である。
3. merge直前にbase HEAD、content HEAD、main HEAD、merge可能性、merge方式を再取得し、review済みpairから変化していない。あわせて、baseを更新した状態で`scfctl stale`が`stale=0`を返す（Scaffold Bindingの上流はPRのhead時点では一致していても、baseの進行や積んだPRのmergeで変わりうる）。結果はreview記録に残す。
4. レビュー対応側に対象PRのmerge、post-merge read-after、対応Issue closeを行う通路が明示許可されている。
5. merge commit方式で統合し、第1親、第2親、content HEADの祖先性をread-afterする。期待と一致しない場合はIssueをcloseせず作成側へ返す。

review依頼もGitHubへの一方向projectionとして扱う。送信前にreview request identity、対象PR、target full SHA、完全な
依頼本文、payload SHA-256を固定し、送信後にcomment ID、remote本文、remote本文SHA-256、target full SHAをread-afterする。
remote本文がpayloadと一致しない、`@claude`本文がなくlocal file pathまたは`@file`文字列だけが投稿された、対象HEADが
currentでない場合は配送失敗またはstaleとして、review待ちへ進めない。comment作成成功、mention、reaction、workflow起動は
review receiptではない。review結果は、応答本文が対象exact HEADを示し、依頼後のcommentとして取得できた場合だけ受理する。

read-after成立後、同じPR threadへ依頼commentとは別の`review_request_delivery_receipt` commentをappendする。このcommentを
PR branch外の配送記録とし、`review_request_id`、対象PR、target full SHA、送信前payload SHA-256、依頼comment ID、取得した
remote本文SHA-256、read-after時点を記録する。payload SHA-256は送信する依頼本文byteに対して計算し、receipt comment自身を
含めない。依頼commentのremote本文byteと送信前payload byteが一致し、両SHA-256も一致した場合だけ`delivery_result: delivered`
とする。訂正は旧receiptを消さず、新しいreceipt identityと`correction_of`で追記する。merge admission判定時はGitHub APIから
依頼comment、delivery receipt、review応答を再取得し、三者のrequest identityとtarget base／content full SHAが一致することを確認する。

### PR #1797 `repository_foundation`

条件1〜6をすべて満たした場合だけReady化し、merge実行候補にできる。条件7はmerge後の統合完了条件である。

1. archive manifestが旧資産集合を完全に固定し、現行pathから旧workflow、runtime、AI instruction、testを実行できない。
2. active文書がConcept、HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS、governanceへ物理分離されている。
3. 本運用モデル、authority入口、旧資産採否・copy・Issue／Project操作記録が相互参照できる。
4. 相対リンク、対象別L2↔L11、merge admission packet等の静的整合が対象content HEADで成立する。
5. GitHub Claudeのexact base／content HEAD pair意味reviewで未解消Blocker／Major／Minorが0であり、request、delivery receipt、
   responseのidentity、full SHA、payload digestがread-afterで一致する。
6. merge直前にPR base／HEAD、main HEAD、merge可能性、merge方式、branch protection、ruleset、required platform gateを再取得し、
   review済みpairと一致する。repository整理だけを対象とするため、別の人間承認やdecision recordは要求しない。
7. merge APIまたは`gh pr merge --merge`で方式を明示し、squash／rebaseを使わずmerge commitで取り込む。API応答のmerge SHAを
   直ちに取得し、第1親がreview済みbase HEAD、第2親がreview済みcontent HEADで、PR途中commitを含む全履歴がmainの祖先に
   なったことをread-afterする。baseが動いた、merge commitが利用できない、またはread-afterが不成立なら統合完了にせず停止する。
   post-merge不一致はrevert／force-pushで隠さず、local監査文書のcorrective PRから専用Issueへ投影して人間判断を求める。

既存CodeQL、旧`harness-check`、旧testのgreenは条件に含めない。#1797に含まれるConcept、Vision、L1、L2、L11、Feature Ticketはbootstrap用のcandidate／draft containerとinventoryであり、mergeしても内容の承認revision、要求採否、ticket Readyを生成しない。個別の人間decisionは対応する後続PRへ分離する。#1797では旧要求sourceを同一byteのread-only snapshotとして保持し、153件と補助sourceを原文・digest付き台帳へ固定する。37件の対象別L2は整理先を示すrouting containerであり、旧要求の代替、縮約、棄却ではない。merge admissionの詳細は[repository foundation merge admission packet](audits/source-rebaseline/repository-foundation-merge-admission-packet.md)を正とする。

### 後続`requirement` PR

各PRは少なくとも次を満たす。

1. 一つの対象productと親Concept／L1 exact revisionへ束縛する。
2. 親Concept／Vision／企画から導いた判断論点と、premise packetまたはresearch非適用判断へ束縛する。
3. 一つの要求identity、`unit`／`connection`／`composite`、actor、目的、scope、non-goal、制約、失敗・回復を示す。
4. 対になるL11に正常系とnegative case、N/Aなら理由・判断者・再評価条件を持つ。
5. 旧要求を扱う場合は原要求ID、原文digest、successor ID、意味atomの被覆、未被覆atomを記録する。未被覆は`pending`として保持し、旧実装・旧CIをauthorityへ戻さない。
6. HARNESSの無損失被覆contractで、入力source atom集合を当該要求へ保持した集合、別の生存中仮登録へ残す集合、人間decisionにより変更・retireする集合へ完全分割し、未計上atomを0にする。
7. 対象要求候補のsemantic digest、source atom集合digest、`coverage_result: no_loss`、未計上atom0を持つHELIX-OS管理層の`registered_proposal` recordへ束縛し、対象HEADでread-afterする。仮登録は`authority_effect: none`とする。
8. 影響する既存要求だけを示し、無関係な要求を同じPRへ混載しない。
9. GitHub Claudeの対象HEAD意味reviewで未解消Blocker／Majorが0である。
10. すべての`requirement` PRで、対象revisionに束縛した人間decision recordを持つ。保持・再配置の確認、意味変更、retireを別decision種別として記録する。

## 新世代CIへの接続

新世代CIは、承認済み要求とfreeze済み設計・検証から必要oracleを導出できる段階で、HELIX-OSの
`operation_change` PRとして設計する。それまではCIをmerge admissionの代替にせず、旧workflowとのparityやdual-greenを
要求しない。本運用モデルと後続要求PRの証拠構造が、新世代CIを上流から生成するための入力となる。
