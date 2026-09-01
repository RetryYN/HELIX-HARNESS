# Closure Semantic Authority Join Unit Test Design

- U-CESA-006: exact PLAN＋artifact kindの3 authorityで全candidateがreadyになる。
- U-CESA-007: wrong PLANはreview placeholderを解決しない。
- U-CESA-008: source digest／payload不一致をloaderが拒否する。
- U-CESA-009: 同一PLAN内のwrong HEADを拒否する。
- U-CESA-010: structured oracleとruntime oracleの不一致を拒否する。
- U-CESA-011: semantic bundle digestがapproval scope digestへ束縛される。

各negative oracleはlegacy greenやprobe時刻による相殺を認めない。
