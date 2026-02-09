<?php

namespace App\Http\Controllers\Apis\Users;

use App\Helpers\UploadHelper;
use App\Http\Controllers\Controller;
use App\Models\UploadFile;
use App\Models\Users\UserVerification;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserVerificationApiController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'files' => ['required'],
                'files.*' => ['file', 'mimes:jpeg,jpg,png,webp,gif,pdf,doc,docx', 'max:5120'],
                'person_type' => 'required',
            ]);

            $user = $request->user();

            $data = [
                'sources' => 'user',
                'type' => 'documents',
                'path' => "upload/users/{$user->id}/documents",
                'user_id' => $user->id,
            ];

            $files = $request->file('files');
            $fileIds = [];
            $uploadError = null;
            $failedFiles = [];

            if ($files) {
                if (!is_array($files)) {
                    $files = [$files];
                }

                foreach ($files as $index => $file) {
                    $result = UploadHelper::uploadFileGetId($file, $data);
                    if ($result['success'] && $result['data'] instanceof UploadFile) {
                        $fileIds[] = $result['data']->id;
                    } else {
                        // collect error for this specific file
                        $uploadError = "The files.$index failed to upload.";
                        $failedFiles[] = $file;
                        break; // Stop at first error, as per your sample
                    }
                }
            }

            if ($uploadError) {
                $response = [
                    'success' => false,
                    'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
                    'description' => $uploadError,
                    'code' => 500,
                ];

                if (config('app.debug')) {
                    // Structure: files: [ {}, {} ] etc
                    $filesArr = [];
                    if ($files) {
                        foreach ($files as $f) {
                            // Don't include full file object for security, just basic info
                            $filesArr[] = [
                                'name' => $f->getClientOriginalName(),
                                'type' => $f->getMimeType(),
                                'size' => $f->getSize(),
                            ];
                        }
                    }
                    $response['debug'] = [
                        'message' => $uploadError,
                        'request' => [
                            'files' => $filesArr,
                        ]
                    ];
                }

                return response()->json($response, 500);
            }

            $verification = DB::transaction(function () use ($user, $request, $fileIds) {
                return UserVerification::create([
                    'user_id' => $user->id,
                    'data' => [
                        'person_type' => $request->person_type,
                        'file_ids' => $fileIds,
                    ],
                    'status' => UserVerification::STATUS_PENDING,
                    'submitted_at' => now(),
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'ส่งคำขอยืนยันตัวตนเรียบร้อยแล้ว',
                'data' => $verification,
                'code' => 201,
            ], 201);
        } catch (Exception $e) {
            $response = [
                'success' => false,
                'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
                'description' => $e->getMessage() ?? '',
                'code' => 500,
            ];

            if (config('app.debug')) {
                $files = $request->file('files');
                $filesArr = [];
                if ($files) {
                    if (!is_array($files)) {
                        $files = [$files];
                    }
                    foreach ($files as $f) {
                        $filesArr[] = [
                            'name' => $f->getClientOriginalName(),
                            'type' => $f->getMimeType(),
                            'size' => $f->getSize(),
                        ];
                    }
                }
                $response['debug'] = [
                    'message' => $e->getMessage() ?? '',
                    'request' => [
                        'files' => $filesArr,
                    ],
                ];
            }

            return response()->json($response, 500);
        }
    }
}
