"use client";
import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Users, Clock, Share2, Shield } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Magnetic } from "@/components/ui/magnetic";
import { HighlightText } from "@/components/ui/highlight-text";
import { CircularCounter, StatCounter } from "@/components/ui/number-counter";
import { AnimatedBeam, BeamContainer, BeamNode } from "@/components/ui/animated-beam";

const campaign = {
  id: "2",
  title: "Phẫu Thuật Tim Miễn Phí Cho Trẻ Em",
  description:
    "Hàng nghìn trẻ em Việt Nam mắc bệnh tim bẩm sinh nhưng không có điều kiện phẫu thuật. Chi phí một ca phẫu thuật tim dao động từ 80–150 triệu đồng, vượt xa khả năng của nhiều gia đình. Chiến dịch này hướng đến hỗ trợ 50 ca phẫu thuật tim miễn phí cho trẻ em có hoàn cảnh khó khăn trên cả nước.",
  category: "Y Tế",
  raised: 2500000,
  goal: 3600000,
  donors: 3890,
  daysLeft: 8,
  emoji: "❤️‍🩹",
  gradient: "from-rose-600 to-pink-800",
  organizer: "Quỹ Trái Tim Việt Nam",
  updates: [
    { date: "01/03/2025", text: "Hoàn thành ca phẫu thuật thứ 30 thành công tại BV Nhi TW." },
    { date: "15/02/2025", text: "Đạt mốc 300 triệu đồng. Cảm ơn 2,500 nhà hảo tâm!" },
    { date: "01/02/2025", text: "Khởi động chiến dịch. Mục tiêu 50 ca phẫu thuật." },
  ],
};

