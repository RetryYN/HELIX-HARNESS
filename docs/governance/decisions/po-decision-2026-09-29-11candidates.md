---
title: "残り11候補に対するPO判断（10件採択、1件訂正待ち）"
decision_record_id: HDEC-REQUIREMENTS-11-2026-09-29
decision_status: recorded
decider_role: PO
decided_at: 2026-09-29
recorded_at: 2026-09-29
decision_basis_revision: 909c8015326f35f8d42ce12e3c388923de411d1f
source_repository_revision: 5aa100319361b0cc86edd3c51815ec777d55410a
authority_effect: effective_when_this_record_is_admitted_to_main_for_only_explicitly_fixed_revisions
---

# 残り11候補に対するPO判断

## PO判断の出所と適用範囲

POの発言原文は「この方針でOK」である。対象の「方針」は[Claudeの受領handoffの保存copy](../audits/requirements-stage/po-decision-received-handoff-11candidates-2026-09-29.md)に示す第4版外部監査見解の4区分である。元pathは`scaffold/review-handoff/local/po-decision-2026-09-29-11candidates.md`、原本と保存copyのSHA-256はともに`362de3e0bee09a33e75569684c7dd1c8e4a645ae9c1ea84a52f6c1af92cd9061`。このcopyはClaudeによる受領記録であり、貼付された監査見解のbyte-identicalな原本ではない。会話での発言の時刻・原本リンクはこの記録だけからは独立検証できないため、review側は受領の出所も確認する。

[先の57候補判断](po-decision-2026-09-29-57candidates.md)は書き換えない。本判断は、その後の未判断11候補のうち10候補を採択し、HARNESS-L2-049の現revisionを未採択とする。下表の対象以外、特に#2311のHARNESS-L2-055/056と、その後の候補には適用しない。候補の本文上の「未採択」は判断前の状態を記したものであり、採否は本記録と対象revisionを併読する。

対象節は基準main `909c8015326f35f8d42ce12e3c388923de411d1f`と記録用main `5aa100319361b0cc86edd3c51815ec777d55410a`で同一の節digestである。全file SHAは記録用mainのbytesを固定する。L2節digestは生存MPRの`candidate_semantic_digest`、L11節digestは対応する受入節をUTF-8 LF終端で取ったSHA-256である。旧source、保持・差分、未計上atomは各coverage receiptを参照する。MPRはappend-onlyの仮登録で、採否statusを追記しない。

## 採択したL2/L11のexact revision

