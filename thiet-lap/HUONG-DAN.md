# Nối trang khách với Google Sheet (làm một lần, khoảng 5 phút)

Sheet: “Dating with NhiLe Team 18/10” (trong Google Drive của bạn).

1. Mở Sheet → menu **Tiện ích mở rộng → Apps Script**.
2. Xóa hết mã có sẵn, dán toàn bộ file `apps-script.gs` vào. Bấm biểu tượng **Lưu**.
3. Ở thanh trên chọn hàm **setup** → bấm **Chạy**. Lần đầu Google hỏi quyền: chọn tài khoản của bạn → **Nâng cao → Đi tới (không an toàn) → Cho phép**. Sheet sẽ có 3 tab: FormA, FormB, BanDo.
4. Bấm **Triển khai → Tùy chọn triển khai mới** → loại **Ứng dụng web**:
   - Thực thi với tư cách: **Tôi**
   - Ai có quyền truy cập: **Bất kỳ ai**
   → **Triển khai** → copy **URL ứng dụng web** (đuôi `/exec`).
5. Gửi URL đó cho Claude. Claude dán vào trang khách, trang tự gửi dữ liệu về Sheet.

## Lúc 12:50 trong buổi
1. Tab **FormA** có mọi câu trả lời. Menu **Dating → Tạo Bản đồ từ Form A** chép những người đã đồng ý sang tab **BanDo** (không có SĐT).
2. Copy tab BanDo (cột ten, nghe, ba, tim, giup) dán vào AI cùng câu lệnh ghép "nên gặp".
3. Dán kết quả AI vào 4 cột **gap1, ly1, gap2, ly2** của tab BanDo. Trang khách tự đọc, khách tải lại là thấy.

Lưu ý: ai có địa chỉ trang khách đều đọc được tab BanDo. Tab FormA và FormB không bao giờ ra ngoài.
