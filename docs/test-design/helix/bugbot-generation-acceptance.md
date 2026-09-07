---
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
title: "HELIX-bugbot 定型生成の総合テスト設計"
layer: L10
kind: redesign
status: draft
authority_status: canonical_source
approval_record_id: L3-PO-1639-001
approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1639#issuecomment-5575191362"
approved_revision: "1.0"
approved_candidate_head: a2325edb8425f4e84421ef2fd1f07c6c6d668dd7
approved_raw_digest: "sha256:f0665116a0f25a7170bb78b203e9ff7f2e241cd7bd0530072aae53ff06fe7db8"
version: "1.0"
owner_issue: 1639
plan: PLAN-L3-1639-bugbot-generation
parent_design: docs/design/helix/L3-requirements/bugbot-generation-requirements.md
pair_artifact: docs/design/helix/L3-requirements/bugbot-generation-requirements.md
---

# 定型生成の総合テスト設計

本書は承認済みBBG-AC01..06のcanonical sourceであり、
[L3要件](../../design/helix/L3-requirements/bugbot-generation-requirements.md)とL3↔L10を構成する。
来歴と残義務は[既存PLAN](../../plans/PLAN-L3-1639-bugbot-generation.md)へ束縛する。
新配置の独立技術review前は文書・PLANともdraftを維持する。Requirement IR admission・実装・検収は未完了。
以下は原稿本文から導出した受入条件であり、未提供の別紙03の18シナリオではない。
実行証拠は未採取。生成器自身のテストだけで合格させず、独立oracle・mutation・実consumerを用いる。

| ID | 対応要件 | 合格条件 |
|---|---|---|
| BBG-AC01 | BBG-R01 | 意味入力・導出・実測引用を区分し、導出/実測欄の自由入力確定を拒否。未対応の業務設計は意味入力として保持する |
| BBG-AC02 | BBG-R02 | 同一source/入力/生成器版の意味出力が一致。時刻を分離し、欠落・矛盾・未知を安定コードで拒否。外部文字列は実行しない |
| BBG-AC03 | BBG-R03 | 承認・verdict・model・CI・費用・署名の偽引用を各々拒否。実diff外と許可scope外を分離し、scope拡張で通過させない |
| BBG-AC04 | BBG-R03 | 信頼済み実行器が観測したexit 0・空stdoutを受理し、receipt欠落・bytes digest不一致・手書き成功主張を拒否 |
| BBG-AC05 | BBG-R04 | source変更の影響先だけ再生成。混在文書の意味入力を保全し、無審査の意味digest変更を拒否。後継consumer検証・rollback成立前に旧入口を退役させない |
| BBG-AC06 | BBG-R01, BBG-R02, BBG-R03, BBG-R04 | 一系統を実consumerで作成から再検証まで通す。対象版・入力・HEADを固定し、手修正、LLM呼出し/tokens、時間、CI再走、手戻り、誤修復、未解消数を比較する |

AC06の効果閾値・標本数・対象consumerは実測前に既存NFRへ接続して固定する。
未設定・比較条件不一致・少標本で高速化を主張しない。残義務を削って改善扱いにしない。
独立review、CI、main read-afterが必要で、canonical source配置は受入完了ではない。
