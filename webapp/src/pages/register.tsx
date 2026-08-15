import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../hooks/use-auth"
import { Button } from "../components/ui/button"
import { successMessage, errorMessage } from "../lib/notifications"
import { AccountStep } from "../components/register-wizard/account-step"
import { BusinessStep } from "../components/register-wizard/business-step"
import { ReviewStep } from "../components/register-wizard/review-step"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  businessName: z.string().min(2, "Business name is required"),
  country: z.string().min(1, "Please select a country"),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
})

type RegisterForm = z.infer<typeof registerSchema>

const STEPS = [
  { id: "account", title: "Account Info", description: "Let's start with your account details." },
  { id: "business", title: "Business Details", description: "Tell us about your business." },
  { id: "confirm", title: "Review & Confirm", description: "Verify your info before we proceed." },
]

export function Register() {
  const navigate = useNavigate()
  const { register: authRegister } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      businessName: "",
      country: "US",
      businessPhone: "",
      businessAddress: "",
      website: "",
    },
  })

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegisterForm)[] = []

    if (currentStep === 0) {
      fieldsToValidate = ["name", "email", "phone", "password"]
    } else if (currentStep === 1) {
      fieldsToValidate = ["businessName", "country"]
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleFinalSubmit = async () => {
    if (currentStep !== 2) return

    handleSubmit(async (data: RegisterForm) => {
      try {
        await authRegister(data)
        successMessage("Welcome to Invoice Desk", "Your business account has been created.")
      } catch (err: any) {
        errorMessage("Onboarding Failed", err.message || "Something went wrong")
      }
    })()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (currentStep < STEPS.length - 1) {
        nextStep()
      } else {
        handleFinalSubmit()
      }
    }
  }

  const formData = getValues()

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
        <div className="mx-auto w-full max-w-xl lg:w-[480px]">
          <div className="lg:hidden mb-10 flex flex-col items-center">
            <img src="/icon.svg" alt="Logo" className="h-12 w-12 mb-4" />
            <h2 className="text-2xl font-bold text-foreground">Invoice Desk</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Create account
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="relative mb-12 flex justify-between px-2">
            <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-border/50" />
            {STEPS.map((step, idx) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-500 ${idx <= currentStep
                    ? "bg-accent border-accent text-accent-foreground shadow-lg shadow-accent/20"
                    : "bg-surface border-border text-muted-foreground/50"
                    }`}
                >
                  {idx < currentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>
                <span className={`absolute -bottom-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider ${idx <= currentStep ? "text-foreground" : "text-muted-foreground/50"}`}>
                  {step.id}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-surface/50 rounded-3xl border border-border/50 p-8 shadow-sm backdrop-blur-sm">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-foreground">
                {STEPS[currentStep].title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {STEPS[currentStep].description}
              </p>
            </div>

            <div onKeyDown={handleKeyDown} className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentStep === 0 && <AccountStep register={register} errors={errors} />}
                  {currentStep === 1 && <BusinessStep register={register} errors={errors} />}
                  {currentStep === 2 && <ReviewStep formData={formData} />}
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-4 pt-4 border-t border-border/50">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-12 rounded-xl text-sm font-bold transition-all"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                )}

                {currentStep < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-2 h-12 rounded-xl bg-accent text-accent-foreground font-bold shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="flex-2 h-12 rounded-xl bg-accent text-accent-foreground font-bold shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Complete Registration <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-10 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              By signing in, you agree to our <br />
              <Link to="/privacy-policy" className="underline hover:text-accent transition-colors">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
