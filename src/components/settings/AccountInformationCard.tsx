import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { User, Settings, Lock } from 'lucide-react';
import { AccountInformationCardProps } from '../../types/components';

const AccountInformationCard = ({ userInfo, onPasswordChangeClick }: AccountInformationCardProps) => {
  return (
    <Card className="bg-card-color border border-border rounded-xl shadow-lg">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-montserrat-smb text-primary-text flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary-blue" />
          Account Information
        </h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary-bg rounded-lg">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-montserrat-smb text-primary-text">
              <User className="h-4 w-4" />
              User ID
            </Label>
            <p className="text-sm font-mono bg-card-color p-2 rounded border border-border text-primary-text">
              {userInfo.userId}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-montserrat-smb text-primary-text">Member Since</Label>
            <p className="text-sm text-primary-text">{new Date(userInfo.memberSince).toLocaleDateString()}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-montserrat-smb text-primary-text">Email Address</Label>
            <p className="text-sm text-primary-text">{userInfo.email}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-montserrat-smb text-primary-text">Last Login</Label>
            <p className="text-sm text-primary-text">{new Date(userInfo.lastLogin).toLocaleString()}</p>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary-blue" />
              <span className="font-montserrat-smb text-primary-text">Password</span>
            </div>
            <p className="text-sm text-secondary-text">
              Last changed 3 months ago
            </p>
          </div>
          
          <Button 
            type="button"
            onClick={onPasswordChangeClick}
            className="px-4 py-2 bg-primary-blue text-white hover:bg-primary-blue/80 rounded-lg font-montserrat"
          >
            Change Password
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AccountInformationCard;
