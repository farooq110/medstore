import React from 'react'
import { Button } from '../ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@/src/types'
import z from 'zod'
import { errorMessage, successMessage } from '@/src/lib/notifications'
import { authService } from '@/src/services/auth.service'
import { Loader2, Mail, Phone, Save } from 'lucide-react'

const profileSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    phone: z.string().min(7, "Phone number is invalid"),
})

interface PersonalInfoProps {
    user: User
    setUser: (user: User) => void
    loading: boolean
    setLoading: (loading: boolean) => void
}

const PersonalInfo = ({ user, setUser, loading, setLoading }: PersonalInfoProps) => {
    type ProfileForm = z.infer<typeof profileSchema>

    const { register: regProfile, handleSubmit: handleProfile, formState: { errors: errorsProfile, isDirty } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            phone: user?.phone || "",
        }
    })

    const onUpdateProfile = async (data: ProfileForm) => {
        try {
            setLoading(true)
            const res = await authService.updateProfile(data)
            setUser({ ...user!, ...res.data })
            successMessage("Profile Updated", "Your personal information has been saved.")
        } catch (err: any) {
            errorMessage("Update Failed", err.response?.data?.message || "Failed to update profile.")
        } finally {
            setLoading(false)
        }
    }
    return (
        <form onSubmit={handleProfile(onUpdateProfile)} className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
                <p className="text-sm text-muted-foreground">Manage your display name and contact details.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Full Name</label>
                    <input
                        {...regProfile("name")}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-accent"
                    />
                    {errorsProfile.name && <p className="text-xs text-danger">{errorsProfile.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Email Address</label>
                    <div className="flex h-10 w-full items-center rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                        <Mail className="mr-2 h-4 w-4" /> {user?.email}
                    </div>
                    <p className="text-[10px] text-muted-primary italic">Email address cannot be changed.</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            {...regProfile("phone")}
                            className="w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-accent"
                        />
                    </div>
                    {errorsProfile.phone && <p className="text-xs text-danger">{errorsProfile.phone.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Account Role</label>
                    <div className="flex h-10 items-center px-4 rounded-lg bg-surface-dark/50 border border-border lowercase italic opacity-70">
                        {user?.role.replace("_", " ")}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" disabled={loading || !isDirty}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                </Button>
            </div>
        </form>
    )
}

export default PersonalInfo