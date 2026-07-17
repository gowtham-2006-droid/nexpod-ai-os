from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from ..database.session import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    role: Mapped[str] = mapped_column(String, default="owner")


class Pod(Base):
    __tablename__ = "pods"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class OrderRecord(Base):
    __tablename__ = "orders"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    pod_id: Mapped[str] = mapped_column(ForeignKey("pods.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    total_inr: Mapped[int] = mapped_column(Integer)
    lines: Mapped[dict] = mapped_column(JSON)


class InventoryRecord(Base):
    __tablename__ = "inventory"
    pod_id: Mapped[str] = mapped_column(ForeignKey("pods.id"), primary_key=True)
    sku: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    quantity: Mapped[int] = mapped_column(Integer)
    capacity: Mapped[int] = mapped_column(Integer)
    reorder_point: Mapped[int] = mapped_column(Integer)
    unit_price_inr: Mapped[int] = mapped_column(Integer)


class MachineHealthRecord(Base):
    __tablename__ = "machine_health"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pod_id: Mapped[str] = mapped_column(ForeignKey("pods.id"), index=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    score: Mapped[float] = mapped_column(Float)
    payload: Mapped[dict] = mapped_column(JSON)


class TelemetryRecord(Base):
    __tablename__ = "telemetry"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pod_id: Mapped[str] = mapped_column(ForeignKey("pods.id"), index=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    payload: Mapped[dict] = mapped_column(JSON)


class AlertRecord(Base):
    __tablename__ = "alerts"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    pod_id: Mapped[str] = mapped_column(ForeignKey("pods.id"))
    severity: Mapped[str] = mapped_column(String)
    code: Mapped[str] = mapped_column(String)
    message: Mapped[str] = mapped_column(Text)
    active: Mapped[bool] = mapped_column(default=True)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class AIInsightRecord(Base):
    __tablename__ = "ai_insights"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pod_id: Mapped[str] = mapped_column(ForeignKey("pods.id"))
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    payload: Mapped[dict] = mapped_column(JSON)
