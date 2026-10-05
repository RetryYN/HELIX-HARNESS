# PR #2606 HARNESS Stage 4 review02 correction

この追補は作成側の訂正記録であり、L3承認、独立review、merge admissionを意味しない。旧監査ファイルは変更せず、本記録はreview02の21所見を今回の本文箇所・固定sourceへ対応づける。

- Review comment: https://github.com/RetryYN/HELIX-HARNESS/pull/2606#issuecomment-5993674717
- Review body SHA-256: `d895a28fcc1bacc0e30d96b21ad32db75aa5b6ff80b01c621fe12273a07b7708` (11385 bytes)
- Base/prefix: `29e814a92af2aa52afcbcdd60549b32a2448513a`
- Review HEAD: `1160ba7aa7bdf8bdb99715d525aaab9447be856d`
- Corrected body commit: `e3d8db1c0d0745dfeddc8c15f1cb38b3f2d2f81e`
- Fixed L2/L11 + PO: `633bf12ea8f948db8ba3d6600179c4a9507377a7`; G0 assignment only: `59336627f11475456038db80ce6232ee39bbfa8f`

## 所見対応

| ID | 本文箇所・独立CASE | 固定根拠 | 対応 |
|---|---|---|---|
| M1 | FR:310,317; AC-026-06; FV CASE-026-35 | L2-026 534–540; PO 19/66; L11 359–360 | source-とcaseを修正。CORE所属/交換主体逆転を除去。 |
| M2 | AC-028-06; FV CASE-028-23/24/32 | L2-028 583–585; L11 379 | CASE-23 current design mismatch、CASE-24選択prior正常、CASE-32 digest不一致。 |
| M3 | AC-027-07/08; AC-028-08; AC-029-09; FV CASE-027-39/40, 028-42/43/44, 029-60/61 | L11 452,459,460; PO 66; prior audit correction | 各句へAC/CASEを追加し旧auditのout-of-scope判断を訂正。 |
| M4 | AC-029-02; FV CASE-029-63–66 | L2-029 597–598 | fieldごとの独立CASEとowner returnを追加。 |
| M5 | AC-026-06; FV CASE-026-36, 51–53 | L2-026 534; L11 354,356 | 開始表現を構成開始へ修正し、3 independent cases。 |
| M6 | AC-027-06; FV CASE-027-28,41–43 | L2-027 568–569; L11 366–374 | 候補語へ修正し受渡し/limits/holdのnormal・negativeを追加。 |
| M7 | AC-029-04/10; FV CASE-029-62 | L11 389 | 独立negativeとHARNESS-L2-014 return。 |
| m1 | AC-029-01/02/03/04/07; AC-027-02/08; FV CASE-029-34,38,47,49–51; CASE-027-26/27/29–31/35 | L2-027 571; L2-029 597; L11 402 | AC条件を具体化、L11 tuple正常も追加。 |
| m2 | FV CASE-028-24 | L2-028 583 | selected baseline normalを明示。 |
| m3 | FR AC-026-02/04; AC-028-07; AC-029-06; FV CASE-026-12/14, 027-01, 028-39, 029-26/27 | L2-026/027/028/029; L2-029 599 | oracle→022, design/API→014, selected source/input→source ownerへ。 |
| m4 | AC-029-07; FV CASE-029-25 | L11 387 (not 401) | 空行引用をL11:387へ変更。 |
| m5 | FR-029; AC-029-07 | L11 387 | 明示選択operation限定として記載。 |
| m6 | NFR grade 026-029 rows; NFR verification 026-029 rows | fixed L2/L11 026–029 | 対象CASE rangeを最新宣言へ揃えた。 |
| m7 | FR Stage4 introduction | PO 19/66 decisions; registration rows 55–58 | 紹介文で判断行・登録行を別記。 |
| m8 | this correction record; current source pins | L2 actual lines 581/583/585,601 | 旧監査をimmutable保持し、当記録で正確な行範囲を固定。 |
| m9 | FR-026 overview/AC-026-02; NFR-026 | L2-026 538 | 要件へ追加しdependency別CASEと技術候補に明示。 |
| m10 | AC-027-08; FV CASE-027-44 | L11 402 | target revision/product/selected source/affected scope正常を追加。 |
| m11 | AC-026-06; FV CASE-026-54; NFR-026 | L2-026 536 | 異なる値状態を分離する独立fixture。 |
| m12 | FR introduction; current registration pin | current register 2a4... line403; L2-026 semantic digest | MPR-RC-HARNESS-L2-026-003 と digest d797f5...13c73b880。 |
| m13 | this correction record correction_history | prior immutable review01 audits | provider route / missing unseen compatibility / impact-N/A / current registration / L11 adoption now corrected. |
| m14 | FV Stage4 case table | body table rows | 027-17/18/19 numeric; one unified Stage4 table. |

