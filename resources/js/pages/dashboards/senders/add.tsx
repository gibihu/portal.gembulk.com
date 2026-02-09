import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { GetServerByUser } from "@/models/servers/get";
import api from "@/routes/api";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { ServerType, UserType } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Head, Link } from "@inertiajs/react";
import { Loader, Trash } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

// ... existing code ...

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Add Sender",
        href: web.dashboard.senders.add().url,
    },
];

export default function AddSenderPage(request: any) {
    const csrfToken = request.csrf;
    const [requestId, setRequestId] = useState<string>((request.sender.id ?? "").toString());
    const [isFetch, setIsFetch] = useState<boolean>(false);
    const [user, setUser] = useState<UserType>(request.auth ? (request.auth.user ?? {}) : {});
    const [servers, setServers] = useState<ServerType[]>([]);
    const [selectedServer, setSelectedServer] = useState<ServerType | null>(servers?.length > 0 ? servers[0] : null);

    const [openMoreCaution, setOpenMoreCaution] = useState(false);

    const SHORTENER_HOSTS = useMemo(
        () => new Set(["bit.ly", "shorturl.at", "tinyurl.com", "t.co", "rebrand.ly", "cutt.ly", "s.id", "is.gd", "rb.gy"]),
        []
    );

    const senderSchema = z
        .object({
            request_id: z.string({ message: "ระบบไม่พบรหัสคำขอ กรุณาลองใหม่อีกครั้ง" }),
            name: z
                .string()
                .min(4, "ชื่อผู้ส่งต้องมีความยาวอย่างน้อย 4 ตัวอักษร")
                .max(11, "ชื่อผู้ส่งต้องมีความยาวไม่เกิน 11 ตัวอักษร")
                .regex(/^[A-Za-z0-9._-]+$/, "ชื่อผู้ส่งใช้ได้เฉพาะตัวเลข/อังกฤษ และ . - _ เท่านั้น (ห้ามเว้นวรรค)")
                .refine((v) => !/^\d{9,15}$/.test(v), "ไม่สามารถใช้หมายเลขโทรศัพท์เป็นชื่อผู้ส่งได้"),
            objective: z.string().min(1, "กรุณากรอกวัตถุประสงค์"),
            type: z.enum(["with_link", "without_link"], { message: "กรุณาเลือกประเภท" }),
            link: z.string().optional().nullable(),
            sample_message: z.string().min(1, "กรุณากรอกข้อความตัวอย่าง"),
        })
        .superRefine((data, ctx) => {
            const rawLink = (data.link ?? "").trim();

            if (data.type === "with_link") {
                if (!rawLink) {
                    ctx.addIssue({ code: "custom", path: ["link"], message: "กรุณากรอกลิงก์ที่ต้องการลงทะเบียน" });
                }

                if (!/https?:\/\/\S+/i.test(data.sample_message)) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["sample_message"],
                        message: "ข้อความตัวอย่าง (ประสงค์แนบลิงก์) ต้องมีลิงก์อยู่ในข้อความ เช่น https://google.com/",
                    });
                }
            }

            if (data.type === "without_link") {
                if (/https?:\/\/\S+/i.test(data.sample_message)) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["sample_message"],
                        message: "ข้อความตัวอย่าง (ไม่ประสงค์แนบลิงก์) ห้ามมีลิงก์อยู่ในข้อความ",
                    });
                }
            }

            if (rawLink) {
                let u: URL | null = null;
                try {
                    u = new URL(rawLink);
                } catch {
                    ctx.addIssue({ code: "custom", path: ["link"], message: "กรุณากรอกลิงก์ให้ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)" });
                    return;
                }

                const host = u.hostname.replace(/^www\./, "").toLowerCase();

                // ห้ามเป็นลิงก์ของ LINE
                if (host.includes("line.me") || host.includes("lin.ee") || host.includes("line.biz")) {
                    ctx.addIssue({ code: "custom", path: ["link"], message: "ห้ามเป็นลิงก์ของ LINE" });
                }

                // ห้ามเป็นลิงก์ที่ผ่านการทำ Shorten
                if (SHORTENER_HOSTS.has(host)) {
                    ctx.addIssue({ code: "custom", path: ["link"], message: "ห้ามเป็นลิงก์ที่ผ่านการทำ Shorten (เช่น bitly, shorturl)" });
                }
            }
        });

    type FormValues = z.infer<typeof senderSchema>;

    const defaultValues: FormValues = {
        request_id: requestId,
        name: "",
        objective: "",
        type: "without_link",
        link: "",
        sample_message: "",
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(senderSchema),
        defaultValues,
        mode: "onChange",
    });

    useEffect(() => {
        const fetchServers = async () => {
            const serversData = await GetServerByUser(["with=senders"], setIsFetch);

            setServers(serversData);
            setSelectedServer(serversData.length > 0 ? serversData[0] : null);

            if (serversData.length == 0) {
                setIsFetch(true);
                toast.error("ไม่พบเซิฟเวอร์", { description: "ระบบไม่พบเซิฟเวอร์ กรุณาซื้อแพ็กเกจ" });
            }
        };

        fetchServers();
    }, []);

    function submit(field: FormValues) {
        const fetchData = async () => {
            setIsFetch(true);
            try {
                const way = api.senders.request();

                const payloadContent = JSON.stringify({
                    objective: field.objective,
                    type: field.type,
                    link: (field.link ?? "").trim(),
                    sample_message: field.sample_message,
                });

                const formData = new FormData();
                formData.append("request_id", field.request_id);
                if (selectedServer?.id) {
                    formData.append("server_id", selectedServer.id.toString());
                }
                formData.append("name", field.name);
                formData.append("content", payloadContent);

                const response = await fetch(way.url, {
                    method: way.method,
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: formData,
                });

                const res = await response.json();
                if (response.ok) {
                    setServers((prev) =>
                        prev.map((server) =>
                            server.id === selectedServer?.id
                                ? {
                                    ...server,
                                    senders: [...(server.senders || []), res.data],
                                }
                                : server
                        )
                    );

                    form.reset({ ...defaultValues, request_id: requestId });
                    toast.success("ส่งคำขอเรียบร้อย");
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.error("Error submitting form:", error);
                toast.error("เกิดข้อผิดพลาดในการส่งคำขอ");
            } finally {
                setIsFetch(false);
            }
        };

        fetchData();
    }

    const selectedType = form.watch("type");

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(submit)}>
                        <div className="flex flex-col gap-4">
                            <div className="w-full flex justify-between items-center hidden">
                                <Select defaultValue={servers?.[0]?.id?.toString()} value={selectedServer?.id.toString()}>
                                    <SelectTrigger className="w-[180px] bg-background">
                                        <SelectValue placeholder="เลือกเซิฟเวอร์" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {servers.map((server: any) => (
                                                <SelectItem key={server.id} value={server.id.toString()}>
                                                    {server.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>ขอชื่อผู้ส่ง (Sender)</CardTitle>
                                    <CardDescription>ข้อมูลผู้ส่งสำหรับเซิฟเวอร์ {selectedServer?.name}</CardDescription>
                                </CardHeader>

                                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* ซ้าย: ชื่อ form */}
                                    <div className="flex flex-col gap-4">
                                        {!user.verified_at && (
                                            <div className="rounded-md border bg-muted/20 p-4 text-sm">
                                                <div className="font-semibold">ยืนยันตัวตน</div>
                                                <div className="mt-1 text-muted-foreground">
                                                    ก่อนขอชื่อผู้ส่ง ต้องทำการยืนยันตัวตนก่อน{" "}
                                                    <Link className="text-primary underline" href={web.dashboard.users.verify().url}>
                                                        คลิกที่นี่
                                                    </Link>
                                                </div>
                                            </div>
                                        )}

                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="ชื่อผู้ส่ง" disabled={isFetch} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="objective"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea className="h-24" placeholder="วัตถุประสงค์" disabled={isFetch} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Select value={field.value} onValueChange={field.onChange} disabled={isFetch}>
                                                            <SelectTrigger className="bg-background">
                                                                <SelectValue placeholder="เลือกประเภท" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectItem value="with_link">ประสงค์แนบลิงก์</SelectItem>
                                                                    <SelectItem value="without_link">ไม่ประสงค์แนบลิงก์</SelectItem>
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="link"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="ลิงก์ที่ต้องการลงทะเบียน (เช่น https://google.com/)"
                                                            disabled={isFetch}
                                                            {...field}
                                                            value={field.value ?? ""}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="sample_message"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea
                                                            className="h-28"
                                                            placeholder={
                                                                selectedType === "with_link"
                                                                    ? "ข้อความตัวอย่าง (เช่น ขายไก่ชนราคาถูก https://google.com/)"
                                                                    : "ข้อความตัวอย่าง (เช่น ขายไก่ชนราคาถูก)"
                                                            }
                                                            disabled={isFetch}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="w-full flex justify-end">
                                            <Button type="submit" disabled={isFetch}>
                                                {isFetch ? <Loader className="animate-spin" /> : "ส่งคำขอ"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* ขวา: รายละเอียดเงื่อนไข */}
                                    <div className="rounded-md border p-4 text-sm">
                                        <div className="font-semibold">เงื่อนไขการขอชื่อผู้ส่ง</div>

                                        <div className="mt-4">
                                            <div className="font-semibold">ชื่อผู้ส่ง</div>
                                            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                                                <li>เป็นตัวเลข ภาษาอังกฤษ หรืออักขระพิเศษ ตั้งแต่ 4-11 ตัวอักษร สามารถใช้ ., -, _ ได้</li>
                                                <li>ไม่สามารถใช้หมายเลขโทรศัพท์, เว้นวรรค หรือชื่อเครื่องหมายการค้า/ทรัพย์สินทางปัญญาของบุคคลอื่น</li>
                                            </ul>
                                        </div>

                                        <div className="mt-4">
                                            <div className="font-semibold">ประเภท</div>
                                            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                                                <li>
                                                    <span className="font-medium text-foreground">ประสงค์แนบลิงก์:</span> ส่งข้อความที่มีลิงก์อยู่ในข้อความ
                                                </li>
                                                <li>
                                                    <span className="font-medium text-foreground">ไม่ประสงค์แนบลิงก์:</span> ส่งข้อความที่ไม่มีลิงก์อยู่ในข้อความ
                                                </li>
                                                <li>ห้ามใช้ผิดวัตถุประสงค์ มิฉะนั้นอาจถูกระงับการใช้งาน</li>
                                            </ul>
                                        </div>

                                        <div className="mt-4">
                                            <div className="font-semibold">ลิงก์ที่ต้องการลงทะเบียน</div>
                                            <div className="mt-2 text-muted-foreground">
                                                ควรสอดคล้องกับชื่อผู้ส่ง เช่น ชื่อผู้ส่ง: <span className="font-medium text-foreground">SENDER</span>, ลิงก์:{" "}
                                                <span className="font-medium text-foreground">https://google.com/</span>
                                            </div>

                                            <div className="mt-3 font-semibold">ข้อควรระวังในการวางลิงก์</div>
                                            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                                                <li>ห้ามเป็นลิงก์ของ LINE</li>
                                                <li>ห้ามเป็นลิงก์ที่ผ่านการทำ Shorten (bitly, shorturl)</li>
                                            </ul>
                                        </div>

                                        <div className="mt-4">
                                            <div className="font-semibold">ข้อความตัวอย่าง</div>
                                            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                                                <li>
                                                    <span className="font-medium text-foreground">แบบไม่ประสงค์แนบลิงก์:</span> กรุณากรอกข้อความตัวอย่าง เช่น ขายไก่ชนราคาถูก
                                                </li>
                                                <li>
                                                    <span className="font-medium text-foreground">แบบประสงค์แนบลิงก์:</span> กรุณากรอกข้อความตัวอย่าง เช่น ขายไก่ชนราคาถูก https://google.com/
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="mt-4">
                                            <div className="font-semibold">ข้อควรระวัง</div>
                                            <div className="mt-2 text-muted-foreground">
                                                ผู้ใช้บริการต้องไม่ส่งข้อความในลักษณะที่เป็นการรบกวนผู้อื่น หรือเข้าข่ายเป็น SMS Spam เช่น ข้อความชักชวนการเล่นพนัน, ข้อความหยาบคาย, ข่มขู่ หรือหลอกลวงแอบอ้าง
                                                หากพบว่ามีการใช้บริการในลักษณะดังกล่าว ทางระบบอาจระงับการใช้งานทันที{" "}
                                                <Button type="button" variant="link" className="h-auto p-0 align-baseline" onClick={() => setOpenMoreCaution(true)}>
                                                    ดูเพิ่มเติม
                                                </Button>
                                            </div>
                                        </div>

                                        <Dialog open={openMoreCaution} onOpenChange={setOpenMoreCaution}>
                                            <DialogContent className="max-w-lg">
                                                <DialogHeader>
                                                    <DialogTitle>ข้อควรระวังเพิ่มเติม</DialogTitle>
                                                </DialogHeader>
                                                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                                    <li>ห้ามส่งข้อความที่มีเนื้อหาเกี่ยวกับการพนัน, ยาเสพติด, หรือสิ่งผิดกฎหมาย</li>
                                                    <li>ห้ามส่งข้อความที่มีเนื้อหาหลอกลวง, ข่มขู่, หรือสร้างความเดือดร้อนให้ผู้อื่น</li>
                                                    <li>ห้ามส่งข้อความที่มีเนื้อหาหยาบคาย หรือไม่เหมาะสม</li>
                                                    <li>ห้ามส่งข้อความที่ละเมิดสิทธิ์หรือทรัพย์สินทางปัญญาของบุคคลอื่น</li>
                                                    <li>หากพบการกระทำผิด ทางระบบขอสงวนสิทธิ์ในการระงับการใช้งานทันทีโดยไม่ต้องแจ้งล่วงหน้า</li>
                                                </ul>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
