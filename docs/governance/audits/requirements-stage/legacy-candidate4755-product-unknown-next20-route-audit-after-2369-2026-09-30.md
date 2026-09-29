# 旧候補 product-unknown 次の20件のroute監査（2026-09-30）

- authority effect: `none`。merged proposal overlayは選定用の分類としてのみ適用した。要求採択、successor、被覆、受入、実装、Stage 5完了は生成しない。
- base: `origin/main` `081b0b6612b802cfcb02b3cecda1559dd9a3ce13`。調査対象は旧candidate sourceの4,755行。
- 選定: #2353の全row recordに#2356/#2360/#2363/#2366/#2367/#2368/#2369をexact IDで重ね、#2350/#2359/#2364のselected-ID union 60件を除外した。unionのうち488件のeligible母集団に含まれるのは41件（19件は母集団外）で、除外後は447件。数値昇順の先頭20件を選んだ。proposal arithmeticは`544 - 12 - 11 - 14 - 21 + 2 = 488`。

## 選定行とroute relation

|順|Source ID|旧source:line|route relation|対応と残差|
|---:|---|---|---|---|
|1|`LEGACY-CAND-LINE-000703`|`docs/governance/candidates/conversation-lifetime-reconstruction-acceptance.md:40`|`adopted_relevant_partial`|採択済みSECURITYのpredicateは、明示されていないproject/tenant間の越境と、AI contextへのraw secret露出を防ぐ。旧source行はこれに加え、撤回済みclaim、取消権限、private reasoning、他案件contextも拒否するが、これらの残差は今回の一致では扱わない。|
|2|`LEGACY-CAND-LINE-000705`|`docs/governance/candidates/conversation-lifetime-reconstruction-acceptance.md:44`|`true_unknown`|採択済みの正確なL2/L11 revisionに、このatom固有のpredicateは見つからなかった。現行OSの復旧とHARNESSの検証境界は周辺責務として関連するが、同一taskでのmodel比較、provider更新後の再現性、またはこの行固有のmetric一式を採択していない。|
|3|`LEGACY-CAND-LINE-000706`|`docs/governance/candidates/conversation-lifetime-reconstruction-acceptance.md:45`|`true_unknown`|採択済みの正確なL2/L11 revisionに、このatom固有のpredicateは見つからなかった。現行OSの復旧とHARNESSの検証境界は周辺責務として関連するが、同一taskでのmodel比較、provider更新後の再現性、またはこの行固有のmetric一式を採択していない。|
|4|`LEGACY-CAND-LINE-000725`|`docs/governance/candidates/conversation-lifetime-reconstruction-requests.md:16`|`adopted_relevant_partial`|採択済みOS predicateは、中断後の安全な継続・復旧を支え、累積上限を保ち重複作用を防ぐ。旧sourceが加える外部のcanonical stateからの再構成と、特定のlogical-lane/session modelは、この一致では採択されていない。|
|5|`LEGACY-CAND-LINE-000771`|`docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md:52`|`true_unknown`|採択済みの正確なL2/L11 revisionに、このatom固有のpredicateは見つからなかった。現行OSの復旧とHARNESSの検証境界は周辺責務として関連するが、同一taskでのmodel比較、provider更新後の再現性、またはこの行固有のmetric一式を採択していない。|
|6|`LEGACY-CAND-LINE-000840`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:31`|`adopted_relevant_partial`|採択済みHARNESS-L2-039は、既存の024/025/026契約を組み合わせるCORE compositeであり、新たなserviceを設けないと定める。これは既存Design Harness能力を土台として使うという広い指示に部分的に関係する。残差として、旧Design Harnessの全inventoryや、同じ責務を実装するあらゆる場合までは採択していない。|
|7|`LEGACY-CAND-LINE-000841`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:32`|`adopted_relevant_partial`|採択済み039は選択されたUI/prototype sourceを束縛し、既存024のagreement/prototype境界を組み合わせるため、source一覧のPrototype/Walkthrough部分に部分的に関係する。残差として、Screen Applicability、Design Registry、UI Domain Pattern、Evidence Bindingの名称およびそれぞれの旧契約を、このpredicateが個別に採択したわけではない。|
|8|`LEGACY-CAND-LINE-000850`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:47`|`true_unknown`|旧sourceは既存能力の広い一覧を接続先として指定する。採択済み039は024/025/026の名指しされた契約と選択UI sourceを組み合わせるが、この行に記された接続先全体を列挙していない。この行と一致する正確なpredicateは確立できない。|
|9|`LEGACY-CAND-LINE-000851`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:49`|`adopted_relevant_partial`|採択済み039はExperience/UI/Frontend scopeへの適用性と、選択されたUI sourceのidentity、revision、scope、authorityの束縛を定め、適用性unknownをN/Aとして扱わない。これは適用性の判定に部分的に一致する。残差として、旧persistence機構を単独のsuccessorとして採択していない。|
|10|`LEGACY-CAND-LINE-000852`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:50`|`adopted_relevant_partial`|採択済み039は既存024のagreement/prototype境界を使い、prototypeのagreement/closureを主張する場合に、操作可能なprototypeと同一scopeのwalkthrough evidenceを要求する。これは名前の挙がるprototype/walkthrough部分に部分的に一致する。残差として、人のdecision、finding、back-propagationの完全な契約が旧sourceのsuccessorとして確立されていない。|
|11|`LEGACY-CAND-LINE-000853`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:51`|`adopted_relevant_partial`|採択済み039は選択されたUI/design sourceのidentity、revision、scope、authorityを要求し、relation evidenceのstaleまたは欠落をunknownとして扱う。これはrevision/authority/bindingの意味に部分的に一致する。残差として、旧Design Registryのlifecycleとsupersession modelは確立されていない。|
|12|`LEGACY-CAND-LINE-000854`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:52`|`adopted_relevant_partial`|採択済み039は選択されたPattern/design-system inputをidentity、revision、scope、authorityとともに受け取る。これは名前の挙がるUI Domain Pattern inputに部分的に一致する。残差として、旧domain/profile modelは採択されていない。|
|13|`LEGACY-CAND-LINE-000855`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:53`|`adopted_relevant_partial`|採択済み039はUX evidenceとvisual、interaction、accessibility、responsive、motion、performanceの条件を、選択UI scopeおよびrisk-based verificationに結び付ける。これはそれらのevidence roleを再利用することに部分的に一致する。残差として、旧evidence schemaと固定role taxonomyは採択されていない。|
|14|`LEGACY-CAND-LINE-000856`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:54`|`true_unknown`|採択済み039はResearch subsystemを定義せず、列挙されたResearch skill/project-explorer/technical-document/OSS-research能力も採択していない。この行は未解決のままである。|
|15|`LEGACY-CAND-LINE-000857`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:56`|`adopted_relevant_partial`|採択済み039は、compositeが既存024/025/026契約を使い、新しいserviceではないと定める。これは該当するUI/design責務について、並行実装を禁じる旧sourceの規則に部分的に関係する。残差として、別のすべてのengine、registry、prototype gate、research subsystemを対象とする包括的な禁止までは確立していない。|
|16|`LEGACY-CAND-LINE-000942`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:178`|`adopted_relevant_partial`|採択済みHARNESS-L2-039の正確なrevisionはaccessibilityの適用条件の差を識別し、選択されたUI scopeにrisk-based verificationとUX evidenceを要求する。これはaccessibilityをHELIXが検証する客観的なUX条件として扱うpredicateの種類に一致するため、部分関係とした。残差として、039は包括的な委任方針、accessibilityの合否threshold、この固定checklistをsuccessorとして採択していない。|
|17|`LEGACY-CAND-LINE-000943`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:179`|`adopted_relevant_partial`|採択済みHARNESS-L2-039の正確なrevisionはinteractionからE2Eへのdriftと、選択されたUI scopeのrisk-based verificationを扱う。これはinteraction/state correctnessをHELIXが検証する客観的なUX条件として扱うことに部分的に一致する。残差として、039は包括的な委任方針、state correctnessのoracle/threshold、この固定checklistをsuccessorとして採択していない。|
|18|`LEGACY-CAND-LINE-000944`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:180`|`true_unknown`|採択済みHARNESS-L2-039の正確なrevisionはscreen/flow/interactionのtraceとinteractionからE2Eへのdriftを扱うが、navigation dead-end predicateやroute-graph受入oracleは定義していない。旧source行は特定の検査を示しており、採択済みpredicateとの正確な一致を確立できないためunknownのままとする。|
|19|`LEGACY-CAND-LINE-000945`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:181`|`adopted_relevant_partial`|採択済みHARNESS-L2-039の正確なrevisionはresponsive適用条件の差を識別し、選択されたUI scopeにrisk-based verificationを要求する。これはresponsive動作をHELIXが検証する客観的なUX条件として扱うことに部分的に一致する。残差として、039は包括的な委任方針、responsiveの合否threshold、この固定checklistをsuccessorとして採択していない。|
|20|`LEGACY-CAND-LINE-000946`|`docs/governance/candidates/design-grounding-human-convergence-intake.md:182`|`adopted_relevant_partial`|採択済みHARNESS-L2-039の正確なrevisionはperformance条件を選択されたUI scope、risk-based verification、UX evidenceに結び付ける。これはperformanceをHELIXが検証する客観的なUX条件として扱うことに部分的に一致する。残差として、039は包括的な委任方針、performance threshold、この固定checklistをsuccessorとして採択していない。|

