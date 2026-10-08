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

1. 対象revisionへ束縛した人間decision record。L3／L10では、POの委任による判断記録を含む（「L3／L10承認の委任」）。
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
| `design_verification` | 一つの承認要求に対するL3とL10、または後続の一つのV-pair。L3／L10は一つの機構の一つのStageに属する承認要求のpair群までを一つのPRにまとめてよい（「PRの原子性」） | 承認要求revision、適用template、risk、未解決 | 対象pairのfreeze可能な設計・検証契約 | 実装完了、利用者受入、運用成立 |
| `implementation` | 一つの承認・freeze済みticketが指定する成果と必要検証 | Feature Ticket、親要求、設計、oracle、許可、HEAD | 対象成果と検証証拠 | 無関係な要求・設計の変更、release、deployment |
| `operation_change` | GitHub、CI、Worker、配布等の一つの外部運用変更 | HELIX-OS要求、操作authority、backup、rollback、read-after | 許可scope内の外部状態変更 | 要求意味、人間承認、別操作の許可 |

要求PRは原則として一つの要求identityだけを扱う。複数要求を一括変更しない。connection要求は接続そのもの、
composite要求は組合せ固有の全体条件を一つのidentityとして扱い、構成unitの要求PRと分ける。
`requirement` PRをReadyにする前に、親Concept／Vision／企画revisionから判断論点を特定し、premise packetまたは
`research_not_required`の理由・判断者・再評価条件を参照する。research結果は要求候補の根拠であり、採用authorityではない。
premiseが承認済みConcept／Vision／L1と`conflict`または`stale`になった場合は、対象の`concept_revision`または`planning_revision`へbackflowしてから要求採否へ進む。`unknown`または`assumption`を残す場合は、影響範囲、判断者、再評価条件を記録する。PoC／prototypeは`discovery_evidence`としてproduction pathから隔離し、結果だけをpremiseまたは要求候補へ戻す。

要求を降ろす順序は、単独で成立する`unit`、採用済みunit間の関係を定める`connection`、採用済みunit／connectionの集合に固有な結果を定める`composite`とする。後段要求は参照先のexact revisionを持ち、unitの成立からconnectionやcompositeの成立を推定しない。分割元の旧要求は、各successorを別PRで確定し、全意味atomの被覆を確認するまで`pending`を残す。要求revisionの承認後に管理が工程を推進へ渡し、推進がFeature Ticketを発行する。親要求、必要なconnection／composite、premise状態、HARNESS contract、停止条件のいずれかが未確定ならticketをReadyにしない。

### PRの原子性

一つのPRは、一つの変更目的と、上表のclassが定める一つの対象だけを扱う。`requirement`の対象は一つの要求identityである。
`design_verification`のL3／L10は、POが承認する単位に合わせ、一つの機構の一つのStage（要求段階の対応順序案とその追補が定めるStage）に
属する承認要求のpair群を上限とする。複数の機構、または複数のStageにまたがる要求のL3／L10を同じPRで起草・修正・確定しない。
PRの中でも要求identityごとにL3とL10の対を分けて書き、別の要求の条件を混ぜない。

対象PRが実際に参照する共通部品（template、共通規則、参照先の契約）が未確定なら、その共通部品を先行PRで閉じてmergeし、
対象PRはそのexact revisionを参照する。対象PRは共通部品の規則を本文へ書き写さず参照し、その対象に固有の条件だけを書く。
対象PRが参照しない共通部品のmergeを待つ必要はない。後段の内容を先行PRへ混載しない。

人が読む本文の差分は200〜400行を目安とする。目安を超える場合は、PR本文に超える理由と、範囲をさらに分けられない理由を書く。
監査・照合の証拠や機械生成の記録は行数の目安に含めないが、範囲を広げる理由にはしない。

範囲を超えて作業した成果は、そのPRをmergeせず、範囲ごとのPRへ切り出す。切り出した各PRはexact HEADで独立reviewを受け直し、
元PRには切り出し先PRの一覧と、元の範囲の全対象が切り出し先で被覆されたことを記録してからcloseする。被覆を確認するまで、
元PRの範囲で未確定の対象を確定済みとして扱わない。

レビュー対応側は、本文の句単位reviewの前に、PR class、範囲（`design_verification`では機構とStage）、変更目的の数を確かめる。
範囲を超えるか変更目的が複数なら、範囲違反をblockerとして返し、句単位reviewには進まない。範囲違反のPRではmerge admissionは成立しない。

旧sourceは次のとおりである。いずれも台帳上`unresolved`であり、本文を完全一致copyせず意味を再導出する。

- `archive/legacy-generation-2026-09-14/root/docs/governance/ai-dev-team-operations_v1.1.md`（`LEGACY-ASSET-20C14BB23C519C65E7BD`、
  SHA-256 `4c03ceed6fd11985158cb9dd7d3e5f455274cf74e839523b756da7f35441867d`）101–107行「原則5: 1 PR = 1 変更目的」：
  複数の目的を1つのPRに詰め込まない、差分200〜400行の目安、巨大PRはreviewされない。
- `archive/legacy-generation-2026-09-14/root/docs/governance/github-operations-reference-audit-2026-07-18.md`（`LEGACY-ASSET-57E3CD5314D2CB4C2EF1`、
  SHA-256 `c6f2c106ee33720b7664f3ac9f02ba1896b7b819cb4f57bc119f1ce817ff27a3`）41行：採用した「1 PR 1目的」と短命branch。
- `archive/legacy-generation-2026-09-14/root/docs/governance/l3-rebaseline-g3-freeze-packet.md`（`LEGACY-ASSET-269C287365D652DEAD93`、
  SHA-256 `519be70ab005c875d57acab510869b67bea23bd3304f8f24d9b0223da37a2ebd`）340–342行：責務ごとに小PRで閉じ、
  先行PRのmerge後に後段PRを別PRで閉じ、後段PRを先行PRへ混載しない。
