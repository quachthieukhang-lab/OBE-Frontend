"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LockOutlined,
  MailOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { Button, Divider, Form, Input, Spin, Typography, message } from "antd";
import { login } from "@/features/auth/api";

const DEFAULT_ADMIN_REDIRECT = "/dashboard-admin";
const DEFAULT_LECTURE_REDIRECT = "/dashboard-lecture";

function roleToDefaultRedirect(role: string | null | undefined) {
  const r = (role ?? "").toUpperCase();
  if (r === "LECTURE" || r === "LECTURER") return DEFAULT_LECTURE_REDIRECT;
  if (r === "ADMIN") return DEFAULT_ADMIN_REDIRECT;
  return DEFAULT_ADMIN_REDIRECT;
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get("redirect");

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { token, role } = await login({
        email: values.email.trim(),
        password: values.password,
      });
      if (token) {
        localStorage.setItem("token", token);
      } else {
        message.warning(
          "Đăng nhập thành công nhưng không nhận được token. Kiểm tra response /auth/sign-in.",
        );
      }
      message.success("Đăng nhập thành công");
      router.push(redirectTo || roleToDefaultRedirect(role));
      router.refresh();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <div style={{ marginBottom: 40 }}>
        <Typography.Title
          level={2}
          style={{ marginBottom: 8, fontWeight: 700 }}
        >
          Đăng nhập
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: 15 }}>
          Chào mừng bạn trở lại! Vui lòng đăng nhập để tiếp tục.
        </Typography.Text>
      </div>

      <Form
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        size="large"
        style={{ marginBottom: 0 }}
      >
        <Form.Item
          name="email"
          label={
            <span style={{ fontWeight: 500, fontSize: 13 }}>Email</span>
          }
          rules={[
            { required: true, message: "Nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="you@example.com"
            autoComplete="email"
            style={{
              borderRadius: 10,
              height: 48,
              fontSize: 15,
            }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={
            <span style={{ fontWeight: 500, fontSize: 13 }}>Mật khẩu</span>
          }
          rules={[{ required: true, message: "Nhập mật khẩu" }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{
              borderRadius: 10,
              height: 48,
              fontSize: 15,
            }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 16, marginTop: 8 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            icon={<LoginOutlined />}
            style={{
              height: 48,
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 15,
              background:
                "linear-gradient(135deg, #1677ff 0%, #4f46e5 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(22,119,255,0.3)",
            }}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <Divider plain style={{ margin: "16px 0", color: "#bbb", fontSize: 13 }}>
        hoặc
      </Divider>

      <div style={{ textAlign: "center" }}>
        <Typography.Text type="secondary" style={{ fontSize: 14 }}>
          Chưa có tài khoản?{" "}
        </Typography.Text>
        <Link
          href="/sign-up"
          style={{ fontWeight: 600, fontSize: 14 }}
        >
          Tạo tài khoản mới
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            display: "flex",
            justifyContent: "center",
            padding: 80,
          }}
        >
          <Spin size="large" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
