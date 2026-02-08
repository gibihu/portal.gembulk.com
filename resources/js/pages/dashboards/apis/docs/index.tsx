import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import web from '@/routes/web';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Api Documentation',
        href: web.dashboard.api.docs().url,
    },
];

const api_base_url = 'https://api.gembulk.com/v1/s';

const CopyUrlButton = ({ url }: { url: string }) => {
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={onCopy}
            className="cursor-pointer text-muted-foreground hover:text-foreground active:scale-95 transition-all"
            title="Copy URL"
        >
            {copied ? <Check className="size-4 text-green-500 animate-rotate-y animate-once animate-ease-in-out" /> : <Copy className="size-4" />}
        </button>
    );
};

const CodeBlock = ({ code, language = 'json' }: { code: string; language?: string }) => {
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative mt-2 rounded-md bg-zinc-950 p-4 font-mono text-sm text-zinc-50 dark:bg-zinc-900">
            <button
                onClick={onCopy}
                className="absolute right-2 top-2 rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
                {copied ? <Check className="h-4 w-4 text-green-500 animate-rotate-y animate-once animate-ease-in-out" /> : <Copy className="h-4 w-4" />}
            </button>
            <pre className="overflow-x-auto whitespace-pre-wrap">
                <code>{code}</code>
            </pre>
        </div>
    );
};

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <div className="space-y-6 pt-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">เอกสารการใช้งาน API</h1>
                    <p className="text-muted-foreground">คู่มือการใช้งานบริการ Gembulk OTP API หมายเหตุ: ทุกคำขอจำเป็นต้องระบุ API Key</p>
                </div>

                <div className="grid gap-6">
                    <div className="flex flex-col gap-4">
                        {/* Authentication Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>การยืนยันตัวตน</CardTitle>
                                <CardDescription>
                                    เพื่อความปลอดภัย โปรดระบุตรวจสอบ API Key ของคุณในส่วนหัว <code>x-api-key</code>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
                                    <span className="font-mono text-sm font-semibold">x-api-key:</span>
                                    <span className="max-w-full overflow-hidden text-ellipsis font-mono text-sm text-muted-foreground">
                                        YOUR_API_KEY
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Send SMS Endpoint */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Badge className="bg-primary hover:bg-primary/80">POST</Badge>
                                    <span className="break-all font-mono text-sm text-muted-foreground">/sms/send</span>
                                </div>
                                <CardTitle className="mt-2">ส่ง SMS</CardTitle>
                                <CardDescription>ส่งข้อความ SMS ไปยังผู้รับที่ระบุโดยใช้การตั้งค่าแคมเปญของคุณ</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">URL ปลายทาง</h3>
                                    <div className="flex justify-between rounded-md border bg-muted p-2 font-mono text-sm break-all items-center">
                                        {api_base_url}/sms/send
                                        <CopyUrlButton url={`${api_base_url}/sms/send`} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">ข้อมูลที่ต้องส่ง (Request Body)</h3>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[150px]">พารามิเตอร์</TableHead>
                                                    <TableHead className="w-[100px]">ชนิดข้อมูล</TableHead>
                                                    <TableHead className="w-[100px]">จำเป็น</TableHead>
                                                    <TableHead>คำอธิบาย</TableHead>
                                                    <TableHead>ตัวอย่าง</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell className="font-medium">campaign_name</TableCell>
                                                    <TableCell>string</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-muted-foreground">ไม่บังคับ</Badge>
                                                    </TableCell>
                                                    <TableCell colSpan={2}>ตั่งชื่อแคมเปญ</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font-medium">receivers</TableCell>
                                                    <TableCell>array</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">ใช่</Badge>
                                                    </TableCell>
                                                    <TableCell>เบอร์โทรศัพท์สำหรับรับ SMS</TableCell>
                                                    <TableCell>["086xxx","098xxx"]</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font-medium">sender_name</TableCell>
                                                    <TableCell>string</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">ใช่</Badge>
                                                    </TableCell>
                                                    <TableCell colSpan={2}>ชื่อผู้ส่งที่จะแสดงบนอุปกรณ์ของผู้รับ</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font-medium">message</TableCell>
                                                    <TableCell>string</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">ใช่</Badge>
                                                    </TableCell>
                                                    <TableCell colSpan={2}>ข้อความที่ต้องการส่ง</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">ตัวอย่างการตอบกลับ (201 Created)</h3>
                                    <CodeBlock
                                        code={`{
    "success": true,
    "message": "SMS sent successfully",
    "data": {
        "campaign_id": 019c23dc-fca3-720e-be69-38xxxxxxxxx,
        "message": "HAPPY NEW YEAR!",
        "cost": "100",
        "credits": 999
    },
    "code": 201
}`}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Report Endpoint */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Badge variant="secondary" className="bg-success text-white hover:bg-success">
                                        GET
                                    </Badge>
                                    <span className="break-all font-mono text-sm text-muted-foreground">/otp/{`{campaign_id}`}</span>
                                </div>
                                <CardTitle className="mt-2">ตรวจสอบสถานะ</CardTitle>
                                <CardDescription>ดึงสถานะการจัดส่ง SMS โดยระบุ ID แคมเปญ</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">URL ปลายทาง</h3>
                                    <div className="flex justify-between rounded-md border bg-muted p-2 font-mono text-sm break-all items-center">
                                        {api_base_url}/otp/{`{campaign_id}`}
                                        <CopyUrlButton url={`${api_base_url}/otp/{campaign_id}`} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">พารามิเตอร์</h3>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[150px]">พารามิเตอร์</TableHead>
                                                    <TableHead className="w-[100px]">ชนิดข้อมูล</TableHead>
                                                    <TableHead className="w-[100px]">จำเป็น</TableHead>
                                                    <TableHead>คำอธิบาย</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell className="font-medium">campaign_id</TableCell>
                                                    <TableCell>integer</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">ใช่</Badge>
                                                    </TableCell>
                                                    <TableCell>ID เฉพาะของแคมเปญที่ต้องการตรวจสอบ</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">ตัวอย่างการตอบกลับ (200 OK)</h3>
                                    <CodeBlock
                                        code={`{
    "success": true,
    "message": "Get Report Successfully",
    "data": {
        "success": true,
        "campaign_id": 019c23dc-fca3-720e-be69-38xxxxxxxx,
        "campaign_name": "Congratulations"
        "total_receiver": 100,
        "sent": 80,
        "failed": 7,
        "pending": 3,
        "passed": 70,
        "credits_refund": 10,
        "status": "completed",
        "sent_at": "2024-02-04T10:00:00.000000Z",
        "updated_at": "2024-02-04T10:00:05.000000Z",
        "created_at": "2024-02-04T10:00:00.000000Z"
    },
    "code": 200
}`}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex flex-col gap-4">

                        {/* Send OTP Endpoint */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Badge className="bg-primary hover:bg-primary/80">POST</Badge>
                                    <span className="break-all font-mono text-sm text-muted-foreground">/otp/send</span>
                                </div>
                                <CardTitle className="mt-2">ส่ง OTP</CardTitle>
                                <CardDescription>ส่งข้อความ OTP ไปยังผู้รับที่ระบุโดยใช้การตั้งค่าแคมเปญของคุณ</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">URL ปลายทาง</h3>
                                    <div className="flex justify-between rounded-md border bg-muted p-2 font-mono text-sm break-all items-center">
                                        {api_base_url}/otp/send
                                        <CopyUrlButton url={`${api_base_url}/otp/send`} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">ข้อมูลที่ต้องส่ง (Request Body)</h3>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[150px]">พารามิเตอร์</TableHead>
                                                    <TableHead className="w-[100px]">ชนิดข้อมูล</TableHead>
                                                    <TableHead className="w-[100px]">จำเป็น</TableHead>
                                                    <TableHead>คำอธิบาย</TableHead>
                                                    <TableHead>ตัวอย่าง</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell className="font-medium">campaign_name</TableCell>
                                                    <TableCell>string</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-muted-foreground">ไม่บังคับ</Badge>
                                                    </TableCell>
                                                    <TableCell colSpan={2}>ตั่งชื่อแคมเปญ</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font-medium">receiver</TableCell>
                                                    <TableCell>string</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">ใช่</Badge>
                                                    </TableCell>
                                                    <TableCell colSpan={2}>เบอร์โทรศัพท์สำหรับรับ OTP</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font-medium">sender_name</TableCell>
                                                    <TableCell>string | array:1</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">ใช่</Badge>
                                                    </TableCell>
                                                    <TableCell>ชื่อผู้ส่งที่จะแสดงบนอุปกรณ์ของผู้รับ</TableCell>
                                                    <TableCell>"098xxx" หรือ [6698xxx]</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font-medium">ref_id</TableCell>
                                                    <TableCell>string</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-muted-foreground">ไม่บังคับ</Badge>
                                                    </TableCell>
                                                    <TableCell colSpan={2}>รหัสอ้างอิงที่กำหนดเองสำหรับการติดตามของคุณ</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">ตัวอย่างการตอบกลับ (201 Created)</h3>
                                    <CodeBlock
                                        code={`{
    "success": true,
    "message": "OTP sent successfully",
    "data": {
        "campaign_id": 019c23dc-fca3-720e-be69-38xxxxxxxxx,
        "message": "Your OTP code is: 123456",
        "ref_id": "cust_ref_001",
        "otp_code": "123456"
        "credits" : 9999
    },
    "code": 201
}`}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Report Endpoint */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Badge variant="secondary" className="bg-success text-white hover:bg-success">
                                        GET
                                    </Badge>
                                    <span className="break-all font-mono text-sm text-muted-foreground">/otp/{`{campaign_id}`}</span>
                                </div>
                                <CardTitle className="mt-2">ตรวจสอบสถานะ</CardTitle>
                                <CardDescription>ดึงสถานะการจัดส่ง OTP โดยระบุ ID แคมเปญ</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">URL ปลายทาง</h3>
                                    <div className="flex justify-between rounded-md border bg-muted p-2 font-mono text-sm break-all items-center">
                                        {api_base_url}/otp/{`{campaign_id}`}
                                        <CopyUrlButton url={`${api_base_url}/otp/{campaign_id}`} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">พารามิเตอร์</h3>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[150px]">พารามิเตอร์</TableHead>
                                                    <TableHead className="w-[100px]">ชนิดข้อมูล</TableHead>
                                                    <TableHead className="w-[100px]">จำเป็น</TableHead>
                                                    <TableHead>คำอธิบาย</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell className="font-medium">campaign_id</TableCell>
                                                    <TableCell>integer</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">ใช่</Badge>
                                                    </TableCell>
                                                    <TableCell>ID เฉพาะของแคมเปญที่ต้องการตรวจสอบ</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <h3 className="text-sm font-medium leading-none">ตัวอย่างการตอบกลับ (200 OK)</h3>
                                    <CodeBlock
                                        code={`{
    "success": true,
    "message": "Get Report Successfully",
    "data": {
        "campaign_id": 019c23dc-fca3-720e-be69-38xxxxxxxx,
        "otp_code": "123456",
        "ref_id": "cust_ref_001",
        "status": "completed",
        "sent_at": "2024-02-04T10:00:00.000000Z",
        "updated_at": "2024-02-04T10:00:05.000000Z",
        "created_at": "2024-02-04T10:00:00.000000Z"
    },
    "code": 200
}`}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Standard Error Response */}
                    <Card>
                        <CardHeader>
                            <CardTitle>รูปแบบการตอบกลับข้อผิดพลาดมาตรฐาน</CardTitle>
                            <CardDescription>
                                โครงสร้างข้อผิดพลาดนี้เป็นรูปแบบมาตรฐานสำหรับ Endpoint ต่อไปนี้:
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-2">
                                <h3 className="text-sm font-medium leading-none">Endpoint ที่รองรับ</h3>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm">
                                        <Badge className="bg-primary hover:bg-primary/80">POST</Badge>
                                        <span className="font-mono text-muted-foreground">/sms/send</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm">
                                        <Badge variant="secondary" className="bg-success text-white hover:bg-success">
                                            GET
                                        </Badge>
                                        <span className="font-mono text-muted-foreground">/sms/{`{campaign_id}`}</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm">
                                        <Badge className="bg-primary hover:bg-primary/80">POST</Badge>
                                        <span className="font-mono text-muted-foreground">/otp/send</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm">
                                        <Badge variant="secondary" className="bg-success text-white hover:bg-success">
                                            GET
                                        </Badge>
                                        <span className="font-mono text-muted-foreground">/otp/{`{campaign_id}`}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <h3 className="text-sm font-medium leading-none">ตัวอย่างการตอบกลับข้อผิดพลาด (400-500)</h3>
                                <CodeBlock
                                    code={`{
    "success": false,
    "message": "มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง",
    "description": "Error description here",
    "code": 500
}`}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
