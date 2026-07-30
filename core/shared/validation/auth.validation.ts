// Validasi request-level (bukan business rule domain) — dipakai di DTO
// apps/api sebelum masuk ke use-case. Business rule sebenarnya tetap
// dijaga di domain (UserEmail VO), ini cuma validasi bentuk input HTTP.
export const AUTH_VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 100,
} as const;
