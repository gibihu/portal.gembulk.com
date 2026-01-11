import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavGroup, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AudioWaveform, BookOpen, Bot, Command, Folder, Frame, GalleryVerticalEnd, LayoutGrid, LifeBuoy, PieChart, Send, Settings2, SquareTerminal, Map, Notebook, Layers, Server, ChartSpline, Wallet, Ticket } from 'lucide-react';
import AppLogo from './app-logo';
import { NavProjects } from './nav-project';
import web from '@/routes/web';
import { UserType } from '@/types/user';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: web.dash.index(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];


export function AppSidebar() {
    const auth = usePage().props.auth as any;
    const user = auth?.user as UserType;
    const isAdmin = user?.roles?.some(r => r === "admin") ?? false;
    const mainNavItems: NavGroup[] = [
        {
            title: "Platform",
            items: [
                {
                    title: "Server",
                    href: web.dash.server.lists().url,
                    icon: Server,
                    isActive: false,
                    items: [
                        {
                            title: "List",
                            href: web.dash.server.lists().url,
                        },
                    ],
                },
                {
                    title: "Sender",
                    href: web.dash.senders.add().url,
                    icon: Ticket,
                    isActive: false,
                    items: [
                        {
                            title: "Add",
                            href: web.dash.senders.add().url,
                        },
                    ],
                },
                {
                    title: "Creating",
                    href: web.dash.create.sms().url,
                    icon: Notebook,
                    isActive: false,
                    items: [
                        {
                            title: "SMS",
                            href: web.dash.create.sms().url,
                        },
                        {
                            title: "OTP",
                            href: web.dash.create.otp().url,
                        },
                    ],
                },
                {
                    title: "Sending",
                    href: web.dash.sending.sms().url,
                    icon: Send,
                    isActive: false,
                    items: [
                        {
                            title: "SMS",
                            href: web.dash.sending.sms().url,
                        },
                        {
                            title: "OTP",
                            href: web.dash.sending.otp().url,
                        },
                    ],
                },
                {
                    title: "Jobs",
                    href: web.dash.jobs.sms().url,
                    icon: Bot,
                    isActive: false,
                    items: [
                        {
                            title: "SMS",
                            href: web.dash.jobs.sms().url,
                        },
                        {
                            title: "OTP",
                            href: web.dash.jobs.otp().url,
                        },
                    ],
                },
                {
                    title: "Reports",
                    href: web.dash.report.sms().url,
                    icon: Layers,
                    isActive: false,
                    items: [
                        {
                            title: "SMS",
                            href: web.dash.report.sms().url,
                        },
                        {
                            title: "OTP",
                            href: web.dash.report.otp().url,
                        },
                    ],
                },
            ],
        },
        ...(isAdmin
            ? [
                {
                    title: "พื้นที่ทำงาน",
                    items: [
                        {
                            title: "ผู้ใช้",
                            href: "#",
                            isActive: true,
                            icon: Layers
                        },
                        {
                            title: "ทีเด็ดทั้งหมด",
                            href: "#",
                            isActive: true,
                            icon: Layers,
                        },
                        {
                            title: "รายการพอยต์",
                            href: "#",
                            isActive: true,
                            icon: Layers
                        },
                        {
                            title: "รายงาน",
                            href: "#",
                            isActive: true,
                            icon: Layers,
                        },
                    ],
                },
            ]
            : []
        )

    ];
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={web.dash.index()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {/* <NavProjects projects={data.projects} /> */}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
