import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import { AppLayout } from './shell/app-layout'
import { HomePage } from '../pages/home/home-page'
import { ShopPage } from '../pages/shop/shop-page'
import { ProductDetailPage } from '../pages/product/product-detail-page'
import { CartPage } from '../pages/cart/cart-page'
import { CheckoutPage } from '../pages/checkout/checkout-page'
import { KitsPage } from '../pages/kits/kits-page'
import { ServicesPage } from '../pages/services/services-page'
import { ProfilePage } from '../pages/profile/profile-page'
import { GreenIndexPage } from '../pages/green-index/green-index-page'
import { NurseryDashboardPage } from '../pages/nursery/nursery-dashboard-page'
import { GardenerDashboardPage } from '../pages/gardener/gardener-dashboard-page'
import { AdminGate, AdminLoginPage, AdminPanelPage } from '../pages/admin/admin-pages'
import { LoginPage } from '../pages/auth/login-page'
import { DeliveryPage } from '../pages/delivery/delivery-page'
import { useAuth } from '../features/auth/auth-context'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-6 shadow-sm border border-stone-200">
          <div className="size-6 animate-spin rounded-full border-2 border-phyto-leaf border-t-transparent" />
          <span className="text-sm font-semibold text-phyto-forest">Entering Phyto Greenhouse…</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export const AppRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'shop',
        element: (
          <ProtectedRoute>
            <ShopPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'product/:id',
        element: (
          <ProtectedRoute>
            <ProductDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'kits',
        element: (
          <ProtectedRoute>
            <KitsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'services',
        element: (
          <ProtectedRoute>
            <ServicesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'green-index',
        element: (
          <ProtectedRoute>
            <GreenIndexPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'nursery',
        element: (
          <ProtectedRoute>
            <NurseryDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'gardener',
        element: (
          <ProtectedRoute>
            <GardenerDashboardPage />
          </ProtectedRoute>
        ),
      },
      { path: 'login', element: <LoginPage /> },
      { path: 'delivery', element: <DeliveryPage /> },
      { path: 'admin/login', element: <AdminLoginPage /> },
      {
        path: 'admin',
        element: (
          <AdminGate>
            <AdminPanelPage />
          </AdminGate>
        ),
      },
    ],
  },
])
