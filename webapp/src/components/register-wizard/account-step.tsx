import { User, Mail, Phone, Lock } from "lucide-react"
import { UseFormRegister, FieldErrors } from "react-hook-form"

interface AccountStepProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

export function AccountStep({ register, errors }: AccountStepProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {/* Full Name */}
      <div className="space-y-1.5 sm:col-span-2">
        <label className="block text-sm font-semibold text-foreground/80 ml-1">
          Full Name
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors">
            <User className="h-4.5 w-4.5" />
          </div>
          <input
            {...register("name")}
            className="block w-full rounded-xl border border-border/50 bg-surface pl-11 pr-3 py-3 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 placeholder:text-muted-foreground/50"
            placeholder="John Doe"
          />
        </div>
        {errors.name && (
          <p className="mt-1 ml-1 text-xs font-medium text-danger">
            {errors.name.message as string}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5 sm:col-span-2">
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
            className="block w-full rounded-xl border border-border/50 bg-surface pl-11 pr-3 py-3 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 placeholder:text-muted-foreground/50"
            placeholder="john@example.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 ml-1 text-xs font-medium text-danger">
            {errors.email.message as string}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-foreground/80 ml-1">
          Phone Number
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors">
            <Phone className="h-4.5 w-4.5" />
          </div>
          <input
            {...register("phone")}
            className="block w-full rounded-xl border border-border/50 bg-surface pl-11 pr-3 py-3 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 placeholder:text-muted-foreground/50"
            placeholder="+1 234 567 890"
          />
        </div>
        {errors.phone && (
          <p className="mt-1 ml-1 text-xs font-medium text-danger">
            {errors.phone.message as string}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-foreground/80 ml-1">
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors">
            <Lock className="h-4.5 w-4.5" />
          </div>
          <input
            {...register("password")}
            type="password"
            className="block w-full rounded-xl border border-border/50 bg-surface pl-11 pr-3 py-3 text-sm shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 placeholder:text-muted-foreground/50"
            placeholder="••••••••"
          />
        </div>
        {errors.password && (
          <p className="mt-1 ml-1 text-xs font-medium text-danger">
            {errors.password.message as string}
          </p>
        )}
      </div>
    </div>
  )
}
