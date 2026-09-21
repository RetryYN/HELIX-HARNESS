# Wave21 旧要求 semantic review status（2026-09-21）

origin/main `053943791ceda83366fca01d375308ba5f7deb28` へ独立worktreeをfast-forwardしてbaselineを更新しました。BR28-HARNESS、BR29-HARNESS／OS、BR30-HARNESS／OSの5 unit、15 edge（要求5、design5、implementation_source5）を保持し、confirmed 5、unresolved 10、rejected 0、累積67/218 units・198 edges・残り151 unitsと記録しました。

要求IR/raw接地、catalog candidate role、crosswalk phase pool、bounded search、Wave1–20 prior digest、ROW_FIELDS／META_FIELDS／inputs閉包を静的検証しています。全authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false`です。

BR29-A02とBR30-A02の共有atomは完全句で両productへ保持しました。BR30-A02の共有atom textは完全句で保持し、OS側source_fragmentsは共有tail spanへ限定しました。BR30-HARNESS-A01／OS-A01は各unitのliteral source fragmentへ境界付けました。BR30-A01のHARNESS／OS接続は明示connectorが上流にないため、両A01を共有atomへ昇格せず `connector_gap_unresolved` として保留し、OS単独成立を主張していません。Web／Web-OSのunitやedgeは推測していません。

meta/verifierはWave20 corrected exact HEAD `68ab10163fe0b6025dd56fa5d34cd476f6110494` と現行main `053943791ceda83366fca01d375308ba5f7deb28` を固定し、20 prior batch、45 input path、parent/input digest closureを再計算済みです。
