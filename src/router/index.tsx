import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Materials from '../pages/Materials';
import MaterialDetail from '../pages/MaterialDetail';
import MaterialForm from '../pages/MaterialForm';
import MaterialEdit from '../pages/MaterialEdit';
import Movements from '../pages/Movements';
import MovementForm from '../pages/MovementForm';
import MachineForm from '../pages/MachineForm';
import MachineEdit from '../pages/MachineEdit';
import Machines from '../pages/Machines';
import MachineDetail from '../pages/MachineDetail';
import WorkOrders from '../pages/WorkOrders';
import WorkOrderDetail from '../pages/WorkOrderDetail';
import WorkOrderForm from '../pages/WorkOrderForm';
import Reports from '../pages/Reports';
import Admin from '../pages/Admin';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import ProtectedRoute from '../components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'materials',
        children: [
          {
            index: true,
            element: <Materials />
          },
          {
            path: 'new',
            element: <MaterialForm />
          },
          {
            path: ':id',
            element: <MaterialDetail />
          },
          {
            path: ':id/edit',
            element: <MaterialEdit />
          }
        ]
      },
      {
        path: 'movements',
        children: [
          {
            index: true,
            element: <Movements />
          },
          {
            path: 'new',
            element: <MovementForm />
          }
        ]
      },
      {
        path: 'machines',
        children: [
          {
            index: true,
            element: <Machines />
          },
          {
            path: 'new',
            element: <MachineForm />
          },
          {
            path: ':id',
            element: <MachineDetail />
          },
          {
            path: ':id/edit',
            element: <MachineEdit />
          }
        ]
      },
      {
        path: 'work-orders',
        children: [
          {
            index: true,
            element: <WorkOrders />
          },
          {
            path: 'new',
            element: <WorkOrderForm />
          },
          {
            path: ':id',
            element: <WorkOrderDetail />
          }
        ]
      },
      {
        path: 'reports',
        element: <Reports />
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        )
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);