| Identity | 処置 | 生存MPR登録 | L2 source | L2 file SHA-256 | L2節digest | L11 source | L11 file SHA-256 | L11節digest | Coverage receipt |
|---|---|---|---|---|---|---|---|---|---|---|
| `HARNESS-L2-041` | 採択 | `MPR-RC-HARNESS-L2-041-003` | `docs/helix-harness/L2-requirements/product-requirements.md` | `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108` | `sha256:d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260` | `docs/helix-harness/L11-acceptance/product-acceptance.md` | `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7` | `sha256:11759276200a6707762e76eeeefd901443e691bd1b0ff51b55cd3b6551fed58b` | `docs/governance/audits/requirement-registration/harness-layer-ledger-extraction-coverage-receipt-2026-09-29-r3.json#HARNESS-L2-041` |
| `HARNESS-L2-048` | 採択 | `MPR-RC-HARNESS-L2-048-001` | `docs/helix-harness/L2-requirements/product-requirements.md` | `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108` | `sha256:9328dccd943ac8f690d149673a5f05626465990f3197306a45d7b8cca27c34d5` | `docs/helix-harness/L11-acceptance/product-acceptance.md` | `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7` | `sha256:4a4d893e909d1ccc32b52cc96b22f82eaef6bffead7037677df561cd2617466d` | `docs/governance/audits/requirement-registration/o9-harness-coverage-receipt-2026-09-29.json` |
| `HELIXBRAIN-L2-031` | 採択 | `MPR-RC-HELIXBRAIN-L2-031-001` | `docs/helix-brain/L2-requirements/brain-requirements.md` | `421eba418a3fa639fdb46bdd902b33d59854aed544f11712d494d7d2e12eaaaa` | `sha256:65eb78860b59586c2d17c2a70a7134db8057a70f7025924bb00c9fa3a255e1ca` | `docs/helix-brain/L11-acceptance/brain-acceptance.md` | `833e80f6b27e6f20461f4c57dd8021d146badcd3a6296e2dd7148649a4389ed5` | `sha256:b9e074f72682d161905d96bb20beb06e312db5c23dfd643deb54cf188a18bb1d` | `docs/governance/audits/requirement-registration/o9-brain-coverage-receipt-2026-09-29.json` |
| `HARNESS-L2-050` | 採択 | `MPR-RC-HARNESS-L2-050-001` | `docs/helix-harness/L2-requirements/product-requirements.md` | `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108` | `sha256:abeb498cf39f62ca8f34ded2c439502fb18215f1e376109147096ebaa69ce1b1` | `docs/helix-harness/L11-acceptance/product-acceptance.md` | `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7` | `sha256:44191f5dc431e603cf91cc3639d4798fceb8a53f3c1b9076a8a1f038b6e2e763` | `docs/governance/audits/requirement-registration/harness-layer-ledger-refactor-coverage-receipt-2026-09-29.json` |
| `HARNESS-L2-051` | 採択 | `MPR-RC-HARNESS-L2-051-001` | `docs/helix-harness/L2-requirements/product-requirements.md` | `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108` | `sha256:e023408a45afa40bb674aebf53fcc870d6c4d9f8da155ce282b9fe5b69818f9b` | `docs/helix-harness/L11-acceptance/product-acceptance.md` | `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7` | `sha256:3f14cb4463fa67a69d82827040d249c93cb905b5ac6934769b15e1b9cf701300` | `docs/governance/audits/requirement-registration/phcap08-stage-exit-coverage-receipt-2026-09-29.json` |
| `HARNESS-L2-052` | 採択 | `MPR-RC-HARNESS-L2-052-001` | `docs/helix-harness/L2-requirements/product-requirements.md` | `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108` | `sha256:d49f8cf116879f4283313f9c01ae7fb72bc9c528b5205cdbd45d06c46221d25c` | `docs/helix-harness/L11-acceptance/product-acceptance.md` | `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7` | `sha256:3027c6b91b91ccf7cbab0c34821587956f8e8e7e20e5637f0fffaa591b2a633b` | `docs/governance/audits/requirement-registration/harness-fr52-command-identity-coverage-receipt-2026-09-29.json` |
| `HARNESS-L2-053` | 採択 | `MPR-RC-HARNESS-L2-053-001` | `docs/helix-harness/L2-requirements/product-requirements.md` | `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108` | `sha256:ebc78869f6d94668d9fed00d0a0415d068d85c0f61c0d98f01a9c4ec39710587` | `docs/helix-harness/L11-acceptance/product-acceptance.md` | `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7` | `sha256:c22abfd29780a4016b0fcef74d6b2c29b3628b81c12d0fcb0b1fcabfb48bb61f` | `docs/governance/audits/requirement-registration/harness-asset-identity-coverage-receipt-2026-09-29.json` |
| `HARNESS-L2-054` | 採択 | `MPR-RC-HARNESS-L2-054-001` | `docs/helix-harness/L2-requirements/product-requirements.md` | `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108` | `sha256:b76b7b1adec804a25bd9333663aa9b0d074f68518764c2874c994bcdf6ead193` | `docs/helix-harness/L11-acceptance/product-acceptance.md` | `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7` | `sha256:5d1ab0bad44ae305053932f0c82bcf472e145046125b638f5facab13eaaa2aa0` | `docs/governance/audits/requirement-registration/harness-specialist-handoff-coverage-receipt-2026-09-29.json` |
| `HELIXOS-L2-038` | 依存先と併せて採択 | `MPR-RC-HELIXOS-L2-038-002` | `docs/helix-os/L2-requirements/governance-requirements.md` | `c90be67dc90240434568491074d0e12fb593759ad9121ee9ef9bd3f932a41610` | `sha256:c3b0424bd39ac7c91166c87738fbefc1b20a11b904012d9ada768a113ccbe013` | `docs/helix-os/L11-acceptance/governance-acceptance.md` | `b965f3681d1f5231e4281d333538b65142dce8db0ae4807ed46caa7e928e30de` | `sha256:eabb68ea24cd3899c1af5832fbc9b53a0890545ac3879e0425a12c3ebde2e5d` | `docs/governance/audits/requirement-registration/os-layer-ledger-writer-coverage-receipt-2026-09-29-r2.json#HELIXOS-L2-038` |
| `HELIXOS-L2-053` | 依存先と併せて採択 | `MPR-RC-HELIXOS-L2-053-001` | `docs/helix-os/L2-requirements/governance-requirements.md` | `c90be67dc90240434568491074d0e12fb593759ad9121ee9ef9bd3f932a41610` | `sha256:fe880fc8392d9efc282294fff5305973df3b43270ef76263defef4a7ce9240bc` | `docs/helix-os/L11-acceptance/governance-acceptance.md` | `b965f3681d1f5231e4281d333538b65142dce8db0ae4807ed46caa7e928e30de` | `sha256:64bc9d0b2cfbf4c5b70d9ba15f358f26aa6352072d6ac12740129f2ec8f48177` | `docs/governance/audits/requirement-registration/helixos-fr52-atomicity-coverage-receipt-2026-09-29.json` |

