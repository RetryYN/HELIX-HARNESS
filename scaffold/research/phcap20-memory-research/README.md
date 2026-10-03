# PHCAP-20 Memory／継続 research premise candidate

`status: research_premise_candidate`、`authority_effect: none`の静的候補である。基準HEADは
`c354b7d9177ad3ea92dec30c66c36e6ce2d66ae3`。base SHAは取得時点metadataであり、mainの最新性を恒久gateにしない。
Issue、PR、会話、旧実行結果を意味authorityへ変換しない。

## scopeと製品境界

PHCAP-20の`product_targets`とinventoryの直接current evidenceはHELIX-OSだけである。
対象unit候補は、knowledge memory、continuation／process state、takeover lifecycle、改善coordinationである。
HELIX-HARNESS、HELIX-Web、HELIX-Web-OSはPHCAP-20のtargetへ昇格させず、HARNESSの工程・要求・証拠、Webの同意・結果、
Web-OSのbounded service exportへ接続し得る非対象connection／境界候補として保持する。product owner、composite split、接続契約は未解決である。

inventoryが直接current evidenceとして挙げるのはHELIX-OSのL2／L11 2参照だけである。これはdraft requirement／acceptanceの候補文言を示す。
current implementation、operation、pass、production applicabilityは直接証拠がなく`unknown`とする。current refの存在や旧sourceの実装・test資産から成立を推定しない。

## 旧assetのbounded closure

調査対象は次の5件に限定した。旧asset台帳は全件`Historical`、`disposition: unresolved`、`implementation_status: unknown`、`consumer_refs: []`、
判断ログ該当0件である。source本文、旧実装source、test sourceの存在は静的な意味・failure・consumer候補として保持し、旧runtime・旧test・旧CIは実行しない。

- `LEGACY-ASSET-899A61905AFBC415F595`: L3 orchestration-memory requirements
- `LEGACY-ASSET-D65FB82C21C5EDBDFCE4`: L5 memory-learning-promotion design
- `LEGACY-ASSET-E2208C8FDEDCABF63A79`: L6 orchestration-memory function design
- `LEGACY-ASSET-AB9A16E8A8DB2F094CC5`: old memory-store implementation source
- `LEGACY-ASSET-C4A63C3FE02AA86E2391`: old memory-v2 test source

旧到達層はL3、L5、L6、L7 implementation/testである。phase inventoryの`implemented_with_tests`と、個別asset台帳のunknown／unresolved、旧execution falseを矛盾として併記し、現行実装へ昇格しない。
source span、digest、asset ledger、phase classification、failure evidence、consumer候補は`inventory.json`で固定する。

## memory／continuation境界

旧L5と現行OS候補が示す意味を、次の候補境界として分けて保持する。

- 検証済み決定・長期制約・再利用可能な設計知識はmemory候補。
- 現在state、進捗、next action、lease、checkpointはcontinuation／process state候補。
- takeoverは有期限の一時状態候補で、長期knowledgeへ自動転記しない。
- raw log、secret、PII、credentialは保護境界または拒否候補。
- learning promotion、HARNESS工程、Web同意、Web-OS service exportは接続候補であり、PHCAP-20のtarget所有へ統合しない。

PHCAP-19 learningとのatom／consumer分割、retention／purge、recovery、secret boundary、正式L3／L10、consumer closureは残差である。

## 検証境界

validatorは旧source exact span、bytes digest、asset／phase ledger、判断ログの不在、OS direct ref、非対象connection、unknown状態を静的に照合する。contradictions_preservedは4件の固定ID・固定resolution・unique statusで照合し、非dict・空object・削除・内容反転を拒否する。unresolvedは各項目を非空文字列として検査する。
selfcheckはauthority、current implementation／operation、直接証拠、旧実装・consumer・decisionの昇格、product target拡張、source改変、atom欠落を陰性例として拒否する。
旧runtime・旧test・旧CIは実行していない。
