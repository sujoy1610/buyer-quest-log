import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "signin";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      let title = "Sign In Failed";
      let description = error.message;
      
      if (error.message?.includes("Email not confirmed")) {
        title = "Email Not Verified";
        description = "Please check your email and click the verification link before signing in.";
      } else if (error.message?.includes("Invalid login credentials")) {
        description = "Please check your email and password. If you just signed up, make sure to verify your email first.";
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      navigate("/buyers");
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background px-4">
      <div className="w-full max-w-md space-y-4">
        <Button variant="ghost" asChild className="self-start">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
        
        <Card className="w-full shadow-elegant border-border/50">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Lead Intake Pro
            </CardTitle>
            <CardDescription className="text-base">
              Manage your buyer leads with ease
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="signin" className="data-[state=active]:bg-background">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-background">Sign Up</TabsTrigger>
              </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-primary hover:bg-primary-hover transition-all duration-200" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-primary hover:bg-primary-hover transition-all duration-200" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;