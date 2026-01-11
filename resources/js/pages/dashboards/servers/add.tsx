import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";
import { extractDomain } from "@/lib/url-functions";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Head } from "@inertiajs/react";
import { url } from "inspector";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Server',
        href: web.dash.server.add().url,
    },
];


export default function AddServerPage(request: any) {
    console.log(request);

    const [serverId, setServersId] = useState<string>((request.server.id ?? "").toString());
    const [isFetch, setIsFetch] = useState(false);

    const server_info_schema = z.object({
        server_id: z.string("ระบบไม่พบรหัสเซิฟเวอร์ กรุณาลองใหม่อีกครั้ง"),
        server_name: z.string().min(1, "กรุณากรอกชื่อเว็บไซต์"),
        server_link: z.string("กรุณากรอกลิงก์เว็บไซต์").url("รูปแบบลิงก์ไม่ถูกต้อง"),
        server_domain: z.string().optional(),

        // sms
        sms_url: z.string("ลิงค์ส่งข้อมูล").optional(),
        sms_method: z.string("กรุณาเลือกวิธีการส่งข้อมูล").optional(),
    });
    type FormValues = z.infer<typeof server_info_schema>;
    const defaultValues: FormValues = {
        server_id: serverId,
        server_name: "",
        server_link: "",
        server_domain: "",
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(server_info_schema),
        defaultValues,
        mode: "onChange",
    });

    function submit() {

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
                            <div className="w-full flex justify-end">
                                <Button>บันทึก</Button>
                            </div>

                            <Card className="p-0">
                                <CardContent className="flex flex-col gap-4 p-0">
                                    <Accordion type="single" defaultValue="item-1" collapsible >
                                        <AccordionItem value="item-1" className="bg-accent rounded-xl">
                                            <AccordionTrigger className="hover:no-underline p-4 bg-background rounded-xl">
                                                <CardHeader className="p-0">
                                                    <CardTitle>ข้อมูลทั้วไป</CardTitle>
                                                    <CardDescription>ข้อมูลเกี่ยวกับเซิฟเวอร์</CardDescription>
                                                    <CardDescription>{form.watch("server_id")}</CardDescription>
                                                </CardHeader>
                                            </AccordionTrigger>
                                            <AccordionContent className="flex flex-col gap-4 bg-accent p-4">
                                                <FormField
                                                    control={form.control}
                                                    name="server_name"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem>
                                                            <FormLabel className="ms-3">ชื่อเว็บไซต์</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="ชื่อเว็บไซต์" disabled={isFetch} {...field}></Input>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="server_link"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem>
                                                            <FormLabel className="ms-3">ลิงก์เว็บไซต์</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="ลิงก์เว็บไซต์" disabled={isFetch} {...field}></Input>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="server_domain"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem>
                                                            <FormLabel className="ms-3">โดเมนเว็บไซต์</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="โดเมนเว็บไซต์" disabled={true} {...field} value={extractDomain(form.watch('server_link'))}></Input>
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
                            <Card className="p-0">
                                <CardContent className="flex flex-col gap-4 p-0">
                                    <Accordion type="single" defaultValue="item-1" collapsible>
                                        <AccordionItem value="item-1" className="bg-accent rounded-xl">
                                            <AccordionTrigger className="hover:no-underline p-4 bg-background rounded-xl">
                                                <CardHeader className="p-0">
                                                    <CardTitle>SMS</CardTitle>
                                                    <CardDescription>การส่ง SMS</CardDescription>
                                                </CardHeader>
                                            </AccordionTrigger>
                                            <AccordionContent className="flex flex-col gap-4 bg-accent p-4">
                                                <FormField
                                                    control={form.control}
                                                    name="sms_url"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem>
                                                            <FormLabel className="ms-3">ลิงค์ส่งข้อมูล</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="{{server_url}}/" disabled={isFetch} {...field}></Input>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="server_link"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem>
                                                            <FormLabel className="ms-3">ลิงก์เว็บไซต์</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="ลิงก์เว็บไซต์" disabled={isFetch} {...field}></Input>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="server_domain"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem>
                                                            <FormLabel className="ms-3">โดเมนเว็บไซต์</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="โดเมนเว็บไซต์" disabled={true} {...field} value={extractDomain(form.watch('server_link'))}></Input>
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
                        </div>
                    </form>
                </Form>

            </div>
        </AppLayout>
    );
}