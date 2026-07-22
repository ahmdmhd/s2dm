from graphql import build_schema

from s2dm.tools.insights.relationships import compute_relationships


def test_deepest_path_starts_at_query_field_return_type() -> None:
    sdl = """
    type Vehicle {
      cabin: Cabin
    }

    type Cabin {
      seat: Seat
    }

    type Seat {
      recline: Int
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert relationships.max_depth is not None
    assert relationships.max_depth.segments == ["Vehicle", "Cabin", "Seat"]
    assert relationships.max_depth.depth == 2
    assert "Query" not in relationships.max_depth.segments


def test_cycles_do_not_cause_infinite_recursion() -> None:
    sdl = """
    type Vehicle {
      cabin: Cabin
    }

    type Cabin {
      vehicle: Vehicle
      seat: Seat
    }

    type Seat {
      id: ID
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert relationships.max_depth is not None
    assert relationships.max_depth.segments == ["Vehicle", "Cabin", "Seat"]


def test_returns_all_paths_ordered_deepest_first() -> None:
    sdl = """
    type Vehicle {
      cabin: Cabin
      chargingSession: ChargingSession
      battery: Battery
    }

    type Cabin {
      seat: Seat
    }

    type Seat {
      backrest: Backrest
    }

    type Backrest {
      id: ID
    }

    type ChargingSession {
      id: ID
    }

    type Battery {
      id: ID
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert [path.depth for path in relationships.paths] == [3, 1, 1]
    assert relationships.paths[0].segments == ["Vehicle", "Cabin", "Seat", "Backrest"]
    assert relationships.total_paths == 3


def test_no_query_type_falls_back_to_unreferenced_object_types() -> None:
    sdl = """
    type Root {
      child: Child
    }

    type Child {
      id: ID
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert relationships.max_depth is not None
    assert relationships.max_depth.segments == ["Root", "Child"]


def test_standalone_type_with_no_references_yields_no_paths() -> None:
    sdl = """
    type Standalone {
      id: ID
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert relationships.paths == []
    assert relationships.max_depth is None
    assert relationships.total_paths == 0


def test_depth_distribution_counts_paths_per_depth() -> None:
    sdl = """
    type Vehicle {
      cabin: Cabin
      chargingSession: ChargingSession
    }

    type Cabin {
      seat: Seat
    }

    type Seat {
      backrest: Backrest
    }

    type Backrest {
      id: ID
    }

    type ChargingSession {
      id: ID
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert relationships.total_paths == 2
    distribution_by_depth = {entry.depth: entry.count for entry in relationships.depth_distribution}
    assert distribution_by_depth == {1: 1, 3: 1}
    depths_in_order = [entry.depth for entry in relationships.depth_distribution]
    assert depths_in_order == sorted(depths_in_order)


def test_query_type_with_no_object_fields_falls_back_to_unreferenced_object_types() -> None:
    sdl = """
    type Vehicle {
      cabin: Cabin
    }

    type Cabin {
      seat: Seat
    }

    type Seat {
      recline: Int
    }

    type Query {
      ping: String
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert relationships.max_depth is not None
    assert relationships.max_depth.segments == ["Vehicle", "Cabin", "Seat"]


def test_no_object_types_returns_no_paths() -> None:
    sdl = """
    type Query {
      value: Int
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert relationships.paths == []
    assert relationships.max_depth is None
    assert relationships.total_paths == 0
    assert relationships.depth_distribution == []


def test_direct_self_reference_is_recorded_as_a_path() -> None:
    sdl = """
    type Node {
      next: Node
    }

    type Query {
      node: Node
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert len(relationships.paths) == 1
    assert relationships.paths[0].segments == ["Node", "Node"]
    assert relationships.paths[0].depth == 1
    assert relationships.total_paths == 1
    distribution_by_depth = {entry.depth: entry.count for entry in relationships.depth_distribution}
    assert distribution_by_depth == {1: 1}


def test_self_reference_and_other_reference_are_both_retained() -> None:
    sdl = """
    type Node {
      next: Node
      other: Other
    }

    type Other {
      id: ID
    }

    type Query {
      node: Node
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    segments_by_path = {tuple(path.segments) for path in relationships.paths}
    assert ("Node", "Node") in segments_by_path
    assert ("Node", "Other") in segments_by_path


def test_direct_self_reference_is_recorded_as_a_cyclic_reference() -> None:
    sdl = """
    type Node {
      next: Node
    }

    type Query {
      node: Node
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert len(relationships.cyclic_references) == 1
    cycle = relationships.cyclic_references[0]
    assert cycle.segments == ["Node", "Node"]
    assert cycle.length == 1


def test_two_type_cycle_is_recorded_as_a_cyclic_reference() -> None:
    sdl = """
    type Vehicle {
      cabin: Cabin
    }

    type Cabin {
      vehicle: Vehicle
      seat: Seat
    }

    type Seat {
      id: ID
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert len(relationships.cyclic_references) == 1
    cycle = relationships.cyclic_references[0]
    assert cycle.segments == ["Cabin", "Vehicle", "Cabin"]
    assert cycle.length == 2


def test_three_type_cycle_is_canonicalized_to_its_smallest_type() -> None:
    sdl = """
    type A {
      b: B
    }

    type B {
      c: C
    }

    type C {
      a: A
    }

    type Query {
      a: A
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert len(relationships.cyclic_references) == 1
    cycle = relationships.cyclic_references[0]
    assert cycle.segments == ["A", "B", "C", "A"]
    assert cycle.length == 3


def test_acyclic_schema_has_no_cyclic_references() -> None:
    sdl = """
    type Vehicle {
      cabin: Cabin
    }

    type Cabin {
      seat: Seat
    }

    type Seat {
      recline: Int
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert relationships.cyclic_references == []


def test_the_same_cycle_reached_from_two_roots_is_deduplicated() -> None:
    sdl = """
    type Vehicle {
      cabin: Cabin
    }

    type Fleet {
      cabin: Cabin
    }

    type Cabin {
      vehicle: Vehicle
    }

    type Query {
      vehicle: Vehicle
      fleet: Fleet
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert len(relationships.cyclic_references) == 1
    cycle = relationships.cyclic_references[0]
    assert cycle.segments == ["Cabin", "Vehicle", "Cabin"]


def test_reference_counts_tally_type_references_from_fields() -> None:
    sdl = """
    type Vehicle {
      cabin: Cabin
      spare: Cabin
    }

    type Cabin {
      seat: Seat
    }

    type Seat {
      id: ID
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    counts_by_name = {entry.name: entry.count for entry in relationships.reference_counts}
    assert counts_by_name["Cabin"] == 2
    assert counts_by_name["Seat"] == 1
    assert counts_by_name["Vehicle"] == 1


def test_reference_counts_include_interface_implementations() -> None:
    sdl = """
    interface Node {
      id: ID
    }

    type Vehicle implements Node {
      id: ID
    }

    type Query {
      node: Node
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    counts_by_name = {entry.name: entry.count for entry in relationships.reference_counts}
    assert counts_by_name["Node"] == 2


def test_reference_counts_tally_directive_applications() -> None:
    sdl = """
    directive @meta(note: String) on OBJECT | FIELD_DEFINITION

    type Vehicle @meta(note: "a") {
      id: ID @meta(note: "b")
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    meta = next(entry for entry in relationships.reference_counts if entry.name == "@meta")
    assert meta.count == 2
    assert meta.kind == "directive"


def test_reference_counts_exclude_unused_types_directives_and_builtins() -> None:
    sdl = """
    directive @used on OBJECT
    directive @unused on OBJECT

    type Vehicle @used {
      id: ID
    }

    type Orphan {
      id: ID
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    names = {entry.name for entry in relationships.reference_counts}
    assert "Orphan" not in names
    assert "@unused" not in names
    assert "ID" not in names
    assert "Query" not in names


def test_reference_counts_exclude_enums() -> None:
    sdl = """
    enum Status { ON OFF }

    type Vehicle {
      status: Status
      backupStatus: Status
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    names = {entry.name for entry in relationships.reference_counts}
    assert "Status" not in names


def test_reference_counts_sorted_by_count_descending_then_name() -> None:
    sdl = """
    type Vehicle {
      first: Alpha
      second: Alpha
      third: Beta
    }

    type Alpha {
      id: ID
    }

    type Beta {
      id: ID
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    relationships = compute_relationships(schema)

    assert relationships.reference_counts == sorted(
        relationships.reference_counts, key=lambda entry: (-entry.count, entry.name)
    )
    assert relationships.reference_counts[0].name == "Alpha"
