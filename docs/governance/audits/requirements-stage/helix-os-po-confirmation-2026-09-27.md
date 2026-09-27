# OS 要求段階 PO 確認パケット（判断未受領）

## PO向け：この要求で何を作るか

HELIX-OSは外販製品ではなく、HELIXの作業を管理・推進・検収する機構である。承認された要求から作業を割り当て、実行結果と検証・レビューの証拠を回収し、中断や失敗でも未完の仕事を失わず続けられることを求める。以下は採用時に実現する能力の要約であり、実装済みを意味しない。条件・例外・受入の正本は後掲のL2/L11本文である。

### 1.0で提供する能力

| まとまり | 受け取り、提供し、保証すること | 主な要求ID |
|---|---|---|
| 管理・全体の追跡 | 上流の判断、要求・成果の版、プロジェクトの範囲を記録し、何が承認済みで何が未完かを追えるようにする。作業の完了表示から要求の採用を作らない。 | 015/016 |
| 作業の推進とWorker割当 | 対象要求・範囲・予算・停止条件を作業へ結び、Workerに割り当てる。INTELLIGENCEは配置案を出し、OSが割当を持つ。案を受けただけで実行許可や成功にしない。 | 017/018 |
| 証拠・中断からの継続 | 実行結果、試行、失敗、未完義務を元の作業と版へ結び、中断後に戻る場所を残す。古い版の結果を新しい成果の合格に流用しない。 | 019 |
| 検収・検証の運転 | HARNESSが定める検証義務に従って必要な検証を運転し、結果を回収する。OSは他の所有者の判定や受入証拠を捏造しない。管理→推進→Worker→検収の引継ぎも確認する。 | 020/023 |
| 導入・更新・改善の還流 | HARNESSの構成版を対象プロジェクトへ配布・更新・復旧する。観測結果をLABOへ渡し、返ってきた改善候補を登録・振分け、採否を経て作業へつなぐ。改善の評価はLABOに残す。 | 021/022/024 |
| 段階的な成立範囲の導出 | 依存と安全を含めて閉じ、要求確認→作業→検証→記録が一周する組を導く。入らない能力を「できないこと」として示し、後の版や自己依存で穴埋めしない。導出案だけでリリースしない。 | 014/026 |
| 評価履歴がない最初の作業 | 人が提出する配置案と既存の許可・安全条件を使い、範囲を限った最初の作業を回す。履歴がないことを理由に永久に開始できない状態を避ける一方、初回成功を能力評価済みにはしない。 | 027 |
| Workerへの支援と再作業 | 必要なときだけ相談を行い、回答を元Workerの作業範囲へ戻す。作業・検証・独立レビュー・必要な修正を追い、修正後の版で改めて結果を確かめる。相談を使わない経路も残す。 | 028/029 |
| OS全体としての成立 | 上記の単体・接続を同じ範囲と版で結び、組合せ固有の条件を確認する。各部品の成功を足して全体成立とはしない。 | 025 |

省略IDはすべて `HELIXOS-L2-` を指す。017の動的外部workflow拡張は4.0として残し、1.0の開始条件にはしない。LABOへ移した技術調査・横断診断（旧012/013）をOSへ戻さない。

### 前回の企画確認から具体化・強化したこと

| 追加・強化 | 現在の本文で判断できること |
|---|---|
| 機能単位：015〜025（G1） | 管理・推進・検収、Worker、証拠、更新、改善の機能と接続、全体構成体を分けた。入力・出力・依存・版・戻し先を各単位に置いた。 |
| 段階リリースと範囲導出：014/026（#2158・G8） | 既決の段階リリース方針を、閉じる組の選び方と、できないことの表示へ具体化した。v0.1の導出例を要求の削減や配布許可とはしない。 |
| 初回実行：027（G9） | Bench履歴がない状態から限定作業へ進む経路と、初回結果・後続評価の区別を加えた。実行後に得るLABO受領証拠を開始前に求めない。 |
| 支援の接続と構成体：028/029（G19） | 提案だけ、実相談、元Workerの修正、検証・独立レビューを別段階にした。助言者を同じ成果の独立レビュー担当とはみなさない。 |
| 機構内監査の補強 | L11-029の相談あり・なし両経路に、修正後のexact HEADへの独立再レビューと未解消指摘0件を明記した。修正前のレビュー結果の流用を反例にした。 |
| 横断監査の照合 | OSが作業状態、HARNESSが工程・検証契約、INTが提案、Workerが実行、LABOが評価を持つ分担を確認した。受け渡しただけで相手側の受領・評価済みにはしない。 |

