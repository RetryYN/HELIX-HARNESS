# 責務・機能重複候補 人間質問batch

prepared_at: 2026-09-17
status: superseded_as_human_retirement_question_surface
program_id: RDP-002
authority_effect: none
question_count: 25
batch_size: 5

## 目的と判断範囲

> **2026-09-17訂正:** 本書の`Q-OVL-*`は責務境界の比較資料として保持するが、人間へ提示する削除候補質問には
> 使用しない。削除・吸収・統合・技術指定廃止の判断は
> [旧要求の削除・吸収・置換候補 人間質問batch](requirement-retirement-question-batches.md)で、原要求identity単位に5件ずつ行う。
> 先に提示したBatch 1への`OK`は削除判断へ適用していない。

製品責務分類第1層で`split_required`または`cross_product_connection`となった旧Requirement IR 66件を、
[初期cluster台帳](requirement-overlap-candidate-clusters.jsonl)の20 clusterへ一度ずつ割り当てた。さらに
[補助cluster台帳](requirement-overlap-supplementary-candidates.jsonl)へIssue #1847のScaffold 3論点、Web dashboard接続、
旧HELIX-DB実装重複の5 clusterを追加した。人間には一度に5問だけ提示し、
HARNESSとOSの責務境界、connection、shared capability、実装だけの重複候補を確認する。

回答はcluster relationと責務境界の判断であり、原要求の削除、統合、意味変更、successor確定、L2／L11採否、技術採用を
成立させない。各原要求ID、semantic digest、exact statementは判断後も残す。選択肢Cまたは自由記述で未決が残る場合は
`unresolved`として保持し、Issueをcloseしない。

## 入力revisionとcoverage

| source | revision／SHA-256 | coverage |
|---|---|---|
| main基準 | `00202c6e9a1cb6f560bd2d87f5af6e2b4ff37582` | Concept v4.1＋4対象L1承認後、L2／L11未採否 |
| `legacy-ir-product-routing-bootstrap.jsonl` | `c35934693b273e6cfd03e509886dc22bd1367e78ae1aa4568563a7da252c41e1` | 153件中、split 65件＋connection 1件 |
| `legacy-requirement-carry-forward.jsonl` | `51ae96d3fd27cc4aaa6e445c27ff0c6f175199cae09efe4e1566b73c1e8019b0` | 原文、revision、semantic digest |

20 clusterは上記66件を重複0・欠落0で覆う。cluster台帳は各原要求を`<requirement-id>-EXACT-001`として原文のまま保持し、
製品別の意味slice候補とは別fieldに置く。`unaccounted_atom_refs: []`はexact statement atomの保存範囲だけを表し、内部の
semantic decomposition完了を意味しない。境界回答後に原文とsliceの無損失性を再確認する。

`single_product` 87件、confirmed identity 175件、semantic line、補助source、旧candidate、workflow索引、参照edge等は
非対象ではない。各holdingのatom化後に別waveとして同じ台帳契約へ追加する。このPRから全要求の重複整理完了を主張しない。

Issue #1847はGitHub本文を正本にしない。[ローカルsource holding](github-issue-1847-scaffold-source-holding.json)へremote bodyと
section atomをexact digest付きで保存し、Issueの更新から独立して比較できるようにした。Scaffold CIは現在の実行許可ではなく、
対象別L2／L11と正式CI要求の採否後にだけ設計できる候補である。

## 回答方法

各問はAを推奨案、Bを別案、Cを保留とする。`Q-OVL-001=A`のように5問分を回答できる。Bを選ぶ場合は変更するownerまたは
境界を一言添える。自由記述は既存選択肢への補足または新しい案として記録し、AIが最も近い選択肢へ自動変換しない。

回答は対象batchの全5問が揃ってから、exact PR HEADにquestion ID、回答原文、選択、actor、時刻、対象cluster revision、
保持する共通／固有atom、変更された候補relation、未解決事項を追記する。回答だけで要求採否を成立させない。

