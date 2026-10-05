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


## Stage 5 — 採択済みHELIXINTELLIGENCE-L2 9親の起草範囲

状態: 本追補はStage 5対象のL3起草候補・未実行の検証設計であり、独立reviewやL3承認、実装・実行・releaseを生成しない。採択対象は `HELIXINTELLIGENCE-L2-060/061/062/063/069/070/071/074/077` の各 `version_target: 1.0`。060–063・069–071はMPR-RC `-002`、074は`MPR-RC-HELIXINTELLIGENCE-L2-074-002`、077は選択適用範囲を持つ`MPR-RC-HELIXINTELLIGENCE-L2-077-001`を、それぞれG0と該当PO判断の固定行へ結ぶ。069–071のL2は採択済みStage 5親であり、未承認という記述をL2採択状態へ読み替えない。未承認なのはこのL3 draftである。

旧HELIXのL3 layer definition、親ごとの旧L3 sourceとpaired consumerの受入形をsource起点にし、項目別の保持・意味再導出・置換は各FRへ示す。旧L3/L10のID、provider・runtime・旧workflow・採否/approval運用は移さない。旧pair artifactは設計材料であり実行証拠ではない。固定L2/L11の意味、対象、owner、版、scopeを越える依存や一括Stage完了gateを作らない。

### FR-INT-060 — 根拠付き自動開発計画候補（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-060`、親L1 `HELIXINTELLIGENCE-L1-005`、`version_target: 1.0`。固定source: L2 5acae384:354–359、L11 rows 114/158/281、PO decision 2026-09-28 row 90、G0 `MPR-RC-HELIXINTELLIGENCE-L2-060-002`。
- 責務: INTELLIGENCEは承認済み要求・HARNESS工程contract・現状・BRAIN知識から根拠、依存、停止条件付きplan candidateを作る。要求/contract/state/knowledgeは各source owner、ticket・推進・assignmentはOSが持つ。4.0動的workflowを1.0の前提にしない。
- 入出力: source identity/revision/owner/scope、approved requirement state、HARNESS process contract、current OS state、BRAIN applicability、依存/stop条件を入力し、各nodeと根拠・依存・未知・停止理由を結ぶ候補をOSへ渡す。実行可能化、ticket発行、OS state変更は出力しない。
- AC-INT-060-01 正常: CASE-INT-060-01。承認済み要求のA→B依存と独立C、valid HARNESS contract/current state/applicable BRAIN sourceを与え、plan candidateはA前にBを置かずCを独立化し、stop/fallback理由・source traceが固定L11 oracleと一致する。OS ticket発行は別状態のまま。
- AC-INT-060-02 反例: CASE-INT-060-02a〜02fを各一変異とする。未承認requirementを実行可能化、HARNESS contractまたはOS stateをstale化、依存順序を逆転、4.0 workflowを必須化、INTELLIGENCEからticket/assignmentを生成する各変異を拒否し、最初の不成立source/OS ownerへ戻す。
- AC-INT-060-03 未見正常: CASE-INT-060-03。held-out graphで適合済み依存だけを順序化し、独立nodeと停止条件を保つ。
- AC-INT-060-04 unknown/範囲外: CASE-INT-060-04a/04b。source owner/依存の適用性が不明なら該当branchだけをunknownとして保持し、循環・未宣言依存を解決済みに並べず該当source ownerへ返す。
- 旧source: LEGACY-ASSET-02D897E62EF2FA267267 (`universal-improvement-loop-requirements.md:43–59,125–160`)、LEGACY-ASSET-0B5B38F146D9538C9A36 (`universal-improvement-loop-acceptance.md:17–38`)、LEGACY-ASSET-C7F0C3B79CBAA72960BF (`infinity-loop-functional-requirements.md:25–60`)、LEGACY-ASSET-FA8C6E69463183D6A19B (paired `L3-infinity-loop-acceptance-test-design.md:17–40`)、LEGACY-ASSET-5EE032D657C221184B00 (`universal-workflow-ai-judgment-engine.md:31–52,113–145`)、LEGACY-ASSET-6FFD7F4E58066D08B053 (paired `universal-workflow-ai-judgment-engine-acceptance.md:17–34`)。decision proposal、source trace、negative oracleの形を意味再導出する。旧Universal Improvementの自治的lifecycle/route、UWJのinterview/schema、Infinity Loopのprovider/runtimeは現行へ移管せず、本候補の置換対象にも含めない。

