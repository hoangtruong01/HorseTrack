# Paper Summary

## Citation

**Authors:** Eva Sobotková, Dana Kuřitková, Jiří Vostrá-Vydrová, et al.  
**Title:** Influence of Horse Demographics, Country of Training and Race Distance on the Performance of Thoroughbred Horses in the Czech Republic  
**Year:** 2023  
**Journal:** Acta Agriculturae Scandinavica, Section A – Animal Science / Archives of Animal Breeding  
**DOI:** 10.5194/aab-66-299-2023  
**Link:** https://pmc.ncbi.nlm.nih.gov/articles/PMC10654610/

---

## Problem

- Thành tích của ngựa đua chịu ảnh hưởng bởi nhiều yếu tố như tuổi, giới tính, nguồn gốc giống, quốc gia huấn luyện và cự ly thi đấu.
- Tuy nhiên, mức độ ảnh hưởng của từng yếu tố vẫn chưa được đánh giá đầy đủ đối với hệ thống đua ngựa tại Cộng hòa Séc.
- Việc hiểu rõ các yếu tố này giúp cải thiện công tác huấn luyện, lựa chọn ngựa thi đấu và hỗ trợ ra quyết định trong quản lý giải đua ngựa.

---

## Method

**Phương pháp nghiên cứu:** Phân tích thống kê dữ liệu lịch sử đua ngựa.

**Biến độc lập được phân tích:**

- Tuổi ngựa (Age)
- Giới tính (Sex)
- Ngựa bố (Sire)
- Quốc gia sinh (Country of Foaling)
- Quốc gia huấn luyện (Country of Training)
- Cự ly đua (Race Distance)

**Biến mục tiêu:**

- Thành tích thi đấu
- Khả năng đạt thứ hạng cao

**Kỹ thuật phân tích:**

- Thống kê mô tả
- Phân tích ảnh hưởng của các yếu tố nhân khẩu học và điều kiện thi đấu đến kết quả đua

Đây là nghiên cứu thực nghiệm nhằm xác định các yếu tố ảnh hưởng quan trọng thay vì xây dựng mô hình AI dự đoán mới.

---

## Dataset

**Nguồn dữ liệu:** Hồ sơ thi đấu ngựa đua Thoroughbred tại Cộng hòa Séc.

**Loại dữ liệu:**

- Thông tin ngựa
- Nguồn gốc giống
- Quốc gia huấn luyện
- Cự ly thi đấu
- Kết quả cuộc đua

**Đặc trưng sử dụng:**

- Age
- Sex
- Sire
- Country of Foaling
- Country of Training
- Race Distance

**Tiền xử lý dữ liệu:**

- Chuẩn hóa và phân loại các nhóm biến nhân khẩu học và đặc điểm cuộc đua trước khi phân tích thống kê.

---

## Evaluation

Do nghiên cứu không xây dựng mô hình học máy nên không sử dụng các metric như Accuracy, Precision hay Recall.

Nghiên cứu đánh giá bằng:

- So sánh hiệu suất thi đấu giữa các nhóm ngựa
- Phân tích mức độ ảnh hưởng của từng yếu tố
- Kiểm định ý nghĩa thống kê giữa các nhóm dữ liệu
- Đánh giá sự khác biệt thành tích theo tuổi, giới tính, nguồn gốc và cự ly thi đấu

---

## Results

- Tuổi ngựa có ảnh hưởng đáng kể đến thành tích thi đấu.
- Giới tính cũng tác động đến hiệu suất đua.
- Quốc gia huấn luyện là một trong những yếu tố quan trọng ảnh hưởng đến kết quả.
- Cự ly đua khác nhau tạo ra sự khác biệt rõ rệt về hiệu suất.
- Một số dòng giống (sire lines) thể hiện thành tích vượt trội hơn các dòng giống khác.
- Nghiên cứu xác nhận rằng đặc điểm nhân khẩu học và điều kiện huấn luyện là các yếu tố quan trọng trong đánh giá khả năng thi đấu của ngựa đua.

---

## Limitations

- Dữ liệu chỉ tập trung vào thị trường đua ngựa tại Cộng hòa Séc.
- Chưa tích hợp các dữ liệu thời gian thực như:
  - Thời tiết
  - Độ ẩm sân đua
  - Nhịp tim ngựa
  - Dữ liệu GPS
- Không xây dựng hoặc so sánh các mô hình Machine Learning.
- Khả năng khái quát hóa sang các quốc gia hoặc hệ thống đua ngựa khác còn hạn chế.

---

## Relevance to Our Topic

**AI-powered Horse Racing Tournament Management System**

Bài báo có giá trị lớn đối với đề tài của nhóm vì:

- Xác định các đặc trưng quan trọng cần lưu trữ trong hệ thống:
  - Horse Age
  - Horse Sex
  - Sire
  - Country of Training
  - Country of Foaling
  - Race Distance
- Hỗ trợ thiết kế cơ sở dữ liệu cho:
  - Horse Management
  - Race Management
  - Tournament Management
- Cung cấp cơ sở khoa học cho giai đoạn Feature Engineering khi xây dựng mô hình AI dự đoán kết quả cuộc đua.
- Giúp xác định các biến đầu vào tiềm năng cho:
  - Race Outcome Prediction
  - Jockey Recommendation
  - Tournament Decision Support

---

## Possible Improvement

- Áp dụng các mô hình Machine Learning hiện đại như:
  - Random Forest
  - XGBoost
  - LightGBM
  - Neural Network
- Tích hợp dữ liệu thời gian thực:
  - Weather API
  - Track Condition
  - GPS Tracking
  - Biometric Sensors
- Xây dựng hệ thống dự đoán kết quả cuộc đua dựa trên dữ liệu lịch sử và dữ liệu trực tiếp.
- Mở rộng từ nghiên cứu phân tích thống kê sang hệ thống hỗ trợ ra quyết định cho:
  - Ban tổ chức giải đấu
  - Chủ ngựa
  - Jockey
  - Trọng tài
  - Khán giả
