import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Building2, 
  Save,
  Camera
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function Profile() {
  const { user: storeUser } = useAuthStore();
  const [user, setUser] = useState(storeUser || null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    mobile: "",
    job_title: "",
    department: "",
    bio: "",
    address: "",
    city: "",
    country: "",
    territory: "",
    default_currency: "USD",
    timezone: "UTC",
    language: "en",
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize with store user if available
    if (storeUser) {
      setUser(storeUser);
      setFormData({
        full_name: storeUser.full_name || storeUser.name || "",
        email: storeUser.email || "",
        phone: storeUser.phone || "",
        mobile: storeUser.mobile || "",
        job_title: storeUser.job_title || storeUser.role || "",
        department: storeUser.department || "",
        bio: storeUser.bio || "",
        address: storeUser.address || "",
        city: storeUser.city || "",
        country: storeUser.country || "",
        territory: storeUser.territory || "",
        default_currency: storeUser.default_currency || "USD",
        timezone: storeUser.timezone || "UTC",
        language: storeUser.language || "en",
      });
      setLoading(false);
    }

    // Fetch fresh data from backend
    base44.auth.me()
      .then(userData => {
        console.log('Profile: Fetched user data from backend:', userData);
        setUser(userData);
        setFormData({
          full_name: userData.full_name || userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          mobile: userData.mobile || "",
          job_title: userData.job_title || userData.role || "",
          department: userData.department || "",
          bio: userData.bio || "",
          address: userData.address || "",
          city: userData.city || "",
          country: userData.country || "",
          territory: userData.territory || "",
          default_currency: userData.default_currency || "USD",
          timezone: userData.timezone || "UTC",
          language: userData.language || "en",
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Profile: Error fetching user data:', error);
        setLoading(false);
      });
  }, [storeUser]);

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list(),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_photo_url: file_url });
      setUser({ ...user, profile_photo_url: file_url });
      toast.success("Profile photo updated");
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const userOrganizations = organizations.filter(org => 
    user?.organization_ids?.includes(org.id)
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-8 h-8 text-indigo-500" />
          My Profile
        </h1>
        <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Photo Card */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative">
              {user?.profile_photo_url ? (
                <img 
                  src={user.profile_photo_url} 
                  alt={user.full_name}
                  className="w-32 h-32 rounded-full object-cover shadow-lg ring-4 ring-indigo-500/20"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-4xl">
                    {user?.full_name?.[0] || 'U'}
                  </span>
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Camera className="w-5 h-5 text-gray-700" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="text-center mt-4">
              <h3 className="font-semibold text-lg">{user?.full_name}</h3>
              <p className="text-sm text-gray-500">{user?.job_title}</p>
              <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
            </div>
            {uploading && (
              <p className="text-sm text-indigo-600 mt-2">Uploading...</p>
            )}
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="border-none shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="work">Work</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile</Label>
                      <Input
                        id="mobile"
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="work">
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        value={formData.job_title}
                        onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="territory">Territory</Label>
                    <Select value={formData.territory} onValueChange={(value) => setFormData({...formData, territory: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select territory..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Egypt">Egypt</SelectItem>
                        <SelectItem value="UAE">UAE</SelectItem>
                        <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {userOrganizations.length > 0 && (
                    <div className="space-y-2">
                      <Label>Organizations</Label>
                      <div className="space-y-2">
                        {userOrganizations.map(org => (
                          <div key={org.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            {org.logo_url ? (
                              <img src={org.logo_url} alt={org.organization_name} className="w-8 h-8 rounded" />
                            ) : (
                              <Building2 className="w-8 h-8 text-gray-400" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{org.organization_name}</p>
                              <p className="text-xs text-gray-500">{org.industry}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="preferences">
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="default_currency">Default Currency</Label>
                      <Select value={formData.default_currency} onValueChange={(value) => setFormData({...formData, default_currency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EGP">EGP (E£)</SelectItem>
                          <SelectItem value="AED">AED (د.إ)</SelectItem>
                          <SelectItem value="SAR">SAR (﷼)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={formData.timezone}
                        onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={formData.language} onValueChange={(value) => setFormData({...formData, language: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}