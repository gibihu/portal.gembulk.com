<?php

namespace App\Helpers;

use App\Models\UploadFile;
use Illuminate\Support\Str;

class UploadHelper
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    private static function storeFile($file, $data)
    {
        // สร้างชื่อไฟล์ใหม่โดยการเพิ่ม timestamp
        $filename = Str::limit($data['source'] ?? 'user', 25) . '_' . Str::limit($data['type'] ?? 'other', 25) . '_' . date('Ymd_His') . '_' . Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();

        // บันทึกไฟล์ในตำแหน่งที่กำหนด
        $filePath = $file->storeAs($data['path'], $filename, 'public');

        // dd($filename, $filePath);
        return [$filePath, $filename];
    }


    public static function uploadFileGetId($file, $data)
    {
        [$file_path, $file_name] = self::storeFile($file, $data);

        if ($file_path && $file_name) {
            $dimensions = null;
            if (in_array($file->getClientMimeType(), ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'])) {
                $size = @getimagesize($file->getRealPath());
                $dimensions = [
                    'width' => $size[0] ?? null,
                    'height' => $size[1] ?? null,
                ];
            } else {
                $dimensions = [
                    'width' => null,
                    'height' => null,
                ];
            }

            $file_properties = [
                'name' => $file_name,
                'mime' => $file->getClientMimeType(),
                'size' => $file->getSize(),
                'date' => now()->toDateTimeString(),
                'dimensions' => $dimensions,
            ];

            $file_save = UploadFile::create([
                'path' => $data['path'],
                'name' => $file_name,
                'full_path' => $file_path,
                'owner_id' => $data['user_id'],
                'status' => UploadFile::STATUS_ACTIVE,
                'file_properties' => json_encode($file_properties),
            ]);

            if ($file_save) {
                return [
                    'success' => true,
                    'data' => $file_save,
                    'message' => "File successfully uploaded",
                ];
            } else {
                return [
                    'success' => false,
                    'data' => null,
                    'message' => "File could not be uploaded",
                ];
            }
        }

        return [
            'success' => false,
            'message' => 'File not found',
            'data' => null,
        ];
    }
}
