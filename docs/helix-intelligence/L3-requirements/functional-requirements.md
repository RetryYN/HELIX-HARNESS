# HELIX-INTELLIGENCE L3 機能要件（Stage 2a）

状態: PO L3承認前の起草候補。親は基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7` で採択された要求の固定対象revisionに限る。L3承認、実装・実行の許可を生成しない。

## 目的とsource

固定採択L2/L11をシステム動作に詳細化し、各FRをこの文書内のACへ結び、対となるL10 `functional-verification.md` のCASEへ追跡する。旧L3のFR/AC trace形と旧paired acceptanceの正常・negative oracle形は再導出する。旧ID、provider/runtime固有方式、旧L10/L12実行条件は移さない。

旧HELIX起点は、旧L3 layer定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-168`（LEGACY-ASSET-F542125805B777D8A56A）、旧shared FR/AC `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:38-57,134-197,198-307`（LEGACY-ASSET-EE5DBACC7F28F7D1F605）、旧paired test shape `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32-90,91-216`（LEGACY-ASSET-44DD86E3DEC09E65EF51）です。INT specific旧L3は `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:26-45,47-110,123-137`（LEGACY-ASSET-9114D4E463E95B67DD0C）、対は `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md:18-37,39-64`（LEGACY-ASSET-C6ADB99F1353965C5449）と `resident-lane-orchestration-acceptance.md:17-55`（LEGACY-ASSET-437A6A68F9A9E0AE1B9E）です。旧L10 phase定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207` はL3↔L10 pairとL3/L4-L6への戻しを定義しますが、旧L3 README `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16-56` は下流をL3→L12 pairとし、旧L10 processとの記述が食い違います。そこでL10 phaseを検証pair/差戻しの形式起点、READMEをfunctional/business/NFR sub-doc分割の形式起点に限定し、READMEのL12/G3 gateや旧L10の運用・承認段階は継承しません。旧L3のengineering discipline（旧L3定義:163-165、no-code-first・責務owner・許容complexity等をPLAN契約でfreeze）も独立した実行/CI規則として移さず、現行のsource-bound要件・L10 oracle traceだけを再導出します。項目別の再利用・再導出・置換とraw source pinsはrevision-specificなhandoff/監査記録へ収録し、private `/tmp` artifactを正本依存にしません。

## FR-INT-010 — task別Worker配置proposal

- 親: `HELIXINTELLIGENCE-L2-010`、親L1 `HELIXINTELLIGENCE-L1-010`、version target `1.0`。
- 固定L2 source: `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:102-107`、PO採択行: `docs/governance/decisions/helix-intelligence-requirements-po-decision-2026-09-28.md:57`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L11: `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:34,71,146,163,191-197`。G13のL2-010追加行197は採択registration `MPR-RC-HELIXINTELLIGENCE-L2-010-004` のcoverage receipt `acceptance_binding`（L11 base bytes + append）に束縛される。source pinsにreceipt、bindingと追補spanを含める。row 34はconnection contextとしてL2-034/035/037/061を列挙するがStage前後関係は追加しない。L10は採択済みsource/revisionが実際に選択経路で使われる場合だけ照合する。
- Owner: INTELLIGENCEはproposalと理由を生成する。task属性不足やticket identity不足はOSへ戻す。LABOはHELIX-Bench task/model class evidenceと評価状態を所有し、evidence・revision・scope不足はLABOへ戻す。assignment・実行・進行はOSに残す。
- 入力: ticket/task identity、type/domain/complexity/context/tool requirement、Worker capability/version、success/failure/rework/latency/cost/reliabilityのsource-bound観測実績、同scopeで適用可能なLABO evidenceまたは未評価状態、および実際に消費する場合のHARNESS-L2-010/011共通pack contract identity・版・互換範囲。
- 出力: ticket/taskごとのproposal、適合理由、除外理由、根拠source/revision/scopeと不確実性・未評価状態。proposalはassignment、実行許可、評価済み資格を意味しない。
- 受入条件:
  - **AC-INT-010-01 正常**: task属性と複数Worker profileを与え、各必要capability/tool/domainを同scopeの観測実績・LABO作業種別/model class evidenceと照合する。costを含む観測値はtask属性・capability・同scope performance evidenceと併用して理由づけし、単独で配置を決めない。選択経路でscope/revisionに有効なquality gate・priority/tolerance判断を参照する場合は再利用し、Worker/effort候補の理由・除外・不確実性・未評価を示す。有効判断を毎run再確認せず、判断が未決・失効・矛盾・境界外なら該当ownerへの未確定理由を残す。候補と理由はexpected-evidence oracleと一致し、未評価を未評価で表示したproposalをOSへ渡す。OS assignmentはproposalと別状態である。
  - **AC-INT-010-02 negative**: task属性、Worker capability、performance/evidence根拠を比較理由から除きpriceだけで配置順位を決めた場合不合格。価格は他の必須根拠と併用する正常対照（AC-INT-010-01）を許す。model nameだけ、またはbenchmark値だけを独立理由として順位を決めた場合もそれぞれ不合格。
  - **AC-INT-010-03 negative**: scope外/異なる作業種別/model classの実績を適用可能扱いした場合不合格。
  - **AC-INT-010-04 negative**: ticket/task identity、type、domain、complexity、context、tool requirementの各欠落を独立変異で拒否しOSへ戻す。Worker capability/version、success/failure/rework/latency/cost/reliability観測source/revision/scopeの各欠落/stale、LABO HELIX-Bench作業種別・model classの各不一致は別々に拒否し、証拠不足をLABOへ戻してproposalを未確定にする。LABO水準未評価をqualified扱いする変異も独立して拒否する。Worker水準・実績の評価材料をLABOが提示し、配置案はINTELLIGENCE、実割当はOSに残す固定L2-061:362-364の分担に基づき、capability/versionの根拠不足はLABOへ戻す。
  - **AC-INT-010-05 未見正常**: 未公開task/worker profile組合せで適合scope内の候補だけを提示する。evidenceがなければ未評価を保ち、OS assignment/進行はINT proposalから成立しない。
  - **AC-INT-010-06 negative**: 実際に消費する共通pack contractのidentity、契約/成果物/依存version、互換範囲、交換/更新条件が欠落・stale・不一致なら互換成立と扱わない。互換不成立としてproposalを未確定にし、共通pack contract ownerの定めへ戻す。HARNESS共通contractの定義ownerは固定pack contract側に残す。
  - **AC-INT-010-07 negative（G13／固定L11:197）**: 選択経路で利用する既決quality/priority/tolerance判断と比較材料がscope/revisionに適用されるかを照合する。必要品質未達・unknown・未評価を隠す、適用範囲内の有効decisionを毎run再確認する、human intervention costを総費用から落とす、proposal自体からOS assignmentを生成する、またはproposalを実行許可として扱う各変異を独立に拒否する。既存判断は適用内で再利用し、assignmentと実行許可はOSの別判断に残す。G13が挙げる067/034固有契約の詳細は、それらの採択Stageで各親のscopeとして扱い、010の新しい親依存・gateにしない。

## FR-INT-066 — 人代行proposalの入力・受領

- 親: `HELIXINTELLIGENCE-L2-066`、親L1 `HELIXINTELLIGENCE-L1-010`、version target `1.0`。
- 固定L2 source: `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:454-465`、PO採択行: `docs/governance/decisions/helix-intelligence-requirements-po-decision-2026-09-28.md:96`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L11: `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:131-139,285`。row 134-138とL2-066登録に結ばれたline 285の未見・重複・遅延receipt条件を含める。L2-010 schema/revision、LABO-054/055 evidence、OS ticket/receipt、HARNESS-010/011 pack versionは各適用範囲で照合し、Stage前提を追加しない。
- Owner: INTELLIGENCEはL2-010 proposal schema/meaningとそのversionを所有。LABOはevidenceの観測・評価状態を所有。OSはticket、入力receiptおよび別個のassignment判断を所有する。人手入力はINT生成出力・評価実績・assignment・権限にならない。
- 入力: OS ticket/task identityと必要属性、Worker capability/version、LABO evidenceまたは明示的未評価とsource revision/scope、固定採択L2-010 proposal schema/contract versionおよび適用するpack contract version、human proposalと作成actor/time。
- 出力: L2-010と同じproposal schemaで記録された人代行案と、入力・scope・source/contract revision・作成actor/time・OS受領actor/timeを束縛するreceipt。INT runtime実行は必須依存ではない。
- 受入条件:
  - **AC-INT-066-01 正常（INT runtime経由の通常経路）**: runtimeが別途利用可能なfixtureでは、LABO-055/054の同scope評価材料がLABO→INTELLIGENCEへ渡り、INTがproposalを作成し、OSが別途審査・assignment判断を行う三段を確認する。人代行入力はこの経路の前提ではない。
  - **AC-INT-066-02 正常（runtimeなしの人代行経路）**: INT runtimeを使わず、人が固定L2-010と同じschema/contract revisionで暫定案を記入する。推奨Worker、根拠、除外理由、不確実性/unknown/未評価、Worker capability/version、source revision/scope、task identity、L2-010およびpack contract version、作成actor/timeを保持する。receiptがまだ無くても提案内容は記録でき、OS receipt後もassignmentは別状態である。
  - **AC-INT-066-03 negative**: 人の案をINT生成出力、観測/評価済み性能、qualified状態として表示した場合不合格。根拠のないunknown埋め・未知値を確認なしに確定値へ置換する変異も不合格。
  - **AC-INT-066-04 negative**: ticket/task属性またはOS受領receiptの欠落/不一致時にassignment材料として受領・assignment開始した場合不合格。
  - **AC-INT-066-05 negative**: 推奨Worker、根拠、除外理由、不確実性、unknown、未評価表示、Worker identity/capability/version、LABO evidence/state/source/revision/scope、L2-010 proposal schema、proposal contract revision/version、適用pack contract identity/version、作成actor/timeの各fieldを個別に欠落/stale/不一致にする変異を拒否する。profile/capability/versionおよびBench evidence/state/source/revision/scopeはL2-061のLABO評価材料・Worker実績の範囲でLABOへ戻す。schema/contract identityまたはversion自体が不明ならINTELLIGENCEへ戻す。OS receipt後のversion/scope互換性が不明ならOSへ戻す。OS ticket/receiptとproposal作成・受領actor/timeのreceipt binding不成立もOSへ戻し、assignmentを成立扱いしない。
  - **AC-INT-066-06 negative**: authority、scope、branchの各拡張、実行許可の付与、OS assignment代行を個別変異し、いずれも不成立とする。
  - **AC-INT-066-07 未見正常**: 未公開の人作成proposal fixtureでもorigin・schema/contract revision・source/scope・未評価状態・actor/timeを保持して受領する。受領後もassignmentはOSの別判断である。
  - **AC-INT-066-08 negative**: 同一proposal重複を新規根拠として数える場合、または未見contract版/遅延receiptでversion/scope互換性が不明なのに受領・割当を進める場合を別々に拒否する。schema/contract identityまたはversion自体が不明ならINTELLIGENCE、receipt後のversion/scope互換性unknownはOSへ戻す。L11:137のschema/version不明とreceipt互換性不明を区別する.

## Scope除外・backflow

Stage1草稿は未承認authorityとして使わず、採択済みsourceが実際に使われる場合だけその固定revisionを検証する。L2/L1の意味、scope、ownerまたはversionを変えなければ成立しない不足が見つかった場合のみ、原文・理由・影響を付して上流へ戻す。技術候補の比較にPO per-parameter承認や新gateを作らない。`HELIXINTELLIGENCE-L2-067`はこのStageの独立親・必須前提にはしない。ただし固定L11:197のG13はこの010の受入条件として保持し、既にscope/revision内で有効な判断の再利用と個別反例を検証する。067固有の入力契約詳細はStage 3、L2-034の評価packet契約詳細はStage 4で各親のscopeとして扱う。Stage 2aでは固定010の同scope実績とG13の必要な結果句だけを照合し、後続親の完了をgateにしない。保留・不採択要求、後続版/Web条件をこの1.0親へ追加しない。

## C13 carry-forward

C13-M10、C13-M7、C13-M12 audit-record correction、Minor INT-010、Minor INT-060-078は未解消として引き継ぐ。`C13-U-INT-NFR-060-078`と`C13-U-all-crosswalk-and-legacy`も未確認のまま保持する。この新規draftは独立reviewやfinding closureを意味しない。source・parent別割当とraw pinsはrevision-specificなhandoff/監査記録へ収録する。private `/tmp` artifactを継続的な正本依存にしない。


## Stage 2c — 068/075の起草範囲とsource

状態: 以下のStage 2c追補はL3未承認の起草候補・未実行の検証設計である。上のStage 2a本文とその承認範囲を変更しない。対象は採択済みHELIXINTELLIGENCE-L2-068/075に限る。旧source起点・項目別の再導出/置換は各項目と時点監査に記録する。

状態: L3未承認（委任承認前）の起草候補。親は基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7` で採択された要求の固定対象revisionに限る。L3承認、実装・実行の許可を生成しない。

