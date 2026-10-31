import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  salt?: string;
  role: 'user' | 'moderator' | 'admin';
  avatarUrl?: string;
  googleId?: string;
  createdAt: string;
}

export interface UserSession {
  token: string;
  user: Omit<User, 'passwordHash' | 'salt'>;
  expiresAt: number;
}

interface TokenPayload {
  uid: string;
  email: string;
  name: string;
  role: 'user' | 'moderator' | 'admin';
  exp: number;
}

export class UserService {
  private static instance: UserService;
  private users: Map<string, User>; // email -> User
  private sessionSecret: string;

  private constructor() {
    this.users = new Map();
    // Dynamic or environment-provided session secret
    this.sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
    this.initAdminAccount();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private initAdminAccount(): void {
    // Only configure admin if explicitly provided via environment variables
    const adminEmail = process.env.ADMIN_EMAIL || process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.INITIAL_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const salt = crypto.randomBytes(16).toString('hex');
      const adminUser: User = {
        id: 'usr_admin_master',
        email: adminEmail.toLowerCase().trim(),
        displayName: 'System Admin',
        salt,
        passwordHash: this.hashPassword(adminPassword, salt),
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      this.users.set(adminUser.email, adminUser);
    }
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  }

  /**
   * Cryptographic HMAC-SHA256 Token Signing
   * Generates resilient, stateless signed tokens verifiable across serverless instances.
   */
  private signToken(payload: TokenPayload): string {
    const jsonPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.sessionSecret)
      .update(jsonPayload)
      .digest('base64url');
    return `${jsonPayload}.${signature}`;
  }

  private verifyToken(token: string): TokenPayload | null {
    if (!token || !token.includes('.')) return null;
    const [jsonPayload, signature] = token.split('.');
    if (!jsonPayload || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', this.sessionSecret)
      .update(jsonPayload)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    try {
      const payload: TokenPayload = JSON.parse(Buffer.from(jsonPayload, 'base64url').toString('utf-8'));
      if (Date.now() > payload.exp) {
        return null; // Expired token
      }
      return payload;
    } catch {
      return null;
    }
  }

  public register(
    email: string,
    password: string,
    displayName: string,
    role: 'user' | 'admin' = 'user'
  ): { success: boolean; session?: UserSession; error?: string } {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required' };
    }

    if (this.users.has(cleanEmail)) {
      return { success: false, error: 'User with this email already exists' };
    }

    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const user: User = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      email: cleanEmail,
      displayName: displayName.trim() || cleanEmail.split('@')[0],
      salt,
      passwordHash: this.hashPassword(password, salt),
      role: role === 'admin' ? 'admin' : 'user',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
      createdAt: new Date().toISOString(),
    };

    this.users.set(cleanEmail, user);
    const session = this.createSession(user);
    return { success: true, session };
  }

  public login(email: string, password: string): { success: boolean; session?: UserSession; error?: string } {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.users.get(cleanEmail);
    if (!user || !user.passwordHash || !user.salt) {
      return { success: false, error: 'Invalid email or password' };
    }

    const checkHash = this.hashPassword(password, user.salt);
    const storedHash = Buffer.from(user.passwordHash, 'hex');
    const calculatedHash = Buffer.from(checkHash, 'hex');

    if (
      storedHash.length !== calculatedHash.length ||
      !crypto.timingSafeEqual(storedHash, calculatedHash)
    ) {
      return { success: false, error: 'Invalid email or password' };
    }

    const session = this.createSession(user);
    return { success: true, session };
  }

  /**
   * Verified Google OAuth Integration
   * Validates official Google ID Tokens against Google's OAuth2 certs.
   */
  public async verifyAndLoginWithGoogle(idToken: string): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    if (!idToken || typeof idToken !== 'string') {
      return { success: false, error: 'Missing Google ID Token' };
    }

    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (!res.ok) {
        return { success: false, error: 'Google ID Token validation failed or expired' };
      }

      const googlePayload = await res.json();
      const email = googlePayload.email?.toLowerCase().trim();
      const emailVerified = googlePayload.email_verified === 'true' || googlePayload.email_verified === true;

      if (!email || !emailVerified) {
        return { success: false, error: 'Unverified Google email address' };
      }

      let user = this.users.get(email);
      if (!user) {
        user = {
          id: `usr_g_${googlePayload.sub || Date.now()}`,
          email,
          displayName: googlePayload.name || email.split('@')[0],
          googleId: googlePayload.sub,
          role: 'user',
          avatarUrl: googlePayload.picture,
          createdAt: new Date().toISOString(),
        };
        this.users.set(email, user);
      }

      const session = this.createSession(user);
      return { success: true, session };
    } catch (err: any) {
      return { success: false, error: `Google OAuth verification error: ${err.message}` };
    }
  }

  private createSession(user: User): UserSession {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const token = this.signToken({
      uid: user.id,
      email: user.email,
      name: user.displayName,
      role: user.role,
      exp: expiresAt,
    });

    const { passwordHash, salt, ...safeUser } = user;
    return {
      token,
      user: safeUser,
      expiresAt,
    };
  }

  public validateSession(token: string): UserSession | null {
    const payload = this.verifyToken(token);
    if (!payload) return null;

    let user = this.users.get(payload.email);
    if (!user) {
      // Reconstruct safe user from verified stateless token
      user = {
        id: payload.uid,
        email: payload.email,
        displayName: payload.name,
        role: payload.role,
        createdAt: new Date().toISOString(),
      };
      this.users.set(payload.email, user);
    }

    const { passwordHash, salt, ...safeUser } = user;
    return {
      token,
      user: safeUser,
      expiresAt: payload.exp,
    };
  }

  public requireAdmin(token: string): boolean {
    const session = this.validateSession(token);
    return Boolean(session && session.user.role === 'admin');
  }

  public getUserById(id: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.id === id);
  }
}
