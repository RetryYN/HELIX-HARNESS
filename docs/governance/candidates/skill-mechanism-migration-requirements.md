---
title: "新Skill機構への責務移行"
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
candidate_layer: L3
owner_issue: 1594
plan_id: PLAN-L3-1594-skill-mechanism-migration
---

# 要求① 旧スキルの新スキル機構への移行・縮退

対象: RetryYN/HELIX-HARNESS｜改訂2.0｜2026-09-06 JST
実装根拠: 前回確認main `2b7452c467cfd5682f21666550c3461e80089eca`。今回は指示書の再編であり、最新mainの再監査ではない。
位置付け: 独立した要求差分。S-R/S-ACは本書内IDで、登録済みHELIX要件IDではない。本書を正式IR・実行許可とみなさない。

## 目的と責務

スキルは、仕事に必要な専門知識・判断観点・有効な手順を供給する機構である。既存の新スキル定義へ旧資産を移し、重複・旧前提・機械に移管済みの責務を縮退させる。スキル全体をGuard/Helpへ置き換えず、残存数を一桁にすることも目的にしない。

意味・価値評価は#1382、棚卸しは#1372、typed適用契約は#1044/#248、移行は#322、起動への接続は#1370/#1377/#1098を再利用する。退役は#863/#865の既存責務・証拠へ接続する。本要求と「②ルール機械導出」は別PLAN・別受入・別完了状態にする。①の全部を②の完成待ちにしない。

## 要求

### S-R01 新定義に沿った棚卸し

新しい分類体系を発明せず、#1382のKNOWLEDGE_ASSET / JUDGMENT_PACK / MACHINE_POLICY / PROVIDER_NATIVE_TECHNIQUE / GENERIC_PROCEDURE / COMPATIBILITY_SURFACE / OS_CONTROL_SURFACEと既存dispositionを使う。これは移行先判定の分類であって、7種類すべてをスキル内部で実行する指示ではない。

現HEADで旧Skillと関連Agent/Commandの供給責務、生成元、配布先、起動参照、consumerを棚卸しする。複合責務は分ける。分類・lifecycle・注入方法・強制度を別軸で管理し、古い・未使用・モデルが知っているだけでは削除しない。不足証拠はunknownとして残す。

### S-R02 残存スキルのJSON契約

Markdown本文をそのままJSONへ包まず、ID、owner、定義version、正本参照/digest、分類、lifecycle、適用条件、入出力契約、知識/判断/手順への参照、後継を構造化する。新機構に既存schemaがあれば拡張し、並行するSkill IR正本を増設しない。

適用条件は既存registryのtarget_axis＋target_idを使う。未登録IDの創作、名称類推、未指定のall/Forward扱いは禁止。JSONは制御・受渡し契約であり、知識本文まで一律JSON化しない。価値のある知識・手順は必要時取得できるよう残す。スキル自身には権限付与・Guard解除・承認生成を持たせない。

### S-R03 現実装の移行阻害を置換

`src/skill-engine/scaffold.ts`、`src/assets/catalog.ts`、`src/skills/recommend.ts`、`src/lint/skill-quality.ts`を既存ownerで接合する。Markdown生成、md/yaml限定loader、SKILL_MAP手動同期、旧drive_models採点、本文1200字/2節下限を新契約に対応させる。

契約の有効性はschema、参照、typed適用、未記入、必要証拠で検査する。短いから不良、長いから良質とはしない。検査全停止で短縮を通さず、登録整合の検証を保持する。このcatalog検証を②のGuard導出完成待ちにしない。

### S-R04 必要な能力だけ動的に供給

typed適用と除外を先に判定し、task/role/工程に必要な部分だけ供給する。推薦scoreだけで必読化しない。Judgmentは必要観点、Knowledge/手順は必要時取得を基本にする。互換・退役済み資産を通常推薦やsetupへ再生成しない。

role-judgment、task-lens、Skill注入の同一内容を重ねない。ただし着手前の目的・受入条件・今回の制約まで削り、失敗しないと仕事の意味が分からない運用にしない。スキル選択は実行権・正本の選択ではない。

### S-R05 コンテキストと外部記憶

`adapter.ts`、`task-lens.ts`、`doc-router.ts`へ新契約を接続する。無一致時に渡された文書の全文を返す経路は、上限付き参照・追加検索へ置換する。必須情報不足は明示し、無関係な文書投入で埋めない。

harness memory/continuationは別機構として維持する。Skillがゼロでも必要recallは動作させる。取得したSkill・知識・会話要約を承認やPolicyへ昇格させない。起動packetの共通搬送を使っても、能力供給と許容境界の意味契約は分ける。

### S-R06 利用と効果を別計測

既存skill hygiene/efficacyを拡張し、recommended / injected / retrieved / outcomeを区別する。パス指示の注入と本文の実取得を分け、review evidence由来の推定invocationを実読込・有効性の証拠にしない。

ID/digest、注入理由、実送信bytes/tokens、測定方法、HEAD、provider/model/設定、観測期間を記録する。観測不能はunknown。同条件の旧新比較で成功率、手戻り、重大見逃し、総tokens、遅延を評価し、少標本やディスク容量だけで削減効果を断定しない。

### S-R07 #322を責務の移行へ改訂

「旧60件をすべてcurrentへbackfill」を「現HEADの対象全件に処置を付け、残す能力だけ新機構へ移す」に改訂する。削減数は合格条件にしない。旧Skill内の強制ルールは②または既存Policy ownerへ、制御責務は既存OS ownerへ移管する。

移管は参照と受領証拠を残し、受領側の保護が成立するまで旧保護を外さない。その項目の移管だけを局所依存にし、他のスキル移行まで止めない。縮退を実行する巨大な新スキルや第二の自動削除エンジンは作らない。

### S-R08 段階導入と完了

棚卸し/要求差分→分類・JSON入出力/検査→一つのSkill familyで新旧比較→供給・consumer移行→退役の順で、独立sliceを進める。無根拠な除外・削除はしない。物理削除はcurrent consumerゼロ、必要能力の保持または後継E2E、rollback成立後とし、歴史/replayは別管理する。

要求採用、canonical/IR admission、実装、runtime有効化、退役を別状態で報告する。既承認事項を一律再承認待ちへ戻さず、意味変更・不可逆移行だけ既存承認境界を使う。

## 受入と提出物

受入: 全件処置追跡、有効な短いJSONの受理、不正identity/再注入の拒否、必要能力の供給、Skillゼロ時のmemory維持、推定値の偽昇格防止、独立した効果比較、後継証拠付き退役をS-ACで検証する。②未移行の環境でも、既存保護を維持して①の対象sliceを受け入れ可能にする。

提出: ①専用の要件・PLAN・受入、inventory/disposition、旧新対応、loader/推薦/供給変更、比較結果、残存consumer、rollback、未完の局所移管。②の実装済みを①の完成根拠にしない。

非対象: Guard/Help生成機構の開発、Policyの意味変更、スキルの一律Guard化、全Agent/Command廃止、固定削減率。
補足03/04/05は未提供。本文から導出した受入は同名のacceptance文書で管理し、未提供資料の内容を確認済みとしない。