HELIXOS-L2-038の`-002`は既採択の`-001`本文だけでは足りない。上表のL11基本節に加え、同じL11 fileの`### HELIXOS-L2-038 revision -002候補の追加negative oracle（未採択）`節（digest `sha256:86287e73d09522940b2a07bf8f304135ff3d495904df055088f07fff077766ed`）も採択対象に含む。この節はHARNESS-L2-041 `-003`が採択され有効化される条件で適用する。節見出しの「未採択」は判断前の候補表記である。

- HELIXOS-L2-038 `-002`はHARNESS-L2-041 `-003`を個別に採択する条件で採択する。異常の意味判定はHARNESS、結果を受けた保存可否・隔離はOSが担う。旧`-001`の採択を`-002`へ自動継承しない。
- HELIXOS-L2-053はHARNESS-L2-052を個別に採択する条件で採択する。コマンド意味・同一性はHARNESS、原子性・競合検出・失敗隔離はOSが担う。一方の採択だけで他方を採択済みと扱わない。
- 導入版未指定の候補は、機能内容のみを採択する。採択によって`version_target: 1.0`へ変更しない。

## 現revisionを採択しない候補

HARNESS-L2-049の現生存登録`MPR-RC-HARNESS-L2-049-002`（L2節digest `sha256:a5df1f7bdca708046ec9ad68e1eea0974884da63205b8995ad45dcd8f0bbc116`、L11節digest `sha256:37c83d82ef76a0198bdfb22317052d67e0249946d1cc21b406d5f6e5109230b8`）は採択しない。L2は与えられた表示可能prototypeの計測を対象とするが、現L11は生成工程・Pattern選択・画面ID発行の証拠が入力にない場合も不足として返すと読める。必要な画面ID・対象版・利用許可・profile・測定条件が揃えば、生成工程の証拠なしで計測を開始できる正常例へ訂正する。画面ID自体の欠落と発行工程の入力欠落を区別する。訂正L11を新revisionで仮登録した後、そのexact bytesについてPOが再確認するまで未採択とする。prototype生成能力は別途要求候補の対象に残す。先の57件の訂正対象`HELIXOS-L2-049/-050`と本項の`HARNESS-L2-049`は別identityであり、HELIXOS-L2-050の受入訂正は#2294で完了している。

## 保留を維持する候補

先の57候補判断で保留したHARNESS-L2-045、HELIXOS-L2-039、HELIXOS-L2-030、HELIXOS-L2-045の処置と解除条件を維持する。順に、予算・期限の値の決定責務／単位／未設定・参照不能・超過時の扱い、045と対になる契約・版・予算条件、本体OSと利用先OS・配布段階・切替条件の保証範囲、対象機構集合とHARNESSからOSへ所有を移す範囲である。機能削除や不採用の判断ではない。

## 判断の境界

本判断は表のL2/L11要求候補の対象revision採択に限る。旧要求の意味変更・retire、旧IR identityのformal successor割当、L3承認、実装・実行・配布許可、初回releaseの範囲、要求段階全体の終了を生成しない。旧HELIXの自律境界で人が要求を持つ点は保持し、旧層番号と旧runtimeを現在の操作経路へ持ち込まない。
