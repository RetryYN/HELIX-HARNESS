#!/usr/bin/env python3
"""WR257 L8 U-ID source/pointer preservation checker; no product execution."""
from __future__ import annotations
import argparse
import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = '663b75324810a6f004668a1451de5b03acc542c3'
L8 = 'docs/helix-connect/L8-unit-verification/composite-edge-terminal.json'
L5 = 'docs/helix-connect/L5-detail-design/composite-edge-terminal.json'
L4 = 'docs/helix-connect/L4-basic-design/composite-edge-terminal.json'
L9 = 'docs/helix-connect/L9-integration-verification/composite-edge-terminal.json'
L3F = 'docs/helix-connect/L3-requirements/functional-requirements.json'
L10F = 'docs/helix-connect/L10-verification/functional-verification.json'
L3B = 'docs/helix-connect/L3-requirements/business-requirements.json'
L10B = 'docs/helix-connect/L10-verification/business-verification.json'
EVIDENCE = 'scaffold/research/wr257-connect-composite-l8-slim-20261101/static-evidence.json'
EVIDENCE_DIR = 'scaffold/research/wr257-connect-composite-l8-slim-20261101'
BINDING = 'scaffold/bindings/SCF-B-0216.json'
CHECK_CHILD_DIR = 'scaffold/research/wr257-connect-composite-l8-slim-20261101/checker-evidence'

PROBE_EXPECTATIONS = {
    'LOCAL-C007-N01-EXACT-DECLARED-SCOPE-THREE-BOUNDARY-EVIDENCE-READONLY-OWNER-PROBE': ('必要証拠3件のうち第三境界の原証拠・提出証拠がともに欠ける。', '証拠集合はcontent conflictとして保留し、証拠ownerへ返す。'),
    'LOCAL-C007-B01-TECHNICAL-TERMINAL-BUSINESS-NOT-ACCEPTED-READONLY-OWNER-PROBE': ('技術終端と未受理の業務recordが同時にあり、dependency選択も異なる。', '技術終端から業務acceptanceを作らず、技術・業務・dependency各ownerへ返す。'),
    'LOCAL-C007-N01-EXACT-DECLARED-SCOPE-THREE-BOUNDARY-EVIDENCE-Empty-Required-Evidence': ('必要証拠集合と証拠recordがともに空で、宣言対象を立証できない。', '空同士の一致を成功扱いせず、未観測として候補を保留する。'),
    'LOCAL-C007-F01-FOUR-MECHANISMS-THREE-DISTINCT-EDGES-Source-Operation-Absent': ('中間edgeのsource operationが原・提出定義の双方で不在。', 'operation mapping不足を補完せず、候補を非終端に保ってedge/composite ownerへ返す。'),
    'LOCAL-C007-F02-DUPLICATE-ORIGINAL-STOP-EDGE-NO-OWNER-FALLBACK': ('stop identityに一致する原edge定義が重複し、一意なbindingがない。', 'stop ownerを選ばず曖昧性を保ち、trace failureをcomposite ownerへ返す。'),
    'LOCAL-C007-F01-SINGLE-SUBMITTED-RESULT': ('一つの提出receiptだけが成功以外のresult stateを示す。', 'receipt不成立を保持して合成終端を保留し、対象edge ownerへ返す。'),
    'LOCAL-C007-F01-SINGLE-SUBMITTED-SCOPE': ('一つの提出receiptのscopeが宣言edgeのscopeと異なる。', 'foreign scopeを一致扱いせず、edge/composite ownerへ返す。'),
    'LOCAL-C007-F02-STOP-POSITION-ABSENT': ('宣言順のstop位置に対応するedge identityが存在しない。', 'stop後の進行を確定せず、downstream判断を保留してcomposite ownerへ返す。'),
    'LOCAL-C007-F02-STOP-POSITION-DUPLICATE': ('stop位置のedge identityが重複し、停止edgeを一意に定められない。', '曖昧なstop bindingを保持し、unique ownerを選ばずcomposite ownerへ返す。'),
    'LOCAL-C007-F02-DOWNSTREAM-MISSING': ('stop後の宣言edgeに原・提出いずれのattemptもない。', '欠落attemptを成功扱いせず、downstreamを未完了としてcomposite ownerへ返す。'),
    'LOCAL-C007-F02-DOWNSTREAM-DOT': ('downstream attemptのedge keyがdot表記のforeign identityである。', 'foreign keyを宣言edgeに結びつけず、downstream結果を保留する。'),
    'LOCAL-C007-F02-DOWNSTREAM-PLAIN': ('downstream attemptのedge keyが宣言形式と異なるplain identityである。', 'foreign keyを宣言edgeに結びつけず、downstream結果を保留する。'),
    'LOCAL-C007-F02-DOWNSTREAM-NULL': ('原・提出downstream attemptの値がJSON nullである。', 'nullを進行attemptへ変換せず、判断を保留してcomposite ownerへ返す。'),
    'LOCAL-C007-N01-LITERAL-MAP-DOT': ('evidence-to-edge mappingがdot表記の未宣言identityを指す。', '未宣言mappingを必要証拠へ結びつけず、evidence ownerへ返す。'),
    'LOCAL-C007-N01-LITERAL-MAP-PLAIN': ('evidence-to-edge mappingがplain表記の未宣言identityを指す。', '未宣言mappingを必要証拠へ結びつけず、evidence ownerへ返す。'),
    'LOCAL-C007-N01-MISSING-BEFORE-CONFLICT': ('原recordのeffect-stop参照は欠落し提出recordには参照がある。', '欠落とforeign参照を一致扱いせず、evidence候補を保留してownerへ返す。'),
    'LOCAL-C007-F01-SUBMITTED-MAPPING-ONLY': ('一つの提出edgeだけconsumer endpoint対応が宣言と異なる。', 'endpoint mapping不一致を保持し、候補を非終端にしてedge/composite ownerへ返す。'),
    'LOCAL-C007-N01-SUBMITTED-EDGE-BINDING': ('提出evidenceのedge identityが原evidenceの宣言対象と異なる。', '対象binding不一致を保持し、証拠候補を保留してevidence ownerへ返す。'),
    'LOCAL-C007-F01-RAW-TIMEOUT-STATE': ('同一receipt位置の原・提出result stateがtimeoutを示す。', 'timeoutを成功へ読み替えず、edge failureをcomposite ownerへ返す。'),
    'LOCAL-C007-F02-OWNER-FIRST-APPEARANCE': ('提出stop ownerと原handoff scopeが異なり、提出handoff scopeにも差がある。', 'owner/scope差を上書きせず、stop判断を保留してcomposite ownerへ返す。'),
    'LOCAL-C007-F02-DOWNSTREAM-NEGATIVE': ('downstream attemptが負の数として与えられる。', '負値を有効な進行に数えず、型・値の不適合としてcomposite ownerへ返す。'),
    'LOCAL-C007-F02-DOWNSTREAM-FRACTION': ('downstream attemptが小数として与えられる。', '小数を整数位置へ丸めず、進行判断を保留してcomposite ownerへ返す。'),
    'LOCAL-C007-F02-DOWNSTREAM-BOOLEAN': ('downstream attemptがbooleanとして与えられる。', 'booleanを数値へ読み替えず、進行判断を保留してcomposite ownerへ返す。'),
    'LOCAL-C007-F02-DOWNSTREAM-LARGE-EXACT-NUMBER': ('downstream attemptが有限で正確に表現できる大きな整数である。', '有限整数を浮動小数化で丸めず数値domain内として比較し、fixtureの未検証境界を維持する。'),
    'LOCAL-C007-F02-STOP-AT-LAST': ('stop位置が宣言順の最後のedgeにある。', 'stopより後にdownstream edgeがないことを保ち、余分な進行を生成しない。'),
    'LOCAL-C007-F01-ORIGINAL-ZERO-SUBMITTED-ONE': ('原receiptが欠け、対応する提出receiptだけが残る。', '片側receiptを対応とみなさず、候補を保留してedge/composite ownerへ返す。'),
    'LOCAL-C007-F01-ORIGINAL-RECEIPT-DUPLICATE': ('同じ原receiptが重複し、edge対応が一意でない。', '重複receiptを単一成功へ縮約せず、曖昧性を保ってownerへ返す。'),
}


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def load(path: str):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))


