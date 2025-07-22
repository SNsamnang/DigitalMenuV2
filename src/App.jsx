import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Menu from "./pages/Shop";
import Details from "./pages/Details";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Product from "./pages/Admin/Product/Product";
import Category from "./pages/Admin/Category/Category";
import AddCategory from "./pages/Admin/Category/AddCategory";
import Users from "./pages/Admin/Users/Users";
import AddUsers from "./pages/Admin/Users/AddUsers";
import Shop from "./pages/Admin/Shop/Shop";
import AddShop from "./pages/Admin/Shop/AddShop";
import SocialMedia from "./pages/Admin/SocialMedia/SocialMedia";
import AddProduct from "./pages/Admin/Product/AddProduct";
import Industry from "./pages/Admin/Industry/Industry";
import AddIndustry from "./pages/Admin/Industry/AddIndustry";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import AddSocial from "./pages/Admin/SocialMedia/AddSocialMedia";
import MenuGrid from "./pages/MenuGrid";
// import MenuList from "./pages/MenuList";
import UpdatePassword from "./pages/UpdatePassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/shop/:name/:shopId" element={<Menu />} />
        <Route path="/menu-grid/:shopId" element={<MenuGrid />} />
        {/* <Route path="/menu-list/:shopId" element={<MenuList />} /> */}
        <Route path="/details/:id" element={<Details />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="products" element={<Product />} />
                <Route path="category" element={<Category />} />
                <Route path="add-category" element={<AddCategory />} />
                <Route
                  path="users"
                  element={
                    <RoleProtectedRoute allowedRoles={["super admin"]}>
                      <Users />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="add-users"
                  element={
                    <RoleProtectedRoute allowedRoles={["super admin"]}>
                      <AddUsers />
                    </RoleProtectedRoute>
                  }
                />
                <Route path="shop" element={<Shop />} />
                <Route path="add-shop" element={<AddShop />} />
                <Route path="social-media" element={<SocialMedia />} />
                <Route path="add-social-media" element={<AddSocial />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route
                  path="industry"
                  element={
                    <RoleProtectedRoute allowedRoles={["super admin"]}>
                      <Industry />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="add-industry"
                  element={
                    <RoleProtectedRoute allowedRoles={["super admin"]}>
                      <AddIndustry />
                    </RoleProtectedRoute>
                  }
                />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
