"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { researcherSchema, ResearcherFormValues } from "@/lib/validations/researcher";

// ฟังก์ชันแปลง File เป็น Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function SubmissionPage() {
  const {
    register,
    handleSubmit,
    watch, // <-- เติมคำว่า watch ตรงนี้ครับ
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResearcherFormValues>({
    resolver: zodResolver(researcherSchema),
  });

  const attendanceType = watch("attendanceType"); // <-- ดึงค่าตัวแปรนี้มาใช้

  const onSubmit = async (data: ResearcherFormValues) => {
    try {
      const idCardFileList = data.idCard as unknown as FileList;
      const posterFileList = data.poster as unknown as FileList;

      const idCardFile = idCardFileList[0];
      const posterFile = posterFileList[0];

      const idCardBase64 = await fileToBase64(idCardFile);
      const posterBase64 = await fileToBase64(posterFile);

      const payload = {
        fullName: data.fullName,
        position: data.position, // <-- เพิ่มบรรทัดนี้
        email: data.email,
        phone: data.phone,
        affiliation: data.affiliation,
        department: data.department,
        attendanceType: data.attendanceType,
        representativeName: data.attendanceType === "representative" ? data.representativeName : "", // <-- เพิ่มบรรทัดนี้
        pdpaConsent: data.pdpaConsent,
        idCard: {
          name: idCardFile.name,
          type: idCardFile.type,
          base64: idCardBase64,
        },
        poster: {
          name: posterFile.name,
          type: posterFile.type,
          base64: posterBase64,
        },
      };

      const apiUrl = process.env.NEXT_PUBLIC_GAS_API_URL;
      if (!apiUrl) {
        alert("กรุณาตั้งค่า NEXT_PUBLIC_GAS_API_URL ใน .env.local");
        return;
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === "success") {
        alert("ส่งข้อมูลและแนบไฟล์ลง Google Drive เรียบร้อยแล้ว!");
        reset();
      } else {
        alert("เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            ส่งข้อมูลเพื่อทำสัญญารับทุนโครงการวิจัย ทุนสนับสนุนมูลฐาน FF70
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            กรุณากรอกข้อมูลและแนบเอกสารเพื่อประกอบการทำสัญญารับทุน
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ชื่อ-นามสกุล */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ชื่อ-นามสกุล ตามบัตรประชาชน
            </label>
            <input
              {...register("fullName")}
              type="text"
              placeholder="นาย สมชาย ใจดี"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* ตำแหน่ง */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
             ตำแหน่ง
            </label>
            <input
            {...register("position")}
            type="text"
            placeholder="อาจารย์ / ผู้ช่วยศาสตราจารย์"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
         />
          {errors.position && (
          <p className="text-xs text-red-500 mt-1">{errors.position.message}</p>
          )}
        </div>

          {/* อีเมล และ เบอร์โทรศัพท์ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                อีเมล
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="somchai@example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                เบอร์โทรศัพท์
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="0812345678"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* สังกัด และ ภาควิชา (บรรทัดเดียวกัน) */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* สังกัด / หน่วยงาน */}
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      สังกัด / หน่วยงาน
    </label>
    <input
      {...register("affiliation")}
      type="text"
      placeholder="คณะ / สถาบัน / หน่วยงาน"
      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
    />
    {errors.affiliation && (
      <p className="text-xs text-red-500 mt-1">{errors.affiliation.message}</p>
    )}
  </div>

  {/* ภาควิชา */}
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      ภาควิชา
    </label>
    <input
      {...register("department")}
      type="text"
      placeholder="ภาควิชา..."
      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
    />
    {errors.department && (
      <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>
    )}
  </div>
</div>

{/* เพิ่มส่วนการลงนามสัญญา */}
<div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
  <label className="block text-sm font-semibold text-slate-800 mb-1">
    การลงนามสัญญา
  </label>
  <p className="text-xs text-slate-600 mb-3">
    กำหนดการลงนามสัญญา: <span className="font-medium text-slate-900">วันที่ 3 พฤศจิกายน 2569 เวลา 10.00 - 12.00 น. ณ ห้อง TWP-601</span>
  </p>
  
  <div className="space-y-2">
    <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
      <input
        {...register("attendanceType")}
        type="radio"
        value="self"
        className="text-slate-900 focus:ring-slate-900"
      />
      <span>มาลงนามด้วยตนเอง</span>
    </label>

    <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
      <input
        {...register("attendanceType")}
        type="radio"
        value="representative"
        className="text-slate-900 focus:ring-slate-900"
      />
      <span>มอบอำนาจให้ตัวแทนมาเข้าร่วมรับฟัง</span>
    </label>
  </div>

  {errors.attendanceType && (
    <p className="text-xs text-red-500 mt-2">{errors.attendanceType.message}</p>
  )}
</div>

{/* เพิ่มส่วนนี้: แสดงช่องกรอกชื่อเฉพาะตอนเลือกมอบอำนาจ */}
{attendanceType === "representative" && (
  <div className="mt-3 pt-3 border-t border-slate-200">
    <label className="block text-sm font-medium text-slate-700 mb-1">
      ชื่อ-นามสกุล ผู้รับมอบอำนาจ มาเข้าร่วมรับฟังแต่ไม่มีอำนาจในการลงนามสัญญา <span className="text-red-500">*</span>
    </label>
    <input
      {...register("representativeName")}
      type="text"
      placeholder="ระบุชื่อ-นามสกุล ผู้รับมอบอำนาจ"
      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
    />
    {errors.representativeName && (
      <p className="text-xs text-red-500 mt-1">{errors.representativeName.message}</p>
    )}
  </div>
)}

          {/* แนบไฟล์ สำเนาบัตรประชาชน */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              แนบสำเนาบัตรประชาชน (PDF หรือ รูปภาพ ไม่เกิน 5MB)
            </label>
            <input
              {...register("idCard")}
              type="file"
              accept="image/*,application/pdf"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            {errors.idCard && (
              <p className="text-xs text-red-500 mt-1">
                {errors.idCard.message as string}
              </p>
            )}
          </div>

          {/* แนบไฟล์ รูปภาพโปสเตอร์ */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              แนบรูปภาพสำหรับการทำโปสเตอร์แสดงความยินดี (PNG, JPG ไม่เกิน 5MB)
            </label>
            <input
              {...register("poster")}
              type="file"
              accept="image/*"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            {errors.poster && (
              <p className="text-xs text-red-500 mt-1">
                {errors.poster.message as string}
              </p>
            )}
          </div>

          {/* รูปภาพประกาศ PDPA */}
          <div className="pt-4 border-t border-slate-200">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
              <Image
                src="/pdpa-notice.jpg"
                alt="ประกาศนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)"
                width={800}
                height={600}
                className="w-full h-auto object-contain rounded-md"
              />
            </div>
          </div>

          {/* ยินยอม PDPA */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register("pdpaConsent")}
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                ข้าพเจ้ายินยอมให้เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลเพื่อการประมวลผลคำขอลงทะเบียนผลงานวิจัยตามนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
              </span>
            </label>
            {errors.pdpaConsent && (
              <p className="text-xs text-red-500 mt-1">{errors.pdpaConsent.message}</p>
            )}
          </div>

          {/* ปุ่มส่งฟอร์ม */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "กำลังส่งข้อมูล..." : "ส่งข้อมูลทำสัญญา"}
          </button>
        </form>
      </div>
    </main>
  );
}