import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { Button } from './ui/button';

interface Plan {
    id: string;
    name: string;
    price: number;
    pricePerSms: number;
    totalSms: number;
    duration: string;
    recommended?: boolean;
    icon?: string;
}

const plans: Plan[] = [
    {
        id: 'starter',
        name: 'Starter',
        icon: '📍',
        price: 1000,
        pricePerSms: 0.33,
        totalSms: 3030,
        duration: '3 เดือน',
    },
    {
        id: 'basic',
        name: 'Basic',
        icon: '📍',
        price: 10000,
        pricePerSms: 0.28,
        totalSms: 35714,
        duration: '6 เดือน',
    },
    {
        id: 'corporate',
        name: 'Corporate',
        icon: '📍',
        price: 50000,
        pricePerSms: 0.24,
        totalSms: 208333,
        duration: '6 เดือน',
        recommended: true,
    },
    {
        id: 'corporate-special',
        name: 'Corporate Special',
        icon: '📍',
        price: 100000,
        pricePerSms: 0.20,
        totalSms: 500000,
        duration: '12 เดือน',
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        icon: '📍',
        price: 300000,
        pricePerSms: 0.18,
        totalSms: 1666667,
        duration: 'ตลอดชีพ',
    },
];

export function PricingPlansCard() {
    return (
        <div className="w-full">
            <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight">แพลนทั้งหมด</h2>
                <p className="text-muted-foreground mt-2">เลือกแพลนที่เหมาะสมกับความต้องการของคุณ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
                        className={`relative flex flex-col transition-all duration-300 ${
                            plan.recommended
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
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{plan.icon}</span>
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
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
                                        {plan.pricePerSms} ฿
                                    </p>
                                </div>

                                {/* Total SMS */}
                                <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">ส่งได้</p>
                                        <p className="font-semibold text-gray-800">
                                            {plan.totalSms.toLocaleString('th-TH')} sms
                                        </p>
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">อายุการใช้งาน</p>
                                        <p className="font-semibold text-gray-800">{plan.duration}</p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <Button
                                className={`w-full mt-6 py-2 h-10 rounded-lg font-medium transition-colors ${
                                    plan.recommended
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                            >
                                เลือกแพลน
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
