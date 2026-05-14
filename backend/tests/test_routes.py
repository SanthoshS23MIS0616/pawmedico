from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["repository_mode"] in {"local-json", "supabase"}


def test_create_pet_and_list_dashboard() -> None:
    pet_payload = {
        "owner_id": "demo-user",
        "name": "Milo",
        "species": "Dog",
        "breed": "Beagle",
        "dob": "2023-01-15",
        "weight": 12.4,
        "photo_url": None,
    }
    create_response = client.post("/api/v1/pets", json=pet_payload)
    assert create_response.status_code == 200
    pet = create_response.json()
    assert pet["name"] == "Milo"

    dashboard_response = client.get("/api/v1/dashboard")
    assert dashboard_response.status_code == 200
    dashboard = dashboard_response.json()
    assert "metrics" in dashboard
    assert any(item["id"] == pet["id"] for item in dashboard["pets"])
