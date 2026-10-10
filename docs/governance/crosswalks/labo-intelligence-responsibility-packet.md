# LABO／INTELLIGENCE責務分離の判断packet

status: research_closure_candidate / authority_effect: none

対象はIssue #2089の9項目の調査である。機構追加自体は9/28の固定PO判断にあるが、旧要求の意味をすべて移管した証拠とは別である。今後はこの同じファイルを更新し、過去の比較証拠を改変しない。先行比較節のpartial・未成立は当時の証明範囲を表す。現在の調査close判定は冒頭の9条件表と末尾の独立review対応で読み、正式移管の未成立は後続作業へ保持する。

基準commit: `566f834ac58064c2c5ce44c8b8a178f28199cfad`。[現行参照の照合JSON](../audits/requirements-stage/labo-document-reference-comparison-2026-10-10.json)が27文書・231行の原文/行hash/文書hash/文書単位責務を固定する。検索の対象は#2870の明示ID参照母集団であり、実動作consumerや全同義語の閉包ではない。分類台帳の2参照行だけが先行inventoryから変わっており、#2871の既存decision追随として記録する。他229参照行は同一bytesである。

## 調査資料の対応と残作業

| 条件 | 判断に使える資料 | 残作業 |
|---|---|---|
| C01 inventory | 33旧入力、147file/856行の旧24 ID明示参照。D01〜09・関連13 sibling・docsの参照も固定 | 追加consumerの意味比較未計上はLABO-FUP-02/#1861へ保持 |
| C02 atom比較 | 33入力/35field/130predicate、115意味文脈＋46書式区間。独立reviewで調査資料成立 | 正式最小atom/現契約全量移管はLABO-FUP-01/#1861 |
| C03 data所有 | 14objectのowner/purpose/authority/version。調査資料成立 | retention/取消後処置unknownはLABO-FUP-03/#1861 |
| C04 双方停止等 | 14case、LABOSTOP/OSSTOP/RESTARTの不足を保持。調査資料成立 | durability/overflow/revoke等はLABO-FUP-04/#1861 |
| C05 authority/write/adoption | 27文書231行、14objectと未採択Web境界。調査資料成立 | 個別consumer/接続の未判断はLABO-FUP-02/06/#1861 |
| C06 data利用禁止条件 | CLASS/HOLDOUT/TENANT/CANCEL/CRED。区分≠training許可。調査資料成立 | 利用目的・同意・取消等はLABO-FUP-06/#1861 |
| C07 物理分離判断 | repo×host4案/5観点、既定選択なし。調査資料成立 | 容量/停止影響/費用と配置選択はLABO-FUP-05/#1861 |
| C08 無損失coverage | 原文全文/区間保全、明示consumer母集団と130predicate全件の引継ぎ固定 | 未判断を9群で#1861へ保持。formal successor成立とは別 |
| C09 revision付きpacket | 本ファイル＋固定JSON/hash集合。PRのexact base/content HEADに独立reviewを束縛 | F1/F2の修正を確認して#2089調査closeを判定 |

## 現行文書の参照が担う役割

文書単位の比較であり、各行のすべての義務を正式atom化した表ではない。原文はJSONに保持した。各文書の既存decisionや候補状態は別に読み、ここから採否を生成しない。

