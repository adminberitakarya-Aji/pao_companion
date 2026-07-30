// Status siklus hidup avatar — generate image bersifat async (lewat queue),
// jadi companion bisa eksis dulu sebelum avatarnya selesai di-generate.
export type AvatarStatus = "pending" | "generating" | "ready" | "failed";
