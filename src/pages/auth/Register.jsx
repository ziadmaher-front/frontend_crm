import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, Building2, AlertCircle, Eye, EyeOff, CheckCircle2, Briefcase, MapPin, Loader2, UserPlus, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function Register() {
  console.log('🚀 Register component rendering');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId'); // Optional: to pre-fill from existing user
  const { register, isLoading, error, clearError, isAuthenticated, user, hasPermission } = useAuthStore();
  
  // Check if user is admin (has manage_users permission or is administrator)
  // Also check if user has administrator profile or role
  const isAdmin = React.useMemo(() => {
    if (!user) return false;
    
    // Check permissions
    if (hasPermission('manage_users') || hasPermission('manage_settings')) {
      return true;
    }
    
    // Check profile name (various possible field names)
    const profileName = user.profile?.name || user.profileId?.name || user.profile_name || user.profileName;
    if (profileName === 'Administrator') {
      return true;
    }
    
    // Check role name (various possible field names)
    const roleName = user.role?.name || user.roleId?.name || user.role_name || user.roleName || user.role;
    if (roleName === 'Administrator') {
      return true;
    }
    
    return false;
  }, [user, hasPermission]);
  
  // Debug logging
  useEffect(() => {
    console.log('Register page - Admin check:', {
      hasUser: !!user,
      isAdmin,
      userProfile: user?.profile,
      userRole: user?.role,
      userObject: user,
      permissions: user?.permissions,
      hasManageUsers: hasPermission('manage_users'),
      hasManageSettings: hasPermission('manage_settings'),
    });
  }, [user, isAdmin, hasPermission]);
  
  // Log when admin interface should show
  useEffect(() => {
    if (isAdmin) {
      console.log('Admin interface should be displayed');
    } else {
      console.log('Public registration form should be displayed');
    }
  }, [isAdmin]);
  
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
  const hasRedirected = useRef(false);

  // Fetch profiles and roles from backend
  // Note: The endpoint requires authentication, so we only fetch when authenticated
  const queryClient = useQueryClient();
  const token = localStorage.getItem('authToken');
  const shouldFetch = isAuthenticated || !!token; // Fetch if authenticated or has token
  
  // Manual refetch function for testing
  const handleManualRefetch = () => {
    console.log('🔄 Manual refetch triggered');
    queryClient.invalidateQueries({ queryKey: ['registerFormOptions'] });
  };
  
  // Debug: Log token and auth status
  useEffect(() => {
    console.log('🔐 Register form - Auth check:', {
      hasToken: !!token,
      isAuthenticated,
      isAdmin,
      shouldFetch,
      user: user ? { id: user.id, email: user.email } : null,
    });
  }, [token, isAuthenticated, isAdmin, shouldFetch, user]);
  
  const { data: registerFormOptions, isLoading: isLoadingOptions, error: optionsError } = useQuery({
    queryKey: ['registerFormOptions', token, isAuthenticated], // Include both token and auth state in query key
    queryFn: async () => {
      console.log('🔵 [QUERY EXECUTING] Fetching register form options...');
      console.log('🔵 Token available:', !!token);
      console.log('🔵 Is authenticated:', isAuthenticated);
      
      try {
        const result = await base44.orchestrator.getRegisterFormOptions();
        console.log('✅ [SUCCESS] Register form options result:', result);
        console.log('✅ Profiles array:', result?.profiles);
        console.log('✅ Roles array:', result?.roles);
        console.log('✅ Profiles count:', result?.profiles?.length || 0);
        console.log('✅ Roles count:', result?.roles?.length || 0);
        
        // Log if arrays are empty
        if (!result?.profiles?.length) {
          console.warn('⚠️ [WARNING] No profiles returned from API');
        }
        if (!result?.roles?.length) {
          console.warn('⚠️ [WARNING] No roles returned from API');
        }
        
        return result;
      } catch (error) {
        // Log the full error for debugging
        console.error('❌ [ERROR] Error fetching register form options:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        // Return empty arrays on error
        return { profiles: [], roles: [] };
      }
    },
    enabled: shouldFetch, // Fetch if authenticated or has token
    retry: 2, // Retry twice
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (reduced from 5)
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
  });
  
  // Debug: Log query state changes
  useEffect(() => {
    console.log('🔍 [QUERY STATE] Register form query state:', {
      isLoading: isLoadingOptions,
      hasData: !!registerFormOptions,
      hasError: !!optionsError,
      profilesCount: registerFormOptions?.profiles?.length || 0,
      rolesCount: registerFormOptions?.roles?.length || 0,
      profiles: registerFormOptions?.profiles,
      roles: registerFormOptions?.roles,
      error: optionsError,
      enabled: shouldFetch,
    });
  }, [isLoadingOptions, registerFormOptions, optionsError, shouldFetch]);

  // Fetch user data if userId is provided (for admin pre-filling)
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId || !isAdmin) return null;
      try {
        return await base44.entities.User.get(userId);
      } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
    },
    enabled: !!userId && !!isAdmin,
  });

  // Populate form when user data is loaded (for admin)
  useEffect(() => {
    if (userData && isAdmin) {
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
  }, [userData, isAdmin]);

  const profiles = registerFormOptions?.profiles || [];
  const roles = registerFormOptions?.roles || [];
  
  // Helper function to get role name from roleId
  const getRoleName = (roleId) => {
    if (!roleId) return 'Employee';
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Employee';
  };
  
  // Debug: Log extracted profiles and roles
  useEffect(() => {
    console.log('📋 Extracted profiles and roles:', {
      profilesCount: profiles.length,
      rolesCount: roles.length,
      profiles: profiles,
      roles: roles,
    });
  }, [profiles, roles]);

  // Create user mutation (for admin)
  const createUserMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.auth.register(data);
    },
    onSuccess: () => {
      toast.success('User created successfully');
      if (isAdmin) {
        navigate('/settings');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user');
      setLocalError(error.message || 'Failed to create user');
    },
  });

  // Redirect to dashboard if already authenticated (only once) - but NOT if admin
  // Check both state and localStorage for token to avoid race conditions
  // IMPORTANT: Only redirect if we're sure the user is NOT an admin
  useEffect(() => {
    // Skip redirect check entirely if user is admin
    if (isAdmin) {
      console.log('Register: User is admin, skipping redirect check');
      return;
    }
    
    const token = localStorage.getItem('authToken');
    
    // Only redirect if authenticated, has user, has token, and is NOT admin
    // Add a small delay to ensure all checks are complete
    const checkAndRedirect = setTimeout(() => {
      if (isAuthenticated && user && token && !hasRedirected.current) {
        console.log('Register useEffect: Redirecting to dashboard (user is not admin)', {
          isAuthenticated,
          hasUser: !!user,
          hasToken: !!token,
          isAdmin,
        });
        hasRedirected.current = true;
        navigate("/dashboard", { replace: true });
      }
    }, 200); // Small delay to ensure isAdmin is calculated
    
    return () => clearTimeout(checkAndRedirect);
  }, [isAuthenticated, user, navigate, isAdmin]);

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
    clearError();

    if (!validateForm()) {
      setLocalError("Please fix the errors below");
      return;
    }

    try {
      // Combine firstName and lastName into name for backend
      const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
      
      // Get role name from roleId
      const roleName = getRoleName(formData.roleId);
      
      // Prepare registration data matching backend API structure
      const registrationData = {
        name: fullName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        workId: formData.workId,
        workLocation: formData.workLocation,
        profileId: formData.profileId,
        roleId: formData.roleId,
        role: roleName, // Legacy role field (string name) - required by backend
      };
      
      // If admin is creating a user, use createUserMutation
      if (isAdmin) {
        await createUserMutation.mutateAsync(registrationData);
      } else {
        // Regular user registration
        await register(registrationData);
        // Reset redirect flag so useEffect can handle the redirect
        hasRedirected.current = false;
        // The useEffect will handle redirect when isAuthenticated becomes true
      }
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

  // Show admin interface if user is admin
  if (isAdmin) {
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
              Back to Settings
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="profileId">Profile</Label>
                    {optionsError && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleManualRefetch}
                        className="text-xs h-6"
                      >
                        Retry
                      </Button>
                    )}
                  </div>
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
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          {optionsError ? "Error loading profiles" : "No profiles available"}
                        </div>
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
                  {optionsError && (
                    <p className="text-xs text-yellow-600">Could not load profiles. Click Retry to try again.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="roleId">Role</Label>
                    {optionsError && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleManualRefetch}
                        className="text-xs h-6"
                      >
                        Retry
                      </Button>
                    )}
                  </div>
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
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          {optionsError ? "Error loading roles" : "No roles available"}
                        </div>
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
                  {optionsError && (
                    <p className="text-xs text-yellow-600">Could not load roles. Click Retry to try again.</p>
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
                  disabled={isLoading || createUserMutation.isPending || isLoadingOptions}
                >
                  {isLoading || createUserMutation.isPending ? (
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
                  {optionsError && (
                    <p className="text-xs text-yellow-600">Could not load profiles. Please refresh the page.</p>
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
                  {optionsError && (
                    <p className="text-xs text-yellow-600">Could not load roles. Please refresh the page.</p>
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

