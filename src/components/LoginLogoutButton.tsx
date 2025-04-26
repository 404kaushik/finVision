"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { FaSignInAlt, FaSignOutAlt} from "react-icons/fa"
import { signout } from "@/lib/auth-actions";

const LoginButton = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);
  if (user) {
    return (
      <Button
        variant="outline"
        onClick={() => {
          signout();
          setUser(null);
        }}
      >
        <FaSignOutAlt />
        Log out
      </Button>
    );
  }
  return (
    <Button
      variant="ghost"
      onClick={() => {
        router.push("/login");
      }}
    >
        <FaSignInAlt />
      Login
    </Button>
  );
};

export default LoginButton;