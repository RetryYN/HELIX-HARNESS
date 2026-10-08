# 開発repository向け新世代CI

旧workflowは`archive/legacy-generation-2026-09-14/root/.github/workflows/`へ非実行archiveとして移した。
旧workflowは実行しない。

#2716判断2とHELIX-OSのlocal CI設計L4〜L7に基づき、`local-ci-merge-unit.yml`を配置する。
固定5検査はlocalで実行し、このworkflowは手動dispatchで渡されたexact base／HEADとreceiptを照合して、
選択済みの`LC-DIFF-001`だけを実行する。検証コードはdefault branchから読む。
作業用実装は`SCF-B-0158`に登録し、実行結果は要求承認・受入・merge許可へ変換しない。

旧HELIXのlocal-firstとmerge-unitの保持点・変更理由、旧sourceの参照箇所は
`docs/helix-os/L4-basic-design/local-ci.md`と`scaffold/bindings/SCF-B-0158.json`に記録する。
workflowの配置自体は、実行・合格や正式OS unitへの移管を表さない。
