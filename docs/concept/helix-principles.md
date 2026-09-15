---
document_id: HELIX-PRINCIPLES-V0.1
principles_version: "0.1-candidate"
status: draft_candidate
authority_status: awaiting_human_approval
derived_from:
  - docs/concept/helix-concept-v4.1.md
  - docs/concept/product-boundary.md
  - docs/governance/upstream-rebaseline-and-asset-governance-policy-2026-09-14.md
  - docs/governance/authority-state-model.md
canonical_promotion: pending
approval_scope: exact_body_revision_pending
approved_body_sha256: pending_human_decision
authority_effect_before_approval: none
---

# HELIX 原理原則候補

## 位置づけ

本書は、HELIXのConceptを個別要求、設計、実装、運用へ降ろす際に使う判断基準をまとめる。
Conceptや対象別要求を置換せず、新しい製品機能、要求、技術、workflow instance、実装許可を追加しない。

本候補は人間がexact revisionを承認するまでauthorityを持たない。PRの作成・review・merge、Issueの状態、CI結果から
承認を生成しない。承認後もConceptより下位、対象別L1より上位の解釈基準として用いる。Conceptと矛盾する場合は
本書を停止・改訂し、下位文書が本書と矛盾する場合は影響する下位revisionを`stale`として再導出する。

## 原理原則

### P1. 人間が意味と境界を決める

人は価値、製品境界、要求、体験、所定の上流承認、不可逆作用の許可を所有する。AI、Worker、要求エンジン、
reviewer、CI、学習機構は候補、質問、差分、証拠を提示できるが、人間の採否を代行しない。判断はactor、target、scope、
exact revisionへ束縛する。

### P2. 正本とprojectionを分ける

Concept、企画、要求、要件の意味はrepo-ownedの対象別文書、指定された構造化source、人間が承認したrevisionに置く。
GitHub、DB read model、dashboard、memory、会話、生成viewは共有・作業・観測のprojectionであり、そこから要求の追加、削除、
採否、合意、受入、退役を生成しない。

### P3. 製品ごとに責務を一意に置く

HARNESSは外部提供する開発契約を持ち、V-model、層、pair、要求形成、設計、検証、工程の順序、停止、差戻し、完了条件を
定義する。HELIX-OSはHARNESSを適用してHELIXプロジェクト群を管理し、Worker、assignment、state、log、CI、学習、改善、
配布運転を担う。個別製品は利用価値と固有要求を持ち、そのservice runtimeは必要に応じて別の運転基盤へ置く。
管理対象、参照する規則、実行主体を同じ要求ownerへ畳み込まない。

### P4. 契約を先に定め、推進が実行形へ変換する

HARNESSがnormative workflow vocabulary、その意味、trigger、適用条件、route内順序、join、停止・差戻し・完了条件を持つ。
HELIX-OSの管理が目的、親要求、制約、許可、予算、期限、HARNESS版を推進へ渡し、推進機構がoperational tag、mapping、
ticket graph、workflow instanceを生成する。推進機構はHARNESSの意味契約を別定義せず、HARNESSは個別ticketを直接生成しない。

### P5. 上流から順に導出する

Conceptと責務境界から、対象別L1、L2／L11、L3／L10、残る正規pair、release、observationへ順に降ろす。
上位を飛ばさず、実装や既存運用が先に存在しても上流の意味を補完する正本にしない。上位変更時は影響する下位を
`stale`にし、旧下流のgreenで未接続を相殺しない。

### P6. 既存要求は無損失で保持してから判断する

旧要求は原文、identity、source状態、revision、digestを保持し、対象別へ再配置する。新しい配置案が少数であること、
実装が無いこと、責務や機能が重なること、技術的に代替できることを削除理由にしない。保持、分割、再配置、統合、
意味変更、縮退、retireは原意味atomを一つずつ計上し、successor被覆、未被覆0件、対象revision付き人間decisionへ束縛する。

### P7. 意味、管理、実行の状態を混ぜない

sourceでの採用状態、target文書の承認状態、carry-forward状態、管理層の仮登録状態、作業projection状態を別軸で持つ。
仮登録、Issue close、PR merge、review、CI green、実装完了の一つから、別軸の成立を推定しない。要求、実装、検証、受入、
運用も単一の`done`へ畳み込まない。

### P8. 実行を明示された境界へ閉じ込める

