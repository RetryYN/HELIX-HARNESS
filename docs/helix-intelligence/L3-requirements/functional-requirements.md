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

- 固定親 `HELIXINTELLIGENCE-L2-017`（L2 633bf12行202–206、L11基本表92行、R2187-01行266）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: 同一target revision/scopeに対するSECURITY permission/isolation・Worker実行・HARNESS検証義務・OS検収の各結果。出力: 境界別の未完/完了状態を保つ統合修復結果。責務: SECURITY permission/isolation; Worker execution/result; HARNESS obligation; OS acceptance。
- 正常条件: 四段階の各receiptを別source/revision/ownerで結び、操作時のpermission有効性と後日の失効を分離。pack failureは個別source authorityを代替せず、HARNESS-L2-010/011共通pack contractの定義ownerへ返す。 HARNESS-L2-010/011共通packは実際に消費するoperationだけに適用し、非消費operationに依存を追加しない。
- AC-INT-017-01 (正常): 同一target revision/scopeについてSECURITY permission、Worker実行結果、HARNESS検証、OS検収を別々の証拠で受ける。permissionは操作時点の期限・revocation状態で評価し、その後の失効を当時有効だった過去の実行証拠へ遡及させない。未完義務は統合結果に未完として残し、各段階の対応証拠がそろった時だけ完了する。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-017-02 (独立negative): CASE-INT-017-02a〜oおよびCASE-INT-017-02pを別fixtureで一変数ずつ照合する。permission receipt、Worker result、HARNESS obligation、OS acceptance、permission target scope、permission target revisionのみの不一致、後日失効による過去の有効証拠の誤棄却、各source/revision分離、包括write authority、実行時点で既に期限切れ/revokedのpermission、Worker結果/HARNESS検証/OS検収のtarget revision不一致、未admitted connector contract、Worker結果のHARNESS検証証拠への付け替えを独立変異し、当該要件を満たさない結果を完了扱いしない。失敗fieldは固定L2のSECURITY/Worker/HARNESS/OS各source ownerへ個別に戻す。無関係な正常source/operationは維持する。 pack消費operationだけはCASE-INT-017-05a〜qも照合する。 選択済みCONNECT contractの未admittedはCASE-INT-017-02mとして適用CONNECT contract ownerへ戻す。
- AC-INT-017-03 (未見入力 oracle): CASE-INT-017-03はreceiptをO1/H1/P1/W1の到着順で与える具体的な未見正常fixture、CASE-INT-017-03aは後日失効の非遡及正常として照合する。到着順を変えてもtarget/scope/source/revisionを照合し、段階順そのものを変更/必須化しない。四段階すべての有効な対応証拠が揃い、各段階のauthorityを確認できる場合に限り統合結果を完了とする。いずれかの段階のauthorityを確認できない場合はその段階だけ保留し、統合結果を未完了に保つ。実行時点permissionが有効なら後日失効を遡及させず実行時点証拠と完了判定を保持する。
- AC-INT-017-04 (unknown/範囲外): CASE-INT-017-04a〜04eを独立評価する。field→oracle/owner対応: 操作時点のSECURITY authorityを確認できない→SECURITY permission/isolation owner（当該段階だけ保留し統合結果は未完了）；Worker execution receiptのrevisionがunknown→Worker execution/result owner；HARNESS obligation適用scopeがunknown→HARNESS verification owner；OS acceptance対象revisionがunknown→OS acceptance owner；Worker実行結果のtarget scopeが未宣言→Worker execution/result owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 固定L2 crosswalkの起点に合わせ、BBR-R02/R04（LEGACY-ASSET-D881AF6AFD277B1DE934、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requirements.md:35-58`）およびrequest context（LEGACY-ASSET-35F5F438E0F8755B1CCE、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requests.md:18-29`。旧asset full-file pinは別に1-29全体を保持し、意味引用は18-29に限定）およびGH-FR-011（LEGACY-ASSET-CF1129DCA8779904F6B3、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md:103-105`）から、候補/許可/適用/検収の分離と同一episodeの既存CI修復境界を再導出する。SYN-AC-001のnode/edge ID・revision・digest・authorityの単独変異は補助比較に限る（LEGACY-ASSET-F1F753F31DB8D874EF21、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/system-synthesis-requirements.md:29–68`; LEGACY-ASSET-BEAB5EE27CD04F5E866F、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/system-synthesis-acceptance.md:29–42`）。BBRの新write権限や旧automation/DB authorityは移さない。

### FR-INT-030 — HELIX-HARNESS → Situation Model（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-030`（L2 633bf12行208–215、L11基本表93行、R2187-01行267）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: 許可されたHARNESS requirement/design revision、process contract、verification obligation、admitted connector contract。出力: source revision付きSituation Model情報。責務: HARNESS source owner; 適用されるCONNECT contract owner。
- 正常条件: 同一HARNESS source identity/revisionの契約と義務を反映しHARNESSを正本ownerとして残す。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-030-01 (正常): 同一HARNESS source identity/revisionのrequirement/design、process contract、verification obligationとcontract receiptをSituation Modelへ反映し、HARNESSを正本ownerとして残す。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-030-02 (独立negative): CASE-INT-030-02a〜hを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: HARNESS requirement source identityを欠落→HARNESS source owner；requirement revisionを欠落→HARNESS source owner；design source identityを欠落→HARNESS source owner；design revisionをstaleにする→HARNESS source owner；process contract receiptをstale revisionにする→HARNESS source owner；verification obligationを欠落→HARNESS source owner；HARNESS source scopeを別operationへ結ぶ→HARNESS source owner；HARNESS source ownerを別ownerへ置換→HARNESS source owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。02d/02eのstale revisionはstaleと判定し、current化せず設計義務を上書きしない。固定親で要求されるHARNESS-L2-010/011 packについてはCASE-INT-030-05a〜05qの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-030-03 (未見入力 oracle): 宣言済compatibility範囲内の未見version pairのみ同一source契約に接続し、範囲外/未宣言はunknownとしてconnectorを自動選択しない。 範囲外/未宣言は送受契約owner（適用CONNECT contract owner）へ返す。
- AC-INT-030-04 (unknown/範囲外): CASE-INT-030-04a〜04fを独立評価する。field→oracle/owner対応: HARNESS requirement/design revision fieldがunknown→HARNESS source owner；process/verification contract適用性がunknown→HARNESS source owner；selected connector contract identityがunknown→該当CONNECT contract owner；declared compatibility外version pair（CASE-INT-030-04d）または未宣言range（04f）→適用CONNECT contract owner；operation scopeが未宣言→HARNESS source owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。 未宣言compatibility rangeはCASE-INT-030-04fで単独評価する。
- 旧source disposition: 旧SYN source identity（LEGACY-ASSET-F1F753F31DB8D874EF21、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/system-synthesis-requirements.md:40-68`）とacceptance（LEGACY-ASSET-BEAB5EE27CD04F5E866F、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/system-synthesis-acceptance.md:29-42`）のsource ownership/stale receipt形を再導出する。旧CI projectionは移植しない。

### FR-INT-031 — HELIX-OS → Situation Model（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-031`（L2 633bf12行217–224、L11基本表94行、R2187-01行268）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: 許可ticket/current state/dependency/evidence、OS source revision、admitted connector contract。出力: OS revision付きSituation Model情報。OSがstate/authorityを保持。責務: OS source owner; 適用されるCONNECT contract owner。
- 正常条件: 同一ticket state revisionとdependency/evidenceを関連づけ、OS stateを変更しない。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-031-01 (正常): OS ticketのstate revisionとdependencyをSituation Modelへ表示し、OS stateは変更しない。INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-031-02 (独立negative): CASE-INT-031-02a〜gおよび02nを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: OS ticket identityを欠落→OS source owner；ticket state revisionを欠落→OS source owner；dependency evidenceを欠落→OS source owner；revision 8より古いeventでstateを巻き戻す→OS source owner；source scopeを別ticketへ結ぶ→OS source owner；OS authorityをINTELLIGENCEへ移す→OS source owner；dependency revisionをstaleにする→OS source owner；Situation ModelからOS stateへのwrite要求→write拒否・OS state不変・OS source ownerへ再照合。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。固定親で要求されるHARNESS-L2-010/011 packについてはCASE-INT-031-05a〜05qの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-031-03 (未見入力 oracle): 未見state/event valueでも宣言済OS契約内ならticket/revisionに結び渡す。契約外/定義不明の値のみunknownとしてOSへ照会する。
- AC-INT-031-04 (unknown/範囲外): CASE-INT-031-04a〜04eを独立評価する。field→oracle/owner対応: OS ticket/state revisionがunknown→OS source owner；dependency evidence revisionがunknown→OS source owner；selected connector contract identityがunknown→該当CONNECT contract owner；state/event種別が宣言契約外→OS source owner；ticket scopeが未宣言→OS source owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧universal workflow（LEGACY-ASSET-5EE032D657C221184B00、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md:13-55`）とpaired acceptance（LEGACY-ASSET-6FFD7F4E58066D08B053、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md:17-26`）はsource/revision identityとauthority分離の形だけを再導出する。旧RLOの当該範囲をstale-event例の根拠とはせず、遅着event/revision 7の具体oracleは固定L2/L11 R2187-01から再導出する。旧Issue/event runtime authorityは現行OSへ置換。

