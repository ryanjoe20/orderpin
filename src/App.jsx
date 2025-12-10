import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Report from './pages/Report';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/report" element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
