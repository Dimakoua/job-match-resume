import { describe, it, expect } from 'vitest';
import { User } from './user.js';

describe('User Entity', () => {
  it('should create a user with googleId', () => {
    const user = new User('1', 'a@b.com', 'name', null, 'google123');
    expect(user.googleId).toBe('google123');
  });

  it('should throw for invalid id', () => {
    expect(() => new User('', 'a@b.com', 'name', null)).toThrow();
  });

  it('should throw for invalid email', () => {
    expect(() => new User('1', 'invalid', 'name', null)).toThrow();
  });

  it('should throw for invalid name', () => {
    expect(() => new User('1', 'a@b.com', '', null)).toThrow();
  });

  it('should throw for invalid password hash', () => {
    expect(() => new User('1', 'a@b.com', 'name', 123)).toThrow();
  });

  it('should throw for invalid googleId', () => {
    expect(() => new User('1', 'a@b.com', 'name', null, 123)).toThrow();
  });

  it('should update name successfully', () => {
    const user = new User('1', 'a@b.com', 'old name', null);
    user.updateName('new name');
    expect(user.name).toBe('new name');
  });

  it('should throw for invalid name update', () => {
    const user = new User('1', 'a@b.com', 'old name', null);
    expect(() => user.updateName('')).toThrow();
    expect(user.name).toBe('old name'); // should not change
  });

  it('should update password hash successfully', () => {
    const user = new User('1', 'a@b.com', 'name', null);
    user.updatePassword('hashedpassword');
    expect(user.passwordHash).toBe('hashedpassword');
  });

  it('should throw for invalid password hash update', () => {
    const user = new User('1', 'a@b.com', 'name', 'oldhash');
    expect(() => user.updatePassword(123)).toThrow();
    expect(user.passwordHash).toBe('oldhash'); // should not change
  });

  it('should update email successfully', () => {
    const user = new User('1', 'old@b.com', 'name', null);
    user.updateEmail('new@c.com');
    expect(user.email).toBe('new@c.com');
  });

  it('should throw for invalid email update', () => {
    const user = new User('1', 'old@b.com', 'name', null);
    expect(() => user.updateEmail('invalid')).toThrow();
    expect(user.email).toBe('old@b.com'); // should not change
  });
});