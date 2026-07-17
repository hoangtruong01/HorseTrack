# AI Model Integration Specification — Horse Racing Tournament Management System

Tài liệu đặc tả kiến trúc, quy trình xử lý dữ liệu (Pipeline), cấu trúc Prompt và phương thức tích hợp các phân hệ Trí tuệ Nhân tạo vào hệ thống **Quản lý Giải đua ngựa**.

---

## 1. Tổng quan Các Thành phần AI

| Thành phần | Model | Nguồn | Phương thức Tích hợp |
|---|---|---|---|
| **Bộ Dự báo Thứ hạng (Predictive Ranker)** | CatBoost / XGBoost (LambdaRank Core) | Mô hình huấn luyện tại chỗ (Local Artifacts) | gRPC / REST API kết hợp kết nối WebSocket thời gian thực |
| **Bộ Phân tích & Bình luận (Equine Commentator)** | Gemini 1.5 Flash / GPT-4o-mini | Google AI Studio / OpenAI API | REST API call từ AI Service (Python/FastAPI) |
| **Race Timeline Agent** | Cron scheduler rule-based | Built-in (Celery Beat / Python hoặc Node-cron) | Tiến trình nền hệ thống, không gọi mô hình AI ngoài |

---

## 2. Lý do Chọn Model

| Tiêu chí | Bộ Dự báo Thứ hạng (Machine Learning) | Bộ Phân tích & Bình luận (LLM) |
|---|---|---|
| **Loại tác vụ** | Học máy xếp hạng theo danh sách (Listwise Ranking) | Sinh văn bản phân tích dựa trên dữ liệu cấu trúc |
| **Độ sâu lý luận** | Cao (Tính toán phi tuyến mối tương quan giữa đặc trưng sinh học, nài ngựa và thời tiết) | Thấp–Trung bình (Chuyển đổi dữ liệu số từ kho thuộc tính thành văn bản nhận định trực quan) |
| **Model được chọn** | **CatBoost / XGBoost** (Tối ưu hóa tuyệt đối cho dữ liệu dạng bảng - Tabular Data) | **Gemini 1.5 Flash** (Tốc độ xử lý context nhanh, chi phí API cực kỳ tối ưu) |
| **Đầu vào** | Vector đặc trưng của lượt đua (Ngựa, Nài, Lịch sử chấn thương, Kết cấu mặt sân) | Số liệu phong độ 5 trận gần nhất + Chỉ số sinh học + Bảng điểm dự báo từ mô hình ML |
| **Đầu ra** | Mảng điểm số thứ hạng (Ranking Scores) và Xác suất Top-k | Văn bản nhận định tổng quan trước trận đấu hoặc Báo cáo khuyến nghị gửi Chủ ngựa |
| **Yêu cầu chất lượng** | Độ chính xác toán học cao (Chỉ số NDCG tối ưu), không trễ dòng dữ liệu | Giọng điệu khách quan, thông số kỹ thuật chuẩn xác, không bịa đặt dữ liệu (Hallucination) |
| **Độ trễ** | Yêu cầu thời gian thực (Cập nhật và truyền phát tức thì qua WebSockets) | Chấp nhận được độ trễ xử lý nền (Sinh sẵn trước giờ đua 15 phút) |

---

## 3. Nguồn AI/LLM

*   **Mô hình Học máy (ML Models):** Được đóng gói độc lập dưới dạng file `.cbm` hoặc `.json` lưu tại máy chủ AI Service, sẵn sàng phục vụ tính toán song song (Inference).
*   **Mô hình Ngôn ngữ lớn (LLM):** Sử dụng các mô hình thương mại thông qua Gemini API hoặc OpenAI API. Toàn bộ các cấu trúc Prompt mẫu được lưu trữ trong Database nhằm giúp Ban tổ chức linh hoạt cấu hình theo từng cấp độ giải đua.

---

## 4. Đặc tả Đầu vào/Đầu ra

### 4.1. Bộ Phân tích Phong độ & Bình luận (LLM)

**4 loại văn bản báo cáo và ngữ cảnh cần thiết:**

| Loại báo cáo/Văn bản | Kích hoạt | Biến ngữ cảnh chính |
|---|---|---|
| **Bình luận tổng quan trước trận** | Race Timeline Agent: 15 phút trước giờ mở màn | ten_luot_dua, cu_ly, loai_mat_san, danh_sach_chien_ma, ti_le_odds_thi_truong |
| **Khuyến nghị hồi sức & Y tế** | Hệ thống ghi nhận kết quả: Ngay sau khi lượt đua kết thúc | ten_chien_ma, chi_so_nhip_tim, thoi_gian_chay, so_luot_da_dua_trong_tuan, muc_do_kiet_suc |
| **Báo cáo hiệu suất Nài ngựa** | Ban tổ chức kích hoạt sau khi kết thúc toàn bộ giải đấu | ten_nai_ngu_ngua, tong_so_tran_tham_gia, so_lan_vao_top3, loi_vi_pham_ky_luat |
| **Cảnh báo vi phạm quy chuẩn** | Hệ thống tự động kiểm tra khi Chủ ngựa đăng ký thi đấu | ten_chien_ma, so_tuoi_thuc_te, hang_can_hien_tai, phan_khuc_luot_dua_dang_ky |

