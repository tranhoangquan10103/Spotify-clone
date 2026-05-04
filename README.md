<div align="center">
  <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png" alt="Spotify Logo" width="300" />

  # 🎵 Spotify Clone (Vue)

  **Mô phỏng giao diện Spotify với dữ liệu mẫu nội bộ, phục vụ mục đích học tập và luyện UI.**

  [![Vue](https://img.shields.io/badge/Vue%203-42B883?style=for-the-badge&logo=vue.js&logoColor=white)](#)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
  [![Pinia](https://img.shields.io/badge/Pinia-FFD54F?style=for-the-badge&logo=pinia&logoColor=black)](#)
  [![PrimeVue](https://img.shields.io/badge/PrimeVue-22C55E?style=for-the-badge&logo=prime&logoColor=white)](#)
  [![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](#)

</div>

---

## 📖 Giới thiệu

**Spotify Clone (Vue)** là dự án mô phỏng giao diện Spotify theo hướng thực chiến UI/UX. Dữ liệu bài hát được đọc từ CSV nội bộ, giúp tập trung vào kiến trúc front-end, state management và trải nghiệm người dùng.

*Lưu ý: Đây là dự án học tập phi thương mại. Mọi nhãn hiệu, hình ảnh và nội dung âm thanh thuộc về tác giả gốc và Spotify.*

## 🎯 Mục tiêu và phạm vi

- **Mục tiêu:** tái hiện bố cục, luồng tương tác và phong cách UI của Spotify.
- **Phạm vi:** front-end thuần, dữ liệu mẫu nội bộ; không tích hợp backend thật.
- **Trạng thái:** UI hoạt động, dữ liệu đọc từ CSV, một số tính năng ở mức mock.

## ✨ Tính năng nổi bật

- **🎧 Khung trình phát (UI):** các nút Shuffle/Play/Next/Repeat và thanh tiến trình hiển thị.
- **📚 Danh sách bài hát:** đọc từ CSV, hiển thị ảnh bìa và metadata.
- **✅ Chọn bài phát:** lưu trạng thái bài đang chọn qua Pinia.
- **🔍 Thanh tìm kiếm:** bố cục và hành vi UI cơ bản.
- **🔐 Auth UI (mock):** đăng nhập/đăng ký giả lập để minh họa luồng điều hướng.
- **📱 Responsive Layout:** bố cục linh hoạt trên nhiều kích thước màn hình.

## 🚀 Công nghệ sử dụng

### Frontend
- **Framework:** Vue 3 + Vite + TypeScript
- **Routing:** Vue Router
- **State:** Pinia
- **UI Kit:** PrimeVue + PrimeIcons
- **Data fetching và cache:** TanStack Vue Query
- **CSV parsing:** PapaParse

### Data và Assets
- **CSV:** danh sách bài hát nằm trong `src/songs/song-list.csv`
- **Covers:** ảnh bìa nằm trong `src/songs/covers/`
- **Lyrics và Audio:** dữ liệu mẫu trong `src/songs/lyrics/` và `src/songs/audio/`

---

## 🧭 Luồng dữ liệu chính

1. `useSongsQuery` tải CSV và parse bằng PapaParse.
2. Mapping dữ liệu thành `Song` (thời lượng, nghệ sĩ, cover URL).
3. `TrackTab` hiển thị danh sách, click để set `currentTrack` trong Pinia.
4. UI dùng `currentTrack` để highlight bài đang chọn.

---

## 🗂️ Cấu trúc thư mục (rút gọn)

```text
src/
  assets/           # SVG, CSS, theme
  components/       # Shared UI components
  composables/      # useSongsQuery
  router/           # Vue Router config
  stores/           # Pinia stores
  songs/            # CSV + audio + covers + lyrics
  types/            # TypeScript types
  views/            # Layout theo cột trái/giữa/phải
```

---

## 🛠️ Cài đặt và chạy cục bộ

### Yêu cầu môi trường
- **Node.js:** khuyến nghị 18+
- **Package manager:** npm

### Các bước chạy
**1. Cài đặt dependencies:**
```bash
npm install
```

**2. Chạy dev server:**
```bash
npm run dev
```

**3. Mở trình duyệt:**
Truy cập: http://localhost:5173/

### Build và preview
```bash
npm run build
npm run preview
```

---

## 📜 Scripts

| Script | Mô tả |
| --- | --- |
| `npm run dev` | Chạy môi trường phát triển (Vite) |
| `npm run build` | Build production + kiểm tra TypeScript |
| `npm run preview` | Xem bản build cục bộ |

---

## ➕ Thêm bài hát mới

Để thêm bài hát vào danh sách, cập nhật CSV và asset tương ứng:

1. **CSV:** thêm dòng mới trong `src/songs/song-list.csv`.
2. **Cover:** đặt ảnh bìa vào `src/songs/covers/` theo định dạng:
   `Track Name - Artist 1; Artist 2.jpg`
3. **Lyrics/Audio:** có thể đặt thêm vào `src/songs/lyrics/` và `src/songs/audio/` (chưa tích hợp UI).

---

## ⚠️ Giới hạn hiện tại

- Chưa có backend hoặc xác thực thật.
- Các nút điều khiển trình phát mới là UI, chưa xử lý audio.
- Playlist/Lyrics tab chưa triển khai nội dung.

---

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh. Bạn có thể mở issue hoặc gửi pull request.

---

## 📄 Bản quyền

Dự án phục vụ mục đích học tập. Vui lòng tôn trọng bản quyền nội dung âm thanh và hình ảnh của tác giả gốc và Spotify.