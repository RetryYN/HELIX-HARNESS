# 責務・機能重複候補 人間質問batch

prepared_at: 2026-09-17
status: draft_review_pending
program_id: RDP-002
authority_effect: none
question_count: 15
batch_size: 5

## 目的と判断範囲

製品責務分類第1層で`split_required`または`cross_product_connection`となった旧Requirement IR 66件を、
[cluster台帳](requirement-overlap-candidate-clusters.jsonl)の15 clusterへ一度ずつ割り当てた。人間には一度に5問だけ提示し、
HARNESSとOSの責務境界、connection、shared capability、実装だけの重複候補を確認する。

回答はcluster relationと責務境界の判断であり、原要求の削除、統合、意味変更、successor確定、L2／L11採否、技術採用を
成立させない。各原要求IDとsemantic digestは判断後も残す。選択肢Cまたは自由記述で未決が残る場合は
`unresolved`として保持し、Issueをcloseしない。

## 入力revisionとcoverage

| source | revision／SHA-256 | coverage |
|---|---|---|
| main基準 | `00202c6e9a1cb6f560bd2d87f5af6e2b4ff37582` | Concept v4.1＋4対象L1承認後、L2／L11未採否 |
| `legacy-ir-product-routing-bootstrap.jsonl` | `c35934693b273e6cfd03e509886dc22bd1367e78ae1aa4568563a7da252c41e1` | 153件中、split 65件＋connection 1件 |
| `legacy-requirement-carry-forward.jsonl` | `51ae96d3fd27cc4aaa6e445c27ff0c6f175199cae09efe4e1566b73c1e8019b0` | 原文、revision、semantic digest |

15 clusterは上記66件を重複0・欠落0で覆う。`single_product` 87件、confirmed identity 175件、semantic line、補助source、
旧candidate、workflow索引、参照edge等は非対象ではない。各holdingのatom化後に別waveとして同じ台帳契約へ追加する。
このPRから「全要求の重複整理完了」を主張しない。

## 回答方法

各問はAを推奨案、Bを別案、Cを保留とする。`Q-OVL-001=A`のように5問分を回答できる。
Bを選ぶ場合は変更するownerまたは境界を一言添える。自由記述は既存選択肢への補足または新しい案として記録し、AIが
最も近い選択肢へ自動変換しない。

回答は対象batchの全5問が揃ってから、exact PR HEADに次の情報を追記する。

- question ID、回答原文、選択、actor、時刻、対象cluster revision。
- 保持する共通atomと固有atom、変更された候補relation、未解決事項。
- `authority_effect: none`を維持する範囲と、後続の要求採否で別判断を要する範囲。

## Batch 1：工程・要求・ticket・検証

### Q-OVL-001 工程route・Reverse・Redesign

HARNESSが工程phase、reroute、pair stale／再freeze条件を定義し、OSがintake、割当、順序実行、checkpoint、receiptを運転する
`responsibility_split`でよいか。

- **A（推奨）**: 上記で分割する。工程意味をHARNESS、projectごとの実行状態をOSへ置く。
- **B**: route選択までHARNESSの製品機能に含め、OSは実行記録だけを持つ。
- **C**: 保留する。8原要求を保持し、後続へ進めない。

対象: `HIL-BR-05`、`HIL-BR-12`、`HIL-FR-04`、`HIL-FR-05`、`HIL-FR-31`、`HIL-FR-35`、`HIL-NFR-03`、`HIL-NFR-20`。

### Q-OVL-002 gate・closure・Issue状態

HARNESSがAdmissionからClosureまでの合否条件と非終端dispositionを定義し、OSがIssue／PR状態、reopen、closure receiptを
運転する`responsibility_split`でよいか。

- **A（推奨）**: 上記で分割し、Issue closeから要求完了を生成しない。
- **B**: Issue lifecycle全体をOSに置き、HARNESSは参照するgate一覧だけを持つ。
- **C**: 保留する。3原要求を保持する。

対象: `HIL-BR-06`、`HIL-BR-07`、`HIL-FR-07`。

### Q-OVL-003 要求エンジン・要求台帳・Template改善

HARNESSが原文から要求atom、acceptance、design obligationを導く意味契約を持ち、OSが原記録、revision、projection、
Template Gapの改善運転を担う`responsibility_split`でよいか。

