import { Outlet } from "react-router-dom";
import DarkHacker from "../../assets/DarkHacker.jpg";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side with Image and Text */}
      <div className="hidden lg:flex items-center justify-center bg-black w-1/2 px-12">
        <div className="max-w-md space-y-6 text-center text-primary-foreground">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome to HAKING SHOP E-COMMERCE : {")"}
          </h1>
          <div className="relative w-full">
            <img
              src={DarkHacker}
              alt="Dark Hacker"
              className="w-full h-auto max-h-96 object-cover rounded-lg shadow-lg opacity-45 transition-opacity duration-700 hover:opacity-100"
            />
          </div>
        </div>
      </div>

      {/* Right Side (Outlet) */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
