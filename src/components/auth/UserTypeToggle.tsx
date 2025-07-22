import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

interface UserTypeToggleProps {
  userType: "jobseeker" | "employer"
  setUserType: (type: "jobseeker" | "employer") => void
}

export const UserTypeToggle = ({ userType, setUserType }: UserTypeToggleProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-slate-700">
        I am a...
      </label>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setUserType("jobseeker")}
          className={cn(
            "h-12 text-sm font-semibold transition-all",
            userType === "jobseeker" && "border-blue-500 bg-blue-50 text-blue-600"
          )}
        >
          🔍 Job Seeker
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setUserType("employer")}
          className={cn(
            "h-12 text-sm font-semibold transition-all",
            userType === "employer" && "border-green-500 bg-green-50 text-green-600"
          )}
        >
          🏢 Employer
        </Button>
      </div>
    </div>
  )
}
