import { CampaignCategory } from "@/dtos/enums";

export interface CampaignDraft {
  title: string;
  goalAmount: number;
  goalRaw: string;
  deadline: string;
  category: CampaignCategory | "";
  storyHtml: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  mediaPreviews: string[];
  coverIndex: number;
  savedAt: string;
}

export type FeedbackMessage = {
  type: "success" | "error";
  text: string;
};

export interface ProofPreview {
  name: string;
  type: "image" | "pdf";
  url: string;
}
