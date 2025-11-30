"use client";

import Sidebar from "../components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
import { usePathname } from "next/navigation";
import { ConfigProvider } from "antd";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <ConfigProvider>
      <AuthProvider>
        {isLoginPage ? (
          <>{children}</>
        ) : (
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-4 md:p-8 bg-gray-50 min-h-screen w-full">
              {children}
            </main>
          </div>
        )}
      </AuthProvider>
    </ConfigProvider>
  );
}

