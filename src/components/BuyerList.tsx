import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Edit, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Buyer, City, PropertyType, Status, Timeline, CityType, PropertyTypeType, TimelineType, SourceType, StatusType } from "@/types/buyer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";


interface BuyerListProps {
  onEdit?: (buyer: Buyer) => void;
}

const BuyerList = ({ onEdit }: BuyerListProps) => {
  const { user } = useAuth();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timelineFilter, setTimelineFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 3; // Show pagination when more than 3 entries

  useEffect(() => {
    fetchBuyers();
  }, [user]);

  const fetchBuyers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedBuyers: Buyer[] = data.map(buyer => ({
        id: buyer.id,
        fullName: buyer.full_name,
        email: buyer.email,
        phone: buyer.phone,
        city: buyer.city as CityType,
        propertyType: buyer.property_type as PropertyTypeType,
        bhk: buyer.bhk as any,
        purpose: buyer.purpose as "Buy" | "Rent",
        budgetMin: buyer.budget_min,
        budgetMax: buyer.budget_max,
        timeline: buyer.timeline as TimelineType,
        source: buyer.source as SourceType,
        status: buyer.status as StatusType,
        notes: buyer.notes,
        tags: buyer.tags,
        ownerId: buyer.owner_id,
        createdAt: new Date(buyer.created_at),
        updatedAt: new Date(buyer.updated_at),
      }));
      
      setBuyers(mappedBuyers);
    } catch (error) {
      console.error('Error fetching buyers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredBuyers = buyers.filter(buyer => {
    const matchesSearch = 
      buyer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.phone.includes(searchTerm) ||
      (buyer.email && buyer.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCity = cityFilter === "all" || buyer.city === cityFilter;
    const matchesPropertyType = propertyTypeFilter === "all" || buyer.propertyType === propertyTypeFilter;
    const matchesStatus = statusFilter === "all" || buyer.status === statusFilter;
    const matchesTimeline = timelineFilter === "all" || buyer.timeline === timelineFilter;

    return matchesSearch && matchesCity && matchesPropertyType && matchesStatus && matchesTimeline;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBuyers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBuyers = filteredBuyers.slice(startIndex, startIndex + pageSize);

  const formatBudget = (min?: number, max?: number) => {
    const formatAmount = (amount: number) => {
      if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
      return amount.toLocaleString();
    };

    if (min && max) return `₹${formatAmount(min)} - ₹${formatAmount(max)}`;
    if (min) return `₹${formatAmount(min)}+`;
    if (max) return `Up to ₹${formatAmount(max)}`;
    return "Not specified";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      New: "bg-blue-100 text-blue-800",
      Qualified: "bg-green-100 text-green-800",
      Contacted: "bg-yellow-100 text-yellow-800",
      Visited: "bg-purple-100 text-purple-800",
      Negotiation: "bg-orange-100 text-orange-800",
      Converted: "bg-emerald-100 text-emerald-800",
      Dropped: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Buyer Leads
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {City.options.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Property Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Property Types</SelectItem>
                    {PropertyType.options.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Status.options.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={timelineFilter} onValueChange={setTimelineFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Timelines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Timelines</SelectItem>
                    {Timeline.options.map((timeline) => (
                      <SelectItem key={timeline} value={timeline}>{timeline}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="text-sm text-muted-foreground mb-4">
            {loading ? "Loading..." : `Showing ${startIndex + 1}-${Math.min(startIndex + pageSize, filteredBuyers.length)} of ${filteredBuyers.length} leads`}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading buyer leads...
              </div>
            ) : (
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBuyers.map((buyer) => (
                  <TableRow key={buyer.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{buyer.fullName}</div>
                        {buyer.email && (
                          <div className="text-sm text-muted-foreground">{buyer.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{buyer.phone}</TableCell>
                    <TableCell>{buyer.city}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{buyer.propertyType}</div>
                        {buyer.bhk && (
                          <div className="text-sm text-muted-foreground">{buyer.bhk} BHK</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatBudget(buyer.budgetMin, buyer.budgetMax)}</TableCell>
                    <TableCell>{buyer.timeline}</TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", getStatusColor(buyer.status))}>
                        {buyer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {buyer.updatedAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/buyers/${buyer.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEdit?.(buyer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerList;