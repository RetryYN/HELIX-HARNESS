#!/usr/bin/env python3
"""Build a disposable overlay for the caller-provenance-only alternative."""
import json
import sys
from pathlib import Path

ROOT = Path(sys.argv[1])
load = lambda name: json.loads((ROOT / f'{name}.json').read_text())
write = lambda name, obj: (ROOT / f'{name}.json').write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
l5, l8, l9 = load('l5'), load('l8'), load('l9')

caller_to_l9 = {
    'Worker': 'SEC003-PRIMARY-TREE-FALLBACK',
    'Agent': 'SEC003-AGENT-PRIMARY-TREE-FALLBACK',
    'Hook': 'SEC003-HOOK-PRIMARY-TREE-FALLBACK',
    'memory': 'SEC003-MEMORY-PRIMARY-TREE-FALLBACK',
    'credential': 'SEC003-CREDENTIAL-PRIMARY-TREE-FALLBACK',
    'configuration': 'SEC003-CONFIGURATION-PRIMARY-TREE-FALLBACK',
}
caller_l9 = {case['id']: case for case in l9['integration_cases']}
caller_rows = {kind: caller_l9[case_id] for kind, case_id in caller_to_l9.items()}
fallback_class = 'SEC003-F02-IMPLICIT-FALLBACK'

# Candidate L5 contract extension: provenance only. Existing finding and effect
# semantics are unchanged. This overlay is intentionally not canonical.
function_by_symbol = {fn['symbol']: fn for fn in l5['functions']}
caller_fn = function_by_symbol['compare_caller_material']
caller_fn['signature'] = 'compare_caller_material(input: Materialized<CallerInput>) -> PartAnalysisWithCallerProvenance'
caller_fn['output_type'] = 'PartAnalysisWithCallerProvenance'
caller_fn['return_root_fields']['caller_kind_provenance'] = 'OriginalCallerKindTagOrValue'
caller_fn['post'] += ' 原caller kindを来歴fieldとして無変換で保持し、権限判定には使わない。'
compose_fn = function_by_symbol['compose_scope_proposal']
compose_fn['read_fields'].append({'parameter': 'input', 'raw_pointer': '/caller/caller_kind_provenance'})
compose_fn['return_root_fields']['caller_kind_provenance'] = 'OriginalCallerKindTagOrValue|null'
compose_fn['post'] += ' caller partに存在するcaller_kind_provenanceを来歴として無変換で返す。権限・findings・operation_effectには使用しない。'

unit_rows = l8['unit_cases']
base = next(row for row in unit_rows if row['case_id'] == 'SEC003-L8-FALLBACK-PRIMARY')
base['function_ref'] = compose_fn['id']
base['integration_case_ref'] = caller_to_l9['Worker']
base['expected_preserved'] = dict(base['expected_preserved'], caller_kind='Worker')
base['caller_kind_provenance_input'] = 'Worker'
base['caller_kind_provenance_input_pointer'] = '/caller/caller_kind_provenance'
base['caller_kind_provenance_expected'] = 'Worker'
base['candidate_observation'] = 'compose_scope_proposal return provenance; fallback part remains violation/implicit_fallback'
for i, (kind, l9id) in enumerate(list(caller_to_l9.items())[1:], start=1):
    row = dict(base)
    row['case_id'] = f'SEC003-L8-FALLBACK-PRIMARY-CALLER-{i:02d}'
    row['integration_case_ref'] = l9id
    row['expected_preserved'] = dict(base['expected_preserved'], caller_kind=kind)
    row['caller_kind_provenance_input'] = kind
    row['caller_kind_provenance_expected'] = kind
    unit_rows.append(row)

for kind, row in caller_rows.items():
    row['expected_preserved'] = dict(row['expected_preserved'], caller_kind=kind)
    row['caller_kind_provenance_input'] = kind
    row['caller_kind_provenance_expected'] = kind
    row['candidate_observation'] = 'system request provenance plus unchanged isolation_violation/implicit_fallback finding'

# Case-level measurement matrix records distinct consumed input/result and the
# independently sourced system expectation for each one-to-one link.
l8['caller_provenance_candidate'] = {
    'status': 'disposable_separate_l5_l8_vpair_candidate',
    'authority_effect': 'none',
    'source_basis': [
        {'path': 'docs/helix-security/L3-requirements/functional-requirements.json', 'pointer': '/requirements/4'},
        {'path': 'docs/helix-security/L4-basic-design/project-scope-isolation.json', 'pointer': '/contracts/1/content_comparison'},
        {'path': 'docs/helix-security/L4-basic-design/project-scope-isolation.json', 'pointer': '/failure_classifications/5/expected_preserved'},
    ],
    'rows': [
        {'l8_case_id': base['case_id'] if kind == 'Worker' else f'SEC003-L8-FALLBACK-PRIMARY-CALLER-{list(caller_to_l9).index(kind):02d}',
         'l9_case_id': l9id, 'caller_kind_input': kind,
         'l8_expected_preserved_caller_kind': kind,
         'l9_expected_preserved_caller_kind': caller_rows[kind]['expected_preserved']['caller_kind'],
         'l5_unit_function': compose_fn['id'], 'l5_provenance_parameter': '/caller/caller_kind_provenance',
         'unchanged_fallback_finding': {'code': 'implicit_fallback', 'pointer': '/request/fallback', 'return_owner': 'scope-binding-owner'},
         'permission_or_effect_change': False}
        for kind, l9id in caller_to_l9.items()
    ]
}
write('l5', l5)
write('l8', l8)
write('l9', l9)
print(json.dumps({'candidate_rows': len(l8['caller_provenance_candidate']['rows']),
                   'distinct_inputs': len({r['caller_kind_input'] for r in l8['caller_provenance_candidate']['rows']}),
                   'one_to_one_l9_refs': len({r['l9_case_id'] for r in l8['caller_provenance_candidate']['rows']}),
                   'permission_or_effect_changes': 0}, ensure_ascii=False))