- `archive/legacy-generation-2026-09-14/root/docs/governance/github-issue-hierarchy-rules.md`（`LEGACY-ASSET-3BBD5A19BFD9A0FC7166`、
  SHA-256 `c965a2744c99cbdfe69f071167fe009ade68337e31e0fb1de13377568084d1ca`）37行：1 PRは1 `task` Issueだけを閉じる。

保持する点は、1 PR 1目的、行数の目安、後段の混載禁止である。変更する点は四つある。

一つ目は、PRの範囲を旧sourceのPLAN・`task` Issue単位から、現行のPR class表が定める対象の単位へ置き換えることである。
現行の工程はPLANやIssueから要求意味を生成しないためである。

二つ目は、`design_verification`のL3／L10の範囲を、一つの承認要求から一つの機構の一つのStageへ広げることである。
起点は利用者の起草指示`scaffold/review-handoff/local/codex-goals-2026-10-03-l3.md`（SHA-256
`3561eb221023220ccd6dda9ace008882851eac343ca76611742b07b2e30703e5`）のL3-G1「機構ごとまたは依存のまとまりごとにPRを分けてよい」と、
同「PO承認への渡し方」の「承認は機構またはStageのまとまりごとに受ける」である。2026-10-05にPOが、PRの単位の上限を
機構×Stageとすることを選んだ（[判断記録](decisions/pr-atomicity-unit-po-decisions-2026-10-05.md)）。PRの範囲を承認の単位と揃え、承認単位をまたぐ一括PRを作らないためである。
影響として、PR class表の`design_verification`行に範囲の上限を追記した。要求identityごとのL3／L10の対と、PO承認の記録方法は変えない。

三つ目は、共通部品の先行mergeである。旧`l3-rebaseline-g3-freeze-packet.md:340–342`は、GitHubの五責務ごとにL4基本設計とL9結合oracleを閉じ、
そのmerge後にL5詳細契約とL8単体oracleを閉じる層間の順序であり、共通部品一般の先行mergeを定めていない。本節はこの順序を、
対象PRが実際に参照する未確定の共通部品へ一般化する。理由は、共通規則を対象ごとに書き写すと、規則の変更が全対象への手作業の同期になり、
取りこぼしが再発するためである。影響として、対象PRは自分が参照する共通部品のmergeだけを待つ。参照しない共通部品は待たない。

四つ目は、レビュー対応側が句単位reviewの前に範囲を確かめ、範囲違反をblockerとして返すことである。
旧sourceは巨大PRがreviewされないことを心得として述べるだけだった。

二つ目から四つ目の理由となった事例は#2564である。8機構・全Stageの274件のL3／L10を一つの`design_verification` PRで扱い、
11回の往復でmajorを減らせなかった。毎回、規則の書き写しと兄弟対象の取りこぼしが再発した。新しい人間承認手続きは加えない。

## L3／L10承認の委任

2026-10-05のPO判断（[判断記録](decisions/l3-l10-approval-delegation-po-decision-2026-10-05.md)）により、
`design_verification` PRのL3／L10の対象revision承認は、POからの委任で成立する。成立の条件は、2026-10-08のPO判断（[判断記録](decisions/l3-l10-delegation-cross-runtime-review-po-decision-2026-10-08.md)）で、作成と別系統の独立reviewに改めた。
委任はL3／L10に限る。Concept、企画（L1）、要求とprototype／非UIの合意（L2）は人が判断する。要求の意味・範囲・担当・版を変える必要が出た場合は、L2へ戻してPOへ上げる。
この節は開発repo（本repository）の運用規則であり、開発repoではクロスレビューを必須とする。製品（リリース側）であるHELIXの独立reviewの要求（Conceptの「providerが同じか別かでは独立性を決めない」）とは対象が違い、両者を食い違いとして扱わない（2026-10-08のPO判断、[判断記録](decisions/l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md)）。

### 承認の成立

次の三つが、同じ対象の本文revisionについてそろった場合だけ、承認が成立する。

1. 作成側（content producer）とは別のruntimeで、別のmodel familyに属するreview側が、exact base／content HEADを独立にreviewし、承認を止める問題がない（`no_findings`）と結論している。現行の運用では、Codex（OpenAI系）が作成した本文をClaude（Anthropic系）が、Claudeが作成した本文をCodexがreviewする。
2. review commentに、作成側とreview側のruntime、model family、モデル名と版が記されている。同じ系統どうしのreviewは、1を満たさない。
3. 1の後で、6文書のbytesが変わっていない。

review側が承認を止める問題を挙げた場合は、作成側へfindingとして返す。修正で本文revisionが変わった場合は、新しいrevisionについて1と2をやり直す。

Fable（Claudeのadvisor）は毎回のreviewに入れず、エスカレーション先とする。作成側とreview側の判断が分かれて解けない場合、review側が固定親との対応や要求の意味の判断に迷う場合、不可逆・高影響の操作の前に確認が必要な場合に、Fableに相談する。Fableの助言は、独立した承認条件にしない。Fableの結論は助言として記録する。Fableが承認を止める問題を挙げた場合は、review側が固定親に照らして確かめ、妥当なら作成側へ返す。それでも解けない場合は、両方の見解を添えてPOへ上げる。

2026-10-08の判断記録がmainへ入る前に、OpusとFableの見解の一致で成立した承認は、そのまま有効である。

### 記録とmerge