| 文書 | 比較する責務 | failure・authorityの境界 |
|---|---|---|
| [FT-OS-REQCLASS-001.md](../feature-tickets/FT-OS-REQCLASS-001.md) | 原eventへの分類候補と履歴。OSが要求意味を決めない。 | 分類/再分類で原eventや未完義務を失わず、parent ID列挙を要求採択・全被覆としない。 |
| [helix-structure-requirement-coverage.md](../helix-structure-requirement-coverage.md) | 旧表の分類と012/013の旧OS集中配置を示す履歴比較。 | 旧引用を現行ownerとして使わず、005登録/評価分離・007原証拠・012/013候補本文を別に読む。 |
| [FT-OS-DESIGNTPL-001.md](../feature-tickets/FT-OS-DESIGNTPL-001.md) | 案件template適用・義務・Backflowと改善の因果記録。汎用意味ownerとは別。 | 適用成功で要求合意/設計完成とせず、改善登録OS・評価LABO・知識BRAINの境目を保持。 |
| [scaffold-binding-requirements.md](../candidates/scaffold-binding-requirements.md) | 仮組みのbindingを上流と007証拠へ接続する候補。 | 仮検証を正式要求採択とせず、固定packet参照のL2/L11本文を改変しない。 |
| [FT-OS-REVIEWHANDOFF-001.md](../feature-tickets/FT-OS-REVIEWHANDOFF-001.md) | GUIの依頼/所見配送候補。007の証拠記録へ接続。 | 通知/ACKと独立review/merge admissionを区別。候補親への参照で実装許可を生成しない。 |
| [helix-os-organization-intake-2026-09-14.md](../candidates/helix-os-organization-intake-2026-09-14.md) | Patch Bot、ticket、typed通信・冪等回復のOS編成入力。 | 限定修復を独立authorityとせず、再送/部分失敗を成功へ丸めない。 |
| [FT-OS-REQGUARD-001.md](../feature-tickets/FT-OS-REQGUARD-001.md) | 登録writer、read-only探索、admission検証を分離する作業候補。 | 未登録/参照切れ/projection driftを検出し、GitHub状態から要求を推定しない。 |
| [FT-OS-REQREG-001.md](../feature-tickets/FT-OS-REQREG-001.md) | 意味未分類の利用者指示/原eventを保全するOS入口。 | OSが意味解釈・採否を代行せず、未分類をdropしない。 |
| [FT-OS-GITHUBSYNC-001.md](../feature-tickets/FT-OS-GITHUBSYNC-001.md) | repo-owned上流からGitHub作業/証拠projectionを再生成。 | remoteのopen/closed/mergedから要求採否や受入を生成しない。 |
| [FT-OS-TICKETISSUER-001.md](../feature-tickets/FT-OS-TICKETISSUER-001.md) | HARNESS規則と管理入力から推進がticket/workflowを導出する候補。 | 生成ticketを採択済改善や操作許可とせず、検収独立性・既存許可/予算/期限を保持。 |
| [helix-os-foundation-directive-2026-09-14.md](../intake/helix-os-foundation-directive-2026-09-14.md) | OS foundation整理の利用者指示と既存IDへの入口。 | 指示のID範囲参照だけで全要求を具体化/採択済みにしない。 |
| [management-provisional-requirement-register.jsonl](../management-provisional-requirement-register.jsonl) | 122/123/047の仮登録内に005/007等がsource・依存として現れる。 | supersedes系列を保持。registered_proposal/authority_effect noneから依存先の採否・実装許可を生成しない。 |
| [concept-requirement-po-decision-packet.md](../crosswalks/concept-requirement-po-decision-packet.md) | 旧revisionの005/007/012/013原文と再配置選択肢を保全。 | 旧draft表示/提案選択肢を現行PO判断と混同せず、旧candidateの全量採否を推定しない。 |
| [legacy-concept-derived-requirements.md](../crosswalks/legacy-concept-derived-requirements.md) | HCV4のtrace・証拠・独立review・改善循環の分割候補。 | split_pending_approvalをformal successor被覆済みへ変換しない。 |
| [concept-mechanism-version-requirement-crosswalk.jsonl](../crosswalks/concept-mechanism-version-requirement-crosswalk.jsonl) | 旧原文/IR acceptanceと機構候補を保全する再配置表。 | source_authority_stateとtarget採用を分離。同名ID/複数候補ownerだけで合成被覆を成立させない。 |
| [concept-mechanism-version-requirement-crosswalk.md](../crosswalks/concept-mechanism-version-requirement-crosswalk.md) | 候補JSONLの読替え・旧配置・版境界の説明。 | 9/25のLABO L1不在・未採択説明は当時の状態。現在は9/28 decisionと候補固有の未決を別に読む。 |
| [audit-bounded-repair-requirements.md](../../helix-intelligence/candidates/audit-bounded-repair-requirements.md) | 旧OSの005/007等に接続していた検出/限定修復をINT側へ保持。 | 候補、意味判断、許可、隔離適用、検収、停止/復旧を分け、Bot候補をOSの承認権限にしない。 |
| [labo-acceptance.md](../../helix-labo/L11-acceptance/labo-acceptance.md) | 012内部優先/秘密送信禁止、013欠落/原因仮説/是正/再観測の候補受入を保持。 | closed/mergedだけの解決認定、未着手/観測停止を正常とする反例を拒否する記述。文書の存在を実行passにしない。 |
| [improvement-research-requirements.md](../../helix-labo/candidates/improvement-research-requirements.md) | 005評価/研究部分と012技術調査、013横断診断の元ID/具体条件を保持。 | 登録/振分けはOS、工程内Research ticketは除外。秘密送信/取得命令実行/事実と仮説混同/管理自身の除外を拒否する候補。 |
| [labo-intent.md](../../helix-labo/L1-planning/labo-intent.md) | 005/012/013からLABO価値への対応。終わった仕事の振り返りを位置づける。 | L1対応をsource原条件の全移管や実行時診断の全代替としない。 |
| [labo-requirements.md](../../helix-labo/L2-requirements/labo-requirements.md) | 効果/退行/FeedbackはLABO、登録/routing/ticketはOS。元012/013条件をcandidateとして保全。 | Attempt/repair/retryを別指標にし、source不完全を0へ補完しない。本文の既存候補への対応表で候補stateを変えない。 |
| [design-template-system-requirements.md](../../helix-brain/candidates/design-template-system-requirements.md) | OS改善登録・LABO評価・BRAINへのパーツ追加の責務候補。 | template知識の意味ownerと案件記録を混同せず、評価receiptだけで知識promotion/採否を生成しない。 |
| [governance-acceptance.md](../../helix-os/L11-acceptance/governance-acceptance.md) | 007原証拠の欠落/重複/stale、005登録/評価分離と関連OS候補のnegative条件。 | 各見出しの対象scopeを保持。callback/receipt/fixtureの存在を実検証passや未採択候補採用としない。 |
| [wbs-ledger-requirements.md](../../helix-os/candidates/wbs-ledger-requirements.md) | 仕事因果/診断と012の外部分解事例をWBS候補へ接続。 | 出典/版/license/成熟度と採否を分け、取得観測をauthorityへ昇格しない。 |
| [system-intent.md](../../helix-os/L1-planning/system-intent.md) | OS005登録/振分けと原証拠007、012/013のLABO案内。 | 後のdecisionを参照し、固定本文の旧候補表示を現在未採用の証拠とせず、案内だけで保持候補全文を承認しない。 |
| [governance-requirements.md](../../helix-os/L2-requirements/governance-requirements.md) | 005登録/routingと007原証拠がOSの観測・監査・候補登録・依存へ使われる。012/013はLABO案内。 | provenance/authority/欠測/stale・再送・未完義務をscopeごとに保持。個別接続の成立から双方停止/全consumer保証を生成しない。 |
| [current-l2-structure-classification.jsonl](../current-l2-structure-classification.jsonl) | 主L2/対L11限定の既存PO判断追随表示と012/013の暫定分類。 | 2871で20件の主表表示を訂正。分類語彙/provisionalは不変。承認scopeを同ID後続追補や旧source全被覆へ広げない。 |

