import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SettingsProvider } from '@/contexts/SettingsContext';
import Home from '@/pages/Home';
import Wealth from '@/pages/Wealth';
import Expenses from '@/pages/Expenses';
import Goals from '@/pages/Goals';
import Settings from '@/pages/Settings';

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="wealth" element={<Wealth />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="goals" element={<Goals />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
