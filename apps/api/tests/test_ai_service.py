import json
import time
from unittest.mock import MagicMock, patch
import pytest
import httpx

from backend.app.services.ai_service import AIService


def create_mock_snapshot(milk_low=False, maintenance=False):
    snapshot = MagicMock()
    pod = MagicMock()
    pod.id = "pod-001"
    pod.health.score = 95.0
    pod.health.temperature_c = 42.0
    pod.health.power_draw_w = 120.0
    
    item1 = MagicMock()
    item1.sku = "cold-brew"
    item1.quantity = 24 if milk_low else 60
    item1.capacity = 100
    
    item2 = MagicMock()
    item2.sku = "water"
    item2.quantity = 80
    item2.capacity = 100
    
    pod.inventory = [item1, item2]
    snapshot.pods = [pod]
    
    alerts = []
    if milk_low:
        alert1 = MagicMock()
        alert1.id = "alert-1"
        alert1.code = "demo:milk-low"
        alert1.message = "Milk reserves low"
        alert1.severity.value = "warning"
        alerts.append(alert1)
    if maintenance:
        alert2 = MagicMock()
        alert2.id = "alert-2"
        alert2.code = "demo:preventive-maintenance"
        alert2.message = "Dispenser bay solenoid requires review"
        alert2.severity.value = "critical"
        alerts.append(alert2)
        
    snapshot.alerts = alerts
    snapshot.metrics.order_count = 12
    snapshot.metrics.gross_revenue_inr = 1500.0
    return snapshot


VALID_GEMINI_RESPONSE = {
    "summary": "Vending operations are running smoothly.",
    "priority": "LOW",
    "confidence": 95,
    "risk": "LOW",
    "recommendation": "Maintain current configuration.",
    "inventoryInsight": "Inventory level is healthy.",
    "maintenanceInsight": "No diagnostic alerts present.",
    "businessInsight": "Revenue is steady.",
    "demandForecast": "Stable demand patterns."
}


def make_mock_gemini_payload(text_content):
    return {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": text_content
                        }
                    ]
                }
            }
        ],
        "usageMetadata": {
            "promptTokenCount": 100,
            "candidatesTokenCount": 50
        }
    }


@pytest.fixture
def mock_settings():
    with patch("backend.app.services.ai_service.get_settings") as mock_get:
        settings = MagicMock()
        settings.gemini_api_key = "test_api_key"
        settings.gemini_model = "gemini-2.5-flash"
        mock_get.return_value = settings
        yield settings


@pytest.fixture
def mock_runtime():
    with patch("backend.app.services.ai_service.runtime_service") as mock_run:
        mock_run.snapshot.return_value = create_mock_snapshot()
        mock_run.settings = {"simulation_mode": "Evening Rush"}
        mock_run.ticks_count = 150
        yield mock_run


def test_get_insight_success_first_attempt(mock_settings, mock_runtime):
    service = AIService()
    
    mock_payload = make_mock_gemini_payload(json.dumps(VALID_GEMINI_RESPONSE))
    
    with patch("httpx.post") as mock_post:
        mock_post.return_value = MagicMock(status_code=200, json=lambda: mock_payload)
        
        insight = service.get_insight()
        
        assert insight["generatedBy"] == "Gemini AI"
        assert insight["summary"] == VALID_GEMINI_RESPONSE["summary"]
        assert insight["priority"] == "LOW"
        assert insight["confidence"] == 95
        assert insight["risk"] == "LOW"
        assert insight["cacheStatus"] == "MISS"
        
        mock_post.assert_called_once()
        # Verify 10-second timeout was requested
        assert mock_post.call_args[1]["timeout"] == 10.0


def test_get_insight_retry_on_http_error_then_success(mock_settings, mock_runtime):
    service = AIService()
    
    mock_payload = make_mock_gemini_payload(json.dumps(VALID_GEMINI_RESPONSE))
    
    with patch("httpx.post") as mock_post:
        # First call fails (500), second succeeds (200)
        mock_post.side_effect = [
            MagicMock(status_code=500, text="Internal Server Error"),
            MagicMock(status_code=200, json=lambda: mock_payload)
        ]
        
        insight = service.get_insight()
        
        assert insight["generatedBy"] == "Gemini AI"
        assert insight["summary"] == VALID_GEMINI_RESPONSE["summary"]
        assert mock_post.call_count == 2


def test_get_insight_retry_on_validation_error_then_success(mock_settings, mock_runtime):
    service = AIService()
    
    # First response: missing keys
    invalid_response = {"summary": "incomplete response"}
    mock_payload_invalid = make_mock_gemini_payload(json.dumps(invalid_response))
    mock_payload_valid = make_mock_gemini_payload(json.dumps(VALID_GEMINI_RESPONSE))
    
    with patch("httpx.post") as mock_post:
        mock_post.side_effect = [
            MagicMock(status_code=200, json=lambda: mock_payload_invalid),
            MagicMock(status_code=200, json=lambda: mock_payload_valid)
        ]
        
        insight = service.get_insight()
        
        assert insight["generatedBy"] == "Gemini AI"
        assert insight["summary"] == VALID_GEMINI_RESPONSE["summary"]
        assert mock_post.call_count == 2


def test_get_insight_fallback_after_double_failure(mock_settings, mock_runtime):
    service = AIService()
    
    with patch("httpx.post") as mock_post:
        mock_post.side_effect = httpx.ConnectTimeout("Connection timed out")
        
        insight = service.get_insight()
        
        assert insight["generatedBy"] == "Rule Engine"
        assert mock_post.call_count == 2


def test_get_insight_fallback_after_double_validation_failure(mock_settings, mock_runtime):
    service = AIService()
    
    # Bad JSON (non-JSON text or missing keys)
    mock_payload_invalid = make_mock_gemini_payload("This is not JSON at all!")
    
    with patch("httpx.post") as mock_post:
        mock_post.return_value = MagicMock(status_code=200, json=lambda: mock_payload_invalid)
        
        insight = service.get_insight()
        
        assert insight["generatedBy"] == "Rule Engine"
        assert mock_post.call_count == 2


def test_get_insight_cache_hit_and_expiration(mock_settings, mock_runtime):
    service = AIService()
    
    mock_payload = make_mock_gemini_payload(json.dumps(VALID_GEMINI_RESPONSE))
    
    with patch("httpx.post") as mock_post:
        mock_post.return_value = MagicMock(status_code=200, json=lambda: mock_payload)
        
        # 1. First call: MISS
        insight1 = service.get_insight()
        assert insight1["cacheStatus"] == "MISS"
        assert mock_post.call_count == 1
        
        # 2. Second call: HIT (no httpx post call)
        insight2 = service.get_insight()
        assert insight2["cacheStatus"] == "HIT"
        assert mock_post.call_count == 1
        
        # 3. Modify state to trigger invalidation
        # Let's mock a change in inventory health/quantities
        new_snapshot = create_mock_snapshot(milk_low=True)
        mock_runtime.snapshot.return_value = new_snapshot
        
        # 4. Third call: EXPIRED/MISS (due to state change)
        insight3 = service.get_insight()
        assert insight3["cacheStatus"] in ("MISS", "EXPIRED")
        assert mock_post.call_count == 2
