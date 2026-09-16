# 5大目標・七大原則 PO原文source atom inventory

確認日: 2026-09-17
status: source_holding_inventory
authority_effect: none

## 目的

POが提示した5大目標と七大原則の原文12件を、個別要求へ分解する前の入力集合として管理層へ仮登録する。
このinventoryは要求候補、要求ID、採否、対象製品、successor、実装許可を生成しない。原文をIssueや会話だけへ
残さず、後続の要求整理が同じ入力集合とdigestを参照できる状態にする。

## 入力集合

機械台帳は[PO原文source atom](l1-goals-principles-source-atoms.jsonl)である。次の12行だけをsource atomとする。

| source group | atom数 | source | source role |
|---|---:|---|---|
| HELIX自体の5大目標 | 5 | [5大目標候補のPO提示原文](../concept/helix-five-goals.md#po提示原文) | `planning_value_source` |
| HELIXエージェントの七大原則 | 7 | [七大原則候補のPO提示原文](../concept/helix-principles.md#po提示原文) | `agent_behavior_policy_source` |

各atomは原文、原文SHA-256、source path、anchorへ束縛する。候補文書で追加された説明、責務表、適用方法、判断例は
PO原文を解釈した候補本文であり、この12件の原文集合へ混ぜない。タイトル行も個別の価値または行動規律ではないため
atom数へ加算しない。

## 現在の被覆と未決事項

[対象別L1被覆監査](audits/source-rebaseline/l1-goals-principles-coverage-audit.md)では、目標2を`covered`、目標1・3・4・5を
`partial`と判定した。この判定は既存L1候補との意味接続を調べた結果であり、目標2を採択済み要求へ変えず、`partial`四領域を
新要求へ自動変換しない。5目標すべてをsource atomとして保持し、要求identityごとの後続PRで入力、保持先、重複、責務、
対象製品を照合する。

七大原則はエージェントの行動規律であり、原則名をそのまま製品L1要求へ追加しない。後続で工程契約、管理統制、検証条件などへ
具体化する場合も、原則原文と具体的要求を別identityとして因果relationで接続する。

## 無損失境界

- 12 atomはすべて`source_preserved_unassigned`として保持する。
- `covered`、`partial`、`not_applicable_as_l1_value`は採否状態ではない。
- 今回は`requirement_candidate` record、要求本文、L1／L2／L11、Feature Ticket、Issueを追加・変更しない。
- 後続の要求候補は、使用するatom IDを明記し、使用しないatomの生存先を本source holdingへ参照する。
- 意味の統合、縮退、棄却、責務移動は、このinventoryの変更ではなく対象atomと候補revisionを束縛した別判断で扱う。

## read-after条件

次をすべて満たした場合だけ、このsource holdingの登録整合を主張できる。

1. JSONLが12行・12一意IDである。
2. 各`source_text`がsource pathの`PO提示原文`に完全一致する。
3. 各`source_text_sha256`がUTF-8原文のSHA-256と一致する。
4. 管理層registerの`source_atom_set_digest`とJSONL全体のSHA-256が一致する。
5. 管理層registerが`registered_source_holding / authority_effect: none`であり、要求identityを持たない。
