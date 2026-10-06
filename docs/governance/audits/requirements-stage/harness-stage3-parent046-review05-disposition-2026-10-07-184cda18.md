# HARNESS-046 review05 postbody 時点監査

対象: PR #2643、HEAD `184cda18066c2850aca7a9bd980ca8ce25fd2c9a`（parent `884e43cff7d4c7d23a2f4ee70306350cc7c9633e`、base `0acbed34bfda48e32092feb63db61d2eff6d5ec4`）。監査対象は採用後本文と受領済み固定pinで、作成者側の静的照合である。

JSON: `docs/governance/audits/requirements-stage/harness-stage3-parent046-review05-disposition-2026-10-07-184cda18.json`（322273 bytes、SHA-256 `569c3ee3aa2adfacb49e5a5c4acdd4a140e4513ea18ddc8ca97985863480fc9c`）。

## 実測結果

六本文それぞれで、HEAD上の物理suffixが採用候補の`after_text`とbyte一致し、親HEADからsuffix開始位置までのprefixも不変であることを確認した。checkpointの全体SHA/byte数も現在のGit blobと一致した。

| 文書 | 全体bytes | 全体SHA-256 | suffix開始行 | suffix bytes | suffix SHA-256 |
|---|---:|---|---:|---:|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | 16925 | `991fd9ec3ac38d9a5d842ac0ecff96c49c3470eac0fd17ad8ea53d8686f28858` | 134 | 3398 | `ed0f3aedd618ce08e5b4f92bf7af29975dd42ea94d98677f9c9a1dc27f9eb34e` |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | 222932 | `f8201ca498de5a3047e90ca54e75c7afdfff297fff8c5d7ffde1053d1a328329` | 764 | 7574 | `789e0769761c48d70613326f3304b386601d27ac1e32e3769b874a552a227c27` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | 47509 | `bb940387d51330c9ba0640b7a727f2881a216776d92ae8605e9e98f6d252b833` | 206 | 3680 | `b33375d731833186559a05f15add296f6b699479d2898e822a23ba929a39d89c` |
| `docs/helix-harness/L10-verification/business-verification.md` | 13054 | `91925fc047dac8fb976173585db59f4b1a79fd1b060e70bbf3062a3000a81153` | 95 | 3947 | `e07388989c50d859e84c1a615875af6d96168a52d560d09b089094b4c50cf809` |
| `docs/helix-harness/L10-verification/functional-verification.md` | 723862 | `f47719ca8ed36ad0de121d3ededfaaa182ff031de98c3e389c852b3e7fcd02c6` | 1719 | 44971 | `30af14271461bef3136dde32c6d07b772de0887fef16890702e0d21da0970830` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | 41285 | `60d26666faa47bde5b3dd50af70f55a9d471e4a4c90c577f400b3d500bcad64e` | 184 | 3902 | `25b71ea21435630f594eebb047704b35a6e5b5e480000624b5cd8a5c24fec5db` |

functional-verification.mdの物理定義行は74件、IDも74件すべて一意。review05適用直前の72 IDを全件保持し、`CASE-HARNESS-L10-046-r12-refuse-os-saved-state`と`CASE-HARNESS-L10-046-r12-refuse-os-runtime`の2件を追加した。古い`root-harness046-body-checkpoint.json`にある66件はbase `3c3c512...`時点の履歴値であり、現在件数として扱わない。

## 保全した根拠

- 正式review05 raw: `/tmp/root-pr2643-comments-review05.json`、12 comment objects、file SHA-256 `6fdacae85fc0fac0350646ebc326d2e72b5682a3de58a58db5bc3ce617bfc79a`。R1–R22とcomment 6025884866の全文をJSON内に保持。
- 旧48 CASEのraw literal・line/hash inventory、固定L2/L11 actual span、PO採択行、旧asset sourceと範囲限定consumerをJSON内に保持。
- 旧decision recordとreview01 X1監査の原文、revision、bytes、SHA-256を候補から移し、時点不変の記録として保持。今回のHEADへの承認やX1の修正は行っていない。
- 採用候補のmetadata/historyも出典として同梱し、旧66件と現在74件の時点差を明示した。

## 確認範囲と未確認

- Root報告のgovernance check / diff checkはPASSとして記録した。Worker側での再実行はしていない。
- fixture、runtime、CI、独立review、条件1・2、L3承認は未実施・未確認。旧decision recordは以前のcontent revisionを対象とし、現HEADへの承認効果を示さない。
- このファイルは`/tmp`の監査候補であり、正本への追加・commitは行っていない。
