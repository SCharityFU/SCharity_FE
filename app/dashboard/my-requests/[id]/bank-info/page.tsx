"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "motion/react";
import {
    ArrowLeft,
    Landmark,
    CreditCard,
    User,
    Search,
    ChevronDown,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { HighlightText } from "@/components/ui/highlight-text";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { useVietQRBanks } from "@/hooks/useVietQRBanks";
import {
    useGetMyRequestByIdQuery,
    useUpdateRequestBankInfoMutation,
} from "@/lib/store/features/campaign/campaignApi";

/** Remove Vietnamese diacritics → plain uppercase ASCII (bank standard) */
function removeDiacritics(str: string): string {
    return str
        .normalize("NFD")
        .replaceAll(/[\u0300-\u036f]/g, "")
        .replaceAll("đ", "d")
        .replaceAll("Đ", "D")
        .toUpperCase();
}

export default function UpdateBankInfoPage() {
    const router = useRouter();
    const params = useParams();
    const requestId = params.id as string;

    const [updateBankInfo, { isLoading }] = useUpdateRequestBankInfoMutation();

    // Fetch existing request data for pre-fill
    const { data: requestData, isLoading: isLoadingRequest } = useGetMyRequestByIdQuery(requestId);

    // Bank info form state
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolderName, setAccountHolderName] = useState("");
    const [prefilled, setPrefilled] = useState(false);

    // Confirmation dialog
    const [showConfirm, setShowConfirm] = useState(false);

    // Feedback message
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // VietQR bank list hook
    const {
        bankList,
        bankSearch,
        setBankSearch,
        bankDropdownOpen,
        setBankDropdownOpen,
        selectedBank,
        setSelectedBank,
        bankDropdownRef,
        filteredBanks,
        selectBank,
    } = useVietQRBanks();

    // Pre-fill form when request data and bank list are loaded
    useEffect(() => {
        if (prefilled || !requestData?.data?.bankInfo || bankList.length === 0) return;

        const { bankName, accountNumber: existingAccNum, accountHolderName: existingHolder } =
            requestData.data.bankInfo;

        // Match bank by shortName or name
        const matchedBank = bankList.find(
            (b) =>
                b.shortName.toLowerCase() === bankName.toLowerCase() ||
                b.name.toLowerCase() === bankName.toLowerCase(),
        );
        if (matchedBank) {
            setSelectedBank(matchedBank);
        }

        if (existingAccNum) setAccountNumber(existingAccNum);
        if (existingHolder) setAccountHolderName(existingHolder);

        setPrefilled(true);
    }, [requestData, bankList, prefilled, setSelectedBank]);

    // Handle account number — only digits allowed
    const handleAccountNumber = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replaceAll(/\D/g, "");
        setAccountNumber(raw);
    }, []);

    // Handle account holder name — uppercase, no diacritics
    const handleAccountHolderName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setAccountHolderName(removeDiacritics(e.target.value));
    }, []);

    // Validation
    const isFormValid = selectedBank && accountNumber.length >= 6 && accountHolderName.length >= 2;

    // Open confirmation
    const handleConfirmOpen = () => {
        if (!isFormValid) return;
        setShowConfirm(true);
    };

    // Submit update
    const handleSubmit = async () => {
        if (!selectedBank || !isFormValid) return;

        try {
            await updateBankInfo({
                requestId,
                bankInfo: {
                    bankName: selectedBank.shortName,
                    accountNumber,
                    accountHolderName,
                },
            }).unwrap();

            setShowConfirm(false);
            setFeedback({ type: "success", text: "Cập nhật thông tin ngân hàng thành công!" });

            // Redirect after success
            setTimeout(() => router.push("/dashboard/my-requests"), 1500);
        } catch (err: any) {
            setShowConfirm(false);
            const msg = err?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
            setFeedback({ type: "error", text: msg });
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <button
                        onClick={() => router.push("/dashboard/my-requests")}
                        className="flex items-center gap-1 text-sm text-black/40 hover:text-black/70 transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Quay lại yêu cầu
                    </button>
                    <h1 className="text-3xl font-black text-black">
                        <HighlightText variant="underline" color="primary">
                            Cập Nhật Thông Tin Ngân Hàng
                        </HighlightText>
                    </h1>
                    <p className="text-black/50 text-sm mt-2">
                        Chỉnh sửa thông tin tài khoản ngân hàng cho yêu cầu chiến dịch
                    </p>
                </div>

                {/* Loading state */}
                {isLoadingRequest ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-black/30" />
                        <p className="text-sm text-black/40">Đang tải thông tin...</p>
                    </div>
                ) : (
                <>

                {/* Feedback */}
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl border ${
                            feedback.type === "success"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                        }`}
                    >
                        <p className="text-sm font-medium">{feedback.text}</p>
                    </motion.div>
                )}

                {/* Form */}
                <div className="glass-card rounded-2xl p-8 space-y-6">
                    {/* Bank Dropdown */}
                    <div>
                        <Label className="text-sm font-semibold text-black/70 mb-2 flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-black/40" />
                            Chọn Ngân Hàng
                        </Label>
                        <div ref={bankDropdownRef} className="relative">
                            <button
                                type="button"
                                className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white/50 cursor-pointer flex items-center justify-between hover:border-black/20 transition-colors text-left"
                                onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                            >
                                {selectedBank ? (
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={selectedBank.logo}
                                            alt={selectedBank.shortName}
                                            className="w-8 h-8 object-contain rounded"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-black">
                                                {selectedBank.shortName}
                                            </p>
                                            <p className="text-xs text-black/40">{selectedBank.name}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-black/40 text-sm">-- Chọn ngân hàng --</span>
                                )}
                                <ChevronDown
                                    className={`w-4 h-4 text-black/30 transition-transform ${
                                        bankDropdownOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {bankDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl border border-black/10 shadow-2xl max-h-72 overflow-hidden"
                                >
                                    {/* Search */}
                                    <div className="p-3 border-b border-black/5">
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/5">
                                            <Search className="w-4 h-4 text-black/30" />
                                            <input
                                                type="text"
                                                value={bankSearch}
                                                onChange={(e) => setBankSearch(e.target.value)}
                                                placeholder="Tìm ngân hàng..."
                                                className="bg-transparent outline-none text-sm flex-1 text-black placeholder:text-black/30"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    {/* List */}
                                    <div className="max-h-56 overflow-y-auto">
                                        {filteredBanks.length === 0 ? (
                                            <p className="text-center text-black/30 text-sm py-6">
                                                Không tìm thấy ngân hàng
                                            </p>
                                        ) : (
                                            filteredBanks.map((bank) => (
                                                <button
                                                    type="button"
                                                    key={bank.id}
                                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-black/5 transition-colors w-full text-left ${
                                                        selectedBank?.id === bank.id ? "bg-rose-500/5" : ""
                                                    }`}
                                                    onClick={() => selectBank(bank)}
                                                >
                                                    <img
                                                        src={bank.logo}
                                                        alt={bank.shortName}
                                                        className="w-8 h-8 object-contain rounded"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-black truncate">
                                                            {bank.shortName}
                                                        </p>
                                                        <p className="text-xs text-black/40 truncate">
                                                            {bank.name}
                                                        </p>
                                                    </div>
                                                    {selectedBank?.id === bank.id && (
                                                        <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Account Number */}
                    <div>
                        <Label className="text-sm font-semibold text-black/70 mb-2 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-black/40" />
                            Số Tài Khoản
                        </Label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={accountNumber}
                            onChange={handleAccountNumber}
                            placeholder="Nhập số tài khoản ngân hàng"
                            className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white/50 text-black outline-none focus:border-rose-400 transition-colors placeholder:text-black/30 text-sm tracking-wider font-mono"
                            maxLength={20}
                        />
                        <p className="text-xs text-black/30 mt-1.5">Chỉ được nhập số</p>
                    </div>

                    {/* Account Holder Name */}
                    <div>
                        <Label className="text-sm font-semibold text-black/70 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-black/40" />
                            Tên Chủ Tài Khoản
                        </Label>
                        <input
                            type="text"
                            value={accountHolderName}
                            onChange={handleAccountHolderName}
                            placeholder="VD: NGUYEN VAN A"
                            className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white/50 text-black outline-none focus:border-rose-400 transition-colors placeholder:text-black/30 text-sm uppercase tracking-wider font-mono"
                        />
                        <p className="text-xs text-black/30 mt-1.5">
                            Tự động viết hoa, không dấu (theo chuẩn ngân hàng)
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-black/5">
                        <Button
                            onClick={handleConfirmOpen}
                            disabled={!isFormValid || isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4" />
                            )}
                            Xác Nhận Lưu
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard/my-requests")}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                    </div>
                </div>

                {/* Confirmation Dialog */}
                <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Xác nhận thông tin ngân hàng</DialogTitle>
                            <DialogDescription>
                                Vui lòng kiểm tra kỹ thông tin trước khi lưu
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {/* Bank info summary */}
                            <div className="rounded-xl bg-black/5 p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    {selectedBank && (
                                        <img
                                            src={selectedBank.logo}
                                            alt={selectedBank.shortName}
                                            className="w-10 h-10 object-contain rounded"
                                        />
                                    )}
                                    <div>
                                        <p className="text-xs text-black/40">Ngân hàng</p>
                                        <p className="font-bold text-black">
                                            {selectedBank?.shortName ?? "—"}
                                        </p>
                                    </div>
                                </div>
                                <div className="border-t border-black/10 pt-3">
                                    <p className="text-xs text-black/40">Số tài khoản</p>
                                    <p className="font-bold text-black font-mono tracking-wider text-lg">
                                        {accountNumber}
                                    </p>
                                </div>
                                <div className="border-t border-black/10 pt-3">
                                    <p className="text-xs text-black/40">Tên chủ tài khoản</p>
                                    <p className="font-bold text-black tracking-wider">
                                        {accountHolderName}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" disabled={isLoading}>
                                    Kiểm tra lại
                                </Button>
                            </DialogClose>
                            <Button onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4" />
                                )}
                                Xác Nhận Lưu
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                </>
                )}
            </div>
        </div>
    );
}
