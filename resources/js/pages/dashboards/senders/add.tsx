import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { extractDomain } from "@/lib/url-functions";
import api from "@/routes/api";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { SenderType, ServerType, UserType } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Head } from "@inertiajs/react";
import { url } from "inspector";
import { Trash } from "lucide-react";
import { use, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Server',
        href: web.dash.server.add().url,
    },
];


export default function AddSenderPage(request: any) {
    console.log(request);

    const csrfToken = request.csrf;
    const [requestId, setRequestId] = useState<string>((request.sender.id ?? "").toString());
    const [isFetch, setIsFetch] = useState<boolean>(false);
    const [user, setUser] = useState<UserType>(request.auth ? (request.auth.user ?? {}) : {});
    const [servers, setServers] = useState<ServerType[]>(user?.plan?.servers ?? []);
    const [selectedServer, setSelectedServer] = useState<ServerType | null>(servers?.length > 0 ? servers[0] : null);

    const server_info_schema = z.object({
        request_id: z.string("ระบบไม่พบรหัสเซิฟเวอร์ กรุณาลองใหม่อีกครั้ง"),
        name: z.string().min(1, "กรุณากรอกชื่อผู้ส่ง").max(100, "ชื่อผู้ส่งต้องไม่เกิน 100 ตัวอักษร"),
    });
    type FormValues = z.infer<typeof server_info_schema>;
    const defaultValues: FormValues = {
        request_id: requestId,
        name: "",
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(server_info_schema),
        defaultValues,
        mode: "onChange",
    });

    function submit(field: FormValues) {
        const fetchData = async () => {
            setIsFetch(true);
            try {
                const way = api.senders.request();
                const response = await fetch(way.url, {
                    method: way.method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({
                        request_id: field.request_id,
                        server_id: selectedServer?.id,
                        name: field.name,
                    }),
                });
                const res = await response.json();
                if (response.ok) {
                    setServers(prev =>
                        prev.map(server =>
                            server.id === selectedServer?.id
                                ? {
                                    ...server,
                                    senders: [...server.senders, res.data],
                                }
                                : server
                        )
                    );

                    form.reset();
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
            } finally {
                setIsFetch(false);
            }
        };

        fetchData();
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                <Form
                    {...form}
                >
                    <form onSubmit={form.handleSubmit(submit)}>
                        <div className="flex flex-col gap-4">
                            <div className="w-full flex justify-between items-center">
                                <Select defaultValue={servers?.[0]?.id?.toString()} value={selectedServer?.id.toString()}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="เลือกเซิฟเวอร์" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {servers.map((server: any, index: number) => (
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
                                    <CardTitle>เพิ่มชื่อผู้ส่ง</CardTitle>
                                    <CardDescription>ข้อมูลผู้ส่งสำหรับเซิฟเวอร์ {selectedServer?.name}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="ชื่อผู้ส่ง" disabled={isFetch} {...field}></Input>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="w-full flex justify-end">
                                        <Button type="submit" disabled={isFetch}>
                                            {isFetch ? "กำลังส่งคำขอ..." : "ส่งคำขอ"}
                                        </Button>
                                    </div>
                                </CardContent>

                            </Card>
                        </div>
                    </form>
                </Form>

                <Card className="gap-2">
                    {servers.map((server: ServerType, index: number) => (
                        <>
                            <CardHeader className="font-bold">
                                {server.name}
                            </CardHeader>
                            <CardContent className="px-12">
                                <ul className="list-disc">
                                    {server.senders?.map((sender: SenderType, sender_index: number) => (
                                        <li key={sender.id}>
                                            <div className="flex justify-between">
                                                <span>
                                                    <span>{sender.name} </span>
                                                    <span className="text-muted-foreground">{sender.user_id == null && "(ฟรี)"}</span>
                                                    {
                                                        sender.status_text == "pending" ? <span className="text-amber-500">(รออนุมัติ)</span>
                                                            :
                                                            sender.status_text == 'approved' ? <span className="text-green-500">(อนุมัติแล้ว)</span>
                                                                : null
                                                    }
                                                </span>
                                                {sender.user_id !== null && (
                                                    <Button variant="ghost" className="h-auto py-2 w-auto">
                                                        <Trash />
                                                    </Button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </>
                    ))}
                </Card>

            </div>
        </AppLayout>
    );
}