### Stage 2cの目的とsource

固定採択L2/L11をシステム動作に詳細化し、各FRをこの文書内のACへ結び、対となるL10 `functional-verification.md` のCASEへ追跡する。旧L3のFR/AC trace形と旧paired acceptanceの正常・negative oracle形は再導出する。旧ID、provider/runtime固有方式、旧L10/L12実行条件は移さない。

旧HELIX起点は、旧L3 layer定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-168`（LEGACY-ASSET-F542125805B777D8A56A）、旧shared FR/AC `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:38-57,134-197,198-307`（LEGACY-ASSET-EE5DBACC7F28F7D1F605）、旧paired test shape `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32-90,91-216`（LEGACY-ASSET-44DD86E3DEC09E65EF51）です。INT specific旧L3は `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:26-45,47-110,123-137`（LEGACY-ASSET-9114D4E463E95B67DD0C）、対は `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md:18-37,39-64`（LEGACY-ASSET-C6ADB99F1353965C5449）と `resident-lane-orchestration-acceptance.md:17-55`（LEGACY-ASSET-437A6A68F9A9E0AE1B9E）です。旧L10 phase定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207` はL3↔L10 pairとL3/L4-L6への戻しを定義しますが、旧L3 README `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16-56` は下流をL3→L12 pairとし、旧L10 processとの記述が食い違います。そこでL10 phaseを検証pair/差戻しの形式起点、READMEをfunctional/business/NFR sub-doc分割の形式起点に限定し、READMEのL12/G3 gateや旧L10の運用・承認段階は継承しません。旧L3のengineering discipline（旧L3定義:163-165、no-code-first・責務owner・許容complexity等をPLAN契約でfreeze）も独立した実行/CI規則として移さず、現行のsource-bound要件・L10 oracle traceだけを再導出します。項目別の再利用・再導出・置換とraw source pinsはrevision-specificなhandoff/監査記録へ収録し、private `/tmp` artifactを正本依存にしません。

対象は採択済み `HELIXINTELLIGENCE-L2-068` と `HELIXINTELLIGENCE-L2-075`。この追補は承認済みStage 2aの010/066範囲を変更しない。項目別sourceと再導出は時点監査へ記録する。


## FR-INT-068 — 作業中Workerへの単体支援候補（Stage 2c）

- 親: `HELIXINTELLIGENCE-L2-068`、親L1は `HELIXINTELLIGENCE-L1-002`、`HELIXINTELLIGENCE-L1-005`、`HELIXINTELLIGENCE-L1-007`、`HELIXINTELLIGENCE-L1-008`。context L1は `HELIXINTELLIGENCE-L1-003`、`HELIXINTELLIGENCE-L1-012`、`HELIXINTELLIGENCE-L1-013`、`HELIXINTELLIGENCE-L1-019`、`HELIXINTELLIGENCE-L1-020`。`version_target: 1.0` は候補目標であり、収載・採択・releaseを意味しない。
- 固定L2: `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:491-506`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。PO採択decisionは `docs/governance/decisions/helix-intelligence-requirements-po-decision-2026-09-28.md:98`、採択基準mainは `633bf12ea8f948db8ba3d6600179c4a9507377a7`。固定L11の条件行は `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:202-209` 同revision。
- Owner: INTELLIGENCEは既存条件内の診断・設計・test支援候補を作る。元Workerが実装を担い、OSはassignment/ticket/dispatch/budget/stop、HARNESSまたは既存対象ownerはrequirement/design/oracle/受入意味、SECURITY/OSはdata-use/authority、BRAINはcandidate applicability、LABOは長期評価・一般化を所有する。新ownerは作らない。
- 入力: 有効な元Worker assignmentまたは着手予定assignment、task/ticket identity、scope、対象requirement/design revision、既存HARNESS-L2-022 oracleと受入義務、operation別input/output contract、OSの割当budget/deadline/stop、実際に選択したsourceのidentity/version/owner/provenance/利用許可/applicability。failure/blocked evidenceは共通必須にしない。症状・観測・再現材料は、それを要するdiagnosis/consult operationだけへ追加する。
- 出力候補: sourceに結び付いた診断（観測fact、inference、hypothesis、unknownを区別）、関連する最小design/code/prior-failure/BRAIN context、subtaskごとの依存・受入・stop案、必要時の限定consult question、元Workerへの修正案、既存HARNESS-L2-022 oracleに束縛したtest/oracle拡張案、evidence/coverage checklist。いずれも候補であり要求、accepted oracle、ticket、assignment、run resultではない。
- AC-INT-068-01（単体成立・事前準備）: 操作に必要な共通入力と既存oracleが揃えば、失敗報告やHELIXOS-L2-028/029完了を要求せず、作業前のtest/instruction/support candidateを返せる。親のscope・requirement/design revision・元assignment・budget/deadline/stop・既存義務を維持する。consult不要の操作にconsult receiptを要求しない。
- AC-INT-068-02（diagnosis証拠）: diagnosis/consultを選ぶ場合、入力された症状・観測・再現材料とsourceを結び付け、観測factと解釈・仮説・unknownを分離する。必要証拠がなければそのdiagnosis/consult candidateだけを保留し、不足と既存ownerを返す。妥当な事前準備候補を同じ不足で止めない。
- AC-INT-068-03（sourceとpacket）: 選択sourceのidentity/version/owner/state/provenance/scope/permission/applicabilityを保持し、必要な選択sourceのmissing/stale/conflict/restricted/out-of-scopeを成功や事実へ補完しない。未選択sourceは強制依存にしない。packet/contextを使う場合はAIDOCのsource/revision/authorityとsummary non-authority、OS CLR-R06の必要情報・未完義務の保持に従う。secret/private reasoningや未承認結論をpacketへ入れず、summaryをauthority化せず、選択packetの必要な未完義務を落とさない。packet利用自体を新しい能力や必須入力へしない。
- AC-INT-068-04（候補出力・oracle trace）: 実施operationとtrigger、期待output、scopeを識別して記録する。いずれかが欠けるcandidateは不足を明示し、完全な候補/受入条件として扱わず、oracle意味をHARNESSまたは対象ownerへ戻す。各subtaskのdependency/acceptance/stop案、修正案、consult question、test/oracle案はtask/scopeと固定requirement/design/既存HARNESS-L2-022 oracleへtraceし、根拠source・仮定・unknown・代替案・return targetを記録する。test/oracleは追加提案に留まり、accepted oracleや受入条件として確定せず、既存oracleも変更しない。
- AC-INT-068-05（権限と担当）: 元Workerは修正・実装責任を維持する。INTELLIGENCEはassignment/dispatch、test/CI実行、受入、merge、requirement/design authority、BRAINへの直接generic promotionを行わず、支援者/助言者を同一変更の独立reviewerまたは利用者受入者として数えない。HELIXOS-L2-020の実行、HELIXOS-L2-028の実consult/handoff、HELIXOS-L2-029の作業往復は選択された別operationの責務であり、本単体候補の成功条件へ取り込まない。Bench未評価は未評価のまま保ち、配置適性を代行判定しない。
- AC-INT-068-06（戻し・停止・版）: task/ticket/assignment/scope/budget/stop不足はOS、事実/provenance/applicabilityは既存source owner、requirement/design/oracle意味はHARNESSまたは既存対象owner、権限/data-useはSECURITY/OS、BRAIN applicabilityはBRAIN、長期effectiveness/generalizationはLABOへ戻す。operation単位で不足・停止理由・再開条件・未完義務を保持し、無関係な正常operationへ波及させない。要求の意味/scope/owner/version変更が必要な不足のみ上流へ戻す。依存する既存契約は `HELIXINTELLIGENCE-L2-002/003/005/007/008/012/013/019/020`、対象判断contract、OSの有効task/scope context、HARNESS-L2-022である。`HELIXLABO-L2-055`は利用可能な場合だけ歴史材料として参照し、未評価は未評価のまま保つ。HELIXOS-L2-020は選択されたtest実行、HELIXOS-L2-028は実consult/handoff、HELIXOS-L2-029はcomposite作業往復という各別operationの責務である。

旧sourceとの差分: 旧L3 shared FR/ACのrequirement→AC traceと責務分離、旧paired acceptanceのnormal/negative oracle形は再導出する。旧worker-common contractとresident-lane acceptanceのsource-bound入力、元Worker責任、助言者と独立reviewの分離を意味対応させる。旧Issue/PLAN authority、旧runtime/CLI、test実行方式、旧stage/gate、provider固有方式、engineering-discipline実行規則は再利用しない。旧READMEのL12と旧L10 processの層差は既存冒頭の通り形式起点を限定する。


## FR-INT-075 — Agentic Audit Probeのproposal識別と適格化境界（Stage 2c）

