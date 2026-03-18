# 🌐 FCam Frontend - Next.js 15 Application

<div align="center">

[![Next JS](https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Redux](https://img.shields.io/badge/Redux%20Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Giao diện người dùng hiện đại, tương tác cao cho nền tảng gây quỹ FCam.**

</div>

---

## 🚀 Overview

Module này chứa mã nguồn phía giao diện (Client-side) của FCam, được xây dựng trên nền tảng **Next.js 15** sử dụng **App Router**. Chúng tôi tập trung vào hiệu năng (Server Components), trải nghiệm người dùng mượt mà và tính nhất quán của thiết kế.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit & RTK Query (Data fetching & Caching)
- **Styling**: Tailwind CSS v3 & Framer Motion for animations
- **UI System**: Shadcn UI & Radix UI primitives
- **Form Handling**: React Hook Form & Zod validation

### Project Structure

```text
FCam_FE/
├── app/                # Next.js App Router (Pages, Layouts, API Routes)
├── components/         # Reusable UI & Business components
│   ├── layout/         # Header, Footer, Sidebar
│   ├── ui/             # Atomic design components (Shadcn)
│   ├── campaign/       # Campaign-related features
│   └── auth/           # Authentication forms
├── lib/store/          # Redux Store, Slices, and RTK Query APIs
├── hooks/              # Custom React hooks
├── dtos/               # Data Transfer Object types
└── public/             # Static assets (images, icons)
```

---

## ✨ Features Implementation

### 🛡️ Authentication

Tích hợp **Google OAuth 2.0** cùng với quy trình đăng nhập/đăng ký truyền thống. Trạng thái xác thực được quản lý tập trung bởi `authSlice`.

### 📊 Data Layer (RTK Query)

Toàn bộ việc gọi API được trừu tượng hóa qua các hooks sinh ra bởi RTK Query (`authApi`, `campaignApi`, `adminApi`). Giúp tự động hóa caching, loading states và error handling.

### 🎨 Design System

Tuân thủ chuẩn **Glassmorphism** hiện đại. Sử dụng các animation tinh tế từ `framer-motion` để tạo cảm giác cao cấp.

---

## 🛠️ Development

### Setup .env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Command Lines

```bash
# Cài đặt dependency
npm install

# Chạy môi trường phát triển (Port 3001)
npm run dev

# Kiểm tra lỗi code
npm run lint

# Build production
npm run build
```

---

<div align="center">
  <sub>FCam FE - Transparency in every pixel.</sub>
</div>
