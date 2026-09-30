# confirmed175 FR-L1-24/25/26/27 固定L2/L11条件照合監査

read-onlyの静的照合。`authority_effect: none`。対象は旧confirmed175のFR-L1-24〜27。source statusは`confirmed`、carry-forward stateは`preserved_pending_rehome`。対象L2/L11はPO判断で固定されたrevision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。要求採択、successor割当、実装/運用/受入完了、Step5完了、人間判断を生成しない。

旧sourceは`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md`、asset `LEGACY-ASSET-6B6C5CB0E481BE01088B`。sourceとholding snapshot (`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/functional-requirements.md`) のSHA-256はいずれも `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`。asset ledgerはsource `confirmed`、`preserved_pending_rehome`、decision `pending_human_confirmation`を示す。

固定target file SHA-256: HARNESS L2 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、HARNESS L11 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`、OS L2 `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`、OS L11 `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`。この固定bytesを基準にする。後発採択pairは別revisionとして比較し、固定targetのbytesは変更しない。

| 旧identity / 原文行 | 固定targetで保持される意味 | 旧固有条件・非継承 | 未解決残差 |
|---|---|---|---|
| `FR-L1-24` (`functional-requirements.md:55`, line SHA `b502c6541cd38199b326c8802f5965f631848cfd16f728125309a64b076db219`) — Add-feature: 影響範囲の差分追補、add-design / add-implを既存PLANへrequires接続。 | HARNESS-L2-003/004と対L11 (`product-requirements.md:54-55,110-117`; `product-acceptance.md:23-24`) が、工程条件、要求→設計/テストの影響、再検証、意味変更時のBackflowを保持する。OS L2-010/HXT-TYPE-18とL11 (`governance-requirements.md:142-149,595`; `governance-acceptance.md:295`) は、Add-featureを計画ticketとし、既存層の差分からForward該当層へつなぐ。 | 旧`add-design`/`add-impl` PLAN名とschema/frontmatter、`requires`の旧field形、旧G7/parent/CLIはそのまま移していない。 | 追加要求の影響差分をどの現行成果物へ記録するか、設計/実装差分を一組として既存作業へ結ぶexact record/outputとrelationが固定targetからは分からない。一般traceと再検証規則だけで旧workflow全体の移管済みとはいえない。 |
| `FR-L1-25` (`functional-requirements.md:56`, line SHA `db99f7f2e106bccf09787958d91b6a1a5c4a7aaeb2e1caec4dcbaa130ab4c781`) — Refactor: axis-11 regressionで振る舞い不変を機械検証、`kind=refactor`。 | HARNESS-L2-016とL11 (`product-requirements.md:330,395-401`; `product-acceptance.md:211`) は、振る舞い・契約・要求を保つ変更、意味変更のBackflow、Performance Refactorのbaseline/oracle条件を定める。OS L2-010/HXT-TYPE-12とL11 (`governance-requirements.md:142-145,589`; `governance-acceptance.md:289`) はRefactor ticketの目的、発行、Forward 小への合流と振る舞い変更の反例を示す。 | 旧`axis-11`検査名、kind/schema、Refactor PLAN/module、L7/G7の旧層体系、旧DB/test/CLIは固定targetへ移していない。 | 固定targetは意味保持を要求するが、axis-11を現行の普遍的な機械oracleとすること、保護網となるtest集合の十分性、Green evidenceの具体結合を規定しない。既存testが緑というだけで振る舞い不変の機械証明は成立しない。 |
| `FR-L1-26` (`functional-requirements.md:57`, line SHA `6a515327947c828ecfae9f196b5bfa177e0d95eb107be1c1c84818aa6c365773`) — Retrofit: `retrofit-matrix`による影響評価と段階的config移行。 | OS L2-010/HXT-TYPE-16とL11 (`governance-requirements.md:146,593`; `governance-acceptance.md:293`) が依存/基盤/構成の更新、段階移行、対象範囲・結果、Forward該当層への合流を保持する。PO decisionで採用されたOS L2-021 (`governance-requirements.md:702-710`) は選択HARNESS構成のproject配布・更新・復旧に限り、一般Retrofit条件とは別identity。HARNESS-L2-003/004とL11 (`product-requirements.md:54-55,110-117`; `product-acceptance.md:23-24`) は工程の未完/差戻しと影響・再検証に関係する。 | 旧`retrofit-matrix` filename/schema、config形式、L4-L7/L7旧層写像、G4、旧preflight/CLI/runtimeおよび旧test/DB整合検査は継承していない。PO decisionで採用されたHELIXOS-L2-021のHARNESS構成版配布・更新・復旧は別identity。 | 固定targetは段階移行と範囲/結果を示すが、matrixのfield/依存全範囲、各段階のconfig遷移とrollback、回帰/性能/DB oracle、workflow完了条件の一体化を全Retrofitへ要求していない。 |
| `FR-L1-27` (`functional-requirements.md:58`, line SHA `b96e4d6f69ae1e56cee0403d77791e0e08458da00ce4312e10cf99c0d7f30a37`) — Research: 技術調査→比較評価→ADR、`kind=research`、`generates=research-memo + ADR`。 | OS L2-010/HXT-TYPE-17とL11 (`governance-requirements.md:147,594`; `governance-acceptance.md:294`) は、Researchを参考source収集とし、裁定せず依頼元へ返す。OS L2-010（本文 `governance-requirements.md:110-115`）とHARNESS-L2-002/003 (`governance-requirements.md:110-115`; `product-requirements.md:53-54`) は計画/配置候補、ticket発行、開発方式の責務を区別する。 | 旧`kind`/`generates` field、research-memo/ADRの自動生成、旧ADR-NNN/path/schema、5段階順序、旧review gateは現行条件として継承していない。 | 固定targetはResearchの非裁定境界を明示するが、調査→比較→ADR→memoの順、成果物2種のexact output/source citation、選択肢と制約の記録、ADRが必要な条件およびL1/L4への接続を一体の受入契約として定めていない。要求採否/技術選択は別の既存判断主体に残る。 |

## 後発採択pairとの比較

2026-09-29の[PO判断記録](../../decisions/po-decision-2026-09-29-57candidates.md)（`HDEC-REQUIREMENTS-57-2026-09-29`）は、PR baseにも記録され、HARNESS-L2-042とHELIXOS-L2-036をそれぞれ対L11と一組で採択した。両pairの内容revisionは`318ec4a04abb3c1cc17111b3d939f913facd5fd3`。記録が固定するfile SHA/section digestはJSONの`later_adopted_pair_review.pairs`に記録した。文書内のcandidate metadataはPO decisionを覆さない。11件の別decision recordは別identity集合で、これら2 pairを含まない。

比較範囲は57候補判断の57 identityと、別decisionの11候補判断の10採択identity＋不採択HARNESS-L2-049を全件照合した。近接pairと影響はFR各行に記す。特にHARNESS-L2-037（drift/debt観測から既存Refactor/Reverse候補への接続）はFR-L1-25/27に近いが、週次観測・候補提案でありDesign Refactorの判定oracleやResearch memo/ADRの順序・出力契約を定めない。FR-L1-27のHARNESS-L2-035（候補導出根拠）/HELIXOS-L2-023（handoff）も調査成果物の生成条件を補わない。11候補側のHARNESS-L2-050（layer-ledger refactor）はledger構成体の範囲で、Design Refactor workflowではない。

| 採択pair | 新たに固定された条件 | 本監査対象への影響と残差 |
|---|---|---|
| HARNESS-L2-042 / 対L11 | Design Refactor判定へsemantic similarity・consumer・oracle・dependency graphを使い、機能追加を別episodeにする。振る舞い・要求・契約の保持確認と性能条件は採択済みL2-016/対L11へ接続。 | FR-L1-25のDesign Refactorと追加機能混載条件を具体化し、FR-L1-24ではRefactor内の機能追加分離だけに関係する。旧axis-11機械oracle・test集合は未確定のまま。HELIXOS-L2-031/034とHELIXLABO-L2-061は性能/計測/比較evidenceを強めるが全test集合oracleではない。全Add-featureのoutput/requires関係も未確定。 |
| HELIXOS-L2-036 / 対L11 | 全Retrofit upgradeのpreflight duty/resultをticket・scope・revisionへ結び、pass前のplan確定とstale resultでのapplyを拒む。HARNESS oracleを使い、OSは判定・実行authorityを作らない。 | FR-L1-26のupgrade順序・preflight接続を部分的に具体化する。retrofit-matrix schema、依存全域、段階config・rollback・回帰oracleの結合は未確定。 |
| その他の意味近接pair | HARNESS-L2-034/HELIXOS-L2-031はmetric/performance evidence、HARNESS-L2-037はdrift/debtからのRefactor/Reverse候補接続、HARNESS-L2-035は要求候補根拠、HELIXOS-L2-023はhandoff、HARNESS-L2-050はlayer-ledger refactor、HELIXLABO-L2-061は比較oracle integrity、HELIXLABO-L2-062はresearch claimのsource-span照合を扱う。HELIXOS-L2-021は選択済みHARNESS構成の配布/更新/復旧に限定。 | FR-L1-25/26/27の近接点はあるが、それぞれmetric/performance evidence、候補接続、要求根拠/引継ぎ、比較oracle、research source evidence、ledger構成、限定的配布更新に留まり、Add-feature output、Design Refactor普遍oracle、全retrofit workflow、Research memo/ADR契約を閉じない。全57/11 identityを比較し、該当pairのexact revision/digestは決定記録とJSON scopeに固定。 |

## PR base時点のcandidate context

比較用のPR base (`c6418a5602a056d3503e578a0a8c92df15a6daeb`) には次の関連記述がある。これらは条件の所在や残差を明確にする文脈であり、固定targetを更新したり旧source atomの状態を変えたりしない。

- HARNESS-L2-042 (`product-requirements.md:970-980`) はPR base当時candidate metadataを持っていたが、上記PO decisionでexact L2/L11 pairが採択された。FR-L1-25のDesign Refactor判定・episode分離と、FR-L1-24のRefactorへの機能追加混載禁止に関係する。全Add-featureの移管証拠とはしない。
- HELIXOS-L2-036 (`governance-requirements.md:1033-1063`) は同じPO decisionで対L11と採択済み。Retrofit upgradeのpreflight ticket/plan順序を固定するが、技術oracleやoperation authorityを作らず、FR-L1-26のmatrix、全段階config移行、rollback/回帰条件を閉じない。
- HELIXOS-L2-010のHXT-TYPE-18/17 (`governance-requirements.md:595,594`) はそれぞれAdd-featureとResearchの種類を定義する固定要求。HELIXOS-L2-023 (`:722-730`) はPO decisionで採用された管理から検収へのhandoff候補であり、旧出力一式の形式や判断権限を補わない。
- `github-upstream-operating-model.md:93-97` は4 workflowを`preserved_pending_rehome`として記載し、旧層番号からcanonical L1-L12への写像が未決定である旨をRefactor/Retrofitについて保持する。

全量監査 `legacy-confirmed175-full-audit-2026-09-28.json` では、この4 identityは `audited_non_residual_records` に属し、`known_residual_identities` には含まれない。これは母集団分類であり、各行のsemantic audit classificationは部分再導出である。後発採択pairが一部の条件を具体化した範囲を上記のとおり反映しつつ、FR-L1-24〜27はいずれも残差あり・successor未割当のままとする。

## 旧consumer/source確認

旧business requirements `:120-123`（SHA-256 `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`）、旧L4 function design `:160-166,227-228,246-252`（SHA-256 `64874fd460f00d97cf195fd6c997164a09c333982a2fbc0f29af7e8877cafe35`）、旧L3 acceptance test design `:118-132`（SHA-256 `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1`）を読取参照した。これらは旧PLAN名、G7/axis-11、matrix/config、ADR出力と具体的な正常/異常条件のconsumerを示す。旧CLI・runtime・test・CIは実行しておらず、旧条件を新世代の合格基準として実行していない。

監査JSON: [個票](legacy-confirmed175-fr-l1-24-25-26-27-fixed-l2l11-audit-2026-09-30.json)。
