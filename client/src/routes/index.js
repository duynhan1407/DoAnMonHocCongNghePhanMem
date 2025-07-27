

import HomePage from "../pages/HomePage/HomePage";
import FavoritePage from "../pages/FavoritePage/FavoritePage";
import AdminStockPage from "../pages/AdminStockPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import SignInPage from "../pages/SignInPage/SignInPage";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import ProfilePage from "../pages/ProfilePage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import AdminPage from "../pages/AdminPage/AdminPage";
import PaymentPage from "../pages/Payment/PaymentPage";
import CartPage from "../pages/CartPage/CartPage";
import OauthSuccess from "../pages/OauthSuccess";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage";
import OrderInfoPage from "../pages/OrderInfoPage/OrderInfoPage";


// Public routes
const publicRoutes = [
  { path: "/", page: HomePage, isShowHeader: true, title: "Home" },
  { path: "/favorite", page: FavoritePage, isShowHeader: true, title: "Yêu thích" },
  { path: "/sign-in", page: SignInPage, isShowHeader: false, title: "Sign In" },
  { path: "/sign-up", page: SignUpPage, isShowHeader: false, title: "Sign Up" },
  {
    path: "/payment/:orderId",
    page: PaymentPage,
    isShowHeader: true,
    title: "Payment",
  },
  {
    path: "/payment",
    page: PaymentPage,
    isShowHeader: true,
    title: "Payment",
  },
  { path: "/oauth-success", page: OauthSuccess, isShowHeader: false, title: "OAuth Success" },
  { path: "/product-detail/:productId", page: ProductDetailPage, isShowHeader: true, title: "Chi tiết sản phẩm" },
  { path: "/order-info", page: OrderInfoPage, isShowHeader: true, title: "Xác nhận thông tin" },
];

// Private routes
const privateRoutes = [
  {
    path: "/profile",
    page: ProfilePage,
    isShowHeader: true,
    title: "Profile",
    isPrivate: true,
  },
  {
    path: "/change-password",
    page: ChangePasswordPage,
    isShowHeader: true,
    title: "Đổi mật khẩu",
    isPrivate: true,
  },
  {
    path: "/cart",
    page: CartPage,
    isShowHeader: true,
    title: "Giỏ hàng",
    isPrivate: true,
  },
];

// Admin routes
const adminRoutes = [
  {
    path: "/admin",
    page: AdminPage,
    isShowHeader: false,
    title: "Admin Panel",
    isPrivate: true,
    isAdmin: true,
  },
  {
    path: "/admin/stock",
    page: AdminStockPage,
    isShowHeader: false,
    title: "Quản lý kho",
    isPrivate: true,
    isAdmin: true,
  },
];

// Combine all routes
export const routes = [
  ...publicRoutes,
  ...privateRoutes,
  ...adminRoutes,
  { path: "*", page: NotFoundPage, title: "404 - Not Found" },
];
