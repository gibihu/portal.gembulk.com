# Laravel Artisan Commands

คำสั่ง artisan ที่ใช้บ่อยและมีประโยชน์ในการพัฒนา Laravel

## 🚀 คำสั่งพื้นฐาน (Basic Commands)

```bash
# เริ่มต้นโครงการ
composer install
php artisan migrate:fresh --seed

# เรียกใช้ development server
php artisan serve

# ล้างแคช
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
```

## 📦 Database & Migration

```bash
# สร้าง migration ใหม่
php artisan make:migration create_table_name

# รัน migration
php artisan migrate
php artisan migrate:fresh          # ล้างและรัน migration ใหม่
php artisan migrate:fresh --seed   # ล้าง รัน และ seed ทั้งหมด

# ย้อนกลับ migration
php artisan migrate:rollback
php artisan migrate:rollback --step=1  # ย้อนกลับ 1 ขั้น

# แสดงสถานะ migration
php artisan migrate:status
```

## 🛠️ Model & Resource Generation

```bash
# สร้าง Model
php artisan make:model Post
php artisan make:model Post -m                      # พร้อม migration
php artisan make:model Post -mcs                    # พร้อม migration, controller, seeder
php artisan make:model Post -a                      # ทั้งหมด (all)

# สร้าง Controller
php artisan make:controller PostController
php artisan make:controller PostController -r       # Resource controller
php artisan make:controller PostController -m Post  # พร้อม Model

# สร้าง Request (Form Validation)
php artisan make:request StorePostRequest

# สร้าง Resource (API Transform)
php artisan make:resource PostResource
php artisan make:resource PostResource --collection # Collection resource

# สร้าง Policy (Authorization)
php artisan make:policy PostPolicy --model=Post

# สร้าง Seeder
php artisan make:seeder PostSeeder
```

## 🔄 Queue & Jobs

```bash
# สร้าง Job
php artisan make:job ProcessEmail

# รัน queue worker
php artisan queue:work
php artisan queue:work --queue=emails              # ระบุ queue
php artisan queue:work --tries=3                   # ลองใหม่ 3 ครั้ง

# ตรวจสอบสถานะ job
php artisan queue:failed
php artisan queue:retry all                        # รัน job ที่ล้มเหลว

# ลบ job ที่ล้มเหลว
php artisan queue:flush
```

## 📧 Mail & Notification

```bash
# สร้าง Mail class
php artisan make:mail SendEmail

# สร้าง Notification
php artisan make:notification OrderShipped
```

## 🔐 Authentication & Authorization

```bash
# สร้าง Auth scaffolding (ถ้าใช้ Breeze, Jetstream)
php artisan breeze:install
php artisan jetstream:install

# สร้าง Policy
php artisan make:policy PostPolicy
```

## 🔍 Debug & Info

```bash
# แสดงข้อมูล application
php artisan env
php artisan --version

# List routes
php artisan route:list
php artisan route:list --path=/api

# แสดง dependencies
php artisan package:discover

# Optimize application
php artisan optimize
php artisan optimize:clear
```

## 🗑️ Cleanup & Maintenance

```bash
# ลบ temporary files
php artisan tinker                # Interactive shell

# เล่นเอกสารได้ live
php artisan tinker

# เพิ่มประสิทธิภาพ application
php artisan optimize
php artisan config:cache         # เก็บ config เป็น cache
php artisan route:cache          # เก็บ route เป็น cache
```

## 💾 Publish Assets

```bash
# Publish vendor assets
php artisan vendor:publish
php artisan vendor:publish --provider=Vendor\Provider

# Publish assets สำหรับแพ็คเกจ
php artisan vendor:publish --tag=config
php artisan vendor:publish --tag=migrations
```

## ⚙️ Config & Key

```bash
# สร้าง application key
php artisan key:generate

# แสดง/ตั้งค่า config
php artisan config:show
php artisan config:cache
php artisan config:clear
```

## 🧪 Testing

```bash
# รัน tests
php artisan test
php artisan test --filter=LoginTest
```

## 📝 Custom Commands

```bash
# สร้าง custom command
php artisan make:command MyCommand

# รัน custom command
php artisan my:command
```

## 💡 Useful Tips

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `php artisan` | แสดง list ของคำสั่งทั้งหมด |
| `php artisan help {command}` | ดูรายละเอียดคำสั่ง |
| `--help` | ใช้ได้กับคำสั่งใด ๆ เพื่อดูตัวเลือก |
| `-v` หรือ `-vv` | เพิ่มรายละเอียด output |
| `--no-interaction` | รัน non-interactive mode |

---

## 🚨 Safety First!

```bash
# ก่อนลบข้อมูล ให้สำรองข้อมูลเสมอ
php artisan backup:run                    # ถ้าติดตั้ง backup package

# ตรวจสอบ migration ก่อนรัน
php artisan migrate:status

# Fresh migration เฉพาะในสภาพแวดล้อม dev/testing เท่านั้น
php artisan migrate:fresh --seed           # ⚠️ ลบข้อมูลทั้งหมด!
```