- review側は、承認の成否、残る問題、照合した対象revision、作成側とreview側の系統を、PR commentとmailboxで返す。利用できる場合は、`scaffold/l3l10-checks/`の検出器（`SCF-B-0157`）のreceiptの結果を添える。検出器は違反の検出器であり、合格条件ではない。
- 作成側は、従来のPO判断記録と同じ形式で判断記録を加える。`decider_role`は`PO（委任：作成と別系統の独立review）`とし、次を固定する。
  - 本委任の判断記録（2026-10-05と2026-10-08）
  - 独立reviewの結論commentのIDと、取得したbodyのSHA-256
  - 作成側とreview側の系統
  - 承認対象の本文revisionと、6文書のSHA-256
- review側は、判断記録の引用と、6文書が承認対象から変わっていないことを照合する。照合の後は、従来どおり作成側がReady化し、review側がmerge admissionを再照合して明示mergeする。
- 委任による承認は、POの承認を待たない。本委任より前に受けたPO承認は、そのまま有効である。

### 人に承認を求める回数を減らす

作業はヒューマンアウトオブザループを前提とし、計画や承認済みの文書は、やってみて分かったことで直してよい（変更耐性）。人の判断は省かず、求める回数を減らす。

- 承認済みのL3／L10を直す場合、親L2の意味・範囲・担当・版が変わらない限り、新しい本文revisionについて「承認の成立」の条件を確かめ直すだけでよい。POの承認は求めない。
- 人が持つ判断（Concept、L1、L2の合意と意味変更、retire、L2へ戻す意味変更）が必要になった場合も、一件ずつ止めて聞かない。論点を記録して、その論点に依存しない作業を続ける。POへは、機構×Stageの事後確認と同じ機会にまとめて出す。
- 待っている判断に依存する作業だけを止める。待つこと自体を、作業全体の停止理由にしない。
- 人へ論点を出す前に、PoC、画面prototype、調査で論点を絞り、証拠を添える。HELIX-BRAIN（知識）とHELIX-INTELLIGENCE（判断）の機能ができた後は、それらも使う。これらの機構は、人に聞く回数を減らし、やってみて分かることを取り込むためにある（POの指示「そのためのブレインやPoCや画面プロト、インテリジェンスの機能。」）。
- 不可逆な外部作用（release、tag、cutover、配布repo切替など）は、従来どおり対象と作用を明示した許可を要する。

### POの事後確認

機構のStageについて委任による承認がまとまった時点で、review側はPOへ一覧を出す。一覧には、PR、承認対象の本文revision、判断記録、独立reviewの結論comment（2026-10-08より前の承認はOpusとFableの結論comment）を並べる。
POが差し戻すと判断した場合は、差し戻しの判断記録を作る。対象revisionの承認は、その判断記録で取り消し、該当する本文を修正のPRへ戻す。事後確認の前にmergeした内容は、差し戻しの判断記録が入るまで有効とする。

### 旧HELIXとの対応

- 旧`CLAUDE.md`（`LEGACY-ASSET-6EBDB617A8104A7756D0`、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）82–85行「自律境界」：人は企画・要求・デザインモックを持ち、L3要件は承認のみ、L3起草以下はAIが自走する。
- 同195–197行：mainのbranch protectionで「人間 approve 不要 (PO 明示承認)」とし、品質ゲートをCIとクロスランタイムのreview証拠に置いた。

保持する点は三つある。Concept、企画、要求とprototype／非UIの合意は人が持つ。L3はAIが起草する。不可逆な外部作用は、対象と作用を明示した許可を要する。

変更する点は、L3要件の承認を、人が毎回行う形から、POの委任によりOpusとFableの見解の一致で成立する形へ移し、POは機構×Stageの区切りで事後確認することである。
2026-10-08のPO判断で、成立の条件を、OpusとFableの見解の一致から、作成と別系統の独立reviewへ改めた。旧`producer-provenance-separation-requirements.md` PPS-R-03（`LEGACY-ASSET-A04F169C5D514C5443D0`、28–34行）の「独立性はcontent producerのruntime／provider／model family／sessionとの関係で判定し、同一producer系統のreviewをterminal evidenceにしない」を起点にし、Fableはエスカレーション先とした。変更の理由と、旧`worker-independent-review.md`との食い違いの扱いは、同日の判断記録に記録した。
旧195–197行は、POの明示承認により、人のapproveを異なるruntimeのreview証拠へ置き換えていた。本節はこの置換えを、PRのapproveからL3の対象revision承認へ広げる。

あわせて、人の判断を求める機会を、一件ごとから、機構×Stageの事後確認にまとめる。旧HELIXの自律境界でも、人が直接関わるのは上流の判断に限られており、それ以外はAIが自走していた。本節はこれを、人の判断が要る場合の聞き方にも当てはめる。

変更の理由は、POが「毎回承認するのは骨が折れるから最終チェックに周りてくれ」「前提がヒューマンアウトオブザループで考えろ」「L3までだが、承認回数を減らせ」と指示したことである。影響として、L3／L10のPRはPO承認待ちで止まらずにmergeまで進む。
人が持つ判断の論点は、まとめて出されるまで作業全体を止めない。POの判断は、Concept・L1・L2と、L2へ戻す意味変更、および事後確認での差し戻しに残る。

## IssueとFeature Ticket

- GitHubで人が読むtitle、見出し、目的、判断、状態説明、停止理由は日本語を原則とする。ID、path、command、schema語彙、
  label等の機械識別子と一般的な開発用語は原語を保てるが、英語見出しだけで意味を判断させない。
