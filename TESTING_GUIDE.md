# 🧪 TESTING & DEPLOYMENT COMMANDS

## Quick Start Commands

### Terminal 1: Backend
```bash
cd backend
npm install
npm start
```
✅ Backend running on http://localhost:5000

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm start
```
✅ Frontend running on http://localhost:3000

---

## 🧪 Testing Workflow

### Step 1: Test Mentors Endpoint (Backend)

**Via Postman or cURL:**
```bash
# Get all mentors
curl http://localhost:5000/api/mentors

# Response example:
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Sarah Chen",
    "email": "sarah@example.com",
    "role": "mentor"
  }
]
```

### Step 2: Test Courses Endpoint (Backend)

```bash
# Get all published courses
curl http://localhost:5000/courses

# Response example:
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Data Science Bootcamp",
    "description": "Learn data science",
    "price": 499,
    "category": "Tech"
  }
]
```

### Step 3: Test Frontend Pages

#### Test 3.1: Home Page
- Navigate to http://localhost:3000
- ✅ Should see hero section
- ✅ Should see courses dropdown
- ✅ Should see mentors preview

#### Test 3.2: Courses Page
- Navigate to http://localhost:3000/courses
- ✅ Should show all courses
- ✅ Try search: type "data"
- ✅ Try sort: select "Price: Low to High"
- ✅ Try enroll button (should redirect to login)

#### Test 3.3: Mentors Page
- Navigate to http://localhost:3000/mentors
- ✅ Should show all mentors from database
- ✅ Try search: type mentor name
- ✅ Try filter: select "Tech"
- ✅ Try connect button (should redirect to login)

---

## 📋 User Registration for Testing

### Create Test Student
```
URL: http://localhost:3000/register
Name: Test Student
Email: student@test.com
Password: password123
Role: Student
```

### Create Test Mentor
```
URL: http://localhost:3000/register
Name: Test Mentor
Email: mentor@test.com
Password: password123
Role: Mentor
```

After registration:
1. Mentor should appear on http://localhost:3000/mentors
2. Login and test student dashboard
3. Verify authentication works

---

## 🔍 Detailed Test Cases

### Test Case 1: Browse Courses Without Login
```
1. Navigate to http://localhost:3000/courses
2. Verify page loads with course list
3. Click search box and type "data"
4. Verify results filter
5. Try to click "Enroll Now"
6. Verify redirects to http://localhost:3000/login
```

### Test Case 2: Browse Mentors Without Login
```
1. Navigate to http://localhost:3000/mentors
2. Verify page loads with mentor list
3. Search for mentor by typing name
4. Verify results filter
5. Select category filter
6. Verify results filter by category
7. Click "Connect" button
8. Verify redirects to http://localhost:3000/login
```

### Test Case 3: Courses Dropdown in Navbar
```
1. Navigate to http://localhost:3000
2. Click "Courses" in navbar
3. Verify dropdown appears with 4 courses
4. Verify each course card is visible
5. Click on a course
6. Verify redirects to login (if not authenticated)
7. Login and repeat
8. Verify navigates to /courses
```

### Test Case 4: Mobile Responsiveness
```
1. Open http://localhost:3000/courses on mobile (375px width)
2. Verify layout is single column
3. Verify buttons are full width
4. Verify text is readable
5. Verify search box works on mobile
6. Repeat on tablet (768px width)
```

### Test Case 5: Search & Filter
```
Courses Page:
1. Search for "web development"
2. Verify only matching courses show
3. Sort by "Price: High to Low"
4. Verify courses sorted correctly
5. Clear search
6. Verify all courses show again

Mentors Page:
1. Search for "Sarah"
2. Verify only Sarah Chen shows
3. Filter by "Tech"
4. Verify only tech mentors show
5. Clear search & filter
6. Verify all mentors show again
```

---

## 🐛 Debug Commands

### Check Backend Logs
```bash
# Terminal 1 should show:
# [auth] login payload: {...}
# Connected to MongoDB
# Server running on port 5000
```

### Check Frontend Logs
```bash
# Browser Console (F12):
# Should NOT show CORS errors
# Should NOT show 404 errors
# API calls should return 200 status
```

### API Health Check
```bash
# In browser console:
curl http://localhost:5000
# Response: "Backend running 🚀"

curl http://localhost:5000/api/mentors
# Response: [{ _id, name, email, role }, ...]

