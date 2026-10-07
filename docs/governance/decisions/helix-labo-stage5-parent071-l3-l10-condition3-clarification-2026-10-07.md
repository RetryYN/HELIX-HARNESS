# LABO071 条件3の確認時点に関する追補

状態: 独立照合前。条件3は未確認。

原判断記録: [親071のL3／L10委任判断](helix-labo-stage5-parent071-l3-l10-po-decision-2026-10-07.md)、40512 bytes、SHA-256 `78c2ac3160542126d9055ccd61d92a3014f0107a1df1c21c8bafadbbb50c5d9e`。原記録は変更しない。

## 条件3の時点と既存順序の明確化

この追補は、判断記録本文を改訂せず、表の条件3（27行）と「適用範囲と残る確認」（79行）が示す確認時点を既存の承認委任手順に沿って明確にする。対象は親071のStage 5と、原判断記録が承認対象として固定した同じ本文revision `7320dbaa25a052fa1571d5eae28d620b126d9473`、六本文のSHA-256である。親L2、対象revision、条件1・2・3の要件、委任された承認の範囲は変えない。

条件3で独立review側が読むのは、委任判断記録をPRへ追加した後の、その追加を含むexact PR HEADである。reviewerはそのHEADの六本文を記録済み六SHA-256／bytesと照合し、引用とsource参照も確認する。このrecord-added HEADのread-afterが条件3の確認点であり、元の表にある「main admission直前/後」は、この条件3をmain merge後へ移動する意味ではない。既存運用のlatest merge-admission再照合と、merge後read-afterを指す。

独立review側のrecord-added HEAD確認の後、RootがPRをReady化する。Ready後、review側が最新base、exact HEAD、判断記録の引用、merge admissionとmerge可能性を再照合し、成立していればClaudeが`gh pr merge --merge`で明示mergeする。merge後はread-afterする。判断記録のauthority effectは既存front matterどおり、その判断記録がmainへadmitされた時点で生じる。六本文のrevisionが変わった場合は既存policyどおり条件1・2を新revisionで再実施する。

この追補は、条件3の実施済み・成立、Ready、merge admission、merge、authority effectのいずれも記録または生成しない。条件1・2の成立を再判定せず、レビュー結果やPO確認を追加条件にもせず、対象六本文も変更しない。

## 根拠と照合対象

現行[GitHub上流運用モデル](../github-upstream-operating-model.md)123–140行と[PO委任判断](l3-l10-approval-delegation-po-decision-2026-10-05.md)78–89行による。旧 `archive/legacy-generation-2026-09-14/root/CLAUDE.md` 82–85・195–199行の人間のL3承認責務とAIの自走・独立確認を起点とする意味の再導出であり、既存手順の確認時点を明記する。source spanと全文hash、正式review06/07の取得bodyは[証拠](../audits/requirements-stage/labo071-condition3-clarification-evidence-2026-10-07.json)に固定する。

|本文|bytes|SHA-256|
|---|---:|---|
|`docs/helix-labo/L3-requirements/business-requirements.md`|23554|`2dd7a80e980b398edd0c7c9aadfe3f7ddcf940e01d8a98019e2b87b29df0a68d`|
|`docs/helix-labo/L3-requirements/functional-requirements.md`|322914|`b257cd28667e337282444e9454bed5f77be149ed970521f751b7addcf10b227d`|
|`docs/helix-labo/L3-requirements/nfr-grade.md`|77681|`a74e197f67f7ab76743ee5dbab6495e1d6f871333b7294a33f3ad8103275b578`|
|`docs/helix-labo/L10-verification/business-verification.md`|21287|`9dde43b0f457050a8eb0a7601651413d79642c2e844fef469108c0a6595157d4`|
|`docs/helix-labo/L10-verification/functional-verification.md`|518864|`ce147450d150b5bffd936937e7e28aa7ad23543f10024aba9eed11fac2fde35c`|
|`docs/helix-labo/L10-verification/nfr-verification.md`|67755|`2c369556d4a5c4188fd8e4ddf857e0061a059c108b879883a3d737556a792960`|

元記録の条件1はreview07、条件2はreview06の同一六本文に対するFable判断をreview07が保持したもの。Fable review07再実施を主張しない。fixture未実行。
