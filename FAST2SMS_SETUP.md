# Fast2SMS Setup Guide

This guide will help you set up real SMS OTP functionality using Fast2SMS (Indian SMS service provider).

## Prerequisites

1. A Fast2SMS account
2. Node.js installed on your system

## Step 1: Create Fast2SMS Account

1. Go to [https://www.fast2sms.com/](https://www.fast2sms.com/)
2. Click on **"Sign Up"** or **"Register"**
3. Fill in your details and create an account
4. Verify your email and phone number

## Step 2: Get API Key

1. After logging in, navigate to **"Dev API"** section in your dashboard
2. You'll find your **API Authorization Key** (also called API Key)
3. Copy this key - you'll need it in the next step
4. The key looks like: `YOUR_API_KEY_HERE`

## Step 3: Add Credits (Required)

1. Fast2SMS requires credits to send SMS
2. Go to **"Add Credits"** or **"Buy Credits"** section
3. Purchase credits (they offer various plans)
4. Note: Free trial credits may be available for new accounts

## Step 4: Configure Environment Variables

1. Open the `.env` file in your project root
2. Add your Fast2SMS API key:

```env
FAST2SMS_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=development
```

3. **Important**: 
   - Replace `your_api_key_here` with your actual API key from Step 2
   - Never commit `.env` file to git (it's already in `.gitignore`)

## Step 5: Install Dependencies

If you haven't already, install all dependencies:

```bash
npm install
```

## Step 6: Start the Server

You have two options:

### Option A: Run Server and Frontend Separately

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### Option B: Run Both Together

```bash
npm run dev:full
```

This will start both the backend server (port 3001) and frontend (port 3000).

## Step 7: Test the Integration

1. Open your browser to `http://localhost:3000`
2. Go to the login page
3. Enter your 10-digit Indian mobile number (e.g., 9876543210)
4. Click "Send OTP"
5. You should receive an SMS with the OTP code on your phone
6. Enter the OTP and log in

## Phone Number Format

- **Format**: 10-digit Indian mobile number
- **Examples**: 
  - Valid: `9876543210`, `9123456789`, `8765432109`
  - Invalid: `+91 9876543210`, `919876543210`, `09876543210`
- The system automatically removes any spaces or special characters
- Must start with 6, 7, 8, or 9 (Indian mobile number format)

## Demo Mode (Without Fast2SMS)

If you don't configure Fast2SMS API key, the system will run in **demo mode**:
- OTP will be generated and returned in the API response
- No actual SMS will be sent
- You can still test the login flow using the OTP from the response/alert

## Troubleshooting

### "Failed to send SMS" or API Error
- Verify your API key is correct in `.env` file
- Check that you have sufficient credits in your Fast2SMS account
- Ensure your Fast2SMS account is active
- Check the server console for detailed error messages

### "Invalid phone number"
- Phone number must be exactly 10 digits
- Must be a valid Indian mobile number (starts with 6, 7, 8, or 9)
- Remove country code (+91) and leading zeros
- Example: Use `9876543210` not `+91 9876543210` or `919876543210`

### "OTP not received"
- Check your Fast2SMS dashboard for SMS delivery status
- Verify you have credits in your account
- Check spam/junk folder in your phone messages
- In demo mode, check the alert popup or browser console for the OTP

### Server won't start
- Make sure port 3001 is not already in use
- Check that all dependencies are installed: `npm install`
- Verify Node.js version is 16 or higher

### CORS Error
- The backend server is configured to allow CORS from `http://localhost:3000`
- If using a different port, update CORS settings in `server.js`

## Fast2SMS API Details

- **API Endpoint**: `https://www.fast2sms.com/dev/bulkV2`
- **Method**: POST
- **Route**: `otp` (for OTP messages)
- **Language**: English
- **Rate Limits**: Check your Fast2SMS plan for rate limits
- **Pricing**: Pay-as-you-go pricing (check Fast2SMS website for current rates)

## Security Best Practices

1. **Never expose API key** in frontend code or public repositories
2. **Use environment variables** for API keys (already configured)
3. **Enable IP Whitelisting** in Fast2SMS dashboard (if available)
4. **Rate Limiting**: Consider adding rate limiting to prevent abuse
5. **OTP Expiration**: OTPs expire in 5 minutes (configurable in code)

## Production Considerations

1. **Use Redis or Database** for OTP storage (currently using in-memory Map)
2. **Rate Limiting** - Add rate limiting to prevent abuse
3. **Error Handling** - Add comprehensive error handling and logging
4. **Monitoring** - Set up monitoring for SMS delivery failures
5. **OTP Expiration** - Currently 5 minutes (adjust as needed)
6. **Retry Logic** - Consider adding retry logic for failed SMS sends
7. **Logging** - Add proper logging for SMS sends and failures

## Alternative: Using GET Request (Legacy)

If the POST method doesn't work, Fast2SMS also supports GET requests:

```javascript
const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&message=${encodeURIComponent(message)}&language=english&route=otp&numbers=${phoneNumber}`;
```

However, POST method with Authorization header is recommended and more secure.

## Support

- Fast2SMS Documentation: [https://docs.fast2sms.com/](https://docs.fast2sms.com/)
- Fast2SMS Support: Check their website for support contact information
- API Status: Check Fast2SMS status page if experiencing issues
