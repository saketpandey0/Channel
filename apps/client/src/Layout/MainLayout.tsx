interface ProfileLayoutProps {
  profileItems: { name: string; pageLink?: string }[];
  activeItem: string;
  setActiveItem: (name: string) => void;
  children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  profileItems,
  activeItem,
  setActiveItem,
  children,
}) => {
  return (
    <ReactLenis root>
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl rounded-xl border border-gray-100 bg-slate-100 px-4 py-8 shadow-sm sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <main className="max-w-4xl flex-1">
              {/* Header */}
              <div className="rounded-xl border p-6 shadow-sm shadow-slate-700/50 hover:shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <h1 className="text-4xl font-bold text-gray-900">Saket Pandey</h1>
                  <button className="mb-10 cursor-pointer border-none text-4xl text-black">
                    ...
                  </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-row gap-6 text-sm font-semibold">
                  {profileItems.map((item) => (
                    <span
                      key={item.name}
                      onClick={() => setActiveItem(item.name)}
                      className={`cursor-pointer text-gray-700 hover:text-black ${
                        activeItem === item.name ? "border-b-4" : ""
                      }`}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Content */}
              <div className="mt-8">{children}</div>
            </main>

            {/* Sidebar */}
            <aside className={`w-80 transition-all duration-300`}>
              <ProfileSidebar />
            </aside>
          </div>
        </div>
      </div>
    </ReactLenis>
  );
};
