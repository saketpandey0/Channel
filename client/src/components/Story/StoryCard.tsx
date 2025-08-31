type Author = {
  id: string; // Assuming author has an ID
  name: string;
  usernsame: string; // Author's username
  avatar: string; // URL to author's avatar
};



interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublic: boolean;
  isPremium: boolean;
  allowComments: boolean;
  allowClaps: boolean;
  createdAt: string;
  updatedAt: string;
  author: Author; // Author's name
  readTime: string; // If this is part of the story's data
  publishedAt: string; // If this is part of the story's data
  claps: number; 
  comments: number; 
  tags: string[];
}



const StoryCard = ({
  // title,
  // excerpt,
  // author,
  // readTime,
  // publishedAt,
  // claps,
  // comments,
  // coverImage,
  // tags
}) => {
  return (
    <div className='flex flex-col max-h-full w-full bg-black'>
      <div className='flex flex-1 min-h-48px sticky fixed top-0'></div>
      <div className='sticky top-48 relative bg-red-200 min-w-screen min-h-[calc(100vh-48px)] flex items-center justify-center overflow-x-hidden py-32 px-16 overflow-y-auto'>
        <div className='min-w-full min-h-full flex flex-col items-center justify-center gap-4 cursor-pointer snap-mandatory snap-y snap-always overflow-y-auto'>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quaerat illum eos vel, obcaecati dolor impedit repudiandae reiciendis veniam nihil ut voluptatem at odit corporis iste assumenda, ipsam deleniti! Qui, est!

        </div>
      </div>
    </div>
  );
}
export default StoryCard;