---
status: draft_candidate
authority_status: approved_pending_canonical_promotion
canonical_layer: L3
canonical_pair: L10
plan: PLAN-L3-92-world-governance
---

# 全体機能統制の要件候補

主ownerは#1500。意味正本・既存責務・優先順の境界と導入契約を含め、入力の9候補IDを保持する。IDを正式採番する際は衝突を検査し対応表を維持する。

## 1. 目的と優先順位
HELIX全体の要求・機能・責務・実装・検証・提供単位を統括し、新要求追加後も所属・影響・権限・完了条件を維持する。HELIX World Governance（HWG）は、既存機構の接続と変更の整合性を統制する。

通常の広域Feature追加・将来の推論知能化より先に最小coreを実用化する。安全・正本破損・データ損失のP0対応は優先する。CI高速化とCursor限定クラウド委譲は、既存の安全条件を維持して並行継続する。

現行#1500の「Epoch exit後にmanagement runtime着手」と今回の優先化を明示的に照合する。着手制限を改版し、観測と新規差分の入口統制を先行、全域強制適用を後段へ分離する。ラベル変更や本書だけで現行制約を迂回しない。

## 2. 正本と既存owner
要求の意味はcanonical Requirement JSON、設計・協調状態・実行履歴は各既存authorityに従う。World Modelは既存authorityから再構築可能なprojectionであり、別正本ではない。コードは実装証拠であり、要求・承認の代替ではない。Worldは本repoと許可済みの配布・consumer境界に限定する。

#1500を主な改版接続先とする。#990は計画と実績の照合、#1036は意味接続graph、#1038は置換lifecycle、#1073/#1074/#1494は提供構成、#1110/#1372はbranch・文書inventoryとして再利用する。要求形成・再確定は#1556/#1169/#397、配車は既存Ticket/Assignment ownerへ戻す。

World Registry／Graph／Policy／Admissionは論理責務であり、独立engine化しない。別DB・別journal・別graph基盤・別scheduler・別承認engineを作らない。#1036等の巨大な親完了待ちで循環する場合は、既存owner内で必要な最小契約を分割し、依存改版と安全証拠を先に確定する。

## 3. 機能要求（IDは候補）
### HWG-R01 全件棚卸し
main SHAを固定し、要求と実装入口・consumer・検証・配布物の両方向から全件を列挙する。候補branch/PRはmainと別表示する。未読・取得不能・未所属・重複・旧定義を分類し、母集合・走査範囲・残件を記録する。未分類0と欠陥0を混同しない。HWG自身も対象に含める。

### HWG-R02 状態の分離
各機能について、要求候補/承認/IR収載、設計、実装、入口接続、検証、運用観測、配布・公開を別軸で保持する。現行/候補/互換/保留/退役も別軸とする。文書存在、binding test、Issue close、PR mergeを実働・公開の証拠へ昇格しない。件数から完成率を捏造しない。

### HWG-R03 責務と関係
機能、責務、要求、設計、契約、実装、検証、consumer、Issue/PLAN/PR、実行履歴、Releaseをstable ID/revisionで結ぶ。包含・依存・実現・検証・利用・置換を区別し、根拠のある多対多関係を許す。責務revisionごとのprimary ownerは一意とし、workerや担当モデルとは分離する。分割/統合/移管/退役には後継・移行・影響・検証を残す。共通pathだけで重複判定しない。推定edgeは候補に隔離し、検証証拠と混同しない。

### HWG-R04 新要求のWorld Delta
要求受付・再入・改善候補・直接作成されたIssue/PLAN/PRを同じ規則で照合する。原文とAI解釈を分離し、拡張/新設/再利用/分割/統合/置換/保留候補、影響責務、検証義務、提供方針を導出する。未知・意味衝突は調査または既存の決定経路へ戻す。類似名・AIスコアだけで同一視・採否を確定しない。

### HWG-R05 工程別Admission
受付や相談を拒まず、止めるのは未許可の行為とする。
- 調査・PoC・プロト：暫定ID、仮説、scope、予算/TTL、証拠回収を束縛し、要件確定前でも限定実行を許す。
- 本実装：意味authority、機能/責務、設計・検証計画、依存、提供方針への束縛を必須とする。
- 配布/昇格：正確なSlice/Module/Bundle構成、artifact、consumer、更新/rollback、必要な操作許可を要求する。

