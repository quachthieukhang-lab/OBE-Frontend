"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { login } from "@/features/auth/api";

const { Title, Text } = Typography;

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
        message.warning("Đăng nhập thành công nhưng không nhận được token. Kiểm tra response /auth/sign-in.");
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
    <Card
      variant="borderless"
      style={{
        width: "100%",
        maxWidth: 420,
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <Title level={3} style={{ marginBottom: 8 }}>
          Đăng nhập
        </Title>
        <Text type="secondary">Hệ thống OBE</Text>
      </div>

      <Form layout="vertical" requiredMark={false} onFinish={onFinish} size="large">
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="you@example.com" autoComplete="email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: "Nhập mật khẩu" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" autoComplete="current-password" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center" }}>
        <Text type="secondary">Chưa có tài khoản? </Text>
        <Link href="/sign-up">Đăng ký</Link>
      </div>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <Card style={{ width: "100%", maxWidth: 420, borderRadius: 12 }}>
          <Typography.Paragraph>Đang tải...</Typography.Paragraph>
        </Card>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
