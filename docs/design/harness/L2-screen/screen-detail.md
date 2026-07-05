---
layer: L2
sub_doc: screen-list
status: confirmed
artifact_role: supplemental_screen_detail
parent_doc: docs/design/harness/L1-requirements/screen-requirements.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_br: docs/design/harness/L1-requirements/business-requirements.md
related_docs:
  - docs/design/harness/L2-screen/screen-list.md
  - docs/design/harness/L2-screen/screen-flow.md
  - docs/design/harness/L2-screen/ui-element.md
  - docs/design/harness/L2-screen/wireframe.md
pair_artifact: docs/design/harness/L2-screen/wireframe.md
next_pair_freeze: L10
plan: docs/plans/PLAN-L2-01-screen-list.md
created: 2026-06-24
updated: 2026-06-24
---

# L2 画面詳細設計

この文書は screen list（画面一覧）、transition design（遷移設計）、UI component catalog（UI component 台帳）、low-fi wireframes（低忠実度 wireframe）の間にある粒度差を埋める。レビュー担当者が「何を表示するか」「データはどこから来るか」「ユーザーは何を操作できるか」「error 時に何が起きるか」「どの上位 requirement を満たすか」を確認するための、画面ごとの設計シートである。

screen ID と URL の正本は [screen-list.md](./screen-list.md) に置く。transition edge（遷移 edge）の正本は [screen-flow.md](./screen-flow.md) に置く。component 定義は [ui-element.md](./ui-element.md) に置く。layout sketch（layout のスケッチ）は [wireframe.md](./wireframe.md) に置く。

## 1. 詳細シート schema

各 screen detail entry（画面詳細 entry）は、次の field を MUST（必須）で満たす。

| Field（項目） | Required（必須） | Definition（定義） |
|---|---:|---|
| Screen ID | yes | PM-01..PM-06、HM-01..HM-08、GD-01 のいずれか。 |
| Purpose | yes | この画面が支える user decision または review task（レビュー task）。 |
| Persona | yes | 主たる human user。AI runtime は UI を直接操作しない。 |
| Route | yes | `screen-list.md` に定義された canonical URL。 |
| Inputs | yes | 画面描画に使う path params、query params、local state、files、DB projections、command output。 |
| Display Blocks | yes | 読み順に並ぶ主要な visual/data region（表示・データ領域）。 |
| Controls | yes | read-only navigation、filter、expander、copy action、manual refresh。後続 requirement が明示許可しない限り、直接 mutation action は禁止する。 |
| Validation / Empty State | yes | data が missing、stale、invalid、partially projected のときに画面へ表示する内容。 |
| Error State | yes | fail-close behavior、fallback rendering、next_action guidance（案内）の内容。 |
| Security / Permission | yes | persona、scope、secrets/PII を表示するかどうか。 |
| State Persistence | yes | URL query、path、session、local client state、または none。 |
| Trace | yes | 画面を正当化する BR/UX/FR-L1 と L2 document。 |
| Test / Review Hook | yes | 画面実装を claim する前に期待される manual check または automated check。 |

## 2. 共通ルール

| Rule（ルール） | Requirement（要件） |
|---|---|
| Read-only UI | 将来 signed-off requirement が mutation を追加しない限り、全画面は read-only とする。copy button が書き込める先は clipboard のみ。 |
| CLI execution | UI は copy 可能な CLI text を表示してよいが、`helix` command は実行しない。 |
| Unknown data | unknown、stale、not-yet-projected data は明示 state として扱い、blank success にしない。 |
| Trace links | plan、artifact、gate、document を表示する画面は、利用可能な upstream/downstream trace link を露出する。 |
| Secrets | secrets、tokens、local absolute personal paths、private provider payloads は render 前に redact する。 |
| Refresh | live state を表示する箇所の default auto-refresh は 30 秒。manual refresh は display-only とする。 |
| Deep links | review context に影響する screen state は route または query parameter で共有可能にする。 |

## 3. 画面詳細 matrix

