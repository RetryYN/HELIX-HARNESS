# HELIX-CONNECT 機構内監査の消化（2026-09-27）

## 対象・根拠

- 基準: `main 433b23968dabd8a01d1386ed43726d74b1e92eb2`。消化対象は `HELIXCONNECT-L2-002` と対応する `HELIXCONNECT-L11-002` のみ。変更前はL2 SHA-256 `d4e550eefa2bdb0b9e5b6aa0644db7486cc27bce4662025f3f73b33a7d077ffa`、L11 SHA-256 `b5dcfe5477b91a13e70e8e4e0bc3a020529d5c0c8272af7079befcbb6cceb624`。
- 機構内監査: [`helix-connect-internal-audit-2026-09-27.md`](helix-connect-internal-audit-2026-09-27.md) のL2/L11-002照合行。既存意味は契約版の比較、変更時stale化、再照合まで通信停止。
- SECURITY consumer監査: [`helix-security-consumer-audit-2026-09-27.md`](helix-security-consumer-audit-2026-09-27.md) `:61–76,192–203`。該当所見は「比較結果」と「実送信可否」を分離し、送信時のみ適用中の有効な許可・scope・期限を要求すること。security audit全体のSHA-256は `c1381c588182a36d6860d60816812c184ec522210fc45edc4ab6554bf81d7162`。
- PO原文 `docs/helix-connect/sources/connect-l1-po-original-2026-09-27.md:5`（SHA-256 `a9737c48618f048103879ef1602b82b9800c8b25df884a5d04562a07fcffec1a`）、PO判断 `docs/governance/decisions/connect-l1-po-decisions-2026-09-27.md:24–29`（SHA-256 `fb54e7cc6d1c47381cc396820ab92c2d8806306f28055ac4144e1e02684fa930`）、Concept `docs/concept/helix-concept.md:227`、L1 `docs/helix-connect/L1-planning/connect-intent.md:25–29,45–49` を確認した。変更は疎結合・変更耐性、通信/承認の所有者境界、段階導出を変えない。
- 旧source: L1 `:46–49` が示す `LEGACY-ASSET-C3DE79BA9451172F3E43`（旧L5 product data connector `:33–57,86–109`, SHA-256 `2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04`）、`LEGACY-ASSET-DD66C1B6B7BE234B37E6`（旧L6 function design `:27–57`, SHA-256 `48014b188ebe0c3ffe18b86fa472f048a88e248316bf2b3218aaa605a5e55f42`）、`LEGACY-ASSET-BD13CC67526B48D461F9`（ADR-003 `:8–45`, SHA-256 `ffbe51c4a34cdaf4c072393a0864d916c7a4e1d6eaf4788bb0260e8280291f37`）を読んだ。version/stale境界とpure comparison/外部作用分離を保持し、特定product-dataのruntime/権限方式は再導入しない。

## 消化結果

### 互換性と送信操作を分ける

L2 `connect-requirements.md:69–78` は、互換性照合単体では送信実行用許可を事前条件としない一方、入力の読取りに適用される既存scope/access条件を保持することを明記した。送信適格性は対象の互換成立に加え、actor・target・operation・revision・environment・scope・expiryが合う既存SECURITY許可、および該当するdata-use/classification条件を操作時に照合する。権限が欠落・unknown・期限切れ・scope不一致・失効なら、互換結果を保持したまま送信を保留し、attemptを開始しない。

参照だけの照合では互換性receiptを返し、`send_eligibility=not_evaluated` として、許可の有無を推測しない。読取りaccess条件を満たさない場合は比較結果自体を返さない。既存SECURITY authorityは再利用し、権限の新設や新たな人間approvalは加えない。

L11 `connect-acceptance.md:33,46–52` は、正常例として (a) 読取りscope/access条件下の参照照合が `compatible` でも送信attempt 0件かつeligibility未評価となること、(b) 実送信は有効な操作許可/該当data-use条件もある場合に限りeligibleとなることを区別する。反例は許可欠落/unknown/期限切れ/失効/scope不一致でもcompatibleのみで送信できないこと。未見revisionは明示互換範囲内で比較のみ行い、宣言外/未登録/unknownは保留する。

### 保持した他条件

- 登録とidentity衝突の責務はL2/L11-001に保持し、変更していない。
- 実通信はL2/L11-003、冪等再送/上限/同一内容は-004、traceは-005、片側交換と未完義務handoffは-006、edge全体の技術完了は-007が所有する。-002は実送信や接続操作を開始しない。
- incompatible、unknown、staleのfail-close、revision組合せ別receipt、stale解消に現在の再照合証拠を要する条件は維持した。
- 入力の読取り権限・scope、送信操作許可、data-use/classificationは異なる条件として扱う。参照目的の許可免除は送信実行用permitだけに限り、読取り制御まで免除しない。

## 変更後の固定対象

| 文書 | 変更箇所 | SHA-256 |
|---|---|---|
| `docs/helix-connect/L2-requirements/connect-requirements.md` | `HELIXCONNECT-L2-002` `:67–78` | `31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b` |
| `docs/helix-connect/L11-acceptance/connect-acceptance.md` | 対応表 `:33`、`HELIXCONNECT-L11-002` `:46–52` | `bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad` |

本消化で要求の採択、L3承認、送信権限、実装・運用許可を生成しない。L2-002の訂正revisionと対応するL11被覆receiptを追記し、現行pinを追随させる。過去capture・旧source・他IDの意味は保持する。
