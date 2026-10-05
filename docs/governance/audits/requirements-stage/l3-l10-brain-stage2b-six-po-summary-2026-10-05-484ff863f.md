# HELIX-BRAIN Stage 2b 先行6親のL3/L10確認資料

本文revision `484ff863fc42bfaf32b4596a7b16020c5ae7a978`。対象は採択済み1.0親HELIXBRAIN-L2-001〜006の6件です。Stage 2b全28親の一部で、残る22親は今回の起草対象外です。Stage 1 prefixは未承認contextとして保持しています。

Domain、Pattern/Unit/Part、descriptor、競合処理方式の比較材料、relation、製品横断のVisual/UX知識を固定L2/L11から再導出しました。旧L3定義・旧要件・paired acceptanceを起点に、保持点・変更点・理由を監査へ固定しています。旧runtimeの方式・値を現行の実行条件にしません。

FR 6件・AC 24件・機能CASE 88件、NFR候補6件と測定設計6件、独立BR 0件です。初期10 Domainと15知識例では、各要素の欠落・誤identity・意味誤対応を独立変異として判定します。一般知識のunknownだけから製品ownerへの戻しを生成せず、製品固有要素を分離できない場合の境界と区別します。

NFRは必須条件の母集団を欠落時も保持し、意味状態と観測状態を分けます。有効観測は合格を意味せず、欠測を0へ補完しません。任意の性能閾値・最低標本数を採択せず、値候補は根拠比較として扱います。

作成側の静的検収はsource pin 34件、現行行pin 413件、6本文SHAとprefixの再計算一致、AC/CASE重複・孤立参照0件。scfctl 147件・fail 0、stale 0、residuals 0、govcheck 7622/57/58、diff check合格です。

**独立Claude review、対象revisionのPO L3承認、L10実行・性能実測、C13持越し所見の解消は未成立です。** 下流実装・採用・releaseの許可を生成しません。

| 正本 | SHA-256 |
|---|---|
| `docs/helix-brain/L3-requirements/functional-requirements.md` | `398379b93f46d208d42dd57f9659c96eaa013075c1d7cb56f1f76415c39c9ac4` |
| `docs/helix-brain/L3-requirements/business-requirements.md` | `fa7425ca0746656c13f7476bb0c542775563fc12c5f97265b94dc3dbebb08ce9` |
| `docs/helix-brain/L3-requirements/nfr-grade.md` | `476a524c2e2b55fc524beb9f0cb68cc3642bc057850f561ebbe0825f75624368` |
| `docs/helix-brain/L10-verification/functional-verification.md` | `a4ff7b1fd611c170c7ee9a41d5e76b60f6ecb5f50d853e247e0a50a782c9c10e` |
| `docs/helix-brain/L10-verification/business-verification.md` | `5b4091e2414159c33e9b9434ceebe8d064ed7c856cc42276833b3520531061b2` |
| `docs/helix-brain/L10-verification/nfr-verification.md` | `5121ee4e620c3229b50fd17f36ead6355554456a58af2b3e0302ea3c07c2adaa` |

静的監査: [l3-l10-brain-stage2b-six-static-validation-2026-10-05-484ff863f.json](l3-l10-brain-stage2b-six-static-validation-2026-10-05-484ff863f.json)。
