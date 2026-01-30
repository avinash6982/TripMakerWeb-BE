# Online Development Guide - Cursor Agent

## 🌐 Developing Completely Online

This guide is specifically for developing the TripMakerWeb-BE backend **entirely online using Cursor Agent**, without opening the Cursor IDE.

---

## ✨ Why This Setup Works for Online Development

### Swagger as Your Development Environment

With Swagger integrated, you can:
1. **View API Documentation** - Complete specs in your browser
2. **Test Endpoints** - Interactive testing without writing code
3. **Verify Changes** - Immediately see if changes work
4. **Share with Team** - URL-based documentation

### No IDE Required Workflow

```
Cursor Agent (Online) → Make Changes → Deploy → Test in Swagger UI
     ↓                      ↓              ↓            ↓
  Edit files          Git commit      Vercel deploys  Browser testing
```

---

## 🚀 Complete Online Development Workflow

### Phase 1: Initial Setup (One-time)

1. **Clone Repository (via Cursor Agent)**
   ```bash
   # Agent can run these commands
   cd ~/Documents/projects/cursor_agent
   git pull origin main
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Generate JWT secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Add to .env file via agent
   ```

4. **First Deployment to Vercel**
   ```bash
   # Add JWT secret to Vercel
   vercel secrets add jwt_secret "your-generated-secret"
   
   # Deploy
   vercel --prod
   ```

5. **Access Your Swagger Documentation**
   ```
   https://trip-maker-web-be.vercel.app/api-docs
   ```

### Phase 2: Ongoing Development

#### Step 1: Make Changes via Cursor Agent

Tell the agent what you want to change. For example:
- "Add a new endpoint for password reset"
- "Add email validation to the registration"
- "Change token expiration to 30 days"

The agent will:
1. Modify the necessary files
2. Update Swagger annotations
3. Update documentation

#### Step 2: Test Locally (Optional)

If you want to test before deploying:
```bash
npm run dev
# Then open: http://localhost:3000/api-docs
```

#### Step 3: Commit Changes

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

#### Step 4: Deploy to Vercel

Vercel auto-deploys on push to main, or manually:
```bash
vercel --prod
```

#### Step 5: Test in Production Swagger

```
https://trip-maker-web-be.vercel.app/api-docs
```

Use the "Try it out" feature to test your changes.

---

## 📋 Common Development Tasks (Online)

### Task: Add a New API Endpoint

**Tell Cursor Agent:**
```
Add a new endpoint GET /users that returns a list of all users.
Include it in the Swagger documentation with proper schemas.
```

**Agent Will:**
1. Add the endpoint to `server.js`
2. Add Swagger JSDoc comments
3. Update any necessary middleware
4. Add validation if needed

**You Verify:**
1. Review the changes
2. Deploy to Vercel
3. Check Swagger UI for new endpoint
4. Test with "Try it out"

---

### Task: Modify Existing Endpoint

**Tell Cursor Agent:**
```
Update the profile endpoint to require authentication.
Make the JWT token mandatory instead of optional.
```

**Agent Will:**
1. Change middleware from `optionalAuth` to `requireAuth`
2. Update Swagger documentation to show authentication requirement
3. Update error responses in docs

**You Verify:**
1. Deploy changes
2. Test in Swagger UI
3. Verify 401 error without token
4. Verify success with token

---

### Task: Change Validation Rules

**Tell Cursor Agent:**
```
Change password minimum length from 6 to 8 characters.
Update the error message and Swagger docs.
```

**Agent Will:**
1. Update validation in `server.js`
2. Update error message
3. Update Swagger schema
4. Update documentation

**You Verify:**
1. Deploy
2. Test with 6-character password (should fail)
3. Test with 8-character password (should succeed)
4. Check error message is correct

---

### Task: Update Environment Variables

**Tell Cursor Agent:**
```
Add a new environment variable for email service API key.
Update .env.example and documentation.
```

**Agent Will:**
1. Add variable to `.env.example`
2. Document in README and INTEGRATION.md
3. Add to `vercel.json` if needed

**You Do:**
1. Add secret to Vercel:
   ```bash
   vercel secrets add email_api_key "your-key"
   ```
2. Update Vercel environment variables in dashboard

---

## 🧪 Testing Strategy for Online Development

### 1. Use Swagger UI as Your Primary Test Tool

Instead of Postman or writing test scripts:

1. **Navigate to Swagger UI**
   ```
   https://trip-maker-web-be.vercel.app/api-docs
   ```

2. **Test Each Endpoint**
   - Click on the endpoint
   - Click "Try it out"
   - Fill in parameters
   - Click "Execute"
   - Verify response

3. **Test Authentication Flow**
   - Register a user → Copy token
   - Click "Authorize" → Paste token
   - Test protected endpoints

### 2. Use Browser DevTools

