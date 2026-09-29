# HIL-FR-09 六分類の意味再導出候補と未決点

## 対象と状態

本記録は、旧HIL-FR-09の六分類に関する限られた意味再導出候補と、POが持つ未決意味を記録する。対象はPR findingの要求意味であり、ユーザー指示の取消・差替権限を移すものではない。候補は未採択、formal successor未割当、実装・運転未実施である。旧FR-09の一行、IR、要求対応、Issue #290または下流pairのauthority状態は変更しない。

旧sourceは`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`の`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:99`（SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）。当行はDB relation/coverage/contract/impact viewとPR差分の照合、Claude監査器というactor表記、六つの型付きdisposition、current/successorの区別軸、non-actionable findingの非終端・独立review・appeal、audit finding／affected layer／typed receiptを記す。

旧IR `requirements-ir/requirements.json#/HIL-FR-09` は`HR-FR-HIL-03`、`HAC-HIL-03a/b/c`、`HAT-HIL-03`を参照し、`DOWNSTREAM-HIL-FR-09` は`pending_pair_descent`、route issueなしである。system contract `HR-FR-HIL-03`はPR delivery/job生成、current/successorの一括処理と後続昇格を追加する。これらはsource contextであり、本候補はcontract全体を再導出せずformal successorも割り当てない。

## 責務候補

- **HARNESS-L2-058／L11-058**：六つの型名と、current contract影響・責務境界で`current_pr_fix`／`successor_issue`を区別する軸を要求意味として保持する。旧HIL-BR-17（同旧文書:69）とHIL-FR-30（同:120）は関連する旧設計根拠だが、そのrouting・promotion pipeline全体をこの候補に含めない。
- **HELIXOS-L2-101／L11-101**：finding、根拠、affected layer、型付きnonterminal receipt、independent review、appeal参照を管理する候補。既存OS-L2-034の原記録・処分証拠・異議履歴との責務境界を保ち、directive固有PO権限をfindingへ移さない。
- **ID選択**：起票元main `26e547515d620bb53036c2f085cfc3f0293888d4`でHELIXOS-L2-056は歴史的mappingに使われ、歴史的な`ticket-id-connection-audit-2026-09-25.md:115`がDECIDE ticketの非採用routeへ割り当て、監査のID範囲は100までを含む。既存監査を変更せず、重複identityを避けて101を使う。HELIXOS-L2-101は同mainのL2/L11本文・MPRで未使用。HARNESS-L2-058も同mainで未使用。

## 旧sourceで確定している分類条件と残る判断

旧L5 `github-pr-audit-promotion.md` §3（68–70行）、旧L4 `infinity-loop-platform-basic-design.md` §4.2（277–280行）、旧HIL-NFR-21（201行）を読み直した。旧FR-09のnon-actionableは`duplicate`／`false_positive`／`accepted_risk`／`telemetry`の4分類である。`duplicate`には生存targetとacceptance oracle包含証拠、`false_positive`には別verifierの反証と独立review、`accepted_risk`には独立reviewと受容actionに結び付いたPO receipt、`telemetry`には観測ownerとexpiryを要する。証拠不足は`disposition_pending`に残し、元finding・appeal/reopen routeを保持する。旧sourceに書かれた証拠条件自体は確定している。ただし`accepted_risk`のPO条件を、歴史的なOS034-002候補の意味から変えてOS034-003へ適用するかは別の上流意味判断であり、exact revision付きPO判断が未了である。directiveのcancel／supersede権限はfindingへ一般化しない。

