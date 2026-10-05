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


## Stage 4 — 採択済み1.0接続15親

状態: 以下はL3承認前の候補要件であり、実装・実行・受入済みを意味しない。対象はPO採択済みHELIXINTELLIGENCE-L2-017/030–041/044/045のみ。指定version_targetは1.0、041はsourceごとに定義する。全Stage3/前Stage完了をgateにしない。旧L3 shared FR/ACとpaired acceptanceのtrace・独立failure oracleを形式起点に再導出し、旧ID、旧runtime/route/approval/CIを移さない。根拠の旧L3定義は`LEGACY-ASSET-F542125805B777D8A56A` (`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-168`)、shared FR/ACは`LEGACY-ASSET-EE5DBACC7F28F7D1F605` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:38-57,134-197,198-307`)、対のtest designは`LEGACY-ASSET-44DD86E3DEC09E65EF51` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32-90,91-216`)。旧sourceごとの再利用/再導出/置換は各節と時点監査へ記録する。

### FR-INT-017 — 限定修復の接続横断境界（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-017`（L2 633bf12行202–206、L11 R2187-01行266）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: 同一target revision/scopeに対するSECURITY permission/isolation・Worker実行・HARNESS検証義務・OS検収の各結果。出力: 境界別の未完/完了状態を保つ統合修復結果。責務: SECURITY permission/isolation; OS/Worker assignment/result; HARNESS obligation; OS acceptance。
- 正常条件: 四段階の各receiptを別source/revision/ownerで結び、操作時のpermission有効性と後日の失効を分離。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-017-01 (正常): 同一target revision/scopeについてSECURITY permission、Worker実行結果、HARNESS検証、OS検収を別々の証拠で受ける。操作時点permissionと後日の失効時刻を区別し、各段階の対応証拠がそろった時だけ完了する。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-017-02 (独立negative): CASE-INT-017-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: 操作時点permission receiptを欠落→SECURITY permission/isolation owner；Worker実行resultを欠落→Worker result owner；HARNESS verification obligationを欠落→HARNESS requirement/verification owner；OS acceptance receiptを欠落→OS acceptance owner；permissionのtarget scopeだけを別scopeへ差し替える→SECURITY permission/isolation owner；実行時点のpermission statusだけを後日の失効statusへ差し替える→SECURITY permission/isolation owner；四段階のsource/revisionを一つへ統合→該当する各source owner；修復candidateに包括write authorityを付与→既存の該当authority owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-017-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-017-03 (未見入力 oracle): 段階receiptの到着順が変わる未見fixtureでもtarget/scopeを照合し、実行時点permissionが当時有効なら後日失効で過去証拠を消さない。段階順そのものを変更/必須化しない。
- AC-INT-017-04 (unknown/範囲外): CASE-INT-017-04a〜04eを独立評価する。field→oracle/owner対応: SECURITY permissionの状態がunknown→SECURITY permission/isolation owner；Worker execution receiptのrevisionがunknown→Worker execution/result owner；HARNESS obligation適用scopeがunknown→HARNESS verification owner；OS acceptance対象revisionがunknown→OS acceptance owner；target scopeが未宣言→OS ticket/assignment owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧System Synthesis stable node/edge identityと部分合成、SYN-AC-001の誤bind変異を意味再導出。旧automation/DB authorityは置換。

