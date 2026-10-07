---
title: "HELIX-HARNESS Stage 3 親054 L3/L10委任承認 decision record"
decision_record_id: HDEC-HARNESS-STAGE3-PARENT054-L3-L10-DELEGATED-2026-10-07
decision_status: recorded
decider_role: "PO（委任：Opus・Fable一致）"
decided_at: 2026-10-07
recorded_at: 2026-10-07
review_base: 03d9cd19dfb92dc7dda74c8cb50f85dc320c873c
reviewed_content_head: 2254c2458fc088e06561a5a10874744012f3a5ff
reviewed_content_revision: 3f8dd46b933cec2f1733d98e17cc30e046d6bb06
authority_effect: effective_when_this_record_is_admitted_to_main
---


# HELIX-HARNESS Stage 3 親054 L3/L10委任承認

対象は採択済み`HARNESS-L2-054`、登録`MPR-RC-HARNESS-L2-054-001`、Stage 3、`version_target: 1.0`のL3要件とL10総合検証設計に限る。要求の意味・範囲・担当・版を変更しない。

## 委任判断の根拠

正式review05 [comment 6027399367](https://github.com/RetryYN/HELIX-HARNESS/pull/2646#issuecomment-6027399367) は、exact base `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`、HEAD `2254c2458fc088e06561a5a10874744012f3a5ff`、本文revision `3f8dd46b933cec2f1733d98e17cc30e046d6bb06`について、OpusシンプルブラインドMajor 0、Fableの結論『承認してよい』、Opusの支持を記録する。同comment内でreviewerは委任条件1・2がこの本文revisionでそろったと結論している。comment bodyは5231 UTF-8 bytes、SHA-256 `fbd55323091d42597057cd0606a788a82e85412cf2be8637a6d6f737d59c6439`。formalにMinor件数の記載はないため、本記録ではMinor 0を付加しない。
mailbox inspectは別source `RH-PR2646-HARNESS-STAGE3-PARENT054-05`で、同一base/HEAD、`result=no_findings`、findings 0、unreviewed 0を返す。mailbox `authority_effect=none`であり、PO承認を生成するsourceとして使わない。raw inspect JSONとdigestは根拠bundleに含む。

委任規則の正本は[2026-10-05 PO委任判断記録](l3-l10-approval-delegation-po-decision-2026-10-05.md)（revision `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`、6210 bytes、SHA-256 `9028384fe51660c6785dc55e034bbd887702fd53b00bd9fd16641e7b6d8c2220`）と[GitHub上流運用モデル §L3／L10承認の委任](../github-upstream-operating-model.md#l3l10承認の委任)（同revision、53710 bytes、SHA-256 `eed2b774bb78545ac53c7d55f3ae3ab4e9c4f421b4eaf3ac3bcdbcdd869dd27b`）である。

## 採択親と固定source

既存の[親047委任decision record](helix-harness-stage3-parent047-l3-l10-po-decision-2026-10-07.md)（revision `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`、10635 bytes / SHA-256 `0324037c0f265817db8b24699371bf8e9903d6654a4ffd899cafe233d4a1c147`）はfrontmatter・main admission effect・条件3未確認の記録形式のみ参照する。親047の承認を054へ継承しない。

固定親の実source revision `5aa100319361b0cc86edd3c51815ec777d55410a`。[L2-054 source](../../helix-harness/L2-requirements/product-requirements.md)の物理行1154–1162は4652 bytes / SHA-256 `b76b7b1adec804a25bd9333663aa9b0d074f68518764c2874c994bcdf6ead193`、全体は295676 bytes / SHA-256 `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108`。[L11-054 source](../../helix-harness/L11-acceptance/product-acceptance.md)の物理行865–875は3239 bytes / SHA-256 `5d1ab0bad44ae305053932f0c82bcf472e145046125b638f5facab13eaaa2aa0`、全体は202050 bytes / SHA-256 `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7`。
| 固定source | revision | physical span | bytes | SHA-256 |
|---|---|---:|---:|---|
| L2-054 | `5aa100319361b0cc86edd3c51815ec777d55410a` | 1154–1162 | 4652 | `b76b7b1adec804a25bd9333663aa9b0d074f68518764c2874c994bcdf6ead193` |
| L11-054 | `5aa100319361b0cc86edd3c51815ec777d55410a` | 865–875 | 3239 | `5d1ab0bad44ae305053932f0c82bcf472e145046125b638f5facab13eaaa2aa0` |

PO採択行は[po-decision-2026-09-29-11candidates.md](po-decision-2026-09-29-11candidates.md)の34行。source commit `b0b0719dfe786370e9bee48c5d2f753710546b6f`の全体は11472 bytes / SHA-256 `57419892406b5fa0c439d47d5ce6782edaed9585beba8759e2704b9548a54959`、physical rowは585 bytes / SHA-256 `5ad1167ad45d7f2befba1423f20dd5ffc0d9e4c2c5846f913b8174f836d17a7d`。同一rowはreview base `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`でもbyte一致する。PO rowが固定するL2/L11 document full SHAとspan SHAは上記sourceに一致する。取得source revisionは固定parent revisionとは別であり、両者を混同しない。

## 承認対象の六本文

formal review HEAD `2254c2458fc088e06561a5a10874744012f3a5ff`と本文commit `3f8dd46b933cec2f1733d98e17cc30e046d6bb06`で六実blobを再取得し、全六文書のbytesとSHAが両revisionで一致することを確認した。

| 本文 | bytes | SHA-256 |
|---|---:|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | 19117 | `febb90354052621f8203d82dd9f5ba749f9784208b80e4ba37db31d7938dc4cb` |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | 228406 | `d0c741ba4f94d47d99674689d9e9d68331eee2a2b216790323f368c76e68dfd0` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | 50710 | `a78cd4ec0349265d595c209b65d6b6ffa62c0fea4aeb40199bb47b1c9bd71115` |
| `docs/helix-harness/L10-verification/business-verification.md` | 15525 | `91bad8e42f66c91d47fd8ce5b318e2cedad4ff36dce763f1088890e618962a27` |
| `docs/helix-harness/L10-verification/functional-verification.md` | 874751 | `51f1ba615a31cdaa04e70f1ffe295725d62915703a1cd12f344110da2d9a876c` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | 44053 | `5c1a1e2ffc287b5aa1adc3ca670d6c5e18c69689d89ad01cc90505d938a92579` |

## 条件3と次の状態

委任条件3（decision recordを追加した後も、承認対象6本文のbytesが変わっていないこと）は未確認である。記録追加後に独立review側がexact HEADを読み、固定親・正式根拠・残余原文・6本文不変を照合するまでReady化しない。条件3が満たされた後、最新base・merge admission・merge可能性を再照合する。この判断記録のauthority effectは、当該判断記録がmainへadmitされた時点から有効となる。

fixtureは実行していない。実測、L10実行合格、実装完了、release、Issue close、要求意味の変更、他親・Stage・revisionへの承認拡張を主張しない。

## 旧HELIX sourceと過去監査

旧HELIXの自律境界は`archive/legacy-generation-2026-09-14/root/CLAUDE.md`（`LEGACY-ASSET-6EBDB617A8104A7756D0`）82–85行にあり、人が要件を承認しAIが起草する境界を保持する。195–197行は旧runtime運用の記録であり、実行・fallbackには使わない。現行の委任手続きは上記2026-10-05 PO判断に従う。

レビュー履歴・旧source根拠は[review04 postbody audit](../audits/requirements-stage/harness054-review04-postbody-audit-2026-10-07.json)（1541862 bytes、SHA-256 `18d3d580e504ffea78032a67fe64f8db8022c038aa2219b84f2f5870bf445518`）を参照する。旧100 CASE raw literal、25 source/consumer pins、正式review前時点の証拠をそのまま保持し、新記録で再分類・書換えしない。

根拠bundleは[`harness054-l3-l10-decision-evidence-2026-10-07.json`](../audits/requirements-stage/harness054-l3-l10-decision-evidence-2026-10-07.json)に保存されている。bundleは112866 bytes、SHA-256 `f3c2bcd37b2861d2e6d58a56fdd3389f8e1ec2e0eaf17a7b18fec8a2aad12ec2`。全review01–05 bodyとR残余sectionのraw、固定parent/PO row、六本文pin、mailbox inspectの別sourceを含む。

## 正式review01–05のraw body

以下は正式review comment bodyを取得したUTF-8 bytesから復元し、時点の文面をそのまま保持する。R番号や過去判定を現在のfindingとして再解釈せず、原文にない欠番を補作しない。各bodyのbytes/SHAは隣接bundleに記録する。

### comment 6024625350 — 5273 bytes / SHA-256 `00e7ef622b3158215aec6f410cfc39ef2177127cb973dddfdb7f47ed88551b6a`

````text
## review01（independent review、PR #2646 親HARNESS-L2-054、HEAD b8ba5af24707e5d48eee8b786f9ad87ea4dd4fa3、base main ceda1c53b）：Major 2

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2646-HARNESS-STAGE3-PARENT054-01` に応える。

### 本文を評価する前の確認（採択記録・対象版・追補条件）
- **採択記録**：11候補記録（po-decision-2026-09-29-11candidates.md）の34行が、`MPR-RC-HARNESS-L2-054-001`を採択している。git grepで、後日の別採択がないことを確かめた。
- **対象版**：固定親は記録用main `5aa100319361b0cc86edd3c51815ec777d55410a`である（L2:1154–1162、L11:865–875）。
  - **file SHA-256**：L2 `45955ffb…`、L11 `216a8dcc…`。reviewerが計算し、34行と一致した。
  - **節SHA-256**：L2 `b76b7b1a…`、L11 `5d1ab0ba…`。ブラインドが計算し、34行と一致した。
- **追補条件**：11候補記録で054が出てくるのは34行だけで、054だけに付いた条件はない。
  - 表の後ろの注記は、038/053だけに関わるものである。
  - 依存先の047は、57候補記録52行の条件付きA配置である。本文の「別親・意味不変」と矛盾しない。
- **base整合**：merge-baseは依頼のbaseと一致し、削除行は0である。
- **条件付きの戻し先**：0件。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - origin/mainとの`merge-tree`は衝突なし

### 照合の経過
1. **Opusシンプルブラインド**：Major 2。Majorがあったので、Fableへは回していない。
2. **reviewerの確認**：固定L2:1158「型付きhandoff結果」の全文を読んだ。054節のCASEを「比較根拠」「既存role参照」「再照合に必要」でgrepし、該当するoracleがないことを確かめて、2件ともMajorと確定した。

### Major
**M1（`existing_role_sufficient`の出力に、対象既存roleと比較根拠があるかを照合していない）**
- **欠陥**：
  - 正常のc01（functional-verification.md:1768）の判定は、「OS発行として認識し、追加specialist生成なし」だけである。
  - `existing_role_sufficient`の出力が持つべき「対象既存role参照」と「比較根拠」の値は、照合していない。
  - これらを単独で欠落・別値にするCASEもない。r18-new-contract-onlyとr04-comparison-target-missingは、別の要素（新contractの生成と、入力側の比較対象）を扱っている。
  - そのため、role参照や比較根拠のない`existing_role_sufficient`が合格する（類型4）。
- **守るべき行**：固定L2-054（5aa10031 product-requirements.md:1158）「`existing_role_sufficient`は対象既存roleと比較根拠を示し」

**M2（`unknown_or_defer`の出力に、再照合に必要な入力があるかを照合していない）**
- **欠陥**：
  - unknown/deferを扱うCASE（:1725、:1748、:1775 c08など）の判定は、「unknown/defer保持」と「戻し先owner」だけである。
  - 出力が持つべき「再照合に必要な入力」は、正常判定でも単独CASEでも照合していない。
  - B0（:1655）にも、`unknown_or_defer`出力の正常値がない。
  - そのため、再照合入力を欠いたdeferが合格する（類型4）。
- **守るべき行**：固定L2-054（product-requirements.md:1158）「`unknown_or_defer`は不足・不確実・stale条件、担当owner、再照合に必要な入力を示し」

### 後で直す残余（承認を止めない）
- **R1（戻し先の余地）**：r05-source-revision-missing（:1748）は、「無条件で戻す」としながら「機構区分が特定不能なら区分不明」も認めている。戻し先が決まらない余地が残っている。区分不明の場合でも、既知の候補区分へ返す形にすることを勧める。
- **R2（契約の集合とreference）**：
  - `muster_candidate`で契約が複数ある場合の「集合とdigest」を確かめる単独CASEがない。
  - typed contract reference単体の欠落CASEもない。digest欠落のCASEで、間接的に覆われるだけである。
- **R3（digestの言い換え）**：L3の「input/output digest」は、L2の「入力digest/contract digest」の言い換えとして少し広がっている。意味は変えていない。
- **R4（muster出力の値）**：c03の正常判定は、muster出力の比較対象とevidenceを値として照合していない。入力側のr04/r05単独CASEで、間接的に覆われる。
- **R5（前置き節の重複）**：同一の前置き節が、5ファイルに重複している。

### 次の手順
- **M1**：c01の正常判定に、`existing_role_sufficient`出力の対象既存role参照と比較根拠が入力と一致することの照合を入れる。または、それぞれを単独で欠落・別値にするCASEを置く。
- **M2**：`unknown_or_defer`の正常値をB0に置き、再照合に必要な入力の照合を判定に入れる。または、それだけを欠落させる単独CASEを置く。
- 直した後のHEADで、もう一度依頼してほしい。

````

### comment 6025288166 — 6210 bytes / SHA-256 `92fda6321c32a0959084954b405a512a4864cf0c736b7ae2f258bbcedb94a394`

````text
## review02（independent review、PR #2646 親HARNESS-L2-054、HEAD 192becd35eccc285cab875f01bfa1641308fe3fe、base main ceda1c53b）：Major 3

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2646-HARNESS-STAGE3-PARENT054-02` に応える。

### 事前確認と静的検査
- **採択記録**：11候補記録34行（`MPR-RC-HARNESS-L2-054-001`）。後日の別revisionの採択はない。
- **固定親**：記録用main 5aa10031（L2:1154–1162、L11:865–875）。
- **base整合**：merge-baseは依頼のbaseと一致し、削除行は0である。
- **条件付きの戻し先**：0件。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - origin/mainとの`merge-tree`は衝突なし

### 照合の経過
1. **review01の解消の確認**（reviewerが差分で確かめた）：M1とM2は解消した。
   - `existing_role_sufficient`の対象既存role参照と比較根拠を、c01の正常判定で値として照合するようになった。単独CASEとして、c13〜c16（欠落と不一致）が置かれた。
   - `unknown_or_defer`の再照合に必要な入力を、正常deferのc19で照合するようになった。単独CASEとして、c17/c18が置かれた。
2. **Opusシンプルブラインド**：Major 3。Majorがあったので、Fableへは回していない。
3. **reviewerの確認**：固定L2の1158行と1160行、L11の870行と875行の原文を読んだ。054節のCASEを「集合」でgrepし、3件ともMajorと確定した。

**reviewer側の誤り**：M1は、review01で残余R2（「`muster_candidate`で契約が複数ある場合の『集合とdigest』を確かめる単独CASEがない」）としていた点である。固定L2の出力要素なので、review01でMajorとすべきだった。分類を誤ったので、ここで訂正する（#2644 review02と同じ誤りである）。

### Major
**M1（複数contractの「集合とdigest」が落ちている）**
- **欠陥**：
  - L3は、muster出力を「契約参照とそのinput/output digest」の単数形に狭めている。該当箇所は次のとおりである。
    - business-requirements.md:139
    - functional-requirements.md:731（AC-01）、733（AC-03）
    - nfr-grade.md:205
  - L10のB0とc03は、単一の`contract-ref-054-a`だけを使っている。054節のCASEに、「集合」の語は0件である。
  - 集合の一部が欠ける、集合digestがない、別の集合になる、のいずれについても、判定する正常fixtureも単独CASEもない。
  - そのため、複数contractのmusterで集合が不完全な出力でも合格する（類型3・4）。
- **守るべき行**：固定L2-054（5aa10031 product-requirements.md:1158）「`muster_candidate`は047のruntime-neutral specialist Worker contract参照（複数の場合はその集合とdigest）…を伴う」

**M2（digest・OS受領記録・contract生成receiptからのauthority・実行許可・起動・受入の生成に、単独の拒否CASEがない）**
- **欠陥**：
  - **contract digest → authority/実行許可**、**OS受領記録 → authority/実行許可**：c03の正常判定が文中で「receipt/digestから推定しない」と書くだけで、変異CASEがない。
  - **contract生成receipt → Worker起動**、**contract生成receipt → 成果受入**：単独CASEは、r09-001（assignmentへの誤分類）だけである。CASE-25と27の対象は「candidate/handoff」で、receiptを単独で変異させていない。
  - 固定親が禁じる生成に、拒否fixtureがない（類型2）。
- **守るべき行**：
  - 固定L2-054（product-requirements.md:1160）「HARNESS handoff、tool/path候補、contract digest、OS受領記録は…」authorityや実行許可を発生させない。
  - L11-054（product-acceptance.md:870）「contract生成receiptをassignment・authority・Worker起動・成果受入として数える…」例は不成立とする。

**M3（L11「受入境界」の禁止に、単独の拒否CASEがない）**
- **欠陥**：
  - source/coverage receipt、候補本文、fixture、OS記録例の存在から、次のものを生成する変異のCASEがない。
    - oracle実行/合格
    - 実runtime projection
    - assignment
    - security許可
    - 利用者受入
  - c11とc12が扱うのは、handoff receiptからの要求採択とL3承認だけである。
  - 固定親が禁じる生成に、拒否fixtureがない（類型2・4）。
- **守るべき行**：L11-054（product-acceptance.md:875「受入境界」）「source/coverage receipt、候補本文、fixture、OS記録例の存在はoracle実行、実runtime projection、assignment、security許可、利用者受入、要求採択、L3承認を示さない」

### 後で直す残余（承認を止めない）
- **R1、R3〜R5**：review01から変わらない。
- **R2**：M1へ繰り上げた。
- **R6（担当ownerの置き換え）**：L2の「担当owner」を、L3は「既知の責務区分＋個体identity unknown」に置き換えている。c19で区分値を照合している。
- **R7（適用条件の値）**：「入力digest・適用条件に結ぶ」のうち、「適用条件」がB0の値として固定されていない。c07が、scopeの束縛を代わりに照合している。
- **R8（範囲・形式の注記）**：次の注記には、単独CASEがない。
  - 「未知値を別軸へ畳み込まない」（L11:869）
  - 「assignment/resultの記録はHARNESS contractの意味・oracleを変更しない」（L11:867）
  - 「047・OS・SECURITYを変更・代替しない」

### 次の手順
- **M1**：L3のmuster出力に、「複数の場合は契約参照の集合と集合digest」を戻す。複数contractの正常fixtureを置き、集合の一部欠落、集合digestの欠落、別集合への差し替えを、それぞれ単独のCASEとして置く。
- **M2・M3**：上に挙げた生成のそれぞれについて、その1つだけを変異させて拒否する単独CASEを置く。
- 直した後のHEADで、もう一度依頼してほしい。

````

### comment 6025994726 — 6352 bytes / SHA-256 `b2c7a0dcead66f6f69500c5761c7371a4468a0723fbe39c7f22f22348be70d7b`

````text
## review03（independent review、PR #2646 親HARNESS-L2-054、HEAD 524d50f00b81395a48856313c334149a0bf32ddd、base main 0acbed34b）：Major 2

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2646-HARNESS-STAGE3-PARENT054-03` に応える。

### 事前確認と静的検査
- **採択記録**：11候補記録34行（-001）。後日の別revisionの採択はない。
- **固定親**：記録用main 5aa10031。file SHAと節digestは記録値と一致する。
- **base整合**：merge-baseは依頼のbase（0acbed34b）と一致し、削除行は0である。041節とのID衝突はない。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - `merge-tree`は衝突なし

### 照合の経過
1. **review02の解消の確認**（reviewerが本文修正commit a66908edcで確かめた）：
   - **M1**：解消した。c03の正常判定は、複数contractの集合と集合digestを照合する。単独の反例として、c20〜c22が置かれた。
   - **M2・M3**：review02で列挙した項目について、c23〜c34の単独拒否12件が置かれた。
2. **Opusシンプルブラインド**：Major 2。禁止の全件照合、閉じた列挙の一致、前回までの残余R1〜R8の洗い直しを含めた。Majorがあったので、Fableへは回していない。
3. **reviewerの確認**：該当3行の戻し先の原文、固定L2の1155、1156、1158、1162行、L11の869、870、873、875行を読んだ。下の判定とした。

**reviewer側の誤り**：
- **M2(b)**：review02のM2で、L11:870の4項目（assignment・authority・Worker起動・成果受入）のうち、「contract生成receipt→authority」を挙げ漏らしていた。
- **M2(c)**：「軸を落とす・未知値を別軸へ畳み込む」を、これまで残余R8（範囲の注記）としていた。これは推測による変換であり、状態の推測にあたる。そのため、Majorへ繰り上げる。

### Major
**M1（戻し先が決まらないCASEが3件ある。旧R1を含む）**
- **欠陥**：
  - **r05-source-revision-missing**：「無条件で戻す」としながら、「区分不明と個体unknownを分けて記録し推測しない」を許している。これは、区分を特定できない場合に返却を止める例外の形である。
  - **r02-unseen-drive**：戻し先が「上流契約へ戻す」で、機構を指していない。
  - **root-04-dependent-stale**：「既存ownerへ戻す」としか書いておらず、宛先が決まらない。
  - 3件とも、宛先が決まらないまま終わる（類型1）。
- **守るべき行**：
  - 固定L2-054（5aa10031 product-requirements.md:1162）「欠落や不一致…は保留し、理由を該当ownerへ戻す」
  - 同1158行（`unknown_or_defer`の「担当owner」）

**M2（禁止列挙のうち、単独の拒否CASEがない項目）**
- **欠陥**：
  - **(a) 採択・L3承認・Worker起動**：source/coverage receipt、候補本文、fixture、OS記録例の存在から、要求採択またはL3承認を出す変異の拒否CASEがない。
    - c29〜c34は、採択・承認を扱っていない。
    - c11/c12は、handoff receiptを起点にした変異だけである。
    - nfr-grade.mdの列挙からも、採択・承認が落ちている。
    - 仮登録・候補本文から、Worker起動を出す変異の拒否CASEもない。
  - **(b) contract生成receipt→authority**：contract生成receiptをauthorityとして数える変異の拒否CASEがない。
    - c23/c25は、digestとOS receiptが起点である。
    - c27/c28は、起動と受入だけである。
  - **(c) 軸の落とし・未知値の畳み込み**：軸を落とす変異と、未知値を別軸へ畳み込む変異の拒否CASEがない。c08は、推定値による成立だけを扱っている。
  - 固定親が禁じる生成と推測に、拒否fixtureがない（類型2）。
- **守るべき行**：
  - L11-054（product-acceptance.md:875）受入境界「…要求採択、L3承認を示さない」
  - 同870行「contract生成receiptをassignment・authority・Worker起動・成果受入として数える…例は不成立」
  - 同869行「未知値を別軸へ畳み込まず」
  - 固定L2:1155「仮登録・候補本文は…Worker起動を生成しない」
  - 同1156行「軸を落としたり別値へ推定変換せず」

### 後で直す残余（承認を止めない）
- **R1**：M1へ繰り上げた。
- **R2、R4**：解消した。
- **R3、R5〜R7**：変わらない。
- **R8**：一部をM2(c)へ繰り上げた。残りは、「assignment/resultの記録はcontract意味を変更しない」「047・OS・SECURITYを変更・代替しない」の範囲の注記である。
- **R9（見出しの配下）**：054節の「採択本文の固定」行が、親041のH2見出しの配下に置かれている。041のpinと読み違えられる。
- **R10（戻し先の機構名）**：r03-source-revision-changeの戻し先「source authorityを定める既存owner」には、機構名がない。M1を直すときに、合わせて機構区分を書くことを勧める。
- **R11（oracle由来の判断）**：「TeamDefinition相当の集約表現」「layer/drive厳密mappingの必要性」の判断を、本oracleから生成しないこと（L11:873）に単独CASEがない。設計判断の注記なので、残余とする。
- **R12（provider/modelの肯定方向）**：「provider/modelの違いだけで独立と判定する」肯定方向の単独CASEがない。#2644（047）review03 M1と同じ点である。047側で直したら、054でも合わせることを勧める。

### 次の手順
- **M1**：3件の戻し先を、固定親の機構区分（HARNESS process/axis-source、OS、LABO、INTELLIGENCE、SECURITY、要求owner等）のうち原因に当たるものへ決める。個体identityが不明でも、既知の区分へは返し、個体identityだけを別fieldでunknownとする。
- **M2**：(a)〜(c)の各項目について、その1つだけを変異させる単独の拒否CASEを置く。nfr-grade.mdの列挙にも、要求採択とL3承認を加える。
- 直した後のHEADで、もう一度依頼してほしい。

````

### comment 6026691451 — 6874 bytes / SHA-256 `c4e581aac9e2bc0c0aa1317eeff6054ae00c0822535808dddd940b7531f2cf51`

````text
## review04（independent review、PR #2646 親HARNESS-L2-054、HEAD 50e8292d6cd4156818940ea4904bdc9c1effb62f、base main 0acbed34b）：Major 3

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2646-HARNESS-STAGE3-PARENT054-04` に応える。

### 事前確認と静的検査
- **採択記録**：11候補記録34行（-001）。後日の別revisionの採択はない。
- **固定親**：5aa10031。file SHAは一致する。
- **base整合**：merge-baseは依頼のbase（0acbed34b）と一致し、削除行は0である。
- **条件付きの戻し先**：0件。review03 M1のr05の「区分不明」の書き方は、消えた。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - `merge-tree`は衝突なし

### 照合の経過
1. **review03の解消の確認**（reviewerが差分で確かめた）：
   - **M1**：解消した。3件の戻し先が、原因別の区分になった。r03の宛先も、HARNESS process/axis-sourceになった。
   - **M2**：review03で挙げた項目には、c35〜c47の単独拒否CASEが置かれた。
   - **R9、R10、R12**：解消した。c48〜c50（provider差の向き）とH2の見出しが置かれた。
2. **Opusシンプルブラインド**：Major 3。今回は、次の3つの表を作らせた。Majorがあったので、Fableへは回していない。
   - 項目×状態の表
   - 出力要素の表
   - 禁止列挙の照合表
3. **reviewerの確認**：表の×のマスを、固定L2:1155、1156、1158、1160の原文と照らし合わせた。3件ともMajorと確定した。

**reviewer側の誤り**：M1の前半（仮登録を起点にした要求採択・L3承認・assignmentの生成）は、review03 M2(a)で挙げ漏らしていた。review03 M2(a)は、「仮登録・候補本文」のうち仮登録についてWorker起動だけを挙げていた。固定L2:1155は「仮登録・候補本文は要求採択、L3承認、assignment・Worker起動を生成しない」と、4つの出力を並べている。

### 照合の範囲の固定
**太字の×**が、今回のMajorである。reviewerは次回、この3つの表の太字×と既存の照合項目で照合する。表の外から、新しい組み合わせを求めることはしない。

**表1 項目×状態（固定L2:1156、1160、L11:869、872）**

| 項目 | 欠落 | stale | conflict | 不明 |
|---|---|---|---|---|
| layer、drive、軸のmapping、軸のsource/revision、process phase、task boundary、oracle、比較対象、evidence適用範囲、contract digest、OS profile/lifecycle、OS assignment/response/receipt | ○（ブラインドの表のとおり） | ○ | ○ | ○または− |
| **軸の適用範囲** | **×** | **×** | **×** | **×** |

**表2 出力要素（固定L2:1158）**：○は「適用条件」以外の全要素（正常判定のc01、c03、c19と、単独CASE）である。
- **適用条件**：(a)正常判定は**×**、(b)単独CASEも**×**である。

**表3 禁止列挙**：○は下の2行以外の全行である。
- **仮登録→要求採択／L3承認／assignment**（L2:1155）：**×／×／×**
- **HARNESS handoff→実行許可**（L2:1160）：**×**（handoff→authorityはCASE-26で○）

### Major
**M1（仮登録とhandoffを起点にした生成に、単独の拒否CASEがない）**
- **欠陥**：
  - 仮登録だけを起点に、要求採択・L3承認・assignmentを出力する変異の単独拒否CASEがない。仮登録を起点にしたCASEは、c46（Worker起動）だけである。
  - HARNESS handoffだけを起点に、「実行許可」を出す変異の単独拒否CASEもない。CASE-25が扱うのは「実行状態」で、c24・c26はdigestとOS receiptが起点である。
  - 類型2である。
- **守るべき行**：
  - 固定L2-054（5aa10031 product-requirements.md:1155）「仮登録・候補本文は要求採択、L3承認、assignment・Worker起動を生成しない」
  - 同1160行「HARNESS handoff…はauthorityや実行許可を発生させず」

**M2（layer/driveの適用範囲と、handoff結果の「適用条件」が、照合されていない）**
- **欠陥**：
  - layer/driveの適用範囲が、欠落・stale・conflict・不明のどの場合にも、単独CASEがない。c07とroot-field-05が扱うのは、digestとtargetのscopeだけである。
  - handoff結果を「適用条件に結ぶ」ことも、照合されていない。B0とc03の正常判定にも、単独CASEにもない。旧R7を繰り上げた。
  - そのため、適用範囲を推定したhandoffが合格する（類型4）。
- **守るべき行**：
  - 固定L2-054（:1156）「`layer`または`drive`の意味対応、適用範囲、revisionが不明・欠落・conflict・staleなら…`unknown_or_defer`」
  - 同1158行「上記入力のdigest・適用条件に結んで」

**M3（FVの「型付きhandoffの候補条件」の閉じた列挙が、ほかの文書と食い違っている）**
- **欠陥**：
  - functional-verification.md（054節の「型付きhandoffの候補条件」）は、muster出力の列挙から「複数の場合はその全体集合」と「集合digest」を落としている。
  - BR、NFR、BV、NVの列挙には、この2つがある（類型3）。
- **守るべき行**：固定L2-054（:1158）「契約参照（複数の場合はその集合とdigest）」

### 後で直す残余（承認を止めない）
- **R3、R5、R6、R8、R11**：変わらない。
- **R9、R10、R12**：解消した。
- **R7**：M2へ繰り上げた。
- **R13（driveを落とす単独CASE）**：drive軸を落とす単独CASEがない（c36はlayerだけ）。入力digestの照合で、間接的に覆われている。
- **R14（証拠の種別ごとの分割）**：c29〜c34は、4種の証拠を同時に与える形である。証拠の種別ごとには分けていない。
- **R15（BVの参照）**：BVの「証拠の非昇格」行が、c38〜c47を参照していない。
- **R16（形式の注記）**：wire formatやprovider固有fieldを定義しないことに、単独CASEがない。

### 次の手順
- **M1**：次の4つの変異を、それぞれ単独のCASEとして拒否する。
  - 仮登録→要求採択
  - 仮登録→L3承認
  - 仮登録→assignment
  - HARNESS handoff→実行許可
- **M2**：layer/driveの適用範囲の4状態（欠落、stale、conflict、不明）の単独CASEを置く。判定は`unknown_or_defer`とする。適用条件は、c03の正常判定で値を照合するか、単独CASEを置く。
- **M3**：FVの列挙に、「複数の場合はその全体集合」と「集合digest」を加え、ほかの文書と一致させる。
- 直した後のHEADで、もう一度依頼してほしい。

````

### comment 6027399367 — 5231 bytes / SHA-256 `fbd55323091d42597057cd0606a788a82e85412cf2be8637a6d6f737d59c6439`

````text
## review05（independent review、PR #2646 親HARNESS-L2-054、HEAD 2254c2458fc088e06561a5a10874744012f3a5ff、base main 03d9cd19d）：Major 0

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2646-HARNESS-STAGE3-PARENT054-05` に応える。

### 本文を評価する前の確認（採択記録・対象版・追補条件）
- **採択記録**：11候補記録（po-decision-2026-09-29-11candidates.md）の34行が、`MPR-RC-HARNESS-L2-054-001`を採択している。`docs/governance/decisions/`に、054の別revisionを採択した記録はない。
- **対象版**：固定親は`5aa100319361b0cc86edd3c51815ec777d55410a`（L2 1154–1162、L11 865–875）である。
- **base整合**：merge-baseは依頼のbase（03d9cd19d）と一致し、削除行は0である。新baseから見た054の追加315行は、旧base（0acbed34b）に修正commit 6f1d726d9を足した場合の追加行と一致する。041節・047節はmainの文脈として入っているだけで、054の追加の意味は変わっていない。
- **条件付きの戻し先**：0件。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - `merge-tree`は衝突なし

### 照合の経過
1. **review04の解消の確認**：照合はreview04で固定した3表の太字×のマスと、既存の照合項目に限った。
   - **M1（仮登録・handoff起点の生成）**：解消した。c51〜c53（仮登録→要求採択／L3承認／assignment）とc54（handoff→実行許可）が、それぞれ1fieldだけを変える単独の拒否CASEとして置かれた。
   - **M2（軸の適用範囲×4状態）**：解消した。c55〜c62が、layer/driveの軸別・状態別（欠落、stale、conflict、不明）に置かれた。判定はunknown_or_deferで、戻し先はHARNESS process/axis-sourceへ無条件である。
   - **M3（出力の適用条件、FVの列挙）**：解消した。c03の正常判定が、適用条件（layer/driveの値、source revision、適用範囲）を入力sourceと項目ごとに照合するようになった。FVの集合と集合digestの列挙も直った。
2. **Opusシンプルブラインド**：Major 0。3表の太字マスはすべて○だった。041節・047節とのID衝突もない。
3. **Fableの判断**：「承認してよい」。Fableは、固定親とPO記録、6本文を自分で読んで照合した。
4. **Opusによる敵対照合**：「Fableの判断を支持する」。次の点を照合したが、崩せなかった。
   - 禁止列挙
   - 項目×状態
   - 適用条件
   - L2の意味変更（047本文、条件付きA配置、各機構の責務）
   - 041節・047節との相互作用
5. **reviewerの結論**：委任の条件1（Opusのexact HEADでのMajor 0）と条件2（Fableの同一本文revisionでの判断）が、このHEADでそろった。

### 6本文（このHEADのSHA-256）
- business-verification `91bad8e4…`
- functional-verification `51f1ba61…`
- nfr-verification `5c1a1e2f…`
- business-requirements `febb9035…`
- functional-requirements `d0c741ba…`
- nfr-grade `a78cd4ec…`

### 後で直す残余（承認を止めない）
- **R3、R5、R6、R8、R11、R13〜R16**：変わらない。
- **R17（修飾語の差）**：layer×driveの修飾語が、文書によって違う。項目の集合は一致している。
- **R18（分岐での適用条件）**：適用条件の正常照合は、musterの分岐（c03）だけにある。existing_role_sufficient（c01）とunknown_or_defer（c19）の分岐にはない。review04の表2は要素単位で固定したので、分岐単位の要求は表の外とする。
- **R19（出力側の適用範囲）**：出力側の適用範囲に、単独CASEがない。c03で照合している。
- **R20（staleの定義）**：c56とc60でのstaleの定義を、明記することを勧める。
- **R21（未決項目の明示）**：固定L2:1159とL11:873にある「TeamDefinition相当の集約表現・layer/driveの厳密mappingは、未決のPO/L3設計項目」という表現が、6本文に明示されていない。中身は、厳密mappingを採択しないこと、未定義ならunknown/defer、必須artifactはPOへ、という各記述で保たれている。
- **R22（OSのbudget/期限）**：「責務別差戻し」の列挙に、OSのbudget/期限がない。固定L2:1161の不成立行にもないため、表の外とする。
- **R23（宛先の書き方）**：索引行r04-contract-digest-missingの宛先が「HARNESS contract/OS assignment boundary」となっていて、二重に読める。参照先のr02は、HARNESSへの無条件の返却である。
- **R24（件数の基準）**：matrix countの「既存150 ID」は、PR内の前回revisionを基準にした書き方で、baseが基準ではない。

### 次の手順
- 結論：このHEADの6本文に、未解消のblockerはない。
- mergeへ進むには、次の2つが要る。
  - 委任承認の判断記録。このexact HEADの6本文のbytesとSHAを固定したもの。
  - Ready化。
- 本文のrevisionが変わった場合は、条件1・2をやり直す。

````
