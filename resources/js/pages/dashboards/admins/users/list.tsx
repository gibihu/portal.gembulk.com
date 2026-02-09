import { useState, useEffect, JSX } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { Loader, BadgeCheck, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import { Textarea } from '@/components/ui/textarea';
import web from '@/routes/web';
import { UserType, UserVerificationType } from '@/types/user';
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
                    <CardHeader>
                        <div className="w-full flex justify-end">
                            <Link href={web.dashboard.admins.users.verify().url}>
                                <Button>ยืนยันตัวตน</Button>
                            </Link>
                        </div>
                    </CardHeader>
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
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <span>{user.name}</span>
                                                    {hasPendingVerification(user) && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            ขอยืนยันตัวตน
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
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

function getPendingVerification(user?: UserType): UserVerificationType | undefined {
    const list = user?.verifications ?? [];
    // prioritize "pending/processing" first; if multiple, pick latest by submitted_at/created_at
    const candidates = list.filter(v => v.status_text === 'pending' || v.status_text === 'processing');
    if (candidates.length === 0) return undefined;
    return [...candidates].sort((a, b) => {
        const at = a.submitted_at ?? a.created_at;
        const bt = b.submitted_at ?? b.created_at;
        return String(bt).localeCompare(String(at));
    })[0];
}

function hasPendingVerification(user?: UserType): boolean {
    return Boolean(getPendingVerification(user));
}

function encodeBase64(input: string): string {
    // uuid is safe for btoa; still handle SSR/node just in case
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') return window.btoa(input);
    const Buf = (globalThis as any)?.Buffer;
    if (Buf) return Buf.from(input, 'utf8').toString('base64');
    return input;
}

function UserInfo({ data, onchange }: { data: UserType, onchange: (e: UserType) => void }): JSX.Element {
    const getInitials = useInitials();
    const page = usePage().props;
    const csrfToken = page.csrf as string;
    const [creditChange, setCreditChange] = useState<number>(0);
    const [isFetch, setIsFetch] = useState<boolean>(false);
    const [item, setItem] = useState<UserType>(data);
    const [roles, setRoles] = useState<string[]>(data.roles);
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [editedName, setEditedName] = useState<string>(data.name);
    const [newPassword, setNewPassword] = useState<string>('');
    const [verificationDecision, setVerificationDecision] = useState<'completed' | 'rejected' | null>(null);
    const [rejectedReason, setRejectedReason] = useState<string>('');

    useEffect(() => {
        setItem(data);
        setRoles(data.roles);
        setCreditChange(0);
        setEditedName(data.name);
        setIsEditingName(false);
        setNewPassword('');
        setVerificationDecision(null);
        setRejectedReason('');
    }, [data]);

    async function onSubmitCredit() {
        try {
            setIsFetch(true);
            const way = api.admins.users.store();
            const body: any = {
                user_id: item.id,
                credit_change: creditChange,
                roles: roles,
            };

            if (editedName !== item.name) {
                body.name = editedName;
            }

            if (newPassword) {
                body.password = newPassword;
            }

            const res = await fetch(way.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken,
                },
                body: JSON.stringify(body),
            });
            const response = await res.json();
            if (response.code == 200) {
                const updatedItem = {
                    ...item,
                    name: response.data.name ?? item.name,
                    credits: response.data.credits,
                    roles: roles,
                };
                setItem(updatedItem);
                setIsEditingName(false);
                setNewPassword('');
                toast.success('บันทึกข้อมูลเรียบร้อยแล้ว');
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

    const pendingVerification = getPendingVerification(item);

    async function onSubmitVerificationDecision() {
        if (!pendingVerification) return;
        if (!verificationDecision) {
            toast.error('กรุณาเลือกผลการพิจารณา (ผ่าน/ไม่ผ่าน)');
            return;
        }
        if (verificationDecision === 'rejected' && !rejectedReason.trim()) {
            toast.error('กรุณาระบุเหตุผลกรณีไม่ผ่าน');
            return;
        }

        try {
            setIsFetch(true);
            const way = api.admins.users.verifications.update();
            const res = await fetch(way.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify({
                    verification_id: pendingVerification.id,
                    status: verificationDecision,
                    rejected_reason: verificationDecision === 'rejected' ? rejectedReason : null,
                }),
            });
            const response = await res.json();
            if (response.code === 200) {
                const updatedVerification: UserVerificationType = response.data;
                const updatedUser: UserType = {
                    ...item,
                    verifications: (item.verifications ?? []).map(v => v.id === updatedVerification.id ? updatedVerification : v),
                };
                setItem(updatedUser);
                toast.success('บันทึกผลการยืนยันตัวตนเรียบร้อยแล้ว');
                onchange(updatedUser);
                setVerificationDecision(null);
                setRejectedReason('');
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
                        {isEditingName ? (
                            <Input
                                type="text"
                                value={editedName}
                                onChange={e => setEditedName(e.target.value)}
                                onBlur={() => setIsEditingName(false)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        setIsEditingName(false);
                                    } else if (e.key === 'Escape') {
                                        setEditedName(item.name);
                                        setIsEditingName(false);
                                    }
                                }}
                                className="h-8 font-semibold"
                                autoFocus
                            />
                        ) : (
                            <>
                                <span className="font-semibold">{item.name}</span>
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="p-1 hover:bg-muted rounded transition-colors"
                                    type="button"
                                >
                                    <Pencil className='size-4 text-muted-foreground hover:text-foreground' />
                                </button>
                            </>
                        )}
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

                <div className="flex flex-col gap-2">
                    <Label className="text-xs">Reset Password (optional):</Label>
                    <Input
                        type="password"
                        placeholder='กรอกรหัสผ่านใหม่'
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className='h-8'
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <Button size="sm" onClick={onSubmitCredit} disabled={isFetch}>
                        {isFetch && <Loader className='mr-2 size-4 animate-spin' />}
                        บันทึก
                    </Button>
                </div>
            </div>

            {pendingVerification && (
                <div className="mt-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">คำขอยืนยันตัวตน</span>
                            <Badge variant="secondary" className="text-xs">
                                {pendingVerification.status_text === 'pending' ? 'รอดำเนินการ' : 'กำลังตรวจสอบ'}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {pendingVerification.data?.person_type == 'individual' ? (
                            <Badge variant="default" className="text-xs">
                                บุคคลธรรมดา
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-xs">
                                นิติบุคคล
                            </Badge>
                        )}
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                        <Label className="text-xs">ไฟล์ที่ผู้ใช้ส่งมา:</Label>
                        <div className="flex flex-col gap-1 text-sm">
                            {(pendingVerification.data?.file_ids ?? []).length === 0 && (
                                <span className="text-muted-foreground">ไม่พบไฟล์</span>
                            )}
                            {(pendingVerification.data?.file_ids ?? []).map((fileId: string, idx: number) => {
                                const encoded = encodeBase64(fileId);
                                const fileUrl = web.f({ id: encoded }).url;
                                return (
                                    <a
                                        key={`${fileId}-${idx}`}
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline underline-offset-4 hover:text-primary truncate"
                                    >
                                        {fileUrl}
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                        <Label className="text-xs">ผลการพิจารณา:</Label>
                        <div className="flex gap-2">
                            <Toggle
                                variant="outline"
                                size="sm"
                                pressed={verificationDecision === 'completed'}
                                onPressedChange={(pressed) => setVerificationDecision(pressed ? 'completed' : null)}
                                disabled={isFetch}
                            >
                                ผ่าน
                            </Toggle>
                            <Toggle
                                variant="outline"
                                size="sm"
                                pressed={verificationDecision === 'rejected'}
                                onPressedChange={(pressed) => setVerificationDecision(pressed ? 'rejected' : null)}
                                disabled={isFetch}
                            >
                                ไม่ผ่าน
                            </Toggle>
                        </div>
                    </div>

                    {verificationDecision === 'rejected' && (
                        <div className="mt-3 flex flex-col gap-2">
                            <Label className="text-xs">เหตุผลที่ไม่ผ่าน:</Label>
                            <Textarea
                                placeholder="ระบุเหตุผล เช่น เอกสารไม่ชัดเจน / ข้อมูลไม่ครบถ้วน"
                                value={rejectedReason}
                                onChange={(e) => setRejectedReason(e.target.value)}
                                disabled={isFetch}
                            />
                        </div>
                    )}

                    <div className="mt-3 flex justify-end">
                        <Button size="sm" onClick={onSubmitVerificationDecision} disabled={isFetch}>
                            {isFetch && <Loader className='mr-2 size-4 animate-spin' />}
                            บันทึกผล
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}