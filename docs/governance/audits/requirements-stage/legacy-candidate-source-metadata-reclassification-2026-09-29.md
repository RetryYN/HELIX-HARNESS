# 旧candidate source metadata 9行の分類修正提案（2026-09-29）

- 基準main: `bf00aca56add8ca29d9a56af9a989fdeb0a7d969`
- 分類・route基準: #2353 cumulative audit commit `9926aebfbec7813d14a84490758783153422d99e`
- authority effect: `none`。append-onlyのbounded classification proposalであり、source atom inventory/routerや元のroute auditを書き換えない。
- 対象は#2353で依然 `condition / product_requirement_atom / unknown` とされた9行。うち8行を`explanation`、1行を`condition / management_process_condition`へ提案分類する。

## 判定方針と旧監査のprecedent

- 文書ID、Behavior Contract ID、Issue番号、approval receipt pointerは、それ単独でproduct behaviorや条件を述べないためexplanationとする。本文内の実要求行は別source IDで保全される。
- `draft_candidate`や`candidate approved / canonical not promoted`の単純status fieldはproduct behaviorでも規範的process conditionでもなくexplanationとする。approval前にcurrent authorityへ扱わない明示境界文（000111）はmanagement_process_conditionとして保持し、successorは未解決のままにする。
- `000382`は工程を進行できるが未完了というstatus statementであり、規範的適用条件ではないためexplanationとする。隣接行のcandidate/no-auto-rights制約はその別IDの意味として混ぜない。
- 先例の#2352 README監査は、候補revisionの承認対象分離を述べる`000021`とsource-location修正条件の`000037`のみmanagement_process_conditionにし、参照ポインタ7行をexplanationとして分類した（[監査](legacy-candidate-readme-pointer-classification-audit-2026-09-29.md), [JSON](legacy-candidate-readme-pointer-classification-audit-2026-09-29.json)）。今回も旧sourceの意味役割に合わせ、明示された承認対象分離条件と単なるstatus/ID/receipt参照を分ける。
- #2353 router自身は「requirement atom / unknown」と「no atom-specific route» を記録しており、metadata rowsのclassification根拠・隣接source scopeを再審査していない。したがってこのproposalは既存classificationの理由とsource contextを補うだけで、意味採択を行わない。

## 対象行と提案delta

| Source ID | 旧path:line | 提案分類 | 理由の要点 |
|---|---|---|---|
| `LEGACY-CAND-LINE-000111` | `docs/governance/candidates/agentic-audit-future-state-delta-requests.md:45` | `management_process_condition` | 旧候補のauthority状態とplan固有L3承認の境界を明示する文。製品の振る舞いではなく、承認前のcandidate sourceをcurrent authorityとして扱わない管理process condition。#2352の`000021`のように承認対象分離を明示した行と同じく、status metadataだけの行とは異なる。 |
| `LEGACY-CAND-LINE-000250` | `docs/governance/candidates/authority-vocabulary-requests.md:19` | `explanation` | 文書IDの自己記述metadata。能力、望ましい振る舞い、適用条件、拒否条件を述べず、本文の要求は後続AVS-BR行に別source atomとして記録される。 |
| `LEGACY-CAND-LINE-000251` | `docs/governance/candidates/authority-vocabulary-requests.md:20` | `explanation` | `draft_candidate / plan固有承認前`は文書状態metadata。ID行とBehavior Contract行の間にあるstatus記録で、命令・条件・期待する製品振る舞いを定めない。approval前の有効性境界を独立に述べる000111とは異なり、状態を報告する説明行。 |
| `LEGACY-CAND-LINE-000252` | `docs/governance/candidates/authority-vocabulary-requests.md:21` | `explanation` | Behavior Contractの識別子を示すmetadataであり、contractの条件自体は本文のAVS-BR以下に分離されている。ID文字列そのものはproduct atomではない。 |
| `LEGACY-CAND-LINE-000287` | `docs/governance/candidates/authority-vocabulary-requirements.md:20` | `explanation` | 文書ID metadata。AVS-FR/AVS-Rの要求条件は後続の独立source rowsにあり、この行はIDだけを宣言する。 |
| `LEGACY-CAND-LINE-000288` | `docs/governance/candidates/authority-vocabulary-requirements.md:21` | `explanation` | `draft_candidate / L3候補承認済み・canonical未昇格`はdocument authority/status metadataで、製品条件やprocess directiveではなく、要求本文に先行する状態報告。古いIssue approvalの現行authority効果は別途推論しない。 |
| `LEGACY-CAND-LINE-000289` | `docs/governance/candidates/authority-vocabulary-requirements.md:22` | `explanation` | Main Issue番号へのprovenance pointer。Issue identity自体は要求条件もproduct behaviorも定義せず、承認sourceとの接続は次行に独立記載される。 |
| `LEGACY-CAND-LINE-000290` | `docs/governance/candidates/authority-vocabulary-requirements.md:23` | `explanation` | 旧approval recordへのprovenance pointer。receipt ID/URLは判断sourceの参照metadataであり、承認条件・製品挙動ではない。receiptが存在することから現行採択を生成しない。 |
| `LEGACY-CAND-LINE-000382` | `docs/governance/candidates/bugbot-bounded-repair-requirements.md:17` | `explanation` | canonical promotion・IR admission・実装・限定実証へ進行可能だが未完了という作業状態要約。文のsubjectは候補工程の進捗で、許可条件や製品挙動を定義しない。前後の別行にあるcandidate/no-auto-rightsやscope boundaryの意味をこのstatus rowへ混ぜない。 |