### FR-INT-061 — LABO評価根拠に基づくWorker配置proposal（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-061`、親L1 `HELIXINTELLIGENCE-L1-010`、`version_target: 1.0`。固定source: L2 5acae384:360–365、L11 rows 115/163、PO row 91、G0 `MPR-RC-HELIXINTELLIGENCE-L2-061-002`。
- 責務: LABOは作業種別別水準・同scope評価証拠、INTELLIGENCEはtask別配置案、OSは指定・割当てを持つ。price/name/benchmark単独では決めない。task identity、scope、Worker evidence適用性を保ち、実assignmentとproposalを混同しない。
- AC-INT-061-01 正常: CASE-INT-061-01。task capability/tool/domain、複数Worker profileと同task-class/scopeのLABO evidenceを与え、適合理由・除外・未評価・根拠を示したproposalを返しOSへ渡す。
- AC-INT-061-02 反例: CASE-INT-061-02a〜02hを個別変異する。priceのみ、model nameのみ、benchmark値のみで順位確定、別task/scope evidence流用、未評価をqualified化、LABOがassignment、INTELLIGENCEがassignment、またはstale evidenceをcurrent扱いする変異を拒否する。evidence評価/適用不一致はLABOへ、task scope不明はINTELLIGENCEへ、割当不可はOSへ戻す。
- AC-INT-061-03 未見正常: CASE-INT-061-03。未見task/class組合せでも同じ明示capability/evidence scopeだけを照合し、LABO evidenceがなければ未評価のproposalを保つ。
- AC-INT-061-04 unknown: CASE-INT-061-04。未宣言task classまたは互換範囲不明を推測適格化せず、該当scopeをLABO/OSの固定ownerへ返す。
- 旧source: LEGACY-ASSET-9114D4E463E95B67DD0C (`worker-common-contract.md:47–64`)、LEGACY-ASSET-C6ADB99F1353965C5449 (`worker-common-contract-acceptance.md:18–64`)、LEGACY-ASSET-28FB139B26CD61CC51EE (`helix-bench-evaluation.md:30–82`)、LEGACY-ASSET-A952A3A175EB82A4781B (paired `helix-bench-evaluation-acceptance.md:30–41`)。同task条件、評価範囲、重大失敗の非相殺を比較材料として再導出する。旧provider descriptor/CLI/sandbox、blind score、旧採否・価格・admissionを移さず、能力判断はLABO、実割当はOSへ置換する。

### FR-INT-062 — 限定修復の段階別evidence接続（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-062`、親L1 `HELIXINTELLIGENCE-L1-016/017`、`version_target: 1.0`。固定source: L2 5acae384:366–371、L11 rows 283/169、PO row 92、G0 `MPR-RC-HELIXINTELLIGENCE-L2-062-002`。
- 責務: 同じtarget revision/scope上で、SECURITY permission/isolation、Worker execution、HARNESS verification obligation/result、OS acceptanceを独立段階として結ぶ。各ownerの成立は他段階を代替せず、最初の不足段階をそのownerへ戻す。
- AC-INT-062-01 正常: CASE-INT-062-01。全段階のsource/owner/revision/target/scopeが一致する別receiptを順序どおり保持し、最後のOS acceptance inputまで別状態で追跡する。
- AC-INT-062-02 反例: CASE-INT-062-02a〜02hを一項目ずつ変える。permission欠落/actor-scope不一致はSECURITY、Worker result欠落/別targetはWorker execution owner、HARNESS verification欠落はHARNESS owner、OS acceptance欠落はOS ownerへ戻す。receipt順序逆転は全receiptが存在する場合も順序不成立として検出した既存stage ownerへ返し、実際にreceiptが欠ける場合だけ欠落したstage ownerへ戻す。途中段階だけで修復完了をclaimしても後段成立を生成しない。正常な別stage evidenceは保持する。
- AC-INT-062-03 未見: CASE-INT-062-03。未見receipt versionの互換性不明を該当stageだけ保留し、重複receiptは一段階を二度完了させない。
- 旧source: LEGACY-ASSET-02D897E62EF2FA267267 (`universal-improvement-loop-requirements.md:84–120,164–183`)、LEGACY-ASSET-0B5B38F146D9538C9A36 (paired UIL acceptance `:1–46`)、LEGACY-ASSET-C7F0C3B79CBAA72960BF (`infinity-loop-functional-requirements.md:31–60`)、LEGACY-ASSET-FA8C6E69463183D6A19B (paired Infinity acceptance `:1–63`)、LEGACY-ASSET-17C4BF78919578FEBB18 (`product-lifecycle-operations-requirements.md:105–154`)、LEGACY-ASSET-F46AB11BD14F2C0469F4 (paired OPS acceptance `:17–46`)。候補/修正の証拠・各return ownerとfalse-closure反例を意味再導出する。旧terminal, route, runtime, deployment/rollback authorityは適用せず、現行の四段階ownerへ置換する。

