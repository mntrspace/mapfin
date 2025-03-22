const ExpenseList = ({ expenses }) => {
    if (expenses.length === 0) {
      return <p className="text-center text-gray-500 mt-6">No expenses added yet.</p>;
    }
  
    return (
        <div className="mt-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Expense List</h2>
      
          {/* Responsive layout switcher */}
          <div>
            {/* Table layout for md+ screens */}
            <div className="hidden md:block">
              <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-md">
                <thead className="bg-gray-200 text-left text-sm text-gray-600">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Currency</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Tags</th>
                    <th className="p-3">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp, idx) => (
                    <tr key={`row-${idx}`} className="border-t">
                      <td className="p-3">{exp.date}</td>
                      <td className="p-3">{exp.amount}</td>
                      <td className="p-3">{exp.currency}</td>
                      <td className="p-3">{exp.category}</td>
                      <td className="p-3">{exp.paymentMethod}</td>
                      <td className="p-3">{exp.tags.join(", ")}</td>
                      <td className="p-3">{exp.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      
            {/* Card layout for smaller screens only */}
            <div className="md:hidden">
              {expenses.map((exp, idx) => (
                <div key={`card-${idx}`} className="bg-white shadow rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-500">{exp.date}</div>
                  <div className="text-lg font-semibold">
                    {exp.amount} {exp.currency}
                  </div>
                  <div className="text-sm">{exp.category}</div>
                  {exp.note && <div className="text-sm italic mt-1">{exp.note}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }      
export default ExpenseList;