## 既決と未判断を分ける

LABOの1.0独立評価、OSの登録・振分けと運転、BRAINの汎用知識、INTELLIGENCEの1.0判断支援と3.0学習は、現行Conceptと対象decisionの範囲で読む。#2089の9/24本文「INTELLIGENCEは3.0から」と旧対応表の「LABO L1がない」は当時の説明であり、現在の1.0支援や9/28固定L1を否定する根拠にはしない。旧本文・原snapshotを保持する。

OS012/013の案内行、LABO001〜053の採択と、LABO candidateに残る元012/013の具体条件は同じ採択単位ではない。candidateの具体条件・failureを保持し、全量採否や親付け替えを対応表の存在だけで成立させない。原ログ、継続memory、評価dataset、汎用知識、モデル候補は別objectであり、同じ保存先へ置く案でも単一混在writerにはしないという既存境界を比較する。

残る判断材料は、元条件と現契約の差、双方停止/取消の不足、retention/派生物、Web未採択範囲、正式atomごとの無損失対応である。ここでは新たな要求・承認手順・保存期間・物理構成を採択しない。機構追加のA/Bを再質問するのではなく、既決の範囲と未判断の条件を同じpacketから識別できるようにする。

## 旧source・failure・consumer

旧pillar HBR-P4/P7/P8/P9（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md:54–58`）の自動保守、責務別継続情報、外部探索、成果の台帳収束を起点とする。P4の自動修復/promotion欠落、P7のbounded recall検証未完、P8の探索/trust境界の未定義、P9の関係/収束enforcement不足を消さない。比較の処理は意味再導出であり、旧DB/CLI/runtimeを移植・実行しない。

原source・判断史・consumerと反例の個別path/行/hashは各先行比較JSONに残り、今回JSONがその本文hashを固定する。33旧inputのidentity・primary/secondary区分と保持義務は不変。未割当/未判断を消込せず、formal successor・全旧source閉包の成立を主張しない。

#2089は独立reviewによる調査close判定待ち。#1861は後続の未判断作業としてOPENを保持する。要求ステージ完了、L3再開・実装・配備の許可は本packetから成立しない。

## 33入力のpredicate別比較と共有受入辺

[比較JSON](../audits/requirements-stage/labo-thirty-three-source-predicate-comparison-2026-10-10.json)は、基準commit `1c8d5ef087e457b4791e8b71cf7cba22d1e01dba`で33名指しinputから130件の主文/禁止/数量predicateを選び、原文のexact spanと検討用反例へ結び付ける。単なる文末分割ではなく、原記録・評価・提案・採否・供給・復旧の観測可能な条件を分けた比較候補である。正式最小atomの全量成立は未証明であり、列挙群/未分類原文を保持する。反例は採択済L11の新設ではない。

| 原入力 | 比較predicate数 | 残る粒度/被覆 |
|---|---:|---|
| `harness/L1-requirements/business-requirements.md::BR-21` | 6 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/business-requirements.md::D-01` | 2 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/business-requirements.md::D-02` | 2 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/business-requirements.md::D-03` | 2 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/business-requirements.md::D-04` | 2 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/business-requirements.md::D-05` | 2 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/business-requirements.md::D-06` | 2 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/business-requirements.md::D-07` | 2 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/business-requirements.md::D-08` | 2 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/business-requirements.md::D-09` | 2 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-19` | 12 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-20` | 4 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-34` | 2 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-36` | 7 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `helix/L1-requirements/pillar-requirements.md::HBR-P4` | 4 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `helix/L1-requirements/skill-mechanism-migration-requests.md::S-BR-001` | 5 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/business-requirements.md::BR-22` | 3 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-38` | 7 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-43` | 4 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-47` | 3 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `harness/L1-requirements/screen-requirements.md::HM-08` | 3 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `helix/L1-requirements/pillar-requirements.md::HBR-P7` | 6 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `helix/L1-requirements/pillar-requirements.md::HBR-P8` | 4 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `HIL-BR-03` | 3 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `HIL-BR-11` | 3 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `HIL-BR-29` | 3 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `HIL-FR-10` | 4 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `HIL-FR-14` | 4 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `HIL-FR-57` | 4 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `HIL-FR-58` | 6 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `HIL-NFR-34` | 4 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `HIL-BR-23` | 3 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |
| `HIL-FR-44` | 8 | 未分類contextと全consumer/failure対応を保持。移管/採用/完了未主張 |

