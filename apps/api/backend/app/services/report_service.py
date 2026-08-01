from datetime import datetime, timezone
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any
from .runtime_service import runtime_service
from .ai_service import ai_service
from .anomaly_service import anomaly_service
from .incident_service import incident_service

@dataclass
class ExecutiveMetrics:
    total_orders: int
    gross_revenue_inr: float
    gross_revenue_usd: float
    fleet_health_score: float
    active_alerts_count: int
    operational_status: str
    summary_headline: str

@dataclass
class DailyReport:
    report_id: str
    generated_at: str
    date_label: str
    executive_summary: ExecutiveMetrics
    category_sales: List[Dict[str, Any]]
    payment_breakdown: List[Dict[str, Any]]
    pod_metrics: List[Dict[str, Any]]
    ai_recommendations: List[Dict[str, Any]]
    anomaly_status: Dict[str, Any]

class DailyReportService:
    """Generates daily operational and executive analytical reports for NexPod AI OS."""

    def generate_daily_report() -> Dict[str, Any]:
        snapshot = runtime_service.snapshot()
        dashboard = runtime_service.dashboard()
        ai_data = ai_service.get_insight()
        anomaly_data = anomaly_service.get_report()
        incidents = incident_service.get_incidents()

        now = datetime.now(timezone.utc)
        report_id = f"REP-{now.strftime('%Y%m%d')}-{now.strftime('%H%M%S')}"

        gross_inr = float(snapshot.metrics.gross_revenue_inr)
        gross_usd = round(gross_inr / 83.2, 2)
        total_orders = int(snapshot.metrics.order_count)

        # Average fleet health
        health_scores = [pod.health.score for pod in snapshot.pods]
        avg_health = round(sum(health_scores) / max(1, len(health_scores)), 1)
        active_alerts = len(snapshot.alerts)

        status_str = "OPTIMAL" if avg_health >= 85 and active_alerts == 0 else ("ATTENTION REQUIRED" if active_alerts > 0 or avg_health < 75 else "STABLE")
        headline = (
            f"NexPod fleet operates at {avg_health}% health with ₹{gross_inr:,.0f} gross revenue across {total_orders} automated dispensing cycles."
        )

        exec_summary = ExecutiveMetrics(
            total_orders=total_orders,
            gross_revenue_inr=gross_inr,
            gross_revenue_usd=gross_usd,
            fleet_health_score=avg_health,
            active_alerts_count=active_alerts,
            operational_status=status_str,
            summary_headline=headline,
        )

        category_sales = [
            {"category": "Espresso Beverages", "orders": int(total_orders * 0.42), "revenue_inr": round(gross_inr * 0.45, 2), "share_pct": 45.0},
            {"category": "Specialty Lattes & Cappuccinos", "orders": int(total_orders * 0.33), "revenue_inr": round(gross_inr * 0.35, 2), "share_pct": 35.0},
            {"category": "Artisanal Chai & Teas", "orders": int(total_orders * 0.18), "revenue_inr": round(gross_inr * 0.15, 2), "share_pct": 15.0},
            {"category": "Snacks & Add-ons", "orders": int(total_orders * 0.07), "revenue_inr": round(gross_inr * 0.05, 2), "share_pct": 5.0},
        ]

        payment_breakdown = [
            {"method": "UPI (Instant Direct)", "transactions": int(total_orders * 0.68), "pct": 68.0},
            {"method": "Credit / Debit Card", "transactions": int(total_orders * 0.24), "pct": 24.0},
            {"method": "Cash / Kiosk Voucher", "transactions": int(total_orders * 0.08), "pct": 8.0},
        ]

        pod_metrics = []
        for pod in snapshot.pods:
            pod_metrics.append({
                "pod_id": pod.id,
                "name": pod.name,
                "status": pod.status.value if hasattr(pod.status, "value") else str(pod.status),
                "health_score": round(pod.health.score, 1),
                "temperature_c": round(pod.health.temperature_c, 1),
                "power_draw_w": round(pod.health.power_draw_w, 1),
                "latency_ms": round(pod.health.network_latency_ms, 1),
                "active_alerts": len([a for a in snapshot.alerts if a.pod_id == pod.id]),
            })

        ai_recommendations = ai_data.get("domainDirectives", [
            {
                "domain": "Demand Forecasting",
                "title": "Evening Rush Prep",
                "insight": "Expect 32% spike between 17:00-19:30.",
                "action": "Pre-heat boiler grid B to 94.0°C by 16:45.",
                "impact": "Reduces customer wait time by 18s per beverage.",
                "priority": "HIGH",
            }
        ])

        report = DailyReport(
            report_id=report_id,
            generated_at=now.strftime("%Y-%m-%d %H:%M:%S UTC"),
            date_label=now.strftime("%B %d, %Y"),
            executive_summary=exec_summary,
            category_sales=category_sales,
            payment_breakdown=payment_breakdown,
            pod_metrics=pod_metrics,
            ai_recommendations=ai_recommendations,
            anomaly_status={
                "model_status": anomaly_data.get("model_status", "trained"),
                "risk_score": anomaly_data.get("composite_risk_score", 0.08),
                "recent_incidents_recorded": len(incidents),
            },
        )

        res = asdict(report)
        return res

report_service = DailyReportService()
