import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  role?: string;
  department?: string;
  ward?: string;
  lastLoginAt: string;
  deviceRemembered: boolean;
}

const STORAGE_KEY = 'ward_remembered_users';
const MAX_STORED_USERS = 5;

export const useLocalUserManager = () => {
  const [storedUsers, setStoredUsers] = useState<StoredUser[]>([]);

  useEffect(() => {
    loadStoredUsers();
  }, []);

  const loadStoredUsers = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const users = JSON.parse(stored) as StoredUser[];
        // Sort by last login date, most recent first
        users.sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime());
        setStoredUsers(users);
      }
    } catch (error) {
      console.error('Error loading stored users:', error);
      setStoredUsers([]);
    }
  };

  const saveUser = async (user: any, profile: any, rememberDevice: boolean = false) => {
    if (!user || !rememberDevice) return;

    try {
      const storedUser: StoredUser = {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || user.email.split('@')[0],
        role: profile?.role,
        department: profile?.department,
        ward: profile?.ward,
        lastLoginAt: new Date().toISOString(),
        deviceRemembered: true
      };

      const existingUsers = storedUsers.filter(u => u.id !== user.id);
      const updatedUsers = [storedUser, ...existingUsers].slice(0, MAX_STORED_USERS);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
      setStoredUsers(updatedUsers);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const removeUser = (userId: string) => {
    try {
      const updatedUsers = storedUsers.filter(u => u.id !== userId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
      setStoredUsers(updatedUsers);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const clearAllUsers = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setStoredUsers([]);
    } catch (error) {
      console.error('Error clearing users:', error);
    }
  };

  const quickSignIn = async (email: string, password: string) => {
    try {
      // Clean up any existing auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          if (key !== STORAGE_KEY) {
            localStorage.removeItem(key);
          }
        }
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };
      
      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateUserLastLogin = (userId: string) => {
    try {
      const updatedUsers = storedUsers.map(user => 
        user.id === userId 
          ? { ...user, lastLoginAt: new Date().toISOString() }
          : user
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
      setStoredUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  return {
    storedUsers,
    saveUser,
    removeUser,
    clearAllUsers,
    quickSignIn,
    updateUserLastLogin,
    loadStoredUsers
  };
};