import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../store/useThemeStore.js';
import { toast } from 'react-hot-toast';

// API functions for theme management
const getThemeFromDB = async () => {
  try {
    const response = await fetch('/api/users/theme', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log('Theme API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Theme API Error Response:', errorText);
      throw new Error(`Failed to fetch theme: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Theme API Success:', data);
    return data.theme;
  } catch (error) {
    console.error('Theme API Error:', error);
    throw error;
  }
};

const updateThemeInDB = async (theme) => {
  try {
    console.log('Sending theme to API:', theme);
    
    const response = await fetch('/api/users/theme', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ theme }),
    });

    console.log('Update Theme API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update Theme API Error Response:', errorText);
      throw new Error(`Failed to update theme: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Update Theme API Success:', data);
    return data.theme;
  } catch (error) {
    console.error('Update Theme API Error:', error);
    throw error;
  }
};

export const useTheme = () => {
  const { theme, setTheme } = useThemeStore();
  const queryClient = useQueryClient();

  // Query to get theme from database
  const { data: dbTheme, isLoading: isLoadingTheme } = useQuery({
    queryKey: ['userTheme'],
    queryFn: getThemeFromDB,
    enabled: false, // Don't auto-fetch, we'll trigger it manually
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to update theme in database
  const updateThemeMutation = useMutation({
    mutationFn: updateThemeInDB,
    onSuccess: (updatedTheme) => {
      // Update local storage and store
      setTheme(updatedTheme);
      
      // Invalidate and refetch theme
      queryClient.invalidateQueries(['userTheme']);
      
      toast.success('Theme updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating theme:', error);
      toast.error('Failed to update theme. Please try again.');
    },
  });

  // Function to change theme
  const changeTheme = async (newTheme) => {
    try {
      // Update immediately in local storage for instant feedback
      setTheme(newTheme);
      
      // Update in database
      await updateThemeMutation.mutateAsync(newTheme);
    } catch (error) {
      // Revert to previous theme if database update fails
      setTheme(theme);
      console.error('Error changing theme:', error);
      
      // Show user-friendly error message
      toast.error('Theme updated locally but failed to save to server. Please try again later.');
    }
  };

  // Function to load theme from database
  const loadThemeFromDB = async () => {
    try {
      console.log('Loading theme from database...');
      
      // First, let's test if the server is reachable
      const testResponse = await fetch('/api/health', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (testResponse.ok) {
        console.log('Server is reachable');
      } else {
        console.error('Server health check failed:', testResponse.status);
      }
      
      const dbTheme = await queryClient.fetchQuery({
        queryKey: ['userTheme'],
        queryFn: getThemeFromDB,
      });
      
      if (dbTheme && dbTheme !== theme) {
        setTheme(dbTheme);
      }
    } catch (error) {
      console.error('Error loading theme from database:', error);
      // Keep current theme if loading fails
    }
  };

  return {
    theme,
    changeTheme,
    loadThemeFromDB,
    isLoadingTheme,
    isUpdatingTheme: updateThemeMutation.isPending,
  };
};
