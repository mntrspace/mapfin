import { useState } from "react";

const categories = [
  "Food & Dining", "Gifts", "Groceries", "Personal", "Family & House Supplies",
  "Leisure", "Fitness and Health", "Other", "Transport / Travel",
  "Utilities & Rent", "Subscriptions"
];

const ExpenseForm = ({ onAddExpense }) => {
  const [form, setForm] = useState({
    amount: "",
    currency: "INR",
    note: "",
    tags: "",
    paymentMethod: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArray = form.tags.split(",").map(tag => tag.trim());
    onAddExpense({ ...form, tags: tagsArray });
    setForm({ ...form, amount: "", note: "", tags: "" });
  };

  return (
    <form className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow-md" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Add Expense</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} className="input" required />
        <input name="currency" type="text" placeholder="Currency (e.g. INR)" value={form.currency} onChange={handleChange} className="input" required />
        <input name="note" type="text" placeholder="Note" value={form.note} onChange={handleChange} className="input" />
        <input name="tags" type="text" placeholder="Tags (comma-separated)" value={form.tags} onChange={handleChange} className="input" />
        <input name="paymentMethod" type="text" placeholder="Payment Method" value={form.paymentMethod} onChange={handleChange} className="input" />
        
        <select name="category" value={form.category} onChange={handleChange} className="input" required>
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input name="date" type="date" value={form.date} onChange={handleChange} className="input" required />
      </div>

      <button type="submit" className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
        Add Expense
      </button>
    </form>
  );
};

export default ExpenseForm;
