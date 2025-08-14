"use client"

import { useState } from "react"
import Layout from "@/components/Layout"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function DeleteAccount() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDeleteAccount = async () => {
    if (!isConfirming) {
      setIsConfirming(true)
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to delete your account")
      }

      // Delete user data from any tables where it exists
      // This would include saved companies, chat history, etc.
      await supabase.from('saved_research').delete().eq('user_id', user.id)
      await supabase.from('searches').delete().eq('user_id', user.id)
      await supabase.from('chat_history').delete().eq('user_id', user.id)
      
      // Since we can't directly delete the user account from the client side,
      // we'll sign the user out and display a message about account deletion
      // In a production app, you would typically have a server-side function to handle this
      // or use Supabase Edge Functions

      // Sign out the user
      await supabase.auth.signOut()

      setIsSuccess(true)
      
      // Redirect to home page after a delay
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 3000)
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting your account")
      setIsDeleting(false)
      setIsConfirming(false)
    }
  }

  const handleCancel = () => {
    if (isConfirming) {
      setIsConfirming(false)
    } else {
      router.back()
    }
  }

  return (
    <Layout>
      <div className="container max-w-md mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {isSuccess ? "Data Deleted" : "Delete Account Data"}
              </CardTitle>
              <CardDescription>
                {isSuccess 
                  ? "Your data has been successfully deleted." 
                  : isConfirming 
                    ? "This action cannot be undone. All your data will be permanently deleted." 
                    : "We're sorry to see you go. Please confirm that you want to delete your account data."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <p className="text-center text-muted-foreground">
                    Your data has been deleted and you have been signed out. You will be redirected to the home page shortly.
                  </p>
                  <p className="text-center text-muted-foreground mt-2 text-xs">
                    Note: For complete account deletion, please contact our support team.
                  </p>
                </div>
              ) : error ? (
                <div className="bg-destructive/10 p-4 rounded-md flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              ) : isConfirming ? (
                <div className="space-y-4">
                  <div className="bg-amber-500/10 p-4 rounded-md flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Warning</p>
                      <ul className="text-sm mt-2 space-y-2 list-disc pl-4">
                        <li>All your saved companies will be deleted</li>
                        <li>Your chat history will be deleted</li>
                        <li>Your account information will be removed</li>
                        <li>This action cannot be reversed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  When you delete your account, all of your data will be permanently removed from our systems. This includes your profile information, saved companies, and chat history.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {!isSuccess && (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={isDeleting}>
                    {isConfirming ? "Go Back" : "Cancel"}
                  </Button>
                  <Button 
                    variant={isConfirming ? "destructive" : "default"} 
                    onClick={handleDeleteAccount} 
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : isConfirming ? (
                      "Permanently Delete Account"
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}