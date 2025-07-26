import { cn } from "../../../lib/utils";



export const Container = ({children, className}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("max-w-screen mx-auto bg-white p-4 md:p-10", className)}>
            {children}
        </div>
    )
}