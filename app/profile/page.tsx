"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetMeQuery, useUpdateProfileMutation } from "@/lib/store/features/user/userApi";
import { useAppDispatch } from "@/lib/store/hooks";
import { setCredentials, logout } from "@/lib/store/features/auth/authSlice";
import { AvatarCropModal } from "@/components/ui/AvatarCropModal";
import { Loader2, Camera, Check, KeyRound, LogOut, User, LayoutDashboard, FileText, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getSafeApiErrorMessage } from "@/lib/api-error";

const DEFAULT_AVATAR =
  "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự").max(100),
  phoneNumber: z
    .string()
    .regex(/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type TabKey = "account" | "password";

// Items that switch local tabs
const tabItems: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "account", label: "Thông Tin Tài Khoản", icon: <User className="w-4 h-4" /> },
  { key: "password", label: "Đổi Mật Khẩu", icon: <KeyRound className="w-4 h-4" /> },
];

// Items that navigate to external pages
const linkItems: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/dashboard/my-requests", label: "Yêu Cầu Của Tôi", icon: <FileText className="w-4 h-4" /> },
  { href: "/dashboard/my-campaigns", label: "Chiến Dịch Của Tôi", icon: <Megaphone className="w-4 h-4" /> },
];

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data, isLoading: isFetching, refetch } = useGetMeQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [activeTab, setActiveTab] = useState<TabKey>("account");

  // Avatar crop state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = data?.data;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", phoneNumber: "" },
  });

  useEffect(() => {
    if (profile) reset({ fullName: profile.fullName || "", phoneNumber: profile.phoneNumber || "" });
  }, [profile, reset]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = () => { setRawImageSrc(reader.result as string); setShowCropModal(true); };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (blob: Blob) => {
    setAvatarBlob(blob);
    setAvatarPreview(URL.createObjectURL(blob));
    setShowCropModal(false);
    setRawImageSrc(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setServerError(null);
    setSuccessMsg(null);
    const formData = new FormData();
    formData.append("fullName", values.fullName);
    if (values.phoneNumber) formData.append("phoneNumber", values.phoneNumber);
    if (avatarBlob) formData.append("avatar", avatarBlob, "avatar.jpg");
    try {
      const res = await updateProfile(formData).unwrap();
      const successMessage = "Cập nhật hồ sơ thành công!";
      setSuccessMsg(successMessage);
      toast.success(successMessage);
      setAvatarBlob(null);
      const token = localStorage.getItem("access_token") || "";
      if (res.data) {
        dispatch(setCredentials({
          user: { id: res.data.id, email: res.data.email, fullName: res.data.fullName, avatarUrl: res.data.avatarUrl, role: res.data.role },
          token,
        }));
      }
      refetch();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const message = getSafeApiErrorMessage(err, "Cập nhật thất bại. Vui lòng thử lại.");
      setServerError(message);
      toast.error(message);
    }
  };

  const currentAvatar = avatarPreview || profile?.avatarUrl || DEFAULT_AVATAR;

  return (
    <>
      {showCropModal && rawImageSrc && (
        <AvatarCropModal imageSrc={rawImageSrc} onClose={() => { setShowCropModal(false); setRawImageSrc(null); }} onCropComplete={handleCropComplete} />
      )}

      <div className="min-h-screen bg-zinc-50 font-google-sans pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Page Title */}
          <h1 className="text-2xl font-google-sans-bold text-zinc-900 mb-8">Cài Đặt Tài Khoản</h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* ── Sidebar ── */}
            <aside className="w-full md:w-56 shrink-0">
              {/* Avatar card */}
              <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-5 mb-4 flex flex-col items-center text-center">
                {isFetching ? (
                  <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                  </div>
                ) : (
                  <>
                    <div className="relative w-20 h-20 group cursor-pointer mb-3" onClick={handleAvatarClick}>
                      <img src={currentAvatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md" />
                      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                    <p className="font-google-sans-bold text-zinc-800 text-sm leading-tight">{profile?.fullName}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 break-all">{profile?.email}</p>
                  </>
                )}
              </div>

              {/* Nav */}
              <nav className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
                {/* Tab switches */}
                {tabItems.map((item) => {
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isActive ? "bg-zinc-900 text-white font-google-sans-bold" : "text-zinc-600 hover:bg-zinc-50"}`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
                {/* Divider + external links */}
                <div className="border-t border-zinc-100">
                  {linkItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </div>
                {/* Logout */}
                <div className="border-t border-zinc-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng Xuất
                  </button>
                </div>
              </nav>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 md:p-8">
              {activeTab === "account" && (
                <>
                  <h2 className="text-xl font-google-sans-bold text-zinc-900 mb-6">Thông Tin Tài Khoản</h2>
                  {isFetching ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      {/* Email (readonly) */}
                      <div>
                        <label className="block text-sm font-google-sans-bold text-zinc-700 mb-1.5 uppercase tracking-wide">Email</label>
                        <input
                          type="email"
                          value={profile?.email || ""}
                          readOnly
                          className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm text-zinc-500 bg-zinc-50 cursor-not-allowed"
                        />
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-google-sans-bold text-zinc-700 mb-1.5 uppercase tracking-wide">Họ và Tên</label>
                        <input
                          {...register("fullName")}
                          type="text"
                          className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                          placeholder="Nguyễn Văn A"
                        />
                        {errors.fullName && <p className="text-rose-500 text-xs mt-1">{errors.fullName.message}</p>}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-google-sans-bold text-zinc-700 mb-1.5 uppercase tracking-wide">Số Điện Thoại</label>
                        <input
                          {...register("phoneNumber")}
                          type="tel"
                          className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                          placeholder="0901234567"
                        />
                        {errors.phoneNumber && <p className="text-rose-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
                      </div>

                      {serverError && (
                        <div className="p-3 bg-rose-50 text-rose-600 text-sm border-l-4 border-rose-600 rounded-r-lg">{serverError}</div>
                      )}
                      {successMsg && (
                        <div className="p-3 bg-green-50 text-green-700 text-sm border-l-4 border-green-500 rounded-r-lg flex items-center gap-2">
                          <Check className="w-4 h-4 shrink-0" />{successMsg}
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="bg-zinc-900 text-white px-8 py-3 rounded-lg font-google-sans-bold text-sm hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-zinc-900/10 hover:shadow-rose-600/20"
                        >
                          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                          {isSaving ? "Đang Lưu..." : "Lưu Thay Đổi"}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {activeTab === "password" && (
                <div className="text-center py-16 text-zinc-400">
                  <KeyRound className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-google-sans-bold text-zinc-500">Tính năng đổi mật khẩu</p>
                  <p className="text-sm mt-1">Sẽ được xây dựng sớm</p>
                  <a href="/forgot-password" className="mt-4 inline-block text-sm text-rose-600 hover:underline">
                    Dùng &quot;Quên mật khẩu&quot; → Đặt lại qua email
                  </a>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
