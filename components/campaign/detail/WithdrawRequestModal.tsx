'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  X,
  Loader2,
  AlertTriangle,
  Landmark,
  BadgeCheck,
  CircleDollarSign,
  ExternalLink,
  ChevronDown,
  Pencil,
  Send,
  Search,
} from 'lucide-react';
import {
  useGetMyBankAccountsQuery,
  useCreateWithdrawRequestMutation,
  useRequestBankInfoChangeMutation,
  useGetBankChangeRequestStatusQuery,
  useGetCampaignWithdrawalsQuery,
} from '@/lib/store/features/campaign/campaignApi';
import { useVietQRBanks } from '@/hooks/useVietQRBanks';
import { useGetMeQuery } from '@/lib/store/features/user/userApi';
import type { CampaignDto } from '@/dtos/campaign';
import type { BankAccountResponseDto } from '@/dtos/user';
import { CampaignStatus, WithdrawStatus } from '@/dtos/enums';
import { cn } from '@/lib/utils';
import { formatVND } from '@/lib/money';
import Link from 'next/link';

interface WithdrawRequestModalProps {
  open: boolean;
  onClose: () => void;
  campaign: Pick<CampaignDto, 'id' | 'title' | 'raisedAmount' | 'goalAmount' | 'status' | 'deadline'>;
}

function maskAccountNumber(num: string) {
  if (num.length <= 4) return num;
  return '****' + num.slice(-4);
}

type Step = 'form' | 'confirm' | 'success' | 'error';
const MAX_WITHDRAW_ATTEMPTS = 3;

