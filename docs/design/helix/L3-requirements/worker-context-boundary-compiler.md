---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
l3_progression_marker: HELIX:L3-PROGRESSION-AUTHORITY:v1
l3_progression_authority: docs/governance/l3-progression-authority-rebaseline-2026-07-19.md
title: "worker context boundary compiler CLI要件"
layer: L3
kind: add-design
status: draft
created: 2026-08-27
updated: 2026-09-05
owner: PO / Codex TL
plan: PLAN-L3-69-worker-context-boundary-compiler
parent_design: docs/design/helix/L3-requirements/worker-common-contract.md
pair_artifact: docs/test-design/helix/worker-context-boundary-compiler-acceptance.md
next_pair_freeze: L10
refines:
  - HR-FR-P2-05
  - HR-FR-P2-06
  - WCC-FR-09
---

# worker context boundary compiler CLI要件

## §0 問題とauthority境界

Issue #1098は、`--execute` が `--worker-context-file` を必須とする一方で、operatorが検証済みの
boundary JSONを作成する正規CLIが存在しないため、provider委譲の実行経路が塞がっていることを示す。
本要件は、既存のWCC-FR-09を弱めずに、boundary作成・検証の入口を追加するためのL3入力である。

`worker-context-packet.v1`はwrapperがworker起動直前に生成する**プロセス内のsealed capability**であり、
ファイルへ書き出して信頼する成果物ではない。ファイルに保存するのは、packetの入力となる
`worker-context-boundary.v1`だけとする。`compileWorkerContextPacket`、authority attestation、provider起動前の
再検証は、既存のHELIX wrapperが引き続き唯一の正規実装責務を持つ。

本sliceは要件・L10受入設計だけを追加する。CLI実装、current Runtime Capability Registryがadmitする
worker execution pathへの配線、provider起動、secret／network権限変更は後続のL6実装sliceへ分離する。

## §1 behavior契約

### WCTXCLI-FR-001 boundary作成・検証入口

HELIXは、明示されたtask boundaryから`worker-context-boundary.v1`を決定的に生成・検証する
`helix worker context compile` CLIを提供する。生成物は既存の
`--worker-context-file`へそのまま渡せるboundary設定であり、providerを起動しない。

### WCTXCLI-FR-002 admitted execution pathでのsealed packet生成

current Runtime Capability Registryおよびcurrent execution authorityが実行可能と認めたworker execution pathは、
生成されたboundaryをprovider起動直前にcurrent HEADとcurrent authority/ruleへ再束縛し、同一のcanonical
wrapper authority内で一回だけ`worker-context-packet.v1`をcompileしてから起動する。
CLIが出力したJSON、CLIの成功終了、またはboundaryファイル自体をsealed packetの証拠として扱ってはならない。

compatibility-only、deprecated、retirement対象のexecution surfaceは、current execution pathとして本要件から
存在を要求されない。残存期間中に利用する場合はcurrent canonical execution pathへの一方向adapterとし、
独自packet compiler、独自authority、独自fallbackを持たせない。

## §2 requirements

### WCTX-R-01 明示入力とfail-close

次の値は、CLI引数または明示的に指定された入力ファイルから解決できなければならない。

- `goal_id`
- `workflow_style`
- `case_model`
- `specialist_process`
- `behavior_contract_id`
- `responsibility_owner`
- `allowed_paths` / `forbidden_paths`
- `severity_policy_digest`
- `required_output_schema`
- 正の `budget.time_ms` / `budget.token_limit`

値の欠落、空文字、unknown axis、重複path、path包含、digest形式不正、budget 0を、Forward、Scrum、
現在のrole、repository全体、無制限budgetなどへ暗黙補完してはならない。解決不能ならboundaryを出力せず
fail-closeする。

### WCTX-R-02 planとのexact接続

`--plan <path>`を指定する場合、planはrepository相対でcurrent HEADに存在し、CLIが明示入力から得た
`behavior_contract_id`、`responsibility_owner`、scopeと一致しなければならない。planから一意に得られない
goal、3軸、budget、scopeは推測せず、追加の明示入力を要求する。

planの`draft`／`confirmed`状態をこのCLIが変更してはならない。L3人間承認、PLAN governance、provider
reviewの境界は既存gateへ委譲する。

### WCTX-R-03 保存先と決定性

