# SCF-B-0126 固定BASE未解決 implementation_source 残余67件の製品責務研究

`SCF-B-0126` は、固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` の旧asset台帳を静的に読み、既存研究unionを除いた未解決 `implementation_source` 67件を四製品の責務候補として記録する research-only Scaffold です。

## 対象と分母

固定BASEの `product_classification_status=unresolved` は1,792件です。既存研究union 280件（Wave1–50の64件と、`src/lint/`、`src/runtime/`、`src/schema/`、`src/workflow/`、`src/setup/`、`src/cli/`、`src/requirements/`、`src/shared/` の既存束）を除いた残余は1,512件です。そのうち `artifact_evidence_kind=implementation_source` で既存unionに含まれない67件を対象にしました。

対象領域は `src/web/` 7、`src/doctor/` 5、`src/policy/` 5、`src/vscode/` 5、`src/audit/` 4、`src/design/` 4、`src/task/` 4、`.claude/hooks/` 3、`scripts/` 3、`src/semantic/` 3、`src/team/` 3、`src/vmodel/` 3、その他12件です。Wave1–50は598 edge・355 unique assetを再走査し、対象67件に属するedgeは **0** と固定しています。Waveの製品scopeは対象へ継承していません。

分類候補は、direct product basis 30件、multi-product conflict 23件、insufficient basis 14件です。これは各archive sourceの具体的なGit object span、四製品L1、`docs/concept/product-boundary.md`の境界記述、旧asset disposition/history/failure/consumerの静的証拠を突き合わせた候補です。単一owner、正式分類、phase admission、successor、実装成立、consumer closureは決めていません。

`src/web/share.ts`のようにWebとWeb-OSの共有・activation境界が同一spanに現れるものはconflictとし、`src/design/`・`src/vscode/`・一部のsemantic/adapter/gateはHARNESSとWebまたはOSの複合責務として保持します。hook・launcher・re-export・V-model compatibility facadeは根拠不足としました。単純なpath名によるowner推定は行っていません。

## 記録する証拠

各recordは次を保持します。

- asset ID、phase台帳行、旧asset disposition行、source path、source SHA、Git blob、bytes、line count
- archive sourceの具体的marker、line range、行テキストdigest、解釈、読み取りモード
- direct/conflict/insufficient、候補製品、反証としてのproduct boundary/L1範囲
- 旧decision/read-afterの対象別行、failure inventory、consumer inventory（いずれも静的参照）
- phase候補、Wave edge分母、残る人間判断、authority境界

旧asset status block（disposition、product、implementation status、consumer、decision/read-after参照）とhistory/consumer blockは、固定BASEの期待record全fieldと厳密一致させます。inventoryもschema、formal_update、expected source_pathsを含む全fieldを固定期待値と照合し、status昇格、disposition/product解決、consumer改竄、closure closed、formal_update反転をfail-closeします。

`scripts/helix.ps1`はphase台帳のsource digestと固定BASE archive Git object digestに差分があるため、両方を保持し `ledger_digest_match=false` として可視化しています。この差分は分類根拠へ昇格させず、人間確認事項として残します。

## authority境界

`authority_effect=none`、`formal_asset_classification_updated=false`、`new_build_allowed=false` を全recordとinventoryで固定しています。Bindingの`product`欄はScaffold schema上の登録先であり、67件の単一ownerを表しません。正式product authorityや下流実装へ置換する場合は、別の人間判断と `scfctl check-replacement` が必要です。

旧archive source、旧runtime、test、hook、adapter、CIは実行していません。検証は固定BASE Git objectの静的read、JSONL digest、独立validator、期待error code付きnegative selfcheckだけです。

## 検証

```text
python3 -B scaffold/legacy-implementation-residual-0126/generate.py
python3 -B scaffold/legacy-implementation-residual-0126/validate.py
python3 -B scaffold/legacy-implementation-residual-0126/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

selfcheckは対象欠落・重複、source blob/anchor/read mode、分類候補・製品、Wave edge注入、phase/asset/旧status/consumer/history/implementation evidence/boundary、authority・formal_update昇格、inventory schema/source_paths、input digest schema、scope、BASE pin、output digestを34負例で検査します。