### 今回判断することと推奨の影響

現在のL1企画の対象revisionを確定するか、L2と対のL11の一式に合意するか、登録16候補（014〜029）をどう処置するかを判断する。現状、新たな個別の所属選択は残っていない。推奨は、既決の責務・初回経路・版境界を保持した現在の本文で確認することである。

この案では、OSに作業の管理・割当・検証運転を置き、評価や工程の意味、権限の出所を他の機構から奪わない。範囲を限った作業を先に回す経路を保ちながら、全体構成体の受入は別に確認する。採用しても実run・配布の許可やL3承認を生成しない。過去の企画確認、LABO移管、段階リリースの方向は聞き直さない。

## 対象revisionと読み口

固定main commit: f6dad2a33e24f000b87d7f09b8d40288257e74cc. 対象本文・MPRはd308f4080da298172001ef97e9c4b5f66d32ed7dとも同一。以下は固定commitの文書読み口であり、本文は複製しない。

- [docs/concept/helix-concept.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/concept/helix-concept.md) — SHA-256 06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78; blob e57b94e76049037172b7a6ce3e6376f47591ca17.
- [docs/helix-os/L1-planning/system-intent.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-os/L1-planning/system-intent.md) — SHA-256 2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e; blob 073531b8fd0a4d59feebd0da1a3672028ab8db61.
- [docs/helix-os/L2-requirements/governance-requirements.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-os/L2-requirements/governance-requirements.md) — SHA-256 c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf; blob 44a2db57aac3e23963da283284d229b5269d7ed2.
- [docs/helix-os/L11-acceptance/governance-acceptance.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-os/L11-acceptance/governance-acceptance.md) — SHA-256 925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680; blob e75e5d5163149bc3c2ed48f973067ba991accc33.
- [docs/governance/management-provisional-requirement-register.jsonl](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/management-provisional-requirement-register.jsonl) — SHA-256 71df2d06aaa144eecca2047aeb0fe1930dc8f4e82326e18bbed6975a93b3a808; blob 32a93b6195bf3e103b7a57f6493ea2415509e7f3.

- Concept: docs/concept/helix-concept.md のOSと機構境界を照合。
- L1: system-intent.md:15-26。draft / draft_candidate。旧OS L1を採択した過去判断は現行SHAを採択していない。
- L2: governance-requirements.md:55-604,619-634,642-752,807-878。全IDと登録対応を下表に示す。
- L11: governance-acceptance.md:320-480。015–029の受入対応。026:430-441、027:442-456、028:457-467、029:468-480。
- 下表の候補登録行はregistered_proposal / authority_effect:none。coverage receiptはcoverage evidenceでありPO採択receiptではない。

## L2全IDとregistration対応

登録なしの001–013は現行本文IDとして保持する。未登録を不採択、欠陥、退役と推定しない。OS-L2-012/013は既決の配置変更によりLABO側へ移管済みで、OSへ戻す質問をしない。

