# package indexの旧原文と030追補

照合base: `312e443810f52e700b794b139cf04121b689c14a`。L1-005/007内のpackage生成責務。新たな採択や外部作用を生成しない。

既存030は生成indexをmanifestへ収載し、manifest/artifactの手編集を拒否する。一方、正本indexから生成index自体を導出したことの照合が抜けていた。生成indexを手編集してからmanifestを再hashする反例を追加する。正本内容と意味はHARNESS契約、派生物生成はOSのままである。

## 原文

- `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:85` file `sha256:db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` line `sha256:5e1c5b4e6d83e4aaa36437955baf35e30c8e4f835831f9e9c7c2fdead1ed760f`

  > | **HIL-BR-33** | 配布はmarketplace型パッケージ仕様（正本index、手編集禁止の生成index、first-party/third-party分離、免責記載）で定義し、配布surfaceの実切替は既存cutover承認境界に従う。 |

- `LEGACY-ASSET-C7F0C3B79CBAA72960BF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:58` file `sha256:8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` line `sha256:6a5bc0fa2b933dcd97698571f825567282bbe3a9cfafd0eecf2df3736f327f52`

  > | HR-FR-HIL-24 | HIL-BR-33 | 配布パッケージを正本indexと手編集禁止の生成indexで構成し、first/third-party分離と免責を保持する | 正本indexあり → 生成indexは決定論導出のみ、手編集0 | 手編集index、party混在、cutover未承認切替 / index digest、derivation receipt、cutover approval | HAC-HIL-24a, HAC-HIL-24b, HAC-HIL-24c |

- `LEGACY-ASSET-C7F0C3B79CBAA72960BF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:87` file `sha256:8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` line `sha256:0968bdd18055b9c73b2ea8827c844f9941dc2bf3f07cc0eb155333f09df3f243`

  > | HR-FR-HIL-24 | HAC-HIL-24a: 生成indexが正本indexから決定論導出 | HAC-HIL-24b: 手編集・party混在を拒否 | HAC-HIL-24c: 配布切替はcutover承認境界でのみ実行 |

- `LEGACY-ASSET-FA8C6E69463183D6A19B` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:56` file `sha256:a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` line `sha256:3f9f00590286d2e74f5bed0bb3215f02a7fdb3868b510ba629ea5eca3b169fbe`

  > | HAT-HIL-24 | HR-FR-HIL-24 / HAC-HIL-24a, HAC-HIL-24b, HAC-HIL-24c | HOT-HIL-57 | marketplace型配布indexを検証 | source/generated index digest、party分類、cutover approval | 手編集、party混在、未承認切替 |

## 保持と差分

既存92 atomと各revisionの14保留（計28）は変更しない。追加4行のindex生成条件は追補へ、party/免責/cutoverは既存030/L11へ接続する。旧marketplace型の固定path・schema・providerを追加せず、既存package contractが選択した正本と生成規則を使う。旧cutover承認語から毎回の人間承認を追加せず、既決SECURITY Aの有効権限再利用を保持する。旧testは実行しない。

## 候補revisionの束縛

既存本文・行位置を保持するため追補は文末に置いた。r2のcandidate digestはreceiptのcandidate_digest_partsに示す元030節と文末追補節の順序付き連結。各節を末尾空行除去＋LF1つに正規化する。r1 receipt/registerは不変。L11は元030受入と文末の追補受入を合わせて読む。
