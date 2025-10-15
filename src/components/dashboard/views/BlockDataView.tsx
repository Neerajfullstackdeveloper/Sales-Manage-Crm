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
//               canDelete={userRole === "admin"}
//               userRole={userRole}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BlockDataView;

import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // make sure your Supabase client is imported

export default function LeadData() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    const { data, error } = await supabase.from("leads").select("*");
    if (error) console.error(error);
    else setLeads(data);
  }

  async function deleteAllLeads() {
    const { error } = await supabase.from("leads").delete().neq("id", 0); // deletes all rows
    if (error) {
      console.error(error);
    } else {
      alert("All leads deleted successfully!");
      setLeads([]); // clear the list
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Leads Data</h2>

      <button
        onClick={fetchLeads}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        View All
      </button>

      {/* Delete All button placed below View All */}
      <button
        onClick={deleteAllLeads}
        className="bg-red-500 text-white px-4 py-2 rounded mt-3 hover:bg-red-600"
      >
        Delete All
      </button>

      <ul className="mt-6 space-y-2">
        {leads.map((lead) => (
          <li
            key={lead.id}
            className="border p-3 rounded shadow-sm bg-gray-50"
          >
            {lead.name} – {lead.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