| L2 ID | 最新register ID | kind / register state | version_target | coverage receipt / SHA-256 |
|---|---|---|---|---|
| HELIXOS-L2-001 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HELIXOS-L2-002 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HELIXOS-L2-003 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HELIXOS-L2-004 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HELIXOS-L2-005 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HELIXOS-L2-006 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HELIXOS-L2-007 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HELIXOS-L2-008 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HELIXOS-L2-009 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HELIXOS-L2-010 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HELIXOS-L2-011 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HELIXOS-L2-012 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HELIXOS-L2-013 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HELIXOS-L2-014 | MPR-RC-HELIXOS-L2-014-002 | composite / registered_proposal; authority_effect=none | v0.x→v1.0の段階候補（現行revision採択ではない） | [docs/governance/audits/requirement-registration/helixos-l2-014-coverage-receipt-2026-09-27-r2.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixos-l2-014-coverage-receipt-2026-09-27-r2.json) / 203ce675f5e83c9bcca38c0544dbaa9752116045955dd2573e0e417c036ce5a4 |
| HELIXOS-L2-015 | MPR-RC-HELIXOS-L2-015-001 | unit / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json) / e7d69318d725977d14f4c5db94afb851e5d24d4b3c23d8dc392cab057573fffe |
| HELIXOS-L2-016 | MPR-RC-HELIXOS-L2-016-001 | unit / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json) / e7d69318d725977d14f4c5db94afb851e5d24d4b3c23d8dc392cab057573fffe |
| HELIXOS-L2-017 | MPR-RC-HELIXOS-L2-017-002 | unit / registered_proposal; authority_effect=none | core 1.0。動的外部workflowは4.0で1.0必須に含めない | [docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27-r2.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27-r2.json) / 84b1095f1a677853f4598a46566085bfc82e39ff48c52cf4cb8b85dabb36a8a8 |
| HELIXOS-L2-018 | MPR-RC-HELIXOS-L2-018-001 | unit / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json) / e7d69318d725977d14f4c5db94afb851e5d24d4b3c23d8dc392cab057573fffe |
| HELIXOS-L2-019 | MPR-RC-HELIXOS-L2-019-001 | unit / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json) / e7d69318d725977d14f4c5db94afb851e5d24d4b3c23d8dc392cab057573fffe |
| HELIXOS-L2-020 | MPR-RC-HELIXOS-L2-020-001 | unit / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json) / e7d69318d725977d14f4c5db94afb851e5d24d4b3c23d8dc392cab057573fffe |
| HELIXOS-L2-021 | MPR-RC-HELIXOS-L2-021-002 | unit / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27-r2.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27-r2.json) / 84b1095f1a677853f4598a46566085bfc82e39ff48c52cf4cb8b85dabb36a8a8 |
| HELIXOS-L2-022 | MPR-RC-HELIXOS-L2-022-001 | unit / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json) / e7d69318d725977d14f4c5db94afb851e5d24d4b3c23d8dc392cab057573fffe |
| HELIXOS-L2-023 | MPR-RC-HELIXOS-L2-023-002 | connection / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27-r2.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27-r2.json) / 84b1095f1a677853f4598a46566085bfc82e39ff48c52cf4cb8b85dabb36a8a8 |
| HELIXOS-L2-024 | MPR-RC-HELIXOS-L2-024-001 | connection / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json) / e7d69318d725977d14f4c5db94afb851e5d24d4b3c23d8dc392cab057573fffe |
| HELIXOS-L2-025 | MPR-RC-HELIXOS-L2-025-001 | composite / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixos-functional-units-coverage-receipt-2026-09-27.json) / e7d69318d725977d14f4c5db94afb851e5d24d4b3c23d8dc392cab057573fffe |
| HELIXOS-L2-026 | MPR-RC-HELIXOS-L2-026-003 | unit / registered_proposal; authority_effect=none | 1.0の構築過程から | [docs/governance/audits/requirement-registration/helixos-stage-scope-derivation-coverage-receipt-2026-09-27-r3.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixos-stage-scope-derivation-coverage-receipt-2026-09-27-r3.json) / c71887220def16d63f4b4da266dc1479485e14f4c366f6682df9b0ab12ea0497 |
| HELIXOS-L2-027 | MPR-RC-HELIXOS-L2-027-002 | composite / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helix-os-first-run-coverage-receipt-2026-09-27-r2.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-os-first-run-coverage-receipt-2026-09-27-r2.json) / f4f36ad57a589c15502d984757c1e542048d17542eee7f23f3fad9176e896a81 |
| HELIXOS-L2-028 | MPR-RC-HELIXOS-L2-028-001 | connection / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helix-os-worker-support-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-os-worker-support-coverage-receipt-2026-09-27.json) / b1187870850a8343df78b792d83973afa7ec19c5e1a38839e38f735a536b7f2d |
| HELIXOS-L2-029 | MPR-RC-HELIXOS-L2-029-003 | composite / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helix-os-stage-review-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-os-stage-review-coverage-receipt-2026-09-27.json) / 04268bf0d214c6da008099a04f83651ac1111554c32ff13c1a608e0876f2cd67 |

