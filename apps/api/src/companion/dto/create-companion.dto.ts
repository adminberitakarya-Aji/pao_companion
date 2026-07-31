import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

const VALID_SPEECH_STYLES = ["formal", "casual", "playful", "shy", "confident"];

export class CreateCompanionDto {
  @IsIn(["girlfriend", "boyfriend"], {
    message: "personaType harus \"girlfriend\" atau \"boyfriend\"",
  })
  personaType!: "girlfriend" | "boyfriend";

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @IsString()
  @MinLength(5, { message: "Deskripsi tampilan minimal 5 karakter" })
  @MaxLength(500, { message: "Deskripsi tampilan maksimal 500 karakter" })
  appearanceDescription!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  personalityDescription?: string;

  @IsOptional()
  @IsIn(VALID_SPEECH_STYLES, {
    message: `speechStyle harus salah satu dari: ${VALID_SPEECH_STYLES.join(", ")}`,
  })
  speechStyle?: "formal" | "casual" | "playful" | "shy" | "confident";

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8, { message: "Maksimal 8 traits" })
  @IsString({ each: true })
  traits?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: "Backstory maksimal 1000 karakter" })
  backstory?: string;
}
