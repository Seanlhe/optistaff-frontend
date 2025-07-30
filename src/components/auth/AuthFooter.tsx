import { Link } from "react-router-dom";

interface AuthFooterProps {
  isSignup: boolean;
}

export const AuthFooter = ({ isSignup }: AuthFooterProps) => {
  return (
    <div className="space-y-4 text-center">
      {/* Toggle Mode */}
      <p className="text-sm text-secondary-text">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <Link
          to={`/auth?mode=${isSignup ? "login" : "signup"}`}
          className="text-primary-blue hover:text-primary-blue/80 font-montserrat-smb transition-colors"
        >
          {isSignup ? "Sign In" : "Sign Up"}
        </Link>
      </p>

      {/* Back to Landing */}
      <Link
        to="/"
        className="text-sm text-secondary-text hover:text-primary-text transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  );
};