- `.github/PULL_REQUEST_TEMPLATE.md`と`.github/ISSUE_TEMPLATE/feature-ticket-projection.yml`は、ローカル正本をGitHubへ転記する補助surfaceであり、要求やticket意味の入力面ではない。templateが欠けても本書のauthorityは失われず、template入力だけで上流承認を生成しない。
- Feature Ticketは作業種別と作業内容だけを持つ作業指示であり、要求・設計の正本ではない。正本は設計書（Conceptから下流の各層の文書と判断記録）に置き、ticketを破棄しても設計書から作業を再構成できる状態を保つ（2026-10-09の[開発repositoryのチケット方針](decisions/dev-repo-ticket-policy-po-decision-2026-10-09.md)）。
- ticketは書き換えない。作業内容を変えるときは新しいticketを発行し、元のticketは残す。状態、PR番号、Issue番号、merge結果をticketへ書き戻さず、ticketとGitHubの対応はticketの外のappend-onlyのprojection receiptに置く。
- ticketに依存関係を持たせず、ticketの依存や状態をCI・review・merge・作業開始の条件にしない。作業の順序と前提は設計書と判断記録の側で確かめ、ticketが一枚欠けてもCI・review・mergeを止めない。
- IssueはFeature Ticketの協調projectionであり、Issue番号を要求IDやticket IDにしない。
- Issue投影前にlocal ticketの存在、`source_revision`での内容、source digestを確認する。Issueの意味欄はlocal ticket本文からの転記に限定し、転記内容のdigest不一致はprojection失敗とする。
- local ticketが存在しないIssue Form入力はwork authorityにしない。新規の人間指示を含む場合は入力を原eventとしてローカル登録へ戻し、要求採否と分けたprojection failure receiptを残してIssueを非実装状態で閉じる。入力を黙って捨てない。
- `requirement` PRは[管理層の要求仮登録契約](management-provisional-requirement-registration.md)に従い、要求候補と旧source atomの無損失被覆をHELIX-OS管理層へ仮登録してからmerge admissionへ進む。GitHub Issue／PRは仮登録recordのprojectionであり、仮登録正本ではない。
- 上流承認前に人間の明示指示から起票した作業も、実装へ進めるかはticketの記載ではなく、対象の上流のauthority状態（[上流authority状態モデル](authority-state-model.md)）で判断する。
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
| Scrum Reverse entity／state | requirements v1.3 §4.1 L104-108、archive asset `LEGACY-ASSET-873BE1F8C64356A2FA0F` | v1.3 L104-106の4 entity名・SR4 publish条件・provisional非canonicalと、archive FR文書内のSRV-FR-101〜112／SRV-AC-101〜112の写し。宣言oracle、全state表、fixture、confirmed親文書は[300行全量台帳](legacy-migration/delegated-document/scrum-reverse-source-line-inventory.md)で保持する | `preserved_pending_rehome` |
| 共通Reverse closure | 旧business requirements §3.3.1 L140-143 | 7 routeのReverse closure再利用と、Add-feature／version-up例外。旧層番号はcanonicalへ自動写像しない | `preserved_pending_rehome` |
| interrupt subtype routing | requirements v1.3 §9.2 L633 | 暴走、未確定、追加、層内gapをRecovery、Discovery／PoC、Add-feature、Forwardへ分岐 | `preserved_pending_rehome` |

この一覧は非網羅追加索引であり、不在を非継承・削除・対象外の根拠にしない。旧mode実行器や`signal → mode`をcurrentへ採用する表ではない。各source clauseを失わず、後続の一要求identity PRで新世代HARNESS contractとOS推進mappingへ分離するための未移管一覧である。interrupt横断機構、signal routing前提、差戻し手順と合流層、specialist workflow、gate順序は既存全量台帳に、Scrum Reverseの宣言oracle・state表・fixture・confirmed親文書は[専用300行台帳](legacy-migration/delegated-document/scrum-reverse-source-line-inventory.md)に保持し、本一覧では未移管のまま残す。Hybrid親styleはv1.3 L138-139を入力として扱う。

### 自動投影実装前のbootstrap

推進生成器と管理登録層が未実装の間は、repository maintainerが人間の明示指示を原文・時点・対象・source digest付き原eventとして登録し、その原文から意味を追加せずlocal ticketへ転記できる。曖昧さ、対象不明、依存不明は補完せず停止条件へ置く。repository maintainerは承認済み操作scope内で、存在確認済みlocal ticketをGitHubへ同一内容投影できる。投影前にticket ID、path、full source revision、source digestを記録し、投影後にIssue本文とlocal ticketの意味欄を再読して一致を確認する。このbootstrapは要求採否、workflow生成、実装許可を行わず、登録層と推進生成器が成立した時点で閉じる。

## review、判断、merge admission

すべてのPRは対象HEADを固定してreviewする。作成側と意味判断側を分け、利用可能な新世代の独立review通路を用いる。
reviewはfindingであり、要求・Concept等の人間判断を代替しない。旧CI、旧test、旧runtime、ローカルClaude CLIをfallbackにしない。
PR classが未選択または複数指定のPRはReadyにしない。

### 旧HELIXのGitHub自走運用から保持する契約