出力先はrepository相対の`.helix/worker-context/`配下に限定する。絶対path、`..`、symlink経由の外部
path、`.helix/state`・cache・logsへの出力は拒否する。JSONはcanonical serializationで出力し、同じ
current HEAD・入力・authority/rule digestからはbyte一致する。

`--dry-run`は内容と検証結果だけを表示し、boundaryファイルもpacketも作成しない。

### WCTX-R-04 authority/ruleの非入力化

boundary入力にauthority path、rule path、current authority本文、compatibility文書、legacy layer、
provider tokenを許可しない。authority/rule pathとdigestは既存の
`src/runtime/worker-context-packet.ts`がcurrent HEADからattestする。compatibility入力の成功でcurrent
authorityの欠落やdriftを相殺してはならない。

### WCTX-R-05 packetとboundaryの分離

CLIは`worker-context-packet.v1`を信頼可能なファイルとして生成・保存・再読込しない。実payload、
role judgment、task lens、authority digestを含むsealed packetは、wrapperの同一process内でだけ生成する。
boundaryのdigestやcompile receiptを出力する場合も、それはnon-authoritativeな監査証跡であり、worker起動
許可やreview receiptの代替ではない。

### WCTX-R-06 compile receiptと機密境界

CLIの結果は、少なくともboundary digest、current HEAD、authority/rule digest、入力source、検証結果、
failure codeを追跡できる。task本文、token、secret、PII、credential、provider認証情報をstdout、stderr、
receipt、log、boundaryへ出力してはならない。

### WCTX-R-07 current execution pathの共通利用

current authorityによってadmitされた全worker execution pathは、同じboundary loader、authority attestation、
packet compilerを利用する。execution pathのexact setを本要件へ固定せず、Runtime Capability Registryと
execution authorityから決定する。provider、runtime、CLI surfaceごとの自動推測、独自schema、独自packet
compiler、raw provider CLI fallbackを追加してはならない。

`team run`、`pair-agent`、legacy loop等のcompatibility-only surfaceが残存する場合は、current canonical
execution pathへの一方向adapterとしてのみ利用し、新規feature、独立execution authority、独自context semanticsを
追加しない。boundary未指定、stale HEAD、authority/rule drift、scope／budget不整合、unknown／unadmitted runtimeは、
providerを一度も起動せず既存のfail-close codeで拒否する。

### WCTX-R-08 compatibility隔離

旧`mode`、`model`、旧layer、旧provider commandはboundaryのcurrent出力・DB・receiptへ再出力しない。
互換入力を残す場合もinput-only adapterとして一方向変換し、変換元・warning・期限を監査証跡へ残す。
曖昧なlegacy入力は推測せず拒否する。

## §3 正規CLI契約（実装入力）

実装するCLI名は次に固定する。

```text
helix worker context compile \
  --out .helix/worker-context/<goal-id>.json \
  [--plan <repository-relative-plan>] \
  --goal-id <id> \
  --workflow-style <v_model|production_scrum|v_design_scrum_implementation_hybrid> \
  --case-model <none|discovery|poc|other_admitted_case> \
  --specialist-process <none|design_harness|other_admitted_specialist> \
  --behavior-contract <id> \
  --responsibility-owner <owner> \
  --allowed-path <path>... \
  [--forbidden-path <path>...] \
  --severity-policy-digest <sha256:digest> \
  --output-schema-digest <sha256:digest> \
  --time-ms <positive-integer> \
  --token-limit <positive-integer> \
  [--dry-run]
```

planのexact metadataから導出できる値は、明示値との一致を検証したうえで省略可能とする。ただし、
一意に解決できない値をdefaultで埋めてはならない。実装時に別名CLIや既存provider commandへの暗黙fallbackを
増やす場合は、本要件の変更としてL3へ差し戻す。

## §4 非対象

- sealed packetをファイルへ永続化すること。
- `--execute`でboundaryを省略可能にすること。
- goal、owner、scope、budgetの自動推測。
- provider API、認証方式、subscription／課金経路の変更。
- resident lane、Notification Fabric、routing／allocationの再設計。
- L3人間承認gateの緩和、PLAN statusの自動昇格。

本要件がconfirmedになった後、L6実装とL10/L9実行oracleを別PRで追加する。#1098のT0 blockerは、要件が
存在することではなく、実装PRがcurrent wrapperへ接続されるまで残る。