- 親revision: `HELIXINTELLIGENCE-L2-075`、`version_target: 1.0`。本文snapshot内の「未採択candidate」表記より後のPO判断記録を採否の正本とする。PO `MPR-RC-HELIXINTELLIGENCE-L2-075-002` は、L2/L11本文SHA `c302d45ef008b8d73f71c9484c1c9e2432c8e195f23c559b513d36309cdb80f6` / `b81bd9e52df97cc92f0f228fb9effab476012836e7e113b985641ea2c99ac08e` に一致するrevisionを本文どおり承認している。L3は承認前の起草候補である。
- 対応する採択上流: `HELIXINTELLIGENCE-L1-009`（監査結果をHEAD/authority/作成者/evidence/reproduction/falsificationへ辿る、自由文だけでauthorityを変えない）と `HELIXINTELLIGENCE-L2-009` のaudit finding trace。L2-075本文の対象条件は `1880c422311a7f8321dbb0e2b98fa12c69449201` のL2 `618-625` / L11 `337-343`。G0 Stage 2cは案Bの限定したWorker support/test generationをStage 2b完了gateなしで進め、G0順序表の明示前提欄から追加のStage完了gateを作らない。採択済みL1-009／L2-009のtraceとowner境界は前記の意味根拠として保持する。
- Owner境界: INTELLIGENCEはidentity/evidence/qualification状態を保持したprobe proposalを返す。監査対象authority/sourceは既存機構owner、existing UIL-01〜04はduplicate/existing owner、独立再現、反証、expiry/supersessionの既存qualification/handoff先であり、本候補でUILの規則・owner・routeを再実装しない。AI自身は `verified`、P0/P1、owner、route、remediation adoptionを確定しない。PR review findingとsystem audit proposalは別identity・別schemaに保つ。finding proposalとremediation proposalは別identity・別判定を保つ。
- FR-INT-075-01（proposal identity）: `AgenticAuditProbeProposalV1`候補はproposal ID、audit episode、producer provider/runtime/model/version/session、repository、candidate HEAD、worktree identity、authority revision/digest、責務/invariant ID、観測挙動、evidence、reproduction recipe、counterevidence、confidence、expiry、finding advisory、remediation advisory、proposal digestを結ぶ。各fieldは同じproposal/audit/source/target identityへ追跡できる。欠落値を他fieldから補完せず、findingとremediation advisoryを分離する。
- FR-INT-075-02（authority・identity照合）: exact HEAD、resolved worktree、authority digest、producer session、responsibility owner、evidenceの存在・identity・revision一致を別々に照合する。欠落、改変、不一致、異版はproposalをfail-close/incompleteとし、該当fieldと欠落/不一致を説明する個別reasonを残す。reasonのenum、語彙、schemaは固定しない。current、compatibility、historical authority/evidenceを明示し、historical evidenceをcurrent claimへ昇格しない。
- FR-INT-075-03（qualification handoff）: AI自己評価のみではverified、priority、owner/route、remediation採用を決めない。duplicate/existing owner照合、独立再現、反証、expiry、supersessionの不足・unknown・矛盾は未qualifiedとして既存UIL-01〜04のownerへ返す。各finding/remediation proposalのidentityを維持し、qualifying processやIssue/Requirement/CI/merge runtimeを起動・代行しない。AAFD-R-04のdetector priority/direct-projection条件は採択済みL2-073側に残し、この親へ追加しない。
- AC-INT-075-01（正常）: synthetic proposalに親の列挙した全identity/evidence/advisory fieldを与え、各fieldのproposal・episode・producer/session・repository/HEAD/worktree・authority・responsibility・観測/evidence identityとrevisionを整合させる。proposal digestを全入力に結び、PR review findingとsystem audit proposalが別identity・別schemaで、finding/remediation advisoryが別identity・別判定であるcandidateを返す。accepted authorityを変更せず、資格・採用・実行済みstatusを生成しない。
- AC-INT-075-02（field完全性）: 全列挙fieldの存在・意味・digest bindingを確認する。field単位の欠落/改変negativeはCASEで一度に一fieldだけ変え、そのfield名と当該欠落/不一致に対応するreasonを結果へ残す。別field/別sourceでの補完や、reason enum/schemaの固定を要求しない。
- AC-INT-075-03（6 identity negative）: exact HEAD、resolved worktree、authority digest、producer session、responsibility owner、evidenceを各々独立にmissing、changed、wrong revisionへ変異し、対象条件ごとにincomplete/rejectedと理由を出す。他identityやhistorical evidenceで代用しない。
- AC-INT-075-04（authority時制）: 同一のproposalについてcurrent、許容範囲内のcompatibility、historicalを別fixtureで確認する。historicalをcurrent claimへ変えず、compatibilityの適用範囲不明はunknown/incompleteに保つ。
- AC-INT-075-05（qualification negative）: 自己評価だけのverified/P0/P1/owner/route/remediation adoption、duplicate/existing owner照合不足、独立再現不足、未処理counterevidence、expiry根拠欠落またはexpired、supersession未解決を個々に未qualifiedへ保つ。finding/remediationを同一identity・decisionへ結合しない。各不足を既存owner/handoffへ返す。
- AC-INT-075-06（unknown・非実行）: 別producer/session/HEAD、stale evidence、未見の監査episode、期限切れ/superseded/duplicate candidateを個別に入力する。確定不能な関係はunknown/incompleteで保持し、existing ownerへhandoffする。proposal生成からUIL/TER/Future Synthesis runtime、Issue/Requirement/CI/merge操作を生じさせない。
- 旧source差分: 旧L3のFR+ACを対のL10 CASEへtraceする形（LEGACY-ASSET-F542125805B777D8A56A、`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-168`）は意味を再導出する。旧AAFD `LEGACY-ASSET-EB3700B0088F311C2295` のR-01〜03（`agentic-audit-future-state-delta-requirements.md:23-41`）はidentity/evidence/qualificationの意味を再導出し、旧Issue/runtime/adapter/control名は現行L1/L2/ownerへ置換する。旧paired AC `LEGACY-ASSET-CAC0C64EB7540180B1FE` のAC-001〜003（`agentic-audit-future-state-delta-acceptance.md:15-17`）の完全proposal、individual reason、qualification negativeはnormal/negative oracle形式として再導出する。旧表のAC-004はR-04 detector条件であり、親075の範囲外でありL2-073の担当範囲なので含めない。残余AAFD R-04+、AC-004+、future-state adapter/TER/Future Synthesis/runtimeは親075の要求にしない。旧L3の工程/G3/approval/runtimeも移さず、現行配置・L3承認境界に従う。項目ごとの対応は次のとおり。

| 旧項目 | 扱い | 現行への再導出/置換理由 |
|---|---|---|
| AAFD-R-01 proposal schema | 再導出 | 旧の列挙形式から、固定L2-075の`AgenticAuditProbeProposalV1`全fieldと個別identity境界へ結ぶ。旧Issue/runtime/schema実装名は採らない。 |
| AAFD-R-02 identity受入 | 再導出 | exact HEAD/worktree/authority digest/producer session/responsibility owner/evidenceの6検査とfield別reasonをAC化する。旧failure動作の詳細enum/schemaは置換し、reason vocabularyを固定しない。 |
| AAFD-R-03 適格化境界 | 再導出 | self-qualification拒否、duplicate/owner照合・独立再現・反証・expiry・supersessionの既存UIL handoffと、finding/remediationの分離を固定L2-075から導く。UIL qualification runtimeは置換対象として実装しない。 |
| AAFD-AC-001 | 再導出 | 全field/digest bindingとfinding/remediation別identityのnormal oracleにする。旧fixture/ID・runtimeは持ち込まない。 |
| AAFD-AC-002 | 再導出 | 6 identity条件のmissing/changed/wrong revisionを一変数ずつ試し、各fieldとreasonを残す。reason enumは固定しない。 |
| AAFD-AC-003 | 再導出 | self-rating、独立再現不足、duplicate、expired、counterevidenceのqualification negativeを個別CASEにする。route・qualified判断の実体は既存UIL ownerへ残す。 |
| AAFD-AC-004 / AAFD-R-04 | 対象外 | deterministic detector priority/direct projectionは採択済みL2-073のscope。075へ追加しない。 |

## Stage 2a（PR #2594）carry-forward記録

以下は旧reviewのscope別carry状態を示す時点説明であり、Stage 2cの要求・受入条件・親依存ではない。C13-M7（L2-066）、C13-M10（L2-010）、Minor INT-010はStage 2aで扱った親範囲の履歴として記録する。C13-M12は複数機構・stageにまたがる監査記録整合性のfindingであり、INTELLIGENCE L2-068に関するcomment line 168の指摘はStage 2c本文で解消したとは扱わず、未解消のまま残す。Minor INT-060-078は複数親にまたがる範囲で、Stage 2aで扱った部分だけから全範囲を解消・確認済みとはしない。`C13-U-INT-NFR-060-078`と`C13-U-all-crosswalk-and-legacy`も共通監査の未確認範囲であり、L2-068に関わる未確認はStage 2cを含め引き続きopenである。この本文と監査は独立reviewやfinding closureを意味しない。

## Stage 3 — 採択済み22親の機能要件

状態: L3承認前の要件候補。対象はmain 633bf12採択のStage 3 / version_target 1.0の22親だけ。PO決定行を対象revisionの採択根拠とし、後続登録metadataはそのscopeを拡張しない。L3候補は実装・実行・release許可を生成しない。

旧HELIXの旧L3定義・shared FR/ACとpaired L10 oracleのtrace形を再導出する。INT専用sourceがある項目は旧source/consumerの対応箇所を親別に読み、保持・再導出・置換と理由を表へ記録した。旧runtime、CLI、score、workflow、approval gateを現行authorityへ移さない。対象Stage外の候補全文はコピーしない。

### 親別source disposition

