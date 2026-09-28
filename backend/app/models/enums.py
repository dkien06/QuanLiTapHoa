import enum


class StoreType(str, enum.Enum):
    GROCERY = "GROCERY"
    SUPPLIER = "SUPPLIER"


class UserRole(str, enum.Enum):
    OWNER = "OWNER"
    STAFF = "STAFF"


class PurchaseOrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    SHIPPING = "SHIPPING"
    RECEIVED = "RECEIVED"
    CANCELLED = "CANCELLED"


class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    TRANSFER = "TRANSFER"


class NotificationType(str, enum.Enum):
    PO_STATUS_CHANGED = "PO_STATUS_CHANGED"
    LOW_STOCK = "LOW_STOCK"
    GENERAL = "GENERAL"


class CategoryMappingStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
