import { Settings, Bell, User } from 'lucide-react';
import {motion} from "motion/react";
import { Link } from 'react-router-dom';
import { Button } from '../Shad';
import { PiSidebar } from "react-icons/pi";


interface AdminHeaderProps {
  onToggleSidebar: () => void;
  adminUser?: {
    name: string;
    avatar?: string;
    role: string;
  };
}

const AdminHeader = ({onToggleSidebar, adminUser={name: 'Admin User', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', role: 'ADMIN'}}: AdminHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
            <div className='flex flex-row'>
              <Button onClick={onToggleSidebar}>
                <PiSidebar className="h-5 w-5" />
              </Button>
              <Link to={"/"} className="flex cursor-pointer items-center gap-1">
                  <motion.img
                      whileHover={{
                      rotate: [0, -5, 5, -5, 5, 0],
                      transition: {
                          duration: 1,
                          ease: "easeInOut",
                          repeat: 5,
                          repeatType: "reverse",
                      },
                      }}
                      src={
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4k8aHy_xQjnU20kJs4iZnrM3hfjP6-ZzczGkrNzlvIzpGPC__Z831DTw&s"
                      }
                      alt="Logo"
                      width={300}
                      height={200}
                      className="size-10 rounded-full"
                  />
                  <span className="text-foreground font-Bodoni hidden text-lg font-bold tracking-tight text-shadow-lg hover:text-shadow-lg/20 md:block md:text-2xl">
                      Channel
                  </span>
              </Link>
            </div>

          <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {adminUser.avatar ? (
                  <img 
                    src={adminUser.avatar} 
                    alt={adminUser.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-700">{adminUser.name}</div>
                  <div className="text-xs text-gray-500">{adminUser.role}</div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;