# 調査方法

1. latest `origin/main`から別worktreeを作り、作業開始時のbase、fixed materialization path、停止条件をinventoryへ記録した。holding 67行からPATH-006〜010だけを選び、残り62 pairを未選定のまま保持した。
2. 既にmergeされた product-entry、boundary、Web／Web-OS L2 Scaffoldのsource snapshotを静的に読み、pre-isolation／archive revisionのbytes、blob OID、SHA-256、line countをholding記録と照合した。現行counterpartは固定baseのGit objectを`git show`で読み、path／blob／bytes／SHA／line countを記録した。
3. 5 pair全183行をpair／line一意の`line-coverage.jsonl`へ束縛した。frontmatter、空行、見出し、表の構造、参照だけの行は`metadata_only`、単一の原文支持候補だけは`atomized_candidate`、複数責務・複数条件を含む行は`composite_unresolved`へ置いた。分類のための推測でsource textを変更しない。
4. PATH-008は既存merged atom 74件を再生成せず、ID・source line・canonical JSON digestを参照記録へ分離した。新規4 pairは既存Web Vision／Web-OS atom schemaの意味欄を再利用し、候補productは四製品集合、phase／owner／authority／implementation／degradation／failure／consumer／decisionはunknownに固定した。
5. 旧HELIX source、判断史、failure、consumer ledgerは7つの静的ledger pathをsource_item_id／source path／pre/archive blob OIDで検索し、exact text hitとno-hitを区別して記録した。不在やno-hitから実装、縮退、失敗、consumer closureを推定しない。
6. validatorはorigin/main drift、holding/register digest、snapshotとcurrent counterpart、183行の重複なし会計、PATH-008既存atom digest、候補境界、status boundaryを再導出する。selfcheckは21件の意味ある改変を拒否する。旧archive内asset、runtime、test、CIは実行しない。
