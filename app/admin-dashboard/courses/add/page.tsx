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
import { IconDeviceFloppy, IconArrowLeft, IconUpload, IconPlus, IconTrash } from "@tabler/icons-react"

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
                <Button variant="ghost" size="sm">
                  <IconArrowLeft className="size-4 mr-2" />
                  Back to Courses
                </Button>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Course title, description, and basic details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Course Title *</Label>
                        <Input id="title" placeholder="e.g., Japan101 - Hiragana Basics" />
                      </div>
                      <div>
                        <Label htmlFor="title-jp">Course Title (Japanese)</Label>
                        <Input id="title-jp" placeholder="e.g., ひらがな基礎" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Describe what students will learn in this course..."
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description-jp">Description (Japanese)</Label>
                      <Textarea 
                        id="description-jp" 
                        placeholder="日本語でコースの説明..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                      <div>
                        <Label htmlFor="difficulty">Difficulty (1-10)</Label>
                        <Input id="difficulty" type="number" min="1" max="10" placeholder="5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing & Enrollment */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing & Enrollment</CardTitle>
                    <CardDescription>Set course price and enrollment settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Course Price ($)</Label>
                        <Input id="price" type="number" step="0.01" placeholder="19.99" />
                      </div>
                      <div>
                        <Label htmlFor="duration">Estimated Duration (hours)</Label>
                        <Input id="duration" type="number" placeholder="10" />
                      </div>
                      <div>
                        <Label htmlFor="max-students">Max Students</Label>
                        <Input id="max-students" type="number" placeholder="100" />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="premium" />
                      <Label htmlFor="premium">Premium Course</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="certificate" />
                      <Label htmlFor="certificate">Provide Certificate upon Completion</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Objectives */}
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Objectives</CardTitle>
                    <CardDescription>What will students learn from this course?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input placeholder="e.g., Master all 46 Hiragana characters" className="flex-1" />
                        <Button variant="outline" size="sm">
                          <IconTrash className="size-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="e.g., Read basic Japanese sentences" className="flex-1" />
                        <Button variant="outline" size="sm">
                          <IconTrash className="size-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <IconPlus className="size-4 mr-2" />
                        Add Learning Objective
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Prerequisites */}
                <Card>
                  <CardHeader>
                    <CardTitle>Prerequisites</CardTitle>
                    <CardDescription>What should students know before taking this course?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input placeholder="e.g., Basic understanding of Japanese writing systems" className="flex-1" />
                        <Button variant="outline" size="sm">
                          <IconTrash className="size-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <IconPlus className="size-4 mr-2" />
                        Add Prerequisite
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Course Thumbnail */}
                <Card>
                  <CardHeader>
                    <CardTitle>Course Thumbnail</CardTitle>
                    <CardDescription>Upload an image for your course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <IconUpload className="size-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                    </div>
                    <Button variant="outline" className="w-full mt-3">
                      <IconUpload className="size-4 mr-2" />
                      Upload Image
                    </Button>
                  </CardContent>
                </Card>

                {/* Instructor */}
                <Card>
                  <CardHeader>
                    <CardTitle>Instructor</CardTitle>
                    <CardDescription>Assign an instructor to this course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tanaka">Tanaka Sensei</SelectItem>
                        <SelectItem value="sato">Sato Sensei</SelectItem>
                        <SelectItem value="yamamoto">Yamamoto Sensei</SelectItem>
                        <SelectItem value="suzuki">Suzuki Sensei</SelectItem>
                        <SelectItem value="watanabe">Watanabe Sensei</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Course Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Course Tags</CardTitle>
                    <CardDescription>Add tags to help students find this course</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input placeholder="Add a tag..." />
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                        Japanese
                        <button className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                        Beginner
                        <button className="ml-1 text-green-600 hover:text-green-800">×</button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Course Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="published" />
                      <Label htmlFor="published">Published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="featured" />
                      <Label htmlFor="featured">Featured Course</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="enrollment-open" defaultChecked />
                      <Label htmlFor="enrollment-open">Open for Enrollment</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}