## 既決事項と今回の残判断

既決事項は再質問しない。

- docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:33 は旧OS L1 SHA ffbafa...の採択を記録するが、現在のL1 SHA採択ではない。
- docs/governance/decisions/mechanism-placement-po-decisions-2026-09-25.md:62-64,83-85 はOS-L2-012/013をLABOへ移管済み。OS側routing記録は残す。
- docs/governance/decisions/stage-release-po-decisions-2026-09-27.md:27-63 はstage-releaseをOS L2候補として進める方向を既決。v0.xからv1.0の段階、1.0終点、限定loop、依存条件は再質問しない。ただし現行L2-014全体のexact SHA採択ではない。
- [OSの機構内解消記録](helix-os-internal-resolution-2026-09-27.md)と横断所見の解消は、段階ごとの入力・後続receiptの境界を既存L2/L11へ対応付けている。HARNESS artifact producerとOS executor、送信側receiptとLABO consumer evidenceを再質問しない。

現行revision全体の確認以外に、今回のパケット作成時点でOSに残る具体的所属/意味選択は特定できなかった。ID別の機能・version・receiptは上表を参照する。未確定scopeや将来版を保留する選択肢は提示できるが、新しいgateではない。1.0候補015–025/027–029、段階候補014、構築過程の026、既存routing 001–013を混同しない。017の動的外部workflow 4.0を1.0必須にしない。

## PO判断（未受領）

以下は回答・採択・保留・不採択を記入していない。対象revisionとID集合を明記した一括判断を提示できる。

| 判断対象 | 対象revision / ID集合 | 採用・保留・不採用 | PO記録 / 日付 |
|---|---|---|---|
| OS L1 | 上記L1 SHA |  |  |
| OS L2本文の一式 | HELIXOS-L2-001..029。上表のversion区分を維持 |  |  |
| 登録candidate disposition | HELIXOS-L2-014..029の16件。各IDに採用・保留・不採用を付すか、明示集合に対する同一判断を記録 |  |  |
| OS L11 | 上記L11 SHA、L2受入対応 |  |  |

- 対象commit/SHA:
- L1判断:
- L2本文一式の判断:
- 014–029 candidate disposition（個別または明示集合）:
- L11対象revision確認:
- 根拠または変更指示:

## 確認PRの前提と受領後の扱い

機構内の監査・解消16 PR、横断監査 #2195 と解消 #2196、総合検証 #2197 はmerge/read-after済み。[総合検証](integrated-verification-2026-09-27.md)から根拠へ辿れる。本資料は要求本文の固定revisionへの読み口であり、本文やsource atomの被覆を置き換えない。

[PO指示の手順4](../../sources/requirements-stage-po-handoff-original-2026-09-27.md)に従い、POのL1対象revision確定・L2合意（または差戻し）を同じPRの判断記録へ入れるまでDraftを維持し、mergeしない。独立reviewは資料の正確さを照合するもので、PO判断を代行しない。提示したrevisionと集合に対する「一式でよい」という一括回答も、その範囲の判断として記録できる。IDの再列挙は求めない。部分回答・意味変更指示は対象だけを反映し、未判断部分を残す。

旧自律境界（LEGACY-ASSET-6EBDB617A8104A7756D0、`archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85`、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）の、人が企画・要求の意味を持ちAIが要件以下を起草する分担を保持する。旧層番号・旧runtime・旧merge方式は移植しない。現行のL1/L2対象revision判断と、L3要件承認を分ける。

現在はPO判断未受領。受領後は実際の回答・対象revision・候補処置を記録し、本文変更があれば対のL11、register訂正revision、receipt、研究pinとbindingを追随させてexact HEADを再reviewする。候補の処置から旧sourceのretireや未完atomの被覆完了、L3承認、実装・release許可を生成しない。
