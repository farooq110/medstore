import { CheckCircle2, User, Building2 } from "lucide-react"
import { COUNTRIES } from "../../constants/stripe"

interface ReviewStepProps {
  formData: any
}

export function ReviewStep({ formData }: ReviewStepProps) {
  const countryName = COUNTRIES.find(c => c.code === formData.country)?.name

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/50 bg-background/30 p-6 space-y-8 divide-y divide-border/30">
        {/* Personal Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest">
            <User className="h-3.5 w-3.5" />
            <span>Personal Profile</span>
          </div>
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Full Name</p>
              <p className="text-sm font-semibold text-foreground">{formData.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Email Address</p>
              <p className="text-sm font-semibold text-foreground truncate">{formData.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Phone Number</p>
              <p className="text-sm font-semibold text-foreground">{formData.phone}</p>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="pt-8 space-y-4">
          <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest">
            <Building2 className="h-3.5 w-3.5" />
            <span>Business Entity</span>
          </div>
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Legal Name</p>
              <p className="text-sm font-semibold text-foreground">{formData.businessName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Registration Country</p>
              <p className="text-sm font-semibold text-foreground">{countryName}</p>
            </div>
            {formData.website && (
              <div className="space-y-1 sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Official Website</p>
                <p className="text-sm font-semibold truncate text-accent underline underline-offset-4 decoration-accent/30">{formData.website}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
