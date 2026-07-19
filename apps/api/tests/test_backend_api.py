from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_dashboard_api_exposes_owner_kpis():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    body = response.json()
    assert {"revenue", "orders", "machineHealth", "inventoryHealth", "aiInsight"} <= body.keys()

def test_runtime_read_apis_expose_operational_state():
    assert client.get("/api/orders").status_code == 200
    assert client.get("/api/inventory").status_code == 200
    assert client.get("/api/machine").status_code == 200
    assert client.get("/api/telemetry").status_code == 200
    assert client.get("/api/intelligence").status_code == 200

def test_runtime_order_command_updates_the_source_of_truth():
    response = client.post("/api/orders", json={"sku": "water", "quantity": 1})
    assert response.status_code == 201
    assert response.json()["total_inr"] > 0

def test_runtime_endpoint_returns_simulation_info():
    response = client.get("/api/runtime")
    assert response.status_code == 200
    body = response.json()
    assert {"engineStatus", "simulationMode", "runtimeTick", "uptime", "ordersGenerated"} <= body.keys()
    assert body["engineStatus"] == "Running"

def test_health_endpoint_returns_system_diagnostics():
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert {"backendStatus", "databaseStatus", "runtimeStatus", "apiStatus", "timestamp"} <= body.keys()
    assert body["backendStatus"] == "Healthy"
    assert body["runtimeStatus"] == "Running"

def test_settings_endpoints_permit_reading_and_writing():
    # Read settings
    response = client.get("/api/settings")
    assert response.status_code == 200
    
    # Save settings update
    update_response = client.post("/api/settings", json={"simulation_mode": "Morning", "confidence_threshold": 92})
    assert update_response.status_code == 200
    body = update_response.json()
    assert body["simulation_mode"] == "Morning"
    assert body["confidence_threshold"] == 92


def test_machine_endpoint_exposes_online_status():
    response = client.get("/api/machine")
    assert response.status_code == 200
    body = response.json()
    assert len(body) > 0
    assert "online" in body[0]["health"]
    assert isinstance(body[0]["health"]["online"], bool)


def test_ai_auto_reorder_replenishment():
    # 1. Enable auto-reorder
    client.post("/api/settings", json={"ai_auto_reorder": True})
    
    # 2. Get initial water quantity
    inv_before = client.get("/api/inventory").json()
    water_before = next(item for item in inv_before["pods"][0]["inventory"] if item["sku"] == "water")
    init_qty = water_before["quantity"]
    reorder_pt = water_before["reorder_point"]
    capacity = water_before["capacity"]
    
    # 3. Drain water to or below reorder point
    # We place orders of 10 to cross the threshold
    drain_needed = init_qty - reorder_pt
    ordered = 0
    while ordered <= drain_needed:
        qty_to_order = min(10, drain_needed + 1 - ordered)
        if qty_to_order <= 0:
            break
        client.post("/api/orders", json={"sku": "water", "quantity": qty_to_order})
        ordered += qty_to_order
        
    # 4. Check that it was replenished back to capacity!
    inv_after = client.get("/api/inventory").json()
    water_after = next(item for item in inv_after["pods"][0]["inventory"] if item["sku"] == "water")
    assert water_after["quantity"] == capacity