Open browser console to:
- Check network requests
- View response headers
- Debug CORS issues
- Monitor WebSocket connections (for future features)

### 3. Use curl for Quick Tests

Ask Cursor Agent to generate curl commands:
```
Generate a curl command to test the login endpoint
```

The agent will provide:
```bash
curl -X POST https://trip-maker-web-be.vercel.app/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

---

## 📚 Using Swagger as Documentation Source

### For Adding New Features

When adding features, always tell the agent to include Swagger docs:

**Good Request:**
```
Add a DELETE /profile/:id endpoint to delete a user account.
Include Swagger documentation with all error responses.
Add proper authentication and validation.
```

**What You Get:**
- Complete endpoint implementation
- Swagger JSDoc annotations
- All error cases documented
- Schema definitions
- Example requests/responses

### For Frontend Integration

Share the Swagger URL with frontend developers:
```
https://trip-maker-web-be.vercel.app/api-docs
```

They can:
- See all endpoints
- Test endpoints directly
- Generate TypeScript types
- Import into API clients
- No need to read code

---

## 🔄 Continuous Integration Workflow

### Automatic Deployment Pipeline

```
1. Edit Code (Cursor Agent)
   ↓
2. Commit to Git
   git add .
   git commit -m "message"
   git push
   ↓
3. Vercel Auto-Deploy
   (Triggered by push)
   ↓
4. Test in Swagger UI
   https://trip-maker-web-be.vercel.app/api-docs
   ↓
5. Update Frontend
   (Reference Swagger for changes)
```

### Version Control Best Practices

Even when developing online, maintain good git practices:

```bash
# Feature branch workflow
git checkout -b feature/add-password-reset
# Make changes via Cursor Agent
git add .
git commit -m "Add password reset endpoint"
git push origin feature/add-password-reset
# Create PR, review, merge
```

---

## 💡 Tips for Efficient Online Development

### 1. Use Swagger as Your Testing Ground

Instead of:
- Writing unit tests first
- Setting up local environment
- Installing API testing tools

Just:
1. Deploy changes
2. Test in Swagger UI
3. Verify behavior
4. Add tests later if needed

### 2. Leverage Vercel's Speed

Vercel deploys in ~30 seconds:
- Make change
- Push to git
- Wait 30 seconds
- Test in Swagger

This is faster than local development with hot reload!

### 3. Use Vercel Logs for Debugging

```bash
# View production logs
vercel logs

# Stream real-time logs
vercel logs --follow
```

### 4. Keep Swagger JSON for API Clients

Download the spec for offline work:
```
https://trip-maker-web-be.vercel.app/api-docs.json
```

Use it to:
- Generate client code
- Import into Postman/Insomnia
- Share with external teams
- Generate documentation

### 5. Use Environment Variables for Configuration

Never hardcode values. Always use env vars:

```javascript
// Good
const MAX_LOGIN_ATTEMPTS = process.env.MAX_LOGIN_ATTEMPTS || 10;

// Bad
const MAX_LOGIN_ATTEMPTS = 10;
```

Change behavior without code changes via Vercel dashboard.

---

## 🚨 Troubleshooting Online Development

### Issue: Swagger UI Not Updating

**Symptom:** Changes not reflected in Swagger UI

**Solution:**
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
2. Clear browser cache
3. Check Vercel deployment status
4. Verify git push was successful

### Issue: Testing Returns Old Data

**Symptom:** API returns old data after changes

**Solution:**
1. Check if deployment completed
2. Verify you're testing production URL
3. Clear any cached responses
4. Check Vercel logs for errors

### Issue: Can't Access Swagger UI

**Symptom:** `/api-docs` returns 404

**Solution:**
1. Check Vercel deployment logs
2. Verify `swagger-ui-express` installed
3. Check `vercel.json` routing
4. Ensure build succeeded

### Issue: Environment Variables Not Working

**Symptom:** Errors about missing env vars

**Solution:**
1. Check Vercel dashboard environment variables
2. Verify secrets are created: `vercel secrets ls`
3. Check `vercel.json` references correct secrets
4. Redeploy after adding secrets

---

## 📊 Online Development vs Traditional IDE

### Advantages of Online Development with Swagger

| Aspect | Traditional IDE | Online with Swagger |
|--------|----------------|---------------------|
| **Setup Time** | 10-30 minutes | 0 minutes |
| **Testing** | Write tests or use Postman | Click "Try it out" |
| **Documentation** | Separate from code | Auto-generated from code |
| **Collaboration** | Share code | Share URL |
| **Environment** | Local only | Accessible anywhere |
| **Debugging** | Local logs | Vercel logs + Swagger |

### When You Still Need Local Development

Use local development when:
1. **Developing complex features** that need debugging
2. **Working offline** without internet
3. **Performance testing** with large datasets
4. **Database migrations** (when you add a real database)

Even then, Swagger remains your primary documentation.

---

## 🎯 Best Practices for Online Development

### 1. Always Update Swagger Docs

When asking Cursor Agent for changes:
```
Add X feature AND update the Swagger documentation
```

### 2. Test in Production Immediately

Don't accumulate untested changes:
```
Change → Deploy → Test → Repeat
```

### 3. Use Git Branches for Experiments

Don't experiment in main:
```bash
git checkout -b experiment/new-feature
# Make changes
# Test
# If good, merge. If bad, delete branch
```

### 4. Keep .env.example Updated

Always update `.env.example` when adding new variables:
```bash
# Tell agent: "Add EMAIL_API_KEY to .env.example"
```

### 5. Monitor Vercel Usage

Check your Vercel dashboard:
- Deployment frequency
- Build times
- Bandwidth usage
- Error rates

---

## 📖 Complete Example: Adding a Feature Online

### Scenario: Add Password Reset Feature

#### Step 1: Tell Cursor Agent

```
Add a password reset feature with two endpoints:
1. POST /forgot-password - takes email, sends reset token
2. POST /reset-password - takes token and new password

