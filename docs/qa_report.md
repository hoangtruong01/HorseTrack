# Báo Cáo Kiểm Thử Chất Lượng & Phát Hiện Lỗi (QA/QC Test Report)

*   **Dự án:** Hệ thống quản lý trường đua HorseTrack (Backend & Nghiệp vụ di động)
*   **Người thực hiện:** Đội ngũ chuyên gia QA/QC & Senior Tester
*   **Ngày báo cáo:** 05/06/2026

---

## 1. Tóm Tắt Phát Hiện (Executive Summary)

Qua quá trình rà soát mã nguồn tĩnh (Static Code Analysis) và kiểm thử luồng nghiệp vụ trên hệ thống backend (`be/src`), chúng tôi phát hiện **03 lỗi nghiêm trọng** liên quan đến logic xử lý điểm thưởng cược, tính thời gian phạt vi phạm của trọng tài, và quy trình đối soát tiền mặt tại quầy. 

Dưới đây là bảng tổng hợp các lỗi được phát hiện:

| ID | Mức Độ | Phân Hệ | Mô Tả Ngắn Gọn | Trạng Thái |
|:---|:---|:---|:---|:---|
| **BUG-001** | 🔴 Critical (Nghiêm trọng) | Race Results (Kết quả đua) | Lỗi cộng dồn thời gian phạt vô hạn lần mỗi khi trọng tài Lưu nháp hoặc Xác nhận kết quả. | Đã sửa |
| **BUG-002** | 🟡 High (Cao) | Predictions (Dự đoán) | Lỗi bỏ lọt kiểm tra số dư và trừ điểm khi đặt cược đúng 1 điểm (1 Pts). | Đã sửa |
| **BUG-003** | 🟡 High (Cao) | Wallet & Cashout (Rút tiền) | Không đóng băng/khóa điểm khi tạo yêu cầu rút tiền (Double-spending risk). | Đã sửa |

---

## 2. Chi Tiết Lỗi & Cách Tái Hiện (Detailed Bug Reports)

### 2.1. BUG-001: Lỗi nhân đôi thời gian phạt vi phạm khi Lưu nháp/Giả lập nhiều lần
*   **Mức độ:** 🔴 Critical
*   **Tệp tin phát hiện:** `be/src/race-results/race-results.service.ts`
*   **Mô tả chi tiết:**
    Khi trọng tài ghi nhận các lỗi vi phạm đường đua của ngựa (ví dụ: lỗi nhẹ phạt `+3000ms`, vừa `+6000ms`, nặng `+12000ms`), các lỗi này được lưu trong bảng `RaceViolation`. 
    Khi trọng tài bấm **Giả lập kết quả**, **Lưu nháp** hoặc **Khóa kết quả**, backend đều gọi hàm `applyViolationsToResults(raceId)`. 
    Hàm này lấy thời gian chạy hiện tại trong DB (`result.finishTimeMs`) rồi cộng thêm thời gian phạt. Tuy nhiên, do DB không lưu lại thời gian gốc (Base/Raw time) trước khi phạt, nên mỗi lần trọng tài lưu lại, hệ thống lại tiếp tục lấy thời gian đã phạt để cộng thêm thời gian phạt một lần nữa.
*   **Hậu quả:** 
    Nếu chiến mã bị lỗi phạt +3s, nếu trọng tài bấm nút "Lưu nháp" 3 lần, ngựa đó sẽ bị phạt thành +9s. Điều này làm sai lệch nghiêm trọng bảng xếp hạng chung cuộc và kết quả phân chia điểm thưởng cho khán giả.
*   **Cách tái hiện (Steps to Reproduce):**
    1. Tạo một cuộc đua, thêm ngựa đua.
    2. Ghi nhận 1 vi phạm nhẹ (+3 giây) cho Ngựa A.
    3. Vào mục nhập kết quả, bấm "Lưu nháp" lần 1 -> Ngựa A bị cộng 3000ms.
    4. Bấm "Lưu nháp" lần 2 -> Ngựa A tiếp tục bị cộng thêm 3000ms nữa (tổng +6s).
    5. Bấm "Lưu nháp" lần 3 -> Thời gian chạy của Ngựa A tăng thêm 3s nữa (tổng +9s).

