export interface RegisterUserInput {
  email: string;
  password: string;
  name?: string;
  // Phase 4 (P4-3) — wajib diisi, divalidasi (umur >= 18) di dalam
  // User.create(). String ISO date dari klien, di-parse di use-case.
  dateOfBirth: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  accessToken: string;
}
