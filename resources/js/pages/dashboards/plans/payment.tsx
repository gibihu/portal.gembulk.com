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
import { Head } from "@inertiajs/react";
import { useState } from "react";



export default function PlanPaymentPage(request: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Payment',
            href: web.dashboard.plans.payment({ id: request.plan.id }).url ?? '',
        },
    ];
    const [plan, setPlan] = useState<PlanType>(request.plan);
    const [paymentMethod, setPaymentMethod] = useState<string>('qr-prompts');
    const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
    const [isPaying, setIsPaying] = useState<boolean>(false);

    const bill = {
        main: plan,
        plan_id: plan ? plan.id : '',
        tax: plan ? plan.price * plan.tax_rate : 0,
        tax_invoice: false,
        total: plan ? plan.price + (plan.price * plan.tax_rate) + plan.fee_rate : 0,
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowPaymentDialog(true);
    };

    const handlePaymentSuccess = () => {
        setIsPaying(true);

        // ส่งข้อมูล bill ไปยัง onSubmit
        const paymentData = {
            bill,
            paymentMethod,
            plan_id: bill.plan_id,
            amount: bill.total,
            currency: bill.main.currency,
        };

        console.log('Payment Data:', paymentData);

        // จำลองการชำระเงิน - ในกรณีจริงต้องเชื่อมต่อ payment gateway
        setTimeout(() => {
            // หลังจากชำระเงินแล้ว ให้ปิด dialog และเรียก onSubmit
            setShowPaymentDialog(false);
            setIsPaying(false);

            // เรียก onSubmit ที่คุณเตรียมไว้
            onSubmit(paymentData);

            // หรือใช้ Inertia post
            // router.post(route('payment.process'), paymentData);
        }, 2000);
    };

    function onSubmit(data: any) {
        console.log('Submitted Data:', data);
    };

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
                        <div className="grid grid-cols-6 gap-4">
                            <div className="col-span-4">
                                <Card className="p-0">
                                    <CardContent className="p-4">
                                        <Table>
                                            <TableBody>
                                                <TableRow className="border-none">
                                                    <TableCell className="flex flex-col">
                                                        <span className="capitalize text-lg font-medium">{bill.main.name}</span>
                                                        <span className="capitalize text-muted-foreground">{bill.main.description}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium content-start">
                                                        {bill.main.price.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>


                            <div className="col-span-2 flex flex-col gap-4">
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
                                                        {bill.main.fee_rate.toLocaleString()}
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
                                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="max-w-sm">
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
                                <p className="text-gray-400 text-sm mb-2">QR Code PromptPay</p>
                                <p className="text-gray-600 font-semibold">
                                    {bill.total.toLocaleString()} {bill.main.currency}
                                </p>
                            </div>
                        </div>

                        <div className="w-full text-center">
                            <p className="text-sm text-muted-foreground mb-2">รอการชำระเงิน...</p>
                            <p className="text-lg font-bold">
                                {bill.total.toLocaleString()} {bill.main.currency}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowPaymentDialog(false)}
                            disabled={isPaying}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handlePaymentSuccess}
                            disabled={isPaying}
                        >
                            {isPaying ? 'กำลังประมวลผล...' : 'ยืนยันการชำระเงิน'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
