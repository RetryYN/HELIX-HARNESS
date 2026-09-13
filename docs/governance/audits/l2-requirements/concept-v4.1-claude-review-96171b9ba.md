# Concept v4.1・対象別L1 Claude意味レビュー

reviewed_at: 2026-09-14
reviewed_revision: `96171b9babef6ce2d9d08089891076edc4be8bbf`
reviewer_runtime: Claude
review_mode: sealed worker contextによるread-only upstream meaning review
verdict: changes_required

旧PR／旧CI／gateは使用せず、Concept v4.1、製品責務決定、承認準備監査、対象別L1候補3文書を
対象に意味レビューを行った。人間承認、ファイル編集、commit、PR、CI、runtime変更はreviewerへ許可していない。

## 所見

| ID | severity | 所見 | 必要な処置 |
|---|---|---|---|
| B1 | blocker | v4.1はComposable ReleaseとContract Compilationを改訂しているのに、v4.0の意味を保持し追加だけと記載 | 原則ごとに保持／改訂／置換と理由を明示 |
| B2 | blocker | L1からL2への接続がL1側だけにあり、L2側に親revision・L1 IDがない | 双方向のsource relationを追加 |
| B3 | blocker | v4.0とv4.1が同じ`document_id`を持つ | v4.1固有identityへ分離 |
| M1 | major | 3対象のL1が`canonical_pair: L12`を宣言する一方、L12接続条件がない | 各L1にL12投影・運用評価条件を追加 |
| M2 | major | L0 charter P0–P9の対象別投影がL1を飛ばしている | 各L1にcharter帰属を記録 |
| M3 | major | 総称HELIXのL2が要求ownerに見える | audit／migration入口と対象別要求ownerを分離 |
| M4 | major | OS L1に個別製品release／deployment／observation統制とprojection再構築がない | L1要求を追加 |
| M5 | major | HARNESS L1に要求形成、合意、freeze、差戻し、再開の要求がない | L1要求を追加 |
| M6 | major | 上流整理期間中のgate authorityと旧CI非利用の関係が未定義 | 文書意味review、静的検査、人間判断の効力を明記 |

minorは、監査根拠の粒度、Vision原文digest、Web側のGitHub非authority、新Conceptの承認bytes固定、
HARNESS配下の旧L13／L14残存であった。修正後は新commitを別revisionとして再reviewし、
本reviewを承認receiptや新revisionの合格証拠へ流用しない。

## 修正版の再レビュー状態

修正版`c74d7c1fb`に対し、sealed worker contextからClaude verifierを2回起動した。1回目は10分、
2回目は対象をB1–B3／M1–M6へ限定して20分のbudgetを設定した。いずれもprovider sessionはread-only参照後に
`outcome:error`で終端し、review本文を返さなかった。したがって本書の旧所見は修正文書上で対処済みでも、
Claudeによる`resolved`判定は未取得である。timeoutをapprove、所見なし、review済みへ変換しない。

修正版ではConcept identity、原則別差分、L1／L2相互relation、L0柱、L12、欠落していたHARNESS／OS責務、
総称HELIXの監査入口、上流整理期間の静的検査境界を変更した。次の独立reviewは`c74d7c1fb`以降のexact revisionを
対象にやり直し、本reviewのverdictを流用しない。
