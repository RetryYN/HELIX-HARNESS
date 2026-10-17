"""R8 fn0 finite declaration calculation; immutable carrier argument only, stdlib, no IO.
Source: R8 local L5 53847c13831789f859929f93857d51c9c58531f925c2b3e76f96bf6a95a2587c.
This is a scratch design calculation, not product runtime. No oracle/fixture dependency.
"""
import copy
import hashlib
import json
import re

REF_FIELDS = ('identity', 'revision', 'scope', 'owner', 'sha256')
OLD_ROLES = ('owner_basis_source', 'rule_source', 'applicability_source', 'scope_source',
             'oracle_source', 'relation_source', 'root', 'qualification')
TARGET_ROLES = ('target_read', 'target_qualification', 'target_root')
STATES = ('valid', 'missing', 'unknown', 'stale', 'conflict')
KINDS = ('scope', 'rule', 'target_set', 'lookup', 'identity_result', 'receipt',
         'os_outcome', 'receipt_binding', 'budget', 'oracle')
UNKNOWN_CODES = frozenset(('schema_invalid', 'required_missing', 'resolution_unknown',
                           'target_missing', 'budget_unknown', 'resource_limit'))
RULE_ENUMS = {
    'algorithm': ('decimal_json_v1', 'binary64_jcs_v1'),
    'number_semantics': ('exact_decimal', 'ieee754_binary64'),
    'zero_semantics': ('unsigned', 'signed'), 'object_order': ('unordered_utf16',),
    'array_order': ('ordered',), 'string_semantics': ('unicode_scalar_exact',),
    'payload_domain': ('json_whole_value',), 'projection': ('none',),
    'binary64_rounding': ('nearest_even', 'not_applicable'),
}
LIMIT_FIELDS = ('input_bytes_limit', 'json_depth_limit', 'json_node_limit',
                'number_token_chars_limit', 'output_bytes_limit')
ABSENT = object()


class SourceContractBoundary(Exception):
    """Unspecified/outside supplied finite source boundary; never a fabricated ValueResult."""


def text(v):
    return (type(v) is str and bool(v) and v not in ('*', 'latest')
            and not any(0xD800 <= ord(c) <= 0xDFFF for c in v))


def sha_hex(v):
    return type(v) is str and re.fullmatch('[0-9a-f]{64}', v) is not None


def is_ref(v):
    return (type(v) is dict and set(v) == set(REF_FIELDS)
            and all(text(v[k]) for k in REF_FIELDS[:-1]) and sha_hex(v['sha256']))


def ref_key(v):
    if not is_ref(v):
        raise SourceContractBoundary('closed Ref required before Ref-key conversion')
    return tuple(v[k] for k in REF_FIELDS)


def is_locator(v):
    return (type(v) is dict and set(v) == set(REF_FIELDS[:-1])
            and all(text(v[k]) for k in REF_FIELDS[:-1]))


def sequence(v):
    return type(v) in (tuple, list)


def same(a, b):
    """Logical type/presence-sensitive recursive equality, with native sequences as tuples."""
    if a is ABSENT or b is ABSENT:
        return a is b
    if sequence(a) or sequence(b):
        return (sequence(a) and sequence(b) and len(a) == len(b)
                and all(same(x, y) for x, y in zip(a, b)))
    if type(a) is not type(b):
        return False
    if type(a) is dict:
        return a.keys() == b.keys() and all(same(a[k], b[k]) for k in a)
    return a == b


def refs_sorted(values):
    unique = {}
    for v in values:
        if is_ref(v):
            unique.setdefault(ref_key(v), v)
    return tuple(copy.deepcopy(unique[k]) for k in sorted(unique))


def token(v):
    return str(v).replace('~', '~0').replace('/', '~1')


def read(v, path):
    if path == '':
        return v
    for part in path.split('/')[1:]:
        part = part.replace('~1', '/').replace('~0', '~')
        if type(v) is dict:
            v = v[part] if part in v else ABSENT
        elif sequence(v) and part.isdigit() and int(part) < len(v):
            v = v[int(part)]
        else:
            return ABSENT
        if v is ABSENT:
            return ABSENT
    return v


def record_errors(v, checks, path):
    if type(v) is not dict:
        return (path,)
    errors = []
    for k in sorted(set(checks) | set(v)):
        p = path + '/' + token(k)
        if k not in checks or k not in v or not checks[k](v[k]):
            errors.append(p)
    return tuple(errors)


def base(v):
    return not record_errors(v, {'asset_id': text,
                                'expected_ref': lambda x: x is None or is_ref(x)}, '')


def bases(v):
    return sequence(v) and all(base(x) for x in v)


def positive_safe(v):
    return type(v) is int and 1 <= v <= 2**53 - 1


def body_checks(role):
    if role == 'owner_basis_source':
        return {'schema': lambda x: x == 'harness052-owner-basis-read.v1', 'owner_ref': is_ref}
    if role == 'applicability_source':
        return {'schema': lambda x: x == 'harness052-scope-rule-applicability-read.v1',
                'scope_locator': is_locator, 'normalization_rule_ref': is_ref, 'owner_ref': is_ref}
    if role == 'scope_source':
        return {'owner_ref': is_ref, 'applicability_ref': is_ref}
    if role == 'rule_source':
        checks = {k: (lambda x, values=values: type(x) is str and x in values)
                  for k, values in RULE_ENUMS.items()}
        checks.update(algorithm_contract_revision=text, owner_basis_ref=is_ref)
        return checks
    if role == 'oracle_source':
        return {'scope_ref': is_ref, 'requirement_parent': text}
    if role == 'relation_source':
        return {k: is_ref for k in ('scope_ref', 'normalization_rule_ref', 'oracle_ref', 'owner_ref')}
    if role in ('root', 'target_root'):
        return {'owner_ref': is_ref, 'allowed_subject_ref': is_ref,
                'allowed_source_ref': is_ref, 'allowed_source_sha256': sha_hex}
    if role in ('qualification', 'target_qualification'):
        return {'root_ref': is_ref, 'source_ref': is_ref, 'owner_ref': is_ref,
                'subject_ref': is_ref, 'source_sha256': sha_hex}
    if role == 'target_read':
        return {'scope_ref': is_ref, 'required_bases': bases,
                'source_refs': lambda x: sequence(x) and all(is_ref(r) for r in x)}
    if role == 'budget':
        checks = {k: positive_safe for k in LIMIT_FIELDS}
        checks.update(subject_scope_ref=is_ref, source_ref=is_ref)
        return checks
    raise SourceContractBoundary('no raw projection declared for role ' + str(role))


