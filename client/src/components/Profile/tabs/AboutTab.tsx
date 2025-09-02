import type { ProfileUser, ProfileViewContext } from "../../../types/profile";

interface AboutTabProps {
  user: ProfileUser;
  viewContext: ProfileViewContext;
}

const AboutTab: React.FC<AboutTabProps> = ({ user, viewContext }) => {
  return (
    <div className="p-6 space-y-6 min-h-[500px] overflow-y-auto">
      {user.bio && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Bio</h3>
          <p className="text-gray-700 leading-relaxed">{user.bio}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-6">
        {/* <div>
          <h3 className="text-lg font-semibold mb-2">Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Stories</span>
              <span className="font-medium">{user.storyCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Followers</span>
              <span className="font-medium">{user.followerCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Following</span>
              <span className="font-medium">{user.followingCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Joined</span>
              <span className="font-medium">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div> */}

        {(user.website || user.twitter || user.linkedin || user.github || user.location) && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Details</h3>
            <div className="space-y-2 text-sm">
              {user.location && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">📍</span>
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">🔗</span>
                  <a 
                    href={user.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
              {user.twitter && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">🐦</span>
                  <a 
                    href={`https://twitter.com/${user.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    @{user.twitter}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutTab;