# 新世代と旧開発投資候補INV-001..072の対応

確認日: 2026-09-14

## 目的

`development-investment-stage-directives-intake_v1.0.md`とhistorical sourceにあるINV-001..072を、要求源、
方式候補、旧実装前提、将来研究へ分類する。P0..P4は旧導入帯であり、要求priority、V-model layer、release wave、
新世代の実装順ではない。72件という数を要求分母、完成率、Issue数、実装backlogとして継承しない。

本表は72 IDをexactに一度ずつ収容する。候補の採択、Issue化、実装、CI、Worker、GitHub、DB、外部操作を行わない。

## 全件分類

| 分類 | 対象INV | 件数 | 保持候補の意味 | 持ち込まない条件 | 状態 |
|---|---|---:|---|---|---|
| OS authority・作業・証拠・変更統制 | 001、002、005、006、008、010、011、012、013、014、015、016、017、018、023、026、031、032、034、035、036、039、041、047、048、049、050、051、052、055、056、061、062、063、065、066 | 36 | 対象・owner・依存・状態・操作・競合・証拠・待機・費用・採否・移行を管理する候補 | 旧Issue／PLAN／PR／branch／DB／CLI／Merge Train／writer／stageを方式として継承しない | os_semantic_reapproval |
| HARNESS検証契約とOS実行の分離 | 003、007、009、019、020、021、022、024、027、028、029、030、033、044、053、057、064 | 17 | 到達可能性、検証義務、再現、反例、再資格、提供依存をHARNESSが定め、実行・cache・retry・環境をOSが管理する候補 | 既存CI、prepare、AST index、shard、fixture、cache、test generator、warm環境を新世代baselineにしない | split_semantic_reapproval |
| OS learning・AI context・resource判断 | 004、025、037、038、040、042、045、046、054、058、059、060、067、069 | 14 | 空回り、既知失敗、instruction、knowledge、session、resource、model、観測選択、memoization、権利、外部知見を有界に扱う候補 | 旧Skill、provider、model、scheduler、solver、memory、学習機構を継承せず、AI判断をauthorityにしない | os_learning_reapproval |
| 旧CI／Cursor早期運用 | 043 | 1 | 有界Worker委譲・成果回収・独立検証という意味はWorker要求源へ移送済み | Cursor実案件、旧branch／PR／CI／merge経路の早期E2E運用は要求整理中に行わない | rejected_and_moved |
| 将来研究・製品候補 | 068、070、071、072 | 4 | 専門model、学習flow、system生成、反例からの検証器候補 | HELIX-OS current機能、HARNESS必須機能、v1完成条件にせず、対象製品・data・権利・評価要求ができるまで保留 | future_product_reapproval |

合計は36＋17＋14＋1＋4＝72件である。各群のID順序はhistorical sourceのINV identityを保存するためのもので、
採択順や依存順を示さない。

## 旧指示書から継承しない共通前提

1. 最新main、Issue、既存owner、既存IR、実装、consumer、PLAN／PRを要求採否の起点にしない。
2. 既存graph、event／receipt、DB、Authoring／Recovery、scheduler、adapterへ再接続しない。
3. P0で旧CIを改善しP1でCI／Cursor／統合を日常経路にする導入順を採用しない。
4. `adopt／defer／reject／already_covered／needs_requirement_delta`という旧分類で既存実装の温存を決めない。
5. 投資効果、費用、throughput、CI時間の旧baselineを新世代の比較基準にしない。
6. 旧実装が有用でも、意味・反例・判断史をarchive provenanceへ記録し、承認上流から実装を再導出する。

## 新世代での使い方

- 利用者価値・対象・非対象が必要な項目は、HELIX-OSまたは対象製品のL1／L2候補へ戻す。
- 工程・変更・検証・提供の成立条件はHARNESS要求へ、実行・記録・資源・改善はHELIX-OS要求へ分ける。
- CLI、DB、cache、scheduler、model selection、merge、CI等の方式はL3以降で新規設計する。
- 投資候補は要求を補助するsourceであり、要求・設計・実装・受入を一つのINV状態へ畳み込まない。

## 次工程

Concept v4.1と対象別L1／L2の承認後、上記4つの再承認群から必要な意味だけを新しい要求IDへ採否する。
将来研究は個別の利用者・data・権利・評価契約が成立するまで保留する。要求整理が閉じるまでINVをIssue／PLANへ
一括変換せず、旧CI、Cursor、DB、scheduler、既存実装を起動しない。
