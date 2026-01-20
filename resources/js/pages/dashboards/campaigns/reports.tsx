import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { ProgressHelper } from "@/lib/components/progress";
import { DateHelper } from "@/lib/date";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { CampaignType } from "@/types/user";
import { Head } from "@inertiajs/react";
import { Item } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'รายงาน',
        href: web.dash.campaigns.reports().url,
    },
];

export default function CampaignReportPage(request: any) {

    const [campaigns, setCampaigns] = useState<CampaignType[]>(request.campaigns ?? [])
    console.log(request);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="bg-background rounded-xl border md:px-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>วันที่</TableHead>
                            <TableHead>ชื่อเคมเปญ</TableHead>
                            <TableHead>ทั้งหมด</TableHead>
                            <TableHead>สำเร็จ</TableHead>
                            <TableHead>ไม่สำเร็จ</TableHead>
                            <TableHead>รอ</TableHead>
                            <TableHead>คืนเครดิต</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns.map((item: CampaignType, key: number) => (() => {
                            const report = item.response_report_callback ?? {};
                            return (
                                <TableRow key={key}>
                                    <TableCell className="max-w-[120px] truncate">{item.id}</TableCell>
                                    <TableCell className="max-w-[120px] truncate">{DateHelper.format(item.created_at)}</TableCell>
                                    <TableCell className="max-w-[120px] truncate">{item.name}</TableCell>
                                    <TableCell className="min-w-[100px]">
                                        <Progress value={ProgressHelper.calculate(report?.sent, report.total_receiver)} />
                                        <span>{report?.sent ?? 0}/{report.total_receiver ?? item.receivers.length ?? 1}</span>
                                    </TableCell>
                                    <TableCell className="min-w-[100px]">
                                        <Progress value={ProgressHelper.calculate(report?.passed, report.total_receiver)} className="bg-success/20" classNameMain="bg-success" />
                                        <span>{report?.passed ?? 0}/{report.total_receiver?? item.receivers.length ?? 1}</span>
                                    </TableCell>
                                    <TableCell className="min-w-[100px]">
                                        <Progress value={ProgressHelper.calculate(report?.failed, report.total_receiver)} className="bg-danger/20" classNameMain="bg-danger" />
                                        <span>{report?.failed ?? 0}/{report.total_receiver?? item.receivers.length ?? 1}</span>
                                    </TableCell>
                                    <TableCell className="min-w-[100px]">
                                        <Progress value={ProgressHelper.calculate(report?.pending, report.total_receiver)} className="bg-warning/20" classNameMain="bg-warning" />
                                        <span>{report?.pending ?? 0}/{report.total_receiver?? item.receivers.length ?? 1}</span>
                                    </TableCell>
                                    <TableCell className="text-center">{Math.floor(report?.credits_refund ?? 0)}</TableCell>
                                </TableRow>
                            );
                        })())}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}