Workerは対象revision、assignment、branch、lease、budget、capability、allowed path、期限へ束縛する。権限、対象、依存、
停止条件が不明な場合は実行せず、暗黙のfallbackや別経路への切替を行わない。外部作用とsemantic coreを分け、意味出力を
権限や実行命令として扱わない。

### P9. 完了は反証可能な証拠の接続で決める

完了はsubject、exact revision、実体、要求されたoracle、独立review、実行世代、read-afterを接続して判定する。
AIの自己申告、古いreview、別HEADの結果、画面表示だけを完了根拠にしない。単体要求の成立から接続要求や構成体要求の
成立を推定しない。

### P10. 不明と矛盾は保持して停止する

unknownをnone、unchanged、healthy、greenへ読み替えない。source、digest、revision、owner、依存、decisionが不一致または
不足する場合は元状態と未解決事項を保持して停止する。compatibilityや旧世代の成功をcurrent failureの代替にしない。

### P11. 観測と学習は改善候補へ戻す

HELIX-OSは内部実践、外部利用、許可されたservice log、失敗、診断、review、環境変化を出典とscope付きで統合し、
HARNESS自身を含む対象製品の改善候補を作る。学習、監査、要求エンジン出力、findingはauthorityへ直接writeせず、人間の
採否と対象別上流変更を経て再設計・再検証する。

### P12. 再利用と提供は適格性で決める

旧世代は元構造、provenance、digestを保つ非実行archiveとして扱い、新世代のbaseline、parity oracle、fallbackにしない。
既存資産は要求、behavior、設計、oracle、runtime、consumerへ分解し、完全一致再利用または意味の再導出を明示してから
新世代へ接続する。提供物は承認済み要求と検証済み機能から合成し、release、deployment、observationを別状態にする。

## 要求整理での適用

要求を残す、分ける、移す、統合候補にする、技術代替候補にする、意味変更またはretire候補にする前に、次を確認する。

1. 原文、identity、source状態、revision、digestを固定している。
2. 対象製品とprimary responsibility ownerを一意に示している。
3. unit、connection、compositeのどの粒度かを示し、別粒度の成立を推定していない。
4. Concept・企画・research・親要求との因果関係を保持している。
5. successorと原意味atomの被覆を示し、未被覆を0件にしている。
6. 重複や技術代替の分析を、要求意味の自動削除や自動変更に使っていない。
7. 管理層への仮登録と要求採否を分け、仮登録に`authority_effect: none`を保っている。
8. 対象revision付き人間decisionの前にtarget authorityを確定していない。

一項目でも不明なら、原要求を保持したまま未解決として次の判断へ送る。

## 本PRで決めないこと

- 個別要求の追加、採否、具体化、統合、意味変更、retire。
- L1、L2／L11、L3／L10の承認またはcanonical promotion。
- 要求エンジン、Design Template、DB、adapter、CI、runtimeの技術方式。
- workflow vocabulary、tag、route、ticket schemaの具体的な値。
- HELIX-HARNESS Version 1の完成、HELIX-Web展開、release、deploymentの許可。

## 出典対応

| 原則 | 主な既存source |
|---|---|
| P1、P9 | [Concept v4.1候補](helix-concept-v4.1.md)「目的」「9原則」「System invariant」 |
| P2、P7 | [上流authority状態モデル](../governance/authority-state-model.md)「五つの独立した状態軸」 |
| P3、P4 | [製品責務境界](product-boundary.md)「明示された決定」「対象別の正規入口」 |
| P5 | [上流再整備方針](../governance/upstream-rebaseline-and-asset-governance-policy-2026-09-14.md)「上流から降ろし直す順序」 |
| P6 | [Concept v4.1候補](helix-concept-v4.1.md)「新世代への再構築」と[上流authority状態モデル](../governance/authority-state-model.md)「許可する状態遷移」 |
| P8、P10 | [Concept v4.1候補](helix-concept-v4.1.md)「System invariant」 |
| P11 | [Concept v4.1候補](helix-concept-v4.1.md)「HELIX-OS Concept」 |
| P12 | [上流再整備方針](../governance/upstream-rebaseline-and-asset-governance-policy-2026-09-14.md)「新世代の基準点」「既存資産の管理単位」 |

本書は上記sourceの共通判断基準を短く抽出した候補であり、source本文の条件を省略または上書きしない。
