import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import AppLayout from "@/layouts/app-layout";
import { extractDomain } from "@/lib/url-functions";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Head, router } from "@inertiajs/react";
import { url } from "inspector";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import api from "@/routes/api";
import { ServerActionType, ServerType } from "@/types/user";


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Server',
        href: web.dash.admin.server.store.add().url,
    },
];


export default function AddServerPage(request: any) {
    console.log(request);

    const csrfToken = request.csrf;
    const [server, setServers] = useState<ServerType>(request.server as ServerType ?? {});
    const [isFetch, setIsFetch] = useState(false);
    const [smsAction, setSmsAction] = useState<ServerActionType | undefined>(server.actions?.find((a) => a.action_key === 'sms'));
    const [smsReportAction, setSmsReportAction] = useState<ServerActionType | undefined>(server.actions?.find((a) => a.action_key === 'sms_report'));
    const [otpAction, setOtpAction] = useState<ServerActionType | undefined>(server.actions?.find((a) => a.action_key === 'otp'));
    const [otpReportAction, setOtpReportAction] = useState<ServerActionType | undefined>(server.actions?.find((a) => a.action_key === 'otp_report'));


    const server_info_schema = z.object({
        server_id: z.string("ระบบไม่พบรหัสเซิฟเวอร์ กรุณาลองใหม่อีกครั้ง"),
        server_name: z.string().min(1, "กรุณากรอกชื่อเว็บไซต์"),
        server_host: z.string("กรุณากรอกที่อยู่เซิฟเวอร์").min(1, "กรุณากรอกที่อยู่เซิฟเวอร์"),
        server_domain: z.string().optional().nullable(),
        actions: z.array(z.object({
            key: z.string(),
            endpoint: z.string().optional().nullable(),
            method: z.string().optional().nullable(),
            headers: z.array(z.record(z.string(), z.any())).optional(),
            body: z.array(z.record(z.string(), z.any())).optional(),
            response: z.array(z.record(z.string(), z.any())).optional(),
        })).optional(),
    });
    type FormValues = z.infer<typeof server_info_schema>;
    const defaultValues: FormValues = {
        server_id: server.id,
        server_name: server.name ?? '',
        server_host: server.host ?? '',
        server_domain: "",
        actions: [
            {
                key: 'sms',
                endpoint: smsAction?.endpoint ?? '',
                method: smsAction?.method ?? 'POST',
                headers: smsAction?.headers ?? [{ "Content-Type": "application/json" }],
                body: smsAction?.body ?? [
                    { "message": "message" },
                    { "sender": "" },
                    { "receiver": "" },
                    { "scheduled_at": "false" }
                ],
                response: smsAction?.response ?? [
                    { "status": "success" },
                    { "message": "message" },
                    { "ref_id": "campaign_id" }
                ],
            },
            {
                key: 'sms_report',
                endpoint: smsReportAction?.endpoint ?? '',
                method: smsReportAction?.method ?? 'POST',
                headers: smsReportAction?.headers ?? [{ "Content-Type": "application/json" }],
                body: smsReportAction?.body ?? [
                    { "message": "message" },
                    { "sender": "" },
                    { "receiver": "" },
                    { "scheduled_at": "false" }
                ],
                response: smsReportAction?.response ?? [
                    { "status": "success" },
                    { "message": "message" },
                    { "ref_id": "campaign_id" }
                ],
            },
            {
                key: 'otp',
                endpoint: otpAction?.endpoint ?? '',
                method: otpAction?.method ?? 'POST',
                headers: otpAction?.headers ?? [{ "Content-Type": "application/json" }],
                body: otpAction?.body ?? [
                    { "message": "message" },
                    { "sender": "" },
                    { "receiver": "" },
                    { "scheduled_at": "false" }
                ],
                response: otpAction?.response ?? [
                    { "status": "success" },
                    { "message": "message" },
                    { "ref_id": "campaign_id" }
                ],
            },
            {
                key: 'otp_report',
                endpoint: otpReportAction?.endpoint ?? '',
                method: otpReportAction?.method ?? 'POST',
                headers: otpReportAction?.headers ?? [{ "Content-Type": "application/json" }],
                body: otpReportAction?.body ?? [
                    { "message": "message" },
                    { "sender": "" },
                    { "receiver": "" },
                    { "scheduled_at": "false" }
                ],
                response: otpReportAction?.response ?? [
                    { "status": "success" },
                    { "message": "message" },
                    { "ref_id": "campaign_id" }
                ],
            }
        ],
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(server_info_schema),
        defaultValues,
        mode: "onChange",
    });

    const actionsFieldArray = useFieldArray({
        control: form.control,
        name: "actions",
    });

    const smsActionIndex = 0;
    const smsReportActionIndex = 1;
    const otpActionIndex = 2;
    const otpReportActionIndex = 3;

    const smsHeadersFieldArray = useFieldArray({
        control: form.control,
        name: `actions.${smsActionIndex}.headers`,
    });

    const smsBodyFieldArray = useFieldArray({
        control: form.control,
        name: `actions.${smsActionIndex}.body`,
    });

    const smsResponseFieldArray = useFieldArray({
        control: form.control,
        name: `actions.${smsActionIndex}.response`,
    });

    const otpHeadersFieldArray = useFieldArray({
        control: form.control,
        name: `actions.${otpActionIndex}.headers`,
    });

    const otpBodyFieldArray = useFieldArray({
        control: form.control,
        name: `actions.${otpActionIndex}.body`,
    });

    const otpResponseFieldArray = useFieldArray({
        control: form.control,
        name: `actions.${otpActionIndex}.response`,
    });

    const smsReportHeadersFieldArray = useFieldArray({
        control: form.control,
        name: `actions.${smsReportActionIndex}.headers`,
    });
    const smsReportBodyFieldArray = useFieldArray({
        control: form.control,
        name: `actions.${smsReportActionIndex}.body`,
    });
    const smsReportResponseFieldArray = useFieldArray({
        control: form.control,
        name: `actions.${smsReportActionIndex}.response`,
    });

    const otpReportHeadersFieldArray = useFieldArray({
        control: form.control,
        name: `actions.${otpReportActionIndex}.headers`,
    });
    const otpReportBodyFieldArray = useFieldArray({
        control: form.control,
        name: `actions.${otpReportActionIndex}.body`,
    });
    const otpReportResponseFieldArray = useFieldArray({
        control: form.control,
        name: `actions.${otpReportActionIndex}.response`,
    });

    function submit(formData: FormValues) {
        
        const fetchData = async () => {
            try {
                const way = api.admins.servers.store();
                const res = await fetch(way.url, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify(formData)
                });
                const result = await res.json();
                if (res.ok) {
                    toast.success(result.message);
                    router.reload();
                    router.visit(web.dash.admin.server.lists().url);
                } else {
                    toast.error(result.message, { description: result.description ?? '' });
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
                setIsFetch(false);
            }
        };

        fetchData();
        // console.log(formData);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <Form
                {...form}
            >
                <form onSubmit={form.handleSubmit(submit)}>
                    <div className="flex flex-col gap-4">
                        <div className="w-full flex justify-end">
                            <Button type="submit">บันทึก</Button>
                        </div>

                        <Card className="p-0 overflow-hidden">
                            <CardContent className="flex flex-col gap-4 p-0">
                                <Accordion type="single" defaultValue="item-1" collapsible >
                                    <AccordionItem value="item-1" className="bg-accent rounded-xl">
                                        <AccordionTrigger className="hover:no-underline p-4 bg-background rounded-xl">
                                            <CardHeader className="p-0">
                                                <CardTitle>ข้อมูลทั้วไป</CardTitle>
                                                <CardDescription>ข้อมูลเกี่ยวกับเซิฟเวอร์</CardDescription>
                                                {/* <CardDescription>{form.watch("server_id")}</CardDescription> */}
                                            </CardHeader>
                                        </AccordionTrigger>
                                        <AccordionContent className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-accent p-4">
                                            <FormField
                                                control={form.control}
                                                name="server_name"
                                                render={({ field, fieldState }) => (
                                                    <FormItem className="col-span-2 flex flex-col items-start">
                                                        <FormLabel>ชื่อเซิฟเวอร์หรือเว็บไซต์</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="ชื่อเซิฟเวอร์หรือเว็บไซต์" disabled={isFetch} {...field}></Input>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="server_host"
                                                render={({ field, fieldState }) => (
                                                    <FormItem className="col-span-2 flex flex-col items-start">
                                                        <FormLabel>ลิงก์หรือที่อยู่เซิฟเวอร์</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="ลิงก์หรือที่อยู่เซิฟเวอร์" disabled={isFetch} {...field}></Input>
                                                        </FormControl>
                                                        {fieldState.error ? (
                                                            <FormMessage />
                                                        ) : (
                                                            <FormDescription>
                                                            </FormDescription>
                                                        )}
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="server_domain"
                                                render={({ field, fieldState }) => (
                                                    <FormItem className="col-span-2 flex flex-col items-start">
                                                        <FormLabel>โดเมนเซิฟเวอร์หรือเว็บไซต์</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="โดเมนเซิฟเวอร์หรือเว็บไซต์" disabled={true} {...field} value={extractDomain(form.watch('server_host'))}></Input>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>

                        </Card>
                        <Card className="p-0 overflow-hidden">
                            <CardContent className="flex flex-col gap-4 p-0">
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="item-1" className="bg-accent rounded-xl">
                                        <AccordionTrigger className="hover:no-underline p-4 bg-background rounded-xl">
                                            <CardHeader className="p-0">
                                                <CardTitle>SMS</CardTitle>
                                                <CardDescription>การส่ง SMS</CardDescription>
                                            </CardHeader>
                                        </AccordionTrigger>
                                        <AccordionContent className="flex flex-col gap-4 bg-accent p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg">Actions</span>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <ActionSendCard
                                                    title="การส่ง"
                                                    description="การส่งข้อความไปยังเซิร์ฟเวอร์"
                                                    form={form}
                                                    actionIndex={smsActionIndex}
                                                    HeadersFieldArray={smsHeadersFieldArray}
                                                    BodyFieldArray={smsBodyFieldArray}
                                                    ResponseFieldArray={smsResponseFieldArray}
                                                    isFetch={isFetch}
                                                    action="sms"
                                                />
                                                <ActionSendCard
                                                    title="การรายงาน"
                                                    description="การตรวจสอบการส่ง"
                                                    form={form}
                                                    actionIndex={smsReportActionIndex}
                                                    HeadersFieldArray={smsReportHeadersFieldArray}
                                                    BodyFieldArray={smsReportBodyFieldArray}
                                                    ResponseFieldArray={smsReportResponseFieldArray}
                                                    isFetch={isFetch}
                                                    action="sms_report"
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                        {/* <Card className="p-0 overflow-hidden">
                            <CardContent className="flex flex-col gap-4 p-0">
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="item-1" className="bg-accent rounded-xl">
                                        <AccordionTrigger className="hover:no-underline p-4 bg-background rounded-xl">
                                            <CardHeader className="p-0">
                                                <CardTitle>OTP</CardTitle>
                                                <CardDescription>การส่ง OTP</CardDescription>
                                            </CardHeader>
                                        </AccordionTrigger>
                                        <AccordionContent className="flex flex-col gap-4 bg-accent p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg">Actions</span>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <ActionSendCard
                                                    title="การส่ง"
                                                    description="การส่งข้อความไปยังเซิร์ฟเวอร์"
                                                    form={form}
                                                    actionIndex={otpActionIndex}
                                                    HeadersFieldArray={otpHeadersFieldArray}
                                                    BodyFieldArray={otpBodyFieldArray}
                                                    ResponseFieldArray={otpResponseFieldArray}
                                                    isFetch={isFetch}
                                                    action="otp"
                                                />
                                                <ActionSendCard
                                                    title="การรายงาน"
                                                    description="การตรวจสอบการส่ง"
                                                    form={form}
                                                    actionIndex={otpReportActionIndex}
                                                    HeadersFieldArray={otpReportHeadersFieldArray}
                                                    BodyFieldArray={otpReportBodyFieldArray}
                                                    ResponseFieldArray={otpReportResponseFieldArray}
                                                    isFetch={isFetch}
                                                    action="otp_report"
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card> */}

                        <div className="w-full flex justify-end">
                            <Button type="submit">บันทึก</Button>
                        </div>

                    </div>
                </form>
            </Form>

        </AppLayout>
    );
}

interface ActionSendCardProps {
    title: string;
    description: string;
    form: any;
    actionIndex: number;
    HeadersFieldArray: any;
    BodyFieldArray: any;
    ResponseFieldArray: any;
    isFetch: boolean;
    action?: string;
}

function ActionSendCard({
    title,
    description,
    form,
    actionIndex,
    HeadersFieldArray,
    BodyFieldArray,
    ResponseFieldArray,
    isFetch,
    action = 'sms',
}: ActionSendCardProps) {

    const HeaderActionsSelectOptions = [
        { label: "Authorization", value: "Authorization" },
        { label: "Content-Type", value: "Content-Type" },
        { label: "Accept", value: "Accept" },
        { label: "User-Agent", value: "User-Agent" },
        { label: "Referer", value: "Referer" },
        { label: "Origin", value: "Origin" },
        { label: "x-api-key", value: "x-api-key" },
        { label: "api-key", value: "api-key" },
    ];

    const BodyActionsSelecOptions = [
        { label: "message", value: "message", isArray: false },
        { label: "receiver (X)", value: "receiver", isArray: false, },
        { label: "receivers", value: "receivers", isArray: false },
        { label: "sender", value: "sender", isArray: false },
        { label: "api_key", value: "api_key", isArray: false },
        { label: "username", value: "username", isArray: false },
        { label: "key", value: "key", isArray: false },
        { label: "now_date", value: "now_date", isArray: false },
        { label: "now_time", value: "now_time", isArray: false },
        { label: "scheduled_at(timestamp)", value: "scheduled_at", isArray: false },
        { label: "scheduled_at(time)", value: "scheduled_at_date", isArray: false },
        { label: "scheduled_at(date)", value: "scheduled_at_time", isArray: false },

        { label: "ref id", value: "ref_id" },
        { label: "campaign name", value: "campaign_name" },
        { label: "sender name", value: "sender_name" },
        { label: "limit", value: "limit" },
    ];

    const ResponsActionsSelecOptions = [
        { label: "status", value: "status" },
        { label: "message", value: "message" },
        { label: "ref id", value: "ref_id" },
        { label: "campaign name", value: "campaign_name" },
        { label: "sender name", value: "sender_name" },
        { label: "limit", value: "limit" },
        { label: "credit", value: "credit" },
        { label: "total receiver", value: "total_receiver" },
        { label: "sent", value: "sent" },
        { label: "success", value: "success" },
        { label: "failed", value: "failed" },
        { label: "pending", value: "pending" },
        { label: "credits refund", value: "credits_refund" },
    ];
    return (
        <Card className="p-0 overflow-hidden">
            <CardContent className="flex flex-col gap-4 p-0">
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1" className="bg-accent rounded-xl">
                        <AccordionTrigger className="hover:no-underline p-4 bg-background rounded-xl">
                            <CardHeader className="p-0">
                                <CardTitle>{title}</CardTitle>
                                <CardDescription>{description}</CardDescription>
                            </CardHeader>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 bg-accent p-4">

                            {/* SMS URL and Method */}
                            <div className="grid grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`actions.${actionIndex}.endpoint`}
                                    render={({ field, fieldState }: any) => (
                                        <FormItem className="col-span-2 flex flex-col items-start">
                                            <FormLabel>ลิงก์หรือที่อยู่เซิฟเวอร์</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://domain.com/*" disabled={isFetch} {...field}></Input>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`actions.${actionIndex}.method`}
                                    render={({ field }: any) => (
                                        <FormItem className="col-span-2 flex flex-col items-start">
                                            <FormLabel>วิธีการส่ง</FormLabel>

                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="เลือกประเภท" />
                                                    </SelectTrigger>
                                                </FormControl>

                                                <SelectContent>
                                                    <SelectItem value="GET">GET</SelectItem>
                                                    <SelectItem value="POST">POST</SelectItem>
                                                    <SelectItem value="PUT">PUT</SelectItem>
                                                    <SelectItem value="PATCH">PATCH</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Headers Section */}
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-lg">Headers</span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => HeadersFieldArray.append({ "": "" })}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {HeadersFieldArray.fields.length > 0 && (
                                    <div className="grid grid-cols-12 gap-4 mb-4">
                                        <span className="col-span-2 font-semibold text-sm">ค่าที่ระบบรองรับ</span>
                                        <span className="col-span-9 font-semibold text-sm">ค่าต้องรับ</span>
                                    </div>
                                )}

                                {HeadersFieldArray.fields.map((field: any, index: number) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-4 mb-4">
                                        <FormField
                                            control={form.control}
                                            name={`actions.${actionIndex}.headers.${index}`}
                                            render={({ field: fieldObj }: any) => {
                                                const headerKeys = Object.keys(fieldObj.value || {});
                                                const currentKey = headerKeys[0] || '';
                                                return (
                                                    <FormItem className="col-span-2 flex flex-col items-start">
                                                        <Select
                                                            onValueChange={(newKey) => {
                                                                const oldValue = fieldObj.value[currentKey];
                                                                const newValue = { [newKey]: oldValue };
                                                                fieldObj.onChange(newValue);
                                                            }}
                                                            value={currentKey}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="เลือก Header" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {HeaderActionsSelectOptions.map((option, idx) => (
                                                                    <SelectItem key={`header-${idx}`} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`actions.${actionIndex}.headers.${index}`}
                                            render={({ field: fieldObj }: any) => {
                                                const headerKeys = Object.keys(fieldObj.value || {});
                                                const currentKey = headerKeys[0] || '';
                                                return (
                                                    <FormItem className="col-span-9 flex flex-col items-start">
                                                        <FormControl>
                                                            <Input
                                                                placeholder="ค่า Header"
                                                                value={fieldObj.value?.[currentKey] || ''}
                                                                onChange={(e) => {
                                                                    fieldObj.onChange({ [currentKey]: e.target.value });
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            className="h-11"
                                            onClick={() => HeadersFieldArray.remove(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Body Section */}
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-lg">Body</span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => BodyFieldArray.append({ "": "" })}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {BodyFieldArray.fields.length > 0 && (
                                    <div className="grid grid-cols-12 gap-4 mb-4">
                                        <span className="col-span-2 font-semibold text-sm">ค่าที่ระบบรองรับ</span>
                                        <span className="col-span-8 font-semibold text-sm">ค่าที่ระบบรองรับ</span>
                                        <span className="col-span-1 font-semibold text-sm text-center">Array</span>
                                    </div>
                                )}

                                {BodyFieldArray.fields.map((field: any, index: number) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-4 mb-4">
                                        <FormField
                                            control={form.control}
                                            name={`actions.${actionIndex}.body.${index}`}
                                            render={({ field: fieldObj }: any) => {
                                                const bodyKey = Object.keys(fieldObj.value || {})[0] || '';
                                                return (
                                                    <FormItem className="col-span-2 flex flex-col items-start">
                                                        <Select
                                                            onValueChange={(newKey) => {
                                                                const oldValue = fieldObj.value[bodyKey];
                                                                const newValue = { [newKey]: oldValue };
                                                                fieldObj.onChange(newValue);
                                                            }}
                                                            value={bodyKey}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="เลือก Parameter" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {BodyActionsSelecOptions.map((option, idx) => (
                                                                    <SelectItem key={`body-${idx}`} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`actions.${actionIndex}.body.${index}`}
                                            render={({ field: fieldObj }: any) => {
                                                const bodyKey = Object.keys(fieldObj.value || {})[0] || '';
                                                return (
                                                    <FormItem className="col-span-8 flex flex-col items-start">
                                                        <FormControl>
                                                            <Input
                                                                placeholder="ค่า Parameter"
                                                                value={fieldObj.value?.[bodyKey] || ''}
                                                                onChange={(e) => {
                                                                    fieldObj.onChange({ [bodyKey]: e.target.value });
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`actions.${actionIndex}.body.${index}`}
                                            render={({ field: fieldObj }: any) => {
                                                return (
                                                    <FormItem className="col-span-1 flex flex-row items-start justify-center pt-4">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={false}
                                                                onCheckedChange={() => {}}
                                                                disabled
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            className="h-11"
                                            onClick={() => BodyFieldArray.remove(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-lg">Response</span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => ResponseFieldArray.append({ "": "" })}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {ResponseFieldArray.fields.length > 0 && (
                                    <div className="grid grid-cols-12 gap-4 mb-4">
                                        <span className="col-span-2 font-semibold text-sm">ค่าที่ระบบรองรับ</span>
                                        <span className="col-span-9 font-semibold text-sm">ค่าต้องรับ</span>
                                    </div>
                                )}

                                {ResponseFieldArray.fields.map((field: any, index: number) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-4 mb-4">
                                        <FormField
                                            control={form.control}
                                            name={`actions.${actionIndex}.response.${index}`}
                                            render={({ field: fieldObj }: any) => {
                                                const respKey = Object.keys(fieldObj.value || {})[0] || '';
                                                return (
                                                    <FormItem className="col-span-2 flex flex-col items-start">
                                                        <Select
                                                            onValueChange={(newKey) => {
                                                                const oldValue = fieldObj.value[respKey];
                                                                const newValue = { [newKey]: oldValue };
                                                                fieldObj.onChange(newValue);
                                                            }}
                                                            value={respKey}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="เลือก Response" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {ResponsActionsSelecOptions.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`actions.${actionIndex}.response.${index}`}
                                            render={({ field: fieldObj }: any) => {
                                                const respKey = Object.keys(fieldObj.value || {})[0] || '';
                                                return (
                                                    <FormItem className="col-span-9 flex flex-col items-start">
                                                        <FormControl>
                                                            <Input
                                                                placeholder="ชื่อ parameter ที่จะรับ"
                                                                value={fieldObj.value?.[respKey] || ''}
                                                                onChange={(e) => {
                                                                    fieldObj.onChange({ [respKey]: e.target.value });
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            className="h-11"
                                            onClick={() => ResponseFieldArray.remove(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}
