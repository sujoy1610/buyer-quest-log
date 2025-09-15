import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  BuyerFormSchema,
  type BuyerFormData,
  City,
  PropertyType,
  BHK,
  Purpose,
  Timeline,
  Source,
} from "@/types/buyer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BuyerFormProps {
  initialData?: Partial<BuyerFormData>;
  onSubmit: (data: BuyerFormData) => void | Promise<void>;
  isLoading?: boolean;
}

const BuyerForm = ({
  initialData,
  onSubmit,
  isLoading: externalLoading = false,
}: BuyerFormProps) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [internalLoading, setInternalLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<BuyerFormData>({
    resolver: zodResolver(BuyerFormSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      city: initialData?.city || "Chandigarh",
      propertyType: initialData?.propertyType || "Apartment",
      bhk: initialData?.bhk,
      purpose: initialData?.purpose || "Buy",
      budgetMin: initialData?.budgetMin,
      budgetMax: initialData?.budgetMax,
      timeline: initialData?.timeline || "0-3m",
      source: initialData?.source || "Website",
      notes: initialData?.notes || "",
      tags: initialData?.tags || [],
    },
  });

  const propertyType = form.watch("propertyType");
  const shouldShowBHK =
    propertyType === "Apartment" || propertyType === "Villa";

  // ---- Tag Handlers ----
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      form.setValue("tags", newTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    form.setValue("tags", newTags);
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", " ", ","].includes(e.key)) {
      e.preventDefault();
      handleAddTag();
    }
  };

  // ---- Submit Handler ----
  const handleSubmit = async (data: BuyerFormData) => {
    if (!initialData && !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a lead",
        variant: "destructive",
      });
      return;
    }

    if (!initialData) {
      // Creating new buyer
      setInternalLoading(true);

      const { error } = await supabase.from("buyers").insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        property_type: data.propertyType,
        bhk: data.bhk,
        purpose: data.purpose,
        budget_min: data.budgetMin,
        budget_max: data.budgetMax,
        timeline: data.timeline,
        source: data.source,
        notes: data.notes,
        tags: data.tags,
        owner_id: user!.id,
      });

      setInternalLoading(false);

      if (error) {
        const isDuplicate =
          error.message.includes("duplicate") ||
          error.message.includes("unique");
        toast({
          title: "Error",
          description: isDuplicate
            ? "A buyer with this email or phone already exists."
            : "Failed to create buyer lead: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: "Buyer lead created successfully.",
      });

      // Reset form after successful submission
      form.reset();
      setTags([]);
    } else {
      // Updating existing buyer - delegate to parent component
      try {
        await onSubmit({ ...data, tags });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update lead. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form?")) {
      form.reset();
      setTags([]);
    }
  };

  const isSaving = internalLoading || externalLoading;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Buyer Lead Information</CardTitle>
        <CardDescription>
          Capture comprehensive buyer details with validation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="9876543210"
                        {...field}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSaving}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {City.options.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Property Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSaving}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PropertyType.options.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {shouldShowBHK && (
                <FormField
                  control={form.control}
                  name="bhk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BHK *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSaving}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select BHK" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BHK.options.map((bhk) => (
                            <SelectItem key={bhk} value={bhk}>
                              {bhk}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSaving}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Purpose.options.map((purpose) => (
                          <SelectItem key={purpose} value={purpose}>
                            {purpose}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budgetMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Budget (INR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000000"
                        {...field}
                        disabled={isSaving}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budgetMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Budget (INR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2000000"
                        {...field}
                        disabled={isSaving}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Timeline and Source */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeline *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSaving}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Timeline.options.map((timeline) => (
                          <SelectItem key={timeline} value={timeline}>
                            {timeline}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSaving}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Source.options.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about the buyer..."
                      className="resize-none"
                      {...field}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <div className="space-y-2">
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyPress}
                  disabled={isSaving}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddTag}
                  disabled={isSaving}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="pl-2 pr-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={isSaving}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSaving}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : initialData
                  ? "Update Lead"
                  : "Save Lead"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BuyerForm;