### FR-INT-030 — HELIX-HARNESS → Situation Model（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-030`（L2 633bf12行208–215、L11 R2187-01行267）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: 許可されたHARNESS requirement/design revision、process contract、verification obligation、admitted connector contract。出力: source revision付きSituation Model情報。責務: HARNESS source owner; 適用されるCONNECT contract owner。
- 正常条件: 同一HARNESS source identity/revisionの契約と義務を反映しHARNESSを正本ownerとして残す。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-030-01 (正常): 同一HARNESS source identity/revisionのrequirement/designとcontract receiptをSituation Modelへ反映し、HARNESSを正本ownerとして残す。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-030-02 (独立negative): CASE-INT-030-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: HARNESS requirement source identityを欠落→HARNESS source owner；requirement revisionを欠落→HARNESS source owner；design source identityを欠落→HARNESS source owner；design revisionをstaleにする→HARNESS source owner；process contract receiptをstale revisionにする→HARNESS source owner；verification obligationを欠落→HARNESS verification owner；HARNESS source scopeを別operationへ結ぶ→HARNESS source owner；HARNESS source ownerを別ownerへ置換→HARNESS source owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-030-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-030-03 (未見入力 oracle): 宣言済compatibility範囲内の未見version pairのみ同一source契約に接続し、範囲外/未宣言はunknownとしてconnectorを自動選択しない。
- AC-INT-030-04 (unknown/範囲外): CASE-INT-030-04a〜04eを独立評価する。field→oracle/owner対応: HARNESS requirement/design revision fieldがunknown→HARNESS source owner；process/verification contract適用性がunknown→HARNESS verification owner；selected connector contract identityがunknown→該当CONNECT contract owner；declared compatibility外のversion pair→HARNESS source owner；operation scopeが未宣言→HARNESS source owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧SYN exact identity、HARNESS source ownershipとstale receipt oracleを再導出。旧CI projectionは移植しない。

### FR-INT-031 — HELIX-OS → Situation Model（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-031`（L2 633bf12行217–224、L11 R2187-01行268）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: 許可ticket/current state/dependency/evidence、OS source revision、admitted connector contract。出力: OS revision付きSituation Model情報。OSがstate/authorityを保持。責務: OS source owner; 適用されるCONNECT contract owner。
- 正常条件: 同一ticket state revisionとdependency/evidenceを関連づけ、OS stateを変更しない。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-031-01 (正常): OS ticketのstate revisionとdependencyをSituation Modelへ表示し、OS stateは変更しない。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-031-02 (独立negative): CASE-INT-031-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: OS ticket identityを欠落→OS ticket/source owner；ticket state revisionを欠落→OS state owner；dependency evidenceを欠落→OS source owner；遅延state eventをcurrent stateへ誤結合→OS state owner；source scopeを別ticketへ結ぶ→OS source owner；OS authorityをINTELLIGENCEへ移す→OS authority owner；未選択connectorを必須依存として提案へ追加→OS source owner；dependency revisionをstaleにする→OS source owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-031-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-031-03 (未見入力 oracle): 未見state/event valueでも宣言済OS契約内ならticket/revisionに結び渡す。契約外/定義不明の値のみunknownとしてOSへ照会する。
- AC-INT-031-04 (unknown/範囲外): CASE-INT-031-04a〜04eを独立評価する。field→oracle/owner対応: OS ticket/state revisionがunknown→OS source owner；dependency evidence revisionがunknown→OS source owner；selected connector contract identityがunknown→該当CONNECT contract owner；state/event種別が宣言契約外→OS state owner；ticket scopeが未宣言→OS ticket/assignment owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧RLO stale-event/authority分離とuniversal workflowのsource revision shapeを再導出。Issue/event runtime authorityは置換。

