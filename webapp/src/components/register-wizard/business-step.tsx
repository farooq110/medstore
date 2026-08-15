import { Building2, Globe, Phone, MapPin, Link as LinkIcon, ChevronDown } from "lucide-react"
import { UseFormRegister, FieldErrors } from "react-hook-form"
import { COUNTRIES } from "../../constants/stripe"

interface BusinessStepProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

export function BusinessStep({ register, errors }: BusinessStepProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {/* Business Name */}
      <div className="space-y-1.5 sm:col-span-2">
        <label className="block text-sm font-semibold text-foreground/80 ml-1">
          Business Name
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <input
            {...register("businessName")}
            className="block w-full rounded-xl border border-border/50 bg-surface pl-11 pr-3 py-3 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 placeholder:text-muted-foreground/50"
            placeholder="Acme Corp"
          />
        </div>
        {errors.businessName && (
          <p className="mt-1 ml-1 text-xs font-medium text-danger">
            {errors.businessName.message as string}
          </p>
        )}
      </div>

      {/* Country */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-foreground/80 ml-1">
          Country
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors">
            <Globe className="h-4.5 w-4.5" />
          </div>
          <select
            {...register("country")}
            className="appearance-none block w-full rounded-xl border border-border/50 bg-surface pl-11 pr-10 py-3 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-muted-foreground">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Business Phone */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-foreground/80 ml-1">
          Business Phone
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors">
            <Phone className="h-4.5 w-4.5" />
          </div>
          <input
            {...register("businessPhone")}
            className="block w-full rounded-xl border border-border/50 bg-surface pl-11 pr-3 py-3 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 placeholder:text-muted-foreground/50"
            placeholder="Same as account"
          />
        </div>
      </div>

      {/* Business Address */}
      <div className="space-y-1.5 sm:col-span-2">
        <label className="block text-sm font-semibold text-foreground/80 ml-1">
          Business Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors">
            <MapPin className="h-4.5 w-4.5" />
          </div>
          <input
            {...register("businessAddress")}
            className="block w-full rounded-xl border border-border/50 bg-surface pl-11 pr-3 py-3 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 placeholder:text-muted-foreground/50"
            placeholder="123 Street Name"
          />
        </div>
      </div>

      {/* Website */}
      <div className="space-y-1.5 sm:col-span-2">
        <label className="block text-sm font-semibold text-foreground/80 ml-1">
          Website (optional)
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors">
            <LinkIcon className="h-4.5 w-4.5" />
          </div>
          <input
            {...register("website")}
            className="block w-full rounded-xl border border-border/50 bg-surface pl-11 pr-3 py-3 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 placeholder:text-muted-foreground/50"
            placeholder="https://example.com"
          />
        </div>
        {errors.website && (
          <p className="mt-1 ml-1 text-xs font-medium text-danger">
            {errors.website.message as string}
          </p>
        )}
      </div>
    </div>
  )
}
