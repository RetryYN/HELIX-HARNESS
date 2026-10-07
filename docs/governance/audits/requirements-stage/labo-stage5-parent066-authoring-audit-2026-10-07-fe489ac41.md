# HELIXLABO-L2-066 L3/L10本文凍結・照合記録（候補）

> 時点監査候補。本文commitの実bytesとsource pinsを確認する記録であり、独立review、要件承認、fixture実行、意味完全性を主張しない。

## 対象とauthority状態

- 固定L2/L11: `0dd946cec1c3fca8e144513b72e2e10d16c7c9c3`。
- PO採択行はcandidate確認時点の `af8d0aac1a20cd3a41ca9df088bc7bf3501847ff` 上でactualRead。author base `e015c3477e890c7079cd0b51859da1cec8f8fb7a` と混同せず、同じPO line 81 bytes/hashがbaseでも維持された。L2本文metadata `draft_candidate` は事前snapshot metadataとして保持し、PO行のL2採択と区別する。
- MPR: `MPR-RC-HELIXLABO-L2-066-001`。登録receipt: `MPR-RCPT-LABO-BUGBOT-MISREPAIR-COMPARISON-2026-09-28`。
- 本文commit: `fe489ac41b8703bac445fd42a3f493692afd1baa`（base `e015c3477e890c7079cd0b51859da1cec8f8fb7a`）。Draft PR #2635。作成側起草・固定候補で、独立review・POのL3委任判断・Ready・mergeは未了。
- 固定L2/L11が要件authorityである。L3/L10本文は未承認candidateで、実装・比較run・実測合格を生成しない。

## 旧sourceと処置

旧Bugbot要求 `LEGACY-ASSET-D881AF6AFD277B1DE934` の75行目を起点にした。旧source文は成功件数だけで判断せずAと同条件の費用・時間・手戻り・誤修復・未解消数を測る内容である。誤修復・未解消を共通Nと事前固定oracleへつなぐ意味を再導出し、費用・時間・手戻りは採択済みL2-059から再利用する。旧runtime、repair実行、旧acceptance authorityは移さず、現行L2/L11の責務境界へ置換する。paired acceptance consumerはdraft候補で別紙02/03/05未提供の制約を持ち、18シナリオ全件対応を主張しない。

## 実体freeze pins

各suffixはbase file bytesの後ろへ連結されたことを確認し、prefix SHA・suffix SHA・full file SHAをactual Gitから再計算した。全6 canonical文書は末尾LFあり。変更pathは次の6件のみ。

| Target path | Prefix bytes / SHA-256 | Suffix bytes / SHA-256 | Full file SHA-256 |
|---|---|---|---|
| `docs/helix-labo/L3-requirements/business-requirements.md` | 14872 / `71b81422df7431fe42e15f20cb46c40ee36274162ecd8123adccb3f2b2fafc49` | 803 / `3dc759a6eb597cc46b0014dbedc2dc705810eebcc810e0bee891afbf3941fc3a` | `bfcd5a64b295a9e3d434fd9369d97ffb45172b11dcccd40bfd205e9375af6ec6` |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | 298371 / `a457a383bebc8f579f27d93e991d01b2c7789bd698e6362a47bec7f600dd8ba1` | 5901 / `c2836aa13303d64d5b884de5438a4c01c7ba07410634687682850d6c0fef175d` | `6098885299fbab6b15a3bf0b62f5fcfed7df33984cf3d1a11479322c8cdcad42` |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | 66454 / `fc22cc61757139a102a4d713ece92c314d15aefea970d6fc592eeb27f209889a` | 1313 / `77be1f306c73a558daebba11ba608a02444940775b7695665c8e455f19932834` | `e694de8312cc215bac2b9331c78a2df8ae21ce8948e51ee7f4a5a037abecc91f` |
| `docs/helix-labo/L10-verification/business-verification.md` | 12514 / `4e0dd519b80d5a56f4a62869e21186c15522c15712ffc550b004188a90ad64fd` | 988 / `1d82064b50b3a3baa01dd013087966fa3202dd7f0e82b17ce512fcc2c2609553` | `0065a82c60de87190750f09e889dfa4d4d85631c5685da807e8589ec32f342f9` |
| `docs/helix-labo/L10-verification/functional-verification.md` | 421399 / `ab940253986a0a7f24e532c256dceffb387781e236f21a1e4738d6dd97adbd5c` | 27312 / `13065d1321ee6d28831f59e811d3761a6e7a56df32dbce2ab9c86bb495b52870` | `4f530883784ec6bcee8dd853988a08dbac309f73840a4894e684769a2ee16805` |
| `docs/helix-labo/L10-verification/nfr-verification.md` | 56818 / `06faf6b11b5a5d9634f80bf16e6ecf184fd12cce36a823d9e0d00b9b67a4a364` | 1522 / `ff6980f1fd020fd36e80d6f9f06da6c7338652b47d3fb518b14f47b750646192` | `d292897a00f9763f5c723434259b821aa2d734c128bb25a01aa80592c75e4fdd` |

framed six-file body SHA-256: `0a912da070eb6d001a415e6b830153d088476714fd8be58bcafed222e2dc9d2e`。hash framing: SHA-256 over b"HELIX-LABO-066-FROZEN-BODY-v1\0" then, in the listed six-path order: UTF8 path, NUL, 8-byte big-endian prefix length, prefix bytes, 8-byte big-endian suffix length, suffix bytes.

