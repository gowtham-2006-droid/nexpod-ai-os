from datetime import datetime
from pydantic import BaseModel, Field


class CreateOrderRequest(BaseModel):
    pod_id: str = "pod-001"
    sku: str
    quantity: int = Field(default=1, ge=1, le=10)
    customer_name: str | None = None


class DashboardResponse(BaseModel):
    revenue: int
    orders: int
    machineHealth: float
    inventoryHealth: float
    alerts: int
    customerRating: float = 4.88
    simulationMode: str
    podStatus: str
    lastUpdated: datetime
    aiInsight: dict
