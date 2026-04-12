"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { register } from "@/features/auth/api";

const { Title, Text } = Typography;

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const roleToDefaultRedirect = (role: string | null | undefined) => {
    const r = (role ?? "").toUpperCase();
    if (r === "LECTURE" || r === "LECTURER") return "/dashboard-lecture";
    if (r === "ADMIN") return "/dashboard-admin";
    return "/dashboard-admin";
  };

  const onFinish = async (values: {
    hoTen: string;
    email: string;
    password: string;
    confirm: string;
  }) => {
    setLoading(true);
    try {
      const { token, role } = await register({
        hoTen: values.hoTen.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      if (token) {
        localStorage.setItem("token", token);
        message.success("Đăng ký thành công");
        router.push(roleToDefaultRedirect(role));
        router.refresh();
        return;
      }
      message.success("Đăng ký thành công. Vui lòng đăng nhập.");
      router.push("/sign-in");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? "Đăng ký thất bại");
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
          Đăng ký
        </Title>
        <Text type="secondary">Tạo tài khoản OBE</Text>
      </div>

      <Form layout="vertical" requiredMark={false} onFinish={onFinish} size="large">
        <Form.Item
          name="hoTen"
          label="Họ và tên"
          rules={[{ required: true, message: "Nhập họ tên" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" autoComplete="name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="you@example.com" autoComplete="email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: "Nhập mật khẩu" },
            { min: 6, message: "Tối thiểu 6 ký tự" },
          ]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" autoComplete="new-password" />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Xác nhận mật khẩu"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Nhập lại mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" autoComplete="new-password" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center" }}>
        <Text type="secondary">Đã có tài khoản? </Text>
        <Link href="/sign-in">Đăng nhập</Link>
      </div>
    </Card>
  );
}
