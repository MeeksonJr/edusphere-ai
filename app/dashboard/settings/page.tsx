"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSupabase } from "@/components/supabase-provider"
import { useSettings, type UserSettings, type ThemeType, type AccentColorType } from "@/contexts/settings-context"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Bell, Moon, Sun, Palette, Globe, CreditCard, Shield, Loader2, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

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
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
      })
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
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">Settings</span>
          </h1>
          <p className="text-white/70">Customize your EduSphere experience</p>
        </div>
      </ScrollReveal>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="glass-surface border-white/20 p-1">
          <TabsTrigger
            value="appearance"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <Palette className="h-4 w-4 mr-2" aria-hidden="true" />
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <Bell className="h-4 w-4 mr-2" aria-hidden="true" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <Globe className="h-4 w-4 mr-2" aria-hidden="true" />
            Calendar
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <CreditCard className="h-4 w-4 mr-2" aria-hidden="true" />
            Billing
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <Shield className="h-4 w-4 mr-2" aria-hidden="true" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <ScrollReveal direction="up">
            <GlassSurface className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6">Appearance</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <AnimatedCard
                      variant="3d"
                      className={`cursor-pointer transition-all ${
                        localSettings.theme === "dark" ? "border-purple-500/50" : ""
                      }`}
                      onClick={() => handleThemeChange("dark")}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Moon className="h-5 w-5 mr-2 text-white" aria-hidden="true" />
                            <span className="text-white font-medium">Dark</span>
                          </div>
                          {localSettings.theme === "dark" && (
                            <CheckCircle className="h-5 w-5 text-purple-400" aria-hidden="true" />
                          )}
                        </div>
                        <div className="h-24 bg-gradient-to-br from-gray-900 to-black rounded-md border border-white/10"></div>
                      </div>
                    </AnimatedCard>

                    <AnimatedCard
                      variant="3d"
                      delay={0.1}
                      className={`cursor-pointer transition-all ${
                        localSettings.theme === "light" ? "border-purple-500/50" : ""
                      }`}
                      onClick={() => handleThemeChange("light")}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Sun className="h-5 w-5 mr-2 text-white" aria-hidden="true" />
                            <span className="text-white font-medium">Light</span>
                          </div>
                          {localSettings.theme === "light" && (
                            <CheckCircle className="h-5 w-5 text-purple-400" aria-hidden="true" />
                          )}
                        </div>
                        <div className="h-24 bg-gradient-to-br from-gray-100 to-white rounded-md border border-gray-300"></div>
                      </div>
                    </AnimatedCard>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Accent Color</h3>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {[
                      { value: "purple", color: "from-purple-500 to-purple-600" },
                      { value: "blue", color: "from-blue-500 to-blue-600" },
                      { value: "green", color: "from-green-500 to-green-600" },
                      { value: "pink", color: "from-pink-500 to-pink-600" },
                      { value: "orange", color: "from-orange-500 to-orange-600" },
                    ].map((color, index) => (
                      <AnimatedCard
                        key={color.value}
                        variant="3d"
                        delay={0.05 * index}
                        className={`cursor-pointer transition-all ${
                          localSettings.accentColor === color.value ? "border-purple-500/50 scale-105" : ""
                        }`}
                        onClick={() => handleAccentColorChange(color.value as AccentColorType)}
                      >
                        <div className="p-4 text-center">
                          <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${color.color} mx-auto mb-2`}></div>
                          <span className="text-sm text-white capitalize">{color.value}</span>
                          {localSettings.accentColor === color.value && (
                            <CheckCircle className="h-4 w-4 text-purple-400 mx-auto mt-2" aria-hidden="true" />
                          )}
                        </div>
                      </AnimatedCard>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Language</h3>
                  <Select value={localSettings.language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full md:w-[250px] glass-surface border-white/20 text-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="glass-surface border-white/20">
                      <SelectItem value="en" className="text-white">English</SelectItem>
                      <SelectItem value="es" className="text-white">Español</SelectItem>
                      <SelectItem value="fr" className="text-white">Français</SelectItem>
                      <SelectItem value="de" className="text-white">Deutsch</SelectItem>
                      <SelectItem value="zh" className="text-white">中文</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-white/50 mt-2">Note: Language support is limited in the current version.</p>
                </div>
              </div>
            </GlassSurface>
          </ScrollReveal>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <ScrollReveal direction="up">
            <GlassSurface className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6">Notifications</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg glass-surface border-white/10">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-white font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-white/60">Receive email notifications about assignments and updates</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={localSettings.notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg glass-surface border-white/10">
                  <div className="space-y-0.5">
                    <Label htmlFor="assignment-notifications" className="text-white font-medium">
                      Assignment Reminders
                    </Label>
                    <p className="text-sm text-white/60">Get notified about upcoming assignment deadlines</p>
                  </div>
                  <Switch
                    id="assignment-notifications"
                    checked={localSettings.notifications.assignments}
                    onCheckedChange={(checked) => handleNotificationChange("assignments", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg glass-surface border-white/10">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-notifications" className="text-white font-medium">
                      AI Assistant Updates
                    </Label>
                    <p className="text-sm text-white/60">
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
            </GlassSurface>
          </ScrollReveal>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <ScrollReveal direction="up">
            <GlassSurface className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6">Calendar Settings</h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="default-view" className="text-white mb-2 block">
                    Default View
                  </Label>
                  <Select
                    value={localSettings.calendar.defaultView}
                    onValueChange={(value) => handleCalendarSettingChange("defaultView", value)}
                  >
                    <SelectTrigger
                      id="default-view"
                      className="w-full md:w-[250px] glass-surface border-white/20 text-white"
                    >
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent className="glass-surface border-white/20">
                      <SelectItem value="month" className="text-white">Month</SelectItem>
                      <SelectItem value="week" className="text-white">Week</SelectItem>
                      <SelectItem value="day" className="text-white">Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="first-day" className="text-white mb-2 block">
                    First Day of Week
                  </Label>
                  <Select
                    value={localSettings.calendar.firstDayOfWeek}
                    onValueChange={(value) => handleCalendarSettingChange("firstDayOfWeek", value)}
                  >
                    <SelectTrigger
                      id="first-day"
                      className="w-full md:w-[250px] glass-surface border-white/20 text-white"
                    >
                      <SelectValue placeholder="Select first day" />
                    </SelectTrigger>
                    <SelectContent className="glass-surface border-white/20">
                      <SelectItem value="sunday" className="text-white">Sunday</SelectItem>
                      <SelectItem value="monday" className="text-white">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg glass-surface border-white/10">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-weekends" className="text-white font-medium">
                      Show Weekends
                    </Label>
                    <p className="text-sm text-white/60">Display weekend days in your calendar view</p>
                  </div>
                  <Switch
                    id="show-weekends"
                    checked={localSettings.calendar.showWeekends}
                    onCheckedChange={(checked) => handleCalendarSettingChange("showWeekends", checked)}
                  />
                </div>
              </div>
            </GlassSurface>
          </ScrollReveal>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <ScrollReveal direction="up">
            <GlassSurface className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6">Billing Information</h2>
              <div className="space-y-6">
                <div className="glass-surface border-purple-500/30 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Current Plan</h3>
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
                  <p className="text-white/70 mb-4">
                    {user?.profile?.subscription_tier === "ultimate"
                      ? "You are currently on the Ultimate plan ($12.99/month)."
                      : user?.profile?.subscription_tier === "pro"
                        ? "You are currently on the Pro plan ($6.99/month)."
                        : "You are currently on the Free plan."}
                  </p>
                  {user?.profile?.subscription_tier === "free" ? (
                    <Button
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                      onClick={() => router.push("/dashboard/profile?tab=subscription")}
                    >
                      Upgrade Plan
                    </Button>
                  ) : (
                    <Button variant="outline" className="glass-surface border-white/20 text-white">
                      Manage Subscription
                    </Button>
                  )}
                </div>
              </div>
            </GlassSurface>
          </ScrollReveal>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <ScrollReveal direction="up">
            <GlassSurface className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6">Privacy & Security</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg glass-surface border-white/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-collection" className="text-white font-medium">
                        Data Collection
                      </Label>
                      <p className="text-sm text-white/60">
                        Allow EduSphere to collect usage data to improve the service
                      </p>
                    </div>
                    <Switch id="data-collection" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg glass-surface border-white/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="ai-personalization" className="text-white font-medium">
                        AI Personalization
                      </Label>
                      <p className="text-sm text-white/60">
                        Allow AI to learn from your usage patterns to provide better recommendations
                      </p>
                    </div>
                    <Switch id="ai-personalization" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg glass-surface border-white/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="third-party" className="text-white font-medium">
                        Third-Party Integrations
                      </Label>
                      <p className="text-sm text-white/60">Allow EduSphere to connect with third-party services</p>
                    </div>
                    <Switch id="third-party" defaultChecked />
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
                  <p className="text-sm text-white/60 mb-4">
                    You can request a copy of your data or delete all your data from EduSphere.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" className="glass-surface border-white/20 text-white">
                      Request Data Export
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Delete All Data
                    </Button>
                  </div>
                </div>
              </div>
            </GlassSurface>
          </ScrollReveal>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </ScrollReveal>
    </div>
  )
}