export function WithdrawRequestModal({ open, onClose, campaign }: WithdrawRequestModalProps) {
  const { data: bankAccounts, isLoading: banksLoading } = useGetMyBankAccountsQuery(undefined, {
    skip: !open,
  });
  const { data: meData } = useGetMeQuery(undefined, { skip: !open });
  const { data: withdrawRequests } = useGetCampaignWithdrawalsQuery(campaign.id, { skip: !open });
  const [createWithdraw, { isLoading: submitting }] = useCreateWithdrawRequestMutation();
  const [requestBankChange, { isLoading: bankChangeSubmitting }] = useRequestBankInfoChangeMutation();

  const [step, setStep] = useState<Step>('form');
  const [selectedBank, setSelectedBank] = useState<BankAccountResponseDto | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showBankList, setShowBankList] = useState(false);

  // ── Bank info edit state ────────────────────────────────────────────────────
  const [editingBankInfo, setEditingBankInfo] = useState(false);
  const [bankChangePending, setBankChangePending] = useState(false);
  const [editBankName, setEditBankName] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editAccountHolder, setEditAccountHolder] = useState('');
  const [bankChangeError, setBankChangeError] = useState<string | null>(null);
  const [bankChangeSuccess, setBankChangeSuccess] = useState(false);

  // ── VietQR & Dropdown state ───────────────────────────────────────────────
  const {
    bankSearch,
    setBankSearch,
    filteredBanks,
    selectedBank: selectedVietQrBank,
    setSelectedBank: setSelectedVietQrBank,
    selectBank: selectVietQrBank,
    bankList,
  } = useVietQRBanks();
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const bankDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) {
        setBankDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultBank = bankAccounts?.find((b) => b.isDefault) ?? bankAccounts?.[0] ?? null;
  const activeBank = selectedBank ?? defaultBank;

  // ── Bank Change Status query ──────────────────────────────────────────────
  const { data: bankChangeStatusData } = useGetBankChangeRequestStatusQuery(activeBank?.id ?? '', {
    skip: !open || !activeBank?.id,
  });

  const bankStatus = bankChangeStatusData?.isBankInfoApproved ?? true;
  const hasPendingRequest = bankChangeStatusData?.latestRequest?.status === 'pending';

  const me = meData?.data;
  const isKycVerified = me?.isKycVerified ?? false;
  const raised = campaign.raisedAmount ?? 0;
  const totalCompletedWithdrawAmount = (withdrawRequests ?? [])
    .filter((item) => item.status === WithdrawStatus.COMPLETED)
    .reduce((sum, item) => {
      const amount = typeof item.amount === 'number' ? item.amount : Number(item.amount);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  const availableToWithdraw = Math.max(0, raised - totalCompletedWithdrawAmount);
  const completedWithdrawCount = (withdrawRequests ?? []).filter(
    (item) => item.status === WithdrawStatus.COMPLETED,
  ).length;
  const hasPendingWithdraw = (withdrawRequests ?? []).some((item) => item.status === WithdrawStatus.PENDING);
  const hasValidGoalAmount = Number(campaign.goalAmount ?? 0) > 0;
  const campaignProgress = hasValidGoalAmount ? raised / Number(campaign.goalAmount) : 0;
  const metProgressThreshold = campaignProgress >= 0.5;
  const canWithdrawByStatus = [CampaignStatus.ACTIVE, CampaignStatus.COMPLETED].includes(campaign.status);
  const maxAllowedAttempts = MAX_WITHDRAW_ATTEMPTS;
  const noWithdrawAttemptsLeft = completedWithdrawCount >= maxAllowedAttempts;
  const remainingWithdrawAttempts = Math.max(0, maxAllowedAttempts - completedWithdrawCount);
  const canProceed = Boolean(
    activeBank &&
    isKycVerified &&
    !bankChangePending &&
    !editingBankInfo &&
    bankStatus &&
    !hasPendingRequest &&
    canWithdrawByStatus &&
    !hasPendingWithdraw &&
    hasValidGoalAmount &&
    metProgressThreshold &&
    !noWithdrawAttemptsLeft &&
    availableToWithdraw > 0,
  );

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Dismiss on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, submitting]);

  // Pick default bank on load
  useEffect(() => {
    if (open) {
      setStep('form');
      setErrorMsg(null);
      setSelectedBank(null);
      setShowBankList(false);
      setEditingBankInfo(false);
      setBankChangePending(false);
      setEditBankName('');
      setEditAccountNumber('');
      setEditAccountHolder('');
      setBankChangeError(null);
      setBankChangeSuccess(false);
    }
  }, [open]);

  const handleProceed = () => {
    if (!activeBank) {
      setErrorMsg('Bạn chưa có tài khoản ngân hàng. Vui lòng thêm tài khoản trước.');
      return;
    }
    if (!isKycVerified) {
      setErrorMsg('Bạn cần xác thực eKYC trước khi rút tiền.');
      return;
    }
    if (!canWithdrawByStatus) {
      setErrorMsg('Chỉ có thể yêu cầu rút tiền từ chiến dịch đang hoạt động hoặc đã hoàn thành.');
      return;
    }
    if (hasPendingWithdraw) {
      setErrorMsg('Đang có một yêu cầu rút tiền đang chờ xử lý cho chiến dịch này.');
      return;
    }
    if (!hasValidGoalAmount) {
      setErrorMsg('Mục tiêu chiến dịch không hợp lệ.');
      return;
    }
    if (!metProgressThreshold) {
      setErrorMsg('Chiến dịch phải đạt ít nhất 50% mục tiêu để có thể rút tiền.');
      return;
    }
    if (noWithdrawAttemptsLeft) {
      setErrorMsg('Đã đạt giới hạn tối đa 3 yêu cầu rút tiền cho chiến dịch này.');
      return;
    }
    if (availableToWithdraw <= 0) {
      setErrorMsg('Không còn số tiền nào để rút từ chiến dịch này.');
      return;
    }
    setErrorMsg(null);
    setStep('confirm');
  };

  const handleSubmit = async () => {
    if (!activeBank) return;
    setErrorMsg(null);
    try {
      await createWithdraw({
        campaignId: campaign.id,
        bankAccountId: activeBank.id,
      }).unwrap();
      setStep('success');
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Không thể gửi yêu cầu rút tiền. Vui lòng thử lại.');
      setStep('error');
    }
  };

  const handleModalClose = () => {
    if (!submitting) {
      setStep('form');
      setErrorMsg(null);
      setSelectedBank(null);
      setShowBankList(false);
      onClose();
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!submitting ? handleModalClose : undefined}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full sm:max-w-md',
          'bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-black/10',
          'flex flex-col overflow-hidden max-h-[88vh] sm:max-h-[78vh]',
          'animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2 fade-in duration-300',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-violet-500" />
            </div>
            <h3 className="text-sm font-bold text-black">
              {step === 'success' ? 'Yêu cầu đã gửi!' : 'Yêu cầu rút tiền'}
            </h3>
          </div>
          <button
            onClick={handleModalClose}
            disabled={submitting}
            className="w-8 h-8 rounded-full bg-gray-100 border border-black/8 flex items-center justify-center text-black/40 hover:text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          {/* ── Step: Form ──────────────────────────────────────────────── */}
          {step === 'form' && (
            <div className="space-y-4">
              {/* Available balance */}
              <div className="bg-gray-50 rounded-xl p-4 border border-black/5">
                <div className="flex items-center gap-2 mb-2">
                  <CircleDollarSign className="w-4 h-4 text-emerald-500" />
                  <p className="text-[11px] text-black/40 font-medium uppercase tracking-wider">Số dư có thể rút</p>
                </div>
                <p className="text-2xl font-black text-black tabular-nums">{formatVND(availableToWithdraw)}</p>
              </div>

              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 space-y-1">
                <p className="text-xs font-semibold text-violet-800">
                  Lượt rút tiền: {Math.min(completedWithdrawCount + 1, maxAllowedAttempts)}/{maxAllowedAttempts}
                </p>
                <p className="text-[11px] text-violet-700">Còn lại: {remainingWithdrawAttempts} lượt.</p>
              </div>

              {/* Bank account */}
              <div>
                <label className="text-xs font-semibold text-black/50 mb-1.5 block">Tài khoản ngân hàng</label>
                {banksLoading ? (
                  <div className="flex items-center gap-2 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-black/30" />
                    <span className="text-xs text-black/40">Đang tải...</span>
                  </div>
                ) : !bankAccounts || bankAccounts.length === 0 ? (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-500/20">
                    <p className="text-xs text-amber-700 mb-2">Bạn chưa có tài khoản ngân hàng nào.</p>
                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700"
                    >
                      Thêm tài khoản <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Currently selected bank */}
                    {activeBank && (
                      <div className="w-full flex items-center gap-3 p-3 rounded-xl border border-violet-500/40 bg-violet-500/5 ring-2 ring-violet-500/20">
                        <Landmark className="w-4 h-4 text-violet-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-black truncate">{activeBank.bankName}</p>
                          <p className="text-[11px] text-black/40">
                            {maskAccountNumber(activeBank.accountNumber)} • {activeBank.accountHolderName}
                          </p>
                        </div>
                        {bankAccounts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setShowBankList(!showBankList)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700 bg-violet-500/10 px-2.5 py-1 rounded-full flex-shrink-0 transition-colors"
                          >
                            Đổi
                            <ChevronDown className={cn('w-3 h-3 transition-transform', showBankList && 'rotate-180')} />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Expandable bank list (only when > 1 bank and toggled open) */}
                    {showBankList && bankAccounts.length > 1 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] text-black/40 font-medium">Chọn tài khoản khác:</p>
                        {bankAccounts
                          .filter((bank) => bank.id !== activeBank?.id)
                          .map((bank) => (
                            <button
                              key={bank.id}
                              type="button"
                              onClick={() => {
                                setSelectedBank(bank);
                                setShowBankList(false);
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl border border-black/8 bg-gray-50 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-left"
                            >
                              <Landmark className="w-4 h-4 text-black/30 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-black truncate">{bank.bankName}</p>
                                <p className="text-[11px] text-black/40">
                                  {maskAccountNumber(bank.accountNumber)} • {bank.accountHolderName}
                                </p>
                              </div>
                              {bank.isDefault && (
                                <span className="text-[10px] font-semibold text-violet-600 bg-violet-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                  Mặc định
                                </span>
                              )}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── "Sai thông tin tài khoản? Sửa thông tin" ──────────────── */}
              {activeBank && !editingBankInfo && !bankChangePending && bankStatus && !hasPendingRequest && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingBankInfo(true);
                    setEditBankName(activeBank.bankName);
                    setEditAccountNumber(activeBank.accountNumber);
                    setEditAccountHolder(activeBank.accountHolderName);
                    setBankChangeError(null);
                    setBankChangeSuccess(false);
                    // Reset vietQR bank search correctly based on active bank
                    const foundBank = bankList?.find(
                      (b) => b.shortName.toLowerCase() === activeBank.bankName.toLowerCase(),
                    );
                    if (foundBank) selectVietQrBank(foundBank);
                    else selectVietQrBank(null);
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Sai thông tin tài khoản? Sửa thông tin
                </button>
              )}

              {/* ── Bank info edit form ───────────────────────────────────── */}
              {editingBankInfo && activeBank && (
                <div className="bg-violet-500/5 rounded-xl p-4 border border-violet-500/20 space-y-3">
                  <p className="text-xs font-bold text-violet-800">Nhập thông tin tài khoản mới</p>
                  <div className="relative" ref={bankDropdownRef}>
                    <label className="text-[11px] font-medium text-black/40 mb-1 block">Tên ngân hàng</label>
                    <button
                      type="button"
                      onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                      className="w-full flex items-center gap-2 py-2 px-3 rounded-lg bg-white border border-black/10 text-xs text-left focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all"
                    >
                      {selectedVietQrBank ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedVietQrBank.logo}
                            alt={selectedVietQrBank.shortName}
                            className="w-5 h-5 object-contain rounded"
                          />
                          <span className="flex-1 truncate text-black">{selectedVietQrBank.shortName}</span>
                        </>
                      ) : editBankName ? (
                        <span className="flex-1 truncate text-black">{editBankName}</span>
                      ) : (
                        <span className="flex-1 text-black/40">Chọn ngân hàng...</span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-black/40 transition-transform ${bankDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {bankDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-black/10 shadow-lg max-h-60 overflow-hidden flex flex-col"
                        >
                          <div className="p-2 border-b border-black/5">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/30" />
                              <input
                                type="text"
                                value={bankSearch}
                                onChange={(e) => setBankSearch(e.target.value)}
                                placeholder="Tìm ngân hàng..."
                                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/[0.03] border-none text-[11px] text-black placeholder-black/30 outline-none"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="overflow-y-auto flex-1">
                            {filteredBanks.map((bank) => (
                              <button
                                key={bank.id}
                                type="button"
                                onClick={() => {
                                  selectVietQrBank(bank);
                                  setEditBankName(bank.shortName);
                                  setBankDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-black/[0.04] transition-colors ${selectedVietQrBank?.id === bank.id ? 'bg-violet-50 text-violet-700' : 'text-black/70'}`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={bank.logo}
                                  alt={bank.shortName}
                                  className="w-6 h-6 object-contain rounded bg-white p-0.5 border border-black/5"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-semibold truncate">{bank.shortName}</p>
                                  <p className="text-[10px] text-black/40 truncate">{bank.name}</p>
                                </div>
                              </button>
                            ))}
                            {filteredBanks.length === 0 && (
                              <p className="text-[11px] text-black/30 text-center py-4">Không tìm thấy</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-black/40 mb-1 block">Số tài khoản</label>
                    <input
                      type="text"
                      value={editAccountNumber}
                      onChange={(e) => setEditAccountNumber(e.target.value)}
                      className="w-full py-2 px-3 rounded-lg bg-white border border-black/10 text-xs text-black focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all"
                      placeholder="VD: 1234567890"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-black/40 mb-1 block">Chủ tài khoản</label>
                    <input
                      type="text"
                      value={editAccountHolder}
                      onChange={(e) => setEditAccountHolder(e.target.value)}
                      className="w-full py-2 px-3 rounded-lg bg-white border border-black/10 text-xs text-black focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all"
                      placeholder="VD: NGUYEN VAN A"
                    />
                  </div>

                  {bankChangeError && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/8 border border-red-500/20">
                      <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <p className="text-[11px] text-red-700">{bankChangeError}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBankInfo(false);
                        setBankChangeError(null);
                      }}
                      disabled={bankChangeSubmitting}
                      className="flex-1 py-2 rounded-lg border border-black/10 text-[11px] font-semibold text-black/50 hover:text-black/70 hover:bg-black/[0.02] transition-all disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!editBankName.trim() || !editAccountNumber.trim() || !editAccountHolder.trim()) {
                          setBankChangeError('Vui lòng nhập đầy đủ thông tin.');
                          return;
                        }
                        setBankChangeError(null);
                        try {
                          await requestBankChange({
                            bankAccountId: activeBank.id,
                            bankName: editBankName.trim(),
                            accountNumber: editAccountNumber.trim(),
                            accountHolderName: editAccountHolder.trim(),
                          }).unwrap();
                          setBankChangeSuccess(true);
                          setBankChangePending(true);
                          setEditingBankInfo(false);
                        } catch (err: any) {
                          setBankChangeError(err?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.');
                        }
                      }}
                      disabled={bankChangeSubmitting}
                      className="flex-1 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 hover:from-violet-600 hover:to-violet-700 transition-all disabled:opacity-70"
                    >
                      {bankChangeSubmitting ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          Gửi yêu cầu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Bank change pending notice ────────────────────────────── */}
              {(bankChangePending || !bankStatus || hasPendingRequest) && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-amber-800">
                      Yêu cầu thay đổi thông tin ngân hàng đang chờ duyệt
                    </p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Bạn sẽ nhận email thông báo khi yêu cầu được duyệt. Trong thời gian này, bạn không thể tạo thêm
                      yêu cầu đổi thông tin (đã có 1 yêu cầu gửi lúc{' '}
                      {bankChangeStatusData?.latestRequest?.createdAt
                        ? new Date(bankChangeStatusData.latestRequest.createdAt).toLocaleString('vi-VN')
                        : 'mới đây'}
                      ). Khi admin duyệt, tính năng rút tiền sẽ mở lại.
                    </p>
                  </div>
                </div>
              )}

              {/* eKYC status */}
              <div className="bg-gray-50 rounded-xl p-3 border border-black/5 flex items-center gap-3">
                <BadgeCheck
                  className={cn('w-5 h-5 flex-shrink-0', isKycVerified ? 'text-emerald-500' : 'text-amber-500')}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-black">eKYC</p>
                  <p className={cn('text-[11px]', isKycVerified ? 'text-emerald-600' : 'text-amber-600')}>
                    {isKycVerified ? 'Đã xác thực' : 'Chưa xác thực — Vui lòng xác thực trước khi rút tiền'}
                  </p>
                </div>
                {!isKycVerified && (
                  <Link
                    href="/kyc"
                    className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 flex-shrink-0"
                  >
                    Xác thực
                  </Link>
                )}
              </div>

              {!canWithdrawByStatus && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <p className="text-[11px] text-amber-800">
                    Chỉ có thể yêu cầu rút tiền từ chiến dịch đang hoạt động hoặc đã hoàn thành.
                  </p>
                </div>
              )}

              {!hasValidGoalAmount && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <p className="text-[11px] text-amber-800">Mục tiêu chiến dịch không hợp lệ.</p>
                </div>
              )}

              {hasValidGoalAmount && !metProgressThreshold && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <p className="text-[11px] text-amber-800">
                    Chiến dịch phải đạt ít nhất 50% mục tiêu để có thể rút tiền.
                  </p>
                </div>
              )}

              {availableToWithdraw <= 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <p className="text-[11px] text-amber-800">Không còn số tiền nào để rút từ chiến dịch này.</p>
                </div>
              )}

              {noWithdrawAttemptsLeft && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <p className="text-[11px] text-red-700">
                    Đã đạt giới hạn tối đa 3 yêu cầu rút tiền cho chiến dịch này.
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <p className="text-[11px] text-red-700">{errorMsg}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step: Confirm ──────────────────────────────────────────── */}
          {step === 'confirm' && activeBank && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <p className="text-sm text-black/60">Bạn xác nhận gửi yêu cầu rút tiền?</p>
                <p className="text-xs text-black/40 mt-2">
                  Số tiền sẽ do hệ thống tự tính tại thời điểm xử lý, về{' '}
                  <span className="font-semibold text-black/60">{activeBank.bankName}</span> —{' '}
                  {maskAccountNumber(activeBank.accountNumber)}
                </p>
                <p className="text-[11px] text-violet-700 mt-2">
                  Lượt rút: {Math.min(completedWithdrawCount + 1, MAX_WITHDRAW_ATTEMPTS)}/{MAX_WITHDRAW_ATTEMPTS}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-black/5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-black/40">Chiến dịch</span>
                  <span className="font-semibold text-black truncate max-w-[200px]">{campaign.title}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-black/40">Ngân hàng</span>
                  <span className="font-semibold text-black">{activeBank.bankName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-black/40">Số tài khoản</span>
                  <span className="font-semibold text-black">{maskAccountNumber(activeBank.accountNumber)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-black/40">Chủ tài khoản</span>
                  <span className="font-semibold text-black">{activeBank.accountHolderName}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Step: Success ──────────────────────────────────────────── */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-7 h-7 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-black">Yêu cầu đã được gửi!</p>
              <p className="text-xs text-black/40 mt-1.5 max-w-xs mx-auto">
                Yêu cầu rút tiền đang chờ Admin xem xét. Bạn sẽ nhận email thông báo khi có kết quả.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-amber-700">Withdraw Pending Review</span>
              </div>
            </div>
          )}

          {/* ── Step: Error ──────────────────────────────────────────── */}
          {step === 'error' && (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <p className="text-sm font-bold text-black">Gửi yêu cầu thất bại</p>
              <p className="text-xs text-red-600 mt-1.5 max-w-xs mx-auto">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-black/5 flex-shrink-0">
          {step === 'form' && (
            <>
              <button
                onClick={handleModalClose}
                className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-semibold text-black/50 hover:text-black/70 hover:bg-black/[0.02] transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleProceed}
                disabled={!canProceed}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:from-violet-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp tục
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <button
                onClick={() => setStep('form')}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-semibold text-black/50 hover:text-black/70 hover:bg-black/[0.02] transition-all disabled:opacity-50"
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:from-violet-600 hover:to-violet-700 transition-all disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  'Xác nhận rút tiền'
                )}
              </button>
            </>
          )}

          {(step === 'success' || step === 'error') && (
            <button
              onClick={handleModalClose}
              className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-semibold text-black/60 hover:text-black/80 hover:bg-black/[0.02] transition-all"
            >
              Đóng
            </button>
          )}
        </div>

        {/* Drag handle (mobile) */}
        <div className="sm:hidden absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-black/15" />
      </div>
    </div>,
    document.body,
  );
}
