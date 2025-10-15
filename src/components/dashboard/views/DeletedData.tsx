import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const DeletedDataView = () => {
  const [deletedCompanies, setDeletedCompanies] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletedCompanies();
    fetchEmployees();
  }, []);

  // ✅ Fetch all deleted companies
  const fetchDeletedCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("is_deleted", true)
      .order("deleted_at", { ascending: false });

    if (!error && data) {
      setDeletedCompanies(data);
    }
    setLoading(false);
  };

  // ✅ Fetch all employees for reassignment dropdown
  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, email, role");

    if (!error && data) {
      // Filter only employees
      const employeeList = data.filter((u) => u.role === "employee");
      setEmployees(employeeList);
    }
  };

  // ✅ Reassign function
  const handleReassign = async (companyId: string, newEmployeeId: string) => {
    try {
      const { error } = await supabase
        .from("companies")
        .update({
          assigned_to_id: newEmployeeId,
          is_deleted: false, // restore while reassigning
          deleted_at: null,
        })
        .eq("id", companyId);

      if (error) throw error;

      toast.success("Company successfully reassigned!");
      fetchDeletedCompanies();
    } catch (err: any) {
      toast.error(err.message || "Failed to reassign company");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Deleted Companies (Reassign)</h2>
      {deletedCompanies.length === 0 ? (
        <p className="text-muted-foreground">No deleted companies found.</p>
      ) : (
        <div className="space-y-4">
          {deletedCompanies.map((company) => (
            <div
              key={company.id}
              className="border p-4 rounded-lg shadow-sm bg-white"
            >
              <h3 className="font-semibold text-lg">{company.name}</h3>
              <p className="text-sm text-gray-600">
                Deleted At:{" "}
                {company.deleted_at
                  ? new Date(company.deleted_at).toLocaleString()
                  : "N/A"}
              </p>

              {/* Reassign Dropdown */}
              <div className="mt-3 flex items-center gap-2">
                <select
                  className="border rounded-md px-3 py-2 text-sm"
                  defaultValue=""
                  onChange={(e) =>
                    handleReassign(company.id, e.target.value)
                  }
                >
                  <option value="" disabled>
                    Reassign to employe...
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.display_name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeletedDataView;
