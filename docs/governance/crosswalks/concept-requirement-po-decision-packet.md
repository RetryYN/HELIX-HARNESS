# Concept要求再配置 PO判断パッケージ

親：[HELIX Concept](../../concept/helix-concept.md)。本書は採否を**求める候補一覧**であり、採否・承認・Issue close・successor採番を記録しない。原文と全列は[要求対応表](concept-mechanism-version-requirement-crosswalk.jsonl)に保持する。原文は各項目に短縮せず示す。Conceptの現行ファイルを基準にする。

## PO判断に載せる条件

人が持つConcept・L1・L2／prototype合意・L3承認の意味が変わる項目、または[authority状態モデル](../authority-state-model.md)が対象revisionの人間decisionを求める項目だけを判断対象とする。旧sourceの未承認、conflict、未特定、旧HELIXの対応記述が見つからない箇所も残す。旧sourceでのconfirmed／specified/frozenは新配置の承認ではない。担当移動や技術選定だけは後段のAI作業一覧に置く。

各選択肢の「保留」は原文と旧authority状態を保持し、完成・不採用・retireを意味しない。推奨は**レビュー順序・候補**であり、PO decisionではない。

## 判断項目

### HARNESS-L2-001

- 原要求ID・原文位置・revision：`HARNESS-L2-001`、`docs/helix-harness/L2-requirements/product-requirements.md:52`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：企画・要求・要件・設計・実装・検証をL1–L12と正規V-pairで構成できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HARNESS-L2-002

- 原要求ID・原文位置・revision：`HARNESS-L2-002`、`docs/helix-harness/L2-requirements/product-requirements.md:53`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：対象プロダクトに適した開発styleと工程の進め方を選べる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HARNESS-L2-003

- 原要求ID・原文位置・revision：`HARNESS-L2-003`、`docs/helix-harness/L2-requirements/product-requirements.md:54`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：工程の開始・凍結・差戻し・再開・完了に必要な条件を確認できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HARNESS-L2-004

- 原要求ID・原文位置・revision：`HARNESS-L2-004`、`docs/helix-harness/L2-requirements/product-requirements.md:55`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：要求から設計・テストへ対応を定義し、変更時の再検証範囲を決められる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HARNESS-L2-005

- 原要求ID・原文位置・revision：`HARNESS-L2-005`、`docs/helix-harness/L2-requirements/product-requirements.md:56`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：言語・tool・実装方式が異なっても、layer・pair・変更種別・riskに応じた検証義務と証拠条件を適用できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HARNESS-L2-006

- 原要求ID・原文位置・revision：`HARNESS-L2-006`、`docs/helix-harness/L2-requirements/product-requirements.md:57`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：外部利用者が、提供範囲・版・必要依存・導入条件を確認してHARNESSを利用できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HARNESS-L2-007

- 原要求ID・原文位置・revision：`HARNESS-L2-007`、`docs/helix-harness/L2-requirements/product-requirements.md:58`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：検証フェーズで複数のプロダクトを開発し、HELIX自身のプロジェクトにも適用した結果を含めて、HELIX-HARNESS製品群Version 1の完成を確認できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HARNESS-L2-008

- 原要求ID・原文位置・revision：`HARNESS-L2-008`、`docs/helix-harness/L2-requirements/product-requirements.md:59`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：Concept／企画L1、利用者指示と根拠から要求候補を形成し、単体・接続・構成体の対象粒度を分け、要求化漏れ・企画外追加・矛盾・重複・過剰解釈・対象違い・scope／non-goal逸脱・変更影響を提示して、人間の訂正と合意により要求へ収束できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HARNESS-L2-009

- 原要求ID・原文位置・revision：`HARNESS-L2-009`、`docs/helix-harness/L2-requirements/product-requirements.md:60`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：要求kind、対象、構成、risk、domainに合うversioned Design Templateから必要な設計義務を導き、templateが必要とする要求入力の不足を質問・要求候補として上流へ戻せる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXOS-L2-001

- 原要求ID・原文位置・revision：`HELIXOS-L2-001`、`docs/helix-os/L2-requirements/governance-requirements.md:54`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：プロジェクトごとの企画・要求正本・採否・合意revisionと担当責務を確認できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXOS-L2-002

- 原要求ID・原文位置・revision：`HELIXOS-L2-002`、`docs/helix-os/L2-requirements/governance-requirements.md:55`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：プロジェクト群の要求から作業・実装・検証・提供・運用まで追跡し、欠落と競合を把握できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXOS-L2-003

- 原要求ID・原文位置・revision：`HELIXOS-L2-003`、`docs/helix-os/L2-requirements/governance-requirements.md:56`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：共通統制と各プロダクトの開発方式の選択を区別し、変更影響を対象範囲へ伝播できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXOS-L2-004

- 原要求ID・原文位置・revision：`HELIXOS-L2-004`、`docs/helix-os/L2-requirements/governance-requirements.md:57`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：Workerへ作業を割り当てて実行・回収し、優先度・予算・依存・レビュー能力の制約内で進行を統制できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS／HELIX-BRAIN／Runner／Sandbox／HELIX-Security`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### HELIXOS-L2-005

- 原要求ID・原文位置・revision：`HELIXOS-L2-005`、`docs/helix-os/L2-requirements/governance-requirements.md:58`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：HARNESS自身への適用を含む観測・失敗・改善候補を、出典と適用範囲を保持して対象要求へ還流し、採択後の変更・再検証・効果確認まで継続できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS／HELIX-LABO`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### HELIXOS-L2-006

- 原要求ID・原文位置・revision：`HELIXOS-L2-006`、`docs/helix-os/L2-requirements/governance-requirements.md:59`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：HARNESSの提供版を新規・既存プロジェクトへ導入し、更新・復旧できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXOS-L2-007

- 原要求ID・原文位置・revision：`HELIXOS-L2-007`、`docs/helix-os/L2-requirements/governance-requirements.md:60`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：Worker・判断・操作・検証のログと証拠を保存し、対象プロジェクトと要求revisionから参照できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXOS-L2-008

- 原要求ID・原文位置・revision：`HELIXOS-L2-008`、`docs/helix-os/L2-requirements/governance-requirements.md:61`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：承認済み上流revisionとHARNESSの検証契約から責務に合うCI profileを組み立て、隔離して実行・監視・回収・再開できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS／Runner／Sandbox`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### HELIXOS-L2-009

- 原要求ID・原文位置・revision：`HELIXOS-L2-009`、`docs/helix-os/L2-requirements/governance-requirements.md:62`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：中断・担当交代・障害後に、許可範囲内で継続・復旧できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXOS-L2-010

- 原要求ID・原文位置・revision：`HELIXOS-L2-010`、`docs/helix-os/L2-requirements/governance-requirements.md:63`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：管理・推進・検収を別責務として編成し、同じticketと因果関係を保ちながら双方向に調整できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXOS-L2-011

- 原要求ID・原文位置・revision：`HELIXOS-L2-011`、`docs/helix-os/L2-requirements/governance-requirements.md:64`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：ticket、設計、実差分、統合先、依存と承認済みHARNESS契約から、統合順序・統合単位・検証実行計画を導出し、実行結果とbase変更に応じて再計画できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXOS-L2-012

- 原要求ID・原文位置・revision：`HELIXOS-L2-012`、`docs/helix-os/L2-requirements/governance-requirements.md:65`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：内部system情報と外部技術情報を、出典・revision・時点・取得範囲・欠落・適用条件付きで調査できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXOS-L2-013

- 原要求ID・原文位置・revision：`HELIXOS-L2-013`、`docs/helix-os/L2-requirements/governance-requirements.md:66`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：管理・推進・検収・Worker・crawler・CIを同じ仕事へ関連付け、要求からの欠落と失敗からの原因候補を双方向に診断して是正効果まで追跡できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS／HELIX-LABO`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### HELIXWEB-L2-001

- 原要求ID・原文位置・revision：`HELIXWEB-L2-001`、`docs/helix-web/L2-requirements/product-requirements.md:36`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：利用者がWebから自分の許可された開発環境を選び、対象プロジェクトの操作と進行をダッシュボードで確認できる。全コード・計算資源をSaaSへ移すことを必須にしない
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web`、製品属性 `製品（HELIX-Web）`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXWEB-L2-002

- 原要求ID・原文位置・revision：`HELIXWEB-L2-002`、`docs/helix-web/L2-requirements/product-requirements.md:37`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：必要な開発能力の提供版を選び、Connectorへの導入・互換性・更新・撤去と結果を確認できる。Connectorに開発engineを重複実装しない
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web／HELIX-CONNECT`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### HELIXWEB-L2-003

