"use client";

import { AimOutlined } from "@ant-design/icons";
import { Typography } from "antd";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f0f2f5",
      }}
    >
      {/* Left branding panel */}
      <div
        style={{
          flex: "0 0 45%",
          background:
            "linear-gradient(135deg, #1677ff 0%, #4f46e5 40%, #7c3aed 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "10%",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <AimOutlined style={{ fontSize: 36, color: "#fff" }} />
          </div>

          <Typography.Title
            level={2}
            style={{ color: "#fff", marginBottom: 12, fontWeight: 700 }}
          >
            OBE System
          </Typography.Title>
          <Typography.Text
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 16,
              lineHeight: 1.6,
              display: "block",
              maxWidth: 360,
            }}
          >
            Hệ thống quản lý đào tạo theo chuẩn đầu ra
            <br />
            Outcome-Based Education
          </Typography.Text>

          <div
            style={{
              marginTop: 48,
              display: "flex",
              gap: 24,
              justifyContent: "center",
            }}
          >
            {[
              { value: "PLO", label: "Program Learning Outcomes" },
              { value: "CLO", label: "Course Learning Outcomes" },
              { value: "CO", label: "Course Objectives" },
            ].map((item) => (
              <div
                key={item.value}
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  textAlign: "center",
                  minWidth: 100,
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 18,
                    marginBottom: 4,
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 11,
                    lineHeight: 1.3,
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          background: "#fafafa",
        }}
      >
        {children}
      </div>
    </div>
  );
}
