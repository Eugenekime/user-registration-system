import { describe, test, expect, vi, beforeEach } from 'vitest';
import User from '../src/models/User.js';
import { registrationUser } from '../src/services/authService.js';

vi.mock('../src/utils/emailService.js', () => ({
  sendVerificationEmail: vi.fn(),
}));

vi.mock('../src/models/User.js', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

describe('RegistrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should reject duplicate email', async () => {
    vi.mocked(User.findOne).mockResolvedValue({
      email: 'test@example.com',
    } as never);

    await expect(
      registrationUser({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        profile: {
          lastName: 'asdasd',
          firstName: 'asdasdsa',
        },
      })
    ).rejects.toThrow('Email already exists');

    expect(User.findOne).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
  });
});
