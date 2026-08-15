import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Mail, Package, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { authService } from "../services/auth.service"
import { errorMessage } from "../lib/notifications"

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
})

type ForgotForm = z.infer<typeof forgotSchema>

export function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: ForgotForm) => {
    try {
      setLoading(true)
      await authService.forgotPassword(data.email)
      setIsSubmitted(true)
    } catch (err: any) {
      errorMessage("Request Failed", err.response?.data?.message || "An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md text-center space-y-6 rounded-2xl bg-surface p-8 shadow-xl ring-1 ring-border">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Check your email
          </h2>
          <p className="text-muted leading-relaxed">
            If an account exists for that email, we've sent instructions to reset your password.
          </p>
          <div className="pt-4">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-surface p-8 shadow-xl ring-1 ring-border">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-lg ring-4 ring-accent/10">
            <Package className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-muted max-w-xs">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </div>
              </label>
              <input
                {...register("email")}
                type="email"
                className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="name@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs font-medium text-danger">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-base shadow-lg shadow-accent/20"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
