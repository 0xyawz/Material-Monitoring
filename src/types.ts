export type UrgencyLevel = 'low' | 'medium' | 'high';

export type Stage = 'request' | 'purchase' | 'delivery' | 'completed';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export type PurchaseStatus = 'processing' | 'ready_for_delivery';

export type DeliveryStatus = 'warehouse' | 'transit' | 'arrived' | 'received';

export interface TransitLog {
  id: string;
  status: DeliveryStatus;
  timestamp: string;
  note: string;
}

export interface PurchaseInfo {
  poNumber: string;
  supplier: string;
  unitPrice: number;
  totalPrice: number;
  purchaseDate: string;
  status: PurchaseStatus;
}

export interface DeliveryInfo {
  suratJalan: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  departureDate: string;
  eta: string;
  currentStatus: DeliveryStatus;
  transitLogs: TransitLog[];
  deliveredDate?: string;
  receivedBy?: string;
}

export interface MaterialItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  site: string;
  urgency: UrgencyLevel;
  requestedBy: string;
  dateRequested: string;
  stage: Stage;
  requestStatus: RequestStatus;
  approvedDate?: string;
  purchase?: PurchaseInfo;
  delivery?: DeliveryInfo;
}

export interface ConstructionSite {
  id: string;
  name: string;
  code: string;
  location: string;
  manager: string;
  latitude: number;
  longitude: number;
}
