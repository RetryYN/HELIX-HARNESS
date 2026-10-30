# WR243 HARNESS-015 F03 L5/L8候補

## 状態と範囲

- Issue: #3510、依頼 `WR243-TDD-F03F04B01-L5L8`
- base: `988765e9be335f2a1d376721c1b11f808fd03372`
- 対象V-pair: HARNESS-015 F03のL5/L8のみ
- 比較前固定: 別担当 `/root/wr243_blind_clean` のsource-only artifact。SHA-256 `846907d5802170ed775fbf08664c0b85f42e7b6ac0a9623e8584452f81ead813`、[Issue #3510 comment 6534177643](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6534177643)
- 状態: `authority_effect=none` の候補。承認、正式設計、oracle、実行、受入、4way成立を示さない。

L4/L9と既存L8 `unit_case_ids`／`unit_cases` は変更しない。L8候補表は既存F03 IDとL5契約IDへの参照を置き、L9行はsource traceとして分離する。fixture、全返却、seed、COPY、hash、test citation、U-ID oracleを追加しない。固定artifactとL5候補のSHAはSCF-B-0204に保持する。L5にはsource-onlyの条件候補を保持するが、failure code、axis/state、algorithm、返却値を選ばない。

## 比較後の全行記録

[`comparison.json`](comparison.json) にF03 L4の9分類行とL9の9負例行を全行記録した。L4/L9の条件文字列は各行で一致し、L8には既存IDが10件（normal 1、negative 9）ある。5つのsource-only意味条件を既存9行へ比較すると、F03-03はpublic/architecture/state/requirementの4 witness、F03-04はminimal-body/incorrect-Greenの2 witnessを覆う。これは比較上のmany-to-oneであり、正式な分類やU-ID oracleへの割当ではない。

`ci_as_quality`は方向が一致するが、source-only artifactから行単位のaxis/stateを導けないため、既存L4/L9の値は比較資料としてのみ保存した。sequence等値、failure code語彙・優先順位、各U-ID行oracle、test citationは未決。QA §3に従い、公開関数の宣言がないF03では各U-ID候補のtargetを契約ID `HARNESS-L5-015-F03` で示し、L9 pointerは別のsource traceとして保持した。L3/L10の契約oracle `HARNESS-L10-015-F03` とU-ID行oracleを分け、後者は不足のまま記録した。

## 旧HELIXと同種失敗

- `LEGACY-ASSET-5E22432B0A5A8F7CC8B3`、旧 `ddd-tdd-rules.md:21-30`: 契約先行、実際のRed証拠、1 behavior contract・1 ownerの原子単位。
- `LEGACY-ASSET-BD0E4DCE9725CA3612B2`、旧 `PLAN-REVERSE-28-red-first-tdd-evidence.md:54-60`: Red-first evidenceが機械的に強制されなかった記録。
- `LEGACY-ASSET-93AB9941464AA413C9AB`、旧 `A-114-ddd-tdd-strengthening-reaudit.md:37-41`: 15件の計画がdraft/review evidenceなしで、実装が先行していた記録。
- `LEGACY-ASSET-158CE0FD538E9C1E553E`、旧 `A-115-ddd-tdd-increment-closure.md:17-27`: invariant、trace、Red-first、oracle強度、negative testの実検出記録。

保持するのは、契約とRed evidenceの対応を明示し、review前に実装済みと誤認しない点である。旧runtime/test/CIや旧規則実装をコピー・起動せず、現行L3/L10と許可されたL4散文から意味候補を再導出した。

## 静的確認

`validate_static_candidate.py` は固定artifact/source pointer、9行比較、L4/L9不変、L5/L8 candidate境界、既存L8 IDとcase不変を静的に確認する。別途 `design_verification_checker.py check-child` と `scfctl validate/stale` の結果を `verification-summary.json` に記録する。algorithm、旧runtime/test/CI、新世代runtime/test/CIは実行しない。
