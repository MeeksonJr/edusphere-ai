"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSupabase } from "@/components/supabase-provider"
import { useSettings, type UserSettings, type ThemeType, type AccentColorType } from "@/contexts/settings-context"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Bell, Moon, Sun, Palette, Globe, CreditCard, Shield, Loader2, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const { settings, updateSettings, loading: settingsLoading } = useSettings()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState<UserSettings | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        const { data } = await supabase.auth.getUser()

        if (data.user) {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single()

          if (error && error.code !== "PGRST116") throw error

          setUser({ ...data.user, profile: profileData })
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load settings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase, toast])

  // Initialize local settings when settings are loaded
  useEffect(() => {
    if (!settingsLoading && settings) {
      setLocalSettings({ ...settings })
    }
  }, [settings, settingsLoading])

  const handleSaveSettings = async () => {
    if (!localSettings) return

    try {
      setSaving(true)
      await updateSettings(localSettings)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleThemeChange = (theme: ThemeType) => {
    if (!localSettings) return
    setLocalSettings({ ...localSettings, theme })
  }

  const handleAccentColorChange = (accentColor: AccentColorType) => {
    if (!localSettings) return
    setLocalSettings({ ...localSettings, accentColor })
  }

  const handleNotificationChange = (key: keyof typeof localSettings.notifications, value: boolean) => {
    if (!localSettings) return
    setLocalSettings({
      ...localSettings,
      notifications: {
        ...localSettings.notifications,
        [key]: value,
      },
    })
  }

  const handleLanguageChange = (language: string) => {
    if (!localSettings) return
    setLocalSettings({ ...localSettings, language })
  }

  const handleCalendarSettingChange = (key: keyof typeof localSettings.calendar, value: any) => {
    if (!localSettings) return
    setLocalSettings({
      ...localSettings,
      calendar: {
        ...localSettings.calendar,
        [key]: value,
      },
    })
  }

  if (loading || settingsLoading || !localSettings) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold neon-text-blue">Settings</h1>
        <p className="text-gray-400 mt-1">Customize your EduSphere experience</p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger
            value="appearance"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Palette className="h-4 w-4 mr-2" /> Appearance
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Bell className="h-4 w-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Globe className="h-4 w-4 mr-2" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <CreditCard className="h-4 w-4 mr-2" /> Billing
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Shield className="h-4 w-4 mr-2" /> Privacy
          </TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how EduSphere looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      localSettings.theme === "dark"
                        ? "border-primary bg-gray-800"
                        : "border-gray-700 bg-gray-900 hover:border-gray-600"
                    }`}
                    onClick={() => handleThemeChange("dark")}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Moon className="h-5 w-5 mr-2" />
                        <span>Dark</span>
                      </div>
                      {localSettings.theme === "dark" && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="h-24 bg-gray-900 rounded-md border border-gray-700"></div>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      localSettings.theme === "light"
                        ? "border-primary bg-gray-800"
                        : "border-gray-700 bg-gray-900 hover:border-gray-600"
                    }`}
                    onClick={() => handleThemeChange("light")}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Sun className="h-5 w-5 mr-2" />
                        <span>Light</span>
                      </div>
                      {localSettings.theme === "light" && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="h-24 bg-gray-200 rounded-md border border-gray-300"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Accent Color</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {[
                    { value: "purple", color: "bg-purple-500" },
                    { value: "blue", color: "bg-blue-500" },
                    { value: "green", color: "bg-green-500" },
                    { value: "pink", color: "bg-pink-500" },
                    { value: "orange", color: "bg-orange-500" },
                  ].map((color) => (
                    <div
                      key={color.value}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        localSettings.accentColor === color.value
                          ? "border-primary bg-gray-800"
                          : "border-gray-700 bg-gray-900 hover:border-gray-600"
                      }`}
                      onClick={() => handleAccentColorChange(color.value as AccentColorType)}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`h-8 w-8 rounded-full ${color.color}`}></div>
                        <span className="capitalize">{color.value}</span>
                        {localSettings.accentColor === color.value && <CheckCircle className="h-4 w-4 text-primary" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Language</h3>
                <Select value={localSettings.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full md:w-[250px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">Note: Language support is limited in the current version.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-400">Receive email notifications about assignments and updates</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={localSettings.notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="assignment-notifications">Assignment Reminders</Label>
                    <p className="text-sm text-gray-400">Get notified about upcoming assignment deadlines</p>
                  </div>
                  <Switch
                    id="assignment-notifications"
                    checked={localSettings.notifications.assignments}
                    onCheckedChange={(checked) => handleNotificationChange("assignments", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-notifications">AI Assistant Updates</Label>
                    <p className="text-sm text-gray-400">
                      Receive notifications about AI-generated content and suggestions
                    </p>
                  </div>
                  <Switch
                    id="ai-notifications"
                    checked={localSettings.notifications.ai}
                    onCheckedChange={(checked) => handleNotificationChange("ai", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Calendar Settings</CardTitle>
              <CardDescription>Customize your calendar view and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-view">Default View</Label>
                  <Select
                    value={localSettings.calendar.defaultView}
                    onValueChange={(value) => handleCalendarSettingChange("defaultView", value)}
                  >
                    <SelectTrigger id="default-view" className="w-full md:w-[250px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="first-day">First Day of Week</Label>
                  <Select
                    value={localSettings.calendar.firstDayOfWeek}
                    onValueChange={(value) => handleCalendarSettingChange("firstDayOfWeek", value)}
                  >
                    <SelectTrigger id="first-day" className="w-full md:w-[250px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select first day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-weekends">Show Weekends</Label>
                    <p className="text-sm text-gray-400">Display weekend days in your calendar view</p>
                  </div>
                  <Switch
                    id="show-weekends"
                    checked={localSettings.calendar.showWeekends}
                    onCheckedChange={(checked) => handleCalendarSettingChange("showWeekends", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Current Plan</h3>
                    <Badge
                      className={
                        user?.profile?.subscription_tier === "free"
                          ? "bg-gray-600"
                          : user?.profile?.subscription_tier === "pro"
                            ? "bg-blue-600"
                            : "bg-pink-600"
                      }
                    >
                      {user?.profile?.subscription_tier === "ultimate"
                        ? "Ultimate"
                        : user?.profile?.subscription_tier === "pro"
                          ? "Pro"
                          : "Free"}
                    </Badge>
                  </div>
                  <p className="text-gray-400 mb-4">
                    {user?.profile?.subscription_tier === "ultimate"
                      ? "You are currently on the Ultimate plan ($12.99/month)."
                      : user?.profile?.subscription_tier === "pro"
                        ? "You are currently on the Pro plan ($6.99/month)."
                        : "You are currently on the Free plan."}
                  </p>
                  {user?.profile?.subscription_tier === "free" ? (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push("/dashboard/profile?tab=subscription")}
                    >
                      Upgrade Plan
                    </Button>
                  ) : (
                    <Button variant="outline" className="border-gray-700">
                      Manage Subscription
                    </Button>
                  )}
                </div>

                {user?.profile?.subscription_tier !== "free" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Payment Method</h3>
                    <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-gray-700 p-2 rounded mr-3">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-400">Expires 12/2025</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                    <Button variant="outline" className="border-gray-700">
                      Add Payment Method
                    </Button>
                  </div>
                )}

                {user?.profile?.subscription_tier !== "free" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Billing History</h3>
                    <div className="bg-gray-800 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-700 font-medium">
                        <div>Date</div>
                        <div>Amount</div>
                        <div>Status</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-700">
                        <div>Apr 1, 2023</div>
                        <div>$12.99</div>
                        <div className="flex items-center">
                          <Badge className="bg-green-600">Paid</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-700">
                        <div>Mar 1, 2023</div>
                        <div>$12.99</div>
                        <div className="flex items-center">
                          <Badge className="bg-green-600">Paid</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 p-4">
                        <div>Feb 1, 2023</div>
                        <div>$12.99</div>
                        <div className="flex items-center">
                          <Badge className="bg-green-600">Paid</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-collection">Data Collection</Label>
                    <p className="text-sm text-gray-400">
                      Allow EduSphere to collect usage data to improve the service
                    </p>
                  </div>
                  <Switch id="data-collection" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-personalization">AI Personalization</Label>
                    <p className="text-sm text-gray-400">
                      Allow AI to learn from your usage patterns to provide better recommendations
                    </p>
                  </div>
                  <Switch id="ai-personalization" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="third-party">Third-Party Integrations</Label>
                    <p className="text-sm text-gray-400">Allow EduSphere to connect with third-party services</p>
                  </div>
                  <Switch id="third-party" defaultChecked />
                </div>
              </div>

              <div className="border-t border-gray-800 pt-6 space-y-4">
                <h3 className="text-lg font-medium">Data Management</h3>
                <p className="text-sm text-gray-400">
                  You can request a copy of your data or delete all your data from EduSphere.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" className="border-gray-700">
                    Request Data Export
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-900 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                  >
                    Delete All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/80" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  )
}
