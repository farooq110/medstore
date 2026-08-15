import { toast } from "sonner"

export const successMessage = (message: string, description?: string) => {
  toast.success(message, {
    description,
  })
}

export const errorMessage = (message: string, description?: string) => {
  toast.error(message, {
    description,
  })
}

export const customMessage = (message: string, description?: string) => {
  toast(message, {
    description,
  })
}
