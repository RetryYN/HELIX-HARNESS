# HELIX-LABO Stage 2a 現行候補概要

- 対象本文revision: `a93a99d16b18d04f0ae2eee6265600b1576434df`（作成側修正。独立reviewとPO/L3承認は未完了）
- 固定親: HELIXLABO-L2-055/056/057、`version_target=1.0`。
- 対応したreview入力: Opus comment `5987979709`（Blocker 0、Major 1、Minor 1）。旧review02監査は不変。

## 修正内容

- Major M3: LABO-057の方式固有証拠（選択CONNECT契約の有効性/版、human receipt自体）と、両方式に共通するsource/scope/state、送受receipt一致、result revisionの健全性を分離しました。共通不成立条件ではどちらの方式でも受領成立にせず、CASE-06/23で個別に確認します。
- Minor m1: LABO-055/056の以前の候補にあった測定観点を、現行候補と並べて戻しました。055の6独立negative・receipt再構成・未評価classから資格等を作らないこと、L11:196の適用境界、056のscope/authority変更ゼロと失敗・不一致の未評価への書換え禁止を記録しています。

## 六文書のSHA-256

- `docs/helix-labo/L3-requirements/functional-requirements.md` — `0b03404387d363026a5ea134cc69e30a08aff26ad08b604b27f33b522c599931`
- `docs/helix-labo/L3-requirements/business-requirements.md` — `ce1a51a7448aef29aefb59edaadaf41eef2df4b53514285fe69330392eff5e83`
- `docs/helix-labo/L3-requirements/nfr-grade.md` — `ef66b0090e50683a7a52886487d98b92c8ede284983788a89a88be68d26c36ac`
- `docs/helix-labo/L10-verification/functional-verification.md` — `e43dc297863a47efdc007394cf6b04b9bda88788dbfcc6e45aa492f6ca22ad36`
- `docs/helix-labo/L10-verification/business-verification.md` — `dcf067f11abe2bb114b4250e521d8745b77a255403e77e3705c74fc4b805a166`
- `docs/helix-labo/L10-verification/nfr-verification.md` — `cf3c02adbcd23d36d11b65a8cb2afc2531a1a82ddeffe32fc3252e8bac256559`

Stage1 prefixは承認済みmain `91660f403d203dff92a50ac7f5484db6ab13f96d` と六文書すべてbyte一致です。本文・source pins・Stage2a現行行pinの詳細は、このsummaryと同じstemのJSON監査にあります。

静的確認: `scfctl validate` 147 bindings/fail 0、`stale=0`、`residuals=0`、`govcheck` 7622 atoms/57 requirements/58 files、`git diff --check` pass。旧runtime/test/CI/Bunは実行していません。

未完了: root検収、修正後HEADの独立review、PO/L3承認、実装・L10実測。未解消旧findingを閉じていません。
