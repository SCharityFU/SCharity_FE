'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Landmark, CreditCard, User, Search, ChevronDown, Loader2 } from 'lucide-react';
import type { CampaignRequestResponseDto } from '@/dtos/campaign';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useGetMyRequestsQuery, useUpdateRequestBankInfoMutation } from '@/lib/store/features/campaign/campaignApi';
import { useVietQRBanks } from '@/hooks/useVietQRBanks';
import { MyRequestsHeader } from '@/components/dashboard/my-requests/MyRequestsHeader';
import { MyRequestsEmptyState, MyRequestsLoadingGrid } from '@/components/dashboard/my-requests/MyRequestsStates';
import { MyRequestsGrid } from '@/components/dashboard/my-requests/MyRequestsGrid';
import { RequestDetailModal } from '@/components/dashboard/my-requests/RequestDetailModal';

function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll('đ', 'd')
    .replaceAll('Đ', 'D')
    .toUpperCase();
}

/* ═══════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════ */

export default function MyRequestsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isFetching } = useGetMyRequestsQuery({ page, limit });

  const requests = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  /* Detail modal */
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<CampaignRequestResponseDto | null>(null);

  /* Bank modal */
  const [bankOpen, setBankOpen] = useState(false);
  const [bankReq, setBankReq] = useState<CampaignRequestResponseDto | null>(null);

  const openDetail = (req: CampaignRequestResponseDto) => {
    setSelectedReq(req);
    setDetailOpen(true);
  };

  const openBankModal = (req: CampaignRequestResponseDto) => {
    setBankReq(req);
    setBankOpen(true);
  };

  /* Which request is "active" (has a modal open) — for border highlight */
  const activeReqId = detailOpen ? (selectedReq?.id ?? null) : bankOpen ? (bankReq?.id ?? null) : null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <MyRequestsHeader onBackToDashboard={() => router.push('/dashboard')} />

        {/* Loading skeleton */}
        {isLoading && <MyRequestsLoadingGrid />}

        {/* Empty */}
        {!isLoading && requests.length === 0 && <MyRequestsEmptyState />}

        {/* Request Cards — Portrait Grid */}
        {!isLoading && requests.length > 0 && (
          <MyRequestsGrid
            requests={requests}
            activeReqId={activeReqId}
            page={page}
            totalPages={totalPages}
            isFetching={isFetching}
            onOpenDetail={openDetail}
            onOpenBankModal={openBankModal}
            onPageChange={setPage}
          />
        )}
      </div>

      <RequestDetailModal open={detailOpen} onOpenChange={setDetailOpen} request={selectedReq} />

      {/* ── Bank Edit Modal ──────────────────────────────────────── */}
      <BankEditModal open={bankOpen} onOpenChange={setBankOpen} request={bankReq} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Bank Edit Modal
   ═══════════════════════════════════════════════════════════════════════ */

