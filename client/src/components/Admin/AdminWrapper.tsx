import AdminLayout from "./AdminLayout"
import { useState } from "react"


export const AdminWrapper = () => {
    const [activeTab, setActiveTab] = useState('dashboard');


    return (
        <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
            <div className="p-8"></div>
        </AdminLayout>
    )
}