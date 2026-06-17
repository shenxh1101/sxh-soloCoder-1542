import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.js';
import Dashboard from './pages/Dashboard.js';
import MemberList from './pages/MemberList.js';
import MemberNew from './pages/MemberNew.js';
import MemberDetail from './pages/MemberDetail.js';
import Checkout from './pages/Checkout.js';
import Recharge from './pages/Recharge.js';
import RechargeRules from './pages/RechargeRules.js';
import Points from './pages/Points.js';
import PointsRules from './pages/PointsRules.js';
import Statistics from './pages/Statistics.js';
import Statement from './pages/Statement.js';
import Settings from './pages/Settings.js';
import Home from './pages/Home.js';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="home" element={<Home />} />
          <Route path="members" element={<MemberList />} />
          <Route path="members/new" element={<MemberNew />} />
          <Route path="members/:id" element={<MemberDetail />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="recharge" element={<Recharge />} />
          <Route path="recharge/rules" element={<RechargeRules />} />
          <Route path="points" element={<Points />} />
          <Route path="points/rules" element={<PointsRules />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="statistics/statement" element={<Statement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
