# HELIX要求候補：インフラ・運用品質の要求導出と設計接続

## 目的
HELIX自身とHELIXで開発する製品について、業務要求からインフラ・観測・障害対応の必要条件を導出し、設計・検証・運用・改善まで追跡可能にする。新しいHARNESS、DB正本、route、独立plannerは作らない。
本書は要求候補であり、L3承認・実装開始・本番操作の許可ではない。

## 既存責務への接続
定義=#219 NFR registry。知識と上流導出=#1318 System TDD→#282 Requirement Discovery（#186と接続）。設計=#290 Design Portfolio Planner＋#1033 System Synthesis。計測=#220/#221。ログ=#222。障害分類=#223。運用・診断・再配備=#1160、意味変更時の再入=#1169。共通規則への昇格=#1035。
#219の型/設定はmainに存在するため再実装しない。Issueの存在/closedを統合・実運用済みの証拠にしない。

## 1. 定義を作る
既存品質分類を参照し、対象system/service/environment、compute/network/storage/DB/queue/外部依存、容量・回復・変更・権限・費用・観測の適用領域を別軸で定義する。
各定義はID/revision/意味/適用条件/単位/source/owner/再評価条件を持つ。service状態、観測可能性、incident lifecycleは分離する。
達成する品質はNFR、通知・復旧動作はFR、クラウドや冗長化方式は設計判断とし、全部をNFRやSLOへ押し込まない。

## 2. 知識を規則へ接続する
公開postmortem、OSSのIssue→修正→回帰test、制御実験、自システム運用から、前提→trigger→故障モード→影響→必要観測→予防/復旧義務を抽出する。
出所・版・利用条件・反例・不明点を保持する。公開報告/合成試験/実運用を区別し、未記載を0や正常にしない。#1318の規則候補とし、共通validated昇格は#1035へ渡す。
初期候補は接続枯渇、retry増幅、重複副作用、disk full/復元不能、設定/version混在、資格情報期限切れ、tenant文脈欠落、観測断。既存規則との重複を確認する。

## 3. 要求から導出する
L1/L2の業務要求、利用規模、データ重要度、外部副作用、依存、制約を正規化し、適用規則と故障scenarioからFR/NFR/Invariant/Observability/Recoveryの要求候補を生成する。
入力要求revision・規則version・前提・反例・導出結果をtraceする。同一正規化入力/規則から同一義務集合を得る。未対応・曖昧な入力はunknownとする。
停止許容時間、許容損失、応答時間、予算、保持期間、通知範囲は未合意なら質問として返す。AIが数値目標を捏造しない。目標間の衝突は代替案と判断事項を返す。
L4/L5で依存や環境が具体化した後も再評価し、要求/AC/権限/予算の意味変更は#1169へ戻す。

## 4. 設計に落とす
承認済みRequirement IRのdesign_template_ids / design_obligation_ids / required_design_artifact_kindsへ接続し、#290で必要templateを選定、#1033で責務・依存・検証graphへ統合する。
L4：配置、通信/権限境界、依存、障害影響範囲、容量前提、データ保護、deployment/rollback方針。
L5：timeout/retry/backpressure/冪等性/接続・資源上限/backup・restore/migration、ログschema、計測式、alert/incident条件、runbook、試験oracle。
各義務に要求revision、owner、artifact/section、verification、環境、未決事項を対応付ける。特定クラウドや複数regionを一律要求しない。方式名や章の存在だけで充足にしない。

## 5. 観測と判定を設計する
業務成功率・期限・整合性等の利用者影響と、CPU/DB接続/queue age等の原因診断指標を分ける。
metric/単位/分子分母/window/標本条件/workload/data/環境/baseline/target/probe/oracle/owner/HEAD・digest/再測定条件を保持する。logical operationとretry attemptを区別する。
event/service/environment/deployment/correlationを結び、欠落・重複・遅延・順序逆転・sampling・低traffic・時刻ずれを扱う。secret/PII、保持/削除、権限、cardinality、計測overheadも定義する。
collector停止・欠測はunknown/degradedであり、0や正常にしない。

## 6. インシデントと対応を分ける
観測→異常候補→通知→incident宣言→緩和→復旧→原因修正を別状態で持つ。
error logやCPU閾値だけで一律incidentにせず、環境・業務影響・損失リスク・継続・範囲・緊急性から#223で分類する。重大なデータ/権限リスクはSLO windowや根因確定を待たない。
severity、通知緊急度、連絡/ack期限、代替連絡、dedupe、抑制、復旧確認windowを定義する。自動対応は既存認可とbounded runbook内だけとし、rollback成功を恒久是正完了にしない。

## 7. 検証・還流・完了
#221で隔離環境に限定したfault/race/soak/復元/観測断試験を行う。対象・時間・負荷・費用・停止/cleanup条件を先に固定する。正常baseline、故障時信号、検知、対応、復旧後の業務結果を同じepisodeで比較する。注入の正解ラベルを検知器へ渡さない。
正規pairはL4↔L9、L5↔L8、L6↔L7、L3↔L10、L2↔L11、L1↔L12。L3では意味/受入基準を決め、後工程の測定はowner/stage/期限付き義務として残す。
要求・規則・環境の変更時に設計/test/metric/alertを再評価する。観測だけで要求を上書きしない。実装修復は既存route、意味変更は#1169、規則改善は#1035へ渡す。
定義済み/設計済み/検証済み/実運用済みを分離し、missing/stale/unknown/deferredを隠さない。coverageは宣言した適用集合内の充足であり、未知の漏れゼロ保証ではない。

## 必須negative oracle
必須義務の欠落／根拠のないN/A／数値目標の捏造／古い要求・別環境の証拠流用／collector停止を正常化／合成試験を本番実証へ昇格／backup有りだけで復旧可／重大データ損失をSLO正常で相殺／認可外auto-fix／rollbackだけで完了／正解ラベル漏洩を個別に拒否する。

## 実装順と境界
既存正本・schema・consumerの重複/差分監査→L1/L2候補とL3/L10受入の対定義・承認→定義/規則profile→要求導出adapter→#290設計template/義務→計測/ログ/incident adapter→3種の代表profileでE2E→運用還流。
各sliceは直接必要な契約・interface・証拠だけを依存とし、全関連capability完成を一律blockerにしない。未接続をmockで完成扱いしない。
初期対象はHELIX worker/CI、API＋DB、非同期queue。ML学習、全OSS収集、全provider対応、新規本番基盤構築、自動課金/本番破壊試験は非対象。将来予測向けには正常期間・未観測・介入・結果・環境版を区別して残す。