## Batch 1：工程・要求形成

### Q-OVL-001 工程route・Reverse・Redesign

工程規範をHARNESS、projectごとのroute運転をOSへ分割してよいか

- **A（推奨）**: HARNESSが工程phase・再設計・stale／再freeze条件を定義し、OSがintake正規化、route割当、順序実行、checkpoint、receiptを運転する
- **B**: route選択までHARNESSへ含め、OSは実行記録だけを持つ
- **C**: 8原要求を保持して保留する

対象: `HIL-BR-05`, `HIL-BR-12`, `HIL-FR-04`, `HIL-FR-05`, `HIL-FR-31`, `HIL-FR-35`, `HIL-NFR-03`, `HIL-NFR-20`。

### Q-OVL-002 gate・closure・Issue状態

gate・closure規範をHARNESS、Issue／PR状態運転をOSへ分割してよいか

- **A（推奨）**: HARNESSがAdmissionからClosureまでの合否条件と非終端dispositionを定義し、OSがIssue／PR状態と証拠を照合して遷移する
- **B**: Issue lifecycle全体をOSへ置き、HARNESSはgate一覧だけを持つ
- **C**: 3原要求を保持して保留する

対象: `HIL-BR-06`, `HIL-BR-07`, `HIL-FR-07`。

### Q-OVL-003 Requirement Translator・要求atom

翻訳の意味契約をHARNESS、runとgap登録をOSへ分割してよいか

- **A（推奨）**: HARNESSが原文を保持して要求atom、ambiguity、Template Gapを導く翻訳契約を持ち、OSが翻訳runとgap登録を管理する
- **B**: Requirement Translator全体をHARNESSへ置き、OSは保存先だけを提供する
- **C**: 2原要求を保持して保留する

対象: `HIL-BR-23`, `HIL-NFR-27`。

### Q-OVL-004 Requirement Ledger・Design Obligation

要求・設計義務の意味をHARNESS、ledger運転をOSへ分割してよいか

- **A（推奨）**: HARNESSが要求revision、acceptance、design obligation、消込の意味を定義し、OSがimmutable ledger、typed edge、orphan／staleを管理する
- **B**: Requirement LedgerをHARNESS製品機能として一体提供する
- **C**: 5原要求を保持して保留する

対象: `HIL-BR-24`, `HIL-FR-42`, `HIL-FR-45`, `HIL-NFR-26`, `HIL-NFR-28`。

### Q-OVL-005 Template Improvement

template改善の合格規範をHARNESS、候補lifecycleをOSへ分割してよいか

- **A（推奨）**: HARNESSがtemplate applicabilityとgap・shadow合格条件を定義し、OS改善が候補版、評価、昇格、rollbackを管理する
- **B**: Template Improvement Loop全体をHARNESSへ置く
- **C**: 原要求を保持して保留する

対象: `HIL-FR-44`。

## Batch 2：finding・CI・提供

### Q-OVL-006 finding disposition・ticket発行

finding規範をHARNESS、ticket発行・queue運転をOSへ分割してよいか

- **A（推奨）**: HARNESSがcurrent修正とsuccessor workを分ける条件を持ち、OS推進がwriter返却、ticket、Reverse、queueを同一因果で生成する
- **B**: finding分類からticket発行までOSへ置く
- **C**: 3原要求を保持して保留する

対象: `HIL-BR-17`, `HIL-FR-09`, `HIL-FR-30`。

### Q-OVL-007 検証義務・CI運転・quarantine

検証契約をHARNESS、CI運転をOSへ分割してよいか

- **A（推奨）**: HARNESSが検証段、lineage、oracle、quarantine条件を定義し、OSがCIを生成・起動・監視・再開してSHA付きreceiptを保存する
- **B**: CI profile定義もHARNESSへ含め、OSはrunner操作だけを行う
- **C**: 旧CIを起動せず4原要求を保持する

