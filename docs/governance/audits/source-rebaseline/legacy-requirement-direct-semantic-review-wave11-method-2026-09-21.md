# Wave11 review method (schema 10)

対象unit: `IRUNIT-HIL-NFR-04-HELIX-OS`、`IRUNIT-HIL-NFR-17-HELIX-OS`、`IRUNIT-HIL-NFR-18-HELIX-OS`。parent revisionを固定し、Wave1〜10のunit／edge／design／implementation asset集合を除外した。candidate pool membershipはsemantic linkの根拠にせず、asset ID、catalog kind/path、phase candidate、product candidate、archive source spanを個別照合した。

要求原文は意味を落とさずatom化し、requirement edgeはsame requirement ID exact source contractとしてconfirmed、design edgeはpartial/unresolved、implementation edgeはsource spanが要求atomを直接支えない場合にunresolvedまたはrejectedとした。NFR17 implementation、worker lifecycle receiptに一致しないNFR18 design、lease期限lockだけを扱うNFR18 implementationはcovered atoms空・counterevidence付きでrejectedである。

主語・責務主体はatomとして保持し、connectiveへ移さない。connectiveは本3文で文法上必要な `を持ち`、`の`、`し`、`する` の明示allowlist、1〜3文字、一意、atom source fragmentとの非重複に制限する。これにより意味句をconnectiveへ移してatom欠落を隠す入力を拒否する。

bounded global searchはexact token anchorのarchive file containmentで候補件数を固定し、unit direct phaseとasset candidate phaseの交差およびHELIX-OS product候補を検査した。shared source span／atomがないことも確認した。

archiveはread-only静的参照のみであり、runtime、test、hook、CI、adapter、旧CLIを実行していない。verifierのnegative mutation classはparent、digest、asset、line、kind、semantic status、phase、atom、shared boundary、search receipt、prior overlap、status countを含む。これはmutation注入試験の実施を意味しない。
