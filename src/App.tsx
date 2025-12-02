import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Wealth from '@/pages/Wealth';
import Expenses from '@/pages/Expenses';
import Goals from '@/pages/Goals';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="wealth" element={<Wealth />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="goals" element={<Goals />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