| 親 | PO登録 (1.0) | 固定L2/L11 | 旧source asset / span | 再利用・再導出・置換の判断 |
|---|---|---|---|---|
| `001` | `MPR-RC-HELIXINTELLIGENCE-L2-001-002` Stage 3 / 1.0 | L2 48–53; L11 62, 146, 264–265 | LEGACY-ASSET-F1F753F31DB8D874EF21 40–68; LEGACY-ASSET-5EE032D657C221184B00 41–63; LEGACY-ASSET-BEAB5EE27CD04F5E866F 25–42; LEGACY-ASSET-6FFD7F4E58066D08B053 15–34 |再利用stable identity/lifecycle graphの意味。L2 domain対象へ再導出し、旧route registry/fixed enumは置換対象。 |
| `002` | `MPR-RC-HELIXINTELLIGENCE-L2-002-002` Stage 3 / 1.0 | L2 54–59; L11 63, 146, 264–265 | LEGACY-ASSET-5EE032D657C221184B00 41–63; LEGACY-ASSET-F1F753F31DB8D874EF21 40–68; LEGACY-ASSET-6FFD7F4E58066D08B053 15–34; LEGACY-ASSET-BEAB5EE27CD04F5E866F 25–42 |再利用capability/source linkの意味。domainごとの必要能力・未構成unknownをL2から再導出し、旧global capability rulesを置換対象。 |
| `003` | `MPR-RC-HELIXINTELLIGENCE-L2-003-003` Stage 3 / 1.0 | L2 60–65; L11 64, 146, 156–157 | LEGACY-ASSET-C6936A5DA79A6DAE4FE4 27–82; LEGACY-ASSET-F1F753F31DB8D874EF21 40–68; LEGACY-ASSET-BBD687399574FEE23807 22–54; LEGACY-ASSET-BEAB5EE27CD04F5E866F 25–42 |再利用source revision/provenance graph。Situation Model全field結合は現行親句から再導出し、旧snapshot/runtimeを置換対象。 |
| `004` | `MPR-RC-HELIXINTELLIGENCE-L2-004-003` Stage 3 / 1.0 | L2 66–71; L11 65, 146, 157–158 | LEGACY-ASSET-5EE032D657C221184B00 41–63; LEGACY-ASSET-E78B8D68CC327AA00991 26–90; LEGACY-ASSET-6FFD7F4E58066D08B053 15–34; LEGACY-ASSET-AD746F4F3487103519F9 16–33 |再利用fact/candidate/evidence trace。4値分類はL2語彙へ再導出し、旧scoring/state schemaを置換対象。 |
| `005` | `MPR-RC-HELIXINTELLIGENCE-L2-005-003` Stage 3 / 1.0 | L2 72–77; L11 66, 146, 158–159 | LEGACY-ASSET-5EE032D657C221184B00 41–63; LEGACY-ASSET-F1F753F31DB8D874EF21 40–68; LEGACY-ASSET-6FFD7F4E58066D08B053 15–34; LEGACY-ASSET-BEAB5EE27CD04F5E866F 25–42 |再利用candidate-vs-authority separationとplan trace。OS ticket境界や現行requirements contractから再導出し、旧workflow compiler/routeを置換対象。 |
| `006` | `MPR-RC-HELIXINTELLIGENCE-L2-006-003` Stage 3 / 1.0 | L2 78–83; L11 67, 146, 159–160 | LEGACY-ASSET-F1F753F31DB8D874EF21 40–68; LEGACY-ASSET-28FB139B26CD61CC51EE 21–148; LEGACY-ASSET-BEAB5EE27CD04F5E866F 25–42; LEGACY-ASSET-A952A3A175EB82A4781B 19–46 |隣接参照のみ（当該spanはprediction/assumption/falsificationの直接根拠ではない）。現行risk categoryとLABO handoffは固定L2/L11から再導出し、legacy prediction score/SLOを置換対象。 |
| `007` | `MPR-RC-HELIXINTELLIGENCE-L2-007-003` Stage 3 / 1.0 | L2 84–89; L11 68, 146, 160–161 | LEGACY-ASSET-17C4BF78919578FEBB18 129–160; LEGACY-ASSET-9B6FC1ED349F96394497 34–75; LEGACY-ASSET-D881AF6AFD277B1DE934 1–79; LEGACY-ASSET-658FF8439F9F8E694710 15–42; LEGACY-ASSET-0B5B38F146D9538C9A36 16–46; LEGACY-ASSET-901CD182B52024593E41 1–30 |再導出は採択済みL2のepisode境界・不完全/矛盾証拠下のdiagnosisとLABO長期history分担を起点に行う。BBGはsource/generator/output/consumer区分の隣接例だけ。BBR candidateはdiagnosisとrepairの分離参照に限り、既存incident/repair runtimeは置換対象。 |
| `008` | `MPR-RC-HELIXINTELLIGENCE-L2-008-003` Stage 3 / 1.0 | L2 90–95; L11 69, 146, 161–162 | LEGACY-ASSET-9114D4E463E95B67DD0C 47–137; LEGACY-ASSET-28FB139B26CD61CC51EE 21–148; LEGACY-ASSET-C6ADB99F1353965C5449 18–60; LEGACY-ASSET-A952A3A175EB82A4781B 19–46 |再利用revision-bound review evidence/counterexample。review result non-authorityを固定親から再導出し、old merge/release gate mechanicsを置換対象。 |
| `009` | `MPR-RC-HELIXINTELLIGENCE-L2-009-003` Stage 3 / 1.0 | L2 96–101; L11 70, 146, 162–163 | LEGACY-ASSET-C6936A5DA79A6DAE4FE4 27–82; LEGACY-ASSET-02D897E62EF2FA267267 41–201; LEGACY-ASSET-BBD687399574FEE23807 22–54; LEGACY-ASSET-0B5B38F146D9538C9A36 16–46 |再利用typed finding/provenance/backflow atoms。current mechanismsとexact HEAD ownerを固定親から再導出し、Census全工程/UIL/TER runtime移管を置換対象。 |
| `011` | `MPR-RC-HELIXINTELLIGENCE-L2-011-004` Stage 3 / 1.0 | L2 108–113; L11 72, 146, 164, 198 | LEGACY-ASSET-28FB139B26CD61CC51EE 21–148; LEGACY-ASSET-9114D4E463E95B67DD0C 47–137; LEGACY-ASSET-A952A3A175EB82A4781B 19–46; LEGACY-ASSET-C6ADB99F1353965C5449 18–60 |再利用controlled comparison dimensionsとhistorical cohort separation。固定L2のsame corpus/scopeへ再導出し、legacy benchmark scoring/qualification thresholdsを置換対象。 |
| `012` | `MPR-RC-HELIXINTELLIGENCE-L2-012-003` Stage 3 / 1.0 | L2 114–119; L11 73, 146, 165 | LEGACY-ASSET-5EE032D657C221184B00 41–63; LEGACY-ASSET-E78B8D68CC327AA00991 26–90; LEGACY-ASSET-6FFD7F4E58066D08B053 15–34; LEGACY-ASSET-AD746F4F3487103519F9 16–33 |再利用uncertainty-preserving source attribution。L2 uncertainty labels/next-evidence routesへ再導出し、legacy confidence score-as-authorityを置換対象。 |
| `013` | `MPR-RC-HELIXINTELLIGENCE-L2-013-003` Stage 3 / 1.0 | L2 120–125; L11 74, 146, 166 | LEGACY-ASSET-C6936A5DA79A6DAE4FE4 27–82; LEGACY-ASSET-5EE032D657C221184B00 41–63; LEGACY-ASSET-BBD687399574FEE23807 22–54; LEGACY-ASSET-6FFD7F4E58066D08B053 15–34 |再利用trace edges and inspectability. L2 fields/data-use boundaryへ再導出し、full regeneration/schema/runtime mechanicsを置換対象。 |
| `014` | `MPR-RC-HELIXINTELLIGENCE-L2-014-003` Stage 3 / 1.0 | L2 126–131; L11 75, 146, 167 | LEGACY-ASSET-9B6FC1ED349F96394497 34–75; LEGACY-ASSET-9114D4E463E95B67DD0C 47–137; LEGACY-ASSET-D881AF6AFD277B1DE934 1–79; LEGACY-ASSET-658FF8439F9F8E694710 15–42; LEGACY-ASSET-C6ADB99F1353965C5449 18–60; LEGACY-ASSET-901CD182B52024593E41 1–30 |Bot候補のidentity/OS assignmentは採択済みL2から再導出する。BBGは定型生成のsource/generator/output/consumer境界だけ隣接参照し、BBR candidateは下流の限定修復scope/許可境界比較のみ。old Bot CLI/automatic authoringは置換対象。 |
| `015` | `MPR-RC-HELIXINTELLIGENCE-L2-015-003` Stage 3 / 1.0 | L2 132–137; L11 76, 146, 168 | LEGACY-ASSET-9B6FC1ED349F96394497 34–75; LEGACY-ASSET-02D897E62EF2FA267267 41–201; LEGACY-ASSET-D881AF6AFD277B1DE934 1–79; LEGACY-ASSET-658FF8439F9F8E694710 15–42; LEGACY-ASSET-0B5B38F146D9538C9A36 16–46; LEGACY-ASSET-901CD182B52024593E41 1–30 |BBG/BBRのfailure-pattern、independent-episode、near-miss意味を参照再利用し、候補範囲/episodes意味を固定L2-015から再導出する。頻度thresholdと旧Bot runtime/authorityは移さない。 |
| `016` | `MPR-RC-HELIXINTELLIGENCE-L2-016-003` Stage 3 / 1.0 | L2 138–143; L11 77, 146, 169 | LEGACY-ASSET-02D897E62EF2FA267267 41–201; LEGACY-ASSET-17C4BF78919578FEBB18 129–160; LEGACY-ASSET-D881AF6AFD277B1DE934 1–79; LEGACY-ASSET-0B5B38F146D9538C9A36 16–46; LEGACY-ASSET-F46AB11BD14F2C0469F4 1–53; LEGACY-ASSET-901CD182B52024593E41 1–30 | BBR-R03–R05のrepair proposal/write-set/recovery/post-check境界を意味の起点として再利用し、untrusted candidateとactual resultの区別を固定L2から再導出する。旧実行runtime・authorityは置換し、現行へ移さない。 |
| `018` | `MPR-RC-HELIXINTELLIGENCE-L2-018-003` Stage 3 / 1.0 | L2 144–149; L11 78, 146, 170 | LEGACY-ASSET-28FB139B26CD61CC51EE 21–148; LEGACY-ASSET-02D897E62EF2FA267267 41–201; LEGACY-ASSET-A952A3A175EB82A4781B 19–46; LEGACY-ASSET-0B5B38F146D9538C9A36 16–46 |再利用historical cohort/time-series separation. Current/historical labelsとLABO/OS/target-owner dutiesを再導出し、old self-improvement adoption loopを置換対象。 |
| `019` | `MPR-RC-HELIXINTELLIGENCE-L2-019-003` Stage 3 / 1.0 | L2 150–155; L11 79, 146, 171 | LEGACY-ASSET-9114D4E463E95B67DD0C 47–137; LEGACY-ASSET-899A61905AFBC415F595 34–53; LEGACY-ASSET-C6ADB99F1353965C5449 18–60 |旧BRAIN専用同一要件なし。隣接worker/memoryは用語照合だけに再利用し、Pattern/Unit/Part適用とBRAIN/LABO backflowは固定L2から再導出、BRAIN runtime/writebackは移さない。 |
| `020` | `MPR-RC-HELIXINTELLIGENCE-L2-020-003` Stage 3 / 1.0 | L2 156–161; L11 80, 146, 172 | LEGACY-ASSET-E78B8D68CC327AA00991 26–90; LEGACY-ASSET-335176749F6322C3CD8D 35–58; LEGACY-ASSET-AD746F4F3487103519F9 16–33; LEGACY-ASSET-879D95C07B789C9502CF 15–43 |Product Coreのrequirement/design/acceptance meaningとbackflowの旧sourceは意味比較の起点として再利用し、現行L2-020の差分候補と正本owner境界へ再導出する。旧Product Core変更runtime・authorityは置換し、INTELLIGENCEから直接変更しない。 |
| `067` | `MPR-RC-HELIXINTELLIGENCE-L2-067-001` Stage 3 / 1.0 | L2 466–490; L11 199, 197 | LEGACY-ASSET-50CA1C554747F12266D3 663–666; LEGACY-ASSET-28FB139B26CD61CC51EE 21–148; LEGACY-ASSET-9114D4E463E95B67DD0C 47–137; LEGACY-ASSET-437A6A68F9A9E0AE1B9E 43–43; LEGACY-ASSET-A952A3A175EB82A4781B 19–46; LEGACY-ASSET-C6ADB99F1353965C5449 18–60 |再利用RLO-FR-040/AC-030のscope-bound effort/evidence atomsとBench comparisons。PO採択L2-067でsource applicability/priority decision and existing LABO 034 handoffへ再導出し、old ranker/route/worker executionは置換対象。 |
| `072` | `MPR-RC-HELIXINTELLIGENCE-L2-072-005` Stage 3 / 1.0 | L2 561–598, 673–687; L11 289–314, 398–434 (6 part) | LEGACY-ASSET-719D5EC9C06FC4AAD0FF 81, 147–148; LEGACY-ASSET-A60CF91DD2AF6693E6F9 `requirements.json#/HIL-NFR-34`; LEGACY-ASSET-9114D4E463E95B67DD0C 47–137; LEGACY-ASSET-C6ADB99F1353965C5449 18–60 |再利用HIL-BR-29 versioned pack/shadow/non-force atoms。fixed adopted 005 scopeへINT candidate, HARNESS common contract, OS state, LABO effect separationを再導出し、old placement/runtime/hard gate mechanicsは移さない。 |
| `073` | `MPR-RC-HELIXINTELLIGENCE-L2-073-002` Stage 3 / 1.0 | L2 601–608; L11 317–326 | LEGACY-ASSET-EB3700B0088F311C2295 45–46; LEGACY-ASSET-CAC0C64EB7540180B1FE 20–27, 43, 46 |AAFD-R-04のdetector優先度と直接projection制約は旧候補の意味として参照再利用し、採択PO親L2-009/073のscopeへ再導出する。旧probe/UIL runtimeとissue/CI/merge routeは置換対象。 |
| `078` | `MPR-RC-HELIXINTELLIGENCE-L2-078-001` Stage 3 / 1.0 | L2 646–658; L11 363–382 | LEGACY-ASSET-EB3700B0088F311C2295 55–67, 73–89; LEGACY-ASSET-CAC0C64EB7540180B1FE 20–27, 43, 46 | 再利用AAFD R-06/07/09-12 semantic atoms per bounded old source span; current parent L2-009/012 plus accepted HARNESS-023 dependency classificationへ再導出し、old schema/DB/event runtime/owner assignmentを置換対象。 |

