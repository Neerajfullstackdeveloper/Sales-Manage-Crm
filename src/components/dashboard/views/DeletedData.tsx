import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CompanyCard from "@/components/CompanyCard";
import { Loader2 } from "lucide-react";

interface DeletedDataViewProps {
  userRole?: string;
}

const DeletedDataView = ({ userRole }: DeletedDataViewProps) => {
  const [deletedCompanies, setDeletedCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletedCompanies();
  }, []);

  const fetchDeletedCompanies = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("companies")
      .select(`
        *,
        comments (
          id,
          comment_text,
          category,
          comment_date,
          created_at,
          user_id,
          user:profiles!user_id (
            display_name,
            email
          )
        )
      `)
      .eq("is_deleted", true) // 👈 filter for deleted companies
      .order("deleted_at", { ascending: false });

    if (!error && data) {
      // Sort comments by latest date for consistency
      const sorted = data.map(company => ({
        ...company,
        comments: company.comments?.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ) || []
      }));
      setDeletedCompanies(sorted);
    }

    setLoading(false);
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
      <h2 className="text-3xl font-bold mb-6">Deleted Data</h2>
      {deletedCompanies.length === 0 ? (
        <p className="text-muted-foreground">No deleted companies found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deletedCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onUpdate={fetchDeletedCompanies}
              userRole={userRole}
              canDelete={false} // disable delete in deleted view
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DeletedDataView;
