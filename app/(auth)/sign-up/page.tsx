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

<<<<<<< HEAD
const inputStyle = { borderRadius: 10, height: 48, fontSize: 15 };

=======
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
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
<<<<<<< HEAD
      <div style={{ marginBottom: 36 }}>
        <Typography.Title
          level={2}
          style={{ marginBottom: 8, fontWeight: 700, letterSpacing: "-0.02em" }}
=======
      <div style={{ marginBottom: 40 }}>
        <Typography.Title
          level={2}
          style={{ marginBottom: 8, fontWeight: 700 }}
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
        >
          Tạo tài khoản
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: 15 }}>
<<<<<<< HEAD
          Đăng ký để sử dụng hệ thống OBE.
=======
          Đăng ký tài khoản để sử dụng hệ thống OBE.
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
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
<<<<<<< HEAD
          label={<span style={{ fontWeight: 500 }}>Họ và tên</span>}
=======
          label={
            <span style={{ fontWeight: 500, fontSize: 13 }}>Họ và tên</span>
          }
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
          rules={[{ required: true, message: "Nhập họ tên" }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
<<<<<<< HEAD
            style={inputStyle}
=======
            style={{ borderRadius: 10, height: 48, fontSize: 15 }}
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
          />
        </Form.Item>

        <Form.Item
          name="email"
<<<<<<< HEAD
          label={<span style={{ fontWeight: 500 }}>Email</span>}
=======
          label={
            <span style={{ fontWeight: 500, fontSize: 13 }}>Email</span>
          }
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
          rules={[
            { required: true, message: "Nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="you@example.com"
            autoComplete="email"
<<<<<<< HEAD
            style={inputStyle}
=======
            style={{ borderRadius: 10, height: 48, fontSize: 15 }}
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
          />
        </Form.Item>

        <Form.Item
          name="password"
<<<<<<< HEAD
          label={<span style={{ fontWeight: 500 }}>Mật khẩu</span>}
=======
          label={
            <span style={{ fontWeight: 500, fontSize: 13 }}>Mật khẩu</span>
          }
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
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
<<<<<<< HEAD
            style={inputStyle}
=======
            style={{ borderRadius: 10, height: 48, fontSize: 15 }}
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
          />
        </Form.Item>

        <Form.Item
          name="confirm"
<<<<<<< HEAD
          label={<span style={{ fontWeight: 500 }}>Xác nhận mật khẩu</span>}
=======
          label={
            <span style={{ fontWeight: 500, fontSize: 13 }}>
              Xác nhận mật khẩu
            </span>
          }
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
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
<<<<<<< HEAD
            style={inputStyle}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 8, marginTop: 4 }}>
=======
            style={{ borderRadius: 10, height: 48, fontSize: 15 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 16, marginTop: 8 }}>
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
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
<<<<<<< HEAD
              border: "none",
              background:
                "linear-gradient(135deg, #1677ff 0%, #4338ca 55%, #6d28d9 100%)",
              boxShadow: "0 8px 20px rgba(37, 99, 235, 0.35)",
=======
              background:
                "linear-gradient(135deg, #1677ff 0%, #4f46e5 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(22,119,255,0.3)",
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
            }}
          >
            Đăng ký
          </Button>
        </Form.Item>
      </Form>

<<<<<<< HEAD
      <Divider plain style={{ margin: "20px 0", color: "#bbb" }}>
=======
      <Divider plain style={{ margin: "16px 0", color: "#bbb", fontSize: 13 }}>
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
        hoặc
      </Divider>

      <div style={{ textAlign: "center" }}>
<<<<<<< HEAD
        <Typography.Text type="secondary">Đã có tài khoản? </Typography.Text>
        <Link href="/sign-in" style={{ fontWeight: 600 }}>
=======
        <Typography.Text type="secondary" style={{ fontSize: 14 }}>
          Đã có tài khoản?{" "}
        </Typography.Text>
        <Link href="/sign-in" style={{ fontWeight: 600, fontSize: 14 }}>
>>>>>>> a77f3c476aab7d59e7a4257bda48d9a11f5d66de
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
