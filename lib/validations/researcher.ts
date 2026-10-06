import * as z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const researcherSchema = z.object({
  fullName: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  phone: z.string().min(9, "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง"),
  affiliation: z.string().min(2, "กรุณากรอกสังกัด/หน่วยงาน"),
  idCard: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, "กรุณาแนบสำเนาบัตรประชาชน")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "ขนาดไฟล์ต้องไม่เกิน 5MB"),
  poster: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, "กรุณาแนบรูปภาพโปสเตอร์")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "ขนาดไฟล์ต้องไม่เกิน 5MB"),
  pdpaConsent: z.boolean().refine((val) => val === true, {
    message: "กรุณายอมรับข้อตกลง PDPA ก่อนส่งข้อมูล",
  }),
});

export type ResearcherFormValues = z.infer<typeof researcherSchema>;