- **A（推奨）**: 翻訳・分類の規範をHARNESS、登録・履歴・改善をOSへ分割する。
- **B**: Requirement Engine全体をHARNESSへ置き、OSは保存先だけを提供する。
- **C**: 保留する。8原要求を保持する。

対象: `HIL-BR-23`、`HIL-BR-24`、`HIL-FR-42`、`HIL-FR-44`、`HIL-FR-45`、`HIL-NFR-26`、`HIL-NFR-27`、`HIL-NFR-28`。

### Q-OVL-004 finding disposition・ticket発行

HARNESSが`current_pr_fix`と`successor_issue`を分ける意味条件を持ち、OS推進がwriter返却、ticket、Reverse、queueを
同一因果で生成する`responsibility_split`でよいか。

- **A（推奨）**: 規範と発行を分割し、管理層が工程を渡した後に推進側がticketを切る。
- **B**: finding分類からticket発行までOSへ置き、HARNESSは検証結果だけを返す。
- **C**: 保留する。3原要求を保持する。

対象: `HIL-BR-17`、`HIL-FR-09`、`HIL-FR-30`。

### Q-OVL-005 検証義務・CI運転・quarantine

HARNESSが検証段、lineage、oracle、quarantine条件を定義し、OSが新世代CIを生成・起動・監視・再開してSHA付きreceiptを
保存する`responsibility_split`でよいか。

- **A（推奨）**: 検証契約をHARNESS、CI運転をOSへ分割する。
- **B**: CI profile定義もHARNESSに含め、OSはrunner操作だけを行う。
- **C**: 保留する。旧CIを起動せず4原要求を保持する。

対象: `HIL-BR-16`、`HIL-BR-20`、`HIL-NFR-08`、`HIL-NFR-15`。

## Batch 2：提供・platform・agent・coverage・ledger

### Q-OVL-006 HARNESS配布・package・cutover

HARNESSがconsumer向けpackage仕様と導入・更新・rollback条件を持ち、OSがindex生成、release準備、cutover、観測を運転する
`responsibility_split`でよいか。

- **A（推奨）**: 製品契約をHARNESS、配布操作と証拠をOSへ分割する。
- **B**: package生成とrelease準備までHARNESSへ含める。
- **C**: 保留する。release／cutoverは許可しない。

対象: `HIL-BR-19`、`HIL-BR-33`、`HIL-FR-33`、`HIL-TR-11`。

### Q-OVL-007 platform・dependency再現性

Linux基準、portable profile、dependency再現性を`shared_capability`候補とし、HARNESS配布runtimeとOS control planeの
受入結果を別要求identityで保持してよいか。

- **A（推奨）**: 共通standard候補＋製品別受入へ分ける。
- **B**: 共通化せず、全条件をHARNESSとOSへ完全複製する。
- **C**: 技術代替可能性reviewまで保留する。

対象: `HIL-NFR-09`、`HIL-NFR-19`、`HIL-TR-04`、`HIL-TR-05`、`HIL-TR-06`。

### Q-OVL-008 agent contract・team・runtime projection

HARNESSのagent contractとOSのteam編成・runtime projectionの間を独立した`connection_requirement`として扱ってよいか。

- **A（推奨）**: contract出力、OS受理、対応、failureを持つ接続要求にする。
- **B**: `responsibility_split`だけにし、独立した接続identityは作らない。
- **C**: 保留する。4原要求を保持する。

対象: `HIL-BR-01`、`HIL-BR-09`、`HIL-BR-30`、`HIL-NFR-02`。

### Q-OVL-009 旧source atom化・coverage

HARNESSがatomic behaviorを分母とする無損失coverage契約を持ち、OSがsource取得、atomization、digest、receipt、staleを
管理する`responsibility_split`でよいか。

- **A（推奨）**: coverage規範をHARNESS、棚卸し運転をOSへ分割する。
- **B**: source atomizationをHARNESS製品機能として一体提供する。
- **C**: 保留する。4原要求と旧sourceを保持する。

対象: `HIL-BR-14`、`HIL-FR-22`、`HIL-NFR-12`、`HIL-NFR-22`。

### Q-OVL-010 layer ledger・vertical／V-pair

HARNESSがL1-L12の粒度、上下edge、V-pair、oracle条件を規定し、OSがledger revision、snapshot、edge、evidenceを管理する
`responsibility_split`でよいか。

