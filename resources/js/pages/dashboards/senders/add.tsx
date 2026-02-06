import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { extractDomain } from "@/lib/url-functions";
import { GetServerByUser } from "@/models/servers/get";
import api from "@/routes/api";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { SenderType, ServerType, UserType } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Head } from "@inertiajs/react";
import { url } from "inspector";
import { Loader, Play, Square, Trash, X } from "lucide-react";
import { useState, useEffect, DragEvent, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Textarea } from "@/components/ui/textarea";


const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Sender',
        href: web.dashboard.senders.add().url,
    },
];

export default function AddSenderPage(request: any) {
    console.log(request);

    const csrfToken = request.csrf;
    const [requestId, setRequestId] = useState<string>((request.sender.id ?? "").toString());
    const [isFetch, setIsFetch] = useState<boolean>(false);
    const [user, setUser] = useState<UserType>(request.auth ? (request.auth.user ?? {}) : {});
    const [servers, setServers] = useState<ServerType[]>([]);
    const [selectedServer, setSelectedServer] = useState<ServerType | null>(servers?.length > 0 ? servers[0] : null);
    const [images, setImages] = useState<File[]>([]);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [previewFileName, setPreviewFileName] = useState<string | null>(null);
    const [isFileSizeLimitExceeded, setIsFileSizeLimitExceeded] = useState<boolean>(false);
    const [totalImagesSize, setTotalImagesSize] = useState<number>(0);

    const server_info_schema = z.object({
        request_id: z.string("ระบบไม่พบรหัสเซิฟเวอร์ กรุณาลองใหม่อีกครั้ง"),
        name: z.string().min(1, "กรุณากรอกชื่อผู้ส่ง").max(100, "ชื่อผู้ส่งต้องไม่เกิน 100 ตัวอักษร"),
        content: z.string().optional().nullable(),
        images: z.array(z.instanceof(File)).min(1, "กรุณาเพิ่มรูปอย่างน้อย 1 รูป"),
    });
    type FormValues = z.infer<typeof server_info_schema>;
    const defaultValues: FormValues = {
        request_id: requestId,
        name: "",
        content: "",
        images: [],
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(server_info_schema),
        defaultValues,
        mode: "onChange",
    });

    useEffect(() => {
        const fetchServers = async () => {
            const serversData = await GetServerByUser(['with=senders'], setIsFetch);

            setServers(serversData);
            setSelectedServer(serversData.length > 0 ? serversData[0] : null);

            if (serversData.length == 0) {
                setIsFetch(true);
                toast.error('ไม่พบเซิฟเวอร์', { description: "ระบบไม่พบเซิฟเวอร์ กรุณาซื้อแพ็กเกจ" });
            }
        };

        fetchServers();
    }, []);

    function handleFiles(filesList: FileList | null) {
        if (!filesList) return;

        const onlyImages = Array.from(filesList).filter((file) =>
            file.type.startsWith("image/")
        );

        setImages((prev) => {
            const updated = [...prev, ...onlyImages];
            // Calculate total size
            const totalSize = updated.reduce((sum, file) => sum + file.size, 0);
            setTotalImagesSize(totalSize);

            if (totalSize > MAX_TOTAL_SIZE) {
                setIsFileSizeLimitExceeded(true);
                toast.error(`ขนาดไฟล์รวมเกิน 20MB กรุณาเลือกไฟล์ใหม่`);
            } else {
                setIsFileSizeLimitExceeded(false);
            }
            form.setValue("images", updated, { shouldValidate: true });
            return updated;
        });
    }

    function removeImage(index: number) {
        setImages((prev) => {
            // Remove the selected file
            const updated = prev.filter((_, i) => i !== index);
            // Calculate total size
            const totalSize = updated.reduce((sum, file) => sum + file.size, 0);
            setTotalImagesSize(totalSize);
            if (totalSize > MAX_TOTAL_SIZE) {
                setIsFileSizeLimitExceeded(true);
            } else {
                setIsFileSizeLimitExceeded(false);
            }
            form.setValue("images", updated, { shouldValidate: true });

            // Important: Revoke object URLs to allow re-selection of same file
            // (handled in closePreview if previewing, but for any file here for safety)
            // Not strictly needed for input[type="file"], but to be sure:
            // Reset the input value to allow the same file to be chosen again
            const input = document.getElementById("sender-images-input") as HTMLInputElement | null;
            if (input) {
                input.value = "";
            }

            return updated;
        });
    }

    function openPreview(file: File) {
        const url = URL.createObjectURL(file);
        setPreviewImageUrl(url);
        setPreviewFileName(file.name);
    }

    function closePreview() {
        if (previewImageUrl) {
            URL.revokeObjectURL(previewImageUrl);
        }
        setPreviewImageUrl(null);
        setPreviewFileName(null);
    }

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        handleFiles(e.dataTransfer.files);
    }

    function handleDragOver(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
        handleFiles(e.target.files);
    }

    function submit(field: FormValues) {
        // check total size before submit
        const totalSize = images.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > MAX_TOTAL_SIZE) {
            setIsFileSizeLimitExceeded(true);
            toast.error("ขนาดไฟล์รวมเกิน 20MB กรุณาเลือกไฟล์ใหม่");
            return;
        }

        const fetchData = async () => {
            setIsFetch(true);
            try {
                const way = api.senders.request();

                const formData = new FormData();
                formData.append("request_id", field.request_id);
                if (selectedServer?.id) {
                    formData.append("server_id", selectedServer.id.toString());
                }
                formData.append("name", field.name);
                formData.append("content", field.content ?? '');
                images.forEach((file) => {
                    formData.append("images[]", file);
                });

                const response = await fetch(way.url, {
                    method: way.method,
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: formData,
                });
                const res = await response.json();
                if (response.ok) {
                    setServers(prev =>
                        prev.map(server =>
                            server.id === selectedServer?.id
                                ? {
                                    ...server,
                                    senders: [...(server.senders || []), res.data],
                                }
                                : server
                        )
                    );
                    form.reset({ request_id: requestId, name: "", images: [] });
                    setImages([]);
                    setTotalImagesSize(0);
                    setIsFileSizeLimitExceeded(false);
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
                console.error('Error submitting form:', error);
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
                console.error('Error submitting form:', error);
            } finally {
                setIsFetch(false);
            }
        };

        fetchData();
    }

    // Format bytes to show nicely in MB/KB
    function formatBytes(bytes: number) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">

                <Form
                    {...form}
                >
                    <form onSubmit={form.handleSubmit(submit)}>
                        <div className="flex flex-col gap-4">
                            <div className="w-full flex justify-between items-center">
                                <Select defaultValue={servers?.[0]?.id?.toString()} value={selectedServer?.id.toString()}>
                                    <SelectTrigger className="w-[180px] bg-background">
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
                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea className="h-24" placeholder="รายละเอียดลึกเพิ่มเติม" disabled={isFetch} {...field} value={field.value ?? ""}></Textarea>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="images"
                                        render={({ fieldState }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div
                                                        className="flex flex-col gap-2 border border-dashed rounded-md p-4 text-center cursor-pointer bg-muted/30"
                                                        onDrop={handleDrop}
                                                        onDragOver={handleDragOver}
                                                    >
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={handleFileInputChange}
                                                            disabled={isFetch}
                                                            className="hidden"
                                                            id="sender-images-input"
                                                        />
                                                        <label
                                                            htmlFor="sender-images-input"
                                                            className="w-full h-full flex flex-col items-center justify-center gap-1 cursor-pointer"
                                                        >
                                                            <span className="font-medium">วางไฟล์รูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                รองรับเฉพาะไฟล์รูปภาพ และสามารถเลือกได้หลายไฟล์
                                                            </span>
                                                        </label>
                                                        {images.length > 0 && (
                                                            <div className="mt-2 text-left text-xs text-muted-foreground">
                                                                <div className="font-semibold mb-1">ไฟล์ที่เลือก:</div>
                                                                <ul className="list-disc list-inside space-y-1">
                                                                    {images.map((file, index) => (
                                                                        <li key={index} className="flex items-center justify-between gap-2">
                                                                            <button
                                                                                type="button"
                                                                                className="text-primary underline text-left break-all"
                                                                                onClick={() => openPreview(file)}
                                                                            >
                                                                                {file.name}
                                                                            </button>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-6 w-6 text-danger"
                                                                                onClick={() => removeImage(index)}
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                                <div className={`mt-2`}>
                                                                    <span>ขนาดไฟล์รวม: </span>
                                                                    <span className={isFileSizeLimitExceeded ? "text-danger font-bold" : ""}>
                                                                        {formatBytes(totalImagesSize)}
                                                                    </span>
                                                                    <span> / 100 MB</span>
                                                                </div>
                                                                {isFileSizeLimitExceeded && (
                                                                    <div className="text-danger mt-1">
                                                                        ขนาดไฟล์รวมทั้งหมดต้องไม่เกิน 20MB
                                                                    </div>
                                                                )}
                                                                <Dialog open={!!previewImageUrl} onOpenChange={(open) => !open && closePreview()}>
                                                                    <DialogContent className="max-w-lg">
                                                                        <DialogHeader>
                                                                            <DialogTitle className="text-sm">{previewFileName}</DialogTitle>
                                                                        </DialogHeader>
                                                                        {previewImageUrl && (
                                                                            <img
                                                                                src={previewImageUrl}
                                                                                alt={previewFileName ?? ""}
                                                                                className="w-full h-auto rounded-md"
                                                                            />
                                                                        )}
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="w-full flex justify-end">
                                        <Button type="submit" disabled={isFetch || isFileSizeLimitExceeded}>
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

                <Card className="gap-2">
                    {servers.map((server: ServerType, index: number) => (
                        <>
                            <CardHeader className="font-bold">
                                เซิฟเวอร์ {server.name}
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
                                                            >
                                                                <Play />
                                                            </Button>
                                                            : sender.status_text == "active" && sender.user_id !== null ?
                                                                <Button variant="ghost" className="hover:bg-danger hover:text-danger-foreground"
                                                                    onClick={() => updateStatus(sender.id, 'inactive')}
                                                                >
                                                                    <Square />
                                                                </Button>
                                                                : null
                                                    }
                                                    {sender.user_id !== null && (
                                                        <Button variant="ghost" className="h-auto py-2 w-auto"
                                                            onClick={() => onDelete(sender.id)}
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
                        </>
                    ))}
                </Card>

            </div>
        </AppLayout>
    );
}

