import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = supabaseAdmin();
  try {
    let userId: string;
    
    // 1. Check if user already exists in auth
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ success: false, error: listError.message });
    }
    
    const existingUser = listData.users.find(
      (u) => u.email?.toLowerCase() === "pitonrodjy@gmail.com"
    );

    if (existingUser) {
      userId = existingUser.id;
      
      // Update password of existing user using admin credentials
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(userId, {
        password: "pitonrp8",
        email_confirm: true,
      });

      if (updateAuthError) {
        return NextResponse.json({ success: false, error: `Failed to update auth: ${updateAuthError.message}` });
      }
    } else {
      // Create new user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: "pitonrodjy@gmail.com",
        password: "pitonrp8",
        email_confirm: true,
      });

      if (authError) {
        return NextResponse.json({ success: false, error: `Failed to create auth: ${authError.message}` });
      }
      userId = authData.user.id;
    }

    // 2. Insert/update the role and permissions in public.users table
    const { error: dbError } = await supabase
      .from("users")
      .upsert({
        id: userId,
        email: "pitonrodjy@gmail.com",
        name: "Piton Rodjesnky",
        role: "superadmin",
        permissions: {
          dashboard: true,
          orders: true,
          stock: true,
          users: true,
          settings: true,
          admins: true
        },
        status: "active"
      });

    if (dbError) {
      return NextResponse.json({ success: false, error: `Failed to update public.users: ${dbError.message}` });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Le compte SuperAdmin a été créé / mis à jour avec succès !",
      email: "pitonrodjy@gmail.com",
      role: "superadmin"
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