適用する場合のclassification deltaは、condition `-8`、explanation `+8`、management_process_condition `+1`（総source rows不変）。Subtype deltaはproduct requirement atom `-9`、management process condition `+1`。route deltaはproduct unknown `-9`、management successor unresolved `+1`。これは対象9 IDのoverlay差分であり、#2353全体を再計算したresultやauthority claimではない。

## 旧sourceの前後文脈

JSONには9対象すべての物理line bytes SHA/base64、file SHA、line SHA、前後行、source asset ID、#2353 router classification/outcomeを固定した。下記は分類理由を見分けるためのsource文脈。

### LEGACY-CAND-LINE-000111 — `condition / management_process_condition`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requests.md:45`; asset `LEGACY-ASSET-8247A056F30FF91E4B8D`
- file SHA-256: `d78bbcc0ca184bfb87dc2bbc932291f97a58bf9f0fd703481489f15944be9b76`; line SHA-256: `sha256:19417f7abca0212162b69e660785f73158be91d6efe984d4836247173a3ac2f3`; physical-line bytes SHA-256: `feffff9aa1a3e27fc434dc04928ac2c2f490d7fe54c236963a323823d616fc58`
- 原文: `- 本文はcandidateであり、plan固有L3承認前はcurrent authorityではない。`
- 周辺行:
  - line 40: `## 境界`
  - line 41: ``
  - line 42: `- 新しいworkflow route、development style、DB authority、resident laneを作らない。`
  - line 43: `- UIL、TER、Future Synthesis、System Synthesis、Learning Systemを再実装しない。`
  - line 44: `- AI監査、delta、future directiveはRequirement、Design、Release、Assignment、merge authorityを直接変更しない。`
- router: `requirement_atom / unknown` (`unknown_after_semantic_check`, batch 4)
- 理由: 旧候補のauthority状態とplan固有L3承認の境界を明示する文。製品の振る舞いではなく、承認前のcandidate sourceをcurrent authorityとして扱わない管理process condition。#2352の`000021`のように承認対象分離を明示した行と同じく、status metadataだけの行とは異なる。

### LEGACY-CAND-LINE-000250 — `explanation`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requests.md:19`; asset `LEGACY-ASSET-E9BDD9DCA6CF67CBE424`
- file SHA-256: `5c29cba6331dff96082f74612ceaf755fe4a30a10e75be62797e8073de7fec99`; line SHA-256: `sha256:bbab9164f3b5527cb3bf963126fd73a3c9bff518895cbd29018efe4ef0479b15`; physical-line bytes SHA-256: `5cde3cf236245ce41bc9663bf787d3fa088189adbe0f81513c3fa97e62540e06`
- 原文: `- 文書ID: `HELIX-AVS-BRQ-001``
- 周辺行:
  - line 17: `# authority語彙分離要求`
  - line 18: ``
  - line 20: `- 状態: `draft_candidate / plan固有承認前``
  - line 21: `- Behavior Contract: `AUTHORITY-VOCABULARY-SEPARATION-001``
  - line 22: ``
  - line 23: `## 要求`
  - line 24: ``
- router: `requirement_atom / unknown` (`unknown_after_semantic_check`, batch 2)
- 理由: 文書IDの自己記述metadata。能力、望ましい振る舞い、適用条件、拒否条件を述べず、本文の要求は後続AVS-BR行に別source atomとして記録される。

