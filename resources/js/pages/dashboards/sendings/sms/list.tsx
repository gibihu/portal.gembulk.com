import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { useEffect } from "react";

import * as React from "react";

import { ReportType } from "@/types/user";
import SendingTable from "../table";
import web from "@/routes/web";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'กำหนดการส่ง',
        href: web.dashboard.jobs.sms().url,
    },
];

export default function SmsListPage(request: any) {
    const [items, setItems] = React.useState<ReportType[]>(request.jobs as ReportType[]);

    useEffect(() => {
        console.log(request);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <SendingTable items={items} />
        </AppLayout>
    );
}
