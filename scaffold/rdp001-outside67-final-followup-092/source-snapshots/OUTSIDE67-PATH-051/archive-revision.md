# 要件正本v1.3の対象別責務対応

確認日: 2026-09-14

`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`は現行Core Readである一方、HARNESSが提供する工程規則と、
HELIX-OSが実行・管理する制御面を同一文書に保持している。本表は既存要件を削除・採択・再凍結せず、
対象別L2へ渡す責務を明示する。GitHub上のIssue／PR／Projects状態は帰属や採否の根拠にしない。

| v1.3の節・ID | 主対象 | 対象別L2 | 分離時に保持する意味 |
|---|---|---|---|
| §2 正規layer、§3 L2画面工程 | HARNESS | HARNESS-L2-001／003 | L1–L12、正規pair、L2要求・prototype合意、非UI適用性、L3凍結条件 |
| §4、§4.1、§4.2 | HARNESS | HARNESS-L2-002／003／004 | development style、Discovery／PoC別軸、Reverse／Scrum Reverse、分類・実行policyの工程意味 |
| §4.3 検証・計測基盤 | HARNESS / HELIX-OS | HARNESS-L2-003／005、HELIXOS-L2-007／008 | metric・oracle・再測定条件はHARNESS、probe実行・証拠保存・CI制御はOS |
| §4.4 Universal Workflow AI判断 | HARNESS / HELIX-OS | HARNESS-L2-002／003／004、HELIXOS-L2-003／004 | workflow state・進行条件はHARNESS、候補生成・割当・transaction実行はOS |
| §4.5、§4.9 Design HARNESS | HARNESS | HARNESS-L2-003／004／005 | Experience／UI／Frontend contract、prototype、trace、drift、利用者受入条件 |
| `HR-FR-HYB-001` | HELIX-OS | HELIXOS-L2-002／007／009 | closure状態、review receipt、CAS、rollback、terminal管理 |
| `HR-FR-HYB-002` | HELIX-OS | HELIXOS-L2-003／004／007 | MCP profile、credential・egress・tool capabilityの実行統制 |
| `HR-FR-HYB-003` | HARNESS | HARNESS-L2-002／003 | Discovery／PoC S0–S4とproduction工程への昇格条件 |
| `HR-FR-HYB-004` | HELIX-OS | HELIXOS-L2-004／007／009 | worktree、stage、commit、HEAD、git guardと実行episode |
| `HR-FR-HYB-005` | HELIX-OS | HELIXOS-L2-005／007／009 | memoryの期限、受渡し、retire、stale防止。要求意味はmemoryへ移さない |
| `HR-FR-HYB-006` | HELIX-OS | HELIXOS-L2-005／007／009 | feedback lifecycle、event、projection、SessionStart surface |
| `HR-FR-HYB-007` | HELIX-OS | HELIXOS-L2-004／005 | Skill推薦、発火、効果、誤推薦、stale版の学習還流 |
| `HR-FR-HYB-008`、§4.6.1 | HARNESS / HELIX-OS | HARNESS-L2-006、HELIXOS-L2-006／008 | consumer向けpackage条件はHARNESS、生成・配布・promotion・rollback運転はOS |
| `HR-FR-HYB-009` | HELIX-OS | HELIXOS-L2-001／002／007 | IDE read model、DB projection、HEAD・redaction整合 |
| `HR-FR-HYB-010`、§6 | HELIX-OS | HELIXOS-L2-002／004／007／008 | Issue／PLAN／PR／CI／mergeのlegacy実行条件をsourceとして分解する。新世代CIは承認上流とHARNESS検証契約から再導出し、旧workflow・job・admissionを要求分母にしない |
| §4.7 Authoring Admission | HELIX-OS | HELIXOS-L2-001／002／003 | proposalとcanonical化の分離、revision、impact、CAS、atomic rollback |
| §4.8 `HR-NFR-REG-001..007` | HARNESS / HELIX-OS | HARNESS-L2-005、HELIXOS-L2-005／007／008 | 品質特性・metric・oracleはHARNESS、測定運転・時系列保存・改善joinはOS |
| §4.9.1 Requirement Discovery | HARNESS / HELIX-OS | HARNESS-L2-003／004、HELIXOS-L2-001／002 | L2質問・prototype・合意とL3 IR境界はHARNESS、event・candidate・canonical transaction管理はOS |
| §4.10 `HR-FR-P2-05..08` | HELIX-OS | HELIXOS-L2-004／007／009 | 外部Workerのdescriptor、packet、隔離、権限、receipt、縮退 |
| §4.10 `HR-FR-P6-06` | HARNESS / HELIX-OS | HARNESS-L2-006、HELIXOS-L2-006 | packageに必要なprovenance・license・digestはHARNESS、publish／cutover統制はOS |
| §4.11 `SEC-FR-CAP-001..007` | HELIX-OS | HELIXOS-L2-003／004／007 | capability、target、provenance、data、sink、approval、rollbackの実行安全統制 |
| §5 Forward・横軸 | HARNESS | HARNESS-L2-002／003／004 | Forwardへの収束、Reverse・Redesign・Refactor・Scrum Reverseの工程関係 |
| §7 設計台帳と完了率 | HELIX-OS | HELIXOS-L2-001／002／007 | artifact・evidence・decisionの横断管理と欠落表示 |
| §8 runtime authority | HELIX-OS | HELIXOS-L2-003／004／007／008 | Python意味コア、Node transaction境界、CI環境の実行統制。HARNESS利用者へ実装言語を強制しない |

## 適用待ち条件

v1.3本文は本表の追加だけで対象別に分割済みとは扱わない。正規改訂では次を同じrevisionで行う。

1. HARNESSとHELIX-OSのL3要件を物理的に分冊し、各L2親IDとL10／L11へ対応づける。
2. 混合節は「工程として満たす条件」と「OSが実行・保存・制御する機構」に分ける。
3. 既存IDを無断で再利用せず、継承・分割・supersedeの関係と互換参照を記録する。
4. requirements IR、generated view、DB projection、consumer、受入を同じrevisionへ更新する。
5. Issue／PR／CIの状態から要求の追加、採否、合意、受入、削除を生成しない。

本表は上流の責務整理であり、L3本文、runtime、GitHub設定、CI、配布を変更しない。
