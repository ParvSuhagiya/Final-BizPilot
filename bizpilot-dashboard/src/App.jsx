import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, FileText, ArrowRight, TrendingUp, CheckCircle2, Clock, Wifi, WifiOff } from 'lucide-react';
import Header from './components/Header';
import DashboardCard from './components/DashboardCard';
import StatCard from './components/StatCard';
import { briefingData } from './data/mockData';
import { checkHealth, fetchTasks, fetchTransactions, fetchClients } from './services/api';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    const loadData = async () => {
      const health = await checkHealth();
      setIsConnected(health);

      if (health) {
        const [tasksData, transactionsData, clientsData] = await Promise.all([
          fetchTasks(),
          fetchTransactions(),
          fetchClients()
        ]);
        setTasks(tasksData);
        setTransactions(transactionsData);
        setClients(clientsData);
      }
      setLoading(false);
    };

    loadData();

    // Poll health every 30 seconds
    const interval = setInterval(async () => {
      const health = await checkHealth();
      setIsConnected(health);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calculate Stats
  const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;
  // Determine next follow-up (simplified: find first client with a future followUpDate)
  // In a real app, we'd parse dates properly. Assuming string dates for now or just taking the latest client.
  const nextClient = clients.length > 0 ? clients[0] : null;

  const statsData = [
    {
      title: "Today's Tasks",
      value: pendingTasksCount.toString(),
      label: "PENDING",
      subtext: `${tasks.length} total tasks`,
      icon: CheckCircle2,
      iconColor: "text-gray-400",
    },
    {
      title: "Total Clients",
      value: clients.length.toString(),
      label: "ACTIVE",
      subtext: nextClient ? `Latest: ${nextClient.name}` : "No clients yet",
      icon: Clock, // Using Clock as a placeholder for Clients icon if needed, or stick to Calendar
      iconColor: "text-accent-blue",
    },
  ];

  // Calculate Financials
  const sales = transactions
    .filter(t => t.type === 'sale')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const netIncome = sales - expenses;

  const salesDataObj = {
    sales: { label: "Sales", value: `$${sales.toLocaleString()}` },
    expenses: { label: "Expenses", value: `$${expenses.toLocaleString()}` },
    net: `$${netIncome.toLocaleString()}`,
  };


  return (
    <div className="min-h-screen bg-bg-light pb-20">
      <Header />
      
      {/* Connection Status Banner */}
      <div className={`w-full py-1 text-center text-xs font-semibold ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} transition-colors duration-300`}>
          <div className="flex items-center justify-center gap-2">
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? "Backend Connected" : "Backend Disconnected - Showing cached/empty data"}
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 mt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10"
        >
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Owner Dashboard
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl">
            Welcome back! Here's your real-time overview.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Row 1: Key Stats */}
          {statsData.map((stat, index) => (
            <StatCard key={index} {...stat} delay={index * 0.1} />
          ))}

          {/* Row 2: Sales vs Expenses (Expanded) */}
          <DashboardCard delay={0.3} className="md:col-span-2 lg:col-span-1 min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-accent-green" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Financial Overview</h3>
              </div>
            </div>

            <div className="space-y-6">
              {/* Net Income Display */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <div className="text-sm text-text-secondary font-medium mb-1">Net Income</div>
                 <div className="text-3xl font-bold text-gray-900">{salesDataObj.net}</div>
                 <div className="flex items-center gap-1 mt-2 text-sm text-accent-green font-medium">
                   <TrendingUp className="w-4 h-4" />
                   <span>Real-time data</span>
                 </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-default group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                    <span className="text-text-secondary font-medium">{salesDataObj.sales.label}</span>
                  </div>
                  <span className="text-gray-900 font-bold group-hover:scale-105 transition-transform">
                     {salesDataObj.sales.value}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-default group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent-red"></div>
                    <span className="text-text-secondary font-medium">{salesDataObj.expenses.label}</span>
                  </div>
                  <span className="text-gray-900 font-bold group-hover:scale-105 transition-transform">
                     {salesDataObj.expenses.value}
                  </span>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Task List - Centered Empty State or Content */}
          <DashboardCard className="md:col-span-2 lg:col-span-2 min-h-[300px] flex flex-col" delay={0.4}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-accent-blue" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Tasks & To-Dos</h3>
              </div>
              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-gray-100 text-xs font-bold text-gray-600 rounded-full">
                   {pendingTasksCount === 0 ? "All Clear" : `${pendingTasksCount} Pending`}
                 </span>
              </div>
            </div>
            
            {tasks.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-accent-green" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                   {loading ? "Loading Tasks..." : "No Tasks Found"}
                </h4>
                <p className="text-text-secondary max-w-xs mx-auto mb-6">
                  {isConnected ? "You have no pending tasks." : "Connect to backend to see tasks."}
                </p>
              </div>
            ) : (
                <div className="space-y-3">
                    {tasks.slice(0, 5).map(task => (
                        <div key={task.id} className="p-3 border rounded-xl flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-gray-800">{task.title}</h4>
                                <p className="text-sm text-gray-500">{task.priority} • {task.status}</p>
                            </div>
                            <div className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded">
                                {task.dueDate || "No Date"}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </DashboardCard>

          {/* Last Client / Follow-up Placeholder */}
          <DashboardCard delay={0.5}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Latest Client</h3>
              <Clock className="w-5 h-5 text-text-secondary" />
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100/50 shadow-sm">
                {nextClient ? (
                    <div className="relative z-10">
                        <h4 className="font-bold text-xl text-gray-900 mb-1">{nextClient.name}</h4>
                        <p className="text-sm text-text-secondary font-medium mb-4">{nextClient.phone}</p>
                        <p className="text-xs text-gray-500">{nextClient.notes}</p>
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500">No clients found</div>
                )}
            </div>
          </DashboardCard>

          <DashboardCard className="bg-gradient-to-br from-sky-500 to-indigo-700 border-none text-white relative overflow-hidden shadow-elevated" delay={0.6}>
            <motion.div className="absolute inset-0 pointer-events-none" aria-hidden>
              <motion.div
                className="absolute top-10 left-[-100px] opacity-20"
                animate={{ x: [0, 260] }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              >
                <Cloud className="w-16 h-16 text-white" />
              </motion.div>
              <motion.div
                className="absolute bottom-8 left-[-80px] opacity-15"
                animate={{ x: [0, 200] }}
                transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
              >
                <Cloud className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-2 bg-white/15 rounded-xl backdrop-blur-md border border-white/10">
                    <Sun className="w-5 h-5 text-yellow-300" />
                 </div>
                 <h3 className="font-bold text-white text-lg tracking-wide">Weather</h3>
              </div>
              
              <div className="mt-auto flex items-end justify-between">
                <div>
                  <div className="text-6xl font-bold text-white mb-2 tracking-tighter">72°</div>
                  <div className="text-lg font-medium text-blue-100">San Francisco</div>
                  <div className="text-sm text-blue-200 font-medium mt-1">Clear Sky</div>
                </div>
                
                <motion.div
                  animate={{ 
                    rotate: 360, 
                    scale: [1, 1.1, 1] 
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="mb-2"
                >
                   <Sun className="w-20 h-20 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
                </motion.div>
              </div>
            </div>
          </DashboardCard>

          {/* Daily Briefing */}
          <DashboardCard delay={0.7} className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-100 rounded-xl">
                  <FileText className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Briefing</h3>
              </div>
            </div>

            <div className="space-y-1">
              {briefingData.map((news, index) => (
                <div 
                  key={index} 
                  className="group p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-100"
                >
                  <h4 className="font-semibold text-gray-900 mb-1.5 leading-snug group-hover:text-accent-blue transition-colors">
                    {news.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                    <span className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">{news.source}</span>
                    <span>•</span>
                    <span>{news.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </main>
    </div>
  );
}

export default App;
