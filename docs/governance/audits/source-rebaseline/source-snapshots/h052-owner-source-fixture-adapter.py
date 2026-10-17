"""Fixture-only reversible bytes/Ref-map representation. No fn0 decisions or expected dependency.
Declared representation: normal-source-input-only/authoring-value-representation.json.
The explicit byte field positions extend over every supplied tuple element, not fixed fixture indices.
"""
import base64
import copy

REF_FIELDS = ('identity', 'revision', 'scope', 'owner', 'sha256')


class FixtureRepresentationBoundary(Exception):
    pass


def decode_bytes(v):
    # Null and absence have different callers: absent never calls this function.
    if v is None:
        return None
    if type(v) is not str:
        raise FixtureRepresentationBoundary('byte authoring value must be base64 text or declared null')
    try:
        decoded = base64.b64decode(v, validate=True)
    except (ValueError, TypeError) as exc:
        raise FixtureRepresentationBoundary('invalid fixture base64') from exc
    if base64.b64encode(decoded).decode('ascii') != v:
        raise FixtureRepresentationBoundary('noncanonical fixture base64')
    return decoded


def arrays_to_tuples(v):
    if type(v) is list:
        return tuple(arrays_to_tuples(x) for x in v)
    if type(v) is dict:
        return {k: arrays_to_tuples(x) for k, x in v.items()}
    return v


def decode_input(authoring):
    """Preserve original missing fields/null/raw bodies; no typed constructor repair."""
    out = copy.deepcopy(authoring)
    if type(out) is not dict:
        return out
    command = out.get('command_input')
    if type(command) is dict:
        if 'raw_payload_bytes' in command:
            command['raw_payload_bytes'] = decode_bytes(command['raw_payload_bytes'])
        resolutions = command.get('resolutions')
        if type(resolutions) is list:
            for res in resolutions:
                if type(res) is dict and 'content_bytes' in res:
                    res['content_bytes'] = decode_bytes(res['content_bytes'])
    roles = out.get('source_projection_inputs')
    if type(roles) is dict:
        for evidence in roles.values():
            if type(evidence) is dict and 'content_bytes' in evidence:
                evidence['content_bytes'] = decode_bytes(evidence['content_bytes'])
    if 'resolution_content_bytes' in out:
        entries = out['resolution_content_bytes']
        if type(entries) is not list:
            raise FixtureRepresentationBoundary('Ref-key fixture map must be an entry array')
        native_map = {}
        for entry in entries:
            if type(entry) is not dict or set(entry) != {'key', 'value'}:
                raise FixtureRepresentationBoundary('closed Ref-key entry')
            key = entry['key']
            if type(key) is not dict or set(key) != set(REF_FIELDS) or not all(type(key[k]) is str for k in REF_FIELDS):
                raise FixtureRepresentationBoundary('Ref-key must expose all original five text components')
            components = tuple(key[k] for k in REF_FIELDS)
            if components in native_map:
                raise FixtureRepresentationBoundary('a map has one value per full Ref; Resolution repetitions remain legal')
            native_map[components] = decode_bytes(entry['value'])
        out['resolution_content_bytes'] = native_map
    return arrays_to_tuples(out)


def encode_return(native):
    """Logical return authoring only. Actual bytes become base64; no text/marker interpretation."""
    if type(native) is bytes:
        return base64.b64encode(native).decode('ascii')
    if type(native) in (tuple, list):
        return [encode_return(x) for x in native]
    if type(native) is dict:
        if not all(type(k) is str for k in native):
            raise FixtureRepresentationBoundary('fn0 public return has no Ref-key map member')
        return {k: encode_return(v) for k, v in native.items()}
    if native is None or type(native) in (str, int, bool, float):
        return native
    raise FixtureRepresentationBoundary('not a declared public logical return scalar/container')