---

### 2.2. BUG-002: Lỗi đặt cược 1 điểm (1 Pts) không bị trừ số dư và không kiểm tra ví
*   **Mức độ:** 🟡 High
*   **Tệp tin phát hiện:** `be/src/predictions/predictions.service.ts`
*   **Mô tả chi tiết:**
    Trong API tạo dự đoán cược (`PredictionsService.create`), backend áp dụng quy luật:
    ```typescript
    const betAmount = dto.betPoints || 0;
    if (betAmount >= 2) { ... }
    ```
    Tức là chỉ kiểm tra số dư và trừ điểm ví nếu số điểm cược lớn hơn hoặc bằng 2. 
    Tuy nhiên, nếu người dùng gửi yêu cầu cược đúng `1` điểm (1 Pts):
    1. Hệ thống không kiểm tra ví của người dùng có đủ điểm hay không.
    2. Hệ thống không trừ điểm trong ví của người dùng khi tạo cược.
    3. Khi kết thúc trận đấu, nếu thắng người dùng được cộng thêm `1` điểm; nếu thua người dùng bị trừ `1` điểm.
*   **Hậu quả:** 
    Người dùng có số dư `0` điểm vẫn có thể đặt cược `1` điểm thành công (do không bị kiểm tra ví và không bị trừ điểm lúc tạo cược). Nếu thắng họ nhận thêm +1 điểm (từ 0 lên 1). Nếu thua, do ví đang có 0 điểm, hệ thống không thể trừ xuống số âm nên giữ nguyên 0 điểm. Người dùng có thể chơi cược "1 điểm" miễn phí vô hạn lần mà không gặp rủi ro mất điểm.
*   **Cách tái hiện:**
    1. Sử dụng tài khoản khán giả có 0 Pts.
    2. Gọi trực tiếp API `POST /api/v1/predictions` với payload: `{ "raceId": "...", "predictedHorseId": "...", "betPoints": 1 }`.
    3. Yêu cầu tạo cược thành công mặc dù ví có 0 Pts.

---

### 2.3. BUG-003: Không đóng băng/khóa điểm cược khi gửi yêu cầu rút tiền mặt (Cashout)
*   **Mức độ:** 🟡 High
*   **Tệp tin phát hiện:** `be/src/wallet/wallet.service.ts`
*   **Mô tả chi tiết:**
    Khi spectator hoặc owner tạo yêu cầu rút tiền đổi thưởng (`requestCashout`), hệ thống kiểm tra số dư hiện tại của họ có đủ hay không. Nếu đủ, hệ thống tạo bản ghi yêu cầu rút tiền trạng thái `PENDING` nhưng **chưa trừ điểm ngay**.
    Hệ thống chỉ trừ điểm khi nhân viên quầy chấp nhận xử lý yêu cầu đổi thưởng (`processCashout` chuyển sang trạng thái APPROVED/PAID).
*   **Hậu quả:**
    1. **Double-spending:** Người dùng có thể tạo hàng chục yêu cầu rút tiền cùng một lúc cho cùng một số điểm (do điểm chưa bị trừ lúc yêu cầu).
    2. **Gian lận cược:** Người dùng tạo yêu cầu rút tiền, sau đó dùng số điểm đó đi đặt cược tiếp. Khi họ đến quầy đổi tiền, số điểm thực tế đã bị mất do thua cược, dẫn đến việc nhân viên quầy xử lý yêu cầu rút tiền bị lỗi hoặc gây thất thoát dữ liệu.
    3. Rủi ro tranh chấp tài nguyên (Race Condition) nếu hai nhân viên quầy cùng duyệt hai yêu cầu rút tiền của cùng một khách hàng tại cùng một thời điểm.

