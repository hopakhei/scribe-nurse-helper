import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  UserPlus, 
  Users, 
  Clock, 
  LogIn, 
  Trash2, 
  Loader2,
  X 
} from 'lucide-react';
import { useLocalUserManager, StoredUser } from '@/hooks/useLocalUserManager';
import { formatDistanceToNow } from 'date-fns';

interface UserSelectionProps {
  onSignInComplete: () => void;
  onNewUserSignIn: () => void;
}

export const UserSelection = ({ onSignInComplete, onNewUserSignIn }: UserSelectionProps) => {
  const { storedUsers, removeUser, clearAllUsers, quickSignIn, updateUserLastLogin } = useLocalUserManager();
  const [selectedUser, setSelectedUser] = useState<StoredUser | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickSignIn = async (user: StoredUser) => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await quickSignIn(user.email, password);
      
      if (error) {
        if (error.message?.includes('Invalid login credentials')) {
          setError('Invalid password. Please try again.');
        } else {
          setError(error.message || 'Failed to sign in. Please try again.');
        }
      } else {
        updateUserLastLogin(user.id);
        onSignInComplete();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (user: StoredUser) => {
    setSelectedUser(user);
    setPassword('');
    setError(null);
  };

  const handleRemoveUser = (userId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeUser(userId);
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
      setPassword('');
      setError(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'doctor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'nurse':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (selectedUser) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUser(null)}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
            <Shield className="h-8 w-8 text-primary" />
            <div className="w-8" />
          </div>
          <CardTitle className="text-xl font-bold">Quick Sign In</CardTitle>
          <CardDescription>
            Enter your password to continue as {selectedUser.fullName}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(selectedUser.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{selectedUser.fullName}</div>
              <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
              <div className="flex gap-2 mt-1">
                {selectedUser.role && (
                  <Badge className={getRoleBadgeColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                )}
                {selectedUser.department && (
                  <Badge variant="outline" className="text-xs">
                    {selectedUser.department}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickSignIn(selectedUser)}
              disabled={isLoading}
            />
          </div>

          <Button 
            onClick={() => handleQuickSignIn(selectedUser)}
            className="w-full"
            disabled={isLoading || !password}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>

          {error && (
            <Alert className="border-destructive">
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Patient Assessment System</CardTitle>
        <CardDescription>
          Choose your account or sign in as a different user
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {storedUsers.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Recent Users</span>
              </div>
              {storedUsers.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllUsers}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {storedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {user.role && (
                          <Badge className={getRoleBadgeColor(user.role)} variant="secondary">
                            {user.role}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleRemoveUser(user.id, e)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="space-y-3">
          <Button
            onClick={onNewUserSignIn}
            variant="outline"
            className="w-full"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Sign in as different user
          </Button>
          
          {storedUsers.length === 0 && (
            <Button
              onClick={onNewUserSignIn}
              className="w-full"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};