- 原要求ID・原文位置・revision：`HELIXWEB-L2-003`、`docs/helix-web/L2-requirements/product-requirements.md:38`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：長時間jobの実行・切断・取消・再開・終端と証拠を確認できる。結果不明の副作用を無条件に再実行しない
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web`、製品属性 `製品（HELIX-Web）`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXWEB-L2-004

- 原要求ID・原文位置・revision：`HELIXWEB-L2-004`、`docs/helix-web/L2-requirements/product-requirements.md:39`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：対応するprovider経路と利用条件、利用者環境から返送する情報の範囲を確認できる。未確認のログイン再利用や経路を対応済みと表示しない
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web`、製品属性 `製品（HELIX-Web）`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXWEB-L2-005

- 原要求ID・原文位置・revision：`HELIXWEB-L2-005`、`docs/helix-web/L2-requirements/product-requirements.md:40`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：何を変更し、何を許可し、何を受け入れるかを自分で判断し、検収済み範囲の保守・改修を行える。残る専門判断を確認できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web`、製品属性 `製品（HELIX-Web）`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXWEB-L2-006

- 原要求ID・原文位置・revision：`HELIXWEB-L2-006`、`docs/helix-web/L2-requirements/product-requirements.md:41`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：適用範囲・版・評価証拠を確認したHDAを開発補助に利用できる。学習と分散推論の提供責務を分け、応答を独立検収済みとみなさない
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web`、製品属性 `製品（HELIX-Web）`、`version_target: 3.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXWEB-L2-007

- 原要求ID・原文位置・revision：`HELIXWEB-L2-007`、`docs/helix-web/L2-requirements/product-requirements.md:42`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：Webが採用する開発能力・Connector・モデル・接続契約の構成版を確認できる。Webの変更で無関係なHARNESSやモデルを一斉更新しない
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web`、製品属性 `製品（HELIX-Web）`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXWEB-L2-008

- 原要求ID・原文位置・revision：`HELIXWEB-L2-008`、`docs/helix-web/L2-requirements/product-requirements.md:43`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：Web-OSのservice log・telemetry・利用結果をどの目的・範囲でHELIX-OSの改善へ渡すかを確認できる。サービス利用をログexportや横断学習への包括同意とみなさない
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web`、製品属性 `製品（HELIX-Web）`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXWEB-L2-009

- 原要求ID・原文位置・revision：`HELIXWEB-L2-009`、`docs/helix-web/L2-requirements/product-requirements.md:44`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：複数プロダクトの開発検証とHELIX自身への適用を含む、HELIX-HARNESS製品群Version 1の完成証拠を確認した後にHELIX-Webを展開できる。Webの完成をVersion 1へ算入せず、HARNESS未完成のまま展開しない
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web`、製品属性 `製品（HELIX-Web）`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXWEBOS-L2-001

- 原要求ID・原文位置・revision：`HELIXWEBOS-L2-001`、`docs/helix-web-os/L2-requirements/service-governance-requirements.md:28`、`git-blob:8c0fcb438d9a8ea81480d2f8342b192d99670d1a`。
- 原文：tenant・利用者・project・environmentごとにauthority、resource、state、evidenceを隔離できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web-OS`、製品属性 `非製品（HELIX-Web-OS）`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXWEBOS-L2-002

- 原要求ID・原文位置・revision：`HELIXWEBOS-L2-002`、`docs/helix-web-os/L2-requirements/service-governance-requirements.md:29`、`git-blob:8c0fcb438d9a8ea81480d2f8342b192d99670d1a`。
- 原文：適格なHARNESS能力をConnectorへ導入・更新・撤去し、Web版・Connector版・能力版・接続契約を追跡できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web-OS／HELIX-CONNECT`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### HELIXWEBOS-L2-003

- 原要求ID・原文位置・revision：`HELIXWEBOS-L2-003`、`docs/helix-web-os/L2-requirements/service-governance-requirements.md:30`、`git-blob:8c0fcb438d9a8ea81480d2f8342b192d99670d1a`。
- 原文：長時間jobの受付、配信、進行、切断、取消、再開、終端、結果不明を同じjob identityで管理できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web-OS`、製品属性 `非製品（HELIX-Web-OS）`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXWEBOS-L2-004

- 原要求ID・原文位置・revision：`HELIXWEBOS-L2-004`、`docs/helix-web-os/L2-requirements/service-governance-requirements.md:31`、`git-blob:8c0fcb438d9a8ea81480d2f8342b192d99670d1a`。
- 原文：認証、provider経路、credential利用、network／data scope、利用者環境から返送する情報を操作ごとに制御できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web-OS／HELIX-Security／HELIX-CONNECT`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### HELIXWEBOS-L2-005

- 原要求ID・原文位置・revision：`HELIXWEBOS-L2-005`、`docs/helix-web-os/L2-requirements/service-governance-requirements.md:32`、`git-blob:8c0fcb438d9a8ea81480d2f8342b192d99670d1a`。
- 原文：jobの原eventと証拠から、HELIX-Webのダッシュボードへ進行・状態・成果・停止・再開をrevision付きで投影できる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web-OS`、製品属性 `非製品（HELIX-Web-OS）`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：A 原文の意味・制約・受入を保持する配置候補を採用し、現行Conceptとの責務差分は後続の対象別改訂で検証。

### HELIXWEBOS-L2-006

- 原要求ID・原文位置・revision：`HELIXWEBOS-L2-006`、`docs/helix-web-os/L2-requirements/service-governance-requirements.md:33`、`git-blob:8c0fcb438d9a8ea81480d2f8342b192d99670d1a`。
- 原文：service release、deployment、monitoring、incident、backup、restore、rollback、maintenanceを対象版と証拠へ束縛し、許可されたservice log・telemetry・利用結果をHELIX-OSの改善入口へ渡せる
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-Web-OS／HELIX-LABO／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.x`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### HIL-BR-01

- 原要求ID・原文位置・revision：`HIL-BR-01`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-01 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:53`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Codex自動走行とClaude Code監査を、PRとharness.db eventで交互に接続し、人のL3承認後は不可逆境界以外を無人完走する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-03

- 原要求ID・原文位置・revision：`HIL-BR-03`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-03 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:55`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Claude CodeはCodex完了時にraw実行ログ、PR、test/CI、監査所見を圧縮し、永続知識だけをharness memoryへ昇格する。進捗はDB continuationへ残しmemoryへ混載しない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-04

- 原要求ID・原文位置・revision：`HIL-BR-04`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-04 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:56`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：全Issueはdevelopment style、case-driven activation、specialist capability、runtime modeを別fieldで持つ。Reverse R0–R4が適用されるIssueでは実装前の先行taskとし、省略値を持たない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-05

- 原要求ID・原文位置・revision：`HIL-BR-05`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-05 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:57`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：監査で既存設計の欠陥または不足が判明した場合は、選択済みdevelopment style内の`Redesign` specialist routeへ割り当て、再freeze後に実装する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-06

- 原要求ID・原文位置・revision：`HIL-BR-06`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-06 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:58`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：IssueはAdmission、Reverse Evidence、Redesign、Scope、Implementation Entry、Closureの各gateを通過しない限りready/implement/merge/closeへ遷移しない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-07

- 原要求ID・原文位置・revision：`HIL-BR-07`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-07 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:59`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：user directiveとIssueは分類前にdurable intake receiptを持ち、AIが不要判断だけでreject/drop/close/cancelできない。AIの非actionable dispositionは非終端で、cancel/supersedeはPOだけが行える。closure receiptが無いcloseは拒否または再openする。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-08

- 原要求ID・原文位置・revision：`HIL-BR-08`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-08 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:60`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：acceptance oracleに不要な機能拡張、公開API、CLI、schema、dependency、設定、汎用化をScope Gateで拒否する。必要性が新たに判明した場合は子Issue＋Reverseへ分離する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-09

- 原要求ID・原文位置・revision：`HIL-BR-09`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-09 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:61`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：工程表のlayer×drive×task-kind×verification patternからHARNESS所有agent contractとW-agent teamを生成し、Claude/Codex固有定義へ決定論的に射影する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-13

