import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import web from '@/routes/web';
import { type BreadcrumbItem } from '@/types';
import { ServerType } from '@/types/user';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { set, z } from 'zod';
import { Loader, Plus, X, Server } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/routes/api';
import { toast } from 'sonner';
import { PlanType } from '@/types/plan';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Plan',
        href: web.dashboard.admins.plans.add().url,
    },
];

// Zod schema for plan form
const planSchema = z.object({
    name: z.string().min(1, "ชื่อเป็นสิ่งจำเป็น"),
    description: z.string().optional().nullable(),
    details: z.string().optional().nullable(),
    price: z.number().min(0, "ราคาต้องเป็นตัวเลขที่มากกว่า 0"),
    credits: z.number().min(0, "เครดิตต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0"),
    duration: z.number().min(1, "ระยะเวลาต้องเป็นตัวเลข"),
    duration_unit: z.string().min(1, "กรุณาเลือกหน่วยเวลา"),
    options: z.record(z.string(), z.string()).optional(),
    servers: z.array(z.string()).optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

// Server options for the options field
const serverSupportedOptions = [
    { label: "max_users", value: "max_users" },
    { label: "max_requests", value: "max_requests" },
    { label: "storage_limit", value: "storage_limit" },
    { label: "api_calls", value: "api_calls" },
    { label: "bandwidth", value: "bandwidth" },
    { label: "concurrent_connections", value: "concurrent_connections" },
    { label: "rate_limit", value: "rate_limit" },
];

const durationUnitOptions = [
    { label: "วัน", value: "1" },
    { label: "เดือน", value: "2" },
    { label: "ปี", value: "3" },
    { label: "ตลอดไป", value: "4" },
];

export default function PlanAddPage(request: any) {
    console.log(request);

    const [servers, setServers] = useState<ServerType[]>([]);
    const [plan, setPlan] = useState<PlanType>(request.plan || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFetch, setIsFetch] = useState<boolean>(false);

    const defaultValues: PlanFormValues = {
        name: plan?.name || '',
        description: plan?.description || '',
        details: plan?.details || '',
        price: Number(plan?.price) || 0,
        credits: Number(plan?.credits) || 0,
        duration: Number(plan?.duration) || 1,
        duration_unit: Number(plan?.duration_unit).toString() || '1',
        options: typeof plan?.options === 'object' && !Array.isArray(plan?.options) ? plan.options : {},
        servers: plan?.servers || [],
    };

    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema),
        defaultValues,
        mode: "onChange",
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsFetch(true);
            try {
                const way = api.admins.servers.index();
                const res = await fetch(way.url);
                const response = await res.json();
                if (res.ok) {
                    setServers(response.data);
                } else {
                    toast.error(response.message || 'Failed to fetch plans data.', { description: response.description ?? '' });
                }
            } catch (error) {
                console.error('Error fetching plans data:', error);
                toast.error('Failed to fetch plans data.');
            } finally {
                setIsFetch(false);
            }
        }
        fetchData();
    }, []);

    const onSubmit: SubmitHandler<PlanFormValues> = (data) => {
        setIsSubmitting(true);
        try {
            console.log('Form data:', data);
            // Handle form submission here
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-4">
                        {/* Submit Button Top */}
                        <div className="w-full flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                            </Button>
                        </div>

                        {/* Plan Information Card */}
                        <Card className="p-0 overflow-hidden gap-0">
                            <CardHeader className="bg-background p-4">
                                <CardTitle>ข้อมูลแผน</CardTitle>
                                <CardDescription>กรุณากรอกข้อมูลพื้นฐานของแผน</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-accent">
                                {/* Plan Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2 flex flex-col items-start">
                                            <FormLabel>ชื่อแผน *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ชื่อแผน" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Price */}
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2 flex flex-col items-start">
                                            <FormLabel>ราคา</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0.00" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Credits */}
                                <FormField
                                    control={form.control}
                                    name="credits"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2 flex flex-col items-start">
                                            <FormLabel>เครดิต</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Description */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="col-span-6 flex flex-col items-start">
                                            <FormLabel>รายละเอียดย่อ</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="รายละเอียดย่อของแผน"
                                                    className="max-h-24"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Details */}
                                <FormField
                                    control={form.control}
                                    name="details"
                                    render={({ field }) => (
                                        <FormItem className="col-span-6 flex flex-col items-start">
                                            <FormLabel>รายละเอียด</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="รายละเอียดลึกเพิ่มเติม"
                                                    className="max-h-32"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Duration */}
                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem className="col-span-3 flex flex-col items-start">
                                            <FormLabel>ระยะเวลา</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Duration Unit */}
                                <FormField
                                    control={form.control}
                                    name="duration_unit"
                                    render={({ field }) => (
                                        <FormItem className="col-span-3 flex flex-col items-start">
                                            <FormLabel>หน่วยเวลา</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="เลือกหน่วยเวลา" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {durationUnitOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Options Card */}
                        <Card className="p-0 overflow-hidden gap-0">
                            <CardHeader className="bg-background p-4">
                                <CardTitle>ตัวเลือก</CardTitle>
                                <CardDescription>เพิ่มตัวเลือกสำหรับแผนนี้</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 pt-6 bg-accent p-4">
                                <FormField
                                    control={form.control}
                                    name="options"
                                    render={({ field }) => {
                                        const options = field.value || {};
                                        const entries = Object.entries(options);

                                        return (
                                            <div className="flex flex-col gap-4">
                                                {entries.length > 0 && (
                                                    <div className="grid grid-cols-12 gap-4 mb-4">
                                                        <span className="col-span-4 font-semibold text-sm">ตัวแปร</span>
                                                        <span className="col-span-7 font-semibold text-sm">ค่า</span>
                                                        <span className="col-span-1 font-semibold text-sm text-center">ลบ</span>
                                                    </div>
                                                )}

                                                {entries.map(([key, value], index) => (
                                                    <div key={index} className="grid grid-cols-12 gap-4">
                                                        {/* Key Select */}
                                                        <Select
                                                            value={key}
                                                            onValueChange={(newKey) => {
                                                                const newOptions = { ...options };
                                                                delete newOptions[key];
                                                                newOptions[newKey] = value;
                                                                field.onChange(newOptions);
                                                            }}
                                                        >
                                                            <SelectTrigger className="col-span-4">
                                                                <SelectValue placeholder="เลือกตัวแปร" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {serverSupportedOptions.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        {/* Value Input */}
                                                        <Input
                                                            placeholder="ค่า"
                                                            value={value}
                                                            onChange={(e) => {
                                                                const newOptions = { ...options, [key]: e.target.value };
                                                                field.onChange(newOptions);
                                                            }}
                                                            className="col-span-7"
                                                        />

                                                        {/* Delete Button */}
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            className="col-span-1 h-10"
                                                            onClick={() => {
                                                                const newOptions = { ...options };
                                                                delete newOptions[key];
                                                                field.onChange(newOptions);
                                                            }}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}

                                                {/* Add Option Button */}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newOptions = { ...options };
                                                        const newKey = `option_${Date.now()}`;
                                                        newOptions[newKey] = '';
                                                        field.onChange(newOptions);
                                                    }}
                                                    className="w-fit"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    เพิ่มตัวเลือก
                                                </Button>
                                            </div>
                                        );
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Servers Card */}
                        <Card className="p-0 overflow-hidden gap-0">
                            <CardHeader className="bg-background p-4">
                                <CardTitle>เซิร์ฟเวอร์</CardTitle>
                                <CardDescription>เลือกเซิร์ฟเวอร์ที่ใช้กับแผนนี้</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 pt-6 bg-accent p-4">
                                {isFetch ? (
                                    <div className="w-full flex items-center justify-center">
                                        <Loader className="size-4 animate-spin" />
                                    </div>
                                ) : servers.length > 0 ? (
                                    <FormField
                                        control={form.control}
                                        name="servers"
                                        render={() => (
                                            <FormItem>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {servers.map((server) => (
                                                        <FormField
                                                            key={server.id}
                                                            control={form.control}
                                                            name="servers"
                                                            render={({ field }) => {
                                                                const isSelected = field.value?.includes(String(server.id));
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const current = field.value || [];
                                                                            const updated = isSelected
                                                                                ? current.filter((id) => id !== String(server.id))
                                                                                : [...current, String(server.id)];
                                                                            field.onChange(updated);
                                                                        }}
                                                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors cursor-pointer ${
                                                                            isSelected
                                                                                ? 'border-primary bg-primary/10'
                                                                                : 'border-foreground/20 hover:border-primary/50'
                                                                        }`}
                                                                    >
                                                                        <Server className="w-5 h-5 flex-shrink-0" />
                                                                        <span className="text-sm font-medium truncate">
                                                                            {server.name}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ) : (
                                    <p className="text-sm text-muted-foreground">ไม่มีเซิร์ฟเวอร์ที่สามารถใช้ได้</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Submit Button Bottom */}
                        <div className="w-full flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </AppLayout>
    );
}
