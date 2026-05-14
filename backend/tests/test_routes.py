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


def test_auth_config() -> None:
    response = client.get("/api/v1/auth/config")
    assert response.status_code == 200
    payload = response.json()
    assert payload["provider"] == "supabase"
    assert "configured" in payload


def test_list_pets() -> None:
    response = client.get("/api/v1/pets")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_symptom_catalog() -> None:
    response = client.get("/api/v1/symptoms/catalog")
    assert response.status_code == 200
    payload = response.json()
    assert "symptoms" in payload
    assert "all_breeds" in payload


def test_predict_symptoms_requires_input() -> None:
    response = client.post("/api/v1/symptoms/predict", json={"animal": "Dog", "symptoms": [], "symptom_vector": []})
    assert response.status_code == 400


def test_predict_symptoms_success() -> None:
    response = client.post("/api/v1/symptoms/predict", json={"animal": "Dog", "symptoms": ["vomiting", "diarrhea"]})
    assert response.status_code == 200
    payload = response.json()
    assert payload["disease"]
    assert payload["confidence"] >= 0


def test_recommend_breeds() -> None:
    response = client.post(
        "/api/v1/recommender/breeds",
        json={
            "affectionate_with_family": 5,
            "good_with_young_children": 5,
            "good_with_other_dogs": 4,
            "shedding_level": 3,
            "coat_grooming_frequency": 2,
            "drooling_level": 1,
            "openness_to_strangers": 4,
            "playfulness_level": 5,
            "watchdog_protective_nature": 3,
            "adaptability_level": 4,
            "trainability_level": 5,
            "energy_level": 4,
            "barking_level": 3,
            "mental_stimulation_needs": 4,
            "height_c": 45,
            "weight_c": 18,
            "life_c": 12,
            "coat_length_c": 1,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert len(payload["matches"]) >= 1


def test_create_health_record_requires_pet() -> None:
    response = client.post(
        "/api/v1/pets/not-found/records",
        json={"date": "2026-05-14", "symptoms": ["vomiting"], "diagnosis": "Test diagnosis", "severity": "moderate"},
    )
    assert response.status_code == 404


def test_create_weight_log_requires_pet() -> None:
    response = client.post("/api/v1/pets/not-found/weights", json={"weight_kg": 8.3, "recorded_date": "2026-05-14"})
    assert response.status_code == 404


def test_create_vaccination_and_list() -> None:
    pet = client.post(
        "/api/v1/pets",
        json={"owner_id": "demo-user", "name": "Luna", "species": "Dog", "breed": "Poodle", "dob": None, "weight": 7.2, "photo_url": None},
    ).json()
    response = client.post(
        "/api/v1/vaccinations",
        json={"pet_id": pet["id"], "vaccine_name": "Rabies", "given_date": "2026-05-10", "next_due_date": "2027-05-10"},
    )
    assert response.status_code == 200
    listing = client.get("/api/v1/vaccinations")
    assert listing.status_code == 200
    assert any(item["pet_id"] == pet["id"] for item in listing.json())


def test_create_appointment_and_list() -> None:
    pet = client.post(
        "/api/v1/pets",
        json={"owner_id": "demo-user", "name": "Rocky", "species": "Dog", "breed": "Bulldog", "dob": None, "weight": 18.0, "photo_url": None},
    ).json()
    response = client.post(
        "/api/v1/appointments",
        json={"pet_id": pet["id"], "vet_name": "City Pet Care", "vet_location": "Chennai", "date": "2026-05-20T10:30"},
    )
    assert response.status_code == 200
    listing = client.get("/api/v1/appointments")
    assert listing.status_code == 200
    assert any(item["pet_id"] == pet["id"] for item in listing.json())


def test_chat_reply() -> None:
    response = client.post("/api/v1/chat", json={"message": "My dog is tired and not eating.", "language": "en"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["reply"]
    assert payload["source"] in {"fallback", "gemini"}


def test_nearby_vets() -> None:
    response = client.post("/api/v1/vets/nearby", json={"latitude": 13.0827, "longitude": 80.2707, "radius_km": 5})
    assert response.status_code == 200
    assert "vets" in response.json()
