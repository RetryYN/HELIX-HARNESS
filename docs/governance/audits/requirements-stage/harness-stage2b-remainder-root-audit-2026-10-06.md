# HELIX-HARNESS Stage 2b 残5親 L3草稿・静的監査

- 対象: `HARNESS-L2-017/018/019/020/024`、L3/L10草稿のみ
- 監査対象base: `0757e15875f6defff8b3af41ff61882e685a1e24`
- 固定L2/L11の採択時revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 固定L2/L11の後続pin: `633bf12ea`
- 結果: 静的な本文・identity・参照対応を確認。L3は未承認。実行・受入・実装・release・stage完了を主張しない。

## authority、採択revision、後続metadata

2026-09-28の[HELIX-HARNESS PO判断記録](../../decisions/helix-harness-requirements-po-decision-2026-09-28.md)が、`f6dad2a33e24f000b87d7f09b8d40288257e74cc`上のL2全文SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、L11全文SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`を対象にし、明示候補24件を採択した。5親に対応する管理登録IDは`MPR-RC-HARNESS-L2-017-001`、`018-001`、`019-001`、`020-001`、`024-001`。register上の`registered_proposal` / `authority_effect=none`は登録metadataであり、採択状態の代替ではない。本文metadataや後続registerの変更はこの判断が固定した親revisionを取り替えない。

後続pin `633bf12ea`のL2全文SHA-256は`9c9d499530f4d55c672391614eae6a3ccd6970d69d7c3ebc6e205ead24750c7d`、L11全文SHA-256は`1f5c32b8ef8f50c1f3ca1780f0a25419e1d74034bb7827ff01d9725c1fd388c4`。固定親spanの本文は採択revisionと同じであることを行bytes digestで確認した。後続pinの全文hashが異なることは、採択対象の置換・再採択を意味しない。

| 固定親span | 行 | 採択revisionと633後続pinで一致するraw-LF SHA-256 |
|---|---:|---|
| L2-017/018 | L2 403–417 | `fffcd4998b3aa5a52052631730d95c6786564d873b56c15fd3083d6e7859b3b4` |
| L2-019/020 | L2 419–437 | `cde7c93e7998aff7bb53ed9cc8ec8fc653d7ca03c1c57066fb975cb8b8234e34` |
| L2-024 | L2 499–525 | `ec4ece6e411152941c16cd8dc25a1c43613dff5e6b5c3051ef675c66c8b9b2cc` |
| L11-017..020 | L11 212–217 | `2d3d319fb53ba979ee70e3b457aff15dc009e358c8cf426b00a627fff6c29dc3` |
| L11-024 full local context | L11 235–260 | `638e6ddf383c40fab1d17c57ccec6fafbb56aa724216c547863da2f65d1e49cc` |
| L11-024 requested decision/example span | L11 240–260 | `362e8cb3266bb14daa4139361d51dbebf1de259acd853d9f50af578c04bf639f` |

L2-017 stays within Release Port eligibility, reproducibility, rollback and Deployed/Observed boundaries; this draft does not import old static inspection, build pipeline, promotion stages, or release implementation choices. L2-019 states CORE as its sole standalone dependency, admits any release unit as an entry point, and keeps full Reverse as the recovery route for unknown provenance, legacy material or missing design trace. L2-018 retains all eleven owner-defined quality axes and separates designed/implemented/verified/observed/operated. L2-020 preserves adjacent contract matching, backflow and outstanding obligations. L2-024 keeps the four domain states distinct, preserves timeout/re-entry, and distinguishes required-information unknown from a prepared human-decision packet.

## 旧sourceとexact digest

旧sourceはarchive上の本文を読み、`legacy-asset-disposition.jsonl`のasset ID・path・full SHA-256と照合した。以下のspan digestは指定行の生bytes（LF含む）で計算した。該当旧sourceは意味類例・差分根拠であり、旧方式の採用やruntime/test/CIの実行を意味しない。

| 親 | asset ID、source path:span | source full SHA-256 | raw-LF span SHA-256 |
|---|---|---|---|
| 017 | `LEGACY-ASSET-A2F6A697D7FFFD490B57` `docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md:82–100` | `336d361ec89c36ca377113aca2f08b6b510cd0127ddbba191d311cec4990c89c` | `e02b17fc5f52ea6c5b26d37ed65f52520153ac25ff40ebc697a27c210c308f6c` |
| 017 | `LEGACY-ASSET-A2F6A697D7FFFD490B57` same source `:123–131` | same | `008e6a506cdca651baec2484f34d2ac964ed9949f4d5355e9afc190fc53c7f88` |
| 017 | `LEGACY-ASSET-35C7D2CCFBDA7AAD304D` `docs/test-design/helix/release-module-bundle-composition-acceptance.md:22–42` | `71600a710a31b47c1db3434d68fd6135366058f1c591df489a57a51732cd423b` | `dffeae81102d651da3deac3ce8f1f3e05c6184fa1b0f80e6cb2ded558d3a24a8` |
| 018 | `LEGACY-ASSET-17C4BF78919578FEBB18` `docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:66–143` | `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0` | `50d4c5e38f722eb52928f1d46b9c23a1786ce620fd323eadf0da236075954602` |
| 018 | same source `:173–197` | same | `708296f405a8db744740d061f379b4d6a42eaa72532527c2e6fb5ee9d57675f1` |
| 018 | `LEGACY-ASSET-F46AB11BD14F2C0469F4` `docs/test-design/helix/product-lifecycle-operations-acceptance.md:22–47` | `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58` | `9b8c3ce8ca0576117398150e5758e3dc66e5aa00dc46f0c15c221339156eee00` |
| 019 | `LEGACY-ASSET-02D897E62EF2FA267267` `docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md:78–169` | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | `9a11817f29ed1c541c8259aede0b0e93df1a6f105e57b31bddfcda90a4a593dc` |
| 019 | `LEGACY-ASSET-0B5B38F146D9538C9A36` `docs/test-design/helix/universal-improvement-loop-acceptance.md:16–43` | `f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943` | `7c229fcaadeab4ea8d4156c2ae146dbf34b47ffaf8af79c6ca2deb713e3b0c3e` |
| 020 | `LEGACY-ASSET-A2F6A697D7FFFD490B57` `docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md:123–131` | `336d361ec89c36ca377113aca2f08b6b510cd0127ddbba191d311cec4990c89c` | `008e6a506cdca651baec2484f34d2ac964ed9949f4d5355e9afc190fc53c7f88` |
| 020 | `LEGACY-ASSET-B7E240E4CE0263FDBDF6` `docs/test-design/helix/L5-pillar-integration-test-design.md:20–60` | `0bf20d470daba6a63b515ebd0d53509ee24c64df2c9e6bd6235e7874af23a8f5` | `af36a201fce44f0b5210efe7306dc18ae2d562b9d9354bd5950b6da8b1d035eb` |
| 024 | `LEGACY-ASSET-E78B8D68CC327AA00991` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md:48` | `361a9ef773f7cf36cc0953f70cad205184ca952f2cb672431e5b929121ef1f61` | `1ce3dae8056a97ff09bd954f0d3afaa20b679c3c682ed67372e5663eed9516a8` |
| 024 | same source `:52` | same | `6ff1103782a2edde657b085c3130d78188f916fb86001e1dc29e822b2d967a85` |
| 024 | `LEGACY-ASSET-AD746F4F3487103519F9` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/requirement-discovery-json-authority-acceptance.md:22` | `3462b3da8269668c848799b07305f2fe135d8902de02121c2048d5686d98dc0e` | `25e60c56118dfbb4bcc47acd42a0cb3355ad8be5138f22b6ff063c87a7abbe59` |
| 024 | same source `:26` | same | `8699b50c5d42401d7f601b0443af4668eeb4722db255443728f3e5da58fbf9fd` |
| 024 | `LEGACY-ASSET-63DEDB3F6F768B251BC5` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md:30–43` | `d72c002d485628ba059346b6af6a7233cead8bdf060a2630289d1c8148e0e26f` | `148579143b5a2d92b96a3d864343737a19fa5194d99f5eb63a7dd70fec5f9b03` |

