# SMS Service Setup Guide (Twilio)

This guide will help you set up real SMS OTP functionality using Twilio.

## Prerequisites

1. A Twilio account (free trial available)
2. Node.js installed on your system

## Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number

## Step 2: Get Twilio Credentials

1. After signing up, go to your [Twilio Console Dashboard](https://console.twilio.com/)
2. You'll see your **Account SID** and **Auth Token** on the dashboard
3. Copy these values

## Step 3: Get a Phone Number

1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Choose a phone number (you can get a free trial number)
3. Copy the phone number (format: +1234567890)

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env` (if not already done):
   ```bash
   cp .env.example .env
   ```

2. Open `.env` file and add your Twilio credentials:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   PORT=3001
   NODE_ENV=development
   ```

3. **Important**: Never commit `.env` file to git (it's already in `.gitignore`)

## Step 5: Install Dependencies

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
3. Enter your phone number (must include country code, e.g., +1234567890)
4. Click "Send OTP"
5. You should receive an SMS with the OTP code
6. Enter the OTP and log in

## Demo Mode (Without Twilio)

If you don't configure Twilio credentials, the system will run in **demo mode**:
- OTP will be generated but shown in an alert popup
- No actual SMS will be sent
- You can still test the login flow

## Troubleshooting

### "Failed to send OTP"
- Make sure the backend server is running on port 3001
- Check that Twilio credentials are correct in `.env`
- Verify your Twilio account is active

### "Invalid phone number"
- Phone numbers must include country code (e.g., +1 for USA)
- Format: +[country code][number] (e.g., +1234567890)

### Server won't start
- Make sure port 3001 is not already in use
- Check that all dependencies are installed: `npm install`

### OTP not received
- Check your Twilio console for error messages
- Verify your Twilio phone number is correct
- Make sure you have credits/trial balance in Twilio
- In demo mode, check the alert popup for the OTP code

## Twilio Free Trial Limits

- Limited SMS credits (usually enough for testing)
- Can only send SMS to verified phone numbers (during trial)
- Trial numbers can only send to your verified number

## Production Considerations

1. **Use Redis or Database** for OTP storage (currently using in-memory Map)
2. **Rate Limiting** - Add rate limiting to prevent abuse
3. **Environment Variables** - Use secure environment variable management
4. **Error Handling** - Add comprehensive error handling and logging
5. **Phone Number Validation** - Add more robust phone number validation
6. **OTP Expiration** - Currently 5 minutes (adjust as needed)

## Alternative SMS Providers

If you prefer other services:

- **AWS SNS** - Good for AWS infrastructure
- **Vonage (Nexmo)** - Alternative to Twilio
- **Firebase Cloud Messaging** - Google's solution
- **MessageBird** - European provider

The code structure can be adapted for any SMS service provider.