10名指しIRの共有HR07/17/21、HAC各a/b/c、HAT各1件の15recordを全文保持した。共有contractは別の13 sibling要求を含むため、そのedgeを保全し、33入力の分母へ加算しない。HST/HOT supporting行と13 sibling本文は、以下の共有consumer比較で追加確認した。実装まで含む全consumer対応は未完である。

HR07はraw/secret混載・self-promotion・fixture/効果/rollback欠落を拒否する旧条件。HR17は原文消失・aggregate/TBD/偽N/A・typed edge/変更receipt/stale伝播欠落を保持。HR21は未許可tool・過剰agent・自己検証・catalog変更によるstaleを保持する。3HATの旧statusは`designed_not_implemented`であり、受入定義の存在を実行passにしない。

C02/C08の比較をpredicateへ細分したが、未分類原文や共有辺が残るため完了へ変更しない。候補間の範囲/例外と個別現契約の対応、最小粒度、旧consumer/failureの被覆を独立review後も継続する。

## 共有consumerと未分類原文の追加比較

[固定比較JSON](../audits/requirements-stage/labo-shared-oracle-consumer-comparison-2026-10-10.json)は13 sibling原record、7旧test-design source全文、共有HST/HOT行、90 primary caseのL5/L6 tupleを保全する。33名指しinputの分母と、関連13要求の範囲を分ける。原文・failure・現契約との比較であり、旧実装の移植や正式successor採択ではない。