def base_load(path: str):
    raw = subprocess.check_output(['git', 'show', f'{BASE}:{path}'], cwd=ROOT)
    return json.loads(raw)


def resolve(doc, pointer: str):
    value = doc
    for token in pointer.strip('/').split('/'):
        token = token.replace('~1', '/').replace('~0', '~')
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def derive_case_expectation(case_id: str, function_ref: str, rule_refs: list[str], scenario_basis: str, l5_doc) -> dict:
    if rule_refs:
        tag = case_id.split('-')[1]
        indexes = {rule['id']: i for i, rule in enumerate(l5_doc['contract_views'][tag]['failure_rules'])}
        return {'scenario_class': 'negative', 'condition': scenario_basis, 'l5_refs': [f'/contract_views/{tag}/failure_rules/{indexes[ref.split(":", 1)[1]]}' for ref in rule_refs], 'verification_status': 'unverified'}
    if function_ref == 'FN-C007-01':
        return {'scenario_class': 'normal', 'condition': scenario_basis, 'l5_refs': ['/contract_views/F01/terminal_predicate'], 'verification_status': 'unverified'}
    if function_ref == 'FN-C007-02':
        return {'scenario_class': 'negative', 'condition': scenario_basis, 'l5_refs': ['/contract_views/F02'], 'verification_status': 'unverified'}
    if function_ref == 'FN-C007-03' and 'EXACT-DECLARED-SCOPE' in case_id:
        return {'scenario_class': 'normal', 'condition': scenario_basis, 'l5_refs': ['/contract_views/N01/evidence_predicate'], 'verification_status': 'unverified'}
    if function_ref == 'FN-C007-03':
        return {'scenario_class': 'negative', 'condition': scenario_basis, 'l5_refs': ['/contract_views/N01/evidence_predicate'], 'verification_status': 'unverified'}
    if function_ref == 'FN-C007-04':
        return {'scenario_class': 'normal', 'condition': scenario_basis, 'l5_refs': ['/contract_views/B01/acceptance'], 'verification_status': 'unverified'}
    raise AssertionError((case_id, function_ref, rule_refs))


def historical_expectation_group_key(case_id: str, expected: dict, rule_refs: list[str], l5_doc) -> str:
    """Reconstruct earlier identical expectations without storing repeated rule prose in L8."""
    tag = case_id.split('-')[1]
    prior_findings = []
    for ref in rule_refs:
        rule_id = ref.split(':', 1)[1]
        rule = next(item for item in l5_doc['contract_views'][tag]['failure_rules'] if item['id'] == rule_id)
        selector = rule.get('selector', {})
        literal = selector.get('zero_literal') if 'MISSING' in case_id else selector.get('many_literal') if 'DUPLICATE' in case_id else None
        trigger = literal or rule.get('when') or selector.get('kind', 'rule_trigger')
        prior_findings.append(f"{rule_id}|{rule.get('area')}+{rule.get('field')}={trigger}@{rule.get('owner_route')}")
    key = {name: expected[name] for name in ('scenario_class', 'condition', 'l5_refs', 'verification_status')}
    key['prior_derived_rule_labels'] = prior_findings
    return json.dumps(key, ensure_ascii=False, sort_keys=True)


def _identity(item):
    if isinstance(item, dict):
        if isinstance(item.get('edge_target'), dict) and 'edge_identity' in item['edge_target']:
            return str(item['edge_target']['edge_identity'])
        for key in ('edge_identity', 'identity', 'connection_identity', 'contract_id', 'id'):
            if key in item:
                return str(item[key])
    return str(item)


def _source_changes(before, after, pointer=''):
    if type(before) is not type(after):
        return [(pointer, before, after)]
    if isinstance(before, dict):
        found = []
        for key in sorted(set(before) | set(after)):
            token = str(key).replace('~', '~0').replace('/', '~1')
            child = f'{pointer}/{token}'
            if key not in before:
                found.append((child, '<absent>', after[key]))
            elif key not in after:
                found.append((child, before[key], '<absent>'))
            else:
                found.extend(_source_changes(before[key], after[key], child))
        return found
    if isinstance(before, list):
        if before == after:
            return []
        left, right = [_identity(item) for item in before], [_identity(item) for item in after]
        if len(before) == len(after) and sorted(left) == sorted(right) and left != right:
            return [(pointer, {'order': left}, {'order': right})]
        if len(left) != len(right):
            return [(pointer, {'members': left}, {'members': right})]
        found = []
        for index, (old, new) in enumerate(zip(before, after)):
            found.extend(_source_changes(old, new, f'{pointer}/{index}'))
        return found
    return [] if before == after else [(pointer, before, after)]


