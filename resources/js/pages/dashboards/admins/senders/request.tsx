import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import api from "@/routes/api";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { SenderType, ServerType } from "@/types/user";
import { Head } from "@inertiajs/react";
import { Check, Fullscreen, Icon, InboxIcon, Loader, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sender Requests',
        href: web.dashboard.admins.senders.requests().url,
    },
];

export default function Dashboard(request: any) {
    console.log(request);
    const csrfToken = request.csrf;
    const currentUserId = request?.auth?.user?.id ?? null;
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
                <SenderTable csrfToken={csrfToken} currentUserId={currentUserId} />
                <Card className="p-0 overflow-hidden">
                    <div className="text-foreground font-bold text-2xl p-4 pb-0">
                        ตารางอนุมัติผู้ส่ง
                    </div>
                    <CardContent className="bg-background rounded-2xl p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">ชื่อผู้ส่ง</TableHead>
                                    <TableHead>ชื่อผู้ขอ</TableHead>
                                    <TableHead>เซิฟเวอร์</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {senders.length == 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-muted-foreground text-center italic">
                                            No senders for this server.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {senders.length > 0 && senders.map((sender: SenderType, key: number) => (
                                    <TableRow key={key}>
                                        <TableCell className="font-medium pl-6">{sender.name}</TableCell>
                                        <TableCell>{sender.user?.name}</TableCell>
                                        <TableCell>{sender.server?.name}</TableCell>
                                        <TableCell className="flex gap-2 justify-end me-4">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline">
                                                        ดูรายละเอียด
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="p-0">
                                                    <DialogHeader>
                                                        <DialogTitle className="p-4 pb-0">Are you absolutely sure?</DialogTitle>
                                                        <DialogDescription className="p-4 pe-0" asChild>
                                                            <div className="flex flex-col gap-4 max-h-[90svh] overflow-y-auto">
                                                                {sender.data.objective && (
                                                                    <div className="flex flex-col gap-2">
                                                                        <p className="text-foreground font-bold">วัตถุประสงค์</p>
                                                                        <span>{sender.data.objective}</span>
                                                                    </div>
                                                                )}

                                                                {sender.data.type == "with_link" && (
                                                                    <div className="flex flex-col gap-2">
                                                                        <p className="text-foreground font-bold">ประสงค์แนบลิงค์</p>
                                                                        <span>{sender.data.link}</span>
                                                                        <span>{sender.data.sample_message}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                </DialogContent>
                                            </Dialog>

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


function SenderTable({ csrfToken, currentUserId }: { csrfToken: string, currentUserId: string | null }) {
    const [servers, setServers] = useState<ServerType[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [editingSender, setEditingSender] = useState<SenderType | null>(null);
    const [senderName, setSenderName] = useState<string>("");
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [deletingSender, setDeletingSender] = useState<SenderType | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [newSenderName, setNewSenderName] = useState<string>("");
    const [attachToUser, setAttachToUser] = useState<boolean>(false);
    const [selectedServerIds, setSelectedServerIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const way = api.admins.servers.index();
                const res = await fetch(way.url);
                const response = await res.json();
                if (response.code == 200) {
                    setServers(response.data);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleCreateSender = async () => {
        if (!newSenderName.trim()) {
            toast.error('กรุณากรอกชื่อผู้ส่ง');
            return;
        }

        if (selectedServerIds.length === 0) {
            toast.error('กรุณาเลือกเซิฟเวอร์อย่างน้อย 1 ตัว');
            return;
        }

        if (attachToUser && !currentUserId) {
            toast.error('ไม่พบข้อมูลผู้ใช้สำหรับผูกกับผู้ส่ง');
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch('/api/admins/senders/store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify({
                    name: newSenderName.trim(),
                    server_ids: selectedServerIds,
                    user_id: attachToUser ? currentUserId : null,
                }),
            });

            const response = await res.json();

            if (res.ok && response.code === 200) {
                const createdSenders: SenderType[] = response.data ?? [];

                const sendersByServerId: Record<string, SenderType[]> = {};

                selectedServerIds.forEach((serverId, index) => {
                    const sender = createdSenders[index];
                    if (!sender) return;
                    if (!sendersByServerId[serverId]) {
                        sendersByServerId[serverId] = [];
                    }
                    sendersByServerId[serverId].push(sender);
                });

                setServers(prev =>
                    prev.map(server => ({
                        ...server,
                        senders: [
                            ...(server.senders ?? []),
                            ...(sendersByServerId[server.id] ?? []),
                        ],
                    }))
                );

                toast.success('สร้างผู้ส่งสำเร็จ');
                setIsCreateDialogOpen(false);
                setNewSenderName("");
                setAttachToUser(false);
                setSelectedServerIds([]);
            } else {
                toast.error(response.message || 'เกิดข้อผิดพลาดในการสร้างผู้ส่ง');
            }
        } catch (error) {
            console.error('Error creating sender:', error);
            toast.error('เกิดข้อผิดพลาดในการสร้างผู้ส่ง');
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditClick = (sender: SenderType) => {
        setEditingSender(sender);
        setSenderName(sender.name);
        setIsDialogOpen(true);
    };

    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingSender(null);
            setSenderName("");
        }
    };

    const handleUpdate = async () => {
        if (!editingSender || !senderName.trim()) {
            toast.error('กรุณากรอกชื่อผู้ส่ง');
            return;
        }

        setIsUpdating(true);
        try {
            const way = api.admins.senders.update();
            const res = await fetch(way.url, {
                method: way.method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify({
                    sender_id: editingSender.id,
                    name: senderName.trim(),
                })
            });
            const response = await res.json();
            if (res.ok && response.code === 200) {
                // อัพเดท state ของ servers
                setServers(prev =>
                    prev.map(server => ({
                        ...server,
                        senders: server.senders?.map(sender =>
                            sender.id === editingSender.id
                                ? { ...sender, name: senderName.trim() }
                                : sender
                        ) ?? []
                    }))
                );
                toast.success('อัพเดทชื่อผู้ส่งสำเร็จ');
                setIsDialogOpen(false);
                setEditingSender(null);
                setSenderName("");
            } else {
                toast.error(response.message || 'เกิดข้อผิดพลาดในการอัพเดท');
            }
        } catch (error) {
            console.error('Error updating sender:', error);
            toast.error('เกิดข้อผิดพลาดในการอัพเดท');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingSender) {
            return;
        }

        setIsDeleting(true);
        try {
            const way = api.admins.senders.requests.actions();
            const res = await fetch(way.url, {
                method: way.method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify({
                    sender_id: deletingSender.id,
                    action: 'rejected',
                })
            });
            const response = await res.json();
            if (res.ok && response.code === 200) {
                // ลบ sender ออกจาก state
                setServers(prev =>
                    prev.map(server => ({
                        ...server,
                        senders: server.senders?.filter(sender => sender.id !== deletingSender.id) ?? []
                    }))
                );
                toast.success('ลบผู้ส่งสำเร็จ');
                setDeletingSender(null);
                setIsDeleteDialogOpen(false);
            } else {
                toast.error(response.message || 'เกิดข้อผิดพลาดในการลบ');
            }
        } catch (error) {
            console.error('Error deleting sender:', error);
            toast.error('เกิดข้อผิดพลาดในการลบ');
        } finally {
            setIsDeleting(false);
        }
    };
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <span className="text-foreground font-bold text-2xl">
                    Senders
                </span>
                <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                    setIsCreateDialogOpen(open);
                    if (!open) {
                        setNewSenderName("");
                        setAttachToUser(false);
                        setSelectedServerIds([]);
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            +
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>เพิ่มผู้ส่งใหม่</DialogTitle>
                            <DialogDescription>
                                กรอกข้อมูลเพื่อสร้างผู้ส่งใหม่ และเลือกเซิฟเวอร์ที่ต้องการผูก
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="new-sender-name">ชื่อผู้ส่ง</Label>
                                <Input
                                    id="new-sender-name"
                                    value={newSenderName}
                                    onChange={(e) => setNewSenderName(e.target.value)}
                                    placeholder="กรอกชื่อผู้ส่ง"
                                    disabled={isCreating}
                                />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <Label htmlFor="attach-user">
                                    ผูกกับผู้ใช้
                                </Label>
                                <Switch
                                    id="attach-user"
                                    checked={attachToUser}
                                    onCheckedChange={(checked) => setAttachToUser(!!checked)}
                                    disabled={isCreating}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="server-select">เลือกเซิฟเวอร์</Label>
                                <div>

                                    <Select
                                        value={selectedServerIds[0] || undefined}
                                        onValueChange={(value) => {
                                            setSelectedServerIds(value ? [value] : []);
                                        }}
                                        disabled={isCreating}
                                    >
                                        <SelectTrigger id="server-select" className="min-h-[40px]">
                                            <SelectValue placeholder="-- เลือกเซิฟเวอร์ --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Removed <SelectItem value=""> for radix-ui/react-select rule */}
                                            {servers.map((server) => (
                                                <SelectItem key={server.id} value={server.id}>
                                                    {server.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                    disabled={isCreating}
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    onClick={handleCreateSender}
                                    disabled={isCreating}
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader className="animate-spin size-4 mr-2" />
                                            กำลังบันทึก...
                                        </>
                                    ) : (
                                        'บันทึก'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="w-full flex justify-center">
                        <Loader className="size-4 animate-spin" />
                    </div>
                ) : (
                    <Table>
                        <TableBody>
                            {!isLoading && servers.map((item: ServerType, key: number) => (
                                <TableRow key={item.id}>
                                    <TableCell colSpan={2} className="p-0 border-0">
                                        <div className="w-full">
                                            <div className="font-bold p-2 rounded-t">{item.name}</div>
                                            <Table className="">
                                                <TableBody>
                                                    {item.senders && item.senders.length > 0 ? (
                                                        item.senders.map((sender: SenderType, i: number) => (sender.status_text !== 'pending' && (
                                                            <TableRow key={sender.id || i}>
                                                                <TableCell>{sender.name}</TableCell>
                                                                <TableCell>{sender.status_text}</TableCell>
                                                                <TableCell className="flex justify-end gap-2">
                                                                    <Dialog open={isDialogOpen && editingSender?.id === sender.id} onOpenChange={handleDialogOpenChange}>
                                                                        <DialogTrigger asChild>
                                                                            <Button variant="outline" onClick={() => handleEditClick(sender)}>
                                                                                <Pencil className="size-4" />
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent>
                                                                            <DialogHeader>
                                                                                <DialogTitle>แก้ไขชื่อผู้ส่ง</DialogTitle>
                                                                                <DialogDescription>
                                                                                    กรุณากรอกชื่อผู้ส่งใหม่
                                                                                </DialogDescription>
                                                                            </DialogHeader>
                                                                            <div className="flex flex-col gap-4 py-4">
                                                                                <div className="flex flex-col gap-2">
                                                                                    <label className="text-sm font-medium">ชื่อผู้ส่ง</label>
                                                                                    <Input
                                                                                        value={senderName}
                                                                                        onChange={(e) => setSenderName(e.target.value)}
                                                                                        placeholder="กรอกชื่อผู้ส่ง"
                                                                                        disabled={isUpdating}
                                                                                    />
                                                                                </div>
                                                                                <div className="flex justify-end gap-2">
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        onClick={() => handleDialogOpenChange(false)}
                                                                                        disabled={isUpdating}
                                                                                    >
                                                                                        ยกเลิก
                                                                                    </Button>
                                                                                    <Button
                                                                                        onClick={handleUpdate}
                                                                                        disabled={isUpdating || !senderName.trim()}
                                                                                    >
                                                                                        {isUpdating ? (
                                                                                            <>
                                                                                                <Loader className="animate-spin size-4 mr-2" />
                                                                                                กำลังอัพเดท...
                                                                                            </>
                                                                                        ) : (
                                                                                            'บันทึก'
                                                                                        )}
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                    {sender.user_id != null && (
                                                                        <AlertDialog open={isDeleteDialogOpen && deletingSender?.id === sender.id} onOpenChange={(open) => {
                                                                            setIsDeleteDialogOpen(open);
                                                                            if (!open) {
                                                                                setDeletingSender(null);
                                                                            }
                                                                        }}>
                                                                            <AlertDialogTrigger asChild>
                                                                                <Button
                                                                                    variant="destructive"
                                                                                    onClick={() => {
                                                                                        setDeletingSender(sender);
                                                                                        setIsDeleteDialogOpen(true);
                                                                                    }}
                                                                                    disabled={isDeleting}
                                                                                >
                                                                                    {isDeleting && deletingSender?.id === sender.id ? (
                                                                                        <Loader className="size-4 animate-spin" />
                                                                                    ) : (
                                                                                        <Trash2 className="size-4" />
                                                                                    )}
                                                                                </Button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        คุณแน่ใจหรือไม่ว่าต้องการลบผู้ส่ง "{sender.name}"? การกระทำนี้ไม่สามารถยกเลิกได้
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel
                                                                                        disabled={isDeleting}
                                                                                        onClick={() => {
                                                                                            setIsDeleteDialogOpen(false);
                                                                                            setDeletingSender(null);
                                                                                        }}
                                                                                    >
                                                                                        ยกเลิก
                                                                                    </AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        onClick={handleDelete}
                                                                                        disabled={isDeleting}
                                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                                    >
                                                                                        {isDeleting ? (
                                                                                            <>
                                                                                                <Loader className="animate-spin size-4 mr-2" />
                                                                                                กำลังลบ...
                                                                                            </>
                                                                                        ) : (
                                                                                            'ลบ'
                                                                                        )}
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell className="text-muted-foreground text-center italic">
                                                                No senders for this server.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}