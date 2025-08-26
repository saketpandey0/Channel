import { Card, CardDescription, CardHeader, Spotlight } from "../components/shad";
import {motion} from 'motion/react'
import Feautres from "../components/Features";



export function LandingPage() {

  

  return (
    <Card className="overflow-hidden flex flex-col gap-4 pt-40  items-center justify-center border-none">
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut", type: "spring", damping: 10, delay: 0.3 }}
        initial={{ y: -20, opacity: 0 }}
        className="max-w-7xl mx-auto px-4 flex flex-col gap-4 items-center justify-center"
      >
        <CardHeader className="flex flex-col items-center justify-center">
          <span className="tracking-tighter text-3xl md:text-4xl text-center font-medium text-primary/80 ">
            Welcome to
          </span>
          <h1 className="text-6xl text-center font-bold my-2">
            <span className="font-bold text-5xl md:text-6xl bg-gradient-to-b from-blue-400 to-blue-700 bg-clip-text text-transparent">
              Chan
            </span>
            <span className="text-4xl md:text-6xl">nel.</span>
          </h1>
        </CardHeader>
        <CardDescription className="text-primary/80 max-w-lg text-center tracking-tight md:text-2xl font-light">
          A platform where you'll find the right content to help you improve your skills and grow your knowledge.
        </CardDescription>
      </motion.div>
      <Spotlight className="top-40 left-0 md:left-60 md:-top-20 -z-10" fill="blue" />
      <Feautres></Feautres>
    </Card>
  );
}









