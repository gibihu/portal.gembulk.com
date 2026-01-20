import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Auth, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { UserType } from '@/types/user';
import { usePage } from '@inertiajs/react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {

    const auth = usePage().props.auth as Auth;
    const user = auth.user as UserType;
    return (
        <header className={cn(
            "flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4",
            "bg-background rounded-xl",
        )}>
            <div className="flex flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2">
                <span className='text-muted-foreground text-xs font-bold'>เครดิต: {user.credits.toLocaleString()}</span>
            </div>
        </header>
    );
}