| 共有範囲 | 追加要求 | 責務・失敗条件の比較 |
|---|---|---|
| HR17 | BR22/24、FR41/42/43/45、NFR26/27/28（各HIL prefix） | 汎用template意味はBRAIN、製品適用・義務はCORE/HARNESS、案件原記録はOSへ比較。aggregate/TBD/偽N/A、原文消失、source/authority/oracle/typed edge/変更receipt/stale欠落をLABOの評価だけで解消しない。 |
| HR21 | HIL-BR-30、HIL-FR-59/60 | runtime中立agent生成の全入力/出力と、専門化の測定可能な利益、単純taskの既存role経路、権限・budget・lease/fence/retireを保持。LABOの測定、INTの案、OSの指定と生成契約を分ける。 |
| HR07 | HIL-NFR-02 | worker/verifier/knowledge promoterの独立性を保持。旧Codex固定役割・provider/model分離と現行identity/context/authority/routeの差を未解決として残す。 |

HST015/016/027/028/029、HOT52/53の設計行を確認した。旧physical L1のHOTは旧canonical L2↔L11であり、現行L12とみなさない。L5/L6にはHR07の15 caseとHR17の75 caseがあり、各caseのpre_state・expected_state・canonical failureが一致する。`assertion_pass`を伴うfailureも原tupleのまま保持し、負例検出のassertionを業務成功や実行passに変えない。旧statusの未実装を保持する。

MLPのsupporting transaction（IT016/017・U023〜027）、RTOのscenario/API/manifest条件は7source全文へ保持し、90 primaryの分母へ加算しない。raw/progress/secret混載禁止、同operationの再送・部分失敗、shadow/effect/rollback欠落、原文custody/権限のtransaction currentnessを残す。文書間のjoin一致は実装consumer全量の証明ではない。

元161未分類intervalを再照合した。空白・句読点・Markdown区切りのみのintervalに限って書式と分類し、原文を削らない。語・数値・actor・operator・接続先を含む可能性のある残部は未解決のまま残す。BR21の履歴/三評価入力、FR19のrecipe/event store、FR38のmodel/config/30日条件、P7の意味正本と継続記録、IRの禁止actor等を見出しやmetadataとして捨てない。

C02/C08は共有辺の比較が進んだが、正式最小atom・全consumer/failure対応と未分類原文は残る。C01/C02/C08/C09を完了へ変更しない。#2089/#1861はOPENであり、本比較は新たな人間判断・L11追加・Issue close・L3再開を生成しない。

