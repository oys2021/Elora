import { Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/common/ScrollToTop'
import CartDrawer from './components/common/CartDrawer'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import ProductListing from './pages/ProductListing'
import AboutUs from './pages/AboutUs'
import Contact from './pages/Contact'
import Checkout from './pages/Checkout'
import PaymentResult from './pages/PaymentResult'
import Account from './pages/Account'
import Orders from './pages/Orders'
import Favorites from './pages/Favorites'
import Faq from './pages/Faq'
import Returns from './pages/Returns'
import Career from './pages/Career'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminBanners from './pages/admin/AdminBanners'
import AdminDelivery from './pages/admin/AdminDelivery'
import AdminUsers from './pages/admin/AdminUsers'
import AdminOrders from './pages/admin/AdminOrders'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminNotFound from './pages/admin/AdminNotFound'
import NotFound from './pages/NotFound'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:slug" element={<ProductDetail />} />

        <Route path="/new-in" element={<ProductListing title="New In" />} />
        <Route path="/hot-sellers" element={<ProductListing title="Hot Sellers" filter="bestsellers" />} />
        <Route path="/products" element={<ProductListing title="All Products" />} />
        <Route path="/products/:productType" element={<ProductListing />} />
        <Route path="/categories/:categorySlug" element={<ProductListing />} />

        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/payment" element={<PaymentResult />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/account" element={<Account />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/career" element={<Career />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="delivery" element={<AdminDelivery />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="*" element={<AdminNotFound />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <CartDrawer />
    </>
  )
}

export default App
