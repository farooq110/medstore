import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Lock, Package } from "lucide-react"
import { Button } from "../components/ui/button"
import { authService } from "../services/auth.service"
import { successMessage, errorMessage } from "../lib/notifications"

const resetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ResetForm = z.infer<typeof resetSchema>

export function ResetPassword() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const onSubmit = async (data: ResetForm) => {
    if (!token) return

    try {
      setLoading(true)
      await authService.resetPassword(token, data.password)
      successMessage("Password Updated", "Your password has been set successfully.")
      navigate("/login")
    } catch (err: any) {
      errorMessage(
        "Update Failed", 
        err.response?.data?.message || "Invalid or expired reset token."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-surface p-8 shadow-xl ring-1 ring-border">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-lg ring-4 ring-accent/10">
            <Package className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
            Set Your Password
          </h2>
          <p className="mt-2 text-sm text-muted">
            Please create a secure password for your new account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" /> New Password
                </div>
              </label>
              <input
                {...register("password")}
                type="password"
                className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs font-medium text-danger">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" /> Confirm Password
                </div>
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs font-medium text-danger">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 text-base shadow-lg shadow-accent/20"
          >
            {loading ? "Updating..." : "Set Password & Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}
