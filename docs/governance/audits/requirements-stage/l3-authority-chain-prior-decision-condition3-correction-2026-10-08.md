# 旧decision記録と後続条件3claimの対応訂正

この追補は、[ce706 chain snapshot](l3-authority-chain-41groups-ce70628.json)のJSON/MDを変更せず、OS023とSECURITY009/012で旧decision記録と最終条件3照合を区別する。対象は既存snapshotが記録した後続chain候補の解釈だけで、新しい承認や意味検収を作らない。

| Scope | 旧記録（条件3 pending） | 最終記録／条件3が参照したreview | 条件3commentの対象HEAD | 旧→最終の6本文差 | exact targetでのmarker projection |
|---|---|---|---|---:|---|
| OS Stage 2a parent023 | review01 / formal [6046140606](https://github.com/RetryYN/HELIX-HARNESS/pull/2686#issuecomment-6046140606)、decision SHA `29986105…`、pin SHA `fd622de3…` | review03 / formal [6046523635](https://github.com/RetryYN/HELIX-HARNESS/pull/2686#issuecomment-6046523635)、decision SHA `5a6cab38…`、pin SHA `5823246d…` | [条件3 6046563574](https://github.com/RetryYN/HELIX-HARNESS/pull/2686#issuecomment-6046563574)、`e64f1ff873a27660188478a6679fc551d2bbb332` | 4/6 | retained（6文書の親marker抽出） |
| SECURITY Stage 1 parents009/012 | review02 / formal [6044310089](https://github.com/RetryYN/HELIX-HARNESS/pull/2676#issuecomment-6044310089)、decision SHA `e64bc34f…`、pin SHA `6db0612e…` | review04 / formal [6044761871](https://github.com/RetryYN/HELIX-HARNESS/pull/2676#issuecomment-6044761871)、decision SHA `10ff5dc3…`、pin SHA `63290ee9…` | [条件3 6044919993](https://github.com/RetryYN/HELIX-HARNESS/pull/2676#issuecomment-6044919993)、`ec540d649317e21435223c173a41fe83cef1eb19` | 4/6 | parent009/012ともunknown（親固有markerがない文書あり） |

## 実bytes照合

- C3 commentのraw bodyはOS023が2,615 bytes / SHA-256 `430a3421a27d7a92d6f1e2ab85b5e5fb1d22a3c5869f2c0aee6724f730575aef`、SECURITY009/012が3,254 bytes / SHA-256 `9e91220c2312e939380fdf41a90c61937a457d366ca0324f55e420e36db6e57a`。どちらも本文で「条件3は成立」とし、最終review comment IDを参照する。
- OS023 C3はreview03 comment `6046523635`の対象 `5eddb1063a05837bf7216276e8334d6c7a600ce5`を明記し、そこから追加されたのはreview03用decision MDとpin JSONだけ、6本文bytesはreview03と同じと述べる。実測でもreview03 pinの6 SHAはreview03 HEADとC3 HEADで全て一致する。review01 formal `6046140606`はC3本文に参照されず、review01のpinでは4/6本文がreview03と異なる。
- SECURITY009/012 C3はreview04 comment `6044761871`の対象 `09dda5431bd92c23ea61a1a8adfe35547ecba655`を明記し、review02/03の判断を継承しないと記録する。実測でもreview04 pinの6 SHAはreview04 HEADとC3 HEADで全て一致する。review02 formal `6044310089`はC3本文に参照されず、review02のpinでは4/6本文がreview04と異なる。
- 4件のdelegated-decision pin JSONにあるreview formal raw bodyは対応するGitHub API comment raw bodyとbytes/SHAとも一致した。JSONには対象revisionごとのdecision/pin bytes、6文書別SHA、C3 raw body pin、mainの親marker projectionを収録する。
- 旧recordの`condition3: pending`を後続C3で埋めて旧recordをeffective扱いするのではなく、C3が実際に参照する最終review record/pinを限定chain候補として読む。旧recordは当時の条件1/2と対象revisionの時点記録として保持する。
- SECURITY009/012のmarker `unknown`は、6本文pinが確定してもBR/BV等で親固有marker行が抽出できないため残る。SHA一致を根拠に意味spanを推測しない。OS023は最終review03 record/pin基準で6文書markerがretained。

新appendixの数値とpinは、[`l3-authority-chain-prior-decision-condition3-correction-2026-10-08.json`](l3-authority-chain-prior-decision-condition3-correction-2026-10-08.json)に固定した。既存chain snapshotと274親index/mappingは変更していない。fixture実行、PO事後確認、L10実行、追加承認は行っていない。
