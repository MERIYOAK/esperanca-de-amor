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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and system preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={profileForm.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Role</Label>
                  <Input value={settings.profile.role} disabled className="bg-gray-50" />
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant={settings.profile.isActive ? "default" : "secondary"}>
                      {settings.profile.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Last Login</Label>
                  <Input value={new Date(settings.profile.lastLogin).toLocaleString()} disabled className="bg-gray-50" />
                </div>
              </div>

              <Button 
                onClick={handleProfileUpdate}
                disabled={saving === 'profile'}
                className="w-full md:w-auto"
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
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securityForm.sessionTimeout}
                    onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeout: parseInt(e.target.value) })}
                    min="5"
                    max="480"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="twoFactor"
                  checked={securityForm.twoFactorEnabled}
                  onCheckedChange={(checked) => setSecurityForm({ ...securityForm, twoFactorEnabled: checked })}
                />
                <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Password Last Changed</Label>
                  <Input value={new Date(settings.security.passwordLastChanged).toLocaleDateString()} disabled className="bg-gray-50" />
                </div>
                <div>
                  <Label>Login Attempts</Label>
                  <Input value={settings.security.loginAttempts} disabled className="bg-gray-50" />
                </div>
              </div>

              <Button 
                onClick={handleSecurityUpdate}
                disabled={saving === 'security'}
                className="w-full md:w-auto"
              >
                {saving === 'security' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Security
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationForm.emailNotifications}
                    onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, emailNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Order Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified about new orders</p>
                  </div>
                  <Switch
                    checked={notificationForm.orderNotifications}
                    onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, orderNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Newsletter Notifications</Label>
                    <p className="text-sm text-gray-500">Receive newsletter updates</p>
                  </div>
                  <Switch
                    checked={notificationForm.newsletterNotifications}
                    onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, newsletterNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Alerts</Label>
                    <p className="text-sm text-gray-500">Important system notifications</p>
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
                className="w-full md:w-auto"
              >
                {saving === 'notifications' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notifications
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Put the system in maintenance mode</p>
                  </div>
                  <Switch
                    checked={systemForm.maintenanceMode}
                    onCheckedChange={(checked) => setSystemForm({ ...systemForm, maintenanceMode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-gray-500">Enable debug logging</p>
                  </div>
                  <Switch
                    checked={systemForm.debugMode}
                    onCheckedChange={(checked) => setSystemForm({ ...systemForm, debugMode: checked })}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Backup</Label>
                    <p className="text-sm text-gray-500">Automatically backup data</p>
                  </div>
                  <Switch
                    checked={systemForm.autoBackup}
                    onCheckedChange={(checked) => setSystemForm({ ...systemForm, autoBackup: checked })}
                  />
                </div>

                <div>
                  <Label>Backup Frequency</Label>
                  <Select value={systemForm.backupFrequency} onValueChange={(value) => setSystemForm({ ...systemForm, backupFrequency: value })}>
                    <SelectTrigger>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Max File Size (MB)</Label>
                  <Input
                    type="number"
                    value={systemForm.maxFileSize}
                    onChange={(e) => setSystemForm({ ...systemForm, maxFileSize: parseInt(e.target.value) })}
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Allowed File Types</Label>
                  <Input
                    value={systemForm.allowedFileTypes.join(', ')}
                    onChange={(e) => setSystemForm({ ...systemForm, allowedFileTypes: e.target.value.split(',').map(t => t.trim()) })}
                    placeholder="jpg, png, pdf, doc"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSystemUpdate}
                disabled={saving === 'system'}
                className="w-full md:w-auto"
              >
                {saving === 'system' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save System Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure email server settings for notifications and newsletters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Email Configuration Help</h4>
                <p className="text-sm text-blue-700">
                  Configure your SMTP settings for sending newsletters and notifications. 
                  For Gmail, use smtp.gmail.com with port 587 and enable "Less secure app access" or use an App Password.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Host</Label>
                  <Input
                    value={emailForm.smtpHost}
                    onChange={(e) => setEmailForm({ ...emailForm, smtpHost: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">e.g., smtp.gmail.com, smtp.outlook.com</p>
                </div>
                <div>
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    value={emailForm.smtpPort}
                    onChange={(e) => setEmailForm({ ...emailForm, smtpPort: parseInt(e.target.value) })}
                    placeholder="587"
                  />
                  <p className="text-xs text-gray-500 mt-1">Common ports: 587 (TLS), 465 (SSL), 25</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Username</Label>
                  <Input
                    value={emailForm.smtpUser}
                    onChange={(e) => setEmailForm({ ...emailForm, smtpUser: e.target.value })}
                    placeholder="your-email@gmail.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your email address</p>
                </div>
                <div>
                  <Label>SMTP Password</Label>
                  <Input
                    type="password"
                    value={emailForm.smtpPassword}
                    onChange={(e) => setEmailForm({ ...emailForm, smtpPassword: e.target.value })}
                    placeholder="Enter SMTP password"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your email password or app password</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>From Email</Label>
                  <Input
                    value={emailForm.fromEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, fromEmail: e.target.value })}
                    placeholder="noreply@yourdomain.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email address that appears as sender</p>
                </div>
                <div>
                  <Label>From Name</Label>
                  <Input
                    value={emailForm.fromName}
                    onChange={(e) => setEmailForm({ ...emailForm, fromName: e.target.value })}
                    placeholder="Your Store Name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Name that appears as sender</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={emailForm.smtpSecure}
                  onCheckedChange={(checked) => setEmailForm({ ...emailForm, smtpSecure: checked })}
                />
                <Label>Use Secure Connection (SSL/TLS)</Label>
              </div>
              <p className="text-xs text-gray-500">Enable for port 465, disable for port 587</p>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleEmailUpdate}
                  disabled={saving === 'email'}
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
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Test Configuration
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