def projected_checks(kind):
    """The five supplied native Resolution.value types; no snapshot reconstruction."""
    role = {'scope': 'scope_source', 'rule': 'rule_source', 'oracle': 'oracle_source',
            'target_set': 'target_read', 'budget': 'budget'}.get(kind)
    if role is None:
        raise SourceContractBoundary('additional kind needs its declared closed read: ' + str(kind))
    checks = body_checks(role)
    if kind == 'scope':
        checks.update(scope_ref=is_ref, normalization_rule_ref=is_ref)
    elif kind == 'rule':
        checks.update(rule_ref=is_ref, applicable_scope_ref=is_ref)
    elif kind == 'oracle':
        checks.update(oracle_ref=is_ref)
    elif kind == 'budget':
        checks.update(budget_ref=is_ref)
    return checks


def strict_decode(raw):
    def pairs(items):
        out = {}
        for k, v in items:
            if k in out:
                raise ValueError('duplicate JSON member')
            out[k] = v
        return out

    def scalar_tree(v):
        if type(v) is str and any(0xD800 <= ord(c) <= 0xDFFF for c in v):
            raise ValueError('surrogate scalar')
        if type(v) is dict:
            for k, val in v.items():
                scalar_tree(k)
                scalar_tree(val)
        elif type(v) is list:
            for val in v:
                scalar_tree(val)

    def bad_constant(_):
        raise ValueError('non-JSON constant')
    value = json.loads(raw.decode('utf-8', errors='strict'), object_pairs_hook=pairs,
                       parse_constant=bad_constant)
    scalar_tree(value)
    return value


