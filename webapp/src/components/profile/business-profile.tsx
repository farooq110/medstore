import React from 'react'
import { Button } from '../ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Business, User } from '@/src/types'
import z from 'zod'
import { errorMessage, successMessage } from '@/src/lib/notifications'
import { authService } from '@/src/services/auth.service'
import { Building, Globe, Loader2, MapPin, Phone, Save } from 'lucide-react'

const businessSchema = z.object({
    name: z.string().min(2, "Business name is too short"),
    phone: z.string().optional(),
    address: z.string().optional(),
    website: z.string().url("Invalid website URL").optional().or(z.literal("")),
    country: z.string().min(2, "Country is required"),
})

interface BusinessProfileProps {
    user: User
    setUser: (user: User) => void
    loading: boolean
    setLoading: (loading: boolean) => void
}

const BusinessProfile = ({ user, setUser, loading, setLoading }: BusinessProfileProps) => {
    type BusinessForm = z.infer<typeof businessSchema>

    const business = user?.business as Business

    const { register: regBusiness, handleSubmit: handleBusiness, formState: { errors: errorsBusiness, isDirty } } = useForm<BusinessForm>({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            name: business?.name || "",
            phone: business?.phone || "",
            address: business?.address || "",
            website: business?.website || "",
            country: business?.country || "",
        }
    })

    const onUpdateBusiness = async (data: BusinessForm) => {
        try {
            setLoading(true)
            const res = await authService.updateBusiness(data)
            setUser({ ...user!, business: res.data })
            successMessage("Business Updated", "Business settings have been saved.")
        } catch (err: any) {
            errorMessage("Update Failed", err.response?.data?.message || "Failed to update business.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleBusiness(onUpdateBusiness)} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-foreground">Business Profile</h2>
                    <p className="text-sm text-muted-foreground">This info appears on your invoices and shared links.</p>
                </div>
                <div className="relative">
                    <div className="h-16 w-16 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                        {business?.logo ? <img src={business.logo} className="h-full w-full object-cover rounded-xl" /> : <Building className="h-8 w-8 text-accent" />}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Business Name</label>
                    <input
                        {...regBusiness("name")}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-accent"
                    />
                    {errorsBusiness.name && <p className="text-xs text-danger">{errorsBusiness.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            {...regBusiness("phone")}
                            className="w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-accent"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Website</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            {...regBusiness("website")}
                            placeholder="https://example.com"
                            className="w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-accent"
                        />
                    </div>
                    {errorsBusiness.website && <p className="text-xs text-danger">{errorsBusiness.website.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Country / Region</label>
                    <input
                        {...regBusiness("country")}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-accent"
                    />
                </div>
                <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-foreground">Business Address</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <textarea
                            {...regBusiness("address")}
                            rows={3}
                            className="w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-accent"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" disabled={loading || !isDirty}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Update Business</>}
                </Button>
            </div>
        </form>
    )
}

export default BusinessProfile
