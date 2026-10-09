# FT-GOV-L3STATUS-001

作業種別: 文書の状態表示の更新（意味変更なし）

作業内容: 8機構のL3要件・L10検証・L11受入の正本に残る起草時の状態表示を、現行のauthority状態へ揃える。対象は、題名に残る起草時のStage限定（「— Stage 1（…）」「（Stage 2a）」等）、front matterと本文の状態欄（`status: draft_candidate`／`draft_for_l3_review`、`authority_status: draft_candidate`、`approval: not_approved`）、および各節冒頭の状態行のうち承認状態だけを述べる語句（「未承認」「L3承認前」「候補のみ」等）である。L3／L10は[L3／L10 PO事後確認一覧](../l3-l10-po-post-confirmation.md)のとおり固定1.0 rosterの274親が委任承認済み・PO事後確認済みであり、`delegated_approved`／「委任承認済み」とする。L11は8機構の[L1確定・L2／L11合意](../new-generation-start-here.md)により`po_agreed`とする。

要件・AC・CASE・oracleの本文、対象親、版、owner、および「未承認candidateを依存authorityにしない」等の規則文は変更しない。L10未実行・実装未接続等の実行状態の記述は残す。状態表示の更新は要件の意味を変えないため、承認のやり直しを要しない。

経緯: 2026-10-09、Claude（lane `review_merge`）が状態行を判断記録より優先して読み、承認済みのOS L2-014を未承認と誤って報告した。POは事実確認を先に行うこと、状態表示を全て洗い出して更新すること、本文の書き換えは承認のやり直しにならないことを指示した。
