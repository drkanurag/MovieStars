import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  salt: string;
  role: 'user' | 'moderator' | 'admin';
  avatarUrl?: string;
  createdAt: string;
}

export interface UserSession {
  token: string;
  user: Omit<User, 'passwordHash' | 'salt'>;
  expiresAt: number;
}

export class UserService {
  private static instance: UserService;
  private users: Map<string, User>; // email -> User
  private sessions: Map<string, UserSession>; // token -> UserSession

  private constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.seedDefaultUsers();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }

  private seedDefaultUsers(): void {
    const adminSalt = crypto.randomBytes(16).toString('hex');
    const adminUser: User = {
      id: 'usr_admin_001',
      email: 'admin@moviestars.io',
      displayName: 'System Admin',
      salt: adminSalt,
      passwordHash: this.hashPassword('admin123', adminSalt),
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString(),
    };
    this.users.set(adminUser.email, adminUser);

    const demoSalt = crypto.randomBytes(16).toString('hex');
    const demoUser: User = {
      id: 'usr_demo_002',
      email: 'user@moviestars.io',
      displayName: 'Cinema Fan',
      salt: demoSalt,
      passwordHash: this.hashPassword('password123', demoSalt),
      role: 'user',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString(),
    };
    this.users.set(demoUser.email, demoUser);
  }

  public register(email: string, password: string, displayName: string): { success: boolean; session?: UserSession; error?: string } {
    const cleanEmail = email.toLowerCase().trim();
    if (this.users.has(cleanEmail)) {
      return { success: false, error: 'User with this email already exists' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const user: User = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      displayName: displayName.trim() || cleanEmail.split('@')[0],
      salt,
      passwordHash: this.hashPassword(password, salt),
      role: 'user',
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
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const checkHash = this.hashPassword(password, user.salt);
    if (checkHash !== user.passwordHash) {
      return { success: false, error: 'Invalid email or password' };
    }

    const session = this.createSession(user);
    return { success: true, session };
  }

  public loginWithGoogle(googleEmail: string, googleName: string, avatarUrl?: string): UserSession {
    const cleanEmail = googleEmail.toLowerCase().trim();
    let user = this.users.get(cleanEmail);

    if (!user) {
      const salt = crypto.randomBytes(16).toString('hex');
      user = {
        id: `usr_g_${Date.now()}`,
        email: cleanEmail,
        displayName: googleName,
        salt,
        passwordHash: this.hashPassword(crypto.randomBytes(32).toString('hex'), salt),
        role: 'user',
        avatarUrl,
        createdAt: new Date().toISOString(),
      };
      this.users.set(cleanEmail, user);
    }

    return this.createSession(user);
  }

  private createSession(user: User): UserSession {
    const token = `mvs_jwt_${crypto.randomBytes(32).toString('hex')}`;
    const { passwordHash, salt, ...safeUser } = user;
    const session: UserSession = {
      token,
      user: safeUser,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    this.sessions.set(token, session);
    return session;
  }

  public validateSession(token: string): UserSession | null {
    const session = this.sessions.get(token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }
    return session;
  }

  public logout(token: string): void {
    this.sessions.delete(token);
  }
}