**Cấu trúc mẫu Prompt (Bộ Phân tích Phong độ & Bình luận):**

System: Bạn là một chuyên gia phân tích dữ liệu thể thao đua ngựa và bình luận viên chuyên nghiệp.
Hãy viết một bài nhận định tổng quan ngắn gọn, khách quan và mang tính khoa học dữ liệu cho lượt đua sau.
Sử dụng tiếng Việt chuyên ngành (ví dụ: cự ly, tốc độ bứt tốc, mặt sân cỏ/cát).
Tuyệt đối không tự bịa đặt các con số nằm ngoài dữ liệu đầu vào. Giữ bài viết trong khoảng 150–200 từ.

User:
Lượt đua: {ten_luot_dua}
Cự ly chặng: {cu_ly} mét | Mặt sân: {loai_mat_san}
Danh sách chiến mã & Điểm dự báo từ AI: {danh_sach_chien_ma_va_diem_ai}
Biến động tỷ lệ cược thị trường (Public Odds): {ti_le_odds_thi_truong}

Định dạng trả về:

Tiêu đề nhận định: ...

Phân tích ứng viên nặng ký: ...

Nhận định yếu tố bất ngờ (Underdog): ...

**Cấu trúc mẫu Prompt (Bộ Phân tích Phong độ & Bình luận):**
# 4.1. Prompt cho AI Bình luận viên (LLM Commentary)

## System Prompt

Bạn là một chuyên gia phân tích dữ liệu thể thao đua ngựa và bình luận viên chuyên nghiệp.

Hãy viết một bài nhận định tổng quan ngắn gọn, khách quan và mang tính khoa học dữ liệu cho lượt đua sau.

Sử dụng tiếng Việt chuyên ngành (ví dụ: **cự ly**, **tốc độ bứt tốc**, **mặt sân cỏ/cát**).

**Không được tự bịa đặt các con số nằm ngoài dữ liệu đầu vào.**

Độ dài bài viết: **150–200 từ**.

## User Prompt

```text
Lượt đua: {ten_luot_dua}

Cự ly chặng: {cu_ly} mét
Mặt sân: {loai_mat_san}

Danh sách chiến mã & Điểm dự báo từ AI:
{danh_sach_chien_ma_va_diem_ai}

Biến động tỷ lệ cược thị trường (Public Odds):
{ti_le_odds_thi_truong}

Định dạng trả về:

Tiêu đề nhận định: ...

Phân tích ứng viên nặng ký: ...

Nhận định yếu tố bất ngờ (Underdog): ...
```

## Quy tắc Kiểm tra Đầu ra

- **Tiêu đề nhận định:** từ **10–50 ký tự**.
- **Nội dung:** phải chứa chính xác tên của **ít nhất 2 chiến mã có điểm số cao nhất** từ dữ liệu đầu vào.
- Không chứa các ký tự placeholder lỗi hoặc định dạng văn bản thô chưa qua xử lý.

---

# 4.2. Bộ Dự báo Thứ hạng (Machine Learning Core)

## Cấu trúc dữ liệu đầu vào (JSON Input Payload)

```json
{
  "race_id": "RACE_2026_07_A1",
  "track_condition": {
    "surface_type": "Turf",
    "moisture_level": "Dry",
    "distance_meters": 1200
  },
  "competitors": [
    {
      "horse_id": "H_CHAMPION_01",
      "horse_age": 4,
      "recent_form_index": 0.88,
      "weight_carrier": 56.5,
      "jockey_id": "J_NGUYEN_A",
      "jockey_win_rate": 0.72
    },
    {
      "horse_id": "H_DARK_HORSE_09",
      "horse_age": 3,
      "recent_form_index": 0.65,
      "weight_carrier": 55.0,
      "jockey_id": "J_TRAN_B",
      "jockey_win_rate": 0.54
    }
  ]
}
```

## Quy trình Hậu xử lý Kết quả Mô hình

1. Mô hình nhận mảng đối thủ và thực hiện tính toán hàm **Listwise Scoring** để sinh ra mảng điểm số tương đối đại diện cho khả năng giành chiến thắng.

