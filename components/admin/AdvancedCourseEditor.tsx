'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface WeeklyContent {
  id: string;
  week: number;
  videoLinks: VideoLink[];
  documents: DocumentFile[];
  comments: string;
}

interface VideoLink {
  id: string;
  title: string;
  url: string;
  description: string;
}

interface DocumentFile {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'other';
}

interface ClassLink {
  id: string;
  title: string;
  meetingUrl: string;
  schedule: string;
  description: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishDate: string;
  tags: string[];
  publishImmediately: boolean;
  featuredImageUrl: string;
}

interface AdvancedCourseEditorProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyContent: WeeklyContent[];
  classLinks: ClassLink[];
  blogPosts: BlogPost[];
  onSave: (data: { weeklyContent: WeeklyContent[]; classLinks: ClassLink[]; blogPosts: BlogPost[] }) => void;
}

export default function AdvancedCourseEditor({
  isOpen,
  onClose,
  weeklyContent: initialWeeklyContent,
  classLinks: initialClassLinks,
  blogPosts: initialBlogPosts,
  onSave
}: AdvancedCourseEditorProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'classes' | 'blogs'>('weekly');
  const [activeWeek, setActiveWeek] = useState(1);
  const [weeklyContent, setWeeklyContent] = useState<WeeklyContent[]>(
    initialWeeklyContent.length > 0 ? initialWeeklyContent : [
      { id: '1', week: 1, videoLinks: [], documents: [], comments: '' },
      { id: '2', week: 2, videoLinks: [], documents: [], comments: '' },
      { id: '3', week: 3, videoLinks: [], documents: [], comments: '' },
      { id: '4', week: 4, videoLinks: [], documents: [], comments: '' },
    ]
  );
  const [classLinks, setClassLinks] = useState<ClassLink[]>(initialClassLinks);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ weeklyContent, classLinks, blogPosts });
    toast.success('Advanced settings saved successfully!');
    onClose();
  };

  // Weekly Content Functions
  const addVideoToWeek = (weekNum: number) => {
    setWeeklyContent(prev => prev.map(week => {
      if (week.week === weekNum) {
        return {
          ...week,
          videoLinks: [...week.videoLinks, {
            id: Date.now().toString(),
            title: '',
            url: '',
            description: ''
          }]
        };
      }
      return week;
    }));
  };

  const removeVideoFromWeek = (weekNum: number, videoId: string) => {
    setWeeklyContent(prev => prev.map(week => {
      if (week.week === weekNum) {
        return {
          ...week,
          videoLinks: week.videoLinks.filter(v => v.id !== videoId)
        };
      }
      return week;
    }));
  };

  const updateVideo = (weekNum: number, videoId: string, field: keyof VideoLink, value: string) => {
    setWeeklyContent(prev => prev.map(week => {
      if (week.week === weekNum) {
        return {
          ...week,
          videoLinks: week.videoLinks.map(v => v.id === videoId ? { ...v, [field]: value } : v)
        };
      }
      return week;
    }));
  };

  const addDocumentToWeek = (weekNum: number) => {
    setWeeklyContent(prev => prev.map(week => {
      if (week.week === weekNum) {
        return {
          ...week,
          documents: [...week.documents, {
            id: Date.now().toString(),
            title: '',
            fileName: '',
            fileUrl: '',
            fileType: 'pdf'
          }]
        };
      }
      return week;
    }));
  };

  const removeDocumentFromWeek = (weekNum: number, docId: string) => {
    setWeeklyContent(prev => prev.map(week => {
      if (week.week === weekNum) {
        return {
          ...week,
          documents: week.documents.filter(d => d.id !== docId)
        };
      }
      return week;
    }));
  };

  const updateDocument = (weekNum: number, docId: string, field: keyof DocumentFile, value: string) => {
    setWeeklyContent(prev => prev.map(week => {
      if (week.week === weekNum) {
        return {
          ...week,
          documents: week.documents.map(d => d.id === docId ? { ...d, [field]: value } : d)
        };
      }
      return week;
    }));
  };

  const updateWeekComments = (weekNum: number, comments: string) => {
    setWeeklyContent(prev => prev.map(week => {
      if (week.week === weekNum) {
        return { ...week, comments };
      }
      return week;
    }));
  };

  // Class Links Functions
  const addClassLink = () => {
    setClassLinks(prev => [...prev, {
      id: Date.now().toString(),
      title: '',
      meetingUrl: '',
      schedule: '',
      description: ''
    }]);
  };

  const removeClassLink = (id: string) => {
    setClassLinks(prev => prev.filter(link => link.id !== id));
  };

  const updateClassLink = (id: string, field: keyof ClassLink, value: string) => {
    setClassLinks(prev => prev.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  // Blog Posts Functions
  const addBlogPost = () => {
    setBlogPosts(prev => [...prev, {
      id: Date.now().toString(),
      title: '',
      content: '',
      excerpt: '',
      author: '',
      publishDate: new Date().toISOString().split('T')[0],
      tags: [],
      publishImmediately: false,
      featuredImageUrl: ''
    }]);
  };

  const removeBlogPost = (id: string) => {
    setBlogPosts(prev => prev.filter(blog => blog.id !== id));
  };

  const updateBlogPost = (id: string, field: keyof BlogPost, value: any) => {
    setBlogPosts(prev => prev.map(blog => blog.id === id ? { ...blog, [field]: value } : blog));
  };

  const currentWeek = weeklyContent.find(w => w.week === activeWeek);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Advanced Course Management</h2>
            <p className="text-gray-600">Edit weekly content, class links, and blog posts</p>
          </div>
          <Button variant="outline" onClick={onClose}>✕</Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'weekly' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
            }`}
          >
            Weekly Content
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'classes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
            }`}
          >
            Class Links
          </button>
          <button
            onClick={() => setActiveTab('blogs')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'blogs' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
            }`}
          >
            Blog Posts
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Weekly Content Tab */}
          {activeTab === 'weekly' && (
            <div className="space-y-6">
              {/* Week Selector */}
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(week => (
                  <button
                    key={week}
                    onClick={() => setActiveWeek(week)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeWeek === week
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Week {week}
                  </button>
                ))}
              </div>

              {currentWeek && (
                <div className="space-y-6">
                  {/* Videos Section */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Video Links</h3>
                      <Button onClick={() => addVideoToWeek(activeWeek)} size="sm">
                        Add Video
                      </Button>
                    </div>

                    {currentWeek.videoLinks.map((video, videoIndex) => (
                      <div key={`video-${activeWeek}-${videoIndex}`} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                        <div className="space-y-4">
                          <div>
                            <Label>Video Title</Label>
                            <Input
                              value={video.title || ''}
                              onChange={(e) => updateVideo(activeWeek, video.id, 'title', e.target.value)}
                              placeholder="e.g., Introduction to Hiragana"
                            />
                          </div>
                          <div>
                            <Label>Video</Label>
                            <div className="space-y-2">
                              <Input
                                value={video.url || ''}
                                onChange={(e) => updateVideo(activeWeek, video.id, 'url', e.target.value)}
                                placeholder="https://youtube.com/... or upload below"
                              />
                              <div className="flex gap-2">
                                <Input
                                  id={`video-${activeWeek}-${video.id}`}
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const formData = new FormData();
                                    formData.append('file', file);
                                    formData.append('type', 'video');

                                    try {
                                      const response = await fetch('/api/upload', {
                                        method: 'POST',
                                        body: formData,
                                      });

                                      const data = await response.json();
                                      if (data.success) {
                                        updateVideo(activeWeek, video.id, 'url', data.url);
                                        alert('Video uploaded successfully!');
                                      } else {
                                        alert('Upload failed: ' + data.error);
                                      }
                                    } catch (error) {
                                      alert('Upload failed. Please try again.');
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`video-${activeWeek}-${video.id}`}
                                  className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
                                >
                                  🎥 Upload Video
                                </label>
                                {video.url && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(video.url, '_blank')}
                                  >
                                    ▶️ Preview
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={video.description || ''}
                            onChange={(e) => updateVideo(activeWeek, video.id, 'description', e.target.value)}
                            placeholder="Brief description..."
                            rows={2}
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeVideoFromWeek(activeWeek, video.id)}
                        >
                          Remove Video
                        </Button>
                      </div>
                    ))}

                    {currentWeek.videoLinks.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No videos added yet</p>
                    )}
                  </div>

                  {/* Documents Section */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Documents</h3>
                      <Button onClick={() => addDocumentToWeek(activeWeek)} size="sm">
                        Add Document
                      </Button>
                    </div>

                    {currentWeek.documents.map((doc, docIndex) => (
                      <div key={`doc-${activeWeek}-${docIndex}`} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Document Title</Label>
                            <Input
                              value={doc.title || ''}
                              onChange={(e) => updateDocument(activeWeek, doc.id, 'title', e.target.value)}
                              placeholder="e.g., Hiragana Practice Sheet"
                            />
                          </div>
                          <div>
                            <Label>File Type</Label>
                            <Select
                              value={doc.fileType || 'pdf'}
                              onValueChange={(value: any) => updateDocument(activeWeek, doc.id, 'fileType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="doc">DOC</SelectItem>
                                <SelectItem value="docx">DOCX</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label>File Name</Label>
                            <Input
                              value={doc.fileName || ''}
                              onChange={(e) => updateDocument(activeWeek, doc.id, 'fileName', e.target.value)}
                              placeholder="document.pdf"
                            />
                          </div>
                          <div>
                            <Label>Document File</Label>
                            <div className="space-y-2">
                              <Input
                                value={doc.fileUrl || ''}
                                onChange={(e) => updateDocument(activeWeek, doc.id, 'fileUrl', e.target.value)}
                                placeholder="https://... or upload below"
                              />
                              <div className="flex gap-2">
                                <Input
                                  id={`doc-${activeWeek}-${doc.id}`}
                                  type="file"
                                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const formData = new FormData();
                                    formData.append('file', file);
                                    formData.append('type', 'document');

                                    try {
                                      const response = await fetch('/api/upload', {
                                        method: 'POST',
                                        body: formData,
                                      });

                                      const data = await response.json();
                                      if (data.success) {
                                        updateDocument(activeWeek, doc.id, 'fileUrl', data.url);
                                        updateDocument(activeWeek, doc.id, 'fileName', data.filename);
                                        alert('Document uploaded successfully!');
                                      } else {
                                        alert('Upload failed: ' + data.error);
                                      }
                                    } catch (error) {
                                      alert('Upload failed. Please try again.');
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`doc-${activeWeek}-${doc.id}`}
                                  className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
                                >
                                  📄 Upload Document
                                </label>
                                {doc.fileUrl && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(doc.fileUrl, '_blank')}
                                  >
                                    👁️ Preview
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeDocumentFromWeek(activeWeek, doc.id)}
                        >
                          Remove Document
                        </Button>
                      </div>
                    ))}

                    {currentWeek.documents.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No documents added yet</p>
                    )}
                  </div>

                  {/* Comments */}
                  <div>
                    <Label>Week {activeWeek} Comments/Notes</Label>
                    <Textarea
                      value={currentWeek.comments || ''}
                      onChange={(e) => updateWeekComments(activeWeek, e.target.value)}
                      placeholder="Add notes or instructions for this week..."
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Class Links Tab */}
          {activeTab === 'classes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Live Class Links</h3>
                <Button onClick={addClassLink}>Add Class Link</Button>
              </div>

              {classLinks.map((link, linkIndex) => (
                <div key={`link-${linkIndex}`} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Class Title</Label>
                      <Input
                        value={link.title || ''}
                        onChange={(e) => updateClassLink(link.id, 'title', e.target.value)}
                        placeholder="e.g., Weekly Grammar Class"
                      />
                    </div>
                    <div>
                      <Label>Meeting URL</Label>
                      <Input
                        value={link.meetingUrl || ''}
                        onChange={(e) => updateClassLink(link.id, 'meetingUrl', e.target.value)}
                        placeholder="https://zoom.us/..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Schedule</Label>
                      <Input
                        type="datetime-local"
                        value={link.schedule || ''}
                        onChange={(e) => updateClassLink(link.id, 'schedule', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={link.description || ''}
                        onChange={(e) => updateClassLink(link.id, 'description', e.target.value)}
                        placeholder="Brief description"
                      />
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeClassLink(link.id)}
                  >
                    Remove Class Link
                  </Button>
                </div>
              ))}

              {classLinks.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No class links added yet</p>
              )}
            </div>
          )}

          {/* Blog Posts Tab */}
          {activeTab === 'blogs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Blog Posts</h3>
                <Button onClick={addBlogPost}>Add Blog Post</Button>
              </div>

              {blogPosts.map((blog, blogIndex) => (
                <div key={`blog-${blogIndex}`} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Blog Title</Label>
                      <Input
                        value={blog.title || ''}
                        onChange={(e) => updateBlogPost(blog.id, 'title', e.target.value)}
                        placeholder="Blog title"
                      />
                    </div>
                    <div>
                      <Label>Author</Label>
                      <Input
                        value={blog.author || ''}
                        onChange={(e) => updateBlogPost(blog.id, 'author', e.target.value)}
                        placeholder="Author name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Excerpt</Label>
                    <Textarea
                      value={blog.excerpt || ''}
                      onChange={(e) => updateBlogPost(blog.id, 'excerpt', e.target.value)}
                      placeholder="Brief excerpt..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={blog.content || ''}
                      onChange={(e) => updateBlogPost(blog.id, 'content', e.target.value)}
                      placeholder="Full blog content..."
                      rows={6}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Featured Image</Label>
                        <div className="space-y-2">
                          <Input
                            value={blog.featuredImageUrl || ''}
                            onChange={(e) => updateBlogPost(blog.id, 'featuredImageUrl', e.target.value)}
                            placeholder="https://... or upload below"
                          />
                          <div className="flex gap-2">
                            <Input
                              id={`blog-image-${blog.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const formData = new FormData();
                                formData.append('file', file);

                                try {
                                  const response = await fetch('/api/upload', {
                                    method: 'POST',
                                    body: formData,
                                  });

                                  const data = await response.json();
                                  if (data.success) {
                                    updateBlogPost(blog.id, 'featuredImageUrl', data.url);
                                    alert('Image uploaded successfully!');
                                  } else {
                                    alert('Upload failed: ' + data.error);
                                  }
                                } catch (error) {
                                  alert('Upload failed. Please try again.');
                                }
                              }}
                            />
                            <label
                              htmlFor={`blog-image-${blog.id}`}
                              className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
                            >
                              📁 Upload Image
                            </label>
                            {blog.featuredImageUrl && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(blog.featuredImageUrl, '_blank')}
                              >
                                👁️ Preview
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Publish Date</Label>
                        <Input
                          type="date"
                          value={blog.publishDate || ''}
                          onChange={(e) => updateBlogPost(blog.id, 'publishDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={(blog.tags || []).join(', ')}
                      onChange={(e) => updateBlogPost(blog.id, 'tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                      placeholder="japanese, learning, beginner"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={blog.publishImmediately}
                        onCheckedChange={(checked) => updateBlogPost(blog.id, 'publishImmediately', checked)}
                      />
                      <Label>Publish Immediately</Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeBlogPost(blog.id)}
                    >
                      Remove Blog
                    </Button>
                  </div>
                </div>
              ))}

              {blogPosts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No blog posts added yet</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
