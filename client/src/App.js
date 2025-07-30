
import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { routes } from "./routes";
import DefaultComponent from "./components/DefaultComponent/DefaultComponent";
import * as UserServices from "./services/UserServices";
import { logoutUser, setUser } from "./redux/Slide/userSlide";
import Loading from "./components/LoadingComponent/Loading";
// Debug: kiểm tra giá trị userName khi app khởi động
console.log('App khởi động - userName trong localStorage:', localStorage.getItem('userName'));

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isAppInitialized, setIsAppInitialized] = useState(false);

  const handleGetDetailUser = useCallback(async (id, token) => {
    try {
      const res = await UserServices.getDetailUser(id, token);
      dispatch(setUser({ ...res.data, access_token: token }));
    } catch (error) {
      console.error("Failed to fetch user details:", error.message);
      localStorage.removeItem("access_token");
      dispatch(logoutUser());
    }
  }, [dispatch]);

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem("access_token");

      if (token) {
        try {
          const decoded = jwtDecode(token);

          // Kiểm tra nếu token hợp lệ
          if (decoded?.id) {
            await handleGetDetailUser(decoded.id, token);
          }
        } catch (error) {
          console.error("Invalid token:", error.message);
          localStorage.removeItem("access_token");
          dispatch(logoutUser());
        }
      }

      // Đánh dấu app đã khởi tạo xong
      setIsAppInitialized(true);
    };

    initializeApp();
  }, [dispatch, handleGetDetailUser]);

  const isAuthorized = (route) => {
    if (!route.isPrivate) return true; // Public route
    if (!user?.access_token) return false; // Không có token
    if (route.isAdmin && !user?.isAdmin) return false; // Không có quyền admin
    return true;
  };

  if (!isAppInitialized) {
    return <Loading isLoading={true} />;
  }

  return (
    <Routes>
      {routes.map((route) => {
        const Page = route.page;
        const Layout = route.isShowHeader ? DefaultComponent : React.Fragment;

        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              isAuthorized(route) ? (
                <Layout>
                  <Page />
                </Layout>
              ) : (
                <Navigate to="/sign-in" replace />
              )
            }
          />
        );
      })}
    </Routes>
  );
}

export default App;
