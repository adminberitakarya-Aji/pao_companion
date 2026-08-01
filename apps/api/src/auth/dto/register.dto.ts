import { IsDateString, IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Email tidak valid" })
  email!: string;

  @IsString()
  @MinLength(8, { message: "Password minimal 8 karakter" })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  // Phase 4 (P4-3) — validasi FORMAT saja di sini (class-validator, layer
  // HTTP). Validasi BISNIS "harus >= 18 tahun" ada di domain (User.create),
  // supaya aturan umur tidak bisa "bocor" lewat jalur lain yang lupa pasang
  // DTO ini (mis. use-case dipanggil langsung dari script/test).
  @IsDateString({}, { message: "Tanggal lahir tidak valid, gunakan format YYYY-MM-DD" })
  dateOfBirth!: string;
}
