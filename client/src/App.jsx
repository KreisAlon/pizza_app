import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Customer from './Customer';
import Employee from './Employee';
import Delivery from './Delivery';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '15px', borderBottom: '2px solid #333', marginBottom: '20px' }}>
        <Link to="/">Customer</Link> | <Link to="/employee">Employee</Link> | <Link to="/delivery">Delivery</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Customer />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/delivery" element={<Delivery />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;