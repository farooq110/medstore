import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useCreateUser, useUpdateUser } from "../../hooks/use-users"
import { Modal } from "../ui/modal"
import { Button } from "../ui/button"
import { User, USER_ROLES } from "../../types"
import { Loader2, Mail, Phone, User as UserIcon, Shield, Lock } from "lucide-react"
import { cn } from "../../lib/utils"
import { errorMessage } from "@/src/lib/notifications"

interface UserFormValues {
  name: string
  email: string
  phone: string
  role: USER_ROLES
  password?: string
  isActive?: boolean
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

export function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>()

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      })
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        role: USER_ROLES.SALES_PERSON,
        password: ""
      })
    }
  }, [user, isOpen, reset])

  const onSubmit = async (data: UserFormValues) => {
    try {
      if (user) {
        await updateUser.mutateAsync({ id: user._id, data })
      } else {
        await createUser.mutateAsync(data)
      }
      onClose()
    } catch (error) {
      // errorMessage(error)
      console.log("Failed to save user:", error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? "Edit User Profile" : "Create New User"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <UserIcon className="h-3.5 w-3.5" /> Full Name
            </label>
            <input
              {...register("name", { required: "Full name is required" })}
              placeholder="John Doe"
              className={cn(
                "w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary",
                errors.name ? "border-danger ring-danger/10" : "border-border"
              )}
            />
            {errors.name && <p className="text-[10px] font-bold text-danger">{errors.name.message}</p>}
          </div>

          <div className="flex gap-1 justify-between">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> Email Address
              </label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                placeholder="john@example.com"
                className={cn(
                  "w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary",
                  errors.email ? "border-danger ring-danger/10" : "border-border"
                )}
              />
              {errors.email && <p className="text-[10px] font-bold text-danger">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> Phone
              </label>
              <input
                {...register("phone", { required: "Phone is required" })}
                placeholder="+92..."
                className={cn(
                  "w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary",
                  errors.phone ? "border-danger ring-danger/10" : "border-border"
                )}
              />
            </div>
          </div>

          {!user && (
            <div className="grid gap-2 pt-2 border-t border-border">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" /> Initial Password
              </label>
              <input
                type="password"
                {...register("password", { required: "Password is required for new users" })}
                placeholder="••••••••"
                className={cn(
                  "w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary",
                  errors.password ? "border-danger ring-danger/10" : "border-border"
                )}
              />
              {errors.password && <p className="text-[10px] font-bold text-danger">{errors.password.message}</p>}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" type="button" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={createUser.isPending || updateUser.isPending}>
            {createUser.isPending || updateUser.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              user ? "Update User" : "Create User"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
