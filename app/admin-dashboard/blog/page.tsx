'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { IconPlus, IconEdit, IconTrash, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

interface BlogPost {
  _id?: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishDate: string;
  tags: string[];
  isPublished: boolean;
  featuredImage?: string;
  videoLink?: string;
  videoFile?: string;
  slug?: string;
  createdAt?: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [formData, setFormData] = useState<BlogPost>({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    publishDate: new Date().toISOString().split('T')[0],
    tags: [],
    isPublished: false,
    featuredImage: '',
    videoLink: '',
    videoFile: '',
  });

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/blogs');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.data || data.blogs || []);
      } else {
        toast.error('Failed to fetch blog posts');
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setIsUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...formData,
          featuredImage: data.url || data.data?.url || '',
        });
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file must be less than 100MB');
      return;
    }

    try {
      setIsUploadingVideo(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...formData,
          videoFile: data.url || data.data?.url || '',
        });
        toast.success('Video uploaded successfully');
      } else {
        toast.error('Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleOpenDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData(post);
      setImagePreview(post.featuredImage || '');
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        author: '',
        publishDate: new Date().toISOString().split('T')[0],
        tags: [],
        isPublished: false,
        featuredImage: '',
        videoLink: '',
        videoFile: '',
      });
      setImagePreview('');
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingPost(null);
    setImagePreview('');
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setIsSaving(true);
      const method = editingPost ? 'PATCH' : 'POST';
      const url = editingPost ? `/api/admin/blogs/${editingPost._id}` : '/api/admin/blogs';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingPost ? 'Blog post updated' : 'Blog post created');
        await fetchBlogPosts();
        handleCloseDialog();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save blog post');
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error('Failed to save blog post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (postId?: string) => {
    if (!postId) return;
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const response = await fetch(`/api/admin/blogs/${postId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Blog post deleted');
        await fetchBlogPosts();
      } else {
        toast.error('Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Failed to delete blog post');
    }
  };

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Blog Management</h1>
                <p className="text-muted-foreground">Create and manage blog articles</p>
              </div>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <IconPlus className="size-4" />
                New Article
              </Button>
            </div>

            {/* Blog Posts List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No blog posts yet</p>
                    <Button onClick={() => handleOpenDialog()}>Create First Article</Button>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post._id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {post.featuredImage && (
                        <div className="flex-shrink-0 w-24 h-24">
                          <img 
                            src={post.featuredImage} 
                            alt={post.title}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{post.title}</h3>
                          {post.isPublished && (
                            <Badge variant="default">Published</Badge>
                          )}
                          {!post.isPublished && (
                            <Badge variant="outline">Draft</Badge>
                          )}
                          {post.videoLink && (
                            <Badge variant="secondary">📹 Video</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>By {post.author}</span>
                          <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-1">
                              {post.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(post)}
                        >
                          <IconEdit className="size-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(post._id)}
                        >
                          <IconTrash className="size-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Blog Post Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Article' : 'Create New Article'}</DialogTitle>
              <DialogDescription>
                {editingPost ? 'Update your blog article details' : 'Create a new blog article'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Article title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Input
                  id="excerpt"
                  placeholder="Brief summary of the article"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Article content"
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    placeholder="Author name"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="publishDate">Publish Date</Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., japanese, learning, grammar"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                  })}
                />
              </div>

              <div>
                <Label>Featured Image</Label>
                <div className="space-y-3">
                  {/* File Upload */}
                  <div>
                    <Label htmlFor="imageFile" className="text-sm text-muted-foreground">
                      Upload Image File
                    </Label>
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={isUploadingImage}
                      className="cursor-pointer"
                    />
                  </div>

                  {/* Or URL */}
                  <div>
                    <Label htmlFor="featuredImage" className="text-sm text-muted-foreground">
                      Or paste Image URL
                    </Label>
                    <Input
                      id="featuredImage"
                      placeholder="https://example.com/image.jpg"
                      value={formData.featuredImage || ''}
                      onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    />
                  </div>

                  {/* Preview */}
                  {(imagePreview || formData.featuredImage) && (
                    <div className="mt-2 w-full max-w-xs">
                      <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                      <img 
                        src={imagePreview || formData.featuredImage} 
                        alt="Featured" 
                        className="w-full h-auto rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Video Content</Label>
                <div className="space-y-3">
                  {/* File Upload */}
                  <div>
                    <Label htmlFor="videoFile" className="text-sm text-muted-foreground">
                      Upload Video File (MP4, WebM, etc.)
                    </Label>
                    <Input
                      id="videoFile"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      disabled={isUploadingVideo}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Max 100MB</p>
                  </div>

                  {/* Or Embedded Link */}
                  <div>
                    <Label htmlFor="videoLink" className="text-sm text-muted-foreground">
                      Or paste Embedded Video Link (YouTube, Vimeo, Google Drive, etc.)
                    </Label>
                    <Input
                      id="videoLink"
                      placeholder="https://www.youtube.com/embed/... or https://drive.google.com/file/d/..."
                      value={formData.videoLink || ''}
                      onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                    />
                  </div>

                  {/* Preview */}
                  {(formData.videoFile || formData.videoLink) && (
                    <div className="mt-2 w-full">
                      <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                      {formData.videoFile && (
                        <video 
                          src={formData.videoFile} 
                          controls 
                          className="w-full max-w-md rounded border bg-black"
                        />
                      )}
                      {formData.videoLink && !formData.videoFile && (
                        <iframe
                          width="100%"
                          height="315"
                          src={formData.videoLink}
                          title="Video preview"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded border"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="published" className="cursor-pointer">
                  Publish immediately
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <IconLoader2 className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingPost ? 'Update Article' : 'Create Article'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