def validate_command_input(carrier):
    """Only input argument is read; all local causes and returned values are newly constructed."""
    command = read(carrier, '/command_input')
    scope = read(command, '/scope_ref')
    # Source anchor precondition does not define fabricated Backflow for a malformed anchor.
    if not all(is_ref(read(command, '/' + k)) for k in ('scope_ref', 'rule_ref', 'oracle_ref')):
        raise SourceContractBoundary('fn0 anchor precondition: original scope/rule/oracle Ref')
    causes = []
    observations = {}
    supplied_roles = read(carrier, '/source_projection_inputs')
    original_resolutions = read(command, '/resolutions')
    byte_map = read(carrier, '/resolution_content_bytes')

    def emit(code, path, member, left=ABSENT, right=ABSENT, unresolved=(), resolution=False):
        if resolution:
            source = read(carrier, member)
            subject = read(source, '/ref')
            selector = read(carrier, '/source_projection_inputs/target_read/source_ref')
            basis = [subject, selector, scope]
        else:
            source = read(supplied_roles, '/' + member)
            subject = read(source, '/source_ref')
            basis = [scope]
        if is_ref(left):
            basis.append(left)
        if is_ref(right):
            basis.append(right)
        obs = read(source, '/qualification_observation/NotEstablished/reason_ref')
        if is_ref(obs):
            basis.append(obs)
        owner = read(subject, '/owner')
        finding = {'code': code, 'field_pointer': path,
                   'subject_ref': copy.deepcopy(subject) if is_ref(subject) else None,
                   'basis_refs': refs_sorted(basis),
                   'owner': owner if text(owner) else scope['owner'], 'result_field': 'semantic'}
        causes.append({'finding': finding, 'source_member': member,
                       'left_operand': copy.deepcopy(left) if left is not ABSENT else ABSENT,
                       'right_operand': copy.deepcopy(right) if right is not ABSENT else ABSENT,
                       'unresolved_refs': tuple(copy.deepcopy(x) for x in unresolved if is_ref(x)),
                       # No public Difference axis is synthesized for raw/source discrepancies.
                       'difference': None if left is ABSENT or right is ABSENT else (left, right)})

    def direct_unknown(source):
        r = read(source, '/source_ref')
        return (r,) if is_ref(r) else ()

    # Phase carrier and CommandInput syntax. These finite inputs have valid anchors.
    for p in record_errors(carrier, {'command_input': lambda x: type(x) is dict,
                                    'resolution_content_bytes': lambda x: type(x) is dict,
                                    'source_projection_inputs': lambda x: type(x) is dict}, ''):
        emit('schema_invalid', p, '', carrier)
    command_checks = {'command_id': text, 'scope_ref': is_ref, 'bases': bases, 'rule_ref': is_ref,
                      'raw_payload_bytes': lambda x: type(x) is bytes,
                      'claimed_payload_digest': lambda x: x is None or (type(x) is str and
                          re.fullmatch('sha256:[0-9a-f]{64}', x) is not None),
                      'oracle_ref': is_ref, 'resolutions': sequence, 'budget_ref': is_ref}
    for p in record_errors(command, command_checks, '/command_input'):
        emit('schema_invalid', p, '', command)
    if type(supplied_roles) is not dict or not sequence(original_resolutions) or type(byte_map) is not dict:
        raise SourceContractBoundary('outside finite carrier: container-level full diagnostic binding')
    for k in sorted(set(supplied_roles) - set(OLD_ROLES + TARGET_ROLES)):
        emit('schema_invalid', '/source_projection_inputs/' + token(k), k, supplied_roles)

    # Phase raw observations. An incomplete source never resolves through an authoring graph.
    for role in OLD_ROLES + TARGET_ROLES:
        p = '/source_projection_inputs/' + role
        source = read(supplied_roles, '/' + role)
        observation = {'address': read(source, '/source_ref'), 'raw': ABSENT, 'usable': False}
        observations[role] = observation
        if source is ABSENT or source is None:
            code = 'schema_invalid' if source is ABSENT and role in TARGET_ROLES else 'required_missing'
            emit(code, p, role, supplied_roles, unresolved=direct_unknown(source))
            continue
        if type(source) is not dict:
            emit('schema_invalid', p, role, source, unresolved=direct_unknown(source))
            continue
        required = {'source_ref', 'state', 'content_bytes', 'raw_body'}
        if role in ('qualification', 'target_qualification'):
            required.add('qualification_observation')
        missing = sorted(required - set(source))
        unknown = sorted(set(source) - required)
        for k in missing:
            emit('required_missing' if role in OLD_ROLES else 'schema_invalid', p + '/' + token(k),
                 role, source, unresolved=direct_unknown(source))
        for k in unknown:
            emit('schema_invalid', p + '/' + token(k), role, source, unresolved=direct_unknown(source))
        if 'source_ref' in source and not is_ref(source['source_ref']):
            emit('schema_invalid', p + '/source_ref', role, source['source_ref'])
        state = read(source, '/state')
        if state is not ABSENT and (type(state) is not str or state not in STATES):
            emit('schema_invalid', p + '/state', role, state, unresolved=direct_unknown(source))
        elif state in ('missing', 'unknown', 'stale', 'conflict'):
            code = 'reference_conflict' if state == 'conflict' else (
                'required_missing' if state == 'missing' and role == 'target_read' else 'resolution_unknown')
            emit(code, p + '/state', role, state,
                 unresolved=direct_unknown(source) if code in UNKNOWN_CODES else ())
        raw = read(source, '/raw_body')
        content = read(source, '/content_bytes')
        if state == 'valid':
            good = not missing and not unknown and is_ref(source.get('source_ref'))
            if content is not ABSENT and type(content) is not bytes:
                emit('schema_invalid', p + '/content_bytes', role, content, unresolved=direct_unknown(source))
                good = False
            if raw is not ABSENT:
                for bad in record_errors(raw, body_checks(role), p + '/raw_body'):
                    emit('schema_invalid', bad, role, raw, unresolved=direct_unknown(source))
                    good = False
            if type(content) is bytes:
                if is_ref(source.get('source_ref')) and hashlib.sha256(content).hexdigest() != source['source_ref']['sha256']:
                    emit('reference_conflict', p + '/content_bytes', role, content, source['source_ref'])
                    good = False
                try:
                    decoded = strict_decode(content)
                except (ValueError, UnicodeError, TypeError):
                    emit('schema_invalid', p + '/content_bytes', role, content,
                         unresolved=direct_unknown(source))
                    good = False
                else:
                    errors = record_errors(decoded, body_checks(role), p + '/raw_body')
                    for bad in errors:
                        emit('schema_invalid', bad, role, decoded, unresolved=direct_unknown(source))
                        good = False
                    if raw is not ABSENT and raw is not None and not errors and not same(decoded, raw):
                        emit('reference_conflict', p + '/raw_body', role, raw, decoded)
                        good = False
            else:
                good = False
            if good:
                observation.update(raw=raw, usable=True)
        elif state in STATES:
            # Nonvalid nullable bytes/body are not observed opposite values. Supplied invalid types remain causes.
            if content is not ABSENT and content is not None and type(content) is not bytes:
                emit('schema_invalid', p + '/content_bytes', role, content, unresolved=direct_unknown(source))
            if raw is not ABSENT and raw is not None:
                for bad in record_errors(raw, body_checks(role), p + '/raw_body'):
                    emit('schema_invalid', bad, role, raw, unresolved=direct_unknown(source))
        if 'qualification_observation' in source:
            qobs = source['qualification_observation']
            established = read(qobs, '/EstablishedEvidence/evidence_ref')
            reason = read(qobs, '/NotEstablished/reason_ref')
            if (type(qobs) is dict and set(qobs) == {'EstablishedEvidence'}
                    and not record_errors(qobs['EstablishedEvidence'], {'evidence_ref': is_ref}, '')):
                pass
            elif (type(qobs) is dict and set(qobs) == {'NotEstablished'}
                  and not record_errors(qobs['NotEstablished'], {'reason_ref': is_ref}, '')):
                emit('resolution_unknown', p + '/qualification_observation', role, reason,
                     unresolved=direct_unknown(source))
            elif qobs == 'Unassessed':
                emit('resolution_unknown', p + '/qualification_observation', role, qobs,
                     unresolved=direct_unknown(source))
            else:
                emit('schema_invalid', p + '/qualification_observation', role, qobs,
                     unresolved=direct_unknown(source))

    def operand(path):
        # Address fields survive unresolved qualifications; raw members require original source verification.
        if path.startswith('Locator4(') and path.endswith(')'):
            value = operand(path[9:-1])
            return {k: value[k] for k in REF_FIELDS[:-1]} if is_ref(value) else ABSENT
        if not path.startswith('/'):
            path = '/' + path.replace('.', '/')
        if path.startswith('/source_projection_inputs/'):
            parts = path.split('/')
            role = parts[2]
            if len(parts) > 3 and parts[3] == 'raw_body' and not observations[role]['usable']:
                return ABSENT
        return read(carrier, path)

    def do_join(row, verified_owner_sources=False):
        if verified_owner_sources:
            # R3 owner joins require both original source operands verified through bytes/body.
            # R7 target joins below deliberately keep their separately observable address operands.
            for path in (row['left'], row['right']):
                if path.startswith('Locator4(') and path.endswith(')'):
                    path = path[9:-1]
                path = path if path.startswith('/') else '/' + path.replace('.', '/')
                if path.startswith('/source_projection_inputs/'):
                    role = path.split('/')[2]
                    if not observations[role]['usable']:
                        return
        a = operand(row['left'])
        # The original Oracle parent join uses a literal, not a carrier path.
        b = row['right'] if row['right'] == 'HARNESS-L2-052' else operand(row['right'])
        op = row['operator']
        if a is ABSENT or b is ABSENT:
            return
        if op in ('ref_exact', 'Ref5_exact', 'full_ref_exact'):
            ready = is_ref(a) and is_ref(b)
        elif op in ('Locator4_exact',):
            ready = is_locator(a) and is_locator(b)
        elif op in ('sha256hex_exact',):
            ready = sha_hex(a) and sha_hex(b)
        elif op == 'Text_exact_no_coercion':
            ready = text(a) and text(b)
        else:
            raise SourceContractBoundary('undeclared join operator ' + str(op))
        if ready and not same(a, b):
            emit(row.get('finding_code', row.get('finding')), row['field_pointer'],
                 row['source_member'], a, b)

    # Owner source joins run in original table order. No extra chain evaluation or wildcard resolution.
    for row in OWNER_JOINS:
        do_join(row, verified_owner_sources=True)

    def raw(role):
        return observations[role]['raw']

    # Independently build expected source projections, never from Resolution.value.
    projections = {}
    s, r, rel = raw('scope_source'), raw('rule_source'), raw('relation_source')
    if s is not ABSENT and rel is not ABSENT:
        projections['scope'] = dict(copy.deepcopy(s), scope_ref=copy.deepcopy(observations['scope_source']['address']),
                                    normalization_rule_ref=copy.deepcopy(rel['normalization_rule_ref']))
    if r is not ABSENT and rel is not ABSENT:
        projections['rule'] = dict(copy.deepcopy(r), rule_ref=copy.deepcopy(observations['rule_source']['address']),
                                   applicable_scope_ref=copy.deepcopy(rel['scope_ref']))
    if raw('oracle_source') is not ABSENT:
        projections['oracle'] = dict(copy.deepcopy(raw('oracle_source')),
                                    oracle_ref=copy.deepcopy(observations['oracle_source']['address']))
    if raw('target_read') is not ABSENT:
        projections['target_set'] = copy.deepcopy(raw('target_read'))
    selector = observations['target_read']['address']
    matched = tuple(i for i, res in enumerate(original_resolutions)
                    if is_ref(selector) and is_ref(read(res, '/ref')) and same(res['ref'], selector))
    if is_ref(selector) and not matched:
        emit('required_missing', '/command_input/resolutions', 'target_read', selector,
             unresolved=(selector,))
    expected_addresses = {'scope': read(command, '/scope_ref'), 'rule': read(command, '/rule_ref'),
                          'oracle': read(command, '/oracle_ref'), 'budget': read(command, '/budget_ref'),
                          'target_set': selector}

    def emit_res(code, i, field, left=ABSENT, right=ABSENT):
        member = '/command_input/resolutions/' + str(i)
        ref = read(original_resolutions[i], '/ref')
        emit(code, member + ('/' + field if field else ''), member, left, right,
             unresolved=(ref,) if code in UNKNOWN_CODES and is_ref(ref) else (), resolution=True)

    resolution_good = {}
    budget_projection = ABSENT
    for i, res in enumerate(original_resolutions):
        p = '/command_input/resolutions/' + str(i)
        checks = {'ref': is_ref, 'kind': lambda x: type(x) is str and x in KINDS,
                  'state': lambda x: type(x) is str and x in STATES,
                  'content_bytes': lambda x: x is None or type(x) is bytes,
                  'value': lambda x: x is None or type(x) is dict}
        errors = record_errors(res, checks, p)
        for bad in errors:
            emit_res('schema_invalid', i, bad[len(p) + 1:] if bad != p else '', res)
        if type(res) is not dict:
            continue
        address, kind, state = read(res, '/ref'), read(res, '/kind'), read(res, '/state')
        content, value = read(res, '/content_bytes'), read(res, '/value')
        good = not errors
        if state in ('missing', 'unknown', 'stale'):
            emit_res('resolution_unknown', i, 'state', state)
            good = False
        elif state == 'conflict':
            emit_res('reference_conflict', i, 'state', state)
            good = False
        if i in matched and state == 'valid' and kind != 'target_set' and kind in KINDS:
            emit_res('reference_conflict', i, 'kind', kind, 'target_set')
            good = False
        if state == 'valid':
            for field, v, predicate in [('content_bytes', content, lambda x: type(x) is bytes),
                                         ('value', value, lambda x: type(x) is dict)]:
                if v is not ABSENT and not predicate(v):
                    emit_res('schema_invalid', i, field, v)
                    good = False
        typed_value = False
        if type(value) is dict and type(kind) is str and kind in ('scope', 'rule', 'oracle', 'target_set', 'budget'):
            value_errors = record_errors(value, projected_checks(kind), p + '/value')
            for bad in value_errors:
                emit_res('schema_invalid', i, bad[len(p) + 1:], value)
                good = False
            typed_value = not value_errors
        # Map and hash remain separate observations at every original index with actual bytes.
        if is_ref(address) and type(content) is bytes:
            mapped = byte_map.get(ref_key(address), ABSENT)
            if mapped is ABSENT:
                emit('required_missing', '/resolution_content_bytes', p, res,
                     unresolved=(address,), resolution=True)
                good = False
            elif type(mapped) is not bytes:
                emit('schema_invalid', '/resolution_content_bytes', p, mapped,
                     unresolved=(address,), resolution=True)
                good = False
            elif not same(mapped, content):
                emit_res('reference_conflict', i, 'content_bytes', content, mapped)
                good = False
            if hashlib.sha256(content).hexdigest() != address['sha256']:
                emit_res('reference_conflict', i, 'content_bytes', content, address)
                good = False
        if state == 'valid' and type(content) is bytes and type(value) is dict:
            if kind not in ('scope', 'rule', 'oracle', 'target_set', 'budget'):
                raise SourceContractBoundary('additional kind needs its declared original source projection: ' + str(kind))
            try:
                decoded = strict_decode(content)
            except (ValueError, UnicodeError, TypeError):
                emit_res('schema_invalid', i, 'content_bytes', content)
                good = False
            else:
                role = {'scope': 'scope_source', 'rule': 'rule_source', 'oracle': 'oracle_source',
                        'target_set': 'target_read', 'budget': 'budget'}[kind]
                errors = record_errors(decoded, body_checks(role), p + '/value')
                if errors:
                    for bad in errors:
                        emit_res('schema_invalid', i, bad[len(p) + 1:], decoded)
                    good = False
                else:
                    independent = projections.get(kind, ABSENT)
                    if kind == 'budget':
                        independent = dict(copy.deepcopy(decoded), budget_ref=copy.deepcopy(address))
                    if typed_value and independent is not ABSENT and not same(independent, value):
                        emit_res('reference_conflict', i, 'value', value, independent)
                        good = False
                    # Every declared projection also inversely matches that index's original raw bytes.
                    if kind in ('scope', 'rule', 'oracle'):
                        inverse = dict(copy.deepcopy(decoded))
                        if kind == 'scope' and rel is not ABSENT:
                            inverse.update(scope_ref=copy.deepcopy(address),
                                           normalization_rule_ref=copy.deepcopy(rel['normalization_rule_ref']))
                        elif kind == 'rule' and rel is not ABSENT:
                            inverse.update(rule_ref=copy.deepcopy(address), applicable_scope_ref=copy.deepcopy(rel['scope_ref']))
                        elif kind == 'oracle':
                            inverse.update(oracle_ref=copy.deepcopy(address))
                        else:
                            inverse = ABSENT
                    else:
                        inverse = independent if kind == 'budget' else decoded
                    if typed_value and inverse is not ABSENT and not same(inverse, value):
                        emit_res('reference_conflict', i, 'value', value, inverse)
                        good = False
                    if kind == 'budget' and same(address, expected_addresses['budget']):
                        budget_projection = independent
        if i in matched and type(content) is bytes:
            original_t_bytes = read(supplied_roles, '/target_read/content_bytes')
            if type(original_t_bytes) is bytes and not same(original_t_bytes, content):
                emit_res('reference_conflict', i, 'content_bytes', content, original_t_bytes)
                good = False
        resolution_good[i] = good

    for row in TARGET_JOINS:
        do_join(row)

    for pos, i in enumerate(matched):
        for j in matched[pos + 1:]:
            a, b = original_resolutions[i], original_resolutions[j]
            for field in ('state', 'kind', 'content_bytes', 'value'):
                left, right = read(b, '/' + field), read(a, '/' + field)
                if field == 'state':
                    observed = type(left) is str and type(right) is str and left in STATES and right in STATES
                elif field == 'kind':
                    observed = type(left) is str and type(right) is str and left in KINDS and right in KINDS
                elif field == 'content_bytes':
                    observed = type(left) is bytes and type(right) is bytes
                else:
                    observed = (type(left) is dict and type(right) is dict
                                and not record_errors(left, body_checks('target_read'), '')
                                and not record_errors(right, body_checks('target_read'), ''))
                if observed and not same(left, right):
                    emit_res('reference_conflict', j, field, left, right)

    # Missing successful projection is represented by the original source causes, never another fallback source.
    target_ready = (all(observations[r]['usable'] for r in TARGET_ROLES)
                    and bool(matched) and all(resolution_good.get(i, False) for i in matched)
                    and not any(c['finding']['code'] in UNKNOWN_CODES or c['finding']['code'] == 'reference_conflict'
                                for c in causes if c['finding']['field_pointer'].startswith('/source_projection_inputs/target_')))
    if target_ready and 'target_set' in projections and bases(read(command, '/bases')):
        required = projections['target_set']['required_bases']
        caller = command['bases']
        owner_by_id = {}
        for b in required:
            if b['asset_id'] in owner_by_id:
                emit('base_conflict', '/source_projection_inputs/target_read/raw_body/required_bases',
                     'target_read', b, owner_by_id[b['asset_id']])
            owner_by_id[b['asset_id']] = b
        caller_by_id = {}
        for i, b in enumerate(caller):
            if b['asset_id'] in caller_by_id:
                emit('base_conflict', '/command_input/bases/' + str(i), 'target_read', b, caller_by_id[b['asset_id']])
            caller_by_id[b['asset_id']] = b
            if b['asset_id'] not in owner_by_id:
                emit('base_conflict', '/command_input/bases/' + str(i) + '/asset_id', 'target_read', b['asset_id'])
            elif not same(b['expected_ref'], owner_by_id[b['asset_id']]['expected_ref']):
                emit('base_conflict', '/command_input/bases/' + str(i) + '/expected_ref', 'target_read',
                     b['expected_ref'], owner_by_id[b['asset_id']]['expected_ref'])
        for asset in owner_by_id:
            if asset not in caller_by_id:
                emit('target_missing', '/command_input/bases', 'target_read', caller,
                     unresolved=direct_unknown(read(supplied_roles, '/target_read')))
    if budget_projection is not ABSENT:
        if not same(budget_projection['subject_scope_ref'], scope):
            raise SourceContractBoundary('Budget subject mismatch full diagnostic binding beyond supplied finite domain')
        payload = read(command, '/raw_payload_bytes')
        if type(payload) is bytes and len(payload) > budget_projection['input_bytes_limit']:
            raise SourceContractBoundary('resource_limit full diagnostic binding beyond supplied finite domain')

    # This plan does not invent absent-Resolution diagnostic bindings outside the frozen domain.
    # It also cannot silently accept a missing required original read merely because a private source exists.
    for kind in ('scope', 'rule', 'oracle', 'budget'):
        if not any(is_ref(read(r, '/ref')) and same(read(r, '/ref'), expected_addresses[kind])
                   for r in original_resolutions):
            raise SourceContractBoundary('required original Resolution address absent: ' + kind)

    # Direct unresolved tuples use cause order, independently of sorted/deduplicated Findings.
    unresolved, seen_refs = [], set()
    for cause in causes:
        for ref in cause['unresolved_refs']:
            key = ref_key(ref)
            if key not in seen_refs:
                seen_refs.add(key)
                unresolved.append(copy.deepcopy(ref))

    def finding_key(f):
        subject = f['subject_ref']
        return (f['code'], f['field_pointer']) + tuple(subject[k] if subject else '' for k in REF_FIELDS[:-1])
    findings = []
    for finding in sorted((c['finding'] for c in causes), key=finding_key):
        if not any(same(finding, old) for old in findings):
            findings.append(copy.deepcopy(finding))
    backflow = tuple({'owner': f['owner'], 'layer': 'input_owner', 'scope_ref': copy.deepcopy(scope),
                      'subject_refs': copy.deepcopy(f['basis_refs']), 'cause_code': f['code']} for f in findings)
    if any(f['code'] not in UNKNOWN_CODES for f in findings):
        return {'conflict': {'findings': tuple(findings), 'differences': (), 'backflow': backflow}}
    if findings:
        return {'unknown': {'findings': tuple(findings), 'unresolved_refs': tuple(unresolved), 'backflow': backflow}}
    if not all(k in projections for k in ('scope', 'rule', 'target_set')) or budget_projection is ABSENT:
        raise SourceContractBoundary('missing original projection has no specified cause within supplied finite domain')
    return {'ready': {'value': {'input': copy.deepcopy(command),
                                'scope': copy.deepcopy(projections['scope']),
                                'rule': copy.deepcopy(projections['rule']),
                                'target_set': copy.deepcopy(projections['target_set']),
                                'budget': copy.deepcopy(budget_projection),
                                'source_resolutions': copy.deepcopy(original_resolutions)}}}


