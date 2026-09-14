# 現行CI consumer relation inventory

確認日: 2026-09-14

## 目的

現行workflow 4件の周囲にあるtrigger、required check、生成、配布、admission、証拠、復元の結合を要求源として分類する。
workflowファイルだけをarchiveして旧CI退役と誤判定しないための台帳であり、現行CIの起動、変更、再利用、新世代CIの
設計・実装を認可しない。

## 現行workflow入口

| Path | 現行trigger | 現行の主な作用 | 新世代で採取する意味 |
|---|---|---|---|
| `archive/legacy-generation-2026-09-14/root/.github/workflows/harness-check.yml` | `push`、`pull_request`、`schedule`、`workflow_dispatch` | aggregate verification、artifact、review／merge admissionとの接続 | 変更から必要検証を選ぶ条件、証拠identity、失敗分類の候補 |
| `archive/legacy-generation-2026-09-14/root/.github/workflows/claude-unanswered-review-audit.yml` | `schedule`、`workflow_dispatch` | GitHub観測、前回artifact、未応答分類 | review観測、前世代欠落、degraded状態の候補 |
| `archive/legacy-generation-2026-09-14/root/.github/workflows/escalation-stale.yml` | `schedule`、`workflow_dispatch` | status、completion、doctorの定期観測 | 期限、未完義務、継続状態の観測候補 |
| `archive/legacy-generation-2026-09-14/root/.github/workflows/issue-metadata-audit.yml` | `schedule`、`workflow_dispatch` | Issue metadataの観測 | GitHub projectionの鮮度・欠落観測候補 |

trigger、job、command、runner、cron、workflow名は現行実現方式であり、新世代要求として採用しない。

## 確認したrelation family

| Relation ID | relation | 現行の代表source／consumer | 採取する意味 | 新しい要求owner |
|---|---|---|---|---|
| CICR-01 | trigger／schedule | `.github/workflows/*.yml`のevent定義 | 何が検証・観測を要求するか、重複・stale generationの扱い | HELIX-OS pipeline generation |
| CICR-02 | verification obligation binding | `harness-check.yml`のjob／command、関連profile・selector | requirement、pair、oracle、非適用理由 | HARNESS検証契約。OSは実行のみ |
| CICR-03 | required-check／branch policy | `archive/legacy-generation-2026-09-14/root/docs/templates/github/team/setup-branch-protection.sh`、GitHub外部設定 | merge前に必要な証明と適用scope | HARNESS admission条件＋HELIX-OS provider適用 |
| CICR-04 | review／merge admission consumer | `archive/legacy-generation-2026-09-14/root/src/audit/github-merge-readiness.ts`、`archive/legacy-generation-2026-09-14/root/src/runtime/github-cross-review-admission.ts`、closure処理 | review、CI、mergeの異なるauthorityとrevision束縛 | HELIX-OS GitHub projection／admission |
| CICR-05 | evidence／artifact／receipt | workflow artifact、summary、run／check consumer、state projection | 原証拠、generation、HEAD、環境、有効期限 | HELIX-OS evidence収集・保全 |
| CICR-06 | generation／consumer setup | `archive/legacy-generation-2026-09-14/root/src/setup/templates.ts`、`docs/templates/github/`、`archive/legacy-generation-2026-09-14/root/src/setup/index.ts` | source→template→consumer output、適用scope | HELIX-OS生成・配布統制 |
| CICR-07 | distribution projection | `archive/legacy-generation-2026-09-14/root/config/distribution-capability-artifact-catalog.json`、package profile | 配布対象、source revision、consumer適用 | HELIX-OS配布統制 |
| CICR-08 | doctor／lint／test enforcement | `archive/legacy-generation-2026-09-14/root/src/doctor/index.ts`、workflow関連lint、旧workflow test | 欠落、設定不一致、危険な権限・triggerの検出候補 | HELIX-OS適用診断。oracle意味はHARNESS |
| CICR-09 | observation／notification | review、escalation、Issue metadataのcollector／detector | stale、未応答、期限、projection欠落 | HELIX-OS観測・通知 |
| CICR-10 | recovery／archive resurrection | `archive/legacy-generation-2026-09-14/root/src/audit/handover-resurrection-source.ts`、legacy inventory | 旧workflow、command、required checkの再出現検出 | HELIX-OS archive／復旧統制 |
| CICR-11 | provider external state | GitHub Actions run、artifact、branch protection、required context、外部schedule | repo外writer、適用状態、取消・切替・read-after | HELIX-OS provider adapter。GitHubはauthorityではない |

## archive前のrelation closure

1. 各workflowの意味候補を対象別L2へ採択、不採用、未解決として記録する。
2. CICR-01..11ごとにproducer、consumer、source revision、外部writer、適用scopeを確定する。
3. required check、branch protection、schedule、artifact retention等のrepo外状態をread-beforeし、切替はaction-binding approvalへ束縛する。
4. 新世代pipelineが承認済みHARNESS oracleから生成され、旧workflow、旧job、旧receiptをbaseline・parity・fallbackにしない。
5. archive後のread-afterで旧workflow、required context、template、admission consumer、復元経路がcurrent実行へ戻らない。

## 未完境界

- CICR-01..11はrelation familyの分類であり、全job、command、test、symbol、GitHub設定の個別closureではない。
- 個別closureはConcept、対象別L1／L2、L3／L10が承認された後、新世代CIの実装前inventoryとして閉じる。
- 現在は要求源の読取りと適用待ち差分までとし、workflow、branch protection、required check、schedule、CI run、artifactを操作しない。

## 要求への適用待ち差分

CICR-01..11を`NCI-OS-008`へまとめ、HELIXOS-L2-001／002／003／006／007／008／009へ接続する。
受入ではworkflow削除後にもrequired context、schedule、template、admission consumer、復元経路のいずれかを残し、
旧CI退役を成立させないnegative caseを確認する。
