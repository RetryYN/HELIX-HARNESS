# LABO Stage2b review04 Root検収 — 2026-10-06

対象PR #2614、本文revision `56894a85bb59d9811e39e60aba322e4195312511`。Worker `6c636fa868b07aa154d506de87b73712d0c4f84c` を正式review04（6001942888）のM9/m14と照合した。

Rootは既知targetのOS route残り、connector/source不足の戻し先脱落、HARNESS contract staleとOS実行証拠不一致の混同、035のOS残りを補正した。新CASEの個別negative一覧と029-C16の索引脱落を復元した。022-C06はcontract/source revisionの索引として保持し、独立C17/C18へtraceして分母から除外する。

CASE312定義＝個別268＋索引44、重複・公開CASE消失0。6本文のmain prefix一致、suffix全行とCASE全体をraw LF込みSHA/literalに固定した。固定L2/L11/POと再利用source pin122件を再計算し、旧監査1878件の不変を確かめた。93件は固定source等を含むpinであり93旧資産の意味網羅ではない。GitHub正式bodyとWorkerローカル記録は末尾LF込みSHAを再計算し両方の一致を確認した。

最新main統合木 `2b055992b39d4dfa192fd9f546d14650c034409c` はvalidate147/fail0、stale0、residuals0。Rootの実読範囲と表示が切れた索引、L1/依存先/旧consumer/G0の未確認をJSONに保持した。独立review・L3承認・L10実行・merge admissionは未成立。
