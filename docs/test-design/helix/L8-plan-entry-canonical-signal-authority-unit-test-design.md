# PLAN entry canonical signal authority 単体テスト設計

## Oracle

- `U-PROUTE-003b`: `regression_dev`を`catalog_signal`として解決し、`po_directive`へ昇格しない。
- 既存`U-PROUTE-003`: catalogにもDBにもない値は`entry_signal_unresolvable`を維持する。
- 既存typed route照合により、signalとworkflow identityの不一致をfail-closeする。
