"""Pure BRAIN Stage 1 source projections.

This is local source-only candidate code. It does not declare or register a
pack, connect an owner reader, or assert that any source is current or true.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Sequence

from common_kernel import Observed, ResultKey, ResultRecord, SubjectRef, lookup


@dataclass(frozen=True)
class OwnerRecords:
    """Separate owner observations; values remain opaque K1 observations."""

    labo: Observed[SubjectRef]
    os_registration: Observed[SubjectRef]
    brain_verification: Observed[SubjectRef]
    adoption: Observed[SubjectRef]


@dataclass(frozen=True)
class BrainSourceTraceInput:
    """The L5 input fields, without an owner resolver or reader."""

    knowledge: SubjectRef
    provenance: Observed[Any]
    evidence: Observed[Any]
    adopted_reason: Observed[Any]
    evaluated_scope: Observed[Any]
    counterexample: Observed[Any]
    limitation: Observed[Any]
    labo_evaluation_target: Observed[SubjectRef]
    owner_records: OwnerRecords


@dataclass(frozen=True)
class BrainSourceTrace:
    """Fieldwise projection preserving each supplied observation exactly."""

    knowledge: SubjectRef
    provenance: Observed[Any]
    evidence: Observed[Any]
    adopted_reason: Observed[Any]
    evaluated_scope: Observed[Any]
    counterexample: Observed[Any]
    limitation: Observed[Any]
    labo_evaluation_target: Observed[SubjectRef]
    owner_records: OwnerRecords


@dataclass(frozen=True)
class BrainKnowledgeRecord:
    """Existing L4 record shape; nested Observed values are not interpreted."""

    knowledge: SubjectRef
    version: Observed[Any]
    state: Observed[Any]
    supersession: Observed[SubjectRef]


def trace_source(input: BrainSourceTraceInput) -> BrainSourceTrace:
    """Project the L5 input into the corresponding L4 fields without inference."""

    return BrainSourceTrace(
        knowledge=input.knowledge,
        provenance=input.provenance,
        evidence=input.evidence,
        adopted_reason=input.adopted_reason,
        evaluated_scope=input.evaluated_scope,
        counterexample=input.counterexample,
        limitation=input.limitation,
        labo_evaluation_target=input.labo_evaluation_target,
        owner_records=OwnerRecords(
            labo=input.owner_records.labo,
            os_registration=input.owner_records.os_registration,
            brain_verification=input.owner_records.brain_verification,
            adoption=input.owner_records.adoption,
        ),
    )


def read_knowledge(
    query_key: ResultKey,
    records: Sequence[ResultRecord[BrainKnowledgeRecord]],
) -> Observed[BrainKnowledgeRecord]:
    """Delegate exact-key record selection to the existing K2 lookup.

    Callers must pass a ResultKey already produced by K2 key_of and records
    restored as a Value by K5. This function does not construct keys, read
    storage, select a replacement revision, or reinterpret K1 results.
    """

    return lookup(records, query_key)