- 原要求ID・原文位置・revision：`HIL-BR-13`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-13 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:65`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：全PLANは画面工程を`prototype_required`または`not_applicable`へ明示分類する。画面対象はprototype→walkthrough→要求back-propagation→agreement後に要件をfreezeし、画面非対象は証拠付きskip receiptでのみ通過する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-16

- 原要求ID・原文位置・revision：`HIL-BR-16`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-16 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:68`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：検証をslice統合前のimpact CI、candidate固定後のfull CI、GitHub PR上の外部CIの3段に固定し、各段のSHA/treeと直前段からのlineageがgreenでなければ次段へ進めない。style内統合によるSHA変更はpredecessor bindingで追跡する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-18

- 原要求ID・原文位置・revision：`HIL-BR-18`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-18 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:70`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：HARNESSはagent定義だけでなく、生成、lease、実行、checkpoint、検証、解放、quarantine、retireまでのinstance lifecycleを正本として保持する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-19

- 原要求ID・原文位置・revision：`HIL-BR-19`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-19 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:71`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Bun撤去はNodeでも一部動く状態ではなく、activeな開発・実行・検証・配布surfaceがBunなしで再現可能となった時点だけを完了とする。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-21

- 原要求ID・原文位置・revision：`HIL-BR-21`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-21 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:73`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：設計上の重複、責務混在、変更波及、埋込みpolicyを、外部仕様と受入挙動を維持したまま外部化・共通化・オブジェクト化する第一級`DesignRefactor`駆動モデルを持つ。要求・公開contract・永続state semanticsを変える場合は`Redesign`または`Retrofit`へrerouteする。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-22

- 原要求ID・原文位置・revision：`HIL-BR-22`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-22 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:74`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：要求系統とservice/capability系統をDesign Templateへ結び、各要求から生じる設計義務を原子的に生成・消込する。閉じた要求集合について説明のない設計漏れを0件にし、未知の要求まで網羅したとは主張しない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-23

- 原要求ID・原文位置・revision：`HIL-BR-23`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-23 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:75`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：HARNESS所有のRequirement Translator subagentはchat、product data、source capabilityを要求atomへ翻訳し、既存templateで表現不能な論点を黙って捨てずTemplate Gap Issueとして改善loopへ戻す。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-25

- 原要求ID・原文位置・revision：`HIL-BR-25`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-25 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:77`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：canonical L1からL12の各layerに粒度固有の設計・実行・検証台帳を置く`Layer Ledger Chain`を持つ。L0 charterは層外authority anchorとしてL1企画へ投影する。各台帳は上位/下位layerと双方向に導出・逆伝播し、正規V-modelの左右pairとも双方向に対応する。上下または左右の片edgeだけで工程完了を主張しない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-26

- 原要求ID・原文位置・revision：`HIL-BR-26`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-26 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:78`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：AIは要件・設計・PLAN・関連Markdownを自律的に起草、追加、修正、分割、統合、改名できる。Authoringの自由とCanonical化を分離し、正本化だけを`Authoring Admission Transaction`で制御する。可逆かつ既定policy内の変更は自動確定し、上位目的、安全境界、不可逆な外部契約を変更する場合だけ人間へescalateする。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-27

- 原要求ID・原文位置・revision：`HIL-BR-27`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-27 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:79`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：要求定義から下流を自動走行するための設計契約とtemplate見本は固定冊数で配布せず、要求atom、設計義務、risk、状態遷移、failure境界、適用工程から必要十分な`Design Contract Portfolio`を導出する。同じ意味契約の文書量産と、見本不足をLLM自由補完で埋めることの双方を拒否する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-28

- 原要求ID・原文位置・revision：`HIL-BR-28`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-28 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:80`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：`Design Contract Portfolio`を選択済みdevelopment styleのlayer entry/exitへ接続し、短いsprintでも上位要求・style返却先・V-pair oracleを失わない。Discovery／PoCはScrum非内包のcase-driven S0–S4として別接続し、S4判断後だけ選択済みstyleへ収束する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-30

- 原要求ID・原文位置・revision：`HIL-BR-30`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-30 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:82`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：HARNESSは工程表、Design Contract Portfolio、判断pack、task分類から専門agent contractを必要時に自動生成し、runtime固有subagent定義へ射影する。専門化の根拠がないagent増殖を避け、worker/verifier/authority分離、最小context、tool/path権限、budget、停止条件を生成時に拘束する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-BR-33

- 原要求ID・原文位置・revision：`HIL-BR-33`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-33 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:85`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：配布はmarketplace型パッケージ仕様（正本index、手編集禁止の生成index、first-party/third-party分離、免責記載）で定義し、配布surfaceの実切替は既存cutover承認境界に従う。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-01

- 原要求ID・原文位置・revision：`HIL-FR-01`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-01 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:91`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：`InfinityLoopEvent`を受理し、`intake→reverse→redesign?→pair-freeze→implementation→local-prejoin-ci→forward-join→internal-postjoin-ci→github-pr→external-ci→audit→merge/issue`を状態遷移する。各段は入力commit/tree digestと前段receiptへbindする。 \| append-only event、現在state、parent/cause ID
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-03

- 原要求ID・原文位置・revision：`HIL-FR-03`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-03 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:93`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Issue contractはobjective、acceptance oracle、development style、case-driven activation、specialist capabilities、runtime mode、affected layers、style target、risk、scope budget、digestを別fieldで保持する。 \| versioned issue contract＋digest
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-04

- 原要求ID・原文位置・revision：`HIL-FR-04`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-04 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:94`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Universal Reverse Gateは全IssueのR0–R4を順序実行し、各phaseのobligation集合、input/output digest、stage固有schema、source coverage、R4 routing、双方向参照を検査する。R1を含むphase skipは認めず、該当契約なしも探索証拠付き結論として記録する。 \| pass/fail receipt＋不足/空洞化code
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-05

- 原要求ID・原文位置・revision：`HIL-FR-05`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-05 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:95`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Redesign routerは設計欠陥をcanonical L1–L6の影響層へ割り当てる。L1企画変更はL12運用テストpairを、L2要求変更はL11受入テストpairとScreen Applicability/prototypeまたはskip receiptをstale化して再freezeし、Reverse→Redesign→pair-freeze→Forwardの順序を強制する。層外L0 charter変更はPOへescalateする。 \| redesign PLAN、修正layer、stale edge、pair receipt
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-06

- 原要求ID・原文位置・revision：`HIL-FR-06`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-06 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:96`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Scope Gateはallowed changes、non-goals、PO-bound capability budget、requirement→symbol→test traceを実diffと照合する。derived HIL IDは自己正当化に使えず、chat/L0/PO-approved parent oracleへのderivationとminimum-necessary proofを要求する。子Issueも同じscope authorityを継承する。 \| scope violation、unjustified capability一覧
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-07

- 原要求ID・原文位置・revision：`HIL-FR-07`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-07 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:97`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Closure GateはPR、CI、独立audit、選択済みstyleへのmerge、oracle、memory compaction、子Issue状態を検査する。 \| closure receipt、close可否
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-10

- 原要求ID・原文位置・revision：`HIL-FR-10`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-10 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:100`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Memory CompactorはIssue admission時の問題・判断要約とCodex completion時の永続知識を別event種別で圧縮し、promote/supersede/no-promotionを記録する。進捗/raw logはmemoryへ複製しない。 \| issue-summary、compressed memoryまたはno-promotion receipt
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-11

- 原要求ID・原文位置・revision：`HIL-FR-11`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-11 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:101`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Agent Registryはlayer、drive、task-kind、context pack、skills、blind、generates、forbidden paths、verification patternsをHARNESS正本として持つ。 \| runtime中立agent contract
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-17

- 原要求ID・原文位置・revision：`HIL-FR-17`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-17 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:107`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Screen Applicability GateはL0 charter、scope、公開surfaceから画面／対話の有無を判定する。画面ありはDesign HARNESS specialist capabilityと必要時のcase-driven prototypeを別々に発動し、画面なしskipには理由、判定者、入力digest、再entry triggerを要求する。 \| `prototype_required` taskまたは`not_applicable` receipt
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-18

- 原要求ID・原文位置・revision：`HIL-FR-18`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-18 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:108`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：画面対象のPrototype Builderはscreen ID、主要操作、遷移、9状態fixture、仮データ境界を実行可能artifactへ材料化する。視覚忠実度とは独立に要求発見に必要な操作経路を再生可能にする。 \| artifact manifest、digest、起動手順、screen/interaction/state trace
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-19

- 原要求ID・原文位置・revision：`HIL-FR-19`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-19 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:109`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：画面対象のWalkthrough Loopはprototype版、ユーザー観測、発見要求deltaまたは`no_delta`、L1反映先、再作成判断を記録し、boundedに反復する。 \| walkthrough receipt、requirements delta、iteration checkpoint
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-20

