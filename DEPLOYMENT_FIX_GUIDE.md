# Deployment Fix Guide - 404 API Errors

## Problem
The frontend is making API calls to relative URLs (`/api/*`) instead of the full backend URL, causing 404 errors because the frontend's routing system catches these requests.

## Root Cause
The axios configuration was using `/api` as the fallback base URL in production, which causes requests to go to the frontend instead of the backend.

## Changes Made

### 1. Fixed Axios Configuration (`frontend/src/lib/axios.js`)
- Changed fallback base URL from `/api` to `https://someonesdreamproject.onrender.com/api`
- Added debugging interceptors to track API requests
- Added console logging to show actual URLs being used

### 2. Added Missing API Functions (`frontend/src/lib/api.js`)
- Added `getTheme()` function
- Added `updateTheme()` function  
- Added `checkServerHealth()` function

### 3. Updated Theme Hook (`frontend/src/hooks/useTheme.js`)
- Replaced direct fetch calls with axios-based API functions
- Added better error handling
- Temporarily disabled theme loading to prevent 404 errors during deployment

## Deployment Steps

### Step 1: Commit and Push Changes
```bash
git add .
git commit -m "Fix API base URL configuration to prevent 404 errors"
git push origin main
```

### Step 2: Wait for Auto-Deployment
- Render will automatically deploy the frontend when changes are pushed
- Check the Render dashboard for deployment status

### Step 3: Verify Deployment
1. Wait 2-3 minutes for deployment to complete
2. Visit your deployed frontend URL
3. Open browser console and check for:
   - `🔧 Axios Configuration:` log showing correct base URL
   - `🚀 Axios Request:` logs showing full URLs
   - No more 404 errors for API calls

### Step 4: Re-enable Theme Loading
After deployment is successful, uncomment the theme loading code in `frontend/src/hooks/useTheme.js`:

```javascript
// Function to load theme from database
const loadThemeFromDB = async () => {
  // Remove this temporary disable
  // console.log('Theme loading from database temporarily disabled during deployment');
  // return;
  
  try {
    console.log('Loading theme from database...');
    
    // First, let's test if the server is reachable
    try {
      await checkServerHealth();
      console.log('Server is reachable');
    } catch (error) {
      console.error('Server health check failed:', error.message);
      return;
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
  }
};
```

### Step 5: Deploy Theme Loading Fix
```bash
git add .
git commit -m "Re-enable theme loading from database"
git push origin main
```

## Expected Results

After deployment, you should see:
- ✅ No more 404 errors in console
- ✅ API calls going to correct backend URL
- ✅ Theme loading working properly
- ✅ All functionality working as expected

## Debugging

If issues persist, check:
1. Browser console for axios configuration logs
2. Network tab for actual request URLs
3. Render deployment logs for any build errors
4. Backend health endpoint: `https://someonesdreamproject.onrender.com/api/health`

## Rollback Plan

If needed, you can rollback by:
1. Reverting the axios configuration changes
2. Reverting the theme hook changes
3. Pushing the rollback changes
