"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useVerifyPaymentMutation } from "@/lib/store/features/donation/donationApi";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getSafeApiErrorMessage } from "@/lib/api-error";

function CallbackContent() {
  const searchParams = useSearchParams();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [status, setStatus] = useState<"loading" | "success" | "cancelled" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const orderCode = searchParams.get("orderCode");
    const cancel = searchParams.get("cancel");

    if (!orderCode) {
      setStatus("error");
      setErrorMessage("Không tìm thấy mã giao dịch");
      return;
    }

    if (cancel === "true") {
      setStatus("cancelled");
      return;
    }

    const verify = async () => {
      try {
        await verifyPayment(Number(orderCode)).unwrap();
        setStatus("success");
      } catch (err: unknown) {
        const message = getSafeApiErrorMessage(err, "Không thể xác nhận giao dịch");
        setStatus("error");
        setErrorMessage(message);
        toast.error(message);
      }
    };

    verify();
  }, [searchParams, verifyPayment]);

  return (
    <div className="glass-card rounded-3xl p-8 md:p-10 max-w-md w-full text-center border border-black/5 shadow-xl">
      {/* Loading */}
      {status === "loading" && (
        <div className="py-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-rose-500/10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
          </div>
          <h2 className="text-xl font-black text-black mb-2">Đang xác nhận thanh toán...</h2>
          <p className="text-sm text-black/50">Vui lòng đợi trong giây lát</p>
        </div>
      )}

      {/* Success */}
      {status === "success" && (
        <div className="py-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-xl font-black text-black mb-2">Quyên góp thành công! 🎉</h2>
          <p className="text-sm text-black/50 mb-8">
            Cảm ơn tấm lòng vàng của bạn! Lời nhắn của bạn đã được gửi tới chiến dịch.
          </p>
          <div className="space-y-3">
            <Link href="/campaigns" className="block">
              <button className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 transition-all">
                <Heart className="w-4 h-4 inline-block mr-2 fill-white/80" />
                Khám phá thêm chiến dịch
              </button>
            </Link>
            <Link href="/profile" className="block">
              <button className="w-full py-3 rounded-xl text-sm font-semibold border border-black/10 text-black/50 hover:text-black/70 hover:border-black/20 transition-colors">
                Về trang cá nhân
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Cancelled */}
      {status === "cancelled" && (
        <div className="py-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-black/5 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-black/25" />
          </div>
          <h2 className="text-xl font-black text-black mb-2">Đã hủy thanh toán</h2>
          <p className="text-sm text-black/50 mb-8">
            Bạn đã hủy quá trình thanh toán. Số tiền chưa bị trừ.
          </p>
          <Link href="/campaigns" className="block">
            <button className="w-full py-3 rounded-xl text-sm font-semibold border border-black/10 text-black/50 hover:text-black/70 hover:border-black/20 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          </Link>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="py-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-rose-500/10 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-xl font-black text-black mb-2">Có lỗi xảy ra</h2>
          <p className="text-sm text-black/50 mb-8">
            {errorMessage || "Không thể xác nhận giao dịch. Vui lòng liên hệ hỗ trợ."}
          </p>
          <Link href="/campaigns" className="block">
            <button className="w-full py-3 rounded-xl text-sm font-semibold border border-black/10 text-black/50 hover:text-black/70 hover:border-black/20 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách chiến dịch
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function DonationCallbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-violet-50/30 flex flex-col items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <p className="text-sm text-black/40">Đang tải...</p>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
