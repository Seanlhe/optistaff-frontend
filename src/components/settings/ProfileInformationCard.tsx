import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User, Phone, MapPin, Mail, CreditCard, AlertCircle } from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import { ProfileInformationCardProps } from '../../types/components';

const ProfileInformationCard = ({
  formData,
  validationErrors,
  onInputChange,
  onVerifyEmail,
  onVerifyPhone,
}: ProfileInformationCardProps) => {
  return (
    <Card className="bg-card-color border border-border rounded-xl shadow-lg">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-montserrat-smb text-primary-text flex items-center gap-2">
          <User className="h-5 w-5 text-primary-blue" />
          Profile Information
        </h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-primary-text font-montserrat">
              First Name *
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('firstName', e.target.value)}
              placeholder="Enter your first name"
              className={`border ${validationErrors.firstName ? 'border-red-500' : 'border-border'} bg-card-color text-primary-text rounded-lg`}
            />
            {validationErrors.firstName && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.firstName}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-primary-text font-montserrat">
              Last Name *
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('lastName', e.target.value)}
              placeholder="Enter your last name"
              className={`border ${validationErrors.lastName ? 'border-red-500' : 'border-border'} bg-card-color text-primary-text rounded-lg`}
            />
            {validationErrors.lastName && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 text-primary-text font-montserrat">
            <Mail className="h-4 w-4 text-primary-blue" />
            Email Address *
          </Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              className={`flex-1 border ${validationErrors.email ? 'border-red-500' : 'border-border'} bg-card-color text-primary-text rounded-lg`}
            />
            <VerificationBadge
              isVerified={formData.isEmailVerified}
              onVerify={onVerifyEmail}
            />
          </div>
          {validationErrors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="flex items-center gap-2 text-primary-text font-montserrat">
            <Phone className="h-4 w-4 text-primary-blue" />
            Phone Number *
          </Label>
          <div className="flex gap-2">
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('phoneNumber', e.target.value)}
              placeholder="+65 1234 5678"
              className={`flex-1 border ${validationErrors.phoneNumber ? 'border-red-500' : 'border-border'} bg-card-color text-primary-text rounded-lg`}
            />
            <VerificationBadge
              isVerified={formData.isPhoneVerified}
              onVerify={onVerifyPhone}
            />
          </div>
          {validationErrors.phoneNumber && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.phoneNumber}
            </p>
          )}
        </div>

        {/* NRIC Field - Read Only
        <div className="space-y-2">
          <Label htmlFor="nric" className="flex items-center gap-2 text-primary-text font-montserrat">
            <CreditCard className="h-4 w-4 text-primary-blue" />
            NRIC
          </Label>
          <Input
            id="nric"
            value={formData.nric}
            placeholder="S1234567A"
            disabled
            className="bg-secondary-bg cursor-not-allowed border border-border text-secondary-text rounded-lg"
          />
          <p className="text-sm text-secondary-text">
            NRIC cannot be changed. Contact support if this information is incorrect.
          </p>
        </div> */}

        {/* Address Field */}
        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2 text-primary-text font-montserrat">
            <MapPin className="h-4 w-4 text-primary-blue" />
            Address
          </Label>
          <textarea
            id="address"
            value={formData.address}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onInputChange('address', e.target.value)}
            placeholder="Enter your full address"
            rows={3}
            className="w-full p-3 border border-border bg-card-color text-primary-text rounded-lg resize-none"
          />
        </div>

        {/* Payment Method Field */}
        <div className="space-y-2">
          <Label htmlFor="paymentMethod" className="flex items-center gap-2 text-primary-text font-montserrat">
            <CreditCard className="h-4 w-4 text-primary-blue" />
            Payment Method
          </Label>
          <select
            value={formData.paymentMethod}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onInputChange('paymentMethod', e.target.value)}
            className="w-full p-3 border border-border bg-card-color text-primary-text rounded-lg"
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="paypal">PayPal</option>
            <option value="direct_deposit">Direct Deposit</option>
            <option value="check">Check</option>
          </select>
        </div>
      </div>
    </Card>
  );
};

export default ProfileInformationCard;
