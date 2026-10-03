[
  {
    "op": "test",
    "path": "/HAC-HIL-15a/revision",
    "value": 1
  },
  {
    "op": "test",
    "path": "/HAC-HIL-15a/semantic_digest",
    "value": "sha256:94b582445eb4e9134827598dc75d995ebea72cbdf4ca0e3dfdbc2991b7190482"
  },
  {
    "op": "test",
    "path": "/HAC-HIL-15a/statement",
    "value": "no-UI構造skipでfreeze"
  },
  {
    "op": "replace",
    "path": "/HAC-HIL-15a/statement",
    "value": "非UIでもL2要求を保持し、必要な適用性項目が揃った対象revisionでL3凍結できる"
  },
  {
    "op": "test",
    "path": "/HAC-HIL-15b/revision",
    "value": 1
  },
  {
    "op": "test",
    "path": "/HAC-HIL-15b/semantic_digest",
    "value": "sha256:5732171f866332019cc201147075c98d88fb7f408b426567167e825a7be2e423"
  },
  {
    "op": "test",
    "path": "/HAC-HIL-15b/statement",
    "value": "UIはprototype/walkthrough/agreement前freeze拒否"
  },
  {
    "op": "replace",
    "path": "/HAC-HIL-15b/statement",
    "value": "UIのprototype・walkthrough・L2要求反映・agreementのいずれかが欠ける場合、L3凍結を拒否する"
  },
  {
    "op": "test",
    "path": "/HAC-HIL-15c/revision",
    "value": 1
  },
  {
    "op": "test",
    "path": "/HAC-HIL-15c/semantic_digest",
    "value": "sha256:34ba11c709deabf1b79731069f2548001f1854d433a43409a216e883218f94a0"
  },
  {
    "op": "test",
    "path": "/HAC-HIL-15c/statement",
    "value": "scope変更でstale化しL2再entry"
  },
  {
    "op": "replace",
    "path": "/HAC-HIL-15c/statement",
    "value": "scope変更で影響するL2要求・適用性・agreementをstale化して再評価する。L1企画への影響がない変更をL1合意へ一律差し戻さない"
  }
]