017 retains reproducibility/release-after observation intent but replaces the historical Module/Bundle, fixed build, static scan and promotion architecture with the fixed parent’s product Release Port and state contract. 018 retains explicit state and operational-evidence distinctions while assigning product quality decisions to the product owner. 019 retains partial-input and unknown preservation without porting the old loop state machine. 020 re-derives handoff and failure examples without adopting the old bundle/version graph. 024 retains question-priority and convergence evidence while dropping the old minimum-two-iteration rule; prototype applicability is conditional, not universal.

## 要件対とfixture参照

L3 FR/AC and L10 CASE are draft links only. There are 18 AC identities and 149 unique CASE rows after separating the same-fixture and unseen-fixture measurements for L2-024; every CASE references one existing AC and one scoped FR. Parent coverage:

| Parent | FR/AC | CASE | NFR candidate / NFR CASE | Business requirement |
|---|---|---:|---|---|
| 017 | `FR-HARNESS-L3-017`, AC-01..03 | 14 | `NFR-C-HARNESS-017-01` / `CASE-HARNESS-L10-NFR-017-01` | なし。business verificationに、独立BRを導出しない理由を記録 |
| 018 | `FR-HARNESS-L3-018`, AC-01..03 | 46 | `NFR-C-HARNESS-018-01` / `CASE-HARNESS-L10-NFR-018-01` | 同上 |
| 019 | `FR-HARNESS-L3-019`, AC-01..03 | 13 | `NFR-C-HARNESS-019-01` / `CASE-HARNESS-L10-NFR-019-01` | 同上 |
| 020 | `FR-HARNESS-L3-020`, AC-01..03 | 17 | `NFR-C-HARNESS-020-01` / `CASE-HARNESS-L10-NFR-020-01` | 同上 |
| 024 | `FR-HARNESS-L3-024`, AC-01..06 | 59 | `NFR-C-HARNESS-024-01` / `CASE-HARNESS-L10-NFR-024-01` | 同上 |

