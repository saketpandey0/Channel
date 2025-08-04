import ProfileSidebar from "../components/ProfileSidebar";
import { ReactLenis } from "lenis/react";
import { useState, useEffect } from "react";
import ContentPreview from "../components/ContentPreview";
import { AnimatePresence } from "motion/react";
import type { Story } from "../types/story";
import { useStories } from "../hooks/useStories";
import Stories from "../components/Stories";
import { motion } from "motion/react";

export const Profile = () => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [activeItem, setActiveItem] = useState<string>("Home");
  const {
    data: stories,
    isLoading,
    isError,
  } = useStories({ page: 1, limit: 10 });
  const blogPosts = stories || [];
  const [hovered, setHovered] = useState<number | null>(null);

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
  };

  const handleClosePreview = () => {
    setSelectedStory(null);
  };

  const profileItems = [
    {
      name: "Home",
      pageLink: "/",
    },
    {
      name: "About",
      pageLink: "/",
    },
  ];

  return (
    <ReactLenis root>
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl rounded-xl border border-gray-100 bg-slate-100 px-4 py-8 shadow-sm sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <main className="r max-w-4xl flex-1">
              <div className="rounded-xl border p-6 shadow-sm shadow-slate-700/50 hover:shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <h1 className="text-4xl font-bold text-gray-900">
                    Saket Pandey
                  </h1>
                  <button className="mb-10 cursor-pointer border-none text-4xl text-black">
                    ...
                  </button>
                </div>
                <div className="flex flex-row gap-6 text-sm font-semibold">
                  {profileItems.map((item) => (
                    <span
                      key={item.name}
                      onClick={() => setActiveItem(item.name)}
                      className={`cursor-pointer text-gray-700 hover:text-black ${activeItem === item.name ? "border-b-4" : ""}`}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="mt-8 rounded-xl border border-black border-gray-100 px-2 pb-1 shadow-sm hover:shadow-lg">
                  {blogPosts.map((post, index) => (
                    <div
                      onMouseEnter={() => setHovered(index)}
                      onMouseLeave={() => setHovered(null)}
                      className="relative mt-4"
                      key={post.id || index}
                    >
                      <AnimatePresence>
                        {hovered === index && (
                          <motion.div
                            key={`hover-${index}`}
                            layoutId="hovered-post"
                            className="absolute inset-0 h-full w-full rounded-xl bg-neutral-200 shadow-md"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </AnimatePresence>
                      <Stories
                        {...post}
                        onClick={() => handleStoryClick(post)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </main>

            <aside className={`w-80 transition-all duration-300`}>
              <ProfileSidebar />
            </aside>
          </div>
        </div>

        <AnimatePresence>
          {selectedStory && (
            <ContentPreview
              story={selectedStory}
              isOpen={!!selectedStory}
              onClose={handleClosePreview}
            />
          )}
        </AnimatePresence>
      </div>
    </ReactLenis>
  );
};



// export const Profile = () => {
//   const [selectedStory, setSelectedStory] = useState<Story | null>(null);
//   const [activeItem, setActiveItem] = useState<string>("Home");
//   const [userBlogs, setUserBlogs] = useState<Story[]>([]); // Replace with actual data from DB
//   const [bookmarkedBlogs, setBookmarkedBlogs] = useState<Story[]>([]); // Replace with API

//   useEffect(() => {
//     // 👇 Fake fetching data
//     const fetchBlogs = async () => {
//       // TODO: Replace with actual API calls
//       const blogs = []; // example: await fetchMyBlogs();
//       const bookmarks = []; // example: await fetchBookmarks();
//       setUserBlogs(blogs);
//       setBookmarkedBlogs(bookmarks);
//     };
//     fetchBlogs();
//   }, []);

//   const profileItems = [
//     { name: "Home", pageLink: "/" },
//     ...(userBlogs.length > 0 ? [{ name: "List", pageLink: "/" }] : []),
//     { name: "About", pageLink: "/" }
//   ];

//   const renderTabContent = () => {
//     switch (activeItem) {
//       case "Home":
//         return (
//           <div className="space-y-4">
//             {userBlogs.length === 0 ? (
//               <div>
//                 <p className="text-gray-600">You haven’t written anything yet.</p>
//                 <h3 className="text-lg font-semibold mt-4 mb-2">Your Bookmarks</h3>
//                 {bookmarkedBlogs.length > 0 ? (
//                   bookmarkedBlogs.map((story) => (
//                     <div
//                       key={story.id}
//                       className="p-4 rounded-lg border bg-white shadow-sm hover:shadow transition cursor-pointer"
//                       onClick={() => setSelectedStory(story)}
//                     >
//                       <h4 className="text-lg font-bold">{story.title}</h4>
//                       <p className="text-gray-600">{story.excerpt}</p>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-sm text-gray-500">No bookmarks yet.</p>
//                 )}
//               </div>
//             ) : (
//               <div>
//                 <h3 className="text-lg font-semibold mb-2">Your Blogs</h3>
//                 {userBlogs.map((story) => (
//                   <div
//                     key={story.id}
//                     className="p-4 rounded-lg border bg-white shadow-sm hover:shadow transition cursor-pointer"
//                     onClick={() => setSelectedStory(story)}
//                   >
//                     <h4 className="text-lg font-bold">{story.title}</h4>
//                     <p className="text-gray-600">{story.excerpt}</p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         );
//       case "List":
//         return (
//           <div>
//             <h3 className="text-lg font-semibold mb-2">Your Blog List</h3>
//             {userBlogs.map((story) => (
//               <div
//                 key={story.id}
//                 className="p-4 rounded-lg border bg-white shadow-sm hover:shadow transition cursor-pointer"
//                 onClick={() => setSelectedStory(story)}
//               >
//                 <h4 className="text-lg font-bold">{story.title}</h4>
//                 <p className="text-gray-600">{story.excerpt}</p>
//               </div>
//             ))}
//           </div>
//         );
//       case "About":
//         return (
//           <div className="text-gray-700 space-y-2">
//             <p>This is the about section of your profile.</p>
//             <p>You can put user bio, stats, or any other personal info here.</p>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <ReactLenis root>
//       <div className="min-h-screen">
//         <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 rounded-xl shadow-sm border border-gray-100 bg-slate-100">
//           <div className="flex gap-8">
//             <main className="max-w-4xl flex-1">
//               <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//                 <div className="flex items-center justify-between mb-2">
//                   <h1 className="text-4xl font-bold text-gray-900">Saket Pandey</h1>
//                   <button className="mb-10 text-4xl text-black bg-white border-none cursor-pointer">...</button>
//                 </div>
//                 <div className="flex flex-row gap-6 text-sm font-semibold">
//                   {profileItems.map((item) => (
//                     <span
//                       key={item.name}
//                       onClick={() => setActiveItem(item.name)}
//                       className={`cursor-pointer text-gray-700 hover:text-black pb-2 ${
//                         activeItem === item.name ? "border-b-4 border-black" : ""
//                       }`}
//                     >
//                       {item.name}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               <div className="mt-8">{renderTabContent()}</div>
//             </main>

//             <aside className="w-80 transition-all duration-300">
//               <ProfileSidebar />
//             </aside>
//           </div>
//         </div>

//         <AnimatePresence>
//           {selectedStory && (
//             <ContentPreview
//               story={selectedStory}
//               isOpen={!!selectedStory}
//               onClose={() => setSelectedStory(null)}
//             />
//           )}
//         </AnimatePresence>
//       </div>
//     </ReactLenis>
//   );
// };
