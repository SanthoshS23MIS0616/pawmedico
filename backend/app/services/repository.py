import json
from copy import deepcopy
from datetime import datetime
from typing import Any
from uuid import uuid4

from app.core.config import settings
from app.core.supabase import get_supabase_client, get_supabase_status


class Repository:
    def __init__(self) -> None:
        self.store_path = settings.data_dir / "dev_store.json"
        self.default_store = {
            "pets": [],
            "health_records": [],
            "appointments": [],
            "vaccinations": [],
            "weight_logs": [],
            "chat_history": [],
        }

    @property
    def mode(self) -> str:
        return "supabase" if self._use_supabase else "local-json"

    @property
    def _use_supabase(self) -> bool:
        status = get_supabase_status()
        return status["configured"] and status["sdk_available"] and get_supabase_client() is not None

    def ensure_store(self) -> None:
        settings.data_dir.mkdir(parents=True, exist_ok=True)
        if not self.store_path.exists():
            self._write(self.default_store)

    def _read(self) -> dict[str, Any]:
        self.ensure_store()
        return json.loads(self.store_path.read_text(encoding="utf-8"))

    def _write(self, payload: dict[str, Any]) -> None:
        self.store_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def _stamp(self, payload: dict[str, Any]) -> dict[str, Any]:
        row = deepcopy(payload)
        row["id"] = row.get("id") or str(uuid4())
        row["created_at"] = row.get("created_at") or datetime.utcnow().isoformat()
        return row

    def _table(self, name: str):
        client = get_supabase_client()
        if client is None:
            raise RuntimeError("Supabase client is not configured.")
        return client.table(name)

    def _insert_supabase(self, table: str, payload: dict[str, Any]) -> dict[str, Any]:
        row = self._stamp(payload)
        response = self._table(table).insert(row).execute()
        data = getattr(response, "data", None) or [row]
        return data[0]

    def _select_supabase(self, table: str, order_by: str | None = None, desc: bool = False) -> list[dict[str, Any]]:
        query = self._table(table).select("*")
        if order_by:
            query = query.order(order_by, desc=desc)
        response = query.execute()
        return list(getattr(response, "data", None) or [])

    def list_pets(self) -> list[dict]:
        if self._use_supabase:
            return self._select_supabase("pets", order_by="created_at", desc=True)
        return self._read()["pets"]

    def get_pet(self, pet_id: str) -> dict | None:
        if self._use_supabase:
            response = self._table("pets").select("*").eq("id", pet_id).limit(1).execute()
            rows = getattr(response, "data", None) or []
            return rows[0] if rows else None
        return next((pet for pet in self.list_pets() if pet["id"] == pet_id), None)

    def create_pet(self, payload: dict) -> dict:
        if self._use_supabase:
            return self._insert_supabase("pets", payload)
        store = self._read()
        row = self._stamp(payload)
        store["pets"].append(row)
        self._write(store)
        return row

    def create_health_record(self, pet_id: str, payload: dict) -> dict:
        row_payload = {"pet_id": pet_id, **payload}
        if self._use_supabase:
            return self._insert_supabase("health_records", row_payload)
        store = self._read()
        row = self._stamp(row_payload)
        store["health_records"].append(row)
        self._write(store)
        return row

    def create_weight_log(self, pet_id: str, payload: dict) -> dict:
        row_payload = {"pet_id": pet_id, **payload}
        if self._use_supabase:
            return self._insert_supabase("weight_logs", row_payload)
        store = self._read()
        row = self._stamp(row_payload)
        store["weight_logs"].append(row)
        self._write(store)
        return row

    def create_appointment(self, payload: dict) -> dict:
        if self._use_supabase:
            return self._insert_supabase("appointments", payload)
        store = self._read()
        row = self._stamp(payload)
        store["appointments"].append(row)
        self._write(store)
        return row

    def list_appointments(self) -> list[dict]:
        if self._use_supabase:
            return self._select_supabase("appointments", order_by="date")
        return self._read()["appointments"]

    def create_vaccination(self, payload: dict) -> dict:
        if self._use_supabase:
            return self._insert_supabase("vaccinations", payload)
        store = self._read()
        row = self._stamp(payload)
        store["vaccinations"].append(row)
        self._write(store)
        return row

    def list_vaccinations(self) -> list[dict]:
        if self._use_supabase:
            return self._select_supabase("vaccinations", order_by="next_due_date")
        return self._read()["vaccinations"]

    def add_chat_message(self, pet_id: str | None, question: str, reply: str) -> None:
        payload = {"pet_id": pet_id, "messages": [{"role": "user", "content": question}, {"role": "assistant", "content": reply}]}
        if self._use_supabase:
            self._insert_supabase("chat_history", payload)
            return
        store = self._read()
        store["chat_history"].append(self._stamp(payload))
        self._write(store)

    def get_dashboard(self) -> dict:
        if self._use_supabase:
            pets = self.list_pets()
            records = self._select_supabase("health_records", order_by="created_at", desc=True)
            vaccinations = self.list_vaccinations()
            appointments = self.list_appointments()
            weights = self._select_supabase("weight_logs", order_by="recorded_date", desc=True)
        else:
            store = self._read()
            pets = store["pets"]
            records = sorted(store["health_records"], key=lambda row: row["created_at"], reverse=True)
            vaccinations = sorted(store["vaccinations"], key=lambda row: row["next_due_date"])
            appointments = sorted(store["appointments"], key=lambda row: row["date"])
            weights = sorted(store["weight_logs"], key=lambda row: row["recorded_date"], reverse=True)

        metrics = [
            {"label": "Pets", "value": str(len(pets))},
            {"label": "Health Records", "value": str(len(records))},
            {"label": "Vaccinations", "value": str(len(vaccinations))},
            {"label": "Appointments", "value": str(len(appointments))},
        ]
        return {
            "metrics": metrics,
            "pets": pets,
            "recent_records": records[:8],
            "upcoming_vaccinations": vaccinations[:8],
            "appointments": appointments[:8],
            "weight_logs": weights[:12],
        }


repository = Repository()
