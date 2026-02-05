import { PricingPlansCard } from '@/components/pricing-plans-card';
import AppLayout from '@/layouts/app-layout';
import web from '@/routes/web';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Plans',
        href: web.dashboard.plans.index().url ?? '',
    },
];

export default function PlansPage(request: any) {
    console.log(request);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="w-full">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold tracking-tight">แพลนทั้งหมด</h2>
                    <p className="text-muted-foreground mt-2">เลือกแพลนที่เหมาะสมกับความต้องการของคุณ</p>
                </div>
                <PricingPlansCard />
            </div>
        </AppLayout>
    );
}