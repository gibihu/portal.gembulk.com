import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { GetServerByUser } from "@/models/servers/get";
import api from "@/routes/api";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { SenderType, ServerType, UserType } from "@/types/user";
import { Head, Link } from "@inertiajs/react";
import { Loader, Play, Plus, Square, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Sender',
        href: web.dashboard.senders.add().url,
    },
];

export default function SenderPage(request: any) {
    const csrfToken = request.csrf;
    const [isFetch, setIsFetch] = useState<boolean>(false);
    const [servers, setServers] = useState<ServerType[]>([]);

    useEffect(() => {
        const fetchServers = async () => {
            const serversData = await GetServerByUser(['with=senders'], setIsFetch);
            setServers(serversData);
            if (serversData.length == 0) {
                setIsFetch(true);
                toast.error('ไม่พบเซิฟเวอร์', { description: "ระบบไม่พบเซิฟเวอร์ กรุณาซื้อแพ็กเกจ" });
            }
        };
        fetchServers();
    }, []);

    function updateStatus(sender_id: string, status: string) {
        const fetchData = async () => {
            setIsFetch(true);
            try {
                const way = api.senders.status();
                const response = await fetch(way.url, {
                    method: way.method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({
                        sender_id: sender_id,
                        status: status,
                    }),
                });
                const res = await response.json();
                if (response.ok) {
                    setServers(prev =>
                        prev.map(server => {
                            if (!server.senders) return server;

                            const hasSender = server.senders.some(
                                sender => sender.id === res.data.id
                            );

                            if (!hasSender) return server;

                            return {
                                ...server,
                                senders: server.senders.map(sender =>
                                    sender.id === res.data.id
                                        ? res.data
                                        : sender
                                ),
                            };
                        })
                    );
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.error('Error updating sender status:', error);
            } finally {
                setIsFetch(false);
            }
        };

        fetchData();
    }

    function onDelete(sender_id: string) {
        const fetchData = async () => {
            setIsFetch(true);
            try {
                const way = api.senders.delete();
                const response = await fetch(way.url, {
                    method: way.method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({
                        sender_id: sender_id,
                    }),
                });
                const res = await response.json();
                if (response.ok) {
                    setServers(prev =>
                        prev.map(server => {
                            if (!server.senders) return server;

                            return {
                                ...server,
                                senders: server.senders.filter(
                                    sender => sender.id !== sender_id
                                ),
                            };
                        })
                    );
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.error('Error deleting sender:', error);
            } finally {
                setIsFetch(false);
            }
        };

        fetchData();
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">
                <Card className="gap-2">
                    <div className="w-full flex justify-end px-4">
                        <Link href={web.dashboard.senders.add().url} prefetch>
                            <Button>
                                <Plus className="size-4" />
                            </Button>
                        </Link>
                    </div>
                    {servers.map((server: ServerType, index: number) => (
                        <div key={server.id}>
                            <CardHeader className="font-bold">
                                จัดการ Sender
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Sender</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Used</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {server.senders?.map((sender: SenderType, sender_index: number) => (
                                            <TableRow key={sender_index}>
                                                <TableCell>{sender.name}</TableCell>
                                                <TableCell>
                                                    <span className="text-muted-foreground">{sender.user_id == null && "ฟรี"}</span>
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        sender.status_text == "pending" ? <span className="text-amber-500">รออนุมัติ</span>
                                                            :
                                                            sender.status_text == "completed" ? <span className="text-green-300">อนุมัติแล้ว</span>
                                                                :
                                                                sender.status_text == "active" ? <span className="text-green-500">ใช้งาน</span>
                                                                    :
                                                                    sender.status_text == "inactive" ? <span className="text-muted-foreground">ไม่ใช้งาน</span>
                                                                        :
                                                                        sender.status_text == "rejected" ? <span className="text-danger">ปฏิเสธ</span>
                                                                            : null
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        sender.status_text == "completed" || sender.status_text == "inactive" ?
                                                            <Button variant="ghost" className="hover:bg-success hover:text-success-foreground"
                                                                onClick={() => updateStatus(sender.id, 'active')}
                                                                disabled={isFetch}
                                                            >
                                                                <Play />
                                                            </Button>
                                                            : sender.status_text == "active" && sender.user_id !== null ?
                                                                <Button variant="ghost" className="hover:bg-danger hover:text-danger-foreground"
                                                                    onClick={() => updateStatus(sender.id, 'inactive')}
                                                                    disabled={isFetch}
                                                                >
                                                                    <Square />
                                                                </Button>
                                                                : null
                                                    }
                                                    {sender.user_id !== null && (
                                                        <Button variant="ghost" className="h-auto py-2 w-auto"
                                                            onClick={() => onDelete(sender.id)}
                                                            disabled={isFetch}
                                                        >
                                                            <Trash />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </div>
                    ))}
                </Card>
            </div>
        </AppLayout>
    );
}