共通のpolicy evaluatorとreceiptを既存入口へ接続し、CLI・GitHub・worker経路で迂回できなくする。発行時・dispatch時・merge/昇格時に適用範囲とrevisionを再照合する。

### HWG-R06 Release再編
旧Module数・名前・Bundle構成を固定せず、利用目的と検証・更新・rollbackの独立性から再評価する。Moduleは責務所有、Sliceは昇格単位、Bundleは利用目的別構成、Waveは導入順序として分離する。各要求を提供先または理由付き非対象/保留へ対応付ける。内部利用限定にもowner・理由・再評価条件を付け、未所属の逃げ道にしない。完成したSliceを全体完成待ちにしない。

### HWG-R07 影響限定と人間境界
委任済みの目的・制約内の技術判断は、発効済みpolicyの範囲で処理する。新しい価値・趣向・表現、権限/費用/不可逆操作の許可拡張だけを該当差分として人間へ返す。再compile、再freeze、人間再承認を分離し、旧承認の流用やHWGの自己権限拡張を拒否する。未解決は影響閉包だけを止め、無関係な作業を継続する。影響不明は安全確認前に独立扱いしない。

### HWG-R08 証拠と変更整合性
入力・出力をversioned JSON契約とし、snapshot、source revision/digest、GitHub観測、event checkpoint、policy、判定/理由、許可action/scopeを束縛する。並行差分の競合・再送・staleを区別する。取得/parse失敗を空集合へ変換しない。比較中に根拠が変われば再評価し、旧判定を流用しない。HWGの許可は必要条件であり、既存CI・独立review・lease・security・release承認を代替しない。

### HWG-R09 運用と性能
存在・未実装・衝突・次工程・提供可否・人間待ちを根拠付きで表示する。全件inventoryと通常の影響差分検査を分離し、全repo走査やLLM呼出しを毎PRへ追加しない。未束縛率、誤停止、見逃し、判断待ち、p95追加時間、再実行・token費用を測定し、enforce前に許容値を要件化する。

## 4. 導入と完了条件
1. owner・残工程・着手制限を照合し、L1/L3/L10・trace、必要な決定・正本改版・IR収載を行う。
2. read-only棚卸しとsnapshot/receiptを実装する。文書完成とcore完成を分ける。
3. 新規差分をshadow検査し、検証済み範囲の入口統制を有効化する。HWG自身でもdogfoodする。
4. 既存機能・責務・Releaseを対応付け、全入口へ拡張する。外部配布は別途検収する。

段階ごとに責務単位のPLAN/PR、依存閉包、AC、解除条件、観測、rollbackを持つ。既存全件の是正を段階2/3の開始条件にしない。導入例外はscope/owner/期限付きとし、緊急復旧も既存の監査可能な経路を維持する。HWG自身のpolicy変更は旧policyと独立検証で審査し、自己承認しない。


## 追加の解釈境界

- 再compileや再freezeを人間再承認と同一視しないが、現行L3承認境界を本候補で解除しない。
- #1500のepoch終了待ちは「先行するread-only／shadow」と「検証済みscopeのみenforce」へ改版する候補である。候補mergeだけでは着手制約が変更されたと扱わない。必要な正本改版・依存改版のreceiptをPhase 1出口に持つ。
- 全件取得失敗は完全性不足として表示する。影響範囲が確定した独立作業は継続し、取得不能を全repo停止または安全な空集合のどちらにも短絡させない。
- enforceの性能・誤停止・見逃し許容値は未確定である。Phase 2でbaselineを測定し、比較窓・測定母集団・許容値・超過時shadow復帰を要件化するまでPhase 3を有効化しない。架空の閾値を補わない。
- 永続的な設計選択の根拠はADR等の既存正本、協調連絡は期限付きmemoryとする。memoryやHWG表示から承認を発明しない。
- 非対象はWeb、World Intelligence、新学習／推論engine、全体書換え、自動削除、無承認publish、既存機構の複製である。
