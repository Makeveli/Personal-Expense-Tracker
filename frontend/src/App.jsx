import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import { useIdleTimeout } from './hooks/useIdleTimeout';
import { 
  Plus, Trash2, Wallet, ArrowUpCircle, ArrowDownCircle, 
  PieChart as PieChartIcon, BarChart3, LogOut 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const FinanceApp = () => {
  const { user, token, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([{ name: 'INCOME' }, { name: 'EXPENSE' }]); // Fallback defaults
  const [categories, setCategories] = useState([{ name: 'Food' }, { name: 'Rent' }, { name: 'Salary' }]); // Fallback

  const handleTimeout = () => {
    logout();
  };

  const { showWarning, extendSession } = useIdleTimeout(15, 1, handleTimeout); // 15 mins timeout, 1 min warning

  const handleExtendSession = async () => {
    try {
      await axios.post('http://localhost:8080/api/auth/extend-session', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      extendSession();
    } catch (err) {
      logout();
    }
  };
  
  // State for new transaction
  const [newTx, setNewTx] = useState({
    description: '',
    amount: '',
    category: 'Food',
    type: 'EXPENSE'
  });

  // State for new budget
  const [newBudget, setNewBudget] = useState({
    category: 'Food',
    limitAmount: ''
  });

  const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM

  const fetchData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [txRes, sumRes, budgetRes, typesRes, catRes] = await Promise.all([
        axios.get('http://localhost:8080/api/transactions', { headers }),
        axios.get(`http://localhost:8080/api/dashboard/summary?monthYear=${monthYear}`, { headers }),
        axios.get(`http://localhost:8080/api/budgets?monthYear=${monthYear}`, { headers }),
        axios.get('http://localhost:8080/api/transaction-types', { headers }).catch(() => ({ data: [{ name: 'INCOME' }, { name: 'EXPENSE' }] })),
        axios.get('http://localhost:8080/api/categories', { headers }).catch(() => ({ data: [{ name: 'Food' }, { name: 'Rent' }, { name: 'Salary' }] }))
      ]);
      setTransactions(txRes.data);
      setSummary(sumRes.data);
      setBudgets(budgetRes.data);
      if (typesRes.data && typesRes.data.length > 0) {
          setTransactionTypes(typesRes.data);
      }
      if (catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data);
          setNewTx(prev => ({ ...prev, category: catRes.data[0].name }));
          setNewBudget(prev => ({ ...prev, category: catRes.data[0].name }));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/transactions', 
        { ...newTx, amount: parseFloat(newTx.amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTx({ description: '', amount: '', category: 'Food', type: 'EXPENSE' });
      fetchData();
    } catch (err) {
      alert("Error adding transaction");
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/budgets', 
        { ...newBudget, limitAmount: parseFloat(newBudget.limitAmount), monthYear },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewBudget({ category: 'Food', limitAmount: '' });
      fetchData();
    } catch (err) {
      alert("Error setting budget");
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Error deleting transaction");
    }
  };

  if (!user) return <LoginForm />;

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Expiring Soon</h2>
            <p className="text-gray-600 mb-8">
              Your session has been inactive and will expire in 1 minute. Would you like to continue?
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={logout}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Log Out
              </button>
              <button 
                onClick={handleExtendSession}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue Session
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="text-blue-600 w-8 h-8" />
            <h1 className="text-xl font-bold text-gray-900">ExpenseTracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium">Hi, {user.username}</span>
            <button 
              onClick={logout}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full"><ArrowUpCircle className="text-green-600" /></div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">${summary?.totalIncome?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full"><ArrowDownCircle className="text-red-600" /></div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">${summary?.totalExpenses?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full"><Wallet className="text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">Net Balance</p>
              <p className="text-2xl font-bold text-gray-900">${summary?.balance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Charts Section */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="text-blue-600" size={20} />
                <h3 className="font-bold text-gray-800">Expenses by Category</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary?.categorySummaries ? Object.entries(summary.categorySummaries).map(([name, catSum]) => ({ name, value: catSum.spent })) : []}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.entries(summary?.categorySummaries || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="text-blue-600" size={20} />
                <h3 className="font-bold text-gray-800">Budget vs Actual</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgets.map(b => ({
                    category: b.category?.name || 'Unknown',
                    Limit: b.limitAmount,
                    Actual: summary?.categorySummaries?.[b.category?.name]?.spent || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Limit" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Actual" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Forms Section */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Plus size={20} className="text-blue-600" /> Add Transaction
              </h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Description"
                    className="col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newTx.description}
                    onChange={e => setNewTx({...newTx, description: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newTx.amount}
                    onChange={e => setNewTx({...newTx, amount: e.target.value})}
                    required
                  />
                  <select 
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newTx.category}
                    onChange={e => setNewTx({...newTx, category: e.target.value})}
                  >
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <div className="col-span-2 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setNewTx({...newTx, type: 'INCOME'})}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${newTx.type === 'INCOME' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Income
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewTx({...newTx, type: 'EXPENSE'})}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${newTx.type === 'EXPENSE' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Expense
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                  Save Transaction
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" /> Set Monthly Budget
              </h3>
              <form onSubmit={handleSetBudget} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newBudget.category}
                    onChange={e => setNewBudget({...newBudget, category: e.target.value})}
                  >
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Monthly Limit"
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newBudget.limitAmount}
                    onChange={e => setNewBudget({...newBudget, limitAmount: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded-lg font-bold hover:bg-gray-900 transition-colors">
                  Update Budget
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Recent Transactions</h3>
            <span className="text-sm text-gray-500">{transactions.length} entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs uppercase font-bold border-b">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.slice().reverse().map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50 group transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{tx.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-semibold uppercase">{tx.category?.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{tx.type?.name}</td>
                    <td className={`px-6 py-4 text-right font-bold ${tx.type?.name === 'INCOME' ? 'text-green-600' : tx.type?.name === 'EXPENSE' ? 'text-red-600' : 'text-gray-900'}`}>
                      {tx.type?.name === 'INCOME' ? '+' : tx.type?.name === 'EXPENSE' ? '-' : ''}${tx.amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteTransaction(tx.id)} className="text-gray-300 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <FinanceApp />
  </AuthProvider>
);

export default App;