- 原要求ID・原文位置・revision：`HIL-FR-20`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-20 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:110`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Screen Gateは画面対象ならartifact、walkthrough、要求反映、prototype agreementを検査し、画面非対象ならskip receiptのscope/digest/再entry条件を検査する。いずれも無い場合はL1 freezeとL3開始をfail-closeする。 \| G2判定、agreementまたはskip receipt、不足code
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-22

- 原要求ID・原文位置・revision：`HIL-FR-22`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-22 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:112`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Source Capability Coverage Gateは各抽出capabilityに一意IDを付け、`adopt/harden/redesign/reject/absorbed`、根拠、HIL要件、基本設計、test、detector/gateを双方向joinする。未判断、根拠なしreject、孤立capability、複合IDによる一括合格が1件でもあればpair-freezeを拒否する。 \| capability ledger、coverage matrix、failure code
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-24

- 原要求ID・原文位置・revision：`HIL-FR-24`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-24 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:114`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Product Data Ingestionはfull/incremental snapshotを冪等取得し、source record→canonical entity→requirement/design/Issue mapping、provenance、freshness、tombstone、schema driftをread projectionへ投影する。 \| snapshot、watermark、mapping edge、stale/drift finding
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-CONNECT／HELIX-OS／HELIX-BRAIN`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 2.0候補（外部データ実取込。1.0は接続・記録土台のみ）`。
- 理由：版境界conflict：旧原文の実取込を1.0完成条件に含めない。2.0配置か1.0土台＋2.0取込への分割を対象revisionで判断。L11直接対応は未特定。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-27

- 原要求ID・原文位置・revision：`HIL-FR-27`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-27 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:117`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Node/Python Supervisorはworker起動、protocol handshake、request相関、progress、result、error、timeout、cancel、process終了を管理し、失効runのlate resultをcommitしない。 \| run lease、protocol digest、terminal receipt、fenced result
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-30

- 原要求ID・原文位置・revision：`HIL-FR-30`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-30 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:120`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Finding Dispositionはcurrent contract違反、correctness/security/data loss、必須oracle/main/evidenceへの影響と責務境界を評価し、同じ責務・既存scope内で安全かつ局所的に閉じるfindingを`current_pr_fix`、独立責務・別設計・lifecycle・性能改善を`successor_issue`へ分類する。Finding Promotion Pipelineは`successor_issue`だけから重複判定、Issue contract、Universal Reverse、memory issue-summary、Codex queue itemを同一causality IDで原子的に生成する。`current_pr_fix`はwriterへ一括返却し、途中欠落はreadyにしない。 \| typed disposition、writer return、Issue/Reverse/memory/queue join
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-31

- 原要求ID・原文位置・revision：`HIL-FR-31`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-31 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:121`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Upstream Redesign Re-entryはaffected layerがL1ならL1/L12 pairを、L2ならL2/L11 pairとscreen applicability/prototype agreementをstale化し、再承認前の実装claimとForward合流を拒否する。 \| stale edge、re-entry task、re-freeze receipt
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-33

- 原要求ID・原文位置・revision：`HIL-FR-33`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-33 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:123`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Bun Dependency Coverage Gateはactive source/import/command/script/test/package/lockfile/CI/hook/template/setup/distributionからBun依存を抽出する。historical/archiveだけを理由付きallowlist可能とする。 \| classified dependency ledger、active Bun count
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-34

- 原要求ID・原文位置・revision：`HIL-FR-34`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-34 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:124`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：OS Contract Runnerは同一fixtureでpath separator/case/space/Unicode/permission/symlink/signal/process group/file lock/SQLite/executable discoveryをLinux/macOS/Windows adapterへ適用する。 \| OS contract result、adapter violation
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-35

- 原要求ID・原文位置・revision：`HIL-FR-35`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-35 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:125`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Reverse Substance GateはR0 evidence map、R1 observed contracts、R2 as-is design/test、R3 intent hypothesis＋PO検証、R4 gap/routingをstage別schemaで検査し、空、placeholder、同文、同digest、対象obligation未被覆、根拠なし`no finding`を拒否する。 \| phase assertion、coverage、content digest、substance failure code
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-38

- 原要求ID・原文位置・revision：`HIL-FR-38`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-38 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:128`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Scope Authority Gateは各capabilityの根拠をchat directive、L0、PO-approved scopeまたはそのderivation chainへ結び、acceptance寄与、最小性、代替案、budget消費を検査する。後付け要件だけの循環根拠を拒否する。 \| authority edge、necessity proof、budget receipt
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-39

- 原要求ID・原文位置・revision：`HIL-FR-39`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-39 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:129`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Design Refactor Gateはdesign graph、重複contract/policy/schema、責務とstate invariant、consumer集合、before/after oracleを比較し、`externalize/commonize/objectize/semantic-rename`を独立変換として計画する。renameは名称の文字列類似だけで決めず、入出力、副作用、failure、state transition、call graph、consumer contractを含むsemantic signatureで、同義名の統一または同名異義の分離を判定する。behavior preservation、全consumer compatibility、Scope Authority、設計pair更新、rollbackが揃う場合だけ既存`Refactor`実装へ接続し、observable behavior、public surface、DB semantics、要求の差分を検出した場合は`Redesign/Retrofit`へrerouteする。 \| design-refactor PLAN、変換種別、before/after graph digest、semantic/name collision evidence、behavior-preservation receipt、reroute receipt
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-40

- 原要求ID・原文位置・revision：`HIL-FR-40`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-40 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:130`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Domain Object/Naming Catalogは設計objectを`Entity/ValueObject/Aggregate/DomainService/Policy/Specification/Command/Query/DomainEvent/Receipt/Port/Adapter/Repository`へ分類し、identity、immutability、aggregate boundary、invariant、authority、lifecycle、consumer、canonical termを保持する。各objectとimplementation symbol、test oracle IDを別edgeで決定論的に結び、内部rename後もoracle identityを維持する。 \| domain object catalog、naming decision、symbol edge、oracle edge、boundary/invariant finding
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-42

- 原要求ID・原文位置・revision：`HIL-FR-42`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-42 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:132`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Design Obligation Graphは`source/directive→requirement atom→capability/service→domain object→API/data/state/event/failure/security/observability/lifecycle/operation/test oracle/gate`を双方向に結び、必須義務を生成する。未消込、孤児、placeholder、根拠のないN/A、aggregate一括消込が1件でもあればpair-freezeを拒否する。 \| obligation graph、discharge receipt、coverage receipt、未消込finding
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-46

- 原要求ID・原文位置・revision：`HIL-FR-46`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-46 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:136`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Layer Ledger Registryはcanonical L1–L12ごとにledger type、粒度、必須node/edge、authority、input/output、entry/exit gate、template versionを登録する。L0 charterは層外authority anchorとして別登録する。各layer ledgerのrowはstable subject ID、revision、source span、semantic digest、status、owner、downstream/upstream edgeを持つ。 \| layer ledger catalog、row revision、layer snapshot、coverage receipt
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-48

- 原要求ID・原文位置・revision：`HIL-FR-48`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-48 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:138`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Vertical Ledger Pair Gateは隣接layer間の`derived_from/downstream_to`と`backpropagates_to/supersedes`を双方向検査し、上位義務の未降下、下位発見の未逆伝播、粒度不整合、stale revision、aggregate一括pairを拒否する。 \| vertical edge receipt、unresolved descent/backprop finding
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-49

- 原要求ID・原文位置・revision：`HIL-FR-49`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-49 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:139`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Horizontal V-Pair Gateはcanonical正規pair `L1↔L12(企画/運用テスト)`、`L2↔L11(要求/受入テスト)`、`L3↔L10(要件/総合テスト)`、`L4↔L9(基本設計/結合テスト)`、`L5↔L8(詳細設計/単体テスト)`と、`L6実装↔L7 TDD closure`を原子的oracle単位で双方向joinする。L12運用feedbackはL1企画と層外L0 charterへ還流し、設計義務と検証証拠の片側欠落、異なるsnapshot、未実行oracleを拒否する。 \| V-pair receipt、design/verification edge、snapshot/oracle finding
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-50

