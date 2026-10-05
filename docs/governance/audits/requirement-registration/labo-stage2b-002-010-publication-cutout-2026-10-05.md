# LABO Stage 2b 002–010 公開cutout — 不変記録

本文revision `62e77c01a84d17fe3d30d4478293cf53e0cd1b39` は専用branch `codex/l3-labo-stage2b-pub` の候補commitです。基準mainは `28b3d3645e6298c159758700c2edd3d396c336f5`。後続のmain `f54ea028ddd37fd9aea2924e500dafe9dbd72a62` も確認し、差分は無関係なscaffold research 4件のみ、LABO canonical 6 pathは引き続き存在しないことを確かめました。公開・merge前はその時点のmainへ再照合します。

対象は採択済み親HELIXLABO-L2-002〜010のStage 2bだけです。Stage1/Stage2a本文は収録していません。親採択の記録は対象L2 identity/revision/versionの登録であり、このL3 revisionの承認ではありません。固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc` が意味のauthority、PO記録 `633bf12ea8f948db8ba3d6600179c4a9507377a7` は親採択登録、G0 `1880c422311a7f8321dbb0e2b98fa12c69449201` は順序のみです。独立review、root検収、POのL3承認、実装・実行・release許可は未成立です。

Stage2b累積範囲は9親、9 FR、27 AC、115 functional CASE（002–005: 40、006–010/CASE14後: 75）です。独立BR/BV/BCASEはありません。旧74 CASEのsource receiptは旧bodyに対する時点記録として変更せず保持しました。

## 6 canonical SHA-256

- `docs/helix-labo/L3-requirements/business-requirements.md` — SHA-256 `214e6c1c59c5518b84b188102d8cba389995b2d97cd1dad40610887288fcb623`, 11行 / 2009 bytes
- `docs/helix-labo/L3-requirements/functional-requirements.md` — SHA-256 `8785f439ec462d0acfef8efc86b8f739265492d5674dab3a3a185ee7f9e6bdda`, 185行 / 34962 bytes
- `docs/helix-labo/L3-requirements/nfr-grade.md` — SHA-256 `f79c3f7a1da6a14fb7be9d21d5abe062bdd2ca68fe38765170462eeb3bf39dab`, 36行 / 12408 bytes
- `docs/helix-labo/L10-verification/business-verification.md` — SHA-256 `3723423cc1c99cf8db283089a4d1386dd6b557a47b07236ce6d712a90b8b67ae`, 11行 / 1738 bytes
- `docs/helix-labo/L10-verification/functional-verification.md` — SHA-256 `818accfe1034720f3c4336a04062d2e6fc54e0e60311a2604ee1dcc755556a6a`, 214行 / 42933 bytes
- `docs/helix-labo/L10-verification/nfr-verification.md` — SHA-256 `ef9903af44756113942b095965de02b55451a6e01d5495ef49547d43b092a6b4`, 39行 / 13357 bytes

現行本文全行についてLFを含む各physical line SHA-256をJSONの`current_body_line_pins`へ固定し、6全文SHA・bytes・line数を同じく固定しました。過去のfixed/legacy source pinsは第一4親root receiptの28件、006–010修正receiptの58件、別途確認済み依存span 2件、合計88件を実Git blobからfull-file SHAとraw-LF inclusive span SHAで再計算しました。

## 静的確認

FR/AC/CASE ID対応、全relative link、Stage scope除外、`git diff --check`を確認しました。9 FR、27 AC、115個の一意CASEがあり、全ACはfunctional L10から参照され、L10側のAC参照にも未定義IDはありません。選択6文書にはStage1/2aのparent/CASE本文がありません。旧runtime、旧test、旧CI、Bunは実行していません。

## 変更範囲と限界

本文6件とこの記録だけを作成しています。旧first-four creator/repair/root-validation記録、旧006–010 source/pair receipt、旧repair01 overlayは対象revisionの記録として不変です。本記録は今回のcombined cutout本文revisionを固定する新しい時点証拠です。作成側によるpush/PR/mergeは行っておらず、root検収待ちです。
