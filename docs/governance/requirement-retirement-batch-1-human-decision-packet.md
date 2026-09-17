# 旧要求retirement候補 Batch 1 人間判断packet

prepared_at: 2026-09-17
status: draft_review_pending
program_id: RDP-002-RETIREMENT
projection_issue: 1849
authority_effect: none

## このpacketで判断すること

旧要求を削除する判断ではなく、5件を「吸収・統合・技術指定廃止の候補として後続の無損失移管検証へ送るか」だけを判断する。
各節は旧要求原文を省略せず掲載し、重複箇所と各要求だけが持つ意味をsemantic atom IDで示す。Aを選んでも
`retirement_applied`はfalseのままであり、旧ID、原文、digestを保持する。

## 1. Q-RET-001 — Upstream Redesign Re-entryの包含候補

### 比較する旧要求の原文全文

**`HIL-FR-05` revision 1 / `sha256:e547dbc9b001e344da3953e672675621d353d69137f1e69c2b548c8c232a163d`**

> Redesign routerは設計欠陥をcanonical L1–L6の影響層へ割り当てる。L1企画変更はL12運用テストpairを、L2要求変更はL11受入テストpairとScreen Applicability/prototypeまたはskip receiptをstale化して再freezeし、Reverse→Redesign→pair-freeze→Forwardの順序を強制する。層外L0 charter変更はPOへescalateする。 | redesign PLAN、修正layer、stale edge、pair receipt

**`HIL-FR-31` revision 1 / `sha256:9982b94a7b289c1f852d5777f0cd06ee05058d272ef97d06bbc6c3acc720723d`**

> Upstream Redesign Re-entryはaffected layerがL1ならL1/L12 pairを、L2ならL2/L11 pairとscreen applicability/prototype agreementをstale化し、再承認前の実装claimとForward合流を拒否する。 | stale edge、re-entry task、re-freeze receipt

### 実際に重複している意味

| 重複内容 | 左側要求のatom | 右側要求のatom |
|---|---|---|
| L1変更時にL1/L12 pairをstale化する | `FR05-A02` | `FR31-A01` |
| L2変更時にL2/L11 pairをstale化する | `FR05-A03` | `FR31-A02` |
| 再承認／再freeze前にForwardへ戻さない | `FR05-A05`, `FR05-A06` | `FR31-A04`, `FR31-A05`, `FR31-A06` |

### 各要求だけにあるため必ず残す意味

**`HIL-FR-05`の保持対象**

- `FR05-A01` 設計欠陥をcanonical L1–L6の影響層へ割り当てる
- `FR05-A04` L2要求変更ではScreen Applicability、prototypeまたはskip receiptをstale化する
- `FR05-A06` Reverse→Redesign→pair-freeze→Forwardの順序を強制する
- `FR05-A07` L0 charter変更をPOへescalateする
- `FR05-A08` redesign PLAN、修正layer、stale edge、pair receiptを出力する

**`HIL-FR-31`の保持対象**

- `FR31-A03` screen applicability/prototype agreementをstale化する
- `FR31-A04` 再承認前の実装claimを拒否する
- `FR31-A05` 再承認前のForward合流を拒否する
- `FR31-A06` stale edge、re-entry task、re-freeze receiptを出力する

### 候補処置

- retire候補となる旧ID: `HIL-FR-31`
- 吸収・再配置案: HIL-FR-05 meaning plus HIL-FR-31 explicit pre-approval refusal
- 候補内容: HIL-FR-31の固有拒否条件を後継へ移し、旧HIL-FR-31 identityをretire候補にする

**retire前に必須の条件**

- 固有atomをsuccessorへverbatim-equivalentに保持
- L2/L11 acceptance pairで拒否条件を検証
- 対象revision付き人間decision

### 選択肢

- **A**: 固有atomを後継へ移す候補とし、旧`HIL-FR-31`をretire候補にする。
- **B**: 両要求を独立要求として残す。
- **C**: successor設計まで保留する。

## 2. Q-RET-002 — finding disposition業務要求の包含候補

### 比較する旧要求の原文全文

**`HIL-BR-17` revision 1 / `sha256:e55bdf0ac2daabc541038f11887fd2099993870993dc131097955ca9f817c1a1`**