- 原要求ID・原文位置・revision：`HIL-FR-50`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-50 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:140`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Ledger Design Refactorはlayer ledgerの重複、責務混在、semantic/name collision、変更波及、孤立edgeを比較し、externalize/commonize/objectize/semantic-rename/split/merge候補を生成する。全上下・左右consumer、before/after oracle、pair保持、rollbackが揃うbehavior-preserving変更だけをDesignRefactorへ送り、要求/公開contract/永続state変更はRedesign/Retrofitへrerouteする。 \| ledger diff、refactor candidate/plan、pair-preservation receipt、reroute receipt
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-51

- 原要求ID・原文位置・revision：`HIL-FR-51`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-51 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:141`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Authoring Admission EngineはProposalの意味差分、authority、revision、trace、pair、impact、安全境界、rollback routeを検査し、`auto_admit`、`auto_admit_with_stale_propagation`、`repair_then_retry`、`human_decision_required`、`reject`、`conflict`のいずれかを決定する。 \| admission decision、検査finding、authority/impact/rollback receipt
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-52

- 原要求ID・原文位置・revision：`HIL-FR-52`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-52 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:142`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Atomic Canonicalization TransactionはMarkdown、asset revision、event ledger、trace、impact、stale propagation、harness.db projection、receiptを単一operationで原子的に更新する。部分成功をCanonicalとして扱わず、command idempotencyとbase revision CASを強制する。 \| canonicalization receipt、before/after revision、write count、rollback/conflict receipt
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-54

- 原要求ID・原文位置・revision：`HIL-FR-54`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-54 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:144`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Contract Portfolio Plannerはrequirement atomとDesign Obligation Graphを、authority、lifecycle、interface/data/state/event/failure/security/observability/operation、V-pair oracleの同値classへ分ける。各classにnormative contractを原則1件割り当て、既存契約の再利用、delta追加、新規作成、根拠付きN/Aを判定し、未被覆0かつ意味重複0となる最小portfolioを提案する。 \| obligation-to-contract matrix、portfolio manifest、reuse/delta/new/N/A receipt、uncovered/duplicate finding
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-55

- 原要求ID・原文位置・revision：`HIL-FR-55`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-55 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:145`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Template Example Calibratorはactive templateの各validation ruleとapplicability branchに対し、最低限canonical positive 1件と境界negative 1件を要求する。状態遷移、failure、security、migration、multi-runtime差異はrisk分析で未被覆の場合だけ例を追加し、例の個数ではなくrule/branch/risk coverageで十分性を判定する。 \| example adequacy matrix、positive/negative fixture、risk追加理由、redundancy finding
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-FR-56

- 原要求ID・原文位置・revision：`HIL-FR-56`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-56 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:146`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Workflow Contract Routerはportfolio itemを選択済みdevelopment styleの対象layer input/output、entry/exit gate、下位task、right-arm V-pairへbindする。case-driven modelではS0 hypothesisにgapと親要求、S1 experiment planに契約snapshot・style返却先・budget、S2 pocに生成物、S3 verifyにoracle evidence、S4 decideにconfirmed/rejected/pivotとback-propagationを必須化し、S4未決定の成果をproduction currentへ昇格しない。 \| workflow binding manifest、phase snapshot、style return edge、S4 decision/back-propagation receipt
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-02

- 原要求ID・原文位置・revision：`HIL-NFR-02`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-02 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:182`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：worker≠verifier≠knowledge promoterを維持し、Codexは最終audit/close/memory昇格を自己承認しない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-03

- 原要求ID・原文位置・revision：`HIL-NFR-03`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-03 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:183`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：全IssueのReverse処理量を省略しない。`none/not-required/exempt`とphase skipを禁止し、budget到達は未完obligationを免除せずcheckpoint＋未完了状態へ遷移する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-06

- 原要求ID・原文位置・revision：`HIL-NFR-06`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-06 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:186`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：認証・認可・決済・PII・secret・license・schema migration・破壊的データ・本番/外部infraはaction-binding approvalを必要とする。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-07

- 原要求ID・原文位置・revision：`HIL-NFR-07`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-07 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:187`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Scope Gateは機能追加数だけでなくcomplexity、public surface、運用負債を測り、authoritative oracleへの寄与とminimum-necessary proofがない拡張を拒否する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-08

- 原要求ID・原文位置・revision：`HIL-NFR-08`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-08 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:188`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：PR監査、Issue Gate、agent registry、memory compaction、ZIP detectorはfailure codeとprovenanceを持ち、proseだけの合格を禁止する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-09

- 原要求ID・原文位置・revision：`HIL-NFR-09`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-09 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:189`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Linux primaryで全core gateを実行し、macOS/Windows差異はadapter contract testで検出する。OS別logic forkを作らない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-10

- 原要求ID・原文位置・revision：`HIL-NFR-10`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-10 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:190`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：agent adapterを削除してもHARNESS registryから再生成でき、runtime固有agent memory/rule siloを正本にしない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-11

- 原要求ID・原文位置・revision：`HIL-NFR-11`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-11 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:191`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：画面工程は暗黙skip不可とする。画面対象では静的wireframe/proseだけを操作可能prototypeの代替にせず、画面非対象ではLLMの自由文判断だけをskip evidenceにしない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-14

- 原要求ID・原文位置・revision：`HIL-NFR-14`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-14 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:194`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：IPCは不正JSON、schema不一致、oversize、sequence欠落、worker crash、timeout、cancel、backpressure、親process消失をfail-closeし、partial resultを正本へ昇格しない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-15

- 原要求ID・原文位置・revision：`HIL-NFR-15`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-15 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:195`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：3段CI receiptは各段自身のcommit/tree digestと直前段receiptへbindし、lineageのない別SHA greenを再利用しない。quarantine resultをgreen件数へ算入しない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-19

- 原要求ID・原文位置・revision：`HIL-NFR-19`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-19 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:199`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Linuxをcore completion platformとし、macOS portable suiteとWindows compatibility smokeの未実施は明示する。Windows wrapper成功をLinux互換証拠にしない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-20

- 原要求ID・原文位置・revision：`HIL-NFR-20`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-20 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:200`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Reverse artifactは非空、stage間非同一、source span再現可能、obligation coverage 100%を満たす。文字数だけの下限を内容証拠にせず、stage固有fieldとsemantic assertionで検査する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-21

- 原要求ID・原文位置・revision：`HIL-NFR-21`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-21 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:201`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：user directive/findingの原記録はappend-onlyで、AI dispositionは原記録を削除・不可視化・終端化しない。PO以外のcancel/supersedeと、独立reviewなしのfalse-positive/accepted-riskを拒否する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-23

- 原要求ID・原文位置・revision：`HIL-NFR-23`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-23 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:203`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：scope derivation graphはacyclicでauthoritative rootへ到達し、capability自身または同時追加HILだけを根拠にするcycleを拒否する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-24

- 原要求ID・原文位置・revision：`HIL-NFR-24`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-24 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:204`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Design Refactorは「将来使えそう」「綺麗になる」という推測や名称の文字列類似だけでrename、共通層、base class、汎用object、設定surfaceを増やさない。実在するsemantic similarity/name collision、重複・変更波及・責務混在の証拠、全consumer、最小変換、behavior invariant、退行時rollbackを要求し、誤った名称統一、抽象化、scope creepを拒否する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-25

- 原要求ID・原文位置・revision：`HIL-NFR-25`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-25 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:205`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Domain Objectはclass化自体を目的にせず、identity/invariant/lifecycle/authorityがないpayloadをEntity/Aggregateへ昇格しない。Value Objectはimmutable、Aggregate更新はroot境界内transaction、Queryはside-effectなし、Domain Eventは完了事実の過去形、domainはPortを介してAdapterへ依存する。`Manager/Helper/Util/Data`等の責務不明名を根拠なしで許さず、testはprivate実装名でなくdomain object＋operation＋oracle IDへbindする。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-26

- 原要求ID・原文位置・revision：`HIL-NFR-26`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-26 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:206`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：文書、template、見出し、入力欄の存在だけを設計完全性とみなさない。各義務は意味のある設計内容、双方向edge、test oracleまたはscope付きN/A receiptで個別消込し、`TBD`、空欄、範囲表記、1行での複数義務消込を拒否する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-28

- 原要求ID・原文位置・revision：`HIL-NFR-28`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-28 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:208`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：requirement coverageの行数、ID連番、文書存在だけを要件定義の設計完全性としない。各active requirementはsource atom、authority、acceptance oracle、service/capabilityまたは根拠付き非該当、template applicability、design obligationへ個別に結び、未解決ambiguity、orphan、stale revisionをgreenにしない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-29

