import json
from copy import deepcopy
from datetime import datetime
from typing import Any
from uuid import uuid4

import httpx

from app.core.auth import AuthContext
from app.core.config import settings
from app.core.supabase import build_rest_headers, build_rest_url, get_supabase_status


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
        return bool(status["database_ready"])

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

    async def _rest_request(
        self,
        method: str,
        table: str,
        auth: AuthContext,
        params: dict[str, str] | None = None,
        payload: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]] | dict[str, Any]:
        headers = build_rest_headers(access_token=auth.access_token)
        if method in {"POST", "PATCH"}:
            headers["Prefer"] = "return=representation"
            headers["Content-Type"] = "application/json"
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.request(method, build_rest_url(table), headers=headers, params=params, json=payload)
        if response.status_code >= 400:
            raise RuntimeError(response.text or f"Supabase request failed for table {table}.")
        if not response.content:
            return []
        data = response.json()
        return data if isinstance(data, list) else [data]

    @staticmethod
    def _owner_id(row: dict[str, Any], pet_lookup: dict[str, dict[str, Any]] | None = None) -> str:
        if row.get("owner_id"):
            return str(row["owner_id"])
        if pet_lookup and row.get("pet_id") in pet_lookup:
            return str(pet_lookup[row["pet_id"]].get("owner_id", "demo-user"))
        return "demo-user"

    @staticmethod
    def _sort_rows(rows: list[dict[str, Any]], key: str, reverse: bool = False) -> list[dict[str, Any]]:
        return sorted(rows, key=lambda row: row.get(key) or "", reverse=reverse)

    async def _select_supabase(
        self,
        table: str,
        auth: AuthContext,
        filters: dict[str, str] | None = None,
        order_by: str | None = None,
        desc: bool = False,
    ) -> list[dict[str, Any]]:
        params = {"select": "*", **(filters or {})}
        if order_by:
            params["order"] = f"{order_by}.{'desc' if desc else 'asc'}"
        rows = await self._rest_request("GET", table, auth, params=params)
        return list(rows if isinstance(rows, list) else [])

    async def _insert_supabase(self, table: str, auth: AuthContext, payload: dict[str, Any]) -> dict[str, Any]:
        row = self._stamp(payload)
        rows = await self._rest_request("POST", table, auth, payload=row)
        data = list(rows if isinstance(rows, list) else [])
        return data[0] if data else row

    async def _update_supabase(self, table: str, auth: AuthContext, row_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        rows = await self._rest_request(
            "PATCH",
            table,
            auth,
            params={"id": f"eq.{row_id}", "owner_id": f"eq.{auth.user_id}", "select": "*"},
            payload=payload,
        )
        data = list(rows if isinstance(rows, list) else [])
        return data[0] if data else None

    async def list_pets(self, auth: AuthContext) -> list[dict]:
        if self._use_supabase:
            return await self._select_supabase("pets", auth, filters={"owner_id": f"eq.{auth.user_id}"}, order_by="created_at", desc=True)
        pets = [pet for pet in self._read()["pets"] if self._owner_id(pet) == auth.user_id]
        return self._sort_rows(pets, "created_at", reverse=True)

    async def get_pet(self, auth: AuthContext, pet_id: str) -> dict | None:
        if self._use_supabase:
            rows = await self._select_supabase("pets", auth, filters={"id": f"eq.{pet_id}", "owner_id": f"eq.{auth.user_id}"})
            return rows[0] if rows else None
        return next((pet for pet in await self.list_pets(auth) if pet["id"] == pet_id), None)

    async def create_pet(self, auth: AuthContext, payload: dict) -> dict:
        row_payload = {**payload, "owner_id": auth.user_id}
        if self._use_supabase:
            return await self._insert_supabase("pets", auth, row_payload)
        store = self._read()
        row = self._stamp(row_payload)
        store["pets"].append(row)
        self._write(store)
        return row

    async def update_pet(self, auth: AuthContext, pet_id: str, payload: dict[str, Any]) -> dict | None:
        clean_payload = {key: value for key, value in payload.items() if value is not None}
        if not clean_payload:
            return await self.get_pet(auth, pet_id)
        if self._use_supabase:
            return await self._update_supabase("pets", auth, pet_id, clean_payload)
        store = self._read()
        for pet in store["pets"]:
            if pet["id"] == pet_id and self._owner_id(pet) == auth.user_id:
                pet.update(clean_payload)
                self._write(store)
                return pet
        return None

    async def create_health_record(self, auth: AuthContext, pet_id: str, payload: dict) -> dict:
        row_payload = {"owner_id": auth.user_id, "pet_id": pet_id, **payload}
        if self._use_supabase:
            return await self._insert_supabase("health_records", auth, row_payload)
        store = self._read()
        row = self._stamp(row_payload)
        store["health_records"].append(row)
        self._write(store)
        return row

    async def create_weight_log(self, auth: AuthContext, pet_id: str, payload: dict) -> dict:
        row_payload = {"owner_id": auth.user_id, "pet_id": pet_id, **payload}
        if self._use_supabase:
            return await self._insert_supabase("weight_logs", auth, row_payload)
        store = self._read()
        row = self._stamp(row_payload)
        store["weight_logs"].append(row)
        self._write(store)
        return row

    async def create_appointment(self, auth: AuthContext, payload: dict) -> dict:
        row_payload = {**payload, "owner_id": auth.user_id}
        if self._use_supabase:
            return await self._insert_supabase("appointments", auth, row_payload)
        store = self._read()
        row = self._stamp(row_payload)
        store["appointments"].append(row)
        self._write(store)
        return row

    async def list_appointments(self, auth: AuthContext) -> list[dict]:
        if self._use_supabase:
            return await self._select_supabase("appointments", auth, filters={"owner_id": f"eq.{auth.user_id}"}, order_by="date")
        appointments = [row for row in self._read()["appointments"] if self._owner_id(row) == auth.user_id]
        return self._sort_rows(appointments, "date")

    async def create_vaccination(self, auth: AuthContext, payload: dict) -> dict:
        row_payload = {**payload, "owner_id": auth.user_id}
        if self._use_supabase:
            return await self._insert_supabase("vaccinations", auth, row_payload)
        store = self._read()
        row = self._stamp(row_payload)
        store["vaccinations"].append(row)
        self._write(store)
        return row

    async def list_vaccinations(self, auth: AuthContext) -> list[dict]:
        if self._use_supabase:
            return await self._select_supabase("vaccinations", auth, filters={"owner_id": f"eq.{auth.user_id}"}, order_by="next_due_date")
        vaccinations = [row for row in self._read()["vaccinations"] if self._owner_id(row) == auth.user_id]
        return self._sort_rows(vaccinations, "next_due_date")

    async def add_chat_message(self, auth: AuthContext | None, pet_id: str | None, question: str, reply: str) -> None:
        payload = {
            "owner_id": auth.user_id if auth else "anonymous",
            "pet_id": pet_id,
            "messages": [{"role": "user", "content": question}, {"role": "assistant", "content": reply}],
        }
        if self._use_supabase:
            if auth is None:
                return
            await self._insert_supabase("chat_history", auth, payload)
            return
        store = self._read()
        store["chat_history"].append(self._stamp(payload))
        self._write(store)

    async def get_dashboard(self, auth: AuthContext) -> dict:
        if self._use_supabase:
            pets = await self.list_pets(auth)
            records = await self._select_supabase("health_records", auth, filters={"owner_id": f"eq.{auth.user_id}"}, order_by="created_at", desc=True)
            vaccinations = await self.list_vaccinations(auth)
            appointments = await self.list_appointments(auth)
            weights = await self._select_supabase("weight_logs", auth, filters={"owner_id": f"eq.{auth.user_id}"}, order_by="recorded_date", desc=True)
        else:
            store = self._read()
            pets = [row for row in store["pets"] if self._owner_id(row) == auth.user_id]
            pet_lookup = {pet["id"]: pet for pet in pets}
            records = self._sort_rows([row for row in store["health_records"] if self._owner_id(row, pet_lookup) == auth.user_id], "created_at", reverse=True)
            vaccinations = self._sort_rows([row for row in store["vaccinations"] if self._owner_id(row, pet_lookup) == auth.user_id], "next_due_date")
            appointments = self._sort_rows([row for row in store["appointments"] if self._owner_id(row, pet_lookup) == auth.user_id], "date")
            weights = self._sort_rows([row for row in store["weight_logs"] if self._owner_id(row, pet_lookup) == auth.user_id], "recorded_date", reverse=True)

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