### FR-INT-032 — BRAIN → INTELLIGENCE（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-032`（L2 633bf12行226–233、L11基本表95行、R2187-01行269）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: BRAIN Pattern/Unit/Part、applicability、exception、counterexampleおよびrevision。出力: source-bound INTELLIGENCE判断材料。BRAIN knowledge canonicalを保持。責務: BRAIN knowledge owner; 適用されるCONNECT contract owner。
- 正常条件: 適用条件と反例を同じPattern identity/revisionへ結び、判断材料にする。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-032-01 (正常): 正常fixtureではPattern/Unit/Partの各identity/revisionと適用条件が満たされ、exception/counterexampleがscope内で成立しないことを確認する。INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。 判断候補に適用理由と該当Pattern revisionを付す。
- AC-INT-032-02 (独立negative): CASE-INT-032-02a〜iおよび02j〜mを別fixtureで一変数ずつ変異する。Pattern identityとrevisionは別CASEとし、Unit/Part identity・revision欠落（02j〜m）、applicability unknown昇格、成立counterexample除外、scope不一致、条件未達候補化、canonical変更、反例の別revision混合、同名の異なるPattern identity/revisionの統合を拒否する。BRAIN knowledge ownerへ戻し、normal input/canonicalを保持する。HARNESS-L2-010/011 pack適用fieldは共通pack ACとしてCASE-INT-032-05a〜qで別途照合する。
- AC-INT-032-03 (未見入力 oracle): 未fixture Pattern versionでも宣言済互換範囲・適用scope内で条件を満たしcounterexampleが非該当ならcandidate根拠にする。未宣言範囲はunknownとしてBRAINへ戻し、同名Patternを統合しない。
- AC-INT-032-04 (unknown/未宣言): CASE-INT-032-04a〜hおよび04i〜lを別fixtureで照合する。Pattern identity/revision、applicability、exception/counterexample scope、compatibility外version、source scopeとconnector admissionは既存CASE-INT-032-04a〜hで一変数ずつ評価し、04i/jはUnit identity/revision、04k/lはPart identity/revisionのunknownとしてBRAIN knowledge ownerへ戻す。 selected connector contractのadmission状態unknownは専用fixture CASE-INT-032-04gで接続未成立を保持しCONNECT contract ownerへ返す。 未宣言compatibility rangeはCASE-INT-032-04hで単独評価する。
- 旧source disposition: 旧L3 requirementsおよびpaired test-designのBRAIN/Brain/brain検索では直接対応文書を確認できなかった。Pattern/applicability/counterexample検索の候補はskill applicability、UIL、VDH、SYN等の異なる責務であり、現行BRAIN接続の直接sourceとはしない。旧design registry family (LEGACY-ASSET-5CBA32E9DB5B0FE05589、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md:14-58`) はfamily identity/lifecycleの比較、DAC requirements (LEGACY-ASSET-C6936A5DA79A6DAE4FE4、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/document-authority-census-requirements.md:27-61`) はdocument identity/class/dispositionの比較資料だけとし、Pattern/Unit/Part/applicability接続の根拠にはしない。DAC acceptance (LEGACY-ASSET-BBD687399574FEE23807、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/document-authority-census-acceptance.md:24-43`) は別assetとして照合し、Pattern authorityとは扱わない。現行の採択済みL2/L11から意味を再導出したL3案である。検索は上記docsの範囲に限り、全archive不在を主張しない。旧registry taxonomy/schema/runtimeは移植しない。

### FR-INT-033 — Product Core / HARNESS → INTELLIGENCE（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-033`（L2 633bf12行235–242、L11基本表96行、R2187-01行270）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: Product Core requirement/design/meaningとHARNESS process contract/verification obligationを別source/revisionで受領。出力: source別revisionを保持するINTELLIGENCE理解材料。責務: 該当Product Core owner; HARNESS owner; CONNECT contract owner。
- 正常条件: 二sourceの類似語彙もowner/meaning/revision別に保ち、独断で統合しない。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-033-01 (正常): Product Core requirementとHARNESS verification obligationを別source/revisionで受け、各主張を対応ownerへ追跡可能にする。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-033-02 (独立negative): CASE-INT-033-02a〜iの親固有fieldを別fixtureで照合し、未選択connector負例の再導出根拠はHARNESS-L2-010/011の宣言依存・入出力契約と専用CONNECT契約である。Product Core identity/revision、HARNESS process contract、HARNESS verification obligation、scope、二source revision、意味統合、未選択connector、Product Core意味変更を個別に拒否する。二sourceは分離保持し、該当するProduct Core/HARNESS ownerへ戻す。共通packを消費するoperationではCASE-INT-033-05a〜05qも各fieldを独立照合し、不成立はHARNESS pack contract ownerへ戻す。
- AC-INT-033-03 (未見入力 oracle): 宣言済schema compatibility内の未見pairでもProduct Core/HARNESS source edgeを別々に保つ。未宣言schemaはunsupportedとして各source ownerへ返す。
- AC-INT-033-04 (unknown/範囲外): CASE-INT-033-04a〜04eを独立評価し、CASE-INT-033-03aの参照索引04fは独立fixtureに数えない。field→oracle/owner対応: Product Core source identityがunknown→該当Product Core ownerが特定されるまで各sourceを分離保持；HARNESS obligation revisionがunknown→HARNESS verification owner；二sourceの意味衝突が未解決→矛盾した両sourceを分離保持し、該当Product Core ownerとHARNESS ownerへ別々に戻す；selected connector contract identityがunknown→該当CONNECT contract owner；片方のsource scopeが未宣言→該当する当該source owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source参照: LEGACY-ASSET-C6936A5DA79A6DAE4FE4 (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/document-authority-census-requirements.md:27-61`); LEGACY-ASSET-BBD687399574FEE23807 (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/document-authority-census-acceptance.md:24-43`).
- 旧source disposition: 旧DAC sourceはowner/binding/classification shapeの比較に限り、DAC-AC-003/006自体をmeaning-conflictの根拠とはしない。meaning-conflict条件は固定L2/L11から再導出する。旧classifier implementationは置換。

### FR-INT-034 — LABO → INTELLIGENCE（1.0評価材料）（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-034`（L2 633bf12行244–251、L11基本表97行、R2187-01行271）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: 過去evaluation、success/failure/counterexample、Worker/model実績、Bench level、explicitly unevaluatedと各source scope/revision。出力: scope付き判断材料。過去評価ownerはLABO、配置候補ownerはINTELLIGENCE。責務: LABO evaluation/source owner; 適用CONNECT contract owner。
- 正常条件: 評価済み同scope材料と明示的未評価caseを分け、未評価を維持。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-034-01 (正常): LABO評価済み結果と別caseの明示的未評価結果を受け、評価済みscopeだけ証拠とし未評価はそのまま保持する。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-034-02 (独立negative): CASE-INT-034-02a〜jおよび02l〜02nを別fixtureとして一変数ずつ拒否し、02kは02cの索引として二重計上しない。field→oracle/owner対応: LABO evaluation identityを欠落→LABO evaluation owner；evaluation source revisionを欠落→LABO evaluation owner；評価scopeを別Worker/modelへ結ぶ（Bench/source違いも個別fixture）→LABO evaluation owner；explicitly unevaluatedを評価済みに変換→LABO evaluation owner；現在scopeで成立するcounterexampleだけを除外→LABO evaluation owner；Bench levelを根拠なく別水準へ変換→LABO evaluation owner；評価結果のownerをINTELLIGENCEへ変更→LABO evaluation owner；stale evaluationをcurrent evidenceとして使う→LABO evaluation owner；LABO historyから現在のOS assignmentを直接更新→LABO evaluation owner（OS assignmentは変更しない）；success→failure反転、結果値欠落、failure→success反転をそれぞれ独立変異→LABO evaluation owner。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。固定親で要求されるHARNESS-L2-010/011 packについてはCASE-INT-034-05a〜05qの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-034-03 (未見入力 oracle): LABO定義済status/versionの未見fixtureは同scopeで扱い、explicitly unevaluatedは未評価として維持する。
- AC-INT-034-04 (unknown/範囲外): CASE-INT-034-04a〜04fを独立評価する。field→oracle/owner対応: LABO evaluation revisionがunknown→LABO evaluation owner；evaluation scope/Worker identityがunknown→LABO evaluation owner；statusが未定義で評価済み/未評価を区別できない→LABO evaluation owner；evidence source/provenanceがunknown→LABO source owner；compatibility range外の評価version→LABO evaluation owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。 対応不明なstatus/評価versionは未評価を維持。専用connector契約unknownはCONNECT contract ownerへ照会する。
- 旧source参照: LEGACY-ASSET-28FB139B26CD61CC51EE (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:19-84`); LEGACY-ASSET-A952A3A175EB82A4781B (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:24-41`).
- 旧source disposition: 旧HELIX-Benchのsuccess/failure/missing状態とsource参照形を再導出の起点にする。旧引用範囲からscope-bound evidenceの意味は主張せず、scope適用性は固定L2/L11から導く。旧score/threshold/provider axisは移さない。

### FR-INT-035 — INTELLIGENCE → OS（計画・判断候補）（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-035`（L2 633bf12行253–260、L11基本表98行、R2187-01行272）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: plan/placement/diagnosis/review/repair candidate、根拠、停止条件、依存、source revision。出力: OSが受け取れる候補。ticket登録・割当・実行・進行はOS。責務: INTELLIGENCE candidate owner; OS ticket/assignment owner。
- 正常条件: 完全なcandidate receiptを渡し、OSによるticket化とは分離。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-035-01 (正常): 承認済み目標・依存関係を含むcandidateをOSへ渡し、INTELLIGENCE出力はcandidate receiptまでとする。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-035-02 (独立negative): CASE-INT-035-02a〜mを一変数ずつ変異する。共通pack各fieldはCASE-INT-035-05a〜05qも別fixtureで照合する。candidate identity、source revision、evidence、dependency、stop condition、stale、OS mapping推測、candidate receiptのticket化、未選択connector、scope不一致、目標未承認ticket化、INTELLIGENCEによるOS ticket生成/発行、およびOS assignment生成/確定を別々に拒否する。承認済み目標のidentity/revisionと依存関係を受けたcandidateだけをOSへ渡し、未承認目標を含むcandidateはINTELLIGENCE candidate ownerへ戻す。不完全/staleなcandidateをticket化せずINTELLIGENCE candidate ownerへ戻し、ticket/assignmentはOSの別判断に残す。 未選択connector負例はHARNESS-L2-010/011の宣言依存・入出力契約と専用CONNECT契約から再導出し、未選択sourceを親固有の常時依存へ昇格させない。
- AC-INT-035-03 (未見入力 oracle): 未fixture task classでも既知task/scope contractのcandidateを作り、ticket化はOSへ分離する。OS mapping未宣言ならunknownのまま独自ticketを作らない。
- AC-INT-035-04 (unknown/未宣言): CASE-INT-035-04a〜gでcandidate source revision、goal scope、stop condition、OS ticket mapping、selected connector contract identity、candidate identity、dependency scopeをunknownとして別々に保留し、固定親の該当ownerへ戻す。不完全/unknown candidateをticket化・assignment化しない。INTELLIGENCE candidate ownerとOS ticket/assignment ownerの責務を保つ。
- 旧source disposition: 旧RLO requirements（LEGACY-ASSET-50CA1C554747F12266D3、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:189-260`）とacceptance（LEGACY-ASSET-437A6A68F9A9E0AE1B9E、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md:17-55`）のauthority split/candidate-vs-ticketのfailure shapeを再導出。Issue/branch/lease/control planeは現行OSへ置換。

### FR-INT-036 — INTELLIGENCE ↔ SECURITY（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-036`（L2 633bf12行262–269、L11基本表99行、R2187-01行273）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: operation candidateのactor/action/target/scope/revisionとSECURITY permission/constraint/revocation結果。出力: 修復candidateに付くpermission照合結果。permission/isolation authorityはSECURITY。責務: SECURITY permission/isolation owner; 適用CONNECT contract owner。
- 正常条件: 同じactor/action/target/scopeに対するpermission状態を保持、許可発行/変更なし。pack failureは個別source authorityを代替せず、HARNESS-L2-010/011共通pack contractの定義ownerへ返す。
- AC-INT-036-01 (正常): actor/action/target/scopeに対する有効なSECURITY permissionと制約を照合し、permissionの対象target revisionがoperation candidateのtarget revisionと一致することを確認し、permissionを発行/変更しない。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-036-02 (独立negative): CASE-INT-036-02a〜i、02k〜l、02n〜oおよびCASE-INT-036-02pを別fixtureで一変数ずつ変異する。02jは02hの索引であり独立fixtureに数えない。actor identity/action identity/target identityをそれぞれ別CASEで照合し、permission target revisionだけを別revisionにする02pも他fieldを正常値に固定して照合し、permission revision/expiry/revocation、INTELLIGENCEによるpermission発行/変更と有効permission下のconstraint違反も個別に拒否する。operation timestampで期限切れまたは既にrevokedのpermissionから実行可能状態を作らずSECURITYへ戻す。共通HARNESS-L2-010/011 packを各operationに適用し、CASE-INT-036-05a〜qで各fieldを独立照合する。
- AC-INT-036-03 (未見入力 oracle): 未見actionでpermission sourceが欠落/unknownなら、最初にunknownとして保持してSECURITY permission/isolation ownerへ返し、実行可能にしない。正常fixture `CASE-INT-036-03a` では、同じactor/action/target/scopeに一致する明示的で操作時点に有効なSECURITY permissionを照合して結果を保持する。負例 `CASE-INT-036-03b` は別actionにだけ有効なpermissionを持つ未見actionをunknownに保持する。unknownの結果をこのfixtureから推定しない。別actionの有効permissionが存在しても未見actionへ流用せず、SECURITYへ戻す。INTELLIGENCEから許可を発行しない。
- AC-INT-036-04 (unknown/未宣言): CASE-INT-036-04a〜kでactor、action、target、revocation時点、source外action、scope、permission revision、permission statusおよび既知actionのpermission結果欠落をそれぞれ別fixtureで評価する。各unknown/missingはSECURITY permission/isolation ownerへ戻し、操作を実行可能にしない。 constraint欠落と専用connector契約unknownも別fixtureとし、前者はSECURITY、後者はCONNECTへ返す。
- 旧source参照: LEGACY-ASSET-B62E49D2E156232B8C63 (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:160-166`); LEGACY-ASSET-170112AB2FA2FFDBFEE9 (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md:20-24`).
- 旧source disposition: 旧SEC capability/target/provenance/permission axis独立性を再導出。SEC-AC-CAP-001/002/005のtuple mutation形だけを使い、既知action permission欠落と異なるactor/action/targetの個別oracleは採択済みL2/L11から再導出する。broker runtimeは移さない。

### FR-INT-037 — OS → Worker（INTELLIGENCE candidate実行）（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-037`（L2 633bf12行271–278、L11基本表100行、R2187-01行274）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: OS発行・割当ticket、Worker actor、task scope、ticket revision、admitted contract。出力: Worker actor/scope付き実行結果を同ticketに結びOS/INTELLIGENCEへ返す。責務: OS ticket/assignment owner; Worker execution/result owner。
- 正常条件: OS発行と割当済ticketに対して指定Workerが実行し、resultを同scopeで返す。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-037-01 (正常): OSがticketとWorker/version/scopeを割り当てた後、その対応を保持してWorker resultを同ticketの結果として扱う。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-037-02 (独立negative): CASE-INT-037-02a〜jを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: OS-issued ticket identityを欠落→OS ticket/assignment owner；Worker assignmentを欠落→OS ticket/assignment owner；Worker identityを欠落→OS ticket/assignment owner；Worker versionをassignmentと不一致にする→OS ticket/assignment owner；task scopeを別ticketへ結ぶ→OS ticket/assignment owner；Worker result actorをassignmentと不一致にする→Worker execution/result owner；Worker resultのactor/scope由来を照合する根拠を欠落→Worker execution/result owner；INTELLIGENCEから実行許可を追加→OS ticket/assignment owner；executorをINTELLIGENCEへ差替→OS ticket/assignment ownerへ戻して実行しない；割当済み別ticketのWorker result ticket identityだけを置換→割当済み扱いせずOS ticket/assignment ownerへ戻す。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。固定親で要求されるHARNESS-L2-010/011 packについてはCASE-INT-037-05a〜05qの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-037-03 (未見入力 oracle): 未fixture Worker versionでもOS assignmentと宣言済compatibility/task scopeを満たす場合は同ticketで照合して受け入れる。互換範囲未宣言/不明またはtask適合未確認はOSへ戻し、INTELLIGENCEから実行許可を足さない。
- AC-INT-037-04 (unknown/範囲外): CASE-INT-037-04a〜04hを独立評価する。field→oracle/owner対応: OS ticket identity/stateがunknown→OS ticket/assignment owner；Worker assignment/versionがunknown→OS ticket/assignment owner；task scope compatibilityがunknown→OS ticket/assignment owner；Worker result provenanceがunknown→Worker execution/result owner；selected connector contract identityがunknown→該当CONNECT contract owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。task適合未確認はCASE-INT-037-04f、Worker version compatibility rangeの未宣言は04g、宣言済みrangeに対するcompatibility値unknownは04hでそれぞれ一変数としてunknownを保持しOSへ戻す。どの場合も実行へ渡さない。pack compatibility不備は別途HARNESS pack ownerへ戻す。
- 旧source参照: LEGACY-ASSET-9114D4E463E95B67DD0C (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:26-45,47-110`); LEGACY-ASSET-C6ADB99F1353965C5449 (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md:18-37,39-64`)。
- 旧source disposition: 旧WCC versioned descriptor/actor-scope resultはidentity/owner/receipt境界の比較起点とする。HAT-WCC acceptanceはscope/stale receipt比較に限り、wrong actor/ticket result oracleは採択済みL2/L11から再導出する。provider CLI/sandboxは移さない。

### FR-INT-038 — HARNESS → 限定修復の検証義務（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-038`（L2 633bf12行280–287、L11基本表101行、R2187-01行275）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: requirement revision、oracle、expected failure、independent verification、consumer acceptance、backflow condition。出力: 修復scopeに束縛した検証義務一式。責務: HARNESS requirement/verification owner。
- 正常条件: 修復前後の同じ義務を保ち、repairerが追加/削除しない。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-038-01 (正常): HARNESS requirement revisionのverification obligation一式をrepair ticketへ渡し、実行後も同じobligationを照合する。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-038-02 (独立negative): CASE-INT-038-02a〜lを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: requirement revisionを欠落→HARNESS requirement owner；verification oracleを欠落→HARNESS verification owner；expected failure conditionを欠落→HARNESS verification owner；independent verification obligationを欠落→HARNESS verification owner；consumer acceptance obligationを欠落→HARNESS verification owner；backflow conditionを欠落→HARNESS verification owner；未選択connectorを必須依存として提案へ追加→未観測を保持して適用CONNECT contract ownerへ契約照会；修復器がoracleを弱化し検証済みにする→HARNESS verification owner；検証義務の削除/追加、修復後oracle不合格、義務scopeの差し替えも各独立CASEで拒否しHARNESSへ戻す。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。固定親で要求されるHARNESS-L2-010/011 packについてはCASE-INT-038-05a〜05qの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-038-03 (未見入力 oracle): 未見obligation種別は結果なしにpassにせず、HARNESSが判定可能にするまで未充足を保持する。判定根拠不足はHARNESSへ戻す。
- AC-INT-038-04 (unknown/範囲外): CASE-INT-038-04a〜04eを独立評価する。field→oracle/owner対応: requirement/oracle revisionがunknown→HARNESS requirement/verification owner；expected failure conditionが未宣言→HARNESS verification owner；independent verification statusがunknown→HARNESS verification owner；consumer acceptance scopeがunknown→HARNESS verification owner；backflow conditionが未宣言→HARNESS verification owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。 selected connector contractのadmission状態unknownは専用fixture CASE-INT-038-04fで接続未成立を保持しCONNECT contract ownerへ返す。
- 旧source参照: 旧SYN要求 LEGACY-ASSET-F1F753F31DB8D874EF21 (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/system-synthesis-requirements.md:29–68`) と対の受入 LEGACY-ASSET-BEAB5EE27CD04F5E866F (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/system-synthesis-acceptance.md:29–42`)。SYN-AC-001のnode/edge identity・revision・digest・authorityの単独変異を旧形式の比較起点として記録し、旧CI投影は移さない。
- 旧source disposition: 旧SYN-AC-004 required verification omissionのoracleを再導出。CI executionは移さない。

未選択connectorの負例はHARNESS-L2-010/011の宣言依存・入出力契約と当該親の専用CONNECT契約から再導出する。未選択は未観測を保持しCONNECT contract ownerへ契約照会を戻す。新しいsource ownerは追加しない。

### FR-INT-039 — OS → 限定修復の検収（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-039`（L2 633bf12行289–296、L11基本表102行、R2187-01行276）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: scope付きrepair candidate、Worker execution evidence、HARNESS verification resultと各revision/receipt。出力: OS acceptanceへの検収入力。acceptance/progressはOS。責務: candidate/Worker/HARNESSの各source owner; OS acceptance owner。
- 正常条件: candidate、execution、verificationを同一repair scopeで別段階として渡す。pack failureは個別source authorityを代替せず、HARNESS-L2-010/011共通pack contractの定義ownerへ返す。
- AC-INT-039-01 (正常): 同一修復scopeのcandidate、execution evidence、HARNESS resultを区別してOSへhandoffし、OSが独自に受入判断できる証拠を残す。OS acceptanceは成立したと扱わない。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-039-02 (独立negative): CASE-INT-039-02a〜iを一変数ずつ変異する。各不成立・unknown fixtureはOS acceptanceを成立させず、該当producerまたはOS acceptance ownerへ戻す。candidate scope、Worker evidence、HARNESS result、OS receipt生成、scope違い/stale evidence、未選択connector、重複receipt、および逆順receiptを新しいacceptance evidenceにする変異を個別に拒否する。各negative/unknownでOS acceptanceは不成立のまま保持し、OS acceptance ownerまたは該当producerへ戻す。未選択connectorのnegativeはHARNESS-L2-010/011の宣言依存・入出力契約と専用CONNECT契約から再導出し、未選択を未観測のまま保つ。各operationに共通pack contractを適用しCASE-INT-039-05a〜qで各fieldを照合する。
- AC-INT-039-03 (未見入力 oracle): 未見receipt versionでも宣言済互換契約/correlation/scopeを満たすなら段階別に受領し、OS独自acceptanceを残す。範囲外は未受領としてproducer/OSへ返す。
- AC-INT-039-04 (unknown/範囲外): CASE-INT-039-04a〜04eを独立評価する。L2-016がINTELLIGENCEを配置candidateのproducerとして定めるため、candidate scope/revision不明は既存INTELLIGENCE candidate ownerへ戻し、新ownerを設けない。各fixtureでOS acceptanceは不成立のまま保持する。field→oracle/owner対応: candidate scope/revisionがunknown→INTELLIGENCE candidate owner；execution evidence producer/revisionがunknown→Worker execution/result owner；HARNESS verification applicabilityがunknown→HARNESS verification owner；OS acceptance targetがunknown→OS acceptance owner；selected connector contract identityがunknown→該当CONNECT contract owner。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source参照: LEGACY-ASSET-50CA1C554747F12266D3 (archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:189–260)；LEGACY-ASSET-437A6A68F9A9E0AE1B9E (archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md:17–55)。
- 旧source disposition: 旧RLO引用spanはreceipt/version/authority handoffの比較に限る。misordered handoff語句は当該pin spanにないため帰属させず、逆順fixtureは固定L2/L11から再導出する。旧merge/CI acceptance authorityは移さない。

### FR-INT-040 — INTELLIGENCE → LABO（1.0実績）（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-040`（L2 633bf12行298–305、L11基本表103行、R2187-01行277）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: prediction/diagnosis/review/placement/repair result、source revision、episode/scope、actual evidence/observation window。出力: LABOの過去評価材料。長期効果評価ownerはLABO。責務: INTELLIGENCE source/result owner; LABO evaluation owner。
- 正常条件: predictionとactualを同episode/scopeへ別eventで結び、source revision/windowを区別。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-040-01 (正常): prediction/diagnosis/review/placement/repair resultの各種別を個別fixtureでsource revision付きにし、後続actual outcomeがある場合は同一episode/scopeへ結び、source revisionと観測windowを分けてLABOへ渡す。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-040-02 (独立negative): CASE-INT-040-02a〜lを一変数ずつ変異する。prediction-onlyをactualとして受領せず、LABO evaluation ownerへ実測不足を戻す。prediction source identity/revision、actualのprediction代用、episode/scope、window、遅着/重複actual、未選択connector、evaluation ownerに加え、actual source revisionの欠落とpredictionとの同一化、result種別の取り違えを個別に検査する。prediction単独はactualでなく、actual欠落はLABOへ未観測として戻す。
- AC-INT-040-03 (未見入力 oracle): 遅延/重複actualをepisode/revisionで照合し、重複を別成功に数えない。prediction単独をactualにせず、実測が届くまでLABO評価材料を未観測とする。未対応actualはunknownのままLABOへ渡す。
- AC-INT-040-04 (unknown/未宣言): CASE-INT-040-04a〜gでprediction source identity/revision、actual未観測、episode/scope binding、window、duplicate/late event identityを別々に保留し、該当source/evaluation ownerへ戻す。 selected connector contractのadmission状態unknownは専用fixture CASE-INT-040-04gで接続未成立を保持しCONNECT contract ownerへ返す。
- 旧source参照: LEGACY-ASSET-28FB139B26CD61CC51EE (archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:19–84)；LEGACY-ASSET-A952A3A175EB82A4781B (archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:24–41)。
- 旧source disposition: 旧HELIX-Bench spanはfailure/missing evidence状態、旧RLO pinはreceipt境界だけの比較に限る。 旧RLO pinはLEGACY-ASSET-437A6A68F9A9E0AE1B9E（`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md:17-55`）を指す。RLO duplicate/late event distinctionは当該pin spanにないため根拠とせず、現行duplicate/late oracleは固定L2/L11から再導出する。旧metric taxonomy/score thresholdは継承しない。
- L11 R2187-01の231–251行はL2-069/070/071のmodel simulation/composite handoff detailであり、採択済みStage 4のL2-033/040へ移さない。L2-033はProduct Core/HARNESS source別receipt、L2-040は既存prediction/actual resultのLABO handoffをそれぞれの固定本文（L2 633bf12:235–242, 298–305）とL11基本表96/103に従って扱う。069–071のL2/L11は採択済みだがG0ではStage 5対象であり、simulation/consumer-receipt条件は対応するStage 5 L3/L10で起草する。本Stage 4の033/040 CASEへ前倒し適用しない。

未選択connectorの負例はHARNESS-L2-010/011の宣言依存・入出力契約と当該親の専用CONNECT契約から再導出する。未選択は未観測を保持しCONNECT contract ownerへ契約照会を戻す。新しいsource ownerは追加しない。

### FR-INT-041 — 各source mechanism → Situation Model（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-041`（L2 633bf12行307–314、L11基本表104行、R2187-01行278）、version_target `sourceごとに定義`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: 各admitted mechanismの許可current state/evidence、個別revision、connector/authority contract。出力: source別Situation Model input。個別connector/authority identityを維持。責務: 各source owner; CONNECT contract owner。
- 正常条件: 選択・admitted sourceだけをそのsource authority/revisionで反映。Web/WEB-OSはcontractがなければ未観測。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-041-01 (正常): HARNESSとOSを個別source identity/connectorで読み、各revision/scope/authorityを個別に保つ。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-041-02 (独立negative): CASE-INT-041-02a〜iを別fixtureとして一変数ずつ拒否する。field→oracle/owner対応: source identityを欠落→該当source機構owner；source current-state revisionを欠落→該当source機構owner；source evidence scopeを別機構へ結ぶ→該当source機構owner；同名HARNESS/OS fieldを同一identityへ統合→HARNESSとOSの各source ownerを別々に保持；選択sourceのconnector contractを欠落→該当CONNECT contract owner；選択sourceの互換範囲外revisionを採用→該当source機構ownerとCONNECT contract owner；未選択Web/WEB-OSを常時依存へ追加→未選択sourceは未観測として保持し依存ownerを追加しない；source authorityをINTELLIGENCEへ移す→該当source機構owner。同一connectorのsource間共有も単独変異として拒否し、source別bindingを保持して各source ownerとCONNECTへ戻す。当該fieldだけinvalid/incompleteとし、完了/権限/正本変更へ昇格させず、他の正常source/operationは維持する。固定親で要求されるHARNESS-L2-010/011 packについてはCASE-INT-041-05a〜05qの各fieldを単独検査し、不成立はHARNESS pack ownerへ戻す。
- AC-INT-041-03 (未見入力 oracle): CASE-INT-041-03は未選択Web/WEB-OSの未観測正常、03aは宣言範囲内の未見互換値の正常受入、03bは互換性unknownのnegativeとして区別する。03bは受入正常ではなくunknownを保持しsource ownerへ戻す。未選択Web/WEB-OSは未観測のままにする。選択されたsourceだけ、明示されたsource identity/revision/scopeとconnector契約を照合し、未見互換値は宣言範囲内のみ受ける。
- AC-INT-041-04 (unknown/範囲外): CASE-INT-041-04a〜04eを独立評価する。field→oracle/owner対応: selected source identity/revisionがunknown→該当source機構owner；source scope/authorityがunknown→該当source機構owner；selected connector contractがunknown→該当CONNECT contract owner；互換性rangeが未宣言→該当source機構ownerとCONNECT contract owner；未選択sourceを要求された→未選択sourceは未観測のまま保持。一つのfieldのみunknown/未宣言/範囲外ならそのfieldのみ保留し、正常な別source/operationを止めず、未選択sourceを依存にしない。
- 旧source disposition: 旧DAC document-authority-census source（LEGACY-ASSET-C6936A5DA79A6DAE4FE4、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/document-authority-census-requirements.md:27–61`）は個別source identity/class/disposition/bindingの比較、WCC source（LEGACY-ASSET-9114D4E463E95B67DD0C、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md:47–110`）はworker contractのidentity/owner/receipt境界の比較に限る（現行source revision要件は固定L2/L11から再導出）。source revision句をDAC acceptanceへ帰属させない。旧共通registry/connectorを新authorityとして採用しない。

### FR-INT-044 — INTELLIGENCE → BRAINへの非直接更新境界（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-044`（L2 633bf12行334–341、L11基本表107行、R2187-01行279）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: INTELLIGENCE decision/candidate、genericization proposal、evidence/scope、LABO evaluation handoff。出力: candidateをLABO経路へ渡す。BRAIN knowledge canonicalを保持し直接出力しない。責務: LABO evaluation owner; BRAIN knowledge owner。
- 正常条件: scope/evidence/評価状態を明示したcandidateをLABOへ渡す。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-044-01 (正常): generic candidateと出典/scopeをLABOへ渡し、BRAIN knowledge正本を変えない。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-044-02 (独立negative): CASE-INT-044-02a〜jを一変数ずつ変異する。candidate identity/source、evidence scope、LABO evaluation省略、未評価からのBRAIN更新、評価scope違い、根拠のない汎用性、未選択connector、BRAIN直接出力、証拠欠落candidateからのBRAIN更新を個別に拒否する。BRAIN canonicalは変更せず、未評価/evidence欠落はLABO evaluation ownerへ戻す。共通packの各fieldはCASE-INT-044-05a〜qで独立照合し、pack不成立はHARNESS pack contract ownerへ戻す。 未選択connector負例はHARNESS-L2-010/011の宣言依存・入出力契約と専用CONNECT契約から再導出し、未選択sourceを親固有の常時依存へ昇格させない。
- AC-INT-044-03 (未見入力 oracle): 未見candidate kindもsource/scopeを維持してLABOへ渡し、評価例がないものをgeneralizableと断定しない。
- AC-INT-044-04 (unknown/未宣言): CASE-INT-044-04a〜hでcandidate identity/source、evaluation evidence identity、evaluation applicability/scope/status、BRAIN direct-update経路、generic scopeを独立に保留し、candidate/evidence/evaluationの不足はLABO evaluation owner、BRAIN canonicalはBRAIN ownerへ戻す。選択connector contractのadmission不明（04h）はCONNECT contract ownerへ戻す。
- 旧source disposition: 旧UWJ-FR-009/010とUWJ-AC-009/010（LEGACY-ASSET-5EE032D657C221184B00（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md:41–55`）、LEGACY-ASSET-6FFD7F4E58066D08B053（`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md:17–26`））のfacts/candidate/proposal-onlyと自己承認拒否を比較起点とする。旧SYN/DACをこのpinのsourceとして称さず、当該scopeのLABO evaluation/BRAIN canonical境界を固定L2/L11から再導出する。旧human gateは追加せず現ownerへ置換。

### FR-INT-045 — INTELLIGENCE → Product Core Backflow（Stage 4）

- 固定親 `HELIXINTELLIGENCE-L2-045`（L2 633bf12行343–350、L11基本表108行、R2187-01行280）、version_target `1.0`。固定L2/L11・PO採択revisionをsource authorityとし、L11基本表92–108行と個別R2187行を対応根拠にする。
- 入力: Product Core meaning conflict/gap/improvement candidate、source revision、target identity。出力: 該当Product Core向けbackflow candidate。canonical変更はProduct Core owner。責務: INTELLIGENCEは判明した対象Product Core向けbackflow candidateを作り、正本変更は該当Product Core ownerへ残す。target identityまたはownerが不明ならunroutedで照会し特定を求める。
- 正常条件: target product/owner/revisionに結び付くbackflow candidateを返し、sourceを直接変更しない。target identityまたはownerが不明ならunroutedの照会candidateとして保持する。HARNESS-L2-010/011共通packのidentity、契約/成果物/依存版、declared compatibility、交換・更新・rollbackを各parent operationで保持する。pack failureを個別source authorityの代替にせず、pack/sourceに応じたownerへ返す。
- AC-INT-045-01 (正常): 対象Product Core identity/owner/revisionが判明している場合は該当product/revision/ownerに結ぶbackflow candidateを出力し、正本変更はownerに残す。対象identityまたはownerが未確定なら照会candidateを作りunroutedで保持する。 INTELLIGENCEはsource authorityと正本ownerを保持し、状態変更を生成しない。
- AC-INT-045-02 (独立negative): CASE-INT-045-02a〜mを一変数ずつ変異する。02aのunrouted保持と02kのtarget既知時の直接route拒否を含める。target identity/revision、meaning evidence、誤owner routing、正本直接変更、既決扱い、未選択connector、source identity/revision/scope、target ownerまたはrevision不明candidateの別Product Core routingの各条件を個別に拒否する。targetが判明した通常出力は該当Product Core向けbackflow candidateとし、target identityまたはownerが未確定ならunrouted照会candidateにする。owner/正本を創作・変更しない。共通packの各fieldはCASE-INT-045-05a〜qで独立照合し、pack不成立はHARNESS pack contract ownerへ戻す。未選択connectorは未観測を保持しCONNECT contract ownerへ照会する。 未選択connector負例はHARNESS-L2-010/011の宣言依存・入出力契約と専用CONNECT契約から再導出し、未選択sourceを親固有の常時依存へ昇格させない。
- AC-INT-045-03 (未見入力 oracle): 未見product identityではowner名の明示だけで対象Product Coreを識別した扱いにせず、まずunrouted/unidentifiedのまま保持する。identity/source/revision/scopeが固定L11に照合できた後にのみ既存owner境界を適用する。
- AC-INT-045-04 (unknown/未宣言): CASE-INT-045-04a〜gでtarget identity、owner不明、source identity/revision/scope、meaning-conflict evidence、connector contractを個別に保持する。Product Core対象が未識別ならowner名だけでrouteせずunroutedにし、connector不明だけはCONNECT ownerへ戻す。
- 旧source参照: LEGACY-ASSET-9B6FC1ED349F96394497 (archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/bugbot-generation-requirements.md:18–70)；LEGACY-ASSET-658FF8439F9F8E694710 (archive/legacy-generation-2026-09-14/root/docs/test-design/helix/bugbot-generation-acceptance.md:31–41)。
- 旧source disposition: 旧BBG-R03 false claim/scope expansionおよびAC03 negative oracleを再導出。旧CLI/generator/direct writebackは移さない。

## Stage 4 共通trace補足

**review06 trace補足**：017の固定L11:92のpermission/execution/acceptance代替はCASE-INT-036-02h、CASE-INT-037-02iとCASE-INT-039-02c/02d/02fにも結び、017-02oはrevokedを期限切れ02iと独立化する。034-02l/02m/02nはAC-INT-034-02の原success/failure結果値の両方向反転/欠落を単独照合する。041のL11:278「未知版」はcompatibility unknown/未宣言の03bへ対応する。L11:260の共通範囲条件と固定L2:314のdeclared compatibility契約を適用し、宣言範囲内と既知の未fixture版03aを拒否しない。

## Stage 3 — 採択済み22親の機能要件

状態: L3承認前の要件候補。対象はmain 633bf12採択のStage 3 / version_target 1.0の22親だけ。PO決定行を対象revisionの採択根拠とし、後続登録metadataはそのscopeを拡張しない。L3候補は実装・実行・release許可を生成しない。

旧HELIXの旧L3定義・shared FR/ACとpaired L10 oracleのtrace形を再導出する。INT専用sourceがある項目は旧source/consumerの対応箇所を親別に読み、保持・再導出・置換と理由を表へ記録した。旧runtime、CLI、score、workflow、approval gateを現行authorityへ移さない。対象Stage外の候補全文はコピーしない。

### 親別source disposition

| 親 | PO登録 (1.0) | 固定L2/L11 | 旧source asset / span | 再利用・再導出・置換の判断 |
|---|---|---|---|---|
| `001` | `MPR-RC-HELIXINTELLIGENCE-L2-001-002` Stage 3 / 1.0 | L2 48–53; L11 62, 260, 264 | LEGACY-ASSET-F1F753F31DB8D874EF21 40–68; LEGACY-ASSET-5EE032D657C221184B00 41–63; LEGACY-ASSET-BEAB5EE27CD04F5E866F 25–33; LEGACY-ASSET-6FFD7F4E58066D08B053 15–34 |5EE0 (41–63; also 005) のsource package receipt bindingとstable `source_transition_id`による双方向trace、およびworkflow transitionの概念だけを比較起点とする。domain identityと分割・統合・退役の対象・境界は固定L2から再導出し、旧source package/inventory、route registry、fixed enumは移さず置換対象。 |
| `002` | `MPR-RC-HELIXINTELLIGENCE-L2-002-002` Stage 3 / 1.0 | L2 54–59; L11 63, 260, 265 | LEGACY-ASSET-5EE032D657C221184B00 41–63; LEGACY-ASSET-F1F753F31DB8D874EF21 40–68; LEGACY-ASSET-6FFD7F4E58066D08B053 15–34; LEGACY-ASSET-BEAB5EE27CD04F5E866F 25–33 |5EE0のsource package identity bindingとworkflow routingのsource/destination・capability/capacity制約を比較起点とする。domainごとの必要capability、組合せ、未構成unknownは固定L2から再導出し、旧global route/能力規則は移さず置換対象。 |
| `003` | `MPR-RC-HELIXINTELLIGENCE-L2-003-003` Stage 3 / 1.0 | L2 60–65; L11 64, 146, 156 | LEGACY-ASSET-C6936A5DA79A6DAE4FE4 27–82; LEGACY-ASSET-F1F753F31DB8D874EF21 40–68; LEGACY-ASSET-BBD687399574FEE23807 26–48; LEGACY-ASSET-BEAB5EE27CD04F5E866F 25–33 |C6936のsource revision/provenance graphは比較起点に限る。Situation Modelの全field結合・authority意味は固定L2/L11から再導出し、旧snapshot/runtimeを置換対象とする。BBD6 (26–48; 003/009/013)・BEAB・F1F7は隣接比較であり、この親の意味根拠やoracleとして移さない。 |
| `004` | `MPR-RC-HELIXINTELLIGENCE-L2-004-003` Stage 3 / 1.0 | L2 66–71; L11 65, 146, 157 | LEGACY-ASSET-5EE032D657C221184B00 41–63; LEGACY-ASSET-E78B8D68CC327AA00991 26–90; LEGACY-ASSET-6FFD7F4E58066D08B053 15–34; LEGACY-ASSET-AD746F4F3487103519F9 16–33 |5EE0のfacts/candidates/proposal・confidence・counterevidence・unresolved記録、およびE78Bのstable ID/revision・evidence付きcandidate/event traceを比較起点とする。4値分類と現行source/revision/evidence/inference/uncertaintyの意味は固定L2から再導出する。AD74は旧受入oracle自体を移さずfixtureの正常/拒否構造の照合に限り、旧scoring/state schema、authority lifecycle、test oracleは置換対象。 |
| `005` | `MPR-RC-HELIXINTELLIGENCE-L2-005-003` Stage 3 / 1.0 | L2 72–77; L11 66, 146, 158; BRAIN metadata fieldsは採択済みL2-013/L11 74・166およびL2-019/L11 79・171への横断参照 | LEGACY-ASSET-5EE032D657C221184B00 41–63; LEGACY-ASSET-F1F753F31DB8D874EF21 40–68; LEGACY-ASSET-6FFD7F4E58066D08B053 15–34; LEGACY-ASSET-BEAB5EE27CD04F5E866F 25–33 |5EE0のcandidateとdecision/authority分離はplan comparisonの起点に限る。BRAIN knowledgeのsource identity/revision/applicabilityと原sourceへ辿れるtrace、sourceが提供する場合のdata-use区分は採択済みL2-013/019のsource-bound metadata・applicability条件を参照し、L2-005固有の追加authorityとはしない。OS ticket境界、plan relation、現行contractはL2-005/L11から再導出し、旧workflow compiler/routeは置換対象。 |
| `006` | `MPR-RC-HELIXINTELLIGENCE-L2-006-003` Stage 3 / 1.0 | L2 78–83; L11 67, 146, 159 | LEGACY-ASSET-F1F753F31DB8D874EF21 40–68; LEGACY-ASSET-28FB139B26CD61CC51EE 21–148; LEGACY-ASSET-BEAB5EE27CD04F5E866F 25–33; LEGACY-ASSET-A952A3A175EB82A4781B 19–46 |隣接参照のみ（当該spanはprediction/assumption/falsificationの直接根拠ではない）。現行risk categoryとLABO handoffは固定L2/L11から再導出し、legacy prediction score/SLOを置換対象。 |
| `007` | `MPR-RC-HELIXINTELLIGENCE-L2-007-003` Stage 3 / 1.0 | L2 84–89; L11 68, 146, 160 | LEGACY-ASSET-17C4BF78919578FEBB18 129–160; LEGACY-ASSET-9B6FC1ED349F96394497 34–75; LEGACY-ASSET-D881AF6AFD277B1DE934 1–79; LEGACY-ASSET-658FF8439F9F8E694710 15–42; LEGACY-ASSET-0B5B38F146D9538C9A36 16–46; LEGACY-ASSET-901CD182B52024593E41 1–30 |17C4:129–160はOPS-R-10/11/13の製品ライフサイクル診断、終端証拠、backflow/re-entryの意味比較に限り、Worker/repair obligationとは扱わない。0B5B:16–46はUIL受入fixture/test-design構造の比較のみでdiagnosis意味根拠ではない。現行episode境界、不完全/矛盾証拠下のdiagnosisとLABO長期history分担は採択済みL2/L11から再導出する。BBGはsource/generator/output/consumer区分の隣接例だけ。BBR candidateはdiagnosisとrepairの分離参照に限り、既存incident/repair runtimeは置換対象。 |
| `008` | `MPR-RC-HELIXINTELLIGENCE-L2-008-003` Stage 3 / 1.0 | L2 90–95; L11 69, 146, 161 | LEGACY-ASSET-9114D4E463E95B67DD0C 47–137; LEGACY-ASSET-28FB139B26CD61CC51EE 21–148; LEGACY-ASSET-C6ADB99F1353965C5449 18–60; LEGACY-ASSET-A952A3A175EB82A4781B 19–46 |9114のreviewer identity/context separationと28FB/A952のbenchmark comparisonは隣接比較の起点に限る。C6AD:18–60は旧HAT-WCC-01〜09 acceptance tableの構造比較に限り、旧oracleは移さない。review evidence/counterexample/non-authorityの現行意味は固定L2/L11から再導出し、旧merge/release gate・acceptance oracleを移さず置換対象とする。 |
| `009` | `MPR-RC-HELIXINTELLIGENCE-L2-009-003` Stage 3 / 1.0 | L2 96–101; L11 70, 146, 162 | LEGACY-ASSET-C6936A5DA79A6DAE4FE4 27–82; LEGACY-ASSET-02D897E62EF2FA267267 41–201; LEGACY-ASSET-BBD687399574FEE23807 26–48; LEGACY-ASSET-0B5B38F146D9538C9A36 16–46 |旧sourceはtyped finding/provenance/backflow表現の比較起点に限り、legacy test-design/oracleは移さない。current mechanismsとexact HEAD ownerは固定L2/L11から再導出し、Census全工程/UIL/TER runtimeを移管しない。 |
| `011` | `MPR-RC-HELIXINTELLIGENCE-L2-011-004` Stage 3 / 1.0 | L2 108–113; L11 72, 146, 164, 198 | LEGACY-ASSET-28FB139B26CD61CC51EE 21–148; LEGACY-ASSET-9114D4E463E95B67DD0C 47–137; LEGACY-ASSET-A952A3A175EB82A4781B 19–46; LEGACY-ASSET-C6ADB99F1353965C5449 18–60 |controlled comparison dimensionsとhistorical cohort separationは比較起点に限る。固定L2のsame corpus/scopeへ再導出し、legacy benchmark scoring/qualification thresholdsを置換対象。 |
| `012` | `MPR-RC-HELIXINTELLIGENCE-L2-012-003` Stage 3 / 1.0 | L2 114–119; L11 73, 146, 165 | LEGACY-ASSET-5EE032D657C221184B00 41–63; LEGACY-ASSET-E78B8D68CC327AA00991 26–90; LEGACY-ASSET-6FFD7F4E58066D08B053 15–34; LEGACY-ASSET-AD746F4F3487103519F9 16–33 |5EE0/E78Bはsource attributionとuncertainty traceの比較起点に限り、6FFD/AD74は旧acceptance fixture構造の参照に限る。L2 uncertainty labels/next-evidence routesへ再導出し、legacy confidence score-as-authorityと旧test oracleを移さない。 |
| `013` | `MPR-RC-HELIXINTELLIGENCE-L2-013-003` Stage 3 / 1.0 | L2 120–125; L11 74, 146, 166 | LEGACY-ASSET-C6936A5DA79A6DAE4FE4 27–82; LEGACY-ASSET-5EE032D657C221184B00 41–63; LEGACY-ASSET-BBD687399574FEE23807 26–48; LEGACY-ASSET-6FFD7F4E58066D08B053 15–34 |C6936/5EE0のtrace edge/inspectability表現は比較起点に限る。BBD6/6FFDは旧test-design/oracleの参照に限り、現行L2 fields/data-use boundaryへ再導出して旧full regeneration/schema/runtime mechanicsは移さない。 |
| `014` | `MPR-RC-HELIXINTELLIGENCE-L2-014-003` Stage 3 / 1.0 | L2 126–131; L11 75, 146, 167 | LEGACY-ASSET-9B6FC1ED349F96394497 34–75; LEGACY-ASSET-9114D4E463E95B67DD0C 47–137; LEGACY-ASSET-D881AF6AFD277B1DE934 1–79; LEGACY-ASSET-658FF8439F9F8E694710 15–42; LEGACY-ASSET-C6ADB99F1353965C5449 18–60; LEGACY-ASSET-901CD182B52024593E41 1–30 |9114:47–137はworker identity/context・別session境界の比較起点、C6AD:18–60はHAT-WCC-01〜09受入表の構造比較に限り、現行Bot/Worker reviewerの独立性は固定L2/L11から再導出する。provider/model familyを014の追加判定条件にはしない（WCC-FR-06の別scope）。D881:1–79/901C:1–30は限定修復candidate・write-set/許可境界の隣接比較に限り、Worker obligationとは扱わない。9B6/658Fは定型生成のsource/generator/output/consumer境界の隣接例だけとし、旧受入oracleは移さない。17C4:129–160は製品ライフサイクル診断/終端証拠/backflowでありBot/Worker契約を支えないため、この親のsourceには含めない。Bot候補のidentity/purpose/scopeとOS割当境界は採択済みL2から再導出し、実作業はOS割当Workerに限る。旧Bot CLI/automatic authoringは置換対象。 |
| `015` | `MPR-RC-HELIXINTELLIGENCE-L2-015-003` Stage 3 / 1.0 | L2 132–137; L11 76, 146, 168 | LEGACY-ASSET-9B6FC1ED349F96394497 34–75; LEGACY-ASSET-02D897E62EF2FA267267 41–201; LEGACY-ASSET-D881AF6AFD277B1DE934 1–79; LEGACY-ASSET-658FF8439F9F8E694710 15–42; LEGACY-ASSET-0B5B38F146D9538C9A36 16–46; LEGACY-ASSET-901CD182B52024593E41 1–30 |固定L2-015の複数episodeとfalse-positive/missの意味を再導出する。旧UILの複数episode・counterexample付きrecipe候補化（LEGACY-ASSET-02D897E62EF2FA267267:179–181）を近接例として参照する。near-miss oracleは固定L11:168から再導出し、BBG/BBRにないfailure-pattern/independent-episode規則を帰属させない。頻度thresholdと旧Bot runtime/authorityは移さない。 |
| `016` | `MPR-RC-HELIXINTELLIGENCE-L2-016-003` Stage 3 / 1.0 | L2 138–143; L11 77, 146, 169 | LEGACY-ASSET-02D897E62EF2FA267267 41–201; LEGACY-ASSET-17C4BF78919578FEBB18 129–160; LEGACY-ASSET-D881AF6AFD277B1DE934 1–79; LEGACY-ASSET-0B5B38F146D9538C9A36 16–46; LEGACY-ASSET-F46AB11BD14F2C0469F4 1–53; LEGACY-ASSET-901CD182B52024593E41 1–30 | BBR-R03–R05（D881/901C）のscope-bound repair candidate、write-set/recovery/post-checkと許可境界を比較起点とし、旧UIL（02D8:41–201）は関連語と既存consumer照合に限る。17C4:129–160はOPS-R-10/11/13の製品ライフサイクル診断、終端証拠、BackflowDecision/再入の意味比較に限り、Worker obligation・repair許可・Worker contractとは扱わない。Worker実行/assignmentは固定L2/L11のOS境界から再導出する。0B5B:16–46はUIL acceptance fixture/test-designであり、BRAIN source/refusal根拠には使わない。D881:50・901C:22の旧repair境界との比較に限る。外部文書command・改変修復器という具体条件は旧source由来であり、現行では固定L2/L11の未信頼candidate境界として再導出し、旧repairer仕様は継承しない。F46A:1–53は旧OPS受入fixtureの入力/結果対応の照合に限る。旧実行runtime・authorityは現行へ移さない。 |
| `018` | `MPR-RC-HELIXINTELLIGENCE-L2-018-003` Stage 3 / 1.0 | L2 144–149; L11 78, 146, 170 | LEGACY-ASSET-28FB139B26CD61CC51EE 21–148; LEGACY-ASSET-02D897E62EF2FA267267 41–201; LEGACY-ASSET-A952A3A175EB82A4781B 19–46; LEGACY-ASSET-0B5B38F146D9538C9A36 16–46 |28FB/A952 cohort/time-seriesはcurrent/historical分離の比較起点に限る。旧self-improvement adoption loopは移さず、現在/履歴labelおよびLABO/OS/target-owner責務は固定L2/L11から再導出する。 |
| `019` | `MPR-RC-HELIXINTELLIGENCE-L2-019-003` Stage 3 / 1.0 | L2 150–155; L11 79, 146, 171 | LEGACY-ASSET-9114D4E463E95B67DD0C 47–137; LEGACY-ASSET-899A61905AFBC415F595 34–53; LEGACY-ASSET-C6ADB99F1353965C5449 18–60 |旧BRAIN専用同一要件なし。隣接worker/memoryは用語照合だけに再利用し、Pattern/Unit/Part適用とBRAIN/LABO backflowは固定L2から再導出、BRAIN runtime/writebackは移さない。 |
| `020` | `MPR-RC-HELIXINTELLIGENCE-L2-020-003` Stage 3 / 1.0 | L2 156–161; L11 80, 146, 172 | LEGACY-ASSET-E78B8D68CC327AA00991 26–90; LEGACY-ASSET-335176749F6322C3CD8D 35–58; LEGACY-ASSET-AD746F4F3487103519F9 16–33; LEGACY-ASSET-879D95C07B789C9502CF 15–43 |3351:35–58/879D:15–43はDesign HARNESSのVDH-FR/AC vision/UI契約の隣接比較に限り、Product Coreの意味根拠として再利用しない。現行L2-020の意味とowner境界は固定親から再導出する。旧runtime・authorityは置換対象。 |
| `067` | `MPR-RC-HELIXINTELLIGENCE-L2-067-001` Stage 3 / 1.0 | L2 466–490; L11 199, 197 | LEGACY-ASSET-50CA1C554747F12266D3 663–666; LEGACY-ASSET-28FB139B26CD61CC51EE 21–148; LEGACY-ASSET-9114D4E463E95B67DD0C 47–137; LEGACY-ASSET-437A6A68F9A9E0AE1B9E 43–43; LEGACY-ASSET-A952A3A175EB82A4781B 19–46; LEGACY-ASSET-C6ADB99F1353965C5449 18–60 |RLO-FR-040/AC-030のscope-bound effort/evidence atomsとBench comparisonsは意味比較の起点に限る。source applicability/priority decisionと既存LABO 034 handoffはPO採択L2-067から再導出し、old ranker/route/worker executionは置換対象。 |
| `072` | `MPR-RC-HELIXINTELLIGENCE-L2-072-005` Stage 3 / 1.0 | L2 561–598, 673–687; L11 289–314, 398–434 (6 part) | LEGACY-ASSET-719D5EC9C06FC4AAD0FF 81, 147–148; LEGACY-ASSET-A60CF91DD2AF6693E6F9 `requirements.json#/HIL-NFR-34`; LEGACY-ASSET-9114D4E463E95B67DD0C 47–137; LEGACY-ASSET-C6ADB99F1353965C5449 18–60 |再利用HIL-BR-29 versioned pack/shadow/non-force atoms。WCC-FR-06（9114:60）はprovider/model family条件、HAT-WCC-07（C6AD:35）は別identity・別session条件として書き分ける。現行PO 09-26のidentity/context/authority/route判定は採択親から再導出する。fixed adopted 005 scopeへINT candidate, HARNESS common contract, OS state, LABO effect separationを再導出し、old placement/runtime/hard gate mechanicsは移さない。 |
| `073` | `MPR-RC-HELIXINTELLIGENCE-L2-073-002` Stage 3 / 1.0 | L2 601–608; L11 317–326 | LEGACY-ASSET-EB3700B0088F311C2295 45–46; LEGACY-ASSET-CAC0C64EB7540180B1FE 18 (reference only) |AAFD-R-04のdetector優先度と直接projection制約は旧候補の意味として参照再利用し、採択PO親L2-009/073のscopeへ再導出する。旧probe/UIL runtimeとissue/CI/merge routeは置換対象。 |
| `078` | `MPR-RC-HELIXINTELLIGENCE-L2-078-001` Stage 3 / 1.0 | L2 646–658; L11 363–382 | LEGACY-ASSET-EB3700B0088F311C2295 55–67, 73–92; LEGACY-ASSET-CAC0C64EB7540180B1FE 20–21, 23–26, 43, 46 | 再利用AAFD R-06/07/09-12 semantic atoms per bounded old source span; current parent L2-009/012 plus accepted HARNESS-023 dependency classificationへ再導出し、old schema/DB/event runtime/owner assignmentを置換対象。 |

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

goal/target、prerequisite/dependency/order、並列可能性、期待結果、risk/uncertainty、stop/fallback、BRAIN knowledgeのsource identity/revision/applicabilityと原source traceを承認済み要求・現行contract revisionに結ぶ。sourceがdata-use classを提供する場合はその値も保持し、未提供は欠落扱いしない。提供済み値の欠落・不一致は未完とする。OS ticket/authorityを生成しない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-005-01` 正常成立とtrace**：承認済みtargetと依存2件、source identity/revision/applicabilityと原source traceを持つBRAIN knowledgeを与え、data-use classがsourceから提供される場合はその値も保持した候補で順序・並列・停止条件を明示し、candidate状態のまま返すこと。data-use classを提供しないsourceも正常入力となる。
- **`AC-INTELLIGENCE-L3-005-02` 個別変異・owner境界**：未承認/stale要求、current-state source欠落、dependency欠落、fallback欠落、risk条件欠落、BRAIN knowledgeのsource identity/revision/applicability欠落および原source traceの到達不能を別々に変異し、計画を確定せず該当source ownerへ返す。OS ticket/割当情報はOSへ戻す。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-005-03` held-out正常／局所unknown**：別のheld-out task graphと一つのrisk条件でapproved target/current contractが揃う候補は依存順序・実現可能性・stop/fallbackを事前oracleと照合して扱い、stop条件のみ欠ける部分は未確定にする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
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
- **`AC-INTELLIGENCE-L3-007-02` 個別変異・owner境界**：単一相関、矛盾証拠、欠落sourceを個別/併発で投入し、root cause断定・repair実行・長期評価を発生させない。episode identity/source/revisionまたは反証の不足は当該観測source ownerへ追加観測要求として戻し、終了episodeの長期効果はLABOへ残す。repair判断・実行・assignmentは本親からOSへ生成しない。
- **`AC-INTELLIGENCE-L3-007-03` held-out正常／局所unknown**：未見episodeでもsourceが一致する活動中diagnosisは評価し、反証sourceが未取得の原因候補だけprobable/unknownに留める。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-008-01` — `HELIXINTELLIGENCE-L2-008`

**要件：revision-bound review finding**

review対象の集合（requirement consistency、design、implementation、test、CI、integration、release preparation、operational change、HELIX自身のartifacts）とtarget revision/scope/evidence/reproduction/counterexample/severity候補/routeを結び、review結果単独でmerge/requirement/release/acceptanceを変更しない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-008-01` 正常成立とtrace**：一致するtarget HEADと再現可能なfindingを入力し、証拠・counterexample・routeを同一revisionへ結ぶこと。
- **`AC-INTELLIGENCE-L3-008-02` 個別変異・owner境界**：HEAD/scopeずれ、再現欠落、反例の隠蔽、requirement-change/release/acceptance/merge状態の各生成を別々に投入し、findingをそれらの状態へ昇格させない。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
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

- **`AC-INTELLIGENCE-L3-011-01` 正常成立とtrace**：同一corpus・同一責務scope・同一評価条件revisionへcurrent/candidateの測定結果を結び、各model/provider実行版を個別表示する。candidate間で実行版が異なる正常比較も許し、各run receiptのfindings、false positives、misses、reproducibility、latency、costを値・単位・欠測状態を保って軸別に表示する。期待値は同じfixtureに結んだrun receiptの値と一致し、優劣やwinnerを導かない。
- **`AC-INTELLIGENCE-L3-011-02` 個別変異・owner境界**：corpus/scope/評価条件revisionの各不一致、実行版欠落、宣言実行版と結果版の不一致を個別に検査し、比較不能範囲を局所化する。実行版の候補間差異だけを不一致扱いしない。findings、reproducibility、latencyの各値を正常run receiptから一つずつ別fixtureで改変または欠落させ、該当metricだけを不一致／unknownとして比較から外し、他の正常metricを保持する。model更新名だけで優位判定せず、winnerや比較結果からの自動swapを出さない。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-011-03` held-out正常／局所unknown**：未見provider pairでもcorpus/scope/評価条件revisionが一致し、各結果がそれぞれ宣言実行版に結び付く場合は、実行版が異なっても比較する。未観測cost軸だけ未評価とする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-012-01` — `HELIXINTELLIGENCE-L2-012`

**要件：不確実性と次の必要情報**

known/probable/uncertain/unknown/contradictoryを根拠とともに表し、次に要る証拠またはowner decisionを示す。unknownはsafe/success/no-issueを意味しない。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-012-01` 正常成立とtrace**：既知fieldと不足fieldの混在入力で、既知範囲を保持し不足fieldごとに必要証拠/decisionを示すこと。
- **`AC-INTELLIGENCE-L3-012-02` 個別変異・owner境界**：unknownをsafe/success/no-issueへ写す変異、矛盾を隠す変異を個別に拒否する。missing/stale source fieldはそのfieldを供給するsource ownerへ戻す。必要な次の証拠は既存のDiscovery/test/review担当へ、未決の閾値または人の判断条件はその判断を持つ既存ownerへ戻し、unknownのままにする。
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
- **`AC-INTELLIGENCE-L3-014-02` 個別変異・owner境界**：identity衝突と、purpose/scope/input/output/allowed action/stop condition/versionの各欠落・不一致を個別に照合する。manifest/scope不足なら通常INTELLIGENCE判断候補へ戻す。assignment/evidence不足だけをOSへ戻し、manifestからOS assignment/実行を派生させない。scope外の実作業を停止する。
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

repair candidateと修復結果の照合を区別する。candidateではtarget revision・actor・write-set・side effect・budget・deadline・retry・impact scope・recoveryを全てsourceに結び、期待効果と境界を記述する。結果評価では既存authority/OS assignment/Worker resultから得た実結果だけを受け、同じtarget/write-set/side effect/budget/recovery境界、成功・失敗・回復/事後検証を照合する。要求/設計/verification obligationの意味差は差分とownerを示して上流へ返し、候補記述を可能なまま確定/実行しない。外部文章のcommand、改変された修復器、未信頼入力をそれぞれ特権実行へ変換せず、未信頼のまま保持してsource/SECURITY/OS ownerへ戻す。candidate登録から実行許可は生成しない。旧BBR候補は比較起点に限る。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-016-01` 正常成立とtrace**：candidate inputで9束縛（target revision, actor, write-set, side effect, budget, deadline, retry, impact scope, recovery）と期待結果を明示する。別fixtureで既存authority/OS assignmentに対応するWorker resultを受け、実target差分・write-set内外・side effect・実budget/deadline/retry結果・recovery/post-checkをcandidateの宣言と照合する。候補生成は結果検証を前提とせず、結果検証は実行/許可を作らない。
- **`AC-INTELLIGENCE-L3-016-02` 個別変異・owner境界**：candidate入力では9束縛を一つずつ欠落/不一致にする。result fixtureではstale target、scope外書込、循環、二重実行、予算超過、不明副作用を個別に投入し、Worker result/after-state/recovery evidenceを観測する。外部文章のcommand、改変された修復器、未信頼入力の特権実行は互いに独立した変異として拒否し、該当source、permission/executionならSECURITY/OS ownerへ戻す。要求/設計/verification obligationの意味差はcandidate上のdiffと上流ownerを示す。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-016-03` held-out正常／局所unknown**：未見targetでも9束縛が揃う場合はcandidateを作り、別に既存assignmentに結ぶresult fixtureがある場合だけ結果照合を行う。candidateの束縛sourceが欠ける場合は既知fieldを保持して適用を確定せず該当source ownerへ返す。actual result/recoveryが欠ける場合はcandidate状態を維持し、結果だけunknownにする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-018-01` — `HELIXINTELLIGENCE-L2-018`

**要件：現在判断と長期効果の境界**

現在のINTELLIGENCE判断とLABOのhistorical effectを別に保持する。OSはproposalを登録し、対象ownerが意味変更を判断する。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-018-01` 正常成立とtrace**：同じ方法のcurrent proposalと複数時点のLABO測定を入力し、時点/scope/ownerを保持して別statusで表示すること。
- **`AC-INTELLIGENCE-L3-018-02` 個別変異・owner境界**：古い効果をcurrent truthへ昇格、INTELLIGENCEが自己改善を採択、LABO評価だけから長期改善を採択、owner判断なしの変更を起こす変異を拒否する。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
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

すでに決定済みのquality/order inputとLABO evidenceをscope-boundに既存L2-010 proposalへ反映する。新router/ranker/assignmentは作らない。 HARNESS-L2-010/011の共通pack contractと各revision（decision、quality oracle、evaluation、source/target、artifact、task、run/cohort/experiment条件）は固定親が要求する入力として同scopeへ結ぶ。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-067-01` 正常成立とtrace**：決定済みの優先入力・適用scope・LABO evidenceと、LABO052の同一結果receiptをcontract版/互換/scope一致で照合して既存proposal contractへ渡す。出力では同一task/scope内の採用候補、除外候補と各理由、使用するeffort条件、quality gate、費用・完了時間・human intervention evidenceを入力sourceの値と一致させて追跡できること。未測定値はunknownのまま示し、割当・実行・資格を生成しない。
- **`AC-INTELLIGENCE-L3-067-02` 個別変異・owner境界**：未決入力、異scope、LABO evidence欠落に加え、effort条件または完了時間evidenceだけを欠落／不一致にする変異をそれぞれ独立に検査する。不足項目を固定L2-067の区分へ戻す：task/scope/assignment/result receiptはOS/source owner、oracle/quality gateはHARNESS/requirement owner、LABO実績・比較scope・価格根拠・effort/time receiptはLABO、priority/toleranceはdecision owner。sourceまたはownerが特定できなければunknownのまま保留し、推定名を作らない。残る候補・除外理由・品質条件を保持し、別責務の状態を作らない。新順位やassignmentを生成しない。
- **`AC-INTELLIGENCE-L3-067-03` held-out正常／局所unknown**：未見のquality/order inputでも既に決定済みでL2-010 scopeに適合すれば既存proposalへ反映し、未決/異scopeだけ未確定にする。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
### `FR-INTELLIGENCE-L3-072-01` — `HELIXINTELLIGENCE-L2-072`

**要件：versioned judgment-pack candidate**

judgment packのversion/applicability/shadow/review/rollback義務を示し、強制適用しない。HARNESS/OS/LABO ownerと3.0 learning境界を保持し、`MPR-RC-HELIXINTELLIGENCE-L2-072-004`の登録4 partと`MPR-RC-HELIXINTELLIGENCE-L2-072-005`の追加2 partを別々に追う。これはHELIXINTELLIGENCE-L2-004/-005親とは別の登録IDである。

**受入条件（各ACの入力条件を対応CASEで照合）**

- **`AC-INTELLIGENCE-L3-072-11` 6-part親保持**：6-part保持に加えて、採択済みB配置と1.0 candidate-generation/shadow評価境界を適用する。常時必要なL2-001/002の選択domain identity/capability構成を照合する。新しい実験を選ぶ場合だけHELIXLABO-L2-006のOS割当Worker・結果対応を適用し、system化/operation配分を評価する場合だけHELIXLABO-L2-007の条件を適用する。未選択の新規実験を毎回要求せず、効果評価ownerをLABOに残す。selected sourceのruntimeが同じ/異なることだけで独立性を判断しない。AC-072-02と02tの併発例に代えて、依存missing/stale/unsupported版、reference-onlyの依存昇格、domain/capability非結合、default-checklist fallback、comparison-condition mismatch、候補を判断結果とする誤り、再評価後normalを独立CASEで照合する。PO採択済み6-part登録（`MPR-RC-HELIXINTELLIGENCE-L2-072-004`の4 partと`MPR-RC-HELIXINTELLIGENCE-L2-072-005`の2 part）を個別に保持する。登録`MPR-RC-HELIXINTELLIGENCE-L2-072-004`の既存4-part/shadow layoutと登録`MPR-RC-HELIXINTELLIGENCE-L2-072-005`のselected-source stale facetを一つの条件へ畳まず、後発PO追加partは追加判断記録のexact sourceに結ぶ。6-part保持自体をこのACへtraceする。
- **`AC-INTELLIGENCE-L3-072-01` 正常成立とtrace**：適用scopeとpack revisionが一致するshadow candidateを入力し、review/rollback条件とnon-force状態、072-004と072-005登録の各partを保つこと。
- **`AC-INTELLIGENCE-L3-072-02` 個別変異・owner境界**：stale applicability、review欠落、rollback根拠欠落、forced stateを独立に変異する。不足時は該当source/責務ownerへ戻し、別責務の状態を生成しない。
- **`AC-INTELLIGENCE-L3-072-03` PO固定6-part追跡**：PO採択digest `sha256:d8376dc314dc4aebe7b413a40d4855e3147d6e5ec870d9790395825c5f8cc775`を、`docs/governance/decisions/po-decision-2026-10-03-additions10.md`の合成規則どおり6 partの正規化bytes（各末尾空行を除いてLF終端、列挙順、part間区切りなし）から再現する。partは順に、(1) L2 original `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:561–589` `sha256:a828bff2126dfe8b029c75ff922f4b52613e6aa48cd957a3f8056be635b97dd2`（004のpack candidate scope/version/依存）、(2) L2 supplement同path`:592–598` `sha256:08d3915feb65dfe071ce69f56fb97070822e08e5cd7f30a92b4d42e22953cf8b`（pack構成/FR57・58の保持・版境界）、(3) L11 original `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:289–303` `sha256:b0a3131940865e2cb30b016ec7232f6f9e40c6cb9fdd20f3974c7654e8a6a31f`（004の前提・正常/失敗/未見oracle）、(4) L11 supplement同path`:306–314` `sha256:8d9514cc6964d617928abe6dacaece211004f754c337fbe8d78bda678ab187c8`（未完正常、同条件比較、独立review、rollback/active、3.0境界oracle）、(5) L2 NFR-34 supplement `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:673–687` `sha256:511c0083b8aaeab292ab348f488367b197516a9faaf92a44a27df1e80c6f21d8`（005の選択source stale意味）、(6) L11 NFR-34 supplement `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:398–434` `sha256:9884a284fbaecc0134936e0b3772871974d5eb24d78c4ebbef22ebf2c6bbb194`（source別 stale/unknown/owner戻しのoracle）。旧004の最初4 partを不変保持し、005の追加2 partを別途traceする。L2/L11のfull-file SHAや単独semantic SHAは補助locatorに限り、6 partの代替にしない。各ACはL2 original/supplementとL11 original/supplementを`AC-INTELLIGENCE-L3-072-01`, `AC-INTELLIGENCE-L3-072-02`, `AC-INTELLIGENCE-L3-072-06`, `AC-INTELLIGENCE-L3-072-07`, `AC-INTELLIGENCE-L3-072-08`へ、072-005登録の追加2 partを`AC-INTELLIGENCE-L3-072-05`へ結び、L10 `CASE-INTELLIGENCE-L10-072-01/-02c/-02n..02s/-02-pin-bytes-01..06`でcomposite digest、6 part各々のmissing/bytes mismatch、normal/unknown oracleを照合する。
- **`AC-INTELLIGENCE-L3-072-04` held-out正常／局所unknown**：未見pack revisionでもapplicability/shadow/review/rollback evidenceが揃う候補を同じcontractで評価し（`CASE-INTELLIGENCE-L10-072-03`）、072-005登録selected-source facetだけstaleならそのfacetの適用を止める。held-out selected-source applicabilityだけunknownの局所対照（`CASE-INTELLIGENCE-L10-072-04`）も照合する。 未見性自体を失敗と扱わず、親contractで成立する部分を評価する。
- **`AC-INTELLIGENCE-L3-072-05` 選択sourceごとのstale**：scope、requirement、template、skill、model catalog、allowlistの各source tupleについてidentity/revision/digestの単独変異を別CASEにする。各sourceの非選択変更と選択状態unknownも型ごとに別CASEとし、実選択facetだけstale、非選択は未観測、選択状態unknownはunknownとして該当source ownerへ戻す。
- **`AC-INTELLIGENCE-L3-072-06` 構成edgeと競合保持**：同じpackへ重複source edgeを束ねる場合も各identity/version/applicability edgeを保持し、意味の異なるrequirement/evidence/反証/停止条件が競合したときはconflict/unknownと未解決部分を残す。INTELLIGENCEが優先順や意味を創作しない。
- **`AC-INTELLIGENCE-L3-072-07` same-case比較とrollback**：同じ対象scope/revision/case/oracleでcandidateあり/なしのshadow結果を対にし、false-positive/false-negative/unknown/反例とrollback先・戻し条件・rollback evidenceを同じversionへ結ぶ。比較条件不一致やrollback根拠欠落は未完であり、閾値やrollback方式を新設しない。
- **`AC-INTELLIGENCE-L3-072-08` candidate生成と独立reviewの段階分離**：scope/sourceだけでcandidate identity/versionを作成でき、shadow/review receiptが未取得なら後続義務として未完保持する。candidate生成時にshadow/review receiptを事前要求しない。reviewを実施する場合は作成側と異なるreviewer identity/context/authority/routeを個別に照合する。作成側が起用したsubagentは独立reviewerに数えない。provider/modelの一致だけで独立性を否定/肯定しない。identity/context/authority/routeの一致はそれぞれ単独で独立reviewを不成立にする。validな既存shadow/evaluation evidenceが同じscope/revision/case/oracleに適用できる場合は再利用でき、新しいWorker実験を毎回要求しない。1.0でfinding/reversal/retry/escaped defect/skill efficacyからpackを自動改善しない。BRAIN知識は実際に選択したときだけsource identity/revision/applicability/provenance/宣言互換範囲を照合し、非選択なら要求しない。全証拠完了後も既存ownerの採択記録なしにactive/gateへしない。at-least-once deliveryの重複は別候補/episodeとして数えず、同一入力の重複受信を重複拒否CASEで照合する。runtimeの同一/相違だけで独立性を決めず、他の明示された独立性条件を照合する。
- **`AC-INTELLIGENCE-L3-072-09` dependency closure**：採択済HARNESS-L2/L11-023に従い、pack identity/revision、HARNESS-010/011契約revision、dependency identity/owner/版range/4区分/条件/対象operation/selected sourceをscopeとauthority/evidenceへ結び、常時必須＋成立した操作条件＋選択sourceだけでclosureと適用理由を再現する。falseと明示された条件依存はclosure外、unknown/staleはfalseや参照のみへ変換せず該当operationを保留する。同一入力closure正常は`CASE-INTELLIGENCE-L10-072-02-dependency-closure-normal`、分類・fallback/conditionのnegativeは`CASE-INTELLIGENCE-L10-072-02-condition-*`/`02-source-fallback-reject`で照合する。
- **`AC-INTELLIGENCE-L3-072-10` closure誤分類・戻し先**：必須依存欠落、選択source不一致、条件unknown、stale/未対応版、参照資料の依存昇格、選択sourceからのfallback、072-004の4partと072-005の2part登録混同を個別に拒否する。pack contract不足はHARNESS、実際に選択したsourceの適用性は該当source owner、BRAIN知識はBRAIN、shadow/effect evidenceはLABOへ戻し、owner不明はunknownに残す。対応個別CASEは`CASE-INTELLIGENCE-L10-072-02-condition-unknown-hold`、`02-source-fallback-reject`、`CASE-INTELLIGENCE-L10-R2607-072-registration-004-005-confusion`および型別selected/nonselected/unknown群で追跡する。さらに`CASE-INTELLIGENCE-L10-2607X-072-01`〜`04`はAC-072-10の個別依存/selected-source負例である。
- **`AC-INTELLIGENCE-L3-072-12` pack要素値と権限境界**：正常candidate fixtureでは判断目的、判断観点、反証質問、必要evidence、severity、escalation/停止条件、model適性、適用条件、versionを固定L2-072-004/005のsource/revisionに対応づけ、各期待値と出力値が一致することを確かめる。model適性が未評価または根拠sourceがunknownならunknown/未評価を保持する。選択したBRAIN knowledge source identity/version欠落はBRAIN、model適性のshadow実験/evaluation evidence欠落はLABO、HARNESS共通pack contract version欠落はHARNESSへ戻す。これらはcandidate pack自身のversion値とは区別する。candidate pack versionの欠落がjudgment意味・範囲に属すると固定sourceから特定できる場合は要求／対象ownerへ返し、区分または具体ownerを特定できない場合はunknownのまま保持する。専用のINTELLIGENCE candidate owner区分は新設しない。dispatch、実tool操作、worker assignment、OS authority変更、SECURITY authority変更をそれぞれ独立変異として拒否する。各pack要素の出力欠落もそれぞれ独立に照合し、source値を推定せず当該要素を未完とする。これらは候補表現の出力禁止であり、実runtime gateや新しい許可手続きを定義しない。
### `FR-INTELLIGENCE-L3-073-01` — `HELIXINTELLIGENCE-L2-073`

**要件：AAFD R-04検出境界**

旧AAFD-R-04の「決定論的検出器の優先」は順位値/priority enumの宣言ではなく、Agentic Audit Probeが既存UIL deterministic detectorを置換しない意味として固定L2/L11へ再導出する。未知finding探索の自由文単独からIssue・Requirement・CI・merge authorityへ直接投影せず、finding/candidateの提示と未判断状態を保持する。

- **`AC-INTELLIGENCE-L3-073-01` 正常成立とtrace**：既存detectorの役割・結果を保持し、探索自由文のcandidate提示と4宛先への非投影を各々照合する。別途適格根拠とownerの独立判断が揃う既存経路はその既存条件に従い、一律禁止や新gateを作らない。
- **`AC-INTELLIGENCE-L3-073-02` 個別変異・owner境界**：detector置換、自由文だけによるIssue作成/更新、Requirement本文/identity/revision/承認状態変更、CI定義/実行要求/pass結果生成、merge admission/操作authority/状態変更を各単独に拒否する。detectorはUIL、Requirementは該当上流owner、CIはOS/HARNESS、mergeは既存GitHub経路に残す。新CI gate追加や既存review/merge admission置換も拒否し、根拠不明はunknownのfinding/candidateとして保持する。
- **`AC-INTELLIGENCE-L3-073-03` 未見正常／局所unknown**：既知fixtureとは別の未知finding文でもdetector非置換と4宛先の非投影を別々に照合する。欠けた根拠だけunknownを維持し、candidate提示と成立した他のsourceを保持する。未見性自体で拒否せず、新しいpriority宣言や数値条件を作らない。

### `FR-INTELLIGENCE-L3-078-01` — `HELIXINTELLIGENCE-L2-078`

**要件：AAFD delta意味・再現性・境界**

固定親R-06/R-07/R-09/R-10/R-11/R-12のdelta意味、同入力再現、snapshot join、影響範囲限定invalidation、stale/unknown/missing時のwrite抑止、journal replayを、親に列挙されたsource identity/revision/digestへ結びつけてcandidate化する。POのA案限定範囲を保ち、後続処理のowner・経路は未確定のまま残し、提案から要求・設計・割当を直接変更しない。あわせて採択済HARNESS-L2/L11-023に基づくeffective dependency closureを、delta exact set/digestとは別oracleとして同じpack/dependency/operation/scope/source/authority/evidence入力から再現する。closureは常時必須・成立した操作時必須・実際に選択したsource依存だけを含み、条件不成立、未選択、参照のみ、unknown/staleを別状態に保つ。保存schema、物理column、field名、digest encoding、runtime、producer/consumer/owner assignmentは新設しない。古いL2本文の「未採択候補」metadataは対象revisionの状態根拠ではなく、later35のexact PO decisionを読む。

**受入条件**

- **`AC-INTELLIGENCE-L3-078-01` R-06 delta意味**: 変更次元を authority / responsibility / runtime / provider / dependency / security / verification / capacity / cost / migration / release の11個として区別する。各次元について前状態と観測状態、そのsource receipt revision/digest、対象HEAD/authority/environment identity、affected responsibility、evidence/counterevidence、confidence/unknown、invalidation exact set、re-synthesis要否を意味要素として保ち、stable IDとdelta digestを別々に照合し、存在しない値を埋めない。各dimensionのnormal・missing・unknown・stale・mismatchを個別CASEで評価する。
- **`AC-INTELLIGENCE-L3-078-02` R-07 再現・重複拒否**: 同一source receipt/registry/policyならdelta exact set/digestを再現する。at-least-onceの重複受信は別delta/episodeにしない。stale revision、wrong HEAD、wrong authority、missing receipt、duplicate changeはそれぞれ単独変異CASEで拒否し、retryやevent順序変更で別episodeを増殖させない。
- **`AC-INTELLIGENCE-L3-078-03` R-09 snapshot join**: delta source identityと同一identity/revision/digestを持つF0 snapshotだけを一致として扱い、不一致・stale・不足はstale/reobservation requiredへ分ける。
- **`AC-INTELLIGENCE-L3-078-04` R-10 限定invalidation**: affected Future Type/assumption/projection/directiveのexact setだけをstaleにし、unaffected projectionを保つ。stale projectionの再利用を拒否する。構造変更はproposal-onlyとしcurrent-write parkingを解除しない。
- **`AC-INTELLIGENCE-L3-078-05` R-11 stale/unknown/missing時抑止**: stale directive、unresolved unknown、missing source receiptそれぞれからassignment/release/retire/requirement write/design writeを出さない。R-08 non-write境界へ畳まない。
- **`AC-INTELLIGENCE-L3-078-06` R-12 journal replay**: repository authority/event journalからdelta/invalidation/intake projectionを再構築する同一event集合の順序変更でもexact set/digestを比較する。DB喪失後も同じjournalから同じprojection/digestを再構築する義務を照合し、DB種別・実装は固定しない。
- **`AC-INTELLIGENCE-L3-078-07` 未見正常／局所unknown**: 未見snapshot/eventでも必要identity/receipt/authorityが揃う範囲を同じ親oracleで扱い、欠けたpartだけunknownとする。
- **`AC-INTELLIGENCE-L3-078-08` dependency closure正常再現**：fixed L11-078の依存宣言field全体から、常時必須＋成立したoperation condition＋selected sourceのclosureと各適用理由を導く。operation/source選択が異なる場合は適用範囲だけ変え、同一入力でclosure memberまたは理由が変わらない。R-07 delta digestのoracleと混同しない。個別正常CASEは`CASE-INTELLIGENCE-L10-078-08-closure-same-input`。
- **`AC-INTELLIGENCE-L3-078-09` closure欠落・unknown・stale**：各dependency宣言fieldの欠落/unknown/staleを個別変異する。該当operationだけ保留し、必要条件をnon-applicable/reference-onlyへ再分類せず、他の成立fieldと常時依存を保つ。field別CASEは`CASE-INTELLIGENCE-L10-078-08-closure-<NN>-<state>`で識別する。
- **`AC-INTELLIGENCE-L3-078-10` closure分類とfallback拒否**：条件unknownをfalse扱い、selected sourceを除く/別sourceへfallback、staleまたは未対応contract版を読み替える、reference-only資料をdependency化、unselected sourceをqualified扱いする各例を別々に拒否する。必要なidentity/owner/version/evidenceを代行者の主張で省く4反例、read/qualification失敗からの別source切替2反例、読取不能receiptを他receipt/未選択source/reference-onlyで代用する3反例も各単独CASEで拒否する。区分誤り/fallbackとR-07〜R-12の独立CASEは`CASE-INTELLIGENCE-L10-078-08-closure-*`および`CASE-INTELLIGENCE-L10-078-09-r07/r09/r10/r11/r12-*`で親条件ごとに識別する。
- **`AC-INTELLIGENCE-L3-078-11` source scope・非直接変更**：不足/不一致は影響fieldだけunknown/incompleteとして保持し、固定source/責務上の既存ownerが特定できる場合はそこへ戻す。ownerをsourceから特定できなければowner名を作らずunknownを残す。PO限定Aを保ち、fresh/resolved/receipt済みでも直接変更0件を維持する。R-06/R-07/R-09–12のsource scopeは旧source実spanに限る。
- **`AC-INTELLIGENCE-L3-078-12` formal consumer/route未確定境界**：PO採択済みのA限定を保つ。固定sourceが別機構formal consumerの対象L1、採択済みL2/L11、source→consumer接続を特定していないことを照合し、3項目をunknownのまま保持する。固定sourceが特定しないproducer、consumer、owner、Issue route、旧`#1037`に対応する現行対象もunknownのままとし、旧routeや名称から推定・割当てない。候補からIssue/assignment/Requirement/Design操作を発行せず、各fieldの単独変異を別CASEで照合する。
### Stage 3 — 固定L11追補の受入条件（#2607 review01補正）

以下は既決L2/L11の同一親に含まれる受入oracleを明示する補足で、要求の版・owner・意味を変更せず、数値gateも追加しない。001/002はL11 R2187-01の該当行とR2187-01共通判定260、003–020はL11 G12および共通判定146、011はさらにG13、067/072/073/078は表記した固定L11範囲を用いる。本PR対象の001〜009/011〜016/018〜020および067へ、固定L2の記載どおり共通pack contractを適用し、消費操作を別途選ぶ条件は設けない。対象AC-04とnormal入力はHARNESS-L2-010/011のcontract identity、実contract版、成果物版、依存版、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛する。各項目の欠落・stale・不一致は当該親の成立をunknown/未完としてHARNESS-L2-010/011 pack contract ownerへ戻す。親単体の成功を他機構との接続成功とせず、005のOS ticket、006のLABO実測、018のLABO/OS登録等は該当固定L2/L11の別条件として判定する。

| 親 | 追加AC | 固定oracleと判定範囲 |
|---|---|---|
| `001` | `AC-INTELLIGENCE-L3-001-04` | 固定 `L2 48–53; L11 62, 260, 264`: 責務を勝手に統合しない。明示共有責務だけを共有し、責務定義のないcapabilityを割り当てず、ownerを作らない。固定enum・独立authorityを導入しない。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛し、各個別欠落/stale/mismatchをunknown/未完としてpack contract ownerへ戻す。 |
| `002` | `AC-INTELLIGENCE-L3-002-04` | 固定 `L2 54–59; L11 63, 260, 265`: domainごとの能力だけを適用し、全能力を全domainへ広げる変異を拒否する。未構成はunknown。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛し、各個別欠落/stale/mismatchをunknown/未完としてpack contract ownerへ戻す。 |
| `003` | `AC-INTELLIGENCE-L3-003-04` | 固定 `L2 60–65; L11 64, 146, 156`: 別ticket dependencyを混ぜず、field欠落/順序変化を保持し、一覧・traceの存在だけで成功としない。modelをauthorityとして扱う変異を拒否する。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛し、各個別欠落/stale/mismatchをunknown/未完としてpack contract ownerへ戻す。 |
| `004` | `AC-INTELLIGENCE-L3-004-04` | 固定 `L2 66–71; L11 65, 146, 157`: unknownを事実で補わず、別source表現の同じ根拠関係を許す。Derived InterpretationをObserved Factへ変換する誤りを拒否し、分類基準が未定なら判定不能として基準を人へ戻す。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛し、各個別欠落/stale/mismatchをunknown/未完としてpack contract ownerへ戻す。 |
| `005` | `AC-INTELLIGENCE-L3-005-04` | 固定 `L2 72–77; L11 66, 146, 158`: A→Bの依存順と循環拒否を保ち、current state source欠落、stale contract、BRAIN knowledge source identity/revision/applicabilityまたは原source traceの欠落を未完とする。sourceがdata-use classを提供する場合は提供済み値の欠落/不一致を未完とするが、未提供は異常にしない。ticket発行/割当の権限を持たず、OS ticket情報はOSへ戻す。BRAIN knowledgeの不足は当該sourceへ戻す。HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛し、各個別欠落/stale/mismatchをunknown/未完としてpack contract ownerへ戻す。 |
| `006` | `AC-INTELLIGENCE-L3-006-04` | 固定 `L2 78–83; L11 67, 146, 159`: target/scope/windowを先に固定し、assumption/uncertainty欠落・根拠なし確定化・current source staleを個別にunknownとし、後続実測を別LABO recordで比較する。不一致/missing/stale/scopeずれは成功扱いせずunknown。予測を実測事実へ昇格させず、実測値で事前predictionを上書きしない。LABO送達成立はHELIXINTELLIGENCE-L2-040で判定し、この親・CASEでは送達成立を判定しない。confidence/assumption欄の存在を正解扱いせず、精度threshold未決時は測定値のみ記録してpass/適格化を判定しない。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛する。別の消費操作選択は前提にしない。HARNESS共通pack契約自身の欠落/stale/mismatchはHARNESS-L2-010/011 pack contract ownerへ戻す。 |
| `007` | `AC-INTELLIGENCE-L3-007-04` | 固定 `L2 84–89; L11 68, 146, 160`: 追加観測・検査へ辿れること、反証無視・無関係検査指示を拒否すること。episode identity不一致とsource revision staleを個別に拒否して該当source ownerへ戻す。証拠不足/矛盾は観測要求を該当sourceへ戻しprobable/unknownを保つ。長期効果はLABOへ戻す。repair判断/実行はL2-007にないのでINTからOSへ生成しない。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛する。別の消費操作選択は前提にしない。HARNESS共通pack契約自身の欠落/stale/mismatchはHARNESS-L2-010/011 pack contract ownerへ戻す。 |
| `008` | `AC-INTELLIGENCE-L3-008-04` | 固定 `L2 90–95; L11 69, 146, 161`: review対象範囲に従いTP/FN/FPを分類し、scope外は未評価。seeded must-fix見逃し、clean artifact誤指摘、severity誤り、反例誤結合、route誤りをそれぞれ個別に拒否。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛する。別の消費操作選択は前提にしない。HARNESS共通pack契約自身の欠落/stale/mismatchはHARNESS-L2-010/011 pack contract ownerへ戻す。 |
| `009` | `AC-INTELLIGENCE-L3-009-04` | 固定 `L2 96–101; L11 70, 146, 162`: 固定L2のfinding型を保持し、producer identity欠落、reproduction欠落、falsification欠落を個別に未完として該当source ownerへ戻す。UIL/TER/Future Synthesisの重複実装・根拠なしfinding・別finding反証結合を拒否。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛する。別の消費操作選択は前提にしない。HARNESS共通pack契約自身の欠落/stale/mismatchはHARNESS-L2-010/011 pack contract ownerへ戻す。 |
| `011` | `AC-INTELLIGENCE-L3-011-04` | 固定 `L2 108–113; L11 72, 146, 164, 198`: task snapshot、scoring version、run protocol、hardware class、独立oracle、cache/人介入、costのpricing source/currency/effective timestamp/charging classを個別保持。必要scopeの結果だけに限定し、missとFPそれぞれの欠落を独立にunknownとして保持する。価格根拠の違いを隠す、rescue/rework/interventionの除外、condition/cohortの混同、priority/toleranceなしの勝敗、欠測costの0化、price単独優位を拒否。current/candidate実行版は各々記録し、同一版を要求しない。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛する。別の消費操作選択は前提にしない。HARNESS共通pack契約自身の欠落/stale/mismatchはHARNESS-L2-010/011 pack contract ownerへ戻す。 |
| `012` | `AC-INTELLIGENCE-L3-012-04` | 固定 `L2 114–119; L11 73, 146, 165`: uncertainをprobable/knownへ縮めず、閾値未決は判定不能として、その閾値判断を持つ既存ownerへ戻す。missing fieldの補完済み偽装を拒否し、staleと相反証拠を個別に保持。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛する。別の消費操作選択は前提にしない。HARNESS共通pack契約自身の欠落/stale/mismatchはHARNESS-L2-010/011 pack contract ownerへ戻す。 |
| `013` | `AC-INTELLIGENCE-L3-013-04` | 固定 `L2 120–125; L11 74, 146, 166`: sourceにない事実・異版source・完全再生成なしを理由に根拠を省かない。observationとassumptionを混同せず、model/provider/version・reasoning・uncertaintyの各edge欠落を個別にunknownとする。source/version/data-useを保持。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛する。別の消費操作選択は前提にしない。HARNESS共通pack契約自身の欠落/stale/mismatchはHARNESS-L2-010/011 pack contract ownerへ戻す。 |
| `014` | `AC-INTELLIGENCE-L3-014-04` | 固定 `L2 126–131; L11 75, 146, 167`: 反復可能taskを入力し、scope外operation一件のみ、停止後実行、manifest authority追加、Bot追加によるauthority推論を各単独変異として拒否。manifest不足は通常INTELLIGENCE判断candidate、assignment/evidence不足はOSへ。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛し、各個別欠落/stale/mismatchをunknown/未完としてpack contract ownerへ戻す。 |
| `015` | `AC-INTELLIGENCE-L3-015-04` | 固定 `L2 132–137; L11 76, 146, 168`: 非該当near-missを変異した過検出と別の実装表現のheld-outを分ける。候補で停止し昇格しない。独立episodeの意味だけを照合し数値回数thresholdを設けない。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛し、各個別欠落/stale/mismatchをunknown/未完としてpack contract ownerへ戻す。 |
| `016` | `AC-INTELLIGENCE-L3-016-04` | 固定 `L2 138–143; L11 77, 146, 169`: untrusted candidate境界を保ち、登録から包括write権限を得ず、OS割当Worker結果でseeded反例が修正されたことと既存正常caseの回帰がないことを照合し、scope外/新種は未評価。actual result欠落は結果のみunknown。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛し、各個別欠落/stale/mismatchをunknown/未完としてpack contract ownerへ戻す。 |
| `018` | `AC-INTELLIGENCE-L3-018-04` | 固定 `L2 144–149; L11 78, 146, 170`: LABO評価だけで採択せず、OS登録を省かない。遅延/順序逆転outcomeを保持し、current conflict/時点欠落を未完として既存ownerへ戻す。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛し、各個別欠落/stale/mismatchをunknown/未完としてpack contract ownerへ戻す。 |
| `019` | `AC-INTELLIGENCE-L3-019-04` | 固定 `L2 150–155; L11 79, 146, 171`: applicabilityの成立と適用除外exception/counterexampleの成立を別々に照合する。applicability exceptionまたはcounterexample成立中は適用しない。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛し、各個別欠落/stale/mismatchをunknown/未完としてpack contract ownerへ戻す。 |
| `020` | `AC-INTELLIGENCE-L3-020-04` | 固定 `L2 156–161; L11 80, 146, 172`: requirement/design/acceptance/product meaningのauthorityをProduct Core ownerに残し、意味差は該当するProduct Core ownerと意味を変える層へのBackflow候補として返す。target/revision不明はcandidate保留のまま該当Product Core ownerへ照会し、別のverification ownerを推測しない。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛し、各個別欠落/stale/mismatchをunknown/未完としてpack contract ownerへ戻す。 |
| `067` | `AC-INTELLIGENCE-L3-067-04` | 固定 `L2 466–490; L11 199, 197`: decision expiry/conflictを識別し、有効decisionを毎run再確認しない。LABO035→INT034 contract version/compatibility/result receiptを確認。quality gateを先に判定し相殺しない。cost/human timeを0化せず、人介入費用が欠けるときは総費用を不完全／unknownとして保持し総費用完全性を主張しない。condition/cohort軸とno-Harness/HELIX不存在を分ける。LABO052と同一結果のreceiptを追跡し、新engine/assignment/worker/model切替、価格/model/benchmark単独、priority未定指標のwinner判定を拒否する。oracle/quality gate不明はHARNESS/requirement ownerへ戻す。 HARNESS-L2-010/011共通pack contractのidentity、実contract/成果物/依存version、宣言compatibility range、交換/更新条件を同scope/revisionへ束縛する。別の消費操作選択は前提にしない。HARNESS共通pack契約自身の欠落/stale/mismatchはHARNESS-L2-010/011 pack contract ownerへ戻す。LABO035→INT034の送受契約版・互換範囲・同一結果receiptの不成立は固定L2:474/480に従って未受領/未評価のまま送信source ownerであるLABOへ返し、HARNESS共通pack契約の不成立と混同しない。 |

各補足ACの対CASEはFV本文の#2607 review01個別補正fixture、共通pack fixture、review03/04補正fixture各表に分散しているため、同じAC IDで全表を索引照合する。NFRはそれらの既存機能oracleを測定対象に結び、独立thresholdは追加しない。

### review06 独立反例のtrace

018自己採択は `CASE-INTELLIGENCE-L10-018-02b` に復元し、LABO評価だけの採択は新しい `CASE-INTELLIGENCE-L10-018-02b-labo-only` へ分離した。両方は `AC-INTELLIGENCE-L3-018-02` を照合する。078 fallbackの新9反例は次の個別CASEで `AC-INTELLIGENCE-L3-078-10` を照合する。

`CASE-INTELLIGENCE-L10-R2607-078-proxy-claim-identity`, `CASE-INTELLIGENCE-L10-R2607-078-proxy-claim-owner`, `CASE-INTELLIGENCE-L10-R2607-078-proxy-claim-version`, `CASE-INTELLIGENCE-L10-R2607-078-proxy-claim-evidence`, `CASE-INTELLIGENCE-L10-R2607-078-selected-read-fallback`, `CASE-INTELLIGENCE-L10-R2607-078-selected-qualification-fallback`, `CASE-INTELLIGENCE-L10-R2607-078-unreadable-receipt-other-receipt`, `CASE-INTELLIGENCE-L10-R2607-078-unreadable-receipt-unselected-source`, `CASE-INTELLIGENCE-L10-R2607-078-unreadable-receipt-reference-only`。

**review08 個別trace追補**：固定L11:158/169/199、072 original:293/294/298、supplement:310を本文で照合した単独fixtureは次のとおり。親bytesや意味は変更しない。

| 親 | AC | 個別CASE |
|---|---|---|
| `005` | `AC-INTELLIGENCE-L3-005-04` | `CASE-INTELLIGENCE-L10-R08-005-prerequisite-unfulfilled` |
| `016` | `AC-INTELLIGENCE-L3-016-03` | `CASE-INTELLIGENCE-L10-R08-016-heldout-result-same-scope` |
| `067` | `AC-INTELLIGENCE-L3-067-04` | `CASE-INTELLIGENCE-L10-R08-067-evaluation-scope-missing` |
| `067` | `AC-INTELLIGENCE-L3-067-04` | `CASE-INTELLIGENCE-L10-R08-067-evaluation-revision-missing` |
| `072` | `AC-INTELLIGENCE-L3-072-07` | `CASE-INTELLIGENCE-L10-R08-072-shadow-pair-normal` |
| `072` | `AC-INTELLIGENCE-L3-072-07` | `CASE-INTELLIGENCE-L10-R08-072-invented-threshold-reject` |
| `072` | `AC-INTELLIGENCE-L3-072-07` | `CASE-INTELLIGENCE-L10-R08-072-added-case-success-reject` |
| `072` | `AC-INTELLIGENCE-L3-072-08` | `CASE-INTELLIGENCE-L10-R08-072-external-knowledge-required-reject` |
| `072` | `AC-INTELLIGENCE-L3-072-04` | `CASE-INTELLIGENCE-L10-R08-072-heldout-process-outside` |
| `072` | `AC-INTELLIGENCE-L3-072-04` | `CASE-INTELLIGENCE-L10-R08-072-heldout-failure-mode-outside` |
| `072` | `AC-INTELLIGENCE-L3-072-02` | `CASE-INTELLIGENCE-L10-R08-072-applicability-authority-mismatch` |
| `072` | `AC-INTELLIGENCE-L3-072-02` | `CASE-INTELLIGENCE-L10-R08-072-applicability-risk-mismatch` |
| `072` | `AC-INTELLIGENCE-L3-072-02` | `CASE-INTELLIGENCE-L10-R08-072-applicability-failure-mismatch` |
## Stage 5 — 採択済みHELIXINTELLIGENCE-L2 9親の起草範囲

状態: 本追補はStage 5対象のL3起草候補・未実行の検証設計であり、独立reviewやL3承認、実装・実行・releaseを生成しない。採択対象は `HELIXINTELLIGENCE-L2-060/061/062/063/069/070/071/074/077` の各 `version_target: 1.0`。060–063・069–071はMPR-RC `-002`、074は`MPR-RC-HELIXINTELLIGENCE-L2-074-002`、077は選択適用範囲を持つ`MPR-RC-HELIXINTELLIGENCE-L2-077-001`を、それぞれG0と該当PO判断の固定行へ結ぶ。069–071のL2は採択済みStage 5親であり、未承認という記述をL2採択状態へ読み替えない。未承認なのはこのL3 draftである。

旧HELIXのL3 layer definition、親ごとの旧L3 sourceとpaired consumerの受入形をsource起点にし、項目別の保持・意味再導出・置換は各FRへ示す。旧L3/L10のID、provider・runtime・旧workflow・採否/approval運用は移さない。旧pair artifactは設計材料であり実行証拠ではない。固定L2/L11の意味、対象、owner、版、scopeを越える依存や一括Stage完了gateを作らない。

### FR-INT-060 — 根拠付き自動開発計画候補（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-060`、親L1 `HELIXINTELLIGENCE-L1-005`、`version_target: 1.0`。固定source: L2 633bf12:354–359、L11 rows 114/158/281、PO decision 2026-09-28 row 90、G0 `MPR-RC-HELIXINTELLIGENCE-L2-060-002`。
- 責務: INTELLIGENCEは承認済み要求・HARNESS工程contract・現状・BRAIN知識から根拠、依存、停止条件付きplan candidateを作る。要求/contract/state/knowledgeは各source owner、ticket・推進・assignmentはOSが持つ。4.0動的workflowを1.0の前提にしない。
- 入出力: source identity/revision/owner/scope、approved requirement state、HARNESS process contract、current OS state、BRAIN applicability、依存/stop条件を入力し、各nodeと根拠・依存・未知・停止理由を結ぶ候補をOSへ渡す。実行可能化、ticket発行、OS state変更は出力しない。
- AC-INT-060-01 正常: CASE-INT-060-01。承認済み要求のA→B依存と独立C、valid HARNESS contract/current state/applicable BRAIN sourceを与え、plan candidateはA前にBを置かずCを独立化し、stop/fallback理由・source traceが固定L11 oracleと一致する。OS ticket発行は別状態のまま。
- AC-INT-060-02 反例: CASE-INT-060-02a〜02fを各一変異とする。未承認requirementを実行可能化、HARNESS contractまたはOS stateをstale化、source identityを固定した依存順序を逆転、4.0 workflowを必須化、INTELLIGENCEからticket/assignmentを生成する各変異を拒否する。入力不足・staleは固定L2/L11の該当source、ticket化不能はOSへ戻す。02dの依存逆転は順序不合格としてcandidateを確定せず、返却ownerを追加しない。
- AC-INT-060-03 未見正常: CASE-INT-060-03。held-out graphで適合済み依存だけを順序化し、独立nodeと停止条件を保つ。
- AC-INT-060-04 unknown/範囲外: CASE-INT-060-04a/04b。source owner/依存の適用性が不明なら該当branchだけをunknownとして保持し、循環・未宣言依存を解決済みに並べない。04bはCASE-INT-060-05hへの完全ID索引であり二重計上しない。05e/05g/05hはfixtureにHARNESS process contract source identity/ownerと該当stop条件・依存を明記し、その該当source/contract ownerへ戻す。04aはselected BRAIN source ownerへ戻す。入力不足・staleは該当sourceへ戻し、新ownerを作らない。
- 旧source: LEGACY-ASSET-02D897E62EF2FA267267 (`universal-improvement-loop-requirements.md:43–59,125–160`)、LEGACY-ASSET-0B5B38F146D9538C9A36 (`universal-improvement-loop-acceptance.md:17–38`)、LEGACY-ASSET-C7F0C3B79CBAA72960BF (`infinity-loop-functional-requirements.md:25–60`)、LEGACY-ASSET-FA8C6E69463183D6A19B (paired `L3-infinity-loop-acceptance-test-design.md:17–40`)、LEGACY-ASSET-5EE032D657C221184B00 (`universal-workflow-ai-judgment-engine.md:31–52`)、LEGACY-ASSET-6FFD7F4E58066D08B053 (paired `universal-workflow-ai-judgment-engine-acceptance.md:17–34`)。decision proposal、source trace、negative oracleの形を意味再導出する。旧Universal Improvementの自治的lifecycle/route、UWJのinterview/schema、Infinity Loopのprovider/runtimeは現行へ移管せず、本候補の置換対象にも含めない。

### FR-INT-061 — LABO評価根拠に基づくWorker配置proposal（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-061`、親L1 `HELIXINTELLIGENCE-L1-010`、`version_target: 1.0`。固定source: L2 633bf12:360–365、L11 rows 115/163/282、PO row 91、G0 `MPR-RC-HELIXINTELLIGENCE-L2-061-002`。
- 責務: LABOは作業種別別水準・同scope評価証拠、INTELLIGENCEはtask別配置案、OSは指定・割当てを持つ。price/name/benchmark単独では決めない。task identity、scope、Worker evidence適用性を保ち、実assignmentとproposalを混同しない。
- AC-INT-061-01 正常: CASE-INT-061-01。task capability/tool/domain、複数Worker profileと同task-class/scopeのLABO evidenceを与え、適合理由・除外・未評価・根拠を示したproposalを返しOSへ渡す。
- AC-INT-061-02 反例: CASE-INT-061-02a〜02hを個別変異する。priceのみ、model nameのみ、benchmark値のみで順位確定、別task/scope evidence流用、未評価をqualified化、LABOがassignment、INTELLIGENCEがassignment、またはstale evidenceをcurrent扱いする変異を拒否する。evidence評価/適用不一致はLABOへ、task scope不明はINTELLIGENCEへ、割当不可はOSへ戻す。別task-class evidenceはtask属性欠落ではなくLABO評価scope不一致としてLABOへ戻す。
- AC-INT-061-03 未見正常: CASE-INT-061-03。未見task/class組合せでも同じ明示capability/evidence scopeだけを照合し、LABO evidenceがなければ未評価のproposalを保つ。
- AC-INT-061-04 unknown: CASE-INT-061-04。未宣言task classまたは互換範囲不明を推測適格化せず、scope不明はINTELLIGENCE、評価互換不明はLABO、割当不可はOSへ返す。
- 旧source: LEGACY-ASSET-9114D4E463E95B67DD0C (`worker-common-contract.md:47–64`)、LEGACY-ASSET-C6ADB99F1353965C5449 (`worker-common-contract-acceptance.md:18–64`)、LEGACY-ASSET-28FB139B26CD61CC51EE (`helix-bench-evaluation.md:30–82`)、LEGACY-ASSET-A952A3A175EB82A4781B (paired `helix-bench-evaluation-acceptance.md:30–41`)。同task条件、評価範囲、重大失敗の非相殺を比較材料として再導出する。旧provider descriptor/CLI/sandbox、blind score、旧採否・価格・admissionを移さず、能力判断はLABO、実割当はOSへ置換する。

### FR-INT-062 — 限定修復の段階別evidence接続（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-062`、親L1 `HELIXINTELLIGENCE-L1-016/017`、`version_target: 1.0`。固定source: L2 633bf12:366–371、L11 rows 116/169/283、PO row 92、G0 `MPR-RC-HELIXINTELLIGENCE-L2-062-002`。
- 責務: 同じtarget revision/scope上で、SECURITY permission/isolation、Worker execution、HARNESS verification obligation/result、OS acceptanceを独立段階として結ぶ。各ownerの成立は他段階を代替せず、最初の不足段階をそのownerへ戻す。
- AC-INT-062-01 正常: CASE-INT-062-01。全段階のsource/owner/revision/target/scopeが一致する別receiptを順序どおり保持し、最後のOS acceptance inputまで別状態で追跡する。
- AC-INT-062-02 反例: CASE-INT-062-02a〜02hを一項目ずつ変える。permission欠落およびpermission actor不一致はSECURITY（scope不一致はAC-INT-062-04の04d）、Worker result欠落/別targetはWorker execution owner、HARNESS verification欠落はHARNESS owner、OS acceptance欠落はOS ownerへ戻す。repair candidateだけの欠落は固定L2が戻し先を指定しないためownerを推測しない。receipt順序逆転は全receiptが存在する場合も順序不成立として検出した該当段階の既存ownerへ返し、実際にreceiptが欠ける場合だけ欠落したstage ownerへ戻す。途中段階だけで修復完了をclaimしても後段成立を生成しない。正常な別stage evidenceは保持する。
- AC-INT-062-03 未見: CASE-INT-062-03。未見receipt versionの互換性不明を該当stageだけ保留し、重複receiptは一段階を二度完了させない。
- 旧source: LEGACY-ASSET-02D897E62EF2FA267267 (`universal-improvement-loop-requirements.md:84–120,164–183`)、LEGACY-ASSET-0B5B38F146D9538C9A36 (paired UIL acceptance `:1–46`)、LEGACY-ASSET-C7F0C3B79CBAA72960BF (`infinity-loop-functional-requirements.md:31–60`)、LEGACY-ASSET-FA8C6E69463183D6A19B (paired Infinity acceptance `:1–63`)、LEGACY-ASSET-17C4BF78919578FEBB18 (`product-lifecycle-operations-requirements.md:105–154`)、LEGACY-ASSET-F46AB11BD14F2C0469F4 (paired OPS acceptance `:17–46`)。候補/修正の証拠・各return ownerとfalse-closure反例を意味再導出する。旧terminal, route, runtime, deployment/rollback authorityは適用せず、現行の四段階ownerへ置換する。

### FR-INT-063 — LABO評価/BRAIN知識/現判断/OS実行の循環trace（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-063`、親L1 `HELIXINTELLIGENCE-L1-018/019`、`version_target: 1.0`。固定source: L2 633bf12:372–377、L11 rows 117/170–171/284、PO row 93、G0 `MPR-RC-HELIXINTELLIGENCE-L2-063-002`。
- 責務: episode/source/revision/scopeと時点を維持して、LABO past-effect evaluation、BRAIN general knowledge, INTELLIGENCE current judgment, OS execution, HARNESS process evidenceを結ぶ。effectivenessはLABO、knowledge canonicalはBRAIN、execution/assignmentはOS、process contractはHARNESS。INTELLIGENCEはloop evidenceを結ぶだけで改善採択・正本writeをしない。
- AC-INT-063-01 正常: CASE-INT-063-01。episodeを同一target revision/scopeへ結び、過去評価とcurrent judgmentを別時点で保持し、未完stageとownerを明示する。
- AC-INT-063-02 反例: CASE-INT-063-02a〜02cと02e〜02fを独立評価する。旧CASE-INT-063-02dのprediction→actual置換は固定L2-063/L11-117/284に対応する条件がなく、独立要件として扱わない。CASE-INT-063-02gは複合旧indexとして保持し、out-of-order到着の元episode保持はCASE-INT-063-04g（正常）、duplicateを別episodeへ適用する変異の拒否はCASE-INT-063-04hでそれぞれ独立判定する。INT self-evaluationからlong-term effect確定、INTからBRAIN canonical write、stale LABO resultをcurrent扱い、OS execution未完を完了化、未承認general knowledgeをcurrentizeする各独立変異を拒否する。評価不足はLABO、knowledge/source不足はBRAIN、execution不足はOSへ戻す。
- AC-INT-063-03 未見: CASE-INT-063-03。遅着・別順historical outcomeは元episodeへ結び、current judgmentを上書きしない。適用性unknownは固定L11:284に従いLABO/BRAIN ownerへ戻す。
- 旧source: LEGACY-ASSET-02D897E62EF2FA267267 (`universal-improvement-loop-requirements.md:59–76,162–196`)、LEGACY-ASSET-0B5B38F146D9538C9A36 (paired UIL acceptance `:1–46`)、LEGACY-ASSET-EE5DBACC7F28F7D1F605 (`pillar-functional-requirements.md:154–156,237–242`)、LEGACY-ASSET-44DD86E3DEC09E65EF51 (paired `L3-pillar-acceptance-test-design.md:32–90,91–216`)、LEGACY-ASSET-5EE032D657C221184B00 (`universal-workflow-ai-judgment-engine.md:31–52`) とLEGACY-ASSET-6FFD7F4E58066D08B053 (paired UWJ acceptance `:17–34`)。before/after effect、fact/unknown、owner distinctionだけを再導出し、旧recipe promotion, memory, runtime loop, approval workflowを置換・実行しない。

### FR-INT-069 — 有限設計modelの条件付き計算（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-069`、unit、`version_target: 1.0`、PO-fixed adopted `MPR-RC-HELIXINTELLIGENCE-L2-069-002`。L2 633bf12:513–527、L11 fixed rows 213/215–228/251–256、PO row 99、G0をsource pinする。L2-006の既存予測責務を置換せず、HARNESS/Product Core source-owned finite modelの明示規則だけを計算する。
- 常時入力: 許可model identity/revision/digest/owner/scope、schema/rule版、initial state、finite state/edge/process/load rule、scenario identity、単位・境界・data-use条件、停止条件。HARNESS-L2-010/011の採択済みpack契約identity/version/scope/provenanceを常時照合する。HARNESS-L2-011のcall固有input値はそのcallを使うoperationで照合するが、call未選択を理由に契約自体を省略しない。どちらも既存の入力・受渡し契約として扱い、計算実行主体や結果ownerをHARNESSへ移さない。時間・費用・failure/worker計算の特定operationに限り明示率/単価/通貨/effective time/edge/recovery/schedulerを要求し、不足した数値を作らない。出力はsource/rule-bound trace、計算可能値、assumption・unknown・unsupported・打切りを含むvirtual resultであり実測/設計変更/実resource stateではない。
- AC-INT-069-01 normal queue: CASE-INT-069-01。L2明記の2-step到着5/5、service上限8、`served=min(q+arrival,8)`でbaseline処理5/5・終端q=0/0、load 5/10で処理5/8・終端q=0/2を独立算術oracleと照合する。
- AC-INT-069-02 normal propagation: CASE-INT-069-02。L2明示のDB available→unavailable event、`order_processor requires DB.available` edgeとwaiting/retry規則だけを辿り、edgeのないreporting branchを変更せず、recovery未定義なら復旧を作らない。
- AC-INT-069-03 normal capacity/cost: CASE-INT-069-03。L2明記の18 jobs、worker rate 3 jobs/min、shared DB ceiling 8 jobs/min、worker rate 0.20 credit/(worker·min)、DB rate 0.10 credit/minから、2 workers=6 jobs/min, 3 min, 1.50 credits; 4 workers=8 jobs/min, 2.25 min, 2.025 creditsを再計算する。差分は-0.75 min/+0.525 credits。全数値は固定fixtureの算術oracleで製品閾値/実性能ではない。仮想worker数はOS配置を変えない。
- AC-INT-069-04 反例: CASE-INT-069-04a〜04jを一変数ずつ評価する。08a/08l/08m/08oはAC-INT-069-08でのみ集計する。未宣言rule/係数を補う、別revisionの率を混ぜる、単位不一致を換算根拠なしに結ぶ、欠落価格を0にする、明示edge外へfailure伝播、recoveryを創作、virtual resultをphysical resultと呼ぶ各変異を拒否する。04iは有効な同revision sourceにあるshared DB ceiling=8をsource入力に残し、計算だけがこの上限を無視してworker追加を比例速度とする出力変異を拒否する。04jは選択sourceからceiling fieldだけを欠落させ、同revisionの別sourceを使えない条件であり、ceiling/throughput/timeを補わず計算不能/部分unknownを返す。source revision・owner・permissionの不一致は固定L2:526に従いProduct Core/HARNESS/SECURITYへ照合する。個別ownerを入力が示さない場合もこの既存owner群への照合を維持し、特定主体を創作しない。schema・遷移・domainが未対応ならunknown/unmodeled/blockedとし固定L2が示すmodel ownerへ照合する。係数・規則不足は計算不能/部分unknownを保つ。
- AC-INT-069-05 未見: CASE-INT-069-05。held-out finite state/edge/ruleが宣言範囲内ならtrace/outputを独立算術/graph oracleと照合し、未対応領域のみunknownとする。
- 旧source照合: HELIX-Bench/UIL/OPSの観測、versioned evidence、failure/cost分離は隣接意味として再導出する。設計modelを条件変更して有限計算する旧requirement/runtimeはinventory検索で特定できず、旧`pre-merge simulation`（LEGACY-ASSET-50CA1C554747F12266D3, `resident-lane-orchestration-requirements.md:1114–1124`）はgovernance projection検査のため対象外。有限計算能力はPO原文第3項/G17導出記録と固定L2から意味新規に具体化する。未知外挿や旧runtime移植の根拠にしない。

### FR-INT-070 — CORE入力からLABO consumer受領までの段階別接続（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-070`、connection、`version_target: 1.0`、PO-fixed adopted `MPR-RC-HELIXINTELLIGENCE-L2-070-002`。L2 633bf12:528–543、L11 fixed rows 213/229–238/251–256、PO row 100、G0。既存L2-033入力、L2-040送達、LABO-024受領と専用CONNECT contractを再利用し、payload/schema/正本を複製しない。
- 段階: 033 CORE input receipt → 069 calculation result → 040 send → LABO-024 consumer receipt。段階ごとにsource/consumer contract version, model/scenario, target scope/window, correlation, simulated-vs-observed statusを保つ。後続receiptはその段階に達する前の入力条件にしない。
- AC-INT-070-01 input: CASE-INT-070-01。許可された同一Product Core source/model revision, scope, 033専用connector contractのinput receiptを保持する。
- AC-INT-070-02 result binding: CASE-INT-070-02。069 resultを同じinput revision/scenarioへ結び、virtual statusとassumption/unknownを保持する。
- AC-INT-070-03 send: CASE-INT-070-03。計算後のresultだけを既存040 contractで送達し、送信receiptを受領receiptと同一視しない。
- AC-INT-070-04 consumer: CASE-INT-070-04。LABO-024のconsumer contract/receiptを送達後の独立段階で結び、LABO評価権限はLABOに残す。identity/time mismatch反例はAC-INT-070-08で扱う。
- AC-INT-070-05 反例: CASE-INT-070-05a〜05fを個別評価する。別model/revision/scopeを結ぶ、033 connector/authorityを飛ばす、virtualを実測とする、send receiptだけでLABO受領済みにする、correlation ID違いを同一視、対象source contractがpayloadを運べないために新fieldを黙って追加する各変異を拒否する。source identity/revision/scopeの不備はProduct Core/HARNESSの該当source ownerへ、connector登録/互換/transport failureはCONNECT・source/consumer ownerへ、consumer receipt/契約不一致はLABOへ戻し、source failureをCONNECTへ一律転送しない。05fではL2-033の選択source identity/contractを固定し、missing relationだけを変異させる。
- AC-INT-070-06 未見/反例: CASE-INT-070-06a–06iと10a–10c。06a–06eは重複receipt、06f–06iは遅着receipt。10aは040送達前のLABO-024 receipt、10bは040送達receiptだけstale、10cはLABO-024 receiptだけstaleとし、各々別段階の有効記録を保持する。L11:237の順序・freshness条件に従いreceipt未成立を保持する。戻し先はL2:542に従い10a/10cはLABO、10bのconnector/送達不一致はCONNECT・source/consumer ownerへ戻す。missing/stale/unknownは09群とも別に扱う。
- 旧source disposition: HELIX-Bench acceptance receipt/versioned cohort、OPS typed receipt/backflow、UIL source identity/evidenceを境界比較として再導出する。これらはCORE→LABOの本connection/schemaを提供しない。現行033/040/024とCONNECTを再利用し、旧integration/authorityは置換する。

### FR-INT-071 — 条件変更・計算・比較のcomposite（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-071`、composite、`version_target: 1.0`、PO-fixed adopted `MPR-RC-HELIXINTELLIGENCE-L2-071-002`。L2 633bf12:544–560、L11 fixed rows 213,239–246,247–257、PO row 101、G0。069計算と070送達を束ねるが、単体結果/送達のみでcomposite成立としない。
- AC-INT-071-01 正常: CASE-INT-071-01。L11 finite fixtureで033同一model revisionを固定し、baseline arrivals 5/5とload scenario 5/10、per-step service ceiling 8のqueue oracleを照合する。次にload increase、DB disconnect、virtual worker 2→4を別scenario runとして計算し、変更/invariant、順序付きtrace、queue/bottleneck/blocking state、数値可能時間/費用delta、unknown/unsupported、040 sendとLABO-024 receiptを比較表で結ぶ。worker例ではcompletion 3→2.25 min、cost 1.50→2.025 credits。DB断では明示edgeのorder processだけblockedとなり、recovery未定義を保つ。
- AC-INT-071-02 反例: CASE-INT-071-02a〜02hを各一変異で拒否する。baseline/scenario model revision不一致、scope mismatch、同じ比較でunit混在、edge外failure propagation、virtual worker changeでOS assignment更新、LABO receipt不在の完了claim、069単体結果だけでcomposite完了claim、unsupported/未定義costを0化する変異はそのscenarioだけを不成立にし、他の独立正常scenarioを止めない。02aは選択したCORE/Product Core model sourceをfixtureで固定し、stale revisionをそのsource ownerへ照合する。02cの未定義failure edgeはunknown/blockedを保持し、戻し先を追加しない。係数不一致は04d、retry/recoveryは04f/04g、rollback生成は05eで別々に照合し、02群へ束ねない。通常scenario計算に期待値oracleは要求しない。
- AC-INT-071-03 未見: CASE-INT-071-03。held-out finite modelは明示rule範囲内だけoracle照合し、unsupported edge/domainと後続actual receipt欠落を局所unknown/未比較にする。
- 旧sourceとの差分: G17 (HDEC-DESIGN-MODEL-CALCULATION-2026-09-27) はPO第3項の条件付き有限モデル計算を再導出した現行の意味根拠で、旧assetではない。旧source網羅検索は完全不在を証明しない。RLO pre-merge projectionは製品設計計算ではなく、実装移植の根拠にしない。保持は予測・反証・実測比較の目的、変更は有限model/schema/ruleに限定したvirtual calculationである。

### FR-INT-074 — 評価済み返却feedbackの配置proposal入力（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-074`、単体、`version_target: 1.0`、PO-fixed adopted `MPR-RC-HELIXINTELLIGENCE-L2-074-002`、candidate digest `5605649c…71719c`。snapshotのL2「未採択」文はG0・PO row 87の後続採択判断を覆さない。L2 633bf12:609–617、L11 rows 328–335、G0, empty-coverage receiptを束ねる。
- 責務: LABOがtask class/domain, target revision, scope, observation population/window, source completeness, evaluation state付き返却reason/missing input/oracle/reissue evidenceを評価する。INTELLIGENCEは同scopeに適用可能なfeedbackを次回proposalの根拠として引用し、範囲と未評価/不確実性を保つ。OSはticket/reissue/assignmentを所有する。
- AC-INT-074-01 正常: CASE-INT-074-01。評価済み・scope/revision一致のfeedbackを既存L2-010 proposalの入力材料として結び、配置理由と適用範囲を提示するが、feedbackだけでproposal正当性や成功をclaimしない。
- AC-INT-074-02 反例: CASE-INT-074-02a–02dとCASE-INT-074-05a–05aaを個別に評価する。05fはCASE-INT-074-02aへの完全ID索引。05lと06eはtask class mismatchが02bと同じevidence scope変異を索引化し、OS返却の別negativeに数えない。05w/xは正常trace例でありnegative母集団から除外する。未評価feedbackを適合化、別task/scope/revisionを流用、恒久資格/順位を生成、feedbackからmodel/Requirementを直接更新、INTELLIGENCEからticket/reissue/assignment/dispatchを実行する変異を拒否し、評価不足はLABO、task/ticket不足はOSへ返す。02e/02fは05q/rおよび05s/uへの旧複合indexであり独立fixture数に加えない。
- AC-INT-074-03 未見: CASE-INT-074-03。未見reason classはdeclared compatible scope内だけで再利用し、未知/比較不能を適合証拠にしない。
- AC-INT-074-04 unknown: CASE-INT-074-04a〜04c。source completeness、observation window、applicability statusをそれぞれ単独にunknownとし、該当fieldだけunknownのまま保持する。評価evidence不足はLABO、task/ticket属性不足はOSへ返す。applicability ownerは固定L2にないためownerを推測しない。複合fixtureは独立negative件数へ含めない。返却reason、missing input/oracle、再発行後verification state、母集団/windowと再評価条件をtraceへ保持する。新しいconsumer/ownerは設けない。
- 旧source: LEGACY-ASSET-9114D4E463E95B67DD0C / C6ADB99F1353965C5449 (WCC L3/L10), LEGACY-ASSET-28FB139B26CD61CC51EE / A952A3A175EB82A4781B (Bench L3/L10), LEGACY-ASSET-3A15E5645D2D2A59DFF5 (`execution-ticket-requirements.md:399`, adjacent old ticket source) を比較する。feedback利用は既存L2-010への限定接続として意味再導出し、旧provider/score/admission/reissue controlを再利用しない。

### FR-INT-077 — AAFD qualified delta sourceのidentity・unknown・非write境界（Stage 5）

- 親: `HELIXINTELLIGENCE-L2-077`、unit、`version_target: 1.0`、選択・適用範囲付き採択 `MPR-RC-HELIXINTELLIGENCE-L2-077-001` / digest `885656dd…7d344e`。固定L2 633bf12:635–645、L11 rows 352–362、PO `later35` row 53、G0で対象revisionを束ねる。固定L2本文内の「未採択candidate」snapshot文よりG0/PO decisionを優先するが、選択条件外への意味拡張はしない。
- scope: selected qualified internal/UIL-like or external/TER-like source receiptのidentity/revision/owner/origin typeを分離し、対応範囲内のdelta candidateへ結ぶ。実在するconsumer/route/ownerが明らかでない領域はunknownとして保持し、existing requirement ownerへの照合へ返す。旧UIL/TER/Future Synthesis名を現行機構や新ownerとして作らない。
- AC-INT-077-01 internal source正常: CASE-INT-077-01。qualified internal source receiptをsource owner・revision・origin typeへ束縛し、unknown fieldを埋めずnon-authoritative delta candidateとして提示する。
- AC-INT-077-02 external source正常: CASE-INT-077-02。external receiptも別origin identityとして結ぶ。external observationだけからHELIX defectを確定せず、internal receiptと同一sourceへ統合しない。
- AC-INT-077-03 反例: CASE-INT-077-03a〜03mは単独反例・索引を区別して照合する。単独変異の判定は各索引の参照先と独立CASE-INT-077-03gで行う。03gはunknown consumer/routeをunknownのまま保持して上流scope照合へ戻す独立CASEとして母集団へ含める。正常なsource/qualificationに返却を追加しない。同固定L11:361に従い、source identity/qualificationの不明は該当source owner、INTELLIGENCEのfinding/delta candidate根拠はINTELLIGENCE owner、AssignmentはOS owner、評価はLABO ownerへ返し、consumer不明はunknownのまま上流scope照合へ戻す。unknownを0/neutral/unchanged/observedに補完、internal/external origin swap、未qualified/stale receipt受入、Requirement/Design/Release/Assignment/merge authorityへの直接変更、未特定consumer/routeの新設を許可しない。03a/b/c/d/e/h/i/j/k/l/mはそれぞれCASE-INT-077-05a/05o/05r/05e/05f/05g/05h/05i/05b/05c/05dへの完全ID索引、03fは旧複合集約索引であり、全12行を独立negative件数へ重ねない。03gだけを03群の独立fixtureとする。Release/Assignment/merge変更は05g/05h/05iで別々に照合する。selected receiptのqualification不足は選択source ownerへ照合し、Requirement/Design/Release/mergeの直接変更は拒否し返却ownerを推測しない。unknown consumerは上流scope照合へ戻す。
- AC-INT-077-04 unseen/unknown: CASE-INT-077-04。選択receiptのowner/origin type/revision/qualification evidenceが欠落・不一致または未見ならunknown/incompleteのまま保持して選択receiptのsource ownerへ照合し、未選択reference資料へfallbackしない。consumer不明はunknownのまま上流scope照合へ戻す。
- 旧source: LEGACY-ASSET-EB3700B0088F311C2295 (`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:52–53,71`), LEGACY-ASSET-CAC0C64EB7540180B1FE (paired `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:19–22,39–44`)。AAFD-R-05/R-08のselected-source/origin/unknown/non-write意味を再導出する。旧UIL/TER/Future Synthesisのruntime・route・API/schema・qualification algorithmは現行へ移管せず、本候補の置換対象にも含めない。現行consumer/ownerを推定しない。


#### Stage 5 条件別trace補完（既存9親の範囲）

以下のACは固定L2/L11にある独立条件のtraceを明確にする。既存のFR/ACは保持し、列挙された変異を一つずつ異なるCASEへ対応させる。戻し先は固定親の既存ownerに限り、特定できないfacetはunknownのままにする。

| L3 AC | 独立CASE | 条件・期待される保持/戻し先 |
|---|---|---|
| `AC-INT-060-05` | `CASE-INT-060-05a`–`CASE-INT-060-05i` | 05a–05dは独立negativeの06a/06f/06i/06lへの完全ID索引。独立fixtureはstop欠落、fallback欠落、dependency cycle/identity、fallback正常例を各行で判定する。05e/05g/05hはHARNESS process contract source identity/ownerと該当stop条件・依存をfixtureで固定し、入力不足は該当HARNESS source/contract ownerへ戻す。ticket受領・進行不能はOSへ戻す。 |
| `AC-INT-061-05` | `CASE-INT-061-05a`–`CASE-INT-061-05f` | 未見互換評価、task scope、OS assignment可否、段階別receipt identity/revision、評価理由をそれぞれ独立に変異する。評価互換不明はLABO、task scopeはINTELLIGENCE、割当可否はOSへ戻し、異なる段階のreceiptを同一視しない。 |
| `AC-INT-062-04` | `CASE-INT-062-04a`–`CASE-INT-062-04i` | isolation、target/scope/revision/owner、stage状態の既存fixtureを維持する。repair candidate欠落は新CASE-062-05aへ分離し、候補owner不明をunknownで保持する。 |
| `AC-INT-063-04` | `CASE-INT-063-04a`–`CASE-INT-063-04h` | LABO評価不足、BRAIN source不明、OS実行未完、historical evaluationによるcurrent state上書き、未承認knowledge候補の一般知識化、遅着/重複結果の別episode適用を個別に判定する。固定L2-063が指定するLABO/BRAIN/OSだけに戻し、HARNESS process contractの戻し先は本fixture群に追加しない。 |
| `AC-INT-069-04` | `CASE-INT-069-04a`–`CASE-INT-069-04j` | 未宣言rule/係数、別revision、unit不一致、price欠落、edge外propagation、recovery創作、virtual/actual混同、説明文だけのevidence、ceilingをsourceに残して計算だけが無視する変異、選択sourceからceilingが欠落して同revisionの別sourceもない変異を各独立fixtureで拒否/unknown判定する。 |
| `AC-INT-069-06` | `CASE-INT-069-06a`–`CASE-INT-069-06u` | HARNESS-L2-010/011の採択済みpack contractを常時照合し、各required source fieldを独立に欠落/不一致にする。011のcall固有inputだけはcall利用operationで照合する。pack contract不足はHARNESS契約owner、L2-069が指定するsource revision/owner/permission不足はProduct Core/HARNESS/SECURITY、fact/inference混同は選択source owner、data-use/authority不足はSECURITYへ戻す。それ以外で固定L2が戻し先を定めない入力不足はunknownのまま保持し、ownerを追加しない。未選択sourceは未観測のままとしfallbackしない。 |
| `AC-INT-069-07` | `CASE-INT-069-07a`–`CASE-INT-069-07f` | 通常計算で期待値oracleなし、070/040/LABO-024後段receiptなしの正常例を保つ。別に利用者指定verificationで期待値oracleだけ欠落する反例、期限/resource/stop cutoff位置だけ欠落する反例を判定する。通常計算に後段receipt/oracleを追加必須化しない。resource不足/expiry/cutoffは途中結果とその位置を保持する。 |
| `AC-INT-070-06` | `CASE-INT-070-06a`–`CASE-INT-070-06i`, `CASE-INT-070-10a`–`CASE-INT-070-10c` | duplicate/late receiptとL11:237のout-of-order LABO-024・stale 040 send・stale LABO-024 receiptを別々に照合し、stage orderとconsumer receiptを保つ。 |
| `AC-INT-070-07` | `CASE-INT-070-07a`–`CASE-INT-070-07l` | 040 send contract、contract revision、correlation、scope、LABO-024 consumer contract/版、source/model identity、data-use binding、選択connectorの登録・互換・transport receiptを各単独fixtureで照合する。source identity不備はProduct Core/HARNESSのsource owner、CONNECT技術failureはCONNECT・source/consumer owner、consumer receipt/contractはLABOへ戻し、send receiptをconsumer receiptへ昇格しない。 |
| `AC-INT-070-08` | `CASE-INT-070-08a`–`CASE-INT-070-08e` | 08aは05cへの完全ID索引。prediction/actualのsource不一致・window mismatchは比較保留/unknownを保つ。LABOは評価ownerとして保持する。閾値未決と未選択consumerはunknownを保ち、戻し先unknown。 |
| `AC-INT-071-04` | `CASE-INT-071-04a`–`CASE-INT-071-04j` | baseline/load、DB断、virtual workerの3正常scenarioを別runとして保持し、6つの出力facetと比較bindingをtraceする。比較係数/window不一致、モデルにないretry/recovery、edge外failure、simulationをactual/LABO評価済みとする各反例を独立に判定する。rollback/retry/recoveryは04f/04g、05eでも個別にtraceし二重計上しない。無関係の正常scenarioを停止しない。 |
| `AC-INT-074-05` | `CASE-INT-074-05a`–`CASE-INT-074-05aa` | 05fはCASE-INT-074-02aへの完全ID索引、05yはCASE-INT-074-05jへの完全ID索引、05l/06eはCASE-INT-074-02bへの完全ID索引、05w/xは正常fixtureでnegative分母外。05aaはL2-074:613およびL2-010:104に基づき、task class/domainとLABO評価receiptを保持して明示capability条件不一致を無視する単独反例。proposalは未確定のまま保持し、この反例へ戻し先を追加しない。task属性欠落はOS、evidence scope不一致はLABOへ戻す別条件である。 |
| `AC-INT-077-05` | `CASE-INT-077-05a`–`CASE-INT-077-05z` | unknown補完4、Requirement/Design/Release/Assignment/mergeへの直接変更5、selected receipt binding欠落/不一致・stale/read failure 12、fallback/reference/origin境界5を個別に判定する。四依存区分を維持し、source qualificationを再実装せず、未特定owner/routeは推測しない。 |

FR-INT-062の固定L11 locatorは行116、169および283である。FR-INT-063は別親L2-063の固定詳細117/170–171/284を使い、L2-062の条件と混ぜない。FR-INT-077の旧要求source pathは`agentic-audit-future-state-delta-requirements.md`である。旧段階の形式・反例は比較材料として再導出する。旧runtime/route/qualification判定は現行へ移管せず、本候補の置換対象にも含めない。

## Stage 5 review01 correction overlay（9親内）

以下は固定L2/L11に既にある条件のFR/AC trace補正であり、親の意味・scope・owner・版を変えない。各negativeはFVの同ID一条件変異fixtureに対応し、索引・集約行は個別fixture数に含めない。

| AC | 固定句と追補fixture | 判定／既存責務 |
|---|---|---|
| AC-INT-060-06 | CASE-INT-060-06a–06l | 06e/06h/06kは02b/02c/04aへの完全ID索引。独立runは06a/b/c/d/f/g/i/j/lの9件で、requirement/HARNESS/OS/BRAIN source状態を個別照合する。ticket化不能のみOS。 |
| AC-INT-061-06 | CASE-INT-061-06a–06c | task identityとWorker実績のmissing/staleを分離。task/scope不明はINTELLIGENCE、Worker実績のsource/evaluation不足はLABO、assignment不可はOS。 |
| AC-INT-062-05 | CASE-INT-062-05a–05e | repair candidateの戻り先を推測しない。固定L2にownerが明記されたpermission/実行/検証/検収のみ各ownerへ戻し、候補owner不明はunknown。正常結果の退行、write-set逸脱、HARNESS obligation変更は各独立fixture。 |
| AC-INT-063-05 | CASE-INT-063-05a–05d | current INT judgmentとHARNESS contractの欠落/staleを独立照合する。固定L2に返却先の指定がないため、いずれも戻し先unknownを保持する。prediction/actual置換CASE-INT-063-02dは固定L2-063/L11-117/284に根拠がないため独立要件・fixture母集団から除外する。 |
| AC-INT-069-08 | CASE-INT-069-08a–08o | L2-069列挙入力を項目ごとに欠落・unknown・stale・不一致にする。source revision/owner/permissionは固定L2の該当記述どおりProduct Core/HARNESS/SECURITYへ、schema・遷移・domain未対応はmodel ownerへ、観測/推論混同は選択source ownerへ戻す。data-use/authority条件欠落はSECURITYへ戻す。その他の係数・規則・load/capacity/currency・baseline/scenario入力不足や未対応failure edgeは計算不能/部分unknownまたはunknown/blockedを保ち、固定L2にない戻し先を追加しない。選択した検証operationの期待結果oracle不足だけはscenario author/該当source ownerへ戻す。HARNESS-L2-010/011は常時適用契約として照合し、011をcall選択時だけの依存にしない。 |
| AC-INT-070-09 | CASE-INT-070-09a–09g | 033 input receipt・069 resultの欠落、scenario/product identity不一致、既知regressionの誤予測、source design authority移管を分離する。033→069→040→LABO-024順を維持し、source authorityは既存source ownerに残す。 |
| AC-INT-071-05 | CASE-INT-071-05a–05r | 後段receiptの先取り、期待oracle条件、threshold未決、rollback/retry/recovery創作、worker数からの速度比例仮定、input receipt/connector/stop/unsupported状態、L1-013 provenance、常時必須HARNESS pack contract 010/011と適用operationの023 dependency classを個別照合する。通常scenarioは明示ruleに従い、期待結果指定operationだけ独立oracleを要求する。 |
| AC-INT-074-06 | CASE-INT-074-06a–06h | 06eは02bへの完全ID索引。reason class、missing input/oracle、reissue verification、domain、population、LABO evaluation stateの欠落/unknown/staleを分離する。applicability ownerは固定L2にないため推測せずunknownを維持する。評価不足はLABOへ戻す。task/ticket属性不足の反例CASE-INT-074-05dはOSへ戻す別母集団であり、この06群へ重ねない。 |
| AC-INT-077-06 | CASE-INT-077-06a–06g | dependency 4区分のidentity/revision/適用条件、区分混同、未選択source、unknown applicabilityを独立照合する。HARNESS-L2-023は分類契約として扱い、親固有ownerを決める根拠にしない。未選択sourceと不明ownerはunknownのままとする。 |

repair candidateだけが不足した場合のINTELLIGENCEへの返却は固定L2-062:370に指定がないため推測せずunknownとする。permission・実行・検証・検収の不足は、同固定句が明記するSECURITY・Worker・HARNESS・OSへの返却を保持する。既存AC-INT-074-04/05の「applicability owner」「既存L1/L2 owner」への返却も追加しない。069-06はHARNESS-L2-010/011の採択済みpack contract identity/version/scope/provenanceを常時照合し、011のcall固有input値だけを該当operationで照合する。Stage 5既存親のowner、version、依存意味は変更しない。
