from pathlib import Path

import pytest
from graphql import DocumentNode, build_schema, parse

from s2dm.exporters.utils.schema_loader import print_schema_with_directives_preserved
from s2dm.ledger import Ledger, annotate_schema_with_ledger
from tests.ledger_common import (
    FULL_BINDINGS,
    FULL_CONCEPTS,
    FULL_CONTRACTS,
    FULL_REVISIONS,
    dedent_csv,
    modl_args,
)

SCHEMA_SDL = """\
type Car {
  id: ID!
  owner: Person!
}

type Person {
  id: ID!
  name: String!
}

enum DriveType {
  FWD
  RWD
  AWD
}

type Query {
  ping: String
}
"""


def _write_ledger(
    ledger_dir: Path,
    concepts: str,
    contracts: str,
    revisions: str = FULL_REVISIONS,
    bindings: str = FULL_BINDINGS,
) -> None:
    ledger_dir.mkdir(parents=True, exist_ok=True)
    (ledger_dir / "concepts.csv").write_text(concepts, encoding="utf-8")
    (ledger_dir / "contracts.csv").write_text(contracts, encoding="utf-8")
    (ledger_dir / "revisions.csv").write_text(revisions, encoding="utf-8")
    (ledger_dir / "bindings.csv").write_text(bindings, encoding="utf-8")


def _annotate(schema_sdl: str, ledger_dir: Path) -> DocumentNode:
    schema = build_schema(schema_sdl)
    annotate_schema_with_ledger(schema, Ledger.from_directory(ledger_dir))
    printed_schema = print_schema_with_directives_preserved(schema)
    return parse(printed_schema)


def test_annotate_adds_modl_to_matched_types_fields_and_enum_values(tmp_path: Path) -> None:
    ledger_dir = tmp_path / "ledger"
    _write_ledger(ledger_dir, FULL_CONCEPTS, FULL_CONTRACTS)

    annotated = _annotate(SCHEMA_SDL, ledger_dir)

    assert modl_args(annotated, "Car") == {"concept": "http://ex/concepts/0", "contract": "http://ex/contracts/0"}
    assert modl_args(annotated, "Car", "id") == {"concept": "http://ex/concepts/2", "contract": "http://ex/contracts/2"}
    assert modl_args(annotated, "Person", "name") == {
        "concept": "http://ex/concepts/5",
        "contract": "http://ex/contracts/5",
    }
    assert modl_args(annotated, "DriveType") == {
        "concept": "http://ex/concepts/6",
        "contract": "http://ex/contracts/6",
    }
    assert modl_args(annotated, "DriveType", "FWD") == {
        "concept": "http://ex/concepts/7",
        "contract": "http://ex/contracts/7",
    }


def test_annotate_ignores_query_root_type(tmp_path: Path) -> None:
    ledger_dir = tmp_path / "ledger"
    _write_ledger(ledger_dir, FULL_CONCEPTS, FULL_CONTRACTS)

    annotated = _annotate(SCHEMA_SDL, ledger_dir)

    assert modl_args(annotated, "Query") is None
    assert modl_args(annotated, "Query", "ping") is None


def test_annotate_skips_when_validation_rejects(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    ledger_dir = tmp_path / "ledger"
    _write_ledger(ledger_dir, FULL_CONCEPTS, FULL_CONTRACTS)
    monkeypatch.setattr(
        "s2dm.ledger.directives.validate_modl_annotation",
        lambda annotations, ledger: False,
    )

    annotated = _annotate(SCHEMA_SDL, ledger_dir)

    assert modl_args(annotated, "Car") is None
    assert modl_args(annotated, "Car", "id") is None


def test_ledger_excludes_concept_without_contract(tmp_path: Path) -> None:
    concepts = dedent_csv(
        """
        serial,concept_uri,current_label,previous_labels,kind,status,parent_uri,instances
        0,http://ex/concepts/0,Car,,ENTITY,ACTIVE,,
        1,http://ex/concepts/1,Person,,ENTITY,ACTIVE,,
        """
    )
    contracts = dedent_csv(
        """
        serial,concept_uri,contract_uri,revision_uri,status
        0,http://ex/concepts/0,http://ex/contracts/0,http://ex/revisions/0,ACTIVE
        """
    )
    ledger_dir = tmp_path / "ledger"
    _write_ledger(ledger_dir, concepts, contracts)

    ledger = Ledger.from_directory(ledger_dir)

    assert ledger.entry_for("Car") is not None
    assert ledger.entry_for("Person") is None
