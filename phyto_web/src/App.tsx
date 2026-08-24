import { RouterProvider } from 'react-router-dom'
import { AppRouter } from './app/router'
import { CartProvider } from './features/cart/cart-context'
import { AuthProvider } from './features/auth/auth-context'
import { I18nProvider } from './features/i18n/i18n-context'
import { LocationProvider } from './features/nursery/nursery-service'
import { GreenIndexProvider } from './features/green-index/green-index-context'

export default function App() {
  return (
    <I18nProvider>
      <LocationProvider>
        <AuthProvider>
          <GreenIndexProvider>
            <CartProvider>
              <RouterProvider router={AppRouter} />
            </CartProvider>
          </GreenIndexProvider>
        </AuthProvider>
      </LocationProvider>
    </I18nProvider>
  )
}
