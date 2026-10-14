import { ServiceRequestStatus, UserRole } from '@clt/contracts';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          CLT-ERP — IT Asset Operations
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Hệ thống quản lý quy trình cấp phát, thu hồi và sửa chữa thiết bị IT
          vận hành song song và thay thế Google Sheets / Apps Script.
        </p>

        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-left border border-slate-100">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Hợp đồng dùng chung (@clt/contracts)
          </h2>
          <div className="mt-2 text-sm text-slate-700">
            <p>
              • Trạng thái khởi tạo:{' '}
              <span className="font-semibold text-blue-600">
                {ServiceRequestStatus.PENDING_APPROVAL}
              </span>
            </p>
            <p>
              • Vai trò mặc định:{' '}
              <span className="font-semibold text-slate-800">
                {UserRole.EMPLOYEE}
              </span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
