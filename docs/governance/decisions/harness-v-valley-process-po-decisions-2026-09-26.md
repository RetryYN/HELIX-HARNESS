---
title: "HARNESSの工程（Vの谷を基にしたForward／Reverse）のPO提示と判断 decision record（2026-09-26）"
decision_record_id: HDEC-HARNESS-V-VALLEY-2026-09-26
decision_status: recorded
decider_role: PO
decided_at: 2026-09-26
recorded_at: 2026-09-26
source: docs/helix-harness/sources/v-model-forward-reverse-po-original-2026-09-26.md
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HARNESSの工程（Vの谷を基にしたForward／Reverse）のPO提示と判断（2026-09-26）

## 記録の範囲

2026-09-26（Asia/Tokyo）のClaude作業sessionで、POがHARNESSの工程を改める要求の案を示した。本書はその会話の記録である。
POの発言はそのまま引用し、AIの整理と区別する。本文の原文は[source snapshot](../../helix-harness/sources/v-model-forward-reverse-po-original-2026-09-26.md)に保存した。
本記録から、要求（L2）の合意、要件（L3）の承認、実装許可、release、Issue closeを生成しない。

## POの提示

POは「あとHARNESSの工程自体をVの谷をベースにちょっと改変の要求アイディア」と述べ、「HELIX V-Model Forward / Reverse-Refactor Assurance Model」の本文を示した。

AIは、原文と今の要求・旧HELIXを照らし合わせ、次を返した。

- 合う点
  - V字の6つの対（L6↔L7を谷とする）は、旧v1.3（`docs/governance/requirements-source/helix-requirements_v1.3.md:48-61`）と今のHARNESS-L2-001のままである。
  - Forwardの小・中・大を単体・接続・構成体に当てる点は、OSのticketの節と合う。
  - 原子CIは、旧GH-FR-025に元がある（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-atomic-development-requirements.md:29,52-62`）。
  - RefactorとBackflowの境目は、今のticketの区分と旧`HIL-BR-21`のreroute規則に合う。
  - 動的CIは、今のHARNESS-L2-005と同じ方向である。
- 新しく加わる点
  - 右側を、実物を逆に照合し、境界を直し、証明を強める工程とすること。
  - 成果物の状態の段階。
  - Release Portを最初から持つこと。
- 当てはまる範囲
  - 2026-09-25の判断で、どの開発方式の組み合わせでもV字の対を落とさないとした。そのため、この工程はすべての開発方式に当てはまる。

## 省いた検査の回収

AIは、旧GH-FR-025の扱いを示した。PRでは影響する範囲だけを検査し、省いた検査は記録して、main合流の直後に全件で回収し、夜間に補完していた。危険度の高い変更は、最初から全件にしていた。
そのうえで、今回の段階的な証明の中で、省いた検査をどこで必ず回収するかを聞いた。POは次のように答えた。

- 「危険度が高いのはすべて密結合になってたのがある。合流全件というよりはメインの健全性を保つイメージにしたいかな。いいアイディアがあればそれを採用する。既存の方式はちょっと推進が遅いから。」

続けて、POは次のように述べた。

- 「あとはチケット自体がCIの範囲を決めるからそもそも全件回す必要なさそうじゃないか？チケットとの関係性でPR前に回すCIが決まればって感じだと思われる。」

AIの整理（POの「いいアイディアがあればそれを採用する」により、AIの案として採る）：
- PRの前に回すCIは、ticketとの関係から決める。関係とは、要求の粒度（Forward 小・中・大）、対象のV字の対、触るコネクタ、変更の種類である。Forward 小は原子CI、Forward 中は境界の証明（触ったコネクタの契約を含む）、Forward 大はシステムの証明とする。
- mainの健全性は、変更がticketの範囲を超えていないかの確認で保つ。範囲の外への変更があれば止める。merge直後の全件実行はしない。
- 省いた検査は記録し、合流先のticketで回収する。OSのticketの節では、Forward 小は中か大へ、中は大へ合流する。回収されないまま残っていれば、Release Portで止める。
- 影響が広がる密結合は、CIを重くして守らず、設計の不具合として扱う。その場の検査を広げたうえで、Design-refactorを発行して結合を切る。接続ごとにコネクタを入れる方針（[2026-09-26のLABOの判断記録](labo-core-engine-po-decisions-2026-09-26.md)、PR #2143）と合う。
- 夜間の補完はやめる。代わりにLABOが、検査をすり抜けて後で見つかった失敗を振り返り、原子CIやコネクタの契約が足りているかを評価して返す。
- 旧GH-FR-025から保つ点は、影響する範囲だけを選ぶことと、省いた検査を記録し、黙って捨てないことである。変わる点は次の3つである。
  - 範囲を決める元を、変更の差分からticketへ移す。
  - 回収の場所を、merge直後の全件実行から合流先のticketへ移す。
  - 夜間の補完をやめる。
  - 理由は、POの「既存の方式はちょっと推進が遅いから」と、危険度の高い変更の原因が密結合だったことである。

## 構造の成立を上へ伝えない条件

POは「こいつもアイディアで」と述べ、「HELIX 構造保証非伝播 要求差分案」の本文を示した。原文は[source snapshot](../../helix-harness/sources/structural-non-propagation-po-original-2026-09-26.md)に保存した。

AIの整理：
- 原文は、単体・接続・構成体の分類とForward 小・中・大を新しく作らない。既存のHARNESS-L2-004／005／008／009とOSのticketの意味を強める。
- 新しく加わるのは次の4つである。
  - 下の構造の成立から上の構造の成立を推定しない。
  - 分解しても上の構造に固有の義務を消さない。
  - 変更の影響はrelationを通じて伝える。
  - 構造の分類の誤りはBackflowで直す。
- 旧HELIXとの対応
  - 旧AAFD（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:20-25,42`）は、影響を受けた集合だけを古い扱いにし、影響を受けない投影を作り直さず、unknownを0・unchanged・observedへ変えることを拒否していた。
  - 保持する点は、影響の集合を正確に保ち、unknownを補完しないことである。
  - 変わる点は、これを要求・設計・検証の単体・接続・構成体のrelationへ当てることである。
