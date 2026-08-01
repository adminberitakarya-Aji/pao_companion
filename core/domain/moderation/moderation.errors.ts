import { DomainError } from "../../shared/errors";
import { ModerationCategory } from "./moderation-category";

// Dilempar saat Content Moderator memutuskan action = "block" untuk pesan
// USER — percakapan dihentikan SEBELUM pesan disimpan atau provider LLM
// dipanggil. httpStatus 422 (bukan 400) supaya klien bisa bedakan "request
// salah format" vs "request valid tapi kontennya ditolak kebijakan".
export class BlockedContentError extends DomainError {
  readonly code = "MODERATION_CONTENT_BLOCKED";
  readonly httpStatus = 422;

  constructor(public readonly category: ModerationCategory) {
    super("Pesan tidak dapat diproses karena melanggar kebijakan konten kami.");
  }
}
