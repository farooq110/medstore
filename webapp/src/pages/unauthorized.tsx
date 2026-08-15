import { useNavigate } from "react-router-dom"
import { ShieldX, ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/button"

export function Unauthorized() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <ShieldX className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Access Denied
        </h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          You don&apos;t have permission to access this page.
        </p>
        <Button
          onClick={() => navigate("/dashboard")}
          className="mt-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