### FR-INT-032 — BRAIN → INTELLIGENCE（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-032`（L2 633bf12行226–233、L11 R2187-01行269）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: BRAIN Pattern/Unit/Part、applicability、exception、counterexampleおよびrevision。出力: source-bound INTELLIGENCE判断材料。BRAIN knowledge canonicalを保持。責務: BRAIN source owner; 適用されるCONNECT contract owner。
- 正常条件: 適用条件と反例を同じPattern identity/revisionへ結び、判断材料にする。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-032-01 (正常): Pattern identity/revisionの適用条件と対応counterexampleを判断材料へ併記する。適用scope内でcounterexampleが成立する場合は適用候補にせず、BRAIN knowledgeは変更しない。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-032-02 (独立negative): CASE-INT-032-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: Pattern identity/revisionを欠落→BRAIN knowledge owner；applicability stateをunknownのまま適用済みにする→BRAIN knowledge owner；現在scopeで成立するcounterexampleを除外→BRAIN knowledge owner；exception scopeをPattern scopeと不一致にする→BRAIN knowledge owner；applicability conditionが満たされないPatternを適用候補として出す→BRAIN knowledge owner；BRAIN canonicalをINTELLIGENCEから変更→BRAIN knowledge owner；未選択connectorを必須依存として提案へ追加→BRAIN knowledge owner；Pattern revisionの反例を別revisionへ混合→BRAIN knowledge owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-032-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-032-03 (未見入力 oracle): 未fixture Pattern versionでも宣言済互換範囲・適用scope内で条件を満たしcounterexampleが非該当ならcandidate根拠にする。未宣言範囲はunknownとしてBRAINへ戻し、同名Patternを統合しない。
- AC-INT-032-04 (unknown/範囲外): CASE-INT-032-04a〜04eを独立評価する。field→oracle/owner対応: Pattern identity/revisionがunknown→BRAIN knowledge owner；applicabilityがunknown→BRAIN knowledge owner；exception/counterexample適用scopeがunknown→BRAIN knowledge owner；declared compatibility外のPattern version→BRAIN knowledge owner；source scopeが未宣言→BRAIN knowledge owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧DAC class/disposition/input_policy/bindingの区別を意味再導出。旧registry taxonomy/schemaは現行へ固定せず置換。

### FR-INT-033 — Product Core / HARNESS → INTELLIGENCE（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-033`（L2 633bf12行235–242、L11 R2187-01行270）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: Product Core requirement/design/meaningとHARNESS process contract/verification obligationを別source/revisionで受領。出力: source別revisionを保持するINTELLIGENCE理解材料。責務: 該当Product Core owner; HARNESS owner; CONNECT contract owner。
- 正常条件: 二sourceの類似語彙もowner/meaning/revision別に保ち、独断で統合しない。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-033-01 (正常): Product Core requirementとHARNESS verification obligationを別source/revisionで受け、各主張を対応ownerへ追跡可能にする。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-033-02 (独立negative): CASE-INT-033-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: Product Core source identityを欠落→該当Product Core owner；Product Core revisionを欠落→該当Product Core owner；HARNESS process contract/obligationを欠落→HARNESS source/verification owner；二sourceの同語異義を一つへ統合→該当Product Core ownerとHARNESS ownerを別々に保持；scopeを異なるProduct Coreへ結ぶ→該当Product Core owner；二sourceのrevisionを取り違える→誤った各source ownerへ別々に戻す；未選択connectorを必須依存として提案へ追加→該当する親source owner；Product Coreの意味変更をINTELLIGENCEが確定→該当Product Core owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-033-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-033-03 (未見入力 oracle): 宣言済schema compatibility内の未見pairでもProduct Core/HARNESS source edgeを別々に保つ。未宣言schemaはunsupportedとして各source ownerへ返す。
- AC-INT-033-04 (unknown/範囲外): CASE-INT-033-04a〜04eを独立評価する。field→oracle/owner対応: Product Core source identityがunknown→該当Product Core ownerが特定されるまで各sourceを分離保持；HARNESS obligation revisionがunknown→HARNESS verification owner；二sourceの意味衝突が未解決→該当Product Core ownerとHARNESS ownerを別々に保持；selected connector contract identityがunknown→該当CONNECT contract owner；片方のsource scopeが未宣言→該当する当該source owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧DAC owner/binding/semantic conflictとDAC-AC-003/006 negative shapeを再導出。旧classifier implementationは置換。

