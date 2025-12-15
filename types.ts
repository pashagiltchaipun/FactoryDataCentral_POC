export interface ProductionRecord {
  date: string;
  machine_id: string;
  output_count: number;
  efficiency_rate: number;
  source_system: string;
}

export interface InventoryItem {
  part_id: string;
  part_name: string;
  quantity_on_hand: number;
  warehouse_location: string;
  last_updated: string;
  source_system: string;
}

export interface IssueLog {
  log_id: string;
  incident_date: string;
  downtime_minutes: number;
  reason: string;
  severity: 'Low' | 'Medium' | 'High';
  source_system: string;
}

export type ViewState = 'intro' | 'design' | 'sources' | 'ingestion' | 'dashboard';

export interface IngestionLog {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}