<?php

namespace Database\Seeders;

use App\Models\Sendings\Campaign;
use App\Models\Sendings\Plan;
use App\Models\Sendings\CampaignReceiver;
use App\Models\Sendings\Sender;
use App\Models\Sendings\Servers\Server;
use App\Models\Sendings\Servers\ServerAction;
use App\Models\Sendings\SpamWord;
use App\Models\Transactions\Provider;
use App\Models\Users\Role;
use App\Models\Users\User;
use Illuminate\Database\Seeder;

class SendingTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $server = Server::create([
            'name' => 'Siam SMS',
            'host' => 'https://member.ac-siam-sms.com',
        ]);

        $server_actions_data = [
            [
                "server_id" => $server->id,
                "action_key" => "sms",
                "method" => "POST",
                "endpoint" => "https://api.ac-siam-sms.com/api/smsapi/send",
                "headers" => [
                    "Content-Type" => "application/json",
                    "x-api-key" => "XC-8zKnQ9dumyq16UbtJEml1ks_mOXyu",
                ],
                "body" => [
                    [
                        "message" => "message",
                        "isArray" => false
                    ],
                    [
                        "sender" => "sender_name",
                        "isArray" => false
                    ],
                    [
                        "receivers" => "phone_numbers",
                        "isArray" => false
                    ],
                    [
                        "scheduled_at" => "send_at",
                        "isArray" => false
                    ]
                ],
                "response" => [
                    "success" => "success",
                    "message" => "message",
                    "ref_id" => "campaign_id",
                    "credits" => "credits",
                ],
                "settings" => null,
                "status" => 0,
            ],
            [
                "server_id" => $server->id,
                "action_key" => "sms_report",
                "method" => "GET",
                "endpoint" => "https://api.ac-siam-sms.com/api/smsapi/report",
                "headers" => [
                    "Content-Type" => "application/json",
                    "x-api-key" => "XC-8zKnQ9dumyq16UbtJEml1ks_mOXyu",
                ],
                "body" => [
                    [
                        "ref_id" => "campaign_id",
                        "isArray" => false
                    ],
                ],
                "response" => [
                    "message" => "message",
                    "credits_refund" => "campaigns.0.credits_refund",
                    "total_receiver" => "campaigns.0.all_numbers",
                    "passed" => "campaigns.0.success",
                    "sent" => "campaigns.0.sent",
                    "failed" => "campaigns.0.failed",
                    "pending" => "campaigns.0.pending",
                    "sender_name" => "campaigns.0.sender_name",
                    "ref_id" => "campaigns.0.id",
                    "campaign_name" => "campaigns.0.campaign_name",
                ],
                "settings" => null,
                "status" => 0,
            ],
            [
                "server_id" => $server->id,
                "action_key" => "otp",
                "method" => "POST",
                "endpoint" => "https://api.ac-siam-sms.com/api/smsapi/send",
                "headers" => [
                    "Content-Type" => "application/json",
                    "x-api-key" => "XC-8zKnQ9dumyq16UbtJEml1ks_mOXyu",
                ],
                "body" => [
                    [
                        "message" => "message",
                        "isArray" => false
                    ],
                    [
                        "sender" => "sender_name",
                        "isArray" => false
                    ],
                    [
                        "receivers" => "phone_numbers",
                        "isArray" => false
                    ],
                    [
                        "scheduled_at" => "send_at",
                        "isArray" => false
                    ]
                ],
                "response" => [
                    "success" => "success",
                    "message" => "message",
                    "ref_id" => "campaign_id",
                    "credits" => "credits",
                ],
                "settings" => null,
                "status" => 0,
            ],
            [
                "server_id" => $server->id,
                "action_key" => "otp_report",
                "method" => "GET",
                "endpoint" => "https://api.ac-siam-sms.com/api/smsapi/report",
                "headers" => [
                    "Content-Type" => "application/json",
                    "x-api-key" => "XC-8zKnQ9dumyq16UbtJEml1ks_mOXyu",
                ],
                "body" => [
                    [
                        "ref_id" => "campaign_id",
                        "isArray" => false
                    ],
                ],
                "response" => [
                    "message" => "message",
                    "credits_refund" => "campaigns.0.credits_refund",
                    "total_receiver" => "campaigns.0.all_numbers",
                    "passed" => "campaigns.0.success",
                    "sent" => "campaigns.0.sent",
                    "failed" => "campaigns.0.failed",
                    "pending" => "campaigns.0.pending",
                    "sender_name" => "campaigns.0.sender_name",
                    "ref_id" => "campaigns.0.id",
                    "campaign_name" => "campaigns.0.campaign_name",
                ],
                "settings" => null,
                "status" => 0,
            ],
        ];

        foreach ($server_actions_data as $action) {
            $server->actions()->updateOrCreate(
                [
                    'server_id' => $server->id,
                    'action_key' => $action['action_key'],
                ],
                [
                    'method' => $action['method'] ?? 'POST',
                    'endpoint' => $action['endpoint'] ?? '',
                    'headers' => $action['headers'] ?? [],
                    'body' => $action['body'] ?? [],
                    'response' => $action['response'] ?? [],
                    'status' => ServerAction::STATUS_DRAFT,
                ]
            );
        }

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
                'name' => 'SeaDentinY',
                'server_id' =>  $server->id,
                'status' => 10,
            ],
        ];

        foreach ($senders as $item) {
            $sender = Sender::create($item);
        }

        $plans = [
            [
                'name' => 'Starter',
                'servers' => [$server->id],
                'price' => 1000,
                'credit_limit' => 3030,
                'status' => Plan::STATUS_PUBLISHED,
                'duration' => 3,
                'duration_unit' => Plan::DURATION_UNIT_MONTHS,
                'more_than' => 0.33,
            ],
            [
                'name' => 'Basic',
                'servers' => [$server->id],
                'price' => 10000,
                'credit_limit' => 35741,
                'status' => Plan::STATUS_PUBLISHED,
                'duration' => 6,
                'duration_unit' => Plan::DURATION_UNIT_MONTHS,
                'more_than' => 0.28,
            ],
            [
                'name' => 'Corporate',
                'description' => 'รายละเอียกจำลอง',
                'servers' => [$server->id],
                'price' => 50000,
                'credit_limit' => 208333,
                'status' => Plan::STATUS_PUBLISHED,
                'duration' => 6,
                'duration_unit' => Plan::DURATION_UNIT_MONTHS,
                'more_than' => 0.24,
                'recommended' => true,
                'tax_rate' => 0.07,
            ],
            [
                'name' => 'Corporate Special',
                'servers' => [$server->id],
                'price' => 100000,
                'credit_limit' => 500000,
                'status' => Plan::STATUS_PUBLISHED,
                'duration' => 12,
                'duration_unit' => Plan::DURATION_UNIT_MONTHS,
                'more_than' => 0.2,
            ],
            [
                'name' => 'Enterprise',
                'servers' => [$server->id],
                'price' => 300000,
                'credit_limit' => 1666667,
                'status' => Plan::STATUS_PUBLISHED,
                'duration' => 999,
                'duration_unit' => Plan::DURATION_UNIT_LIFETIME,
                'more_than' => 0.18,
            ]
        ];

        foreach ($plans as $plan) {
            $plan = Plan::create($plan);
        }

        $role1 = Role::create(['name' => 'user', 'full_name' => 'User']);
        $role2 = Role::create(['name' => 'admin', 'full_name' => 'Administrator']);

        $user = User::firstOrCreate(
            ['email' => 'a@gmail.com'],
            [
                'name' => 'Test User',
                'username' => 'test',
                'password' => '123456789',
                'roles' => [$role1->name, $role2->name],
                'email_verified_at' => now(),
                'verified_at' => now(),
                'credits' => 10000,
                'plan_id' => $plan->id,
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

        Provider::create([
            'name' => 'p2wpay',
            'code' => 'p2wpay',
            'host' => 'p2wpay.com',
            'status' => Provider::STATUS_ACTIVE,
        ]);
    }
}