### FR-INT-063 — LABO評価/BRAIN知識/現判断/OS実行の循環trace（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-063`、親L1 `HELIXINTELLIGENCE-L1-018/019`、`version_target: 1.0`。固定source: L2 5acae384:372–377、L11 rows 117/170–171/284、PO row 93、G0 `MPR-RC-HELIXINTELLIGENCE-L2-063-002`。
- 責務: episode/source/revision/scopeと時点を維持して、LABO past-effect evaluation、BRAIN general knowledge, INTELLIGENCE current judgment, OS execution, HARNESS process evidenceを結ぶ。effectivenessはLABO、knowledge canonicalはBRAIN、execution/assignmentはOS、process contractはHARNESS。INTELLIGENCEはloop evidenceを結ぶだけで改善採択・正本writeをしない。
- AC-INT-063-01 正常: CASE-INT-063-01。episodeを同一target revision/scopeへ結び、過去評価とcurrent judgmentを別時点で保持し、未完stageとownerを明示する。
- AC-INT-063-02 反例: CASE-INT-063-02a〜02gを独立評価する。INT self-evaluationからlong-term effect確定、INTからBRAIN canonical write、stale LABO resultをcurrent扱い、predictionをactualにする、OS execution未完を完了化、未承認general knowledgeをcurrentize、out-of-order/duplicate resultで別episodeを上書きする各変異を拒否し、LABO/BRAIN/OS/HARNESSの該当ownerへ戻す。
- AC-INT-063-03 未見: CASE-INT-063-03。遅着・別順historical outcomeは元episodeへ結び、current judgmentを上書きしない。applicability unknownはBRAIN/LABOへ戻す。
- 旧source: LEGACY-ASSET-02D897E62EF2FA267267 (`universal-improvement-loop-requirements.md:59–76,162–196`)、LEGACY-ASSET-0B5B38F146D9538C9A36 (paired UIL acceptance `:1–46`)、LEGACY-ASSET-EE5DBACC7F28F7D1F605 (`pillar-functional-requirements.md:154–156,237–242`)、LEGACY-ASSET-44DD86E3DEC09E65EF51 (paired `L3-pillar-acceptance-test-design.md:32–90,91–216`)、LEGACY-ASSET-5EE032D657C221184B00 (`universal-workflow-ai-judgment-engine.md:31–52,113–145`) とLEGACY-ASSET-6FFD7F4E58066D08B053 (paired UWJ acceptance `:17–34`)。before/after effect、fact/unknown、owner distinctionだけを再導出し、旧recipe promotion, memory, runtime loop, approval workflowを置換・実行しない。

