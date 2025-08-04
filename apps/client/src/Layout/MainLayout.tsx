import { AnimatePresence } from 'motion/react';



const AppLayout = ({ children, sidebar, header, modal }) => {
  return (
    <div className="min-h-screen bg-gray-50">

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        {header}
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 py-8">

          <main className="flex-1 max-w-4xl">
            <AnimatePresence mode="wait">
              {children}
            </AnimatePresence>
          </main>
          
          <aside className="w-80 hidden lg:block sticky top-24 h-fit">
            {sidebar}
          </aside>
        </div>
      </div>
      
      {modal}
    </div>
  );
};
