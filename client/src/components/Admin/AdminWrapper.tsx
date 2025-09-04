import AdminLayout from "./AdminLayout"
import { useState } from "react"
import AdminDashboard from "./tabs/AdminDashboard"
import UsersPage from "./tabs/UsersPage";
import AnalyticsDashboard from "./tabs/AnalyticsDashboard";
import StoriesPage from "./tabs/StoriesPage";
import ReportPage from "./tabs/ReportPage";

export const AdminWrapper = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard />
            
            case 'users':
                return <UsersPage/>
            
            case 'analytics':   
                return <AnalyticsDashboard/>
            
            case 'stories':
                return <StoriesPage/>
            
            case 'reports':
                return <ReportPage/>    
            default:
                return <div>No content</div>
        }
    }


    return (
        <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {renderContent()}
        </AdminLayout>
    )
}