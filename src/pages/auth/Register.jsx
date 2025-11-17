import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, Building2, AlertCircle, Eye, EyeOff, CheckCircle2, Briefcase, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    workId: "",
    workLocation: "",
    role: "",
    roleInCrm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const hasRedirected = useRef(false);

  // Redirect to dashboard if already authenticated (only once)
  // Check both state and localStorage for token to avoid race conditions
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (isAuthenticated && user && token && !hasRedirected.current) {
      console.log('Register useEffect: Redirecting to dashboard', {
        isAuthenticated,
        hasUser: !!user,
        hasToken: !!token,
      });
      hasRedirected.current = true;
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.companyName.trim()) {
      errors.companyName = "Company name is required";
    }

    if (!formData.workId.trim()) {
      errors.workId = "Work ID is required";
    }

    if (!formData.workLocation.trim()) {
      errors.workLocation = "Work location is required";
    }

    if (!formData.role.trim()) {
      errors.role = "Role is required";
    }

    if (!formData.roleInCrm.trim()) {
      errors.roleInCrm = "CRM role is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!validateForm()) {
      setLocalError("Please fix the errors below");
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        workId: formData.workId,
        workLocation: formData.workLocation,
        role: formData.role,
        roleInCrm: formData.roleInCrm,
      });
      // Reset redirect flag so useEffect can handle the redirect
      hasRedirected.current = false;
      // The useEffect will handle redirect when isAuthenticated becomes true
    } catch (err) {
      setLocalError(err.message || "Registration failed. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (localError || error) {
      setLocalError("");
      clearError();
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;

    const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    return { strength, label: labels[strength] };
  };

  const passwordStrengthInfo = passwordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Zash CRM
          </h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Register Card */}
        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Get started</CardTitle>
            <CardDescription>
              Sign up to start managing your sales pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {(localError || error) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{localError || error}</AlertDescription>
                </Alert>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-10"
                      required
                      autoComplete="given-name"
                    />
                  </div>
                  {validationErrors.firstName && (
                    <p className="text-xs text-red-600">{validationErrors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="pl-10"
                      required
                      autoComplete="family-name"
                    />
                  </div>
                  {validationErrors.lastName && (
                    <p className="text-xs text-red-600">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-xs text-red-600">{validationErrors.email}</p>
                )}
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="Acme Inc."
                    value={formData.companyName}
                    onChange={handleChange}
                    className="pl-10"
                    required
                    autoComplete="organization"
                  />
                </div>
                {validationErrors.companyName && (
                  <p className="text-xs text-red-600">{validationErrors.companyName}</p>
                )}
              </div>

              {/* Work ID */}
              <div className="space-y-2">
                <Label htmlFor="workId">Work ID</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="workId"
                    name="workId"
                    type="text"
                    placeholder="EMP001"
                    value={formData.workId}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
                {validationErrors.workId && (
                  <p className="text-xs text-red-600">{validationErrors.workId}</p>
                )}
              </div>

              {/* Work Location */}
              <div className="space-y-2">
                <Label htmlFor="workLocation">Work Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="workLocation"
                    name="workLocation"
                    type="text"
                    placeholder="Cairo, Egypt"
                    value={formData.workLocation}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
                {validationErrors.workLocation && (
                  <p className="text-xs text-red-600">{validationErrors.workLocation}</p>
                )}
              </div>

              {/* Role and CRM Role */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                    required
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sales Rep">Sales Rep</SelectItem>
                      <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                      <SelectItem value="Account Manager">Account Manager</SelectItem>
                      <SelectItem value="Sales Director">Sales Director</SelectItem>
                      <SelectItem value="CEO">CEO</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.role && (
                    <p className="text-xs text-red-600">{validationErrors.role}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roleInCrm">CRM Role</Label>
                  <Select
                    value={formData.roleInCrm}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, roleInCrm: value }))}
                    required
                  >
                    <SelectTrigger id="roleInCrm">
                      <SelectValue placeholder="Select CRM role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="User">User</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.roleInCrm && (
                    <p className="text-xs text-red-600">{validationErrors.roleInCrm}</p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Password strength:</span>
                      <span className={`font-semibold ${
                        passwordStrengthInfo.strength <= 2 ? "text-red-600" :
                        passwordStrengthInfo.strength <= 3 ? "text-yellow-600" :
                        "text-green-600"
                      }`}>
                        {passwordStrengthInfo.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passwordStrengthInfo.strength <= 2 ? "bg-red-500" :
                          passwordStrengthInfo.strength <= 3 ? "bg-yellow-500" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${(passwordStrengthInfo.strength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {validationErrors.password && (
                  <p className="text-xs text-red-600">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="flex items-center text-xs text-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Passwords match
                  </div>
                )}
                {validationErrors.confirmPassword && (
                  <p className="text-xs text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the{" "}
                  <a href="#" className="text-indigo-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-indigo-600 hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-indigo-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-indigo-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