- 原要求ID・原文位置・revision：`HIL-NFR-29`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-29 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:209`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Layer Ledger Chainはtemplate/file/章/aggregate親の存在をpair coverageに算入せず、原子的obligationとoracleを分母にする。上下・左右edgeは両方向、同一revision/snapshot、意味粒度一致を要求し、deferred、stale、未実行、片肺pairをgreenにしない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-30

- 原要求ID・原文位置・revision：`HIL-NFR-30`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-30 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:210`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：可逆かつ既定policy内のAuthoring変更では人間入力を要求せず、機械検証からCanonical化まで自動完走できる。確認待ちを安全策として乱発せず、真のauthority境界だけをescalateする。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-32

- 原要求ID・原文位置・revision：`HIL-NFR-32`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-32 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:212`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：意味変更はauthority、impact、pair、oracle、rollback、downstream stale propagationが揃わない限りCanonical化しない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-NFR-33

- 原要求ID・原文位置・revision：`HIL-NFR-33`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-33 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:213`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：contract/templateの十分性はファイル数、ページ数、見本数、見出し数で判定しない。全applicable obligation、validation rule、branch、risk、V-pair oracleが一意にcoveredであることを要求し、過剰な重複contract/exampleもcontext costとdrift riskとしてfinding化する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0`。
- 理由：既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 HARNESS内配置は未特定（サービス①〜⑦／入口／枠／部品／コアを原文・Concept §3で照合）。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-TR-01

- 原要求ID・原文位置・revision：`HIL-TR-01`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-01 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:165`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：HELIX control planeはTypeScript strict＋Node.jsを唯一の正規runtimeとし、Bun固有API・command・lockfile・CI・distribution契約をactive surfaceから除去する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-TR-02

- 原要求ID・原文位置・revision：`HIL-TR-02`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-02 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:166`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Pythonはproduct-data、document-engine、detector、analysis workerのdata/detection planeとして第一級化し、Node control planeとはversioned schema/event/CLI contractで接続する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-TR-03

- 原要求ID・原文位置・revision：`HIL-TR-03`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-03 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:167`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：ZIP Python実装は採用候補だが、HELIX state/gateを迂回して直接正本を書かない。入力digest、出力schema、provenance、detector resultをDBへ投影する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-TR-04

- 原要求ID・原文位置・revision：`HIL-TR-04`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-04 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:168`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：OS優先順位はLinuxをprimary、macOSをfirst-class portable、Windowsをcompatibility profileとする。WSL/Git Bash/PowerShellをcore前提にしない。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-TR-05

- 原要求ID・原文位置・revision：`HIL-TR-05`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-05 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:169`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：path、process、signal、file lock、SQLite、executable discoveryをOS adapterへ隔離し、Linux CIを基準、macOS/Windows smokeを互換性証拠とする。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-TR-06

- 原要求ID・原文位置・revision：`HIL-TR-06`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-06 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:170`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Node/Python双方のdependency lock、runtime version、offline/clean install、SBOM/secret/license検査を再現可能にする。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-TR-07

- 原要求ID・原文位置・revision：`HIL-TR-07`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-07 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:171`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：SQLite/harness.dbはcontrol planeのevent/projection backboneを維持し、Python分析用read modelとNode write authorityを分離する。write authority変更はL4で決定する。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：原crosswalkが意味差分・適用範囲の判断を要求。原文を保持。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-TR-08

- 原要求ID・原文位置・revision：`HIL-TR-08`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-08 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:172`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Node↔Pythonの初期正規IPCはchild process＋versioned JSON Lines over stdioとし、stdoutをprotocol、stderrを診断専用にする。envelopeはschema/run/request/type/sequence/deadline/payload digestを持つ。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-TR-09

- 原要求ID・原文位置・revision：`HIL-TR-09`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-09 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:173`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Python workerはharness.dbへ直接writeせず、Nodeがschema検証済みresult/findingをtransactionalにcommitする。Pythonへは必要最小限のread snapshotだけを渡す。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### HIL-TR-11

- 原要求ID・原文位置・revision：`HIL-TR-11`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-11 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:175`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Bun cutover完了時はNode clean install/build/test/CLI/hooks/package/distributionをBun binary/loader/API/lockfileなしで実行可能にする。
- 提案：原要求の意味は保持し、未特定の機構・HARNESS内区分・導入版または明示された意味差分を対象revisionで判断する。 候補機構 `未特定`、製品属性 `未特定`、`version_target: 未特定`。
- 理由：対象未特定。carry-forward台帳のtarget_assessmentとConcept §3を照合したが単一ownerを特定できない。
- 選択肢と影響：A 原文維持し責務候補を採用→分割・接続のL2／L11起草へ。B 意味変更→旧意味と変更前後をdecisionへ束縛。C 保留→原状態を保持。
- 推奨：C 保留。原文atomの被覆と責務を提示後にA/Bを判断。

### DTK-HARNESS-001

- 原要求ID・原文位置・revision：`DTK-HARNESS-001`、`docs/governance/candidates/development-ticket-derivation-requirements.md:21`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：要求候補または合意要求から推進がtyped ticketを生成するときに、解消すべき不確実性、次の成果、ticket identityを区別するcontractを定める
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### DTK-HARNESS-002

- 原要求ID・原文位置・revision：`DTK-HARNESS-002`、`docs/governance/candidates/development-ticket-derivation-requirements.md:22`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：`poc` ticketは技術・成立性仮説、対象要求、timebox、許可scope、入力、判定基準、expected evidence、終了条件、backflow先を持つ
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### DTK-HARNESS-003

- 原要求ID・原文位置・revision：`DTK-HARNESS-003`、`docs/governance/candidates/development-ticket-derivation-requirements.md:23`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：`ui_prototype` ticketは対象要求・actor・task・surface、prototype revision、確認する操作・状態・failure、利用者反応、合意／未解決、backflow先を持つ
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### DTK-HARNESS-004

- 原要求ID・原文位置・revision：`DTK-HARNESS-004`、`docs/governance/candidates/development-ticket-derivation-requirements.md:24`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：`feature` ticketは採用済み親要求、対象kind、設計義務、pair、acceptance、scope、依存、許可、停止、証拠を持つ
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### DTK-HARNESS-005

- 原要求ID・原文位置・revision：`DTK-HARNESS-005`、`docs/governance/candidates/development-ticket-derivation-requirements.md:25`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：ticket結果を要求エンジンへ戻し、要求候補の訂正・採否、追加質問、設計template再選定、stale範囲を提示する
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### DTK-HARNESS-006

- 原要求ID・原文位置・revision：`DTK-HARNESS-006`、`docs/governance/candidates/development-ticket-derivation-requirements.md:26`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：技術選定は承認済み要求と新世代architecture責務から導き、PoCで適合性、risk、運用、移行、rollbackを比較する
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### DTK-HARNESS-007

- 原要求ID・原文位置・revision：`DTK-HARNESS-007`、`docs/governance/candidates/development-ticket-derivation-requirements.md:27`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：推進側が生成するworkflowを検証できるよう、対象要求とHARNESS版に必要なlayer／pair、成果物、oracle、human gate、停止・差戻し・backflowの充足contractを提供する
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-HARNESS`、製品属性 `製品（HELIX-HARNESS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### DTK-OS-001

- 原要求ID・原文位置・revision：`DTK-OS-001`、`docs/governance/candidates/development-ticket-derivation-requirements.md:33`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：管理は目的、親要求revision、優先度、制約、許可、予算、期限、適用HARNESS版を推進へ渡し、推進が生成したlocal ticketとworkflowを登録・統制する
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### DTK-OS-002

- 原要求ID・原文位置・revision：`DTK-OS-002`、`docs/governance/candidates/development-ticket-derivation-requirements.md:34`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：local ticketをGitHub Issue等へprojectionし、remote番号・状態・commentを原ticketへ関連付ける
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### DTK-OS-003

- 原要求ID・原文位置・revision：`DTK-OS-003`、`docs/governance/candidates/development-ticket-derivation-requirements.md:35`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：PoC／prototype／featureの実行・成果・反応・finding・期限切れ・取消を別stateで管理し、正しい要求・template・設計へbackflowする
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### DTK-OS-004

- 原要求ID・原文位置・revision：`DTK-OS-004`、`docs/governance/candidates/development-ticket-derivation-requirements.md:36`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：architectureで分けたsemantic／transactional責務ごとに技術候補、評価条件、PoC結果、採否、失効を管理する
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### DTK-OS-005

- 原要求ID・原文位置・revision：`DTK-OS-005`、`docs/governance/candidates/development-ticket-derivation-requirements.md:37`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：推進は管理から受けた目的・要求・制約とHARNESS contractを解釈し、triggerに合うHARNESS routeを選び、operational tag、versioned mapping、composition、workflow instance生成規則でPoC／UI prototype／Feature ticketとworkflowを生成する
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### DTK-OS-006

- 原要求ID・原文位置・revision：`DTK-OS-006`、`docs/governance/candidates/development-ticket-derivation-requirements.md:38`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：operational tag、HARNESS normative vocabularyへのmapping、composition、workflow instance生成規則を推進がversion管理し、開発style、work kind、変更種別、risk、surfaceを必要に応じて合成する
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### DTK-OS-007

- 原要求ID・原文位置・revision：`DTK-OS-007`、`docs/governance/candidates/development-ticket-derivation-requirements.md:39`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：検収は推進が生成したticket graphとworkflowを承認済みHARNESS contract、親要求、依存、許可に照らして独立確認し、不足を推進または上流へ戻す
- 提案：現行Conceptの機構・導入版・製品属性に合わせたL2／L11候補として扱う。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0`。
- 理由：現行L2またはDTKはdraft/candidateであり、Conceptとの差分と対象revisionのL2合意が未了。
- 選択肢と影響：A 原文の意味・制約・受入を採用→対象revisionへ束縛。B 意味変更→変更前後と影響を記録して判断。C 保留→原状態を維持。
- 推奨：C 保留し、対応表の責務・版・受入差分を確認後A/Bを判断。

