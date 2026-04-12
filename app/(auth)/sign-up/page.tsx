"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Button, Divider, Form, Input, Typography, message } from "antd";
import { register } from "@/features/auth/api";

function roleToDefaultRedirect(role: string | null | undefined) {
  const r = (role ?? "").toUpperCase();
  if (r === "LECTURE" || r === "LECTURER") return "/dashboard-lecture";
  if (r === "ADMIN") return "/dashboard-admin";
  return "/dashboard-admin";
}

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    <div style={{ width: "100%", maxWidth: 400 }}>
      <div style={{ marginBottom: 40 }}>
        <Typography.Title
          level={2}
          style={{ marginBottom: 8, fontWeight: 700 }}
        >
          Tạo tài khoản
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: 15 }}>
          Đăng ký tài khoản để sử dụng hệ thống OBE.
        </Typography.Text>
      </div>

      <Form
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        size="large"
      >
        <Form.Item
          name="hoTen"
          label={
            <span style={{ fontWeight: 500, fontSize: 13 }}>Họ và tên</span>
          }
          rules={[{ required: true, message: "Nhập họ tên" }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            style={{ borderRadius: 10, height: 48, fontSize: 15 }}
          />
        </Form.Item>

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
            style={{ borderRadius: 10, height: 48, fontSize: 15 }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={
            <span style={{ fontWeight: 500, fontSize: 13 }}>Mật khẩu</span>
          }
          rules={[
            { required: true, message: "Nhập mật khẩu" },
            { min: 6, message: "Tối thiểu 6 ký tự" },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="••••••••"
            autoComplete="new-password"
            style={{ borderRadius: 10, height: 48, fontSize: 15 }}
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          label={
            <span style={{ fontWeight: 500, fontSize: 13 }}>
              Xác nhận mật khẩu
            </span>
          }
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Nhập lại mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp"),
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="••••••••"
            autoComplete="new-password"
            style={{ borderRadius: 10, height: 48, fontSize: 15 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 16, marginTop: 8 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            icon={<UserAddOutlined />}
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
            Đăng ký
          </Button>
        </Form.Item>
      </Form>

      <Divider plain style={{ margin: "16px 0", color: "#bbb", fontSize: 13 }}>
        hoặc
      </Divider>

      <div style={{ textAlign: "center" }}>
        <Typography.Text type="secondary" style={{ fontSize: 14 }}>
          Đã có tài khoản?{" "}
        </Typography.Text>
        <Link href="/sign-in" style={{ fontWeight: 600, fontSize: 14 }}>
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
