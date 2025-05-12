"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { LogInIcon, LogOutIcon } from "lucide-react"
import { signout } from "@/lib/auth-actions"

const LoginButton = () => {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  if (user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          signout()
          setUser(null)
        }}
        className="flex items-center gap-2"
      >
        <LogOutIcon className="h-4 w-4" />
        <span>Log out</span>
      </Button>
    )
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => {
        router.push("/login")
      }}
      className="flex items-center gap-2"
    >
      <LogInIcon className="h-4 w-4" />
      <span>Login</span>
    </Button>
  )
}

export default LoginButton
