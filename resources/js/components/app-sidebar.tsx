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
import { AudioWaveform, BookOpen, Bot, Command, Folder, Frame, GalleryVerticalEnd, LayoutGrid, LifeBuoy, PieChart, Send, Settings2, SquareTerminal, Map, Notebook, Layers, Server, ChartSpline, Wallet, Ticket, TicketCheck } from 'lucide-react';
import AppLogo from './app-logo';
import { NavProjects } from './nav-project';
import web from '@/routes/web';
import { UserType } from '@/types/user';
import { check } from 'node_modules/zod/v4/classic/external.cjs';

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
                    title: "Sender",
                    href: web.dash.senders.add().url,
                    icon: Ticket,
                    isActive: false,
                },
                {
                    title: "SMS",
                    href: web.dash.sending.sms.add().url,
                    icon: Notebook,
                    isActive: false,
                },
                {
                    title: "OTP Template",
                    href: web.dash.otp.template.url(),
                    icon: Notebook,
                    isActive: false,
                },
                {
                    title: "Jobs",
                    href: web.dash.jobs.sms().url,
                    icon: Bot,
                    isActive: false,
                },
                {
                    title: "Reports",
                    href: web.dash.campaigns.reports().url,
                    icon: Layers,
                    isActive: false,
                },
            ],
        },
        ...(isAdmin
            ? [
                {
                    title: "Administration",
                    items: [
                        {
                            title: "Server",
                            href: web.dash.admin.server.lists().url,
                            icon: Server,
                            isActive: false,
                        },
                        {
                            title: "อนุมัติผู้ส่ง",
                            href: web.dash.admin.senders.requests().url,
                            isActive: true,
                            icon: TicketCheck
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
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                {/* <NavProjects projects={data.projects} /> */}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
