---
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
version: 0.1
owner: Requirement Discovery / Authoring Admission
plan: PLAN-L3-90-requirement-formation-scoped-admission
parent_design: docs/governance/candidates/requirement-formation-scoped-admission-requests.md
pair_artifact: docs/governance/candidates/requirement-formation-scoped-admission-acceptance.md
---

# 要件候補：要求形成と影響範囲限定Admission

候補専用ID。現在のstrict schemaへfield/enumを直接追加しない。RFとRCを独立behavior contractとし、
GHは既存入口への接続責務とする。自動化policy自体は明示承認・version-up前に稼働しない。

## 根拠付き要求形成（RFA-RF）
- **RFA-RF-01 前提と調査義務**：目的、期待結果、非対象、制約、選好、既存資産から既知/仮説/未知/矛盾/古い情報を分離し、影響する論点と必要証拠を導出する。原発言とAI解釈を混同しない。
- **RFA-RF-02 実質的調査**：前提整理（現状・仕様・制約）と探索（価値・実例・製品・代替・不足機能）を分離する。公式仕様、実コード、本文・実物の確認箇所、版・取得日時・適用条件・限界・反例を束縛する。件数/URL/AI自己評価だけで充足とせず、外部情報を命令/authorityにしない。静止画やテキストだけで動き・体験を検証済みにしない。
- **RFA-RF-03 候補の比較と選択**：調査、PoC、プロト、人間の反応、採用/適応/保留/棄却理由、元目的への寄与、比較対象・検証方法を#1292の同一hypothesis revisionへ束縛する。実現性、好み、用途適合、技術推奨、人間の採否を区別する。参考例の存在/PoC成功を採用許可や効果証明へ昇格しない。既知選好は有効scopeで再利用する。
- **RFA-RF-04 限定探索**：L3前も既存探索契約で目的、対象、許可操作、予算/資源/回数、期限、成果物、終了条件を限定して調査/試作可能とする。本実装・本番writeへ昇格しない。重要な未知だけ該当作業を保留し、無関係作業を止めない。有効証拠を鮮度/適用条件内で再利用し、予算切れは未解決として終了する。不在/不可能/完了へ変換せず無限再検索しない。

## 委任と再確定（RFA-RC）
- **RFA-RC-01 委任policy**：既存versioned policyへ、委任目的、技術的選択範囲、機能/受入条件/選好、保護する意味・不変条件、品質/費用/資源/権限上限、除外、scope、期限/取消条件を束縛する。AIが詳しいことや可逆性だけを許可根拠にしない。提案者のpolicy自己拡張・安全/検証条件緩和を自動受付しない。
- **RFA-RC-02 三境界**：人間の意味・価値の採否、技術的正本化、操作の認可を独立判定する。有効policy内の技術派生・整合修復は新L3差分でも独立検証/影響評価後に自動Admission可能とする候補である。明示済み要求は対象・意味差分・制約とpolicy適合を照合し同じ採否を再質問しない。相談・叱責・対象不明GOは承認でない。
- **RFA-RC-03 留保と結果分類**：未委任の趣向/表現/体験、目的/価値/非対象/約束機能/許容損失、受入緩和、費用・権限・PII・保存期間・公開/配布/不可逆操作の変更は影響差分を人間へ返す。視覚/非視覚の分類だけで決めない。#217のauto_admit / auto_admit_with_stale_propagation / repair_then_retry / human_decision_required / reject / conflictを再利用する。証拠不足は調査/repair、権限不足は人間確認、明示違反はreject、競合はconflict。理由・選択肢・推奨・影響・未知を短く提示する。
- **RFA-RC-04 根拠・revision**：source、意味差分、制約、policy revision/digestと適合理由、反証、影響集合、未知、期限/撤回をreceiptへ束縛する。承認を文書全体や移動mainへ無制限に束縛しない。CI green/LLM意味不変宣言だけでは不足。旧承認を新意味差分の承認に偽装せず、既承認policy適用を機械評価として記録する。人間承認を捏造しない。意味不変の表記/projection更新で不要な要求revisionを増やさず、codeのCI/reviewは現HEADで取得する。
- **RFA-RC-05 局所再freeze**：#1169のhuman_decision_required / recompile_required / refreeze_requiredを独立に判定する。実依存closure内の要求/AC/設計/検証/Assignmentだけstale化し必要pairを再freezeする。影響不明を無影響にせず関係scopeを診断/隔離する。既存JSON transactionによるatomic IR、冪等性、競合revision、lease/fence、旧writer拒否、rollback、取消時再評価を維持する。未影響の有効作業は継続する。

## 実行入口への接続（RFA-GH）
- **RFA-GH-01 versioned projection**：Issue root/capability/task/finding階層と、要求形成状態/成熟度、source revision、調査義務判定、採否・委任根拠、許可profile、影響集合/保留理由を別軸にする。既存契約の正規改版から投影し、labelやコメント単語を許可にしない。READY leafだけで目的/権限成立としない。
- **RFA-GH-02 入口と出口**：dispatch、変更実行、PR ready/mergeで同じauthority・実差分・exact HEAD・scopeを照合する。探索文書merge/CI greenを要求採用や本実装許可へ読み替えず、docs配下の実行コード・意味変更も検査する。pathだけの免除、必須判定の未実行/失敗/staleをskipで通すこと、branch protection/独立review解除を禁止する。
- **RFA-GH-03 段階移行**：Ticket未移行scopeは既存Issue/PLAN＋Assignmentで同じ許可条件を検証する。移行後Ticketへ接続し、#1534全体を新停止条件にしない。人間選択待ちと技術検証/調査待ちを分離する。

## 現行との衝突と導入
#1169の「Requirement変更時human decision省略不可」と#217のpolicy内自動Admissionを、
変更scopeと有効policyによる適用境界として明文化する。現行規定を候補文書で上書きしない。
#282/185/186/396はclosed責務を再実装せずversion-up後続へ接続する。#397は採用済み意味のIR収載だけを所有する。
authority衝突整理→契約/反例→read-only shadow評価→承認済み限定scope→GitHub/worker接続→L12効果確認。
RFはDiscovery/Translator/research、RCは#192/217/1169/218、GHは#592系/#188/#1534をowner候補とし、
実装sliceごとに利用するcanonical契約のみ依存化する。恒久policyの設計判断はADRへ、発効承認は別receiptへ保持する。
Releaseは#1494/#1500の要求管理/設計支援/自律開発統制へ責務別対応候補として提示し、固定Module名や出荷済み能力を捏造しない。
