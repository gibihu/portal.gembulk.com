import { PricingPlansCard } from '@/components/pricing-plans-card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import web from '@/routes/web';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: web.dashboard.index().url,
    },
];

export default function PlansPage(request: any) {
    console.log(request);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <PricingPlansCard />
        </AppLayout>
    );
}
