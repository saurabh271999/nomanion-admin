"use client";

import Sidebar from "../components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { usePathname } from "next/navigation";
import { ConfigProvider } from "antd";

function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const { isDark } = useTheme();

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div
      className={`flex min-h-screen ${
        isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen w-full">
        {children}
      </main>
    </div>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider>
      <ThemeProvider>
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}


