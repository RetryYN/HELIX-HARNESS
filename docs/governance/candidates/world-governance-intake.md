---
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
plan: PLAN-L3-92-world-governance
---

# World Governance入力移管・既存責務との対応

受領日2026-09-06。照合main `0f2881edf89d616e4ca3bcb6ea1ce91c9ae1e4d2`。
原調査の基準 `1a4f9c3474a768765a85b480eabbb30698d7ef9d` と区別する。
currentのrequirement-ir-authority設定、graph loader冒頭180行、semantic-intake-receipt冒頭155行、#1500本文をread-only再照合した。
全件監査・runtimeテスト・稼働確認は今回の候補移管からは主張しない。

## 原稿移管の全範囲

| 入力範囲 | 移管先 |
|---|---|
| 指示書§1 優先度・着手制限 | 要件§1／追加解釈、AC09、P1→P3 |
| 指示書§2 正本・既存owner | 要件§2、下表 |
| R01/R02/R03 | BR01、AC01/02/03/08、OP01 |
| R04/R05/R07/R08 | BR02、AC02〜06/08〜10、OP02 |
| R06/R09 | BR03、AC07〜10、OP03 |
| 指示書§4 導入・例外 | 要件§4、受入の段階出口 |
| 指示書§5 反例1〜10 | AC01〜10（順序保持） |
| 指示書非対象 | 要件追加解釈 |
| baseline§1〜4 | 以下の既存owner対応、要件追加解釈、原文保全 |

R01〜R09はすべて候補採用。現行JSONへの昇格・承認・runtime変更は未実施。
原文とAIの整理を区別するため、入力全文を末尾に変更せず保全する。

## 既存ownerへ戻す責務

| owner | 再利用・追加する範囲 | HWGが所有しない範囲 |
|---|---|---|
| #1500 | 全体の対応付け・工程別整合条件・表示、今回の主owner | 新しい意味正本 |
| #990 | snapshot comparator／観測差分 | 別journal/DB |
| #1036／#1038 | 根拠付きgraph契約／置換lifecycle | 別graph engine／全体planner前倒し |
| #1073／#1074／#1494 | Module/Slice/Bundle/Wave／提供inventory | 別Release体系／公開許可 |
| #1110／#1372 | branch/worktree／文書inventory | 自動削除 |
| #1556／#1169／#397 | 要求形成／re-entry／canonical IR収載 | 新承認engine／IssueからJSON直接昇格 |
| 既存Ticket／Assignment owner | admission結果のdispatch時照合 | 配車schedulerの再実装 |
| #1538 | 監査入力の保全 | Portfolio runtime完成の代替証拠 |

graph loaderのfail-open／basename推定は探索consumerの観測であり、全admission欠陥の断定ではない。
HWG実行許可へは取得品質とedge根拠を供給する契約が必要。既存表示consumerを一括破壊しない。
既存semantic intake receiptのdigest／atom処理を再利用し、独立した入力保全engineを作らない。

## 原文保全

取り込み検査で以下のfence内容のUTF-8 SHA256を原稿と比較する。原稿削除後もGitから回復可能にする。
ファイル名は入力由来の記録でありcurrent authorityの参照先ではない。

### 指示書

原稿ファイル名: `HELIX_WORLD_GOVERNANCE_INSTRUCTION_v0.1.md`
source_sha256: 0e6804d20731581ccd20877e1a3ebaa9954d835d4cc8fef597e5f4da25885c08

~~~~text
# HELIX World Governance 要求指示書 v0.1

対象：RetryYN/HELIX-HARNESS。優先度：P1最上位。
本書は要求入力であり、要件承認・実装完了・公開許可ではない。

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

## 5. 必須受入・反例
各項目へAC/test IDを割り当て、targeted/結合/必要CI・mutation・DB replay・独立exact-HEAD review・main read-afterで閉じる。

1. 要求のみ、main実装のみ、入口未接続、運用済み、公開済みを区別できる。
2. 要求欠落、実装orphan、二重primary owner、無根拠edgeを検出する。
3. 正当な再利用を通し、類似名だけの自動統合を拒否する。
4. 調査は通るが、未確定候補の本実装・公開への越境は拒否する。
5. stale/競合/再送/取得不能を処理し、同じ入力から同じ判定を再現する。
6. 人間待ちのscopeだけ停止し、無関係なCI改善等は継続する。
7. 内部利用を公開完了扱いせず、未検証Sliceのstable混入を拒否する。
8. 新要求から機能・責務・検証・提供先まで往復追跡できる。
9. shadow/enforce切替とrollbackを検証し、旧保護を維持する。
10. HWGの自己権限拡張・自己承認・保護解除を拒否し、費用と誤停止を実測する。

