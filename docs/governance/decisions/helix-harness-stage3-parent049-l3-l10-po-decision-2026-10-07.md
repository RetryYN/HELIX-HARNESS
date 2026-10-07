---
title: "HELIX-HARNESS Stage 3 親049 L3/L10委任承認 decision record"
decision_record_id: HDEC-HARNESS-STAGE3-PARENT049-L3-L10-DELEGATED-2026-10-07
decision_status: recorded
decider_role: "PO（委任：Opus・Fable一致）"
decided_at: 2026-10-07
recorded_at: 2026-10-07
review_base: 03d9cd19dfb92dc7dda74c8cb50f85dc320c873c
reviewed_content_head: 79a67c583857d607ae78c1cb9d2cc5dfc5ab533f
reviewed_content_revision: d72324ec1bff69c3a4632690bcc7edf23f1da071
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-HARNESS Stage 3 親049 L3/L10委任承認

対象は採択済みHARNESS-L2-049、登録`MPR-RC-HARNESS-L2-049-003`、Stage 3、version_target 1.0のL3/L10 pairに限る。要求意味・範囲・担当・版を変更しない。

## 委任判断の根拠

正式review06 comment [6027275759](https://github.com/RetryYN/HELIX-HARNESS/pull/2647#issuecomment-6027275759) はexact base `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`、HEAD `79a67c583857d607ae78c1cb9d2cc5dfc5ab533f`、本文revision `d72324ec1bff69c3a4632690bcc7edf23f1da071`についてMajor 0、Opusの敵対照合を含む委任条件1（Opusのexact HEADにおけるMajor 0）と条件2（Fable「承認してよい」、Opus「Fableの判断を支持する」）が同じ本文revisionでそろったと報告する。この記録は、その委任判断に基づく当該revisionのL3承認を記録する。formal本文は4055 bytes、SHA-256 `5cfb77ce7ea993345083b6aa4f53a169c51072ec65b643e8d6888d4b877e1a1e`。formalに「Minor 0」とは書かれていないため、その数値判断は追加しない。

mailbox応答は別証拠であり、`result=no_findings`、`findings=[]`、`unreviewed=[]`を返す。`authority_effect=none`であり、Fable判断やPO承認を新たに生成しない。mailbox inspect本文はJSON証拠bundleにrawで保持する。

委任規則の正本は[委任PO判断記録](l3-l10-approval-delegation-po-decision-2026-10-05.md)（revision `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`、6210 bytes、SHA-256 `9028384fe51660c6785dc55e034bbd887702fd53b00bd9fd16641e7b6d8c2220`）と[GitHub上流運用モデル §L3／L10承認の委任](../github-upstream-operating-model.md#l3l10承認の委任)（同revision、53710 bytes、SHA-256 `eed2b774bb78545ac53c7d55f3ae3ab4e9c4f421b4eaf3ac3bcdbcdd869dd27b`）である。

## 採択親と固定source

採択元は`docs/governance/decisions/po-decision-2026-09-30-live26.md`の39行で、`MPR-RC-HARNESS-L2-049-003`を採択している。同文書72行は採択範囲を訂正済みL11 oracleによる計測専用意味に限定し、prototype生成、Pattern選択、screen ID発行を除外し、`-002`の処置を継承しないとする。旧`po-decision-2026-09-29-11candidates.md` 46行の`-002`は未採択であり、本候補はそれを採択記録として扱わない。PO sourceの行とファイルSHAはJSON bundleに固定する。

固定親はrevision `ea6f756f96a7370de78e412d737c7a7ed472114a`。L2 `product-requirements.md` 1070–1092は8823 bytes / SHA-256 `a5df1f7bdca708046ec9ad68e1eea0974884da63205b8995ad45dcd8f0bbc116`、L11 `product-acceptance.md` 802–814は4239 bytes / SHA-256 `f3fb47da21371084e9f8c7c7f7ca6dd945c8e98ae7c7b70597c3fc44e4e08ee7`。これらのsource全文はJSON bundleへ保存する。

承認対象6本文はHEADと本文commitの実blob bytesが一致することを再計算した。次表のSHA-256・byte数を固定し、詳細はJSON bundleに置く。

| 本文 | bytes | SHA-256 |
|---|---:|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | 14791 | `7ea9e004f813e3e7cdd94f7d612753d6224c4ffa1fde7bba775959e303d8ef65` |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | 232956 | `702bb566bfa0e814868a36ac97b2e058e99b8353a2ba901af971e2a0bfd70820` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | 45394 | `b2694e221a5f0342fc4ef212ec453e2d934b4123d959891c0c9b704d63ca3de7` |
| `docs/helix-harness/L10-verification/business-verification.md` | 10615 | `d645bd8ed00c536e355d44162c1b0c552a2bc1ca296597783d36395e275e35a1` |
| `docs/helix-harness/L10-verification/functional-verification.md` | 860127 | `0d46ef7417c625a826bf64870a2d228b0ad7b527b7b039001b339357d97f5d98` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | 39148 | `022e14272f92cf62e9f9782c72ffd077304bf36f1e4ecf4c8a69a137fbd7b2bf` |

## 条件3と次の状態

委任条件3（この判断記録を加えた後も承認対象6本文のbytesが不変であること）は未確認である。条件1・2に基づく本承認のauthority effectは、この記録がmainへadmitされた時点から有効となる。記録追加後のexact HEADを独立review側が読み、6本文不変を確認するまではReady化せず、review側はその確認後に最新base、merge可否、必要なdecision/admissionを再照合する。

fixtureは実行していない。実測性能・精度、要件の意味完全性、実装完了を主張しない。main admissionはこのdecision recordのauthority effect条件であり、既存採択や対象範囲を拡張しない。

## 旧HELIXと過去監査の保持

前回の049 postbody時点監査 [`docs/governance/audits/requirements-stage/harness049-review05-postbody-audit-2026-10-07.json`](../audits/requirements-stage/harness049-review05-postbody-audit-2026-10-07.json)（1,586,511 bytes、SHA-256 `d57c120f330ea6a44331d9b6aefa7746be1caa4b0ea5e5cb8320058f1a29cc8e`）を参照する。そこには旧sourceの82 raw literal、旧ID保持／現行fixture再導出の処置、25件のsource/consumer pinsが記録されている。本記録はその証拠を再分類・書き換えない。

根拠bundleは[`docs/governance/audits/requirements-stage/harness049-l3-l10-decision-evidence-2026-10-07.json`](../audits/requirements-stage/harness049-l3-l10-decision-evidence-2026-10-07.json)に保存する。このbundleにはformal review raw、mailbox response、固定親・6本文のpins、前回監査の参照情報を含める。統合checkpoint `/tmp/root-harness049-review05-integration-checkpoint.json`（1237 bytes、SHA-256 `6d35140ec268cd50f2fffd99aa9993c7254d19a24d097d613080de8fe01bfbd2`）は作成側検収用の補助証拠であり、正本sourceの代替ではない。

## 正式review01–06のraw記録

以下は各正式review comment bodyの取得bytesをそのまま保存したものである。過去時点のR番号・処置・結論を現在のfindingとして再解釈しない。各raw bodyのbyte数とSHA-256は隣接するJSON bundleにも記録する。

### comment 6024926713 — 6273 bytes / SHA-256 `7e76d419719555ad85565586b80b0f21bb483d01ce088be811386e567ca341d7`

````text
## review01（independent review、PR #2647 親HARNESS-L2-049（採択 -003）、HEAD f74a0e1cb51a2e35dae8b2f7fe949d5e7b5f71f0、base main ceda1c53b）：Major 2

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2647-HARNESS-STAGE3-PARENT049-01` に応える。

### 本文を評価する前の確認（採択記録・対象版・追補条件）
- **採択記録**：live26記録（po-decision-2026-09-30-live26.md）の39行が、`MPR-RC-HARNESS-L2-049-003`を採択している。git grepで、ほかに採択がないことを確かめた。11候補記録の-002は未採択の判断である。
- **対象版**：固定親は`ea6f756f96a7370de78e412d737c7a7ed472114a`（live26記録23行の最新main）である。
  - **L2**：product-requirements.md:1070–1092の節SHA-256は`a5df1f7b…`。
  - **L11**：product-acceptance.md:802–814の節SHA-256は`f3fb47da…`。
  - reviewerが`git show`から計算し、39行の記録値と一致することを確かめた。
- **追補条件**：live26記録72行「049の採択は登録`-003`および訂正済L11 oracleの計測専用意味に限る。試作品生成、Pattern選択、screen ID発行は含まず、別revision `-002`の処置を継承しない」。
  - ブラインドが照合し、6本文はこの3つを正常系に含めていない。
  - 3つそれぞれに、拒否CASEがある（r10-output-prototype-generation、output-pattern-selection、output-screen-id-issuance）。
  - -002を継承しないことも、L3 FRに明記されている。
- **base整合**：merge-baseは依頼のbaseと一致し、削除行は0である。
- **条件付きの戻し先**：1件ある。「固定L2:1090の要求意味に関する既存上流ownerへ戻し、identityが特定できなければunknownを維持する」で、区分を保ったうえで個体identityをunknownにする許容形である。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - origin/mainとの`merge-tree`は衝突なし

### 照合の経過
1. **Opusシンプルブラインド**：Major 3。Majorがあったので、Fableへは回していない。
2. **reviewerの確認**：固定L2の1070〜1092行（「入力・出力」「authority・状態」「不成立と戻し先」）を読み、L3とL10の049節をgrepした。
   - 1件目と2件目は、M1・M2としてMajorと確定した。
   - 3件目は、下のR3とした。

### Major
**M1（固定L2の出力要素「修正候補」が、L3にもL10にもない）**
- **欠陥**：
  - FR-HARNESS-L3-049（functional-requirements.md:732）とAC-01〜05は、出力に結果・根拠・未測定/適用外/unknown・文言findingを挙げている。「修正候補」はない。
  - L3の049節に、「修正候補」の語は0件である。
  - L10の049節のCASEにも0件で、正常判定での照合も、単独CASEもない。
  - L3がL2の出力要素を落としている（類型3）。そのため、修正候補を出さない実装が合格する（類型4）。
- **守るべき行**：固定L2-049（ea6f756 product-requirements.md「入力・出力」）「出力は…測定結果と証拠、適用外・未測定・unknown、修正候補、差戻し先を含む」

**M2（「L3要件freeze」と「L11利用者受入」を自己生成する出力に、拒否fixtureがない）**
- **欠陥**：
  - AC-03（functional-requirements.md:742）は、「L3/L11 acceptance」を出力しないと書いている。
  - しかし、L10の拒否CASEが扱うのは、requirement_acceptance、user_approval、agreement、implemented、ux_verifiedだけである。
  - L3要件freezeやL11利用者受入を出力する単一の変異は、ない（L10の049節で「freeze」「L11受入」は0件）。
  - 固定親が禁じる生成に、拒否fixtureがない（類型2）。#2638（068）review06 M1、#2645（071）review01 M1と同じ型である。
- **守るべき行**：固定L2-049「authority・状態」「HARNESS/AIはvision、brand、見た目の好み、prototypeへの合意、L3要件freeze、L11利用者受入を自己承認しない」

### 後で直す残余（承認を止めない）
- **R1（利用許可の戻し先）**：利用許可のunknown/missingを、「要求意味に関する既存上流owner」へ戻している（r09-003、r09-030）。固定L2の「不成立と戻し先」は、利用許可の宛先を区分していない。
- **R2（localeの追加）**：localeを、選択入力の条件に加えている。固定L2の入力はdevice/viewだけで、localeは固定L11の未見例「locale等」にとどまる。
- **R3（出力routeの誤りの訂正先）**：ブラインドはMajorとしたが、reviewerが残余とした。対象はr10-cause-specific-return-routeとFR:734である。
  - これらは、入力が正常なときの049出力のroute誤りを、「049候補出力内で訂正し、L2入力ownerへは返さない」としている。
  - これは、#2641（044）review05でreviewerが求めた形（自分の出力誤りは自分で訂正し、入力側ownerへ押し付けない）と同じである。そのため、固定親の返却区分の外にある新しい宛先とはみなさない。
  - ただし、「正しい測定scopeのroute」の期待値がbaselineに書かれていない。正常入力ではrouteが「なし」になるのかを、明記することを勧める。
- **R4（測定項目ごとの相殺）**：「各測定項目」ごとに、他項目の結果で埋めない単独CASEはない。r09-006が部分的に代替している。
- **R5（正常判定の値）**：正常のr10-screen-id-no-issuance-proof-normalは、出力要素の値を照合していない。要素ごとの単独CASEが補っている。

### 次の手順
- **M1**：FRとACの出力に「修正候補」を加える。正常判定で修正候補の値を照合するか、修正候補だけを欠落・別値にする単独CASEを置く。
- **M2**：FR/ACの非生成の列挙に「L3要件freeze」「L11利用者受入」を明示する。それぞれを単独で生成させる拒否CASEを置く。
- 直した後のHEADで、もう一度依頼してほしい。
````

### comment 6025506014 — 7249 bytes / SHA-256 `bcd89d6f33509bee9cc31118cb32ac982747a38cce9e4774a635a0b53f269b40`

````text
## review02（independent review、PR #2647 親HARNESS-L2-049（採択 -003）、HEAD 9f6aa39a9fd816b795f25b6f0b51eab42ce0fcae、base main ceda1c53b）：Major 4

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2647-HARNESS-STAGE3-PARENT049-02` に応える。

### 事前確認と静的検査
- **採択記録**：live26記録39行（`MPR-RC-HARNESS-L2-049-003`）。後日の別採択はない。
- **追補条件**：live26記録72行。試作品生成、Pattern選択、screen ID発行を含まないこと、-002を継承しないことは、引き続き守られている。
- **base整合**：merge-baseは依頼のbaseと一致し、削除行は0である。
- **条件付きの戻し先**：1件。区分を保った許容形である。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
- **最新mainとの衝突**：現在のorigin/main（0acbed34b、#2637 merge後）との`merge-tree`は、6本文で衝突する。041と049が、同じファイル末尾へ追記しているためである。
  - 意味の照合は、依頼のbase（ceda1c53b）で行った。
  - merge admissionの前には、main取り込み後のHEADで、049節が不変であることと、条件1・2を照合し直す必要がある。#2643と同じ事情である。

### 照合の経過
1. **review01の解消の確認**（reviewerが差分で確かめた）：M1とM2は解消した。
   - **M1**：修正候補を、正常判定でsource/oracleの値と照合する。missingとmismatchの単独CASEも置かれた。
   - **M2**：L3要件freezeとL11利用者受入の自己生成に、それぞれ単独の拒否CASEが置かれた。
   - **R3**：正常入力のrouteを「なし」と明記した。
   - **R5**：正常判定で、全fieldの値の一致を照合するようになった。
2. **Opusシンプルブラインド**：Major 4。今回から、禁止列挙の全件照合と、前回までの残余R1〜R5の洗い直しを加えた。Majorがあったので、Fableへは回していない。
3. **reviewerの確認**：固定L2の1072、1082、1084、1086行と、L11の814行の原文を読み、049のCASEを確かめた。4件ともMajorと確定した。
   - 「vision」でgrepすると60件ヒットするが、すべて「revision」の一部だった。vision・brand・見た目の好みの自己承認を拒否するCASEは、0件である。

**reviewer側の誤り**：M3は、review01のM2と同じ文（L2:1086）に並ぶ項目である。review01では、その文からL3要件freezeとL11利用者受入だけをMajorにした。vision、brand、見た目の好み、prototypeへの合意を拾わなかった。prototypeへの合意は、agreementのCASEで覆われている。照合を1回で済ませるべきところを、取りこぼしていた。

### Major
**M1（「候補、fixture、測定回数だけで精度や品質を成立扱いにしない」のうち、照合されているのは1項目だけ）**
- **欠陥**：
  - 単独CASEは、「fixture登録数→accuracy」（FV:1653）だけである。
  - 候補数だけ、または測定（実行）回数だけで精度を成立させる単独CASEがない。fixture・候補・回数から「品質」を成立させる単独CASEもない。
  - AC:741は、文言だけでCASEに落ちていない（類型2・4）。
- **守るべき行**：固定L2-049（ea6f756 product-requirements.md:1082）「候補、fixture、測定回数だけで精度や品質を成立扱いにしない」

**M2（他候補の採択を推定・前提にする変異に、拒否CASEがない）**
- **欠陥**：次のどちらかを単独で変異させるCASEがない。
  - 039の採択を推定する、または前提にする（049のCASEに「039」は0件である）。
  - BRAIN/LABO/INTELLIGENCEの候補を、採択済みとして扱う。
  - 固定親が禁じる状態の推測に、拒否fixtureがない（類型2）。
- **守るべき行**：
  - 固定L2-049（:1072/1076/1088）「039の採択や未記載の生成能力を推定しない」
  - 同:1084「各候補が採択済みであるとも扱わない」

**M3（vision、brand、見た目の好みの自己承認に、拒否CASEがない）**
- **欠陥**：
  - 人の承認を扱うCASEは、次の4つだけである。
    - 汎用のuser_approval
    - agreement（prototypeへの合意）
    - L3 freeze
    - L11受入
  - vision、brand、見た目の好みを、それぞれ単独で承認済みとして出力する変異の拒否CASEがない（類型2）。
- **守るべき行**：固定L2-049（:1086）「HARNESS/AIはvision、brand、見た目の好み、prototypeへの合意、L3要件freeze、L11利用者受入を自己承認しない」

**M4（「文書上の対応関係」「candidate登録」だけで完了を成立させる変異に、拒否CASEがない）**
- **欠陥**：
  - 文書上の対応関係だけ、またはcandidate登録だけを根拠に、要求採択・PO合意・実装・L3/L11の完了を成立させる単独CASEがない。
  - FV:1661は、機械測定結果から受入を作る場合だけを扱っている。FV:1753〜1754は、描画済み扱いに限られる。
  - これらの誤った完了を拒否するfixtureがない（類型2・4）。
- **守るべき行**：L11-049（ea6f756 product-acceptance.md:814）「文書上の対応関係、candidate登録、fixture一覧、描画画像の存在だけでは要求採択、実測成功、検査精度、PO合意、実装、実利用者評価、L3/L11の実際の完了を成立させない」

### 後で直す残余（承認を止めない）
- **R1〜R4**：変わらない。今回、上の基準で洗い直したが、Majorに当たるものはなかった。
- **R5**：解消した。
- **R6（精度評価fixtureの戻し先）**：精度評価fixtureの戻し先が、CASEによって設計ownerとLABOに分かれている（FV:1717、1652、FR:732）。
- **R7（閾値誤りの戻し先）**：一律閾値の誤りを、LABOへ返している（FV:1687）。固定L2:1090では、設計・oracle不足は設計ownerへ返す。
- **R8（範囲の注記）**：次の注記には、単独CASEがない。
  - 未選択Patternの存在推定
  - 実行の生成
  - 要求identityや接続の新設
  - 承認gateの追加
  - 保管・運転の所有

### 次の手順
- **M1**：候補数だけ、測定回数だけで精度を成立させる変異と、fixture・候補・回数から品質を成立させる変異を、それぞれ単独のCASEとして拒否する。
- **M2**：039の採択を前提にする変異と、BRAIN/LABO/INTELLIGENCEの候補を採択済みとして扱う変異を、それぞれ単独のCASEとして拒否する。
- **M3**：vision、brand、見た目の好みを、それぞれ単独で自己承認する変異を拒否する。
- **M4**：文書上の対応関係だけ、candidate登録だけを根拠に完了・採択・合意を成立させる変異を、それぞれ単独のCASEとして拒否する。
- 最新mainを取り込み、049節を変えずに衝突を解消したHEADで、もう一度依頼してほしい。
````

### comment 6025724299 — 2503 bytes / SHA-256 `50522fc45de9be95a448441cfdefa958c9697822cfc301fd3239a34415b35d8a`

````text
## review03（independent review、PR #2647 親HARNESS-L2-049（採択 -003）、HEAD 04d52812ec8636a5e6110a443dec0fe8524e908a、base main 0acbed34b）：Major 4（review02 M1〜M4が未解消）

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2647-HARNESS-STAGE3-PARENT049-03` に応える。

### 照合した項目
- **今回のHEADの変更**：9f6aa39a9からの変更は、最新main（0acbed34b、#2637 merge）を取り込んだ衝突解消のmerge commit `04d52812e`だけである。
- **049本文の不変**：L3/L10の6ファイルで、reviewerが次の2点を照合した。
  - 9f6aa39a9→HEADの追加行は152行で、削除は0行である。これは、main側で041が追加した152行と内容が一致する。
  - 0acbed34b→HEADの049の追加行は178行で、削除は0行である。これは、ceda1c53b→9f6aa39a9の049の追加行と内容が一致する。
  - 以上から、049の本文は変わっていない。
- **衝突の解消**：review02で記録した最新mainとの衝突は、解消された。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - `merge-tree`は衝突なし

### 結論
049の本文は、review02の対象と同一である。そのため、review02のM1〜M4は未解消のまま残る。

- **M1**：「候補、fixture、測定回数だけで精度や品質を成立扱いにしない」のうち、照合されているのは「fixture登録数→accuracy」だけである。候補数だけ、測定回数だけで精度を成立させる変異と、品質を成立させる変異の拒否CASEがない。
- **M2**：039の採択を推定・前提にする変異と、BRAIN/LABO/INTELLIGENCEの候補を採択済みとして扱う変異の拒否CASEがない。
- **M3**：vision、brand、見た目の好みを自己承認する変異の拒否CASEがない。
- **M4**：文書上の対応関係だけ、またはcandidate登録だけで、採択・合意・実装・L3/L11の完了を成立させる変異の拒否CASEがない。

守るべき固定親の行は、review02のとおりである。
- ea6f756 product-requirements.md：1072、1076、1082、1084、1086、1088行
- product-acceptance.md：814行

本文が同一なので、今回は照合を新たに回していない。

### 次の手順
- review02の「次の手順」のとおりに、M1〜M4を直す。
- 直した後のHEADで、もう一度依頼してほしい。
````

### comment 6026163121 — 7265 bytes / SHA-256 `ea4ea3b60160b07b3d8fda2ede7793ab26088ee5365b9f2b00f52d3f8eb11d2a`

````text
## review04（independent review、PR #2647 親HARNESS-L2-049（採択 -003）、HEAD 7f64277540c40606011323a0641865e0eee95ebc、base main 0acbed34b）：Major 5

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2647-HARNESS-STAGE3-PARENT049-04` に応える。

### 事前確認と静的検査
- **採択記録**：live26記録39行（-003）。後日の別採択はない。
- **追補条件**：live26記録72行は、引き続き守られている（試作品生成・Pattern選択・screen ID発行を含まず、-002を継承しない）。
- **base整合**：merge-baseは依頼のbase（0acbed34b）と一致する。041節は、mainの文脈である。
- **条件付きの戻し先**：1件ある。区分を保ったうえで、個体identityだけをunknownにする許容形である。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - `merge-tree`は衝突なし

### 照合の経過
1. **review02/03の解消の確認**（reviewerが差分で確かめた）：M1〜M4は、それぞれ単独の拒否CASEで手当てされた。
   - **M1**：候補数・測定回数・fixture数と、精度・品質の組み合わせ（r20-m1-*）
   - **M2**：039の採択の推定・前提と、BRAIN・LABO・INTELLIGENCEの候補を採択済みとして扱うこと（r20-m2-*）
   - **M3**：vision・brand・見た目の好み（r20-m3-*）
   - **M4**：文書上の対応関係・candidate登録の各8出力（r20-m4-*）
2. **Opusシンプルブラインド**：Major 5。Majorがあったので、Fableへは回していない。
3. **reviewerの確認**：L11の810行と814行、L2の1074、1078、1090行の原文を読んだ。あわせて、該当するCASEの判定文（r10-scope-unknown、r10-source-authority-unknown、r10-fixture-version-unknown）を読んだ。版unknownのCASEの有無と、業務・FRの「採択意味」の文も照合した。5件ともMajorと確定した。

**reviewer側の誤り**：
- **M1**：review02のM4で、L11:814の4つの根拠（文書上の対応関係、candidate登録、fixture一覧、描画画像の存在）のうち、2つしか挙げていなかった。
- **M2**：「承認gate・人の判断境界・独立承認者を追加しない」を、残余R8（範囲の注記）としていた。これは新しい承認手続きを生成することにあたるので、Majorとすべきだった。

### Major
**M1（L11:814の残り2つの根拠と、L11:810の修正承認に、拒否CASEがない）**
- **欠陥**：
  - 「fixture一覧だけ」「描画画像の存在だけ」から、要求採択・PO合意・実装・実利用者評価・L3/L11完了を成立させる変異の単独CASEがない。fixture数→精度と、静止画→実測の2組だけが、覆われている。
  - 「修正を承認済みとして扱わない」にも、単独CASEがない。汎用のuser_approvalがあるだけである。
- **守るべき行**：
  - L11-049（ea6f756 product-acceptance.md:814）
  - 同810行

**M2（承認gate・人の判断境界・独立承認者を追加する変異に、拒否CASEがない。旧R8の一部を繰り上げ）**
- **守るべき行**：
  - 固定L2-049（ea6f756 product-requirements.md:1090）「人の判断境界や毎回のapproval gateを追加しない」
  - 同1074行「独立承認者…を追加しない」

**M3（prototype版・oracle版のunknownと、source traceの補完に、拒否CASEがない）**
- **欠陥**：
  - 版unknownのCASEがあるのは、profile版とfixture版だけである。prototype版のunknownとoracle版のunknownには、CASEが0件である。missing（r09-004）やrevision不一致（049-15）とは、別の状態である。
  - source traceが欠けたときに、traceを補って作る変異の拒否CASEもない。
- **守るべき行**：
  - 固定L2-049（:1090）「prototype/profile/oracle/fixtureの版…が不明なら測定条件を確定しない」
  - 同1078行「source traceがなければ新しく発行せず不足として返す」

**M4（戻し先が決まらないCASEが3件ある）**
- **欠陥**：
  - **r10-scope-unknown**：「固定L2で特定できる既存責務へ原因別に返す」だけで、宛先がない。
  - **r10-source-authority-unknown**：単一の原因に対して、「既存要求/visual-priorityまたはdesign owner」と宛先を二択のまま残している。
  - **r10-fixture-version-unknown**：「既存LABO接続を必要に応じ使用する」だけで、戻し先を定めていない。
  - 3件とも、宛先が決まらない（類型1）。#2646（054）review03 M1と同じ型である。
- **守るべき行**：固定L2-049（:1090）の戻し先4区分（要求意味・見た目の優先順位→上流owner、prototype agreement→L2-024、設計・oracle不足→既存設計owner、検査精度評価→LABO）

**M5（「採択意味」の範囲を言い切る文が、文書間で食い違っている）**
- **欠陥**：
  - business-requirements.mdは、「採択意味は、入力されたrenderable prototypeの画面表示を選択scopeで計測することに限る」と書いている。
  - functional-requirements.md:770は、「…を測定し、機械検査の精度材料とprofile根拠の文言findingを返す範囲に限る」と書いている。
  - 業務側では、検査精度と文言量の評価が範囲から落ちていて、閉じた範囲が文書間で一致していない（類型3）。
- **守るべき行**：固定L2-049の1082行（検査精度）と、1080行（文言量）

### 後で直す残余（承認を止めない）
- **R1〜R4、R6、R7**：変わらない。
- **R5**：解消した。
- **R8**：一部をM2へ繰り上げた。残りは、未選択Patternの存在推定、実行の生成、要求identityや接続の新設、保管・運転の所有である。
- **R9（束ねた変異）**：049-03は、生成・Pattern・ID発行の3項目を1つの複合mutationに束ねている。単独CASEは、別にある。
- **R10（見出しの配下）**：049の固定親の記述が、041の見出しの配下に置かれている。
- **R11（範囲の注記）**：次の注記には、拒否CASEがない。
  - 「候補出力は人の判断を代替しない」
  - 新profile schema
  - 新L1要求・採択の推測

### 次の手順
- **M1**：fixture一覧だけ、描画画像の存在だけを根拠に、L11:814の各出力を成立させる変異を、それぞれ単独のCASEとして拒否する。修正を承認済みとする変異も、単独のCASEとして拒否する。
- **M2**：承認gateの追加、人の判断境界の追加、独立承認者の追加を、それぞれ単独のCASEとして拒否する。
- **M3**：prototype版unknownとoracle版unknownの単独CASEを置く。source traceの補完を拒否する単独CASEも置く。
- **M4**：3件の戻し先を、L2:1090の4区分のうち、原因に当たる1つに決める。
- **M5**：業務とFRの「採択意味」の範囲を、計測・検査精度材料・文言findingの3つでそろえる。
- 直した後のHEADで、もう一度依頼してほしい。
````

### comment 6026807726 — 6657 bytes / SHA-256 `800c993c721215908c1ef9c6e3542a40c445901fddec7b77507b9d7d94666b71`

````text
## review05（independent review、PR #2647 親HARNESS-L2-049（採択 -003）、HEAD dd60a50c2c6c1436a0f9be9e72b8fb93b53523c3、base main 0acbed34b）：Major 3

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2647-HARNESS-STAGE3-PARENT049-05` に応える。

### 事前確認と静的検査
- **採択記録**：live26記録39行（-003）。後日の別採択はない。
- **追補条件**：live26記録72行は、引き続き守られている。正常系に試作品生成・Pattern選択・screen ID発行がない。3項目それぞれに単独の拒否CASEがある。-002は継承していない。
- **base整合**：merge-baseは依頼のbase（0acbed34b）と一致し、削除行は0である。
- **条件付きの戻し先**：1件ある。区分を保ったうえで、個体identityだけをunknownにする許容形である。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - `merge-tree`は衝突なし

### 照合の経過
1. **review04の解消の確認**（reviewerが差分で確かめた）：M1〜M5は解消した。
   - **M1**：fixture一覧と描画画像の存在をそれぞれ根拠に、8つの出力を成立させる変異の拒否CASE（計16件）を置いた。修正承認の拒否CASEも置いた。
   - **M2**：承認gate・人の判断境界・独立承認者の追加を、それぞれ拒否するCASEを置いた。
   - **M3**：prototype版unknown、oracle版unknown、source traceの補完・発行を拒否するCASEを置いた。
   - **M4**：戻し先が決まっていなかった3件を、原因別の区分に直した。
   - **M5**：「採択意味」の範囲を、文書間でそろえた。
2. **Opusシンプルブラインド**：Major 3。今回は、次の3つの表を作らせた。Majorがあったので、Fableへは回していない。
   - 項目×状態の表
   - 出力要素の表
   - 禁止列挙の照合表
3. **reviewerの確認**：表の×を、固定L2の1078、1080、1090行と、L11の807、812行と照らし合わせた。3件ともMajorと確定した。
   - 出力要素の表と禁止列挙の表は、全行が○か、範囲の注記（残余R4、R8、R11）だった。

### 照合の範囲の固定（049の項目×状態の表）
○＝単独CASEあり、△＝複合のみ、×＝なし、−＝固定親が求めない。**太字**が今回のMajorである。

| 項目 | 未指定/missing | unknown | 不一致/未結合 |
|---|---|---|---|
| device条件 | **×（r09-001は複合）** | − | **×（r09-002は複合）** |
| view条件 | **×（同上）** | − | **×（同上）** |
| prototype版 | − | ○ | − |
| profile版 | ○ | ○ | − |
| oracle版 | ○ | ○ | − |
| fixture版 | ○ | ○ | ○ |
| scope | − | ○ | ○ |
| prototype authority | − | **×** | − |
| profile authority | − | **△（複合）** | − |
| oracle authority | − | **△（複合）** | − |
| fixture authority | − | **×** | − |
| 利用許可 | ○ | ○ | − |
| screen ID | ○ | − | ○ |
| 対象revision | **×** | − | ○ |
| source trace | ○ | − | − |
| 表示evidence | ○ | − | ○（複合） |

reviewerは次回、この表の太字と、既存の照合項目で照合する。出力要素の表と禁止列挙の表は、今回で全行を照合済みとする。表の外から、新しい組み合わせを求めることはしない。

### Major
**M1（device/view条件を、片方だけ変える単独CASEがない）**
- **欠陥**：r09-001とr09-002は、device/view条件の未指定と、表示evidenceの未結合を、それぞれ1行の複合mutationにしている。deviceだけ、viewだけを、未指定または未結合にする単独CASEがない。片方の軸だけが欠けたままpassになる誤りを、落とせない（類型4）。
- **守るべき行**：固定L2-049（ea6f756 product-requirements.md:1080）「device/view条件が未指定または表示証拠に結べない場合、その条件の測定はunknown」

**M2（prototype/profile/oracle/fixtureのauthorityがunknownの場合を、それぞれ単独で照合していない）**
- **欠陥**：
  - r10-source-authority-unknownは、profileとoracleのauthorityを1行に束ねている。
  - prototypeのauthority unknownと、fixtureのauthority unknownには、CASEが1つもない。
  - そのため、根拠不明のfixtureから精度passへ進む誤った完了を、落とせない（類型4）。
- **守るべき行**：固定L2-049（:1090）「prototype/profile/oracle/fixtureの版、scope、authority、利用許可が不明なら測定条件を確定しない」

**M3（対象revisionの欠落に、単独CASEがない）**
- **欠陥**：対象revisionについては、不一致（049-15）と、prototype source revisionのunknownしかない。対象revisionそのものを欠落させる単独CASEがない（類型4）。
- **守るべき行**：
  - L11-049（ea6f756 product-acceptance.md:807、812）「screen IDまたは対象revisionが欠落・不整合なのにpass」
  - 固定L2:1078（入力の対象screen scope/revision）

### 後で直す残余（承認を止めない）
- **R1〜R4、R6〜R11**：変わらない。ブラインドが上の基準で洗い直したが、Majorに当たるものはなかった。
- **R5**：解消済みである。
- **R12（NFR IDの対応）**：nfr-verificationの`NFR-C-HARNESS-049-01/02`は、nfr-gradeにIDの定義がない。
- **R13（業務文書の採択意味）**：業務文書3本の「採択意味…に限る」は、計測、精度材料、文言findingの3つを挙げている。L2出力の修正候補と差戻し先は、入っていない。FRには修正候補が入っていて、狭める意図ではないと読める。そろえることを勧める。
- **R14（正常判定の値）**：正常fixtureは、全出力のfield値をまとめて照合している。要素ごとの値は、明示していない。

### 次の手順
- **M1**：deviceだけ、viewだけを、それぞれ未指定・未結合にする単独CASEを置く（4件）。
- **M2**：prototype、profile、oracle、fixtureのauthorityを、それぞれ単独でunknownにするCASEを置く（4件。profileとoracleの複合行は分ける）。
- **M3**：対象revisionだけを欠落させる単独CASEを置く。
- 判定は、どれもその条件の測定をunknownとし、passにしないこととする。戻し先は、固定L2:1090の区分に従う。
- 直した後のHEADで、もう一度依頼してほしい。
````

### comment 6027275759 — 4055 bytes / SHA-256 `5cfb77ce7ea993345083b6aa4f53a169c51072ec65b643e8d6888d4b877e1a1e`

````text
## review06（independent review、PR #2647 親HARNESS-L2-049（採択 -003）、HEAD 79a67c583857d607ae78c1cb9d2cc5dfc5ab533f、base main 03d9cd19d）：Major 0

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2647-HARNESS-STAGE3-PARENT049-06` に応える。

### 本文を評価する前の確認（採択記録・対象版・追補条件）
- **採択記録**：live26記録39行（`MPR-RC-HARNESS-L2-049-003`）。後日の別採択はない。11候補記録46行の-002は、未採択の判断である。
- **対象版**：固定親は`ea6f756f96a7370de78e412d737c7a7ed472114a`である。
  - L2:1070–1092の節SHA-256は`a5df1f7b…`、L11:802–814は`f3fb47da…`である。
  - review01でreviewerが計算し、39行と一致することを確かめた。Fableと敵対照合も再計算した。
- **追補条件（live26記録72行）**：「計測専用意味に限る。試作品生成・Pattern選択・screen ID発行は含まず、-002の処置を継承しない」。
  - 正常系、前提、期待値に、生成・選択・発行や-002の意味は入っていない。3者とも、そう確かめた。
  - 3項目には、それぞれ単独の拒否CASEがある。
- **base整合**：merge-baseは依頼のbase（03d9cd19d、#2644 merge後）と一致し、削除行は0である。
  - reviewerは、新baseから見た049の追加250行が、旧base（0acbed34b）に修正commit `78c5bc12e`を足したものと一致することを確かめた。
- **条件付きの戻し先**：1件ある。区分を保ったうえで、個体identityだけをunknownにする許容形である。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - `merge-tree`は衝突なし

### 照合の経過
1. **review05の解消の確認**（reviewerが差分で確かめた）：M1〜M3は解消した。review05で固定した表の太字マスに、r22の9件が置かれた。
   - device/view条件の未指定・未結合：4件
   - prototype/profile/oracle/fixtureのauthority unknown：4件
   - 対象revisionの欠落：1件
2. **Opusシンプルブラインド**：Major 0。固定した3表（項目×状態、出力要素、禁止列挙）は、全マスが○になった。041節・047節とのID衝突はない。
3. **Fableの判断**：「承認してよい」。固定親のSHAを再計算した。PO追補条件の遵守、戻し先4区分、生成拒否も照合した。
4. **Opusによる敵対照合**：「Fableの判断を支持する」。PO追補条件、3表の○マスが本当に誤りを落とすか、authority unknownの戻し先、041/047との相互作用を照合したが、崩せなかった。
5. **reviewerの結論**：委任の条件1（Opusのexact HEADでのMajor 0）と条件2（Fableの同一本文revisionでの判断）が、このHEADでそろった。

### 6本文（このHEADのSHA-256）
- business-verification `d645bd8e…`
- functional-verification `0d46ef74…`
- nfr-verification `022e1427…`
- business-requirements `7ea9e004…`
- functional-requirements `702bb566…`
- nfr-grade `b2694e22…`

### 後で直す残余（承認を止めない）
- **R1〜R4、R6〜R9、R11〜R14**：変わらない。
- **R5、R10**：解消した。
- **R15（fixture不足の戻し先）**：fixture不足の戻し先が、CASEによって揺れている。r09-005は設計ownerへ返し、r10-fixture-version-unknownとr22-m2-fixture-authority-unknownはLABOへ返している。どちらも、固定L2:1090の区分の中である。
- **R16（CASE-049-14の戻し先）**：CASE-049-14のoracleは、profileの根拠がない場合の戻し先を明示していない。

### 次の手順
- 結論：このHEADの6本文に、未解消のblockerはない。
- mergeへ進むには、次の2つが要る。
  - 委任承認の判断記録。このexact HEADの6本文のbytesとSHAを固定したもの。
  - Ready化。
- 本文のrevisionが変わった場合は、条件1・2をやり直す。
````
