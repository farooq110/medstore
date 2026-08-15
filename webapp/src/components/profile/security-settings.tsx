import React from 'react'
import { Button } from '../ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { errorMessage, successMessage } from '@/src/lib/notifications'
import { authService } from '@/src/services/auth.service'
import { Loader2, Save } from 'lucide-react'

const passwordSchema = z.object({
    oldPassword: z.string().min(1, "Current password is required"),
    password: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

interface SecuritySettingsProps {
    loading: boolean
    setLoading: (loading: boolean) => void
}

const SecuritySettings = ({ loading, setLoading }: SecuritySettingsProps) => {
    type PasswordForm = z.infer<typeof passwordSchema>

    const { register: regPassword, handleSubmit: handlePassword, reset: resetPassword, formState: { errors: errorsPassword } } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    })

    const onUpdatePassword = async (data: PasswordForm) => {
        try {
            setLoading(true)
            await authService.updateProfile({ password: data.password, oldPassword: data.oldPassword })
            successMessage("Password Changed", "Your password has been updated successfully.")
            resetPassword()
        } catch (err: any) {
            errorMessage("Update Failed", err.response?.data?.message || "Incorrect current password.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handlePassword(onUpdatePassword)} className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-foreground">Security Settings</h2>
                <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
            </div>

            <div className="max-w-md space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Current Password</label>
                    <input
                        type="password"
                        {...regPassword("oldPassword")}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-accent"
                    />
                    {errorsPassword.oldPassword && <p className="text-xs text-danger">{errorsPassword.oldPassword.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">New Password</label>
                    <input
                        type="password"
                        {...regPassword("password")}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-accent"
                    />
                    {errorsPassword.password && <p className="text-xs text-danger">{errorsPassword.password.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Confirm New Password</label>
                    <input
                        type="password"
                        {...regPassword("confirmPassword")}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-accent"
                    />
                    {errorsPassword.confirmPassword && <p className="text-xs text-danger">{errorsPassword.confirmPassword.message}</p>}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : <><Save className="mr-2 h-4 w-4" /> Change Password</>}
                </Button>
            </div>
        </form>
    )
}

export default SecuritySettings
