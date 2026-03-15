'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { CheckCircle2, AlertCircle, Camera, Upload, ArrowRight, Loader2 } from 'lucide-react';
import { HighlightText } from '@/components/ui/highlight-text';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { useVerifyKycMutation } from '@/lib/store/features/auth/authApi';
import { useAppSelector } from '@/lib/store/hooks';

type KycStep = 'INTRODUCTION' | 'FRONT_ID' | 'BACK_ID' | 'SELFIE' | 'REVIEW' | 'RESULT';

interface KycImages {
  front: string | null;
  back: string | null;
  selfie: string | null;
}

export default function KycVerificationPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [step, setStep] = useState<KycStep>('INTRODUCTION');
  const [images, setImages] = useState<KycImages>({ front: null, back: null, selfie: null });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [verifyKyc, { isLoading, error, data: result }] = useVerifyKycMutation();

  // Redirect if already verified (auth check handled by RouteGuard)
  useEffect(() => {
    if (user?.isKycVerified) {
      router.push('/dashboard');
    }
  }, [user?.isKycVerified, router]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (videoRef.current && stream && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  });

  const openCamera = async (facing: 'user' | 'environment' = 'environment') => {
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      alert('Không thể truy cập camera. Vui lòng cấp quyền hoặc tải ảnh lên.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      saveCurrentImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);

    // Use lower quality to reduce base64 size
    const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
    saveCurrentImage(base64);
  };

  const saveCurrentImage = (base64: string) => {
    stopCamera();
    if (step === 'FRONT_ID') {
      setImages((prev) => ({ ...prev, front: base64 }));
      setStep('BACK_ID');
    } else if (step === 'BACK_ID') {
      setImages((prev) => ({ ...prev, back: base64 }));
      setStep('SELFIE');
    } else if (step === 'SELFIE') {
      setImages((prev) => ({ ...prev, selfie: base64 }));
      setStep('REVIEW');
    }
  };

  const handleSubmit = async () => {
    if (!images.front || !images.back || !images.selfie) return;

    try {
      await verifyKyc({
        frontImageBase64: images.front,
        backImageBase64: images.back,
        selfieImageBase64: images.selfie,
      }).unwrap();

      setStep('RESULT');
    } catch (err) {
      setStep('RESULT');
    }
  };

  const renderCameraOrUpload = (
    facingMode: 'user' | 'environment',
    title: string,
    subtitle: string,
    allowUpload: boolean = true,
  ) => (
    <div className="flex flex-col items-center max-w-lg mx-auto w-full">
      <h2 className="text-2xl font-bold mb-2 text-center text-black">{title}</h2>
      <p className="text-gray-600 mb-8 text-center text-sm">{subtitle}</p>

      {!stream && (
        <div className="flex flex-col gap-4 w-full px-6">
          <RainbowButton
            onClick={() => openCamera(facingMode)}
            className="w-full justify-center flex py-3"
            borderWidth={1.5}
          >
            <Camera className="w-5 h-5 mr-2" /> Mở Camera
          </RainbowButton>

          {allowUpload && (
            <>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Hoặc</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center py-3 px-4 border shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-5 h-5 mr-2 text-gray-500" /> Tải ảnh lên
              </button>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            </>
          )}
        </div>
      )}

      {stream && (
        <div className="flex flex-col gap-4 w-full">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] sm:aspect-[4/3] w-full max-w-md mx-auto shadow-xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : {}}
            />

            {/* Overlay guidelines based on step */}
            {step !== 'SELFIE' && (
              <div className="absolute inset-0 border-2 border-white/50 m-8 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="text-white/50 text-xs font-semibold uppercase tracking-widest bg-black/30 px-2 py-1 rounded">
                  Đặt CCCD vào khung
                </span>
              </div>
            )}
            {step === 'SELFIE' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-64 border-2 border-white/50 rounded-[40%]"></div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={stopCamera}
              className="px-6 py-3 rounded-xl bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors shadow-sm"
            >
              Hủy
            </button>
            <button
              onClick={takePhoto}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 text-white font-bold hover:shadow-lg transition-all shadow-md flex items-center"
            >
              <Camera className="w-5 h-5 mr-2" /> Chụp ảnh
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[85vh] pt-28 pb-16 px-4 flex flex-col items-center bg-gray-50/50">
      <div className="max-w-3xl w-full mx-auto glass-card rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl overflow-hidden relative">
        {/* Progress Bar Header */}
        {step !== 'INTRODUCTION' && step !== 'RESULT' && (
          <div className="mb-10 w-full">
            <div className="flex justify-between text-xs font-medium text-gray-500 mb-2 px-1">
              <span className={step === 'FRONT_ID' ? 'text-violet-600 font-bold' : ''}>Mặt Trước</span>
              <span className={step === 'BACK_ID' ? 'text-violet-600 font-bold' : ''}>Mặt Sau</span>
              <span className={step === 'SELFIE' ? 'text-violet-600 font-bold' : ''}>Khuôn Mặt</span>
              <span className={step === 'REVIEW' ? 'text-violet-600 font-bold' : ''}>Xác Nhận</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-violet-500 transition-all duration-500 ease-in-out"
                style={{
                  width: step === 'FRONT_ID' ? '25%' : step === 'BACK_ID' ? '50%' : step === 'SELFIE' ? '75%' : '100%',
                }}
              />
            </div>
          </div>
        )}

        {/* Step: Introduction */}
        {step === 'INTRODUCTION' && (
          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-black mb-4">
              <HighlightText variant="underline" color="primary">
                Xác Thực Danh Tính
              </HighlightText>
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Để đảm bảo an toàn và tính minh bạch cho nền tảng SCharity, chúng tôi yêu cầu xác thực danh tính cho việc
              rút quỹ và các thao tác quan trọng. Quá trình này chỉ mất khoảng 2 phút.
            </p>

            <div className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl p-5 mb-8 text-left">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> Bạn cần chuẩn bị:
              </h3>
              <ul className="space-y-3 text-sm text-blue-800/80">
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">
                    1
                  </div>
                  <span>Chứng minh nhân dân (CMND) hoặc Căn cước công dân (CCCD) bản gốc, còn hạn sử dụng.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">
                    2
                  </div>
                  <span>Điều kiện ánh sáng tốt để chụp ảnh khuôn mặt và giấy tờ rõ nét.</span>
                </li>
              </ul>
            </div>

            <RainbowButton
              onClick={() => setStep('FRONT_ID')}
              className="w-full sm:w-auto px-10 py-4 text-base shadow-lg"
              colors={['#f43f5e', '#8b5cf6', '#f43f5e']}
              duration={2.5}
            >
              Bắt Đầu Xác Thực <ArrowRight className="w-5 h-5 ml-2" />
            </RainbowButton>
          </div>
        )}

        {/* Step: Front ID */}
        {step === 'FRONT_ID' &&
          renderCameraOrUpload(
            'environment',
            'Chụp mặt trước CCCD/CMND',
            'Vui lòng đặt giấy tờ trong khung, đảm bảo rõ nét, không bị chói sáng hoặc mất góc.',
          )}

        {/* Step: Back ID */}
        {step === 'BACK_ID' &&
          renderCameraOrUpload(
            'environment',
            'Chụp mặt sau CCCD/CMND',
            'Tiếp theo, hãy chụp mặt CÒN LẠI của giấy tờ. Vui lòng đảm bảo rõ nét mã QR hoặc dấu vân tay.',
          )}

        {/* Step: Selfie */}
        {step === 'SELFIE' &&
          renderCameraOrUpload(
            'user',
            'Chụp ảnh khuôn mặt',
            'Hướng khuôn mặt trực diện vào camera, không đeo kính râm hay khẩu trang.',
            false,
          )}

        {/* Step: Review */}
        {step === 'REVIEW' && (
          <div className="flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold mb-2 text-center text-black">Kiểm tra lại hình ảnh</h2>
            <p className="text-gray-600 mb-8 text-center text-sm">
              Vui lòng đảm bảo tất cả hình ảnh đều rõ nét và có thể đọc được thông tin.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
              {/* Front Preview */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200 relative group">
                  <img
                    src={`data:image/jpeg;base64,${images.front}`}
                    alt="CCCD Mặt trước"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setStep('FRONT_ID')}
                      className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium shadow"
                    >
                      Chụp lại
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-gray-700">Mặt Trước</p>
              </div>

              {/* Back Preview */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200 relative group">
                  <img
                    src={`data:image/jpeg;base64,${images.back}`}
                    alt="CCCD Mặt sau"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setStep('BACK_ID')}
                      className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium shadow"
                    >
                      Chụp lại
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-gray-700">Mặt Sau</p>
              </div>

              {/* Selfie Preview */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200 relative group">
                  <img
                    src={`data:image/jpeg;base64,${images.selfie}`}
                    alt="Selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setStep('SELFIE')}
                      className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium shadow"
                    >
                      Chụp lại
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-gray-700">Khuôn Mặt</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full sm:w-auto px-12 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Đang xử lý AI...
                </>
              ) : (
                'Xác Nhận & Gửi'
              )}
            </button>
          </div>
        )}

        {/* Step: Result */}
        {step === 'RESULT' && (
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            {result?.success ? (
              <>
                <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-emerald-600 mb-3">Thành Công!</h2>
                <p className="text-gray-600 mb-6">Tài khoản của bạn đã được xác thực danh tính (eKYC).</p>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8 w-full text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500 text-sm">Họ và tên</span>
                      <span className="font-semibold text-gray-900">{result.fullName}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500 text-sm">Số CCCD</span>
                      <span className="font-semibold text-gray-900">{result.idNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Độ trùng khớp ảnh</span>
                      <span className="font-semibold text-emerald-600">{result.faceMatchScore?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <RainbowButton onClick={() => router.push('/dashboard')} className="w-full">
                  Trở Về Dashboard
                </RainbowButton>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-6">
                  <AlertCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-rose-600 mb-3">Xác Thực Thất Bại</h2>
                <p className="text-gray-600 mb-8">
                  {error && typeof error === 'object' && 'data' in error
                    ? (error as any).data?.message || 'Hệ thống không thể xác thực thông tin của bạn.'
                    : 'Hệ thống không thể xác thực thông tin của bạn. Vui lòng thử lại với ảnh rõ nét hơn.'}
                </p>

                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Để Sau
                  </button>
                  <RainbowButton
                    onClick={() => {
                      setImages({ front: null, back: null, selfie: null });
                      setStep('FRONT_ID');
                    }}
                    className="flex-1"
                  >
                    Thử Lại
                  </RainbowButton>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