### LEGACY-CAND-LINE-000251 — `explanation`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requests.md:20`; asset `LEGACY-ASSET-E9BDD9DCA6CF67CBE424`
- file SHA-256: `5c29cba6331dff96082f74612ceaf755fe4a30a10e75be62797e8073de7fec99`; line SHA-256: `sha256:89c55cf0e058a9e378c7990479f023775651e0bd6025fa3575069deed4123b5e`; physical-line bytes SHA-256: `3f42ae5658ed0c5d586916a5683742555067175ca5947f9a16e35c23ed537530`
- 原文: `- 状態: `draft_candidate / plan固有承認前``
- 周辺行:
  - line 17: `# authority語彙分離要求`
  - line 18: ``
  - line 19: `- 文書ID: `HELIX-AVS-BRQ-001``
  - line 21: `- Behavior Contract: `AUTHORITY-VOCABULARY-SEPARATION-001``
  - line 22: ``
  - line 23: `## 要求`
  - line 24: ``
- router: `requirement_atom / unknown` (`unknown_after_semantic_check`, batch 2)
- 理由: `draft_candidate / plan固有承認前`は文書状態metadata。ID行とBehavior Contract行の間にあるstatus記録で、命令・条件・期待する製品振る舞いを定めない。approval前の有効性境界を独立に述べる000111とは異なり、状態を報告する説明行。

### LEGACY-CAND-LINE-000252 — `explanation`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requests.md:21`; asset `LEGACY-ASSET-E9BDD9DCA6CF67CBE424`
- file SHA-256: `5c29cba6331dff96082f74612ceaf755fe4a30a10e75be62797e8073de7fec99`; line SHA-256: `sha256:12865bf5dc80920dbc3724350cf464de149907fa041d0cedb8d1c1ed47ef9375`; physical-line bytes SHA-256: `b00b4302bb9feefdd0f3dfd832b71ccb05f14f89754c40427cdd046c9e0faff4`
- 原文: `- Behavior Contract: `AUTHORITY-VOCABULARY-SEPARATION-001``
- 周辺行:
  - line 17: `# authority語彙分離要求`
  - line 18: ``
  - line 19: `- 文書ID: `HELIX-AVS-BRQ-001``
  - line 20: `- 状態: `draft_candidate / plan固有承認前``
  - line 22: ``
  - line 23: `## 要求`
  - line 24: ``
  - line 25: `### AVS-BR-001 人間authorityを会話解釈から生成しない`
- router: `requirement_atom / unknown` (`unknown_after_semantic_check`, batch 2)
- 理由: Behavior Contractの識別子を示すmetadataであり、contractの条件自体は本文のAVS-BR以下に分離されている。ID文字列そのものはproduct atomではない。

### LEGACY-CAND-LINE-000287 — `explanation`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md:20`; asset `LEGACY-ASSET-17E4FD7C3DB0B3C82210`
- file SHA-256: `cb97e7594b38cfada7d4fedb948937bab9e9d8f3e7c7123eca82a7ce6e8f8eb4`; line SHA-256: `sha256:506eb349ee90bc143e7e54d1517b6cbb619cfe7940281fef3edcd110c3d405ac`; physical-line bytes SHA-256: `13571f0a4b139e761bcb19e81f4c8b62af21e598c70e7108bc37da510d18e44e`
- 原文: `- 文書ID: `HELIX-AVS-REQ-001``
- 周辺行:
  - line 18: `# authority語彙分離要件`
  - line 19: ``
  - line 21: `- 状態: `draft_candidate / L3候補承認済み・canonical未昇格``
  - line 22: `- 主Issue: `#1449``
  - line 23: `- 承認record: [`L3-PO-1449-001`](https://github.com/RetryYN/HELIX-HARNESS/issues/1449#issuecomment-5544538084)`
  - line 24: ``
  - line 25: `## Feature契約`
  - line 26: ``
  - line 27: `### AVS-FR-001 入力分類`
  - line 28: ``
  - line 29: `- `AVS-R-01`: 会話入力を`consultation_input/feedback_signal/request_directive/selection_candidate/approval_candidate/decision_candidate`のexact setへ分類し、分類根拠とsource revisionを保持する。`
- router: `requirement_atom / unknown` (`unknown_after_semantic_check`, batch 2)
- 理由: 文書ID metadata。AVS-FR/AVS-Rの要求条件は後続の独立source rowsにあり、この行はIDだけを宣言する。

