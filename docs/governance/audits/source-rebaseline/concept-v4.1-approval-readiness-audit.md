# HELIX Concept v4.1承認準備監査

初回確認日: 2026-09-14
最新再確認日: 2026-09-17

## 目的

`helix-concept-v4.1.md`が2026-09-14の製品責務決定と新世代上流再構築方針を反映し、対象別L1／L2へ
降ろせる状態かを確認する。本監査は人間承認、canonical promotion、旧Conceptの降格、runtime移行を行わない。

## 確認結果

| 確認対象 | 根拠 | 結果 | 残る境界 |
|---|---|---|---|
| HELIX全体 | HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS等を接続する全体構想 | 整合 | 新しい対象追加時は個別Concept／L1が必要 |
| HARNESS | 外部提供するV-model・工程・検証契約・consumer package | 整合 | L1／L2はdraft、利用者合意未実施 |
| HELIX-OS | authority、Worker、state、log、CI、review、learning、improvement、HARNESS package運転、個別製品release準備・artifact受渡し・observation統制 | 整合 | L1／L2はdraft、実装未導出 |
| HELIX-Web | OSが開発・改善を管理する個別製品、固有の利用者価値を所有 | 整合 | Vision由来L2はdraft、prototype／合意未実施 |
| HELIX-Web-OS | HELIX-OS外のservice runtime。許可logをHELIX-OS改善入口へ渡す | 整合 | L1／L2はdraft、展開方式・合意未実施 |
| authority | repo-owned対象別文書・指定JSONと承認revisionが意味正本。GitHubはprojection | 整合 | authority registerの個別read／write contractは後続 |
| 新世代境界 | 旧CI・旧AI文書・旧runtimeを非実行archiveへ先に隔離し、baseline、parity oracle、fallbackにしない | 整合 | archive sourceの意味移管と最終退役は未完 |
| 提供構成 | 検証済み機能を適格性を保って構成する | 是正済み | Slice／Module／Bundle等のidentity・schemaはL1／L2承認後に導出 |
| 層とpair | L1–L12、L2↔L11、L3↔L10を含む正規6 pair | 整合 | 対象別L3／L10は未作成・未凍結 |
| 人間authority | Concept、要求、L3要件、不可逆作用の許可を所有 | 整合 | 本Concept v4.1自体の人間承認が未実施 |
| 5大目標と七大原則 | 5大目標をHELIX全体の到達価値、七大原則をHARNESS route内のエージェント行動規律としてConceptへ接続 | 整合 | 対象別L1への価値分解と将来のauthority判断は未実施 |
| AI可読文書 | 旧instructionをarchiveへ隔離し、最小上流入口を置く。承認上流からHARNESS契約・OS context・個別製品要求を分離生成 | 整合 | 最小入口のみ配置済み、manifest／生成器はL3以降 |

## 是正した不整合

1. `Composable Release`が旧Slice／Module／Bundle identityを上位原則として固定していたため、機能・構成・artifactの
   抽象的な適格性保持へ変更した。
2. 対象別L2整理案の出典がv4.0だけを指していたため、v4.1を最新の親候補とし、v4.0承認をv4.1承認へ転用しないと明記した。
3. 旧提供構成identityはL1／L2承認後に再導出する条件をConcept本文へ追加した。

## 承認後にも自動成立しないもの

- L0／対象別L1／L2／L11の合意、L3／L10 freeze、Requirement IR更新。
- v3.1／v4.0のcompatibility降格、archive sourceの意味採否・最終配置、生成manifestへのAI read set切替。
- runtime、CLI、DB、hook、adapter、CI、Worker、配布、公開、cutover。

## 修正版の静的再照合

現在の候補revisionで、判断対象5文書のbytesが
[人間判断packet](concept-v4.1-human-decision-packet.md)記載のSHA-256と一致することを再確認した。

| 対象 | 再照合結果 |
|---|---|
| Concept v4.1 | 固有`document_id`、HARNESS／HELIX-OS／HELIX-Web／HELIX-Web-OS境界、5大目標と七大原則の接続、GitHub projection、legacyのbaseline／parity／fallback禁止が存在 |
| HARNESS L1 | L1 ID 9/9、全IDのL2側逆参照9/9、P0–P9帰属、L12接続条件が存在 |
| HELIX-OS L1 | L1 ID 12/12、全IDのL2側逆参照12/12、P0–P9帰属、L12接続条件が存在 |
| HELIX-Web L1 | L1 ID 6/6、全IDのL2側逆参照6/6、P0–P4／P7–P9のHARNESS・OS委譲とP5／P6分類、L12接続条件が存在 |
| HELIX-Web-OS L1 | L1 ID 5/5、全IDのL2側逆参照5/5、P0–P9帰属、L12接続条件が存在 |

WebのL0帰属はP0–P9を個別tokenで列挙せず、直接ownerではない範囲を`P0–P4／P7–P9`としてまとめている。
単純なtoken検索ではP1等を欠落と誤判定するため、範囲表記、P5、P6、委譲先を組として照合した。
この検査は文書構造と接続の確認であり、意味の承認やL2合意ではない。

2026-09-17の再確認では、HARNESS L1へ追加済みの要求形成`HARNESS-L1-008`とDesign Template
`HARNESS-L1-009`を含む9 IDを集合抽出し、9 IDすべてがHARNESS L2から逆参照されることを実測した。
旧記載の7/7は対象本文より古い監査値であり、要求を7件へ縮退させる根拠にはしない。

## 判定

初回自己監査後、[Claude意味レビュー](concept-v4.1-claude-review-96171b9ba.md)でblocker 3件、major 6件を検出した。
したがって初回の「整合」判定だけを承認準備完了の証拠にしない。document identity、v4.0との差分、L1／L2 relation、
L12、L0柱投影、欠落責務、総称HELIX入口、上流整理期間の検査境界を修正し、新revisionを再reviewする。

GitHub ClaudeによるHEAD `250fbe1ef8cbc0a9c483300fe52e9956b1b35f87`の[上流意味review](concept-v4.1-github-review-250fbe1ef.md)で、
archive順序、旧authority表示、Web-OS昇格条件、deployment境界、L1↔L2 relation、会話記録のrevision bindingに
blocker 2件・major 4件が見つかった。各所見は新revisionで修正した。修正後HEADの独立再reviewは別revisionとして取得し、
本監査や旧reviewをpassへ変換しない。

本監査単独の状態は`ready_for_human_decision`であり、承認・canonical化・実装許可を生成しない。
2026-09-17の人間判断結果は、本監査を書き換えて合格扱いにせず、対象bytesを固定した
[独立decision record](../../decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md)へ記録する。
