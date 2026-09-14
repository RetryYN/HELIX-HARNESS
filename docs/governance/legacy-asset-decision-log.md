# 旧資産の個別判断ログ契約

status: empty_append_only_log
data_path: `docs/governance/legacy-asset-decisions.jsonl`
join_key: `asset_id + asset_revision_after`
copy_read_after_path: `docs/governance/legacy-asset-copy-read-after.jsonl`

## 目的

[資産明細台帳](legacy-asset-disposition.jsonl)の個別採否を、行の上書きだけで失わないためのappend-only記録を定める。
現在の判断ログは0件であり、全4,020資産の`unresolved`状態を変更しない。

## 1行の必須項目

| 項目 | 内容 |
|---|---|
| `decision_id` | 一意な判断ID |
| `asset_id` | 資産明細台帳のID |
| `asset_revision_before`／`asset_revision_after` | 単調増加する行revision |
| `decision_revision` | 人間判断または承認済み上流のexact revision |
| `asset_class_before`／`asset_class_after` | 内容監査前後の資産class |
| `reuse_exclusion_class_before`／`reuse_exclusion_class_after` | 一次分類と内容監査後の停止class。nullも明示する |
| `disposition` | 統制で定めた8値のいずれか |
| `product_target`／`upstream_ids`／`pair_ids` | 製品ownerと上流接続 |
| `consumer_refs` | 現在および移行後consumer |
| `rights_status`／`executability_status`／`secret_status`／`external_effect_status` | 個別確認結果 |
| `target_path`／`target_sha256` | `verbatim_reuse`時のcopy先。その他はnull |
| `meaning_interface_invariance_reason` | `verbatim_reuse`時の不変根拠。その他はnull可 |
| `decided_by`／`decided_at` | actorと時点 |
| `rationale`／`evidence_refs` | 採否根拠と反証可能な参照 |
| `supersedes_decision_id` | 訂正対象。初回はnull |

## 更新規則

1. 既存ログ行を変更・削除せず、訂正も新しい`decision_id`で追記する。
2. 同じ`asset_id`の`asset_revision_after`は直前revisionより1だけ増やす。
3. 明細台帳の更新と判断ログ追記を同一commitへ含め、台帳の`decision_record_ref`を
   `docs/governance/legacy-asset-decisions.jsonl#<decision_id>`へ設定する。
4. `reuse_exclusion_class`が非nullなら`verbatim_reuse`を拒否する。nullでも内容監査と全確認項目が閉じるまで拒否する。要求保全専用の`source_snapshot_preservation`は非実行・read-only・非authorityであることを記録し、再利用許可へ読み替えない。
5. `verbatim_reuse`ではcopy後にtarget digestとconsumerをread-afterし、下記copy・read-afterログを台帳へ接続する。
6. GitHub Issue／PR／CI／review状態だけから判断行を生成しない。

個別判断を開始するのはConceptと対象別L1が承認され、該当source atomを対象別L2へ採否できる段階からである。

## copy・read-afterログ

`legacy-asset-copy-read-after.jsonl`もappend-onlyとし、既存行を変更・削除しない。1行は次を必須とする。

| 項目 | 内容 |
|---|---|
| `read_after_id`／`decision_id`／`asset_id`／`asset_revision` | 判断と台帳revisionへのjoin |
| `source_path`／`source_sha256`／`target_path`／`target_sha256` | copy前後の実体 |
| `copy_performed_by`／`copy_performed_at` | copy実施者と時点 |
| `checked_by`／`checked_at` | read-after実施者と時点 |
| `consumer_refs_observed` | read-afterで確認したconsumer |
| `digest_match`／`consumer_match`／`result`／`failure` | 観測結果。失敗を欠落させない |
| `evidence_refs` | command output、commit/tree、その他の反証可能な証拠 |

台帳の`read_after_record_ref`は`docs/governance/legacy-asset-copy-read-after.jsonl#<read_after_id>`へ設定する。
要求source snapshot 29件のcopy・read-afterを記録済みである。その他のcopy実績を生成しない。