- 前の節の「省いた検査は合流先のticketで回収する」と合う（下の証明と上の証明の関係は、下の外部の評価を受けた整理で改めた）。
- 影響の状態（Affected、Unaffected、Unknown）は、名前の表記のPO指示に従い、1文字目を大文字にする。

続けて、POは、この案への外部の評価を貼り、「だって」と述べた。評価の要旨は次のとおりである（POの発言ではなく、POが共有した評価である）。
- 「構造の成立を上へ伝えない」は強すぎる。現行HELIXが禁じているのは、下の成功だけで上の成立を無条件に推定することであり、証拠を上へ伝えることではない（現行のHARNESS L2「単体の成立から接続、統合、製品全体の成立を推定せず、組合せ固有のbehavior、failure、回復、全体制約と受入を要求する」、L11のFRS-BR-009）。
- 正しくは「下の成立は上の成立の証拠になるが、上の成立そのものではない」。証拠と影響は上へ伝え、成立だけを無条件に受け継がない。
- 上の構造では、下の証拠を集めたうえで、上に固有の義務との差分だけを証明する（構成的保証と差分証明）。下の証明と組み合わせの契約がそろい、未解決の上の固有の義務がないと契約で示せれば、上の合格を機械的に導いてよい。システム全体の応答時間のような上に固有の非機能は、別に証明する。

AIの整理：
- AIは現行の文言を確かめ、評価の指摘どおり、現行HELIXは下の成功だけによる無条件の推定を禁じており、証拠の集約は禁じていないと確かめた。原文の「Completionは伝播しない」は、この現行の意味より強い。
- 評価の案は現行の意味と原子CIの方針（下で証明したものを積み上げ、上では差分だけを証明する）に合うため、これで反映する。原文のうち、構造ごとの固有の義務、影響の伝え方とUnknownの扱い、Backflowでの再分類はそのまま保つ。
- 変わる点は次のとおりである。
  - 下の成立は、上の成立の証拠として集める。
  - 上の成立は、下の証拠と上の固有の義務の差分を確かめてから導く。
  - 固有の義務が残っていないと契約で示せれば、上の合格を機械的に導いてよい。


- HARNESSの要求（L2）と受入（L11）：原文の工程と上の整理を反映する。2026-09-25の判断記録で仮決めとしたL2・L11の最終確認は、本記録を反映した後のrevisionで行う。
- HELIX-OSの要求（L2）：OSの検収がticketからCIのprofileを組み立てる運転と、構造の成立を上へ伝えない運用の条件を反映する。
- 名前の表記：2026-09-26のPO指示（[LABOの判断記録](labo-core-engine-po-decisions-2026-09-26.md)、PR #2143）に従い、HARNESSとOSのL2・L11の表記（HELIX-HARNESS-CORE、INTELLIGENCE、SECURITY、Decide）を同じPRで改める。
