import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Shield, 
  Bell, 
  Settings, 
  Mail, 
  Database, 
  HardDrive,
  Clock,
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Lock,
  Unlock,
  Trash2,
  Download,
  Upload,
  Activity,
  Server,
  Globe,
  Smartphone
} from 'lucide-react';

interface SettingsData {
  profile: {
    name: string;
    email: string;
    role: string;
    lastLogin: string;
    isActive: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordLastChanged: string;
    loginAttempts: number;
  };
  notifications: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    newsletterNotifications: boolean;
    systemAlerts: boolean;
  };
  system: {
    maintenanceMode: boolean;
    debugMode: boolean;
    autoBackup: boolean;
    backupFrequency: string;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
  };
}

const SettingsManagement = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  // Form states for each section
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: 30
  });

  const [notificationForm, setNotificationForm] = useState({
    emailNotifications: true,
    orderNotifications: true,
    newsletterNotifications: true,
    systemAlerts: true
  });

  const [systemForm, setSystemForm] = useState({
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
  });

  const [emailForm, setEmailForm] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: false,
    fromEmail: '',
    fromName: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
        
        // Initialize form states
        setProfileForm({
          name: data.data.profile.name,
          email: data.data.profile.email
        });
        
        setNotificationForm(data.data.notifications);
        setSystemForm(data.data.system);
        setEmailForm({
          ...data.data.email,
          smtpPassword: '' // Don't populate password for security
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving('profile');
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile settings updated successfully",
        });
        await fetchSettings(); // Refresh settings
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update profile settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile settings",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleSecurityUpdate = async () => {
    try {
      setSaving('security');
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings/security`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(securityForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Security settings updated successfully",
        });
        setSecurityForm({
          ...securityForm,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update security settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setSaving('notifications');
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings/notifications`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Notification settings updated successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update notification settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleSystemUpdate = async () => {
    try {
      setSaving('system');
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings/system`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(systemForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "System settings updated successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update system settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update system settings",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleEmailUpdate = async () => {
    // Validate required fields
    if (!emailForm.smtpHost || !emailForm.smtpPort || !emailForm.smtpUser) {
      toast({
        title: "Validation Error",
        description: "SMTP Host, Port, and Username are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving('email');
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings/email`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Email settings updated successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update email settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email settings",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const testEmailConfiguration = async () => {
    // Validate required fields for testing
    if (!emailForm.smtpHost || !emailForm.smtpPort || !emailForm.smtpUser || !emailForm.smtpPassword) {
      console.log('❌ Frontend validation failed:', {
        smtpHost: !!emailForm.smtpHost,
        smtpPort: !!emailForm.smtpPort,
        smtpUser: !!emailForm.smtpUser,
        smtpPassword: !!emailForm.smtpPassword
      });
      toast({
        title: "Validation Error",
        description: "SMTP Host, Port, Username, and Password are required for testing",
        variant: "destructive",
      });
      return;
    }

    // Prepare the data to send
    const testData = {
      smtpHost: emailForm.smtpHost.trim(),
      smtpPort: parseInt(emailForm.smtpPort),
      smtpUser: emailForm.smtpUser.trim(),
      smtpPassword: emailForm.smtpPassword,
      smtpSecure: emailForm.smtpSecure,
      fromEmail: emailForm.fromEmail.trim() || emailForm.smtpUser.trim(),
      fromName: emailForm.fromName.trim() || 'E-commerce Admin'
    };

    console.log('🔍 Frontend sending test email data:', {
      smtpHost: testData.smtpHost,
      smtpPort: testData.smtpPort,
      smtpUser: testData.smtpUser,
      smtpPassword: testData.smtpPassword ? '[HIDDEN]' : 'MISSING',
      smtpSecure: testData.smtpSecure,
      fromEmail: testData.fromEmail,
      fromName: testData.fromName
    });

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings/email/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      console.log('🔍 Frontend response status:', response.status);
      console.log('🔍 Frontend response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 Frontend success result:', result);
        toast({
          title: "Success",
          description: result.message || "Test email sent successfully",
        });
      } else {
        const error = await response.json();
        console.log('🔍 Frontend error result:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to send test email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('🔍 Frontend catch error:', error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Not Available</h3>
        <p className="text-gray-600">Unable to load settings. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="px-2 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-600">Manage your account and system preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2 h-auto sm:h-10">
          <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm h-auto py-2 sm:py-0">
            <User className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm h-auto py-2 sm:py-0">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm h-auto py-2 sm:py-0">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm h-auto py-2 sm:py-0">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>System</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm h-auto py-2 sm:py-0">
            <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Email</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <User className="h-5 w-5 mr-2" />
                Profile Settings
              </CardTitle>
              <CardDescription className="text-sm">
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="name" className="text-sm">Full Name</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="text-sm mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm">Email Address</Label>
                  <Input
                    id="email"
                    value={profileForm.email}
                    disabled
                    className="bg-gray-50 text-sm mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <Label className="text-sm">Role</Label>
                  <Input value={settings.profile.role} disabled className="bg-gray-50 text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={settings.profile.isActive ? "default" : "secondary"} className="text-xs">
                      {settings.profile.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Last Login</Label>
                  <Input value={new Date(settings.profile.lastLogin).toLocaleString()} disabled className="bg-gray-50 text-sm mt-1" />
                </div>
              </div>

              <Button 
                onClick={handleProfileUpdate}
                disabled={saving === 'profile'}
                className="w-full sm:w-auto text-sm"
              >
                {saving === 'profile' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-sm">
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="currentPassword" className="text-sm">Current Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="text-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? 'Hide Password' : 'Show Password'}</span>
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="text-sm mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="text-sm mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout" className="text-sm">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securityForm.sessionTimeout}
                    onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeout: parseInt(e.target.value) })}
                    min="5"
                    max="480"
                    className="text-sm mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="twoFactor"
                  checked={securityForm.twoFactorEnabled}
                  onCheckedChange={(checked) => setSecurityForm({ ...securityForm, twoFactorEnabled: checked })}
                />
                <Label htmlFor="twoFactor" className="text-sm">Enable Two-Factor Authentication</Label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label className="text-sm">Password Last Changed</Label>
                  <Input value={new Date(settings.security.passwordLastChanged).toLocaleDateString()} disabled className="bg-gray-50 text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Login Attempts</Label>
                  <Input value={settings.security.loginAttempts} disabled className="bg-gray-50 text-sm mt-1" />
                </div>
              </div>

              <Button 
                onClick={handleSecurityUpdate}
                disabled={saving === 'security'}
                className="w-full sm:w-auto text-sm"
              >
                {saving === 'security' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription className="text-sm">
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <Label className="text-sm">Email Notifications</Label>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationForm.emailNotifications}
                    onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, emailNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <Label className="text-sm">Order Notifications</Label>
                    <p className="text-xs text-gray-500">Get notified about new orders</p>
                  </div>
                  <Switch
                    checked={notificationForm.orderNotifications}
                    onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, orderNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <Label className="text-sm">Newsletter Notifications</Label>
                    <p className="text-xs text-gray-500">Receive newsletter updates</p>
                  </div>
                  <Switch
                    checked={notificationForm.newsletterNotifications}
                    onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, newsletterNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <Label className="text-sm">System Alerts</Label>
                    <p className="text-xs text-gray-500">Important system notifications</p>
                  </div>
                  <Switch
                    checked={notificationForm.systemAlerts}
                    onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, systemAlerts: checked })}
                  />
                </div>
              </div>

              <Button 
                onClick={handleNotificationUpdate}
                disabled={saving === 'notifications'}
                className="w-full sm:w-auto text-sm"
              >
                {saving === 'notifications' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Settings className="h-5 w-5 mr-2" />
                System Settings
              </CardTitle>
              <CardDescription className="text-sm">
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <Label className="text-sm">Maintenance Mode</Label>
                    <p className="text-xs text-gray-500">Put the system in maintenance mode</p>
                  </div>
                  <Switch
                    checked={systemForm.maintenanceMode}
                    onCheckedChange={(checked) => setSystemForm({ ...systemForm, maintenanceMode: checked })}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <Label className="text-sm">Debug Mode</Label>
                    <p className="text-xs text-gray-500">Enable debug logging</p>
                  </div>
                  <Switch
                    checked={systemForm.debugMode}
                    onCheckedChange={(checked) => setSystemForm({ ...systemForm, debugMode: checked })}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <Label className="text-sm">Auto Backup</Label>
                    <p className="text-xs text-gray-500">Automatically backup data</p>
                  </div>
                  <Switch
                    checked={systemForm.autoBackup}
                    onCheckedChange={(checked) => setSystemForm({ ...systemForm, autoBackup: checked })}
                  />
                </div>

                <div>
                  <Label className="text-sm">Backup Frequency</Label>
                  <Select value={systemForm.backupFrequency} onValueChange={(value) => setSystemForm({ ...systemForm, backupFrequency: value })}>
                    <SelectTrigger className="text-sm mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label className="text-sm">Max File Size (MB)</Label>
                  <Input
                    type="number"
                    value={systemForm.maxFileSize}
                    onChange={(e) => setSystemForm({ ...systemForm, maxFileSize: parseInt(e.target.value) })}
                    min="1"
                    max="100"
                    className="text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Allowed File Types</Label>
                  <Input
                    value={systemForm.allowedFileTypes.join(', ')}
                    onChange={(e) => setSystemForm({ ...systemForm, allowedFileTypes: e.target.value.split(',').map(t => t.trim()) })}
                    placeholder="jpg, png, pdf, doc"
                    className="text-sm mt-1"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSystemUpdate}
                disabled={saving === 'system'}
                className="w-full sm:w-auto text-sm"
              >
                {saving === 'system' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Mail className="h-5 w-5 mr-2" />
                Email Configuration
              </CardTitle>
              <CardDescription className="text-sm">
                Configure email server settings for notifications and newsletters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Email Configuration Help</h4>
                <p className="text-xs sm:text-sm text-blue-700">
                  Configure your SMTP settings for sending newsletters and notifications. 
                  For Gmail, use smtp.gmail.com with port 587 and enable "Less secure app access" or use an App Password.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <Label className="text-sm">SMTP Host</Label>
                  <Input
                    value={emailForm.smtpHost}
                    onChange={(e) => setEmailForm({ ...emailForm, smtpHost: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="text-sm mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">e.g., smtp.gmail.com, smtp.outlook.com</p>
                </div>
                <div>
                  <Label className="text-sm">SMTP Port</Label>
                  <Input
                    type="number"
                    value={emailForm.smtpPort}
                    onChange={(e) => setEmailForm({ ...emailForm, smtpPort: parseInt(e.target.value) })}
                    placeholder="587"
                    className="text-sm mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Common ports: 587 (TLS), 465 (SSL), 25</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <Label className="text-sm">SMTP Username</Label>
                  <Input
                    value={emailForm.smtpUser}
                    onChange={(e) => setEmailForm({ ...emailForm, smtpUser: e.target.value })}
                    placeholder="your-email@gmail.com"
                    className="text-sm mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your email address</p>
                </div>
                <div>
                  <Label className="text-sm">SMTP Password</Label>
                  <Input
                    type="password"
                    value={emailForm.smtpPassword}
                    onChange={(e) => setEmailForm({ ...emailForm, smtpPassword: e.target.value })}
                    placeholder="Enter SMTP password"
                    className="text-sm mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your email password or app password</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <Label className="text-sm">From Email</Label>
                  <Input
                    value={emailForm.fromEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, fromEmail: e.target.value })}
                    placeholder="noreply@yourdomain.com"
                    className="text-sm mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email address that appears as sender</p>
                </div>
                <div>
                  <Label className="text-sm">From Name</Label>
                  <Input
                    value={emailForm.fromName}
                    onChange={(e) => setEmailForm({ ...emailForm, fromName: e.target.value })}
                    placeholder="Your Store Name"
                    className="text-sm mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Name that appears as sender</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smtpSecure"
                  checked={emailForm.smtpSecure}
                  onCheckedChange={(checked) => setEmailForm({ ...emailForm, smtpSecure: checked })}
                />
                <Label htmlFor="smtpSecure" className="text-sm">Use Secure Connection (SSL/TLS)</Label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleEmailUpdate}
                  disabled={saving === 'email'}
                  className="w-full sm:w-auto text-sm"
                >
                  {saving === 'email' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Email Settings
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={testEmailConfiguration}
                  className="w-full sm:w-auto text-sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Test Email Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsManagement; 