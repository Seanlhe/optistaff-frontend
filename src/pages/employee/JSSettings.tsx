import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Edit, Save, Star, MapPin, Mail, Phone, Lock } from 'lucide-react';
import PasswordChangeModal from '../../components/settings/PasswordChange';

const JSSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
    zipcode: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProfileImage = () => {
    const fileInput = document.getElementById("profileImageInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Add save logic here
  };

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary-text">Profile Settings</h1>
          <p className="text-secondary-text">Manage your personal information and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Stats Card */}
          <Card>
            <CardContent className="p-6">
              
              <div className="text-center space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-primary-text">Profile</h3>
                </div>
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-35 h-35 flex items-center justify-center bg-gray-200 rounded-full">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-xl font-semibold text-gray-500"></span>
                    )}
                  </div>
                  <input
                    id="profileImageInput"
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button onClick={handleAddProfileImage} variant="outline" size="sm">
                    Add Profile Image
                  </Button>
                  <div>
                    <h3 className="text-xl font-semibold text-primary-text">Alex Johnson</h3>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary-text">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.8</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary-text">Shifts Completed</span>
                    <span className="font-medium">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary-text">Member Since</span>
                    <span className="font-medium">Jan 2023</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary-text">Personal Information</h3>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save Details
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-secondary-text">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder=""
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                      className="bg-input/50 text-primary-text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-secondary-text">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder=""
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditing}
                      className="bg-input/50 text-primary-text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2 text-secondary-text">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      placeholder=""
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      disabled={!isEditing}
                      className="bg-input/50 text-primary-text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipcode" className="flex items-center gap-2 text-secondary-text">
                      <MapPin className="h-4 w-4" />
                      Zip Code
                    </Label>
                    <Input
                      id="zipcode"
                      placeholder=""
                      value={formData.zipcode}
                      onChange={(e) => handleInputChange("zipcode", e.target.value)}
                      disabled={!isEditing}
                      className="bg-input/50 text-primary-text"
                    />
                  </div>

                </div>
                

                

                {/* Password Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-secondary-text" />
                      <div>
                        <h4 className="font-medium text-primary-text">Password</h4>
                        <p className="text-sm text-secondary-text">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        passwordData={formData}
        passwordErrors={{}} // Add error handling logic here
        onPasswordChange={handleInputChange}
        onSubmit={async (e: React.FormEvent) => {
          e.preventDefault();
          // Add submit logic here
          setIsPasswordModalOpen(false);
        }}
        isLoading={false} // Add loading state logic here
      />
    </div>
  );
};

export default JSSettings;
