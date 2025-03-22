import { useState } from "react";

const SearchBar = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({ ...localFilters, [name]: value });
    onFilterChange({ ...localFilters, [name]: value });
  };

  const handleMultiSelect = (name, value) => {
    const current = new Set(localFilters[name]);
    current.has(value) ? current.delete(value) : current.add(value);
    const updated = { ...localFilters, [name]: [...current] };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow max-w-4xl mx-auto mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input name="note" type="text" placeholder="Search Notes..." value={localFilters.note} onChange={handleChange} className="input" />

        <input name="date" type="date" value={localFilters.date} onChange={handleChange} className="input" />

        <input name="month" type="month" value={localFilters.month} onChange={handleChange} className="input" />

        <input name="paymentMethod" type="text" placeholder="Payment Method" value={localFilters.paymentMethod} onChange={handleChange} className="input" />

        <input name="tag" type="text" placeholder="Tag" value={localFilters.tag} onChange={handleChange} className="input" />

        <input name="amount" type="text" placeholder="Amount filter (e.g. >500, <200, =100)" value={localFilters.amount} onChange={handleChange} className="input" />
      </div>

      {/* Category Multi-select */}
      <div className="flex flex-wrap gap-2">
        {[
          "Food & Dining", "Gifts", "Groceries", "Personal", "Family & House Supplies",
          "Leisure", "Fitness and Health", "Other", "Transport / Travel",
          "Utilities & Rent", "Subscriptions"
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => handleMultiSelect("categories", cat)}
            className={`px-3 py-1 rounded-full text-sm border ${
              localFilters.categories.includes(cat)
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-600 border-gray-300"
            }`}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>

      // After the multi-select category buttons, add this:
<div className="text-right">
  <button
    type="button"
    className="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
    onClick={() => {
      const cleared = {
        note: "",
        date: "",
        month: "",
        paymentMethod: "",
        amount: "",
        tag: "",
        categories: [],
      };
      setLocalFilters(cleared);
      onFilterChange(cleared);
    }}
  >
    Clear Filters
  </button>
</div>

    </div>
  );
};

export default SearchBar;