> Claude監査findingをcurrent contract影響と責務境界で機械的にdispositionする。同じ責務・既存scope内で安全かつ局所的に閉じるfindingは`current_pr_fix`としてwriterへ返し、独立責務・別設計・lifecycle・性能改善だけを`successor_issue`としてIssue、Universal Reverse、memory要約、Codex ready queueへ同一causality chainで接続する。AIの自由判断だけによるfinding破棄と、後続Issueのcurrent PRへの再流入を認めない。

**`HIL-FR-30` revision 1 / `sha256:d4fa1ac2785a9989d6e783094a89324f908a0eb20ab53d3138f51677e4e2cd7c`**

> Finding Dispositionはcurrent contract違反、correctness/security/data loss、必須oracle/main/evidenceへの影響と責務境界を評価し、同じ責務・既存scope内で安全かつ局所的に閉じるfindingを`current_pr_fix`、独立責務・別設計・lifecycle・性能改善を`successor_issue`へ分類する。Finding Promotion Pipelineは`successor_issue`だけから重複判定、Issue contract、Universal Reverse、memory issue-summary、Codex queue itemを同一causality IDで原子的に生成する。`current_pr_fix`はwriterへ一括返却し、途中欠落はreadyにしない。 | typed disposition、writer return、Issue/Reverse/memory/queue join

### 実際に重複している意味

| 重複内容 | 左側要求のatom | 右側要求のatom |
|---|---|---|
| 同じ責務・既存scope内で安全かつ局所的に閉じるfindingをcurrent_pr_fixにする | `BR17-A03` | `FR30-A02` |
| 独立責務・別設計・lifecycle・性能改善をsuccessor_issueにする | `BR17-A05` | `FR30-A03` |
| current修正をwriterへ返す | `BR17-A04` | `FR30-A07` |
| 後続工程を同一causalityで接続する | `BR17-A06` | `FR30-A06` |

### 各要求だけにあるため必ず残す意味

**`HIL-BR-17`の保持対象**

- `BR17-A01` Claude監査findingを対象とする
- `BR17-A02` current contract影響と責務境界で機械的にdispositionする
- `BR17-A07` AIの自由判断だけによるfinding破棄を禁止する
- `BR17-A08` 後続Issueのcurrent PRへの再流入を禁止する

**`HIL-FR-30`の保持対象**

- `FR30-A01` current contract違反、correctness/security/data loss、必須oracle/main/evidenceへの影響と責務境界を評価する
- `FR30-A04` successor_issueだけからPromotion Pipelineを起動する
- `FR30-A05` 重複判定を行う
- `FR30-A07` current_pr_fixをwriterへ一括返却する
- `FR30-A08` 途中欠落があればreadyにしない
- `FR30-A09` typed disposition、writer return、Issue/Reverse/memory/queue joinを出力する

### 候補処置

- retire候補となる旧ID: `HIL-BR-17`
- 吸収・再配置案: HIL-FR-30 meaning plus HIL-BR-17 prohibitions
- 候補内容: HIL-BR-17の禁止条件をHIL-FR-30系successorへ移し、旧HIL-BR-17 identityをretire候補にする

**retire前に必須の条件**

- 監査元固有名を必要ならactor-neutralに再表現
- 破棄禁止と再流入禁止をsuccessor acceptanceへ保持
- 対象revision付き人間decision

### 選択肢

- **A**: 固有atomを後継へ移す候補とし、旧`HIL-BR-17`をretire候補にする。
- **B**: 両要求を独立要求として残す。
- **C**: successor設計まで保留する。

## 3. Q-RET-003 — Requirement Definition Ledger上位要求の包含候補

### 比較する旧要求の原文全文

**`HIL-BR-24` revision 1 / `sha256:9727fd0b427f18eb8b6839f2f2f97d1d13ed88059b0c05738b887ed127c9809d`**

> 要件定義そのものを設計対象として台帳化し、原文、原子要求、authority、分類、scope、priority、acceptance oracle、capability/service、template適用、design obligation、revisionを一つの履歴へ結ぶ。trace行の存在だけを要件定義完了とみなさない。

**`HIL-FR-45` revision 1 / `sha256:e13451d529dd90b9d37e1b42eb180f20b183ec7b20f5ece2e6b8b02acdd7acda`**