# Fixed source-derived join rows are appended below; they contain no fixture values.

OWNER_JOINS = ({'id': 'basis_selection',
  'left': 'source_projection_inputs.rule_source.raw_body.owner_basis_ref',
  'right': 'source_projection_inputs.owner_basis_source.source_ref',
  'operator': 'ref_exact',
  'source_member': 'rule_source',
  'finding_code': 'reference_conflict',
  'field_pointer': '/source_projection_inputs/rule_source/raw_body/owner_basis_ref'},
 {'id': 'basis_target',
  'left': 'source_projection_inputs.owner_basis_source.raw_body.owner_ref',
  'right': 'source_projection_inputs.scope_source.raw_body.owner_ref',
  'operator': 'ref_exact',
  'source_member': 'owner_basis_source',
  'finding_code': 'owner_mismatch',
  'field_pointer': '/source_projection_inputs/owner_basis_source/raw_body/owner_ref'},
 {'id': 'relation_scope_ref',
  'left': 'source_projection_inputs.relation_source.raw_body.scope_ref',
  'right': 'source_projection_inputs.scope_source.source_ref',
  'operator': 'ref_exact',
  'source_member': 'relation_source',
  'finding_code': 'owner_mismatch',
  'field_pointer': '/source_projection_inputs/relation_source/raw_body/scope_ref'},
 {'id': 'relation_normalization_rule_ref',
  'left': 'source_projection_inputs.relation_source.raw_body.normalization_rule_ref',
  'right': 'source_projection_inputs.rule_source.source_ref',
  'operator': 'ref_exact',
  'source_member': 'relation_source',
  'finding_code': 'owner_mismatch',
  'field_pointer': '/source_projection_inputs/relation_source/raw_body/normalization_rule_ref'},
 {'id': 'relation_oracle_ref',
  'left': 'source_projection_inputs.relation_source.raw_body.oracle_ref',
  'right': 'source_projection_inputs.oracle_source.source_ref',
  'operator': 'ref_exact',
  'source_member': 'relation_source',
  'finding_code': 'oracle_mismatch',
  'field_pointer': '/source_projection_inputs/relation_source/raw_body/oracle_ref'},
 {'id': 'relation_owner_ref',
  'left': 'source_projection_inputs.relation_source.raw_body.owner_ref',
  'right': 'source_projection_inputs.scope_source.raw_body.owner_ref',
  'operator': 'ref_exact',
  'source_member': 'relation_source',
  'finding_code': 'owner_mismatch',
  'field_pointer': '/source_projection_inputs/relation_source/raw_body/owner_ref'},
 {'id': 'qualification_root_ref',
  'left': 'source_projection_inputs.qualification.raw_body.root_ref',
  'right': 'source_projection_inputs.root.source_ref',
  'operator': 'ref_exact',
  'source_member': 'qualification',
  'finding_code': 'reference_conflict',
  'field_pointer': '/source_projection_inputs/qualification/raw_body/root_ref'},
 {'id': 'qualification_source_ref',
  'left': 'source_projection_inputs.qualification.raw_body.source_ref',
  'right': 'source_projection_inputs.relation_source.source_ref',
  'operator': 'ref_exact',
  'source_member': 'qualification',
  'finding_code': 'owner_mismatch',
  'field_pointer': '/source_projection_inputs/qualification/raw_body/source_ref'},
 {'id': 'qualification_subject_ref',
  'left': 'source_projection_inputs.qualification.raw_body.subject_ref',
  'right': 'source_projection_inputs.relation_source.source_ref',
  'operator': 'ref_exact',
  'source_member': 'qualification',
  'finding_code': 'owner_mismatch',
  'field_pointer': '/source_projection_inputs/qualification/raw_body/subject_ref'},
 {'id': 'qualification_owner_ref',
  'left': 'source_projection_inputs.qualification.raw_body.owner_ref',
  'right': 'source_projection_inputs.relation_source.raw_body.owner_ref',
  'operator': 'ref_exact',
  'source_member': 'qualification',
  'finding_code': 'owner_mismatch',
  'field_pointer': '/source_projection_inputs/qualification/raw_body/owner_ref'},
 {'id': 'qualification_source_sha256',
  'left': 'source_projection_inputs.qualification.raw_body.source_sha256',
  'right': 'source_projection_inputs.relation_source.source_ref.sha256',
  'operator': 'sha256hex_exact',
  'source_member': 'qualification',
  'finding_code': 'reference_conflict',
  'field_pointer': '/source_projection_inputs/qualification/raw_body/source_sha256'},
 {'id': 'root_owner_ref',
  'left': 'source_projection_inputs.root.raw_body.owner_ref',
  'right': 'source_projection_inputs.relation_source.raw_body.owner_ref',
  'operator': 'ref_exact',
  'source_member': 'root',
  'finding_code': 'owner_mismatch',
  'field_pointer': '/source_projection_inputs/root/raw_body/owner_ref'},
 {'id': 'root_allowed_subject_ref',
  'left': 'source_projection_inputs.root.raw_body.allowed_subject_ref',
  'right': 'source_projection_inputs.relation_source.source_ref',
  'operator': 'ref_exact',
  'source_member': 'root',
  'finding_code': 'owner_mismatch',
  'field_pointer': '/source_projection_inputs/root/raw_body/allowed_subject_ref'},
 {'id': 'root_allowed_source_ref',
  'left': 'source_projection_inputs.root.raw_body.allowed_source_ref',
  'right': 'source_projection_inputs.relation_source.source_ref',
  'operator': 'ref_exact',
  'source_member': 'root',
  'finding_code': 'owner_mismatch',
  'field_pointer': '/source_projection_inputs/root/raw_body/allowed_source_ref'},
 {'id': 'root_allowed_source_sha256',
  'left': 'source_projection_inputs.root.raw_body.allowed_source_sha256',
  'right': 'source_projection_inputs.relation_source.source_ref.sha256',
  'operator': 'sha256hex_exact',
  'source_member': 'root',
  'finding_code': 'reference_conflict',
  'field_pointer': '/source_projection_inputs/root/raw_body/allowed_source_sha256'},
 {'id': 'observation_evidence',
  'left': 'source_projection_inputs.qualification.qualification_observation.EstablishedEvidence.evidence_ref',
  'right': 'source_projection_inputs.qualification.source_ref',
  'operator': 'ref_exact',
  'source_member': 'qualification',
  'finding_code': 'reference_conflict',
  'field_pointer': '/source_projection_inputs/qualification/qualification_observation/EstablishedEvidence/evidence_ref'},
 {'id': 'command_scope_ref',
  'left': 'command_input.scope_ref',
  'right': 'source_projection_inputs.scope_source.source_ref',
  'operator': 'ref_exact',
  'source_member': 'scope_source',
  'finding_code': 'reference_conflict',
  'field_pointer': '/command_input/scope_ref'},
 {'id': 'command_rule_ref',
  'left': 'command_input.rule_ref',
  'right': 'source_projection_inputs.rule_source.source_ref',
  'operator': 'ref_exact',
  'source_member': 'rule_source',
  'finding_code': 'reference_conflict',
  'field_pointer': '/command_input/rule_ref'},
 {'id': 'command_oracle_ref',
  'left': 'command_input.oracle_ref',
  'right': 'source_projection_inputs.oracle_source.source_ref',
  'operator': 'ref_exact',
  'source_member': 'oracle_source',
  'finding_code': 'reference_conflict',
  'field_pointer': '/command_input/oracle_ref'},
 {'id': 'app_selection',
  'left': 'source_projection_inputs.scope_source.raw_body.applicability_ref',
  'right': 'source_projection_inputs.applicability_source.source_ref',
  'operator': 'Ref5_exact',
  'finding': 'reference_conflict',
  'source_member': 'scope_source',
  'field_pointer': '/source_projection_inputs/scope_source/raw_body/applicability_ref'},
 {'id': 'app_scope_address',
  'left': 'source_projection_inputs.applicability_source.raw_body.scope_locator',
  'right': 'Locator4(source_projection_inputs.scope_source.source_ref)',
  'operator': 'Locator4_exact',
  'finding': 'owner_mismatch',
  'source_member': 'applicability_source',
  'field_pointer': '/source_projection_inputs/applicability_source/raw_body/scope_locator'},
 {'id': 'app_rule',
  'left': 'source_projection_inputs.applicability_source.raw_body.normalization_rule_ref',
  'right': 'source_projection_inputs.rule_source.source_ref',
  'operator': 'Ref5_exact',
  'finding': 'owner_mismatch',
  'source_member': 'applicability_source',
  'field_pointer': '/source_projection_inputs/applicability_source/raw_body/normalization_rule_ref'},
 {'id': 'app_owner',
  'left': 'source_projection_inputs.applicability_source.raw_body.owner_ref',
  'right': 'source_projection_inputs.scope_source.raw_body.owner_ref',
  'operator': 'Ref5_exact',
  'finding': 'owner_mismatch',
  'source_member': 'applicability_source',
  'field_pointer': '/source_projection_inputs/applicability_source/raw_body/owner_ref'},
 {'id': 'app_owner_basis',
  'left': 'source_projection_inputs.applicability_source.raw_body.owner_ref',
  'right': 'source_projection_inputs.owner_basis_source.raw_body.owner_ref',
  'operator': 'Ref5_exact',
  'finding': 'owner_mismatch',
  'source_member': 'applicability_source',
  'field_pointer': '/source_projection_inputs/applicability_source/raw_body/owner_ref'},
 {'id': 'oracle_scope',
  'left': 'source_projection_inputs.oracle_source.raw_body.scope_ref',
  'right': 'source_projection_inputs.scope_source.source_ref',
  'operator': 'Ref5_exact',
  'finding': 'oracle_mismatch',
  'source_member': 'oracle_source',
  'field_pointer': '/source_projection_inputs/oracle_source/raw_body/scope_ref'},
 {'id': 'oracle_parent',
  'left': 'source_projection_inputs.oracle_source.raw_body.requirement_parent',
  'right': 'HARNESS-L2-052',
  'operator': 'Text_exact_no_coercion',
  'finding': 'oracle_mismatch',
  'source_member': 'oracle_source',
  'field_pointer': '/source_projection_inputs/oracle_source/raw_body/requirement_parent'})

