export interface HealthCheck {
  status: string;
  message: string;
  timestamp: string;
  version: string;
}

export interface InternalDataItem {
  id: string;
  name: string;
  value: string;
  createdAt: string;
}

export interface InternalApiState {
  health: HealthCheck | null;
  internalData: InternalDataItem[];
}