from fastapi import APIRouter, HTTPException, Query
import httpx

router = APIRouter(prefix="/api/geo", tags=["geo"])

GEO_API_BASE_URL = "https://geo.api.gouv.fr"


@router.get("/cities")
async def search_cities(
    q: str = Query(..., min_length=2),
    limit: int = Query(8, ge=1, le=10),
):
    params = {
        "nom": q.strip(),
        "fields": "nom,code,codesPostaux,departement,region,population",
        "boost": "population",
        "limit": str(limit),
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(f"{GEO_API_BASE_URL}/communes", params=params)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Impossible de récupérer les communes") from exc

    cities = []
    for city in response.json():
        postal_codes = city.get("codesPostaux") or []
        department = city.get("departement") or {}
        region = city.get("region") or {}
        cities.append(
            {
                "name": city.get("nom"),
                "postal_code": postal_codes[0] if postal_codes else None,
                "postal_codes": postal_codes,
                "department_code": department.get("code"),
                "department_name": department.get("nom"),
                "region_name": region.get("nom"),
                "insee_code": city.get("code"),
                "population": city.get("population"),
                "label": _format_city_label(city.get("nom"), postal_codes, department.get("nom")),
            }
        )

    return cities


def _format_city_label(name: str | None, postal_codes: list[str], department_name: str | None) -> str:
    parts = [name or ""]
    if postal_codes:
        parts.append(postal_codes[0])
    if department_name:
        parts.append(department_name)
    return " · ".join(part for part in parts if part)
