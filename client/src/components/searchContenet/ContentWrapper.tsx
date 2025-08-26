import { Navigate, useParams } from "react-router-dom"
import { ProfileLayout } from "./ContentLayout";
import { Content } from "@radix-ui/react-dropdown-menu";


const ContentWrapper = () => {
    const {username, tab} = useParams<{username: string, tab: string}>();
    console.log("logging username: ",username);
    if(!username){
        return <div>Invalid User Profile URL</div>
    }

    if(!tab){
        return <Navigate to={`/${username}/about`} replace />;
    }


    return (
        <ContentLayout
            username={username}
            defaultTab={tab}
        />
        
    )
}

export default ContentWrapper