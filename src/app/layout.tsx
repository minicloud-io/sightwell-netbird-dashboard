import { globalMetaTitle } from "@utils/meta";
import type { Metadata } from "next";
import { BRAND } from "@/branding/brand";
import AppLayout from "@/layouts/AppLayout";

export const metadata: Metadata = {
  title: `${globalMetaTitle}`,
  description: BRAND.description,
};
export default AppLayout;
