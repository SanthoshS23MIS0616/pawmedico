from app.services.groq_service import groq_service


def test_groq_service_flag() -> None:
    assert isinstance(groq_service.configured, bool)