export default function CampaignDetailPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const donorRef = useRef<HTMLDivElement>(null);
  const escrowRef = useRef<HTMLDivElement>(null);
  const hospitalRef = useRef<HTMLDivElement>(null);
  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);

  const [isClosed, setIsClosed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const deadlineReached = campaign.daysLeft <= 0;
  const canClose = progress >= 50 || deadlineReached;

  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<
      "idle" | "pending" | "completed" | "rejected"
  >("idle");

  const [editingBank, setEditingBank] = useState(false);
  const [bankName, setBankName] = useState("Example Bank");
  const [accountNumber, setAccountNumber] = useState("123456789");
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  const availableBalance = campaign.raised;

  const bankAccount = "Example Bank - " + accountNumber;
  const ekycStatus = true;

  const maskAccount = (acc: string) => {
    return "****" + acc.slice(-4);
  };

  useEffect(() => {
    if (progress >= 100) {
      setIsClosed(true);
    }
  }, [progress]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover */}
            <div
              className={`h-72 md:h-96 bg-gradient-to-br ${campaign.gradient} rounded-3xl flex items-center justify-center relative overflow-hidden`}
            >
              <span className="text-8xl z-10">{campaign.emoji}</span>
              <div className="absolute inset-0 bg-black/20" />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full glass text-sm font-medium text-black">
                {campaign.category}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-black mb-2">
                <HighlightText variant="underline" color="primary">
                  {campaign.title}
                </HighlightText>
              </h1>
              <p className="text-black/50 text-sm">
                Bởi <span className="text-black font-medium">{campaign.organizer}</span>
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 mt-2">
              <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                      isClosed ? "bg-gray-200 text-gray-600" : "bg-emerald-100 text-emerald-600"
                  }`}
              >
                {isClosed ? "Closed" : "Running"}
              </span>
            </div>

            {/* Description */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-black mb-3">Về Chiến Dịch</h2>
              <p className="text-black/70 leading-relaxed">{campaign.description}</p>
            </div>

            {/* Fund Flow (AnimatedBeam) */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-black mb-6">Luồng Tiền Minh Bạch</h2>
              <BeamContainer ref={containerRef} className="flex items-center justify-around py-8">
                <div className="flex flex-col items-center gap-2">
                  <BeamNode ref={donorRef} className="w-16 h-16 rounded-xl">
                    <span className="text-2xl">👤</span>
                  </BeamNode>
                  <span className="text-xs text-black/50">Bạn</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <BeamNode ref={escrowRef} className="w-16 h-16 rounded-xl">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </BeamNode>
                  <span className="text-xs text-black/50">Escrow An Toàn</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <BeamNode ref={hospitalRef} className="w-16 h-16 rounded-xl">
                    <span className="text-2xl">🏥</span>
                  </BeamNode>
                  <span className="text-xs text-black/50">Bệnh Viện</span>
                </div>
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={donorRef}
                  toRef={escrowRef}
                  gradientStartColor="#f43f5e"
                  gradientStopColor="#8b5cf6"
                  duration={2}
                />
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={escrowRef}
                  toRef={hospitalRef}
                  gradientStartColor="#8b5cf6"
                  gradientStopColor="#22c55e"
                  duration={2}
                  delay={0.8}
                />
              </BeamContainer>
            </div>

            {/* Updates */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-black mb-4">Cập Nhật Chiến Dịch</h2>
              <div className="space-y-4">
                {campaign.updates.map((update, i) => (
                  <div
                    key={i}
                    className="flex gap-4 pb-4 border-b border-black/10 last:border-0 last:pb-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs text-black/40 mb-1">{update.date}</p>
                      <p className="text-sm text-black/70">{update.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Donate Card */}
            <div className="glass-card rounded-2xl p-6 sticky top-24">
              {/* Progress */}
              <div className="flex items-center justify-center mb-6">
                <CircularCounter
                  value={progress}
                  size={140}
                  color="#f43f5e"
                  trackColor="rgba(255,255,255,0.1)"
                  duration={2}
                />
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl font-black text-black mb-1">{campaign.raised.toLocaleString('vi-VN')} vnđ</div>
                <div className="text-sm text-black/50">
                  đã quyên góp trong tổng số {campaign.goal.toLocaleString('vi-VN')} vnđ
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="glass rounded-xl p-3 text-center">
                  <Users className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                  <StatCounter value={campaign.donors} label="Nhà hỗ trợ" className="text-sm" />
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="font-bold text-2xl text-black">{campaign.daysLeft}</div>
                  <p className="text-xs text-black/50">Ngày còn lại</p>
                </div>
              </div>

              {!isClosed && (
                  <div
                      title={
                        !canClose
                            ? "Bạn chỉ có thể đóng chiến dịch khi đạt tối thiểu 50% mục tiêu hoặc khi hết thời hạn."
                            : ""
                      }
                  >
                    <button
                        disabled={!canClose}
                        onClick={() => canClose && setShowConfirm(true)}
                        className={`w-full mb-6 py-2.5 rounded-lg text-sm font-semibold transition-colors
      ${
                            canClose
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      Kết Thúc Gây Quỹ
                    </button>
                  </div>
              )}

              {isClosed && withdrawStatus === "idle" && (
                  <button
                      onClick={() => setShowWithdrawForm(true)}
                      className="w-full mb-6 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                  >
                    Yêu Cầu Rút Tiền
                  </button>
              )}

              {/* Donate amounts */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[50, 100, 200, 500, 1000, "Tùy chọn"].map((amount) => (
                  <button
                    key={amount}
                    className="py-2 px-2 rounded-lg glass border border-black/10 text-xs font-medium text-black hover:border-rose-500/50 hover:bg-rose-500/10 transition-colors"
                  >
                    {typeof amount === "number" ? `₫${amount}k` : amount}
                  </button>
                ))}
              </div>

              <Magnetic intensity={0.3} range={60}>
                <RainbowButton
                  colors={["#f43f5e", "#8b5cf6", "#3b82f6", "#f43f5e"]}
                  duration={2}
                  borderWidth={2}
                  className="w-full text-sm"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  Quyên Góp Ngay
                </RainbowButton>
              </Magnetic>

              <button className="w-full mt-3 py-2.5 rounded-lg glass border border-black/10 text-sm text-black/60 hover:text-black hover:bg-black/10 transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Chia Sẻ Chiến Dịch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-6 w-[400px] max-w-[90%]">
              <h3 className="text-lg font-bold mb-3">
                Xác nhận kết thúc chiến dịch?
              </h3>

              <p className="text-sm text-black/70 mb-4">
                Bạn có chắc chắn muốn đóng chiến dịch này không?
                Hành động này không thể hoàn tác. Người dùng sẽ không thể quyên góp thêm.
              </p>

              <div className="text-sm mb-6">
                <strong>Số tiền hiện tại:</strong>{" "}
                {campaign.raised.toLocaleString('vi-VN')} vnđ ({Math.round(progress)}%)
              </div>

              <div className="flex justify-end gap-3">
                <button
                    onClick={() => setShowConfirm(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700"
                >
                  Hủy bỏ
                </button>

                <button
                    onClick={() => {
                      setIsClosed(true);
                      setShowConfirm(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Đồng ý đóng
                </button>
              </div>
            </div>
          </div>
      )}

      {/* Withdraw Form Modal */}
      {showWithdrawForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-6 w-[420px] max-w-[90%]">
              <h2 className="font-bold text-black mb-4">Yêu Cầu Rút Tiền</h2>

              {/* Balance */}
              <div className="mb-4">
                <p className="text-xs text-black/50">Số tiền hiện tại</p>
                <p className="font-semibold text-lg">{availableBalance.toLocaleString('vi-VN')} vnđ</p>
              </div>

              {/* Bank */}
              <div className="mb-4">
                <p className="text-xs text-black/50">Số tài khoản</p>

                {!editingBank ? (
                    <>
                      <p className="font-medium">
                        {bankName} - {maskAccount(accountNumber)}
                      </p>

                      <button
                          onClick={() => setEditingBank(true)}
                          className="text-xs text-blue-500 mt-1"
                      >
                        Cập nhật lại thông tin ngân hàng
                      </button>
                    </>
                ) : (
                    <div className="space-y-2 mt-2">
                      <input
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="Bank Name"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                      />

                      <input
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Account Number"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                      />

                      <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setEditingBank(false)}
                            className="px-3 py-1 text-sm bg-gray-200 rounded"
                        >
                          Huỷ
                        </button>

                        <button
                            onClick={() => setEditingBank(false)}
                            className="px-3 py-1 text-sm bg-emerald-500 text-white rounded"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                )}
              </div>

            {/* KYC */}
            <div className="mb-6">
              <p className="text-xs text-black/50">Xác minh của eKYC</p>
              <span
                  className={`px-2 py-1 text-xs rounded ${
                      ekycStatus
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-red-100 text-red-600"
                  }`}
              >
                {ekycStatus ? "Đã xác minh" : "Chưa xác minh"}
              </span>
            </div>

            <div
                title={
                  !ekycStatus
                      ? "Bạn cần hoàn tất eKYC trước khi gửi yêu cầu rút tiền."
                      : ""
                }
                className="justify-end flex"
            >
              <button
                  disabled={!ekycStatus}
                  onClick={() => setShowWithdrawConfirm(true)}
                  className={`px-4 py-2 rounded-lg transition-colors
                      ${
                      ekycStatus
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                Gửi yêu cầu rút tiền
              </button>
            </div>
          </div>
        </div>
      )}

      {withdrawStatus === "pending" && (
          <div className="glass rounded-xl p-4 text-center mb-4">
            <p className="font-semibold text-amber-600">
              Withdraw Pending Review
            </p>
            <p className="text-xs text-black/50 mt-1">
              Yêu cầu rút tiền đang chờ Admin kiểm duyệt
            </p>
          </div>
      )}

      {showWithdrawConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-6 w-[400px] max-w-[90%]">
              <h3 className="text-lg font-bold mb-3">
                Xác nhận yêu cầu rút tiền
              </h3>

              <p className="text-sm text-black/70 mb-4">
                Bạn xác nhận rút:
              </p>

              <div className="text-sm mb-6 space-y-1">
                <p>
                  <strong>Số tiền:</strong>{" "}
                  {availableBalance.toLocaleString("vi-VN")} vnđ
                </p>
                <p>
                  <strong>Ngân hàng:</strong> {bankAccount}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                    onClick={() => setShowWithdrawConfirm(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700"
                >
                  Huỷ
                </button>

                <button
                    onClick={() => {
                      setWithdrawStatus("pending");
                      setShowWithdrawConfirm(false);
                      setShowWithdrawForm(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  Xác nhận rút
                </button>
              </div>
            </div>
          </div>
      )}

    </div>

  );
}