### LEGACY-CAND-LINE-000288 — `explanation`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md:21`; asset `LEGACY-ASSET-17E4FD7C3DB0B3C82210`
- file SHA-256: `cb97e7594b38cfada7d4fedb948937bab9e9d8f3e7c7123eca82a7ce6e8f8eb4`; line SHA-256: `sha256:deb834dd197b560009ac95258e20ff4ccffbea7ca971da29249c9743038cb321`; physical-line bytes SHA-256: `86864fc59a0c996cea5fe177859c90d1c47e2ed1f814de34dd42e505ed0da27e`
- 原文: `- 状態: `draft_candidate / L3候補承認済み・canonical未昇格``
- 周辺行:
  - line 18: `# authority語彙分離要件`
  - line 19: ``
  - line 20: `- 文書ID: `HELIX-AVS-REQ-001``
  - line 22: `- 主Issue: `#1449``
  - line 23: `- 承認record: [`L3-PO-1449-001`](https://github.com/RetryYN/HELIX-HARNESS/issues/1449#issuecomment-5544538084)`
  - line 24: ``
  - line 25: `## Feature契約`
  - line 26: ``
  - line 27: `### AVS-FR-001 入力分類`
  - line 28: ``
  - line 29: `- `AVS-R-01`: 会話入力を`consultation_input/feedback_signal/request_directive/selection_candidate/approval_candidate/decision_candidate`のexact setへ分類し、分類根拠とsource revisionを保持する。`
- router: `requirement_atom / unknown` (`unknown_after_semantic_check`, batch 2)
- 理由: `draft_candidate / L3候補承認済み・canonical未昇格`はdocument authority/status metadataで、製品条件やprocess directiveではなく、要求本文に先行する状態報告。古いIssue approvalの現行authority効果は別途推論しない。

### LEGACY-CAND-LINE-000289 — `explanation`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md:22`; asset `LEGACY-ASSET-17E4FD7C3DB0B3C82210`
- file SHA-256: `cb97e7594b38cfada7d4fedb948937bab9e9d8f3e7c7123eca82a7ce6e8f8eb4`; line SHA-256: `sha256:812d37b10be0cd711bb006f57fd027a526b8b9b967209051a28b631f5f0c9358`; physical-line bytes SHA-256: `ea2ec1d8ab33bf8e118bd3c707515e6bb7ec066936ea0f1df3e092817f4d535b`
- 原文: `- 主Issue: `#1449``
- 周辺行:
  - line 18: `# authority語彙分離要件`
  - line 19: ``
  - line 20: `- 文書ID: `HELIX-AVS-REQ-001``
  - line 21: `- 状態: `draft_candidate / L3候補承認済み・canonical未昇格``
  - line 23: `- 承認record: [`L3-PO-1449-001`](https://github.com/RetryYN/HELIX-HARNESS/issues/1449#issuecomment-5544538084)`
  - line 24: ``
  - line 25: `## Feature契約`
  - line 26: ``
  - line 27: `### AVS-FR-001 入力分類`
  - line 28: ``
  - line 29: `- `AVS-R-01`: 会話入力を`consultation_input/feedback_signal/request_directive/selection_candidate/approval_candidate/decision_candidate`のexact setへ分類し、分類根拠とsource revisionを保持する。`
- router: `requirement_atom / unknown` (`unknown_after_semantic_check`, batch 2)
- 理由: Main Issue番号へのprovenance pointer。Issue identity自体は要求条件もproduct behaviorも定義せず、承認sourceとの接続は次行に独立記載される。

### LEGACY-CAND-LINE-000290 — `explanation`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md:23`; asset `LEGACY-ASSET-17E4FD7C3DB0B3C82210`
- file SHA-256: `cb97e7594b38cfada7d4fedb948937bab9e9d8f3e7c7123eca82a7ce6e8f8eb4`; line SHA-256: `sha256:7f754bd1a4cff72f2f42bd0a41fc33f63a2ce3981c097dcbe362fec565aeb1ee`; physical-line bytes SHA-256: `e083f31eb8c01902d0daeb861801261bb48a01d3c2693e242b067dc79612f28a`
- 原文: `- 承認record: [`L3-PO-1449-001`](https://github.com/RetryYN/HELIX-HARNESS/issues/1449#issuecomment-5544538084)`
- 周辺行:
  - line 18: `# authority語彙分離要件`
  - line 19: ``
  - line 20: `- 文書ID: `HELIX-AVS-REQ-001``
  - line 21: `- 状態: `draft_candidate / L3候補承認済み・canonical未昇格``
  - line 22: `- 主Issue: `#1449``
  - line 24: ``
  - line 25: `## Feature契約`
  - line 26: ``
  - line 27: `### AVS-FR-001 入力分類`
  - line 28: ``
  - line 29: `- `AVS-R-01`: 会話入力を`consultation_input/feedback_signal/request_directive/selection_candidate/approval_candidate/decision_candidate`のexact setへ分類し、分類根拠とsource revisionを保持する。`
