import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/app/admiflexipass/components/Sidebar";
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
    <div className="min-h-screen bg-[#0f0f23] text-zinc-200 antialiased flex">
      <Sidebar admin={adminUser} />
      <main className="flex-1 transition-all duration-300 ml-20 md:ml-64 p-4 md:p-8 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}

