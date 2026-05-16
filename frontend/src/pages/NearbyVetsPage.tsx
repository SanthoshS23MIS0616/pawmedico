import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { LoadingSpinner } from "../components/LoadingSpinner";
import { api, type NearbyVet } from "../services/api";

function MapViewport({ center, vets }: { center: [number, number]; vets: NearbyVet[] }) {
  const map = useMap();

  useEffect(() => {
    if (!vets.length) {
      map.setView(center, 12);
      return;
    }
    const bounds = L.latLngBounds(vets.map((vet) => [vet.latitude, vet.longitude] as [number, number]));
    bounds.extend(center);
    map.fitBounds(bounds.pad(0.2));
  }, [center, map, vets]);

  return null;
}

const clinicIcon = L.divIcon({
  className: "pawmedic-map-pin",
  html: '<div class="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-sm font-black text-white shadow-lg">+</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const currentIcon = L.divIcon({
  className: "pawmedic-map-pin",
  html: '<div class="flex h-9 w-9 items-center justify-center rounded-full bg-ink px-2 text-xs font-black text-white shadow-lg">YOU</div>',
  iconSize: [46, 36],
  iconAnchor: [23, 18]
});

export function NearbyVetsPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ latitude: "13.0827", longitude: "80.2707", radius_km: "5", search: "" });
  const [result, setResult] = useState<{ vets: NearbyVet[]; warning?: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  const center = useMemo<[number, number]>(() => [Number(form.latitude) || 13.0827, Number(form.longitude) || 80.2707], [form.latitude, form.longitude]);
  const filteredVets = useMemo(() => {
    const query = form.search.trim().toLowerCase();
    if (!query) return result?.vets ?? [];
    return (result?.vets ?? []).filter((vet) =>
      [vet.name, vet.address, vet.phone, vet.opening_hours].some((value) => value?.toLowerCase().includes(query))
    );
  }, [form.search, result?.vets]);

  function useCurrentLocation() {
    setGeoError("");
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(5),
          longitude: position.coords.longitude.toFixed(5)
        }));
      },
      (error) => setGeoError(error.message)
    );
  }

  async function submit() {
    setLoading(true);
    try {
      setResult(await api.findNearbyVets({ latitude: Number(form.latitude), longitude: Number(form.longitude), radius_km: Number(form.radius_km) }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <h1 className="text-3xl font-black">{t("nearbyTitle")}</h1>
        <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">{t("nearbyBody")}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="label">{t("nearbyLatitude")}</label>
            <input className="input" value={form.latitude} onChange={(event) => setForm((value) => ({ ...value, latitude: event.target.value }))} />
          </div>
          <div>
            <label className="label">{t("nearbyLongitude")}</label>
            <input className="input" value={form.longitude} onChange={(event) => setForm((value) => ({ ...value, longitude: event.target.value }))} />
          </div>
          <div>
            <label className="label">{t("nearbyRadius")}</label>
            <input className="input" type="number" value={form.radius_km} onChange={(event) => setForm((value) => ({ ...value, radius_km: event.target.value }))} />
          </div>
          <div>
            <label className="label">{t("nearbyFilter")}</label>
            <input className="input" value={form.search} onChange={(event) => setForm((value) => ({ ...value, search: event.target.value }))} placeholder="clinic, address, phone" />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="button-primary" onClick={submit} type="button">
            {t("nearbySearch")}
          </button>
          <button className="button-secondary" onClick={useCurrentLocation} type="button">
            {t("nearbyCurrent")}
          </button>
        </div>
        {geoError ? <p className="mt-4 text-sm font-semibold text-amber-700">{geoError}</p> : null}
        {result?.warning ? <p className="mt-4 text-sm font-semibold text-amber-700">{result.warning}</p> : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="panel overflow-hidden p-4">
          <div className="h-[32rem] overflow-hidden rounded-[28px]">
            <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapViewport center={center} vets={filteredVets} />
              <Marker position={center} icon={currentIcon}>
                <Popup>{t("nearbyCurrent")}</Popup>
              </Marker>
              <Circle center={center} radius={Number(form.radius_km || 0) * 1000} pathOptions={{ color: "#e76f51", fillColor: "#f4a261", fillOpacity: 0.12 }} />
              {filteredVets.map((vet) => (
                <Marker key={`${vet.name}-${vet.latitude}-${vet.longitude}`} position={[vet.latitude, vet.longitude]} icon={clinicIcon}>
                  <Popup>
                    <div className="space-y-2">
                      <p className="font-bold">{vet.name}</p>
                      <p>{vet.distance_km} km</p>
                      {vet.address ? <p>{vet.address}</p> : null}
                      <a href={vet.map_link} target="_blank" rel="noreferrer">
                        {t("nearbyDirections")}
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <section className="panel p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Results</h2>
            <span className="rounded-full bg-sand px-4 py-2 text-xs font-bold text-ink/70">{filteredVets.length}</span>
          </div>
          {loading ? (
            <div className="mt-5">
              <LoadingSpinner label="Looking up nearby vets..." />
            </div>
          ) : null}
          <div className="mt-5 space-y-4">
            {filteredVets.map((vet) => (
              <article key={`${vet.name}-${vet.latitude}-${vet.longitude}`} className="rounded-[24px] bg-sand p-5 dark:bg-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-black">{vet.name}</p>
                    <p className="mt-1 text-sm text-ink/60 dark:text-paper/65">{vet.distance_km} km</p>
                  </div>
                  <a className="rounded-full bg-white px-4 py-2 text-xs font-bold text-coral shadow-sm" href={vet.map_link} target="_blank" rel="noreferrer">
                    {t("nearbyDirections")}
                  </a>
                </div>
                <div className="mt-4 space-y-2 text-sm text-ink/70 dark:text-paper/75">
                  {vet.address ? <p><span className="font-bold">{t("nearbyAddress")}:</span> {vet.address}</p> : null}
                  {vet.phone ? <p><span className="font-bold">{t("nearbyPhone")}:</span> {vet.phone}</p> : null}
                  {vet.website ? <p><span className="font-bold">{t("nearbyWebsite")}:</span> <a className="text-coral underline" href={vet.website} target="_blank" rel="noreferrer">{vet.website}</a></p> : null}
                  {vet.opening_hours ? <p><span className="font-bold">{t("nearbyHours")}:</span> {vet.opening_hours}</p> : null}
                  {typeof vet.open_now === "boolean" ? <p><span className="font-bold">{t("nearbyOpenNow")}:</span> {vet.open_now ? "Yes" : "No"}</p> : null}
                </div>
              </article>
            ))}
            {!loading && !filteredVets.length ? <p className="text-sm text-ink/60 dark:text-paper/60">{t("nearbyEmpty")}</p> : null}
          </div>
        </section>
      </section>
    </div>
  );
}
