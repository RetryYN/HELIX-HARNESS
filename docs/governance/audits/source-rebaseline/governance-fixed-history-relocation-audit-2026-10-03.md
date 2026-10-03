# Governance固定履歴の配置変更監査（2026-10-03）

status: `recorded`
authority_effect: `none`
base_revision: `4ef29ee37ee271d224b4f3e6c520b996075c66e3`

## 実施範囲

`docs/governance/`直下の時点記録・snapshot 7件を、既存の`audits/source-rebaseline/`と`audits/requirements-stage/`の分類へ移した。archive-first記録とCodeQL projection backup、PR #1797 readiness記録、workbase consolidation記録はsource-rebaselineへ置き、CodeQL backupは既存の`github-projection-backups/`に置いた。3df81ad pre-append registerと対応する2つの文書snapshotは、`requirements-stage/history-snapshots/`にまとめた。

7件すべての旧path、新path、移動前後SHA-256、byte同一判定は、隣接する[JSON監査台帳](governance-fixed-history-relocation-audit-2026-10-03.json)に固定した。JSONL register snapshotとCodeQL JSON backupは同一bytesのまま移動した。Markdown 5件は、相対リンク先のtokenだけを新しい位置から同じtargetへ届くように変更した。対象リンクのcaptionと本文は保持し、移動元revisionと現在の文面で非link bytesが一致することを検証した。新しいaudit台帳・この記録・Bindingのupstream path/SHA追随も追加差分である。

## 現行参照と履歴locator

base時点で7旧pathへの完全一致参照は87箇所だった。呼出元ファイル・行・該当行excerpt・用途分類・処置をJSON台帳の各行に記録した。分類は現行binding upstream 13件、Python reader 21件、過去のregister/receipt/inventory/decision/binding proseに残すhistorical locator 53件である。current binding upstreamは移動先へ更新し、snapshot等を読むPython readerは既存`RELOCATED_PATHS`方式で物理読込先だけを追随させた。readerが記録・出力する3df81ad path locatorは当時の値を保った。過去のappend-only register、JSON snapshot、receipt本文のpath locatorは書き換えていない。

current binding upstreamに限って移動path/SHAを更新し、リンクtoken変更やreader source変更の影響を受けたcurrent upstream SHAを再計算した。bindingのrole、obligations、connections、state、replacement、権限、過去note/receiptは変えていない。調整後は143 bindingのvalidateが通り、`stale=0`、`residuals=0`となった。

## governance直下と既存分類

`docs/governance/`直下は34ファイルから27ファイルになった。残る27件は、現行rules/models/contracts 16件、append-only current registers 4件、current inventory/status 7件である。完全なfilename一覧と分類はJSONに記録した。10の既存folder（audits、candidates、crosswalks、decisions、feature-tickets、intake、legacy-migration、requirements-source、sources、tools）はすべて保持し、役割も変えていない。既存auditは工程・workstream別の分類を保ち、今回必要な`history-snapshots/`だけrequirements-stage内へ足した。

比較用に依頼で示されたbaselineは137 bindings（active 82、registered 55）。4ef29ee時点のread-only inventoryは143 bindings（active 28、registered 115）で、差は合計+6、active -54、registered +60だった。この移動からbindingの採否・状態・authorityを生成せず、全143件のformal artifact countは0、replacement statusはpendingのままである。

## 旧HELIXとの対応と配置境界

旧`repository-structure.md`（`LEGACY-ASSET-FDBA655B1CFF75DCDC0E`、SHA-256 `6f8ee784049d03279641151714c3572656eb20c64cfb769853b6e885abf4f262`、旧pathの58、74、99–100、117、148–150行）を起点に、現行正本と時点記録を区別する保持点を確認した。旧L3要件source HIL-FR-53の所在は`infinity-loop-functional-requirements.md`（`LEGACY-ASSET-C7F0C3B79CBAA72960BF`、SHA-256 `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`、HIL-FR-53を含む行53）で確認したが、このPRはL3本文やL3/L10位置を決めない。RG14-009（`legacy-rule-atom-inventory.jsonl:7034`、authority effect none）は、L3/L10 directoryを最初のL3文書より前に作らない制約として過剰適用せず、ゴールどおり最初のL3本文と同時に作れるものとして扱う。

2026-09-26のPO判断により`helix-web/`はrepository rootに置かれている。この配置は変更していない。

## 静的確認

変更済みMarkdownと移動文書のローカルリンク294件を解決し、broken=0を確認した。baseの同一source setにはdisposition snapshot 61行目の既存broken link 1箇所（`legacy-ir-rehome-wave-register.md`）があり、既存の`legacy-migration/ir/legacy-ir-rehome-wave-register.jsonl`へlink tokenだけを直した。新規broken linkは0件。現行`scfctl validate`は143件すべて合格し、`stale=0`、`residuals=0`だった。変更した18のcurrent scaffold reader moduleはPython構文compileを通した。旧runtime/test/CIを実行していない。

本記録と移動は要求意味、要求承認、実装許可、Scaffold replacement/retirementを生成しない。
