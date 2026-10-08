# 開発repository向けlocal CI

status: scaffold
authority_effect: none
binding: SCF-B-0158

HELIX-OSのlocal CI設計L4〜L7に基づく仮設driver。#2716判断2の範囲で構築する。固定5検査をlocalで回し、Actionsでは選択済みDIFFだけを照合する。旧archiveは読み取りデータに限り、実行しない。

現在は実装中であり、CI実行・合格・正式OS unitへの移管を表さない。外部receiptから要求承認、受入、merge許可、完了を生成しない。
