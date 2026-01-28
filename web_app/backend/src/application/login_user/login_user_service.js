import jwt from '@tsndr/cloudflare-worker-jwt';

export class LoginUserService {
  constructor(userRepository, jwtSecret, salt = 'default_salt') {
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
    this.salt = salt;
  }

  async execute(command) {
    // Find user by email
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = await this.verifyPassword(command.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT
    const token = await jwt.sign(
      {
        userId: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      },
      this.jwtSecret
    );

    return { user, token };
  }

  async verifyPassword(password, hash) {
    const encoder = new TextEncoder();
    const saltBuffer = encoder.encode(this.salt);
    const passwordBuffer = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const derivedKey = new Uint8Array(derivedBits);
    const storedKey = this.base64ToBytes(hash);

    return this.constantTimeEquals(derivedKey, storedKey);
  }

  base64ToBytes(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  constantTimeEquals(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  }
}