import { Card, CardHeader, CardTitle, Button, Avatar, Input, Textarea } from "../Shad";
import { useState, useEffect } from "react";
import { X, Upload, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { editProfile, checkUsernameAvailability } from "../../api/authService";

interface UpdateProfileForm {
  isOpen: boolean;
  onClose: () => void;
  editRef: React.RefObject<HTMLButtonElement | null>;
  user?: {
    id: string;
    name?: string;
    username?: string;
    bio?: string;
    location?: string;
    website?: string;
    avatar?: string;
  };
  onProfileUpdate?: (updatedUser: any) => void;
}

interface UsernameStatus {
  isChecking: boolean;
  isAvailable: boolean | null;
  error: string | null;
}

export const ProfileUpdate: React.FC<UpdateProfileForm> = ({ 
  isOpen, 
  onClose, 
  editRef, 
  user,
  onProfileUpdate 
}) => {
  const [name, setName] = useState<string>(user?.name || '');
  const [username, setUsername] = useState<string>(user?.username || '');
  const [bio, setBio] = useState<string>(user?.bio || '');
  const [location, setLocation] = useState<string>(user?.location || '');
  const [website, setWebsite] = useState<string>(user?.website || '');
  const [avatar, setAvatar] = useState<string>(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>({
    isChecking: false,
    isAvailable: null,
    error: null
  });

  // Reset form when user data changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setWebsite(user.website || '');
      setAvatar(user.avatar || '');
      setError('');
      setUsernameStatus({
        isChecking: false,
        isAvailable: null,
        error: null
      });
    }
  }, [isOpen, user]);

  // Debounce username checking
  useEffect(() => {
    if (!username.trim() || username === user?.username) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: null,
        error: null
      });
      return;
    }

    const timeoutId = setTimeout(async () => {
      await checkUsername(username);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, user?.username]);

  const checkUsername = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        error: 'Username must be at least 3 characters long'
      });
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(usernameToCheck)) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        error: 'Username can only contain letters, numbers, hyphens, and underscores'
      });
      return;
    }

    setUsernameStatus({
      isChecking: true,
      isAvailable: null,
      error: null
    });

    try {
      const isAvailable = await checkUsernameAvailability(usernameToCheck);
      setUsernameStatus({
        isChecking: false,
        isAvailable,
        error: null
      });
    } catch (error) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        error: 'Error checking username availability'
      });
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError('User ID is missing');
      return;
    }

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username !== user.username && (!usernameStatus.isAvailable || usernameStatus.isAvailable === null)) {
      setError('Please choose an available username');
      return;
    }

    if (website && !isValidUrl(website)) {
      setError('Please enter a valid website URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedProfile = {
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
        avatar
      };

      const result = await editProfile(user.id, updatedProfile);
      
      console.log('Profile updated successfully:', result);
      
      // Call the callback to update parent component
      if (onProfileUpdate) {
        onProfileUpdate({ ...user, ...updatedProfile });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setUsername(user?.username || '');
    setBio(user?.bio || '');
    setLocation(user?.location || '');
    setWebsite(user?.website || '');
    setAvatar(user?.avatar || '');
    setError('');
    setUsernameStatus({
      isChecking: false,
      isAvailable: null,
      error: null
    });
    onClose();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setAvatar('');
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getUsernameStatusIcon = () => {
    if (usernameStatus.isChecking) {
      return <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />;
    }
    if (usernameStatus.isAvailable === true) {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    if (usernameStatus.isAvailable === false || usernameStatus.error) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-20 inset-0 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-xl mx-4">
        <Card className="w-full bg-gradient-to-b from-slate-200 to-gray-200 p-6 shadow-2xl border-amber-100">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 rounded-full hover:bg-gray-300 z-10 cursor-pointer"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <CardHeader className="pb-4 flex items-center">
            <CardTitle>Profile information</CardTitle>
          </CardHeader>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex flex-col gap-6 pt-4">
            <div className="flex flex-col gap-2">
              <h5 className="text-sm font-semibold text-gray-700">Photo</h5>
              <div className="flex flex-row gap-4 items-center">
                <Avatar className="h-22 w-22 rounded-full text-6xl">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="bg-amber-200 w-full h-full rounded-full flex items-center justify-center text-2xl font-bold">
                      {name.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </Avatar>
                <div>
                  <div className="flex flex-row gap-2">
                    <label htmlFor="image-upload">
                      <Button 
                        type="button"
                        variant="ghost" 
                        className="text-green-700 hover:text-green-800 text-md cursor-pointer"
                        asChild
                        disabled={isLoading}
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-1" />
                          Upload
                        </span>
                      </Button>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Button 
                      variant="ghost"
                      className="text-red-700 hover:text-red-800 text-md cursor-pointer"
                      onClick={handleRemoveImage}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                  <p className="pt-2 text-sm text-gray-600 tracking-tight font-semibold max-w-xs">
                    Recommended: Square JPG, PNG, or GIF, at least 1,000 pixels per side.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <h6 className="text-sm font-semibold text-gray-700">Name*</h6>
              <Input 
                className="border-none bg-slate-400/40 text-md" 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                placeholder="Enter your name"
                disabled={isLoading}
              />
              <div className="text-sm text-gray-600 text-right">
                <span className="text-black">{name.length}</span>/50
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h6 className="text-sm font-semibold text-gray-700">Username*</h6>
              <div className="relative">
                <Input 
                  className="border-none bg-slate-400/40 text-md pr-8" 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, ''))}
                  maxLength={30}
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getUsernameStatusIcon()}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {usernameStatus.error && (
                  <p className="text-red-600">{usernameStatus.error}</p>
                )}
                {usernameStatus.isAvailable === true && username !== user?.username && (
                  <p className="text-green-600">Username is available!</p>
                )}
                {usernameStatus.isAvailable === false && !usernameStatus.error && (
                  <p className="text-red-600">Username is already taken</p>
                )}
                <div className="text-right mt-1">
                  <span className="text-black">{username.length}</span>/30
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <h6 className="text-sm font-semibold text-gray-700">Short bio</h6>
              <Textarea 
                className="border-none bg-slate-400/40 text-md h-32 resize-none" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                placeholder="Tell us about yourself..."
                disabled={isLoading}
              />
              <div className="text-sm text-gray-600 text-right">
                <span className="text-black">{bio.length}</span>/150
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h6 className="text-sm font-semibold text-gray-700">Location</h6>
              <Input 
                className="border-none bg-slate-400/40 text-md" 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={100}
                placeholder="Where are you based?"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <h6 className="text-sm font-semibold text-gray-700">Website</h6>
              <Input 
                className="border-none bg-slate-400/40 text-md" 
                type="url" 
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex flex-row justify-end items-center gap-4 pt-4">
              <Button 
                className="text-green-700 border-green-700 rounded-full hover:bg-green-50" 
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                className="bg-green-700 hover:bg-green-800 rounded-full text-white disabled:opacity-50"
                onClick={handleSave}
                disabled={
                  !name.trim() || 
                  !username.trim() || 
                  isLoading ||
                  (username !== user?.username && usernameStatus.isAvailable !== true)
                }
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};