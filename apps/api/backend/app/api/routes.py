from dataclasses import asdict
from fastapi import APIRouter, HTTPException, Query, Depends, status
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from ..schemas.contracts import CreateOrderRequest, DashboardResponse
from ..services.runtime_service import runtime_service
from ..services.auth_service import (
    create_access_token,
    get_current_user,
    require_role,
    hash_password,
    verify_password
)

router = APIRouter(prefix="/api", tags=["Pod Runtime"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/auth/login")
def login(request: LoginRequest):
    email = request.email.lower().strip()
    password = request.password
    
    # Pre-seeded users for NexPod AI OS
    seed_users = {
        "innovex": {"id": "usr_admin_innovex", "role": "admin", "pass": hash_password("innovex")},
        "innovex@nexpod.ai": {"id": "usr_admin_innovex", "role": "admin", "pass": hash_password("innovex")},
        "admin@nexpod.ai": {"id": "usr_admin_01", "role": "admin", "pass": hash_password("admin123")},
        "customer@nexpod.ai": {"id": "usr_cust_01", "role": "user", "pass": hash_password("customer123")}
    }
    
    user_info = seed_users.get(email)
    if not user_info or not verify_password(password, user_info["pass"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Use 'innovex' as login & password for Admin."
        )
    
    token = create_access_token(user_info["id"], email, user_info["role"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_info["id"],
            "email": email,
            "role": user_info["role"]
        }
    }

@router.get("/auth/me")
def get_me(user: dict = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return {"user": user}

@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(): return runtime_service.dashboard()


@router.get("/orders")
def orders(limit: int = Query(100, ge=1, le=500)):
    orders_data = []
    for order in runtime_service.orders(limit):
        d = asdict(order)
        d["lines"] = {
            "items": [{"sku": sku, "quantity": qty} for sku, qty in order.lines]
        }
        orders_data.append(d)
    return {"currency": "INR", "orders": jsonable_encoder(orders_data)}

@router.post("/orders", status_code=201)
def create_order(request: CreateOrderRequest):
    try:
        order = runtime_service.create_order(request.pod_id, request.sku, request.quantity, customer_name=request.customer_name)
        d = asdict(order)
        d["lines"] = {
            "items": [{"sku": sku, "quantity": qty} for sku, qty in order.lines]
        }
        return jsonable_encoder(d)
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
    results = []
    for pod in runtime_service.snapshot().pods:
        h = asdict(pod.health)
        h["online"] = h.get("network_latency_ms", 0.0) < 1000.0
        results.append({
            "pod_id": pod.id,
            "status": pod.status,
            "health": h
        })
    return jsonable_encoder(results)

@router.get("/telemetry")
def telemetry():
    snapshot = runtime_service.snapshot()
    return jsonable_encoder([{"pod_id": pod.id, "recorded_at": snapshot.simulated_at, "temperature_c": pod.health.temperature_c, "power_draw_w": pod.health.power_draw_w, "network_latency_ms": pod.health.network_latency_ms} for pod in snapshot.pods])

@router.get("/intelligence")
def intelligence():
    from ..services.ai_service import ai_service
    return jsonable_encoder(ai_service.get_insight())

@router.get("/anomaly", summary="ML Predictive Maintenance Report")
def anomaly():
    """
    Returns the latest anomaly detection report produced by the on-device
    ML engine (scikit-learn Isolation Forest + Z-score rolling window).

    - **model_status**: `warming_up` while collecting baseline (< 30 ticks),
      `trained` once the Isolation Forest has been fitted.
    - **composite_risk_score**: 0.0 = fully normal, 1.0 = severe anomaly.
    - **features**: per-sensor value, mean, std, z-score, and anomaly flag.
    - **isolation_forest_score**: raw IF decision function score (null when warming up).
    """
    from ..services.anomaly_service import anomaly_service
    return jsonable_encoder(anomaly_service.get_report())


@router.get("/incidents", summary="Incident Replay Timeline Events")
def incidents():
    """
    Returns chronological operational events leading to an incident/alert
    for step-by-step UI replay. Maintains the latest 200 events in memory.
    """
    from ..services.incident_service import incident_service
    return jsonable_encoder(incident_service.get_incidents())


@router.get("/reports/daily", summary="Generate Executive Daily Operational Report")
def daily_report():
    """
    Generates a structured daily operational report with KPI summary, revenue breakdown,
    pod health metrics, anomaly status, and AI domain optimization directives.
    """
    from ..services.report_service import report_service
    return jsonable_encoder(report_service.generate_daily_report())




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


from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]

@router.post("/chat")
def chat(request: ChatRequest):
    import httpx
    from ..services.runtime_service import runtime_service
    from ..core.config import get_settings
    
    settings = get_settings()
    api_key = settings.grok_api_key
    if not api_key:
        return {"response": "Grok API key is not configured on the backend. Please add GROK_API_KEY to your settings."}
        
    snapshot = runtime_service.snapshot()
    pods_info = []
    for pod in snapshot.pods:
        inv_str = ", ".join([f"{item.name} ({item.sku}): {item.quantity}/{item.capacity} units" for item in pod.inventory])
        pods_info.append(
            f"Pod ID: {pod.id}\n"
            f"- Status: {pod.status.value}\n"
            f"- Health Score: {pod.health.score}%\n"
            f"- Temperature: {pod.health.temperature_c}°C\n"
            f"- Power Draw: {pod.health.power_draw_w}W\n"
            f"- Network Latency: {pod.health.network_latency_ms}ms\n"
            f"- Inventory: {inv_str}"
        )
    
    alerts_info = []
    for a in snapshot.alerts:
        alerts_info.append(f"[{a.severity.value.upper()}] Code {a.code}: {a.message} (Active: {a.active})")
        
    metrics_info = (
        f"Order Count: {snapshot.metrics.order_count}\n"
        f"Gross Revenue: {snapshot.metrics.gross_revenue_inr} INR"
    )
    
    system_prompt = (
        "You are the NexPod AI Assistant, a helpful co-pilot for the NexPod autonomous retail platform.\n\n"
        "=== ABOUT NEXPOD ===\n"
        "NexPod AI OS is an intelligent operating system for autonomous retail pods (smart vending machines). "
        "It provides real-time telemetry monitoring, predictive maintenance, AI-driven inventory auto-replenishment, "
        "remote fleet management, and business intelligence — all from a single dashboard. "
        "Key features: predictive operations intelligence, autonomous stock management, hardware health diagnostics, "
        "revenue analytics, customer-facing ordering UI, and Gemini/Groq LLM-powered advisory. "
        "NexPod eliminates manual stock verification, reduces dispatch costs, and maximizes hardware uptime.\n\n"
        "=== LIVE TELEMETRY ===\n"
        f"{chr(10).join(pods_info)}\n\n"
        "=== ACTIVE ALERTS ===\n"
        f"{chr(10).join(alerts_info) if alerts_info else 'No active alerts.'}\n\n"
        "=== BUSINESS METRICS ===\n"
        f"{metrics_info}\n\n"
        "Answer both product/platform questions AND operational queries using the data above. "
        "Keep responses concise, professional, and under 150 words. Use bullet points when helpful."
    )
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in request.messages:
        role = "user" if msg.role == "user" else "assistant"
        api_messages.append({"role": role, "content": msg.content})
        
    try:
        res = httpx.post(url, json={
            "model": settings.grok_model,
            "messages": api_messages,
            "temperature": 0.3
        }, headers=headers, timeout=10.0)
        
        if res.status_code != 200:
            return {"response": f"Error from Grok API (Status {res.status_code}): {res.text}"}
            
        data = res.json()
        ai_message = data["choices"][0]["message"]["content"]
        return {"response": ai_message}
    except Exception as e:
        return {"response": f"Failed to connect to Grok API: {str(e)}"}
