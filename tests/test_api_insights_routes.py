"""API tests for schema insights routes."""

from fastapi.testclient import TestClient

VEHICLE_SCHEMA_PAYLOAD = {
    "schemas": [
        {
            "type": "content",
            "content": """
            type Vehicle {
              id: ID!
              cabin: Cabin
              oldSpeed: Int @deprecated(reason: "use speed")
            }

            type Cabin {
              seat: String
            }

            enum UnusedEnum { A B }

            type Query {
              vehicle: Vehicle
            }
            """,
        },
    ],
}


class TestInsightsConceptsRoute:
    """Test /api/v1/insights/concepts route behavior."""

    def test_get_concepts_successful(self, test_client: TestClient) -> None:
        response = test_client.post("/api/v1/insights/concepts", json=VEHICLE_SCHEMA_PAYLOAD)

        assert response.status_code == 200
        data = response.json()
        assert data["counts"]["object"] == 3
        assert data["counts"]["enum"] == 1
        assert {entry["type"] for entry in data["fields_by_type"]} == {"Vehicle", "Cabin", "Query"}

    def test_get_concepts_includes_scalar_usage(self, test_client: TestClient) -> None:
        response = test_client.post("/api/v1/insights/concepts", json=VEHICLE_SCHEMA_PAYLOAD)

        assert response.status_code == 200
        data = response.json()
        usage_by_name = {entry["name"]: entry for entry in data["scalar_usage"]}
        assert usage_by_name["ID"]["count"] == 1
        assert usage_by_name["ID"]["is_builtin"] is True
        assert usage_by_name["String"]["count"] == 1

    def test_get_concepts_includes_enum_usage(self, test_client: TestClient) -> None:
        payload = {
            "schemas": [
                {
                    "type": "content",
                    "content": """
                    enum Status { ON OFF }

                    enum UnusedEnum { A B }

                    type Vehicle {
                      status: Status
                    }

                    type Query {
                      vehicle: Vehicle
                    }
                    """,
                },
            ],
        }
        response = test_client.post("/api/v1/insights/concepts", json=payload)

        assert response.status_code == 200
        data = response.json()
        usage_by_name = {entry["name"]: entry for entry in data["enum_usage"]}
        assert usage_by_name["Status"]["count"] == 1
        assert "UnusedEnum" not in usage_by_name

    def test_get_concepts_missing_required_field_returns_400(self, test_client: TestClient) -> None:
        response = test_client.post("/api/v1/insights/concepts", json={})

        assert response.status_code == 400
        data = response.json()
        assert data["error"] == "BadRequest"


class TestInsightsRelationshipsRoute:
    """Test /api/v1/insights/relationships route behavior."""

    def test_get_relationships_successful(self, test_client: TestClient) -> None:
        response = test_client.post("/api/v1/insights/relationships", json=VEHICLE_SCHEMA_PAYLOAD)

        assert response.status_code == 200
        data = response.json()
        assert data["max_depth"]["segments"] == [
            {"type": "Vehicle", "field": None, "field_type": None},
            {"type": "Cabin", "field": "cabin", "field_type": "Cabin"},
        ]
        assert data["max_depth"]["depth"] == 1

    def test_get_relationships_includes_self_reference(self, test_client: TestClient) -> None:
        payload = {
            "schemas": [
                {
                    "type": "content",
                    "content": """
                    type Node {
                      next: Node
                    }

                    type Query {
                      node: Node
                    }
                    """,
                },
            ],
        }

        response = test_client.post("/api/v1/insights/relationships", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert any(
            path["segments"]
            == [
                {"type": "Node", "field": None, "field_type": None},
                {"type": "Node", "field": "next", "field_type": "Node"},
            ]
            for path in data["paths"]
        )

    def test_get_relationships_includes_cyclic_references(self, test_client: TestClient) -> None:
        payload = {
            "schemas": [
                {
                    "type": "content",
                    "content": """
                    type Vehicle {
                      cabin: Cabin
                    }

                    type Cabin {
                      vehicle: Vehicle
                    }

                    type Query {
                      vehicle: Vehicle
                    }
                    """,
                },
            ],
        }

        response = test_client.post("/api/v1/insights/relationships", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["cyclic_references"] == [
            {
                "segments": [
                    {"type": "Cabin", "field": None, "field_type": None},
                    {"type": "Vehicle", "field": "vehicle", "field_type": "Vehicle"},
                    {"type": "Cabin", "field": "cabin", "field_type": "Cabin"},
                ],
                "length": 2,
            }
        ]

    def test_get_relationships_includes_reference_counts(self, test_client: TestClient) -> None:
        response = test_client.post("/api/v1/insights/relationships", json=VEHICLE_SCHEMA_PAYLOAD)

        assert response.status_code == 200
        data = response.json()
        counts_by_name = {entry["name"]: entry for entry in data["reference_counts"]}
        assert counts_by_name["Cabin"]["count"] == 1
        assert "UnusedEnum" not in counts_by_name


class TestInsightsCoverageRoute:
    """Test /api/v1/insights/coverage route behavior."""

    def test_get_coverage_successful(self, test_client: TestClient) -> None:
        response = test_client.post("/api/v1/insights/coverage", json=VEHICLE_SCHEMA_PAYLOAD)

        assert response.status_code == 200
        data = response.json()
        types_coverage = data["breakdown"]["types"]
        assert types_coverage["documented"] < types_coverage["total"]
        assert any(entity["name"] == "Vehicle" for entity in data["undocumented"])

    def test_get_coverage_includes_directives(self, test_client: TestClient) -> None:
        payload = {
            "schemas": [
                {
                    "type": "content",
                    "content": """
                    directive @internal on FIELD_DEFINITION

                    type Query {
                      value: String
                    }
                    """,
                },
            ],
        }

        response = test_client.post("/api/v1/insights/coverage", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["breakdown"]["directives"]["total"] == 1
        assert any(entity["name"] == "@internal" for entity in data["undocumented"])


class TestInsightsQualityRoute:
    """Test /api/v1/insights/quality route behavior."""

    def test_get_quality_successful(self, test_client: TestClient) -> None:
        response = test_client.post("/api/v1/insights/quality", json=VEHICLE_SCHEMA_PAYLOAD)

        assert response.status_code == 200
        data = response.json()
        categories = {issue["category"] for issue in data["issues"]}
        assert "Missing descriptions" in categories
        assert "Deprecated fields" in categories
        assert "Unused enums" in categories

    def test_get_quality_invalid_schema_returns_422(self, test_client: TestClient) -> None:
        response = test_client.post(
            "/api/v1/insights/quality",
            json={"schemas": [{"type": "content", "content": "type Query { vehicle: NonExistentType }"}]},
        )

        assert response.status_code == 422
        data = response.json()
        assert data["error"] == "ValidationError"