対象: `HIL-BR-16`, `HIL-BR-20`, `HIL-NFR-08`, `HIL-NFR-15`。

### Q-OVL-008 HARNESS package・distribution cutover

package契約をHARNESS、配布cutoverをOSへ分割してよいか

- **A（推奨）**: HARNESSがconsumer向けpackage／marketplace仕様を持ち、OSがindex生成、配布準備、cutover、rollbackを運転する
- **B**: package生成とrelease準備までHARNESSへ含める
- **C**: release／cutoverを許可せず保留する

対象: `HIL-BR-33`。

### Q-OVL-009 Bun撤去・active surface

Bun非依存要求をHARNESSとOSの別identityへ分割してよいか

- **A（推奨）**: HARNESS配布surfaceとOS開発・実行・検証surfaceのBun非依存を別対象として拘束する
- **B**: HELIX全体の単一共通技術要求として保持する
- **C**: 3原要求を保持して保留する

対象: `HIL-BR-19`, `HIL-FR-33`, `HIL-TR-11`。

### Q-OVL-010 platform adapter・portable profile

共通standard候補と製品別受入へ分けてよいか

- **A（推奨）**: Linux基準とportable profileを共通engineering standard候補として保持し、HARNESSとOSの受入結果を別identityにする
- **B**: 共通化せず全条件を二製品へ完全複製する
- **C**: 技術代替可能性reviewまで保留する

対象: `HIL-NFR-09`, `HIL-NFR-19`, `HIL-TR-04`, `HIL-TR-05`。

## Batch 3：技術・自走・agent

### Q-OVL-011 dependency再現性・Node↔Python IPC

要求意味を保持し、具体lock／IPC方式をRDP-003で再評価してよいか

- **A（推奨）**: dependency lockと旧JSON Lines IPCを技術実現候補として分離し、HARNESS semantic coreとOS Workerに必要な境界特性を別々に確認する
- **B**: JSON Linesとlock方式を両製品の共通技術contractとして固定する
- **C**: 2原要求を保持し方式判断を保留する

対象: `HIL-TR-06`, `HIL-TR-08`。

### Q-OVL-012 承認後の自動走行・監査交互接続

自走規範をHARNESS、Worker／監査運転をOSへ分割してよいか

- **A（推奨）**: HARNESSが人間承認後の進行・停止・不可逆境界と独立監査条件を定義し、OSがWorkerとreviewerを交互に運転する
- **B**: 自動走行全体をOS要求として保持する
- **C**: 原要求を保持して保留する

対象: `HIL-BR-01`。

### Q-OVL-013 agent contract→team／runtime projection

HARNESS出力とOS受理の独立connection requirementとしてよいか

- **A（推奨）**: HARNESSが専門agent contractを出力し、OSがteamを編成してruntime固有定義へ投影する接続要求として扱う
- **B**: 責務分割だけにし、接続identityは作らない
- **C**: 2原要求を保持して保留する

対象: `HIL-BR-09`, `HIL-BR-30`。

### Q-OVL-014 worker・verifier・promoter分離

独立性規範をHARNESS、role配置と拒否運転をOSへ分割してよいか

- **A（推奨）**: HARNESSがrole間の独立性条件を規定し、OSが同一actorの自己承認・昇格を実行時に拒否する
- **B**: role配置規則もHARNESSへ含める
- **C**: 原要求を保持して保留する

対象: `HIL-NFR-02`。

### Q-OVL-015 旧source atom化・coverage

coverage規範をHARNESS、棚卸し運転をOSへ分割してよいか

- **A（推奨）**: HARNESSがatomic behaviorを分母とする無損失coverage契約を持ち、OSがsource取得、atomization、digest、receipt、staleを管理する
- **B**: source atomizationをHARNESS製品機能として一体提供する
- **C**: 4原要求と旧sourceを保持して保留する

対象: `HIL-BR-14`, `HIL-FR-22`, `HIL-NFR-12`, `HIL-NFR-22`。

## Batch 4：coverage・変更・authority

