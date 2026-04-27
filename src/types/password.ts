export interface PasswordStatus {
  passwordSet: boolean;
  recoveryCodeSet: boolean;
  migrationRequired: boolean;
}

export interface PasswordStrength {
  score: number;
  passed: boolean;
  messages: string[];
}

export interface SetupPasswordResult {
  status: PasswordStatus;
  recoveryCode: string;
}

export interface PasswordActionResult {
  success: boolean;
  message: string;
  strength: PasswordStrength | null;
}