TARGET_JOINS = ({'id': 'target_q_root',
  'left': '/source_projection_inputs/target_qualification/raw_body/root_ref',
  'right': '/source_projection_inputs/target_root/source_ref',
  'operator': 'full_ref_exact',
  'source_member': 'target_qualification',
  'field_pointer': '/source_projection_inputs/target_qualification/raw_body/root_ref',
  'finding_code': 'reference_conflict'},
 {'id': 'target_q_source',
  'left': '/source_projection_inputs/target_qualification/raw_body/source_ref',
  'right': '/source_projection_inputs/target_read/source_ref',
  'operator': 'full_ref_exact',
  'source_member': 'target_qualification',
  'field_pointer': '/source_projection_inputs/target_qualification/raw_body/source_ref',
  'finding_code': 'reference_conflict'},
 {'id': 'target_q_sha',
  'left': '/source_projection_inputs/target_qualification/raw_body/source_sha256',
  'right': '/source_projection_inputs/target_read/source_ref/sha256',
  'operator': 'sha256hex_exact',
  'source_member': 'target_qualification',
  'field_pointer': '/source_projection_inputs/target_qualification/raw_body/source_sha256',
  'finding_code': 'reference_conflict'},
 {'id': 'target_g_source',
  'left': '/source_projection_inputs/target_root/raw_body/allowed_source_ref',
  'right': '/source_projection_inputs/target_read/source_ref',
  'operator': 'full_ref_exact',
  'source_member': 'target_root',
  'field_pointer': '/source_projection_inputs/target_root/raw_body/allowed_source_ref',
  'finding_code': 'reference_conflict'},
 {'id': 'target_g_sha',
  'left': '/source_projection_inputs/target_root/raw_body/allowed_source_sha256',
  'right': '/source_projection_inputs/target_read/source_ref/sha256',
  'operator': 'sha256hex_exact',
  'source_member': 'target_root',
  'field_pointer': '/source_projection_inputs/target_root/raw_body/allowed_source_sha256',
  'finding_code': 'reference_conflict'},
 {'id': 'target_q_subject_scope',
  'left': '/source_projection_inputs/target_qualification/raw_body/subject_ref',
  'right': '/command_input/scope_ref',
  'operator': 'full_ref_exact',
  'source_member': 'target_qualification',
  'field_pointer': '/source_projection_inputs/target_qualification/raw_body/subject_ref',
  'finding_code': 'reference_conflict'},
 {'id': 'target_g_subject_scope',
  'left': '/source_projection_inputs/target_root/raw_body/allowed_subject_ref',
  'right': '/command_input/scope_ref',
  'operator': 'full_ref_exact',
  'source_member': 'target_root',
  'field_pointer': '/source_projection_inputs/target_root/raw_body/allowed_subject_ref',
  'finding_code': 'reference_conflict'},
 {'id': 'target_t_scope',
  'left': '/source_projection_inputs/target_read/raw_body/scope_ref',
  'right': '/command_input/scope_ref',
  'operator': 'full_ref_exact',
  'source_member': 'target_read',
  'field_pointer': '/source_projection_inputs/target_read/raw_body/scope_ref',
  'finding_code': 'reference_conflict'},
 {'id': 'target_owner',
  'left': '/source_projection_inputs/target_qualification/raw_body/owner_ref',
  'right': '/source_projection_inputs/target_root/raw_body/owner_ref',
  'operator': 'full_ref_exact',
  'source_member': 'target_qualification',
  'field_pointer': '/source_projection_inputs/target_qualification/raw_body/owner_ref',
  'finding_code': 'reference_conflict'},
 {'id': 'target_observation',
  'left': '/source_projection_inputs/target_qualification/qualification_observation/EstablishedEvidence/evidence_ref',
  'right': '/source_projection_inputs/target_qualification/source_ref',
  'operator': 'full_ref_exact',
  'source_member': 'target_qualification',
  'field_pointer': '/source_projection_inputs/target_qualification/qualification_observation/EstablishedEvidence/evidence_ref',
  'finding_code': 'reference_conflict'})
