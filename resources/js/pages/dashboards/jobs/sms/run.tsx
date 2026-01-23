import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";
import api from "@/routes/api";
import web from "@/routes/web";
import { BreadcrumbItem } from "@/types";
import { CampaignReceiverType, CampaignType } from "@/types/user";
import { Head, router } from "@inertiajs/react";
import { Check, Clock, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'ทำงาน',
        href: web.dashboard.jobs.sms().url,
    },
];

export default function SmsRunJobPage(request: any) {
    const [rawItems, setRawItems] = useState<CampaignType[]>([]);
    const [items, setItems] = useState<CampaignType[]>([]);
    const [isFetch, setIsFetch] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    console.log(rawItems);


    useEffect(() => {
        setRawItems(request.jobs as CampaignType[]);
        setIsLoading(false);
    }, [request.jobs]);


    useEffect(() => {
        setItems([...rawItems].sort((a, b) => b.status - a.status));
    }, [rawItems]);


    useEffect(() => {
        const interval = setInterval(() => {
            handleSyncJob();
            // router.reload();
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    async function handleSyncJob() {
        try {
            setIsFetch(true);
            const res = await fetch(api.job.sms().url);
            const result = await res.json();

            if (result.code === 200) {
                const newData: CampaignType[] = result.data;

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

                    // 🟡 3. ให้แสดง under_review 3 วิ แล้วค่อยลบ
                    removedItems.forEach((removed) => {
                        const updated = { ...removed, status_text: "under_review" };
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
            <div className="flex flex-col gap-2">
                {items.length > 0 ? (items.map((item: CampaignType, key: number) => (
                    item.receiver_s?.map((r: CampaignReceiverType, k: number) => (
                        <Item variant="outline" key={key} className={cn("shadow-md bg-background", item.status_text == "processing" && "bg-primary/30 border-primary", item.status_text == "under_review" && "bg-green-600/30 border-green-600/30")}>
                            <ItemContent>
                                <ItemTitle>+{r.receiver}</ItemTitle>
                                <ItemDescription>
                                    {r.message}
                                </ItemDescription>
                            </ItemContent>
                            <ItemActions className="flex items-center justify-center">
                                {item.scheduled_at && (
                                    <span>{item.scheduled_at}</span>
                                )}

                                {item.status_text == "processing" ? (
                                    <LoaderCircle className="stroke-primary size-5 animate-spin" />
                                ) : (item.status_text == 'under_review' ? (
                                    <Check className="stroke-green-500 size-5 animate-rotate-y animate-once animate-ease-in-out" />
                                ) :
                                    <Clock className="size-5" />
                                )}
                            </ItemActions>
                        </Item>
                    ))
                ))) : (
                    <div className="w-full flex justify-center text-muted-foreground">
                        {isLoading ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <>ไม่มีรายการที่กำลังทำ</>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