### FR-INT-069 — 有限設計modelの条件付き計算（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-069`、unit、`version_target: 1.0`、PO-fixed adopted `MPR-RC-HELIXINTELLIGENCE-L2-069-002`。L2 5acae384:513–527、L11 common/detail rows 213/231–238/251–256、PO row 99、G0をsource pinする。L2-006の既存予測責務を置換せず、HARNESS/Product Core source-owned finite modelの明示規則だけを計算する。
- 常時入力: 許可model identity/revision/digest/owner/scope、schema/rule版、initial state、finite state/edge/process/load rule、scenario identity、単位・境界・data-use条件、停止条件。時間・費用・failure/worker計算の特定operationに限り明示率/単価/通貨/effective time/edge/recovery/schedulerを要求し、不足した数値を作らない。出力はsource/rule-bound trace、計算可能値、assumption・unknown・unsupported・打切りを含むvirtual resultであり実測/設計変更/実resource stateではない。
- AC-INT-069-01 normal queue: CASE-INT-069-01。L2明記の2-step到着5/5、service上限8、`served=min(q+arrival,8)`でbaseline処理5/5・終端q=0/0、load 5/10で処理5/8・終端q=0/2を独立算術oracleと照合する。
- AC-INT-069-02 normal propagation: CASE-INT-069-02。L2明示のDB available→unavailable event、`order_processor requires DB.available` edgeとwaiting/retry規則だけを辿り、edgeのないreporting branchを変更せず、recovery未定義なら復旧を作らない。
- AC-INT-069-03 normal capacity/cost: CASE-INT-069-03。L2明記の18 jobs、worker rate 3 jobs/min、shared DB ceiling 8 jobs/min、worker rate 0.20 credit/(worker·min)、DB rate 0.10 credit/minから、2 workers=6 jobs/min, 3 min, 1.50 credits; 4 workers=8 jobs/min, 2.25 min, 2.025 creditsを再計算する。差分は-0.75 min/+0.525 credits。全数値は固定fixtureの算術oracleで製品閾値/実性能ではない。仮想worker数はOS配置を変えない。
- AC-INT-069-04 反例: CASE-INT-069-04a〜04gを一変数ずつ評価する。未宣言rule/係数を補う、別revisionの率を混ぜる、単位不一致を換算根拠なしに結ぶ、欠落価格を0にする、明示edge外へfailure伝播、recoveryを創作、virtual resultをphysical resultと呼ぶ各変異を拒否し、source/model ownerへ戻す。
- AC-INT-069-05 未見: CASE-INT-069-05。held-out finite state/edge/ruleが宣言範囲内ならtrace/outputを独立算術/graph oracleと照合し、未対応領域のみunknownとする。
- 旧source照合: HELIX-Bench/UIL/OPSの観測、versioned evidence、failure/cost分離は隣接意味として再導出する。設計modelを条件変更して有限計算する旧requirement/runtimeはinventory検索で特定できず、旧`pre-merge simulation`（LEGACY-ASSET-50CA1C554747F12266D3, `resident-lane-orchestration-requirements.md:1114–1124`）はgovernance projection検査のため対象外。有限計算能力はPO原文第3項/G17導出記録と固定L2から意味新規に具体化する。未知外挿や旧runtime移植の根拠にしない。

### FR-INT-070 — CORE入力からLABO consumer受領までの段階別接続（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-070`、connection、`version_target: 1.0`、PO-fixed adopted `MPR-RC-HELIXINTELLIGENCE-L2-070-002`。L2 5acae384:528–543、L11 common/detail rows 213/229–238/251–256、PO row 100、G0。既存L2-033入力、L2-040送達、LABO-024受領と専用CONNECT contractを再利用し、payload/schema/正本を複製しない。
- 段階: 033 CORE input receipt → 069 calculation result → 040 send → LABO-024 consumer receipt。段階ごとにsource/consumer contract version, model/scenario, target scope/window, correlation, simulated-vs-observed statusを保つ。後続receiptはその段階に達する前の入力条件にしない。
- AC-INT-070-01 input: CASE-INT-070-01。許可された同一Product Core source/model revision, scope, 033専用connector contractのinput receiptを保持する。
- AC-INT-070-02 result binding: CASE-INT-070-02。069 resultを同じinput revision/scenarioへ結び、virtual statusとassumption/unknownを保持する。
- AC-INT-070-03 send: CASE-INT-070-03。計算後のresultだけを既存040 contractで送達し、送信receiptを受領receiptと同一視しない。
- AC-INT-070-04 consumer: CASE-INT-070-04。LABO-024のconsumer contract/receiptを送達後の独立段階で結び、LABO評価権限はLABOに残す。
- AC-INT-070-05 反例: CASE-INT-070-05a〜05fを個別評価する。別model/revision/scopeを結ぶ、033 connector/authorityを飛ばす、virtualを実測とする、send receiptだけでLABO受領済みにする、correlation ID違いを同一視、対象source contractがpayloadを運べないために新fieldを黙って追加する各変異を拒否し、Product Core/HARNESS/CONNECT/LABOの原因ownerへ返す。
- AC-INT-070-06 未見: CASE-INT-070-06。未見互換版・遅延/重複/out-of-order receiptは段階/版/相関が一致する範囲だけ結び、欠落・stale・unknownを未受領で保持する。
- 旧source disposition: HELIX-Bench acceptance receipt/versioned cohort、OPS typed receipt/backflow、UIL source identity/evidenceを境界比較として再導出する。これらはCORE→LABOの本connection/schemaを提供しない。現行033/040/024とCONNECTを再利用し、旧integration/authorityは置換する。

