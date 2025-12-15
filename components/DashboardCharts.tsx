import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { ProductionRecord, InventoryItem, IssueLog } from '../types';

interface DashboardChartsProps {
  production: ProductionRecord[];
  inventory: InventoryItem[];
  issues: IssueLog[];
}

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ production, inventory, issues }) => {
  
  // Prepare Data for Charts
  const productionData = production.map(p => ({
    name: `${p.machine_id} (${p.date.slice(5)})`,
    output: p.output_count,
    efficiency: p.efficiency_rate
  }));

  const issueData = issues.map(i => ({
    name: i.reason,
    minutes: i.downtime_minutes,
    severity: i.severity
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
      {/* Chart 1: Production Output */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Daily Production Output</h3>
        <p className="text-sm text-slate-500 mb-6">Units produced per machine per day</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="output" name="Output (Units)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Inventory Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Inventory Value By Item</h3>
        <p className="text-sm text-slate-500 mb-6">Quantity on hand snapshot</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={inventory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="quantity_on_hand"
                nameKey="part_name"
              >
                {inventory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle"/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Downtime Impact */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Downtime Events</h3>
            <p className="text-sm text-slate-500">Duration in minutes by reason</p>
          </div>
          <div className="flex gap-2">
             <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">High Severity</span>
             <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Medium Severity</span>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={issueData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="name" type="category" width={100} fontSize={12} />
              <Tooltip 
                 cursor={{fill: 'transparent'}}
                 contentStyle={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px' }}
              />
              <Bar dataKey="minutes" name="Downtime (min)" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};