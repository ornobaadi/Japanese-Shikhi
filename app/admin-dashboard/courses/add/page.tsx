import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { IconDeviceFloppy, IconArrowLeft } from "@tabler/icons-react"

export default function AddCoursePage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Add New Course</h1>
                  <p className="text-muted-foreground">Create a new Japanese language course</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  Save as Draft
                </Button>
                <Button className="gap-2">
                  <IconDeviceFloppy className="size-4" />
                  Save & Publish
                </Button>
              </div>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                  <CardDescription>Basic details about your course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Course Title *</Label>
                    <Input id="title" placeholder="e.g., Japan101 - Hiragana Basics" />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe what students will learn in this course..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="level">JLPT Level *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="n5">N5 (Beginner)</SelectItem>
                          <SelectItem value="n4">N4 (Elementary)</SelectItem>
                          <SelectItem value="n3">N3 (Intermediate)</SelectItem>
                          <SelectItem value="n2">N2 (Upper Intermediate)</SelectItem>
                          <SelectItem value="n1">N1 (Advanced)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vocabulary">Vocabulary</SelectItem>
                          <SelectItem value="grammar">Grammar</SelectItem>
                          <SelectItem value="kanji">Kanji</SelectItem>
                          <SelectItem value="conversation">Conversation</SelectItem>
                          <SelectItem value="reading">Reading</SelectItem>
                          <SelectItem value="writing">Writing</SelectItem>
                          <SelectItem value="culture">Culture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Course Price ($)</Label>
                      <Input id="price" type="number" step="0.01" placeholder="19.99" />
                    </div>
                    <div>
                      <Label htmlFor="duration">Estimated Duration (hours)</Label>
                      <Input id="duration" type="number" placeholder="10" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="published" />
                    <Label htmlFor="published">Publish immediately</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="premium" />
                    <Label htmlFor="premium">Premium Course</Label>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full">
                      <IconDeviceFloppy className="size-4 mr-2" />
                      Create Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}