> Requirement Definition Ledgerはstable requirement IDとimmutable revisionを持ち、source atom、canonical statement、BR/FR/TR/NFR、modality、priority、scope/non-goal、authority/rationale、acceptance oracle、owner、risk、capability/service、template applicability、design obligationを型付きedgeで保存する。split/merge/rename/supersede/reject/N/Aはbefore/after semantic digest、全source atom disposition、downstream stale、review authorityを持つreceiptがある場合だけ適用する。 | requirement definition/revision、typed edge、change/applicability receipt、orphan/stale finding

### 実際に重複している意味

| 重複内容 | 左側要求のatom | 右側要求のatom |
|---|---|---|
| 要求のsource、分類、scope、acceptance、capability、template、design obligation、revisionを一つの台帳で結ぶ | `BR24-A02` | `FR45-A02` |

### 各要求だけにあるため必ず残す意味

**`HIL-BR-24`の保持対象**

- `BR24-A01` 要件定義そのものを設計対象として台帳化する
- `BR24-A03` trace行の存在だけを要件定義完了とみなさない

**`HIL-FR-45`の保持対象**

- `FR45-A01` stable requirement IDとimmutable revisionを持つ
- `FR45-A03` split/merge/rename/supersede/reject/N/Aを変更操作として扱う
- `FR45-A04` 変更にはbefore/after semantic digestを要求する
- `FR45-A05` 変更には全source atom dispositionを要求する
- `FR45-A06` 変更にはdownstream staleを要求する
- `FR45-A07` 変更にはreview authority付きreceiptを要求する
- `FR45-A08` requirement definition/revision、typed edge、change/applicability receipt、orphan/stale findingを出力する

### 候補処置

- retire候補となる旧ID: `HIL-BR-24`
- 吸収・再配置案: HIL-FR-45 meaning plus HIL-BR-24 completion prohibition
- 候補内容: HIL-BR-24の上位原則をHIL-FR-45系successorへ移し、旧HIL-BR-24 identityをretire候補にする

**retire前に必須の条件**

- 要件定義を設計対象とする原則をsuccessorへ明記
- trace存在だけの完了をnegative oracleへ保持
- 対象revision付き人間decision

### 選択肢

- **A**: 固有atomを後継へ移す候補とし、旧`HIL-BR-24`をretire候補にする。
- **B**: 両要求を独立要求として残す。
- **C**: successor設計まで保留する。

## 4. Q-RET-004 — 要求・設計完全性NFRの統合候補

### 比較する旧要求の原文全文

**`HIL-NFR-26` revision 1 / `sha256:239e05f4a6d7453b7b5c6c966ded8acbf1ee6565a38518cc43f8869800cd839f`**

> 文書、template、見出し、入力欄の存在だけを設計完全性とみなさない。各義務は意味のある設計内容、双方向edge、test oracleまたはscope付きN/A receiptで個別消込し、`TBD`、空欄、範囲表記、1行での複数義務消込を拒否する。

**`HIL-NFR-28` revision 1 / `sha256:dcd5e597e7ffda1290911e74f7eb29498f59a07062c94c76e44bfe8e87f31357`**

> requirement coverageの行数、ID連番、文書存在だけを要件定義の設計完全性としない。各active requirementはsource atom、authority、acceptance oracle、service/capabilityまたは根拠付き非該当、template applicability、design obligationへ個別に結び、未解決ambiguity、orphan、stale revisionをgreenにしない。

### 実際に重複している意味

| 重複内容 | 左側要求のatom | 右側要求のatom |
|---|---|---|
| 文書・行・ID・templateの存在だけを完全性証拠にしない | `NFR26-A01` | `NFR28-A01` |
| 各単位を個別に設計内容／edge／oracle／根拠付きN/Aへ接続する | `NFR26-A02`, `NFR26-A03`, `NFR26-A04` | `NFR28-A02`, `NFR28-A03`, `NFR28-A04`, `NFR28-A05`, `NFR28-A06`, `NFR28-A07` |
| 未消込・空洞・aggregate一括合格を拒否する | `NFR26-A05` | `NFR28-A08` |

### 各要求だけにあるため必ず残す意味

**`HIL-NFR-26`の保持対象**