### FR-INT-071 — 条件変更・計算・比較のcomposite（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-071`、composite、`version_target: 1.0`、PO-fixed adopted `MPR-RC-HELIXINTELLIGENCE-L2-071-002`。L2 5acae384:544–560、L11 R2187-01 rows 213,239–256、PO row 101、G0。069計算と070送達を束ねるが、単体結果/送達のみでcomposite成立としない。
- AC-INT-071-01 正常: CASE-INT-071-01。L11 finite fixtureで033同一model revisionを固定し、baseline arrivals 5/5とload scenario 5/10、per-step service ceiling 8のqueue oracleを照合する。次にload increase、DB disconnect、virtual worker 2→4を別scenario runとして計算し、変更/invariant、順序付きtrace、queue/bottleneck/blocking state、数値可能時間/費用delta、unknown/unsupported、040 sendとLABO-024 receiptを比較表で結ぶ。worker例ではcompletion 3→2.25 min、cost 1.50→2.025 credits。DB断では明示edgeのorder processだけblockedとなり、recovery未定義を保つ。
- AC-INT-071-02 反例: CASE-INT-071-02a〜02gを各一変異で拒否する。baseline/scenario model revision不一致、同じ比較で単位/係数混在、edge外failure propagation、モデルにないrollback/retry/recovery、virtual worker changeでOS assignment更新、LABO receipt不在の完了claim、unsupported/未定義costを0化する変異はそのscenarioだけを不成立にし、他の独立正常scenarioを止めない。
- AC-INT-071-03 未見: CASE-INT-071-03。held-out finite modelは明示rule範囲内だけoracle照合し、unsupported edge/domainと後続actual receipt欠落を局所unknown/未比較にする。
- 旧sourceとの差分: G17 (HDEC-DESIGN-MODEL-CALCULATION-2026-09-27) はPO第3項の条件付き有限モデル計算を再導出した現行の意味根拠で、旧assetではない。旧source網羅検索は完全不在を証明しない。RLO pre-merge projectionは製品設計計算ではなく、実装移植の根拠にしない。保持は予測・反証・実測比較の目的、変更は有限model/schema/ruleに限定したvirtual calculationである。

### FR-INT-074 — 評価済み返却feedbackの配置proposal入力（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-074`、単体、`version_target: 1.0`、PO-fixed adopted `MPR-RC-HELIXINTELLIGENCE-L2-074-002`、candidate digest `5605649c…71719c`。snapshotのL2「未採択」文はG0・PO row 87の後続採択判断を覆さない。L2 5acae384:609–617、L11 rows 328–335、G0, empty-coverage receiptを束ねる。
- 責務: LABOがtask class/domain, target revision, scope, observation population/window, source completeness, evaluation state付き返却reason/missing input/oracle/reissue evidenceを評価する。INTELLIGENCEは同scopeに適用可能なfeedbackを次回proposalの根拠として引用し、範囲と未評価/不確実性を保つ。OSはticket/reissue/assignmentを所有する。
- AC-INT-074-01 正常: CASE-INT-074-01。評価済み・scope/revision一致のfeedbackを既存L2-010 proposalの入力材料として結び、配置理由と適用範囲を提示するが、feedbackだけでproposal正当性や成功をclaimしない。
- AC-INT-074-02 反例: CASE-INT-074-02a〜02fを個別に評価する。未評価feedbackを適合化、別task/scope/revisionを流用、source completeness欠落を補完、単一feedbackで恒久資格/順位を更新、feedbackからmodel/要求を更新、INTELLIGENCEからticket/reissue/assignmentを発行する変異を拒否し、評価不足はLABO、task/ticket不足はOSへ返す。
- AC-INT-074-03 未見: CASE-INT-074-03。未見reason classはdeclared compatible scope内だけで再利用し、未知/比較不能を適合証拠にしない。
- AC-INT-074-04 unknown: CASE-INT-074-04。window/source completeness/compatibility/owner不明は該当fieldをunknownとしてLABOまたは既存L1/L2 ownerへ返す。返却reason、missing input/oracle、再発行後verification state、母集団/windowと再評価条件をtraceへ保持する。新しいconsumer/ownerは設けない。
- 旧source: LEGACY-ASSET-9114D4E463E95B67DD0C / C6ADB99F1353965C5449 (WCC L3/L10), LEGACY-ASSET-28FB139B26CD61CC51EE / A952A3A175EB82A4781B (Bench L3/L10), LEGACY-ASSET-3A15E5645D2D2A59DFF5 (`execution-ticket-requirements.md:399`, adjacent old ticket source) を比較する。feedback利用は既存L2-010への限定接続として意味再導出し、旧provider/score/admission/reissue controlを再利用しない。

