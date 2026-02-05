import { useState, useEffect, JSX } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { Loader, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import web from '@/routes/web';
import { UserType } from '@/types/user';
import api from '@/routes/api';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: web.dashboard.admins.users.index().url
    },
];

export default function Page(request: any) {
    const [users, setUsers] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedUser, setSelectedUser] = useState<UserType>();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const way = api.admins.users.index();
                const res = await fetch(way.url);
                const response = await res.json();
                if (response.code == 200) {
                    setUsers(response.data ?? []);
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดบางอย่าง");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleUserUpdate = (updatedUser: UserType) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        setSelectedUser(updatedUser);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <div className="flex flex-col lg:flex-row gap-4 ">
                <div className="w-full lg:w-2/6">
                    <Card className='p-4'>
                        {selectedUser ? (
                            <UserInfo data={selectedUser} onchange={handleUserUpdate} />
                        ) : (
                            <div className="w-full h-full flex justify-center items-center border border-dashed rounded-lg py-12">
                                <span className='text-muted-foreground'>เลือกผู้ใช้</span>
                            </div>
                        )}
                    </Card>
                </div>
                <Card className='flex-1'>
                    <CardHeader></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='w-[100px]'>Name</TableHead>
                                    <TableHead className='w-[100px]'>Email</TableHead>
                                    <TableHead className='w-[100px]'>Credits</TableHead>
                                    <TableHead>Badges</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!isLoading && (
                                    users.map((user: UserType, key: number) => (
                                        <TableRow key={key} onClick={() => setSelectedUser(user)} className={`cursor-pointer ${selectedUser?.id === user.id ? 'bg-muted/50' : ''}`}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{Number(user.credits).toLocaleString()}</TableCell>
                                            <TableCell className='flex gap-1'>
                                                {user.roles.map((role: string, index: number) => (
                                                    <Badge variant="outline" key={index}>
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        {isLoading && (
                            <div className="w-full flex justify-center py-4">
                                <Loader className='size-4 animate-spin' />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function UserInfo({ data, onchange }: { data: UserType, onchange: (e: UserType) => void }): JSX.Element {
    const getInitials = useInitials();
    const page = usePage().props;
    const csrfToken = page.csrf as string;
    const [creditChange, setCreditChange] = useState<number>(0);
    const [isFetch, setIsFetch] = useState<boolean>(false);
    const [item, setItem] = useState<UserType>(data);
    const [roles, setRoles] = useState<string[]>(data.roles);

    useEffect(() => {
        setItem(data);
        setRoles(data.roles);
        setCreditChange(0);
    }, [data]);

    async function onSubmitCredit() {
        try {
            setIsFetch(true);
            const way = api.admins.users.store();
            const res = await fetch(way.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken,
                },
                body: JSON.stringify({
                    user_id: item.id,
                    credit_change: creditChange,
                    roles: roles,
                }),
            });
            const response = await res.json();
            if (response.code == 200) {
                const updatedItem = {
                    ...item,
                    credits: response.data.credits,
                    roles: roles,
                };
                onchange(updatedItem);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดบางอย่าง");
        } finally {
            setIsFetch(false);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Avatar className='size-20'>
                <AvatarImage src={item.avatar} />
                <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-0">
                    <div className="flex gap-2 items-center">
                        <span className="font-semibold">{item.name}</span>
                        {item.email_verified_at && <BadgeCheck className='size-4 text-primary' />}
                    </div>
                    <div className="flex flex-col text-sm text-muted-foreground">
                        <span>{item.email}</span>
                        <span>@{item.username}</span>
                    </div>
                </div>

                <div className="flex gap-1">
                    <Toggle variant="outline" size="sm" disabled pressed={true}>User</Toggle>
                    <Toggle
                        variant="outline"
                        size="sm"
                        pressed={roles.includes('admin')}
                        onPressedChange={(pressed) => {
                            setRoles(prev => pressed ? [...prev, 'admin'] : prev.filter(r => r !== 'admin'));
                        }}
                    >
                        Admin
                    </Toggle>
                </div>

                <div className="flex flex-col gap-2">
                    <Label className="text-xs">Adjust Credits (+/-):</Label>
                    <div className="flex justify-between items-center gap-4">
                        <span className="font-mono">{Number(item.credits).toLocaleString()}</span>
                        <Input
                            type="number"
                            placeholder='0'
                            value={creditChange || ''}
                            onChange={e => setCreditChange(Number(e.target.value))}
                            className='h-8 w-[80px] text-center'
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button size="sm" onClick={onSubmitCredit} disabled={isFetch}>
                        {isFetch && <Loader className='mr-2 size-4 animate-spin' />}
                        บันทึก
                    </Button>
                </div>
            </div>
        </div>
    );
}