def _semantic_difference(pointer: str, before, after) -> str:
    tokens = pointer.strip('/').split('/') if pointer else []
    field = tokens[-1] if tokens else 'declaration'
    if isinstance(before, dict) and set(before) == {'order'}:
        return 'order_reversed'
    if isinstance(before, dict) and set(before) == {'members'}:
        left, right = Counter(before['members']), Counter(after['members'])
        removed, added = list((left - right).elements()), list((right - left).elements())
        if 'original_receipts' in tokens or 'submitted_receipts' in tokens:
            if removed and not added:
                return 'missing_receipt'
            if added and not removed:
                return 'duplicate_receipt' if any(right[x] > 1 for x in added) else 'unexpected_receipt'
        if 'original_evidence' in tokens or 'submitted_evidence' in tokens:
            return 'missing_evidence' if removed else 'unexpected_evidence'
        if field == 'original_edges':
            return 'edge_definition_missing' if removed else 'unexpected_edge_definition'
        if field == 'required_contracts':
            return 'unselected_requirement_added' if added else 'required_contract_removed'
        if field == 'selected_edges':
            return 'unselected_connection_added' if added else 'selected_connection_removed'
        if field in ('submitted_prior_successes', 'submitted_unfinished'):
            return 'trace_entry_erased'
        return 'item_missing' if removed else 'item_added'
    if field == 'cause':
        allowed = {'timeout', 'digest_conflict', 'expiry', 'cancelled', 'permission_revoked', 'partial_success', 'unknown'}
        return f'failure_cause_{after}' if after in allowed else 'failure_cause_changed'
    if 'claim' in field or tokens[:1] == ['claims']:
        return 'unsupported_claim_asserted' if after is True else 'unsupported_claim_changed'
    if after is None or after == '<absent>':
        return 'target_missing'
    if isinstance(after, str) and (after.startswith('OTHER-') or after.startswith('UNSEEN-')):
        return 'foreign_target'
    state_kinds = {
        'registration_state': 'registration_unknown',
        'compatibility_state': 'compatibility_stale',
        'expiry_state': 'expiry_invalid',
        'permission_state': 'permission_revoked',
        'result_state': 'result_partial',
        'receiver_effect_state': 'receiver_effect_unobserved',
        'observation_state': 'observation_not_executed',
    }
    if field in state_kinds:
        return state_kinds[field]
    if field == 'source_operation' and after is None:
        return 'operation_mapping_missing'
    if field in ('source_operation', 'source_endpoint'):
        return 'operation_mapping_foreign'
    if field in ('owner', 'state', 'requirement_adoption', 'acceptance_ref') and tokens[:1] == ['submitted_business_record']:
        return f'business_{field}_overridden'
    if len(tokens) == 2 and tokens[0] in ('original_downstream_attempts', 'submitted_downstream_attempts') and after:
        return 'unauthorized_attempt_present'
    if field == 'scope' and isinstance(after, str) and after.startswith('OTHER-'):
        return 'foreign_scope'
    if field in ('composite_identity', 'composite_revision', 'requirement_revision', 'connection_exact_set', 'endpoint_registration_revisions', 'operation_attempts', 'effect_stop_ref'):
        return 'foreign_evidence_target' if after is not None else 'evidence_target_missing'
    return 'field_changed'


def derive_case_focus(case_id: str, tag: str, packet: dict, baseline_packet: dict,
                      rule_refs: list[str], l5_doc) -> dict:
    changes = _source_changes(baseline_packet, packet)
    changes.sort(key=lambda item: (
        0 if any(part in item[0] for part in ('business_record', 'dependency', 'receipts', 'evidence', 'stop', 'edges', 'trace')) else 1,
        len(item[0]),
    ))
    if not changes:
        if tag == 'F01':
            pointer, subject, field, difference = '/original_edges', 'declared edge set', 'edge declaration', 'baseline_fixture'
        elif tag == 'F02':
            pointer, subject, field, difference = '/original_stop', 'middle stop', 'cause', 'stale_middle_stop'
        elif tag == 'N01':
            pointer, subject, field, difference = '/original_evidence', 'declared evidence set', 'evidence declaration', 'baseline_fixture'
        else:
            pointer, subject, field, difference = '/original_business_record', 'business record', 'acceptance state', 'business_not_accepted'
        source_basis = {'source_ptr': pointer, 'subject': subject, 'field': field, 'difference': difference}
    else:
        pointer, before, after = changes[0]
        tokens = pointer.strip('/').split('/') if pointer else []
        subject = '対象record'
        if isinstance(before, dict) and set(before) == {'members'}:
            old, new = Counter(before['members']), Counter(after['members'])
            missing, added = list((old - new).elements()), list((new - old).elements())
            if missing:
                if all(str(item).startswith('EDGE-') for item in missing):
                    subject = '+'.join(sorted(set(map(str, missing))))
                elif len(missing) == 1:
                    subject = str(missing[0])
                else:
                    subject = '対象集合'
            elif added:
                if tokens[-1] == 'selected_edges':
                    subject = 'unselected connection'
                elif len(added) == 1 and str(added[0]).startswith('EDGE-'):
                    subject = 'unselected connection'
                else:
                    subject = 'unselected dependency'
            if not missing and not added:
                subject = 'declared order'
            field = tokens[-1]
        else:
            if tokens and tokens[-1] in packet and isinstance(packet[tokens[-1]], dict):
                subject = tokens[-1]
            if len(tokens) > 1 and tokens[-2] in packet and isinstance(packet[tokens[-2]], dict):
                subject = tokens[-2]
            for index, token in enumerate(tokens[:-1]):
                if token.isdigit() and index > 0:
                    parent = tokens[index - 1]
                    try:
                        record = resolve(packet, '/' + '/'.join(tokens[:index]))[int(token)]
                        if isinstance(record, dict):
                            subject = record.get('edge_identity') or record.get('identity') or record.get('edge_target', {}).get('edge_identity') or subject
                    except (KeyError, IndexError, TypeError, ValueError):
                        pass
                    if parent in ('original_receipts', 'submitted_receipts'):
                        try:
                            subject = packet[parent][int(token)]['edge_target'].get('edge_identity', subject)
                        except (KeyError, IndexError, TypeError):
                            pass
                    elif parent in ('original_evidence', 'submitted_evidence'):
                        try:
                            subject = packet[parent][int(token)].get('edge_identity', subject)
                        except (KeyError, IndexError, TypeError):
                            pass
            if len(tokens) == 2 and tokens[0] in ('original_downstream_attempts', 'submitted_downstream_attempts'):
                subject = tokens[1]
            for end in range(len(tokens) - 1, 0, -1):
                try:
                    record = resolve(packet, '/' + '/'.join(tokens[:end]))
                except (KeyError, IndexError, TypeError, ValueError):
                    continue
                if isinstance(record, dict):
                    subject = record.get('edge_identity') or record.get('identity') or record.get('edge_target', {}).get('edge_identity') or subject
                    if subject != '対象record':
                        break
            if tokens and tokens[-1] in ('identity', 'edge_identity', 'connection_identity', 'operation_identity', 'attempt_identity'):
                try:
                    baseline_record = resolve(baseline_packet, '/' + '/'.join(tokens[:-1]))
                    if isinstance(baseline_record, dict):
                        source_subject = baseline_record.get('edge_identity') or baseline_record.get('identity') or baseline_record.get('edge_target', {}).get('edge_identity')
                        if source_subject:
                            subject = source_subject
                except (KeyError, IndexError, TypeError, ValueError):
                    pass
            if subject == '対象record' and tokens and tokens[0] in ('original_stop', 'submitted_stop'):
                subject = '停止辺'
            field = tokens[-1] if tokens else 'record'
        difference = _semantic_difference(pointer, before, after)
        source_basis = {'source_ptr': pointer, 'subject': str(subject), 'field': field, 'difference': difference}

    if source_basis['difference'] == 'baseline_fixture':
        judgment = '宣言済み三辺の必要条件が揃う範囲でfixture correspondenceを示す。'
    elif source_basis['difference'] == 'business_not_accepted':
        judgment = '技術終端と業務未受入を分け、Acceptedを生成せず元ownerの判断を残す。'
    elif tag == 'F01':
        judgment = f"{source_basis['subject']}.{source_basis['field']}:{source_basis['difference']}。構成体をholdしterminal success不可。"
    elif tag == 'F02':
        judgment = f"{source_basis['subject']}.{source_basis['field']}:{source_basis['difference']}。停止位置・先行成功・未完・ownerを残し、後続未実行。"
    elif tag == 'N01':
        judgment = f"{source_basis['subject']}.{source_basis['field']}:{source_basis['difference']}。evidenceをholdしscope外挿・実作用なし。"
    else:
        judgment = f"{source_basis['subject']}.{source_basis['field']}:{source_basis['difference']}。元業務ownerへ返しAcceptedを生成しない。"
    return {'source_basis': source_basis, 'decision': judgment}