### Q-OVL-016 layer ledger・vertical／V-pair

V-model規範をHARNESS、台帳運転をOSへ分割してよいか

- **A（推奨）**: HARNESSがL1-L12の粒度、上下edge、V-pair、oracle条件を規定し、OSがledger revision、snapshot、edge、evidenceを管理する
- **B**: Layer Ledger Registry自体をHARNESSへ含める
- **C**: 4原要求を保持して保留する

対象: `HIL-FR-46`, `HIL-FR-48`, `HIL-FR-49`, `HIL-NFR-29`。

### Q-OVL-017 scope authority・Design Refactor

判定規範をHARNESS、比較・計測・運転をOSへ分割してよいか

- **A（推奨）**: HARNESSがminimum necessary、behavior preservation、Refactor／Redesign境界を定義し、OSがdiff、consumer、graph、budget、rollback証拠を照合する
- **B**: Design Refactor plannerまでHARNESS製品機能へ含める
- **C**: 7原要求を保持して保留する

対象: `HIL-FR-06`, `HIL-FR-38`, `HIL-FR-39`, `HIL-FR-50`, `HIL-NFR-07`, `HIL-NFR-23`, `HIL-NFR-24`。

### Q-OVL-018 画面適用・prototype・walkthrough

UI要求形成の工程規範をHARNESS、反復運転をOSへ分割してよいか

- **A（推奨）**: HARNESSがscreen applicability、prototype、walkthrough、agreement／skip条件を規定し、OSがtask、artifact、観測、iteration、receiptを運転する
- **B**: Prototype BuilderとWalkthrough LoopもHARNESSへ含める
- **C**: 5原要求を保持して保留する

対象: `HIL-FR-17`, `HIL-FR-18`, `HIL-FR-19`, `HIL-FR-20`, `HIL-NFR-11`。

### Q-OVL-019 judgment pack・学習昇格

判断義務をHARNESS、学習lifecycleをOSへ分割してよいか

- **A（推奨）**: HARNESSがjudgment packの適用契約を持ち、OS Learningが候補版、shadow評価、独立review、昇格・失効を管理する
- **B**: judgment packの版管理と昇格もHARNESSへ置く
- **C**: 原要求を保持して保留する

対象: `HIL-BR-29`。

### Q-OVL-020 authoring admission・操作approval

authority規範をHARNESS、admission運転をOSへ分割してよいか

- **A（推奨）**: HARNESSが可逆変更、意味変更、action-binding approvalの判定条件を持ち、OSがproposal検査、transaction、stale、rollback、操作前照合を運転する
- **B**: Authoring Admission Engine全体をHARNESSへ含める
- **C**: 5原要求を保持して保留する

対象: `HIL-BR-26`, `HIL-FR-51`, `HIL-NFR-06`, `HIL-NFR-30`, `HIL-NFR-32`。

## Batch 5：Scaffold・Web接続・永続化方式

### Q-OVL-021 Scaffold Binding規範と管理lifecycle

Scaffoldを正式成果物が未成立の間だけrole・obligation・consumerへ束縛する一時構造とし、HARNESSが利用・非昇格・無損失移管の
規範を、OSがbinding登録・隔離実行・state・replacement／retire lifecycleを担う責務分割でよいか。

- **A（推奨）**: 規範をHARNESS、管理lifecycleをOSへ分割し、Scaffoldから要求・設計・承認・完了を生成しない。
- **B**: Scaffold Binding全体をOS固有の内部管理機能として扱う。
- **C**: Issue #1847のexact sourceを保持して保留する。

対象: `SCF-1847-POSITION`、`SCF-1847-PO-CONCERN`、`SCF-1847-PURPOSE`、`SCF-1847-CONTRACT`、
`SCF-1847-RESPONSIBILITY`、`SCF-1847-RESEARCH-POC-BOUNDARY`、`SCF-1847-USE-CASES`、`SCF-1847-STOP`。

### Q-OVL-022 Scaffold CIと正式CI