- `NFR26-A02` 各設計義務を意味のある設計内容へ個別接続する
- `NFR26-A05` TBD、空欄、範囲表記、1行での複数義務消込を拒否する

**`HIL-NFR-28`の保持対象**

- `NFR28-A02` 各active requirementをsource atomへ個別接続する
- `NFR28-A03` 各active requirementをauthorityへ個別接続する
- `NFR28-A05` 各active requirementをservice/capabilityまたは根拠付き非該当へ個別接続する
- `NFR28-A06` 各active requirementをtemplate applicabilityへ個別接続する
- `NFR28-A07` 各active requirementをdesign obligationへ個別接続する
- `NFR28-A08` 未解決ambiguity、orphan、stale revisionをgreenにしない

### 候補処置

- retire候補となる旧ID: `HIL-NFR-26`, `HIL-NFR-28`
- 吸収・再配置案: new requirement-definition/design-obligation completeness NFR
- 候補内容: 要求側と設計義務側の固有atomを一つのcomposite completeness NFRへ統合し、旧2 identityをretire候補にする

**retire前に必須の条件**

- requirement単位とobligation単位の二つの分母を保持
- 全negative caseをL11へ保持
- 対象revision付き人間decision

### 選択肢

- **A**: 全固有atomを新しいcomposite NFRへ移す候補とし、旧2 IDをretire候補にする。
- **B**: 要求完全性と設計完全性を別要求として残す。
- **C**: 接続設計まで保留する。

## 5. Q-RET-005 — Node↔Python固定IPCの技術指定廃止候補

### 比較する旧要求の原文全文

**`HIL-TR-08` revision 1 / `sha256:4b8901dea297c274a7055c0c26840eef6a309aec0647557573de9372ffed2c95`**

> Node↔Pythonの初期正規IPCはchild process＋versioned JSON Lines over stdioとし、stdoutをprotocol、stderrを診断専用にする。envelopeはschema/run/request/type/sequence/deadline/payload digestを持つ。

### 重複関係

この候補は他要求との意味重複ではなく、旧architecture固有の技術方式と、方式に依存しない品質条件の分離候補である。

### 各要求だけにあるため必ず残す意味

**`HIL-TR-08`の保持対象**

- `TR08-A03Q` protocolをversion管理する
- `TR08-A04Q` protocol channelへ診断出力を混在させない
- `TR08-A05Q` 診断channelをprotocol channelから分離する
- `TR08-A06` envelopeにschemaを持つ
- `TR08-A07` envelopeにrun identityを持つ
- `TR08-A08` envelopeにrequest identityを持つ
- `TR08-A09` envelopeにtypeを持つ
- `TR08-A10` envelopeにsequenceを持つ
- `TR08-A11` envelopeにdeadlineを持つ
- `TR08-A12` envelopeにpayload digestを持つ

**`HIL-TR-08`の技術binding検討対象**

- `TR08-A01` Node↔Pythonを対象runtime境界とする
- `TR08-A02` child processをtransport方式とする
- `TR08-A03T` JSON Lines over stdioを正規IPC方式とする
- `TR08-A04T` stdoutをtransport channelとして使用する
- `TR08-A05T` stderrを診断channelとして使用する

### 候補処置

- retire候補となる旧ID: `HIL-TR-08`
- 吸収・再配置案: architecture-selected runtime boundary contract, only if a cross-runtime boundary remains
- 候補内容: 固定技術方式をcurrent要求へ自動継承せず、必要な境界特性だけを新architectureから再導出する。境界自体が無ければ旧HIL-TR-08をretire候補にする

**retire前に必須の条件**

- 新世代runtime境界の有無をL3前のresearchで確認
- consumerとfailure/recoveryを計上
- 代替方式またはreplacement不要根拠
- 対象revision付き人間decision

### 選択肢

- **A**: 技術bindingを外す候補とし、方式非依存の品質atomだけを後継へ残す。
- **B**: Node↔Python＋JSON Lines over stdioをcurrent必須技術として残す。
- **C**: runtime research／PoCまで保留する。

## 回答方法

各節の原文とatom対応を確認したうえで、`Q-RET-001=A`の形式で5件を回答する。自由記述の場合は原文のまま記録し、
AIがA／B／Cへ推定変換しない。5件すべてが揃うまで回答を台帳へ適用しない。
