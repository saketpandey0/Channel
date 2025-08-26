import { Card, CardHeader, CardTitle, Button, Avatar, Input, Textarea } from "../shad";
import { useState } from "react";
import { X, Upload, Trash2 } from "lucide-react";

interface UpdateProfileForm {
  isOpen: boolean;
  onClose: () => void;
  editRef: React.RefObject<HTMLButtonElement | null>;
  user?: {
    name?: string;
    bio?: string;
    location?: string;
    website?: string;
    avatar?: string;
  };
}

export const ProfileUpdate: React.FC<UpdateProfileForm> = ({ 
  isOpen, 
  onClose, 
  editRef, 
  user 
}) => {
  const [name, setName] = useState<string>(user?.name || '');
  const [bio, setBio] = useState<string>(user?.bio || '');
  const [location, setLocation] = useState<string>(user?.location || '');
  const [website, setWebsite] = useState<string>(user?.website || '');
  const [avatar, setAvatar] = useState<string>(user?.avatar || '');

  const handleSave = () => {
    const updatedProfile = {
      name: name.trim(),
      bio: bio.trim(),
      location: location.trim(),
      website: website.trim(),
      avatar
    };
    
    console.log('Saving profile:', updatedProfile);
    // TODO: Implement API call
    
    onClose();
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setBio(user?.bio || '');
    setLocation(user?.location || '');
    setWebsite(user?.website || '');
    setAvatar(user?.avatar || '');
    onClose();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setAvatar('');
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-20 inset-0 z-50 flex items-center justify-center ">
      <div className="relative w-full max-w-xl mx-4">
        <Card className="w-full bg-gradient-to-b from-slate-200 to-gray-200 p-6 shadow-2xl border-amber-100">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 rounded-full hover:bg-gray-300 z-10 cursor-pointer"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <CardHeader className="pb-4 flex items-center">
            <CardTitle>Profile information</CardTitle>
          </CardHeader>
          
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
                    />
                    <Button 
                      variant="ghost"
                      className="text-red-700 hover:text-red-800 text-md cursor-pointer"
                      onClick={handleRemoveImage}
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
              />
              <div className="text-sm text-gray-600 text-right">
                <span className="text-black">{name.length}</span>/50
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
              />
            </div>
            
            <div className="flex flex-row justify-end items-center gap-4 pt-4">
              <Button 
                className="text-green-700 border-green-700 rounded-full hover:bg-green-50" 
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                className="bg-green-700 hover:bg-green-800 rounded-full text-white"
                onClick={handleSave}
                disabled={!name.trim()} 
              >
                Save
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};