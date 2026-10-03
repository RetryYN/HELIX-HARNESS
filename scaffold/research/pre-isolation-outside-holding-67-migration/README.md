# outside-67 historical capture migration candidate

この候補は、3df81ad時点の13 live source holdingを固定したsnapshotと、outside-67の67 `path_revision_pair`をappend-only registerへ追加した後の14 holding read-afterを分離する移行案です。source setは要求atomではなく、各pathのpre-isolation／archive blob OID、SHA-256、bytesを保持します。`MPR-SH-OUTSIDE67-001`の`authority_effect`は`none`で、semantic disposition、product、phase、implementationは開始していません。

`docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl`は3df81adのregister bytesをそのまま固定した13-holding historical snapshotです。current registerはその32行をprefixとして33行目だけをappendし、14 live holdingsになっています。`read-after-14.json`はcurrent registerを再読し、旧13 IDを保持したまま追加IDを分離しています。旧13 inventoryを14件として再生成する処理はありません。

既存のfirst15、PHCAP-02/03、delegated-doc003、unassessed-atom、merged #1975 の SCF-B-0036 と outside-L1 validator、merged #1988 のrows 31–48とSCF-B-0043、merged #1989 のrows 49–67とSCF-B-0044、SCF-B-0027/0029/0034/0035は、historical register参照を`docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl`へ切り替えました。`phase-capability-inventory.json`はWave verifierの固定入力digestを壊さないためmain capture bytesのまま保持し、同JSONのregister参照更新は別migration recordへ分離します。正式append行はsource set `docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl` と永続coverage receipt `docs/governance/audits/source-rebaseline/pre-isolation-outside-holding-67-coverage-receipt-2026-09-22.md` を参照し、Scaffold撤去時の参照切れを防ぎます。要件整理契約と登録契約の「現在13」は現在14へ更新し、13時点の記述はsnapshotとして分離しました。

PR #1975 は merge commit `4919cfd245ee128fee71c713c8d2d0a8cd5fcd11` でmainへ取り込まれ、head `2c0f287dda2cd9252cd64255cfa4cdf695653754`を依存値として記録しています。SCF-B-0036とoutside-L1 validatorはこの候補へ取り込み、3df時点のregister／disposition snapshotを読むように固定し、現行14 register read-afterとは分離しました。PR #1978 は merge commit `f122d65e1435b4709fbb7b07fbb8e42b70f0b110` でmainへ取り込まれ、exact parent `d272a97b3e55401fa75ad41670fbeefd18f8a4cf`を保持しています。#1981はこの親を含む最新mainへ再照合する。Issue #1813 projectionは外部操作を行わず、別更新対象として残しています。

validatorのbase gateは、捕捉したmain merge `f122d65e1435b4709fbb7b07fbb8e42b70f0b110`が候補worktreeのHEADの祖先であることを確認します。live `origin/main`とのSHA一致やlocal `remotes/pr/1978`の現在指示先は判定根拠にしません。merge admission時には、その時点のmainへ統合したtreeで全Scaffold validatorとBinding staleを再確認します。#1989はmainにmerge済みであり、rows 49–67とSCF-B-0044もhistorical snapshotへ移送しました。

候補BindingはSCF-B-0040です（SCF-B-0039は別PRで使用済み）。

append recordの`registered_at`は候補worktreeで観測した`2026-09-22T03:44:30+09:00`を記録し、`registered_by`は`Codex migration candidate (authority_effect:none)`、`management_state`は`registered_source_holding`です。これはsource bytesを登録候補へ固定した記録であり、人間承認、要求採用、製品・phase・実装の確定を表しません。

## 検証

```text
python3 scaffold/pre-isolation-outside-holding-67-migration/read-after-14.py
python3 scaffold/pre-isolation-outside-holding-67-migration/generate.py
python3 scaffold/pre-isolation-outside-holding-67-migration/validate.py
python3 scaffold/pre-isolation-outside-holding-67-migration/selfcheck.py
```

旧archiveのruntime、test、CI、hook、adapterは実行していません。この候補のreview合格だけからmerge、Issue更新、要求採否を生成しません。
