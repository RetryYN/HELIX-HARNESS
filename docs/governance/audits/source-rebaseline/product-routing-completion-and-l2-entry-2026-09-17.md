---
title: "製品責務分類第1層の完了とL2採否入口"
status: verified
verified_at: 2026-09-17
authority_effect: none
---

# 製品責務分類第1層の完了とL2採否入口

## 完了した範囲

main `a23c4e1dbeadf6c7d1b88fb791fd2e6013e5be65`で、旧Requirement IR 153件を
HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの四製品に対して一件ずつ評価した。

- 台帳: [legacy-ir-product-routing-bootstrap.jsonl](../../legacy-ir-product-routing-bootstrap.jsonl)
- SHA-256: `c35934693b273e6cfd03e509886dc22bd1367e78ae1aa4568563a7da252c41e1`
- record／unique source ID: 153／153
- `single_product`: 87件
- `split_required`: 65件
- `cross_product_connection`: 1件
- candidate target出現: HELIX-HARNESS 86件、HELIX-OS 133件
- 未評価target、`unresolved`評価: 0件

全IDはcarry-forward台帳とrouting queueへexact set一致し、全statement semantic digestがcarry-forwardと一致した。
全153件で`authority_effect: none`、successor未割当、意味変更なしを維持した。PR #1841〜#1844は各waveで
独立review 0／0／0を経てmerge commit方式でmainへ入り、Issue #1800はmain read-after後にcloseした。

## 完了していない範囲

第1層の結果は製品責務候補であり、次を成立させない。

- 要求の採否、要否、意味変更、縮退、archive限定、retire。
- successor ID、split後の子要求、connection contract、対象別L2／L11の承認。
- 第2層topology、第3層semantic relation、第4層planning alignmentの確定。
- 要求エンジン、DB、bot、crawler、CI、runtime、L3以降の設計・実装。

## 次の入口

次は[L2 source採否順序](l2-source-adoption-sequence.md)の`L2D-S1-01 authority-vocabulary`だけを扱う。
判断対象revision、親L1、接続先L2／L11、保持する利用価値・negative case、旧owner／identity／実現手段、
未解決事項を一つのdecision packetへ固定する。後続unitを同じ判断へ混載せず、GitHub Issueや既存実装から
採否を逆生成しない。
