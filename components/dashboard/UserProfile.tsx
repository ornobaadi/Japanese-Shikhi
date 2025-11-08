'use client';

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User,
  Mail,
  Calendar,
  Award,
  Target,
  BookOpen,
  Flame,
  Clock,
  Edit,
  Save,
  X
} from "lucide-react";

interface UserStats {
  totalCourses: number;
  completedLessons: number;
  studyStreak: number;
  studyTime: number;
  level: string;
  wordsLearned: number;
}

interface UserProfileProps {
  userStats: UserStats | null;
}

export default function UserProfile({ userStats }: UserProfileProps) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    nativeLanguage: 'English',
    learningGoals: [] as string[],
    currentLevel: 'beginner',
    dailyGoal: 15,
    preferredScript: 'hiragana'
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const data = await response.json();
          setUserProfile({
            firstName: data.firstName || user?.firstName || '',
            lastName: data.lastName || user?.lastName || '',
            nativeLanguage: data.nativeLanguage || 'English',
            learningGoals: data.learningGoals || [],
            currentLevel: data.currentLevel || 'beginner',
            dailyGoal: data.preferences?.dailyGoal || 15,
            preferredScript: data.preferences?.preferredScript || 'hiragana'
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Filter out empty required fields
      const dataToSend = {
        ...userProfile,
        firstName: userProfile.firstName?.trim() || undefined,
        lastName: userProfile.lastName?.trim() || undefined,
        nativeLanguage: userProfile.nativeLanguage || undefined,
        currentLevel: userProfile.currentLevel,
        preferences: {
          dailyGoal: userProfile.dailyGoal,
          preferredScript: userProfile.preferredScript,
        }
      };

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        // Show validation errors
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details.map((err: any) => err.message).join('\n');
          alert(`Validation error:\n${errorMessages}`);
        } else {
          alert(result.error || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
    { name: 'First Steps', description: 'Completed your first lesson', earned: true },
    { name: 'Week Warrior', description: 'Maintained a 7-day streak', earned: (userStats?.studyStreak || 0) >= 7 },
    { name: 'Vocabulary Master', description: 'Learned 100 words', earned: (userStats?.wordsLearned || 0) >= 100 },
    { name: 'Course Completer', description: 'Completed your first course', earned: false },
  ];

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    return '⭐';
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                <AvatarFallback className="text-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.fullName}
                </h2>
                <p className="text-gray-600">{user?.emailAddresses[0]?.emailAddress}</p>
                <Badge className="mt-2">
                  {userProfile.currentLevel.charAt(0).toUpperCase() + userProfile.currentLevel.slice(1)} Learner
                </Badge>
              </div>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Manage your personal information and learning preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={userProfile.firstName}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={userProfile.lastName}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="nativeLanguage">Native Language</Label>
                    <Input
                      id="nativeLanguage"
                      value={userProfile.nativeLanguage}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, nativeLanguage: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dailyGoal">Daily Study Goal (minutes)</Label>
                    <Input
                      id="dailyGoal"
                      type="number"
                      min="5"
                      max="120"
                      value={userProfile.dailyGoal}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, dailyGoal: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-medium">{userProfile.firstName} {userProfile.lastName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{user?.emailAddresses[0]?.emailAddress}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Native Language</p>
                        <p className="font-medium">{userProfile.nativeLanguage}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Daily Goal</p>
                        <p className="font-medium">{userProfile.dailyGoal} minutes</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium">
                        {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                Your learning milestones and accomplishments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      achievement.earned
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        achievement.earned ? 'bg-yellow-200' : 'bg-gray-200'
                      }`}>
                        <Award className={`h-4 w-4 ${
                          achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{achievement.name}</p>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-1">
                  {getStreakEmoji(userStats?.studyStreak || 0)}
                </div>
                <div className="text-2xl font-bold">{userStats?.studyStreak || 0}</div>
                <p className="text-sm text-gray-600">Day Streak</p>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Study Time</span>
                  <span className="font-medium">{formatStudyTime(userStats?.studyTime || 0)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lessons Completed</span>
                  <span className="font-medium">{userStats?.completedLessons || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Words Learned</span>
                  <span className="font-medium">{userStats?.wordsLearned || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Courses Enrolled</span>
                  <span className="font-medium">{userStats?.totalCourses || 0}</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Today's Goal</span>
                  <span>0/{userProfile.dailyGoal} min</span>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Start studying to track your progress!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}