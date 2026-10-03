# 調査方法

1. origin/main `dbcc0f332704302d2f8181479552e7198f102db7`へresetしてrebaselineしたisolated worktreeで、pre-isolation commitとarchive commitの同一pathを`git show`で静的取得した。旧基点は`3bb146e0...`としてscopeに保存し、4a2b46f（#2010）を経てf369e2f（#2013）、3a257fe（#2014）を経てdbcc0f3（#2015）へ追随した。
2. outside67 holdingの既存7件とcandidate 5件のID/pathを比較し、source path・unit anchorの非重複を確認した。
3. 030/033のarchive relocation、043/045のarchive/current counterpart hash一致、055のcurrent counterpart frontmatter path drift/hash不一致を記録した。hash一致・不一致のいずれからも意味同値、authority、successor、implementationを生成しない。
4. AICR/CICR/NIO/FRS/LARの代表relation rowをexact source lineへ束縛した。fragment外のactor/action/condition/guard/sequenceを補完せず、未選択lineは未解決とした。
5. legacy asset disposition、decision、copy/read-after、phase/product、implementation crosswalk、IR decompositionの7 ledgerをsource path/IDで照合し、exact hitなしをunknownとして保持した。
6. 旧runtime、test、CI、hook、adapter、source実行、外部API、GitHub、PR、DB操作は行っていない。今回の検証幅は5 source path_revision_pairであり、安全なbatch上限は断定しない。
