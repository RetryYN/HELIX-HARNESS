# 新世代CI・AI文書要求と既存候補の対応

確認日: 2026-09-14

## 目的

既存のCI・指示経路・Rule導出候補を、新世代の要求へ無条件移植せず、保持するsemantic atom、捨てる実装前提、
未判断を分ける。本表は要求源の照合であり、既存候補の承認を新世代へ継承せず、L2合意・L3凍結・実装を行わない。

## CI event generation候補

対象source:

- `ci-event-concurrency-generation-requests.md`
- `ci-event-concurrency-generation-requirements.md`
- `ci-event-concurrency-generation-acceptance.md`

| 旧ID | 保持候補の意味 | 新世代接続先 | 旧系列から持ち込まない条件 | 状態 |
|---|---|---|---|---|
| CIG-BR-01／CIG-R-01 | 異なる証明義務を一世代へ潰さず、run identityを対象revisionと実行世代へ束縛する | NCI-OS-002／003 | `pull_request`、`main_push`、`schedule`、`workflow_dispatch`を恒久enumにしない。workflow名・GitHub refを上流identityにしない | split_reapproval_required |
| CIG-BR-02／CIG-R-02 | 独立scopeを相互cancelせず、stale世代だけを有界に置換する | NCI-OS-003／005 | GitHub native concurrency、PR単位、schedule単位の置換規則を新世代設計へ固定しない | split_reapproval_required |
| CIG-R-03 | supersede前に後継generation・義務移管・terminal read-afterを確認する | NCI-OS-003／004 | `main push`と既存handoff receiptを唯一のモデルにしない | split_reapproval_required |
| CIG-BR-03／CIG-R-04 | cancel・supersede・terminalを区別し、証拠から再構築する | NCI-OS-003／004 | 既存`run:<id>:attempt:<n>:<conclusion>`、doctor、DB、aggregateを互換必須にしない | split_reapproval_required |
| CIG-AC-001..007 | 欠落・改変・race・誤流用を拒否するnegative oracle | NCI-HARNESS-002／003、NCI-OS-003／004 | bounded GitHub rehearsal、自然schedule、旧receipt再検証を新世代の受入にしない | oracle_atom_candidate |

旧候補の「既存責務の再利用」節は新世代へ採用しない。既存cancel provider、telemetry、Windows lease、receipt、
deferred recoveryはlegacy source inventoryへ置き、新しいL3／L10で必要性を再判断する。

## Instruction Path Change Resilience候補

対象source:

- `instruction-path-change-resilience-requests.md`
- `instruction-path-change-resilience-requirements.md`
- `instruction-path-change-resilience-acceptance.md`

| 旧ID | 保持候補の意味 | 新世代接続先 | 旧系列から持ち込まない条件 | 状態 |
|---|---|---|---|---|
| IPC-BR-001、IPC-R01 | Requirement／Policy、Workflow、Skill、adapter、consumerの責務を分ける | AIDOC-HARNESS-001、AIDOC-OS-002／003 | 旧Requirement IR、旧Workflow、旧Skillをcurrent ownerとして固定しない | split_reapproval_required |
| IPC-R02 | source→生成→出力→consumerのprovenanceを保持する | AIDOC-HARNESS-002、AIDOC-OS-002／005／006 | 旧generator・output digest・call formへの互換を要求しない | split_reapproval_required |
| IPC-R03 | 影響不明をunknownとして保留または検証拡大へ送る | AIDOC-OS-005／006 | 旧consumer集合を新世代の影響分母にしない | semantic_atom_candidate |
| IPC-R04／05／06 | 実行単位の版固定、部分混在拒否、有効化状態の分離 | AIDOC-OS-001／002／005 | 旧contractへのrollback、retired output復活、既存状態名とのbyte互換を要求しない | split_reapproval_required |
| IPC-R07／08 | 再読込不能・provider差・観測不能を明示して安全に停止する | AIDOC-OS-001／004／006 | 現行session transition、adapter allowlist、provider固有fallbackを固定しない | semantic_atom_candidate |
| IPC-R09 | 固定AI文書を入口と参照へ縮小し、動的に正本へ戻る | AIDOC-HARNESS-002／003、AIDOC-OS-001..005 | `worker-context-packet`等の既存ownerを新世代で再利用しない | split_reapproval_required |
| IPC-R10 | 有効化時間、誤拒否、旧版再出現等を独立測定する | AIDOC-OS-005／006 | 現行runtimeをbaselineにした優劣判定をしない。新世代内のrevision比較だけを後続候補とする | measurement_scope_rewrite |
| IPC-AC01..10 | 責務混在、wrong digest、partial apply、stale注入等の反例 | AIDOC L11候補 | 既存consumer E2E、旧版動作、旧rollbackを受入必須にしない | oracle_atom_candidate |

