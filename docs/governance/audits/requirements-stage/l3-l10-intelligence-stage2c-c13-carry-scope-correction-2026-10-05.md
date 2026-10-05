# INTELLIGENCE Stage 2c C13 carry範囲の分類訂正

Stage 2c本文commit `f0debdad3ad979a380a3e680df3ecc6c29b51285` で、FR/FVのcarry記述をscope別に修正した。以前の静的監査は履歴記録として保全し、そのm3がC13 carry全体をStage 2a限定としていた分類の広さをこの追補で訂正する。

C13原文は `/tmp/pr2564-claude13-comment-full.txt`（comment identity `RH-PR2564-L3L10-274-13`、SHA-256 `4d837e616451040cb15762e98b65cb9f104db8856f0319f4f376a47459644f1c`）。M7/L2-066、M10/L2-010、M12の該当spanと、固定L2-068:491-506/L11-068:201-209をJSONへraw-span/full-file SHAとともにpinした。

- Stage 2a履歴として範囲づけたもの: M7/L2-066、M10/L2-010、Minor INT-010の該当親範囲。
- 共通・未解消で保持するもの: M12のうちL2-068 atomに関するcomment line 168、`C13-U-INT-NFR-060-078`、`C13-U-all-crosswalk-and-legacy`。068の条件を現FVへ配置したことだけで独立reviewやclosureとはしない。
- `Minor INT-060-078`は複数親・stageにまたがる範囲であり、Stage 2aの該当部分だけを扱った記録から全範囲のreview/closureを推定しない。

変更後の6文書SHA、変更行のLF-inclusive pins、前回監査のSHA/byte数をJSONに記録した。静的確認は `scfctl validate` 147 bindings / fail 0、stale 0、residuals 0、`govcheck` 7622/57/58、`git diff --check` pass。旧runtime・test・CI・Bunは実行していない。root検収と独立reviewは未完了。
