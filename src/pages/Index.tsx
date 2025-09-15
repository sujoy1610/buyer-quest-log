import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Plus, BarChart3, FileText, ChevronDown, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-primary">Lead Intake Pro</h1>
            <div className="flex space-x-4">
              {user ? (
                <Button asChild>
                  <Link to="/buyers">
                    <Users className="w-4 h-4 mr-2" />
                    View Leads
                  </Link>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem asChild>
                      <Link to="/auth" className="w-full cursor-pointer">
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/auth?tab=signup" className="w-full cursor-pointer">
                        Sign Up
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Buyer Lead Management
            <span className="block text-primary mt-2">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Capture, track, and manage buyer leads with comprehensive validation, 
            advanced filtering, and powerful analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/buyers/new">
                <Plus className="w-5 h-5 mr-2" />
                Create New Lead
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link to="/buyers">
                <Users className="w-5 h-5 mr-2" />
                View All Leads
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="border-border/50 shadow-card hover:shadow-elegant transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                Lead Management
              </CardTitle>
              <CardDescription>
                Comprehensive buyer information capture with smart validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Contact & property requirements</li>
                <li>• Budget range validation</li>
                <li>• Timeline & source tracking</li>
                <li>• Custom tags & notes</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-card hover:shadow-elegant transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                Advanced Filtering
              </CardTitle>
              <CardDescription>
                Search and filter leads with real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time search functionality</li>
                <li>• Multi-criteria filtering</li>
                <li>• Status-based organization</li>
                <li>• URL-synchronized filters</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-card hover:shadow-elegant transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                Data Management
              </CardTitle>
              <CardDescription>
                CSV import/export with validation and error handling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Bulk CSV import (200 rows max)</li>
                <li>• Filtered data export</li>
                <li>• Row-level error reporting</li>
                <li>• Transaction-safe operations</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Stats Preview */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border/50">
          <h2 className="text-2xl font-bold text-center mb-8">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">2</div>
              <div className="text-sm text-muted-foreground">Total Leads</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-success">1</div>
              <div className="text-sm text-muted-foreground">Qualified</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-warning">1</div>
              <div className="text-sm text-muted-foreground">New</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-muted-foreground">0</div>
              <div className="text-sm text-muted-foreground">Converted</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Create your first buyer lead or explore existing ones
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link to="/buyers/new">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Lead
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