Issue番号とPLANは旧作業projectionであり、新世代要求のidentity・採否・進捗へ使用しない。

## Rule Derivation候補

対象source:

- `rule-derivation-requests.md`
- `rule-derivation-requirements.md`
- `rule-derivation-acceptance.md`

この系列は`approved_pending_canonical_promotion`だが、承認対象revision 2.0は旧製品境界・既存owner再利用・現行保護維持を
前提に含む。新世代のHARNESS／HELIX-OS分離へ承認を流用しない。

| 旧ID | 保持候補の意味 | 新世代接続先 | 旧系列から持ち込まない条件 | 状態 |
|---|---|---|---|---|
| G-BR-001、G-R01 | hardな許容境界とadvisory判断を分ける | HARNESS検証契約、AIDOC-OS-001／004 | 現行Guard分類・既存保護を新世代の正解として固定しない | split_reapproval_required |
| G-R02／04 | 一つの上流契約から判定接続・診断・Helpを導出する | AIDOC-HARNESS-002、AIDOC-OS-002／003／005 | 既存Requirement／Policy owner、validator、Help surfaceを再利用必須にしない | split_reapproval_required |
| G-R03／05 | 副作用前の拒否と、原因に応じた安全な差戻し | AIDOC-OS-001／006、NCI-OS-004 | 旧Guard、旧Recovery、旧CLI／Hook入口へ接続しない | semantic_atom_candidate |
| G-R06 | AI固定文書を正規入口・取得先へ縮小する | AIDOC-HARNESS-002／003、AIDOC-OS-002／005／007 | 現行`AGENTS.md`／`CLAUDE.md`や`worker-context-packet.ts`を改修して残さない | split_reapproval_required |
| G-R07 | Skillの有無でmandatory boundaryを変えない | AIDOC-OS-003／004 | 現行Skill機構・Rule機構のowner構成を固定しない | semantic_atom_candidate |
| G-R08 | 段階適用、negative oracle、誤拒否、独立review | HARNESS検証契約、AIDOC L11候補 | 旧consumer移行・旧保護維持・旧rollbackを新世代受入条件にしない | scope_rewrite_required |
| G-AC01..08 | hard/advisory混同、自由文実行、partial apply、旧本文再注入の拒否 | AIDOC L11候補 | 現行Guard・Hook・provider入口の実証を新世代合格証拠にしない | oracle_atom_candidate |

## 新世代へ進める条件

1. v4.1 Conceptの新世代境界を人間が承認する。
2. HARNESSとHELIX-OSの対象別L1へ、利用者・価値・非対象・成功条件を分けて接続する。
3. NCI／AIDOC候補と本表の各atomをL2／L11で採否する。
4. 採用atomへ新しいstable ID、source relation、owner、expected failureを付与する。
5. L3／L10以降は承認された新世代IDから新規導出する。

この条件が揃うまで、旧候補のapproval、Issue、PLAN、実装、test、CI resultを新世代の完了根拠にしない。
