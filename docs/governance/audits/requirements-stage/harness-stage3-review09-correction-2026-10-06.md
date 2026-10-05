# HARNESS Stage3 review09 Worker補正監査 — 2026-10-06

本文commit `aabfe53aabaad35d265dc9c045184c6db8ffd646`、base `5acae384305b01d10e88eeb2e6406f847baf66df`。正式GitHub comment `IC_kwDOTG8BRc8AAAABZcGRXg` raw body SHA-256 `566da3a02b8c701ff7c53ce9cbd1d732239c56e2f72822a4d8f80358edde7ad6`（22067 bytes）、mailbox response digest `e6c8db4ebbf3f37d6c3e87f5fb1d420a979b8729a7d5068961f0e8d8a14ac311`。finding 53件を本文と照合し、worker修正を記録した。これは独立reviewではなく、Root意味検収前の補正記録である。

## 固定sourceと保持差分

固定L2/L11親別spanは26件を元revisionから再計算し、全文SHA・span raw-LF SHA・literalを照合した。legacy crosswalkは13親行。旧source asset/path/spanのfull SHA・span raw-LF SHA・literalをJSONへ記録した。

036では旧DB669 NFR-13のsprint末集計とPhase A warn-only（89,104–107行）を比較起点として記録し、現行L2/L11に固定値がないためtarget/window/policyへ転記しない。047では旧HIL-FR-60 line 150のworker/verifier provider/model/authority分離を保持しつつ、2026-09-26 PO判断による「同一provider/modelだけでは独立性を決めない」意味差を明示した。

## 本文・CASE照合

FV CASEは1275件、unique 1275件。既存公開CASEを保持し、148件の独立補完CASEを追加した。dangling CASE参照は0件、ID重複は0件。

| 親 | FV CASE数 | review09補完CASE数 |
|---|---:|---:|
| 034 | 221 | 18 |
| 036 | 84 | 13 |
| 038 | 54 | 14 |
| 039 | 90 | 7 |
| 040 | 56 | 16 |
| 041 | 38 | 4 |
| 042 | 36 | 3 |
| 043 | 28 | 3 |
| 044 | 37 | 4 |
| 046 | 36 | 0 |
| 047 | 129 | 35 |
| 049 | 68 | 29 |
| 054 | 87 | 2 |

M1–M26とm1–m27の正式finding本文、disposition、関連CASEはJSONの`formal_review.findings`に固定した。全件statusは「worker correction applied, pending Root semantic review」。

## 6正本pinと未確認

6正本それぞれのfull SHA-256、main prefix SHA/bytes、suffix SHA/bytes/line countはJSONに記録した。main prefix全件がbyte一致。変更対象はFR, FV, NVの3文書。過去Stage3監査は全てbody commit `aabfe53aabaad35d265dc9c045184c6db8ffd646` とbyte一致で不変。`git diff --check` pass。旧runtime/test/CI/Bunは起動していない。

Root意味検収、最新統合木stale/residual、外部レビューは未実施。