分類件数: `adopted_relevant_partial` 14件、`true_unknown` 6件、`unadopted_candidate_relation_only` 0件（20 row identity）。

## 共通atomの境界

`000840`、`000841`、`000850–000857`は、#2367/#2369のproposalで`DGH-intake.nonreplacement-integration-constraint`という単一の10行source atomに結び付けられた。選定対象は10個のrow identityだが、atom境界は1つであり、各行を独立した採択・coverage・successorとして数えない。これは分類境界のproposalで、旧candidateのauthority状態は変わらない。

## 採択済みexact revisionとの照合

HARNESS-L2-039は`docs/governance/decisions/po-decision-2026-09-29-57candidates.md:44`により`MPR-RC-HARNESS-L2-039-003`のexact revisionで採択されている。他の採択済みL2/L11もPO decision recordが固定したrevisionで照合した。現在のdraft frontmatterではなく、各pinの本文とsource predicateを比較した。`adopted_relevant_partial`は意味の一致する具体的な採択predicateがある場合に限る。話題名の一致やcandidate参照だけでは採択関係としない。HARNESS/OS/SECURITY/BRAINの固定L2/L11 pinは、該当する行のroute evidenceに使用した。

## 範囲と限界

- `adopted_relevant_partial`は関係分類であり、旧要求の採択や無損失被覆を意味しない。旧候補行は引き続き`historical_candidate` / `draft_candidate` / `preserved_pending_atomization`のままである。039の採択は現行要求のauthorityを示すもので、旧source行を採択しない。
- 旧sourceの採択、successor、全source coverage/closure、意味変更・retire、受入、L3、実装・実行、Stage 5完了を主張しない。
- archive内の旧runtime、CLI、test、hook、CIは実行していない。
- JSONには#2350/#2359/#2364の除外set、overlay source ID、各source row/file/line digest、採択済みrevision pinを記録した。

## 静的検証

- JSON parse、20 IDの一意性と除外との重複、source file SHA-256、physical-line SHA-256、行数を検証した。
- 除外ID union 60件のうち有効母集団との交差が41件であること、eligible数447件、route分類件数を確認した。
- 結果とauthority境界はJSONの`validation`に記録した。
