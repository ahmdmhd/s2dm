from collections.abc import Callable

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
