# CI deferred obligation回収の終端fullback証拠

## Forward事実基準

- Forward PR: #1290
- candidate HEAD: `1e312e8027bfc686f15bc8325eb55fa1ea373aa7`
- Claude exact-HEAD review: https://github.com/RetryYN/HELIX-HARNESS/pull/1290#issuecomment-5483662275
- review receipt: `sha256:5b6bf73ec4c42a47aca8eb9b0e77714e2386dcb484b53d93a2136f149a29f882`
- draft CI: [`33429356878`](https://github.com/RetryYN/HELIX-HARNESS/actions/runs/33429356878) success
- Ready CI: [`33432795146`](https://github.com/RetryYN/HELIX-HARNESS/actions/runs/33432795146) success
- canonical merge: `2799d499cec2b9c2d6b5fab0e1e2036f240f470b`

## R0〜R3判定

deferred obligationのexactly-once回収、origin backprop、profile非相殺、quarantine期限、selector fault exact setはCIS-R-13〜15、L6、L8、runtime、U-CIDEFER-001〜013で一致する。failed terminal runのoracle欠落もfail-closeし、要求意味と外部契約の変更は不要である。

## Reverse canonical事実基準

- Reverse PR: #1305
- final candidate HEAD: `1cfa3817b8211237b6ac162a610d2488576353c8`
- Claude exact-HEAD review receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/1305#issuecomment-5485900343
- receipt digest: `sha256:48b1d29bba233c2b439a26a6e69c3ac6ceee7e4e6daca6e5e41210ac8a129795`
- review CI: [`33446819961`](https://github.com/RetryYN/HELIX-HARNESS/actions/runs/33446819961) success
- Ready CI: [`33448649188`](https://github.com/RetryYN/HELIX-HARNESS/actions/runs/33448649188) success
- DB receipt: `sha256:7d2845d1996c685bfa2846dfdd7561af4f600cbc802f2a5fcfbe738b7f4134c9`
- DB projection／replay: `sha256:4fd627b8b1f702f8692f0370149243f0899bcfc06e5fcd27d73bbd0076631f09`
- DB checkpoint／replay: `sha256:1886e1833422176fd9da2342d72429d1bce5819e7c2a004e614d63a9ed167ff8`
- canonical merge: `d597df0c0ebcd29e6068f8394059ac3d38b84a1f`

## Terminal companion境界

本companionはForward／Reverseを`backfill_state: complete`、`completion_claim_allowed: true`へ接着し、ForwardへU-CIDEFER-013とterminal Reverse dependencyを投影する。companionのexact-HEAD CI／独立review／canonical mergeとpost-main read-afterは候補文書で先取りしない。merge後にmain上の両PLAN、pair、snapshotを再検証してからIssue #1306、続いて#1208をcloseする。

Issue #1304のzero-injection mutation admissionは別behavior contractであり、本fullbackへ包含せず、未解決successorとしてopenを維持する。
