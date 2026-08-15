import { useState, useEffect } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { Check, ArrowRight, Package } from "lucide-react"
import { useAuth } from "../hooks/use-auth"
import { Button } from "../components/ui/button"
import { stripeService } from "../services/stripe.service"
import { Plan } from "../types"
import { errorMessage } from "../lib/notifications"

export function Plans() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.subscriptionStatus === "active") {
    return <Navigate to="/dashboard" replace />
  }

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await stripeService.getPlans()
        setPlans(response.data)
        if (response.data.length > 0) {
          setSelectedPlan(response.data[0]._id)
        }
      } catch (err: any) {
        errorMessage("Failed to load plans", err.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const handleSubscribe = async () => {
    if (!selectedPlan) return

    setIsProcessing(true)
    try {
      const response = await stripeService.createCheckoutSession(selectedPlan)

      // Note: we didn't use navigate function here because we are redirecting to an external site (stripe)
      window.location.href = response.data.url
    } catch (err: any) {
      errorMessage("Checkout Failed", err.message || "Could not initiate checkout")
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted font-medium">Loading available plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-lg ring-4 ring-accent/10 mb-6">
            <Package className="h-7 w-7" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-muted max-w-xl mx-auto">
            Select the subscription tier that best fits your business needs. 
            Billing is optimized for {user.country}.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center p-8 bg-surface rounded-2xl shadow-sm border border-border">
            <p className="text-muted">No plans currently available for your region.</p>
            <Button className="mt-4" onClick={() => navigate("/dashboard")} variant="outline">
              Continue to Dashboard
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan._id
              return (
                <div
                  key={plan._id}
                  onClick={() => setSelectedPlan(plan._id)}
                  className={`relative cursor-pointer rounded-2xl p-8 transition-all duration-200 border-2 ${
                    isSelected
                      ? "border-accent bg-surface shadow-xl ring-4 ring-accent/10 scale-[1.02]"
                      : "border-border bg-surface hover:border-accent/50 shadow-sm"
                  }`}
                >
                  <div className="absolute top-6 right-6">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border border-border transition-colors ${
                        isSelected ? "bg-accent border-accent" : "bg-background"
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4 text-accent-foreground" />}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-foreground">
                      {plan.tier}
                    </h3>
                    <p className="mt-2 text-sm text-muted">
                      Best for {plan.tier === "Basic" ? "small clinics" : "growing businesses"}
                    </p>
                  </div>

                  <div className="mb-8 flex items-baseline">
                    <span className="text-4xl font-extrabold text-foreground tracking-tight">
                      {plan.currency.toUpperCase()} {plan.price.toLocaleString()}
                    </span>
                    <span className="ml-2 text-muted font-medium">/ month</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent shrink-0" />
                      <span className="text-sm text-foreground">Full POS System Access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent shrink-0" />
                      <span className="text-sm text-foreground">Unlimited Invoices</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className={`h-5 w-5 shrink-0 ${plan.tier === "Pro" ? "text-accent" : "text-muted/30"}`} />
                      <span className={`text-sm ${plan.tier === "Pro" ? "text-foreground font-medium" : "text-muted"}`}>
                        Advanced Reporting & Analytics
                      </span>
                    </li>
                  </ul>
                </div>
              )
            })}
          </div>
        )}

        {plans.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Button
              onClick={handleSubscribe}
              disabled={isProcessing || !selectedPlan}
              className="py-6 px-12 text-lg font-bold shadow-lg min-w-[280px]"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}