L2-072のPO digestは列挙順6 partの個別raw spanに結び、単独全文hashで代替しない。L2-073/078の旧candidate metadataと後続PO決定は分離する。

### `FR-INTELLIGENCE-L3-001-01` — `HELIXINTELLIGENCE-L2-001`

**要件：Domain identity lifecycle**

新domainの安定identityを付与し、split/merge時は旧identityとの関係を記録し、retire後も参照可能な履歴を保つ。identity語彙を固定enumとして固定せず、別authorityも新設しない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-001-01` 正常成立とtrace**：add/split/merge/retireの各操作と参照履歴を個別に投入し、対象Domainと旧identityの関係が追えること。
- **`AC-INTELLIGENCE-L3-001-02` 個別変異・owner境界**：identity欠落、active domain間のidentity衝突、split/merge後のrelation消失・履歴混同を個別に変異させる。誤ったrelationを候補確定しない。lifecycle候補の評価は固定L2/L11のidentity履歴・authority境界で行い、retire後の履歴を失わせず、固定sourceにないidentity enum/独立authorityも追加しない。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-001-03` held-out正常／局所unknown**：別名の未見domain IDを使う正常例と、split後の片側identity relation欠落例を比較する。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-002-01` — `HELIXINTELLIGENCE-L2-002`

**要件：Domain別能力構成**

各domainについてUnderstand/Plan/Predict/Diagnose/Review/Recommendの適用可否・根拠・未構成を個別に保持する。domainに根拠のない能力を全体既定として補わない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-002-01` 正常成立とtrace**：二つのdomainで異なる能力集合と一つの未構成domainを入力し、設定済み能力だけが適用され、未構成がunknownとして残ること。
- **`AC-INTELLIGENCE-L3-002-02` 個別変異・owner境界**：能力一つの根拠欠落、別domain設定流用、unknownの暗黙true化を独立変異として拒否する。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-002-03` held-out正常／局所unknown**：未見domainを、根拠付き能力だけ設定された正常例と、設定根拠がない能力だけunknownとなる例で分ける。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-003-01` — `HELIXINTELLIGENCE-L2-003`

**要件：Situation Modelのsource結合**

target、要求/設計revision、ticket/state、dependency/evidence/finding、worker/model/provider/environment、cost/budget/risk/time、known/unknownを各source revisionへ結合する。source truthが優先し欠落/staleを可視化する。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-003-01` 正常成立とtrace**：互いに異なるsource revisionを含む一状況を入力し、全関係がsource identity/revisionへ結び、source値を改変せず再現すること。
- **`AC-INTELLIGENCE-L3-003-02` 個別変異・owner境界**：必須source欠落、stale revision、矛盾値、dependency孤立を個別・併発投入し、推測補完せず該当関係をunknownにする。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-003-03` held-out正常／局所unknown**：未見worker/provider環境でも全source revisionが整合する正常joinと、dependency revisionだけ未取得の局所unknownを分ける。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-004-01` — `HELIXINTELLIGENCE-L2-004`

**要件：観測と推論の区別**

Observed Fact、Derived Interpretation、Hypothesis、Unknownを根拠source/revisionとともに区別し、推論を観測事実へ昇格させない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-004-01` 正常成立とtrace**：sourceに明記された値とそこから導いた解釈、仮説、未取得fieldを同じrecordで分離し、各由来を辿れること。
- **`AC-INTELLIGENCE-L3-004-02` 個別変異・owner境界**：仮説をObserved Factへ変更、source/revision欠落、unknownを成功として扱う変異をそれぞれ検知する。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-004-03` held-out正常／局所unknown**：未見の根拠種別でも出典が特定できる事実は同じ分類契約で保持し、出典未解決の解釈だけunknownとする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-005-01` — `HELIXINTELLIGENCE-L2-005`

**要件：計画candidateの必須関係**

goal/target、prerequisite/dependency/order、並列可能性、期待結果、risk/uncertainty、stop/fallback、必要時に選択されたBRAIN knowledgeのidentity/revision/applicability/provenance/data-use範囲を承認済み要求・現行contract revisionに結ぶ。OS ticket/authorityを生成しない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-005-01` 正常成立とtrace**：承認済みtargetと依存2件を与えた候補で順序・並列・停止条件を明示し、candidate状態のまま返すこと。
- **`AC-INTELLIGENCE-L3-005-02` 個別変異・owner境界**：未承認/stale要求、dependency欠落、fallback欠落を個別変異し、計画を確定せず該当ownerへ返す。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-005-03` held-out正常／局所unknown**：未見dependency構成でもapproved target/current contractが揃う候補は同契約で扱い、stop条件のみ欠ける部分は未確定にする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-006-01` — `HELIXINTELLIGENCE-L2-006`

**要件：予測と実測の分離**

予測ごとにassumption/evidence/uncertainty/falsificationを示し、将来の測定結果・長期効果をLABO評価として分離する。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-006-01` 正常成立とtrace**：同一scopeのevidenceから予測と反証可能条件を作り、後続観測を別LABO recordへ結ぶこと。
- **`AC-INTELLIGENCE-L3-006-02` 個別変異・owner境界**：evidence欠落、反証条件なし、実測を予測値に上書きする変異を検知し、確度を捏造しない。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-006-03` held-out正常／局所unknown**：未見の予測対象でevidence/assumption/falsificationが揃えば同じprediction contractを使い、反証材料だけ不足する範囲をunknownにする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-007-01` — `HELIXINTELLIGENCE-L2-007`

**要件：episode診断とrepair提案の分離**

現在episodeの症状・source・反証を使い、証拠不完全/矛盾ならprobableまたはunknownとする。追加観測・検査の候補とその根拠を返し、長期履歴/効果評価はLABOへ残す。診断からrepair実行やassignmentを生成しない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-007-01` 正常成立とtrace**：同一episode内の複数証拠が一原因を支持する正常例と、診断だけのrepairなし例を区別し、確定範囲とownerを示す。
- **`AC-INTELLIGENCE-L3-007-02` 個別変異・owner境界**：単一相関、矛盾証拠、欠落sourceを個別/併発で投入し、root cause断定・repair実行・長期評価を発生させない。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-007-03` held-out正常／局所unknown**：未見episodeでもsourceが一致する活動中diagnosisは評価し、反証sourceが未取得の原因候補だけprobable/unknownに留める。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-008-01` — `HELIXINTELLIGENCE-L2-008`

**要件：revision-bound review finding**

findingにtarget revision/scope/evidence/reproduction/counterexample/severity候補/routeを結び、review結果単独でmerge/requirement/release/acceptanceを変更しない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-008-01` 正常成立とtrace**：一致するtarget HEADと再現可能なfindingを入力し、証拠・counterexample・routeを同一revisionへ結ぶこと。
- **`AC-INTELLIGENCE-L3-008-02` 個別変異・owner境界**：HEAD/scopeずれ、再現欠落、反例の隠蔽を別々に投入し、findingを受入やmerge状態へ昇格させない。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-008-03` held-out正常／局所unknown**：未見finding種別でもtarget revisionと再現材料が揃えば同じreview contractで扱い、counterexample未取得部分は未確定とする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-009-01` — `HELIXINTELLIGENCE-L2-009`

**要件：全体監査findingの追跡**

authority mismatch、design/runtime mismatch、stale assumption、missing evidence、invalid projection、responsibility leak、unsupported behavior、repeated failure、mechanism-boundary violation等のaudit findingをtarget HEAD、authority、producer、evidence、reproduction、falsificationへ型付きで結ぶ。AAFDはcandidate、UIL/TER等の既存責務を再実装しない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-009-01` 正常成立とtrace**：同じHEAD/authorityの監査材料と反証例を入力し、findingと各sourceを往復追跡できること。
- **`AC-INTELLIGENCE-L3-009-02` 個別変異・owner境界**：authority/HEAD/provenance欠落や自由文によるauthority変更を個別に投入し、unknownで止めownerへ戻す。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-009-03` held-out正常／局所unknown**：未見responsibility対象でもHEAD/authority/evidenceが揃う監査findingを同様に追跡し、owner root欠落部分だけunknownにする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-011-01` — `HELIXINTELLIGENCE-L2-011`

**要件：同一scope比較**

共通corpus・responsibility scope・評価条件revisionを揃えてprovider/model候補を比較し、各candidate/currentの実行版は個別に記録する。実行版が候補間で異なることだけでは比較不能とせず、findings・false positives/misses・reproducibility・latency/costを軸別に並べる。winner選定や自動切替をしない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-011-01` 正常成立とtrace**：同一corpus・同一責務scope・同一評価条件revisionへcurrent/candidateの測定結果を結び、各model/provider実行版を個別表示する。candidate間で実行版が異なる正常比較も許し、軸別差と未評価を示すこと。
- **`AC-INTELLIGENCE-L3-011-02` 個別変異・owner境界**：corpus/scope/評価条件revisionの各不一致、実行版欠落、宣言実行版と結果版の不一致を個別に検査し、比較不能範囲を局所化する。実行版の候補間差異だけを不一致扱いしない。winnerや自動swapを出さない。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-011-03` held-out正常／局所unknown**：未見provider pairでもcorpus/scope/評価条件revisionが一致し、各結果がそれぞれ宣言実行版に結び付く場合は、実行版が異なっても比較する。未観測cost軸だけ未評価とする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-012-01` — `HELIXINTELLIGENCE-L2-012`

