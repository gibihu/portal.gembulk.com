import { PlanCard, PricingPlansCard } from '@/components/pricing-plans-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import api from '@/routes/api';
import web from '@/routes/web';
import { type BreadcrumbItem } from '@/types';
import { TransactionType } from '@/types/transaction';
import { UserType } from '@/types/user';
import { Head, Link } from '@inertiajs/react';
import { DatabaseBackup, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Plans',
        href: web.dashboard.plans.manage().url ?? '',
    },
];

export default function PlansPage(request: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <div className="w-full">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold tracking-tight">จัดการแพลน</h2>
                    <p className="text-muted-foreground mt-2">รายการทำธุรกรรมการซื้อแพลน</p>
                </div>
                <PlnaTransactionTable request={request} />
            </div>
        </AppLayout>
    );
}

function PlnaTransactionTable({ request }: { request: any }) {
    const [plan, setPlan] = useState(request.plan);
    const [trans, setTrans] = useState<TransactionType[]>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const way = api.transaction.list();
                const res = await fetch(way.url);

                const response = await res.json();
                if (response.code == 200) {
                    setTrans(response.data ?? []);
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error:', error);
                let message = "เกิดข้อผิดพลาดบางอย่าง";
                if (error instanceof Error) {
                    message = error.message;
                } else if (typeof error === "string") {
                    message = error;
                }

                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="grid grid-cols-6 gap-4">
            <div className="col-span-2">
                <PlanCard plan={plan} is_paid={true} />
            </div>
            <Card className="col-span-4">
                <CardHeader className='flex flex-row justify-between gap-2'>
                    <div>
                        <CardTitle>รายละเอียดแพลน</CardTitle>
                        <CardDescription>คุณได้เลือกแพลน {plan.name} แล้ว</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Link href={web.dashboard.plans.index().url}>
                            <Button variant='outline'><DatabaseBackup />เปลี่ยน</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="w-full flex justify-center">
                            <Loader className="size-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead >เมธอด</TableHead>
                                    <TableHead >จำนวน</TableHead>
                                    <TableHead >สถาณะ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    trans?.map((item: TransactionType, key: number) => (
                                        <TableRow>
                                            <TableCell className="font-medium">
                                                {item.payment_method == 'qr-prompts' ? 'QR Code' : item.payment_method}
                                            </TableCell>
                                            <TableCell className="font-medium">{Number(item.amount).toLocaleString()} <span className="text-muted-foreground font-normal">{item.currency}</span></TableCell>
                                            <TableCell className="capitalize">
                                                {item.status_text}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}