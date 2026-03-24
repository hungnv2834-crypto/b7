import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Overview from './pages/Overview';
import Student from './pages/Student';
import Teacher from './pages/Teacher';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Overview />} />
          <Route path="student" element={<Student />} />
          <Route path="teacher" element={<Teacher />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