### FR-INT-034 — LABO → INTELLIGENCE（1.0評価材料）（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-034`（L2 633bf12行244–251、L11 R2187-01行271）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: 過去evaluation、success/failure/counterexample、Worker/model実績、Bench level、explicitly unevaluatedと各source scope/revision。出力: scope付き判断材料。過去評価ownerはLABO、配置候補ownerはINTELLIGENCE。責務: LABO evaluation/source owner。
- 正常条件: 評価済み同scope材料と明示的未評価caseを分け、未評価を維持。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-034-01 (正常): LABO評価済み結果と別caseの明示的未評価結果を受け、評価済みscopeだけ証拠とし未評価はそのまま保持する。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-034-02 (独立negative): CASE-INT-034-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: LABO evaluation identityを欠落→LABO evaluation owner；evaluation source revisionを欠落→LABO evaluation owner；評価scopeを別Worker/modelへ結ぶ→LABO evaluation owner；explicitly unevaluatedを評価済みに変換→LABO evaluation owner；現在scopeで成立するcounterexampleだけを除外→LABO evaluation owner；Bench levelを根拠なく別水準へ変換→LABO evaluation owner；評価結果のownerをINTELLIGENCEへ変更→LABO evaluation owner；stale evaluationをcurrent evidenceとして使う→LABO evaluation owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-034-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-034-03 (未見入力 oracle): LABO定義済status/versionの未見fixtureは同scopeで扱い、explicitly unevaluatedは未評価として維持する。
- AC-INT-034-04 (unknown/範囲外): CASE-INT-034-04a〜04eを独立評価する。field→oracle/owner対応: LABO evaluation revisionがunknown→LABO evaluation owner；evaluation scope/Worker identityがunknown→LABO evaluation owner；statusが未定義で評価済み/未評価を区別できない→LABO evaluation owner；evidence source/provenanceがunknown→LABO source owner；compatibility range外の評価version→LABO evaluation owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧HELIX-Bench success/failure/missing/scope-bound evidenceを意味再導出。旧score/threshold/provider axisは移さない。

### FR-INT-035 — INTELLIGENCE → OS（計画・判断候補）（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-035`（L2 633bf12行253–260、L11 R2187-01行272）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: plan/placement/diagnosis/review/repair candidate、根拠、停止条件、依存、source revision。出力: OSが受け取れる候補。ticket登録・割当・実行・進行はOS。責務: INTELLIGENCE candidate owner; OS ticket/assignment owner。
- 正常条件: 完全なcandidate receiptを渡し、OSによるticket化とは分離。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-035-01 (正常): 承認済み目標・依存関係を含むcandidateをOSへ渡し、INTELLIGENCE出力はcandidate receiptまでとする。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-035-02 (独立negative): CASE-INT-035-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: candidate identity/source revisionを欠落→INTELLIGENCE candidate owner；根拠または依存の一項目を欠落→INTELLIGENCE candidate owner；停止条件を欠落→INTELLIGENCE candidate owner；stale candidateをcurrentとして提示→INTELLIGENCE candidate owner；OS ticket mappingを推測で確定→OS ticket/assignment owner；INTELLIGENCE candidate receiptをOS ticketとして扱う→OS ticket/assignment owner；未選択connectorを必須依存として提案へ追加→INTELLIGENCE candidate owner；candidate source scopeを別taskへ結ぶ→INTELLIGENCE candidate owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-035-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-035-03 (未見入力 oracle): 未fixture task classでも既知task/scope contractのcandidateを作り、ticket化はOSへ分離する。OS mapping未宣言ならunknownのまま独自ticketを作らない。
- AC-INT-035-04 (unknown/範囲外): CASE-INT-035-04a〜04eを独立評価する。field→oracle/owner対応: candidate source revisionがunknown→INTELLIGENCE candidate owner；goal/dependency scopeがunknown→INTELLIGENCE candidate owner；stop conditionが未定義→INTELLIGENCE candidate owner；OS ticket mappingがunknown→OS ticket/assignment owner；selected connector contract identityがunknown→該当CONNECT contract owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧RLO authority split/candidate-vs-ticketのfailure shapeを再導出。Issue/branch/lease/control planeは現行OSへ置換。