curl http://localhost:5000/courses
# Response: [{ _id, title, price, ... }, ...]
```

---

## ✅ Verification Checklist

### Backend ✅
- [ ] npm install completed without errors
- [ ] npm start shows "Server running on port 5000"
- [ ] Database connection successful
- [ ] GET /api/mentors returns mentors
- [ ] GET /courses returns courses
- [ ] POST /auth/register works
- [ ] POST /auth/login works

### Frontend ✅
- [ ] npm install completed without errors
- [ ] npm start shows "Compiled successfully"
- [ ] http://localhost:3000 loads
- [ ] /courses page loads
- [ ] /mentors page loads
- [ ] Navbar dropdown works
- [ ] Authentication checks work

### Pages ✅
- [ ] Home page displays correctly
- [ ] Courses page displays correctly
- [ ] Mentors page displays correctly
- [ ] Login page works
- [ ] Register page works
- [ ] Dashboard pages work (when logged in)

### Styling ✅
- [ ] Colors look correct
- [ ] Fonts render properly
- [ ] Responsive layouts work
- [ ] Animations are smooth
- [ ] Buttons are clickable
- [ ] Forms are usable

### Authentication ✅
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Token stored in localStorage
- [ ] Logout works
- [ ] Protected pages redirect to login
- [ ] Can access dashboard when logged in

---

## 🚀 Performance Testing

### Load Time Test
```bash
# Open DevTools (F12)
# Go to Network tab
# Navigate to http://localhost:3000/courses
# Check load time: Should be < 2 seconds
```

### API Response Time
```bash
# In browser console:
console.time('API');
fetch('http://localhost:5000/api/mentors')
  .then(res => res.json())
  .then(data => console.timeEnd('API'));
# Should complete in < 500ms
```

### Responsive Design Test
```bash
# DevTools > Toggle Device Toolbar (Ctrl+Shift+M)
# Test on:
# - iPhone 12 (390 x 844)
# - iPad (768 x 1024)
# - Desktop (1200 x 800)
# All should look good
```

---

## 📊 Data Verification

### Check Database Mentors
```bash
# Connect to MongoDB
# Use edtech database
# Find mentors in users collection:
db.users.find({ role: "mentor" })

# Should show all registered mentors
```

### Check Database Courses
```bash
# Find published courses:
db.courses.find({ published: true })

# Should show all published courses
```

---

## 🔧 Troubleshooting Commands

### If Backend Won't Start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

### If Frontend Won't Start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### If API Calls Fail
```bash
# Check if backend is running:
curl http://localhost:5000

# Check if CORS is enabled:
# Should see "Backend running 🚀"

# Check specific endpoint:
curl http://localhost:5000/api/mentors
```

### If Database Connection Fails
```bash
# Check MongoDB is running
# Check connection string in .env
# Verify database name
# Try connecting with MongoDB Compass
```

### Clear Cache & Restart
```bash
# Clear browser cache:
# DevTools > Application > Clear site data

# Or in Terminal:
rm -rf frontend/node_modules backend/node_modules
npm install # in both folders

# Restart both npm start commands
```

---

## 📈 Monitoring

### Keep These Running
```bash
Terminal 1 - Backend:
npm start
# Watch for errors

Terminal 2 - Frontend:
npm start
# Watch for compilation errors

Terminal 3 - Browser Console (F12):
# Watch for runtime errors
```

### What to Monitor
- ✅ Console for JavaScript errors
- ✅ Network tab for API failures
- ✅ Performance for slow loads
- ✅ Layout for responsive issues

---

## 🎯 Success Criteria

### Backend
- ✅ Server runs without errors
- ✅ API endpoints respond correctly
- ✅ Database operations work
- ✅ Authentication works

### Frontend
- ✅ Pages render correctly
- ✅ Navigation works
- ✅ Forms work
- ✅ API calls succeed

### Integration
- ✅ Frontend communicates with backend
- ✅ Authentication flows work
- ✅ Data displays correctly
- ✅ All features work together

### User Experience
- ✅ Pages load quickly
- ✅ No console errors
- ✅ Responsive on all devices
- ✅ Smooth animations

---

## 📝 Test Report Template

```markdown
## Test Report - [Date]

### Backend Tests
- [ ] Server starts successfully
- [ ] Mentors endpoint returns data
- [ ] Courses endpoint returns data
- [ ] Authentication works

### Frontend Tests
- [ ] Home page loads
- [ ] Courses page loads
- [ ] Mentors page loads
- [ ] Navigation works

### Integration Tests
- [ ] Can browse courses without login
- [ ] Can search/filter courses
- [ ] Can browse mentors without login
- [ ] Can search/filter mentors

### Authentication Tests
- [ ] Can register new user
- [ ] Can login
- [ ] Login redirects work
- [ ] Protected pages work

### Responsive Tests
- [ ] Mobile (375px) works
- [ ] Tablet (768px) works
- [ ] Desktop (1200px) works

### Performance Tests
- [ ] Page load < 2s
- [ ] API response < 500ms
- [ ] No console errors
- [ ] Smooth animations

### Issues Found
- [List any issues]

### Status
- [ ] PASSED - Ready for production
- [ ] FAILED - Needs fixes
```

---

## 🎉 Ready to Go!

Follow these steps to get your EduMentor platform running and tested. All tests should pass! 🚀

**Good luck with your testing!**
