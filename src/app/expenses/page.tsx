"use client";

import { useState, useEffect } from "react";
import { 
  Receipt, Plus, Mail, RefreshCw, Trash2, Calendar, 
  DollarSign, Briefcase, Landmark, CheckCircle, AlertTriangle, 
  ArrowUpRight, Sparkles, Loader2, FileText, Flame
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";

interface Expense {
  id: string;
  amount: number;
  currency: string;
  merchant: string;
  category: string;
  date: string;
  rawEmailSubject?: string;
  rawEmailBody?: string;
  createdAt: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [roastMessage, setRoastMessage] = useState("");
  const [isGeneratingRoast, setIsGeneratingRoast] = useState(false);
  
  // Simulated email input
  const [simSubject, setSimSubject] = useState("");
  const [simBody, setSimBody] = useState("");

  // Manual input form
  const [manualForm, setManualForm] = useState({
    amount: "",
    merchant: "",
    category: "Software/Hosting",
    date: new Date().toISOString().split("T")[0],
    currency: "USD"
  });

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Fetch Roast Warning
  useEffect(() => {
    if (filteredExpenses.length === 0) {
      setRoastMessage("");
      return;
    }

    const timer = setTimeout(async () => {
      setIsGeneratingRoast(true);
      try {
        const res = await fetch("/api/expenses/roast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryTotals })
        });
        if (res.ok) {
          const data = await res.json();
          setRoastMessage(data.roast || "");
        }
      } catch (err) {
        console.error("Failed to fetch spending roast:", err);
      } finally {
        setIsGeneratingRoast(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [selectedMonth, selectedYear, expenses.length]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Simulate Email Parsing
  const handleSimulateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simBody.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/expenses/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: simSubject, body: simBody })
      });
      const data = await res.json();
      
      if (res.ok && data.isExpense) {
        showNotification("success", `AI Agent extracted expense: ₹${data.expense.amount} from ${data.expense.merchant}!`);
        fetchExpenses();
        // Reset form
        setSimSubject("");
        setSimBody("");
      } else {
        showNotification("error", data.message || "Email analyzed but no transaction details could be extracted.");
      }
    } catch (err) {
      showNotification("error", "Failed to connect to email analyzer.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Poll real Gmail inbox
  const handlePollInbox = async () => {
    setIsPolling(true);
    try {
      const res = await fetch("/api/expenses/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("success", data.message || "Inbox successfully polled!");
        fetchExpenses();
      } else {
        showNotification("error", data.error || "Failed to poll inbox. Make sure you are logged in via Google.");
      }
    } catch (err) {
      showNotification("error", "Connection error trying to poll Gmail inbox.");
    } finally {
      setIsPolling(false);
    }
  };

  // Create manual expense
  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const { amount, merchant, category, date, currency } = manualForm;
    if (!amount || !merchant || !date) return;

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualForm)
      });
      if (res.ok) {
        showNotification("success", "Expense successfully added.");
        fetchExpenses();
        setManualForm({
          amount: "",
          merchant: "",
          category: "Software/Hosting",
          date: new Date().toISOString().split("T")[0],
          currency: "USD"
        });
      } else {
        showNotification("error", "Failed to create manual expense.");
      }
    } catch (err) {
      showNotification("error", "Failed to connect to expenses database.");
    }
  };

  // Delete expense
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("success", "Expense deleted.");
        fetchExpenses();
      }
    } catch (err) {
      showNotification("error", "Failed to delete expense.");
    }
  };

  // Filter expenses by selected month and year
  const filteredExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
  });

  // Calculations for charts/stats
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const totalDebits = filteredExpenses
    .filter(e => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCredits = Math.abs(
    filteredExpenses
      .filter(e => e.amount < 0)
      .reduce((sum, e) => sum + e.amount, 0)
  );

  const netBalance = totalCredits - totalDebits;

  const categories = Array.from(new Set(filteredExpenses.map(e => e.category)));
  const categoryTotals = categories.map(cat => {
    const total = filteredExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    return { name: cat, total };
  }).sort((a, b) => b.total - a.total);

  // Pivot table calculations
  const getMonthKey = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const uniqueMonths = Array.from(
    new Set(filteredExpenses.map(e => getMonthKey(new Date(e.date))))
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const getPivotValue = (category: string, month: string) => {
    return filteredExpenses
      .filter(e => e.category === category && getMonthKey(new Date(e.date)) === month)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  // Category Color Map
  const categoryColors: Record<string, string> = {
    "Software/Hosting": "bg-[#00E5FF]",
    "Travel/Transport": "bg-[#FF3366]",
    "Meals/Entertainment": "bg-[#FFD500]",
    "Office Supplies": "bg-[#B200FF]",
    "Marketing/Ads": "bg-[#00FF66]",
    "Utilities/Rent": "bg-[#FF9900]",
    "Services/Fees": "bg-[#FF4D4D]",
    "Income/Credits": "bg-[#10B981]",
    "Miscellaneous": "bg-slate-400"
  };

  return (
    <AppLayout>
      <div className="flex-1 text-jarvis-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-jarvis-border pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-jarvis-primary/10 border border-jarvis-primary/20 text-jarvis-primary">
              <Receipt className="size-6" />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-glow">
              Email Expense Agent
            </h1>
          </div>
          <p className="text-sm text-jarvis-text-muted mt-1">
            Automated expense tracking and financial report generation from your incoming emails.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-jarvis-bg-deep border border-jarvis-border rounded-[10px] px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-primary/50 cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const m = i + 1;
              const date = new Date(2000, i, 1);
              const label = date.toLocaleDateString("en-US", { month: "long" });
              return (
                <option key={m} value={m}>{label}</option>
              );
            })}
          </select>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-jarvis-bg-deep border border-jarvis-border rounded-[10px] px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-primary/50 cursor-pointer"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return (
                <option key={y} value={y}>{y}</option>
              );
            })}
          </select>

          <button
            onClick={handlePollInbox}
            disabled={isPolling}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-jarvis-primary/10 border border-jarvis-primary/20 text-jarvis-primary hover:bg-jarvis-primary/20 transition-all font-medium text-sm disabled:opacity-50 cursor-pointer"
          >
            {isPolling ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Poll Gmail Inbox
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-[12px] mb-6 flex items-center gap-3 border ${
          notification.type === "success" 
            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" 
            : "bg-rose-950/20 border-rose-500/30 text-rose-400"
        }`}>
          {notification.type === "success" ? (
            <CheckCircle className="size-5 shrink-0" />
          ) : (
            <AlertTriangle className="size-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Forms and List) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-[16px] bg-jarvis-bg-deep border border-jarvis-border">
              <span className="text-[10px] text-jarvis-text-muted font-bold uppercase tracking-wider block">Total Debits (Out)</span>
              <span className="text-xl font-bold font-heading text-[#FF4D4D] text-glow mt-1 block">
                ₹{totalDebits.toFixed(2)}
              </span>
            </div>
            
            <div className="p-4 rounded-[16px] bg-jarvis-bg-deep border border-jarvis-border">
              <span className="text-[10px] text-jarvis-text-muted font-bold uppercase tracking-wider block">Total Credits (In)</span>
              <span className="text-xl font-bold font-heading text-[#10B981] text-glow mt-1 block">
                ₹{totalCredits.toFixed(2)}
              </span>
            </div>

            <div className="p-4 rounded-[16px] bg-jarvis-bg-deep border border-jarvis-border">
              <span className="text-[10px] text-jarvis-text-muted font-bold uppercase tracking-wider block">Net Position</span>
              <span className={`text-xl font-bold font-heading text-glow mt-1 block ${netBalance >= 0 ? "text-[#10B981]" : "text-[#FF4D4D]"}`}>
                {netBalance >= 0 ? "+" : ""}₹{netBalance.toFixed(2)}
              </span>
            </div>

            <div className="p-4 rounded-[16px] bg-jarvis-bg-deep border border-jarvis-border">
              <span className="text-[10px] text-jarvis-text-muted font-bold uppercase tracking-wider block">Transactions</span>
              <span className="text-xl font-bold font-heading text-jarvis-primary text-glow mt-1 block">
                {filteredExpenses.length}
              </span>
            </div>
          </div>

          {/* AI Financial Roast Caution */}
          {isGeneratingRoast ? (
            <div className="p-5 rounded-[20px] bg-jarvis-bg-deep border border-jarvis-border/50 animate-pulse flex items-center justify-center gap-3 text-xs text-jarvis-text-muted">
              <Loader2 className="size-4 animate-spin text-red-500" />
              <span>Agent is calculating harsh financial roast caution message...</span>
            </div>
          ) : roastMessage ? (
            <div className="p-5 rounded-[20px] bg-gradient-to-r from-red-950/20 to-orange-950/20 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.05)] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 size-24 rounded-full bg-red-500/5 blur-[20px]" />
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-[12px] bg-red-500/10 border border-red-500/20 text-red-500 shrink-0">
                  <Flame className="size-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest">Agent Financial Caution</h3>
                  <p className="text-sm font-bold text-jarvis-text mt-1.5 leading-relaxed italic">
                    "{roastMessage}"
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Transactions List */}
          <div className="p-6 rounded-[20px] bg-jarvis-bg-deep border border-jarvis-border">
            <h2 className="font-heading text-base font-bold text-glow mb-4">Extracted Expenses</h2>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-jarvis-text-muted gap-2">
                <Loader2 className="size-6 animate-spin text-jarvis-primary" />
                <span className="text-sm">Retrieving transactions...</span>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-jarvis-text-muted text-sm">
                No transactions tracked yet for the selected month. Click poll to pull new alerts.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-jarvis-border text-jarvis-text-muted text-xs uppercase font-medium">
                      <th className="py-3 px-2">Merchant</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2 text-right">Amount</th>
                      <th className="py-3 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="border-b border-jarvis-border/40 hover:bg-jarvis-primary/5 transition-all">
                        <td className="py-3 px-2 font-medium text-glow flex items-center gap-2">
                          <div>
                            <div>{exp.merchant}</div>
                            {exp.rawEmailSubject && (
                              <span className="text-[10px] text-jarvis-text-muted flex items-center gap-1 mt-0.5 max-w-[200px] truncate" title={exp.rawEmailSubject}>
                                <FileText className="size-3 shrink-0" />
                                {exp.rawEmailSubject}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="flex items-center gap-1.5">
                            <span className={`size-2 rounded-full ${categoryColors[exp.category] || "bg-slate-400"}`}></span>
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-jarvis-text-muted">
                          {new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                        </td>
                        <td className="py-3 px-2 font-semibold text-right text-glow text-jarvis-primary">
                          ₹{exp.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1 rounded hover:bg-rose-500/10 text-rose-400 transition-all cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Visualizations and Manual Form) */}
        <div className="flex flex-col gap-8">
          
          {/* Expense Pivot Table */}
          <div className="p-6 rounded-[20px] bg-jarvis-bg-deep border border-jarvis-border overflow-x-auto">
            <h2 className="font-heading text-base font-bold text-glow mb-4">Expense Pivot Report</h2>
            {expenses.length === 0 ? (
              <div className="text-center py-12 text-jarvis-text-muted text-sm">
                No expense data available to generate pivot report.
              </div>
            ) : (
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-jarvis-border text-jarvis-text-muted uppercase font-medium">
                    <th className="py-2 px-1">Category</th>
                    {uniqueMonths.map(month => (
                      <th key={month} className="py-2 px-1 text-right">{month}</th>
                    ))}
                    <th className="py-2 px-1 text-right font-bold text-jarvis-primary">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => {
                    let catRowTotal = 0;
                    return (
                      <tr key={cat} className="border-b border-jarvis-border/30 hover:bg-jarvis-primary/5 transition-all text-glow">
                        <td className="py-2 px-1 font-medium flex items-center gap-1">
                          <span className={`size-1.5 rounded-full ${categoryColors[cat] || "bg-slate-400"}`}></span>
                          <span className="truncate max-w-[80px]">{cat}</span>
                        </td>
                        {uniqueMonths.map(month => {
                          const val = getPivotValue(cat, month);
                          catRowTotal += val;
                          return (
                            <td key={month} className="py-2 px-1 text-right font-mono">
                              {val > 0 ? `₹${val.toFixed(0)}` : "-"}
                            </td>
                          );
                        })}
                        <td className="py-2 px-1 text-right font-bold text-jarvis-primary font-mono">
                          ₹{catRowTotal.toFixed(0)}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals Row */}
                  <tr className="font-bold border-t border-jarvis-border text-jarvis-primary">
                    <td className="py-2.5 px-1">Total</td>
                    {uniqueMonths.map(month => {
                      const colTotal = expenses
                        .filter(e => getMonthKey(new Date(e.date)) === month)
                        .reduce((sum, e) => sum + e.amount, 0);
                      return (
                        <td key={month} className="py-2.5 px-1 text-right font-mono">
                          ₹{colTotal.toFixed(0)}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-1 text-right font-mono text-glow">
                      ₹{totalExpenses.toFixed(0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Create Manual Expense Form */}
          <div className="p-6 rounded-[20px] bg-jarvis-bg-deep border border-jarvis-border font-sans">
            <h2 className="font-heading text-base font-bold text-glow mb-4">Add Manual Expense</h2>
            <form onSubmit={handleCreateManual} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-jarvis-text-secondary font-medium mb-1 block">Merchant</label>
                <input
                  type="text"
                  value={manualForm.merchant}
                  onChange={(e) => setManualForm(prev => ({ ...prev, merchant: e.target.value }))}
                  className="w-full bg-jarvis-bg border border-jarvis-border rounded-[10px] px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-primary/50"
                  placeholder="e.g. OpenAI"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-jarvis-text-secondary font-medium mb-1 block">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualForm.amount}
                    onChange={(e) => setManualForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-jarvis-bg border border-jarvis-border rounded-[10px] px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-primary/50"
                    placeholder="20.00"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-jarvis-text-secondary font-medium mb-1 block">Date</label>
                  <input
                    type="date"
                    value={manualForm.date}
                    onChange={(e) => setManualForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-jarvis-bg border border-jarvis-border rounded-[10px] px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-primary/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-jarvis-text-secondary font-medium mb-1 block">Category</label>
                <select
                  value={manualForm.category}
                  onChange={(e) => setManualForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-jarvis-bg border border-jarvis-border rounded-[10px] px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-primary/50 cursor-pointer"
                >
                  <option value="Software/Hosting">Software/Hosting</option>
                  <option value="Travel/Transport">Travel/Transport</option>
                  <option value="Meals/Entertainment">Meals/Entertainment</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Marketing/Ads">Marketing/Ads</option>
                  <option value="Utilities/Rent">Utilities/Rent</option>
                  <option value="Services/Fees">Services/Fees</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-[12px] bg-jarvis-primary/10 border border-jarvis-primary/20 text-jarvis-primary font-semibold text-sm hover:bg-jarvis-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="size-4" />
                Add Expense
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
    </AppLayout>
  );
}
