import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";

const HEADERS = [
  "fullName",
  "email",
  "phone",
  "city",
  "propertyType",
  "bhk",
  "purpose",
  "budgetMin",
  "budgetMax",
  "timeline",
  "source",
  "notes",
  "tags",
  "status",
];

const ENUMS = {
  propertyType: ["Apartment", "Villa", "Plot"],
  purpose: ["Buy", "Rent", "Invest"],
  status: ["New", "Contacted", "Qualified", "Closed"],
};

interface ValidationError {
  row: number;
  message: string;
}

export async function importCSV(file: File) {
  return new Promise<{ errors: ValidationError[]; inserted: number }>(
    (resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const rows = results.data as any[];
          const errors: ValidationError[] = [];

          if (rows.length > 200) {
            errors.push({ row: 0, message: "CSV exceeds 200 rows" });
            return resolve({ errors, inserted: 0 });
          }

          // Validate rows
          const validRows = rows.filter((row, i) => {
            for (const header of HEADERS) {
              if (!(header in row)) {
                errors.push({ row: i + 2, message: `Missing column ${header}` });
                return false;
              }
            }
            if (!ENUMS.propertyType.includes(row.propertyType)) {
              errors.push({ row: i + 2, message: "Invalid propertyType" });
              return false;
            }
            if (!ENUMS.purpose.includes(row.purpose)) {
              errors.push({ row: i + 2, message: "Invalid purpose" });
              return false;
            }
            if (!ENUMS.status.includes(row.status)) {
              errors.push({ row: i + 2, message: "Invalid status" });
              return false;
            }
            return true;
          });

          // Insert valid rows
          let inserted = 0;
          if (validRows.length) {
            const { error } = await supabase
              .from("buyers")
              .insert(validRows);

            if (error) {
              reject(error);
              return;
            }
            inserted = validRows.length;
          }

          resolve({ errors, inserted });
        },
        error: (err) => reject(err),
      });
    }
  );
}
export function exportCSV(data: any[], filename = "buyers.csv") {
  const csv = Papa.unparse(data, { columns: HEADERS });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.click();
}
