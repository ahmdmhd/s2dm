from collections.abc import Callable
from pathlib import Path

from fastapi.testclient import TestClient

DependenciesConfigPayloadFactory = Callable[..., dict[str, object]]


class TestDependenciesConfigRoute:
    """Test /api/v1/deps/config route behavior."""

    def test_get_dependencies_config_missing_returns_404(self, test_client: TestClient) -> None:
        response = test_client.get("/api/v1/deps/config")

        assert response.status_code == 404
        data = response.json()
        assert data["error"] == "NotFound"

    def test_store_dependencies_config_returns_204(
        self,
        test_client: TestClient,
        dependencies_config_payload_factory: DependenciesConfigPayloadFactory,
    ) -> None:
        response = test_client.post(
            "/api/v1/deps/config",
            json=dependencies_config_payload_factory(["https://github.com/example/repository"]),
        )

        assert response.status_code == 204
        assert response.content == b""

    def test_get_dependencies_config_returns_stored_dependencies(
        self,
        test_client: TestClient,
        dependencies_config_payload_factory: DependenciesConfigPayloadFactory,
    ) -> None:
        test_client.post(
            "/api/v1/deps/config",
            json=dependencies_config_payload_factory(
                ["https://github.com/example/repository"],
                names=["RemoteDependency"],
                versions=["1.0.0"],
            ),
        )

        response = test_client.get("/api/v1/deps/config")

        assert response.status_code == 200
        data = response.json()
        assert data["dependencies"] == [
            {
                "name": "RemoteDependency",
                "version": "1.0.0",
                "source": "https://github.com/example/repository",
                "artifact": "schema.graphql",
                "selection": None,
            }
        ]

    def test_get_dependencies_config_returns_content_backed_selection(
        self,
        test_client: TestClient,
        dependencies_config_payload_factory: DependenciesConfigPayloadFactory,
    ) -> None:
        selection_content = "query Selection { vehicle { vin } }\n"
        test_client.post(
            "/api/v1/deps/config",
            json=dependencies_config_payload_factory(
                ["https://github.com/example/repository"],
                names=["RemoteDependency"],
                versions=["1.0.0"],
                selections=[{"type": "content", "content": selection_content}],
            ),
        )

        response = test_client.get("/api/v1/deps/config")

        assert response.status_code == 200
        data = response.json()
        assert data["dependencies"][0]["selection"] == {"type": "content", "content": selection_content}

    def test_get_dependencies_config_returns_external_path_selection(
        self,
        test_client: TestClient,
        tmp_path: Path,
        dependencies_config_payload_factory: DependenciesConfigPayloadFactory,
    ) -> None:
        selection_path = tmp_path / "selection.graphql"
        selection_path.write_text("query Selection { vehicle { vin } }\n", encoding="utf-8")
        test_client.post(
            "/api/v1/deps/config",
            json=dependencies_config_payload_factory(
                ["https://github.com/example/repository"],
                names=["RemoteDependency"],
                versions=["1.0.0"],
                selections=[{"type": "path", "path": str(selection_path.resolve())}],
            ),
        )

        response = test_client.get("/api/v1/deps/config")

        assert response.status_code == 200
        data = response.json()
        assert data["dependencies"][0]["selection"] == {"type": "path", "path": str(selection_path.resolve())}

    def test_get_dependencies_config_invalid_missing_selection_path_returns_422(
        self,
        test_client: TestClient,
        tmp_path: Path,
        dependencies_config_payload_factory: DependenciesConfigPayloadFactory,
    ) -> None:
        selection_path = tmp_path / "selection.graphql"
        selection_path.write_text("query Selection { vehicle { vin } }\n", encoding="utf-8")
        test_client.post(
            "/api/v1/deps/config",
            json=dependencies_config_payload_factory(
                ["https://github.com/example/repository"],
                names=["RemoteDependency"],
                versions=["1.0.0"],
                selections=[{"type": "path", "path": str(selection_path.resolve())}],
            ),
        )
        selection_path.unlink()

        response = test_client.get("/api/v1/deps/config")

        assert response.status_code == 422
        data = response.json()
        assert data["error"] == "ValidationError"
        assert "Dependency selection file does not exist" in data["message"]
