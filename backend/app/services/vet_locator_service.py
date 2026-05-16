import math

import httpx

from app.schemas.analysis import NearbyVetsRequest


class VetLocatorService:
    @staticmethod
    def _format_address(tags: dict) -> str | None:
        pieces = [
            tags.get("addr:housenumber"),
            tags.get("addr:street"),
            tags.get("addr:suburb"),
            tags.get("addr:city"),
        ]
        address = ", ".join(part for part in pieces if part)
        return address or None

    async def find_nearby(self, payload: NearbyVetsRequest) -> dict:
        query = f"""
[out:json];
node
  ["amenity"="veterinary"]
  (around:{payload.radius_km * 1000},{payload.latitude},{payload.longitude});
out body 20;
"""
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.post("https://overpass-api.de/api/interpreter", content=query)
                response.raise_for_status()
                rows = response.json().get("elements", [])
            vets = []
            for row in rows:
                lat = row.get("lat")
                lon = row.get("lon")
                if lat is None or lon is None:
                    continue
                tags = row.get("tags", {})
                distance = self._distance_km(payload.latitude, payload.longitude, lat, lon)
                vets.append(
                    {
                        "name": tags.get("name", "Veterinary clinic"),
                        "latitude": lat,
                        "longitude": lon,
                        "distance_km": round(distance, 2),
                        "address": self._format_address(tags),
                        "phone": tags.get("phone") or tags.get("contact:phone"),
                        "website": tags.get("website") or tags.get("contact:website"),
                        "opening_hours": tags.get("opening_hours"),
                        "open_now": None if not tags.get("opening_hours") else None,
                        "map_link": f"https://www.google.com/maps/search/?api=1&query={lat},{lon}",
                        "source": "openstreetmap",
                    }
                )
            vets.sort(key=lambda item: item["distance_km"])
            return {"vets": vets[:10], "warning": None}
        except Exception:
            return {
                "vets": [
                    {
                        "name": "Demo Veterinary Clinic",
                        "latitude": payload.latitude,
                        "longitude": payload.longitude,
                        "distance_km": 0.8,
                        "address": "Demo mode fallback",
                        "phone": None,
                        "website": None,
                        "opening_hours": None,
                        "open_now": None,
                        "map_link": f"https://www.google.com/maps/search/?api=1&query={payload.latitude},{payload.longitude}",
                        "source": "demo-fallback",
                    }
                ],
                "warning": "Live OpenStreetMap lookup failed in the current environment; showing a fallback clinic entry.",
            }

    def _distance_km(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        radius = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return radius * c


vet_locator_service = VetLocatorService()
