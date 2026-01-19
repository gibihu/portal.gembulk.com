import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { normalizePhones } from "@/lib/phone-filter";
import { useDetectSpamWord } from "@/lib/spam-word";
import { toTimestamp } from "@/lib/timestamp";
import { GetServerByUser } from "@/models/servers/get";
import api from "@/routes/api";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { PlanType, SenderType, ServerType, UserType } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Head, router, usePage } from "@inertiajs/react";
import { addYears } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'ส่ง sms',
        href: web.dash.sending.sms.add().url,
    },
];
export default function SmsAddPage(request: any) {

    const csrfToken = request.csrf;
    const [servers, setServers] = useState<ServerType[]>([]);
    const [isFetch, setIsFetch] = useState<boolean>(false);
    const [countReceivers, setCountReceivers] = useState<number>(0);
    const [phoneAfterFilter, setPhoneAfterFilter] = useState<string[]>([]);
    const [hasBadWord, setHasBadWord] = useState<boolean>(false);
    const [detectdBadWord, setDetecBadWord] = useState<string[]>([]);

    useEffect(() => {
        const fetchServers = async () => {
            const serversData = await GetServerByUser(['with=senders'], setIsFetch);

            setServers(serversData);
        };

        fetchServers();
    }, []);

    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // บวก 5 นาที

    const schema = z.object({
        sender: z.string().min(1, { message: "ห้ามว่าง" }),
        receivers: z.string().min(1, { message: "ห้ามว่าง" }),
        msg: z.string({ message: "กรุณากรอกข้อความ" }).min(0, { message: "ต้องมีข้อความอย่างน้อย 1 ตัวอักษร" }),
        phone_counts: z.number(),
        is_scheduled: z.boolean(),
        scheduled_date: z.date().optional(),
        scheduled_time: z.string().optional(),
    });
    type FormValues = z.infer<typeof schema>;
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            sender: servers[0]?.senders?.[0]?.id,
            receivers: '',
            phone_counts: countReceivers,
            is_scheduled: true,
            scheduled_date: new Date(),
            scheduled_time: now.toTimeString().slice(0, 5),
        },
        mode: "onChange",
    });
    const watchedReceivers = form.watch("receivers");

    useEffect(() => {
        const p = normalizePhones(watchedReceivers ?? '');
        setPhoneAfterFilter(p);
        setCountReceivers(p.length);
    }, [watchedReceivers]); // watch ค่าแล้วใส่ dependency เป็นตัวแปร

    function submit(data: FormValues) {
        const fetchData = async () => {
            try {
                const res = await fetch(api.sms.create().url, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify({
                        sender_id: data.sender,
                        server_id: servers[0].id,
                        receivers: phoneAfterFilter,
                        msg: data.msg,
                        msg_length: data.msg.length,
                        cost: data.msg.length > 70 ? 2 : 1,
                        phone_counts: countReceivers,
                        is_scheduled: data.is_scheduled,
                        scheduled_at: toTimestamp(data.scheduled_date ?? '', data.scheduled_time),
                    })
                });

                const result = await res.json();
                if (result.code == 201) {
                    toast.success(result.message);
                    router.reload();
                    form.reset();
                    router.visit(web.dash.jobs.sms().url);
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
        }
        if (countReceivers > 0) {
            const detectd = useDetectSpamWord(data.msg, request.spam_word);
            console.log(detectd);
            if (detectd.length > 0) {
                setHasBadWord(true);
                setDetecBadWord(detectd as string[]);
            } else {
                setDetecBadWord([]);
                fetchData();
            }
        } else {
            form.setError('receivers', {
                type: 'manual',      // ประเภท error
                message: 'ไม่พบเบอร์โทร', // ข้อความที่จะแสดง
            });
        }
    }

    const is_scheduled = form.watch('is_scheduled');


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col mb-4">
                <span className="text-2xl">ส่งข้อความ</span>
                <span>เลือกชื่อผู้ส่ง กรอกเบอร์ผู้รับ และกำหนดข้อความที่ต้องการส่ง</span>
            </div>

            <Form
                {...form}
            >
                <form onSubmit={form.handleSubmit(submit)}>
                    <Card className="px-4 shadow-lg">
                        <FormField
                            control={form.control}
                            name="sender"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>รหัสผู้ส่ง</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a fruit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {servers.map((server: ServerType, index: number) => (
                                                    <SelectGroup key={index}>
                                                        {server.senders?.map((sender: SenderType, key: number) => (
                                                            sender.status_text == 'active' && (
                                                                <SelectItem key={key} value={sender.id.toString()}>
                                                                    {sender.name}
                                                                </SelectItem>
                                                            )
                                                        ))}
                                                    </SelectGroup>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="receivers"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>หมายเลขโทนศัพมือถือ</FormLabel>
                                    <FormControl>
                                        <Textarea className="h-24" placeholder="098...." disabled={isFetch} {...field}></Textarea>
                                    </FormControl>
                                    <FormDescription className="w-full flex gap-4 justify-between">
                                        <span>สามารเพิ่มเบอร์ได้มากกว่าา 1 เบอร์โดยใช้ <span className="bg-primary/50 text-primary-foreground rounded-full py-0 px-0.5">,</span> <span className="bg-primary/50 text-primary-foreground rounded-full py-0 px-0.5">;</span> หรือ <span className="bg-primary/50 text-primary-foreground rounded-full py-0 px-0.5">Enter</span> เพื่มเพิ่มเบอร์</span>
                                        <span>{countReceivers} รายการ</span>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="msg"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>ข้อความ</FormLabel>
                                    <FormControl>
                                        <Textarea className="h-24" placeholder="e.g Hello World!...." disabled={isFetch} {...field}></Textarea>
                                    </FormControl>
                                    <div className="w-full flex justify-between gap-4">
                                        {!fieldState.error ? (
                                            <FormDescription>
                                                ข้อความากกว่า 70 อักษรจะคิด 2 เครดิต
                                            </FormDescription>
                                        ) : (
                                            <FormMessage />
                                        )}
                                        <span className="text-sm text-muted-foreground">{(field.value ?? '').length} | {(field.value ?? '').length > 70 ? 2 : 1} เครดิต</span>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <Card className="flex flex-col gap-6 px-4">
                            <FormField
                                control={form.control}
                                name="is_scheduled"
                                render={({ field, fieldState }) => (
                                    <FormItem className="flex gap-2 items-center">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel>ตั่งเวลา</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-3">

                                <FormField
                                    control={form.control}
                                    name="scheduled_date"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>วันที่</FormLabel>
                                            <FormControl>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            disabled={!is_scheduled}
                                                            variant="outline"
                                                            id="date-picker"
                                                            className="w-32 justify-between font-normal"
                                                        >
                                                            {field.value ? field.value.toLocaleDateString() : "Select date"}
                                                            <ChevronDownIcon />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            captionLayout="dropdown"
                                                            onSelect={field.onChange}
                                                            fromYear={new Date().getFullYear()}
                                                            toYear={addYears(new Date(), 10).getFullYear()}
                                                            defaultMonth={field.value || new Date()}
                                                            disabled={{ before: new Date() }}

                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="scheduled_time"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>เวลา</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={!is_scheduled}
                                                    type="time"
                                                    id="time-picker"
                                                    step="60"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Card>

                        <div className="w-full flex justify-end">
                            <Button type="submit">
                                บันทึก
                            </Button>
                        </div>
                    </Card>
                </form>
            </Form>


            {/* spam */}
            <AlertDialog open={hasBadWord} onOpenChange={setHasBadWord}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>มีแสปม</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="flex flex-col gap-4">
                                <span>คำแหล่านี้ถือเป็นสแปม</span>
                                <div className="flex gap-2 flex-wrap">
                                    {detectdBadWord.map((word: string, key: number) => (
                                        <span key={key}>{word}</span>
                                    ))}
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>แก้ไข</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </AppLayout >
    );
}
