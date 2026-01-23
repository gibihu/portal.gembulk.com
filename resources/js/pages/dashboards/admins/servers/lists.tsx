import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import ServerTable from "./table";
import web from "@/routes/web";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Servers',
        href: web.dashboard.admins.server.lists().url,
    },
];


export default function ServerListPage(request: any) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <ServerTable items={request.servers} />
        </AppLayout>
    );
}
