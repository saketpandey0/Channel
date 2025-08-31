import { Skeleton } from "../Shad"

export const PublicationSkeleton = () => {
  return (
      <div className="max-w-7xl w-full flex flex-col justify-center items-center gap-4 p-6 rounded-xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
          <Skeleton className="w-full h-60 bg-gradient-to-l from-gray-500 to-gray-300" />
          <Skeleton className="w-full h-60 bg-gradient-to-l from-gray-500 to-gray-300" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
          <Skeleton className="w-full h-60 bg-gradient-to-l from-gray-500 to-gray-300" />
          <Skeleton className="w-full h-60 bg-gradient-to-l from-gray-500 to-gray-300" />
        </div>
      </div>
  );
};
