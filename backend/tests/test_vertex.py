from app.services.gemini_service import gemini_service


def test_gemini_service_flag() -> None:
    assert isinstance(gemini_service.configured, bool)
