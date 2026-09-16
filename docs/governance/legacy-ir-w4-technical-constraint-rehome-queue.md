# W4 技術制約の無損失再配置queue

status: queued_after_repository_foundation
parent: [IR再配置wave台帳](legacy-ir-rehome-wave-register.md)
authority: [旧要求carry-forward台帳](legacy-requirement-carry-forward.jsonl)

## 使い方

HIL-TR-01..11を原要求identity一件ごとの`requirement` PRで扱う。順序はsource順であり、優先順位、承認、意味変更を示さない。各項目の原要求identity、原文digest、原文を固定し、後続PRで対象product、successor、保持atom、未被覆atomを記録する。

対象候補は既存crosswalkの整理結果である。`HELIX-HARNESS／HELIX-OS`は二つの責務へ分割する候補であり、どちらか一方へ押し込まない。`判断要（未適用）`は変更済みではない。削除・縮退・統合・降格を意味せず、具体的な変更前後と影響を人へ提示するまで原文を保持する。

## 原要求queue

### 1. HIL-TR-01

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:20132aa5c7cc5ca9107e826e3ee2be6b3eb959414424594fb8dfbf317b1c5afc`
- 原要求:

> HELIX control planeはTypeScript strict＋Node.jsを唯一の正規runtimeとし、Bun固有API・command・lockfile・CI・distribution契約をactive surfaceから除去する。

### 2. HIL-TR-02

- 対象候補: 対象未解決
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:290f35ed940fc065d587c05153f38deaae14d1757c950f442cb30ef1a1e297ec`
- 原要求:

> Pythonはproduct-data、document-engine、detector、analysis workerのdata/detection planeとして第一級化し、Node control planeとはversioned schema/event/CLI contractで接続する。

### 3. HIL-TR-03

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:8e14a234b93d4d5c78924b8ec9bd1fb6b926d7559504cde2371581f875ad8d92`
- 原要求:

> ZIP Python実装は採用候補だが、HELIX state/gateを迂回して直接正本を書かない。入力digest、出力schema、provenance、detector resultをDBへ投影する。

### 4. HIL-TR-04

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:cdfeddca01d916f1241f11f4c74fe2dcf85e1b95ea8723633e912c1e6a09420b`
- 原要求:

> OS優先順位はLinuxをprimary、macOSをfirst-class portable、Windowsをcompatibility profileとする。WSL/Git Bash/PowerShellをcore前提にしない。

### 5. HIL-TR-05

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:472de11079841e874b39bc1170b95a07805818e7c31178541f8929560e2f6567`
- 原要求:

> path、process、signal、file lock、SQLite、executable discoveryをOS adapterへ隔離し、Linux CIを基準、macOS/Windows smokeを互換性証拠とする。

### 6. HIL-TR-06

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:0948d379b01567c2405bb4c61992b5a48423872c629c05d734e9aae523269e94`
- 原要求:

> Node/Python双方のdependency lock、runtime version、offline/clean install、SBOM/secret/license検査を再現可能にする。

### 7. HIL-TR-07

- 対象候補: 対象未解決
- 整理状態: 判断要（未適用）
- 原文digest: `sha256:f30a529a80f752c4df4a05d93d25e0f28fd7a71659d9bcc2469f4d193832a113`
- 原要求:

> SQLite/harness.dbはcontrol planeのevent/projection backboneを維持し、Python分析用read modelとNode write authorityを分離する。write authority変更はL4で決定する。

### 8. HIL-TR-08

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:4b8901dea297c274a7055c0c26840eef6a309aec0647557573de9372ffed2c95`
- 原要求:

> Node↔Pythonの初期正規IPCはchild process＋versioned JSON Lines over stdioとし、stdoutをprotocol、stderrを診断専用にする。envelopeはschema/run/request/type/sequence/deadline/payload digestを持つ。

### 9. HIL-TR-09

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:f00f879f39a72198d3f245da1391c7da88d661b9a9659a52925091169bdc65e6`
- 原要求:

> Python workerはharness.dbへ直接writeせず、Nodeがschema検証済みresult/findingをtransactionalにcommitする。Pythonへは必要最小限のread snapshotだけを渡す。

### 10. HIL-TR-10

- 対象候補: HELIX-OS
- 整理状態: 配置のみ
- 原文digest: `sha256:f4aae528a618810c40344831e9fbf3290e29ff1786f7d07eae7a9ac73e175df7`
- 原要求:

> harness.dbはproduct source/snapshot/mapping、engine registry/run/artifact、detector registry/run/finding、IPC run、CI stage/quarantine、agent instance/lifecycleを論理的に分離する。

### 11. HIL-TR-11

- 対象候補: 対象未解決
- 整理状態: 配置のみ
- 原文digest: `sha256:a60d775089a0729e6c2b8f17c106df23d54fa922f79adb0301520cc665775696`
- 原要求:

> Bun cutover完了時はNode clean install/build/test/CLI/hooks/package/distributionをBun binary/loader/API/lockfileなしで実行可能にする。

## 集計

- 全11件: HELIX-OS候補1、対象未解決10。
- 意味変更・照合の人間判断候補2件。適用済み0件。
- successor割当済み0件。全11件`preserved_pending_rehome`。

このqueueからIssue close、PR merge、CI、旧実装状態を理由に要求を削除・縮退しない。
