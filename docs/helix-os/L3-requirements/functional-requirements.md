# HELIX-OS L3 機能要件（Stage 2b）

状態: L3未承認の候補／L10未実行の検証設計。対象は `HELIXOS-L2-014` のみ。

## Stage 2b — HELIXOS-L2-014 HELIX自身の段階リリース

状態: 固定L2/L11を詳細化するL3候補。親 `HELIXOS-L2-014`、`version_target: 1.0`。POの2026-09-27段階リリース判断と2026-09-28の固定L2/L11採択はsource pinに記録する。これはL3承認、実装・配布許可ではない。現行のMPR metadataや登録状態から追加authorityを作らない。G0ではStage 2b、prerequisiteなしに配置されており、先行Stage完了gateを加えない。

### FR-OS-014 — HELIX段階の構成、再現、検証と切戻し

OSは、固定L2-014の内部段階releaseについて、stage identityと範囲、同じHARNESS pack体系から選択したpack/dependency、configuration/data format、対応environment、capabilityと限界、範囲内acceptance evidence、更新・切戻し条件を一組として記録し、宣言範囲の端から端作業・人の担当工程・状態継承・自己依存なしを追跡する。stageの受入・統合・更新・切戻し・運用検証をpack単体の結果から分離し、1.0到達判定とも分ける。OSはHARNESS契約、SECURITY authority/policy、INFRASTRUCTURE実資源・復旧能力、要求ownerの意味判断を代行しない。外部公開とHARNESSサービス⑥の製品releaseはこの親の対象外である。

**版・意味境界**: `v0.x`等はHELIX内部stageを識別し、公開semver/tagではない。`v1.0`は1.0到達判定を通った構成の表記で、外部公開許可を含まない。stage受入はL2が挙げるscope、品質条件、必要な安全依存を弱めず、未成立能力を「できないこと」に含める。INFRASTRUCTURE-L1-023は1.0より後・版未定として対象外のまま保つ。

**担当**: OSはstageの構成管理・生成・検証・配布・rollback運転と対応証拠を束ねる。HARNESSはpack boundary/call contract/verification-and-acceptance contractを定める。INFRASTRUCTUREはL1-017/018のbackup・restore、L1-019のrollback targetとdata互換、L1-020の独立復旧、L1-022の稼働環境identityと構成を定める。stage一般の環境health確認を追加しない。SECURITYは、固定親の資格情報方針と、対象scopeで選択された操作に必要なcredential/egress/operation authority条件を持つ。各ownerの契約・実状態が不足しているときOSはunknown/unfinishedを保ち、該当ownerへ返す。人手作業は同じ必須契約・authority・evidenceを代替せず、scope内工程の担当・結果を記録する。

### AC-OS-014 — L2句ごとの受入条件

各ACは固定L2の同じ番号の要求句を扱う。positive、個別negative、未見正常、失敗時の戻し先はL10 functional-verification.mdの同じ番号のCASE群にある。CASEの実行結果やこの候補本文は受入済みを意味しない。

