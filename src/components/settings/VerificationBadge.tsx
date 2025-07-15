import { Button } from '../ui/button';
import { CheckCircle } from 'lucide-react';
import { VerificationBadgeProps } from '../../types/components';

const VerificationBadge = ({ isVerified, onVerify }: VerificationBadgeProps) => {
  if (isVerified) {
    return (
      <div className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Verified
      </div>
    );
  }

  return (
    <Button 
      type="button" 
      onClick={onVerify}
      className="px-3 py-1 text-sm bg-primary-blue text-white hover:bg-primary-blue/80 rounded-lg"
    >
      Verify
    </Button>
  );
};

export default VerificationBadge;