**要件：不確実性と次の必要情報**

known/probable/uncertain/unknown/contradictoryを根拠とともに表し、次に要る証拠またはowner decisionを示す。unknownはsafe/success/no-issueを意味しない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-012-01` 正常成立とtrace**：既知fieldと不足fieldの混在入力で、既知範囲を保持し不足fieldごとに必要証拠/decisionを示すこと。
- **`AC-INTELLIGENCE-L3-012-02` 個別変異・owner境界**：unknownをsafe/success/no-issueへ写す変異、矛盾を隠す変異を個別に拒否する。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-012-03` held-out正常／局所unknown**：未見状況でも根拠のあるknown範囲は保持し、必要な次証拠が未指定の範囲だけunknownにする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-013-01` — `HELIXINTELLIGENCE-L2-013`

**要件：重要判断trace**

重要判断からinput revisions、rules、BRAIN knowledge、observations、assumptions、model/provider/version、reasoning、uncertainty、rejected alternativesを辿れるようにする。data-use classを保持するがtraining permissionを生成しない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-013-01` 正常成立とtrace**：完全な判断traceを入力し、各参照が該当revisionとdecisionへ結び、必要情報を追跡できること。
- **`AC-INTELLIGENCE-L3-013-02` 個別変異・owner境界**：根拠revision欠落、alternative省略、data-use classからtraining permissionを推論する変異を検知する。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-013-03` held-out正常／局所unknown**：未見判断種別でもsource/rule/model/version/alternativeが揃えば同じtrace、未取得revisionだけunknownにする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-014-01` — `HELIXINTELLIGENCE-L2-014`

**要件：Bot identityとmanifest境界**

Bugbot/Helpbot/Crawler等のBot candidateをINTELLIGENCEとは別identityで記述し、purpose、scope、input、output、allowed action、stop condition、versionの各manifest要素とsource/revisionを結ぶ。scope/判断/stopが限定できない場合は通常の判断candidateへ戻す。実作業は特定目的のWorkerとしてOSが割当て、Bot identity/manifestはauthorityを追加しない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-014-01` 正常成立とtrace**：反復可能で目的/scope/input/judgment/stopが限定されたtaskと、separate Bot identity及びpurpose/scope/input/output/allowed-action/stop/version全欄を持つmanifest candidateを入力する。各欄のsource/適用範囲が追え、OS assignmentなしでcandidate止まりとなること。
- **`AC-INTELLIGENCE-L3-014-02` 個別変異・owner境界**：identity衝突と、purpose/scope/input/output/allowed action/stop condition/versionの各欠落・不一致を個別に照合する。manifest不成立なら通常判断候補へ戻し、OS assignment/実行を派生させない。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-014-03` held-out正常／局所unknown**：未見Bot identityでもbounded manifestとOS assignment stateを区別し、manifest適用scope未解決ならそのscopeだけunknownとする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-015-01` — `HELIXINTELLIGENCE-L2-015`

**要件：反復事象からのBot candidacy**

CI/実行failure historyからpattern、reproducibility、machine detectability、false-positive、scope、repairabilityをそれぞれ根拠付きで評価する。複数episodeの条件を満たさない単発failureは恒久Botへ昇格せず、machine detectabilityまたはscopeがunknownならcandidateで止める。repairabilityは評価対象だが、それだけでBot候補triggerにしない。BBGはtyped input/source-generator-output-consumer境界の隣接起点に限る。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-015-01` 正常成立とtrace**：複数独立episodeのpattern、再現材料、machine-detectability evidence、false-positive evidence、scope、repairabilityを別欄で評価し、欠けた条件を可視化したBugbot candidateを返すこと。単一eventは恒久Bot候補にしない。
- **`AC-INTELLIGENCE-L3-015-02` 個別変異・owner境界**：pattern、reproducibility、machine detectability、false-positive evidence、scope、repairabilityを個別に欠落/反証/異scope化する。repairabilityだけの入力と単一eventも独立fixtureとし、candidate状態と評価不足を分ける。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-015-03` held-out正常／局所unknown**：未見episode群で固定L2の反復scopeとfalse-positive evidenceが揃えば同じ候補判定を行い、対象履歴不足だけunknownにする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-016-01` — `HELIXINTELLIGENCE-L2-016`

**要件：bounded repair candidate**

repair candidateと修復結果の照合を区別する。candidateではtarget revision・actor・write-set・side effect・budget・deadline・retry・impact scope・recoveryを全てsourceに結び、期待効果と境界を記述する。結果評価では既存authority/OS assignment/Worker resultから得た実結果だけを受け、同じtarget/write-set/side effect/budget/recovery境界、成功・失敗・回復/事後検証を照合する。要求/設計/verification obligationの意味差は差分とownerを示して上流へ返し、候補記述を可能なまま確定/実行しない。candidate登録から実行許可は生成しない。旧BBR候補は比較起点に限る。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-016-01` 正常成立とtrace**：candidate inputで9束縛（target revision, actor, write-set, side effect, budget, deadline, retry, impact scope, recovery）と期待結果を明示する。別fixtureで既存authority/OS assignmentに対応するWorker resultを受け、実target差分・write-set内外・side effect・実budget/deadline/retry結果・recovery/post-checkをcandidateの宣言と照合する。候補生成は結果検証を前提とせず、結果検証は実行/許可を作らない。
- **`AC-INTELLIGENCE-L3-016-02` 個別変異・owner境界**：candidate入力では9束縛を一つずつ欠落/不一致にする。result fixtureではstale target、scope外書込、循環、二重実行、予算超過、不明副作用を個別に投入し、Worker result/after-state/recovery evidenceを観測する。要求/設計/verification obligationの意味差はcandidate上のdiffと上流ownerを示す。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-016-03` held-out正常／局所unknown**：未見targetでも9束縛が揃う場合はcandidateを作り、別に既存assignmentに結ぶresult fixtureがある場合だけ結果照合を行う。candidateの束縛sourceが欠ける場合は既知fieldを保持して適用を確定せず該当source ownerへ返す。actual result/recoveryが欠ける場合はcandidate状態を維持し、結果だけunknownにする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-018-01` — `HELIXINTELLIGENCE-L2-018`

**要件：現在判断と長期効果の境界**

現在のINTELLIGENCE判断とLABOのhistorical effectを別に保持する。OSはproposalを登録し、対象ownerが意味変更を判断する。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-018-01` 正常成立とtrace**：同じ方法のcurrent proposalと複数時点のLABO測定を入力し、時点/scope/ownerを保持して別statusで表示すること。
- **`AC-INTELLIGENCE-L3-018-02` 個別変異・owner境界**：古い効果をcurrent truthへ昇格、INTELLIGENCEが自己改善を採択、owner判断なしの変更を起こす変異を拒否する。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-018-03` held-out正常／局所unknown**：未見期間のLABO historyでもsource/scopeが揃う範囲をcurrent proposalから分離して示し、historical sourceのscope/時点の欠落は該当評価だけunknownとしてLABOへ照合を戻す。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-019-01` — `HELIXINTELLIGENCE-L2-019`

**要件：BRAIN applicability candidate**

BRAIN知識の適用性を根拠付きcandidateとして評価し、knowledgeの正本はBRAIN、汎用評価はLABOへ戻す。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-019-01` 正常成立とtrace**：Pattern/Unit/Partのsourceと対象scopeが揃う例を候補評価し、適用根拠をBRAIN sourceへ結ぶこと。
- **`AC-INTELLIGENCE-L3-019-02` 個別変異・owner境界**：domain/scope不一致、根拠不足/非current、candidateからknowledge採用状態生成、INTELLIGENCEによるBRAIN knowledge書換え、LABO評価の代行を個別に拒否する。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-019-03` held-out正常／局所unknown**：未見Pattern/Unit/PartでもBRAIN sourceと適用scopeが一致する正常候補を評価し、source欠落部分だけunknownとしてBRAINへ戻す。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-020-01` — `HELIXINTELLIGENCE-L2-020`

**要件：Product Core meaning/backflow candidate**

Product Coreのrequirement/design/acceptance/product meaningとの意味整合・backflow候補をsource/target revision付きで示し、これらの正本変更は該当上流ownerに残す。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-020-01` 正常成立とtrace**：同一Product Core meaningと対象revisionの差分proposalを入力し、参照根拠・差分・戻し先ownerを示すこと。
- **`AC-INTELLIGENCE-L3-020-02` 個別変異・owner境界**：meaning source欠落、別product identityの流用、owner不明、異版を同一視、INTELLIGENCEが要求/design/acceptance authority/固有meaning正本を直接変更する変異を拒否する。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-020-03` held-out正常／局所unknown**：未見Product Core対象でも双方のmeaning revisionが揃う差分候補を扱い、片側revision未解決ならその差分だけunknownとする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-067-01` — `HELIXINTELLIGENCE-L2-067`

**要件：既決品質/順序入力のproposal反映**