2. Sắp xếp danh sách theo **thứ tự điểm số giảm dần** để tạo bảng phân hạng dự kiến từ **Top 1 đến Top K**.

3. Loại bỏ các trường hợp dữ liệu bất thường (ví dụ: ngựa bị cấm thi đấu đột xuất).

4. Lưu kết quả vào **Redis Cache** để phục vụ truy vấn tốc độ cao và truyền dữ liệu qua **WebSocket**.

---

# 5. Race Timeline Agent — Đặc tả

Phân hệ sử dụng **Cron Task** để quét trạng thái và tự động hóa các tác vụ quản trị luồng chạy của giải đua theo thời gian thực.

```typescript
// Định kỳ quét hệ thống mỗi 30 giây để điều phối các trạng thái trận đua
cron.schedule('*/30 * * * * *', async () => {
  const bayGio = new Date();

  // Lấy các mốc sự kiện lượt đua đang ở trạng thái chờ xử lý (pending)
  const cacMocSuKien = await RaceMilestone.find({
    targetTime: { $lte: bayGio },
    status: 'pending'
  });

  for (const moc of cacMocSuKien) {

    if (moc.type === 'KICH_HOA_DU_BAO') {

      // 15 phút trước giờ đua:
      // Gọi AI Service chạy pipeline dự báo và sinh bình luận

      await triggerPredictivePipeline(moc.raceId);
      await triggerLLMCommentary(moc.raceId);

      moc.status = 'done';

    } else if (moc.type === 'DONG_CONG_DAT_CUOC') {

      // Giờ đua bắt đầu:
      // Khóa cược và chuyển trạng thái sang Running

      await lockWageringPool(moc.raceId);
      await updateRaceStatus(moc.raceId, 'running');

      moc.status = 'done';

    } else if (moc.type === 'KIEM_TRA_HOI_SUC_SAU_DUA') {

      // Sau trận đua:
      // Tính toán thời gian hồi phục bắt buộc

      const ketQuaTratDua = await getRaceResult(moc.raceId);

      await enforceEquineRecoveryWindow(ketQuaTratDua);

      moc.status = 'done';
    }

    moc.actualTime = new Date();
    await moc.save();
  }
});
```

---

# 6. So sánh với Baseline

| Thành phần / Nghiệp vụ | Hệ thống của chúng tôi | Baseline (Phương thức cũ) |
|-------------------------|------------------------|---------------------------|
| **Lập lịch giải đấu** | Thuật toán di truyền **POX-GA** xử lý tự động toàn bộ ma trận ràng buộc cứng/mềm trong vài giây. | Ban tổ chức xếp lịch thủ công trên Excel, dễ xảy ra lỗi trùng lịch nài ngựa hoặc bỏ quên thời gian nghỉ của ngựa. |
| **Nhận định & Bình luận** | **LLM (Gemini 1.5 Flash)** tự động tổng hợp dữ liệu sinh học và phong độ thành bài bình luận khách quan. | Thuê chuyên gia viết nhận định thủ công cho từng lượt đua, tốn thời gian và chi phí. |
| **Dự báo kết quả** | Mô hình **Learning-to-Rank (LambdaRank)** phân tích dữ liệu phi tuyến theo thời gian thực. | Khán giả chỉ xem bảng Odds tĩnh do nhà cái cấu hình. |
| **Quản lý tiến trình giải** | **Race Timeline Agent** tự động kích hoạt pipeline và thay đổi trạng thái theo thời gian thực. | Điều phối viên cập nhật trạng thái thủ công, dễ gây chậm tiến độ. |

---

# 7. Hạn chế và Biện pháp Giảm thiểu

| Hạn chế / Rủi ro | Biện pháp giảm thiểu |
|------------------|----------------------|
| **LLM bịa đặt thông tin phong độ chiến mã** | Thiết lập Prompt chặt chẽ (Few-shot + Context Locking). Chỉ cho phép trích xuất từ JSON đầu vào, kết hợp Regex kiểm tra trước khi lưu DB. |
| **Data Drift làm giảm độ chính xác của mô hình ML** | Giám sát chỉ số **NDCG** sau mỗi giải đấu. Nếu **NDCG < 0.75**, hệ thống tự động kích hoạt quy trình **Automated Retraining**. |
| **Chi phí gọi API ngoài tăng cao** | Sử dụng mô hình Flash cho tác vụ sinh văn bản; gom nhiều yêu cầu thành **Batch** thay vì gọi API riêng lẻ. |
| **Downtime API bên thứ ba** | Cơ chế **Failover**: Nếu Gemini hoặc OpenAI gặp sự cố, Backend chuyển sang mô hình thống kê tuyến tính (Baseline Heuristic) dựa trên tỷ lệ thắng lịch sử để duy trì hoạt động của hệ thống. |