### FR-INT-036 — INTELLIGENCE ↔ SECURITY（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-036`（L2 633bf12行262–269、L11 R2187-01行273）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: operation candidateのactor/action/target/scope/revisionとSECURITY permission/constraint/revocation結果。出力: 修復candidateに付くpermission照合結果。permission/isolation authorityはSECURITY。責務: SECURITY permission/isolation owner。
- 正常条件: 同じactor/action/target/scopeに対するpermission状態を保持、許可発行/変更なし。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-036-01 (正常): actor/action/target/scopeに対する有効なSECURITY permissionと制約を照合し、permissionを発行/変更しない。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-036-02 (独立negative): CASE-INT-036-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: actor identityを欠落→SECURITY permission/isolation owner；action identityを欠落→SECURITY permission/isolation owner；target identityを欠落→SECURITY permission/isolation owner；scopeだけを不一致にする→SECURITY permission/isolation owner；permission revisionをstaleにする→SECURITY permission/isolation owner；revoked permissionを有効扱いする→SECURITY permission/isolation owner；別actor/action/targetのpermissionを流用→SECURITY permission/isolation owner；INTELLIGENCEがpermissionを発行/変更→SECURITY permission/isolation owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-036-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-036-03 (未見入力 oracle): 過去fixtureに無いactionについて、同じactor/action/target/scopeを明示した有効なSECURITY permission sourceを新規入力する。明示sourceの状態だけを照合し、別actionのpermissionを流用しない。これはL11の「未見actionはSECURITYへ戻す」経路を通る正常fixtureであり、実行許可をINTELLIGENCEが作らない。actionが宣言scope外、またはpermission sourceがunknownの入力はCASE-036-04で別々に保留する。
- AC-INT-036-04 (unknown/範囲外): CASE-INT-036-04a〜04eを独立評価する。field→oracle/owner対応: actor/action permissionがunknown→SECURITY permission/isolation owner；target/scope permissionがunknown→SECURITY permission/isolation owner；permission revision/statusがunknown→SECURITY permission/isolation owner；revocation時点がunknown→SECURITY permission/isolation owner；actionがsourceに未宣言→SECURITY permission/isolation owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧SEC capability/target/provenance/permission axis独立性を再導出。SEC-AC-CAP-001/002/005 mutation形を使い、broker runtimeは移さない。

### FR-INT-037 — OS → Worker（INTELLIGENCE candidate実行）（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-037`（L2 633bf12行271–278、L11 R2187-01行274）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: OS発行・割当ticket、Worker actor、task scope、ticket revision、admitted contract。出力: Worker actor/scope付き実行結果を同ticketに結びOS/INTELLIGENCEへ返す。責務: OS ticket/assignment owner; Worker result integrity owner。
- 正常条件: OS発行と割当済ticketに対して指定Workerが実行し、resultを同scopeで返す。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-037-01 (正常): OSがticketとWorker/version/scopeを割り当てた後、その対応を保持してWorker resultを同ticketの結果として扱う。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-037-02 (独立negative): CASE-INT-037-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: OS-issued ticket identityを欠落→OS ticket/assignment owner；Worker assignmentを欠落→OS ticket/assignment owner；Worker identityを欠落→OS ticket/assignment owner；Worker versionをassignmentと不一致にする→OS ticket/assignment owner；task scopeを別ticketへ結ぶ→OS ticket/assignment owner；Worker result actorをassignmentと不一致にする→Worker execution/result owner；Worker result provenanceを欠落→Worker execution/result owner；INTELLIGENCEから実行許可を追加→OS ticket/assignment owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-037-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-037-03 (未見入力 oracle): 未fixture Worker versionでもOS assignmentと宣言済compatibility/task scopeを満たす場合は同ticketで照合する。未宣言互換性はOSへ戻し、INTELLIGENCEから実行許可を足さない。
- AC-INT-037-04 (unknown/範囲外): CASE-INT-037-04a〜04eを独立評価する。field→oracle/owner対応: OS ticket identity/stateがunknown→OS ticket/assignment owner；Worker assignment/versionがunknown→OS ticket/assignment owner；task scope compatibilityがunknown→OS ticket/assignment owner；Worker result provenanceがunknown→Worker execution/result owner；selected connector contract identityがunknown→該当CONNECT contract owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧WCC versioned descriptor/actor-scope resultとHAT-WCC wrong actor/scope/stale receiptを再導出。provider CLI/sandboxは移さない。