---

## 3. Đề Xuất Giải Pháp Sửa Lỗi (Recommended Code Fixes)

Chúng tôi đã thiết kế sẵn các đoạn mã tối ưu để khắc phục triệt để các lỗi trên:

### 3.1. Hướng sửa đổi BUG-001 (Idempotent Penalty Application)
Thêm trường `rawFinishTimeMs` vào schema `RaceResult` để lưu thời gian gốc do trọng tài nhập vào hoặc giả lập. Khi áp dụng hình phạt, ta luôn lấy: `finishTimeMs = rawFinishTimeMs + penaltyTimeMs`.

*   **Sửa Schema `be/src/race-results/schemas/race-result.schema.ts`:**
    ```typescript
    @Prop()
    rawFinishTimeMs?: number;
    ```

*   **Sửa logic tính trong `be/src/race-results/race-results.service.ts`:**
    1. Khi tạo hoặc cập nhật kết quả: Luôn đồng bộ `rawFinishTimeMs = finishTimeMs`.
    2. Trong hàm `applyViolationsToResults(raceId)`:
       ```typescript
       // Khởi tạo rawFinishTimeMs nếu chưa có (dành cho bản ghi cũ)
       if (result.rawFinishTimeMs === undefined || result.rawFinishTimeMs === null) {
         result.rawFinishTimeMs = result.finishTimeMs;
       }
       
       // ... tính toán penaltyTimeMs ...
       
       if (isDisqualified) {
         result.outcome = RaceResultOutcome.DISQUALIFIED;
         result.rank = undefined;
         result.finishTimeMs = undefined;
         result.points = 0;
       } else if (penaltyTimeMs > 0 && result.outcome === RaceResultOutcome.FINISHED) {
         if (result.rawFinishTimeMs) {
           result.finishTimeMs = result.rawFinishTimeMs + penaltyTimeMs;
         }
       } else {
         // Trả về thời gian gốc nếu không bị phạt
         result.finishTimeMs = result.rawFinishTimeMs;
       }

       // Dọn dẹp nội dung note để tránh nhân đôi ghi chú quy đổi phạt
       let baseNote = result.note || '';
       const splitIdx = baseNote.indexOf(' | Quy đổi phạt:');
       if (splitIdx !== -1) {
         baseNote = baseNote.substring(0, splitIdx);
       } else if (baseNote.startsWith('Quy đổi phạt:')) {
         baseNote = '';
       }

       if (notes.length > 0) {
         const violationNotes = notes.join(', ');
         result.note = baseNote 
           ? `${baseNote} | Quy đổi phạt: ${violationNotes}` 
           : `Quy đổi phạt: ${violationNotes}`;
       } else {
         result.note = baseNote || undefined;
       }
       ```

### 3.2. Hướng sửa đổi BUG-002 (Bet Points 1 Pts Check)
Thay đổi điều kiện cược điểm tối thiểu hoặc đưa số điểm `1` vào diện cần kiểm tra và trừ điểm ngay từ lúc tạo. Hoặc sửa schema validation để chỉ cho phép `betPoints = 0` (miễn phí) hoặc `betPoints >= 2`.
Cách sạch nhất là chỉnh lại logic kiểm tra cược trong `predictions.service.ts`:
```diff
- if (betAmount >= 2) {
+ if (betAmount > 0) {
```
Và cập nhật hàm phân xử `payoutBetsForRace` tương ứng.

### 3.3. Hướng sửa đổi BUG-003 (Freeze Cashout Points)
Trừ điểm của người dùng ngay khi tạo yêu cầu rút tiền (`requestCashout`). Nếu yêu cầu bị từ chối (`REJECTED`), hoàn trả lại số điểm đó cho người dùng. Cách này đảm bảo số dư khả dụng luôn đúng thực tế.
