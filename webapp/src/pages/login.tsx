import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ShieldCheck, ArrowRight, Mail, Lock, Loader2 } from "lucide-react"
import { useAuth } from "../hooks/use-auth"
import { Button } from "../components/ui/button"
import { successMessage, errorMessage } from "../lib/notifications"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password)
      successMessage("Welcome Back", "Signed in successfully.")
      navigate("/dashboard")
    } catch (err: any) {
      errorMessage("Authentication Failed", err.response?.data?.message || "Something went wrong")
    }
  }

  return (
    <div className="flex min-h-screen bg-background font-sans selection:bg-accent/30 selection:text-accent">
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0d9488_1px,transparent_1px)] bg-size-[20px_20px]"></div>
          <div className="absolute top-0 -left-20 w-96 h-96 bg-accent/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-primary-foreground">
            <div className="flex items-center gap-3">
              <img src="/icon.svg" alt="Invoice Desk" className="h-10 w-10" />
              <span className="text-2xl font-bold tracking-tight">Invoice Desk</span>
            </div>
            
            <div className="max-w-md">
              <h1 className="text-5xl font-extrabold leading-tight tracking-tighter">
                Less Paperwork. <br />
                <span className="text-accent italic">More Business.</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/70 leading-relaxed">
                Stay on top of your business finances with real-time alerts and smart invoice tracking.
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-primary-foreground/50">
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="lg:hidden mb-10 flex flex-col items-center">
            <img src="/icon.svg" alt="Logo" className="h-12 w-12 mb-4" />
            <h2 className="text-2xl font-bold text-foreground">Invoice Desk</h2>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Welcome back
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              New to Invoice Desk?{" "}
              <Link
                to="/register"
                className="font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-foreground/80 ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <input
                      {...register("email")}
                      type="email"
                      className="block w-full rounded-xl border border-border bg-surface pl-11 pr-3 py-3 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 placeholder:text-muted-foreground/50"
                      placeholder="name@company.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 ml-1 text-xs font-medium text-danger">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="block text-sm font-semibold text-foreground/80">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors">
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                    <input
                      {...register("password")}
                      type="password"
                      className="block w-full rounded-xl border border-border bg-surface pl-11 pr-3 py-3 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 placeholder:text-muted-foreground/50"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 ml-1 text-xs font-medium text-danger">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground text-base font-bold shadow-lg shadow-accent/20 hover:bg-accent/90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-10 pt-10 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                By signing in, you agree to our <br />
                <Link to="/privacy-policy" className="underline hover:text-accent transition-colors">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
