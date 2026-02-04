import { Code } from "@/components/custom_ui/code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { DateHelper } from "@/lib/date";
import { GetServerByUser } from "@/models/servers/get";
import api from "@/routes/api";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { ApiKeyType } from "@/types/api";
import { SenderType, ServerType } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Head, Link } from "@inertiajs/react";
import { is } from "date-fns/locale";
import { BookMarked, Copy, Edit, Info, Loader, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'ส่งแล้ว',
        href: web.dashboard.report.sms().url,
    },
];

// API Key Form Schema
const apiKeyFormSchema = z.object({
    id: z.string().optional().nullable(),
    api_key: z.string().min(1, "API Key ต้องไม่ว่าง"),
    template: z.string(),
    options: z.record(z.string(), z.boolean()),
    permissions: z.record(z.string(), z.any()),
});

type ApiKeyFormType = z.infer<typeof apiKeyFormSchema>;

export default function OtpTemplatePage(request: any) {
    console.log(request);

    const csrfToken = request.csrf;
    const [isFetch, setIsFetch] = useState<boolean>(false);
    const [apiKeys, setApikeys] = useState<ApiKeyType[]>(request.apiKeys ?? []);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [showConfirmRegen, setShowConfirmRegen] = useState<boolean>(false);
    const [servers, setServers] = useState<ServerType[]>([]);
    const [senders, setSenders] = useState<SenderType[]>([]);


    useEffect(() => {
        const fetchServers = async () => {
            const serversData = await GetServerByUser(['with=senders'], setIsFetch);
            if (serversData.length == 0) {
                setIsFetch(true);
                toast.error('ไม่พบเซิฟเวอร์', { description: "ระบบไม่พบเซิฟเวอร์ กรุณาซื้อแพ็กเกจ" });
            } else {
                setServers(serversData);
                setSenders(serversData[0].senders || []);
            }


        };

        fetchServers();
    }, []);

    const apiKeyForm = useForm<ApiKeyFormType>({
        resolver: zodResolver(apiKeyFormSchema),
        defaultValues: {
            id: null,
            api_key: "",
            template: "",
            options: {},
            permissions: {},
        },
    });

    const submit = async (data: ApiKeyFormType) => {
        setIsFetch(true);
        try {
            // ส่งข้อมูล form ไปให้ onSubmit
            await onSubmit(data, editingIndex);
            setIsDialogOpen(false);
            apiKeyForm.reset();
            setEditingIndex(null);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsFetch(false);
        }
    };

    const onSubmit = async (data: ApiKeyFormType, index: number | null) => {
        setIsFetch(true);
        try {
            const way = api.keys.store();
            const res = await fetch(way.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken,
                },
                body: JSON.stringify({
                    id: data.id,
                    token: data.api_key,
                    template: data.template,
                    options: data.options,
                    permissions: data.permissions,
                }),
            });
            const json = await res.json();
            if (res.ok) {
                const savedKey = json.data as ApiKeyType;
                let updatedKeys = [...apiKeys];
                if (index !== null) {
                    // แก้ไขรายการที่มีอยู่
                    updatedKeys[index] = savedKey;
                } else {
                    // เพิ่มรายการใหม่
                    updatedKeys.push(savedKey);
                }
                setApikeys(updatedKeys);
                toast.success("บันทึก API Key เรียบร้อยแล้ว");
            } else {
                toast.error(json.message || "เกิดข้อผิดพลาดในการบันทึก API Key");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("เกิดข้อผิดพลาดในการบันทึก API Key");
        } finally {
            setIsFetch(false);
        }
    };

    const callNewToken = async () => {
        setIsFetch(true);
        try {
            const way = api.keys.generate();
            const res = await fetch(way.url);
            const json = await res.json();
            const newKey = json.data;
            apiKeyForm.setValue("api_key", newKey);
            setShowConfirmRegen(false);
        } catch (error) {
            console.error("Error regenerating token:", error);
        } finally {
            setIsFetch(false);
        }
    };

    const openAddDialog = () => {
        console.log(servers);
        if (servers.length !== 0 || servers != null) {
            setEditingIndex(null);
            apiKeyForm.reset({
                id: null,
                api_key: "",
                template: "",
                options: {
                    option_1: false,
                },
                permissions: {
                    read: false,
                    write: false,
                    senders: [],
                },
            });
            callNewToken();
            setShowConfirmRegen(false);
            setIsDialogOpen(true);
        }
    };

    const optionsList = {
        option_1: "Option 1",
        option_2: "Option 2",
    };

    const openEditDialog = (index: number) => {
        const apiKey = apiKeys[index];
        setEditingIndex(index);
        apiKeyForm.reset({
            id: apiKey.id,
            api_key: apiKey.token || "",
            template: apiKey.template || "",
            options: apiKey.options || optionsList,
            permissions: apiKey.permissions || { senders: [] },
        });
        setShowConfirmRegen(false);
        setIsDialogOpen(true);
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="API Keys Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">
                {/* API Keys Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>API Keys</CardTitle>
                            <CardDescription>จัดการ API Keys ของคุณ</CardDescription>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <div className="flex gap-2">
                                    <Button onClick={openAddDialog} className="gap-2">
                                        {isFetch ? <Loader className="size-4 animate-spin" /> : <Plus className="size-4" />}
                                        เพิ่ม API Key
                                    </Button>
                                    <Link href={web.dashboard.api.docs().url}>
                                        <Button variant="outline">
                                            <BookMarked className="size-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingIndex !== null ? "แก้ไข API Key" : "สร้าง API Key ใหม่"}
                                    </DialogTitle>
                                </DialogHeader>

                                <Form {...apiKeyForm}>
                                    <form onSubmit={apiKeyForm.handleSubmit(submit)} className="space-y-4">
                                        {/* API Key Field */}
                                        <FormField
                                            control={apiKeyForm.control}
                                            name="api_key"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>API Key</FormLabel>
                                                    <div className="flex gap-2">
                                                        <FormControl className="flex-1">
                                                            <Input
                                                                {...field}
                                                                readOnly
                                                                type="text"
                                                            />
                                                        </FormControl>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-11"
                                                            disabled={isFetch}
                                                            onClick={() => {
                                                                if (showConfirmRegen) {
                                                                    callNewToken();
                                                                } else {
                                                                    setShowConfirmRegen(true);
                                                                }
                                                            }}
                                                        >
                                                            {isFetch ? <Loader className="size-4 animate-spin" /> : (showConfirmRegen ? "ยืนยัน" : "Regenerate")}
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Description Field */}
                                        <FormField
                                            control={apiKeyForm.control}
                                            name="template"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex gap-2">
                                                        Template
                                                        <Dialog>
                                                            <DialogTrigger>
                                                                <Info className="size-4 text-gray-500" />
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>รูปแบบการแทนค่า</DialogTitle>
                                                                    <DialogDescription>
                                                                        <Code>{"{{ref_id}}"} : รหัสอ้างอิง</Code>
                                                                        <Code>{"{{otp_code}}"} : รหัส OTP</Code>
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="{{otp_code}}..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Options Checkboxes */}
                                        <FormItem>
                                            <FormLabel>ตัวเลือก</FormLabel>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id="otp"
                                                        checked={apiKeyForm.watch("options.otp") ?? false}
                                                        onCheckedChange={(checked) => {
                                                            apiKeyForm.setValue(
                                                                "options.otp",
                                                                checked as boolean
                                                            );
                                                        }}
                                                    />
                                                    <label htmlFor="otp">OTP</label>
                                                </div>
                                            </div>
                                        </FormItem>

                                        {/* Permissions Checkboxes */}
                                        <FormItem>
                                            <FormLabel>สิทธิ์</FormLabel>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id="perm_read"
                                                        checked={apiKeyForm.watch("permissions.read") ?? false}
                                                        onCheckedChange={(checked) => {
                                                            apiKeyForm.setValue(
                                                                "permissions.read",
                                                                checked as boolean
                                                            );
                                                        }}
                                                    />
                                                    <label htmlFor="perm_read">อ่าน (Read)</label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id="perm_write"
                                                        checked={apiKeyForm.watch("permissions.write") ?? false}
                                                        onCheckedChange={(checked) => {
                                                            apiKeyForm.setValue(
                                                                "permissions.write",
                                                                checked as boolean
                                                            );
                                                        }}
                                                    />
                                                    <label htmlFor="perm_write">เขียน (Write)</label>
                                                </div>
                                            </div>
                                        </FormItem>

                                        {/* Senders Toggle */}
                                        <FormItem>
                                            <FormLabel>ผู้ส่ง</FormLabel>
                                            <div className="space-y-2">
                                                {senders.length === 0 ? (
                                                    <p className="text-sm text-gray-500">ไม่พบผู้ส่ง</p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {senders.map((sender) => {
                                                            const currentSenders = apiKeyForm.watch("permissions.senders") ?? [];
                                                            const isSelected = currentSenders.includes(sender.id);
                                                            return (
                                                                <Button
                                                                    key={sender.id}
                                                                    type="button"
                                                                    variant={isSelected ? "default" : "outline"}
                                                                    size="sm"
                                                                    className="border"
                                                                    onClick={() => {
                                                                        const sendersList = apiKeyForm.watch("permissions.senders") ?? [];
                                                                        if (isSelected) {
                                                                            // Remove sender
                                                                            apiKeyForm.setValue(
                                                                                "permissions.senders",
                                                                                sendersList.filter((id: string) => id !== sender.id)
                                                                            );
                                                                        } else {
                                                                            // Add sender
                                                                            apiKeyForm.setValue(
                                                                                "permissions.senders",
                                                                                [...sendersList, sender.id]
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    {sender.name}
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </FormItem>

                                        {/* Submit Button */}
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsDialogOpen(false)}
                                            >
                                                ยกเลิก
                                            </Button>
                                            <Button type="submit" disabled={isFetch || servers.length == 0}>
                                                {(isFetch || servers.length == 0) ? <Loader className="animate-spin" /> : "บันทึก"}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="w-full text-sm">
                                <TableHeader>
                                    <TableRow className="border-b">
                                        <TableHead className="text-left py-2 px-4">API Key</TableHead>
                                        <TableHead className="text-left py-2 px-4">Template</TableHead>
                                        <TableHead className="text-left py-2 px-4">สร้างเมื่อ</TableHead>
                                        <TableHead className="text-right py-2 px-4">การกระทำ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {apiKeys.length === 0 ? (
                                        <TableRow>
                                            <TableHead colSpan={4} className="text-center py-4 text-gray-500">
                                                ไม่มี API Key
                                            </TableHead>
                                        </TableRow>
                                    ) : (
                                        apiKeys.map((key, index) => (
                                            <TableRow key={index} className="border-b hover:bg-gray-50">
                                                <TableHead className="py-2 px-4 font-mono text-xs">
                                                    {key.token?.substring(0, 20)}...
                                                </TableHead>
                                                <TableHead className="py-2 px-4 text-gray-600">
                                                    {key.template || "-"}
                                                </TableHead>
                                                <TableHead className="py-2 px-4 text-gray-600">
                                                    {DateHelper.format(key.created_at) || "-"}
                                                </TableHead>
                                                <TableHead className="py-2 px-4 text-right flex gap-2 justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(key.token || "");
                                                            toast.success("คัดลอก API Key แล้ว");
                                                        }}
                                                    >
                                                        <Copy className="size-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openEditDialog(index)}
                                                    >
                                                        <Edit className="size-4" />
                                                    </Button>
                                                </TableHead>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}