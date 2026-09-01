# Claude Fable 5.1 provider drift 単体テスト設計

- U-FABLE51-001: current registryが`claude-fable-5-1`を返し、$10/$50 pricingを解決する。
- U-FABLE51-002: `advisor-fable` frontmatterがcurrent registry identityと一致する。
- U-FABLE51-003: historical `claude-fable-5` pricingを保持し、過去receiptを書き換えない。
- 既存`agent-model-ssot`により旧IDをcurrent agentへ戻すmutationを拒否する。