### FR-INT-038 — HARNESS → 限定修復の検証義務（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-038`（L2 633bf12行280–287、L11 R2187-01行275）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: requirement revision、oracle、expected failure、independent verification、consumer acceptance、backflow condition。出力: 修復scopeに束縛した検証義務一式。責務: HARNESS requirement/verification owner。
- 正常条件: 修復前後の同じ義務を保ち、repairerが追加/削除しない。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-038-01 (正常): HARNESS requirement revisionのverification obligation一式をrepair ticketへ渡し、実行後も同じobligationを照合する。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-038-02 (独立negative): CASE-INT-038-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: requirement revisionを欠落→HARNESS requirement owner；verification oracleを欠落→HARNESS verification owner；expected failure conditionを欠落→HARNESS verification owner；independent verification obligationを欠落→HARNESS verification owner；consumer acceptance obligationを欠落→HARNESS/consumer acceptance owner；backflow conditionを欠落→HARNESS verification owner；未選択connectorを必須依存として提案へ追加→HARNESS requirement/verification owner；修復器がoracleを弱化し検証済みにする→HARNESS verification owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-038-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-038-03 (未見入力 oracle): 未見obligation種別でもHARNESSが定める同じ要求revision/oracleに結び証拠がそろえば評価する。resultなしは未充足のままHARNESSへ戻す。
- AC-INT-038-04 (unknown/範囲外): CASE-INT-038-04a〜04eを独立評価する。field→oracle/owner対応: requirement/oracle revisionがunknown→HARNESS requirement/verification owner；expected failure conditionが未宣言→HARNESS verification owner；independent verification statusがunknown→HARNESS verification owner；consumer acceptance scopeがunknown→HARNESS/consumer acceptance owner；backflow conditionが未宣言→HARNESS verification owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧SYN-AC-004 required verification omissionのoracleを再導出。CI executionは移さない。

### FR-INT-039 — OS → 限定修復の検収（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-039`（L2 633bf12行289–296、L11 R2187-01行276）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: scope付きrepair candidate、Worker execution evidence、HARNESS verification resultと各revision/receipt。出力: OS acceptanceへの検収入力。acceptance/progressはOS。責務: candidate/Worker/HARNESSの各source owner; OS acceptance owner。
- 正常条件: candidate、execution、verificationを同一repair scopeで別段階として渡す。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-039-01 (正常): 同一修復scopeのcandidate、execution evidence、HARNESS resultを区別してOSへhandoffし、OSが独自に受入判断できる証拠を残す。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-039-02 (独立negative): CASE-INT-039-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: repair candidate scopeを欠落→INTELLIGENCE candidate owner；execution evidenceを欠落→Worker execution/result owner；HARNESS verification resultを欠落→HARNESS verification owner；OS acceptance receiptをINTELLIGENCEが生成→OS acceptance owner；別scopeのevidenceを同じ候補へ結ぶ→該当evidence producer owner；stale HARNESS resultをcurrent扱い→HARNESS verification owner；未選択connectorを必須依存として提案へ追加→該当する親source owner；重複receiptを新しいacceptance evidenceにする→OS acceptance owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-039-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-039-03 (未見入力 oracle): 未見receipt versionでも宣言済互換契約/correlation/scopeを満たすなら段階別に受領し、OS独自acceptanceを残す。範囲外は未受領としてproducer/OSへ返す。
- AC-INT-039-04 (unknown/範囲外): CASE-INT-039-04a〜04eを独立評価する。field→oracle/owner対応: candidate scope/revisionがunknown→INTELLIGENCE candidate owner；execution evidence producer/revisionがunknown→Worker execution/result owner；HARNESS verification applicabilityがunknown→HARNESS verification owner；OS acceptance targetがunknown→OS acceptance owner；selected connector contract identityがunknown→該当CONNECT contract owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧RLO stale receipt/wrong actor-scope/misordered handoff oracleを再導出。merge/CI acceptance authorityは移さない。

