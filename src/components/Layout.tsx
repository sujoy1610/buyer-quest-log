import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, Plus, Download, Upload, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { importCSV, exportCSV } from "@/lib/csv";
import {toast} from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleImportCSV = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".csv";
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      try {
        const { errors, inserted } = await importCSV(file);

        if (errors.length) {
          console.table(errors); // Debug, later show in UI
          toast({
            title: "Import completed with errors",
            description: `${inserted} rows inserted, ${errors.length} errors`,
          });
        } else {
          toast({
            title: "Import successful",
            description: `${inserted} rows inserted successfully`,
          });
        }
      } catch (err: any) {
        toast({
          title: "Import failed",
          description: err.message,
          variant: "destructive",
        });
      }
    }
  };
  input.click();
};



 const handleExportCSV = async () => {
  try {
    const { data, error } = await supabase.from("buyers").select("*");
    if (error) throw error;

    exportCSV(data || []);
    toast({
      title: "Export successful",
      description: `${data?.length || 0} rows exported`,
    });
  } catch (err: any) {
    toast({
      title: "Export failed",
      description: err.message,
      variant: "destructive",
    });
  }
};

  const navigation = [
    { name: "Buyers", href: "/buyers", icon: Users },
    { name: "New Lead", href: "/buyers/new", icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-primary">
                Lead Intake Pro
              </Link>
              <nav className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-smooth",
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleImportCSV}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              {user && (
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="truncate max-w-[120px]">
                      {profile?.full_name || user.email}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;