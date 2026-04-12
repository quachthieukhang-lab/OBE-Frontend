"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LockOutlined,
  LoginOutlined,
  MailOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Form,
  Input,
  Spin,
  Typography,
  message,
} from "antd";
import { login } from "@/features/auth/api";

const DEFAULT_ADMIN_REDIRECT = "/dashboard-admin";
const DEFAULT_LECTURE_REDIRECT = "/dashboard-lecture";

function roleToDefaultRedirect(role: string | null | undefined) {
  const r = (role ?? "").toUpperCase();
  if (r === "LECTURE" || r === "LECTURER") return DEFAULT_LECTURE_REDIRECT;
  if (r === "ADMIN") return DEFAULT_ADMIN_REDIRECT;
  return DEFAULT_ADMIN_REDIRECT;
}

const inputStyle = { borderRadius: 10, height: 48, fontSize: 15 };

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
      <div style={{ marginBottom: 36 }}>
        <Typography.Title
          level={2}
          style={{ marginBottom: 8, fontWeight: 700, letterSpacing: "-0.02em" }}
        >
          Đăng nhập
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: 15 }}>
          Chào mừng trở lại. Đăng nhập để tiếp tục làm việc.
        </Typography.Text>
      </div>

      <Form
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        size="large"
      >
        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 500 }}>Email</span>}
          rules={[
            { required: true, message: "Nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="you@example.com"
            autoComplete="email"
            style={inputStyle}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ fontWeight: 500 }}>Mật khẩu</span>}
          rules={[{ required: true, message: "Nhập mật khẩu" }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="••••••••"
            autoComplete="current-password"
            style={inputStyle}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 8, marginTop: 4 }}>
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
              border: "none",
              background:
                "linear-gradient(135deg, #1677ff 0%, #4338ca 55%, #6d28d9 100%)",
              boxShadow: "0 8px 20px rgba(37, 99, 235, 0.35)",
            }}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <Divider plain style={{ margin: "20px 0", color: "#bbb" }}>
        hoặc
      </Divider>

      <div style={{ textAlign: "center" }}>
        <Typography.Text type="secondary">Chưa có tài khoản? </Typography.Text>
        <Link href="/sign-up" style={{ fontWeight: 600 }}>
          Đăng ký
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 64 }}>
          <Spin size="large" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
