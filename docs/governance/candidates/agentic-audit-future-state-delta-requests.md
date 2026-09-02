---
document_id: HELIX-AGENTIC-AUDIT-FUTURE-DELTA-L1-CANDIDATE
version: 0.1.0
status: draft_candidate
canonical_layer: L1
plan: PLAN-L3-81-agentic-audit-future-state-delta
github_issue_id: 1409
---

# Agentic Audit / Future State Delta 利用者要求候補

## 背景

HELIXは内部変化をUIL、外部技術変化をTER、未来比較をFuture Synthesisで扱う。しかし、AI監査の自由文を
再現可能な観測候補へ変換する入口と、UIL／TERで確定した現在状態の変化をFuture Synthesisへ渡す共通契約がない。
この欠落を放置すると、AIの修正案がauthorityを先取りするか、観測済み変化がfuture projectionへ反映されない。

## 利用者要求

### AAFD-BR-01 監査提案の安全な取込

利用者は、Fable、Claude、Codex、Cursor等の監査結果を、自由文の権威化ではなく、exact HEAD、authority、producer、
evidence、再現手順、反証可能性へ束縛したproposalとしてUILへ投入できなければならない。

### AAFD-BR-02 内外変化の所有権維持

利用者は、内部変化をUIL、外部provider／toolchain／platform変化をTERで確定し、両者を同じoriginへ潰さずに
Future Synthesisへ接続できなければならない。

### AAFD-BR-03 Future projectionの追従

利用者は、確定した変化により影響を受けるfuture projection、assumption、directiveを決定的にstale化し、必要範囲だけ
再合成できなければならない。stale directiveからassignment、release、retireを実行してはならない。

### AAFD-BR-04 モデル更新の比較可能性

利用者は、監査モデルの更新時に同じcorpusと責務scopeを再監査し、findingの追加・消失・誤検知・見逃し・再現成功・
cost・latencyを比較し、過去qualificationを自動継承しない形で再検証できなければならない。

## 境界

- 新しいworkflow route、development style、DB authority、resident laneを作らない。
- UIL、TER、Future Synthesis、System Synthesis、Learning Systemを再実装しない。
- AI監査、delta、future directiveはRequirement、Design、Release、Assignment、merge authorityを直接変更しない。
- 本文はcandidateであり、plan固有L3承認前はcurrent authorityではない。
