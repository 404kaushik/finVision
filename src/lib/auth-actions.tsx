"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  try {
    const client = await supabase;
    const { error, data: authData } = await client.auth.signInWithPassword(data);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error) {
    // Instead of redirecting to error page, throw error to be handled by form
    throw error;
  }
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate password strength
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address");
  }

  const data = {
    email,
    password,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
        email,
      },
    },
  };

  try {
    const client = await supabase;
    const { error, data: authData } = await client.auth.signUp(data);

    if (error) {
      throw new Error(error.message);
    }

    // Check if email confirmation is required
    if (authData?.user?.identities?.length === 0) {
      throw new Error("Email confirmation required. Please check your email.");
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error) {
    throw error;
  }
}

export async function signout() {
  const supabase = createClient();
  
  const client = await supabase;
  const { error } = await client.auth.signOut();
  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect("/logout");
}

export async function signInWithGoogle() {
  const supabase = createClient();
  const client = await supabase;
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect(data.url);
}