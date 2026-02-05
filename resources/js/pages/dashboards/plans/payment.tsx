import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import AppLayout from "@/layouts/app-layout";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { PlanType } from "@/types/plan";
import { Head, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { set } from "zod";
import api from "@/routes/api";
import { Currency } from "lucide-react";
import { toast } from "sonner";
import { TransactionType } from "@/types/transaction";



export default function PlanPaymentPage(request: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Payment',
            href: web.dashboard.plans.payment({ id: request.plan.id }).url ?? '',
        },
    ];
    const csrfToken = request.csrf;
    const [plan, setPlan] = useState<PlanType>(request.plan);
    const [paymentMethod, setPaymentMethod] = useState<string>('qr-prompts');
    const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
    const [isPaying, setIsPaying] = useState<boolean>(false);
    const [isFetch, setIsFetch] = useState<boolean>(false);
    const [transaction, setTransaction] = useState<TransactionType>({} as TransactionType);

    const bill = {
        main: plan,
        plan_id: plan ? plan.id : '',
        tax: plan ? plan.price * plan.tax_rate : 0,
        fee: 20,
        tax_invoice: false,
        total: plan ? plan.price + (plan.price * plan.tax_rate) + 20 : 0,
        currency: plan ? plan.currency : 'THB',
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const fetchData = async () => {
            setIsFetch(true);
            try {
                const way = api.payments.qr();
                const res = await fetch(way.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({
                        transaction_id: transaction.id,
                        plan_id: bill.plan_id,
                        fee: bill.fee,
                        payment_method: paymentMethod,
                    }),
                });

                const data = await res.json();

                if (data.code == 200 || data.code == 201) {
                    const result = data.data;
                    console.log('Payment initiation response:', data);
                    setTransaction(result);
                    setShowPaymentDialog(true);
                    if(data.status_text === 'completed') {
                        toast.success('Payment completed successfully!');
                        setShowPaymentDialog(false);
                        router.visit(web.dashboard.plans.index().url ?? '');
                    }
                } else if (data.code == 503) {
                    toast.error(data.message, { description: data.description });
                    throw new Error('Service Unavailable');
                } else if (data.code == 429) {
                    toast.error(data.message, { description: data.description });
                    throw new Error('Too Many Requests');
                } else {
                    toast.error(data.message, { description: data.description });
                    throw new Error('Failed to initiate payment');
                }

            } catch (error) {
                console.error('Error submitting form:', error);
            } finally {
                setIsFetch(false);
            }
        };

        fetchData();
    };

    useEffect(() => {
        if (!showPaymentDialog) return;

        const interval = setInterval(() => {
            handleSubmit();
        }, 3000); // 3000 ms = 3 วิ

        return () => {
            clearInterval(interval); // เคลียร์ตอน component unmount หรือค่าเปลี่ยน
        };
    }, [showPaymentDialog]);

    console.log(request);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="w-full">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold tracking-tight">แพลนทั้งหมด</h2>
                    <p className="text-muted-foreground mt-2">เลือกแพลนที่เหมาะสมกับความต้องการของคุณ</p>
                </div>
                <Card>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="col-span-1 md:col-span-4">
                                <Card className="p-0">
                                    <CardContent className="p-4">
                                        <Table>
                                            <TableBody>
                                                <TableRow className="border-none">
                                                    <TableCell className="flex flex-col">
                                                        <span className="capitalize text-lg font-medium">{bill.main.name}</span>
                                                        <span className="capitalize text-muted-foreground">{bill.main.description}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold content-start">
                                                        {bill.main.price.toLocaleString()} {bill.main.currency}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>


                            <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
                                <Card>
                                    <CardHeader>
                                        <h1 className="text-xl font-bold">
                                            การชำระเงิน
                                        </h1>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4">
                                        <Table>
                                            <TableBody className="border-b-1" >
                                                <TableRow className="border-none">
                                                    <TableCell className="capitalize">
                                                        {bill.main.name}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {bill.main.price.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-none">
                                                    <TableCell className="capitalize">
                                                        {bill.main.tax_type}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {bill.tax.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-none">
                                                    <TableCell className=" capitalize">
                                                        {bill.main.fee_label}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {bill.fee.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                            <TableBody>
                                                <TableRow className="border-none font-bold">
                                                    <TableCell>
                                                        รวม
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {bill.total.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>

                                        <div className="grid grid-cols-2 items-center">
                                            <span className="text-sm">ทั้งหมด</span>
                                            <span className="text-end font-bold">{bill.total.toLocaleString()} {bill.main.currency}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <h4 className="text-xl font-bold">ช่องทางการชำระเงิน</h4>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="">
                                                <FieldLabel htmlFor="qr-prompts">
                                                    <Field orientation="horizontal">
                                                        <FieldContent>
                                                            <FieldTitle>QR Code PromptPay</FieldTitle>
                                                            <FieldDescription>สแกน QR เพื่อชำระเงิน</FieldDescription>
                                                        </FieldContent>
                                                        <RadioGroupItem value="qr-prompts" id="qr-prompts" />
                                                    </Field>
                                                </FieldLabel>
                                            </RadioGroup>

                                            <Button
                                                type="submit"
                                                className="w-full mt-2"
                                            >
                                                ยืนยันการชำระเงิน
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>ชำระเงินด้วย QR Code PromptPay</DialogTitle>
                        <DialogDescription>
                            สแกน QR Code ด้วยแอปพลิเคชันธนาคารของคุณ
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-4 py-4">
                        {/* QR Code Placeholder */}
                        <div className="w-72 h-72 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <img src={transaction.detail?.qr_code} alt={transaction.id} />
                            </div>
                        </div>

                        <div className="w-full text-center">
                            <p className="text-sm text-muted-foreground mb-2">รอการชำระเงิน...</p>
                            <p className="text-lg font-bold">
                                {(Number(transaction.amount) ?? 0).toLocaleString()} {transaction.currency}
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
