import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { TransactionsPage } from "@/pages/TransactionsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { CommitmentsPage } from "@/pages/CommitmentsPage";
import { EmiCalculatorPage } from "@/pages/EmiCalculatorPage";
import { GoalsPage } from "@/pages/GoalsPage";
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/transactions",
    element: <TransactionsPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/commitments",
    element: <CommitmentsPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/emi-calculator",
    element: <EmiCalculatorPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/goals",
    element: <GoalsPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)