## Source pin・既存記録

- 32 source pins。固定L2/L11、PO、G0、登録行とlegacy sourceを指定commitからraw bytesで算出。bounded pinはLF-inclusive raw span SHA-256とfull-file SHA-256を記録。
- 026 current registration `MPR-RC-HARNESS-L2-026-003` はmanagement registerのline 403。semantic digestは `sha256:d797f5d29526059783ea6e469f762b6d51373dbece7223f2941894130c73b880`。registration authority effectはnone。
- 既存HARNESS Stage4監査ファイルは全てbytes/SHAを列挙しimmutableとした。過去の誤った addressed/line locator claimsは本文を書き換えず本追補で訂正。

## Canonical / 検証

| 文書 | prefix SHA | 現本文 SHA | prefix bytes | suffix bytes |
|---|---|---|---:|---:|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `6c94aed4826b32319abe0cd09afa176e783508e35df24a14060c2005fe0667a9` | `6ff072eb74651beaece688e84d58f852593bc359f3135b2abdf33da2772245bb` | 88922 | 21636 |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `ccb3f6ec5d7b3c51f629f8615977ef25319eae9426fc52d4dae0962fd3f41d5b` | `b15d4bccf9261dd05f9f4ff6018c8ec922d13501a5fcfbf9df99075e4bc1a5b7` | 6310 | 1464 |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `65c899c65f3f76c3d36d65ab750305e2460afc1e3d4c77067547c26a7b4aa2a9` | `d30748ba34fd6696d92058ac50266ef141b1469f3732ff1db965d8e321745ee7` | 23892 | 4062 |
| `docs/helix-harness/L10-verification/functional-verification.md` | `111f2a72bb9299069d21529d65ab47bf1afe73c1a11946e38e81f79a5b0a7ad9` | `2deed0bd32056a18b325d824abdcd2ea37c2245e9aaa61970dd1865e264010dd` | 60666 | 49360 |
| `docs/helix-harness/L10-verification/business-verification.md` | `48d60b8752a8bc404cc7a3c0874f3322f93405fabaabe358067daa0945542acf` | `ee401cfd216fd3f3f14d329e21ef919f2be84887784d52067f5bb9113cd90812` | 3875 | 520 |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `b9e844b83dbbdbac8f79b1cbc4f7df5d9fc32cfbe06a963cd1777d8ccced4c60` | `94e9e1ac4743914de6b51f0c0eb618115dea56da3b14402eda081b83eaebaf64` | 16954 | 3400 |

- Stage4 FR AC ID: 33宣言/参照、解決漏れ0。Stage4 CASE: 206、重複0。target CASE table列数・連続性を確認。
- `scfctl validate`: 147 bindings / fail 0。
- `govcheck`: 7622 atoms / 57 requirements / 58 files。
- 旧runtime、旧test/CI、新CI、外部実行、CASE fixture実行は行っていない。
- Rootによる検収および独立reviewは未完了。
