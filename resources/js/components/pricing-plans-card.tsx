import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader } from 'lucide-react';
import { Button } from './ui/button';
import { PlanType } from '@/types/plan';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/routes/api';
import { Link } from '@inertiajs/react';
import web from '@/routes/web';
import { id } from 'date-fns/locale';


export function PricingPlansCard() {

    const [plans, setPlans] = useState<PlanType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const way = api.plans.index();
                const res = await fetch(way.url);
                const response = await res.json();
                if (res.ok) {
                    setPlans(response.data);
                } else {
                    toast.error(response.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลแผน', { description: response.description ?? '' });
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error('เกิดข้อผิดพลาดในการบันทึกแผน', { description: error instanceof Error ? error.message : '' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {isLoading ? (
                <div className="col-span-full flex justify-center text-center py-10">
                    <Loader className="size-4 animate-spin text-gray-500" />
                </div>
            ) : (
                plans.map((plan: PlanType, key: number) => (
                <PlanCard key={key} plan={plan} />
            )))}
        </div>
    );
}

export function PlanCard({ plan, is_paid }: { plan: PlanType, is_paid?: boolean }) {
    return (
        <Card
            className={`relative flex flex-col transition-all duration-300 ${plan.recommended
                ? 'lg:scale-105 border-2 border-blue-500 shadow-lg shadow-blue-200'
                : 'hover:shadow-md'
                }`}
        >
            {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white whitespace-nowrap">
                        ⭐️⭐️⭐️ แนะนำ
                    </Badge>
                </div>
            )}

            <CardHeader>
                <div className="flex items-center gap-2 justify-between relative">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <span className="text-4xl absolute -top-10 -right-10">📌</span>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                    {/* Price Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">แพ็คเกจ</p>
                        <p className="text-2xl font-bold text-blue-600">
                            ฿{plan.price.toLocaleString('th-TH')}
                        </p>
                    </div>

                    {/* Price Per SMS */}
                    <div className="border-l-4 border-blue-500 pl-3">
                        <p className="text-xs text-gray-500">ราคา/SMS</p>
                        <p className="text-lg font-semibold text-gray-800">
                            {(plan.price / plan.credit_limit).toLocaleString('th-TH')} ฿
                        </p>
                    </div>

                    {/* Total SMS */}
                    <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-500">ส่งได้</p>
                            <p className="font-semibold text-gray-800">
                                {plan.credit_limit.toLocaleString('th-TH')} sms
                            </p>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-500">อายุการใช้งาน</p>
                            {
                                plan.duration_unit_text !== 'lifetime' ? (
                                    <p className="font-semibold text-gray-800">{plan.duration} {plan.duration_unit_th_text}</p>
                                ) : (
                                    <p className="font-semibold text-gray-800">ตลอดชีวิต</p>
                                )
                            }
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                {!is_paid && (
                    <Link href={web.dashboard.plans.payment({ id: plan.id }).url}>
                        <Button
                            className={`w-full mt-6 py-2 h-10 rounded-lg font-medium transition-colors ${plan.recommended
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                        >
                            เลือกแพลน
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
