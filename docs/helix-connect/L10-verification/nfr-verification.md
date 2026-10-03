# HELIX-CONNECT L10 NFR候補検証（Stage 1 草稿）

数値を確定せず、[L3 NFR候補](../L3-requirements/nfr-grade.md)の根拠付きparameterを観測可能性として評価する。上限越え、trace欠落/順序不明、stale送信、recipient未達、secret露出、unknownのallowをnegative oracleとする。時間・retention・resourceの具体閾値は固定parentにないため候補のまま記録し、実装値を推定しない。要求のscope/meaning/owner/versionを変える必要がある場合だけL2/POへ戻す。
