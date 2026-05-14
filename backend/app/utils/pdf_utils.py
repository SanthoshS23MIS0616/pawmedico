from pathlib import Path

from app.schemas.analysis import PrescriptionRequest

try:
    from weasyprint import HTML
except Exception:
    HTML = None


def render_prescription_document(plan: dict, payload: PrescriptionRequest, output_path: Path) -> None:
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <h1>PawMedic Pro Prescription</h1>
        <p><strong>Pet:</strong> {payload.pet_name}</p>
        <p><strong>Animal:</strong> {payload.animal}</p>
        <p><strong>Breed:</strong> {payload.breed or "Unknown"}</p>
        <p><strong>Disease:</strong> {plan.get("disease", "Unknown")}</p>
        <h2>Prescription Plan</h2>
        <ul>
          {''.join(f"<li>{item['date']} {item['time']} - {item['medicine']} ({item['dosage']}) via {item['route']} for {item['duration']}. {item['notes']}</li>" for item in plan.get('prescription_plan', []))}
        </ul>
        <h2>Diet Plan</h2>
        <ul>
          {''.join(f"<li>{item['date']} {item['feeding_time']} - {item['food_type']} ({item['quantity']}). {item['notes']}</li>" for item in plan.get('diet_plan', []))}
        </ul>
        <h2>Explanation</h2>
        <p>{plan.get("explanation", "")}</p>
      </body>
    </html>
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if HTML is None:
        output_path.with_suffix(".html").write_text(html, encoding="utf-8")
        return
    HTML(string=html).write_pdf(str(output_path))

