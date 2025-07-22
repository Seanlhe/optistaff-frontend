import { Link } from "react-router-dom"

interface AuthFooterProps {
  isSignup: boolean
}

export const AuthFooter = ({ isSignup }: AuthFooterProps) => {
  return (
    <div className="space-y-4 text-center">
      {/* Toggle Mode */}
      <p className="text-sm text-slate-600">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <Link
          to={`/auth?mode=${isSignup ? "login" : "signup"}`}
          className="text-blue-600 hover:text-blue-500 font-semibold transition-colors"
        >
          {isSignup ? "Sign In" : "Sign Up"}
        </Link>
      </p>

      {/* Back to Landing */}
      <Link
        to="/"
        className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  )
}