git diff patch SHA-256: `f31d860647a1994cfd5ca9657ea47de408e58f80dcd71656056d42da1c913900`。`git diff --check e015c3477e890c7079cd0b51859da1cec8f8fb7a..fe489ac41b8703bac445fd42a3f493692afd1baa` はPASS。worktreeはclean。

## 追記中のLF assertion履歴

Rootの作業報告では、6文書の初回追記中2文書まで書いた時点で末尾LF assertionが失敗し、原因はNG候補suffixの末尾にLFがなかったことだった（既存canonicalファイル末尾ではない）。失敗後に処理を止め、actual prefix/suffixを読み直したうえで、全6文書の末尾LFを揃えて追記した。Root報告上は続くgovernance checkとdiff checkが成功した。最終commitだけから失敗時のworking tree bytesは再構築できないため、中間時点はRoot報告として記録し、最終6ファイルのprefix/suffix/hash/LFと `git diff --check` のみを独立確認した。

## 旧47 CASE・現52 CASE

旧定義は `a4a365dcdfe824ebb28d040c8bc3bc924556efad` の `docs/helix-labo/L10-verification/functional-verification.md`、全体SHA-256 `7a6c7dc1f88c77bbd628a1320c0393f0ad6c14b76d5a30db0c4cda27d22b9d16`。47 IDの順序・literal・各行LF hashを監査JSONに保持した。旧literalとcurrent candidate conditionを混ぜず、canonical本文では旧IDを保持しfixture条件を再導出している。

現行commit `fe489ac41b8703bac445fd42a3f493692afd1baa` のfunctional verification tableから52行をraw line + LF SHA付きで取得し、6列（CASE ID / FR ID / AC ID / baseline-input / mutation-index / expected oracle-return route）を照合した。52 IDは一意。旧47に加えCASE-44..48の5件を追加。

新authority出力の差は次の5種類で、比較receiptから各output fieldを1つだけ生成する誤出力として記載される。旧CASE-04aはLABOが修復を実行する拒否で、repair_permission fieldを生成するCASE-45とは入力因果・出力が異なる。各fixtureは未実行。

| CASE | 誤出力field |
|---|---|
| `L10-LABO-066-CASE-44` | 誤出力: 結果fieldとして HELIXLABO-L2-066 の採択decisionだけを生成する。 |
| `L10-LABO-066-CASE-45` | 誤出力: 特定repair methodに対するrepair_permission fieldだけを生成する。 |
| `L10-LABO-066-CASE-46` | 誤出力: placement fieldだけを生成する。 |
| `L10-LABO-066-CASE-47` | 誤出力: admission decision fieldだけを生成する。 |
| `L10-LABO-066-CASE-48` | 誤出力: requirement_complete fieldだけを生成する。 |

## review05 findingと処置の追跡

PR #2620 comment 6010745544のbody SHA-256は監査JSONに固定し、066に触れるM3/m5/m6の原文も保持した。findingは過去reviewの指摘として分類し、修正後本文の独立reviewやfinding closureとはみなさない。

| Finding | 原文指摘の分類 | 現行本文での処置・限界 |
|---|---|---|
| M3 | CASE-29/30で準備時speedと変異speed主張が食い違い、単独変異が一意でない。 | speed improvementを含む合成観測receiptをbaselineで固定し、misrepair/unresolvedの表示だけを落とす変異に再導出。実測値・実測実績は主張しない。 |
| m5 | CASE-43とCASE-09の重複計上懸念。 | 原文findingを保持。index/独立数の扱いを確認対象として記録するが、finding解消とは断定しない。 |
| m6 | CASE-42/43の戻し先不足。 | CASE-42の費用sourceは既存sourceが特定できる場合だけ返し、できない場合unknown。CASE-43は事後oracle変更拒否を保持する。m6を解消済みとは断定せず、実際のowner route判定は独立reviewに残す。 |

## 最終検証範囲と限界

- 実施：fixed L2/L11、PO line 81、旧要求75行、旧consumer、登録receiptのsource hash照合。旧47 literal+line hashとcurrent 52 raw rows / six columnsの照合。six-file prefix/suffix/full hashes、commit ancestry、変更path、LF終端、worktree clean、`git diff --check`。
- Root報告として記録：初回追記中のLF assertion失敗後の修復順、governance check/diff check pass、Draft PR #2635作成。
- 未実施/claimしない：L10実行、oracle実行、fixtureの合法control検証、意味完全性、実測効果、独立review、L3承認、Ready、merge。

## Root公開前検収とcontext

RootがMD全文、six body/prefix/suffix、固定2span、旧source/consumer/receipt、旧47literal/raw SHA、現52raw SHA、正式reviewと対象3finding原文をGit/APIで照合した。候補current52行番号は全件+1だったためactualGit物理行へ訂正し、literal/SHAは不変。LF失敗原因とM3表記も公開前に訂正した。

context commit `c258e9a7d22b4a2f9d66d6ddde35945a68281244` は最新main `0f05156f38415bc07a8a2d9c937b87db2d1af220` の六本文をprefixに保持し、body fe489ac41の066 suffixをbyte不変で追補する。元freeze pinは時点証拠として維持し、context pinはJSONに別記する。govcheck/diffcheck成功。独立review/承認は未了。
