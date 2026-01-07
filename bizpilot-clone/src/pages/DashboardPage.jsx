import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { FiPlus, FiExternalLink, FiDownload, FiSave, FiWifi, FiRefreshCw, FiTrash2, FiEdit2, FiCheckCircle, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    checkHealth, 
    fetchTasks, fetchClients, fetchTransactions, 
    addTask, addClient, addTransaction,
    updateTask, updateClient, updateTransaction,
    deleteTask, deleteClient, deleteTransaction
} from '../services/api';

// --- ANIMATIONS ---
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

// --- HELPER COMPONENTS ---
const StatCard = ({ title, value, subtext }) => (
    <motion.div 
        variants={fadeInUp}
        className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
    >
        <h3 className="text-sm font-medium text-muted mb-2">{title}</h3>
        <p className="text-3xl font-bold text-dark mb-1">{value}</p>
        <p className="text-xs text-muted">{subtext}</p>
    </motion.div>
);

const Badge = ({ children, type }) => {
    const colors = {
        high: "bg-red-100 text-red-700",
        normal: "bg-blue-100 text-blue-700",
        low: "bg-gray-100 text-gray-700",
        completed: "bg-green-100 text-green-700",
        pending: "bg-yellow-100 text-yellow-700",
        income: "bg-emerald-100 text-emerald-700",
        expense: "bg-rose-100 text-rose-700"
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[type.toLowerCase()] || colors.normal}`}>
            {children}
        </span>
    );
}

const SectionTitle = ({ title, subtitle }) => (
    <div className="mb-6">
        <h2 className="text-xl font-bold text-dark">{title}</h2>
        <p className="text-sm text-muted">{subtitle}</p>
    </div>
);

// --- MAIN PAGE COMPONENT ---
const DashboardPage = () => {
    // Data State
    const [tasks, setTasks] = useState([]);
    const [clients, setClients] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form States
    const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'Normal' });
    const [taskEditId, setTaskEditId] = useState(null);

    const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '', address: '' });
    const [clientEditId, setClientEditId] = useState(null);

    const [newTransaction, setNewTransaction] = useState({ type: 'sale', amount: '', date: '', note: '' });
    const [transactionEditId, setTransactionEditId] = useState(null);

    // Fetch Data
    const refreshData = async () => {
        setLoading(true);
        const health = await checkHealth();
        setIsConnected(health);
        if (health) {
            try {
                const [tasksData, clientsData, transactionsData] = await Promise.all([
                    fetchTasks(),
                    fetchClients(),
                    fetchTransactions()
                ]);
                setTasks(tasksData || []);
                setClients(clientsData || []);
                setTransactions(transactionsData || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(async () => {
            const health = await checkHealth();
            setIsConnected(health);
        }, 30000); // Check health every 30s
        return () => clearInterval(interval);
    }, []);

    // --- HANDLERS: TASKS ---
    const handleSaveTask = async (e) => {
        e.preventDefault();
        try {
            if (taskEditId) {
                await updateTask(taskEditId, newTask);
            } else {
                await addTask(newTask);
            }
            setNewTask({ title: '', description: '', dueDate: '', priority: 'Normal' });
            setTaskEditId(null);
            refreshData();
        } catch (err) { console.error("Error saving task", err); }
    };

    const handleDeleteTask = async (id) => {
        if(!window.confirm("Delete this task?")) return;
        try {
            await deleteTask(id);
            refreshData();
        } catch (err) { console.error("Error deleting task", err); }
    };

    const handleEditTask = (task) => {
        setNewTask({ 
            title: task.title, 
            description: task.description || '', 
            dueDate: task.dueDate || '', 
            priority: task.priority || 'Normal' 
        });
        setTaskEditId(task.id);
        document.getElementById('dash-tasks').scrollIntoView({ behavior: 'smooth' });
    };

    const handleCompleteTask = async (task) => {
        try {
            await updateTask(task.id, { ...task, status: 'completed' });
            refreshData();
        } catch (err) { console.error("Error completing task", err); }
    };

    // --- HANDLERS: CLIENTS ---
    const handleSaveClient = async (e) => {
        e.preventDefault();
        try {
            if (clientEditId) {
                await updateClient(clientEditId, newClient);
            } else {
                await addClient(newClient);
            }
            setNewClient({ name: '', company: '', email: '', phone: '', address: '' });
            setClientEditId(null);
            refreshData();
        } catch (err) { console.error("Error saving client", err); }
    };

    const handleDeleteClient = async (id) => {
        if(!window.confirm("Delete this client?")) return;
        try {
            await deleteClient(id);
            refreshData();
        } catch (err) { console.error("Error deleting client", err); }
    };

    const handleEditClient = (client) => {
        setNewClient({
            name: client.name,
            company: client.company || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || ''
        });
        setClientEditId(client.id);
        document.getElementById('dash-clients').scrollIntoView({ behavior: 'smooth' });
    };

    // --- HANDLERS: TRANSACTIONS ---
    const handleSaveTransaction = async (e) => {
        e.preventDefault();
        try {
            if (transactionEditId) {
                await updateTransaction(transactionEditId, newTransaction);
            } else {
                await addTransaction(newTransaction);
            }
            setNewTransaction({ type: 'sale', amount: '', date: '', note: '' });
            setTransactionEditId(null);
            refreshData();
        } catch (err) { console.error("Error saving transaction", err); }
    };

    const handleDeleteTransaction = async (id) => {
        if(!window.confirm("Delete this transaction?")) return;
        try {
            await deleteTransaction(id);
            refreshData();
        } catch (err) { console.error("Error deleting transaction", err); }
    };

    const handleEditTransaction = (t) => {
        setNewTransaction({
            type: t.type,
            amount: t.amount,
            date: t.date || '',
            note: t.note || ''
        });
        setTransactionEditId(t.id);
        document.getElementById('dash-transactions').scrollIntoView({ behavior: 'smooth' });
    };

    // --- DERIVED STATE ---
    const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
    const sales = transactions.filter(t => t.type === 'sale').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const netProfit = sales - expenses;
    const profitMargin = sales > 0 ? ((netProfit / sales) * 100).toFixed(1) : 0;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Header />
      
      {/* Backend Status */}
      <div className={`w-full py-1 text-center text-xs font-semibold ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} transition-colors duration-300`}>
          {isConnected ? "System Online: Connected to Backend" : "System Offline: Using limited functionality"}
      </div>

      <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Welcome Section */}
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-end bg-white p-8 rounded-2xl border border-gray-100"
        >
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to BizPilot</h1>
            <p className="text-muted">A simple hub to manage your tasks, clients, finances, and reports in one place.</p>
          </div>
          <div className="flex gap-3">
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={refreshData}
               className="flex items-center gap-2 bg-teal-50 text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-100 transition shadow-sm"
             >
               <FiRefreshCw/> Refresh Data
             </motion.button>
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => document.getElementById('dash-tasks').scrollIntoView({behavior: 'smooth'})}
               className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition shadow-md hover:shadow-lg"
             >
               <FiPlus/> New Task
             </motion.button>
          </div>
        </motion.section>

        {/* Stats Banner */}
        <motion.section 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
            <StatCard title="Pending Tasks" value={pendingTasksCount} subtext="Keep an eye on your deadlines." />
            <StatCard title="Active Clients" value={clients.length} subtext="Relationships that drive revenue." />
            <StatCard title="Total Sales" value={`$${sales.toLocaleString()}`} subtext="Total income recorded." />
            <StatCard title="Net Profit Margin" value={`${profitMargin}%`} subtext="After expenses." />
        </motion.section>

        {/* ---- TASKS SECTION ---- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          id="dash-tasks" 
          className="scroll-mt-24"
        >
             <SectionTitle title="Tasks" subtitle="Add new tasks and review active items to be done." />
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Task Form */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 h-fit">
                    <h3 className="font-semibold mb-4">{taskEditId ? "Edit Task" : "Add New Task"}</h3>
                    <form className="space-y-4" onSubmit={handleSaveTask}>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Task Title <span className="text-red-500">*</span></label>
                            <input 
                                type="text" required
                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary" 
                                placeholder="e.g., Prepare monthly report" 
                                value={newTask.title}
                                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-muted mb-1">Description</label>
                            <textarea 
                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary h-24 resize-none" 
                                placeholder="Add details..."
                                value={newTask.description}
                                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                            ></textarea>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted mb-1">Due Date</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary" 
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-muted mb-1">Priority</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary bg-white"
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                                >
                                    <option>High</option>
                                    <option>Normal</option>
                                    <option>Low</option>
                                </select>
                            </div>
                         </div>
                         <div className="flex justify-end gap-3 pt-2">
                             {taskEditId && <button type="button" className="text-muted text-sm hover:text-dark transition" onClick={() => { setTaskEditId(null); setNewTask({ title: '', description: '', dueDate: '', priority: 'Normal' }); }}>Cancel Edit</button>}
                             <button type="button" className="text-muted text-sm hover:text-dark transition" onClick={() => setNewTask({ title: '', description: '', dueDate: '', priority: 'Normal' })}>Clear</button>
                             <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition flex items-center gap-2">
                                 <FiSave size={14}/> {taskEditId ? "Update Task" : "Save Task"}
                             </button>
                         </div>
                    </form>
                </div>

                 {/* View Tasks Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100">
                     <h3 className="font-semibold mb-4">View Tasks</h3>
                     <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-muted">
                             <thead className="text-xs uppercase bg-gray-50 border-b border-gray-100">
                                 <tr>
                                     <th className="px-4 py-3 font-medium">Task</th>
                                     <th className="px-4 py-3 font-medium">Due Date</th>
                                     <th className="px-4 py-3 font-medium">Priority</th>
                                     <th className="px-4 py-3 font-medium text-right">Status</th>
                                     <th className="px-4 py-3 font-medium text-right">Actions</th>
                                 </tr>
                             </thead>
                             <tbody>
                                {loading && <tr><td colSpan="5" className="text-center py-4">Loading tasks...</td></tr>}
                                {!loading && tasks.length === 0 && <tr><td colSpan="5" className="text-center py-4">No tasks found. Add a new task to get started.</td></tr>}
                                {tasks.map((task, i) => (
                                    <motion.tr key={task.id || i} whileHover={{ backgroundColor: "#f9fafb", x: 4 }} className="bg-white border-b border-gray-50 transition cursor-default">
                                        <td className="px-4 py-4 font-medium text-dark">
                                            <div className={task.status === 'completed' ? 'line-through opacity-50' : ''}>{task.title}</div>
                                            {task.description && <div className="text-xs text-muted font-normal mt-0.5 max-w-xs truncate">{task.description}</div>}
                                        </td>
                                        <td className="px-4 py-4">{task.dueDate || "No Date"}</td>
                                        <td className="px-4 py-4"><Badge type={task.priority || 'normal'}>{task.priority || 'Normal'}</Badge></td>
                                        <td className="px-4 py-4 text-right"><Badge type={task.status || 'pending'}>{task.status || 'Pending'}</Badge></td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {task.status !== 'completed' && (
                                                    <button onClick={() => handleCompleteTask(task)} title="Mark Complete" className="text-green-500 hover:bg-green-50 p-1.5 rounded-md transition"><FiCheckCircle/></button>
                                                )}
                                                <button onClick={() => handleEditTask(task)} title="Edit" className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md transition"><FiEdit2/></button>
                                                <button onClick={() => handleDeleteTask(task.id)} title="Delete" className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition"><FiTrash2/></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                         </table>
                     </div>
                </div>
             </div>
        </motion.section>

        {/* ---- CLIENTS SECTION ---- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          id="dash-clients" 
          className="scroll-mt-24"
        >
             <SectionTitle title="Clients" subtitle="Add new clients and manage key relationships." />
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Client Form */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 h-fit">
                    <h3 className="font-semibold mb-4">{clientEditId ? "Edit Client" : "Add New Client"}</h3>
                    <form className="space-y-4" onSubmit={handleSaveClient}>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Client Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text" required
                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary" 
                                placeholder="Jane Smith"
                                value={newClient.name}
                                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-medium text-muted mb-1">Company</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary" 
                                    value={newClient.company}
                                    onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-muted mb-1">Email</label>
                                <input 
                                    type="email" 
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary" 
                                    value={newClient.email}
                                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-medium text-muted mb-1">Phone</label>
                                <input 
                                    type="tel" 
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary" 
                                    value={newClient.phone}
                                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-muted mb-1">Address</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary" 
                                    value={newClient.address}
                                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                                />
                            </div>
                        </div>
                        
                         <div className="flex justify-end gap-3 pt-2">
                             {clientEditId && <button type="button" className="text-muted text-sm hover:text-dark transition" onClick={() => { setClientEditId(null); setNewClient({ name: '', company: '', email: '', phone: '', address: '' }); }}>Cancel Edit</button>}
                             <button type="button" className="text-muted text-sm hover:text-dark transition" onClick={() => setNewClient({ name: '', company: '', email: '', phone: '', address: '' })}>Clear</button>
                             <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition">{clientEditId ? "Update Client" : "Save Client"}</button>
                         </div>
                    </form>
                </div>

                 {/* Client Directory Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100">
                     <h3 className="font-semibold mb-4">Client Directory</h3>
                     <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-muted">
                             <thead className="text-xs uppercase bg-gray-50 border-b border-gray-100">
                                 <tr>
                                     <th className="px-4 py-3 font-medium">Client Name</th>
                                     <th className="px-4 py-3 font-medium">Company</th>
                                     <th className="px-4 py-3 font-medium">Email</th>
                                     <th className="px-4 py-3 font-medium text-right">Phone</th>
                                     <th className="px-4 py-3 font-medium text-right">Actions</th>
                                 </tr>
                             </thead>
                             <tbody>
                                {clients.length === 0 && !loading && <tr><td colSpan="5" className="text-center py-4">No clients yet.</td></tr>}
                                {clients.map((client, i) => (
                                    <motion.tr key={client.id || i} whileHover={{ backgroundColor: "#f9fafb", x: 4 }} className="bg-white border-b border-gray-50 transition cursor-default">
                                        <td className="px-4 py-4 font-medium text-dark">{client.name}</td>
                                        <td className="px-4 py-4">{client.company || '-'}</td>
                                        <td className="px-4 py-4">{client.email || '-'}</td>
                                        <td className="px-4 py-4 text-right">{client.phone}</td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditClient(client)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md transition"><FiEdit2/></button>
                                                <button onClick={() => handleDeleteClient(client.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition"><FiTrash2/></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                         </table>
                     </div>
                </div>
             </div>
        </motion.section>

         {/* ---- TRANSACTIONS SECTION ---- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          id="dash-transactions" 
          className="scroll-mt-24"
        >
             <SectionTitle title="Transactions" subtitle="Add new transactions and review recent activity." />
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transaction Form */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 h-fit">
                    <h3 className="font-semibold mb-4">{transactionEditId ? "Edit Transaction" : "Add Transaction"}</h3>
                    <form className="space-y-4" onSubmit={handleSaveTransaction}>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted mb-1">Type</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary bg-white"
                                    value={newTransaction.type}
                                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                                >
                                    <option value="sale">Sale</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-muted mb-1">Amount <span className="text-red-500">*</span></label>
                                <input 
                                    type="number" required
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary" 
                                    placeholder="0.00" 
                                    value={newTransaction.amount}
                                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                                />
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-medium text-muted mb-1">Date</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary" 
                                    value={newTransaction.date}
                                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-muted mb-1">Note / Description</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary" 
                                    placeholder="e.g., Client Payment" 
                                    value={newTransaction.note}
                                    onChange={(e) => setNewTransaction({...newTransaction, note: e.target.value})}
                                />
                            </div>
                        </div>
                        
                         <div className="flex justify-end gap-3 pt-2">
                             {transactionEditId && <button type="button" className="text-muted text-sm hover:text-dark transition" onClick={() => { setTransactionEditId(null); setNewTransaction({ type: 'sale', amount: '', date: '', note: '' }); }}>Cancel</button>}
                             <button type="button" className="text-muted text-sm hover:text-dark transition" onClick={() => setNewTransaction({ type: 'sale', amount: '', date: '', note: '' })}>Reset</button>
                             <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition">{transactionEditId ? "Update Transaction" : "Save Transaction"}</button>
                         </div>
                    </form>
                </div>

                 {/* Recent Transactions Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100">
                     <h3 className="font-semibold mb-4">Recent Transactions</h3>
                     <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-muted">
                             <thead className="text-xs uppercase bg-gray-50 border-b border-gray-100">
                                 <tr>
                                     <th className="px-4 py-3 font-medium">Type</th>
                                     <th className="px-4 py-3 font-medium">Note</th>
                                     <th className="px-4 py-3 font-medium">Amount</th>
                                     <th className="px-4 py-3 font-medium text-right">Date</th>
                                     <th className="px-4 py-3 font-medium text-right">Actions</th>
                                 </tr>
                             </thead>
                             <tbody>
                                {transactions.length === 0 && !loading && <tr><td colSpan="5" className="text-center py-4">No transactions recorded.</td></tr>}
                                {transactions.map((t, i) => (
                                    <motion.tr key={t.id || i} whileHover={{ backgroundColor: "#f9fafb", x: 4 }} className="bg-white border-b border-gray-50 transition cursor-default">
                                        <td className="px-4 py-4"><Badge type={t.type === 'sale' ? 'income' : 'expense'}>{t.type === 'sale' ? 'Income' : 'Expense'}</Badge></td>
                                        <td className="px-4 py-4 font-medium text-dark">{t.note || "No description"}</td>
                                        <td className={`px-4 py-4 font-medium ${t.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'sale' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-4 text-right">{t.date ? new Date(t.date).toLocaleDateString() : "-"}</td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditTransaction(t)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md transition"><FiEdit2/></button>
                                                <button onClick={() => handleDeleteTransaction(t.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition"><FiTrash2/></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                         </table>
                     </div>
                </div>
             </div>
        </motion.section>

        {/* ---- REPORTS SECTION ---- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          id="dash-reports" 
          className="scroll-mt-24"
        >
             <div className="flex justify-between items-start mb-6">
                <SectionTitle title="Reports" subtitle="High-level overview and detailed financial breakdown." />
                <button className="flex items-center gap-2 bg-white border border-gray-200 text-muted px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition"><FiDownload size={14}/> Export PDF</button>
            </div>
            
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <h3 className="text-sm text-muted mb-2">Total Sales</h3>
                    <p className="text-3xl font-bold text-dark mb-1">${sales.toLocaleString()}</p>
                    <p className="text-xs text-muted">Includes all income transactions.</p>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <h3 className="text-sm text-muted mb-2">Total Expenses</h3>
                    <p className="text-3xl font-bold text-dark mb-1">${expenses.toLocaleString()}</p>
                    <p className="text-xs text-muted">Operational and recurring costs.</p>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <h3 className="text-sm text-muted mb-2">Net Profit</h3>
                    <p className={`text-3xl font-bold mb-1 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${netProfit.toLocaleString()}</p>
                    <p className="text-xs text-muted">After deducting expenses.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Summary Table */}
                <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <h3 className="font-semibold mb-4">Summary</h3>
                     <table className="w-full text-sm text-left text-muted">
                         <tbody>
                             <tr className="border-b border-gray-50"><td className="py-3">Total Sales</td><td className="py-3 text-right font-medium text-dark">${sales.toLocaleString()}</td></tr>
                             <tr className="border-b border-gray-50"><td className="py-3">Total Expenses</td><td className="py-3 text-right font-medium text-dark">${expenses.toLocaleString()}</td></tr>
                             <tr className="border-b border-gray-50"><td className="py-3">Net Profit</td><td className="py-3 text-right font-bold text-primary">${netProfit.toLocaleString()}</td></tr>
                             <tr><td className="py-3">Profit Margin</td><td className="py-3 text-right font-medium text-dark">{profitMargin}%</td></tr>
                         </tbody>
                     </table>
                </div>
            </div>
       </motion.section>

        {/* ---- SETTINGS SECTION ---- */}
       <motion.section 
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: "-100px" }}
         variants={fadeInUp}
         id="dash-settings" 
         className="scroll-mt-24"
       >
             <SectionTitle title="Settings" subtitle="Configure how BizPilot works for your business." />
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Workspace Preferences */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold mb-6">Workspace Preferences</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-muted mb-1">Default Currency</label>
                                <select className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-primary bg-white">
                                    <option>USD ($)</option>
                                    <option>EUR (€)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
       </motion.section>

        {/* ---- ABOUT SECTION ---- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          id="dash-about" 
          className="scroll-mt-24 bg-white p-8 rounded-2xl border border-gray-100"
        >
             <SectionTitle title="About BizPilot" subtitle="The cockpit for your small business finances and operations." />
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-sm text-muted leading-relaxed">
                 <div>
                     <h3 className="font-semibold text-dark mb-3">Our Mission</h3>
                     <p className="mb-4">BizPilot is designed for founders, freelancers, and finance teams.</p>
                 </div>
             </div>
        </motion.section>

      </main>
       <div className="bg-white border-t border-gray-200 py-6 text-center text-xs text-muted">
        © 2025 BizPilot Inc. All rights reserved.
      </div>
    </div>
  );
};

export default DashboardPage;