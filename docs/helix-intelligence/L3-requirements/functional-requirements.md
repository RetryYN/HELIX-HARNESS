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
  - **AC-INT-010-04 negative**: ticket/task identity、type、domain、complexity、context、tool requirementの各欠落を独立変異で拒否しOSへ戻す。Worker capability/version、success/failure/rework/latency/cost/reliability観測source/revision/scopeの各欠落/stale、LABO HELIX-Bench作業種別・model classの各不一致は別々に拒否し、証拠不足をLABOへ戻してproposalを未確定にする。LABO水準未評価をqualified扱いする変異も独立して拒否する。
  - **AC-INT-010-05 未見正常**: 未公開task/worker profile組合せで適合scope内の候補だけを提示する。evidenceがなければ未評価を保ち、OS assignment/進行はINT proposalから成立しない。
  - **AC-INT-010-06 negative**: 実際に消費する共通pack contractのidentity、契約/成果物/依存version、互換範囲、交換/更新条件が欠落・stale・不一致なら互換成立と扱わない。互換不成立としてproposalを未確定にし、共通pack contract ownerの定めへ戻す。HARNESS共通contractの定義ownerは固定pack contract側に残す。
  - **AC-INT-010-07 negative（G13／固定L11:197）**: 選択経路で利用する既決quality/priority/tolerance判断と比較材料がscope/revisionに適用されるかを照合する。必要品質未達・unknown・未評価を隠す、適用範囲内の有効decisionを毎run再確認する、またはhuman intervention costを総費用から落とす各変異を独立に拒否し、既存判断は適用内で再利用する。G13が挙げる067/034固有契約の詳細は、それらの採択Stageで各親のscopeとして扱い、010の新しい親依存・gateにしない。

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
  - **AC-INT-066-05 negative**: 推奨Worker、根拠、除外理由、不確実性、unknown、未評価表示、Worker identity/capability/version、LABO evidence/state/source/revision/scope、L2-010 proposal schema、proposal contract revision/version、適用pack contract identity/version、作成actor/timeの各fieldを個別に欠落/stale/不一致にする変異を拒否する。profile/capability/versionおよびBench evidence/state/source/revision/scopeはL2-061のLABO評価材料・Worker実績の範囲でLABOへ戻す。schema/contract不明はINTELLIGENCE、OS ticket/receiptとproposal作成・受領actor/timeのreceipt binding不成立はOSへ戻し、assignmentを成立扱いしない。
  - **AC-INT-066-06 negative**: authority、scope、branchの各拡張、実行許可の付与、OS assignment代行を個別変異し、いずれも不成立とする。
  - **AC-INT-066-07 未見正常**: 未公開の人作成proposal fixtureでもorigin・schema/contract revision・source/scope・未評価状態・actor/timeを保持して受領する。受領後もassignmentはOSの別判断である。
  - **AC-INT-066-08 negative**: 同一proposal重複を新規根拠として数える場合、または未見contract版/遅延receiptでversion/scope互換性が不明なのに受領・割当を進める場合を別々に拒否する。後者はreceiptの未確定条件としてOSへ戻す。L11:137のschema/version不明からINTELLIGENCEへ戻す条件とは区別する。

## Scope除外・backflow

Stage1草稿は未承認authorityとして使わず、採択済みsourceが実際に使われる場合だけその固定revisionを検証する。L2/L1の意味、scope、ownerまたはversionを変えなければ成立しない不足が見つかった場合のみ、原文・理由・影響を付して上流へ戻す。技術候補の比較にPO per-parameter承認や新gateを作らない。`HELIXINTELLIGENCE-L2-067`はこのStageの独立親・必須前提にはしない。ただし固定L11:197のG13はこの010の受入条件として保持し、既にscope/revision内で有効な判断の再利用と個別反例を検証する。067固有の入力契約詳細はStage 3、L2-034の評価packet契約詳細はStage 4で各親のscopeとして扱う。Stage 2aでは固定010の同scope実績とG13の必要な結果句だけを照合し、後続親の完了をgateにしない。保留・不採択要求、後続版/Web条件をこの1.0親へ追加しない。

## C13 carry-forward

C13-M10、C13-M7、C13-M12 audit-record correction、Minor INT-010、Minor INT-060-078は未解消として引き継ぐ。`C13-U-INT-NFR-060-078`と`C13-U-all-crosswalk-and-legacy`も未確認のまま保持する。この新規draftは独立reviewやfinding closureを意味しない。source・parent別割当とraw pinsはrevision-specificなhandoff/監査記録へ収録する。private `/tmp` artifactを継続的な正本依存にしない。