旧sourceは`archive/legacy-generation-2026-09-14/root/CLAUDE.md`（`LEGACY-ASSET-6EBDB617A8104A7756D0`、
SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）の「GitHub 自走運用」と、
同階層の`AGENTS.md`（`LEGACY-ASSET-A54FF182C7E8ACF56ACF`、
SHA-256 `fafe73efa4b34864c3b5e6a60775a21007d9c6bf358e710edaa5d2bce50ea2bf`）である。
両assetは台帳上`unresolved`でconsumer_refsも未確定の旧AI instructionであり、本文を現行instructionへ完全一致copyしない。
旧sourceの作成側／review側の分離、push→Draft PR→独立review→明示merge、blockerの一括返却と修正後HEADの再判定を意味再導出する。
新世代CI、`harness-check`、PLANの`review_evidence`、DB追従、旧`helix` CLIは現行の合格条件やfallbackにしない。
Concept・要求の人間判断、Scaffold Bindingのstale確認、現行PR class条件は維持する。
旧sourceでの失敗・consumerの個別閉包は未確認であり、旧runtimeの稼働実績を新世代の運転証拠にしない。
[Capability Lease承認record](decisions/capability-lease-bootstrap-approval-2026-09-20.md)は後続のmerge executorと実行環境許可を
別途承認しているが、lease実装・有効化はそのrecordだけでは成立しない。本再導出案の直接`gh pr merge --merge`と
leaseの二重境界は両立しないため、双方を同時に現行運用として扱わない。後続lease導入時にはこの差分の採否を
別revisionで判断し、承認済みrecordを黙って削除・失効させない。

### 作成側とレビュー対応側の責務

- `レビュー対応側`はPR作成・修正側と異なるcontextのruntimeとし、対象PRのexact HEADをread-onlyで独立reviewしてfindingをPR commentへ記録し、merge admissionを判定する。作成側の差分編集・push・Ready化はしない。review findingの投稿者名、`@claude` mention、ローカルClaude sessionだけで独立性やreview成立を推定しない。
- PR作成・修正側は、対象差分の作成、静的証拠提示、push、Draft PR作成、review依頼、finding対応、再review依頼までを明示依頼を待たずに担う。blockerは同じHEADについて一括で返し、修正後HEADは新しい独立blockerの実証がなければ一巡だけ再判定する。review側が修正後HEADの結果を記録し、未解消blockerが0件であることを作成側が確認したらReady化する。
- PR作成・修正側は、自分のPRをmerge、auto-merge予約、対応Issueのcloseまで進めない。Ready化は独立review結果の確認後に限る。
- レビュー対応側は、依頼と応答が同じexact base／content HEAD pairへ束縛され、必要なfinding対応が反映されたことを確認する。
- レビュー対応側は、PR classを問わず、merge admissionの直前に、PRのcontent HEADを変えずに、最新baseとのmerge結果（GitHubの`refs/pull/<番号>/merge`、またはローカルの試験merge）に対して`scfctl stale`が`stale=0`を返すことを確認し、結果をreview記録に残す。Scaffold Bindingの上流（`upstream[].path`）は文書・台帳を問わず`scaffold/`の外にあり、どのclassのPRでも変更されうる。PRのhead時点で一致していても、baseの進行や積んだPRのmergeで変わりうる。PR branchへbaseを取り込んでcontent HEADを変えると、exact HEADに束縛したreviewをやり直すことになるため、そうしない。`refs/pull/<番号>/merge`はGitHubが非同期に再計算するため最新baseより古いことがある。使う場合は、その第1親が再取得したbase HEADと、第2親がcontent HEADと一致することを確かめ、一致しなければローカルの試験mergeで実行する。`stale`が1件以上ならmergeせず作成側へ返す。
- merge admission成立後、レビュー対応側が人間の追加approveを待たず`gh pr merge --merge`で明示mergeし、post-merge read-afterを行う。GitHub native auto-mergeは使わない。対応Issueのcloseは要求・ticketの完了条件を別に確認し、mergeだけから完了へ進めない。merge後に不一致があればcloseせず、作成側へ返す。
- review結果の投稿だけではmerge admissionは成立しない。レビュー対応側が対象PR、review済みHEAD、必要な人間decision、Scaffold Binding、merge方式を再照合する。

### governance／operation_change PRのmerge admission

個別のmerge admissionが定義されていないgovernance／`operation_change` PRは、少なくとも次をすべて満たす。

1. review requestと独立review responseが同じPRのexact base／content full SHAを示し、応答が現行HEADに対するものである。配送commentの存在やmentionだけでreview成立としない。
2. current content HEADに未解消のblockerが0件である。同じ責務・既存scopeで安全に閉じるfindingは本PRで修正し、独立責務・別設計・lifecycle・性能改善は別episodeへ分ける。
3. merge直前にbase HEAD、content HEAD、main HEAD、merge可能性、merge方式を再取得し、review済みpairから変化していない。
4. 作成側とは独立したレビュー対応側が`gh pr merge --merge`で明示mergeし、post-merge read-afterを行う。人間の追加approveをmergeの前提にしない。
5. merge commit方式で統合し、第1親、第2親、content HEADの祖先性をread-afterする。期待と一致しない場合はIssueをcloseせず作成側へ返す。

review依頼は対象PRとexact base／content HEADを示すcommentで行い、投稿後にremote本文と対象HEADを読み直す。
local file pathや`@file`文字列だけが投稿された場合や対象HEADが変わった場合は再依頼する。
comment作成成功、mention、reaction、workflow起動だけをreview receiptにしない。review応答が対象HEADと所見を示すことを
確認し、修正でHEADが変わった場合は新しいrevisionとして再reviewする。別の`review_request_delivery_receipt` commentは
merge admissionの必須条件にしない。

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

## GUIレーンの運転と通知

作成側とレビュー対応側は、同じVS CodeのClaude Code拡張とCodex拡張の既存セッションで動く。通知の仕組みは
[SCF-B-0003の仮組み](../../scaffold/review-handoff/README.md)であり、ここではその運転の決まりを定める。

