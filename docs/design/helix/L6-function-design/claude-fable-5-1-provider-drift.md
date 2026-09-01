# Claude Fable 5.1 provider drift Recovery

## 境界

current model identityは`MODEL_IDS.claude.fable`を唯一のTypeScript正本とし、Claude agent frontmatterは`agent-model-ssot`で同期する。過去PLAN／review receiptの`claude-fable-5`は当時の実測identityなので変更しない。pricing lookupだけはhistorical usage再生のため旧IDを保持する。

HELIXはClaude Codeのnative CLI／subscription経路を維持し、API clientを追加しない。公式migration差分のforced tool choice、thinking履歴、refusal、retentionはProvider Configuration AttestationとHELIX-Benchの再検証対象へ送る。

## 不変条件

- current selectorとadvisor frontmatterは`claude-fable-5-1`。
- `claude-fable-5`をcurrent selectorへfallbackしない。
- Fable advisorはadvisory-only、read-onlyを維持する。
- provider/model/version更新後の旧qualificationを自動継承しない。
