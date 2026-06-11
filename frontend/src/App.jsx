import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  PlusCircle, Trash2, Wallet, ArrowUpCircle, ArrowDownCircle, 
  PieChart as PieIcon, LayoutDashboard, Target
} from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    categorySummaries: {}
  });
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: 'Food',
    type: 'EXPENSE',
    date: new Date().toISOString().split('T')[0]
  });
  const [newBudget, setNewBudget] = useState({
    category: 'Food',
    limitAmount: ''
  });
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchData();
  }, [monthYear]);

  const fetchData = async () => {
    try {
      const transRes = await axios.get(`${API_BASE}/transactions`);
      setTransactions(transRes.data);
      
      const summaryRes = await axios.get(`${API_BASE}/dashboard/summary?monthYear=${monthYear}`);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/transactions`, newTransaction);
      setNewTransaction({ ...newTransaction, description: '', amount: '' });
      fetchData();
    } catch (err) {
      console.error("Error adding transaction", err);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_BASE}/transactions/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting transaction", err);
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/budgets`, {
        ...newBudget,
        monthYear
      });
      setNewBudget({ ...newBudget, limitAmount: '' });
      fetchData();
    } catch (err) {
      console.error("Error setting budget", err);
    }
  };

  const pieData = Object.entries(summary.categorySummaries).map(([name, data]) => ({
    name,
    value: data.spent
  })).filter(d => d.value > 0);

  const budgetData = Object.entries(summary.categorySummaries).map(([name, data]) => ({
    name,
    spent: data.spent,
    budget: data.budget
  })).filter(d => d.budget > 0);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="text-blue-500" /> Personal Expense Tracker
          </h1>
          <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
            <input 
              type="month" 
              value={monthYear} 
              onChange={(e) => setMonthYear(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-white"
            />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Income</span>
              <ArrowUpCircle className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-400">${summary.totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Expenses</span>
              <ArrowDownCircle className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-400">${summary.totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg shadow-blue-900/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Net Balance</span>
              <LayoutDashboard className="text-blue-500" />
            </div>
            <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              ${summary.balance.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Charts Section */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <PieIcon className="text-purple-500" /> Expense Breakdown
            </h2>
            <div className="h-[300px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Target className="text-yellow-500" /> Budget vs Actual
            </h2>
            <div className="h-[300px]">
              {budgetData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="spent" fill="#ef4444" name="Spent" />
                    <Bar dataKey="budget" fill="#10b981" name="Budget" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No budgets set</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Transaction Form */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PlusCircle className="text-green-500" /> Add Transaction
            </h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input 
                  required
                  type="text" 
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="w-full bg-gray-700 border-gray-600 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Rent, Groceries, Salary..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Amount</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="w-full bg-gray-700 border-gray-600 rounded-lg p-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select 
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                    className="w-full bg-gray-700 border-gray-600 rounded-lg p-2"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select 
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="w-full bg-gray-700 border-gray-600 rounded-lg p-2"
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Entertainment</option>
                  <option>Utilities</option>
                  <option>Salary</option>
                  <option>Rent</option>
                  <option>Other</option>
                </select>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Add Transaction
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="text-yellow-500" /> Set Monthly Budget
              </h2>
              <form onSubmit={handleSetBudget} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select 
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                    className="w-full bg-gray-700 border-gray-600 rounded-lg p-2"
                  >
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Entertainment</option>
                    <option>Utilities</option>
                    <option>Rent</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Monthly Limit</label>
                  <input 
                    required
                    type="number" 
                    value={newBudget.limitAmount}
                    onChange={(e) => setNewBudget({...newBudget, limitAmount: e.target.value})}
                    className="w-full bg-gray-700 border-gray-600 rounded-lg p-2"
                    placeholder="500.00"
                  />
                </div>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  Update Budget
                </button>
              </form>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Recent Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2">Description</th>
                    <th className="pb-3 px-2">Category</th>
                    <th className="pb-3 px-2 text-right">Amount</th>
                    <th className="pb-3 px-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {transactions.slice().reverse().map((t) => (
                    <tr key={t.id} className="hover:bg-gray-750 transition-colors">
                      <td className="py-4 px-2 text-sm text-gray-400">{t.date}</td>
                      <td className="py-4 px-2 font-medium">{t.description}</td>
                      <td className="py-4 px-2">
                        <span className="bg-gray-700 text-xs px-2 py-1 rounded text-gray-300">
                          {t.category}
                        </span>
                      </td>
                      <td className={`py-4 px-2 text-right font-bold ${t.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}${t.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button 
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">No transactions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
