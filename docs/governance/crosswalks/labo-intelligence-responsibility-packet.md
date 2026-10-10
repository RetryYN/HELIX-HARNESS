# LABO／INTELLIGENCE責務分離の判断packet

status: research_partial / authority_effect: none

対象はIssue #2089の9項目の調査である。機構追加自体は9/28の固定PO判断にあるが、旧要求の意味をすべて移管した証拠とは別である。今後はこの同じファイルを更新し、過去の比較証拠を改変しない。

基準commit: `566f834ac58064c2c5ce44c8b8a178f28199cfad`。[現行参照の照合JSON](../audits/requirements-stage/labo-document-reference-comparison-2026-10-10.json)が27文書・231行の原文/行hash/文書hash/文書単位責務を固定する。検索の対象は#2870の明示ID参照母集団であり、実動作consumerや全同義語の閉包ではない。分類台帳の2参照行だけが先行inventoryから変わっており、#2871の既存decision追随として記録する。他229参照行は同一bytesである。

## 調査資料の対応と残作業

| 条件 | 判断に使える資料 | 残作業 |
|---|---|---|
| C01 inventory | [33旧入力と40機構対応/31旧path](../audits/requirements-stage/labo-intelligence-2089-preclose-inventory-2026-10-10.md)、今回27文書231行 | 補足source/consumerの辺と未計上の確認。明示参照検索を全consumer閉包にしない |
| C02 atom比較 | [FR19](../audits/requirements-stage/learning-engine-fr19-responsibility-comparison-2026-10-10.md)、[観測4入力](../audits/requirements-stage/observation-evaluation-four-input-comparison-2026-10-10.md)、[KPI9入力](../audits/requirements-stage/nine-kpi-responsibility-comparison-2026-10-10.md)、[残19入力](../audits/requirements-stage/remaining-nineteen-input-comparison-2026-10-10.md)、[OS4要求](../audits/requirements-stage/os-labo-four-requirement-comparison-2026-10-10.md) | 33入力の全文とliteral/sentence区間は保全済み。複数actor/義務を正式最小atomとその対象責務へ分解し、例外/数値/failure対応を確認する |
| C03 data所有 | [14object表](../audits/requirements-stage/labo-data-ownership-stop-topology-comparison-2026-10-10.md) | 全関連objectの補足辺と原記録/派生物ごとのretention・取消後処置をsourceへ対応づける |
| C04 双方停止等 | [14正常/反例/停止候補](../audits/requirements-stage/labo-data-ownership-stop-topology-comparison-2026-10-10.md) | LABOSTOP/OSSTOPの送信待ち保全・許可有効性・overflow・再接続reconcileの不足を判断可能な候補へ明示する。調査完了にruntime実行を要求しないが、文書比較をpassにもしない |
| C05 authority/write/adoption | 下の27文書比較と14object表 | 全atomと送受信sourceへ境界を結ぶ。WebのVision条件を本体採択へ変換しない |
| C06 data利用禁止条件 | 14object/CLASS/HOLDOUT/TENANT/CANCEL比較 | 全tenant/export/retention/派生物取消の未対応をsourceへ結ぶ。区分記録とtraining許可を分ける |
| C07 物理分離判断 | [repo/hostの4案と5観点](../audits/requirements-stage/labo-data-ownership-stop-topology-comparison-2026-10-10.md) | 観点は比較材料として保持。具体配置は未選択、現場の容量/停止影響/費用は未確認 |
| C08 無損失coverage | 33input全文保全、旧source/failure比較と今回231参照行 | 正式atomごとのidentity/failure/consumer/未解決対応を検証する。原record存在をformal successor全被覆にしない |
| C09 revision付きpacket | 本ファイルと固定JSON、先行比較のhash集合 | C01/C02/C08等がpartialのままなので全判断packet完成ではない。内容が揃ったexact revisionを独立reviewしてから調査closeを判定する |

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

#2089/#1861はOPEN。全9項目の調査完了、要求ステージ完了、L3再開・実装・配備の許可は本packetから成立しない。