Include:
- JWT tokens for reset (expires in 1 hour)
- Email validation
- Rate limiting
- Complete Swagger documentation
- Error handling
```

#### Step 2: Agent Creates

The agent will:
1. Add both endpoints to `server.js`
2. Add Swagger annotations for both
3. Add validation middleware
4. Add rate limiters
5. Update documentation

#### Step 3: Review Changes

Check what the agent modified:
- `server.js` - New endpoints added
- Swagger annotations added
- Documentation updated

#### Step 4: Deploy

```bash
git add .
git commit -m "Add password reset feature"
git push origin main
```

Vercel auto-deploys (or `vercel --prod`).

#### Step 5: Test in Swagger

1. Go to `https://trip-maker-web-be.vercel.app/api-docs`
2. Find `POST /forgot-password`
3. Click "Try it out"
4. Enter test email
5. Verify response
6. Test `POST /reset-password` with token

#### Step 6: Update Frontend Docs

The agent can generate frontend docs:
```
Update FRONTEND_MIGRATION_GUIDE.md with instructions
for integrating the password reset feature
```

Done! Entire feature added without touching IDE.

---

## 🎓 Learning Resources

### Understanding Swagger/OpenAPI

- **Official Docs:** https://swagger.io/docs/
- **OpenAPI Spec:** https://spec.openapis.org/oas/latest.html
- **Interactive Tutorial:** https://swagger.io/docs/specification/basic-structure/

### Understanding JWT

- **JWT.io:** https://jwt.io - Decode and understand tokens
- **RFC 7519:** https://tools.ietf.org/html/rfc7519

### Vercel Deployment

- **Vercel Docs:** https://vercel.com/docs
- **Environment Variables:** https://vercel.com/docs/environment-variables
- **Serverless Functions:** https://vercel.com/docs/serverless-functions/introduction

---

## ✅ Online Development Checklist

### Setup Phase
- [ ] Repository accessible to Cursor Agent
- [ ] Dependencies installed
- [ ] `.env` configured
- [ ] JWT secret generated
- [ ] Vercel secrets configured
- [ ] First deployment successful
- [ ] Swagger UI accessible

### Development Phase
- [ ] Make changes via Cursor Agent
- [ ] Agent updates Swagger docs
- [ ] Commit changes to git
- [ ] Push to GitHub
- [ ] Vercel auto-deploys
- [ ] Test in Swagger UI
- [ ] Verify all endpoints work
- [ ] Check Vercel logs for errors

### Documentation Phase
- [ ] Swagger documentation complete
- [ ] README.md updated
- [ ] INTEGRATION.md updated
- [ ] Frontend guide updated
- [ ] Environment variables documented
- [ ] Error responses documented

---

## 🎉 Summary

With this setup, you can:

✅ **Develop entirely online** using Cursor Agent  
✅ **Test instantly** with Swagger UI  
✅ **Deploy automatically** with Vercel  
✅ **Document automatically** with Swagger  
✅ **Collaborate easily** by sharing URLs  
✅ **Scale quickly** without local setup  

**Your Development Loop:**
```
Ask Agent → Review → Push → Deploy → Test in Swagger
```

**No IDE required. No local setup. Pure online development.**

---

## 📞 Need Help with Online Development?

- **Cursor Agent:** Just ask! "How do I add feature X?"
- **Swagger Docs:** https://trip-maker-web-be.vercel.app/api-docs
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repository:** All your code is version controlled

---

**Remember:** Swagger is your IDE, testing tool, and documentation all in one!

**Created for:** Online Development with Cursor Agent  
**Version:** 2.0.0  
**Date:** January 30, 2026
