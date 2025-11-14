import apiClient from "../client";

import type { PaginatedResponse } from "@/types/inventory";
import type {
  ContactStatus,
  AdminContactsQueryDto,
  ContactSubmission,
} from "@/types/lead";

export const fetchLeads = async (
  params: AdminContactsQueryDto
): Promise<PaginatedResponse<ContactSubmission>> => {
  return apiClient.get("/admin/contact-submissions", { params });
};

export const updateLeadStatus = async ({
  id,
  status,
}: {
  id: string;
  status: ContactStatus;
}): Promise<{ data: ContactSubmission }> => {
  return apiClient.patch(`/admin/contact-submissions/${id}/status`, { status });
};
