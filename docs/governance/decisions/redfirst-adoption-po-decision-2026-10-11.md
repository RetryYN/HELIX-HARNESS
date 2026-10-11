---
decision_record_id: HDEC-REDFIRST-ADOPTION-2026-10-11
decision_status: recorded
decider_role: PO
decided_at: 2026-10-11
authority_effect: effective_when_this_record_is_admitted_to_main
---

# REDFIRSTのPO採用判断

POは本Codex会話の質問票へ「A：実装前Redを保持（推奨）」と回答した（原文）。提示した質問は次のとおり。

> #1854のREDFIRSTはどちらを採用しますか？ [同じ固定案](https://github.com/RetryYN/HELIX-HARNESS/blob/fa6d06af2f182346dc56a3167a97fe0566e0a867/docs/governance/crosswalks/requirements-resolution-packet.md)のAは、旧FR-L1-02の保証を保持し、015と003工程表を「test/oracle凍結→実装前Red実観測→最小本体実装→Green」に訂正します。実装後mutationは005の別証拠として保持します。Bは既決015の「凍結→実装→Red→Green」で旧実装前Red保証を置換します。既決版と005の5規律は保持し、実装・L3再開は含みません。

対象は固定commit `fa6d06af2f182346dc56a3167a97fe0566e0a867` の `docs/governance/crosswalks/requirements-resolution-packet.json`（file SHA-256 `c609380168c7b5b6d04994135fffb6e1e56db94d5364461e99b9f9733ad79a30`）にある`requirements_stage_gap_decisions`のREDFIRST。作業baseは`9fb6ecc7fb5594edd652caa28be21b6d84cfe26c`。要求identity `HARNESS-L2-015`のunitと対L11だけを採用し、REDFIRSTは従属する003工程表の同一順序整合を含む。固定proposed_textのUTF-8 bytesとLFをそのまま反映し、[receipt](../audits/requirement-registration/redfirst-adoption-coverage-receipt-2026-10-11.json)の前後digestと各editへ束縛する。最新baseの他の採用差分によるfile hashの差を、固定before/proposed textの変更と混同しない。

## 保持点・変更点・理由

旧FR-L1-02はtestコードRed→本体実装Greenという実装前の順序を示す。一方、旧ddd-tdd-rules:23はRedを作成時刻でなく意図した欠陥の実検出と定義し、47-50/137とL7:668のRed-first条件はred_at<=green_atで、本体実装前とは明示しない。TDDORDERは後者を意味起点にした。この2つを旧世代内の異なる記述として保持し、同じ意味だったと補完しない。

AはFR-L1-02の実装前Red順序と旧ruleの実検出/Red-before-Greenを両立させ、TDDORDER015/003の実装→Redを訂正する。旧ruleに明記されなかった本体実装前の観測条件を現行の一律義務として明示するため、旧ruleの単なる完全一致移管とはしない。Bは旧ruleの実検出/Red-before-Greenと既決TDDORDERを保持し、FR-L1-02の本体実装前Redという順序保証を置換する。

理由: 作成時刻/凍結と観測の取り違えを防ぎ、既決の欠陥検出意味を保ったままFR-L1-02の本体実装前順序を保持するため。旧不在/未完成/runtime存在を変更理由にしない。

005追補の「FR-L1-02のRedと本体実装の順序差分は別に保持」は当時未決だった差の保全記述である。その対象差分は本判断のAで解消する。005本文の5規律、版指定と原文保全は不変で、実装後mutationはoracle強度の別証拠に保持する。この記録へ未決表示の対象を接続し、旧表示から現在の採否を生成しない。

既採用4件、015のtest/oracle実装前凍結、005の5規律、003の通常Release Port/既決1.0、その他の既決版を保持し、新規版指定を加えない。採用しなかったREDFIRST Bの意味を採択しない。人のbrand/prototype合意・要件承認・利用者受入、既存操作authorityを本採用から生成しない。

## 原文と登録

固定sourceのpath/行/file hash/span hashを実sourceと旧資産台帳へ照合し、[原文行集合](../audits/requirement-registration/redfirst-adoption-source-lines-2026-10-11.jsonl)へ保全する。差分台帳333件も選択pathへ照合した。原文を実行せず、旧test/CI/runtimeを成功証拠にしない。新しい技術選定はないためresearchは非適用とする。

原文全行は`MPR-SH-REDFIRST-001`の生存pendingへ保全し、要求意味への限定対応と全条件のformal successorを分ける。RC `MPR-RC-HARNESS-L2-015-007`は旧RC `MPR-RC-HARNESS-L2-015-006`を後継し、前行bytesを変えずappend-only登録する。REDFIRSTの003は既決INCIDENTPORT原文28行/holdingと意味を保持し、新原文を加えた累積集合を別entryへ記録する。`registered_proposal`と`no_loss`は管理/限定保全の証拠で、採否はこの人間判断から読む。

## 残る境界

全sourceのformal successor/consumer/schema、実装・内部更新・CIは既存holdingと#1813/#2846に保持する。L3再開・実装・releaseを含まない。要求Stage/対応Issueの終了は独立review側が要望・配置・意味scope・人の確認と行き先の粒度で別に確認する。#1853/#1857のclose許可をこの回答から生成しない。親program #1813/#1814/#1815は別範囲である。
