---
title: "三社レーン動的capacity profile認識候補"
status: draft_candidate
authority_status: pending_canonical_promotion
version: "0.5.0-candidate"
candidate_layer: L12
owner_issue: 1358
plan_id: PLAN-L3-1358-three-lane-capacity-profile-v05
parent_design: docs/governance/candidates/three-lane-capacity-profile-requests.md
pair_artifact: docs/governance/candidates/three-lane-capacity-profile-requests.md
---

# 三社レーン動的capacity profile認識候補

## 3L-BR-010認識条件

- provider別pool profile、active WIP、review queue、CI、Merge Train、budget、reworkの実測projectionが取得できる。
- Cursorが実案件で1→2→3へ段階拡張し、各段階のtime-to-accepted、accepted change cost、差戻し、CI再走、人間介入を比較できる。
- Codex／Cursorの4〜5件目とClaude第3reviewerがtyped admission成立時だけ起動し、条件消失時に定常値へ戻る。
- 下流詰まり時は新規worker dispatchが抑制され、未検収PR数の増加を速度向上として扱わない。
- review lease、差戻しlineage、JIT同期後exact-HEAD receipt、競合解消ownerをgeneration単位で再生できる。

候補文書、Issueコメント、pool設定値だけでは認識しない。runtime接続、独立反例、実consumer episode、DB/read-afterが揃うまでcurrent capabilityへ加算しない。
