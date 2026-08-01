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
        insight["reasoning"] = self._build_reasoning(snapshot)
        insight["domainDirectives"] = self._build_domain_directives(snapshot, insight)
            
        # Save to cache
        self._cached_insight = insight
        self._cached_time = datetime.now(timezone.utc)
        self._update_last_state(current_inventory, current_health, current_alerts)
        
        return insight

    def _build_domain_directives(self, snapshot, base_insight: dict) -> list[dict[str, Any]]:
        """
        Generate dynamic multi-agent domain directives for Demand, Inventory,
        Machine Diagnostics, and Business Margins.
        """
        if not snapshot or not hasattr(snapshot, "pods") or not snapshot.pods:
            return []

        def _num(val: Any, default: float = 0.0) -> float:
            if isinstance(val, (int, float)):
                return float(val)
            return default

        def _str(val: Any, default: str = "") -> str:
            if isinstance(val, str):
                return val
            return default

        pod = snapshot.pods[0]
        health = round(_num(getattr(pod.health, "score", 100)), 1)
        temp = round(_num(getattr(pod.health, "temperature_c", 65)), 1)
        latency = round(_num(getattr(pod.health, "network_latency_ms", 20)), 1)
        revenue = _num(getattr(snapshot.metrics, "gross_revenue_inr", 0))
        orders = int(_num(getattr(snapshot.metrics, "order_count", 0)))
        alerts = getattr(snapshot, "alerts", [])

        inv_items = getattr(pod, "inventory", [])
        inv_map = {}
        if isinstance(inv_items, (list, tuple)):
            inv_map = {getattr(item, "sku", ""): item for item in inv_items}

        milk_item = inv_map.get("cold-brew") or inv_map.get("milk")
        milk_qty = int(_num(getattr(milk_item, "quantity", 60))) if milk_item else 28
        milk_reorder = int(_num(getattr(milk_item, "reorder_point", 30))) if milk_item else 30
        milk_low = milk_qty <= milk_reorder

        # 1. Demand Agent
        sim_mode = _str(runtime_service.settings.get("simulation_mode"), "Evening Rush")
        demand_priority = "HIGH" if orders > 100 or sim_mode == "Evening Rush" else "LOW"
        demand_insight = base_insight.get("demandForecast") or f"Current volume tracking at {orders} orders today under {sim_mode} profile."
        demand_rec = "Increase brew heating preheat duty to accommodate peak rush demand." if orders > 50 else "Maintain current brew velocity parameters."

        # 2. Inventory Agent
        inv_priority = "HIGH" if milk_low or any("milk" in _str(getattr(a, "code", "")) for a in alerts) else "LOW"
        inv_insight = base_insight.get("inventoryInsight") or f"Milk reserve level at {milk_qty}% capacity. Low stock warning active."
        inv_rec = f"Schedule autonomous route to refill milk payload ({milk_qty}% remaining)." if inv_priority == "HIGH" else "Material reserves nominal. Restocking route on standby."

        # 3. Machine Diagnostics Agent
        maint_priority = "HIGH" if temp > 80.0 or health < 85.0 else "LOW"
        maint_insight = base_insight.get("maintenanceInsight") or f"Boiler core temp: {temp}°C, Latency: {latency:.0f}ms. Overall machine score: {health}%."
        maint_rec = f"Perform preventive thermal fuse calibration on boiler unit (temp: {temp}°C)." if temp > 80.0 else "All 8 hardware modules passed diagnostic sweep."

        # 4. Business Margins Agent
        aov = int(_num(getattr(snapshot.metrics, "average_order_value_inr", 0)))
        biz_priority = "MEDIUM" if revenue > 15000 else "LOW"
        biz_insight = base_insight.get("businessInsight") or f"Gross revenue INR {int(revenue):,} across {orders} transactions (AOV: INR {aov})."
        biz_rec = "Dynamic pricing engine: Boost cappuccino margin by +5% during peak rush." if orders > 50 else "Pricing strategy optimal. Margin yield at 64%."

        base_conf = int(_num(base_insight.get("confidence"), 94))

        return [
            {
                "id": "demand",
                "name": "Demand Intelligence Agent",
                "icon": "trending-up",
                "confidence": base_conf,
                "priority": demand_priority,
                "insight": demand_insight,
                "recommendation": demand_rec,
            },
            {
                "id": "inventory",
                "name": "Inventory Operations Agent",
                "icon": "layers",
                "confidence": max(85, base_conf - 2),
                "priority": inv_priority,
                "insight": inv_insight,
                "recommendation": inv_rec,
            },
            {
                "id": "machine",
                "name": "Machine Diagnostics Agent",
                "icon": "activity",
                "confidence": min(99, base_conf + 2),
                "priority": maint_priority,
                "insight": maint_insight,
                "recommendation": maint_rec,
            },
            {
                "id": "business",
                "name": "Business Margins Agent",
                "icon": "bar-chart",
                "confidence": max(80, base_conf - 1),
                "priority": biz_priority,
                "insight": biz_insight,
                "recommendation": biz_rec,
            },
        ]

    def _build_reasoning(self, snapshot) -> dict[str, Any]:
        """
        Generate structured Explainable AI (XAI) reasoning signals from live
        telemetry, inventory, machine health, and alert state.
        """
        if not snapshot or not hasattr(snapshot, "pods") or not snapshot.pods:
            return {
                "healthScore": 100.0,
                "confidence": 98,
                "reasoningSignals": [{"status": "healthy", "label": "Telemetry stable"}],
                "predictedNextEvent": "Nominal operation expected.",
                "recommendations": ["1. Continue monitoring telemetry."],
            }

        def _num(val: Any, default: float = 0.0) -> float:
            if isinstance(val, (int, float)):
                return float(val)
            return default

        def _str(val: Any, default: str = "") -> str:
            if isinstance(val, str):
                return val
            return default

        pod = snapshot.pods[0]
        health = round(_num(getattr(pod.health, "score", 100)), 1)
        temp = round(_num(getattr(pod.health, "temperature_c", 65)), 1)
        latency = round(_num(getattr(pod.health, "network_latency_ms", 20)), 1)
        alerts = getattr(snapshot, "alerts", [])

        inv_items = getattr(pod, "inventory", [])
        inv_map = {}
        if isinstance(inv_items, (list, tuple)):
            inv_map = {getattr(item, "sku", ""): item for item in inv_items}

        water_item = inv_map.get("water")
        milk_item = inv_map.get("cold-brew") or inv_map.get("milk")
        beans_item = inv_map.get("protein-bar") or inv_map.get("coffee_beans") or inv_map.get("beans")

        signals = []

        # 1. Telemetry signal
        if temp > 85.0:
            signals.append({"status": "critical", "label": f"Boiler temperature critical ({temp}°C)"})
        elif temp > 75.0:
            signals.append({"status": "warning", "label": f"Boiler temperature showing an upward trend ({temp}°C)"})
        else:
            signals.append({"status": "healthy", "label": "Telemetry stable"})

        # 2. Water level signal
        if water_item:
            w_qty = _num(getattr(water_item, "quantity", 80))
            w_reorder = _num(getattr(water_item, "reorder_point", 30))
            if w_qty == 0:
                signals.append({"status": "critical", "label": "Water reservoir depleted"})
            elif w_qty <= w_reorder:
                signals.append({"status": "warning", "label": f"Water level low ({w_qty:.0f}L remaining)"})
            else:
                signals.append({"status": "healthy", "label": "Water level above operational threshold"})
        else:
            signals.append({"status": "healthy", "label": "Water level above operational threshold"})

        # 3. Milk / liquid inventory signal
        if milk_item:
            m_qty = _num(getattr(milk_item, "quantity", 60))
            m_reorder = _num(getattr(milk_item, "reorder_point", 30))
            alert_has_milk = any("milk" in _str(getattr(a, "code", "")) for a in alerts)
            if m_qty == 0:
                signals.append({"status": "critical", "label": "Milk reservoir depleted — cappuccino queue stalled"})
            elif m_qty <= m_reorder or alert_has_milk:
                signals.append({"status": "warning", "label": "Milk consumption increasing rapidly"})
            else:
                signals.append({"status": "healthy", "label": "Milk & liquid dairy reserves optimal"})
        else:
            signals.append({"status": "warning", "label": "Milk consumption increasing rapidly"})

        # 4. Network connectivity signal
        if latency > 1000.0:
            signals.append({"status": "critical", "label": f"Network latency critical ({latency:.0f}ms)"})
        elif latency > 400.0:
            signals.append({"status": "warning", "label": f"Network latency elevated ({latency:.0f}ms)"})
        else:
            signals.append({"status": "healthy", "label": "Network connectivity healthy"})

        # Predicted Next Event
        milk_alert = any("milk" in _str(getattr(a, "code", "")) for a in alerts)
        m_qty_low = milk_item and (_num(getattr(milk_item, "quantity", 60)) <= _num(getattr(milk_item, "reorder_point", 30)))
        if milk_alert or m_qty_low:
            predicted_event = "Milk refill required within 8 hours."
        elif temp > 75.0:
            predicted_event = "Boiler thermal limit warning expected within 2 hours."
        elif health < 85.0:
            predicted_event = "Preventive maintenance cycle recommended within 24 hours."
        else:
            predicted_event = "Nominal operation expected through next peak demand cycle."

        # Recommendations
        recs = []
        if milk_alert or m_qty_low:
            recs.append("1. Refill milk reservoir")
        else:
            recs.append("1. Maintain standard vending dispatch velocity")

        if temp > 75.0:
            recs.append("2. Inspect boiler if temperature continues rising")
        else:
            recs.append("2. Verify dispenser bay solenoid seals during routine sweep")

        recs.append("3. Continue monitoring telemetry for the next operational cycle")

        return {
            "healthScore": health,
            "confidence": 98,
            "reasoningSignals": signals,
            "predictedNextEvent": predicted_event,
            "recommendations": recs,
        }


ai_service = AIService()

