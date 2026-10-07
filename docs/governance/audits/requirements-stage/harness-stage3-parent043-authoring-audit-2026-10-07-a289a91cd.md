# HARNESS-043 post-body authoring audit

対象は canonical HEAD `a289a91cd7c37490346ac6f2acc3cb5a40992f23`（base `3c3c512c09320c0494904602b23e544a81206eed`）です。本記録はRoot checkpointと物理Git bytesの整合監査で、独立review、POのL3承認、fixture実行、意味完全性の認定ではありません。

## 確認結果

- 6文書すべてでbase prefix、追加suffix、HEAD全体のSHA-256がRoot checkpointと一致しました。候補本文との比較では、既存内容との区切りLF 1 byteを含めて一致します。
- source pin 25件をGit objectから再計算し、全体SHAおよびspan指定のあるpinのraw span SHA/byte数が一致しました。PO固有pinはL2-043のdecision row（line 48）。L2/L11の2固定spanは042/043共通要件で、PO固有authorityとして数えていません。
- FV本文の物理行で043 CASEは43件、IDは43件uniqueで候補の順序と一致。旧28 CASE literalは旧revisionの指定lineからraw-LF SHAを再計算し、28件すべて一致しました。件数は意味上の完全性を示しません。
- 翻訳記録は42 CASE・117 cell変更を保持し、r06 TBD correctionと6文書suffix mapをJSONに含めています。

## 文書別bytes

| 文書 | prefix SHA-256 | suffix SHA-256 | HEAD SHA-256 |
|---|---|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `4fce6bb6cd3af5938a11719866050bd729234adbebf70c4210398aa90cad5dff` | `1846f2332175f82e6570639d33c17bc30583fb8521e68fb8d2a7b22ad60c6c51` | `9f4851eed6ef4ae88e2a6e1ab265b9f1749defeb8a2a3b43d657624f9d62c2cb` |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `c51f0bc2b98ae5c6a77bfa354050ec70ee87a70641b5f0161b14d5a3afd33e8f` | `8d806b285b554f895d1e3b8125b92e398db31ca5bcab68296d866a06c07e9129` | `76d0608a75c0b92dfa4802d3903e1057f83cde6308a47e79255d840b3a92592d` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `b364e8c6dc92f4548df34638488fefec1533d13941a991de685a74bb64471fc9` | `be99bed2c7755145b8a0f1ae8703e398f42926d5c39721857ca780954022cdf3` | `ecebd6f33a2c9a7c50079bd6f0018124c1ea3bb0f536ace87a4a7ba3a3e5c061` |
| `docs/helix-harness/L10-verification/functional-verification.md` | `bc63c3abbabd727dbb2cfa37a5c3741985181308ad93378ebf2e5846907770f0` | `7f0323655f455edfc6d8dd1da88e2756b1b3893e5e6664b6b423457797cf4f32` | `675b523e2128ef12f9f26e210ed3d9adde2b85fefb93df65fad70045ee293cb0` |
| `docs/helix-harness/L10-verification/business-verification.md` | `2faacacf78b835b5127e990b805adb97b079439c887a1ef2bd6d69f2478d53c9` | `233f15d3911b5fe44c4b6041f9ed348e08d2cd6814fd27dcfd4c1cb12c0a1c9f` | `51a4cbd6825a72cafbbdf50a487445bb3373e6c2d8199094f645d139a8e2355f` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `bb319529b2c2e2af75067c36bf204d386816fb7e78d48f18043973be6290ccd1` | `047c937dc87c01fb22b44ce900e932a0e47d43e02609695d90eb6b55df576281` | `6e5b9afef8ed3f5be83f8dd3a77e58fe0a19209c54d104fcb4222b885a56a14d` |

## 証跡と限界

全25 pinの明細、旧28 literal/raw SHA一覧、現43 IDの物理行番号/raw SHA、翻訳履歴および元のreview finding記録はJSONに格納しました。PO decision rowと042/043共通spanは別区分です。

独立reviewは未完了、POのL3承認は未取得、fixtureは未実行です。本文の意味完全性はこの監査では判定していません。

Candidate input: `/tmp/harness043-japanese-suffix-candidate.json` SHA-256 `cb1087584c07dfc1aab89f0e48bf8e4b500c2c44d63215ea4f0c36cdb4b657d0`. Root checkpoint: `/tmp/root-harness043-body-checkpoint.json` SHA-256 `637024e0f7eef912192a217415cb7444a95f92861f68ddee0cde28f03289b3ad`.

Rootは固定PO digestの正確な親spanも実読・再計算した。L2:986–1000 SHA da678d9181ebe76ae93084c27744d253c617ebe03b709d79f55b79d2abbc6666、L11:723–733 SHA 583bfaf669729d3148e072be3ca74f1ef125997e933f6a1a94f08c732cb6f4b4。共同042/043 spanと区別し、PO48採択-002と組み合わせる。旧候補の未採択文言を現在authorityへ昇格しない。
