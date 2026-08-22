import { RouterProvider } from 'react-router-dom'
import { AppRouter } from './app/router'
import { CartProvider } from './features/cart/cart-context'
import { AuthProvider } from './features/auth/auth-context'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={AppRouter} />
      </CartProvider>
    </AuthProvider>
  )
}
