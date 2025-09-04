import { Card, Separator } from "../Shad"
import { useState } from "react"
import PublicationPage from "./PublicationPage"
import PublicationCard from "./PublicationCard"

const Publications = () => {
    // const [publications, setPublications] = useState<Publication[]>([]);

    return (
        <Card className="mx-auto my-1 max-w-7xl min-h-screen rounded-xl border border-gray-100 dark:border-slate-700 bg-slate-100 dark:bg-gray-700 px-4 py-8 shadow-sm sm:px-6 lg:px-8">
            <div className="flex items-center text-green-500/90 text-lg font-semibold cursor-pointer">
                + create new publication
            </div>
            <Separator className="border-t-2 border-gray-200/30 my-2" />
            <div>
                <PublicationCard></PublicationCard>
            </div>
        </Card>
    )
}


export default Publications