### L1-COV-G1-SYSTEM-DRIVEN-AUTONOMY

- 原要求ID・原文位置・revision：`L1-COV-G1-SYSTEM-DRIVEN-AUTONOMY`、`docs/governance/audits/source-rebaseline/l1-goals-principles-coverage-audit.md:52`、`git-blob:f6cfbb9ebe8a570e1c20c558c74f1664b84d183c`。
- 原文：\| `L1-COV-G1-SYSTEM-DRIVEN-AUTONOMY` \| 承認済み上流から進行、停止、差戻し、再開、完了を判断できる工程・検証契約 \| system stateとwork graphから次のactionable workを導き、Workerへ割り当て、要求・承認・権限を自己生成せず継続する管理・推進・検収 \| 製品固有の目的、制約、許可、停止条件、利用者判断を提供する責務 \|
- 提案：監査work unitの意味を、Conceptに整合した対象別L1差分候補として検討する。 候補機構 `HELIX-HARNESS／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0土台／1.x Web（該当時）`。
- 理由：監査unitは要求IDではなく、対象別L1の意味変更には人の判断が必要。
- 選択肢と影響：A L1差分を採用→対象別要求とL11へ降ろす。B 意味を修正→修正前後を記録。C 保留→監査unitのまま保持。
- 推奨：C 保留し、L1差分の原文比較を確認。

### L1-COV-G3-SIMULATION

- 原要求ID・原文位置・revision：`L1-COV-G3-SIMULATION`、`docs/governance/audits/source-rebaseline/l1-goals-principles-coverage-audit.md:53`、`git-blob:f6cfbb9ebe8a570e1c20c558c74f1664b84d183c`。
- 原文：\| `L1-COV-G3-SIMULATION` \| simulation入力・relation・不確実性・反証・検証義務の開発契約 \| simulationの実行、revision付き記録、実測差、再計画、改善候補化 \| 製品固有の価値、制約、運用条件を入力として提供する責務 \|
- 提案：監査work unitの意味を、Conceptに整合した対象別L1差分候補として検討する。 候補機構 `HELIX-HARNESS／HELIX-BRAIN／HELIX-LABO／HELIX-OS`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0土台／1.x Web（該当時）`。
- 理由：監査unitは要求IDではなく、対象別L1の意味変更には人の判断が必要。
- 選択肢と影響：A L1差分を採用→対象別要求とL11へ降ろす。B 意味を修正→修正前後を記録。C 保留→監査unitのまま保持。
- 推奨：C 保留し、L1差分の原文比較を確認。

### L1-COV-G4-NONENGINEER

- 原要求ID・原文位置・revision：`L1-COV-G4-NONENGINEER`、`docs/governance/audits/source-rebaseline/l1-goals-principles-coverage-audit.md:54`、`git-blob:f6cfbb9ebe8a570e1c20c558c74f1664b84d183c`。
- 原文：\| `L1-COV-G4-NONENGINEER` \| 非エンジニアが目的、判断事項、進行条件、品質、未決、riskを理解できる開発契約 \| CI・bot・Workerによる自動実行、差戻し、証拠化、停止・再開の統制 \| HELIX-WebはVersion 1後にdashboard操作体験を提供する。HARNESS Version 1の成立を代替しない \|
- 提案：監査work unitの意味を、Conceptに整合した対象別L1差分候補として検討する。 候補機構 `HELIX-HARNESS／HELIX-OS／HELIX-Web`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0土台／1.x Web（該当時）`。
- 理由：監査unitは要求IDではなく、対象別L1の意味変更には人の判断が必要。
- 選択肢と影響：A L1差分を採用→対象別要求とL11へ降ろす。B 意味を修正→修正前後を記録。C 保留→監査unitのまま保持。
- 推奨：C 保留し、L1差分の原文比較を確認。

### L1-COV-G5-WORKER-OPTIMIZATION

- 原要求ID・原文位置・revision：`L1-COV-G5-WORKER-OPTIMIZATION`、`docs/governance/audits/source-rebaseline/l1-goals-principles-coverage-audit.md:55`、`git-blob:f6cfbb9ebe8a570e1c20c558c74f1664b84d183c`。
- 原文：\| `L1-COV-G5-WORKER-OPTIMIZATION` \| 作業分類、能力契約、検証義務、escalation条件 \| Worker実測、費用、capacity、assignment、再配置、独立検証 \| 製品固有のrisk、data、作用、品質、期限、費用制約を提供する責務 \|
- 提案：監査work unitの意味を、Conceptに整合した対象別L1差分候補として検討する。 候補機構 `HELIX-HARNESS／HELIX-BRAIN／HELIX-OS／HELIX-LABO`、製品属性 `機構別属性はmechanism_product_attributesに記録`、`version_target: 1.0土台／1.x Web（該当時）`。
- 理由：監査unitは要求IDではなく、対象別L1の意味変更には人の判断が必要。
- 選択肢と影響：A L1差分を採用→対象別要求とL11へ降ろす。B 意味を修正→修正前後を記録。C 保留→監査unitのまま保持。
- 推奨：C 保留し、L1差分の原文比較を確認。

### 仮ID-BASE-01

