# 企画・Visionから前提整理researchを経て要求へ接続する流れの監査

status: gap_confirmed
audited_at: 2026-09-15
authority_effect: foundation_inventory_only

## 確認する流れ

```text
Concept／Vision／企画／人間指示
  → 判断論点と前提の整理
  → 前提確認research
  → known／assumption／unknown／conflict／stale
  → 要求候補
  ↔ 要求探索research／限定PoC／UI・動画prototype／人間反応
  → 比較・選択
  → 人間による要求採否
  → L2要求revisionと対になるL11
```

research、PoC、prototypeの結果は要求候補と前提へ戻せるが、それ自体から要求採用や技術採用を生成しない。

## 旧要求源に存在する意味

| source | 保持候補の意味 | 新世代で持ち込まないもの |
|---|---|---|
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-intake.md` §A／§3 | 企画→前提整理research→要求候補→探索research／PoC／prototype／反応の反復。既知・仮定・未知・矛盾・古い情報と必要証拠を分ける | 旧engine、旧DB、旧scheduler、旧route、旧Issue番号 |
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-requirements.md` RFA-RF-02 | 前提確認と要求探索を分け、公式仕様・実code・実物・版・取得時点・適用条件・限界・反例へ束縛する | URL数、検索件数、AI自己評価を調査完了にする判定 |
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-requests.md` | 企画、前提、要求候補、research、PoC、prototype、反応、比較・検証を循環させる | 旧workflow identityと旧承認状態 |
| `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.2.md` §企画書gate | 企画段階の穴を、書きすぎ、research不足、整合性破綻として区別する | 旧gate実装と旧layer判定 |

## 現行新世代での被覆

| 現行箇所 | 被覆している意味 | 欠けている意味 |
|---|---|---|
| `HARNESS-L1-008`／`HARNESS-L2-008` | 指示と根拠から要求候補・質問・矛盾・欠落・semantic diffを形成する | Vision入力、要求候補化前の前提packet、前提researchと探索researchの区別が要求ID本文にない |
| `HELIXOS-L2-012` | 内部情報を先に調べ、不足分だけ外部情報を未信頼sourceとして取得する | Concept／Vision／企画から調査義務を生成し、要求エンジンへ渡す因果接続が一要求として閉じていない |
| `HELIXOS-L2-001／002／005／007／013` | source、候補、採否、差分、改善eventを登録・追跡する | premise identity、判断論点、調査未完、反例、再調査条件の共通契約がない |
| OS L2本文のRFA／DGH移管節 | 企画・前提・調査・PoC・prototype・反応・比較の反復を記載する | 本文補足に留まり、L1／L2 identityとGitHub operationの必須入力になっていない |
| GitHub上流運用モデル | local上流を正本とし、`research_premise`、`discovery_evidence`、Concept／L1 backflow、要求一identityごとのPRを定義した | premise identityと調査契約は対象別L2／L11として未承認 |

判定は`operating_route_defined_requirements_unapproved`である。repository foundationとしてGitHubへ投影する経路は定義したが、premise、research、PoC／prototype、backflowの製品要求は対象別L2／L11として未承認である。運用経路の記載を要求承認や実装済み機構として扱わない。

## 新世代の責務境界

| owner | 責務 |
|---|---|
| HARNESS | 企画から要求へ進む際に必要な前提分類、research evidence、比較、unknown、反例、backflowと、要求エンジンへ渡すcontractを規定する |
| HELIX-OS 管理 | Concept／Vision／企画、判断論点、前提、research結果、採否、revision、data／permissionを登録・統制する |
| HELIX-OS 推進 | 管理から目的・制約を受け、前提確認research、探索research、PoC、prototypeを別ticketに分解して発行・進行する |
| crawler／Worker | 許可scope内で内部・外部sourceを調査し、出典・版・取得時点・適用条件・限界・反例付き結果を返す |
| 検収 | researchの実質、前提の未解決、要求候補への因果接続、HARNESS contract充足を独立確認する |
| 人間 | Concept／Vision／企画の意味と、比較後の要求採否を決定する |

## foundationで固定することと後続PR

#1797では、この順序、責務、GitHub projection条件だけを運用上流へ固定する。要求本文は#1797で承認しない。
後続の`requirement` PRでは、次を一要求identityとして具体化する。

1. Concept／Vision／企画から判断論点と調査義務を導くHARNESS contract。
2. 前提確認researchと要求探索researchの入力・出力・終了・再調査・backflow。
3. premise packetから要求エンジンへの入力と、候補・質問・不一致の出力。
4. OSの登録、推進ticket生成、crawler／Worker割当、検収、GitHub projection。

個別のGitHub requirement PRをReadyにするには、親Concept／Vision／企画revisionと、前提packetまたは
`research_not_required`の理由・判断者・再評価条件を必須にする。
