# ShopSync Complete Setup Guide

Follow these exact steps to get ShopSync running.

---

## STEP 1: Install Dependencies

Open terminal in the project folder and run:

```bash
npm install
```

---

## STEP 2: Set Up MongoDB Atlas (Free Tier)

### 2.1 Create Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account
3. Choose the **FREE** tier (M0 Sandbox)

### 2.2 Create Cluster
1. Click **"Build a Database"**
2. Select **"M0 FREE"** tier
3. Choose cloud provider: **AWS**
4. Choose region: Select closest to you
5. Cluster name: `ShopSync` (or keep default)
6. Click **"Create"**

### 2.3 Create Database User
1. In the Security sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `shopsync_admin`
5. Password: Click **"Autogenerate Secure Password"** → COPY THIS PASSWORD
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### 2.4 Allow Network Access
1. In the Security sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Click **"Confirm"**

### 2.5 Get Connection String
1. Go to **"Database"** in sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://shopsync_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password from step 2.3
7. Add database name before `?`:
   ```
   mongodb+srv://shopsync_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/shopsync?retryWrites=true&w=majority
   ```

### 2.6 Update .env
Open `.env` and replace the MONGODB_URI line:
```
MONGODB_URI=mongodb+srv://shopsync_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/shopsync?retryWrites=true&w=majority
```

---

## STEP 3: Set Up Firebase

### 3.1 Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Project name: `shopsync`
4. Disable Google Analytics (optional, not needed)
5. Click **"Create project"**
6. Wait for creation, then click **"Continue"**

### 3.2 Enable Authentication
1. In left sidebar, click **"Authentication"**
2. Click **"Get started"**
3. In **"Sign-in method"** tab:

   **Enable Email/Password:**
   - Click **"Email/Password"**
   - Toggle **"Enable"** ON
   - Click **"Save"**

   **Enable Google:**
   - Click **"Google"**
   - Toggle **"Enable"** ON
   - Select your email as Project support email
   - Click **"Save"**

### 3.3 Get Web App Config
1. Click the **gear icon** (Settings) → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click the **web icon** `</>`
4. App nickname: `ShopSync Web`
5. Do NOT check "Firebase Hosting"
6. Click **"Register app"**
7. You'll see config like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyB...",
     authDomain: "shopsync-xxxxx.firebaseapp.com",
     projectId: "shopsync-xxxxx",
     storageBucket: "shopsync-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
8. **COPY these values** - you need: `apiKey`, `authDomain`, `projectId`

### 3.4 Update HTML Files
Open `public/index.html` and `public/admin.html`, find this section and replace:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // Replace with your apiKey
  authDomain: "YOUR_AUTH_DOMAIN",   // Replace with your authDomain
  projectId: "YOUR_PROJECT_ID",     // Replace with your projectId
};
```

### 3.5 Generate Service Account Key
1. In Firebase Console, click **gear icon** → **"Project settings"**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"**
5. A JSON file downloads (like `shopsync-xxxxx-firebase-adminsdk-xxxxx.json`)
6. **Rename it** to `firebase-service-account.json`
7. **Move it** to your project folder (same folder as `server.js`)

---

## STEP 4: Run the Application

### 4.1 Start Server
```bash
npm start
```

You should see:
```
Server running on port 4000
MongoDB connected
```

### 4.2 Open in Browser
- Shop page: http://localhost:4000
- Admin page: http://localhost:4000/admin.html

---

## STEP 5: Set Up Admin User

### 5.1 Create First User
1. Go to http://localhost:4000/admin.html
2. Sign in with Google (or create email/password account)
3. You'll get "Admin only" error - this is expected!

### 5.2 Get Your User ID
1. In Firebase Console, go to **"Authentication"**
2. In **"Users"** tab, find your email
3. Copy the **"User UID"** (like `abc123def456...`)

### 5.3 Set Admin Claim
Run this command (replace YOUR_USER_UID):

**Option A: Using curl (Mac/Linux):**
```bash
# First, get your ID token from browser console after logging in:
# In browser console: firebase.auth().currentUser.getIdToken().then(t => console.log(t))

curl -X POST http://localhost:4000/api/set-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -d '{"uid": "YOUR_USER_UID"}'
```

**Option B: Create a setup script (easier):**
See `scripts/set-admin.js` file I'll create for you.

### 5.4 Refresh Admin Page
1. Log out and log back in at http://localhost:4000/admin.html
2. You should now have admin access!

---

## Troubleshooting

### "MongoDB error: connection refused"
- Check your MongoDB URI in `.env`
- Make sure you allowed network access in MongoDB Atlas
- Check if password is correct (no special characters issues)

### "Invalid token" or "No token"
- Make sure you're logged in
- Check that Firebase config matches in HTML files
- Check that `firebase-service-account.json` exists and is valid

### "Admin only" error
- You need to set admin claim for your user (Step 5)
- Make sure you're using the correct UID

### Firebase Auth popup blocked
- Allow popups for localhost in your browser
- Or use email/password login instead

---

## Quick Test

After setup, try:
1. Open http://localhost:4000/admin.html
2. Log in with Google
3. Click "Add Product"
4. Add: Title: "Test Product", Price: 9.99
5. Save
6. Open http://localhost:4000 - you should see the product!

---

## Production Deployment

For production:
1. Use environment variables for all secrets
2. Restrict Network Access in MongoDB Atlas to your server IP
3. Set proper CORS origins in `server.js`
4. Use HTTPS
5. Remove or protect the `/api/set-admin` endpoint
