# FT-GOV-PRE-REQUIREMENTS-RULES-001

作業種別: 要件定義前の文書・配置・開発規律の既存照合と整備

作業内容: 要件定義を一つの要求例から進められるよう、既存の文書規則と旧HELIX資産を照合し、文書の正本と生成表示・判断記録・監査証拠・仮組みの区別、機構別の配置、要求と対検証のID・参照・revision対応、命名・更新・履歴の扱い、templateの意味契約と不足の戻し先を既存の正本へ集約する。重複本文を参照へ寄せ、旧source・保持点・変更点・理由・consumer・未確定事項を記録する。規則本文をAGENTS.md／CLAUDE.mdやticketへ複製しない。

作業内容: 開発repoの運用規則と、製品としてHARNESSが提供する規律を区別して照合する。既存再利用、責務・依存方向、命名・型・エラー処理、test/oracle凍結と実装前Redの既決条件について、現在利用する規則と設計後に具体化する内容を分ける。コードの配置、Python／TypeScript等の境界、lint・formatter・型検査・test設定は対象の設計から導出し、要件定義前の文書整備だけで確定・起動しない。

作業内容: 要件定義前に必要な文書の整備範囲と、設計・実装前に確定する設定の範囲を既存ロードマップへ記録する。一つの要求例で正本・対応する検証・参照元・対象revision・責務を辿れること、複製や切れた参照、既決判断との不整合がないことを静的確認と独立reviewで確かめる。関連作業の全件完了を一律の開始条件にせず、実際に参照する規則・templateの未確定部分を明示する。

正本の案内: [現行作業入口](../new-generation-start-here.md)、[GitHub上流運用モデル](../github-upstream-operating-model.md)、[要件定義の最初に扱うロードマップ](../requirements-first-roadmap.md)、[Concept](../../concept/helix-concept.md)、対象別L2／L11とその判断記録を読む。関連作業はロードマップIssue #2846、全資産の要否・再配置 #1813、規律の重複照合 #1814、AIレーン設定 #1864。Issueとticketは作業projectionであり、規則・要求の正本ではない。

旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/repository-structure.md:102–173`（LEGACY-ASSET-FDBA655B1CFF75DCDC0E）、`archive/legacy-generation-2026-09-14/root/docs/governance/coding-rules.md:10–31`（LEGACY-ASSET-4B835ADBEFBCCC13C1C0）、同root内の`docs/plans/PLAN-L6-23-coding-rules-workflow.md:35–75`、`src/lint/coding-rules.ts:208–240`。旧の正本・生成物の区別、設計／実装／検証設計／testの区別、実装前の規律照合、設定の最小化を起点とする。旧runtime・path・言語別設定はそのまま移さず、現行の機構分担と対象設計に照らして再導出する。旧workflow・CLI・hook・test・CIは実行しない。

作業範囲: 文書・規律の既存照合、配置と参照の整理、既決条件の集約、ロードマップへの対応付け。新規規則や意味差分が必要なら既存要求への対応と根拠を明示し、人が持つ上流の意味変更は別の判断へ戻す。新しい承認手続き、要求の採否・版指定、正式L3再開、製品の実装・CI起動・内部デプロイ・release許可を本作業から生成しない。

発行根拠: 2026-10-11（Asia/Tokyo）のユーザー指示「イシューにしてあとは要件定義前にドキュメント類の規則とかを整備したほうがよくない？」。直前の「ディレクトリ構成の最適化やドキュメント、コーディングルール系を設定するのは？」を対象範囲として保持する。
