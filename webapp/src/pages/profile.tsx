import { useState } from "react"
import { User as UserIcon, Lock, Building } from "lucide-react"
import { useAuth } from "../hooks/use-auth"
import { cn } from "../lib/utils"
import { USER_ROLES } from "../constants/roles"
import PersonalInfo from "../components/profile/personal-info"
import SecuritySettings from "../components/profile/security-settings"
import BusinessProfile from "../components/profile/business-profile"

export function Profile() {
  const { user, setUser } = useAuth()
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "business">("personal")
  const [loading, setLoading] = useState(false)

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and business preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          <button
            onClick={() => setActiveTab("personal")}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap cursor-pointer",
              activeTab === "personal" 
                ? "bg-accent text-accent-foreground shadow-sm shadow-accent/20" 
                : "text-muted-foreground hover:bg-accent/5 hover:text-accent"
            )}
          >
            <UserIcon className="h-4 w-4" /> Personal Info
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap cursor-pointer",
              activeTab === "security" 
                ? "bg-accent text-accent-foreground shadow-sm shadow-accent/20" 
                : "text-muted-foreground hover:bg-accent/5 hover:text-accent"
            )}
          >
            <Lock className="h-4 w-4" /> Security
          </button>
          {user?.role === USER_ROLES.OWNER && (
            <button
              onClick={() => setActiveTab("business")}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap cursor-pointer",
                activeTab === "business" 
                  ? "bg-accent text-accent-foreground shadow-sm shadow-accent/20" 
                  : "text-muted-foreground hover:bg-accent/5 hover:text-accent"
              )}
            >
              <Building className="h-4 w-4" /> Business Profile
            </button>
          )}
        </aside>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            {activeTab === "personal" && (
              <PersonalInfo user={user} setUser={setUser} loading={loading} setLoading={setLoading} />
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <SecuritySettings loading={loading} setLoading={setLoading} />
            )}

            {/* Business Tab */}
            {activeTab === "business" && user?.role === USER_ROLES.OWNER && (
              <BusinessProfile user={user} setUser={setUser} loading={loading} setLoading={setLoading} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}