Scaffold CIを正式CIとは別namespace・別evidence classにし、宣言済み一時契約だけを検証する`partial_overlap`として
Q-OVL-007の正式CI責務と分けてよいか。

- **A（推奨）**: 別classに分け、greenからL10／L11／L12、production-ready、release-readyを生成しない。
- **B**: Scaffold専用CIを設けず、正式CI成立まで静的検査だけに限定する。
- **C**: 正式CI要求の採否まで候補を保留する。

対象: `SCF-1847-CI`、`SCF-1847-CONNECTIONS`、`SCF-1847-ACCEPTANCE`、`SCF-1847-STOP`、関連cluster `OVL-007`。

### Q-OVL-023 Scaffold replacement・retire

Scaffold撤去前にrole、obligation、consumer、oracle、revisionを正式成果物へrebindし、二重owner／writer／CIと残留artifactを
検査する`partial_overlap`として、旧資産retireとは別identityでよいか。

- **A（推奨）**: Scaffold固有のreplacement closureとして保持し、旧資産archive／削除判断と分ける。
- **B**: 旧資産retire契約へ包含し、Scaffold固有identityは作らない。
- **C**: replacement設計まで候補を保留する。

対象: `SCF-1847-REPLACEMENT`、`SCF-1847-CONNECTIONS`、`SCF-1847-ACCEPTANCE`、`SCF-1847-STOP`、
関連cluster `OVL-004`／`OVL-015`。

### Q-OVL-024 HELIX-Web dashboardとHELIX-Web-OS projection

HELIX-Webの利用者向け選択・操作・dashboard体験と、HELIX-Web-OSの原event／evidenceからのfresh projectionを、
独立した`connection_requirement`で接続してよいか。

- **A（推奨）**: Webの体験要求とWeb-OSのservice projectionを別identityにし、受渡し・stale・conflictを接続要求にする。
- **B**: dashboard表示までHELIX-Web-OSに置き、Webは表示surfaceだけを持つ。
- **C**: HARNESS Version 1完成条件が確定するまで保留する。

対象: `HELIXWEB-L2-001`、`HELIXWEBOS-L2-005`。

### Q-OVL-025 HELIX-DB／harness.dbと永続化能力

旧`harness.db`／SQLite指定を`implementation_overlap`として技術代替reviewへ送り、永続化、排他、冪等性、再開、因果trace、
projection再構築、single writerという意味能力だけをHELIX-OS要求に保持してよいか。

- **A（推奨）**: DB製品名と旧schemaを固定せず、意味能力を保持してRDP-003で方式比較する。
- **B**: `harness.db`を新世代HELIX-OSの必須実装として維持する。
- **C**: 技術比較まで旧指定と意味能力の双方を未決で保持する。

対象: `HIL-TR-07`、`HIL-TR-09`、`HIL-TR-10`、`HELIXOS-L2-001`、`HELIXOS-L2-007`。

## Draft PRからcloseまでの順序

1. 25 clusterと質問batchをDraft PRへ置き、exact HEADの独立reviewを受ける。
2. findingを解消してもDraftを維持し、人間へBatch 1の5問だけを提示する。
3. 5回答を原文付きで記録し、cluster台帳と質問文への影響を静的検証して再reviewする。
4. 同じ手順でBatch 2からBatch 5まで各5問ずつ扱う。未回答や保留をAIが補完しない。
5. 25問すべてに回答があり、初期66件と補助5 clusterのsource、digest、exact statement、共通atom、固有atom、未決が無損失で追跡できる場合だけDraft解除候補にする。
6. merge／post-merge read-after／Issue #1814 closeは、明示許可されたレビュー対応側だけが行う。

Issue #1814をcloseしても要求の採否や削除は成立しない。closeが示すのは、今回25 clusterに対する重複候補の人間回答と
記録・review・main read-afterが完了したことだけである。残るholdingと個別L2／L11採否は親Issue #1813に残す。
