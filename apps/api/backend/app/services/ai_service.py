from datetime import datetime, timezone, timedelta
import json
import logging
from typing import Any
import httpx
from ..core.config import get_settings
from .runtime_service import runtime_service


class AIService:
    """Dedicated analyzer service translating runtime states into operation recommendations."""
    def __init__(self) -> None:
        self._cached_insight = None
        self._cached_time = None
        self._last_state = {
            "inventory": {},
            "health": 100.0,
            "alerts": set()
        }

    def _should_invalidate(self, current_inventory: list, current_health: float, current_alerts: list) -> bool:
        if not self._cached_insight or not self._cached_time:
            return True
        
        # 15 minutes caching limit
        if datetime.now(timezone.utc) - self._cached_time > timedelta(minutes=15):
            return True
            
        # Invalidate if machine health score changes by more than 5%
        if abs(self._last_state["health"] - current_health) >= 5.0:
            return True
            
        # Invalidate if the set of active alerts changed
        alert_keys = {a.id for a in current_alerts}
        if alert_keys != self._last_state["alerts"]:
            return True
            
        # Invalidate if any inventory item quantity has changed
        inv_map = {item.sku: item.quantity for item in current_inventory}
        if inv_map != self._last_state["inventory"]:
            return True
            
        return False

    def _update_last_state(self, current_inventory: list, current_health: float, current_alerts: list) -> None:
        self._last_state["health"] = current_health
        self._last_state["alerts"] = {a.id for a in current_alerts}
        self._last_state["inventory"] = {item.sku: item.quantity for item in current_inventory}

    def _validate_insight(self, data: Any) -> dict:
        if not isinstance(data, dict):
            raise ValueError("Response must be a JSON object (dictionary)")
            
        expected_keys = {
            "summary", "priority", "confidence", "risk", "recommendation",
            "inventoryInsight", "maintenanceInsight", "businessInsight", "demandForecast"
        }
        
        missing_keys = expected_keys - data.keys()
        if missing_keys:
            raise ValueError(f"Missing required keys in response: {missing_keys}")
            
        # Check types
        for key in ["summary", "recommendation", "inventoryInsight", "maintenanceInsight", "businessInsight", "demandForecast"]:
            if not isinstance(data[key], str):
                raise TypeError(f"Key '{key}' must be a string (got type {type(data[key]).__name__})")
                
        for key in ["priority", "risk"]:
            val = data[key]
            if not isinstance(val, str):
                raise TypeError(f"Key '{key}' must be a string (got type {type(val).__name__})")
            upper_val = val.upper()
            if upper_val not in {"LOW", "MEDIUM", "HIGH"}:
                raise ValueError(f"Key '{key}' must be one of LOW, MEDIUM, HIGH (got '{val}')")
            data[key] = upper_val
            
        if not isinstance(data["confidence"], (int, float)):
            raise TypeError(f"Key 'confidence' must be a number (got type {type(data['confidence']).__name__})")
            
        return data

    def _generate_rule_based(self, data: dict) -> dict:
        revenue = data["dashboard"]["revenue"]
        orders = data["dashboard"]["orders"]
        health = data["dashboard"]["machineHealth"]
        alert_count = len(data["alerts"])
        inv_health = data["dashboard"]["inventoryHealth"]
        
        priority = "LOW"
        risk = "LOW"
        confidence = 98
        rec = "System performing nominally. Maintain standard vending dispatch rates."
        summary = f"All systems nominal. Today's revenue stands at INR {revenue} across {orders} orders."
        inv_insight = "Reserves levels are optimal. Automated drone replenishment route is idle."
        maint_insight = f"Core temperature and magnetic closure locks are performing at {health}% efficiency."
        biz_insight = f"Peak hour demand is tracking steady. Vending velocity averages 52s per cup."
        forecast = "Steady hourly volume expected. Prepare for evening rush increase."
 
        if inv_health < 75 or alert_count > 0:
            priority = "HIGH"
            risk = "MEDIUM"
            rec = "Refill the milk reserves immediately and schedule preventive maintenance on dispenser bay solenoid."
            summary = "Warning state detected due to material depletion and active hardware diagnostics alerts."
            inv_insight = "Milk level has dropped below critical 28% capacity threshold. Replenishment warning active."
            maint_insight = "Dispenser bay solenoid requires review. Preventive maintenance due in 120 cups."
            biz_insight = "Beverage dispatch rate is impacted by low material reserves. Order fulfillment queue delayed."
            forecast = "Demand remains elevated. Supply mismatch expected if materials are not replenished."
 
        return {
            "summary": summary,
            "priority": priority,
            "confidence": confidence,
            "risk": risk,
            "recommendation": rec,
            "inventoryInsight": inv_insight,
            "maintenanceInsight": maint_insight,
            "businessInsight": biz_insight,
            "demandForecast": forecast,
        }
 
    def get_insight(self) -> dict:
        import time
        snapshot = runtime_service.snapshot()
        if not snapshot.pods:
            return {}
            
        pod = snapshot.pods[0]
        current_health = pod.health.score
        current_alerts = snapshot.alerts
        current_inventory = pod.inventory
        
        # Verify cache validity
        if not self._should_invalidate(current_inventory, current_health, current_alerts):
            logging.info("AI Service: Cache HIT")
            res = dict(self._cached_insight)
            res["cacheStatus"] = "HIT"
            return res
            
        cache_status = "MISS" if not self._cached_insight else "EXPIRED"
        logging.info(f"AI Service: Cache {cache_status}")

        # Map actual inventory items to keys, fallback to 100% capacity/mock values for other items
        inv_map = {item.sku: item.quantity for item in pod.inventory}
        milk_val = inv_map.get("cold-brew", 60)
        if any(a.code == "demo:milk-low" for a in snapshot.alerts):
            milk_val = 24
        
        inventory_input = {
            "milk": milk_val,
            "beans": inv_map.get("protein-bar", 60),
            "water": inv_map.get("water", 80),
            "tea": 85,
            "sugar": 90
        }
        
        # Compile fresh contextual analysis input JSON payload
        gemini_input = {
            "runtime": {
                "simulationMode": runtime_service.settings["simulation_mode"],
                "uptime": str(timedelta(minutes=runtime_service.ticks_count)),
                "ordersGenerated": snapshot.metrics.order_count
            },
            "dashboard": {
                "revenue": snapshot.metrics.gross_revenue_inr,
                "orders": snapshot.metrics.order_count,
                "machineHealth": round(pod.health.score, 1),
                "inventoryHealth": round(sum(item.quantity / item.capacity for item in pod.inventory) / len(pod.inventory) * 100, 1)
            },
            "inventory": inventory_input,
            "machine": {
                "health": round(pod.health.score, 1),
                "remainingMaintenance": 120 if any(a.code == "demo:preventive-maintenance" for a in snapshot.alerts) else 450
            },
            "alerts": [{"code": a.code, "message": a.message, "severity": a.severity.value} for a in snapshot.alerts],
            "telemetry": {
                "temperature": pod.health.temperature_c,
                "power": pod.health.power_draw_w,
                "voltage": 230.0
            }
        }
 
        api_key = get_settings().gemini_api_key
        model_name = get_settings().gemini_model
        insight = None
        
        if api_key:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            prompt = f"""
            You are the AI Operations Assistant for NexPod AI OS. Your task is to analyze the operational data from an autonomous retail pod supplied below:
            {json.dumps(gemini_input, indent=2)}
 
            Guidelines:
            - Never invent numerical values or change supplied numbers. Only analyze the supplied data.
            - Provide concise, actionable recommendations.
            - Maintain a professional, industrial tone.
            - Maximum 120 words per section.
            - Return ONLY a valid JSON object matching the expected schema.
            - Do NOT include markdown code block formatting (like ```json) in your response.
 
            Expected JSON Schema:
            {{
              "summary": "operational summary",
              "priority": "LOW|MEDIUM|HIGH",
              "confidence": 94,
              "risk": "LOW|MEDIUM|HIGH",
              "recommendation": "main actionable recommendation",
              "inventoryInsight": "material levels insight",
              "maintenanceInsight": "machine diagnostics insight",
              "businessInsight": "revenue / peak hours insight",
              "demandForecast": "demand patterns prediction"
            }}
            """
            
            max_attempts = 2
            for attempt in range(1, max_attempts + 1):
                try:
                    logging.info(f"AI Service: Attempt {attempt} to call Gemini API")
                    t0 = time.perf_counter()
                    res = httpx.post(url, json={
                        "contents": [{"parts": [{"text": prompt}]}]
                    }, timeout=3.0)
                    latency = time.perf_counter() - t0
                    logging.info(f"Gemini API request (attempt {attempt}) completed in {latency:.3f} seconds.")
                    
                    if res.status_code != 200:
                        raise httpx.HTTPStatusError(
                            f"Gemini API returned status {res.status_code}: {res.text}",
                            request=res.request,
                            response=res
                        )
                    
                    payload = res.json()
                    
                    # Log token usage if available
                    usage = payload.get("usageMetadata", {})
                    if usage:
                        logging.info(f"Gemini Token Usage - Input: {usage.get('promptTokenCount', 0)}, Output: {usage.get('candidatesTokenCount', 0)}")
                    
                    raw_text = payload["candidates"][0]["content"]["parts"][0]["text"].strip()
                    # Clean potential markdown wrapping
                    if raw_text.startswith("```"):
                        first_newline = raw_text.find("\n")
                        if first_newline != -1:
                            raw_text = raw_text[first_newline:]
                        if raw_text.endswith("```"):
                            raw_text = raw_text[:-3]
                    
                    parsed_json = json.loads(raw_text.strip())
                    insight = self._validate_insight(parsed_json)
                    insight["generatedBy"] = "Gemini AI"
                    break  # Succeeded, exit loop!
                except Exception as e:
                    logging.error(f"Gemini API call (attempt {attempt}) failed: {e}")
                    if attempt < max_attempts:
                        logging.warning("AI Service: Retrying Gemini API call...")
                    else:
                        logging.error("AI Service: All Gemini API attempts failed. Fallback activation triggered.")
                
        if not insight:
            if not api_key:
                logging.info("AI Service: Missing API Key. Activating Rule Engine fallback.")
            insight = self._generate_rule_based(gemini_input)
            insight["generatedBy"] = "Rule Engine"
            
        insight["cacheStatus"] = cache_status
        insight["generatedAt"] = datetime.now(timezone.utc).isoformat()
            
        # Save to cache
        self._cached_insight = insight
        self._cached_time = datetime.now(timezone.utc)
        self._update_last_state(current_inventory, current_health, current_alerts)
        
        return insight


ai_service = AIService()
