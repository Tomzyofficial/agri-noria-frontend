"use server";
import { apiUrl } from "@/_lib/api";
import { cookies } from "next/headers";

/***************** Vendor side ******************/
export async function signinBridge(credentials) {
  try {
    const res = await fetch(apiUrl("/api/auth/vendor/sign-in"), {
      body: JSON.stringify(credentials),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      const status = res.status;
      console.log(
        "Vendor sign-in failed with status:",
        status,
        "and error:",
        data.error,
      );
      return {
        success: false,
        error: data.error,
      };
    }

    // THE MAGIC PART: Set the cookie on the Vercel domain
    // 'data.token' should be the JWT returned by your Render backend
    const cookieStore = await cookies();
    cookieStore.set("vendor-session", data.user.token, {
      httpOnly: true,
      secure: true, // Production uses HTTPS
      sameSite: "none",
      path: "/",
      // maxAge: 60 * 60 * 24, // 1 day
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function registerBridge(credentials) {
  try {
    const res = await fetch(apiUrl("/api/auth/vendor/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok || !data.success) return { success: false, error: data.error };

    const cookieStore = await cookies();
    cookieStore.set("vendor-session", data.user.token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      // maxAge: 60 * 60 * 24, // 1 day
    });

    return { success: true };
  } catch (error) {
    console.error("RegisterBridge error:", error);
    return { success: false, error: "Internal server error. Try again later." };
  }
}

export async function signoutBridge() {
  const cookieStore = await cookies();

  const client = cookieStore.delete("vendor-session");

  const backend = await fetch(apiUrl("/api/auth/vendor/signout"), {
    method: "POST",
  });

  if (!client || !backend.ok) {
    return false;
  }
  return true;
}

/********************** Buyer side *******************/
export async function buyerSigninBridge(credentials) {
  try {
    const res = await fetch(apiUrl("/api/auth/buyer/signin"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error };
    }

    const cookieStore = await cookies();
    cookieStore.set("buyer-session", data.token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      // maxAge: 60 * 60 * 24, // 1 day
    });

    return { success: true, buyerId: data.buyerId };
  } catch (error) {
    return { success: false, error: "Internal server error. Try again later." };
  }
}

export async function buyerRegisterBridge(credentials) {
  try {
    const res = await fetch(apiUrl("/api/auth/buyer/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok || !data.success) return { success: false, error: data.error };

    const cookieStore = await cookies();
    cookieStore.set("buyer-session", data.token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      // maxAge: 60 * 60 * 24, // 1 day
    });

    return { success: true, buyerId: data.token.buyer_id };
  } catch (error) {
    return { success: false, error: "Internal server error. Try again later." };
  }
}

export async function buyerSignoutBridge() {
  const cookieStore = await cookies();
  cookieStore.delete("buyer-session");
  cookieStore.delete("cart-session");
  const backend = await fetch(apiUrl("/api/auth/buyer/signout"), {
    method: "POST",
  });
  if (!backend.ok) {
    return false;
  }
  return true;
}
