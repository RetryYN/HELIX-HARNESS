# INTELLIGENCE Stage 2a review02 修正追補

本文修正commit `6170f4d73afdf8537c2e67f38f61f020fd1e0240` を対象とする作成側の静的追補記録。正式指摘はGitHub comment `5988425077`、本文SHA-256 `04428b9acf4a99124345dd4f3b4656b7927c9716174c4ea2afac4c2efd0863dd`。本文と追補監査を別commitに分けた。前の13e7監査および80ef追補は変更せず、各SHA・byte数は同名JSONに記録した。

修正内容:

- G13のAC-INT-010-07からCASE-INT-010-02i/jを追加し、proposalだけでOS assignmentを作る変異と、proposalだけで実行許可を作る変異を独立に拒否する。assignmentと実行許可はOSの別判断に残す。BR、BV、NFRのfixture censusにも反映した。
- CASE-INT-010-04gに固定L2-061:362-364を根拠として記載した。Worker実績・水準提示はLABO、task別配置案はINTELLIGENCE、実割当はOSの責務である。
- CASE-INT-010-02dは品質未達を理由・除外として保持し、判断が未決・失効・適用境界外の場合だけ判断ownerへ戻す。
- 13e7監査のowner_routesにある過去の分類誤りを訂正履歴として特定した。schema/contract identity/version自体が不明ならINTELLIGENCE、受領actor/time・受領receipt・適用pack version/scope互換bindingが不明ならOSへ戻す。過去JSONは変更しない。

固定L2-010、L2-061、L11 G13とPO採択行のraw LF-inclusive span/full-file SHA、6文書の修正後SHA、現行行pin、正式comment SHA、旧監査のSHAとbyte数はJSONに記録した。修正後のID trace resolverはAC-INT-010-07→CASE-INT-010-02i/j→BR/BV/NFR censusで確認した。

検証: `scfctl validate` は147 bindings、fail 0、`stale=0`、`residuals=0`。`govcheck` は `ok atoms=7622 requirements=57 files=58`。`git diff --check` はpass。旧runtime・旧test・CI・Bunは実行していない。

この追補は作成側の検証記録であり、独立review、指摘closure、PO L3承認、実測結果を意味しない。root検収とOpus/Fable独立reviewは未完了。