- **レーンの割当**：作成（`execution`）とレビュー対応（`review_merge`）は、利用者の作業指示に従い、`gui_mailbox.py bind`で既存セッションを登録して決める。同じruntimeが両レーンを兼ねない。現在の割当は`gui_mailbox.py status`で確かめ、本文書には固定しない。
- **セッション開始時**：各GUIは自分のセッションがレーンに登録済みで、leaseが有効かを`status`で確かめる。失効していれば同じセッションを`bind`し直す。別セッションへの付替えは、利用者の指示またはセッションの交代のときに限る。
- **依頼と指摘の記録**：記録の正本は上記のとおりPR commentである。通知箱はそのPR commentを相手のセッションへ届け、起床させるための配送であり、通知本文・ACKをreview receiptやmerge admissionにしない。作成側はreview依頼のPR commentを投稿した後、同じexact base／content HEADで`review_request`を送る。レビュー対応側は所見をPR commentへ記録した後、`review_response`を送る。通知の向きはレーンではなくそのPRの作成側（packetの`author`）とreview側（`reviewer`）で決まり、どちらのレーンが作成したPRでも同じ経路を使う。
- **配送不成立の扱い**：宛先のleaseが失効していても、登録済みのセッションへは通知を積み、そのセッションの次の動作で届く。`send`の出力`receiver_lease_active`がfalseのとき、宛先のhookがGUIで信頼・読込されていないとき、ACKが返らないときは、配送不成立とする。`queued`や登録済みleaseだけで配送成功とせず、PR commentを投稿したうえで利用者へ配送不成立を伝える。期限切れや未ACKの通知を自動で再送せず、対象HEADを取り直して新しいevent IDで送る。
- **相手の応答を待つとき**：停止後に通知で起きられないruntime（現行のCodex。Stop hookは停止時に短く確かめるだけである）は、相手のreview結果、Ready化、mergeなど自分のゴールに必要な応答を待つ間、ターンを終えずに待受を続ける。1回を10分とし、各回の前に同じセッションを`bind`し直してleaseを保ち、`receive --wait 600`で通知箱を待ち、各回の後に対象PRの状態とPR commentを確かめる。通知を受けたら`inspect`で本文を読んでACKし、作業へ戻る。対象PRがmerge・closeされたとき、待つべき応答がなくなったとき、利用者が別の指示をしたときに待受を終える。待受は配送の手段であり、待っている間の経過や通知から承認やmerge admissionを生成しない。Claudeは`asyncRewake`のStop hookで停止後も通知により起きるため、この待受を要しない。
- **指示の同期**：両runtimeの利用者instruction（`~/.claude/CLAUDE.md`、`~/.codex/AGENTS.md`）のHELIX管理区間は、`configure_gui.py --apply`で同じsourceから同期し、手で書き換えない。管理区間の外に旧`helix` CLI、`harness.db`、`.helix/`を正規経路とする記述が残る場合は、管理区間と矛盾するため利用者の確認を経て除く。
- **GUI側の操作**：新しいhookの信頼・読込は利用者がGUIで行う。hook設定の書込やscfctlの合格だけで接続成立としない。接続の確認は、両GUIが実際に通知を受けてACKを返したことで行う。

旧sourceは`archive/legacy-generation-2026-09-14/root/.claude/settings.json`（`LEGACY-ASSET-F27AC6F39D89FE021C56`、
SHA-256 `df8a6f6d51152446708f93558917c1d760a1d9f5639c31d5474a350d1e697ef1`）のStop hook（67〜89行目、`asyncRewake`で
「Claude宛て通知を待機」）と、上記`CLAUDE.md`の「GitHub 自走運用」である。保持する点は、相手の作業を同じセッションへ届けて起こし、
人の取次ぎを待たずに作成→review→mergeを回すことである。変更する点は、配送元を旧harness memory・DBから仮組みの通知箱へ替え、
Codex側にも同じ待受と指示の同期を置くことである。変更の理由は、旧runtimeを起動しない現行の境界の下で、旧世代と同じく
取次ぎなしで回すためである。新しい承認手続きは加えていない。

応答を待つ間の待受は、上記`CLAUDE.md`の「GitHub 自走運用」（193行目「明示依頼を待たずpush→Draft PR→CI監視→self-heal→AI-B最終review→明示mergeまで継続する」）を旧sourceとする。
- **保持する点**：相手の作業やCIを待つ間も作業を手放さず、mergeまで監視を続けること。
- **変更する点**：監視の対象を旧CIと旧runtimeから、通知箱と対象PRの状態へ替えること。停止後に起きられないruntimeだけが、ターン内で10分ごとの待受を行う。
- **変更の理由**：Codexの既存GUIセッションはターンを終えると通知では起きず、相手の応答を待つ間に止まると、利用者が声を掛けるまで作業が止まるためである。#2563と#2564では、Codexがreview結果やReady化を待つ間に停止し、利用者の声掛けまで進まなかった。新しい承認手続きは加えていない。

通知の向きをPRごとの作成側・review側で決める点は、上記`CLAUDE.md`の「GitHub 自走運用」（AI-Aが作成・blocker修正・push、AI-Bがread-only収束review・merge判断）と、同じファイルの正規コマンド（`helix codex --role <role> --task "..."`と`helix claude --role <role> --task "..."`の両方向の委譲）を旧sourceとする。
- **保持する点**：作成役とreview役をruntimeに固定せず、どちらのruntimeが作成しても、もう一方が独立にreviewしてmergeまで回すこと。
- **変更する点**：委譲のために相手のproviderを起動するのではなく、既存GUIセッション間の通知箱で届けること。作成側とreview側が別runtimeであることは、レーンの向きではなくpacketの`author`と`reviewer`で確かめる。
- **変更の理由**：レーンの向きで固定すると、`review_merge`のレーンが作成したPRで依頼も指摘も届かず、自走が止まるためである。新しい承認手続きは加えていない。

### レーンの交代と、両レーンが作成したPR

