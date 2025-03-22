import { useState } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import SearchBar from "./components/SearchBar";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    note: "",
    date: "",
    month: "",
    paymentMethod: "",
    amount: "",
    tag: "",
    categories: [],
  });

  const handleAddExpense = (expense) => {
    setExpenses([expense, ...expenses]);
  };

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
  };

  const applyFilters = (exp) => {
    const { note, date, month, paymentMethod, amount, tag, categories } = filters;

    const dateObj = new Date(exp.date);
    const expenseMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;

    if (note && !exp.note.toLowerCase().includes(note.toLowerCase())) return false;
    if (date && exp.date !== date) return false;
    if (month && expenseMonth !== month) return false;
    if (paymentMethod && exp.paymentMethod !== paymentMethod) return false;
    if (tag && !exp.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))) return false;
    if (categories.length > 0 && !categories.includes(exp.category)) return false;

    if (amount) {
      const regex = /([><=]=?)(\d+)/g;
      const matches = [...amount.matchAll(regex)];
      for (let [, op, val] of matches) {
        val = parseFloat(val);
        if (op === ">" && !(exp.amount > val)) return false;
        if (op === "<" && !(exp.amount < val)) return false;
        if (op === ">=" && !(exp.amount >= val)) return false;
        if (op === "<=" && !(exp.amount <= val)) return false;
        if (op === "=" && !(exp.amount == val)) return false;
      }
    }

    return true;
  };

  const filteredExpenses = expenses.filter(applyFilters);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <ExpenseForm onAddExpense={handleAddExpense} />
      <SearchBar filters={filters} onFilterChange={handleFilterChange} />
      <ExpenseList expenses={filteredExpenses} />
    </div>
  );
}

export default App;
