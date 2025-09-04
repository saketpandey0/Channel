import { Card, Button, Avatar } from "../Shad";
import { Ellipsis } from 'lucide-react';



const PublicationCard = () => {
    return (
        <Card className="bg-red-400 p-6 shadow-sm">
            <div className="grid grid-cols-6 items-center">
                <div className="flex items-center gap-4 col-span-5">
                    <Avatar className="h-16 w-16 bg-white/20 text-white text-xl font-semibold">
                        <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                        alt="Publication"
                        className="w-full h-full object-cover"
                        />
                    </Avatar>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-white font-semibold">Publication name</h3>
                        <span className="text-gray-200 text-sm">Owner</span>
                        <p className="text-gray-100 text-sm hidden sm:block">Publication description</p>
                    </div>
                </div>

                <div className="flex justify-end col-span-1">
                    <Button size="icon" variant="ghost" className="text-white">
                        <Ellipsis />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default PublicationCard;