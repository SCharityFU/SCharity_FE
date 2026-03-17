import * as z from "zod";
import { CampaignCategory } from "@/dtos/enums";
import { MAX_CAMPAIGN_DEADLINE_DAYS } from "@/components/campaign/create/constants";

const stripHtmlToText = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export const createCampaignFormSchema = z.object({
  title: z
    .string()
    .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
    .max(100, "Tiêu đề không được vượt quá 100 ký tự"),
  story: z.string().refine((v) => stripHtmlToText(v).length >= 50, {
    message: "Nội dung câu chuyện phải có ít nhất 50 ký tự",
  }),
  goalAmount: z
    .number({ error: "Số tiền mục tiêu không hợp lệ" })
    .positive("Số tiền mục tiêu phải lớn hơn 0")
    .min(30_000, "Số tiền quyên góp tối thiểu là 30.000 VND"),
  deadline: z
    .string()
    .min(1, "Thời hạn kết thúc là bắt buộc")
    .refine(
      (d) => {
        const date = new Date(d);
        if (Number.isNaN(date.getTime())) return false;
        const endOfSelectedDay = new Date(date);
        endOfSelectedDay.setHours(23, 59, 59, 999);
        return endOfSelectedDay > new Date();
      },
      { message: "Thời hạn kết thúc phải nằm trong tương lai" },
    )
    .refine(
      (d) => {
        const selectedDate = new Date(d);
        if (Number.isNaN(selectedDate.getTime())) return false;

        const maxDeadline = new Date();
        maxDeadline.setDate(maxDeadline.getDate() + MAX_CAMPAIGN_DEADLINE_DAYS);
        maxDeadline.setHours(23, 59, 59, 999);

        selectedDate.setHours(23, 59, 59, 999);
        return selectedDate <= maxDeadline;
      },
      {
        message: `Thời hạn kết thúc không được vượt quá ${MAX_CAMPAIGN_DEADLINE_DAYS} ngày kể từ hôm nay`,
      },
    ),
  category: z.union([z.enum(CampaignCategory), z.literal("")]).optional(),
  bankName: z.string().min(1, "Tên ngân hàng là bắt buộc"),
  accountNumber: z
    .string()
    .min(1, "Số tài khoản là bắt buộc")
    .regex(/^\d+$/, "Số tài khoản chỉ được chứa chữ số"),
  accountHolderName: z
    .string()
    .min(1, "Tên chủ tài khoản là bắt buộc")
    .regex(/^[A-Za-z\s]+$/, "Tên chủ tài khoản chỉ được chứa chữ cái không dấu và khoảng trắng"),
});

export type CreateCampaignFormValues = z.infer<typeof createCampaignFormSchema>;

export const createCampaignFormDefaultValues: CreateCampaignFormValues = {
  title: "",
  story: "",
  goalAmount: 0,
  deadline: "",
  category: "",
  bankName: "",
  accountNumber: "",
  accountHolderName: "",
};