### FR-INT-040 — INTELLIGENCE → LABO（1.0実績）（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-040`（L2 633bf12行298–305、L11 R2187-01行277）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: prediction/diagnosis/review/placement/repair result、source revision、episode/scope、actual evidence/observation window。出力: LABOの過去評価材料。長期効果評価ownerはLABO。責務: INTELLIGENCE source/result owner; LABO evaluation owner。
- 正常条件: predictionとactualを同episode/scopeへ別eventで結び、source revision/windowを区別。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-040-01 (正常): predictionと後続actual outcomeを同一episode/scopeへ結び、source revisionと観測windowを分けてLABOへ渡す。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-040-02 (独立negative): CASE-INT-040-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: prediction source/revisionを欠落→INTELLIGENCE result/source owner；actual outcomeをpredictionで代用→LABO evaluation owner；episode/scope bindingを欠落→INTELLIGENCE result/source owner；observation windowを欠落→INTELLIGENCE result/source owner；遅着actualを別episodeへ結ぶ→INTELLIGENCE result/source owner；重複actualを別成功に数える→LABO evaluation owner；未選択connectorを必須依存として提案へ追加→該当する親source owner；evaluation ownershipをINTELLIGENCEへ変更→LABO evaluation owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-040-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-040-03 (未見入力 oracle): 遅延/重複actualをepisode/revisionで照合し、重複を別成功に数えない。未対応actualはunknownのままLABOへ渡す。
- AC-INT-040-04 (unknown/範囲外): CASE-INT-040-04a〜04eを独立評価する。field→oracle/owner対応: prediction/result revisionがunknown→INTELLIGENCE result/source owner；actual outcomeが未観測→LABO evaluation ownerへ未観測として渡す；episode/scope bindingがunknown→INTELLIGENCE result/source owner；observation windowが未宣言→INTELLIGENCE result/source owner；duplicate/late event identityがunknown→INTELLIGENCE result/source owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧HELIX-Bench failure/missing denominatorとRLO duplicate/late event distinctionを再導出。旧metric taxonomy/score thresholdは継承しない。

### FR-INT-041 — 各source mechanism → Situation Model（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-041`（L2 633bf12行307–314、L11 R2187-01行278）、version_target `sourceごとに定義`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: 各admitted mechanismの許可current state/evidence、個別revision、connector/authority contract。出力: source別Situation Model input。個別connector/authority identityを維持。責務: 各source owner; CONNECT contract owner。
- 正常条件: 選択・admitted sourceだけをそのsource authority/revisionで反映。Web/WEB-OSはcontractがなければ未観測。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-041-01 (正常): HARNESSとOSを個別source identity/connectorで読み、各revision/scope/authorityを個別に保つ。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-041-02 (独立negative): CASE-INT-041-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: source identityを欠落→該当source機構owner；source current-state revisionを欠落→該当source機構owner；source evidence scopeを別機構へ結ぶ→該当source機構owner；同名HARNESS/OS fieldを同一identityへ統合→HARNESSとOSの各source ownerを別々に保持；選択sourceのconnector contractを欠落→該当CONNECT contract owner；選択sourceの互換範囲外revisionを採用→該当source機構ownerとCONNECT contract owner；未選択Web/WEB-OSを常時依存へ追加→未選択sourceは未観測として保持し依存ownerを追加しない；source authorityをINTELLIGENCEへ移す→該当source機構owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-041-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-041-03 (未見入力 oracle): 未選択Web/WEB-OSは未観測のままにする。選択されたsourceだけ、明示されたsource identity/revision/scopeとconnector契約を照合し、未見互換値は宣言範囲内のみ受ける。
- AC-INT-041-04 (unknown/範囲外): CASE-INT-041-04a〜04eを独立評価する。field→oracle/owner対応: selected source identity/revisionがunknown→該当source機構owner；source scope/authorityがunknown→該当source機構owner；selected connector contractがunknown→該当CONNECT contract owner；互換性rangeが未宣言→該当source機構ownerとCONNECT contract owner；未選択sourceを要求された→未選択sourceは未観測のまま保持。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧DAC個別source identityとWCC source revisionを意味再導出。旧共通registry/connectorを新authorityとして採用しない。

