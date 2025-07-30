import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface UserTypeToggleProps {
  userType: "jobseeker" | "employer";
  setUserType: (type: "jobseeker" | "employer") => void;
}

export const UserTypeToggle = ({
  userType,
  setUserType,
}: UserTypeToggleProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-montserrat-smb text-primary-text">
        I am a...
      </label>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setUserType("jobseeker")}
          className={cn(
            "h-12 text-sm font-montserrat-smb transition-all border-2",
            userType === "jobseeker"
              ? "border-primary-blue bg-primary-blue/10 text-primary-blue shadow-md"
              : "border-border hover:border-primary-blue/50 hover:bg-primary-blue/5",
          )}
        >
          🔍 Job Seeker
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setUserType("employer")}
          className={cn(
            "h-12 text-sm font-montserrat-smb transition-all border-2",
            userType === "employer"
              ? "border-green bg-green/10 text-green-dark shadow-md"
              : "border-border hover:border-green/50 hover:bg-green/5",
          )}
        >
          🏢 Employer
        </Button>
      </div>
    </div>
  );
};
