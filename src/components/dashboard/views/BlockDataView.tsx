// import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import CompanyCard from "@/components/CompanyCard";
// import { Loader2 } from "lucide-react";

// interface BlockDataViewProps {
//   userId: string;
//   userRole?: string;
// }

// const BlockDataView = ({ userId, userRole }: BlockDataViewProps) => {
//   const [companies, setCompanies] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchBlockData();
//   }, [userId]);

//   const fetchBlockData = async () => {
//     setLoading(true);
    
//     // First get all companies assigned to the user
//     const { data: userCompanies, error: companiesError } = await supabase
//       .from("companies")
//       .select(`
//         *,
//         comments (
//           id,
//           comment_text,
//           category,
//           comment_date,
//           created_at,
//           user_id,
//           user:profiles!user_id (
//             display_name,
//             email
//           )
//         )
//       `)
//       .eq("assigned_to_id", userId)
//       .order("created_at", { ascending: false });

//     if (!companiesError && userCompanies) {
//       // Filter companies where the latest comment has "block" category
//       const blockCompanies = userCompanies.filter(company => {
//         if (!company.comments || company.comments.length === 0) return false;
//         // Sort comments by created_at descending and get the latest
//         const latestComment = company.comments.sort((a: any, b: any) => 
//           new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//         )[0];
//         return latestComment.category === "block";
//       });
      
//       // Ensure comments are properly sorted for each company
//       const companiesWithSortedComments = blockCompanies.map(company => ({
//         ...company,
//         comments: company.comments?.sort((a: any, b: any) => 
//           new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//         ) || []
//       }));
      
//       setCompanies(companiesWithSortedComments);
//     }
//     setLoading(false);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h2 className="text-3xl font-bold mb-6">Block Data</h2>
//       {companies.length === 0 ? (
//         <p className="text-muted-foreground">No blocked companies.</p>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           {companies.map((company: any) => (
//             <CompanyCard
//               key={company.id}
//               company={company}
//               onUpdate={fetchBlockData}
//               canDelete={true}
//               userRole={userRole}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BlockDataView;


import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CompanyCard from "@/components/CompanyCard";
import { Loader2 } from "lucide-react";

interface BlockDataViewProps {
  userId: string;
  userRole?: string;
}

const BlockDataView = ({ userId, userRole }: BlockDataViewProps) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockData();
  }, [userId]);

  const fetchBlockData = async () => {
    setLoading(true);

    const { data: userCompanies, error: companiesError } = await supabase
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
  .eq("assigned_to_id", userId)
      .order("created_at", { ascending: false });

    if (!companiesError && userCompanies) {
      const blockCompanies = userCompanies.filter(company => {
        if (!company.comments || company.comments.length === 0) return false;
        // Sort comments by created_at descending and get the latest
        const latestComment = company.comments.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        return latestComment.category === "block";
      });

      const companiesWithSortedComments = blockCompanies.map(company => ({
        ...company,
        comments:
          company.comments?.sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ) || [],
      }));

        setCompanies(companiesWithSortedComments);
    }

    setLoading(false);
  };

  // ✅ Move company to deleted data safely
  // const handleDeleteCompany = async (company: any) => {
  //   const confirmDelete = window.confirm(
  //     `Are you sure you want to delete "${company.company_name}"?`
  //   );
  //   if (!confirmDelete) return;

  //   try {
  //     const { error } = await supabase
  //       .from("companies")
  //       .update({ is_deleted: true, deleted_at: new Date().toISOString() })
  //       .eq("id", company.id);

  //     if (error) throw error;

  //     alert("Company moved to Deleted Data successfully!");
  //     fetchBlockData();
  //   } catch (err: any) {
  //     console.error(err);
  //     alert("Failed to move company to Deleted Data.");
  //   }
  // };

const handleDeleteCompany = async (company: any) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete "${company.company_name}"?`
  );
  if (!confirmDelete) return;

  try {
    // 1️⃣ Insert into deleted_companies
    const { error: insertError } = await supabase
      .from("deleted_companies")
      .insert([{ ...company, deleted_at: new Date().toISOString() }]);

    if (insertError) throw insertError;

    // 2️⃣ Remove from main companies table
    const { error: deleteError } = await supabase
      .from("companies")
      .delete()
      .eq("id", company.id);

    if (deleteError) throw deleteError;

    alert("Company moved to Deleted Data!");
    fetchBlockData();
  } catch (err: any) {
    console.error(err);
    alert("Failed to move company to Deleted Data.");
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
      <h2 className="text-3xl font-bold mb-6">Block Data</h2>
      {companies.length === 0 ? (
        <p className="text-muted-foreground">No blocked companies.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company: any) => (
            <CompanyCard
              key={company.id}
              company={company}
              onUpdate={fetchBlockData}
              canDelete={true}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockDataView;
