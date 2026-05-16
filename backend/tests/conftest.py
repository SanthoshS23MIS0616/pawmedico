import pytest

from app.core.config import settings
from app.services.repository import repository


@pytest.fixture(autouse=True)
def isolate_demo_mode():
    original = {
        "supabase_url": settings.supabase_url,
        "supabase_anon_key": settings.supabase_anon_key,
        "supabase_service_role_key": settings.supabase_service_role_key,
    }
    settings.supabase_url = None
    settings.supabase_anon_key = None
    settings.supabase_service_role_key = None
    repository._write(repository.default_store)
    yield
    repository._write(repository.default_store)
    settings.supabase_url = original["supabase_url"]
    settings.supabase_anon_key = original["supabase_anon_key"]
    settings.supabase_service_role_key = original["supabase_service_role_key"]
