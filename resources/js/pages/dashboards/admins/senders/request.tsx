import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import api from "@/routes/api";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { SenderType } from "@/types/user";
import { Head } from "@inertiajs/react";
import { Check, Loader, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sender Requests',
        href: web.dash.admin.senders.requests().url,
    },
];

export default function Dashboard(request: any) {
    console.log(request);
    const csrfToken = request.csrf;
    const [isFetch, setIsFetch] = useState<boolean>(false);
    const [senders, setSenders] = useState<SenderType[]>(request.sender_request ?? []);
    console.log(senders);


    function Actions(sender_id: string, action: string) {
        setIsFetch(true);
        try {
            const fetchData = async () => {
                const way = api.admins.senders.requests.actions();
                const res = await fetch(way.url, {
                    method: way.method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken,
                    },
                    body: JSON.stringify({
                        sender_id: sender_id,
                        action: action,
                    })
                });
                const response = await res.json();
                if (res.ok) {
                    const data = response.data;
                    console.log(data);
                    setSenders(prev =>
                        prev.map(sender =>
                            sender.id === sender_id
                                ? { ...sender, status_text: data.status_text, status: data.status }
                                : sender
                        )
                    );
                }

            };

            fetchData();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsFetch(false);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <div className="flex flex-col gap-4">
                <div className="text-primary-foreground font-bold text-2xl">
                    ตารางอนุมัติผู้ส่ง
                </div>
                <Card className="p-0">
                    <CardContent className="bg-background rounded-2xl p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-lg pl-6">ชื่อผู้ส่ง</TableHead>
                                    <TableHead className="font-bold text-lg">ชื่อผู้ขอ</TableHead>
                                    <TableHead className="font-bold text-lg">เซิฟเวอร์</TableHead>
                                    <TableHead className="font-bold text-lg">-</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {senders.length > 0 && senders.map((sender: SenderType, key: number) => (
                                    <TableRow key={key}>
                                        <TableCell className="font-medium pl-6">{sender.name}</TableCell>
                                        <TableCell>{sender.user?.name}</TableCell>
                                        <TableCell>{sender.server?.name}</TableCell>
                                        <TableCell className="flex gap-2 justify-end me-4">
                                            {sender.status_text === 'pending' ? (
                                                <Button variant="success" disabled={isFetch} onClick={() => Actions(sender.id, 'completed')}>
                                                    {isFetch ? (
                                                        <Loader className="animate-spin" />
                                                    ) : (
                                                        <Check />
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button variant="ghost">
                                                    <Check className="size-5 animate-rotate-y animate-once animate-ease-in-out" />
                                                </Button>
                                            )}

                                            {sender.status_text !== 'rejected' && (
                                                <Button variant="danger" disabled={isFetch} onClick={() => Actions(sender.id, 'rejected')}>
                                                    {isFetch ? (
                                                        <Loader className="animate-spin" />
                                                    ) : (
                                                        <X />
                                                    )}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