def has_fixture_hash_member(value) -> bool:
    if isinstance(value, dict):
        for key, child in value.items():
            lowered = key.lower()
            if 'sha256' in lowered or 'raw_sha' in lowered or lowered == 'hash':
                return True
            if has_fixture_hash_member(child):
                return True
    elif isinstance(value, list):
        return any(has_fixture_hash_member(child) for child in value)
    return False


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--record', action='store_true', help='create a new scaffold-only static evidence appendix')
    parser.add_argument('--record-path', help='new appendix path; must not already exist')
    args = parser.parse_args()
    current = load(L8)
    prior = base_load(L8)
    l5, l4, l9 = load(L5), load(L4), load(L9)
    l8_sha = sha((ROOT / L8).read_bytes())
    assert '固有の反例・期待判断' in current['method']['rule'] and 'patch path' not in current['method']['rule']
    assert 'op/path/value' in current['local_probe_contract']['expectation'] and 'L8へ戻さない' in current['local_probe_contract']['expectation']
    assert '基準revisionの旧記録' in current['local_probe_contract']['expectation']
    assert 'DT-VT-105' in current['local_probe_contract']['boundary'] and 'not_executed' in current['local_probe_contract']['boundary']
    assert 'source_ref values' not in current['common_expectation_boundary']['oracle_role']
    assert '短い反例・期待判断' in current['common_expectation_boundary']['oracle_role']
    assert '全返却期待' not in json.dumps(current['pure_primitive_cases'], ensure_ascii=False)
    assert isinstance(current['coverage_limit'], str) and '件' in current['coverage_limit'] and '未検証' in current['coverage_limit']
    assert 'coverage' not in current['l5_unit_traceability']['coverage_boundary']
    for derivation in current['l5_unit_traceability']['local_probe_rule_derivations']:
        assert '固定基準revision' in derivation['expected_delta_source']
        assert '未実行' in derivation['boundary'] and 'DT-VT-105' in derivation['boundary']
    head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    check_child_candidates = []
    for report_path in sorted((ROOT / CHECK_CHILD_DIR).glob('merge-overlay-check-child-*.json')):
        item = json.loads(report_path.read_text(encoding='utf-8'))
        if item.get('target_sha256') != l8_sha:
            continue
        candidate_revision = item.get('candidate_revision', '')
        is_ancestor = subprocess.run(['git', 'merge-base', '--is-ancestor', candidate_revision, head], cwd=ROOT, check=False).returncode == 0
        if not is_ancestor:
            continue
        distance = int(subprocess.check_output(['git', 'rev-list', '--count', f'{candidate_revision}..{head}'], cwd=ROOT, text=True))
        check_child_candidates.append((distance, report_path.relative_to(ROOT).as_posix(), item))
    assert check_child_candidates, 'checker evidence for current L8 must be based on a candidate revision in HEAD history'
    latest_distance = min(item[0] for item in check_child_candidates)
    latest_reports = [item for item in check_child_candidates if item[0] == latest_distance]
    assert len(latest_reports) == 1, 'latest candidate overlay checker evidence must be unique'
    _, check_child_path, check_child = latest_reports[0]
    raw_check_child_path = check_child.get('source_report_path')
    assert isinstance(raw_check_child_path, str) and raw_check_child_path.startswith(CHECK_CHILD_DIR + '/')
    raw_check_child = load(raw_check_child_path)
    assert check_child['schema'] == 'wr257-check-child-merge-overlay-evidence.v1'
    assert check_child['target_path'] == L8 and check_child['target_sha256'] == l8_sha
    assert check_child['checker_completed'] is True and check_child['crash_free'] is True
    assert check_child['checker_exit_code'] == 1 and check_child['overall_passed'] is False
    assert check_child['L8_ownership_cap_failure_count'] == 0
    assert [(item['layer'], item['passed'], item['failure_count']) for item in check_child['ownership_caps']] == [
        ('L4', True, 0), ('L9', False, 91), ('L5', True, 0), ('L8', True, 0),
    ]
    overlay_raw = subprocess.check_output(['git', 'show', f"{check_child['overlay_revision']}:{L8}"], cwd=ROOT)
    assert sha(overlay_raw) == check_child['target_sha256']
    candidate_raw = subprocess.check_output(['git', 'show', f"{check_child['candidate_revision']}:{L8}"], cwd=ROOT)
    assert sha(candidate_raw) == check_child['target_sha256']
    overlay_tree = subprocess.check_output(['git', 'show', '-s', '--format=%T', check_child['overlay_revision']], cwd=ROOT, text=True).strip()
    assert overlay_tree == check_child['overlay_tree']
    overlay_parents = subprocess.check_output(['git', 'rev-list', '--parents', '-n', '1', check_child['overlay_revision']], cwd=ROOT, text=True).strip().split()
    assert overlay_parents == [check_child['overlay_revision'], check_child['main_revision'], check_child['candidate_revision']]
    assert sha((ROOT / raw_check_child_path).read_bytes()) == check_child['source_report_sha256']
    checker_report = raw_check_child
    assert checker_report['passed'] is False
    assert [(item['layer'], item['passed'], len(item['failures'])) for item in checker_report['ownership_caps']] == [
        (item['layer'], item['passed'], item['failure_count']) for item in check_child['ownership_caps']
    ]
    pinned_docs = {L4: l4, L9: l9}
    pin_records = {item['path']: item for item in current['source_pair_pins']}

    case_columns = ['id', 'function_ref', 'requirement_ref', 'l4_ref', 'l9_ref', 'system_oracle_ref', 'source_packet_pointer', 'expected_oracle_pointer', 'scenario_basis', 'boundary', 'execution_state', 'qualification', 'u_id', 'l5_function_ref', 'l5_failure_rule_refs', 'expected']
    case_rows = []
    for case in current['cases']:
        packet_ref = case['source_packet_ref']
        case_rows.append([
            case['id'], case['function_ref'], case['requirement_ref'], case['l4_ref'], case['l9_ref'],
            case['system_oracle_ref'], packet_ref['pointer'] + packet_ref.get('raw_pointer_suffix', ''),
            case['expected_oracle_ref']['pointer'], case['scenario_basis'], case['boundary'],
            case['execution_state'], case['qualification'], case['u_id'], case['l5_function_ref'],
            case['l5_failure_rule_refs'], case['expected'],
        ])
    local_probes = current['local_probes']
    assert isinstance(current['cases'], list)
    assert len(case_rows) == len(prior['cases']) == 91
    assert isinstance(local_probes, list) and len(local_probes) == len(prior['local_probes']) == 27
    assert len(current['local_probe_source_reuse']) == len(prior['local_probe_source_reuse']) == 1
    assert len(current['pure_primitive_cases']) == len(prior['pure_primitive_cases']) == 7
    assert len(current['typed_carrier_boundary_cases']) == len(prior['typed_carrier_boundary_cases']) == 1
    assert sum(current['preserved_inventory'][key] for key in ('source_cases', 'local_probes', 'local_probe_source_reuse', 'pure_primitive_cases', 'typed_carrier_boundary_cases')) == 127
    assert [row[0] for row in case_rows] == [row['id'] for row in prior['cases']]
    assert [row['id'] for row in local_probes] == [row['id'] for row in prior['local_probes']]
    assert [row['id'] for row in current['pure_primitive_cases']] == [row['id'] for row in prior['pure_primitive_cases']]
    assert [row['id'] for row in current['typed_carrier_boundary_cases']] == [row['id'] for row in prior['typed_carrier_boundary_cases']]

    l9_by_id = {case['id']: (oi, ci, case) for oi, ob in enumerate(l9['verification_obligations']) for ci, case in enumerate(ob['concrete_cases'])}
    baseline_packet_by_tag = {
        ob['id'].rsplit('-', 1)[1]: json.loads(ob['concrete_cases'][0]['independent_source_packet']['raw_utf8'])
        for ob in l9['verification_obligations']
    }
    cix = {name: i for i, name in enumerate(case_columns)}
    assert case_columns[-4:] == ['u_id', 'l5_function_ref', 'l5_failure_rule_refs', 'expected']
    duplicate_expectation_groups = {}
    for row in case_rows:
        cid, role, req, l4_ref, l9_ref, oracle, source_ptr, expected_ptr, basis, boundary, state, qualification = row[:12]
        oi, ci, source_case = l9_by_id[cid]
        assert source_ptr == f'/verification_obligations/{oi}/concrete_cases/{ci}/independent_source_packet/raw_utf8'
        assert expected_ptr == f'/verification_obligations/{oi}/concrete_cases/{ci}/expected_material'
        assert resolve(l9, source_ptr) == source_case['independent_source_packet']['raw_utf8']
        assert resolve(l9, expected_ptr) == source_case['expected_material']
        assert basis == source_case['basis']
        assert role in {fn['id'] for fn in l5['algorithms']}
        assert state == 'not_executed' and qualification == 'synthetic_fixture_only'

    trace = current['l5_unit_traceability']
    trace_pins = {item['path']: item for item in trace['source_pins']}
    assert set(trace_pins) == {L3F, L10F, L3B, L10B, L4, L5, L9}
    for path, pin in trace_pins.items():
        assert sha(subprocess.check_output(['git', 'show', f"{pin['revision']}:{path}"], cwd=ROOT)) == pin['sha256']
    l5pin, l9pin = trace_pins[L5], trace_pins[L9]
    assert sha((ROOT / L5).read_bytes()) == l5pin['sha256']
    assert sha((ROOT / L9).read_bytes()) == l9pin['sha256']
    function_refs = {item['id'] for item in l5['pure_signatures']}
    assert len(trace['l5_public_functions']) == len(function_refs) == 4
    rows_by_uid = {}
    branch_case_ids = []
    expected_class_counts = {'normal': 0, 'negative': 0}
    for row in case_rows:
        uid, fn, rule_refs, expected = row[-4:]
        assert uid.startswith('U-C007-') and uid not in rows_by_uid
        assert fn in function_refs
        rows_by_uid[uid] = row
        derived = derive_case_expectation(row[0], fn, rule_refs, row[8], l5)
        assert set(expected) == set(derived) | {'source_basis', 'decision'}
        assert expected == {**derived, 'source_basis': expected.get('source_basis'), 'decision': expected.get('decision')}
        _, _, source_case = l9_by_id[row[0]]
        packet = json.loads(source_case['independent_source_packet']['raw_utf8'])
        focus = derive_case_focus(row[0], row[0].split('-')[1], packet,
                                  baseline_packet_by_tag[row[0].split('-')[1]], rule_refs, l5)
        assert expected['source_basis'] == focus['source_basis']
        assert expected['decision'] == focus['decision']
        assert len(expected['decision']) <= 180
        basis = expected['source_basis']
        assert set(basis) == {'source_ptr', 'subject', 'field', 'difference'}
        assert all(isinstance(value, str) for value in basis.values())
        assert all(len(basis[key]) <= limit for key, limit in (('source_ptr', 180), ('subject', 80), ('field', 80), ('difference', 40)))
        assert basis['difference'] in {
            'baseline_fixture', 'stale_middle_stop', 'business_not_accepted', 'missing_receipt',
            'duplicate_receipt', 'unexpected_receipt', 'missing_evidence', 'unexpected_evidence',
            'edge_definition_missing', 'unexpected_edge_definition', 'unselected_requirement_added',
            'required_contract_removed', 'unselected_connection_added', 'selected_connection_removed',
            'trace_entry_erased', 'order_reversed', 'unsupported_claim_asserted',
            'unsupported_claim_changed', 'target_missing', 'foreign_target', 'registration_unknown',
            'compatibility_stale', 'expiry_invalid', 'permission_revoked', 'result_partial',
            'receiver_effect_unobserved', 'observation_not_executed', 'operation_mapping_missing',
            'operation_mapping_foreign', 'unauthorized_attempt_present', 'field_changed',
            'failure_cause_timeout', 'failure_cause_digest_conflict', 'failure_cause_expiry',
            'failure_cause_cancelled', 'failure_cause_permission_revoked',
            'failure_cause_partial_success', 'failure_cause_unknown', 'failure_cause_changed',
            'business_owner_overridden', 'business_state_overridden',
            'business_requirement_adoption_overridden', 'business_acceptance_ref_overridden',
            'item_missing', 'item_added',
        }
        try:
            resolve(packet, basis['source_ptr'])
        except (KeyError, IndexError, TypeError, ValueError):
            raise AssertionError((row[0], basis['source_ptr']))
        assert 'findings' not in expected
        rule_objects = l5['contract_views'][row[0].split('-')[1]]['failure_rules']
        assert '|' not in expected['decision'] and '@' not in expected['decision']
        assert not any(rule.get('owner_route') and rule['owner_route'] in expected['decision'] for rule in rule_objects)
        assert expected['scenario_class'] in expected_class_counts
        expected_class_counts[expected['scenario_class']] += 1
        assert expected['verification_status'] == 'unverified'
        assert expected['l5_refs']
        assert all(resolve(l5, pointer) is not None for pointer in expected['l5_refs'])
        assert expected['verification_status'] == 'unverified'
        branch_case_ids.append(row[0])
        group_key = (row[8], historical_expectation_group_key(row[0], derived, rule_refs, l5))
        duplicate_expectation_groups.setdefault(group_key, []).append((row[0], focus))
        tag = row[0].split('-')[1]
        ob_index = next(i for i, ob in enumerate(l9['verification_obligations']) if ob['id'].endswith('-' + tag))
        case_index = next(i for i, c in enumerate(l9['verification_obligations'][ob_index]['concrete_cases']) if c['id'] == row[0])
        assert resolve(l9, f'/verification_obligations/{ob_index}/concrete_cases/{case_index}')['id'] == row[0]
        exact_areas = {reason.get('area', '') for reason in resolve(l9, f'/verification_obligations/{ob_index}/concrete_cases/{case_index}/expected_material/failure_reasons')}
        expected_rule_refs = []
        for rule in l5['contract_views'][tag]['failure_rules']:
            prefix = rule.get('area', '').split('{', 1)[0]
            if any(area.startswith(prefix) for area in exact_areas):
                expected_rule_refs.append(f'{tag}:{rule["id"]}')
        assert rule_refs == expected_rule_refs, row[0]
    assert len(set(branch_case_ids)) == 91
    assert expected_class_counts == {'normal': 3, 'negative': 88}
    duplicated_groups = [group for group in duplicate_expectation_groups.values() if len(group) > 1]
    assert len(duplicated_groups) == 11 and sum(len(group) for group in duplicated_groups) == 60
    for group in duplicated_groups:
        assert len({json.dumps(focus['source_basis'], ensure_ascii=False, sort_keys=True) for _, focus in group}) == len(group)
        assert len({focus['decision'] for _, focus in group}) == len(group)
    declared_rules = {(tag, rule['id']) for tag, view in l5['contract_views'].items() for rule in view['failure_rules']}
    assert len(declared_rules) == 26
    seen_rules = set()
    for function in trace['l5_public_functions']:
        fn = function['function_ref']
        assert fn in function_refs
        assert resolve(l5, function['source_ref']['pointer'])['id'] == fn
        assert resolve(l5, function['algorithm_ref']['pointer'])['id'] == fn
        assert len(function['case_u_ids']) > 0
        assert all(rows_by_uid[uid][-3] == fn for uid in function['case_u_ids'])
        assert len(function['case_u_ids']) == len(set(function['case_u_ids']))
    for rule in trace['l5_failure_rules']:
        tag_rule = (rule['source_ref']['pointer'].split('/')[2], rule['rule_id'])
        assert tag_rule in declared_rules and tag_rule not in seen_rules
        seen_rules.add(tag_rule)
        source = resolve(l5, rule['source_ref']['pointer'])
        assert source['id'] == rule['rule_id']
        assert rule['function_ref'] == f'FN-C007-{["F01","F02","N01","B01"].index(tag_rule[0])+1:02d}'
        for uid in rule['case_u_ids']:
            assert uid in rows_by_uid and f'{tag_rule[0]}:{rule["rule_id"]}' in rows_by_uid[uid][-2]
    assert seen_rules == declared_rules
    assert len(trace['l9_basic_branches']) == 91
    for branch in trace['l9_basic_branches']:
        assert branch['u_id'] in rows_by_uid and rows_by_uid[branch['u_id']][0] == branch['source_case_id']
        assert resolve(l9, branch['source_ref']['pointer'])['id'] == branch['source_case_id']
        assert branch['execution_state'] == 'not_executed' and branch['fixture_only'] is True

    assert set(PROBE_EXPECTATIONS) == {item['id'] for item in local_probes}
    assert len({item['u_id'] for item in local_probes}) == 27
    local_probe_uid_by_id = {}
    local_rule_uids = {}
    local_probe_by_id = {item['id']: item for item in local_probes}
    for item, source in zip(local_probes, prior['local_probes']):
        assert item['role_id'] == source['function_ref']
        assert item['source_case_id'] == source.get('source_case_id')
        assert item['counterexample'], item['id']
        assert item['expected_judgment'], item['id']
        assert (item['counterexample'], item['expected_judgment']) == PROBE_EXPECTATIONS[item['id']]
        oi, ci, _ = l9_by_id[item['source_case_id']]
        assert item['source_packet_pointer'] == f'/verification_obligations/{oi}/concrete_cases/{ci}/independent_source_packet/raw_utf8'
        assert item['boundary'] == 'synthetic local mutation only; qualification/effect unestablished'
        assert item['execution_state'] == 'not_executed'
        assert item['u_id'].startswith('U-C007-LP-')
        assert not any(key in item for key in ('expected_delta', 'input_patch', 'input_patch_paths', 'baseline_expected_pointer'))
        def expand(value):
            if isinstance(value, dict) and set(value) == {'source_ref'}:
                ref = value['source_ref']
                record = pin_records[ref['path']]
                assert ref['revision'] == record['revision']
                assert sha(subprocess.check_output(['git', 'show', f"{ref['revision']}:{ref['path']}"], cwd=ROOT)) == record['sha256']
                return resolve(pinned_docs[ref['path']], ref['pointer'])
            if isinstance(value, dict):
                return {key: expand(child) for key, child in value.items()}
            if isinstance(value, list):
                return [expand(child) for child in value]
            return value
        historical_delta = expand(source.get('expected_delta_from_source_oracle', []))
        assert historical_delta and all(isinstance(change, dict) and {'op', 'path'} <= set(change) for change in historical_delta)
        local_probe_uid_by_id[item['id']] = item['u_id']
        tag = item['id'].split('-')[2]
        reasons = []
        for change in historical_delta:
            if change['path'] == '/failure_reasons' and isinstance(change.get('value'), list):
                reasons = change['value']
        for rule in l5['contract_views'][tag]['failure_rules']:
            prefix = rule.get('area', '').split('{', 1)[0]
            if any(reason.get('area', '').startswith(prefix) for reason in reasons):
                local_rule_uids.setdefault((tag, rule['id']), []).append(item['u_id'])

    assert len(local_probe_uid_by_id) == 27
    function_by_id = {item['function_ref']: item for item in trace['l5_public_functions']}
    for fn, function in function_by_id.items():
        expected_local_uids = [item['u_id'] for item in local_probes if item['role_id'] == fn]
        assert function['local_probe_u_ids'] == expected_local_uids
    for rule in trace['l5_failure_rules']:
        tag = rule['source_ref']['pointer'].split('/')[2]
        key = (tag, rule['rule_id'])
        ids = [item['id'] for item in local_probes if item['u_id'] in local_rule_uids.get(key, [])]
        assert rule['local_probe_u_ids'] == local_rule_uids.get(key, [])
        assert rule['local_probe_ids'] == ids
        if rule['case_u_ids'] and rule['local_probe_u_ids']:
            expected_status = 'l9_and_local_probe_witnessed'
        elif rule['case_u_ids']:
            expected_status = 'l9_oracle_witnessed'
        elif rule['local_probe_u_ids']:
            expected_status = 'local_probe_witnessed'
        else:
            expected_status = 'uncovered'
        assert rule['coverage_status'] == expected_status, key
    assert all(rule['coverage_status'] != 'uncovered' for rule in trace['l5_failure_rules'])
    assert len(trace['l5_failure_rules']) == 26
    assert trace['local_probe_rule_derivations']
    expected_derivation_sources = {
        'F02:stop_position': [(L3F, '/requirements/14'), (L10F, '/cases/14'), (L4, '/contracts/1'), (L5, '/contract_views/F02/failure_rules/7')],
        'B01:technical_content': [(L3B, '/requirements/1'), (L10B, '/cases/1'), (L4, '/contracts/3'), (L5, '/contract_views/B01/failure_rules/0')],
    }
    for derivation in trace['local_probe_rule_derivations']:
        assert all(pid in local_probe_uid_by_id for pid in derivation['local_probe_ids'])
        assert derivation['local_probe_u_ids'] == [local_probe_uid_by_id[pid] for pid in derivation['local_probe_ids']]
        assert all(resolve(load(ref['path']), ref['pointer']) is not None for ref in derivation['basis_refs'])
        assert [(ref['path'], ref['pointer']) for ref in derivation['basis_refs']] == expected_derivation_sources[derivation['rule_ref']]
        expected_source_ids = {
            'F02:stop_position': [
                'HELIXCONNECT-L3-007-F02', 'HELIXCONNECT-L10-007-F02',
                'HELIXCONNECT-L4-007-F02', 'stop_position'],
            'B01:technical_content': [
                'HELIXCONNECT-L3-007-B01', 'HELIXCONNECT-L10-007-B01',
                'HELIXCONNECT-L4-007-B01', 'technical_content'],
        }[derivation['rule_ref']]
        assert [resolve(load(ref['path']), ref['pointer']).get('id') for ref in derivation['basis_refs']] == expected_source_ids
        expected_rows = local_probe_by_id
        if derivation['rule_ref'] == 'F02:stop_position':
            result_by_probe = {}
            for pid in derivation['local_probe_ids']:
                probe = expected_rows[pid]
                source = next(row for row in prior['local_probes'] if row['id'] == pid)
                delta = expand(source.get('expected_delta_from_source_oracle', []))
                reasons = next(change['value'] for change in delta if change['path'] == '/failure_reasons')
                assert len(reasons) == 1 and reasons[0]['area'] == 'stop_position' and reasons[0]['return_owner'] == 'composite-owner'
                result_by_probe[pid] = reasons[0]['result']
            assert set(result_by_probe.values()) == {'missing', 'ambiguous_duplicate_not_compared'}
        elif derivation['rule_ref'] == 'B01:technical_content':
            probe = expected_rows[derivation['local_probe_ids'][0]]
            source = next(row for row in prior['local_probes'] if row['id'] == derivation['local_probe_ids'][0])
            delta = expand(source.get('expected_delta_from_source_oracle', []))
            reason = next(change['value'] for change in delta if change['path'] == '/failure_reasons')[0]
            assert (reason['area'], reason['field'], reason['result'], reason['return_owner']) == ('technical_content', 'record', 'content_conflict', 'composite-owner')

    assert 'unit_case_refs' not in json.dumps(l5, ensure_ascii=False)
    assert current['traceability_boundary']['l5_unit_case_refs'] == 'absent_in_source_document'
    assert set(current['removed_materials']) == {'decision_ref', 'git_commit', 'path', 'meaning', 'removed_key_rule', 'use_boundary'}
    assert 'DT-VT-105' in current['removed_materials']['use_boundary']
    assert not has_fixture_hash_member(current['cases'])
    assert not has_fixture_hash_member(local_probes)
    assert not has_fixture_hash_member(current['local_probe_source_reuse'])
    assert not has_fixture_hash_member(current['pure_primitive_cases'])
    assert not has_fixture_hash_member(current['typed_carrier_boundary_cases'])

    assert sha((ROOT / L4).read_bytes()) == current['source_pair_pins'][0]['sha256']
    assert sha((ROOT / L9).read_bytes()) == current['preserved_l9_oracle']['sha256']
    assert sha((ROOT / L5).read_bytes()) == current['candidate_design_binding']['sha256_of_saved_file_bytes']
    payload = {
        'schema': 'wr257-static-index-evidence.v1',
        'evidence_kind': 'scaffold',
        'authority_effect': 'none',
        'request_id': 'WR257-CONNECT-COMPOSITE-L8-SLIM',
        'base_revision': BASE,
        'target_path': L8,
        'target_sha256': sha((ROOT / L8).read_bytes()),
        'target_bytes': (ROOT / L8).stat().st_size,
        'source_pins': {
            L4: current['source_pair_pins'][0]['sha256'],
            L5: current['candidate_design_binding']['sha256_of_saved_file_bytes'],
            L9: current['preserved_l9_oracle']['sha256'],
        },
        'traceability_source_pins': {path: pin['sha256'] for path, pin in trace_pins.items()},
        'inventory': current['preserved_inventory'],
        'l5_traceability': {
            'public_functions': len(trace['l5_public_functions']),
            'l9_branch_u_ids': len(trace['l9_basic_branches']),
            'predeclared_local_probe_u_ids': len(local_probes),
            'failure_rules': len(trace['l5_failure_rules']),
            'covered_failure_rules': sum(rule['coverage_status'] != 'uncovered' for rule in trace['l5_failure_rules']),
            'case_expected_classes': expected_class_counts,
            'case_focus_rows': len(case_rows),
            'distinguished_duplicate_groups': len(duplicated_groups),
            'distinguished_duplicate_rows': sum(len(group) for group in duplicated_groups),
            'uncovered_failure_rules': [f"{rule['function_ref']}:{rule['rule_id']}" for rule in trace['l5_failure_rules'] if rule['coverage_status'] == 'uncovered'],
        },
        'merge_overlay_check_child': {
            'main_revision': check_child['main_revision'],
            'overlay_revision': check_child['overlay_revision'],
            'candidate_revision': check_child['candidate_revision'],
            'target_sha256': check_child['target_sha256'],
            'checker_completed': check_child['checker_completed'],
            'crash_free': check_child['crash_free'],
            'exit_code': check_child['checker_exit_code'],
            'overall_passed': check_child['overall_passed'],
            'L8_ownership_cap_failure_count': check_child['L8_ownership_cap_failure_count'],
            'ownership_caps': check_child['ownership_caps'],
            'other_residuals': check_child['remaining_checker_findings'],
        },
        'checks': [
            'all prior L8 source case IDs and order retained in a consumer-compatible array; exact L9 source/expected pointers and scenario basis resolve',
            'all 27 local probe IDs/roles/source cases retain unique short counterexample and expected judgment; fixed historical delta comparison supports rule coverage without embedding patch recipes or return values',
            '1 source reuse, 7 primitive cases and 1 typed carrier boundary retain identity and intended oracle boundary',
            '91 L9 branches and 27 predeclared local probes carry U-IDs without changing the 127 declaration count; each branch row has a short L5-derived expected decision, L5 citation, normal/negative class, and unverified state (3 normal, 88 negative)',
            'all 91 branch expectations retain only source pointer, target, field and a bounded semantic difference category; 11 previously identical groups (60 rows) are distinguished without before/after values, full arrays or repeated L5 rule prose',
            'all four L5 public functions map by exact source refs; all 26 L5 failure rules are covered by fixed L9 oracle branches and/or predeclared local expected deltas',
            'L5 has no unit_case_refs; absence is recorded without synthetic references',
            'fixture hashes are absent from case/probe inventories; retained digests are source/authority pins',
            'removed_materials has six required keys and names DT-VT-105 boundary',
            'merge-overlay check-child completed without crash and L8 ownership cap has zero failures; unrelated L9/pair/four-way failures remain reported',
        ],
        'not_established': ['product test execution', 'runtime behavior', 'source/owner qualification', 'L7 test citation', 'design or implementation readiness', 'full mutation-family coverage'],
    }
    if args.record:
        target_hash = payload['target_sha256']
        output = args.record_path or f'{EVIDENCE_DIR}/static-evidence-measurement-{target_hash[:12]}.json'
        if output == EVIDENCE:
            raise SystemExit('refusing to overwrite the initial static-evidence.json; choose a new appendix path')
        out_path = (ROOT / output).resolve()
        out_path.relative_to((ROOT / EVIDENCE_DIR).resolve())
        wrapper = {
            'schema': 'wr257-static-evidence-appendix.v1',
            'evidence_kind': 'scaffold',
            'authority_effect': 'none',
            'recorded_against_revision': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
            'source_path': L8,
            'target_sha256': target_hash,
            'payload': payload,
        }
        wrapper['appendix_sha256'] = sha(json.dumps(wrapper, ensure_ascii=False, sort_keys=True).encode('utf-8'))
        out_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with out_path.open('x', encoding='utf-8') as handle:
                handle.write(json.dumps(wrapper, ensure_ascii=False, indent=2) + '\n')
        except FileExistsError as error:
            raise SystemExit(f'refusing to overwrite existing evidence appendix: {output}') from error
        payload['recorded_appendix'] = output
    else:
        binding = load(BINDING)
        assert check_child_path in binding.get('artifacts', [])
        assert raw_check_child_path in binding.get('artifacts', [])
        measurement_paths = [path for path in binding.get('artifacts', []) if 'static-evidence-measurement-' in path]
        matching = [(path, load(path)) for path in measurement_paths if load(path).get('target_sha256') == payload['target_sha256']]
        assert matching, 'binding must point to a measurement appendix for the current L8 bytes'
        head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
        applicable = []
        for path, item in matching:
            revision = item.get('recorded_against_revision', '')
            is_ancestor = subprocess.run(['git', 'merge-base', '--is-ancestor', revision, head], cwd=ROOT, check=False).returncode == 0
            if is_ancestor:
                distance = int(subprocess.check_output(['git', 'rev-list', '--count', f'{revision}..{head}'], cwd=ROOT, text=True))
                applicable.append((distance, path, item))
        if applicable:
            latest_distance = min(item[0] for item in applicable)
            latest = [(path, item) for distance, path, item in applicable if distance == latest_distance]
            assert len(latest) == 1, 'matching appendices at the same latest revision distance must be unique'
            latest_path, appendix = latest[0]
        else:
            assert len(matching) == 1, 'multiple matching appendices require an ancestor measurement for current HEAD'
            latest_path, appendix = matching[0]
        assert appendix['schema'] == 'wr257-static-evidence-appendix.v1'
        appendix_body = dict(appendix)
        recorded_appendix_hash = appendix_body.pop('appendix_sha256')
        assert sha(json.dumps(appendix_body, ensure_ascii=False, sort_keys=True).encode('utf-8')) == recorded_appendix_hash
        assert appendix['target_sha256'] == payload['target_sha256']
        assert appendix['payload'] == payload
        payload['compared_appendix'] = latest_path
    print(json.dumps(payload, ensure_ascii=False, sort_keys=True))


if __name__ == '__main__':
    main()
