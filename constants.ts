import { ProductionRecord, InventoryItem, IssueLog } from './types';

export const SQL_SCHEMA = `
-- Database: factory_central_db

-- 1. Daily Production Table
CREATE TABLE production_daily (
    id SERIAL PRIMARY KEY,
    production_date DATE NOT NULL,
    machine_id VARCHAR(50),
    output_count INTEGER,
    efficiency_rate DECIMAL(5,2),
    source_system VARCHAR(50) DEFAULT 'SQL_Server_MES'
);

-- 2. Inventory Status Table
CREATE TABLE inventory_status (
    part_id VARCHAR(50) PRIMARY KEY,
    part_name VARCHAR(100),
    quantity_on_hand INTEGER,
    warehouse_location VARCHAR(20),
    last_updated TIMESTAMP,
    source_system VARCHAR(50) DEFAULT 'Excel_Manual'
);

-- 3. Issues/Downtime Log
CREATE TABLE issues_log (
    log_id VARCHAR(50) PRIMARY KEY,
    incident_date TIMESTAMP,
    downtime_minutes INTEGER,
    reason TEXT,
    severity VARCHAR(20),
    source_system VARCHAR(50) DEFAULT 'CSV_Logs'
);
`;

export const PYTHON_ETL_SCRIPT = `
import pandas as pd
from sqlalchemy import create_engine
import pyodbc  # For SQL Server

# Database Connection (The Central Hub)
db_connection_str = 'postgresql://user:password@localhost/factory_central_db'
db_connection = create_engine(db_connection_str)

def ingest_data():
    try:
        # 1. Ingest from SQL Server (MES System)
        print("Reading SQL Server...")
        sql_conn = pyodbc.connect('DRIVER={SQL Server};SERVER=FACTORY-DB;DATABASE=MES;')
        df_production = pd.read_sql("SELECT * FROM dbo.DailyOutput", sql_conn)
        df_production['source_system'] = 'SQL_Server_MES'
        
        # Load to Postgres
        df_production.to_sql('production_daily', db_connection, if_exists='append', index=False)
        print("✔ Production data loaded.")

        # 2. Ingest from Excel (Inventory)
        print("Reading Excel Inventory...")
        df_inventory = pd.read_excel("S:/Shared/Inventory_Tracking.xlsx")
        df_inventory['source_system'] = 'Excel_Manual'
        
        # Load to Postgres
        df_inventory.to_sql('inventory_status', db_connection, if_exists='replace', index=False)
        print("✔ Inventory data loaded.")

        # 3. Ingest from CSV (Issues)
        print("Reading CSV Logs...")
        df_issues = pd.read_csv("C:/Logs/downtime_export_2023.csv")
        df_issues['source_system'] = 'CSV_Logs'
        
        # Load to Postgres
        df_issues.to_sql('issues_log', db_connection, if_exists='append', index=False)
        print("✔ Issues log loaded.")
        
    except Exception as e:
        print(f"Error during ingestion: {e}")

if __name__ == "__main__":
    ingest_data()
`;

export const MOCK_PRODUCTION: ProductionRecord[] = [
  { date: '2023-10-24', machine_id: 'M-101', output_count: 1250, efficiency_rate: 92.5, source_system: 'SQL_Server_MES' },
  { date: '2023-10-24', machine_id: 'M-102', output_count: 980, efficiency_rate: 78.4, source_system: 'SQL_Server_MES' },
  { date: '2023-10-25', machine_id: 'M-101', output_count: 1300, efficiency_rate: 95.0, source_system: 'SQL_Server_MES' },
  { date: '2023-10-25', machine_id: 'M-102', output_count: 1100, efficiency_rate: 88.2, source_system: 'SQL_Server_MES' },
  { date: '2023-10-26', machine_id: 'M-101', output_count: 1280, efficiency_rate: 94.1, source_system: 'SQL_Server_MES' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { part_id: 'P-500', part_name: 'Steel Bearing 5mm', quantity_on_hand: 4500, warehouse_location: 'A-12', last_updated: '2023-10-26 08:00', source_system: 'Excel_Manual' },
  { part_id: 'P-501', part_name: 'Alum. Housing Case', quantity_on_hand: 230, warehouse_location: 'B-04', last_updated: '2023-10-25 14:30', source_system: 'Excel_Manual' },
  { part_id: 'P-502', part_name: 'Copper Wiring (Roll)', quantity_on_hand: 15, warehouse_location: 'C-01', last_updated: '2023-10-26 09:15', source_system: 'Excel_Manual' },
  { part_id: 'P-503', part_name: 'Plastic Sealant', quantity_on_hand: 890, warehouse_location: 'A-10', last_updated: '2023-10-24 16:00', source_system: 'Excel_Manual' },
];

export const MOCK_ISSUES: IssueLog[] = [
  { log_id: 'LOG-001', incident_date: '2023-10-24 10:30', downtime_minutes: 45, reason: 'Sensor Failure', severity: 'Medium', source_system: 'CSV_Logs' },
  { log_id: 'LOG-002', incident_date: '2023-10-25 14:15', downtime_minutes: 120, reason: 'Motor Overheat', severity: 'High', source_system: 'CSV_Logs' },
  { log_id: 'LOG-003', incident_date: '2023-10-26 09:00', downtime_minutes: 15, reason: 'Material Jam', severity: 'Low', source_system: 'CSV_Logs' },
];