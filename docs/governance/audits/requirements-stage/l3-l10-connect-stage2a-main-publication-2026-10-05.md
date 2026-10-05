# CONNECT Stage 2a公開切出しの検収記録

採択済み006の片側交換だけを公開する。本文revision `6df6bd15984e0a6ddfaba11ef64c507a3fee9a11`。main `fa642cddc3c4446e3635f1c6badd90209862cfac` の承認済みStage 1 6本文をprefixとして保持し、元本文 `241f262ade6962fe46d5f72a637dabe3b83ae4c0` の6bytesを同一に切り出した。新規追加121行、FR1/AC4/CASE5/NFR1、独立BR0。

rootは6suffix、固定L2/L11と9旧sourceの対象spanを読み、11固定/承認済source pinと9旧source full/raw SHA、6本文全SHA/prefix、121行pin、旧2監査blob不変を照合した。直接対応する旧片側交換L3は限定検索では特定できず、旧FR+AC/L10形式とTER/distribution類例を限定的に再導出する。検索hitを直接の意味根拠にはしない。

元本文/旧監査本文revisionはGitHub API HTTP422でlocal Git object限定。旧監査のrevisionやhashは書き換えず、公開branchで同一bytesの本文を固定する。詳細と全6SHAは[JSON](l3-l10-connect-stage2a-main-publication-2026-10-05.json)（SHA-256 `a9d632826c3772c2960635def54b376901d0da0d98ac49b8d0d3f4029cf851f2`）参照。

静的検証147/fail0、stale0、residuals0、govcheck7622/57/58、diff-check PASS。旧一括reviewのC13-M12とC13-Uは独立照合範囲として持ち越し、完了を宣言しない。L3未承認・L10未実行。旧runtime/test/CI/Bunなし。
