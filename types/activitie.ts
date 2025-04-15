export type ActivityType =
  | "PASSWORD_CHANGE"
  | "PROFILE_UPDATE"
  | "PHONE_UPDATE"
  | "ADDRESS_UPDATE"
  | "LOGIN"
  | "LOGOUT"
  | "ORDER_CREATE"
  | "ORDER_CANCEL"
  | "COMMENT_ADD"
  | "COMMENT_EDIT"
  | "COMMENT_DELETE"
  | "PRODUCT_VIEW";

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  description: string;
  referenceId?: string | null;
  productName?: string | null;
  date: Date | string;
  metadata?: Record<string, any>;
}
