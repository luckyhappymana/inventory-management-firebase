import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'shared@inventory.app',
        password: password
      });

      if (error) {
        console.error('Login error:', error);
        throw new Error('パスワードが正しくありません');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error logging out:', error);
      throw new Error('ログアウトに失敗しました');
    }
  }

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}