<?php

namespace Database\Seeders;

use App\Models\Sendings\Plan;
use App\Models\Sendings\Sender;
use App\Models\Sendings\Server;
use App\Models\Sendings\SpamWord;
use App\Models\Users\Role;
use App\Models\Users\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Crypt;

class SendingTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {


        $role1 = Role::create(['name' => 'user', 'full_name' => 'User']);
        $role2 = Role::create(['name' => 'admin', 'full_name' => 'Administrator']);


        $server = Server::create([
            'name' => 'Me SMS',
            'static_name' => 'me-sms',
            'host' => 'api.me-sms.com',
            'url' => 'https://api.me-sms.com/v1/sms',
            'method' => 'POST',
            'settings' => [
                'credits' => [
                    'amount' => 0,
                    'sync_method' => 'GET',
                    'sync_url' => '{base_url}/v1/users/balance',
                    'callback' => ['bananc', '{credit}']
                ]
            ],
            'headers' => Crypt::encryptString(json_encode(
                [
                    'Authorization' => 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTU0LCJlbWFpbCI6ImdlbWZhdGVmdWd1aUBnbWFpbC5jb20iLCJuYW1lIjoiZ2VtYnVsayIsInBob25lIjoiMDk1NjM0Njc1NiIsInN0YXR1cyI6ImFjdGl2ZSIsImNyZWF0ZWRBdCI6IjIwMjUtMDktMDVUMTc6NTg6NTIuNjAwWiIsInVwZGF0ZWRBdCI6IjIwMjUtMDktMDVUMTc6NTg6NTIuNjAwWiIsImxvbmdMaXZlVG9rZW4iOnRydWUsImlhdCI6MTc1ODQ2NTUxOSwiZXhwIjoxNzkwMDIzMTE5fQ.sJQDjwKOYALP_cB_szSnW4g7cY3CmsbOfiGRaeSXZvU',
                    'Accept' => 'application/json',
                ]
            )),
            'body' => [
                ['sender', '{sender}'],
                ['content', '{msg}'],
                ['msisdn', '{receiver}'],
            ],
            'callbacks' => [
                ['success', '{success}'], // key value success
                ['message', '{msg}'],
                ['data', '{data}']
            ],
        ]);

        $senders = [
            [
                'name' => 'GTSF',
                'server_id' =>  $server->id,
                'status' => 10,
            ],
            [
                'name' => 'KDCR-C',
                'server_id' =>  $server->id,
                'status' => 10,
            ],
            [
                'name' => 'LBTF',
                'server_id' =>  $server->id,
                'status' => 10,
            ],
            [
                'name' => 'SLL',
                'server_id' =>  $server->id,
                'status' => 10,
            ],
            [
                'name' => 'EventP',
                'server_id' =>  $server->id,
                'status' => 10,
            ],
        ];

        foreach ($senders as $item) {
            Sender::create($item);
        }

        $plan = Plan::create([
            'name' => 'Starter Set',
            'servers' => [$server->id],
            'price' => 100,
            'credits' => 1500,
        ]);

        $user = User::firstOrCreate(
            ['email' => 'a@gmail.com'],
            [
                'name' => 'Test User',
                'username' => 'test',
                'password' => '123456789',
                'roles' => [$role1->id, $role2->id],
                'plan_id' => $plan->id,
                'email_verified_at' => now(),
                'credit' => 1000000,
            ]
        );

        $server->user_id = $user->id;
        $server->save();


        $words = [
            "พนัน", "หวย", "เดิมพัน", "บาคาร่า", "สล็อต", "ยิงปลา", "มวย", "แทง", "ยิง", "นายก",
            "รัฐบาล", "หนังโป๊", "xxx", "เย็ด", "รูปโป๊", "คลิปโป๊", "แทงบอลออนไลน์",
            "คาสิโนออนไลน์", "รวย", "ยาเสพติด", "ขายยา", "เฮโรอีน", "ยาบ้า", "กัญชา",
            "รับปิดหนี้", "ปิดหนี้", "กู้เงินด่วน", "กู้เงิน", "เงินกู้", "ไม่ต้องมีสลิป",
            "ดอกเบี้ยต่ำ", "รับโอนเงิน", "ลงทุนหุ้น", "ระเบิด", "สั่งยิง", "อาวุธ",
            "bet", "casino", "slot", "football bet", "porn", "sex", "loan", "ม้า", "เดิมพัน"
        ];

        foreach ($words as $w) {
            SpamWord::create(['word' => $w]);
        }
    }
}