### FR-INT-044 — INTELLIGENCE → BRAINへの非直接更新境界（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-044`（L2 633bf12行334–341、L11 R2187-01行279）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: INTELLIGENCE decision/candidate、genericization proposal、evidence/scope、LABO evaluation handoff。出力: candidateをLABO経路へ渡す。BRAIN knowledge canonicalを保持し直接出力しない。責務: LABO evaluation owner; BRAIN knowledge owner。
- 正常条件: scope/evidence/評価状態を明示したcandidateをLABOへ渡す。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-044-01 (正常): generic candidateと出典/scopeをLABOへ渡し、BRAIN knowledge正本を変えない。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-044-02 (独立negative): CASE-INT-044-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: generic candidate identity/sourceを欠落→INTELLIGENCE candidate owner；candidate evidence scopeを欠落→INTELLIGENCE candidate owner；LABO評価経路を省略→LABO evaluation owner；未評価candidateからBRAIN更新を試みる→BRAIN knowledge owner；evaluation evidenceを別scopeへ結ぶ→LABO evaluation owner；汎用性を根拠なく確定→LABO evaluation owner；未選択connectorを必須依存として提案へ追加→LABO evaluation owner；INTELLIGENCEからBRAINへ直接出力→BRAIN knowledge owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-044-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-044-03 (未見入力 oracle): 未見candidate kindもsource/scopeを維持してLABOへ渡し、評価例がないものをgeneralizableと断定しない。
- AC-INT-044-04 (unknown/範囲外): CASE-INT-044-04a〜04eを独立評価する。field→oracle/owner対応: candidate source/evidence identityがunknown→INTELLIGENCE candidate owner；evaluation applicability/scopeがunknown→LABO evaluation owner；evaluation statusが未観測→LABO evaluation owner；BRAIN direct-update経路が候補に含まれる→BRAIN knowledge owner；generic candidateの対象scopeが未宣言→INTELLIGENCE candidate owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧SYN observation→candidate分離とDAC historical/candidate non-promotionを再導出。旧human gateを追加せずLABO/BRAIN現ownerへ置換。

### FR-INT-045 — INTELLIGENCE → Product Core Backflow（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-045`（L2 633bf12行343–350、L11 R2187-01行280）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとする。
- 入力: Product Core meaning conflict/gap/improvement candidate、source revision、target identity。出力: 該当Product Core向けbackflow candidate。canonical変更はProduct Core owner。責務: 該当Product Core owner; target不明なら未route。
- 正常条件: target product/owner/revisionに結び付く照会candidateを返し、sourceを直接変更しない。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-045-01 (正常): Product Core issueを該当product/revision/ownerに結ぶbackflow candidateを作り、正本変更はownerに残す。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-045-02 (独立negative): CASE-INT-045-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: Product Core target identityを欠落→INTELLIGENCE candidate owner（未routeとして保持）；target product revisionを欠落→該当Product Core ownerが判明するまで未route；source meaning/conflict evidenceを欠落→該当Product Core ownerが判明するまで未route；誤ったProduct Core ownerへrouting→該当Product Core ownerが判明するまで未route；INTELLIGENCEがProduct Core正本を変更→該当Product Core owner；candidateを既決修正として扱う→INTELLIGENCE candidate owner；未選択connectorを必須依存として提案へ追加→INTELLIGENCE candidate owner（未route保持）；source revision/scopeを欠落→該当Product Core ownerが判明するまで未route。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。適用されるHARNESS-L2-010/011 packについてはCASE-INT-045-05a〜05rの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-045-03 (未見入力 oracle): 未見product identityでも明示target/revision/ownerがあればcandidateを返す。target/owner不明ならunroutedのまま保持する。
- AC-INT-045-04 (unknown/範囲外): CASE-INT-045-04a〜04eを独立評価する。field→oracle/owner対応: target product identityがunknown→INTELLIGENCE candidate owner（未routeとして保持）；Product Core ownerが特定不能→未routeとして保持しownerを創作しない；source revision/scopeがunknown→該当Product Core ownerが特定されるまで未route；meaning conflictの根拠がunknown→該当Product Core ownerが特定されるまで未route；選択connector contractがunknown→該当CONNECT contract owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧BBG-R03 false claim/scope expansionおよびAC03 negative oracleを再導出。旧CLI/generator/direct writebackは移さない。