### FR-INT-077 — AAFD qualified delta sourceのidentity・unknown・非write境界（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-077`、unit、`version_target: 1.0`、選択・適用範囲付き採択 `MPR-RC-HELIXINTELLIGENCE-L2-077-001` / digest `885656dd…7d344e`。固定L2 5acae384:635–645、L11 rows 352–361、PO `later35` row 53、G0で対象revisionを束ねる。固定L2本文内の「未採択candidate」snapshot文よりG0/PO decisionを優先するが、選択条件外への意味拡張はしない。
- scope: selected qualified internal/UIL-like or external/TER-like source receiptのidentity/revision/owner/origin typeを分離し、対応範囲内のdelta candidateへ結ぶ。実在するconsumer/route/ownerが明らかでない領域はunknownとして保持し、existing requirement ownerへの照合へ返す。旧UIL/TER/Future Synthesis名を現行機構や新ownerとして作らない。
- AC-INT-077-01 internal source正常: CASE-INT-077-01。qualified internal source receiptをsource owner・revision・origin typeへ束縛し、unknown fieldを埋めずnon-authoritative delta candidateとして提示する。
- AC-INT-077-02 external source正常: CASE-INT-077-02。external receiptも別origin identityとして結ぶ。external observationだけからHELIX defectを確定せず、internal receiptと同一sourceへ統合しない。
- AC-INT-077-03 反例: CASE-INT-077-03a〜03gを一変数ずつ拒否する。unknownを0/neutral/unchanged/observedに補完、internal/external origin swap、未qualified/stale receipt受入、Requirement/Design/Release/Assignmentへの直接write、merge authority/state変化、未特定consumer/routeの新設を許可しない。原因をselected source ownerまたは該当existing L1/L2 ownerへ返す。
- AC-INT-077-04 unseen/unknown: CASE-INT-077-04。新source type・consumer・ownerが未宣言ならunknown/incompleteのまま保持し、未選択reference資料へfallbackしない。
- 旧source: LEGACY-ASSET-EB3700B0088F311C2295 (`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:52–53,71`), LEGACY-ASSET-CAC0C64EB7540180B1FE (paired `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:19–22,39–44`)。AAFD-R-05/R-08のselected-source/origin/unknown/non-write意味を再導出する。旧UIL/TER/Future Synthesisのruntime・route・API/schema・qualification algorithmは現行へ移管せず、本候補の置換対象にも含めない。現行consumer/ownerを推定しない。


#### Stage 5 条件別trace補完（既存9親の範囲）

以下のACは固定L2/L11にある独立条件のtraceを明確にする。既存のFR/ACは保持し、列挙された変異を一つずつ異なるCASEへ対応させる。戻し先は固定親の既存ownerに限り、特定できないfacetはunknownのままにする。

