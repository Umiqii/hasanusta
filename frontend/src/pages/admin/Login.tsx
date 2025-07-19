import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast"; // Import useToast for displaying errors

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error: authError } = useAuth(); // Get login function, loading state and error from context
  const navigate = useNavigate();
  const { toast } = useToast(); // Initialize toast
  const [localError, setLocalError] = useState<string | null>(null); // Local error state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null); // Clear local error on new submission

    try {

      await login(email, password); // Call the login function from context
      
      // Check authentication status after login attempt
      // Note: AuthProvider handles navigation on success internally in this setup
      // We might need to adjust this if navigation should happen here.
      // For now, we rely on the AuthProvider's logic. 
      // If login fails, the error will be caught below.

      
      // Since AuthProvider handles navigation on success, we might not reach here on success
      // If we need to navigate explicitly from here:
      // const { isAuthenticated } = useAuth(); // Re-fetch state if needed
      // if (isAuthenticated) navigate("/admin/dashboard"); 
      // But usually context update triggers re-render and ProtectedRoute handles redirection
      navigate("/admin/dashboard"); // Navigate on successful completion (assuming no error thrown)

    } catch (err: any) {
      // Error should be set in AuthContext, but we can also set a local error or show a toast
      console.error("Login component: Caught error during login:", err);
      setLocalError(err.message || t('loginPage.loginError'));
       toast({ // Show toast on error
         variant: "destructive",
         title: t('loginPage.loginFailedTitle'),
         description: err.message || t('loginPage.loginError'),
       });
    }
  };

  // Use authError from context if available, otherwise use localError
  const displayError = authError || localError;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-serif">{t('loginPage.title')}</CardTitle>
          <CardDescription>{t('loginPage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('loginPage.emailLabel')}</Label>
              <Input
                id="email"
                type="email" // Or "text" if you allow username login
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading} // Use loading state from context
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('loginPage.passwordLabel')}</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading} // Use loading state from context
              />
            </div>
            {displayError && (
              <p className="text-sm text-red-600">{displayError}</p>
            )}
            <Button type="submit" className="w-full bg-primary-red hover:bg-red-700" disabled={loading}> {/* Use loading state from context */}
              {loading ? t('loginPage.loadingButton') : t('loginPage.loginButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 