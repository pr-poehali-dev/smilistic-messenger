/**
 * Business: Google OAuth авторизация для мессенджера
 * Args: event с httpMethod, headers, body; context с requestId
 * Returns: JWT токен или редирект для авторизации
 */

interface CloudFunctionEvent {
  httpMethod: string;
  headers: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  body?: string;
  isBase64Encoded: boolean;
  pathParams?: Record<string, string>;
}

interface CloudFunctionContext {
  requestId: string;
  functionName: string;
  functionVersion: string;
  memoryLimitInMB: number;
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

const handler = async (event: CloudFunctionEvent, context: CloudFunctionContext): Promise<any> => {
  const { httpMethod, pathParams, queryStringParameters, headers } = event;
  
  // Handle CORS OPTIONS request
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const path = pathParams?.path || '';

    if (path === 'google' && httpMethod === 'GET') {
      // Redirect to Google OAuth
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent('https://your-domain.com/api/auth/callback')}&` +
        `response_type=code&` +
        `scope=email profile&` +
        `access_type=offline`;

      return {
        statusCode: 302,
        headers: {
          ...corsHeaders,
          'Location': googleAuthUrl
        },
        body: ''
      };
    }

    if (path === 'callback' && httpMethod === 'GET') {
      const code = queryStringParameters?.code;
      
      if (!code) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Authorization code not provided' })
        };
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: 'https://your-domain.com/api/auth/callback'
        })
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Failed to get access token' })
        };
      }

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });

      const googleUser: GoogleUser = await userResponse.json();

      // Store user in database (you'll implement this)
      const user = await upsertUser(googleUser);

      // Generate JWT token
      const jwt = generateJWT(user);

      // Set cookie and redirect
      return {
        statusCode: 302,
        headers: {
          ...corsHeaders,
          'Location': '/',
          'Set-Cookie': `auth_token=${jwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`
        },
        body: ''
      };
    }

    if (path === 'me' && httpMethod === 'GET') {
      // Verify JWT from cookie
      const cookieHeader = headers.cookie || '';
      const authToken = cookieHeader
        .split(';')
        .find(c => c.trim().startsWith('auth_token='))
        ?.split('=')[1];

      if (!authToken) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Not authenticated' })
        };
      }

      const user = verifyJWT(authToken);
      
      if (!user) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Invalid token' })
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(user)
      };
    }

    if (path === 'logout' && httpMethod === 'GET') {
      return {
        statusCode: 302,
        headers: {
          ...corsHeaders,
          'Location': '/',
          'Set-Cookie': 'auth_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
        },
        body: ''
      };
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

exports.handler = handler;

async function upsertUser(googleUser: GoogleUser) {
  // This will be implemented when we set up the database
  return {
    id: googleUser.id,
    email: googleUser.email,
    name: googleUser.name,
    avatar: googleUser.picture
  };
}

function generateJWT(user: any): string {
  // Simple JWT implementation - in production use a proper library
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  }));
  
  const signature = btoa(require('crypto')
    .createHmac('sha256', process.env.JWT_SECRET!)
    .update(`${header}.${payload}`)
    .digest('hex'));
  
  return `${header}.${payload}.${signature}`;
}

function verifyJWT(token: string) {
  try {
    const [header, payload, signature] = token.split('.');
    
    const expectedSignature = btoa(require('crypto')
      .createHmac('sha256', process.env.JWT_SECRET!)
      .update(`${header}.${payload}`)
      .digest('hex'));
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const decoded = JSON.parse(atob(payload));
    
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
}