各CASE行は正常1条件か単一変異を示す。024のR054とR059をそれぞれsame-fixtureとunseen-fixtureに割り当て、同一fixture母集団へ未見fixtureを混ぜて測らない。024必須項目のR014–R027は各々一項目だけmissingにし、別CASEのR031で必須事項unknownを確認する。020および017の行は、当該行で一つのfieldだけをmissingまたはmismatchにし他条件を固定する。測定値はすべて未実行である。

## 対象文書bytes、prefix、静的検査

base `0757e15875f6defff8b3af41ff61882e685a1e24`からの既存6本文差分は追記だけで、既存prefixの削除・書換えはない。以下は補正後の作業tree bytesである。Git blobはbaseの同一pathのblob ID。

| Path | 作業tree bytes SHA-256 | bytes | base blob |
|---|---|---:|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `281881f35144b6f135e529ea2eca4ebed002c5ddc1d99391654bb9763c958399` | 133072 | `f5a6150e67316d35d70ba4ec138ec0a34429532e` |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `eb16a0eaad98ade1ae0171718485bb4623db235a3105930fd612ab43827c098b` | 8926 | `b953c4081485b0f3e10534f2df86316257837598` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `f4b4539bc4a213310ad40ec22afaedd8d43b863344aee0aac2684532fce0b948` | 30777 | `4061ef50c95c25daddafd54f5a69a320e62024fc` |
| `docs/helix-harness/L10-verification/functional-verification.md` | `1fdbc93e784de10c001162d1c324d11f7aaede53d805154b33ac4cf30b49e4ec` | 162386 | `427ea640c627a8e0c882a9ae61642fb0bba1c8a5` |
| `docs/helix-harness/L10-verification/business-verification.md` | `7a7a7289c783036fbecd010364e99e71cf4ec21b1d96d903056064aa7b021d5d` | 4970 | `92b7969c1f9183f6acd18613d5c1495149784cae` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `887368410406965a4874ab7a33e69ed68aee60fcbeb099b24262e2af81a1e013` | 23588 | `df6cee6ae77df295a88b051fef084fb9d5b4f96b` |

Static checks performed: diff/stat and byte hashes; exact CASE count/uniqueness and CASE→FR/AC target consistency; AC coverage by each parent; NFR parent/case references; legacy asset IDs/path/full SHA against the disposition register; specified source spans and digests; fixed L2/L11 full and span hashes. No test, CI, runtime, Bun, or execution path was invoked. This is a source/trace integrity record, not an independent review or L3 approval.
