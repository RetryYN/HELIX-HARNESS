---
title: "指示経路の変更耐性と更新・縮退追従"
status: draft_candidate
authority_status: awaiting_human_approval
version: "1.0"
candidate_layer: L3
owner_issue: 1608
plan_id: PLAN-L3-1608-instruction-path-change-resilience
---

# 指示経路の変更耐性と更新・縮退追従の要件候補

## IPC-R01 責務分離

Requirement/Policy、Workflow、Skill、provider adapter、runtime consumerを別責務として扱う。
同じ搬送経路を使っても意味正本・適用判断・実行方法を混同せず、第二のPolicy正本を作らない。

## IPC-R02 導出とprovenance

source→generator→output→consumerをobligation ID、適用条件、source/generator/output digest、HEAD、
provider/runtime/model/adapter/version/call formへ束縛する。生成物だけから未確認の正本を逆生成しない。

## IPC-R03 影響解析

変更時に影響する出力・consumer・実行単位を決定論的に導出する。影響不明は`unknown`とし、
検証範囲拡大または対象適用保留へ送り、無関係な全体停止や根拠のない安全主張をしない。

## IPC-R04 実行単位version pin

実行単位が使用する契約版を固定する。互換更新は安全境界で切替え、意味変更はcheckpointから再計画し、
権限取消は次の副作用前に強制する。切替でassignment、lease/fence、budget、deadlineを暗黙初期化しない。

## IPC-R05 原子的更新・rollback

新旧contract、Guard、diagnostic、Helpの部分混在を拒否する。更新中断とrollbackを明示状態として扱い、
取消済み権限やretired outputをrollbackでcurrent consumerへ復活させない。

## IPC-R06 有効化状態の分離

`generated`、`distributed`、`loaded`、`behavior_verified`、`operationally_applied`を別状態で観測する。
file存在や生成成功をruntime読込・挙動反映の証拠へ昇格させない。

## IPC-R07 再読込不能経路

再読込不能なprovider/runtimeでは、安全なsession transitionとcoordination-only continuationを使う。
旧指示、撤回claim、secret、private reasoningを持ち越さず、継続に必要な外部正本を再取得する。

## IPC-R08 Provider差と縮退

provider/runtime/model/adapter/version/call formを分離し、実測attestationに基づき適用する。
unsupportedまたは観測不能を保護済みに見せず、fail-closeまたは明示DEGRADEDへ送る。
Skill機構とRule導出機構は別要求・別受入・別完了状態のまま接続する。

## IPC-R09 安定入口と動的正本参照

AGENTS／CLAUDE／agent／commandの固定指示は、正規入口、契約取得先、診断取得先への参照へ縮小する。
worker contextは有効なRequirement IR、Policy、Workflow、Skill、適用版から必要範囲だけを構成し、
固定文書集合、未登録command、provider固有の古い意味をcurrent authorityとして注入しない。
`worker-context-packet`、adapter、role judgment、task lensは既存ownerを参照し、別の意味正本を持たない。

## IPC-R10 効果測定と採否境界

変更前後を同一task・consumer・evidence条件で比較し、手修正箇所数、有効化までの時間、総token、再実行、
誤拒否、旧版再出現を測定する。閾値は既存NFRへ接続し、未定義ならcanonical昇格前に採否基準を定義する。
少標本、観測不能、比較条件不一致では改善を主張せず、保留または追加測定へ送る。

## 導入順

#1376の契約生成、#1375のconsumer適用を軸に、#1373/#1374/#1377を対象単位で接続し、
#1378 consumer E2Eへ収束させる。最初は一つの指示経路で正本変更、必要出力更新、読込観測、動作確認、
旧出力非再生成を実証し、全Censusや全Skill移行を先行条件にしない。候補承認とcanonical昇格、
#397 IR admission、runtime実装を別状態で追う。