function BankEditModal({
  open,
  onOpenChange,
  request,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  request: CampaignRequestResponseDto | null;
}) {
  const [updateBankInfo, { isLoading }] = useUpdateRequestBankInfoMutation();

  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

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

  useEffect(() => {
    if (!open || !request?.bankInfo) return;
    const { bankName, accountNumber: acNum, accountHolderName: acHolder } = request.bankInfo;
    setAccountNumber(acNum ?? '');
    setAccountHolderName(acHolder ?? '');
    setFeedback(null);
    setShowConfirm(false);
    if (bankList.length > 0) {
      const match = bankList.find(
        (b) => b.shortName.toLowerCase() === bankName.toLowerCase() || b.name.toLowerCase() === bankName.toLowerCase(),
      );
      if (match) setSelectedBank(match);
    }
  }, [open, request, bankList, setSelectedBank]);

  const handleAccountNumber = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountNumber(e.target.value.replaceAll(/\D/g, ''));
  }, []);

  const handleAccountHolderName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountHolderName(removeDiacritics(e.target.value));
  }, []);

  const isFormValid = selectedBank && accountNumber.length >= 6 && accountHolderName.length >= 2;

  const handleSubmit = async () => {
    if (!selectedBank || !isFormValid || !request) return;
    try {
      await updateBankInfo({
        requestId: request.id,
        bankInfo: {
          bankName: selectedBank.shortName,
          accountNumber,
          accountHolderName,
        },
      }).unwrap();
      setShowConfirm(false);
      setFeedback({ type: 'success', text: 'Cập nhật thông tin ngân hàng thành công!' });
      setTimeout(() => onOpenChange(false), 1500);
    } catch (err: unknown) {
      setShowConfirm(false);
      const msg = (err as { data?: { message?: string } })?.data?.message || 'Có lỗi xảy ra.';
      setFeedback({ type: 'error', text: msg });
    }
  };

  if (!request) return null;

  return (
    <>
      <Dialog open={open && !showConfirm} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Landmark className="w-5 h-5 text-violet-400" />
              Sửa Thông Tin Ngân Hàng
            </DialogTitle>
            <DialogDescription>
              Cập nhật tài khoản ngân hàng cho yêu cầu &ldquo;{request.title}&rdquo;
            </DialogDescription>
          </DialogHeader>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl border text-sm font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
              }`}
            >
              {feedback.text}
            </motion.div>
          )}

          <div className="space-y-5">
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
                        <p className="text-sm font-semibold text-black">{selectedBank.shortName}</p>
                        <p className="text-xs text-black/40">{selectedBank.name}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-black/40 text-sm">-- Chọn ngân hàng --</span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-black/30 transition-transform ${bankDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {bankDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl border border-black/10 shadow-2xl max-h-72 overflow-hidden"
                  >
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
                    <div className="max-h-56 overflow-y-auto">
                      {filteredBanks.length === 0 ? (
                        <p className="text-center text-black/30 text-sm py-6">Không tìm thấy</p>
                      ) : (
                        filteredBanks.map((bank) => (
                          <button
                            type="button"
                            key={bank.id}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-black/5 transition-colors w-full text-left ${selectedBank?.id === bank.id ? 'bg-rose-500/5' : ''}`}
                            onClick={() => selectBank(bank)}
                          >
                            <img src={bank.logo} alt={bank.shortName} className="w-8 h-8 object-contain rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-black truncate">{bank.shortName}</p>
                              <p className="text-xs text-black/40 truncate">{bank.name}</p>
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
                placeholder="Nhập số tài khoản"
                className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white/50 text-black outline-none focus:border-rose-400 transition-colors placeholder:text-black/30 text-sm tracking-wider font-mono"
                maxLength={20}
              />
              <p className="text-xs text-black/30 mt-1">Chỉ được nhập số</p>
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
              <p className="text-xs text-black/30 mt-1">Tự động viết hoa, không dấu (theo chuẩn ngân hàng)</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Đóng
            </Button>
            <Button onClick={() => setShowConfirm(true)} disabled={!isFormValid || isLoading}>
              <CheckCircle2 className="w-4 h-4" />
              Xác Nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation sub-dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Xác nhận thông tin ngân hàng</DialogTitle>
            <DialogDescription>Vui lòng kiểm tra kỹ thông tin trước khi lưu</DialogDescription>
          </DialogHeader>
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
                <p className="font-bold text-black">{selectedBank?.shortName ?? '—'}</p>
              </div>
            </div>
            <div className="border-t border-black/10 pt-3">
              <p className="text-xs text-black/40">Số tài khoản</p>
              <p className="font-bold text-black font-mono tracking-wider text-lg">{accountNumber}</p>
            </div>
            <div className="border-t border-black/10 pt-3">
              <p className="text-xs text-black/40">Tên chủ tài khoản</p>
              <p className="font-bold text-black tracking-wider">{accountHolderName}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isLoading}>
              Kiểm tra lại
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Xác Nhận Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
