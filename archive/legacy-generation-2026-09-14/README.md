# 旧世代の非実行archive

このdirectoryは2026-09-14以前のHELIX実行面を、判断史とreference sourceとして保持する。

`root/`には旧世代のGitHub設定、AI instruction、hook、adapter、runtime state、config、source、test、script、
package metadataを元の相対構造を保って格納する。内容はcurrent authority、startup input、runtime、CI、test oracle、
distribution、rollback、復元経路ではない。

隔離時のGit追跡ファイルは4020件である。snapshot sourceはcommit
`2d4991042be55268bac30a8bbcdac45b3865030a`で、[MANIFEST.sha256](MANIFEST.sha256)が`root/`からの相対pathと
SHA-256を固定する。Git非追跡だったlocal DB、log、cache、credential候補は本archiveへ収載していない。

上流監査基準commit `6fabd12512a3659fff4a956692cdd61faeeb16ce`からsnapshot sourceまでに変更された333 pathは、
[revision差分保全監査](../../docs/governance/audits/source-rebaseline/pre-isolation-revision-delta-audit-2026-09-16.md)で
両revisionを別sourceとして保持する。隔離時snapshotだけで監査基準revisionを同値・置換済みと扱わない。

禁止事項:

- archive内workflow、CLI、hook、script、test、package commandを実行しない。
- current pathへcopy、symlink、生成、fallbackしない。
- 旧testのgreen、旧schema適合、旧byte parityを新世代の受入条件にしない。
- 旧AI instructionを新世代sessionへ注入しない。

採取する場合は、出典path、digest、semantic atom、対象製品、採否、移管先、非採用理由を記録し、承認済み上流から
新しい契約・設計・oracle・実装へ再導出する。
