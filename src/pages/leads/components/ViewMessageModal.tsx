import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Mail, User, Phone, Building, MapPin, Calendar } from "lucide-react";
import type { ContactSubmission } from "@/types/lead";

interface ViewMessageModalProps {
    lead: ContactSubmission | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewMessageModal({
    lead,
    open,
    onOpenChange,
}: ViewMessageModalProps) {
    if (!lead) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Message Details</DialogTitle>
                    <DialogDescription>
                        Submitted by {lead.firstName} {lead.lastName}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-4">
                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium text-foreground">
                                        {lead.firstName} {lead.lastName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <a
                                        href={`mailto:${lead.email}`}
                                        className="text-foreground hover:underline"
                                    >
                                        {lead.email}
                                    </a>
                                </div>
                                {lead.phoneNumber && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span className="text-foreground">{lead.phoneNumber}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {lead.companyName && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Building className="h-4 w-4" />
                                        <span className="text-foreground">{lead.companyName}</span>
                                    </div>
                                )}
                                {(lead.country || lead.postalCode) && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-foreground">
                                            {[lead.country, lead.postalCode].filter(Boolean).join(", ")}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-foreground">
                                        {format(new Date(lead.createdAt), "PPP p")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-medium mb-2">Message</h4>
                            <div className="bg-muted/50 p-4 rounded-md text-sm whitespace-pre-wrap leading-relaxed">
                                {lead.message}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
