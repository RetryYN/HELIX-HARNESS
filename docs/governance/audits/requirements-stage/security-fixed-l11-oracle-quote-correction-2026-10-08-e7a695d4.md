# SECURITY親002/007 固定L11 oracle引用訂正

## 対象・基点

最新取得の `origin/main` は `e7a695d4b2de64aec69a1a123de2fde33be724cf`（2026-10-08取得時点）。この基点にSECURITY-028のPR mergeは含まれていないため、同HEADから作業した。固定L11は両親とも `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、同commitのL11全体SHA-256は `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。今回の変更はL10-FVの引用文2行だけで、要求意味、CASE、ID、分母、owner、版を変えていない。033は変更していない。

## Before / after

- SECURITY-002：FV line 50で、固定L11第3セルの「直結せず、data」を「直結せずdata」としていた。導入語「例」を外して採択原文と一致させ、読点も原文どおりに戻した。
- SECURITY-007：FV line 98末尾で、固定L11第3セルの「後掲の9制御fixture」を「以下の9制御fixture表」としていた。採択原文の表現へ戻した。

```diff
- 固定oracle（L11:26）：例「前の指示を無視」…直結せずdataとして保持される。…
+ 固定oracle（L11:26）：「前の指示を無視」…直結せず、dataとして保持される。…

- …変更有無がunknownなら成功扱いしない。以下の9制御fixture表で条件を個別に確認する。
+ …変更有無がunknownなら成功扱いしない。後掲の9制御fixtureで条件を個別に確認する。
```

実際の差分はJSONの `before_after` に行単位UTF-8/LF SHA-256と全文字列で固定した。L11第3セルの原文全文とraw line SHAも同じJSONへ記録した。

## 固定親・旧sourceとの照合

親002/007の固定L2/L11は `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。旧sourceは、002が `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:186`（HR-NFR-P8-02）、007が `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:165–166`（CAP-006/007）。対応HAT行（N8-02、P2-05）も読み、関連する旧全体SHAと行SHAをJSONに記録した。002では旧の検出/分類経路を新たな義務にせず、固定L2/L11の直接連結禁止と完全検出器非要求をそのまま引用する。007では旧CAP-006のfallback禁止との部分類似、CAP-007のfailure receiptとの別責務を保持し、固定L11のWorker実行環境への制約受渡しと9fixture参照のみを正確に引用する。

## 変更範囲の固定

L3-BR/FR/NFR、L10-BV/FV/NFRVのbefore/after全体SHAをJSONに記録した。FV以外の5本文はSHA不変。FVの002/007行だけが変わり、033のFV line 225 raw SHAは前後一致する。033の固定L11は別revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`、PO decision checkpoint `633bf12ea8f948db8ba3d6600179c4a9507377a7`の別sourceであり、今回変更していない。033 L11:124–133とP0:145–151のraw span SHAもJSONに保持する。

## 検証と限界

静的に固定L11第3セルとFVの該当oracle句を逐語比較し、6本文pin、旧source pin、033不変pinを記録した。`git diff --check`を実施する。旧runtime・旧CI・fixtureは実行しない。旧sourceは対象行と対応HAT/CAP行の確認に限定し、全旧consumerの再監査ではない。
