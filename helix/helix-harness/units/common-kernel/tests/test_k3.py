"""L7 K3 fixtures; owner/K5/K6/K7 dependencies are local stubs only."""

from __future__ import annotations

from dataclasses import replace
from pathlib import Path
import inspect
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import permission as k3  # noqa: E402
from common_kernel import (  # noqa: E402
    NotApplicable,
    Polarity,
    PolarityMapping,
    ResultRecord,
    Stale,
    SubjectRef,
    Unknown,
    Unobserved,
    Value,
    Verdict,
    _canonical_json_bytes,
    _key_digest,
    _sha256_digest,
    key_of,
    lookup,
)


D1 = "sha256:" + "1" * 64
D2 = "sha256:" + "2" * 64
D3 = "sha256:" + "3" * 64
OPS = (
    "read", "write", "execute", "network", "install", "delete", "merge",
    "release", "deploy", "credential-use", "security-change",
)


def ref(identity: str, revision: str = "r1", digest: str = D1, kind: str = "contract") -> SubjectRef:
    return SubjectRef(kind, identity, revision, digest)


def _positive(value: object) -> Polarity:
    return Polarity.POSITIVE if value is k3.CheckValue.MATCH else Polarity.NEGATIVE


CHECK_POLARITY = PolarityMapping("k3-fixture-check-value", "0.1.0", _positive)


_OPERATIONS = (
    "credential-use",
    "security-change",
    "read",
    "write",
    "execute",
    "network",
    "install",
    "delete",
    "merge",
    "release",
    "deploy",
)


def _operation_from_fixture(l8_id: str) -> str:
    return next((operation for operation in _OPERATIONS if l8_id.endswith(f"-{operation}")), "read")


def _keyed(value: object, key, *, positive: bool = True):
    return Value(value, key, {"fixture": "K6/owner stub"}) if positive else Unknown("unsupported", key)


def _baseline(l8_id: str):
    operation = _operation_from_fixture(l8_id) if "ALLOW-" in l8_id else "read"
    input_refs = {
        "purpose": ref("purpose"),
        "classification": ref("classification"),
        "source": ref("source"),
        "destination": ref("destination"),
    }
    query = k3.PermissionQuery(operation, "stage-A", ref("composition"), "project:P/worktree:W", input_refs)
    permission = ref("permission-record", kind="permission")
    query_ref = k3._query_ref(query)

    role_inputs = tuple(
        k3.RoleInput(role, ref(identity, kind="owner-source"))
        for role, identity in (
            ("k3_code", "code"),
            ("k3_config", "config"),
            ("assignment", "assignment"),
            ("target_decl", "target-decl"),
            ("owner_decl", "owner-decl"),
            ("environment_decl", "environment-decl"),
            ("operation_decl", "operation-decl"),
            ("authority_decl", "authority-decl"),
            ("policy", "policy"),
            ("permission_source", "permission-source"),
            ("adapter", "adapter"),
            ("time_observation", "time-observation"),
        )
    )
    aliases = [
        (
            {"query_identity": query_ref.identity},
            item.role,
            item.raw_ref,
            k3._authority_input_ref(item),
        )
        for item in role_inputs
    ]
    binding_identity = _canonical_json_bytes(
        {"owner": "SECURITY", "operation": k3.K3_OPERATION, "query": query_ref.identity}
    ).decode("utf-8")
    binding_revision = _canonical_json_bytes(
        [
            {"alias_identity": alias[3].identity, "raw_revision": alias[2].revision}
            for alias in sorted(aliases, key=lambda item: item[3].identity)
        ]
    ).decode("utf-8")
    binding = k3._bind_alias_inputs(
        aliases,
        binding_kind="k3_authority_input_binding",
        binding_identity=binding_identity,
        owner_revision=binding_revision,
    )
    heads = (ref("revocation-head", kind="k3_head_observation"),)
    mapping = k3.OwnerMapping(role_inputs, binding.canonical_bytes, binding.binding_ref, heads)

    context_tuple = k3.OperationAuthorityTuple(
        actor="worker-A",
        target="stage-A",
        operation=operation,
        revision=query.revision,
        environment=ref("environment-A", kind="environment"),
        scope=query.requested_scope,
        expiry="owner-defined-expiry",
    )
    context = k3.AuthorityContext(
        tuple=context_tuple,
        operation_inputs=input_refs,
        current_assignment=ref("assignment", kind="assignment"),
        target_owner_decl=ref("target-decl", kind="declaration"),
        environment_decl=ref("environment-decl", kind="declaration"),
        operation_decl=ref("operation-decl", kind="declaration"),
        authority_decl=ref("authority-decl", kind="declaration"),
        policy=ref("policy", kind="policy"),
        source_current={"permission-source": ref("permission-source", kind="source")},
        observed_at=ref("observed-at", kind="time-observation"),
        revocation_heads=(),
        pre_execution_constraints=(),
    )
    owner_data = k3.OwnerContextData(
        context,
        revocation_snapshot=k3.RevocationSnapshot(
            context.revocation_heads,
            Value(k3.CheckValue.MATCH, k3._key(permission, query_ref, context, mapping), {"revocation": "complete owner snapshot"}),
        ),
    )
    result_key = k3._key(permission, query_ref, context, mapping)
    assert not isinstance(result_key, k3.Rejected)
    record_tuple = replace(context_tuple)
    record = k3.PermissionRecord(
        ref=permission,
        tuple=record_tuple,
        operation_inputs=dict(input_refs),
        outcome="allow",
        reason="redacted reason",
        source=ref("permission-source", kind="source"),
        issuer="issuer-A",
    )
    source = k3.PermissionSourceData(
        record,
        permission,
        Value(permission, result_key, {"selector": "registered stub"}),
        Value(k3.CheckValue.MATCH, result_key, {"expiry": "owner-declared stub"}),
        declared_issuer="issuer-A",
    )
    assurance = k3.K6AssuranceData(
        Value(k3.CheckValue.MATCH, result_key, {"k6": "stub"}),
        Value(k3.CheckValue.MATCH, result_key, {"k6": "stub"}),
        Value(k3.CheckValue.MATCH, result_key, {"k6": "stub"}),
        CHECK_POLARITY,
        CHECK_POLARITY,
        CHECK_POLARITY,
    )
    return query, permission, mapping, owner_data, source, assurance, result_key


def _lookup_case(l8_id: str):
    query, permission, mapping, owner_data, source, assurance, base_key = _baseline(l8_id)
    current_key = base_key
    if l8_id.endswith("15-BASE"):
        pass
    elif l8_id.endswith("DIGEST") or l8_id.endswith("14h") or l8_id.endswith("14i"):
        changed = replace(base_key.inputs[1], digest=D2)
        current_key = replace(base_key, inputs=(base_key.inputs[0], changed, *base_key.inputs[2:]))
    elif l8_id.endswith("IDENTITY") or l8_id.endswith("14j"):
        changed = replace(base_key.inputs[1], identity=base_key.inputs[1].identity + "-new")
        current_key = replace(base_key, inputs=(base_key.inputs[0], changed, *base_key.inputs[2:]))
    elif l8_id.endswith("14f"):
        changed = replace(base_key.inputs[0], identity=base_key.inputs[0].identity + "-new")
        current_key = replace(base_key, inputs=(changed, *base_key.inputs[1:]))
    elif l8_id.endswith("15-OPERATION-VERSION"):
        current_key = replace(base_key, operation_version=base_key.operation_version + "/new")
    elif "15-" in l8_id and not l8_id.endswith("15-BASE"):
        role_by_case = {
            "L8-K3-15-K3-CODE": "k3_code",
            "L8-K3-15-K3-CONFIG": "k3_config",
            "L8-K3-15-CURRENT-ASSIGNMENT": "assignment",
            "L8-K3-15-TARGET-DECL": "target_decl",
            "L8-K3-15-OWNER-DECL": "owner_decl",
            "L8-K3-15-ENVIRONMENT-DECL": "environment_decl",
            "L8-K3-15-OPERATION-DECL": "operation_decl",
            "L8-K3-15-AUTHORITY-DECL": "authority_decl",
            "L8-K3-15-POLICY": "policy",
            "L8-K3-15-SOURCE-CURRENT-REF": "permission_source",
            "L8-K3-15-ADAPTER": "adapter",
        }
        if l8_id == "L8-K3-15-OPERATION-VERSION":
            raise AssertionError("operation version must use its own key field")
        role = role_by_case.get(l8_id)
        if role is None:
            raise AssertionError(f"No exact current-ref mapping for {l8_id}")
        input_ref = next(
            (item for item in base_key.inputs if f'"role":"{role}"' in item.identity),
            None,
        )
        if input_ref is None:
            raise AssertionError(f"Mapped key input is absent for {l8_id}: {role}")
        changed = replace(input_ref, revision="r2", digest=D2)
        current_key = replace(
            base_key,
            inputs=tuple(changed if item is input_ref else item for item in base_key.inputs),
        )
    else:
        changed = replace(base_key.inputs[1], revision="r2")
        current_key = replace(base_key, inputs=(base_key.inputs[0], changed, *base_key.inputs[2:]))
    prior = Value({"combined": "prior"}, base_key, {"prior": True})
    record = ResultRecord(base_key, _key_digest(base_key), prior, _sha256_digest(b"prior"), "fixture")
    return lookup((record,), current_key), current_key


def _refresh_query_binding(query, mapping):
    """Rebuild test owner binding after a one-field query mutation."""
    query_ref = k3._query_ref(query)
    aliases = [
        (
            {"query_identity": query_ref.identity},
            item.role,
            item.raw_ref,
            k3._authority_input_ref(item),
        )
        for item in mapping.role_inputs
    ]
    binding_identity = _canonical_json_bytes(
        {"owner": "SECURITY", "operation": k3.K3_OPERATION, "query": query_ref.identity}
    ).decode("utf-8")
    binding_revision = _canonical_json_bytes(
        [
            {"alias_identity": alias[3].identity, "raw_revision": alias[2].revision}
            for alias in sorted(aliases, key=lambda item: item[3].identity)
        ]
    ).decode("utf-8")
    binding = k3._bind_alias_inputs(
        aliases,
        binding_kind="k3_authority_input_binding",
        binding_identity=binding_identity,
        owner_revision=binding_revision,
    )
    return replace(mapping, binding_bytes=binding.canonical_bytes, binding_ref=binding.binding_ref)


def _rekey(observed, key):
    if observed is not None and hasattr(observed, "key"):
        return replace(observed, key=key)
    return observed


