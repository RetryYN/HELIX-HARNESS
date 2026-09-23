---
title: "個別要求判断の調査停止境界に関するPO decision record"
decision_record_id: HDEC-RDP-IDENTITY-EVIDENCE-BOUNDARY-2026-09-23
decision: scoped_identity_decision_input
decider_role: PO
decided_at: 2026-09-23
recorded_at: 2026-09-23
source_repository_revision: b0b16ecc63cb5da72c55787e846ca2ae3ab6425c
authority_effect: individual_requirement_decision_input_only
---

# 個別要求判断の調査停止境界

## POの指示

> 「未確認があるから調べる」を続行条件にすると、調査は終わりません。

> 今回の判断に必要な根拠が揃ったら、その調査は止める

> 不明点をゼロにすることが目的ではありません。

> 先に要求とscopeを決めれば、詳しく調べる資産も絞れる。残りは捨てずに未判断で保全すればよく、すべてを先回りして解明する必要はありません。

## 判断の適用範囲

この判断は、`origin/main`の`b0b16ecc63cb5da72c55787e846ca2ae3ab6425c`にある[RDP-001](../requirement-disposition-review-program.md)（SHA-256 `9a341973f3f66fcd8223a354f69553c7f9b096526d2652de906777884675ad59`）の**個別要求identityをPO判断へ送る入口**にだけ適用する。

個別identityでは、原sourceのexact revision、原文atom、対象製品候補、今回の要否・scope判断に影響する意味relationと到達先を記録する。その範囲の原文を無損失に計上し、未解決点と判断への影響を明示する。必要な根拠が揃えば、そのidentityの判断資料をPOへ送って調査を止める。依存先・利用先・過去の障害が見つかったことだけでは、調査対象を自動的に増やさない。判断に影響する新しい原文・relationが見つかった場合だけ、対象を限定して調べる。

全14 source holdingの存在とrevisionは保持し、今回のidentityに該当する可能性を確認する。該当が未判定のholdingを隠して「関係なし」としない。今回の判断を左右し得る未確認sourceがある場合、そのidentityは`unresolved`のまま保留する。関係しないholding・旧資産の未調査は、別の生存中holdingまたは資産台帳に未判断として残し、当該identityの判断資料を無期限に止める理由にはしない。

RDP-001の「全source holdingのatom化・無損失処理」は**program全体の完了条件**として維持する。RDP-001「現在の停止条件」にある全holding未評価だけを理由に、上記の範囲が閉じた別identityのPO判断資料まで一律停止する解釈は、このdecisionで置き換える。RDP本文と、その旧revisionに束縛されたScaffold証拠は変更しない。

この入口から要求の採用・削除・意味変更・successor・L2／L11適用は自動成立しない。個別のPO判断と対象revisionに束縛された要求PRは引き続き必要である。特に`L2D-S1-01`の2026-09-19の`defer`、そのpacket revision、S1–S4の採否順序は解除しない。旧資産の再利用適性は、要求要否・製品scopeの後、L3要件定義で選んだ資産について別に判断する。
