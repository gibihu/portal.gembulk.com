import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatNumberShort } from "@/lib/number";
import { cn } from "@/lib/utils";
import { CircleCheck, CircleMinus, CircleX } from "lucide-react";

function HeaderMenu() {
    return (
        <div className="w-full bg-background shadow-lg border-b-1 py-4 sticky top-0">
            sdasd
        </div>
    );
}



interface PackageType {
    name?: string,
    price?: number,
    perPrice?: string,
    items?: {
        title: string;
        option: number;
    }[],
    background?: string,
    isPopular?: boolean,
    popular_text?: string,
    detail_class?: string,
}
function PackCard(
    {
        data: {
            name,
            price = 0,
            perPrice = 'month',
            background,
            items,
            isPopular = false,
            popular_text = 'popular',
            detail_class,
        }
    }: {
        data: PackageType
    }
) {
    return (
        <Card className={cn("min-w-[280px] flex flex-col gap-0 rounded-xl shadow-xl p-0 mt-4")}>
            <CardHeader className="p-0 relative">
                {isPopular && popular_text && (
                    <div className="w-full flex flex-col gap-2 py-1 absolute -translate-y-full top-2 bg-primary rounded-tl-xl rounded-tr-xl pb-2">
                        <div className="text-center text-lg font-bold text-white uppercase">{popular_text}</div>
                    </div>
                )}
            </CardHeader>
            <CardContent className={cn("h-full rounded-xl py-8 flex flex-col gap-8 justify-between bg-gradient-to-t z-10", background)}>
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-end justify-center">
                            <span className="text-6xl text-background uppercase">{formatNumberShort(price)}</span>
                            <span className="pb-2 text-background/80">/{perPrice}</span>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        {items?.map((item: { title: string, option: number }, index: number) => (
                            <div className="flex gap-1 items-center">
                                {item.option == -1 ?
                                    <CircleX className="size-5 fill-danger text-white [&>*:nth-child(1)]:stroke-danger" />
                                    : item.option == 0 ?
                                        <CircleMinus className="size-5 fill-accent-foreground text-white [&>*:nth-child(1)]:stroke-accent-foreground" />
                                        :
                                        <CircleCheck className="size-5 fill-primary text-white [&>*:nth-child(1)]:stroke-primary" />
                                }
                                <span className={cn("text-foreground font-medium", detail_class)}>{item.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <CardFooter className="mt-4 p-0">
                    <Button className="w-full font-bold h-10">
                        สมัคร
                    </Button>
                </CardFooter>
            </CardContent>
        </Card>
    );
}

export default function WelcomePage() {

    const packageList: PackageType[] = [
        {
            name: 'Starter Set',
            price: 50000,
            perPrice: 'month',
            background: 'from-foreground to-purple-500',
            detail_class: 'text-background',
            isPopular: true,
            items: [
                {
                    title: '50,000 เครดิต',
                    option: -1,
                },
                {
                    title: '50,000 เครดิต',
                    option: 0,
                },
                {
                    title: '50,000 เครดิต',
                    option: 1,
                },
            ]
        },
        {
            name: 'Starter Set',
            price: 0,
            perPrice: 'month',
            background: 'from-background to-purple-500',
            items: [
                {
                    title: '50,000 เครดิต',
                    option: -1,
                },
                {
                    title: '50,000 เครดิต',
                    option: 0,
                },
                {
                    title: '50,000 เครดิต',
                    option: 1,
                },
            ]
        },
        {
            name: 'Starter Set',
            price: 0,
            perPrice: 'month',
            background: 'from-background to-purple-500',
            items: [
                {
                    title: '50,000 เครดิต',
                    option: -1,
                },
                {
                    title: '50,000 เครดิต',
                    option: 0,
                },
                {
                    title: '50,000 เครดิต',
                    option: 1,
                },
            ]
        },
        {
            name: 'Starter Set',
            price: 0,
            perPrice: 'month',
            background: 'from-background to-purple-500',
            items: [
                {
                    title: '50,000 เครดิต',
                    option: -1,
                },
                {
                    title: '50,000 เครดิต',
                    option: 0,
                },
                {
                    title: '50,000 เครดิต',
                    option: 1,
                },
            ]
        },
    ];

    return (
        <div className="flex flex-col w-screen h-screen">
            <HeaderMenu />
            <div className="w-full h-full flex flex-col bg-accent">
                {/* package */}

                <div className="flex flex-col items-center justify-center py-12">
                    <div className="grid grid-cols-4 gap-12 max-w-[1140px]">
                        {packageList.map((pack: PackageType, key: number) => (
                            <PackCard data={pack} />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}