| Screen（画面） | Purpose（目的） | Inputs（入力） | Display Blocks（表示領域） | Controls（操作） | Empty / Error State（空・エラー） | Trace / Test Hook（追跡・検証） |
|---|---|---|---|---|---|---|
| PM-01 Project Overview Dashboard | PO が project/layer progress を確認し、blocked gate を素早く検出するための画面。 | project registry、plan digest、gate status、artifact progress projection。query は `mode`、`phase`、`status`、`drive`、`tier`。 | hierarchy selector、L0-L14 heatmap、blocked item strip、polling status。 | filter、PM-02 への layer cell navigation、PM-03 への gate-fail navigation、current view URL の copy。 | 空の project registry は setup guidance と `helix status` を表示する。gate failure は red と next_action で示す。 | BR-01、BR-06、UX-02、FR-L1-01/08/13/20。heatmap count を projection row と照合する。 |
| PM-02 Layer View | reviewer が 1 つの project/layer と、その plan、carry、stale item、phase state を確認する画面。 | `:case`、`:L`、plan registry、carry list、stale detector output、scrum/additive mode field。 | layer summary、plan table、carry list、phase/status row、linked sub-doc list。 | plan row の filter、選択 gate の PM-03 open、design doc の PM-06 open、plan path の copy。 | layer が missing の場合は escaped path と PM-01 への return link を持つ 404 を表示する。 | BR-01/04、FR-L1-01/02/04/13/14/15/23/29。linked plan が存在するか missing mark を持つことを確認する。 |
| PM-03 Gate + Blocker View | PO/TL が gate pass/fail/bypass evidence を確認し、next action を判断する画面。 | gate run record、review evidence、failing lint/test output、bypass record、generated next_action。 | gate result panel、evidence table、blocker table、next action card、CLI copy block。 | next_action/interrupt/resume command の copy、HM-05 audit への navigation、GD-01 troubleshooting への navigation。 | evidence missing は fail-close。reviewer/signoff なしの bypass は red で表示する。 | BR-02/05、UX-03、FR-L1-05/11/16/17/45。すべての fail が 1 つの next_action を持つことを確認する。 |
| PM-04 Trace View | reviewer が upstream/downstream coverage と V-pair status を確認する画面。 | trace graph、artifact registry、pair-freeze state、doctor trace output。 | graph、missing edge table、pair status table、trace detail drawer。 | plan/artifact/status による filter、PM-06 doc preview の open、HM-07 doctor detail の open。 | mandatory trace edge missing は red で示し、remediation guidance へ link する。 | BR-01/03/07、FR-L1-03/18。graph に orphan mandatory artifact がないことを確認する。 |
| PM-05 Handover View | next runtime が stale prose に依存せず正しい state から resume するための画面。 | `.helix/handover/CURRENT.json`、handover archive、session digest summary。 | current handover card、next action、carry detail、stale warning、archive list。 | next_action から target screen へ navigation、handover summary の copy、archive の open。 | handover missing は failure ではなく warning。stale handover は generated_at と source を表示する。 | UX-03、FR-L1-01/31/42。stale threshold と next_action target を確認する。 |
| PM-06 Design Doc Viewer | PO/TL が harness UI を離れずに canonical doc と trace を読むための画面。 | doc catalog、markdown file、frontmatter、Mermaid/ASCII code block、trace key。 | doc tree、frontmatter panel、markdown preview、TOC、trace link。 | layer/status/drive による filter、path の copy、PM-04 trace の open、internal doc link の navigation。 | render 不能な Markdown は escaped raw text に fallback する。doc missing は catalog error を表示する。 | BR-01/07、FR-L1-01/32。rendering が embedded script を実行しないことを確認する。 |
| HM-01 Feature List | operator が FR implementation status と関連 screen/plan を確認する画面。 | FR registry、implementation status projection、plan link、screen trace map。 | hierarchy selector、FR status table、plan link、screen link。 | status/priority/category による filter、screen requirement のための PM-06 open、visible row の export。 | unknown FR status は warning。P0 の trace missing は red で表示する。 | BR-06、UX-02、FR-L1-33/35。P0 FR row が screen trace を持つことを確認する。 |
| HM-02 Coverage Heatmap | operator が perspective と axis ごとの弱い coverage を見つける画面。 | coverage projection、review/audit result、missing artifact count。 | axis selector、8x5 heatmap、cell detail table、recommended task text。 | axis switch、filtered list として HM-01 を open、remediation prompt の copy。 | metric source missing は source name 付き gray、low coverage は red で表示する。 | BR-06/22、FR-L1-33/34/35/46/47/48/49。cell total が row detail と整合することを確認する。 |
| HM-03 Wiring View | operator が static architecture と live failure wiring を確認する画面。 | hook state、provider state、routing config、mode/drive mapping、connection health。 | architecture diagram、connection table、mode transition arrow、failure overlay。 | connection selection、runtime/hook/drive による filter、diagnostic command の copy。 | failed connection は red で示し、HM-05/HM-07 evidence へ link する。 | BR-03、FR-L1-07/08/40/42。direct UI execution path がないことを確認する。 |
| HM-04 DB View | operator が `.helix` state と projection consistency を確認する画面。 | SQLite projection、JSON state file、integrity check output。 | table explorer、row detail、integrity summary、orphan/drift list。 | table selection、row filter、SQL/read command の copy、trace row target の open。 | corrupt DB または missing table は fail-close diagnostic を表示し、partial green にしない。 | BR-05/07/20、FR-L1-06/07/51。row count が integrity summary と一致することを確認する。 |
| HM-05 Audit / Execution Log | operator が runtime action、model use、guard decision、review event を確認する画面。 | session log、audit file、guard decision、token/cost telemetry、skill injection record。 | invocation table、guard decision list、skill tab、hook fire tab、evidence link。 | runtime/result/date/role による filter、audit path の copy、related PM-03 gate の open。 | log segment missing は segment ID 付き warning。guard block は明示する。 | BR-02/03/08、FR-L1-09/12/20。private payload redaction を確認する。 |
| HM-06 Recovery View | operator が recovery run、resume point、rollback guidance を確認する画面。 | recovery plan、incident record、handover state、audit trail。 | recovery log、resume point list、rollback copy block、current incident status。 | rollback/resume command の copy、PM-03 gate の open、HM-05 evidence の open。 | safe rollback がない場合は generated destructive command ではなく human-escalation message を表示する。 | UX-03、FR-L1-10/16。destructive command が auto-execute されないことを確認する。 |
| HM-07 Doctor Result View | operator が `helix doctor` structure と severity を確認する画面。 | doctor JSON/text result、check catalog、last run metadata。 | result tree、severity summary、failed check detail、suggested command。 | severity filter、command copy、trace failure のための PM-04 trace open。 | Doctor unavailable は provider/runtime diagnostic 付き red で表示する。 | BR-03/05/07、FR-L1-02/11/18。severity mapping を確認する。 |
| HM-08 Learning / Effectiveness View | operator が model/skill effectiveness と feedback recipe を確認する画面。 | model metrics、skill metrics、feedback event、recipe registry。 | KPI card、model/skill table、recipe list、trend placeholder。 | model/skill/task による filter、recipe prompt の copy、GD-01 learning guide の open。 | sample size 不足時は warning を表示し、ranking claim を隠す。 | BR-21、FR-L1-19/20。sample-size guard を確認する。 |
| GD-01 Guide / Docs | user が operational guidance、troubleshooting、onboarding、CLI reference を読む画面。 | guide markdown、category route、related doc link。 | side nav、markdown body、related link、search placeholder。 | category navigation、internal link、CLI snippet の copy。 | unknown category は escaped 404 と guide index への link を表示する。 | BR-08、UX-03、FR-L1-19/27/32/44。category path escaping を確認する。 |

## 4. 画面詳細 coverage checklist

画面実装を claim する前に、review evidence は次を MUST（必須）で含める。

- route と screen ID が `screen-list.md` と一致する
- primary block が `ui-element.md` と一致する
- navigation edge が `screen-flow.md` と一致する
- visible layout に対応する `wireframe.md` section、または承認済み L10 high-fi artifact がある
- 上記の error state と empty state が、test、screenshot、documented manual verification のいずれかを持つ
- CLI/governance gate を bypass する direct mutation path を含む screen がない

## 5. Carry

- L10 UX refinement では、この detail sheet を actual label、spacing、color contrast、screenshot evidence を含む high-fi review check へ具体化する。
- L7/L8/L9 test design は、screen implementation 開始時に `Test / Review Hook` column を参照する。
- PM-06 は、doc catalog が L2 追加文書を読む段階で、この文書を design doc tree に含める。
