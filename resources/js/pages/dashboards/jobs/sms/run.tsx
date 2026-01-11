import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";
import api from "@/routes/api";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { ReportType } from "@/types/user";
import { Head, router } from "@inertiajs/react";
import { Check, Clock, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'ทำงาน',
        href: web.dash.jobs.sms().url,
    },
];

export default function SmsRunJobPage(request: any) {
    const [rawItems, setRawItems] = useState<ReportType[]>([]);
    const [items, setItems] = useState<ReportType[]>([]);
    const [isFetch, setIsFetch] = useState<boolean>(false);
    const [isLoad, setIsLoad] = useState<boolean>(true);


    useEffect(() => {
        setRawItems(request.jobs as ReportType[]);
        setIsLoad(false);
    }, [request.jobs]);


    useEffect(() => {
        setItems([...rawItems].sort((a, b) => b.status - a.status));
    }, [rawItems]);


    useEffect(() => {
        const interval = setInterval(() => {
            handleSyncJob();
            // router.reload();
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    async function handleSyncJob() {
        try {
            setIsFetch(true);
            const res = await fetch(api.dash.job.sms().url);
            const result = await res.json();

            if (result.code === 200) {
                const newData: ReportType[] = result.data;

                setRawItems((prevItems) => {
                    const currentIds = prevItems.map((item) => item.id);
                    const newIds = newData.map((item) => item.id);

                    // 🟢 1. หา item ที่ยังอยู่ใน API (ยังไม่จบ)
                    const updatedItems = newData.map((item) => {
                        const oldItem = prevItems.find((old) => old.id === item.id);
                        return oldItem ? { ...oldItem, ...item } : item;
                    });

                    // 🟠 2. หา item ที่ "หายไป" (ไม่มีใน API แล้ว)
                    const removedItems = prevItems.filter((item) => !newIds.includes(item.id));

                    // 🟡 3. ให้แสดง success 3 วิ แล้วค่อยลบ
                    removedItems.forEach((removed) => {
                        const updated = { ...removed, status_text: "success" };
                        updatedItems.push(updated);

                        // ตั้งเวลาให้ลบออกภายใน 3 วิ
                        setTimeout(() => {
                            setRawItems((current) => current.filter((x) => x.id !== removed.id));
                        }, 3000);
                    });

                    return updatedItems;
                });
            } else {
                toast.error(result.message, { description: result.description ?? "" });
            }
        } catch (error) {
            console.error("Error:", error);
            let message = "เกิดข้อผิดพลาดบางอย่าง";

            if (error instanceof Error) message = error.message;
            else if (typeof error === "string") message = error;

            toast.error(message);
        } finally {
            setIsFetch(false);
        }
    }


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {items.length > 0 ? (items.map((item: ReportType, key: number) => (
                    <Item variant="outline" key={key} className={cn("shadow-md", item.status_text == "processing" && "bg-primary/30", item.status_text == "success" && "bg-green-600/30")}>
                        <ItemContent>
                            <ItemTitle>+{item.receiver}</ItemTitle>
                            <ItemDescription>
                                {item.msg}
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions className="flex items-center justify-center">
                            {item.scheduled_at && (
                                <span>{item.scheduled_at}</span>
                            )}

                            {item.status_text == "processing" ? (
                                <LoaderCircle className="size-5 animate-spin" />
                            ) : (item.status_text == 'success' ? (
                                <Check className="size-5 animate-rotate-y animate-once animate-ease-in-out" />
                            ) :
                                <Clock className="size-5" />
                            )}
                        </ItemActions>
                    </Item>
                ))) : (
                    <div className="w-full flex justify-center text-muted-foreground">
                        {isLoad ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ): (
                            <>ไม่มีรายการที่กำลังทำ</>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