- router: `requirement_atom / unknown` (`unknown_after_semantic_check`, batch 2)
- 理由: 旧approval recordへのprovenance pointer。receipt ID/URLは判断sourceの参照metadataであり、承認条件・製品挙動ではない。receiptが存在することから現行採択を生成しない。

### LEGACY-CAND-LINE-000382 — `explanation`

- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requirements.md:17`; asset `LEGACY-ASSET-D881AF6AFD277B1DE934`
- file SHA-256: `81dc848cde93395e5cf5e49d5545856f482403d41c7eae75cae993a9c4229dbb`; line SHA-256: `sha256:8bd83b72ded3d53a7a8437d8c3671244543949072857ad19c8384242bbf5e900`; physical-line bytes SHA-256: `ccb38624f9f6a399cb80a6ae6681f9ec893ef58e687b6b11930e9651196201eb`
- 原文: `canonical promotion・該当IR admission・実装・限定実証へ進行できるが、その成立は未完了。`
- 周辺行:
  - line 13: `# 逸脱検出・限定修復`
  - line 14: ``
  - line 15: `本書は追加契約候補であり、自動適用権限を発行しない。BBR IDは候補内ID。`
  - line 16: `L1/L10・専用PLANは同名候補に接続する。候補は`L3-PO-1642-001`で承認済み。`
  - line 18: `既存GH-FR-011のCI自己修復権限内の機械化と、新しい適用対象・契機・権限差分を分ける。`
  - line 19: `#1595は別途の自動修復を対象外としている。その承認をBへ継承しない。`
  - line 20: ``
  - line 21: `## 既存権限と追加差分の判別`
  - line 22: ``
  - line 23: `GH-FR-011はAI作成PRのCI失敗を同一episodeで修正する責務であり、登録済み修復器へ`
  - line 24: `任意の自動write権限を発行する契約ではない。対象PR・契機・episode・所有scope・既存操作権限の`
  - line 25: `すべてが既存契約内なら、その検収済み経路を再利用する。修復器登録だけではこの充足を認めない。`
  - line 26: `自動適用の対象・契機・write-set・副作用・権限が拡張される部分は追加差分としてL1/L3/L10へ戻す。`
  - line 27: `不足が不明なら観測・proposalに留め、その不足を理由に既存の許可済み自己修復や調査を一律停止しない。`
- router: `requirement_atom / unknown` (`unknown_after_semantic_check`, batch 4)
- 理由: canonical promotion・IR admission・実装・限定実証へ進行可能だが未完了という作業状態要約。文のsubjectは候補工程の進捗で、許可条件や製品挙動を定義しない。前後の別行にあるcandidate/no-auto-rightsやscope boundaryの意味をこのstatus rowへ混ぜない。

## 000111 と 000382の個別境界

- 000251と000288は単純なdocument status fieldであり、現行authority状態を決める判断ではなく歴史的snapshot metadata。前後のAVS本文にある実要求の個別意味とは区別する。
- `000111`はAAFD requests本文の`境界`見出し下にある。「candidateであり、plan固有L3承認前はcurrent authorityではない」というsource lifecycle boundaryである。これは製品機能ではないが、candidate statusからcurrent authorityを生成しない状態条件なのでmanagement_process_conditionとする。
- `000382`はBugbot additional-contract候補の冒頭で、canonical promotion・IR admission・実装・限定実証へ進む可能性と未完了状態を報告する文。これ自体は要求・許可条件ではない。前後の別行（candidateで自動適用権限を発行しない、既存GH-FR-011境界等）はそれぞれ別IDの要求意味として保持するため、説明行に分類する。

## 現行層・authority状態との照合

- HELIX-OSの2026-09-19 decisionはL2D-S1-01 authority-vocabularyを`defer`とし、packet v2もsource holdingsが未評価の状態を記録する。旧AVS status/ID/Issue/receipt metadataは現行OS要求IDや採択receiptにはならない。
- HELIX-INTELLIGENCEの現行L2と候補はAAFD/BBR詳細sourceをcandidate-onlyで保持する。固定L2/L11 decisionの採用は、個々の古いID/status/approval pointerを遡及的にproduct requirementへ変換しない。
- JSON `pinned_inputs`は#2353 proposal, router, asset ledger, #2352 precedent, L2D decision/packet, current L2/L11 and authority-state modelのSHA-256を記録する。

## 非主張

- Formal successorやmanagement successor IDを割り当てない。
- 旧source semantic closure、candidate approval/canonicalization、requirements-stage完了、全母集団recountを主張しない。
- 6 explanation / 3 management_process_conditionのoverlay proposalであり、元route auditを改訂しない。
