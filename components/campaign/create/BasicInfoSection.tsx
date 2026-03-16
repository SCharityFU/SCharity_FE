import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, ChevronDown, CreditCard, DollarSign, FileText, Landmark, Search, Type, User } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampaignCategory } from '@/dtos/enums';
import type { CreateCampaignFormValues } from '@/components/campaign/create/schema';
import { formatVND, parseCurrencyInput, removeDiacritics } from '@/components/campaign/create/utils';
import type { VietQRBank } from '@/hooks/useVietQRBanks';

interface BasicInfoSectionProps {
  titleMax: number;
  goalPresets: number[];
  shortVND: (value: number) => string;
  minDeadline: string;
  formatDateVN: (value: string) => string;
  categoryLabels: Record<CampaignCategory, string>;
  bankSearch: string;
  onBankSearchChange: (value: string) => void;
  bankDropdownOpen: boolean;
  onBankDropdownOpenChange: (open: boolean) => void;
  selectedBank: VietQRBank | null;
  bankDropdownRef: React.RefObject<HTMLDivElement | null>;
  filteredBanks: VietQRBank[];
  onSelectBank: (bank: VietQRBank) => void;
}

export function BasicInfoSection({
  titleMax,
  goalPresets,
  shortVND,
  minDeadline,
  formatDateVN,
  categoryLabels,
  bankSearch,
  onBankSearchChange,
  bankDropdownOpen,
  onBankDropdownOpenChange,
  selectedBank,
  bankDropdownRef,
  filteredBanks,
  onSelectBank,
}: BasicInfoSectionProps) {
  const { register, control, setValue } = useFormContext<CreateCampaignFormValues>();
  const title = useWatch({ control, name: 'title' }) ?? '';
  const goalAmount = useWatch({ control, name: 'goalAmount' }) ?? 0;
  const deadline = useWatch({ control, name: 'deadline' }) ?? '';
  const category = (useWatch({ control, name: 'category' }) ?? '') as CampaignCategory | '';
  const accountNumber = useWatch({ control, name: 'accountNumber' }) ?? '';
  const accountHolderName = useWatch({ control, name: 'accountHolderName' }) ?? '';
  const [goalRaw, setGoalRaw] = useState('');

  useEffect(() => {
    setGoalRaw(goalAmount > 0 ? formatVND(goalAmount) : '');
  }, [goalAmount]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="campaign-title" className="text-black/70">
          <Type className="w-4 h-4 text-rose-400" />
          Tiêu đề chiến dịch
        </Label>
        <div className="relative">
          <input
            id="campaign-title"
            type="text"
            maxLength={titleMax}
            {...register('title')}
            placeholder="VD: Xây trường học cho trẻ em vùng cao"
            className="w-full px-4 py-3 rounded-xl glass border border-black/10 text-black placeholder-black/30 outline-none focus:border-rose-500/50 transition-colors text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-black/30">
            {title.length}/{titleMax}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaign-goal" className="text-black/70">
          <DollarSign className="w-4 h-4 text-amber-500" />
          Mục tiêu gây quỹ
        </Label>
        <div className="relative">
          <input
            id="campaign-goal"
            type="text"
            inputMode="numeric"
            value={goalRaw}
            onChange={(e) => {
              const num = parseCurrencyInput(e.target.value);
              setValue('goalAmount', num, { shouldValidate: true, shouldDirty: true });
              setGoalRaw(num > 0 ? formatVND(num) : '');
            }}
            placeholder="VD: 50.000.000"
            className="w-full px-4 py-3 pr-12 rounded-xl glass border border-black/10 text-black placeholder-black/30 outline-none focus:border-rose-500/50 transition-colors text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-black/40">₫</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {goalPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setValue('goalAmount', preset, { shouldValidate: true, shouldDirty: true });
                setGoalRaw(formatVND(preset));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                goalAmount === preset
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'glass border border-black/10 text-black/50 hover:text-black hover:border-rose-500/30'
              }`}
            >
              {shortVND(preset)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaign-deadline" className="text-black/70">
          <Calendar className="w-4 h-4 text-violet-500" />
          Hạn chót
        </Label>
        <input
          title="Hạn chót"
          id="campaign-deadline"
          type="date"
          min={minDeadline}
          {...register('deadline')}
          className="w-full px-4 py-3 rounded-xl glass border border-black/10 text-black outline-none focus:border-rose-500/50 transition-colors text-sm"
        />
        {deadline && <p className="text-xs text-black/40">Ngày kết thúc: {formatDateVN(deadline)}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-black/70">
          <FileText className="w-4 h-4 text-blue-500" />
          Danh mục (tùy chọn)
        </Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select value={(field.value as CampaignCategory | '') ?? ''} onValueChange={(val) => field.onChange(val)}>
              <SelectTrigger className="w-full h-11 px-4 rounded-xl bg-white border border-black/10 text-sm">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-black/10 rounded-xl shadow-lg">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="rounded-lg text-black/70 focus:bg-black/[0.04] focus:text-black"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-4 p-4 rounded-xl bg-black/[0.02] border border-black/5">
        <h3 className="font-semibold text-sm text-black/80 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-emerald-500" />
          Thông tin ngân hàng
        </h3>

        <div className="space-y-2">
          <Label className="text-xs text-black/50">Chọn ngân hàng</Label>
          <div className="relative" ref={bankDropdownRef}>
            <button
              type="button"
              onClick={() => onBankDropdownOpenChange(!bankDropdownOpen)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg glass border border-black/10 text-sm text-left transition-colors focus:border-rose-500/50 outline-none"
            >
              {selectedBank ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedBank.logo}
                    alt={selectedBank.shortName}
                    className="w-6 h-6 object-contain rounded"
                  />
                  <span className="flex-1 truncate text-black">
                    {selectedBank.shortName} - {selectedBank.name}
                  </span>
                </>
              ) : (
                <span className="flex-1 text-black/30">Chọn ngân hàng...</span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-black/30 transition-transform ${bankDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {bankDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl glass-card border border-black/10 shadow-lg max-h-64 overflow-hidden flex flex-col"
                >
                  <div className="p-2 border-b border-black/5">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/30" />
                      <input
                        type="text"
                        value={bankSearch}
                        onChange={(e) => onBankSearchChange(e.target.value)}
                        placeholder="Tìm ngân hàng..."
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/[0.03] border-none text-xs text-black placeholder-black/30 outline-none"
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
                          onSelectBank(bank);
                          setValue('bankName', bank.shortName, { shouldValidate: true, shouldDirty: true });
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs hover:bg-black/[0.04] transition-colors ${
                          selectedBank?.id === bank.id ? 'bg-rose-50 text-rose-700' : 'text-black/70'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={bank.logo}
                          alt={bank.shortName}
                          className="w-7 h-7 object-contain rounded bg-white p-0.5 border border-black/5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{bank.shortName}</p>
                          <p className="text-[10px] text-black/40 truncate">{bank.name}</p>
                        </div>
                      </button>
                    ))}
                    {filteredBanks.length === 0 && (
                      <p className="text-xs text-black/30 text-center py-4">Không tìm thấy ngân hàng</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-number" className="text-xs text-black/50">
            <CreditCard className="w-3 h-3" />
            Số tài khoản
          </Label>
          <Controller
            name="accountNumber"
            control={control}
            render={({ field }) => (
              <input
                id="account-number"
                type="text"
                inputMode="numeric"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                placeholder="VD: 0123456789"
                className="w-full px-4 py-2.5 rounded-lg glass border border-black/10 text-black placeholder-black/30 outline-none focus:border-rose-500/50 transition-colors text-sm font-mono tracking-wider"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-holder" className="text-xs text-black/50">
            <User className="w-3 h-3" />
            Tên chủ tài khoản
          </Label>
          <Controller
            name="accountHolderName"
            control={control}
            render={({ field }) => (
              <input
                id="account-holder"
                type="text"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(removeDiacritics(e.target.value))}
                placeholder="VD: NGUYEN VAN A"
                className="w-full px-4 py-2.5 rounded-lg glass border border-black/10 text-black placeholder-black/30 outline-none focus:border-rose-500/50 transition-colors text-sm uppercase tracking-wide"
              />
            )}
          />
          <p className="text-[10px] text-black/30">Tự động viết hoa, không dấu (theo chuẩn ngân hàng)</p>
        </div>

        <input type="hidden" {...register('bankName')} />
      </div>
    </div>
  );
}