- 作成側かどうかはPRのcommitで判断する。commitを作ったレーンは、そのPRの作成側である。
- POの指示で`review_merge`のレーンが作成側を担う場合も、review依頼はPR commentに記録したうえで、通知箱から`review_request`を送る。この場合は`execution`のレーンがreviewとmergeを担い、指摘は`review_response`で返す。以前の通知箱は`execution`から`review_merge`への依頼だけを受け付けていたため、#2424と#2562ではPR commentだけで依頼し、相手が気づくまで止まった。
- 一つのPRに両レーンのcommitがある場合、各レーンは相手が作ったcommitだけを独立reviewとして扱い、自分のcommitをreviewしたことにしない。両レーンが作成側を含むため、merge担当はPOに確かめ、その選択をPR commentに原文で残す。#2424では、POが「Codexがmerge (Recommended)」（元の分担に戻し、Claudeが作成・Codexがreviewしてmerge）を選んだ（2026-10-04）。

### 作業branchとworktreeの片付け

作業branchとworktreeは、内容を失わない範囲で片付ける。作業管理Issue #2093の運用を、ここで決まりとして定める。

- **remoteのbranch**：mergeされたPRのbranchは、repositoryの`delete_branch_on_merge`で自動削除する。この設定は維持する。mergeされずにcloseされたPRのbranchは、`refs/pull/<番号>/head`で中身を辿れるため、削除してよい。`main`、`archive`、open PRのbranchは消さない。
- **worktreeとローカルbranch**：次をすべて満たすものだけを、`git worktree remove`と`git branch -d`で片付ける。
  - 未commitの変更がない。
  - 先端のcommitが`origin/main`の祖先である。
  - そのworktreeで動いているprocessがない。
- **独自の内容を持つbranch**：`origin/main`にないcommitやファイル内容を持つbranchは、作ったレーンの判断なしに消さない。消すときは、事前に`git bundle`でバックアップを取る。ファイル内容がすべて`origin/main`にあることを確かめた場合に限り、`git branch -D`を使う。
- **他レーンの作業**：他のレーンが作業中のworktreeや未commitの変更には触れない。
- **記録**：片付けた件数、残した件数とその理由を#2093に記録する。片付けは作業領域の管理であり、要求・PR・Issueの完了やcloseを生成しない。

旧sourceは上記`CLAUDE.md`の「GitHub 自走運用」（`repoのdelete-branch-on-merge設定は維持する`）と、同じファイルの「Hybrid 多ランタイム commit 協調」（191〜236行目。相手のruntimeのcommitを破棄・デグレさせない）である。
- **保持する点**：merge後のbranch自動削除と、相手のruntimeの作業を失わないこと。
- **変更する点**：旧`git-command-guard`とoverride markerを、ここに書いた条件（未commitの変更なし、mainの祖先、process不在、事前のbundle）に置き換えること。
- **変更の理由**：旧runtimeを起動しない現行の境界の下で、同じ保護を手順として保つためである。新しい承認手続きは加えていない。

## 運用規則の置き場と、機構への移管

新世代の機構ができるまで、開発repoの作業は本書の運用規則で守る。運用規則は機構ができるまでの仮の守り方であり、機構が成立したら本文を減らす。規則を足し続けて入口を重くしない。

### 置き場

- 開発repoの運用規則（PR、review、merge、通知、branch・worktree・Issueの扱い）の本文は本書に置く。現在の境界と停止条件は`AGENTS.md`と[作業入口](new-generation-start-here.md)に置く。
- `CLAUDE.md`、利用者instructionの管理区間（`~/.claude/CLAUDE.md`、`~/.codex/AGENTS.md`）、PR／Issue template、scaffoldの説明は、本書の該当節を指すだけにし、規則の本文を複製しない。複製が見つかった場合は、本書の節を正として複製を指し示しへ置き換える。
- 開発repoの運用規則は、製品（HELIX）の要求の根拠にしない。製品の要求で本書を書き換えない（2026-10-08の[判断記録](decisions/l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md)の判断3）。下の表の移管先は、機構ができたときに同じ守りを引き継ぐ要求であり、本書の規則を製品の要求にするものではない。

### 規則を足す条件と、減らす条件

- **足す条件**：規則を足すのは、同じ種類のトラブルが実際に起きたときに限る。足すときは、起きた事例（PR、Issue、comment等の参照）と、旧HELIXの対応箇所を記録する。事例のない予防の規則は足さない。
- **移管先を記録する**：運用規則には、下の表に、今の守り方、移管先の要求、撤去の条件を記録する。移管先が未採択または未承認なら、その状態をそのまま書き、採択済みと書かない。移管先の要求が無い規則は「移管先なし」と書き、新しい要求を本書から作らない。
- **減らす条件**：移管先の要求に従う機構がmainへ入り、その機構の検証が新世代CI（ローカルCIを主とする。2026-10-09の[判断記録](decisions/stage1-implementation-and-ci-unlock-po-decision-2026-10-09.md)）で合格し、本書の運用規則と同じ守りを満たすことを独立reviewで確かめたら、本書の該当本文を機構への指し示しへ置き換える。指し示しへ置き換えた日と根拠を表に残す。機構ができても検証が合格していなければ、運用規則を残す。
- **食い違いの記録**：移管先の要求が本書の運用と違う振る舞いを定めている場合は、表の「移管時の差」に書く。移管するまでは本書の運用を使い、移管の時点で差を解消する。

### 移管の表

