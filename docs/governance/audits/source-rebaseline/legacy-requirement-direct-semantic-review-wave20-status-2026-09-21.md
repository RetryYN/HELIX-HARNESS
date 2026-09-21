# Wave20 旧要求 semantic review status（2026-09-21）

Wave20の下書きは、main merge後の exact tree `9573119070cdf8f1f70e368bc310f575e8a3538c` を親に固定しています。Wave19 exact prior `609338f19a6189b76f4e03a39fa0a2823ffadbf6` は prior_review_batches としてdigest照合対象です。

選定は BR25-HARNESS、BR26-HARNESS、BR26-OS、BR27-HARNESS の4 unitです。12 row（要求4、design 4、implementation_source 4）を作成し、confirmed 4、unresolved 8、rejected 0、cumulative 62/218 units・183 edgesと記録しました。

要求IR/rawのsource grounding、catalog candidate role、crosswalk phase pool、candidate bounded search、Wave1–19 prior digest、ROW_FIELDS／META_FIELDS／inputs閉包を静的検証する構成です。phase／design／implementationは候補へdegradeし、全authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false`です。

未解決はproduct routingとatomization、successor、phase authority、consumer closure、current implementation statusです。Web／Web-OSに旧decomposition candidateがないため、Web edgeや実装を推測していません。BR26のHARNESS／OS splitもhuman product decision待ちです。
