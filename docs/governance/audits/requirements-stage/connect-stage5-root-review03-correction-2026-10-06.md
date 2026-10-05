# CONNECT Stage5 review03補正のRoot記録

本文 `af0c0641c9b6df37a0742bbb9325d868db3e815a`、前公開 `88e0dfcfe0bbaa81368f0aa5b6b131e83b5fe0aa`。Major0/Minor3を固定親と照合し補正。正常/未見正常oracleへ再送境界・終端結果を追加し、36/37の戻し先の無関係句を除いた。data-useの依存locatorはL2-007:136、一般failureの戻し先は137。旧review02 MDの135/136記述は誤りとして本追補で訂正し、過去bytesは保持する。

6本文main prefix一致、43個別CASE一意、static validate147 fail0/stale0/residuals0。sourceのraw LF行SHAと出典comment/6本文SHAは対JSONへ固定。本文変更後の独立reviewと同revisionのOpus/Fable一致は未成立。authority effectなし。
