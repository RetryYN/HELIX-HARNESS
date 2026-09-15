# 旧資産の個別判断ログ契約

status: active_append_only_log
data_path: `docs/governance/legacy-asset-decisions.jsonl`
join_key: `asset_id + asset_revision_after`
copy_read_after_path: `docs/governance/legacy-asset-copy-read-after.jsonl`

## 目的

[資産明細台帳](legacy-asset-disposition.jsonl)の個別採否を、行の上書きだけで失わないためのappend-only記録を定める。
現在の判断ログは58件である。要求source snapshot 29件のrevision 2判断行と、それを取り消して配置判断をpendingへ戻したrevision 3訂正行29件をappend-onlyで保持する。残る3,991資産は`unresolved`である。

## 1行の必須項目

以下は現行schemaで追記する判断行の契約である。append-only修復より前の29行は当時のschemaをそのまま保存するため、後から追加された`decision_status`と`proposal_basis_refs`を持たない。現行状態は各旧行を`supersedes_decision_id`で指すrevision 3訂正行から読む。

| 項目 | 内容 |
|---|---|
| `decision_id` | 一意な判断ID |
| `asset_id` | 資産明細台帳のID |
| `asset_revision_before`／`asset_revision_after` | 単調増加する行revision |
| `decision_revision` | `decided`時は人間判断または承認済み上流のfull exact revision。`pending_human_confirmation`ではnull |
| `asset_class_before`／`asset_class_after` | 内容監査前後の資産class |
| `reuse_exclusion_class_before`／`reuse_exclusion_class_after` | 一次分類と内容監査後の停止class。nullも明示する |
| `disposition` | 統制で定めた8値のいずれか |
| `product_target`／`upstream_ids`／`pair_ids` | 製品ownerと上流接続 |
| `consumer_refs` | 現在および移行後consumer |
| `rights_status`／`executability_status`／`secret_status`／`external_effect_status` | 個別確認結果 |
| `target_path`／`target_sha256` | `verbatim_reuse`または`source_snapshot_preservation`時のcopy先。その他はnull |
| `meaning_interface_invariance_reason` | `verbatim_reuse`時の不変根拠、または`source_snapshot_preservation`が非authorityである根拠。その他はnull可 |
| `decision_status` | `decided`または`pending_human_confirmation`。pendingは配置・採否を確定しない |
| `proposal_basis_refs` | pending proposalの根拠となるfull exact revision＋path＋line。`decided`では空配列可 |
| `decided_by`／`decided_at` | actorと時点。pendingではnull |
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

意味採否・配置の個別判断を開始するのはConceptと対象別L1が承認され、該当source atomを対象別L2へ採否できる段階からである。要求欠落防止の`source_snapshot_preservation`はそれ以前に物理copyとread-afterを行えるが、`decision_status: pending_human_confirmation`、nullの判断actor／revision、proposal根拠を記録し、配置・採否・authorityを生成しない。

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