| L3 AC | 独立CASE | 条件・期待される保持/戻し先 |
|---|---|---|
| `AC-INT-060-05` | `CASE-INT-060-05a`–`CASE-INT-060-05i` | approved requirement、HARNESS process contract、current OS state、selected BRAIN knowledgeの各一つだけを欠落させる4例、stop condition欠落、宣言済みstop時に指定されたfallback欠落、dependency cycleと未知依存の各例を独立に判定する。影響するplanだけを未完にし、該当source ownerへ戻す。ticket受領・進行不能はOSへ戻す。 |
| `AC-INT-061-05` | `CASE-INT-061-05a`–`CASE-INT-061-05e` | 未見互換評価、task scope、OS assignment可否、段階別receipt identity/revision、評価理由をそれぞれ独立に変異する。評価互換不明はLABO、task scopeはINTELLIGENCE、割当可否はOSへ戻し、異なる段階のreceiptを同一視しない。 |
| `AC-INT-062-04` | `CASE-INT-062-04a`–`CASE-INT-062-04i` | isolation、repair candidate、target、scope、revision、owner、実行/verification/acceptance stage完了を個別に欠落・不一致にする。各失敗を対応するSECURITY、INTELLIGENCE、Worker、HARNESS、OSの固定stage ownerへ戻し、修復oracle結果をreceipt存在だけで置き換えない。 |
| `AC-INT-063-04` | `CASE-INT-063-04a`–`CASE-INT-063-04h` | LABO評価不足、BRAIN source不明、OS実行未完、historical evaluationによるcurrent state上書き、未承認knowledge候補の一般知識化、遅着/重複結果の別episode適用を個別に判定する。各facetをLABO/BRAIN/OS/HARNESSの既存ownerへ戻す。 |
| `AC-INT-069-06` | `CASE-INT-069-06a`–`CASE-INT-069-06q` | 常時必須のHARNESS010/011 pack identity、contract revision、scope、provenance、選択model/source identity、L2-033 input、003/004/012/013のfact・inference・unknown・traceを各独立fixtureで欠落/不一致にする。該当model/source/contract ownerへ返す。未選択sourceは未観測のままにし、fallbackしない。 |
| `AC-INT-069-07` | `CASE-INT-069-07a`–`CASE-INT-069-07f` | 通常計算で期待値oracleなし、070/040/LABO-024後段receiptなしの正常例を保つ。別に利用者指定verificationで期待値oracleだけ欠落する反例、期限/resource/stop cutoff位置だけ欠落する反例を判定する。通常計算に後段receipt/oracleを追加必須化しない。resource不足/expiry/cutoffは途中結果とその位置を保持する。 |
| `AC-INT-070-07` | `CASE-INT-070-07a`–`CASE-INT-070-07i` | 040 send contract、contract revision、correlation、scope、LABO-024 consumer contract/版、source/model identity、data-use bindingを各単独fixtureで照合する。source/CONNECT/LABOの既存ownerへ戻し、send receiptをconsumer receiptへ昇格しない。 |
| `AC-INT-070-08` | `CASE-INT-070-08a`–`CASE-INT-070-08e` | simulation→actual、predictionとactualの同一source化、後続観測のscope/window不一致、未決閾値の合否化、未選択consumer fieldからの外挿を個別に拒否する。評価/実測責務はLABOに残す。 |
| `AC-INT-071-04` | `CASE-INT-071-04a`–`CASE-INT-071-04j` | baseline/load、DB断、virtual workerの3正常scenarioを別runとして保持し、6つの出力facetと比較bindingをtraceする。比較係数/window不一致、モデルにないretry/recovery、edge外failure、simulationをactual/LABO評価済みとする各反例を独立に判定する。無関係の正常scenarioを停止しない。 |
| `AC-INT-074-05` | `CASE-INT-074-05a`–`CASE-INT-074-05y` | source completeness、window、applicability owner、task属性、scope/evidence/evaluation state、比較可能性、revision、task class、恒久除外、昇格、因果能力差、順位、model更新、要求write、ticket/reissue/assignment/dispatchをそれぞれ単独に変異する。task/ticketはOS、評価/evidence/scopeはLABOへ戻す。 |
| `AC-INT-077-05` | `CASE-INT-077-05a`–`CASE-INT-077-05z` | unknown→0/neutral/unchanged/observedの4例、Requirement/Design/Release/Assignment/mergeへの5直接変更、選択receiptのidentity/revision/origin/owner/qualification各欠落・不一致、stale/read failure、unselected/reference fallbackを個別に判定する。四依存区分を維持し、source qualificationを再実装せず、未特定owner/routeは推測しない。 |

FR-INT-062の固定L11 locatorは行283および169である。FR-INT-063は別親L2-063の固定詳細117/170–171/284を使い、L2-062の条件と混ぜない。FR-INT-077の旧要求source pathは`agentic-audit-future-state-delta-requirements.md`である。旧段階の形式・反例は比較材料として再導出する。旧runtime/route/qualification判定は現行へ移管せず、本候補の置換対象にも含めない。
