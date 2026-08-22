import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './shell/app-layout'
import { HomePage } from '../pages/home/home-page'
import { ShopPage } from '../pages/shop/shop-page'
import { ProductDetailPage } from '../pages/product/product-detail-page'
import { CartPage } from '../pages/cart/cart-page'
import { CheckoutPage } from '../pages/checkout/checkout-page'
import { AdminGate, AdminLoginPage, AdminPanelPage } from '../pages/admin/admin-pages'
import { LoginPage } from '../pages/auth/login-page'
import { DeliveryPage } from '../pages/delivery/delivery-page'

export const AppRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'product/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
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

