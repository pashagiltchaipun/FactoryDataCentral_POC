import React, { useState, useEffect } from 'react';
import { Database, FileSpreadsheet, FileText, Server, Play, CheckCircle2, LayoutDashboard, ArrowRight, Info, BookOpen, Share2, Globe, Copy } from 'lucide-react';
import { ViewState, IngestionLog } from './types';
import { SQL_SCHEMA, PYTHON_ETL_SCRIPT, MOCK_PRODUCTION, MOCK_INVENTORY, MOCK_ISSUES } from './constants';
import CodeBlock from './components/CodeBlock';
import { DashboardCharts } from './components/DashboardCharts';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('intro');
  const [ingestionStatus, setIngestionStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [logs, setLogs] = useState<IngestionLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Simulation Logic
  const runIngestion = () => {
    if (ingestionStatus === 'completed') {
       // Reset if already done
       setIngestionStatus('idle');
       setLogs([]);
       setProgress(0);
       return;
    }

    setIngestionStatus('running');
    setLogs([]);
    setProgress(0);

    const steps = [
      { msg: 'Initializing Python ETL script...', type: 'info', delay: 500, prog: 10 },
      { msg: 'Connecting to local PostgreSQL database...', type: 'info', delay: 1000, prog: 20 },
      { msg: 'Connecting to SQL Server (MES)...', type: 'info', delay: 1500, prog: 30 },
      { msg: 'Reading dbo.DailyOutput...', type: 'info', delay: 2000, prog: 40 },
      { msg: '✔ Loaded 500 records from SQL Server into [production_daily]', type: 'success', delay: 2500, prog: 50 },
      { msg: 'Reading "Inventory_Tracking.xlsx"...', type: 'info', delay: 3000, prog: 60 },
      { msg: '✔ Loaded 1,200 records from Excel into [inventory_status]', type: 'success', delay: 3500, prog: 75 },
      { msg: 'Reading "downtime_export_2023.csv"...', type: 'info', delay: 4000, prog: 85 },
      { msg: '✔ Loaded 45 records from CSV into [issues_log]', type: 'success', delay: 4500, prog: 95 },
      { msg: 'ETL Pipeline execution finished successfully.', type: 'success', delay: 5000, prog: 100 },
    ];

    let accumulatedDelay = 0;
    steps.forEach((step, index) => {
      accumulatedDelay += (step.delay - (index > 0 ? steps[index - 1].delay : 0));
      setTimeout(() => {
        setLogs(prev => [...prev, { id: Date.now(), timestamp: new Date().toLocaleTimeString(), message: step.msg, type: step.type as any }]);
        setProgress(step.prog);
        if (index === steps.length - 1) {
          setIngestionStatus('completed');
        }
      }, step.delay);
    });
  };

  const NavButton = ({ view, label, icon: Icon }: { view: ViewState; label: string; icon: any }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        currentView === view
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center animate-bounce">
          <CheckCircle2 className="text-green-400 mr-3" size={20} />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Database className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">FactoryData<span className="text-blue-600">Central</span> POC</h1>
                <p className="text-xs text-slate-500">Micro-POC: Multi-source Data Ingestion</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-1 bg-slate-100 p-1 rounded-xl">
              <NavButton view="intro" label="Overview" icon={Info} />
              <NavButton view="design" label="Design" icon={BookOpen} />
              <NavButton view="sources" label="Sources" icon={FileSpreadsheet} />
              <NavButton view="ingestion" label="Ingestion" icon={Server} />
              <NavButton view="dashboard" label="Dashboard" icon={LayoutDashboard} />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: INTRO */}
        {currentView === 'intro' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Project Objective</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                This Proof of Concept (POC) demonstrates how a factory can move away from fragmented data silos 
                (isolated Excel sheets, legacy SQL databases, and loose CSV logs) into a centralized, modern data architecture.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Server className="text-red-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">The Problem</h3>
                  <p className="text-sm text-slate-500">
                    Production data is in SQL Server, Inventory is in Excel, Downtime is in CSVs. 
                    Managers spend 4 hours/day manually merging reports.
                  </p>
                </div>
                
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Database className="text-blue-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">The Solution</h3>
                  <p className="text-sm text-slate-500">
                    A centralized PostgreSQL database that acts as a "Single Source of Truth", automatically fed by Python scripts.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <LayoutDashboard className="text-green-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">The Result</h3>
                  <p className="text-sm text-slate-500">
                    Real-time visibility into efficiency and inventory. Ready for AWS/Cloud migration later.
                  </p>
                </div>
              </div>
            </div>

            {/* Deployment & Sharing Section */}
            <div className="bg-slate-900 rounded-2xl p-8 shadow-lg text-white">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Globe className="text-white h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">How to Share this POC</h3>
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                    This entire application is built as a static client-side bundle. You can share it with your team in two ways:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                      <h4 className="font-semibold text-blue-400 mb-1">Option 1: Host it</h4>
                      <p className="text-xs text-slate-400">
                        Upload the <code>index.html</code> and associated files to any static host (Vercel, Netlify, GitHub Pages, or internal S3 bucket). Send the URL to stakeholders.
                      </p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                      <h4 className="font-semibold text-blue-400 mb-1">Option 2: Zip & Send</h4>
                      <p className="text-xs text-slate-400">
                        Since this POC uses mock data and runs in the browser, you can simply zip the folder and email it. The recipient just needs to open <code>index.html</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
               <button 
                onClick={() => setCurrentView('design')} 
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
               >
                 <span>See Database Design</span>
                 <ArrowRight size={18} />
               </button>
            </div>
          </div>
        )}

        {/* VIEW: DESIGN */}
        {currentView === 'design' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-2">1. Database Design (PostgreSQL)</h2>
              <p className="text-slate-600 text-sm mb-4">
                We use a simple Star Schema or Normalized approach depending on volume. For this POC, we created three specific tables to map our sources.
              </p>
              <CodeBlock title="SQL: Create Tables" code={SQL_SCHEMA} language="sql" />
            </div>
             <div className="flex justify-end">
               <button 
                onClick={() => setCurrentView('sources')} 
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
               >
                 <span>View Source Data</span>
                 <ArrowRight size={18} />
               </button>
            </div>
          </div>
        )}

        {/* VIEW: SOURCES */}
        {currentView === 'sources' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900">2. Mock Source Data</h2>
            <p className="text-slate-600">These represent the disparate systems we are pulling from.</p>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Source 1 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-indigo-900 px-4 py-3 flex items-center space-x-2">
                   <Server className="text-white" size={16} />
                   <h3 className="text-white font-medium text-sm">Legacy MES (SQL Server)</h3>
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="min-w-full text-xs text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2">Date</th>
                        <th className="py-2">Machine</th>
                        <th className="py-2 text-right">Output</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_PRODUCTION.slice(0,3).map((r, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="py-2 text-slate-600">{r.date}</td>
                          <td className="py-2 font-mono text-slate-800">{r.machine_id}</td>
                          <td className="py-2 text-right text-slate-600">{r.output_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Source 2 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-emerald-700 px-4 py-3 flex items-center space-x-2">
                   <FileSpreadsheet className="text-white" size={16} />
                   <h3 className="text-white font-medium text-sm">Inventory (Excel)</h3>
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="min-w-full text-xs text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2">Part ID</th>
                        <th className="py-2">Loc</th>
                        <th className="py-2 text-right">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                       {MOCK_INVENTORY.slice(0,3).map((r, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="py-2 font-mono text-slate-800">{r.part_id}</td>
                          <td className="py-2 text-slate-600">{r.warehouse_location}</td>
                          <td className="py-2 text-right text-slate-600">{r.quantity_on_hand}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Source 3 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-amber-600 px-4 py-3 flex items-center space-x-2">
                   <FileText className="text-white" size={16} />
                   <h3 className="text-white font-medium text-sm">Logs (CSV)</h3>
                </div>
                <div className="p-4 overflow-x-auto">
                   <div className="font-mono text-xs text-slate-600 space-y-1">
                      <div className="pb-1 border-b border-slate-100 font-bold">log_id,date,mins,reason</div>
                      {MOCK_ISSUES.map((r,i) => (
                        <div key={i}>{r.log_id},{r.incident_date.split(' ')[0]},{r.downtime_minutes},{r.reason}</div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
               <button 
                onClick={() => setCurrentView('ingestion')} 
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
               >
                 <span>Go to Ingestion Logic</span>
                 <ArrowRight size={18} />
               </button>
            </div>
          </div>
        )}

        {/* VIEW: INGESTION */}
        {currentView === 'ingestion' && (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">3. Data Ingestion Logic (Python)</h2>
                    <p className="text-slate-600 text-sm">
                      This Python script reads from the three distinct sources and normalizes the data into PostgreSQL.
                    </p>
                  </div>
                  <button 
                    onClick={runIngestion}
                    disabled={ingestionStatus === 'running'}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-bold text-white transition-all shadow-lg ${
                      ingestionStatus === 'running' 
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : ingestionStatus === 'completed'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {ingestionStatus === 'running' ? (
                      <><span>Running...</span></>
                    ) : ingestionStatus === 'completed' ? (
                       <><CheckCircle2 size={20} /><span>Done! Rerun?</span></>
                    ) : (
                       <><Play size={20} /><span>Run ETL Pipeline</span></>
                    )}
                  </button>
               </div>
               
               {/* Progress Bar */}
               {(ingestionStatus !== 'idle') && (
                 <div className="mb-6 space-y-2">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div 
                        className="h-full bg-blue-600 transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }} 
                       />
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4 h-48 overflow-y-auto code-scroll font-mono text-xs text-green-400">
                       {logs.map((log, i) => (
                         <div key={log.id} className="mb-1">
                           <span className="text-slate-500">[{log.timestamp}]</span> 
                           <span className={log.type === 'error' ? 'text-red-400' : log.type === 'info' ? 'text-slate-300' : 'text-green-400'}> {log.message}</span>
                         </div>
                       ))}
                       {ingestionStatus === 'running' && <div className="animate-pulse">_</div>}
                    </div>
                 </div>
               )}

              <CodeBlock title="ingest_data.py" code={PYTHON_ETL_SCRIPT} language="python" />
            </div>

            {ingestionStatus === 'completed' && (
              <div className="flex justify-end animate-bounce">
                <button 
                  onClick={() => setCurrentView('dashboard')} 
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
                >
                  <span>View Dashboard</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-bold text-slate-900">Factory Manager Dashboard</h2>
                   <p className="text-slate-600">Unified view of Production, Inventory, and Maintenance.</p>
                </div>
                {ingestionStatus === 'completed' ? (
                  <button 
                    onClick={() => showNotification('Dashboard link copied to clipboard!')}
                    className="flex items-center space-x-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <Share2 size={16} />
                    <span>Share Report</span>
                  </button>
                ) : (
                  <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm flex items-center border border-amber-200">
                    <Info size={16} className="mr-2" />
                    <span>Data is waiting for ingestion. <button onClick={() => setCurrentView('ingestion')} className="underline font-semibold">Run Pipeline</button></span>
                  </div>
                )}
             </div>
             
             {ingestionStatus === 'completed' ? (
                <DashboardCharts 
                  production={MOCK_PRODUCTION} 
                  inventory={MOCK_INVENTORY} 
                  issues={MOCK_ISSUES} 
                />
             ) : (
                <div className="h-96 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400">
                   <Database size={48} className="mb-4 text-slate-300" />
                   <p>No Data loaded in Central Database</p>
                </div>
             )}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;