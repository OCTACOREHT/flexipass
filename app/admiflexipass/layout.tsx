import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/app/admiflexipass/components/Sidebar";
import AdminBottomNav from "@/app/admiflexipass/components/AdminBottomNav";
import { ADMIN_COOKIE_NAME, verifyAdminAuthToken } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let token: string | undefined;
  try {
    const ck = await cookies();
    if (ck && typeof (ck as any).get === "function") {
      token = ck.get(ADMIN_COOKIE_NAME)?.value;
    } else {
      const hdrs = await headers();
      let cookieHeader = "";
      if (hdrs) {
        if (typeof (hdrs as any).get === "function") {
          cookieHeader = (hdrs as any).get("cookie") || "";
        } else if (typeof (hdrs as any).entries === "function") {
          for (const [k, v] of (hdrs as any).entries()) {
            if (String(k).toLowerCase() === "cookie") {
              cookieHeader = String(v);
              break;
            }
          }
        } else if ((hdrs as any).cookie) {
          cookieHeader = String((hdrs as any).cookie || "");
        }
      }

      const match = cookieHeader
        .split(";")
        .map((s) => s.trim())
        .find((c) => c.startsWith(`${ADMIN_COOKIE_NAME}=`));
      token = match ? decodeURIComponent(match.split("=")[1]) : undefined;
    }
  } catch {
    const hdrs = await headers();
    let cookieHeader = "";
    if (hdrs) {
      if (typeof (hdrs as any).get === "function") {
        cookieHeader = (hdrs as any).get("cookie") || "";
      } else if (typeof (hdrs as any).entries === "function") {
        for (const [k, v] of (hdrs as any).entries()) {
          if (String(k).toLowerCase() === "cookie") {
            cookieHeader = String(v);
            break;
          }
        }
      } else if ((hdrs as any).cookie) {
        cookieHeader = String((hdrs as any).cookie || "");
      }
    }
    const match = cookieHeader
      .split(";")
      .map((s) => s.trim())
      .find((c) => c.startsWith(`${ADMIN_COOKIE_NAME}=`));
    token = match ? decodeURIComponent(match.split("=")[1]) : undefined;
  }

  const adminUser = verifyAdminAuthToken(token);
  if (!adminUser || typeof adminUser === "boolean") {
    redirect("/admin-login");
  }

  return (
    <div className="min-h-screen bg-white text-[#2f2a33] antialiased flex overflow-hidden">
      <Sidebar admin={adminUser} />
      <AdminBottomNav admin={adminUser} />
      <main className="flex-1 min-w-0 transition-all duration-300 pl-0 md:pl-20 lg:pl-64 overflow-y-auto overflow-x-hidden min-h-screen">
        <div className="w-full p-4 md:p-6 pb-24 md:pb-6 max-w-full">{children}</div>
      </main>
    </div>
  );
}

