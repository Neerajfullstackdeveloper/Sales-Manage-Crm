import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  Plus,
  MessageSquare,
  CalendarDays,
  Settings,
  UserCog,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import AllCompaniesView from "./views/AllCompaniesView";
import EmployeeManagementView from "./views/EmployeeManagementView";
import TeamCreationView from "./views/TeamCreationView";
import DataRequestsView from "./views/DataRequestsView";
import HolidaysView from "./views/HolidaysView";
import AddNewDataView from "./views/AddNewDataView";
import AdminDataAssignmentView from "./views/AdminDataAssignmentView";

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("companies");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const menuItems = [
    { id: "companies", label: "All Companies", icon: Building2 },
    { id: "add", label: "Add Company", icon: Plus },
    { id: "assign", label: "Assign Data", icon: UserCog },
    { id: "employees", label: "Employee Management", icon: Users },
    { id: "teams", label: "Team Creation", icon: UserPlus },
    { id: "requests", label: "Data Requests", icon: MessageSquare },
    { id: "holidays", label: "Holidays", icon: CalendarDays },
  ];

  return (
    <DashboardLayout
      menuItems={menuItems}
      currentView={currentView}
      onViewChange={setCurrentView}
      user={user}
      onLogout={handleLogout}
    >
      {currentView === "companies" && <AllCompaniesView userRole="admin" />}
      {currentView === "add" && <AddNewDataView userId={user.id} />}
      {currentView === "assign" && <AdminDataAssignmentView />}
      {currentView === "employees" && <EmployeeManagementView />}
      {currentView === "teams" && <TeamCreationView />}
      {currentView === "requests" && <DataRequestsView />}
      {currentView === "holidays" && <HolidaysView />}
    </DashboardLayout>
  );
};

export default AdminDashboard;
