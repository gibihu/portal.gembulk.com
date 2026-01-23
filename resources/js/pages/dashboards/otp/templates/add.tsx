import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import servers from "@/routes/api/servers";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { ServerType } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Head } from "@inertiajs/react";
import { useForm } from "react-hook-form";
import { Info, Loader } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Code } from "@/components/custom_ui/code";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'ส่งแล้ว',
        href: web.dashboard.report.sms().url,
    },
];


export default function OtpTemplatePage(request: any) {
    const [isFetch, setIsFetch] = useState<boolean>(false);

    const server_info_schema = z.object({
        template: z.string().optional(),
    });
    type FormValues = z.infer<typeof server_info_schema>;
    const defaultValues: FormValues = {
        template: "",
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(server_info_schema),
        defaultValues,
        mode: "onChange",
    });

    function submit(field: FormValues) {
        console.log(field);
    }


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">

                <Form
                    {...form}
                >
                    <form onSubmit={form.handleSubmit(submit)}>
                        <div className="flex flex-col gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>สร้างเทมเพลต</CardTitle>
                                    <CardDescription></CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <FormField
                                        control={form.control}
                                        name="template"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel className="flex gap-2">
                                                    เทมเพลต
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
                                                    <Textarea placeholder="เทมเพลต" disabled={isFetch} {...field}></Textarea>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="w-full flex justify-end">
                                        <Button type="submit" disabled={isFetch}>
                                            {
                                                isFetch ? (<Loader className="animate-spin" />) : ("ส่งคำขอ")
                                            }
                                        </Button>
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