- 原要求ID・原文位置・revision：`仮ID-BASE-01`、`docs/concept/helix-concept.md:96`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：\| ログと証拠 \| すべての機構が共通の形で記録する。誰が・何を・どの要求と構成の版で・どの能力とモデルの版を使い・どうなったかを、相関IDで結ぶ。要求、判断、変更、検証、手戻り、結果を一つの開発の経過（episode）として辿れるようにする \| 1.0の計測と復旧、2.0の推薦の実績、3.0の学習データ、4.0の判断根拠 \|
- 提案：Conceptの1.0土台の未被覆条件を、仮IDの追加要求候補としてL2／L11へ起草する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0土台`。
- 理由：既存行に部分候補があるがConceptの全条件と直接L11の被覆は未証明。
- 選択肢と影響：A 追加を合意→1.0の土台として受入を起草。B 既存の完全被覆を示す→仮IDを不要化。C 保留→未被覆疑義を維持。
- 推奨：C 保留し、既存要求の全条件被覆を先に照合。

### 仮ID-BASE-02

- 原要求ID・原文位置・revision：`仮ID-BASE-02`、`docs/concept/helix-concept.md:97`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：\| データの利用区分 \| 記録する時点で、出典、権利、機密区分、学習や外部送信に使ってよいかを付ける。学習用と評価用を分けられるようにする \| 3.0の学習、Web提供でのデータ還流 \|
- 提案：Conceptの1.0土台の未被覆条件を、仮IDの追加要求候補としてL2／L11へ起草する。 候補機構 `HELIX-Security`、製品属性 `非製品（HELIX-Security）`、`version_target: 1.0土台`。
- 理由：既存行に部分候補があるがConceptの全条件と直接L11の被覆は未証明。
- 選択肢と影響：A 追加を合意→1.0の土台として受入を起草。B 既存の完全被覆を示す→仮IDを不要化。C 保留→未被覆疑義を維持。
- 推奨：C 保留し、既存要求の全条件被覆を先に照合。

### 仮ID-BASE-03

- 原要求ID・原文位置・revision：`仮ID-BASE-03`、`docs/concept/helix-concept.md:98`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：\| 計測 \| 品質、費用、時間、再作業、失敗を、作業と構成の版ごとに測る \| 1.0のWorker配置、以降すべての改善の比較 \|
- 提案：Conceptの1.0土台の未被覆条件を、仮IDの追加要求候補としてL2／L11へ起草する。 候補機構 `HELIX-LABO`、製品属性 `非製品（HELIX-LABO）`、`version_target: 1.0土台`。
- 理由：既存行に部分候補があるがConceptの全条件と直接L11の被覆は未証明。
- 選択肢と影響：A 追加を合意→1.0の土台として受入を起草。B 既存の完全被覆を示す→仮IDを不要化。C 保留→未被覆疑義を維持。
- 推奨：C 保留し、既存要求の全条件被覆を先に照合。

### 仮ID-BASE-04

- 原要求ID・原文位置・revision：`仮ID-BASE-04`、`docs/concept/helix-concept.md:99`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：\| 接続契約と版 \| 機構どうし、外部とのやりとりに、能力名、契約版、対象範囲、相関ID、期限、冪等キー、結果状態を持たせる。未対応の版を黙って読み替えない \| 機構の追加と交換、1.xのConnector、2.0の外部データ \|
- 提案：Conceptの1.0土台の未被覆条件を、仮IDの追加要求候補としてL2／L11へ起草する。 候補機構 `HELIX-CONNECT`、製品属性 `共通部品（HELIX-CONNECT）`、`version_target: 1.0土台`。
- 理由：既存行に部分候補があるがConceptの全条件と直接L11の被覆は未証明。
- 選択肢と影響：A 追加を合意→1.0の土台として受入を起草。B 既存の完全被覆を示す→仮IDを不要化。C 保留→未被覆疑義を維持。
- 推奨：C 保留し、既存要求の全条件被覆を先に照合。

### 仮ID-BASE-05

- 原要求ID・原文位置・revision：`仮ID-BASE-05`、`docs/concept/helix-concept.md:100`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：\| 隔離の単位 \| project、tenant、環境を、すべての記録、権限、データ、資源に最初から付ける \| 1.xのWeb提供、複数製品の並行開発 \|
- 提案：Conceptの1.0土台の未被覆条件を、仮IDの追加要求候補としてL2／L11へ起草する。 候補機構 `HELIX-Security`、製品属性 `非製品（HELIX-Security）`、`version_target: 1.0土台`。
- 理由：既存行に部分候補があるがConceptの全条件と直接L11の被覆は未証明。
- 選択肢と影響：A 追加を合意→1.0の土台として受入を起草。B 既存の完全被覆を示す→仮IDを不要化。C 保留→未被覆疑義を維持。
- 推奨：C 保留し、既存要求の全条件被覆を先に照合。

### 仮ID-BASE-06

- 原要求ID・原文位置・revision：`仮ID-BASE-06`、`docs/concept/helix-concept.md:101`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：\| 構成版の固定と切戻し \| 実行中のjobが使っている能力、モデル、構成の版を固定して記録し、候補版の段階適用と切戻しをできるようにする \| HELIXの自己更新、3.0以降のモデル差し替え \|
- 提案：Conceptの1.0土台の未被覆条件を、仮IDの追加要求候補としてL2／L11へ起草する。 候補機構 `HELIX-OS`、製品属性 `非製品（HELIX-OS）`、`version_target: 1.0土台`。
- 理由：既存行に部分候補があるがConceptの全条件と直接L11の被覆は未証明。
- 選択肢と影響：A 追加を合意→1.0の土台として受入を起草。B 既存の完全被覆を示す→仮IDを不要化。C 保留→未被覆疑義を維持。
- 推奨：C 保留し、既存要求の全条件被覆を先に照合。

### 仮ID-BASE-07

- 原要求ID・原文位置・revision：`仮ID-BASE-07`、`docs/concept/helix-concept.md:102`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：\| 後から加わる機構の受け口 \| 機構どうしの入出力を接続契約で定め、後から加わる機構が使う入出力（評価用の計測、学習用の記録など）も1.0から記録しておく \| 3.0のIntelligence \|
- 提案：Conceptの1.0土台の未被覆条件を、仮IDの追加要求候補としてL2／L11へ起草する。 候補機構 `HELIX-CONNECT`、製品属性 `共通部品（HELIX-CONNECT）`、`version_target: 1.0土台`。
- 理由：既存行に部分候補があるがConceptの全条件と直接L11の被覆は未証明。
- 選択肢と影響：A 追加を合意→1.0の土台として受入を起草。B 既存の完全被覆を示す→仮IDを不要化。C 保留→未被覆疑義を維持。
- 推奨：C 保留し、既存要求の全条件被覆を先に照合。

## AIが進める項目（担当移動・技術変更のみ）

下表の行では旧意味の採否・変更を決めない。原文、原revision、digestを対応表で保持し、単体・接続要求とL11の被覆を静的に確かめ、差分を独立reviewへ送る。旧実装技術、四対象routing、Issue状態から意味変更やretireを生成しない。

| 原ID | 原要求の位置 | 対応案 | 未確定条件 |
|---|---|---|---|
| HIL-BR-02 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-02 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:54` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-BR-10 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-10 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:62` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-BR-11 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-11 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:63` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-BR-12 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-12 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:64` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-BR-14 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-14 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:66` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-BR-15 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-15 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:67` | HELIX-OS／HELIX-CONNECT、`version_target: 1.0接続土台／2.0候補（外部データ）` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 外部product-dataの実取込を1.0完成条件に含めず、2.0のBRAIN推薦とCONNECT契約への接続を照合。 |
| HIL-BR-17 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-17 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:69` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-BR-20 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-20 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:72` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-BR-24 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-24 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:76` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-BR-29 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-29 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:81` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-BR-31 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-31 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:83` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-BR-32 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-32 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:84` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-02 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-02 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:92` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-08 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-08 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:98` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-09 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-09 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:99` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-12 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-12 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:102` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-13 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-13 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:103` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-14 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-14 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:104` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-15 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-15 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:105` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-16 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-16 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:106` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-21 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-21 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:111` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-23 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-23 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:113` | HELIX-OS／HELIX-CONNECT、`version_target: 1.0接続土台／2.0候補（外部データ）` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 外部product-dataの実取込を1.0完成条件に含めず、2.0のBRAIN推薦とCONNECT契約への接続を照合。 |
| HIL-FR-25 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-25 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:115` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-26 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-26 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:116` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-28 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-28 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:118` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-29 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-29 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:119` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-32 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-32 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:122` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-36 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-36 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:126` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-37 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-37 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:127` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-41 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-41 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:131` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-43 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-43 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:133` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-44 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-44 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:134` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-45 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-45 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:135` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-47 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-47 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:137` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-53 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-53 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:143` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-57 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-57 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:147` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-58 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-58 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:148` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-59 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-59 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:149` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-60 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-60 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:150` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-61 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-61 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:151` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-62 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-62 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:152` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-63 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-63 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:153` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-64 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-64 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:154` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-65 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-65 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:155` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-66 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-66 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:156` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-67 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-67 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:157` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-68 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-68 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:158` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-FR-69 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-69 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:159` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-01 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-01 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:181` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-04 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-04 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:184` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-05 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-05 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:185` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-12 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-12 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:192` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-13 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-13 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:193` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-16 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-16 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:196` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-17 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-17 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:197` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-18 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-18 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:198` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-22 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-22 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:202` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-27 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-27 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:207` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-31 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-31 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:211` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-34 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-34 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:214` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-35 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-35 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:215` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-36 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-36 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:216` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-37 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-37 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:217` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-38 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-38 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:218` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-39 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-39 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:219` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-NFR-40 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-40 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:220` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |
| HIL-TR-10 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-10 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:174` | HELIX-OS、`version_target: 1.0` | 既存四対象routingは候補であり、機構・HARNESS内区分・L11受入・successorの確定は未了。 |

## 判断とAI作業の境界

POがA/B/Cを選ぶ前に、原文・digest・原authorityと対象revisionの一致、接続後の意味atom全件、L11の受入を照合する。担当や技術の変更だけならAIが差分を記録して進める。原文を縮退・統合・retireする場合だけ、対象revisionと変更前後を持つ人間decisionに戻す。未特定の行は検索範囲と結果を対応表に残したまま先へ進む。
