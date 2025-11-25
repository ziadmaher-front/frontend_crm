import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, Building2, AlertCircle, Eye, EyeOff, Briefcase, MapPin, Loader2, ArrowLeft, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function CreateUser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId'); // Optional: to pre-fill from existing user
  const { user: currentUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    workId: "",
    workLocation: "",
    profileId: "",
    roleId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch profiles and roles from backend
  const { data: registerFormOptions, isLoading: isLoadingOptions } = useQuery({
    queryKey: ['registerFormOptions'],
    queryFn: async () => {
      try {
        return await base44.orchestrator.getRegisterFormOptions();
      } catch (error) {
        console.error('Error fetching register form options:', error);
        return { profiles: [], roles: [] };
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user data if userId is provided
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        return await base44.entities.User.get(userId);
      } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
    },
    enabled: !!userId,
  });

  // Populate form when user data is loaded
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        firstName: userData.firstName || userData.first_name || userData.name?.split(' ')[0] || "",
        lastName: userData.lastName || userData.last_name || userData.name?.split(' ').slice(1).join(' ') || "",
        email: userData.email || "",
        companyName: userData.companyName || userData.company || "",
        workId: userData.workId || userData.work_id || "",
        workLocation: userData.workLocation || userData.work_location || "",
        profileId: userData.profileId || userData.profile_id || "",
        roleId: userData.roleId || userData.role_id || "",
      }));
    }
  }, [userData]);

  const profiles = registerFormOptions?.profiles || [];
  const roles = registerFormOptions?.roles || [];

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.auth.register(data);
    },
    onSuccess: () => {
      toast.success('User created successfully');
      navigate('/settings');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user');
      setLocalError(error.message || 'Failed to create user');
    },
  });

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

    if (!formData.profileId.trim()) {
      errors.profileId = "Profile is required";
    }

    if (!formData.roleId.trim()) {
      errors.roleId = "Role is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    
    if (!validateForm()) {
      setLocalError("Please fix the errors below");
      return;
    }

    createUserMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      companyName: formData.companyName,
      workId: formData.workId,
      workLocation: formData.workLocation,
      profileId: formData.profileId,
      roleId: formData.roleId,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (localError) {
      setLocalError("");
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UserPlus className="w-8 h-8 text-indigo-500" />
              Create New User
            </h1>
            <p className="text-gray-600 mt-1">
              {userId ? 'Create user from existing data' : 'Add a new user to the system'}
            </p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Fill in the details to create a new user account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {localError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{localError}</AlertDescription>
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

            {/* Profile and Role */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profileId">Profile</Label>
                <Select
                  value={formData.profileId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, profileId: value }));
                    if (validationErrors.profileId) {
                      setValidationErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.profileId;
                        return newErrors;
                      });
                    }
                  }}
                  required
                  disabled={isLoadingOptions}
                >
                  <SelectTrigger id="profileId">
                    <SelectValue placeholder={isLoadingOptions ? "Loading profiles..." : "Select profile"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingOptions ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    ) : profiles.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">No profiles available</div>
                    ) : (
                      profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {validationErrors.profileId && (
                  <p className="text-xs text-red-600">{validationErrors.profileId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roleId">Role</Label>
                <Select
                  value={formData.roleId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, roleId: value }));
                    if (validationErrors.roleId) {
                      setValidationErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.roleId;
                        return newErrors;
                      });
                    }
                  }}
                  required
                  disabled={isLoadingOptions}
                >
                  <SelectTrigger id="roleId">
                    <SelectValue placeholder={isLoadingOptions ? "Loading roles..." : "Select role"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingOptions ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    ) : roles.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">No roles available</div>
                    ) : (
                      roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {validationErrors.roleId && (
                  <p className="text-xs text-red-600">{validationErrors.roleId}</p>
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
              {validationErrors.confirmPassword && (
                <p className="text-xs text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/settings')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={createUserMutation.isPending || isLoadingOptions}
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating user...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

