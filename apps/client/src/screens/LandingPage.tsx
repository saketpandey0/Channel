import { Spotlight } from "../components/shad";
import {motion} from 'motion/react'




export function LandingPage() {

  

  return (
    <div className="flex flex-col gap-4 h-[50vh] md:h-[75vh] size-screen mx-auto justify-center">
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut", type: "spring", damping: 10, delay: 0.3 }}
        initial={{ y: -20, opacity: 0 }}
        className="max-w-7xl mx-auto px-4 flex flex-col gap-4 items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center">
          <span className="tracking-tighter text-2xl md:text-3xl text-center font-medium text-primary/80 ">
            Welcome to
          </span>
          <h1 className="tracking-tighter text-6xl md:text-7xl xl:text-8xl text-center font-bold my-2">
            <span className="font-bold bg-gradient-to-b from-blue-400 to-blue-700 bg-clip-text text-transparent">
              Chan
            </span>
            nel.
          </h1>
        </div>
        <p className="text-primary/80 max-w-lg text-center tracking-tight md:text-lg font-light">
          A platform where you'll find the right content to help you improve your skills and grow your knowledge.
        </p>
      </motion.div>
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 -z-10" fill="blue" />
    </div>
  );
}