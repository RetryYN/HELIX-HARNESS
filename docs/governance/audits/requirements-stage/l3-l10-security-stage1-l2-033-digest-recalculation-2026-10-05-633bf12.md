# SECURITY L2-033 candidate digest再計算記録

- 状態：固定receiptの手順から2つのcandidate digestを再現。作成側の証拠であり、root検収・独立review待ち。
- 対象候補：`HELIXSECURITY-L2-033`。authority effectなし。
- 規則source：`docs/governance/audits/requirement-registration/security-v13-worker-context-coverage-receipt-2026-09-28-r2.json:5` at `633bf12ea8f948db8ba3d6600179c4a9507377a7`（raw span SHA-256 `3c9c7c95043b5ecb4e2a2265ef8e144bf2e15f1a01b7c2dfe6e57ea99bc9ed79`）。

## 再現手順

1. 固定L2本文のHELIXSECURITY-L2-033 heading section（lines 455–466、次heading前まで）を取り出す。
2. 同文書末尾の `## P0訂正追補（対象: HELIXSECURITY-L2-033）`（line 479）からEOFまでを取り出す。
3. 各blockの末尾CR/LFをtrimして1 LFを付ける。`normalized_section + one LF separator + normalized_tail`をUTF-8 bytesで連結しSHA-256する。

## 結果

- `318ec4a04abb3c1cc17111b3d939f913facd5fd3`：`b486a0c44e8f21a6f8738dedeac91dcb94da335b73409b6adeaecf8fa639bf1a`。従来記録値 `b486a0…` と一致。
- `633bf12ea8f948db8ba3d6600179c4a9507377a7`：`0008f6e6f06f48140267ccdea4842fcf22962d81812bb22f4f6446c78fd5c623`。従来記録値 `0008f6…` と一致。

033 heading section自体は両revisionでraw span SHA-256 `4707d0a3deb5158f72f6b36e111d7c0519015181de390c06f0d2a45601b4eb0d` として一致します。compositeのtailは「P0追補からEOFまで」なので、318ec4のtailはline 485で終わり、633bf12では後続本文を含むline 499まで続きます。このsource差が合成digestの違いを説明し、既存の2歴史値を再現します。

全raw span/full-file hash/byte数を同じJSONへpinしました。旧監査・正本は変更しておらず、`verification_json_sha256` のartifact identityは未解決のままです。再計算から採択、実装許可、review closureは生成しません。
