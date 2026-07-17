from dataclasses import asdict
from fastapi import APIRouter, HTTPException, Query
from fastapi.encoders import jsonable_encoder
from ..schemas.contracts import CreateOrderRequest, DashboardResponse
from ..services.runtime_service import runtime_service

router = APIRouter(prefix="/api", tags=["Pod Runtime"])

@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(): return runtime_service.dashboard()

@router.get("/orders")
def orders(limit: int = Query(100, ge=1, le=500)):
    return {"currency": "INR", "orders": jsonable_encoder([asdict(order) for order in runtime_service.orders(limit)])}

@router.post("/orders", status_code=201)
def create_order(request: CreateOrderRequest):
    try:
        return jsonable_encoder(asdict(runtime_service.create_order(request.pod_id, request.sku, request.quantity)))
    except KeyError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from exc

@router.post("/inventory/replenish")
def replenish_inventory_endpoint(data: dict):
    pod_id = data.get("pod_id", "pod-001")
    sku = data.get("sku")
    try:
        return jsonable_encoder(asdict(runtime_service.replenish_inventory(pod_id, sku)))
    except KeyError as exc:
        raise HTTPException(404, str(exc)) from exc

@router.get("/inventory")
def inventory():
    snapshot = runtime_service.snapshot()
    return {"pods": jsonable_encoder([{"pod_id": pod.id, "inventory": [asdict(item) for item in pod.inventory]} for pod in snapshot.pods]), "currency": "INR"}

@router.get("/machine")
def machine():
    return jsonable_encoder([{"pod_id": pod.id, "status": pod.status, "health": asdict(pod.health)} for pod in runtime_service.snapshot().pods])

@router.get("/telemetry")
def telemetry():
    snapshot = runtime_service.snapshot()
    return jsonable_encoder([{"pod_id": pod.id, "recorded_at": snapshot.simulated_at, "temperature_c": pod.health.temperature_c, "power_draw_w": pod.health.power_draw_w, "network_latency_ms": pod.health.network_latency_ms} for pod in snapshot.pods])

@router.get("/intelligence")
def intelligence():
    from ..services.ai_service import ai_service
    return jsonable_encoder(ai_service.get_insight())

@router.get("/settings")
def get_settings():
    return jsonable_encoder(runtime_service.settings)

@router.post("/settings")
def update_settings(data: dict):
    return jsonable_encoder(runtime_service.update_settings(data))

@router.post("/settings/reset")
def reset_settings():
    return jsonable_encoder(runtime_service.factory_reset())

@router.get("/runtime")
def get_runtime():
    return jsonable_encoder(runtime_service.runtime_info())

@router.get("/health", tags=["Operational"])
def health():
    from ..database.session import get_session_factory
    from datetime import datetime, timezone
    
    db_status = "Disconnected"
    factory = get_session_factory()
    if factory:
        try:
            with factory() as session:
                from sqlalchemy import text
                session.execute(text("SELECT 1"))
                db_status = "Connected"
        except Exception as e:
            db_status = f"Error: {str(e)}"
            
    return {
        "backendStatus": "Healthy",
        "databaseStatus": db_status,
        "runtimeStatus": "Running",
        "apiStatus": "Healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.post("/internal/tick", include_in_schema=False)
def tick(minutes: int = Query(1, ge=1, le=60)):
    return jsonable_encoder(runtime_service.advance(minutes))