FORMAL_EXPECTED_KIND_BY_L8_ID = {
    'L8-K3-01-ASSIGNMENT': 'Negative',
    'L8-K3-01-BASE': 'Positive',
    'L8-K3-01-KEY-MISSING': 'Diagnostic',
    'L8-K3-01-OWNER-CONFLICT': 'Unknown',
    'L8-K3-01-OWNER-MISSING': 'Unknown',
    'L8-K3-01-OWNER-UNREGISTERED': 'Unknown',
    'L8-K3-01-SCOPE-ENVIRONMENT': 'Negative',
    'L8-K3-01-SCOPE-PROJECT': 'Negative',
    'L8-K3-01-SCOPE-TENANT': 'Negative',
    'L8-K3-01-SCOPE-WORKTREE': 'Negative',
    'L8-K3-01-actor-CONFLICT': 'Unknown',
    'L8-K3-01-actor-MISMATCH': 'Negative',
    'L8-K3-01-actor-MISSING': 'Unknown',
    'L8-K3-01-actor-UNKNOWN': 'Unknown',
    'L8-K3-01-environment-CONFLICT': 'Unknown',
    'L8-K3-01-environment-MISMATCH': 'Negative',
    'L8-K3-01-environment-MISSING': 'Unknown',
    'L8-K3-01-environment-UNKNOWN': 'Unknown',
    'L8-K3-01-expiry-CONFLICT': 'Unknown',
    'L8-K3-01-expiry-MISMATCH': 'Negative',
    'L8-K3-01-expiry-MISSING': 'Unknown',
    'L8-K3-01-expiry-UNKNOWN': 'Unknown',
    'L8-K3-01-operation-CONFLICT': 'Unknown',
    'L8-K3-01-operation-MISMATCH': 'Negative',
    'L8-K3-01-operation-MISSING': 'Unknown',
    'L8-K3-01-operation-UNKNOWN': 'Unknown',
    'L8-K3-01-revision-CONFLICT': 'Unknown',
    'L8-K3-01-revision-MISMATCH': 'Negative',
    'L8-K3-01-revision-MISSING': 'Unknown',
    'L8-K3-01-revision-UNKNOWN': 'Unknown',
    'L8-K3-01-scope-CONFLICT': 'Unknown',
    'L8-K3-01-scope-MISMATCH': 'Negative',
    'L8-K3-01-scope-MISSING': 'Unknown',
    'L8-K3-01-scope-UNKNOWN': 'Unknown',
    'L8-K3-01-target-CONFLICT': 'Unknown',
    'L8-K3-01-target-MISMATCH': 'Negative',
    'L8-K3-01-target-MISSING': 'Unknown',
    'L8-K3-01-target-UNKNOWN': 'Unknown',
    'L8-K3-02-ALLOW-credential-use': 'Positive',
    'L8-K3-02-ALLOW-delete': 'Positive',
    'L8-K3-02-ALLOW-deploy': 'Positive',
    'L8-K3-02-ALLOW-execute': 'Positive',
    'L8-K3-02-ALLOW-install': 'Positive',
    'L8-K3-02-ALLOW-merge': 'Positive',
    'L8-K3-02-ALLOW-network': 'Positive',
    'L8-K3-02-ALLOW-read': 'Positive',
    'L8-K3-02-ALLOW-release': 'Positive',
    'L8-K3-02-ALLOW-security-change': 'Positive',
    'L8-K3-02-ALLOW-write': 'Positive',
    'L8-K3-02-READ-AS-credential-use': 'Negative',
    'L8-K3-02-READ-AS-delete': 'Negative',
    'L8-K3-02-READ-AS-deploy': 'Negative',
    'L8-K3-02-READ-AS-execute': 'Negative',
    'L8-K3-02-READ-AS-install': 'Negative',
    'L8-K3-02-READ-AS-merge': 'Negative',
    'L8-K3-02-READ-AS-network': 'Negative',
    'L8-K3-02-READ-AS-release': 'Negative',
    'L8-K3-02-READ-AS-security-change': 'Negative',
    'L8-K3-02-READ-AS-write': 'Negative',
    'L8-K3-03-BASE': 'Positive',
    'L8-K3-03-DIGEST': 'Unknown',
    'L8-K3-03-FRESH-REVISION': 'Negative',
    'L8-K3-03-IDENTITY': 'Unobserved',
    'L8-K3-03-LOOKUP-STALE': 'Stale',
    'L8-K3-04-BASE': 'Positive',
    'L8-K3-04-CURRENT-CONSTRAIN': 'Positive',
    'L8-K3-04-CURRENT-DENY': 'Negative',
    'L8-K3-04-ISSUER-MISMATCH': 'Negative',
    'L8-K3-04-RECEIPT-SUBSTITUTE': 'Unknown',
    'L8-K3-04-SAME-NAME-DIFFERENT-SOURCE': 'Unknown',
    'L8-K3-04-SELECTION-CONFLICTING-CANDIDATES': 'Unknown',
    'L8-K3-04-SELECTION-UNKNOWN-RULE': 'Unknown',
    'L8-K3-04-SELF-ISSUED': 'Unknown',
    'L8-K3-04-SIGNATURE-INVALID': 'Unknown',
    'L8-K3-04-SIGNATURE-UNVERIFIABLE': 'Unknown',
    'L8-K3-04-UNREGISTERED-SOURCE': 'Unknown',
    'L8-K3-05-BASE': 'Positive',
    'L8-K3-05-CONSTRAINT-EVIDENCE-MISSING': 'Unknown',
    'L8-K3-05-CONSTRAINT-RELAXED': 'Negative',
    'L8-K3-05-CONSTRAINT-SETTING-MISSING': 'Unknown',
    'L8-K3-05-DENY': 'Negative',
    'L8-K3-05-PRECONDITION-UNOBSERVED': 'Undetermined',
    'L8-K3-06-ACK': 'Positive',
    'L8-K3-06-BASE': 'Positive',
    'L8-K3-06-CHECK-SUCCESS': 'Positive',
    'L8-K3-06-CI-GREEN': 'Positive',
    'L8-K3-06-REQUEST': 'Positive',
    'L8-K3-06-REVIEW': 'Positive',
    'L8-K3-07-BASE': 'Positive',
    'L8-K3-07-EXPIRED': 'Negative',
    'L8-K3-07-EXPIRY-UNPARSABLE': 'Unknown',
    'L8-K3-07-TIME-UNREADABLE': 'Unknown',
    'L8-K3-08-BASE': 'Positive',
    'L8-K3-08-G5-ONLY': 'Positive',
    'L8-K3-08-OLD-EPOCH-ACTION': 'Positive',
    'L8-K3-08-OUT-OF-SCOPE-STOP': 'Positive',
    'L8-K3-08-REVOKED': 'Negative',
    'L8-K3-08-SEGMENT-MISSING': 'Unknown',
    'L8-K3-08-SEGMENT-UNREADABLE': 'Unknown',
    'L8-K3-09-BASE': 'Positive',
    'L8-K3-09-assignment-actor': 'Positive',
    'L8-K3-09-assignment-environment': 'Positive',
    'L8-K3-09-assignment-expiry': 'Positive',
    'L8-K3-09-assignment-operation': 'Positive',
    'L8-K3-09-assignment-revision': 'Positive',
    'L8-K3-09-assignment-scope': 'Positive',
    'L8-K3-09-assignment-target': 'Positive',
    'L8-K3-09-decision-actor': 'Positive',
    'L8-K3-09-decision-environment': 'Positive',
    'L8-K3-09-decision-expiry': 'Positive',
    'L8-K3-09-decision-operation': 'Positive',
    'L8-K3-09-decision-revision': 'Positive',
    'L8-K3-09-decision-scope': 'Positive',
    'L8-K3-09-decision-target': 'Positive',
    'L8-K3-09-effective_scope-actor': 'Positive',
    'L8-K3-09-effective_scope-environment': 'Positive',
    'L8-K3-09-effective_scope-expiry': 'Positive',
    'L8-K3-09-effective_scope-operation': 'Positive',
    'L8-K3-09-effective_scope-revision': 'Positive',
    'L8-K3-09-effective_scope-scope': 'Positive',
    'L8-K3-09-effective_scope-target': 'Positive',
    'L8-K3-09-request-actor': 'Positive',
    'L8-K3-09-request-environment': 'Positive',
    'L8-K3-09-request-expiry': 'Positive',
    'L8-K3-09-request-operation': 'Positive',
    'L8-K3-09-request-revision': 'Positive',
    'L8-K3-09-request-scope': 'Positive',
    'L8-K3-09-request-target': 'Positive',
    'L8-K3-10-BASE': 'Positive',
    'L8-K3-10-EXTRA-KEY': 'Negative',
    'L8-K3-10-RECORD-BINDING-MISMATCH': 'Negative',
    'L8-K3-10-REQUIRED-KEY-MISSING': 'Unknown',
    'L8-K3-10-classification': 'Positive',
    'L8-K3-10-destination': 'Positive',
    'L8-K3-10-purpose': 'Positive',
    'L8-K3-10-source': 'Positive',
    'L8-K3-11-BASE': 'Positive',
    'L8-K3-11-MOVE-ACTION-KIND': 'Negative',
    'L8-K3-11-TARGET-COMPOSITION': 'Negative',
    'L8-K3-12-BASE': 'Positive',
    'L8-K3-12-POST-NEGATIVE': 'Positive',
    'L8-K3-12-POST-OBSERVATION-MISSING': 'Positive',
    'L8-K3-12-POST-OBSERVED-AT-NULL': 'Positive',
    'L8-K3-12-POST-UNKNOWN': 'Positive',
    'L8-K3-12-PRE-DRIFT': 'Unknown',
    'L8-K3-12-PRE-EXPIRED': 'Negative',
    'L8-K3-12-PRE-REVOKED': 'Negative',
    'L8-K3-13-BASE': 'Positive',
    'L8-K3-13-DENY-DROPS-UNKNOWN': 'Negative',
    'L8-K3-13-EMPTY-TRUTH': 'Undetermined',
    'L8-K3-13-ISSUER-UNPROVEN': 'Undetermined',
    'L8-K3-13-SECRET-IN-REASON': 'Positive',
    'L8-K3-14-BASE': 'Positive',
    'L8-K3-14-CALLER-BINDING-REJECTED': 'Structure',
    'L8-K3-14-EXTRA-RAW-READ': 'Unknown',
    'L8-K3-14-ROLE-ALIAS-COEXISTS': 'Positive',
    'L8-K3-14a': 'Diagnostic',
    'L8-K3-14b': 'Diagnostic',
    'L8-K3-14c': 'Unknown',
    'L8-K3-14d': 'Unknown',
    'L8-K3-14e': 'Stale',
    'L8-K3-14f': 'Unobserved',
    'L8-K3-14g': 'Stale',
    'L8-K3-14h': 'Unknown',
    'L8-K3-14i': 'Unknown',
    'L8-K3-14j': 'Unobserved',
    'L8-K3-15-ADAPTER': 'Stale',
    'L8-K3-15-AUTHORITY-DECL': 'Stale',
    'L8-K3-15-BASE': 'Value',
    'L8-K3-15-CURRENT-ASSIGNMENT': 'Stale',
    'L8-K3-15-ENVIRONMENT-DECL': 'Stale',
    'L8-K3-15-K3-CODE': 'Stale',
    'L8-K3-15-K3-CONFIG': 'Stale',
    'L8-K3-15-OPERATION-DECL': 'Stale',
    'L8-K3-15-OPERATION-VERSION': 'Unobserved',
    'L8-K3-15-OWNER-DECL': 'Stale',
    'L8-K3-15-POLICY': 'Stale',
    'L8-K3-15-SOURCE-CURRENT-REF': 'Stale',
    'L8-K3-15-TARGET-DECL': 'Stale',
    'L8-K3-16-BASE': 'Positive',
    'L8-K3-16-CALLER-HEAD-DRIFT': 'Unknown',
    'L8-K3-16-REVOCATION-HEAD-A': 'Positive',
    'L8-K3-16-REVOCATION-HEAD-B': 'Positive',
    'L8-K3-16-TIME-OBSERVATION-REF': 'Positive',
    'L8-K3-17-BASE': 'Positive',
    'L8-K3-17-RECOVERY-AFTER-LATER-MOVE': 'Positive',
    'L8-K3-17-RECOVERY-ALREADY-IMMEDIATE': 'Positive',
    'L8-K3-17-RECOVERY-AUTO-MOVE': 'Positive',
    'L8-K3-17-RECOVERY-NOT-A-MOVE': 'Positive',
    'L8-K3-17-RECOVERY-POSTSTOP': 'Positive',
    'L8-K3-17-RECOVERY-RESTART-CONTROL-FLOW': 'Positive',
    'L8-K3-17-RECOVERY-SEQ-PLUS-ONE': 'Positive',
    'L8-K3-17-RECOVERY-WRONG-MOVE': 'Positive',
    'L8-K3-17-RECOVERY-WRONG-SEGMENT': 'Positive',
}


