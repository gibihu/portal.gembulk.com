import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { PlanType } from "@/types/plan";
import { toast } from "sonner";
import web from "@/routes/web";
import api from "@/routes/api";
import { Loader, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Plans',
        href: web.dashboard.admins.plans.index().url,
    },
];


export default function PlansListPage(request: any) {
    console.log(request);

    const [plans, setPlans] = useState<PlanType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const way = api.admins.plans.index();
                const res = await fetch(way.url);
                const response = await res.json();
                if (res.ok) {
                    setPlans(response.data);
                } else {
                    toast.error(response.message || 'Failed to fetch plans data.', { description: response.description ?? '' });
                }
            } catch (error) {
                console.error('Error fetching plans data:', error);
                toast.error('Failed to fetch plans data.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <Card>
                <CardHeader>
                    รายการแพลนทั้งหมด
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="w-full flex items-center justify-center">
                            <Loader className="size-4 animate-spin" />
                        </div>
                    ) : (
                        plans.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ชื่อ</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Order</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plans.map((plan: PlanType, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{plan.name}</TableCell>
                                            <TableCell>{plan.status_text}</TableCell>
                                            <TableCell className="text-right">{plan.order ?? 0}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={web.dashboard.admins.plans.edit(plan.id).url}>
                                                    <Button>
                                                        <SquarePen />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="w-full flex justify-center">
                                <span className="text-muted-foreground">
                                    ไม่มีข้อมูลแพลน
                                </span>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}