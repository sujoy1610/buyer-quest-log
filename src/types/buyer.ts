import { z } from "zod";

// Enums for buyer data
export const City = z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]);
export const PropertyType = z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]);
export const BHK = z.enum(["1", "2", "3", "4", "Studio"]);
export const Purpose = z.enum(["Buy", "Rent"]);
export const Timeline = z.enum(["0-3m", "3-6m", ">6m", "Exploring"]);
export const Source = z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]);
export const Status = z.enum(["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]);

// Validation schema for buyer form
export const BuyerFormSchema = z.object({
  fullName: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must not exceed 80 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string()
    .regex(/^\d{10,15}$/, "Phone number must be 10-15 digits"),
  city: City,
  propertyType: PropertyType,
  bhk: BHK.optional(),
  purpose: Purpose,
  budgetMin: z.number().min(0, "Budget must be positive").optional(),
  budgetMax: z.number().min(0, "Budget must be positive").optional(),
  timeline: Timeline,
  source: Source,
  notes: z.string().max(1000, "Notes must not exceed 1000 characters").optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
}).refine((data) => {
  // BHK is required for Apartment and Villa
  if ((data.propertyType === "Apartment" || data.propertyType === "Villa") && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: "BHK is required for Apartment and Villa properties",
  path: ["bhk"],
}).refine((data) => {
  // Budget max must be >= budget min when both are present
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: "Maximum budget must be greater than or equal to minimum budget",
  path: ["budgetMax"],
});

// TypeScript types
export type BuyerFormData = z.infer<typeof BuyerFormSchema>;
export type CityType = z.infer<typeof City>;
export type PropertyTypeType = z.infer<typeof PropertyType>;
export type BHKType = z.infer<typeof BHK>;
export type PurposeType = z.infer<typeof Purpose>;
export type TimelineType = z.infer<typeof Timeline>;
export type SourceType = z.infer<typeof Source>;
export type StatusType = z.infer<typeof Status>;

// Full buyer type (with additional fields)
export interface Buyer extends BuyerFormData {
  id: string;
  status: StatusType;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}