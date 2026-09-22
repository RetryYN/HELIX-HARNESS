[
  {
    "op": "test",
    "path": "/HIL-FR-19/revision",
    "value": 1
  },
  {
    "op": "test",
    "path": "/HIL-FR-19/semantic_digest",
    "value": "sha256:df78c7188f3a460486b34259b78e011b47518da134d4e7344b6614c514915e6b"
  },
  {
    "op": "test",
    "path": "/HIL-FR-19/statement/text",
    "value": "画面対象のWalkthrough Loopはprototype版、ユーザー観測、発見要求deltaまたは`no_delta`、L1反映先、再作成判断を記録し、boundedに反復する。 | walkthrough receipt、requirements delta、iteration checkpoint"
  },
  {
    "op": "replace",
    "path": "/HIL-FR-19/statement/text",
    "value": "画面対象のWalkthrough Loopはprototype版、ユーザー観測、発見要求deltaまたは`no_delta`、L2要求への反映先、企画への影響がある場合のL1反映先、再作成判断を記録し、boundedに反復する。 | walkthrough receipt、requirements delta、iteration checkpoint"
  },
  {
    "op": "test",
    "path": "/HIL-FR-20/revision",
    "value": 1
  },
  {
    "op": "test",
    "path": "/HIL-FR-20/semantic_digest",
    "value": "sha256:c15b515fa4611febe1e2eca21082a6f2ac9513f7858af231c3a8e658308c423a"
  },
  {
    "op": "test",
    "path": "/HIL-FR-20/statement/text",
    "value": "Screen Gateは画面対象ならartifact、walkthrough、要求反映、prototype agreementを検査し、画面非対象ならskip receiptのscope/digest/再entry条件を検査する。いずれも無い場合はL1 freezeとL3開始をfail-closeする。 | G2判定、agreementまたはskip receipt、不足code"
  },
  {
    "op": "replace",
    "path": "/HIL-FR-20/statement/text",
    "value": "Screen Gateは画面対象ならartifact、walkthrough、L2要求反映、prototype agreementを検査し、画面非対象ならscope/digest/再entry条件と、理由・判定者・対象HEAD・要求への影響・再評価条件を持つreceiptを検査する。不足時はL3 freezeと後続実装への進行をfail-closeする。L3起草まで一律禁止する条件にしない。 | G2判定、agreementまたはskip receipt、不足code"
  }
]