def _expected(l8_id: str) -> str:
    try:
        return FORMAL_EXPECTED_KIND_BY_L8_ID[l8_id]
    except KeyError as exc:
        raise AssertionError(f"Unregistered L8 fixture ID: {l8_id}") from exc


class K3FormalFixtures(unittest.TestCase):
    def _exercise(self, ut_id: str, l8_id: str) -> None:
        expectation = _expected(l8_id)
        if expectation == "Structure":
            self.assertEqual(
                tuple(inspect.signature(k3.check_permission).parameters),
                ("query", "permission", "input_heads"),
            )
            return
        if any(token in l8_id for token in ("LOOKUP-STALE", "03-DIGEST", "03-IDENTITY", "14e", "14f", "14g", "14h", "14i", "14j", "15-")):
            observed, current_key = _lookup_case(l8_id)
            expected_type = {
                "Value": Value,
                "Stale": Stale,
                "Unknown": Unknown,
                "Unobserved": Unobserved,
            }.get(expectation)
            self.assertIsNotNone(expected_type, f"{ut_id} {l8_id}: lookup fixture has no exact expectation")
            self.assertIsInstance(observed, expected_type, f"{ut_id} {l8_id}")
            if isinstance(observed, Stale):
                self.assertEqual(observed.prior.key, observed.recorded_key)
                self.assertEqual(observed.current_key, current_key)
                self.assertNotEqual(observed.current_key, observed.recorded_key)
            return

        query, permission, mapping, owner_data, source, assurance, key = _baseline(l8_id)
        axis_observations = dict(owner_data.axis_observations)
        component_observations = dict(owner_data.component_observations)
        current_ctx = owner_data.context
        assert current_ctx is not None
        record = source.record
        assert record is not None
        tuple_value = record.tuple

        if l8_id == "L8-K3-01-KEY-MISSING":
            mapping = None
        elif l8_id.endswith("CALLER-BINDING-REJECTED"):
            self.assertEqual(
                tuple(inspect.signature(k3.resolve_authority_context).parameters),
                ("query", "input_heads"),
            )
            self.assertNotIn("mapping", inspect.signature(k3.resolve_authority_context).parameters)
            return
        elif l8_id.endswith("14a"):
            mapping = replace(mapping, binding_ref=None)
        elif l8_id.endswith("14b"):
            duplicate = replace(mapping.role_inputs[0], raw_ref=replace(mapping.role_inputs[0].raw_ref, revision="different"))
            mapping = replace(mapping, role_inputs=(mapping.role_inputs[0], duplicate, *mapping.role_inputs[1:]))
        elif ("MISSING" in l8_id or "UNKNOWN" in l8_id or "UNREADABLE" in l8_id or "UNPARSABLE" in l8_id or "UNPROVEN" in l8_id or "UNREGISTERED" in l8_id or "CONFLICT" in l8_id or "SIGNATURE" in l8_id or "RECEIPT-SUBSTITUTE" in l8_id or "SELF-ISSUED" in l8_id or "SAME-NAME-DIFFERENT-SOURCE" in l8_id) and "POST-" not in l8_id:
            axis_name = next((name for name in ("actor", "target", "operation", "revision", "environment", "scope", "expiry") if f"-{name}-" in l8_id), None)
            if l8_id.endswith("OWNER-MISSING") or l8_id.endswith("OWNER-UNREGISTERED") or l8_id.endswith("OWNER-CONFLICT"):
                why = "missing_input" if l8_id.endswith("MISSING") else "unregistered" if l8_id.endswith("UNREGISTERED") else "conflict"
                owner_data = replace(
                    owner_data,
                    missing_identities=("target_owner",),
                    unavailable_reason=why,
                    component_observations={"target_owner": Unknown(why, key)},
                )
                axis_observations["target"] = Unknown(why, key)
            elif axis_name == "expiry" or "TIME-UNREADABLE" in l8_id or "EXPIRY-UNPARSABLE" in l8_id:
                if l8_id.startswith("L8-K3-01-expiry-"):
                    reason = "conflict" if l8_id.endswith("CONFLICT") else "missing_input"
                else:
                    reason = "unreadable" if "UNREADABLE" in l8_id else "missing_input" if "MISSING" in l8_id else "unsupported"
                source = replace(source, expiry_observation=Unknown(reason, key))
            elif "SIGNATURE" in l8_id:
                source = replace(source, record=None, selector_observation=Unknown("unsupported", key))
            elif "SAME-NAME-DIFFERENT-SOURCE" in l8_id:
                source = replace(source, record=None, selector_observation=Unknown("conflict", key))
            elif "UNREGISTERED" in l8_id or "SELF-ISSUED" in l8_id or "UNKNOWN-RULE" in l8_id:
                source = replace(source, record=None, selector_observation=Unknown("unregistered", key))
            elif "RECEIPT-SUBSTITUTE" in l8_id:
                source = replace(source, record=None, selector_observation=Unknown("missing_input", key))
                assurance = replace(assurance, reverifiable=Value(k3.CheckValue.MATCH, key, {}), reproduction=Value(k3.CheckValue.MATCH, key, {}), issuer_authenticity=Value(k3.CheckValue.MATCH, key, {}))
            elif "CONFLICTING-CANDIDATES" in l8_id:
                source = replace(source, record=None, selector_observation=Unknown("conflict", key))
            elif axis_name:
                token = l8_id.rsplit("-", 1)[1]
                reason = "conflict" if token == "CONFLICT" else "missing_input" if token in ("MISSING", "UNKNOWN") else "unsupported"
                axis_observations[axis_name] = Unknown(reason, key)
            else:
                source = replace(source, selector_observation=Unknown("missing_input", key))

        if "MISMATCH" in l8_id or l8_id.endswith("ASSIGNMENT") or l8_id.endswith("SCOPE-PROJECT") or l8_id.endswith("SCOPE-ENVIRONMENT") or l8_id.endswith("SCOPE-WORKTREE") or l8_id.endswith("SCOPE-TENANT"):
            axis_name = next((name for name in ("actor", "target", "operation", "revision", "environment", "scope") if f"-{name}-MISMATCH" in l8_id), None)
            if l8_id.endswith("ASSIGNMENT"):
                tuple_value = replace(tuple_value, actor="worker-B")
            elif axis_name == "actor":
                tuple_value = replace(tuple_value, actor="worker-B")
            elif axis_name == "target":
                tuple_value = replace(tuple_value, target="stage-B")
            elif axis_name == "operation":
                tuple_value = replace(tuple_value, operation="write")
            elif axis_name == "revision":
                tuple_value = replace(tuple_value, revision=replace(tuple_value.revision, revision="r2"))
            elif axis_name == "environment":
                tuple_value = replace(tuple_value, environment=replace(tuple_value.environment, identity="environment-B"))
            else:
                tuple_value = replace(tuple_value, scope="project:other/worktree:other")

        if "READ-AS-" in l8_id:
            query = replace(query, operation=_operation_from_fixture(l8_id))
        if "FRESH-REVISION" in l8_id:
            new_revision = replace(query.revision, revision="r2", digest=D2)
            query = replace(query, revision=replace(query.revision, revision="r1", digest=D1))
            current_ctx = replace(current_ctx, tuple=replace(current_ctx.tuple, revision=new_revision))
            tuple_value = replace(tuple_value, revision=new_revision)
        if l8_id.endswith("ISSUER-MISMATCH"):
            record = replace(record, issuer="issuer-B")
            source = replace(source, record=record, declared_issuer="issuer-A")
        if l8_id.endswith("CURRENT-DENY") or l8_id.endswith("DENY") or l8_id.endswith("PRE-REVOKED"):
            record = replace(record, outcome="deny")
        if l8_id.endswith("CURRENT-CONSTRAIN"):
            constraint = ref("pre-execution-constraint", kind="constraint")
            record = replace(record, outcome="constrain", constraints=(constraint,))
            current_ctx = replace(current_ctx, pre_execution_constraints=(constraint,))
            component_observations[f"constraint:{constraint.identity}"] = Value(k3.CheckValue.MATCH, key, {"constraint": "owner stub"})
        if l8_id.endswith("EXPIRED") or l8_id.endswith("PRE-EXPIRED") or "-expiry-MISMATCH" in l8_id:
            source = replace(source, expiry_observation=Value(k3.CheckValue.MISMATCH, key, {}))
        if l8_id.endswith("PRE-DRIFT") or l8_id.endswith("CALLER-HEAD-DRIFT"):
            input_heads = (ref("old-revocation-head", kind="k3_head_observation"),)
        else:
            input_heads = mapping.current_heads if mapping is not None else ()

        if l8_id.endswith("CONSTRAINT-SETTING-MISSING"):
            component_observations["pre_execution_constraint"] = Unknown("missing_input", key)
        if l8_id.endswith("PRECONDITION-UNOBSERVED"):
            component_observations["pre_execution_constraint"] = Unobserved(key, "not_run")
        if l8_id.endswith("CONSTRAINT-EVIDENCE-MISSING"):
            component_observations["constraint_evidence"] = Unknown("missing_input", key)
        if l8_id.endswith("CONSTRAINT-RELAXED"):
            component_observations["constraint"] = Value(k3.CheckValue.MISMATCH, key, {})
        if l8_id.endswith("REVOKED") or l8_id.endswith("PRE-REVOKED"):
            owner_data = replace(
                owner_data,
                revocation_snapshot=k3.RevocationSnapshot(
                    current_ctx.revocation_heads,
                    Value(k3.CheckValue.MISMATCH, key, {"revocation": "revoked"}),
                ),
            )
        if "POST-" in l8_id:
            component_observations = dict(component_observations)
            component_observations.pop("later_unknown", None)
            owner_data = replace(owner_data, revocation_snapshot=None)
        if l8_id.endswith("SEGMENT-MISSING"):
            heads = (k3.SegmentHead("revocation-segment", 1, D1),)
            current_ctx = replace(current_ctx, revocation_heads=heads)
            owner_data = replace(
                owner_data,
                context=current_ctx,
                revocation_snapshot=k3.RevocationSnapshot(
                    heads, Unknown("missing_input", key, {"revocation": "missing"})
                ),
            )
        if l8_id.endswith("SEGMENT-UNREADABLE"):
            heads = (k3.SegmentHead("revocation-segment", 1, D1),)
            current_ctx = replace(current_ctx, revocation_heads=heads)
            owner_data = replace(
                owner_data,
                context=current_ctx,
                revocation_snapshot=k3.RevocationSnapshot(
                    heads, Unknown("unreadable", key, {"revocation": "unreadable"})
                ),
            )
        if l8_id.endswith("EXTRA-RAW-READ") or l8_id.endswith("14c") or l8_id.endswith("14d"):
            assurance = replace(assurance, reverifiable=Unknown("conflict", key))
        if l8_id.endswith("ISSUER-UNPROVEN"):
            assurance = replace(assurance, issuer_authenticity=Unknown("unsupported", key))
        if l8_id.endswith("DENY-DROPS-UNKNOWN"):
            record = replace(record, outcome="deny")
            component_observations["later_unknown"] = Unknown("unreadable", key)
        if l8_id.endswith("EMPTY-TRUTH"):
            combined = k3._combine_components(())
            self.assertEqual(combined.verdict, Verdict.UNDETERMINED)
            self.assertEqual(combined.set_reason.class_name, "Unknown")
            self.assertEqual(combined.set_reason.reason, "missing_input")
            return
        if l8_id.endswith("SECRET-IN-REASON"):
            record = replace(record, reason="private-secret-sentinel")
        if "EXTRA-KEY" in l8_id:
            extra = ref("extra-required-input")
            query = replace(query, operation_inputs={**query.operation_inputs, "extra": extra})
            record = replace(record, operation_inputs={**record.operation_inputs, "extra": extra})
        if "REQUIRED-KEY-MISSING" in l8_id:
            query = replace(query, operation_inputs={"purpose": query.operation_inputs["purpose"]})
        if "RECORD-BINDING-MISMATCH" in l8_id:
            record_inputs = dict(record.operation_inputs)
            record_inputs["source"] = replace(record_inputs["source"], identity="other-source")
            record = replace(record, operation_inputs=record_inputs)
        if "TARGET-COMPOSITION" in l8_id:
            tuple_value = replace(tuple_value, revision=replace(tuple_value.revision, identity="other-composition"))
        if "MOVE-ACTION-KIND" in l8_id:
            query_inputs = dict(query.operation_inputs)
            query_inputs["purpose"] = replace(query_inputs["purpose"], revision="another-kind")
            query = replace(query, operation_inputs=query_inputs)

        # Every current K3 key is query-scoped. If the fixture mutates the
        # query, rebuild the owner binding and re-key its stub observations so
        # that this case reaches the intended one-axis comparison.
        if mapping is not None and k3._query_ref(query) != k3._query_ref(_baseline(l8_id)[0]):
            mapping = _refresh_query_binding(query, mapping)
            key = k3._key(permission, k3._query_ref(query), current_ctx, mapping)
            for field_name in ("selector_observation", "expiry_observation"):
                source = replace(source, **{field_name: _rekey(getattr(source, field_name), key)})
            owner_data = replace(
                owner_data,
                axis_observations={name: _rekey(value, key) for name, value in axis_observations.items()},
                component_observations={name: _rekey(value, key) for name, value in component_observations.items()},
            )
            assurance = replace(
                assurance,
                reverifiable=_rekey(assurance.reverifiable, key),
                reproduction=_rekey(assurance.reproduction, key),
                issuer_authenticity=_rekey(assurance.issuer_authenticity, key),
            )
            axis_observations = dict(owner_data.axis_observations)
            component_observations = dict(owner_data.component_observations)

        record = replace(record, tuple=tuple_value)
        if source.record is not None:
            source = replace(source, record=record)
        owner_data = replace(
            owner_data,
            context=current_ctx,
            axis_observations=axis_observations,
            component_observations=component_observations,
        )
        if l8_id.endswith("ROLE-ALIAS-COEXISTS"):
            shared_identity = ref("shared-raw", revision="r1", kind="source")
            second_role = k3.RoleInput("second-role", replace(shared_identity, revision="r2"))
            first_role = k3.RoleInput("first-role", shared_identity)
            roles = (first_role, second_role, *mapping.role_inputs)
            aliases = [
                ({"query_identity": k3._query_ref(query).identity}, item.role, item.raw_ref, k3._authority_input_ref(item))
                for item in roles
            ]
            bid = _canonical_json_bytes({"owner": "SECURITY", "operation": k3.K3_OPERATION, "query": k3._query_ref(query).identity}).decode()
            bind = k3._bind_alias_inputs(aliases, "k3_authority_input_binding", bid)
            mapping = replace(mapping, role_inputs=roles, binding_bytes=bind.canonical_bytes, binding_ref=bind.binding_ref)
            input_heads = mapping.current_heads

        if l8_id.endswith("REQUEST") or l8_id.endswith("ACK") or l8_id.endswith("REVIEW") or l8_id.endswith("CI-GREEN") or l8_id.endswith("CHECK-SUCCESS"):
            # Trigger markers belong to the downstream consumer and are not K3 API arguments.
            self.assertNotIn("trigger", inspect.signature(k3.check_permission).parameters)

        if mapping is None:
            with patch.object(k3, "_owner_mapping", return_value=None):
                result = k3.check_permission(query, permission, input_heads)
        else:
            with (
                patch.object(k3, "_owner_mapping", return_value=mapping),
                patch.object(k3, "_owner_context", return_value=owner_data),
                patch.object(k3, "_permission_source", return_value=source),
                patch.object(k3, "_k6_assurance", return_value=assurance),
            ):
                result = k3.check_permission(query, permission, input_heads)

        if expectation == "Diagnostic":
            self.assertIsInstance(result, k3.PermissionCheckDiagnostic, f"{ut_id} {l8_id}")
            self.assertEqual(result.reason, "missing_key")
            return
        self.assertIsInstance(result, k3.PermissionCheckResult, f"{ut_id} {l8_id}")
        self.assertEqual(result.authority_effect, "none")
        actual = result.combined.verdict.value
        expected_verdict = {
            "Positive": "Positive",
            "Negative": "Negative",
            "Unknown": "Undetermined",
            "Undetermined": "Undetermined",
        }.get(expectation, expectation)
        self.assertEqual(actual, expected_verdict, f"{ut_id} {l8_id} component classes={[type(c.observed).__name__ for c in result.components]}")
        # Check the individual axis result as well as the aggregate verdict.
        for axis in ("actor", "target", "operation", "revision", "environment", "scope", "expiry"):
            prefix = f"L8-K3-01-{axis}-"
            if not l8_id.startswith(prefix):
                continue
            state = l8_id.removeprefix(prefix)
            component = next(item.observed for item in result.components if item.identity == axis)
            if state == "MISMATCH":
                self.assertIsInstance(component, Value)
                self.assertIs(component.value, k3.CheckValue.MISMATCH)
            else:
                self.assertIsInstance(component, Unknown)
                expected_reason = "conflict" if state == "CONFLICT" else "missing_input"
                self.assertEqual(component.reason, expected_reason)
        if l8_id == "L8-K3-10-REQUIRED-KEY-MISSING":
            self.assertEqual(set(query.operation_inputs), {"purpose"})
            self.assertEqual(set(record.operation_inputs), {"purpose", "classification", "source", "destination"})
            self.assertEqual(set(current_ctx.operation_inputs), set(record.operation_inputs))
            missing_components = {
                component.identity: component.observed
                for component in result.components
                if component.identity in {
                    "operation_input:classification",
                    "operation_input:source",
                    "operation_input:destination",
                }
            }
            self.assertEqual(set(missing_components), {
                "operation_input:classification",
                "operation_input:source",
                "operation_input:destination",
            })
            for observed in missing_components.values():
                self.assertIsInstance(observed, Unknown)
                self.assertEqual(observed.reason, "missing_input")
        if "SECRET-IN-REASON" in l8_id:
            self.assertNotIn("private-secret-sentinel", repr(result))
        if "DENY-DROPS-UNKNOWN" in l8_id:
            self.assertEqual(len(result.combined.components), len(result.components))
            self.assertIn("later_unknown", [component.identity for component in result.components])
        if "ROLE-ALIAS-COEXISTS" in l8_id:
            alias_ids = [k3._authority_input_ref(item).identity for item in mapping.role_inputs]
            self.assertNotEqual(alias_ids[0], alias_ids[1])
            self.assertNotIsInstance(k3._binding_inputs(result.query, mapping), k3.Rejected)
        if "CALLER-HEAD-DRIFT" in l8_id:
            self.assertIn("caller_expected_heads", [component.identity for component in result.components])
        if "OLD-EPOCH-ACTION" in l8_id or "RECOVERY-" in l8_id or "POST-" in l8_id:
            self.assertEqual(result.authority_effect, "none")


    # L7固定194行。各method名は静的に定義し、実行時suffix生成をしない。
    def test_CK_K3_UT_001(self):
        self._exercise("CK-K3-UT-001", "L8-K3-01-BASE")

    def test_CK_K3_UT_002(self):
        self._exercise("CK-K3-UT-002", "L8-K3-01-actor-MISSING")

    def test_CK_K3_UT_003(self):
        self._exercise("CK-K3-UT-003", "L8-K3-01-actor-UNKNOWN")

    def test_CK_K3_UT_004(self):
        self._exercise("CK-K3-UT-004", "L8-K3-01-actor-CONFLICT")

    def test_CK_K3_UT_005(self):
        self._exercise("CK-K3-UT-005", "L8-K3-01-actor-MISMATCH")

    def test_CK_K3_UT_006(self):
        self._exercise("CK-K3-UT-006", "L8-K3-01-target-MISSING")

    def test_CK_K3_UT_007(self):
        self._exercise("CK-K3-UT-007", "L8-K3-01-target-UNKNOWN")

    def test_CK_K3_UT_008(self):
        self._exercise("CK-K3-UT-008", "L8-K3-01-target-CONFLICT")

    def test_CK_K3_UT_009(self):
        self._exercise("CK-K3-UT-009", "L8-K3-01-target-MISMATCH")

    def test_CK_K3_UT_010(self):
        self._exercise("CK-K3-UT-010", "L8-K3-01-operation-MISSING")

    def test_CK_K3_UT_011(self):
        self._exercise("CK-K3-UT-011", "L8-K3-01-operation-UNKNOWN")

    def test_CK_K3_UT_012(self):
        self._exercise("CK-K3-UT-012", "L8-K3-01-operation-CONFLICT")

    def test_CK_K3_UT_013(self):
        self._exercise("CK-K3-UT-013", "L8-K3-01-operation-MISMATCH")

    def test_CK_K3_UT_014(self):
        self._exercise("CK-K3-UT-014", "L8-K3-01-revision-MISSING")

    def test_CK_K3_UT_015(self):
        self._exercise("CK-K3-UT-015", "L8-K3-01-revision-UNKNOWN")

    def test_CK_K3_UT_016(self):
        self._exercise("CK-K3-UT-016", "L8-K3-01-revision-CONFLICT")

    def test_CK_K3_UT_017(self):
        self._exercise("CK-K3-UT-017", "L8-K3-01-revision-MISMATCH")

    def test_CK_K3_UT_018(self):
        self._exercise("CK-K3-UT-018", "L8-K3-01-environment-MISSING")

    def test_CK_K3_UT_019(self):
        self._exercise("CK-K3-UT-019", "L8-K3-01-environment-UNKNOWN")

    def test_CK_K3_UT_020(self):
        self._exercise("CK-K3-UT-020", "L8-K3-01-environment-CONFLICT")

    def test_CK_K3_UT_021(self):
        self._exercise("CK-K3-UT-021", "L8-K3-01-environment-MISMATCH")

    def test_CK_K3_UT_022(self):
        self._exercise("CK-K3-UT-022", "L8-K3-01-scope-MISSING")

    def test_CK_K3_UT_023(self):
        self._exercise("CK-K3-UT-023", "L8-K3-01-scope-UNKNOWN")

    def test_CK_K3_UT_024(self):
        self._exercise("CK-K3-UT-024", "L8-K3-01-scope-CONFLICT")

    def test_CK_K3_UT_025(self):
        self._exercise("CK-K3-UT-025", "L8-K3-01-scope-MISMATCH")

    def test_CK_K3_UT_026(self):
        self._exercise("CK-K3-UT-026", "L8-K3-01-expiry-MISSING")

    def test_CK_K3_UT_027(self):
        self._exercise("CK-K3-UT-027", "L8-K3-01-expiry-UNKNOWN")

    def test_CK_K3_UT_028(self):
        self._exercise("CK-K3-UT-028", "L8-K3-01-expiry-CONFLICT")

    def test_CK_K3_UT_029(self):
        self._exercise("CK-K3-UT-029", "L8-K3-01-expiry-MISMATCH")

    def test_CK_K3_UT_030(self):
        self._exercise("CK-K3-UT-030", "L8-K3-01-SCOPE-PROJECT")

    def test_CK_K3_UT_031(self):
        self._exercise("CK-K3-UT-031", "L8-K3-01-SCOPE-ENVIRONMENT")

    def test_CK_K3_UT_032(self):
        self._exercise("CK-K3-UT-032", "L8-K3-01-SCOPE-WORKTREE")

    def test_CK_K3_UT_033(self):
        self._exercise("CK-K3-UT-033", "L8-K3-01-SCOPE-TENANT")

    def test_CK_K3_UT_034(self):
        self._exercise("CK-K3-UT-034", "L8-K3-01-OWNER-MISSING")

    def test_CK_K3_UT_035(self):
        self._exercise("CK-K3-UT-035", "L8-K3-01-OWNER-UNREGISTERED")

    def test_CK_K3_UT_036(self):
        self._exercise("CK-K3-UT-036", "L8-K3-01-OWNER-CONFLICT")

    def test_CK_K3_UT_037(self):
        self._exercise("CK-K3-UT-037", "L8-K3-01-ASSIGNMENT")

    def test_CK_K3_UT_038(self):
        self._exercise("CK-K3-UT-038", "L8-K3-01-KEY-MISSING")

    def test_CK_K3_UT_039(self):
        self._exercise("CK-K3-UT-039", "L8-K3-02-ALLOW-read")

    def test_CK_K3_UT_040(self):
        self._exercise("CK-K3-UT-040", "L8-K3-02-ALLOW-write")

    def test_CK_K3_UT_041(self):
        self._exercise("CK-K3-UT-041", "L8-K3-02-ALLOW-execute")

    def test_CK_K3_UT_042(self):
        self._exercise("CK-K3-UT-042", "L8-K3-02-ALLOW-network")

    def test_CK_K3_UT_043(self):
        self._exercise("CK-K3-UT-043", "L8-K3-02-ALLOW-install")

    def test_CK_K3_UT_044(self):
        self._exercise("CK-K3-UT-044", "L8-K3-02-ALLOW-delete")

    def test_CK_K3_UT_045(self):
        self._exercise("CK-K3-UT-045", "L8-K3-02-ALLOW-merge")

    def test_CK_K3_UT_046(self):
        self._exercise("CK-K3-UT-046", "L8-K3-02-ALLOW-release")

    def test_CK_K3_UT_047(self):
        self._exercise("CK-K3-UT-047", "L8-K3-02-ALLOW-deploy")

    def test_CK_K3_UT_048(self):
        self._exercise("CK-K3-UT-048", "L8-K3-02-ALLOW-credential-use")

    def test_CK_K3_UT_049(self):
        self._exercise("CK-K3-UT-049", "L8-K3-02-ALLOW-security-change")

    def test_CK_K3_UT_050(self):
        self._exercise("CK-K3-UT-050", "L8-K3-02-READ-AS-write")

    def test_CK_K3_UT_051(self):
        self._exercise("CK-K3-UT-051", "L8-K3-02-READ-AS-execute")

    def test_CK_K3_UT_052(self):
        self._exercise("CK-K3-UT-052", "L8-K3-02-READ-AS-network")

    def test_CK_K3_UT_053(self):
        self._exercise("CK-K3-UT-053", "L8-K3-02-READ-AS-install")

    def test_CK_K3_UT_054(self):
        self._exercise("CK-K3-UT-054", "L8-K3-02-READ-AS-delete")

    def test_CK_K3_UT_055(self):
        self._exercise("CK-K3-UT-055", "L8-K3-02-READ-AS-merge")

    def test_CK_K3_UT_056(self):
        self._exercise("CK-K3-UT-056", "L8-K3-02-READ-AS-release")

    def test_CK_K3_UT_057(self):
        self._exercise("CK-K3-UT-057", "L8-K3-02-READ-AS-deploy")

    def test_CK_K3_UT_058(self):
        self._exercise("CK-K3-UT-058", "L8-K3-02-READ-AS-credential-use")

    def test_CK_K3_UT_059(self):
        self._exercise("CK-K3-UT-059", "L8-K3-02-READ-AS-security-change")

    def test_CK_K3_UT_060(self):
        self._exercise("CK-K3-UT-060", "L8-K3-03-FRESH-REVISION")

    def test_CK_K3_UT_061(self):
        self._exercise("CK-K3-UT-061", "L8-K3-03-LOOKUP-STALE")

    def test_CK_K3_UT_062(self):
        self._exercise("CK-K3-UT-062", "L8-K3-03-DIGEST")

    def test_CK_K3_UT_063(self):
        self._exercise("CK-K3-UT-063", "L8-K3-03-IDENTITY")

    def test_CK_K3_UT_064(self):
        self._exercise("CK-K3-UT-064", "L8-K3-04-SELF-ISSUED")

    def test_CK_K3_UT_065(self):
        self._exercise("CK-K3-UT-065", "L8-K3-04-UNREGISTERED-SOURCE")

    def test_CK_K3_UT_066(self):
        self._exercise("CK-K3-UT-066", "L8-K3-04-SAME-NAME-DIFFERENT-SOURCE")

    def test_CK_K3_UT_067(self):
        self._exercise("CK-K3-UT-067", "L8-K3-04-ISSUER-MISMATCH")

    def test_CK_K3_UT_068(self):
        self._exercise("CK-K3-UT-068", "L8-K3-04-SIGNATURE-INVALID")

    def test_CK_K3_UT_069(self):
        self._exercise("CK-K3-UT-069", "L8-K3-04-SIGNATURE-UNVERIFIABLE")

    def test_CK_K3_UT_070(self):
        self._exercise("CK-K3-UT-070", "L8-K3-04-CURRENT-DENY")

    def test_CK_K3_UT_071(self):
        self._exercise("CK-K3-UT-071", "L8-K3-04-CURRENT-CONSTRAIN")

    def test_CK_K3_UT_072(self):
        self._exercise("CK-K3-UT-072", "L8-K3-04-SELECTION-UNKNOWN-RULE")

    def test_CK_K3_UT_073(self):
        self._exercise("CK-K3-UT-073", "L8-K3-04-SELECTION-CONFLICTING-CANDIDATES")

    def test_CK_K3_UT_074(self):
        self._exercise("CK-K3-UT-074", "L8-K3-04-RECEIPT-SUBSTITUTE")

    def test_CK_K3_UT_075(self):
        self._exercise("CK-K3-UT-075", "L8-K3-05-DENY")

    def test_CK_K3_UT_076(self):
        self._exercise("CK-K3-UT-076", "L8-K3-05-CONSTRAINT-SETTING-MISSING")

    def test_CK_K3_UT_077(self):
        self._exercise("CK-K3-UT-077", "L8-K3-05-PRECONDITION-UNOBSERVED")

    def test_CK_K3_UT_078(self):
        self._exercise("CK-K3-UT-078", "L8-K3-05-CONSTRAINT-EVIDENCE-MISSING")

    def test_CK_K3_UT_079(self):
        self._exercise("CK-K3-UT-079", "L8-K3-05-CONSTRAINT-RELAXED")

    def test_CK_K3_UT_080(self):
        self._exercise("CK-K3-UT-080", "L8-K3-06-REQUEST")

    def test_CK_K3_UT_081(self):
        self._exercise("CK-K3-UT-081", "L8-K3-06-ACK")

    def test_CK_K3_UT_082(self):
        self._exercise("CK-K3-UT-082", "L8-K3-06-REVIEW")

    def test_CK_K3_UT_083(self):
        self._exercise("CK-K3-UT-083", "L8-K3-06-CI-GREEN")

    def test_CK_K3_UT_084(self):
        self._exercise("CK-K3-UT-084", "L8-K3-06-CHECK-SUCCESS")

    def test_CK_K3_UT_085(self):
        self._exercise("CK-K3-UT-085", "L8-K3-07-EXPIRED")

    def test_CK_K3_UT_086(self):
        self._exercise("CK-K3-UT-086", "L8-K3-07-TIME-UNREADABLE")

    def test_CK_K3_UT_087(self):
        self._exercise("CK-K3-UT-087", "L8-K3-07-EXPIRY-UNPARSABLE")

    def test_CK_K3_UT_088(self):
        self._exercise("CK-K3-UT-088", "L8-K3-08-REVOKED")

    def test_CK_K3_UT_089(self):
        self._exercise("CK-K3-UT-089", "L8-K3-08-SEGMENT-MISSING")

    def test_CK_K3_UT_090(self):
        self._exercise("CK-K3-UT-090", "L8-K3-08-SEGMENT-UNREADABLE")

    def test_CK_K3_UT_091(self):
        self._exercise("CK-K3-UT-091", "L8-K3-08-OLD-EPOCH-ACTION")

    def test_CK_K3_UT_092(self):
        self._exercise("CK-K3-UT-092", "L8-K3-08-OUT-OF-SCOPE-STOP")

    def test_CK_K3_UT_093(self):
        self._exercise("CK-K3-UT-093", "L8-K3-08-G5-ONLY")

    def test_CK_K3_UT_094(self):
        self._exercise("CK-K3-UT-094", "L8-K3-09-BASE")

    def test_CK_K3_UT_095(self):
        self._exercise("CK-K3-UT-095", "L8-K3-09-request-actor")

    def test_CK_K3_UT_096(self):
        self._exercise("CK-K3-UT-096", "L8-K3-09-request-target")

    def test_CK_K3_UT_097(self):
        self._exercise("CK-K3-UT-097", "L8-K3-09-request-operation")

    def test_CK_K3_UT_098(self):
        self._exercise("CK-K3-UT-098", "L8-K3-09-request-revision")

    def test_CK_K3_UT_099(self):
        self._exercise("CK-K3-UT-099", "L8-K3-09-request-environment")

    def test_CK_K3_UT_100(self):
        self._exercise("CK-K3-UT-100", "L8-K3-09-request-scope")

    def test_CK_K3_UT_101(self):
        self._exercise("CK-K3-UT-101", "L8-K3-09-request-expiry")

    def test_CK_K3_UT_102(self):
        self._exercise("CK-K3-UT-102", "L8-K3-09-decision-actor")

    def test_CK_K3_UT_103(self):
        self._exercise("CK-K3-UT-103", "L8-K3-09-decision-target")

    def test_CK_K3_UT_104(self):
        self._exercise("CK-K3-UT-104", "L8-K3-09-decision-operation")

    def test_CK_K3_UT_105(self):
        self._exercise("CK-K3-UT-105", "L8-K3-09-decision-revision")

    def test_CK_K3_UT_106(self):
        self._exercise("CK-K3-UT-106", "L8-K3-09-decision-environment")

    def test_CK_K3_UT_107(self):
        self._exercise("CK-K3-UT-107", "L8-K3-09-decision-scope")

    def test_CK_K3_UT_108(self):
        self._exercise("CK-K3-UT-108", "L8-K3-09-decision-expiry")

    def test_CK_K3_UT_109(self):
        self._exercise("CK-K3-UT-109", "L8-K3-09-assignment-actor")

    def test_CK_K3_UT_110(self):
        self._exercise("CK-K3-UT-110", "L8-K3-09-assignment-target")

    def test_CK_K3_UT_111(self):
        self._exercise("CK-K3-UT-111", "L8-K3-09-assignment-operation")

    def test_CK_K3_UT_112(self):
        self._exercise("CK-K3-UT-112", "L8-K3-09-assignment-revision")

    def test_CK_K3_UT_113(self):
        self._exercise("CK-K3-UT-113", "L8-K3-09-assignment-environment")

    def test_CK_K3_UT_114(self):
        self._exercise("CK-K3-UT-114", "L8-K3-09-assignment-scope")

    def test_CK_K3_UT_115(self):
        self._exercise("CK-K3-UT-115", "L8-K3-09-assignment-expiry")

    def test_CK_K3_UT_116(self):
        self._exercise("CK-K3-UT-116", "L8-K3-09-effective_scope-actor")

    def test_CK_K3_UT_117(self):
        self._exercise("CK-K3-UT-117", "L8-K3-09-effective_scope-target")

    def test_CK_K3_UT_118(self):
        self._exercise("CK-K3-UT-118", "L8-K3-09-effective_scope-operation")

    def test_CK_K3_UT_119(self):
        self._exercise("CK-K3-UT-119", "L8-K3-09-effective_scope-revision")

    def test_CK_K3_UT_120(self):
        self._exercise("CK-K3-UT-120", "L8-K3-09-effective_scope-environment")

    def test_CK_K3_UT_121(self):
        self._exercise("CK-K3-UT-121", "L8-K3-09-effective_scope-scope")

    def test_CK_K3_UT_122(self):
        self._exercise("CK-K3-UT-122", "L8-K3-09-effective_scope-expiry")

    def test_CK_K3_UT_123(self):
        self._exercise("CK-K3-UT-123", "L8-K3-10-purpose")

    def test_CK_K3_UT_124(self):
        self._exercise("CK-K3-UT-124", "L8-K3-10-classification")

    def test_CK_K3_UT_125(self):
        self._exercise("CK-K3-UT-125", "L8-K3-10-source")

    def test_CK_K3_UT_126(self):
        self._exercise("CK-K3-UT-126", "L8-K3-10-destination")

    def test_CK_K3_UT_127(self):
        self._exercise("CK-K3-UT-127", "L8-K3-10-REQUIRED-KEY-MISSING")

    def test_CK_K3_UT_128(self):
        self._exercise("CK-K3-UT-128", "L8-K3-10-EXTRA-KEY")

    def test_CK_K3_UT_129(self):
        self._exercise("CK-K3-UT-129", "L8-K3-10-RECORD-BINDING-MISMATCH")

    def test_CK_K3_UT_130(self):
        self._exercise("CK-K3-UT-130", "L8-K3-11-TARGET-COMPOSITION")

    def test_CK_K3_UT_131(self):
        self._exercise("CK-K3-UT-131", "L8-K3-11-MOVE-ACTION-KIND")

    def test_CK_K3_UT_132(self):
        self._exercise("CK-K3-UT-132", "L8-K3-12-PRE-REVOKED")

    def test_CK_K3_UT_133(self):
        self._exercise("CK-K3-UT-133", "L8-K3-12-PRE-EXPIRED")

    def test_CK_K3_UT_134(self):
        self._exercise("CK-K3-UT-134", "L8-K3-12-PRE-DRIFT")

    def test_CK_K3_UT_135(self):
        self._exercise("CK-K3-UT-135", "L8-K3-12-POST-NEGATIVE")

    def test_CK_K3_UT_136(self):
        self._exercise("CK-K3-UT-136", "L8-K3-12-POST-UNKNOWN")

    def test_CK_K3_UT_137(self):
        self._exercise("CK-K3-UT-137", "L8-K3-12-POST-OBSERVATION-MISSING")

    def test_CK_K3_UT_138(self):
        self._exercise("CK-K3-UT-138", "L8-K3-12-POST-OBSERVED-AT-NULL")

    def test_CK_K3_UT_139(self):
        self._exercise("CK-K3-UT-139", "L8-K3-13-DENY-DROPS-UNKNOWN")

    def test_CK_K3_UT_140(self):
        self._exercise("CK-K3-UT-140", "L8-K3-13-EMPTY-TRUTH")

    def test_CK_K3_UT_141(self):
        self._exercise("CK-K3-UT-141", "L8-K3-13-ISSUER-UNPROVEN")

    def test_CK_K3_UT_142(self):
        self._exercise("CK-K3-UT-142", "L8-K3-13-SECRET-IN-REASON")

    def test_CK_K3_UT_143(self):
        self._exercise("CK-K3-UT-143", "L8-K3-14-BASE")

    def test_CK_K3_UT_144(self):
        self._exercise("CK-K3-UT-144", "L8-K3-14a")

    def test_CK_K3_UT_145(self):
        self._exercise("CK-K3-UT-145", "L8-K3-14b")

    def test_CK_K3_UT_146(self):
        self._exercise("CK-K3-UT-146", "L8-K3-14c")

    def test_CK_K3_UT_147(self):
        self._exercise("CK-K3-UT-147", "L8-K3-14d")

    def test_CK_K3_UT_148(self):
        self._exercise("CK-K3-UT-148", "L8-K3-14e")

    def test_CK_K3_UT_149(self):
        self._exercise("CK-K3-UT-149", "L8-K3-14f")

    def test_CK_K3_UT_150(self):
        self._exercise("CK-K3-UT-150", "L8-K3-14g")

    def test_CK_K3_UT_151(self):
        self._exercise("CK-K3-UT-151", "L8-K3-14h")

    def test_CK_K3_UT_152(self):
        self._exercise("CK-K3-UT-152", "L8-K3-14i")

    def test_CK_K3_UT_153(self):
        self._exercise("CK-K3-UT-153", "L8-K3-14j")

    def test_CK_K3_UT_154(self):
        self._exercise("CK-K3-UT-154", "L8-K3-15-OPERATION-VERSION")

    def test_CK_K3_UT_155(self):
        self._exercise("CK-K3-UT-155", "L8-K3-15-K3-CODE")

    def test_CK_K3_UT_156(self):
        self._exercise("CK-K3-UT-156", "L8-K3-15-K3-CONFIG")

    def test_CK_K3_UT_157(self):
        self._exercise("CK-K3-UT-157", "L8-K3-15-CURRENT-ASSIGNMENT")

    def test_CK_K3_UT_158(self):
        self._exercise("CK-K3-UT-158", "L8-K3-15-TARGET-DECL")

    def test_CK_K3_UT_159(self):
        self._exercise("CK-K3-UT-159", "L8-K3-15-ENVIRONMENT-DECL")

    def test_CK_K3_UT_160(self):
        self._exercise("CK-K3-UT-160", "L8-K3-15-OWNER-DECL")

    def test_CK_K3_UT_161(self):
        self._exercise("CK-K3-UT-161", "L8-K3-15-OPERATION-DECL")

    def test_CK_K3_UT_162(self):
        self._exercise("CK-K3-UT-162", "L8-K3-15-AUTHORITY-DECL")

    def test_CK_K3_UT_163(self):
        self._exercise("CK-K3-UT-163", "L8-K3-15-POLICY")

    def test_CK_K3_UT_164(self):
        self._exercise("CK-K3-UT-164", "L8-K3-15-SOURCE-CURRENT-REF")

    def test_CK_K3_UT_165(self):
        self._exercise("CK-K3-UT-165", "L8-K3-15-ADAPTER")

    def test_CK_K3_UT_166(self):
        self._exercise("CK-K3-UT-166", "L8-K3-16-TIME-OBSERVATION-REF")

    def test_CK_K3_UT_167(self):
        self._exercise("CK-K3-UT-167", "L8-K3-16-REVOCATION-HEAD-A")

    def test_CK_K3_UT_168(self):
        self._exercise("CK-K3-UT-168", "L8-K3-16-REVOCATION-HEAD-B")

    def test_CK_K3_UT_169(self):
        self._exercise("CK-K3-UT-169", "L8-K3-16-CALLER-HEAD-DRIFT")

    def test_CK_K3_UT_170(self):
        self._exercise("CK-K3-UT-170", "L8-K3-17-RECOVERY-POSTSTOP")

    def test_CK_K3_UT_171(self):
        self._exercise("CK-K3-UT-171", "L8-K3-17-RECOVERY-AFTER-LATER-MOVE")

    def test_CK_K3_UT_172(self):
        self._exercise("CK-K3-UT-172", "L8-K3-17-RECOVERY-WRONG-SEGMENT")

    def test_CK_K3_UT_173(self):
        self._exercise("CK-K3-UT-173", "L8-K3-17-RECOVERY-WRONG-MOVE")

    def test_CK_K3_UT_174(self):
        self._exercise("CK-K3-UT-174", "L8-K3-17-RECOVERY-SEQ-PLUS-ONE")

    def test_CK_K3_UT_175(self):
        self._exercise("CK-K3-UT-175", "L8-K3-17-RECOVERY-NOT-A-MOVE")

    def test_CK_K3_UT_176(self):
        self._exercise("CK-K3-UT-176", "L8-K3-17-RECOVERY-ALREADY-IMMEDIATE")

    def test_CK_K3_UT_177(self):
        self._exercise("CK-K3-UT-177", "L8-K3-17-RECOVERY-AUTO-MOVE")

    def test_CK_K3_UT_178(self):
        self._exercise("CK-K3-UT-178", "L8-K3-17-RECOVERY-RESTART-CONTROL-FLOW")

    def test_CK_K3_UT_179(self):
        self._exercise("CK-K3-UT-179", "L8-K3-03-BASE")

    def test_CK_K3_UT_180(self):
        self._exercise("CK-K3-UT-180", "L8-K3-04-BASE")

    def test_CK_K3_UT_181(self):
        self._exercise("CK-K3-UT-181", "L8-K3-05-BASE")

    def test_CK_K3_UT_182(self):
        self._exercise("CK-K3-UT-182", "L8-K3-06-BASE")

    def test_CK_K3_UT_183(self):
        self._exercise("CK-K3-UT-183", "L8-K3-07-BASE")

    def test_CK_K3_UT_184(self):
        self._exercise("CK-K3-UT-184", "L8-K3-08-BASE")

    def test_CK_K3_UT_185(self):
        self._exercise("CK-K3-UT-185", "L8-K3-10-BASE")

    def test_CK_K3_UT_186(self):
        self._exercise("CK-K3-UT-186", "L8-K3-11-BASE")

    def test_CK_K3_UT_187(self):
        self._exercise("CK-K3-UT-187", "L8-K3-12-BASE")

    def test_CK_K3_UT_188(self):
        self._exercise("CK-K3-UT-188", "L8-K3-13-BASE")

    def test_CK_K3_UT_189(self):
        self._exercise("CK-K3-UT-189", "L8-K3-14-CALLER-BINDING-REJECTED")

    def test_CK_K3_UT_190(self):
        self._exercise("CK-K3-UT-190", "L8-K3-14-EXTRA-RAW-READ")

    def test_CK_K3_UT_191(self):
        self._exercise("CK-K3-UT-191", "L8-K3-14-ROLE-ALIAS-COEXISTS")

    def test_CK_K3_UT_192(self):
        self._exercise("CK-K3-UT-192", "L8-K3-15-BASE")

    def test_CK_K3_UT_193(self):
        self._exercise("CK-K3-UT-193", "L8-K3-16-BASE")

    def test_CK_K3_UT_194(self):
        self._exercise("CK-K3-UT-194", "L8-K3-17-BASE")

    def test_CK_K3_REG_CURRENT_INPUT_REF(self):
        query, permission, mapping, owner_data, source, assurance, key = _baseline("regression")
        assert owner_data.context is not None and source.record is not None
        old_ref = query.operation_inputs["purpose"]
        current_ref = replace(old_ref, revision="r2", digest=D2)
        # Query and saved record agree; only the owner-current ref changes.
        # Comparing query to saved record alone would incorrectly pass.
        context_inputs = dict(owner_data.context.operation_inputs)
        context_inputs["purpose"] = current_ref
        context = replace(owner_data.context, operation_inputs=context_inputs)
        record_inputs = dict(source.record.operation_inputs)
        record_inputs["purpose"] = old_ref
        record = replace(source.record, operation_inputs=record_inputs)
        owner_data = replace(owner_data, context=context)
        source = replace(source, record=record)
        mapping = _refresh_query_binding(query, mapping)
        key = k3._key(permission, k3._query_ref(query), context, mapping)
        assert not isinstance(key, k3.Rejected)
        source = replace(
            source,
            selector_observation=_rekey(source.selector_observation, key),
            expiry_observation=_rekey(source.expiry_observation, key),
        )
        assurance = replace(
            assurance,
            reverifiable=_rekey(assurance.reverifiable, key),
            reproduction=_rekey(assurance.reproduction, key),
            issuer_authenticity=_rekey(assurance.issuer_authenticity, key),
        )
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=owner_data),
            patch.object(k3, "_permission_source", return_value=source),
            patch.object(k3, "_k6_assurance", return_value=assurance),
        ):
            result = k3.check_permission(query, permission, mapping.current_heads)
        self.assertIsInstance(result, k3.PermissionCheckResult)
        purpose_component = next(
            component for component in result.components
            if component.identity == "operation_input:purpose"
        )
        self.assertIsInstance(purpose_component.observed, Value)
        self.assertIs(purpose_component.observed.value, k3.CheckValue.MISMATCH)
        self.assertEqual(result.combined.verdict, Verdict.NEGATIVE)

    def test_CK_K3_REG_PARTIAL_CONTEXT_OWNER_SCOPE(self):
        query, permission, mapping, owner_data, source, assurance, _ = _baseline("regression")
        owner_scope = {"scope": "owner-current-scope"}
        unavailable = k3.OwnerContextData(
            context=None,
            missing_identities=("permission-current-record",),
            unavailable_reason="unreadable",
            key_scope=owner_scope,
        )
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=unavailable),
        ):
            result = k3.check_permission(query, permission, mapping.current_heads)
        self.assertIsInstance(result, k3.PermissionCheckResult)
        self.assertIsInstance(result.context, k3.Unresolved)
        self.assertEqual(result.context.diagnostic.reason, "unreadable")
        self.assertEqual(result.combined.verdict, Verdict.UNDETERMINED)
        effective = result.effective_decision
        self.assertIsInstance(effective, Unknown)
        self.assertEqual(effective.reason, "unreadable")
        self.assertEqual(effective.key.scope, _canonical_json_bytes(owner_scope).decode("utf-8"))
        self.assertNotEqual(effective.key.scope, query.requested_scope)

    def test_CK_K3_REG_PARTIAL_CONTEXT_NO_SCOPE(self):
        query, permission, mapping, owner_data, source, assurance, _ = _baseline("regression")
        unavailable = k3.OwnerContextData(
            context=None,
            missing_identities=("current_tuple_scope",),
            unavailable_reason="unreadable",
        )
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=unavailable),
        ):
            result = k3.check_permission(query, permission, mapping.current_heads)
        self.assertIsInstance(result, k3.PermissionCheckDiagnostic)
        self.assertEqual(result.reason, "missing_key")
        self.assertEqual(result.missing_identities, ("current_tuple_scope",))

    def test_CK_K3_REG_RECORD_REF_STALE(self):
        query, permission, mapping, owner_data, source, assurance, key = _baseline("regression")
        assert source.record is not None
        record = replace(source.record, ref=replace(source.record.ref, revision="older"))
        source = replace(source, record=record)
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=owner_data),
            patch.object(k3, "_permission_source", return_value=source),
            patch.object(k3, "_k6_assurance", return_value=assurance),
        ):
            result = k3.check_permission(query, permission, mapping.current_heads)
        self.assertIsInstance(result, k3.PermissionCheckResult)
        component = next(c.observed for c in result.components if c.identity == "permission_record_ref")
        self.assertIsInstance(component, Value)
        self.assertIs(component.value, k3.CheckValue.MISMATCH)
        self.assertEqual(result.combined.verdict, Verdict.NEGATIVE)

    def test_CK_K3_REG_RECORD_SOURCE_UNREGISTERED(self):
        query, permission, mapping, owner_data, source, assurance, key = _baseline("regression")
        assert source.record is not None and owner_data.context is not None
        other_source = replace(source.record.source, identity="unregistered-source")
        source = replace(source, record=replace(source.record, source=other_source))
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=owner_data),
            patch.object(k3, "_permission_source", return_value=source),
            patch.object(k3, "_k6_assurance", return_value=assurance),
        ):
            result = k3.check_permission(query, permission, mapping.current_heads)
        self.assertIsInstance(result, k3.PermissionCheckResult)
        component = next(c.observed for c in result.components if c.identity == "registered_source")
        self.assertIsInstance(component, Unknown)
        self.assertEqual(component.reason, "unregistered")
        self.assertEqual(result.combined.verdict, Verdict.UNDETERMINED)

    def test_CK_K3_REG_RECORD_SOURCE_DIGEST_CONFLICT(self):
        query, permission, mapping, owner_data, source, assurance, key = _baseline("regression")
        assert source.record is not None
        conflicting_source = replace(source.record.source, digest=D2)
        source = replace(source, record=replace(source.record, source=conflicting_source))
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=owner_data),
            patch.object(k3, "_permission_source", return_value=source),
            patch.object(k3, "_k6_assurance", return_value=assurance),
        ):
            result = k3.check_permission(query, permission, mapping.current_heads)
        self.assertIsInstance(result, k3.PermissionCheckResult)
        component = next(c.observed for c in result.components if c.identity == "registered_source")
        self.assertIsInstance(component, Unknown)
        self.assertEqual(component.reason, "conflict")
        self.assertEqual(result.combined.verdict, Verdict.UNDETERMINED)

    def test_CK_K3_REG_REVOCATION_HEAD_MISSING(self):
        query, permission, mapping, owner_data, source, assurance, _ = _baseline("regression")
        assert owner_data.context is not None
        head = k3.SegmentHead("revoke-1", 1, D1)
        context = replace(owner_data.context, revocation_heads=(head,))
        owner_data = replace(owner_data, context=context, revocation_snapshot=None)
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=owner_data),
            patch.object(k3, "_permission_source", return_value=source),
            patch.object(k3, "_k6_assurance", return_value=assurance),
        ):
            result = k3.check_permission(query, permission, mapping.current_heads)
        self.assertIsInstance(result, k3.PermissionCheckResult)
        component = next(c.observed for c in result.components if c.identity == "revocation")
        self.assertIsInstance(component, Unknown)
        self.assertEqual(component.reason, "missing_input")
        self.assertEqual(result.combined.verdict, Verdict.UNDETERMINED)

    def test_CK_K3_REG_REVOCATION_HEAD_SET_CONFLICT(self):
        query, permission, mapping, owner_data, source, assurance, key = _baseline("regression")
        assert owner_data.context is not None
        current_head = k3.SegmentHead("revoke-current", 2, D1)
        other_head = k3.SegmentHead("revoke-other", 2, D1)
        context = replace(owner_data.context, revocation_heads=(current_head,))
        snapshot = k3.RevocationSnapshot((other_head,), Value(k3.CheckValue.MATCH, key, {}))
        owner_data = replace(owner_data, context=context, revocation_snapshot=snapshot)
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=owner_data),
            patch.object(k3, "_permission_source", return_value=source),
            patch.object(k3, "_k6_assurance", return_value=assurance),
        ):
            result = k3.check_permission(query, permission, mapping.current_heads)
        self.assertIsInstance(result, k3.PermissionCheckResult)
        component = next(c.observed for c in result.components if c.identity == "revocation")
        self.assertIsInstance(component, Unknown)
        self.assertEqual(component.reason, "conflict")
        self.assertEqual(result.combined.verdict, Verdict.UNDETERMINED)

    def test_CK_K3_REG_REVOCATION_HEAD_SET_ORDER_AND_EXACT_DUPLICATES(self):
        query, permission, mapping, owner_data, source, assurance, key = _baseline("regression")
        assert owner_data.context is not None and owner_data.revocation_snapshot is not None
        head_a = k3.SegmentHead("revoke-a", 1, D1)
        head_b = k3.SegmentHead("revoke-b", 2, D2)
        cases = (
            ("order", (head_a, head_b), (head_b, head_a)),
            ("exact_duplicates", (head_a, head_a, head_b), (head_b, head_a)),
        )
        for label, current_heads, snapshot_heads in cases:
            with self.subTest(case=label):
                context = replace(owner_data.context, revocation_heads=current_heads)
                snapshot = replace(owner_data.revocation_snapshot, heads=snapshot_heads)
                owner_data_case = replace(owner_data, context=context, revocation_snapshot=snapshot)
                with (
                    patch.object(k3, "_owner_mapping", return_value=mapping),
                    patch.object(k3, "_owner_context", return_value=owner_data_case),
                    patch.object(k3, "_permission_source", return_value=source),
                    patch.object(k3, "_k6_assurance", return_value=assurance),
                ):
                    result = k3.check_permission(query, permission, mapping.current_heads)
                self.assertIsInstance(result, k3.PermissionCheckResult)
                component = next(c.observed for c in result.components if c.identity == "revocation")
                self.assertIsInstance(component, Value)
                self.assertIs(component.value, k3.CheckValue.MATCH)

    def test_CK_K3_REG_REVOCATION_OBSERVATION_KEY_PRESERVED(self):
        query, permission, mapping, owner_data, source, assurance, key = _baseline("regression")
        assert owner_data.revocation_snapshot is not None
        source_key = replace(key, scope='"revocation-source-scope"')
        source_observation = replace(owner_data.revocation_snapshot.observation, key=source_key)
        owner_data = replace(
            owner_data,
            revocation_snapshot=replace(owner_data.revocation_snapshot, observation=source_observation),
        )
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=owner_data),
            patch.object(k3, "_permission_source", return_value=source),
            patch.object(k3, "_k6_assurance", return_value=assurance),
        ):
            result = k3.check_permission(query, permission, mapping.current_heads)
        self.assertIsInstance(result, k3.PermissionCheckResult)
        component = next(c.observed for c in result.components if c.identity == "revocation")
        self.assertIsInstance(component, Value)
        self.assertEqual(component.key, source_key)
        self.assertEqual(component.evidence, source_observation.evidence)
        self.assertNotEqual(component.key, key)

    def test_CK_K3_REG_ISSUER_DECL_MISSING(self):
        query, permission, mapping, owner_data, source, assurance, _ = _baseline("regression")
        source = replace(source, declared_issuer=None)
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=owner_data),
            patch.object(k3, "_permission_source", return_value=source),
            patch.object(k3, "_k6_assurance", return_value=assurance),
        ):
            result = k3.check_permission(query, permission, mapping.current_heads)
        self.assertIsInstance(result, k3.PermissionCheckResult)
        component = next(c.observed for c in result.components if c.identity == "issuer")
        self.assertIsInstance(component, Unknown)
        self.assertEqual(component.reason, "missing_input")
        self.assertEqual(result.combined.verdict, Verdict.UNDETERMINED)

    def test_CK_K3_REG_RECORD_MISSING_SELECTOR_POSITIVE(self):
        query, permission, mapping, owner_data, source, assurance, key = _baseline("regression")
        source = replace(source, record=None, selector_observation=Value(permission, key, {}))
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=owner_data),
            patch.object(k3, "_permission_source", return_value=source),
            patch.object(k3, "_k6_assurance", return_value=assurance),
        ):
            result = k3.check_permission(query, permission, mapping.current_heads)
        self.assertIsInstance(result, k3.PermissionCheckResult)
        self.assertIsInstance(result.effective_decision, Unknown)
        self.assertEqual(result.effective_decision.reason, "missing_input")
        self.assertEqual(result.combined.verdict, Verdict.UNDETERMINED)

    def test_CK_K3_REG_OPERATION_INVALID(self):
        query, permission, mapping, owner_data, source, assurance, _ = _baseline("regression")
        for operation in OPS:
            with self.subTest(operation=operation):
                allowed = replace(query, operation=operation)
                with patch.object(k3, "_owner_mapping", return_value=None):
                    checked = k3.check_permission(allowed, permission, mapping.current_heads)
                    resolved = k3.resolve_authority_context(allowed, mapping.current_heads)
                self.assertIsInstance(checked, k3.PermissionCheckDiagnostic)
                self.assertEqual(checked.reason, "missing_key")
                self.assertIsInstance(resolved, k3.Unresolved)
                self.assertEqual(resolved.diagnostic.reason, "missing_input")

        invalid = replace(query, operation="frobnicate")
        with patch.object(k3, "_owner_mapping", side_effect=AssertionError("owner port called")):
            checked = k3.check_permission(invalid, permission, mapping.current_heads)
            resolved = k3.resolve_authority_context(invalid, mapping.current_heads)
        self.assertIsInstance(checked, k3.PermissionCheckDiagnostic)
        self.assertEqual(checked.reason, "invalid_query")
        self.assertIsInstance(resolved, k3.PermissionCheckDiagnostic)
        self.assertEqual(resolved.reason, "invalid_query")

    def test_CK_K3_REG_OUTCOME_CASE_EXACT(self):
        query, permission, mapping, owner_data, source, assurance, _ = _baseline("regression")
        assert source.record is not None
        source = replace(source, record=replace(source.record, outcome="ALLOW"))
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=owner_data),
            patch.object(k3, "_permission_source", return_value=source),
            patch.object(k3, "_k6_assurance", return_value=assurance),
        ):
            result = k3.check_permission(query, permission, mapping.current_heads)
        self.assertIsInstance(result, k3.PermissionCheckResult)
        component = next(c.observed for c in result.components if c.identity == "source_outcome")
        self.assertIsInstance(component, Unknown)
        self.assertEqual(component.reason, "unsupported")
        self.assertEqual(result.combined.verdict, Verdict.UNDETERMINED)

    def test_CK_K3_REG_QUERY_REF_FIELDS(self):
        query, *_ = _baseline("regression")
        baseline = k3._query_ref(query)
        renamed_inputs = dict(query.operation_inputs)
        renamed_inputs["other-purpose"] = renamed_inputs.pop("purpose")
        changed_input_revision = dict(query.operation_inputs)
        changed_input_revision["purpose"] = replace(changed_input_revision["purpose"], revision="r2")
        changed_input_digest = dict(query.operation_inputs)
        changed_input_digest["purpose"] = replace(changed_input_digest["purpose"], digest=D2)
        changes = {
            "operation": replace(query, operation="write"),
            "target": replace(query, target="stage-B"),
            "revision_identity": replace(query, revision=replace(query.revision, identity="composition-B")),
            "revision_revision": replace(query, revision=replace(query.revision, revision="r2")),
            "revision_digest": replace(query, revision=replace(query.revision, digest=D2)),
            "requested_scope": replace(query, requested_scope="project:other/worktree:W"),
            "input_identity": replace(query, operation_inputs=renamed_inputs),
            "input_revision": replace(query, operation_inputs=changed_input_revision),
            "input_digest": replace(query, operation_inputs=changed_input_digest),
        }
        for field_name, changed_query in changes.items():
            with self.subTest(field=field_name):
                changed = k3._query_ref(changed_query)
                self.assertNotEqual(changed.digest, baseline.digest)
                if field_name in {"operation", "target", "revision_identity", "input_identity"}:
                    self.assertNotEqual(changed.identity, baseline.identity)
                else:
                    self.assertEqual(changed.identity, baseline.identity)
                if field_name in {"revision_revision", "input_revision"}:
                    self.assertNotEqual(changed.revision, baseline.revision)
                else:
                    self.assertEqual(changed.revision, baseline.revision)

    def test_CK_K3_REG_QUERY_CONTEXT_TARGET(self):
        query, permission, mapping, owner_data, source, assurance, _ = _baseline("regression")
        assert owner_data.context is not None and source.selector_observation is not None
        query = replace(query, target="stage-B")
        mapping = _refresh_query_binding(query, mapping)
        key = k3._key(permission, k3._query_ref(query), owner_data.context, mapping)
        assert not isinstance(key, k3.Rejected)
        source = replace(
            source,
            selector_observation=_rekey(source.selector_observation, key),
            expiry_observation=_rekey(source.expiry_observation, key),
        )
        assurance = replace(
            assurance,
            reverifiable=_rekey(assurance.reverifiable, key),
            reproduction=_rekey(assurance.reproduction, key),
            issuer_authenticity=_rekey(assurance.issuer_authenticity, key),
        )
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=owner_data),
            patch.object(k3, "_permission_source", return_value=source),
            patch.object(k3, "_k6_assurance", return_value=assurance),
        ):
            result = k3.check_permission(query, permission, mapping.current_heads)
        self.assertIsInstance(result, k3.PermissionCheckResult)
        target = next(c.observed for c in result.components if c.identity == "target")
        self.assertIsInstance(target, Value)
        self.assertIs(target.value, k3.CheckValue.MISMATCH)
        self.assertEqual(result.combined.verdict, Verdict.NEGATIVE)

    def test_CK_K3_REG_RESOLVE_CONTEXT_OUTCOMES(self):
        query, permission, mapping, owner_data, source, assurance, _ = _baseline("regression")
        assert owner_data.context is not None
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(k3, "_owner_context", return_value=owner_data),
        ):
            resolved = k3.resolve_authority_context(query, mapping.current_heads)
            drifted = k3.resolve_authority_context(query, (ref("different-head"),))
        self.assertIsInstance(resolved, k3.Resolved)
        self.assertEqual(resolved.value, owner_data.context)
        self.assertIsInstance(drifted, k3.Unresolved)
        self.assertEqual(drifted.diagnostic.reason, "conflict")
        with (
            patch.object(k3, "_owner_mapping", return_value=mapping),
            patch.object(
                k3,
                "_owner_context",
                return_value=k3.OwnerContextData(None, unavailable_reason="unreadable"),
            ),
        ):
            unavailable = k3.resolve_authority_context(query, mapping.current_heads)
        self.assertIsInstance(unavailable, k3.Unresolved)
        self.assertEqual(unavailable.diagnostic.reason, "unreadable")
