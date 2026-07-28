from graphql import build_schema

from s2dm.tools.insights.concepts import compute_concepts


def test_counts_by_kind() -> None:
    sdl = """
    directive @custom on FIELD_DEFINITION

    type Vehicle {
      id: ID!
      cabin: Cabin
    }

    type Cabin {
      seats: [String!]!
    }

    interface Identifiable {
      id: ID!
    }

    enum StatusEnum { ON OFF }

    union CabinComponent = Vehicle | Cabin

    input VehicleFilter {
      id: ID
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    assert concepts.counts.object == 3
    assert concepts.counts.interface == 1
    assert concepts.counts.enum == 1
    assert concepts.counts.union == 1
    assert concepts.counts.input == 1
    assert concepts.counts.directive == 1
    assert concepts.counts.field == 6
    assert concepts.counts.leaf_field == 4
    assert concepts.counts.relationship_field == 2


def test_builtin_scalars_and_directives_are_excluded() -> None:
    sdl = """
    type Query {
      value: Int
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    assert concepts.counts.directive == 0
    assert "Int" not in concepts.members.scalar


def test_fields_by_type_sorted_by_field_count_descending() -> None:
    sdl = """
    type Small {
      a: String
    }

    type Large {
      a: String
      b: String
      c: String
    }

    type Query {
      small: Small
      large: Large
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    type_names_in_order = [entry.type for entry in concepts.fields_by_type]
    assert type_names_in_order[0] == "Large"
    assert type_names_in_order.index("Large") < type_names_in_order.index("Small")


def test_member_names_are_sorted_per_kind() -> None:
    sdl = """
    type Zebra {
      id: ID
    }

    type Alpha {
      id: ID
    }

    type Query {
      zebra: Zebra
      alpha: Alpha
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    assert concepts.members.object == sorted(concepts.members.object)


def test_container_types_include_interfaces_and_inputs_with_kind() -> None:
    sdl = """
    type Vehicle {
      id: ID
    }

    interface Identifiable {
      id: ID
    }

    input VehicleFilter {
      id: ID
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    kind_by_type = {entry.type: entry.kind for entry in concepts.fields_by_type}
    assert kind_by_type["Vehicle"] == "object"
    assert kind_by_type["Identifiable"] == "interface"
    assert kind_by_type["VehicleFilter"] == "input"


def test_fields_carry_output_type_and_relationship_flag() -> None:
    sdl = """
    type Vehicle {
      speed: Float
      cabin: Cabin
      seats: [Cabin!]
    }

    type Cabin {
      id: ID
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    vehicle = next(entry for entry in concepts.fields_by_type if entry.type == "Vehicle")
    fields_by_name = {field.name: field for field in vehicle.fields}
    assert fields_by_name["speed"].type == "Float"
    assert fields_by_name["speed"].is_relationship is False
    assert fields_by_name["cabin"].type == "Cabin"
    assert fields_by_name["cabin"].is_relationship is True
    assert fields_by_name["seats"].type == "[Cabin!]"
    assert fields_by_name["seats"].is_relationship is True


def test_enum_typed_fields_are_leaf() -> None:
    sdl = """
    enum StatusEnum { ON OFF }

    type Vehicle {
      status: StatusEnum
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    vehicle = next(entry for entry in concepts.fields_by_type if entry.type == "Vehicle")
    status_field = next(field for field in vehicle.fields if field.name == "status")
    assert status_field.is_relationship is False


def test_scalar_usage_counts_builtin_field_occurrences() -> None:
    sdl = """
    type Vehicle {
      name: String
      label: String
      speed: Float
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    counts_by_name = {entry.name: entry.count for entry in concepts.scalar_usage}
    assert counts_by_name["String"] == 2
    assert counts_by_name["Float"] == 1


def test_scalar_usage_counts_custom_scalars_and_flags_builtin() -> None:
    sdl = """
    scalar DateTime

    type Vehicle {
      createdAt: DateTime
      updatedAt: DateTime
      id: ID
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    usage_by_name = {entry.name: entry for entry in concepts.scalar_usage}
    assert usage_by_name["DateTime"].count == 2
    assert usage_by_name["DateTime"].is_builtin is False
    assert usage_by_name["ID"].is_builtin is True


def test_scalar_usage_sorted_by_count_descending_then_name() -> None:
    sdl = """
    type Vehicle {
      a: Float
      b: String
      c: String
      d: String
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    assert concepts.scalar_usage == sorted(concepts.scalar_usage, key=lambda entry: (-entry.count, entry.name))
    assert concepts.scalar_usage[0].name == "String"


def test_scalar_usage_excludes_enum_typed_fields() -> None:
    sdl = """
    enum StatusEnum { ON OFF }

    type Vehicle {
      status: StatusEnum
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    scalar_names = {entry.name for entry in concepts.scalar_usage}
    assert "StatusEnum" not in scalar_names


def test_enum_usage_counts_field_occurrences() -> None:
    sdl = """
    enum Status { ON OFF }

    enum Color { RED GREEN }

    type Vehicle {
      status: Status
      backupStatus: Status
      color: Color
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    counts_by_name = {entry.name: entry.count for entry in concepts.enum_usage}
    assert counts_by_name["Status"] == 2
    assert counts_by_name["Color"] == 1


def test_enum_usage_sorted_by_count_descending_then_name() -> None:
    sdl = """
    enum Alpha { A B }

    enum Beta { A B }

    enum Gamma { A B }

    type Vehicle {
      first: Beta
      second: Alpha
      third: Alpha
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    assert concepts.enum_usage == sorted(concepts.enum_usage, key=lambda entry: (-entry.count, entry.name))
    assert concepts.enum_usage[0].name == "Alpha"


def test_enum_usage_excludes_unused_and_scalar_typed_fields() -> None:
    sdl = """
    enum UsedEnum { ON OFF }

    enum UnusedEnum { A B }

    type Vehicle {
      status: UsedEnum
      name: String
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    usage_names = {entry.name for entry in concepts.enum_usage}
    assert usage_names == {"UsedEnum"}


def test_enum_usage_counts_field_argument_occurrences() -> None:
    sdl = """
    enum DriveType { FWD RWD }

    type Vehicle {
      wheels(drive: DriveType): Int
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    counts_by_name = {entry.name: entry.count for entry in concepts.enum_usage}
    assert counts_by_name["DriveType"] == 1


def test_enum_usage_counts_field_output_type_and_argument_separately() -> None:
    sdl = """
    enum Status { ON OFF }

    type Vehicle {
      status(filter: Status): Status
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    counts_by_name = {entry.name: entry.count for entry in concepts.enum_usage}
    assert counts_by_name["Status"] == 2


def test_enum_usage_counts_directive_argument_occurrences() -> None:
    sdl = """
    directive @tag(kind: TagKind) on FIELD_DEFINITION

    enum TagKind { A B }

    type Vehicle {
      id: ID @tag(kind: A)
    }

    type Query {
      vehicle: Vehicle
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    counts_by_name = {entry.name: entry.count for entry in concepts.enum_usage}
    assert counts_by_name["TagKind"] == 1


def test_enum_value_counts_sorted_by_value_count_descending() -> None:
    sdl = """
    enum Small { A B }

    enum Large { A B C D }

    type Query {
      value: String
    }
    """
    schema = build_schema(sdl)

    concepts = compute_concepts(schema)

    assert concepts.enum_value_counts == sorted(
        concepts.enum_value_counts, key=lambda entry: (-entry.values, entry.name)
    )
    counts_by_name = {entry.name: entry.values for entry in concepts.enum_value_counts}
    assert counts_by_name == {"Large": 4, "Small": 2}
