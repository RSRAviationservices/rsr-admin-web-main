import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Download, Mail, Phone, Calendar, User, Building } from "lucide-react";
import type { Application } from "@/types/application";
import { formatDate } from "@/lib/utils";

interface ViewApplicationModalProps {
    application: Application | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewApplicationModal({
    application,
    open,
    onOpenChange,
}: ViewApplicationModalProps) {
    if (!application) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <DialogTitle className="text-xl">Application Details</DialogTitle>
                        <Badge variant="outline" className="capitalize">
                            {application.status}
                        </Badge>
                    </div>
                    <DialogDescription>
                        Review the application submitted by {application.fullName}.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-4">
                        {/* Candidate Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-muted-foreground">Candidate</h4>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{application.fullName}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-muted-foreground">Contact</h4>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a href={`mailto:${application.email}`} className="hover:underline">
                                            {application.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <a href={`tel:${application.phone}`} className="hover:underline">
                                            {application.phone}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Position Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-muted-foreground">Position</h4>
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{application.careerTitle}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-muted-foreground">Department</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">{application.department}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Application Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-muted-foreground">Applied On</h4>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{formatDate(application.appliedAt)}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-muted-foreground">Source</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">{application.howDidYouHear}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Cover Letter */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Cover Letter</h4>
                            <div className="bg-muted/50 p-4 rounded-md text-sm whitespace-pre-wrap">
                                {application.coverLetter || "No cover letter provided."}
                            </div>
                        </div>

                        {/* Resume */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Resume</h4>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                    onClick={() => window.open(application.resumeUrl, "_blank")}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    View Resume
                                </Button>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