## 115保留区間を原文の文脈へ戻す比較

[固定比較JSON](../audits/requirements-stage/labo-residual-context-comparison-2026-10-10.json)は、#2874で意味/contextを含む可能性を残した115区間を原fieldと同fieldの130predicateへ結び直す。区間ごとにactor/operator/合成の接続、label/scope/参照、入力・出力・条件・履歴の3区分へ比較した。46書式区間を含む元161区間と130predicateを保全し、全fieldの文字欠落・重複0を確認する。区間数を要求数や最小atom数にしない。

主語と否定を切り離さない。旧BR03のClaude/Codex完了時trigger、BR29の「shadow評価と独立reviewを経るまで強制昇格しない」、NFR34のpackと専門agentの両actor、FR44のtranslator自身の即時強制禁止等を原fieldへ戻した。旧のprovider固定条件は現行の独立性へ自動継承せず、差を保持する。

label/priority/source参照も原recordの文脈である。BR21の旧PO判断とL3/L7状態・三評価入力、FR19のpattern_key/event store/audit/escalation、FR38のrun/model/config/time/opt-in、P7の意味正本と継続DB・Glossary/bounded recall未完は、比較対象から捨てない。旧path・数値・状態は来歴であり、現在の実装・採否・成功を表さない。

115区間の文脈比較は成立したが、正式最小atomと現契約ごとの全量被覆は別である。各責務の比較結果は原入力ごとにJSONへ記録し、分類候補のない見出しはunresolvedを保持する。原文対応は調査資料として独立reviewで成立した。全consumerの意味移管・未採用candidate・版の判断は#1861へ残す。#2089の調査closeは下の修正を含むexact revisionで判定する。


## 独立調査reviewの2指摘への対応と後続Issue

[独立調査review](https://github.com/RetryYN/HELIX-HARNESS/issues/2089#issuecomment-6092295547)はC02〜C07を調査資料として成立とし、F1（consumer参照母集団）とF2（未判断の追跡先）をMajorとして残した。[今回の固定JSON](../audits/requirements-stage/labo-legacy-consumer-followup-closure-2026-10-10.json)がこの2点を補う。

固定base `9d864e96e384d993e3196b97a6a7c27c2f070f76`のarchive 4,020 tracked fileとdocsを読み、旧24 IDの147file/856行、D01〜09の曖昧な短ID、共有13 siblingを別集合で保存する。各file/行のSHA-256、exact match span、consumer候補／来歴／監査のpath分類を固定する。先行27文書/231行は現行OS4 IDの別母集団であり、旧33 IDの全参照へ読み替えない。

IDからpredicateへのjoinは比較候補であり、consumerの条件・failure・画面・data構造の意味比較は未計上と明記する。HM08のsample-size warning/ranking非表示、PhaseBのeventual集計、append-only AIcallと継続状態、ADR004の二層境界はsource行と比較注記を保持し、旧数値・DB・Bun・実装statusを現行採択へ変えない。

[後続作業の固定comment](https://github.com/RetryYN/HELIX-HARNESS/issues/1861#issuecomment-6092332541)と今回JSONが9群の主追跡先を#1861、親を#1813へ結ぶ。130predicate全件（split27/unresolved27を含む）、115文脈区間、35原fieldをLABO-FUP-01へ保持し、consumer未比較は02、保存/取消は03、停止/復旧は04、物理構成は05、利用境界は06、旧provider/role差は07、13 siblingは08、旧技術/数値/status差は09へ渡す。関連IssueはcommentとJSONの表に固定する。

これらの調査closeは未判断を解決済みにすることではない。全旧sourceの正式移管やL3以下の完成を調査終了の追加gateにせず、原文とunknownを後続Issueへ残す。修正後exact base/content HEADの独立reviewでF1/F2解消と9条件を確認したときに#2089の調査closeを判定する。
