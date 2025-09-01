import { Navigate, useParams } from "react-router-dom"
import { ProfileLayout } from "./ProfileLayout";


export const ProfileWrapper = () => {
    const {username, tab} = useParams<{username: string, tab: string}>();
    console.log("logging username: ",username);
    console.log("tab to open",tab)
    if(!username){
        return <div>Invalid User Profile URL</div>
    }

    if(!tab){
        return <Navigate to={`/${username}/about`} replace />;
    }


    return (
        <ProfileLayout
            username={username}
            defaultTab={tab}
        />
        
    )
}