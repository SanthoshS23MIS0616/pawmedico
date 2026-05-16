from pydantic import BaseModel, Field


class PetCreate(BaseModel):
    name: str
    species: str
    breed: str
    dob: str | None = None
    weight: float | None = None
    photo_url: str | None = None


class PetResponse(PetCreate):
    owner_id: str
    id: str
    created_at: str


class PetUpdate(BaseModel):
    name: str | None = None
    species: str | None = None
    breed: str | None = None
    dob: str | None = None
    weight: float | None = None
    photo_url: str | None = None


class HealthRecordCreate(BaseModel):
    date: str
    symptoms: list[str] = Field(default_factory=list)
    diagnosis: str
    severity: str = "moderate"
    notes: str | None = None


class HealthRecordResponse(HealthRecordCreate):
    id: str
    pet_id: str
    created_at: str


class WeightLogCreate(BaseModel):
    weight_kg: float = Field(gt=0)
    recorded_date: str


class WeightLogResponse(WeightLogCreate):
    id: str
    pet_id: str
    created_at: str


class PhotoUploadResponse(BaseModel):
    provider: str
    public_url: str
    file_path: str


class AppointmentCreate(BaseModel):
    pet_id: str
    vet_name: str
    vet_location: str
    date: str
    status: str = "requested"


class AppointmentResponse(AppointmentCreate):
    id: str
    created_at: str


class VaccinationCreate(BaseModel):
    pet_id: str
    vaccine_name: str
    given_date: str
    next_due_date: str
    reminder_sent: bool = False


class VaccinationResponse(VaccinationCreate):
    id: str
    created_at: str


class DashboardMetric(BaseModel):
    label: str
    value: str


class DashboardResponse(BaseModel):
    metrics: list[DashboardMetric]
    pets: list[PetResponse]
    recent_records: list[HealthRecordResponse]
    upcoming_vaccinations: list[VaccinationResponse]
    appointments: list[AppointmentResponse]
    weight_logs: list[WeightLogResponse]