| 残る判断 | 該当旧source | 選択肢と推奨 | 影響する要求 |
|---|---|---|---|
| current/successorの詳細境界へ旧HIL-BR-17／FR-30をどこまで取り込むか | 旧FR-09:99、BR-17:69、FR-30:120 | A: 旧99行のcurrent contract影響・責務境界だけを本候補に残し、追加routing/promotionは別要求へ保持（推奨）。B: BR-17／FR-30の詳細まで本候補へ含め、source atomと受入を拡張する。 | HARNESS-L2/L11-058、HELIXOS-L2/L11-101、旧HR-FR-HIL-03 |
| 旧Claude/Codex identity比較の現行Worker独立性への対応 | 旧L5 §2、2026-09-26 PO Worker判断 | A: 既存PO判断のreviewer identity/context/authority/routeを適用し、provider名は固定しない（推奨）。B: provider family同一なら常に不成立とする旧条件を保持し、現行判断との意味差をPOへ戻す。 | HELIXOS-L2/L11-101、既存Worker契約 |
| telemetryのexpiryと観測ownerの現行参照先 | 旧L5 §3:70 | A: 既存の観測owner・期限契約が確認できるscopeだけで確定し、不明ならpending（推奨）。B: 新しい期限とowner契約を別候補として起こす。 | HARNESS-L2/L11-058、HELIXOS-L2/L11-101、LABO観測境界 |
| accepted_riskにPO receiptを求める意味と、OS034の承認済み履歴との差分 | 旧L5 `github-pr-audit-promotion.md` §3:69（`LEGACY-ASSET-1BE290A45D9095E0F803`）、旧L4 `infinity-loop-platform-basic-design.md` §4.2:279（`LEGACY-ASSET-C35E93F2D36777CD7462`）、旧HIL-NFR-21:201（`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`） | **旧source**：findingの`accepted_risk`にaction-binding PO receiptを要求し、HIL-NFR-21は独立reviewも要求する。**保持**：directiveのcancel／supersedeに対するPO専属権限をfindingへ一般化しない。旧条件はfindingの`accepted_risk`に限る。**変更**：OS034-002の歴史的な「findingへPO要件を過剰適用しない」という意味から、OS034-003はfindingの`accepted_risk`にもaction-binding PO receiptを要求する意味へ反転している。**A**: 採択済みOS034-002の意味を保持し、旧FR-09の当該条件を未解決のままholdingへ残す。**B（推奨）**: 旧sourceの条件をOS034-003へ反映する意味変更を選び、HARNESS-L2/L11-058とHELIXOS-L2/L11-101の同じ`accepted_risk`条件へ同一decisionを結ぶ。Bを推奨する理由は旧L5/L4がfindingの`accepted_risk`にもaction-binding PO receiptを明記しており、別verifierの独立reviewだけではその条件を満たさないため。判断前はAの採択済み意味だけが有効で、OS034-003・HARNESS-058・OS101は未採択とする。差分理由は旧sourceが当該条件を明示する一方、OS034-002の歴史的意味がそれを除外しており、旧意味からの自動継承も候補訂正からの自動採択も認められないためである。 | HELIXOS-L2/L11-034・101、HARNESS-L2/L11-058 |

OS034-002の登録・判断履歴は不変の歴史的記録として保持する。今回の訂正行OS034-003は`registered_proposal`かつ未採択であり、-002の採択を継承しない。`accepted_risk`の意味をBへ変える場合、POがOS034-003のexact candidate revision（semantic digest `sha256:6b019294047fce2e1c8b5d1b5e8d379fa9111f5912274f6dca918ffd81c0e1e8`）を判断する必要がある。revisionが固定されていない判断、OS034-002に対する判断、またはこの監査・MPR訂正行の存在だけでは充足しない。PO判断が記録されるまで、HARNESS-L2/L11-058とHELIXOS-L2/L11-101は同じaccepted_risk条件について独立に採択・確定せず、証拠不足時の`disposition_pending`を保持する。詳細は[coverage receipt r3](hil-fr09-disposition-coverage-receipt-2026-09-29-r3.json)に結ぶ。

選択肢は検討材料であり、この記録によってPOの選択や候補採択を生成しない。上の旧sourceに明記された4分類の証拠条件そのものは問い直さない。OS034-002からOS034-003への意味変更とその対象revisionへの適用だけが未決であり、r3 coverage receiptと仮登録で同じdecision dependencyをHARNESS-058／OS101へつなぐ。

## 被覆と保留

旧原文の`Claude監査器は`はatom `FR09-ACTOR-CLAUDE-AUDITOR-L0099`として保持した。既存PO判断`worker-execution-model-po-decisions-2026-09-26.md`（SHA-256 `1c93bf0aadccfdf6b536a32d3923a17fbd00a1fd830850f9369b5b6d6b12efb2`）に従い、provider固定を、作成側からreviewer identity・context・authority・routeを分ける役割境界へ再導出する。HARNESSはfinding分類意味、OSはWorker/lane assignmentとevidenceの所有者である。

`hil-fr09-disposition-source-atoms-2026-09-29.jsonl`は旧line 99の明示内容だけを16個の非重複atomへ分ける。coverage receiptの`no_loss`はその一行の明示意味と、actorの既存PO判断によるprovider固定解除の計上完全性を指し、六分類の未定義条件、権限、候補採択、IR全文、HR-FR-HIL-03全体または旧assertion/HOT全体の被覆を意味しない。未決点はこの記録と生存中の`MPR-SH-DIRECTIVE-DISPOSITION-002`に保持し、IRの`HIL-FR-09`は`MPR-SH-IR-003`でpendingのままとする。

旧assertion `HST-CASE-005-05`（`infinity-loop-system-assertion-cases.md:367`）は証拠付きnonterminal receiptとappeal routeを記す。旧`HOT-HIL-29`（同operational test design:56）はcurrent/successorの動作対、`HOT-HIL-36`（同:63）はdirective/findingの混在を含む。これらは旧設計資料であり、実行・合格証拠ではない。HARNESS/OS候補のacceptance節は未実行である。