- **AC-OS-014-01 内部stage identity**（L2呼び方）: stage ID・対象scope・能力範囲を内部識別として一緒に保持し、public version/release identity、stage success、1.0到達を別状態にする。stage IDは外部tagから推測しない。外部公開とWeb提供はstage成立から推定せず、既存の別判断に残す。
- **AC-OS-014-02 同じpack体系と必要な安全依存**: 別系統の簡易実装を作らず、HARNESS-L2-010/011の同じpack体系からstageを組み、次の段階では必要に応じてそのpackを追加・更新する。pack/dependency identity・契約/成果物版・入力/出力・required dependency・verification scope/oracle・所有・収載/除外を照合する。HARNESS-L2-022の適用対象evidence契約、INFRASTRUCTURE-L1-017/018のbackup/restore（それらのoperationがscopeにある場合）、L1-019のrollback compatibility/procedure、L1-020の独立復旧、L1-022の宣言済み実行環境identity/構成を、それぞれ対応operationに限って照合する。SECURITY-L2-005 credential-use、L2-008 operation authorityはその操作に必要な範囲で扱う。L2-006 egressは明示scope内に実際のnetwork送信operationがある場合に限り、L2-016 classification recordは、明示されたnetwork送信operationがL2-006のdata classification inputを使う場合だけその入力sourceとして参照し、それ以外はstage一般のegressまたはasset classification条件を追加しない。安全依存のmissing/unknown/stale/conflictは成立を保留して該当ownerへ返し、必要な安全依存が揃ったstageに対して選択されていない無関係機構の完成を追加条件にしない。人による実施も同じ依存closureを満たす必要がある。
- **AC-OS-014-03 限定範囲でも仕事が一周する**: 宣言範囲で要求確認→作業→検証→結果記録の各工程と依存・出力がつながる。自動でない工程は担当者と担当内容を明記し、人の判断を生成・代替しない。小さい範囲であることは未接続の機能を並べる理由にならない。
- **AC-OS-014-04 一組として保存・再現**: pack/dependency identityと版、configuration、data format、対応環境、capability/limitation、scope内受入evidence、更新・rollback条件を同じrevision-bound tupleへ結ぶ。source tag単独をstageとしない。
- **AC-OS-014-05 案件data・secret・credentialの分離**: stage素材とfixtureは合成dataだけを使い、実案件data、secret値、credential値を含めない。それらのbackup/migrationは別scopeの参照にとどめ、stage artifact/evidenceへ同梱しない。
- **AC-OS-014-06 次段階の構築・検証と復帰**: stable prior stageを次段階の構築基盤として使い、priorの構成・artifactを保持して次stageを構築・検証する。検証後に切り替える際も案件stateとrecordのidentity/value/historyを引き継ぐ。切替後に問題があればprior stageの構成・artifact/configurationへ戻す一方、案件state/recordは切替後の現在のidentity/value/historyを引き継ぎ、prior時点の案件checkpointで更新を巻き戻さない。prior構成の保持、forward cutover時のstate/record継承、rollback時の構成復帰、rollback時のstate/record継承を別々に照合する。
- **AC-OS-014-07 自己依存のない起動・更新・復旧**: stageが開発中tree、次stage、別の稼働stage、または未宣言dependencyなしに起動・更新・復旧できることを宣言済みdependency graphと対応環境から確かめる。段階を細かく分けて隠れた自己依存を検出し、除去した後のdependency graphと復旧経路を確認する。graph上の参照だけからruntime dependencyを推測しない。
- **AC-OS-014-08 stage・pack・1.0の判定分離**: pack単体success、stage scope acceptance/integration/update/rollback/operation evidence、1.0到達判断を別identity/stateで保持する。stage提供を理由に最終要求やstage内必要品質を減らさない。範囲の限定だけを記録する。
- **AC-OS-014-09 ownership boundary**: OS/HARNESS/INFRASTRUCTURE/SECURITYの対象句と証拠をそれぞれのownerへ結び、対象製品のHARNESSサービス⑥releaseとHELIX自身のstage releaseを分ける。ownerを決められない未指定caseはunknownとして既存親へ戻し、新ownerを作らない。
- **AC-OS-014-10 未成立能力・INFRA-023の境界**: 未成立能力をcapability setの「できないこと」とし、必要な人手工程を記録する。人の分担は必要な安全条件・authority不足の免除にならない。INFRASTRUCTURE-L1-023の後続能力を必須にせず、stage対象や1.0へ前倒ししない。
- **AC-OS-014-11 旧source差分**: 固定L2で保持したFRS-BR-008の内部利用意味、FRS-BR-009の安全依存閉包と組合せ検証を現在のHARNESS/INFRA/SECURITY契約から再導出する。POが外した旧CI先行利用・wait/rerun metricと保留したCursor限定委譲を復活させず、Lite/Full名や旧CI/runtime/test identityも移さない。

### 親句別旧source disposition

旧要求の項目別起点はsource pinと[本件の不変source・pair監査記録](../../governance/audits/requirement-registration/os-stage2b-014-repair02-2026-10-05.json)、および[review01訂正監査](../../governance/audits/requirement-registration/os-stage2b-014-review01-repair-2026-10-05.json)に保持する。以下の「再利用」は形式・意味の起点を指し、旧IDや実装の再利用ではない。

