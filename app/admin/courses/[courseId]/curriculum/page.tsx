'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { courseStorage, Course, Lesson, Vocabulary, GrammarPoint, Exercise, createEmptyLesson } from '@/lib/courseStorage';

export default function CourseCurriculum() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'add-lesson'>('overview');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState(createEmptyLesson());

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = () => {
    setIsLoading(true);
    try {
      const foundCourse = courseStorage.getCourseById(courseId);
      setCourse(foundCourse);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLesson = () => {
    if (!course || !newLesson.title.trim()) return;

    const lesson: Lesson = {
      ...newLesson,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };

    const updatedCourse = courseStorage.updateCourse(courseId, {
      lessons: [...course.lessons, lesson]
    });

    if (updatedCourse) {
      setCourse(updatedCourse);
      setNewLesson(createEmptyLesson());
      setActiveTab('lessons');
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!course) return;

    if (window.confirm('Are you sure you want to delete this lesson?')) {
      const updatedLessons = course.lessons.filter(lesson => lesson.id !== lessonId);
      const updatedCourse = courseStorage.updateCourse(courseId, {
        lessons: updatedLessons
      });

      if (updatedCourse) {
        setCourse(updatedCourse);
        setSelectedLesson(null);
      }
    }
  };

  const addVocabularyToLesson = (lessonId: string, vocabulary: Omit<Vocabulary, 'id'>) => {
    if (!course) return;

    const updatedLessons = course.lessons.map(lesson => {
      if (lesson.id === lessonId) {
        return {
          ...lesson,
          vocabulary: [
            ...lesson.vocabulary,
            { ...vocabulary, id: Date.now().toString(36) + Math.random().toString(36).substr(2) }
          ]
        };
      }
      return lesson;
    });

    const updatedCourse = courseStorage.updateCourse(courseId, { lessons: updatedLessons });
    if (updatedCourse) {
      setCourse(updatedCourse);
      const updatedLesson = updatedLessons.find(l => l.id === lessonId);
      if (updatedLesson) setSelectedLesson(updatedLesson);
    }
  };

  const addGrammarToLesson = (lessonId: string, grammar: Omit<GrammarPoint, 'id'>) => {
    if (!course) return;

    const updatedLessons = course.lessons.map(lesson => {
      if (lesson.id === lessonId) {
        return {
          ...lesson,
          grammar: [
            ...lesson.grammar,
            { ...grammar, id: Date.now().toString(36) + Math.random().toString(36).substr(2) }
          ]
        };
      }
      return lesson;
    });

    const updatedCourse = courseStorage.updateCourse(courseId, { lessons: updatedLessons });
    if (updatedCourse) {
      setCourse(updatedCourse);
      const updatedLesson = updatedLessons.find(l => l.id === lessonId);
      if (updatedLesson) setSelectedLesson(updatedLesson);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Course Not Found</h1>
          <p className="text-sm text-muted-foreground">The requested course could not be found.</p>
        </div>
        <Button onClick={() => router.push('/admin/courses')}>
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{course.name}</h1>
          <p className="text-sm text-muted-foreground">Manage course curriculum and lessons</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/courses')}>
            Back to Courses
          </Button>
          <Badge className={course.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {course.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'lessons', label: `Lessons (${course.lessons.length})` },
            { id: 'add-lesson', label: 'Add Lesson' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Level</div>
                  <div className="font-medium">{course.level}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Duration</div>
                  <div className="font-medium">{course.duration}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Price</div>
                  <div className="font-medium">
                    {course.price === 0 ? 'Free' : `${course.currency} ${course.price}`}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Students</div>
                  <div className="font-medium">{course.enrolledStudents}</div>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">Description</div>
                <p className="text-sm mt-1">{course.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Curriculum Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Lessons</div>
                  <div className="text-2xl font-semibold">{course.lessons.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Duration</div>
                  <div className="text-2xl font-semibold">
                    {course.lessons.reduce((sum, lesson) => sum + lesson.duration, 0)} min
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Vocabulary Words</div>
                  <div className="text-2xl font-semibold">
                    {course.lessons.reduce((sum, lesson) => sum + lesson.vocabulary.length, 0)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Grammar Points</div>
                  <div className="text-2xl font-semibold">
                    {course.lessons.reduce((sum, lesson) => sum + lesson.grammar.length, 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lessons Tab */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          {course.lessons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="space-y-3">
                  <p className="text-lg font-medium">No lessons yet</p>
                  <p className="text-muted-foreground">Start building your course by adding the first lesson.</p>
                  <Button onClick={() => setActiveTab('add-lesson')}>
                    Add First Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {course.lessons.map((lesson, index) => (
                <Card key={lesson.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedLesson(lesson)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Lesson {index + 1}: {lesson.title}
                        </CardTitle>
                        <CardDescription>{lesson.description}</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(lesson.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Duration</div>
                        <div className="font-medium">{lesson.duration} min</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Vocabulary</div>
                        <div className="font-medium">{lesson.vocabulary.length} words</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Grammar</div>
                        <div className="font-medium">{lesson.grammar.length} points</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Exercises</div>
                        <div className="font-medium">{lesson.exercises.length} items</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Lesson Tab */}
      {activeTab === 'add-lesson' && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Lesson</CardTitle>
            <CardDescription>Create a new lesson for {course.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddLesson();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lessonTitle">Lesson Title *</Label>
                  <Input
                    id="lessonTitle"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Introduction to Hiragana"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonDuration">Duration (minutes)</Label>
                  <Input
                    id="lessonDuration"
                    type="number"
                    value={newLesson.duration}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    min="1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessonDescription">Description</Label>
                <textarea
                  id="lessonDescription"
                  value={newLesson.description}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What will students learn in this lesson?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewLesson(createEmptyLesson())}
                >
                  Reset
                </Button>
                <Button type="submit">Add Lesson</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Selected Lesson Details Modal/Sidebar */}
      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onAddVocabulary={(vocab) => addVocabularyToLesson(selectedLesson.id, vocab)}
          onAddGrammar={(grammar) => addGrammarToLesson(selectedLesson.id, grammar)}
        />
      )}
    </div>
  );
}

// Lesson Detail Modal Component
function LessonDetailModal({
  lesson,
  onClose,
  onAddVocabulary,
  onAddGrammar,
}: {
  lesson: Lesson;
  onClose: () => void;
  onAddVocabulary: (vocab: Omit<Vocabulary, 'id'>) => void;
  onAddGrammar: (grammar: Omit<GrammarPoint, 'id'>) => void;
}) {
  const [activeSection, setActiveSection] = useState<'vocabulary' | 'grammar' | 'exercises'>('vocabulary');
  const [newVocab, setNewVocab] = useState<Omit<Vocabulary, 'id'>>({
    word: '',
    hiragana: '',
    romaji: '',
    meaning: '',
    example: '',
    exampleTranslation: '',
  });
  const [newGrammar, setNewGrammar] = useState<Omit<GrammarPoint, 'id'>>({
    title: '',
    description: '',
    structure: '',
    examples: [],
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{lesson.title}</h2>
              <p className="text-muted-foreground">{lesson.description}</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Section Navigation */}
          <div className="border-b mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'vocabulary', label: `Vocabulary (${lesson.vocabulary.length})` },
                { id: 'grammar', label: `Grammar (${lesson.grammar.length})` },
                { id: 'exercises', label: `Exercises (${lesson.exercises.length})` },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as typeof activeSection)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === section.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Vocabulary Section */}
          {activeSection === 'vocabulary' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Vocabulary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Japanese word (漢字)"
                      value={newVocab.word}
                      onChange={(e) => setNewVocab(prev => ({ ...prev, word: e.target.value }))}
                    />
                    <Input
                      placeholder="Hiragana (ひらがな)"
                      value={newVocab.hiragana}
                      onChange={(e) => setNewVocab(prev => ({ ...prev, hiragana: e.target.value }))}
                    />
                    <Input
                      placeholder="Romaji"
                      value={newVocab.romaji}
                      onChange={(e) => setNewVocab(prev => ({ ...prev, romaji: e.target.value }))}
                    />
                    <Input
                      placeholder="English meaning"
                      value={newVocab.meaning}
                      onChange={(e) => setNewVocab(prev => ({ ...prev, meaning: e.target.value }))}
                    />
                    <Input
                      placeholder="Example sentence (Japanese)"
                      value={newVocab.example}
                      onChange={(e) => setNewVocab(prev => ({ ...prev, example: e.target.value }))}
                      className="md:col-span-2"
                    />
                    <Input
                      placeholder="Example translation (English)"
                      value={newVocab.exampleTranslation}
                      onChange={(e) => setNewVocab(prev => ({ ...prev, exampleTranslation: e.target.value }))}
                      className="md:col-span-2"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (newVocab.word && newVocab.meaning) {
                        onAddVocabulary(newVocab);
                        setNewVocab({
                          word: '',
                          hiragana: '',
                          romaji: '',
                          meaning: '',
                          example: '',
                          exampleTranslation: '',
                        });
                      }
                    }}
                    className="mt-4"
                  >
                    Add Vocabulary
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Vocabulary */}
              <div className="space-y-2">
                {lesson.vocabulary.map((vocab) => (
                  <Card key={vocab.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium">{vocab.word}</div>
                          <div className="text-muted-foreground">{vocab.hiragana}</div>
                        </div>
                        <div>
                          <div className="font-medium">{vocab.meaning}</div>
                          <div className="text-muted-foreground">{vocab.romaji}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-muted-foreground">Example:</div>
                          <div>{vocab.example}</div>
                          <div className="text-muted-foreground text-xs">{vocab.exampleTranslation}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Grammar Section */}
          {activeSection === 'grammar' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Grammar Point</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      placeholder="Grammar title (e.g., です/である)"
                      value={newGrammar.title}
                      onChange={(e) => setNewGrammar(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <textarea
                      placeholder="Description of the grammar point"
                      value={newGrammar.description}
                      onChange={(e) => setNewGrammar(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Input
                      placeholder="Grammar structure (e.g., [noun] + です)"
                      value={newGrammar.structure}
                      onChange={(e) => setNewGrammar(prev => ({ ...prev, structure: e.target.value }))}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (newGrammar.title && newGrammar.description) {
                        onAddGrammar(newGrammar);
                        setNewGrammar({
                          title: '',
                          description: '',
                          structure: '',
                          examples: [],
                        });
                      }
                    }}
                    className="mt-4"
                  >
                    Add Grammar Point
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Grammar */}
              <div className="space-y-2">
                {lesson.grammar.map((grammar) => (
                  <Card key={grammar.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <h4 className="font-medium">{grammar.title}</h4>
                        <p className="text-sm text-muted-foreground">{grammar.description}</p>
                        {grammar.structure && (
                          <div className="text-sm">
                            <span className="font-medium">Structure: </span>
                            <code className="bg-gray-100 px-2 py-1 rounded">{grammar.structure}</code>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Exercises Section */}
          {activeSection === 'exercises' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Exercise management coming soon...</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}