非対象：HELIXWeb実装、World Intelligence、学習/推論engine新設、全体書換え、自動削除、無承認publish、既存責務の複製。

根拠・固定SHAは実態確認メモ参照。着手時に差分を再照合する。
~~~~

### 実態確認メモ

原稿ファイル名: `HELIX_WORLD_GOVERNANCE_BASELINE_v0.1.md`
source_sha256: 96e3abeeb175413e00bf544a561c02655c627b30e4c79e7d00109dbe8ac91137

~~~~text
# HELIX World Governance — 実態確認・接続メモ v0.1

確認日：2026-09-06。
固定したmain：`1a4f9c3474a768765a85b480eabbb30698d7ef9d`。
対象：[RetryYN/HELIX-HARNESS](https://github.com/RetryYN/HELIX-HARNESS)。

本メモは要求指示書の背景と接続根拠であり、別の意味正本ではない。Issueは確認時点の可変状態、コードは上記commitに固定して読む。本調査は関係する要求・Issueと代表実装のread-only照合であり、全件実装監査、テスト実行、稼働・公開確認を完了したものではない。未完Issueの存在だけで、その全機能を未実装とは判定しない。

## 1. 確認した事実と設計への反映

| 確認対象 | 読み取れる事実 | HWGへの反映 |
|---|---|---|
| [#1500 Capability／Release Portfolio Management](https://github.com/RetryYN/HELIX-HARNESS/issues/1500) | 要求・責務・Module/Bundle/Slice・version・wave・証拠を結ぶprojectionが要求されている。新しい意味正本は禁止され、最初のEpochのexit前にmanagement runtimeをcritical pathへ追加しないという作業境界が記載されている。 | 主な改版接続先とする。単に名前を増やさず、全体の対応付けと新規差分の入口統制へ拡張する。高優先化は着手順序の明示的な改版を伴わせる。 |
| [#1538 外部横断監査入力の保全](https://github.com/RetryYN/HELIX-HARNESS/issues/1538) | #1500配下だが監査入力の保全を所有し、Portfolio runtimeは非対象。 | 子Issueが進んでも、管理機構が実装されたとは数えない。入力保存・機能実装・運用を分離する。 |
| [#990 Project Convergence Audit](https://github.com/RetryYN/HELIX-HARNESS/issues/990) | Git・GitHub・event・DBを同じsnapshotへ束縛し、計画と観測の乖離をpure comparatorで検出する要求。DBは再構築可能projection。 | snapshot、差分比較、通知の責務を複製せず接続する。要求の意味authorityについては下記canonical JSON設定を優先照合する。 |
| [#1033 System Synthesis](https://github.com/RetryYN/HELIX-HARNESS/issues/1033)／[#1036 semantic connection graph](https://github.com/RetryYN/HELIX-HARNESS/issues/1036) | stable identity・revision・digest・authorityによる接続を所有する要求。全体plannerは将来対象として区別されている。 | World Graphという別基盤を立てない。必要最小のgraph契約を既存ownerで切り出す。依存を修正する場合も安全義務を外さず、全体planner完成待ちを作らない。 |
| [#1074 Release inventory](https://github.com/RetryYN/HELIX-HARNESS/issues/1074) | HELIX／DevOSのsource、branch/tag/release、IR、distribution・consumerを分類する責務。 | 配布状態の棚卸しを再利用する。branchやtagの存在だけで利用者へ提供済みと判定しない。 |
| [#1494 Functional Release Slice](https://github.com/RetryYN/HELIX-HARNESS/issues/1494) | 旧Module数・名前・所属を固定せず、依存閉包と独立した検証・昇格・rollbackから構成を再評価する要求。候補承認、IR収載、runtime、公開を区別する。 | Module＝所有、Slice＝昇格、Bundle＝利用目的、Wave＝順序を維持する。HWGが別のRelease体系を作らない。 |
| [#1556 要求形成・影響限定再freeze](https://github.com/RetryYN/HELIX-HARNESS/issues/1556) | 要求候補の受付であり、自動承認policyの発効ではない。調査・人間選択・技術評価・実行認可の分離、無関係scopeの継続が要求されている。 | HWGで別の人間承認規則を作らない。現行policyを使い、新policyの成立前に自動承認を既成事実化しない。 |

#1110／#1372は#1500が参照するbranch・文書inventoryの接続先、#1038は#1033が参照するreplacement lifecycleの接続先として扱った。本メモではそれらの全runtimeを再監査したとは主張しない。

## 2. 代表実装から分かった、再利用時の注意

### A. 意味正本は設定で確認できる

[`config/requirement-ir-authority.json`](https://github.com/RetryYN/HELIX-HARNESS/blob/1a4f9c3474a768765a85b480eabbb30698d7ef9d/config/requirement-ir-authority.json) は、`canonical_root=requirements-ir/manifest.json`、`semantic_read=canonical_json_only`、`write=json_transaction_only`、`dual_authority=forbidden` を宣言している。

したがって、World Registryを手編集して「この機能が正本」と決める設計は不可。Issue・設計候補・graph・runtimeの観測を保持することと、それを現行要件として採用することは分離する。未収載の宣言は削除せず、候補または未接続として可視化する。

### B. 既存graph loaderを、そのまま実行許可へ使わない

[`src/graph/loader.ts` L1–180](https://github.com/RetryYN/HELIX-HARNESS/blob/1a4f9c3474a768765a85b480eabbb30698d7ef9d/src/graph/loader.ts#L1-L180) では、ディレクトリ取得失敗時にreturnするhelperがあり、コメントにも不在・parse失敗を空集合として扱う方針が記載されている。テストとsourceの対応付けにはimport解析に加え、basename一致の補助処理がある。

これは既存の関係表示・探索用処理に対する観測であり、現行の全admissionが安全性欠陥を持つと断定するものではない。ただしHWGで実行許可の根拠へ使うなら、次を区別する必要がある。

- 正常取得した空集合と、取得不能・parse失敗・部分取得。
- 宣言された関係、名前などから推定した候補関係、実行結果による検証証拠。
- 対応するテストファイルの存在と、対象revisionで必要な受入が実際に成立したこと。

指示書のR01/R03/R08は、この違いを失わないための要求である。既存表示consumerまで一括変更するのではなく、consumer契約を確認し、実行許可側へは必要な取得品質・根拠情報を供給する。

### C. intake receiptの部品は既に存在する

[`src/semantic/semantic-intake-receipt.ts` L1–155](https://github.com/RetryYN/HELIX-HARNESS/blob/1a4f9c3474a768765a85b480eabbb30698d7ef9d/src/semantic/semantic-intake-receipt.ts#L1-L155) には、source/inventory digest、差異の裁定、atomごとのadopt/defer/reject、receipt digestを表す契約がある。pure APIであり、書込みauthorityを持たない設計が記載されている。

これを全体のWorld Admissionが完成している証拠とは扱わない。一方で、新しい入力保全engineを複製する理由にもならない。適用可能な既存部品と不足する機能・責務・提供先の対応付けを分けて設計する。

## 3. 今回の要求として新しく定めること

HWGは「新しい要求を受け付ける権利」を奪う機構ではない。全入力を候補として保持し、次の行為に必要な条件を照合する。人間の意味判断、既存の正本更新、配車、検証、公開承認を横取りしない。

| 論理責務 | HWGが所有する差分 | HWGが行わないこと |
|---|---|---|
| World Model／Registry | 機能・責務・実装・検証・提供の対応付け、状態と取得品質の表示 | Requirement/Design自体の意味と承認、元データの保全 |
| World Graph接続 | 既存graphに必要なentity/edgeの契約を接続し、候補と確定根拠を区別 | graph kernelの別実装、全体planner、自由な因果推論 |
| World Policy評価 | 工程・行為別の全体整合条件を既存policyへ追加する | 人間の価値選択、security・CI・review・release policyの解除 |
| World Delta／Admission接続 | 新規・変更要求を既存機能等へ対応付け、必要な差分と許可範囲を出す | 正本への直接書込み、モデル配車、無承認実行 |
| Portfolio表示 | 未実装、未接続、停止理由、提供資格、次に必要な証拠を説明する | 進捗の自己申告、完成率の推測、公開状態の捏造 |

要求ID `HWG-R01`〜`HWG-R09` は本指示書内の候補IDである。正本化時に既存ID・behavior contract・ownerとの衝突を検査し、正規IDへの対応表を残す。

## 4. 優先化しても壊さない境界

既存#1500の着手順序は、今回の高優先要求と衝突し得るため改版対象にする。ただし、今回の会話を#1500以外の全保留解除、既存policyの緩和、全機能の一括実装許可へ拡張してはならない。

#1494の先行投入境界に合わせ、CI改善の内部適用と、#1293側が所有するCursor限定委譲を、全体管理機構やRelease全体の完成待ちに戻さない。P0、安全依存、独立検収、予算・TTL・隔離条件は維持する。

初期成果は「全世界が完全に整理されたこと」ではなく、「未整理部分を正直に表示し、検証済み範囲では新しい未束縛変更を実行へ通さないこと」。全件是正と最小coreの運用開始を別の到達条件にする。

提出対象は要求指示書と本メモのみ。GitHubのIssue作成・編集・priority変更、コード変更、CI実行、要件承認、tag/publishは行っていない。
~~~~
