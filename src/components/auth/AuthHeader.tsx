import { Link } from "react-router-dom"

interface AuthHeaderProps {
  isSignup: boolean
}

export const AuthHeader = ({ isSignup }: AuthHeaderProps) => {
  return (
    <div className="text-center space-y-4 mb-8">
      <Link
        to="/"
        className="text-4xl font-bold text-primary-text hover:text-secondary-text transition-colors"
      >
        OptiStaff
      </Link>
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-primary-text">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-secondary-text">
          {isSignup ? "Sign up for OptiStaff" : "Sign in to your account"}
        </p>
      </div>
    </div>
  )
}
