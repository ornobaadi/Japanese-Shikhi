'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IconLoader2, IconPhone, IconMail, IconBrandFacebook, IconBrandTiktok, IconBrandInstagram, IconBrandYoutube, IconBrandWhatsapp, IconLink } from "@tabler/icons-react";

interface Contact {
  _id?: string;
  phoneNumber?: string;
  email?: string;
  pageLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  instagramLink?: string;
  youtubeLink?: string;
  whatsappLink?: string;
}

export default function ContactPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Contact>({
    phoneNumber: '',
    email: '',
    pageLink: '',
    facebookLink: '',
    tiktokLink: '',
    instagramLink: '',
    youtubeLink: '',
    whatsappLink: '',
  });

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contact');
      if (response.ok) {
        const data = await response.json();
        setFormData(data.data || {});
      } else {
        toast.error('Failed to fetch contact information');
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
      toast.error('Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Contact information updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update contact information');
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error('Failed to save contact information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center py-32">
            <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Contact Information</h1>
              <p className="text-muted-foreground">Manage your contact details and social media links</p>
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>Update your contact information that will be displayed on the landing page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                    <IconPhone className="size-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <IconMail className="size-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Page Link */}
                <div className="space-y-2">
                  <Label htmlFor="pageLink" className="flex items-center gap-2">
                    <IconLink className="size-4" />
                    Website Link
                  </Label>
                  <Input
                    id="pageLink"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.pageLink || ''}
                    onChange={(e) => setFormData({ ...formData, pageLink: e.target.value })}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Facebook */}
                    <div className="space-y-2">
                      <Label htmlFor="facebookLink" className="flex items-center gap-2">
                        <IconBrandFacebook className="size-4" />
                        Facebook
                      </Label>
                      <Input
                        id="facebookLink"
                        type="url"
                        placeholder="https://facebook.com/..."
                        value={formData.facebookLink || ''}
                        onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })}
                      />
                    </div>

                    {/* TikTok */}
                    <div className="space-y-2">
                      <Label htmlFor="tiktokLink" className="flex items-center gap-2">
                        <IconBrandTiktok className="size-4" />
                        TikTok
                      </Label>
                      <Input
                        id="tiktokLink"
                        type="url"
                        placeholder="https://tiktok.com/@..."
                        value={formData.tiktokLink || ''}
                        onChange={(e) => setFormData({ ...formData, tiktokLink: e.target.value })}
                      />
                    </div>

                    {/* Instagram */}
                    <div className="space-y-2">
                      <Label htmlFor="instagramLink" className="flex items-center gap-2">
                        <IconBrandInstagram className="size-4" />
                        Instagram
                      </Label>
                      <Input
                        id="instagramLink"
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={formData.instagramLink || ''}
                        onChange={(e) => setFormData({ ...formData, instagramLink: e.target.value })}
                      />
                    </div>

                    {/* YouTube */}
                    <div className="space-y-2">
                      <Label htmlFor="youtubeLink" className="flex items-center gap-2">
                        <IconBrandYoutube className="size-4" />
                        YouTube
                      </Label>
                      <Input
                        id="youtubeLink"
                        type="url"
                        placeholder="https://youtube.com/@..."
                        value={formData.youtubeLink || ''}
                        onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-2">
                      <Label htmlFor="whatsappLink" className="flex items-center gap-2">
                        <IconBrandWhatsapp className="size-4" />
                        WhatsApp
                      </Label>
                      <Input
                        id="whatsappLink"
                        type="url"
                        placeholder="https://wa.me/1234567890"
                        value={formData.whatsappLink || ''}
                        onChange={(e) => setFormData({ ...formData, whatsappLink: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? (
                      <>
                        <IconLoader2 className="size-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Contact Information'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