| 運用規則（本書の節） | 今の守り方 | 移管先の要求（状態） | 移管時の差 |
|---|---|---|---|
| PRの原子性（「PRの原子性」） | 作成側の分割と、review側の範囲確認 | HELIXOS-L2-046（2026-09-29採択、Stage 4のL3承認済み）、HARNESS-L2-045（2026-09-29保留、2026-10-03も保留を維持。L3は未承認） | HARNESS-L2-045は保留中であり、解除条件（値の決定責務、単位、未設定・参照不能・超過時の扱い）が確定するまで移管先にならない |
| 作成とreviewの分離、明示merge、read-after（「作成側とレビュー対応側の責務」） | 両レーンの運用と、PR commentの記録 | HELIXOS-L2-046、HELIXOS-L2-035（2026-09-29採択、Stage 3のL3承認済み） | なし |
| merge直前の`scfctl stale`の確認と、後続PRの再照合 | review側の手作業 | HELIXOS-L2-052（2026-09-29採択、Stage 4のL3承認済み）の「base driftの再照合」 | なし |
| 通知と待受（「GUIレーンの運転と通知」） | scaffold（`SCF-B-0003`）と両レーンの運用 | `SCF-B-0003`のreplacementに記録された移管先（HELIX-OSのreview配送・応答照合。対象の要求は未特定） | 移管先の要求を特定していない |
| 作業branchとworktreeの片付け（「作業branchとworktreeの片付け」） | 手作業と#2093への記録 | HELIXOS-L2-052の「merge後のlocal cleanup」「remote ref境界」 | HELIXOS-L2-052は、remote refの削除にrepository・ref・delete作用を明示した許可を要し、`delete_branch_on_merge`の設定を削除の許可として継承しない。本書は同設定を維持している。移管時に、同設定を許可として明示するか、削除を別の許可で行うかを決める |
| IssueとFeature Ticketの投影、Issueのclose（「IssueとFeature Ticket」） | 作成側とreview側の手作業 | HARNESS-L2-059、HELIXOS-L2-102、HELIXOS-L2-054（いずれも2026-09-30採択。059と102、および054はHARNESS-L2-057とのセット採択。L3の承認記録は見つかっていない） | 移管先のL3が未承認 |
| L3／L10承認の委任（「L3／L10承認の委任」） | 別系統の独立reviewと判断記録 | 共通カーネルL4（`docs/helix-harness/L4-basic-design/common-kernel.md`）のPhase 1とK9 | 移管先は要求ではなく設計である。Phase 1の成立条件は、v0.1の条件の照合（`docs/governance/audits/stage1-preflight-criteria-comparison-2026-10-09.md`）でPO判断待ち |

表の状態は、採択・保留は`docs/governance/decisions/po-decision-2026-09-29-57candidates.md`、`po-decision-2026-09-29-11candidates.md`、`po-decision-2026-09-30-live26.md`、`po-decision-2026-10-03-later35.md`の各行の処置から、L3の承認は各機構のStageの判断記録から読んだ。判断記録にIDが現れることを採択とみなさず、処置の欄を読む。L2本文の見出しや状態欄に「未採択」と残っている要求もあるが、表は判断記録を正とする。

### 旧HELIXとの対応

| 旧source | 保持する点 | 変える点 |
|---|---|---|
| `LEGACY-ASSET-B8D84651753481B5F2B9`／`archive/legacy-generation-2026-09-14/root/docs/governance/operations-rule-audit-2026-07-26.md`（3–6行の目的、38–39行のORA-005・ORA-006）／SHA-256 `d32bb1a780a36cd0710cbd58d575e900ac14c154a0e84f5dc92423b46c01466e` | 新しい統制を増やさず、既存の正本へ運用面を収束させること。adapterと正本の乖離を正本側へ寄せること（ORA-005）。正本と誤認される旧文書を参照用へ降格すること（ORA-006） | 旧の`rule-drift`のmarker照合は使わない。複製を見つけたら、本書を正として指し示しへ置き換える手順にする |
| `LEGACY-ASSET-A127DEC3EEE6ED63CF17`／`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md`（弱点ledger 65–101行）／SHA-256 `bab121404c956a0a4b403e589bea1c414af59b5996989bea5fab9f98f42f6872` | 前身harness（`unison-ai-product/UT-TDD_AGENT-HARNESS`）で観測された弱点を持ち込まないこと。特にUTW-004（live policyと文書policyの乖離）、UTW-015（branch lifecycleが閉じない）、UTW-018（merge後のcleanupが閉じない）、UTW-025（docsの量による正本の認識負荷） | 旧の要件化（UTH-FR）は旧runtimeとDBを前提にしていたため、移管先は現行のOS・HARNESSの要求に置き換える |
| `LEGACY-ASSET-C4B746501A6562E3F8B4`／`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md`（UTH-FR-013、UTH-FR-017〜019、44–50行）／SHA-256 `c0978eae37f6c7c8e113191404c0fd76328818e438b0ea5b3cf98ebd489a6639` | branch lifecycleの単一policy、文書policyとlive設定の照合、merge後のcleanupを閉じること | 機構の実装を待つ間は、本書の運用規則で守る。運用規則を機構へ移したら本文を減らす |

規則を足すのを事例のある場合に限ることと、移管したら本文を減らすことは、旧sourceに同じ手続きが無い。旧ORAの「統制を増やさない」目的を、規則の追加と撤去の条件へ具体化した新規案である。前身harnessでは、運用規律の再宣言と節の追加が続き、入口の文書が肥大した。2026-10-09に観測した同repositoryのmain（`68ea9de62701df39d0386e6cf0689c4dfc0e5875`）では、`CLAUDE.md`が約36KB、`AGENTS.md`が約24KBである。新しい承認手続きは加えない。

## 新世代CIへの接続

新世代CIは、承認済み要求とfreeze済み設計・検証から必要oracleを導出できる段階で、HELIX-OSの
`operation_change` PRとして設計する。それまではCIをmerge admissionの代替にせず、旧workflowとのparityやdual-greenを
要求しない。本運用モデルと後続要求PRの証拠構造が、新世代CIを上流から生成するための入力となる。
