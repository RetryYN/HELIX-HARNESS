---
title: "workflow output consumer inventory関数設計"
status: draft
layer: L6
plan: PLAN-L7-692-workflow-output-consumer-inventory
pair_artifact: docs/test-design/harness/L8-workflow-output-consumer-inventory.md
behavior_contract_id: WORKFLOW-OUTPUT-CONSUMER-INVENTORY-001
responsibility_owner: workflow-output-consumer-inventory
---

# workflow output consumer inventory関数設計

## 入力

`config/workflow-output-consumer-inventory.json`の各entryと、entryが指すcurrent source fileを入力する。
identityは`path + field_token`で一意とし、tokenはidentifier境界で数える。substring件数を混在させない。

## 判定

1. schema、authority、measured HEAD、Issue、token exact setを検査する。
2. entry keyの重複を拒否する。
3. 各sourceのidentifier境界出現数を`expected_occurrences`とexact照合する。
4. disposition、responsibility owner、producer、consumer、successor Issueの欠落を拒否する。
5. `surface_paths × tokens`の全行列を走査し、実出現がある組をentryが漏れなく所有し、実出現0の組に
   stale entryが無いことを検査する。
6. producer symbolが対象sourceに実在しない場合は、責務帰属を推測せず拒否する。

## disposition

- `workflow_primary_identity_migrate`: current workflow identity出力をtyped identityへ移行する。
- `domain_model_keep`: provider／domain固有modelでありworkflow identityと別責務に維持する。
- `compatibility_input_only`: legacy入力と変換provenanceだけに限定する。
- `historical_keep`: current completion入力から除外した履歴として保持する。
- `superseded_remove`: consumer 0証拠後に削除する。

unknownや複数dispositionへの推測は許可しない。初期6 surfaceの対象fieldはdrive/current-location/closure/
skill-binding read model上で旧workflow identityを返すため、後続ownerを分けてもdispositionは
`workflow_primary_identity_migrate`とする。provider実行modelのfieldはこの集合へ混ぜない。
