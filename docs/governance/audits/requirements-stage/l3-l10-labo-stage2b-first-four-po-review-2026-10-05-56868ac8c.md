# HELIX-LABO Stage 2b 002/003/004/005 L3/L10作成側確認資料（2026-10-05）

対象本文revision `56868ac8c1eb8bc100b1d261119111b0ce22bc42`。採択parent 4件、FR 4・AC 12・機能CASE 30。L3未承認、L10未実行。独立reviewと対象revisionのPO判断は未実施。

相関episode、構造分解、守破離比較、12種の変換candidateを固定L2/L11の意味から起草しました。episodeの孤立/欠測、元eventを保つrelation訂正、分類軸ごとのunknown/反証、七比較軸と条件差、candidateの非権威性をcaseで検証します。source authority、Worker選定/割当/資格、operation採択・実行・retireをLABOへ移していません。Stage1とStage2a本文のprefixは全6正本でbyte一致です。

旧HELIX-Benchと対L10から失敗・欠測を隠さない意味、FR+ACとsystem-level verificationのtraceを再導出し、旧taxonomy/metric/provider順位/scorer/protocol/runner/admission/thresholdは持ち込みません。NFRは固定親のfield/state/operation identity fidelityと、planned synthetic試行のdisposition・latency/throughput測定候補です。固定閾値やparameter別承認は設けません。

|正本|SHA-256|
|---|---|
|`docs/helix-labo/L3-requirements/functional-requirements.md`|`6a04d7a3e0c5605edda0916536f351fd8c4f4fe48c3964bcf0a16636523b9e27`|
|`docs/helix-labo/L3-requirements/business-requirements.md`|`750843fb87bd8a7a3eb9afab6508cc5db658926adc1c500005b3e286a5db3df1`|
|`docs/helix-labo/L3-requirements/nfr-grade.md`|`c3cffff8137e7bef8e72722b2116e014f858c6623981b1718780dd5b56184820`|
|`docs/helix-labo/L10-verification/functional-verification.md`|`6203d52f44a8fbab51b47e8caad5549af9a43911f00a44fcfcfb04334fc9fe43`|
|`docs/helix-labo/L10-verification/business-verification.md`|`ff9e43ba3f1bd4c57a6c49e0fe233aeb87e49c423a8d5d92f26aca3926a18205`|
|`docs/helix-labo/L10-verification/nfr-verification.md`|`d04742d37592f52a857c8a611525b9569b34126bc0f228408f5a9a8bd359407b`|

静的記録：[audit](l3-l10-labo-stage2b-first-four-static-validation-2026-10-05-56868ac8c.json)。28 source pinをimmutable Git revisionと実在行からraw bytesで照合し不一致0。Scaffold validation 147件 fail 0、stale 0、residual 0、govcheck atoms=7622/requirements=57/files=58、diff-check合格、全ID参照解決、prefix 6/6一致。旧runtime/test/CI/Bunは実行していません。
