import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import BuyerForm from "@/components/BuyerForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, History } from "lucide-react";
import { BuyerFormData } from "@/types/buyer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Buyer extends BuyerFormData {
  id: string;
  status: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface HistoryEntry {
  id: string;
  changedAt: Date;
  diff: any;
  changedBy: {
    email: string;
  };
}

const BuyerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [originalUpdatedAt, setOriginalUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (id) {
      fetchBuyer();
      fetchHistory();
    }
  }, [id]);

  const fetchBuyer = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from('buyers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load buyer details",
        variant: "destructive",
      });
      navigate('/buyers');
      return;
    }

    if (data) {
      const buyerData: Buyer = {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        propertyType: data.property_type,
        bhk: data.bhk,
        purpose: data.purpose,
        budgetMin: data.budget_min,
        budgetMax: data.budget_max,
        timeline: data.timeline,
        source: data.source,
        status: data.status,
        notes: data.notes,
        tags: data.tags || [],
        ownerId: data.owner_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
      setBuyer(buyerData);
      setOriginalUpdatedAt(buyerData.updatedAt);
    }
    setLoading(false);
  };

  const fetchHistory = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('buyer_history')
      .select(`
        id,
        changed_at,
        diff,
        profiles!buyer_history_changed_by_fkey(email)
      `)
      .eq('buyer_id', id)
      .order('changed_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      const historyData: HistoryEntry[] = data.map(item => ({
        id: item.id,
        changedAt: new Date(item.changed_at),
        diff: item.diff,
        changedBy: { email: (item.profiles as any)?.email || 'Unknown' }
      }));
      setHistory(historyData);
    }
  };

  const handleSubmit = async (data: BuyerFormData) => {
    if (!buyer || !user) return;

    // Check for concurrency - fetch current version
    const { data: currentBuyer, error: fetchError } = await supabase
      .from('buyers')
      .select('updated_at')
      .eq('id', buyer.id)
      .single();

    if (fetchError) {
      toast({
        title: "Error",
        description: "Failed to verify current data",
        variant: "destructive",
      });
      return;
    }

    const currentUpdatedAt = new Date(currentBuyer.updated_at);
    if (originalUpdatedAt && currentUpdatedAt.getTime() !== originalUpdatedAt.getTime()) {
      toast({
        title: "Concurrency Error",
        description: "Record has been modified by another user. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Check ownership
    if (buyer.ownerId !== user.id) {
      toast({
        title: "Permission Denied",
        description: "You can only edit your own leads",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('buyers')
      .update({
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
      })
      .eq('id', buyer.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update buyer lead",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Success!",
      description: "Buyer lead updated successfully.",
    });
    
    setIsEditing(false);
    fetchBuyer(); // Refresh data
    fetchHistory(); // Refresh history
  };

  const renderHistoryItem = (entry: HistoryEntry) => {
    if (entry.diff.action === 'created') {
      return (
        <div key={entry.id} className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-sm text-muted-foreground">Lead created</span>
          <span className="text-xs text-muted-foreground">
            {entry.changedAt.toLocaleDateString()} by {entry.changedBy.email}
          </span>
        </div>
      );
    }

    return (
      <div key={entry.id} className="py-2 border-b border-border">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Field changes</span>
          <span className="text-xs text-muted-foreground">
            {entry.changedAt.toLocaleDateString()} by {entry.changedBy.email}
          </span>
        </div>
        <div className="space-y-1">
          {Object.entries(entry.diff).map(([field, change]: [string, any]) => (
            <div key={field} className="text-xs text-muted-foreground">
              <span className="font-medium">{field}:</span>{' '}
              <span className="line-through">{change.old || 'empty'}</span> → {change.new || 'empty'}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading buyer details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!buyer) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground">Buyer not found</h2>
          <p className="text-muted-foreground mt-2">The buyer you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/buyers")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </div>
      </Layout>
    );
  }

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

  if (isEditing) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel Edit
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Edit Lead</h1>
              <p className="text-muted-foreground">Update buyer information</p>
            </div>
          </div>
          <BuyerForm 
            initialData={buyer} 
            onSubmit={handleSubmit} 
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/buyers")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{buyer.fullName}</h1>
              <p className="text-muted-foreground">Lead Details</p>
            </div>
          </div>
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Lead
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-foreground">{buyer.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-foreground">{buyer.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground">{buyer.email || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">City</label>
                    <p className="text-foreground">{buyer.city}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                    <p className="text-foreground">{buyer.propertyType}</p>
                  </div>
                  {buyer.bhk && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">BHK</label>
                      <p className="text-foreground">{buyer.bhk}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Purpose</label>
                    <p className="text-foreground">{buyer.purpose}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Budget</label>
                    <p className="text-foreground">{formatBudget(buyer.budgetMin, buyer.budgetMax)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Timeline</label>
                    <p className="text-foreground">{buyer.timeline}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Source</label>
                    <p className="text-foreground">{buyer.source}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {buyer.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{buyer.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status & Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge className="bg-blue-100 text-blue-800">{buyer.status}</Badge>
                  </div>
                </div>
                {buyer.tags && buyer.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {buyer.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-foreground">{buyer.createdAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-foreground">{buyer.updatedAt.toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {history.length > 0 ? (
                      history.map(renderHistoryItem)
                    ) : (
                      <div className="text-muted-foreground text-center py-4">
                        No history available
                      </div>
                    )}
                  </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BuyerDetailPage;