| 固定L2句 | 旧sourceの項目 | dispositionと差分 |
|---|---|---|
| 014 呼び方・版の分離 | FRS-BR-008内部利用、distribution L3/L10の対象artifact版 | 内部段階と外部配布を分ける意味を再導出。旧profile、channel、public package版を置換し、1.0と外部公開を分離するPO判断を保持。固定L2:623のWeb提供も段階とは別判断に残す。 |
| 014 pack体系・安全依存 | FRS-BR-009安全依存閉包、FRS-R-23/24とFRS-AC-025/026 | 必要dependencyと組合せevidenceを再導出。現HARNESS-010/011/022および選択操作に該当するSECURITY/INFRA契約へ対応付け、次stageでは同じpack体系のpackを必要に応じて追加・更新する。必要安全依存の欠落はfail-closeし、無関係機構の完成は条件にしない。旧CI・旧pack schemaは置換。 |
| 014 狭い一周と担当 | 旧FRS-BR-008「正式配布前の内部利用」 | 内部stageで狭い作業を一周する意味を再導出。旧CI先行利用の具体化はPOにより除外。人の分担は追加承認へ変えない。 |
| 014 stage一式 | distribution L3構成再現・受入条件、対応ST-DIST L10 | configuration/evidence/update/rollbackを束ねる考えを再導出。旧manifest schema/Node/CLI/PowerShellを移さず、現行tuple項目を使う。 |
| 014 data/secret/credential | distribution L3の対象物境界とpaired ST-DIST-002のDB/state/memory/credential/PII/path混入拒否（旧distribution L3:24–39、旧L10:24–25）。backupは旧distribution sourceに記述なし。 | 分離条件を保持し、値を含まない合成fixtureへ再導出。固定L2:627とINFRASTRUCTURE-L1-017〜019をbackup・移行の現行根拠とし、実data/credential、顧客artifactを持ち込まず、SECURITY ownerを保持。旧distributionの記述をbackup要件の根拠として使わない。 |
| 014 prior→next/rollback | FRS-BR-009組合せ更新とdistribution rollback evidence | prior状態・case state継承を再導出。旧配布対象/手順へ固定せず、INFRA-017/018/019との境界を明示。 |
| 014 self-dependency | FRS-R-23/24 recovery/dependency conditions、旧distribution recovery | 独立起動・復旧を保持し、現INFRA-020/022とHARNESS-010の宣言dependencyで再導出。旧runtimeの構成を移さない。 |
| 014 acceptanceと1.0分離 | FRS-BR-009の統合検証 | pack / stage / 1.0の判定分離を再導出。旧CI green/test合格を証拠にしない。 |
| 014 owners | FRS-BR-009 safe dependency responsibility、distributionの対象製品境界 | 現固定L2のOS/HARNESS/INFRA/SECURITY分担を保持。旧package distribution ownerをOSへ混同せず、HARNESSサービス⑥と区別。 |
| 014 未成立能力・023 | PO 9/27 stage-release decisions、旧FRSの先行利用意味 | 能力限界を明示する親意味を保持。L1-023の後続版扱いと不前倒しを厳密に保持し、旧段階導入語彙を追加しない。 |
| 014 FRS処分 | FRS-BR-008/009と旧stage acceptance | 固定PO処分どおりcarried 5 atomsとCursor pending atomを分ける。旧CI利用/wait/rerunを除き、旧IDを現行要件へしない。 |

旧共通L3定義148–168はFR/ACと受入の対応形式、旧共通L10 process 162–170および195–207は検証case形式の比較起点である。旧README（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:38–41`、`LEGACY-ASSET-9A772391C7FB1298D45F`、source full SHA-256 `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`）が示すL3→L12配置と旧L10 processのL3↔L10対応差は固定sourceの差として保持し、現行層対応は現行L3/L10の6 canonical文書に従う。旧定義の163–165 `engineering_discipline_required`、G3/L12 gate、旧runtime/test/CIは移植しない。

## Stage 2a — 8親の機能要件（015/016/017/018/019/020/023/027）

状態: L3未承認の起草候補。固定採択L2/L11の対象revisionを詳細化する。本文、PR、review、運用結果からL3承認、実装・実行許可、人間判断を生成しない。

### sourceと旧HELIX対応

固定L2は `docs/helix-os/L2-requirements/governance-requirements.md`、固定L11は `docs/helix-os/L11-acceptance/governance-acceptance.md` のf6dad2a revisionである。POのmain633 decision row 48はOS-L2-014〜029をまとまりで採択した。次の8親はそれぞれL2/L11のidentity・本文をpinし、各registration/digestをPO decisionの個別完全一致rowと偽らない。OS-018にはmain633の追加decision row 34も適用し、HIL-NFR-36の事実・理由、実行した品質対応/結果、予定と実行の区別を保持する。新しいdefaultや全案件共通の対応順序は加えない。

旧HELIX起点:

- 旧L3定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-166`（`LEGACY-ASSET-F542125805B777D8A56A`、全体SHA `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`）、旧README `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16-56`、旧L10 process `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207`から、FR/ACとverification pairの意味を再導出する。READMEはL3→L12、旧processはL3↔L10と異なる層対応を記すため、この食い違いを記録し、どちらの旧対応も現行の正本として引き継がない。3文書の分離形式は参考にし、今回の配置は現行の6 canonical文書によるL3/L10構成に従う。旧G3/L12 gate/runtimeと旧定義163-165の`engineering_discipline_required` PLAN freeze（no-code-first/complexity等）は現行のgate、実行、CI規則へコピーしない。
- 旧shared FR/AC `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:38-57,134-197,198-307`（`LEGACY-ASSET-EE5DBACC7F28F7D1F605`、全体SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）から親trace/ACの構造だけを再利用し、旧IDs・旧数値・late addendaを移さない。旧paired test `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32-90,91-216`（`LEGACY-ASSET-44DD86E3DEC09E65EF51`、全体SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`）からpositive/negative/held-out oracleの形を再導出し、旧HAT/L12/runtimeは移さない。
- 親別の旧sourceと項目ごとの再利用・再導出・置換は末尾crosswalkと対応L10に記録する。sourceの旧IDは出自trace専用で、現行IDとして使わない。

### FR-OS-015 — 管理authority記録

- 親: `HELIXOS-L2-015`、version target `1.0`。固定L2 `governance-requirements.md:642-651`、L11 `governance-acceptance.md:324-329`。
- **FR-OS-015**: 対象/source identity・revision・digest、actor/time、canonical source、decision record、未分類raw event、訂正/競合/staleを記録し、authorityの出所・対象revision・差分・訂正履歴を辿れる管理projectionを提供する。projectionと正本を分離し、raw eventは後から分類しても保持する。
- Owner: OSはrecord/projectionを管理する。要求意味と人間decisionはcanonical source/decision ownerに残す。
- **AC-OS-015-01 正常**: 複数対象と異なるsource revisionを投入し、全recordが正しいsource/digest/decision ownerへ辿れる。Issue/PR/CI projectionをclose/merge/greenへ変えてもauthority値は変わらず、訂正後も元raw eventと訂正履歴が残る。
- **AC-OS-015-02 negative**: unknown target、revision mismatch、digest missing、authority conflictを独立に投入し、それぞれunresolvedとして保持してcanonical sourceまたはdecision ownerへ戻す。PR/memoryだけから採否を作る、raw eventを訂正で上書きする、wrong product/stale/digest mismatchをcurrent authorityにする場合は不合格。記録から要求意味・human decision・実装許可を生成しない。
- **AC-OS-015-03 unseen normal**: 未見の対象と複数回訂正でも元event、source revision、訂正順序を追跡でき、未分類eventを推測で確定しない。

### FR-OS-016 — Portfolio trace・状態

- 親: `HELIXOS-L2-016`、version target `1.0`。固定L2 `governance-requirements.md:652-661`、L11 `governance-acceptance.md:331-336`。
- **FR-OS-016**: 複数対象の要求/revision、HARNESS contract、unit/connection/composite identityと関係、dependency/owner/diff/verification/provision/operation記録を要求から運用状態へtraceする。未接続・未合意・未実装・未検証・未提供・unknown・staleを別状態としてtarget revisionへ結びつける。
- Owner: OSがportfolio trace/statusを持ち、各project/source ownerが内容と検証evidenceを持つ。HARNESS contract版はHARNESSの正本に従う。
- **AC-OS-016-01 正常**: 二つ以上のprojectでunit、connection、composite、依存edgeと各状態が個別に読め、release-kanban上のprovision/operation stateがsourceへtraceする。unit/connection/compositeは別々の判定になる。
- **AC-OS-016-02 negative**: 下位のsuccessをconnection/composite/他project完了へ昇格しない。owner/dependency/diff/verification targetの各欠落を独立変異にし、unknown/conflictとして保持し対象要求/sourceへ返す。CI/PR/ticket planだけでmerge/release readinessを作らない。
- **AC-OS-016-03 unseen normal**: 未見のrelationを含むportfolioで既知stateを維持し、未知edgeをunknownで表示してowner/revisionを保持する。

### FR-OS-017 — 推進・ticket/workflow

- 親: `HELIXOS-L2-017`、version target `1.0`。固定L2 `governance-requirements.md:662-671`、L11 `governance-acceptance.md:338-344`。
- **FR-OS-017**: 登録済み目的/要求/制約/許可/優先度/依存/資源/budget/deadline/stop、HARNESS版/connection state、INTELLIGENCE案、HARNESS工程契約から、適格性確認後にticket graphとworkflow instanceを作る。ticketはtarget/kind/parent revision/scope/dependency/acceptance duty/return destinationを束縛する。
- Owner: OSは推進・ticket/workflow。INTELLIGENCEは案、HARNESSは工程語彙/順序/義務、SECURITYはauthority制約を保持する。
- **AC-OS-017-01 正常**: 同一のaccepted inputとHARNESS contractから同一のticket candidateが得られ、差異があるtarget/dependencyは個別に保持される。INT案はauthority/budget/deadline/dependency等へ照合してから扱う。
- **AC-OS-017-02 negative**: input unknown/conflict、未解決dependency、scope逸脱、permission不足ではticketを実行可能にしない。HARNESS語彙/義務のOS再定義、既定部品外flowの1.0生成、INT案の無条件ticket化、全案件共通の固定sequenceを拒否する。L2が4.0境界とした部品外flowを1.0へ持ち込まない。停止後も元revision/stop reason/unfinished duties/cumulative budget/deadlineを保つ。
- **AC-OS-017-03 unseen normal**: 異なる許可済み既定部品の組合せを使う未見taskでも固定契約境界を守る。対応部品がない場合はunsupported/unknownとして扱い、flowを作らない。

### FR-OS-018 — Worker割当・実行統制

- 親: `HELIXOS-L2-018`、version target `1.0`。固定L2 `governance-requirements.md:672-681`、L11 `governance-acceptance.md:345-351`。HIL-NFR-36残差追補はmain633 decision row 34。
- **FR-OS-018**: ticket revision/digest、assignment/attempt、lane/Worker/model-class level、SECURITY制約、INFRA resource、scope/budget/deadline、成果/evidenceを関連づけ、既存authority内で割当・進行・停止・回収・handoffを記録する。assignmentはSECURITY認可、実resource state、独立reviewを代行しない。
- Owner: OS assignment/attempt/handoff、SECURITY permission、INFRA actual resource、LABO performance/evaluation、INTELLIGENCE placement proposalはそれぞれsource ownerを維持する。
- **AC-OS-018-01 正常**: exact ticket/head/authority/Worker/caller lane/scope/lease/budget/deadlineと成果/evidenceを辿り、独立review担当へ意味とunfinished dutiesを渡す。author Workerの出力を自己承認/独立review済みにしない。
- **AC-OS-018-02 negative**: duplicate claim/run、期限・budget・failure count reset、unassessed Workerをassessed化、OSによるSECURITY/INFRA state代行、author self-approvalを個別に拒否する。scope/head/lease/capability/authority不一致ではstart/continueを止め、停止したattempt/bindingと停止理由、partial outputの扱い、累積制約、未完義務を記録し、まず固定L2-018の管理/推進へ返す。外部sourceの値・状態が不足または不一致なら、管理/推進がその記録から該当する既存source ownerへ訂正を依頼する。OS管理/推進はsource authorityを代行せず、新しいownerや承認gateを作らない。
- **AC-OS-018-03 unseen normal**: Worker/lease handoffまたは再開時にcumulative limits、scope、unfinished dutiesを保持し、期限/lease失効後も別の適格担当へ戻せる。
- **AC-OS-018-04 追加採択条件**: HIL-NFR-36の予定対応と実際の対応を区別し、default逸脱の事実/理由、品質問題で実際に通った手順/結果を記録する。新default・共通対応順序は作らない。

### FR-OS-019 — Evidence・continuity

- 親: `HELIXOS-L2-019`、version target `1.0`。固定L2 `governance-requirements.md:682-691`、L11 `governance-acceptance.md:352-358`。
- **FR-OS-019**: event/source revision/correlation ID/actor/data-use class、execution/verification result、correction/checkpoint/unfinished dutyからepisodeの原記録・projection・再開情報を構成する。provider memoryはcontinuityの正本にしない。
- Owner: OSはevent/projection/recoveryを担う。event meaningとsourceはorigin owner、data-use permission/classificationは該当SECURITY/source ownerに残す。
- **AC-OS-019-01 正常**: event provenance/correctionからepisodeを再構築し、missing/duplicate/stale/denied/not-runをsuccessと区別する。session/runtime交代後もscope/deadline/budget/failure count/unfinished dutiesが残る。
- **AC-OS-019-02 negative**: 重複配送が二重副作用にならない、failed save/projectionをsuccessful checkpointとして公開しない、provider summaryのみの再開を拒否する。用途外data-useを別project/learningへ流用しない。
- **AC-OS-019-03 unseen normal**: 未見のcrash/restart/replay順序からraw eventsを使い再構築し、欠落証拠をorigin ownerへ戻す。projectionのみからsuccessを生成しない。

### FR-OS-020 — 検収・CI運転

- 親: `HELIXOS-L2-020`、version target `1.0`。固定L2 `governance-requirements.md:692-701`、L11 `governance-acceptance.md:359-365`。
- **FR-OS-020**: ticket graph、採択済みrequirements/pair/oracle、HARNESS contract/duties、diff/base、runner/environment、適用されるconnection/evidenceから変更scopeに必要なprofileを組み、隔離実行し、状態を回収/再開する。新世代CI未構築。旧CIは動かさずfallbackにも使わない。
- Owner: HARNESSは検証義務/oracle、OSはprofile組成と運転、SECURITYはauthority、INFRAはrunner/resourceの実値。
- **AC-OS-020-01 正常**: applicable HARNESS obligationsと対象diffに沿うprofileを選び、exact head/oracle/environment/run identityに束縛してsuccess/fail/denied/skipped/interrupted/staleを区別する。計画と実行は別state。
- **AC-OS-020-02 negative**: HARNESS oracleの追加/削除、必要検証欠落、固定stage count、old CI greenまたはwrong-head green、CI結果によるmeaning review/acceptance/merge/release代替は不合格。検証義務/runner欠落はunfinishedとしてHARNESS/ticket/resource ownerへ戻す。
- **AC-OS-020-03 unseen normal**: 異種義務を持つ未見diffでも適用対象をHARNESS contractから導く。存在しない義務や段数を固定しない。

### FR-OS-023 — 管理→推進→Worker→検収 handoff

- 親: `HELIXOS-L2-023`、version target `1.0`。固定L2 `governance-requirements.md:722-731`、L11 `governance-acceptance.md:380-386`。
- **FR-OS-023**: OS-016のportfolio traceにある対象要求revision・unit/connection/composite relation・接続状態を含む管理/source、ticket、assignment/attempt、検証結果とevidence間のhandoffをsubject revision/digest、causal ID、scope、unfinished duties、stop reason、evidenceへ束縛する。OS-016のsource/statusをhandoffへ写すときもconnection/composite acceptanceを生成しない。
- Owner: 各sender/receiverの意味上の責務を維持し、OSはhandoff record/receiptを結ぶ。交差する役割をauthorityとして混ぜない。
- **AC-OS-023-01 正常**: OS-016から対象要求revision、unit/connection/composite relationと各source-bound stateを含むportfolio traceを入力し、015/017/018/019/020の該当sourceにあるauthority、ticket、assignment/attempt、evidence、検証義務/結果を受渡す。unit success、connection-specific acceptance、composite acceptanceを別々に記録し、receiverが対象revision/digest/scopeとunfinished dutiesを受領した証拠を残す。
- **AC-OS-023-02 negative**: revision/digest/authority/evidence mismatchではconnection unresolvedとし発生側正本/管理へ返す。単体successでhandoff・次段acceptance・ticket completionを自動生成しない。
- **AC-OS-023-03 unseen normal**: mixed completed/unfinished dutiesと異なるreceiver pathでscope/revisionを保ち、未完義務を消さない。

### FR-OS-027 — 未評価状態からの限定初回実行

- 親: `HELIXOS-L2-027`、version target `1.0`。固定L2 `governance-requirements.md:824-846`、L11 `governance-acceptance.md:442-456`。
- **FR-OS-027**: 限定task/attemptで許容される一つの小さく可逆なartifactを隔離環境で初回実行し、authority・分類・Worker・scope・予算/期限/stop・HARNESS oracle/義務・人確認をbindingする。操作許可と性能評価状態は独立する。LABO/INT実装が未利用なら同じL2 contractによるhuman substituteを入力として許すが、生成性能/評価/assignmentのauthorityを人へ移さない。
- **AC-OS-027-01 normal — 未評価単独は拒否理由でない**: 性能履歴のないWorker/modelでも、以下6条件すべてとtaskに有効なoperation authorityを満たし、人が限定scope/Worker/budget/deadline/stop/verification dutiesを確認した場合、限定初回を許可できる。proposal/evidence substitutionは同じ固定schema/source/scopeを用い、actor/timeとOS receiptを残す。実行後は、作成Workerとは異なる人の確認者が結果を確認し、確認者actor、対象revision、scope、確認時点、結果、未完義務を同一の確認記録へ束縛する。これは新しい毎回承認gateではなく、固定L2/L11の結果確認evidenceである。初回成功もLABOが適用可能なoracleで評価するまではunassessedのまま。 六条件は、(1) 全入出力assetのidentityとclassification owner/source/revision/data-useを束縛し、unknown/secret/HELIX-restrictedを除外、出力classification/scopeを事前指定、(2) credential accessとraw secret read/input/outputなし、(3) networkなしまたはSECURITY-L2-006が明示許可する宛先/protocol/path/data class/量/purpose/authority/expiry内、(4) SECURITY-L2-003 isolationと選択作業に適用するL2-007制約を環境へ適用しhost fallbackなし、(5) operationごとにSECURITY-L2-008 actor/target/operation/revision/environment/scope/expiryに一致する有効authority、(6) 変更前状態と復旧先が確認できる可逆変更でrelease/tag/distribution等の不可逆作用なし、である。各根拠は同じattempt/scope/revision/environmentに束縛する。
- **AC-OS-027-02 negative — 6条件の独立変異**: 共通normal baselineでは6条件とoperation authorityを成立させる。各CASEは表記された一つの条件内の一field/事実だけを変異し、それ以外の適格条件はbaselineどおり保つ。`CASE-OS-027-02a1`–`CASE-OS-027-02a6`は分類/provenance/data-use条件1内のasset identity、classification owner/source/revision、planned output class/scope、data-use、secret/restricted input/outputを個別に変える。`CASE-OS-027-02b`はcredential/secret条件2、`CASE-OS-027-02c`は通信条件3、`CASE-OS-027-02d`は隔離/適用条件4、`CASE-OS-027-02e1`–`CASE-OS-027-02e3`はactor/target/operation/revision/environment/scope/expiry authority条件5、`CASE-OS-027-02f`は可逆性条件6をそれぞれ個別に変異する。02e系ではcondition 5とoperation authority自体が不成立となるため、変異後にauthority有効とは記録しない。その他の条件変異ではoperation authorityを有効に保つ。02a5のdata-use欠落は条件1のdata-use constraintであり、条件5の操作authority欠落とは別のfixture・根拠である。各caseで開始拒否、owner/根拠/再開条件を示し、失敗を別条件で相殺しない。
- **AC-OS-027-03 negative — 他の必須開始入力/適用scope**: 共通normal baselineでは6適格条件とoperation authorityを確認済みにする。各CASEはひとつの追加必須input/bindingだけを欠落/変更する。`CASE-OS-027-03a`はoperation authority欠落で、適格条件5と意味が重なることを明示し、他の5条件は成立したまま条件5相当のauthority inputだけを外す（重複するauthority oracleの個別traceであり、六条件すべて成立とは主張しない）。`CASE-OS-027-03b` HARNESS oracle missing、`CASE-OS-027-03c` authorized budget missing、`CASE-OS-027-03d` deadline missing、`CASE-OS-027-03e` stop condition missing、`CASE-OS-027-03f` task scope逸脱、`CASE-OS-027-03g` verification scope逸脱、`CASE-OS-027-03h` exact HEAD mismatch、`CASE-OS-027-03i` partial successを完了扱い、`CASE-OS-027-03j` LABOがOS assignmentを行う、`CASE-OS-027-03k` scoreだけでscope/branch/authority変更をそれぞれ独立fixtureにする。該当固定ownerへ返し、未完義務/再開条件を保持する。
- **AC-OS-027-04 unseen normal**: 未公開taskが同一の狭いconjunctionを満たす場合も限定入力の範囲でのみ扱い、unknownを推測で埋めない。human proposal/evidence substituteもorigin/schema revision/source/scope/actor/time/receiptを保つ。
- **AC-OS-027-05 human-substitute normal**: INT/LABO runtimeを実行前提とせず、人が同じaccepted contractに沿ってproposal/evidenceを明示するとき、OSは受領・assignment・権限を別stateに保つ。人手入力はINT生成やLABO評価済み証拠にならない。
- **AC-OS-027-06 evaluation boundary**: oracleの存在だけでassessedにしない。LABOがtask/model class/scopeに適用可能と確認したoracle revision・判定条件・比較条件を実結果（failures/counterexamples/unknown含む）へ実際に適用したときだけ当該範囲を評価する。一回のsuccessのみ、異class/scope、stale/conflict、基準なしはunassessed/evaluation-unknownを保持する。
- Owner: SECURITYはclassification/operation permission、安全制約。OSだけがexisting authorityで適格性・割当・停止を判断。INTはproposal schema/meaning、LABOは観測/評価、INFRAは資源実値、HARNESSはoracle/verification duties。人は指定された限定scopeの初回と結果を確認する。操作/review/CI/PR/mailboxから新しい人間decisionや許可を作らない。

### 対起草時の差戻し規則

L2意味・適用scope・owner・versionの変更が必要と判明した場合だけ、根拠・影響と共にL2/POへ戻す。数値候補の比較ごとにPO承認を聞かず、新gateを作らない。Stage 1全件完了や他Stageの完了を本8親の前提にしない。Stage2cは順序上後続、Stage2bは並行可能。保留/不採択要求、version未指定要求、Web後続条件は親として追加しない。

### 旧source項目別crosswalk

| 現行親 | 旧source (asset ID / path / 行 / 全体SHA) | dispositionと保持点・置換点 |
|---|---|---|
| OS-015 | `LEGACY-ASSET-C6936A5DA79A6DAE4FE4` `document-authority-census-requirements.md:23-87` SHA `e05adb62d9ad07507f962cf060b3dbe66c161afc3f09391b29b3144ced57535c`; `LEGACY-ASSET-170112AB2FA2FFDBFEE9` `security-capability-broker-acceptance.md:13-29,42-55` SHA `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` | source identity/revision/raw event censusと訂正/分類履歴は意味を再導出。旧document authority schema・broker/provider behaviorは置換。paired positive/negative traceの形を再導出し、runtime/testはコピーしない。 |
| OS-016 | `LEGACY-ASSET-E78B8D68CC327AA00991` `requirement-discovery-json-authority.md:26-78` SHA `361a9ef773f7cf36cc0953f70cad205184ca952f2cb672431e5b929121ef1f61`; `LEGACY-ASSET-44DD86E3DEC09E65EF51` shared pair | source/revision/provenanceと関係traceの分離を再導出する。旧JSON authority/schemaと旧statusは固定L2のstate modelへ置換し、共通acceptanceの形式を再利用する。旧ID/runtimeは持ち込まない。 |
| OS-017 | `LEGACY-ASSET-5EE032D657C221184B00` `universal-workflow-ai-judgment-engine.md:13-87` SHA `e20f475a3d1d082842415c2b734233e33a59f1b0bb1046c41e4ff4ec9c700e5b`; `LEGACY-ASSET-44DD86E3DEC09E65EF51` | task/dependency/budget/stopと構成の考え方を固定HARNESS process語彙のもとで再導出する。旧mode名、自律判断、一本道sequence、1.0で未対応のflowは置換または対象外とする。 |
| OS-018 | `LEGACY-ASSET-50CA1C554747F12266D3` `resident-lane-orchestration-requirements.md:34-124,189-478,495-620,717-925` SHA `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd`; `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `resident-lane-orchestration-acceptance.md:17-55` SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | actor/scope、lease expiry、重複作業防止、累積制約、partial output隔離、handoff/independent review、unassessedの区別を再導出する。旧lane/lease/provider runtimeは置換または対象外とし、固定provider数を作らない。 |
| OS-019 | `LEGACY-ASSET-8FECCE93E3996E8AAAFF` `orchestration-memory-runtime.md:14-50` SHA `c4fae09ac57f335a572b1d86ad353e7985551caa364f991a08e15d24d603c857`; `LEGACY-ASSET-1EAF81D2FED559ED38C4` `lifecycle-state-separation-acceptance.md:235-265` SHA `73a371eadd006c4f850cc0129f8c6cdf2b44c17d8356b94164cf253711c4f60c` | append/projection/recoveryとlifecycle stateの区別を再導出する。provider memoryをauthorityにせず、旧runtime/state機構は置換する。 |
| OS-020 | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` `pillar-functional-requirements.md:38-57,134-197,198-307` SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`; `LEGACY-ASSET-44DD86E3DEC09E65EF51` shared pair | FR/AC traceとnormal/negative oracleの形式を再利用し、内容は固定HARNESS contractとexact run bindingから再導出する。旧HAT/L12/runtime/CIは置換または対象外とする。 |
| OS-023 | `LEGACY-ASSET-50CA1C554747F12266D3` same resident-lane L3 above; `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` acceptance above | scope付きhandoff、receiver duties、誤ったactorまたはstale receiptの扱いを再導出する。旧lane実装は置換し、現行親のownerを維持する。 |
| OS-027 | `LEGACY-ASSET-7F8960532611D89D03E1` `technology-environment-reconciliation-requirements.md:32-94` SHA `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc`; `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` acceptance above | drift/evidence、観測だけでauthorityを更新しないこと、unassessed、scoreだけでauthorityを変えないことを保持する。technology reconciliation state machineとresident-lane機構は置換する。現行の6適格条件とowner境界は固定L2/L11からのみ再導出する。 |
