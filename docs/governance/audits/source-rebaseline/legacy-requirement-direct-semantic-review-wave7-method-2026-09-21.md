---
title: "旧要求・旧asset直接semantic review wave 7方法"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 7方法

## 対象

wave 7はHELIX-OSの`HIL-BR-20`、`HIL-FR-29`、`HIL-NFR-16`を各3 edge、合計9 edgeで直接照合する。
3 unitは同じCI quarantine能力に接続するため、要求identityを保持したまま業務条件、機能、制約の違いをatomへ分ける。
重複する能力から採否、successor、実装成立を生成しない。

schema 9はschema 8のbounded global search、atom被覆、phase候補のexact転記、同一token anchor規則、別atom間の
source fragment包含拒否を維持する。要求source snapshotだけを契約保存として`confirmed`にし、designは`unresolved`、
語が近いだけのsourceは`rejected`にする。旧実装、consumer closure、現行replacementは確定しない。

## edge判定

- BR-20のdesignは証拠保持付きquarantine、対象外・新fingerprint・minimum gate failureのfail-closeを持つ。
- FR-29のdesignはcheck ID、exact failure fingerprint、baseline SHA/tree、理由、Issue、owner、期限、iteration、minimum gate、
  stale化とreceiptを持つ。
- NFR-16のdesignはexact scope、wildcard・directory・全check指定の禁止、期限・対象・fingerprint変化による失効を持つ。
- source候補の`DeferredQuarantine`はowner、expiry、replacement oracleだけを検査する。deferred obligation recoveryの隔離であり、
  3要求が定めるCI failure rule/applicationを実装しないため、共有語を直接linkへ数えない。

FR-29とNFR-16のfingerprint変化は同じ能力へ接続するが、前者はmanagerの通常failure遷移、後者は適用鮮度制約である。
BR-20のminimum gate atomは分解台帳どおりHARNESS側unitとの共有spanとして記録する。

## 探索と停止条件

4,020件のasset catalog全件についてarchive file bytesを読み、要求IDとquarantine固有語のいずれかを含むassetを候補集合へ
固定する。BR-20は116件、FR-29は17件、NFR-16は120件で、各3件以外は未reviewのまま集合digestへ残す。
検索membershipはsemantic link、phase採否、製品owner、実装成立を生成しない。

現行crosswalkと分解台帳の正規unitにはHELIX-Web／Web-OSがない。本waveからWeb系unitを新造しない。archive内runtime、
test、hook、CI、adapterは実行せず、要求採否、phase採否、再利用、置換、new build許可を生成しない。wave 1〜6の
ledgerとmetadataを入力digestで固定する。