- **A（推奨）**: V-model規範をHARNESS、台帳運転をOSへ分割する。
- **B**: Layer Ledger Registry自体をHARNESSへ含め、OSはprojectionだけを持つ。
- **C**: 保留する。4原要求を保持する。

対象: `HIL-FR-46`、`HIL-FR-48`、`HIL-FR-49`、`HIL-NFR-29`。

## Batch 3：変更・画面・学習・authority・技術境界

### Q-OVL-011 scope authority・Design Refactor

HARNESSがminimum necessary、behavior preservation、Refactor／Redesign境界を定義し、OSがdiff、consumer、graph、budget、
rollback証拠を照合する`responsibility_split`でよいか。

- **A（推奨）**: 判定規範をHARNESS、比較・計測・運転をOSへ分割する。
- **B**: Design Refactor plannerまでHARNESS製品機能へ含める。
- **C**: 保留する。名称類似から共通化しない。

対象: `HIL-FR-06`、`HIL-FR-38`、`HIL-FR-39`、`HIL-FR-50`、`HIL-NFR-07`、`HIL-NFR-23`、`HIL-NFR-24`。

### Q-OVL-012 画面適用・prototype・walkthrough

HARNESSがscreen applicability、prototype、walkthrough、agreement／skip条件を規定し、OSがtask、artifact、観測、iteration、
receiptを運転する`responsibility_split`でよいか。

- **A（推奨）**: UI要求形成の工程規範をHARNESS、反復運転をOSへ分割する。
- **B**: Prototype BuilderとWalkthrough LoopもHARNESS製品機能へ含める。
- **C**: 保留する。5原要求を保持する。

対象: `HIL-FR-17`、`HIL-FR-18`、`HIL-FR-19`、`HIL-FR-20`、`HIL-NFR-11`。

### Q-OVL-013 judgment pack・学習昇格

HARNESSがjudgment packの適用契約を持ち、OS Learningが候補版、shadow評価、独立review、昇格・失効を管理する
`responsibility_split`でよいか。

- **A（推奨）**: 判断義務をHARNESS、学習lifecycleをOSへ分割する。
- **B**: judgment packの版管理と昇格もHARNESSへ置く。
- **C**: 保留する。候補を強制規則へ昇格しない。

対象: `HIL-BR-29`。

### Q-OVL-014 authoring admission・操作approval

HARNESSが可逆変更、意味変更、action-binding approvalの判定条件を持ち、OSがproposal検査、transaction、stale、rollback、
操作前照合を運転する`responsibility_split`でよいか。

- **A（推奨）**: authority規範をHARNESS、admission運転をOSへ分割する。
- **B**: Authoring Admission Engine全体をHARNESSへ含める。
- **C**: 保留する。自動authoringからcanonical authorityを生成しない。

対象: `HIL-BR-26`、`HIL-FR-51`、`HIL-NFR-06`、`HIL-NFR-30`、`HIL-NFR-32`。

### Q-OVL-015 Node↔Python IPC

旧`child process＋versioned JSON Lines`指定を`implementation_overlap`候補として技術代替reviewへ送り、HARNESS semantic coreと
OS Workerに必要な境界特性を別要求として保持してよいか。

- **A（推奨）**: 要求意味を保持し、具体IPC方式はRDP-003で再評価する。
- **B**: JSON Lines方式を両製品の共通技術contractとして上流で固定する。
- **C**: 保留する。旧方式も代替方式も採用しない。

対象: `HIL-TR-08`。

## Draft PRからcloseまでの順序

1. 15 clusterと質問batchをDraft PRへ置き、exact HEADの独立reviewを受ける。
2. findingを解消してもDraftを維持し、人間へBatch 1の5問だけを提示する。
3. 5回答を原文付きで記録し、cluster台帳と質問文への影響を静的検証して再reviewする。
4. 同じ手順でBatch 2、Batch 3を各5問ずつ扱う。未回答や保留をAIが補完しない。
5. 15問すべてに回答があり、66件の原identity、digest、共通atom、固有atom、未決が無損失で追跡できる場合だけDraft解除候補にする。
6. merge／post-merge read-after／Issue #1814 closeは、明示許可されたレビュー対応側だけが行う。

Issue #1814をcloseしても要求の採否や削除は成立しない。closeが示すのは、この66件に対する重複候補の人間回答と
記録・review・main read-afterが完了したことだけである。残るholdingと個別L2／L11採否は親Issue #1813に残す。
