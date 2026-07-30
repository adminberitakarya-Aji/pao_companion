import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCompanionDto {
  @IsIn(["girlfriend", "boyfriend"], {
    message: "personaType harus \"girlfriend\" atau \"boyfriend\"",
  })
  personaType: "girlfriend" | "boyfriend";

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(5, { message: "Deskripsi tampilan minimal 5 karakter" })
  @MaxLength(500, { message: "Deskripsi tampilan maksimal 500 karakter" })
  appearanceDescription: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  personalityDescription?: string;
}
