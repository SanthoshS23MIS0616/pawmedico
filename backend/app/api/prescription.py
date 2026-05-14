from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.schemas.analysis import PrescriptionRequest, PrescriptionResponse
from app.services.prescription_service import prescription_service

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])


@router.post("/generate", response_model=PrescriptionResponse)
async def generate_prescription(payload: PrescriptionRequest) -> PrescriptionResponse:
    result = await prescription_service.generate(payload)
    return PrescriptionResponse(**result)


@router.get("/download/{filename}")
async def download_prescription(filename: str) -> FileResponse:
    file_path = Path(prescription_service.output_dir) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Prescription file not found.")
    media_type = "application/pdf" if file_path.suffix.lower() == ".pdf" else "text/html"
    return FileResponse(file_path, media_type=media_type, filename=file_path.name)

