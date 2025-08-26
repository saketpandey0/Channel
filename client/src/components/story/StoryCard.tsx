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



// const items = [
//   {
//     id: 1,
//     url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
//     title: 'Accordion',
//     description:
//       'Immerse yourself in our cutting-edge interactive gallery, designed to showcase a diverse array of visual content with unparalleled clarity and style. This feature allows users to effortlessly navigate through high-resolution images, from awe-inspiring landscapes to intimate portraits and abstract art. With smooth transitions, intuitive controls, and responsive design, our gallery adapts to any device, ensuring a seamless browsing experience. Dive deeper into each piece with expandable information panels, offering insights into the artist, technique, and story behind each image. ',
//     tags: ['Sunrise', 'Mountains', 'Golden', 'Scenic', 'Inspiring'],
//   },
//   {
//     id: 2,
//     url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
//     title: 'Globe Section',
//     description: `Embark on a virtual journey around the world with our state-of-the-art 3D globe feature. This interactive marvel allows users to explore geographical data, global trends, and worldwide connections with unprecedented ease and detail. Spin the globe with a flick of your mouse, zoom into street-level views, or soar high for a continental perspective. Our globe section integrates real-time data feeds, showcasing everything from climate patterns and population densities to economic indicators and cultural hotspots. Customizable layers let you focus on specific data sets, while intuitive tooltips provide in-depth information at every turn. `,
//     tags: ['Misty', 'Path', 'Mysterious', 'Serene', 'Rugged'],
//   },
//   {
//     id: 3,
//     url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
//     title: 'Image Mouse Trail',
//     description: `Transform your browsing experience with our mesmerizing Image Mouse Trail feature. As you move your cursor across the screen, watch in wonder as a trail of carefully curated images follows in its wake, creating a dynamic and engaging visual spectacle. This innovative feature goes beyond mere aesthetics; it's an interactive showcase of your content, products, or artwork. Each image in the trail can be clickable, leading to detailed views or related content, turning casual mouse movements into opportunities for discovery.`,
//     tags: ['Pathway', 'Adventure', 'Peaks', 'Challenging', 'Breathtaking'],
//   },
// ];
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