すでに決定済みのquality/order inputとLABO evidenceをscope-boundに既存L2-010 proposalへ反映する。新router/ranker/assignmentは作らない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-067-01` 正常成立とtrace**：決定済みの優先入力・適用scope・LABO evidenceを既存proposal contractへ渡し、適用可能性と根拠を追跡できること。
- **`AC-INTELLIGENCE-L3-067-02` 個別変異・owner境界**：未決入力、異scope、LABO evidence欠落を別々に変異し、新しい順位決定やassignmentを生成しない。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-067-03` held-out正常／局所unknown**：未見のquality/order inputでも既に決定済みでL2-010 scopeに適合すれば既存proposalへ反映し、未決/異scopeだけ未確定にする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-072-01` — `HELIXINTELLIGENCE-L2-072`

**要件：versioned judgment-pack candidate**

judgment packのversion/applicability/shadow/review/rollback義務を示し、強制適用しない。HARNESS/OS/LABO ownerと3.0 learning境界を保持し、`MPR-RC-HELIXINTELLIGENCE-L2-072-004`の登録4 partと`MPR-RC-HELIXINTELLIGENCE-L2-072-005`の追加2 partを別々に追う。これはHELIXINTELLIGENCE-L2-004/-005親とは別の登録IDである。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-072-11` 6-part親保持**：6-part保持に加えて、採択済みB配置と1.0 candidate-generation/shadow評価境界を適用する。常時必要なL2-001/002の選択domain identity/capability構成を照合する。新しい実験を選ぶ場合だけHELIXLABO-L2-006のOS割当Worker・結果対応を適用し、system化/operation配分を評価する場合だけHELIXLABO-L2-007の条件を適用する。未選択の新規実験を毎回要求せず、効果評価ownerをLABOに残す。selected sourceのruntimeが同じ/異なることだけで独立性を判断しない。AC-072-02と02tの併発例に代えて、依存missing/stale/unsupported版、reference-onlyの依存昇格、domain/capability非結合、default-checklist fallback、comparison-condition mismatch、候補を判断結果とする誤り、再評価後normalを独立CASEで照合する。PO採択済み6-part登録（`MPR-RC-HELIXINTELLIGENCE-L2-072-004`の4 partと`MPR-RC-HELIXINTELLIGENCE-L2-072-005`の2 part）を個別に保持する。登録`MPR-RC-HELIXINTELLIGENCE-L2-072-004`の既存4-part/shadow layoutと登録`MPR-RC-HELIXINTELLIGENCE-L2-072-005`のselected-source stale facetを一つの条件へ畳まず、後発PO追加partは追加判断記録のexact sourceに結ぶ。6-part保持自体をこのACへtraceする。
- **`AC-INTELLIGENCE-L3-072-01` 正常成立とtrace**：適用scopeとpack revisionが一致するshadow candidateを入力し、review/rollback条件とnon-force状態、072-004と072-005登録の各partを保つこと。
- **`AC-INTELLIGENCE-L3-072-02` 個別変異・owner境界**：stale applicability、review欠落、rollback根拠欠落、forced state、072-004/072-005登録partの混同を独立に変異する。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-072-03` PO固定6-part追跡**：PO採択digest `sha256:d8376dc314dc4aebe7b413a40d4855e3147d6e5ec870d9790395825c5f8cc775`を、`docs/governance/decisions/po-decision-2026-10-03-additions10.md`の合成規則どおり6 partの正規化bytes（各末尾空行を除いてLF終端、列挙順、part間区切りなし）から再現する。partは順に、(1) L2 original `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:561–589` `sha256:a828bff2126dfe8b029c75ff922f4b52613e6aa48cd957a3f8056be635b97dd2`（004のpack candidate scope/version/依存）、(2) L2 supplement同path`:592–598` `sha256:08d3915feb65dfe071ce69f56fb97070822e08e5cd7f30a92b4d42e22953cf8b`（pack構成/FR57・58の保持・版境界）、(3) L11 original `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:289–303` `sha256:b0a3131940865e2cb30b016ec7232f6f9e40c6cb9fdd20f3974c7654e8a6a31f`（004の前提・正常/失敗/未見oracle）、(4) L11 supplement同path`:306–314` `sha256:8d9514cc6964d617928abe6dacaece211004f754c337fbe8d78bda678ab187c8`（未完正常、同条件比較、独立review、rollback/active、3.0境界oracle）、(5) L2 NFR-34 supplement `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:673–687` `sha256:511c0083b8aaeab292ab348f488367b197516a9faaf92a44a27df1e80c6f21d8`（005の選択source stale意味）、(6) L11 NFR-34 supplement `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:398–434` `sha256:9884a284fbaecc0134936e0b3772871974d5eb24d78c4ebbef22ebf2c6bbb194`（source別 stale/unknown/owner戻しのoracle）。旧004の最初4 partを不変保持し、005の追加2 partを別途traceする。L2/L11のfull-file SHAや単独semantic SHAは補助locatorに限り、6 partの代替にしない。各ACはL2 original/supplementとL11 original/supplementを`AC-INTELLIGENCE-L3-072-01/-02/-06/-07/-08`へ、072-005登録の追加2 partを`AC-INTELLIGENCE-L3-072-05`へ結び、L10 `CASE-INTELLIGENCE-L10-072-01/-02c/-02n..02s/-02-pin-bytes-01..06/-03/-04`でcomposite digest、6 part各々のmissing/bytes mismatch、normal/held-out/unknown oracleを照合する。
- **`AC-INTELLIGENCE-L3-072-04` held-out正常／局所unknown**：未見pack revisionでもapplicability/shadow/review/rollback evidenceが揃う候補を同じcontractで評価し、072-005登録selected-source facetだけstaleならそのfacetの適用を止める。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
- **`AC-INTELLIGENCE-L3-072-05` 選択sourceごとのstale**：scope、requirement、template、skill、model catalog、allowlistの各source tupleについてidentity/revision/digestの単独変異を別CASEにする。各sourceの非選択変更と選択状態unknownも型ごとに別CASEとし、実選択facetだけstale、非選択は未観測、選択状態unknownはunknownとして該当source ownerへ戻す。
- **`AC-INTELLIGENCE-L3-072-06` 構成edgeと競合保持**：同じpackへ重複source edgeを束ねる場合も各identity/version/applicability edgeを保持し、意味の異なるrequirement/evidence/反証/停止条件が競合したときはconflict/unknownと未解決部分を残す。INTELLIGENCEが優先順や意味を創作しない。
- **`AC-INTELLIGENCE-L3-072-07` same-case比較とrollback**：同じ対象scope/revision/case/oracleでcandidateあり/なしのshadow結果を対にし、false-positive/false-negative/unknown/反例とrollback先・戻し条件・rollback evidenceを同じversionへ結ぶ。比較条件不一致やrollback根拠欠落は未完であり、閾値やrollback方式を新設しない。
- **`AC-INTELLIGENCE-L3-072-08` candidate生成と独立reviewの段階分離**：scope/sourceだけでcandidate identity/versionを作成でき、shadow/review receiptが未取得なら後続義務として未完保持する。candidate生成時にshadow/review receiptを事前要求しない。reviewを実施する場合は作成側と異なるreviewer identity/context/authority/routeを個別に照合する。作成側が起用したsubagentは独立reviewerに数えない。provider/modelの一致だけで独立性を否定/肯定しない。identity/context/authority/routeの一致はそれぞれ単独で独立reviewを不成立にする。validな既存shadow/evaluation evidenceが同じscope/revision/case/oracleに適用できる場合は再利用でき、新しいWorker実験を毎回要求しない。1.0でfinding/reversal/retry/escaped defect/skill efficacyからpackを自動改善しない。BRAIN知識は実際に選択したときだけsource identity/revision/applicability/provenance/宣言互換範囲を照合し、非選択なら要求しない。全証拠完了後も既存ownerの採択記録なしにactive/gateへしない。at-least-once deliveryの重複は別候補/episodeとして数えず、同一入力の重複受信を重複拒否CASEで照合する。runtimeの同一/相違だけで独立性を決めず、他の明示された独立性条件を照合する。
- **`AC-INTELLIGENCE-L3-072-09` dependency closure**：採択済HARNESS-L2/L11-023に従い、pack identity/revision、HARNESS-010/011契約revision、dependency identity/owner/版range/4区分/条件/対象operation/selected sourceをscopeとauthority/evidenceへ結び、常時必須＋成立した操作条件＋選択sourceだけでclosureと適用理由を再現する。falseと明示された条件依存はclosure外、unknown/staleはfalseや参照のみへ変換せず該当operationを保留する。同一入力closure正常は`CASE-INTELLIGENCE-L10-072-02-dependency-closure-normal`、分類・fallback/conditionのnegativeは`CASE-INTELLIGENCE-L10-072-02-condition-*`/`02-source-fallback-reject`で照合する。
- **`AC-INTELLIGENCE-L3-072-10` closure誤分類・戻し先**：必須依存欠落、選択source不一致、条件unknown、stale/未対応版、参照資料の依存昇格、選択sourceからのfallbackを個別に拒否する。pack contract不足はHARNESS、実際に選択したsourceの適用性は該当source owner、BRAIN知識はBRAIN、shadow/effect evidenceはLABOへ戻し、owner不明はunknownに残す。対応個別CASEは`CASE-INTELLIGENCE-L10-072-02-condition-unknown-hold`、`02-source-fallback-reject`および型別selected/nonselected/unknown群で追跡する。
### `FR-INTELLIGENCE-L3-073-01` — `HELIXINTELLIGENCE-L2-073`

**要件：AAFD R-04検出境界**

旧AAFD-R-04の「決定論的検出器の優先」は順位値/priority enumの宣言ではなく、Agentic Audit Probeが既存UIL deterministic detectorを置換しない意味として固定L2/L11へ再導出する。未知finding探索の自由文単独からIssue・Requirement・CI・merge authorityへ直接投影せず、finding/candidateの提示と未判断状態を保持する。

- **`AC-INTELLIGENCE-L3-073-01` 正常成立とtrace**：既存detectorの役割・結果を保持し、探索自由文のcandidate提示と4宛先への非投影を各々照合する。別途適格根拠とownerの独立判断が揃う既存経路はその既存条件に従い、一律禁止や新gateを作らない。
- **`AC-INTELLIGENCE-L3-073-02` 個別変異・owner境界**：detector置換、自由文単独からのIssue作成/更新・Requirement本文/承認状態変更・CI定義/実行要求/結果状態変更・merge authority/admission/状態変更を独立に拒否する。根拠不明はunknownのfinding/candidateとして既存ownerへ提示し、宛先ownerを特定できなければ推測しない。検出/qualificationはUIL、要求意味は上流、CI/verificationは既存OS/HARNESS、review/mergeは現行GitHub経路に残す。
- **`AC-INTELLIGENCE-L3-073-03` 未見正常／局所unknown**：既知fixtureとは別の未知finding文でもdetector非置換と4宛先の非投影を別々に照合する。欠けた根拠だけunknownを維持し、candidate提示と成立した他のsourceを保持する。未見性自体で拒否せず、新しいpriority宣言や数値条件を作らない。

### `FR-INTELLIGENCE-L3-078-01` — `HELIXINTELLIGENCE-L2-078`

**要件：AAFD delta意味・再現性・境界**

固定親R-06/R-07/R-09/R-10/R-11/R-12のdelta意味、同入力再現、snapshot join、影響範囲限定invalidation、stale/unknown/missing時のwrite抑止、journal replayを、親に列挙されたsource identity/revision/digestへ結びつけてcandidate化する。POのA案限定範囲を保ち、後続処理のowner・経路は未確定のまま残し、提案から要求・設計・割当を直接変更しない。あわせて採択済HARNESS-L2/L11-023に基づくeffective dependency closureを、delta exact set/digestとは別oracleとして同じpack/dependency/operation/scope/source/authority/evidence入力から再現する。closureは常時必須・成立した操作時必須・実際に選択したsource依存だけを含み、条件不成立、未選択、参照のみ、unknown/staleを別状態に保つ。保存schema、物理column、field名、digest encoding、runtime、producer/consumer/owner assignmentは新設しない。古いL2本文の「未採択候補」metadataは対象revisionの状態根拠ではなく、later35のexact PO decisionを読む。

**受入条件**

- **`AC-INTELLIGENCE-L3-078-01` R-06 delta意味**: 変更次元を authority / responsibility / runtime / provider / dependency / security / verification / capacity / cost / migration / release の11個として区別する。各次元について前状態と観測状態、そのsource receipt revision/digest、対象HEAD/authority/environment identity、affected responsibility、evidence/counterevidence、confidence/unknown、invalidation exact set、re-synthesis要否を意味要素として保ち、stable IDとdelta digestを別々に照合し、存在しない値を埋めない。各dimensionのnormal・missing・unknown・stale・mismatchを個別CASEで評価する。
- **`AC-INTELLIGENCE-L3-078-02` R-07 再現・重複拒否**: 同一source receipt/registry/policyならdelta exact set/digestを再現する。at-least-onceの重複受信は別delta/episodeにしない。stale revision、wrong HEAD、wrong authority、missing receipt、duplicate changeはそれぞれ単独変異CASEで拒否し、retryやevent順序変更で別episodeを増殖させない。
- **`AC-INTELLIGENCE-L3-078-03` R-09 snapshot join**: delta source identityと同一identity/revision/digestを持つF0 snapshotだけを一致として扱い、不一致・stale・不足はstale/reobservation requiredへ分ける。
- **`AC-INTELLIGENCE-L3-078-04` R-10 限定invalidation**: affected Future Type/assumption/projection/directiveのexact setだけをstaleにし、unaffected projectionを保つ。構造変更はproposal-onlyとしcurrent-write parkingを解除しない。
- **`AC-INTELLIGENCE-L3-078-05` R-11 stale/unknown/missing時抑止**: stale directive、unresolved unknown、missing source receiptそれぞれからassignment/release/retire/requirement write/design writeを出さない。R-08 non-write境界へ畳まない。
- **`AC-INTELLIGENCE-L3-078-06` R-12 journal replay**: repository authority/event journalからdelta/invalidation/intake projectionを再構築する同一event集合の順序変更でもexact set/digestを比較する。DB喪失後も同じjournalから同じprojection/digestを再構築する義務を照合し、DB種別・実装は固定しない。
- **`AC-INTELLIGENCE-L3-078-07` 未見正常／局所unknown**: 未見snapshot/eventでも必要identity/receipt/authorityが揃う範囲を同じ親oracleで扱い、欠けたpartだけunknownとする。
- **`AC-INTELLIGENCE-L3-078-08` dependency closure正常再現**：fixed L11-078の依存宣言field全体から、常時必須＋成立したoperation condition＋selected sourceのclosureと各適用理由を導く。operation/source選択が異なる場合は適用範囲だけ変え、同一入力でclosure memberまたは理由が変わらない。R-07 delta digestのoracleと混同しない。個別正常CASEは`CASE-INTELLIGENCE-L10-078-08-closure-same-input`。
- **`AC-INTELLIGENCE-L3-078-09` closure欠落・unknown・stale**：各dependency宣言fieldの欠落/unknown/staleを個別変異する。該当operationだけ保留し、必要条件をnon-applicable/reference-onlyへ再分類せず、他の成立fieldと常時依存を保つ。field別CASEは`CASE-INTELLIGENCE-L10-078-08-closure-<NN>-<state>`で識別する。
- **`AC-INTELLIGENCE-L3-078-10` closure分類とfallback拒否**：条件unknownをfalse扱い、selected sourceを除く/別sourceへfallback、staleまたは未対応contract版を読み替える、reference-only資料をdependency化、unselected sourceをqualified扱いする各例を別々に拒否する。区分誤り/fallbackとR-07〜R-12の独立CASEは`CASE-INTELLIGENCE-L10-078-08-closure-*`および`CASE-INTELLIGENCE-L10-078-09-r07/r09/r10/r11/r12-*`で親条件ごとに識別する。
- **`AC-INTELLIGENCE-L3-078-11` source scope・非直接変更**：不足/不一致は影響fieldだけunknown/incompleteとして保持し、固定source/責務上の既存ownerが特定できる場合はそこへ戻す。ownerをsourceから特定できなければowner名を作らずunknownを残す。PO限定Aを保ち、fresh/resolved/receipt済みでも直接変更0件を維持する。R-06/R-07/R-09–12のsource scopeは旧source実spanに限る。
### Stage 3 — 固定L11追補の受入条件（#2607 review01補正）

以下は既決L2/L11の同一親に含まれる受入oracleを明示する補足で、要求の版・owner・意味を変更せず、数値gateも追加しない。001/002はL11 R2187-01、003–020はL11 G12および共通判定146、011はさらにG13、067/072/073/078は表記した固定L11範囲を用いる。001–020でHARNESS-L2-010/011 pack契約を実際に消費する操作は、contract identity、contract/artifact/dependency version、適用compatibility rangeをnormal入力で結び、各欠落・stale・不一致は個別にunknown/未完としてpack ownerへ戻す。packを消費しない操作へ依存を追加しない。単独親の成功を接続成功とせず、005のOS ticket、006のLABO実測、018のLABO/OS登録等は該当固定L2/L11の別条件として判定する。

| 親 | 追加AC | 固定oracleと判定範囲 |
|---|---|---|
| `001` | `AC-INTELLIGENCE-L3-001-04` | 固定 `L2 48–53; L11 62, 146, 264–265`: 責務を勝手に統合しない。明示共有責務だけを共有し、未定義capabilityのownerを作らない。固定enum・独立authorityを導入しない。 |
| `002` | `AC-INTELLIGENCE-L3-002-04` | 固定 `L2 54–59; L11 63, 146, 264–265`: domainごとの能力だけを適用し、全能力を全domainへ広げる変異を拒否する。未構成はunknown。 |
| `003` | `AC-INTELLIGENCE-L3-003-04` | 固定 `L2 60–65; L11 64, 146, 156–157`: 別ticket dependencyを混ぜず、field欠落/順序変化を保持し、一覧・traceの存在だけで成功としない。modelをauthorityとして扱う変異を拒否する。 |
| `004` | `AC-INTELLIGENCE-L3-004-04` | 固定 `L2 66–71; L11 65, 146, 157–158`: unknownを事実で補わず、別source表現の同じ根拠関係を許す。Derived InterpretationをObserved Factへ変換する誤りを拒否し、分類基準が未定なら判定不能として基準を人へ戻す。 |
| `005` | `AC-INTELLIGENCE-L3-005-04` | 固定 `L2 72–77; L11 66, 146, 158–159`: A→Bの依存順と循環拒否を保ち、current state source欠落とstale contractを未完とする。ticket発行/割当の権限を持たず、欠けたOS ticket情報は固定L2/L11上のOS側へ戻す。必要時に選択されたBRAIN knowledgeの根拠不足は当該knowledge ownerへ戻し、未選択時に依存を要求しない。 |
| `006` | `AC-INTELLIGENCE-L3-006-04` | 固定 `L2 78–83; L11 67, 146, 159–160`: target/scope/windowを先に固定し、assumption/uncertainty欠落・根拠なし確定化・current source staleを個別にunknownとし、後続実測を別LABO recordで比較する。不一致/missing/stale/scopeずれは成功扱いせずunknown。予測を実測事実へ昇格させず、実測値で事前predictionを上書きしない。LABO送達は別条件。 |
| `007` | `AC-INTELLIGENCE-L3-007-04` | 固定 `L2 84–89; L11 68, 146, 160–161`: 追加観測・検査へ辿れること、反証無視・無関係検査指示を拒否すること。episode identity不一致とsource revision staleを個別に拒否して該当source ownerへ戻す。repair判断/実行はL2-007にないのでINTからOSへ生成しない。 |
| `008` | `AC-INTELLIGENCE-L3-008-04` | 固定 `L2 90–95; L11 69, 146, 161–162`: review対象範囲に従いTP/FN/FPを分類し、scope外は未評価。seeded must-fix見逃し、clean artifact誤指摘、severity誤り、反例誤結合、route誤りをそれぞれ個別に拒否。 |
| `009` | `AC-INTELLIGENCE-L3-009-04` | 固定 `L2 96–101; L11 70, 146, 162–163`: 固定L2のfinding型を保持し、producer identity欠落、reproduction欠落、falsification欠落を個別に未完として該当source ownerへ戻す。UIL/TER/Future Synthesisの重複実装・根拠なしfinding・別finding反証結合を拒否。 |
| `011` | `AC-INTELLIGENCE-L3-011-04` | 固定 `L2 108–113; L11 72, 146, 164, 198`: task snapshot、scoring version、run protocol、hardware class、独立oracle、cache/人介入、costのprice basis/currency/time/billing categoryを個別保持。rescue/rework/intervention、condition/cohort、priority/toleranceなしの勝敗、欠測costを0化、price単独優位を拒否。current/candidate実行版は各々記録し、同一版を要求しない。 |
| `012` | `AC-INTELLIGENCE-L3-012-04` | 固定 `L2 114–119; L11 73, 146, 165`: uncertainをprobable/knownへ縮めず、閾値未決は判定不能として既存ownerへ戻す。missing fieldの補完済み偽装を拒否し、staleと相反証拠を個別に保持。 |
| `013` | `AC-INTELLIGENCE-L3-013-04` | 固定 `L2 120–125; L11 74, 146, 166`: sourceにない事実・異版source・完全再生成なしを理由に根拠を省かない。observationとassumptionを混同せず、model/provider/version・reasoning・uncertaintyの各edge欠落を個別にunknownとする。source/version/data-useを保持。 |
| `014` | `AC-INTELLIGENCE-L3-014-04` | 固定 `L2 126–131; L11 75, 146, 167`: 反復可能taskを入力し、scope外操作・停止後実行・manifest authority追加・Bot追加によるauthority推論を個別拒否。manifest不足は通常INTELLIGENCE判断candidate、assignment/evidence不足はOSへ。 |
| `015` | `AC-INTELLIGENCE-L3-015-04` | 固定 `L2 132–137; L11 76, 146, 168`: 非該当near-missを変異した過検出と別の実装表現のheld-outを分ける。候補で停止し昇格しない。独立episodeの意味だけを照合し数値回数thresholdを設けない。 |
| `016` | `AC-INTELLIGENCE-L3-016-04` | 固定 `L2 138–143; L11 77, 146, 169`: untrusted candidate境界を保ち、登録から包括write権限を得ず、seeded反例を修正し、既存正常回帰を検査し、scope外/新種は未評価。actual result欠落は結果のみunknown。 |
| `018` | `AC-INTELLIGENCE-L3-018-04` | 固定 `L2 144–149; L11 78, 146, 170`: LABO評価だけで採択せず、OS登録を省かない。遅延/順序逆転outcomeを保持し、current conflict/時点欠落を未完として既存ownerへ戻す。 |
| `019` | `AC-INTELLIGENCE-L3-019-04` | 固定 `L2 150–155; L11 79, 146, 171`: applicability/exception/counterexampleの各条件を別に成立確認し、counterexample成立中は適用しない。 |
| `020` | `AC-INTELLIGENCE-L3-020-04` | 固定 `L2 156–161; L11 80, 146, 172`: 戻し先は意味を変える層に一致させ、誤ownerへ送らない。 |
| `067` | `AC-INTELLIGENCE-L3-067-04` | 固定 `L2 466–490; L11 199, 197`: decision expiry/conflictを識別し、有効decisionを毎run再確認しない。LABO035→INT034 contract version/compatibility/result receiptを確認。quality gateを先に判定し相殺しない。cost/human timeを0化せず、condition/cohort軸とno-Harnessを分ける。不明oracleはHARNESS/requirement ownerへ戻す。 |
| `073` | `AC-INTELLIGENCE-L3-073-04` | 固定 `L2 601–608; L11 317–326`: Requirement identity/revision、CI result、merge-operation authorityを個別に保ち、4 destinationへの恒久禁止を一括化せず個別に照合する。detectorは置換しない。 |

各補足ACの対CASEはFVの「#2607 review01個別補正fixture」表に同じAC IDで列挙する。NFRはそれらの既存機能oracleを測定対象に結び、独立thresholdは追加しない。
