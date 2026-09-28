# 旧source起点の条件別再照合：追補記録

## 基準と範囲

本記録は[旧source起点の中間照合](legacy-source-origin-recheck-index-2026-09-28.md)の残差を追う。基準mainは同記録を含む `f4b2a2b02cf5ea3134e27be0a65c100395161bad`（PR #2235のmerge commit）とし、旧原文の行・SHAと本体8機構のPO判断済みL1/L2/L11を照合する。旧sourceに似た現行語句や関連IDがあるだけでは、原文条件の採択済み被覆と判定しない。archive内のworkflow、CLI、hook、runtime、test、CIは実行しない。

この追補は、旧能力・候補を新世代へ自動採択する判断記録ではない。旧sourceの保持、要求候補の起草、人間による採否、L3以降の実装、L11の実行結果を区別する。Web／WEB-OSの1.x材料は今回の本体8機構の合意に含まれない。

## 条件別照合

| 母集団 | 明細と判定境界 | 残余 |
|---|---|---|
| PHCAP-02〜18・20の18能力 | [旧条件→現行要求の照合](phcap18-condition-recovery-audit-2026-09-28.md)と[構造化明細](phcap18-condition-recovery-audit-2026-09-28.json)。旧source 50参照のsource-file SHAと、現行L2/L11の145行別参照ID・行位置を照合。16能力は採択済みL2/L11に関連条項があるが、能力全体の回復とは判定しない。 | PHCAP-08のWBS同等性は不明、PHCAP-15のWeb-OS展開は対象外。現行の実装・受入実行による能力成立は0件。旧consumer閉包と条件単位の正式後継は未確定。 |
| v1.3の521非空行 | [候補母集団の境界監査](legacy-v13-candidate-population-boundary-audit-2026-09-28.md)で行SHAを全件照合済み。追加の意味分類と現行の受け先判定は別明細に分ける。 | 明示IDの有無だけでは被覆を証明できない。 |
| 旧candidateの92文書・4,755行 | [条件の一次分類とroute](legacy-candidate4755-semantic-routing-2026-09-28.md)、[4,755行の構造化明細](legacy-candidate4755-semantic-routing-2026-09-28.jsonl)を作成し、旧原文の行SHAと92文書のfile SHAを全件照合した。870行を暫定的な条件行としたが、説明分類から実際の条件5行を追加発見したため、分類は完全ではない。 | 暫定条件870行のうち141行はsource relationのみで被覆未証明、155行は未採択候補との関係、574行はunknown。説明分類2,959行にも条件が残る可能性がある。行き先不明を「失われた条件0件」へ換算しない。 |
| 確認PR後の25候補 | [候補一覧](post-confirmation-candidate-inventory-2026-09-28.md)を、[PO判断パケット](post-confirmation-25-po-decision-packet-2026-09-28.md)と[25件の構造化明細](post-confirmation-25-po-decision-packet-2026-09-28.json)でsource・版・対L11・影響先ごとに整理した。生存register・receipt・現在の候補本文のdigestは、各receiptの複合節規則に従い25件一致した。 | 25件は全てPO未決。A/B/Cは選択肢、Aは推奨に限る。mergeやreview指摘0件を採択へ読み替えず、後続版の候補を1.0へ前倒ししない。 |

## 次の判定

手順5の終了には、旧sourceの機能・要求・受入・運用保証の各条件に保持／再導出／置換／後続版保全／記録付き廃止の行き先が必要である。今回のPHCAP照合は代表assetにboundedした監査であり、旧4,020資産の全consumer閉包を証明しない。手順6の終了には、未採択候補の採否と最後の総合整理の指摘0件が別途必要である。いずれも本記録だけでは成立しない。
