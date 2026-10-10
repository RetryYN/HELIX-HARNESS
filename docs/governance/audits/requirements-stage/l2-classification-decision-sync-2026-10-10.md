# 分類台帳の既存PO判断への追随照合

9/28に合意済みのHARNESS-L2-001〜009、HELIXOS-L2-001〜011の主L2表行と対L11表行について、分類台帳に残る`draft_unadopted`を`approved_revision`へ訂正した。計20件40行が固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の承認対象行と完全一致する。

[機械照合証拠](l2-classification-decision-sync-2026-10-10.json)には、作業base、decisionと固定sourceの本文SHA-256、現在/固定の行番号、行原文と行hash、台帳変更前後のhashを収録した。台帳の`authority_projection_scope`は主L2/対L11表行だけを対象とし、同IDの後続追補へ承認を広げない。要求状態の根拠は既存decisionであり、この監査や台帳から承認を生成しない。

## 保持する状態

37件の順序・identityと分類語彙・provisional印は不変。変更前recordを`previous_classification`へ保持した。残る17件の行bytesは不変。分類の出典`classification_source`は維持し、要求状態表示の出典は別fieldへ記録した。OS012/013のLABO保持候補とWebのVision材料は今回の訂正対象外である。

旧sourceのsuccessor被覆、holding解除、L3以下、実装・実行・受入、要求ステージ完了、Issue closeはこの照合から成立しない。過去の監査snapshot、append-only register、要求/L11本文、PO判断記録とBindingは変更しない。

## 旧HELIXとの対応

旧`archive/legacy-generation-2026-09-14/root/docs/governance/operations-rule-audit-2026-07-26.md:38–39`のORA-005/006を起点に、正本と表示の乖離を正本へ収束させる目的を保持する。旧marker/runtimeを移植せず、新世代の固定PO decisionと行bytesを静的照合する。理由は、対象revisionの採用と他の状態軸を分け、既決内容の表示だけを訂正するためである。

## 検証

20件のL2/L11計40行は固定sourceと一致。4固定sourceの全bytesのSHA-256は両PO判断記録の値と一致。台帳は37件の順序を保ち、17件は行bytes不変、20件は以前のrecord全体を保持。分類・authority_effect・meaning_change_appliedの不変を確認した。独立review・mergeの結果は対象PRへ記録する。
